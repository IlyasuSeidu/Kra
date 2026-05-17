# Backend Architecture

## Backend Responsibilities
- Authorize commands from clients.
- Enforce delivery lifecycle rules.
- Persist event history.
- Coordinate payment provider callbacks.
- Produce notification and reporting projections.
- Expose admin and operational APIs.

## Recommended Modules
- `auth`
- `deliveries`
- `handoffs`
- `payments`
- `notifications`
- `issues`
- `reports`
- `admin`

## Recommended Design Rule
Business logic should live in application services, not in route handlers and not in Firebase triggers alone.

## Reliability Concerns
- Status transitions must be idempotent.
- Payment callbacks must be replay-safe.
- Handoff writes must prevent duplicates caused by repeated scans.

## Approved Service Boundaries
- `services/api` is a single Node.js application service in v1.
- `services/ai` is a separate Python service.
- Shared domain types and validators live in `packages/shared`.

## Hosting Choice
- Node API deploys to `Google Cloud Run`.
- Python AI service deploys to `Google Cloud Run`.
- Firestore stores operational data.
- Cloud Storage stores proof assets.
- Cloud Tasks handles async retries for notifications, callbacks, and reconciliation work.

## API Style
- Client-facing modules use REST JSON.
- Internal side effects use append-only events plus task-based async workers.
- No public GraphQL surface in v1.

## Persistence Strategy
- Current materialized state lives on delivery, payment, issue, and user documents.
- Active route pricing lives in `pricing_rules/active`; each admin update is also snapshotted as `pricing_rules/{pricingRuleId}`.
- Immutable detail lives in:
  - `handoff_events`
  - `delivery_events`
  - `payment_events`
  - `audit_events`

## Pricing Configuration Service
- Delivery booking loads the active pricing rule from Firestore before calculating a quote.
- Pricing changes are admin-mediated through `POST /v1/admin/pricing-rules/active` and require the `manage_pricing_rules` capability.
- The route table validator requires every one-way launch corridor exactly once, preventing partial or ambiguous production pricing.
- Existing delivery quotes remain immutable because the final `GHS` amount is persisted at booking time.
- The shared default launch pricing table is only a first-deploy fallback when no active database rule exists.

## Failure And Retry Policy
- state-changing commands are idempotent through `Idempotency-Key`
- webhook processing retries: immediate, `1m`, `5m`, `30m`, `2h`
- notification tasks retry up to `3` times before human review
- payment reconciliation verifies unresolved MTN MoMo charges at the `5m`, `15m`, and `30m` checkpoints before finance review
- unrecoverable async failures move into dead-letter review queues

## Outbound Notification Outbox
- Customer-facing SMS is persisted in `outbound_notifications` before provider dispatch.
- Outbox records carry `status`, `attemptCount`, `nextAttemptAt`, provider, channel, dedupe key, delivery ID, recipient phone, and last error metadata.
- Receiver SMS uses a stricter v1 policy than generic notification tasks: first attempt plus one retry after `30 minutes`, then `dead_letter`.
- Delivery lifecycle writes remain authoritative even when the SMS provider is degraded; operations recover from the outbox instead of losing the event.
- Due outbox records are processed by the secured internal task endpoint `POST /v1/internal/outbound-notifications/dispatch-due` using `X-Kra-Internal-Task-Secret`.

## Payment Reconciliation Worker
- Pending MTN MoMo charges carry `nextReconciliationAt` and `reconciliationAttemptCount` on the payment document.
- Cloud Scheduler or Cloud Tasks calls `POST /v1/internal/payments/reconcile-due` with `X-Kra-Internal-Task-Secret`.
- The worker reuses the provider verification adapter, finalizes confirmed or failed payments, and updates delivery payment entitlement in the same service flow.
- Still-pending provider results are rescheduled for the approved `15m` or `30m` checkpoints.
- Payments still unresolved after the `30m` checkpoint are marked with `reconciliationReviewRequiredAt` and exposed through `GET /v1/admin/payment-reconciliation`.
- Finance admins receive fixed-column reconciliation rows and CSV text from the backend without relying on frontend-only export logic.

## Proof Asset Storage
- Signature and delivery-photo fallback proof must start with a backend-created proof upload intent.
- The API signs short-lived `PUT` upload URLs for Cloud Storage and persists `proof_assets/{proofAssetId}` metadata before upload.
- Direct Firebase Storage client SDK access is denied by default storage rules; app clients use backend-issued signed URLs.
- Upload confirmation records byte size, SHA-256 hash, and storage generation before the asset can be used as final proof.
- `/v1/deliveries/:id/complete` accepts fallback proof only when `proofReference` is an uploaded `PFA-*` asset for the same delivery and proof type.
- Raw proof URLs are not exposed in delivery summaries, timelines, or public tracking responses.

## Launch Readiness Gate
- `GET /v1/admin/launch-readiness` is the backend source of truth for pilot go-live gating.
- The gate aggregates station validation, station operating status, active queue counts, unresolved `P1` issues, payment reconciliation review backlog, and receiver SMS dead-letter backlog.
- Launch remains blocked when any station is not go-live eligible, paused, restricted, missing launch services, or has unresolved `P1` issues.
- Launch also remains blocked when pending payment reconciliation review or receiver SMS dead-letter records exist.
- Frontend dashboards may render this output, but they must not invent separate launch-readiness rules.

## Baseline Status
This file is now concrete enough to guide backend scaffolding and async workflow design.

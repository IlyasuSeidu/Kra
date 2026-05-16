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
- Immutable detail lives in:
  - `handoff_events`
  - `delivery_events`
  - `payment_events`
  - `audit_events`

## Failure And Retry Policy
- state-changing commands are idempotent through `Idempotency-Key`
- webhook processing retries: immediate, `1m`, `5m`, `30m`, `2h`
- notification tasks retry up to `3` times before human review
- unrecoverable async failures move into dead-letter review queues

## Outbound Notification Outbox
- Customer-facing SMS is persisted in `outbound_notifications` before provider dispatch.
- Outbox records carry `status`, `attemptCount`, `nextAttemptAt`, provider, channel, dedupe key, delivery ID, recipient phone, and last error metadata.
- Receiver SMS uses a stricter v1 policy than generic notification tasks: first attempt plus one retry after `30 minutes`, then `dead_letter`.
- Delivery lifecycle writes remain authoritative even when the SMS provider is degraded; operations recover from the outbox instead of losing the event.

## Baseline Status
This file is now concrete enough to guide backend scaffolding and async workflow design.

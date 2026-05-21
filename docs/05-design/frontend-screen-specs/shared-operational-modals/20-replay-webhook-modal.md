# Replay Webhook Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `ReplayWebhookModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screen | `AdminWebhookEventDetail` |
| Secondary host screens | `AdminWebhookEvents`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminFinanceSummary`, `AdminLaunchReadiness` |
| Test id root | `modal-replay-webhook` |
| Backend coverage | `admin_webhook_events`; `ingest_mtn_momo_webhook` as inbound server reference only |
| Read operation | `admin_webhook_events` |
| Browser mutation operation | None in current backend |
| Inbound provider operation | `ingest_mtn_momo_webhook` |
| Read endpoint | `GET /v1/admin/webhook-events` |
| Inbound webhook endpoint | `POST /v1/webhooks/payments/mtn-momo` |
| Required read roles | `finance_admin` or `super_admin` with `review_reconciliation` capability |
| Required replay role | None available in current backend |
| Offline critical | No |
| Data sensitivity | Payment provider reference, payment ID, delivery ID, amount, finance review note |
| Required modal states | `closed`, `opening`, `replay_unavailable`, `review_required`, `limited_context`, `not_authorized`, `session_expired`, `api_error` |
| Future-only states | `preflight_required`, `submitting`, `succeeded`, `rejected`, `conflict`, `rate_limited` |
| Related specs | `AdminWebhookEvents`, `AdminWebhookEventDetail`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminAuditEvents`, `AuditSensitiveActionAckModal`, `ConfirmDestructiveActionModal` |

## Purpose
`ReplayWebhookModal` is the controlled explanation and governance modal for trusted inbound payment webhook records that may need backend replay or reprocessing.

In the current backend, admins can inspect trusted MTN MoMo webhook records through `GET /v1/admin/webhook-events`, but they cannot replay a webhook from the browser.

The modal must answer:
- `Which webhook event is being considered?`
- `Why does this event look like a replay candidate?`
- `What backend status was recorded?`
- `Which payment and delivery records were matched?`
- `Can an admin trigger replay from the current frontend?`
- `Which route should finance or engineering take instead?`
- `What backend contract must exist before this modal becomes an action form?`

The most important answer is:
```text
Webhook replay is not available in the current frontend/backend contract.
```

This modal exists to stop accidental browser implementation of a high-risk replay button.

## Product Job
Finance and platform operators need a safe way to reason about webhook replay without corrupting payment state. When a callback is unmatched, duplicated, still received, accepted pending, or sent to manual review, the admin should understand whether the event needs finance review, delivery review, or backend engineering action.

The modal should:
- Show the trusted normalized webhook record.
- Explain the current replay boundary.
- Route the admin to reconciliation or delivery review.
- Protect provider references and payment data.
- Prevent direct browser calls to provider webhook endpoints.
- Define the exact future conditions for an enabled replay flow.

It should not make replay look supported when the backend does not expose a replay route.

## Strategic Role
Payment webhook replay is a Tier 0 control. A replay can confirm payment, fail payment, move a record into manual review, or leave a delivery blocked. If the UI sends unsafe replay requests, Kra can create duplicate finance effects, inconsistent dispatch eligibility, customer disputes, or audit gaps.

The modal should feel like a payment-control checkpoint:
- precise
- conservative
- audit-aware
- status-led
- route-focused
- clear about unavailable actions

It must not feel like a generic confirm dialog.

## Primary Users
Primary users:
- `finance_admin` reviewing unmatched or manual-review callbacks.
- `super_admin` reviewing launch blockers and payment integrity incidents.

Secondary users:
- Backend engineers investigating ingestion or processing behavior.
- QA reviewers validating webhook state handling.
- Support leads explaining payment delays.
- Operations leads checking whether dispatch is blocked by payment signal issues.
- Claude Code implementing frontend surfaces later.

Non-users:
- sender
- receiver
- station operator
- driver
- final-mile courier
- public visitor
- unauthenticated provider caller

## User Goals
Admins use the modal to:
- Confirm the event identity before escalating.
- Understand why replay may be needed.
- Understand why replay is currently unavailable.
- Open reconciliation review.
- Open delivery detail when a delivery is matched.
- Copy safe identifiers for an engineering escalation.
- Avoid exposing raw provider payloads.
- Avoid creating duplicate payment side effects.

They should never leave the modal believing a webhook was replayed.

## Non-Goals
Do not build these into the current modal:
- Enabled replay submit.
- Browser call to `POST /v1/webhooks/payments/mtn-momo`.
- Browser call to any internal task endpoint.
- Raw provider payload editor.
- Provider reference editor.
- Payment status override.
- Delivery dispatch override.
- Refund action.
- Provider credential display.
- Webhook signature display.
- Header display.
- Raw request body display.
- JSON payload download.
- Bulk replay.
- Retry all.
- Replay by provider reference only.
- Replay by payment ID only.
- Replay without event ID.
- Replay with edited amount.
- Replay with edited event type.
- Replay with edited occurred time.

If any of these are required, backend contracts, audit policy, and role controls must be added first.

## Hard Backend Reality
Browser-safe read endpoint:
```http
GET /v1/admin/webhook-events
```

Browser-safe operation:
```text
admin_webhook_events
```

Supported query:
```ts
{
  processingStatus?: "received" | "processed" | "duplicate" | "unmatched" | "accepted_pending" | "manual_review";
  limit?: number;
}
```

Limit:
- positive integer
- maximum `100`
- default `50`

Response record:
```ts
{
  eventId: string;
  provider: "mtn_momo";
  providerEventId?: string;
  providerReference: string;
  eventType: "payment.pending" | "payment.confirmed" | "payment.failed";
  amountGhs: number;
  currency: "GHS";
  occurredAt: string;
  receivedAt: string;
  processingStatus: "received" | "processed" | "duplicate" | "unmatched" | "accepted_pending" | "manual_review";
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
  processingNotes?: string;
}
```

Current backend does not expose:
- `GET /v1/admin/webhook-events/:eventId`
- `POST /v1/admin/webhook-events/:eventId/replay`
- `POST /v1/admin/webhook-events/:eventId/reprocess`
- `POST /v1/internal/webhook-events/replay`
- replay preflight endpoint
- replay result endpoint
- replay audit trail endpoint
- raw payload read endpoint
- browser-safe retry queue endpoint

Inbound provider endpoint:
```http
POST /v1/webhooks/payments/mtn-momo
```

Inbound operation:
```text
ingest_mtn_momo_webhook
```

Inbound endpoint rules:
- auth scope is `webhook`
- request requires provider webhook verification
- browser users must not call it
- route is idempotent on provider reference plus event type
- duplicate verified events are acknowledged without repeating state mutation
- unmatched verified events are persisted and acknowledged
- amount conflicts enter manual review
- final payment state conflicts enter manual review

Therefore:
- The modal reads only stored trusted event rows.
- The modal does not replay anything today.
- The modal must render replay as unavailable.
- The modal must route to existing review screens.

## Source References
External references used for this modal:
- [MTN MoMo Callback documentation](https://momoapi.mtn.com/api-documentation/callback/): supports asynchronous mobile-money callback handling for payment operations.
- [MTN MoMo callback setup details](https://momoapi.mtn.com/content/html_widgets/a8e43.html): supports callback URL setup, HTTPS expectations, and fallback thinking for missing callback cases.
- [Stripe webhook delivery behavior](https://docs.stripe.com/webhooks?lang=node): supports webhook retry, manual resend, event ordering, and immutable event-shape principles.
- [Stripe process undelivered webhook events](https://docs.stripe.com/webhooks/process-undelivered-events?locale=en-GB): supports replay-safe processing, processed-event checks, and duplicate prevention during manual handling.
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus trapping, modal labeling, and safe keyboard behavior.
- [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/): supports clear warning treatment for irreversible or high-impact admin decisions.
- [GOV.UK summary list](https://design-system.service.gov.uk/components/summary-list/): supports compact key-value evidence presentation.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports non-disruptive announcements for unavailable, copied, and error states.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports safe operational event handling and sensitive data redaction.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/36-admin-webhook-events.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/37-admin-webhook-event-detail.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/07-api/error-codes.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/14-platform/observability-and-alerting.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payment-webhooks.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Design Thesis
Design this as a finance safety interlock. The modal should not ask `Are you sure?` as if replay were a normal button. It should say `Replay unavailable` first, then show the exact event evidence and the safe route.

Visual direction:
- white or warm-gray command surface
- high-contrast warning header
- compact evidence grid
- clear unavailable action block
- identifier chips in monospace
- finance status badges
- route cards instead of mutation buttons
- tight vertical rhythm
- no decorative imagery
- no raw JSON drawer

Tone:
- direct
- factual
- calm
- no blame
- no promise that engineering has already replayed the event

## Product Principle
Webhook replay must be harder than review. Review can be fast; replay must be gated.

Priority order:
1. Preserve payment correctness.
2. Preserve audit clarity.
3. Prevent duplicate processing.
4. Route the admin to supported review screens.
5. Record future replay requirements without exposing current unsupported action.

## Modal Entry Points
Primary entry:
- `AdminWebhookEventDetail` replay-unavailable notice action: `Why replay is unavailable`.

Secondary entries:
- `AdminPaymentReconciliationDetail` route for a payment mismatch with webhook risk.
- `AdminWebhookEvents` row action only if the row already exposes a replay-unavailable education action.
- `AdminFinanceSummary` webhook risk card when linked to a specific event.
- `AdminLaunchReadiness` payment webhook blocker when linked to a specific event.

Do not open from:
- public web pages
- sender mobile screens
- receiver tracking screens
- station operator screens
- driver screens
- courier screens
- generic settings
- export report flow

## Open Conditions
The modal may open only when at least one trusted event row is available from:
- selected row navigation state
- admin webhook event detail state
- cached `admin_webhook_events` query rows
- best-effort `GET /v1/admin/webhook-events?limit=100` lookup

Minimum event context:
```ts
{
  eventId: string;
  provider: "mtn_momo";
  providerReference: string;
  eventType: "payment.pending" | "payment.confirmed" | "payment.failed";
  amountGhs: number;
  currency: "GHS";
  occurredAt: string;
  receivedAt: string;
  processingStatus: "received" | "processed" | "duplicate" | "unmatched" | "accepted_pending" | "manual_review";
}
```

Preferred event context:
```ts
{
  providerEventId?: string;
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
  processingNotes?: string;
}
```

If minimum event context is missing, show `limited_context` and route back to `/admin/webhook-events`.

## State Model
Current states:
- `closed`: modal not mounted or not visible.
- `opening`: host is resolving row context.
- `replay_unavailable`: event context loaded, no replay operation exists.
- `review_required`: event needs finance or engineering review based on status.
- `limited_context`: event ID exists but enough row fields are missing.
- `not_authorized`: admin lacks `review_reconciliation`.
- `session_expired`: auth token expired.
- `api_error`: read lookup failed.

Future-only states:
- `preflight_required`: secured backend exists and returns replay impact before submit.
- `submitting`: user confirmed future replay and request is in flight.
- `succeeded`: future replay completed and returned audited result.
- `rejected`: backend refused replay because event is not eligible.
- `conflict`: backend detected changed payment or delivery state.
- `rate_limited`: backend replay guard blocked repeated request.

Claude Code must not implement future-only states as active current actions. They can exist only as disabled design guidance or code comments tied to a feature flag that defaults off.

## Current State Decision Table
| Event status | Modal headline | Primary route | Replay action |
| --- | --- | --- | --- |
| `received` | Webhook received; processing state is not final | Open webhook events | unavailable |
| `processed` | Webhook already processed | Open payment or delivery | unavailable |
| `duplicate` | Duplicate callback was safely ignored | Open original payment context if available | unavailable |
| `unmatched` | Provider reference did not match a payment | Open reconciliation | unavailable |
| `accepted_pending` | Pending signal was accepted | Open payment reconciliation | unavailable |
| `manual_review` | Manual review required | Open reconciliation detail | unavailable |

## Replay Candidate Rules
The modal may say replay may be needed when:
- `processingStatus` is `unmatched`
- `processingStatus` is `manual_review`
- `processingStatus` is `received` and the event is stale by product policy
- `processingStatus` is `accepted_pending` and payment remains unresolved after reconciliation windows

The modal must not say replay is needed when:
- `processingStatus` is `processed`
- `processingStatus` is `duplicate`
- event context is missing
- the admin lacks authorization
- the event has no trusted stored row

The modal must never infer replay from raw provider data because raw payload is not available to the frontend.

## Eligibility Copy
Unavailable headline:
```text
Webhook replay is not available from the admin frontend.
```

Unavailable body:
```text
Kra has stored this trusted MTN MoMo callback, but the current API does not expose a browser-safe replay endpoint. Review the event, open reconciliation, or escalate the event ID to backend engineering.
```

Manual review body:
```text
This callback requires review before any processing can be repeated. Do not change payment or delivery state from this modal.
```

Duplicate body:
```text
The backend detected this callback as a duplicate and avoided a second state mutation. No replay is available for duplicate records.
```

Processed body:
```text
This callback has already been processed. If the payment state still looks wrong, open reconciliation instead of replaying from the frontend.
```

Unmatched body:
```text
The provider reference did not match a Kra payment record. Open reconciliation and use the event ID and provider reference for engineering review.
```

Accepted pending body:
```text
The provider sent a pending payment signal. Continue through reconciliation windows before requesting backend investigation.
```

## Layout
Desktop modal:
- Width: `680px` to `760px`.
- Max height: `min(86vh, 820px)`.
- Header with status icon, title, and close button.
- Warning panel directly under title.
- Evidence grid with event identity and processing result.
- Matched records section.
- Replay boundary section.
- Safe next actions section.
- Footer with disabled replay explanation and close action.

Mobile modal:
- Full-screen sheet.
- Sticky header.
- Stacked evidence cards.
- Sticky bottom action bar.
- Close action always reachable.
- No horizontal scroll.

Density:
- The modal is finance-dense, but not cramped.
- Evidence labels should be short.
- Values can wrap but identifiers should preserve readability.

## Header
Header contents:
- Status badge.
- Title.
- One-line explanation.
- Close button.

Title options:
- `Webhook replay unavailable`
- `Replay requires backend tooling`
- `Review webhook before escalation`

Recommended title:
```text
Webhook replay unavailable
```

Header subtitle:
```text
Use this record for review and escalation. The current admin API does not support replay.
```

Close button:
- accessible name `Close replay webhook modal`
- positioned top right
- keyboard reachable
- returns focus to the trigger

## Evidence Grid
Always show:
- Event ID
- Provider
- Event type
- Processing status
- Amount
- Provider reference
- Provider occurred time
- Kra received time

Show when present:
- Provider event ID
- Matched payment ID
- Matched delivery ID
- Processing note

Never show:
- raw payload
- signature
- secret
- request headers
- full receiver phone
- customer name
- Firebase token
- internal task secret
- provider access token

Evidence labels:
- `Event ID`
- `Provider`
- `Provider event`
- `Reference`
- `Event type`
- `Amount`
- `Occurred`
- `Received`
- `Status`
- `Payment`
- `Delivery`
- `Review note`

## Status Badges
Badge mapping:
- `received`: neutral blue, label `Received`
- `processed`: green, label `Processed`
- `duplicate`: gray, label `Duplicate ignored`
- `unmatched`: amber, label `Unmatched`
- `accepted_pending`: blue, label `Pending accepted`
- `manual_review`: red or strong amber, label `Manual review`

Badge rules:
- Status must be text plus color.
- Do not rely on color alone.
- Badge must have accessible name.
- Manual review and unmatched get strongest visual weight.
- Processed and duplicate remain quiet.

## Amount Display
Amount source:
- `amountGhs`
- `currency`

Format:
```text
GHS 55
```

Rules:
- Do not recalculate amount.
- Do not convert currency.
- Do not format as decimal if backend stores integer cedi amount.
- Do not compare to quote unless host supplies separate reconciliation context.

## Processing Notes
Known backend notes:
- `provider_amount_mismatch`
- `conflicting_final_payment_status`

Render known notes as readable text:
- `provider_amount_mismatch` -> `Provider amount does not match Kra payment amount.`
- `conflicting_final_payment_status` -> `Provider event conflicts with an already final payment state.`

Unknown notes:
- show the raw safe note value only if it matches the returned string and contains no secret-like content
- otherwise show `Review note returned by backend`

Do not create new note categories in the frontend.

## Safe Next Actions
Primary route by status:
- `manual_review`: `Open reconciliation`
- `unmatched`: `Open reconciliation`
- `accepted_pending`: `Open payment reconciliation`
- `received`: `Refresh webhook events`
- `processed`: `Open matched delivery` if `matchedDeliveryId` exists
- `duplicate`: `Open webhook events`

Secondary routes:
- `Open webhook event detail`
- `Open payment reconciliation`
- `Open delivery`
- `Copy event ID`
- `Copy provider reference`
- `Close`

Disabled current action:
```text
Replay webhook
```

Disabled action helper:
```text
Disabled until a secured admin replay endpoint exists.
```

Do not show `Replay webhook` as a primary enabled button.

## Button Model
Footer buttons in current backend:
- Primary: context route, for example `Open reconciliation`
- Secondary: `Copy event ID`
- Tertiary: `Close`
- Disabled visible control: `Replay webhook` only if product wants to teach why it is unavailable

Recommended current footer:
```text
[Open reconciliation] [Copy event ID] [Close]
```

If a disabled replay control is rendered:
- it must be disabled
- it must include explanation text
- it must not submit a form
- it must not call any mutation
- it must not emit success toast

## Copy Actions
Allowed copy values:
- `eventId`
- `providerReference`
- `matchedPaymentId`
- `matchedDeliveryId`

Copy feedback:
```text
Event ID copied.
```

Rules:
- Use `aria-live="polite"` for copy confirmation.
- Do not copy raw payload.
- Do not copy provider secrets.
- Do not copy entire event JSON.
- Do not persist copied values in local storage.

## Permissions
Read permission:
- `review_reconciliation`

Roles currently expected to pass:
- `finance_admin`
- `super_admin`

Roles expected to fail:
- `ops_admin`
- `support_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`
- unauthenticated user

Replay permission:
- none exists in current backend

If user lacks read permission:
- show `not_authorized`
- do not show event details
- route to admin overview or permission denied

If user has read permission:
- show event evidence
- show replay unavailable
- show safe routes

## Data Loading
Preferred loading order:
1. Use event row passed from host screen.
2. Use query cache from `admin_webhook_events`.
3. Fetch `GET /v1/admin/webhook-events?limit=100`.
4. Match by `eventId`.
5. If not found, show `limited_context`.

Do not:
- call `GET /v1/admin/webhook-events/:eventId`
- call provider webhook endpoint
- call internal endpoints
- call payment mutation endpoints
- call refund endpoints

Staleness:
- show `generatedAt` if available from list response
- show `Last refreshed` when host has timestamp
- allow `Refresh webhook events` through host query refetch

## Limited Context State
Show when:
- event ID is known but row fields are missing
- event is outside returned `limit=100`
- host passed incomplete context
- read endpoint failed after route param was already known

Copy:
```text
This event is not available in the current returned webhook rows. It may be older than the current admin list limit. Open webhook events and search through the latest returned records.
```

Actions:
- `Open webhook events`
- `Copy event ID`
- `Close`

Do not claim the event does not exist.

## API Error State
Show when the read lookup fails.

Copy:
```text
Webhook event context could not be loaded. No replay was attempted.
```

Actions:
- `Try again`
- `Open webhook events`
- `Close`

Rules:
- Keep the modal open after retry failure.
- Announce error through `aria-live`.
- Do not show replay controls.

## Session Expired State
Show when API returns auth expiration.

Copy:
```text
Your admin session expired before webhook review could load.
```

Actions:
- `Sign in again`
- `Close`

Rules:
- Hide event details if auth state is invalid.
- Do not keep sensitive event context on screen after sign-out.

## Not Authorized State
Show when API returns forbidden.

Copy:
```text
You do not have permission to review payment webhook events.
```

Actions:
- `Open admin overview`
- `Close`

Rules:
- Do not expose event details.
- Do not show provider reference.
- Do not show amount.
- Do not show matched payment ID.

## Accessibility
Dialog role:
- `role="dialog"` for informational unavailable modal
- `aria-modal="true"`
- `aria-labelledby` points to title
- `aria-describedby` points to warning body

If future replay becomes enabled:
- use `role="alertdialog"` only for final destructive or high-risk confirmation
- require explicit typed acknowledgement or `AuditSensitiveActionAckModal`

Keyboard behavior:
- `Escape` closes unless a future submit is in progress
- `Tab` cycles through focusable controls
- initial focus goes to title or first meaningful action
- closing returns focus to trigger

Screen reader requirements:
- status badge includes text
- unavailable state is announced
- copy success uses polite live region
- API errors use assertive live region when blocking

Motion:
- use a short opacity and scale transition
- respect reduced motion
- no shaking or flashing warning animation

## Visual System
Use existing admin design tokens when available.

Suggested tokens:
- background: `--admin-surface-raised`
- panel border: `--admin-border-strong`
- warning background: `--color-warning-surface`
- warning text: `--color-warning-text`
- danger text: `--color-danger-text`
- success text: `--color-success-text`
- identifier text: `--font-mono`

If tokens are missing, Claude Code should add design-system tokens, not hardcode one-off colors in the modal.

Typography:
- Title: strong admin heading.
- Labels: small uppercase or semibold field labels.
- Identifier values: monospace.
- Body: compact, readable, no long paragraphs.

## Responsive Behavior
Desktop:
- centered modal
- evidence grid in two columns
- next actions side by side
- footer fixed at bottom of modal content

Tablet:
- modal width maxes at viewport minus margins
- evidence grid remains two columns if readable

Mobile:
- full-screen sheet
- evidence grid becomes one column
- action buttons stack
- footer stays sticky
- close button remains visible

## Host Integration Contract
Props:
```ts
type ReplayWebhookModalProps = {
  open: boolean;
  eventId?: string;
  event?: AdminWebhookEventRow;
  generatedAt?: string;
  onClose: () => void;
  onOpenWebhookEvents: (query?: { processingStatus?: string }) => void;
  onOpenReconciliation: (input?: { providerReference?: string; paymentId?: string }) => void;
  onOpenDelivery?: (deliveryId: string) => void;
  onRefreshWebhookEvents?: () => Promise<void>;
};
```

Derived row type:
```ts
type AdminWebhookEventRow = {
  eventId: string;
  provider: "mtn_momo";
  providerEventId?: string;
  providerReference: string;
  eventType: "payment.pending" | "payment.confirmed" | "payment.failed";
  amountGhs: number;
  currency: "GHS";
  occurredAt: string;
  receivedAt: string;
  processingStatus: "received" | "processed" | "duplicate" | "unmatched" | "accepted_pending" | "manual_review";
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
  processingNotes?: string;
};
```

Do not add mutation props until backend support exists.

## Query Strategy
Use existing admin API client hook:
```ts
useAdminWebhookEventsQuery({ limit: 100 })
```

If the host already loaded a row:
- do not refetch immediately unless stale or explicitly requested

If only `eventId` is supplied:
- fetch latest rows with `limit=100`
- match locally
- if not found, show `limited_context`

Cache keys:
- include `processingStatus`
- include `limit`
- do not include raw secrets

## Current Implementation Rules
Claude Code must implement the current modal as:
- read-only
- route-focused
- no replay mutation
- no provider endpoint call
- no internal endpoint call
- no raw payload rendering
- no payment status mutation
- no delivery status mutation
- no refund mutation

If a designer asks for a replay button before backend exists:
- keep the button disabled
- show the unavailable explanation
- link to backend requirement text in this file

## Future Backend Gate
Only enable replay if all future requirements are implemented:
- route exists in `services/api/src/routes.ts`
- route is admin-scoped, not webhook-scoped
- route requires a specific replay capability
- route is audited
- route is idempotent
- route accepts event ID only, not editable payload fields
- route returns a preflight impact summary before mutation
- route refuses processed duplicate repeats unless backend says safe
- route refuses stale payment state conflicts
- route rate-limits repeated replay attempts
- route records actor ID, actor role, reason, timestamp, old status, new status, and result
- route emits safe audit event
- frontend contract is added to `packages/shared/src/contracts/api.ts`
- tests cover duplicate prevention and conflict handling

Candidate future endpoint shape:
```http
POST /v1/admin/webhook-events/:eventId/replay
```

Candidate future request:
```ts
{
  reason: string;
  acknowledgedRisk: true;
  idempotencyKey: string;
}
```

Candidate future response:
```ts
{
  eventId: string;
  replayId: string;
  result: "processed" | "duplicate" | "manual_review" | "rejected";
  previousProcessingStatus: string;
  newProcessingStatus: string;
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
  auditEventId: string;
}
```

This future shape is not current backend authority. It is a requirement checklist for later implementation.

## Future Replay Confirmation
If future replay exists, the modal must add a second confirmation step:
- show preflight result
- show current payment state
- show current delivery payment status
- show matched records
- require a reason
- require explicit acknowledgement
- call `AuditSensitiveActionAckModal`
- use idempotency key
- show exact result

Future confirmation copy:
```text
Replay can create or confirm payment-side effects. Continue only if the stored event is trusted and reconciliation review requires backend reprocessing.
```

Future reason minimum:
- 10 characters

Future reason maximum:
- 240 characters

Future reason restrictions:
- no provider secrets
- no receiver phone
- no raw payload
- no full payment card data
- no Firebase tokens

## Audit Expectations
Current modal:
- no mutation audit event
- optional frontend analytics only

Future replay:
- must create backend audit event
- must include actor
- must include event ID
- must include reason
- must include result
- must include matched payment and delivery IDs when present
- must not include raw payload
- must not include signature
- must not include provider secret

Audit target type:
```text
webhook_event
```

Audit action:
```text
webhook_replay_requested
```

Do not emit audit-like UI copy if the backend did not record an audit event.

## Analytics
Allowed current events:
- `replay_webhook_modal_opened`
- `replay_webhook_unavailable_seen`
- `replay_webhook_copy_event_id`
- `replay_webhook_copy_provider_reference`
- `replay_webhook_open_reconciliation`
- `replay_webhook_open_delivery`
- `replay_webhook_refresh`
- `replay_webhook_closed`

Properties:
- `processingStatus`
- `eventType`
- `hasMatchedPayment`
- `hasMatchedDelivery`
- `sourceScreen`
- `role`

Do not log:
- provider reference
- event ID
- payment ID
- delivery ID
- amount
- raw payload
- signature

## Security And Privacy
Rules:
- Treat provider reference as sensitive operational data.
- Show provider reference only to authorized roles.
- Do not show raw provider payload.
- Do not show secrets.
- Do not show request headers.
- Do not persist event rows in local storage.
- Do not include event rows in URL query params.
- Do not expose event evidence in client logs.
- Redact identifiers from analytics.
- Clear modal state after close if session changes.

Copy safe identifiers one at a time only.

## Error Mapping
| Error | Modal state | Copy | Recovery |
| --- | --- | --- | --- |
| `UNAUTHORIZED` | `session_expired` | Admin session expired. | Sign in again |
| `FORBIDDEN` | `not_authorized` | You cannot review webhook events. | Open admin overview |
| `NOT_FOUND` | `limited_context` | Event is not in current returned rows. | Open webhook events |
| `PROVIDER_TIMEOUT` | `api_error` | Webhook context could not load. | Try again |
| `VALIDATION_ERROR` | `api_error` | Request could not be completed. | Refresh |
| network failure | `api_error` | Network failed before context loaded. | Try again |

Do not use payment mutation errors because no payment mutation is called.

## Empty And Missing Data Rules
Missing `providerEventId`:
- render `Not supplied by provider`

Missing `matchedPaymentId`:
- render `No matched payment`

Missing `matchedDeliveryId`:
- render `No matched delivery`

Missing `processingNotes`:
- render `No review note`

Missing event row:
- render `limited_context`

Never fill missing data with invented values.

## Content Structure
Recommended modal content:
```text
Webhook replay unavailable
Kra stored this trusted MTN MoMo callback, but the current admin API does not expose a browser-safe replay endpoint.

Event
Event ID: EVT-WEB-4010
Provider: MTN MoMo
Event type: payment.failed
Status: Manual review

Payment impact
Amount: GHS 55
Payment: PAY-4010
Delivery: DEL-4010
Review note: Provider event conflicts with an already final payment state.

What you can do now
Open reconciliation, open the delivery, or copy the event ID for backend escalation.
```

## Microcopy Rules
Use:
- `replay unavailable`
- `stored trusted callback`
- `manual review`
- `open reconciliation`
- `backend engineering`
- `browser-safe endpoint`

Avoid:
- `retry payment`
- `force webhook`
- `fix automatically`
- `run callback`
- `resend to provider`
- `override payment`
- `payload replayed`
- `successfully replayed`

The modal must be honest about current capability.

## Interaction Flow
Current flow:
1. User opens modal from webhook detail or finance context.
2. Modal resolves event row.
3. Modal shows unavailable replay notice.
4. User reviews event evidence.
5. User copies event ID or opens reconciliation.
6. User closes modal.

No submit step exists.

No background replay happens.

## Future Interaction Flow
Future flow only after backend exists:
1. User opens modal.
2. Modal loads event and preflight.
3. Modal shows risk summary.
4. User enters reason.
5. User acknowledges audit-sensitive action.
6. Modal submits replay request with idempotency key.
7. Backend returns audited result.
8. Modal shows exact result and routes to updated record.

Do not implement this flow now.

## Host Screen Requirements
`AdminWebhookEventDetail` must:
- show replay-unavailable notice for replay candidate statuses
- open this modal only as education and escalation guidance
- pass the current event row
- keep detail page read-only

`AdminWebhookEvents` must:
- avoid enabling row-level replay
- allow opening detail first
- use this modal only if product wants direct unavailable explanation

`AdminPaymentReconciliationDetail` must:
- route to webhook detail or this modal with event context
- keep reconciliation decision separate

`AdminLaunchReadiness` must:
- route webhook blockers to webhook events or detail
- not expose replay as launch unblock action

## Testing Requirements
Unit tests:
- renders unavailable state for every processing status
- maps known processing notes to readable copy
- hides raw payload area entirely
- disables or omits replay action
- copies event ID
- copies provider reference only when authorized
- routes manual review to reconciliation
- routes matched delivery to delivery detail
- returns focus on close
- traps focus while open
- announces copy success
- handles missing provider event ID
- handles missing matched records
- handles limited context
- handles not authorized
- handles session expired
- handles API error

Integration tests:
- opens from `AdminWebhookEventDetail`
- uses passed row without unsupported detail endpoint
- best-effort lookup uses `GET /v1/admin/webhook-events?limit=100`
- does not call `POST /v1/webhooks/payments/mtn-momo`
- does not call internal endpoints
- does not call payment mutation endpoints
- does not call refund endpoints
- closes and restores focus

Accessibility tests:
- has accessible dialog name
- `Escape` closes
- tab order is contained
- reduced motion honored
- status is not color-only
- live region announces error and copy states

Security tests:
- raw payload is absent
- signatures are absent
- provider secrets are absent
- analytics excludes identifiers
- unauthorized state hides event details

## E2E Scenarios
Required scenarios:
- `e2e-admin-webhook-replay-unavailable-manual-review`: manual-review event opens modal, shows unavailable replay, opens reconciliation.
- `e2e-admin-webhook-replay-unavailable-unmatched`: unmatched event opens modal, shows provider reference, copies event ID.
- `e2e-admin-webhook-replay-unavailable-processed`: processed event shows no replay need and routes to delivery when matched.
- `e2e-admin-webhook-replay-unavailable-duplicate`: duplicate event explains duplicate handling and no mutation.
- `e2e-admin-webhook-replay-limited-context`: event missing from returned rows shows limited context.
- `e2e-admin-webhook-replay-forbidden`: unauthorized admin sees no sensitive event data.
- `e2e-admin-webhook-replay-no-provider-post`: browser never calls inbound webhook endpoint.

## Done Criteria
The modal is complete when:
1. It opens from supported admin contexts with a trusted event row.
2. It renders all returned webhook fields safely.
3. It clearly states that replay is unavailable.
4. It never calls provider webhook endpoints.
5. It never calls internal endpoints.
6. It never mutates payment or delivery state.
7. It routes manual review and unmatched events to reconciliation.
8. It routes matched delivery events to delivery detail when available.
9. It supports copy actions for safe identifiers.
10. It hides raw payloads, signatures, headers, and secrets.
11. It handles limited context without claiming the event does not exist.
12. It passes keyboard, focus, and screen reader checks.
13. It defines the future backend gate without enabling it.
14. It has unit, integration, accessibility, and E2E coverage.

## Open Backend Requirements Before Enabling Replay
Backend must add:
- admin replay route
- replay capability
- contract schemas
- preflight behavior
- idempotency key support
- duplicate guard
- payment state conflict guard
- replay audit event
- rate limit
- replay result response
- tests for processed, duplicate, unmatched, manual review, and conflict states

Frontend must wait for those contracts before enabling any replay mutation.

## Claude Code Build Instruction
Build `ReplayWebhookModal` as a read-only, evidence-rich, route-focused admin modal. It must explain that webhook replay is unavailable in the current backend, show the trusted normalized MTN MoMo event fields, route finance admins to reconciliation or matched delivery review, allow safe identifier copy, and block every browser replay path until a secured audited admin replay endpoint exists.

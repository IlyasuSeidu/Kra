# Admin Webhook Events Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminWebhookEvents` |
| Route | `/admin/webhook-events` |
| Test id | `screen-admin-webhook-events` |
| Surface | Admin web console |
| Backend coverage | `admin_webhook_events`; observes `ingest_mtn_momo_webhook` results |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` with `review_reconciliation` capability |
| Required action role | None on this screen |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `failed`, `refreshing`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminLaunchReadiness` |
| Related screens | `AdminWebhookEventDetail`, `ReplayWebhookModal`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminFinanceSummary`, `AdminDeliveryDetail`, `AdminAuditEvents`, `AdminIssueQueue`, `AdminSlaBreachDashboard` |

## Purpose
`AdminWebhookEvents` is the finance and platform observability surface for inbound provider payment callbacks. It lets authorized admins monitor verified MTN MoMo webhook records, detect unmatched payment references, find duplicate callbacks, isolate amount or state conflicts, and route finance or engineering review to the right downstream screen.

The screen should answer:
- `Are provider callbacks being received?`
- `Which callbacks are stuck in manual review?`
- `Which callbacks cannot be matched to a Kra payment?`
- `Which callbacks were duplicates and therefore safely ignored?`
- `Which provider references changed a payment or delivery record?`
- `Which callback type is driving current reconciliation risk?`
- `How stale is the latest webhook view?`
- `Does this record require finance, operations, or engineering attention?`
- `Which payment, delivery, or detail screen should the admin open next?`

This screen is a read-only monitoring and triage surface. It must not replay a webhook directly, edit provider payloads, call the inbound webhook endpoint, expose secrets, mutate payment status, or render raw provider payload values in the list.

## Strategic Role
Webhook observability is a Tier 0 trust function for a delivery network that depends on mobile money. If the provider callback is missed, delayed, duplicated, or conflicts with Kra's payment record, the platform can block dispatch incorrectly, release a package without confirmed payment, or force finance into manual follow-up.

The list must behave like a payment operations radar. It should surface only the signals needed for fast triage:
- receipt status
- processing status
- provider reference
- event type
- amount
- matched Kra records
- exception note
- event timing
- next review route

The UI should avoid provider-console sprawl. Finance needs a clear queue, not a raw event dump.

## Audience
Primary users:
- finance admins clearing reconciliation blockers
- super admins checking launch readiness and payment integrity
- platform operators checking callback health during incidents

Secondary users:
- backend engineers investigating webhook ingestion behavior
- QA reviewers validating callback states
- support leads checking whether a customer payment is delayed by provider signal gaps

Non-users:
- senders
- receivers
- drivers
- station operators
- final-mile couriers
- public web visitors
- unauthenticated provider systems

## Backend Reality
Primary endpoint:
```http
GET /v1/admin/webhook-events
```

Operation:
```text
admin_webhook_events
```

Supported query parameters:
- `processingStatus`
- `limit`

Supported processing statuses:
- `received`
- `processed`
- `duplicate`
- `unmatched`
- `accepted_pending`
- `manual_review`

Supported event types:
- `payment.pending`
- `payment.confirmed`
- `payment.failed`

Provider:
- `mtn_momo`

Currency:
- `GHS`

Limit:
- positive integer
- maximum `100`
- defaults to `50`

Sort:
- newest first by `receivedAt`
- no cursor pagination exists in the current backend

Auth behavior:
- route is admin-scoped
- route requires `review_reconciliation`
- current capability matrix grants this to `finance_admin` and `super_admin`
- other admin roles must be routed to not-authorized state

Response:
```json
{
  "generatedAt": "2026-05-16T08:20:00.000Z",
  "events": [
    {
      "eventId": "EVT-WEB-4010",
      "provider": "mtn_momo",
      "providerEventId": "PROV-EVT-4010",
      "providerReference": "MTN-REF-4010",
      "eventType": "payment.failed",
      "amountGhs": 55,
      "currency": "GHS",
      "occurredAt": "2026-05-16T08:15:00.000Z",
      "receivedAt": "2026-05-16T08:15:03.000Z",
      "processingStatus": "manual_review",
      "matchedPaymentId": "PAY-4010",
      "matchedDeliveryId": "DEL-4010",
      "processingNotes": "conflicting_final_payment_status"
    }
  ]
}
```

Current backend limits:
- No single-event read endpoint exists yet.
- No server-side provider filter exists.
- No server-side event type filter exists.
- No server-side provider reference search exists.
- No server-side payment ID filter exists.
- No server-side delivery ID filter exists.
- No server-side date range filter exists.
- No server-side cursor pagination exists.
- No replay mutation exists.
- No manual status override exists.
- No raw payload read endpoint exists.
- No webhook retry queue endpoint is exposed to frontend.
- No aggregate count object is returned.

Inbound callback endpoint observed by this screen:
```http
POST /v1/webhooks/payments/mtn-momo
```

Inbound callback rules:
- provider callbacks use webhook auth, not Firebase bearer auth
- signature validation happens before the callback is trusted
- invalid signatures return an internal error path and must not appear as trusted event rows
- verified events are persisted before acknowledgement
- repeated callbacks with the same provider reference and event type are handled as duplicates
- unmatched references are stored and acknowledged instead of rejected back to the provider
- amount conflicts and final-state conflicts enter manual review

Therefore:
- The list shows trusted stored records only.
- The list must not display unverified callback attempts as if they were trusted webhook events.
- The list must not let admins create or alter webhook records.
- Replay UX belongs behind explicit future tooling, not this list.

## Source References
External references used for this screen:
- [MTN MoMo Callback documentation](https://momoapi.mtn.com/api-documentation/callback/): supports the provider reality that MTN MoMo payment operations are asynchronous and callbacks communicate final transaction results.
- [MTN MoMo callback setup details](https://momoapi.mtn.com/content/html_widgets/a8e43.html): supports callback host registration, callback URL behavior, production HTTPS requirements, and the need for fallback status checks when callbacks are not received.
- [Stripe Webhooks documentation](https://docs.stripe.com/webhooks): supports general webhook operating principles for asynchronous payment events, endpoint security, and fast acknowledgement before heavier processing.
- [USWDS Table component](https://designsystem.digital.gov/components/table/): supports table-first layout, captions, structured rows, and scan-friendly operational records.
- [GOV.UK Notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports prominent warning and success messaging for filtered results and operational risk banners.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing filter and refresh results without unexpected focus movement.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports redaction of sensitive operational data and safe audit-oriented event presentation.

Local references:
- `docs/07-api/api-contracts.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/07-api/error-codes.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/14-platform/slo-sla.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/24-admin-payment-reconciliation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/25-admin-payment-reconciliation-detail.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payment-webhooks.ts`

## Design Thesis
Design this as a high-confidence webhook operations ledger: dense, quiet, timestamp-rich, and exception-first. The screen should feel like an elite payments reliability console, with the strongest visual weight on unresolved financial risk rather than decorative charts.

Visual direction:
- light command-center background
- narrow status summary strip
- table-first information density
- high-contrast exception states
- muted processed and duplicate rows
- monospace identifiers
- finance-safe amount display
- precise relative and absolute timestamps
- restrained warning banners
- no raw payload panel on the list

Restraint rule:
- Do not turn the page into a provider diagnostics console. Show only fields returned by `admin_webhook_events` and only actions supported by current routes.

## Product Principle
The screen must protect payment correctness before speed. A provider event that cannot be safely reconciled should be loud, but a processed or duplicate event should stay quiet.

Priority order:
1. Manual-review callbacks.
2. Unmatched provider references.
3. Recently received unprocessed rows.
4. Accepted pending callbacks.
5. Processed callbacks.
6. Duplicate callbacks.

## Information Architecture
Desktop structure:
- Top admin shell and breadcrumb.
- Page header with title, freshness, and refresh action.
- Risk summary strip.
- Filter bar.
- Active filter summary.
- Primary webhook event table.
- Row action rail.
- Empty, filtered-empty, or error panel as needed.
- Footer notes for backend limits and safe handling.

Mobile and narrow tablet structure:
- Header stack.
- Risk summary cards in two-column or single-column flow.
- Filter drawer or stacked select controls.
- Webhook events rendered as accessible record cards.
- Each card keeps event ID, status, provider reference, amount, timing, and primary route visible.
- Secondary details collapse behind disclosure.

## Routing
Primary route:
```text
/admin/webhook-events
```

Supported query state:
- `processingStatus`
- `limit`

Canonical examples:
```text
/admin/webhook-events
/admin/webhook-events?processingStatus=manual_review
/admin/webhook-events?processingStatus=unmatched
/admin/webhook-events?processingStatus=processed&limit=100
```

Deep links from other screens:
- `AdminOverview` manual-review webhook count -> `/admin/webhook-events?processingStatus=manual_review`
- `AdminOverview` unmatched webhook count -> `/admin/webhook-events?processingStatus=unmatched`
- `AdminFinanceSummary` webhook alert -> `/admin/webhook-events?processingStatus=manual_review`
- `AdminPaymentReconciliation` provider-reference context -> `/admin/webhook-events`
- `AdminPaymentReconciliationDetail` webhook context -> `/admin/webhook-events`
- `AdminLaunchReadiness` payment callback blocker -> `/admin/webhook-events?processingStatus=manual_review`

Outbound route targets:
- row `View event` -> `/admin/webhook-events/:eventId` if detail route is enabled
- `Open payment reconciliation` -> `/admin/payment-reconciliation`
- `Open payment detail context` -> `/admin/payment-reconciliation/:paymentId` only if that route exists in the implementation
- `Open delivery` -> `/admin/deliveries/:deliveryId` when `matchedDeliveryId` exists
- `Open audit events` -> `/admin/audit-events`

Until a single-event API is added, the detail route must receive row context from navigation state, query cache, or a list-backed lookup. Direct opening of `/admin/webhook-events/:eventId` may show limited context.

## Data Contract Mapping
| API field | UI label | Treatment |
| --- | --- | --- |
| `generatedAt` | Last refreshed | Header freshness timestamp |
| `events[].eventId` | Event ID | Monospace primary row key |
| `events[].provider` | Provider | Display `MTN MoMo` |
| `events[].providerEventId` | Provider event ID | Optional, collapsed on narrow layouts |
| `events[].providerReference` | Provider reference | Monospace, copyable if policy allows |
| `events[].eventType` | Event type | Status-colored payment event chip |
| `events[].amountGhs` | Amount | Format as `GHS 55.00` |
| `events[].currency` | Currency | Must display only if not implied by amount |
| `events[].occurredAt` | Provider time | Absolute timestamp with relative age |
| `events[].receivedAt` | Received | Primary timing column |
| `events[].processingStatus` | Processing status | Main status chip and row priority driver |
| `events[].matchedPaymentId` | Payment ID | Monospace link if route exists |
| `events[].matchedDeliveryId` | Delivery ID | Monospace link to delivery detail |
| `events[].processingNotes` | Review note | Humanized internal reason |

## Derived Fields
The frontend may derive:
- total rows returned
- count by `processingStatus`
- count by `eventType`
- count missing `matchedPaymentId`
- count missing `matchedDeliveryId`
- latest `receivedAt`
- oldest unresolved event
- provider callback lag as `receivedAt - occurredAt`
- freshness age as `now - generatedAt`
- risk severity from `processingStatus`

The frontend must not derive:
- payment state mutation history not returned by the API
- provider authenticity beyond the fact that the backend stored trusted records
- final payment truth from webhook row alone
- retry eligibility
- replay eligibility
- provider account health

## Status Taxonomy
### `received`
Meaning:
- The event has been durably stored but has not yet reached a final processing state.

UI treatment:
- neutral blue chip
- row stays visible near top when recent
- label `Received`
- helper `Stored and awaiting processing result.`

Operator meaning:
- Watch if it remains recent.
- Escalate only if stale beyond internal processing expectations.

### `processed`
Meaning:
- The callback matched a payment and the backend applied or confirmed the expected payment state.

UI treatment:
- quiet green chip
- row weight low
- label `Processed`
- helper `Matched and processed.`

Operator meaning:
- No action required.
- Available for audit trail and timeline checks.

### `duplicate`
Meaning:
- The callback repeated an already seen provider reference and event type.

UI treatment:
- muted gray chip
- row weight low
- label `Duplicate`
- helper `Repeat callback ignored safely.`

Operator meaning:
- No finance action required unless duplicates spike.

### `unmatched`
Meaning:
- The callback was verified but did not match a known payment reference.

UI treatment:
- amber chip
- row weight high
- label `Unmatched`
- helper `Verified provider reference did not match a Kra payment.`

Operator meaning:
- Finance must compare provider reference against payment reconciliation records.
- Engineering may investigate callback mapping or provider reference creation.

### `accepted_pending`
Meaning:
- The callback indicates pending payment state and matched an existing payment.

UI treatment:
- blue-gray chip
- row weight medium
- label `Pending accepted`
- helper `Provider still reports pending payment.`

Operator meaning:
- Watch for follow-up confirmed or failed callback.
- Do not dispatch as paid on this event alone.

### `manual_review`
Meaning:
- The callback matched a Kra payment but conflicts with amount or final payment state.

UI treatment:
- strong red chip
- row weight highest
- label `Manual review`
- helper from `processingNotes`.

Operator meaning:
- Finance review is required.
- Delivery and payment records must be inspected before customer-facing decisions.

## Event Type Taxonomy
### `payment.pending`
Display:
- `Payment pending`

Meaning:
- Provider has not finished payment confirmation.

UI tone:
- neutral

Primary concern:
- delayed payment finality

### `payment.confirmed`
Display:
- `Payment confirmed`

Meaning:
- Provider reports successful payment.

UI tone:
- positive when processed
- warning if unmatched or manual review

Primary concern:
- dispatch gate safety

### `payment.failed`
Display:
- `Payment failed`

Meaning:
- Provider reports failed payment.

UI tone:
- negative

Primary concern:
- avoid dispatch or settlement assumptions

## Review Reason Mapping
`processingNotes` should be humanized without losing the internal code.

| Note | Admin copy | Severity |
| --- | --- | --- |
| `provider_amount_mismatch` | Provider amount does not match Kra payment amount. | Critical |
| `conflicting_final_payment_status` | Provider event conflicts with an already final payment state. | Critical |
| missing | No processing note returned. | Contextual |

If the note is unknown:
- Show the raw short code exactly as returned.
- Prefix with `Review note:`.
- Do not infer a cause.
- Route to detail or audit context.

## Risk Classification
Critical:
- `manual_review`
- `unmatched` with event type `payment.confirmed`
- stale `received` row older than the internal processing window

Warning:
- `unmatched` with event type `payment.pending`
- `accepted_pending` older than payment confirmation expectation
- high duplicate volume within returned rows

Normal:
- `processed`
- `duplicate`
- recent `received`

Risk summary cards:
- `Manual review`
- `Unmatched`
- `Received`
- `Duplicates`
- `Latest callback`
- `Oldest unresolved`

The summary strip uses returned rows only. It must not claim global totals because the endpoint returns a bounded list.

## Header
Desktop header content:
- Breadcrumb: `Admin / Finance / Webhook events`
- Eyebrow: `Payment provider callbacks`
- Title: `Webhook events`
- Subtitle: `Monitor verified MTN MoMo payment callbacks and route unresolved events to reconciliation.`
- Last refreshed: formatted from `generatedAt`
- Refresh button
- Secondary link: `Payment reconciliation`

Header rules:
- The title remains stable across filters.
- The active filter appears below the header, not inside the title.
- Refresh must not clear filters.
- Refresh must announce result count changes.

Header warning banner:
- Show when `manual_review` count in returned rows is greater than `0`.
- Copy: `Manual review required for provider callbacks. Review payment and delivery records before changing customer or dispatch decisions.`
- CTA: `Open reconciliation`

## Filter Bar
Controls:
- Processing status select
- Limit select
- Text filter on returned rows
- Event type client filter
- Clear filters button
- Refresh button

Server-backed filters:
- `processingStatus`
- `limit`

Client-side filters:
- provider reference
- event ID
- provider event ID
- payment ID
- delivery ID
- event type
- review note

Filter rules:
- Server filters update the URL.
- Client filters do not call unsupported API parameters.
- Changing server filters resets client text filter only if the current value returns zero rows and the user chooses `Clear local filter`.
- Limit options are `25`, `50`, and `100`.
- Default limit is `50`.
- Processing status default is all statuses.

Processing status labels:
- `All statuses`
- `Received`
- `Processed`
- `Duplicate`
- `Unmatched`
- `Pending accepted`
- `Manual review`

Event type labels:
- `All event types`
- `Payment pending`
- `Payment confirmed`
- `Payment failed`

## Active Filter Summary
Show a compact line above the table:
- `Showing 50 most recent webhook events`
- `Filtered to manual review`
- `Local search: MTN-REF-4010`
- `3 events shown after local filters`

Rules:
- Include the word `returned` when explaining endpoint limits: `50 returned by the API`.
- Do not say `all events` unless limit reaches a documented total, which does not exist today.
- If local filters reduce rows, show both server count and visible count.

## Summary Strip
Cards:
- Manual review count
- Unmatched count
- Received count
- Processed count
- Duplicate count
- Latest received timestamp

Card content:
- label
- value
- short meaning
- optional route/filter action

Examples:
- `Manual review` -> `2` -> `Conflicting payment signals`
- `Unmatched` -> `4` -> `Provider references not matched`
- `Latest received` -> `2m ago` -> `MTN MoMo callback`

Card action rules:
- Clicking a status card applies that server filter if supported.
- Latest received card does not filter; it scrolls to the first row.
- Cards are not links if count is zero.

Visual rules:
- manual review card uses strong red left rail
- unmatched card uses amber left rail
- received card uses blue left rail
- processed card uses green text only
- duplicate card uses muted neutral text

## Primary Table
Table caption:
```text
Verified MTN MoMo webhook events returned by the admin webhook events endpoint.
```

Desktop columns:
- Status
- Event
- Provider reference
- Amount
- Matched records
- Timing
- Review note
- Actions

Column details:
- Status: processing status chip plus event type chip.
- Event: event ID and optional provider event ID.
- Provider reference: monospace provider reference.
- Amount: `GHS` formatted amount and currency verification.
- Matched records: payment ID and delivery ID if present.
- Timing: provider occurred time and Kra received time.
- Review note: humanized note plus internal short code.
- Actions: view event, open reconciliation, open delivery.

Table density:
- Row height target: compact but readable.
- Important identifiers are monospace.
- Status chips use text labels, not color alone.
- Amount aligns right on desktop.
- Actions align right.

## Row Priority
Sort returned rows remain in backend order. Do not reorder the table client-side by severity unless the user explicitly sorts locally.

Visual priority still applies:
- manual-review rows receive a red severity rail
- unmatched rows receive an amber severity rail
- stale received rows receive a blue warning rail
- processed and duplicate rows remain plain

If local sort is later added:
- default remains backend order
- sorted state must be clearly announced
- sorting must not imply data outside the returned list

## Row Anatomy
Each row should include:
- processing status chip
- event type chip
- event ID
- provider reference
- amount
- provider time
- received time
- matched payment link if present
- matched delivery link if present
- review note
- primary action

Manual-review row expanded detail:
- status explanation
- processing note humanized copy
- matched payment ID
- matched delivery ID
- provider lag
- recommended next step

Unmatched row expanded detail:
- provider reference
- provider event ID if present
- event type
- amount
- occurrence and receipt timing
- recommended reconciliation search

Duplicate row expanded detail:
- repeated event type
- provider reference
- received time
- note that no second payment mutation should be inferred

## Row Actions
Primary actions:
- `View event`
- `Open reconciliation`
- `Open delivery`

Secondary actions:
- `Copy event ID`
- `Copy provider reference`
- `Copy payment ID`
- `Copy delivery ID`

Action rules:
- `View event` opens `/admin/webhook-events/:eventId`.
- If detail route cannot load directly, pass row context through navigation state or query cache.
- `Open reconciliation` opens `/admin/payment-reconciliation`.
- `Open delivery` appears only when `matchedDeliveryId` exists.
- `Copy provider reference` logs only that copy occurred, not the copied value.
- No action calls the inbound provider webhook endpoint.
- No action calls replay tooling.
- No action changes payment, refund, or delivery state.

Disabled or omitted actions:
- omit `Replay webhook`
- omit `Mark processed`
- omit `Ignore`
- omit `Delete event`
- omit `Edit provider reference`
- omit `Change amount`
- omit `Change payment status`

## Empty State
Trigger:
- API returns `events: []` with no processing-status filter.

Copy:
```text
No webhook events have been returned yet.
Verified provider callbacks will appear here after MTN MoMo sends payment events and the backend stores them.
```

Actions:
- `Refresh`
- `Open payment reconciliation`
- `Review payment setup`

Rules:
- Do not imply provider callback setup is broken.
- Mention that this is based on the current returned list only.
- If launch readiness requires callback proof, link to launch readiness.

## Filtered Empty State
Trigger:
- API returns `events: []` for a selected processing status.

Copy examples:
- `No manual-review webhook events returned.`
- `No unmatched webhook events returned.`
- `No duplicate webhook events returned.`

Actions:
- `Clear status filter`
- `Refresh`
- `Open all webhook events`

Rules:
- Keep the state positive for `manual_review` and `unmatched`.
- Do not claim there are zero across all time.
- State that the backend returned no rows for the current filter.

## Local Search Empty State
Trigger:
- API returned rows but local client filters hide all rows.

Copy:
```text
No returned webhook events match the local search.
Clear the local filter or change the server status filter.
```

Actions:
- `Clear local filter`
- `Clear all filters`

Rules:
- Keep the API result count visible.
- Do not call backend with unsupported search parameters.

## Loading State
Trigger:
- first request pending

Layout:
- page header skeleton
- summary strip skeleton
- table skeleton with 8 rows
- no spinner-only screen

Copy:
```text
Loading webhook events...
```

Rules:
- Keep route shell visible.
- Avoid layout shift between loading and ready.
- Do not show stale rows during first load unless cache policy says previous data is safe.

## Refreshing State
Trigger:
- user hits refresh or query refetches in background

Behavior:
- keep current rows visible
- show inline `Refreshing...` state beside the refresh button
- disable only duplicate refresh clicks
- maintain focus on the refresh control
- announce updated count after completion

Copy:
```text
Webhook events refreshed. 50 rows returned.
```

Rules:
- Do not clear filters.
- Do not clear expanded rows unless the row no longer exists.
- If a manual-review count changes, update the summary strip and banner.

## Failed State
Trigger:
- request fails
- network unavailable
- backend returns non-success status

Layout:
- retain header and filters
- show error panel where the table would appear
- include retry action
- include safe support copy

Copy:
```text
Webhook events could not be loaded.
Retry, or check admin access and service health if the problem continues.
```

Actions:
- `Retry`
- `Open finance summary`
- `Open status dashboard` if a platform status route exists

Rules:
- Do not show provider secrets.
- Do not expose raw backend stack traces.
- Use known API error codes if returned.
- For `403`, route to not-authorized state.
- For `401`, route to session-expired state.

## Not Authorized State
Trigger:
- authenticated user lacks `review_reconciliation`

Copy:
```text
You do not have permission to review payment webhook events.
Ask a super admin for reconciliation access if this is required for your role.
```

Rules:
- Do not render rows from cache after authorization failure.
- Do not render provider references.
- Provide route back to admin overview.

Visible actions:
- `Back to admin overview`
- `Open support`

Hidden actions:
- refresh
- copy identifiers
- row actions

## Session Expired State
Trigger:
- `401`
- auth token expired
- auth verifier rejects user session

Copy:
```text
Your admin session expired.
Sign in again to view payment webhook events.
```

Actions:
- `Sign in`

Rules:
- Clear sensitive cached rows from visible UI.
- Preserve intended return route after sign-in.

## API Error Mapping
| API code | UI state | Copy | Action |
| --- | --- | --- | --- |
| `FORBIDDEN` | `not_authorized` | `You do not have permission to review payment webhook events.` | `Back to admin overview` |
| `UNAUTHORIZED` | `session_expired` | `Your admin session expired.` | `Sign in` |
| `VALIDATION_ERROR` | `api_error` | `The webhook event filter is invalid.` | `Clear filters` |
| `PROVIDER_TIMEOUT` | `api_error` | `The external service took too long to respond.` | `Retry` |
| `UNKNOWN_INTERNAL_ERROR` | `api_error` | `Webhook events could not be loaded.` | `Retry` |

Inbound-only errors:
- `WEBHOOK_SIGNATURE_INVALID` is not a list-page API error.
- It may appear in audit or observability surfaces, but trusted event rows are written only after verification.

## Privacy And Security
Sensitive data rules:
- Do not show raw webhook payload in the list.
- Do not show provider signature headers.
- Do not show callback secrets.
- Do not show API keys.
- Do not show full backend error stack traces.
- Do not log copied provider references as values in frontend analytics.
- Do not put provider references into third-party analytics payloads.
- Do not infer customer phone numbers or wallet identifiers from provider references.

Allowed identifiers:
- event ID
- provider event ID if returned
- provider reference
- payment ID
- delivery ID

Identifier display:
- Use monospace.
- Support copy only for fields returned by the API.
- Copy success message must name the field, not repeat the value.

Security banner:
- If the page is viewed by `super_admin`, do not expose extra secrets.
- Super admin sees the same safe list as finance admin.

## Accessibility
Required:
- one `h1`: `Webhook events`
- table caption describing returned MTN MoMo webhook events
- column headers with `scope="col"`
- row key cell with `scope="row"` or equivalent semantic relationship
- visible focus outlines
- keyboard-accessible filters
- keyboard-accessible row actions
- no color-only status indication
- live region for refresh and filter result counts
- skip link from header to table

Status messages:
- Loading completion must announce returned row count.
- Refresh completion must announce updated row count.
- Filter changes must announce visible row count.
- Errors must be announced with assertive urgency only when they block the table.

Focus rules:
- Changing a filter keeps focus on the changed control.
- Retry keeps focus on retry until results render, then announces status.
- Opening row details moves focus to the detail screen heading.
- Copy actions keep focus on the copied field action and announce success.

Reduced motion:
- Summary card changes fade only if motion is allowed.
- Row insertions should avoid sliding motion.
- Use `prefers-reduced-motion` to remove transitions.

## Responsive Behavior
Desktop, `>= 1200px`:
- Full table layout.
- Sticky filter bar under header if admin shell supports sticky content.
- Summary strip remains single row.

Laptop, `900px - 1199px`:
- Hide provider event ID into row disclosure.
- Keep status, event ID, reference, amount, timing, and actions visible.
- Actions can collapse into a row menu.

Tablet, `700px - 899px`:
- Use condensed table with horizontal scroll only if card layout would reduce scan speed.
- Keep table caption and headers accessible.
- Summary strip wraps to two rows.

Mobile, `< 700px`:
- Switch to event cards.
- Cards show status, event ID, provider reference, amount, timing, and primary action.
- Secondary identifiers live inside disclosure.
- Filter controls stack.
- Refresh and clear filters remain thumb-reachable.

Mobile card order:
- status chip
- event ID
- event type
- provider reference
- amount
- received time
- matched delivery or unmatched note
- primary action

## Visual Design
Color roles:
- critical red for manual review
- amber for unmatched
- blue for received and pending accepted
- green for processed
- neutral gray for duplicate
- dark ink for identifiers and amounts
- pale surface for summary cards

Typography:
- Screen title large and calm.
- Identifiers use monospace.
- Table body uses compact but readable type.
- Review notes use short sentence case.
- Amounts align consistently.

Spacing:
- Header has generous vertical breathing room.
- Summary cards align to the table grid.
- Filter bar is compact and not taller than the table header.
- Row vertical padding stays consistent across statuses.

Motion:
- Refresh button shows subtle progress state.
- Summary count changes can cross-fade.
- Error panel appears without dramatic motion.
- No constant animation.

## Copy System
Tone:
- precise
- calm
- finance-safe
- operational
- non-accusatory

Preferred words:
- `verified callback`
- `provider reference`
- `manual review`
- `unmatched`
- `processed`
- `duplicate`
- `reconciliation`
- `matched delivery`

Avoid:
- blaming provider
- implying fraud without evidence
- saying the callback is missing unless backend proves it
- saying all events are shown
- exposing internal secrets

Button copy:
- `Refresh`
- `View event`
- `Open reconciliation`
- `Open delivery`
- `Clear filters`
- `Copy event ID`
- `Copy provider reference`

Banner copy:
```text
Manual review required for provider callbacks.
Review payment and delivery records before changing customer or dispatch decisions.
```

## Interaction Details
Refresh:
- calls `GET /v1/admin/webhook-events` with current server filters
- does not change URL
- keeps rows visible during fetch
- announces completion

Processing status filter:
- updates URL
- calls backend
- clears expanded row state only if no longer present
- announces new returned row count

Limit filter:
- updates URL
- calls backend
- allowed values are `25`, `50`, and `100`
- default display is `50`

Local search:
- filters returned rows only
- search fields include event ID, provider event ID, provider reference, payment ID, delivery ID, event type, processing status, and review note
- minimum useful input is one character
- search is case-insensitive
- preserve original API row order

Row expansion:
- optional on desktop
- recommended on tablet and mobile
- must not fetch unsupported detail endpoint
- must not expose raw payload

Copy action:
- writes text to clipboard
- shows transient success message
- does not send copied value to analytics

## Data Fetching Contract
Hook:
```text
useAdminWebhookEventsQuery
```

Inputs:
- `processingStatus?: WebhookProcessingStatus`
- `limit?: number`

Output:
- `generatedAt`
- `events`
- loading state
- refreshing state
- error state

Cache keys:
- include `processingStatus`
- include `limit`
- do not include local search
- do not include event type filter unless it becomes server-backed later

Freshness:
- show data age from `generatedAt`
- consider background refresh if admin shell policy supports it
- do not auto-refresh faster than the platform can tolerate
- manual refresh must always be available

No-store:
- backend sets no-store for admin reads
- frontend must not persist sensitive webhook rows in local storage
- session memory cache is acceptable if cleared on sign-out or authorization failure

## Observability
Frontend events:
- `admin_webhook_events_viewed`
- `admin_webhook_events_refreshed`
- `admin_webhook_events_status_filter_changed`
- `admin_webhook_events_limit_changed`
- `admin_webhook_events_local_search_used`
- `admin_webhook_event_row_opened`
- `admin_webhook_event_copy_clicked`
- `admin_webhook_events_error_seen`

Allowed analytics fields:
- processing status filter
- limit
- visible row count
- returned row count
- counts by status
- role class
- has manual-review rows
- has unmatched rows

Forbidden analytics fields:
- provider reference values
- provider event ID values
- payment ID values
- delivery ID values
- raw payload
- signature material
- error stack
- customer wallet data

Operational logs:
- UI should rely on backend logs for ingestion details.
- Frontend logs should capture UI failure modes only.
- Do not duplicate sensitive provider payloads in browser logs.

## Performance
Target:
- first meaningful paint under normal admin shell budget
- table interaction responsive for 100 rows
- local filtering under 100 ms for returned rows

Rules:
- Avoid heavy chart libraries.
- Avoid rendering raw JSON payloads.
- Virtualization is not required at 100 rows.
- Memoize derived counts only if profiling shows a need.
- Keep row components simple and semantic.

## Reliability
Expected failure modes:
- expired admin session
- missing reconciliation capability
- network failure
- backend validation failure from URL tampering
- backend internal error
- empty result during pilot before callbacks arrive

Reliability rules:
- keep the route usable when only one status filter fails by allowing clear filters
- preserve filter URL after retry
- never change payment interpretation on frontend alone
- show stale data age clearly if refetch fails after prior success
- do not hide manual-review rows behind secondary tabs

## Edge Cases
Handle:
- missing `providerEventId`
- missing `matchedPaymentId`
- missing `matchedDeliveryId`
- missing `processingNotes`
- unknown processing note
- amount values with integer GHS only
- `occurredAt` after `receivedAt` due provider clock drift
- `generatedAt` older than newest `receivedAt` due clock skew
- exactly `100` returned rows
- unsupported status query in URL
- repeated event IDs not expected but should not break render

Clock skew:
- If provider occurred time is after received time, show both timestamps and do not compute a negative lag badge.
- Copy: `Provider timestamp is later than received timestamp.`

Unsupported status query:
- Clear invalid value before calling API if router validation can do so safely.
- If API returns validation error, show `The webhook event filter is invalid.`

## State Matrix
| State | Trigger | Primary UI | User action |
| --- | --- | --- | --- |
| `loading` | first fetch pending | skeleton table | wait |
| `ready` | rows returned | summary and table | triage |
| `empty` | no rows, no filter | empty panel | refresh |
| `filtered_empty` | no rows for status | filtered empty panel | clear filter |
| `failed` | request failure | error panel | retry |
| `refreshing` | background refetch | retained rows plus progress | wait or continue |
| `not_authorized` | 403 | permission panel | return |
| `session_expired` | 401 | sign-in panel | sign in |
| `api_error` | validation or server error | safe error panel | clear or retry |

## Navigation Contracts
From row with matched delivery:
- route: `/admin/deliveries/:deliveryId`
- preserve return path: `/admin/webhook-events?...`
- label: `Open delivery`

From row with matched payment:
- route: payment reconciliation detail only if implementation has a payment-specific route
- otherwise route: `/admin/payment-reconciliation`
- label: `Open reconciliation`

From row without matched records:
- route: `/admin/payment-reconciliation`
- include provider reference in navigation state if safe
- do not place provider reference in URL unless product explicitly approves it

From row to detail:
- route: `/admin/webhook-events/:eventId`
- pass selected row context
- detail route must handle direct load limitation

## Role Behavior
| Role | Can view | Notes |
| --- | --- | --- |
| `finance_admin` | Yes | Primary workflow owner |
| `super_admin` | Yes | Same safe data surface as finance admin |
| `ops_admin` | No | Lacks reconciliation capability |
| `support_admin` | No | Lacks reconciliation capability |
| `driver` | No | Not admin |
| `station_operator` | No | Not admin |
| `final_mile_courier` | No | Not admin |
| `sender` | No | Not admin |

Rules:
- The admin navigation should hide this route from roles without access where possible.
- Direct route access still depends on backend authorization.
- A forbidden backend response must remove sensitive row content from the visible UI.

## QA Scenarios
1. `finance_admin` opens `/admin/webhook-events` and sees the most recent returned rows.
2. `super_admin` opens the route and sees the same safe fields.
3. `ops_admin` opens the route and receives the not-authorized state.
4. Status filter `manual_review` calls `/v1/admin/webhook-events?processingStatus=manual_review`.
5. Status filter `unmatched` calls `/v1/admin/webhook-events?processingStatus=unmatched`.
6. Limit `100` calls `/v1/admin/webhook-events?limit=100`.
7. Local search filters provider reference within returned rows only.
8. Manual-review rows show red severity treatment and reconciliation action.
9. Unmatched rows show amber severity treatment and reconciliation action.
10. Processed rows show muted completed treatment.
11. Duplicate rows show muted repeat-safe treatment.
12. Rows with `matchedDeliveryId` show `Open delivery`.
13. Rows without `matchedDeliveryId` do not show delivery action.
14. Rows without `providerEventId` do not render an empty label.
15. Unknown `processingNotes` render safe short-code copy.
16. Refresh keeps filters and rows visible while loading.
17. Refresh announces returned row count.
18. API error shows retry and no stack trace.
19. `401` clears sensitive content and routes to session-expired state.
20. `403` clears sensitive content and routes to not-authorized state.
21. Empty unfiltered response shows onboarding-style empty state.
22. Empty filtered response says no rows returned for current filter.
23. Local search empty state preserves server result count.
24. Copy action announces success without repeating copied value.
25. No raw payload appears anywhere on the list.
26. No signature value appears anywhere on the list.
27. No replay action appears on this screen.
28. No payment mutation action appears on this screen.
29. Mobile cards preserve status, event ID, reference, amount, timing, and action.
30. Keyboard user can filter, refresh, copy, and open row actions.

## Acceptance Criteria
Functional:
- The screen calls only `GET /v1/admin/webhook-events`.
- The route is `/admin/webhook-events`.
- The root test id is `screen-admin-webhook-events`.
- Server-backed processing status and limit filters update the URL.
- Local filters do not create unsupported API query parameters.
- The UI renders all six webhook processing statuses.
- The UI renders all three payment event types.
- Manual-review and unmatched states are visually prioritized.
- The UI never displays raw payloads or signature material.
- The UI does not expose replay or mutation controls.

Accessibility:
- The page has one logical `h1`.
- The table has a meaningful caption.
- All status chips include text labels.
- Filter and refresh changes are announced.
- Focus is preserved during refresh.
- Error states are keyboard reachable.
- Mobile card layout retains semantic grouping.

Security:
- Forbidden and unauthorized states clear sensitive visible content.
- Copy analytics exclude copied values.
- Browser storage does not persist webhook rows.
- Super admin receives the same safe field set as finance admin.

Quality:
- Works with zero rows, one row, and 100 rows.
- Works without provider event ID.
- Works without matched payment or delivery IDs.
- Handles unknown review notes.
- Handles stale generated time.
- Handles API validation errors from unsupported URL values.

## Component Inventory
Required components:
- `AdminPageShell`
- `AdminBreadcrumb`
- `AdminPageHeader`
- `WebhookRiskSummaryStrip`
- `WebhookStatusFilter`
- `WebhookLimitSelect`
- `WebhookLocalSearch`
- `WebhookActiveFilterSummary`
- `WebhookEventsTable`
- `WebhookEventRow`
- `WebhookEventMobileCard`
- `WebhookStatusChip`
- `WebhookEventTypeChip`
- `WebhookReviewNote`
- `IdentifierCopyButton`
- `AdminEmptyState`
- `AdminErrorState`
- `AdminPermissionState`
- `AdminLiveRegion`

Optional components:
- `WebhookRowDisclosure`
- `WebhookClockSkewNotice`
- `WebhookStaleDataNotice`
- `WebhookReturnedLimitNotice`

Do not build:
- provider payload JSON viewer on this list
- replay modal trigger on this list
- payment override form
- provider dashboard iframe
- secret visibility control

## Implementation Notes For Claude Code
Build sequence:
1. Add route `/admin/webhook-events` with `screen-admin-webhook-events`.
2. Wire `useAdminWebhookEventsQuery` to `GET /v1/admin/webhook-events`.
3. Implement query parsing for `processingStatus` and `limit`.
4. Validate status query values before calling the API.
5. Render header, freshness, and refresh behavior.
6. Render summary strip from returned rows.
7. Render filter bar with server-backed and local filters separated.
8. Render desktop table.
9. Render mobile card layout.
10. Add empty, filtered-empty, failed, unauthorized, and expired states.
11. Add row actions without unsupported mutations.
12. Add accessibility live-region announcements.
13. Add tests for states, filters, role behavior, and privacy exclusions.

Implementation boundaries:
- Do not implement `ReplayWebhookModal` from this list.
- Do not add backend endpoints.
- Do not change webhook processing rules.
- Do not add frontend UI for raw payload inspection here.
- Do not store sensitive data in local storage.

## Test Plan
Unit tests:
- formats processing statuses
- formats event types
- formats GHS amount
- derives status counts
- derives oldest unresolved row
- handles unknown review note
- validates status query
- builds API query from URL filters

Component tests:
- renders loading skeleton
- renders ready table
- renders manual-review banner
- renders unmatched row treatment
- renders empty state
- renders filtered empty state
- renders local search empty state
- renders failed state
- renders not-authorized state
- renders session-expired state
- hides raw payload content
- hides replay action
- hides delivery action when no delivery ID
- announces refresh result

Integration tests:
- finance admin can load route
- super admin can load route
- ops admin receives forbidden state from API
- status filter calls backend with correct query
- limit filter calls backend with correct query
- local search does not call backend
- row action opens delivery route
- row action opens event detail route with row context

Visual regression:
- desktop ready state with mixed statuses
- desktop manual-review filter
- desktop error state
- mobile card state
- mobile filtered empty state

Accessibility tests:
- heading structure
- table caption
- keyboard filter flow
- keyboard row action flow
- live-region update on refresh
- contrast for chips and warning banners

## Content Checklist
Before implementation is accepted:
- All status labels match backend enum values.
- All event type labels match backend enum values.
- No unsupported replay copy appears.
- No unsupported raw payload copy appears.
- No provider secret wording appears.
- No global total claim appears.
- No customer-safe page copy leaks internal-only error codes.
- Manual-review rows clearly explain why finance must inspect records.
- Unmatched rows clearly explain provider reference matching risk.
- Duplicate rows clearly explain repeat-safe processing.

## Open Backend Gaps For Future Work
Not required for this screen, but useful for later:
- single webhook event read endpoint
- cursor pagination
- server-side provider reference search
- server-side payment ID filter
- server-side delivery ID filter
- server-side event type filter
- date range filter
- aggregate counts by status
- replay mutation with strict access controls
- raw payload detail endpoint with redaction policy
- webhook processing dead-letter status if implemented later

These gaps must not block the current list. The current list is fully buildable from `admin_webhook_events`.

## Final Screen Contract
`AdminWebhookEvents` is complete when it gives finance admins a fast, safe, accessible ledger of trusted MTN MoMo webhook events, prioritizes manual-review and unmatched records, routes investigation into reconciliation and delivery context, and refuses to expose unsupported replay, raw payload, or payment mutation controls.

# Admin Webhook Event Detail Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminWebhookEventDetail` |
| Route | `/admin/webhook-events/:eventId` |
| Test id | `screen-admin-webhook-event-detail` |
| Surface | Admin web console |
| Backend coverage | `admin_webhook_events`; no single-event read endpoint exists yet |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` with `review_reconciliation` capability |
| Required action role | None in the current backend |
| Required states | `loading`, `ready`, `limited_context`, `not_found_from_returned_rows`, `failed`, `replay_needed`, `replay_unavailable`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminWebhookEvents`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminFinanceSummary`, `AdminLaunchReadiness` |
| Related screens | `AdminWebhookEvents`, `ReplayWebhookModal`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminDeliveryDetail`, `AdminAuditEvents`, `AdminSlaBreachDashboard` |

## Purpose
`AdminWebhookEventDetail` is the single-event evidence view for one trusted MTN MoMo provider callback record. It lets finance and super admins inspect the normalized callback fields, understand how the backend processed the event, verify the payment and delivery match, and route unresolved records into reconciliation or delivery review.

The screen should answer:
- `What provider event am I looking at?`
- `Was it processed, duplicated, unmatched, accepted pending, or sent to manual review?`
- `What provider reference and event type drove the processing decision?`
- `What amount did the provider report?`
- `Which Kra payment and delivery did the callback match?`
- `Why does the record require manual review?`
- `Is replay needed from a product perspective?`
- `Is replay currently available in the backend?`
- `What should finance or engineering open next?`

This screen is a read-only evidence surface. It must not call the inbound webhook endpoint, replay a callback, edit provider data, expose raw payloads, reveal signature material, mutate payment status, or decide customer or dispatch outcomes on its own.

## Strategic Role
The list screen finds risk. This detail screen explains the risk with enough precision for a finance admin, super admin, or backend engineer to decide the next review path without opening provider consoles or reading server logs.

The detail screen must be strong on provenance:
- trusted provider
- event ID
- provider reference
- provider event ID when present
- provider occurred time
- Kra received time
- processing status
- matching outcome
- review note
- linked Kra records

It must be strict about boundaries. The inventory says this screen covers `failed` and `replay needed`, but current backend has no `failed` processing status, no single-event endpoint, and no replay mutation. Therefore the screen must explain replay need as a review state while keeping the replay action unavailable until backend support exists.

## Audience
Primary users:
- finance admins reviewing one payment callback exception
- super admins validating payment integrity and launch blockers

Secondary users:
- backend engineers investigating webhook handling
- QA reviewers validating callback state transitions
- support leads explaining why payment confirmation is delayed
- operations leads checking whether a delivery is affected by payment signal conflict

Non-users:
- senders
- receivers
- drivers
- station operators
- final-mile couriers
- public web visitors
- provider systems

## Backend Reality
Primary implemented endpoint:
```http
GET /v1/admin/webhook-events
```

Current route:
```text
/admin/webhook-events/:eventId
```

Important limitation:
- No `GET /v1/admin/webhook-events/:eventId` endpoint exists yet.

Supported list query parameters:
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

Auth behavior:
- route requires `review_reconciliation`
- current capability matrix grants this to `finance_admin` and `super_admin`
- backend returns forbidden for other roles

List-backed detail strategy:
1. Prefer selected row context passed from `AdminWebhookEvents`.
2. If row context is not present, check the query cache for `admin_webhook_events` pages already loaded.
3. If still missing, fetch `/v1/admin/webhook-events?limit=100`.
4. Search returned rows for matching `eventId`.
5. If not found, show `not_found_from_returned_rows` and explain that the record may be outside the current returned range.

Do not:
- call a non-existent detail endpoint
- claim a missing returned row means the event does not exist
- fetch raw payload from unsupported API paths
- call the inbound provider webhook endpoint
- trigger replay from the browser

Example row-derived detail data:
```json
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
```

## Current Data Limits
The detail screen can show:
- event ID
- provider
- provider event ID if returned
- provider reference
- event type
- amount
- currency
- provider occurred timestamp
- Kra received timestamp
- processing status
- matched payment ID if returned
- matched delivery ID if returned
- processing note if returned

The detail screen cannot show today:
- raw provider payload
- webhook signature
- request headers
- provider delivery attempt metadata
- retry count from admin response
- full payment record unless another route is opened
- full delivery record unless another route is opened
- webhook processing logs
- replay history
- dead-letter state
- replay button
- mutation controls

## Source References
External references used for this screen:
- [MTN MoMo Callback documentation](https://momoapi.mtn.com/api-documentation/callback/): supports the asynchronous provider callback context for payment operations.
- [MTN MoMo callback setup details](https://momoapi.mtn.com/content/html_widgets/a8e43.html): supports callback URL setup, HTTPS expectations, and callback reliability considerations.
- [Stripe Webhooks documentation](https://docs.stripe.com/webhooks?lang=node): supports webhook security principles such as signature verification, secret protection, and acting only after trusted event validation.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/): supports a key-value evidence layout for important record details and action links.
- [GOV.UK Details component](https://design-system.service.gov.uk/components/details/): supports progressive disclosure for secondary technical context.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports non-disruptive announcements for loading, copy, and replay-unavailable notices.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports safe handling of security and operational event data without leaking sensitive payloads.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/36-admin-webhook-events.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/07-api/error-codes.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/14-platform/slo-sla.md`
- `docs/14-platform/observability-and-alerting.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payment-webhooks.ts`
- `services/api/src/firestore/repositories.ts`

## Design Thesis
Design this as a forensic payment-callback record: calm, precise, and evidence-oriented. The page should feel like an incident-grade event file, not a settings page or a raw JSON viewer.

Visual direction:
- two-column desktop evidence layout
- status-led header
- key-value summary cards
- prominent processing outcome panel
- route-focused action rail
- subdued technical disclosure panels
- monospace identifiers
- no raw payload block in current mode

Restraint rule:
- Show the normalized fields returned by the admin endpoint and the decisions inferred from those fields. Do not invent provider payloads, replay controls, or backend logs.

## Product Principle
The record must be clear enough to support a financial decision, but conservative enough not to become the decision. Payment, refund, dispatch, and delivery actions belong in their own controlled screens.

Priority order:
1. Processing outcome.
2. Review reason.
3. Payment and delivery match.
4. Provider reference and event type.
5. Timing.
6. Safe next route.

## Route And Loading Model
Route parameter:
```text
eventId
```

Valid format:
```text
EVT-WEB-[A-Z0-9-]+
```

Loading modes:
- navigation-state load from selected row
- query-cache load from list rows
- best-effort list refetch with `limit=100`
- not found within returned rows

Recommended algorithm:
```text
if selectedRow.eventId equals route eventId:
  render selectedRow
else if cached admin_webhook_events rows contain eventId:
  render cached row with limited_context notice if generatedAt is stale
else:
  fetch /v1/admin/webhook-events?limit=100
  if returned rows contain eventId:
    render returned row
  else:
    render not_found_from_returned_rows
```

The page must never treat a best-effort miss as authoritative absence.

## Information Architecture
Desktop layout:
- Admin shell and breadcrumb.
- Header with status, event ID, and primary review outcome.
- Critical banner for manual-review or unmatched rows.
- Left column: event summary, provider details, timing.
- Right column: processing result, matched records, next actions.
- Lower section: technical notes and backend limits.
- Footer: safe handling and source route.

Mobile layout:
- Header stack.
- Status and event ID card.
- Outcome panel.
- Matched records card.
- Provider details card.
- Timing card.
- Next actions card.
- Technical disclosure.

## Breadcrumbs
Preferred breadcrumb:
```text
Admin / Finance / Webhook events / EVT-WEB-4010
```

Rules:
- Link `Webhook events` back to `/admin/webhook-events`.
- Preserve return query where available.
- The final crumb is the event ID.
- If the event ID is too long, truncate visually but keep full value accessible.

## Header
Header content:
- Eyebrow: `Webhook event`
- H1: event ID
- Status chip: processing status
- Event type chip: provider event type
- Provider label: `MTN MoMo`
- Freshness line from source list `generatedAt` when known
- Back link to webhook events

Manual-review header copy:
```text
Manual review required before finance or delivery decisions.
```

Unmatched header copy:
```text
Verified provider reference did not match a Kra payment in the current processing flow.
```

Processed header copy:
```text
Callback matched and processed.
```

Duplicate header copy:
```text
Repeat callback was ignored safely.
```

Accepted-pending header copy:
```text
Provider still reports pending payment.
```

Received header copy:
```text
Callback was stored and is awaiting processing result.
```

## Status Taxonomy
### `received`
Meaning:
- The event was stored but has not reached a final processing outcome.

Detail treatment:
- blue status chip
- processing panel title `Stored`
- next action: refresh list, then review if stale

Risk:
- low when recent
- warning when stale

### `processed`
Meaning:
- The event matched a Kra payment and reached the expected processing result.

Detail treatment:
- green status chip
- processing panel title `Processed`
- next action: open payment or delivery context if needed

Risk:
- low

### `duplicate`
Meaning:
- A callback repeated an already handled provider reference and event type.

Detail treatment:
- neutral chip
- processing panel title `Duplicate callback`
- next action: review only if duplicates are unusually frequent

Risk:
- low for a single record

### `unmatched`
Meaning:
- The event was trusted but the provider reference did not match a Kra payment.

Detail treatment:
- amber status chip
- processing panel title `Unmatched provider reference`
- next action: open payment reconciliation

Risk:
- high

### `accepted_pending`
Meaning:
- The event matched a payment, but provider state remains pending.

Detail treatment:
- blue-gray status chip
- processing panel title `Pending accepted`
- next action: wait for final provider event or open reconciliation if stale

Risk:
- medium

### `manual_review`
Meaning:
- The event matched a payment but conflict handling requires review.

Detail treatment:
- red status chip
- processing panel title `Manual review`
- next action: open reconciliation and delivery context

Risk:
- critical

## Event Type Meaning
### `payment.pending`
Copy:
```text
Provider says payment is still pending.
```

Use:
- explain that dispatch cannot rely on this event as confirmed payment

### `payment.confirmed`
Copy:
```text
Provider says payment is confirmed.
```

Use:
- explain payment confirmation risk when unmatched or conflicting

### `payment.failed`
Copy:
```text
Provider says payment failed.
```

Use:
- explain why dispatch or customer communication may need review

## Processing Note Mapping
| Processing note | Detail title | Detail copy |
| --- | --- | --- |
| `provider_amount_mismatch` | Amount mismatch | `Provider amount does not match the Kra payment amount. Reconcile before changing payment, refund, or dispatch decisions.` |
| `conflicting_final_payment_status` | Final status conflict | `Provider event conflicts with an already final payment state. Review payment history and delivery impact before acting.` |
| missing | No processing note returned | `No processing note was returned for this event.` |
| unknown value | Review note returned | `The backend returned an unrecognized review note. Route to engineering if finance cannot reconcile it.` |

Rules:
- Always show the internal short code when present.
- Do not translate an unknown note into a specific cause.
- Do not hide missing notes on manual-review records.

## Summary Cards
Required cards:
- Processing outcome
- Provider event
- Provider reference
- Amount
- Matching result
- Timing

Processing outcome card:
- status chip
- human explanation
- review note
- recommended next route

Provider event card:
- provider
- provider event ID if returned
- event type
- event ID

Provider reference card:
- provider reference
- copy action
- safe handling notice

Amount card:
- amount formatted as `GHS 55.00`
- event currency
- mismatch warning if processing note indicates amount conflict

Matching result card:
- matched payment ID if returned
- matched delivery ID if returned
- unmatched explanation if absent

Timing card:
- provider occurred timestamp
- Kra received timestamp
- lag if timestamps allow
- source list generated time if known

## Evidence Summary List
Use a key-value evidence block for normalized fields.

Rows:
- Event ID
- Provider
- Provider event ID
- Provider reference
- Event type
- Amount
- Currency
- Provider occurred at
- Kra received at
- Processing status
- Processing note
- Matched payment ID
- Matched delivery ID

Rules:
- Missing optional fields show `Not returned`.
- `Not returned` does not imply absent from provider payload.
- Copy actions are available only for identifiers.
- Copy success messages name the field and do not repeat the value.
- Values remain visible to authorized users only.

## Processing Result Panel
Manual-review panel:
- title: `Manual review required`
- tone: critical
- body: review-note copy
- primary action: `Open reconciliation`
- secondary action: `Open delivery` if delivery ID exists
- unavailable action notice: `Replay tooling is not available in the current backend.`

Unmatched panel:
- title: `Provider reference unmatched`
- tone: warning
- body: `The verified callback did not match a known Kra payment reference in processing.`
- primary action: `Open reconciliation`
- secondary action: `Copy provider reference`

Processed panel:
- title: `Processed`
- tone: success
- body: `The callback matched and processing completed.`
- primary action: `Open payment context`
- secondary action: `Open delivery` if delivery ID exists

Duplicate panel:
- title: `Duplicate callback`
- tone: neutral
- body: `The callback repeated an already seen provider reference and event type.`
- primary action: `Back to webhook events`

Accepted-pending panel:
- title: `Pending accepted`
- tone: neutral warning
- body: `The provider state is pending and should not be treated as confirmed payment.`
- primary action: `Open reconciliation`

Received panel:
- title: `Stored`
- tone: neutral
- body: `The callback has been stored and is awaiting processing result.`
- primary action: `Refresh events`

## Replay Needed Handling
The inventory includes `replay needed`. The current backend does not expose replay tooling to the admin frontend.

When replay may be needed:
- manual-review event cannot be reconciled from normalized fields
- unmatched event is later linked to a valid payment by backend engineering
- provider callback was trusted but internal processing failed outside current status taxonomy
- engineering determines a stored event should be processed again

Current UI behavior:
- show a `Replay unavailable` notice
- explain that backend engineering owns replay tooling
- route finance to reconciliation
- route technical review to audit or engineering escalation path if available
- do not show an enabled replay button

Copy:
```text
Replay may be required, but replay tooling is not exposed in the current admin API. Route this event to engineering with the event ID and provider reference.
```

Future behavior:
- `ReplayWebhookModal` may be enabled only after a secured replay endpoint exists
- replay must require strong role control
- replay must show preflight summary
- replay must record an audit event
- replay must not allow editing payload values

## Action Rail
Primary actions:
- `Open reconciliation`
- `Open delivery`
- `Back to webhook events`

Secondary actions:
- `Copy event ID`
- `Copy provider reference`
- `Copy payment ID`
- `Copy delivery ID`
- `Open audit events`

Unavailable action:
- `Replay webhook`

Rules:
- `Open delivery` appears only with `matchedDeliveryId`.
- `Copy payment ID` appears only with `matchedPaymentId`.
- `Copy delivery ID` appears only with `matchedDeliveryId`.
- `Replay webhook` is displayed only as unavailable explanatory text, not a disabled button that suggests imminent use.
- No action mutates payment or delivery state.
- No action calls `/v1/webhooks/payments/mtn-momo`.

## Missing Context State
State name:
```text
not_found_from_returned_rows
```

Trigger:
- route event ID is valid
- selected row context is missing
- query cache does not contain event ID
- best-effort list fetch with `limit=100` does not return the event

Copy:
```text
This webhook event was not found in the returned admin event rows.
It may be older than the current returned range, filtered out by the current API, or unavailable until a single-event endpoint is added.
```

Actions:
- `Back to webhook events`
- `Open webhook events`
- `Clear filters`
- `Open reconciliation`

Rules:
- Do not say the event does not exist.
- Do not show a destructive or corrective action.
- Include the requested event ID in the visible page for operator reference.

## Limited Context State
Trigger:
- detail is loaded from cached or selected row data without fresh list fetch
- `generatedAt` is missing
- direct route loaded from stale cache

Copy:
```text
Showing normalized event details from the available admin event rows. Refresh the webhook list if you need the newest returned state.
```

Actions:
- `Refresh from returned rows`
- `Back to list`

Rules:
- The page can still be useful.
- Make data freshness clear.
- Do not block read-only review if row context is complete.

## Loading State
Trigger:
- resolving row context
- best-effort list fetch pending

Layout:
- header skeleton with route event ID
- summary card skeletons
- action rail skeleton
- no spinner-only page

Copy:
```text
Loading webhook event details...
```

Rules:
- Preserve the route event ID in the skeleton header.
- Avoid layout shift into ready state.
- Do not show stale sensitive rows from another event.

## Failed State
Trigger:
- best-effort list fetch fails
- network error
- backend returns server error

Copy:
```text
Webhook event details could not be loaded.
Retry, or return to the webhook events list.
```

Actions:
- `Retry`
- `Back to webhook events`
- `Open reconciliation`

Rules:
- Keep route event ID visible.
- Do not show raw stack traces.
- Do not expose internal provider error values.

## Not Authorized State
Trigger:
- backend returns `403`
- user lacks `review_reconciliation`

Copy:
```text
You do not have permission to review payment webhook events.
Ask a super admin for reconciliation access if this is required for your role.
```

Actions:
- `Back to admin overview`

Rules:
- Remove all event field values from visible UI.
- Do not keep selected row data visible after authorization failure.

## Session Expired State
Trigger:
- backend returns `401`
- user token expires

Copy:
```text
Your admin session expired.
Sign in again to view this webhook event.
```

Actions:
- `Sign in`

Rules:
- Clear event values from visible UI.
- Preserve intended return route after sign-in.

## API Error Mapping
| Condition | UI state | Copy | Action |
| --- | --- | --- | --- |
| invalid event ID format | `api_error` | `The webhook event ID is invalid.` | `Back to webhook events` |
| `401` | `session_expired` | `Your admin session expired.` | `Sign in` |
| `403` | `not_authorized` | `You do not have permission to review payment webhook events.` | `Back to admin overview` |
| list fetch fails | `failed` | `Webhook event details could not be loaded.` | `Retry` |
| valid ID not in returned rows | `not_found_from_returned_rows` | `This webhook event was not found in the returned admin event rows.` | `Back to webhook events` |

## Privacy And Security
Sensitive values that must not appear:
- raw webhook payload
- signature header
- callback secret
- provider API key
- provider dashboard token
- backend stack trace
- internal request headers
- customer wallet identifier unless explicitly returned by the safe API

Allowed identifiers:
- event ID
- provider event ID if returned
- provider reference
- matched payment ID
- matched delivery ID

Copy rules:
- Copy success never repeats copied value.
- Copy analytics never include copied value.
- Provider reference can be copied because the API returns it for authorized admins.
- Provider reference must not be placed into third-party analytics payloads.

Visibility rules:
- `finance_admin` and `super_admin` see the same safe field set.
- Super admin does not get raw payload access on this screen.
- Unauthorized users see no record fields.

## Accessibility
Required:
- one `h1` containing the event ID or safe missing-context title
- clear status chip text
- summary lists implemented with semantic key-value relationships
- action rail reachable by keyboard
- copy buttons with accessible names
- visible focus ring
- live region for copy success and refresh outcomes
- error messages associated with the relevant region
- status is not color-only

Focus rules:
- On route load, focus moves to the page heading.
- Copy action keeps focus on the copy button.
- Copy success announces `Event ID copied` or equivalent without value.
- Opening reconciliation moves to the destination screen heading.
- Retry keeps focus on the retry button until completion.

Reduced motion:
- Avoid animated forensic panels.
- Use small opacity transitions only if motion is allowed.
- Disable transitions for `prefers-reduced-motion`.

## Responsive Behavior
Desktop, `>= 1200px`:
- two-column evidence layout
- action rail sticky inside content column if admin shell supports it
- processing panel spans the right column

Laptop, `900px - 1199px`:
- two columns remain
- action rail becomes a card under processing panel
- long identifiers truncate visually with copy controls

Tablet, `700px - 899px`:
- single column
- summary cards grouped by outcome, provider, match, timing
- action rail moves below outcome panel

Mobile, `< 700px`:
- single-column evidence cards
- sticky bottom back action is allowed only if it does not cover content
- identifiers wrap or truncate with accessible full text
- action buttons stack

## Visual Design
Color roles:
- red for manual review
- amber for unmatched
- blue for received and accepted pending
- green for processed
- gray for duplicate
- dark ink for event ID and amount
- pale panel surfaces for evidence cards

Typography:
- event ID uses monospace in header
- labels use compact uppercase or small caps only if already used in admin system
- body text stays precise and short
- review note copy is plain language followed by short code

Spacing:
- header separates from outcome panel
- evidence cards align to a shared grid
- actions are grouped by outcome and route
- do not crowd timestamps

## Copy System
Tone:
- forensic
- calm
- exact
- security-aware
- finance-safe

Preferred words:
- `trusted callback`
- `normalized event`
- `provider reference`
- `processing outcome`
- `manual review`
- `unmatched`
- `matched payment`
- `matched delivery`
- `replay unavailable`

Avoid:
- blaming the provider
- implying fraud without evidence
- saying replay is available
- saying raw payload is available
- saying the record is missing from storage when only returned rows were searched

## Timing Rules
Display:
- provider occurred time
- Kra received time
- source list generated time when known
- relative ages

Derived:
- provider-to-Kra lag when `receivedAt >= occurredAt`
- stale data warning when generated time is older than admin shell freshness threshold

Clock skew:
- If `occurredAt` is after `receivedAt`, show both timestamps and no lag number.
- Copy: `Provider timestamp is later than Kra received timestamp. Review clocks before drawing timing conclusions.`

## Data Fetching Contract
Hook:
```text
useAdminWebhookEventsQuery
```

Inputs for best-effort fetch:
- `limit=100`

Cache lookup:
- all cached `admin_webhook_events` query variants may be searched
- selected row context wins over stale cache

No persistence:
- do not store record details in local storage
- clear visible detail values on sign-out
- clear visible detail values on authorization failure

Refresh:
- best-effort list refetch with `limit=100`
- if found, update displayed record
- if not found, show not-found-from-returned-rows state

## Navigation Contracts
Back to list:
- route to `/admin/webhook-events`
- preserve original return query when available

Open reconciliation:
- route to `/admin/payment-reconciliation`
- pass provider reference and event ID through safe navigation state if implementation supports it
- do not place provider reference in URL unless product approves it

Open delivery:
- route to `/admin/deliveries/:matchedDeliveryId`
- visible only when `matchedDeliveryId` exists

Open audit events:
- route to `/admin/audit-events`
- optional navigation state may include target type `webhook_event` if supported

Open event list with status:
- manual review -> `/admin/webhook-events?processingStatus=manual_review`
- unmatched -> `/admin/webhook-events?processingStatus=unmatched`
- duplicate -> `/admin/webhook-events?processingStatus=duplicate`

## Observability
Frontend events:
- `admin_webhook_event_detail_viewed`
- `admin_webhook_event_detail_loaded_from_navigation_state`
- `admin_webhook_event_detail_loaded_from_cache`
- `admin_webhook_event_detail_loaded_from_list_fetch`
- `admin_webhook_event_detail_not_found_in_returned_rows`
- `admin_webhook_event_detail_copy_clicked`
- `admin_webhook_event_detail_replay_unavailable_seen`
- `admin_webhook_event_detail_route_clicked`
- `admin_webhook_event_detail_error_seen`

Allowed analytics fields:
- processing status
- event type
- has provider event ID
- has matched payment
- has matched delivery
- has processing note
- loaded source category
- role class

Forbidden analytics fields:
- provider reference value
- provider event ID value
- event ID value if analytics are third-party
- payment ID value
- delivery ID value
- raw payload
- signature material
- request headers

## Reliability
Expected failure modes:
- direct route older than returned list
- route opened after cache clear
- role access removed while row is visible
- network failure on best-effort fetch
- stale row context after processing status changes
- backend validation error from invalid event ID

Reliability rules:
- render the safest known state
- never infer record deletion from a list miss
- preserve a path back to the list
- preserve a path to reconciliation
- avoid unsupported API calls
- keep replay unavailable until an endpoint exists

## Edge Cases
Handle:
- missing provider event ID
- missing matched payment ID
- missing matched delivery ID
- missing processing note
- unknown processing note
- invalid route event ID
- valid route ID not in returned rows
- manual-review event without matched delivery ID
- unmatched confirmed payment event
- duplicate event with matched records
- amount shown as integer GHS from API
- source list generated time missing
- provider timestamp after received timestamp
- direct reload on mobile

## Role Behavior
| Role | Can view | Notes |
| --- | --- | --- |
| `finance_admin` | Yes | Primary reviewer |
| `super_admin` | Yes | Same safe field set |
| `ops_admin` | No | Lacks reconciliation capability |
| `support_admin` | No | Lacks reconciliation capability |
| `driver` | No | Not admin |
| `station_operator` | No | Not admin |
| `final_mile_courier` | No | Not admin |
| `sender` | No | Not admin |

Rules:
- Admin nav may hide the route for roles without access.
- Backend authorization remains the source of truth.
- If authorization fails, remove event values from the visible page.

## State Matrix
| State | Trigger | Primary UI | User action |
| --- | --- | --- | --- |
| `loading` | resolving row context | skeleton with event ID | wait |
| `ready` | event row found | detail evidence view | review |
| `limited_context` | row context exists but freshness is limited | detail view plus notice | refresh |
| `not_found_from_returned_rows` | valid event ID not found from list-backed lookup | missing context panel | back to list |
| `failed` | fetch error | safe error panel | retry |
| `replay_needed` | review state suggests replay may be needed | replay guidance notice | route to engineering path |
| `replay_unavailable` | current backend has no replay endpoint | unavailable notice | open reconciliation |
| `not_authorized` | 403 | permission panel | return |
| `session_expired` | 401 | sign-in panel | sign in |
| `api_error` | invalid route or validation failure | validation panel | back to list |

## QA Scenarios
1. Finance admin opens detail from a selected manual-review row and sees full normalized fields.
2. Super admin opens detail and sees the same safe field set.
3. Ops admin receives not-authorized state and no event values.
4. Direct route with valid event ID fetches `/v1/admin/webhook-events?limit=100`.
5. Direct route not found in returned rows shows non-authoritative missing context copy.
6. Invalid event ID shows invalid route state without API call if validation happens client-side.
7. Manual-review record shows critical outcome panel.
8. Manual-review record with `provider_amount_mismatch` shows amount mismatch copy.
9. Manual-review record with `conflicting_final_payment_status` shows final status conflict copy.
10. Unknown processing note shows generic returned-note copy.
11. Missing processing note shows `No processing note returned`.
12. Unmatched record routes to reconciliation.
13. Processed record shows low-risk outcome.
14. Duplicate record explains repeat-safe handling.
15. Accepted-pending record warns not to treat as confirmed payment.
16. Received record shows stored-and-awaiting-processing copy.
17. Record without provider event ID shows `Not returned`.
18. Record without delivery ID hides `Open delivery`.
19. Copy event ID announces success without repeating the value.
20. Copy provider reference does not send the value to analytics.
21. Raw payload does not appear.
22. Signature material does not appear.
23. Replay button does not appear as an enabled control.
24. Replay unavailable notice appears for manual-review cases when relevant.
25. Mobile layout keeps event ID, status, outcome, match, and actions visible.
26. Keyboard user can reach all summary actions.
27. Refresh preserves focus and announces result.
28. API failure shows retry without stack trace.
29. Session expiry clears record values.
30. Back link preserves return query when available.

## Acceptance Criteria
Functional:
- Route is `/admin/webhook-events/:eventId`.
- Root test id is `screen-admin-webhook-event-detail`.
- The screen does not call any non-existent single-event endpoint.
- The screen can render from navigation row context.
- The screen can render from cached list data.
- The screen can perform best-effort list fetch with `limit=100`.
- Missing returned rows show non-authoritative missing-context state.
- All six processing statuses are supported.
- All three event types are supported.
- The screen shows matched payment and delivery identifiers when present.
- The screen hides route actions when identifiers are absent.

Security:
- No raw payload appears.
- No signature material appears.
- No provider secrets appear.
- No copied values enter analytics payloads.
- Unauthorized and expired states remove visible record values.
- Replay action is unavailable until backend support exists.

Accessibility:
- One `h1`.
- Semantic key-value summaries.
- Text status labels.
- Keyboard-reachable actions.
- Live-region copy and refresh feedback.
- Clear error and missing-context states.

Quality:
- Handles direct route reload.
- Handles stale cached row.
- Handles missing optional fields.
- Handles unknown review note.
- Handles clock skew.
- Handles mobile and desktop layouts.
- Avoids global existence claims when only list rows were searched.

## Component Inventory
Required components:
- `AdminPageShell`
- `AdminBreadcrumb`
- `WebhookEventDetailHeader`
- `WebhookOutcomePanel`
- `WebhookReplayUnavailableNotice`
- `WebhookEvidenceSummary`
- `WebhookProviderDetailsCard`
- `WebhookTimingCard`
- `WebhookMatchedRecordsCard`
- `WebhookActionRail`
- `IdentifierCopyButton`
- `AdminMissingContextState`
- `AdminErrorState`
- `AdminPermissionState`
- `AdminLiveRegion`

Optional components:
- `WebhookTechnicalDetailsDisclosure`
- `WebhookClockSkewNotice`
- `WebhookLimitedContextNotice`
- `WebhookReturnPathLink`

Do not build:
- raw payload viewer
- signature viewer
- replay mutation form
- payment status override form
- provider dashboard iframe
- secret reveal control

## Implementation Notes For Claude Code
Build sequence:
1. Add route `/admin/webhook-events/:eventId`.
2. Validate route event ID format.
3. Read selected row context from navigation state.
4. Search cached `admin_webhook_events` rows.
5. Add best-effort list fetch with `limit=100`.
6. Render ready state from normalized row data.
7. Render limited context and not-found-from-returned-rows states.
8. Add processing outcome panel.
9. Add evidence summary cards.
10. Add matched record actions.
11. Add replay-unavailable notice.
12. Add privacy-safe copy actions.
13. Add accessibility announcements.
14. Add tests for direct route, row-context route, missing context, role failure, and privacy exclusions.

Implementation boundaries:
- Do not add backend endpoints.
- Do not implement replay.
- Do not call webhook ingestion routes.
- Do not render raw provider payload.
- Do not persist details in local storage.

## Test Plan
Unit tests:
- route event ID validation
- processing status copy mapping
- event type copy mapping
- processing note copy mapping
- GHS amount formatting
- timing lag computation
- clock skew handling
- action visibility rules

Component tests:
- selected-row ready state
- cached-row ready state
- best-effort fetch ready state
- not-found-from-returned-rows state
- limited-context notice
- manual-review outcome panel
- unmatched outcome panel
- processed outcome panel
- duplicate outcome panel
- replay-unavailable notice
- privacy exclusion checks
- copy action announcement

Integration tests:
- finance admin can open from list row
- super admin can direct-open with list fetch
- ops admin receives forbidden state
- route with invalid event ID avoids unsupported fetch
- missing event after returned list shows safe missing context
- open delivery action routes only when delivery ID exists
- open reconciliation route works for unmatched and manual-review events

Visual regression:
- desktop manual-review detail
- desktop unmatched detail
- desktop not-found-from-returned-rows
- mobile manual-review detail
- mobile replay-unavailable notice
- mobile missing optional fields

Accessibility tests:
- heading structure
- semantic summary lists
- keyboard action rail
- copy live-region feedback
- status labels visible
- contrast for critical and warning panels

## Content Checklist
Before implementation is accepted:
- Event ID is visible in header.
- Processing status copy matches backend enum.
- Event type copy matches backend enum.
- Provider reference is not sent to analytics.
- Raw payload does not appear.
- Signature material does not appear.
- Replay is not enabled.
- Missing returned row copy is non-authoritative.
- Manual-review explains the finance risk.
- Unmatched explains provider reference risk.
- Duplicate explains repeat-safe handling.
- Accepted pending explains that payment is not confirmed.

## Open Backend Gaps For Future Work
Not required for current detail:
- `GET /v1/admin/webhook-events/:eventId`
- raw payload redaction endpoint
- replay endpoint
- replay audit trail
- replay result history
- provider reference search
- payment-linked event lookup
- delivery-linked event lookup
- webhook processing dead-letter status
- direct engineering escalation endpoint

These gaps must not block the current read-only detail. The route remains useful as a normalized event evidence view when reached from the list or from cached returned rows.

## Final Screen Contract
`AdminWebhookEventDetail` is complete when it lets authorized finance and super admins inspect one normalized trusted MTN MoMo callback, understand the backend processing result, route unresolved payment signals to reconciliation or delivery review, and clearly communicate that replay and raw-payload access are unavailable until the backend exposes secured support.

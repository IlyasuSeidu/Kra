# Admin Notification Detail Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminNotificationDetail` |
| Route | `/admin/outbound-notifications/:outboundNotificationId` |
| Test id | `screen-admin-notification-detail` |
| Surface | Admin web console |
| Backend coverage | `admin_outbound_notifications` list read only; observes internal dispatch outcomes indirectly |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, or `super_admin` because backend uses issue-management scope |
| Required action role | None with current backend; future retry action requires explicit backend mutation and audit |
| Required states | `loading`, `ready`, `limited_context`, `failed`, `retrying`, `sent`, `dead_letter`, `not_found`, `retry_unavailable`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOutboundNotifications`, `AdminLaunchReadiness`, `AdminSlaBreachDashboard`, `AdminDeliveryDetail`, `AdminIssueDetail` |
| Related screens | `AdminOutboundNotifications`, `AdminDeliveryDetail`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminLaunchReadiness`, `AdminSettings`, `AdminExportReport` |

## Purpose
`AdminNotificationDetail` is the controlled inspection surface for one outbound receiver SMS record. It helps support and operations admins understand the notification status, delivery context, receiver event type, retry timing, attempts, last provider error, and safe next recovery route.

The screen should answer:
- `Which outbound notification is this?`
- `Which delivery and tracking code does it belong to?`
- `Which receiver event triggered it?`
- `Was the message sent, still waiting, retrying, failed, or dead-lettered?`
- `How many attempts have been made?`
- `When is the next automatic attempt due?`
- `What was the last safe provider error summary?`
- `Can an admin manually retry it today?`
- `Which delivery or support route should be opened next?`

This screen is not a message composer and not a provider console. It must not send SMS directly, expose provider secrets, reveal raw payloads, edit receiver phone numbers, or call the secured internal dispatch route from the browser.

## Strategic Role
Receiver communication failures are delivery failures in slow motion. A receiver who misses pickup readiness, out-for-delivery, failed-attempt, or completion communication can cause station backlog, repeat support contacts, and avoidable disputes. This detail screen gives admins enough evidence to decide whether to open the delivery, start support handling, wait for the next automatic retry, or escalate a dead-letter record.

## Backend Reality
The inventory defines:
```text
/admin/outbound-notifications/:outboundNotificationId
```

Current backend exposes only:
```http
GET /v1/admin/outbound-notifications
```

Operation:
```text
admin_outbound_notifications
```

Supported list query parameters:
- `status`
- `limit`

No endpoint exists for:
```http
GET /v1/admin/outbound-notifications/:outboundNotificationId
```

No admin endpoint exists for:
- manual retry
- cancel retry
- edit recipient
- full phone reveal
- provider delivery receipt lookup
- provider payload reveal
- single-record audit trail

Internal retry and dispatch route:
```http
POST /v1/internal/outbound-notifications/dispatch-due
```

Rules:
- secured by internal task secret
- processes due `pending` and `failed` records
- max receiver SMS attempts: `2`
- retry delay after failure: `30 minutes`
- final failed attempt becomes `dead_letter`
- not callable from frontend

Therefore:
- The detail screen loads from selected row context or a safe query cache.
- Direct route without context must show `limited_context` or `not_found`.
- Manual retry button must not be active today.
- The screen can show `retrying` as an automatic retry state, not a user-triggered action.

## Source References
External references used for this screen:
- [Hubtel API Documentation](https://docs-developers.hubtel.com/): supports provider context for SMS sending, status handling, recipient rules, and gateway response interpretation.
- [GOV.UK Notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports high-clarity warning and success messages for failed and dead-letter states.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/): supports structured key-value evidence review for one record.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports status announcements for route load, refresh, copy, and unavailable retry actions.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports masking sensitive values and not exposing secrets or raw provider payloads.

Local references:
- `docs/07-api/api-contracts.md`
- `docs/07-data/firestore-schema.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/34-admin-outbound-notifications.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/08-security/privacy-and-data-retention.md`

## Design Thesis
Design this as a communication incident card: compact, evidence-led, privacy-safe, and action-oriented. The user should immediately understand if they should wait for automatic retry, open the delivery, or escalate support because retry has stopped.

Visual direction:
- strong status header with notification id
- summary-list evidence block
- timeline-like attempt section using timestamps and attempt count
- masked recipient card
- provider error card with sanitized text
- retry limitation callout
- target route cards for delivery and outbox list

Restraint rule:
- No SMS composer, raw provider logs, delivery map, or manual provider controls.

## Product Principles
- Notification detail must protect receiver privacy.
- SMS status must not imply receiver read or delivery receipt unless provider receipt exists later.
- Manual retry cannot be built until backend exposes a safe admin retry mutation.
- Dead-letter records must guide support to the delivery, not leave admins stuck.
- Error detail must be useful but sanitized.
- The route must be honest when opened without selected row context.

## Entry Points
Preferred:
- `AdminOutboundNotifications` row action
- `AdminLaunchReadiness` receiver SMS blocker
- `AdminSlaBreachDashboard` receiver notification blocker
- `AdminDeliveryDetail` notification section
- `AdminIssueDetail` communication recovery link

Allowed but limited:
- direct URL `/admin/outbound-notifications/:outboundNotificationId`

If opened directly:
- validate id format
- show limited-context state if no selected row or query cache exists
- offer `Search outbound notifications`
- do not call a non-existing endpoint
- do not scan all recent rows repeatedly to find the id

## Required Route State
When opened from the list, pass or retain safe selected row context:
- outbound notification id
- status
- channel
- provider
- kind
- delivery id
- tracking code
- event type
- station name
- masked recipient phone
- attempt count
- max attempts
- next attempt time
- created time
- updated time
- last attempt time
- sent time
- safe last error summary
- source query context
- generated time

Do not pass:
- full phone number unless policy allows controlled reveal
- raw provider payload
- provider secret
- internal task secret
- SMS body
- raw gateway response

## Header
Header content:
- breadcrumb: `Admin / Outbound notifications / <outboundNotificationId>`
- eyebrow: `Receiver SMS`
- title: status-aware label
- subtitle: event type and delivery id
- notification id
- status tag
- generated time or source time

Header title by status:
- `pending`: `Queued receiver SMS`
- `failed`: `Receiver SMS retry scheduled`
- `dead_letter`: `Receiver SMS dead-lettered`
- `sent`: `Receiver SMS sent`

Header actions:
- `Back to outbox`
- `Open delivery`
- `Open issue queue`
- `Refresh context` if supported by list query cache

Do not show:
- `Retry now`
- `Send again`
- `Edit phone`
- `Delete`
- `Open provider payload`

## Status Model
Backend status to detail state:
- `pending` -> `queued`
- `failed` with `nextAttemptAt > now` -> `retrying`
- `failed` with `nextAttemptAt <= now` -> `failed_due`
- `dead_letter` -> `dead_letter`
- `sent` -> `sent`

Display labels:
- `Queued`
- `Retry scheduled`
- `Due for automatic retry`
- `Dead letter`
- `Sent`

Rules:
- `retrying` means automatic retry is scheduled or due, not that a user action is in progress.
- `sent` means the gateway send call succeeded, not that the receiver read the SMS.
- `dead_letter` means automatic retry stopped after max attempts.

## Evidence Summary
Use key-value layout.

Rows:
- `Notification ID`
- `Status`
- `Channel`
- `Provider`
- `Kind`
- `Delivery ID`
- `Tracking code`
- `Receiver event`
- `Station`
- `Recipient`
- `Attempts`
- `Next attempt`
- `Last attempt`
- `Sent at`
- `Created`
- `Updated`
- `Dedupe key state`

Rules:
- recipient is masked by default
- show `Not recorded` for absent optional fields
- show `Hidden` for intentionally redacted values
- show `No more automatic retries` for dead-letter next attempt
- show `Not sent yet` if `sentAt` absent
- do not show raw provider payload

## Recipient Panel
Default display:
```text
+233 24 *** 0000
```

Rules:
- full phone is not shown by default
- no copy phone action in v1
- no edit phone action in v1
- no analytics with full phone
- if future full reveal is added, it must require explicit permission, reason, and audit

Copy:
```text
Recipient phone is masked to protect receiver privacy.
```

## Delivery Context Panel
Fields:
- delivery id
- tracking code
- receiver event type
- station name
- route to delivery detail

Routes:
- delivery detail: `/admin/deliveries/:deliveryId`
- outbox filtered by delivery id: not supported by backend yet, so do not build as server filter
- issue queue: `/admin/issues?deliveryId=:deliveryId` if route supports query context

Rules:
- route to delivery only when `deliveryId` exists
- do not fetch full delivery by default unless product explicitly needs it
- do not show receiver address from this screen

## Event Type Meaning
Event type labels:
- `ready_for_pickup`: `Ready for pickup`
- `final_mile_assigned`: `Final-mile assigned`
- `out_for_delivery`: `Out for delivery`
- `failed_attempt`: `Failed attempt`
- `delivered`: `Delivered`

Detail meaning:
- `ready_for_pickup`: receiver should know station pickup is ready
- `final_mile_assigned`: receiver should know final-mile assignment exists
- `out_for_delivery`: receiver should expect doorstep attempt
- `failed_attempt`: receiver should know the attempt failed and next path
- `delivered`: receiver should receive completion communication

## Attempt Timeline
Show a compact attempt timeline.

Timeline facts:
- created time
- next attempt time
- last attempt time
- sent time when present
- attempt count
- max attempts
- last error if present

State copy:
- pending, no attempt: `Waiting for automatic dispatch`
- failed, retry future: `Automatic retry scheduled`
- failed, retry due: `Due for automatic retry`
- dead letter: `No more automatic retries`
- sent: `Gateway send succeeded`

Rules:
- do not show provider delivery receipt unless backend exposes it later
- do not show a manual retry control
- use exact timestamps on demand
- show relative times for quick scan

## Provider Error Panel
Show when `lastError` exists.

Allowed:
- error name
- error code
- sanitized short message
- last attempt time

Forbidden:
- stack trace
- provider authentication data
- raw response body
- raw request payload
- internal task secret
- full recipient phone

If message is long or suspicious:
```text
Provider error hidden
```

If no error:
```text
No provider error recorded.
```

## Retry Status Panel
Required for every status.

For `pending`:
```text
This message is queued for automatic dispatch.
```

For `failed` before next attempt:
```text
Automatic retry is scheduled. Manual retry is not available in the admin UI yet.
```

For `failed` due now:
```text
This record is due for the internal dispatch task. Manual retry is not available in the admin UI yet.
```

For `dead_letter`:
```text
Automatic retry stopped after the maximum attempts. Open the delivery or create support follow-up.
```

For `sent`:
```text
The gateway send call succeeded. This does not prove the receiver read the message.
```

Action guidance:
- `Open delivery`
- `Open issue queue`
- `Back to outbox`

## Retry Unavailable State
If the user expects a retry action, show an explicit disabled capability panel.

Title:
```text
Manual retry is not available yet
```

Body:
```text
The current backend only retries due pending and failed notifications through the secured internal dispatch task. A browser retry action requires a separate admin mutation and audit rule.
```

Actions:
- `Open delivery`
- `Back to outbox`
- `Open backend gap`

Do not render a disabled button without explanation.

## Backend Gap Panel
Current gaps:
- single notification read by outbound notification id
- admin manual retry mutation
- retry reason capture
- safe full-phone reveal workflow
- provider delivery receipt projection
- provider error allowlist
- notification audit events
- delivery id filter for outbox list
- cursor pagination

Copy:
```text
This detail screen can inspect selected outbox records, but direct lookup and manual retry need backend support.
```

## Source Context Panel
Show:
- source screen
- status filter used
- list generated time
- selected row context presence
- direct route limitation
- client fetched time

If selected row context exists:
```text
Loaded from selected outbound notification row.
```

If direct route has no context:
```text
This route cannot load one notification by ID yet because the backend exposes only list reads.
```

## Limited Context State
Use when route param is valid but no selected row context is available.

Title:
```text
Notification detail needs outbox context
```

Body:
```text
The backend can list outbound notifications by status, but it cannot fetch one notification by ID yet. Open this record from the outbound notifications list.
```

Actions:
- `Search outbound notifications`
- `Open launch readiness`
- `Back to admin overview`

Do not:
- call unsupported endpoint
- show stale details from another notification
- scan all recent lists repeatedly
- invent retry state

## Not Found State
Use when:
- route id format is invalid
- selected row id does not match route param
- selected row context is absent and product chooses not to show limited context

Title:
```text
Notification record not found
```

Body:
```text
This outbound notification could not be loaded from the current outbox context.
```

Actions:
- `Search outbound notifications`
- `Back to outbox`

## Loading State
Loading copy:
```text
Loading notification detail...
```

Rules:
- resolve selected row context quickly
- do not call unsupported single-record endpoint
- transition to limited context when row context is absent
- keep focus stable

## Error State
Use when a supported context restore or list-backed refetch fails.

Title:
```text
Notification detail could not load
```

Body:
```text
The selected notification context could not be restored. Search the outbox again or return to admin overview.
```

Actions:
- `Search outbound notifications`
- `Back to outbox`

If API error includes request id, show it.

## Authorization State
Title:
```text
You do not have access to this notification record
```

Body:
```text
Outbound notification detail is available to operations, support, and super admin roles.
```

Action:
- `Back to admin overview`

Do not show cached row data.

## Session Expired State
Title:
```text
Session expired
```

Body:
```text
Sign in again to continue reviewing notification detail.
```

Action:
- `Sign in`

Clear visible notification context.

## Layout
Desktop:
- left column with status header, evidence summary, attempt timeline, error panel
- right rail with recipient, delivery route, retry status, and backend gap

Tablet:
- evidence summary full width
- right rail sections stack below timeline

Mobile:
- status card first
- delivery and retry cards second
- evidence summary third
- error and backend gap after evidence
- no horizontal scroll

## Visual Components
Required components:
- admin shell
- breadcrumb
- status header
- evidence summary list
- recipient privacy card
- delivery context card
- attempt timeline
- provider error panel
- retry status panel
- retry unavailable panel
- source context panel
- backend gap panel
- limited context state
- not-found state
- live region

Do not create:
- SMS body editor
- full phone reveal
- provider payload viewer
- manual retry control
- delete control
- provider dashboard embed

## Interaction Details
Back to outbox:
- preserves previous status filter when route state exists
- otherwise opens `/admin/outbound-notifications`

Open delivery:
- opens `/admin/deliveries/:deliveryId`
- hidden if delivery id is absent

Open issue queue:
- opens delivery-scoped issue query if route supports it
- otherwise opens `/admin/issues`

Copy controls:
- copy notification id if allowed
- copy tracking code if allowed
- do not copy full phone
- do not copy error message by default

Live messages:
- `Notification detail loaded`
- `Notification detail needs outbox context`
- `Notification ID copied`
- `Tracking code copied`
- `Manual retry is not available yet`

## URL And State Rules
Route param:
- `outboundNotificationId`

Valid format:
```text
ONF-[A-Z0-9-]+
```

Rules:
- invalid format -> `not_found`
- valid format with matching selected row -> `ready`
- valid format without selected row -> `limited_context`
- selected row id must match route param exactly
- do not store selected row in local storage
- do not put phone or error message in URL params

## Data Model
Safe view model:
```ts
type AdminNotificationDetailView = {
  outboundNotificationId: string;
  status: "pending" | "sent" | "failed" | "dead_letter";
  statusLabel: string;
  channel: "sms";
  provider: "hubtel";
  kind: "receiver_delivery_sms";
  deliveryId: string;
  trackingCode: string;
  eventType:
    | "ready_for_pickup"
    | "final_mile_assigned"
    | "out_for_delivery"
    | "failed_attempt"
    | "delivered";
  stationName?: string;
  maskedRecipientPhone: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
  sentAt?: string;
  lastErrorSummary?: {
    name: string;
    code?: string;
    safeMessage: string;
  };
  retryState:
    | "queued"
    | "retry_scheduled"
    | "retry_due"
    | "dead_letter"
    | "sent";
  sourceContext: "selected_row" | "query_cache" | "direct_route_limited";
};
```

Rules:
- use masked phone, not raw phone, in presentational model
- sanitize last error before display
- do not include raw provider payload
- do not include dedupe key unless detail policy allows technical display

## Accessibility Requirements
Required:
- one `h1`
- breadcrumb before heading
- summary list labels visible
- status not color-only
- focus-visible styling
- keyboard access to route and copy actions
- polite live region
- no horizontal scroll on mobile
- reduced-motion support

Status text must include:
- `Queued`
- `Retry scheduled`
- `Due for automatic retry`
- `Dead letter`
- `Sent`

## Security And Privacy
Required:
- mask recipient phone
- no raw provider payload
- no provider secret
- no internal task secret
- no full phone in analytics
- no full phone in URL
- no full phone in page title
- no browser call to internal dispatch route
- no persistent client storage of notification row
- clear context on sign-out

## Analytics Events
Allowed:
- `admin_notification_detail_viewed`
- `admin_notification_detail_limited_context_seen`
- `admin_notification_detail_delivery_opened`
- `admin_notification_detail_issue_queue_opened`
- `admin_notification_detail_retry_unavailable_seen`
- `admin_notification_detail_back_to_outbox`
- `admin_notification_detail_id_copied`

Allowed fields:
- `actor_role`
- `status`
- `event_type`
- `attempt_count_bucket`
- `max_attempts`
- `retry_state`
- `has_last_error`
- `source_context`

Do not send:
- outbound notification id
- delivery id
- tracking code
- full phone
- dedupe key
- error message
- provider payload

## Test IDs
Root:
- `screen-admin-notification-detail`

Header:
- `admin-notification-detail-header`
- `admin-notification-detail-status`
- `admin-notification-detail-id`
- `admin-notification-detail-back-action`

Panels:
- `admin-notification-detail-summary`
- `admin-notification-detail-recipient`
- `admin-notification-detail-delivery`
- `admin-notification-detail-attempts`
- `admin-notification-detail-error`
- `admin-notification-detail-retry-status`
- `admin-notification-detail-retry-unavailable`
- `admin-notification-detail-source-context`
- `admin-notification-detail-backend-gap`

Actions:
- `admin-notification-detail-open-delivery`
- `admin-notification-detail-open-issue-queue`
- `admin-notification-detail-copy-id`
- `admin-notification-detail-copy-tracking`
- `admin-notification-detail-search-outbox`

States:
- `admin-notification-detail-limited-context-state`
- `admin-notification-detail-not-found-state`
- `admin-notification-detail-error-state`
- `admin-notification-detail-unauthorized-state`
- `admin-notification-detail-live-region`

## Acceptance Criteria
Functional:
- Renders `/admin/outbound-notifications/:outboundNotificationId`.
- Shows root test id.
- Validates route id format.
- Shows ready state from selected row context.
- Shows limited-context state on direct route without row context.
- Does not call unsupported single-record endpoint.
- Does not call internal dispatch endpoint.
- Shows status, delivery id, tracking code, event type, attempts, retry timing, and safe error summary.
- Masks recipient phone.
- Shows retry-unavailable explanation for failed and dead-letter records.
- Routes to delivery when available.
- Routes back to outbox.

Policy:
- Manual retry is not available until backend adds admin mutation.
- Automatic retry state follows backend rules.
- Dead-letter state guides support action.
- Sent state does not claim receiver read.
- Full phone is protected.

UX:
- Status is clear at first glance.
- Retry timing is easy to understand.
- Error summary is useful but sanitized.
- Direct-route limitation is explicit.
- Admin has a next route for every state.

Accessibility:
- Copy results are announced.
- Limited-context state is announced.
- Summary labels are visible.
- Status is not color-only.
- Mobile layout has no horizontal scroll.

Security:
- No raw provider payload.
- No provider secret.
- No internal task secret.
- No full phone by default.
- No sensitive analytics fields.

## QA Scenarios
Route states:
- open from outbox row with matching context
- direct route with valid id and no context
- invalid notification id
- mismatched selected row id
- session expired
- not authorized

Statuses:
- pending with no attempts
- failed with future retry
- failed due now
- dead letter after max attempts
- sent with `sentAt`
- sent without provider receipt

Fields:
- station name present
- station name absent
- last error absent
- last error with code
- long last error
- tracking code present
- masked phone display

Interactions:
- open delivery
- open issue queue
- copy notification id
- copy tracking code
- back to outbox preserves status filter
- retry unavailable panel appears

Accessibility:
- keyboard route actions
- keyboard copy actions
- live region copy result
- screen reader hears retry unavailable
- no color-only state

Security:
- raw phone absent from rendered text except masked form
- raw provider payload absent
- internal dispatch endpoint not called
- analytics excludes identifiers and error message

## Implementation Notes
Recommended sequence:
1. Add route shell and root test id.
2. Validate `outboundNotificationId`.
3. Resolve selected row context from router state or query cache.
4. Build safe view model with masked phone and sanitized error.
5. Render status header.
6. Render evidence summary, recipient, delivery, attempts, error, and retry status panels.
7. Add limited-context and not-found states.
8. Add copy controls and live region.
9. Add responsive layout.
10. Add tests.

Do not implement:
- manual retry
- SMS send
- internal dispatch call
- phone edit
- full phone reveal
- provider payload viewer
- notification deletion

## Test Plan
Unit tests:
- id format validation
- selected row match
- status label mapping
- retry state computation
- phone masking
- error sanitization
- event type labels
- safe view model creation
- route resolver

Component tests:
- ready state
- limited context
- not found
- pending state
- failed scheduled state
- failed due state
- dead-letter state
- sent state
- retry unavailable panel
- masked recipient panel

Integration tests:
- route renders root test id
- selected row context loads detail
- direct route does not call unsupported endpoint
- invalid id does not call backend
- delivery route action works
- outbox back route works
- no retry action rendered

Accessibility tests:
- axe desktop
- axe mobile
- keyboard route actions
- keyboard copy actions
- live region announcements
- no color-only status

Security tests:
- full phone not rendered
- provider payload not rendered
- error message sanitized
- analytics excludes identifiers
- internal route not called

## Open Backend Decisions
Not blockers for this controlled detail screen:
- Add single notification read by outbound notification id.
- Add admin manual retry mutation with reason and audit.
- Add safe full-phone reveal workflow with audit.
- Add provider delivery receipt projection.
- Add notification audit trail.
- Add delivery id query filter for outbox.
- Add provider error allowlist.

## Completion Standard
The screen is complete when:
- one outbound notification can be inspected safely from list context
- failed, retrying, sent, and dead-letter states are clear
- manual retry limitation is explicit
- recipient phone is protected
- delivery and support next routes are clear
- unsupported backend calls are not made
- accessibility, privacy, and security tests pass


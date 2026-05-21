# Admin Outbound Notifications Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminOutboundNotifications` |
| Route | `/admin/outbound-notifications` |
| Test id | `screen-admin-outbound-notifications` |
| Surface | Admin web console |
| Backend coverage | `admin_outbound_notifications`; observes `dispatch_due_outbound_notifications` results indirectly |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, or `super_admin` because backend uses issue-management scope |
| Required action role | None on this screen |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `queued`, `sent`, `failed`, `dead_letter`, `refreshing`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, `AdminLaunchReadiness`, `AdminSlaBreachDashboard`, `AdminDeliveryDetail`, `AdminIssueDetail` |
| Related screens | `AdminNotificationDetail`, `AdminAuditEvents`, `AdminDeliveryDetail`, `AdminIssueQueue`, `AdminLaunchReadiness`, `AdminSettings`, `AdminAnalytics`, `AdminExportReport` |

## Purpose
`AdminOutboundNotifications` is the admin monitoring surface for the receiver SMS outbox. It lets operations and support admins see pending, sent, failed, and dead-letter outbound notification records, identify receiver communication risk, inspect retry timing, and route to delivery or notification detail for recovery.

The screen should answer:
- `Are receiver delivery SMS messages moving?`
- `Which notifications are waiting for dispatch?`
- `Which notifications failed and when will they retry?`
- `Which notifications are dead-lettered after all attempts?`
- `Which delivery and tracking code does the message relate to?`
- `Which receiver event triggered the notification?`
- `What was the last delivery error?`
- `What should the admin open next?`
- `Is a manual retry supported by the current backend?`

This screen is a read-only outbox monitor. It must not send SMS directly, retry a notification, edit receiver phone numbers, change delivery state, reveal SMS provider secrets, or call the secured internal dispatch endpoint from the browser.

## Strategic Role
Delivery trust depends on receiver communication. In the Kra pilot, receiver SMS keeps people aware of pickup readiness, final-mile movement, failed attempts, and delivery completion. If outbound notifications silently fail, packages wait longer, support load increases, and customers lose confidence.

The screen must make communication failures visible without turning the admin console into a provider dashboard. The operating question is simple: which messages need attention, which are still retrying safely, and which delivery should support open?

## Audience
Primary users:
- operations admins monitoring delivery communication health
- support admins investigating receiver complaints
- super admins checking launch readiness blockers

Secondary users:
- engineering reviewers checking provider failure patterns
- QA reviewers validating outbox retry and dead-letter states
- product reviewers deciding whether a user-facing retry flow is needed

Non-users:
- senders
- receivers
- drivers
- station operators outside admin console
- final-mile couriers outside admin console
- public web visitors

## Backend Reality
Primary endpoint:
```http
GET /v1/admin/outbound-notifications
```

Operation:
```text
admin_outbound_notifications
```

Supported query parameters:
- `status`
- `limit`

Supported statuses:
- `pending`
- `sent`
- `failed`
- `dead_letter`

Limit:
- positive integer
- maximum `100`
- defaults to `100`

Auth behavior:
- route is admin-scoped
- backend requires issue-management scope
- accepted roles are `ops_admin`, `support_admin`, and `super_admin`
- `finance_admin` is not allowed by the current route guard

Response:
```json
{
  "generatedAt": "2026-05-16T15:00:00.000Z",
  "notifications": [
    {
      "outboundNotificationId": "ONF-9401",
      "channel": "sms",
      "provider": "hubtel",
      "kind": "receiver_delivery_sms",
      "status": "failed",
      "dedupeKey": "receiver-sms:DEL-9401:out_for_delivery",
      "deliveryId": "DEL-9401",
      "recipientPhone": "+233240000000",
      "trackingCode": "KRA-9401",
      "eventType": "out_for_delivery",
      "stationName": "Kumasi Adum",
      "attemptCount": 1,
      "maxAttempts": 2,
      "nextAttemptAt": "2026-05-16T15:30:00.000Z",
      "createdAt": "2026-05-16T15:00:00.000Z",
      "updatedAt": "2026-05-16T15:00:00.000Z",
      "lastAttemptAt": "2026-05-16T15:00:00.000Z",
      "lastError": {
        "name": "Error",
        "message": "Hubtel timeout"
      }
    }
  ]
}
```

Current backend limits:
- No single-notification read endpoint exists.
- No admin retry mutation exists.
- No admin cancel mutation exists.
- No admin edit-recipient mutation exists.
- No provider delivery receipt query is exposed to frontend.
- No cursor pagination exists.
- No server-side event type filter exists.
- No server-side delivery id filter exists.
- No server-side tracking code filter exists.
- No server-side provider error filter exists.
- No global outbox total is returned.

Internal dispatch route:
```http
POST /v1/internal/outbound-notifications/dispatch-due
```

Rules:
- secured by internal task secret
- not callable from frontend
- processes due `pending` and `failed` records
- sends through notification gateway
- marks result as `sent`, `failed`, or `dead_letter`
- failed records retry after 30 minutes
- receiver SMS max attempts is 2

Therefore:
- The admin list observes state, but does not dispatch.
- A retry button must not appear on this list.
- The detail screen may explain retry limitations, but must not call the internal task route.

## Source References
External references used for this screen:
- [Hubtel API Documentation](https://docs-developers.hubtel.com/): supports the provider context for SMS sending, delivery status lookup, recipient format, authentication, rate limits, and response status handling.
- [GOV.UK Notification banner](https://design-system.service.gov.uk/components/notification-banner/): supports clear status banners for failed or dead-letter communication states.
- [USWDS Table component](https://designsystem.digital.gov/components/table/): supports accessible operational tables with captions, sorting, and dense records.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, filtering, and result-count changes without unexpected focus movement.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports redacting sensitive values such as phone numbers, provider details, and error payloads in operational views.

Local references:
- `docs/07-api/api-contracts.md`
- `docs/07-data/firestore-schema.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/audit-trail-spec.md`

## Design Thesis
Design this as a calm communication control board: a queue-first operations table with strong status contrast, privacy-aware recipient display, and clear retry timing. It should feel like a service reliability board for customer messages, not a marketing campaign dashboard.

Visual direction:
- light operations console background
- status summary strip at the top
- table-first layout
- status tags with text and color
- time-to-next-attempt chips
- masked phone display
- delivery and tracking IDs in monospace
- dead-letter records visually serious but not noisy

Restraint rule:
- Do not add delivery maps, marketing charts, message composer fields, or manual send controls.

## Product Principles
- Failed receiver communication is an operational risk.
- Dead-letter records must be visible and actionable through delivery/support context.
- Retry state must be honest: automatic/internal only today.
- Phone numbers are sensitive and should be masked by default.
- Admin screens can show provider and error context, but not secrets.
- The list must never send or resend SMS.
- Every row should route to a useful investigation surface.
- Scope and freshness must be visible.

## Status Vocabulary
Backend status to UI label:
- `pending` -> `Queued`
- `failed` -> `Retry scheduled`
- `dead_letter` -> `Dead letter`
- `sent` -> `Sent`

Status meaning:
- `pending`: waiting for first dispatch or due dispatch
- `failed`: previous attempt failed and another retry may be due later
- `dead_letter`: max attempts reached and automatic retry stopped
- `sent`: message gateway accepted the send

Do not use:
- `delivered` unless a provider delivery receipt exists later
- `receiver read`
- `confirmed by receiver`
- `SMS guaranteed`

Provider send success is not the same as receiver reading the message.

## Information Architecture
Page regions in order:
- `Skip link`
- `Admin shell navigation`
- `Breadcrumb`
- `Page header`
- `Outbox health strip`
- `Critical dead-letter banner`
- `Backend query controls`
- `Returned-row filters`
- `Outbound notification table`
- `Mobile notification card list`
- `Retry limitations panel`
- `Source freshness panel`
- `Related routes`
- `Live region`

## Header
Header content:
- eyebrow: `Admin communications`
- title: `Outbound notifications`
- subtitle: `Monitor receiver SMS delivery records and communication recovery risk.`
- fetched time: `Updated <relative time>`
- source: `Hubtel SMS outbox records`
- status: `Read-only monitor`

Header actions:
- `Refresh`
- `Open launch readiness`
- `Open delivery explorer`

Do not show:
- `Send SMS`
- `Retry all`
- `Retry selected`
- `Edit recipient`
- `Delete notification`

## Outbox Health Strip
Required metrics:
- `Queued`
- `Retry scheduled`
- `Dead letter`
- `Sent`
- `Due now`
- `Max attempts reached`

Metric rules:
- metrics are computed from returned rows unless backend exposes totals later
- each metric shows `Returned-row scope`
- `Dead letter` uses critical treatment when count is greater than zero
- `Retry scheduled` uses amber treatment when count is greater than zero
- `Sent` uses neutral success treatment
- `Due now` is derived from `nextAttemptAt <= now` for `pending` or `failed`

Health strip copy:
```text
Counts are based on the returned notifications, not a global outbox total.
```

## Critical Dead-Letter Banner
Show when one or more returned rows have `dead_letter`.

Title:
```text
Receiver SMS delivery failed after retries
```

Body:
```text
Dead-lettered messages will not retry automatically. Open the delivery or notification detail to decide the next support action.
```

Actions:
- `Show dead letters`
- `Open launch readiness`

Do not include phone number in banner copy.

## Backend Query Controls
Supported backend controls:
- status
- limit

Status options:
- `All statuses`
- `Queued`
- `Retry scheduled`
- `Dead letter`
- `Sent`

Limit options:
- `25`
- `50`
- `100`

Rules:
- send only `status` and `limit`
- status value sent to backend must be one of `pending`, `failed`, `dead_letter`, `sent`
- `Queued` maps to `pending`
- `Retry scheduled` maps to `failed`
- changing backend query refetches data
- show active backend query chips
- do not send event type, delivery id, tracking code, provider error, phone, or date range as backend params

## Returned-Row Filters
Local filters run only over returned rows.

Fields:
- event type
- delivery id
- tracking code
- station name
- attempt state
- due now
- provider error text
- masked phone suffix

Rules:
- label controls as `Filter returned notifications`
- do not call backend for local filter changes
- safe search excludes full phone number by default
- result count updates through a live region
- clearing filters restores returned rows

Local search can include:
- outbound notification id
- delivery id
- tracking code
- event type
- station name
- status label
- error name
- error code

Local search should not include:
- full recipient phone
- full error message if it contains sensitive provider payload
- dedupe key unless admin role can view technical fields

## Notification Table
Desktop uses a real table.

Caption:
```text
Outbound receiver SMS records returned by the admin notification query.
```

Columns:
- `Status`
- `Event`
- `Delivery`
- `Recipient`
- `Attempts`
- `Next attempt`
- `Last attempt`
- `Last error`
- `Updated`
- `Follow-up`

Default sort:
- dead letter first
- failed due now second
- pending due now third
- failed future retry fourth
- pending future retry fifth
- sent last
- within each group, most recently updated first

Column rules:
- recipient phone is masked by default
- attempts show `attemptCount / maxAttempts`
- next attempt shows relative time and exact timestamp on demand
- last error is summarized, not dumped
- delivery id and tracking code are monospaced
- row action opens notification detail
- secondary action opens delivery detail

## Mobile Cards
Mobile card order:
- status and event type
- delivery and tracking code
- attempts and next attempt
- masked recipient
- last error summary
- updated time
- actions

Rules:
- no horizontal scroll
- no full phone number in card header
- dead-letter card shows support route prominently
- sent cards are visually calmer

## Row Anatomy
Each row must include:
- status tag
- outbound notification id
- channel
- provider
- kind
- delivery id
- tracking code
- event type
- masked recipient phone
- station name if present
- attempt count
- max attempts
- next attempt time
- created time
- updated time
- last attempt time if present
- sent time if present
- safe error summary if present
- route to detail
- route to delivery

Do not include:
- provider credentials
- full provider payload
- raw gateway response
- SMS content body unless backend exposes a safe preview later

## Recipient Privacy
The response includes `recipientPhone`; the UI must protect it.

Default display:
```text
+233 24 *** 0000
```

Rules:
- show full phone only in a controlled detail view if product policy allows it
- never include full phone in analytics
- never include full phone in page title
- never include full phone in toast text
- do not let local search require entering full phone
- if copy phone is later added, require explicit permission and audit

## Event Type Labels
Event type to UI label:
- `ready_for_pickup` -> `Ready for pickup`
- `final_mile_assigned` -> `Final-mile assigned`
- `out_for_delivery` -> `Out for delivery`
- `failed_attempt` -> `Failed attempt`
- `delivered` -> `Delivered`

Event copy:
- `ready_for_pickup`: receiver should know station pickup is ready
- `final_mile_assigned`: receiver should know courier assignment started
- `out_for_delivery`: receiver should expect doorstep attempt
- `failed_attempt`: receiver should know an attempt failed and next path
- `delivered`: receiver should know completion

## Retry Timing
Current backend retry rules:
- max attempts: `2`
- retry delay after failure: `30 minutes`
- `failed` records may retry when `nextAttemptAt <= now`
- `dead_letter` records do not retry automatically
- internal dispatch processes due records through secured internal route

UI rules:
- show `Due now` when `status` is `pending` or `failed` and `nextAttemptAt <= now`
- show `Retry scheduled` when `status` is `failed` and `nextAttemptAt > now`
- show `No more automatic retries` when `status` is `dead_letter`
- show `Sent at <time>` when `sentAt` exists
- do not show a retry button on this list

## Retry Limitations Panel
Required panel:

Title:
```text
Manual retry is not available on this screen
```

Body:
```text
The current backend retries due pending and failed SMS records through a secured internal dispatch task. Admin users can monitor and investigate, but cannot manually retry from the browser yet.
```

Actions:
- `Open notification detail`
- `Open delivery`
- `Open launch readiness`

Backend gap:
- Add admin-controlled retry endpoint if product approves manual notification recovery.

## Last Error Handling
Allowed display:
- error name
- error code if present
- short sanitized message
- last attempt time

Rules:
- truncate long error message
- do not show provider credentials
- do not show raw payload
- do not show stack traces
- do not send error message to analytics
- if message seems sensitive, show `Provider error hidden`

Examples:
- `Hubtel timeout`
- `Gateway unavailable`
- `Provider error hidden`
- `No error recorded`

## Delivery Routing
Primary delivery route:
```text
/admin/deliveries/:deliveryId
```

Rules:
- delivery route action label: `Open delivery <deliveryId>`
- notification detail route: `/admin/outbound-notifications/:outboundNotificationId`
- if delivery route is unavailable, show `Delivery route unavailable`
- if principal lacks access, target route handles authorization

## Detail Route
List row action:
```text
Open notification
```

Route:
```text
/admin/outbound-notifications/:outboundNotificationId
```

Because no single-notification endpoint exists yet:
- pass selected row context safely to detail route
- detail route should show limited state on direct load if no context exists
- list screen must not call a non-existing endpoint

## Source Freshness Panel
Show:
- endpoint
- generated time
- client fetched time
- backend status filter
- limit
- returned count
- visible count after local filters

Copy:
```text
The admin outbox list returns recent notification records. It does not include a global total or cursor yet.
```

## Empty State
Use when backend returns zero notifications for current status filter.

Title:
```text
No outbound notifications returned
```

Body:
```text
No receiver SMS records matched the current status filter.
```

Actions:
- `Show all statuses`
- `Refresh`
- `Open launch readiness`

Scope note:
```text
This does not prove the full outbox is empty outside the returned query scope.
```

## Filtered Empty State
Use when returned rows exist but local filters hide all of them.

Title:
```text
No returned notifications match these filters
```

Body:
```text
Clear returned-row filters or change the backend status filter.
```

Actions:
- `Clear returned-row filters`
- `Show all statuses`

## Loading State
Loading copy:
```text
Loading outbound notifications...
```

Structure:
- header skeleton
- health strip skeleton
- table skeleton with stable row height

Rules:
- do not show stale counts as current
- keep focus stable
- announce loading through `role="status"`

## Refreshing State
Refresh behavior:
- keeps current backend query and local filters
- refetches list
- keeps existing rows visible while refreshing
- announces refreshed count after success
- shows non-blocking banner after refresh failure

Success:
```text
Outbound notifications refreshed. Showing 42 returned records.
```

Failure:
```text
Outbound notifications could not refresh. Existing rows may be stale.
```

## Error State
Full-page error appears when initial load fails.

Title:
```text
Outbound notifications could not load
```

Body:
```text
The admin notification outbox did not return records. Retry or open launch readiness if receiver SMS health is blocking operations.
```

Actions:
- `Retry`
- `Open launch readiness`
- `Back to admin overview`

If API error includes request id, show it.

## Authorization State
Title:
```text
You do not have access to outbound notifications
```

Body:
```text
Outbound notification monitoring is available to operations, support, and super admin roles.
```

Action:
- `Back to admin overview`

Do not show cached rows.

## Session Expired State
Title:
```text
Session expired
```

Body:
```text
Sign in again to continue monitoring outbound notifications.
```

Action:
- `Sign in`

Clear visible rows.

## State Machine
States:
- `loading`: initial list request active
- `ready`: returned rows visible
- `empty`: backend returned zero rows
- `filtered_empty`: local filters hide all returned rows
- `queued`: status filter or row group for pending records
- `sent`: status filter or row group for sent records
- `failed`: status filter or row group for failed records
- `dead_letter`: status filter or row group for dead-letter records
- `refreshing`: refetch active
- `not_authorized`: route guard rejects role
- `session_expired`: auth invalid
- `api_error`: initial request failed

Transitions:
- `loading -> ready` when rows return
- `loading -> empty` when no rows return
- `loading -> api_error` when initial request fails
- `ready -> filtered_empty` when local filters hide all rows
- `filtered_empty -> ready` when local filters clear
- `ready -> refreshing` when refresh starts
- `refreshing -> ready` when refresh succeeds
- any state -> `not_authorized` on forbidden response
- any state -> `session_expired` on auth expiration

## URL State
Persist backend query:
- `status`
- `limit`

Optional local filters:
- `eventType`
- `deliveryId`
- `trackingCode`
- `station`
- `due`

Rules:
- ignore unsupported URL params
- do not pass unsupported params to backend
- do not store full phone in URL
- do not store error message in URL

## Analytics Events
Allowed:
- `admin_outbound_notifications_viewed`
- `admin_outbound_notifications_query_changed`
- `admin_outbound_notifications_refreshed`
- `admin_outbound_notifications_refresh_failed`
- `admin_outbound_notifications_filter_changed`
- `admin_outbound_notification_opened`
- `admin_outbound_notification_delivery_opened`
- `admin_outbound_notifications_dead_letter_seen`
- `admin_outbound_notifications_retry_limitation_seen`

Allowed fields:
- `actor_role`
- `status_filter`
- `limit`
- `returned_count_bucket`
- `visible_count_bucket`
- `dead_letter_count_bucket`
- `failed_count_bucket`
- `event_type`
- `due_now`
- `has_last_error`

Do not send:
- outbound notification id
- delivery id
- tracking code
- recipient phone
- dedupe key
- last error message
- provider payload

## Permissions
Backend route allows:
- `ops_admin`
- `support_admin`
- `super_admin`

Recommended product visibility:
- `ops_admin`: full operational outbox monitoring
- `support_admin`: full support recovery monitoring
- `super_admin`: full monitoring
- `finance_admin`: hidden or forbidden

No mutation is available on this screen.

## Security And Privacy
Required:
- mask recipient phone
- do not render provider credentials
- do not render raw provider payloads
- do not render internal task secret
- do not call internal dispatch endpoint from frontend
- do not expose full dedupe key to analytics
- do not persist rows in browser storage
- clear rows on sign-out
- do not show full phone in page title, toast, analytics, or URL

## Accessibility Requirements
Required:
- one `h1`
- breadcrumb before heading
- table caption
- real table headers on desktop
- visible labels on mobile cards
- keyboard-accessible filters and row actions
- focus-visible styling
- polite live region for refresh and filter result count
- no color-only status
- clear field labels and hints
- reduced-motion support

Live messages:
- `Loading outbound notifications`
- `Showing 100 returned notifications`
- `Showing 12 notifications after returned-row filters`
- `Outbound notifications refreshed`
- `Dead-letter filter applied`

## Responsive Behavior
Desktop:
- health strip across top
- backend controls in compact row
- table with all columns

Tablet:
- health strip wraps
- table hides last error message behind row expansion if needed
- filters stack into two rows

Mobile:
- cards replace table
- status and delivery remain at top
- recipient is masked
- actions remain at bottom
- no horizontal scroll

## Performance Requirements
Targets:
- route shell visible quickly
- local filters under 100 ms for 100 rows
- refresh without clearing rows
- no detail fetch for every row
- no user or delivery fetch for every row on initial list

Data behavior:
- request maximum 100 rows only
- use backend status filter when selected
- local filters operate on returned rows
- avoid repeated refresh loops
- do not auto-refresh faster than product-approved interval

## Component Inventory
Components:
- `AdminOutboundNotificationsPage`
- `OutboundNotificationsHeader`
- `OutboxHealthStrip`
- `DeadLetterBanner`
- `OutboundNotificationQueryControls`
- `OutboundNotificationReturnedFilters`
- `OutboundNotificationTable`
- `OutboundNotificationMobileCards`
- `OutboundNotificationStatusTag`
- `RecipientPhoneMask`
- `AttemptProgress`
- `NextAttemptChip`
- `LastErrorSummary`
- `RetryLimitationsPanel`
- `SourceFreshnessPanel`
- `OutboundNotificationEmptyState`
- `OutboundNotificationFilteredEmptyState`
- `OutboundNotificationErrorState`
- `OutboundNotificationLiveRegion`

## Test IDs
Root:
- `screen-admin-outbound-notifications`

Header:
- `admin-outbound-notifications-header`
- `admin-outbound-notifications-refresh-action`
- `admin-outbound-notifications-updated-at`

Health:
- `admin-outbound-notifications-queued-count`
- `admin-outbound-notifications-failed-count`
- `admin-outbound-notifications-dead-letter-count`
- `admin-outbound-notifications-sent-count`
- `admin-outbound-notifications-due-now-count`

Query:
- `admin-outbound-notifications-status-filter`
- `admin-outbound-notifications-limit-select`
- `admin-outbound-notifications-query-submit`

Filters:
- `admin-outbound-notifications-returned-filters`
- `admin-outbound-notifications-event-type-filter`
- `admin-outbound-notifications-delivery-filter`
- `admin-outbound-notifications-tracking-filter`
- `admin-outbound-notifications-station-filter`
- `admin-outbound-notifications-due-filter`
- `admin-outbound-notifications-clear-filters`

Table:
- `admin-outbound-notifications-table`
- `admin-outbound-notifications-row`
- `admin-outbound-notifications-status`
- `admin-outbound-notifications-recipient`
- `admin-outbound-notifications-attempts`
- `admin-outbound-notifications-next-attempt`
- `admin-outbound-notifications-last-error`
- `admin-outbound-notifications-open-detail`
- `admin-outbound-notifications-open-delivery`

States:
- `admin-outbound-notifications-dead-letter-banner`
- `admin-outbound-notifications-retry-limitation`
- `admin-outbound-notifications-empty-state`
- `admin-outbound-notifications-filtered-empty-state`
- `admin-outbound-notifications-error-state`
- `admin-outbound-notifications-unauthorized-state`
- `admin-outbound-notifications-live-region`

## Acceptance Criteria
Functional:
- Renders `/admin/outbound-notifications`.
- Shows root test id.
- Calls `admin_outbound_notifications` with only `status` and `limit`.
- Supports status filter for pending, failed, dead letter, and sent.
- Shows generated time.
- Shows returned-row scope.
- Masks recipient phone.
- Shows attempt count and max attempts.
- Shows next attempt timing.
- Shows last error summary safely.
- Routes to notification detail with selected row context.
- Routes to delivery detail.
- Does not show retry action on list.
- Does not call internal dispatch route.

Policy:
- Dead-letter status copy matches global error copy.
- Receiver communication failures are visible.
- Phone numbers are protected.
- Internal task route remains server-only.
- The screen does not claim SMS delivery receipt unless provider receipt exists later.

UX:
- Dead letters are prominent.
- Failed messages show retry timing.
- Sent messages are visually calm.
- Empty state does not overclaim global outbox state.
- Manual retry limitation is explicit.

Accessibility:
- Result counts and refresh are announced.
- Table has caption and headers.
- Mobile cards preserve labels.
- Status is not color-only.
- Keyboard can operate filters and row actions.

Security:
- Full phone not shown by default.
- No provider secrets.
- No raw provider payloads.
- No internal task secret.
- No sensitive analytics fields.

## QA Scenarios
Backend query:
- all statuses, default limit
- status `pending`
- status `failed`
- status `dead_letter`
- status `sent`
- limit 25
- limit 50
- limit 100
- unsupported URL params ignored

Rows:
- pending due now
- pending future
- failed due now
- failed future retry
- dead letter after max attempts
- sent with `sentAt`
- row without `stationName`
- row without `lastError`
- row with error code
- long error message

Privacy:
- recipient phone is masked
- full phone not in analytics
- full phone not in URL
- full phone not in toast
- provider payload not shown

States:
- loading
- ready
- empty
- filtered empty
- refresh success
- refresh failure with old rows
- not authorized
- session expired
- initial API error

Routing:
- open notification detail
- open delivery detail
- detail route gets safe selected row context
- direct detail route handles missing context later

Accessibility:
- keyboard filter path
- keyboard row action path
- screen reader hears refresh result
- screen reader hears filtered count
- no color-only status

## Implementation Notes
Recommended sequence:
1. Add route shell and root test id.
2. Wire `useAdminOutboundNotificationsQuery`.
3. Add status and limit backend query controls.
4. Add health strip from returned rows.
5. Add dead-letter banner.
6. Add table and mobile cards.
7. Add phone masking utility.
8. Add retry timing helper.
9. Add safe error summary helper.
10. Add returned-row local filters.
11. Add retry limitations panel.
12. Add empty, filtered-empty, error, authorization, and session states.
13. Add analytics without sensitive fields.
14. Add tests.

Do not implement:
- browser SMS send
- manual retry
- internal dispatch call
- full phone reveal
- provider payload viewer
- recipient edit
- notification deletion

## Test Plan
Unit tests:
- status label mapping
- backend query builder
- unsupported param guard
- phone masking
- due-now computation
- attempt state computation
- safe error summary
- health strip counts
- default sort order
- local filter behavior

Component tests:
- loading state
- ready state
- dead-letter banner
- table rendering
- mobile cards
- retry limitations panel
- empty state
- filtered-empty state
- error state
- unauthorized state

Integration tests:
- route renders root test id
- status query sends supported param
- local filters do not call backend
- row opens detail route with safe context
- delivery route action works
- no retry button rendered

Accessibility tests:
- axe desktop
- axe mobile
- keyboard filters
- keyboard row actions
- live region refresh announcement
- status not color-only

Security tests:
- full recipient phone not rendered in list
- provider payload not rendered
- internal task route not called
- analytics excludes phone, delivery id, tracking code, and error message

## Open Backend Decisions
Not blockers for this read-only screen:
- Add single-notification read endpoint by outbound notification id.
- Add admin retry endpoint if product approves manual retry.
- Add delivery id filter.
- Add event type filter.
- Add cursor pagination.
- Add global counts by status.
- Add provider delivery receipt projection.
- Add safe full-recipient reveal workflow with audit.
- Add controlled export for dead-letter operations review.

## Completion Standard
The screen is complete when:
- admins can see receiver SMS outbox health quickly
- dead-letter records are impossible to miss
- failed records show retry timing
- recipient phone is protected
- every row routes to notification detail and delivery context where allowed
- unsupported retry is not implemented
- source scope and freshness are clear
- accessibility, privacy, and test requirements pass


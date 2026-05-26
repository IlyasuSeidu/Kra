# Admin Audit Events Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID            | `AdminAuditEvents`                                                                                                                                                                                                                                                                             |
| Route                | `/admin/audit-events`                                                                                                                                                                                                                                                                          |
| Primary test ID      | `screen-admin-audit-events`                                                                                                                                                                                                                                                                    |
| Surface              | Admin web console                                                                                                                                                                                                                                                                              |
| Backend coverage     | `admin_audit_events`                                                                                                                                                                                                                                                                           |
| Offline critical     | No                                                                                                                                                                                                                                                                                             |
| Required read role   | Any authenticated admin principal accepted by backend admin guard; product may narrow by role later                                                                                                                                                                                            |
| Required action role | None                                                                                                                                                                                                                                                                                           |
| Required states      | `loading`, `ready`, `empty`, `filtered_empty`, `detail_route_limited`, `metadata_redacted`, `refreshing`, `not_authorized`, `session_expired`, `api_error`                                                                                                                                     |
| Parent screens       | `AdminOverview`, `AdminStaffActivityLog`, `AdminDeliveryDetail`, `AdminIssueDetail`, `AdminPaymentReconciliationDetail`, `AdminRefundEvidenceReview`, `AdminSlaBreachDashboard`                                                                                                                |
| Related screens      | `AdminAuditEventDetail`, `AdminStaffActivityLog`, `AdminUsers`, `AdminUserDetail`, `AdminDeliveryExplorer`, `AdminDeliveryDetail`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminWebhookEvents`, `AdminOutboundNotifications` |

## Purpose

`AdminAuditEvents` is the full admin audit-history search surface for privileged and operational backend actions. It lets authorized admins search recent audit events, inspect who acted, what operation ran, which target object was affected, which request id ties the event to backend logs, and where to go next for investigation.

The screen should answer:

- `Which privileged or operational actions happened recently?`
- `Who performed the action?`
- `Which role and station context were used?`
- `What exact backend action key was recorded?`
- `Which request id connects the UI event to backend logs?`
- `Which delivery, payment, issue, or tracking object was affected?`
- `What filters were sent to backend and what filters are only local?`
- `What metadata is intentionally hidden for privacy and security?`
- `Where can an admin open the related delivery, issue, payment, tracking, or event detail?`

This screen is a read-only ledger. It must not delete audit events, edit event content, add annotations, replay actions, export raw event bodies, or reveal sensitive metadata. Audit history is evidence; the UI must preserve trust by never making it look editable.

## Strategic Role

Kra cannot build a high-trust delivery network without strong operational accountability. Packages move through many hands, refunds involve money, and station or admin overrides can affect customer trust quickly. The audit console is the source for after-action review, dispute support, privilege review, and early security investigation.

The interface must be more disciplined than a generic activity feed:

- event records are immutable from the user perspective
- filters are explicit about backend scope
- returned-row scope is always visible
- raw metadata is not rendered by default
- target routes help admins investigate without copying identifiers into other tools
- the screen is useful even when the backend has not yet exposed deep search

## Audience

Primary users:

- super admins reviewing privileged actions
- operations admins investigating delivery, station, and custody actions
- finance admins tracing payment and refund decisions
- support admins tracing issue escalation and resolution
- security reviewers checking unusual operational patterns

Secondary users:

- engineering leads matching request IDs to server logs
- QA reviewers validating audit coverage
- product reviewers checking where backend audit query gaps remain

Non-users:

- public visitors
- senders
- receivers
- drivers
- station operators outside the admin console
- final-mile couriers outside the admin console

## Backend Reality

The current endpoint is concrete:

```http
GET /v1/admin/audit-events
```

Operation:

```text
admin_audit_events
```

Auth behavior:

- The API route is admin-scoped.
- Backend calls the admin principal guard.
- The current route does not require a named capability beyond admin access.
- The frontend must still apply product-level navigation visibility by role.

Supported query parameters:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Query rules:

- `actorId` must be a valid user id.
- `targetType` must be one of `delivery`, `payment`, `issue`, or `tracking`.
- `targetId` must be a trimmed string from `3` to `120` characters.
- `limit` must be positive and no more than `100`.
- Default limit is `50`.

Response:

```json
{
  "events": [
    {
      "eventId": "AUD-9501",
      "requestId": "REQ-9501",
      "action": "assign_driver",
      "actorId": "USR-OPS-001",
      "actorRole": "station_operator",
      "occurredAt": "2026-05-16T15:05:00.000Z",
      "stationId": "ST-ACC-01",
      "targetType": "delivery",
      "targetId": "DEL-9501",
      "metadata": {
        "responseStatusCode": 200
      }
    }
  ]
}
```

Current backend limits:

- No `generatedAt` field is returned.
- No total event count is returned.
- No cursor or page token is returned.
- No server-side date range filter exists.
- No server-side action filter exists.
- No server-side actor role filter exists.
- No server-side station filter exists.
- No server-side metadata search exists.
- No single event read endpoint exists for `/v1/admin/audit-events/:eventId`.
- No raw export endpoint exists.
- Target filtering is most precise when both `targetType` and `targetId` are present.
- `targetType` supports only `delivery`, `payment`, `issue`, and `tracking`.

Therefore:

- The screen must send only supported query parameters.
- The screen must call local-only filters `returned-event filters`.
- The screen must not imply that it searches all historical audit records.
- The screen must show returned count, visible count, and limit.
- The screen must label single-event detail as limited until a backend single-event read exists.

## Source References

External references used for this screen:

- [NIST SP 800-92, Guide to Computer Security Log Management](https://csrc.nist.gov/pubs/sp/800/92/final): supports formal log management, review, retention, and operational process.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports security event logging, request correlation, sanitization, and excluding sensitive data from logs and log views.
- [USWDS Table component](https://designsystem.digital.gov/components/table/): supports accessible tabular records for dense operational data.
- [GOV.UK Design System search guidance](https://design-system.service.gov.uk/components/search/): supports explicit search controls and clear search behavior.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, filter, sort, and result-count changes without moving focus.

Local references:

- `docs/08-security/audit-trail-spec.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/authorization-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-data/firestore-schema.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/20-admin-staff-activity-log.md`

## Design Thesis

Design this as a secure operations ledger: precise, quiet, searchable, and evidence-first. It should look like a professional command console for accountability, not a social activity stream.

Visual direction:

- light stone or cool gray workspace
- strong table grid with generous row height
- monospaced IDs for event, request, actor, station, and target values
- subtle severity or attention tags only for failed or unusual response status
- filter bar that distinguishes backend query fields from local returned-row filters
- detail drawer that explains redaction rather than exposing raw payloads
- no avatars, decorative icons, or charts

Restraint rule:

- If a visual element does not help locate, verify, or route an audit event, remove it.

## Product Principles

- Audit events are evidence, not editable content.
- The UI must not create a second source of truth.
- Query scope must be visible at all times.
- Redaction must be deliberate and explainable.
- Request id is a first-class investigation field.
- Local filters must never masquerade as backend search.
- Unknown action keys must still render safely.
- Missing target data must be shown as absence, not inferred from metadata.
- Every route out must preserve least-privilege access rules.

## Relationship To Staff Activity Log

`AdminStaffActivityLog` is a staff-focused operational activity view. `AdminAuditEvents` is the broader audit-history search console.

Differences:

- `AdminStaffActivityLog` emphasizes staff activity scanning and safe summaries.
- `AdminAuditEvents` emphasizes audit event identifiers, request correlation, target investigation, metadata redaction state, and search scope.
- `AdminAuditEvents` should be the canonical route when another screen says `Open audit events`.
- Both screens use the same backend endpoint and must share filter and redaction utilities.

Shared utilities:

- audit event query builder
- safe metadata classifier
- action label formatter
- target route resolver
- actor route resolver
- returned-row scope copy
- audit table columns where appropriate

## Information Architecture

Page regions in order:

- `Skip link`
- `Admin shell navigation`
- `Breadcrumb`
- `Page header`
- `Audit scope summary`
- `Backend query form`
- `Returned-event filter bar`
- `Audit event table`
- `Mobile event card list`
- `Event evidence drawer`
- `Redaction and retention notice`
- `Backend gap panel`
- `Related investigation routes`
- `Live region`

## Header

Header content:

- eyebrow: `Admin audit`
- title: `Audit events`
- subtitle: `Search recent privileged and operational events by actor or target.`
- status text: `Read-only audit ledger`
- refresh action: `Refresh events`
- fetched timestamp: `Fetched <relative time>`

Header actions:

- `Open staff activity`
- `Open export report` only if controlled export exists later
- `Open audit trail policy`

Do not show:

- `Create event`
- `Delete event`
- `Edit event`
- raw export action
- replay action

## Audit Scope Summary

The summary strip explains what the user is viewing.

Required metrics:

- `Returned events`
- `Visible after filters`
- `Unique actors`
- `Targeted events`
- `Events with station`
- `Metadata hidden`
- `Limit`

Metric rules:

- All metrics are computed from returned rows only.
- Summary must show `Returned-row scope`.
- If backend query filters are active, show them as chips.
- If no backend query filters are active, show `Recent events, limit <n>`.
- Do not show global audit total.
- Do not show retention totals.

Summary copy:

```text
This view shows returned audit events only. Backend supports actor and target filters, not full historical search yet.
```

## Backend Query Form

This form sends supported backend parameters.

Fields:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Labels:

- `Actor user ID`
- `Target type`
- `Target ID`
- `Returned event limit`

Limit options:

- `25`
- `50`
- `100`

Validation:

- actor id must match user id shape before submit
- target type must be one of supported enum values
- target id must be 3 to 120 characters after trim
- limit must be one of approved options

Behavior:

- Submit calls `admin_audit_events`.
- Reset clears backend query fields and returns to recent events.
- If `targetId` is entered without `targetType`, show an inline warning that backend target search requires target type for precise lookup.
- If `targetType` is selected without `targetId`, show that results may be returned-row scoped after backend load.
- Do not send date range, action, station, actor role, request id, or metadata query parameters.

Validation copy:

- `Enter a valid actor user ID.`
- `Choose a supported target type.`
- `Target ID must be 3 to 120 characters.`
- `Choose a returned event limit.`

## Returned-Event Filter Bar

Local filters run only over returned rows.

Fields:

- safe search
- action key
- actor role
- station id
- target type
- response status group
- time window over returned rows
- metadata state

Safe search includes:

- event id
- request id
- action
- actor id
- actor role
- station id
- target type
- target id

Safe search excludes:

- raw metadata
- request body
- fingerprint body
- proof asset references
- phone numbers
- names and addresses
- provider secrets
- tokens

Filter behavior:

- changing local filters does not call backend
- local filter labels must say `Filter returned events`
- visible count updates immediately
- result count is announced through a polite live region
- clearing local filters restores all returned rows

Do not persist local filter text beyond the session unless product privacy review approves it.

## Event Table

Desktop uses a real table.

Caption:

```text
Audit events returned by admin audit query. Sorted by occurred time descending.
```

Columns:

- `Occurred`
- `Action`
- `Actor`
- `Role`
- `Station`
- `Target`
- `Request`
- `Metadata`
- `Follow-up`

Column behavior:

- `Occurred` sorts by timestamp.
- `Action` sorts by action key.
- `Actor` sorts by actor id.
- `Role` sorts by actor role.
- `Station` sorts by station id with missing values last.
- `Target` sorts by target type then target id.
- `Request` sorts by request id.
- `Metadata` sorts by redaction state or response status if present.

Default sort:

- occurred time descending

Table rules:

- Use readable timestamps with full ISO timestamp available on demand.
- Use monospaced IDs.
- Show target type and target id together.
- Show `No target recorded` when target fields are absent.
- Show `No station recorded` when station id is absent.
- Do not render raw metadata column content.
- Row action buttons must be explicit.
- Do not make entire row the only interactive target.

## Mobile Event Cards

Mobile uses stacked cards, not horizontal table scroll.

Card order:

- action label and occurred time
- event id and request id
- actor role and actor id
- target type and target id
- station id if present
- metadata redaction state
- follow-up actions

Mobile rules:

- Each value has a visible label.
- Row actions remain thumb reachable.
- Long IDs can wrap or use copy controls if product allows.
- No raw metadata expands on mobile.
- Filter sheet restores focus to the opening control after close.

## Action Labeling

Action labels must be readable while preserving backend truth.

Display pattern:

```text
Readable label
action_key
```

Known action labels:

- `create_delivery`: `Delivery created`
- `confirm_origin_intake`: `Origin intake confirmed`
- `assign_driver`: `Driver assigned`
- `confirm_dispatch`: `Dispatch confirmed`
- `confirm_destination_receipt`: `Destination receipt confirmed`
- `assign_final_mile`: `Final-mile assignment created`
- `complete_delivery`: `Delivery completed`
- `create_issue`: `Issue created`
- `escalate_issue`: `Issue escalated`
- `resolve_issue`: `Issue resolved`
- `refund_payment`: `Refund approved`
- `settle_refund_payment`: `Refund settled`
- `admin_update_user_access`: `User access updated`
- `admin_update_station_status`: `Station status updated`
- `admin_update_station_validation`: `Station validation updated`
- `admin_update_pricing_rules`: `Pricing rules updated`

Unknown action rule:

- Show the raw action key as the primary label.
- Add `Unrecognized action key` in secondary text.
- Do not hide the event.

## Metadata Handling

Metadata is security-sensitive and must be summarized, not dumped.

Allowed display:

- `Metadata hidden`
- `Metadata absent`
- `Response status <code>` if `metadata.responseStatusCode` is present and numeric
- `Fingerprint present` without rendering fingerprint contents
- `Technical details available in controlled detail view` when detail route exists

Never display:

- raw metadata object
- fingerprint body
- request body
- phone number
- address
- proof storage URL
- proof asset raw link
- provider secret
- provider full payload
- token
- credential
- private note text
- local device path

If metadata contains unknown keys:

- show `Additional metadata hidden`
- keep raw object out of DOM text
- do not copy unknown values into analytics

If a future controlled detail view displays redacted metadata:

- it must maintain an allowlist
- it must not reveal secrets
- it must show redaction reasons
- it must record view analytics without storing raw metadata

## Event Evidence Drawer

The list screen may include a lightweight evidence drawer for each row.

Drawer sections:

- `Event identity`
- `Actor`
- `Target`
- `Request correlation`
- `Metadata summary`
- `Follow-up routes`
- `Backend query context`

Drawer content:

- event id
- request id
- occurred time
- action key
- actor id
- actor role
- station id when present
- target type and target id when present
- redaction state
- source query used to retrieve event

Drawer rules:

- no raw metadata
- no mutation actions
- no export
- no replay
- detail route link only if route exists
- if detail route cannot fetch by event id yet, show `Detail route depends on returned event context until single-event read exists.`

## Detail Route Limitation

The inventory includes `AdminAuditEventDetail` at `/admin/audit-events/:eventId`, but the backend currently exposes only list reads.

List screen behavior:

- If the app has a selected returned row, it may route to `/admin/audit-events/:eventId` with safe row context.
- If row context cannot be preserved, the detail screen must show a not-found or limited state until a single-event read exists.
- The list screen must not call a non-existing endpoint.
- The list screen must not try to fetch all events to locate one event id.

Required copy:

```text
Single-event audit lookup is not available yet. Event detail can use the row you opened from this list.
```

## Target Routing

Target routes:

- `delivery` target -> `/admin/deliveries/:targetId`
- `payment` target -> `/admin/finance/reconciliation/:targetId` when target id is a payment id and role can open finance
- `issue` target -> `/admin/issues/:targetId`
- `tracking` target -> no default route unless an internal tracking route exists later

Rules:

- Do not parse target from metadata.
- Do not guess payment id from provider reference.
- Do not route to finance detail for non-finance roles unless allowed by product authorization.
- If target route is unavailable, show `No target route`.
- If target fields are missing, show `No target recorded`.

## Actor Routing

Actor route:

- `/admin/users/:actorId` when admin user detail route exists and principal can open user management

Rules:

- Do not fetch all user records just to decorate rows.
- Do not show actor full name unless fetched through an allowed user endpoint.
- Do not show actor email unless product policy allows it.
- If actor route is unavailable, show actor id as text.

## Request Correlation

Request id is important for backend trace lookup.

Display:

- show request id in table
- allow copy request id if product allows copy controls
- copy only the visible request id
- include `Request id` in accessible name

Rules:

- Do not claim request id alone proves success.
- Use metadata response status if present for response outcome.
- If response status is absent, show `Response status not recorded`.

## Response Status Grouping

If `metadata.responseStatusCode` is present:

- 200 to 299 -> `Successful response`
- 300 to 399 -> `Redirect response`
- 400 to 499 -> `Client error response`
- 500 to 599 -> `Server error response`
- unknown numeric range -> `Unknown response status`

If absent:

- `Response status not recorded`

Style:

- successful response uses neutral or success tag
- client and server error responses use attention tag
- redirect and unknown use neutral tag

Do not infer business outcome beyond action key and response status.

## Redaction And Retention Notice

Required notice near the table footer:

```text
Audit metadata is hidden on this screen. Kra keeps audit history for accountability and dispute review according to retention policy.
```

Supporting bullets:

- delivery and handoff audit events: `24 months`
- payment and refund audit events: `36 months`
- proof-reference access events: `12 months`
- admin override events: `36 months`

Do not render raw proof URLs or customer-facing private details.

## Backend Gap Panel

Show a compact backend-gap panel because the current audit query is limited.

Current gaps:

- single-event read by event id
- server-side date range
- server-side action filter
- server-side actor role filter
- server-side station filter
- server-side request id lookup
- cursor pagination
- total count
- safe audit export endpoint
- metadata allowlist projection
- retention-state field

Panel copy:

```text
Current backend audit search is limited to actor, target, and returned-event limit. Other filters apply only to returned rows.
```

Do not block the screen on these gaps.

## Empty State

Empty appears when backend returns zero events.

Title:

```text
No audit events returned
```

Body:

```text
No events matched the current backend query. Clear filters or search by a different actor or target.
```

Actions:

- `Clear backend query`
- `Refresh events`
- `Open staff activity`

Scope note:

```text
This does not prove that no audit history exists outside the returned query scope.
```

## Filtered Empty State

Filtered empty appears when backend returned rows but local filters hide all of them.

Title:

```text
No returned events match these filters
```

Body:

```text
The backend returned events, but your returned-event filters hide them.
```

Actions:

- `Clear returned-event filters`
- `Change backend query`

## Loading State

Loading structure:

- header skeleton
- summary skeleton
- backend query form skeleton
- table skeleton with stable height

Loading copy:

```text
Loading audit events...
```

Accessibility:

- use `role="status"`
- do not announce every row skeleton
- keep focus stable

## Refreshing State

Refresh behavior:

- keeps current query and filters
- refetches backend query
- keeps old rows visible until response returns
- marks timestamp as `Refreshing`
- announces refreshed count after success
- shows error banner after failure without clearing old rows unless data is unsafe

Refresh success message:

```text
Audit events refreshed. Showing 42 returned events.
```

Refresh failure message:

```text
Audit events could not refresh. Existing rows may be stale.
```

## Error State

Full-page error appears when the initial query fails.

Title:

```text
Audit events could not load
```

Body:

```text
The admin audit endpoint did not return events. Retry or open staff activity if the issue continues.
```

Actions:

- `Retry`
- `Open staff activity`
- `Back to admin overview`

If the API error includes a request id, display it.

## Authorization State

Title:

```text
You do not have access to audit events
```

Body:

```text
Audit events are available only to authorized admin roles.
```

Action:

- `Back to admin overview`

Do not render event counts or cached rows in this state.

## Session Expired State

Title:

```text
Session expired
```

Body:

```text
Sign in again to continue reviewing audit events.
```

Action:

- `Sign in`

Clear visible event rows after session expiration.

## State Machine

States:

- `loading`: initial query in progress
- `ready`: query returned one or more visible rows
- `empty`: query returned zero rows
- `filtered_empty`: query returned rows but local filters hide all rows
- `detail_route_limited`: user tries to open event detail without enough row context
- `metadata_redacted`: row has metadata hidden from list display
- `refreshing`: refresh in progress
- `not_authorized`: admin access rejected
- `session_expired`: auth invalid
- `api_error`: initial query failed

Transitions:

- `loading -> ready` when events return and filters show rows
- `loading -> empty` when zero events return
- `loading -> api_error` when initial query fails
- `ready -> filtered_empty` when local filters hide all rows
- `filtered_empty -> ready` when filters are cleared
- `ready -> refreshing` when refresh starts
- `refreshing -> ready` when refresh succeeds
- `refreshing -> api_error` only if no safe prior rows exist
- any state -> `not_authorized` on forbidden response
- any state -> `session_expired` on auth expiration

## Query State In URL

Persist backend query state in URL params:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Optional local UI params:

- `action`
- `role`
- `stationId`
- `statusGroup`
- `metadataState`

Rules:

- Avoid putting free-text local search into URL unless product privacy review approves it.
- Trim all URL params.
- Ignore unsupported params.
- If unsupported params are present, do not pass them to backend.

## Analytics Events

Analytics must not include raw metadata or sensitive event details.

Events:

- `admin_audit_events_viewed`
- `admin_audit_events_query_submitted`
- `admin_audit_events_query_cleared`
- `admin_audit_events_refreshed`
- `admin_audit_events_refresh_failed`
- `admin_audit_events_local_filter_changed`
- `admin_audit_events_sort_changed`
- `admin_audit_event_row_opened`
- `admin_audit_event_target_opened`
- `admin_audit_event_actor_opened`
- `admin_audit_metadata_redaction_seen`
- `admin_audit_backend_gap_panel_viewed`

Allowed event fields:

- `actor_role`
- `query_has_actor_id`
- `query_has_target_type`
- `query_has_target_id`
- `limit`
- `returned_count_bucket`
- `visible_count_bucket`
- `target_type`
- `has_metadata`
- `metadata_state`
- `status_group`
- `sort_key`
- `sort_direction`

Do not send:

- event id
- request id
- actor id
- target id
- raw action note
- raw metadata
- provider reference
- customer details

## Permissions And Visibility

Base screen access:

- admin principal only

Recommended visibility by role:

- `super_admin`: full audit list visibility
- `ops_admin`: delivery, tracking, issue, and station-related audit visibility
- `support_admin`: issue, delivery summary, and support-related audit visibility
- `finance_admin`: payment and refund audit visibility plus linked delivery context where authorized

If product-level role filtering is not yet implemented:

- show backend-returned rows only to admin users accepted by route guard
- rely on target route permission checks for follow-up access
- do not expose extra raw metadata as a workaround

## Security And Privacy

Required:

- no raw metadata display
- no raw proof URLs
- no tokens or credentials
- no phone numbers in rows
- no customer addresses in rows
- no full request body
- no provider payload dump
- no broad export
- no local storage of returned events
- no analytics containing IDs

Storage rules:

- keep query/filter state in memory or URL only where safe
- clear rows on sign-out
- do not cache audit rows in persistent browser storage
- do not send audit rows to client error reporting

## Accessibility Requirements

Required:

- one `h1`
- breadcrumb before heading
- table caption
- real table headers on desktop
- visible labels for mobile cards
- keyboard access for query submit, reset, filters, sort, and row actions
- focus-visible styling
- polite live region for result count, refresh, and sort
- error messages tied to invalid fields
- no color-only response status
- skip link to table
- reduced-motion support

Live messages:

- `Loading audit events`
- `Showing 50 returned events`
- `Showing 12 events after returned-event filters`
- `Sorted by occurred time descending`
- `Audit events refreshed`
- `Audit events could not refresh`
- `Metadata hidden for this event`

## Responsive Behavior

Desktop:

- full table with all primary columns
- sticky table header if accessible in chosen framework
- query form in one row when width allows
- local filters below query form

Tablet:

- table hides request id behind row expansion if space is constrained
- query fields wrap into two columns
- summary strip wraps to two rows

Mobile:

- event cards instead of horizontal scroll
- query form stacks fields
- local filters in bottom sheet or disclosure
- summary metrics use two-column grid
- redaction notice remains visible below first batch of rows

## Performance Requirements

Targets:

- route shell visible quickly
- query submit does not block typing
- local filtering under 100 ms for 100 returned rows
- table renders up to 100 rows without noticeable lag
- row drawer opens without fetching unrelated rows

Data behavior:

- do not fetch user details for every actor on initial load
- do not fetch target details for every row on initial load
- do not request more than backend max limit
- do not retry indefinitely on authorization errors
- debounce local search only if needed for smooth typing

## Component Inventory

Components:

- `AdminAuditEventsPage`
- `AuditEventsHeader`
- `AuditScopeSummary`
- `AuditBackendQueryForm`
- `AuditReturnedEventFilters`
- `AuditEventsTable`
- `AuditEventMobileCardList`
- `AuditActionLabel`
- `AuditActorCell`
- `AuditTargetCell`
- `AuditRequestCell`
- `AuditMetadataState`
- `AuditEventEvidenceDrawer`
- `AuditRedactionNotice`
- `AuditBackendGapPanel`
- `AuditEmptyState`
- `AuditFilteredEmptyState`
- `AuditErrorState`
- `AuditLiveRegion`

Shared with staff activity:

- action label map
- redaction utility
- target route resolver
- actor route resolver
- query builder
- safe search helper

## Test IDs

Root:

- `screen-admin-audit-events`

Header:

- `admin-audit-events-header`
- `admin-audit-events-refresh-action`
- `admin-audit-events-fetched-at`

Summary:

- `admin-audit-events-returned-count`
- `admin-audit-events-visible-count`
- `admin-audit-events-unique-actors`
- `admin-audit-events-targeted-count`
- `admin-audit-events-metadata-hidden-count`
- `admin-audit-events-limit`

Query:

- `admin-audit-events-query-form`
- `admin-audit-events-actor-id-input`
- `admin-audit-events-target-type-select`
- `admin-audit-events-target-id-input`
- `admin-audit-events-limit-select`
- `admin-audit-events-query-submit`
- `admin-audit-events-query-reset`

Filters:

- `admin-audit-events-local-filters`
- `admin-audit-events-search-input`
- `admin-audit-events-action-filter`
- `admin-audit-events-role-filter`
- `admin-audit-events-station-filter`
- `admin-audit-events-status-filter`
- `admin-audit-events-metadata-filter`
- `admin-audit-events-clear-local-filters`

Table:

- `admin-audit-events-table`
- `admin-audit-events-row`
- `admin-audit-events-open-event-action`
- `admin-audit-events-open-target-action`
- `admin-audit-events-open-actor-action`
- `admin-audit-events-metadata-state`

States:

- `admin-audit-events-empty-state`
- `admin-audit-events-filtered-empty-state`
- `admin-audit-events-error-state`
- `admin-audit-events-unauthorized-state`
- `admin-audit-events-redaction-notice`
- `admin-audit-events-backend-gap-panel`
- `admin-audit-events-live-region`

## Acceptance Criteria

Functional:

- Renders `/admin/audit-events` with root test id.
- Calls `admin_audit_events` with only supported backend query parameters.
- Shows returned count, visible count, and limit.
- Supports backend query by actor id.
- Supports backend query by target type plus target id.
- Supports limit values up to 100.
- Supports local filtering over returned rows.
- Shows clear scope copy for local filters.
- Shows read-only audit event table.
- Shows mobile event cards below tablet breakpoint.
- Shows metadata redaction state for each row.
- Does not render raw metadata.
- Routes to target screens only when target fields and permissions allow.
- Handles missing target fields.
- Handles unknown action keys.
- Handles no single-event endpoint honestly.

Policy:

- Audit events are treated as append-only evidence.
- Retention periods match local security docs.
- Privileged actions remain reviewable through event identifiers and request ids.
- Sensitive data categories are not exposed in rows.
- Public and non-admin users cannot view audit rows.

UX:

- Search and filters are easy to distinguish by backend query versus returned-row filter.
- First screenful explains scope and freshness.
- Event table is scan-friendly.
- Request id and event id are visually stable.
- Redaction notice is visible without blocking work.
- Empty state does not overclaim that no audit history exists.

Accessibility:

- Result changes are announced.
- Sort changes are announced.
- Form errors are tied to fields.
- Table has caption and headers.
- Mobile cards preserve labels.
- Focus order follows layout.
- No color-only status.

Security:

- No raw metadata.
- No raw export.
- No persistent browser storage of rows.
- No sensitive IDs in analytics.
- No target inference from metadata.

## QA Scenarios

Backend query:

- open with no query params
- query by actor id
- query by target type and target id
- query by target type only
- query by target id only
- invalid actor id
- invalid target id
- limit 25
- limit 50
- limit 100
- unsupported URL params ignored

Rows:

- event with delivery target
- event with payment target
- event with issue target
- event with tracking target
- event without target
- event without station
- event with metadata absent
- event with response status code
- event with unknown metadata keys
- event with unknown action key

States:

- loading
- ready
- empty
- filtered empty
- refresh success
- refresh failure with previous rows
- authorization failure
- session expiration
- initial API error

Routing:

- open delivery target
- open issue target
- open payment target as finance admin
- payment target blocked for role without finance route
- tracking target without route
- open actor when user route is allowed
- event detail route with selected row context
- event detail route without context shows limited state later

Accessibility:

- keyboard submit query
- keyboard reset query
- keyboard sort table
- keyboard open row drawer
- screen reader hears result count after filter
- screen reader hears refresh failure
- mobile filter sheet restores focus

Security:

- raw metadata never appears in DOM text
- provider secret not shown when present in hidden metadata
- phone number not shown when present in hidden metadata
- proof URL not shown when present in hidden metadata
- analytics excludes event id, request id, actor id, and target id

## Implementation Notes

Recommended sequence:

1. Add route shell and test id.
2. Build typed audit query form from contract.
3. Wire `useAdminAuditEventsQuery`.
4. Add returned-row scope summary.
5. Build table and mobile cards.
6. Add local filters and safe search.
7. Add redaction utility and metadata state display.
8. Add target and actor route resolvers.
9. Add row evidence drawer.
10. Add empty, filtered-empty, error, authorization, and session states.
11. Add backend gap panel.
12. Add accessibility live region and keyboard coverage.
13. Add unit and integration tests.

Do not implement:

- raw export
- event deletion
- event editing
- action replay
- raw metadata render
- unsupported backend filters

## Test Plan

Unit tests:

- query builder sends only supported params
- validation rejects invalid actor id
- validation rejects invalid target id
- local filter does not change backend query
- safe search excludes metadata
- action label mapping
- unknown action rendering
- target route resolver
- actor route resolver
- metadata redaction classifier
- response status grouping
- visible count summary

Component tests:

- loading state
- ready state
- empty state
- filtered-empty state
- error state
- unauthorized state
- query form validation
- table sorting
- mobile card rendering
- row drawer redaction content
- backend gap panel
- redaction notice

Integration tests:

- `/admin/audit-events` renders root test id
- backend query params match contract
- no unsupported params sent
- returned events render with scope summary
- local filters update visible count
- refresh preserves filters
- role routing restrictions hold for follow-up links

Accessibility tests:

- axe scan desktop
- axe scan mobile
- keyboard path through query form, filters, table, drawer, and routes
- live region announces count and sort changes
- form errors are announced with field context

## Open Backend Decisions

Not blockers for the current read-only screen:

- Add single-event read endpoint by `eventId`.
- Add server-side date range.
- Add server-side action filter.
- Add server-side actor role filter.
- Add server-side station filter.
- Add server-side request id lookup.
- Add cursor pagination.
- Add total count.
- Add safe metadata projection.
- Add controlled audit export endpoint.
- Add retention-state field.
- Add audit-event target support for user and station objects if product needs those routes.

## Completion Standard

The screen is complete when:

- admins can search recent audit events by supported backend fields
- returned-row scope is visible at all times
- local filters are clearly local
- event id and request id are easy to copy or inspect where allowed
- every row handles missing station, target, metadata, and unknown action safely
- no raw metadata is rendered
- no mutation or replay exists
- route links obey role access
- accessibility, responsive, security, and test requirements pass

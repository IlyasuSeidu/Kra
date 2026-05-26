# Admin Staff Activity Log Screen Spec

## Screen Contract

| Field                  | Value                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID              | `AdminStaffActivityLog`                                                                                                                                                                                                    |
| Route                  | `/admin/staff-activity`                                                                                                                                                                                                    |
| Primary test ID        | `screen-admin-staff-activity-log`                                                                                                                                                                                          |
| Surface                | Admin web console                                                                                                                                                                                                          |
| Backend coverage       | `admin_audit_events`                                                                                                                                                                                                       |
| Offline critical       | No                                                                                                                                                                                                                         |
| Required read role     | Any authenticated admin principal accepted by `assertAdminPrincipal`; product may later restrict further                                                                                                                   |
| Required mutation role | None                                                                                                                                                                                                                       |
| Required states        | `loading`, `ready`, `empty`, `filtered_empty`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error`, `redacted_metadata`                                                                                |
| Parent screens         | Protected admin shell                                                                                                                                                                                                      |
| Related screens        | `AdminAuditEvents`, `AdminAuditEventDetail`, `AdminUsers`, `AdminUserDetail`, `AdminUserAccess`, `AdminDeliveryDetail`, `AdminPackageDetail`, `AdminIssueDetail`, `AdminPaymentReconciliationDetail`, `AdminStationDetail` |

## Purpose

`AdminStaffActivityLog` is the staff-facing audit review surface for recent privileged and operational actions. It helps admins answer who did what, when it happened, which role performed it, which station was involved, and which delivery, payment, issue, or tracking target was affected.

The screen should answer:

- `Which staff actions happened recently?`
- `Who performed the action?`
- `Which role performed it?`
- `When did it happen?`
- `Was a station involved?`
- `Which backend operation was executed?`
- `Which delivery, payment, issue, or tracking object was affected?`
- `Which events need deeper audit review?`
- `Which target screen should I open next?`

This screen is a read-only operational audit lens. It is not a raw log dump, not a forensic export tool, and not a place to expose personal data stored in event metadata.

## Backend Reality

The audit event list endpoint is concrete:

```http
GET /v1/admin/audit-events
```

Operation:

```text
admin_audit_events
```

Auth behavior:

- Backend calls `assertAdminPrincipal`.
- The current route does not require a named capability.
- The route is admin-scoped, not public, sender, driver, station operator, or courier scoped.

Supported query parameters:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Limit:

- Positive integer.
- Maximum `100`.
- Defaults to `50`.

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

Important backend facts:

- There is no server-side date range filter.
- There is no server-side action filter.
- There is no server-side actor role filter.
- There is no server-side station filter.
- There is no pagination cursor.
- There is no dedicated staff-activity endpoint separate from audit events.
- `targetType` supports only `delivery`, `payment`, `issue`, and `tracking`.
- Some privileged actions, including user access changes, may not infer a public `targetType` or `targetId`.
- `metadata` may include nested fingerprint data and must not be rendered raw in this staff activity surface.

Therefore:

- The screen must only send supported backend query parameters.
- Actor search by `actorId` can be server-side.
- Target search by `targetType` plus `targetId` can be server-side.
- Action, actor role, station, and text search are local filters over returned rows.
- Date range controls must be local over returned rows unless backend support is added later.
- The screen must clearly label returned-row scope.
- The screen must never expose raw metadata by default.
- The screen must route deeper raw audit inspection to `AdminAuditEventDetail` when that screen exists and enforces redaction.

## Primary Users

Primary:

- Admin staff reviewing recent operational and privileged activity.
- Ops leads investigating station, delivery, or issue events.
- Super admins reviewing access-sensitive actions.

Secondary:

- Security reviewers validating audit visibility.
- QA validating event filtering and redaction.
- Engineering leads validating audit contract boundaries.
- Claude Code implementing the admin console later.

Non-users:

- Public visitors.
- Senders.
- Drivers.
- Station operators outside the admin console.
- Final-mile couriers outside the admin console.
- Receivers.

## User Goal

Admins use this screen to:

- See recent audit events.
- Filter by actor ID.
- Filter by target type and target ID.
- Limit returned rows.
- Locally filter returned rows by action, actor role, station ID, and time.
- Scan actor, action, role, station, target, and result.
- Open target detail screens.
- Open actor user detail when authorized and useful.
- Open full audit-event detail when available.
- Export nothing from this screen unless future policy adds a controlled export flow.

The screen should make event history scannable without weakening privacy or audit integrity.

## Entry Points

The screen can open from:

- Admin shell navigation.
- `AdminOverview` audit or recent activity shortcut.
- `AdminUsers` actor context.
- `AdminUserDetail` activity link.
- `AdminUserAccess` saved state follow-up.
- `AdminStationDetail` activity link.
- `AdminDeliveryDetail` staff activity link.
- `AdminIssueDetail` audit link.
- `AdminAuditEvents` staff-focused link.
- Direct route `/admin/staff-activity`.

The screen must not open from:

- Public web.
- Sender app.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Receiver tracking flow.

## Scope

In scope:

- Recent audit event loading.
- Server-side actor ID filter.
- Server-side target type and target ID filter.
- Server-side limit.
- Local action filter.
- Local actor role filter.
- Local station filter.
- Local time window filter over returned rows.
- Local free-text search over safe fields.
- Audit event table.
- Mobile event cards.
- Event severity or attention classification derived from action and response status.
- Safe metadata summary.
- Redaction policy.
- Target and actor navigation.
- Empty, filtered-empty, unauthorized, stale, refresh, and error states.
- Accessibility, analytics, and responsive behavior.

Out of scope:

- Raw log export.
- Bulk event download.
- Mutation actions.
- Audit event deletion.
- Audit event editing.
- Retention policy editing.
- Direct Firestore browsing.
- Raw metadata dump.
- Proof asset URL reveal.
- Credential or token viewing.
- SIEM configuration.
- Alert rule management.
- Incident case management.
- Full forensic timeline reconstruction.

## Design Thesis

The screen should feel like a disciplined operations ledger: dense, calm, searchable, and explicit about scope. It should prioritize chronology, actor, action, target, and safe follow-up links.

Visual direction:

- Use a wide admin workspace with a strong event table.
- Use a compact filter rail above the table.
- Use timestamp as the first sortable scan point.
- Use action names as readable operation labels with original operation ID available.
- Use role chips with text.
- Use target chips for delivery, payment, issue, and tracking.
- Use redaction indicators when metadata is hidden.
- Use a restrained amber attention badge for failed or unusual events.
- Use monospaced IDs for event, request, actor, station, and target IDs.

Restraint rule:

- No charts, avatars, heat maps, raw JSON panels, or one-click export from this screen.

## Research Inputs

External research used for this screen:

- [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final): supports sound computer security log management, collection, analysis, retention, and operational process.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports security logging, event attributes, and excluding sensitive data from logs.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible, scannable tabular records.
- [GOV.UK search pattern](https://design-system.service.gov.uk/patterns/search/): supports explicit search behavior and clear result scope.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports accessible filters, labels, hints, and validation.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh, filter, and result announcements.

How the research affects the screen:

- Log-management guidance shapes append-only, scope-aware, read-only event review.
- Security logging guidance shapes when, who, what, where, target, and sensitive-data exclusion.
- Table guidance shapes desktop event layout and keyboard scanning.
- Search and form guidance shape filter labels and returned-row scope copy.
- WCAG guidance shapes loading, refresh, filtering, and error announcements.

## Backend Data Contract

### List Audit Events

Request:

```http
GET /v1/admin/audit-events
```

Query parameters:

```text
actorId?: UserId
targetType?: delivery | payment | issue | tracking
targetId?: string
limit?: number
```

Operation:

```text
admin_audit_events
```

Response fields:

- `events[].eventId`
- `events[].requestId`
- `events[].action`
- `events[].actorId`
- `events[].actorRole`
- `events[].occurredAt`
- `events[].stationId`
- `events[].targetType`
- `events[].targetId`
- `events[].metadata`

Rules:

- `actorId` must match user ID schema.
- `targetType` must be one of supported enum values.
- `targetId` must be `3..120` trimmed characters.
- `limit` must be positive and max `100`.
- Default limit is `50`.
- Sending `targetType` without `targetId` is accepted by query schema, but Firestore repository only optimizes target lookup when both are present.
- Client should treat target-only filtering as returned-row scoped when one side is missing.

### Event Source

Audit events are created by privileged idempotent mutations. Common event fields:

- `eventId`: Audit event identifier.
- `requestId`: HTTP request identifier.
- `action`: Backend route key.
- `actorId`: Principal user ID.
- `actorRole`: Principal role.
- `occurredAt`: Backend event timestamp.
- `stationId`: Principal station scope when present.
- `targetType`: Inferred from mutation fingerprint when supported.
- `targetId`: Inferred target ID when supported.
- `metadata.responseStatusCode`: Mutation response status.
- `metadata.fingerprint`: Mutation fingerprint, potentially sensitive.

Metadata policy:

- Show response status code if present.
- Show safe high-level fingerprint presence only.
- Do not render full metadata.
- Do not render fingerprint body.
- Do not render personal data from metadata.
- Do not render raw proof URLs or tokens.

## Query And Filter Rules

Server filters:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Local filters:

- `action`
- `actorRole`
- `stationId`
- `occurredAt` time window.
- `eventId`
- `requestId`
- `targetId` when target type is not set.
- Safe text search across action, event ID, request ID, actor ID, role, station ID, target type, and target ID.

Unsupported filters:

- Backend action filter.
- Backend role filter.
- Backend date range filter.
- Backend station filter.
- Backend pagination cursor.
- Backend metadata search.

Rules:

- Local filters must say `Filter returned events`.
- Search must say `Search returned events`.
- If server filters are active, show query scope.
- If local filters are active, show visible count out of returned count.
- Do not send unsupported params.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. Page header.
3. Audit scope summary.
4. Server filter form.
5. Local filter and search controls.
6. Event table.
7. Redaction and retention notice.
8. Related audit actions.

Mobile order:

1. Header.
2. Scope summary.
3. Server filters.
4. Local search and filters.
5. Event cards.
6. Redaction notice.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main width max `1440px`.
- Summary strip across top.
- Filter bar in two rows.
- Table full width.
- Sticky table header if table component supports it accessibly.

Table columns:

- Time.
- Action.
- Actor.
- Role.
- Station.
- Target.
- Request.
- Status.
- Follow-up.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Summary wraps.
- Server filters use two columns.
- Table hides lower-priority request ID behind row expansion.
- Action and target remain visible.

### Mobile

Viewport:

- `<768px`

Layout:

- Filters stack.
- Events render as cards.
- Each card repeats labels.
- Follow-up actions appear at card bottom.

Mobile rules:

- No horizontal scrolling.
- Timestamp, action, actor role, and target remain visible.
- Request ID may be collapsed under `Technical details`.

## Components

### `AdminStaffActivityLogPage`

Responsibilities:

- Verify admin principal access.
- Manage server filter state.
- Fetch `admin_audit_events`.
- Derive local filters and search.
- Derive summary counts.
- Render table and mobile cards.
- Apply redaction policy.
- Route to related screens.
- Render loading, empty, filtered-empty, unauthorized, stale, refresh, and error states.

Test id:

```text
screen-admin-staff-activity-log
```

### `StaffActivityHeader`

Content:

- Title: `Staff activity`
- Subtitle: `Review recent admin and operational actions from the audit trail.`
- Refresh action.
- Generated or fetched time.
- Link to full audit events screen.

Rules:

- Do not claim complete audit history.
- Use `Recent returned events` language unless backend later returns total count.

### `AuditScopeSummary`

Metrics:

- Returned events.
- Visible events after local filters.
- Unique actors in returned rows.
- Admin-role events in returned rows.
- Station-scoped events in returned rows.
- Events with target ID.
- Events with redacted metadata.

Rules:

- Metrics are derived from returned rows only.
- Use buckets for analytics.
- Do not show total system audit-event count.

### `AuditServerFilters`

Fields:

- `actorId`
- `targetType`
- `targetId`
- `limit`

Rules:

- `actorId` label: `Actor user ID`.
- `targetType` label: `Target type`.
- `targetId` label: `Target ID`.
- `limit` choices: `25`, `50`, `100`.
- If `targetId` is entered without `targetType`, explain that target matching is returned-row scoped.
- If `targetType` is selected without `targetId`, explain that backend may still return recent events and local target type filtering applies to returned rows.
- Submit sends only supported params.

### `AuditLocalFilters`

Fields:

- Action.
- Actor role.
- Station ID.
- Time window.
- Safe search.

Rules:

- Local filters never call backend.
- Search excludes raw metadata.
- Time window applies only to returned rows.
- Clearing local filters restores returned rows.
- Result count is announced.

### `StaffActivityTable`

Purpose:

- Show audit events as accessible tabular records.

Columns:

- Time.
- Action.
- Actor.
- Role.
- Station.
- Target.
- Request.
- Status.
- Follow-up.

Rules:

- Use real table headers.
- Include table caption.
- Sort loaded rows by `occurredAt` descending by default.
- Allow client-side sort by time, action, actor, role, station, target, and status.
- Do not render raw metadata column.
- Use row action buttons instead of only row click.

### `StaffActivityCardList`

Purpose:

- Mobile representation of audit events.

Rules:

- Repeat labels.
- Put action and time at top.
- Show actor role before actor ID.
- Keep redaction label visible.
- Put follow-up actions at bottom.

### `AuditActionCell`

Purpose:

- Convert backend action keys into readable labels while preserving exact operation ID.

Display:

- Human label.
- Operation ID in secondary monospace text.

Examples:

- `assign_driver`: `Driver assigned`
- `admin_update_user_access`: `User access updated`
- `admin_update_station_status`: `Station status overridden`
- `refund_payment`: `Refund approved`
- `settle_refund_payment`: `Refund settled`
- Unknown action: show raw action as primary label.

Rules:

- Do not invent business result beyond action key and metadata status.
- Keep raw operation ID available.

### `AuditActorCell`

Content:

- Actor ID.
- Actor role.
- Link to `AdminUserDetail` when route exists and user management access is available.

Rules:

- Do not show full name unless user data is separately fetched and allowed.
- Do not fetch all users just to decorate audit rows.
- If linking actor detail, route by actor ID only.

### `AuditTargetCell`

Content:

- Target type.
- Target ID.
- Link to relevant screen when available.

Routes:

- `delivery` -> `AdminDeliveryDetail`.
- `payment` -> `AdminPaymentReconciliationDetail` when payment ID maps to reconciliation detail route.
- `issue` -> `AdminIssueDetail`.
- `tracking` -> receiver/public tracking support route only if internal tracking route exists later.

Rules:

- If no target type or target ID, show `No public target`.
- Do not parse target from raw metadata.
- Do not link unsupported target types.

### `AuditMetadataSummary`

Purpose:

- Show safe metadata facts without raw content.

Allowed display:

- Response status code.
- Metadata present or not.
- Fingerprint present or not.
- Redaction label.

Forbidden display:

- Raw fingerprint JSON.
- Request body.
- Full name.
- Email.
- Phone.
- Proof URLs.
- Access tokens.
- Idempotency keys.
- Provider secrets.

Copy:

```text
Metadata hidden on this screen.
```

Supporting copy:

```text
Open audit event detail for a controlled redacted view.
```

### `EventFollowUpActions`

Actions:

- `Open audit event` when detail route exists.
- `Open actor` when user detail route exists.
- `Open target` when target route exists.
- `Copy event ID` if allowed by product.
- `Copy request ID` if allowed by product.

Rules:

- Copy actions must copy only IDs visible on screen.
- No copy of raw metadata.
- No export.
- Action labels include event context for accessibility.

## Sorting

Sort keys:

- Occurred time.
- Action.
- Actor ID.
- Actor role.
- Station ID.
- Target type.
- Target ID.
- Response status.

Default sort:

- Occurred time descending.

Rules:

- Sorting is client-side on returned rows.
- Announce sort changes.
- Do not call unsupported backend sort params.

## Empty And State Handling

### Loading

Show:

- Header skeleton.
- Summary skeleton.
- Filter skeleton.
- Table skeleton.

Do not show:

- Assumed counts.
- Assumed actor names.
- Assumed targets.

### Empty

Cause:

- Backend returns zero events for server filters.

Copy:

```text
No audit events were returned for these filters.
```

Actions:

- Clear server filters.
- Refresh.

### Filtered Empty

Cause:

- Backend returned events, but local filters hide all rows.

Copy:

```text
No returned events match these local filters.
```

Actions:

- Clear local filters.

### Not Authorized

Cause:

- Backend rejects principal as non-admin.

Copy:

```text
You do not have permission to view staff activity.
```

Rules:

- Do not show partial events.
- Offer admin home if available.

### API Error

Rules:

- Show request-safe message.
- Offer refresh.
- Preserve current filters.
- Do not expose raw error payload.

### Redacted Metadata

Cause:

- Event metadata exists and is intentionally hidden.

Rules:

- Show redaction label.
- Offer audit detail route only if supported.
- Do not use expandable raw JSON.

## Copy System

Tone:

- Clear.
- Audit-focused.
- Operational.
- Privacy-aware.

Preferred labels:

- `Staff activity`
- `Recent returned events`
- `Actor user ID`
- `Actor role`
- `Action`
- `Operation ID`
- `Target`
- `Request ID`
- `Metadata hidden`
- `Open target`
- `Open actor`
- `Open audit event`

Scope copy:

```text
Showing recent returned audit events, not the complete audit history.
```

Local filter copy:

```text
These filters apply only to returned events.
```

Metadata copy:

```text
Raw metadata is hidden to protect sensitive request details.
```

Avoid:

- `Employee monitoring`
- `Spy`
- `Delete log`
- `Edit log`
- `Full forensic export`
- `Complete history` unless backend supports it.

## Analytics

Events:

- `admin_staff_activity_viewed`
- `admin_staff_activity_refreshed`
- `admin_staff_activity_server_filtered`
- `admin_staff_activity_local_filtered`
- `admin_staff_activity_sorted`
- `admin_staff_activity_actor_opened`
- `admin_staff_activity_target_opened`
- `admin_staff_activity_event_opened`
- `admin_staff_activity_metadata_redacted`
- `admin_staff_activity_unauthorized`
- `admin_staff_activity_api_error`

Allowed properties:

- `returned_event_count_bucket`
- `visible_event_count_bucket`
- `actor_filter_present`
- `target_type_filter`
- `target_filter_present`
- `limit`
- `local_action_filter_present`
- `local_role_filter`
- `local_station_filter_present`
- `time_window_filter_present`
- `sort_key`
- `target_type`
- `actor_role`
- `has_metadata`
- `metadata_redacted`

Forbidden properties:

- Event ID.
- Request ID.
- Actor ID.
- Target ID.
- Station ID.
- Full metadata.
- Full name.
- Email.
- Phone.
- Auth tokens.
- Idempotency key.
- Raw error payload.

Count buckets:

- `0`
- `1-25`
- `26-50`
- `51-100`

## Accessibility

Landmarks:

- One `main` region.
- One `h1`.
- Server filter form has accessible name.
- Local filter form has accessible name.
- Table has caption and headers.

Forms:

- Every filter has visible label.
- Limit control explains maximum `100`.
- Target type and target ID relationship is explained.
- Error messages are field-specific.

Table:

- Use semantic table.
- Header cells describe each column.
- Sort buttons have accessible names.
- Row actions are buttons or links with event context.
- Monospace IDs are still selectable and readable.

Status messages:

- Loading, refreshing, filtering, and sorting use polite live regions.
- Unauthorized and API errors use assertive region.
- Result count updates are announced.

Keyboard:

- Server filters are reachable before local filters.
- Table actions are reachable in row order.
- Mobile cards keep action order consistent.
- Copy actions are keyboard accessible.

Color:

- Role, target, and attention states include text.
- Redaction state includes text, not just icon.
- Response status uses label plus color.

## Privacy And Security

Security:

- Requires admin principal.
- Do not render events before authorization.
- Do not expose raw metadata.
- Do not permit event mutation.
- Do not permit event deletion.
- Do not permit export from this screen.
- Do not send unsupported query params.

Privacy:

- Treat metadata as sensitive by default.
- Do not show full names unless fetched from a separate allowed source.
- Do not show email, phone, tokens, idempotency keys, proof URLs, or provider secrets.
- Do not send IDs to analytics.

Audit integrity:

- Events are read-only.
- Corrections must appear as new events, not edits.
- UI must not suggest audit history can be changed.
- Stale state should prompt refresh, not silent overwrite.

## Performance

Targets:

- Recent event list visible within `1500ms` on normal admin network.
- Local filter and sort under `100ms` for up to `100` rows.

Rules:

- Fetch only `admin_audit_events`.
- Do not fetch actor user records by default.
- Do not fetch target records by default.
- Do not fetch raw station data by default.
- Do not poll automatically.
- Refresh only on user action or shell-level invalidation.

## Responsive Behavior

Desktop:

- Summary strip, two-row filters, full table.

Tablet:

- Wrapped filters, table with lower-priority details collapsible.

Mobile:

- Summary cards, stacked filters, event cards.

Mobile rules:

- No horizontal scrolling.
- Timestamp, action, actor role, and target remain visible.
- Request ID and event ID can sit under technical details.
- Redaction label remains visible.

## Testing Requirements

Unit tests:

- Server filter query builder.
- Limit max enforcement.
- Local action filter.
- Local actor role filter.
- Local station filter.
- Local time window filter.
- Safe search field selection.
- Summary metric derivation.
- Action label mapping.
- Target route mapping.
- Metadata redaction.
- Analytics sanitizer.
- Sort logic.

Integration tests:

- Loads `admin_audit_events`.
- Sends actor ID filter.
- Sends target type and target ID filters.
- Sends limit.
- Does not send unsupported action filter.
- Does not send unsupported date range filter.
- Shows empty state.
- Shows filtered-empty state.
- Shows unauthorized state.
- Shows metadata redaction label.
- Opens actor user detail.
- Opens delivery target.
- Opens issue target.
- Opens payment target when route is supported.
- Opens audit event detail when route is supported.
- Refresh preserves filters.

Accessibility tests:

- Page has one `h1`.
- Filter labels exist.
- Table caption exists.
- Sort controls have accessible names.
- Result count is announced.
- Redaction state is announced as text.
- Mobile cards repeat labels.
- Row action labels include event context.

Visual regression states:

- Populated audit list.
- Empty list.
- Filtered empty.
- Actor-filtered list.
- Target-filtered list.
- Events with no target.
- Events with station scope.
- Events with redacted metadata.
- Unauthorized.
- API error.
- Mobile event cards.

## Implementation Checklist

- Create route `/admin/staff-activity`.
- Use protected admin shell.
- Gate route to admin principals.
- Build server filters for actor ID, target type, target ID, and limit.
- Fetch `admin_audit_events`.
- Build local filters for action, role, station, time, and safe search.
- Build returned-row summary.
- Build desktop table.
- Build mobile cards.
- Build metadata redaction summary.
- Build target and actor route actions.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Raw metadata panel.
- Raw JSON expansion.
- Event edit.
- Event delete.
- Bulk export.
- SIEM settings.
- Alert rule settings.
- Unsupported server action filter.
- Unsupported server role filter.
- Unsupported server date range filter.
- Unsupported server station filter.
- Unsupported pagination cursor.
- Automatic actor record fetch for every row.
- Automatic target record fetch for every row.
- Analytics containing event ID, request ID, actor ID, target ID, station ID, or metadata.

## Acceptance Criteria

The screen is complete when:

- `/admin/staff-activity` renders with test id `screen-admin-staff-activity-log`.
- It requires an admin principal.
- It fetches `admin_audit_events`.
- It sends only supported server filters.
- It clearly labels returned-row scope.
- It supports local filtering over returned rows.
- It shows time, action, actor, role, station, target, request, status, and follow-up actions.
- It redacts raw metadata by default.
- It routes to actor, target, and audit event detail screens when available.
- It handles loading, empty, filtered empty, unauthorized, stale, refresh, redacted metadata, and API error states.
- It protects IDs and metadata from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminStaffActivityLog` as a read-only staff activity ledger for `/admin/staff-activity`. Use `admin_audit_events` with only actor, target, and limit server filters; keep action, role, station, time, and safe text search local to returned rows; show a dense accessible audit table and mobile cards; redact metadata by default; route to actor, target, and audit-event detail screens when supported; and keep all IDs plus metadata out of analytics.

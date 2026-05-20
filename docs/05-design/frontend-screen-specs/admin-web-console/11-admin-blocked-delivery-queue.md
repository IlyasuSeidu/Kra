# Admin Blocked Delivery Queue Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminBlockedDeliveryQueue` |
| Route | `/admin/deliveries/blocked` |
| Test id | `screen-admin-blocked-delivery-queue` |
| Surface | Admin web console |
| Backend coverage | `admin_deliveries`, `list_issues`, optional `admin_overview`, optional `admin_stations` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `partial_issue_context`, `partial_station_context`, `scope_limited`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, `AdminDeliveryExplorer`, `AdminCustodyChain`, `AdminManualCustodyException`, protected admin shell |
| Related screens | `AdminDeliveryDetail`, `AdminPackageDetail`, `AdminCustodyChain`, `AdminManualCustodyException`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminPaymentReconciliation`, `AdminRefundEvidenceReview`, `AdminStations`, `AdminStationDetail`, `AdminAuditEvents` |

## Purpose
This screen is the admin operations worklist for deliveries that appear blocked by issue state, custody risk, payment status, or station context. It must help an admin decide which delivery needs attention first, then route to the correct specialist screen. It must not resolve issues, mutate custody, change payment state, or override station settings directly.

The screen exists because the admin overview count is too high-level and the delivery explorer is too broad. This queue narrows the latest admin delivery data to rows where work is likely needed.

## Backend Reality
The current backend does not expose a dedicated blocked-deliveries endpoint.

Therefore:
- The base list comes from `GET /v1/admin/deliveries`.
- That endpoint returns the latest 100 admin deliveries by latest event time.
- That endpoint does not support server-side blocked filters, pagination, search, or sorting.
- The queue must derive blockers client-side from returned rows.
- Issue enrichment comes from `GET /v1/issues`.
- `list_issues` can filter one status at a time and returns up to 100 rows.
- Station context can come from `GET /v1/admin/stations`, but station data does not prove a specific delivery is blocked unless delivery or issue state also supports it.
- Admin overview can provide `operationalAlerts.openIssueLikeDeliveries` for scope comparison, but it does not return row details.

The page must clearly label scope limits:
- `Showing blocked signals from the latest 100 admin deliveries.`
- If overview count is higher than derived rows, show `More issue-like deliveries may exist outside this loaded set.`

## Primary Users
Primary:
- `ops_admin` reviewing operational blockers and routing delivery work.
- `support_admin` finding issue and custody work that needs triage.
- `finance_admin` finding payment or refund-related blockers before reconciliation or refund review.
- `super_admin` reviewing severe cross-functional blockers.

Secondary:
- Claude Code implementing the admin console later.

## User Goal
Admins use this screen to answer:
- `Which deliveries are blocked right now?`
- `Why is each delivery blocked?`
- `Is the blocker payment, issue, custody, station, or combined?`
- `Which rows are most severe?`
- `Which screen should I open next?`
- `Is the queue missing issue or station context because a supporting API failed?`
- `Does the queue cover every blocked delivery or only the latest loaded set?`

The page should reduce operational delay without encouraging unsafe bulk actions.

## Entry Points
The screen can open from:
- `AdminOverview` operational alert `Issue-like deliveries`.
- `AdminDeliveryExplorer` filtered issue-like rows.
- `AdminDeliveryDetail` blocked delivery action.
- `AdminPackageDetail` package risk action.
- `AdminCustodyChain` blocker link.
- `AdminManualCustodyException` related queue action.
- `AdminIssueQueue` delivery blocker link.
- Direct route `/admin/deliveries/blocked`.

The screen must not open from:
- Public receiver tracking.
- Sender app routes.
- Staff mobile routes.
- Provider webhook callbacks.

## Scope
In scope:
- Read-only blocked delivery worklist.
- Client-side blocker derivation from loaded delivery rows.
- Issue enrichment for open, in-review, and escalated issues.
- Optional station status context.
- Optional overview count comparison.
- Local search over loaded rows.
- Local filters over loaded rows.
- Sort over loaded rows.
- Route actions to detail, custody, issue, payment, and station screens.
- Loading, empty, partial, stale, and error states.

Out of scope:
- Resolving issues.
- Escalating issues.
- Mutating delivery status.
- Reassigning staff.
- Recording handoff evidence.
- Revealing proof references.
- Revealing receiver phone or address.
- Executing refunds.
- Confirming payments.
- Updating station status.
- Bulk actions.
- Exporting data.
- Claiming the list is exhaustive beyond backend scope.

## Design Thesis
The screen should feel like an operations command queue: dense, ordered, and urgent without noise. The visual system should make blocker type and severity more scannable than generic delivery status.

Visual direction:
- Use a white and warm-gray canvas with a dark graphite table.
- Use narrow left-row status rails instead of loud cards.
- Use red for severe blockers, amber for active review, blue for neutral station context, and green only for cleared context.
- Use compact pills for blocker types.
- Use monospaced IDs.
- Use a strong filter bar and clear scope notice.
- On mobile, turn rows into stacked decision cards with the blocker reason first.

Restraint rule:
- No maps, no charts, no bulk toolbars, no animated alerts, no row decorations beyond status rails and readable labels.

## Research Inputs
External research used for this screen:
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense enterprise rows, row actions, sorting, filtering, and batch-free operational tables.
- [Microsoft Fluent data grid](https://fluent2.microsoft.design/components/web/react/core/datagrid/usage): supports keyboard-friendly data-grid behavior and accessible row interaction.
- [USWDS table](https://designsystem.digital.gov/components/table/): supports accessible tabular data and responsive table behavior.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports a concise scope warning and operational summary.
- [Atlassian incident management handbook](https://www.atlassian.com/incident-management): supports triage, escalation, and severity-led response flow.
- [PagerDuty incident response guide](https://response.pagerduty.com/): supports incident response discipline, severity prioritization, and clear ownership.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible load, refresh, filter, and partial-data announcements.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable keyboard flow through filters, row actions, and recovery links.

How the research affects the screen:
- Data-grid references shape table density, sort, filter, and row-action behavior.
- Incident-response references shape severity-first ordering and owner routing.
- Summary-box guidance shapes the scope and partial-data notices.
- WCAG guidance shapes announcements, focus behavior, and mobile accessibility.

## Backend Contract
### Admin Deliveries
Request:
```http
GET /v1/admin/deliveries
```

Operation:
```text
admin_deliveries
```

Auth:
- Admin only.
- Backend uses `requireAdmin`.

Response fields:
- `generatedAt`
- `deliveries[].deliveryId`
- `deliveries[].trackingCode`
- `deliveries[].currentStatus`
- `deliveries[].paymentStatus`
- `deliveries[].originStationId`
- `deliveries[].destinationStationId`
- `deliveries[].senderId`
- `deliveries[].latestOccurredAt`
- `deliveries[].receiverName`

Rules:
- Treat results as latest loaded set, not global search.
- Do not send unsupported query params.
- Do not claim pagination exists.
- Do not prefetch every delivery detail row.

### Issue Enrichment
Recommended requests:
```http
GET /v1/issues?status=open&limit=100
GET /v1/issues?status=in_review&limit=100
GET /v1/issues?status=escalated&limit=100
```

Operation:
```text
list_issues
```

Fields used:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `reporter.actorRole`
- `createdAt`
- `updatedAt`

Rules:
- Join issues to loaded admin delivery rows by `deliveryId`.
- If issue rows exist for a delivery that is not in the latest admin delivery set, do not create a row unless a future backend contract allows fetching that delivery safely.
- Show issue enrichment as partial if any status request fails.
- Do not use issue summary text to derive blocker type.
- Never send issue summary to analytics.

### Optional Admin Overview
Request:
```http
GET /v1/admin/overview
```

Fields used:
- `generatedAt`
- `operationalAlerts.openIssueLikeDeliveries`

Purpose:
- Compare derived issue-like delivery count to overview count.
- Surface scope warning when counts diverge.

Rules:
- Do not use overview count as row data.
- Do not block the queue when overview fails.

### Optional Admin Stations
Request:
```http
GET /v1/admin/stations
```

Fields used:
- `stations[].stationId`
- `stations[].name`
- `stations[].operatingStatus`
- `stations[].intakeStatus`
- `stations[].serviceAvailability`
- `stations[].issueCount`
- `stations[].validation.status`
- `stations[].validation.goLiveEligible`
- `stations[].validation.blockers`

Purpose:
- Add station warning context for origin and destination stations.
- Route to station detail when a station appears paused, restricted, not validated, or issue-heavy.

Rules:
- Station context is advisory unless delivery or issue state also shows an active blocker.
- Do not mark every delivery at a paused station as actively blocked unless policy says the station blocker applies to that delivery stage.
- If station data fails, show `Station context unavailable` but keep delivery and issue blockers visible.

## Blocker Derivation
Build a normalized queue row from each loaded admin delivery.

### Active Delivery Status Blockers
These statuses always place the row in the queue:
- `issue_reported`
- `on_hold`
- `delivery_failed`

Meanings:
- `issue_reported`: operational issue blocks normal flow.
- `on_hold`: delivery is paused and needs review.
- `delivery_failed`: terminal failure needs issue, custody, refund, or support follow-up.

### Payment Blockers
These payment statuses place active, non-terminal deliveries in the queue:
- `failed`
- `refund_pending`

Payment warning:
- `pending` becomes a warning only when the delivery is already past pre-dispatch activity and issue or station context says work is blocked. The current admin delivery row does not expose `paymentRequiredBeforeDispatch`, so the queue must not overstate `pending` as a blocker by itself.

### Issue Blockers
Active issue statuses:
- `open`
- `in_review`
- `escalated`

Issue categories:
- `handoff`: custody blocker.
- `loss`: custody or missing-package blocker.
- `damage`: custody or condition blocker.
- `payment`: payment blocker.
- `delay`: SLA or operations blocker.
- `other`: issue context only unless structured fields in future mark it as a blocker.

Severity:
- `p1`: critical.
- `p2`: high.
- `p3`: medium.

### Station Context Warnings
Station warning signals:
- `operatingStatus=paused`
- `intakeStatus=restricted`
- `validation.status=blocked`
- `validation.goLiveEligible=false`
- `issueCount` greater than zero
- service required by delivery not available when the required service is known

Rules:
- Station context can raise row attention but should not be the only active blocker unless the delivery status is already blocked or the admin deliberately filters `Station warnings`.
- Station warning action routes to `AdminStationDetail`.

### Combined Blockers
A row can have multiple blocker types.

Priority order:
1. P1 unresolved issue.
2. `delivery_failed`.
3. `on_hold`.
4. `issue_reported`.
5. Payment failed.
6. Refund pending.
7. Custody issue category.
8. Station warning.
9. P2 issue.
10. P3 issue.

Rows should show all blocker pills but sort by strongest blocker.

## Queue Row Model
Derived row fields:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `latestOccurredAt`
- `receiverName`
- `blockerTypes`
- `primaryBlocker`
- `severity`
- `issueCount`
- `highestIssueSeverity`
- `activeIssueIds`
- `custodyIssueIds`
- `paymentIssueIds`
- `stationWarningCount`
- `rowConfidence`
- `recommendedAction`

`blockerTypes` values:
- `issue`
- `hold`
- `failed_delivery`
- `payment`
- `refund`
- `custody`
- `station`
- `combined`

`severity` values:
- `critical`
- `high`
- `medium`
- `low`

`rowConfidence` values:
- `delivery_only`
- `delivery_and_issue`
- `delivery_and_station`
- `delivery_issue_station`
- `payment_only`
- `partial_context`

Rules:
- `combined` is additive, not a replacement. Keep specific pills visible.
- If issues fail to load, rows derived from delivery status remain visible with `Issue context unavailable`.
- If station data fails, rows derived from delivery and issue state remain visible with `Station context unavailable`.

## Default Inclusion Rules
Include a delivery row when any of these are true:
- `currentStatus` is `issue_reported`.
- `currentStatus` is `on_hold`.
- `currentStatus` is `delivery_failed`.
- `paymentStatus` is `failed` and `currentStatus` is not terminal cleared state.
- `paymentStatus` is `refund_pending` and delivery still needs finance or support follow-up.
- An active issue joined by `deliveryId` has category `handoff`, `loss`, `damage`, `payment`, or `delay`.
- Station context is selected by filter and origin or destination station has warning state.

Exclude by default:
- `delivered` with no active issue and no payment blocker.
- `cancelled` with no active issue and no refund blocker.
- `closed`.
- `draft`.
- `created` with `paymentStatus=pending` only.
- Any row where the only signal is `category=other`.

## Sorting
Default sort:
1. Critical severity.
2. Active issue status `escalated`.
3. `delivery_failed`.
4. `on_hold`.
5. `issue_reported`.
6. Payment failed.
7. Refund pending.
8. Custody issue category.
9. Station warning.
10. Latest occurred time descending.

User sort options:
- `Most severe`
- `Newest activity`
- `Oldest activity`
- `Payment blockers first`
- `Custody blockers first`
- `Station warnings first`

Rules:
- Sort locally over loaded rows only.
- Show current sort near result count.
- Reset sort to `Most severe` when user taps `Reset filters`.

## Filters
Filter groups:
- Blocker type: all, issue, hold, failed delivery, payment, refund, custody, station, combined.
- Severity: all, critical, high, medium, low.
- Issue status: all, open, in review, escalated.
- Payment status: all, failed, refund pending.
- Station: all, origin station, destination station.
- Confidence: all, complete context, partial context.

Search:
- Local search over loaded row fields:
  - `deliveryId`
  - `trackingCode`
  - `originStationId`
  - `destinationStationId`
  - `receiverName`
  - active issue IDs

Rules:
- Search must not call backend.
- Search must not include issue summary or description.
- Search result count must announce after debounce.
- Filters must be reversible.
- Active filters appear as removable chips.

## Layout
### Desktop
Use a 12-column layout.

Top zone:
- Breadcrumbs.
- Title `Blocked delivery queue`.
- Scope notice.
- Refresh button.
- Data freshness timestamp.

Summary strip:
- Total visible blocked rows.
- Critical rows.
- Payment blockers.
- Custody blockers.
- Station warnings.
- Partial context count.

Filter bar:
- Search.
- Blocker type tabs.
- Severity filter.
- Sort select.
- Reset button.

Main table:
- Delivery.
- Primary blocker.
- Severity.
- Payment.
- Stations.
- Issues.
- Latest activity.
- Recommended action.

Right rail:
- Scope explanation.
- Partial context notices.
- Quick links to issue queue, payment reconciliation, station list, delivery explorer.

### Tablet
Layout:
- Summary strip becomes two rows.
- Filter bar wraps.
- Table keeps key columns and moves secondary details into expandable row.

### Mobile
Layout:
- One column.
- Scope notice first.
- Search and filters collapsed under `Refine queue`.
- Rows render as cards.

Mobile row order:
1. Primary blocker.
2. Delivery ID and tracking code.
3. Severity.
4. Status and payment.
5. Stations.
6. Issue count.
7. Recommended action.

Rules:
- No horizontal scrolling.
- All row actions full width.
- Keep row details concise.

## Component Structure
### `AdminBlockedDeliveryQueuePage`
Responsibilities:
- Run data queries.
- Derive queue rows.
- Manage local filters, search, sort, and refresh.
- Render route-level states.

Queries:
- `useAdminDeliveriesQuery`
- `useListIssuesQuery({ status: "open", limit: 100 })`
- `useListIssuesQuery({ status: "in_review", limit: 100 })`
- `useListIssuesQuery({ status: "escalated", limit: 100 })`
- Optional `useAdminOverviewQuery`
- Optional `useAdminStationsQuery`

Test id:
- `screen-admin-blocked-delivery-queue`

### `BlockedQueueScopeNotice`
Purpose:
- Explain backend scope and partial context.

Content states:
- Normal: latest 100 admin deliveries.
- Scope limited: overview count exceeds visible issue-like rows.
- Partial issue context: issue calls failed.
- Partial station context: station call failed.

Test ids:
- `admin-blocked-queue-scope-notice`
- `admin-blocked-queue-scope-limited`

### `BlockedQueueSummaryStrip`
Metrics:
- Visible blocked rows.
- Critical rows.
- Payment blockers.
- Custody blockers.
- Station warnings.
- Partial context rows.

Rules:
- Counts derive from currently loaded rows.
- Do not show global language unless using overview count.
- Each metric can filter the table when clicked.

Test id:
- `admin-blocked-queue-summary`

### `BlockedQueueFilters`
Controls:
- Search input.
- Blocker type segmented control.
- Severity select.
- Payment status select.
- Station warning toggle.
- Sort select.
- Reset filters.

Rules:
- All controls are keyboard accessible.
- Search debounce should be short enough for admin typing but must not block.
- Clear search button required.

Test ids:
- `admin-blocked-queue-search`
- `admin-blocked-queue-blocker-filter`
- `admin-blocked-queue-severity-filter`
- `admin-blocked-queue-sort`
- `admin-blocked-queue-reset`

### `BlockedDeliveryTable`
Columns:
- Delivery.
- Blocker.
- Severity.
- Payment.
- Stations.
- Issues.
- Latest activity.
- Action.

Delivery cell:
- Delivery ID.
- Tracking code.
- Receiver name.

Blocker cell:
- Primary blocker title.
- Blocker pills.
- Confidence label.

Action cell:
- Recommended action button.
- Secondary overflow with safe navigation links.

Rules:
- Row action buttons must be real routes.
- No mutation buttons.
- Table supports keyboard row action navigation.

Test ids:
- `admin-blocked-queue-table`
- `admin-blocked-queue-row`
- `admin-blocked-queue-primary-action`

### `BlockedDeliveryCardList`
Purpose:
- Mobile rendering of the same derived rows.

Rules:
- Do not hide severity.
- Do not hide primary blocker.
- Keep details expandable.
- Preserve all route actions.

Test id:
- `admin-blocked-queue-mobile-list`

### `BlockedQueueRowActions`
Recommended action mapping:
| Condition | Primary action | Route |
| --- | --- | --- |
| Custody issue exists | `Review custody exception` | `/admin/custody-exceptions/:issueId` |
| Handoff issue but no issue ID joined | `Open custody chain` | `/admin/deliveries/:deliveryId/custody` |
| Payment failed | `Review reconciliation` | `/admin/finance/reconciliation` with delivery context when the finance route supports it |
| Refund pending | `Open delivery detail` | `/admin/deliveries/:deliveryId` so refund evidence can be opened only after a payment ID is available |
| Delivery failed | `Open delivery detail` | `/admin/deliveries/:deliveryId` |
| On hold | `Open issue detail` when issue joined, else `Open delivery detail` |
| Station warning | `Open station detail` | `/admin/stations/:stationId` |
| Unknown combined blocker | `Open delivery detail` | `/admin/deliveries/:deliveryId` |

Secondary actions:
- `Open package detail`.
- `Open issue queue filtered to delivery`.
- `Open audit events`.
- `Open station detail`.

Rules:
- If a route is not implemented yet, hide the action or route to the closest implemented parent with a query param.
- Do not render actions that imply mutation.

Test id:
- `admin-blocked-queue-row-actions`

### `PartialContextBanner`
Triggers:
- Issue enrichment failed.
- Station context failed.
- Overview count failed.
- Some issue status calls succeeded and others failed.

Copy:
```text
Some supporting context did not load. The queue still shows blockers derived from delivery rows.
```

Rules:
- The banner must specify which context failed.
- The banner must not hide the table.
- Retry button refetches failed context.

Test id:
- `admin-blocked-queue-partial-context`

## Empty States
### Empty Loaded Queue
Trigger:
- Admin deliveries load and no included rows derive blockers.

Title:
```text
No blocked deliveries in the loaded set
```

Body:
```text
The latest admin deliveries do not show issue, payment, custody, or station blocker signals.
```

Actions:
- `Refresh`
- `Open delivery explorer`
- `Open issue queue`

### Filtered Empty
Trigger:
- Rows exist but active filters hide them.

Title:
```text
No rows match these filters
```

Actions:
- `Reset filters`
- `Clear search`

### Scope Limited
Trigger:
- Overview `openIssueLikeDeliveries` exceeds derived issue-like delivery rows.

Title:
```text
There may be more blocked deliveries outside this loaded set
```

Body:
```text
This queue is based on the latest 100 admin deliveries. Use delivery explorer or issue queue for broader investigation until a dedicated blocked-deliveries endpoint exists.
```

Actions:
- `Open delivery explorer`
- `Open issue queue`

## Error States
### Not Authorized
Trigger:
- Admin deliveries returns `FORBIDDEN`.

UI:
- Clear all row data.
- Show admin access error.
- Offer sign-in or admin overview depending on session state.

### Session Expired
Trigger:
- Auth layer indicates expired session.

UI:
- Clear row data.
- Show `Session expired`.
- Offer `Sign in`.

### API Error
Trigger:
- Admin deliveries fails for network or server reason.

UI:
- Show page-level error.
- No stale data unless a valid prior cache exists.
- Offer `Refresh`.

### Partial Issue Context
Trigger:
- Admin deliveries succeeds but issue enrichment fails.

UI:
- Keep delivery-derived blockers.
- Mark issue columns as `Issue context unavailable`.
- Hide issue-specific primary actions when issue ID is unknown.
- Keep delivery detail and custody chain actions.

### Partial Station Context
Trigger:
- Station context fails.

UI:
- Keep delivery and issue blockers.
- Mark station warnings as unavailable.
- Hide station warning filters.

## Interaction Rules
Refresh:
- Refetch all enabled queries.
- Keep current filters.
- Keep current sort.
- Mark rows stale during refresh.
- Announce `Refreshing blocked delivery queue`.

Search:
- Do not call backend.
- Preserve search when changing filters.
- Escape clears search when focus is inside the search input.

Filters:
- Chip removal updates result count.
- Reset returns blocker type to all, severity to all, sort to most severe, and search to empty.

Row navigation:
- Clicking row opens delivery detail only when the click target is not an action button.
- Keyboard Enter on row opens primary action.
- Space selects row focus state, not bulk select.

No bulk action:
- The queue must not include checkboxes for bulk mutation.
- The queue can include multi-row keyboard navigation only.

## Privacy And Security
Never show:
- Receiver phone.
- Receiver address.
- Sender contact details.
- Payment provider references.
- Proof references.
- Raw scan codes.
- Issue descriptions in table rows.
- Resolution notes in table rows.

Allowed row display:
- Delivery ID.
- Tracking code.
- Receiver name from admin delivery list.
- Station IDs.
- Payment status label.
- Delivery status label.
- Issue ID.
- Issue category.
- Issue severity.
- Issue status.
- Issue summary only in row expansion or detail panel, not default compact table.

Analytics forbidden fields:
- Receiver name.
- Issue summary.
- Issue description.
- Proof reference.
- Payment provider reference.
- Actor ID.

## Analytics
Events:
- `admin_blocked_queue_viewed`
- `admin_blocked_queue_refreshed`
- `admin_blocked_queue_filtered`
- `admin_blocked_queue_search_used`
- `admin_blocked_queue_row_opened`
- `admin_blocked_queue_primary_action_opened`
- `admin_blocked_queue_scope_warning_seen`
- `admin_blocked_queue_partial_context_seen`

Required event properties:
- `visible_count`
- `critical_count`
- `filter_blocker_type`
- `filter_severity`
- `sort`
- `has_partial_issue_context`
- `has_partial_station_context`
- `role`

Row action properties:
- `deliveryId`
- `primary_blocker`
- `severity`
- `action`
- `result`

Do not send:
- `receiverName`
- `issueSummary`
- `issueDescription`
- `proofReference`
- `paymentReference`
- `actorId`

## Accessibility
Structure:
- One `h1`: `Blocked delivery queue`.
- Scope notice follows the title.
- Filters are grouped with a visible label.
- Table has semantic headers.
- Mobile cards use lists with clear labels.

Announcements:
- Load complete announces visible row count.
- Filter changes announce visible row count.
- Refresh starts and ends with polite status.
- API errors use assertive status.
- Partial context banners are announced once per refresh.

Keyboard:
- Tab order: breadcrumbs, refresh, scope notice actions, filters, table rows, right rail links.
- Row actions reachable without relying on hover.
- Sort and filter controls expose current value.
- Focus remains stable after refresh.

Focus:
- Visible focus required on filters, row actions, and links.
- Focus ring must not be clipped inside table cells.

Responsive accessibility:
- Mobile cards preserve all labels.
- Action buttons have clear text, not icon-only labels.
- Hit targets meet touch guidance.

## Performance
Targets:
- Initial shell renders immediately.
- Rows render within 100 ms after data is available for up to 100 delivery rows.
- Local filters update within 100 ms.
- Avoid per-row delivery detail fetches.
- Avoid per-row timeline fetches.
- Avoid proof media fetches.

Data strategy:
- Fetch admin deliveries once.
- Fetch active issue lists in parallel.
- Fetch station context once when station warnings are enabled or when default product decision includes station warning display.
- Do not poll automatically.
- Use manual refresh.

## Testing Requirements
Unit tests:
- Blocker derivation from delivery status.
- Payment blocker derivation.
- Issue enrichment merge by delivery ID.
- Station context warning derivation.
- Severity priority sorting.
- Scope warning derivation from overview count.
- Local search.
- Filter chip removal.
- Analytics sanitizer.

Integration tests:
- Admin deliveries success with issue enrichment success.
- Admin deliveries success with issue enrichment failure.
- Station context failure.
- Overview count greater than derived rows.
- Empty loaded queue.
- Filtered empty state.
- Row primary action routing for custody issue.
- Row primary action routing for payment failed.
- Unauthorized admin route behavior.

Accessibility tests:
- Heading order.
- Table headers.
- Keyboard filter flow.
- Keyboard row action flow.
- Status announcements.
- Mobile card labels.

Visual regression states:
- Desktop ready queue with combined blockers.
- Desktop partial issue context.
- Desktop scope limited.
- Empty queue.
- Filtered empty.
- Mobile blocked cards.
- Tablet wrapped filters.

## Implementation Checklist
- Create route `/admin/deliveries/blocked`.
- Add protected admin shell entry.
- Fetch `admin_deliveries`.
- Fetch active issue lists for `open`, `in_review`, and `escalated`.
- Optionally fetch `admin_overview` for scope comparison.
- Optionally fetch `admin_stations` for station context.
- Build pure blocker derivation helper.
- Build pure sort helper.
- Build pure filter helper.
- Build analytics sanitizer.
- Build desktop table and mobile card list from the same row model.
- Add partial context banners.
- Add scope warning.
- Add route actions only.
- Add tests for derivation, sorting, filters, and privacy.

## Do Not Build
Do not build:
- A new backend endpoint from the frontend.
- Server-side search.
- Server-side pagination.
- Bulk resolve.
- Bulk escalation.
- Delivery status mutation.
- Custody mutation.
- Payment confirmation.
- Refund execution.
- Station override.
- Hidden raw issue text in analytics.
- Row-level delivery detail prefetch for every delivery.

## Acceptance Criteria
The screen is complete when:
- `/admin/deliveries/blocked` renders with test id `screen-admin-blocked-delivery-queue`.
- The base list reads `admin_deliveries`.
- Active issues enrich rows when `list_issues` succeeds.
- The queue derives blocker rows without unsupported backend query params.
- Scope limits are visible.
- Issue, payment, custody, station, and combined blocker types render correctly.
- Sort and filters operate locally over loaded rows.
- Row actions route to the correct existing screens.
- No row action mutates data.
- Partial issue or station context does not break the queue.
- Sensitive issue, receiver, proof, payment, and actor data stay out of analytics.
- Accessibility and responsive requirements pass.

## Claude Code Build Brief
Build `AdminBlockedDeliveryQueue` as a read-only admin worklist for `/admin/deliveries/blocked`. Use `admin_deliveries` as the base latest-100 delivery set, enrich with active `list_issues` responses, and optionally compare against `admin_overview` and `admin_stations` for scope and station context. Derive blocker rows client-side, label scope limits clearly, route admins to detail screens, and do not add mutation actions. The screen must be fast, dense, accessible, and honest about backend limits.

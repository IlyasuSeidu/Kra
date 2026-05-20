# AdminDeliveryExplorer Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminDeliveryExplorer` |
| Route | `/admin/deliveries` |
| Primary test ID | `screen-admin-delivery-explorer` |
| Surface | Admin web console |
| Backend coverage | `admin_deliveries` through `GET /v1/admin/deliveries` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `empty`, `filters`, `no_filter_results`, `stale`, `refreshing`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, protected admin shell |
| Related screens | `AdminDeliveryDetail`, `AdminPackageDetail`, `AdminCustodyChain`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminPaymentReconciliation`, `AdminStations`, `AdminAuditEvents` |
| Current implementation mode | Read-only recent-delivery explorer over the current admin delivery list contract |

## Outcome
`AdminDeliveryExplorer` gives admins a fast, trustworthy way to scan recent deliveries, identify operational risk, and open the right delivery detail screen.

The screen must answer:
- `Which recent deliveries need attention?`
- `Which delivery status is each row in?`
- `What is the payment state?`
- `Where did the delivery start and where should it end?`
- `Who is the sender record?`
- `Which receiver name is attached to the delivery?`
- `When was the latest event recorded?`
- `Which delivery should I open next?`

The screen is an explorer and router. It does not mutate delivery state, does not replace delivery detail, and does not claim to cover the full delivery database until backend pagination and server-side filtering exist.

## Product Definition
This screen allows admins to:
- Load recent admin delivery rows.
- Review current delivery status.
- Review current payment status.
- Review origin and destination station IDs.
- Review tracking code.
- Review delivery ID.
- Review sender ID.
- Review receiver name returned by the admin endpoint.
- Review latest event timestamp.
- Apply local filters to the current response.
- Search locally within the current response.
- Sort locally within the current response.
- Open delivery detail.
- Open package detail.
- Open custody chain.
- Open issue queue with delivery context when route support exists.
- Refresh the recent-delivery snapshot.

It does not allow admins to:
- Create deliveries.
- Cancel deliveries.
- Update delivery status.
- Reassign drivers.
- Reassign couriers.
- Edit receiver details.
- Edit sender details.
- Edit payment state.
- Resolve issues.
- Approve refunds.
- Export the delivery list.
- Claim full database search.
- Request unsupported backend query parameters.
- Show receiver phone numbers.
- Show receiver addresses.
- Show proof assets.
- Show package descriptions.
- Show raw payment provider references.

## Backend Boundary
The current backend list endpoint returns recent deliveries only:
```http
GET /v1/admin/deliveries
```

Operation:
```text
admin_deliveries
```

Current service behavior:
- Backend calls `deliveries.listRecent(100)`.
- Response contains `generatedAt`.
- Response contains `deliveries`.
- No query schema exists for server-side search.
- No query schema exists for server-side filters.
- No cursor or page token exists.
- No total count exists.
- No station details beyond station IDs exist.
- No sender profile details beyond sender ID exist.
- No receiver details beyond receiver name exist.

Therefore:
- UI filters are local filters over the loaded response.
- UI search is local search over the loaded response.
- UI sort is local sort over the loaded response.
- UI must label the data as recent deliveries.
- UI must not imply all historical deliveries are searched.
- UI must not send unsupported query parameters.

Future backend work may add server-side search, pagination, station joins, and export. This screen must be written so those additions can replace local filters without changing the user-facing mental model.

## Users
Primary:
- `ops_admin` scanning operational delivery state and opening delivery details.
- `support_admin` finding a delivery tied to an issue or customer support request.
- `finance_admin` finding deliveries by payment status and opening reconciliation context.
- `super_admin` reviewing delivery flow across the network.

Secondary:
- QA validating admin list behavior.
- Security reviewers validating data exposure.
- Engineering leads validating frontend and backend contract discipline.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- Admin overview delivery status section.
- Admin overview issue-like delivery alert.
- Admin shell navigation.
- Blocked delivery queue empty fallback.
- Issue detail related delivery link.
- Payment reconciliation related delivery link.
- Station detail queue link.
- Direct route `/admin/deliveries`.

The screen must not be reachable:
- Without authenticated admin role validation.
- From public web.
- From receiver tracking.
- From sender app.
- From station operator mobile app.
- From driver mobile app.
- From courier mobile app.

## Real-World Context
Admins use this screen when the platform is active and pressure is high. They may be searching for a tracking code from a support call, checking whether payment is blocking progress, finding deliveries stuck in issue-like states, or opening a delivery detail to inspect custody and proof.

The screen must be:
- Fast to scan.
- Clear about data limits.
- Dense but readable.
- Safe with personal data.
- Useful under incident pressure.
- Friendly to keyboard workflows.
- Honest when filters apply only to the current recent set.

## User Goal
Primary goal:
- Find and open the right recent delivery quickly.

Secondary goals:
- Identify blocked or risky delivery rows.
- Filter by delivery status.
- Filter by payment status.
- Filter by station IDs.
- Search by tracking code or delivery ID.
- Confirm latest event recency.
- Open related package, custody, issue, or finance screen.

## Scope
In scope:
- Recent delivery list fetch.
- Local search over loaded rows.
- Local filters over loaded rows.
- Local sorting over loaded rows.
- Risk-first visual hierarchy.
- Row actions.
- Loading, empty, no-filter-results, stale, error, unauthorized, and session-expired states.
- Accessibility.
- Analytics.
- Security and privacy boundaries.

Out of scope:
- Server-side search.
- Server-side pagination.
- Infinite scroll.
- Bulk actions.
- Delivery mutation.
- Payment mutation.
- Issue mutation.
- Station mutation.
- Export report.
- Map view.
- Live tracking map.
- Proof viewer.
- Custody timeline rendering.

## Design Thesis
This screen should feel like an air-traffic list for logistics operations: dense, exact, and calm, with risk surfaced before decoration.

Visual thesis:
- `operations ledger`: wide white canvas, compact graphite table, colored status rails, strong filter bar, sticky row context, and quiet but obvious risk markers.

Design principles:
- Lead with data freshness and scope.
- Keep IDs copyable.
- Prioritize rows needing attention.
- Make filters explicit and reversible.
- Avoid hiding risk behind visual effects.
- Keep every row action tied to a real route.
- Avoid collecting more data than the endpoint returns.

Restraint rule:
- No maps, no animated route lines, no charts that compete with the table, no invented full-search claims, no bulk mutation toolbar, and no unsupported backend filters.

## Research Inputs
Relevant external references:
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense enterprise row scanning, sorting, filtering, and row actions.
- [Microsoft Fluent data grid](https://fluent2.microsoft.design/components/web/react/core/datagrid/usage): supports accessible enterprise table behavior and keyboard-friendly data grids.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible tabular data, responsive behavior, and clear column labels.
- [USWDS search component](https://designsystem.digital.gov/components/search/): supports clear search input behavior and result scoping.
- [Material Design cards](https://m3.material.io/components/cards/overview): supports mobile row cards when a table collapses.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable movement through filters, table, and row actions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing load, refresh, filter, and error states.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/02-admin-overview.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/admin.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `apps/admin/src/index.ts`

## Backend Contract
Endpoint:
```http
GET /v1/admin/deliveries
```

Operation:
```text
admin_deliveries
```

Auth:
- Authenticated admin only.
- Backend uses `requireAdmin`.

Response:
```json
{
  "generatedAt": "2026-05-20T12:00:00.000Z",
  "deliveries": [
    {
      "deliveryId": "DEL-123",
      "trackingCode": "KRA-ABC123",
      "currentStatus": "in_transit",
      "paymentStatus": "confirmed",
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "senderId": "USR-SEN-001",
      "latestOccurredAt": "2026-05-20T11:45:00.000Z",
      "receiverName": "Ama Mensah"
    }
  ]
}
```

Fields:
- `generatedAt`: backend snapshot time.
- `deliveries`: recent delivery rows.
- `deliveryId`: canonical delivery identifier.
- `trackingCode`: customer-facing tracking code.
- `currentStatus`: current delivery lifecycle status.
- `paymentStatus`: current payment lifecycle status.
- `originStationId`: origin station identifier.
- `destinationStationId`: destination station identifier.
- `senderId`: sender user identifier.
- `latestOccurredAt`: latest lifecycle event timestamp.
- `receiverName`: receiver display name returned by admin endpoint.

## Delivery Status Labels
Supported delivery statuses from shared state machine:
- `draft`: `Draft`
- `created`: `Created`
- `received_at_origin`: `Received at origin`
- `awaiting_driver_assignment`: `Awaiting driver assignment`
- `assigned_to_driver`: `Assigned to driver`
- `dispatched_from_origin`: `Dispatched from origin`
- `in_transit`: `In transit`
- `received_at_destination`: `Received at destination`
- `awaiting_receiver_pickup`: `Awaiting receiver pickup`
- `awaiting_final_mile_assignment`: `Awaiting final-mile assignment`
- `assigned_for_final_mile`: `Assigned for final mile`
- `out_for_delivery`: `Out for delivery`
- `delivered`: `Delivered`
- `issue_reported`: `Issue reported`
- `on_hold`: `On hold`
- `delivery_failed`: `Delivery failed`
- `cancelled`: `Cancelled`
- `closed`: `Closed`

Risk grouping:
- Critical attention: `issue_reported`, `on_hold`, `delivery_failed`
- Payment or ops review: `cancelled`, `draft`, `created`
- Active station or transport work: `received_at_origin`, `awaiting_driver_assignment`, `assigned_to_driver`, `dispatched_from_origin`, `in_transit`, `received_at_destination`
- Final-mile work: `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, `assigned_for_final_mile`, `out_for_delivery`
- Complete: `delivered`, `closed`

The UI may use these risk groups for row tone and default sort, but it must still show the exact backend status.

## Payment Status Labels
Supported payment statuses:
- `pending`: `Pending`
- `confirmed`: `Confirmed`
- `failed`: `Failed`
- `refund_pending`: `Refund pending`
- `refunded`: `Refunded`

Payment risk grouping:
- Needs attention: `failed`, `refund_pending`
- Waiting: `pending`
- Clear: `confirmed`, `refunded`

The UI must not initiate payment actions from this screen.

## Required Layout
Desktop layout:
- Protected admin shell.
- Breadcrumb row.
- Page title and scope notice.
- Snapshot freshness row.
- Filter/search toolbar.
- Active filter chips.
- Recent delivery table.
- Right-side optional row preview only if implemented without extra data fetch.
- Empty and error states in table region.

Tablet layout:
- Header and filters full width.
- Table remains available with horizontal scroll.
- Sticky first column for delivery identity.
- Row action menu remains visible.

Mobile-width web layout:
- Header.
- Scope notice.
- Search.
- Filter chips.
- Delivery cards instead of wide table.
- Each card has primary identity, status, payment, stations, latest event, and actions.

Minimum content order:
1. Skip link.
2. Admin shell.
3. Breadcrumb.
4. Page title.
5. Scope notice.
6. Snapshot freshness.
7. Search input.
8. Filters.
9. Active filter summary.
10. Results count.
11. Delivery rows.
12. Pagination notice or backend limit notice.
13. Footer metadata.

## Page Header
Title:
```text
Delivery explorer
```

Subtitle:
```text
Review the latest admin delivery rows and open the right record for deeper action.
```

Scope notice:
```text
Showing the latest 100 deliveries returned by the backend. Search and filters apply to this loaded set.
```

Header actions:
- `Refresh`
- `Open blocked queue`
- `Open overview`

Metadata:
- `Generated {relative time}`
- Exact timestamp in accessible text.
- `Source: admin_deliveries`

Refresh behavior:
- Calls `GET /v1/admin/deliveries`.
- Keeps current rows visible during refresh.
- Preserves local filters.
- Recomputes result count after refresh.
- Announces refresh state.

## Filter And Search Toolbar
Search input:
- Label: `Search loaded deliveries`
- Hint: `Tracking code, delivery ID, sender ID, receiver name, or station ID`
- Scope helper: `Search applies to the latest 100 loaded rows.`
- Clear button.

Search fields:
- `trackingCode`
- `deliveryId`
- `senderId`
- `receiverName`
- `originStationId`
- `destinationStationId`

Filters:
- Delivery status.
- Payment status.
- Origin station ID.
- Destination station ID.
- Risk group.
- Latest event age.

Delivery status filter:
- Multi-select.
- Shows all statuses present in loaded response.
- Optional full status list may be available if design system supports it.

Payment status filter:
- Multi-select.
- Shows supported payment statuses.

Station filters:
- Text or select from station IDs present in loaded response.
- Origin and destination are separate filters.
- Do not fetch station names on this screen.

Risk group filter:
- `Needs attention`
- `Active transport`
- `Final mile`
- `Complete`

Latest event age filter:
- `Last hour`
- `Today`
- `Older than 24 hours`
- `Older than 72 hours`

Rules:
- All filters are local to the loaded response.
- Active filters appear as removable chips.
- `Clear filters` resets search, filters, and sort.
- Filter state may sync to URL query params for shareable admin links.
- Query params must not trigger unsupported backend query params.

## Results Summary
Show:
- `{visibleCount} of {loadedCount} loaded deliveries`
- `Generated {relative time}`
- Active filter count.
- Backend scope notice when filters are active.

If filters active:
```text
Filters are applied to the latest 100 loaded deliveries.
```

If search active:
```text
Search is applied to the latest 100 loaded deliveries.
```

Do not show:
- Total platform delivery count.
- Total matching delivery count.
- Page number.
- Cursor state.
- Any claim that unloaded deliveries were searched.

## Delivery Table
Columns:
- Attention.
- Tracking code.
- Delivery ID.
- Current status.
- Payment.
- Origin.
- Destination.
- Receiver.
- Sender ID.
- Latest event.
- Actions.

Attention column:
- Shows risk marker derived from current status and payment status.
- Critical for `issue_reported`, `on_hold`, `delivery_failed`, `failed`, `refund_pending`.
- Warning for `pending`, old latest event, or early lifecycle states.
- Clear for delivered or closed with non-risk payment status.
- Must include text, not color alone.

Tracking code column:
- Primary row identity.
- Copy action.
- Link to delivery detail.

Delivery ID column:
- Secondary row identity.
- Copy action.
- Monospace.

Current status column:
- Status badge with readable label.
- Exact status available in accessible text.
- Critical statuses visible without opening row.

Payment column:
- Payment status badge.
- Link to finance context only if route exists.
- No payment action.

Origin and destination columns:
- Show station IDs.
- Link to station detail if route exists.
- Do not invent station names.

Receiver column:
- Show receiver name from endpoint.
- Do not show phone number or address.

Sender ID column:
- Show sender ID.
- Link to user detail when route exists.

Latest event column:
- Relative time.
- Exact timestamp in tooltip or accessible text.
- Sortable.
- Stale-looking row tone if older than configured operations threshold.

Actions column:
- `Open delivery`
- `Open package`
- `Open custody`
- `Open issues`
- `Copy tracking code`

Table behavior:
- Sticky header on desktop.
- Sticky first identity column when horizontally scrolled.
- Rows have minimum 44px interactive target height.
- Keyboard row actions must be reachable.
- Sorting indicators must be visible and announced.

## Row Action Rules
`Open delivery`:
- Route: `/admin/deliveries/:deliveryId`
- Primary action.

`Open package`:
- Route: `/admin/deliveries/:deliveryId/package`
- Use only when route exists.

`Open custody`:
- Route: `/admin/deliveries/:deliveryId/custody`
- Use only when route exists.

`Open issues`:
- Route: `/admin/issues?deliveryId=:deliveryId`
- Use only when issue queue supports delivery filter.
- Otherwise disabled with reason `Issue queue delivery filter not implemented yet`.

`Copy tracking code`:
- Copies tracking code only.
- Announces success.
- Does not copy receiver or sender details.

Rules:
- No row action mutates delivery state.
- No bulk action toolbar.
- No silent navigation from row click without a clear link target.

## Default Sort
Default sort:
1. Critical attention rows.
2. Payment attention rows.
3. Older latest event within active statuses.
4. Latest event descending for normal rows.

User sort options:
- Latest event.
- Current status.
- Payment status.
- Origin station ID.
- Destination station ID.
- Tracking code.

Sort rules:
- Sorting is local to loaded response.
- Sort indicator must be visible.
- Sorting must preserve active filters.
- Sorting must not change backend query.

## Empty State
Empty response state appears when:
- Fetch succeeds.
- `deliveries.length === 0`.

Title:
```text
No recent deliveries returned
```

Body:
```text
The backend returned zero recent delivery rows for this admin view.
```

Actions:
- `Refresh`
- `Open overview`

Do not:
- Show a search prompt before data exists.
- Claim there are no deliveries in the platform.
- Create rows locally.

## No Filter Results State
No filter results state appears when:
- Fetch succeeds.
- Loaded rows exist.
- Local filters or search produce zero visible rows.

Title:
```text
No loaded deliveries match these filters
```

Body:
```text
Clear filters or refresh. This search only covers the latest loaded deliveries.
```

Actions:
- `Clear filters`
- `Refresh`

Do not:
- Claim no delivery exists.
- Call unsupported backend search.
- Hide active filters.

## Loading State
Initial loading:
- Show header frame.
- Show scope notice.
- Show toolbar skeleton.
- Show table skeleton with columns.
- Announce `Loading admin deliveries`.

Loading rules:
- Do not render empty state before fetch completes.
- Do not render stale data without stale label.
- Do not enable filters until fields are available.

Refreshing:
- Keep existing rows visible.
- Show refresh indicator near timestamp.
- Preserve filters.
- Announce `Refreshing admin deliveries`.
- On success, update rows and result count.
- On failure, keep previous rows and show refresh error.

## Stale State
Use snapshot age from `generatedAt`.

Recommended threshold:
- Older than 5 minutes: stale notice.
- Older than 15 minutes: strong stale notice.

Stale copy:
```text
This delivery list may be stale. Refresh before acting on a delivery.
```

Rules:
- Do not change row statuses locally.
- Do not hide rows.
- Do not remove filters.
- Do not auto-refresh in a tight loop.

## Error States
`not_authorized`:
- Title: `Admin access required`
- Body: `Your current account cannot view admin deliveries.`
- CTA: `Return to admin sign in`
- No delivery data visible.

`session_expired`:
- Title: `Session expired`
- Body: `Sign in again to review admin deliveries.`
- CTA: `Sign in again`
- Preserve safe return path.

`api_error`:
- Title: `Delivery explorer unavailable`
- Body: `The admin delivery list could not be loaded.`
- CTA: `Retry`
- Secondary CTA: `Open overview`
- Show request ID when present.

`rate_limited`:
- Title: `Too many refresh attempts`
- Body: `Wait a moment before refreshing the delivery explorer again.`
- CTA: `Try again later`

Error rules:
- Never expose raw error objects.
- Never expose stack traces.
- Never show old data without stale warning.
- Never infer rows from other screens.

## Privacy And Data Minimization
Allowed fields on this screen:
- Delivery ID.
- Tracking code.
- Current status.
- Payment status.
- Origin station ID.
- Destination station ID.
- Sender ID.
- Receiver name.
- Latest event timestamp.

Not allowed on this screen:
- Receiver phone number.
- Receiver address.
- Sender name.
- Sender email.
- Package description.
- Proof images.
- Signature assets.
- Payment provider reference.
- Payment phone number.
- Webhook payload.
- Issue body.
- Staff personal data.

Receiver name handling:
- Receiver name is returned by backend and may be shown.
- Do not make receiver name a prominent table identity.
- Keep tracking code and delivery ID as primary identity.
- Do not send receiver name in analytics.

Copy behavior:
- Copy buttons only copy IDs or tracking code.
- No copy action for receiver name.

## Security
Security rules:
- Require admin role before rendering rows.
- Do not store delivery list in local storage.
- Do not store delivery list in indexed database.
- Clear in-memory data on sign out.
- Do not log response rows to console.
- Do not emit row payloads to analytics.
- Do not include receiver name in URL.
- Do not include sender ID in analytics unless explicitly approved by telemetry policy.

Authorization:
- All admin roles may view the screen if backend authorizes `requireAdmin`.
- Related owner screens may enforce stricter capabilities.
- If user can view list but cannot open a related screen, target screen handles denied state.

## Accessibility Requirements
Semantic structure:
- One `h1`.
- Filter toolbar is a labelled region.
- Results summary uses status region.
- Desktop data uses semantic table or accessible data grid.
- Mobile cards use list semantics.
- Row actions are real buttons or links.

Keyboard:
- Search input reachable after header.
- Filter controls reachable in logical order.
- Table headers sortable by keyboard.
- Row actions reachable without mouse.
- Copy actions announce success.
- No keyboard trap in row action menu.

Screen reader:
- Announce loaded result count.
- Announce filter result count changes.
- Announce refresh start and completion.
- Include exact status labels.
- Include exact timestamp for latest event.
- Provide table captions.

Contrast:
- Status badges meet WCAG AA.
- Critical and warning markers include labels.
- Disabled actions remain readable.

Motion:
- No constant row animation.
- Refresh indicator must not distract.
- Respect `prefers-reduced-motion`.

## Responsive Rules
Desktop:
- Use full table.
- Keep row actions visible.
- Allow horizontal scroll if needed.

Tablet:
- Keep table with horizontal scroll.
- Sticky first column.
- Filters wrap into two rows.

Mobile-width:
- Convert rows into cards.
- Card title: tracking code.
- Card subtitle: delivery ID.
- Card facts:
  - Status.
  - Payment.
  - Origin to destination.
  - Receiver.
  - Latest event.
- Card actions:
  - Open delivery.
  - More actions.

Mobile must not:
- Hide critical status.
- Hide payment risk.
- Require horizontal scrolling for primary facts.

## Analytics
Emit:
- `admin_delivery_explorer_viewed`
- `admin_delivery_explorer_refreshed`
- `admin_delivery_explorer_search_changed`
- `admin_delivery_explorer_filter_changed`
- `admin_delivery_explorer_sort_changed`
- `admin_delivery_explorer_row_opened`
- `admin_delivery_explorer_copy_tracking_clicked`
- `admin_delivery_explorer_error_seen`
- `admin_delivery_explorer_stale_seen`
- `admin_delivery_explorer_no_filter_results_seen`

Event properties:
- `loadedCount`
- `visibleCount`
- `hasSearch`
- `activeFilterCount`
- `deliveryStatusFilterCount`
- `paymentStatusFilterCount`
- `riskGroup`
- `sortKey`
- `sortDirection`
- `rowCurrentStatus`
- `rowPaymentStatus`
- `rowAgeBucket`

Do not emit:
- Receiver name.
- Sender ID.
- Delivery ID.
- Tracking code.
- Station IDs.
- Raw row data.

## Test Plan
Unit tests:
- Renders loading state.
- Renders empty state for zero rows.
- Renders ready table for rows.
- Renders generated timestamp.
- Renders scope notice for latest 100 loaded deliveries.
- Renders every response field in correct place.
- Maps delivery statuses to readable labels.
- Maps payment statuses to readable labels.
- Applies local search by tracking code.
- Applies local search by delivery ID.
- Applies local search by sender ID.
- Applies local search by receiver name.
- Applies local search by station ID.
- Applies delivery status filter.
- Applies payment status filter.
- Applies origin station filter.
- Applies destination station filter.
- Applies risk group filter.
- Shows no-filter-results state.
- Clears filters.
- Sorts by latest event.
- Sorts by status.
- Preserves filters during refresh.
- Keeps old data visible on refresh failure with warning.
- Does not create backend query params for local filters.

Integration tests:
- Calls `GET /v1/admin/deliveries` on route entry.
- Does not call unsupported query params.
- Does not call mutation endpoints.
- Refresh calls endpoint once.
- Open delivery routes to `/admin/deliveries/:deliveryId`.
- Open package routes to `/admin/deliveries/:deliveryId/package`.
- Open custody routes to `/admin/deliveries/:deliveryId/custody`.
- Copy tracking copies only tracking code.
- Session expired routes to sign-in with safe return path.
- Unauthorized role sees denied state.

Accessibility tests:
- `screen-admin-delivery-explorer` exists.
- Page has one `h1`.
- Table has caption or accessible name.
- Column headers are announced.
- Sort state is announced.
- Result count changes are announced.
- Search input has label and helper.
- Filter controls have accessible names.
- Row actions are keyboard reachable.
- Status badges are not color-only.
- Axe scan has no serious or critical violations.

End-to-end tests:
- Admin opens delivery explorer from overview.
- Admin searches tracking code in loaded rows.
- Admin filters issue-like status rows.
- Admin filters payment failure rows.
- Admin opens delivery detail from row.
- Admin clears filters and sees loaded count restored.
- Unauthorized sender cannot view route.

Visual regression tests:
- Desktop ready table.
- Desktop empty state.
- Desktop filtered no-results state.
- Desktop stale state.
- Mobile-width delivery cards.
- Tablet horizontal table.
- API error state.

## Acceptance Criteria
The screen is complete only when:
- Route `/admin/deliveries` renders protected admin page.
- Primary test ID is `screen-admin-delivery-explorer`.
- Screen reads only `admin_deliveries` for its list.
- Screen does not send unsupported backend query params.
- Screen clearly labels results as latest loaded deliveries.
- Local search works over loaded rows.
- Local filters work over loaded rows.
- Sort works over loaded rows.
- Delivery status and payment status labels are readable.
- Critical rows are visually and textually identifiable.
- Row actions route to real detail screens or show a clear unavailable owner state.
- Loading, empty, no-filter-results, stale, error, denied, and session-expired states work.
- No mutation endpoint is called.
- Receiver phone, receiver address, package detail, proof, payment references, and issue content are not shown.
- Accessibility tests pass.
- Analytics exclude sensitive row identifiers and receiver data.

## Implementation Notes For Claude Code
Build this screen as a read-only admin route.

Use:
- `adminDeliveryListResponseSchema`
- operation key `admin_deliveries`
- endpoint `/v1/admin/deliveries`
- shared delivery status labels from `deliveryStatuses`
- shared payment status labels from `paymentStatusSchema`

Recommended component structure:
- `AdminDeliveryExplorerPage`
- `AdminDeliveryScopeNotice`
- `AdminDeliveryFilterToolbar`
- `AdminDeliveryResultsSummary`
- `AdminDeliveryTable`
- `AdminDeliveryMobileCardList`
- `AdminDeliveryRowActions`
- `AdminDeliveryEmptyState`
- `AdminDeliveryErrorState`

Required implementation boundaries:
- Do not implement delivery mutation here.
- Do not implement server-side search until backend contract exists.
- Do not implement pagination until backend contract exists.
- Do not implement export from this screen.
- Do not fetch unrelated detail data for every row.
- Do not add receiver phone or address.
- Do not add payment provider references.
- Do not add proof previews.

## Future Enhancements
Possible additions after backend support:
- Server-side search.
- Cursor pagination.
- Saved admin views.
- Export report route.
- Station name joins.
- Sender profile joins.
- Delivery issue count joins.
- SLA age columns.
- Bulk assignment review.
- Real-time refresh toggle with safe rate limits.

These enhancements require explicit backend contracts, authorization rules, and tests before UI implementation.

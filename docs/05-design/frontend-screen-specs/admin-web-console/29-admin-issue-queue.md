# Admin Issue Queue Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminIssueQueue` |
| Route | `/admin/issues` |
| Test id | `screen-admin-issue-queue` |
| Surface | Admin web console |
| Backend coverage | `list_issues`; optional row expansion with `get_delivery` or `get_issue` only after user intent |
| Offline critical | No |
| Required read role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin`; authenticated non-admin users see only accessible delivery issues where app routing permits |
| Required submit role | None on this screen |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `partial_scope`, `refreshing`, `stale_data`, `unsupported_filter`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminOverview`, `AdminLaunchReadiness`, `AdminLaunchReadinessDetail`, `AdminBlockedDeliveryQueue`, `AdminDeliveryDetail`, `AdminStationDetail`, `AdminRefundEvidenceReview` |
| Related screens | `AdminIssueDetail`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminRefundEvidenceReview`, `AdminPaymentReconciliation`, `AdminAuditEvents`, `AdminStaffActivityLog`, `OpsIssueCreate`, `SenderSupportThread` |

## Purpose
`AdminIssueQueue` is the admin triage worklist for operational, support, payment, refund, custody, loss, damage, and handoff issues. It helps the admin team decide what needs attention first, which team owns it, which delivery or payment record to inspect, and where to route the next action.

The screen should answer:
- `What issues need attention now?`
- `Which issues are P1, open, escalated, or aging?`
- `Which issues are tied to payment, refund, handoff, loss, damage, or delay?`
- `Which issues belong to a delivery I should inspect?`
- `Which issues should go to support, operations, finance, or a super admin?`
- `What filters are actually supported by the backend?`
- `Which issue detail route owns resolution or escalation?`
- `Where should the reviewer go next?`

This screen is a queue and routing surface. It must not resolve, close, escalate, approve refunds, settle refunds, override custody, upload proof, or change delivery state directly. Those actions belong in detail or specialist screens with their own confirmation flows.

## Backend Reality
The concrete endpoint is:
```http
GET /v1/issues
```

Operation:
```text
list_issues
```

Auth scope:
```text
authenticated
```

Supported query fields:
- `deliveryId`
- `status`
- `severity`
- `limit`

Supported issue statuses:
- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Supported severities:
- `p1`
- `p2`
- `p3`

Supported categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Response shape:
```json
{
  "issues": [
    {
      "issueId": "ISS-1001",
      "deliveryId": "DEL-1001",
      "status": "open",
      "severity": "p1",
      "category": "loss",
      "summary": "Package missing after destination handoff",
      "description": "Courier could not produce return proof.",
      "reporter": {
        "actorId": "USR-1001",
        "actorRole": "support_admin"
      },
      "createdAt": "2026-05-20T09:00:00.000Z",
      "updatedAt": "2026-05-20T10:00:00.000Z"
    }
  ]
}
```

Important backend facts:
- Admin roles `ops_admin`, `support_admin`, `finance_admin`, and `super_admin` can list across recent issues.
- Non-admin operational users are scoped to accessible deliveries.
- Without `deliveryId`, admin listing uses recent issues and default limit `50`.
- Maximum limit is `100`.
- `status` and `severity` are backend filters.
- `deliveryId` is a backend filter.
- Category is not a backend query filter.
- Station ID is not a backend query filter.
- Reporter role is not a backend query filter.
- SLA age is not a backend query filter.
- Search text is not a backend query filter.
- Sort order is backend repository order, generally newest updated first.
- `list_issues` does not join delivery detail, station detail, payment detail, or refund evidence.

Therefore:
- The UI may call only supported query fields.
- Unsupported filters must be client-side against loaded rows or clearly disabled.
- Global counts must be labeled as loaded-scope counts, not full-system totals.
- Row actions must route to owner screens instead of mutating issue state here.

## Related Mutations Not Owned Here
The backend also exposes issue mutations:
- `create_issue`
- `escalate_issue`
- `resolve_issue`

`AdminIssueQueue` must not call them.

Why:
- Queue triage needs fast scanning and safe routing.
- Escalation and resolution require issue detail context, notes, transition rules, and role checks.
- Resolution needs `nextStatus`, optional `resolutionCode`, and `note`.
- Escalation needs `reasonCode` and `note`.
- Those high-risk actions belong in `AdminIssueDetail` or specialist exception screens.

## Context Reality
The route may be opened with these query params:
- `status`
- `severity`
- `deliveryId`
- `limit`
- `category`
- `stationId`
- `source`

Only these should be sent to backend:
- `status`
- `severity`
- `deliveryId`
- `limit`

Handle unsupported params:
- Keep them visible as scoped context chips.
- Do not send them to the backend.
- Apply client-side filtering only when enough loaded data supports it.
- If not enough data supports it, show `unsupported_filter`.

Examples:
- `/admin/issues?severity=p1&status=open` sends `severity=p1&status=open`.
- `/admin/issues?stationId=STA-ACCRA-CENTRAL` sends no `stationId`; show a chip saying station filter needs a station-aware issue endpoint.
- `/admin/issues?category=payment` sends no `category`; apply client-side category filtering to loaded rows only.
- `/admin/issues?deliveryId=DEL-1001` sends `deliveryId=DEL-1001`.

## Primary Users
Primary:
- `support_admin` triaging customer and support issues.
- `ops_admin` triaging operational blockers, custody issues, handoff issues, loss, and damage.
- `finance_admin` reviewing payment, refund, and reconciliation-related issues.
- `super_admin` monitoring unresolved high-risk work.

Secondary:
- QA validating issue lifecycle behavior.
- Security reviewer validating role boundaries.
- Product owner validating admin workload design.
- Claude Code implementing the admin console later.

Non-users:
- Public visitors.
- Sender-facing support users.
- Receiver public tracking users.
- Drivers and couriers unless the app intentionally provides an operational variant elsewhere.

## User Intent Model
Admins open this page to:
- Start a shift triage pass.
- Find all open P1 work.
- Find escalated issues.
- Find issues for one delivery.
- Find refund or payment-related records.
- Find handoff, loss, or damage issues.
- Check whether queues are aging.
- Route to the correct detail screen.
- See what cannot be filtered yet because the backend does not support it.

The page must optimize for triage speed, not record editing.

## UX Thesis
The screen should feel like a command-grade operations queue: calm, dense, high-signal, and impossible to confuse with a customer inbox.

The UI should emphasize:
- Risk first.
- Open and escalated work first.
- Clear ownership.
- Honest backend filter limits.
- Fast keyboard scanning.
- Direct route actions.
- Minimal page chrome.

The design should avoid:
- Chat-like layout.
- Consumer ticket inbox tone.
- Overly colorful badge clutter.
- Hidden row actions.
- Counts that appear global when they are loaded-scope only.
- Inline mutation controls.

## Design Inspiration And Evidence
Use these external standards as design inputs:
- [GOV.UK Tag](https://design-system.service.gov.uk/components/tag/) for clear, compact status and severity labels.
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/) for issue row detail summaries and expandable metadata.
- [GOV.UK Task list](https://design-system.service.gov.uk/components/task-list/) for queue sections that communicate done, blocked, open, and in-review states.
- [USWDS Table](https://designsystem.digital.gov/components/table/) for accessible dense tabular worklists with clear captions, headings, and responsive behavior.
- [USWDS Search](https://designsystem.digital.gov/components/search/) for search form accessibility patterns even though backend text search is not supported yet.
- [Atlassian Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/check-out-your-queues/) for queue-oriented service work where users scan, filter, and act from prioritized lists.
- [W3C WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) for announcing refreshes, filter results, and state changes.

Kra-specific sources:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/11-admin-blocked-delivery-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`

## Information Architecture
Page sections:
- Queue header.
- Scope and filter bar.
- Priority summary.
- Workstream lanes.
- Issue table.
- Row expansion drawer.
- Unsupported filter notice.
- Empty or error state.
- Route action footer.

Desktop layout:
- Header full width.
- Filter bar sticky below admin shell header.
- Left rail for saved queue views and workstream chips.
- Main table in the center.
- Right rail for selected issue preview.

Tablet layout:
- Filter bar wraps.
- Saved views become horizontal chips.
- Selected issue preview moves below table.

Mobile web fallback:
- Single-column card list.
- Filter drawer.
- Sticky top result count and active filters.
- Row actions visible inside each card.

## First Viewport
The first viewport must show:
- Title: `Issue queue`.
- Loaded scope statement.
- Active backend filters.
- Unsupported filter chips if present.
- P1 open count from loaded rows.
- Escalated count from loaded rows.
- Ageing count from loaded rows.
- Refresh button.
- Primary table or empty state.

Example header:
```text
Issue queue
Open and escalated issues from the latest loaded records
Backend filters: status=open, severity=p1
Loaded: 42 issues
P1 open: 8
Escalated: 3
```

If loaded counts are not global:
```text
Counts reflect the loaded issues for this filter, not all historical records.
```

## Queue Views
Provide queue view chips:
- `Needs attention`
- `P1 open`
- `Escalated`
- `In review`
- `Payment and refund`
- `Loss and damage`
- `Handoff`
- `Delivery delays`
- `Resolved today`
- `Closed`

View behavior:
- `P1 open` maps to backend `severity=p1&status=open`.
- `Escalated` maps to backend `status=escalated`.
- `In review` maps to backend `status=in_review`.
- `Closed` maps to backend `status=closed`.
- `Payment and refund` calls backend with current supported filters, then client-filters categories `payment` and rows whose summary or resolution code indicates refund.
- `Loss and damage` client-filters categories `loss` and `damage`.
- `Handoff` client-filters category `handoff`.
- `Delivery delays` client-filters category `delay`.
- `Needs attention` should prefer `open`, `escalated`, and `p1` rows from loaded results.
- `Resolved today` client-filters `resolved` rows by date if loaded.

Unsupported client-only views must show:
```text
This view is filtered within the loaded records because the backend does not support this filter yet.
```

## Filter Contract
Backend filters:
- Status.
- Severity.
- Delivery ID.
- Limit.

Client-side filters:
- Category.
- Workstream.
- Text search over loaded rows.
- Reporter role.
- Age band.
- Source route.
- Station context when route includes station ID.

Filter controls:
- Status select.
- Severity select.
- Delivery ID exact input.
- Limit select: `25`, `50`, `100`.
- Category chips.
- Workstream chips.
- Text filter field labeled `Filter loaded issues`.
- Clear filters button.

Do not label client-side text filter as backend search.

Text field helper:
```text
Filters only the issues already loaded on this page.
```

Unsupported station helper:
```text
Station filtering is not supported by the issue API yet. Open station detail or use delivery filters.
```

## Issue Table
Default columns:
- Severity.
- Status.
- Category.
- Summary.
- Delivery ID.
- Age.
- Updated.
- Reporter role.
- Owner route.
- Actions.

Optional desktop columns:
- Issue ID.
- Resolution code.
- Escalated at.
- Resolved at.
- Closed at.

Default sort:
- P1 before P2 before P3.
- Open and escalated before in-review.
- Older unresolved rows before newer unresolved rows within same severity.
- Resolved and closed rows after active rows.

Sort options:
- `Highest severity`.
- `Oldest active`.
- `Newest updated`.
- `Status`.
- `Category`.

Table caption:
```text
Admin issue queue results
```

Row actions:
- `Open issue`.
- `Open delivery`.
- `Open refund evidence` for payment/refund rows when payment ID is known from context; otherwise disabled with reason.
- `Open custody review` for handoff, loss, or damage rows.
- `Open payment reconciliation` for payment rows when payment ID is known from context.

Do not show mutation actions in the table.

## Row Expansion
Expanded row content:
- Issue ID.
- Full summary.
- Description when present.
- Reporter actor role.
- Reporter actor ID when role policy allows.
- Created at.
- Updated at.
- Escalated at.
- Escalation reason code.
- Resolved at.
- Resolution code.
- Resolution note.
- Closed at.
- Delivery ID.
- Suggested next route.

Expansion behavior:
- Expand one row at a time by default.
- Allow multiple expanded rows only if existing admin table patterns support it.
- Keep keyboard focus on the expanded row.
- Announce expansion state to screen readers.

Do not fetch `get_issue` automatically for every row. The list response already includes the issue fields needed for queue triage. Fetch detail only when the user opens the detail route or explicitly expands a row that needs fresh detail.

## Workstream Classification
Derive workstream:

| Category | Workstream | Primary owner |
| --- | --- | --- |
| `payment` | Payment and refund | Finance |
| `loss` | Loss investigation | Operations |
| `damage` | Damage review | Operations and support |
| `handoff` | Custody and handoff | Operations |
| `delay` | Delivery delay | Support and operations |
| `other` | General support | Support |

Owner labels:
- `Finance`
- `Operations`
- `Support`
- `Super admin`
- `Shared`

Ownership must be guidance only. Do not enforce assignment because the backend has no assignment field in the issue contract.

## Severity Model
Severity labels:
- `p1`: `P1 critical`
- `p2`: `P2 high`
- `p3`: `P3 standard`

Severity visual rules:
- P1 uses danger accent and strong border.
- P2 uses warning accent.
- P3 uses neutral or info accent.
- Severity text must always be visible.
- Do not rely only on color.

P1 should include:
```text
Requires same-day review.
```

P2 should include:
```text
Review before normal queue closes.
```

P3 should include:
```text
Review in standard support order.
```

## Status Model
Status labels:
- `open`: `Open`
- `in_review`: `In review`
- `escalated`: `Escalated`
- `resolved`: `Resolved`
- `closed`: `Closed`

Status ordering:
- `escalated`
- `open`
- `in_review`
- `resolved`
- `closed`

Status guidance:
- `open`: needs first action.
- `in_review`: someone has started review.
- `escalated`: higher attention required.
- `resolved`: outcome recorded.
- `closed`: final state.

## Age And SLA Indicators
Compute age from `createdAt` and current time.

Age bands:
- `< 2h`: `New`
- `2h..8h`: `Aging`
- `8h..24h`: `At risk`
- `> 24h`: `Overdue`

P1 modifiers:
- P1 older than `2h` becomes `At risk`.
- P1 older than `8h` becomes `Overdue`.

Resolved and closed rows:
- Show age until resolution.
- Do not mark closed rows as active overdue.

Copy:
```text
Age is calculated in the admin console from issue timestamps.
```

Do not claim backend SLA enforcement unless a backend SLA field is added.

## Empty States
No issues:
```text
No issues were returned for this queue.
```

Filtered empty:
```text
No loaded issues match these filters.
```

Delivery-specific empty:
```text
No issues are linked to this delivery.
```

Unsupported filter empty:
```text
This filter is not supported by the issue API yet, and the loaded records do not contain enough data to narrow the queue.
```

Empty state actions:
- `Clear filters`.
- `Refresh queue`.
- `Open blocked deliveries`.
- `Open delivery explorer`.

Do not show `Create issue` as the primary admin queue action unless product explicitly adds admin issue creation from this surface. Existing issue creation belongs in staff and support create flows.

## Error States
Loading failure:
```text
Kra could not load the issue queue.
```

Forbidden:
```text
You do not have access to this issue queue.
```

Session expired:
```text
Your session expired. Sign in again to review issues.
```

Invalid query:
```text
One or more filters are not supported for this queue.
```

Partial route context:
```text
The source screen sent a filter this API does not support. The queue is showing supported filters only.
```

Error behavior:
- Preserve active filters in the URL.
- Provide retry.
- Provide clear filters.
- Do not drop the admin shell.
- Do not hide unsupported filter explanation.

## Unsupported Filter Rules
Unsupported filters currently include:
- `stationId`
- `category` as backend query
- `workstream`
- `reporterRole`
- `assignee`
- `paymentId`
- `refundStatus`
- `ageBand`
- `search`

UI behavior:
- Show unsupported filters as chips with `Not sent to API`.
- If client-side filtering is possible from loaded rows, apply it and label it `Loaded records only`.
- If client-side filtering is not possible, show a warning and keep backend-supported results visible.

Example:
```text
Station STA-ACCRA-CENTRAL was provided by the source route, but issue station filtering is not available. Showing supported issue filters only.
```

## Route Action Rules
Row route actions:
- `Open issue`: `/admin/issues/:issueId`
- `Open delivery`: `/admin/deliveries/:deliveryId`
- `Open custody review`: `/admin/custody-exceptions/:issueId` for `handoff`, `loss`, or `damage`
- `Open refund evidence`: `/admin/finance/refunds/:paymentId/evidence` only when payment ID is known
- `Open reconciliation`: `/admin/finance/reconciliation/:paymentId` only when payment ID is known
- `Open audit events`: `/admin/audit-events?targetType=issue&targetId=:issueId`

If `paymentId` is not present:
- Disable payment-specific actions.
- Explain: `Payment ID is not part of this issue row. Open issue detail or delivery detail first.`

If issue category is not handoff, loss, or damage:
- Do not show custody review as primary action.

## Read-Only Boundary
This screen must never include:
- Resolve button.
- Close button.
- Escalate button.
- Refund approval button.
- Refund settlement button.
- Payment status editor.
- Delivery state editor.
- Custody override control.
- Proof upload control.
- Bulk close.
- Bulk resolve.
- Bulk assign.
- Internal note composer.
- Customer reply composer.
- Provider reference editor.
- Station status override.

Allowed controls:
- Filters.
- Sort.
- Refresh.
- Row expansion.
- Copy issue ID.
- Route links.

## Data Fetching Contract
Initial query:
```http
GET /v1/issues?limit=50
```

Filter query examples:
```http
GET /v1/issues?status=open&severity=p1&limit=100
GET /v1/issues?deliveryId=DEL-1001&limit=100
GET /v1/issues?status=escalated&limit=50
```

Do not call:
```http
GET /v1/issues?category=payment
GET /v1/issues?stationId=STA-ACCRA-CENTRAL
GET /v1/issues?search=missing
GET /v1/issues?paymentId=PAY-1001
```

Refresh behavior:
- Manual refresh reloads `list_issues`.
- Filter changes update URL and reload supported backend filters.
- Client-only filter changes should not reload unless the supported backend params also changed.
- Preserve previous rows while refreshing.
- Announce new loaded count.

## Cache And Freshness
Cache key must include:
- `status`
- `severity`
- `deliveryId`
- `limit`

Client-only filters should be separate view state.

Freshness:
- Mark data stale after `60s`.
- Auto-refresh only if existing admin app patterns do so.
- Manual refresh must always be available.
- If a row changes status after refresh, show `Queue updated`.

Stale copy:
```text
This queue may have changed. Refresh before acting in a detail screen.
```

## Visual Design System
Art direction:
- Serious operations desk.
- Compact, high-contrast worklist.
- Warm-gray base with risk accents.
- Strong row hierarchy.
- No decorative clutter.

Color tokens:
- `--issue-bg`: `#F4F1EA`
- `--issue-surface`: `#FFFCF5`
- `--issue-surface-raised`: `#FFFFFF`
- `--issue-ink`: `#17130D`
- `--issue-muted`: `#6B6258`
- `--issue-line`: `#DDD4C7`
- `--issue-p1`: `#B3261E`
- `--issue-p2`: `#9A5B00`
- `--issue-p3`: `#245B84`
- `--issue-open`: `#17324D`
- `--issue-review`: `#5A4B91`
- `--issue-escalated`: `#B3261E`
- `--issue-resolved`: `#187A4D`
- `--issue-closed`: `#6B6258`
- `--issue-focus`: `#F6C84C`

Typography:
- Use the admin console type system.
- If no type system is committed yet, use `IBM Plex Sans` for interface and `IBM Plex Mono` for IDs.
- Use tabular numerals for counts and timestamps.
- Row summary should be sentence case.
- Status and severity labels should be short and explicit.

Spacing:
- Page max width: `1440px`.
- Header padding: `32px`.
- Table row vertical padding: `14px`.
- Dense row minimum height: `64px`.
- Chip gap: `8px`.
- Card radius: `18px`.

Motion:
- Use restrained row load fade.
- Use no animation for severity changes.
- Use a brief refresh shimmer only for data cells, not the whole page.
- Respect reduced motion.

## Component Inventory
Required components:
- `AdminIssueQueuePage`
- `IssueQueueHeader`
- `IssueQueueScopeNotice`
- `IssueQueueFilterBar`
- `IssueQueueViewChips`
- `UnsupportedFilterChips`
- `IssuePrioritySummary`
- `IssueWorkstreamLanes`
- `IssueQueueTable`
- `IssueQueueRow`
- `IssueQueueRowExpansion`
- `IssueSeverityBadge`
- `IssueStatusBadge`
- `IssueAgeIndicator`
- `IssueRouteActions`
- `IssueQueueEmptyState`
- `IssueQueueErrorState`
- `IssueQueueRefreshButton`
- `LoadedScopeCountNotice`

Shared components may be reused:
- Admin shell.
- Data table.
- Status badge.
- Filter drawer.
- Empty state.
- Error state.
- Copy button.
- Section navigation.

## Accessibility Requirements
The page must meet WCAG 2.2 AA.

Required:
- Main `h1` is `Issue queue`.
- Filter form has a label for every control.
- Table has a caption.
- Column headers use real table headers.
- Sort controls announce active sort.
- Filter result count uses `aria-live="polite"`.
- Refresh completion uses `aria-live="polite"`.
- Unsupported filter notice is visible and announced when query params change.
- Status and severity badges include text, not color alone.
- Row expansion button has accessible name with issue ID.
- Row actions are keyboard reachable.
- Focus remains stable after refresh.
- Error states are reachable by keyboard.
- Mobile cards preserve labels for each field.

Keyboard behavior:
- `Tab` moves through filters, view chips, table controls, rows, and row actions.
- `Enter` opens a row or activates a route action.
- `Space` toggles a row expansion.
- `Escape` closes filter drawer or row preview.

## Privacy And Security
Do:
- Show issue IDs, delivery IDs, statuses, severity, category, timestamps, and reporter role.
- Show reporter actor ID only to roles allowed by admin policy.
- Keep resolution notes visible only for admin roles with issue access.
- Use route links rather than embedding unrelated sensitive records.
- Exclude raw descriptions from analytics.

Do not:
- Show payer phone.
- Show receiver phone.
- Show proof asset storage paths.
- Show provider credentials.
- Send issue descriptions to analytics.
- Store issue data in local storage.
- Expose inaccessible issue rows after `FORBIDDEN`.

## Analytics
Track:
- `admin_issue_queue_viewed`
- `admin_issue_queue_filter_changed`
- `admin_issue_queue_view_chip_clicked`
- `admin_issue_queue_refreshed`
- `admin_issue_queue_row_opened`
- `admin_issue_queue_route_clicked`
- `admin_issue_queue_unsupported_filter_seen`

Properties:
- `statusFilter`
- `severityFilter`
- `deliveryScoped`
- `clientCategoryFilter`
- `loadedCount`
- `p1LoadedCount`
- `escalatedLoadedCount`
- `role`
- `sourceScreen`

Never track:
- Summary text.
- Description text.
- Resolution note.
- Reporter actor ID.
- Delivery ID.
- Issue ID.
- Receiver data.
- Payment data.

## Performance
Targets:
- First meaningful paint under `1.5s` with cached shell.
- Queue table visible under `2s` on normal admin connection.
- Filter changes complete under `500ms` for client-side filters.
- Backend refetch keeps old rows visible until new rows arrive.

Optimization:
- Do not fetch delivery detail for every issue row on initial load.
- Do not fetch issue detail for every issue row.
- Do not fetch audit events for every issue row.
- Virtualize only if row count or UI library requires it.
- Use memoized derived rows only if existing app guidance uses it.

## Responsive Requirements
Desktop:
- Full table.
- Sticky filter bar.
- Optional right preview rail.

Tablet:
- Table keeps essential columns: severity, status, summary, delivery, updated, action.
- Secondary columns move into row expansion.

Mobile:
- Card list.
- Filter drawer.
- Sticky result count.
- Actions visible per card.
- No horizontal scroll except ID/code blocks.

## Copy System
Voice:
- Operational.
- Direct.
- Specific.
- No blame language.
- No customer-facing promises.
- Honest about backend scope.

Preferred terms:
- `issue`
- `queue`
- `loaded records`
- `severity`
- `status`
- `workstream`
- `open`
- `in review`
- `escalated`
- `resolved`
- `closed`

Avoid:
- `ticket closed forever`
- `guaranteed fix`
- `customer is wrong`
- `staff fault` unless formal investigation says so.
- `all issues` unless the data is genuinely global.

## Acceptance Criteria
Functional:
- Route renders with `data-testid="screen-admin-issue-queue"`.
- Page calls `list_issues`.
- Page sends only supported query fields to backend.
- Page supports status, severity, delivery ID, and limit backend filters.
- Page treats category, workstream, text, and station filters as client-side or unsupported.
- Page shows loaded-scope counts.
- Page shows P1, escalated, and aging summaries.
- Page displays issue rows with status, severity, category, summary, delivery ID, reporter role, created, and updated timestamps.
- Page supports row expansion.
- Page routes to issue detail.
- Page routes to delivery detail when delivery ID is present.
- Page routes to custody review for handoff, loss, or damage categories.
- Page never performs issue mutations.
- Page never performs finance, delivery, custody, proof, or station mutations.
- Page handles empty, filtered empty, forbidden, session expired, invalid query, and API error states.

Accessibility:
- Filters are labeled.
- Results count is announced.
- Table has caption and headers.
- Badges include text.
- Keyboard can open rows and route actions.
- Focus is stable after refresh.

Security:
- Sensitive data is not exposed.
- Analytics excludes issue text and IDs.
- Unauthorized states do not leak rows.

## Test Matrix
Unit tests:
- Builds backend query from supported filters only.
- Preserves unsupported filters as chips.
- Applies client-side category filter to loaded rows.
- Applies text filter to loaded rows.
- Sorts by severity correctly.
- Sorts by oldest active correctly.
- Derives age bands.
- Maps categories to workstreams.
- Builds route actions.
- Disables payment route when payment ID is missing.
- Prevents mutation controls from rendering.

Integration tests:
- Loads default queue.
- Loads `status=open`.
- Loads `severity=p1`.
- Loads delivery-scoped queue.
- Handles `stationId` route param as unsupported.
- Handles `category=payment` as loaded-record filter.
- Shows empty state.
- Shows filtered empty state.
- Shows API error state.
- Refresh preserves old rows until new data arrives.

End-to-end tests:
- `e2e-admin-issue-queue-p1`: Admin opens P1 open queue and opens issue detail.
- `e2e-admin-issue-queue-escalated`: Admin opens escalated view and sees escalated rows first.
- `e2e-admin-issue-queue-delivery`: Admin opens delivery-scoped queue from delivery detail.
- `e2e-admin-issue-queue-unsupported-station`: Admin opens station-sourced link and sees unsupported filter notice.
- `e2e-admin-issue-queue-read-only`: Admin cannot resolve, close, or escalate from the queue.

Visual tests:
- Desktop dense table.
- Tablet reduced columns.
- Mobile card list.
- Empty state.
- Unsupported filter notice.
- P1 and escalated rows.
- Long summaries.
- Reduced-motion mode.

## Implementation Notes For Claude Code
Build this as a read-only admin queue.

Use existing API hooks where available:
- `useListIssuesQuery`

Optional hooks only after explicit user action:
- `useGetIssueQuery`
- `useGetDeliveryQuery`

If hooks do not exist yet, create them according to the existing API client conventions. Do not add unsupported backend filters from the frontend.

Recommended files:
- `apps/admin/src/routes/admin-issue-queue.tsx`
- `apps/admin/src/features/issues/AdminIssueQueue.tsx`
- `apps/admin/src/features/issues/issueQueueModel.ts`
- `apps/admin/src/features/issues/issueQueueModel.test.ts`
- `apps/admin/src/features/issues/components/IssueQueueHeader.tsx`
- `apps/admin/src/features/issues/components/IssueQueueFilterBar.tsx`
- `apps/admin/src/features/issues/components/IssueQueueTable.tsx`
- `apps/admin/src/features/issues/components/IssueQueueRow.tsx`
- `apps/admin/src/features/issues/components/IssuePrioritySummary.tsx`
- `apps/admin/src/features/issues/components/UnsupportedFilterChips.tsx`

Model helpers:
- `buildIssueListQuery`
- `parseIssueQueueParams`
- `deriveUnsupportedIssueFilters`
- `applyLoadedIssueFilters`
- `sortIssueRows`
- `deriveIssueAgeBand`
- `deriveIssueWorkstream`
- `buildIssueRouteActions`

Do not bind table components directly to raw URL params. Normalize route params and API rows into an `IssueQueueViewModel`.

## Open Backend Gaps
The current backend supports a strong first queue, but these gaps should remain visible:
- No station issue filter.
- No category issue filter.
- No text search.
- No assignment or owner field.
- No issue SLA field.
- No payment ID on issue rows.
- No joined delivery, station, payment, or refund data.
- No aggregate counts endpoint.
- No cursor pagination.

Frontend must not hide these gaps with invented global counts or unsupported filters.

## Final Instruction To Claude Code
Build `AdminIssueQueue` as a serious, read-only admin triage worklist. Use `list_issues` with only supported backend filters, clearly distinguish loaded-scope counts from global totals, apply category and search only to loaded rows, route each row to the correct owner screen, and keep all mutation actions out of this page.

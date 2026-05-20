# CourierCompletedJobs Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierCompletedJobs` |
| Route | `/(ops)/courier/completed` |
| Primary test ID | `screen-courier-completed-jobs` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `list_deliveries`, optional `get_delivery`, optional `get_delivery_timeline` for selected row |
| Offline critical | No mutation; yes for cached read continuity |
| Required role | `final_mile_courier` |
| Primary job | Review completed final-mile work without exposing unsupported earnings, proof, or receiver-private data |
| Parent screens | `CourierHome`, `CourierAssignments`, `CourierCustodyAccepted`, `CourierOtpCompletion`, `CourierSignatureProof`, `CourierPhotoProof` |
| Related screens | `CourierEarnings`, `CourierIssues`, `OpsDeliveryDetail`, `OpsCustodyChain` |
| Current implementation mode | Read-only delivered and closed job history from accessible delivery summaries |

## Outcome
`CourierCompletedJobs` gives a final-mile courier a clean, trustworthy history of completed doorstep work.

The screen must answer:
- `Which jobs did I complete?`
- `When was the latest operational touchpoint?`
- `Which station corridor was involved?`
- `Was doorstep requested?`
- `Is this row delivered, closed, or no longer accessible?`
- `Can I open detail or timeline if I need proof context?`
- `What information is not available here?`
- `Where do I go for earnings or issues?`

The screen is not an earnings report. It is not a proof gallery. It is not a support queue. It is a compact operational ledger for completed final-mile work.

## Product Definition
This screen allows couriers to:
- Review delivered jobs.
- Review closed jobs if still accessible.
- Search returned rows locally by tracking code or receiver display name.
- Filter returned rows by status, station, service type, and date bucket.
- Open delivery detail for a selected completed job.
- Open timeline for custody/proof context where authorized.
- Navigate to earnings for payment questions.
- Navigate to issues for disputes or exceptions.
- Use cached read-only history when offline.

It does not allow couriers to:
- Mutate delivery state.
- Change proof data.
- See raw proof assets.
- See payout amounts.
- Calculate earnings.
- See receiver phone by default.
- See admin-only issue data.
- View deliveries no longer accessible through backend scope.
- Export private receiver data.

## Users
Primary:
- Final-mile couriers reviewing their completed doorstep work.

Secondary:
- Support staff guiding couriers to a delivery detail.
- QA validating final-mile completion visibility.
- Finance staff explaining why earnings are separate from job history.

## Entry Points
The screen can open from:
- `CourierHome` quick link.
- `CourierAssignments` empty or history link.
- Completion success screens after delivered handoff.
- `CourierEarnings` when courier wants job context.
- `CourierIssues` when courier wants completed job reference.

## Real-World Context
Couriers may use this screen after a shift, during a dispute call, or when checking whether a completed job still appears in their ledger. Network may be poor, and the courier may only need a quick confirmation, not a full record.

The screen must support:
- Fast scanning.
- Local search over returned records.
- Clear stale/offline state.
- Privacy-safe receiver naming.
- No earnings confusion.
- No proof overexposure.

## User Goal
Primary goal:
- Confirm completed final-mile jobs and open detail when needed.

Secondary goals:
- Reconcile personal work memory with backend records.
- Find a tracking code quickly.
- Understand why a job may not show.
- Route payout questions to `CourierEarnings`.
- Route dispute questions to `CourierIssues`.

## Scope
In scope:
- Completed job list.
- Delivered and closed status support.
- Local search and filters over returned rows.
- Cached read-only state.
- Empty state.
- Stale data warning.
- Detail and timeline navigation.
- Privacy-safe row rendering.

Out of scope:
- Payout calculations.
- Settlement status.
- Proof image/signature display.
- Receiver full phone.
- Admin issue adjudication.
- Manual delivery status changes.
- Export reports.

## Design Thesis
This screen should feel like a premium mobile activity ledger: dense enough for shift review, calm enough for dispute lookup, and strict enough to avoid leaking receiver or proof data.

Design principles:
- Completed work is evidence, not decoration.
- Rows must be easy to scan in bad network and bright light.
- Filters must not imply backend fields that do not exist.
- The screen must explain missing data instead of inventing it.
- Earnings and issues must be separate destinations.

## Research Inputs
Relevant external references:
- [Material Design lists](https://m3.material.io/components/lists/overview): supports dense, scannable mobile list rows with leading metadata, supporting text, and clear touch behavior.
- [Apple Human Interface Guidelines search](https://developer.apple.com/design/human-interface-guidelines/search-fields): supports predictable search fields, scoped search behavior, and clear cancellation in mobile interfaces.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached read models, stale indicators, and network-backed refresh.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing loading, refresh, empty, filter, offline, and stale states without disruptive focus movement.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible row actions, filter chips, search clear, and navigation controls.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable movement through search, filters, list rows, and empty-state actions.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/02-courier-home.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/03-courier-assignments.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/16-courier-earnings.md` when created
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/17-courier-issues.md` when created
- `packages/shared/src/contracts/api.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/auth.ts`

## Backend Contract
Primary endpoint:
```http
GET /v1/deliveries?status=delivered&limit=100
```

Optional second query:
```http
GET /v1/deliveries?status=closed&limit=100
```

Operation ID:
```text
list_deliveries
```

Query constraints:
- `status` is optional but accepts one delivery status at a time.
- `paymentStatus` is optional.
- `limit` is optional, positive integer, max `100`.

Response fields per row:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Accessibility scope:
- Final-mile courier access currently depends on `assignedFinalMileCourierId`.
- Delivered jobs are expected to remain accessible if backend retains assigned courier ID after completion.
- If backend later clears assignment on delivery completion, this screen will need a courier-history endpoint.

Backend limitations:
- No `completedAt` field in list response.
- No `proofType` field in list response.
- No `receivedByName` field in list response.
- No payout field in list response.
- No issue count in list response.
- No package condition in list response.
- No receiver phone in list response.
- No route distance in list response.
- No pagination cursor in list response.
- No multi-status query in list response.

UI implication:
- Use `latestOccurredAt` as the row timestamp label.
- Call delivered and closed status queries separately when both are needed.
- Never show payout, proof type, or completion recipient unless loaded from an authorized detail or future endpoint.

## Eligibility Rules
Render normal screen when:
- User is authenticated.
- User role is `final_mile_courier`.
- `list_deliveries` returns accessible rows or empty result.

Block screen when:
- User is not authenticated.
- User role is not final-mile courier.
- Backend returns forbidden.
- Session expired.

Do not block screen when:
- Delivered query succeeds and closed query fails.
- Closed query succeeds and delivered query fails.
- Cached rows exist while offline.

## Data Fetch Strategy
Initial load:
- Request delivered rows with `status=delivered&limit=100`.
- Request closed rows with `status=closed&limit=100` only if product wants closed history visible.
- Merge rows client-side by `deliveryId`.
- Sort by `latestOccurredAt` descending.

Refresh:
- Pull-to-refresh reruns both active status queries.
- If one query fails, keep successful query and show partial warning.
- If both fail and cache exists, show cached stale state.

Detail drill-in:
- Tapping a row opens `OpsDeliveryDetail` or courier assignment detail in read-only completed mode.
- Timeline link may call `get_delivery_timeline` from detail screen, not list row.

## Information Architecture
Top-to-bottom order:
- Header with title, count, stale/offline chip.
- Search field.
- Filter chips.
- Summary strip.
- Completed job list.
- Empty or partial state.
- Footer links to earnings and issues.

## Layout
Mobile portrait:
- Sticky header.
- Search field below header.
- Horizontally scrollable filter chips.
- Vertical list rows.
- Bottom utility links.

Mobile landscape:
- Two-column layout optional.
- Left: filters and summary.
- Right: list.

Small devices:
- Keep row height compact.
- Keep tracking code visible.
- Hide optional station route text behind secondary line if space is limited.

## Component 1: Header
Purpose:
- Show this is completed work history, not active assignments.

Content:
- Title: `Completed jobs`
- Subtitle: `Delivered and closed doorstep work`
- Count chip.
- Offline/stale chip.
- Back action.

Test IDs:
- `courier-completed-header`
- `courier-completed-back-action`
- `courier-completed-count-chip`
- `courier-completed-stale-chip`

Behavior:
- Count reflects currently filtered visible rows.
- If cached, chip says `Cached`.
- Header must not show earnings total.

## Component 2: Search
Purpose:
- Let courier find a completed job quickly.

Searchable fields:
- `trackingCode`
- `receiverName`
- `originStationId`
- `destinationStationId`

Test IDs:
- `courier-completed-search`
- `courier-completed-search-input`
- `courier-completed-search-clear`

Behavior:
- Search is local over returned rows.
- Search is case-insensitive.
- Debounce input lightly.
- Clear button resets search.
- Do not query backend per keystroke.
- Do not search receiver phone because not returned.

## Component 3: Filters
Purpose:
- Narrow returned rows without implying server fields that do not exist.

Filter chips:
- `All`
- `Delivered`
- `Closed`
- `Today`
- `This week`
- `Doorstep`
- `Pickup`
- Origin station IDs from returned rows.
- Destination station IDs from returned rows.

Test IDs:
- `courier-completed-filter-bar`
- `courier-completed-filter-all`
- `courier-completed-filter-delivered`
- `courier-completed-filter-closed`
- `courier-completed-filter-today`
- `courier-completed-filter-week`
- `courier-completed-filter-doorstep`
- `courier-completed-filter-pickup`
- `courier-completed-filter-origin`
- `courier-completed-filter-destination`

Behavior:
- Filters are local over loaded rows.
- Multiple chips can combine only if UX remains obvious.
- Status filters map to returned `currentStatus`.
- Date filters use `latestOccurredAt`.
- Service filter uses `doorstepRequested` and `serviceType`.
- If closed query is unavailable, hide closed chip or show disabled with explanation.

## Component 4: Summary Strip
Purpose:
- Give a compact work summary without earnings.

Metrics:
- Visible completed rows.
- Delivered count.
- Closed count.
- Latest completed timestamp.
- Cached status.

Test IDs:
- `courier-completed-summary`
- `courier-completed-summary-visible-count`
- `courier-completed-summary-delivered-count`
- `courier-completed-summary-closed-count`
- `courier-completed-summary-latest-time`

Behavior:
- No money values.
- No payout state.
- If timestamp unavailable, omit latest timestamp.

## Component 5: Job Row
Purpose:
- Show each completed job clearly and safely.

Row content:
- Tracking code.
- Status label.
- Latest timestamp.
- Receiver display name.
- Origin to destination station IDs.
- Doorstep or pickup indicator.
- Latest touchpoint role.
- Open detail affordance.

Test IDs:
- `courier-completed-row`
- `courier-completed-row-tracking`
- `courier-completed-row-status`
- `courier-completed-row-timestamp`
- `courier-completed-row-receiver`
- `courier-completed-row-route`
- `courier-completed-row-service`
- `courier-completed-row-touchpoint`
- `courier-completed-row-open-detail`

Behavior:
- Row opens read-only detail.
- Row does not expose receiver phone.
- Row does not expose proof reference.
- Row does not expose payment provider reference.
- Row does not show payout.
- Row with stale cached data shows subtle cached marker.

Status labels:
- `delivered` -> `Delivered`
- `closed` -> `Closed`

Service labels:
- `doorstepRequested=true` -> `Doorstep`
- `doorstepRequested=false` -> `Station pickup`

## Component 6: Empty State
Purpose:
- Explain why no completed jobs appear.

Variants:
- No completed jobs.
- No search results.
- No filtered results.
- History unavailable.
- Access scope changed.

Test IDs:
- `courier-completed-empty-state`
- `courier-completed-empty-no-jobs`
- `courier-completed-empty-search`
- `courier-completed-empty-filter`
- `courier-completed-empty-unavailable`

Copy:
- No jobs: `No completed jobs yet. Delivered doorstep work will appear here.`
- Search: `No completed job matches this search.`
- Filter: `No completed job matches these filters.`
- Unavailable: `Completed job history could not load. Try again.`

Actions:
- `Refresh`
- `View active assignments`
- `Open support`

## Component 7: Partial Data Warning
Purpose:
- Handle split query failure.

Content:
- `Some history could not load.`
- Which status failed if known.
- Retry action.

Test IDs:
- `courier-completed-partial-warning`
- `courier-completed-partial-retry`

Behavior:
- Keep successfully loaded rows visible.
- Announce partial warning.
- Do not merge stale closed rows with fresh delivered rows unless marked.

## Component 8: Footer Links
Purpose:
- Route out-of-scope questions to the right screen.

Links:
- `View earnings`
- `View issues`
- `Open support`

Test IDs:
- `courier-completed-footer`
- `courier-completed-earnings-link`
- `courier-completed-issues-link`
- `courier-completed-support-link`

Behavior:
- Earnings link opens `/(ops)/courier/earnings`.
- Issues link opens `/(ops)/courier/issues`.
- Support link opens `/(ops)/support`.
- Footer must not show payout assumptions.

## State Model
States:
- `loading`
- `ready`
- `empty`
- `filtered_empty`
- `search_empty`
- `partial`
- `offline_cached`
- `stale`
- `refreshing`
- `permission_denied`
- `session_expired`
- `error`

## Loading State
Trigger:
- Initial delivered and optional closed queries are pending.

UI:
- Header skeleton.
- Search skeleton.
- Filter skeleton.
- Row skeletons.

Test ID:
- `courier-completed-loading-state`

## Ready State
Trigger:
- At least one query succeeds and rows are available.

UI:
- Search.
- Filters.
- Summary.
- Rows.
- Footer links.

Test ID:
- `courier-completed-ready-state`

## Offline Cached State
Trigger:
- Network unavailable and cached completed rows exist.

UI:
- Cached chip.
- Last synced timestamp.
- Read-only rows.
- Refresh disabled or queued for reconnect.

Test ID:
- `courier-completed-offline-cached-state`

Behavior:
- No mutation.
- Row detail opens only if cached detail exists or app warns that network is needed.

## Stale State
Trigger:
- Cached rows are older than product freshness threshold.

UI:
- Stale banner.
- Refresh action.

Test ID:
- `courier-completed-stale-state`

Behavior:
- Keep rows visible.
- Never label stale rows as final truth without timestamp.

## Permission Denied State
Trigger:
- Backend returns forbidden.

UI:
- Message: `Your account cannot view completed courier jobs.`
- Action: `Return home`

Test ID:
- `courier-completed-permission-state`

## Error State
Trigger:
- Both queries fail and no cache exists.

UI:
- Message: `Completed jobs could not load.`
- Retry.
- Support link.

Test ID:
- `courier-completed-error-state`

## Data Requirements
From `list_deliveries` row:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Local derived fields:
- `statusLabel`
- `routeLabel`
- `serviceLabel`
- `timeBucket`
- `isCached`
- `isStale`
- `visibleIndex`

Do not derive:
- Earnings amount.
- Proof method.
- Delivery duration.
- Distance.
- Tip.
- Bonus.
- Penalty.
- Receiver phone.
- Completion recipient.
- Issue count.

## API Calls
Delivered:
```http
GET /v1/deliveries?status=delivered&limit=100
```

Closed:
```http
GET /v1/deliveries?status=closed&limit=100
```

Selected detail:
```http
GET /v1/deliveries/:id
```

Selected timeline:
```http
GET /v1/deliveries/:id/timeline
```

Rules:
- Use list endpoint for rows.
- Use detail endpoint only after row selection.
- Use timeline only when user opens detail/timeline.
- Do not prefetch proof assets.
- Do not call earnings endpoints from this screen.

## Offline Behavior
Offline:
- Show cached completed rows if available.
- Show last sync time.
- Allow local search and filters.
- Disable network-only detail if not cached.
- Queue refresh for reconnect if app supports background refresh.

No cache:
- Show offline empty state.
- Action: `Try again when connected`
- Action: `Return home`

## Security And Privacy
Rules:
- Mask or omit receiver details beyond returned `receiverName`.
- Do not show receiver phone.
- Do not show proof reference.
- Do not show payment provider reference.
- Do not expose internal actor IDs.
- Do not log search terms if they may contain receiver names or tracking codes.
- Do not send row tracking code in analytics unless hashed and approved.
- Do not store completed history beyond cache retention policy.

## Accessibility
Requirements:
- Root accessible name: `Completed jobs`.
- Search field has clear label.
- Filter chips expose selected state.
- Row action labels include tracking code and status.
- Refresh status uses live region.
- Empty state is announced.
- Partial data warning is announced.
- Row touch targets meet target size minimum.
- Focus order stays header, search, filters, summary, list, footer.

## Visual Design
Tone:
- Calm.
- Efficient.
- Ledger-like.
- Trustworthy.

Color:
- Deep blue for history shell.
- Green for delivered.
- Slate for closed.
- Amber for cached or stale.
- Red only for error.

Typography:
- Tracking code uses compact monospaced token.
- Status labels use bold small caps or clear badge style.
- Receiver name is secondary.
- Timestamp is readable and locale-aware.

Motion:
- Rows fade in on first load.
- Filter results update without heavy movement.
- Respect reduced motion.

## Copy System
Header:
- `Completed jobs`

Subtitle:
- `Delivered and closed doorstep work`

Search:
- `Search tracking, receiver, or station`

Earnings separation:
- `Payment and settlement details live in Earnings.`

Proof separation:
- `Open detail for authorized delivery context. Proof files are not shown in this list.`

Empty:
- `No completed jobs yet. Delivered doorstep work will appear here.`

Offline:
- `Showing cached completed jobs. Refresh when connected.`

Partial:
- `Some completed history could not load.`

## Navigation
Route:
```text
/(ops)/courier/completed
```

Next routes:
- Detail: `/(ops)/deliveries/:deliveryId`
- Timeline: `/(ops)/deliveries/:deliveryId/timeline`
- Earnings: `/(ops)/courier/earnings`
- Issues: `/(ops)/courier/issues`
- Support: `/(ops)/support`
- Active assignments: `/(ops)/courier/assignments`

Back behavior:
- Returns to `CourierHome` by default.
- If opened from completion success, back returns to home, not proof flow.
- Search/filter state persists during same app session.

## Analytics
Events:
- `courier_completed_screen_viewed`
- `courier_completed_refresh_started`
- `courier_completed_refresh_succeeded`
- `courier_completed_refresh_failed`
- `courier_completed_search_used`
- `courier_completed_filter_changed`
- `courier_completed_row_opened`
- `courier_completed_empty_seen`
- `courier_completed_partial_seen`
- `courier_completed_earnings_selected`
- `courier_completed_issues_selected`

Allowed properties:
- `visibleCount`
- `statusFilter`
- `dateFilter`
- `hasCache`
- `offlineState`
- `errorCode`

Do not include:
- Search text.
- Receiver name.
- Tracking code.
- Delivery ID unless hashed and approved.
- Station route if analytics policy treats it sensitive.

## QA Requirements
Functional:
- Renders root `screen-courier-completed-jobs`.
- Calls `list_deliveries` with `status=delivered`.
- Optionally calls `list_deliveries` with `status=closed`.
- Merges and deduplicates by `deliveryId`.
- Sorts rows by `latestOccurredAt` descending.
- Search filters locally.
- Filter chips work locally.
- Empty state appears when no rows.
- Partial warning appears when one status query fails.
- Offline cached state works.
- Row opens read-only detail.
- Earnings link opens earnings screen.
- Issues link opens issues screen.
- No payout fields appear.
- No proof asset fields appear.
- No receiver phone appears.

Accessibility:
- Search is labeled.
- Filters expose selected state.
- Rows are accessible as buttons or links.
- Refresh status is announced.
- Empty and partial states are announced.

Security:
- Search terms are not logged.
- Analytics excludes private identifiers.
- Cache respects retention policy.
- Completed rows are scoped to backend access only.

## E2E Scenarios
Scenario: delivered history loads.
- Courier opens completed jobs.
- App calls delivered query.
- Rows render sorted newest first.
- Count chip matches visible rows.

Scenario: delivered and closed rows merge.
- Delivered query returns two rows.
- Closed query returns one row.
- Screen shows three rows sorted by latest timestamp.

Scenario: search by tracking code.
- User enters tracking code fragment.
- Matching row remains.
- Empty search state appears for no match.

Scenario: offline cached history.
- App has cached delivered rows.
- Network is offline.
- Screen shows cached chip and rows.
- Refresh waits for connection.

Scenario: earnings separation.
- User taps `View earnings`.
- App routes to `CourierEarnings`.
- Completed jobs screen never shows payout.

## Component Handoff To Claude Code
Build this screen as read-only courier completed work history.

Primary route:
```text
/(ops)/courier/completed
```

Root test ID:
```text
screen-courier-completed-jobs
```

Implementation sequence:
1. Load delivered rows with `list_deliveries`.
2. Optionally load closed rows with a second `list_deliveries` call.
3. Merge and deduplicate rows.
4. Sort by `latestOccurredAt` descending.
5. Render header, search, filters, summary, rows, and footer.
6. Add local search and filter behavior.
7. Add empty, partial, offline, stale, permission, and error states.
8. Route rows to read-only detail.
9. Route payout questions to earnings.
10. Route disputes to issues.
11. Add privacy-safe analytics.
12. Add unit, integration, E2E, accessibility, and security tests.

## Acceptance Checklist
- Screen is read-only.
- Screen uses `list_deliveries`.
- Screen does not calculate earnings.
- Screen does not show proof files.
- Screen does not show receiver phone.
- Screen handles delivered rows.
- Screen handles closed rows if available.
- Screen handles one-status-at-a-time backend limitation.
- Screen supports local search and filters.
- Screen supports offline cached read.
- Screen routes detail, earnings, issues, and support correctly.

## Open Backend Improvements
- Add courier completed history endpoint that does not rely on assignment retention.
- Add pagination cursor.
- Add explicit completed-at timestamp.
- Add safe proof summary fields.
- Add issue count summary.
- Add settlement summary only for earnings screen.
- Add route-safe station display names.

## Final Standard
This screen is complete when:
- Couriers can review completed final-mile work quickly.
- The list is honest about available backend fields.
- Privacy is protected.
- Earnings remain separate.
- Disputes route to the right surface.
- Cached history remains useful without becoming false backend truth.

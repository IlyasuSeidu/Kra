# Station Intake Queue Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationIntakeQueue` |
| App | `apps/mobile` |
| Route | `/(ops)/station/intake` |
| Primary test ID | `screen-station-intake-queue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, `AuthPrincipal`, `stationIdSchema`, `roleSchema`, station-scoped access policy, local cached station queue store |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/intake/:deliveryId`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `ready`, `empty`, `search_empty`, `offline_cached`, `stale_cache`, `partial_data`, `refreshing`, `missing_station_scope`, `not_authorized`, `session_expired`, `api_error`, `rate_limited`, `sync_conflict_warning` |

## Product Job
This screen is the station operator's intake queue. It lets the operator find deliveries that are ready to be received at the authenticated origin station and open the dedicated package intake workflow.

The screen answers one operational question: `Which paid or unpaid created deliveries are waiting for this station to receive the physical package?`

The station operator should be able to:
- Confirm the station scope before looking at any delivery.
- See all visible deliveries awaiting origin intake for the authenticated station.
- Search by tracking code, delivery ID, receiver name, or station corridor across the loaded queue.
- Filter by payment state, age, and local sync risk.
- Sort by oldest first, newest first, payment state, or receiver name.
- Identify deliveries that need intake now, intake soon, payment attention, or support review.
- Open package intake for one delivery.
- Open the shared delivery detail for context without mutating state.
- Open custody chain for prior evidence where available.
- Open offline outbox when queued station work may affect the queue.
- Refresh safely without losing the current search or filter context.
- Understand when queue data is cached, stale, partial, or blocked by permissions.

This screen is not:
- The package scan screen.
- The intake mutation screen.
- A delivery creation screen.
- A sender search surface outside station scope.
- A payment collection screen.
- A package label print screen.
- A station overview replacement.
- A driver assignment screen.
- A destination receipt queue.
- A place to edit receiver or package details.
- A place to bypass station status, payment, issue, or custody policy.

## Audience
Primary audience:
- Station queue operators receiving packages from senders.
- Station leads checking intake pressure during a shift.
- Backup station operators handling peak intake windows.

Secondary audience:
- Claude Code implementing the mobile screen.
- QA validating station-scope filtering and offline queue behavior.
- Operations leads validating intake queue flow.
- Security reviewers validating delivery visibility boundaries.
- Accessibility reviewers validating search, filters, row actions, and live status updates.

## User State
The station operator has already signed in with `role = station_operator` and should have a valid `stationId`. The user is in a physical station environment where packages, senders, handwritten labels, and phone camera scans compete for attention.

The user may be:
- Starting a morning intake shift.
- Receiving several senders at once.
- Checking whether a tracking code is expected at this station.
- Looking for a receiver name when the sender does not know the tracking code.
- Working with weak or intermittent connectivity.
- Returning after offline actions were queued.
- Investigating why a delivery is not showing as ready for intake.
- Opening package intake after finding the right queue item.
- Escalating a queue mismatch to support.

The screen must:
- Treat `AuthPrincipal.stationId` as required.
- Treat `list_deliveries` as the read authority for visible queue rows.
- Render only rows the backend returns for the authenticated actor.
- Classify intake eligibility from canonical status and station fields.
- Keep cached and stale states visible at the top of the screen.
- Avoid state mutations from this queue.
- Route all actual intake submission to `StationPackageIntake`.
- Preserve search and filters across refresh and app resume.

## Backend Contract
Read operation:
- `GET /v1/deliveries`
- Shared contract name: `list_deliveries`

Query schema:
- `status`: optional canonical delivery status.
- `paymentStatus`: optional canonical payment status.
- `limit`: optional positive integer, maximum `100`.

Recommended first request:
- `status=created`
- `limit=100`

Optional follow-up requests:
- `status=on_hold` when the screen needs local support visibility for previously loaded intake candidates.
- `status=issue_reported` only if the app shows a blocked intake reference group.

Response schema:
- `deliveries`: array of delivery list rows.

Delivery list row fields:
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

Station scope:
- The backend is the authority for station visibility.
- The frontend must additionally require `originStationId === AuthPrincipal.stationId` for the main intake list.
- Any row where `originStationId` does not match the station scope must be hidden and logged as a client anomaly.
- Destination-station rows must never appear in the main intake queue.

Read-only rule:
- This screen does not call `confirm_intake`.
- This screen does not call `cancel_delivery`.
- This screen does not call `assign_driver`.
- This screen does not call `dispatch_delivery`.
- This screen does not call issue creation directly unless the user chooses a support route.
- This screen opens `StationPackageIntake` with a selected `deliveryId`.

## Intake Eligibility Decision
Primary eligible queue:
- `currentStatus = created`
- `originStationId = AuthPrincipal.stationId`

Payment treatment:
- `paymentStatus = confirmed`: show as `Payment confirmed`.
- `paymentStatus = pending`: allow intake queue visibility, but mark `Payment pending - dispatch will stay blocked`.
- `paymentStatus = failed`: keep visible and eligible for intake because physical custody should be recorded when the sender is at station; mark `Payment failed - dispatch blocked`.
- `paymentStatus = refund_pending`: do not route to intake by default; move into blocked intake reference group.
- `paymentStatus = refunded`: do not route to intake; show only if backend returns it and send to support detail.

Status treatment:
- `created`: eligible for intake.
- `received_at_origin`: already received; do not show in main queue.
- `awaiting_driver_assignment`: already beyond intake; do not show in main queue.
- `issue_reported`: show only in blocked reference group when relevant.
- `on_hold`: show only in blocked reference group when relevant.
- `cancelled`: never show in main intake queue.
- `closed`: never show in main intake queue.
- Terminal states: never show in main intake queue.

Blocked reference group:
- The screen may show a collapsed `Needs review` group only when backend returns affected rows through an explicit query.
- The group must not look like the main intake worklist.
- Rows in this group open delivery detail or support, not package intake.

## Primary Action
Primary action by state:
- `loading`: wait.
- `ready`: open package intake for selected row.
- `empty`: refresh or open support.
- `search_empty`: clear search or filters.
- `offline_cached`: open cached row only if it has no local conflict, otherwise open offline outbox.
- `stale_cache`: refresh before starting intake when network is available.
- `partial_data`: review loaded rows with warning.
- `missing_station_scope`: contact supervisor.
- `not_authorized`: return to role home.
- `session_expired`: sign in again.
- `api_error`: retry.
- `rate_limited`: wait and retry.
- `sync_conflict_warning`: open offline outbox.

Primary row action:
- Tap row: open `/(ops)/station/intake/:deliveryId`.

Secondary row actions:
- `Open delivery detail`
- `Open custody chain`
- `Report intake issue`

Global secondary actions:
- `Refresh`
- `Scan tracking code`
- `Open offline outbox`
- `Open support`
- `Back to overview`

Blocked behavior:
- Do not show a direct `Receive package` submit button on the queue.
- Do not allow bulk intake from the queue.
- Do not allow a swipe action that mutates delivery state.
- Do not show any row outside station scope.
- Do not open package intake for non-`created` statuses.
- Do not hide payment problems behind generic labels.
- Do not let stale cached data look fresh.
- Do not clear search state after an error.
- Do not auto-open a row after scanning a tracking code unless exactly one visible row matches.

## First Meaningful Value
First meaningful value is reached when the operator sees:
- Current station label.
- Queue freshness state.
- Count of intake-ready rows.
- Count of payment-pending rows.
- Count of stale or locally risky rows.
- Search entry.
- At least the first visible queue rows or an empty state.

The first viewport must answer:
- `Which station am I receiving for?`
- `How many packages are waiting for intake?`
- `Is this data fresh enough to act on?`
- `Can I find a package by code or receiver?`
- `What should I do if the package is not listed?`

## Main Tension
The operator needs speed, but receiving a package changes custody in the next step. The queue must make finding fast without making package intake feel like a casual list action.

The design must balance:
- Fast lookup against station-scope safety.
- Dense list scanning against mobile readability.
- Payment visibility against not turning this into a finance screen.
- Offline continuity against stale delivery risk.
- Operator throughput against accurate custody evidence.
- Search convenience against accidental wrong-delivery selection.

## Design Brief
User and job:
- Station operator needs to find the correct pre-intake delivery and start package intake.

Context of use:
- Android phone, one hand, noisy station, glare, low bandwidth, sender standing nearby.

Entry point:
- `StationOverview` intake count.
- Role-aware home.
- Deep link from delivery detail.
- Offline outbox recovery.

Success state:
- Operator opens `StationPackageIntake` for the correct delivery.

Primary action:
- Select one queue row.

Navigation model:
- Station-scoped list with sticky header, search, compact filter rail, queue rows, and support escape hatch.

Density:
- Medium-high list density, but each row must remain tappable, legible, and clear.

Restraint rule:
- No dashboard cards beyond the compact queue summary.
- No decorative maps.
- No direct state mutation controls.
- No repeated row buttons unless they add safety.

Visual thesis:
- A serious station worklist: crisp, high-contrast, fast to scan, with strong freshness and scope cues.

## Information Architecture
The screen is organized in this order:
1. Station scope header.
2. Freshness and offline banner when needed.
3. Intake queue summary.
4. Search input.
5. Filter and sort rail.
6. Queue result count.
7. Queue rows.
8. Needs review group when present.
9. Empty or error recovery.
10. Bottom support actions.

### Station Scope Header
Required content:
- Station name or station ID.
- Role label: `Station operator`.
- Local time.
- Open/closed hint when station hours are available.
- Freshness timestamp.
- Offline outbox count when greater than zero.

Header copy:
- Title: `Intake queue`
- Subtitle: `Receive packages for {stationName}`
- Fresh: `Updated {relativeTime}`
- Cached: `Showing saved queue from {relativeTime}`
- Stale: `Queue may be out of date. Refresh before receiving.`

Header behavior:
- Station ID must remain visible during scroll in compact form.
- Tapping station scope opens no global station switcher.
- If station scope is missing, content must be blocked before any row renders.

### Freshness Banner
Show only when needed.

`offline_cached` banner:
- Title: `Offline queue view`
- Body: `You can review saved intake rows. Reconnect before starting any intake that is not already queued.`
- Action: `Open offline outbox`

`stale_cache` banner:
- Title: `Queue may be stale`
- Body: `This list was last updated {relativeTime}. Refresh before receiving a package.`
- Action: `Refresh`

`partial_data` banner:
- Title: `Some rows may be missing`
- Body: `The latest request did not finish. Review visible rows carefully and refresh when the network improves.`
- Action: `Retry`

`sync_conflict_warning` banner:
- Title: `Queued action needs review`
- Body: `A saved station action may change this queue. Resolve it before receiving another package.`
- Action: `Open outbox`

### Intake Queue Summary
Use a compact three-metric strip.

Metrics:
- `Ready`: count of rows eligible to open package intake.
- `Payment pending`: count of eligible rows with payment not confirmed.
- `Review`: count of rows withheld from main intake due to status, issue, refund, stale cache, or local conflict.

Metric rules:
- Metrics are derived from currently loaded rows plus local outbox signals.
- Metrics must not claim total station workload outside the loaded backend query.
- Metric labels must fit narrow screens.
- A metric tap updates the filter, not delivery state.

### Search Input
Label:
- `Search intake queue`

Search by:
- `trackingCode`
- `deliveryId`
- `receiverName`
- `originStationId`
- `destinationStationId`

Search behavior:
- Trim leading and trailing spaces.
- Case-insensitive.
- Ignore hyphen and space differences for tracking code matching.
- Debounce local filtering by `150ms`.
- Do not call backend per keystroke in v1.
- Preserve search text through refresh.
- If a camera tracking-code scan is supported, populate the search field and filter locally.

Search empty copy:
- Title: `No matching intake rows`
- Body: `Check the tracking code, receiver name, or ask the sender to confirm this is the origin station.`
- Actions: `Clear search`, `Open support`

### Filter Rail
Filters:
- `All`
- `Payment confirmed`
- `Payment pending`
- `Oldest`
- `Needs review`
- `Doorstep`
- `Station pickup`

Filter behavior:
- `All`: shows all main eligible rows.
- `Payment confirmed`: `paymentStatus = confirmed`.
- `Payment pending`: `paymentStatus = pending` or `failed`.
- `Oldest`: rows older than the station threshold.
- `Needs review`: blocked reference group.
- `Doorstep`: `doorstepRequested = true`.
- `Station pickup`: `doorstepRequested = false`.

Filter rail rules:
- Use horizontally scrollable chips on small screens.
- Each chip must have selected, focused, pressed, disabled, and loading states.
- The selected filter count should be announced with status messaging.
- Do not stack more than two chip rows.
- Avoid icon-only filters.

### Sort Menu
Sort options:
- `Oldest first`
- `Newest first`
- `Payment confirmed first`
- `Receiver A-Z`
- `Destination station`

Default sort:
- `Oldest first`

Sort rules:
- `Oldest first` uses `latestOccurredAt` ascending.
- `Newest first` uses `latestOccurredAt` descending.
- `Payment confirmed first` groups confirmed rows first, then sorts oldest first.
- `Receiver A-Z` uses localized string compare and falls back to tracking code.
- `Destination station` groups by `destinationStationId`, then oldest first.
- Current sort must persist until the operator leaves the station session.

## Queue Row Specification
Each row must fit a three-line mobile list pattern.

Row top line:
- Tracking code.
- Payment status chip.
- Age indicator.

Row second line:
- Receiver name.
- Corridor: `{originStationId} to {destinationStationId}`.

Row third line:
- Service label.
- Doorstep label if `doorstepRequested = true`.
- Latest touchpoint label.
- Local risk label when needed.

Primary row label:
- `{trackingCode} for {receiverName}`

Supplemental row labels:
- `Payment confirmed`
- `Payment pending`
- `Payment failed`
- `Doorstep requested`
- `Station pickup`
- `Updated {relativeTime}`

Row right affordance:
- Chevron or text `Open`.
- Do not show a checkmark until the intake confirmation screen.

Row visual priority:
- Payment failed or refund state: caution tone.
- Payment pending: amber tone, not red.
- Confirmed and fresh: neutral tone.
- Stale cache: muted row with stale badge.
- Local conflict: blocked row treatment and no package-intake navigation.

Row tap behavior:
- If row is eligible and fresh enough: navigate to `StationPackageIntake`.
- If row is stale and network is available: show refresh confirmation sheet.
- If row is stale and offline: open delivery detail read-only or outbox, not mutation flow.
- If row is payment failed: allow package-intake navigation, but keep the payment-failed caution visible so the operator knows dispatch remains blocked after intake.
- If row has local conflict: open offline outbox.

Row long press:
- Not required.
- Do not hide critical actions behind long press.

Swipe behavior:
- Pull to refresh is allowed.
- Row-level destructive or state-changing swipe is not allowed.

## Queue Classification Logic
Create a view model called `stationIntakeQueueView`.

Input:
- Auth principal.
- Delivery list rows.
- Local outbox records.
- Network freshness state.
- Current filter.
- Current sort.
- Current search text.

Output:
- `stationScope`
- `freshnessState`
- `readyRows`
- `reviewRows`
- `filteredRows`
- `metrics`
- `primaryRecoveryAction`
- `blockedReasonByDeliveryId`

Main queue inclusion:
- Include row when `currentStatus = created`.
- Include row when `originStationId = principal.stationId`.
- Exclude row when `destinationStationId = principal.stationId` but origin differs.
- Exclude row when local outbox marks the same delivery with unresolved conflict.

Review group inclusion:
- Include row when status is `issue_reported` and origin station matches.
- Include row when status is `on_hold` and origin station matches.
- Include row when payment status is `refund_pending` and origin station matches.
- Include row when local outbox conflict exists for that delivery.

Risk priority:
1. Missing station scope.
2. Not authorized.
3. Local conflict.
4. Stale cache.
5. Issue or hold.
6. Refund state.
7. Payment failure.
8. Payment pending.
9. Ready.

If two classifications apply, the higher risk wins.

## Offline And Cache Rules
The station intake queue is offline-critical for reads and workflow preparation.

Local cache must store:
- Delivery list rows returned for the station.
- Last successful fetch timestamp.
- Active search and filter state.
- Local outbox count.
- Row-level conflict markers.
- Station scope used for the cache.

Cache scoping:
- Cache key must include `stationId`.
- Cache key must include authenticated user ID.
- A station cache must never be reused under another station ID.
- Sign-out clears user-bound cache encryption keys when the platform supports it.

Cache freshness:
- Fresh: fetched within `2 minutes`.
- Aging: fetched between `2` and `10 minutes`.
- Stale: fetched more than `10 minutes` ago.
- Expired for mutation start: fetched more than `15 minutes` ago and network is available.

Offline behavior:
- Show cached rows immediately.
- Show freshness banner before the queue rows.
- Allow search and filtering over cached rows.
- Do not claim that cached counts are live.
- When opening package intake offline, require that the next screen performs its own offline-write eligibility checks.
- If local outbox has failed or conflicted intake actions, block package-intake navigation for those delivery IDs.

Reconnect behavior:
- Refresh quietly when app returns online.
- Preserve search, filter, sort, and scroll position where possible.
- If a visible row disappears after refresh, show status message: `Queue updated. One row moved out of intake.`
- If a row changes from payment pending to confirmed, update the chip without modal interruption.
- If a local conflict is found, show the conflict banner and route to outbox.

## State Model
`loading`:
- Initial request is in progress and no usable cache exists.
- Show skeleton rows with station header, not blank white space.

`ready`:
- Fresh or aging data exists and at least one row matches current filter.

`empty`:
- Fresh request succeeded and no eligible main rows exist.

`search_empty`:
- Fresh or cached data exists, but current search or filter returns no rows.

`offline_cached`:
- No network, usable cache exists.

`stale_cache`:
- Cache exists but age exceeds `10 minutes`.

`partial_data`:
- Some request work failed, but rows are still renderable.

`refreshing`:
- Existing queue remains visible while refresh spinner is shown in the header.

`missing_station_scope`:
- Principal lacks `stationId`.

`not_authorized`:
- Backend denies access or role is not `station_operator`.

`session_expired`:
- Auth token expired or refresh failed.

`api_error`:
- Non-auth backend failure.

`rate_limited`:
- Backend returns throttling response.

`sync_conflict_warning`:
- Local outbox reports unresolved action conflict affecting the intake queue.

## Empty States
### No Intake Work
Title:
- `No packages waiting for intake`

Body:
- `This station has no created deliveries waiting to be received right now.`

Actions:
- `Refresh`
- `Back to overview`
- `Open support`

### Search Empty
Title:
- `No matching intake rows`

Body:
- `Check the tracking code, receiver name, or station. This queue only shows deliveries for your origin station.`

Actions:
- `Clear search`
- `Open support`

### Missing Station Scope
Title:
- `Station scope missing`

Body:
- `Your staff account is not linked to a station. Ask a supervisor to update your access before receiving packages.`

Actions:
- `Back to role home`
- `Sign out`

### Not Authorized
Title:
- `You cannot view this intake queue`

Body:
- `This screen is only for station operators assigned to this station.`

Actions:
- `Back to role home`
- `Sign out`

### API Error
Title:
- `Intake queue did not load`

Body:
- `The station queue could not be refreshed. You can retry or use saved rows if available.`

Actions:
- `Retry`
- `Open offline outbox`
- `Open support`

### Rate Limited
Title:
- `Too many refresh attempts`

Body:
- `Wait a moment before refreshing the queue again.`

Actions:
- `Retry when available`
- `Back to overview`

## Error Mapping
`AUTH_REQUIRED`:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

`FORBIDDEN_ROLE`:
- State: `not_authorized`
- Message: `You do not have permission for this station queue.`
- Action: `Back to role home`

`STATION_SCOPE_VIOLATION`:
- State: `not_authorized`
- Message: `This queue is outside your station scope.`
- Action: `Back to overview`

`DELIVERY_NOT_FOUND`:
- Row route recovery.
- Message: `Delivery record not found. Refresh the queue.`
- Action: `Refresh`

`VALIDATION_ERROR`:
- State: `api_error`
- Message: `The queue request was not valid. Update the app or contact support.`
- Action: `Open support`

`UNKNOWN_INTERNAL_ERROR`:
- State: `api_error`
- Message: `Something went wrong on our side. Retry in a moment.`
- Action: `Retry`

Network timeout:
- State: `offline_cached` or `api_error` depending on cache.
- Message: `Network is slow. Showing saved queue if available.`
- Action: `Retry`

## Copy System
Voice:
- Direct.
- Operational.
- Calm.
- Specific.

Preferred verbs:
- `Open`
- `Receive`
- `Refresh`
- `Search`
- `Clear`
- `Review`
- `Resolve`

Avoid:
- Vague success words.
- Blame language.
- Finance jargon in row labels.
- Internal implementation terms.
- Long instructional paragraphs.

Microcopy:
- Queue title: `Intake queue`
- Search label: `Search intake queue`
- Sort label: `Sort`
- Filter label: `Filter intake rows`
- Ready metric: `Ready`
- Pending metric: `Payment pending`
- Review metric: `Review`
- Row action: `Open intake`
- Refresh action: `Refresh queue`
- Cache warning: `Saved queue`
- Conflict warning: `Outbox review needed`

## Visual System Direction
This screen should use the station operations visual language from the shared ops mobile specs.

Mood:
- Precise.
- Industrial.
- High trust.
- Quiet under pressure.

Color roles:
- Background: warm off-white or very light neutral.
- Primary text: near-black neutral.
- Secondary text: gray with AA contrast.
- Station accent: deep green or blue used sparingly for scope and ready state.
- Caution: amber for payment pending or stale data.
- Blocked: red or rust only for conflict, failed payment, issue, or forbidden states.
- Offline: desaturated blue-gray.

Typography:
- Strong title.
- Scannable numeric metrics.
- Compact row labels.
- No expressive marketing typography inside the operator flow.

Spacing:
- Use consistent spacing tokens.
- Keep header compact but not cramped.
- Keep row touch targets large enough for one-handed work.
- Keep bottom safe-area padding clear of system navigation.

Motion:
- Pull-to-refresh uses native motion.
- Filter changes can crossfade result count and rows.
- Refresh completion announces status without stealing focus.
- No looping decorative motion.
- Respect reduced-motion settings.

## Component Inventory
`StationScopeHeader`:
- Shows station ID/name, role, freshness, and outbox count.
- Test ID: `station-intake-scope-header`

`QueueFreshnessBanner`:
- Shows offline, stale, partial, or conflict state.
- Test ID: `station-intake-freshness-banner`

`IntakeMetricsStrip`:
- Shows ready, payment pending, and review counts.
- Test ID: `station-intake-metrics`

`IntakeSearchInput`:
- Local queue search.
- Test ID: `station-intake-search`

`IntakeFilterRail`:
- Horizontal chips for quick filters.
- Test ID: `station-intake-filter-rail`

`IntakeSortMenu`:
- Sort control with accessible menu.
- Test ID: `station-intake-sort`

`IntakeResultSummary`:
- Announces visible result count and active filter.
- Test ID: `station-intake-result-summary`

`IntakeQueueList`:
- Virtualized list of queue rows.
- Test ID: `station-intake-list`

`IntakeQueueRow`:
- One delivery row.
- Test ID: `station-intake-row-{deliveryId}`

`ReviewQueueGroup`:
- Collapsed group for rows not eligible for main intake.
- Test ID: `station-intake-review-group`

`StationQueueEmptyState`:
- Empty, search empty, and no-cache states.
- Test ID: `station-intake-empty-state`

`QueueRecoveryActions`:
- Retry, support, outbox, and overview actions.
- Test ID: `station-intake-recovery-actions`

## Layout Requirements
Small phone:
- Sticky station header.
- One-line metric strip with horizontal scroll only if needed.
- Search below metrics.
- Filter rail below search.
- Rows use full width.
- Row height target: `88dp` to `104dp` depending on text size.

Large phone:
- Header can show station ID and freshness in one line.
- Metrics can use three equal columns.
- Filter rail remains single row.

Tablet or foldable:
- Still prioritize mobile list behavior.
- Optional two-column layout only when station queue row width remains readable.
- Detail pane is not required for v1.

Keyboard and scanner accessories:
- Search input must support hardware keyboard input.
- External scanner text should land in search when search is focused.
- If scanning a tracking code launches a route, focus must remain predictable after return.

## Accessibility Requirements
Screen reader order:
1. Header title.
2. Station scope.
3. Freshness state.
4. Metrics.
5. Search.
6. Filters.
7. Sort.
8. Result summary.
9. Rows.
10. Recovery actions.

Required labels:
- Every row must include tracking code, receiver name, payment state, and destination station in the accessible name or description.
- Payment chip must not rely on color alone.
- Freshness banner must be exposed as status text.
- Refresh progress must be exposed as a status message.
- Filter selection changes must announce result count.

Touch targets:
- Row target must meet or exceed `44dp` height in the implementation system, with no adjacent tiny controls.
- Any chip or icon button must meet WCAG target-size minimum or have sufficient spacing.

Focus behavior:
- Initial focus lands on screen title after navigation.
- Pull-to-refresh must not move focus.
- Opening sort menu moves focus into menu.
- Closing sort menu returns focus to sort button.
- Clearing search returns focus to search input.

Text size:
- Support large text without clipping payment chips.
- Receiver name may wrap to two lines before truncation.
- Tracking code must remain visible.

Reduced motion:
- Disable row crossfade and use instant list updates.

## Security And Privacy Rules
Data visibility:
- Do not show phone numbers on this queue.
- Do not show receiver address on this queue.
- Do not show payment provider reference.
- Do not show raw auth claims.
- Do not show delivery rows outside station scope.

Logging:
- Log route open, filter change, refresh, and row open with delivery ID.
- Do not log receiver name in analytics.
- Do not log search text unless privacy review approves hashed tracking-code matching.
- Log client anomaly if backend returns a row outside the current station scope.

Access:
- Require active authenticated principal.
- Require `role = station_operator`.
- Require `stationId`.
- On station mismatch, block content and ask user to return to role home.

## Performance Requirements
Initial render:
- Show cached rows immediately when available.
- Start network refresh after cache render.
- Avoid blocking first paint on icons or heavy assets.

List performance:
- Support at least `100` rows without dropped scroll frames on low-end Android.
- Use virtualized list rendering where the mobile framework requires it.
- Keep row component pure with stable keys based on `deliveryId`.
- Do not render hidden detail content inside every row.

Search performance:
- Local search over `100` rows should feel instant.
- Search debounce target: `150ms`.
- Avoid network calls per keypress.

Refresh performance:
- Pull-to-refresh should keep current rows visible.
- Header spinner should not reflow the list.
- Failed refresh should keep old data visible with a banner.

## Data Freshness And Time Rules
Relative time labels:
- Under `1 minute`: `Just updated`
- `1` to `59` minutes: `{n} min ago`
- `1` to `23` hours: `{n} hr ago`
- Older: formatted local date and time

Queue aging:
- Intake row age is based on `latestOccurredAt`.
- A row older than `30 minutes` should be visually marked as `Waiting`.
- A row older than `2 hours` should be marked `Overdue`.
- Same-day dispatch target applies only to packages received before `15:00` and cleared for payment and routing.

Station hours:
- If the station hours service is not available, do not invent open or closed state.
- If local station hours are known, show `Open until 19:00` or `Closed - opens 07:00`.
- Do not block intake purely from client-side hours in v1.

## Navigation Rules
From `StationOverview`:
- Opening intake count navigates to `/(ops)/station/intake`.
- Preserve previous filter if operator returns during the same session.

To `StationPackageIntake`:
- Navigate with `deliveryId`.
- Pass current row snapshot for fast header paint.
- Next screen must refetch or validate delivery before submission.

To `OpsDeliveryDetail`:
- Use for context, not mutation.
- Returning should restore scroll position.

To `OpsCustodyChain`:
- Use when row has unusual touchpoint or prior handoff evidence.
- Returning should restore search.

To `OpsOfflineOutbox`:
- Use when local conflict or queued action affects queue.
- Returning should trigger refresh if network is available.

To `StationSupport`:
- Use for missing package, station mismatch, payment failure, issue, or access problem.

Back behavior:
- Back returns to `StationOverview`.
- If opened from role home, back returns to role home.
- Do not clear search or filters on back unless the screen is unmounted.

## Analytics And Audit Events
Client analytics:
- `station_intake_queue_viewed`
- `station_intake_queue_refreshed`
- `station_intake_queue_filter_changed`
- `station_intake_queue_search_used`
- `station_intake_row_opened`
- `station_intake_review_row_opened`
- `station_intake_offline_cache_shown`
- `station_intake_conflict_banner_opened`

Event payload fields:
- `stationId`
- `actorRole`
- `rowCount`
- `readyCount`
- `paymentPendingCount`
- `reviewCount`
- `freshnessState`
- `filter`
- `sort`
- `sourceRoute`

Privacy exclusions:
- No receiver name.
- No phone number.
- No address.
- No raw search text.
- No payment provider reference.

Operational metrics:
- Queue load latency.
- Cache hit rate.
- Refresh failure rate.
- Row open rate.
- Search empty rate.
- Time from queue open to intake screen open.
- Conflict banner frequency.

## QA Acceptance Criteria
Station scope:
- Given a station operator with `stationId=ST-ACC-01`, only rows with `originStationId=ST-ACC-01` appear in the main queue.
- Given a returned row with destination station only, the row is hidden from main intake.
- Given missing `stationId`, no delivery rows render.

Data loading:
- Given no cache and a successful request, the screen shows the fresh queue.
- Given no cache and a failed request, the screen shows an error state.
- Given cache and offline state, the screen shows cached rows with an offline banner.
- Given cache older than `10 minutes`, the stale banner appears.

Search:
- Searching by tracking code filters locally.
- Searching by receiver name filters locally.
- Searching with extra spaces still matches.
- Clearing search restores filtered queue.

Filters:
- `Payment confirmed` shows confirmed rows.
- `Payment pending` shows pending or failed rows.
- `Oldest` shows rows beyond the configured wait threshold.
- `Doorstep` shows `doorstepRequested=true`.
- `Station pickup` shows `doorstepRequested=false`.

Sort:
- Default sort is oldest first.
- Changing sort updates row order without route change.
- Sort selection persists after refresh.

Row behavior:
- Tapping an eligible fresh row opens `StationPackageIntake`.
- Tapping a local-conflict row opens offline outbox.
- Tapping a review row opens detail or support, not package intake.
- Row accessible label contains tracking code, receiver, payment state, and route.

Offline:
- Pull-to-refresh while offline keeps cached content visible.
- Reconnect refresh does not clear search.
- Reconnect row removal announces a status update.
- Local conflict blocks affected row from intake navigation.

Errors:
- `AUTH_REQUIRED` routes to sign-in recovery.
- `FORBIDDEN_ROLE` blocks content.
- `STATION_SCOPE_VIOLATION` blocks content.
- Rate limit shows wait-and-retry state.

Accessibility:
- All row targets are large enough for touch use.
- Filter changes announce result count.
- Refresh status uses screen-reader status messaging.
- Large text does not hide tracking code.
- Color is never the only payment-state cue.

## Engineering Notes
Recommended file ownership:
- `apps/mobile/features/station/intake-queue`
- Shared queue row primitives may live under operations mobile shared components if already established.

Recommended state holder:
- `useStationIntakeQueueScreen`

Recommended selectors:
- `selectStationScopedRows`
- `selectIntakeEligibleRows`
- `selectReviewRows`
- `selectQueueMetrics`
- `selectFilteredRows`
- `selectSortedRows`

Recommended local cache records:
- `station_intake_queue_cache`
- `station_queue_fetch_metadata`
- `station_action_outbox_summary`

Do not duplicate backend enum values manually when shared contracts are available.

## Implementation Guardrails
Must use shared contracts:
- `deliveryListResponseSchema`
- `deliveryListQuerySchema`
- `deliveryStatusSchema`
- `paymentStatusSchema`
- `stationIdSchema`

Must respect shared domain:
- `created` is the only main intake status.
- `created -> received_at_origin` is the intake transition.
- Sender cancellation rules change after origin intake.
- Origin intake reserves immutable package scan code in `package_labels`.

Must respect operations policy:
- Manual code fallback belongs to scan or intake flow, not the queue.
- Supervisor override does not appear on the queue.
- Station lead overload escalation is handled through support or admin, not queue mutation.
- If queue age exceeds station threshold, the row is highlighted but not auto-escalated by the queue.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [Material Design lists](https://m1.material.io/components/lists.html): supports using a vertical list for similar operational rows, clear primary row action, logical sorting, and compact row hierarchy.
- [Material Design chips](https://m1.material.io/components/chips.html): supports compact filter chips with clear selected and focused states.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local data first, visible cached reads, and explicit network synchronization.
- [ML Kit barcode scanning](https://developers.google.com/ml-kit/vision/barcode-scanning): supports on-device barcode recognition for the optional tracking-code search helper and confirms scanning can work without network.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large enough touch targets and spacing on mobile queue rows and filters.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, filter result count, offline, and error updates without moving focus.

Design translation:
- Use list rows, not dense cards, because the data type is homogeneous and scanability matters.
- Use chips only for compact filtering, not as decorative labels everywhere.
- Use local cache and explicit freshness state because station intake must remain useful in unreliable network conditions.
- Keep barcode scanning as a helper to populate search, not as a state mutation.
- Keep row targets generous because station operators work one-handed and under pressure.
- Announce non-context-changing queue updates for screen-reader users.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The screen route matches `/(ops)/station/intake`.
- The top-level test ID is `screen-station-intake-queue`.
- The screen does not call `confirm_intake`.
- The screen does not show non-origin-station rows.
- The screen renders cached data with visible freshness.
- The screen blocks content when station scope is missing.
- The screen opens `StationPackageIntake` only for eligible rows.
- The screen handles payment pending and failed states explicitly.
- The screen preserves search, filter, sort, and scroll on refresh.
- The screen has no direct bulk mutation action.
- The screen has accessible result announcements.
- The screen has recovery for offline, rate limit, and auth errors.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- The main queue is limited to `currentStatus=created` and matching origin station.
- All row actions route to correct next screens.
- Offline cached reads work without network.
- Local outbox conflicts block affected intake navigation.
- Search and filters work locally.
- Sort order is predictable and persisted for the station session.
- Large text and screen readers can use the screen.
- No sensitive receiver phone, address, or provider payment data is shown.
- Integration tests cover station scope, empty state, cached state, and row navigation.
- E2E tests cover station operator opening a row from the intake queue.

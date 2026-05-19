# DriverHistory Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverHistory` |
| Route | `/(ops)/driver/history` |
| Primary test ID | `screen-driver-history` |
| Surface | Driver mobile app |
| Backend coverage | `list_deliveries` through `GET /v1/deliveries` |
| Offline critical | No |
| Required role | `driver` |
| Required capability | `view_own_delivery` |
| Primary mutation | None |
| Primary data source | `list_deliveries?limit=100` with authenticated driver assignment scope |
| Supporting reads | `get_delivery` and `get_delivery_timeline` only after opening a row detail |
| Related routes | `/(ops)/driver/runs`, `/(ops)/driver/runs/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/earnings`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Read-only driver run ledger derived from assigned deliveries |

## Product Job
`DriverHistory` lets a driver review past assigned transport work, understand whether each run was completed, failed, cancelled, or still needs review, and open the right detail or support path without changing delivery state.

The screen answers:

- `Which runs have I completed recently?`
- `Which assigned runs ended with issue, failure, or cancellation?`
- `Which delivery should I open if support asks for evidence?`
- `Can I find a run by tracking code, station pair, or status?`
- `Is this row a finished driver run or still active operational work?`
- `What data is fresh and what is only saved from earlier?`

This is a history screen, not an active work queue, earnings ledger, or support case manager.

## Product Standard
The history screen should feel like a professional driver ledger. It must be fast to scan, privacy-safe, and clear about operational outcomes.

The driver should be able to:

- See recent completed and failed assigned runs.
- Search locally by tracking code, origin station, destination station, and route pair.
- Filter by outcome.
- Open run detail, custody chain, or support with delivery context.
- Distinguish active assigned work from history.
- See data freshness.
- Use the screen on narrow phones without dense table layouts.

The screen must never:

- Mutate delivery state.
- Accept or reject runs.
- Mark in transit.
- Submit station receipt.
- Complete receiver delivery.
- Display receiver phone number.
- Display full receiver address.
- Display raw proof references or package scan codes.
- Present estimated earnings as settled payout unless a payout backend exists.
- Mix active jobs into completed history without clear separation.

## Audience
Primary audience:

- Driver reviewing previous assigned inter-station runs.

Secondary audience:

- Support agent asking a driver to locate a delivery.
- QA validating assignment-scoped visibility.
- Claude Code implementing history, filters, and empty states.
- Operations lead validating accountability and dispute readiness.
- Accessibility reviewer validating search, filters, row navigation, and list updates.

## Context Of Use
The driver may open history:

- After completing a destination handoff.
- During a support call.
- At end of shift.
- When checking whether a run was accepted by a station.
- When comparing completed runs with earnings later.
- When offline and trying to recall a tracking code.
- After a cancelled or issue-routed delivery.

The driver is not trying to run dispatch from here. The screen should keep active work accessible but secondary.

## Design Brief
Audience:

- Field driver who needs a trustworthy record of assigned runs.

Surface type:

- Mobile read-only history ledger.

Primary action:

- `Find a past run`

Visual thesis:

- `Route ledger`: a clean chronological log with route-pair typography, outcome bands, and a search/filter lens pinned at the top.

Restraint rule:

- Do not add maps, earnings calculations, station dashboards, support thread editing, or any delivery mutation controls.

Interaction density:

- Medium: history needs search and filters, but each row must stay readable under field conditions.

Trust posture:

- Treat `list_deliveries` as the source for row summaries. Treat delivery detail and timeline as deeper evidence after row open.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Task History support](https://support.onfleet.com/hc/en-us/articles/360023910851-Task-History): supports driver-visible completed task history, visibility limits, task detail access, and privacy handling for older tasks.
- [Onfleet Proof of Delivery](https://onfleet.com/proof-of-delivery): supports proof-backed delivery records and accountability for disputes.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports showing cached reads with clear freshness and refreshing when connectivity returns.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, refresh, search result, and filter-result announcements.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): supports large row actions, filter controls, and search clear buttons.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/07-data/state-machine.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/02-driver-home.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/03-assigned-runs.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/12-driver-destination-handoff.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/19-sender-delivery-history.md`

## Backend Contract
Primary route:

- `GET /v1/deliveries`
- Operation ID: `list_deliveries`
- Auth scope: authenticated
- Request query: `status`, `paymentStatus`, `limit`
- Response: `deliveryListResponseSchema`

Driver scope:

- Firestore repository filters driver list by `assignedDriverId === principal.userId`.
- The route returns only deliveries accessible to the authenticated principal.
- The screen still must not assume global access.

Current request recommendation:

- Use `list_deliveries?limit=100`.
- Client-filter rows into history categories.
- Use status-filtered calls only if performance later requires narrower fetches.

Current API limits:

- No cursor pagination exists.
- No date range query exists.
- No multi-status query exists.
- No dedicated driver run history endpoint exists.
- No route distance or duration is returned.
- No driver payout or settlement fields are returned.
- No explicit driver handoff completion timestamp is returned in list rows.
- No issue severity is returned in list rows.
- `receiverName` is returned, but this screen should avoid showing it by default.

Production-ready recommendation:

- Add `GET /v1/driver/runs/history` with cursor pagination, outcome classification, completion timestamp, station display names, receipt outcome, issue summary flag, and payout reference when payroll exists.
- Add redacted driver-safe history rows that omit receiver contact data.
- Add server-side multi-status filtering or outcome buckets.

## Data Fields Used
From list rows:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `doorstepRequested`

Use with restraint:

- `receiverName` may be present in the response.
- Do not show `receiverName` in the default list row.
- Show receiver name only in a detail route if that screen has a justified operational need and privacy policy allows it.

Do not use:

- Receiver phone.
- Full receiver address.
- Proof reference.
- Package scan code.
- Payment provider reference.
- Internal notes.

## History Derivation
The current backend returns delivery rows, not separate driver run rows. The screen must derive driver history outcome from `currentStatus`.

Completed driver handoff outcomes:

- `received_at_destination`
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`
- `delivered`
- `closed`

Needs review outcomes:

- `issue_reported`
- `on_hold`
- `delivery_failed`
- `cancelled`

Active driver work outcomes:

- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`

Pre-driver states that should normally not appear for driver history:

- `draft`
- `created`
- `received_at_origin`
- `awaiting_driver_assignment`

If pre-driver states appear in a driver-scoped response, show them only in an exception section called `Needs review`, not normal history.

## Outcome Buckets
### `completed_handoff`
Meaning:

- Driver work is done because the package has reached station receipt or later state.

Statuses:

- `received_at_destination`
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`
- `delivered`
- `closed`

Visual:

- Green or neutral success band.
- Route pair prominent.
- Timestamp of latest occurrence.

### `needs_review`
Meaning:

- The assigned run ended or paused with issue, hold, failure, cancellation, or unexpected state.

Statuses:

- `issue_reported`
- `on_hold`
- `delivery_failed`
- `cancelled`
- Any pre-driver state returned to a driver.

Visual:

- Amber or red outcome band based on severity.
- Strong CTA to open detail or support.

### `active_not_history`
Meaning:

- The row belongs in active work, not history.

Statuses:

- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`

Visual:

- Small section at top only if active rows are returned.
- CTA `Open active run`.
- Do not bury active work among completed history.

## Screen Information Architecture
Top-to-bottom structure:

1. Header and freshness strip.
2. Search and filter lens.
3. Outcome summary.
4. Active work notice when applicable.
5. Chronological history list.
6. Empty or no-result panel.
7. Footer guidance.

The first viewport should show:

- Page title.
- Last refreshed timestamp.
- Search input.
- Outcome filters.
- First visible history row or empty state.

## Layout Anatomy
### 1. Header And Freshness Strip
Purpose:

- Establish this is a read-only ledger and show freshness.

Content:

- Title: `Run history`
- Subtitle: `Completed, failed, and reviewed assigned runs.`
- Last refreshed timestamp.
- Offline saved-state indicator.

Copy:

- Fresh: `Updated just now`
- Refreshing: `Refreshing history`
- Offline saved: `Showing saved history`
- Error: `History could not refresh`

### 2. Search And Filter Lens
Purpose:

- Let driver find a run fast without dense controls.

Search targets:

- Tracking code.
- Delivery ID.
- Origin station ID.
- Destination station ID.
- Route pair.
- Status label.

Filters:

- `All`
- `Completed`
- `Needs review`
- `Station pickup`
- `Doorstep routed`
- `Delivered`
- `Cancelled or failed`

Rules:

- Filters operate locally on the loaded rows.
- Search operates locally on the loaded rows.
- Announce result count after filtering.
- Keep clear search button reachable.

### 3. Outcome Summary
Purpose:

- Give quick shift-level orientation.

Metrics:

- Completed count.
- Needs review count.
- Active returned count.
- Last completed time.

Do not show:

- Earnings.
- Settlement.
- Distance.
- Performance score.

### 4. Active Work Notice
Purpose:

- Avoid hiding still-active runs in history.

Display when active rows are returned:

- `You have active runs outside history.`
- CTA `Open assigned runs`

Rows:

- Show at most `3` active rows.
- Send user to active workflow on tap.

### 5. History List
Row content:

- Route pair: `{originStationId} -> {destinationStationId}`
- Tracking code.
- Outcome label.
- Latest event time.
- Service type.
- Doorstep flag.
- Payment state only if operationally relevant and safe.
- Latest touchpoint role and station.

Row actions:

- Tap row opens assigned-run detail or shared delivery detail.
- Secondary action `Custody chain`.
- Tertiary action `Support` for issue or failed rows.

Row must not display:

- Receiver phone.
- Full address.
- Package scan code.
- Raw proof reference.

### 6. Empty And No-Result Panels
Empty history:

- Title: `No completed runs yet`
- Body: `Finished or reviewed driver runs will appear here after station receipt, issue review, failure, or cancellation.`
- CTA: `Open assigned runs`

No search results:

- Title: `No matching runs`
- Body: `Try tracking code, station ID, route, or a different outcome filter.`
- CTA: `Clear search`

Offline empty:

- Title: `No saved history`
- Body: `Connect to load your assigned run history.`
- CTA: `Retry`

### 7. Footer Guidance
Purpose:

- Explain data limits without clutter.

Copy:

- `History shows the most recent assigned deliveries available on this device. Open detail for full timeline evidence.`

## Interaction Flow
### Flow 1: Load History Online
1. Driver opens `/(ops)/driver/history`.
2. Screen reads cached history if available.
3. Screen calls `list_deliveries?limit=100`.
4. Client derives outcome buckets.
5. UI renders active notice, summary, and history rows.
6. Screen announces result count.

### Flow 2: Search A Tracking Code
1. Driver taps search.
2. Driver enters part of tracking code.
3. UI filters local rows.
4. Result count updates.
5. Driver taps row.
6. App opens delivery detail or assigned-run detail.

### Flow 3: Filter Needs Review
1. Driver taps `Needs review`.
2. UI shows issue, hold, failure, cancellation, and unexpected rows.
3. Driver opens support from a row.
4. Support receives delivery context.

### Flow 4: Open Completed Run
1. Driver taps completed row.
2. App opens driver run detail or delivery detail.
3. Detail can open custody chain and timeline.
4. History itself remains read-only.

### Flow 5: Offline With Saved History
1. Driver opens screen offline.
2. UI shows saved history with cache age.
3. Search and filters work locally.
4. Refresh CTA is disabled or says waiting for connection.
5. No mutation actions are shown.

### Flow 6: Active Row Appears
1. `list_deliveries` returns `in_transit`.
2. Screen places it in active notice, not completed list.
3. Driver taps `Open active run`.
4. App routes to assigned run detail or current next action.

## Data Loading
Initial load:

- Hydrate from local cache if available.
- Call `list_deliveries?limit=100` when online.
- Save sanitized rows to local history cache.
- Do not cache receiver name unless product policy explicitly allows it.

Refresh:

- Pull to refresh calls `list_deliveries?limit=100`.
- Foreground return may refresh when cache is older than `5 minutes`.
- Manual retry after error.

Freshness:

- Fresh under `2 minutes`.
- Stale after `5 minutes`.
- Saved-only after offline.

Sorting:

- Sort by `latestOccurredAt` descending.
- Keep active notice above history.
- Preserve stable ordering when timestamps match by `deliveryId`.

Limit behavior:

- Current API max is `100`.
- Show footer: `Showing recent assigned deliveries`.
- Do not imply full lifetime history until pagination exists.

## Search And Filters
Search normalization:

- Trim whitespace.
- Case-insensitive.
- Match partial tracking code.
- Match delivery ID.
- Match station IDs.
- Match route pair with or without spaces.
- Match status labels.

Filter behavior:

- Search and filter combine.
- Filters update result count.
- Empty filter result must not clear query automatically.
- Clear all control resets search and filters.

Performance:

- Use deferred search value if the mobile stack supports it.
- Avoid re-rendering every row when only text input changes.
- Use virtualized list when loaded rows exceed `40`.

## Visual Design System
### Visual Direction
The screen should feel like a high-grade transport ledger:

- Strong date grouping.
- Clear route-pair typography.
- Outcome color bands with text labels.
- Compact evidence metadata.
- Quiet filter lens.
- No decorative map cards.

### Color Tokens
Suggested semantic tokens:

- `--history-bg`: warm neutral.
- `--history-surface`: clean surface.
- `--history-ink`: primary text.
- `--history-muted`: secondary text.
- `--history-completed`: deep green.
- `--history-review`: amber.
- `--history-failed`: red.
- `--history-active`: slate blue.
- `--history-offline`: graphite.
- `--history-focus`: high-contrast blue.

### Typography
Use:

- Large readable title.
- Route pair as row anchor.
- Tracking code in tabular style.
- Date group labels in compact uppercase or strong body style.
- Outcome labels with text, not color only.

Avoid:

- Dense tables.
- Tiny timestamps.
- More than two row badges by default.

### Spacing
Rules:

- Search and filters stay easy to tap.
- Rows have generous vertical rhythm.
- Secondary row actions are revealed by row expansion or overflow, not crammed inline.
- Empty state has clear CTA.

### Motion
Motion should be minimal:

- Search result count fades.
- Filter chips settle after selection.
- Row press has native feedback.
- No continuous animations.
- Respect reduced motion.

## Component Specification
### `DriverHistoryScreen`
Responsibilities:

- Load list data.
- Hydrate cache.
- Own search and filters.
- Derive outcome buckets.
- Render states and list.

Test IDs:

- `screen-driver-history`
- `driver-history-scroll`

### `HistoryFreshnessStrip`
Responsibilities:

- Show online, refreshing, stale, offline, and error status.

Test IDs:

- `driver-history-freshness-strip`
- `driver-history-cache-age`

### `HistorySearchLens`
Responsibilities:

- Render search input, clear control, and filter chips.

Test IDs:

- `driver-history-search-input`
- `driver-history-clear-search`
- `driver-history-filter-all`
- `driver-history-filter-completed`
- `driver-history-filter-review`
- `driver-history-filter-pickup`
- `driver-history-filter-doorstep`
- `driver-history-filter-failed`

### `HistoryOutcomeSummary`
Responsibilities:

- Show counts for completed, needs review, active returned, and latest run.

Test IDs:

- `driver-history-outcome-summary`
- `driver-history-completed-count`
- `driver-history-review-count`
- `driver-history-active-count`

### `HistoryActiveNotice`
Responsibilities:

- Separate active assigned work from history.

Test IDs:

- `driver-history-active-notice`
- `driver-history-open-active-runs`

### `HistoryList`
Responsibilities:

- Render grouped history rows.
- Support virtualized list if needed.

Test IDs:

- `driver-history-list`
- `driver-history-date-group`

### `DriverHistoryRow`
Responsibilities:

- Show one assigned run summary.
- Route to detail, custody chain, or support.

Test IDs:

- `driver-history-row`
- `driver-history-row-route`
- `driver-history-row-status`
- `driver-history-row-tracking-code`
- `driver-history-row-custody-action`
- `driver-history-row-support-action`

### `HistoryEmptyState`
Responsibilities:

- Show empty, no-result, offline empty, and error states.

Test IDs:

- `driver-history-empty-state`
- `driver-history-empty-action`

## Content System
### Header Copy
Default:

- Title: `Run history`
- Subtitle: `Review completed, failed, and reviewed assigned runs.`

Refreshing:

- `Refreshing run history`

Offline:

- `Showing saved history`

Error:

- `Could not load run history`

### Filter Labels
Use:

- `All`
- `Completed`
- `Needs review`
- `Pickup routed`
- `Doorstep routed`
- `Delivered`
- `Failed`

### Row Outcome Labels
Map status to label:

- `received_at_destination`: `Received at station`
- `awaiting_receiver_pickup`: `Waiting for receiver pickup`
- `awaiting_final_mile_assignment`: `Waiting for final-mile assignment`
- `assigned_for_final_mile`: `Courier assigned`
- `out_for_delivery`: `Out for doorstep delivery`
- `delivered`: `Delivered`
- `closed`: `Closed`
- `issue_reported`: `Issue review`
- `on_hold`: `On hold`
- `delivery_failed`: `Failed`
- `cancelled`: `Cancelled`
- `assigned_to_driver`: `Active assignment`
- `dispatched_from_origin`: `Driver custody`
- `in_transit`: `In transit`

### Empty Copy
No completed runs:

- `No completed runs yet`
- `Finished driver runs appear here after station receipt or review.`

No results:

- `No matching runs`
- `Try a tracking code, station ID, or different filter.`

Error:

- `History could not refresh.`
- `Your saved rows may still be shown below.`

## State Specifications
### `loading`
Trigger:

- No cache and list request active.

UI:

- Search disabled.
- Skeleton rows.
- Loading status announcement.

### `ready`
Trigger:

- `list_deliveries` succeeded.

UI:

- Search and filters active.
- Outcome summary visible.
- History rows rendered.

### `refreshing`
Trigger:

- User pulls to refresh or foreground refresh starts.

UI:

- Keep rows visible.
- Freshness strip says refreshing.
- Do not clear search.

### `empty`
Trigger:

- No derived history rows and no active rows.

UI:

- Empty panel.
- CTA `Open assigned runs`.

### `no_results`
Trigger:

- Search/filter returns no visible rows.

UI:

- No-result panel.
- CTA `Clear search`.

### `offline_saved`
Trigger:

- Network offline and sanitized cached rows exist.

UI:

- Saved history visible.
- Cache age visible.
- Refresh unavailable until online.

### `offline_empty`
Trigger:

- Network offline and no cache.

UI:

- Offline empty panel.
- CTA `Retry when online`.

### `partial_failure`
Trigger:

- Cache exists but refresh fails.

UI:

- Show cache with error strip.
- Allow retry.

### `not_authorized`
Trigger:

- User is not a driver or access is denied.

UI:

- Safe access message.
- No row data.

### `session_expired`
Trigger:

- Auth required.

UI:

- Sign-in CTA.

## Error Handling
| Error | UI title | UI action |
| --- | --- | --- |
| `AUTH_REQUIRED` | `Sign in again` | Route to sign in |
| `FORBIDDEN_ROLE` | `Driver access required` | Back to role home |
| `ASSIGNMENT_SCOPE_VIOLATION` | `This history is not available` | Back to home |
| `VALIDATION_ERROR` | `History filter is invalid` | Reset filters |
| `RATE_LIMITED` | `Too many refreshes` | Wait and retry |
| `UNKNOWN_INTERNAL_ERROR` | `Could not load run history` | Retry |

Error copy should not reveal whether another driver owns a delivery.

## Accessibility Requirements
Structure:

- One `h1`.
- Search input has visible label.
- Filter group has accessible group label.
- Result count is announced after search/filter changes.
- Rows are buttons or links with complete accessible labels.

Row accessible label should include:

- Tracking code.
- Origin station.
- Destination station.
- Outcome.
- Latest date.

Touch:

- Search clear button meets touch target requirement.
- Filter chips meet touch target requirement.
- Row actions are large enough for one-hand use.

Screen reader:

- Announce loading, refresh success, refresh failure, and result count.
- Do not announce every row after each filter update.

Contrast:

- Outcome bands meet contrast.
- Text labels accompany all colors.

## Security And Privacy
Do:

- Keep row data assignment-scoped.
- Show tracking code and station IDs.
- Show safe outcome labels.
- Sanitize cached rows.
- Keep support route context limited to delivery ID and status.

Do not:

- Render receiver phone.
- Render full receiver address.
- Render raw proof references.
- Render package scan codes.
- Cache receiverName by default.
- Log search terms if they can contain tracking or station data.
- Use history for driver performance scoring without policy.

## Analytics
Allowed events:

- `driver_history_viewed`
- `driver_history_refresh_started`
- `driver_history_refresh_succeeded`
- `driver_history_refresh_failed`
- `driver_history_search_used`
- `driver_history_filter_changed`
- `driver_history_row_opened`
- `driver_history_custody_chain_opened`
- `driver_history_support_opened`

Allowed payload:

- `driverUserId`
- `resultCountBucket`
- `filterName`
- `hasSearch`
- `currentStatus`
- `originStationId`
- `destinationStationId`
- `offline`
- `cacheAgeBucket`

Forbidden payload:

- Raw search term.
- Receiver phone.
- Full receiver address.
- Receiver name.
- Package scan code.
- Proof reference.
- Payment provider reference.

## QA Acceptance Criteria
### Data Scope
- Screen calls `list_deliveries`.
- Screen does not call mutations.
- Screen does not show unassigned deliveries.
- Screen does not render receiver phone or full address.
- Screen does not cache receiver name by default.

### History Derivation
- Post-receipt statuses appear in completed history.
- Issue, hold, failed, cancelled, and unexpected states appear in needs review.
- Active statuses appear in active notice, not normal history.
- Unknown or pre-driver states returned to driver appear in needs review.

### Search And Filter
- Search matches tracking code.
- Search matches station IDs.
- Search matches route pair.
- Filter `Completed` shows completed handoff rows.
- Filter `Needs review` shows issue and failed rows.
- No-result state appears when search has no match.

### Offline
- Offline cache displays with cache age.
- Offline empty state appears with no cache.
- Refresh resumes when online.

### Accessibility
- Search has accessible label.
- Filter group has accessible label.
- Result count is announced.
- Row labels include route, status, and time.

## Automated Test Plan
Unit tests:

- `deriveDriverHistoryOutcome` maps post-receipt statuses to completed.
- `deriveDriverHistoryOutcome` maps issue and failed statuses to needs review.
- `deriveDriverHistoryOutcome` maps assigned and transit statuses to active.
- `filterDriverHistoryRows` applies search and filters together.
- `sanitizeDriverHistoryCacheRow` removes receiverName and restricted fields.
- `buildDriverHistoryAnalyticsPayload` removes raw search terms.

Component tests:

- Renders `screen-driver-history`.
- Calls `list_deliveries?limit=100`.
- Renders completed rows.
- Renders needs review rows.
- Renders active notice when active rows are returned.
- Does not render receiver phone.
- Does not render full address.
- Does not render receiverName in row by default.
- Shows empty state.
- Shows no-result state.
- Shows offline saved state.

Integration tests:

- Pull to refresh keeps current search/filter state.
- Row tap opens detail route.
- Custody action opens custody chain.
- Support action opens driver support with delivery context.
- Refresh failure keeps sanitized cached rows visible.

End-to-end tests:

- Driver completes station handoff, opens history, sees completed row.
- Driver searches by tracking code and opens row detail.
- Driver filters needs review and opens support.
- Driver opens history offline and sees saved rows with stale warning.

## Test IDs
Required test IDs:

- `screen-driver-history`
- `driver-history-scroll`
- `driver-history-freshness-strip`
- `driver-history-cache-age`
- `driver-history-search-input`
- `driver-history-clear-search`
- `driver-history-filter-all`
- `driver-history-filter-completed`
- `driver-history-filter-review`
- `driver-history-filter-pickup`
- `driver-history-filter-doorstep`
- `driver-history-filter-failed`
- `driver-history-outcome-summary`
- `driver-history-completed-count`
- `driver-history-review-count`
- `driver-history-active-count`
- `driver-history-active-notice`
- `driver-history-open-active-runs`
- `driver-history-list`
- `driver-history-date-group`
- `driver-history-row`
- `driver-history-row-route`
- `driver-history-row-status`
- `driver-history-row-tracking-code`
- `driver-history-row-custody-action`
- `driver-history-row-support-action`
- `driver-history-empty-state`
- `driver-history-empty-action`

## Implementation Notes For Claude Code
Build `DriverHistory` as a read-only driver run ledger. It must call `list_deliveries?limit=100`, rely on backend driver assignment scope, derive completed, needs-review, and active buckets locally, support local search and filters, show sanitized cached rows when offline, and route rows to detail, custody chain, or support. It must not mutate delivery state, must not display receiver phone, full address, package scan codes, proof references, or receiver name in default rows, and must not show earnings or settlement data until a payout backend exists.

## Done Definition
This screen is complete when:

- The route renders behind `screen-driver-history`.
- The screen calls `list_deliveries?limit=100`.
- Completed, needs-review, active, empty, no-result, offline, error, and unauthorized states are implemented.
- Search and filters work locally on loaded rows.
- Active runs are separated from completed history.
- Rows route to detail, custody chain, or support without mutating backend state.
- Cached rows are sanitized before storage.
- Receiver phone, full address, scan codes, proof references, and default row receiver names are absent.
- Accessibility and analytics tests pass.
- The implementation matches this markdown file and the frontend screen inventory.

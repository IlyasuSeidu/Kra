# AssignedRuns Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AssignedRuns` |
| Route | `/(ops)/driver/runs` |
| Primary test ID | `screen-assigned-runs` |
| Surface | Driver mobile app |
| Backend coverage | `list_deliveries` with authenticated driver assignment scope |
| Offline critical | Yes |
| Required role | `driver` |
| Parent screen | `DriverHome` |
| Primary data source | `GET /v1/deliveries` through route key `list_deliveries` |
| Related routes | `/(ops)/driver/home`, `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/accept`, `/(ops)/driver/runs/:deliveryId/manifest`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Contract-backed assigned-run list, cache-first reads, no new backend endpoint |

## Product Job
`AssignedRuns` is the complete driver worklist for inter-station assignments. It lets a driver find, filter, and open assigned transport runs without seeing unassigned work or unrelated station queues.

The screen answers:

- `Which runs are assigned to me?`
- `Which one needs action first?`
- `Which runs are blocked or stale?`
- `Can I still review my worklist offline?`
- `Where do I go next for each run?`

## Product Standard
This screen must behave like a serious operational queue, not a passive history list. It must make priority, deadline risk, sync freshness, and safe next action visible while keeping every row assignment-scoped.

The driver should be able to:

- Scan all assigned runs quickly.
- Filter by active, needs action, blocked, and completed.
- Search by allowed driver fields.
- Open a run detail or required workflow.
- Continue offline from saved assignments.
- Understand when saved assignments are too old for new handoff work.

The screen must never:

- Show unassigned deliveries.
- Show another driver's deliveries.
- Let the driver claim work.
- Show station-wide queues.
- Show full receiver phone numbers.
- Hide stale cache age.
- Treat list presence as custody transfer.

## Audience
Primary audience:

- Drivers with one or more assigned inter-station runs.

Secondary audience:

- Station leads who need drivers to work without manual task explanation.
- QA engineers validating assignment scope and offline list behavior.
- Claude Code implementing the React Native list, filters, cache, and tests.

## Context Of Use
Drivers will use this screen:

- After DriverHome when more than one run exists.
- From a notification route.
- During weak connectivity.
- While standing at station load area.
- While verifying which package group belongs to a route.
- After a sync conflict or failed refresh.
- After completing one action and needing the next run.

This is a high-repetition field screen. It must be fast, readable, and unforgiving about wrong-scope data.

## Design Brief
User and job:

- A verified driver needs a complete list of assigned transport runs and the safest next action for each.

Context:

- Operational, time-sensitive, repetitive, and often offline-assisted.

Entry point:

- DriverHome queue preview.
- Bottom navigation.
- Push notification.
- Return from run detail, accept, manifest, pickup scan, route, support, or outbox.

Success state:

- Driver can identify the correct assigned run and open the right next workflow.

Primary action:

- Open the selected assigned run or its required action.

Navigation model:

- Top-level driver stack/list screen.

Density level:

- Compact operational list with strong grouping and filters.

Visual thesis:

- `Dispatch-grade run ledger`: a fast, high-contrast assigned-work list with a command filter bar, urgency bands, and offline trust indicators.

Restraint rule:

- Do not turn the list into route navigation, manifest verification, or earnings. This screen finds and prioritizes runs; detailed work happens in child screens.

## External Research Used
Only directly relevant sources were used:

- [Onfleet App Task View](https://support.onfleet.com/hc/en-us/articles/360023670292-App-Task-View): supports assigned driver tasks appearing in list or map views, with dispatcher assignment as the source of work.
- [Onfleet Start a Task](https://support.onfleet.com/hc/en-us/articles/10348790592020-Start-a-Task): supports opening an assigned task from list view and using a bottom action to start work.
- [Onfleet Map and Sidebar](https://support.onfleet.com/hc/en-us/articles/360023669612-Map-Sidebar): supports logical task ordering, sidebar list organization, and sort modes by time, destination, creation time, and manual order.
- [Material Design lists](https://m1.material.io/components/lists.html): supports vertical list patterns, sorting/filtering, row hierarchy, and using cards when more than three text lines are needed.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first?hl=en): supports local data as the read source, synchronization into local storage, and offline reads without network access.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible touch targets and spacing.
- [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html): supports announcing dynamic status changes without moving focus.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/04-features/search-and-filters-spec.md`
- `docs/02-users/permissions-matrix.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/07-api/api-contracts.md`
- `services/api/src/delivery-queries.ts`
- `services/api/src/firestore/repositories.ts`
- `services/api/src/handoffs.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Current read operation:

- Operation key: `list_deliveries`.
- HTTP route: `GET /v1/deliveries`.
- Driver repository filter: `assignedDriverId == principal.userId`.
- Sort from repository: newest `latestEvent.occurredAt` first.
- Optional query filters:
  - `status`
  - `paymentStatus`
  - `limit`
- Default `limit`: `50`.
- Response schema: `deliveryListResponseSchema`.

Returned list fields:

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

Backend limitations:

- No package count.
- No package IDs.
- No assignment deadline.
- No assignment accepted timestamp.
- No route distance or route order.
- No open issue count.
- No station display names.
- No exact `currentCustodyRole`.
- No delivery condition summary.

Implementation decision:

- AssignedRuns must use current `list_deliveries` and local cached detail enrichments where already available.
- It must not invent package counts, deadlines, issue counts, or route order.
- It may show limited labels such as `Details needed` when exact fields require `get_delivery`.
- It must route to detail, manifest, pickup scan, route, or support for exact run work.

Future backend improvement:

- Add driver-list-safe fields to `list_deliveries` or a dedicated `GET /v1/driver/runs`:
  - `assignedAt`
  - `acceptedAt`
  - `acceptanceDueAt`
  - `packageCount`
  - `verifiedLoadCount`
  - `openIssueCount`
  - `driverRunSequence`
  - `routeOrder`
  - `originStationName`
  - `destinationStationName`
  - `nextAction`
  - `nextActionDueAt`

The current screen must still ship without these fields.

## Authorization Rules
Required principal:

- `role === "driver"`.

Allowed reads:

- `list_deliveries` for authenticated principal.
- Cached delivery detail summaries that belong to returned assigned deliveries.

Disallowed reads:

- Station queues.
- Admin queues.
- User directory.
- Other driver assignments.
- Unassigned work.
- Full payment or refund records.

Role failure:

- Clear driver assigned-runs cache.
- Route to driver sign-in.
- Do not leave old list rows visible.

Scope failure:

- If a run detail route returns assignment scope violation, remove the item from current visible list after refresh and show `Run no longer assigned to this account.`

## Search Scope
Allowed driver search targets from local policy:

- Delivery ID.
- Package ID only when cached from a previously opened detail or manifest.
- Assigned corridor.
- Tracking code.
- Origin station ID.
- Destination station ID.

Disallowed search:

- Sender name.
- Full receiver phone.
- Staff actor IDs.
- Payment references.
- Any unassigned package ID.

Search behavior:

- Local search runs over cached and currently loaded assigned runs.
- Search is forgiving for partial delivery ID, tracking code, station ID, and corridor text.
- Search must not call a broader backend endpoint.
- Search must not leak whether an unassigned delivery exists.

Search empty copy:

- `No assigned run matches this search.`

## Filter Scope
Top filters:

- `All`
- `Needs action`
- `Active`
- `Blocked`
- `Saved offline`
- `Completed`

Filter meaning:

`All`:

- Every returned assigned delivery within loaded limit.

`Needs action`:

- `assigned_to_driver`
- `issue_reported`
- stale cached assignment needing refresh
- queued conflict tied to a run

`Active`:

- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`

`Blocked`:

- `paymentStatus !== "paid"`
- `currentStatus === "issue_reported"`
- sync conflict
- stale cache preventing handoff action

`Saved offline`:

- Runs visible from durable cache while network is offline.

`Completed`:

- Terminal or post-destination states returned by backend.
- If exact terminal set is not imported, rely on shared status helpers when available.

Filter persistence:

- Persist selected filter during app session.
- Reset search text when driver signs out.
- Keep filter after returning from child screens.

## Sorting
Default sort:

- Urgency first, then latest update descending.

Urgency order:

1. Sync conflict.
2. Expired or near acceptance deadline when trusted.
3. Blocked active run.
4. `assigned_to_driver`.
5. `dispatched_from_origin`.
6. `in_transit`.
7. Other active statuses.
8. Completed or inactive.

Secondary sort:

- `latestOccurredAt` descending.

User sort options:

- `Needs action first`.
- `Latest update`.
- `Origin station`.
- `Destination station`.

Do not offer:

- Manual reorder.
- Nearest route.
- Earnings sort.
- Receiver name sort.

Reason:

- Current backend does not provide route order, distance, payout, or full receiver data for safe list sorting.

## Information Architecture
Top to bottom:

1. Header with title and sync status.
2. Search and filter controls.
3. Compact summary strip.
4. Assigned run list.
5. Empty or blocked state as needed.
6. Offline and outbox persistent footer when applicable.

The visible top of the screen must prioritize finding the correct run. Details come after selection.

## Layout Requirements
Compact phone:

- Sticky header with title and refresh.
- Search bar below header.
- Horizontal filter chips.
- One-column list.
- Persistent offline/outbox footer only when needed.

Large phone:

- Search and filter can sit in one combined control band.
- Rows can include one extra metadata line.

Foldable or tablet width:

- Two-pane option:
  - Left: assigned-run list.
  - Right: selected run preview with safe next action.
- If preview is not implemented, keep list centered with max width and generous margins.

System UI:

- Respect safe areas.
- Keep refresh and filter controls reachable.
- Do not hide bottom list rows behind tab bar.

## Visual Direction
Mood:

- Fast, operational, durable, and calm under pressure.

Hierarchy:

- Status and next action must be stronger than decorative metadata.
- Each row should make route, status, and action visible without opening detail.
- Use a left urgency rail instead of heavy warning blocks on every row.

Color:

- Green: ready or active progress.
- Amber: deadline pressure or stale saved data.
- Red: blocked or conflict.
- Blue-gray: offline and neutral sync.
- Dark ink: route and tracking identifiers.

Typography:

- Tracking code in strong monospace or tabular style.
- Route line in clear body type.
- Status label short and bold.
- Metadata concise.

Row material:

- Use list rows for normal runs.
- Use elevated command row only for highest-priority item.
- Use cards only if more than three lines are necessary.

## Header
Title:

- `Assigned runs`

Subtitle variants:

- `<count> assigned`
- `Offline - saved runs`
- `Refresh failed`
- `Action needed`

Actions:

- Refresh.
- Open filters if filters overflow.
- Open outbox when queued actions exist.

Header rules:

- Do not show profile editing.
- Do not show earnings.
- Do not show station-wide counters.

## Search Control
Input label:

- `Search assigned runs`

Hint:

- `Tracking, delivery, station, corridor`

Behavior:

- Debounce local filtering.
- Clear button appears when text exists.
- No network call for each keystroke.
- If search has no results, keep filters visible.

Accessibility:

- Search result count must be announced after debounce.
- Clear button accessible name: `Clear assigned runs search`.

## Filter Chips
Chip style:

- Strong selected state.
- Text plus count when counts are available locally.
- No icon-only chips.

Chip list:

- `All`
- `Needs action`
- `Active`
- `Blocked`
- `Saved offline`
- `Completed`

Count behavior:

- Counts derive only from loaded or cached assigned runs.
- If cache is stale, counts show with stale marker, not silent certainty.

## Summary Strip
Purpose:

- Show high-level queue health without taking over the screen.

Fields:

- `Needs action`
- `Active`
- `Blocked`
- `Saved offline`

CTA:

- `Review outbox` if queued actions exist.

Rules:

- Hide summary strip if it repeats exact filter chips and offers no new signal.
- Do not show a driver performance score.

## Run Row Anatomy
Each row must include:

- Urgency rail.
- Tracking code.
- Status label.
- Origin station ID -> destination station ID.
- Latest update relative time.
- Payment blocker indicator when relevant.
- Doorstep flag when `doorstepRequested === true`.
- Next action label.

Optional when cached:

- Package count.
- Accepted state.
- Manifest progress.
- Open issue count.
- Acceptance deadline.

Primary row action:

- Tap row opens `/(ops)/driver/runs/:deliveryId`.

Supplemental action:

- One contextual CTA only, such as:
  - `Review`
  - `Scan`
  - `Route`
  - `Issue`

No row should have more than one supplemental action. More actions belong in detail.

## Row Status Labels
Map backend status to driver-facing labels:

- `assigned_to_driver`: `Assigned`
- `dispatched_from_origin`: `Picked up`
- `in_transit`: `In transit`
- `arrived_at_destination`: `At destination`
- `received_at_destination`: `Received`
- `issue_reported`: `Issue`
- `cancelled`: `Cancelled`
- Unknown shared status: use shared title-cased label if available.

Payment label:

- `paid`: do not show unless useful.
- not `paid`: `Payment blocked`.

Doorstep:

- `Doorstep after station` when true.

## Next Action Mapping
| Condition | Row action label | Route |
| --- | --- | --- |
| Payment not paid | `Contact station` | `/(ops)/driver/support` |
| `issue_reported` | `Open issue` | `/(ops)/driver/support` |
| `assigned_to_driver`, no accepted cache | `Review` | `/(ops)/driver/runs/:deliveryId/accept` |
| `assigned_to_driver`, accepted cache exists | `Scan` | `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| `dispatched_from_origin` | `Route` | `/(ops)/driver/runs/:deliveryId/route` |
| `in_transit` | `Route` | `/(ops)/driver/runs/:deliveryId/route` |
| completed or inactive | `Details` | `/(ops)/driver/runs/:deliveryId` |

Rules:

- If cached data is stale and action is a handoff mutation, route to detail with stale warning instead of direct action.
- If offline and action can be queued by child screen, row action may route to child screen.
- If offline and required detail is not cached, row action should be `Reconnect`.

## Empty States
Online empty:

- Title: `No assigned runs`
- Body: `Station dispatchers assign runs to your driver account. Assigned transport work will appear here.`
- CTA: `Refresh`
- Secondary: `Contact station`

Offline without cache:

- Title: `No saved assigned runs`
- Body: `Reconnect once to load your assigned work on this device.`
- CTA: `Retry`

Search empty:

- Title: `No match in assigned runs`
- Body: `Search only checks runs assigned to this driver account.`
- CTA: `Clear search`

Filter empty:

- Title: `No runs in this filter`
- Body: `Try All or refresh if you expect new assigned work.`
- CTA: `Show all`

## Offline Behavior
AssignedRuns is offline critical.

Offline allowed:

- Render saved assigned runs.
- Search saved assigned runs.
- Filter saved assigned runs.
- Open cached run detail.
- Open cached manifest.
- Open outbox.
- Open support issue draft for a cached delivery.

Offline restricted:

- Fetch new assignments.
- Confirm pickup without cached scan binding.
- Accept a new assignment if assignment snapshot is not fresh.
- Start in-transit update if prior state is not trusted.

Offline indicators:

- Persistent top or bottom strip:
  - `Offline - showing saved runs`
  - `Last synced <relative time>`
- Stale row badge:
  - `Saved`
  - `Review before acting`

Cache age policy:

- Under `15 minutes`: normal saved state.
- `15` to `60 minutes`: stale warning for handoff actions.
- Over `60 minutes`: block new handoff actions until refresh.

## Refresh Behavior
Pull to refresh:

- Calls `list_deliveries?limit=50`.
- Keeps current list visible while refresh runs.
- Announces refresh success or failure.

Manual refresh button:

- Visible in header.
- Disabled only while request is already active.

Failure:

- Keep cached rows.
- Show `Could not refresh assigned runs`.
- CTA: `Retry`.

Success:

- Update local cache.
- Clear rows no longer returned.
- Recompute filters, sort, and summary.
- Announce updated count.

## Cache Rules
Cache keys:

- `assignedRunsList`
- `assignedRunsLastSyncedAt`
- `assignedRunsSelectedFilter`
- `assignedRunsSearchText`
- `assignedRunsCachedDetails`
- `driverOutboxSummary`

Storage:

- Durable encrypted storage where available.
- List cache must be scoped by authenticated driver `userId`.

Invalidation:

- Sign-out clears cache.
- User ID change clears cache.
- Role mismatch clears cache.
- Successful refresh replaces list cache.
- Schema-invalid response never replaces cache.

Retention:

- Keep last assigned list for offline read.
- Clear completed items based on future retention policy when exposed.
- Do not store full receiver phone or payment provider details.

## API Request Strategy
Recommended default:

```http
GET /v1/deliveries?limit=50
Authorization: Bearer <token>
```

Filtered backend reads are optional:

```http
GET /v1/deliveries?status=assigned_to_driver&limit=50
GET /v1/deliveries?status=dispatched_from_origin&limit=50
GET /v1/deliveries?status=in_transit&limit=50
GET /v1/deliveries?status=issue_reported&limit=50
```

V1 guidance:

- Prefer one unfiltered assigned-scope call.
- Use local filtering for the screen.
- Avoid parallel status reads on weak network unless product metrics prove need.

## Data Mapping
Map each delivery into:

```ts
type AssignedRunRow = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  originStationId: string;
  destinationStationId: string;
  serviceType: ServiceType;
  receiverName: string;
  latestOccurredAt: string;
  latestTouchpointRole: DeliveryTouchpointRole;
  latestTouchpointStationId?: string;
  doorstepRequested: boolean;
  cacheMeta: {
    source: "network" | "local";
    lastSyncedAt?: string;
    isStale: boolean;
  };
};
```

Derived row fields:

- `statusLabel`
- `searchText`
- `filterBuckets`
- `urgencyRank`
- `nextActionLabel`
- `nextRoute`
- `blockedReason`
- `accessibilityLabel`

## Interaction Flow
1. Driver opens assigned runs.
2. Screen validates driver role.
3. Screen renders saved list if present.
4. Screen starts `list_deliveries` refresh if online.
5. Driver searches, filters, or sorts locally.
6. Driver taps row or row action.
7. App validates selected delivery still belongs to visible assigned list.
8. App routes to detail or next action route.
9. Child screen updates cache on return.
10. AssignedRuns recomputes list state.

## Navigation Rules
Row tap:

- Always opens detail route:
  - `/(ops)/driver/runs/:deliveryId`

Row supplemental CTA:

- Opens mapped next-action route when safe.

Back:

- Returns to DriverHome or previous shell route.

Deep link:

- If route opens AssignedRuns with filter parameter, apply only known filter keys.
- Unknown filter parameter falls back to `All`.

Offline route:

- If child route needs uncached detail, show reconnect notice before navigation.

## Error States
`loading_first_time`:

- Skeleton list rows and filter controls.

`ready`:

- Current list, filters, search, and summary.

`refreshing`:

- Keep list visible.
- Header shows spinner.

`offline_cached`:

- Saved list visible with offline strip.

`offline_empty`:

- No saved assigned runs on device.

`refresh_failed`:

- Saved list remains visible if any.
- Error banner at top.

`unauthorized`:

- Clear cache and route to sign-in.

`scope_mismatch`:

- Remove affected row after refresh.
- Show scope message.

`schema_error`:

- Preserve cache.
- Show refresh failure.
- Log non-sensitive validation event.

`sync_conflict`:

- Conflict strip and affected rows marked.

## Copy
Title:

- `Assigned runs`

Search:

- `Search assigned runs`
- `Tracking, delivery, station, corridor`

Filter labels:

- `All`
- `Needs action`
- `Active`
- `Blocked`
- `Saved offline`
- `Completed`

Sync:

- `Checking assigned runs`
- `Synced just now`
- `Offline - showing saved runs`
- `Saved runs may be old`
- `Could not refresh assigned runs`

Row CTAs:

- `Review`
- `Scan`
- `Route`
- `Issue`
- `Details`
- `Reconnect`

Empty:

- `No assigned runs`
- `Assigned transport work will appear here after station dispatch assigns it to your driver account.`

## Component Inventory
`AssignedRunsScreen`:

- Owns route, role gate, query, cache orchestration, and list state.

`AssignedRunsHeader`:

- Title, count, refresh, outbox action.

`AssignedRunsSearch`:

- Local search input and clear control.

`AssignedRunsFilterBar`:

- Filter chips and counts.

`AssignedRunsSummaryStrip`:

- Queue health counts.

`AssignedRunList`:

- Virtualized list with empty and loading states.

`AssignedRunRow`:

- Row content, urgency rail, status, route, and CTA.

`AssignedRunsOfflineStrip`:

- Cache age and connectivity state.

`AssignedRunsErrorBanner`:

- Refresh and schema errors.

`AssignedRunsEmptyState`:

- Online, offline, search, and filter empty variants.

`AssignedRunsSortSheet`:

- Optional sort control if chip space is insufficient.

## State Model
```ts
type AssignedRunsState =
  | { kind: "loading_first_time" }
  | { kind: "ready"; rows: AssignedRunRow[]; filteredRows: AssignedRunRow[]; sync: AssignedRunsSyncState }
  | { kind: "offline_cached"; rows: AssignedRunRow[]; filteredRows: AssignedRunRow[]; sync: AssignedRunsSyncState }
  | { kind: "offline_empty" }
  | { kind: "refresh_failed"; rows?: AssignedRunRow[]; reason: string; sync: AssignedRunsSyncState }
  | { kind: "unauthorized" };
```

```ts
type AssignedRunsSyncState = {
  network: "online" | "offline" | "unknown";
  refresh: "idle" | "refreshing" | "failed";
  lastSyncedAt?: string;
  cacheAgeMinutes?: number;
  queuedActionCount: number;
  conflictDeliveryIds: string[];
};
```

## Accessibility
Touch:

- Row minimum height: `72dp`.
- Row CTA minimum touch area: `48dp`.
- Icon-only controls require labels.
- Search clear control minimum touch area: `44dp`.

Screen reader:

- Row accessible label must include tracking code, route, status, latest update, and action.
- Filter change announces visible result count.
- Refresh completion announces success or failure.
- Offline strip announces cache age.

Focus:

- Opening sort sheet focuses sheet title.
- Closing sort sheet returns focus to sort trigger.
- Search result update should not steal focus.

Color:

- Urgency rail must be paired with text status.
- Blocked rows include icon and reason.
- Offline rows include `Saved` label.

Motion:

- Filter change may animate row opacity and position lightly.
- Do not animate every row on refresh.
- Respect reduced motion.

## Performance
List:

- Use virtualized list for more than `20` rows.
- Row rendering must avoid heavy nested effects.
- Search and filters operate locally.

Network:

- Avoid repeated refresh on every focus if cache is fresh.
- Refresh on focus only when stale, after mutation return, or explicit pull.

Targets:

- Cached first paint under `700ms`.
- Search filter response under `150ms` for `50` rows.
- Pull refresh visible feedback under `100ms`.

## Analytics
Events:

- `assigned_runs_viewed`
- `assigned_runs_cache_rendered`
- `assigned_runs_refresh_started`
- `assigned_runs_refresh_succeeded`
- `assigned_runs_refresh_failed`
- `assigned_runs_search_used`
- `assigned_runs_filter_changed`
- `assigned_runs_sort_changed`
- `assigned_runs_row_opened`
- `assigned_runs_row_action_tapped`
- `assigned_runs_offline_rendered`
- `assigned_runs_outbox_opened`
- `assigned_runs_scope_denied`
- `assigned_runs_empty_shown`

Allowed properties:

- `filter`
- `sort`
- `visibleCount`
- `totalLoadedCount`
- `currentStatus`
- `paymentStatus`
- `nextAction`
- `networkState`
- `cacheAgeBucket`
- `queuedActionCountBucket`

Forbidden properties:

- Receiver phone.
- Sender ID.
- Package scan code.
- Payment provider reference.
- Raw token.
- GPS coordinates.
- Free-text search query.

## QA Acceptance Criteria
Routing:

- Screen route is `/(ops)/driver/runs`.
- Top-level test ID is `screen-assigned-runs`.
- Driver role can access the screen.
- Non-driver roles cannot access the screen.

Data:

- Screen calls `list_deliveries`.
- Screen does not call admin APIs.
- Screen does not call station queue APIs.
- Screen shows only deliveries returned by assignment-scoped API.
- Screen does not show unassigned work.
- Screen does not show other driver work.

Search and filters:

- Search filters locally.
- Search allowed fields only.
- Filter chips update visible rows.
- Counts match loaded or cached assigned rows.
- Search empty state appears.
- Filter empty state appears.

Offline:

- Saved rows render offline.
- Cache age is visible.
- First-time offline state is clear.
- Stale cache blocks unsafe direct handoff action.
- Outbox conflict marks affected rows.

Rows:

- Row tap opens detail.
- Row CTA routes to correct next action.
- Payment blocker routes to support.
- Issue row routes to support.
- Active route statuses route to route screen.

Accessibility:

- Row labels are meaningful.
- Filter result count is announced.
- Refresh status is announced.
- Touch targets meet or exceed mobile target standards.
- Large text does not truncate critical status and CTA.

## Test Matrix
Role tests:

- Driver sees assigned list.
- Sender denied.
- Station operator denied.
- Final-mile courier denied.
- Admin denied from driver route unless explicit test override exists.

List tests:

- Empty online state.
- One active assigned run.
- Multiple active assigned runs.
- Blocked payment row.
- Issue row.
- Completed row.
- Doorstep flag row.
- Unknown status row uses safe shared label.

Search tests:

- Tracking code partial match.
- Delivery ID partial match.
- Station corridor match.
- Disallowed receiver phone is not searched.
- Free-text search query is not logged.

Filter tests:

- Needs action.
- Active.
- Blocked.
- Saved offline.
- Completed.
- Filter persistence during session.

Offline tests:

- Cache renders when offline.
- No cache shows offline empty.
- Pull refresh disabled or fails gracefully offline.
- Row detail opens if cached.
- Row action requiring uncached detail asks for reconnect.

Refresh tests:

- Successful refresh replaces cache.
- Failed refresh preserves cache.
- Invalid schema preserves cache.
- Removed assignment disappears after refresh.

## Implementation Notes For Claude Code
Create under:

- `apps/mobile/features/driver/assigned-runs`

Suggested files:

- `AssignedRunsScreen.tsx`
- `AssignedRunsHeader.tsx`
- `AssignedRunsSearch.tsx`
- `AssignedRunsFilterBar.tsx`
- `AssignedRunsSummaryStrip.tsx`
- `AssignedRunList.tsx`
- `AssignedRunRow.tsx`
- `AssignedRunsOfflineStrip.tsx`
- `AssignedRunsErrorBanner.tsx`
- `AssignedRunsEmptyState.tsx`
- `AssignedRunsSortSheet.tsx`
- `useAssignedRuns.ts`
- `assignedRunsMapping.ts`
- `assignedRunsFilters.ts`
- `assignedRunsCache.ts`
- `assignedRuns.analytics.ts`
- `AssignedRunsScreen.test.tsx`

Implementation requirements:

- Use typed API client for `list_deliveries`.
- Validate response with shared schema.
- Read cache before network refresh.
- Scope cache by driver `userId`.
- Keep search and filters local.
- Keep row mapping pure and unit tested.
- Use route constants for child navigation.
- Do not implement new backend endpoints.
- Do not add map rendering to this screen.
- Do not add self-assignment.

## Out Of Scope
- Full run detail.
- Accept or reject form.
- Manifest scan state editing.
- Pickup scan.
- Route navigation.
- Destination handoff.
- Earnings.
- Support thread detail.
- Driver self-assignment.
- Admin override.
- New backend aggregation endpoint.

## Done Definition
AssignedRuns is complete when:

- It exists at `/(ops)/driver/runs`.
- It exposes `screen-assigned-runs`.
- It reads assigned deliveries through `list_deliveries`.
- It renders saved assigned runs offline.
- It provides local search, filters, and sort.
- It routes row tap to assigned-run detail.
- It routes row CTA to the safest next driver workflow.
- It surfaces cache age and outbox conflicts.
- It denies non-driver access.
- It never shows unassigned or other-driver work.
- It passes role, data, search, filter, offline, accessibility, and refresh tests.

## Claude Code Handoff Summary
Build `AssignedRuns` as the full driver assigned-work list behind DriverHome. It must call `list_deliveries`, render cache first, support local search and filters over allowed assignment-scoped fields, show urgency and blockers per row, route rows to the right driver workflows, and clearly expose offline freshness and outbox conflicts. Do not add backend endpoints, self-assignment, station queues, map-heavy UI, or sensitive receiver/payment data.

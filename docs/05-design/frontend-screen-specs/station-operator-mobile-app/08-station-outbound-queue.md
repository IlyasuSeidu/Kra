# Station Outbound Queue Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationOutboundQueue` |
| App | `apps/mobile` |
| Route | `/(ops)/station/outbound` |
| Primary test ID | `screen-station-outbound-queue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `list_deliveries`, `get_delivery`, `get_delivery_timeline`, `assign_driver`, `dispatch_delivery`, `confirm_pickup` read result, local queue cache, offline action outbox |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/outbound/:deliveryId/assign-driver`, `/(ops)/station/outbound/:deliveryId/dispatch`, `/(ops)/station/outbound/:deliveryId/driver-pickup`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/blocked`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `ready`, `refreshing`, `offline_cached`, `empty`, `filtered_empty`, `partial_error`, `sync_conflict`, `payment_blocked`, `issue_blocked`, `scope_blocked`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen is the station operator's outbound workbench. It shows packages physically held at the origin station that are ready to move toward driver assignment, dispatch readiness, and driver pickup review.

The screen answers one operational question: `Which origin-station packages need action before they can leave safely?`

The station operator should be able to:
- See outbound packages that are ready for station action.
- Separate packages needing driver assignment from packages needing dispatch readiness review.
- Avoid assigning or dispatching packages with unpaid, issue-blocked, or wrong-station state.
- Open the exact next workflow for each package.
- Work from cached data when offline without making false state claims.
- See stale data and sync conflicts before acting.
- Open custody chain when movement state is unclear.
- Route blocked packages to the blocked queue or support.

This screen is not:
- A driver run detail screen.
- A driver pickup scan screen.
- A station intake queue.
- A destination inbound queue.
- A payment recovery screen.
- A support issue work queue.
- A bulk mutation surface.
- A place to move custody without scan proof.

## Audience
Primary audience:
- Station operators at the origin station managing outbound packages.
- Station leads checking which packages are waiting for assignment, dispatch readiness, or driver pickup review.

Secondary audience:
- Claude Code implementing the outbound list and navigation logic.
- QA validating queue membership and offline behavior.
- Operations leads validating station throughput.
- Security reviewers validating station scope.
- Accessibility reviewers validating list, filters, and status updates.

## User State
The operator is usually standing near packages, printers, scanners, drivers, and station counters. The screen must be glanceable under pressure and must not require deep reading to identify the next action.

The user may be:
- Checking all outbound packages at shift start.
- Looking for a package that has just finished intake and label print.
- Assigning a driver.
- Reviewing dispatch readiness before driver arrival.
- Confirming whether a package has a driver already.
- Working from cached data during weak connectivity.
- Resolving a package that appears in the wrong queue.
- Opening support for a custody or payment blocker.

The screen must:
- Show station-scoped records only.
- Prefer confirmed-payment outbound work.
- Keep blocked records visible only as a routed blocker summary, not mixed into the main action queue.
- Preserve custody truth: station holds custody until driver pickup is confirmed.
- Never imply a package left the station before `confirm_pickup` succeeds.
- Never call `assign_driver`, `dispatch_delivery`, or `confirm_pickup` directly from a list row.
- Always route to the dedicated workflow screen for mutation.

## Backend Contract
Current list contract:
- `GET /v1/deliveries`
- Query fields: `status`, `paymentStatus`, `limit`
- Response fields: `deliveryId`, `trackingCode`, `currentStatus`, `paymentStatus`, `originStationId`, `destinationStationId`, `serviceType`, `receiverName`, `latestOccurredAt`, `latestTouchpointRole`, `latestTouchpointStationId`, `doorstepRequested`

Current list limitations:
- The list response does not include `assignedDriverId`.
- The list response does not include `latestEvent.type`.
- The list response does not include dispatch readiness checkpoint metadata.
- The list response does not include active issue summary.
- The list response does not include package label scan status.

Frontend rule:
- The queue may group by `currentStatus`, payment status, station scope, and cached local evidence.
- The queue must not claim `Ready for pickup` unless detail or timeline evidence confirms `delivery_dispatched_from_origin` checkpoint while current status remains `assigned_to_driver`.
- If evidence is not loaded, the row action is `Review dispatch`, not `Driver pickup`.

Recommended backend enrichment before high-volume station launch:
- Add `assignedDriverId` to delivery list rows for staff roles.
- Add `latestEventType` to delivery list rows.
- Add `dispatchPreparedAt` when `dispatch_delivery` has recorded readiness.
- Add `handoffConfirmationStatus` for awaiting driver pickup confirmation.
- Add `activeIssueSeverity` and `activeIssueCategory` for blocked routing.
- Add `packageLabelScanCodeSuffix` for safe operator verification.

These enrichments improve queue precision, but the screen must still work conservatively with the current list contract.

## Query Strategy
Main queue uses multiple status queries because `deliveryListQuerySchema` accepts one `status` per request.

Required online queries:
- `GET /v1/deliveries?status=received_at_origin&paymentStatus=confirmed&limit=100`
- `GET /v1/deliveries?status=awaiting_driver_assignment&paymentStatus=confirmed&limit=100`
- `GET /v1/deliveries?status=assigned_to_driver&paymentStatus=confirmed&limit=100`

Optional blocker-count queries:
- `GET /v1/deliveries?status=received_at_origin&paymentStatus=pending&limit=25`
- `GET /v1/deliveries?status=received_at_origin&paymentStatus=failed&limit=25`

Do not query:
- Destination station statuses.
- Sender-only history.
- Admin notification outbox.
- Receiver personal data.

Merge rules:
- Combine the three actionable query results.
- Deduplicate by `deliveryId`.
- Keep the freshest `latestOccurredAt` when duplicates appear.
- Filter to `originStationId === currentUser.stationId`.
- Exclude terminal statuses.
- Exclude records with payment not `confirmed` from main action list.
- Route issue-like statuses to `StationBlockedQueue`.

Offline data:
- Use the latest successful station outbound cache.
- Keep per-query timestamp.
- Show stale age.
- Disable actions that would mutate until online or outbox supports the specific action.

## Queue Membership
Main outbound queue includes:
- `received_at_origin` with `paymentStatus=confirmed`
- `awaiting_driver_assignment` with `paymentStatus=confirmed`
- `assigned_to_driver` with `paymentStatus=confirmed`

`received_at_origin` meaning:
- Package is held at origin station after intake.
- Driver has not been assigned.
- Primary row action: `Assign driver`

`awaiting_driver_assignment` meaning:
- Package is explicitly queued for driver assignment.
- Driver has not been assigned.
- Primary row action: `Assign driver`

`assigned_to_driver` meaning:
- Driver is assigned.
- Station still needs dispatch readiness review or driver pickup review.
- Primary row action: `Review dispatch`

Rows excluded from main queue:
- `created`: still intake work.
- `payment_pending`: payment gate not cleared.
- `payment_failed`: payment recovery or blocked queue.
- `issue_reported`: blocked queue.
- `on_hold`: blocked queue.
- `dispatched_from_origin`: package has left origin custody after driver pickup confirmation.
- `in_transit`: driver queue and inbound expectation.
- `received_at_destination`: inbound queue.
- `awaiting_receiver_pickup`: destination pickup queue.
- `awaiting_final_mile_assignment`: final-mile queue.
- `assigned_for_final_mile`: final-mile workflow.
- `out_for_delivery`: courier workflow.
- `delivered`, `closed`, `cancelled`, `delivery_failed`: not outbound work.

## Custody Boundary
Station custody truth:
- Origin station custody begins at `confirm_intake`.
- Station assignment to driver does not move custody.
- Station dispatch readiness does not move custody.
- Driver pickup confirmation moves custody to driver.

Screen implications:
- `assigned_to_driver` rows remain station-responsible until driver pickup is confirmed.
- A package may be dispatch-prepared but still station-held.
- The UI must avoid wording like `left station` until `confirm_pickup` has succeeded and status is `dispatched_from_origin`.
- The queue can show `Ready for driver pickup` only with detail or timeline evidence that dispatch readiness checkpoint exists.

Custody labels:
- `Station custody`: station holds responsibility.
- `Driver assigned`: driver selected, custody still station.
- `Dispatch review`: assigned driver exists, package needs dispatch readiness scan.
- `Awaiting pickup scan`: dispatch readiness recorded, driver pickup not yet confirmed.
- `Left origin`: no longer in this queue.

## Payment Gate
Payment rule:
- Payment must be confirmed before a delivery enters transport states such as `assigned_to_driver`, `dispatched_from_origin`, `in_transit`, or later movement.

Queue behavior:
- Main outbound list includes only `paymentStatus=confirmed`.
- Pending or failed payment rows do not appear as actionable outbound rows.
- If optional blocker query finds payment blockers, show a compact blocker banner.
- Blocker banner routes to `/(ops)/station/blocked`.

Payment blocker banner:
- Title: `Payment blocks outbound`
- Body: `{count} package(s) cannot be assigned until payment is confirmed.`
- Action: `Open blocked queue`

Do not show:
- Payment amount.
- Provider reference.
- Provider error.
- Sender payment method.

## Information Architecture
The screen has five functional zones:
1. Header and freshness.
2. Outbound status summary.
3. Filter and search.
4. Action queue list.
5. Blockers and recovery.

### Header And Freshness
Header title:
- `Outbound queue`

Subtitle:
- `Packages at {stationName} waiting for driver movement.`

Freshness metadata:
- `Updated {relativeTime}`
- `Cached {relativeTime}` when offline.
- `Partial data` when one status query fails.
- `Station scope: {stationId}`

Header actions:
- Refresh.
- Open scanner.
- Open offline outbox.

### Outbound Status Summary
Cards:
- `Need driver`
- `Driver assigned`
- `Dispatch review`
- `Blocked`

Rules:
- `Need driver` counts `received_at_origin` plus `awaiting_driver_assignment`.
- `Driver assigned` counts `assigned_to_driver` without dispatch readiness evidence.
- `Dispatch review` is shown only when detail or local evidence exists.
- `Blocked` counts optional payment or issue blockers and routes to blocked queue.

Summary card copy:
- `Need driver`: `Ready for assignment`
- `Driver assigned`: `Review dispatch`
- `Dispatch review`: `Awaiting pickup scan`
- `Blocked`: `Needs attention`

### Filter And Search
Filters:
- `All`
- `Need driver`
- `Driver assigned`
- `Dispatch review`
- `Doorstep`
- `Standard`
- `Express`

Search:
- Search by tracking code.
- Search by receiver name.
- Search by destination station.

Search rules:
- Local filter over loaded queue data.
- Do not search receiver phone.
- Keep search input short and clear.

Sort options:
- `Oldest first`
- `Newest first`
- `Destination`
- `Service priority`

Default sort:
- Highest operational urgency first, then oldest `latestOccurredAt`.

Urgency order:
1. Dispatch review evidence exists.
2. `assigned_to_driver`.
3. `awaiting_driver_assignment`.
4. `received_at_origin`.

### Action Queue List
Each row shows:
- Tracking code.
- Destination station.
- Receiver name.
- Service type.
- Doorstep indicator.
- Current status label.
- Latest activity time.
- Next action.
- Data freshness marker when cached.

Each row hides:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Staff user ID.
- Full package label code.

Row actions:
- `Assign driver`
- `Review dispatch`
- `Review pickup`
- `Open detail`
- `Open custody`
- `Report issue`

Row tap behavior:
- Tap row body opens delivery detail.
- Tap primary action opens the dedicated workflow route.
- Long press is not required for core work.

## Row State Mapping
| Status | Additional Evidence | Row Label | Primary Action | Route |
| --- | --- | --- | --- | --- |
| `received_at_origin` | payment confirmed | `Needs driver` | `Assign driver` | `/(ops)/station/outbound/:deliveryId/assign-driver` |
| `awaiting_driver_assignment` | payment confirmed | `Needs driver` | `Assign driver` | `/(ops)/station/outbound/:deliveryId/assign-driver` |
| `assigned_to_driver` | no dispatch evidence loaded | `Driver assigned` | `Review dispatch` | `/(ops)/station/outbound/:deliveryId/dispatch` |
| `assigned_to_driver` | dispatch checkpoint confirmed | `Awaiting pickup scan` | `Review pickup` | `/(ops)/station/outbound/:deliveryId/driver-pickup` |
| `issue_reported` | any | `Blocked` | `Open blocked queue` | `/(ops)/station/blocked` |
| `on_hold` | any | `On hold` | `Open blocked queue` | `/(ops)/station/blocked` |

Conservative fallback:
- If detail evidence is missing, use `Review dispatch`.
- Do not show `Review pickup` from list data alone.

## Primary Action Logic
Primary action by screen state:
- `loading`: wait.
- `ready`: row-level action.
- `refreshing`: keep previous rows usable unless stale conflict appears.
- `offline_cached`: row detail is allowed, mutations are blocked or queued only by dedicated workflow support.
- `empty`: `Refresh`
- `filtered_empty`: `Clear filters`
- `partial_error`: `Retry failed data`
- `sync_conflict`: `Refresh`
- `payment_blocked`: `Open blocked queue`
- `issue_blocked`: `Open blocked queue`
- `scope_blocked`: `Back to role home`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Row primary action by state:
- Need driver: `Assign driver`
- Driver assigned: `Review dispatch`
- Awaiting pickup scan: `Review pickup`
- Blocked: `Open blocked queue`
- Stale: `Refresh before action`

Blocked behavior:
- Do not call mutation directly from this screen.
- Do not show driver pickup action without detail or timeline evidence.
- Do not assign driver when payment is not confirmed.
- Do not dispatch when driver is not assigned.
- Do not show rows outside station scope.
- Do not hide stale state.

## Offline Rules
This screen is offline-critical for reading queue context.

Offline allowed:
- Show cached outbound queue.
- Search cached rows.
- Filter cached rows.
- Open cached delivery detail when available.
- Open cached custody chain when available.
- Open offline outbox.

Offline blocked:
- Fresh assignment.
- Fresh dispatch readiness.
- Fresh driver pickup review.
- Support issue creation unless offline outbox explicitly supports it.
- Refreshing backend state.

Offline copy:
- Title: `Showing cached outbound queue`
- Body: `Reconnect before assigning, dispatching, or reviewing pickup.`
- Action: `Open offline outbox`

Stale threshold:
- Under `5 minutes`: normal cached marker.
- `5-15 minutes`: show `Data may have changed`.
- Over `15 minutes`: block row primary actions and require refresh.

Conflict handling:
- If a cached row returns a newer status after refresh, animate row into the correct queue group.
- If row leaves outbound scope, show a one-line status message: `Package moved out of outbound queue.`
- If action screen detects status mismatch, return to outbound queue with `sync_conflict`.

## Loading And Refresh
Initial loading:
- Use skeleton rows with realistic row heights.
- Do not show empty state until all required queries resolve.

Pull to refresh:
- Refresh all status queries.
- Keep existing rows visible during refresh.
- Show `Refreshing` status message.
- Announce completion count.

Partial error:
- If one status query fails, show rows from successful queries.
- Mark summary as partial.
- Show retry for failed status group.

Retry strategy:
- Retry failed query group only.
- If auth fails, move to session state.
- If station scope fails, move to scope state.

## Empty States
No outbound packages:
- Title: `No outbound packages`
- Body: `When intake and payment are complete, packages ready for driver movement appear here.`
- Primary action: `Refresh`
- Secondary action: `Back to overview`

No filtered results:
- Title: `No packages match this filter`
- Body: `Clear filters or search another tracking code.`
- Primary action: `Clear filters`

Offline no cache:
- Title: `No cached outbound queue`
- Body: `Connect once to load outbound packages for this station.`
- Primary action: `Back to overview`

All blocked:
- Title: `Outbound is blocked`
- Body: `Packages here need payment, issue, or custody review before movement.`
- Primary action: `Open blocked queue`

## Error Mapping
Auth required:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to view station outbound work.`
- Action: `Back to role home`

Station scope mismatch:
- State: `scope_blocked`
- Message: `This outbound queue is outside your station scope.`
- Action: `Back to role home`

List query failed:
- State: `api_error`
- Message: `Outbound queue could not load.`
- Action: `Retry`

Partial status failed:
- State: `partial_error`
- Message: `Some outbound groups did not load.`
- Action: `Retry failed data`

Payment blocker:
- State: `payment_blocked`
- Message: `Payment must be confirmed before driver assignment.`
- Action: `Open blocked queue`

Issue blocker:
- State: `issue_blocked`
- Message: `Issue review is required before movement.`
- Action: `Open blocked queue`

Stale data:
- State: `sync_conflict`
- Message: `Queue data changed. Refresh before acting.`
- Action: `Refresh`

## Copy System
Voice:
- Direct.
- Operational.
- Calm.
- Short.

Screen title:
- `Outbound queue`

Screen subtitle:
- `Move confirmed packages from station custody to driver handoff.`

Refresh status:
- `Queue updated`
- `Showing cached queue`
- `Some groups did not load`

Row status labels:
- `Needs driver`
- `Driver assigned`
- `Review dispatch`
- `Awaiting pickup scan`
- `Blocked`

Primary row CTAs:
- `Assign driver`
- `Review dispatch`
- `Review pickup`
- `Open blocked queue`

Critical warning:
- `Custody stays with station until driver pickup is confirmed.`

## Visual System Direction
This screen should feel like a disciplined station operations board compressed into a mobile workflow.

Visual thesis:
- A dense but calm dispatch board where status, urgency, and next action are obvious in under five seconds.

Layout:
- Sticky header with station scope and freshness.
- Compact summary cards.
- Horizontal filter chips.
- List rows optimized for scan speed.
- Bottom-safe primary actions inside workflow screens, not this queue.

Color:
- Need driver: blue.
- Assigned: amber.
- Awaiting pickup scan: green-blue.
- Blocked: rust/red.
- Cached: neutral gray.

Typography:
- Tracking code and station codes use tabular numerals.
- Destination station is visually strong.
- Receiver name is secondary.
- Row action is short and verb-led.

Motion:
- Pull refresh uses native behavior.
- Group changes use subtle slide/fade.
- No constant motion.
- Respect reduced motion.

Density:
- Rows must support one-handed scanning.
- Avoid badge clutter.
- Use one status pill and one action per row.
- Move secondary details into disclosure or detail route.

## Component Inventory
Components:
- `OutboundQueueHeader`
- `OutboundFreshnessBadge`
- `OutboundSummaryStrip`
- `OutboundFilterBar`
- `OutboundSearchField`
- `OutboundSortSheet`
- `OutboundQueueList`
- `OutboundQueueRow`
- `OutboundBlockedBanner`
- `OutboundPartialErrorBanner`
- `OutboundOfflineBanner`
- `OutboundEmptyState`
- `OutboundRowActionButton`

### `OutboundQueueHeader`
Props:
- `stationName`
- `stationId`
- `lastUpdatedAt`
- `isOffline`
- `isRefreshing`

Responsibilities:
- Orient user to station scope.
- Show freshness.
- Expose refresh and scanner entry.

### `OutboundSummaryStrip`
Props:
- `needDriverCount`
- `driverAssignedCount`
- `dispatchReviewCount`
- `blockedCount`
- `selectedGroup`

Responsibilities:
- Provide queue overview.
- Act as fast filter.
- Show partial data state when needed.

### `OutboundFilterBar`
Props:
- `selectedFilter`
- `availableFilters`
- `resultCount`

Responsibilities:
- Filter without hiding current state.
- Preserve selected filter after refresh.

### `OutboundQueueRow`
Props:
- `deliveryId`
- `trackingCode`
- `destinationStationId`
- `receiverName`
- `serviceType`
- `doorstepRequested`
- `currentStatus`
- `paymentStatus`
- `latestOccurredAt`
- `latestTouchpointRole`
- `latestTouchpointStationId`
- `rowState`
- `isStale`

Responsibilities:
- Show one package.
- Choose truthful row label.
- Route to one primary action.
- Avoid sensitive data.

### `OutboundBlockedBanner`
Props:
- `paymentBlockedCount`
- `issueBlockedCount`
- `oldestBlockedAt`

Responsibilities:
- Acknowledge work that cannot move.
- Route to blocked queue.
- Keep blockers out of main action list.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Station scope.
3. Freshness status.
4. Summary cards.
5. Filters.
6. Search.
7. Queue rows.
8. Blocker banner.
9. Offline or partial error banners.

Required labels:
- Summary cards announce counts and filter action.
- Row announces tracking code, destination, status, latest age, and primary action.
- Cached rows announce stale age.
- Partial error banner announces which group failed.
- Refresh completion announces updated count.

Touch targets:
- Summary cards meet mobile target size.
- Row primary action meets target size.
- Filter chips have enough spacing.
- Refresh and scanner icons have accessible labels.

Focus:
- Initial focus lands on screen title.
- After filter change, focus moves to result count.
- After refresh, focus stays stable unless rows disappear.
- After partial error retry, focus moves to banner result.

Reduced motion:
- Group movement may be instant.
- Pull refresh remains platform-native.
- No animated status loops.

## Security And Privacy
Allowed on screen:
- Tracking code.
- Delivery ID only in detail route or audit disclosure.
- Receiver name.
- Origin station.
- Destination station.
- Service type.
- Doorstep requested flag.
- Current status.
- Payment status only as high-level blocker.

Not allowed on screen:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Staff user ID.
- Full package label code.
- Internal event payload.

Allowed in analytics:
- Delivery ID.
- Station ID.
- Current status.
- Payment status.
- Row state.
- Filter.
- Sort.
- Source route.

Disallowed in analytics:
- Receiver name.
- Receiver phone.
- Receiver address.
- Full label code.
- Payment provider reference.
- Search query text.

## Analytics
Events:
- `station_outbound_queue_viewed`
- `station_outbound_queue_refreshed`
- `station_outbound_queue_partial_error`
- `station_outbound_queue_filter_changed`
- `station_outbound_queue_search_used`
- `station_outbound_queue_sort_changed`
- `station_outbound_row_opened`
- `station_outbound_assign_driver_opened`
- `station_outbound_dispatch_opened`
- `station_outbound_pickup_review_opened`
- `station_outbound_blocked_opened`
- `station_outbound_offline_cache_viewed`
- `station_outbound_sync_conflict_seen`

Allowed payload fields:
- `stationId`
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `rowState`
- `filter`
- `sort`
- `isOffline`
- `isCached`
- `staleAgeBucket`
- `sourceRoute`

Disallowed payload fields:
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `searchQuery`
- `paymentProviderReference`
- `labelScanCode`

## QA Acceptance Criteria
Queue loading:
- Initial load calls the three required confirmed-payment status queries.
- Rows are deduplicated by `deliveryId`.
- Rows outside station scope are excluded.
- Terminal and destination statuses are excluded.
- Payment pending and failed rows are excluded from main action list.

Row routing:
- `received_at_origin` routes to driver assignment.
- `awaiting_driver_assignment` routes to driver assignment.
- `assigned_to_driver` without detail evidence routes to dispatch readiness.
- `assigned_to_driver` with dispatch checkpoint evidence routes to pickup review.
- Blocked rows route to blocked queue.

Backend truth:
- List data alone never produces `Review pickup`.
- `assignedDriverId` is not assumed from list response.
- Dispatch readiness is not assumed from status alone.
- Driver pickup success removes row from outbound queue after refresh.

Offline:
- Cached queue renders offline.
- Stale age appears.
- Mutating row actions are disabled or routed to workflows that enforce offline policy.
- Offline without cache shows offline empty state.
- Reconnect refresh updates group counts and row positions.

Partial error:
- One failed status query does not blank successful rows.
- Partial banner names the affected group.
- Retry only retries failed group.
- Full auth failure moves to session state.

Accessibility:
- Summary counts are announced.
- Row state and action are announced.
- Filter changes announce result count.
- Refresh status is announced.
- Large text does not hide row action.
- Color is not the only status cue.

Privacy:
- Receiver phone never appears.
- Full address never appears.
- Payment provider reference never appears.
- Search query text is not sent to analytics.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/outbound-queue`

Recommended state holder:
- `useStationOutboundQueueScreen`

Recommended selectors:
- `selectOutboundQuerySet`
- `selectOutboundRows`
- `selectOutboundSummary`
- `selectOutboundRowState`
- `selectOutboundPrimaryAction`
- `selectOutboundBlockedCounts`
- `selectOutboundOfflineState`
- `selectOutboundStaleness`

Recommended API hooks:
- `useListDeliveriesQuery`
- `useGetDeliveryQuery` for visible row prefetch when needed.
- `useGetDeliveryTimelineQuery` for dispatch checkpoint evidence when needed.

Cache keys:
- `station_outbound_queue:{stationId}:received_at_origin`
- `station_outbound_queue:{stationId}:awaiting_driver_assignment`
- `station_outbound_queue:{stationId}:assigned_to_driver`
- `station_outbound_queue:{stationId}:blocked_counts`

Prefetch rule:
- Prefetch detail only for visible `assigned_to_driver` rows.
- Do not prefetch every row in a large queue.
- Cancel prefetch for rows that scroll out of view.

Performance:
- Use virtualized list for more than `30` rows.
- Keep row height predictable.
- Avoid heavy timeline fetches in list render.
- Batch refreshes by status group.

## Implementation Guardrails
Must use:
- `list_deliveries` for station-accessible queue.
- Separate status queries.
- Payment confirmed filter for main queue.
- Local cache for offline read.
- Dedicated workflow routes for mutations.

Must show:
- Station scope.
- Freshness.
- Summary counts.
- Filters.
- Row status.
- Row next action.
- Offline state.
- Partial error state.
- Blocked route.

Must not:
- Mutate delivery from the list row.
- Claim pickup readiness from list status alone.
- Show rows outside origin station scope.
- Mix blocked payment rows into main action list.
- Show phone, address, payment provider, full label code, or staff IDs.
- Hide stale cache state.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [SAP Help Portal outbound delivery process](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/b2dee5e83e2446149294f9860a7c08f0/8aa7bf532e64b44ce10000000a174cb4.html): supports treating outbound movement as a controlled process with shipping readiness before goods leave custody.
- [Material Design lists](https://m3.material.io/components/lists/overview): supports clear mobile list rows with primary and secondary text plus actions.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local cache, stale data handling, and network-backed refresh behavior.
- [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager): supports durable background work for sync-sensitive actions when a workflow is offline-capable.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing refresh, partial error, cache, and queue update states.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large row actions, filters, and refresh controls.

Design translation:
- Outbound queues must distinguish readiness from custody transfer.
- Mobile queue rows need one clear status and one clear next action.
- Offline data must be useful but visibly stale.
- Partial backend failure must not erase safe local context.
- Accessibility status messages are necessary because queue data changes after refresh.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/outbound`.
- The top-level test ID is `screen-station-outbound-queue`.
- The three confirmed-payment status queries are used.
- Main queue includes only station-scoped outbound statuses.
- `assigned_to_driver` does not automatically mean driver pickup is ready.
- Row actions route to dedicated workflow screens.
- Cached offline state is visible and stale actions are blocked.
- Sensitive receiver, payment, label, and staff data are excluded.
- Partial errors keep successful query groups visible.
- E2E tests cover ready, empty, filtered empty, offline cached, partial error, payment blocker, sync conflict, and scope block.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Station scope is enforced.
- Main queue uses confirmed-payment outbound statuses.
- Rows route to assignment, dispatch, or pickup review correctly.
- Dispatch checkpoint evidence is required before pickup review appears.
- Offline cache works with visible freshness.
- Partial errors are recoverable.
- Blocked payment and issue work routes to blocked queue.
- Accessibility announcements cover refresh, filters, partial errors, and row changes.
- Analytics exclude receiver, payment provider, search text, and label scan data.

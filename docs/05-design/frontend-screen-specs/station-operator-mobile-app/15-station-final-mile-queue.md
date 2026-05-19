# Station Final-Mile Queue Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationFinalMileQueue` |
| App | `apps/mobile` |
| Route | `/(ops)/station/final-mile` |
| Primary test ID | `screen-station-final-mile-queue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `list_deliveries`, `get_delivery`, `get_delivery_timeline`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, doorstep policy, local final-mile queue cache |
| Related routes | `/(ops)/station/final-mile/:deliveryId/assign`, `/(ops)/station/inbound`, `/(ops)/station/blocked`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/offline-outbox` |
| Required states | `loading`, `ready_needs_courier`, `ready_assigned`, `refreshing`, `empty_needs_courier`, `empty_assigned`, `offline_cached`, `offline_empty`, `stale_data`, `partial_failure`, `serviceability_attention`, `assignment_due_today`, `assignment_due_next_business_day`, `acceptance_overdue`, `status_blocked`, `scope_blocked`, `payment_blocked`, `issue_blocked`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen gives the destination station a disciplined queue of doorstep packages that are ready for courier assignment or already assigned and waiting for courier action.

The screen answers one operational question: `Which doorstep packages need station action before they can leave for the receiver?`

The station operator should be able to:
- See packages routed to final-mile assignment after destination receipt.
- Confirm every visible package belongs to the signed-in destination station.
- Separate packages needing a courier from packages already assigned.
- Prioritize same-day assignments before the local `15:00` cutoff.
- Spot assigned jobs where courier acceptance is late.
- Open assignment for one delivery without changing custody from the queue.
- Open delivery detail, custody chain, support, or blocked flow when the package cannot proceed.
- Work from cached queue data during poor connectivity while knowing exactly when data is stale.
- Avoid exposing receiver phone or full address on the queue.

This screen is not:
- A courier assignment form.
- A package scanner.
- A custody transfer screen.
- A courier accept screen.
- A route planner.
- A live ETA surface.
- A station pickup queue.
- A support investigation workspace.
- A bulk assignment surface for v1.
- A place to call `assign_final_mile` directly.

## Audience
Primary audience:
- Destination station operators managing doorstep handoff workload.
- Station leads checking final-mile pressure before the afternoon cutoff.

Secondary audience:
- Claude Code implementing the station final-mile queue.
- QA validating status filters, offline read behavior, privacy, and routing.
- Backend engineers validating list/detail contract assumptions.
- Operations leads validating doorstep assignment discipline.
- Accessibility reviewers validating queue controls, status messages, and touch targets.

## User State
The operator is working inside a station environment with packages physically present after destination receipt. The station may have weak connectivity, multiple operators, a courier waiting nearby, and a receiver expecting doorstep delivery. The operator needs a fast answer, but the screen must not hide custody or serviceability risk.

The user may be:
- Opening the final-mile queue after a successful destination receipt.
- Checking if same-day assignment is still possible before `15:00` local time.
- Seeing packages return after the first failed doorstep attempt.
- Monitoring jobs assigned to couriers but not accepted within `15 minutes`.
- Working offline from the latest queue cache.
- Recovering from a stale queue after another operator already assigned a courier.
- Handling a package that should move to blocked or support review.

The screen must:
- Make `Needs courier` the default operational view.
- Keep `Assigned` as a monitoring view, not as the main action surface.
- Show only destination-station packages for the signed-in station.
- Treat `awaiting_final_mile_assignment` as assignable.
- Treat `assigned_for_final_mile` as assigned and waiting for courier-side scan acceptance or movement.
- Never show `out_for_delivery` as assignable.
- Never change custody.
- Never display receiver phone or full address in the queue row.
- Never imply route optimization or courier capacity exists unless backend supplies those fields.

## Backend Contract
Existing backend facts:
- Delivery list uses `GET /v1/deliveries`.
- The list query accepts one optional `status`, one optional `paymentStatus`, and `limit` up to `100`.
- List response rows include `deliveryId`, `trackingCode`, `currentStatus`, `paymentStatus`, `originStationId`, `destinationStationId`, `serviceType`, `receiverName`, `latestOccurredAt`, `latestTouchpointRole`, optional `latestTouchpointStationId`, and `doorstepRequested`.
- Delivery detail uses `GET /v1/deliveries/:id`.
- Delivery detail includes receiver object, package object, `doorstepDistanceKm`, custody fields, assignment fields, latest event, and latest touchpoint.
- Timeline uses `GET /v1/deliveries/:id/timeline`.
- `assign_final_mile` exists at `POST /v1/deliveries/:id/assign-final-mile`.
- `assign_final_mile` request body is `assignFinalMileRequestSchema` with `courierUserId`.
- `assign_final_mile` requires capability `assign_final_mile`.
- Station scope for `assign_final_mile` must match `destinationStationId`.
- `assign_final_mile` changes status to `assigned_for_final_mile`.
- `assign_final_mile` records event type `final_mile_courier_assigned`.
- `assign_final_mile` sets `assignedFinalMileCourierId`.
- `assign_final_mile` does not move custody to the courier.
- Courier custody moves only after assigned courier calls `accept_final_mile_assignment` with package scan evidence.
- Courier acceptance records handoff type `destination_station_to_final_mile_courier`.

Queue endpoint plan:
- Needs courier tab calls `GET /v1/deliveries?status=awaiting_final_mile_assignment&limit=100`.
- Assigned tab calls `GET /v1/deliveries?status=assigned_for_final_mile&limit=100`.
- Both tabs must filter client-side to `destinationStationId === signedInStationId`.
- Both tabs must filter client-side to `doorstepRequested === true`.
- The UI must not ask for every status and infer final-mile eligibility from unrelated states.

Detail preflight:
- Open assignment should fetch `GET /v1/deliveries/:id` before routing.
- If detail status is still `awaiting_final_mile_assignment`, route to `StationFinalMileAssignment`.
- If detail status changed to `assigned_for_final_mile`, route to assigned detail or stay on assigned tab.
- If detail status changed to `out_for_delivery`, route to delivery detail or custody chain.
- If detail status changed to `awaiting_receiver_pickup`, remove it from final-mile queue after refresh.
- If detail status is `issue_reported` or `on_hold`, route to blocked or support.

Current backend gaps:
- No public station-safe courier availability endpoint exists.
- No station-safe final-mile capacity endpoint exists.
- No server-computed assignment deadline field exists.
- No server-computed courier acceptance deadline field exists.
- No redacted delivery detail endpoint exists for station queue use.
- No batch assignment endpoint exists for v1.
- No live route optimization endpoint exists in the current backend.

Implementation boundary:
- The queue can route to assignment.
- The queue can refresh list data.
- The queue can open detail, custody, blocked, or support routes.
- The queue must not call `assign_final_mile`.
- The queue must not call `accept_final_mile_assignment`.
- The queue must not call `mark_out_for_delivery`.
- The queue must not infer courier capacity from local UI state.

Production-ready recommendation:
- Add a redacted final-mile readiness endpoint that returns assignable deliveries, safe receiver readiness flags, deadline fields, and safe courier availability.
- Add server-side assignment deadline fields so all clients rank packages the same way.
- Add a final-mile capacity endpoint before introducing multi-courier balancing or route optimization UI.
- Add an assigned-courier display contract that is safe for station operators and does not expose unrelated staff data.

## Doorstep Policy Contract
Doorstep delivery v1 rules from `docs/03-business/doorstep-delivery-rules.md`:
- Doorstep is available only after confirmed destination-station receipt.
- Serviceability is limited to receiver addresses within `10km` of `ST-ACC-01`, `ST-KMS-01`, or `ST-TML-01`.
- Assignment requires payment status `paid` in policy; current backend uses `confirmed` as the payment state in delivery records.
- Assignment requires delivery status `received_at_destination` or `awaiting_final_mile_assignment`; current backend usually routes directly to `awaiting_final_mile_assignment`.
- Assignment requires `doorstepRequested=true`.
- Receiver name and phone must be present.
- Address text or recognizable landmark instructions must be present.
- Doorstep surcharge must already be collected before courier assignment.
- If package reaches destination before `15:00` local time and capacity exists, target same-day assignment.
- If package reaches destination at or after `15:00`, target next-business-day assignment.
- Courier must accept or reject assignment within `15 minutes`.
- If courier does not accept in time, job returns to `awaiting_final_mile_assignment`.
- Once accepted, courier should move to `out_for_delivery` within `2 hours` unless station supervisor reassigns.
- No cash collection is allowed during final-mile completion in v1.

Policy-to-UI decisions:
- Show same-day urgency only as station guidance because backend does not yet return capacity.
- Show `Payment not confirmed` blocker when `paymentStatus` is not `confirmed`.
- Show `Doorstep not requested` blocker only if a bad list row leaks into the final-mile queue.
- Show `Serviceability needs review` when detail lacks `doorstepDistanceKm` or when distance exceeds `10km`.
- Do not show receiver phone or full address while checking whether required data exists.
- Do not route to courier assignment when the detail endpoint shows issue or hold state.

## Source Reference Inputs
Use these references as design and implementation constraints, not as promises beyond current backend:
- Android offline-first architecture says a critical offline app should support reads without network access, use a local data source as the UI source of truth, and reconcile with the network on connectivity restore.
- W3C WCAG status messages require important visual status changes to be programmatically available without forcing focus movement.
- W3C WCAG target size guidance requires interactive targets to be at least `24 by 24 CSS pixels` or have enough spacing to avoid accidental activation.
- Google Route Optimization API can optimize route plans and assignments based on objectives and constraints, but Kra must not expose that behavior until backend support exists.
- Google Maps Platform logistics guidance frames address validation, route planning, dispatch, navigation, asset tracking, and final-leg delivery as separate capabilities.

Reference links:
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Google Route Optimization API overview](https://developers.google.com/maps/documentation/route-optimization/overview)
- [Google Maps Platform transportation and logistics](https://mapsplatform.google.com/solutions/transportation-and-logistics/)

## Screen Thesis
The screen should feel like a calm final-mile dispatch ledger: dense enough for station work, strict about custody, and visually weighted toward urgent packages without becoming a noisy control room.

The operator should understand in three seconds:
- How many doorstep packages need a courier.
- Which packages can still target same-day assignment.
- Which assigned jobs are late for courier acceptance.
- Which package needs the next action.
- Whether the view is live, cached, stale, or partially failed.

Visual thesis:
- Use a clean operational workspace with high-contrast typography, minimal chrome, strong status strips, and a restrained amber urgency lane.
- The page should feel serious, field-ready, and trusted in bright station lighting.
- Avoid decorative map panels, badge clutter, or logistics theater.

Restraint rule:
- The screen must show fewer fields than the backend knows. If a field does not help assign or monitor final-mile work, hide it.

## Information Architecture
Top-level layout:
1. App header.
2. Queue health strip.
3. Tab control.
4. Prioritization controls.
5. Queue list.
6. Sticky action guidance or offline banner.

App header:
- Title: `Final-mile queue`
- Subtitle: station name or station code.
- Right action: refresh.
- Secondary action: support or blocked queue overflow menu.

Queue health strip:
- `Needs courier`: count from filtered `awaiting_final_mile_assignment`.
- `Assigned`: count from filtered `assigned_for_final_mile`.
- `Late acceptance`: assigned jobs older than `15 minutes` when event time can be inferred.
- `Last sync`: relative time plus absolute time in detail sheet.

Tab control:
- Default tab: `Needs courier`.
- Second tab: `Assigned`.
- Optional compact counter badges.
- Do not add more tabs for v1.

Prioritization controls:
- Search by tracking code or receiver name.
- Filter chips:
  - `All`
  - `Due today`
  - `Serviceability review`
  - `Payment blocker`
  - `Late acceptance` only on assigned tab
- Sort menu:
  - `Oldest receipt first`
  - `Cutoff risk first`
  - `Tracking code`

Queue list:
- Use section headers, not a flat wall of identical cards.
- Group `Needs courier` by cutoff risk.
- Group `Assigned` by acceptance status.
- Keep the first visible action on each row specific and safe.

Sticky action guidance:
- Online: `Select one package to assign a courier. Custody changes only after the courier scans the package.`
- Offline: `Offline queue is read-only. Assignment will be available after sync.`
- Stale: `Refresh before assigning. Another operator may have changed this package.`

## Data Loading Model
Initial load:
1. Read local final-mile queue cache immediately.
2. Render cached rows with `offline_cached` or `stale_data` treatment if network state is unavailable.
3. Start network refresh for default `Needs courier` query.
4. Store successful response in local queue cache.
5. Refresh assigned tab count in background if network and battery state allow.

Default online query:
- `GET /v1/deliveries?status=awaiting_final_mile_assignment&limit=100`

Assigned monitoring query:
- `GET /v1/deliveries?status=assigned_for_final_mile&limit=100`

Cache requirements:
- Cache rows by `deliveryId`.
- Store `queryStatus`, `stationId`, `fetchedAt`, and `source`.
- Store only list response fields plus client-derived queue flags.
- Do not durable-cache receiver phone.
- Do not durable-cache receiver full address.
- Do not durable-cache courier phone.
- Do not write full detail payload into queue cache.

Refresh behavior:
- Pull-to-refresh refreshes the active tab first.
- Header refresh refreshes both tabs sequentially.
- A failed assigned refresh must not erase a successful needs-courier cache.
- A failed needs-courier refresh must not erase a successful assigned cache.
- Stale cache remains visible with explicit stale treatment.

Staleness rules:
- `fresh`: fetched under `2 minutes` ago.
- `aging`: fetched `2` to `10 minutes` ago.
- `stale`: fetched over `10 minutes` ago.
- `unsafe_for_assignment`: fetched over `10 minutes` ago or app is offline.

Assignment routing gate:
- If the active row is fresh, fetch detail before routing.
- If the active row is stale, refresh row or fetch detail before routing.
- If detail fetch fails offline, keep the user on the queue and explain assignment requires current delivery data.

## Row Eligibility Rules
Rows are eligible for `Needs courier` when all list-level checks pass:
- `currentStatus === "awaiting_final_mile_assignment"`
- `doorstepRequested === true`
- `destinationStationId === signedInStationId`
- `paymentStatus === "confirmed"`

Rows need detail preflight before assignment when:
- `paymentStatus` is not `confirmed`.
- `doorstepRequested` is false.
- `destinationStationId` does not match signed-in station.
- `latestOccurredAt` is stale.
- `latestTouchpointRole` is not `station_operator`.
- The row was restored from cache.
- User taps assign.

Detail preflight should confirm:
- `currentStatus === "awaiting_final_mile_assignment"`
- `doorstepRequested === true`
- `paymentStatus === "confirmed"`
- `destinationStationId === signedInStationId`
- `currentCustodyRole === "station_operator"`
- `currentCustodyActorId` exists when backend populated it.
- Receiver name exists.
- Receiver phone exists, without rendering it.
- Receiver address or landmark exists, without rendering full text on the queue.
- `doorstepDistanceKm` is present and `<= 10` when backend populated it.
- No final proof exists.
- No active issue blocks movement.

Rows are eligible for `Assigned` when:
- `currentStatus === "assigned_for_final_mile"`
- `doorstepRequested === true`
- `destinationStationId === signedInStationId`
- `assignedFinalMileCourierId` exists in detail when row is opened.

Rows are not eligible for this screen when:
- `currentStatus === "out_for_delivery"`
- `currentStatus === "awaiting_receiver_pickup"`
- `currentStatus === "delivered"`
- `currentStatus === "closed"`
- `currentStatus === "cancelled"`
- `currentStatus === "delivery_failed"`
- `currentStatus === "issue_reported"` unless shown only as a routing correction to blocked queue.

## Queue Row Content
Every row must show:
- Tracking code.
- Receiver first name and last initial when possible, or receiver name if current existing list contract only supplies full name.
- Current status label.
- Latest event age.
- Destination station code only when useful for scope review.
- Doorstep eligibility chip.
- Payment blocker chip when payment is not confirmed.
- One primary action.

Needs courier row primary action:
- Label: `Assign courier`
- Enabled only when online and row passes list-level checks.
- Tap fetches detail, then routes to `/(ops)/station/final-mile/:deliveryId/assign`.
- If detail blocks assignment, show blocker sheet and offer correct route.

Assigned row primary action:
- Label: `Review`
- Tap fetches detail and opens delivery detail or assigned-monitoring detail.
- Do not offer reassign until backend support is explicit.

Optional row metadata:
- `Received 12m ago`
- `Same-day target`
- `Next business day`
- `Courier acceptance late`
- `Serviceability review`
- `Cached`

Do not show on row:
- Receiver phone.
- Full receiver address.
- Package declared value.
- Full package description when not needed.
- Courier personal phone.
- Internal actor IDs unless in diagnostic drawer.
- Raw API error text.
- Backend stack traces.

## Cutoff And Priority Logic
Timezone:
- Use `Africa/Accra` local time for station queue deadline display unless a station-specific timezone is later added.

Same-day target:
- If latest destination receipt or routed event happened before `15:00`, show `Same-day target` only when capacity is not known to be unavailable.
- If event happened at or after `15:00`, show `Next business day`.
- If event time cannot be identified from list row, use `latestOccurredAt` and mark as `Based on latest event`.

Urgency levels:
- `normal`: before cutoff and under `60 minutes` since destination receipt.
- `watch`: before cutoff and older than `60 minutes`.
- `cutoff_risk`: within `60 minutes` of `15:00` and not assigned.
- `late`: after `15:00` and still unassigned.
- `blocked`: payment, serviceability, issue, scope, or stale data blocks assignment.

Acceptance monitoring:
- For `assigned_for_final_mile`, estimate acceptance due from `latestOccurredAt` when it represents assignment event.
- If assignment age is over `15 minutes`, show `Acceptance overdue`.
- Because list row does not expose event type, label the timestamp basis in the detail sheet.
- Fetch timeline before presenting a definitive overdue investigation message.

Priority ordering:
1. Blocked rows requiring station correction.
2. Cutoff-risk rows.
3. Oldest assignable rows.
4. Rows with serviceability review.
5. Newest rows.

Copy rule:
- Use `target` language instead of guaranteed delivery language when capacity or route data is absent.

## Interaction Model
Default flow:
1. Operator opens `Final-mile queue`.
2. App renders cached rows if available.
3. App refreshes `Needs courier`.
4. Operator scans list and taps `Assign courier`.
5. App fetches detail.
6. If detail passes preflight, app routes to `StationFinalMileAssignment`.
7. If detail fails preflight, app shows blocker sheet with the correct next route.

Assigned monitoring flow:
1. Operator switches to `Assigned`.
2. App refreshes assigned rows.
3. Operator sees late acceptance or active assigned rows.
4. Operator taps `Review`.
5. App fetches detail and timeline.
6. App shows delivery detail, custody chain, or support route depending on status.

Offline flow:
1. Operator opens queue offline.
2. App renders cached rows with `Offline` and `Last sync`.
3. Assign buttons become disabled.
4. Review remains available only for locally cached detail summary if already present.
5. App prompts refresh when connectivity returns.

Conflict flow:
1. Operator taps `Assign courier`.
2. Detail fetch returns a later status.
3. App removes row from active list.
4. App announces `This package moved to assigned work` or the correct new state.
5. App routes only if the user chooses to inspect.

Blocked flow:
1. Row has payment or serviceability blocker.
2. Primary action becomes `Review blocker`.
3. Detail fetch confirms blocker.
4. Sheet explains one cause and next route.
5. User can open blocked queue, support, or delivery detail.

## Visual Design Requirements
The design must feel like a high-trust station operating surface, not a consumer card feed.

Layout:
- Use a strong page title and dense but legible queue metrics.
- Keep action density high enough for station throughput.
- Use row height that supports gloved or rushed touch while keeping eight to ten rows scannable on common phones.
- Use sticky tab and health strip while list scrolls.
- Keep bottom safe-area clear for sticky guidance.

Color:
- Use neutral operational surfaces for most rows.
- Use amber for cutoff risk and stale data.
- Use red only for blocker, late acceptance, or safety-critical states.
- Use green only for healthy confirmed states.
- Do not use color as the only status signal.

Typography:
- Tracking code is the row anchor.
- Receiver name is secondary.
- Status and time are highly scannable.
- Supporting policy copy stays under two short lines.
- Avoid ornamental display typography inside the operations app.

Touch targets:
- Primary row actions must be at least `44` device-independent pixels tall in native implementation.
- Any compact icon target must meet or exceed WCAG minimum target guidance and keep spacing from adjacent actions.
- Swipe actions are optional only if equivalent visible buttons exist.

Motion:
- Use a short list refresh shimmer or skeleton, not full-page bouncing loaders after cached data exists.
- Animate row removal only after conflict or successful refresh with a clear status message.
- Support reduced motion.
- Do not animate urgency continuously.

## Components
Required components:
- `OpsScreenScaffold`
- `StationQueueHeader`
- `QueueHealthStrip`
- `FinalMileTabControl`
- `QueueSearchField`
- `QueueFilterChips`
- `QueueSortMenu`
- `FinalMileQueueSection`
- `FinalMileQueueRow`
- `QueueStatusChip`
- `CutoffRiskIndicator`
- `OfflineReadOnlyBanner`
- `StaleDataBanner`
- `PartialFailureBanner`
- `FinalMileBlockerSheet`
- `QueueEmptyState`
- `QueueRefreshControl`
- `RouteCorrectionToast`
- `AccessibleStatusAnnouncer`

Component contracts:
- `FinalMileQueueRow` receives list-safe row fields only.
- `FinalMileQueueRow` never receives receiver phone or full address.
- `FinalMileBlockerSheet` may receive detail-derived booleans, but not raw receiver phone or full address.
- `QueueHealthStrip` receives counts and sync age.
- `CutoffRiskIndicator` receives derived urgency level and timestamp basis.
- `AccessibleStatusAnnouncer` owns live region messaging for refresh, offline, stale, conflict, and action completion.

## State Machine
Initial:
- `loading` when no cache exists and network request is in flight.
- `offline_empty` when no cache exists and device is offline.
- `offline_cached` when cache exists and device is offline.

Ready:
- `ready_needs_courier` when active tab has assignable or blocked final-mile rows.
- `ready_assigned` when assigned tab has monitoring rows.
- `refreshing` when active tab is updating but cached rows remain usable.

Empty:
- `empty_needs_courier` when no filtered `awaiting_final_mile_assignment` rows exist.
- `empty_assigned` when no filtered `assigned_for_final_mile` rows exist.

Risk:
- `stale_data` when active tab cache is older than `10 minutes`.
- `partial_failure` when one tab refresh succeeds and the other fails.
- `serviceability_attention` when detail preflight detects missing or outside-zone doorstep data.
- `assignment_due_today` when policy suggests same-day target.
- `assignment_due_next_business_day` when policy suggests next-business-day target.
- `acceptance_overdue` when assigned age exceeds `15 minutes` and timeline confirms assignment event.

Blocked:
- `status_blocked` when delivery status is no longer assignable or monitorable.
- `scope_blocked` when station does not match destination station.
- `payment_blocked` when payment status is not confirmed.
- `issue_blocked` when issue or hold state prevents assignment.
- `not_authorized` when capability or station scope is denied.
- `session_expired` when auth token fails refresh.
- `api_error` for recoverable server failure.
- `rate_limited` when request throttling applies.

## Empty States
Needs courier empty:
- Title: `No packages need a courier`
- Body: `Doorstep packages will appear here after destination receipt routes them to final-mile assignment.`
- Primary action: `Refresh`
- Secondary action: `View inbound`

Assigned empty:
- Title: `No active courier assignments`
- Body: `Assigned doorstep work will appear here until the courier scans and accepts custody.`
- Primary action: `Refresh`
- Secondary action: `Needs courier`

Offline empty:
- Title: `Queue unavailable offline`
- Body: `This device has no saved final-mile queue yet. Connect once at the station to load packages.`
- Primary action: `Retry when online`

Filtered empty:
- Title: `No packages match this view`
- Body: `Clear filters to see all final-mile packages for this station.`
- Primary action: `Clear filters`

## Error And Recovery Copy
Use short, direct, operational copy.

Network failure:
- Title: `Could not refresh queue`
- Body: `Saved rows remain visible. Refresh again before assigning a courier.`
- Action: `Retry`

Stale data:
- Title: `Refresh before assigning`
- Body: `This queue is over 10 minutes old. Another operator may have moved a package.`
- Action: `Refresh now`

Detail conflict:
- Title: `Package moved`
- Body: `The latest delivery state no longer allows courier assignment from this queue.`
- Action: `View delivery`

Payment blocker:
- Title: `Payment not confirmed`
- Body: `Do not assign a courier until payment is confirmed by the backend.`
- Action: `View delivery`

Serviceability attention:
- Title: `Doorstep eligibility needs review`
- Body: `Distance, address readiness, or receiver contact data is incomplete for assignment.`
- Action: `Open support`

Scope blocked:
- Title: `Wrong station`
- Body: `This package belongs to another destination station. Do not assign final-mile work here.`
- Action: `View custody`

Permission denied:
- Title: `You cannot manage this queue`
- Body: `Your account does not have station final-mile assignment access.`
- Action: `Contact station lead`

Rate limited:
- Title: `Too many refresh attempts`
- Body: `Wait a moment, then refresh again. Saved rows remain available.`
- Action: `Retry later`

## Privacy And Safety
The queue is a shared station surface and may be viewed in public station areas.

Privacy rules:
- Show receiver name only as needed to identify the package.
- Prefer first name plus last initial when product adds a formatter.
- Do not show receiver phone.
- Do not show full receiver address.
- Do not show declared value on the queue.
- Do not show courier personal phone.
- Do not log receiver phone, full address, or courier phone.
- Do not send receiver phone or full address to analytics.
- Do not durable-cache full delivery detail under the queue store.

Operational safety rules:
- Show custody owner summary before assignment route.
- State that custody changes only after courier scan acceptance.
- Disable assignment routing from stale data.
- Use detail fetch to prevent stale list action.
- Use explicit conflict copy when another operator already acted.
- Keep package rows tied to tracking code, not receiver name alone.

## Offline And Sync
Offline-critical scope for this screen is read access.

Allowed offline behavior:
- Show cached final-mile rows.
- Show last sync time.
- Search and filter cached rows.
- Open locally available delivery summary if previously cached by detail screen.
- Let user prepare mentally for work, but not execute assignment.

Forbidden offline behavior:
- Do not call `assign_final_mile`.
- Do not queue `assign_final_mile` from this screen.
- Do not mark local rows as assigned.
- Do not move custody.
- Do not hide stale warnings.

Why assignment is not queued here:
- Assignment has multi-operator conflict risk.
- Courier availability is not represented in current backend.
- Stale assignment can send a courier to the wrong package.
- The dedicated assignment screen owns any future idempotent assignment outbox policy.

Sync indicators:
- `Live` when active tab refreshed under `2 minutes`.
- `Saved` when rendered from local cache.
- `Stale` when over `10 minutes`.
- `Partial` when only one tab refreshed.
- `Offline` when device cannot reach network.

## Accessibility Requirements
Screen reader:
- Announce tab changes with row counts.
- Announce refresh completion and failure through status messages.
- Announce when a row moves due to conflict.
- Include status and blocker text in row accessibility labels.
- Keep tracking code readable character by character when needed.

Keyboard and switch control:
- Every interactive element must be reachable.
- Tab control must have deterministic order.
- Row primary action must be separate from row detail navigation.
- Pull-to-refresh must have a visible button alternative.

Visual accessibility:
- Minimum text contrast must meet WCAG AA.
- Status chips need text labels, not color alone.
- Focus state must remain visible around sticky controls.
- Dynamic type must not truncate tracking code or primary action.
- Critical banners must remain readable at large text settings.

Touch:
- Primary actions use large targets suitable for station use.
- Filter chips must not be too close together.
- Destructive or blocker route actions must not sit directly beside assignment action.

Reduced motion:
- Disable animated row shifts and shimmer.
- Preserve status text changes.

## Analytics And Audit
Analytics must be product-safe and privacy-safe.

Allowed events:
- `station_final_mile_queue_opened`
- `station_final_mile_queue_refreshed`
- `station_final_mile_queue_tab_changed`
- `station_final_mile_queue_filter_changed`
- `station_final_mile_queue_assign_tapped`
- `station_final_mile_queue_detail_conflict`
- `station_final_mile_queue_offline_rendered`
- `station_final_mile_queue_stale_blocked_assignment`
- `station_final_mile_queue_blocker_opened`

Allowed properties:
- `stationId`
- `activeTab`
- `rowCount`
- `syncAgeSeconds`
- `networkState`
- `filter`
- `sort`
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `blockerType`
- `urgencyLevel`

Forbidden properties:
- Receiver phone.
- Receiver full address.
- Courier phone.
- Full package description.
- Declared value.
- Raw scan codes.
- Raw API error text.

Audit note:
- Queue viewing is analytics, not custody audit.
- Custody audit begins when backend handoff or lifecycle events are created.
- This screen must not invent audit events locally.

## Navigation Rules
Entry points:
- `StationOverview` final-mile count.
- `StationDestinationReceipt` success when `receive_destination` returns `awaiting_final_mile_assignment`.
- `StationBlockedQueue` after resolved issue routes package back to final-mile assignment.
- `OpsRoleHome` station final-mile action.

Exit routes:
- `/(ops)/station/final-mile/:deliveryId/assign` for current assignable rows.
- `/(ops)/deliveries/:deliveryId` for detail.
- `/(ops)/deliveries/:deliveryId/custody` for custody chain.
- `/(ops)/station/blocked` for issue or hold.
- `/(ops)/station/inbound` for packages not yet received.
- `/(ops)/station/support` for station help.
- `/(ops)/offline-outbox` for sync health.

Back behavior:
- Returning from assignment should refresh needs-courier row detail.
- Returning from delivery detail should preserve active tab and filters.
- Returning after conflict should remove or relocate the row.
- App restart should restore active tab only if cache is available.

## QA Acceptance Criteria
Functional:
- Default route renders `screen-station-final-mile-queue`.
- Needs courier tab queries `awaiting_final_mile_assignment`.
- Assigned tab queries `assigned_for_final_mile`.
- Rows are filtered to signed-in destination station.
- Rows are filtered to `doorstepRequested=true`.
- Assign action fetches detail before routing.
- Queue does not call `assign_final_mile`.
- Queue does not move custody.
- Stale queue disables assignment routing.
- Offline queue is read-only.
- Conflict state removes or relocates moved rows.
- Payment blockers prevent assignment routing.
- Serviceability attention prevents assignment routing until reviewed.

Privacy:
- Queue row does not show receiver phone.
- Queue row does not show full receiver address.
- Queue row does not show declared value.
- Queue analytics exclude sensitive receiver and courier data.
- Queue cache stores only safe row data.

Accessibility:
- Status messages announce refresh, offline, stale, and conflict states.
- All controls are reachable without gestures.
- All touch targets meet native size policy and WCAG spacing guidance.
- Screen works with large text.
- Color is not the only urgency indicator.

Visual:
- First viewport shows title, counts, active tab, and at least the top queue row on common phone screens.
- Urgency state is visible but not visually chaotic.
- Empty states are specific and actionable.
- Offline banner is visible above the list.

## Implementation Notes For Claude Code
Build this screen as a data-safe operations queue:
- Create a screen container at route `/(ops)/station/final-mile`.
- Use `screen-station-final-mile-queue` as the root test ID.
- Use existing auth station context to derive `signedInStationId`.
- Build separate data hooks for needs-courier and assigned queries.
- Read from local queue cache first.
- Refresh active tab on mount.
- Keep detail fetch separate from list fetch.
- Route to assignment only after detail preflight succeeds.
- Keep assign mutation out of this file.
- Use existing shared error, offline, and status components where available.
- Create narrow row DTOs so sensitive detail fields cannot leak into row rendering.

Recommended component test IDs:
- `station-final-mile-header`
- `station-final-mile-health-strip`
- `station-final-mile-tab-needs-courier`
- `station-final-mile-tab-assigned`
- `station-final-mile-search`
- `station-final-mile-filter-chip`
- `station-final-mile-sort-menu`
- `station-final-mile-row`
- `station-final-mile-row-assign`
- `station-final-mile-row-review`
- `station-final-mile-offline-banner`
- `station-final-mile-stale-banner`
- `station-final-mile-blocker-sheet`
- `station-final-mile-empty`

## Open Backend Follow-Ups
The screen is buildable with current backend, but these additions would raise the implementation quality:
- Add `GET /v1/station/final-mile-queue` with server-side station filtering and readiness flags.
- Add assignment deadline and acceptance deadline fields.
- Add station-safe courier roster and capacity endpoint.
- Add redacted delivery detail response for queue preflight.
- Add server-side blocker reasons for final-mile assignment.
- Add route optimization only after courier capacity, vehicle constraints, and address validation are modeled.
- Add active issue summary to list rows so blocked packages can be routed faster.

## Completion Standard
This spec is complete when Claude Code can build the screen without adding product policy:
- Screen contract and route are explicit.
- Backend endpoints and forbidden mutations are explicit.
- Queue filters are explicit.
- Custody boundary is explicit.
- Offline behavior is explicit.
- Privacy boundaries are explicit.
- Visual hierarchy is explicit.
- Error states are explicit.
- QA checks are explicit.

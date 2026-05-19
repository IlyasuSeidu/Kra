# DriverRoute Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverRoute` |
| Route | `/(ops)/driver/runs/:deliveryId/route` |
| Primary test ID | `screen-driver-route` |
| Surface | Driver mobile app |
| Backend coverage | `get_delivery`, `get_delivery_timeline`, cached station context, external navigation links; route metadata endpoint when exposed |
| Offline critical | Yes, cached |
| Required role | `driver` |
| Required custody | Driver custody confirmed through `confirm_pickup` |
| Parent screens | `DriverCustodyAccepted`, `AssignedRunDetail`, `AssignedRuns` |
| Next screens | `DriverMarkInTransit`, `DriverDestinationArrival`, `DriverDestinationHandoff`, `DriverSupport` |
| Primary action | Open navigation or continue active route workflow |
| Current implementation mode | Route command surface using current delivery/station context, not advanced route optimization |

## Product Job
`DriverRoute` helps the driver move the package safely from origin station to destination station after custody is confirmed. It gives the driver a clear route command surface, operational status, cached station context, navigation handoff, and the next backend action.

The screen answers:

- `Do I have custody before route movement?`
- `Where am I going next?`
- `Which navigation option can I use?`
- `What is the current delivery status?`
- `What should I update before or during travel?`
- `What do I do if the route, station, or network fails?`
- `What backend route metadata is still missing?`

## Product Standard
This screen is not a decorative map. It is a safety-first driver command screen that keeps package accountability clear and limits distraction while driving.

The driver should be able to:

- Confirm origin and destination station context.
- See current custody and operational status.
- Open external turn-by-turn navigation when destination coordinates or address are available.
- Continue without a map when only station IDs are available.
- Mark the package in transit from the dedicated next screen.
- Prepare for destination arrival.
- Work from cached route context when offline.
- Report delay, vehicle, station, safety, or route issues.

The screen must never:

- Start route movement before custody is confirmed.
- Claim optimized routing exists before backend route metadata exists.
- Auto-mark `in_transit` just because navigation was opened.
- Record arrival only from GPS.
- Require live GPS to keep the delivery visible.
- Reveal raw package scan code.
- Show private receiver details that are not needed for inter-station transport.
- Encourage complex visual-manual interaction while driving.

## Audience
Primary audience:

- Inter-station driver carrying a package from origin station to destination station.

Secondary audience:

- Station staff tracking when a driver should reach destination.
- Support agents handling delay, route, or vehicle issues.
- QA validating route state, offline cache, and safety constraints.
- Claude Code implementing the route command screen and tests.

## Context Of Use
The driver may use this screen:

- Immediately after custody acceptance.
- While parked before departure.
- During a safe stop.
- In weak connectivity on the road.
- After reopening the app from an external navigation app.
- Near destination station.
- After a delay or route issue.

The screen must be useful with one hand while parked and glanceable while in motion. It must not become an in-app navigation product unless the backend and safety design explicitly support that.

## Design Brief
User and job:

- A driver with confirmed custody needs safe route guidance and the next operational action.

Context:

- Time-sensitive transport with package liability, intermittent network, and driver safety constraints.

Entry point:

- `DriverCustodyAccepted`, assigned run detail, active run row, or app resume.

Success state:

- Driver opens safe navigation, understands current route, and moves toward the next required operational update.

Primary action:

- `Open navigation`

Secondary action:

- `Mark in transit`

Navigation model:

- Active route command screen between custody acceptance and destination arrival.

Density level:

- Medium while parked, very low while movement is detected.

Visual thesis:

- `Route command`: large destination card, custody badge, external navigation launcher, next operational checkpoint, and safety-first issue reporting.

Restraint rule:

- Do not build route optimization, live dispatch control, or a full map-heavy navigation experience in this screen.

## External Research Used
Only directly relevant sources were used:

- [Google Maps Intents for Android](https://developer.android.com/guide/components/google-maps-intents): supports launching Google Maps for directions or navigation through intents, and checking that an app can handle the intent before starting it.
- [Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html): supports opening maps and driving directions from regular links on iOS and macOS.
- [Android runtime location permissions](https://developer.android.com/develop/sensors-and-location/location/permissions/runtime): supports foreground location permission handling, approximate versus precise location, and feature access decisions.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached reads, local visible state, queued writes, and conflict handling in low-connectivity contexts.
- [NHTSA visual-manual driver distraction guidelines](https://www.nhtsa.gov/document/visual-manual-nhtsa-driver-distraction-guidelines-vehicle-electronic-devices): supports minimizing driver visual-manual interaction and limiting distracting secondary tasks while driving.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large actionable targets for route and support controls.
- [WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): supports accessible status updates for route loading, navigation handoff, offline state, and errors.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/04-assigned-run-detail.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/08-driver-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `services/api/src/handoffs.ts`
- `services/api/src/delivery-queries.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Current backend support:

- `get_delivery` provides delivery status, assigned driver scope, origin station ID, destination station ID, package fields, payment status, and custody fields when exposed through detail response.
- `get_delivery_timeline` can show recent pickup and transit events.
- `mark_in_transit` exists as the next mutation but belongs to `DriverMarkInTransit`.
- `receive_destination` is performed by station role at destination, not from this route screen.

Current route metadata support:

- No dedicated route metadata endpoint is available yet.
- No backend ETA, distance, turn list, station coordinates, route polyline, toll estimate, road risk, or geofence arrival contract is exposed in current docs.
- UI must not invent optimized route output.

Allowed current route data:

- Origin station ID.
- Destination station ID.
- Station display name if station cache provides it.
- Station address or coordinates if station cache provides it.
- Delivery status.
- Custody status.
- Cached detail freshness.
- Timeline events.

Backend gap to track:

- `route_metadata`: station coordinates, safe display name, address, plus optional distance and estimated travel time.
- `driver_location_ping`: if operational tracking later requires periodic location.
- `arrival_proximity`: if arrival preparation later uses geofence signals.
- `route_delay_reason`: if delay reporting becomes a dedicated mutation instead of issue creation.

## Data Dependencies
Required:

- `deliveryId` route parameter.
- Authenticated driver actor.
- Delivery detail.
- Current delivery status.
- Assigned driver ID.
- Current custody role and actor when available.
- Origin station ID.
- Destination station ID.
- Offline cache freshness.

Recommended:

- Station names.
- Station addresses.
- Station coordinates.
- Station contact.
- Last lifecycle event.
- Outbox state.
- Issue state.

Optional:

- External navigation provider availability.
- Device location permission state.
- Current coarse location if permission exists.
- Drive-safe mode setting.
- Battery/network status.

Never required:

- Raw package scan code.
- Receiver OTP.
- Receiver private phone for inter-station route.
- Sender private ID.
- Payment provider reference.

## Route Parameters
Route:

- `/(ops)/driver/runs/:deliveryId/route`

Required:

- `deliveryId`

Invalid parameter handling:

- Missing parameter routes back to driver runs with toast `Delivery reference is missing.`
- Malformed parameter shows `not_found`.
- Delivery outside scope shows `scope_denied`.
- Delivery without confirmed driver custody shows `custody_required`.

## Entry Rules
Allow full route screen when:

- User role is `driver`.
- Delivery is assigned to current driver.
- Delivery status is `dispatched_from_origin` or `in_transit`.
- Custody is driver when custody fields are available.

Allow limited state when:

- Delivery is already at destination station or beyond.
- Delivery is pending offline pickup sync.
- Cached detail suggests route state but network is unavailable.

Block route movement when:

- Delivery status is `assigned_to_driver`.
- Delivery custody is still station.
- Payment gate is not cleared.
- Delivery is cancelled or routed to issue queue.
- User is not assigned driver.

## Information Architecture
Primary zones:

- Safe route header.
- Custody and status strip.
- Destination card.
- Navigation launcher.
- Route readiness checklist.
- Next operational action.
- Offline and outbox banner.
- Issue and support actions.

Screen order:

- Header: `Route to destination`
- Custody badge: `Driver has custody`
- Status chip: `Dispatched from origin` or `In transit`
- Destination station card.
- External navigation launcher.
- Route readiness checklist.
- Next action: `Mark in transit` or `Prepare arrival`
- Support actions.

## Visual Direction
The screen should feel like a field command center, not a consumer travel app.

Art direction:

- Large destination card with high-contrast typography.
- Strong station-to-station route spine.
- Minimal map preview only when station coordinates exist.
- Large bottom CTA area.
- Safety mode that removes all nonessential controls while movement is detected.
- Status colors should be grounded: green for custody held, blue for active route, amber for offline/pending, red for blockers.

Typography:

- Destination station title must be the visual anchor.
- Status and custody labels must be short.
- IDs use tabular figures or mono styling.
- Safety copy should be direct and brief.

Motion:

- No animated route line while driving.
- No looping map pulse.
- Use subtle transition when opening external navigation.
- Use reduced motion for all route status changes when requested.

## Layout
Mobile portrait:

- Top safe area: back, title, network badge.
- Hero: destination station and status.
- Route spine: origin -> destination.
- Navigation card: external provider action.
- Next operation card.
- Support strip.
- Sticky bottom CTA.

Small screen:

- Destination station, custody, and primary action stay visible.
- Collapse station details under `Station details`.
- Move secondary actions to bottom sheet.

Landscape:

- Left side: route summary and external navigation.
- Right side: checklist and next action.
- No dense map controls.

Driving or movement detected:

- Enlarge primary controls.
- Hide noncritical detail sections.
- Show `Pull over before using detailed controls.`
- Keep support emergency route visible if safety policy allows.

## Component Inventory
Required components:

- `DriverRouteScreen`
- `RouteCommandHeader`
- `DriverCustodyStatusStrip`
- `StationRouteSpine`
- `DestinationStationCard`
- `ExternalNavigationLauncher`
- `RouteReadinessChecklist`
- `ActiveRouteSafetyMode`
- `RouteOfflineBanner`
- `RouteOutboxSummary`
- `NextOperationalActionCard`
- `RouteIssueActions`
- `RouteMetadataGapBanner`
- `StationContactSheet`
- `NavigationProviderSheet`

Shared component reuse:

- Reuse delivery identity strip from assigned run detail.
- Reuse offline banner patterns.
- Reuse custody chain link.
- Reuse issue creation route.
- Reuse status chip tokens.

Do not create:

- A new map engine.
- A route optimizer.
- A live dispatch tracker.
- Destination receipt scanner.
- In-transit mutation form inside this screen.

## Primary Flow
1. Driver opens route after custody accepted.
2. Screen loads cached delivery detail.
3. Screen validates assigned driver and custody.
4. Screen fetches latest delivery detail when network exists.
5. Screen resolves station display context from cache.
6. Screen shows destination and current status.
7. Driver opens external navigation if address or coordinates exist.
8. Driver returns from navigation app or uses app from a safe stop.
9. Driver opens `DriverMarkInTransit` when ready to record transport status.
10. Driver opens `DriverDestinationArrival` near or at destination station.

## Current Backend Mode
Because route metadata is not yet exposed, implement a safe minimum route screen:

- Use origin and destination station IDs.
- Use station cache for names and locations if available.
- Show `Navigation unavailable` when no address or coordinates exist.
- Show `Route metadata not yet available` as an internal-safe UI state only when needed.
- Avoid displaying ETA, distance, road route, or map polyline unless sourced from approved station/route metadata.

User-facing copy:

- `Destination station`
- `Open navigation when station location is available.`
- `Route estimates are not available yet. Use station details and support if needed.`

Do not show:

- Imagined ETA.
- Imagined distance.
- Imagined route order.
- Imagined traffic.
- Imagined arrival time.

## Future Route Metadata Mode
When backend exposes route metadata, the same screen should support:

- Destination coordinates.
- Station address.
- Route distance.
- Estimated travel time.
- Provider route URL.
- Last route metadata refresh time.
- Route risk flags.
- Offline route cache.

Required contract guard:

- Route metadata must include source and freshness.
- UI must mark stale route metadata.
- UI must prefer backend-approved station coordinates over manually typed addresses.
- UI must not store more driver location than policy permits.

## External Navigation
Supported providers:

- Google Maps through Android intents or cross-platform map URLs.
- Apple Maps through map links.
- Browser maps when native apps are unavailable and policy allows.

External navigation requirements:

- Verify an app can handle the navigation intent before showing the provider as primary.
- Encode station address or coordinates safely.
- Do not pass private delivery metadata into map query.
- Use station name as a label only when safe.
- Provide fallback copy when provider is unavailable.

Provider sheet:

- Title: `Open navigation`
- Body: `Use your map app for turn-by-turn directions. Return to Kra to update delivery status.`
- Options: `Google Maps`, `Apple Maps`, `Copy station address`, `Cancel`

Provider unavailable:

- Title: `Navigation app unavailable`
- Body: `Station location is not available on this device. Use station details or contact support.`
- Primary: `View station details`
- Secondary: `Contact support`

## Location Permission
Location is helpful but not required for core route visibility.

Ask for location only when:

- Showing current driver position.
- Offering distance to destination.
- Supporting arrival preparation.
- A later approved tracking feature needs foreground location.

Rules:

- Do not request background location from this screen for V1.
- Do not block route details when location permission is denied.
- Do not use GPS as proof of custody or destination receipt.
- Do not auto-submit route events based on GPS.
- If precise location is unavailable but approximate is available, keep station route context usable.

Permission copy:

- Title: `Use location for route context?`
- Body: `Location can help show your distance from the destination station. It is not required to keep this delivery visible.`
- Primary: `Allow while using app`
- Secondary: `Not now`

Permission denied state:

- Show destination station and external navigation if station address exists.
- Hide current-location features.
- Keep support and mark-in-transit path available.

## Route Readiness Checklist
Checklist items:

- `Custody accepted`
- `Package in vehicle`
- `Destination station confirmed`
- `Navigation opened or station details reviewed`
- `No blocker reported`

Backend-owned:

- `Custody accepted`
- Delivery status.
- Payment status.

Driver-local:

- `Package in vehicle`
- `Navigation opened or station details reviewed`

Derived:

- `No blocker reported` from active issue state when available.

Do not let checklist local items mutate delivery lifecycle.

## Next Operational Action
Status mapping:

| Delivery Status | Primary Action | Route |
| --- | --- | --- |
| `assigned_to_driver` | `Scan pickup first` | `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| `dispatched_from_origin` | `Mark in transit` | `/(ops)/driver/runs/:deliveryId/in-transit` |
| `in_transit` | `Prepare destination arrival` | `/(ops)/driver/runs/:deliveryId/destination-arrival` |
| `arrived_at_destination` when exposed later | `Open destination handoff` | `/(ops)/driver/runs/:deliveryId/destination-handoff` |
| `received_at_destination` or later | `View custody chain` | `/(ops)/deliveries/:deliveryId/custody` |

Rules:

- `Open navigation` is separate from `Mark in transit`.
- `Mark in transit` must use the dedicated mutation screen.
- Destination receipt is station-owned and must not be submitted here.

## Offline Flow
Offline route screen must remain useful without pretending to know live travel data.

Offline allowed:

- Show cached destination station.
- Show cached origin station.
- Show cached custody and delivery status.
- Show cached station address or coordinates.
- Open external navigation from cached station data.
- Show pending outbox actions.
- Let driver open mark-in-transit screen if that screen can enforce safe offline rules.

Offline blocked:

- Fresh station location absent.
- Delivery detail absent.
- Custody not confirmed in cache.
- Pending pickup sync not confirmed.
- Local status conflicts with queued action.

Offline copy:

- `Using cached route details`
- `Route data may be outdated. Confirm station details before departure.`
- `Sync required for status updates.`

Outbox behavior:

- Show pending `mark_in_transit` action if queued.
- Block duplicate mark-in-transit submission while matching action exists.
- Link to offline outbox for recovery.

## State Model
Required states:

- `initializing`
- `loading_delivery`
- `using_cached_route`
- `refreshing_route_context`
- `custody_required`
- `route_ready`
- `navigation_available`
- `navigation_unavailable`
- `navigation_launched`
- `location_permission_needed`
- `location_permission_denied`
- `location_approximate_only`
- `station_location_missing`
- `route_metadata_missing`
- `offline_cached`
- `offline_blocked`
- `pending_outbox_action`
- `in_transit_ready`
- `destination_arrival_ready`
- `issue_blocked`
- `payment_blocked`
- `scope_denied`
- `not_found`
- `session_expired`
- `api_error`

State transitions:

- `loading_delivery` -> `route_ready` when status and custody are valid.
- `route_ready` -> `navigation_available` when station location exists.
- `route_ready` -> `navigation_unavailable` when station location is missing.
- `route_ready` -> `in_transit_ready` when status is `dispatched_from_origin`.
- `route_ready` -> `destination_arrival_ready` when status is `in_transit`.
- `using_cached_route` -> `refreshing_route_context` when network returns.
- `pending_outbox_action` -> latest status after sync success.
- `custody_required` -> pickup scan route when driver can still act.

## Error Handling
Custody required:

- Title: `Pickup scan required`
- Body: `Route movement starts only after the assigned driver accepts custody with the package scan.`
- Primary: `Open pickup scan`

No station location:

- Title: `Station location unavailable`
- Body: `Destination station details are not complete enough to launch navigation. Contact support before departure.`
- Primary: `Contact support`
- Secondary: `View run detail`

Navigation app unavailable:

- Title: `Navigation unavailable`
- Body: `No supported map app is available on this device. Use station details or contact support.`
- Primary: `View station details`

Scope denied:

- Title: `Run not assigned to you`
- Body: `This route is assigned to another driver. Do not move the package.`
- Primary: `Back to runs`

Payment blocked:

- Title: `Payment gate blocked`
- Body: `This package cannot continue route movement until payment is cleared.`
- Primary: `Refresh`
- Secondary: `Contact support`

Issue blocked:

- Title: `Route blocked by issue`
- Body: `An active issue requires review before route movement continues.`
- Primary: `Open issue`
- Secondary: `Contact support`

Offline blocked:

- Title: `Route details unavailable offline`
- Body: `Connect once to load station details before using this route.`
- Primary: `Retry`

## Copy System
Header:

- `Route to destination`

Custody:

- `Driver has custody`
- `Package remains your responsibility until destination station receipt.`

Destination:

- `Destination station`
- `Open navigation when ready to depart.`

Safety:

- `Use detailed controls only while parked.`
- `Return to Kra to update delivery status.`

Navigation:

- `Open navigation`
- `Choose map app`
- `Station location unavailable`

Next action:

- `Mark in transit`
- `Prepare destination arrival`
- `Open pickup scan`

Offline:

- `Using cached route details`
- `Sync required for status updates.`

## Safety And Distraction Rules
This screen must reduce visual-manual work while driving.

Rules:

- Keep primary actions large.
- Avoid dense controls in active movement state.
- Do not show scroll-heavy operational detail in movement state.
- Do not require typing while driving.
- Do not require multi-step action before external navigation.
- Use voice-compatible accessible labels where platform supports it.
- Encourage safe stop for issue reporting unless urgent safety support is required.
- Never force route adjustment while vehicle is moving.

Movement detected mode:

- Show destination.
- Show current status.
- Show `Open navigation` or `Return to navigation`.
- Show `Pull over to update status or report issues.`
- Hide noncritical route metadata.

## Accessibility
Screen reader:

- Announce route status on load.
- Announce offline cached state.
- Announce navigation launched state.
- Use `role=status` for refresh updates.
- Use `role=alert` for custody-required or issue-blocked states.

Focus:

- On route ready, focus destination station.
- On blocker, focus blocker title.
- On provider sheet, focus sheet title.
- After external navigation return, focus next action card.

Touch targets:

- Primary navigation CTA at least 48 by 48.
- Secondary operational CTAs at least 44 by 44.
- Provider sheet rows at least 48 high.

Color and contrast:

- Status chips must meet contrast.
- Route spine must include labels, not color alone.
- Offline warning must include icon and text.

Reduced motion:

- Disable route spine movement.
- Disable card entrance animation.
- Use instant state changes.

## Privacy And Security
Protect:

- Delivery ID.
- Driver actor ID.
- Station addresses if internal-only.
- Current location.
- Outbox action data.

Rules:

- Do not pass delivery ID, package ID, scan code, actor ID, receiver phone, or payment references into external map URLs.
- Use only destination coordinates/address and safe station label for external navigation.
- Do not collect background location in V1.
- Do not store location history from this screen unless future backend policy requires it.
- Do not show receiver private address on inter-station route.
- Redact route context from analytics where it could expose private location data.

Analytics redaction:

- Route screen analytics can include station IDs.
- Do not include exact driver GPS.
- Do not include external navigation query string.
- Do not include package scan code.

## Analytics
Events:

- `driver_route_viewed`
- `driver_route_cache_used`
- `driver_route_navigation_provider_opened`
- `driver_route_navigation_launch_failed`
- `driver_route_mark_in_transit_opened`
- `driver_route_destination_arrival_opened`
- `driver_route_support_opened`
- `driver_route_location_permission_requested`
- `driver_route_location_permission_denied`
- `driver_route_metadata_missing`

Required properties:

- `deliveryId`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `custodyRole`
- `isAssignedDriver`
- `networkState`
- `cacheAgeSeconds`
- `hasStationCoordinates`
- `hasStationAddress`
- `navigationProvider`
- `hasPendingOutboxAction`

Forbidden properties:

- Raw package scan code.
- Driver precise GPS.
- External map URL.
- Private receiver phone.
- Payment provider reference.

## Cache And Invalidation
On screen open:

- Render cached delivery detail first.
- Render cached station context if available.
- Mark cache freshness.
- Fetch latest delivery detail when online.
- Fetch timeline if status or custody is unclear.

On external navigation launch:

- Record local `navigationOpenedAt`.
- Do not mutate delivery lifecycle.
- Keep route screen state for return.

On mark-in-transit success:

- Invalidate delivery detail.
- Invalidate timeline.
- Invalidate driver queue.
- Return to route screen or destination arrival screen with updated status.

On issue creation:

- Invalidate active issue context.
- Show issue badge.
- Do not change route status unless backend state changes.

## Navigation
From this screen:

- `Open navigation`: external map app or provider sheet.
- `Mark in transit`: `/(ops)/driver/runs/:deliveryId/in-transit`
- `Prepare destination arrival`: `/(ops)/driver/runs/:deliveryId/destination-arrival`
- `View custody chain`: `/(ops)/deliveries/:deliveryId/custody`
- `Report route issue`: `/(ops)/driver/support`
- `Back to run detail`: `/(ops)/driver/runs/:deliveryId`

Back behavior:

- Back returns to run detail.
- If external navigation was launched, returning to Kra keeps route context active.
- If pending outbox action exists, back is allowed but run row must show pending.

Deep link behavior:

- If custody not confirmed, route to pickup scan or blocked state.
- If status is `dispatched_from_origin`, show route with `Mark in transit`.
- If status is `in_transit`, show route with destination arrival.
- If delivery is beyond destination receipt, show custody chain.

## Implementation Notes For Claude Code
Build `DriverRoute` as an operational command screen, not a navigation engine.

Required implementation sequence:

1. Read route `deliveryId`.
2. Load auth and delivery detail.
3. Enforce driver assignment and custody.
4. Load station context from cache or station service.
5. Determine whether external navigation is available.
6. Render destination and route status.
7. Route `Mark in transit` to the dedicated mutation screen.
8. Route `Prepare destination arrival` to the dedicated arrival screen.
9. Render offline cache and missing route metadata states.
10. Add safety mode for movement or app policy.
11. Add accessibility labels and status announcements.
12. Add tests for custody gating, external navigation, offline cache, and missing metadata.

Suggested hook names:

- `useDriverRouteScreen`
- `useDriverRouteContext`
- `useStationNavigationTarget`
- `useExternalNavigationLauncher`
- `useRouteOfflineState`
- `useDriverRouteNextAction`
- `useMovementSafetyMode`

Suggested component boundaries:

- `DriverRouteScreen` owns route, data, and state.
- `RouteCommandHeader` owns title and status.
- `DestinationStationCard` owns station identity.
- `ExternalNavigationLauncher` owns provider availability.
- `RouteReadinessChecklist` owns local readiness.
- `NextOperationalActionCard` owns workflow routing.
- `ActiveRouteSafetyMode` owns driving-safe presentation.

## API Mapping
Reads:

- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline` when evidence is unclear.

Next mutation route:

- `POST /v1/deliveries/:id/mark-in-transit` from `DriverMarkInTransit`, not here.

Current state gates:

- `dispatched_from_origin` -> route ready and mark-in-transit next.
- `in_transit` -> route active and destination arrival next.
- `assigned_to_driver` -> pickup scan required.
- later destination statuses -> custody chain or destination screens.

External provider inputs:

- Destination station coordinates when available.
- Destination station address when available.
- Safe station label.

External provider forbidden inputs:

- Package scan code.
- Delivery internal payload.
- Actor IDs.
- Payment details.
- Customer private data.

## QA Acceptance Criteria
Functional:

- Route screen renders for assigned driver with confirmed custody.
- Route screen blocks unconfirmed pickup.
- Route screen blocks unassigned driver.
- Destination station card renders from station cache.
- Missing station location disables external navigation and shows support.
- External navigation provider is checked before launch.
- Opening navigation does not mutate delivery lifecycle.
- `Mark in transit` routes to dedicated screen.
- `Prepare destination arrival` routes to dedicated screen when status is `in_transit`.
- Offline cached route renders with freshness badge.

Safety:

- Movement state hides nonessential controls.
- Safety copy is visible.
- No text entry is required while driving.
- Primary controls are large.

Custody:

- Screen requires driver custody.
- Screen explains driver responsibility.
- Screen does not show receiver completion controls.
- Screen does not perform station destination receipt.
- Screen never shows raw package scan code.

Offline:

- Cached station context supports route display.
- Missing cache blocks route details.
- Pending outbox action appears.
- Duplicate status action is blocked by child screen or outbox state.

Accessibility:

- Primary test ID is `screen-driver-route`.
- Destination card is announced.
- Offline and blocker states are announced.
- Provider sheet is keyboard and screen-reader navigable.
- Touch targets meet minimums.

## Test Matrix
Unit tests:

- Status maps to correct next action.
- Custody gate blocks invalid states.
- Provider availability resolver disables unavailable providers.
- External navigation URL builder excludes forbidden metadata.
- Offline freshness maps to warning state.
- Movement safety mode hides detailed controls.

Component tests:

- Renders destination station card.
- Renders custody status strip.
- Renders external navigation launcher.
- Renders route metadata missing banner.
- Renders offline cached banner.
- Renders custody required blocker.
- Renders next operational action.

Integration tests:

- Assigned driver opens route after custody accepted.
- Unconfirmed custody routes to pickup scan.
- Missing station coordinates disables navigation.
- External navigation launch records local event only.
- Mark-in-transit action opens dedicated screen.
- In-transit status opens destination arrival path.
- Offline cached route remains usable.

End-to-end tests:

- `e2e-driver-route-after-custody-accepted`
- `e2e-driver-route-open-external-navigation`
- `e2e-driver-route-custody-required-block`
- `e2e-driver-route-offline-cached`
- `e2e-driver-route-missing-station-location`
- `e2e-driver-route-mark-in-transit-next-action`

## Performance
Targets:

- Cached route shell visible under 500 milliseconds.
- Delivery refresh starts within 250 milliseconds.
- Provider sheet opens under 100 milliseconds.
- External navigation launch tap feedback under 100 milliseconds.
- Route screen does not load heavy map assets unless coordinates and policy allow.

Low-end device:

- Use static station cards instead of embedded maps by default.
- Avoid continuous GPS polling.
- Avoid animated map layers.
- Avoid high-frequency re-rendering.

Low-bandwidth:

- Prefer cached text and station context.
- Defer timeline refresh when route command is already safe.
- Show freshness instead of blocking every network miss.

## Edge Cases
Destination station has name but no address:

- Show station name and support CTA.
- Disable external navigation.

Destination station has coordinates but no address:

- Allow navigation with coordinates.
- Show coordinate source freshness if available.

Navigation app missing:

- Disable provider.
- Offer copy station address if available.

Driver opens route before pickup:

- Block route and send to pickup scan.

Delivery already in transit:

- Show active route state and destination arrival action.

Delivery received at destination:

- Show route complete state and custody chain action.

Network fails after navigation launch:

- Keep route context from cache.
- Do not lose next operational action.

Device location permission denied:

- Keep station route visible.
- Hide current-location features.

Station cache stale:

- Show stale badge.
- Require support confirmation before departure if no reliable address exists.

## Release Gates
This screen is not complete until:

- Confirmed driver custody is required.
- Missing custody routes to pickup scan or blocked state.
- External navigation launch is provider-checked.
- External navigation does not mutate backend status.
- Mark-in-transit remains a separate screen.
- Missing station location is handled safely.
- Offline cached route is handled with freshness.
- Raw package scan code is absent from UI, analytics, logs, and external map links.
- Accessibility announcements and large targets are covered.
- Safety mode limits visual-manual distraction.
- CI includes unit, component, integration, and E2E coverage for critical states.

## Final Build Standard
The final UI should make one operational rule obvious:

`The driver can navigate after custody is confirmed, but lifecycle status changes still happen through explicit Kra actions with backend proof.`

If the implementation preserves that rule while staying useful offline and minimizing driver distraction, this screen is ready for production build.

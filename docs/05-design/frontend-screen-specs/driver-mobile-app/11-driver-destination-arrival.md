# DriverDestinationArrival Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverDestinationArrival` |
| Route | `/(ops)/driver/runs/:deliveryId/destination-arrival` |
| Primary test ID | `screen-driver-destination-arrival` |
| Surface | Driver mobile app |
| Backend coverage | `get_delivery` through `GET /v1/deliveries/:id` |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | `view_own_delivery` |
| Required custody | Driver custody confirmed before station handoff preparation |
| Parent screen | `DriverRoute` or `DriverMarkInTransit` |
| Primary mutation | None in current API |
| Supporting reads | `get_delivery`, `get_delivery_timeline`, station directory cache, local route cache |
| Related routes | `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/driver/runs/:deliveryId/in-transit`, `/(ops)/driver/runs/:deliveryId/destination-handoff`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Driver-side arrival readiness and station handoff preparation using current API |

## Product Job
`DriverDestinationArrival` helps the assigned driver prepare for driver-to-destination-station handoff after transport has reached the destination station.

The screen answers:

- `Am I at the correct destination station for this delivery?`
- `Is the delivery still assigned to me?`
- `Is custody still with me until the station receives the package?`
- `Is the server state ready for station receipt?`
- `What must happen next with the destination station operator?`
- `What should I do if I am offline, at the wrong station, or the package has already been received?`

This is an arrival preparation screen, not a destination receipt screen.

## Product Standard
This screen is a custody-protection checkpoint. It must make the driver slow down enough to avoid handing a package to the wrong station, while keeping the interaction short enough for field use.

The driver should be able to:

- Verify delivery identity without exposing sensitive receiver detail.
- Confirm the destination station ID and station name when available.
- See whether the delivery is still in driver custody.
- See whether the status is `in_transit` or needs `mark_in_transit`.
- Understand that station receipt is completed by the destination station operator.
- Open the next handoff coordination screen only when the local preflight is safe.
- Continue read-only preparation from cache when the network is weak.
- Escalate if the station, status, custody, or assignment is wrong.

The screen must never:

- Call `receive_destination` from the driver app.
- Claim destination receipt is complete before the backend returns station-side success.
- Invent or persist `arrived_at_destination` as a delivery state under the current state machine.
- Transfer custody based on GPS, proximity, tap confirmation, local cache, or driver statement.
- Show the raw package scan code.
- Show receiver phone number or full receiver address.
- Auto-start scanning while the driver may still be driving.
- Hide wrong-station, wrong-assignment, stale-data, or offline uncertainty.

## Audience
Primary audience:

- Assigned driver carrying a package to the destination station.

Secondary audience:

- Destination station operator preparing to receive the package.
- Support agent reviewing why a handoff did not complete.
- QA validating no driver-side destination receipt mutation exists.
- Claude Code implementing the driver arrival UI and tests.
- Operations leadership validating loss-prevention discipline.
- Accessibility reviewer validating field-friendly touch, focus, and status feedback.

## Context Of Use
The driver may open this screen:

- After marking the delivery `in_transit`.
- From `DriverRoute` near the destination station.
- From active run detail after reaching the destination area.
- From a push notification or operational reminder.
- From cached route state during weak connectivity.
- While parked outside the station.
- At the station counter with staff present.
- After the station operator says the package is missing from their inbound queue.

The driver may be under time pressure. The UI must keep the next action obvious, but it must not compress away custody warnings.

## Design Brief
Audience:

- A field driver using one hand, often with poor connectivity, station noise, and physical package handling.

Surface type:

- Mobile operational checkpoint.

Primary action:

- `Prepare station handoff`

Visual thesis:

- `Arrival dock`: a calm, high-contrast station arrival card with one strong handoff rail, a custody status band, and a clear next-action stack.

Restraint rule:

- Do not add route optimization, destination receipt submission, receiver delivery, payment, earnings, or broad history browsing.

Interaction density:

- Medium-low: identity, station, custody, readiness checklist, and one next step.

Trust posture:

- The screen should feel like an operational instrument, not a marketing page. Every important line should map to a backend fact or clearly marked local condition.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Barcode Scanning support](https://support.onfleet.com/hc/en-us/articles/37852822362132-Barcode-Scanning-Couriers-and-Clients): supports scan-backed pickup and dropoff verification, chain of custody, manual numeric entry when scanning is not possible, and timestamped scan history.
- [Google Maps Intents for Android](https://developer.android.com/guide/components/google-maps-intents): supports launching external navigation through resolved intents and disabling navigation actions when no handler exists.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local read cache, queued write discipline where writes exist, and conflict handling after reconnect.
- [Android runtime location permission guidance](https://developer.android.com/develop/sensors-and-location/location/permissions/runtime): supports optional foreground location access and handling approximate location.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): supports large touch targets and safe spacing for field operation.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible feedback for refresh, offline, preflight, and state changes.
- [NHTSA visual-manual driver distraction guidelines](https://www.transportation.gov/regulations/federal-register-documents/2013-09883): supports keeping arrival preparation and handoff tasks unavailable while driving and reducing visual-manual burden.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-data/state-machine.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/02-users/permissions-matrix.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/09-driver-route.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/10-driver-mark-in-transit.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/12-station-inbound-queue.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/13-station-destination-receipt.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/14-station-condition-check.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`

## Backend Contract
Current route:

- `GET /v1/deliveries/:id`
- Operation ID: `get_delivery`
- Auth scope: authenticated
- Capability: `view_own_delivery`
- Response schema: `deliveryDetailResponseSchema`

Current destination receipt route:

- `POST /v1/deliveries/:id/receive-destination`
- Operation ID: `receive_destination`
- Capability: `confirm_destination_receipt`
- Actor owner: station operator
- This screen must not call it.

Driver related route:

- `POST /v1/deliveries/:id/mark-in-transit`
- Operation ID: `mark_in_transit`
- Capability: `update_transit_status`
- Used on previous screen when transport status has not been recorded.

Read fields from `deliveryDetailResponseSchema`:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm`
- `receiver`
- `package`
- `quote`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `latestEvent`
- `latestTouchpoint`
- `createdAt`

Safe display fields:

- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `package.sizeTier`
- `package.fragile`
- `package.declaredValueGhs` only as an alert tier, not a precise public-facing asset description
- `latestEvent.type`
- `latestEvent.occurredAt`
- `latestTouchpoint.role`
- `latestTouchpoint.stationId`
- `latestTouchpoint.occurredAt`

Restricted fields:

- Do not show receiver phone.
- Do not show full receiver address.
- Do not show raw package scan code.
- Do not expose package label registry internals.
- Do not expose internal support notes.
- Do not expose payment provider references.

## Backend Facts This Screen Must Respect
Driver facts:

- Driver can view only assigned runs.
- Driver can update in-transit state for assigned runs.
- Driver cannot confirm destination receipt.
- Driver remains accountable while `currentCustodyRole === "driver"` and `currentCustodyActorId === assignedDriverId`.

Station receipt facts:

- `receive_destination` requires station operator capability `confirm_destination_receipt`.
- Backend station scope requires actor station to match `destinationStationId`.
- Request body requires `packageScanCode`, `condition`, and `nextStep`.
- Backend validates the package scan code against the package label registry when configured.
- Backend requires confirmed driver custody before destination receipt.
- Backend records `delivery_received_at_destination`.
- Backend creates handoff type `driver_to_destination_station`.
- Backend moves custody to station operator after receipt.
- Backend routes next status to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.

State-machine facts:

- `dispatched_from_origin` can move to `in_transit`.
- `in_transit` can move to `received_at_destination`.
- `received_at_destination` can move to `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, or `issue_reported`.
- There is no current server status named `arrived_at_destination`.

## Scope Boundary
This screen is responsible for:

- Loading delivery detail.
- Verifying assignment and custody are still compatible with driver handoff.
- Showing the destination station and arrival checklist.
- Showing whether the delivery is ready for station-side receipt.
- Routing to `DriverMarkInTransit` when transport status is missing.
- Routing to `DriverDestinationHandoff` for station coordination.
- Routing to support when the state is unsafe.
- Showing cached read-only state when offline.

This screen is not responsible for:

- Scanning the destination receipt package label.
- Choosing `condition`.
- Choosing `nextStep`.
- Submitting `receive_destination`.
- Assigning final-mile courier.
- Completing receiver pickup.
- Completing doorstep delivery.
- Recording payment.
- Editing stations.
- Reporting earnings.

## Handoff Model
The driver-to-destination-station handoff has three visible phases:

1. Arrival preparation in driver app.
2. Receipt scan and condition decision in station app.
3. Receipt result visible to driver after station success.

This screen owns phase 1 only.

Driver screen language:

- `You still hold custody until the station scans and receives this package.`
- `Ask the destination operator to receive this package in the station app.`
- `Do not leave the package until station receipt is confirmed.`

Station receipt language must remain on station screens:

- `Scan package`
- `Condition`
- `Route after receipt`
- `Submit destination receipt`

## Entry Preconditions
The screen may be opened when:

- User role is `driver`.
- Delivery exists.
- Delivery is visible to the signed-in principal.
- Delivery has `assignedDriverId`.
- Delivery has destination station ID.

Preferred ready state:

- `assignedDriverId === currentUserId`
- `currentCustodyRole === "driver"`
- `currentCustodyActorId === currentUserId`
- `currentStatus === "in_transit"`

Allowed but attention-needed state:

- `currentStatus === "dispatched_from_origin"`
- `currentCustodyRole === "driver"`
- `currentCustodyActorId === currentUserId`

In this case, show `Record in transit first` as the dominant action. Do not block station handoff permanently because backend station receipt can transition through `in_transit`, but the driver should close the missing status gap when online.

Blocked states:

- No delivery returned.
- Delivery not assigned to current driver.
- Current custody is not driver.
- Delivery is already `received_at_destination` or later.
- Delivery is in `issue_reported`, `cancelled`, `delivery_failed`, or `closed`.
- User has no driver role.

## State Authority Matrix
| Backend state | Driver arrival meaning | Primary UI action | Station receipt allowed from here |
| --- | --- | --- | --- |
| `assigned_to_driver` | Driver has not completed origin pickup | `Return to pickup workflow` | No |
| `dispatched_from_origin` | Driver custody exists, but transport status may not be recorded | `Record in transit first` | Yes, station backend can normalize if custody is driver |
| `in_transit` | Ready for destination handoff preparation | `Prepare station handoff` | Yes |
| `received_at_destination` | Station already received package | `View custody chain` | Already done |
| `awaiting_receiver_pickup` | Station receipt and routing are done | `View next handling` | Already done |
| `awaiting_final_mile_assignment` | Station receipt and doorstep routing are done | `View next handling` | Already done |
| `issue_reported` | Operational issue blocks normal arrival | `Contact support` | No normal flow |
| `cancelled` | Delivery cancelled | `View delivery detail` | No |
| `delivery_failed` | Terminal failed state | `View support record` | No |
| `closed` | Lifecycle closed | `View history` | No |

## Information Architecture
Top-to-bottom structure:

1. System status strip.
2. Delivery identity header.
3. Destination station hero.
4. Custody accountability band.
5. Arrival readiness checklist.
6. Station handoff protocol.
7. Risk and recovery panel.
8. Primary action dock.

The screen must fit the critical status and primary action within the first viewport on common small phones.

## Layout Anatomy
### 1. System Status Strip
Purpose:

- Communicate connection, cache age, and server authority.

Content:

- Online and fresh: `Live delivery state`
- Refreshing: `Refreshing delivery state`
- Offline with cache: `Offline - cached delivery state`
- Stale: `State may have changed. Refresh before handoff.`
- Conflict: `Server state changed. Review before continuing.`

Behavior:

- Use a compact strip below the app header.
- Do not interrupt focus for normal refresh completion.
- Announce status changes through accessible status messaging.

### 2. Delivery Identity Header
Purpose:

- Ensure the driver is holding the correct package without revealing sensitive data.

Content:

- Tracking code.
- Delivery ID in compact text.
- Service type.
- Fragile alert if true.
- Declared value alert if policy allows staff-safe visibility.
- Package size tier.
- Origin station ID.
- Destination station ID.

Visual:

- Use a large destination code and a smaller origin-to-destination rail.
- Use a single high-salience custody badge.
- Avoid many small pills.

### 3. Destination Station Hero
Purpose:

- Make wrong-station prevention the focal point.

Content:

- Station name from station directory cache when available.
- Destination station ID.
- City or area label when available.
- Station open status only if the station directory has trusted hours.
- Map open action.
- Last refreshed timestamp.

Primary copy:

- `Destination station`
- `{stationName}`
- `{destinationStationId}`
- `Confirm this is the station counter before handoff.`

Fallback when station name is unavailable:

- `Station name unavailable`
- `Use station ID {destinationStationId} and confirm with station staff.`

### 4. Custody Accountability Band
Purpose:

- Keep the loss-prevention rule visible.

Ready copy:

- `Custody: Driver`
- `You are accountable until station receipt succeeds.`

Not ready copy:

- `Custody mismatch`
- `This delivery is not currently in your custody. Do not hand over the package.`

Already received copy:

- `Station custody recorded`
- `Destination receipt has already been completed by the station.`

Visual:

- Use a solid band, not a quiet footnote.
- Use green only after server-confirmed station receipt.
- Use amber for driver-held custody.
- Use red for mismatch or issue lock.

### 5. Arrival Readiness Checklist
Purpose:

- Convert hidden backend requirements into a fast checklist.

Checklist items:

- `Assigned to you`
- `Driver custody confirmed`
- `Transport status recorded`
- `Destination station identified`
- `Station operator must receive package`
- `Do not leave package until receipt is confirmed`

Readiness rules:

- `Assigned to you` passes when `assignedDriverId === currentUserId`.
- `Driver custody confirmed` passes when custody role and actor match current driver.
- `Transport status recorded` passes when `currentStatus === "in_transit"` or later.
- `Destination station identified` passes when `destinationStationId` exists.
- `Station operator must receive package` is an informational requirement, always visible.
- `Do not leave package until receipt is confirmed` remains visible until station receipt result is observed.

Checklist states:

- Passed.
- Attention.
- Blocked.
- Not verifiable offline.

### 6. Station Handoff Protocol
Purpose:

- Tell the driver what happens physically at the counter.

Protocol:

1. Park safely before using the phone.
2. Confirm station ID with staff.
3. Keep package in your possession until station app is ready.
4. Ask station operator to open destination receipt.
5. Present the package label for scan.
6. Wait while staff records condition and next route.
7. Leave only after the station receipt success state appears.

Implementation:

- Present as a vertical stepper.
- Completed steps can be local UI checks only.
- Do not persist protocol steps as delivery facts.
- Do not claim receipt success from local protocol completion.

### 7. Risk And Recovery Panel
Purpose:

- Give the driver safe action when the flow is not ready.

Risk cases:

- Wrong station suspected.
- Offline at station.
- Status still `dispatched_from_origin`.
- Custody mismatch.
- Delivery already received.
- Package damaged before handoff.
- Station operator cannot find the delivery.
- Station app unavailable.
- Driver no longer assigned.

Recovery actions:

- `Refresh delivery state`
- `Record in transit`
- `Open route`
- `Open custody chain`
- `Contact driver support`
- `Ask station operator to search inbound queue`
- `Do not leave package`

### 8. Primary Action Dock
Purpose:

- Keep the next action reachable and safe.

Dock content by state:

- Ready: primary `Prepare station handoff`; secondary `Open route`; tertiary `Support`.
- Needs transit: primary `Record in transit first`; secondary `Prepare with station`; tertiary `Support`.
- Offline cached: primary `Review cached handoff steps`; secondary `Refresh when online`; tertiary `Support`.
- Custody mismatch: primary `Contact support`; secondary `View custody chain`.
- Already received: primary `View custody chain`; secondary `Back to runs`.
- Terminal state: primary `Back to runs`; secondary `Support`.

Button rules:

- Minimum target size must exceed WCAG minimum and be field-friendly.
- Primary action must be reachable near bottom thumb zone.
- Destructive or blocking actions must not be adjacent to primary action.
- Disable actions only when a clear reason is visible.

## Interaction Flow
### Flow 1: Normal Online Arrival
1. Driver opens `DriverDestinationArrival` from `DriverRoute`.
2. Screen calls `get_delivery`.
3. UI confirms assignment, driver custody, destination station, and `in_transit`.
4. Driver reviews station hero and custody band.
5. Driver taps `Prepare station handoff`.
6. UI routes to `/(ops)/driver/runs/:deliveryId/destination-handoff`.
7. Driver remains accountable until station receipt success is observed.

### Flow 2: Transport Status Missing
1. Driver opens screen with `currentStatus === "dispatched_from_origin"`.
2. UI shows custody ready but transport status attention.
3. Primary action becomes `Record in transit first`.
4. Driver taps it.
5. UI routes to `DriverMarkInTransit`.
6. After mutation success, user returns to this screen.
7. Ready state allows handoff preparation.

### Flow 3: Offline At Destination
1. Driver opens screen with no network and cached delivery detail.
2. UI shows cached status strip and cache age.
3. UI allows reading station ID, station name cache, and protocol.
4. UI does not claim station receipt can be completed locally.
5. Driver may coordinate with station if station app is online.
6. Driver must refresh or wait for station receipt result before leaving package.

### Flow 4: Wrong Assignment
1. `get_delivery` returns delivery assigned to another driver or no access.
2. UI blocks handoff preparation.
3. UI shows `This job is not assigned to you.`
4. Primary action is `Contact support`.
5. UI must not show receiver phone or full address.

### Flow 5: Custody Mismatch
1. `get_delivery` returns `currentCustodyRole !== "driver"` or actor mismatch.
2. UI blocks handoff preparation.
3. UI explains that driver custody is not confirmed.
4. CTA routes to custody chain and support.
5. Driver must not leave package based on local belief.

### Flow 6: Already Received
1. Delivery status is `received_at_destination` or a later routed status.
2. UI shows server-confirmed station custody or later handling state.
3. Primary action routes to custody chain or run history.
4. Screen does not offer station handoff.

### Flow 7: Issue During Arrival
1. Driver sees package damage, station closed, staff refusal, or station mismatch.
2. Driver taps `Report arrival issue`.
3. UI routes to `DriverSupport` with delivery context.
4. Driver keeps custody unless backend later records a valid handoff.

## Data Loading
Initial load:

- Read cached delivery detail immediately if available.
- Start network `get_delivery` request.
- Resolve station directory cache for `destinationStationId`.
- Resolve local route cache if available.
- Resolve latest timeline only if custody detail is not clear from delivery detail or the user opens custody panel.

Refresh:

- Pull to refresh calls `get_delivery`.
- Refresh on app foreground.
- Refresh after returning from external navigation.
- Refresh after returning from `DriverMarkInTransit`.
- Refresh after returning from `DriverDestinationHandoff`.

Stale threshold:

- Mark detail stale after `2 minutes` while online.
- Mark cache stale immediately when app detects network loss and last server read is older than `5 minutes`.
- Require explicit refresh before route to handoff if online and data is stale.

No live location dependency:

- Do not require GPS to display the screen.
- Do not require GPS to prepare handoff.
- If location is available, show proximity only as advisory.
- If location is approximate, label it as approximate.
- If location is denied, keep the flow usable.

## Offline Behavior
Offline mode is read-only for this screen because there is no current driver arrival mutation.

Allowed offline:

- Show cached delivery identity.
- Show cached station directory.
- Show cached route context.
- Show custody checklist with cache age.
- Show station handoff protocol.
- Allow support draft creation if the support flow has local issue queue capability.
- Route to offline outbox.

Blocked offline:

- Do not mark destination receipt complete.
- Do not persist server arrival status.
- Do not call `receive_destination`.
- Do not infer station receipt from driver proximity.
- Do not hide stale state.

Offline copy:

- `Offline - use this only to verify station and handoff steps. Station receipt still needs server confirmation.`

Reconnect:

- Auto-refresh delivery detail.
- If server status changed to station-received or later, show result.
- If server status conflicts with cached state, show conflict banner and block handoff preparation until reviewed.

## Location And Navigation
Navigation entry points:

- `Open in maps`
- `Back to route`
- `Call support`

External maps:

- Use platform-safe map links or intents.
- Resolve whether an external handler exists before showing Android map intent action.
- Use station coordinates only from trusted station directory.
- Do not send receiver address to external maps from this screen.
- If station coordinates are unavailable, route back to `DriverRoute` or show station ID only.

Location permission:

- Ask only when location materially improves station verification.
- Request foreground permission only.
- Coarse location is acceptable for advisory proximity.
- Precise location is not required for handoff preparation.
- If permission is denied, show manual station verification.

Safety:

- If the app detects motion or active navigation state, keep the screen in glance mode.
- Handoff preparation actions should be framed as `Use when parked`.
- Do not present scanner-like interaction on this screen.

## Visual Design System
### Visual Direction
Use a grounded field-operations visual language:

- Dark ink text on warm off-white surfaces.
- Deep green for server-confirmed success only.
- Amber for driver-held custody and caution.
- Red for blocked handoff and issue states.
- Slate blue for route and station context.
- Strong station code typography.
- Minimal chrome and high spacing.

The screen should feel robust in sunlight and on low-end devices.

### Color Tokens
Suggested semantic tokens:

- `--arrival-bg`: warm neutral background.
- `--arrival-surface`: elevated surface.
- `--arrival-ink`: primary text.
- `--arrival-muted`: secondary text.
- `--arrival-custody-driver`: amber.
- `--arrival-ready`: deep green.
- `--arrival-blocked`: operational red.
- `--arrival-route`: slate blue.
- `--arrival-offline`: graphite.
- `--arrival-focus`: high-contrast blue.

Do not rely on color alone. Every status needs text and icon or shape.

### Typography
Use:

- Large station ID or station name as the dominant type element.
- Compact monospaced or tabular treatment for tracking code.
- Clear 16px minimum body size on mobile.
- Strong line height for sunlight readability.
- No decorative type in operational zones.

Hierarchy:

- H1: destination station name or ID.
- H2: custody status and readiness sections.
- Body: short, direct instructions.
- Fine print: cache age, delivery ID, latest event.

### Spacing
Rules:

- Preserve enough vertical rhythm for touch use.
- Use a sticky action dock with safe-area padding.
- Keep checklist rows separated enough to avoid wrong taps.
- Avoid dense horizontal chips.
- Use one-column layout on phones.

### Motion
Motion should clarify state:

- Subtle slide-in for the action dock after data load.
- Short status strip transition after refresh.
- Checklist item status changes fade and settle.
- No looped animation.
- Respect reduced motion.

## Component Specification
### `ArrivalScreenShell`
Responsibilities:

- Own route params.
- Own query lifecycle.
- Own offline strip.
- Own scroll container and action dock.

Props:

- `deliveryId`
- `currentUserId`
- `networkState`
- `deliveryQuery`
- `stationDirectory`
- `onRefresh`

Test IDs:

- `screen-driver-destination-arrival`
- `driver-arrival-scroll`
- `driver-arrival-action-dock`

### `ArrivalStatusStrip`
Responsibilities:

- Display online, refresh, stale, offline, and conflict state.
- Announce status updates accessibly.

States:

- `live`
- `refreshing`
- `offline_cached`
- `stale`
- `conflict`
- `error`

Test IDs:

- `driver-arrival-status-strip`
- `driver-arrival-cache-age`

### `DeliveryIdentityPanel`
Responsibilities:

- Show safe delivery identity.
- Prevent wrong package selection.

Content:

- Tracking code.
- Delivery ID.
- Service type.
- Package size tier.
- Fragile flag.
- Origin station ID.
- Destination station ID.

Test IDs:

- `driver-arrival-identity-panel`
- `driver-arrival-tracking-code`
- `driver-arrival-route-pair`

### `DestinationStationHero`
Responsibilities:

- Make the expected destination station unmistakable.

Content:

- Station name.
- Station ID.
- City or area.
- Station verification copy.
- Map action if available.

Test IDs:

- `driver-arrival-station-hero`
- `driver-arrival-destination-station-id`
- `driver-arrival-open-maps`

### `CustodyAccountabilityBand`
Responsibilities:

- Show who currently holds custody.
- Communicate whether the driver may proceed.

Inputs:

- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `currentUserId`
- `currentStatus`

Output states:

- `driver_custody_ready`
- `driver_custody_attention`
- `custody_mismatch`
- `station_custody_recorded`
- `terminal`

Test IDs:

- `driver-arrival-custody-band`
- `driver-arrival-custody-state`

### `ArrivalReadinessChecklist`
Responsibilities:

- Show all readiness gates.
- Map backend facts to user-readable steps.

Items:

- Assignment.
- Custody.
- Transport status.
- Destination station.
- Station operator receipt.
- Stay until receipt.

Test IDs:

- `driver-arrival-checklist`
- `driver-arrival-check-assignment`
- `driver-arrival-check-custody`
- `driver-arrival-check-transit`
- `driver-arrival-check-station`
- `driver-arrival-check-station-receipt`

### `StationHandoffProtocol`
Responsibilities:

- Explain physical counter process.
- Prevent package drop-off without backend receipt.

Test IDs:

- `driver-arrival-handoff-protocol`
- `driver-arrival-protocol-step`

### `ArrivalRiskPanel`
Responsibilities:

- Present recovery action for unsafe states.

Risk types:

- `wrong_assignment`
- `custody_mismatch`
- `status_not_ready`
- `offline`
- `stale`
- `already_received`
- `issue_lock`
- `terminal`

Test IDs:

- `driver-arrival-risk-panel`
- `driver-arrival-risk-title`
- `driver-arrival-risk-action`

### `ArrivalActionDock`
Responsibilities:

- Show context-aware primary and secondary actions.
- Keep actions reachable.

Primary actions:

- `Prepare station handoff`
- `Record in transit first`
- `Refresh delivery state`
- `Contact support`
- `View custody chain`
- `Back to runs`

Test IDs:

- `driver-arrival-primary-action`
- `driver-arrival-secondary-action`
- `driver-arrival-support-action`

## Content System
### Header Copy
Default:

- Title: `Destination arrival`
- Subtitle: `Prepare station handoff without losing custody control.`

Ready:

- Title: `Arrived at destination station`
- Subtitle: `Keep custody until the station receipt succeeds.`

Offline:

- Title: `Cached arrival details`
- Subtitle: `Verify station details, then refresh before handoff if possible.`

Blocked:

- Title: `Handoff not ready`
- Subtitle: `Do not leave the package until this is resolved.`

### Station Hero Copy
Station known:

- Label: `Destination station`
- Primary: `{stationName}`
- Secondary: `{destinationStationId}`
- Guidance: `Confirm this station ID with the operator before receipt.`

Station name unavailable:

- Label: `Destination station`
- Primary: `{destinationStationId}`
- Secondary: `Station name unavailable`
- Guidance: `Use the station ID and confirm with staff before handoff.`

### Custody Copy
Driver custody:

- `Custody is still with you.`
- `Do not leave the package until station receipt is confirmed.`

Custody mismatch:

- `Custody is not recorded under your driver account.`
- `Stop handoff and contact support.`

Station received:

- `Station receipt recorded.`
- `You no longer hold custody for this package.`

### Primary CTA Copy
Ready:

- `Prepare station handoff`

Needs transit:

- `Record in transit first`

Offline:

- `Review cached handoff steps`

Stale:

- `Refresh delivery state`

Blocked:

- `Contact support`

Already received:

- `View custody chain`

## State Specifications
### `loading`
Trigger:

- No cached detail and network request in progress.

UI:

- Skeleton for station hero.
- Skeleton for identity panel.
- Action dock disabled with `Loading delivery`.

Accessibility:

- Announce `Loading delivery state`.

### `ready_in_transit`
Trigger:

- Assignment matches current driver.
- Custody matches current driver.
- Status is `in_transit`.
- Fresh delivery detail.

UI:

- Station hero.
- Amber custody band.
- Checklist all passed except station receipt remains pending.
- Primary CTA `Prepare station handoff`.

### `ready_dispatched_attention`
Trigger:

- Assignment and custody match.
- Status is `dispatched_from_origin`.

UI:

- Amber transport status warning.
- Primary CTA `Record in transit first`.
- Secondary CTA `Prepare with station`.
- Explain that station receipt is station-owned.

### `offline_cached`
Trigger:

- Network unavailable and cached delivery detail exists.

UI:

- Offline strip.
- Cache age.
- Read-only station and protocol.
- Primary CTA `Review cached handoff steps`.

### `stale_data`
Trigger:

- Cached or server data older than threshold.

UI:

- Stale strip.
- Primary CTA `Refresh delivery state`.
- Handoff CTA disabled until refresh when network is available.

### `custody_mismatch`
Trigger:

- `currentCustodyRole !== "driver"` or actor does not match current driver.

UI:

- Red custody band.
- Checklist custody blocked.
- Primary CTA `Contact support`.
- Secondary CTA `View custody chain`.

### `wrong_assignment`
Trigger:

- `assignedDriverId` exists and does not match current user.

UI:

- Red assignment band.
- No package handoff preparation.
- Support action.

### `already_received`
Trigger:

- Status is `received_at_destination`, `awaiting_receiver_pickup`, `awaiting_final_mile_assignment`, `assigned_for_final_mile`, `out_for_delivery`, `delivered`, or `closed`.

UI:

- Green or neutral server-confirmed receipt state depending on status.
- No handoff CTA.
- Primary CTA `View custody chain`.

### `issue_reported`
Trigger:

- Current status is `issue_reported`.

UI:

- Issue panel.
- Explain normal destination handoff is paused.
- CTA `Contact support`.

### `terminal`
Trigger:

- Status is `cancelled`, `delivery_failed`, or `closed`.

UI:

- Terminal state panel.
- Primary CTA `Back to runs`.
- Secondary CTA `View delivery detail`.

### `not_found`
Trigger:

- `get_delivery` returns not found or inaccessible.

UI:

- Safe not-found message.
- No delivery sensitive data.
- CTA `Back to runs`.

### `session_expired`
Trigger:

- Auth error.

UI:

- Sign-in required panel.
- CTA `Sign in again`.

## Error Handling
Map errors to safe UI:

| Error | UI title | UI action |
| --- | --- | --- |
| `AUTH_REQUIRED` | `Sign in again` | Route to sign in |
| `FORBIDDEN_ROLE` | `Driver access required` | Back to home |
| `ASSIGNMENT_SCOPE_VIOLATION` | `This job is not assigned to you` | Contact support |
| `DELIVERY_NOT_FOUND` | `Delivery not found` | Back to runs |
| `INVALID_STATUS_TRANSITION` | `Delivery state changed` | Refresh |
| `CONFLICTING_HANDOFF_STATE` | `Handoff state changed` | View custody chain |
| `ISSUE_LOCK_ACTIVE` | `Issue review active` | Contact support |
| `RATE_LIMITED` if exposed by client layer | `Too many attempts` | Wait and retry |
| `UNKNOWN_INTERNAL_ERROR` | `Could not load arrival state` | Retry |

Do not show raw backend metadata to the driver.

## Accessibility Requirements
Structure:

- One `h1` for screen title.
- Logical heading order.
- Checklist uses semantic list or accessible grouped rows.
- Status strip uses accessible status semantics.
- Buttons have clear accessible names.

Touch:

- Primary actions at least `48dp` high on native mobile.
- Spacing must exceed WCAG 2.2 minimum target guidance.
- Avoid two critical actions immediately adjacent.

Screen reader:

- Announce refresh start and completion.
- Announce offline and stale transitions.
- Announce blocked state changes.
- Do not announce every checklist item on every refresh unless state changed.

Contrast:

- Custody, issue, and offline banners must pass contrast.
- Do not rely only on red, green, or amber.

Reduced motion:

- Disable slide transitions.
- Keep state changes instant with text update.

## Security And Privacy
Do:

- Show only delivery data needed for driver handoff.
- Mask or omit receiver phone.
- Omit full receiver address.
- Omit scan code.
- Omit payment references.
- Treat station ID as staff-safe.
- Log only safe event names.

Do not:

- Send receiver personal data to analytics.
- Send station coordinates to analytics unless aggregated and approved.
- Store location in delivery record from this screen.
- Persist local arrival notes as server facts.
- Expose support-only fields.

## Analytics
Allowed events:

- `driver_destination_arrival_viewed`
- `driver_destination_arrival_refresh_started`
- `driver_destination_arrival_refresh_succeeded`
- `driver_destination_arrival_refresh_failed`
- `driver_destination_arrival_ready`
- `driver_destination_arrival_blocked`
- `driver_destination_arrival_prepare_handoff_tapped`
- `driver_destination_arrival_record_transit_tapped`
- `driver_destination_arrival_support_tapped`
- `driver_destination_arrival_open_maps_tapped`

Allowed payload:

- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `custodyRole`
- `assignmentMatch`
- `offline`
- `cacheAgeBucket`
- `blockedReason`

Forbidden payload:

- Receiver phone.
- Receiver full address.
- Package scan code.
- Exact package description if sensitive.
- Raw location coordinates unless approved by privacy policy and platform settings.
- Free-text support notes.

## QA Acceptance Criteria
### Ready State
- Given status `in_transit`, matching assignment, and driver custody, the screen shows `Prepare station handoff`.
- Given ready state, the custody band says the driver still holds custody.
- Given ready state, the screen does not call `receive_destination`.
- Given ready state, tapping primary action routes to `/(ops)/driver/runs/:deliveryId/destination-handoff`.

### Missing Transit State
- Given status `dispatched_from_origin`, the screen shows `Record in transit first`.
- Given status `dispatched_from_origin`, station handoff preparation is secondary and clearly marked.
- Given status `dispatched_from_origin`, the screen does not claim server arrival.

### Wrong Assignment
- Given assigned driver does not match current user, the primary action is support.
- Given wrong assignment, receiver phone and full address are not visible.
- Given wrong assignment, destination handoff route is unavailable.

### Custody Mismatch
- Given custody is not driver-held, the screen shows a red blocked band.
- Given custody mismatch, primary action routes to support.
- Given custody mismatch, handoff preparation is blocked.

### Offline
- Given cached data and no network, the screen shows cache age.
- Given offline cached state, the screen still shows station ID.
- Given offline cached state, the screen does not claim station receipt.
- Given reconnect, the screen refreshes and resolves changed status.

### Already Received
- Given status `received_at_destination` or later, the screen removes handoff preparation.
- Given later station state, primary action routes to custody chain or run history.
- Given already received state, the copy says station receipt is server-confirmed.

### Accessibility
- Primary action is reachable by screen reader and keyboard-equivalent navigation.
- Status changes are announced without moving focus unnecessarily.
- All action targets meet field-friendly target size.
- All visual status indicators include text.

## Automated Test Plan
Unit tests:

- `deriveArrivalReadiness` returns ready for matching driver custody and `in_transit`.
- `deriveArrivalReadiness` returns attention for `dispatched_from_origin`.
- `deriveArrivalReadiness` blocks wrong assignment.
- `deriveArrivalReadiness` blocks custody mismatch.
- `deriveArrivalReadiness` returns already received for station-routed states.
- `getArrivalPrimaryAction` maps each readiness state to correct CTA.
- `sanitizeArrivalAnalyticsPayload` removes restricted fields.

Component tests:

- Renders `screen-driver-destination-arrival`.
- Renders destination station ID from detail.
- Renders cache age in offline state.
- Renders support CTA on blocked states.
- Does not render receiver phone.
- Does not render raw scan code.
- Does not expose `receive_destination` action.
- Routes to `DriverMarkInTransit` when `Record in transit first` is tapped.
- Routes to `DriverDestinationHandoff` when ready primary CTA is tapped.

Integration tests:

- Load cached detail, then replace with fresh server detail.
- Refresh after returning from external maps.
- Refresh after returning from `DriverMarkInTransit`.
- Handle `404`, `403`, and `409` safe messages.
- Offline to online transition updates the primary CTA.
- Already received server update removes handoff CTA.

End-to-end tests:

- Driver completes origin pickup, marks in transit, opens arrival, prepares handoff.
- Driver opens arrival before marking in transit, records in transit, returns ready.
- Driver at wrong assignment cannot continue.
- Driver offline can read station protocol but cannot complete receipt.
- Station receipt success appears when driver returns from handoff screen.

## Test IDs
Required test IDs:

- `screen-driver-destination-arrival`
- `driver-arrival-status-strip`
- `driver-arrival-cache-age`
- `driver-arrival-identity-panel`
- `driver-arrival-tracking-code`
- `driver-arrival-route-pair`
- `driver-arrival-station-hero`
- `driver-arrival-destination-station-id`
- `driver-arrival-open-maps`
- `driver-arrival-custody-band`
- `driver-arrival-custody-state`
- `driver-arrival-checklist`
- `driver-arrival-check-assignment`
- `driver-arrival-check-custody`
- `driver-arrival-check-transit`
- `driver-arrival-check-station`
- `driver-arrival-check-station-receipt`
- `driver-arrival-handoff-protocol`
- `driver-arrival-risk-panel`
- `driver-arrival-primary-action`
- `driver-arrival-secondary-action`
- `driver-arrival-support-action`

## Implementation Notes For Claude Code
Build `DriverDestinationArrival` as a driver-side station arrival readiness screen. It must load `get_delivery`, verify assignment, driver custody, destination station, and transport status, then route to `DriverDestinationHandoff` only as preparation for station-owned receipt. It must never call `receive_destination`, never create a server `arrived_at_destination` state, never show receiver phone or full receiver address, and never claim custody has moved from driver to station until the backend returns a station receipt or later state. Offline mode is read-only for arrival preparation and must show cache age and server-authority warnings.

## Done Definition
This screen is complete when:

- The route renders behind `screen-driver-destination-arrival`.
- The screen uses `get_delivery` as its authoritative backend read.
- Ready, attention, offline, stale, blocked, already received, and terminal states are implemented.
- Assignment and custody mismatch block handoff preparation.
- `dispatched_from_origin` routes the driver to `DriverMarkInTransit`.
- `in_transit` routes the driver to `DriverDestinationHandoff`.
- No driver-side code calls `receive_destination`.
- No UI claims destination receipt is complete from local state.
- No restricted receiver or scan data is displayed or logged.
- Accessibility, offline, and analytics tests pass.
- The implementation matches this markdown file and the frontend screen inventory.

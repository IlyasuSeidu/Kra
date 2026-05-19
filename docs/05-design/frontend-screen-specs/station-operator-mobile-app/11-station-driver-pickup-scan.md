# Station Driver Pickup Scan Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationDriverPickupScan` |
| App | `apps/mobile` |
| Route | `/(ops)/station/outbound/:deliveryId/driver-pickup` |
| Primary test ID | `screen-station-driver-pickup-scan` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `confirm_pickup` result from assigned driver, handoff event `origin_station_to_driver`, local pickup review cache |
| Related routes | `/(ops)/station/outbound`, `/(ops)/station/outbound/:deliveryId/assign-driver`, `/(ops)/station/outbound/:deliveryId/dispatch`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/offline-outbox`, `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| Required states | `loading`, `handoff_ready`, `waiting_for_driver_scan`, `driver_scan_seen`, `pickup_confirmed`, `pickup_failed`, `driver_mismatch`, `dispatch_not_prepared`, `driver_missing`, `status_blocked`, `payment_blocked`, `issue_blocked`, `offline_cached`, `stale_data`, `scope_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen lets the origin station supervise the final station-to-driver handoff. The assigned driver performs the pickup scan in the driver app; the station operator watches the handoff state, checks package identity, and confirms that custody moved only after the backend records driver pickup.

The screen answers one operational question: `Has the assigned driver scanned this exact package and accepted custody?`

The station operator should be able to:
- Confirm the package is assigned to a driver.
- Confirm dispatch readiness was prepared when policy requires it.
- Show the driver what to scan in their driver app.
- Watch for `confirm_pickup` completion by the assigned driver.
- See whether custody remains with station or has moved to driver.
- Detect driver mismatch, scan mismatch, stale data, or wrong status.
- Open support or custody chain when handoff cannot complete.
- Work from cached data while offline without falsely confirming custody.

This screen is not:
- A driver app pickup scan screen.
- A station mutation screen for `confirm_pickup`.
- A dispatch readiness screen.
- A driver assignment screen.
- A package label reprint screen.
- A delivery completion screen.
- A bulk handoff surface.

## Audience
Primary audience:
- Station operators supervising assigned driver pickup at the origin station.
- Station leads validating that packages leave station only after driver scan evidence.

Secondary audience:
- Claude Code implementing station-side handoff review.
- QA validating custody transfer boundaries.
- Driver app implementers matching the companion scan flow.
- Operations leads validating loss-prevention handoff policy.
- Security reviewers validating that station users do not call driver-only mutation.
- Accessibility reviewers validating polling, status, and recovery states.

## User State
The station operator is likely standing beside the package and the assigned driver. This is a high-risk handoff moment: if the wrong person takes the package or the scan is skipped, goods can be lost without a clean accountability trail.

The user may be:
- Coming from `StationDispatchReadiness` after readiness was recorded.
- Opening from `StationOutboundQueue` for a package waiting for pickup scan.
- Watching the assigned driver scan the package in their app.
- Checking whether custody has moved before releasing the package.
- Handling a driver mismatch or scanner failure.
- Working offline and needing to know that pickup cannot be confirmed locally.

The screen must:
- Make current custodian unmistakable.
- Show that station cannot confirm pickup on behalf of driver.
- Poll or refresh delivery/timeline evidence.
- Treat `driver_pickup_confirmed` and status `dispatched_from_origin` as the custody transfer proof.
- Keep package physically at station until backend confirms pickup.
- Never call `confirm_pickup` from station operator role.
- Never show `custody transferred` from cached or unconfirmed state.

## Backend Contract
Existing backend facts:
- `confirm_pickup` exists at `POST /v1/deliveries/:id/confirm-pickup`.
- Request body is `packageScanCode`, optional `fallbackUsed`, and optional `supervisorOverrideActorId`.
- Backend requires capability `confirm_pickup`.
- Driver role has `confirm_pickup`.
- Station operator role does not have `confirm_pickup`.
- Backend requires actor role `driver`.
- Backend requires `assignedDriverId === actor.actorId`.
- Backend requires current status `assigned_to_driver`.
- Backend validates package scan code against `package_labels` when configured.
- Success transitions delivery to `dispatched_from_origin`.
- Success sets `currentCustodyRole=driver`.
- Success records delivery event `driver_pickup_confirmed`.
- Success records handoff event `origin_station_to_driver`.

Station-side rule:
- This station screen must not call `confirm_pickup`.
- The assigned driver confirms pickup from the driver app.
- The station screen observes status and timeline changes after the driver action.

Current backend gap:
- No station pickup session endpoint exists.
- No real-time handoff subscription is defined beyond general delivery/timeline polling.
- No station-readable driver full name is guaranteed from `get_delivery`.

Production-ready recommendation:
- Add a station-visible pickup session or handoff monitor endpoint that shows assigned driver presence, driver app readiness, scan started, scan failed, and scan confirmed.
- Add safe assigned-driver display fields for station workflows.
- Keep actual custody mutation restricted to the assigned driver.

## Handoff Authority
Station can:
- View delivery and timeline.
- Confirm package should remain at station until driver scan succeeds.
- Open driver assignment when no driver exists.
- Open dispatch readiness when readiness checkpoint is missing.
- Open support or custody chain.
- Refresh/poll for driver pickup result.

Station cannot:
- Call `confirm_pickup`.
- Enter driver credentials.
- Scan package on behalf of driver for custody transfer.
- Mark package as left origin.
- Override assigned driver custody.
- Use admin user endpoints to resolve driver identity.

Driver must:
- Be assigned to the delivery.
- Use driver role.
- Scan package label in driver app.
- Submit `confirm_pickup`.
- Accept custody through backend success.

## Eligible Delivery States
Station review is allowed when:
- `assigned_to_driver`

Pickup already completed when:
- `dispatched_from_origin`
- `in_transit`

Blocked:
- `received_at_origin`: assign driver first.
- `awaiting_driver_assignment`: assign driver first.
- `created`: package intake first.
- `received_at_destination`: no origin pickup work.
- `awaiting_receiver_pickup`: destination pickup.
- `awaiting_final_mile_assignment`: final-mile queue.
- `assigned_for_final_mile`: final-mile workflow.
- `out_for_delivery`: courier workflow.
- `delivered`, `closed`, `cancelled`, `delivery_failed`: terminal or closed work.
- `issue_reported`, `on_hold`: blocked queue.

Status copy:
- `assigned_to_driver`: `Waiting for driver scan`
- `dispatched_from_origin`: `Driver custody confirmed`
- `in_transit`: `Driver has package`
- blocked status: `Pickup review not available`

## Data Sources
Required delivery source:
- `GET /v1/deliveries/:id`

Required timeline source:
- `GET /v1/deliveries/:id/timeline`

Observed backend result:
- `driver_pickup_confirmed` delivery event.
- `origin_station_to_driver` handoff event.
- Delivery status `dispatched_from_origin`.
- Current custody role `driver`.
- Current custody actor equals assigned driver.

Local source:
- Outbound queue cache.
- Dispatch readiness local receipt.
- Driver assignment local receipt.
- Handoff monitor local state.

Required delivery fields:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `assignedDriverId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `receiver.name`
- `serviceType`
- `doorstepRequested`
- `latestEvent`

Required timeline evidence:
- `delivery_dispatched_from_origin` readiness checkpoint when present.
- `driver_pickup_confirmed` pickup event.
- `origin_station_to_driver` handoff event.
- Handoff proof type `package_scan`.
- Handoff proof fallback flag when present.

Sensitive data handling:
- `GET /v1/deliveries/:id` currently returns the full receiver object.
- This screen may receive receiver phone or address in the delivery detail payload.
- Do not render receiver phone or full address.
- Do not write receiver phone or full address into durable station cache.
- Do not log receiver phone or full address.
- Do not send receiver phone or full address to analytics.
- If a future mobile-safe redacted delivery detail endpoint exists, prefer it for this screen.

Do not call:
- `confirm_pickup` from station role.
- Admin user list.
- Payment provider endpoints.

## Pickup Handoff Model
The station-side handoff has four phases:
1. `Not ready`: driver missing, dispatch not prepared, payment blocked, wrong status, or issue blocked.
2. `Ready for driver scan`: assigned driver and package are ready; station still holds custody.
3. `Waiting for backend confirmation`: driver is scanning in their app; station polls delivery and timeline.
4. `Pickup confirmed`: backend records `driver_pickup_confirmed`; custody is driver.

Station release rule:
- Station operator may physically release the package only after `pickup_confirmed`.
- If network is offline, release is blocked because custody transfer cannot be confirmed.
- If the driver says scan succeeded but station screen is stale, refresh before release.

Driver mismatch rule:
- If backend shows current custody actor differs from assigned driver, route support and custody chain.
- If a different driver arrives, route to driver assignment or support before pickup.
- Do not let station approve a different driver from this screen.

## Screen Structure
Order:
1. Handoff status banner.
2. Delivery and assigned driver identity.
3. Custody state card.
4. Readiness checklist.
5. Driver action instruction.
6. Timeline monitor.
7. Confirmation result.
8. Recovery actions.
9. Audit details.

### Handoff Status Banner
Ready:
- Title: `Ready for driver scan`
- Body: `Ask the assigned driver to scan this package in their driver app.`

Waiting:
- Title: `Waiting for pickup confirmation`
- Body: `Keep the package at station until backend confirms driver custody.`

Confirmed:
- Title: `Driver custody confirmed`
- Body: `The assigned driver accepted custody. This package can leave origin station.`

Blocked:
- Title: `Pickup blocked`
- Body: `Resolve the blocker before releasing this package.`

Offline:
- Title: `Pickup cannot be confirmed offline`
- Body: `Reconnect before releasing this package to the driver.`

### Delivery And Driver Identity
Show:
- Tracking code.
- Delivery ID.
- Destination station.
- Receiver name.
- Service type.
- Doorstep indicator.
- Assigned driver label.
- Current status.
- Payment confirmed label.

Driver label rules:
- Show safe driver name only if available from local assignment receipt or future station driver endpoint.
- Otherwise show `Assigned driver` plus ID suffix.
- Do not call admin user endpoints for driver details.

Do not show:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full package label code.
- Driver phone.
- Driver email.

### Custody State Card
Before confirmation:
- Label: `Current custodian`
- Value: `Origin station`
- Note: `Driver pickup scan has not been confirmed.`

After confirmation:
- Label: `Current custodian`
- Value: `Driver`
- Note: `Pickup confirmed by assigned driver.`

Mismatch:
- Label: `Custody mismatch`
- Value: `Needs review`
- Note: `Open custody chain before releasing this package.`

### Readiness Checklist
Checklist items:
- `Driver assigned`
- `Package still at origin station`
- `Payment confirmed`
- `Dispatch readiness recorded`
- `No active issue blocker`
- `Driver pickup not yet confirmed`

Dispatch readiness rule:
- If timeline shows `delivery_dispatched_from_origin`, mark pass.
- If no readiness evidence exists, show `Dispatch readiness not recorded`.
- Because current backend does not require readiness before `confirm_pickup`, station UI must still route to `StationDispatchReadiness` before release policy is satisfied.

### Driver Action Instruction
Title:
- `Driver action required`

Body:
- `The assigned driver must open their pickup scan and scan the package label.`

Primary station action:
- `Refresh status`

Secondary station action:
- `Open custody chain`
- `Open support`

Driver deep link:
- Only shown if the app can deep link to the driver app on the same device or handoff terminal.
- Do not expose driver-only mutation in station role.

### Timeline Monitor
Show:
- Latest delivery event.
- Latest handoff event.
- Last refresh time.
- Pickup event status.

Polling:
- Poll every `10 seconds` while online and visible.
- Stop polling when app backgrounds.
- Stop polling after confirmed pickup.
- Let user manually refresh.

Status messages:
- `Waiting for driver scan`
- `Driver scan confirmed`
- `Pickup still pending`
- `Data stale`

## Primary Action Logic
Primary action by state:
- `loading`: wait.
- `handoff_ready`: `Refresh status`
- `waiting_for_driver_scan`: `Refresh status`
- `driver_scan_seen`: `Refresh status`
- `pickup_confirmed`: `Back to outbound`
- `pickup_failed`: `Open support`
- `driver_mismatch`: `Open custody chain`
- `dispatch_not_prepared`: `Prepare dispatch`
- `driver_missing`: `Assign driver`
- `status_blocked`: route by current status.
- `payment_blocked`: `Open blocked queue`
- `issue_blocked`: `Open blocked queue`
- `offline_cached`: `Back to outbound`
- `stale_data`: `Refresh`
- `scope_blocked`: `Back to role home`
- `not_found`: `Back to outbound`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Secondary actions:
- `Open delivery detail`
- `Open custody chain`
- `Open support`
- `Back to outbound`
- `Assign driver`
- `Prepare dispatch`

Blocked behavior:
- Do not call `confirm_pickup`.
- Do not release package while offline.
- Do not show confirmed custody from cached state.
- Do not let station select a different driver here.
- Do not skip dispatch readiness when policy requires it.
- Do not hide driver mismatch.

## Offline Rules
This screen is offline-critical for reading context, not for confirming pickup.

Offline allowed:
- Show cached delivery identity.
- Show cached assigned driver label.
- Show cached dispatch readiness.
- Show cached custody chain.
- Show last known pickup status.

Offline blocked:
- Confirming pickup.
- Verifying driver scan completion.
- Releasing package.
- Creating new support issue unless offline issue outbox supports it.

Offline copy:
- Title: `Showing cached pickup status`
- Body: `Do not release this package until the app reconnects and confirms driver custody.`
- Action: `Back to outbound`

Stale threshold:
- Under `2 minutes`: show cached marker.
- `2-5 minutes`: show warning.
- Over `5 minutes`: block any release guidance and require refresh.

Conflict handling:
- If refresh shows `dispatched_from_origin`, move to confirmed.
- If refresh shows different status, route to correct workflow.
- If current custody actor differs from assigned driver, show driver mismatch.

## Error Mapping
Driver missing:
- State: `driver_missing`
- Message: `A driver must be assigned before pickup.`
- Action: `Assign driver`

Dispatch not prepared:
- State: `dispatch_not_prepared`
- Message: `Prepare dispatch before driver pickup review.`
- Action: `Prepare dispatch`

Payment not confirmed:
- State: `payment_blocked`
- Message: `Payment must be confirmed before pickup.`
- Action: `Open blocked queue`

Invalid status:
- State: `status_blocked`
- Message: `Pickup review is not available from this status.`
- Action: `Back to outbound`

Driver mismatch:
- State: `driver_mismatch`
- Message: `Custody or driver assignment does not match.`
- Action: `Open custody chain`

Pickup failed:
- State: `pickup_failed`
- Message: `Driver pickup was not confirmed. Keep the package at station.`
- Action: `Open support`

Offline:
- State: `offline_cached`
- Message: `Reconnect before releasing this package.`
- Action: `Back to outbound`

Stale data:
- State: `stale_data`
- Message: `Pickup status may have changed. Refresh before release.`
- Action: `Refresh`

Station scope violation:
- State: `scope_blocked`
- Message: `This package is outside your station scope.`
- Action: `Back to role home`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to review this pickup.`
- Action: `Back to role home`

Delivery not found:
- State: `not_found`
- Message: `Delivery record not found.`
- Action: `Back to outbound`

Session expired:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

API failure:
- State: `api_error`
- Message: `Pickup status could not be loaded.`
- Action: `Retry`

## Copy System
Voice:
- Direct.
- Cautious.
- Custody-aware.
- Short.

Screen title:
- `Driver pickup`

Subtitle:
- `Wait for the assigned driver scan before release.`

Primary station CTA:
- `Refresh status`

Confirmed title:
- `Driver custody confirmed`

Confirmed body:
- `The assigned driver accepted custody. The package can leave origin station.`

Pending warning:
- `Do not release this package until pickup is confirmed.`

Critical reminder:
- `Only the assigned driver can confirm pickup.`

## Visual System Direction
This screen should feel like a handoff control point, not a passive status page.

Visual thesis:
- A custody-first monitor with a strong pending/confirmed contrast and no ambiguous release state.

Layout:
- Top status banner.
- Custody card immediately visible.
- Delivery and driver identity below.
- Checklist before instructions.
- Timeline monitor near the bottom.
- Sticky refresh or recovery action.

Color:
- Pending: amber.
- Confirmed: controlled green.
- Mismatch or blocked: rust/red.
- Offline: blue-gray.
- Neutral identity: slate.

Typography:
- Custody state is the largest text after title.
- Tracking code uses tabular numerals.
- Warnings are short and bold.

Motion:
- Poll refresh uses subtle status pulse.
- Confirmation can use one restrained transition.
- No looping animations.
- Respect reduced motion.

Density:
- One package only.
- One custody truth at a time.
- Avoid multiple action buttons competing with the release rule.

## Component Inventory
Components:
- `DriverPickupHeader`
- `DriverPickupStatusBanner`
- `PickupDeliveryCard`
- `AssignedDriverCard`
- `CustodyStateCard`
- `PickupReadinessChecklist`
- `DriverActionInstruction`
- `PickupTimelineMonitor`
- `PickupResultPanel`
- `PickupOfflineBanner`
- `PickupBlockedState`
- `PickupRecoveryActions`

### `DriverPickupHeader`
Props:
- `trackingCode`
- `stationId`
- `lastUpdatedAt`
- `isOffline`
- `isPolling`

Responsibilities:
- Orient user.
- Show station scope and freshness.

### `CustodyStateCard`
Props:
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedDriverId`
- `pickupConfirmedAt`
- `isOffline`
- `isStale`

Responsibilities:
- Show who is accountable now.
- Prevent release before confirmed custody.

### `PickupReadinessChecklist`
Props:
- `driverAssigned`
- `dispatchPrepared`
- `paymentConfirmed`
- `stationScopeOk`
- `issueClear`
- `pickupAlreadyConfirmed`

Responsibilities:
- Explain why pickup is ready or blocked.
- Route missing prerequisites.

### `DriverActionInstruction`
Props:
- `assignedDriverLabel`
- `driverDeepLinkAvailable`
- `lastPollAt`

Responsibilities:
- Tell station operator what the driver must do.
- Avoid exposing driver mutation.

### `PickupTimelineMonitor`
Props:
- `latestDeliveryEvent`
- `latestHandoffEvent`
- `pickupEvent`
- `lastRefreshAt`

Responsibilities:
- Show backend proof.
- Announce status changes.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Handoff status banner.
3. Custody state.
4. Delivery identity.
5. Assigned driver identity.
6. Readiness checklist.
7. Driver action instruction.
8. Timeline monitor.
9. Primary action.
10. Recovery actions.

Required labels:
- Custody card announces current custodian.
- Pending state announces package should stay at station.
- Confirmed state is announced as a status message.
- Offline state announces that release is blocked.
- Refresh action announces last update.

Touch targets:
- Refresh action meets mobile target size.
- Recovery actions are easy to tap.
- Checklist route actions are not icon-only.

Focus:
- Initial focus lands on screen title.
- After refresh, focus remains stable unless pickup confirms.
- When pickup confirms, focus moves to confirmed heading.
- On mismatch, focus moves to mismatch heading.
- On offline warning, focus moves to offline title.

Reduced motion:
- Disable polling pulse.
- Confirmation state changes instantly.
- No animated handoff graphics.

## Security And Privacy
Allowed on screen:
- Tracking code.
- Delivery ID.
- Destination station.
- Receiver name.
- Service type.
- Assigned driver ID suffix or safe driver name.
- Current custody role.
- Pickup event status.
- Handoff event status.

Not allowed on screen:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full package label code.
- Driver phone.
- Driver email.
- Admin user fields.

Allowed in analytics:
- `deliveryId`
- `stationId`
- `assignedDriverPresent`
- `currentStatus`
- `currentCustodyRole`
- `pickupState`
- `blockReason`
- `isOffline`

Disallowed in analytics:
- `packageScanCode`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `driverName`
- `paymentProviderReference`

## Analytics
Events:
- `station_driver_pickup_viewed`
- `station_driver_pickup_poll_started`
- `station_driver_pickup_refreshed`
- `station_driver_pickup_confirmed_seen`
- `station_driver_pickup_driver_mismatch_seen`
- `station_driver_pickup_dispatch_missing`
- `station_driver_pickup_blocked`
- `station_driver_pickup_offline_cache_viewed`
- `station_driver_pickup_custody_opened`
- `station_driver_pickup_support_opened`
- `station_driver_pickup_assignment_opened`
- `station_driver_pickup_dispatch_opened`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `currentStatus`
- `currentCustodyRole`
- `assignedDriverPresent`
- `pickupState`
- `blockReason`
- `isOffline`
- `sourceRoute`

Disallowed payload fields:
- `packageScanCode`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `driverName`
- `paymentProviderReference`

## QA Acceptance Criteria
Authority:
- Station role never calls `confirm_pickup`.
- Driver-only mutation is not exposed from this screen.
- Station sees pickup confirmation only from delivery or timeline refresh.
- Copy says only assigned driver can confirm pickup.

Eligibility:
- `assigned_to_driver` with assigned driver shows handoff ready.
- Missing driver routes to assignment.
- Missing dispatch readiness routes to dispatch readiness.
- Pending payment routes blocked.
- Issue status routes blocked.
- Wrong station scope blocks review.

Custody:
- Before confirmation, custody card says origin station.
- After `driver_pickup_confirmed`, custody card says driver.
- Status `dispatched_from_origin` shows confirmed.
- Offline cached state never says confirmed unless previously confirmed before going offline.
- Driver mismatch routes custody chain.

Timeline:
- Polling starts when screen visible and online.
- Polling stops after confirmation.
- Manual refresh updates state.
- Timeline monitor shows pickup event when present.
- Handoff event `origin_station_to_driver` is displayed as proof.

Offline:
- Cached state renders.
- Release guidance is blocked offline.
- Stale age is visible.
- Over stale threshold requires refresh.

Accessibility:
- Custody state is announced.
- Confirmation is announced.
- Offline warning is announced.
- Refresh state is announced.
- Large text keeps custody and action visible.

Privacy:
- Receiver phone and address never appear.
- Full package label code never appears.
- Driver contact details never appear.
- Analytics exclude receiver, driver name, scan code, and payment provider data.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/driver-pickup-scan`

Recommended state holder:
- `useStationDriverPickupScanScreen`

Recommended selectors:
- `selectPickupReviewEligibility`
- `selectPickupCustodyState`
- `selectPickupTimelineEvidence`
- `selectPickupReadinessChecklist`
- `selectPickupPrimaryAction`
- `selectPickupPollingPolicy`
- `selectPickupErrorState`

Recommended API hooks:
- `useGetDeliveryQuery`
- `useGetDeliveryTimelineQuery`

Do not use:
- `useConfirmPickupMutation` in station role.
- Admin user list.
- Payment provider endpoints.

Polling:
- Use visibility-aware polling.
- Poll delivery detail and timeline together.
- Stop after pickup confirmed.
- Surface stale state when polling fails.

## Implementation Guardrails
Must use:
- Delivery detail.
- Timeline evidence.
- Station scope.
- Assigned driver evidence.
- Dispatch readiness evidence.
- Polling or manual refresh.

Must show:
- Current custodian.
- Assigned driver state.
- Readiness checklist.
- Driver action instruction.
- Pickup confirmation proof.
- Offline warning.
- Recovery actions.

Must not:
- Call `confirm_pickup` from station screen.
- Mark custody transferred from cache alone.
- Release package while offline.
- Use admin user API for driver details.
- Hide driver mismatch.
- Show sensitive receiver, driver, payment, or full scan data.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [GS1 Global Traceability Standard](https://www.gs1.org/standards/gs1-global-traceability-standard/current-standard): supports capturing who, where, when, and why dimensions at scan and handoff points.
- [GS1 logistic label guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3): supports right-label/right-logistic-unit checks and scannable logistics labels.
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports stable scannable identifiers for physical goods movement.
- [ML Kit barcode scanning for Android](https://developers.google.com/ml-kit/vision/barcode-scanning/android): supports driver-side camera scan implementation context.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): supports explicit cached state and stale data handling.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible polling, confirmation, mismatch, and offline status updates.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports usable refresh and recovery controls.

Design translation:
- The handoff UI must separate station review from driver custody acceptance.
- Barcode scan evidence is the key proof, but it belongs to the driver mutation.
- Traceability requires actor, location, time, and scan proof to be visible in the handoff timeline.
- Offline state must never create false custody confidence.
- Status changes from polling must be announced accessibly.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/outbound/:deliveryId/driver-pickup`.
- The top-level test ID is `screen-station-driver-pickup-scan`.
- Station role does not call `confirm_pickup`.
- Pickup confirmation is detected from delivery status, custody fields, and timeline events.
- Missing assignment routes to driver assignment.
- Missing dispatch readiness routes to dispatch readiness.
- Offline state blocks release guidance.
- Copy says assigned driver must scan in driver app.
- Sensitive receiver, driver, payment, and scan data are excluded.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Station cannot call driver-only pickup mutation.
- Custody is clear before and after pickup confirmation.
- Timeline evidence drives confirmed state.
- Missing prerequisites route correctly.
- Offline cache is useful but conservative.
- Driver mismatch is visible and recoverable.
- Accessibility covers polling, pending, confirmed, mismatch, and offline states.
- Analytics exclude receiver, driver name, scan code, and payment provider data.

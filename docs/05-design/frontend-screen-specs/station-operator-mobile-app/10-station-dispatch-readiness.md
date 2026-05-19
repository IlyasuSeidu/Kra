# Station Dispatch Readiness Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationDispatchReadiness` |
| App | `apps/mobile` |
| Route | `/(ops)/station/outbound/:deliveryId/dispatch` |
| Primary test ID | `screen-station-dispatch-readiness` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `dispatch_delivery`, `dispatchDeliveryRequestSchema`, package label registry validation, local dispatch readiness outbox |
| Related routes | `/(ops)/station/outbound`, `/(ops)/station/outbound/:deliveryId/assign-driver`, `/(ops)/station/outbound/:deliveryId/driver-pickup`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `scan_ready`, `scan_active`, `scan_matched`, `manual_entry_required`, `supervisor_override_required`, `review_ready`, `dispatching`, `dispatch_success`, `already_prepared`, `offline_queue_ready`, `offline_queued`, `payment_blocked`, `driver_missing`, `status_blocked`, `scan_mismatch`, `scope_blocked`, `stale_data`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen records that an assigned package has been scanned and is ready for the assigned driver pickup process. It creates a dispatch readiness checkpoint without transferring custody.

The screen answers one operational question: `Has the origin station verified this exact package for the assigned driver before pickup?`

The station operator should be able to:
- Confirm the package is assigned to a driver.
- Scan the package label.
- See whether the scan matches the delivery.
- Use supervised fallback when scanning fails.
- Review the readiness checkpoint before submit.
- Call `dispatch_delivery` only with a verified package scan code.
- Queue dispatch readiness offline only when safe.
- Continue to driver pickup review after readiness is recorded.
- Recover from payment, missing driver, wrong status, scan mismatch, stale data, and station scope blockers.

This screen is not:
- A driver assignment screen.
- A driver pickup custody transfer screen.
- A driver run acceptance screen.
- A package intake screen.
- A package label reprint screen.
- A delivery completion screen.
- A bulk dispatch surface.

## Audience
Primary audience:
- Station operators preparing assigned packages for driver pickup.
- Station leads validating outbound scan discipline.

Secondary audience:
- Claude Code implementing dispatch readiness flow.
- QA validating scan, fallback, offline, and status rules.
- Backend engineers validating event semantics.
- Operations leads validating custody control.
- Accessibility reviewers validating scanner, review, and recovery states.

## User State
The operator is likely standing with a package in hand, the assigned driver nearby, and outbound pressure building. The screen must reduce mistakes: one package, one scan, one readiness checkpoint.

The user may be:
- Coming from `StationDriverAssignment` after assigning a driver.
- Opening from `StationOutboundQueue` for an `assigned_to_driver` row.
- Re-scanning a package after scanner failure.
- Using manual label entry with supervisor approval.
- Working offline with a fresh assignment snapshot.
- Opening a package that is already dispatch-prepared.
- Discovering the package is not assigned or is outside station scope.

The screen must:
- Require delivery status `assigned_to_driver`.
- Require `assignedDriverId`.
- Require package scan code.
- Preserve station custody after success.
- Record readiness through `dispatch_delivery`.
- Never call `confirm_pickup`.
- Never show `left station` before driver pickup succeeds.
- Never trust manual package code without supervisor override.

## Backend Contract
Existing backend facts:
- `dispatch_delivery` exists at `POST /v1/deliveries/:id/dispatch`.
- Request body is `packageScanCode`, optional `fallbackUsed`, and optional `supervisorOverrideActorId`.
- Route capability is `confirm_dispatch`.
- Backend checks station scope against `originStationId`.
- Backend requires `assignedDriverId`.
- Backend requires current status `assigned_to_driver`.
- Backend validates package scan code against `package_labels` when package label repository is configured.
- Backend records event type `delivery_dispatched_from_origin`.
- Backend keeps current delivery status as `assigned_to_driver`.
- Backend metadata includes `handoffConfirmationStatus: awaiting_driver_pickup_confirmation`.

Important semantics:
- `dispatch_delivery` is readiness, not custody transfer.
- Driver pickup confirmation later changes status to `dispatched_from_origin`.
- The screen must treat a successful `dispatch_delivery` as `Awaiting pickup scan`, not `Left origin station`.

Current list limitation:
- The outbound queue list cannot know whether `delivery_dispatched_from_origin` checkpoint has already been recorded.
- This screen must fetch `get_delivery_timeline` to detect already-prepared state.

Driver data limitation:
- `get_delivery` exposes `assignedDriverId`.
- It does not expose driver full name.
- Do not call admin user list from station app to resolve driver names.
- Use driver name only if it is available from safe local assignment cache or future station driver endpoint.
- Otherwise show driver ID suffix and `Driver assigned`.

## Readiness Authority
Dispatch readiness is allowed when:
- User role is `station_operator`.
- User station matches delivery `originStationId`.
- Delivery status is exactly `assigned_to_driver`.
- Delivery has `assignedDriverId`.
- Payment status is `confirmed`.
- Package scan code matches the immutable package label binding.
- No active issue blocks movement.
- Delivery data is fresh enough or offline queue rules pass.

Dispatch readiness is blocked when:
- Delivery has no assigned driver.
- Current status is not `assigned_to_driver`.
- Payment is not confirmed.
- Package scan code mismatches delivery.
- User station differs from origin station.
- Package is already prepared and awaiting pickup scan.
- Delivery has moved to `dispatched_from_origin`, `in_transit`, destination, final-mile, terminal, or blocked status.
- Manual entry lacks supervisor override.

Result of success:
- Readiness event is recorded.
- Current delivery status remains `assigned_to_driver`.
- Custody remains `station_operator`.
- Next route is `StationDriverPickupScan`.

## Eligible Delivery States
Allowed:
- `assigned_to_driver`

Blocked:
- `received_at_origin`: assign driver first.
- `awaiting_driver_assignment`: assign driver first.
- `created`: receive package first.
- `dispatched_from_origin`: pickup already confirmed.
- `in_transit`: driver workflow.
- `received_at_destination`: inbound queue.
- `awaiting_receiver_pickup`: destination pickup.
- `awaiting_final_mile_assignment`: final-mile queue.
- `assigned_for_final_mile`: final-mile workflow.
- `out_for_delivery`: courier workflow.
- `delivered`, `closed`, `cancelled`, `delivery_failed`: no origin dispatch work.
- `issue_reported`, `on_hold`: blocked queue.

Status copy:
- `assigned_to_driver`: `Ready for dispatch scan`
- `received_at_origin`: `Driver not assigned`
- `awaiting_driver_assignment`: `Driver not assigned`
- `dispatched_from_origin`: `Pickup already confirmed`
- blocked status: `Cannot prepare dispatch from this state`

## Data Sources
Required delivery source:
- `GET /v1/deliveries/:id`

Required timeline source:
- `GET /v1/deliveries/:id/timeline`

Mutation:
- `POST /v1/deliveries/:id/dispatch`

Local source:
- Outbound queue cache.
- Driver assignment local receipt.
- Package label first-print local record.
- Dispatch readiness outbox.
- Scanner result cache for current session.

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
- Event type `delivery_dispatched_from_origin`.
- Event timestamp.
- Event station.
- Event metadata `packageScanCode` when exposed.
- Event metadata `handoffConfirmationStatus`.

Do not fetch:
- Receiver phone.
- Receiver full address.
- Payment provider reference.
- Admin user list.

## Package Scan Model
Preferred scan mode:
- Camera scan of package label code.

Secondary scan mode:
- External scanner keyboard wedge input.

Fallback mode:
- Manual package code entry with supervisor override.

Forbidden:
- Manual entry without supervisor.
- Package code copied from delivery detail and submitted without physical verification.
- Scan result reused across another delivery.
- Full package code in analytics.

Scan success:
- Compare scanned code against expected package label evidence when locally available.
- Submit scanned code to backend for authoritative validation.
- Show `Scan matched` only when local expected code matches or backend success returns.

Scan mismatch:
- Show clear mismatch state.
- Do not submit again automatically.
- Offer rescan, custody chain, and support.

Manual fallback:
- Requires reason: `scanner_unavailable`, `label_damaged`, `camera_permission_denied`, `scanner_hardware_failure`.
- Requires supervisor override actor ID.
- Sets `fallbackUsed=true`.
- Sends `supervisorOverrideActorId`.

## Screen Structure
Order:
1. Readiness banner.
2. Delivery and assigned driver identity.
3. Custody reminder.
4. Package scan panel.
5. Scan result panel.
6. Fallback supervisor panel.
7. Dispatch review card.
8. Submit and recovery actions.
9. Audit details.

### Readiness Banner
Ready:
- Title: `Scan package for dispatch`
- Body: `Verify this package before the assigned driver pickup scan.`

Already prepared:
- Title: `Dispatch already prepared`
- Body: `This package is waiting for driver pickup confirmation.`

Driver missing:
- Title: `Driver not assigned`
- Body: `Assign a driver before dispatch readiness.`

Payment blocked:
- Title: `Payment blocks dispatch`
- Body: `Payment must be confirmed before transport movement.`

Status blocked:
- Title: `Cannot dispatch from this state`
- Body: `Open the correct workflow for the current package status.`

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
- If driver name is available from safe station driver source, show name.
- If not, show `Driver assigned` plus driver ID suffix.
- Do not call admin user endpoints to enrich driver name.

Do not show:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Provider reference.
- Full package label code before scan.

### Custody Reminder
Copy:
- Title: `Custody remains with station`
- Body: `This scan prepares pickup. Driver custody starts only after pickup confirmation.`

This reminder must be visible before submit.

### Package Scan Panel
Scan action:
- `Scan package label`

Scan instructions:
- `Point the camera at the package label code.`
- `Use the physical package label, not a code from another screen.`

Camera permission denied:
- Title: `Camera access needed`
- Body: `Enable camera access or use supervised manual entry.`

Scanner unavailable:
- Title: `Scanner unavailable`
- Body: `Try again or use supervisor fallback.`

### Scan Result Panel
Matched:
- Title: `Package matched`
- Body: `The scanned label belongs to this delivery.`

Mismatch:
- Title: `Package does not match`
- Body: `Do not dispatch. Rescan the package or open custody chain.`

Unknown local expected code:
- Title: `Scan captured`
- Body: `Backend will verify this package code when you submit.`

### Dispatch Review Card
Review fields:
- Tracking code.
- Destination station.
- Assigned driver.
- Scan method.
- Fallback used.
- Supervisor override when used.
- Custody reminder.

Confirmation checkbox:
- `I verified the physical package label.`

Primary action:
- `Mark ready for pickup`

Success:
- `Ready for pickup scan`

## Primary Action Logic
Primary action by state:
- `loading`: wait.
- `scan_ready`: `Scan package label`
- `scan_active`: wait.
- `scan_matched`: `Review dispatch`
- `manual_entry_required`: `Enter code with supervisor`
- `supervisor_override_required`: `Add supervisor`
- `review_ready`: `Mark ready for pickup`
- `dispatching`: wait.
- `dispatch_success`: `Continue to pickup review`
- `already_prepared`: `Continue to pickup review`
- `offline_queue_ready`: `Queue dispatch readiness`
- `offline_queued`: `Open offline outbox`
- `payment_blocked`: `Open blocked queue`
- `driver_missing`: `Assign driver`
- `status_blocked`: route by current status.
- `scan_mismatch`: `Rescan`
- `scope_blocked`: `Back to role home`
- `stale_data`: `Refresh`
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
- `Continue to pickup review`

Blocked behavior:
- Do not submit without package scan code.
- Do not submit manual code without supervisor override.
- Do not submit if status is not `assigned_to_driver`.
- Do not submit if payment is not confirmed.
- Do not submit if driver is missing.
- Do not call `confirm_pickup`.
- Do not show `Left origin station` on success.

## Offline Rules
This screen is offline-critical when dispatch readiness can be queued safely.

Offline queue allowed when:
- Delivery snapshot is less than `5 minutes` old.
- Current status is `assigned_to_driver`.
- Payment status is `confirmed`.
- `assignedDriverId` exists.
- Station scope is verified.
- Physical package scan was captured in this session.
- Outbox can store idempotent route key `dispatch_delivery`.

Offline queue blocked when:
- Package scan is missing.
- Manual fallback lacks supervisor override.
- Delivery snapshot is older than `5 minutes`.
- Status is not `assigned_to_driver`.
- Payment is not confirmed.
- Driver is missing.
- Existing timeline already shows dispatch readiness.
- Outbox is unhealthy.

Offline queued copy:
- Title: `Dispatch readiness queued`
- Body: `Keep the package at station until sync confirms readiness.`
- Action: `Open offline outbox`

Queued action payload:
- `deliveryId`
- `packageScanCode`
- `fallbackUsed`
- `supervisorOverrideActorId`
- `snapshotStatus`
- `snapshotPaymentStatus`
- `snapshotAssignedDriverId`
- `snapshotOriginStationId`
- `idempotencyKey`

Conflict on replay:
- If readiness already exists for same delivery and scan code, mark action succeeded.
- If package scan mismatch occurs, mark blocked and route custody chain.
- If status changed from `assigned_to_driver`, mark stale.
- If payment is no longer confirmed, route blocked queue.

## Error Mapping
Driver missing:
- State: `driver_missing`
- Message: `A driver must be assigned before dispatch readiness.`
- Action: `Assign driver`

Payment not confirmed:
- State: `payment_blocked`
- Message: `Payment must be confirmed before dispatch readiness.`
- Action: `Open blocked queue`

Invalid status:
- State: `status_blocked`
- Message: `This package cannot be prepared from its current status.`
- Action: `Back to outbound`

Already prepared:
- State: `already_prepared`
- Message: `Dispatch readiness is already recorded.`
- Action: `Continue to pickup review`

Scan mismatch:
- State: `scan_mismatch`
- Message: `The scanned package label is bound to a different delivery.`
- Action: `Rescan`

Unregistered scan:
- State: `scan_mismatch`
- Message: `This package label is not registered.`
- Action: `Open custody chain`

Supervisor missing:
- State: `supervisor_override_required`
- Message: `Manual code entry requires supervisor approval.`
- Action: `Add supervisor`

Stale data:
- State: `stale_data`
- Message: `Delivery data may have changed. Refresh before dispatch readiness.`
- Action: `Refresh`

Station scope violation:
- State: `scope_blocked`
- Message: `This package is outside your station scope.`
- Action: `Back to role home`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to prepare dispatch.`
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
- Message: `Dispatch readiness could not be recorded.`
- Action: `Retry`

## Copy System
Voice:
- Precise.
- Custody-aware.
- Calm.
- Short.

Screen title:
- `Dispatch readiness`

Subtitle:
- `Scan the package before driver pickup.`

Primary CTA:
- `Mark ready for pickup`

Success title:
- `Ready for pickup scan`

Success body:
- `Driver pickup confirmation is still required before the package leaves station custody.`

Mismatch title:
- `Wrong package`

Critical reminder:
- `Dispatch readiness is not custody transfer.`

## Visual System Direction
This screen should feel like a scanner-first station checkpoint.

Visual thesis:
- A physical-verification screen with a strong scan target, unmistakable match state, and explicit custody boundary.

Layout:
- Top context card.
- Large scanner panel.
- Match result directly below scanner.
- Review card after match.
- Sticky bottom action.

Color:
- Scan ready: blue.
- Match: green.
- Mismatch: red.
- Manual fallback: amber.
- Already prepared: blue-gray.

Typography:
- Tracking code uses tabular numerals.
- Scan result title is large.
- Custody reminder is short and bold.

Motion:
- Scanner frame may pulse subtly while active.
- Match state may transition with a brief check.
- Mismatch should be immediate and stable.
- Respect reduced motion.

Density:
- Keep one delivery in focus.
- Hide audit detail behind disclosure.
- Do not crowd scanner with secondary actions.

## Component Inventory
Components:
- `DispatchReadinessHeader`
- `DispatchReadinessBanner`
- `DispatchDeliveryCard`
- `AssignedDriverStrip`
- `CustodyReminderCard`
- `PackageScanPanel`
- `ScanResultPanel`
- `ManualEntryFallbackPanel`
- `SupervisorOverridePanel`
- `DispatchReviewCard`
- `DispatchOfflineBanner`
- `DispatchResultPanel`
- `DispatchBlockedState`

### `DispatchReadinessHeader`
Props:
- `trackingCode`
- `stationId`
- `lastUpdatedAt`
- `isOffline`

Responsibilities:
- Orient station operator.
- Show freshness and station scope.

### `DispatchDeliveryCard`
Props:
- `deliveryId`
- `trackingCode`
- `destinationStationId`
- `receiverName`
- `serviceType`
- `doorstepRequested`
- `currentStatus`
- `paymentStatus`

Responsibilities:
- Confirm package identity.
- Hide sensitive receiver and payment data.

### `AssignedDriverStrip`
Props:
- `assignedDriverId`
- `driverName`
- `driverSource`

Responsibilities:
- Show that a driver exists.
- Avoid unsupported admin lookup.

### `PackageScanPanel`
Props:
- `scanState`
- `lastScanValue`
- `cameraPermissionState`
- `scannerError`

Responsibilities:
- Capture package scan.
- Route failure to fallback.
- Avoid analytics leakage of full code.

### `ManualEntryFallbackPanel`
Props:
- `manualCode`
- `fallbackReason`
- `supervisorOverrideActorId`
- `validationErrors`

Responsibilities:
- Allow controlled fallback only.
- Set `fallbackUsed=true`.

### `DispatchReviewCard`
Props:
- `deliverySummary`
- `scanSummary`
- `fallbackSummary`
- `confirmationChecked`

Responsibilities:
- Review high-impact readiness checkpoint.
- Reinforce custody boundary.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Readiness banner.
3. Delivery identity.
4. Assigned driver strip.
5. Custody reminder.
6. Scan controls.
7. Scan result.
8. Manual fallback when visible.
9. Review card.
10. Primary action.
11. Secondary actions.

Required labels:
- Scanner action announces current permission state.
- Scan result announces matched, mismatch, or unknown local verification.
- Manual code field announces supervisor requirement.
- Success and failure states are announced as status messages.
- Offline queued state is announced.

Touch targets:
- Scan action is large and bottom reachable.
- Rescan action is large.
- Manual fallback controls are not icon-only.
- Supervisor add action is easy to tap.

Focus:
- Initial focus lands on screen title.
- After scan success, focus moves to scan result.
- After mismatch, focus moves to mismatch title.
- After manual validation error, focus moves to first invalid field.
- After success, focus moves to result heading.

Reduced motion:
- Scanner pulse disabled.
- Match transition becomes instant.
- No animated barcode.

## Security And Privacy
Allowed on screen:
- Tracking code.
- Delivery ID.
- Destination station.
- Receiver name.
- Service type.
- Assigned driver ID suffix or safe driver name.
- Current status.
- Payment confirmed label.
- Scan match result.

Not allowed on screen:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full package scan code after submit.
- Driver phone.
- Driver email.
- Admin user fields.

Allowed in analytics:
- `deliveryId`
- `stationId`
- `currentStatus`
- `paymentStatus`
- `scanMethod`
- `fallbackUsed`
- `blockReason`
- `isOfflineQueued`

Disallowed in analytics:
- `packageScanCode`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `driverName`
- `paymentProviderReference`

## Analytics
Events:
- `station_dispatch_readiness_viewed`
- `station_dispatch_scan_started`
- `station_dispatch_scan_matched`
- `station_dispatch_scan_mismatched`
- `station_dispatch_manual_fallback_opened`
- `station_dispatch_supervisor_added`
- `station_dispatch_reviewed`
- `station_dispatch_started`
- `station_dispatch_succeeded`
- `station_dispatch_failed`
- `station_dispatch_already_prepared`
- `station_dispatch_offline_queued`
- `station_dispatch_blocked`
- `station_dispatch_custody_opened`
- `station_dispatch_support_opened`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `currentStatus`
- `paymentStatus`
- `assignedDriverPresent`
- `scanMethod`
- `fallbackUsed`
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
Eligibility:
- `assigned_to_driver` with assigned driver allows scanning.
- Missing assigned driver routes to assignment.
- `received_at_origin` routes to assignment.
- `awaiting_driver_assignment` routes to assignment.
- Pending payment blocks dispatch readiness.
- Wrong station scope blocks dispatch readiness.
- Already prepared timeline shows pickup review action.

Scan:
- Camera scan captures package code.
- Matched local label enables review.
- Mismatched local label blocks submit.
- Unknown local expected code allows backend verification on submit.
- Manual entry requires fallback reason.
- Manual entry requires supervisor override.

Mutation:
- `dispatch_delivery` is called with `packageScanCode`.
- `fallbackUsed=true` is sent for supervised manual entry.
- `supervisorOverrideActorId` is sent when fallback is used.
- Success does not change UI wording to custody transfer.
- Success routes to pickup review.
- API `PACKAGE_SCAN_MISMATCH` maps to scan mismatch.
- API `INVALID_STATUS_TRANSITION` maps to status block.
- API `PAYMENT_REQUIRED` maps to payment block.

Offline:
- Fresh eligible snapshot and captured scan can queue dispatch readiness.
- Stale snapshot blocks offline queue.
- Missing scan blocks offline queue.
- Existing readiness conflict resolves safely.
- Scan mismatch on replay routes custody chain.

Accessibility:
- Scanner state is announced.
- Match and mismatch are announced.
- Manual fallback errors focus correctly.
- Success is announced.
- Large text keeps scan and primary action usable.

Privacy:
- Full package scan code is not sent to analytics.
- Receiver phone and address never appear.
- Driver private contact data never appears.
- Payment provider reference never appears.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/dispatch-readiness`

Recommended state holder:
- `useStationDispatchReadinessScreen`

Recommended selectors:
- `selectDispatchEligibility`
- `selectDispatchTimelineState`
- `selectDispatchScanState`
- `selectDispatchFallbackState`
- `selectDispatchReviewState`
- `selectDispatchPrimaryAction`
- `selectDispatchOfflinePolicy`
- `selectDispatchErrorState`

Recommended API hooks:
- `useGetDeliveryQuery`
- `useGetDeliveryTimelineQuery`
- `useDispatchDeliveryMutation`

Do not use:
- Driver pickup mutation.
- Admin user list.
- Payment provider endpoints.

Offline action:
- Route key: `dispatch_delivery`
- Fingerprint: `deliveryId + packageScanCode`
- Revalidate status, payment, station scope, and assigned driver before replay.

## Implementation Guardrails
Must use:
- Delivery detail.
- Timeline evidence.
- Package scan.
- Payment gate.
- Station scope.
- Dedicated `dispatch_delivery` mutation.

Must show:
- Assigned driver state.
- Package identity.
- Scanner.
- Match or mismatch result.
- Custody reminder.
- Review before submit.
- Offline queue state.
- Success next step.

Must not:
- Move custody.
- Call `confirm_pickup`.
- Say package left origin station.
- Submit manual code without supervisor override.
- Use admin user API for driver name.
- Show sensitive receiver, driver, payment, or full label data.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports stable, scannable package identifiers and human-readable alignment.
- [GS1 logistic label guideline](https://ref.gs1.org/guidelines/logistic-label/): supports structured logistics label use during physical movement.
- [ML Kit barcode scanning for Android](https://developers.google.com/ml-kit/vision/barcode-scanning/android): supports camera-based barcode capture behavior for mobile scanning.
- [Android offline-first data layer](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached state, stale data, and sync conflict treatment.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review before high-impact dispatch readiness.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible scan, success, error, and offline queued state changes.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large scanner, rescan, fallback, and submit controls.

Design translation:
- Dispatch readiness should be scanner-first because it verifies a physical package.
- Readiness is a checkpoint, not custody transfer.
- Manual fallback needs supervisor governance.
- Offline queueing must retain exact scan evidence and revalidate before replay.
- Scan state must be accessible and recoverable.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/outbound/:deliveryId/dispatch`.
- The top-level test ID is `screen-station-dispatch-readiness`.
- The screen fetches delivery detail and timeline.
- Timeline evidence detects already-prepared readiness.
- `dispatch_delivery` is called only for `assigned_to_driver`.
- `packageScanCode` comes from physical scan or supervised fallback.
- Success copy says readiness, not custody transfer.
- Driver pickup route is next, but pickup mutation is not called here.
- Offline queue rules require fresh snapshot and scan evidence.
- Sensitive receiver, driver, payment, and scan data are excluded.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Status, payment, driver, station scope, and scan gates are enforced.
- Already-prepared readiness is detected from timeline or safe local evidence.
- Scanner and fallback paths are implemented with supervisor rules.
- `dispatch_delivery` is idempotent and recoverable.
- Offline queue is conservative and conflict-aware.
- Success routes to driver pickup review.
- Custody remains station-held in copy and behavior.
- Accessibility covers scan, mismatch, fallback, success, and offline queued states.
- Analytics exclude full scan code, receiver, driver, payment, and provider data.

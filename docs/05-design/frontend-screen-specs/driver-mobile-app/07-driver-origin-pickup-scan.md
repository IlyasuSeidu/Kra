# DriverOriginPickupScan Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `DriverOriginPickupScan` |
| Route | `/(ops)/driver/runs/:deliveryId/pickup-scan` |
| Primary test ID | `screen-driver-origin-pickup-scan` |
| Surface | Driver mobile app |
| Backend coverage | `confirm_pickup` through `POST /v1/deliveries/:id/confirm-pickup` |
| Offline critical | Yes |
| Required role | `driver` |
| Required capability | `confirm_pickup` |
| Parent screen | `DriverManifest` |
| Primary mutation | `confirm_pickup` |
| Supporting reads | `get_delivery`, `get_delivery_timeline`, local package scan cache, local outbox |
| Related routes | `/(ops)/driver/runs/:deliveryId`, `/(ops)/driver/runs/:deliveryId/manifest`, `/(ops)/driver/runs/:deliveryId/custody-accepted`, `/(ops)/driver/runs/:deliveryId/route`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/driver/support`, `/(ops)/offline-outbox` |
| Current implementation mode | Single-delivery origin pickup custody transfer using current API |

## Product Job
`DriverOriginPickupScan` lets the assigned driver scan the package at the origin station and accept physical custody only when the backend verifies the registered package scan code.

The screen answers:

- `Am I the assigned driver for this delivery?`
- `Is this package still waiting for driver pickup?`
- `Does this package scan code match this delivery?`
- `Can custody move from origin station to me now?`
- `What should I do if the scan fails, the camera is blocked, or the network drops?`
- `What evidence will be recorded for the handoff?`

## Product Standard
This is the first driver custody-transfer screen. It must be stricter than a normal scanner and clearer than a route-loading checklist.

The driver should be able to:

- Open camera scanning quickly from the run context.
- Understand that the package remains with the station until verification succeeds.
- Scan the package label without seeing the registered code.
- Submit `confirm_pickup` only for the assigned delivery.
- Use supervised manual entry only when scanning cannot work.
- Queue a pending pickup request only under safe offline conditions.
- Recover from wrong package, wrong driver, stale status, camera failure, and duplicate submission.
- See a server-confirmed custody success before leaving the origin station by default.

The screen must never:

- Reveal the registered package scan code.
- Move custody from cached or local-only state.
- Let an unassigned driver submit pickup.
- Let station staff submit pickup from the driver screen.
- Treat run acceptance as custody.
- Treat dispatch readiness as custody.
- Submit without a package scan code or approved manual fallback.
- Show `custody accepted` before `confirm_pickup` succeeds on the server.
- Hide unresolved offline outbox conflicts.

## Audience
Primary audience:

- Assigned inter-station driver standing at the origin station, collecting the package.

Secondary audience:

- Station operator supervising release.
- Operations lead reviewing loss-prevention controls.
- Support agent helping with scanner or assignment issues.
- QA validating custody, offline, and error behavior.
- Claude Code implementing the screen and tests.

## Context Of Use
The driver may open this screen:

- Immediately after reviewing the driver manifest.
- From an accepted run detail.
- From a station handoff prompt.
- After station staff asks the driver to scan the package.
- With weak connectivity inside a station building.
- With a low-end phone camera and poor label lighting.
- After a scan mismatch or unreadable label.

This is a field-critical moment. The UI must keep attention on one package, one driver, one station, and one custody event.

## Design Brief
User and job:

- A verified assigned driver must scan one package and accept custody from the origin station.

Context:

- High-trust, high-speed station handoff with possible low connectivity.

Entry point:

- `DriverManifest`, `AssignedRunDetail`, station handoff deep link, or push notification.

Success state:

- Backend records `driver_pickup_confirmed`, status becomes `dispatched_from_origin`, current custodian becomes the driver, and handoff event `origin_station_to_driver` is created.

Primary action:

- `Scan package`.

Navigation model:

- Focused full-screen scanner with a compact custody header and bottom action sheet.

Density level:

- Low visual density while scanning, high precision in recovery panels.

Visual thesis:

- `Custody gate`: camera-first scanner, hard custody warning, single decisive success state, no route progress until proof is recorded.

Restraint rule:

- Do not add route navigation, multi-stop manifest editing, destination receipt, or station-side confirmation here.

## External Research Used
Only directly relevant sources were used:

- [Onfleet Route Load Task driver guide](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports pre-route package verification, barcode scanning, pinpoint scanning, and manual verification when a barcode is unreadable.
- [Onfleet Route Load Task dispatcher guide](https://support.onfleet.com/hc/en-us/articles/47743836771732-Route-Load-Task): supports chain-of-custody at the hub, blocking downstream work until loading is verified, and alerting dispatch for package issues.
- [Onfleet barcode scanning API](https://docs.onfleet.com/reference/barcode-scanning): supports barcode capture at pickup and dropoff as delivery evidence.
- [ML Kit barcode scanning for Android](https://developers.google.cn/ml-kit/vision/barcode-scanning/android?hl=en): supports camera barcode decoding, specific format targeting, image quality guidance, and auto-zoom recommendations.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports persistent queues, network monitors, retry with backoff, and local data as the visible source while sync completes.
- [WCAG status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html): supports accessible scan progress, submit progress, success, and error announcements.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports minimum tappable control sizes for scanner and recovery actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/driver-app-spec.md`
- `docs/03-business/handoff-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/11-station-driver-pickup-scan.md`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/package-labels.ts`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`

## Backend Contract
Mutation:

- Operation key: `confirm_pickup`.
- HTTP route: `POST /v1/deliveries/:id/confirm-pickup`.
- Request schema: `confirmDriverPickupRequestSchema`.
- Response schema: `deliveryLifecycleResponseSchema`.
- Required capability: `confirm_pickup`.

Request body:

```json
{
  "packageScanCode": "scanned package code",
  "fallbackUsed": false,
  "supervisorOverrideActorId": "optional supervisor user id"
}
```

Validation:

- `packageScanCode` is required.
- `packageScanCode` is trimmed.
- `packageScanCode` minimum length is `4`.
- `packageScanCode` maximum length is `80`.
- `fallbackUsed` is optional boolean.
- `supervisorOverrideActorId` is optional `userIdSchema`.

Backend behavior:

- Requires actor role `driver`.
- Requires assigned driver to match `delivery.assignedDriverId`.
- Requires current status `assigned_to_driver`.
- Verifies package scan code when package labels are configured.
- Transitions delivery to `dispatched_from_origin`.
- Emits lifecycle event `driver_pickup_confirmed`.
- Sets current custodian role to `driver`.
- Sets current custodian actor to the driver actor ID.
- Creates handoff event `origin_station_to_driver`.
- Records proof type `package_scan`.
- Records proof reference as submitted package scan code.
- Records `fallbackUsed` and `supervisorOverrideActorId` when provided.

Success response expectations:

- `eventId` is present.
- `deliveryId` is unchanged.
- `status` is `dispatched_from_origin`.
- Custody fields identify the driver when returned by the detail endpoint.
- Timeline later includes `driver_pickup_confirmed`.
- Handoff chain later includes `origin_station_to_driver`.

## Backend Non-Negotiables
- `confirm_pickup` is driver-only.
- Station role must never call this mutation.
- Assigned driver check is server-enforced.
- Scan code validation is server-enforced.
- Current status check is server-enforced.
- Assignment acknowledgement does not move custody.
- Dispatch readiness does not move custody.
- Server success is the only final custody success.
- Local queued state is pending evidence, not final evidence.

## Current Backend Gaps To Preserve In UI
The screen can be built with current backend, but the UI must account for these gaps:

- Backend does not expose a dedicated station co-sign token for offline origin release.
- Backend does not expose an explicit scanner-read confidence score.
- Backend does not expose a dedicated `DUPLICATE_SCAN` enum in every route response path yet, even though inventory documents it as a desired UI state.
- Backend does not expose a typed `OFFLINE_POLICY_BLOCKED` response; client must enforce offline safety before submission.
- Backend does not return handoff proof details directly in the mutation response; app must refetch detail or timeline after success when displaying the custody chain.
- Backend does not expose a first-class pickup window timestamp; UI must avoid inventing pickup SLA timers unless returned by delivery detail or assignment data.

UI rule:

- Do not block implementation on these gaps. Use current API safely and list missing backend support in telemetry and issue notes.

## Data Dependencies
Required before scanner opens:

- `deliveryId` from route.
- Authenticated actor ID.
- Authenticated actor role.
- Actor capabilities.
- Delivery detail from `get_delivery` or fresh local cache.
- Current status.
- Assigned driver ID.
- Origin station ID.
- Destination station ID.
- Delivery tracking code or customer-safe identity.
- Package summary fields already available from current delivery detail.
- Local package label binding freshness metadata when offline support is enabled.
- Outbox state for existing pending pickup request.

Optional:

- Station name from station cache.
- Vehicle identifier from driver profile.
- Manifest risk badges from package fields.
- Timeline summary from `get_delivery_timeline`.

Never required:

- Registered package scan code visible to the driver.
- Receiver phone.
- Sender private address beyond what is needed for driver operation.
- Payment provider reference.

## Route Parameters
Route shape:

- `/(ops)/driver/runs/:deliveryId/pickup-scan`

Required parameter:

- `deliveryId`: delivery ID.

Invalid parameter handling:

- If missing, route to driver home with toast `Delivery reference is missing.`
- If malformed, show `not_found` state and offer `Back to runs`.
- If delivery is not found, show `not_found` state.
- If delivery is outside driver scope, show `scope_denied` state.

## Screen Entry Rules
Allow entry when:

- User role is `driver`.
- User has `confirm_pickup`.
- Delivery is assigned to the user.
- Delivery status is `assigned_to_driver`.
- No unresolved pickup action is already pending for the same delivery.

Allow read-only entry when:

- Delivery has already moved to `dispatched_from_origin`.
- App has offline cached detail and needs to explain pending or confirmed state.
- Driver is not allowed to mutate but support needs context.

Block entry when:

- User is not authenticated.
- User role is not `driver`.
- Driver is not assigned to the delivery.
- Delivery is cancelled, expired, completed, or already handed off to another party.
- Payment gate blocks dispatch if backend returns `PAYMENT_REQUIRED`.

## Information Architecture
Primary layers:

- Custody header.
- Scanner viewport.
- Scan instruction panel.
- Package identity strip.
- Station handoff checklist.
- Offline and sync banner.
- Recovery drawer.
- Bottom action bar.

Screen hierarchy:

- Header: `Pickup scan`
- Status chip: `Station holds package` or `Pending sync` or `Custody accepted`
- Delivery identity: tracking code, origin station, destination station.
- Scanner: camera preview, scan frame, focus target, torch control.
- Instruction: `Scan the package label before leaving origin station.`
- Checklist: assigned driver, origin station, package profile, status.
- CTA: `Scan package`, `Enter code with supervisor`, `Retry`, `Open custody chain`.

## Visual Direction
The screen should feel operational and premium, not generic utility.

Art direction:

- Deep graphite scanner canvas.
- Bright safety green success accents only after server confirmation.
- Amber pending/offline accents.
- Red mismatch accents.
- Compact route spine from origin to destination.
- Strong haptic and visual feedback when scan is detected.
- Large scan frame with subtle corner brackets.
- Bottom sheet for all text-heavy explanations.

Typography:

- Use the project mobile type scale.
- Scanner heading should be short and bold.
- Numeric and ID content should use tabular figure styling when available.
- Avoid dense paragraphs while camera is active.

Motion:

- Scanner frame has slow breathing pulse only while actively searching.
- Detected scan freezes frame briefly for confirmation.
- Submit progress uses a linear top bar plus status text.
- Success panel slides up after server success.
- Error drawer rises from bottom without covering the camera permission controls.

Motion restrictions:

- Disable decorative motion when reduced motion is enabled.
- Do not animate raw scan text.
- Do not create long success delays; operations users need speed.

## Layout
Mobile portrait default:

- Top safe area: back button, title, network status.
- Header card: delivery identity and custodian status.
- Scanner viewport: 55 to 62 percent of usable height.
- Bottom sheet: instructions, checklist, actions.
- Sticky bottom: primary action or recovery action.

Mobile landscape:

- Left: scanner viewport.
- Right: custody header, checklist, actions.
- Keep primary action at thumb-reachable lower-right area.

Small screen:

- Collapse package identity to tracking code, station, and status.
- Move secondary actions to overflow.
- Keep torch and manual fallback visible.

Tablet:

- Center scanner in a fixed max-width operational panel.
- Right rail may show timeline mini-card and outbox state.

## Component Inventory
Required components:

- `DriverPickupScanScreen`
- `CustodyGateHeader`
- `DeliveryIdentityStrip`
- `OriginDestinationSpine`
- `PackageScanViewport`
- `ScannerPermissionPanel`
- `ScannerTorchButton`
- `ScannerFocusFrame`
- `ScanFeedbackLayer`
- `PickupChecklist`
- `ManualFallbackDrawer`
- `SupervisorOverrideControl`
- `OfflinePickupBanner`
- `PendingOutboxCard`
- `ScanMismatchDrawer`
- `CustodyAcceptedPanel`
- `PickupBlockedPanel`
- `ScannerUnavailablePanel`
- `PickupSupportActions`

Shared component reuse:

- Use shared `OpsScanPackage` logic for scan capture patterns where available.
- Use shared `WrongPackageScannedModal` copy patterns for mismatch.
- Use shared `AcceptCustodyModal` only for copy and structure if it does not duplicate the actual scanner.
- Use shared `OpsActionRecovery` for conflicts and outbox sync.
- Use shared `OpsCustodyChain` route for evidence review.

Do not create:

- A new global scanner if the shared scanner can accept driver pickup intent.
- A route map.
- A station operator confirmation control.
- A multi-package loading workflow until backend supports run-level manifests.

## Primary Flow
1. Driver opens pickup scan from manifest.
2. Screen loads delivery detail.
3. Screen verifies role, capability, assignment, and status.
4. Screen opens camera if permission exists.
5. Driver scans package label.
6. Scanner decodes one package scan code.
7. UI validates basic format locally.
8. UI submits `confirm_pickup` with `packageScanCode`.
9. Server validates package scan and assignment.
10. Server records custody transfer.
11. UI shows custody accepted panel.
12. UI invalidates delivery, timeline, driver queue, station queue, and custody chain caches.
13. UI routes to `DriverCustodyAccepted` or run route when driver taps continue.

## Default Online Flow Details
Loading:

- Show skeleton header and scanner loading panel.
- Do not show camera until assignment and status are checked.
- If detail is stale, fetch before scanning.

Ready:

- Header says `Station holds package`.
- Instruction says `Scan the package label to accept custody.`
- Primary button says `Start scan` if camera preview is not active.
- If preview is active, primary text becomes `Point camera at package label`.

Scan detected:

- Freeze scan frame for 400 milliseconds.
- Show `Scan detected. Verifying pickup...`
- Disable further scan reads.
- Send mutation immediately unless manual review is required by scanner ambiguity.

Submitting:

- Keep camera frozen or dimmed.
- Show progress text in live region.
- Disable back only if the network request is actively resolving; allow cancel before network send when possible.

Success:

- Header changes to `Custody accepted`.
- Success card says `You are now responsible for this package.`
- Show event ID when returned.
- Show origin station handoff line.
- Primary action: `Continue to route`.
- Secondary action: `View custody chain`.

## Offline Flow
Offline is supported, but final custody language must remain precise.

Offline states:

- `offline_ready`: delivery detail and assignment are fresh enough for scan capture.
- `offline_scan_captured`: scan code captured locally but not submitted.
- `offline_queued`: pickup request stored in durable outbox.
- `offline_policy_blocked`: offline cache is too old or missing required binding evidence.
- `offline_conflict`: server rejected queued pickup after reconnect.

Offline scan capture prerequisites:

- Delivery detail was fetched successfully before.
- Cached delivery belongs to current driver.
- Cached status is `assigned_to_driver`.
- Cached delivery identity matches route delivery ID.
- Cached package identity exists.
- Cached assignment is not older than the configured pickup freshness limit.
- No local pending pickup action exists for the same delivery.
- Local auth session is valid.

Recommended freshness limit:

- Default to `15 minutes` for assignment and status cache unless product configuration provides a stricter value.

Offline outbox payload:

```json
{
  "localActionId": "generated local action id",
  "idempotencyKey": "generated pickup idempotency key",
  "actorId": "current driver actor id",
  "role": "driver",
  "deliveryId": "route delivery id",
  "operation": "confirm_pickup",
  "packageScanCode": "captured code",
  "fallbackUsed": false,
  "supervisorOverrideActorId": "optional supervisor user id",
  "localTimestamp": "device time in ISO format"
}
```

Offline UI language:

- Allowed: `Pickup request saved. Waiting to sync.`
- Allowed: `Do not mark this handoff complete until sync succeeds.`
- Not allowed: `Custody accepted` before server success.
- Not allowed: `Package dispatched` before server success.

Offline release policy:

- Default: package should remain at origin station until sync succeeds.
- Exception: operations policy may allow controlled release only after supervisor override and station support issue creation.
- If exception release is used, screen must set `fallbackUsed=true`, include `supervisorOverrideActorId`, and show `Exception release pending sync`.
- The UI must make liability clear: accountability is not fully settled until server records the handoff.

Reconnect:

- Drain outbox in order.
- Use idempotency key for retry.
- On success, replace pending state with server-confirmed success.
- On conflict, preserve local evidence and route to recovery.
- On `PACKAGE_SCAN_MISMATCH`, show mismatch drawer and support escalation.
- On `INVALID_STATUS_TRANSITION`, refetch detail and explain current custody state.

## Manual Fallback Flow
Manual entry exists only for unreadable labels, camera failure, or approved field exception.

Entry points:

- `Enter code with supervisor`.
- Camera permission denied panel.
- Scanner unavailable panel.
- Repeated scan failure panel.

Required controls:

- Manual code input.
- Supervisor approval selector or verified supervisor challenge result.
- Reason picker.
- Confirmation checkbox.
- Submit button.

Reason options:

- `label_unreadable`
- `camera_unavailable`
- `device_damage`
- `network_exception`
- `station_supervisor_authorized`

Manual submission rules:

- Require package code length 4 to 80 after trim.
- Require supervisor approval before submit.
- Submit `fallbackUsed=true`.
- Submit `supervisorOverrideActorId`.
- Log fallback reason locally for analytics and support.
- Do not weaken server package scan validation; backend still validates the entered code.

Manual fallback copy:

- Title: `Supervisor approval required`
- Body: `Manual entry changes the evidence type for this handoff. A supervisor must approve before this package can leave the origin station.`
- Checkbox: `I confirm this code was read from the physical package label.`
- Primary: `Submit supervised pickup`
- Secondary: `Return to scanner`

Manual fallback blocks:

- No supervisor identity.
- Code shorter than 4 characters.
- Code longer than 80 characters.
- Code entered from memory without reading package label.
- Offline cache too old.

## Camera And Scanner Behavior
Camera permission:

- Ask only when driver chooses to scan or screen is ready to scan.
- Explain purpose before native permission prompt when platform allows.
- If denied, show manual fallback and settings route.
- If permanently denied, show `Open settings` and `Enter code with supervisor`.

Scanner setup:

- Back camera by default.
- Torch available when device supports it.
- Center-weighted scan frame.
- Pinpoint behavior by default for one-package custody transfer.
- Do not enable multi-scan for this screen.
- Ignore additional barcodes until current submission resolves.
- Accept only supported package label formats configured by the app.
- Prefer configured barcode formats over scanning every format for speed and accuracy.
- Use auto-zoom when platform scanner supports it.
- Provide focus guidance when scan is distant or blurry.

Scan decode:

- Trim decoded value.
- Reject empty strings.
- Reject strings below 4 characters.
- Reject strings above 80 characters.
- Do not display full decoded value.
- Show only safe suffix if needed, such as last 4 characters.
- Do not store camera frames.

Ambiguous scan:

- If multiple barcodes are visible, show `Move closer to one label`.
- Keep scanner active.
- Do not submit until exactly one supported code is decoded.

Low quality:

- Show `Hold steady`, `Move closer`, or `Turn on torch`.
- Do not make the user hunt through settings.

## State Model
Required states:

- `initializing`
- `loading_delivery`
- `scope_checking`
- `camera_permission_needed`
- `camera_permission_denied`
- `camera_unavailable`
- `ready_to_scan`
- `scanning`
- `multiple_codes_seen`
- `scan_too_blurry`
- `scan_detected`
- `local_validation_failed`
- `submitting_pickup`
- `pickup_confirmed`
- `offline_ready`
- `offline_scan_captured`
- `offline_queued`
- `offline_policy_blocked`
- `offline_conflict`
- `manual_fallback`
- `supervisor_required`
- `fallback_submitting`
- `package_mismatch`
- `driver_mismatch`
- `wrong_status`
- `payment_blocked`
- `duplicate_pending`
- `not_found`
- `scope_denied`
- `session_expired`
- `rate_limited`
- `api_error`

State transitions:

- `loading_delivery` -> `ready_to_scan` when delivery is assigned to driver and status is valid.
- `ready_to_scan` -> `scanning` after camera is active.
- `scanning` -> `scan_detected` when one supported code is decoded.
- `scan_detected` -> `submitting_pickup` after local validation passes.
- `submitting_pickup` -> `pickup_confirmed` on server success.
- `submitting_pickup` -> `package_mismatch` on `PACKAGE_SCAN_MISMATCH`.
- `submitting_pickup` -> `wrong_status` on `INVALID_STATUS_TRANSITION`.
- `submitting_pickup` -> `driver_mismatch` on `FORBIDDEN` with assignment mismatch context.
- `scan_detected` -> `offline_queued` only when offline prerequisites pass.
- `offline_queued` -> `pickup_confirmed` after successful sync.
- `offline_queued` -> `offline_conflict` after rejected sync.
- `manual_fallback` -> `fallback_submitting` after supervisor approval.
- `fallback_submitting` -> `pickup_confirmed` on server success.

## Permission And Scope Rules
Auth rules:

- User must be signed in.
- User role must be `driver`.
- User must have capability `confirm_pickup`.
- Actor ID must equal `assignedDriverId`.

UI enforcement:

- If role is wrong, show `This pickup must be confirmed from the assigned driver account.`
- If capability is missing, show `Your account cannot confirm pickup. Contact support.`
- If assigned driver differs, show `This run is assigned to another driver.`
- If status is wrong, show current status and next safe action.

Never:

- Offer a station override from this screen.
- Let driver switch actor identity inside this screen.
- Continue after scope failure.

## Error Handling
`PACKAGE_SCAN_MISMATCH`:

- Title: `Wrong package scanned`
- Body: `This scan code does not match the delivery assigned to you. Keep the package at the station and scan the correct label.`
- Primary: `Scan again`
- Secondary: `Open custody chain`
- Tertiary: `Contact support`
- Analytics: `driver_pickup_scan_mismatch`

`INVALID_STATUS_TRANSITION`:

- Title: `Pickup is no longer available`
- Body: `This delivery changed state before pickup could be confirmed. Refresh the run before taking the package.`
- Primary: `Refresh run`
- Secondary: `View custody chain`

`FORBIDDEN`:

- Title: `Driver assignment changed`
- Body: `You are not the assigned driver for this pickup. Do not take the package.`
- Primary: `Back to runs`
- Secondary: `Contact support`

`NOT_FOUND`:

- Title: `Delivery not found`
- Body: `This delivery could not be loaded. Check with station support before moving any package.`
- Primary: `Back to runs`

`PAYMENT_REQUIRED`:

- Title: `Payment gate blocked`
- Body: `This package cannot leave the origin station until payment is cleared.`
- Primary: `Refresh payment status`
- Secondary: `Contact station`

`RATE_LIMITED`:

- Title: `Too many attempts`
- Body: `Wait a moment before trying again. Do not leave the station until pickup is confirmed.`
- Primary: `Try again`

`VALIDATION_ERROR`:

- Title: `Scan code format is invalid`
- Body: `Scan the package label again or use supervised manual entry if the label is damaged.`
- Primary: `Scan again`

Network timeout:

- If request was not accepted by the outbox, show retry.
- If request was queued, show pending outbox card.
- Never submit another request without idempotency protection.

## Copy System
Scanner header:

- `Scan package to accept custody`

Scanner helper:

- `The package stays with the origin station until this scan is verified.`

Ready copy:

- `Point your camera at the package label.`

Detected copy:

- `Scan detected. Verifying pickup...`

Success copy:

- `Custody accepted`
- `You are now responsible for this package. Continue only with the package physically in your possession.`

Pending sync copy:

- `Pickup request saved`
- `Sync is required before custody is final in the system. Keep station staff informed.`

Mismatch copy:

- `Wrong package scanned`
- `Do not take this package. Scan the assigned package or ask station staff to review.`

Manual fallback copy:

- `Use manual entry only with supervisor approval.`

No camera copy:

- `Camera is unavailable on this device. Use supervised manual entry or contact station support.`

## Accessibility
Screen reader:

- Announce scanner state changes with polite status messages.
- Use assertive announcements for mismatch, scope denied, and custody accepted.
- Label camera frame as `Package label scanner`.
- Label torch as `Turn torch on` or `Turn torch off`.
- Label manual entry field as `Package scan code from label`.
- Do not announce full scan code after detection.

Focus:

- On load, focus header title.
- When permission is denied, focus permission panel title.
- When scan mismatch drawer opens, focus drawer title.
- When success panel opens, focus `Custody accepted`.
- On manual entry validation error, focus first invalid field.

Touch targets:

- All buttons at least 44 by 44 device-independent pixels.
- Icon-only buttons at least 44 by 44 with accessible names.
- Scanner bottom actions should meet or exceed WCAG target minimums.

Reduced motion:

- Disable scan frame pulse.
- Replace slide-up panels with instant state changes.
- Keep haptics optional through OS settings.

Color:

- Do not rely on color alone for success, warning, or error.
- Pair each state with icon, text, and accessible announcement.

Camera accessibility:

- Provide manual supervised fallback for users who cannot use camera scanning.
- Provide torch and focus guidance.
- Do not require precise motor control beyond holding camera near label.

## Privacy And Security
Protect:

- Package scan code.
- Delivery ID.
- Actor ID.
- Supervisor actor ID.
- Station ID.
- Local outbox payload.

Rules:

- Never show full package scan code after scan.
- Never write scan code to analytics.
- Never include scan code in crash logs.
- Store outbox payload encrypted at rest when platform support exists.
- Redact scan code in support attachments.
- Clear scanner frame buffer after decode.
- Do not store photos from scanner preview.
- Use idempotency keys for mutation retries.
- Prevent screenshots if app policy requires secure operational screens.

Audit events:

- Track scan attempt without raw code.
- Track fallback usage without raw code.
- Track supervisor override actor ID only in secure audit stream.
- Track mismatch as delivery-scoped event without raw code.

## Analytics
Events:

- `driver_pickup_scan_screen_viewed`
- `driver_pickup_scan_camera_started`
- `driver_pickup_scan_detected`
- `driver_pickup_confirm_submitted`
- `driver_pickup_confirm_succeeded`
- `driver_pickup_confirm_failed`
- `driver_pickup_scan_mismatch`
- `driver_pickup_manual_fallback_opened`
- `driver_pickup_manual_fallback_submitted`
- `driver_pickup_offline_queued`
- `driver_pickup_offline_sync_succeeded`
- `driver_pickup_offline_sync_failed`
- `driver_pickup_support_opened`

Required properties:

- `deliveryId`
- `originStationId`
- `destinationStationId`
- `actorRole`
- `isAssignedDriver`
- `currentStatus`
- `networkState`
- `fallbackUsed`
- `hasSupervisorOverride`
- `outboxActionId`
- `errorCode`

Forbidden properties:

- Raw package scan code.
- Full receiver phone.
- Full sender phone.
- Full address.
- Camera frame data.
- Supervisor credential secret.

## Cache And Invalidation
On screen open:

- Read delivery detail cache immediately.
- Mark stale if older than configured freshness limit.
- Fetch delivery detail from network when available.
- Do not open scanner until assignment and status are known.

On successful pickup:

- Invalidate `Delivery`.
- Invalidate `DeliveryTimeline`.
- Invalidate `DriverQueue`.
- Invalidate `StationQueue`.
- Invalidate `CustodyChain`.
- Remove any pending local pickup action for the same delivery.
- Store last confirmed event ID.

On queued pickup:

- Add pending badge to delivery detail.
- Add pending card to offline outbox.
- Keep delivery visible in assigned run list with `Pickup pending sync`.
- Do not move it to in-transit route list until server confirms unless product explicitly adds a pending route lane.

On conflict:

- Preserve local payload and scan timestamp.
- Lock further pickup attempts until driver reviews conflict.
- Refetch delivery detail and timeline.

## Navigation
From this screen:

- Back to `DriverManifest`.
- Continue to `DriverCustodyAccepted` after success.
- Continue to route view only after success or after explicit policy allows pending exception release.
- Open custody chain.
- Open offline outbox.
- Open support.
- Open device settings for camera permission.

Back behavior:

- Before scan: normal back.
- While scanning: back closes scanner and returns to previous screen.
- While submitting: confirm cancel only if request has not been sent.
- After success: back should not return to scanner as active; route to run detail with confirmed state.
- With pending outbox: back allowed, but run detail must show pending state.

Deep link behavior:

- If delivery already confirmed, route directly to custody accepted state.
- If user is not assigned, block with scope denied.
- If user is offline and cache is absent, show offline blocked.

## Empty And Blocked States
No delivery cache:

- Title: `Delivery unavailable offline`
- Body: `Connect to load this pickup before scanning.`
- Primary: `Retry`

No camera:

- Title: `Camera unavailable`
- Body: `Use supervised manual entry or contact support before moving the package.`
- Primary: `Enter code with supervisor`

Already confirmed:

- Title: `Pickup already confirmed`
- Body: `This package is already recorded as dispatched from origin.`
- Primary: `View custody chain`
- Secondary: `Continue to route`

Assigned to another driver:

- Title: `Assigned to another driver`
- Body: `Do not take this package. Ask station staff to verify the assignment.`
- Primary: `Back to runs`

Status not ready:

- Title: `Package is not ready for pickup`
- Body: `The delivery must be assigned to you before pickup can be confirmed.`
- Primary: `Refresh`

## QA Acceptance Criteria
Functional:

- Driver can open scanner only when assigned and status is `assigned_to_driver`.
- Successful scan submits `confirm_pickup`.
- Successful response shows `Custody accepted`.
- Successful response routes to next driver custody step.
- Wrong package scan maps to mismatch recovery.
- Manual fallback requires supervisor approval.
- Offline queue uses durable outbox and idempotency key.
- Queued pickup does not display final custody success before sync.
- Duplicate pending action blocks another submit.
- Scope failure blocks scanner.

Custody:

- Run acceptance does not move custody.
- Manifest review does not move custody.
- Camera scan does not move custody until server success.
- Server success records current custodian as driver.
- Handoff event `origin_station_to_driver` is visible after refresh.
- Station operator cannot submit this mutation through this screen.

Offline:

- Fresh cache allows scan capture.
- Stale cache blocks offline scan.
- Reconnect drains pickup action once.
- Reconnect success updates delivery state.
- Reconnect conflict preserves local evidence and prompts review.
- Airplane-mode reload with no cache blocks scanning.

Accessibility:

- Screen has primary test ID `screen-driver-origin-pickup-scan`.
- Status changes are announced.
- Controls have accessible labels.
- No action target is below target minimum.
- Reduced motion disables scanner pulse.
- Manual entry is usable without camera.

Security:

- Raw scan code is not logged to analytics.
- Raw scan code is not visible after detection.
- Outbox payload is protected.
- Supervisor override is only sent after approval.
- Screenshot policy follows secure screen configuration if enabled.

## Test Matrix
Unit tests:

- `confirmDriverPickupRequestSchema` accepts valid body.
- `confirmDriverPickupRequestSchema` rejects short scan code.
- `confirmDriverPickupRequestSchema` trims scan code.
- Local scanner validator rejects empty code.
- Local scanner validator rejects code over 80 characters.
- Offline prerequisites reject stale assignment.
- Offline prerequisites reject assignment mismatch.
- Analytics redaction removes scan code.

Component tests:

- Renders custody header.
- Renders camera permission panel.
- Renders scanner controls.
- Renders mismatch drawer.
- Renders manual fallback drawer.
- Renders offline queued panel.
- Renders success panel.
- Hides full scan code.

Integration tests:

- Online scan success calls `confirm_pickup`.
- Online mismatch shows `Wrong package scanned`.
- `FORBIDDEN` assignment mismatch blocks pickup.
- `INVALID_STATUS_TRANSITION` refreshes delivery.
- Offline queued action drains once after reconnect.
- Manual fallback submits `fallbackUsed=true`.
- Supervisor override is included only after approval.

End-to-end tests:

- `e2e-driver-origin-pickup-scan-success`
- `e2e-driver-origin-pickup-scan-mismatch`
- `e2e-driver-origin-pickup-offline-queued`
- `e2e-driver-origin-pickup-offline-conflict`
- `e2e-driver-origin-pickup-manual-fallback`
- `e2e-driver-origin-pickup-scope-denied`

## Performance
Targets:

- Screen shell visible under 1 second on cached data.
- Camera preview starts under 2 seconds after permission granted.
- Scan decode feedback under 300 milliseconds after decoder result.
- Mutation submit feedback under 100 milliseconds after tap or scan.
- Success panel visible under 500 milliseconds after server response.

Scanner performance:

- Prefer targeted barcode formats.
- Avoid processing every frame if previous frame is still processing.
- Use background decoding.
- Keep UI thread responsive.
- Pause scanner while mutation is in flight.

Low-end device:

- Use lower analysis resolution when needed.
- Keep camera overlay simple.
- Avoid heavy shadows over camera preview.
- Avoid map or media loading on this screen.

## Edge Cases
Multiple packages in camera:

- Ask driver to isolate one label.
- Do not submit.

Driver scans station badge:

- Treat as unsupported code.
- Show `Scan the package label, not an ID badge.`

Driver scans destination label:

- Server should reject through mismatch or validation.
- UI maps to wrong package recovery.

Package code changed after cache:

- Server rejects mismatch.
- UI refetches detail and opens support.

Assignment changed after scan:

- Server returns `FORBIDDEN`.
- UI says package must remain at station.

Status changed after scan:

- Server returns `INVALID_STATUS_TRANSITION`.
- UI refreshes status and prevents duplicate pickup.

Network drops after request sent:

- If server response unknown, show `Checking pickup result`.
- Refetch delivery before offering retry.
- Do not create another request until idempotency result is known.

Device clock wrong:

- Use server timestamps for confirmed events.
- Mark local queued timestamp as device time only.

Supervisor approval expires:

- Require fresh supervisor approval before manual fallback submit.

Outbox action older than policy:

- Mark as needs review.
- Do not auto-submit if assignment or status may be stale.

## Implementation Notes For Claude Code
Build this screen as a real operational mutation screen.

Required implementation sequence:

1. Load auth and delivery detail.
2. Enforce role, capability, assignment, and status before camera opens.
3. Mount scanner only after scope passes.
4. Decode one supported code.
5. Validate local length boundaries.
6. Submit `confirm_pickup` or queue under offline policy.
7. Invalidate caches after server success.
8. Render final success only from server-confirmed state.
9. Add accessibility labels and live status messages.
10. Add tests for success, mismatch, scope, offline, and manual fallback.

Suggested hook names:

- `useDriverPickupScanScreen`
- `useConfirmPickupMutation`
- `usePackageScanner`
- `usePickupOfflinePolicy`
- `usePickupOutboxAction`
- `useSupervisorOverride`
- `useCustodyCacheInvalidation`

Suggested component boundaries:

- `DriverPickupScanScreen` owns route, data, and state transitions.
- `PackageScanViewport` owns camera and decoder integration.
- `CustodyGateHeader` owns status copy.
- `PickupRecoveryDrawer` owns errors and recovery actions.
- `ManualFallbackDrawer` owns supervised entry.
- `PickupSuccessPanel` owns server-confirmed success.

## API Mapping
Read before mutation:

- `GET /v1/deliveries/:id`

Primary mutation:

- `POST /v1/deliveries/:id/confirm-pickup`

Post-success refresh:

- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`

Request mapping:

- Scanner decoded value -> `packageScanCode`
- Normal scan -> `fallbackUsed=false` or omit
- Supervised manual entry -> `fallbackUsed=true`
- Supervisor approval actor -> `supervisorOverrideActorId`

Cache invalidation mapping:

- `Delivery:${deliveryId}`
- `DeliveryTimeline:${deliveryId}`
- `DriverQueue:${actorId}`
- `StationQueue:${originStationId}`
- `CustodyChain:${deliveryId}`

## Design System Tokens
Use existing mobile tokens when implemented. Required semantic tokens:

- `color.surface.scanner`
- `color.text.inverse`
- `color.status.custodyStation`
- `color.status.custodyDriver`
- `color.status.pending`
- `color.status.error`
- `color.status.success`
- `color.border.scanFrame`
- `color.border.scanFrameActive`
- `color.overlay.cameraDim`
- `space.screenPadding`
- `space.sheetGap`
- `radius.sheet`
- `radius.control`
- `motion.scanPulse`
- `motion.panelEnter`

If a token is missing, add it to the design system rather than hardcoding a one-off value in this screen.

## Content Checklist
Visible before scan:

- Delivery tracking identity.
- Origin station.
- Destination station.
- Assigned driver state.
- Current custodian state.
- Scan instruction.
- Offline status.

Visible after scan detected:

- Verification status.
- Safe suffix only if needed.
- No full code.

Visible after success:

- Custody accepted.
- Driver responsibility message.
- Event ID when returned.
- Continue action.
- Custody chain action.

Visible after queued offline:

- Pending sync.
- Outbox action.
- Release policy message.
- Support action.

## Release Gates
This screen is not complete until:

- Online success path is implemented against `confirm_pickup`.
- Assignment mismatch is tested.
- Package mismatch is tested.
- Offline queue is tested.
- Manual fallback is tested.
- Full scan code redaction is tested.
- Accessibility live announcements are tested.
- CI includes component and integration coverage for critical states.
- E2E includes at least one happy path and one mismatch path.
- No route copy claims custody before server success.

## Final Build Standard
The final UI should make one thing impossible to miss:

`The driver does not own the package until the assigned driver account scans the correct package label and the server records the origin-station-to-driver handoff.`

If the implementation preserves that rule under online, offline, error, and fallback conditions, the screen is ready for production build.

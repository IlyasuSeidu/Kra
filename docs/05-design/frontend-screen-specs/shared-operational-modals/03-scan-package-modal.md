# Scan Package Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `ScanPackageModal` |
| Component target | shared scanner modal for `apps/mobile`, with web/admin read-only compatibility where camera support exists |
| Primary test ID | `modal-scan-package` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 operations safety component |
| Used by | station intake, station dispatch readiness, driver pickup custody, destination receipt, courier final-mile custody acceptance |
| Backend coverage | handoff routes through host-owned mutations |
| Primary input | package scan code captured by camera or controlled manual entry |
| Required states | `closed`, `opening`, `loading_context`, `camera_permission_pending`, `camera_ready`, `camera_unavailable`, `camera_denied`, `scanning`, `scan_detected`, `scan_review`, `manual_entry`, `manual_entry_review`, `fallback_supervisor_required`, `confirm_before_submit`, `submitting`, `submitted`, `mismatch`, `duplicate_scan`, `scope_blocked`, `assignment_blocked`, `status_blocked`, `payment_blocked`, `offline_ready`, `offline_blocked`, `offline_queued`, `network_error`, `server_rejected`, `closing` |

## Product Job
`ScanPackageModal` captures one physical package scan code for one delivery and one operational intent. It gives station operators, drivers, and final-mile couriers a fast scanner while preserving the strict custody rules that prevent package loss.

The modal answers:
- `Which delivery am I scanning for?`
- `Which handoff or readiness step is this scan for?`
- `Will this scan move custody or only record readiness?`
- `Is the current actor allowed to perform this scan?`
- `Did the camera read one code clearly enough?`
- `Can manual entry be used, and what authorization is required?`
- `What should happen if the scan is wrong, repeated, blocked, or offline?`

The staff user should be able to:
- Open a camera scanner quickly.
- See delivery identity and scan intent before scanning.
- Align the package label inside a clear scan frame.
- Get fast visual, haptic, and accessible feedback after a code is detected.
- Review the detected code in redacted form.
- Use manual entry only through a controlled fallback path.
- Return a captured code to the host when parent form fields are missing.
- Submit through the host only when the full request is ready.
- Recover from permission denial, unreadable labels, wrong package, repeated scan, status conflict, scope conflict, assignment conflict, offline state, and server rejection.

This modal is not:
- A generic barcode reader.
- A package search tool.
- A delivery detail page.
- A custody-chain timeline.
- A supervisor override console.
- A proof-of-delivery camera.
- A receiver OTP form.
- A package label printer.
- A payment screen.
- A place to bypass backend permission, scope, assignment, lifecycle, or label-binding checks.

## Strategic Role
Kra's physical custody model depends on a package scan code that stays bound to one delivery. The scanner is therefore a loss-prevention control, not a convenience widget. A fast scan must still prove three things: the right actor, the right delivery, and the right handoff intent.

Core principle:
- The modal captures and validates the scan interaction.
- The host owns delivery context, required parent fields, online policy, and mutation execution.
- Backend services own label binding, lifecycle transition, custody movement, scope checks, assignment checks, and final acceptance.
- Manual entry is a fallback, not an equal default path.
- A camera read is not custody transfer until the backend or approved offline outbox accepts the full action.
- Raw scan code must not leak outside the active scan workflow.

## Audience
Primary users:
- Station operators receiving packages at origin.
- Station operators marking dispatch readiness.
- Station operators receiving packages at destination.
- Drivers confirming origin pickup.
- Final-mile couriers accepting assigned packages.

Secondary users:
- Station leads authorizing fallback handoffs.
- Operations leads reviewing scan reliability and loss controls.
- Support staff handling scan conflicts.
- QA validating scanner, fallback, offline, and error states.
- Accessibility reviewers validating camera, manual entry, focus, status, and recovery.
- Claude Code implementing shared scanner primitives later.

Non-users:
- Senders.
- Receivers.
- Public tracking visitors.
- Finance admins.
- Webhook processors.
- Scheduled jobs.
- AI agents acting without physical staff confirmation.

## Current Backend Reality
Implemented scan fields:
- `labelScanCode` for origin intake.
- `packageScanCode` for dispatch readiness, driver pickup, destination receipt, and final-mile custody acceptance.

Shared scan-code validation:
- String is trimmed.
- Minimum length is `4`.
- Maximum length is `80`.

Implemented fallback fields:
- `fallbackUsed`
- `supervisorOverrideActorId`

Implemented handoff request schemas:
- `confirmIntakeRequestSchema`
- `dispatchDeliveryRequestSchema`
- `confirmDriverPickupRequestSchema`
- `receiveDestinationRequestSchema`
- `acceptFinalMileAssignmentRequestSchema`

Implemented label binding:
- Origin intake reserves a package label for one delivery.
- Later scans must match the immutable delivery-label binding when the package-label repository is configured.
- Unknown or other-delivery scan codes return `PACKAGE_SCAN_MISMATCH`.

Implemented custody effects:
- `confirm_intake` moves custody to origin station operator.
- `dispatch_delivery` records readiness and does not move custody.
- `confirm_pickup` moves custody from origin station to assigned driver.
- `receive_destination` moves custody from assigned driver to destination station and routes the package onward.
- `accept_final_mile_assignment` moves custody from destination station to assigned courier.

Implemented access rules:
- Station operator intake requires origin station scope.
- Destination receipt requires destination station scope.
- Driver pickup requires assigned driver role and assignment match.
- Final-mile acceptance requires assigned final-mile courier role and assignment match.
- Every mutation still enforces role capability and lifecycle state.

Frontend implication:
- The modal must treat scan intent as required context.
- The modal must not infer custody outcome from a scan read.
- The modal must not expose the full scan code after review.
- The modal must map scanner output to the correct request field.
- The modal must show conflict-specific recovery and route to specialized conflict modals when needed.

## Source References
External references used for this modal:
- [Google ML Kit barcode scanning on Android](https://developers.google.com/ml-kit/vision/barcode-scanning/android): supports configuring expected barcode formats, image focus and resolution guidance, auto-zoom for distant codes, and real-time performance rules such as processing the latest frame.
- [Apple AVFoundation AVCaptureMetadataOutput](https://developer.apple.com/documentation/avfoundation/avcapturemetadataoutput): supports metadata capture for machine-readable codes, configured metadata object types, region of interest, and delegate callbacks for camera scanning.
- [Apple AVFoundation metadata object types](https://developer.apple.com/documentation/avfoundation/metadata-types): supports machine-readable code objects for 2D and 3D code capture on Apple platforms.
- [MDN Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API): supports web barcode detection capability checks, secure-context limits, supported formats, and fallback planning because browser support is not universal.
- [W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/): supports camera permission, media stream track lifecycle, constraints, privacy indicators, and device access controls for web camera capture.
- [WAI-ARIA Authoring Practices: Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports modal semantics, focus containment, inert background, Escape behavior, and focus return.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports explicit messages for invalid manual entry, permission denial, and blocked submit.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible camera status, scan detected, submit progress, queue status, and rejection announcements.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for scanner controls, torch toggle, manual entry, and recovery actions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/04-station-package-intake.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/07-driver-origin-pickup-scan.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/13-station-destination-receipt.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/app.ts`

## Design Brief
Audience:
- Field operations staff scanning a physical package at a custody or readiness point.

Context of use:
- Mobile, one-handed, camera active, noisy stations, glare, low light, crowded counters, weak connectivity, and physical package handling.

Entry point:
- Host screen opens the modal for one delivery and one scan intent.

Success state:
- A scan code is captured and either returned to the host or submitted through a host-owned operation with authoritative result handling.

Primary action:
- `Scan package`

Safe action:
- `Close scanner`

Navigation model:
- Full-screen modal on mobile.
- Centered or panel modal on web/admin only for fallback or camera-capable environments.

Density:
- Low during active scan.
- Medium during review, fallback, and blocked states.

Visual thesis:
- A dark custody scanner with a clear target chamber, a strict intent banner, and a quiet recovery rail that never lets speed outrun proof.

Restraint rule:
- Do not add route maps, long timeline history, payment details, full receiver information, or full scan-code display.

Product lens:
- Field-speed scanner with audit-grade custody discipline.

System stance:
- Native camera where available, web camera only where secure and supported, manual fallback as controlled exception.

Interaction thesis:
- Confirm context, scan once, review safely, submit or return to host, recover without ambiguity.

Signature move:
- A top custody-intent banner that tells the user whether the scan will bind label, record readiness, or move custody before the camera starts.

Activation event:
- One clear scan value is detected and the user confirms how it will be used.

## Relationship To Other Shared Modals
`ScanPackageModal` is the entry scanner.

It should route or compose with:
- `WrongPackageScannedModal` when backend or local context says the code does not match the delivery.
- `PackageLabelAlreadyUsedModal` when the label was already bound or already received.
- `AcceptCustodyModal` when a detected scan must be paired with explicit driver or courier custody acceptance.
- `AuditSensitiveActionAckModal` when a manual fallback requires audit acknowledgement.

Do not:
- Stack scanner and conflict modals visually at the same time.
- Hide mismatch resolution inside a generic error banner.
- Let `AcceptCustodyModal` scan for the package itself.
- Let scanner fallback approve supervisor override by itself.

## Host Responsibilities
The host must provide:
- `deliveryId`
- user-facing delivery reference
- scan intent
- current delivery status
- current custody role
- current custody actor display when role-safe
- next required actor display when role-safe
- actor role
- actor station scope when relevant
- assignment context when relevant
- payment status when relevant
- freshness timestamp
- offline policy
- required parent fields status
- submit callback or return-code callback
- close callback
- conflict route callbacks

The host must refresh:
- Delivery detail before enabling a custody-moving submit.
- Permission and assignment context when session role can change.
- Offline queue status if the modal opens from recovery.

The host must not:
- Open the modal without scan intent unless exactly one safe intent can be derived.
- Submit from cached-only context for online-required handoffs.
- Let stale route params decide custody movement.
- Store raw scan code in long-lived global state.
- Log raw scan code.
- Show full raw scan code outside active review.

## Modal Responsibilities
The modal must:
- Manage camera permission request and camera lifecycle.
- Render a scan frame, guidance, torch control, and manual fallback action.
- Detect one code at a time.
- Pause scanning after detection.
- Normalize captured code by trimming whitespace.
- Validate local length bounds.
- Redact code in review.
- Ask for confirmation before passing code to host submit where the action changes custody.
- Preserve accessibility, focus, and status messages.
- Stop camera stream when closed or backgrounded.
- Clear raw scan value after close, success, or route change.

The modal must not:
- Decide backend eligibility alone.
- Move custody.
- Bind a label without host mutation.
- Infer package match from visible delivery reference.
- Compare against a stored raw code from host UI.
- Record supervisor override alone.
- Persist scan code after close.
- Retry mutation automatically.
- Submit more than once for one confirmed scan.

## Supported Scan Intents
`intake_label_binding`:
- User: origin station operator.
- Request field: `labelScanCode`.
- Target schema: `confirmIntakeRequestSchema`.
- Required parent fields: measured weight, size tier, package condition.
- Backend operation: `confirm_intake`.
- Effect: binds first package label and moves custody to origin station.

`dispatch_readiness`:
- User: origin station operator.
- Request field: `packageScanCode`.
- Target schema: `dispatchDeliveryRequestSchema`.
- Required parent fields: none beyond scan context.
- Backend operation: `dispatch_delivery`.
- Effect: records readiness for assigned driver.
- Custody movement: no.

`driver_pickup_custody`:
- User: assigned driver.
- Request field: `packageScanCode`.
- Target schema: `confirmDriverPickupRequestSchema`.
- Required parent fields: none beyond scan context.
- Backend operation: `confirm_pickup`.
- Effect: moves custody to assigned driver.

`destination_receipt`:
- User: destination station operator.
- Request field: `packageScanCode`.
- Target schema: `receiveDestinationRequestSchema`.
- Required parent fields: condition and next step.
- Backend operation: `receive_destination`.
- Effect: moves custody to destination station and routes package to pickup, doorstep, or issue queue.

`courier_accept_custody`:
- User: assigned final-mile courier.
- Request field: `packageScanCode`.
- Target schema: `acceptFinalMileAssignmentRequestSchema`.
- Required parent fields: optional note only when host provides one.
- Backend operation: `accept_final_mile_assignment`.
- Effect: moves custody to assigned courier.

## Intent Banner
The intent banner must appear above the scan frame before camera activation.

Banner fields:
- delivery reference
- human scan intent label
- custody impact
- current status
- current custodian
- next required actor

Intent labels:
- `intake_label_binding`: `Origin intake label`
- `dispatch_readiness`: `Dispatch readiness scan`
- `driver_pickup_custody`: `Driver pickup custody`
- `destination_receipt`: `Destination receipt scan`
- `courier_accept_custody`: `Courier custody acceptance`

Custody impact labels:
- `Binds package label`
- `Does not move custody`
- `Moves custody to driver`
- `Moves custody to destination station`
- `Moves custody to courier`

Banner must:
- Be visible before the camera preview.
- Stay pinned during active scan on mobile.
- Use high contrast over dark scanner surface.
- Use plain language before backend terms.

Banner must not:
- Show raw scan code.
- Show receiver phone.
- Show full address.
- Show provider or payment references.
- Show internal actor IDs.

## Camera Permission Flow
`camera_permission_pending`:
- Show why camera access is needed.
- Show `Allow camera` action.
- Show `Enter code manually` as secondary action only if manual path is allowed by host.

Permission copy:
- Title: `Allow camera to scan package label`
- Body: `Kra uses the camera only to read the package label for this handoff step.`

If permission is denied:
- Title: `Camera access is blocked`
- Body: `Turn on camera access in device settings or use supervised manual entry if this workflow allows it.`
- Actions: `Open settings`, `Enter code manually`, `Close scanner`

If camera is unavailable:
- Title: `Camera is not available`
- Body: `Use supervised manual entry or return to the delivery.`

Rules:
- Do not request camera permission before the user opens the scanner.
- Do not keep camera running behind other screens.
- Do not require camera permission to view blocked state.
- Stop camera tracks on close, submit, or background.
- Respect platform privacy indicators.

## Camera Scanner UI
Core elements:
- top intent banner
- live camera preview
- centered scan frame
- edge alignment guides
- short instruction line
- torch toggle when supported
- manual entry action
- close action
- scan status message
- bottom recovery rail

Instruction copy:
- `Hold the package label inside the frame.`
- `Move closer until the label is sharp.`
- `Use torch if the label is dark.`
- `Keep the phone steady until the code is detected.`

Scanner behavior:
- Prefer rear camera.
- Use a region of interest aligned to the visible scan frame when platform supports it.
- Target known label formats configured by the implementation.
- Use platform zoom suggestions when supported.
- Require consecutive identical reads or platform confidence equivalent before accepting a value.
- Pause scanner when a value is accepted.
- Prevent repeated haptic feedback for the same value.

Scanner must not:
- Submit on first camera frame without review.
- Accept multiple values at once.
- Read codes from unrelated background areas when a region of interest is available.
- Show continuous noisy warnings while the user is aligning the label.
- Keep torch on after close.

## Scan Detection Rules
Accepted scan:
- One code detected.
- Trimmed value length is between `4` and `80`.
- Same detected value remains stable long enough for confidence.
- Modal is still active.
- Host context still matches the delivery.

Rejected local scan:
- Empty value.
- Trimmed value shorter than `4`.
- Trimmed value longer than `80`.
- More than one code detected and no primary value can be safely selected.
- Unsupported format when implementation can identify format.
- Scanner result arrives after modal is closing.

Local rejection copy:
- `This code is too short. Scan the package label again.`
- `This code is too long. Scan the package label again.`
- `More than one code is visible. Center only the package label.`
- `This code format is not supported for package labels.`

Local rules:
- Do not call backend for local validation failures.
- Resume scanner after the user taps `Scan again`.
- Offer manual entry after repeated unreadable attempts when host allows fallback.

## Scan Review
After detection:
- Pause camera.
- Show detected code in redacted form.
- Show scan intent.
- Show custody impact.
- Show next action.

Redacted format:
- Show first 3 and last 3 characters when length permits.
- Mask middle characters.
- For very short valid values, show a shorter mask without full reveal.

Review copy:
- Title: `Package code detected`
- Body: `Review the handoff step before continuing.`

Actions:
- `Use this scan`
- `Scan again`
- `Enter code manually`
- `Close scanner`

For custody-moving intents, `Use this scan` should move to confirmation, not directly submit unless the host has already rendered a confirmation step.

Review must not:
- Show full raw value by default.
- Copy raw value to clipboard.
- Send raw value to analytics.
- Allow text selection of the raw value.

## Manual Entry
Manual entry is allowed only when the host permits fallback for the current workflow.

Manual entry states:
- `manual_entry`
- `manual_entry_review`
- `fallback_supervisor_required`

Field label:
- `Enter package label code`

Field hint:
- `Use this only when the label cannot be scanned.`

Validation:
- Trim whitespace.
- Minimum length `4`.
- Maximum length `80`.
- Empty value blocks continue.
- Unsupported control characters block continue.

Manual entry review:
- Show redacted value.
- Show fallback warning.
- Show supervisor requirement when configured.
- Show `fallbackUsed=true` in user-safe language.

Manual entry must:
- Require explicit user action before use.
- Record fallback intent through host payload when submitted.
- Ask for supervisor flow when host requires it.
- Keep visible distinction from camera scan.

Manual entry must not:
- Be the default path.
- Look identical to camera success.
- Hide fallback audit language.
- Submit without review.
- Save value after close.

## Supervisor Fallback
Supervisor fallback is required when:
- Host workflow requires supervisor approval for manual entry.
- Camera is unavailable and the action moves custody.
- The label is damaged and the package still physically changes hands.
- Offline policy allows queue only with supervisor reference.

Supervisor fallback data:
- `fallbackUsed=true`
- `supervisorOverrideActorId`

Fallback modal copy:
- Title: `Supervisor approval required`
- Body: `Manual package-code entry creates shared accountability until the next clean handoff.`

Actions:
- `Request supervisor`
- `Back to scanner`
- `Close scanner`

Rules:
- `ScanPackageModal` may collect that fallback is required, but supervisor identity capture should be owned by host or dedicated audit acknowledgement flow.
- Do not invent supervisor ID locally.
- Do not submit fallback action without required supervisor context.
- Do not let fallback reduce backend checks.

## Confirmation Step
Confirmation is required for:
- `intake_label_binding`
- `driver_pickup_custody`
- `destination_receipt`
- `courier_accept_custody`

Confirmation is optional for:
- `dispatch_readiness`, unless host policy requires it.

Confirmation title by intent:
- `intake_label_binding`: `Bind this label to the delivery?`
- `dispatch_readiness`: `Use this scan for dispatch readiness?`
- `driver_pickup_custody`: `Accept driver custody with this scan?`
- `destination_receipt`: `Receive this package at destination?`
- `courier_accept_custody`: `Accept courier custody with this scan?`

Confirmation body by intent:
- `intake_label_binding`: `This scan code becomes the package label for this delivery.`
- `dispatch_readiness`: `This records the package as ready for the assigned driver. Custody stays with the station.`
- `driver_pickup_custody`: `If the server accepts this scan, custody moves to the assigned driver.`
- `destination_receipt`: `If the server accepts this scan, custody moves to the destination station.`
- `courier_accept_custody`: `If the server accepts this scan, custody moves to the assigned courier.`

Actions:
- safe: `Scan again`
- destructive or primary: intent-specific submit label

Submit labels:
- `Bind label`
- `Record readiness`
- `Accept driver custody`
- `Receive package`
- `Accept courier custody`

## Required Parent Fields
Some workflows need fields outside the scanner.

`intake_label_binding` requires:
- measured weight
- size tier
- condition

`destination_receipt` requires:
- condition
- next step

If parent fields are missing:
- Capture scan code.
- Show `Scan captured. Finish required details to submit.`
- Return code to host through same-session secure state.
- Do not submit mutation from the modal.
- Clear code if host route changes to another delivery.

If parent fields exist:
- Modal may proceed to confirmation and host submit.

## Offline Rules
Offline support depends on host workflow.

Allowed offline behavior:
- Capture scan value for current session.
- Build a pending action only when host offline policy explicitly allows it.
- Show that custody is pending sync, not confirmed.
- Send user to offline outbox when action is queued.

Blocked offline behavior:
- Do not queue when host has stale delivery context.
- Do not queue when assignment or station scope is unknown.
- Do not queue when parent fields are missing.
- Do not queue when workflow requires live backend match.
- Do not claim custody moved while offline.

Offline copy:
- Title: `Offline scan captured`
- Body: `This handoff is pending until Kra syncs it with the server.`

Offline blocked copy:
- Title: `Reconnect before scanning`
- Body: `This handoff needs a live server check before it can continue.`

Outbox handoff:
- Host owns queue creation.
- Modal passes normalized scan code and fallback flags to host only after confirmation.
- Host should route to `OpsOfflineOutbox` after queue acceptance.

## Error Handling
`PACKAGE_SCAN_MISMATCH`:
- Title: `Wrong package scanned`
- Body: `This scan code does not match the selected delivery.`
- Actions: `Scan again`, `Open custody chain`, `Report issue`
- Route to `WrongPackageScannedModal` when the host has enough context.

`DUPLICATE_SCAN`:
- Title: `Scan already recorded`
- Body: `This package scan was already recorded for this step.`
- Actions: `Open custody chain`, `Back to delivery`

`PACKAGE_ALREADY_RECEIVED`:
- Title: `Package already received`
- Body: `This package has already been received in the current workflow.`
- Actions: `Open custody chain`, `Back to queue`

`STATION_SCOPE_VIOLATION`:
- Title: `Outside station scope`
- Body: `This delivery is outside your station scope.`
- Actions: `Back to delivery`, `Contact support`

`ASSIGNMENT_SCOPE_VIOLATION`:
- Title: `Not assigned to you`
- Body: `This job is assigned to another staff member.`
- Actions: `Back to list`, `Contact support`

`INVALID_STATUS_TRANSITION`:
- Title: `Status changed`
- Body: `This delivery cannot move through this handoff step now. Refresh the delivery.`
- Actions: `Refresh delivery`, `Open custody chain`

`DELIVERY_NOT_PAID`:
- Title: `Payment not confirmed`
- Body: `Transport or final-mile movement is blocked until payment is confirmed.`
- Actions: `Back to delivery`, `Contact support`

`VALIDATION_ERROR`:
- Title: `Check scan details`
- Body: `The scan request is missing required information.`
- Actions: `Review details`, `Back to delivery`

`AUTH_REQUIRED`:
- Title: `Sign in again`
- Body: `Your session expired before this scan could be confirmed.`
- Actions: `Sign in`

`FORBIDDEN_ROLE`:
- Title: `Permission denied`
- Body: `Your role cannot perform this scan.`
- Actions: `Back to delivery`

Network error:
- Title: `Connection lost`
- Body: `The scan was not confirmed. Try again when the connection is stable.`
- Actions: `Try again`, `Back to delivery`

Unknown error:
- Title: `Scan could not be confirmed`
- Body: `Kra could not complete this handoff step. Try again or contact support.`
- Actions: `Try again`, `Contact support`

Error rules:
- Preserve current captured value after server rejection unless the error proves it is unsafe to reuse.
- Resume camera only after user chooses `Scan again`.
- Do not call success callbacks after failed submit.
- Do not hide backend error category behind generic copy when a staff-safe code exists.
- Do not show raw backend payload.

## State Machine
`closed`:
- Modal is not rendered.
- Camera stream is stopped.
- Raw scan value is cleared.

`opening`:
- Modal shell appears.
- Intent banner renders before camera permission request.

`loading_context`:
- Host refreshes delivery, permission, and assignment data.
- Camera action is disabled.
- Close remains available.

`camera_permission_pending`:
- User can grant camera permission or open manual fallback if allowed.

`camera_ready`:
- Camera stream is active.
- Scanner waits for a code.

`camera_unavailable`:
- Device or platform cannot provide camera scanning.
- Manual fallback may be offered.

`camera_denied`:
- Camera permission was denied.
- Manual fallback or settings route appears.

`scanning`:
- Camera frames are being analyzed.
- No code has been accepted.

`scan_detected`:
- Scanner found a candidate value.
- Scanning pauses.

`scan_review`:
- User reviews redacted code and intent.

`manual_entry`:
- User types code under fallback rules.

`manual_entry_review`:
- User reviews redacted manually entered value and fallback warning.

`fallback_supervisor_required`:
- Host must collect or confirm supervisor context before submit.

`confirm_before_submit`:
- User confirms the exact scan intent.

`submitting`:
- Host mutation or queue creation is running.
- Repeated submit is blocked.

`submitted`:
- Host accepted scan result or queued action.
- Modal closes or shows compact result depending host flow.

`mismatch`:
- Scan conflicts with delivery.
- Route to conflict handling.

`duplicate_scan`:
- Scan already recorded for this step.
- Route to custody chain.

`scope_blocked`:
- Station scope blocks submit.

`assignment_blocked`:
- Driver or courier assignment blocks submit.

`status_blocked`:
- Lifecycle status blocks submit.

`payment_blocked`:
- Payment state blocks movement.

`offline_ready`:
- Host permits offline queue.
- User still sees pending-sync language.

`offline_blocked`:
- Host requires live backend check.

`offline_queued`:
- Host accepted durable queue entry.
- User can open outbox.

`network_error`:
- Request did not complete.

`server_rejected`:
- Backend rejected the request with an error code.

`closing`:
- Camera stream stops and local scan value clears.

## Data Contract
Component props:
- `isOpen: boolean`
- `deliveryId: string`
- `deliveryReference: string`
- `scanIntent: ScanPackageIntent`
- `currentStatus: DeliveryStatus`
- `currentCustodyRole?: string | null`
- `currentCustodyDisplay?: string`
- `nextRequiredActorDisplay?: string`
- `actorRole: "station_operator" | "driver" | "final_mile_courier" | "support" | "admin" | string`
- `actorStationId?: string`
- `originStationId?: string`
- `destinationStationId?: string`
- `assignedDriverId?: string`
- `assignedFinalMileCourierId?: string`
- `paymentStatus?: PaymentStatus`
- `requiredParentFieldsReady: boolean`
- `allowsManualEntry: boolean`
- `requiresSupervisorForManualEntry: boolean`
- `allowsOfflineQueue: boolean`
- `isOnline: boolean`
- `lastRefreshedAt?: string`
- `onRefreshContext: () => Promise<ScanPackageContext>`
- `onSubmitScan: (input: ScanPackageSubmitInput) => Promise<ScanPackageSubmitResult>`
- `onReturnScanToHost: (input: ScanPackageCapturedInput) => void`
- `onClose: () => void`
- `onOpenCustodyChain: () => void`
- `onReportIssue: () => void`
- `onOpenOutbox: () => void`

Types:
- `ScanPackageIntent = "intake_label_binding" | "dispatch_readiness" | "driver_pickup_custody" | "destination_receipt" | "courier_accept_custody"`
- `ScanCaptureMethod = "camera" | "manual"`

Submit input:
- `deliveryId`
- `scanIntent`
- `captureMethod`
- `scanCode`
- `fallbackUsed`
- optional `supervisorOverrideActorId`

Host maps submit input to:
- `labelScanCode` for intake label binding.
- `packageScanCode` for all other supported intents.

Never submit from modal:
- redacted scan value
- display label
- actor display name
- current status
- payment status
- receiver data
- internal route metadata

## Role Rules
Station operator:
- Can use origin intake at origin station.
- Can use dispatch readiness at origin station when host allows.
- Can use destination receipt at destination station.
- Cannot use driver pickup or courier acceptance.
- Must see station-scope block when station mismatch exists.

Driver:
- Can use driver pickup only when assigned.
- Cannot receive destination package.
- Cannot bind origin label.
- Cannot accept final-mile custody.
- Must see assignment block for wrong assignment.

Final-mile courier:
- Can use courier acceptance only when assigned.
- Cannot perform station receipt.
- Cannot perform driver pickup.
- Must see assignment block for wrong assignment.

Support/admin:
- Should not use scanner for normal custody movement.
- May view or initiate scanner only in controlled operational support contexts.
- Must not bypass backend role checks.

Sender and receiver:
- Must not use this modal.

## Privacy And Data Safety
Sensitive data never shown:
- full scan code after review
- provider references
- payment IDs
- internal actor IDs
- receiver OTP
- full receiver phone
- precise receiver address
- raw backend conflict payload
- proof references

Sensitive data never logged:
- raw scan code
- full address
- receiver phone
- actor ID
- supervisor ID unless backend audit requires it
- camera frame data

Allowed telemetry:
- modal opened
- scan intent
- actor role bucket
- camera permission state
- capture method
- local validation result
- error code
- submit result
- offline queued flag
- fallback used flag
- elapsed scan time bucket

Telemetry must not include:
- raw scan code
- camera frame
- manual entry value
- receiver data
- provider references
- access token

## Accessibility
Modal semantics:
- Use full-screen native modal on mobile.
- Web/admin fallback uses `role="dialog"` and `aria-modal="true"`.
- Background content is inert while modal is open.
- Title and intent banner must be programmatically labelled.

Focus:
- On open, focus the modal title or first permission action.
- After permission success, focus scan instructions rather than hidden camera surface.
- After scan detection, focus review title.
- After validation error, focus first invalid manual entry field or error summary.
- After backend rejection, focus error heading.
- On close, return focus to invoking scan action.

Screen reader:
- Announce camera permission requirement.
- Announce current scan intent.
- Announce `Scanning active`.
- Announce `Package code detected`.
- Announce local validation errors.
- Announce submit progress.
- Announce offline queue status.
- Announce backend rejection.

Manual entry:
- Field has clear label and hint.
- Error text is linked to field.
- Character limits are exposed in helper text.
- Input does not auto-submit from keyboard return.

Touch:
- Close, torch, manual entry, scan again, and submit targets meet minimum size.
- Destructive custody submit is not triggered by pointer down.
- Swipe-to-close on mobile must not submit.
- Back button closes only before submit unless host blocks it for active request safety.

Reduced motion:
- Scanner overlay can animate minimally.
- Disable non-essential pulses when reduced motion is requested.
- Haptic feedback should have visual and text equivalents.

High contrast:
- Scan frame must remain visible in bright and dark camera feeds.
- Do not rely on color alone for detected, error, or blocked states.
- Button focus must remain visible.

## Visual Design
Surface:
- Full-screen camera chamber on mobile.
- Dark neutral scanner background.
- High-contrast scan frame.
- Clear top identity and intent banner.
- Bottom sheet rail for actions and recovery.

Visual hierarchy:
- First: scan intent and delivery reference.
- Second: scan frame.
- Third: status instruction.
- Fourth: fallback and close actions.

Color:
- Use danger only for mismatch or blocked states.
- Use caution for fallback/manual entry.
- Use success only after accepted scan or queued action.
- Use neutral for active scan.

Typography:
- Intent label must be readable over camera.
- Instruction text must be short.
- Review text must be precise.
- Error titles must be direct.

Motion:
- Camera frame may pulse once when ready.
- Detection may use one haptic and one visual flash.
- Avoid constant animated targeting.
- Avoid celebratory animation for custody movement.

Iconography:
- Use camera, torch, keyboard, warning, and success icons only where useful.
- Icons must not replace labels.

## Copy System
Default title:
- `Scan package`

Default instruction:
- `Hold the package label inside the frame.`

Permission CTA:
- `Allow camera`

Manual entry CTA:
- `Enter code manually`

Scan again CTA:
- `Scan again`

Use scan CTA:
- `Use this scan`

Close CTA:
- `Close scanner`

Fallback title:
- `Manual entry requires review`

Submit progress:
- `Confirming scan...`

Offline queued:
- `Scan queued for sync`

Mismatch:
- `Wrong package scanned`

Duplicate:
- `Scan already recorded`

Do not use:
- `OK`
- `Proceed`
- `Submit`
- `Trust this code`
- `Force scan`
- `Override scan`
- `Custody complete` before backend or queue acceptance

## Platform Rules
iOS:
- Prefer native camera scanner backed by AVFoundation or VisionKit where product implementation allows.
- Configure metadata types to expected code formats.
- Use region of interest when practical.
- Respect camera permission and privacy indicators.
- Use haptics only after accepted read.

Android:
- Prefer CameraX plus ML Kit barcode scanning.
- Configure expected barcode formats for speed.
- Use image resolution that balances accuracy and latency.
- Use auto-zoom suggestions when supported.
- Process only the latest frame when analyzer is busy.
- Close frame resources correctly after analysis.

Web:
- Use web scanner only in secure contexts and supported browsers.
- Feature-detect barcode support.
- Fall back to manual entry when camera or detection is unavailable.
- Stop media tracks when modal closes.
- Do not rely on web scanner as the only path for operations mobile.

## Responsive Rules
Mobile portrait:
- Full-screen modal.
- Intent banner at top.
- Camera frame centered.
- Bottom action rail above safe area.
- Manual entry field moves above keyboard.

Mobile landscape:
- Use two-zone layout: camera left, intent and actions right.
- Keep scan frame visible.
- Avoid hiding close action.

Tablet:
- Use large scan frame with side confirmation rail.
- Keep identity banner pinned.

Desktop web:
- Use centered scanner panel when camera is supported.
- Use manual fallback panel when camera unsupported.
- Do not stretch camera feed across full dashboard.

Small screens:
- Keep delivery reference short.
- Collapse secondary metadata.
- Keep the scan instruction visible.
- Keep manual entry reachable.

## Performance
Requirements:
- Scanner shell appears immediately.
- Camera permission prompt is user-triggered.
- Camera preview starts as fast as platform permits.
- Detection loop must not block UI thread.
- Haptic and visual feedback should occur promptly after accepted read.
- Submit lock must happen immediately on confirmation.
- Camera stops promptly after close.

Scanner performance rules:
- Limit barcode formats where possible.
- Use a visible region of interest where possible.
- Process current frame rather than accumulating old frames.
- Avoid rendering overlays separately from camera feed when one render pass is enough.
- Avoid full-resolution camera frames when they harm latency without improving scan reliability.

Do not:
- Load full delivery timeline inside modal.
- Render heavy animation over camera preview.
- Fetch broad queues from modal.
- Keep camera stream alive after close.

## Security Rules
Security expectations:
- Frontend validation is never authority.
- Backend verifies permission, assignment, scope, status, and package match.
- Raw scan code is treated as sensitive operational evidence.
- Manual fallback must be auditable.
- Supervisor override identity must come from authenticated workflow, not free text.
- Mismatch must route to review, not silent retry loops only.

Fraud controls:
- Manual entry is visually marked as fallback.
- Fallback payload sets `fallbackUsed=true`.
- Supervisor context is required when host policy says so.
- Repeated submit is blocked.
- Same scan value should not repeatedly call host submit without user action.
- Scanner must not accept background or unrelated codes when a single package label should be centered.

## Analytics
Events:
- `scan_package_modal_opened`
- `scan_package_camera_permission_requested`
- `scan_package_camera_permission_denied`
- `scan_package_camera_ready`
- `scan_package_detected`
- `scan_package_local_validation_failed`
- `scan_package_manual_entry_started`
- `scan_package_manual_entry_reviewed`
- `scan_package_fallback_required`
- `scan_package_confirmation_viewed`
- `scan_package_submitted`
- `scan_package_queued_offline`
- `scan_package_succeeded`
- `scan_package_rejected`
- `scan_package_closed`

Required properties:
- `deliveryId`
- `scanIntent`
- `actorRole`
- `currentStatus`
- `captureMethod`
- `fallbackUsed`
- `offlineMode`
- `errorCode` when rejected
- `elapsedScanTimeBucket`

Never include:
- raw scan code
- manual entry value
- camera image
- receiver phone
- full address
- provider reference
- actor ID
- supervisor ID

## QA Acceptance Criteria
Core:
- Modal opens with delivery reference and scan intent.
- Camera permission is requested only after user action.
- Camera denial shows settings and manual entry recovery where allowed.
- Active scanner shows scan frame and concise guidance.
- Detected scan pauses camera and opens review.
- Review shows redacted code, not full raw code.
- Manual entry enforces 4 to 80 trimmed characters.
- Manual entry is visibly marked as fallback.
- Fallback can require supervisor context.
- Custody-moving intents require confirmation before submit.
- Dispatch readiness copy states custody does not move.
- Parent-field-missing flows return scan to host and do not submit.
- Submit runs once per confirmation.
- Close clears raw scan value and stops camera.

Intent:
- Intake maps captured value to `labelScanCode`.
- Dispatch readiness maps value to `packageScanCode`.
- Driver pickup maps value to `packageScanCode`.
- Destination receipt maps value to `packageScanCode`.
- Courier acceptance maps value to `packageScanCode`.
- Destination receipt blocks submit when condition or next step is missing.
- Intake blocks submit when measured weight, size tier, or condition is missing.

Error:
- `PACKAGE_SCAN_MISMATCH` shows wrong-package recovery.
- `DUPLICATE_SCAN` shows already-recorded recovery.
- Scope violation shows station scope copy.
- Assignment violation shows assignment copy.
- Status transition error prompts refresh.
- Network error does not claim scan success.
- Offline queued state says sync is pending.

Accessibility:
- Modal traps focus on web/admin.
- Camera state is announced.
- Scan detected state is announced.
- Manual field errors are announced.
- Submit progress is announced.
- Touch targets are large enough.
- Reduced motion is respected.
- High contrast scan frame remains visible.

Privacy:
- Raw scan code is absent from analytics.
- Raw scan code is absent from logs.
- Raw scan code is cleared after close.
- Receiver phone and address are absent.
- Provider references are absent.

## E2E Scenarios
`e2e-station-intake-scan-label`:
- Open station intake host.
- Open scanner.
- Grant camera permission.
- Detect code.
- Review redacted code.
- Return code to host or submit with full parent fields.
- Backend or queue result drives next screen.

`e2e-driver-pickup-scan-custody`:
- Open assigned driver pickup host.
- Scan package.
- Confirm custody copy.
- Host calls `confirm_pickup`.
- Success routes to custody accepted state.

`e2e-courier-accept-scan-custody`:
- Open courier assignment.
- Scan package.
- Confirm courier custody copy.
- Host calls `accept_final_mile_assignment`.
- Success routes to courier custody accepted state.

`e2e-destination-receipt-scan-missing-condition`:
- Open destination receipt without condition.
- Scan package.
- Modal returns captured code to host.
- Host routes to condition step.
- No receive mutation is called.

`e2e-scan-package-camera-denied-manual-fallback`:
- Deny camera permission.
- Use manual entry.
- Enter invalid short value.
- See validation.
- Enter valid value.
- Supervisor flow appears if required.

`e2e-scan-package-mismatch`:
- Submit a wrong code.
- Backend returns `PACKAGE_SCAN_MISMATCH`.
- Wrong package recovery is shown.
- User can scan again or open custody chain.

`e2e-scan-package-offline-queued`:
- Host allows offline queue.
- Capture scan.
- Confirm action.
- Host accepts queue entry.
- Modal shows pending sync and outbox route.

## Unit Test Coverage
Validation tests:
- Empty scan invalid.
- Whitespace-only scan invalid.
- Scan shorter than 4 invalid.
- Scan longer than 80 invalid.
- Valid camera scan normalizes whitespace.
- Valid manual entry normalizes whitespace.
- Manual entry without fallback permission is blocked.
- Supervisor required blocks submit without supervisor context.

Intent tests:
- `intake_label_binding` maps to `labelScanCode`.
- Other intents map to `packageScanCode`.
- Custody-moving intents require confirmation.
- Dispatch readiness shows no-custody-move copy.
- Parent fields missing returns code to host.

State tests:
- Open starts in loading or permission state.
- Camera denial routes to denied state.
- Detection pauses scanner.
- Scan again resumes scanner.
- Submit locks controls.
- Server rejection preserves captured value when safe.
- Close clears captured value.
- Camera stop is called on close.

Accessibility tests:
- Modal has accessible title.
- Intent banner is announced.
- Permission action is reachable by keyboard.
- Manual field error links to input.
- Status messages use live region.
- Focus returns on close.

Telemetry tests:
- Open event includes intent.
- Detection event excludes raw code.
- Manual entry event excludes value.
- Submit event includes fallback flag.
- Rejection event includes error code.

## Design Review Checklist
Before closing implementation:
- Scan intent is visible before camera starts.
- The UI distinguishes readiness from custody transfer.
- The UI distinguishes camera scan from manual fallback.
- The scanner does not reveal full raw code outside review.
- Manual fallback carries audit warning.
- Supervisor requirement cannot be bypassed.
- Parent field gaps prevent mutation.
- Offline state never claims custody is confirmed.
- Mismatch and repeated-scan states route to operational recovery.
- Accessibility works without seeing the camera feed.
- Camera stops on close and background.
- All required test IDs exist.
- No sensitive scan data enters analytics or logs.

## Test IDs
Root:
- `modal-scan-package`

Header:
- `scan-package-title`
- `scan-package-close`
- `scan-package-intent-banner`
- `scan-package-delivery-reference`
- `scan-package-custody-impact`

Camera:
- `scan-package-permission`
- `scan-package-allow-camera`
- `scan-package-camera-preview`
- `scan-package-frame`
- `scan-package-instruction`
- `scan-package-torch`
- `scan-package-status`

Review:
- `scan-package-detected`
- `scan-package-redacted-code`
- `scan-package-use-scan`
- `scan-package-scan-again`

Manual:
- `scan-package-manual-entry`
- `scan-package-manual-code`
- `scan-package-manual-error`
- `scan-package-manual-review`
- `scan-package-supervisor-required`

Confirmation:
- `scan-package-confirmation`
- `scan-package-submit`
- `scan-package-cancel`

Errors:
- `scan-package-error`
- `scan-package-mismatch`
- `scan-package-duplicate`
- `scan-package-scope-blocked`
- `scan-package-assignment-blocked`
- `scan-package-status-blocked`
- `scan-package-payment-blocked`
- `scan-package-offline-blocked`
- `scan-package-offline-queued`

Recovery:
- `scan-package-open-custody-chain`
- `scan-package-report-issue`
- `scan-package-open-outbox`
- `scan-package-refresh`
- `scan-package-try-again`

## Implementation Handoff
Claude Code should build `ScanPackageModal` as the shared package scanner for station, driver, and courier workflows. It must render scan intent before camera activation, manage camera permission and lifecycle safely, capture one scan code, redact the value in review, validate the 4 to 80 character contract, support controlled manual fallback, require confirmation for custody-moving intents, map captured values to `labelScanCode` or `packageScanCode` correctly, return captured values to the host when parent fields are missing, block unsafe offline and stale-context submits, never log raw scan code, and route mismatch, repeated-scan, scope, assignment, status, payment, and network failures to explicit recovery states.


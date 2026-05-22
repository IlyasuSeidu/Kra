# Ops Scan Package Screen Spec

## Screen Contract

| Field              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID          | `OpsScanPackage`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| App                | `apps/mobile`                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Route              | `/(ops)/deliveries/:deliveryId/scan`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Primary test ID    | `screen-ops-scan-package`                                                                                                                                                                                                                                                                                                                                                                                                            |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                                                                                                                                                                                                                                                                                                                        |
| Build priority     | `P0 Operations Critical`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Backend dependency | `confirmIntakeRequestSchema`, `dispatchDeliveryRequestSchema`, `confirmDriverPickupRequestSchema`, `receiveDestinationRequestSchema`, `acceptFinalMileAssignmentRequestSchema`, `deliveryLifecycleResponseSchema`, `get_delivery`, `AuthPrincipal`, `roleSchema`, `getCapabilities`, `canPerform`                                                                                                                                    |
| Related routes     | `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/intake`, `/(ops)/station/outbound/:deliveryId/driver-pickup`, `/(ops)/station/inbound/:deliveryId/receive`, `/(ops)/driver/runs/:deliveryId/pickup-scan`, `/(ops)/courier/assignments/:deliveryId/accept-scan`                                                        |
| Required states    | `loading_delivery`, `camera_permission_pending`, `camera_ready`, `camera_denied`, `scan_detected`, `manual_entry`, `validating_local`, `confirm_before_submit`, `submitting`, `success`, `mismatch`, `duplicate_scan`, `payment_blocked`, `scope_blocked`, `status_blocked`, `fallback_required`, `supervisor_approval_required`, `offline_queued`, `offline_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job

This screen captures a package scan code and safely routes or submits it for a custody-sensitive operations workflow. It is shared by station operators, drivers, and final-mile couriers, but it must never behave like a generic scanner detached from delivery state.

The screen answers one operational question: `Can this staff member use this package scan code for this delivery and this handoff intent right now?`

The staff member should be able to:

- Open a scan camera quickly.
- Understand which delivery and handoff intent is being scanned.
- Scan a package label.
- Enter a package code manually when camera scanning fails.
- See local validation before submission.
- Confirm the intended action before any custody-moving submission.
- Submit the scan to the correct endpoint when all request fields are present.
- Return the captured code to a parent workflow when more fields are still required.
- Recover from camera denial, mismatch, duplicate scan, scope conflict, status conflict, payment block, offline state, and server errors.
- Open custody chain or issue route when scan evidence conflicts with delivery state.

This screen is not:

- A free-form barcode scanner.
- A public tracking scanner.
- A package search tool.
- A payment screen.
- A proof capture screen.
- A custody-chain review screen.
- A supervisor override console.
- A place to edit delivery, receiver, package, station, route, or quote data.
- A place to bypass package-label binding.

## Audience

Primary audience:

- Station operators scanning intake labels, dispatch readiness, and destination receipt.
- Drivers scanning packages for origin pickup.
- Final-mile couriers scanning packages to accept doorstep custody.
- Field staff using low-cost mobile devices in weak light, glare, dust, rain, or crowded station environments.

Secondary audience:

- Claude Code implementing the shared scan route.
- QA validating scan state and error recovery.
- Operations leads validating custody and fallback safety.
- Security reviewers validating scope and supervisor approval.
- Accessibility reviewers validating camera, manual entry, focus, and error handling.

## User State

The user is physically near a package and is likely interrupted, rushed, or outdoors. The UI must make the intended handoff obvious before the user scans.

The user may be:

- At origin station binding a newly received package label.
- Preparing station dispatch readiness after driver assignment.
- A driver confirming pickup from origin station.
- A destination station operator receiving a package from a driver.
- A courier accepting final-mile custody.
- Recovering from a failed scan due to label damage or camera denial.
- Working offline with a workflow that supports queued evidence.
- Handling a mismatch where the scanned package belongs to another delivery.

The screen must:

- Require a known `deliveryId`.
- Require a known scan intent or derive one only when exactly one safe intent exists.
- Load `get_delivery` before enabling submit.
- Use backend capability policy as authority.
- Use the correct request schema for the scan intent.
- Treat camera scan and manual entry as equivalent only after local validation and confirmation.
- Distinguish dispatch readiness from custody transfer.
- Distinguish assignment from custody.
- Keep fallback handoff visibly different from normal scan success.
- Route conflict states to custody chain or issue creation.

## Scan Intent Contract

`OpsScanPackage` must be opened with a scan intent.

Required route context:

- `deliveryId`
- `scanIntent`
- `returnTo` route when the scan is part of a larger form
- Optional pre-collected fields required by the target schema

Supported `scanIntent` values:

- `intake_label_binding`
- `dispatch_readiness`
- `driver_pickup_custody`
- `destination_receipt`
- `courier_accept_custody`

Intent behavior:

- `intake_label_binding` uses `labelScanCode` and `confirmIntakeRequestSchema`.
- `dispatch_readiness` uses `packageScanCode` and `dispatchDeliveryRequestSchema`.
- `driver_pickup_custody` uses `packageScanCode` and `confirmDriverPickupRequestSchema`.
- `destination_receipt` uses `packageScanCode` and `receiveDestinationRequestSchema`.
- `courier_accept_custody` uses `packageScanCode` and `acceptFinalMileAssignmentRequestSchema`.

Intent derivation:

- If `scanIntent` is absent, derive from role and `currentStatus` only when there is exactly one safe match.
- If there are zero safe matches, show `status_blocked`.
- If there are multiple possible matches, route back to `OpsDeliveryDetail` with `Choose workflow before scanning`.
- Never infer a custody-moving intent from a raw route alone.

Required parent fields by intent:

- `intake_label_binding`: `measuredWeightKg`, `sizeTier`, and `condition` must already exist before submission.
- `destination_receipt`: `condition` and `nextStep` must already exist before submission.
- `courier_accept_custody`: optional `note` may be provided.
- `dispatch_readiness`: no extra fields beyond scan and fallback fields.
- `driver_pickup_custody`: no extra fields beyond scan and fallback fields.

If required parent fields are missing:

- Capture and locally validate the scan code.
- Return the code to the parent workflow through navigation state or shared form context.
- Do not call the endpoint from this screen.
- Show copy: `Scan captured. Finish the required details to submit.`

## Primary Action

Primary action by state:

- `camera_permission_pending`: request camera permission.
- `camera_ready`: scan package label.
- `scan_detected`: review detected code.
- `manual_entry`: enter package code and continue.
- `confirm_before_submit`: submit scan for the current intent.
- `submitting`: wait.
- `success`: continue to next workflow step.
- `mismatch`: scan again or report issue.
- `duplicate_scan`: open custody chain.
- `fallback_required`: start manual fallback.
- `supervisor_approval_required`: request supervisor approval.
- `offline_queued`: open offline outbox or return to queue.
- `offline_blocked`: reconnect or return to delivery detail.

Secondary actions:

- `Enter code manually`
- `Turn on torch`
- `Scan again`
- `Open custody chain`
- `Report issue`
- `Open offline outbox`
- `Back to delivery`
- `Open support`

Blocked behavior:

- Do not submit a scan without a delivery.
- Do not submit a scan without a scan intent.
- Do not submit a custody-moving scan without confirmation.
- Do not submit if required parent fields are missing.
- Do not submit if local scan code fails schema length checks.
- Do not submit if authenticated role lacks capability.
- Do not submit if assignment or station scope does not match.
- Do not submit if payment is required and not confirmed for the target transition.
- Do not silently turn manual entry into fallback without supervisor approval.
- Do not treat station dispatch readiness as custody transfer.
- Do not treat final-mile assignment as custody transfer.
- Do not expose raw backend scan-conflict metadata in normal UI.

## First Meaningful Value

First meaningful value is reached when staff sees:

- Tracking code and current delivery status.
- The exact scan intent.
- Current custody role.
- Required next actor.
- Camera or manual entry path.
- Data freshness and offline state.

The first viewport must answer:

- `Which delivery am I scanning for?`
- `What handoff step am I performing?`
- `Will this scan move custody or only record readiness?`
- `Am I allowed to perform this scan?`
- `What should I do if the camera fails?`

## Main Tension

Scanning must feel fast, but scan success can create or confirm custody evidence. The interface must not make a high-risk handoff feel like a casual camera action.

The design must balance:

- Camera speed against custody confirmation.
- Manual entry against fraud and error risk.
- Offline continuity against stale delivery state.
- Clear scan target against limited screen space.
- Intent-specific endpoint rules against shared screen reuse.
- Mismatch recovery against accidental retry loops.
- Supervisor fallback against normal staff flow.

## Design Brief

User and job:

- Field staff needs to capture a package code for one delivery and one handoff intent.

Context of use:

- Mobile, camera active, one-handed use, glare, poor light, noise, station queue pressure, physical package handling.

Entry point:

- Ops delivery detail.
- Station intake workflow.
- Station outbound pickup workflow.
- Station destination receipt workflow.
- Driver pickup workflow.
- Courier assignment workflow.
- Offline outbox retry.

Success state:

- Scan code is captured and either submitted to the correct endpoint or returned to the parent workflow safely.

Primary action:

- Scan package label.

Navigation model:

- Camera-first screen with identity banner, intent banner, scan window, manual fallback drawer, confirmation step, and recovery routes.

Density:

- Low while scanning, medium during confirmation and error recovery.

Visual thesis:

- A field-grade scanner: dark camera stage, crisp intent banner, and high-contrast recovery controls.

Restraint rule:

- Avoid dashboard data, decorative camera chrome, hidden intent, and multi-action clutter during scanning.

Product lens:

- Evidence integrity and fast physical handling.

System stance:

- Native scanner route with strict intent and schema gates.

Interaction thesis:

- Identify delivery, scan label, confirm intent, submit safely.

Signature move:

- A persistent handoff-intent banner that names the current step and whether custody changes after success.

Activation event:

- Scan submitted, scan returned to parent workflow, fallback started, custody chain opened, issue route opened, or offline outbox opened.

## Elite Quality Gate

This spec is not closed unless `OpsScanPackage` prevents accidental custody movement and handles real-world scan failure.

Non-negotiable quality requirements:

- Screen shows delivery identity and scan intent before camera capture.
- Camera scan and manual entry normalize to the same schema-constrained code format.
- Submission maps to the correct request schema for the intent.
- Custody-moving intents require explicit confirmation.
- Dispatch readiness explicitly says custody remains with the station.
- Driver pickup explicitly says custody moves to assigned driver.
- Destination receipt explicitly says custody moves to destination station after scan and condition confirmation.
- Courier acceptance explicitly says custody moves to assigned courier.
- Intake label binding explicitly says first scan binds the label to the delivery.
- Manual fallback requires supervisor approval before submission with `fallbackUsed=true`.
- Mismatch, duplicate, scope, status, and payment blocks are recoverable.
- Offline state never makes stale scan evidence look submitted.
- Screen supports screen reader, large text, high contrast, reduced motion, and camera-denied accessibility.

Closure rule:

- If a scan can submit without intent, the screen remains open.
- If a scan can move custody without confirmation, the screen remains open.
- If camera-denied users cannot complete the flow where policy allows manual entry, the screen remains open.
- If manual fallback can proceed without supervisor approval, the screen remains open.
- If duplicate or mismatch errors do not route to evidence review, the screen remains open.
- If station dispatch readiness is described as custody transfer, the screen remains open.

## Research And Inspiration Notes

Use these sources for quality direction, not visual copying:

- [Android ML Kit barcode scanning](https://developers.google.com/ml-kit/vision/barcode-scanning/android): camera scan UX should account for supported code formats, fast detection, and processing constraints.
- [Apple AVFoundation metadata capture](https://developer.apple.com/documentation/avfoundation/capture_setup/avcam_building_a_camera_app): camera capture experiences need clear permission, preview, focus, and session lifecycle handling.
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): logistics labels depend on consistent barcode identity and scan reliability across supply-chain actors.
- [Material Design accessibility](https://m1.material.io/usability/accessibility.html): controls, labels, and focus must remain clear under assistive technology.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): scan controls and recovery actions need reliable touch targets.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): scan detected, submitting, success, mismatch, and offline queued states must be announced without unnecessary focus jumps.

Applied decisions:

- Use camera-first layout only after delivery and intent are visible.
- Use a confirmation step for custody-moving submissions.
- Keep manual fallback behind explicit recovery flow.
- Use schema names in implementation guidance to prevent endpoint confusion.
- Treat mismatch and duplicate as evidence events, not simple input errors.

## Data Contract And Backend Alignment

Primary delivery read:

- Operation: `get_delivery`.
- HTTP: `GET /v1/deliveries/:id`.
- Schema: `deliveryDetailResponseSchema`.
- Purpose: verify delivery identity, status, payment, custody, station, and assignment before enabling submit.

Lifecycle response:

- Schema: `deliveryLifecycleResponseSchema`.
- Expected fields include `eventId`, `deliveryId`, `status`, `paymentStatus`, and `occurredAt`.

Intent request schemas:

- `confirmIntakeRequestSchema`
- `dispatchDeliveryRequestSchema`
- `confirmDriverPickupRequestSchema`
- `receiveDestinationRequestSchema`
- `acceptFinalMileAssignmentRequestSchema`

API operations:

- `confirm_intake`: `POST /v1/deliveries/:id/intake`
- `dispatch_delivery`: `POST /v1/deliveries/:id/dispatch`
- `confirm_pickup`: `POST /v1/deliveries/:id/confirm-pickup`
- `receive_destination`: `POST /v1/deliveries/:id/receive-destination`
- `accept_final_mile_assignment`: `POST /v1/deliveries/:id/accept-final-mile-assignment`

Package label rules:

- `labelScanCode` is reserved as an immutable `package_labels` binding during intake.
- Later `packageScanCode` values must match the immutable delivery-label binding.
- A scan code bound to another delivery must raise `PACKAGE_SCAN_MISMATCH`.
- An unregistered scan code after intake must raise `PACKAGE_SCAN_MISMATCH`.

Handoff rules:

- Sender to origin station uses intake package scan and station confirmation.
- Origin station to driver uses package scan and assigned driver confirmation.
- Driver to destination station uses package scan, destination operator confirmation, and condition check.
- Destination station to final-mile courier uses package scan from the assigned courier.
- Final-mile courier to receiver uses receiver proof, not this package scan route.
- Assignment is not custody.

## Intent To Endpoint Matrix

| Scan intent              | Endpoint                       | Request scan field | Extra required fields                       | Custody effect                                             |
| ------------------------ | ------------------------------ | ------------------ | ------------------------------------------- | ---------------------------------------------------------- |
| `intake_label_binding`   | `confirm_intake`               | `labelScanCode`    | `measuredWeightKg`, `sizeTier`, `condition` | Custody becomes `station_operator` at origin station.      |
| `dispatch_readiness`     | `dispatch_delivery`            | `packageScanCode`  | none                                        | Custody stays with origin station until driver pickup.     |
| `driver_pickup_custody`  | `confirm_pickup`               | `packageScanCode`  | none                                        | Custody becomes `driver`.                                  |
| `destination_receipt`    | `receive_destination`          | `packageScanCode`  | `condition`, `nextStep`                     | Custody becomes `station_operator` at destination station. |
| `courier_accept_custody` | `accept_final_mile_assignment` | `packageScanCode`  | optional `note`                             | Custody becomes `final_mile_courier`.                      |

Submission rule:

- Submit from this screen only when the request can be fully constructed.
- Otherwise return the captured scan code to the requesting workflow and let that workflow submit after collecting the rest.

## Local Scan Validation

Normalize:

- Trim leading and trailing whitespace.
- Preserve uppercase letters, numbers, hyphens, and scanner-provided characters if backend allows them.
- Do not silently rewrite a code beyond trimming unless a shared package-label formatter exists.

Validate:

- Scan code must be at least 4 characters.
- Scan code must be no more than 80 characters.
- Empty code is invalid.
- Camera noise or repeated reads of the same frame must not trigger multiple submissions.

Display:

- Show the scanned code in a confirmation card.
- Use monospace or tabular treatment.
- Provide `Scan again`.
- Provide `Submit scan` only after validation passes.

Do not:

- Store scan code in analytics.
- Log scan code in normal client logs.
- Read raw scan code aloud automatically unless screen reader user focuses the code.
- Submit on scan detection without confirmation for custody-moving intents.

## Camera Experience

Camera permission:

- On first load, explain why camera access is needed.
- Request permission after user intent is clear.
- If denied, show manual entry and device settings guidance.
- If unavailable, show manual entry first.

Camera stage:

- Full-width dark camera area.
- High-contrast scan frame.
- Clear instruction: `Align the package label inside the frame`.
- Torch toggle when supported.
- Camera switch only if needed by platform.
- Stop scanning after a valid read until user chooses `Scan again`.

Detection:

- Use one active read at a time.
- Debounce repeated scan events.
- Haptic feedback is allowed on successful detection if platform supports it.
- Audio feedback is optional and must respect device settings.
- If multiple codes are visible, ask user to isolate the package label.

Lighting and physical conditions:

- Torch toggle remains reachable.
- Instruction copy should mention avoiding glare if repeated scan failure occurs.
- Manual entry is available after repeated failed reads.
- Damaged-label recovery routes to manual fallback.

Camera lifecycle:

- Pause camera when screen loses focus.
- Resume only when screen regains focus and state allows scanning.
- Stop camera after submission starts.
- Release camera on exit.

## Manual Entry And Fallback

Manual entry is a recovery path, not a lower-trust shortcut.

Manual entry allowed when:

- Camera permission is denied.
- Camera is unavailable.
- Label is damaged.
- Low light or glare prevents scanning.
- Hardware scanner input is used.

Manual entry fields:

- Package code.
- Reason for manual entry.
- Supervisor approval when the entry is used as fallback for a handoff.

Fallback rule:

- If manual entry replaces scan evidence for a custody or handoff action, set `fallbackUsed=true`.
- Fallback requires supervisor approval.
- Supervisor approval returns `supervisorOverrideActorId` for the request schema.
- If supervisor approval is not available, route to issue creation or support.

Manual entry copy:

- Title: `Enter package code`.
- Body: `Use this only when the label cannot be scanned. A supervisor must approve fallback handoff evidence.`
- Field label: `Package code`.
- Reason label: `Why manual entry is needed`.
- Submit label: `Continue with manual code`.

Do not:

- Hide that fallback was used.
- Submit fallback without visible reason and supervisor approval.
- Allow manual code entry to bypass assignment, station scope, status, or payment rules.

## Role And Scope Rules

Station operator:

- `intake_label_binding` requires origin station scope and `confirm_intake`.
- `dispatch_readiness` requires origin station scope and `confirm_dispatch`.
- `destination_receipt` requires destination station scope and `confirm_destination_receipt`.
- Station operator cannot complete driver pickup custody as the driver.
- Station operator cannot accept final-mile courier custody.

Driver:

- `driver_pickup_custody` requires role `driver`, matching `assignedDriverId`, and `confirm_pickup`.
- Driver cannot perform intake, station dispatch readiness, destination receipt, or courier acceptance.
- Driver must see assignment conflict recovery when assignment no longer matches.

Final-mile courier:

- `courier_accept_custody` requires role `final_mile_courier`, matching `assignedFinalMileCourierId`, and `accept_final_mile_assignment`.
- Courier cannot perform station intake, station dispatch readiness, driver pickup, or destination receipt.
- Courier must see assignment conflict recovery when assignment no longer matches.

Ops admin:

- Can view and route according to backend capabilities.
- Must not bypass scan, station scope, assignment match, or supervisor fallback requirements from this screen.

Support admin:

- Can open issue/support context if backend visibility allows.
- Must not submit physical handoff scans unless capability policy allows.

Finance admin:

- No physical scan actions.
- Route back to delivery detail or admin web when configured.

Super admin:

- Broad visibility does not remove evidence requirements.
- All scan submissions still use the same schema and confirmation rules.

## Status And Payment Rules

Status gating:

- `created`: only intake scan can proceed.
- `received_at_origin`: route to station outbound flow before scan unless dispatch is ready.
- `awaiting_driver_assignment`: scan blocked until driver assignment.
- `assigned_to_driver`: dispatch readiness or assigned driver pickup may proceed by role and intent.
- `dispatched_from_origin`: driver pickup may already have completed; route to delivery detail if intent conflicts.
- `in_transit`: destination receipt may proceed by destination station operator.
- `received_at_destination`: choose pickup or final-mile routing before final-mile scan.
- `awaiting_receiver_pickup`: package scan not needed unless a station pickup workflow later requires it.
- `awaiting_final_mile_assignment`: scan blocked until courier assignment.
- `assigned_for_final_mile`: assigned courier acceptance scan may proceed.
- `out_for_delivery`: package scan route should not be primary; proof route owns receiver completion.
- Terminal statuses: scan blocked, custody chain remains available.

Payment gating:

- If backend returns `DELIVERY_NOT_PAID` or `PAYMENT_REQUIRED`, show payment block.
- Transport and final-mile scan submissions must not proceed until payment is confirmed when policy requires it.
- Do not collect payment from this screen.

## Information Architecture

The screen uses six regions.

Region 1: Delivery identity banner

- Back control.
- Tracking code.
- Current status.
- Current custody role.
- Freshness indicator.

Region 2: Intent banner

- Scan intent label.
- Required actor.
- Custody effect.
- Required endpoint.

Region 3: Camera stage

- Camera preview.
- Scan frame.
- Torch toggle.
- Scan instruction.
- Manual entry control.

Region 4: Confirmation card

- Detected code.
- Intent summary.
- Custody effect warning if applicable.
- Submit scan.
- Scan again.

Region 5: Recovery panel

- Camera denied.
- Mismatch.
- Duplicate scan.
- Scope block.
- Payment block.
- Status block.
- Offline state.
- Fallback path.

Region 6: Support routes

- Custody chain.
- Report issue.
- Open support.
- Offline outbox.
- Back to delivery.

## Layout Specification

Mobile layout:

- Camera stage fills most of the viewport after identity and intent banners.
- Identity banner is compact but persistent.
- Intent banner remains visible above camera.
- Manual entry is a bottom sheet or inline panel below camera.
- Confirmation replaces camera stage after detection.
- Recovery panels replace confirmation when an error occurs.

Small-phone layout:

- Keep banners to two lines each.
- Use full-width primary buttons.
- Avoid side-by-side actions except torch and manual entry.
- Keep recovery copy short.

Tablet layout:

- Camera stage and confirmation panel may sit side by side.
- Identity and intent remain top-aligned.
- Recovery routes stay close to confirmation.

Visual direction:

- Dark scan stage with high-contrast frame.
- White or light surface for confirmation card.
- Warning states use clear text plus icon or shape.
- Success state is brief and decisive.
- Fallback state uses warning treatment, not success treatment.

Motion:

- Camera frame can pulse gently while scanning.
- Confirmation card can slide up after scan detection.
- Error state can use a short shake or color shift if reduced motion is not enabled.
- Respect `prefers-reduced-motion`.

## Component Inventory

Required components:

- `OpsScanPackageScreen`
- `ScanDeliveryIdentityBanner`
- `ScanIntentBanner`
- `PackageCameraScanner`
- `TorchToggle`
- `ManualEntrySheet`
- `ScanConfirmationCard`
- `CustodyEffectNotice`
- `ScanRecoveryPanel`
- `SupervisorApprovalPrompt`
- `OfflineScanNotice`
- `ScanErrorState`
- `ScanSuccessState`

Shared primitives:

- `Screen`
- `SafeAreaView`
- `Button`
- `IconButton`
- `Text`
- `TextInput`
- `Badge`
- `AlertBanner`
- `BottomSheet`
- `Toast`
- `ActivityIndicator`

Do not create:

- A generic scanner without delivery context.
- A scan endpoint chooser visible to normal staff.
- A production raw response inspector.
- A separate payment action component.
- A custody event editor.

## Content Specification

Identity copy:

- Header: `Scan package`
- Tracking line: `Delivery {trackingCode}`
- Status line: `{currentStatusLabel} - {custodyLabel}`

Intent labels:

- `Bind intake label`
- `Confirm dispatch readiness`
- `Confirm driver pickup`
- `Receive at destination`
- `Accept final-mile custody`

Custody effect copy:

- Intake: `This binds the package label and records origin station custody.`
- Dispatch readiness: `This records readiness only. Custody stays with the station until driver pickup.`
- Driver pickup: `Submitting this scan transfers custody to the assigned driver.`
- Destination receipt: `Submitting this scan records destination receipt and station custody.`
- Courier acceptance: `Submitting this scan transfers custody to the assigned courier.`

Camera copy:

- `Align the package label inside the frame.`
- `Hold steady until the code appears.`
- `Use manual entry only if the label cannot be scanned.`

Confirmation copy:

- Title: `Review scan`
- Code label: `Package code`
- Submit: `Submit scan`
- Retry: `Scan again`
- Cancel: `Back to delivery`

Success copy:

- Intake: `Package label bound.`
- Dispatch readiness: `Dispatch readiness recorded.`
- Driver pickup: `Driver custody confirmed.`
- Destination receipt: `Destination receipt confirmed.`
- Courier acceptance: `Courier custody confirmed.`

Error copy:

- Camera denied title: `Camera access is off`.
- Camera denied body: `Allow camera access in settings or enter the package code manually.`
- Mismatch title: `Wrong package scanned`.
- Mismatch body: `This scan code does not match the delivery. Scan the correct package or report an issue.`
- Duplicate title: `Scan already recorded`.
- Duplicate body: `This package scan was already recorded for this step. Review custody chain before trying again.`
- Scope title: `You cannot scan this delivery`.
- Scope body: `Your role or assignment does not match this handoff step.`
- Status title: `Scan not available for this status`.
- Status body: `Open delivery detail to see the current workflow.`
- Payment title: `Payment required before this action`.
- Payment body: `Payment must be confirmed before this handoff can continue.`
- Offline blocked title: `Reconnect before submitting`.
- Offline blocked body: `This scan changes custody and needs a fresh backend check.`
- Fallback title: `Supervisor approval required`.
- Fallback body: `Manual fallback handoffs require supervisor approval and will be marked for review.`

Tone:

- Short.
- Literal.
- Calm.
- Evidence-oriented.
- No blame.

## State Matrix

`loading_delivery`:

- Load delivery and auth context.
- Show identity skeleton.
- Do not start camera until delivery and intent are validated.

`camera_permission_pending`:

- Explain camera need.
- Ask for permission.
- Offer manual entry if platform allows.

`camera_ready`:

- Show camera stage.
- Show identity and intent banners.
- Await scan detection.

`camera_denied`:

- Show manual entry.
- Show settings guidance.
- Keep delivery and intent visible.

`scan_detected`:

- Stop active detection.
- Show detected code.
- Move to local validation.

`manual_entry`:

- Show code field.
- Show reason field when fallback may be needed.
- Validate locally.

`validating_local`:

- Check length and empty value.
- Do not call backend.
- Move to confirmation or local error.

`confirm_before_submit`:

- Show code, intent, custody effect, and submit action.
- Require explicit user action for custody-moving intents.

`submitting`:

- Disable submit.
- Show progress.
- Keep cancel disabled unless request can be safely aborted.

`success`:

- Show intent-specific success.
- Navigate to parent workflow, delivery detail, or next route.
- Announce success.

`mismatch`:

- Show wrong package recovery.
- Actions: scan again, open custody chain, report issue.

`duplicate_scan`:

- Show duplicate recovery.
- Actions: open custody chain, back to delivery.

`payment_blocked`:

- Show payment recovery.
- Actions: refresh delivery, back to delivery, support.

`scope_blocked`:

- Show role or assignment conflict.
- Actions: refresh assignments, back, support.

`status_blocked`:

- Show current status mismatch.
- Actions: back to delivery, refresh.

`fallback_required`:

- Show manual fallback reason.
- Require supervisor approval before submit.

`supervisor_approval_required`:

- Run supervisor approval step.
- Submit with `fallbackUsed=true` and `supervisorOverrideActorId` only after approval.

`offline_queued`:

- Show queued state only for workflows explicitly supporting offline evidence queueing.
- Provide offline outbox route.

`offline_blocked`:

- Show reconnect requirement.
- Disable custody-moving submit.
- Allow back to delivery or offline outbox.

`not_found`:

- Hide delivery fields.
- Offer back and support.

`not_authorized`:

- Hide delivery fields.
- Offer back, sign in, and support.

`session_expired`:

- Stop camera.
- Show sign-in recovery.
- Preserve intended route.

`api_error`:

- Show retry and support.
- Keep scanned code in volatile local state only while session remains valid.

## Error Code Mapping

Shared API enum note:

- Current `apiErrorCodeSchema` includes `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `ROUTE_NOT_ENABLED`, `PAYMENT_REQUIRED`, `INVALID_STATUS_TRANSITION`, `PHONE_VERIFICATION_REQUIRED`, `PACKAGE_SCAN_MISMATCH`, `RATE_LIMITED`, and `INTERNAL_ERROR`.
- Inventory and policy docs also define scan recovery states such as `DUPLICATE_SCAN`, `HANDOFF_PROOF_REQUIRED`, and `CONFLICTING_HANDOFF_STATE`.
- Until those policy codes are added to `apiErrorCodeSchema`, implementation must map current enum responses such as `INVALID_STATUS_TRANSITION`, `PACKAGE_SCAN_MISMATCH`, or idempotent success responses into the UI recovery state without assuming unsupported enum values exist.

`AUTH_REQUIRED`:

- State: `session_expired`.
- Copy: `Sign in again to continue.`
- Actions: sign in.

`FORBIDDEN`:

- State: `not_authorized` or `scope_blocked`.
- Copy: `You do not have permission for this action.`
- Actions: back, support.

`FORBIDDEN_ROLE`:

- State: `scope_blocked`.
- Copy: `Your role cannot perform this scan.`
- Actions: back, support.

`STATION_SCOPE_VIOLATION`:

- State: `scope_blocked`.
- Copy: `This delivery is outside your station scope.`
- Actions: return to station queue, support.

`ASSIGNMENT_SCOPE_VIOLATION`:

- State: `scope_blocked`.
- Copy: `This job is not assigned to you.`
- Actions: refresh assignments, back.

`NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery record not found.`
- Actions: back, support.

`DELIVERY_NOT_FOUND`:

- State: `not_found`.
- Copy: `Delivery record not found.`
- Actions: back, support.

`INVALID_STATUS_TRANSITION`:

- State: `status_blocked`.
- Copy: `This delivery cannot move to that state yet.`
- Actions: view current status.

`DELIVERY_NOT_PAID`:

- State: `payment_blocked`.
- Copy: `Payment must be confirmed before this action.`
- Actions: back to delivery, support.

`PAYMENT_REQUIRED`:

- State: `payment_blocked`.
- Copy: `Payment must be confirmed before this action.`
- Actions: back to delivery, support.

`PACKAGE_SCAN_MISMATCH`:

- State: `mismatch`.
- Copy: `This scan code does not match the delivery.`
- Actions: scan again, report issue, open custody chain.

`DUPLICATE_SCAN`:

- State: `duplicate_scan`.
- Copy: `This package scan was already recorded.`
- Actions: open custody chain, back to delivery.

`HANDOFF_PROOF_REQUIRED`:

- State: `fallback_required`.
- Copy: `Required handoff proof is missing.`
- Actions: scan again, request supervisor approval, report issue.

`CONFLICTING_HANDOFF_STATE`:

- State: `status_blocked`.
- Copy: `The handoff state conflicts with the current record.`
- Actions: open custody chain, report issue.

`VALIDATION_ERROR`:

- State: `api_error`.
- Copy: `Some required information is missing or invalid.`
- Actions: fix details, back to parent workflow.

`RATE_LIMITED`:

- State: `api_error`.
- Copy: `Too many attempts. Please wait before trying again.`
- Actions: retry after delay.

## Offline And Freshness Rules

Freshness:

- Load fresh delivery before enabling a custody-moving submit.
- If the delivery was loaded from cache, show stale or offline indicator.
- Require refresh before submit unless the target workflow is explicitly offline-capable.

Offline submit:

- Only queue scan submissions when the workflow has an offline evidence queue, idempotency key, and visible outbox state.
- Queued custody evidence must show `Queued, not confirmed`.
- A queued scan must not change displayed custody until backend confirms.
- If backend rejects queued scan later, outbox must route to mismatch or conflict recovery.

Offline blocked:

- If offline queueing is unavailable, disable submit.
- Keep manual entry available only for capture, not final submission.
- Preserve scanned code only in secure volatile state while session remains valid.

Outbox:

- Show `Open offline outbox` when queued actions exist.
- Display delivery identity, scan intent, queued time, and current sync state in outbox.

## Accessibility Requirements

Screen reader:

- Announce screen title, delivery identity, scan intent, and custody effect before camera starts.
- Camera preview must have accessible instruction text.
- Scan detected state announces `Package code detected`.
- Submitting state announces progress.
- Success, mismatch, duplicate, offline queued, and blocked states use status messages.
- Manual entry field has clear label, hint, error text, and submit control.

Focus:

- Initial focus lands on screen title.
- Permission prompt returns focus to camera or manual entry outcome.
- After scan detection, focus moves to confirmation title.
- After error, focus moves to error title.
- Supervisor approval moves focus to approval heading.

Touch:

- Torch, manual entry, scan again, submit, and recovery actions meet target-size requirements.
- The scan frame itself is not the only way to start scanning.
- Buttons are reachable with one hand.

Visual:

- Camera frame has visible contrast.
- Error states use text plus shape or icon.
- Do not rely on green/red alone.
- Large text keeps identity and intent visible.
- Confirmation code remains readable without shrinking below legible size.

Motion:

- Support reduced motion.
- Avoid constant pulsing if reduced motion is enabled.
- Haptic feedback must be optional and platform-respecting.

Camera denied accessibility:

- Manual entry must allow full completion where policy permits fallback.
- Settings guidance must not be the only recovery path.

## Privacy And Security

Security rules:

- Do not log scan code in normal logs.
- Do not send scan code in analytics.
- Do not expose scan-conflict backend metadata in normal UI.
- Do not keep scanned code after user exits unless queued evidence requires encrypted persistence.
- Do not persist manual fallback reason outside the target request/audit flow.
- Do not allow another user to resume a scanned code after sign-out.

Supervisor approval:

- Supervisor approval must verify active supervisor identity.
- UI may collect supervisor PIN or use an approved in-app approval method.
- The request sends `supervisorOverrideActorId` only after supervisor identity is confirmed.
- Approval failure returns to fallback state without submitting.

Fraud and loss prevention:

- Repeated mismatch should promote issue route.
- Manual fallback should be auditable.
- Offline queue should never mark custody complete before backend confirmation.
- Duplicate scan should route to custody chain.

## Analytics And Observability

Required analytics events:

- `ops_scan_package_viewed`
- `ops_scan_camera_permission_requested`
- `ops_scan_camera_permission_denied`
- `ops_scan_detected`
- `ops_scan_manual_entry_started`
- `ops_scan_manual_entry_validated`
- `ops_scan_submit_started`
- `ops_scan_submit_succeeded`
- `ops_scan_submit_failed`
- `ops_scan_mismatch`
- `ops_scan_duplicate`
- `ops_scan_fallback_started`
- `ops_scan_supervisor_approval_requested`
- `ops_scan_supervisor_approval_succeeded`
- `ops_scan_offline_queued`
- `ops_scan_offline_blocked`

Allowed analytics fields:

- `deliveryId`
- `trackingCode`
- `scanIntent`
- `role`
- `currentStatus`
- `paymentStatus`
- `currentCustodyRole`
- `originStationId`
- `destinationStationId`
- `isOffline`
- `isStale`
- `usedManualEntry`
- `fallbackUsed`
- `errorCode`

Do not send:

- Scan code.
- Supervisor PIN.
- Receiver phone.
- Receiver address.
- Package description.
- Proof reference.
- Raw conflict metadata.

Operational logs:

- Capture camera permission status without scan code.
- Capture endpoint latency by scan intent.
- Capture mismatch and duplicate counts by role and station.
- Capture offline queue outcome by intent.

## Performance Requirements

Budget:

- Identity and intent render within 1 second on healthy mobile network.
- Camera preview starts within platform-acceptable timing after permission.
- Scan confirmation appears immediately after detection.
- Submit feedback appears within 100 milliseconds of tap.

Camera performance:

- Use efficient barcode detection.
- Pause scanning after first valid detection.
- Avoid processing frames while confirmation is visible.
- Release camera on route exit.
- Avoid camera start before delivery and intent pass validation.

Network:

- Submit request once per confirmation tap.
- Use idempotent endpoint behavior where backend supports it.
- Avoid duplicate submissions from double taps or repeated scan events.
- Retry only under explicit user action or offline outbox policy.

Failure isolation:

- Camera failure must not fail manual entry.
- Analytics failure must not block scan.
- Support route failure must not erase scanned code before user chooses next action.

## Test IDs

Primary:

- `screen-ops-scan-package`

Identity:

- `ops-scan-package-back`
- `ops-scan-package-title`
- `ops-scan-package-tracking-code`
- `ops-scan-package-status`
- `ops-scan-package-custody`
- `ops-scan-package-freshness`

Intent:

- `ops-scan-package-intent-banner`
- `ops-scan-package-intent-label`
- `ops-scan-package-required-actor`
- `ops-scan-package-custody-effect`

Camera:

- `ops-scan-package-camera`
- `ops-scan-package-scan-frame`
- `ops-scan-package-torch-toggle`
- `ops-scan-package-manual-entry-open`
- `ops-scan-package-permission-request`
- `ops-scan-package-camera-denied`

Manual entry:

- `ops-scan-package-manual-sheet`
- `ops-scan-package-manual-code-input`
- `ops-scan-package-manual-reason-input`
- `ops-scan-package-manual-continue`

Confirmation:

- `ops-scan-package-confirmation`
- `ops-scan-package-detected-code`
- `ops-scan-package-submit`
- `ops-scan-package-scan-again`
- `ops-scan-package-cancel`

Fallback:

- `ops-scan-package-fallback-panel`
- `ops-scan-package-supervisor-approval`
- `ops-scan-package-supervisor-submit`

Errors:

- `ops-scan-package-mismatch`
- `ops-scan-package-duplicate`
- `ops-scan-package-payment-blocked`
- `ops-scan-package-scope-blocked`
- `ops-scan-package-status-blocked`
- `ops-scan-package-offline-queued`
- `ops-scan-package-offline-blocked`
- `ops-scan-package-api-error`

Recovery:

- `ops-scan-package-open-custody-chain`
- `ops-scan-package-report-issue`
- `ops-scan-package-open-support`
- `ops-scan-package-open-offline-outbox`
- `ops-scan-package-back-to-delivery`

## API Integration Notes

Request construction:

- Use `deliveryId` from route.
- Use `scanIntent` from route or safe derivation.
- Use captured code as `labelScanCode` only for `intake_label_binding`.
- Use captured code as `packageScanCode` for all later scan intents.
- Include `fallbackUsed` only when fallback flow was used.
- Include `supervisorOverrideActorId` only after supervisor approval.
- Include `condition`, `nextStep`, `measuredWeightKg`, `sizeTier`, or `note` only when required and already collected by parent workflow.

Submission routing:

- `intake_label_binding` calls `confirm_intake`.
- `dispatch_readiness` calls `dispatch_delivery`.
- `driver_pickup_custody` calls `confirm_pickup`.
- `destination_receipt` calls `receive_destination`.
- `courier_accept_custody` calls `accept_final_mile_assignment`.

Successful response:

- Parse with `deliveryLifecycleResponseSchema`.
- Announce success.
- Invalidate delivery detail and timeline caches.
- Navigate to next workflow or delivery detail.
- Do not display raw event ID unless diagnostics are enabled.

Failed response:

- Map `apiErrorResponseSchema` code to state.
- Preserve scan code only for same-session recovery.
- Clear scan code on sign-out or route exit.

## QA Acceptance Criteria

Functional:

- Screen refuses to submit when scan intent is absent and cannot be safely derived.
- Camera permission request appears only after delivery and intent context are visible.
- Camera-denied state provides manual entry.
- Scan detection stops repeated reads.
- Local validation catches empty, too-short, and too-long codes.
- Confirmation appears before custody-moving submit.
- Dispatch readiness copy says custody remains with station.
- Driver pickup copy says custody transfers to assigned driver.
- Courier acceptance copy says custody transfers to assigned courier.
- Missing parent fields return captured scan to parent workflow instead of submitting.
- Manual fallback requires supervisor approval.
- Offline blocked state prevents custody-changing submit when no queue is available.

Backend alignment:

- Intake uses `confirmIntakeRequestSchema` and `labelScanCode`.
- Dispatch readiness uses `dispatchDeliveryRequestSchema` and `packageScanCode`.
- Driver pickup uses `confirmDriverPickupRequestSchema` and `packageScanCode`.
- Destination receipt uses `receiveDestinationRequestSchema`, `packageScanCode`, `condition`, and `nextStep`.
- Courier acceptance uses `acceptFinalMileAssignmentRequestSchema` and `packageScanCode`.
- Success parses `deliveryLifecycleResponseSchema`.
- `PACKAGE_SCAN_MISMATCH`, `DUPLICATE_SCAN`, `HANDOFF_PROOF_REQUIRED`, `CONFLICTING_HANDOFF_STATE`, `PAYMENT_REQUIRED`, and `VALIDATION_ERROR` are mapped.

Security:

- Scan code is not sent to analytics.
- Supervisor PIN is not stored.
- Raw conflict metadata is not shown.
- Scan code clears on sign-out.
- Duplicate submit is prevented.

Accessibility:

- Manual entry is fully keyboard and screen-reader usable.
- Camera instruction is available to screen readers.
- Error states receive focus.
- Status messages announce scan detected and submit outcome.
- Touch targets are large enough.
- Reduced motion is respected.

Resilience:

- Camera failure does not block manual entry.
- Network error preserves same-session scan recovery.
- Rate limit disables immediate retry.
- Offline queued state never marks custody complete.
- Mismatch route promotes issue and custody chain after repeated failure.

## Visual Quality Checklist

Before handoff, confirm:

- Delivery identity and scan intent are visible before camera scan.
- The scan frame is clear under bright and dark conditions.
- One primary action dominates each state.
- Manual entry feels like recovery, not default.
- Fallback warning is visually distinct from normal confirmation.
- Mismatch and duplicate states cannot be confused with success.
- The user always knows whether custody will change.
- The screen remains usable on low-cost Android devices.
- The screen remains usable with camera permission denied.
- The UI feels like a serious operations tool, not a consumer QR scanner.

## Implementation Guardrails For Claude Code

Build this as a shared route-level scan workflow only when frontend work begins.

Implementation rules:

- Keep scan-intent decision logic in a pure function with unit tests.
- Keep camera adapter behind a platform abstraction.
- Keep local validation separate from backend submission.
- Keep request construction in a typed intent mapper.
- Keep supervisor approval in a separate component or hook.
- Keep analytics redaction centralized.
- Keep offline queue behavior behind an explicit capability flag.
- Keep all endpoint submissions guarded against duplicate taps.

Suggested file ownership:

- Screen route owns delivery load, intent load, camera state, and navigation.
- Scanner component owns camera preview and detection.
- Intent mapper owns schema-specific request construction.
- Recovery component owns error actions.
- Fallback component owns manual entry and supervisor approval.
- Tests cover intent derivation, request mapping, and error states.

Required implementation tests:

- Missing scan intent blocks submit.
- Safe single-intent derivation works for assigned driver pickup.
- Ambiguous intent routes back to detail.
- Camera denied opens manual entry.
- Local scan validation enforces 4 to 80 characters.
- Intake maps code to `labelScanCode`.
- Later intents map code to `packageScanCode`.
- Destination receipt refuses submit without `condition` and `nextStep`.
- Manual fallback sends `fallbackUsed=true` and `supervisorOverrideActorId`.
- Mismatch shows custody chain and issue routes.
- Duplicate scan shows custody chain route.
- Offline queued does not mark custody complete.
- Analytics never includes scan code.

## Final Implementation Decisions

The scanner must be accessed through the shared `ScanComponent` adapter. The selected native camera or scanning library must stay hidden behind that adapter so role screens share capture behavior, permissions, analytics redaction, and accessibility affordances.

QR and Code 128 are the required v1 package label formats. Additional barcode formats must stay disabled unless the package-label policy adds them explicitly.

Offline custody actions must use the shared offline outbox. A custody scan can be shown as locally captured or pending sync, but it must not be shown as confirmed until backend success returns.

Supervisor approval must use a blocking modal or sheet that verifies a supervisor session or approval token and returns a trusted `supervisorOverrideActorId`. The scan action must not continue with a manually typed supervisor name.

## Final Handoff Notes

`OpsScanPackage` must be treated as an evidence capture route, not a scanner utility. The core safety rule is simple: delivery identity plus scan intent plus backend capability plus explicit confirmation must all exist before submission.

If a scan creates or confirms custody, the UI must say so before the staff member submits. If the scan cannot be trusted, the recovery path must make the package safer, not just faster.

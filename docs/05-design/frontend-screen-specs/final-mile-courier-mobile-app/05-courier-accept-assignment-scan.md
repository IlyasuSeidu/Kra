# CourierAcceptAssignmentScan Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierAcceptAssignmentScan` |
| Route | `/(ops)/courier/assignments/:deliveryId/accept-scan` |
| Primary test ID | `screen-courier-accept-assignment-scan` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `accept_final_mile_assignment` |
| Offline critical | Yes, capture scan attempt locally but treat custody as pending until server confirmation |
| Required role | `final_mile_courier` |
| Primary mutation | `POST /v1/deliveries/:id/accept-final-mile-assignment` through route key `accept_final_mile_assignment` |
| Request schema | `acceptFinalMileAssignmentRequestSchema` |
| Response schema | `deliveryLifecycleResponseSchema` |
| Related routes | `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/custody-accepted`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/issues`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Contract-backed custody acceptance scanner with scan, manual fallback, supervisor override capture, idempotent mutation, and pending-sync protection |

## Product Job
`CourierAcceptAssignmentScan` is the final-mile custody gate at the destination station.

It answers seven operational questions:

- `Am I the assigned courier for this package?`
- `Is the package physically in front of me?`
- `Does the package scan match the delivery assigned to me?`
- `Has custody moved from destination station to me?`
- `If scanner or camera access fails, is the fallback properly authorized?`
- `Is the acceptance confirmed by the server or only pending local sync?`
- `What can I do next without creating custody ambiguity?`

The screen must prevent the courier from leaving the station with a package that has not been verified against the immutable delivery label binding.

## Product Standard
This screen is not a general scanner. It is a custody-transfer workflow.

The courier should be able to:

- See the delivery identity and assignment context before scanning.
- Understand why a scan is required before custody moves.
- Grant camera permission with clear operational benefit.
- Center the package code quickly in a high-confidence scan frame.
- Receive immediate feedback for match, mismatch, unreadable code, duplicate scan, or server rejection.
- Use manual entry only as a controlled fallback.
- Capture supervisor override when the fallback path is used.
- Submit exactly one idempotent acceptance mutation.
- See whether custody is confirmed, pending, rejected, or requires support.
- Move to `CourierCustodyAccepted` only after confirmed server response.

The screen must never:

- Mark custody accepted from local scan alone.
- Let a courier accept a package assigned to another courier.
- Let a station operator accept on behalf of the courier.
- Show or log the full raw package scan code outside the scan workflow.
- Store scan data in analytics events.
- Treat manual package ID entry as equal to a scanner match without the fallback controls.
- Allow out-for-delivery actions before acceptance is confirmed by the server.
- Hide a status mismatch, reassignment, or permission failure behind generic retry copy.
- Let repeated taps create multiple custody events.
- Expose receiver phone, OTP, proof asset reference, or precise receiver location on this screen.

## Audience
Primary audience:

- Final-mile couriers receiving packages from destination station staff.

Secondary audience:

- Destination station staff who need to witness a clean custody transfer.
- Station supervisors authorizing fallback acceptance when scan hardware or network fails.
- Support staff reviewing blocked handoff incidents.
- Security reviewers validating package-code privacy and audit controls.
- QA validating scanner, fallback, idempotency, offline, and authorization behavior.
- Claude Code implementing the React Native screen, native camera bridge usage, and tests.

## Context Of Use
The courier may open this screen:

- From `CourierAssignmentDetail` before taking the package.
- From the active assignment queue when a job is waiting for acceptance.
- From a station prompt after final-mile assignment.
- After a camera permission denial.
- After a failed scan attempt.
- After a queued offline acceptance attempt returns from sync.
- After support asks the courier to retry acceptance.

The environment may include glare, low lighting, queue pressure, a crowded counter, damaged labels, intermittent connectivity, loud station operations, and staff waiting for confirmation. The UI must be fast, direct, and audit-safe.

## Design Brief
User and job:

- A verified final-mile courier needs to prove they have the exact assigned package before custody transfers.

Surface type:

- Mobile scanner and controlled mutation workflow.

Primary action:

- Scan package code and submit `accept_final_mile_assignment`.

Visual thesis:

- `Custody lock`: a dark, high-contrast scan chamber with a calm verification dossier below it and a single irreversible acceptance path.

Restraint rule:

- Do not turn this into a delivery detail page. It should show only the facts needed to verify, accept, or recover safely.

Density:

- Low during active scan, medium in review and fallback states.

Platform stance:

- Native-plus React Native scanner surface with platform camera conventions, tactile feedback, large controls, and strict state authority.

## External Research Used
Only directly relevant links were used:

- [Google ML Kit barcode scanning on Android](https://developers.google.cn/ml-kit/vision/barcode-scanning/android?hl=en): supports configuring barcode formats, using sufficient resolution and focus, applying auto-zoom, and optimizing real-time scanning performance.
- [Apple VisionKit data scanning](https://developer.apple.com/documentation/visionkit/scanning-data-with-the-camera): supports live camera scanning, user guidance, item highlighting, tap-to-focus, pinch-to-zoom, and barcode recognition on iOS.
- [DoorDash merchant-to-dasher pickup verification](https://help.doordash.com/en-ca/dashers/article/merchant-to-dasher-pickup-verification): supports QR or order-code verification, wrong-code retry, and manual entry when camera access or scanning fails.
- [Uber delivery pickup guidance](https://www.uber.com/gb/en/deliver/basics/making-deliveries/how-to-deliver/): supports matching app details to the physical order before leaving pickup.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible scan, retry, permission, and sync status announcements.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large camera, fallback, and submit controls.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports visible focus on fallback fields, permission actions, and recovery controls.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/04-courier-assignment-detail.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/06-courier-custody-accepted.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/package-statuses.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`

## Backend Contract
Mutation:

```http
POST /v1/deliveries/:id/accept-final-mile-assignment
```

Route key:

```text
accept_final_mile_assignment
```

Required capability:

```text
accept_final_mile_assignment
```

Required actor role:

```text
final_mile_courier
```

Required delivery status:

```text
assigned_for_final_mile
```

Request body:

```json
{
  "packageScanCode": "PKG-6001",
  "fallbackUsed": false
}
```

Fallback request body:

```json
{
  "packageScanCode": "PKG-6001",
  "fallbackUsed": true,
  "supervisorOverrideActorId": "usr_supervisor_123",
  "note": "Camera could not read a damaged label after station supervisor inspection."
}
```

Field rules:

- `packageScanCode` is required, trimmed, minimum 4 characters, maximum 80 characters.
- `fallbackUsed` is optional and defaults to `false`.
- `supervisorOverrideActorId` is optional but required by this UI whenever `fallbackUsed=true`.
- `note` is optional by contract, but required by this UI whenever `fallbackUsed=true`.
- `note` must be 3 to 240 characters when sent.

Backend enforced rules:

- Missing delivery returns `NOT_FOUND`.
- Non-courier actor returns `FORBIDDEN`.
- Courier mismatch returns `FORBIDDEN`.
- Status other than `assigned_for_final_mile` returns `INVALID_STATUS_TRANSITION`.
- Package scan mismatch is rejected by immutable package-label validation.
- Successful acceptance writes a `final_mile_assignment_accepted` checkpoint.
- Successful acceptance sets `currentCustodyRole` to `final_mile_courier`.
- Successful acceptance sets `currentCustodyActorId` to the courier actor ID.
- Successful acceptance creates a `destination_station_to_final_mile_courier` handoff event.
- Handoff proof uses `type: package_scan`.
- Handoff proof carries `fallbackUsed`.
- Handoff proof carries `supervisorOverrideActorId` when present.
- The route is idempotent through the mutation wrapper and request fingerprint.

Response handling:

- The response is `deliveryLifecycleResponseSchema`.
- The UI must read the returned status, delivery ID, event ID, and server timestamp.
- The UI must invalidate `Delivery`, `DeliveryTimeline`, and `CourierQueue`.
- The UI must refresh local assignment detail after success.
- The UI must navigate to `CourierCustodyAccepted` only after a successful server response.

## Custody Semantics
Assignment is not custody.

Custody moves only when all conditions are true:

- The courier is authenticated.
- The courier has `accept_final_mile_assignment`.
- The courier actor role is `final_mile_courier`.
- The delivery is assigned to that courier.
- The delivery is in `assigned_for_final_mile`.
- The package scan code matches the registered package label binding.
- The backend accepts the mutation.
- The handoff event is recorded.

Local scan recognition alone means only:

- The camera saw a machine-readable code.
- The code was captured by the device.
- The code is ready to submit or compare locally if a cached binding exists.

Local scan recognition does not mean:

- The package belongs to the courier.
- Custody has transferred.
- The station is released from accountability.
- The courier may start the delivery trip.
- The package can leave the station without sync confirmation.

## Route Entry Preconditions
The screen can be opened when:

- `deliveryId` exists in the route.
- The user has a valid authenticated session.
- The user role is `final_mile_courier`.
- The delivery detail is available from server or trusted cache.
- The delivery status is `assigned_for_final_mile`.
- The delivery is assigned to the current courier.

If any precondition fails:

- Redirect to `CourierAssignmentDetail` when delivery still exists but state changed.
- Redirect to `CourierAssignments` when the job is no longer in the courier scope.
- Open `OpsActionRecovery` when the failure cannot be safely resolved inside this screen.
- Never keep a scanner open for a delivery outside courier scope.

## Information Architecture
The screen has six zones:

- Header custody context.
- Scanner chamber.
- Verification dossier.
- Scan result panel.
- Fallback and override drawer.
- Sticky action footer.

The initial scan state prioritizes the scanner chamber. The review state shifts weight to the scan result panel and acceptance action. The fallback state shifts weight to manual entry and supervisor controls.

## Header Custody Context
Purpose:

- Confirm the courier is scanning the intended assignment before camera work starts.

Required content:

- Back action to `CourierAssignmentDetail`.
- Delivery reference display.
- Current status chip: `Needs custody acceptance`.
- Assignment age when available.
- Destination station short name.
- Offline or saved-data indicator.

Header copy:

- Title: `Accept package`
- Subtitle: `Scan the package code before taking custody.`

Delivery reference display:

- Show short tracking code or delivery ID suffix.
- Do not show package scan code before scan.
- Do not show receiver phone.
- Do not show OTP.

Station line:

- `From destination station`
- Station name or code.
- If station data is missing, show `Destination station on record`.

Status authority:

- `Live` when fetched from server in the current session.
- `Saved` when loaded from cache.
- `Pending sync` when an acceptance is queued.
- `Blocked` when authorization or status prevents acceptance.

## Scanner Chamber
Purpose:

- Let the courier capture the package code quickly and confidently.

Required elements:

- Full-width camera preview.
- Centered scan window.
- Package-corner alignment marks.
- Torch toggle when supported.
- Manual entry affordance.
- Camera permission status.
- Scan instruction line.
- Haptic and audio-safe feedback on detection.

Default scan instruction:

- `Center the package code inside the frame.`

Secondary instruction:

- `Use the code attached to the package, not a receipt or station note.`

Scan frame behavior:

- Idle frame color: neutral high-contrast stroke.
- Potential code detected: amber stroke with `Hold steady`.
- Matched local code or ready-to-submit captured code: green stroke with `Code captured`.
- Wrong or rejected code: red stroke with `Wrong package code`.
- Camera denied: no live preview, permission guidance card.
- Camera unavailable: no live preview, manual fallback card.

Performance rules:

- Initialize camera only after the screen is visible.
- Pause scanner after a code is captured.
- Resume scanner only when the courier taps `Scan again`.
- Avoid scanning multiple codes at once for this workflow.
- Prefer expected package-code formats when scanner configuration allows.
- Use torch state that resets when leaving the route.
- Support tap-to-focus where platform allows.
- Support pinch-to-zoom where platform allows.
- Prevent screen sleep while the scanner is active.

## Scanner Permission States
Unknown permission:

- Show a concise permission card before requesting camera access.
- Primary action: `Enable camera`.
- Secondary action: `Enter code manually`.
- Explain that the camera is used only to verify package custody.

Permission prompt copy:

- Title: `Camera needed for package custody`
- Body: `Scan the package code so the station and courier both have a verified handoff record.`

Denied permission:

- Show a recovery card with operating-system settings action when available.
- Keep manual entry available.
- Require fallback controls if manual entry is used.
- Do not repeatedly trigger native permission prompts.

Denied copy:

- Title: `Camera access is off`
- Body: `Turn on camera access or use supervised manual entry.`

Unavailable camera:

- Show clear device capability or camera-use conflict.
- Offer retry.
- Offer supervised manual entry.
- Do not show a blank camera surface.

Unavailable copy:

- Title: `Scanner is not available`
- Body: `The package can still be accepted with supervised manual entry if the station approves it.`

## Verification Dossier
Purpose:

- Give enough package context to avoid wrong-package scans while keeping sensitive data minimal.

Required fields:

- Delivery reference.
- Destination station.
- Receiver first name or display name only.
- Receiver area or neighborhood if already visible in detail permissions.
- Package description if available.
- Size tier.
- Fragile flag.
- Weight band.
- Assignment timestamp or received-at-destination timestamp if available.

Hidden fields:

- Full package scan code.
- Full receiver phone.
- OTP or verification token.
- Proof asset reference.
- Raw GPS coordinates.
- Complete address if this screen is opened before the courier has passed detail authorization.

Field hierarchy:

- First line: delivery reference and station.
- Second line: package description and size.
- Third line: receiver context.
- Fourth line: status and SLA.

Dossier warning:

- If cached detail is stale, show `Saved details. Confirm with station before scanning.`
- If assignment is older than accepted SLA threshold, show `Acceptance window may be expired. Scan will be checked by the server.`

## Scan Data Handling
Raw scan code is sensitive custody evidence.

Client rules:

- Keep raw scan code in memory during active scanner and submit flow.
- Do not write raw scan code to analytics.
- Do not include raw scan code in crash logs.
- Do not render raw scan code after success.
- Do not include raw scan code in toast text.
- Do not persist raw scan code in normal query cache.
- If offline queuing is enabled, store raw scan code only inside the encrypted mutation outbox payload.
- Clear raw scan code from memory when leaving the screen, cancelling, or after success.

Display masking:

- During review, show a masked code such as `Captured code ending 6001`.
- If format is unknown, show `Code captured`.
- Never show more than the last 4 characters unless the courier is actively editing manual entry.

Analytics redaction:

- Allowed: scan attempt count, scanner state, elapsed time bucket, fallback used, permission state, outcome code.
- Not allowed: package scan code, receiver phone, exact address, OTP, proof reference, GPS.

## Scan Matching Strategy
The server is the final authority.

Client-side comparison may be used only when a trusted package-label hint is already available in local encrypted state. If the local app does not have that binding, it should treat the captured code as `ready to submit`, not as `matched`.

States:

- `No code`: scanner is active.
- `Potential code`: scanner found a region but no readable value.
- `Captured`: scanner read a value.
- `Locally consistent`: captured value matches a trusted cached binding.
- `Locally inconsistent`: captured value conflicts with a trusted cached binding.
- `Submitting`: mutation in flight.
- `Confirmed`: server accepted custody.
- `Rejected`: server refused the mutation.
- `Queued`: offline mutation stored for later sync.

Rules:

- If locally inconsistent, do not submit automatically.
- If locally inconsistent, show wrong-package warning and require `Scan again`.
- If there is no local binding, allow submit but frame copy must say `Server will verify this code.`
- If the server rejects the code, move to blocked result state.
- If the server confirms, navigate to `CourierCustodyAccepted`.

## Primary Happy Path
1. Courier opens from assignment detail.
2. Screen loads live delivery detail.
3. Screen verifies role, assignment, and `assigned_for_final_mile`.
4. Courier enables camera if needed.
5. Courier centers package code inside scan frame.
6. Scanner captures code.
7. Scanner pauses.
8. UI masks the captured code and shows review state.
9. Courier taps `Accept custody`.
10. UI disables repeated submit.
11. Mutation sends `packageScanCode`.
12. Server validates package-label binding and actor assignment.
13. Server records checkpoint and handoff event.
14. UI receives `deliveryLifecycleResponseSchema`.
15. UI invalidates delivery, timeline, and courier queue data.
16. UI navigates to `CourierCustodyAccepted`.

## Manual Fallback Path
Manual entry is a controlled exception, not a convenience shortcut.

Manual entry can be used when:

- Camera permission is denied.
- Camera hardware is unavailable.
- Code is damaged but still readable by a human.
- Scanner repeatedly fails after reasonable retry.
- Low-light conditions prevent reliable scanning.
- Station supervisor approves the fallback.

Manual entry cannot be used when:

- The courier has no assignment for the delivery.
- The delivery is not in `assigned_for_final_mile`.
- The code is missing from the package.
- The courier is away from the station.
- No supervisor is available for fallback approval.

Fallback UI requirements:

- Manual entry field.
- Supervisor override actor field or station-approved supervisor selector.
- Required note field.
- Clear warning that fallback changes accountability.
- Primary action: `Accept with supervised fallback`.
- Secondary action: `Return to scanner`.

Manual entry field:

- Label: `Package code`
- Help text: `Enter the code attached to the package.`
- Autocapitalize: characters.
- Trim leading and trailing whitespace.
- Preserve internal hyphens and alphanumeric characters.
- Minimum 4 characters.
- Maximum 80 characters.
- Do not autocorrect.
- Do not submit on keyboard return unless validation passes.

Supervisor field:

- Label: `Supervisor override`
- Required when `fallbackUsed=true`.
- Accept only a valid supervisor actor selected from an authorized station source when that source exists.
- If no selector exists, require a scanned or entered supervisor ID and server-side validation.

Fallback note:

- Label: `Why fallback is needed`
- Required when `fallbackUsed=true`.
- Minimum 3 characters.
- Maximum 240 characters.
- Suggested structure: `Camera issue`, `label damage`, `network issue`, `station-approved manual verification`.
- Do not allow empty or vague notes.

Fallback request body:

- `packageScanCode`: manual field value.
- `fallbackUsed`: `true`.
- `supervisorOverrideActorId`: selected supervisor ID.
- `note`: fallback note.

Fallback success state:

- Navigate to `CourierCustodyAccepted`.
- Show that the acceptance used supervised fallback.
- Ensure timeline and audit detail can show fallback evidence.

Fallback rejection state:

- Keep fields filled except sensitive scan data rules still apply.
- Show server reason.
- Offer `Try scanner`, `Edit code`, and `Contact support`.

## Offline Policy
Offline support is required because station connectivity can be weak, but custody authority must remain strict.

Allowed offline behavior:

- Open saved assignment context.
- Start camera scanner.
- Capture code.
- Store a queued acceptance mutation in encrypted outbox when the courier chooses to proceed.
- Show pending sync state.
- Retry sync automatically when network returns.
- Let the courier open support or outbox.

Disallowed offline behavior:

- Do not mark custody as confirmed.
- Do not navigate to `CourierCustodyAccepted` as a confirmed state.
- Do not allow `mark_out_for_delivery`.
- Do not hide that station release is pending server confirmation.
- Do not discard captured fallback metadata.
- Do not send receiver notifications from the client.

Queued acceptance requirements:

- The queued action must include delivery ID, package scan code, fallback flag, supervisor override ID when used, note when used, idempotency key, actor ID, and client creation time.
- The queued action must be stored only in secure encrypted local storage.
- The visible outbox row must redact package scan code.
- The outbox row title must be `Accept package custody`.
- The outbox row status must be `Waiting for server confirmation`.
- Sync success must invalidate delivery, timeline, courier queue, and the outbox row.
- Sync rejection must move the user to `OpsActionRecovery`.

Pending copy:

- Title: `Acceptance waiting to sync`
- Body: `The package is not confirmed in your custody until the server accepts this scan. Stay with the station or ask a supervisor before leaving.`

Offline footer action:

- Primary: `Save acceptance for sync`
- Secondary: `Open offline outbox`
- Tertiary: `Cancel and go back`

Connectivity restoration:

- If sync succeeds while this route is foregrounded, navigate to `CourierCustodyAccepted`.
- If sync succeeds in background, update `CourierHome`, `CourierAssignments`, and the delivery timeline.
- If sync fails in background, create a visible recovery task.

## Idempotency And Duplicate-Tap Protection
The backend mutation is idempotent. The UI must still prevent duplicated user actions.

Client requirements:

- Generate a stable idempotency key per acceptance attempt.
- Disable `Accept custody` after first tap.
- Show determinate progress only when network progress is known.
- Show indeterminate progress otherwise.
- Preserve the idempotency key across retry for the same captured code.
- Create a new idempotency key only after `Scan again`, code edit, or fallback field change.
- If the same request returns a previous success, treat it as success and refresh detail.
- If a conflicting request is detected, show action recovery.

Duplicate scan behavior:

- Ignore repeated camera detections while in review state.
- If the courier taps `Scan again`, clear captured code and resume scanner.
- If the same code is captured again, keep the same review flow.
- If a different code is captured after `Scan again`, treat it as a new attempt.

## States
### Loading
Use when:

- Route is resolving delivery ID.
- Delivery detail is fetching.
- Auth or role state is resolving.

UI:

- Header skeleton.
- Camera chamber shell without active camera.
- Message: `Checking assignment...`

Rules:

- Do not initialize camera before authorization state is known.
- Do not request camera permission before delivery scope is confirmed.

### Ready To Scan
Use when:

- Assignment is valid.
- Camera is available or permission can be requested.
- No scan code is captured.

UI:

- Active scanner chamber.
- Dossier below scanner.
- Manual entry affordance.
- Sticky footer with non-submit guidance.

Primary action:

- Camera captures automatically.

Secondary actions:

- `Enter code manually`
- `Open assignment detail`

### Code Captured
Use when:

- Scanner captured a readable code.
- Mutation has not yet been submitted.

UI:

- Frozen camera frame or neutral review panel.
- Masked captured code.
- Local consistency indicator if available.
- Dossier.
- Sticky footer.

Primary action:

- `Accept custody`

Secondary actions:

- `Scan again`
- `Enter code manually`

### Local Mismatch
Use when:

- Captured code conflicts with trusted local package binding.

UI:

- Red result panel.
- Warning that this appears to be the wrong package.
- Show masked captured code suffix only.
- Keep delivery dossier visible.

Primary action:

- `Scan again`

Secondary actions:

- `Open assignment detail`
- `Contact support`

Forbidden action:

- Do not show `Accept custody` unless a supervisor fallback path is explicitly opened and completed.

### Submitting
Use when:

- Mutation is in flight.

UI:

- Scanner paused.
- Footer locked.
- Progress state.
- Message: `Verifying package and moving custody...`

Rules:

- Disable back only for the critical mutation moment if navigation could interrupt request handling.
- If back remains available, show interruption warning.
- Do not allow field edits.
- Do not allow another scan.

### Confirmed
Use when:

- Server returns successful lifecycle response.

UI:

- Very brief success feedback.
- Navigate to `CourierCustodyAccepted`.

Rules:

- Do not linger on scanner after confirmed success.
- Clear raw code from memory.
- Refresh route data.

### Queued Offline
Use when:

- Courier captured code and chose offline queue.

UI:

- Pending custody panel.
- Outbox link.
- Station-stay warning.

Primary action:

- `Open offline outbox`

Secondary action:

- `Back to assignment`

Rules:

- Do not mark delivery as out for delivery.
- Do not show a confirmed custody badge.

### Rejected
Use when:

- Server returns an error.

UI:

- Blocking result panel.
- Specific error title.
- Recovery actions.
- Dossier.

Primary action depends on error:

- `Scan again`
- `Open assignments`
- `Contact support`
- `Open action recovery`

### Permission Denied
Use when:

- Camera permission is denied or restricted.

UI:

- Permission recovery card.
- Manual fallback path.
- Dossier.

Primary action:

- `Open camera settings`

Secondary action:

- `Use supervised manual entry`

### Camera Unavailable
Use when:

- Device has no usable camera.
- Camera is blocked by another app.
- Native scanner initialization failed.

UI:

- Device recovery card.
- Retry action.
- Manual fallback path.

Primary action:

- `Retry scanner`

Secondary action:

- `Use supervised manual entry`

## Error Handling
### `NOT_FOUND`
Meaning:

- Delivery no longer exists or cannot be read.

UI title:

- `Delivery not found`

Body:

- `This assignment is no longer available. Return to your active jobs.`

Actions:

- `Back to assignments`
- `Contact support`

### `FORBIDDEN`
Meaning:

- Actor is not allowed or delivery is assigned to another courier.

UI title:

- `This package is not assigned to you`

Body:

- `Do not take custody. Ask the station operator to check the assignment.`

Actions:

- `Back to assignments`
- `Contact support`

### `INVALID_STATUS_TRANSITION`
Meaning:

- Delivery is no longer in `assigned_for_final_mile`.

UI title:

- `Acceptance is no longer available`

Body:

- `The delivery status changed before this scan was accepted. Refresh the assignment before taking the package.`

Actions:

- `Refresh assignment`
- `Back to detail`
- `Contact support`

### Package Scan Mismatch
Meaning:

- The scanned package code does not match the delivery's registered label.

UI title:

- `Wrong package code`

Body:

- `This scan does not match the assigned package. Do not take custody of this package.`

Actions:

- `Scan again`
- `Open assignment detail`
- `Contact support`

### Network Timeout
Meaning:

- Mutation did not return in expected time.

UI title:

- `Verification did not finish`

Body:

- `Keep the package at the station until the acceptance is confirmed or queued for sync.`

Actions:

- `Retry`
- `Save acceptance for sync`
- `Cancel`

### Idempotency Conflict
Meaning:

- The server detected a conflicting mutation attempt.

UI title:

- `Acceptance needs review`

Body:

- `A different acceptance attempt may already exist for this delivery. Open recovery before handling the package.`

Actions:

- `Open action recovery`
- `Contact support`

### Rate Limit
Meaning:

- Too many mutation attempts.

UI title:

- `Too many attempts`

Body:

- `Wait before trying again, or contact support if the package is at the counter.`

Actions:

- `Try again later`
- `Contact support`

## Content System
Tone:

- Direct.
- Operational.
- Calm.
- Never playful.

Vocabulary:

- Use `package code`, `custody`, `station`, `server confirmation`, and `supervised fallback`.
- Avoid vague words like `done`, `okay`, or `processed` for custody states.
- Use `confirmed` only after server success.
- Use `pending` for offline queued acceptance.
- Use `blocked` for authorization, mismatch, or status errors.

Primary action labels:

- `Accept custody`
- `Save acceptance for sync`
- `Accept with supervised fallback`

Secondary action labels:

- `Scan again`
- `Enter code manually`
- `Open assignment detail`
- `Open offline outbox`
- `Contact support`

Critical warnings:

- `Do not leave the station until custody is confirmed.`
- `This package is not assigned to you.`
- `Manual entry requires supervisor approval.`
- `The server will verify this package code.`

## Visual System
Overall look:

- Dark scanner area.
- Light operational dossier.
- Strong custody status strip.
- Minimal chrome.
- High contrast.
- Large touch targets.

Color roles:

- Neutral scanner background: near-black.
- Ready state: cool gray.
- Captured state: green.
- Pending state: amber.
- Blocked state: red.
- Offline state: amber with neutral support copy.
- Success state: green only after server confirmation.

Material:

- Scanner chamber should feel like a secure instrument.
- Dossier should feel like an official handoff record.
- Fallback drawer should feel controlled and serious.

Spacing:

- Scan chamber should dominate the first viewport.
- Keep 16 to 24 px safe spacing around touch controls.
- Keep footer action isolated from secondary actions.
- Avoid dense text inside camera area.

Typography:

- Use a strong field-work display style for the screen title if the product type scale supports it.
- Use tabular numerals for delivery references and timers.
- Use compact labels for field facts.
- Use body text large enough for outdoor reading.

Iconography:

- Scanner frame icon for scan state.
- Shield or lock icon for custody.
- Alert icon for blocked state.
- Cloud or sync icon for pending offline state.
- Key or supervisor icon for fallback override.

## Motion And Feedback
Motion must clarify scanner state and custody authority.

Allowed motion:

- Scan frame pulse while searching.
- Short lock-in animation when code captured.
- Small shake for local mismatch.
- Footer lift when review actions become available.
- Success compression into `CourierCustodyAccepted` route.

Not allowed:

- Continuous decorative motion.
- Confetti or celebratory graphics.
- Motion that obscures the camera frame.
- Long transitions before critical warning copy appears.

Haptics:

- Light haptic on code captured.
- Warning haptic on mismatch.
- Success haptic only after server confirmation.
- No haptic for mere potential-code detection.

Reduced motion:

- Replace pulses with static state changes.
- Keep status text and color changes.
- Do not remove essential feedback.

## Accessibility
Screen reader behavior:

- Scanner state changes must be announced as status messages.
- Permission state changes must be announced.
- Capture result must be announced without reading full package code.
- Server success must be announced before route transition when feasible.
- Server rejection must move focus to the error panel.

Required announcements:

- `Scanner ready. Center the package code inside the frame.`
- `Code captured. Review before accepting custody.`
- `Wrong package code. Do not take custody.`
- `Acceptance waiting to sync. Custody is not confirmed.`
- `Custody confirmed. Opening confirmation.`

Focus order:

- Back action.
- Header title and status.
- Scanner instructions.
- Torch and manual entry controls.
- Dossier summary.
- Result panel.
- Primary footer action.
- Secondary actions.

Touch targets:

- Minimum 44 by 44 points for all controls.
- Prefer larger controls for scanner, torch, fallback, and submit actions.
- Keep manual entry submit above keyboard safe area.

Keyboard:

- Manual entry must be fully keyboard reachable.
- Supervisor selector must be keyboard reachable.
- Focus must remain inside fallback drawer while it is open.
- Escape or back closes fallback drawer before leaving screen.

Visual accessibility:

- Do not rely on color alone.
- Pair every state with text and icon.
- Maintain high contrast in scanner overlays.
- Support large text without clipping the footer action.
- Keep error panels readable in sunlight.

Camera alternative:

- Manual fallback is the accessibility alternative for users who cannot operate live camera scanning.
- Manual fallback must still preserve supervisor control and audit evidence.

## Privacy And Security
Sensitive fields:

- `packageScanCode`
- `supervisorOverrideActorId`
- receiver phone
- receiver exact address
- OTP
- proof asset reference
- precise GPS

Rules:

- Do not log `packageScanCode`.
- Do not include `packageScanCode` in analytics.
- Do not persist `packageScanCode` outside encrypted mutation outbox.
- Do not put raw scan code in navigation params.
- Do not include raw scan code in error boundaries.
- Do not show raw scan code in screenshots or debug overlays.
- Do not expose receiver contact on this screen.
- Do not show OTP or completion proof controls.
- Require auth refresh before retrying after session expiry.
- Clear scanner state on sign-out.

Screenshot policy:

- If the app has a secure-screen mode for operational custody flows, this screen should enable it.
- At minimum, raw package code must not be visible after capture.

## Data Requirements
Required route params:

- `deliveryId`

Required authenticated principal fields:

- actor ID.
- role.
- capabilities.
- station scope if available.

Required delivery fields:

- delivery ID.
- tracking code or public reference.
- current status.
- assigned final-mile courier ID.
- destination station ID.
- destination station label if available.
- current custody role.
- current custody actor ID.
- receiver display name if permitted.
- package description if available.
- package size tier if available.
- package weight band if available.
- fragile flag if available.
- received-at-destination timestamp if available.
- assignment timestamp if available.

Mutation input fields:

- `packageScanCode`
- `fallbackUsed`
- `supervisorOverrideActorId`
- `note`

Mutation response fields:

- status.
- delivery ID.
- event ID.
- occurred timestamp.
- current custody role.
- current custody actor ID.

Local UI state:

- permission state.
- camera availability state.
- scanner active state.
- torch state.
- captured code in memory.
- masked captured code display value.
- local consistency state.
- fallback drawer state.
- supervisor override value.
- fallback note.
- idempotency key.
- submit state.
- offline outbox row ID.

## API Integration
Hook:

- `useAcceptFinalMileAssignmentMutation`

Invalidates:

- `Delivery`
- `DeliveryTimeline`
- `CourierQueue`

Optimistic update:

- Do not optimistically mark custody confirmed.
- Do not optimistically mark status as out for delivery.
- A local pending banner is allowed only for queued offline state.

Success handling:

- Clear captured code.
- Clear fallback fields.
- Invalidate detail and queue queries.
- Navigate to `/(ops)/courier/assignments/:deliveryId/custody-accepted`.

Failure handling:

- Keep scanner route open when retry is safe.
- Move to action recovery when delivery scope or status is unsafe.
- Clear captured code when rejection indicates wrong package.
- Preserve fallback note when server error is retryable.

Request construction:

- Build body from verified scanner or manual fallback state.
- Send `fallbackUsed=false` for scanner path.
- Send `fallbackUsed=true` for manual fallback path.
- Include `supervisorOverrideActorId` only when provided.
- Include `note` only when provided and valid.

## Navigation Rules
Entry:

- From `CourierAssignmentDetail`.
- From `CourierAssignments` row action.
- From push notification only after detail precheck.

Exit:

- Back to `CourierAssignmentDetail` when not submitted.
- To `CourierCustodyAccepted` after confirmed success.
- To `OpsOfflineOutbox` for queued acceptance.
- To `OpsActionRecovery` for unsafe conflict.
- To `CourierIssues` if support incident creation is required.

Back behavior:

- Before scan capture: normal back.
- After code capture: ask `Discard captured code?`
- During submit: prevent accidental interruption or show blocking confirmation.
- During queued state: allow back but keep outbox banner visible in parent screens.
- During fallback drawer: close drawer first.

Deep link behavior:

- Validate delivery scope before opening scanner.
- If status is already accepted by the same courier, route to `CourierCustodyAccepted`.
- If delivery is out for delivery, route to `CourierOutForDelivery`.
- If delivery is no longer assigned, route to assignments with toast.

## Offline Outbox Integration
Outbox row:

- Title: `Accept package custody`
- Subtitle: delivery reference and station.
- Status: `Waiting for server confirmation`
- Sensitive data: raw scan code redacted.
- Retry action: allowed when online.
- Cancel action: allowed only before server submission.

Outbox conflicts:

- Wrong package code after sync: show blocked recovery.
- Delivery reassigned after sync: show forbidden recovery.
- Delivery already accepted: refresh detail and determine if same actor.
- Status changed: route to detail with status explanation.

Parent screen banners:

- `CourierHome`: show `Custody acceptance pending sync`.
- `CourierAssignments`: row state `Pending custody sync`.
- `CourierAssignmentDetail`: block next lifecycle actions until sync resolves.

## Support And Escalation
Support entry points:

- Wrong package code.
- Delivery assigned to another courier.
- Camera unavailable and no supervisor override.
- Server conflict.
- Repeated network timeout.
- Lost package at station.
- Station refuses to release package after verified scan.

Support payload:

- delivery ID.
- route key.
- current status.
- actor ID.
- station ID.
- scanner state.
- fallback flag.
- error code.
- timestamp.

Do not include:

- raw package scan code.
- receiver phone.
- OTP.
- proof asset reference.

Support copy:

- `Support can review this handoff without seeing the full package code.`

## Empty And Edge Cases
Missing delivery ID:

- Show route error and return to assignments.

Missing station name:

- Use station code or `Destination station on record`.

Missing package description:

- Show `Package details limited. Verify the package code.`

Assignment expired:

- Allow scan only if backend still allows status.
- Warn that acceptance window may be expired.

Courier session expired:

- Pause scanner.
- Route to sign-in.
- Do not persist captured code outside secure outbox.

Multiple visible codes:

- Ask courier to isolate the package code.
- Do not automatically choose among multiple values.

Damaged label:

- Offer `Try torch`, `Scan again`, and supervised manual fallback.

Low battery:

- Do not block acceptance.
- Show compact warning if camera may fail.

No network at station:

- Offer pending-sync path with station-stay warning.

## Component Inventory
Screen-level components:

- `CourierAcceptAssignmentScanScreen`
- `CustodyScanHeader`
- `PackageScannerChamber`
- `ScannerPermissionCard`
- `ScannerUnavailableCard`
- `PackageVerificationDossier`
- `ScanResultPanel`
- `ManualFallbackDrawer`
- `SupervisorOverrideSelector`
- `FallbackReasonField`
- `CustodyAcceptanceFooter`
- `OfflineAcceptanceBanner`
- `ScannerErrorPanel`
- `CustodySubmitProgress`

Shared components:

- `StatusAuthorityStrip`
- `DeliveryReferenceBadge`
- `StationBadge`
- `OfflineStateBadge`
- `SecureMaskedValue`
- `CriticalWarningCard`
- `ActionRecoveryLink`

Native bridge dependencies:

- Camera permission manager.
- Barcode scanner surface.
- Torch control.
- Haptics.
- Secure local storage for outbox.
- Network state listener.

## Component Responsibilities
`CourierAcceptAssignmentScanScreen`:

- Own route params, auth guard, delivery guard, scanner flow, mutation state, and navigation.

`CustodyScanHeader`:

- Show title, status, delivery reference, station, and authority state.

`PackageScannerChamber`:

- Render camera preview, scan frame, torch, scan instructions, and capture callback.

`ScannerPermissionCard`:

- Explain camera need, request permission, and route to fallback.

`ScannerUnavailableCard`:

- Explain device or initialization problem and expose retry plus fallback.

`PackageVerificationDossier`:

- Show minimal package, station, and assignment facts.

`ScanResultPanel`:

- Show captured, mismatch, submitted, pending, or rejected result.

`ManualFallbackDrawer`:

- Contain manual code entry, supervisor override, note, and fallback submit.

`SupervisorOverrideSelector`:

- Collect authorized supervisor ID for fallback accountability.

`FallbackReasonField`:

- Capture fallback reason within contract bounds.

`CustodyAcceptanceFooter`:

- Own primary submit, offline save, and secondary actions.

`OfflineAcceptanceBanner`:

- Warn that custody is not confirmed until sync succeeds.

`ScannerErrorPanel`:

- Map backend and scanner errors to exact recovery actions.

`CustodySubmitProgress`:

- Lock the flow during mutation and explain what is happening.

## State Machine
```text
loading
  -> blocked_precondition
  -> permission_unknown
  -> permission_denied
  -> scanner_ready

permission_unknown
  -> scanner_ready
  -> permission_denied
  -> manual_fallback

scanner_ready
  -> potential_code
  -> code_captured
  -> camera_unavailable
  -> manual_fallback

potential_code
  -> scanner_ready
  -> code_captured

code_captured
  -> local_mismatch
  -> review_ready
  -> scanner_ready

local_mismatch
  -> scanner_ready
  -> manual_fallback
  -> support

review_ready
  -> submitting
  -> scanner_ready
  -> manual_fallback
  -> queued_offline

manual_fallback
  -> submitting
  -> scanner_ready
  -> queued_offline

submitting
  -> confirmed
  -> rejected_retryable
  -> rejected_blocking
  -> queued_offline

queued_offline
  -> confirmed
  -> rejected_blocking
  -> outbox

confirmed
  -> custody_accepted_route

rejected_retryable
  -> scanner_ready
  -> manual_fallback

rejected_blocking
  -> action_recovery
  -> assignments
  -> support
```

## Validation Rules
Scanner path:

- Captured code must be non-empty.
- Captured code must pass schema length after trim.
- Captured code must not be submitted while local mismatch is active.
- Captured code must not be submitted twice in parallel.

Manual path:

- Manual code is required.
- Manual code must be 4 to 80 characters.
- Supervisor override is required.
- Fallback note is required.
- Fallback note must be 3 to 240 characters.
- Submit button remains disabled until all fallback fields pass validation.

Pre-submit:

- User must still be authenticated.
- Delivery must still be assigned to current courier in local state.
- Delivery must still appear to be `assigned_for_final_mile`.
- If local state is stale, UI must refresh when online before submit.

Post-submit:

- Server response is final.
- Client must not reinterpret rejected package code as success.

## Test IDs
Screen:

- `screen-courier-accept-assignment-scan`

Header:

- `courier-accept-scan-back`
- `courier-accept-scan-title`
- `courier-accept-scan-status`
- `courier-accept-scan-delivery-ref`
- `courier-accept-scan-station`
- `courier-accept-scan-authority`

Scanner:

- `courier-accept-scan-camera`
- `courier-accept-scan-frame`
- `courier-accept-scan-instruction`
- `courier-accept-scan-torch`
- `courier-accept-scan-manual-entry`
- `courier-accept-scan-permission-card`
- `courier-accept-scan-unavailable-card`

Dossier:

- `courier-accept-scan-dossier`
- `courier-accept-scan-package-description`
- `courier-accept-scan-package-size`
- `courier-accept-scan-receiver-context`
- `courier-accept-scan-assignment-age`

Result:

- `courier-accept-scan-result`
- `courier-accept-scan-masked-code`
- `courier-accept-scan-local-match`
- `courier-accept-scan-error-title`
- `courier-accept-scan-error-body`

Fallback:

- `courier-accept-scan-fallback-drawer`
- `courier-accept-scan-manual-code-input`
- `courier-accept-scan-supervisor-override`
- `courier-accept-scan-fallback-note`
- `courier-accept-scan-fallback-submit`
- `courier-accept-scan-return-scanner`

Footer:

- `courier-accept-scan-accept-custody`
- `courier-accept-scan-save-for-sync`
- `courier-accept-scan-scan-again`
- `courier-accept-scan-open-outbox`
- `courier-accept-scan-contact-support`

## Automated Test Matrix
Render tests:

- Renders loading state from route.
- Renders ready scanner state for valid assignment.
- Renders permission card before camera permission is granted.
- Renders denied permission recovery.
- Renders unavailable camera recovery.
- Renders verification dossier with allowed fields only.
- Does not render raw package scan code before scan.
- Does not render receiver phone.
- Does not render OTP.

Scanner tests:

- Captures a code and pauses scanner.
- Shows masked code after capture.
- Allows scan again.
- Clears captured code on scan again.
- Handles multiple detected codes by asking isolation.
- Handles potential-code state without submit.
- Handles local mismatch by blocking submit.
- Announces scanner state changes.

Mutation tests:

- Calls `accept_final_mile_assignment` with `packageScanCode`.
- Sends `fallbackUsed=false` for scanner path.
- Sends `fallbackUsed=true` for fallback path.
- Includes `supervisorOverrideActorId` only in fallback path.
- Includes `note` when fallback note is valid.
- Disables submit during mutation.
- Reuses idempotency key on retry for same code.
- Invalidates `Delivery`, `DeliveryTimeline`, and `CourierQueue`.
- Navigates to `CourierCustodyAccepted` after success.

Authorization tests:

- Blocks non-courier role.
- Blocks delivery assigned to another courier.
- Blocks status not equal to `assigned_for_final_mile`.
- Redirects if delivery leaves current courier scope.
- Handles expired session by pausing scanner.

Fallback tests:

- Manual field enforces min and max length.
- Manual field disables autocorrect.
- Supervisor override is required.
- Fallback note is required.
- Fallback warning is visible.
- Submit remains disabled until fields are valid.
- Server rejection preserves retryable fallback fields.

Offline tests:

- Captures code while offline.
- Offers save for sync.
- Stores queued mutation in encrypted outbox.
- Redacts scan code in outbox row.
- Shows pending custody state.
- Does not navigate to confirmed custody while offline.
- Blocks out-for-delivery while acceptance is pending.
- Navigates to confirmation after background sync success.
- Opens action recovery after background sync rejection.

Error tests:

- `NOT_FOUND` maps to delivery-not-found recovery.
- `FORBIDDEN` maps to not-assigned recovery.
- `INVALID_STATUS_TRANSITION` maps to changed-status recovery.
- Package mismatch maps to wrong-package recovery.
- Timeout maps to retry or save-for-sync recovery.
- Idempotency conflict maps to action recovery.
- Rate limit maps to wait or support recovery.

Accessibility tests:

- Screen has primary test ID.
- Focus starts at header after load.
- Permission prompt is reachable.
- Manual drawer traps focus while open.
- Error panel receives focus after rejection.
- Status changes are announced.
- Buttons meet target-size requirements.
- Color is not the only state signal.
- Large text does not hide footer actions.
- Reduced motion disables scanner pulse.

Security tests:

- Raw scan code is not sent to analytics.
- Raw scan code is not included in logs.
- Raw scan code is not placed in route params.
- Raw scan code is cleared after success.
- Raw scan code is encrypted if queued.
- Support payload excludes raw scan code.

## Manual QA Script
1. Sign in as a final-mile courier with an assigned delivery.
2. Open assignment detail.
3. Tap accept-scan route.
4. Confirm the scanner does not start until assignment scope is validated.
5. Grant camera permission.
6. Scan the correct package code.
7. Confirm masked code review appears.
8. Tap `Accept custody`.
9. Confirm duplicate taps are ignored.
10. Confirm success routes to `CourierCustodyAccepted`.
11. Return to the same route after success.
12. Confirm it redirects to the correct post-acceptance route.
13. Repeat with wrong package code.
14. Confirm wrong-package warning blocks submit.
15. Deny camera permission.
16. Confirm settings recovery and manual fallback appear.
17. Complete manual fallback with supervisor override.
18. Confirm fallback evidence is sent.
19. Repeat while offline.
20. Confirm acceptance is queued and not confirmed.
21. Restore network.
22. Confirm sync success moves custody only after server response.
23. Force server `FORBIDDEN`.
24. Confirm UI tells courier not to take custody.
25. Force `INVALID_STATUS_TRANSITION`.
26. Confirm UI routes to refresh or recovery.

## Implementation Notes For Claude Code
Build only from the contracts and decisions in this file.

Required implementation approach:

- Use existing auth, route, query, mutation, outbox, and error primitives where available.
- Keep camera scanner isolated behind a native bridge or existing camera abstraction.
- Keep scanner values out of ordinary app state stores.
- Treat server success as the only confirmed custody authority.
- Preserve route and test IDs exactly.
- Keep copy exact where this spec provides exact copy.
- Prefer existing shared operational components before creating new primitives.
- Do not add public receiver contact, OTP, proof, or route navigation into this screen.
- Do not implement lifecycle actions beyond `accept_final_mile_assignment`.

Expected file areas:

- Final-mile courier route registration.
- Screen component.
- Scanner component or native wrapper.
- RTK Query or existing API hook integration.
- Offline outbox integration.
- Error mapping utility.
- Screen tests.
- Accessibility tests.

Do not invent:

- New backend fields.
- Client-only custody statuses that look server-confirmed.
- Receiver proof controls.
- Direct station operator override without backend support.
- New payment, earnings, or route optimization logic.

## Acceptance Criteria
Functional:

- Valid assigned courier can scan a package and accept custody.
- Wrong courier cannot accept custody.
- Wrong status cannot accept custody.
- Wrong package code is blocked.
- Manual fallback requires supervisor override and reason.
- Offline acceptance remains pending until server sync confirms it.
- Success routes to `CourierCustodyAccepted`.
- Parent courier queue and timeline refresh after success.

UX:

- Courier understands scan purpose immediately.
- Scanner is usable in low light and glare.
- Manual fallback feels controlled, not casual.
- Pending sync state is unambiguous.
- Error recovery tells the courier whether to retry, stay, or contact support.

Security:

- Raw package code is not exposed outside the workflow.
- Sensitive receiver and proof data are not shown.
- Analytics and support payloads are redacted.
- Secure outbox is used for queued mutation payload.

Accessibility:

- Camera alternatives exist.
- Status messages are announced.
- Focus order is logical.
- Touch targets are large.
- Reduced motion is respected.

Testing:

- Render, scanner, mutation, fallback, offline, error, accessibility, and security tests cover this screen.
- Coverage cannot rely on broad snapshot assertions.
- Tests assert route, test ID, mutation body, and privacy exclusions.

## Quality Bar
This screen is ready for build only when:

- The courier cannot confuse local scan capture with server-confirmed custody.
- The package scan requirement is impossible to skip in the normal path.
- The fallback path is slower and more controlled than scanning.
- Every blocked state tells the courier what not to do with the package.
- Offline behavior protects custody truth instead of hiding uncertainty.
- The UI can be used at a noisy station counter with one hand.
- The implementation can be tested without physical scanner hardware by injecting scanner events.
- The screen preserves the project rule that every physical handoff has evidence.


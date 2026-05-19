# Station Package Intake Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationPackageIntake` |
| App | `apps/mobile` |
| Route | `/(ops)/station/intake/:deliveryId` |
| Primary test ID | `screen-station-package-intake` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | `get_delivery`, `confirm_intake`, `confirmIntakeRequestSchema`, `deliveryDetailResponseSchema`, `deliveryLifecycleResponseSchema`, `packageConditionSchema`, `sizeTierSchema`, `AuthPrincipal`, `roleSchema`, `stationIdSchema`, idempotent mutation transport, offline outbox |
| Related routes | `/(ops)/station/intake`, `/(ops)/station/intake/:deliveryId/confirmation`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading_delivery`, `ready`, `camera_permission_pending`, `camera_ready`, `camera_denied`, `scan_detected`, `manual_code_entry`, `supervisor_required`, `validating`, `confirm_before_submit`, `submitting`, `success`, `offline_ready`, `offline_queued`, `offline_blocked`, `duplicate_label`, `already_received`, `payment_caution`, `oversized_blocked`, `overweight_blocked`, `damaged_caution`, `status_blocked`, `scope_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error`, `rate_limited` |

## Product Job
This screen receives a physical package at the origin station, binds the package label scan code to one delivery, records measured package facts, and submits the origin intake transition.

The screen answers one operational question: `Can this station safely accept this physical package and create the first enforceable custody record?`

The station operator should be able to:
- Confirm they are receiving the correct delivery at the correct origin station.
- Review sender-entered package details before measuring.
- Enter measured weight.
- Select measured size tier.
- Record package condition.
- Scan or enter the package label code.
- Understand whether payment is confirmed, pending, or failed before intake.
- Submit `confirm_intake` when all fields and custody rules pass.
- Queue the intake action offline when the delivery snapshot is safe enough and local evidence is complete.
- Recover from permission, station scope, duplicate label, already-received, invalid status, failed network, and rate limit states.
- Route to support or issue creation when the package is damaged, too large, too heavy, or mismatched.
- Continue to intake confirmation after success.

This screen is not:
- The intake queue.
- A generic barcode scanner.
- A package label print screen.
- A driver dispatch screen.
- A payment capture screen.
- A sender delivery edit screen.
- A destination receipt screen.
- A package search screen.
- A place to bypass station scope.
- A place to accept packages outside self-serve size and weight limits without support review.

## Audience
Primary audience:
- Station operators receiving packages from senders.
- Station leads handling exceptions during intake.
- Backup operators assisting peak intake windows.

Secondary audience:
- Claude Code implementing the station intake mutation flow.
- QA validating custody, scan, and offline queue behavior.
- Operations leads validating package acceptance policy.
- Security reviewers validating role and station enforcement.
- Accessibility reviewers validating camera, form, error, and confirmation behavior.

## User State
The station operator selected a delivery from the intake queue or opened a direct intake link. They are physically handling the package and may have the sender waiting at the counter.

The user may be:
- Receiving a package with a printed label ready to scan.
- Writing or attaching a station label and then scanning it.
- Measuring weight on a scale.
- Estimating size tier from station guidance.
- Checking whether payment has succeeded.
- Handling a camera permission problem.
- Entering a label code because scanning failed.
- Working offline with a fresh enough queue snapshot.
- Seeing a duplicate or already-received response.
- Recording damaged condition and needing issue follow-up.

The screen must:
- Require a route `deliveryId`.
- Load delivery detail before enabling submit.
- Require `role = station_operator`.
- Require `AuthPrincipal.stationId`.
- Require `originStationId === AuthPrincipal.stationId`.
- Require `currentStatus = created`.
- Preserve delivery identity while the form is being filled.
- Treat package scan code binding as custody-critical evidence.
- Send only the fields accepted by `confirmIntakeRequestSchema`.
- Move to confirmation only after backend success or offline queue acceptance.

## Backend Contract
Read operation:
- `GET /v1/deliveries/:id`
- Shared contract: `get_delivery`

Mutation operation:
- `POST /v1/deliveries/:id/intake`
- Shared contract: `confirm_intake`

Request body:
```json
{
  "measuredWeightKg": 1.9,
  "sizeTier": "standard",
  "condition": "ok",
  "labelScanCode": "PKG-0001",
  "fallbackUsed": false,
  "supervisorOverrideActorId": "USR-SUP-001"
}
```

Required request fields:
- `measuredWeightKg`: positive number.
- `sizeTier`: one of shared size tiers.
- `condition`: `ok` or `damaged`.
- `labelScanCode`: trimmed string, minimum `4`, maximum `80`.

Optional request fields:
- `fallbackUsed`: boolean.
- `supervisorOverrideActorId`: user ID.

Backend effects:
- Delivery transitions from `created` to `received_at_origin`.
- Package weight and size tier are updated from measured intake values.
- Current custody becomes `station_operator`.
- Current custody actor becomes the intake operator.
- Delivery event type becomes `delivery_received_at_origin`.
- Handoff event type becomes `sender_to_origin_station`.
- Package label scan code is reserved in `package_labels`.
- Later scans must match the immutable package label binding.

Backend authority:
- The backend validates role capability.
- The backend validates station scope.
- The backend validates lifecycle transition.
- The backend validates duplicate label binding.
- The backend returns the lifecycle response used by confirmation.

Frontend responsibility:
- Do not submit obviously invalid values.
- Do not submit outside station scope.
- Do not submit if delivery status is not `created`.
- Do not submit `oversized` or overweight self-serve packages.
- Do not hide payment cautions.
- Do not mark intake complete until backend success or durable offline queue acceptance.

## Product Decisions
### Payment At Intake
Payment does not block physical intake in v1.

Rules:
- `paymentStatus = confirmed`: intake can proceed normally.
- `paymentStatus = pending`: intake can proceed, but dispatch remains blocked until payment is confirmed.
- `paymentStatus = failed`: intake can proceed if the sender is physically at station and the package is accepted into custody, but dispatch remains blocked and the confirmation screen must show payment recovery guidance.
- `paymentStatus = refund_pending`: intake is blocked; route to support.
- `paymentStatus = refunded`: intake is blocked; route to support.

Reason:
- If the package is physically handed to the station, the system should record custody rather than leave the package outside the event model. Transport must still be blocked until payment is confirmed.

### Weight At Intake
Self-serve intake supports packages from `0.1kg` to `20kg`.

Rules:
- Values below `0.1kg` are invalid.
- Values above `20kg` are blocked from self-serve intake.
- Weight above `20kg` routes to support review.
- The UI can collect the measured value for support context, but must not submit `confirm_intake`.

Reason:
- Shared pricing requires support review for weight above `20kg`.

### Size Tier At Intake
Self-serve intake supports `standard` and `bulky`.

Rules:
- `standard`: can submit.
- `bulky`: can submit.
- `oversized`: block self-serve submission and route to support review.

Reason:
- Shared pricing treats oversized as support-quoted, not self-serve in v1.

### Damaged Condition At Intake
Damaged packages can be received, but they require visible follow-up.

Rules:
- `condition = damaged` can submit.
- Confirmation screen must show `Create damage issue` as the recommended next action.
- Dispatch readiness must remain blocked by issue policy when an active issue exists.
- If damage is severe and the station cannot safely store the package, route to support before submit.

Reason:
- Physical custody still needs to be recorded, and condition evidence must be captured early.

### Label Code Binding
The first successful origin intake binds `labelScanCode` to this delivery.

Rules:
- One scan code belongs to one delivery.
- The code cannot be reused for another delivery.
- Local outbox must block reuse of the same code before sync.
- Duplicate backend response must show recovery, not retry loops.
- The code is custody evidence and must remain visible on confirmation.

## Form Fields
### Delivery Identity Block
Required display:
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Receiver name.
- Service type.
- Doorstep requested state.
- Current status.
- Payment status.

Do not display:
- Receiver phone.
- Receiver address.
- Provider payment reference.
- Raw auth claims.

### Measured Weight
Input type:
- Numeric decimal.

Label:
- `Measured weight`

Unit:
- `kg`

Allowed value:
- `0.1` to `20`.

Precision:
- Up to `2` decimal places.

Validation:
- Required.
- Must be a number.
- Must be at least `0.1`.
- Must be at most `20`.

Inline help:
- `Use the station scale. Packages above 20kg need support review.`

Error copy:
- Required: `Enter the measured weight.`
- Not a number: `Weight must be a number in kilograms.`
- Too low: `Weight must be at least 0.1kg.`
- Too high: `Packages above 20kg need support review before intake.`

### Size Tier
Control:
- Segmented choice or radio group.

Options:
- `standard`
- `bulky`
- `oversized`

Labels:
- `Standard`
- `Bulky`
- `Oversized`

Behavior:
- `standard` and `bulky` are valid.
- `oversized` is selectable but blocks submit.

Inline help:
- `Oversized packages need support review before intake.`

Error copy:
- Required: `Select the measured size tier.`
- Oversized: `Oversized packages are not self-serve in v1.`

### Package Condition
Control:
- Two-option radio group.

Options:
- `ok`
- `damaged`

Labels:
- `Looks okay`
- `Damaged`

Behavior:
- `ok` submits normally.
- `damaged` submits with caution and routes to issue follow-up after success.

Inline help:
- `Record visible damage before the package leaves the sender.`

Error copy:
- Required: `Select the package condition.`

### Package Label Code
Primary method:
- Camera scan.

Secondary method:
- External scanner input when available.

Fallback method:
- Manual code entry with supervisor approval.

Label:
- `Package label code`

Validation:
- Required.
- Trim leading and trailing spaces.
- Minimum `4` characters.
- Maximum `80` characters.
- Allow letters, numbers, and common separators.
- Normalize internal spaces only for comparison; submit the trimmed visible value.

Error copy:
- Required: `Scan or enter the package label code.`
- Too short: `Package label code must be at least 4 characters.`
- Too long: `Package label code must be 80 characters or fewer.`
- Duplicate local code: `This label code is already waiting to sync for another delivery.`

### Supervisor Override
Show only when fallback entry is used.

Required when:
- Camera scan fails and the operator types the label code.
- External scanner source is unavailable or not trusted by the app.
- Network failure forces offline queueing with manually entered code.

Fields:
- Supervisor user ID or approved supervisor selection when available.
- Optional supervisor PIN route if implemented by auth system.

Request mapping:
- `fallbackUsed = true`
- `supervisorOverrideActorId = selected supervisor actor ID`

Error copy:
- `Supervisor approval is required for manual label entry.`

## Primary Flow
1. Load delivery detail.
2. Confirm station scope and status.
3. Show delivery identity and payment caution.
4. Operator enters measured weight.
5. Operator selects size tier.
6. Operator selects condition.
7. Operator scans package label code.
8. App validates all fields locally.
9. App shows final confirmation sheet.
10. Operator submits.
11. App calls `confirm_intake` or stores durable offline action.
12. App navigates to `StationIntakeConfirmation`.

## Confirmation Sheet
The confirmation step is required before submit.

Title:
- `Confirm station intake`

Body:
- `This will receive the package at {stationName}, bind label {labelScanCode}, and make this station the current custodian.`

Must show:
- Tracking code.
- Receiver name.
- Measured weight.
- Size tier.
- Condition.
- Payment state.
- Label scan code.
- Fallback indicator when used.

Primary action:
- `Confirm intake`

Secondary action:
- `Review details`

Blocked submit states:
- Missing required field.
- Invalid weight.
- Oversized selected.
- Weight above `20kg`.
- Missing label code.
- Manual entry without supervisor approval.
- Status not `created`.
- Station scope mismatch.
- Refund state.
- Offline action conflict.

## Submit Behavior
Online submit:
- Disable the primary action after press.
- Show deterministic progress copy: `Recording intake...`
- Use idempotent mutation transport.
- Keep form values visible while submitting.
- On success, navigate to confirmation.
- On failure, keep form values and show safe recovery.

Offline submit:
- Allowed only when offline queue rules pass.
- Store durable outbox action.
- Show `offline_queued`.
- Navigate to confirmation with pending-sync treatment.
- Do not claim backend completion until sync succeeds.

Duplicate press protection:
- The same idempotency key must be reused while retrying the same prepared submission.
- A new idempotency key is created only after the operator edits a payload field.

Local payload hash:
- Include `deliveryId`.
- Include `measuredWeightKg`.
- Include `sizeTier`.
- Include `condition`.
- Include `labelScanCode`.
- Include `fallbackUsed`.
- Include `supervisorOverrideActorId`.
- Include actor ID.
- Include station ID.

## Offline Queue Rules
Station package intake is offline-critical, but offline writes are constrained.

Offline action can be queued when:
- Delivery detail was loaded successfully.
- Cached delivery detail belongs to current station.
- Cached `currentStatus = created`.
- Cache age is less than or equal to `15 minutes`.
- All fields pass local validation.
- Label code is not already used in local label registry or outbox.
- No unresolved outbox action exists for the same delivery.
- Manual entry has supervisor approval when needed.

Offline action must be blocked when:
- No delivery detail exists.
- Station scope is missing.
- Status is not `created`.
- Cache age exceeds `15 minutes`.
- Label code is locally duplicated.
- Payment status is `refund_pending` or `refunded`.
- Size tier is `oversized`.
- Weight is above `20kg`.
- Required supervisor approval is missing.

Offline outbox record must include:
- Local action ID.
- Server idempotency key.
- Actor ID.
- Role.
- Station ID.
- Delivery ID.
- Local timestamp.
- Payload hash.
- Full request payload.
- Delivery snapshot status.
- Label scan code.
- Fallback flag.
- Supervisor override actor ID when present.

Offline queued copy:
- Title: `Intake saved for sync`
- Body: `This package is marked as pending sync. Do not dispatch it until sync confirms intake.`
- Actions: `Open outbox`, `Back to intake queue`

Offline conflict copy:
- Title: `Intake needs review`
- Body: `The saved intake no longer matches the server record. Review it before retrying.`
- Action: `Open outbox`

## State Model
`loading_delivery`:
- Delivery detail is loading.
- Show identity skeleton and disabled form controls.

`ready`:
- Delivery is loaded, in scope, status is `created`, and form can be edited.

`camera_permission_pending`:
- Camera permission has not been granted or denied.
- Show why camera access is needed.

`camera_ready`:
- Camera scanner is ready.
- Show scan target and torch control when supported.

`camera_denied`:
- Camera permission denied.
- Offer system settings guidance and supervisor-approved manual path.

`scan_detected`:
- Label code detected.
- Show detected code for review.

`manual_code_entry`:
- Operator is entering the code without scanner confirmation.
- Supervisor approval is required before submit.

`supervisor_required`:
- Manual entry or fallback needs approval.

`validating`:
- Local validation is running.

`confirm_before_submit`:
- Confirmation sheet is open.

`submitting`:
- Online mutation request is in progress.

`success`:
- Backend confirms intake.

`offline_ready`:
- Network is offline but all offline queue requirements are met.

`offline_queued`:
- Durable outbox action was created.

`offline_blocked`:
- Offline action cannot be queued safely.

`duplicate_label`:
- Backend or local store reports label code already bound or queued.

`already_received`:
- Backend reports the package was already received.

`payment_caution`:
- Payment is pending or failed but intake can proceed.

`oversized_blocked`:
- Size tier is `oversized`.

`overweight_blocked`:
- Weight is above `20kg`.

`damaged_caution`:
- Condition is damaged and issue follow-up is recommended.

`status_blocked`:
- Delivery status is not `created`.

`scope_blocked`:
- Delivery is outside the station scope.

`not_found`:
- Delivery does not exist or is not visible.

`not_authorized`:
- Role or capability is denied.

`session_expired`:
- Auth token expired or refresh failed.

`api_error`:
- Backend failed outside known user-action errors.

`rate_limited`:
- Backend rejects too many attempts.

## Error Mapping
`AUTH_REQUIRED`:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

`FORBIDDEN_ROLE`:
- State: `not_authorized`
- Message: `You do not have permission to receive packages at this station.`
- Action: `Back to role home`

`STATION_SCOPE_VIOLATION`:
- State: `scope_blocked`
- Message: `This delivery is outside your station scope.`
- Action: `Back to intake queue`

`DELIVERY_NOT_FOUND`:
- State: `not_found`
- Message: `Delivery record not found. Refresh the queue.`
- Action: `Back to intake queue`

`INVALID_STATUS_TRANSITION`:
- State: `status_blocked`
- Message: `This delivery cannot be received at origin right now.`
- Action: `Open delivery detail`

`PACKAGE_ALREADY_RECEIVED`:
- State: `already_received`
- Message: `This package was already received.`
- Action: `Open custody chain`

`PACKAGE_SCAN_MISMATCH`:
- State: `duplicate_label`
- Message: `This scan code does not match the delivery.`
- Action: `Scan again`

`DUPLICATE_SCAN`:
- State: `duplicate_label`
- Message: `This package scan was already recorded.`
- Action: `Open custody chain`

`CONFLICTING_HANDOFF_STATE`:
- State: `status_blocked`
- Message: `The handoff state conflicts with the current record.`
- Action: `Open custody chain`

`VALIDATION_ERROR`:
- State: `api_error`
- Message: `Some required information is missing or invalid.`
- Action: `Review details`

`UNKNOWN_INTERNAL_ERROR`:
- State: `api_error`
- Message: `Something went wrong on our side. Retry in a moment.`
- Action: `Retry`

Network timeout:
- State: `offline_ready` or `api_error`.
- Message: `Network is slow. Save for sync if the details are complete.`
- Action: `Save for sync`

Rate limit:
- State: `rate_limited`.
- Message: `Too many intake attempts. Wait a moment and retry.`
- Action: `Retry when available`

## Screen Layout
Order:
1. Top app bar with back action.
2. Station scope and delivery identity banner.
3. Payment and status banner.
4. Package measurement section.
5. Condition section.
6. Label scan section.
7. Fallback and supervisor approval section when needed.
8. Submit readiness summary.
9. Sticky bottom action area.

### Top App Bar
Title:
- `Package intake`

Back action:
- Returns to `StationIntakeQueue`.

Overflow actions:
- `Open delivery detail`
- `Open custody chain`
- `Report issue`

### Identity Banner
Required content:
- Tracking code.
- Receiver name.
- Route: `{originStationId} to {destinationStationId}`.
- Service type.
- Doorstep requested label.
- Current status.

Status copy:
- `Ready for origin intake` when valid.
- `Already received` when status is `received_at_origin`.
- `Cannot receive now` when any other status blocks intake.

### Payment Banner
Confirmed:
- Title: `Payment confirmed`
- Body: `This package can be received and later dispatched when assigned.`

Pending:
- Title: `Payment pending`
- Body: `You can receive the package, but dispatch stays blocked until payment is confirmed.`

Failed:
- Title: `Payment failed`
- Body: `You can record station custody if the package is handed over. Dispatch stays blocked.`

Refund pending or refunded:
- Title: `Payment under review`
- Body: `Do not receive this package through self-serve intake. Contact support.`

### Measurement Section
Title:
- `Measure package`

Fields:
- Measured weight.
- Size tier.

Support link:
- `Package needs support review`

### Condition Section
Title:
- `Package condition`

Options:
- `Looks okay`
- `Damaged`

Damaged support text:
- `Receive the package only if the station can store it safely. Create an issue after confirmation.`

### Label Scan Section
Title:
- `Bind package label`

Primary scanner action:
- `Scan package label`

Detected code state:
- `Detected {labelScanCode}`

Manual entry action:
- `Enter code with supervisor approval`

Camera denied action:
- `Open camera settings`

Help text:
- `This code will be locked to this delivery after intake.`

### Submit Readiness Summary
Show before submit:
- Station scope.
- Delivery status.
- Weight.
- Size tier.
- Condition.
- Label code.
- Payment state.
- Fallback state.
- Offline sync state.

Ready copy:
- `Ready to confirm intake`

Blocked copy:
- `Resolve the highlighted items before intake.`

## Components
`StationPackageIntakeScreen`:
- Route-level screen.
- Test ID: `screen-station-package-intake`

`IntakeDeliveryHeader`:
- Delivery identity and station scope.
- Test ID: `station-package-intake-header`

`IntakePaymentBanner`:
- Payment state and dispatch implication.
- Test ID: `station-package-intake-payment-banner`

`MeasuredWeightField`:
- Numeric kg field.
- Test ID: `station-package-intake-weight`

`SizeTierSelector`:
- `standard`, `bulky`, `oversized` choices.
- Test ID: `station-package-intake-size-tier`

`ConditionSelector`:
- `ok`, `damaged`.
- Test ID: `station-package-intake-condition`

`PackageLabelScanner`:
- Camera scanner area.
- Test ID: `station-package-intake-label-scanner`

`PackageLabelCodeField`:
- Fallback code entry.
- Test ID: `station-package-intake-label-code`

`SupervisorApprovalPanel`:
- Supervisor approval for fallback.
- Test ID: `station-package-intake-supervisor`

`IntakeReadinessSummary`:
- Submit readiness list.
- Test ID: `station-package-intake-readiness`

`ConfirmIntakeSheet`:
- Final confirmation step.
- Test ID: `station-package-intake-confirm-sheet`

`IntakeSubmitBar`:
- Sticky action area.
- Test ID: `station-package-intake-submit-bar`

`IntakeErrorState`:
- Full-screen or inline blocked state.
- Test ID: `station-package-intake-error`

## Copy System
Voice:
- Direct.
- Operational.
- Calm.
- Evidence-focused.

Preferred words:
- `Receive`
- `Bind`
- `Confirm`
- `Measure`
- `Review`
- `Resolve`
- `Save for sync`

Avoid:
- Vague completion copy.
- Blame language.
- Finance jargon.
- Scan success language before confirmation.
- Promising dispatch when payment is not confirmed.

Primary action labels:
- Online ready: `Confirm intake`
- Offline ready: `Save intake for sync`
- Blocked: `Resolve required fields`
- Submitting: `Recording intake...`
- Success: `Intake recorded`

Secondary action labels:
- `Scan again`
- `Enter code with supervisor`
- `Open outbox`
- `Open delivery detail`
- `Report issue`
- `Back to queue`

## Camera And Scanner Requirements
Camera scanner:
- Ask for camera permission only when the operator starts scanning.
- Explain camera need before system permission prompt.
- Provide torch control when device supports it.
- Show scan region with clear label.
- Do not require continuous network for local scan detection.
- Keep scanner paused after code detection until operator accepts or scans again.

Scanner detection:
- Accept one detected code at a time.
- Trim detected code.
- Show detected code before confirmation.
- Do not submit immediately after scan.
- Allow `Scan again`.

External scanner:
- If hardware scanner enters text into the code field and the app can identify trusted scanner input, fallback may remain false.
- If the app cannot identify trusted scanner input, treat it as fallback entry and require supervisor approval.

Manual entry:
- Must be visible as a fallback path, not hidden.
- Must require supervisor approval.
- Must set `fallbackUsed=true`.
- Must include `supervisorOverrideActorId`.

Camera denied:
- Provide settings guidance.
- Provide supervisor fallback path.
- Do not block the whole screen if fields can still be reviewed.

## Validation Rules
Submit is enabled only when:
- Delivery detail is loaded.
- User is station operator.
- Station scope matches delivery origin.
- Delivery status is `created`.
- Payment status is not `refund_pending` or `refunded`.
- Weight is between `0.1` and `20`.
- Size tier is `standard` or `bulky`.
- Condition is selected.
- Label scan code length is `4` to `80`.
- Label scan code is not duplicated locally.
- Supervisor approval exists when fallback is used.
- No unresolved outbox conflict exists for this delivery.

Validation order:
1. Auth and station scope.
2. Delivery status.
3. Payment hard block.
4. Weight.
5. Size tier.
6. Condition.
7. Label code.
8. Fallback approval.
9. Local outbox conflicts.

Field validation timing:
- Required errors appear after blur or submit attempt.
- Blocking business errors appear immediately when value is selected.
- Submit readiness updates as fields change.
- Errors remain near the field they belong to.

## Success Routing
Backend success:
- Navigate to `/(ops)/station/intake/:deliveryId/confirmation`.
- Pass lifecycle response snapshot.
- Pass `syncState = confirmed`.

Offline queue success:
- Navigate to `/(ops)/station/intake/:deliveryId/confirmation`.
- Pass local outbox action ID.
- Pass `syncState = pending`.

Damaged package success:
- Confirmation screen shows `Create damage issue`.

Payment pending or failed success:
- Confirmation screen shows `Dispatch blocked until payment is confirmed`.

Overweight or oversized block:
- Stay on screen.
- Show support review action.

Duplicate label:
- Stay on screen.
- Show conflict recovery.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Station scope.
3. Delivery identity.
4. Payment banner.
5. Weight field.
6. Size tier selector.
7. Condition selector.
8. Label scanner.
9. Supervisor approval if visible.
10. Readiness summary.
11. Submit action.

Field accessibility:
- Weight field must expose label, unit, current value, and error.
- Size tier selector must expose selected option and blocked oversized meaning.
- Condition selector must expose selected option and damaged caution.
- Label scanner must expose camera state and detected code.
- Manual code entry must expose supervisor requirement.

Status messages:
- Announce scan detected.
- Announce validation errors on submit.
- Announce offline queued state.
- Announce backend success.
- Announce row-status change when backend says already received.

Touch targets:
- Scanner action, tier options, condition options, and bottom submit must meet mobile target size.
- No critical action should depend on small icon-only controls.

Focus:
- Initial focus lands on screen title.
- When scanner detects code, focus moves to detected-code review.
- When confirmation sheet opens, focus moves to its title.
- On field error, focus moves to first invalid field.
- On success, focus moves to confirmation screen title.

Reduced motion:
- Scanner frame can remain static.
- Confirmation sheet should use native reduced-motion behavior.
- No pulsing scan animation when reduced motion is enabled.

## Security And Privacy
Allowed visible data:
- Tracking code.
- Delivery ID.
- Receiver name.
- Origin and destination stations.
- Package description when available from detail.
- Payment status only as high-level state.

Hidden data:
- Receiver phone.
- Full receiver address.
- Payment provider reference.
- Internal provider payload.
- Raw auth token or claims.
- Stack traces.

Audit:
- Every submit uses authenticated actor ID.
- Every fallback submit includes supervisor actor ID.
- Every offline action records local timestamp and payload hash.
- Every scanner conflict logs delivery ID and station ID, not receiver contact data.

Station scope:
- If station scope is missing or mismatched, no form values render beyond safe error copy.
- Do not allow a station switcher from this screen.

## Performance Requirements
Initial load:
- Render route shell immediately.
- Fetch delivery detail.
- Use queue row snapshot for temporary identity only if available.
- Replace snapshot with delivery detail before enabling submit.

Scanner:
- Camera starts only when requested.
- Release camera when leaving screen or after accepted scan.
- Pause scanner when confirmation sheet is open.
- Do not keep camera active during background app state.

Form:
- Validation should be synchronous for local fields.
- Avoid recalculating heavy selectors on every keystroke.
- Keep sticky submit bar stable to avoid layout jumps.

Offline:
- Writing outbox action must complete quickly and show durable result.
- If outbox write fails, keep form values visible.

## Low-Bandwidth Behavior
The screen must work with weak network.

Rules:
- Use cached delivery detail if it is recent enough.
- Show cache age.
- Allow field preparation offline.
- Allow offline queue only when snapshot age is within limit.
- Do not require image or map assets.
- Retry backend submit with idempotency when network returns.
- Preserve form values after network failure.

No-cache offline:
- Title: `Connect to load delivery`
- Body: `This intake needs the delivery record before the station can receive the package.`
- Actions: `Retry`, `Back to queue`

Stale-cache offline:
- Title: `Saved record is too old`
- Body: `Reconnect before receiving this package.`
- Actions: `Retry`, `Back to queue`

## Empty And Blocked States
### Delivery Not Found
Title:
- `Delivery not found`

Body:
- `This delivery is not visible to your station or no longer exists.`

Actions:
- `Back to intake queue`
- `Open support`

### Status Blocked
Title:
- `Cannot receive this package`

Body:
- `This delivery is no longer waiting for origin intake.`

Actions:
- `Open delivery detail`
- `Back to queue`

### Station Scope Blocked
Title:
- `Outside station scope`

Body:
- `Only the origin station can receive this package.`

Actions:
- `Back to queue`
- `Open support`

### Oversized Blocked
Title:
- `Support review required`

Body:
- `Oversized packages are not self-serve in v1.`

Actions:
- `Open support`
- `Back to queue`

### Overweight Blocked
Title:
- `Support review required`

Body:
- `Packages above 20kg need support review before intake.`

Actions:
- `Open support`
- `Back to queue`

### Duplicate Label
Title:
- `Label code already used`

Body:
- `This package label is already bound or waiting to sync for another delivery.`

Actions:
- `Scan again`
- `Open custody chain`
- `Open support`

### Already Received
Title:
- `Package already received`

Body:
- `The server record says origin intake is already complete.`

Actions:
- `Open custody chain`
- `Open delivery detail`
- `Back to queue`

## QA Acceptance Criteria
Route and load:
- Route `/(ops)/station/intake/:deliveryId` renders `screen-station-package-intake`.
- Missing route `deliveryId` shows safe error and no submit.
- Delivery detail loads before submit is enabled.

Station scope:
- Matching origin station allows form editing.
- Destination-only station blocks the form.
- Missing station ID blocks the form.
- Non-station role blocks the form.

Status:
- `created` allows form editing.
- `received_at_origin` shows already received state.
- Any later status blocks submit.
- `cancelled` blocks submit.

Payment:
- `confirmed` shows normal intake copy.
- `pending` allows intake with dispatch-blocked caution.
- `failed` allows intake with dispatch-blocked caution.
- `refund_pending` blocks intake.
- `refunded` blocks intake.

Weight:
- Empty weight disables submit.
- Non-number weight shows error.
- `0.09` blocks submit.
- `0.1` allows next validation step.
- `20` allows next validation step.
- `20.01` blocks submit and routes support.

Size tier:
- Empty size disables submit.
- `standard` allows next validation step.
- `bulky` allows next validation step.
- `oversized` blocks submit and routes support.

Condition:
- Empty condition disables submit.
- `ok` allows submit when other fields pass.
- `damaged` allows submit and marks issue follow-up.

Label code:
- Empty code disables submit.
- Code shorter than `4` blocks submit.
- Code longer than `80` blocks submit.
- Duplicate local code blocks submit.
- Scanned code does not submit automatically.

Fallback:
- Camera-denied path allows supervisor-approved code entry.
- Manual code entry without supervisor blocks submit.
- Manual code entry with supervisor sends `fallbackUsed=true`.
- Supervisor actor ID is included when fallback is used.

Online submit:
- Valid form calls `POST /v1/deliveries/:id/intake`.
- Submit button is disabled during request.
- Success navigates to confirmation.
- Failure keeps form values.

Offline submit:
- Fresh cached status can queue action.
- Stale cached status blocks offline action.
- Local duplicate label blocks offline action.
- Outbox write success navigates to confirmation with pending sync.

Errors:
- `PACKAGE_ALREADY_RECEIVED` shows already received recovery.
- `DUPLICATE_SCAN` shows duplicate label recovery.
- `PACKAGE_SCAN_MISMATCH` shows scan mismatch recovery.
- `INVALID_STATUS_TRANSITION` blocks submit.
- `STATION_SCOPE_VIOLATION` blocks submit.
- `AUTH_REQUIRED` routes to sign-in recovery.

Accessibility:
- Submit errors focus first invalid field.
- Scan detected is announced.
- Offline queued state is announced.
- Large text keeps tracking code, weight, size, condition, and submit visible.
- Payment caution is not color-only.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/package-intake`

Recommended hook:
- `useStationPackageIntakeScreen`

Recommended selectors:
- `selectCanEditIntake`
- `selectPaymentIntakePolicy`
- `selectMeasuredPackageValidity`
- `selectLabelCodeValidity`
- `selectFallbackRequirement`
- `selectOfflineIntakeEligibility`
- `selectSubmitReadiness`

Recommended mutation helper:
- `confirmStationIntake`

Recommended local records:
- `station_intake_draft`
- `station_intake_outbox_action`
- `local_package_label_registry`

Draft storage:
- Store unsent local form draft encrypted when platform supports it.
- Scope draft by user ID, station ID, and delivery ID.
- Clear draft after backend success.
- Keep draft after failed submit.
- Ask before discarding draft when leaving with changes.

## Implementation Guardrails
Must use shared contracts:
- `confirmIntakeRequestSchema`
- `deliveryDetailResponseSchema`
- `deliveryLifecycleResponseSchema`
- `packageConditionSchema`
- `sizeTierSchema`

Must use shared domain rules:
- Intake transition is `created -> received_at_origin`.
- Origin intake creates `delivery_received_at_origin`.
- Origin intake creates `sender_to_origin_station`.
- Package label is immutable after successful binding.
- Dispatch is not custody transfer.
- Driver pickup is later custody transfer.

Must enforce UI policy:
- Payment pending and failed allow intake but block dispatch later.
- Refund states block intake.
- Oversized blocks self-serve intake.
- Weight above `20kg` blocks self-serve intake.
- Damaged condition allows intake but requires follow-up issue guidance.
- Manual label entry requires supervisor approval.

Must not:
- Call dispatch or assignment endpoints.
- Print label before successful intake confirmation.
- Hide duplicate label conflicts.
- Submit without final confirmation.
- Clear field values after retryable failure.
- Open camera before operator intent.
- Treat offline queue as backend completion.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [ML Kit barcode scanning](https://developers.google.com/ml-kit/vision/barcode-scanning): supports local barcode detection, explicit scan review, and no automatic state mutation on detection.
- [Android camera permission guidance](https://developer.android.com/training/permissions/requesting): supports asking for camera access at the moment of need with clear explanation.
- [Material Design text fields](https://m1.material.io/components/text-fields.html): supports clear labels, helper text, and inline validation for measurement fields.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports identifying invalid fields and explaining recovery.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing scan, validation, submit, and offline queue updates.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports generous mobile controls for camera, tier, condition, and submit actions.

Design translation:
- Scanner detection is evidence capture, not submit.
- Measurement fields must be explicit and recoverable.
- Permission and fallback paths must not trap the operator.
- Errors belong near the relevant field and in the readiness summary.
- Status updates should be announced without moving focus unless action is required.
- Critical actions need large touch targets because the operator is working with one hand and a physical package.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/intake/:deliveryId`.
- The top-level test ID is `screen-station-package-intake`.
- The screen loads delivery detail before submit.
- The screen blocks non-origin-station deliveries.
- The screen blocks non-`created` statuses.
- Payment pending and failed do not block intake.
- Refund states block intake.
- Weight above `20kg` blocks self-serve intake.
- Oversized blocks self-serve intake.
- Damaged condition submits but routes issue follow-up.
- Manual label entry requires supervisor approval.
- Scanner detection does not submit automatically.
- The final confirmation step is required.
- Offline queue requires a fresh enough snapshot.
- Duplicate local label code is blocked.
- Backend success routes to intake confirmation.
- Offline queue success routes to intake confirmation with pending-sync state.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- `confirm_intake` is called only with a valid payload.
- Offline queue path creates durable outbox actions.
- Idempotency protects retry.
- Label scan code is never silently reused.
- Station scope and role checks block unsafe access.
- Payment cautions are visible and specific.
- Oversized and overweight packages route to support review.
- Damaged package follow-up is visible after intake.
- Screen reader and large-text flows are usable.
- E2E test covers online intake success.
- E2E test covers camera-denied fallback with supervisor approval.
- E2E test covers offline queued intake.
- E2E test covers duplicate label recovery.

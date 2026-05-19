# Package Label Print Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PackageLabelPrint` |
| App | `apps/mobile` |
| Route | `/(ops)/station/packages/:deliveryId/label/print` |
| Primary test ID | `screen-package-label-print` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | package label from completed origin intake, local intake receipt snapshot, `get_delivery`, `get_delivery_timeline`, package label registry evidence, local print job state |
| Related routes | `/(ops)/station/intake/:deliveryId/confirmation`, `/(ops)/station/packages/:deliveryId/label/reprint`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/outbound`, `/(ops)/offline-outbox`, `/(ops)/station/support` |
| Required states | `loading`, `print_ready`, `preview_ready`, `printer_selecting`, `printing`, `print_success`, `print_failed`, `label_missing`, `intake_not_confirmed`, `offline_read_only`, `reprint_required`, `scope_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen prints the first physical package label after confirmed origin intake. It turns the immutable package label code into a readable, scannable label that station, driver, destination, and final-mile staff can use for later handoffs.

The screen answers one operational question: `Can this station print the correct first package label for the package that was just received?`

The station operator should be able to:
- Confirm the package label belongs to the selected delivery.
- Preview the label before printing.
- Select or use the configured station printer.
- Print exactly the first package label for confirmed intake.
- Retry a failed print without changing package identity.
- Route later label print attempts to the audited reprint flow.
- Open delivery detail or custody chain for verification.
- Recover when the label code is missing, intake is not confirmed, printer is unavailable, or station scope is wrong.

This screen is not:
- A package intake screen.
- A package label reprint screen.
- A package label editor.
- A barcode generator detached from delivery state.
- A station dispatch screen.
- A custody mutation screen.
- A payment screen.
- A screen for printing receiver address labels.

## Audience
Primary audience:
- Station operators printing the first label immediately after origin intake.
- Station leads checking that label print is available only after confirmed intake.

Secondary audience:
- Claude Code implementing the print workflow.
- QA validating print readiness and reprint boundaries.
- Operations leads validating physical label content.
- Security reviewers validating privacy and package-label integrity.
- Accessibility reviewers validating preview, printer selection, status, and retry states.

## User State
The station operator is likely coming from `StationIntakeConfirmation` after successful backend-confirmed intake. The package is physically at the station and must receive a durable label before it can safely move through outbound work.

The user may be:
- Printing a label immediately after intake.
- Checking a preview before printing.
- Pairing with a Bluetooth or network label printer.
- Retrying after printer failure.
- Working with weak network but a locally available receipt snapshot.
- Opening the screen later from delivery detail.
- Attempting a second print that must move to the reprint flow.

The screen must:
- Require confirmed intake before print.
- Require a known package label code.
- Require station scope.
- Preserve the label code exactly as bound at intake.
- Show a preview before print.
- Never edit, regenerate, or rebind package label code.
- Treat any second print as reprint flow.
- Keep receiver phone and address off the label.

## Print Authority
First print is allowed when:
- Delivery status is exactly `received_at_origin`.
- Current user is a station operator in the origin station scope.
- Package label code is available from the local intake receipt or verified lifecycle evidence.
- No local or backend evidence says first print already happened.
- Print job is not already in progress.

First print is blocked when:
- Intake is offline pending.
- Delivery status is still `created`.
- Delivery status has advanced beyond `received_at_origin`.
- Delivery is outside station scope.
- Label code is missing.
- A local first-print record already exists.
- The package has an unresolved label conflict.
- User lacks station role.

Reprint boundary:
- If a label has already been printed locally on this device or station profile, route to `PackageLabelReprint`.
- If the operator says the first label was lost, route to `PackageLabelReprint`.
- If print result is unknown after printer failure, show recovery that asks operator to confirm whether a label physically printed before retrying.

## Data Sources
Primary source:
- Local intake receipt snapshot from `StationIntakeConfirmation`.

Fallback source:
- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`
- Local package label evidence cache.

Required label data:
- `labelScanCode`
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `receiverName`
- `createdAt` or intake `occurredAt`
- `sizeTier` when available
- `measuredWeightKg` when available
- `condition` when available
- `doorstepRequested` when available

Missing data behavior:
- Missing label code blocks print.
- Missing receiver name still allows print if tracking code and label code exist.
- Missing weight, size, or condition removes that optional row from the label preview.
- Missing station scope blocks print.

Do not fetch:
- Receiver phone.
- Full receiver address.
- Payment provider reference.
- Raw package label registry internals beyond evidence needed for display.

## Label Content
Default label size:
- `100mm x 75mm`

Resolution target:
- `203dpi` thermal printer or better.

Label content:
- Kra wordmark or text brand.
- Large human-readable package label code.
- Machine-scannable code for `labelScanCode`.
- Tracking code.
- Delivery ID in small text.
- Origin station.
- Destination station.
- Receiver name.
- Service type.
- Doorstep requested indicator.
- Intake date and time.
- Weight and size when available.
- Condition indicator when damaged.

Label content must not include:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment status.
- Provider reference.
- Staff user ID.
- Internal event payload.
- Notes from support or issue threads.

Scannable code:
- Encodes `labelScanCode` only.
- Human-readable text must match encoded value.
- Error correction should be sufficient for scuffed labels where the selected code format supports it.
- Use high-contrast black on white.
- Maintain quiet zone around the code.

Human-readable hierarchy:
1. Package label code.
2. Destination station.
3. Tracking code.
4. Receiver name.
5. Service and handling details.

## Primary Action Logic
Primary action by state:
- `print_ready`: `Print label`
- `preview_ready`: `Print label`
- `printer_selecting`: `Use selected printer`
- `printing`: wait.
- `print_success`: `Back to intake queue`
- `print_failed`: `Retry print`
- `label_missing`: `Open custody chain`
- `intake_not_confirmed`: `Back to confirmation`
- `offline_read_only`: `Back to confirmation`
- `reprint_required`: `Open reprint request`
- `scope_blocked`: `Back to role home`
- `not_found`: `Back to intake queue`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Secondary actions:
- `Open delivery detail`
- `Open custody chain`
- `Open support`
- `Back to confirmation`
- `Open reprint request`

Blocked behavior:
- Do not print without preview.
- Do not print without package label code.
- Do not print when intake is only pending sync.
- Do not print if current user is outside origin station scope.
- Do not print if first print has already succeeded.
- Do not mutate delivery state.
- Do not generate a new label code.

## Screen Structure
Order:
1. Print readiness banner.
2. Delivery and station identity.
3. Label preview.
4. Printer selection.
5. Print status.
6. Recovery actions.
7. Audit and safety details.

### Print Readiness Banner
Ready:
- Title: `Label ready to print`
- Body: `This package label is bound to {trackingCode}.`

Offline read-only:
- Title: `Printing blocked while intake syncs`
- Body: `Wait for backend confirmation before printing the first label.`

Missing label:
- Title: `Label code unavailable`
- Body: `Open custody chain or support to verify the package label before printing.`

Reprint required:
- Title: `Use reprint flow`
- Body: `A first print already exists for this station session. Reprints need a reason.`

### Delivery Identity
Show:
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Receiver name.
- Current status.

Do not show:
- Receiver phone.
- Receiver address.
- Payment provider reference.
- Staff ID.

### Label Preview
Preview must:
- Match the printable layout.
- Show exact scannable code value.
- Show human-readable label code.
- Show route and receiver details.
- Show handling facts.
- Fit the label aspect ratio.
- Include a zoom or full-screen preview option if the default viewport is too small.

Preview must not:
- Use decorative graphics that reduce scan reliability.
- Use low-contrast text.
- Hide the label code in small text.
- Show any data not printed.

### Printer Selection
Printer states:
- `No printer selected`
- `Station printer selected`
- `Bluetooth printer unavailable`
- `System print sheet open`
- `Printer busy`
- `Printer error`

Rules:
- Prefer the station-configured printer when available.
- Allow system print sheet where platform supports it.
- Do not require internet if local printer is available.
- Remember selected station printer only for this authenticated station context.
- If no printer exists, show instructions and route support.

### Print Status
Printing:
- Title: `Printing label`
- Body: `Do not leave this screen until the printer finishes or fails.`

Success:
- Title: `Label printed`
- Body: `Attach the label before moving the package to outbound work.`

Failed:
- Title: `Label did not print`
- Body: `Check the printer, then retry or ask for support.`

Unknown result:
- Title: `Did a label print?`
- Body: `If a usable label came out, do not print again here. Use reprint if another label is needed.`
- Actions: `A label printed`, `No label printed`

## First Print Versus Reprint Decision
First print flow:
- Entered from intake confirmation.
- No local print success record exists.
- Label is backend-confirmed.
- Operator prints once.
- Local first-print success record is stored.

Reprint flow:
- Local first-print success record exists.
- Print result is unknown and operator says a usable label printed.
- Operator explicitly requests another label.
- Label damaged after first print.
- Printer produced partial label that is not usable and local policy requires audit reason.

Local first-print record fields:
- `deliveryId`
- `labelScanCode`
- `stationId`
- `printedAt`
- `printedByActorId`
- `printerId` when available
- `printJobId` when available
- `result`

Print result values:
- `success`
- `failed`
- `unknown`

## Offline Rules
This screen is not offline-critical for mutation.

Offline allowed:
- View label preview when local receipt exists.
- View previous print status.
- Open delivery detail from cache if available.
- Open support instructions.

Offline blocked:
- First print when intake is not backend-confirmed.
- Printer setup that requires network.
- Any reprint audit flow requiring backend support.

Offline copy:
- Title: `Printing needs confirmed intake`
- Body: `You can review the label, but first print is only available after backend confirmation.`

If backend-confirmed receipt exists locally and local printer is available:
- The app may allow print while offline only if the receipt includes event ID, label code, and status `received_at_origin`.
- The printed label must still be marked with local print record.
- If local print record cannot be saved, block print.

## Error Mapping
Missing label code:
- State: `label_missing`
- Message: `Package label code is unavailable.`
- Action: `Open custody chain`

Intake pending sync:
- State: `intake_not_confirmed`
- Message: `Wait for intake sync before printing.`
- Action: `Back to confirmation`

Already printed:
- State: `reprint_required`
- Message: `Use the reprint flow for another label.`
- Action: `Open reprint request`

Printer unavailable:
- State: `print_failed`
- Message: `Printer is unavailable. Check power, paper, and connection.`
- Action: `Retry print`

Printer out of paper:
- State: `print_failed`
- Message: `Printer needs label paper. Reload and retry.`
- Action: `Retry print`

System print canceled:
- State: `preview_ready`
- Message: `Printing was canceled.`
- Action: `Print label`

Auth required:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to print this package label.`
- Action: `Back to role home`

Station scope violation:
- State: `scope_blocked`
- Message: `This package is outside your station scope.`
- Action: `Back to role home`

Delivery not found:
- State: `not_found`
- Message: `Delivery record not found.`
- Action: `Back to intake queue`

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Readiness banner.
3. Delivery identity.
4. Label code.
5. Preview description.
6. Printer selector.
7. Print action.
8. Recovery actions.
9. Audit details.

Required labels:
- Scannable code preview must expose the encoded text.
- Print button must include package label code in accessibility hint.
- Printer selector must expose selected printer and error state.
- Print success and failure must be announced as status messages.

Touch targets:
- Print action must be large and bottom reachable.
- Printer selector must be easy to tap.
- Recovery actions must not be icon-only.

Focus:
- Initial focus lands on screen title.
- After printer selection, focus returns to print button.
- On print failure, focus moves to error title.
- On print success, focus moves to success title.

Reduced motion:
- No animated print success burst.
- Use status text and stable layout.

## Security And Privacy
Allowed on printed label:
- Label scan code.
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Receiver name.
- Service type.
- Doorstep indicator.
- Weight, size, and damaged condition when available.

Not allowed on printed label:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment status.
- Provider reference.
- Staff user ID.
- Internal event ID.
- Support notes.

Allowed on screen only:
- Event ID.
- Print job ID.
- Printer ID.

Analytics exclusions:
- Do not send label scan code.
- Do not send receiver name.
- Do not send print preview content.

## Analytics
Events:
- `package_label_print_viewed`
- `package_label_print_preview_ready`
- `package_label_print_started`
- `package_label_print_succeeded`
- `package_label_print_failed`
- `package_label_print_unknown_result`
- `package_label_print_reprint_required`
- `package_label_print_support_opened`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `status`
- `hasLocalReceipt`
- `hasLabelCode`
- `printerType`
- `printResult`
- `sourceRoute`

Disallowed payload fields:
- `labelScanCode`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `paymentProviderReference`

## Visual System Direction
This screen should feel like an operations print console, not a graphic design surface.

Visual thesis:
- Precise print preview, clear readiness state, one dominant print action.

Layout:
- Single column.
- Top readiness banner.
- Label preview centered.
- Printer and status below preview.
- Sticky print action.

Preview:
- Use real label aspect ratio.
- White label on neutral background.
- Strong border around printable edge.
- High contrast text and code.

Color:
- Ready: controlled green or blue.
- Blocked: amber.
- Failed: red/rust.
- Neutral print preview: black and white.

Typography:
- Codes use tabular or monospaced numerals when possible.
- Destination station is large.
- Secondary facts are compact.

Motion:
- Printing state uses native progress.
- No decorative animation.
- Respect reduced motion.

## Print Layout Specification
Default physical label:
- Width: `100mm`
- Height: `75mm`
- Orientation: landscape.
- Margin: `4mm`.

Top band:
- Kra brand text.
- Package label code.

Main area:
- Scannable code on left.
- Destination station and tracking code on right.

Details area:
- Origin station.
- Receiver name.
- Service type.
- Doorstep indicator.
- Weight and size.
- Condition.
- Intake date.

Footer:
- Human-readable delivery ID.
- Short instruction: `Scan before handoff`.

Minimum code size:
- Scannable code must remain large enough for low-cost Android camera scanning.

Print quality:
- Black on white.
- No low-contrast gray for critical text.
- No background image.
- No decorative pattern near code.

## QA Acceptance Criteria
Readiness:
- Backend-confirmed intake with label code shows print-ready state.
- Offline-pending intake blocks print.
- Missing label code blocks print.
- Already printed local record routes to reprint.
- Wrong station scope blocks print.

Preview:
- Preview includes label code, tracking code, origin, destination, receiver name, and service details.
- Preview excludes receiver phone and address.
- Preview excludes payment details.
- Scannable code value matches human-readable label code.

Printer:
- No selected printer shows printer selection state.
- Selected printer enables print action.
- Printer failure shows retry.
- Unknown print result asks whether label physically printed.
- Successful print stores local first-print record.

Reprint boundary:
- Second print attempt after success routes to `PackageLabelReprint`.
- Unknown result with usable label routes future attempts to reprint.
- Unknown result with no usable label allows retry.

Offline:
- Offline with confirmed local receipt and local print record storage can print.
- Offline without confirmed receipt blocks print.
- Offline without local print record storage blocks print.

Accessibility:
- Label code is announced.
- Print started is announced.
- Print success is announced.
- Print failure is announced.
- Large text keeps print action usable.
- Color is not the only readiness cue.

Privacy:
- Receiver phone is never printed.
- Receiver address is never printed.
- Payment status is never printed.
- Provider references are never printed.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/package-label-print`

Recommended state holder:
- `usePackageLabelPrintScreen`

Recommended selectors:
- `selectLabelPrintReadiness`
- `selectLabelPreviewData`
- `selectPrinterState`
- `selectFirstPrintBoundary`
- `selectPrintPrimaryAction`

Recommended local records:
- `package_label_first_print_record`
- `station_printer_selection`
- `package_label_print_job`

Print implementation:
- Use platform print APIs where available.
- Use configured station printer integration when available.
- Keep printable layout deterministic.
- Store print result locally.
- Do not write to delivery state.

## Implementation Guardrails
Must use:
- Confirmed intake receipt.
- Delivery detail when receipt is missing.
- Timeline or custody evidence for recovery.
- Local first-print record.

Must show:
- Print readiness.
- Label preview.
- Printer state.
- First-print versus reprint boundary.
- Privacy-safe label content.

Must not:
- Generate a new package label code.
- Rebind a package label.
- Print while intake is only pending sync unless confirmed receipt exists locally.
- Print a second first label after local success.
- Include phone, address, payment, provider, or staff IDs on the label.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports using stable, high-contrast, scannable identifiers with human-readable text.
- [Android custom document printing](https://developer.android.com/training/printing/custom-docs): supports using platform print flow for controlled printable output.
- [Android print photos and documents](https://developer.android.com/training/printing): supports printer selection, print jobs, and system print behavior.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing print started, success, failure, and blocked states.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large print, retry, and printer controls.

Design translation:
- The label is operational infrastructure, not decoration.
- Preview must match print output.
- Human-readable code must match scannable code.
- Printing status must be explicit and accessible.
- Unknown print outcome needs a decision gate before another print.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/packages/:deliveryId/label/print`.
- The top-level test ID is `screen-package-label-print`.
- Print is blocked until intake is backend-confirmed or a confirmed local receipt exists.
- Label code comes from intake evidence, not a regenerated value.
- Preview excludes phone, address, payment, and provider data.
- Print success stores local first-print record.
- Second print routes to reprint flow.
- Printer failure preserves preview and retry state.
- Unknown print result asks whether a usable label printed.
- Screen reader status messages cover print start, success, and failure.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Print-ready state requires confirmed intake and label code.
- Preview matches printable content.
- First print succeeds with local print record.
- Reprint boundary is enforced.
- Printer errors are recoverable.
- Offline behavior is conservative.
- Sensitive data is excluded from screen analytics and printed output.
- E2E tests cover print-ready, missing-label, offline-pending, print failure, unknown result, and reprint-required paths.

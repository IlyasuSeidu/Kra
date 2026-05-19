# Package Label Reprint Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PackageLabelReprint` |
| App | `apps/mobile` |
| Route | `/(ops)/station/packages/:deliveryId/label/reprint` |
| Primary test ID | `screen-package-label-reprint` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Operational Completeness` |
| Backend dependency | `get_delivery`, `get_delivery_timeline`, `list_issues`, `create_issue`, package label registry evidence, local first-print record, approval-backed label reprint mutation before physical reprint |
| Related routes | `/(ops)/station/packages/:deliveryId/label/print`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/station/support`, `/(ops)/station/outbound`, `/(ops)/offline-outbox` |
| Required states | `loading`, `request_ready`, `reason_entry`, `request_submitting`, `request_submitted`, `approval_pending`, `approved_to_print`, `preview_ready`, `printer_selecting`, `printing`, `print_success`, `print_failed`, `approval_denied`, `label_missing`, `custody_blocked`, `offline_blocked`, `scope_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen controls every second or later package label print after the first station label has been printed or the first print result is unclear. It prevents package loss by making reprints deliberate, reasoned, approved, and traceable.

The screen answers one operational question: `Can this station reprint the same existing package label without weakening custody control?`

The station operator should be able to:
- See why first print is no longer available.
- Confirm the existing label code and delivery identity.
- Select a reprint reason.
- Add a short operational note.
- Submit a support issue when approval is required.
- See whether approval is pending, denied, or available.
- Print only after approval-backed governance exists.
- Print the same immutable label code, never a new one.
- Recover from printer failure without creating another unaudited label.
- Open custody chain, delivery detail, or support when reprint is unsafe.

This screen is not:
- A first label print screen.
- A package intake screen.
- A package label generator.
- A label code editor.
- A package relabeling workflow.
- A custody mutation screen.
- A payment screen.
- A way to bypass support or admin governance.

## Audience
Primary audience:
- Station operators who need another label because the first label was damaged, unreadable, lost before dispatch, or produced with a printer fault.
- Station leads who must understand why a reprint is blocked or pending approval.

Secondary audience:
- Claude Code implementing the governed reprint workflow.
- QA validating that no second label can be printed without approval.
- Support admins reviewing label reprint requests.
- Operations leads validating label loss controls.
- Security reviewers validating immutable package-label policy.
- Accessibility reviewers validating form, approval, and print states.

## User State
The operator is under operational pressure. A package may be sitting at origin station, a label may be damaged, or outbound work may be paused because the scan code cannot be read. The user needs a fast path, but the product must not make a second physical label feel casual.

The user may be:
- Coming from `PackageLabelPrint` after a first print success.
- Coming from `PackageLabelPrint` after an unknown print result.
- Opening from delivery detail after discovering a damaged label.
- Opening during outbound work before driver pickup.
- Filing a request for support approval.
- Returning after support or admin reviewed the request.
- Recovering from printer failure after approval.

The screen must:
- Preserve the original `labelScanCode`.
- Show the existing label identity before any action.
- Require a reason for every request.
- Require a note for high-risk reasons.
- Submit a support issue when current backend cannot approve reprints.
- Block actual print without approval-backed backend support.
- Prevent offline reprint.
- Never write directly to `package_labels` or `audit_events`.
- Never generate, rotate, or edit package label code.

## Decision Summary
Reprint is allowed only as an audited continuation of an existing label, not as a new package identity.

Product decisions:
- The label code is immutable and remains bound to one delivery.
- Reprint uses the same label content and privacy rules as `PackageLabelPrint`.
- Station operator may request a reprint.
- Station operator may not self-approve a reprint.
- Current backend supports support issue creation and tracking, so the screen can submit and monitor a reprint request.
- Current backend does not expose a dedicated reprint approval and print-record mutation, so the screen must not print in production until that mutation exists.
- When a backend reprint mutation is added, the screen may move from request-only to approved print while preserving this spec.
- No local-only approval path is acceptable.

## Backend Reality Check
Existing backend evidence:
- `package_labels/{encodedScanCode}` is an immutable binding between one scan code and one delivery.
- `package_labels` is created during origin intake and never reassigned.
- Client writes to `package_labels` are blocked.
- Client writes to `audit_events` are blocked.
- `create_issue` exists at `POST /v1/issues`.
- `list_issues` exists at `GET /v1/issues`.
- `get_issue` exists at `GET /v1/issues/:id`.
- Support issue categories are `delay`, `damage`, `loss`, `payment`, `handoff`, and `other`.
- Support issue severities are `p1`, `p2`, and `p3`.

Frontend build rule:
- With the current backend, this screen is request-and-track only.
- Physical reprint is disabled unless an approval-backed backend mutation exists.
- The UI must clearly say when reprint printing is unavailable because approval infrastructure is not present.

Required backend contract before enabling physical reprint:
- `request_label_reprint`: creates a typed reprint request with `deliveryId`, `labelScanCode`, `reasonCode`, `reasonNote`, station scope, and first-print evidence.
- `approve_label_reprint`: admin or support action that records reviewer, approval reference, decision, and expiry.
- `record_label_reprint_printed`: station action after approved print that records printer, print job, actor, delivery, label code hash, and result.
- `list_label_reprint_requests`: read route for station and support/admin status.

The screen must be designed so these routes can replace the support-issue bridge without changing the user flow.

## Reprint Authority
Request creation is allowed when:
- User role is `station_operator`.
- User station matches the delivery origin station.
- Delivery has a known `labelScanCode`.
- Delivery has a first-print local record, or the previous print result is marked `unknown`.
- Current custody remains with the origin station.
- Delivery is not cancelled, refunded, delivered, or under loss investigation that blocks station action.
- App is online.

Physical reprint is allowed only when:
- Approval-backed backend mutation exists.
- Approval is active and not expired.
- Approval references the same `deliveryId` and `labelScanCode`.
- Current user station still matches origin station.
- Current custody still belongs to origin station.
- Printer is selected and available.
- The operator confirms the package is physically present.

Physical reprint is blocked when:
- Approval is missing.
- Approval is denied.
- Approval has expired.
- App is offline.
- Label code is missing.
- Current custody is no longer with origin station.
- Delivery is already dispatched to a driver, in transit, at destination, out for delivery, delivered, cancelled, or loss-investigation blocked.
- User lacks station scope.
- Printer result is already in progress.

## Status Eligibility
Allowed for request:
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver` only when custody has not left origin station

Allowed for physical reprint:
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver` only when custody still belongs to origin station and approval is active

Blocked:
- `created`
- `payment_pending`
- `payment_failed`
- `dispatched_from_origin` when custody has left the station
- `driver_picked_up`
- `in_transit`
- `received_at_destination`
- `ready_for_pickup`
- `out_for_delivery`
- `delivered`
- `cancelled`
- any status paired with active loss investigation

Blocked copy:
- Title: `Reprint blocked by custody state`
- Body: `This package is no longer under origin station custody. Open custody chain or support.`
- Primary action: `Open custody chain`

## Reason Codes
The operator must choose one reason:
- `label_damaged`
- `label_unreadable`
- `printer_error`
- `partial_print`
- `label_lost_before_dispatch`
- `support_requested_reprint`
- `other`

Reason labels:
- `Label damaged`
- `Scan code unreadable`
- `Printer fault`
- `Partial print`
- `Label lost before dispatch`
- `Support requested reprint`
- `Other reason`

High-risk reasons:
- `label_lost_before_dispatch`
- `support_requested_reprint`
- `other`

High-risk reason rules:
- Require note.
- Require operator package-present confirmation.
- Default support issue severity to `p1` if package movement is blocked.
- Default support issue severity to `p2` when package can still be safely held.

Low-risk reason rules:
- Require reason.
- Require note when printer result is unknown.
- Default support issue severity to `p2`.

Note constraints:
- Minimum: `10` characters.
- Maximum: `300` characters.
- Must not contain receiver phone.
- Must not contain receiver full address.
- Must not contain payment provider reference.

## Data Sources
Primary delivery source:
- `GET /v1/deliveries/:id`

Custody source:
- `GET /v1/deliveries/:id/timeline`

Issue source:
- `GET /v1/issues?deliveryId={deliveryId}`
- `GET /v1/issues/:id`

Local source:
- `package_label_first_print_record`
- `station_printer_selection`
- `package_label_print_job`

Required fields:
- `deliveryId`
- `trackingCode`
- `labelScanCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `currentCustodyRole`
- `currentCustodyStationId`
- `receiverName`
- `firstPrintResult`
- `firstPrintedAt`
- `firstPrintedByActorId`
- `printerId` when available

Derived fields:
- `hasLabelCode`
- `hasFirstPrintEvidence`
- `isOriginStationScoped`
- `isCustodyAtOriginStation`
- `isOnline`
- `hasOpenReprintIssue`
- `hasApprovedReprint`
- `isApprovalExpired`
- `canRequestReprint`
- `canPhysicallyReprint`

Do not fetch:
- Receiver phone.
- Receiver full address.
- Payment provider payload.
- Raw admin audit events.

## Support Issue Bridge
Until dedicated reprint routes exist, use support issues as the bridge.

Issue category mapping:
- `label_damaged`: `damage`
- `label_unreadable`: `handoff`
- `printer_error`: `handoff`
- `partial_print`: `handoff`
- `label_lost_before_dispatch`: `loss`
- `support_requested_reprint`: `handoff`
- `other`: `other`

Issue severity mapping:
- `p1`: package cannot move safely, label is lost, or custody handoff is blocked.
- `p2`: label is damaged or printer failed but package is secure at station.
- `p3`: not allowed for label reprint request because labels affect custody.

Issue summary format:
- `Label reprint requested for {trackingCode}`

Issue description format:
- `Reason: {reasonLabel}. Package present: {yes|no}. First print: {firstPrintResult} at {firstPrintedAt}. Label code ending: {last4}. Note: {reasonNote}.`

Description privacy:
- Include only last four characters of label code.
- Do not include receiver phone.
- Do not include receiver address.
- Do not include payment reference.
- Do not include staff ID in copy visible to customers.

After issue creation:
- Show issue ID.
- Show current status.
- Show expected support action.
- Keep physical print disabled.
- Provide `Open support`.
- Provide `Back to delivery`.

## Approval Model
Approval states:
- `none`
- `requested`
- `in_review`
- `approved`
- `denied`
- `expired`
- `backend_not_available`

Current backend behavior:
- Support issues can show `open`, `in_review`, `escalated`, `resolved`, or `closed`.
- Those statuses do not equal label reprint approval.
- Do not treat `resolved` or `closed` as approval unless the dedicated reprint contract exists.

Required approval data when backend route exists:
- `approvalId`
- `requestId`
- `deliveryId`
- `labelScanCodeHash`
- `approvedByActorId`
- `approvedByRole`
- `approvedAt`
- `expiresAt`
- `approvalReason`
- `policyVersion`

Approval display:
- Approved: `Support approved one reprint`
- Denied: `Reprint denied`
- Expired: `Approval expired`
- Pending: `Support review pending`
- Not available: `Reprint printing is not enabled yet`

Approval must never:
- Expose admin user ID to customers.
- Expose full label scan code in analytics.
- Survive delivery custody transfer.
- Survive expiry.
- Authorize a different station.
- Authorize a different label code.

## Primary Flow
1. Operator opens reprint route.
2. App loads delivery detail.
3. App loads timeline or custody evidence.
4. App loads local first-print record.
5. App loads open support issues for delivery.
6. App computes request and print eligibility.
7. If no label code exists, show `label_missing`.
8. If user lacks scope, show `scope_blocked`.
9. If custody has left origin station, show `custody_blocked`.
10. If offline, show `offline_blocked`.
11. If request can be filed, show reason entry.
12. Operator selects reason and enters note where required.
13. Operator confirms package is physically present when required.
14. App creates support issue using `create_issue`.
15. App shows submitted request and issue status.
16. If approval-backed mutation exists and approval is active, show label preview and printer selection.
17. Operator prints the same label code.
18. App records print result through backend reprint print mutation.
19. App shows success or recovery.

## Screen Structure
Order:
1. Governance banner.
2. Delivery and label identity.
3. First-print evidence.
4. Reprint request form.
5. Support issue or approval status.
6. Label preview when approved.
7. Printer selection when approved.
8. Recovery and support actions.
9. Audit detail.

### Governance Banner
Default:
- Title: `Reprint needs approval`
- Body: `A second package label can create custody risk. Submit the reason for support review.`

Approved:
- Title: `One approved reprint`
- Body: `Print the same label code once, then attach it before outbound work.`

Blocked:
- Title: `Reprint blocked`
- Body: `This delivery is not eligible for station label reprint.`

Backend not available:
- Title: `Printing not enabled yet`
- Body: `You can request review, but physical reprint needs backend approval tracking first.`

### Delivery And Label Identity
Show:
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Current status.
- Current custody.
- Receiver name.
- Label code ending in last four characters.
- First print result.

Do not show:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment provider reference.
- Full label code outside preview.

### First-Print Evidence
Show:
- First print result.
- First print time.
- Printer name when available.
- Print job ID only in audit detail.
- Whether first print was confirmed, failed, or unknown.

Copy:
- Success: `A first label print already exists.`
- Unknown: `The last print result is unclear. Confirm whether another label is needed.`
- Missing evidence: `No first-print record was found. Return to first print.`

Action when missing:
- `Open first print`

### Reprint Request Form
Fields:
- Reason code selector.
- Reason note text area.
- Package present confirmation.
- Support urgency indicator.

Reason selector rules:
- One reason required.
- Reasons are plain language.
- High-risk reasons show warning text.

Note field:
- Label: `What happened to the first label?`
- Help text: `Do not enter phone numbers, addresses, or payment details.`
- Error: `Add a short note so support can review the request.`

Package present confirmation:
- Label: `I can physically see this package at the origin station.`
- Required for high-risk reasons.
- Required before physical print.

Primary action:
- `Submit reprint request`

### Support Status Panel
States:
- No request yet.
- Request submitted.
- Review in progress.
- Escalated.
- Denied or closed.
- Approved by dedicated reprint backend.

No request copy:
- Title: `No reprint request filed`
- Body: `Choose a reason and submit for review.`

Submitted copy:
- Title: `Request submitted`
- Body: `Support can review this label reprint request. Keep the package at station until resolved.`

In review copy:
- Title: `Support is reviewing`
- Body: `Do not print another label until approval appears here.`

Denied copy:
- Title: `Reprint denied`
- Body: `Support did not approve another label. Follow the custody instruction in the issue thread.`

Approved copy:
- Title: `Approved for one reprint`
- Body: `Print once using the same label code.`

### Label Preview
Visible only when:
- Approval-backed print is enabled.
- Active approval exists.
- Label code exists.
- Custody is still at origin station.

Preview must:
- Match `PackageLabelPrint` layout.
- Use the same label code.
- Use high contrast black on white.
- Show scannable code and human-readable code.
- Show destination, tracking code, receiver name, service, and handling facts.
- Show `REPRINT` in small audit text without interfering with scanning.

Preview must not:
- Use a new label code.
- Include receiver phone.
- Include receiver address.
- Include payment data.
- Include provider data.
- Include support notes.

### Printer Selection
Visible only in approved print state.

Rules:
- Use station-configured printer when available.
- Allow system print sheet where platform supports it.
- Require selected printer before print.
- Do not allow print while request is pending.
- Do not allow print while offline.
- Do not allow multiple print jobs at once.

### Audit Detail
Show to station operator:
- Request ID or issue ID.
- Approval status.
- Reason label.
- First print result.
- Print result after approved reprint.

Show only in internal debug logs, not screen copy:
- Full printer ID.
- Print job ID.
- Approval ID.

Never show:
- Admin secret.
- Internal token.
- Full audit event payload.
- Receiver phone.
- Receiver address.

## Primary Action Logic
Primary action by state:
- `request_ready`: `Submit reprint request`
- `reason_entry`: `Submit reprint request`
- `request_submitting`: wait.
- `request_submitted`: `Open support`
- `approval_pending`: `Refresh status`
- `approved_to_print`: `Print approved label`
- `preview_ready`: `Print approved label`
- `printer_selecting`: `Use selected printer`
- `printing`: wait.
- `print_success`: `Back to outbound`
- `print_failed`: `Retry approved print`
- `approval_denied`: `Open support`
- `label_missing`: `Open custody chain`
- `custody_blocked`: `Open custody chain`
- `offline_blocked`: `Back to delivery`
- `scope_blocked`: `Back to role home`
- `not_found`: `Back to station overview`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Secondary actions:
- `Open delivery detail`
- `Open custody chain`
- `Open support`
- `Open first print`
- `Back to outbound`
- `Back to station overview`

Blocked behavior:
- Do not show print action in request-only state.
- Do not print when approval is pending.
- Do not print when support issue exists without dedicated approval.
- Do not print while offline.
- Do not create another label code.
- Do not write to delivery status.
- Do not mutate custody.

## Offline Rules
This screen is not offline-critical for mutation.

Offline allowed:
- Read cached delivery identity.
- Read cached first-print record.
- Read cached last support request status.
- Show why reprint is blocked.
- Open cached custody chain when available.

Offline blocked:
- Create support issue.
- Refresh support status.
- Approve reprint.
- Print approved label.
- Record print result.

Offline copy:
- Title: `Reprint needs network`
- Body: `A second label needs support review and audit tracking. Reconnect before requesting or printing.`
- Primary action: `Back to delivery`

If the app goes offline during approved print:
- Before print starts: block print and show offline copy.
- During native print sheet: let platform finish or fail, then require online status before recording result.
- If result cannot be recorded, show `print_failed` with support route and do not allow another print from this screen.

## Error Mapping
Missing label code:
- State: `label_missing`
- Message: `Package label code is unavailable.`
- Action: `Open custody chain`

No first-print evidence:
- State: `request_ready`
- Message: `No first-print record was found. Use first print before requesting a reprint.`
- Action: `Open first print`

Approval missing:
- State: `approval_pending`
- Message: `Support approval is required before another label can print.`
- Action: `Refresh status`

Approval backend missing:
- State: `request_submitted`
- Message: `Request filed. Physical reprint needs backend approval tracking before it can print.`
- Action: `Open support`

Approval denied:
- State: `approval_denied`
- Message: `Support did not approve another label.`
- Action: `Open support`

Approval expired:
- State: `approval_pending`
- Message: `The approval expired. Submit or refresh the request before printing.`
- Action: `Refresh status`

Custody transferred:
- State: `custody_blocked`
- Message: `This package is no longer under origin station custody.`
- Action: `Open custody chain`

Offline:
- State: `offline_blocked`
- Message: `Reconnect to request or print a reprint.`
- Action: `Back to delivery`

Printer unavailable:
- State: `print_failed`
- Message: `Printer is unavailable. Check power, paper, and connection.`
- Action: `Retry approved print`

Printer out of paper:
- State: `print_failed`
- Message: `Printer needs label paper. Reload and retry.`
- Action: `Retry approved print`

Print result unrecorded:
- State: `print_failed`
- Message: `Print result was not recorded. Contact support before trying again.`
- Action: `Open support`

Auth required:
- State: `session_expired`
- Message: `Sign in again to continue.`
- Action: `Sign in`

Forbidden role:
- State: `not_authorized`
- Message: `You do not have permission to request this reprint.`
- Action: `Back to role home`

Station scope violation:
- State: `scope_blocked`
- Message: `This package is outside your station scope.`
- Action: `Back to role home`

Delivery not found:
- State: `not_found`
- Message: `Delivery record not found.`
- Action: `Back to station overview`

## Copy System
Voice:
- Direct.
- Calm.
- Operational.
- No hype.
- No blame.

Primary heading:
- `Package label reprint`

Subheading:
- `Request and print a governed copy of the same package label.`

Core warning:
- `A second label can confuse custody if it is not tracked. Reprints need a reason and approval.`

Request CTA:
- `Submit reprint request`

Approved CTA:
- `Print approved label`

Pending CTA:
- `Refresh status`

Support CTA:
- `Open support`

Success:
- Title: `Approved label printed`
- Body: `Attach this label now, then continue outbound work.`

Denied:
- Title: `Reprint denied`
- Body: `Follow the support instruction before moving this package.`

## Visual System Direction
This screen should feel like a controlled exception workflow, not a print utility.

Visual thesis:
- A calm custody control panel with a strong approval gate and a precise label preview only after governance clears.

Layout:
- Single-column mobile structure.
- Top banner carries approval state.
- Delivery identity sits above form.
- Form is compact and explicit.
- Approval panel separates request from print.
- Print preview appears only in approved states.
- Sticky primary action changes by state.

Color:
- Pending: amber.
- Approved: controlled green or blue.
- Denied or blocked: red/rust.
- Neutral identity: slate.
- Label preview: black on white.

Typography:
- Tracking code and label suffix use tabular numerals.
- Warnings use short text and strong headings.
- Reason labels are plain language.

Motion:
- No celebratory animation.
- Use a subtle state transition when status changes.
- Respect reduced motion.
- Do not animate barcode or scannable code.

Density:
- The first viewport must show state, tracking code, and primary next step.
- Hide audit detail behind disclosure.
- Do not crowd the label preview before approval.

## Component Inventory
Components:
- `ReprintGovernanceBanner`
- `DeliveryLabelIdentityCard`
- `FirstPrintEvidencePanel`
- `ReprintReasonForm`
- `PackagePresentConfirmation`
- `SupportIssueStatusPanel`
- `ReprintApprovalPanel`
- `ApprovedLabelPreview`
- `StationPrinterSelector`
- `PrintResultPanel`
- `ReprintAuditDisclosure`
- `ReprintBlockedState`

### `ReprintGovernanceBanner`
Props:
- `state`
- `title`
- `body`
- `severity`
- `lastUpdatedAt`

Responsibilities:
- Explain whether the user can request, wait, print, or recover.
- Never hide a blocked state behind neutral copy.

### `DeliveryLabelIdentityCard`
Props:
- `trackingCode`
- `deliveryId`
- `originStationName`
- `destinationStationName`
- `currentStatus`
- `currentCustody`
- `receiverName`
- `labelCodeSuffix`

Responsibilities:
- Keep delivery identity visible.
- Show only a label suffix before approval.
- Avoid sensitive fields.

### `FirstPrintEvidencePanel`
Props:
- `firstPrintResult`
- `firstPrintedAt`
- `printerName`
- `source`

Responsibilities:
- Explain why this is a reprint path.
- Route missing first-print evidence back to first print.

### `ReprintReasonForm`
Props:
- `reasonCode`
- `reasonNote`
- `isHighRiskReason`
- `isPackagePresentConfirmed`
- `validationErrors`

Responsibilities:
- Collect a review-ready reason.
- Prevent private data in notes.
- Explain urgency mapping.

### `SupportIssueStatusPanel`
Props:
- `issueId`
- `issueStatus`
- `issueSeverity`
- `createdAt`
- `updatedAt`

Responsibilities:
- Show the support bridge clearly.
- Never imply support issue status equals print approval.

### `ReprintApprovalPanel`
Props:
- `approvalState`
- `approvalId`
- `approvedAt`
- `expiresAt`
- `decisionNote`

Responsibilities:
- Display explicit approval only when dedicated backend approval exists.
- Expire approval when custody or time changes invalidate it.

### `ApprovedLabelPreview`
Props:
- `labelPreviewData`
- `isReprint`
- `approvalId`

Responsibilities:
- Match print layout.
- Use same label code.
- Include small `REPRINT` audit text without reducing scan reliability.

### `StationPrinterSelector`
Props:
- `selectedPrinter`
- `availablePrinters`
- `printerStatus`
- `isPrintAllowed`

Responsibilities:
- Select printer only in approved state.
- Explain unavailable printer states.

## Label Content Rules
Reprint label uses the same content as first print:
- Kra brand text.
- Large human-readable package label code.
- Machine-scannable code for `labelScanCode`.
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Receiver name.
- Service type.
- Doorstep requested indicator.
- Intake date and time.
- Weight and size when available.
- Condition indicator when damaged.
- Small `REPRINT` audit text.

Reprint label must not include:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment status.
- Provider reference.
- Staff user ID.
- Internal event payload.
- Support issue description.
- Approval note.

Scannable code:
- Encodes `labelScanCode` only.
- Human-readable text must match encoded value.
- Maintain quiet zone.
- Use high contrast.
- Do not add visual effects near the code.

## Accessibility Requirements
Screen reader order:
1. Screen title.
2. Governance banner.
3. Delivery identity.
4. First-print evidence.
5. Reason selector.
6. Reason note.
7. Package-present confirmation.
8. Support or approval status.
9. Label preview when visible.
10. Printer selector when visible.
11. Primary action.
12. Recovery actions.
13. Audit detail.

Required labels:
- Reason selector announces selected reason and required state.
- Note field announces character limits.
- Package-present checkbox announces why it is required.
- Support status is announced as a status message.
- Approval changes are announced as status messages.
- Print success and failure are announced as status messages.

Touch targets:
- Primary action meets mobile target size.
- Reason options are easy to tap.
- Support and custody actions are not icon-only.
- Printer selector is bottom reachable.

Focus:
- Initial focus lands on screen title.
- Validation error moves focus to the first invalid field.
- After request submission, focus moves to support status.
- After approval refresh, focus moves to approval panel.
- After print failure, focus moves to error title.
- After print success, focus moves to success title.

Reduced motion:
- No animated approval celebration.
- No moving barcode.
- Use stable layout for status changes.

## Security And Privacy
Allowed in screen:
- Tracking code.
- Delivery ID.
- Origin station.
- Destination station.
- Receiver name.
- Current status.
- Current custody.
- Label code suffix before approval.
- Full label code only inside approved preview and print output.
- Issue ID.
- Approval state.

Not allowed in screen:
- Receiver phone.
- Receiver full address.
- Payment provider reference.
- Raw audit event payload.
- Internal secret or token.

Allowed in printed label:
- Same label fields as first print.
- Small `REPRINT` text.

Not allowed in printed label:
- Receiver phone.
- Receiver full address.
- Payment amount.
- Payment status.
- Provider reference.
- Support issue details.
- Approval notes.

Analytics exclusions:
- Do not send full label scan code.
- Do not send receiver name.
- Do not send note text.
- Do not send support issue description.
- Do not send approval note.

## Analytics
Events:
- `package_label_reprint_viewed`
- `package_label_reprint_reason_selected`
- `package_label_reprint_request_submitted`
- `package_label_reprint_request_failed`
- `package_label_reprint_status_refreshed`
- `package_label_reprint_approval_pending`
- `package_label_reprint_approved`
- `package_label_reprint_denied`
- `package_label_reprint_print_started`
- `package_label_reprint_print_succeeded`
- `package_label_reprint_print_failed`
- `package_label_reprint_blocked`
- `package_label_reprint_support_opened`
- `package_label_reprint_custody_opened`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `currentStatus`
- `custodyRole`
- `reasonCode`
- `issueId`
- `issueStatus`
- `approvalState`
- `printerType`
- `printResult`
- `blockReason`
- `sourceRoute`

Disallowed payload fields:
- `labelScanCode`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `reasonNote`
- `issueDescription`
- `approvalNote`
- `paymentProviderReference`

## QA Acceptance Criteria
Request eligibility:
- Eligible origin-station delivery shows reason entry.
- Wrong station shows `scope_blocked`.
- Missing label code shows `label_missing`.
- Custody outside origin station shows `custody_blocked`.
- Offline state blocks request submission.
- Missing first-print evidence routes to first print.

Reason form:
- Reason is required.
- Note is required for high-risk reason.
- Note under minimum length blocks submit.
- Note over maximum length blocks submit.
- Private data warning is visible near note field.
- Package-present confirmation is required for high-risk reason.

Support issue bridge:
- `create_issue` is called with mapped category and severity.
- `p3` is never used for reprint request.
- Description includes reason, package-present status, first-print result, label suffix, and note.
- Description excludes receiver phone, address, payment reference, and full label code.
- Submitted issue shows issue ID and status.
- Support issue status does not unlock print.

Approval:
- Pending approval hides print action.
- Denied approval hides print action.
- Expired approval hides print action.
- Current support issue status alone never becomes approval.
- Dedicated backend approval unlocks preview and printer selection.
- Approval becomes invalid after custody leaves origin station.

Print:
- Approved print uses the original label code.
- Approved print includes `REPRINT` audit text.
- Approved print excludes phone, address, payment, provider, and support notes.
- Print cannot start while offline.
- Print cannot start without selected printer.
- Print result is recorded through backend reprint mutation when available.
- Unrecorded print result blocks another print and routes support.

Accessibility:
- Status updates are announced.
- Validation errors move focus to first invalid field.
- Touch targets are usable on small phones.
- Large text keeps primary action accessible.
- Color is not the only approval cue.

Privacy:
- Analytics never send full label code.
- Analytics never send reason note.
- Screen never shows receiver phone or full address.
- Printed label never includes payment or provider data.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/package-label-reprint`

Recommended state holder:
- `usePackageLabelReprintScreen`

Recommended selectors:
- `selectReprintRequestEligibility`
- `selectReprintCustodyEligibility`
- `selectReprintIssueBridgeState`
- `selectReprintApprovalState`
- `selectReprintPrimaryAction`
- `selectReprintLabelPreviewData`
- `selectReprintPrinterState`

Recommended local records:
- `package_label_first_print_record`
- `package_label_reprint_request_cache`
- `station_printer_selection`
- `package_label_reprint_print_job`

Recommended API hooks:
- `useDeliveryQuery`
- `useDeliveryTimelineQuery`
- `useIssuesQuery`
- `useCreateIssueMutation`
- `useLabelReprintRequestMutation` when backend route exists
- `useLabelReprintPrintMutation` when backend route exists

Feature flag rule:
- A flag may hide approved physical printing until backend routes exist.
- A flag must not bypass approval.
- A flag must not allow local-only physical reprint.

Print implementation:
- Reuse printable layout from `PackageLabelPrint`.
- Add `REPRINT` audit text.
- Use platform print APIs where available.
- Require online status before print starts.
- Record result through backend reprint mutation when available.

## Implementation Guardrails
Must use:
- Existing delivery detail.
- Existing custody timeline.
- Existing first-print local record.
- Existing support issue APIs as request bridge.
- Dedicated reprint backend before physical reprint.

Must show:
- Why reprint is governed.
- Delivery identity.
- First-print evidence.
- Reason form.
- Support or approval state.
- Blocked states.
- Label preview only after approval.
- Printer controls only after approval.

Must not:
- Generate a new package label code.
- Rebind a package label.
- Print from support issue status alone.
- Print while offline.
- Print after custody leaves origin station.
- Write directly to `package_labels`.
- Write directly to `audit_events`.
- Include private receiver or payment data in issue descriptions, analytics, or labels.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [GS1 logistic label guideline](https://ref.gs1.org/guidelines/logistic-label/): supports treating logistics labels as structured operational identifiers with scannable and human-readable information.
- [GS1 barcode standards](https://www.gs1.org/standards/barcodes): supports stable barcode use, human-readable identifiers, and scan reliability.
- [Android custom document printing](https://developer.android.com/training/printing/custom-docs): supports controlled printable output through platform print flow.
- [Android print photos and documents](https://developer.android.com/training/printing): supports printer selection and platform print job behavior.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing request, approval, print, success, and failure state changes.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports confirmation and review for high-impact actions.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large mobile actions for request, refresh, print, and recovery controls.

Design translation:
- Reprint is a custody-risk action, so approval comes before convenience.
- The label identifier must stay stable and readable.
- The UI must distinguish support request from print approval.
- Print state changes must be accessible.
- Operator actions must be easy to tap under station pressure.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/packages/:deliveryId/label/reprint`.
- The top-level test ID is `screen-package-label-reprint`.
- Current backend support issue APIs are used only for request and tracking.
- Physical print is blocked until dedicated approval-backed backend routes exist.
- Support issue status alone never unlocks print.
- The same immutable label code is used for reprint.
- Wrong station, missing label, offline, and custody-transfer states block action.
- Reason and note validation match this spec.
- Sensitive data is excluded from notes, analytics, and printed label.
- Screen reader status messages cover request, approval, denial, print start, success, and failure.

## Done Definition
The screen is complete when:
- Every required state is implemented and tested.
- Request-only mode works with current support issue APIs.
- Physical print remains blocked without approval-backed backend routes.
- Approval-backed mode prints one governed reprint when backend support exists.
- Reprint uses the original label code and same privacy-safe label layout.
- Custody and station scope rules are enforced.
- Offline behavior is conservative.
- Printer failure recovery prevents repeat unaudited prints.
- Analytics exclude label code, notes, receiver, and payment data.
- E2E tests cover request submission, pending review, denied review, backend-not-available print block, approved print, custody block, offline block, and printer failure.

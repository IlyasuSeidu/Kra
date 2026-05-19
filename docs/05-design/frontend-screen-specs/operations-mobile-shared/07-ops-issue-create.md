# Ops Issue Create Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `OpsIssueCreate` |
| App | `apps/mobile` |
| Route | `/(ops)/deliveries/:deliveryId/issues/new` |
| Primary test ID | `screen-ops-issue-create` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Operations Critical` |
| Backend dependency | `POST /v1/issues`, `createIssueRequestSchema`, `issueResponseSchema`, `apiErrorResponseSchema`, `apiErrorCodeSchema`, `Idempotency-Key` header, local SQLite queue for offline-safe issue creation |
| Related routes | `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/scan`, `/(ops)/offline-outbox`, `/(ops)/offline-outbox/:queuedActionId/recover`, `/(ops)/support`, role-specific station/driver/courier routes |
| Required states | `loading_context`, `ready`, `dirty`, `submitting`, `submitted`, `queued_offline`, `blocked`, `validation_error`, `duplicate_possible`, `not_found`, `not_authorized`, `session_expired`, `rate_limited`, `offline`, `stale_context`, `api_error` |

## Product Job
This screen lets authenticated operations staff report a delivery issue with enough structure for support, operations, and launch-readiness controls to act on it.

The screen answers one operational question: `What has gone wrong with this delivery, how serious is it, and what evidence/context should the operations team receive now?`

The staff member should be able to:
- Confirm the issue is attached to the correct delivery.
- Select an accurate issue category.
- Select the right severity.
- Write a short summary that helps triage.
- Add a clear description when needed.
- Review what will be submitted.
- Submit online with an idempotency key.
- Queue the issue offline when policy allows.
- See whether the issue was submitted or saved locally.
- Return to delivery detail, custody chain, support, or outbox.
- Recover from validation, authorization, duplicate, stale context, offline, and rate-limit states.

This screen is not:
- A general support chat.
- A public receiver complaint form.
- A payment refund approval flow.
- A station status override.
- A custody transfer screen.
- A proof capture screen.
- A package scan screen.
- An incident resolution screen.
- A support-admin escalation screen.
- A place to expose raw internal identifiers or sensitive receiver details.

## Audience
Primary audience:
- Station operators reporting intake, dispatch, receipt, package, or station issues.
- Drivers reporting pickup, transit, handoff, vehicle, or package issues.
- Final-mile couriers reporting receiver, doorstep, package, or proof issues.
- Support and ops staff creating an issue from a delivery context.

Secondary audience:
- Claude Code implementing the issue creation route.
- QA validating issue creation, validation, and offline queue behavior.
- Operations leads validating severity discipline.
- Security reviewers checking redaction and access boundaries.
- Accessibility reviewers checking form usability and status messaging.

## User State
The user is likely reporting under pressure. They may be at a station desk, in a vehicle, near a receiver, or reviewing a custody conflict.

The user may be:
- Reporting a missing package scan.
- Reporting damaged packaging.
- Reporting a lost or unlocated package.
- Reporting a delay that risks SLA.
- Reporting a payment block seen during operations.
- Reporting a handoff mismatch.
- Reporting an issue from offline action recovery.
- Reporting after a custody chain warning.
- Reporting while offline and needing evidence preserved.

The screen must:
- Anchor the issue to a delivery.
- Keep delivery context visible but compact.
- Guide severity without overloading the user.
- Prevent empty or vague submissions.
- Preserve idempotent submission behavior.
- Redact sensitive delivery, receiver, proof, and scan details.
- Treat P1 as operationally serious.
- Explain that creating an issue does not mutate delivery status or transfer custody.
- Keep issue creation separate from support-admin escalation and resolution.

## Backend Contract
Create endpoint:
- `POST /v1/issues`

Request schema:
- `deliveryId`: required, must match `deliveryIdSchema`.
- `category`: required, one of `delay`, `damage`, `loss`, `payment`, `handoff`, `other`.
- `severity`: required, one of `p1`, `p2`, `p3`.
- `summary`: required, trimmed, minimum `5` characters, maximum `160` characters.
- `description`: optional, trimmed, minimum `5` characters, maximum `500` characters.

Response schema:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description` when present
- `reporter.actorId`
- `reporter.actorRole`
- `createdAt`
- `updatedAt`
- optional escalation and resolution fields

Issue statuses:
- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Creation behavior:
- New issue starts as `open`.
- Reporter is set from authenticated actor.
- Delivery must exist.
- Principal must have access to the delivery or admin authority.
- Sender, driver, station operator, final-mile courier, ops admin, support admin, super admin, and finance admin may create when scoped by backend policy.

Error schema:
- `apiErrorResponseSchema` provides `requestId`, `code`, `message`, and details.
- `apiErrorCodeSchema` includes `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`, `ROUTE_NOT_ENABLED`, `PAYMENT_REQUIRED`, `INVALID_STATUS_TRANSITION`, `PHONE_VERIFICATION_REQUIRED`, `PACKAGE_SCAN_MISMATCH`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

Idempotency:
- Issue create is a client-initiated mutating POST and must send `Idempotency-Key`.
- Retry must reuse the same key and request body.
- Offline queued issue creation must persist the idempotency key and request fingerprint.

## Issue Category Model
Allowed categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Category guidance:
- `delay`: delivery is blocked, late, stuck, or unlikely to meet expected handling time.
- `damage`: package, label, container, seal, or visible condition is damaged.
- `loss`: package cannot be found, custody is unclear, or a package was expected but is missing.
- `payment`: payment state blocks an operational action or payment evidence conflicts with delivery state.
- `handoff`: scan, custody, assignment, receipt, final-mile, or proof handoff is wrong or uncertain.
- `other`: operational issue does not fit the listed categories.

Category rules:
- Do not infer category from free text after submit without showing it to the user.
- Use context to recommend a category when entry source is known.
- If opened from custody chain missing evidence, preselect `handoff`.
- If opened from action recovery scan mismatch, preselect `handoff`.
- If opened from damaged-package workflow, preselect `damage`.
- If opened from payment-blocked delivery detail, preselect `payment`.
- If opened from delivery delay warning, preselect `delay`.
- If user changes category, preserve the user selection.

## Severity Model
Allowed severity:
- `p1`
- `p2`
- `p3`

Severity guidance:
- `p1`: package may be lost, severe custody conflict, safety issue, fraud concern, or launch-readiness blocker.
- `p2`: delivery is blocked or materially delayed, but package location and custody are still reasonably known.
- `p3`: minor issue, note, non-urgent follow-up, or operational clarification.

Severity rules:
- Default severity should be unset unless entry context safely recommends one.
- P1 must require a severity confirmation panel before submit.
- P1 copy must explain operational impact.
- P1 issue creation can affect station launch readiness through unresolved P1 issue counts.
- P2 should be recommended for blocked handoff, late station processing, or repeated failed operational retry.
- P3 should be recommended for low-risk notes or minor process issue.
- Do not let the user submit without severity.
- Do not hide severity behind advanced controls.

P1 confirmation:
- Title: `Confirm P1 severity`
- Body: `P1 means this issue may block launch readiness, custody confidence, or urgent operations review. Use it only when the delivery needs immediate attention.`
- Primary action: `Submit P1 issue`
- Secondary action: `Review severity`

## Product Entry Contexts
Supported entry contexts:
- Delivery detail `Report issue`.
- Custody chain missing evidence.
- Custody chain conflict.
- Scan mismatch.
- Offline action recovery support route.
- Station intake exception.
- Station outbound exception.
- Driver pickup exception.
- Driver destination handoff exception.
- Courier proof or failed-attempt exception.
- Role home support alert.

Context fields:
- `deliveryId`
- `trackingCode` when safe.
- `sourceRoute`
- `recommendedCategory`
- `recommendedSeverity`
- `sourceReason`
- `relatedLocalActionId` when opened from offline recovery.
- `relatedTimelineEntryId` when opened from custody chain.

Context display:
- Delivery tracking code.
- Origin and destination station labels when safe.
- Current status.
- Current custody role.
- Source reason.
- Freshness timestamp.

Context must not display:
- Receiver phone.
- Receiver precise address.
- Raw package scan code.
- Raw proof reference.
- Payment provider reference.
- Local media path.
- Internal actor IDs except where QA tooling explicitly requires a hidden test hook.

## Primary Action
Primary action by state:
- `loading_context`: wait.
- `ready`: submit issue.
- `dirty`: submit issue.
- `submitting`: show progress.
- `submitted`: view issue or return to delivery.
- `queued_offline`: open offline outbox or return to work.
- `blocked`: follow blocked guidance.
- `validation_error`: fix highlighted fields.
- `duplicate_possible`: review existing issue guidance.
- `not_found`: return to previous route or support.
- `not_authorized`: return to role home or support.
- `session_expired`: sign in.
- `rate_limited`: wait or queue if allowed.
- `offline`: queue issue or save draft locally if allowed.
- `stale_context`: refresh context or continue with warning.
- `api_error`: retry or queue if safe.

Secondary actions:
- `Open delivery`
- `Open custody chain`
- `Open scan`
- `Open offline outbox`
- `Open support`
- `Save locally`
- `Back`
- `Discard draft`

Blocked behavior:
- Do not submit without category, severity, and valid summary.
- Do not submit issue for inaccessible delivery.
- Do not mutate delivery status.
- Do not transfer custody.
- Do not resolve or escalate an issue from this screen.
- Do not expose receiver phone/address in form context.
- Do not auto-create duplicate issues without user awareness.
- Do not send sensitive scan/proof/payment values in analytics.
- Do not queue issue offline without an idempotency key.

## First Meaningful Value
First meaningful value is reached when staff sees:
- Delivery identity.
- Issue form purpose.
- Category control.
- Severity control.
- Summary field.
- Submission state.
- Visible offline or stale-context warning when relevant.

The first viewport must answer:
- `Which delivery am I reporting on?`
- `What type of issue is this?`
- `How urgent is it?`
- `What short summary should I enter?`
- `Can this be submitted now?`

## Main Tension
Issue reporting must be fast enough for field work, but structured enough for operations response. If the form is too loose, support receives weak reports. If it is too heavy, staff will delay reporting serious incidents.

The design must balance:
- Speed against triage quality.
- Severity discipline against over-warning.
- Free text against structured reporting.
- Offline continuity against duplicate reports.
- Visible delivery context against privacy.
- Simple UI against launch-readiness consequences.

## Design Brief
User and job:
- Operations staff needs to report a delivery issue clearly and quickly.

Context of use:
- Mobile, field shift, likely one-handed, possibly poor network, physical package nearby.

Entry point:
- Delivery detail, custody chain, scan mismatch, action recovery, or role-specific exception route.

Success state:
- Issue is submitted to backend or saved in offline outbox with clear confirmation.

Primary action:
- Submit issue.

Navigation model:
- Delivery-anchored form with structured category, severity, concise summary, optional details, and review-safe confirmation.

Density:
- Medium. Capture only what support needs now; leave investigation and resolution to support/admin tools.

Visual thesis:
- A disciplined field incident form: sharp, calm, legible, and built for fast triage rather than chatty support.

Restraint rule:
- Avoid chat bubbles, long questionnaires, raw logs, decorative incident graphics, and admin escalation controls.

Product lens:
- Report early, classify accurately, protect custody evidence, and keep launch readiness honest.

System stance:
- Authenticated issue intake tied to a delivery record.

Interaction thesis:
- Confirm delivery, classify issue, describe what happened, submit or queue safely.

Signature move:
- A compact `Triage strip` at the top showing category, severity, and delivery state as the user completes the form.

Activation event:
- User submits, queues offline, opens custody chain, opens delivery, opens outbox, or exits.

## Elite Quality Gate
This spec is not closed unless `OpsIssueCreate` produces useful support records without creating privacy, severity, or duplicate-reporting risk.

Non-negotiable quality requirements:
- First viewport shows delivery identity and form purpose.
- Category and severity are required.
- Summary enforces the backend `5` to `160` character range.
- Description enforces the backend `5` to `500` character range when provided.
- P1 severity requires confirmation.
- Offline queue uses persisted idempotency key and request fingerprint.
- Submitted state parses `issueResponseSchema`.
- Creating an issue does not mutate delivery status or custody.
- Duplicate guidance is visible when existing open issue context is known.
- Sensitive values are redacted from UI and analytics.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If staff can submit vague, category-free issues, the screen remains open.
- If P1 can be submitted casually, the screen remains open.
- If offline issue creation can duplicate without idempotency, the screen remains open.
- If the form exposes receiver or scan secrets, the screen remains open.
- If submitted state implies delivery status changed, the screen remains open.

## Research And Inspiration Notes
Use these sources for quality direction, not visual copying:
- [Nielsen Norman Group error message guidelines](https://www.nngroup.com/articles/error-message-guidelines/): form errors should explain what happened and how to fix it.
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): invalid fields must be identified in text and available to assistive technology.
- [WCAG Status Messages](https://w3c.github.io/wcag/understanding/status-messages): submission, offline queueing, and errors must be announced without stealing focus.
- [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): category, severity, submit, and discard controls need reliable touch targets.
- [Material Design text fields](https://m1.material.io/components/text-fields.html): labels, helper text, and error text should keep form intent clear on mobile.
- [Atlassian incident severity levels](https://www.atlassian.com/incident-management/kpis/severity-levels): severity labels need shared operational meaning to make triage consistent.

Applied decisions:
- Use structured category and severity before free text.
- Keep summary short and action-oriented.
- Confirm P1 because it affects operations priority and launch readiness.
- Make offline queueing explicit.
- Avoid showing sensitive delivery data in issue context.

## Information Architecture
The screen uses seven stacked regions.

Region 1: Delivery context header
- Title.
- Tracking code.
- Delivery status.
- Current custody role.
- Freshness state.
- Source reason.

Region 2: Triage strip
- Category.
- Severity.
- Current completion state.
- Existing open issue indicator when known.

Region 3: Category selector
- Required category list.
- Recommended category when entry context provides it.
- Short category explanations.

Region 4: Severity selector
- Required severity list.
- Severity explanation.
- P1 confirmation trigger.

Region 5: Written details
- Summary field.
- Optional description field.
- Character count and validation.

Region 6: Submission controls
- Submit issue.
- Queue offline or save locally when eligible.
- Open support.
- Back.

Region 7: Submitted or queued result
- Issue ID when submitted.
- Outbox queued action when offline.
- Next steps.

## Delivery Context Header
Required header content:
- Title: `Report issue`
- Tracking code when known.
- Delivery status label.
- Current custody role.
- Route summary when safe.
- Freshness label.

Source reason:
- `Opened from delivery detail`
- `Opened from custody warning`
- `Opened from scan mismatch`
- `Opened from failed queued action`
- `Opened from station workflow`
- `Opened from driver workflow`
- `Opened from courier workflow`

Header states:
- Fresh: show normal delivery context.
- Stale: show `Delivery context may be out of date. Refresh before choosing severity if this issue depends on current state.`
- Offline: show `Offline: issue can be saved locally if required fields are complete.`
- Not found: show delivery unavailable state.
- Not authorized: show access issue.

Header actions:
- `Open delivery`
- `Open custody chain`
- `Refresh`

Do not show:
- Receiver phone.
- Receiver precise address.
- Raw scan code.
- Raw proof reference.
- Payment provider reference.

## Triage Strip
Purpose:
- Show how close the report is to a useful triage record.

Fields:
- Category state: unset or selected.
- Severity state: unset or selected.
- Summary state: missing, too short, valid, too long.
- Submission readiness: blocked, ready, offline-ready, submitted.

Behavior:
- Updates as user fills the form.
- Uses text and icon together, not color alone.
- Stays visible near the top on long screens.
- If P1 selected, strip highlights urgent review.

Copy:
- `Choose category`
- `Choose severity`
- `Add short summary`
- `Ready to submit`
- `Ready to queue offline`
- `Submitted`

## Category Selector
Control:
- Use a radio-list or segmented list that supports large text.
- Each option includes label and one short explanation.
- Recommended category can be preselected only if context is strong.

Options:
- `Delay`
- `Damage`
- `Loss`
- `Payment`
- `Handoff`
- `Other`

Option copy:
- `Delay`: `The delivery is late, stuck, or blocked by timing.`
- `Damage`: `Package, label, seal, or container condition is damaged.`
- `Loss`: `The package cannot be located or custody is unclear.`
- `Payment`: `Payment state blocks operations or conflicts with the delivery.`
- `Handoff`: `Scan, custody, assignment, receipt, or proof does not line up.`
- `Other`: `Use when the issue does not fit the listed categories.`

Validation:
- Required.
- Error: `Choose the issue category.`

## Severity Selector
Control:
- Use large tappable severity cards.
- Each card includes label, meaning, and escalation impact.
- Do not use only color to differentiate severity.

Options:
- `P1 urgent`
- `P2 blocked`
- `P3 routine`

Option copy:
- `P1 urgent`: `Possible loss, serious custody conflict, safety, fraud, or launch-readiness blocker.`
- `P2 blocked`: `Delivery needs operations help, but package location or custody is still reasonably known.`
- `P3 routine`: `Minor issue, note, or follow-up that does not block immediate handling.`

Validation:
- Required.
- Error: `Choose the issue severity.`

P1 requirements:
- Show confirmation sheet before submit.
- Sheet must explain impact without scaring users away from legitimate P1.
- Submit proceeds only after confirmation.

## Summary Field
Purpose:
- Capture a short triage headline.

Input:
- Required text field.
- Minimum `5` characters.
- Maximum `160` characters.
- Show character count after focus.
- Trim before submit.

Good summary guidance:
- Include what happened and where.
- Use delivery context rather than personal blame.
- Keep it short enough for issue lists.

Field label:
- `Short summary`

Helper text:
- `Write what happened in one clear line.`

Validation errors:
- `Summary is required.`
- `Summary must be at least 5 characters.`
- `Summary must be 160 characters or fewer.`

Do not:
- Ask for receiver phone.
- Ask for raw scan code.
- Ask for payment provider reference.
- Ask for private personnel notes.

## Description Field
Purpose:
- Capture additional context only when needed.

Input:
- Optional multiline text.
- If provided, minimum `5` characters.
- Maximum `500` characters.
- Show character count after focus.
- Trim before submit.

Field label:
- `Details`

Helper text:
- `Add context support should know. Do not enter receiver phone, raw scan codes, or private payment references.`

Validation errors:
- `Details must be at least 5 characters or left blank.`
- `Details must be 500 characters or fewer.`

Behavior:
- Starts collapsed or short if category/severity can be submitted with summary only.
- Expands naturally for long text.
- Keyboard must not hide submit controls without a clear way to continue.

## Duplicate Guidance
Duplicate awareness:
- If context includes existing open issues for the delivery, show a compact warning.
- If backend list is available, show count and most relevant open issue summary when role allows.
- If offline, do not claim there are no existing issues.

Copy:
- `There may already be an open issue for this delivery. Review it before creating another report if this is the same problem.`

Actions:
- `View existing issue`
- `Continue with new issue`

Rules:
- Do not block new issue creation when a distinct issue exists.
- Do not reveal restricted issue summaries.
- Do not merge issues from mobile field UI.
- Do not auto-close or resolve existing issues.

## Online Submit Flow
Preflight:
- Auth session is valid.
- Delivery context exists.
- Principal can access delivery.
- Category is selected.
- Severity is selected.
- Summary is valid.
- Description is valid or blank.
- Idempotency key exists.
- If P1 selected, confirmation completed.

Submission:
- Set state `submitting`.
- Disable duplicate submit.
- Send `POST /v1/issues`.
- Include `Idempotency-Key`.
- Send `deliveryId`, `category`, `severity`, `summary`, and optional `description`.
- Parse `issueResponseSchema`.
- Set state `submitted`.
- Invalidate delivery issue/timeline context where implemented.

Submitted state:
- Show issue ID.
- Show status `open`.
- Show category and severity.
- Explain that delivery status was not changed by issue creation.
- Primary action: open delivery.
- Secondary action: open support or back to role workflow.

Submission must not:
- Transfer custody.
- Change delivery status.
- Resolve a delivery blocker.
- Escalate issue.
- Create a refund.
- Include sensitive raw values.

## Offline Queue Flow
Offline issue creation is allowed only when required fields are valid and local queue policy allows `create_issue`.

Queue preflight:
- Required fields are valid.
- Delivery ID is known.
- Actor ID and role are known.
- Idempotency key exists.
- Request fingerprint exists.
- Payload can be stored securely.
- Local SQLite queue is available.

Queue action:
- Store local queued action with `operationId` `create_issue`.
- Store route key.
- Store idempotency key.
- Store request fingerprint.
- Store redacted payload summary.
- Store sensitive payload in secure local payload store.
- Mark status `queued`.
- Route to queued result state.

Queued result copy:
- `Issue saved on this device`
- `It will appear in support after the offline outbox syncs successfully. Delivery status has not changed yet.`

Actions:
- `Open offline outbox`
- `Back to delivery`
- `Keep working`

Offline rules:
- Do not show queued issue as submitted.
- Do not show issue ID until backend confirms.
- Do not clear form until local write succeeds.
- Do not queue if secure payload store fails.
- Do not queue P1 without confirmation.

## Error Mapping
`VALIDATION_ERROR`:
- State: `validation_error`.
- Show field-level messages when details map to fields.
- Otherwise show form-level message.

`FORBIDDEN`:
- State: `not_authorized`.
- Explain that the current role cannot report on this delivery.
- Route to delivery, role home, or support.

`NOT_FOUND`:
- State: `not_found`.
- Explain that delivery was not found or no longer accessible.
- Route back.

`ROUTE_NOT_ENABLED`:
- State: `blocked`.
- Show support route.

`PAYMENT_REQUIRED`:
- State: `blocked`.
- Explain payment state blocks this operation if backend returns it.
- Route to delivery detail.

`INVALID_STATUS_TRANSITION`:
- State: `blocked`.
- Issue creation should rarely hit this; show support route if it does.

`PHONE_VERIFICATION_REQUIRED`:
- State: `blocked`.
- Do not handle receiver verification here.
- Route to delivery or support.

`PACKAGE_SCAN_MISMATCH`:
- State: `blocked`.
- Route to scan or custody chain.

`RATE_LIMITED`:
- State: `rate_limited`.
- Show retry time if available.
- Allow offline queue only if the request was not accepted and policy allows local queueing.

`INTERNAL_ERROR`:
- State: `api_error`.
- Allow retry or offline queue if safe.

Network timeout:
- State: `api_error` or `offline`.
- Retry with same idempotency key.
- Do not rotate request body.

## State Matrix
`loading_context`:
- Show skeleton header and form shell.
- Do not allow submit.

`ready`:
- Show form with required fields.
- Submit disabled until valid.

`dirty`:
- Show unsaved changes guard on back.
- Submit enabled when valid.

`submitting`:
- Disable inputs and duplicate submit.
- Announce progress.

`submitted`:
- Show issue ID and status.
- Explain next steps.

`queued_offline`:
- Show local queue confirmation.
- Provide outbox route.

`blocked`:
- Show blocker reason and safe route.
- Disable submit.

`validation_error`:
- Show field errors and form summary.
- Move focus to first invalid field or error summary.

`duplicate_possible`:
- Show existing issue guidance.
- Let user view existing issue or continue.

`not_found`:
- Show delivery unavailable.
- Offer back and support.

`not_authorized`:
- Show access issue.
- Offer role home or support.

`session_expired`:
- Prompt sign-in.
- Preserve draft locally only if security policy allows.

`rate_limited`:
- Show wait guidance.
- Keep idempotency key.

`offline`:
- Allow offline queue if valid and policy allows.
- Otherwise save local draft if supported.

`stale_context`:
- Show stale warning.
- Let user refresh.
- Permit submit only after user acknowledges stale context if issue is still valid.

`api_error`:
- Show retry and queue options when safe.

## Form Validation
Form-level validation:
- Category required.
- Severity required.
- Summary required.
- Summary length `5` to `160`.
- Description length `5` to `500` when not blank.
- P1 confirmation required.

Field-level behavior:
- Validate on blur and submit.
- Do not show all errors before user interaction unless submit was attempted.
- Error summary appears above submit after submit attempt.
- Error summary links or focuses each invalid field where platform supports it.

Error copy:
- `Choose the issue category.`
- `Choose the issue severity.`
- `Summary must be at least 5 characters.`
- `Summary must be 160 characters or fewer.`
- `Details must be at least 5 characters or left blank.`
- `Details must be 500 characters or fewer.`
- `Confirm P1 severity before submitting.`

Submit enablement:
- Disabled until required fields are valid.
- Disabled while submitting.
- Disabled when context is blocked.
- Disabled if session expired.
- Disabled if delivery access is not authorized.

## Copy System
Voice:
- Direct.
- Calm.
- Operational.
- Evidence-aware.
- No blame.

Primary headlines:
- `Report issue`
- `Choose issue type`
- `Set severity`
- `Add short summary`
- `Issue submitted`
- `Issue saved on this device`
- `Cannot submit issue`

Submission copy:
- Online success: `Issue submitted. Support can now review it. Delivery status and custody were not changed by this report.`
- Offline success: `Issue saved on this device. It will be submitted when the offline outbox syncs.`
- Error: `The issue was not submitted. Review the message below and try again.`

Button copy:
- `Submit issue`
- `Submit P1 issue`
- `Queue issue offline`
- `Open offline outbox`
- `Open delivery`
- `Open custody chain`
- `Open scan`
- `View existing issue`
- `Contact support`
- `Discard draft`

Avoid:
- Vague encouragement.
- Blame language.
- Promises that support has acted before backend confirms.
- Copy that says the delivery was fixed by reporting an issue.

## Layout And Interaction
Mobile layout:
- Full-screen route under operations shell.
- Header shows delivery context.
- Form sections are vertically stacked.
- Category and severity controls use large touch areas.
- Summary and description use clear labels above inputs.
- Submit remains reachable after keyboard interactions.

Keyboard behavior:
- Next key moves from summary to description.
- Submit does not hide behind keyboard.
- Back from keyboard returns focus without losing draft.

Back behavior:
- If pristine, back returns immediately.
- If dirty, show discard-draft confirmation.
- If submitted, back returns to delivery or source route.
- If queued, back returns to outbox or source route depending entry.

Draft behavior:
- Preserve draft during navigation to delivery/custody context where possible.
- Clear draft after backend submission or successful local queue write.
- Do not persist draft across sign-out unless security policy explicitly allows encrypted draft storage.

## Privacy And Security
Display rules:
- Show tracking code when allowed.
- Show safe station names.
- Show role-safe status and custody role.
- Hide receiver phone.
- Hide receiver precise address.
- Hide raw package scan code.
- Hide raw proof reference.
- Hide payment provider reference.
- Hide local media paths.

Input guidance:
- Tell users not to enter sensitive raw values.
- Do not prevent submission solely because text resembles an ID unless validation policy exists.
- Redact known sensitive patterns from analytics.

Storage:
- Online submit sends only request schema fields.
- Offline queue stores sensitive payload securely where supported.
- Redacted summary is used in outbox.
- Draft storage is encrypted if persisted.

Authorization:
- Backend remains authority for issue creation scope.
- Frontend hides issue route when role obviously cannot act, but still handles backend `FORBIDDEN`.
- Do not infer admin capabilities from UI-only role labels.

## Accessibility Requirements
Screen reader:
- Announce title, delivery context, and form purpose.
- Required fields are programmatically marked.
- Category and severity controls announce selected state.
- Error summary is announced after submit attempt.
- Field errors are associated with fields.
- Submit success and offline queue success are announced as status messages.

Focus:
- Initial focus lands on title.
- After submit attempt with errors, focus moves to error summary.
- After successful submit, focus moves to success heading.
- P1 confirmation sheet traps focus and returns focus correctly.
- Dirty draft confirmation traps focus.

Touch:
- Category and severity controls meet target-size requirements.
- Submit and secondary actions are not icon-only.
- Destructive discard-draft action is separated from submit.

Visual:
- Errors do not rely on color alone.
- Severity does not rely on color alone.
- Large text preserves category and severity meaning.
- High contrast mode keeps form fields and states distinct.

Motion:
- Respect reduced motion.
- Use text status, not animation, as the primary feedback.

Localization:
- Avoid idioms.
- Keep labels clear.
- Use character count behavior that supports localized strings.
- Do not concatenate field names into brittle error sentences.

## Analytics And Observability
Required analytics events:
- `ops_issue_create_viewed`
- `ops_issue_create_context_refreshed`
- `ops_issue_create_category_selected`
- `ops_issue_create_severity_selected`
- `ops_issue_create_p1_confirm_viewed`
- `ops_issue_create_p1_confirmed`
- `ops_issue_create_submit_started`
- `ops_issue_create_submitted`
- `ops_issue_create_submit_failed`
- `ops_issue_create_queued_offline`
- `ops_issue_create_duplicate_guidance_viewed`
- `ops_issue_create_existing_issue_opened`
- `ops_issue_create_discard_draft`

Allowed analytics fields:
- `deliveryId`
- `sourceRoute`
- `category`
- `severity`
- `actorRole`
- `networkState`
- `isOfflineQueued`
- `hasDescription`
- `summaryLengthBucket`
- `errorCode`
- `requestId`
- `issueId` after backend confirms

Do not send:
- Summary text.
- Description text.
- Receiver phone.
- Receiver address.
- Package scan code.
- Proof reference.
- Payment provider reference.
- Local media path.
- Idempotency key.
- Request fingerprint.

Operational metrics:
- Issue create rate by role.
- Issue create rate by category.
- P1 rate by station or route.
- Submit success rate.
- Offline queued issue count.
- Rate-limit count.
- Validation failure count by field.
- Duplicate guidance shown count.

## Performance Requirements
Initial render:
- Render route shell and form skeleton immediately.
- Delivery context loads within normal API budget.
- Local draft restoration must not block initial title.

Form:
- Field validation runs locally.
- Character count updates without lag.
- Large text and multiline input remain smooth.

Submit:
- Disable duplicate submit immediately.
- Keep request in one idempotent mutation.
- Timeout gracefully.
- Retry with same idempotency key.

Offline queue:
- Local queue write must be durable before success state.
- If secure storage fails, do not show queued state.
- Outbox indicator updates after queue write.

## Test IDs
Primary:
- `screen-ops-issue-create`

Header:
- `ops-issue-create-title`
- `ops-issue-create-delivery`
- `ops-issue-create-status`
- `ops-issue-create-custody`
- `ops-issue-create-freshness`
- `ops-issue-create-source-reason`

Triage:
- `ops-issue-create-triage-strip`
- `ops-issue-create-category-state`
- `ops-issue-create-severity-state`
- `ops-issue-create-summary-state`
- `ops-issue-create-readiness-state`

Category:
- `ops-issue-create-category-delay`
- `ops-issue-create-category-damage`
- `ops-issue-create-category-loss`
- `ops-issue-create-category-payment`
- `ops-issue-create-category-handoff`
- `ops-issue-create-category-other`
- `ops-issue-create-category-error`

Severity:
- `ops-issue-create-severity-p1`
- `ops-issue-create-severity-p2`
- `ops-issue-create-severity-p3`
- `ops-issue-create-severity-error`
- `ops-issue-create-p1-sheet`
- `ops-issue-create-p1-confirm`
- `ops-issue-create-p1-review`

Fields:
- `ops-issue-create-summary`
- `ops-issue-create-summary-count`
- `ops-issue-create-summary-error`
- `ops-issue-create-description`
- `ops-issue-create-description-count`
- `ops-issue-create-description-error`
- `ops-issue-create-error-summary`

Actions:
- `ops-issue-create-submit`
- `ops-issue-create-queue-offline`
- `ops-issue-create-open-delivery`
- `ops-issue-create-open-custody-chain`
- `ops-issue-create-open-scan`
- `ops-issue-create-open-outbox`
- `ops-issue-create-contact-support`
- `ops-issue-create-discard-draft`

Duplicate:
- `ops-issue-create-duplicate-warning`
- `ops-issue-create-view-existing`
- `ops-issue-create-continue-new`

States:
- `ops-issue-create-loading`
- `ops-issue-create-ready`
- `ops-issue-create-submitting`
- `ops-issue-create-submitted`
- `ops-issue-create-queued-offline`
- `ops-issue-create-blocked`
- `ops-issue-create-validation-error`
- `ops-issue-create-not-found`
- `ops-issue-create-not-authorized`
- `ops-issue-create-session-expired`
- `ops-issue-create-rate-limited`
- `ops-issue-create-offline`
- `ops-issue-create-stale-context`
- `ops-issue-create-api-error`

## API Integration Notes
Load flow:
- Read `deliveryId` from route.
- Load authenticated session.
- Fetch delivery context if online.
- Load safe local cached delivery context if offline.
- Read entry context from navigation state.
- Preselect category/severity only when context is strong.
- Render form.

Online submit flow:
- Build request from form.
- Create or reuse idempotency key for this draft.
- Send `POST /v1/issues`.
- Parse `issueResponseSchema`.
- Clear local draft.
- Invalidate delivery issue/timeline data.
- Show submitted state.

Offline queue flow:
- Build same request body.
- Persist idempotency key.
- Persist request fingerprint.
- Store redacted payload summary.
- Store sensitive payload securely.
- Insert local queue row with `operationId` `create_issue`.
- Show queued state.

Refresh flow:
- Refresh delivery detail.
- Refresh issue list if endpoint is available for this context.
- Keep dirty draft intact.
- Update stale warning.

Error flow:
- Parse `apiErrorResponseSchema`.
- Map field errors where possible.
- Keep draft.
- Keep idempotency key for retry.

## QA Acceptance Criteria
Functional:
- Delivery context renders for valid route.
- Category is required.
- Severity is required.
- Summary is required.
- Summary minimum and maximum length enforce backend contract.
- Description minimum and maximum length enforce backend contract when provided.
- Submit is disabled while invalid.
- P1 requires confirmation.
- Online submit sends `POST /v1/issues`.
- Online submit sends `Idempotency-Key`.
- Submitted state parses `issueResponseSchema`.
- Submitted state shows issue ID and status open.
- Submitted state does not imply delivery status changed.
- Offline valid issue can queue when policy allows.
- Offline queued state does not show issue ID.
- Rate limit keeps same idempotency key.
- Existing issue guidance can be shown without blocking distinct issue.
- Dirty draft back flow asks before discarding.

Backend alignment:
- Request uses `createIssueRequestSchema`.
- Response uses `issueResponseSchema`.
- `FORBIDDEN` maps to not authorized.
- `NOT_FOUND` maps to delivery unavailable.
- `VALIDATION_ERROR` maps to field/form validation.
- `RATE_LIMITED` maps to wait/retry guidance.
- Mutating submit supports idempotent retry.

Security:
- Receiver phone does not render.
- Receiver precise address does not render.
- Raw scan code does not render.
- Raw proof reference does not render.
- Payment provider reference does not render.
- Analytics excludes summary and description text.
- Offline outbox row uses redacted summary.

Accessibility:
- Required fields are announced.
- Category/severity selected states are announced.
- Error summary is announced.
- Field errors are associated.
- P1 confirmation is accessible.
- Submit success is announced.
- Offline queued state is announced.
- Large text does not break the form.

Resilience:
- Network timeout preserves draft.
- Retry reuses idempotency key.
- App restart can preserve draft only under secure policy.
- Local queue write failure does not show queued state.
- Backend context refresh failure keeps draft intact.

## Visual Quality Checklist
Before handoff, confirm:
- The screen feels like a serious operations report, not a generic contact form.
- The delivery context is visible without exposing private data.
- Category and severity feel deliberate and easy to scan.
- P1 has enough friction to protect operations quality.
- Summary guidance makes reports more useful.
- Offline queueing is clear and not confused with submitted state.
- Error states are calm and specific.
- The form remains usable under one-handed mobile conditions.

## Implementation Guardrails For Claude Code
Build this as an issue intake screen only when frontend work begins.

Implementation rules:
- Keep issue form schema aligned with `createIssueRequestSchema`.
- Keep field validation shared between online and offline submit.
- Keep idempotency key stable for a draft.
- Keep offline queue serialization centralized.
- Keep redaction centralized.
- Keep P1 confirmation explicit.
- Keep delivery context fetching separate from form state.
- Never mutate delivery state from this route.
- Never submit issue creation without backend response parsing.
- Never clear draft before backend success or local queue success.

Suggested file ownership:
- Screen route owns orchestration and navigation.
- Form component owns category, severity, summary, description, and validation display.
- Triage strip owns readiness state.
- Issue service owns online submit.
- Outbox service owns offline queue write.
- Redaction helper owns safe context and analytics payload.
- Context header owns delivery summary rendering.

Required implementation tests:
- Required category validation.
- Required severity validation.
- Summary min and max validation.
- Description min and max validation.
- P1 confirmation gate.
- Online submit request shape.
- Idempotency key reuse on retry.
- Submitted state after parsed response.
- Offline queue row shape.
- Offline queued state copy.
- Forbidden state.
- Not found state.
- Rate-limited state.
- Analytics redaction.
- Dirty draft guard.

## Open Decisions
No product-blocking decisions remain for this screen.

Implementation may choose:
- Exact control style for category and severity.
- Exact draft retention duration.
- Exact duplicate issue display when issue list endpoint is wired into mobile.
- Exact stale-context timeout.
- Exact support fallback route when issue creation is blocked.

Future backend/platform improvement:
- Add a typed `list issues by delivery` mobile contract with role-safe summaries so duplicate guidance can be more precise without exposing restricted support detail.

## Final Handoff Notes
`OpsIssueCreate` is the field intake point for operational truth. It must make reports fast, structured, safe, and idempotent.

The safest implementation treats issue creation as a structured backend record, not a chat message, and keeps delivery status/custody unchanged until the proper operational workflow changes them.

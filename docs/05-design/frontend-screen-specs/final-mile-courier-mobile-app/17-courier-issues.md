# CourierIssues Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierIssues` |
| Route | `/(ops)/courier/issues` |
| Primary test ID | `screen-courier-issues` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `list_issues`, `create_issue`, optional `get_issue`, optional `get_delivery`, optional `list_deliveries` for delivery selection |
| Offline critical | Yes |
| Required role | `final_mile_courier` |
| Primary mutation | `create_issue` through `POST /v1/issues` |
| Supporting reads | `list_issues`, `get_issue`, `get_delivery`, `list_deliveries`, local offline outbox |
| Parent screens | `CourierHome`, `CourierAssignmentDetail`, `CourierRoute`, `CourierProofCapture`, `CourierFailedAttempt`, `CourierReturnToStation`, `CourierCompletedJobs`, `CourierEarnings` |
| Related screens | `OpsIssueCreate`, `OpsSupport`, `OpsOfflineOutbox`, `OpsActionRecovery`, `AdminIssueQueue`, `AdminIssueDetail` |
| Current implementation mode | Delivery-scoped issue list and issue creation; no courier chat, resolution, escalation, or unscoped account-ticket API |

## Outcome
`CourierIssues` lets a final-mile courier view and report delivery-scoped final-mile issues with enough structure for support and operations to act.

The screen must answer:
- `Which issues are open for my accessible deliveries?`
- `Which delivery is this issue about?`
- `What type of issue is it?`
- `How urgent is it?`
- `What short details does support need?`
- `Can this report be submitted now or queued offline?`
- `What happened after I submitted it?`
- `What can I do if this is actually a failed attempt, proof problem, return problem, or earnings question?`
- `Why can I not create a general support ticket without a delivery?`

This is not a generic help center. It is a field-operations issue console tied to delivery custody, proof, return, and earnings support.

## Product Definition
This screen allows couriers to:
- View issues for deliveries they can access.
- Filter issues by active, review, escalated, resolved, closed, severity, and category.
- Open a read-only issue detail when available.
- Start a delivery-scoped issue report.
- Select or confirm the delivery context before submission.
- Select backend-supported category and severity.
- Add summary and optional details within backend limits.
- Submit online with idempotency.
- Queue issue creation offline when all required fields are complete.
- See queued, sending, submitted, failed, duplicate-risk, and stale-context states.
- Navigate to completed jobs, assignments, return guidance, or earnings when the issue source belongs there.

It does not allow couriers to:
- Create an issue without a `deliveryId`.
- Resolve, close, or escalate an issue.
- Mutate delivery status.
- Transfer custody.
- Mark a package delivered.
- Mark a return complete.
- Upload proof files.
- Create issue comments.
- Start live chat.
- Call admin issue endpoints.
- View internal admin notes.
- View other couriers' issues.
- View receiver phone by default.
- Use this screen as a refund approval flow.

## Users
Primary:
- Final-mile couriers reporting doorstep, receiver, package, proof, return, handoff, delay, or earnings-related delivery issues.

Secondary:
- Support admins triaging issue queues.
- Ops admins reviewing severe final-mile incidents.
- Station operators receiving return or custody context.
- Finance operators reviewing payment or earnings-linked issues.
- QA validating offline support behavior and access boundaries.

## Entry Points
The screen can open from:
- `CourierHome` support card.
- `CourierAssignmentDetail` report issue action.
- `CourierRoute` safety, access, delay, or receiver blocker.
- `CourierProofCapture` proof capture failure path.
- `CourierOtpCompletion` OTP support path.
- `CourierSignatureProof` signature refusal support path.
- `CourierPhotoProof` proof fallback support path.
- `CourierFailedAttempt` escalation path.
- `CourierReturnToStation` blocked return escalation.
- `CourierCompletedJobs` completed delivery support link.
- `CourierEarnings` earnings question link.
- `OpsOfflineOutbox` queued issue recovery.
- Push or notification entry for `issue_updated`.

## Real-World Context
Couriers will use this screen while carrying a package, walking to a receiver, waiting near a gate, returning to a station, or reconciling a completed job. The UI must assume poor network, time pressure, safety risk, bright outdoor light, and short attention windows.

The screen must support:
- One-handed use.
- Immediate delivery context.
- Safe-stop warning before long typing.
- Low-bandwidth issue listing.
- Offline queued creation.
- Clear severity discipline.
- Duplicate-risk awareness.
- No confusion between support reporting and delivery lifecycle actions.

## User Goal
Primary goal:
- Report or review a final-mile issue without losing delivery context.

Secondary goals:
- Protect package custody evidence.
- Explain proof, receiver, return, package, delay, or earnings problems clearly.
- Preserve a report when offline.
- Know when an issue is already open.
- Avoid using support when a structured failed-attempt or proof flow is required.

## Scope
In scope:
- Issue list.
- Issue filters.
- Issue detail summary.
- Delivery selection for issue creation.
- Category selection.
- Severity selection.
- Summary and optional description.
- Idempotent submit.
- Offline queue.
- Existing issue warning.
- Stale delivery context warning.
- Post-submit success state.
- Sync failure recovery.
- Routing to relevant courier workflows.

Out of scope:
- Support chat.
- Issue comments.
- Attachment upload.
- Proof asset upload.
- Issue resolution.
- Issue escalation.
- Admin assignment.
- Refund approval.
- Customer payment adjustment.
- Courier payout adjustment.
- Station receipt confirmation.
- Delivery lifecycle mutation.
- Account-only support tickets.

## Design Thesis
This screen should feel like a serious field support console: fast to open, precise under stress, strict about delivery scope, and visually calm enough for high-consequence issue reporting.

Design principles:
- Delivery context comes before the form.
- Severity is a responsibility, not decoration.
- Offline queueing is transparent and never masquerades as server success.
- The screen must route users to structured courier flows when issue creation is the wrong action.
- Reporting should be quick, but vague reports should be hard to submit.
- Active issues should be easy to scan without becoming a chat inbox.

Visual thesis:
- `incident desk in the pocket`: compact context cards, high-contrast severity rails, sober status chips, strong bottom action, and field-safe copy.

Restraint rule:
- No chat bubbles, agent avatars, maps, confetti, decorative incident graphics, or broad help-center article grids.

## Research Inputs
Relevant external references:
- [Uber driver support options](https://help.uber.com/driving-and-delivering/article/support-options-for-drivers?nodeId=c5b8be6d-d836-4b06-9c04-1bad02fb1bad): supports in-app help entry, category-led support routing, specific issue selection, and agent contact after structured self-routing.
- [DoorDash Dasher support](https://dasher.doordash.com/en-us/blog/contact-dasher-support): supports fast support access during live delivery issues and providing delivery details that help support resolve the issue.
- [Material Design text fields](https://m3.material.io/components/text-fields/overview): supports concise helper text, error text, character constraints, and mobile form field behavior.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local-first reads, queued writes, sync retries, and clear backend authority for offline state.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level validation errors for delivery, category, severity, summary, and description.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing list refresh, submit, queued, synced, retry, and error states without moving focus unexpectedly.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for issue rows, filters, category cards, severity choices, and submit actions.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/08-courier-route.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/14-courier-return-to-station.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/15-courier-completed-jobs.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/16-courier-earnings.md`
- `docs/02-users/support-and-escalation-rules.md`
- `docs/11-ops/customer-support-workflows.md`
- `docs/11-ops/incident-management.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/issues.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Backend Contract
Primary list endpoint:
```http
GET /v1/issues?limit=50
```

Optional list filters:
```http
GET /v1/issues?deliveryId=DEL-123&status=open&severity=p1&limit=50
```

Operation:
```text
list_issues
```

Primary create endpoint:
```http
POST /v1/issues
```

Operation:
```text
create_issue
```

Required create headers:
- Authenticated courier session.
- `Idempotency-Key` for every create request.

Create request:
```json
{
  "deliveryId": "DEL-ACC-KSI-001",
  "category": "handoff",
  "severity": "p2",
  "summary": "Receiver refused signature at gate",
  "description": "Receiver accepted the parcel verbally but refused to sign. I stopped the handoff and opened support."
}
```

Create request constraints:
- `deliveryId` is required.
- `category` is required and must be one of `delay`, `damage`, `loss`, `payment`, `handoff`, `other`.
- `severity` is required and must be one of `p1`, `p2`, `p3`.
- `summary` is required, trimmed, minimum `5`, maximum `160`.
- `description` is optional, trimmed, minimum `5`, maximum `500`.

Create response:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `description` when present
- `reporter.actorId`
- `reporter.actorRole`
- optional escalation fields
- optional resolution fields
- `createdAt`
- `updatedAt`

Server behavior:
- Delivery must exist.
- Courier must be allowed to access the delivery through backend policy.
- New issue starts as `open`.
- Reporter is derived from the authenticated courier.
- Courier cannot set reporter fields.
- Courier cannot set status.
- Courier cannot set escalation fields.
- Courier cannot set resolution fields.
- Issue creation queues `issue_updated` notification behavior on the backend.

Optional issue detail endpoint:
```http
GET /v1/issues/:id
```

Admin-only endpoints that this screen must not call:
- `POST /v1/issues/:id/escalate`
- `POST /v1/issues/:id/resolve`

## Current Backend Boundaries
Supported:
- Authenticated final-mile courier can create issues for deliveries they can access.
- Authenticated final-mile courier can list issues for accessible deliveries.
- List query supports `deliveryId`, `status`, `severity`, and `limit`.
- Create issue is idempotent.
- Issue response includes resolution fields when present.

Not supported:
- General account support ticket without delivery.
- Issue comments.
- File attachments.
- Live support chat.
- Courier-side issue escalation.
- Courier-side issue resolution.
- Courier-side issue closure.
- Category values outside the shared enum.
- Safety-specific category.
- Earnings-specific category.
- Cursor pagination for issue list.
- Direct relation between an earnings ledger row and an issue.

Implementation boundaries:
- Do not create a local-only support system separate from `create_issue`.
- Do not call admin issue endpoints from courier UI.
- Do not mutate delivery status after issue creation.
- Do not infer issue visibility locally when backend denies access.
- Do not hide missing backend support for unscoped earnings questions.

## Delivery Scope Rules
Every created issue must have a delivery.

If route opens with `deliveryId`:
- Load safe delivery context.
- Preselect that delivery.
- Fetch existing issues for that delivery when online.
- If delivery is inaccessible, show access boundary and do not create.

If route opens without `deliveryId`:
- Show issue list first.
- Provide `Report issue` action.
- Ask courier to choose an accessible active or recent delivery before showing the issue form.
- If no accessible delivery exists, show no-delivery boundary state.

If opened from `CourierEarnings`:
- Use query context `reason=earnings_question`.
- Ask the courier to select the delivery connected to the earning question.
- Use backend category `payment`.
- Explain that the current backend does not support account-level earnings tickets.

If opened after assignment is cleared:
- Try issue list or delivery lookup only through backend access.
- If backend denies access, show `Delivery no longer available to this account`.
- Route to completed jobs if accessible.
- Do not bypass access rules with cached private data.

Known backend gap:
- Final-mile support may need a future participant-history access model so couriers can report issues after completion or after failed-attempt assignment clearing. Until that exists, the UI must follow backend access exactly.

## Issue Category Model
Allowed backend categories:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Courier-facing labels:
- `delay`: `Delay`
- `damage`: `Damage`
- `loss`: `Lost or missing`
- `payment`: `Earnings or payment`
- `handoff`: `Handoff or proof`
- `other`: `Other issue`

Courier-facing guidance:
- `delay`: Use when station return, receiver access, traffic, address, or timing blocks progress.
- `damage`: Use when package, label, seal, or visible condition is damaged.
- `loss`: Use when package location or custody is unclear.
- `payment`: Use for courier earnings questions, sender payment blockers, or payment state conflicts.
- `handoff`: Use for OTP, signature, photo proof, custody, station return, or receiver handoff problems.
- `other`: Use only when the issue does not fit the listed categories.

Rules:
- Do not submit without category.
- Do not invent courier-only categories.
- If source route implies a category, preselect it but allow change.
- If source route is proof-related, recommend `handoff`.
- If source route is return-to-station, recommend `handoff`.
- If source route is package condition, recommend `damage`.
- If source route is missing package, recommend `loss`.
- If source route is earnings, recommend `payment`.
- If source route is unsafe and no safety category exists, recommend `other` with P1 guidance and clear summary copy.

## Severity Model
Allowed backend severities:
- `p1`
- `p2`
- `p3`

Courier-facing labels:
- `p1`: `P1 urgent`
- `p2`: `P2 blocked`
- `p3`: `P3 follow-up`

Courier-facing guidance:
- `p1`: Package may be lost, severe custody conflict, safety risk, fraud concern, or urgent operations review.
- `p2`: Delivery is blocked or materially delayed, but package location is known.
- `p3`: Non-urgent follow-up, minor issue, clarification, or earnings question that does not block delivery.

Rules:
- Severity must start unset unless source context safely recommends one.
- P1 requires a confirmation panel.
- P1 confirmation must explain operational impact.
- P1 must be easy to choose when safety, loss, or severe custody risk exists.
- P3 must not be used for active package loss or unsafe field conditions.
- The UI must not use color alone for severity.

P1 confirmation copy:
- Title: `Confirm urgent issue`
- Body: `Use P1 when this delivery needs immediate operations attention because of safety, package loss, severe custody conflict, or fraud risk.`
- Primary action: `Submit P1 issue`
- Secondary action: `Review severity`

## Issue Status Model
Backend statuses:
- `open`
- `in_review`
- `escalated`
- `resolved`
- `closed`

Courier-facing labels:
- `open`: `Open`
- `in_review`: `In review`
- `escalated`: `Escalated`
- `resolved`: `Resolved`
- `closed`: `Closed`

List grouping:
- Active: `open`, `in_review`, `escalated`
- Done: `resolved`, `closed`

Rules:
- Couriers can view status but cannot change it.
- Resolution fields are read-only.
- Closed issues remain visible only when backend returns them.
- Escalated status does not expose internal owner or admin notes.

## Information Architecture
Default screen order:
- Header.
- Connectivity and queued issue banner.
- Active issue summary strip.
- Filter tabs.
- Issue list.
- Empty or unavailable state.
- Bottom action `Report issue`.

Report flow order:
- Delivery context.
- Existing issue warning.
- Source guidance.
- Category selection.
- Severity selection.
- Summary field.
- Optional details field.
- Submit panel.
- Offline queue explanation when offline.
- Success or queued state.

Issue detail order:
- Status and severity header.
- Delivery context.
- Category and summary.
- Description when present.
- Created and updated timestamps.
- Reporter role.
- Resolution section when present.
- Actions to open delivery, report another issue, or return to list.

## Header
Content:
- Title: `Issues`
- Subtitle: `Final-mile support`
- Optional status chip:
  - `Offline`
  - `Queued`
  - `Refreshing`
  - `Cached`

Rules:
- Header must not look like a chat inbox.
- Header must keep the primary action visible.
- If a queued issue exists, surface it above filters.

## Connectivity Banner
Online clean state:
- No banner.

Offline with cached list:
- Copy: `Offline. Showing saved issues. New reports can be saved locally when complete.`

Offline without cached list:
- Copy: `Offline. Issue list cannot refresh, but you can prepare a delivery-scoped report if the delivery is already saved on this device.`

Queued issue exists:
- Copy: `1 issue waiting to send.`
- Action: `Open outbox`

Failed queued issue:
- Copy: `An issue could not send. Review it before retrying.`
- Action: `Review`

Rules:
- Do not call queued issue a created issue until server returns `issueId`.
- Do not hide sync failures under generic offline copy.
- Banner changes must be announced.

## Active Issue Summary Strip
Purpose:
- Give couriers immediate awareness of unresolved support state.

Metrics:
- Active issues.
- P1 issues.
- Waiting review.
- Queued reports.

Rules:
- Active issue count comes from `list_issues` response plus local outbox count for clearly labeled queued reports.
- P1 count comes only from server issue rows or queued report metadata.
- If data is cached, show stale state.
- Do not show issue counts from unrelated deliveries.

## Filter Tabs
Required filters:
- `Active`
- `All`
- `P1`
- `Queued`
- `Resolved`

Optional filter sheet:
- Status.
- Severity.
- Category.
- Delivery.

Rules:
- `Active` includes `open`, `in_review`, `escalated`.
- `Queued` includes local outbox issue actions only.
- `Resolved` includes `resolved` and `closed`.
- Server filters may use `status` and `severity`.
- Category filtering is client-side unless backend adds category query support.
- Selected filter must be visually and programmatically exposed.

## Issue List Row
Each row must show:
- Severity label.
- Status label.
- Category label.
- Summary.
- Tracking code or delivery identifier when safe.
- Updated timestamp.
- Queued or cached marker when relevant.
- Tap affordance.

Optional row details:
- Short description preview.
- Resolution label if resolved.
- Source route label if local queued report includes it.

Rules:
- Row must not expose receiver phone.
- Row must not expose full address.
- Row must not expose admin-only notes.
- Row must not show raw internal event IDs as primary copy.
- Tap target must meet accessible size.
- Rows sort by `updatedAt` descending, with queued unsent items above server rows when filter includes them.

## Issue Detail
Purpose:
- Let courier understand what was reported and current status.

Allowed fields:
- `issueId`
- `deliveryId`
- safe tracking or delivery label when available.
- `status`
- `severity`
- `category`
- `summary`
- `description`
- `createdAt`
- `updatedAt`
- `resolutionCode` if present.
- `resolutionNote` if present and backend returns it.

Not shown:
- Admin actor IDs.
- Escalation actor IDs.
- Closed-by actor IDs.
- Internal staff names.
- Receiver phone.
- Payment provider details.
- Admin-only reasoning.

Actions:
- `Open delivery`
- `Report another issue`
- `Back to issues`

Do not include:
- Resolve issue.
- Close issue.
- Escalate issue.
- Reply.
- Upload file.

## Report Issue Entry
Primary action:
- `Report issue`

Behavior:
- If `deliveryId` exists in route context, open form with selected delivery.
- If no `deliveryId`, open delivery selector first.
- If offline and selected delivery is not cached, block creation and explain why.
- If offline and selected delivery is cached, allow local queued report only if all required fields are complete and access context was previously valid.

Shortcut actions:
- `Report proof issue`
- `Report return issue`
- `Report package issue`
- `Report earnings issue`

Rules:
- Shortcuts only prefill category, severity guidance, and source context.
- Shortcuts do not submit automatically.
- User must review all required fields.

## Delivery Selector
Purpose:
- Enforce delivery scope before issue creation.

Data source:
- Active route context.
- Cached assignment detail.
- `GET /v1/deliveries?limit=100` or role-specific accessible delivery source.
- Completed jobs link where accessible.

Row fields:
- Tracking code.
- Status.
- Latest timestamp.
- Origin and destination station IDs when safe.
- Doorstep indicator.

Rules:
- Search locally by tracking code or receiver display name only if receiver display name is already available from authorized data.
- Do not expose receiver phone.
- Do not let the user type arbitrary delivery IDs as the primary flow.
- If a typed tracking code fallback is added later, backend must verify access before form opens.
- If no delivery is available, show boundary state.

No delivery boundary:
- Title: `Choose a delivery first`
- Body: `Kra issues must be linked to a delivery so support can verify custody, proof, and station context.`
- Primary action: `View assignments`
- Secondary action: `View completed jobs`

## Existing Issue Warning
When selected delivery has active issues:
- Show compact warning above the form.
- List active issue summaries.
- Provide `Open existing issue`.
- Allow `Continue with new issue` only after clear user choice.

Copy:
- Title: `There is already an active issue for this delivery`
- Body: `Open it first unless this is a different problem. Duplicate reports can slow triage.`

Rules:
- Do not block all new issues.
- Do not auto-merge issues.
- Do not silently reuse old issue IDs.
- If offline and existing issue state is stale, say so.

## Source Guidance
The form must guide couriers away from support when a structured workflow is more accurate.

Examples:
- If delivery can still complete through OTP, route back to OTP completion.
- If proof capture is the immediate problem, route to proof screen or proof fallback.
- If doorstep failed attempt should be recorded, route to `CourierFailedAttempt`.
- If package must return to station, route to `CourierReturnToStation`.
- If earnings ledger is unavailable, explain delivery-scoped issue requirement.

Guidance copy:
- `Use failed attempt when the receiver cannot complete handoff. Use issue reporting when support needs to review a blocker or exception.`

Rules:
- Guidance can recommend a route, but must not hide issue reporting for severe safety, loss, or custody conflicts.
- Do not auto-navigate after user has started writing without confirmation.

## Category Selection
UI:
- Two-column card grid on mobile when width allows.
- Single-column list on very small screens.
- Each category has label, one-line description, and selected state.

Required cards:
- Delay.
- Damage.
- Lost or missing.
- Earnings or payment.
- Handoff or proof.
- Other issue.

Field errors:
- `Choose an issue category.`

Rules:
- Category card text must be short.
- Selected category must be visible without relying on color.
- Changing category must not clear summary or description.
- If source context preselects category, label it as recommended until user changes it.

## Severity Selection
UI:
- Three stacked severity options with strong labels and short operational examples.

Required options:
- `P1 urgent`
- `P2 blocked`
- `P3 follow-up`

Field errors:
- `Choose issue urgency.`

Rules:
- P1 requires confirmation.
- P2 is default recommendation only for blocked but known-custody issues.
- P3 is recommended for non-blocking earnings questions or documentation corrections.
- The UI must explain that support can adjust severity later.

## Summary Field
Backend constraints:
- Minimum `5`.
- Maximum `160`.
- Trim before submit.

UI requirements:
- Label: `Short summary`
- Helper: `Write one clear sentence support can scan quickly.`
- Character counter.
- Inline validation.

Good examples:
- `Receiver refused to sign at gate`
- `Package label is torn before handoff`
- `Unable to return package because station is closed`
- `Completed delivery missing from earnings`

Avoid examples in the UI:
- `Help`
- `Problem`
- `Urgent`
- `Call me`

Errors:
- `Summary must be at least 5 characters.`
- `Summary must be 160 characters or fewer.`

## Description Field
Backend constraints:
- Optional.
- If present, minimum `5`.
- Maximum `500`.
- Trim before submit.

UI requirements:
- Label: `Details`
- Helper: `Add facts: what happened, where, and what you already tried.`
- Character counter.
- Multiline input.
- Safe-stop hint when opened from route or active delivery flow.

Safe-stop hint:
- `If you are moving, stop safely before typing details.`

Errors:
- `Details must be at least 5 characters or left empty.`
- `Details must be 500 characters or fewer.`

Privacy warning:
- `Do not include receiver phone numbers, payment codes, or private notes.`

## Submit Panel
Primary action labels:
- Online: `Submit issue`
- Offline with valid form: `Save to send`
- Submitting: `Submitting issue`
- Queued: `Saved to outbox`

Submit prerequisites:
- Delivery selected.
- Category selected.
- Severity selected.
- Summary valid.
- Description valid if present.
- P1 confirmation complete if severity is P1.
- Idempotency key generated and stored.

Rules:
- Disable submit only when required fields are invalid; otherwise allow submit and show server errors after attempt.
- Use the same idempotency key for retrying the same request body.
- If user edits the body after a failed submit, create a new idempotency key.
- Prevent double tap from creating duplicate requests.
- Show request state without moving user unexpectedly.

## Offline Queue Behavior
Offline issue creation is allowed only when:
- Delivery context exists locally.
- The selected delivery was previously available to the courier.
- Required fields are valid.
- Idempotency key is stored.
- Request fingerprint is stored.
- Local action can sync through the shared offline outbox.

Queued record stores:
- Local action ID.
- Idempotency key.
- Request body.
- Request fingerprint.
- Created time.
- Source route.
- User-facing summary.
- Delivery display label.

Queued record must not store:
- Receiver phone.
- Raw proof files.
- Payment provider references.
- Admin-only notes.

Queued state copy:
- Title: `Issue saved to send`
- Body: `This report is saved on this device and will be sent when the connection is stable. It is not visible to support yet.`
- Primary action: `Open outbox`
- Secondary action: `Back to delivery`

Sync success:
- Replace local queued row with server issue row.
- Show returned `issueId`.
- Announce success.

Sync conflict:
- If backend denies access, show recovery state and preserve local text for review.
- If backend returns validation error, open action recovery.
- If backend returns duplicate idempotency result, show returned server issue.

## State Model
Screen states:
- `loading`
- `ready`
- `refreshing`
- `empty`
- `filtered_empty`
- `offline_cached`
- `offline_no_cache`
- `delivery_selecting`
- `form_ready`
- `form_dirty`
- `p1_confirming`
- `submitting`
- `submitted`
- `queued_offline`
- `sync_failed`
- `existing_issue_warning`
- `not_authorized`
- `not_found`
- `session_expired`
- `rate_limited`
- `server_error`

Rules:
- State changes must not erase user-entered text unless submit succeeded.
- Back from form with dirty fields must ask before discarding.
- Offline transition must preserve form data.
- Re-authentication must preserve draft locally when safe.

## Empty States
No active issues:
- Title: `No active issues`
- Body: `Open issues for your assigned or accessible deliveries will appear here.`
- Primary action: `Report issue`

No issues at all:
- Title: `No issues yet`
- Body: `If something blocks a delivery, report it with the delivery attached.`
- Primary action: `Report issue`

Filtered empty:
- Title: `No issues match this filter`
- Body: `Try another status, severity, or category.`
- Primary action: `Show active`

No delivery available:
- Title: `No delivery to attach`
- Body: `You need an accessible delivery before creating an issue.`
- Primary action: `View assignments`
- Secondary action: `View completed jobs`

## Error States
Session expired:
- Title: `Sign in again`
- Body: `Your session expired. Sign in to view or report issues.`
- Action: `Sign in`

Forbidden:
- Title: `Issue access unavailable`
- Body: `You do not have access to this delivery's issues.`
- Action: `Back to issues`

Delivery not found:
- Title: `Delivery not found`
- Body: `This issue cannot be created because the delivery was not found.`
- Action: `Choose another delivery`

Validation error:
- Title: `Check the issue details`
- Body: `Fix the highlighted fields and submit again.`

Rate limited:
- Title: `Try again shortly`
- Body: `Too many issue requests were sent. Wait a moment before retrying.`

Server error:
- Title: `Could not submit issue`
- Body: `Your report was not created. Try again or save it to send when available.`

List load error:
- Title: `Could not load issues`
- Body: `Refresh or report a new delivery-scoped issue if needed.`

## Business Rules
Issue creation:
- Must be delivery-scoped.
- Must use backend category enum.
- Must use backend severity enum.
- Must create `open` issue only.
- Must submit with idempotency.
- Must not mutate delivery lifecycle.
- Must not transfer custody.
- Must not create proof.
- Must not mark return complete.

Issue listing:
- Must respect backend access.
- Must default to active issues.
- Must include queued local reports when relevant and clearly labeled.
- Must not mix admin queue with courier queue.
- Must not expose inaccessible delivery issue data.

Earnings issues:
- Use category `payment` until a backend earnings category exists.
- Require delivery selection.
- Do not promise payout adjustment.
- Route users to `CourierEarnings` for ledger visibility.
- State that finance review happens through operations, not through this screen.

Safety issues:
- Use P1 when immediate safety, severe custody risk, loss, or fraud concern exists.
- Encourage safe stop before typing.
- Do not require long description to submit P1.
- If emergency services are needed, the app should not be the only escalation path.

## Navigation Rules
From list:
- `Report issue` opens delivery selector or prefilled form.
- Row tap opens issue detail.
- Filter changes stay on screen.
- Back returns to previous screen or `CourierHome`.

From form:
- Submit success shows submitted state.
- Queued offline shows outbox action.
- Back with dirty fields asks before discard.
- Open delivery returns to the safest available courier delivery detail route.

From success:
- `View issue` opens issue detail.
- `Back to delivery` opens selected delivery.
- `Report another issue` resets form but keeps selected delivery only after explicit user action.

Deep links:
- `/(ops)/courier/issues?deliveryId=DEL-...` opens selected delivery context if accessible.
- `/(ops)/courier/issues?reason=earnings_question` opens report guidance and delivery selector.
- `/(ops)/courier/issues?category=handoff&severity=p2` can preselect values only after delivery is selected.

## Visual System
Layout:
- Single-column mobile layout.
- Header and action remain easy to reach.
- Issue list uses compact high-information rows.
- Report form uses clear sections rather than one long wall of inputs.
- Bottom submit action remains visible when keyboard is closed.

Color:
- Neutral surface for base.
- Amber for P2 and review.
- Red for P1 and failed sync.
- Green only for submitted or resolved.
- Blue or slate for information and queued state.

Typography:
- Issue summaries use strong body weight.
- Status and severity chips use compact labels.
- Form labels are direct.
- Avoid dense paragraphs.

Motion:
- Use short transitions for filter changes.
- Use native keyboard and sheet behavior.
- Avoid animated incident effects.
- Respect reduced motion.

Field ergonomics:
- Category cards and severity cards must be thumb-friendly.
- Summary field appears before description.
- Description field should not dominate the first viewport.
- Error text appears next to the relevant field.

## Copy System
Voice:
- Calm.
- Operational.
- Direct.
- Low-hype.
- Specific.

Approved phrases:
- `Report issue`
- `Delivery required`
- `Saved to send`
- `Not visible to support yet`
- `Open issue`
- `In review`
- `Escalated`
- `Resolved`
- `Use failed attempt for receiver handoff failure`
- `Use support when operations needs to review an exception`

Avoid:
- `Chat with us`
- `Agent is typing`
- `Refund approved`
- `Payout adjusted`
- `Issue closed by courier`
- `Package returned` unless station receipt is verified elsewhere.
- `Support has received this` for offline queued reports.
- `Everything is handled`

## Privacy And Redaction
Do not show:
- Receiver phone.
- Full receiver address.
- OTP values.
- Payment provider references.
- Raw proof asset paths.
- Internal actor IDs as primary copy.
- Admin-only notes.
- Other courier issues.
- Sender private payment information.

Allowed:
- Tracking code.
- Delivery ID when no safer label exists.
- Category.
- Severity.
- Status.
- Summary.
- Courier-written description.
- Resolution note only if backend returns it to courier.

Input warning:
- `Do not include receiver phone numbers, OTPs, payment codes, or private notes.`

## Analytics
Events:
- `courier_issues_viewed`
- `courier_issues_filter_selected`
- `courier_issue_row_opened`
- `courier_issue_report_started`
- `courier_issue_delivery_selected`
- `courier_issue_category_selected`
- `courier_issue_severity_selected`
- `courier_issue_p1_confirmed`
- `courier_issue_submit_attempted`
- `courier_issue_submitted`
- `courier_issue_queued_offline`
- `courier_issue_sync_failed`
- `courier_issue_existing_warning_viewed`
- `courier_issue_existing_opened`
- `courier_issue_route_redirect_clicked`

Required properties:
- `source_route`
- `has_delivery_context`
- `category`
- `severity`
- `status`
- `is_offline`
- `is_queued`
- `has_existing_active_issue`
- `delivery_status`

Forbidden properties:
- Receiver phone.
- OTP.
- Full address.
- Payment provider reference.
- Raw proof path.
- Full free-text description.

## Accessibility
Requirements:
- Root element has `screen-courier-issues`.
- Main heading is first logical heading.
- Filters expose selected state.
- Issue rows have descriptive accessible names.
- Severity is communicated by text and semantics, not color only.
- Category and severity controls are keyboard and switch accessible.
- Field errors are connected to fields.
- Character counters are accessible without being noisy.
- Submit, queued, sync, filter, and refresh changes use status messages.
- Dirty-form confirmation is reachable by keyboard.
- Touch targets meet WCAG minimum and platform mobile guidance.
- Large text does not hide submit or field errors.
- Offline banner is announced when state changes.

Accessible row name pattern:
```text
P2 blocked, handoff issue, open, Receiver refused signature at gate, updated May 20.
```

Accessible submit states:
- `Submit issue, disabled, choose issue urgency.`
- `Submitting issue.`
- `Issue saved to send. Not visible to support yet.`
- `Issue submitted. Issue ID ISS-123.`

## Performance
Requirements:
- Route shell renders immediately.
- Cached issues render before refresh when available.
- Issue list virtualizes after 50 rows.
- Category and severity controls render without remote assets.
- Form input remains responsive on low-end Android devices.
- Avoid heavy rich-text editors.
- Avoid charting libraries.
- Store offline queue writes atomically.

## Security
Requirements:
- Use authenticated courier session.
- Backend is source of truth for access.
- Do not pass arbitrary courier IDs.
- Do not trust route `deliveryId` until backend confirms access.
- Do not log full issue descriptions in analytics.
- Do not store sensitive receiver data in offline queue.
- Do not expose admin endpoints.
- Do not reveal whether an inaccessible delivery exists beyond safe error copy.

## Testing Requirements
Unit tests:
- Renders `screen-courier-issues`.
- Defaults to active filter.
- Maps backend categories to courier-facing labels.
- Maps backend severities to courier-facing labels.
- Maps backend statuses to courier-facing labels.
- Validates summary min and max.
- Validates description min and max when present.
- Requires delivery before submit.
- Requires category before submit.
- Requires severity before submit.
- Requires P1 confirmation.
- Does not show admin actions.
- Does not call escalation or resolution endpoints.

Integration tests:
- Loads accessible issue list.
- Filters active issues.
- Opens issue detail.
- Starts report with route delivery ID.
- Starts report without delivery ID and requires selection.
- Submits online with idempotency key.
- Reuses idempotency key on retry for same body.
- Creates new idempotency key after edited body.
- Queues offline issue with valid delivery context.
- Shows queued report as not visible to support.
- Sync success replaces queued item with server issue.
- Access denied blocks create.
- Existing active issue warning appears.

Accessibility tests:
- Filters expose selected state.
- Field errors are announced.
- Status messages announce refresh, submit, queued, and success.
- Category cards meet touch target size.
- Severity controls are reachable by keyboard.
- Dirty-form dialog traps and restores focus correctly.

Policy tests:
- Issue creation does not mutate delivery status.
- Issue creation does not transfer custody.
- Offline queued issue is not shown as server-created.
- Earnings issue requires delivery selection.
- No receiver phone is rendered.
- No chat UI appears.

## Acceptance Criteria
The screen is acceptable when:
- `/(ops)/courier/issues` renders for authenticated final-mile couriers.
- `screen-courier-issues` is present.
- Active issues load from `list_issues`.
- Report flow uses `create_issue`.
- Report flow always requires a delivery.
- Online submit sends `Idempotency-Key`.
- Offline submit stores a queued report with clear not-yet-sent status.
- Courier cannot resolve, close, or escalate issues.
- Courier cannot create account-only support tickets.
- Existing issue warning prevents careless duplicates.
- P1 severity requires confirmation.
- Issue creation never claims delivery status changed.
- The UI handles no delivery, forbidden, not found, validation, rate limit, server error, offline, and sync failure states.

## Implementation Notes For Claude Code
Build this as a production route and shared issue-report shell for final-mile couriers.

Use:
- `list_issues` for the list.
- `create_issue` for report submission.
- `get_issue` if issue detail route or panel needs refresh.
- `get_delivery` or cached route data for delivery context.
- Shared offline outbox for queued create requests.

Do not use:
- `escalate_issue`
- `resolve_issue`
- Admin issue queue endpoints.
- Payment refund endpoints.
- Courier earnings math.
- Delivery lifecycle mutations from this screen.

If route lacks delivery context:
- Show issue list and delivery selector before form.
- Do not show a freeform account ticket form.

If backend denies issue access:
- Respect the denial.
- Do not fall back to cached private details.

## Open Backend Work
Potential future improvements:
- Participant-history issue access for couriers after completion or assignment clearing.
- Category `safety` if operations wants explicit safety triage.
- Category `earnings` if finance wants separate courier earnings issue routing.
- Issue comments or support messages if product later adds threaded support.
- Attachment support for issue evidence.
- Cursor pagination for large issue lists.
- Issue category filter on backend.
- Delivery issue count in delivery list rows.

None of these are required to build the current screen safely.

## Open Product Work
Decisions to confirm before broad rollout:
- Whether safety issues should use `other` or a future dedicated category.
- Whether earnings questions should remain `payment` or become a dedicated category.
- Whether couriers can see resolved issue notes after closure.
- Whether issue reports should appear in receiver or sender timelines.
- Whether P1 issue creation should trigger immediate phone escalation outside the app.
- Whether final-mile issue access should persist after delivery completion.

## Quality Bar
This spec is not closed unless the resulting UI:
- Feels faster than a help desk form.
- Feels more accountable than a chat inbox.
- Keeps delivery context attached to every report.
- Makes offline queueing unmistakable.
- Prevents unsupported support behavior.
- Protects receiver privacy.
- Routes structured delivery failures back to the right courier workflow.
- Gives support enough data to triage without requiring long typing in the field.

## Handoff Checklist
- Screen contract is complete.
- Backend boundaries are explicit.
- Delivery scope rule is explicit.
- Issue category model is complete.
- Severity model is complete.
- Status model is complete.
- List behavior is complete.
- Report behavior is complete.
- Offline queue behavior is complete.
- Error states are complete.
- Accessibility requirements are complete.
- Security boundaries are complete.
- Tests reject unsupported admin actions and unscoped issue creation.

## Final Self-Review
Backend honesty:
- Pass. The spec only uses `list_issues`, `create_issue`, optional `get_issue`, and safe delivery reads. It rejects chat, comments, escalation, resolution, and unscoped tickets.

Courier workflow fit:
- Pass. The spec routes proof, failed-attempt, return, package, and earnings problems through delivery-scoped issue reporting without replacing structured courier flows.

Offline discipline:
- Pass. The spec allows offline queueing only with delivery context, idempotency, request fingerprint, and clear not-yet-sent copy.

UI quality:
- Pass. The spec defines a serious, field-safe issue console with strong triage hierarchy, accessible controls, and no decorative support patterns.

Closed for implementation:
- This file is full enough for Claude Code to build `CourierIssues` end to end as a production-grade final-mile courier issue list and reporting screen without creating unsupported support behavior.

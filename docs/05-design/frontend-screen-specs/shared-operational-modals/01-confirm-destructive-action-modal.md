# Confirm Destructive Action Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `ConfirmDestructiveActionModal` |
| Component target | shared modal primitive for `apps/mobile`, `apps/web`, and `apps/admin` |
| Primary test ID | `modal-confirm-destructive-action` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 shared safety guard for irreversible, high-risk, or audit-sensitive mutations |
| Used by | cancellation, station/status overrides, suspend user, reactivate user, refund approval, refund settlement, package label reprint, custody exception actions, pricing update, retry/replay admin tools, export, audit-sensitive acknowledgement |
| Backend coverage | relevant mutation called only by the host after this modal confirms |
| Required states | `closed`, `opening`, `ready`, `requires_reason`, `requires_typed_confirmation`, `requires_checkbox_ack`, `submitting`, `submitted`, `blocked_validation`, `permission_denied`, `network_error`, `server_rejected`, `closing` |

## Product Job
`ConfirmDestructiveActionModal` is the reusable confirmation gate for actions that can cancel work, change access, alter money movement, change operational state, expose sensitive exports, or create an audit-sensitive decision. It must slow the user down just enough to prevent accidental harm while keeping legitimate operator work fast and clear.

The modal answers:
- `What action am I about to take?`
- `Which entity or workflow will be affected?`
- `What cannot be undone by the current user?`
- `What evidence, reason, or acknowledgement is required?`
- `Who will be recorded as the actor?`
- `What happens if I cancel?`
- `What happens after confirmation succeeds or fails?`

The user should be able to:
- Understand the exact destructive or sensitive outcome.
- Cancel safely with one obvious action.
- Confirm only after required reason, checkbox, or typed phrase is complete.
- See a loading state while the host mutation runs.
- Recover from validation, permission, network, and server rejection.
- Trust that no mutation ran until they explicitly confirmed.

This modal is not:
- A data entry wizard.
- A support conversation.
- A backend mutation by itself.
- A replacement for permission checks.
- A place to hide policy decisions.
- A broad settings panel.
- A toast or passive warning.
- A normal success message.
- A legal terms page.
- A screen-level error state.

## Strategic Role
Kra's product depends on operational trust. A careless tap can cancel a delivery, inactivate a worker, change station intake, approve refund movement, reopen queue risk, or trigger an export. This modal is the universal friction layer for those moments.

Core principle:
- Safe cancellation must be easier than destructive confirmation.
- The host owns the mutation.
- The modal owns clarity, focus, validation, and explicit user intent.
- Backend permission, state, audit, and policy checks still run after confirmation.
- No destructive action may run from render, close, backdrop tap, or keyboard escape.

## Audience
Primary users:
- senders cancelling eligible deliveries
- support admins managing issue actions
- ops admins overriding station or delivery state
- finance admins approving or settling refunds
- super admins suspending or restoring user access
- station staff requesting package label reprint where allowed
- admins exporting sensitive reports

Secondary users:
- QA validating every destructive path
- security reviewers checking accidental-action prevention
- accessibility reviewers checking focus and keyboard behavior
- Claude Code implementing shared frontend components later

Non-users:
- anonymous public visitors
- receiver tracking users
- webhook callers
- scheduled backend jobs
- AI agents acting without user confirmation

## Current Backend Reality
Implemented mutation families that need confirmation gates:
- `cancel_delivery`
- `admin_update_station_status`
- `admin_update_station_validation`
- `admin_update_user_access`
- `admin_update_pricing_rules`
- `refund_payment`
- `settle_refund_payment`
- `escalate_issue`
- `resolve_issue`

Implemented policy facts:
- Sender/support/admin cancellation can create refund-pending state depending on delivery status and payment state.
- Finance refunds require policy decisions and finance capability.
- Finance settlement records provider references and marks payment as refunded.
- Admin user access can inactivate or reactivate users and change role/station assignment.
- Station status updates affect launch readiness and station intake ability.
- Pricing rule updates affect future delivery quotes but not already locked quotes.
- Sensitive override actions should be logged and reviewable.
- Every privileged backend action must emit audit event before success is returned.

Current frontend implication:
- The modal must be generic but configurable by action kind.
- The host passes policy-specific copy, required inputs, risk level, and mutation callbacks.
- The modal does not choose whether the backend action is legal.
- The modal does not call APIs directly unless wrapped by a host-owned adapter.
- The modal must surface backend rejection clearly and leave the host in a safe state.

## Source References
External references used for this modal:
- [WAI-ARIA Authoring Practices: Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports inert background behavior, trapped tab sequence, escape handling, focus placement, least destructive initial focus for hard-to-undo actions, role `dialog`, `aria-modal`, and labelling.
- [Android Developers: Dialogs](https://developer.android.com/develop/ui/views/components/dialogs): supports dialog lifecycle handling, positive/negative/neutral actions, cancel behavior, Back button behavior, outside tap cancellation, and host callbacks.
- [Apple Human Interface Guidelines: Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts): supports using alerts for destructive consequences, including a clear Cancel action, and keeping alert copy concise.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear error text for required reason, checkbox, or typed confirmation inputs.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submitting, rejected, and success announcements.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for high-risk actions on mobile and web.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/fraud-and-abuse-prevention.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/cancellations.ts`
- `services/api/src/refunds.ts`
- `services/api/src/stations.ts`
- `services/api/src/users.ts`
- `services/api/src/auth.ts`

## Design Brief
Audience:
- Authenticated users about to run a destructive, irreversible, audit-sensitive, or high-risk action.

Context of use:
- Interruptive, high-stakes, task-critical, and often time-sensitive.

Entry point:
- Host surface opens the modal after user chooses a destructive or sensitive action.

Success state:
- The user either cancels safely or confirms with clear intent, required acknowledgement, and host mutation result.

Primary action:
- Confirm the named action only after all safety requirements pass.

Navigation model:
- Modal dialog on web/admin, bottom sheet or platform alert-style sheet on mobile when appropriate.

Density level:
- Compact by default; detailed only when policy, money, account access, or custody risk requires it.

Visual thesis:
- A precise safety lock with sharp copy, one safe escape, and a restrained danger action that cannot be activated accidentally.

Restraint rule:
- Do not add marketing, generic reassurance, large illustrations, full policy documents, or unrelated record data.

## UX Principles
The modal should feel:
- serious
- fast to understand
- safe by default
- explicit
- policy-aware
- audit-ready
- calm under pressure

The modal must not feel:
- casual
- noisy
- vague
- like a normal proceed dialog
- like a scary dead end
- like a multi-page form
- like the destructive action is already running
- like a permission override

Primary promise:
- `Nothing happens until you confirm.`

Operational promise:
- `The action, actor, reason, and result can be reviewed later when the host workflow requires audit.`

## Modal Variants
`basic_destructive`:
- Use for low-complexity destructive actions with clear undo or follow-up.
- Requires confirm and cancel buttons.
- Reason optional.

`reason_required`:
- Use when policy requires written reason.
- Requires text area with minimum length.
- Confirm disabled until valid.

`typed_confirmation`:
- Use for actions that affect money, account access, station status, or policy.
- Requires exact phrase.
- Confirm disabled until exact match.

`checkbox_acknowledgement`:
- Use when user must acknowledge consequence but typed phrase is too slow.
- Requires one or more labelled checkboxes.
- Confirm disabled until required boxes are checked.

`dual_acknowledgement`:
- Use for very high-risk admin actions.
- Requires reason plus typed phrase or reason plus checkbox.

`permission_sensitive`:
- Use when current role may lack permission after stale UI state.
- Modal confirms intent, then host mutation may return permission denial.

## Action Risk Tiers
`tier_1`:
- Low-risk destructive action.
- Example: discard unsaved local filter changes.
- Basic confirmation or no modal if undo is easy.

`tier_2`:
- Operational action with workflow impact.
- Example: cancel eligible delivery, package label reprint, resolve issue.
- Reason may be required.

`tier_3`:
- Admin, finance, account, station, or pricing action.
- Example: suspend user, reactivate user, station status override, pricing update, refund approval.
- Reason or acknowledgement required.

`tier_4`:
- High-risk money/access/custody action with audit sensitivity.
- Example: settle refund, force reopen major queue issue, override custody exception.
- Reason plus typed confirmation or checkbox required.

Rule:
- The host selects tier.
- The modal enforces the configured tier requirements.
- The backend still validates permission and state.

## Usage Matrix
| Host flow | Recommended variant | Required inputs | Safe cancel label | Confirm label |
| --- | --- | --- | --- | --- |
| Cancel delivery | `reason_required` | reason when policy requires it | `Keep delivery` | `Cancel delivery` |
| Station status override | `dual_acknowledgement` | reason plus acknowledgement | `Keep station status` | `Update station status` |
| Suspend user | `typed_confirmation` | exact phrase | `Keep user active` | `Suspend user` |
| Reactivate user | `reason_required` | reason | `Keep user inactive` | `Reactivate user` |
| Refund approval | `dual_acknowledgement` | reason plus amount acknowledgement | `Keep under review` | `Approve refund` |
| Refund settlement | `dual_acknowledgement` | provider reference acknowledgement | `Do not settle` | `Mark refunded` |
| Pricing update | `typed_confirmation` | exact phrase | `Keep current pricing` | `Update pricing` |
| Package label reprint | `reason_required` | reason | `Do not reprint` | `Reprint label` |
| Export report | `checkbox_acknowledgement` | data handling acknowledgement | `Cancel export` | `Export report` |
| Webhook replay | `typed_confirmation` | exact phrase | `Do not replay` | `Replay event` |
| Notification retry | `basic_destructive` | none or reason | `Do not retry` | `Retry notification` |

## Component API
Suggested props:
```ts
export type DestructiveActionRiskTier = "tier_1" | "tier_2" | "tier_3" | "tier_4";

export type DestructiveActionVariant =
  | "basic_destructive"
  | "reason_required"
  | "typed_confirmation"
  | "checkbox_acknowledgement"
  | "dual_acknowledgement"
  | "permission_sensitive";

export interface ConfirmDestructiveActionModalProps {
  isOpen: boolean;
  variant: DestructiveActionVariant;
  riskTier: DestructiveActionRiskTier;
  title: string;
  body: string;
  consequence: string;
  entityLabel?: string;
  actorLabel?: string;
  auditNote?: string;
  confirmLabel: string;
  cancelLabel: string;
  typedPhrase?: string;
  reasonConfig?: {
    label: string;
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  acknowledgements?: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  isSubmitting: boolean;
  submitError?: ConfirmDestructiveActionError;
  onCancel: () => void;
  onConfirm: (input: ConfirmDestructiveActionInput) => Promise<void> | void;
}

export interface ConfirmDestructiveActionInput {
  reason?: string;
  typedConfirmation?: string;
  acknowledgedIds: string[];
}

export interface ConfirmDestructiveActionError {
  code:
    | "validation_error"
    | "permission_denied"
    | "network_error"
    | "server_rejected"
    | "unknown";
  message: string;
  requestId?: string;
}
```

Contract rules:
- `title`, `body`, `consequence`, `confirmLabel`, and `cancelLabel` are required.
- `typedPhrase` is required for `typed_confirmation` and `dual_acknowledgement` when configured.
- `reasonConfig` is required for `reason_required` and `dual_acknowledgement` when configured.
- The modal must not infer backend payload.
- The modal emits sanitized input to host.
- The host owns mutation and cache updates.

## Data Rules
Allowed modal data:
- action name
- safe entity label
- masked or safe actor label
- consequence summary
- safe audit note
- required reason
- required typed phrase
- required acknowledgement IDs
- request ID from failed mutation

Forbidden modal data:
- raw auth token
- OTP
- PIN
- password
- unmasked phone when not necessary
- receiver full address unless already visible in host and needed for confirmation
- payment provider secret
- proof asset URL
- internal fraud evidence
- full audit note from another admin
- hidden backend error details

Entity label rule:
- Use human-safe names like `delivery`, `station`, `user`, `refund`, `pricing rule`, or `export`.
- Include specific IDs only when already visible and needed for user certainty.
- For public or sender surfaces, avoid internal IDs unless the host page already uses them.

## Copy System
Title rules:
- Start with an action verb when possible.
- Keep under `64` characters.
- Avoid yes/no questions.
- Use the actual action, not generic `Are you sure?`.

Body rules:
- One or two short sentences.
- State consequence.
- State whether this can be reversed by the current user.
- Do not over-explain policy.

Consequence rules:
- Use a dedicated line for the strongest consequence.
- Include money/account/custody/station risk when present.

Confirm label rules:
- Use verb plus object.
- Use red/danger style only for destructive or high-risk confirm.
- Examples:
  - `Cancel delivery`
  - `Suspend user`
  - `Approve refund`
  - `Mark refunded`
  - `Update station status`
  - `Reprint label`

Cancel label rules:
- Use safe outcome.
- Examples:
  - `Keep delivery`
  - `Keep user active`
  - `Keep current pricing`
  - `Do not settle`
  - `Close`

Avoid:
- `OK`
- `Yes`
- `No`
- `Proceed`
- `Confirm`
- `Are you sure?`
- `This cannot be undone` without saying what `this` is.
- `Trust me`
- `System will handle it`

## Visual System
Base layout:
- Container uses modal elevation token.
- Width is compact on web/admin.
- Mobile uses sheet or centered alert depending on platform and host.
- The destructive CTA is visually distinct but not auto-focused.
- The safe cancel action is prominent enough to avoid mistakes.

Color:
- Danger red for destructive confirm.
- Amber for high-risk caution with reversible admin action.
- Blue for safe cancellation or neutral route.
- Neutral background.
- Color never stands alone.

Typography:
- Title uses strong weight.
- Consequence uses concise body text with emphasis by placement, not shouting.
- Required labels are clear.

Spacing:
- Minimum `24` around content on mobile.
- Button group spacing prevents accidental taps.
- Checkbox/reason inputs have clear spacing and error text.

Motion:
- Fade backdrop.
- Scale or slide modal minimally.
- No bouncing danger motion.
- No shake on validation failure.
- Respect reduced-motion.

## Accessibility Requirements
Dialog behavior:
- Web container uses role `dialog` or `alertdialog` based on severity.
- `aria-modal` is true only when the rest of page is inert.
- Dialog has visible title connected by label.
- Use description only when content is short enough to be read cleanly.
- Background is inert while open.
- Focus is trapped inside modal.
- Escape closes only when cancellation is allowed.
- Backdrop tap closes only when cancellation is allowed and no submission is in progress.

Initial focus:
- For destructive irreversible actions, focus the least destructive action first.
- For forms requiring reason or typed phrase, focus the first required input.
- Never focus destructive confirm by default.

Close behavior:
- Focus returns to trigger when closed.
- If trigger no longer exists, focus the next logical host element.
- During submit, focus remains within modal.

Keyboard:
- `Tab` and `Shift+Tab` loop inside modal.
- `Escape` maps to cancel only when safe.
- `Enter` submits only when focus is inside a text input with explicit form behavior or confirm button and validation passes.
- `Space` toggles checkbox when focused.

Screen reader:
- Announce title, consequence, and required inputs.
- Announce validation errors.
- Announce submitting and submitted states.

Touch:
- Buttons at least `44` dp high.
- Destructive and cancel buttons not cramped.
- Checkboxes have large hit area.

## Modal States
### Closed
Trigger:
- Modal is not visible.

Rules:
- No focus trap.
- No backdrop.
- No mutation.

Test ID:
- no root rendered, or root hidden according to component library standard.

### Opening
Trigger:
- Modal is mounted and entrance motion starts.

Rules:
- Background becomes inert before user can interact.
- Focus moves according to initial focus rules.

Test ID:
- `confirm-destructive-opening-state`

### Ready
Trigger:
- Modal is open and all required context is present.

Rules:
- Confirm button state reflects validation.
- Cancel available unless host forbids cancellation for a lawful reason.

Test ID:
- `confirm-destructive-ready-state`

### Requires Reason
Trigger:
- Variant requires a written reason.

Rules:
- Reason field shows label and count.
- Confirm disabled until minimum length and max length pass.
- Error appears after blur or attempted confirm.

Test IDs:
- `confirm-destructive-reason-field`
- `confirm-destructive-reason-error`

### Requires Typed Confirmation
Trigger:
- Variant requires exact phrase.

Rules:
- Phrase is displayed separately.
- Input must match exact phrase.
- Confirm disabled until exact match.
- Do not autocorrect or transform typed text.

Test IDs:
- `confirm-destructive-typed-phrase`
- `confirm-destructive-typed-field`
- `confirm-destructive-typed-error`

### Requires Checkbox Acknowledgement
Trigger:
- Variant requires acknowledgement.

Rules:
- Required checkboxes are labelled.
- Confirm disabled until required boxes checked.
- Each checkbox has clear touch target.

Test IDs:
- `confirm-destructive-ack-list`
- `confirm-destructive-ack-checkbox-{id}`

### Submitting
Trigger:
- User confirms and host mutation is running.

Rules:
- Disable confirm and cancel unless host can safely abort.
- Show progress text.
- Do not close until host resolves or explicitly tells modal to close.
- Prevent double submission.

Test IDs:
- `confirm-destructive-submitting-state`
- `confirm-destructive-progress`

### Submitted
Trigger:
- Host mutation succeeds and host chooses to show success before closing.

Rules:
- Show success status briefly or close.
- Return focus to host success destination.

Test ID:
- `confirm-destructive-submitted-state`

### Blocked Validation
Trigger:
- User attempts confirm while required inputs are missing or invalid.

Rules:
- Show field-level error.
- Focus first invalid field.
- Do not call host mutation.

Test ID:
- `confirm-destructive-validation-state`

### Permission Denied
Trigger:
- Host mutation returns permission denial.

Rules:
- Show permission error.
- Provide safe close or route to `PermissionDenied`.
- Do not retry automatically.

Test ID:
- `confirm-destructive-permission-denied-state`

### Network Error
Trigger:
- Host mutation cannot reach backend.

Rules:
- Keep modal open.
- Allow retry if host says action is safe to retry.
- Cancel remains available unless host forbids due partial server state.

Test ID:
- `confirm-destructive-network-error-state`

### Server Rejected
Trigger:
- Backend rejects due state transition, validation, payment, refund, station, or issue rule.

Rules:
- Show host-provided safe message.
- Do not reframe as permission denial unless code is permission.
- User may close and review current state.

Test ID:
- `confirm-destructive-server-rejected-state`

### Closing
Trigger:
- User cancels, host closes, or success closes modal.

Rules:
- Restore focus.
- Clear sensitive local input.
- Report cancel or confirm outcome.

Test ID:
- `confirm-destructive-closing-state`

## Action Flow
Open flow:
1. Host computes action config.
2. Host passes safe entity and consequence copy.
3. Modal opens and makes host content inert.
4. Modal sets focus to safest valid element.
5. User cancels or completes requirements.

Confirm flow:
1. User completes required reason, typed phrase, or acknowledgements.
2. User activates confirm button.
3. Modal validates locally.
4. Modal calls host `onConfirm`.
5. Host calls backend mutation.
6. Backend validates auth, permission, policy, state, and audit.
7. Host updates cache and closes or shows result.

Cancel flow:
1. User activates cancel, escape, back, or allowed backdrop close.
2. Modal calls `onCancel`.
3. Modal clears local sensitive input.
4. Focus returns to trigger or safe host element.
5. No mutation runs.

## Host Responsibilities
The host must:
- Provide clear action-specific copy.
- Provide correct risk tier and variant.
- Provide safe entity label.
- Own all API calls.
- Own cache updates.
- Own final navigation after success.
- Handle permission and server rejection.
- Log audit-sensitive events only after backend success.
- Keep trigger focusable until modal closes where possible.

The host must not:
- Pre-run mutation before modal confirmation.
- Hide required policy warning outside the modal.
- Pass secrets to modal.
- Let confirm submit twice.
- Treat modal confirmation as backend authorization.
- Close on submit before host knows the result unless host has a safe optimistic pattern documented.

## Validation Rules
Reason:
- Trim leading and trailing whitespace for validation.
- Preserve original text for host if policy requires exact user wording.
- Minimum length comes from host.
- Maximum length comes from host.
- Empty reason blocks confirm when required.

Typed phrase:
- Exact match by default.
- Case-sensitive unless host explicitly declares case-insensitive.
- No autocorrect.
- No paste blocking.
- Show clear mismatch error.

Checkboxes:
- Each required acknowledgement must be checked.
- Optional acknowledgements do not block confirm.
- Labels must state concrete consequence.

Confirm button:
- Disabled until local requirements pass.
- Shows loading state during submit.
- Never receives initial focus for hard-to-undo actions.

## Security Rules
Double-submit prevention:
- Lock confirm after activation.
- Ignore repeated confirm events while submitting.
- Host should use backend request safety for repeated network attempts.

Permission:
- Modal does not expose actions if host knows permission is missing.
- If stale permission fails, show safe error and route to `PermissionDenied`.

Sensitive data:
- Clear reason and typed confirmation on close.
- Do not persist modal input beyond host submission.
- Do not log typed phrase.
- Do not log reason unless host audit policy requires it and backend accepts it.

Background interaction:
- Background must be inert.
- Backdrop tap cannot confirm.
- Escape cannot confirm.
- Back button cannot confirm.

Audit:
- For admin and finance flows, host mutation payload must include reason when backend schema supports it.
- Modal event telemetry may record action kind and result, but not full reason or sensitive entity values.

## Error Handling
Validation error:
- Focus first invalid input.
- Keep modal open.
- No host mutation.

Permission error:
- Show `You no longer have permission for this action.`
- Primary safe action: `Close`
- Secondary optional: `View permission help`

Network error:
- Show `Connection failed before this action finished.`
- If host knows mutation did not start, allow retry.
- If host cannot tell, route to current record refresh after close.

Server rejection:
- Show host-provided safe message.
- Examples:
  - `This delivery can no longer be cancelled.`
  - `This refund is no longer pending.`
  - `This station status changed. Refresh before trying again.`

Unknown error:
- Show generic error and request ID.
- Keep destructive action unconfirmed.

## Responsive Behavior
Mobile:
- Prefer bottom sheet for operational flows when it does not weaken urgency.
- Prefer centered alert for account, refund, or severe destructive action.
- Keep cancel action thumb-reachable.
- Avoid full-screen unless reason content is long.
- Keyboard must not hide confirm/cancel actions.

Admin desktop:
- Centered modal with max width around `520` to `640`.
- Use two-column only for detailed audit note plus inputs on large screens.
- Keep button row aligned with platform convention used in admin design system.

Tablet:
- Centered card.
- Avoid edge-to-edge sheet unless host uses sheet pattern consistently.

Web public:
- Use only if sender or public authenticated flow needs destructive confirmation.
- Keep copy low-jargon.

## Telemetry
Events:
- `confirm_destructive_opened`
- `confirm_destructive_cancelled`
- `confirm_destructive_validation_blocked`
- `confirm_destructive_confirm_clicked`
- `confirm_destructive_submitted`
- `confirm_destructive_failed`
- `confirm_destructive_closed`

Allowed properties:
- `actionKind`
- `riskTier`
- `variant`
- `hostSurface`
- `requiresReason`
- `requiresTypedConfirmation`
- `requiredAcknowledgementCount`
- `result`
- `errorCode`
- `hasRequestId`

Forbidden properties:
- full reason text
- typed phrase
- raw entity ID when not already public in host
- user phone
- receiver phone
- payment provider secret
- proof asset reference
- auth token
- internal evidence

## Test IDs
Root:
- `modal-confirm-destructive-action`

Structure:
- `confirm-destructive-backdrop`
- `confirm-destructive-dialog`
- `confirm-destructive-title`
- `confirm-destructive-body`
- `confirm-destructive-consequence`
- `confirm-destructive-entity-label`
- `confirm-destructive-audit-note`

Inputs:
- `confirm-destructive-reason-field`
- `confirm-destructive-reason-error`
- `confirm-destructive-typed-phrase`
- `confirm-destructive-typed-field`
- `confirm-destructive-typed-error`
- `confirm-destructive-ack-list`
- `confirm-destructive-ack-checkbox-{id}`

Actions:
- `confirm-destructive-cancel-action`
- `confirm-destructive-confirm-action`
- `confirm-destructive-close-action`
- `confirm-destructive-retry-action`

States:
- `confirm-destructive-opening-state`
- `confirm-destructive-ready-state`
- `confirm-destructive-submitting-state`
- `confirm-destructive-submitted-state`
- `confirm-destructive-validation-state`
- `confirm-destructive-permission-denied-state`
- `confirm-destructive-network-error-state`
- `confirm-destructive-server-rejected-state`
- `confirm-destructive-closing-state`

## QA Matrix
Basic modal:
- Opens with title, body, consequence, cancel, and confirm.
- Background is inert.
- Focus moves into modal.
- Cancel closes without calling confirm.
- Confirm calls host only once.

Reason required:
- Empty reason disables confirm.
- Short reason shows error.
- Valid reason enables confirm.
- Confirm passes reason to host.

Typed confirmation:
- Confirm disabled until exact phrase matches.
- Error appears on mismatch.
- Confirm passes typed confirmation only through component callback.
- Telemetry does not include typed text.

Checkbox acknowledgement:
- Required unchecked box blocks confirm.
- Required checked box enables confirm.
- Checkbox labels are screen-reader accessible.

Submitting:
- Confirm disabled.
- Double click does not run host twice.
- Cancel behavior follows host rule.
- Status message announces progress.

Permission denied:
- Host `permission_denied` error shows safe message.
- User can close or route to permission screen.
- No retry loop.

Network error:
- Host error shows retry only when safe.
- Cancel remains available when no partial state exists.

Server rejection:
- Host message appears.
- User can close and refresh host state.

Accessibility:
- `Tab` stays inside modal.
- `Shift+Tab` stays inside modal.
- Escape closes only when safe.
- Focus returns to trigger.
- Destructive confirm is not initial focus.
- Touch targets meet minimum size.

Responsive:
- Mobile sheet does not hide buttons under keyboard.
- Desktop modal does not exceed safe width.
- Tablet layout remains readable.

Security:
- No mutation before confirm.
- Backdrop tap never confirms.
- Escape never confirms.
- Closed modal clears local inputs.
- Telemetry excludes sensitive data.

## Implementation Checklist
1. Create shared modal spec folder and component target.
2. Build modal root with focus trap and inert background.
3. Add title, body, consequence, entity label, and audit note regions.
4. Add variant handling.
5. Add reason field validation.
6. Add typed confirmation validation.
7. Add acknowledgement checkbox validation.
8. Add safe cancel and confirm actions.
9. Add submitting state.
10. Add permission, network, server, and unknown error states.
11. Add mobile sheet and desktop modal responsive rules.
12. Add reduced-motion behavior.
13. Add telemetry redaction.
14. Add callback contract tests.
15. Add keyboard and focus tests.
16. Add screen-reader label tests.
17. Add visual regression for mobile, tablet, and desktop.
18. Integrate with cancellation, refunds, station override, user access, pricing, and export hosts.

## Acceptance Criteria
The modal is complete when:
- It renders `modal-confirm-destructive-action`.
- It can be configured by host action kind.
- It never calls mutation before user confirmation.
- It always provides a safe cancel path unless host explicitly and lawfully disables close during submit.
- It blocks confirm until required reason, typed phrase, or acknowledgement passes.
- It prevents double submission.
- It handles permission, network, validation, and server rejection.
- It restores focus correctly.
- It traps focus while open.
- It keeps background inert.
- It respects reduced motion.
- It keeps destructive confirm out of initial focus.
- It clears local sensitive input on close.
- It redacts telemetry.
- It passes mobile, web, admin, accessibility, and E2E host tests.

## Open Product Decisions
No product decision blocks v1 modal implementation.

Non-blocking frontend platform improvements:
- Standardize action-kind registry for all destructive flows.
- Add centralized audit copy registry for admin and finance hosts.
- Add optional host-level policy snippets when a flow needs longer explanation.
- Add shared typed-confirmation phrase builder.

## Final Implementation Guidance
Claude Code should implement this modal as a reusable safety primitive, not as a one-off alert. Keep the UI compact, but enforce focus, validation, redaction, and one-shot confirmation strictly. Every destructive host must pass explicit copy and must still rely on backend authorization, state, policy, and audit checks after the modal confirms user intent.

# Audit Sensitive Action Acknowledgement Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `AuditSensitiveActionAckModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screens | All admin override, finance, access, export, issue, and future replay flows |
| Secondary host screens | `AdminStationStatusOverride`, `AdminStationValidation`, `AdminPricingRuleEdit`, `AdminUserAccess`, `AdminRefundReview`, `AdminRefundSettlement`, `AdminIssueDetail`, `AdminExportReport`, `AdminWebhookEventDetail` |
| Test id root | `modal-audit-sensitive-action-ack` |
| Backend coverage | None directly; host mutation emits audit event when backend supports it |
| Browser mutation operation | None |
| Read operation | None |
| Audit read operation | `admin_audit_events` as post-action review route only |
| Offline critical | No |
| Data sensitivity | Admin action intent, actor role, target IDs, reason, consequence acknowledgement |
| Required modal states | `closed`, `opening`, `ready`, `requires_acknowledgement`, `requires_reason`, `requires_typed_phrase`, `confirmed`, `blocked_validation`, `host_submitting`, `host_rejected`, `cancelled` |
| Related specs | destructive confirmation, station status override, station validation, pricing rules, user access, refund decision, refund settlement, issue resolution, export report, webhook replay, admin audit events |

## Purpose
`AuditSensitiveActionAckModal` is the reusable acknowledgement gate for admin actions that must be deliberately understood before the host mutation runs.

The modal does not perform the mutation. It does not write audit events by itself. It returns structured acknowledgement intent to the host, and the host remains responsible for calling the approved backend route.

The modal must answer:
- `Which sensitive action is about to happen?`
- `Which record is affected?`
- `Which actor and role are taking responsibility?`
- `What will the audit trail need to prove later?`
- `What does the admin need to acknowledge before continuing?`
- `Is a reason or typed phrase required?`
- `What happens if the admin cancels?`
- `What is not covered by this acknowledgement?`

The most important rule is:
```text
Acknowledgement is not the audit event. The backend audit trail remains the source of truth.
```

## Product Job
Admins need a compact, reusable way to acknowledge high-impact consequences before changing station status, validating launch readiness, changing pricing, changing user access, approving or settling refunds, resolving sensitive issues, exporting operational files, or using future replay tooling.

The modal should:
- slow down risky actions
- make the consequence explicit
- capture required acknowledgement
- capture a reason when required
- return a typed acknowledgement object to the host
- block accidental submit
- keep cancellation easy
- preserve accessibility and focus discipline

It should not duplicate the full business modal that opened it.

## Strategic Role
Kra is a delivery network, not a content app. Privileged admin actions can affect money, access, dispatch readiness, station operations, customer trust, and package custody. The acknowledgement modal is the final human-intent checkpoint before the host starts a sensitive mutation.

It prevents:
- accidental station shutdown
- unreviewed pricing change
- silent user suspension
- refund approval without evidence acknowledgement
- refund settlement without reference review
- issue closure that hides a custody problem
- sensitive export without privacy acknowledgement
- future replay action without risk acknowledgement

The modal must create friction only where the action risk justifies it.

## Primary Users
Primary users:
- `ops_admin` performing station or operations overrides.
- `finance_admin` performing refund, pricing, reconciliation, or export-sensitive actions.
- `support_admin` escalating or resolving issue actions with customer impact.
- `super_admin` performing user access, station, pricing, finance, and broad admin actions.

Secondary users:
- Security reviewers validating intentional action.
- QA validating host mutation gating.
- Accessibility reviewers validating keyboard and screen reader behavior.
- Backend engineers verifying acknowledgement context aligns with audit records.
- Claude Code implementing the modal later.

Non-users:
- sender
- receiver
- driver
- station operator
- final-mile courier
- public visitor
- webhook caller
- scheduled task

## Non-Goals
Do not build these into the modal:
- Direct API mutation.
- Direct audit event creation.
- Audit event editing.
- Audit log browser.
- Permission override.
- Backend policy decision.
- Full evidence review.
- Station status form.
- Pricing rule form.
- User access form.
- Refund form.
- Issue resolution form.
- Export builder.
- Webhook replay form.
- Password prompt.
- MFA challenge.
- Legal terms acceptance.
- Permanent local acknowledgement storage.

If a host needs the full action form, it must own that form before opening this modal.

## Hard Backend Reality
Implemented audit read endpoint:
```http
GET /v1/admin/audit-events
```

Operation:
```text
admin_audit_events
```

Supported audit event fields:
```ts
{
  eventId: string;
  requestId: string;
  action: string;
  actorId: string;
  actorRole: string;
  occurredAt: string;
  stationId?: string;
  targetType?: "delivery" | "payment" | "issue" | "tracking";
  targetId?: string;
  metadata?: Record<string, unknown>;
}
```

Current audit read limits:
- target type enum does not yet include station, user, pricing rule, export, webhook event, or notification
- no single audit event detail endpoint exists
- no audit write endpoint is exposed to frontend
- metadata is sensitive and must not be exported or copied broadly

Local security policy says:
- every privileged backend action must emit an audit event before success is returned
- sensitive override actions should be logged and reviewable
- audit history must be append-only
- corrections create new events, not erased history

Therefore:
- this modal cannot prove audit persistence by itself
- the host must wait for backend success before saying an action was recorded
- the modal can only confirm the admin understood the action before submit

## Source References
External references used for this modal:
- [NIST SP 800-53 Rev. 5 AU-2 Event Logging](https://csf.tools/reference/nist-sp-800-53/r5/au/au-2/): supports defining which events must be logged and why auditability matters.
- [NIST SP 800-53 Rev. 5 AU-3 Content of Audit Records](https://csf.tools/reference/nist-sp-800-53/r5/au/au-3/): supports actor, event, time, and outcome content expectations.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports sensitive-data redaction and security-relevant event logging.
- [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports high-impact acknowledgement dialog behavior.
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus trapping, labelling, and modal keyboard behavior.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports before-submit review of important details.
- [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/): supports visible warning treatment for important consequences.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear validation errors for missing acknowledgements and reason fields.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports host submit and rejected announcements.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/01-confirm-destructive-action-modal.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/08-security/authorization-rules.md`
- `docs/06-architecture/security-architecture.md`
- `docs/02-users/permissions-matrix.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/audit.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Design Thesis
Design this as an accountability checkpoint: precise, quiet, and difficult to bypass accidentally. The modal should feel like a control room acknowledgement, not a scary pop-up or a generic `Are you sure?` box.

Visual direction:
- compact high-trust modal
- warning label at the top
- action summary table
- consequence checklist
- reason or typed phrase only when required
- safe cancel action visually stronger than accidental confirm
- no illustration
- no long legal text

Tone:
- exact
- calm
- responsibility-focused
- no blame
- no promise that audit has already been written

## Product Principle
An acknowledgement is useful only if it is specific. Generic friction trains admins to click through.

Every host invocation must include:
- action label
- target label
- target identifier
- actor role
- consequence list
- acknowledgement requirements
- submit label
- cancel label

## Relationship To ConfirmDestructiveActionModal
`ConfirmDestructiveActionModal` is the broad confirmation primitive.

`AuditSensitiveActionAckModal` is the audit-intent layer for privileged actions.

Use patterns:
- Use `ConfirmDestructiveActionModal` alone for ordinary destructive actions.
- Use `AuditSensitiveActionAckModal` alone when the host already has a full review form and only needs final acknowledgement.
- Compose both only when the action is both destructive and audit-sensitive, and avoid duplicate copy.

Composition rule:
- The host should not show two separate modals with the same consequence copy.
- If both are needed, the audit acknowledgement can be the final step inside the destructive confirmation flow.

## Host Action Categories
### Station Operations
Actions:
- station status override
- station validation update
- service availability change
- intake restriction

Host operations:
- `admin_update_station_status`
- `admin_update_station_validation`

Required acknowledgement:
- station identity verified
- operational impact understood
- launch readiness impact understood when applicable

### Pricing
Actions:
- active pricing rule update

Host operation:
- `admin_update_pricing_rules`

Required acknowledgement:
- new quotes will use active pricing after save
- existing locked quotes do not change
- full route table was reviewed

### User Access
Actions:
- suspend user
- reactivate user
- role change
- station scope change

Host operation:
- `admin_update_user_access`

Required acknowledgement:
- actor is not changing their own access
- role and station scope are preserved or intentionally changed
- backend user record status is the supported action scope

### Refunds
Actions:
- approve refund
- reject refund
- settle refund

Host operations:
- `refund_payment`
- `settle_refund_payment`

Required acknowledgement:
- evidence reviewed
- amount reviewed
- provider reference or settlement reference reviewed when applicable
- no second settlement should be created

### Issue Management
Actions:
- escalate issue
- resolve issue
- close issue

Host operations:
- `escalate_issue`
- `resolve_issue`

Required acknowledgement:
- issue state and severity reviewed
- closure does not change custody or payment state unless separate supported action runs
- unresolved P1 evidence is not hidden

### Exports
Actions:
- generate report file
- download report file

Host operation:
- none, current export is client-side

Required acknowledgement:
- file may contain operational or financial data
- file must be stored in approved business location
- report scope is current returned rows

### Future Replay Tools
Actions:
- notification retry
- webhook replay

Host operations:
- none for current browser manual retry or replay

Required acknowledgement:
- do not enable until secured endpoint exists
- future route must have backend audit event and replay result

## Risk Tiers
`tier_1_review`:
- user should review but action is low impact
- acknowledgement optional

`tier_2_sensitive`:
- action affects operations, issue state, or exported data
- checkbox acknowledgement required

`tier_3_privileged`:
- action affects station status, pricing, user access, or refund approval
- checkbox plus reason required

`tier_4_critical`:
- action executes money movement, broad access change, or future replay
- reason plus typed phrase required

Default:
- if host does not provide tier, use `tier_3_privileged`

## Acknowledgement Modes
`checkboxes_only`:
- one or more specific acknowledgement checkboxes
- confirm disabled until all required boxes are checked

`reason_required`:
- text area required
- min length `10`
- max length `240`

`typed_phrase_required`:
- exact phrase required
- case-sensitive only if host explicitly requires it

`reason_and_checkboxes`:
- reason plus required checkboxes

`reason_and_typed_phrase`:
- highest risk mode
- reason plus exact typed phrase

The host must choose the least burdensome mode that still fits the risk.

## Modal State Model
States:
- `closed`: not visible.
- `opening`: host resolves action context.
- `ready`: context loaded and controls visible.
- `requires_acknowledgement`: required checkboxes are incomplete.
- `requires_reason`: reason is missing or invalid.
- `requires_typed_phrase`: typed phrase is missing or invalid.
- `confirmed`: modal has returned acknowledgement to host.
- `blocked_validation`: local validation blocks continue.
- `host_submitting`: host mutation is running after acknowledgement.
- `host_rejected`: host mutation failed after acknowledgement.
- `cancelled`: user cancelled without mutation.

Rules:
- No host mutation runs before `confirmed`.
- `Escape` can cancel before confirmation.
- `Escape` must not cancel while `host_submitting` unless host supports safe cancellation.
- Closing before confirmation returns no acknowledgement object.
- Closing after host rejection returns to safe host state.

## Required Input Contract
Props:
```ts
type AuditSensitiveActionAckModalProps = {
  open: boolean;
  actionKey: AuditSensitiveActionKey;
  actionLabel: string;
  targetLabel: string;
  targetId: string;
  targetType: string;
  actorRole: AdminRole;
  riskTier: "tier_1_review" | "tier_2_sensitive" | "tier_3_privileged" | "tier_4_critical";
  acknowledgementMode:
    | "checkboxes_only"
    | "reason_required"
    | "typed_phrase_required"
    | "reason_and_checkboxes"
    | "reason_and_typed_phrase";
  consequences: AuditConsequence[];
  requiredCheckboxes?: AuditAckCheckbox[];
  typedPhrase?: string;
  reasonLabel?: string;
  reasonMinLength?: number;
  reasonMaxLength?: number;
  submitLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onAcknowledge: (acknowledgement: AuditSensitiveActionAcknowledgement) => void;
};
```

Acknowledgement return:
```ts
type AuditSensitiveActionAcknowledgement = {
  actionKey: string;
  targetType: string;
  targetId: string;
  actorRole: string;
  acknowledgedAt: string;
  checkedAcknowledgements: string[];
  reason?: string;
  typedPhraseMatched?: boolean;
};
```

The host may include this acknowledgement in a supported mutation note only if the endpoint schema allows it. Do not send unsupported fields to backend routes.

## Action Keys
Supported action keys:
- `station_status_override`
- `station_validation_update`
- `pricing_rules_update`
- `user_access_suspend`
- `user_access_reactivate`
- `user_role_or_station_scope_change`
- `refund_approval`
- `refund_rejection`
- `refund_settlement`
- `issue_escalation`
- `issue_resolution`
- `issue_closure`
- `report_export_generation`
- `report_export_download`
- `future_notification_retry`
- `future_webhook_replay`

Unknown action key:
- block submit
- show configuration error
- do not call host acknowledgement

## Layout
Desktop modal:
- width `600px` to `720px`
- max height `86vh`
- header with risk label and title
- warning summary
- action summary table
- consequence checklist
- reason or typed phrase section
- footer with cancel and acknowledge buttons

Mobile:
- full-screen sheet
- sticky header
- single-column summary
- large checkboxes
- sticky footer

Do not use tabs. This is a single-step acknowledgement.

## Header
Title pattern:
```text
Acknowledge sensitive action
```

Subtitle pattern:
```text
Review the action and consequences before continuing.
```

Risk label:
- `Review`
- `Sensitive`
- `Privileged`
- `Critical`

Close button:
- accessible name `Close acknowledgement modal`
- returns focus to trigger

## Action Summary
Always show:
- action label
- target label
- target ID
- actor role
- risk tier

Show when provided:
- station ID
- payment ID
- delivery ID
- issue ID
- report type
- current value
- proposed value

Never show:
- raw proof asset URLs
- provider secrets
- full receiver phone
- access tokens
- webhook signatures
- raw payloads
- raw audit metadata

## Consequence List
Each consequence must include:
- short label
- direct body text
- severity
- whether acknowledgement is required

Severity values:
- `info`
- `warning`
- `critical`

Rules:
- Do not include vague consequences.
- Do not use generic text like `This may have an impact` without naming the impact.
- Keep each consequence under two lines where possible.
- Use text plus icon or badge; never color only.

## Checkbox Requirements
Checkbox label rules:
- explicit
- action-specific
- no double negatives
- no legal boilerplate

Good labels:
- `I reviewed the station and service availability changes.`
- `I understand this changes future quotes only.`
- `I reviewed the refund evidence and amount.`
- `I understand this report covers current returned rows only.`

Bad labels:
- `I agree.`
- `I understand.`
- `Proceed.`
- `I accept all risks.`

The confirm button remains disabled until all required checkboxes are checked.

## Reason Field
Use when:
- action changes money movement
- action changes account access
- action changes station availability
- action closes high-severity issue
- action exports sensitive operational data
- host policy requires reason

Validation:
- min length default `10`
- max length default `240`
- trim whitespace
- reject reason that contains only repeated punctuation
- show remaining character count

Reason must not include:
- provider secret
- full phone number
- access token
- password
- raw webhook payload
- full proof URL

If the host endpoint has its own note field, the host maps the reason to that field only when supported.

## Typed Phrase
Use only for `tier_4_critical` or equivalent host policy.

Phrase examples:
- `SETTLE REFUND`
- `SUSPEND USER`
- `UPDATE PRICING`
- `PAUSE STATION`
- `GENERATE EXPORT`

Rules:
- show required phrase exactly
- do not auto-fill
- confirm disabled until match
- typed phrase field clears on close
- do not store phrase

## Button Model
Footer buttons:
- secondary: `Cancel`
- primary: host-provided submit label

Primary button labels:
- `Acknowledge and continue`
- `Acknowledge pricing update`
- `Acknowledge refund settlement`
- `Acknowledge export`
- `Acknowledge user access change`

Rules:
- cancel is always available before host submit
- primary is disabled until local requirements pass
- primary does not call backend directly
- primary calls `onAcknowledge`
- host owns the next mutation step

## Validation Errors
Reason missing:
```text
Add a reason before continuing.
```

Reason too short:
```text
Reason must be at least 10 characters.
```

Checkbox missing:
```text
Review and check each required acknowledgement.
```

Typed phrase missing:
```text
Type the exact phrase to continue.
```

Typed phrase mismatch:
```text
Phrase does not match.
```

Configuration missing:
```text
This acknowledgement is missing required action context.
```

Errors must be announced and connected to the failing control.

## Host Submit Behavior
After acknowledgement:
- modal may close and host shows submitting state
- or modal may show `host_submitting` if host wants the modal to own submit progress

Recommended:
- host keeps the modal open for highest-risk actions until backend returns
- host shows success only after backend returns success

Host rejection:
- show backend-safe error
- preserve reason and acknowledgement if safe
- let user cancel or retry if host allows

Do not:
- say audit event exists before backend success
- show audit event ID unless backend returned one
- infer audit event creation from local acknowledgement

## Audit Copy
Current copy:
```text
If this action succeeds, Kra's backend policy requires the privileged action to be recorded for review.
```

Do not say:
```text
This acknowledgement has been audited.
```

Unless backend returns audit event ID, do not render:
- `Audit event created`
- `Recorded in audit`
- `AUD-*`

## Accessibility
Dialog role:
- `role="alertdialog"` for `tier_4_critical`
- `role="dialog"` for lower tiers
- `aria-modal="true"`
- `aria-labelledby` points to title
- `aria-describedby` points to warning summary

Keyboard:
- focus moves to title or first invalid required control
- `Tab` remains within modal
- `Escape` cancels before confirmation
- focus returns to trigger on cancel
- focus moves to host error if host rejects

Screen reader:
- risk label is text
- consequences are list items
- checkbox errors are connected to controls
- reason character count is announced politely
- host rejection is announced assertively

Touch:
- checkbox targets meet minimum size
- footer buttons have clear spacing

Motion:
- minimal transition
- reduced motion respected

## Security And Privacy
Rules:
- Do not store acknowledgement in local storage.
- Do not store reason in local storage.
- Do not include sensitive reason text in analytics.
- Do not log reason to console.
- Do not include target IDs in analytics unless privacy policy allows; default is no.
- Clear reason and typed phrase on close.
- Keep acknowledgement state scoped to one modal instance.
- Do not reuse acknowledgement across actions.
- Do not auto-acknowledge based on previous action.

Reason content may be sent to backend only through host routes that already support notes or reasons.

## Analytics
Allowed events:
- `audit_sensitive_ack_modal_opened`
- `audit_sensitive_ack_validation_failed`
- `audit_sensitive_ack_cancelled`
- `audit_sensitive_ack_confirmed`
- `audit_sensitive_ack_host_rejected`

Allowed properties:
- `actionKey`
- `riskTier`
- `acknowledgementMode`
- `actorRole`
- `sourceScreen`
- `result`

Forbidden properties:
- reason text
- typed phrase text
- target ID
- delivery ID
- payment ID
- issue ID
- user ID
- provider reference
- phone number
- raw error body

## Error Mapping
| Condition | Modal state | Recovery |
| --- | --- | --- |
| missing action context | `blocked_validation` | close and fix host configuration |
| missing checkbox | `requires_acknowledgement` | check required items |
| invalid reason | `requires_reason` | edit reason |
| phrase mismatch | `requires_typed_phrase` | type exact phrase |
| host returns `FORBIDDEN` | `host_rejected` | close and show permission state |
| host returns `VALIDATION_ERROR` | `host_rejected` | revise host form |
| host returns `RATE_LIMITED` | `host_rejected` | retry later |
| host network failure | `host_rejected` | retry or cancel |

The modal must not retry host mutation automatically.

## Implementation Rules
Claude Code must implement:
- pure presentational and validation component
- no direct API call
- no router mutation
- no local storage persistence
- no uncontrolled host submit
- typed acknowledgement return object
- role and action labels from host
- explicit field validation
- safe analytics sanitizer

The host must implement:
- policy-specific context
- backend mutation
- cache invalidation
- success state
- audit event route if available
- permission failure state

## Test Requirements
Unit tests:
- renders action summary
- renders all consequence severities
- disables primary until required checkboxes complete
- disables primary until reason valid
- disables primary until typed phrase matches
- returns acknowledgement object on confirm
- clears reason on close
- clears typed phrase on close
- blocks unknown action key
- does not call any API
- strips forbidden analytics fields

Component tests:
- `tier_2_sensitive` checkbox flow
- `tier_3_privileged` reason plus checkbox flow
- `tier_4_critical` reason plus typed phrase flow
- host submitting state
- host rejected state
- cancel before confirmation
- keyboard focus trap
- Escape cancel before confirmation

Integration tests:
- station status host uses acknowledgement before mutation
- pricing update host uses acknowledgement before mutation
- user access host uses acknowledgement before mutation
- refund settlement host uses acknowledgement before mutation
- export host uses acknowledgement before file generation
- future replay host cannot enable mutation without endpoint support

Accessibility tests:
- alertdialog role used for critical tier
- dialog role used for lower tiers
- title and description are wired
- checkbox errors are announced
- reason errors are announced
- typed phrase errors are announced
- focus returns to trigger

Security tests:
- reason not in analytics
- typed phrase not in analytics
- target IDs not in analytics
- no local storage writes
- no API calls from modal

## E2E Scenarios
Required scenarios:
- `e2e-audit-ack-station-status`: admin acknowledges station impact before station status submit.
- `e2e-audit-ack-pricing`: finance admin acknowledges future quote impact before pricing submit.
- `e2e-audit-ack-user-suspend`: super admin acknowledges access impact before suspend submit.
- `e2e-audit-ack-refund-settlement`: finance admin enters reason and phrase before settlement submit.
- `e2e-audit-ack-export`: admin acknowledges current returned rows and privacy warning before export generation.
- `e2e-audit-ack-cancel`: cancelling does not run host mutation.
- `e2e-audit-ack-no-api`: modal itself never calls backend.

## Done Criteria
The modal is complete when:
1. It renders host-provided action, target, actor role, risk, and consequences.
2. It supports checkbox, reason, typed phrase, and combined acknowledgement modes.
3. It blocks continuation until all local acknowledgement rules pass.
4. It returns a structured acknowledgement object to the host.
5. It never calls APIs directly.
6. It never claims an audit event was written before backend success.
7. It clears sensitive local inputs on close.
8. It keeps reason and typed phrase out of analytics.
9. It uses alertdialog for critical actions and dialog for lower-risk actions.
10. It passes keyboard, focus, screen reader, and reduced-motion checks.
11. It includes host integration tests for station, pricing, user access, refund, export, and future replay gates.
12. It keeps backend audit trail as source of truth.

## Claude Code Build Instruction
Build `AuditSensitiveActionAckModal` as a reusable final acknowledgement gate for privileged admin actions. It must not call APIs; it must show action, target, actor role, risk, and consequences; require the host-selected acknowledgement mode; return a structured acknowledgement object; keep sensitive text out of storage and analytics; and make clear that backend audit events are created only by the host mutation after backend success.

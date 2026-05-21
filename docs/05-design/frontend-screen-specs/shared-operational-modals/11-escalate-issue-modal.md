# Escalate Issue Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `EscalateIssueModal` |
| Component target | shared support and admin issue escalation confirmation modal |
| Primary test ID | `modal-escalate-issue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 admin and support escalation control |
| Used by | `AdminIssueDetail`, `AdminIssueQueue`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminRefundEvidenceReview`, `AdminDeliveryDetail`, future support-admin case workspace |
| Backend coverage | `escalate_issue` |
| Trigger source | issue detail escalation action, blocked delivery issue action, custody exception escalation action, refund evidence issue handoff, support admin review |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `reason_required`, `reason_selected`, `note_required`, `note_invalid`, `evidence_warning`, `already_escalated`, `resolved_blocked`, `closed_blocked`, `role_blocked`, `delivery_missing`, `issue_missing`, `stale_issue`, `submitting`, `server_confirmed`, `server_rejected`, `network_error`, `rate_limited`, `session_expired`, `closing` |

## Product Job
`EscalateIssueModal` lets an authorized admin or support actor escalate one existing support issue with a backend-supported reason and a required accountable note.

It answers:
- `What issue is being escalated?`
- `Why is escalation needed now?`
- `What team or leadership attention does this imply?`
- `What note will become part of the issue record?`
- `Is this issue already escalated, resolved, closed, or stale?`
- `Does the actor have escalation authority?`
- `What exact mutation will be sent?`
- `What changes after escalation succeeds?`

The user should be able to:
- Confirm issue identity and delivery context.
- Select one escalation reason code.
- Write a required note with enough operational context.
- Review consequences before submit.
- Submit once with idempotency.
- See success state and route back to refreshed issue detail.
- Recover from validation, authorization, stale issue, session, network, and backend errors.

This modal is not:
- An issue creation form.
- A resolution form.
- A refund approval surface.
- A custody override.
- A station status override.
- A chat reply composer.
- A customer notification editor.
- A severity editor.
- A reassignment tool.
- A delivery lifecycle mutation.

## Strategic Role
Escalation is a high-signal action. It changes operational visibility, creates an audit-relevant issue update, and may move a case into leadership, support, operations, fraud, payment, loss, or management attention.

Core principle:
- Create issues close to the operational event.
- Triage issues in queue and detail screens.
- Escalate only when normal queue handling is not enough.
- Resolve or close only through `ResolveIssueModal`.
- Keep escalation accountable, reasoned, and reversible only through later resolution, not by overwriting history.

The operational failure this modal prevents:
- Admin escalates without reason.
- Support escalates a resolved or closed issue.
- Finance escalates without authority.
- Escalation note is too vague to guide action.
- Queue screen performs high-risk escalation without detail context.
- Duplicate taps create confusing repeated state updates.
- Sender or receiver sees internal escalation details.

## Audience
Primary users:
- `ops_admin` escalating loss, custody, station, delay, or handoff issues.
- `support_admin` escalating sender, receiver, delivery, proof, or service issues.
- `super_admin` escalating management-level and cross-functional issues.

Secondary users:
- `finance_admin` viewing issue context but generally blocked from escalation unless role rules change.
- QA validating escalation contracts.
- Security reviewers validating role boundaries and redaction.
- Operations leads validating reason taxonomy.
- Claude Code implementing the modal later.

Non-users:
- Public visitors.
- Receivers.
- Senders.
- Drivers.
- Station operators.
- Final-mile couriers.
- Webhook processors.
- Payment provider systems.

## Context Of Use
The modal is opened when an admin is already looking at issue context and decides it needs higher attention.

Common entry contexts:
- `AdminIssueDetail` primary escalation action.
- `AdminIssueQueue` row overflow action that first confirms issue context.
- `AdminManualCustodyException` when a custody conflict needs leadership or loss investigation.
- `AdminBlockedDeliveryQueue` when a blocker is aging or P1.
- `AdminRefundEvidenceReview` when dispute evidence suggests payment, fraud, or management review.
- `AdminDeliveryDetail` when the delivery issue requires escalation from delivery context.

The user may be:
- Working a queue under time pressure.
- Handling a P1 station launch blocker.
- Reviewing loss or damage evidence.
- Handing a payment dispute to finance and operations.
- Escalating because SLA was missed.
- Escalating due to sender request or management attention.
- Recovering from a stale issue state after another admin acted.

## Design Brief
Audience:
- Admin or support actor with authority to escalate issue state.

Surface type:
- High-impact modal over admin issue/detail surfaces.

Primary action:
- `Escalate issue`.

Visual thesis:
- `Escalation control room`: a calm, evidence-forward modal with issue identity, reason selection, required note, consequence preview, and one accountable submit action.

Restraint rule:
- Do not add chat, resolution, refund, custody, assignment, station override, or delivery state controls inside escalation.

Density:
- Medium. The action is simple, but consequence, reason, and note quality matter.

Platform stance:
- Admin web first.
- Mobile-compatible for support admin use, but not optimized as a field-worker shortcut.

## External Research Used
Only directly relevant links were used:
- [PagerDuty Escalation Policy Basics](https://support.pagerduty.com/main/docs/escalation-policies): supports ordered escalation, responder attention, and clear escalation policy concepts for urgent operational issues.
- [Atlassian Opsgenie escalations](https://support.atlassian.com/opsgenie/docs/how-do-escalations-work-in-opsgenie/): supports using escalation rules to notify responders based on condition and time, reinforcing that escalation is a controlled attention-routing action.
- [Atlassian Jira Service Management escalation best practices](https://support.atlassian.com/jira-service-management-cloud/docs/best-practices-for-managing-escalations/): supports explicit escalated statuses, escalation queues, and SLA-aware escalation management.
- [Atlassian Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/check-out-your-queues/): supports queue triage, summaries, statuses, and SLA-oriented work-item handling.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports confirmation for high-impact actions.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level reason and note validation.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submitting, saved, blocked, and error announcements.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable action targets in dense admin interfaces.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/29-admin-issue-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/30-admin-issue-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/11-admin-blocked-delivery-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/06-admin-delivery-detail.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/issues.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/issues.test.ts`

## Backend Reality
Mutation:
- Operation key: `escalate_issue`.
- Route: `POST /v1/issues/:id/escalate`.
- Route param: `issueId`.
- Required route prehandler: admin mutation plus `escalate_case` capability.
- Request schema: `escalateIssueRequestSchema`.
- Response schema: `issueResponseSchema`.
- Idempotent through route key and request fingerprint.

Request body:
```json
{
  "reasonCode": "loss_investigation",
  "note": "Package location is unclear after destination handoff and custody evidence needs operations lead review."
}
```

Allowed reason codes:
- `sender_request`
- `sla_breach`
- `payment_dispute`
- `loss_investigation`
- `fraud_review`
- `management_attention`

Request constraints:
- `reasonCode` is required.
- `note` is required.
- `note` is trimmed.
- `note` minimum length is `5`.
- `note` maximum length is `400`.

Backend behavior:
- Requires an admin principal.
- Requires escalation capability.
- Parses request.
- Fetches issue by ID.
- Fetches linked delivery.
- Sets issue `status` to `escalated`.
- Sets `escalatedAt`.
- Sets `escalatedByActorId`.
- Sets `escalationReasonCode`.
- Updates `updatedAt`.
- Saves issue.
- Queues issue status notification.
- Returns updated issue response.

Important backend realities:
- Backend does not currently reject escalation of an already escalated issue.
- Backend does not currently reject escalation of resolved or closed issues in service code.
- Backend does not store the escalation note as a dedicated field in `issueResponseSchema`.
- Backend uses the note for request validation and idempotency fingerprint, but response stores `escalationReasonCode`, actor, and timestamps.
- UI must still require a useful note because it is part of the auditable request body and future history support.

Frontend guardrail:
- Do not offer escalation for `resolved` or `closed` issues unless product explicitly adds reopen or re-escalation policy later.
- Do not make repeated escalation a normal primary action for an already escalated issue.
- Show current escalation evidence when issue is already escalated.
- Refetch issue after success.

## Access Reality
Allowed action roles:
- `ops_admin`.
- `support_admin`.
- `super_admin`.

Read-only or blocked:
- `finance_admin` can read issue context where backend permits but should not see active escalation CTA unless capability policy changes.
- `sender`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- Anonymous public user.

Capabilities:
- Route requires `escalate_case`.
- Service also treats `resolve_operational_issue` as an escalation-capable internal service capability, but route prehandler specifically requires `escalate_case`.

Frontend rule:
- The UI may use role and capability hints to hide or disable action.
- Backend remains authority.
- If backend returns `FORBIDDEN`, show role-blocked state and do not retry automatically.

## Escalation Reason Model
### `sender_request`
Use when:
- Sender explicitly asks for manager, specialist, or senior support review.
- Sender issue cannot be settled at normal support queue level.
- Sender dispute has evidence requiring admin review.

Do not use when:
- Sender only asks for ordinary status update.
- Issue can be resolved through standard delivery detail or support queue.

Suggested note prompt:
- `State what the sender requested and what evidence or decision is needed.`

### `sla_breach`
Use when:
- Issue has crossed an operational target.
- P1 or P2 work has aged beyond expected handling.
- Station, pickup, payment, or proof issue is blocking delivery progress.

Do not use when:
- The case is still within normal review time.
- SLA cannot be determined from available data.

Suggested note prompt:
- `State the missed target, current age, and next team needed.`

### `payment_dispute`
Use when:
- Payment, refund, provider mismatch, charge, or finance evidence needs escalation.
- Finance evidence review must be linked to the issue.
- Payment outcome blocks delivery or customer resolution.

Do not use when:
- Payment state is simply pending and within normal provider window.

Suggested note prompt:
- `State the payment problem and the finance decision needed.`

### `loss_investigation`
Use when:
- Package cannot be located.
- Custody chain conflicts with physical package location.
- Handoff evidence is missing or contradictory.
- Delivery may require station, courier, driver, and support review.

Do not use when:
- Package location is known and ordinary delay handling is enough.

Suggested note prompt:
- `State last known custody, missing evidence, and who should investigate next.`

### `fraud_review`
Use when:
- Payment, identity, proof, receiver, or package evidence suggests abuse.
- Repeat dispute patterns require fraud or senior operations review.
- Manual action could create financial or custody risk.

Do not use when:
- Evidence only shows a normal mistake or one-off delay.

Suggested note prompt:
- `State the suspicious pattern and what must be verified before action.`

### `management_attention`
Use when:
- Case has reputational, legal, launch-readiness, operational, or cross-team risk.
- Existing reason codes do not cover why leadership attention is needed.
- P1 issue blocks pilot readiness, station operations, or critical customer trust.

Do not use when:
- A more specific reason code fits.

Suggested note prompt:
- `State the business risk and the decision owner needed.`

## Modal Anatomy
The modal has seven zones:

1. Escalation header.
2. Issue identity card.
3. Current state and evidence warning.
4. Reason selection.
5. Required note.
6. Consequence preview.
7. Footer actions.

### Zone 1: Escalation Header
Purpose:
- Make the high-impact action clear before form controls.

Content:
- Title: `Escalate issue`.
- Subtitle: `Send this issue to higher attention with a reason and note.`
- Close control.
- Optional severity chip.
- Optional status chip.

Test IDs:
- `escalate-issue-header`
- `escalate-issue-title`
- `escalate-issue-subtitle`
- `escalate-issue-close-action`
- `escalate-issue-status-chip`
- `escalate-issue-severity-chip`

Rules:
- If issue is P1, header must make severity visible.
- If issue is already escalated, header must say `Already escalated`.
- If action is blocked, header must say why before fields.

### Zone 2: Issue Identity Card
Purpose:
- Prevent wrong-issue escalation.

Content:
- Issue ID.
- Issue summary.
- Category.
- Severity.
- Current status.
- Delivery ID or safe delivery short reference.
- Reporter role.
- Created time.
- Updated time.

Test IDs:
- `escalate-issue-identity-card`
- `escalate-issue-id`
- `escalate-issue-summary`
- `escalate-issue-category`
- `escalate-issue-current-status`
- `escalate-issue-delivery-ref`
- `escalate-issue-reporter-role`
- `escalate-issue-updated-at`

Rules:
- Do not show full receiver phone.
- Do not show raw payment provider reference.
- Do not show full internal audit payload.
- Do not show support-private description to roles that should not see it.
- If delivery is missing, show blocked state and do not submit.

### Zone 3: Current State And Evidence Warning
Purpose:
- Show whether escalation is allowed and what context should be reviewed first.

Allowed state copy:
- `This issue can be escalated. Add a reason and note.`

Already escalated copy:
- `This issue is already escalated. Review the current escalation before taking another action.`

Resolved blocked copy:
- `Resolved issues should not be escalated. Reopen policy is not available in v1.`

Closed blocked copy:
- `Closed issues cannot be escalated from this modal.`

Evidence warning examples:
- `Review custody chain before escalating a loss investigation.`
- `Review payment reconciliation before escalating a payment dispute.`
- `Review refund evidence before escalating a dispute case.`
- `Review delivery timeline before escalating an SLA breach.`

Test IDs:
- `escalate-issue-state-panel`
- `escalate-issue-evidence-warning`
- `escalate-issue-current-escalation`

Rules:
- Evidence warning is advisory unless host marks required evidence as missing.
- Required evidence missing must disable submit until acknowledged or route to the required evidence screen.
- Do not fetch broad evidence inside the modal unless host already loaded it.

### Zone 4: Reason Selection
Purpose:
- Capture backend-supported escalation reason.

Control:
- Radio group or select with visible labels.

Options:
- `Sender request`
- `SLA breach`
- `Payment dispute`
- `Loss investigation`
- `Fraud review`
- `Management attention`

Value mapping:
- `Sender request` -> `sender_request`
- `SLA breach` -> `sla_breach`
- `Payment dispute` -> `payment_dispute`
- `Loss investigation` -> `loss_investigation`
- `Fraud review` -> `fraud_review`
- `Management attention` -> `management_attention`

Test IDs:
- `escalate-issue-reason-group`
- `escalate-issue-reason-sender-request`
- `escalate-issue-reason-sla-breach`
- `escalate-issue-reason-payment-dispute`
- `escalate-issue-reason-loss-investigation`
- `escalate-issue-reason-fraud-review`
- `escalate-issue-reason-management-attention`
- `escalate-issue-reason-error`

Rules:
- No custom reason text in v1.
- Do not send labels to backend.
- Do not invent reason codes.
- Preserve reason if server validation fails.

### Zone 5: Required Note
Purpose:
- Capture accountable operational context.

Field:
- Label: `Escalation note`.
- Helper: `Explain what needs higher attention and what decision or evidence is needed.`
- Max counter: `400`.

Validation:
- Required.
- Trim whitespace.
- Minimum 5 characters.
- Maximum 400 characters.
- Reject only whitespace.
- Warn on vague notes under local copy-quality threshold when possible.

Suggested vague note warnings:
- `Add the decision needed, not only "please review".`
- `Add the evidence or team needed.`
- `Add why normal queue handling is not enough.`

Test IDs:
- `escalate-issue-note-field`
- `escalate-issue-note-input`
- `escalate-issue-note-counter`
- `escalate-issue-note-error`
- `escalate-issue-note-quality-warning`

Rules:
- Do not put sensitive payment provider payloads in note.
- Do not put full receiver phone in note.
- Do not put full staff personal details in note.
- Do not put raw OTP, proof token, webhook signature, or provider secret in note.
- Do not auto-write note without user review.

### Zone 6: Consequence Preview
Purpose:
- Make the backend mutation and operational effect clear.

Preview copy:
- `Status will change to escalated.`
- `Reason will be saved as <reason label>.`
- `Escalated by will be your admin user.`
- `Issue notifications may be queued.`
- `Delivery state will not change.`
- `Refund, custody, station, and payment decisions are not changed by this action.`

Test IDs:
- `escalate-issue-consequence-preview`
- `escalate-issue-status-change`
- `escalate-issue-reason-preview`
- `escalate-issue-notification-preview`
- `escalate-issue-non-effects`

Rules:
- Show non-effects explicitly.
- Never claim a specific person was notified unless backend confirms notification destination.
- Do not imply escalation resolves the issue.

### Zone 7: Footer Actions
Primary:
- `Escalate issue`.

Secondary:
- `Cancel`.

Optional contextual actions:
- `Open custody chain`.
- `Open payment evidence`.
- `Open refund evidence`.
- `Open delivery timeline`.

Test IDs:
- `escalate-issue-primary-action`
- `escalate-issue-cancel-action`
- `escalate-issue-open-custody-action`
- `escalate-issue-open-payment-evidence-action`
- `escalate-issue-open-refund-evidence-action`
- `escalate-issue-open-timeline-action`

Rules:
- Primary disabled until reason and note are valid.
- Primary disabled when issue status is `resolved` or `closed`.
- Primary disabled when actor lacks action authority.
- Primary shows spinner while submitting.
- Cancel disabled only during active submit.

## Data Inputs
```ts
type EscalateIssueModalInput = {
  issue: {
    issueId: string;
    deliveryId: string;
    status: "open" | "in_review" | "escalated" | "resolved" | "closed";
    severity: "p1" | "p2" | "p3";
    category: "delay" | "damage" | "loss" | "payment" | "handoff" | "other";
    summary: string;
    description?: string;
    reporter: {
      actorId: string;
      actorRole: string;
    };
    escalatedAt?: string;
    escalatedByActorId?: string;
    escalationReasonCode?: string;
    createdAt: string;
    updatedAt: string;
  };
  actor: {
    userId: string;
    role: string;
    canEscalateIssue: boolean;
  };
  deliveryContext?: {
    deliveryShortRef?: string;
    currentStatus?: string;
    paymentStatus?: string;
    originStationId?: string;
    destinationStationId?: string;
  };
  openedFrom:
    | "admin_issue_detail"
    | "admin_issue_queue"
    | "admin_manual_custody_exception"
    | "admin_blocked_delivery_queue"
    | "admin_refund_evidence_review"
    | "admin_delivery_detail"
    | "support_case_workspace";
  evidenceHints?: Array<
    | "custody_chain_recommended"
    | "delivery_timeline_recommended"
    | "payment_evidence_recommended"
    | "refund_evidence_recommended"
    | "proof_evidence_recommended"
  >;
};
```

Required:
- `issue.issueId`.
- `issue.status`.
- `issue.severity`.
- `issue.category`.
- `issue.summary`.
- `actor.canEscalateIssue`.

Optional:
- Delivery context.
- Evidence hints.
- Current escalation fields.

## Data Output
Success output:
```ts
type EscalateIssueSuccess = {
  kind: "issue_escalated";
  issueId: string;
  deliveryId: string;
  status: "escalated";
  escalationReasonCode: string;
  escalatedAt: string;
  escalatedByActorId: string;
  updatedAt: string;
};
```

Host responsibilities after success:
- Close modal or show saved state briefly.
- Refetch `get_issue`.
- Invalidate `Issue` and `IssueList`.
- Refresh queue counts if visible.
- Keep user on issue detail unless entry context chooses queue return.
- Do not assume delivery state changed.

Blocked output:
```ts
type EscalateIssueBlocked = {
  kind:
    | "already_escalated"
    | "resolved_blocked"
    | "closed_blocked"
    | "role_blocked"
    | "delivery_missing"
    | "issue_missing"
    | "stale_issue";
  issueId?: string;
};
```

## State Machine
Normal flow:
```text
closed
  -> opening
  -> context_loading
  -> ready
  -> reason_selected
  -> note_valid
  -> submitting
  -> server_confirmed
  -> closing
```

Validation flow:
```text
ready -> reason_required
reason_selected -> note_required
note_required -> note_invalid
note_invalid -> reason_selected
reason_selected -> submitting
```

Blocked flow:
```text
context_loading -> role_blocked
context_loading -> already_escalated
context_loading -> resolved_blocked
context_loading -> closed_blocked
context_loading -> issue_missing
context_loading -> delivery_missing
context_loading -> stale_issue
```

Failure flow:
```text
submitting -> server_rejected
submitting -> network_error
submitting -> rate_limited
submitting -> session_expired
server_rejected -> ready
network_error -> ready
rate_limited -> ready
session_expired -> closing_to_sign_in
```

## API Call
Endpoint:
```http
POST /v1/issues/:id/escalate
```

Request:
```json
{
  "reasonCode": "sla_breach",
  "note": "P1 handoff issue has passed the same-day review target and needs operations lead ownership."
}
```

Headers:
- Auth bearer token.
- `Idempotency-Key`.
- Standard app request headers.

Response:
```json
{
  "issueId": "ISS-9301",
  "deliveryId": "DEL-9301",
  "status": "escalated",
  "severity": "p2",
  "category": "damage",
  "summary": "Package arrived damaged",
  "reporter": {
    "actorId": "USR-SND-001",
    "actorRole": "sender"
  },
  "escalatedAt": "2026-05-16T15:00:00.000Z",
  "escalatedByActorId": "USR-OPS-001",
  "escalationReasonCode": "loss_investigation",
  "createdAt": "2026-05-16T14:30:00.000Z",
  "updatedAt": "2026-05-16T15:00:00.000Z"
}
```

Do not send:
- Severity changes.
- Status changes other than backend escalation.
- Resolution code.
- Refund decision.
- Delivery state update.
- Custody override.
- Assignee fields not supported by backend.
- Internal evidence payloads.

## Error Mapping
| Backend/Error | Modal State | User Copy |
| --- | --- | --- |
| `VALIDATION_ERROR` | `note_invalid` or `reason_required` | `Check the reason and note before escalating.` |
| `FORBIDDEN` | `role_blocked` | `Your role cannot escalate this issue.` |
| `NOT_FOUND` for issue | `issue_missing` | `This issue could not be found. Refresh the queue.` |
| `NOT_FOUND` for linked delivery | `delivery_missing` | `The delivery linked to this issue could not be found. Escalation is blocked until support reviews the record.` |
| `RATE_LIMITED` | `rate_limited` | `Too many requests. Wait and try again.` |
| Session expired | `session_expired` | `Sign in again to escalate this issue.` |
| Network timeout | `network_error` | `Connection failed. Your escalation was not submitted.` |
| Unexpected backend error | `server_rejected` | `Escalation failed. Try again or open support operations.` |

Rules:
- Keep field errors next to fields.
- Put global errors in modal status area.
- Preserve reason and note after recoverable failure.
- Clear submission spinner after failure.
- Never claim escalation succeeded until backend confirms.

## Interaction Rules
### Opening
- Host passes loaded issue context when possible.
- If context is not loaded, modal shows compact loading state.
- Focus moves to title, then first invalid or first actionable control.
- Background becomes inert.

### Reason Selection
- Selecting a reason updates consequence preview.
- Reason-specific guidance appears under note helper.
- Do not auto-submit after reason selection.

### Note Entry
- Counter updates as user types.
- Trim validation runs on blur and submit.
- Local warning can flag vague notes without blocking if min/max pass.
- Backend validation remains authority.

### Submit
- Submit disabled until reason and note are valid.
- Submit sends only reason and note.
- Submit uses one idempotency key per modal open and request fingerprint.
- Duplicate clicks are blocked.
- Submit cannot be queued offline.

### Closing
- Unsaved changes require close confirmation if reason or note has changed.
- Close is disabled during active submit.
- After success, close returns focus to triggering action or routes host to refreshed issue detail.

### Keyboard
- `Escape` closes only when not submitting and no unsaved form change, or opens close confirmation.
- `Enter` submits only when focus is not in multiline note and form is valid.
- `Cmd+Enter` or `Ctrl+Enter` may submit from note field if platform convention allows.
- `Tab` remains inside modal.

## Visual Design System
### Art Direction
This modal must look like a serious operations control, not a casual confirmation pop-up.

Visual traits:
- Strong issue identity at top.
- Clear severity and status badges.
- Reason choices with short explanations.
- Required note area with visible counter.
- Consequence panel with non-effects.
- Restrained color.
- No decorative alert clutter.

### Layout
Desktop:
- Centered modal, max width around 640 to 720 px.
- Scroll body if content exceeds viewport.
- Sticky footer.

Tablet:
- Centered modal or right-side action panel.
- Reason cards may become two columns if space allows.

Mobile admin:
- Full-height sheet.
- Reason choices stacked.
- Note field visible above footer.
- Footer respects safe area.

### Color
- P1 severity uses urgent accent.
- P2 uses warning accent.
- P3 uses neutral informational accent.
- Escalation action uses serious primary color, not destructive red unless escalation is policy-marked as destructive.
- Blocked states use error color plus explicit text.

### Typography
- Title: direct and compact.
- Issue summary: medium emphasis, not larger than title.
- Reason labels: strong.
- Reason descriptions: concise and secondary.
- Note helper: operational, not legalistic.

### Motion
- Modal opens with subtle opacity and scale.
- Reason selected state transitions with immediate but restrained feedback.
- Success can show one short confirmation state.
- No looping motion.
- Respect reduced motion.

## Content Specification
Header title:
- `Escalate issue`

Header subtitle:
- `Send this issue to higher attention with a reason and note.`

Reason label:
- `Escalation reason`

Reason error:
- `Choose an escalation reason.`

Note label:
- `Escalation note`

Note helper:
- `Explain why this needs higher attention and what decision or evidence is needed.`

Note required error:
- `Add an escalation note.`

Note too short error:
- `Use at least 5 characters.`

Note too long error:
- `Use 400 characters or fewer.`

Consequence heading:
- `What will happen`

Non-effect copy:
- `This will not resolve the issue, change delivery state, approve a refund, or override custody.`

Primary action:
- `Escalate issue`

Submitting:
- `Escalating issue`

Success:
- `Issue escalated.`

Already escalated:
- `This issue is already escalated.`

Resolved blocked:
- `Resolved issues should not be escalated in v1.`

Closed blocked:
- `Closed issues cannot be escalated.`

Role blocked:
- `Your role cannot escalate this issue.`

## Reason Option Copy
### Sender request
Label:
- `Sender request`

Description:
- `The sender requested senior support or a decision outside normal queue handling.`

### SLA breach
Label:
- `SLA breach`

Description:
- `The issue has crossed an operational target or is at risk of blocking service.`

### Payment dispute
Label:
- `Payment dispute`

Description:
- `Payment, refund, or provider evidence needs finance or senior review.`

### Loss investigation
Label:
- `Loss investigation`

Description:
- `Package location, custody, or handoff evidence is unclear.`

### Fraud review
Label:
- `Fraud review`

Description:
- `Evidence suggests abuse, identity risk, payment risk, or repeated dispute pattern.`

### Management attention
Label:
- `Management attention`

Description:
- `The issue has operational, launch, legal, reputational, or cross-team risk.`

## Security And Privacy Rules
Do not render:
- Full receiver phone.
- Raw payment provider payload.
- Payment provider secret.
- Webhook signature.
- OTP.
- Proof upload URL.
- Verification token.
- Internal audit payload.
- Private staff contact details.

Do not send in analytics:
- Note text.
- Issue description text.
- Receiver phone.
- Sender phone.
- Provider reference.
- Payment provider payload.
- Staff personal data.

Allowed analytics properties:
- `issueIdHash`.
- `deliveryIdHash`.
- `reasonCode`.
- `issueStatus`.
- `issueSeverity`.
- `issueCategory`.
- `openedFrom`.
- `result`.
- `errorCode`.
- `hasEvidenceWarning`.

Storage:
- Form state lives in memory.
- Do not persist note draft outside modal unless host provides explicit encrypted draft behavior later.
- Clear form state on close after success.
- Preserve form state on recoverable network error.

Audit:
- Backend records escalated actor, time, reason, and update time.
- Frontend should not claim full audit completeness until backend exposes dedicated history.
- If an audit event screen exists, host may link to it after refresh.

## Accessibility Requirements
Modal:
- `role="alertdialog"` is acceptable because escalation has consequence and requires confirmation.
- `role="dialog"` is also acceptable if consequence is not presented as destructive.
- `aria-modal="true"` where applicable.
- Labelled by visible title.
- Described by consequence preview and current state.
- Background inert.
- Focus trapped.
- Focus returns to trigger.

Fields:
- Reason group has visible label and fieldset/legend equivalent.
- Note field has visible label.
- Errors are linked through `aria-describedby`.
- Character counter is announced politely only when helpful.

Status:
- Submit, success, and failure states use status messages.
- Do not move focus to every status update unless user action requires it.
- On validation failure, move focus to first invalid control.

Keyboard:
- All reason choices reachable.
- Radio group arrow behavior follows platform expectations.
- Footer actions reachable in logical order.
- Contextual evidence links reachable but secondary.

Touch:
- Reason choices and footer controls meet target size guidance.
- Dense admin layout must still allow accurate clicks.

Motion:
- Reduced motion mode removes scale transitions and nonessential animation.

## Host Integration
### `AdminIssueDetail`
Primary owner:
- Opens modal from escalation action.
- Passes full issue response.
- Passes delivery context if loaded.
- Refetches issue after success.
- Keeps user on detail page.

### `AdminIssueQueue`
Allowed only when:
- Row has enough issue identity.
- User confirms issue context in modal.
- Host refetches row or invalidates list after success.

Preferred behavior:
- Route to `AdminIssueDetail` before escalation for P1, loss, fraud, or payment dispute.

### `AdminManualCustodyException`
Use when:
- Custody conflict needs `loss_investigation`, `fraud_review`, or `management_attention`.

Required warning:
- `Review custody chain before escalating.`

### `AdminRefundEvidenceReview`
Use when:
- Dispute needs `payment_dispute`, `fraud_review`, or `management_attention`.

Required warning:
- `Review payment and refund evidence before escalating.`

### `AdminBlockedDeliveryQueue`
Use when:
- Blocked delivery issue is aging or severe.

Required warning:
- `Escalation does not unblock delivery state by itself.`

## Data Freshness Rules
Before submit:
- If issue context is older than host freshness threshold, host should refetch or show stale warning.
- If status changed to `resolved` or `closed`, block submit.
- If status changed to `escalated`, show current escalation evidence.
- If issue no longer exists, show `issue_missing`.
- If linked delivery no longer exists, show `delivery_missing`.

After submit:
- Refetch issue.
- Invalidate issue list.
- Invalidate admin overview issue counts when present.
- Invalidate blocked delivery queue when issue affects visible blockers.
- Do not invalidate delivery timeline unless host uses issue events in timeline.

## Offline And Low-Bandwidth Behavior
Escalation is not offline-queueable in v1.

Reason:
- It changes administrative issue state.
- It may trigger notifications.
- It requires fresh issue status.
- It should not be replayed after issue is resolved or closed by another admin.

Offline state:
- Disable primary action.
- Preserve typed note in memory while modal remains open.
- Show copy: `Escalation needs an online connection and fresh issue status.`
- Offer `Close` and `Retry when online`.

Low bandwidth:
- Keep issue identity card compact.
- Avoid loading heavy evidence inside modal.
- Use text-first states.
- Retry mutation only after explicit user action unless network layer safely retries same idempotency key.

## Validation Rules
Reason:
- Required.
- Must be one of backend enum values.
- Invalid reason from stale client config blocks submit and asks user to refresh.

Note:
- Required.
- Trim before submit.
- Minimum 5 characters after trim.
- Maximum 400 characters after trim.
- Preserve line breaks if multiline is allowed.
- Collapse excessive whitespace only if product copy rules require it.

Issue:
- Must have `issueId`.
- Must not be `resolved`.
- Must not be `closed`.
- Already `escalated` is read-only unless host explicitly opens re-escalation policy later.

Actor:
- Must have `canEscalateIssue=true`.
- Backend may still reject; UI must handle.

## Testing Requirements
### Unit Tests
Must cover:
- Renders issue identity.
- Shows status and severity.
- Requires reason.
- Requires note.
- Rejects note under 5 characters.
- Rejects note over 400 characters.
- Maps reason labels to backend values.
- Shows reason-specific helper copy.
- Shows consequence preview.
- Disables primary while invalid.
- Disables primary while submitting.
- Blocks resolved issue.
- Blocks closed issue.
- Shows already escalated state.
- Blocks actor without escalation authority.
- Preserves form state after network error.
- Clears form state after success.

### Integration Tests
Must cover:
- Submits `POST /v1/issues/:id/escalate`.
- Sends only `reasonCode` and `note`.
- Sends idempotency key.
- Invalidates `Issue` and `IssueList` after success.
- Maps `FORBIDDEN` to role-blocked copy.
- Maps `NOT_FOUND` issue to missing issue copy.
- Maps validation error to field errors.
- Handles session expiry.
- Does not call `resolve_issue`.
- Does not call refund endpoints.
- Does not call custody or delivery lifecycle mutations.
- Does not call station override endpoints.

### Accessibility Tests
Must cover:
- Dialog or alertdialog role.
- Modal labelled by visible title.
- Reason group accessible name.
- Note field accessible name.
- Validation focus moves to first invalid field.
- Focus trap.
- Focus return.
- Keyboard radio navigation.
- Escape behavior.
- Live success and error announcement.
- High contrast status badges.
- Reduced motion behavior.

### Security Tests
Must cover:
- Note text not sent to analytics.
- Issue description not sent to analytics.
- Receiver phone not rendered.
- Provider secret not rendered.
- Forbidden data is redacted from error logs.
- Role-blocked user cannot submit from UI.
- Backend `FORBIDDEN` still blocks even if UI capability hint is wrong.

## QA Scenarios
### Happy Path
1. Admin opens issue detail.
2. Admin opens `EscalateIssueModal`.
3. Modal shows issue identity.
4. Admin chooses `Loss investigation`.
5. Admin writes note.
6. Consequence preview updates.
7. Admin submits.
8. Backend returns status `escalated`.
9. Modal shows success.
10. Host refetches issue and closes modal.

### Missing Reason
1. Admin enters valid note.
2. Admin submits without reason.
3. Modal focuses reason group.
4. Error says choose an escalation reason.

### Missing Note
1. Admin chooses reason.
2. Admin submits without note.
3. Modal focuses note field.
4. Error says add escalation note.

### Already Escalated
1. Modal opens for issue with status `escalated`.
2. Current escalation evidence appears.
3. Primary submit is disabled.
4. Host can route to issue detail or resolution flow.

### Resolved Issue
1. Modal opens for issue with status `resolved`.
2. Modal blocks escalation.
3. Copy explains v1 does not escalate resolved issues.

### Role Blocked
1. Finance admin opens issue detail.
2. Escalation action is hidden or disabled.
3. If modal opens through stale UI, it shows role-blocked state.
4. Submit is unavailable.

### Network Failure
1. Admin completes form.
2. Submit fails from network timeout.
3. Modal keeps reason and note.
4. Admin can retry with same idempotency key.

### Backend Validation Failure
1. Client sends stale unsupported reason code.
2. Backend returns validation error.
3. Modal shows validation error and asks refresh.

## Implementation Notes For Claude Code
Build this as a shared admin/support modal, not as logic embedded into `AdminIssueDetail`.

Recommended components:
- `EscalateIssueModal`.
- `EscalateIssueIdentityCard`.
- `EscalateIssueStatePanel`.
- `EscalationReasonPicker`.
- `EscalationNoteField`.
- `EscalationConsequencePreview`.
- `EscalationEvidenceLinks`.
- `EscalationFooter`.

Recommended hooks:
- `useEscalateIssueForm`.
- `useEscalateIssueMutation`.
- `useIssueEscalationGuards`.
- `useEscalationAnalyticsRedaction`.

Mutation rules:
- Build request body from validated form state only.
- Use `escalate_issue` mutation wrapper.
- Include `Idempotency-Key`.
- Disable duplicate submit.
- Invalidate `Issue` and `IssueList` tags.
- Let host decide whether to invalidate admin dashboard counts.

Do not implement:
- Resolution inside this modal.
- Refund approval inside this modal.
- Severity editing inside this modal.
- Direct assignee selection unless backend adds it later.
- Customer message composer.
- Delivery state mutation.
- Custody override.
- Offline queue.
- Public issue escalation.

## Acceptance Criteria
This file is complete only when implementation can satisfy all of these:
- Modal opens with issue identity and current status.
- Only authorized admin/support actors can submit.
- Reason code is required and restricted to backend enum.
- Note is required and validated to 5..400 characters.
- Consequence preview shows effects and non-effects.
- Resolved, closed, and already escalated issues are safely blocked or read-only.
- Submit calls only `escalate_issue`.
- Success refetches issue and invalidates issue lists.
- Errors map to safe user copy.
- Form does not leak note text or sensitive issue fields to analytics.
- Modal is accessible as a serious confirmation dialog.
- Offline submit is blocked.
- Tests cover validation, authorization, mutation, accessibility, and redaction.

## Final Quality Bar
The modal should feel like a senior operations escalation control:
- It makes urgency clear without drama.
- It demands a useful reason and note.
- It prevents accidental state changes.
- It protects customer and operational data.
- It respects backend authority.
- It leaves no ambiguity that escalation is not resolution.

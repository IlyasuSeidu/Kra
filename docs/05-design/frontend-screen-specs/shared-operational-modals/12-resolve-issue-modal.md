# Resolve Issue Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `ResolveIssueModal` |
| Component target | shared admin and support issue review, resolution, and closure modal |
| Primary test ID | `modal-resolve-issue` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 admin and support issue lifecycle control |
| Used by | `AdminIssueDetail`, `AdminIssueQueue`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminRefundEvidenceReview`, `AdminDeliveryDetail`, future support-admin case workspace |
| Backend coverage | `resolve_issue` |
| Trigger source | issue detail resolution action, start-review action, close action, blocked delivery queue issue action, refund evidence issue action |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `transition_selecting`, `review_ready`, `resolve_ready`, `close_ready`, `resolution_code_required`, `resolution_code_selected`, `note_required`, `note_invalid`, `evidence_missing`, `already_resolved`, `already_closed`, `transition_blocked`, `role_blocked`, `issue_missing`, `delivery_missing`, `stale_issue`, `submitting`, `server_confirmed`, `server_rejected`, `network_error`, `rate_limited`, `session_expired`, `closing` |

## Product Job
`ResolveIssueModal` lets an authorized admin move one issue through backend-supported review, resolution, or closure with a required note and, when needed, a resolution code.

It answers:
- `What issue is being acted on?`
- `Which transition is allowed from the current status?`
- `Is this a review start, a resolution, or a closure?`
- `What resolution code should be recorded?`
- `What note explains the decision?`
- `What linked evidence should be checked first?`
- `What will not change when this issue action is submitted?`
- `What changed after the backend accepts the action?`

The user should be able to:
- Confirm issue identity.
- Choose or confirm the allowed transition.
- Select a backend-supported resolution code when required.
- Write a required note.
- Review consequences and non-effects.
- Submit once with idempotency.
- Recover from stale issue, invalid transition, authorization, network, rate-limit, and session errors.
- Return to refreshed issue detail after success.

This modal is not:
- An issue creation form.
- An escalation form.
- A refund approval or settlement action.
- A payment verification action.
- A delivery status override.
- A custody override.
- A customer reply composer.
- A package proof upload flow.
- A station validation flow.
- A place to edit issue severity, category, or summary.

## Strategic Role
Issue resolution is the operational end of a case workflow. It must be precise because it can affect customer trust, refund decisions, launch-readiness metrics, station blockers, and post-incident analysis.

Core principle:
- Start review only when the issue is open and someone is taking ownership.
- Resolve only when evidence supports a clear outcome.
- Close only after the issue has already been resolved.
- Use escalation for higher attention, not closure.
- Use refund and custody tools for their own decisions, not this modal.
- Leave a note clear enough for the next reviewer to understand the decision.

The operational failure this modal prevents:
- Admin closes an issue without resolution.
- Issue is marked resolved without a required resolution code.
- Finance outcome is implied without using refund tooling.
- Custody is treated as fixed without custody evidence.
- Sender or receiver sees internal resolution notes.
- A stale issue is resolved after another admin already changed it.
- The modal mutates delivery state when only issue state should change.

## Audience
Primary users:
- `ops_admin` resolving operational, handoff, loss, damage, station, and custody issues.
- `support_admin` resolving support, sender, receiver, delivery, and proof issues.
- `super_admin` resolving or closing sensitive or cross-functional issues.

Secondary users:
- `finance_admin` reading issue context and routing to finance-specific screens, generally not resolving from this modal unless role policy changes.
- QA validating issue transition rules.
- Security reviewers validating note and evidence redaction.
- Operations leads validating decision taxonomy.
- Claude Code implementing the modal later.

Non-users:
- Public visitors.
- Receivers.
- Senders.
- Drivers.
- Station operators.
- Final-mile couriers.
- Payment provider systems.
- Webhook processors.

## Context Of Use
The modal opens from an admin or support issue context after the reviewer has inspected enough evidence to act.

Common entry contexts:
- `AdminIssueDetail` primary `Start review`, `Resolve issue`, or `Close issue` action.
- `AdminIssueQueue` row action after enough context is available or after routing through detail.
- `AdminManualCustodyException` after custody evidence has been reviewed.
- `AdminBlockedDeliveryQueue` after blocker evidence has been reviewed.
- `AdminRefundEvidenceReview` after refund or dispute evidence has been reviewed.
- `AdminDeliveryDetail` after delivery timeline, custody, proof, or payment evidence has been reviewed.

The user may be:
- Accepting an open issue into review.
- Resolving a completed delivery issue.
- Resolving a refund-approved dispute.
- Closing a resolved case after follow-up.
- Denying a policy request.
- Marking a duplicate report after finding the primary issue.
- Confirming station evidence.
- Handling a stale issue after another admin acted.

## Design Brief
Audience:
- Admin or support actor with issue-management authority.

Surface type:
- High-impact modal over issue detail and admin work queues.

Primary action:
- Varies by transition: `Start review`, `Resolve issue`, or `Close issue`.

Visual thesis:
- `Decision ledger`: a restrained, audit-ready modal that makes the current issue, allowed transition, required code, note, evidence, and non-effects impossible to miss.

Restraint rule:
- Do not bundle escalation, refund, custody, payment verification, station override, or delivery lifecycle changes into issue resolution.

Density:
- Medium-high. Resolution needs enough evidence and decision clarity without turning into a case detail page.

Platform stance:
- Admin web first.
- Mobile-compatible for support admin use.
- Not a field-worker shortcut.

## External Research Used
Only directly relevant links were used:
- [Zendesk ticket fields and statuses](https://support.zendesk.com/hc/en-us/articles/4408886739098-About-ticket-fields): supports clear distinctions between open, solved, and closed support work, including that closed work is treated as complete and cannot be reopened in the same way.
- [Zendesk trigger conditions and actions reference](https://support.zendesk.com/hc/en-us/articles/4408893545882-Ticket-trigger-conditions-and-actions-reference): supports status category semantics and the difference between active, solved, and closed ticket states.
- [PagerDuty incident resolution documentation](https://support.pagerduty.com/main/docs/incidents): supports explicit incident state handling and controlled resolution of operational incidents.
- [Atlassian Jira Service Management issue workflow guidance](https://support.atlassian.com/jira-service-management-cloud/docs/set-up-rules-to-track-sla-performance/): supports SLA-aware service work and the need to track resolution state changes accurately.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports confirmation for high-impact state changes.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors for transition, resolution code, and note.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submitting, saved, blocked, and failed states.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable action targets in admin interfaces.

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
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
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
- Operation key: `resolve_issue`.
- Route: `POST /v1/issues/:id/resolve`.
- Route param: `issueId`.
- Required prehandler: authenticated admin mutation plus issue management capability.
- Request schema: `resolveIssueRequestSchema`.
- Response schema: `issueResponseSchema`.
- Idempotent through route key and request fingerprint.

Request body for starting review:
```json
{
  "nextStatus": "in_review",
  "note": "Support has accepted this issue for review and is checking custody evidence."
}
```

Request body for resolving:
```json
{
  "nextStatus": "resolved",
  "resolutionCode": "delivery_completed",
  "note": "Delivery was completed after receiver proof was verified."
}
```

Request body for closing:
```json
{
  "nextStatus": "closed",
  "resolutionCode": "delivery_completed",
  "note": "Resolved case closed after final review."
}
```

Allowed next statuses:
- `in_review`
- `resolved`
- `closed`

Allowed resolution codes:
- `station_confirmed`
- `delivery_completed`
- `refund_approved`
- `sender_withdrew`
- `duplicate_report`
- `policy_denied`

Request constraints:
- `nextStatus` is required.
- `note` is required.
- `note` is trimmed.
- `note` minimum length is `5`.
- `note` maximum length is `400`.
- `resolutionCode` is required when `nextStatus` is `resolved` or `closed`.
- `resolutionCode` is optional and should not be sent for `in_review`.

Backend transition rules:
- `in_review` is allowed only when current issue status is `open`.
- `resolved` is rejected only when current issue status is `closed`.
- `closed` is allowed only when current issue status is `resolved`.

Frontend stricter rules:
- Show `Start review` only for `open`.
- Show `Resolve issue` for `open`, `in_review`, or `escalated`.
- Show `Close issue` only for `resolved`.
- Treat already `closed` as read-only.
- Treat already `resolved` as close-ready, not resolve-ready.
- Refetch issue before action when context is stale.

Backend behavior:
- Requires admin principal.
- Requires issue management capability.
- Fetches issue.
- Fetches linked delivery.
- Validates transition.
- Saves new status.
- Saves `resolutionNote`.
- Saves `resolutionCode` when provided.
- If resolving, saves `resolvedAt` and `resolvedByActorId`.
- If closing, saves `closedAt` and `closedByActorId`.
- Updates `updatedAt`.
- Queues issue status notification.
- Returns updated issue response.

## Access Reality
Allowed action roles:
- `ops_admin`.
- `support_admin`.
- `super_admin`.

Read-only or blocked:
- `finance_admin` can read issue context where backend permits but should not resolve unless role policy changes.
- `sender`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- Anonymous public user.

Capabilities:
- Backend service accepts `manage_issue_thread` or `resolve_operational_issue`.
- Route prehandler requires issue management scope through admin mutation.

Frontend rule:
- Hide or disable actions when actor lacks issue management authority.
- Backend remains authority.
- If backend returns `FORBIDDEN`, show role-blocked state and do not retry automatically.

## Transition Modes
### `start_review`
Backend request:
- `nextStatus=in_review`.
- `note` required.
- No `resolutionCode`.

Allowed current status:
- `open`.

Primary CTA:
- `Start review`.

Use when:
- Issue is open and an admin is taking ownership.
- More evidence is needed before resolving.

Non-effects:
- Does not escalate issue.
- Does not resolve issue.
- Does not change delivery state.

### `resolve`
Backend request:
- `nextStatus=resolved`.
- `resolutionCode` required.
- `note` required.

Allowed current statuses:
- `open`.
- `in_review`.
- `escalated`.

Primary CTA:
- `Resolve issue`.

Use when:
- Evidence supports a clear outcome.
- Needed delivery, refund, custody, or station action has already happened in its owner workflow.

Non-effects:
- Does not close issue.
- Does not approve refund unless refund workflow already did.
- Does not complete delivery unless delivery workflow already did.
- Does not override custody.

### `close`
Backend request:
- `nextStatus=closed`.
- `resolutionCode` required.
- `note` required.

Allowed current status:
- `resolved`.

Primary CTA:
- `Close issue`.

Use when:
- Issue was resolved and final review is complete.
- No further operational action is expected.

Non-effects:
- Does not reopen or re-resolve.
- Does not delete the issue.
- Does not remove audit history.

## Resolution Code Model
### `station_confirmed`
Use when:
- Station evidence confirms package state, receipt, availability, or pickup status.
- Station review resolves uncertainty.

Do not use when:
- Station status was not part of the issue.
- Package remains missing.

Note prompt:
- `State what the station confirmed and where the evidence can be found.`

### `delivery_completed`
Use when:
- Delivery has been completed through proper lifecycle flow.
- Proof and timeline support the completion.

Do not use when:
- Delivery completion has not happened yet.
- Issue is only expected to complete later.

Note prompt:
- `State the completion evidence and proof source.`

### `refund_approved`
Use when:
- Refund was approved in refund workflow.
- Issue resolution depends on that finance decision.

Do not use when:
- Refund is still pending or only recommended.
- Policy denied the refund.

Note prompt:
- `State the refund decision reference or evidence screen reviewed.`

### `sender_withdrew`
Use when:
- Sender withdrew complaint or confirmed no further action is required.
- Support has record of sender withdrawal.

Do not use when:
- Sender is unreachable.
- Staff assumes sender is satisfied without confirmation.

Note prompt:
- `State how sender withdrawal was confirmed.`

### `duplicate_report`
Use when:
- Issue duplicates another issue or known record.
- Primary issue remains open or already resolved.

Do not use when:
- The issue merely looks similar but requires separate action.

Note prompt:
- `State the primary issue ID or record that owns follow-up.`

### `policy_denied`
Use when:
- Requested outcome is denied by policy after evidence review.
- Support or operations has enough reason to close or resolve with denial.

Do not use when:
- More evidence is needed.
- Refund review is still pending.

Note prompt:
- `State the policy reason and evidence reviewed.`

## Modal Anatomy
The modal has eight zones:

1. Header.
2. Issue identity card.
3. Transition selector or fixed transition summary.
4. Evidence checklist.
5. Resolution code selector.
6. Required note.
7. Consequence preview.
8. Footer actions.

### Zone 1: Header
Purpose:
- Make the selected issue action clear.

Title by mode:
- `Start issue review`.
- `Resolve issue`.
- `Close issue`.

Subtitle:
- `Record the issue decision with a note and required outcome.`

Test IDs:
- `resolve-issue-header`
- `resolve-issue-title`
- `resolve-issue-subtitle`
- `resolve-issue-close-action`
- `resolve-issue-status-chip`
- `resolve-issue-severity-chip`

Rules:
- Header must show current status.
- Header must show blocked reason before form fields when action is not allowed.
- If issue is escalated, show escalated chip.

### Zone 2: Issue Identity Card
Purpose:
- Prevent wrong-issue action.

Content:
- Issue ID.
- Summary.
- Category.
- Severity.
- Current status.
- Delivery reference.
- Reporter role.
- Created time.
- Updated time.
- Escalated state when present.

Test IDs:
- `resolve-issue-identity-card`
- `resolve-issue-id`
- `resolve-issue-summary`
- `resolve-issue-category`
- `resolve-issue-current-status`
- `resolve-issue-delivery-ref`
- `resolve-issue-reporter-role`
- `resolve-issue-updated-at`
- `resolve-issue-escalated-chip`

Rules:
- Do not show full receiver phone.
- Do not show payment provider payloads.
- Do not show raw proof references unless already allowed by host evidence screen.
- Do not expose support-private description to unsupported roles.

### Zone 3: Transition Selector Or Summary
Purpose:
- Confirm what state transition will be sent.

Patterns:
- If host opens with a specific action, show fixed transition summary.
- If host opens generic `resolve_issue` action, allow transition selection among currently allowed transitions.

Allowed options by current status:
- `open`: `Start review` or `Resolve issue`.
- `in_review`: `Resolve issue`.
- `escalated`: `Resolve issue`.
- `resolved`: `Close issue`.
- `closed`: no action.

Test IDs:
- `resolve-issue-transition-section`
- `resolve-issue-transition-start-review`
- `resolve-issue-transition-resolve`
- `resolve-issue-transition-close`
- `resolve-issue-transition-error`

Rules:
- Do not show backend-unsupported transitions.
- Do not allow `closed` from `open`.
- Do not allow `in_review` from `escalated`.
- Preserve user transition choice after recoverable server error if still valid.

### Zone 4: Evidence Checklist
Purpose:
- Make sure the admin has checked the correct evidence before ending issue work.

Evidence items by category:
- `delay`: delivery timeline, station or route timestamps.
- `damage`: package condition evidence, station notes, photo proof when available.
- `loss`: custody chain, scan history, station handoffs, issue history.
- `payment`: payment reconciliation, refund evidence, provider verification when available.
- `handoff`: custody chain, handoff events, package scans, proof events.
- `other`: issue description, delivery detail, linked support notes.

Test IDs:
- `resolve-issue-evidence-checklist`
- `resolve-issue-evidence-item`
- `resolve-issue-evidence-warning`
- `resolve-issue-open-evidence-action`

Rules:
- Checklist is advisory unless host marks evidence as required.
- Required evidence missing disables submit until reviewed or acknowledged according to host policy.
- Do not fetch heavy evidence inside modal if host has not loaded it.
- Link out to owner screens for evidence.

### Zone 5: Resolution Code Selector
Purpose:
- Capture backend-required decision code for `resolved` and `closed`.

Visible when:
- Transition is `resolved`.
- Transition is `closed`.

Hidden when:
- Transition is `in_review`.

Options:
- `Station confirmed`.
- `Delivery completed`.
- `Refund approved`.
- `Sender withdrew`.
- `Duplicate report`.
- `Policy denied`.

Value mapping:
- `Station confirmed` -> `station_confirmed`.
- `Delivery completed` -> `delivery_completed`.
- `Refund approved` -> `refund_approved`.
- `Sender withdrew` -> `sender_withdrew`.
- `Duplicate report` -> `duplicate_report`.
- `Policy denied` -> `policy_denied`.

Test IDs:
- `resolve-issue-resolution-code-group`
- `resolve-issue-code-station-confirmed`
- `resolve-issue-code-delivery-completed`
- `resolve-issue-code-refund-approved`
- `resolve-issue-code-sender-withdrew`
- `resolve-issue-code-duplicate-report`
- `resolve-issue-code-policy-denied`
- `resolve-issue-resolution-code-error`

Rules:
- Required for resolve and close.
- Do not send labels to backend.
- Do not invent codes.
- Do not show for start review.

### Zone 6: Required Note
Purpose:
- Capture accountable decision context.

Field:
- Label: `Resolution note`.
- Helper changes by transition.
- Max counter: `400`.

Helper for start review:
- `Explain what will be checked next.`

Helper for resolve:
- `Explain the evidence and decision behind this resolution.`

Helper for close:
- `Explain why no further action is needed.`

Validation:
- Required.
- Trim whitespace.
- Minimum 5 characters.
- Maximum 400 characters.
- Reject only whitespace.
- Warn on vague notes when possible.

Test IDs:
- `resolve-issue-note-field`
- `resolve-issue-note-input`
- `resolve-issue-note-counter`
- `resolve-issue-note-error`
- `resolve-issue-note-quality-warning`

Forbidden note content:
- Full receiver phone.
- Full sender phone.
- Raw payment provider payload.
- Payment provider secret.
- Webhook signature.
- OTP.
- Proof upload URL.
- Verification token.
- Private staff personal details.

### Zone 7: Consequence Preview
Purpose:
- Show exact effect and non-effects before submit.

Start review preview:
- `Status will change to in review.`
- `No resolution code will be sent.`
- `The issue will remain open for follow-up work.`

Resolve preview:
- `Status will change to resolved.`
- `Resolution code will be saved.`
- `Issue can be closed later after final review.`

Close preview:
- `Status will change to closed.`
- `The issue will be treated as complete in v1.`
- `Reopen is not available from this modal.`

Common non-effects:
- `This will not change delivery status.`
- `This will not approve or settle a refund.`
- `This will not override custody.`
- `This will not change station status.`
- `This will not edit payment state.`

Test IDs:
- `resolve-issue-consequence-preview`
- `resolve-issue-status-change`
- `resolve-issue-code-preview`
- `resolve-issue-non-effects`

### Zone 8: Footer Actions
Primary by mode:
- `Start review`.
- `Resolve issue`.
- `Close issue`.

Secondary:
- `Cancel`.

Optional contextual:
- `Open delivery timeline`.
- `Open custody chain`.
- `Open refund evidence`.
- `Open payment evidence`.

Test IDs:
- `resolve-issue-primary-action`
- `resolve-issue-cancel-action`
- `resolve-issue-open-timeline-action`
- `resolve-issue-open-custody-action`
- `resolve-issue-open-refund-evidence-action`
- `resolve-issue-open-payment-evidence-action`

Rules:
- Primary disabled until transition, required code, and note are valid.
- Primary disabled when action is blocked.
- Primary shows spinner while submitting.
- Cancel disabled only during active submit.

## Data Inputs
```ts
type ResolveIssueModalInput = {
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
    resolutionCode?: string;
    resolutionNote?: string;
    resolvedAt?: string;
    resolvedByActorId?: string;
    closedAt?: string;
    closedByActorId?: string;
    createdAt: string;
    updatedAt: string;
  };
  actor: {
    userId: string;
    role: string;
    canManageIssue: boolean;
  };
  defaultTransition?: "in_review" | "resolved" | "closed";
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

## Data Outputs
Success output:
```ts
type ResolveIssueSuccess = {
  kind: "issue_status_updated";
  issueId: string;
  deliveryId: string;
  status: "in_review" | "resolved" | "closed";
  resolutionCode?: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedByActorId?: string;
  closedAt?: string;
  closedByActorId?: string;
};
```

Host responsibilities after success:
- Refetch `get_issue`.
- Invalidate `Issue` and `IssueList`.
- Refresh admin overview issue metrics when visible.
- Refresh blocked delivery queue when issue status affects blockers.
- Route back to issue detail or queue according to entry context.
- Do not assume delivery state changed.

Blocked output:
```ts
type ResolveIssueBlocked = {
  kind:
    | "already_closed"
    | "already_resolved"
    | "transition_blocked"
    | "role_blocked"
    | "issue_missing"
    | "delivery_missing"
    | "stale_issue";
  issueId?: string;
};
```

## State Machine
Normal start-review flow:
```text
closed
  -> opening
  -> context_loading
  -> review_ready
  -> note_valid
  -> submitting
  -> server_confirmed
  -> closing
```

Normal resolve flow:
```text
closed
  -> opening
  -> context_loading
  -> resolve_ready
  -> resolution_code_selected
  -> note_valid
  -> submitting
  -> server_confirmed
  -> closing
```

Normal close flow:
```text
closed
  -> opening
  -> context_loading
  -> close_ready
  -> resolution_code_selected
  -> note_valid
  -> submitting
  -> server_confirmed
  -> closing
```

Blocked flow:
```text
context_loading -> role_blocked
context_loading -> already_closed
context_loading -> transition_blocked
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
POST /v1/issues/:id/resolve
```

Start review request:
```json
{
  "nextStatus": "in_review",
  "note": "Support has accepted this issue and will review custody evidence."
}
```

Resolve request:
```json
{
  "nextStatus": "resolved",
  "resolutionCode": "station_confirmed",
  "note": "Destination station confirmed the package is ready for receiver pickup."
}
```

Close request:
```json
{
  "nextStatus": "closed",
  "resolutionCode": "station_confirmed",
  "note": "Resolved issue closed after final station confirmation review."
}
```

Headers:
- Auth bearer token.
- `Idempotency-Key`.
- Standard app request headers.

Do not send:
- Escalation reason.
- Severity changes.
- Category changes.
- Refund amount or refund decision.
- Payment provider data.
- Delivery state mutation.
- Custody action.
- Station status changes.
- Assignee fields not supported by backend.

## Error Mapping
| Backend/Error | Modal State | User Copy |
| --- | --- | --- |
| `VALIDATION_ERROR` | `note_invalid` or `resolution_code_required` | `Check the transition, resolution code, and note.` |
| `FORBIDDEN` | `role_blocked` | `Your role cannot update this issue state.` |
| `NOT_FOUND` for issue | `issue_missing` | `This issue could not be found. Refresh the queue.` |
| `NOT_FOUND` for delivery | `delivery_missing` | `The delivery linked to this issue could not be found. Issue update is blocked until support reviews the record.` |
| `INVALID_STATUS_TRANSITION` | `transition_blocked` | `This issue status changed. Refresh before taking action.` |
| `RATE_LIMITED` | `rate_limited` | `Too many requests. Wait and try again.` |
| Session expired | `session_expired` | `Sign in again to update this issue.` |
| Network timeout | `network_error` | `Connection failed. Your issue update was not submitted.` |
| Unexpected backend error | `server_rejected` | `Issue update failed. Try again or contact support operations.` |

Rules:
- Preserve form state after recoverable failure.
- Clear spinner after failure.
- Do not claim success until backend confirms.
- Refetch on invalid transition.

## Interaction Rules
### Opening
- Host passes loaded issue context where possible.
- If context is not loaded, show loading state.
- Focus moves to title, then first required control.
- Background becomes inert.

### Transition
- If only one transition is valid, show summary instead of selector.
- If more than one is valid, require explicit choice.
- Changing transition clears invalid resolution code only when hidden or incompatible.
- Transition changes update consequence preview.

### Resolution Code
- Required only for resolve and close.
- Hidden for start review.
- Selecting code updates note helper.
- Preserve selected code after recoverable error.

### Note
- Counter updates as user types.
- Trim validation runs on blur and submit.
- Local warning may flag vague notes without blocking.
- Backend validation remains authority.

### Submit
- Submit disabled until form is valid.
- Submit uses one idempotency key per modal open and request fingerprint.
- Duplicate clicks are blocked.
- Submit cannot be queued offline.

### Closing
- Unsaved changes require confirmation.
- Close disabled during active submit.
- Success closes after host acknowledges refresh or after a short saved state.

### Keyboard
- `Escape` closes only when not submitting and no unsaved changes, or opens close confirmation.
- `Enter` submits only when focus is not in note and form is valid.
- `Cmd+Enter` or `Ctrl+Enter` may submit from note field.
- `Tab` remains inside modal.

## Visual Design System
### Art Direction
This modal should feel like a decision ledger, not a generic form.

Visual traits:
- Issue identity locked at top.
- Transition summary prominent.
- Required decision code visible.
- Note field serious and readable.
- Consequence preview plain and exact.
- Evidence links secondary but accessible.
- No decorative noise.

### Layout
Desktop:
- Centered modal, max width around 640 to 760 px.
- Scroll body if content exceeds viewport.
- Sticky footer.

Tablet:
- Centered modal or side panel.
- Evidence and consequence panels can sit side by side if space allows.

Mobile admin:
- Full-height sheet.
- Transition summary first.
- Code choices stacked.
- Footer respects safe area.

### Color
- Resolution action uses calm success or primary tone, not bright celebration.
- Close action uses serious neutral tone.
- Warnings use amber.
- Blocked states use error tone plus text.
- Do not rely on color alone.

### Typography
- Title is direct.
- Issue summary uses medium emphasis.
- Status and code labels are compact.
- Note helper is specific.
- Consequence list is short and scannable.

### Motion
- Modal opens with subtle opacity and scale.
- Transition changes use restrained crossfade.
- Success state is brief.
- No looping animation.
- Respect reduced motion.

## Content Specification
Start review title:
- `Start issue review`

Resolve title:
- `Resolve issue`

Close title:
- `Close issue`

Subtitle:
- `Record the issue decision with a note and required outcome.`

Transition label:
- `Issue action`

Transition error:
- `Choose an issue action.`

Resolution code label:
- `Resolution code`

Resolution code error:
- `Choose a resolution code.`

Note label:
- `Resolution note`

Note required error:
- `Add a note.`

Note too short error:
- `Use at least 5 characters.`

Note too long error:
- `Use 400 characters or fewer.`

Submitting labels:
- `Starting review`
- `Resolving issue`
- `Closing issue`

Success labels:
- `Issue moved to review.`
- `Issue resolved.`
- `Issue closed.`

Blocked labels:
- `This issue cannot move to that status.`
- `Closed issues cannot be updated here.`
- `Your role cannot update this issue state.`

## Security And Privacy Rules
Do not render:
- Full receiver phone.
- Raw sender phone.
- Payment provider payload.
- Payment provider secret.
- Webhook signature.
- OTP.
- Proof upload URL.
- Verification token.
- Full internal audit payload.
- Private staff personal details.

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
- `nextStatus`.
- `resolutionCode`.
- `issueStatusBefore`.
- `issueSeverity`.
- `issueCategory`.
- `openedFrom`.
- `result`.
- `errorCode`.
- `hasEvidenceWarning`.

Storage:
- Form state lives in memory.
- Do not persist note draft outside modal unless encrypted draft behavior is explicitly approved later.
- Clear form state after success.
- Preserve form state after recoverable network error.

Audit:
- Backend records resolution or closure actor and time.
- Backend records resolution note and code.
- Frontend should not claim a full issue history until backend exposes dedicated history events.

## Accessibility Requirements
Modal:
- `role="alertdialog"` is acceptable for close and resolve because these are high-impact state changes.
- `role="dialog"` is acceptable for start-review mode.
- `aria-modal="true"` where applicable.
- Labelled by visible title.
- Described by consequence preview and current state.
- Background inert.
- Focus trapped.
- Focus returns to trigger.

Fields:
- Transition group has visible label.
- Resolution code group has visible label.
- Note field has visible label.
- Errors are linked with `aria-describedby`.
- Character counter is polite and not noisy.

Status:
- Submitting, success, and error states use status messages.
- On validation failure, focus moves to first invalid control.
- Countdown or retry messages should not announce repeatedly.

Keyboard:
- Radio groups support arrow keys.
- Select controls are native where possible.
- Footer actions reachable in logical order.
- Evidence links reachable but secondary.

Touch:
- Code choices and footer controls meet target size guidance.
- Dense admin layout remains clickable.

Motion:
- Reduced motion removes scale and nonessential animation.

## Host Integration
### `AdminIssueDetail`
Primary owner:
- Opens modal for start review, resolve, or close.
- Passes full issue response.
- Passes delivery context if loaded.
- Refetches issue after success.
- Keeps user on detail page.

### `AdminIssueQueue`
Allowed only when:
- Row has enough issue identity.
- Transition is simple and low risk.
- Host invalidates list after success.

Preferred behavior:
- Route to `AdminIssueDetail` before resolving P1, loss, fraud, payment, refund, or custody issues.

### `AdminManualCustodyException`
Use when:
- Custody evidence has been reviewed and issue can be resolved or moved to review.

Required warning:
- `Review custody chain before resolving a handoff or loss issue.`

### `AdminRefundEvidenceReview`
Use when:
- Refund or dispute evidence has been reviewed and issue outcome depends on it.

Required warning:
- `Refund approval must happen in refund workflow before using refund approved.`

### `AdminBlockedDeliveryQueue`
Use when:
- Issue status affects blocker visibility.

Required warning:
- `Resolving an issue does not automatically unblock delivery state unless the owner workflow already changed it.`

## Data Freshness Rules
Before submit:
- If issue context is older than host freshness threshold, host should refetch or show stale warning.
- If status changed, recalculate allowed transitions.
- If issue no longer exists, show `issue_missing`.
- If linked delivery no longer exists, show `delivery_missing`.

After submit:
- Refetch issue.
- Invalidate issue list.
- Invalidate admin overview issue counts.
- Invalidate blocked delivery queue if visible.
- Do not invalidate delivery timeline unless host displays issue events in timeline.

## Offline And Low-Bandwidth Behavior
Issue state update is not offline-queueable in v1.

Reason:
- It requires fresh issue status.
- It may trigger notifications.
- It must not replay after another admin changes the issue.
- Close and resolve decisions should be explicit, current, and auditable.

Offline state:
- Disable primary action.
- Preserve typed note in memory while modal remains open.
- Show copy: `Issue updates need an online connection and fresh issue status.`
- Offer `Close` and `Retry when online`.

Low bandwidth:
- Keep identity and transition visible.
- Avoid loading heavy evidence inside modal.
- Use text-first states.
- Retry mutation only after explicit user action unless network layer safely retries same idempotency key.

## Validation Rules
Transition:
- Required when multiple transitions are available.
- Must be valid for current issue status.
- Invalid current status blocks submit.

Resolution code:
- Required for `resolved` and `closed`.
- Forbidden for `in_review` unless backend later accepts it.
- Must be one of backend enum values.

Note:
- Required.
- Trim before submit.
- Minimum 5 characters after trim.
- Maximum 400 characters after trim.
- Preserve line breaks if multiline is allowed.

Issue:
- Must have `issueId`.
- Must not be `closed` unless action is read-only.
- Must match host freshness expectations.

Actor:
- Must have `canManageIssue=true`.
- Backend may still reject; UI must handle.

## Testing Requirements
### Unit Tests
Must cover:
- Renders issue identity.
- Shows current status and severity.
- Computes allowed transitions from status.
- Allows start review only from open.
- Allows resolve from open, in review, or escalated.
- Allows close only from resolved.
- Blocks closed issue.
- Requires transition when more than one is available.
- Requires resolution code for resolve.
- Requires resolution code for close.
- Hides resolution code for start review.
- Requires note.
- Rejects note under 5 characters.
- Rejects note over 400 characters.
- Shows consequence preview.
- Shows non-effects.
- Disables primary while invalid.
- Disables primary while submitting.
- Preserves form after network error.
- Clears form after success.

### Integration Tests
Must cover:
- Sends `POST /v1/issues/:id/resolve`.
- Sends `nextStatus=in_review` without resolution code.
- Sends `nextStatus=resolved` with resolution code.
- Sends `nextStatus=closed` with resolution code.
- Sends idempotency key.
- Invalidates `Issue` and `IssueList`.
- Does not call `escalate_issue`.
- Does not call refund endpoints.
- Does not call custody or delivery lifecycle mutations.
- Maps invalid transition to stale status recovery.
- Handles `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, and session expiry.

### Accessibility Tests
Must cover:
- Dialog or alertdialog role.
- Modal labelled by visible title.
- Transition group accessible name.
- Resolution code group accessible name.
- Note field accessible name.
- Validation focus moves to first invalid field.
- Focus trap.
- Focus return.
- Keyboard radio navigation.
- Escape behavior.
- Live success and error announcements.
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
- Backend `FORBIDDEN` still blocks even if UI hint is wrong.

## QA Scenarios
### Start Review Happy Path
1. Admin opens open issue.
2. Modal defaults to start review when selected from action.
3. Resolution code is hidden.
4. Admin writes note.
5. Submit sends `nextStatus=in_review`.
6. Backend succeeds.
7. Host refetches issue.

### Resolve Happy Path
1. Admin opens in-review issue.
2. Modal shows resolve mode.
3. Admin selects `Delivery completed`.
4. Admin writes evidence note.
5. Submit sends `nextStatus=resolved`.
6. Backend succeeds.
7. Host shows resolved issue.

### Close Happy Path
1. Admin opens resolved issue.
2. Modal shows close mode.
3. Admin selects existing or confirmed resolution code.
4. Admin writes final review note.
5. Submit sends `nextStatus=closed`.
6. Backend succeeds.
7. Host shows closed state.

### Missing Resolution Code
1. Admin chooses resolve.
2. Admin writes note.
3. Admin submits without code.
4. Modal focuses code group.
5. Error says choose a resolution code.

### Invalid Close
1. Admin opens open issue.
2. Close transition is not available.
3. User cannot send `nextStatus=closed`.

### Stale Issue
1. Admin opens modal for open issue.
2. Another admin resolves it.
3. Submit returns invalid transition or refreshed status.
4. Modal blocks old transition and asks refresh.

### Role Blocked
1. Finance admin opens issue detail.
2. Resolve action is hidden or disabled.
3. If modal opens through stale UI, role-blocked state appears.

### Network Failure
1. Admin completes form.
2. Network timeout occurs.
3. Modal keeps transition, code, and note.
4. Admin can retry with same idempotency key.

## Implementation Notes For Claude Code
Build this as a shared issue lifecycle modal. Do not embed separate transition logic into every admin screen.

Recommended components:
- `ResolveIssueModal`.
- `ResolveIssueIdentityCard`.
- `IssueTransitionSelector`.
- `IssueEvidenceChecklist`.
- `ResolutionCodePicker`.
- `ResolutionNoteField`.
- `ResolutionConsequencePreview`.
- `ResolveIssueFooter`.

Recommended hooks:
- `useResolveIssueForm`.
- `useResolveIssueMutation`.
- `useIssueTransitionGuards`.
- `useResolutionAnalyticsRedaction`.

Mutation rules:
- Build request body from validated transition state.
- Use `resolve_issue` mutation wrapper.
- Include `Idempotency-Key`.
- Disable duplicate submit.
- Invalidate `Issue` and `IssueList` tags.
- Let host decide broader admin metric invalidation.

Do not implement:
- Escalation inside this modal.
- Refund approval inside this modal.
- Severity editing inside this modal.
- Category editing inside this modal.
- Delivery completion inside this modal.
- Custody correction inside this modal.
- Station status changes inside this modal.
- Offline queue.
- Public issue resolution.

## Acceptance Criteria
This file is complete only when implementation can satisfy all of these:
- Modal opens with issue identity and current status.
- Only authorized admin/support actors can submit.
- Allowed transitions match current issue status.
- `in_review` requires note and no resolution code.
- `resolved` requires note and resolution code.
- `closed` requires note and resolution code and only starts from resolved issue.
- Consequence preview shows effects and non-effects.
- Submit calls only `resolve_issue`.
- Success refetches issue and invalidates issue lists.
- Errors map to safe user copy.
- Form does not leak notes or sensitive issue fields to analytics.
- Modal is accessible as a serious issue state-change dialog.
- Offline submit is blocked.
- Tests cover transitions, validation, authorization, mutation, accessibility, and redaction.

## Final Quality Bar
The modal should feel like a disciplined issue decision ledger:
- It makes the current status and allowed transition obvious.
- It requires a real decision code when ending a case.
- It protects delivery, payment, proof, and customer privacy.
- It refuses unsupported shortcuts.
- It respects backend authority.
- It leaves no ambiguity that issue resolution is not refund approval, custody correction, or delivery completion.

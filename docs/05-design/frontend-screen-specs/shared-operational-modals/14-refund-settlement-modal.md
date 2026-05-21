# Refund Settlement Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `RefundSettlementModal` |
| Component target | shared finance refund settlement confirmation modal |
| Primary test ID | `modal-refund-settlement` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 finance settlement control |
| Used by | `AdminRefundSettlement`, `AdminRefundReview`, `AdminFinanceSummary`, `AdminRefundEvidenceReview`, `AdminPaymentReconciliationDetail`, `AdminIssueDetail`, `AdminSlaBreachDashboard` |
| Backend coverage | `settle_refund_payment` |
| Trigger source | refund-pending settlement action, refund approval success action, finance row action, evidence review settlement action, issue refund-pending action |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `settlement_reference_editing`, `settled_at_editing`, `client_invalid`, `payload_review`, `confirming`, `submitting`, `server_confirmed`, `server_rejected`, `already_settled`, `not_refund_pending`, `metadata_missing`, `payment_missing`, `delivery_missing`, `role_blocked`, `rate_limited`, `network_error`, `session_expired`, `closing_to_sign_in`, `closing` |

## Product Job
`RefundSettlementModal` lets an authorized finance admin mark an already approved refund as settled after finance has completed the real provider or adjustment action.

It answers:
- `Which refund-pending payment is being settled?`
- `What amount and reason were already approved?`
- `Which delivery will move to refunded payment status?`
- `What settlement reference proves the refund action?`
- `Will the settlement timestamp be server time or a finance-entered time?`
- `What exact payload will be submitted?`
- `What changes after the backend accepts the settlement?`
- `What sender notification should result from settlement?`
- `Where does finance review evidence after completion?`

The user should be able to:
- Verify payment and delivery identity.
- Verify approved refund amount.
- Verify approved refund reason.
- Enter a required refund reference.
- Optionally enter a settlement timestamp.
- Review the exact `settle_refund_payment` payload.
- Confirm final settlement consequence.
- Submit once without double-settling.
- See backend-confirmed refunded status, amount, reason, reference, and timestamp.
- Navigate to refund evidence or parent finance view after success.

This modal is not:
- A refund approval flow.
- A refund eligibility review.
- A refund amount editor.
- A refund reason editor.
- A provider login surface.
- A payout account form.
- A cash refund flow.
- An alternate refund path approval flow.
- A compensation calculation tool.
- A bulk settlement tool.
- A way to change delivery lifecycle status.
- A way to resolve an issue automatically.

## Strategic Role
Settlement is the final finance record that closes the refund money state inside Kra. It must be exact because the sender may see `refund_completed`, finance reports will count the money as settled, and audit history will treat the reference as evidence.

Core principle:
- Settle only refunds already in `refund_pending`.
- Treat `refundReference` as required settlement evidence.
- Let the backend preserve the approved amount and reason.
- Use server time unless finance has a valid settlement timestamp from the provider record.
- Do not settle when approval metadata is missing.
- Do not resolve linked issues automatically.
- Do not use this modal to decide refund eligibility.

The operational failure this modal prevents:
- Finance marks an unapproved payment as refunded.
- Finance settles a payment that was already settled.
- Finance records an empty or weak provider reference.
- Finance edits amount or reason after approval.
- Finance confuses settlement with approval.
- Finance settles without evidence and cannot reconcile later.
- Sender receives completed refund copy before finance has actually settled.
- Linked issue is silently treated as resolved.

## Audience
Primary users:
- `finance_admin` settling approved refunds.
- `super_admin` settling under finance governance.

Secondary users:
- Support lead checking customer-visible refund completion.
- Product owner validating money-state workflow.
- QA validating financial mutation behavior.
- Security reviewer validating role and reference handling.
- Operations lead checking issue and delivery state separation.
- Claude Code implementing the frontend later.

Non-users:
- Public visitor.
- Sender.
- Receiver.
- Driver.
- Station operator.
- Final-mile courier.
- Support admin without `execute_refund`.
- Operations admin without `execute_refund`.
- Provider webhook processor.

## Context Of Use
The modal opens after a refund approval exists and finance has a real settlement reference to record.

Common entry contexts:
- `AdminRefundSettlement` primary action.
- `AdminRefundReview` success state after `refund_payment`.
- `AdminFinanceSummary` refund-pending row.
- `AdminRefundEvidenceReview` refund-pending action.
- `AdminPaymentReconciliationDetail` refund-pending payment action.
- `AdminIssueDetail` refund-pending dispute context.
- `AdminSlaBreachDashboard` refund SLA row.

The user may be:
- Recording a mobile money provider refund reference.
- Recording a card refund reference.
- Recording an internal adjustment reference when original-method refund is unavailable and policy permits it.
- Recording settlement after provider dashboard confirms refund completion.
- Correcting a delayed settlement timestamp from a provider record.
- Discovering that the payment is not pending refund.
- Discovering that refund approval metadata is missing.
- Discovering that the settlement has already happened.

## Design Brief
Audience:
- Finance admin or super admin with refund execution authority.

Surface type:
- High-impact finance confirmation modal.

Primary action:
- `Mark refund settled`.

Visual thesis:
- `Closing ledger`: a restrained financial closeout sheet with approved amount locked, reference entry centered, and consequences explicit.

Restraint rule:
- No approval questions, no amount fields, no reason fields, no provider credentials, no issue resolution action in the primary path.

Density:
- Medium-high. Settlement needs less policy context than approval but stronger proof and confirmation.

Platform stance:
- Admin web first.
- Tablet compatible.
- Mobile web fallback for urgent finance action, but not a field-worker workflow.

## External Research Used
Only directly relevant links were used:
- [Stripe refund documentation](https://docs.stripe.com/refunds): supports tracking refund destination, status, failed refund outcomes, and provider reference concepts separately from local approval.
- [Adyen refund documentation](https://docs.adyen.com/online-payments/refund/): supports captured-payment refund prerequisites, reference usage, asynchronous refund handling, and failure reason review.
- [PayPal refund captured payment API](https://developer.paypal.com/docs/api/payments/v2/#captures_refund): supports refund creation against captured payments, refund status tracking, and merchant reference handling.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports final review before financial submission.
- [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/): supports a clear completion state with reference and next steps.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports explicit confirmation for high-impact financial state changes.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level validation for reference and timestamp.
- [WCAG 2.2 Error Prevention for Legal, Financial, Data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review, correction, and confirmation before changing financial records.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible feedback for validation, submitting, and completion.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/23-admin-finance-summary.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/25-admin-payment-reconciliation-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/27-admin-refund-settlement.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/30-admin-issue-detail.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/13-refund-decision-modal.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/refunds.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/refunds.test.ts`

## Backend Reality
Mutation:
- Operation key: `settle_refund_payment`.
- Route: `POST /v1/payments/refund/settle`.
- Required prehandler: admin mutation guard plus `execute_refund`.
- Request schema: `settleRefundRequestSchema`.
- Response schema: `settleRefundResponseSchema`.
- Handler wraps the mutation in the idempotent mutation runner.
- Route registry currently marks this operation as not idempotent, so the frontend must still use UI duplicate-submit protection and send `Idempotency-Key` when supported by the API client.

Request body:
```json
{
  "paymentId": "PAY-7006",
  "refundReference": "RFD-MTN-7006",
  "settledAt": "2026-05-20T10:30:00.000Z"
}
```

Request fields:
- `paymentId` is required.
- `refundReference` is required.
- `refundReference` is trimmed.
- `refundReference` must be at least `3` characters.
- `refundReference` must be at most `120` characters.
- `settledAt` is optional.
- `settledAt` must be an ISO date-time when provided.
- If `settledAt` is omitted, backend uses server time.

Successful response:
```json
{
  "paymentId": "PAY-7006",
  "deliveryId": "DEL-7006",
  "refundStatus": "refunded",
  "refundAmountGhs": 35,
  "refundReason": "full_refund_pre_intake",
  "refundReference": "RFD-MTN-7006",
  "settledAt": "2026-05-20T10:30:00.000Z"
}
```

Important backend facts:
- The mutation is admin-only.
- The mutation requires `execute_refund`.
- `finance_admin` and `super_admin` currently have `execute_refund`.
- The payment must exist.
- The payment status must be `refund_pending`.
- Approved refund metadata must exist: `refundAmountGhs`, `refundReason`, and `refundRequestedAt`.
- The linked delivery must exist.
- Successful settlement marks payment as `refunded`.
- Successful settlement marks delivery payment status as `refunded`.
- Successful settlement queues a sender notification with type `refund_completed`.
- Successful settlement does not resolve linked issues.
- Successful settlement does not change delivery lifecycle status.
- Successful settlement does not update custody state.
- Successful settlement does not create provider-side refund. It records finance completion inside Kra.

Therefore:
- The modal may submit only `settle_refund_payment`.
- The modal must not submit `refund_payment`.
- The modal must not render approval evidence questions.
- The modal must not accept amount or reason input.
- The modal must not settle unless current status is `refund_pending`.
- The modal must require `refundReference`.
- The modal must require review and confirmation before submit.
- The modal must make sender notification outcome visible.
- The modal must route to evidence after success.

## Product Policy Reality
Refund execution policy:
- Approved refunds should return to the original payment method where technically possible.
- Once approved, the refund must be initiated the same business day.
- Refund completion target is within `3 business days` for original-method refunds.
- If original-method refund is unavailable, finance may use an alternate refund path only with adjustment reference, approver identity, and payout evidence.
- Alternate-path refunds must complete within `5 business days`.
- Cash refunds are not part of standard v1.

Modal interpretation:
- Settlement means finance has completed or recorded the refund action.
- `refundReference` is the proof reference that ties Kra to the provider or approved adjustment record.
- The modal can accept provider reference or approved adjustment reference.
- The modal cannot collect payout account details.
- The modal cannot approve alternate refund path by itself.
- The modal should warn when reference format looks weak.

## Permission Model
Open permission:
- `finance_admin` with finance context.
- `super_admin`.

Submit permission:
- `execute_refund`.

Blocked roles:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without `execute_refund`.
- `ops_admin` without `execute_refund`.

Permission behavior:
- If role is missing, show `role_blocked`.
- If session expired, show `session_expired`.
- If capability is absent, hide settlement form and show safe copy.
- Do not leak provider details or internal references to unauthorized users.

Role-blocked copy:
- Title: `Refund settlement is restricted`
- Body: `Only finance admins with refund execution access can mark this refund as settled.`
- Primary action: `Close`
- Secondary action: `Open refund evidence`, only when read access exists.

## Data Dependencies
Required context:
- `paymentId`.
- Authenticated role and capabilities.
- Payment status.
- Approved refund amount.
- Approved refund reason.
- Refund requested timestamp.
- Linked `deliveryId`.
- Delivery payment status.

Preferred context:
- Tracking code.
- Sender-safe notification expectation.
- Payment confirmed timestamp.
- Provider or adjustment reference source label.
- Parent issue ID.
- Parent reconciliation ID.
- Origin and destination stations.
- Current delivery lifecycle status.
- Last finance action timestamp.
- SLA due date for settlement target.

Context hydration order:
- Use parent screen state from approval success when available.
- Use finance summary row when available.
- Use refund evidence context when available.
- Use reconciliation context when available.
- Use issue context when available.
- Fetch missing admin-safe payment and delivery data when supported by parent screen architecture.
- Show `payment_missing` if payment cannot be established.
- Show `delivery_missing` if linked delivery cannot be established.
- Show `metadata_missing` if refund approval metadata is absent.

Do not:
- Guess refund amount.
- Guess refund reason.
- Guess refund requested time.
- Guess that payment is refund pending.
- Guess provider reference.
- Use customer contact fields as settlement reference.
- Use issue ID as settlement reference unless finance explicitly records an approved adjustment reference tied to that issue.

## Settlement Eligibility
Eligibility checks:
- Payment exists.
- Delivery exists.
- User has `execute_refund`.
- Payment status is `refund_pending`.
- Delivery payment status is `refund_pending` or compatible with refund-pending context.
- `refundAmountGhs` exists and is positive.
- `refundReason` exists.
- `refundRequestedAt` exists.
- No existing `refundReference` is already settled.

Eligibility rows:
- `Payment found`
- `Delivery linked`
- `Role permitted`
- `Refund approved`
- `Refund amount present`
- `Refund reason present`
- `Approval timestamp present`
- `Not already settled`
- `Reference ready`

Row states:
- `Pass`
- `Warn`
- `Block`
- `Unknown`

Blocking outcomes:
- Missing role becomes `role_blocked`.
- Missing payment becomes `payment_missing`.
- Missing delivery becomes `delivery_missing`.
- Payment not refund pending becomes `not_refund_pending`.
- Existing refunded status becomes `already_settled`.
- Missing approval metadata becomes `metadata_missing`.

Eligibility passed copy:
- `This refund is approved and ready to be marked settled after finance reference review.`

Blocked copy:
- `This refund cannot be settled from this modal. Resolve the blocking row before continuing.`

## Approved Refund Ledger
Fields:
- `Payment ID`
- `Delivery ID`
- `Tracking code`
- `Payment status`
- `Delivery payment status`
- `Approved refund amount`
- `Approved refund reason`
- `Refund requested at`
- `Current delivery status`
- `Origin station`
- `Destination station`
- `Issue ID`, when present.
- `Reconciliation state`, when present.

Design:
- Read-only ledger.
- Amount uses tabular numerals.
- IDs use monospace.
- Status rows include text labels.
- Refund reason shows a human-readable label plus raw enum in smaller text.
- Missing critical metadata shows blocker state.

Reason labels:
- `full_refund_pre_intake`: `Full refund before origin intake`
- `duplicate_charge`: `Duplicate charge`
- `platform_payment_error`: `Platform payment error`
- `never_received_at_origin`: `Package never received at origin`
- `post_intake_handling_fee`: `Post-intake refund minus handling fee`
- `doorstep_surcharge_refund`: `Unused doorstep surcharge`
- `express_surcharge_refund`: `Unused express surcharge`

Do not:
- Let user edit amount.
- Let user edit reason.
- Let user edit requested timestamp.
- Let user change status.
- Hide raw enum from finance users.

## Reference Entry
Primary field:
- Field name: `refundReference`.
- Label: `Settlement reference`.
- Required: yes.
- Min length: `3`.
- Max length: `120`.
- Trim leading and trailing spaces.
- Preserve internal hyphens, slashes, colons, and provider-safe characters.

Accepted reference types:
- Provider refund reference.
- Mobile money refund reference.
- Card refund reference.
- Approved adjustment reference.
- Finance case settlement reference.

Rejected reference content:
- Empty text.
- Only spaces.
- Fewer than `3` characters.
- More than `120` characters.
- Customer phone number alone.
- Customer name alone.
- Payment ID copied as the only settlement reference.
- Delivery ID copied as the only settlement reference.
- Issue ID copied as the only settlement reference without finance adjustment prefix.

Reference helper copy:
- `Enter the provider refund reference or approved finance adjustment reference that proves settlement.`

Reference warning copy:
- `This looks like an internal ID, not a settlement reference. Use a provider or approved adjustment reference.`

Reference error copy:
- Empty: `Enter a settlement reference.`
- Too short: `Settlement reference must be at least 3 characters.`
- Too long: `Settlement reference must be 120 characters or fewer.`
- Weak internal ID: `Use the provider or adjustment reference, not only the payment or delivery ID.`

Input behavior:
- Autocomplete off.
- Spellcheck off.
- Auto-capitalization off.
- Trim on blur and before submit.
- Do not auto-transform case.
- Show character count after `90` characters.

## Settlement Timestamp Entry
Field name:
- `settledAt`.

Label:
- `Settlement timestamp`

Default mode:
- `Use server time`.

Optional mode:
- `Use provider timestamp`.

Behavior:
- If user keeps server time, omit `settledAt`.
- If user chooses provider timestamp, require valid ISO date-time conversion.
- UI may use localized date and time controls but payload must be ISO date-time.
- Timestamp cannot be in the future beyond reasonable clock skew.
- Timestamp should not be earlier than `refundRequestedAt` unless finance override copy is acknowledged.

Controls:
- Radio group:
  - `Use server time when I submit`
  - `Use provider timestamp`
- Date input.
- Time input.
- Timezone indicator.

Validation:
- Missing date when provider timestamp selected blocks submit.
- Missing time when provider timestamp selected blocks submit.
- Invalid date-time blocks submit.
- Future timestamp blocks submit.
- Timestamp before refund request shows confirmation warning.

Helper copy:
- `Leave server time selected unless the provider record shows a completed refund time that should be preserved.`

Warning copy:
- `This timestamp is earlier than the refund approval time. Continue only if the provider record proves it.`

## Payload Builder
Base payload:
```json
{
  "paymentId": "PAY-7006",
  "refundReference": "RFD-MTN-7006"
}
```

Payload with provider timestamp:
```json
{
  "paymentId": "PAY-7006",
  "refundReference": "RFD-MTN-7006",
  "settledAt": "2026-05-20T10:30:00.000Z"
}
```

Payload rules:
- Always include `paymentId`.
- Always include trimmed `refundReference`.
- Include `settledAt` only when user selected provider timestamp.
- Do not include refund amount.
- Do not include refund reason.
- Do not include delivery ID.
- Do not include provider payload.
- Do not include notification fields.
- Do not include issue ID.
- Do not include reconciliation ID.

Payload display:
- Render formatted read-only JSON.
- Show omitted server-time note when `settledAt` is omitted.
- Provide copy action only for finance and super admin.
- Copy action includes body only, not headers.

Payload validation:
- Payload must parse through `settleRefundRequestSchema`.
- Reference must be valid before review.
- Timestamp must be valid before review when provided.

## Review Step
Purpose:
- Make the user verify the financial record before final settlement.

Review rows:
- Payment ID.
- Delivery ID.
- Approved refund amount.
- Approved refund reason.
- Refund requested at.
- Settlement reference.
- Settlement timestamp mode.
- Payload body.
- Sender notification expectation.
- Non-effects.

Correction links:
- `Change reference`
- `Change timestamp`
- `Open approval evidence`
- `Close without settling`

Review copy:
- `Review the settlement record before changing this payment to refunded.`

Correction behavior:
- Selecting `Change reference` returns focus to reference input.
- Selecting `Change timestamp` returns focus to timestamp mode group.
- Any change invalidates confirmation checkbox.

## Confirmation Step
Confirmation is required.

Confirmation content:
- Title: `Confirm refund settlement`
- Body: `This will mark the payment and delivery payment status as refunded. It should only be done after finance has completed the refund outside Kra or has an approved adjustment reference.`
- Approved amount.
- Settlement reference.
- Notification note.

Required checkbox:
- `I verified the refund was completed and the settlement reference is correct.`

Primary action:
- `Mark refund settled`

Secondary action:
- `Back to review`

Confirmation blocks:
- Missing checkbox.
- Changed payload after checkbox.
- Reference warning not acknowledged when warning is active.
- Timestamp warning not acknowledged when warning is active.

Non-effects shown in confirmation:
- Does not approve refund eligibility.
- Does not alter refund amount.
- Does not alter refund reason.
- Does not resolve linked issues.
- Does not change custody.
- Does not change delivery lifecycle.
- Does not open provider portal.

## Server Submission
Submit only when:
- User has `execute_refund`.
- Payment status is `refund_pending`.
- Refund metadata exists.
- Linked delivery exists.
- Reference is valid.
- Timestamp mode is valid.
- Review step was completed.
- Confirmation checkbox is checked.

Request:
- Method: `POST`.
- Path: `/v1/payments/refund/settle`.
- Operation: `settle_refund_payment`.
- Header: `Idempotency-Key` when API client supports mutation idempotency.
- Body: deterministic payload.

Duplicate-submit protection:
- Disable primary action immediately.
- Keep modal open while submitting.
- Prevent Enter key from retriggering submit.
- Use the same idempotency key for retry after network failure when payload is unchanged.
- Regenerate idempotency key if payload changes.

Submission UI:
- Button text: `Marking settled`
- Status copy: `Recording refund settlement`
- Inputs disabled.
- Payload visible.
- Close button disabled.

Success UI:
- State: `server_confirmed`.
- Title: `Refund marked settled`
- Body: `The backend recorded the refund as refunded and queued the sender refund-completed notification.`
- Show backend `refundAmountGhs`.
- Show backend `refundReason`.
- Show backend `refundReference`.
- Show backend `settledAt`.
- Primary action: `Open refund evidence`
- Secondary action: `Close`
- Tertiary action: `Open finance summary`

Success must not:
- Say provider transfer happened if the reference was an adjustment reference.
- Say issue is resolved.
- Say delivery lifecycle changed.
- Hide settlement reference.

## Existing And Blocked States
`not_refund_pending`:
- Triggered when payment status is not `refund_pending`.
- Title: `Refund is not pending settlement`
- Body: `Only refund-pending payments can be marked settled.`
- Primary action: `Open refund review`
- Secondary action: `Close`
- No settlement submit.

`already_settled`:
- Triggered when payment status is `refunded` or backend rejects because settlement already happened.
- Title: `Refund already settled`
- Body: `This payment is already recorded as refunded.`
- Primary action: `Open refund evidence`
- Secondary action: `Close`
- No settlement submit.

`metadata_missing`:
- Triggered when payment is `refund_pending` but approved refund amount, reason, or requested timestamp is missing.
- Title: `Refund approval metadata is missing`
- Body: `Settlement requires approved amount, reason, and approval timestamp. Escalate this to backend or finance operations before continuing.`
- Primary action: `Open refund evidence`
- Secondary action: `Open issue detail`, when available.
- No settlement submit.

`payment_missing`:
- Triggered when payment cannot be loaded.
- Title: `Payment not found`
- Body: `This payment is unavailable or outside your access scope.`
- Primary action: `Retry`
- Secondary action: `Close`

`delivery_missing`:
- Triggered when linked delivery cannot be loaded.
- Title: `Linked delivery not found`
- Body: `Settlement cannot continue without the delivery linked to this refund.`
- Primary action: `Retry`
- Secondary action: `Open issue detail`, when available.

`role_blocked`:
- Triggered when `execute_refund` is missing.
- Title: `Refund settlement is restricted`
- Body: `Only finance admins with refund execution access can mark refunds settled.`
- Primary action: `Close`

## Error Handling
Map backend and client failures to safe UI states.

Error mapping:
| Condition | UI state | Safe copy | Recovery |
| --- | --- | --- | --- |
| `FORBIDDEN` with missing or invalid auth details | `session_expired` | `Sign in again to continue.` | Route to admin sign in |
| `FORBIDDEN` with missing `execute_refund` capability | `role_blocked` | `You do not have permission for refund settlement.` | Close or open evidence |
| `VALIDATION_ERROR` from request shape | `client_invalid` | `Some settlement information is missing or invalid.` | Fix fields |
| `VALIDATION_ERROR` with non-pending payment | `not_refund_pending` | `Only refund-pending payments can be settled.` | Open refund review or evidence |
| `NOT_FOUND` payment | `payment_missing` | `Payment was not found.` | Retry or close |
| `NOT_FOUND` linked delivery | `delivery_missing` | `Linked delivery was not found.` | Retry or open issue |
| `INTERNAL_ERROR` missing settlement metadata | `metadata_missing` | `Refund settlement is missing approval metadata.` | Open evidence and escalate |
| `RATE_LIMITED` or HTTP 429 | `rate_limited` | `Too many settlement attempts. Wait before trying again.` | Retry after wait |
| Network failure | `network_error` | `Refund settlement could not be submitted. Check connection and retry.` | Retry with same payload |
| Unknown server error | `server_rejected` | `Refund settlement failed on our side. Try again or escalate to finance lead.` | Retry or open issue |

Field errors:
- Reference errors attach to `refundReference`.
- Timestamp errors attach to date/time group.
- Confirmation errors attach to checkbox and summary.
- Context blockers attach to eligibility ledger.

Global errors:
- Show error summary at top.
- Keep user-entered reference after failure.
- Keep timestamp mode after failure.
- Keep payload visible.
- Announce blocking errors through assertive status.

Rate limit:
- Disable submit until retry window when provided.
- Keep close available when not submitting.
- Do not clear reference.

## State Machine
State list:
- `closed`
- `opening`
- `context_loading`
- `ready`
- `settlement_reference_editing`
- `settled_at_editing`
- `client_invalid`
- `payload_review`
- `confirming`
- `submitting`
- `server_confirmed`
- `server_rejected`
- `already_settled`
- `not_refund_pending`
- `metadata_missing`
- `payment_missing`
- `delivery_missing`
- `role_blocked`
- `rate_limited`
- `network_error`
- `session_expired`
- `closing_to_sign_in`
- `closing`

Transitions:
- `closed` to `opening` when trigger fires.
- `opening` to `context_loading` when context load starts.
- `context_loading` to `role_blocked` when capability is missing.
- `context_loading` to `payment_missing` when payment is unavailable.
- `context_loading` to `delivery_missing` when linked delivery is unavailable.
- `context_loading` to `already_settled` when payment is `refunded`.
- `context_loading` to `not_refund_pending` when payment is not `refund_pending`.
- `context_loading` to `metadata_missing` when approval metadata is absent.
- `context_loading` to `ready` when all required context passes.
- `ready` to `settlement_reference_editing` when form is editable.
- `settlement_reference_editing` to `settled_at_editing` when timestamp mode changes.
- `settlement_reference_editing` to `client_invalid` when reference fails validation.
- `settled_at_editing` to `client_invalid` when timestamp fails validation.
- Valid form to `payload_review`.
- `payload_review` to `settlement_reference_editing` when reference change is requested.
- `payload_review` to `settled_at_editing` when timestamp change is requested.
- `payload_review` to `confirming` when review accepted.
- `confirming` to `submitting` when confirmation is checked and submit starts.
- `submitting` to `server_confirmed` on success.
- `submitting` to `not_refund_pending` on non-pending validation.
- `submitting` to `metadata_missing` on missing metadata error.
- `submitting` to `payment_missing` on payment not found.
- `submitting` to `delivery_missing` on delivery not found.
- `submitting` to `server_rejected` on unknown server failure.
- `submitting` to `network_error` on network failure.
- `submitting` to `rate_limited` on rate limit.
- Any non-submitting state to `session_expired` on auth expiration.
- `session_expired` to `closing_to_sign_in` when user chooses sign in.
- Any non-submitting state to `closing` when user closes.
- `closing` to `closed` after exit animation and focus return.

Blocked transitions:
- `submitting` cannot close.
- `not_refund_pending` cannot submit.
- `already_settled` cannot submit.
- `metadata_missing` cannot submit.
- `role_blocked` cannot submit.
- `server_confirmed` cannot submit again.

## Modal Structure
Desktop layout:
- Max width: `820px`.
- Max height: `min(86vh, 860px)`.
- Sticky header.
- Sticky footer.
- Scrollable body.
- Single-column form with side summary at wide width.

Tablet layout:
- Width: `min(94vw, 760px)`.
- Ledger and form remain stacked.

Mobile fallback:
- Full-screen sheet.
- Single column.
- Sticky bottom action bar.
- Review rows collapse into concise cards.

Sections:
- Header.
- Settlement warning.
- Approved refund ledger.
- Eligibility ledger.
- Settlement reference field.
- Settlement timestamp field.
- Payload review.
- Confirmation block.
- Result view.
- Footer actions.

## Header
Header content:
- Eyebrow: `Finance settlement`
- Title: `Mark refund settled`
- Subtitle: `Record the refund reference only after finance has completed the refund outside Kra.`
- Close button with accessible label `Close refund settlement modal`.

Header badges:
- `Final money state`
- `Finance only`
- Current payment status.

Header must show:
- `paymentId`
- `deliveryId` when known
- `refund_pending` badge when eligible

Close behavior:
- If no edits, close immediately.
- If reference or timestamp changed, confirm before closing.
- Escape closes only when safe.
- During submit, close is disabled.

## Settlement Warning
Default warning:
- `Settlement changes the payment status to refunded. It should only be submitted after the real refund or approved adjustment is complete.`

Notification warning:
- `The backend queues a refund-completed sender notification after settlement.`

Issue warning when issue context exists:
- `This action does not resolve the linked issue. Resolve or close the issue separately if needed.`

Visual treatment:
- Amber border and light background.
- Static text by default.
- Announce only when warning content changes.

## Visual System
Use current design system tokens.

Color:
- Primary action: `brand.blue.600`.
- Success: `success.green.600`.
- Attention: `warning.amber.600`.
- Blocked or failed: `danger.red.600`.
- Text: `neutral.900`.
- Secondary text: `neutral.700`.
- Muted text: `neutral.500`.
- Surface: `surface`.

Typography:
- Title: `Manrope`, semibold, 24px desktop, 20px mobile.
- Section heading: `Manrope`, semibold, 16px.
- Body: `Inter`, regular, 14px.
- Ledger value: `Inter`, medium, 14px.
- Amount: `Inter`, semibold, tabular numerals.
- Reference: monospace display after entry.

Spacing:
- Modal padding: `24px` desktop, `16px` mobile.
- Section gap: `24px`.
- Row gap: `12px`.
- Field gap: `8px`.
- Footer gap: `12px`.

Motion:
- Modal entry uses opacity and small scale.
- Duration: `160ms`.
- No looping motion.
- Reduced motion removes scale.

## Interaction Details
Opening:
- Trigger passes `paymentId`, optional `deliveryId`, source screen, and available refund metadata.
- Focus moves to title while context loads.
- If eligible, focus moves to settlement reference field.
- If blocked, focus moves to blocker title.

Reference entry:
- User types or pastes reference.
- Trim on blur.
- Validate on blur and before review.
- Character count appears near max length.
- Warnings do not block unless policy defines them as unsafe.

Timestamp:
- Server-time mode is selected by default.
- Provider timestamp mode reveals date and time fields.
- Changing timestamp resets payload review and confirmation.

Review:
- User must review payload before confirmation.
- Correction links return focus to edited field.
- Payload changes reset confirmation.

Submit:
- One primary submit.
- Button disables immediately.
- Network retry preserves payload.
- Success invalidates caches.

Closing:
- Return focus to trigger.
- If trigger no longer exists, focus parent screen heading.

## Copy System
Voice:
- Clear.
- Calm.
- Operational.
- Finance-specific.

Words to use:
- `settlement`
- `refund reference`
- `refunded`
- `refund pending`
- `approved amount`
- `approved reason`
- `sender notification`

Words to avoid:
- `paid out` unless provider-specific evidence supports it.
- `guaranteed`.
- `automatic compensation`.
- `cash refund`.
- Provider-internal jargon outside finance-only references.

Primary CTA by state:
- Ready: `Review settlement`
- Review: `Continue to confirmation`
- Confirming: `Mark refund settled`
- Submitting: `Marking settled`
- Success: `Open refund evidence`
- Not pending: `Open refund review`
- Already settled: `Open refund evidence`
- Metadata missing: `Open refund evidence`
- Network error: `Retry settlement`

Microcopy:
- `Approval lock`: `Amount and reason come from the approved refund.`
- `Reference proof`: `Use the provider or approved adjustment reference.`
- `Server time`: `Kra will record the current server time when you submit.`
- `Provider time`: `Use this only when provider evidence shows a completed refund time.`
- `Notification`: `Sender notification is queued after backend settlement.`

Success text:
- Title: `Refund marked settled`
- Body: `The payment is now refunded and the sender refund-completed notification has been queued.`

Failure text:
- Title: `Refund settlement failed`
- Body: `The payment was not changed. Review the error and retry or escalate to finance lead.`

## Accessibility Requirements
Modal behavior:
- Use `role="dialog"`.
- Use `aria-modal="true"`.
- Title referenced by `aria-labelledby`.
- Concise warning referenced by `aria-describedby`.
- Background content inert.
- Focus trapped.
- Escape closes only when safe.
- Focus returns to trigger.

Confirmation behavior:
- Confirmation block should behave like an alert dialog region if implemented inside the modal.
- Avoid nested focus traps unless the shared modal system fully supports them.

Keyboard:
- Reference input reachable first after eligible context.
- Timestamp radio group uses arrow keys.
- Date and time controls are labeled.
- Review correction links are buttons.
- Footer actions are in logical order.

Screen reader:
- Loading state announced politely.
- Field errors announced with error summary.
- Submit status announced politely.
- Success state announced politely.
- Blocking errors announced assertively.
- Amounts include currency.
- Timestamp mode communicates whether server time or provider time will be submitted.

Visual accessibility:
- Status color never stands alone.
- Focus visible on every control.
- Touch targets meet minimum size.
- Text contrast meets AA.
- Large text does not hide footer actions.

## Privacy And Security
Data minimization:
- Show only finance-required fields.
- Do not show raw provider payloads.
- Do not show full customer contact data.
- Do not show webhook signatures.
- Do not include provider payload in analytics.

Reference safety:
- Reference is sensitive finance evidence.
- Show it only to authorized finance users.
- Do not expose reference in public or sender UI unless backend later defines safe customer copy.
- Store only through backend mutation.

Client trust boundary:
- Client records request intent.
- Backend validates status and metadata.
- Backend writes refunded state.
- Backend queues notification.
- Client cannot force amount or reason.

Analytics redaction:
- Include status, source screen, outcome, error code, reference length band.
- Exclude exact refund reference.
- Exclude customer contact data.
- Exclude provider payload.
- Exclude idempotency key.

## Cache And Navigation Effects
On successful settlement:
- Invalidate payment cache.
- Invalidate delivery detail cache.
- Invalidate finance summary cache.
- Invalidate refund settlement cache.
- Invalidate refund evidence cache.
- Invalidate sender notification cache where admin can view outbound notifications.
- Invalidate issue detail cache when issue context exists.
- Invalidate audit events cache.

Navigation actions:
- `Open refund evidence` navigates to `/admin/finance/refunds/:paymentId/evidence`.
- `Open finance summary` navigates to `/admin/finance`.
- `Open refund review` navigates to `/admin/finance/refunds/:paymentId/review`.
- `Open issue detail` navigates to `/admin/issues/:issueId` when available.
- `Close` returns to parent screen.

State preservation:
- After success, parent row should render `refunded`.
- If routing to evidence, pass success context safely.
- Do not pass exact reference through route query.
- Use route state or refreshed backend data for evidence view.

## Analytics Events
Events:
- `refund_settlement_modal_opened`
- `refund_settlement_context_loaded`
- `refund_settlement_context_blocked`
- `refund_settlement_reference_entered`
- `refund_settlement_timestamp_mode_changed`
- `refund_settlement_payload_reviewed`
- `refund_settlement_confirmation_checked`
- `refund_settlement_submit_started`
- `refund_settlement_submit_succeeded`
- `refund_settlement_submit_failed`
- `refund_settlement_evidence_opened`
- `refund_settlement_modal_closed`

Shared properties:
- `sourceScreen`
- `paymentStatus`
- `deliveryPaymentStatus`
- `refundReason`
- `hasIssueContext`
- `hasReconciliationContext`
- `timestampMode`
- `referenceLengthBand`
- `outcome`
- `errorCode`
- `durationMs`

Do not capture:
- Exact refund reference.
- Customer name.
- Customer phone.
- Provider raw payload.
- Issue note text.
- Auth token.
- Idempotency key.

Outcome values:
- `settled`
- `not_refund_pending`
- `already_settled`
- `metadata_missing`
- `role_blocked`
- `network_error`
- `server_rejected`
- `closed_without_submit`

## Component API
Suggested component signature:
```ts
type RefundSettlementModalProps = {
  isOpen: boolean;
  paymentId: string;
  sourceScreen:
    | "AdminRefundSettlement"
    | "AdminRefundReview"
    | "AdminFinanceSummary"
    | "AdminRefundEvidenceReview"
    | "AdminPaymentReconciliationDetail"
    | "AdminIssueDetail"
    | "AdminSlaBreachDashboard";
  deliveryId?: string;
  issueId?: string;
  reconciliationId?: string;
  initialContext?: RefundSettlementContext;
  onClose: () => void;
  onSettled?: (result: RefundSettlementResult) => void;
  onRouteToEvidence?: (input: RefundSettlementRouteContext) => void;
  onRouteToReview?: (paymentId: string) => void;
  onRouteToFinance?: () => void;
};
```

Suggested internal types:
```ts
type SettlementTimestampMode = "server_time" | "provider_time";

type RefundSettlementForm = {
  refundReference: string;
  timestampMode: SettlementTimestampMode;
  providerSettledAtDate?: string;
  providerSettledAtTime?: string;
  providerSettledAtTimezone?: string;
};
```

API hook:
- Use typed API client from shared contracts where available.
- Mutation name should align with `settle_refund_payment`.
- Query invalidation must be explicit and tested.

Do not:
- Hardcode untyped fetch in component body.
- Put reference in URL query.
- Store reference in analytics.
- Create a frontend-only `refunded` state.

## Test Requirements
Unit tests:
- Renders role-blocked state without submit for missing `execute_refund`.
- Renders not-refund-pending state when payment status is not `refund_pending`.
- Renders already-settled state when payment status is `refunded`.
- Renders metadata-missing state when approved amount is absent.
- Renders metadata-missing state when approved reason is absent.
- Renders metadata-missing state when approval timestamp is absent.
- Validates required settlement reference.
- Validates reference min length.
- Validates reference max length.
- Warns when reference equals payment ID only.
- Warns when reference equals delivery ID only.
- Omits `settledAt` in server-time mode.
- Includes ISO `settledAt` in provider-time mode.
- Blocks future provider timestamp.
- Shows warning for timestamp before approval.
- Builds payload with only allowed fields.
- Does not include amount or reason.
- Resets confirmation after field changes.
- Preserves reference after network failure.
- Disables close during submit.

Integration tests:
- Opens from `AdminRefundSettlement` with refund-pending context.
- Opens from `AdminRefundReview` success and shows approved backend result.
- Opens from `AdminFinanceSummary` row and refreshes row after success.
- Opens from `AdminIssueDetail` and does not resolve issue after settlement.
- Submits successful `settle_refund_payment` and renders backend result.
- Handles `VALIDATION_ERROR` when status is not refund pending.
- Handles `INTERNAL_ERROR` when metadata is missing.
- Handles forbidden response.
- Handles rate limit response.
- Handles session expiration.

Accessibility tests:
- Modal has `role="dialog"` and `aria-modal="true"`.
- Focus moves into modal on open.
- Focus is trapped.
- Escape closes when safe.
- Escape does not close while submitting.
- Focus returns to trigger.
- Reference error is associated with input.
- Timestamp group has accessible name.
- Review correction links are keyboard accessible.
- Success status is announced.
- Large text does not hide footer action.

Visual regression targets:
- Ready state.
- Reference editing state.
- Timestamp provider mode.
- Payload review.
- Confirmation.
- Submitting.
- Success.
- Not refund pending.
- Already settled.
- Metadata missing.
- Role blocked.
- Mobile full-screen sheet.

End-to-end scenarios:
- Finance admin settles refund with server time.
- Finance admin settles refund with provider timestamp.
- Finance admin opens modal from approval success.
- Finance admin is blocked when payment is not refund pending.
- Finance admin is blocked when metadata is missing.
- Support admin without capability cannot submit.
- Network failure preserves reference and retry path.

## Acceptance Criteria
Functional:
- Modal opens from every listed parent.
- Modal loads or receives refund-pending context.
- Modal blocks missing role or capability.
- Modal blocks non-pending payments.
- Modal blocks already settled payments.
- Modal blocks missing approval metadata.
- Modal requires settlement reference.
- Modal optionally accepts provider timestamp.
- Modal builds valid `settleRefundRequestSchema` payload.
- Modal never sends amount.
- Modal never sends reason.
- Modal never calls approval endpoint.
- Modal handles success as `refunded`.
- Modal shows sender notification expectation.
- Modal routes evidence after success.

UX:
- Finance can identify payment, delivery, amount, reason, and requested timestamp.
- Finance can enter reference quickly.
- Finance understands server time versus provider time.
- Finance reviews exact payload before submit.
- Finance confirms final consequence.
- Finance sees clear success and next step.
- Finance can recover from failure without losing the reference.

Accessibility:
- Fully keyboard operable.
- Screen reader state changes announced.
- Visible focus throughout.
- Errors tied to fields and summary.
- Target sizes meet minimum.
- Reduced motion honored.

Security:
- Submit is capability-gated.
- Exact reference excluded from analytics.
- Raw provider payload hidden.
- Duplicate submit protection enforced.
- Stale context requires refresh.

## Implementation Notes For Claude Code
Build this as a shared admin modal used by settlement-oriented finance surfaces. Keep it narrower than `RefundDecisionModal`.

The modal should assume that refund eligibility has already been decided. It must not ask approval questions, compute amounts, or let users change refund reason. It only records settlement reference and optional settlement timestamp for payments already in `refund_pending`.

Be careful with idempotency: the HTTP handler uses the idempotent mutation runner, while the route registry currently marks `settle_refund_payment` as not idempotent. Frontend should still prevent duplicate submits and send an idempotency key when the API client supports it, but tests should not rely only on route metadata to infer behavior.

The final implementation must feel like closing a financial record:
- Locked approval evidence.
- Required settlement reference.
- Optional precise timestamp.
- Review before submit.
- Explicit confirmation.
- Clear completed state.
- No scope creep into approval, payout setup, issue resolution, or custody workflows.

## Build Checklist
- Create shared modal component under admin UI package.
- Add typed props and route context adapter.
- Add context hydration hook.
- Add role and capability gate.
- Add approved refund ledger.
- Add settlement eligibility ledger.
- Add required reference field.
- Add optional timestamp mode.
- Add deterministic payload builder.
- Add payload review section.
- Add confirmation checkbox.
- Add duplicate-submit protection.
- Add mutation submit for `settle_refund_payment`.
- Add success view with backend result.
- Add not-pending, already-settled, and metadata-missing views.
- Add rate-limit, network, forbidden, and session states.
- Add sender notification expectation.
- Add analytics with reference redaction.
- Add cache invalidation.
- Add keyboard and focus handling.
- Add unit, integration, accessibility, and visual tests.

## Final Implementation Directive
`RefundSettlementModal` must be the finance closeout control for already-approved refunds. It must submit only `settle_refund_payment`, send only `paymentId`, `refundReference`, and optional `settledAt`, rely on backend-approved amount and reason, and never perform refund approval or issue resolution. Build it as a precise, auditable, keyboard-first settlement modal that makes the final money-state change clear before it happens and easy to verify after it succeeds.

# Admin Refund Settlement Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminRefundSettlement` |
| Route | `/admin/finance/refunds/:paymentId/settle` |
| Test id | `screen-admin-refund-settlement` |
| Surface | Admin web console |
| Backend coverage | `settle_refund_payment`; read context from refund review, finance summary, delivery detail, and issue context when available |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` with finance access |
| Required submit role | `finance_admin` or `super_admin` with `execute_refund` capability |
| Required states | `loading`, `ready`, `evidence_missing`, `client_invalid`, `review`, `confirm`, `submitting`, `settled`, `failed`, `not_settleable`, `already_settled`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminRefundReview`, `AdminFinanceSummary`, `AdminIssueDetail` |
| Related screens | `AdminRefundReview`, `AdminRefundEvidenceReview`, `AdminFinanceSummary`, `AdminPaymentReconciliationDetail`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminDeliveryDetail`, `SenderRefundStatus`, `AdminStaffActivityLog` |

## Purpose
`AdminRefundSettlement` is the finance execution screen for marking an already-approved refund as settled. It lets an authorized finance admin verify refund-pending evidence, enter the provider or adjustment refund reference, optionally enter the settlement timestamp, review the exact payload, confirm the financial action, and submit the idempotent `settle_refund_payment` mutation.

The screen should answer:
- `Is this refund already approved and pending settlement?`
- `What amount and reason were approved?`
- `Which payment and delivery will be marked refunded?`
- `What refund reference proves settlement?`
- `What settlement timestamp will be recorded?`
- `What happens after settlement?`
- `Will the sender be notified?`
- `Where can finance view settlement evidence after success?`

This screen is not a refund approval screen. It does not decide eligibility, compute refund amount, enter alternate payout details, approve compensation, or settle non-approved payments.

## Backend Reality
The concrete endpoint is:
```http
POST /v1/payments/refund/settle
```

Operation:
```text
settle_refund_payment
```

Capability:
```text
execute_refund
```

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
- `refundReference` must be trimmed and `3..120` characters.
- `settledAt` is optional ISO date-time.
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
- The mutation is idempotent when called with `Idempotency-Key`.
- The payment must be in `refund_pending`.
- The payment must already have refund metadata: `refundAmountGhs`, `refundReason`, and `refundRequestedAt`.
- If payment is not `refund_pending`, backend rejects with validation error.
- If refund metadata is missing, backend rejects with internal error.
- If linked delivery is missing, backend rejects.
- Successful settlement marks payment as `refunded`.
- Successful settlement updates delivery payment status to `refunded`.
- Successful settlement queues a sender notification of type `refund_completed`.
- This screen does not decide refund eligibility.

Therefore:
- This screen may submit only `settle_refund_payment`.
- This screen must not submit refund approval.
- This screen must not settle unless known status is `refund_pending`.
- This screen must require a refund reference.
- This screen must require review and confirmation.
- This screen must include an idempotency key.
- This screen must route to evidence after success.

## Context Reality
The route provides only `paymentId`.

The screen should hydrate context from:
- `AdminRefundReview` success state.
- `AdminFinanceSummary` row with status `refund_pending`.
- Delivery detail payment context.
- Issue detail context.
- Query cache holding refund-pending payment data.

If context is missing:
- Show `evidence_missing`.
- Do not submit.
- Offer routes to finance summary, refund review, delivery detail, and issue queue.

Do not:
- Guess refund amount.
- Guess refund reason.
- Guess that status is `refund_pending`.
- Submit settlement without evidence.

## Primary Users
Primary:
- `finance_admin` settling an approved refund.
- `super_admin` settling under finance governance.

Secondary:
- Support lead checking that customer communication will be triggered.
- Product owner validating refund policy execution.
- QA validating high-risk settlement flow.
- Security reviewer validating finance-only mutation boundaries.
- Claude Code implementing the admin console later.

Non-users:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without execute-refund capability.
- `ops_admin` without execute-refund capability.
- Public visitor.

## User Goal
Authorized finance users use this screen to:
- Confirm the refund was already approved.
- Enter an external refund reference or internal adjustment reference.
- Optionally set a settlement timestamp.
- Review the exact settlement payload.
- Confirm final settlement.
- See success state and next steps.
- Open refund evidence after settlement.

The screen should make final settlement deliberate, auditable, and impossible to confuse with approval.

## Entry Points
The screen can open from:
- `AdminRefundReview` approved success.
- `AdminFinanceSummary` refund-pending payment row.
- `AdminPaymentReconciliationDetail` refund-pending action.
- `AdminIssueDetail` refund-pending context.
- `AdminDeliveryDetail` refund-pending payment context.
- Direct route `/admin/finance/refunds/:paymentId/settle`.

The screen must not open from:
- Public web.
- Sender app.
- Receiver tracking.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Unauthenticated routes.

## Scope
In scope:
- Payment ID route parsing.
- Refund-pending evidence display.
- Refund reference input.
- Optional settlement timestamp input.
- Review step.
- Confirmation step.
- Idempotent submit.
- Settlement success state.
- Not-settleable state.
- Already-settled state.
- Evidence-missing state.
- Error and authorization states.
- Accessibility and keyboard support.

Out of scope:
- Refund approval.
- Refund eligibility decision.
- Refund amount editing.
- Refund reason editing.
- Provider payout account entry.
- Cash refund handling.
- Alternate path execution details.
- Compensation payout.
- Payment status editing.
- Bulk settlement.

## Product Position
`AdminRefundSettlement` is the final money-recording action for an approved refund. It should feel controlled, narrow, and official.

Design principles:
- Show approved refund evidence before form fields.
- Require a settlement reference.
- Make optional timestamp explicit.
- Show the exact payload before submit.
- Confirm the sender notification outcome.
- Route to evidence after success.
- Keep settlement separate from approval.

Restraint rule:
- No approval questions.
- No refund amount input.
- No payout account forms.
- No bulk action toolbar.
- No decorative celebration.

## External UX Research And References
Use only references directly relevant to financial settlement:
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports a final review step before submitting financial information.
- [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/): supports clear completion states with reference number and next steps.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): supports focused question entry for refund reference and timestamp.
- [USWDS validation component](https://designsystem.digital.gov/components/validation/): supports clear input validation.
- [W3C WCAG error prevention for financial data](https://w3c.github.io/wcag/understanding/error-prevention-legal-financial-data.html): settlement is a financial action and must support review, correction, and confirmation.
- [W3C WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): validation, submission, and completion feedback must be announced accessibly.

How these references affect this screen:
- Use focused field entry.
- Use check answers before submit.
- Use confirmation screen after success.
- Use explicit validation summary.
- Use status messages for submit and completion.

## UX Thesis
The screen should feel like closing a finance case: approved evidence, settlement reference, review, confirmation, completed record.

Visual direction:
- Calm finance canvas.
- Deep ink text.
- Amber warning before final submit.
- Green success only after backend confirms settlement.
- Monospace payment and refund references.
- Strong summary list layout.

Motion direction:
- No decorative motion.
- Submit progress is textual.
- Success panel appears without distracting animation.
- Respect `prefers-reduced-motion`.

## Information Architecture
Step order:
1. Evidence.
2. Settlement fields.
3. Review.
4. Confirm.
5. Settled.

Desktop layout:
- Main form column.
- Right rail with approved refund evidence and policy notes.

Mobile layout:
- Eligibility first.
- Evidence summary.
- Settlement fields.
- Review.
- Confirm.

## Header
Required content:
- Breadcrumb: `Admin` -> `Finance` -> `Refunds` -> `{paymentId}` -> `Settle`.
- H1: `Refund settlement`.
- Subheading: `{paymentId}`.
- Back link to previous route.
- Status chip: `Pending settlement`, `Settled`, `Not settleable`, or `Evidence missing`.

Rules:
- Do not render settlement form until evidence is loaded.
- Do not show approval questions.
- Do not show amount input.

## Eligibility Gate
Required known evidence:
- Payment ID.
- Delivery ID.
- Payment status.
- Refund amount.
- Refund reason.
- Refund requested timestamp when available.

Settleable:
- Payment status is `refund_pending`.
- Refund amount is present.
- Refund reason is present.

Block states:
- `already_settled`: payment status is `refunded`.
- `not_settleable`: payment status is not `refund_pending`.
- `evidence_missing`: refund metadata is unavailable.

Not-settleable copy:
```text
Only refund-pending payments can be settled.
```

Evidence missing copy:
```text
Refund approval evidence is missing. Open refund review or finance summary before settling.
```

Already settled copy:
```text
This refund is already marked settled.
```

## Evidence Panel
Display:
- Payment ID.
- Delivery ID.
- Refund amount.
- Refund reason.
- Refund requested time.
- Current payment status.
- Existing refund reference if present.
- Existing settlement time if present.

Rules:
- Use `GHS`.
- Do not let finance edit amount or reason.
- Do not hide existing settlement fields.
- Do not submit if payment is already refunded.

## Settlement Fields
Field 1:
- Label: `Refund reference`.
- Schema: `refundReference`.
- Required.
- Min length `3`.
- Max length `120`.
- Hint: `Use the provider refund reference or approved adjustment reference.`

Field 2:
- Label: `Settlement time`.
- Schema: `settledAt`.
- Optional.
- Type: date-time input or date plus time fields.
- Hint: `Leave blank to use server time.`

Validation:
- Refund reference is required.
- Refund reference must be 3 to 120 characters after trim.
- Settlement time must be a valid ISO date-time if provided.
- Settlement time cannot be vague text.

Rules:
- Do not collect provider credentials.
- Do not collect payout account details.
- Do not allow amount edits.
- Do not auto-generate reference.

## Review Step
Review fields:
- Payment ID.
- Delivery ID.
- Refund amount.
- Refund reason.
- Refund reference.
- Settlement time or `Server time will be used`.

Review title:
```text
Check refund settlement before submitting
```

Warning:
```text
Settlement marks this payment and delivery as refunded and queues a sender notification.
```

Actions:
- `Change reference`.
- `Change settlement time`.
- `Continue to confirmation`.
- `Cancel`.

Rules:
- Do not submit directly from field entry.
- Show omitted optional timestamp clearly.
- Keep final submit out of review until confirmation.

## Confirmation Step
Confirmation title:
```text
Settle this refund for {paymentId}?
```

Body:
```text
Kra will mark the refund as settled, update the delivery payment state to refunded, and queue the sender refund completed notification.
```

Primary action:
- `Confirm settlement`.

Secondary actions:
- `Back to review`.
- `Cancel`.

Rules:
- Require explicit confirmation.
- Use idempotency key for final submit.
- Disable submit while request is in flight.

## Submission
Endpoint:
```http
POST /v1/payments/refund/settle
```

Required request behavior:
- Include `Authorization`.
- Include `Idempotency-Key`.
- Include `paymentId`.
- Include trimmed `refundReference`.
- Include `settledAt` only if provided.
- Do not include refund amount.
- Do not include refund reason.
- Do not include approval flags.

Success behavior:
- Show settled confirmation.
- Invalidate finance summary and payment caches.
- Route to refund evidence.
- Announce `Refund settled`.

Success title:
```text
Refund settled
```

Success body:
```text
Kra recorded refund reference {refundReference} for GHS {refundAmountGhs}. The sender notification has been queued by the backend.
```

Primary action:
- `Open refund evidence`.

Destination:
- `/admin/finance/refunds/:paymentId/evidence`.

Secondary actions:
- `Back to finance summary`.
- `Open delivery`.

## Failed State
Use `failed` when settlement submission fails.

Copy:
```text
Refund settlement failed
```

Rules:
- Preserve entered fields.
- Preserve idempotency key for retry of same payload.
- Show request ID when available.
- Do not show stack traces.
- Do not mark settled locally.
- Do not route to evidence.

## Already Settled State
Trigger:
- Context or backend indicates status `refunded`.

Actions:
- `Open refund evidence`.
- `Open delivery`.
- `Back to finance summary`.

Rules:
- Do not submit again.
- Show existing reference and settlement time if available.

## Not Settleable State
Trigger:
- Payment status is not `refund_pending`.
- Backend validation says only refund-pending payments can be settled.

Actions:
- If status is `confirmed`: `Open refund review`.
- If status is `pending` or `failed`: `Open reconciliation`.
- If status is `refunded`: `Open refund evidence`.
- `Back to finance summary`.

Rules:
- Do not show settlement form.
- Do not allow override.

## Error State
Full error title:
```text
Refund settlement could not load
```

Submit error title:
```text
Refund settlement failed
```

Rules:
- Preserve entered values after submit error.
- Show request ID when available.
- Do not show raw provider errors.
- Do not show internal secrets.

## Authorization State
Title:
```text
Refund settlement access required
```

Body:
```text
Only admins with refund execution access can settle approved refunds.
```

Rules:
- Do not render settlement form.
- Do not render provider reference.
- Do not submit mutation.

## Session Expired State
Title:
```text
Sign in again to settle refunds
```

Rules:
- Preserve route.
- Clear sensitive evidence from visible UI.
- Require confirmation again after sign-in.

## Security And Privacy
Sensitive fields:
- Payment ID.
- Delivery ID.
- Refund reference.
- Refund amount.
- Refund reason.
- Settlement timestamp.

Rules:
- Do not log refund reference.
- Do not include IDs or reference in analytics.
- Do not store form values in local storage.
- Do not show evidence after logout.
- Use idempotency key.
- Clear idempotency key after success.

## Analytics
Allowed events:
- `admin_refund_settlement_viewed`.
- `admin_refund_settlement_reference_entered`.
- `admin_refund_settlement_reviewed`.
- `admin_refund_settlement_confirmed`.
- `admin_refund_settled`.
- `admin_refund_settlement_failed`.
- `admin_refund_settlement_route_clicked`.

Payload rules:
- Include result status.
- Include whether custom `settledAt` was provided.
- Include destination route family.
- Do not include payment ID.
- Do not include delivery ID.
- Do not include refund reference.
- Do not include exact amount unless approved as aggregated metric.

## Accessibility Requirements
Landmarks:
- Main content.
- Evidence region.
- Settlement form region.
- Review region.
- Confirmation region.
- Result region.

Keyboard:
- All fields reachable.
- Error summary links to fields.
- Review change links reachable.
- Confirmation actions reachable.

Screen reader:
- Required refund reference is announced.
- Optional settlement time is announced.
- Review step exposes `Server time will be used` when timestamp is omitted.
- Submit and success states use live region.
- Success heading receives focus.

Error prevention:
- Review before submit.
- Confirmation before submit.
- Ability to change reference and settlement time.
- Clear final action label.

## Responsive Design
Desktop:
- Two-column layout with evidence rail.
- Review summary uses summary list.

Mobile:
- One-column flow.
- Evidence before form.
- Full-width actions.
- No hidden warning text.

## Testing Requirements
Unit tests:
- Blocks submit when evidence missing.
- Blocks submit when status is not `refund_pending`.
- Requires refund reference.
- Validates reference length.
- Validates optional settled time.
- Omits `settledAt` when blank.
- Sends idempotency key.
- Shows review before confirmation.
- Maps success response to settled state.
- Does not show approval fields.
- Does not show amount input.

Integration tests:
- Refund review success routes to settlement.
- Refund-pending context can settle.
- Settled response routes to evidence.
- Already-settled context blocks submit.
- Non-finance role is blocked.
- Submit failure preserves reference.
- Session expiry requires sign-in and confirmation again.

Accessibility tests:
- One H1.
- Required reference field is labeled.
- Error summary links to field.
- Review step exposes all values.
- Confirmation step names the payment.
- Success is announced.
- Keyboard reaches every action.

## Acceptance Criteria
1. The screen renders at `/admin/finance/refunds/:paymentId/settle`.
2. The screen submits only `POST /v1/payments/refund/settle`.
3. The request includes `paymentId`, `refundReference`, and optional `settledAt`.
4. The request includes `Idempotency-Key`.
5. The screen never sends refund amount or refund reason.
6. The screen blocks submit when status is not `refund_pending`.
7. The screen requires refund reference.
8. The screen shows review before submit.
9. The screen shows confirmation before submit.
10. Successful settlement shows refund reference, amount, reason, and settlement time.
11. Successful settlement routes to refund evidence.
12. The screen never approves refunds.
13. The screen never collects provider credentials.
14. The screen never collects payout account details.
15. The screen never executes cash or alternate path details.
16. The screen protects refund reference and sensitive finance data.
17. Accessibility checks pass for form, review, confirmation, status, and keyboard flow.
18. Analytics exclude payment ID, delivery ID, refund reference, and raw evidence.

## Implementation Notes For Claude Code
Build `AdminRefundSettlement` as the final settlement flow for payments already in `refund_pending`. Hydrate evidence from refund review success, finance summary, delivery, or issue context; block submission if refund evidence is missing or the payment is not refund pending. Collect a required refund reference and optional settlement time, require review and confirmation, then submit `settle_refund_payment` with an idempotency key. Treat success as `refunded` and route to refund evidence. Do not add approval questions, amount edits, provider credentials, payout account fields, cash refund controls, alternate path execution, payment status editing, or unsupported request fields.

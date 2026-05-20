# Admin Refund Review Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminRefundReview` |
| Route | `/admin/finance/refunds/:paymentId/review` |
| Test id | `screen-admin-refund-review` |
| Surface | Admin web console |
| Backend coverage | `refund_payment`; read context from finance, delivery, issue, and reconciliation screens when available |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` with finance access |
| Required submit role | `finance_admin` or `super_admin` with `approve_refund` capability |
| Required states | `loading`, `ready`, `evidence_missing`, `client_invalid`, `review`, `confirm`, `submitting`, `approved`, `rejected`, `manual_review_required`, `already_processed`, `not_refundable`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminPaymentReconciliationDetail`, `AdminIssueDetail` |
| Related screens | `AdminRefundSettlement`, `AdminRefundEvidenceReview`, `AdminFinanceSummary`, `AdminPaymentReconciliationDetail`, `AdminIssueQueue`, `AdminIssueDetail`, `AdminDeliveryDetail`, `SenderRefundStatus`, `AdminStaffActivityLog` |

## Purpose
`AdminRefundReview` is the finance decision screen for deciding whether a confirmed payment should enter `refund_pending`. It lets an authorized finance admin review payment and delivery evidence, choose only the backend-supported refund reason inputs, see the expected policy outcome, confirm the decision, and submit the idempotent `refund_payment` mutation.

The screen should answer:
- `Is this payment eligible for refund review?`
- `Is the payment confirmed?`
- `Has a refund already started or completed?`
- `What policy path is being used?`
- `Which evidence supports the refund decision?`
- `Which backend request flags will be submitted?`
- `What refund amount and reason did the backend approve?`
- `What screen handles settlement after approval?`
- `If this cannot be approved here, where should finance go next?`

This screen does not settle refunds. It does not move money. It does not create provider refund references. It does not execute alternate refund paths. It does not provide a backend rejection mutation, because the current API does not expose one.

## Backend Reality
The concrete refund approval endpoint is:
```http
POST /v1/payments/refund
```

Operation:
```text
refund_payment
```

Capability:
```text
approve_refund
```

Request body:
```json
{
  "paymentId": "PAY-7001",
  "duplicateCharge": true,
  "platformPaymentError": false,
  "packageNeverReceivedAtOrigin": false,
  "doorstepAttemptOccurred": false,
  "expressHandlingPerformed": true
}
```

Request fields:
- `paymentId` is required.
- `duplicateCharge` is optional boolean.
- `platformPaymentError` is optional boolean.
- `packageNeverReceivedAtOrigin` is optional boolean.
- `doorstepAttemptOccurred` is optional boolean.
- `expressHandlingPerformed` is optional boolean.

Successful response:
```json
{
  "paymentId": "PAY-7001",
  "deliveryId": "DEL-7001",
  "refundStatus": "refund_pending",
  "refundAmountGhs": 35,
  "refundReason": "full_refund_pre_intake",
  "requiresManualReview": false,
  "requestedAt": "2026-05-20T10:00:00.000Z"
}
```

Possible refund reasons:
- `full_refund_pre_intake`
- `duplicate_charge`
- `platform_payment_error`
- `never_received_at_origin`
- `post_intake_handling_fee`
- `doorstep_surcharge_refund`
- `express_surcharge_refund`

Important backend facts:
- The mutation is admin-only.
- The mutation requires `approve_refund`.
- The mutation is idempotent when called with `Idempotency-Key`.
- Only `confirmed` payments can be refunded.
- `refund_pending` and `refunded` payments are rejected as already in progress or completed.
- The backend fetches the delivery linked to the payment.
- The backend calculates the quote breakdown from delivery data.
- The backend determines the refund decision from delivery stage and request flags.
- If the decision requires manual review or amount is zero, the backend returns validation error.
- A successful approval marks payment and delivery payment status as `refund_pending`.
- The successful response always has `requiresManualReview: false`.
- Settlement happens separately through `POST /v1/payments/refund/settle`.
- No current backend endpoint records a rejection decision for this refund review route.

Therefore:
- This screen may submit only `refund_payment`.
- This screen must not call settlement.
- This screen must not show a backend-powered reject button.
- This screen can show `Rejected` only as a local policy outcome or as a support/issue routing state, not as a saved refund state.
- This screen must require review and confirmation before submit.
- This screen must include an idempotency key on submit.

## Context Reality
The route provides only `paymentId`.

The screen should hydrate context from:
- Navigation state from finance summary, reconciliation detail, issue detail, or delivery detail.
- Query cache for admin finance rows.
- Query cache for reconciliation rows.
- Delivery detail if available through admin delivery route and `deliveryId` is known.
- Issue detail or queue context if a payment/refund issue opened the route.

If required evidence cannot be loaded:
- Show `evidence_missing`.
- Do not submit.
- Provide routes to delivery detail, issue queue, finance summary, and reconciliation detail.

Do not:
- Invent a payment detail endpoint.
- Guess delivery stage without data.
- Guess refund amount on the client.
- Guess refund reason as final before backend response.

## Primary Users
Primary:
- `finance_admin` deciding whether a confirmed payment should enter refund pending.
- `super_admin` acting under finance governance.

Secondary:
- Support lead checking dispute evidence.
- Operations lead checking whether service failure is custody-related.
- Product owner validating refund policy behavior.
- QA validating high-risk financial workflow.
- Security reviewer validating finance-only controls.
- Claude Code implementing the admin console later.

Non-users:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without refund approval capability.
- `ops_admin` without refund approval capability.
- Public visitor.

## User Goal
Authorized finance users use this screen to:
- Verify payment and delivery context.
- Confirm the payment is eligible for refund approval.
- Select backend-supported reason inputs.
- Review the exact payload.
- Confirm that approval moves the payment to `refund_pending`.
- Submit once.
- Route to settlement after approval.
- Route unsupported or manual-review cases to issue/dispute workflow.

The screen should prevent accidental money-liability changes while keeping eligible refunds fast and auditable.

## Entry Points
The screen can open from:
- `AdminFinanceSummary` payment row.
- `AdminPaymentReconciliationDetail` confirmed payment action.
- `AdminIssueDetail` payment dispute or refund request.
- `AdminIssueQueue` refund item.
- `AdminDeliveryDetail` payment context.
- Direct route `/admin/finance/refunds/:paymentId/review`.

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
- Evidence loading from available admin contexts.
- Eligibility display.
- Refund policy question set.
- Review payload step.
- Confirmation step.
- Idempotent submit.
- Success state.
- Already-processed state.
- Not-refundable state.
- Manual-review-required state.
- Evidence-missing state.
- Error and authorization states.
- Accessibility and keyboard support.

Out of scope:
- Refund settlement.
- Provider refund reference entry.
- Alternate refund path execution.
- Cash refund handling.
- Rejection mutation.
- Compensation payout.
- Loss or damage compensation calculation beyond service fee refund.
- Editing delivery status.
- Editing payment status.
- Provider console access.
- Bulk refund approvals.

## Product Position
`AdminRefundReview` is a high-risk financial decision screen. It must feel procedural and controlled: evidence first, policy path second, payload review third, confirmation last.

Design principles:
- Never start with a submit button.
- Require evidence before decision.
- Keep policy flags plain-language.
- Show what the backend supports.
- Separate approval from settlement.
- Make already-processed states obvious.
- Keep manual-review cases out of automatic approval.
- Use exact money language.

Restraint rule:
- No decorative finance graphics.
- No payout language.
- No inline settlement fields.
- No free-form rejection if backend cannot store it.
- No hidden default true values.

## External UX Research And References
Use only references directly relevant to high-risk refund decisions:
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports a review step before high-impact submission.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): supports asking only necessary questions and making required/optional choices clear.
- [GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/): supports warnings for important consequences before approval.
- [USWDS validation component](https://designsystem.digital.gov/components/validation/): relevant for clear form validation and error communication.
- [W3C WCAG error prevention for financial data](https://w3c.github.io/wcag/understanding/error-prevention-legal-financial-data.html): refund approval is a financial commitment and must support review, correction, and confirmation.
- [W3C WCAG status messages](https://w3c.github.io/wcag/understanding/status-messages): submission, validation, and result feedback must be announced without forcing focus unnecessarily.

How these references affect this screen:
- Use a question step for policy inputs.
- Use a check step before submitting.
- Use explicit warning text before approval.
- Use validation summaries tied to fields.
- Require confirmation for financial commitment.
- Announce submit and result states accessibly.

## UX Thesis
The page should feel like a refund approval file: evidence on the left, policy questions in the center, decision summary and risk controls on the right, with no path to accidental settlement.

Visual direction:
- Neutral finance canvas.
- Deep slate headings.
- Amber warning before approval.
- Green only after backend approval.
- Red for not-refundable or already-processed errors.
- Monospace payment IDs.
- Clean summary lists.
- Sparse but strong dividers.

Motion direction:
- No decorative motion.
- Step transitions can fade if motion is allowed.
- Submit progress is textual.
- Success state can softly reveal settlement route.
- Respect `prefers-reduced-motion`.

## Information Architecture
Step order:
1. Evidence.
2. Policy questions.
3. Review.
4. Confirm.
5. Result.

Desktop layout:
- Main evidence and form column.
- Right rail for current eligibility, policy notes, and next route.

Mobile layout:
- One column.
- Eligibility first.
- Evidence.
- Questions.
- Review.
- Confirm.

## Header
Required content:
- Breadcrumb: `Admin` -> `Finance` -> `Refunds` -> `{paymentId}`.
- H1: `Refund review`.
- Subheading: `{paymentId}`.
- Back link: `Back to finance summary` or previous route.
- Status chip: `Review`, `Approved`, `Needs manual review`, `Already processed`, or `Not refundable`.

Rules:
- Do not show approval form until context is loaded.
- Do not show settlement fields.
- Do not show a reject submit button.

## Eligibility Gate
The screen must verify or display:
- Payment ID.
- Delivery ID when available.
- Payment status.
- Amount paid.
- Delivery stage when available.
- Existing refund state when available.
- Issue or dispute context when available.

Eligible to continue:
- Payment is known.
- Payment status is `confirmed`.
- No known `refund_pending` or `refunded` state.
- Evidence is sufficient for finance to answer policy questions.

Block states:
- `already_processed`: payment status is `refund_pending` or `refunded`.
- `not_refundable`: payment status is not `confirmed`.
- `evidence_missing`: required payment or delivery context is unavailable.

Already processed copy:
```text
Refund is already in progress or completed for this payment.
```

Not refundable copy:
```text
Only confirmed payments can be approved for refund.
```

Evidence missing copy:
```text
Required payment or delivery evidence is missing. Load the delivery or issue context before approving a refund.
```

## Evidence Panel
Required evidence fields when available:
- Payment ID.
- Delivery ID.
- Payment status.
- Amount paid.
- Provider.
- Provider reference if finance context includes it.
- Delivery status.
- Origin station.
- Destination station.
- Service type.
- Doorstep requested.
- Express service.
- Intake state.
- Dispatch state.
- Support issue category.
- Dispute evidence.

Rules:
- Do not submit if payment status is unknown.
- Do not show provider reference outside finance access.
- Do not invent missing delivery fields.
- Do not calculate final refund amount on the client.
- Use evidence hierarchy from refund policy.

## Policy Questions
The form maps directly to backend optional booleans.

Question 1:
- Label: `Was this a duplicate charge?`
- Field: `duplicateCharge`.
- Options: `Yes`, `No`, `Not known`.
- If `Not known`, omit the field.

Question 2:
- Label: `Was there a platform payment error?`
- Field: `platformPaymentError`.
- Options: `Yes`, `No`, `Not known`.
- If `Not known`, omit the field.

Question 3:
- Label: `Was the package never received at the origin station?`
- Field: `packageNeverReceivedAtOrigin`.
- Options: `Yes`, `No`, `Not known`.
- If `Not known`, omit the field.

Question 4:
- Label: `Did a doorstep attempt occur?`
- Field: `doorstepAttemptOccurred`.
- Options: `Yes`, `No`, `Not applicable or not known`.
- If `Not applicable or not known`, omit the field.

Question 5:
- Label: `Was express handling performed?`
- Field: `expressHandlingPerformed`.
- Options: `Yes`, `No`, `Not applicable or not known`.
- If `Not applicable or not known`, omit the field.

Rules:
- Do not default optional booleans silently.
- Do not send false unless the finance admin selected `No`.
- Do not send true unless the finance admin selected `Yes`.
- Show why each question matters.
- Allow finance admin to return and change answers before submit.

## Review Step
Before submit, show:
- Payment ID.
- Delivery ID.
- Payment status.
- Selected flags.
- Omitted flags shown as `Not provided`.
- Warning that backend computes amount and reason.
- Warning that successful approval moves payment to `refund_pending`.
- Settlement route note.

Review title:
```text
Check refund review before approval
```

Warning:
```text
Approval creates refund liability and moves this payment to refund pending. Settlement is handled on the settlement screen.
```

Rules:
- The primary button must say `Approve refund`.
- Provide `Change answers`.
- Provide `Cancel review`.
- Do not show `Reject refund` as backend submit.
- Do not let Enter key accidentally approve without confirmation step.

## Confirmation Step
Confirmation can be a full page section or modal, depending on design system.

Required confirmation text:
```text
Approve this refund review for {paymentId}?
```

Required body:
```text
Kra will ask the backend to calculate the refund decision. If approved, the payment moves to refund pending and finance must settle it separately.
```

Primary action:
- `Confirm approval`.

Secondary actions:
- `Back to review`.
- `Cancel`.

Rules:
- Confirmation is required because this is a financial decision.
- The idempotency key is created before final submit and reused on retry of the same payload.
- Do not submit when required evidence is missing.

## Submission
Endpoint:
```http
POST /v1/payments/refund
```

Required request behavior:
- Include `Authorization`.
- Include `Idempotency-Key`.
- Body includes `paymentId`.
- Include only selected optional boolean flags.
- Do not include notes.
- Do not include refund amount.
- Do not include refund reason.
- Do not include refund reference.

Success behavior:
- Show approved state.
- Invalidate finance summary.
- Invalidate payment-related caches.
- Route option to settlement screen.
- Announce `Refund approved and pending settlement`.

Success copy:
```text
Refund approved and pending settlement
```

Success body:
```text
The backend approved the refund as {refundReason} for GHS {refundAmountGhs}. Finance must settle it separately.
```

Primary success action:
- `Open settlement`.

Destination:
- `/admin/finance/refunds/:paymentId/settle`.

## Manual Review Required State
Trigger:
- Backend returns validation error indicating refund requires manual review before execution.

Title:
```text
Manual review required
```

Body:
```text
This refund path cannot be approved automatically. Continue the dispute workflow and record the decision through the supported issue process.
```

Actions:
- `Open issue queue`.
- `Open delivery`.
- `Back to finance summary`.

Rules:
- Do not keep retrying the same payload.
- Do not show settlement route.
- Do not claim backend rejected the customer permanently.

## Rejected State
Because the backend has no refund rejection endpoint, `rejected` is a UI decision state only.

Use `rejected` when:
- Finance determines evidence does not support approval.
- Finance chooses not to submit.
- The workflow routes to issue/dispute handling for recordkeeping.

Rejected state copy:
```text
Refund not approved from this screen
```

Body:
```text
No refund mutation was submitted. Record the customer-facing decision through the issue or support workflow.
```

Actions:
- `Open issue detail`.
- `Open issue queue`.
- `Back to finance summary`.

Rules:
- Do not call `refund_payment`.
- Do not claim backend saved a rejection.
- Do not notify the customer from this screen unless notification backend supports it later.

## Already Processed State
Trigger:
- Backend returns validation that refund is already in progress or completed.
- Context shows payment status `refund_pending` or `refunded`.

Title:
```text
Refund already in progress or completed
```

Actions:
- If `refund_pending`: `Open settlement`.
- If `refunded`: `Open refund evidence`.
- `Back to finance summary`.

Rules:
- Do not submit another refund request.
- Do not allow duplicate approval.

## Not Refundable State
Trigger:
- Payment status is not `confirmed`.
- Backend returns validation that only confirmed payments can be refunded.

Title:
```text
Payment is not eligible for refund approval
```

Body:
```text
Only confirmed payments can be moved to refund pending.
```

Actions:
- `Open payment reconciliation`.
- `Open delivery`.
- `Back to finance summary`.

## Error State
Full error title:
```text
Refund review could not load
```

Submit error title:
```text
Refund approval failed
```

Rules:
- Show backend request ID when available.
- Preserve answers after submit failure.
- Do not expose stack traces.
- Do not expose provider credentials.
- Do not show raw unknown error details.

## Authorization State
If forbidden:

Title:
```text
Refund approval access required
```

Body:
```text
Only admins with refund approval access can review this payment for refund.
```

Actions:
- `Back to finance summary`.
- `Sign in with another account`.

Rules:
- Do not render refund form.
- Do not render provider reference.
- Do not submit mutation.

## Session Expired State
If auth expires:

Title:
```text
Sign in again to approve refunds
```

Body:
```text
Refund approval is protected. Sign in again to continue.
```

Rules:
- Preserve route.
- Do not preserve sensitive provider reference after logout.
- Require full confirmation again after sign-in.

## Security And Privacy
Sensitive fields:
- Payment ID.
- Delivery ID.
- Provider reference.
- Refund reason.
- Refund amount.
- Issue evidence.
- Handoff evidence.

Rules:
- Do not log provider references.
- Do not include IDs in analytics.
- Do not store review answers in local storage.
- Do not show finance evidence after logout.
- Do not submit without user confirmation.
- Use idempotency key for submit.
- Clear idempotency key after successful approval.

## Analytics
Allowed events:
- `admin_refund_review_viewed`.
- `admin_refund_review_answers_changed`.
- `admin_refund_review_confirmed`.
- `admin_refund_review_approved`.
- `admin_refund_review_manual_review_required`.
- `admin_refund_review_not_approved`.
- `admin_refund_review_submit_failed`.
- `admin_refund_review_route_clicked`.

Payload rules:
- Include selected reason flag names only.
- Include result status.
- Include destination route family.
- Do not include payment ID.
- Do not include delivery ID.
- Do not include provider reference.
- Do not include exact amount unless approved as aggregated metric.

## Accessibility Requirements
Landmarks:
- Main content.
- Evidence region.
- Policy questions region.
- Review region.
- Confirmation region.
- Result region.

Keyboard:
- Back link reachable.
- Radio groups reachable.
- Review actions reachable.
- Confirmation actions reachable.
- Error summary links to fields.

Screen reader:
- Each question has a fieldset and legend.
- Optional state is explicit.
- Review step announces omitted fields as `Not provided`.
- Submit status uses live region.
- Success and error states move focus to heading.

Error prevention:
- Review step before submit.
- Confirmation step before submit.
- Ability to change answers.
- Clear final action label.
- No irreversible action hidden behind vague button text.

## Responsive Design
Desktop:
- Evidence and questions can sit in a two-column layout.
- Decision rail remains visible if not distracting.

Mobile:
- One-column step flow.
- Evidence summary before questions.
- Sticky submit is allowed only on review and confirm steps.

Do not:
- Hide warning text on mobile.
- Collapse policy questions behind accordions by default.
- Put settlement action before approval success.

## Testing Requirements
Unit tests:
- Parses route payment ID.
- Blocks submit when evidence missing.
- Blocks submit for non-confirmed payment context.
- Blocks submit when refund already pending or refunded.
- Omits unknown optional flags.
- Sends selected true and false flags correctly.
- Includes idempotency key.
- Shows review and confirmation before submit.
- Maps success response to approved state.
- Maps manual-review validation to manual-review state.
- Does not show settlement before approval.
- Does not show backend reject mutation.

Integration tests:
- Finance admin opens refund review from finance summary.
- Confirmed payment can submit approved refund.
- Approved response routes to settlement.
- Already processed response routes to settlement or evidence.
- Non-finance role is blocked.
- Submit failure preserves answers.
- Session expiry requires sign-in and confirmation again.

Accessibility tests:
- One H1.
- Questions have fieldset and legend.
- Error summary links to fields.
- Review step exposes all selected and omitted values.
- Confirmation step clearly names the payment.
- Success state is announced.
- Keyboard reaches every action.

Visual tests:
- Evidence missing.
- Ready policy questions.
- Review step.
- Confirm step.
- Approved success.
- Manual review required.
- Already processed.
- Mobile question flow.

## Acceptance Criteria
1. The screen renders at `/admin/finance/refunds/:paymentId/review`.
2. The screen submits only `POST /v1/payments/refund`.
3. The request includes `paymentId` and selected optional booleans only.
4. The request includes `Idempotency-Key`.
5. The screen never sends refund amount, refund reason, or refund reference.
6. The screen blocks submit when evidence is missing.
7. The screen blocks submit when known payment status is not `confirmed`.
8. The screen blocks duplicate refund approval when status is `refund_pending` or `refunded`.
9. The screen shows a review step before submit.
10. The screen shows a confirmation step before submit.
11. Successful approval shows backend refund amount, reason, and requested time.
12. Successful approval routes to settlement.
13. Manual-review-required errors route to issue/dispute workflow.
14. Rejected state does not call a backend rejection endpoint.
15. The screen never settles the refund.
16. The screen never collects refund reference.
17. The screen never executes payout or alternate refund path.
18. The screen protects provider reference and sensitive finance data.
19. Accessibility checks pass for questions, review, confirmation, status, errors, and keyboard flow.
20. Analytics exclude payment ID, delivery ID, provider reference, and raw evidence.

## Implementation Notes For Claude Code
Build `AdminRefundReview` as a high-control financial decision flow. Hydrate evidence from available finance, reconciliation, delivery, or issue context; block submission when evidence or eligibility is insufficient. Ask only the five backend-supported policy questions, preserve unknown answers by omitting fields, require review and confirmation, then submit `refund_payment` with an idempotency key. Treat success as `refund_pending` and route to settlement. Do not add settlement fields, refund references, payout execution, alternate refund path controls, backend rejection mutation, payment status editing, provider credential controls, or unsupported request fields.

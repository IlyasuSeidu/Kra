# Refund Decision Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `RefundDecisionModal` |
| Component target | shared finance refund approval and policy-routing modal |
| Primary test ID | `modal-refund-decision` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 finance control for refunds and disputes |
| Used by | `AdminRefundReview`, `AdminRefundEvidenceReview`, `AdminFinanceSummary`, `AdminPaymentReconciliationDetail`, `AdminIssueDetail`, `AdminBlockedDeliveryQueue`, `AdminSlaBreachDashboard` |
| Backend coverage | `refund_payment` |
| Trigger source | refund review action, finance row action, payment dispute issue action, evidence review approve action, reconciliation refund action |
| Required states | `closed`, `opening`, `context_loading`, `ready`, `eligibility_blocked`, `policy_lane_selecting`, `evidence_reviewing`, `evidence_missing`, `evidence_complete`, `decision_preview`, `manual_review_required`, `cannot_approve_here`, `already_pending`, `already_refunded`, `payment_not_confirmed`, `delivery_missing`, `payment_missing`, `role_blocked`, `review_payload`, `confirming`, `submitting`, `server_confirmed`, `server_rejected`, `rate_limited`, `network_error`, `session_expired`, `closing_to_sign_in`, `closing` |

## Product Job
`RefundDecisionModal` lets an authorized finance admin decide whether a confirmed payment can enter the backend-supported `refund_pending` state.

It answers:
- `Which payment and delivery are being reviewed?`
- `Is the payment confirmed and still refundable?`
- `Which refund policy lane applies?`
- `Which evidence facts are known, unknown, or blocking?`
- `Which request flags will be sent to the backend?`
- `What outcome is expected before submission?`
- `What did the backend approve after submission?`
- `What happens next in settlement?`
- `What path should finance use when the request cannot be approved here?`

The user should be able to:
- Verify the payment identity.
- Verify linked delivery identity.
- Review delivery stage and payment status.
- Select a backend-supported policy lane.
- Answer only the evidence facts required for that lane.
- Review the exact `refund_payment` payload.
- Confirm that approval does not settle funds.
- Submit once with idempotency.
- See backend-confirmed refund amount, reason, delivery ID, and timestamp.
- Route manual-review or denial cases to evidence and issue workflows.

This modal is not:
- A refund settlement modal.
- A provider console.
- A provider reference entry form.
- A cash refund flow.
- A payout tool.
- A payment verification screen.
- A delivery status override.
- A custody override.
- A compensation calculation flow.
- A bulk refund approval surface.
- A backend-powered refund rejection mutation, because no such endpoint exists in v1.

## Strategic Role
Refund decisions sit at the intersection of finance liability, customer trust, custody evidence, provider reconciliation, and issue resolution. The modal must make eligible refunds fast while preventing accidental financial action.

Core principle:
- Approve only when the backend can calculate a valid refund.
- Preserve unknown evidence as unknown.
- Never turn an unknown into `false` silently.
- Never let a user type the refund amount.
- Never treat a local policy denial as a backend-saved refund rejection.
- Use settlement tooling only after `refund_payment` returns `refund_pending`.
- Use issue tooling for unresolved disputes, policy denial notes, loss claims, damage claims, and manual review.

The operational failure this modal prevents:
- Finance approves a refund for an unconfirmed payment.
- Finance submits a second refund for a payment already in `refund_pending`.
- Finance sees a local estimate and mistakes it for a backend result.
- Finance enters an amount that differs from policy.
- Finance rejects a refund in the UI but no backend record is saved.
- Finance settles funds before approval.
- Finance exposes provider details or internal notes to customers.
- Finance treats post-dispatch disputes as automatic refunds.

## Audience
Primary users:
- `finance_admin` approving refund requests.
- `super_admin` acting under finance governance.

Secondary users:
- Support admin routing payment disputes to finance.
- Operations admin checking whether custody evidence blocks finance action.
- QA validating high-risk finance behavior.
- Security reviewer validating permission and redaction controls.
- Product owner validating refund policy.
- Claude Code implementing the frontend later.

Non-users:
- Public visitor.
- Sender.
- Receiver.
- Driver.
- Station operator.
- Final-mile courier.
- Support admin without refund approval capability.
- Operations admin without refund approval capability.
- Provider webhook processor.

## Context Of Use
The modal opens when a finance-capable actor is already viewing a payment, refund request, dispute, or evidence record.

Common entry contexts:
- `AdminRefundReview` primary approval action.
- `AdminRefundEvidenceReview` approval action after evidence comparison.
- `AdminFinanceSummary` refund queue row.
- `AdminPaymentReconciliationDetail` confirmed payment action.
- `AdminIssueDetail` payment dispute or refund request.
- `AdminBlockedDeliveryQueue` finance blocker row.
- `AdminSlaBreachDashboard` refund SLA row.

The user may be:
- Approving a pre-intake cancellation refund.
- Approving a duplicate-charge refund.
- Approving a platform-side payment error refund.
- Approving a package-never-received refund.
- Approving a post-intake refund minus handling fee.
- Approving an unused doorstep surcharge refund.
- Approving an unused express surcharge refund.
- Discovering that the case must continue through manual review.
- Discovering that the payment is already pending refund or settled.
- Discovering that the role lacks approval authority.

## Design Brief
Audience:
- Finance admin or super admin with refund approval authority.

Surface type:
- High-impact modal over a finance, issue, reconciliation, or evidence page.

Primary action:
- `Request refund approval` for backend-supported paths.

Visual thesis:
- `Finance control room`: a calm, high-precision decision sheet that behaves like a ledger, not a marketing page.

Restraint rule:
- Do not combine approval, settlement, issue resolution, custody override, payment verification, or provider reference entry.

Density:
- High. The modal must show enough evidence to prevent mistakes, but every row must explain why it matters.

Platform stance:
- Admin web first.
- Tablet usable for operational review.
- Mobile web compatible for emergency admin access, but not optimized as a field-worker path.

## External Research Used
Only directly relevant links were used:
- [Stripe refund documentation](https://docs.stripe.com/refunds): supports separating refund initiation, destination, failure, event, and trace-reference concerns.
- [Adyen refund documentation](https://docs.adyen.com/online-payments/refund/): supports captured-payment prerequisites, full and partial refund distinction, refund reason capture, asynchronous outcome handling, and failed refund reasons.
- [PayPal refund captured payment API](https://developer.paypal.com/docs/api/payments/v2/#captures_refund): supports captured-payment refund semantics, full versus partial refund request shape, idempotent response handling, and payment refund status concepts.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports explicit confirmation for high-impact decisions.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors for evidence, policy lane, and confirmation requirements.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, submitting, success, blocked, and failed states.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable action targets for high-risk admin controls.

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
- `docs/05-design/frontend-screen-specs/shared-operational-modals/12-resolve-issue-modal.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/refunds.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/refunds.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/refunds.test.ts`

## Backend Reality
Mutation:
- Operation key: `refund_payment`.
- Route: `POST /v1/payments/refund`.
- Required prehandler: admin mutation guard plus `approve_refund`.
- Request schema: `refundPaymentRequestSchema`.
- Response schema: `refundPaymentResponseSchema`.
- Idempotent through route key and request fingerprint.
- Rate limit: admin mutation policy for refund action.

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

Possible successful refund reasons:
- `full_refund_pre_intake`
- `duplicate_charge`
- `platform_payment_error`
- `never_received_at_origin`
- `post_intake_handling_fee`
- `doorstep_surcharge_refund`
- `express_surcharge_refund`

Backend decision rules:
- `duplicateCharge: true` returns full amount with `duplicate_charge`.
- `platformPaymentError: true` returns full amount with `platform_payment_error`.
- `packageNeverReceivedAtOrigin: true` returns full amount with `never_received_at_origin`.
- Delivery stage `before_origin_intake` returns full amount with `full_refund_pre_intake`.
- Delivery stage `after_origin_intake_before_dispatch` returns `amountPaidGhs - 5` with `post_intake_handling_fee`, floored at zero.
- `doorstepAttemptOccurred: false` with a positive doorstep surcharge returns that surcharge with `doorstep_surcharge_refund`.
- `expressHandlingPerformed: false` with a positive express surcharge returns that surcharge with `express_surcharge_refund`.
- Any non-eligible post-dispatch case returns a manual-review decision internally and the API rejects automatic approval.

Important backend facts:
- The mutation is admin-only.
- The mutation requires `approve_refund`.
- `finance_admin` and `super_admin` currently have `approve_refund`.
- Only `confirmed` payments can be refunded.
- `refund_pending` and `refunded` payments are rejected.
- Missing payment returns not found.
- Missing linked delivery returns not found.
- The backend calculates quote breakdown from delivery data.
- The backend decides amount and reason; the client never sends amount or reason.
- A successful approval marks payment status as `refund_pending`.
- A successful approval marks delivery payment status as `refund_pending`.
- A successful approval does not settle provider funds.
- Settlement is separate through `settle_refund_payment`.
- No v1 endpoint saves a refund rejection decision.

Therefore:
- The modal may submit only `refund_payment`.
- The modal must send only supported request fields.
- The modal must not call `settle_refund_payment`.
- The modal must not accept a refund amount input.
- The modal must not accept a refund reason input.
- The modal must not show a backend-backed `Reject refund` submit action.
- The modal must route cannot-approve cases to evidence or issue resolution.
- The modal must require explicit confirmation before submitting.
- The modal must include an idempotency key.
- The modal must treat backend success as the only authoritative approval result.

## Product Policy Reality
Full refund cases:
- Delivery cancelled before origin intake.
- Duplicate charge.
- Payment confirmed but no package was ever received at the origin station.
- Verified platform-side payment error.

Partial refund cases:
- Cancellation after origin intake but before dispatch returns amount paid minus `GHS 5` handling fee.
- Doorstep surcharge is refundable when no doorstep attempt occurred.
- Express surcharge is refundable when express handling was not actually performed due platform-side or staff-side failure.

Post-dispatch rule:
- No automatic full refund is available after dispatch.
- Post-dispatch refund requires a verified Kra-side service failure, duplicate charge, or formal dispute ruling.
- Damage claims require manual review.
- Loss claims require manual review when compensation beyond service-fee refund is being evaluated.

Execution rule:
- Approval should be initiated the same business day.
- Original-method refund completion target is within `3 business days`.
- Alternate-path refunds require separate finance evidence and are not standard v1.
- Cash refunds are not part of standard v1.

Modal interpretation:
- Policy approval through this modal means `refund_pending`.
- Provider execution is the next step.
- Customer-facing copy must say the refund is approved or pending, not completed.
- Manual-review cases must show the owner and next evidence step.
- Denial must be documented through issue or evidence workflow, not through a non-existent refund mutation.

## Permission Model
Open permission:
- `finance_admin` with finance context.
- `super_admin`.
- Read-only context may be visible to support or ops pages before the modal opens, but the approval modal itself must not render the submit action unless `approve_refund` is present.

Submit permission:
- `approve_refund`.

Blocked roles:
- `sender`.
- `receiver`.
- `driver`.
- `station_operator`.
- `final_mile_courier`.
- `support_admin` without `approve_refund`.
- `ops_admin` without `approve_refund`.

Permission behavior:
- If role is missing, show `role_blocked`.
- If session is expired, show `session_expired`.
- If role is present but capability is absent, show safe permission copy.
- Do not leak payment amount, provider references, or internal evidence to unauthorized users.

Role-blocked copy:
- Title: `Refund approval is restricted`
- Body: `Only finance admins with refund approval access can request this refund.`
- Primary action: `Close`
- Secondary action: `Open issue detail`, only when the caller already has issue access.

## Data Dependencies
Required context:
- `paymentId`.
- Current authenticated role and capabilities.
- Payment status.
- Payment amount in GHS.
- Linked `deliveryId`.
- Delivery current status.
- Delivery payment status.
- Delivery quote or quote inputs needed to understand surcharge context.
- Doorstep requested flag.
- Express service flag.
- Origin and destination stations.
- Timeline evidence summary.
- Issue context when opened from a dispute.

Preferred context:
- Tracking code.
- Provider reference redacted to last four or provider-safe short reference.
- Payment created time.
- Payment confirmed time.
- Refund requested time if existing.
- Existing refund amount if pending or settled.
- Existing refund reason if pending or settled.
- Last reconciliation state.
- Last finance note if caller has permission.
- Delivery stage derived by backend-equivalent mapping.
- Doorstep attempt evidence from final-mile events.
- Express handling evidence from assignment and route service metadata.
- Origin intake event.
- Dispatch event.
- Destination receipt event.
- Proof completion event.

Context hydration order:
- Use parent screen data when passed into the modal.
- Read current query cache for finance, reconciliation, delivery, issue, and evidence records.
- Fetch missing admin delivery detail when route data includes `deliveryId`.
- Fetch issue detail when opened from an issue route.
- If payment identity cannot be established, show `payment_missing`.
- If linked delivery cannot be established, show `delivery_missing`.
- If policy evidence cannot be established, show `evidence_missing`.

Do not:
- Guess the payment amount.
- Guess the delivery stage.
- Guess whether a doorstep attempt occurred.
- Guess whether express handling occurred.
- Guess provider outcome.
- Infer fraud or loss from a note alone.
- Render internal-only webhook payloads in the modal.

## Derived Refund Stage
The frontend may display an advisory stage to orient the user, but the backend remains authoritative.

Stage derivation for display:
- `created` maps to `before_origin_intake`.
- `cancelled` maps to `before_origin_intake` only when cancellation occurred before origin intake evidence.
- `received_at_origin` maps to `after_origin_intake_before_dispatch`.
- `awaiting_driver_assignment` maps to `after_origin_intake_before_dispatch`.
- `assigned_to_driver` maps to `after_origin_intake_before_dispatch`.
- All later transport, destination, final-mile, failed attempt, delivered, and issue-reported states map to `after_dispatch`.

Display labels:
- `before_origin_intake`: `Before origin intake`
- `after_origin_intake_before_dispatch`: `After origin intake, before dispatch`
- `after_dispatch`: `After dispatch`

Stage warning:
- When displayed stage is `after_dispatch`, show `Automatic full refund is not available from stage alone. Select only a verified payment or service-failure lane.`

Stage uncertainty:
- If intake or dispatch evidence is missing, show `Evidence incomplete`.
- Disable submit until the reviewer opens evidence or selects a policy lane backed by independent payment proof.

## Policy Lanes
The modal must render policy lanes as decision cards. Each lane explains eligibility, evidence requirement, payload effect, expected outcome, and when not to use it.

### Lane 1: Pre-Intake Full Refund
Use when:
- Payment is confirmed.
- Delivery has not reached origin intake.
- Cancellation or refund request occurred before package intake.

Evidence required:
- Payment confirmation.
- Delivery status before origin intake.
- No origin intake event.
- No driver dispatch event.

Payload:
```json
{
  "paymentId": "PAY-7001"
}
```

Expected backend reason:
- `full_refund_pre_intake`

Expected backend amount:
- Full paid amount.

Do not use when:
- Package has been received at origin.
- Dispatch has occurred.
- Delivery is post-dispatch.
- The request is about loss, damage, or receiver refusal.

### Lane 2: Duplicate Charge
Use when:
- The same customer was charged more than once for the same delivery or payment intent.
- Reconciliation or provider evidence confirms duplicate charge.

Evidence required:
- Two or more charge references or finance records.
- Same delivery or same payer context.
- One valid confirmed payment to refund.
- Reconciliation note or payment dispute issue.

Payload:
```json
{
  "paymentId": "PAY-7001",
  "duplicateCharge": true
}
```

Expected backend reason:
- `duplicate_charge`

Expected backend amount:
- Full paid amount.

Do not use when:
- The customer created two separate deliveries.
- Provider callback is unmatched and unresolved.
- Payment confirmation is missing.

### Lane 3: Platform Payment Error
Use when:
- Payment was confirmed incorrectly due to Kra platform or provider integration error.
- Finance evidence supports platform-side liability.

Evidence required:
- Payment confirmation.
- Reconciliation or webhook conflict evidence.
- Finance note explaining platform-side error.
- No customer-only claim without finance proof.

Payload:
```json
{
  "paymentId": "PAY-7001",
  "platformPaymentError": true
}
```

Expected backend reason:
- `platform_payment_error`

Expected backend amount:
- Full paid amount.

Do not use when:
- Payment provider is simply delayed.
- Payment is under review.
- User abandoned payment before confirmation.
- Provider outage has no confirmed overcharge.

### Lane 4: Package Never Received At Origin
Use when:
- Payment is confirmed.
- Delivery exists.
- The customer paid but the package never reached the origin station.
- Origin station evidence confirms no intake event.

Evidence required:
- No origin intake event.
- No package label binding.
- No custody owner after sender.
- Support or station note confirming non-receipt.

Payload:
```json
{
  "paymentId": "PAY-7001",
  "packageNeverReceivedAtOrigin": true
}
```

Expected backend reason:
- `never_received_at_origin`

Expected backend amount:
- Full paid amount.

Do not use when:
- Origin intake happened.
- Package was lost after origin intake.
- Package was damaged.
- Sender wants to cancel after station acceptance.

### Lane 5: Post-Intake Handling Fee Refund
Use when:
- Payment is confirmed.
- Package was received at origin.
- Dispatch has not occurred.
- Policy allows refund minus handling fee.

Evidence required:
- Origin intake event.
- No dispatch event.
- Delivery status between intake and dispatch.
- Handling fee policy visible.

Payload:
```json
{
  "paymentId": "PAY-7001"
}
```

Expected backend reason:
- `post_intake_handling_fee`

Expected backend amount:
- Paid amount minus `GHS 5`, never below zero.

Do not use when:
- Dispatch has occurred.
- Package has reached destination station.
- Final-mile work has started.
- Claim involves loss or damage.

### Lane 6: Unused Doorstep Surcharge
Use when:
- Doorstep was charged.
- No doorstep attempt occurred.
- The base delivery may still be valid, but the doorstep component was not performed.

Evidence required:
- Doorstep requested.
- Doorstep surcharge greater than zero.
- No out-for-delivery event or no doorstep attempt event.
- Station or courier evidence confirming no attempt.

Payload:
```json
{
  "paymentId": "PAY-7001",
  "doorstepAttemptOccurred": false
}
```

Expected backend reason:
- `doorstep_surcharge_refund`

Expected backend amount:
- Doorstep surcharge only.

Do not use when:
- A valid doorstep attempt occurred.
- Receiver refused delivery after courier arrival.
- The issue is base delivery failure rather than doorstep surcharge.

### Lane 7: Unused Express Surcharge
Use when:
- Express service was charged.
- Express handling was not performed due Kra-side or platform-side failure.
- The base delivery may still be valid.

Evidence required:
- Express service selected.
- Express surcharge greater than zero.
- Dispatch or routing evidence shows no express handling.
- Staff or platform evidence confirms Kra-side failure.

Payload:
```json
{
  "paymentId": "PAY-7001",
  "expressHandlingPerformed": false
}
```

Expected backend reason:
- `express_surcharge_refund`

Expected backend amount:
- Express surcharge only.

Do not use when:
- Express handling was performed.
- Delivery delay was caused by sender or receiver error.
- Route disruption needs issue investigation first.

### Lane 8: Manual Review Route
Use when:
- Evidence is incomplete.
- Post-dispatch full refund is requested without automatic eligibility.
- Loss claim is involved.
- Damage claim is involved.
- Receiver refusal is involved.
- Compensation beyond service fee is involved.
- Provider settlement conflict is unresolved.
- A policy denial needs a recorded issue note.

Payload:
```json
{}
```

Backend call:
- None.

Expected UI state:
- `manual_review_required` or `cannot_approve_here`.

Next step:
- Open `AdminRefundEvidenceReview`.
- Open `AdminIssueDetail`.
- Open `ResolveIssueModal` for policy outcome when an issue exists.
- Open reconciliation detail for payment conflicts.

Do not:
- Call `refund_payment`.
- Send false evidence flags to force a refund.
- Show a refund rejection as saved.

## Evidence Facts
Evidence facts are shown as tri-state controls:
- `Yes`
- `No`
- `Unknown`

Implementation rule:
- `Unknown` means do not include the field in the request.
- `Yes` sends `true` only when the selected lane requires that field.
- `No` sends `false` only when the selected lane requires that field.
- Disabled fields must not be sent.
- Irrelevant fields must not be sent.

Evidence fields:
- `duplicateCharge`
- `platformPaymentError`
- `packageNeverReceivedAtOrigin`
- `doorstepAttemptOccurred`
- `expressHandlingPerformed`

Field labels:
- `Duplicate charge confirmed`
- `Platform payment error confirmed`
- `Package never received at origin`
- `Doorstep attempt occurred`
- `Express handling performed`

Field helper copy:
- `Duplicate charge confirmed`: `Use only when finance or provider records show more than one charge for the same delivery.`
- `Platform payment error confirmed`: `Use only when Kra or provider processing created a confirmed payment error.`
- `Package never received at origin`: `Use only when origin intake and label binding did not happen.`
- `Doorstep attempt occurred`: `Choose No only when the doorstep surcharge was charged but no attempt happened.`
- `Express handling performed`: `Choose No only when express surcharge was charged but express handling was not provided.`

Blocking rules:
- Duplicate charge lane requires `duplicateCharge: Yes`.
- Platform error lane requires `platformPaymentError: Yes`.
- Package never received lane requires `packageNeverReceivedAtOrigin: Yes`.
- Doorstep surcharge lane requires `doorstepAttemptOccurred: No`.
- Express surcharge lane requires `expressHandlingPerformed: No`.
- Pre-intake lane requires no optional flags.
- Post-intake lane requires no optional flags.
- Manual review lane sends no mutation.

Evidence warning copy:
- `Unknown evidence cannot be treated as No. Open evidence review before approving.`

## Modal Structure
Desktop layout:
- Max width: `920px`.
- Max height: `min(86vh, 920px)`.
- Header remains sticky.
- Footer remains sticky.
- Body scrolls.
- Left column: identity, eligibility, policy lane.
- Right column: evidence facts, decision preview, consequences.

Tablet layout:
- Width: `min(94vw, 820px)`.
- Columns collapse after policy lane list.
- Footer actions remain visible.

Mobile web fallback:
- Full-screen sheet.
- Single column.
- Sticky bottom action bar.
- Evidence and review sections expand one at a time.

Layer order:
- Modal overlay.
- Modal container.
- Header.
- Risk ribbon.
- Identity ledger.
- Eligibility ledger.
- Policy lane selector.
- Evidence checklist.
- Decision preview.
- Review payload.
- Confirmation block.
- Footer actions.
- Toast/status region.

## Header
Header content:
- Eyebrow: `Finance decision`
- Title: `Review refund approval`
- Subtitle: `Approve only when policy and evidence match the backend-supported refund path.`
- Close button with accessible label `Close refund decision modal`.

Header badges:
- `High impact`
- `Finance only`
- Current payment status badge.

Header must show:
- `paymentId`
- `deliveryId` when known
- `trackingCode` when safe for admin view

Header must not show:
- Full provider payload.
- Raw webhook content.
- Customer phone number unless parent screen already has permission and masking rules are applied.
- Internal audit metadata beyond current action context.

Close behavior:
- If no edits were made, close immediately.
- If policy lane or evidence selections changed, show unsaved-decision confirmation through shared destructive confirmation behavior.
- Escape key closes only when not submitting and no confirmation sub-dialog is active.
- During submit, close is disabled and explained by status text.

## Risk Ribbon
Purpose:
- Make the financial consequence unmistakable.

Default copy:
- `Approval moves this payment to refund_pending. It does not settle money or create a provider reference.`

Warning copy when post-dispatch:
- `Post-dispatch refunds require stronger evidence. Automatic full refund is blocked unless a payment-specific lane applies.`

Warning copy when opened from issue:
- `This refund action does not resolve the issue. Resolve the issue after finance action if policy requires it.`

Warning copy when opened from reconciliation:
- `Do not approve until the payment conflict is reconciled or a duplicate charge is verified.`

Visual treatment:
- Amber left border.
- No pulsing animation.
- Contains concise text and one link to evidence when available.

Accessibility:
- Render as static text in normal mode.
- When risk copy changes due a state transition, announce through `aria-live="polite"`.

## Identity Ledger
Fields:
- `Payment ID`
- `Delivery ID`
- `Tracking code`
- `Payment status`
- `Delivery payment status`
- `Amount paid`
- `Currency`
- `Payment confirmed at`
- `Current delivery status`
- `Derived refund stage`
- `Origin station`
- `Destination station`
- `Service type`
- `Doorstep requested`
- `Express service`
- `Issue ID`, when opened from issue.
- `Reconciliation state`, when opened from reconciliation.

Design:
- Ledger grid with two columns on desktop.
- Compact stack on mobile.
- Read-only.
- Values must be selectable text for finance review.
- IDs use monospace.
- Amount uses numeric emphasis.

Required indicators:
- Missing required context rows show `Required`.
- Unknown optional rows show `Not loaded`.
- Blocked rows show a warning badge.

Do not:
- Add edit affordances.
- Let users change station, amount, status, or service type.
- Hide payment status behind hover.

## Eligibility Ledger
Eligibility checks:
- Payment exists.
- Linked delivery exists.
- User has `approve_refund`.
- Payment status is `confirmed`.
- Payment is not `refund_pending`.
- Payment is not `refunded`.
- Delivery payment status does not conflict with payment status.
- Minimum evidence for selected lane is present.
- No unresolved reconciliation conflict blocks the selected lane.

Rows:
- `Payment found`
- `Delivery linked`
- `Role permitted`
- `Payment confirmed`
- `No active refund`
- `Policy evidence complete`
- `Payload valid`

Row states:
- `Pass`
- `Warn`
- `Block`
- `Unknown`

Eligibility outcome:
- If all required rows pass, show `ready`.
- If role fails, show `role_blocked`.
- If payment missing, show `payment_missing`.
- If delivery missing, show `delivery_missing`.
- If payment not confirmed, show `payment_not_confirmed`.
- If payment is pending refund, show `already_pending`.
- If payment is refunded, show `already_refunded`.
- If evidence is unknown for selected lane, show `evidence_missing`.

Copy for eligibility passed:
- `This payment can be submitted for backend refund approval after final review.`

Copy for blocked:
- `This refund cannot be approved from this modal. Review the blocking row and route the case to the correct workflow.`

## Policy Lane Selector
Selector requirements:
- Single-select.
- Keyboard accessible.
- Each lane card has label, summary, expected result, required evidence count, and risk marker.
- Selected lane expands evidence requirements.
- Disabled lanes explain why they are disabled.

Lane card anatomy:
- Title.
- Policy category badge.
- Eligibility summary.
- Expected amount rule.
- Evidence requirement count.
- `Use this when` text.
- `Do not use this when` text.

Lane ordering:
- Pre-intake full refund.
- Duplicate charge.
- Platform payment error.
- Package never received at origin.
- Post-intake handling fee refund.
- Unused doorstep surcharge.
- Unused express surcharge.
- Manual review route.

Disabled lane reasons:
- `Payment is not confirmed.`
- `Payment already has an active refund.`
- `Delivery stage does not match this lane.`
- `Required surcharge is not present.`
- `Evidence is unknown.`
- `This lane requires issue review first.`

Lane selection analytics:
- Track `refund_decision_lane_selected`.
- Include lane ID, source screen, payment status, delivery stage, and whether evidence is complete.
- Do not include raw note text or provider payload.

## Evidence Checklist
Purpose:
- Capture only the evidence flags the backend understands.

Checklist sections:
- Payment evidence.
- Delivery stage evidence.
- Service component evidence.
- Issue or reconciliation evidence.

Payment evidence:
- Confirmed amount.
- Provider reference presence, redacted.
- Duplicate-charge comparison.
- Platform-payment-error basis.

Delivery stage evidence:
- Origin intake event.
- Dispatch event.
- Destination receipt event.
- Final-mile event.

Service component evidence:
- Doorstep requested.
- Doorstep attempt occurred.
- Express service selected.
- Express handling performed.

Issue evidence:
- Issue category.
- Issue status.
- Last finance-safe issue note.
- Evidence review status.

Evidence controls:
- Tri-state segmented control for supported request flags.
- Read-only check rows for context evidence.
- Link buttons to evidence detail.

Validation:
- Required tri-state selection cannot remain `Unknown` for the selected lane.
- Contradictory selections block submission.
- If parent context marks evidence stale, require refresh.
- If selected lane needs a surcharge and the surcharge is zero or missing, block lane.

Contradiction rules:
- `doorstepAttemptOccurred: No` is invalid if no doorstep surcharge exists.
- `expressHandlingPerformed: No` is invalid if no express surcharge exists.
- `packageNeverReceivedAtOrigin: Yes` is invalid if origin intake event exists.
- Pre-intake full refund is invalid if origin intake event exists.
- Post-intake handling fee refund is invalid if dispatch event exists.
- Duplicate charge is invalid without payment or reconciliation evidence.
- Platform payment error is invalid without finance or reconciliation evidence.

Copy for contradictions:
- `This evidence conflicts with the selected policy lane. Open evidence review before approving.`

## Decision Preview
Purpose:
- Help the admin understand likely consequences before confirmation without presenting client output as final truth.

Preview labels:
- `Expected policy path`
- `Expected amount rule`
- `Payload fields`
- `Backend authority`
- `Next step after approval`

Preview must include:
- A clear warning that backend response is authoritative.
- The selected lane.
- The exact request payload before submit.
- Whether settlement is required after approval.
- Whether issue resolution remains required.

Preview must not include:
- Editable amount.
- Editable reason.
- Provider reference entry.
- Promise of completion.
- Customer notification toggle.

Pre-submit amount display:
- For full refund lanes, show `Expected: full paid amount`.
- For post-intake handling fee, show `Expected: amount paid minus GHS 5`.
- For doorstep surcharge, show `Expected: doorstep surcharge only`.
- For express surcharge, show `Expected: express surcharge only`.
- For manual review, show `No refund approval call will be made`.

Authoritative result copy:
- `The backend calculates the final refund amount and reason after submission.`

## Payload Builder
Payload builder must be deterministic.

Base payload:
```json
{
  "paymentId": "PAY-7001"
}
```

Lane payload mapping:
| Lane | Extra fields |
| --- | --- |
| `pre_intake_full_refund` | none |
| `duplicate_charge` | `duplicateCharge: true` |
| `platform_payment_error` | `platformPaymentError: true` |
| `package_never_received_at_origin` | `packageNeverReceivedAtOrigin: true` |
| `post_intake_handling_fee` | none |
| `unused_doorstep_surcharge` | `doorstepAttemptOccurred: false` |
| `unused_express_surcharge` | `expressHandlingPerformed: false` |
| `manual_review_route` | no mutation |

Omitted fields:
- All unknown values.
- All irrelevant false values.
- All UI-only lane IDs.
- All notes.
- All amount values.
- All reason values.
- All provider references.
- All customer identifiers.

Payload display:
- Render formatted JSON in read-only code block.
- Mask any parent-provided provider reference.
- Provide `Copy payload` only to finance and super admin roles.
- Copy action must include only request body, not auth headers.

Payload validation:
- `paymentId` must be present.
- At least one backend-valid lane must be selected unless manual-review route is selected.
- Lane-specific required evidence must be known.
- Manual-review route disables submit and enables routing actions.

## Confirmation Step
Confirmation is required before submit.

Confirmation content:
- Selected policy lane.
- Payment ID.
- Delivery ID.
- Payment amount.
- Expected amount rule.
- Exact payload.
- Consequences.
- Non-effects.

Consequences:
- Payment moves to `refund_pending` if approved.
- Delivery payment status moves to `refund_pending` if approved.
- Refund settlement remains required.
- Finance action is audit-sensitive.

Non-effects:
- Does not settle funds.
- Does not create refund reference.
- Does not resolve issue.
- Does not change delivery status.
- Does not change custody owner.
- Does not notify customer unless notification tooling later sends one from backend events.

Confirmation control:
- Checkbox label: `I verified the evidence and understand this only requests refund approval.`
- Primary action remains disabled until checked.
- Checkbox resets if selected lane or payload changes.

Primary action copy:
- `Request refund approval`

Secondary action copy:
- `Back to evidence`

Danger copy:
- Avoid using danger color for eligible refund approval; this is high-impact but not destructive.
- Use amber for caution and blue for primary submit.

## Server Submission
Submit only when:
- User has `approve_refund`.
- Payment is confirmed.
- Payment is not already refund pending.
- Payment is not already refunded.
- Linked delivery is available.
- Selected lane is backend supported.
- Required evidence facts are complete.
- Confirmation checkbox is checked.

Request:
- Method: `POST`.
- Path: `/v1/payments/refund`.
- Operation: `refund_payment`.
- Header: `Idempotency-Key`.
- Body: deterministic payload from selected lane.

Idempotency key:
- Generate once when entering `confirming`.
- Scope to `refund_payment`, `paymentId`, selected lane, evidence facts, and current user session.
- Reuse same key on retry after network failure.
- Regenerate only if payload changes.

Submission UI:
- Disable all inputs.
- Show spinner beside primary action.
- Announce `Requesting refund approval`.
- Keep payload visible.
- Do not close automatically.

Success UI:
- State: `server_confirmed`.
- Title: `Refund approval requested`
- Show backend `refundAmountGhs`.
- Show backend `refundReason`.
- Show backend `requestedAt`.
- Show `refund_pending`.
- Primary action: `Open settlement`
- Secondary action: `Close`
- Tertiary action: `Open evidence`

Success copy:
- `The backend approved this refund request and moved the payment to refund_pending. Settlement still needs to be completed.`

## Manual Review And Cannot Approve
Manual review state appears when:
- Selected lane is manual review route.
- Backend returns validation with manual-review message.
- Evidence is incomplete.
- Policy requires loss or damage review.
- Post-dispatch full refund is requested without duplicate charge, platform error, or supported surcharge lane.
- Provider settlement conflict remains unresolved.

Manual review UI:
- Title: `Manual review required`
- Body: `This case cannot be approved through the refund approval endpoint yet. Continue evidence review or record the issue outcome.`
- Primary action: `Open evidence review`
- Secondary action: `Open issue`
- Tertiary action: `Close`

Cannot approve UI:
- Title: `Cannot approve here`
- Body: `The current API does not save refund rejection decisions. Use issue resolution or evidence review to record the policy outcome.`
- Primary action: `Open issue detail`
- Secondary action: `Open evidence review`

No mutation:
- Manual review and cannot-approve actions must never call `refund_payment`.

Issue handoff:
- When an issue exists, route to `AdminIssueDetail` with context intent `refund_policy_outcome`.
- If the user chooses to record policy denial, open `ResolveIssueModal` from the issue screen with `resolutionCode: policy_denied`, which the backend issue schema supports.
- If no issue exists, route to issue creation or support workflow, not a local-only denial state.

## Existing Refund States
`already_pending`:
- Triggered when payment status is `refund_pending` or backend says refund already in progress.
- Title: `Refund already pending`
- Body: `This payment already has an approved refund waiting for settlement.`
- Primary action: `Open settlement`
- Secondary action: `Open evidence`
- No approval submit.

`already_refunded`:
- Triggered when payment status is `refunded` or backend says refund completed.
- Title: `Refund already completed`
- Body: `This payment has already been settled as refunded.`
- Primary action: `Open refund evidence`
- Secondary action: `Close`
- No approval submit.

`payment_not_confirmed`:
- Triggered when payment status is not `confirmed`.
- Title: `Payment is not confirmed`
- Body: `Only confirmed payments can be approved for refund. Review payment status before taking finance action.`
- Primary action: `Open payment reconciliation`
- Secondary action: `Close`
- No approval submit.

`payment_missing`:
- Triggered when payment cannot be loaded.
- Title: `Payment not found`
- Body: `This payment is unavailable or outside your access scope.`
- Primary action: `Retry`
- Secondary action: `Close`

`delivery_missing`:
- Triggered when linked delivery cannot be loaded.
- Title: `Linked delivery not found`
- Body: `Refund approval needs delivery evidence before finance can continue.`
- Primary action: `Retry`
- Secondary action: `Open issue detail`, when available.

## Error Handling
Map backend and client failures to safe UI states.

Error mapping:
| Condition | UI state | Safe copy | Recovery |
| --- | --- | --- | --- |
| `FORBIDDEN` with missing or invalid auth details | `session_expired` | `Sign in again to continue.` | Route to admin sign in |
| `FORBIDDEN` with missing `approve_refund` capability | `role_blocked` | `You do not have permission for refund approval.` | Close or open read-only context |
| `VALIDATION_ERROR` with non-confirmed payment | `payment_not_confirmed` | `Only confirmed payments can be refunded.` | Open reconciliation |
| `VALIDATION_ERROR` with existing refund | `already_pending` or `already_refunded` | `This refund is already in progress or completed.` | Open settlement or evidence |
| `VALIDATION_ERROR` with manual-review message | `manual_review_required` | `This refund requires evidence review before approval.` | Open evidence review |
| `NOT_FOUND` payment | `payment_missing` | `Payment was not found.` | Retry or close |
| `NOT_FOUND` linked delivery | `delivery_missing` | `Linked delivery was not found.` | Retry or open issue |
| `RATE_LIMITED` or HTTP 429 | `rate_limited` | `Too many refund attempts. Wait before trying again.` | Retry after wait |
| Network failure | `network_error` | `Refund approval could not be submitted. Check connection and retry.` | Retry with same idempotency key |
| Unknown server error | `server_rejected` | `Refund approval failed on our side. Try again or escalate to finance lead.` | Retry or route to issue |

Field errors:
- Attach to policy lane selector when lane is missing.
- Attach to evidence field when required evidence is unknown.
- Attach to eligibility ledger when context blocks.
- Attach to confirmation checkbox when unchecked.

Global errors:
- Use summary banner at top of modal.
- Preserve user selections after failure.
- Do not clear payload on failure.
- Announce error through `aria-live="assertive"` only when blocking.

Rate-limit behavior:
- Disable primary action until retry time when available.
- Keep modal open.
- Show countdown if server provides retry metadata.
- Do not generate a new idempotency key for the same payload.

## State Machine
State list:
- `closed`
- `opening`
- `context_loading`
- `ready`
- `eligibility_blocked`
- `policy_lane_selecting`
- `evidence_reviewing`
- `evidence_missing`
- `evidence_complete`
- `decision_preview`
- `manual_review_required`
- `cannot_approve_here`
- `already_pending`
- `already_refunded`
- `payment_not_confirmed`
- `delivery_missing`
- `payment_missing`
- `role_blocked`
- `review_payload`
- `confirming`
- `submitting`
- `server_confirmed`
- `server_rejected`
- `rate_limited`
- `network_error`
- `session_expired`
- `closing_to_sign_in`
- `closing`

Transitions:
- `closed` to `opening` when trigger action fires.
- `opening` to `context_loading` when payment context is requested.
- `context_loading` to `role_blocked` when capability is missing.
- `context_loading` to `payment_missing` when payment cannot be loaded.
- `context_loading` to `delivery_missing` when linked delivery cannot be loaded.
- `context_loading` to `already_pending` when payment is `refund_pending`.
- `context_loading` to `already_refunded` when payment is `refunded`.
- `context_loading` to `payment_not_confirmed` when payment is not `confirmed`.
- `context_loading` to `ready` when base context passes.
- `ready` to `policy_lane_selecting` when user opens lane list.
- `policy_lane_selecting` to `evidence_reviewing` when lane selected.
- `evidence_reviewing` to `evidence_missing` when required evidence is unknown.
- `evidence_reviewing` to `evidence_complete` when required evidence is complete.
- `evidence_complete` to `decision_preview` when payload is valid.
- `decision_preview` to `review_payload` when user continues.
- `review_payload` to `confirming` when user accepts payload review.
- `confirming` to `submitting` when user submits.
- `submitting` to `server_confirmed` on successful response.
- `submitting` to `manual_review_required` on manual-review validation.
- `submitting` to `already_pending` on active refund validation.
- `submitting` to `already_refunded` on completed refund validation.
- `submitting` to `payment_not_confirmed` on payment status validation.
- `submitting` to `server_rejected` on unsupported server rejection.
- `submitting` to `rate_limited` on rate limit.
- `submitting` to `network_error` on network failure.
- Any non-submitting state to `session_expired` when auth expires.
- `session_expired` to `closing_to_sign_in` when user chooses sign in.
- Any non-submitting state to `closing` when user closes.
- `closing` to `closed` after exit animation and focus return.

Blocked transitions:
- `submitting` cannot go to `closing`.
- `manual_review_required` cannot go to `submitting` without lane and evidence change.
- `cannot_approve_here` cannot go to `submitting`.
- `already_pending` cannot go to `submitting`.
- `already_refunded` cannot go to `submitting`.
- `payment_not_confirmed` cannot go to `submitting`.
- `role_blocked` cannot go to `submitting`.

## Visual System
Use the existing design system tokens.

Core colors:
- Trusted system state: `brand.blue.600`.
- Success: `success.green.600`.
- Attention: `warning.amber.600`.
- Blocked or failed: `danger.red.600`.
- Primary text: `neutral.900`.
- Secondary text: `neutral.700`.
- Muted text: `neutral.500`.
- Background: `surface`.
- Dividers: `neutral.100`.

Typography:
- Modal title: `Manrope`, semibold, 24px desktop, 20px mobile.
- Section headings: `Manrope`, semibold, 16px.
- Body: `Inter`, regular, 14px.
- Ledger values: `Inter`, medium, 14px.
- Amounts: `Inter`, semibold, tabular numerals.
- IDs: monospace fallback only for ID values.

Spacing:
- Modal padding: `24px` desktop, `16px` mobile.
- Section gap: `24px`.
- Row gap: `12px`.
- Field gap: `8px`.
- Footer gap: `12px`.

Radius:
- Modal: `16px`.
- Cards: `12px`.
- Controls: `8px`.

Elevation:
- Modal uses elevation `2`.
- Confirmation alert inside modal uses elevation `0`.
- Avoid nested heavy shadows.

Motion:
- Modal entry: opacity plus small scale from `0.98` to `1`.
- Duration: `160ms`.
- Easing: standard ease-out.
- Section reveal: opacity only when user expands.
- Respect `prefers-reduced-motion`.
- No looping animations.

## Interaction Details
Opening:
- Trigger button passes `paymentId`, optional `deliveryId`, source screen, and available context.
- Modal opens with focus on title if content is dense.
- If there is an immediate blocker, focus moves to blocker title.

Lane selection:
- Arrow keys move between lane cards.
- Enter or Space selects lane.
- Selecting a lane resets confirmation.
- Selecting a different lane clears irrelevant evidence fields from payload.

Evidence entry:
- Tri-state controls support arrow keys.
- Labels are always visible.
- Required evidence controls show required marker only after lane selection.
- Unknown state is visually neutral but blocks where required.

Payload review:
- Code block is read-only.
- Continue button scrolls confirmation into view.
- If payload changes while in review, return to decision preview.

Submit:
- One submit action.
- Double click does not duplicate request.
- Network retry uses same idempotency key.
- Success invalidates finance, refund, delivery, issue, and audit caches.

Closing:
- Return focus to trigger element.
- If trigger element no longer exists, return focus to parent screen heading.
- If session expired, route through sign-in and preserve return intent.

## Copy System
Voice:
- Clear.
- Calm.
- Operational.
- Trust-building.

Words to use:
- `refund approval`
- `refund pending`
- `settlement`
- `policy lane`
- `evidence`
- `payment`
- `delivery`
- `issue`

Words to avoid in customer-facing text:
- `guaranteed`
- `automatic compensation`
- `insurance`
- provider-internal failure detail.

Primary CTA by state:
- Ready: `Review payload`
- Review payload: `Continue to confirmation`
- Confirming: `Request refund approval`
- Success: `Open settlement`
- Manual review: `Open evidence review`
- Cannot approve: `Open issue detail`
- Already pending: `Open settlement`
- Already refunded: `Open refund evidence`
- Role blocked: `Close`
- Network error: `Retry approval`

Microcopy:
- `Backend authority`: `The backend calculates the final amount and reason.`
- `Settlement reminder`: `Approval is not payout. Settlement is a separate finance step.`
- `Unknown evidence`: `Unknown evidence blocks this lane until reviewed.`
- `No rejection endpoint`: `Policy denial must be recorded through issue workflow.`
- `Post-dispatch caution`: `Post-dispatch full refund is not automatic.`

Success text:
- Title: `Refund approval requested`
- Body: `The payment is now refund_pending. Complete settlement from the refund settlement screen.`

Failure text:
- Title: `Refund approval failed`
- Body: `The payment was not changed. Review the error and retry or route the case for evidence review.`

## Accessibility Requirements
Modal behavior:
- Use `role="dialog"` for the main modal.
- Use `aria-modal="true"`.
- Header title must be referenced by `aria-labelledby`.
- Risk or status text must be referenced by `aria-describedby` when concise.
- Background content must be inert.
- Focus must be trapped inside the modal.
- Escape closes only when safe.
- Focus returns to trigger after close.

High-impact confirmation:
- Use an alert-style confirmation block inside the modal or a nested shared alert dialog only if the component system supports safe focus management.
- Do not create two competing modal focus traps.

Keyboard:
- All lane cards are keyboard reachable.
- All tri-state controls are keyboard reachable.
- Footer actions are reachable in source order.
- Copy payload button is keyboard reachable.
- Disabled controls expose reason text.

Screen reader:
- State changes use status messages.
- Submitting status uses polite announcement.
- Blocking errors use assertive announcement.
- Each evidence field names the field, current value, and requirement.
- Amounts include currency in accessible name.

Visual accessibility:
- Status color is never the only signal.
- Use text labels and icons or shape.
- Minimum target size follows WCAG target-size guidance.
- Text contrast meets AA.
- Focus ring is visible on all interactive elements.
- Large text up to 200 percent does not hide footer actions.

Reduced motion:
- Disable scale motion.
- Keep opacity transition optional.
- No timed auto-dismiss of errors.

## Privacy And Security
Data minimization:
- Show only payment fields required for finance decision.
- Redact provider references unless finance view has explicit permission.
- Do not show raw provider payloads.
- Do not show raw webhook signatures.
- Do not show full sender or receiver contact details in this modal.
- Do not include customer phone or note text in analytics.

Sensitive action controls:
- Require capability check before rendering submit.
- Require explicit confirmation.
- Include idempotency key.
- Preserve audit context through backend mutation.
- Do not allow approval from stale context without refresh.

Client trust boundary:
- Client can display evidence and payload.
- Client cannot decide final amount.
- Client cannot decide final reason.
- Client cannot write refund status directly.
- Client cannot mark settlement.

Redaction:
- Provider references show last four characters only when displayed.
- IDs are internal admin IDs and may be shown to finance.
- Notes are shown only when parent permission already allows them.

Analytics redaction:
- Include `paymentStatus`, `deliveryStage`, `laneId`, `sourceScreen`, `outcome`, `errorCode`.
- Exclude raw payment references, provider payloads, issue note text, customer contact fields, and freeform finance notes.

## Cache And Navigation Effects
On successful approval:
- Invalidate payment-related cache.
- Invalidate delivery detail cache.
- Invalidate finance summary cache.
- Invalidate refund review cache.
- Invalidate refund evidence cache.
- Invalidate issue detail cache when issue context exists.
- Invalidate audit events cache.
- Refresh parent screen row state.

Navigation actions:
- `Open settlement` navigates to `/admin/finance/refunds/:paymentId/settle`.
- `Open evidence` navigates to `/admin/finance/refunds/:paymentId/evidence`.
- `Open issue detail` navigates to `/admin/issues/:issueId` when available.
- `Open reconciliation` navigates to `/admin/finance/reconciliation/:paymentId`.
- `Close` returns to parent screen without navigation.

State preservation:
- When routing to evidence or issue, include selected lane and evidence context in safe route state.
- Do not include payload secrets.
- Do not include provider raw data.
- Do not include notes not already present in destination screen.

## Analytics Events
Events:
- `refund_decision_modal_opened`
- `refund_decision_context_loaded`
- `refund_decision_context_blocked`
- `refund_decision_lane_selected`
- `refund_decision_evidence_changed`
- `refund_decision_payload_reviewed`
- `refund_decision_confirmation_checked`
- `refund_decision_submit_started`
- `refund_decision_submit_succeeded`
- `refund_decision_submit_failed`
- `refund_decision_manual_review_routed`
- `refund_decision_settlement_opened`
- `refund_decision_modal_closed`

Shared event properties:
- `sourceScreen`
- `paymentStatus`
- `deliveryPaymentStatus`
- `deliveryStage`
- `laneId`
- `hasIssueContext`
- `hasReconciliationContext`
- `evidenceComplete`
- `outcome`
- `errorCode`
- `durationMs`

Do not capture:
- Raw request payload where it contains provider references.
- Customer phone.
- Customer name.
- Issue note text.
- Provider payload.
- Auth token.
- Idempotency key.

Outcome values:
- `approved_pending`
- `manual_review_required`
- `cannot_approve_here`
- `already_pending`
- `already_refunded`
- `payment_not_confirmed`
- `role_blocked`
- `network_error`
- `server_rejected`
- `closed_without_submit`

## Component API
Suggested component signature:
```ts
type RefundDecisionModalProps = {
  isOpen: boolean;
  paymentId: string;
  sourceScreen:
    | "AdminRefundReview"
    | "AdminRefundEvidenceReview"
    | "AdminFinanceSummary"
    | "AdminPaymentReconciliationDetail"
    | "AdminIssueDetail"
    | "AdminBlockedDeliveryQueue"
    | "AdminSlaBreachDashboard";
  deliveryId?: string;
  issueId?: string;
  reconciliationId?: string;
  initialContext?: RefundDecisionContext;
  onClose: () => void;
  onApproved?: (result: RefundDecisionResult) => void;
  onRouteToEvidence?: (input: RefundDecisionRouteContext) => void;
  onRouteToIssue?: (input: RefundDecisionRouteContext) => void;
  onRouteToSettlement?: (paymentId: string) => void;
};
```

Suggested internal types:
```ts
type RefundPolicyLane =
  | "pre_intake_full_refund"
  | "duplicate_charge"
  | "platform_payment_error"
  | "package_never_received_at_origin"
  | "post_intake_handling_fee"
  | "unused_doorstep_surcharge"
  | "unused_express_surcharge"
  | "manual_review_route";

type EvidenceAnswer = "yes" | "no" | "unknown";

type RefundEvidenceAnswers = {
  duplicateCharge: EvidenceAnswer;
  platformPaymentError: EvidenceAnswer;
  packageNeverReceivedAtOrigin: EvidenceAnswer;
  doorstepAttemptOccurred: EvidenceAnswer;
  expressHandlingPerformed: EvidenceAnswer;
};
```

API hook:
- Use a typed API client generated from shared contracts where available.
- Mutation name should align with `refund_payment`.
- Query invalidation must be explicit and covered by tests.

Do not:
- Hardcode untyped fetch in component body.
- Mutate global state outside query cache.
- Create a frontend-only refund status.

## Test Requirements
Unit tests:
- Renders role-blocked state without submit for missing `approve_refund`.
- Renders payment-not-confirmed state when payment status is not `confirmed`.
- Renders already-pending state for `refund_pending`.
- Renders already-refunded state for `refunded`.
- Renders delivery-missing state when linked delivery is unavailable.
- Selects pre-intake full refund lane and builds payload with only `paymentId`.
- Selects duplicate-charge lane and builds payload with `duplicateCharge: true`.
- Selects platform-error lane and builds payload with `platformPaymentError: true`.
- Selects package-never-received lane and builds payload with `packageNeverReceivedAtOrigin: true`.
- Selects doorstep surcharge lane and builds payload with `doorstepAttemptOccurred: false`.
- Selects express surcharge lane and builds payload with `expressHandlingPerformed: false`.
- Does not include unknown evidence fields.
- Does not include irrelevant false fields.
- Does not include amount or reason in request.
- Blocks submit until confirmation is checked.
- Resets confirmation when lane changes.
- Preserves selections after network error.
- Reuses idempotency key on retry for same payload.
- Regenerates idempotency key when payload changes.

Integration tests:
- Opens from `AdminRefundReview` with payment context.
- Opens from `AdminRefundEvidenceReview` and routes back on manual review.
- Opens from `AdminFinanceSummary` and refreshes parent row after success.
- Opens from `AdminPaymentReconciliationDetail` and warns on unresolved conflict.
- Opens from `AdminIssueDetail` and keeps issue unresolved after refund approval.
- Submits successful `refund_payment` and renders backend amount and reason.
- Handles `VALIDATION_ERROR` manual-review response.
- Handles already processed validation response.
- Handles forbidden response.
- Handles rate limit response.
- Handles session-expired response.

Accessibility tests:
- Modal has `role="dialog"` and `aria-modal="true"`.
- Focus moves into modal on open.
- Focus is trapped.
- Escape closes when safe.
- Escape does not close while submitting.
- Focus returns to trigger.
- Lane cards are keyboard selectable.
- Tri-state controls are keyboard usable.
- Error summary is announced.
- Success state is announced.
- Confirmation controls have accessible names.
- Large text does not hide primary action.

Visual regression targets:
- Ready state.
- Evidence missing state.
- Decision preview.
- Confirmation state.
- Submitting state.
- Success state.
- Manual review state.
- Already pending state.
- Payment not confirmed state.
- Role blocked state.
- Mobile full-screen sheet.

End-to-end scenarios:
- Finance admin approves pre-intake refund and opens settlement.
- Finance admin approves duplicate charge from reconciliation detail.
- Finance admin approves unused doorstep surcharge from evidence review.
- Finance admin attempts post-dispatch full refund and is routed to manual review.
- Support admin without capability cannot submit.
- Network failure preserves idempotent retry.

## Acceptance Criteria
Functional:
- Modal opens from every listed parent.
- Modal loads or receives payment context.
- Modal blocks missing role or capability.
- Modal blocks non-confirmed payments.
- Modal blocks existing refund states.
- Modal supports all backend-supported refund lanes.
- Modal builds valid `refundPaymentRequestSchema` payloads.
- Modal never sends amount.
- Modal never sends refund reason.
- Modal never calls settlement endpoint.
- Modal never records a backend rejection.
- Modal handles backend success as `refund_pending`.
- Modal routes settlement after success.
- Modal routes evidence or issue review when approval cannot happen.

UX:
- Finance can identify payment, delivery, amount, and stage without leaving modal.
- Finance can see why a lane is enabled or blocked.
- Finance can understand that approval is not settlement.
- Finance can review exact payload before submit.
- Finance can recover from failure without losing context.
- Finance can close safely.

Accessibility:
- Fully keyboard operable.
- Screen reader state changes announced.
- Visible focus throughout.
- Errors are tied to fields and summary.
- Target sizes meet minimum requirement.
- Reduced motion honored.

Security:
- Submit is capability-gated.
- Sensitive provider details are redacted.
- Analytics excludes sensitive fields.
- Idempotency prevents duplicate approval.
- Stale context requires refresh.

## Implementation Notes For Claude Code
Build this as a shared admin modal, not as a standalone route.

Use the parent screen as context source, but keep the modal self-sufficient enough to fetch missing safe context. Keep the domain rules close to the shared contract names so future backend schema changes are easy to detect.

Do not add a refund rejection endpoint in frontend code. If the user chooses a policy denial or manual-review outcome, route to evidence or issue workflow. The inventory label says approval/rejection, but the current backend only supports approval into `refund_pending`; rejection must be represented through issue resolution or evidence notes until a real backend mutation exists.

Never compute final refund amount as authoritative. The modal may show a policy preview, but final amount and reason must come from the backend response.

The final implementation must feel like finance-grade control software:
- Clear identity.
- Clear evidence.
- Clear policy lane.
- Clear payload.
- Clear consequence.
- Clear next step.

## Build Checklist
- Create shared modal component under admin UI package.
- Add typed props and route context adapter.
- Add context hydration hook.
- Add role and capability gate.
- Add eligibility ledger.
- Add policy lane selector.
- Add evidence tri-state controls.
- Add deterministic payload builder.
- Add payload review section.
- Add confirmation checkbox.
- Add idempotent mutation submit.
- Add success view with backend result.
- Add manual-review route actions.
- Add already-pending and already-refunded views.
- Add payment-not-confirmed view.
- Add rate-limit, network, forbidden, and session states.
- Add analytics with redaction.
- Add cache invalidation.
- Add keyboard and focus handling.
- Add unit, integration, accessibility, and visual tests.

## Final Implementation Directive
`RefundDecisionModal` must protect the business from accidental financial action while making legitimate refunds fast. It must submit only `refund_payment`, send only the shared-contract fields, rely on the backend for final amount and reason, and route every unsupported rejection or manual-review outcome to issue or evidence workflows. Build it as a premium operational finance modal: calm, dense, precise, keyboard-first, auditable, and impossible to confuse with refund settlement.

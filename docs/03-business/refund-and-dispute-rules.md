# Refund And Dispute Rules

## Purpose
This policy defines when money is returned, when a delivery problem becomes a formal dispute, and which actor is accountable for resolution in v1.

## Required Dispute Inputs
- Delivery ID.
- Payment reference or refund reference where applicable.
- Delivery timeline history.
- Handoff evidence.
- Proof-of-delivery or proof-of-return evidence.
- Support thread or admin case note.

## Refund Matrix
### Full Refund Cases
- Delivery cancelled before origin intake.
- Duplicate charge.
- Payment confirmed but no package was ever received at the origin station.
- Verified platform-side payment error.

### Partial Refund Cases
- Cancellation after origin intake but before dispatch: refund minus the `GHS 5` handling fee.
- Doorstep surcharge charged but no doorstep attempt occurred: refund the full doorstep surcharge component.
- Express surcharge charged but express handling was not actually performed because of platform-side or staff-side failure: refund the express surcharge component only.

### Post-Dispatch Rule
- No automatic full refund is available after dispatch.
- Post-dispatch refund requires either:
  - a verified service failure attributable to Kra custody or platform operation
  - a duplicate charge
  - a formal dispute ruling

### Loss And Damage Rule
- Confirmed total loss while the package is under verified Kra custody results in:
  - full refund of the delivery charge, and
  - compensation up to the declared value captured at booking, capped at `GHS 2,000` in standard v1 flow
- Confirmed damage does not trigger automatic compensation in v1.
- Damage claims require manual review; the service fee may be refunded in full or in part if Kra-side fault is confirmed.

## Dispute Categories
- `payment_dispute`
- `refund_request`
- `service_delay`
- `loss_claim`
- `damage_claim`
- `receiver_refusal`
- `custody_mismatch`

## Dispute Window And SLA
- The customer may open a dispute within `7 calendar days` of:
  - delivery completion
  - pickup-hold notification
  - refund completion attempt
- Internal acknowledgement target is `48 hours`.
- Standard disputes with complete evidence should be resolved within `5 business days`.
- Complex loss, damage, or provider-settlement disputes may extend to `10 business days` with admin approval and a case note.

## Liability Split
- Sender is responsible for:
  - incorrect package description
  - prohibited items
  - wrong receiver details submitted before intake
- Origin station is responsible from confirmed intake until confirmed handoff to the driver.
- Driver is responsible from confirmed dispatch until confirmed destination-station receipt.
- Final-mile courier is responsible from confirmed final-mile handoff until confirmed delivery or confirmed return handoff to the destination station.
- Platform or admin operations are responsible for:
  - duplicate charges
  - policy errors
  - unauthorized overrides
  - system-driven state corruption

## Evidence Hierarchy
Disputes should be resolved using evidence in this order:
1. confirmed handoff events
2. payment verification and settlement records
3. proof-of-delivery or proof-of-return artifacts
4. issue thread and support notes
5. manual witness statements only if digital evidence is incomplete

## Receiver Refusal Rule
- Receiver refusal does not automatically cancel the original service contract.
- Receiver refusal creates an `issue_reported` workflow.
- Station review decides whether the package enters pickup flow, return-to-sender flow, or compensation review.
- A refusal caused by sender-provided error is not automatically refundable.

## Escalation For Repeated Disputes
- Any actor with `3` substantiated disputes within `30 days` is escalated to admin and operations review.
- Any route with `5` or more substantiated disputes within `30 days` is escalated for service-quality review.
- Repeated payment mismatches on the same provider are escalated to finance and backend engineering on the next business day.

## Refund Execution Rule
- Approved refunds should return to the original payment method where technically possible.
- Once approved, the refund must be initiated the same business day.
- Refund completion target is within `3 business days` for original-method refunds.
- If original-method refund is unavailable, finance may use an alternate refund path only with:
  - an adjustment reference
  - approver identity
  - payout evidence
- Alternate-path refunds must complete within `5 business days`.
- Cash refunds are not part of the standard v1 workflow.

## Baseline Status
This file is now concrete enough to drive cancellation outcomes, refund execution, liability decisions, dispute workflow, and finance-support coordination in v1.

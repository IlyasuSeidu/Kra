# Cancellation Rules

## Recommended Cancellation Policy
### Before origin intake
- Sender can cancel directly from the app.
- Payment is fully voided or refunded.

### After origin intake but before dispatch
- Cancellation requires operator confirmation.
- Refund is the amount collected minus the `GHS 5` handling fee.
- Authorization may be given by a station supervisor or admin.

### After dispatch
- Cancellation is treated as an exception workflow, not a self-service action.
- Admin review is required.
- No automatic full refund applies after dispatch.

## Receiver-Initiated Cancellation
- Receiver should not be allowed to cancel the original service contract unilaterally.
- Receiver can refuse final acceptance, which creates an issue workflow rather than a direct cancellation.
- Receiver refusal after destination arrival moves the delivery into `issue_reported` for station review.
- Station review decides whether the package enters pickup flow, return-to-sender flow, or compensation review.

## Operational Requirement
Any cancellation after physical intake must preserve the audit trail and payment history.

## Return-To-Sender Rule
- If cancellation is requested after dispatch and the package cannot be delivered onward, the package may move into return-to-sender as a linked new delivery.
- Return-to-sender uses the standard base route fee and must be prepaid before dispatch.

## Baseline Status
This file is now concrete enough to support self-service cancellation, supervised cancellation, receiver refusal handling, and late-stage exception handling in v1.

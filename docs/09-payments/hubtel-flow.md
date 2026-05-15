# Hubtel Flow

## Recommended Flow
1. Customer confirms amount and payment channel.
2. Backend initializes Hubtel transaction.
3. Customer completes the payment.
4. Callback and provider verification confirm final status.
5. Delivery payment state is updated.

## Rules
- Keep Hubtel-specific handling inside an adapter.
- Normalize success and failure states into a shared payment domain model.

## Failure Cases
- Provider session expires.
- Payment remains pending beyond expected window.
- Callback cannot be matched to an internal payment reference.

## Operational Requirement
Support staff should be able to trace a Hubtel payment from delivery detail to provider reference without needing database-only access.

## Approved V1 Decision
- `Hubtel` is not enabled as a live payment provider in the pilot.
- The v1 integration contract is defined now so it can be activated later without redesign.

## Reserved Activation Model
- Flow type: server-initialized checkout plus webhook callback
- Callback route: `POST /v1/webhooks/payments/hubtel`
- Verification rule:
  - never trust callback alone
  - always verify final status through provider confirmation before setting `paymentStatus=confirmed`

## Pending And Retry Rule
- Pending state verification attempts:
  - `5 minutes`
  - `15 minutes`
  - `30 minutes`
- If still unresolved after `30 minutes`, keep payment `pending` and move into reconciliation review.

## Activation Checklist
- provider credentials configured
- callback route verified
- successful sandbox payment
- failed payment case verified
- duplicate callback case verified
- reconciliation record verified

## Baseline Status
This file is now concrete enough to preserve a stable later-activation contract for Hubtel.

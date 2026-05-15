# MTN MoMo Flow

## Recommended Flow
1. Sender confirms the quote.
2. Backend creates a payment intent tied to a delivery ID.
3. MTN MoMo charge request is initiated.
4. Customer authorizes the payment.
5. Backend verifies callback or provider status.
6. Receipt is generated and attached to the delivery.

## Rules
- Never trust callback data without verification.
- Keep provider reference and internal reference linked.
- Handle retries idempotently.

## Failure Cases
- Customer does not authorize the payment.
- Callback is delayed or missing.
- Provider returns a pending state.

## Operational Requirement
The delivery record should show whether the payment is `pending`, `confirmed`, or `failed`, even if the provider-specific detail lives elsewhere.

## Approved V1 Decisions
- `MTN MoMo` is the primary production payment path for the pilot.
- Payment initialization happens immediately after quote acceptance.
- Payment confirmation must be verified before dispatch is allowed.
- Pending payment states are allowed to exist only before transport begins.
- The provider callback route is `POST /v1/webhooks/payments/mtn-momo`.
- If the callback is missing or delayed, the backend should verify payment status through the provider path before changing internal payment state.
- If payment remains unresolved after verification attempts at `5 minutes`, `15 minutes`, and `30 minutes`, the payment remains `pending` and is pushed into reconciliation review.
- Duplicate callbacks must be idempotent on provider reference plus event type.

## Environment Prerequisites
- Production credentials are environment configuration, not product-policy input.
- Sandbox and production keys must map to different callback secrets.
- Pilot go-live requires a verified end-to-end test covering:
  - successful payment
  - failed authorization
  - delayed callback
  - duplicate callback
  - refund initiation after approval

# Payments Spec

## Goal
Make payment state a first-class part of delivery state rather than an external afterthought.

## Supported Methods
- MTN MoMo
- Hubtel
- Paystack

Cash should be avoided as a core digital workflow in v1 unless business reality requires a temporary hybrid process.

## Payment Lifecycle
1. Quote generated.
2. Customer chooses payment method.
3. Payment initiated.
4. Provider confirmation or failure received.
5. Receipt stored and surfaced.
6. Refund or adjustment workflow if required.

## Requirements
- Every payment must be tied to a delivery ID.
- Receipts must be retrievable.
- Failed payments must not silently permit service progression unless explicitly configured.

## Approved V1 Decisions
- `MTN MoMo` is the first production payment path.
- `Paystack` is secondary and may be enabled after the core pilot flow is stable.
- `Hubtel` is deferred until after the pilot core is stable.
- No cash collection is allowed in the standard v1 digital flow.
- Partial payment is not supported in v1.
- Failed payments block dispatch and any later transport state.
- Payment confirmation should surface a receipt immediately in sender history and delivery detail.
- If a payment remains unresolved after provider verification attempts, the UI should show `Payment under review` instead of silently failing forward.
- Approved refunds should appear on the same payment timeline as the original charge.
- Refund completion target is `3 business days` for original-method refunds and `5 business days` for approved alternate-path refunds.

## Baseline Status
This file is now concrete enough to guide launch payment integration and payment-state enforcement for v1.

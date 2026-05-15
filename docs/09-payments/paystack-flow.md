# Paystack Flow

## Recommended Flow
1. Customer chooses Paystack-backed payment option.
2. Backend initializes transaction with internal delivery reference.
3. Customer completes checkout.
4. Backend verifies payment result.
5. Receipt and payment status are persisted.

## Rule
All provider responses should resolve into a common internal `paymentStatus` model.

## Failure Cases
- Customer abandons checkout.
- Verification fails after apparent success.
- Duplicate callback or replay occurs.

## Operational Requirement
The payment verification path must be replay-safe and must not create multiple receipts for the same settled payment.

## Approved V1 Decision
- `Paystack` is not active at initial pilot launch.
- When enabled after pilot stabilization, it will support:
  - card payments
  - bank transfer where supported by the provider flow

## Checkout Model
- Mobile UX uses secure browser or webview redirect flow, not embedded custom card forms.
- Callback route: `POST /v1/webhooks/payments/paystack`
- Server verification is mandatory before setting `paymentStatus=confirmed`.

## Retry Rule
- Verification attempts on unresolved payment:
  - immediate webhook handling
  - `5 minutes`
  - `15 minutes`
  - `30 minutes`
- After `30 minutes`, unresolved payments stay `pending` and move to finance review.

## Enablement Checklist
- sandbox card success
- abandoned checkout path
- duplicate callback handling
- refund path check
- reconciliation record check

## Baseline Status
This file is now concrete enough to support later Paystack activation without redesigning the payment model.

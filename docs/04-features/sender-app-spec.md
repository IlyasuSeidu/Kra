# Sender App Spec

## Purpose
Give the sender confidence, control, and fast issue visibility without exposing internal operational noise.

## Core Screens
- Dashboard
- Create Delivery
- Delivery Details
- Tracking Timeline
- Delivery History
- Payments
- Support

## Create Delivery Flow
1. Select origin and destination.
2. Enter receiver details.
3. Enter package size, weight, category, and special handling notes.
4. Choose standard, express, or doorstep service if available.
5. View price estimate.
6. Confirm payment method and submit.

## Dashboard Requirements
- Show active deliveries first.
- Surface current status, next milestone, and recent issues.
- Include quick actions for `Create Delivery`, `Track Delivery`, and `Contact Support`.

## Tracking Requirements
- Timeline view is mandatory.
- Map view is optional and should be shown only when location data is meaningful.
- Sender must see the latest verified station or courier state, not speculative movement.

## History And Finance
- Delivery history must support search, filter, and repeat booking.
- Payments view must show receipts, refunds, and status of each charge.

## Approved V1 Decisions
- Receiver accounts are not required in v1.
- The sender enters receiver details during booking and remains the primary authenticated customer.
- The sender app must support sharing a secure tracking link with the receiver.
- Receiver phone number is mandatory for:
  - doorstep deliveries
  - pickup notifications
  - OTP-based proof flows
- If the receiver later becomes a repeat sender, that person creates a sender account separately rather than upgrading a receiver-only profile.

## Final Create-Delivery Fields
- `originStationId`: required
- `destinationStationId`: required
- `receiverName`: required, `2-80` characters
- `receiverPhone`: required, Ghana-compatible phone format
- `addressText`: required only for doorstep service
- `packageDescription`: required, `3-120` characters
- `weightKg`: required, `0.1-20`
- `sizeTier`: required
- `isFragile`: required boolean
- `declaredValueGhs`: required, `0-5000`
- `specialHandlingNotes`: optional, `0-160` characters
- `serviceType`: required

## Validation Rules
- Doorstep cannot be selected if no address is provided.
- Express cannot be selected if route is not enabled for express service.
- Declared value above `GHS 2,000` shows manual approval notice.
- Weight above `20kg` is blocked from self-serve booking.

## Copy Baseline
- receiver phone error: `Enter a valid receiver phone number.`
- route unavailable: `This route is not available right now.`
- payment pending banner: `Your delivery is created, but payment is still pending.`
- quote notice: `Final charge may be adjusted at station intake if weight or size changes.`

## Required Edge States
- payment pending after booking
- quote adjusted at intake
- station temporarily unavailable
- doorstep not available for destination
- secure tracking link shared successfully

## Baseline Status
This file is now concrete enough to drive sender form implementation, validation, and UX state handling.

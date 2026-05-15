# Tracking Spec

## Tracking Model
Tracking in `Kra` should be event-first, not location-first. The most important thing is verified state and custody, not a noisy moving dot on a map.

## Public Tracking Elements
- Current status.
- Latest verified station or courier touchpoint.
- Timeline of major milestones.
- Estimated next step where possible.

## Internal Tracking Elements
- Handoff chain.
- Delay flags.
- Scan mismatches.
- Unacknowledged assignments.

## Rules
- Never show speculative package movement as confirmed fact.
- Prefer station-confirmed events over inferred GPS movement for customer trust.

## Approved V1 Decisions
- Receivers get direct tracking access in v1 without creating a full account.
- Receiver access is delivered through a secure delivery link sent by SMS and optionally shared by the sender.
- Public tracking may show:
  - current delivery status
  - latest verified station or courier milestone
  - pickup readiness or doorstep attempt outcome
  - limited ETA messaging when confidence is high enough
- Public tracking must never show:
  - internal notes
  - staff names beyond role labels
  - precise live GPS trails
  - payment internals or refund reasoning
- Sensitive receiver actions such as pickup confirmation or OTP reveal require phone-based verification tied to the delivery.

## Public Tracking Labels
- `created` -> `Booking created`
- `received_at_origin` -> `Received at origin station`
- `awaiting_driver_assignment` -> `Awaiting dispatch`
- `assigned_to_driver` -> `Assigned to line-haul driver`
- `dispatched_from_origin` -> `Left origin station`
- `in_transit` -> `In transit`
- `received_at_destination` -> `Arrived at destination station`
- `awaiting_receiver_pickup` -> `Ready for pickup`
- `awaiting_final_mile_assignment` -> `Waiting for doorstep courier`
- `assigned_for_final_mile` -> `Assigned for doorstep delivery`
- `out_for_delivery` -> `Out for delivery`
- `delivered` -> `Delivered`
- `issue_reported` -> `Issue under review`
- `on_hold` -> `On hold`
- `cancelled` -> `Cancelled`

## ETA Rule
- Show a date window only for inter-station movement unless the system has active final-mile assignment data.
- Show a specific ETA only when confidence is `>= 0.8`.
- If confidence is below threshold, show:
  - `Expected today`
  - `Expected tomorrow`
  - `Awaiting next update`
  instead of a clock time.

## Location Visibility Rule
- No live map is shown before final-mile assignment.
- During `out_for_delivery`, the public view may show broad destination-area context only, not precise GPS.
- Internal staff views may use GPS hints for operational support, but customer views stay event-first.

## Baseline Status
This file is now concrete enough to support tracking UI, ETA messaging, and privacy-safe visibility rules.

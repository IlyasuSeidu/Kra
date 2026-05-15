# Delivery Lifecycle

## Finalized V1 Lifecycle Stages
1. `draft`
2. `created`
3. `received_at_origin`
4. `awaiting_driver_assignment`
5. `assigned_to_driver`
6. `dispatched_from_origin`
7. `in_transit`
8. `received_at_destination`
9. `awaiting_receiver_pickup` or `awaiting_final_mile_assignment`
10. `assigned_for_final_mile`
11. `out_for_delivery`
12. `delivered`
13. `closed`

## Lifecycle Rules
- A package cannot be dispatched before origin receipt is confirmed.
- A package cannot be marked delivered without final proof.
- Payment must be confirmed before the delivery is allowed into transport states.

## Exception Branches
- `Issue Reported`
- `Delayed`
- `Failed Delivery Attempt`
- `Cancelled`
- `On Hold`

## Required Metadata Per Transition
- Actor ID.
- Actor role.
- Timestamp.
- Station or location context.
- Previous state.
- New state.
- Optional proof artifact.

## Approved V1 Decisions
### Approved Status Policy
- The status list above is the approved v1 lifecycle.
- `delayed` remains a derived operational flag, not a canonical delivery status.
- `refunded` is a payment state, not a delivery status.
- `issue_reported` and `on_hold` remain valid operational statuses because they affect queues and support handling.

### Payment Gate
- A delivery may exist in `created` and `received_at_origin` while payment is still pending.
- A delivery may not transition to `assigned_to_driver`, `dispatched_from_origin`, `in_transit`, or any later transport state until `payment_status=paid`.
- `Pay on delivery` is not supported in v1.

### Final-Mile Failure And Reattempt Policy
- One doorstep reattempt is allowed within `24 hours` of the first failed attempt.
- The first reattempt does not add a new doorstep surcharge.
- After the second failed attempt, the package moves back to `awaiting_receiver_pickup` at the destination station.

### Pickup Hold And Return-To-Sender Policy
- A package may remain in `awaiting_receiver_pickup` for `72 hours`.
- After `72 hours`, the package is flagged `on_hold` and the sender is notified.
- After `7 calendar days` unclaimed, the package becomes eligible for return-to-sender.
- Return-to-sender is created as a linked new delivery on the same corridor at the `standard base route fee`, prepaid before dispatch.

### Public Tracking Labels
- `created` -> `Booking created`
- `received_at_origin` -> `Received at origin station`
- `awaiting_driver_assignment` -> `Awaiting dispatch`
- `assigned_to_driver` -> `Assigned to driver`
- `dispatched_from_origin` -> `Left origin station`
- `in_transit` -> `In transit`
- `received_at_destination` -> `Arrived at destination station`
- `awaiting_receiver_pickup` -> `Ready for pickup`
- `awaiting_final_mile_assignment` -> `Waiting for doorstep courier`
- `assigned_for_final_mile` -> `Assigned for doorstep delivery`
- `out_for_delivery` -> `Out for delivery`
- `delivered` -> `Delivered`

## Baseline Status
This file is now concrete enough to drive state machines, queue logic, tracking, and acceptance criteria for v1.

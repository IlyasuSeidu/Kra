# Package Statuses

## Canonical Statuses
- `draft`
- `created`
- `received_at_origin`
- `awaiting_driver_assignment`
- `assigned_to_driver`
- `dispatched_from_origin`
- `in_transit`
- `received_at_destination`
- `awaiting_receiver_pickup`
- `awaiting_final_mile_assignment`
- `assigned_for_final_mile`
- `out_for_delivery`
- `delivered`
- `delivery_failed`
- `issue_reported`
- `on_hold`
- `cancelled`
- `closed`

## Status Design Rules
- Statuses should describe business state, not UI language.
- Time-based conditions like "delayed" can be derived flags, not always top-level statuses.
- Public-facing labels can differ from internal canonical values.

## Recommended Public Labels
- `created` -> "Booking created"
- `received_at_origin` -> "Received at origin station"
- `awaiting_driver_assignment` -> "Awaiting dispatch"
- `assigned_to_driver` -> "Assigned to driver"
- `dispatched_from_origin` -> "Left origin station"
- `in_transit` -> "In transit"
- `received_at_destination` -> "Arrived at destination station"
- `awaiting_receiver_pickup` -> "Ready for pickup"
- `awaiting_final_mile_assignment` -> "Waiting for doorstep courier"
- `assigned_for_final_mile` -> "Assigned for doorstep delivery"
- `out_for_delivery` -> "Out for delivery"
- `delivered` -> "Delivered"

## Approved V1 Decisions
- `delayed` is a derived flag and is never stored as the canonical delivery status.
- `refunded` is removed from delivery status and handled entirely in `payment_status`.
- `delivery_failed` is reserved for terminal exception outcomes such as confirmed loss, irrecoverable damage, or admin-closed failed delivery.
- `delivery_failed` is not used for an ordinary missed doorstep attempt; those cases return to pickup or issue workflow.
- `issue_reported` and `on_hold` are persisted because they materially affect station work and support handling.
- If status naming changes after pilot launch, the backend must support value aliasing until all active deliveries are migrated.

## Baseline Status
This file is now aligned with the approved lifecycle and is ready for shared enums, storage models, and customer-facing status rendering.

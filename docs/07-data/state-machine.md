# State Machine

## Main Flow
- `draft` -> `created`
- `created` -> `received_at_origin`
- `received_at_origin` -> `awaiting_driver_assignment`
- `awaiting_driver_assignment` -> `assigned_to_driver`
- `assigned_to_driver` -> `dispatched_from_origin`
- `dispatched_from_origin` -> `in_transit`
- `in_transit` -> `received_at_destination`
- `received_at_destination` -> `awaiting_receiver_pickup`
- `received_at_destination` -> `awaiting_final_mile_assignment`
- `awaiting_final_mile_assignment` -> `assigned_for_final_mile`
- `assigned_for_final_mile` -> `out_for_delivery`
- `out_for_delivery` -> `delivered`
- `delivered` -> `closed`

## Exception States
- `issue_reported`
- `on_hold`
- `delivery_failed`
- `cancelled`

## Rule
Exception states should preserve the ability to inspect where the package physically is, even if the business state is blocked.

## Approved Transition Authority
- `draft` -> `created`: sender or assisted station flow
- `created` -> `received_at_origin`: station operator
- `received_at_origin` -> `awaiting_driver_assignment`: system after successful intake
- `awaiting_driver_assignment` -> `assigned_to_driver`: station operator
- `assigned_to_driver` -> `dispatched_from_origin`: station operator with driver confirmation
- `dispatched_from_origin` -> `in_transit`: system on successful dispatch write
- `in_transit` -> `received_at_destination`: station operator
- `received_at_destination` -> `awaiting_receiver_pickup`: station operator
- `received_at_destination` -> `awaiting_final_mile_assignment`: station operator
- `awaiting_final_mile_assignment` -> `assigned_for_final_mile`: station operator
- `assigned_for_final_mile` -> `out_for_delivery`: final-mile courier
- `out_for_delivery` -> `delivered`: final-mile courier with proof
- `delivered` -> `closed`: system after completion stabilization window

## Exceptional Paths
- `created` -> `cancelled`: sender or admin inside policy
- `received_at_origin` -> `cancelled`: station supervisor or admin inside policy
- `any active state` -> `issue_reported`: authorized operational actor or admin
- `awaiting_receiver_pickup` -> `on_hold`: system after `72 hours`
- `issue_reported` -> `awaiting_receiver_pickup`: station or admin after resolution
- `issue_reported` -> `delivery_failed`: admin after terminal loss or irrecoverable failure

## Automation Rule
- automated:
  - `received_at_origin` -> `awaiting_driver_assignment`
  - `dispatched_from_origin` -> `in_transit`
  - `delivered` -> `closed`
  - `awaiting_receiver_pickup` -> `on_hold`
- manual:
  - all intake, assignment, dispatch, receipt, issue, and proof transitions

## Migration Rule
- New states may be introduced only through versioned enum changes and migration scripts.
- Existing active deliveries must either be aliased or migrated before deprecated states are removed.

## Baseline Status
This file is now concrete enough to drive state-machine implementation and transition authorization.

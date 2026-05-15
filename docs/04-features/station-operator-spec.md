# Station Operator Spec

## Purpose
Provide a single operational cockpit for intake, dispatch, receipt, final-mile assignment, and issue control.

## Main Screens
- Overview
- Outbound Queue
- Inbound Queue
- Handoff Log
- Final-Mile Assignment
- Reports
- Support

## Key Workflows
### Intake
- Search or create delivery.
- Validate package details.
- Confirm receipt and place in queue.

### Dispatch
- Select package or bulk package group.
- Assign driver.
- Confirm scan-based handoff.

### Destination Receipt
- Confirm arrival.
- Run condition check.
- Assign pickup or doorstep next step.

## UI Requirements
- Use queue views with strong filtering.
- Highlight urgent and overdue items.
- Prevent status changes that violate lifecycle order.

## Final Field Requirements
### Intake
- delivery ID or create-delivery lookup
- measured weight
- size tier
- package condition
- payment status confirmation
- label scan or manual code
- receiving operator ID

### Dispatch
- driver selection
- package scan confirmation
- manifest confirmation
- dispatch timestamp
- dispatching operator ID

### Destination Receipt
- package scan confirmation
- condition check
- receiving operator ID
- next step:
  - pickup queue
  - final-mile queue
  - issue queue

## Bulk Action Rules
- Bulk driver assignment is allowed only for deliveries:
  - on the same corridor
  - in the same status
  - with no open blocking issue
- Bulk operation limit: `20` deliveries
- Mixed-corridor bulk actions are not allowed.
- Admin approval is required for reopening or force-moving more than `5` blocked deliveries at once.

## Override Boundary
- Station-only actions:
  - intake
  - standard dispatch
  - standard destination receipt
  - moving delivery into pickup or final-mile queue
- Admin override actions:
  - force reassignment across stations
  - reopen cancelled or closed delivery
  - bypass queue restrictions
  - override blocked payment or issue state

## Hardware Assumption
- Station operator flow is optimized for Android phone use with camera scanning.
- Manual code fallback is always available.

## Baseline Status
This file is now concrete enough to support station workflow implementation, queue logic, and privileged-action boundaries.

# Copy Deck

## Voice
- Clear.
- Calm.
- Operational.
- Trust-building.

## Primary CTAs
- Create Delivery
- Track Package
- Assign Driver
- Confirm Dispatch
- Confirm Arrival
- Start Delivery
- Mark Delivered
- Report Issue
- Contact Support

## Common Status Labels
- Pending
- In Transit
- Delivered
- Failed
- Received At Origin
- Received At Destination
- Out For Delivery
- Awaiting Pickup

## Empty State Examples
- "No active deliveries yet. Create your first delivery to start tracking."
- "No packages are waiting for dispatch right now."
- "No unresolved issues. The network is running clean."

## Error Tone
- State what failed.
- State what the user can do next.
- Avoid vague blame language.

## Approved V1 Copy Decisions
- Launch copy language is `English` only.
- Customer copy must use:
  - `package`
  - `pickup`
  - `delivery`
  and avoid internal jargon such as `custody` or `projection`.
- Time and ETA copy must use:
  - `expected`
  - `estimated`
  and never use guaranteed-delivery language.

## Core Event Copy
- payment pending: `Your delivery is created, but payment is still pending.`
- payment confirmed: `Payment confirmed. Your delivery is now being processed.`
- ready for pickup: `Your package is ready for pickup at {stationName}.`
- out for delivery: `Your package is out for delivery.`
- failed attempt: `We could not complete delivery. Please review the next step.`
- delivered: `Your package has been delivered.`
- refund completed: `Your refund has been completed.`

## Error Copy Rules
- Validation errors must name the field and recovery action.
- Payment errors must not expose provider internals.
- Refund and dispute copy must reference policy review, not promise compensation.

## Empty And Blocked States
- no history: `No deliveries yet. Create your first delivery to get started.`
- no queue items: `No packages need action right now.`
- blocked payment: `Payment must be confirmed before this package can move.`
- service unavailable: `This service is not available for the selected route right now.`

## Legal Copy Rule
- UI copy may describe:
  - status visibility
  - payment traceability
  - issue review
- UI copy must not promise:
  - guaranteed arrival times
  - automatic compensation
  - insurance-backed outcomes

## Baseline Status
This file is now concrete enough to guide launch UI copy and event messaging.

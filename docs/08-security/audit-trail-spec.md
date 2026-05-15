# Audit Trail Spec

## Events To Capture
- Delivery creation.
- Payment initialization and confirmation.
- Origin intake.
- Driver assignment.
- Dispatch.
- Destination receipt.
- Final-mile assignment.
- Delivery completion.
- Issue creation, escalation, and resolution.
- Admin override or dispute decision.

## Required Fields
- Event ID.
- Delivery ID.
- Actor ID.
- Actor role.
- Previous state.
- New state.
- Station context.
- Timestamp.
- Proof reference if applicable.

## Non-Negotiable Rule
Audit history must be append-only for key lifecycle actions. Corrections should create new events, not erase old ones.

## Approved Retention Policy
- delivery and handoff audit events: `24 months`
- payment and refund audit events: `36 months`
- proof-reference access events: `12 months`
- admin override events: `36 months`

## Query Strategy
- Support tools query audit history by `deliveryId`.
- Admin tools may query by:
  - `deliveryId`
  - `paymentId`
  - `actorId`
  - `adminRole`
  - time range

## Redaction Rule
- Proof asset URLs must not be stored directly in customer-visible audit surfaces.
- Public and support views should show proof metadata and access-controlled fetch paths, not raw storage URLs.

## Auditable Admin Actions
- role assignment changes
- station assignment changes
- refund approval and execution
- delivery-state override
- issue closure override
- service availability changes

## Baseline Status
This file is now concrete enough to support audit storage and admin-review tooling.

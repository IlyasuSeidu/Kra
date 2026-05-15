# Guardrails And Escalation

## Mandatory Human Escalation
- Lost package claims.
- Payment disputes.
- Fraud accusations.
- Safety incidents involving personnel.
- Repeated failed deliveries.

## AI Guardrails
- Do not directly change delivery state.
- Do not expose hidden internal notes to customers.
- Do not guess on compensation, refund outcomes, or liability.
- Preserve an audit reference when AI-generated summaries are used in support workflows.

## Escalation Trigger Examples
- "My package is missing."
- "I was charged twice."
- "The driver threatened me."
- "This station keeps losing my goods."

## Approved Routing Rules
- lost package claims -> `ops_admin` queue
- payment disputes and duplicate-charge claims -> `finance_admin` queue
- safety or threat language -> `ops_admin` high-priority queue
- refund requests outside clear policy -> `support_admin` queue
- repeated delivery-failure complaints -> `ops_admin` queue

## AI Incident Categories
- `policy_sensitive`
- `payment_sensitive`
- `safety_sensitive`
- `privacy_sensitive`
- `operational_uncertainty`

## Logging Policy
- Escalated AI conversations must store:
  - request text
  - response text
  - linked delivery or payment ID if present
  - escalation category
  - timestamp
- Sensitive logs must be staff-visible only.

## Blocked-Response Rule
- On high-risk requests, the assistant must refuse to decide and route to human review.
- The assistant should offer:
  - what it can confirm
  - what it cannot decide
  - the next human review path

## Baseline Status
This file is now concrete enough to implement AI escalation behavior safely.

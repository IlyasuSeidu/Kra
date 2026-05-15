# Scope V1 V2 V3

## V1: Operational Core
The goal of v1 is to prove the delivery lifecycle works digitally from origin intake to final completion.

### In Scope
- Sender sign in and delivery creation.
- Delivery pricing estimate and payment initiation.
- Origin station intake, scan, and dispatch.
- Driver assignment and in-transit status updates.
- Destination station receipt confirmation.
- Tracking timeline for sender.
- Basic notifications for major status changes.
- Admin visibility into deliveries, users, and issues.
- Proof of handoff and proof of delivery records.

### Out Of Scope
- Deep loyalty programs.
- Marketplace-style courier matching.
- Dynamic surge pricing.
- Multi-country logistics.
- Custom enterprise billing contracts.

## V2: Operational Depth
The goal of v2 is to reduce manual work and improve field execution.

### In Scope
- Full doorstep delivery workflow.
- Offline-first field updates for weak network areas.
- Route optimization for final-mile and multi-stop movement.
- Ratings, issue categorization, and stronger support tooling.
- Better exports for finance and reporting.

## V3: Platform Intelligence
The goal of v3 is to increase leverage through automation and analytics.

### In Scope
- AI support assistant with delivery-aware responses.
- Exception summarization for ops teams.
- Configurable service policies by route or station.
- Automated fraud or anomaly flags.
- More advanced reconciliation and payout workflows.

## Recommended Sequence
Do not start with all roles and all flows at once. Get origin intake, intercity transport, and destination receipt stable first, then layer final-mile complexity on top.

## Formal V1 Cutoff
V1 ends when all of the following are true:
- sender can create and pay for a delivery
- station can intake, dispatch, receive, and hand off with audit history
- driver can complete inter-station transport
- final-mile courier can complete or fail delivery with structured proof
- admin can search, review issues, and inspect payments
- MTN MoMo payment flow is production-ready

## Explicit Launch Blocks
These do not ship in v1 even if partial code exists:
- Paystack live payments
- Hubtel live payments
- public ratings and comments
- customer-facing AI chatbot
- dynamic pricing
- enterprise billing and invoicing
- route optimization beyond simple assignment workflow

## V1 To V2 Go Or No-Go Rule
Do not start v2 expansion until:
- `30 days` of pilot data exist
- delivery completion rate stays `>= 97%` for `4` consecutive weeks
- lost package rate stays `<= 0.5%`
- refund SLA compliance stays `>= 90%`
- all three launch stations pass readiness and no route remains in remediation

## Staffing Baseline
- `1` business and product owner
- `1` primary implementation owner
- `1` operations admin
- `1` finance admin
- `1` support owner
- per launch station:
  - `1` station lead
  - `1` queue operator per active shift
- per launch corridor:
  - `1` primary driver slot per dispatch cycle
- per launch city final-mile zone:
  - `1` active courier slot during service hours

## Baseline Status
This scope file is now concrete enough to define launch boundaries and phase-gate decisions.

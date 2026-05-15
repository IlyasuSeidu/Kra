# Personas

## Frequent Retail Sender
- Sends packages weekly or daily.
- Cares about reliability more than novelty.
- Needs saved receiver details, quick repeat orders, and easy receipt history.

## Small Business Sender
- Ships many packages and wants records for reconciliation.
- Needs exportable history, invoice access, and support prioritization.

## Intercity Driver
- Works under time pressure and variable network quality.
- Needs fast confirmation actions, route visibility, and a defensible event history.

## High-Throughput Station Operator
- Handles dozens of package movements in a shift.
- Needs bulk actions, queue clarity, and minimal re-entry of data.

## Final-Mile Courier
- Works mostly on mobile while moving.
- Needs map guidance, one-tap status changes, and proof capture that still works on weak internet.

## Operations Admin
- Optimizes the network at system level.
- Needs analytics, audit detail, and fast issue triage rather than flashy UI.

## Launch Prioritization
### P1 Personas
- Frequent Retail Sender
- High-Throughput Station Operator
- Intercity Driver
- Operations Admin

### P2 Personas
- Small Business Sender
- Final-Mile Courier

## Pilot Market Assumptions
- Frequent retail senders are expected to make up the largest count of pilot users.
- Small business senders are expected to generate fewer accounts but higher repeat volume.
- Station operators and drivers are the highest-leverage personas because they determine whether the network stays trustworthy.

## Coverage Rule
- The pilot is considered persona-complete if the product supports:
  - customer booking and payment
  - station intake and dispatch
  - intercity transport
  - destination receipt and pickup or doorstep completion
  - admin exception review
- Receiver-only access is handled through secure links and does not require a standalone persona surface in v1.

## Baseline Status
This persona set is now prioritized enough to guide build sequencing and pilot UX focus.

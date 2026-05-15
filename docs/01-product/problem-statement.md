# Problem Statement

## Existing Workflow
1. A sender drops a package at an origin station.
2. A station operator records or informally accepts the package.
3. A driver transports the package to a destination station.
4. A destination operator receives the package.
5. The receiver either picks it up or the package is assigned for doorstep delivery.

## What Breaks In The Current Model
- Tracking is weak or non-existent once the package leaves the sender's hands.
- Handoffs are poorly recorded, so it becomes hard to know who last held a package.
- Drivers, operators, and customers rely on calls and ad hoc messages instead of shared operational data.
- Delivery payments, refunds, and proof of payment are not consistently tied to service events.
- Peak periods expose the lack of queueing discipline, role clarity, and prioritization.

## Impact By User
### Sender
- Cannot tell whether a package is safe, delayed, or lost.
- Has no reliable receipt trail for disputes.

### Receiver
- Does not know when to expect the package.
- May need to travel unnecessarily because final-mile coordination is weak.

### Driver
- Receives unclear assignments.
- Gets blamed for delays without enough digital evidence.

### Station Operator
- Manages too many moving parts without a unified dashboard.
- Has weak tools for dispatch, receipt, and exception handling.

### Admin
- Cannot easily identify bottlenecks, fraud, or poor-performing stations.

## Why This Problem Is Worth Solving
The delivery model already exists and already moves real demand. The failure is not lack of need; it is lack of operational structure. That makes this a workflow and accountability problem more than a demand-generation problem.

## Target Outcome
Every package should be searchable, every state transition should be explainable, and every accountable actor should be visible in the delivery history.

## Approved V1 Problem Ranking
1. undocumented custody handoffs
2. weak delivery visibility for senders and receivers
3. poor station queue discipline during intake and dispatch
4. payment state disconnected from service execution
5. weak exception ownership for delays, damage, and disputes

## Build Baseline Assumptions
- The three launch corridors are treated as representative of the broader station-delivery problem the product is solving.
- Pilot value is justified even before formal field research because the operational failure modes are already visible in station-based parcel systems:
  - phone-call dependency
  - handwritten or memory-based custody
  - weak payment reconciliation
  - unclear receiver coordination
- Formal field research remains useful, but it is not a blocker to product build.

## V1 Scope Of Problem Solving
### In Scope
- digital delivery creation and tracking
- verified custody handoffs
- station intake, dispatch, receipt, and pickup workflow
- payment traceability
- structured issue handling

### Deferred
- marketplace courier discovery
- national route optimization
- public ratings as a core trust mechanism
- autonomous AI decision-making on refunds or disputes

## Baseline Status
This problem statement now defines the ranked operational problems that v1 is explicitly built to solve.

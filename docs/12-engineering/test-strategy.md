# Test Strategy

## Unit Tests
- Status transition rules.
- Pricing calculation.
- Permission evaluation.
- Payment state mapping.

## Integration Tests
- Delivery creation through completion.
- Payment initialization through verification.
- Handoff flow across station and driver roles.
- Issue escalation and refund flow.

## UI Tests
- Sender create-delivery flow.
- Station intake and dispatch.
- Driver handoff confirmation.
- Final-mile proof capture.

## Manual UAT
- Real-world scan workflow.
- Weak-network field behavior.
- Exception handling at stations.

## Concrete Test Inventory
- unit:
  - pricing
  - lifecycle guards
  - permission checks
  - refund eligibility
- integration:
  - create -> pay -> intake -> dispatch -> receive
  - create -> pay -> doorstep -> deliver
  - create -> pay -> failed attempt -> pickup
  - refund and dispute path
  - finance admin updates active pricing -> new delivery quote uses updated route fee
- UI:
  - sender create-delivery
  - station intake
  - driver manifest handoff
  - courier proof capture

## Thresholds
- unit tests: `>= 90%` pass, blocking
- integration tests: `100%` pass on critical flows, blocking
- UI smoke tests: `100%` pass on launch flows, blocking

## CI And Release Gates
- PR gate: lint + unit tests
- merge gate: lint + unit + integration
- release gate: full suite + manual UAT sign-off
- security rules gate: `pnpm check:security-rules` must pass inside `pnpm ci:verify`
- security rules gate verifies Firebase config points to committed Firestore and Storage rules, default-deny rules remain present, protected backend-owned collections deny direct writes, pricing rules stay backend-mediated, proof assets stay backend-mediated, and critical Firestore indexes exist

## Owners
- automated test owner: `technical owner`
- manual UAT owner: `ops_admin`
- pilot validation owner: `product owner`

## Baseline Status
This file is now concrete enough to guide testing and release gating.

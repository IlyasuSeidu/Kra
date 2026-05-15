# Station Operations Model

## Operating Principle
Stations are the controlled checkpoints in the network. They are where package identity, custody, and routing become enforceable.

## Origin Station Model
1. Accept package.
2. Verify required metadata.
3. Create or confirm the digital delivery record.
4. Collect or confirm payment state.
5. Place package in an outbound queue.
6. Assign driver.
7. Confirm dispatch.

## Destination Station Model
1. Monitor incoming route and ETA.
2. Confirm arrival by scan or verified receipt.
3. Check package condition.
4. Place package in pickup queue or final-mile queue.
5. Assign doorstep courier if applicable.
6. Close station responsibilities after successful handoff.

## Required Operational Controls
- Every package needs a unique scannable identifier.
- Every operator action should be attributable to a logged-in account.
- Exceptions must stop silent progression through the workflow.

## Approved V1 Validation Decision
- Each launch station requires `5 business days` of pre-go-live validation.
- Validation is split into:
  - `2 business days` of supervised dry runs with internal staff
  - `3 business days` of controlled pilot-volume operation
- A station is not go-live ready unless it passes all of the following:
  - all active operators can sign in and perform their assigned flows
  - intake, dispatch, and destination receipt are completed with audit logs on test and controlled live packages
  - scan or manual fallback success is at least `95%`
  - no unresolved `p1` incident exists at the station
  - issue escalation and refund handoff can be demonstrated on at least one test case
  - station opening hours, package storage, and handoff ownership are confirmed in practice

## Recommended Station Metrics
- Packages received per shift.
- Dispatch turnaround time.
- Receipt confirmation lag.
- Exception rate.
- Failed scan rate.

## Approved Station Staffing Model
- Each launch station operates with:
  - `1` station lead
  - `1` queue operator during all open hours
  - `1` second operator during peak intake and dispatch windows
- The same `station_operator` product role is used for lead and queue operators; responsibility split is operational, not technical.

## Opening Hours And Queue Rules
- Standard station hours: `07:00` to `19:00` local time, `7` days a week during the pilot.
- Same-day dispatch target applies only to packages received before `15:00` and cleared for payment and routing.
- Required queue buckets:
  - `intake_pending`
  - `outbound_ready`
  - `driver_assigned`
  - `inbound_pending_receipt`
  - `pickup_ready`
  - `final_mile_ready`
  - `exception_hold`

## Scan And Hardware Model
- Every package must receive a printed or handwritten scannable ID label.
- Primary hardware:
  - Android handset per active operator
  - phone camera scan as the default scanning method
- Optional hardware:
  - Bluetooth barcode or QR scanner for peak-volume stations
- Manual code entry remains a supported fallback with supervisor visibility.

## Overload And Escalation Rule
- First owner of station overload is the `station_lead`.
- If queue age exceeds the station threshold or receipt backlog exceeds `30 minutes`, the case escalates to `ops_admin`.
- If a station cannot safely receive new packages, the station lead may place the station into intake restriction mode with ops-admin approval.

## Baseline Status
This file is now concrete enough to drive station staffing, queue design, hardware planning, and readiness checks.

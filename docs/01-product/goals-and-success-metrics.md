# Goals And Success Metrics

## Product Goals
- Make the end-to-end package lifecycle visible to all authorized parties.
- Reduce loss and misrouting caused by undocumented handoffs.
- Improve operational speed at stations through role-focused workflows.
- Make payments, receipts, and refunds traceable.
- Give admins enough data to improve performance station by station.

## Business Goals
- Reach operational credibility before broad expansion.
- Prove that digitized station logistics can outperform informal coordination.
- Build a repeatable operating model that can expand route by route.

## Recommended Launch Metrics
These are recommended baseline targets for a pilot or early launch, not externally committed promises.

### Reliability
- Delivery completion rate: `>= 97%`
- Lost package rate: `< 0.5%`
- Handoff mismatch rate: `< 1%`

### Speed
- On-time dispatch from origin station: `>= 90%`
- On-time destination receipt confirmation: `>= 95%`
- Median support acknowledgement time: `< 15 minutes` during operating hours

### Customer Trust
- Deliveries with visible timeline history: `100%`
- Successful payment receipt generation: `100%`
- Refund resolution within policy window: `>= 90%`

### Operations
- Station operator scan-confirmation adoption: `>= 95%`
- Driver app check-in rate per assignment: `>= 95%`
- Doorstep proof-of-delivery capture rate: `>= 98%`

## Leading Indicators
- Search usage in tracking workflows.
- Number of issue reports per 100 deliveries.
- Average number of manual interventions per delivery.
- Number of status transitions completed without admin involvement.

## Lagging Indicators
- Repeat sender rate.
- Monthly active stations.
- Revenue per completed delivery.
- Net dispute cost by route or station.

## Approved V1 KPI Definitions
### Reliability
- Delivery completion rate:
  - definition: completed deliveries divided by deliveries that entered transport
  - target: `>= 97%`
  - owner: `ops_admin`
  - cadence: `weekly`
- Lost package rate:
  - definition: deliveries confirmed lost divided by deliveries that entered transport
  - target: `<= 0.5%`
  - owner: `ops_admin`
  - cadence: `weekly`
- Handoff mismatch rate:
  - definition: deliveries with unresolved custody conflict divided by deliveries with at least one handoff
  - target: `<= 1%`
  - owner: `ops_admin`
  - cadence: `weekly`

### Speed
- On-time dispatch from origin:
  - definition: deliveries dispatched within station cutoff divided by deliveries received before cutoff
  - target: `>= 90%`
  - owner: `station_lead`
  - cadence: `daily`
- On-time destination receipt confirmation:
  - definition: arrivals confirmed within `30 minutes` of station receipt
  - target: `>= 95%`
  - owner: `station_lead`
  - cadence: `daily`
- Median support acknowledgement time:
  - definition: median time from issue creation to first human response during support hours
  - target: `< 15 minutes`
  - owner: `support_admin`
  - cadence: `daily`

### Customer Trust
- Deliveries with visible timeline history:
  - definition: deliveries with at least one customer-visible event after creation
  - target: `100%`
  - owner: `engineering`
  - cadence: `weekly`
- Successful receipt generation:
  - definition: successful payment receipts divided by confirmed payments
  - target: `100%`
  - owner: `finance_admin`
  - cadence: `weekly`
- Refund resolution within policy window:
  - definition: approved refunds completed inside SLA divided by approved refunds
  - target: `>= 90%`
  - owner: `finance_admin`
  - cadence: `weekly`

### Operations
- Station scan-confirmation adoption:
  - definition: station handoffs completed by scan divided by all station handoffs
  - target: `>= 95%`
  - owner: `station_lead`
  - cadence: `weekly`
- Driver app check-in rate:
  - definition: assignments with at least one driver confirmation event divided by assigned runs
  - target: `>= 95%`
  - owner: `ops_admin`
  - cadence: `weekly`
- Doorstep proof capture rate:
  - definition: completed doorstep deliveries with accepted proof divided by completed doorstep deliveries
  - target: `>= 98%`
  - owner: `ops_admin`
  - cadence: `weekly`

## Pilot Baseline Rule
- Until `30 days` of pilot data exist, the targets above are treated as launch thresholds and management baselines.
- After the first `30 days`, targets may be revised only through a new decision-log entry and KPI review.

## Reporting Cadence
- Daily station review: dispatch, receipt, queue, and incident metrics
- Weekly operations review: reliability, refund, and proof metrics
- Monthly route review: growth, repeat sender, and dispute-cost metrics

## Baseline Status
This file is now concrete enough to align analytics, operations, support, and launch reporting.

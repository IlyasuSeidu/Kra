# Dashboard Metrics

## Sender Metrics
- Active deliveries.
- Status distribution.
- Recent payments.
- Open issues.

## Driver Metrics
- Current run.
- Packages on board.
- Completed assignments.
- Earnings.

## Station Metrics
- Packages awaiting dispatch.
- Packages awaiting receipt.
- Packages awaiting final-mile assignment.
- Delayed items.

## Admin Metrics
- Network-wide status mix.
- Top delayed routes.
- Issue volume.
- Payment success and refund totals.

## Approved Metric Sources
- delivery metrics: `deliveries` and `delivery_events`
- payment metrics: `payments` and `payment_events`
- issue metrics: `support_issues`
- earnings metrics: `earning_events`

## Refresh Cadence
- sender home: on screen open plus pull-to-refresh
- station and ops dashboards: every `60 seconds`
- admin dashboards: every `5 minutes`

## Role Visibility
- sender sees only own delivery, payment, and issue metrics
- driver sees only assigned-run and own-earnings metrics
- station sees only station-scoped queue and delay metrics
- admin sees network-wide metrics

## Correctness Acceptance
- dashboard counts must match source-of-truth queries within `1%`
- payment and refund totals must match reconciliation records exactly

## Baseline Status
This file is now concrete enough to implement dashboard queries and refresh behavior.

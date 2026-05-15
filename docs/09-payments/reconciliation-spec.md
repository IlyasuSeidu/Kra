# Reconciliation Spec

## Required Records
- Quoted amount.
- Final charged amount.
- Provider name and reference.
- Internal payment ID.
- Delivery ID.
- Refund reference where applicable.

## Reconciliation Goals
- Detect missing callbacks.
- Detect duplicate charges.
- Match provider settlements against internal success records.
- Track refund liability and unresolved finance issues.

## Recommended Frequency
- Daily automated reconciliation.
- Weekly manual review for anomalies and unresolved mismatches.

## Approved V1 Decisions
- Finance owns daily reconciliation review.
- Backend engineering owns reconciliation job reliability and unmatched-event visibility.
- Provider truth and internal truth must both be reviewed; neither alone is sufficient when they conflict.
- Unmatched or conflicting payment events must be escalated within the next business day.
- The v1 reconciliation output is a daily `CSV` export plus an admin queue for unmatched provider events.
- The CSV must include at least:
  - business date
  - provider
  - provider reference
  - internal payment ID
  - delivery ID
  - quoted amount
  - charged amount
  - refunded amount
  - internal payment status
  - provider payment status
  - mismatch type
  - reviewed by
  - reviewed at
- The automated reconciliation job should run once each day before `06:00` local time.
- Finance review target is by `10:00` on the same business day.
- Any single mismatch of `GHS 50` or more, any duplicate charge, or `3` or more unmatched events from the same provider in `24 hours` must raise an alert.
- Provider settlement records are the source of truth for whether money moved.
- Internal delivery and payment records are the source of truth for whether service entitlement should have progressed.

## Baseline Status
This file is now concrete enough to support daily finance review, mismatch alerting, provider-event investigation, and implementation of the pilot reconciliation job.

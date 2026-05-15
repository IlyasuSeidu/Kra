# Fraud And Abuse Prevention

## Main Risk Areas
- False completion claims.
- Missing packages with no valid custody record.
- Duplicate or fabricated scans.
- Payment chargebacks tied to weak delivery evidence.

## Controls
- Mandatory handoff evidence.
- Duplicate scan detection.
- Role-scoped visibility.
- Proof-of-delivery capture.
- Manual review path for suspicious overrides and refund claims.

## Monitoring Signals
- Repeated issue reports by actor.
- Unusual refund rates by route.
- Same device or user generating abnormal completion volume.

## Approved Thresholds
- `3` substantiated delivery complaints against the same actor in `30 days`
- `3` unmatched provider payment events from the same actor or route in `24 hours`
- duplicate scan rate above `2%` per actor in a rolling week
- repeated fallback-proof usage above `20%` of a courier's deliveries in a week

## Fraud Review Workflow
- First owner: `ops_admin` for operational fraud
- First owner: `finance_admin` for payment fraud
- Escalation owner: `super_admin`

## Restriction Evidence Rule
- No staff restriction may occur without:
  - linked delivery IDs
  - event or payment evidence
  - human review note

## Appeals Rule
- Staff may request review through admin channel within `5 business days`.
- Reinstatement requires super-admin approval and reason logging.

## Baseline Status
This file is now concrete enough to support fraud thresholds and review workflow.

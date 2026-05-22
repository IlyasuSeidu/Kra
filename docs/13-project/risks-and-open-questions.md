# Risks And Decision Record

## Main Risks

- Too much launch scope too early.
- Weak station discipline undermining product trust.
- Payment complexity outrunning operational maturity.
- Poor network conditions affecting field adoption.
- Ambiguous ownership of disputes and refunds.

## Resolved Product Decisions

- No product-scope decision remains unresolved on the critical path.

## Recommended Next Answers

- Confirm pilot staffing at each launch station.
- Confirm named ops owners for each launch station.
- Confirm the exact day-by-day validation schedule for each launch station.

## Risk Ranking

- `P1`: weak station discipline undermining product trust
- `P1`: payment complexity outrunning operational maturity
- `P2`: poor network conditions affecting field adoption
- `P2`: too much launch scope too early
- `P2`: ambiguous ownership of disputes and refunds

## Owners And Deadlines

- station staffing and named owner confirmation:
  - owner: `product owner`
  - deadline: `before Phase 6 validation`
- exact day-by-day validation schedule:
  - owner: `ops_admin`
  - deadline: `before Phase 6 validation`
- payment go-live readiness:
  - owner: `finance_admin`
  - deadline: `before Phase 5 completion`

## Mitigation Plans

- weak station discipline:
  - mitigation: fixed validation window, station lead ownership, audit-first workflows
- payment complexity:
  - mitigation: MTN-only launch, reconciliation queue, dispatch gate
- weak network:
  - mitigation: offline outbox for operational users, manual fallback paths
- launch scope:
  - mitigation: explicit launch blocks and phased rollout
- dispute ownership:
  - mitigation: named admin subroles and issue-routing rules

## Baseline Status

This file is now concrete enough to guide risk tracking and launch-readiness review.

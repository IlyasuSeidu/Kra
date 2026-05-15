# Architecture Decision Records

## Purpose
The high-level `decision-log.md` records business and launch decisions. This ADR system records deeper engineering decisions with enough context to defend them later.

## Repository Location
- ADR files live under `docs/14-platform/adrs/`
- file naming pattern:
  - `ADR-0001-title.md`
  - `ADR-0002-title.md`

## ADR When Required
- changing database shape in a non-trivial way
- changing deployment topology
- changing auth or authorization strategy
- introducing or replacing a major provider
- changing event-delivery guarantees
- introducing new country-expansion architecture

## ADR Template
- title
- status
- date
- context
- decision
- consequences
- alternatives considered
- rollback or migration plan

## Status Values
- proposed
- accepted
- superseded
- rejected
- deprecated

## Review Rule
- structural platform ADRs require `technical owner`
- payment ADRs require `technical owner` plus `finance_admin`
- operational workflow ADRs require `technical owner` plus `ops_admin`

## Relationship To Decision Log
- `decision-log.md` remains the concise active baseline
- ADRs hold deeper engineering rationale and tradeoffs
- if they conflict, the most recent accepted ADR plus corresponding decision-log update wins

## Baseline Status
This file is now concrete enough to govern architecture decision history and change control.

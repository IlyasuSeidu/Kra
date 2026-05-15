# SLO And SLA

## Purpose
This document defines the reliability targets for `Kra` as an engineering system. These are internal operating commitments unless a customer-facing contract explicitly supersedes them.

## Service Tiers
### Tier 0
- delivery state mutation APIs
- payment initialization and verification
- payment webhook ingestion
- authentication for operational users

### Tier 1
- sender tracking reads
- station queue reads
- admin dashboards
- notifications fan-out

### Tier 2
- analytics dashboards
- AI staff tooling
- exports and non-urgent reports

## Monthly Availability SLOs
- Tier 0 API availability: `99.95%`
- Tier 1 read and dashboard availability: `99.90%`
- Tier 2 tooling availability: `99.50%`

## Latency SLOs
- Tier 0 authenticated reads: `p95 <= 500ms`
- Tier 0 authenticated writes: `p95 <= 900ms`
- tracking public reads: `p95 <= 700ms`
- admin overview queries: `p95 <= 2.5s`
- payment webhook acknowledgement after durable persistence: `p95 <= 2s`

## Correctness SLOs
- unauthorized state mutations accepted: `0`
- payment-confirmed dispatch bypasses: `0`
- duplicate payment settlement caused by Kra processing: `0`
- missing audit event on critical state change: `0`

## Queue And Event SLOs
- delivery projection lag: `p95 <= 60s`
- webhook retry queue age: `p95 <= 5m`
- dead-letter backlog on critical payment flows: `0` unresolved past `1 business day`

## Notification SLOs
- sender push for critical delivery milestones: `99%` within `2 minutes`
- receiver SMS for pickup or final-mile milestones: `99%` within `5 minutes`

## Customer-Facing SLA Rule
- No broad public contractual uptime SLA is promised during the pilot.
- Public route promises must remain operationally conservative and must not imply global platform guarantees that the business is not prepared to support.

## Error Budget Policy
- Tier 0 monthly error budget: `21.6 minutes`
- Tier 1 monthly error budget: `43.2 minutes`
- If Tier 0 error budget burn exceeds `50%` before mid-month:
  - freeze non-critical feature releases
  - prioritize reliability work
- If Tier 0 error budget is exhausted:
  - only bug fixes, reliability fixes, and compliance changes may ship

## Measurement Rule
- Availability is measured at the service edge, not by best-effort client retries.
- External provider outages are tracked separately from Kra-controlled availability, but customer experience impact must still be reported.

## Incident Severity Link
- `P1`: any event threatening Tier 0 SLO or correctness guarantees
- `P2`: serious degradation of Tier 1 workflows
- `P3`: non-critical degradation or cosmetic failure

## Review Cadence
- daily SLO dashboard review during pilot
- weekly error-budget review
- monthly target adjustment review only through decision-log update

## Baseline Status
This file is now concrete enough to govern reliability expectations, release freezes, and incident prioritization.

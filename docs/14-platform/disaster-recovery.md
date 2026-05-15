# Disaster Recovery

## Purpose
This document defines how `Kra` restores service, data, and operational control after serious platform failure.

## Launch DR Model
- v1 uses a single primary deployment region for live traffic
- v1 uses cross-region backup and restore, not active-active multi-region serving
- promotion to active-active or multi-region write topology is deferred until traffic and legal needs justify it

## Recovery Targets
- Tier 0 service RTO: `4 hours`
- Tier 0 data RPO: `15 minutes` where point-in-time recovery exists
- fallback RPO on nightly exports only: `24 hours`
- admin and analytics RTO: `8 hours`

## Backup Strategy
- Firestore point-in-time recovery enabled where supported
- daily Firestore export to secondary-region storage
- Cloud Storage versioning enabled for proof assets
- secrets and configuration backed up through managed cloud secret tooling and infra-as-code

## Disaster Scenarios
### Application Deployment Failure
- rollback to prior healthy Cloud Run revision
- verify auth, intake, dispatch, and tracking before reopen

### Firestore Data Corruption
- stop write traffic
- assess corruption window
- restore from point-in-time or last clean export
- replay recoverable event streams if possible

### Payment Callback Pipeline Failure
- preserve raw inbound payloads
- restore ingestion endpoint
- replay durable stored webhook records
- reconcile unresolved provider events before reopening normal flow

### Storage Asset Loss Or Misconfiguration
- restore asset access from versioned storage or backup copy
- keep delivery timeline and audit metadata available even if asset fetch is temporarily degraded

## DR Command Structure
- incident commander: `technical owner`
- payments recovery lead: `finance_admin`
- operations coordination lead: `ops_admin`
- communications owner: `product owner`

## DR Drills
- run quarterly disaster-recovery drill
- alternate focus:
  - service rollback
  - database restore
  - payment replay
  - storage asset recovery

## Acceptance Rule
- no production standard claim is credible until at least one full DR drill has been completed and documented

## Baseline Status
This file is now concrete enough to guide backup policy, recovery ownership, and DR readiness.

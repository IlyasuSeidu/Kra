# Release Plan

## Phase 0
- Internal prototype.
- Validate the delivery lifecycle and data model.

## Phase 1
- Controlled pilot with a small number of routes and stations.
- Limit service scope to operationally manageable corridors.

## Phase 2
- Add production payment flow and stronger support workflows.
- Introduce final-mile in selected zones.

## Phase 3
- Expand routes, improve analytics, and layer in AI support features.

## Launch Rule
Do not widen route coverage until operational discipline is proven on the current network.

## Approved V1 Pilot Readiness Decisions
- Pilot go-live requires `5 business days` of validation at each launch station before public launch volume is opened.
- Validation must include:
  - `2 business days` of supervised dry-run execution
  - `3 business days` of controlled pilot-volume execution
- Public launch is blocked if any launch station fails readiness.
- Controlled pilot volume should stay capped until all three stations complete readiness checks.
- Backend launch gating is read from `GET /v1/admin/launch-readiness`; release approval must not rely on frontend-only status aggregation.

## Rollout Communications Plan
- internal pilot brief before station validation
- station readiness confirmation before public pilot volume
- sender-facing announcement only after all three stations pass readiness

## Rollback Readiness
- rollback plan must exist for:
  - api service
  - ai service
  - firebase rules
  - admin client
- no release proceeds without named rollback owner

## Incident Readiness
- live monitoring must be enabled before pilot volume opens
- `P1` contact chain must be documented and reachable

## Baseline Status
This file is now concrete enough to guide release readiness.

# Implementation Roadmap

## Delivery Cadence
- Sprint length: `2 weeks`
- Execution baseline starts: `2026-04-27`
- Delivery model: `AI-assisted primary implementation with part-time human review`

## Staffing Baseline
- `1` product and operations decision-maker: user
- `1` primary implementation owner: Codex-assisted build workflow
- `0.5` design review capacity: part-time
- `0.5` operations validation capacity: part-time during pilot prep

## Phase 0: Decision Freeze And Repo Setup
### Window
- `2026-04-23` to `2026-04-26`

### Scope
- Freeze launch routes, pricing, lifecycle, payment order, and API direction.
- Prepare repo scaffold and shared vocabulary.

### Exit Criteria
- Critical-path docs are resolved.
- Repo structure is approved.
- First build backlog is ordered.

## Phase 1: Foundations
### Window
- `2026-04-27` to `2026-05-10`

### Scope
- Set up repo, environments, auth, and shared types.
- Implement delivery entities, canonical statuses, and API scaffolding.

### Dependencies
- Frozen lifecycle and API decisions.
- Firebase project setup.

### Exit Criteria
- Auth works end-to-end.
- Delivery records can be created and retrieved.
- Shared types compile across backend and client.

## Phase 2: Customer And Station Core
### Window
- `2026-05-11` to `2026-05-24`

### Scope
- Build sender create-delivery flow and quote generation.
- Build station intake, outbound queue, and dispatch confirmation.

### Dependencies
- Pricing table finalized.
- Station workflow approved.

### Exit Criteria
- Sender can create a priced delivery.
- Station can intake and dispatch with audit logging.
- Timeline reflects these actions.

## Phase 3: Driver Transport Workflow
### Window
- `2026-05-25` to `2026-06-07`

### Scope
- Build driver assignment, manifest, and transport updates.
- Build destination receipt workflow.

### Dependencies
- Driver role provisioning available.
- Handoff proof rules approved.

### Exit Criteria
- Driver can complete inter-station transport.
- Destination station can confirm receipt.
- Tracking updates correctly through transit.

## Phase 4: Final-Mile Completion
### Window
- `2026-06-08` to `2026-06-21`

### Scope
- Build final-mile assignment.
- Build proof-of-delivery flow.
- Implement failed-attempt and pickup fallback logic.

### Dependencies
- Final-mile zone rules confirmed.
- Proof method baseline approved.

### Exit Criteria
- Courier can complete or fail delivery with structured proof.
- Failed final-mile attempts return to the pickup flow correctly.

## Phase 5: Payments, Support, And Admin
### Window
- `2026-06-22` to `2026-07-05`

### Scope
- Integrate `MTN MoMo` as the first production payment path.
- Build issue reporting and escalation.
- Build web-first admin dashboards for deliveries, stations, and issues.

### Dependencies
- MTN MoMo credentials and callback setup.
- Admin web client baseline confirmed.

### Exit Criteria
- Payment initialization and verification work.
- Issues can be created and escalated.
- Admin can inspect live deliveries and issues.

## Phase 6: Hardening And Pilot Preparation
### Window
- `2026-07-06` to `2026-07-19`

### Scope
- Add analytics instrumentation.
- Add basic AI-assisted support tooling.
- Improve offline resilience and operational polish.
- Prepare pilot checklist for the three launch stations.
- Run station validation at each launch station.

### Dependencies
- Stable core flows from earlier phases.
- Station validation time available.

### Exit Criteria
- Pilot checklist passes.
- Metrics dashboard is live.
- Launch stations and routes are configured and ready.
- Each launch station completes `5 business days` of validation:
  - `2 business days` dry run
  - `3 business days` controlled pilot volume
- No launch station has an unresolved `p1` incident.
- Receiver delivery-link access and SMS-based notifications are verified end-to-end.

## Critical Path
1. lifecycle and status model
2. quote and pricing engine
3. sender create-delivery flow
4. origin intake and dispatch
5. driver transport updates
6. MTN MoMo verification
7. proof-of-delivery and admin review

## Baseline Status
This roadmap is now concrete enough to guide sequencing, staffing assumptions, and pilot readiness.

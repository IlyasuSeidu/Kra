# Task Breakdown

## Product
- Owner: `user`
- Sequence: `Phase 0 -> Phase 1`
- Tasks:
  - confirm launch routes and station model
  - confirm pricing tables
  - confirm refund, cancellation, and issue policy boundaries

## Design
- Owner: `Codex + user review`
- Sequence: `Phase 1 -> Phase 2`
- Tasks:
  - produce wireframes
  - produce component inventory
  - define high-risk states and empty states

## Engineering
- Owner: `Codex`
- Sequence: `Phase 1 -> Phase 6`
- Tasks:
  - scaffold repo and environments
  - implement auth and role provisioning
  - implement delivery lifecycle
  - implement handoff logging
  - implement MTN MoMo integration
  - implement admin reporting

## Operations
- Owner: `user`
- Sequence: `Phase 4 -> Phase 6`
- Tasks:
  - prepare station onboarding checklist
  - define support ownership
  - define launch-day monitoring dashboard
  - prepare pilot route readiness checks

## Critical Path Tasks
1. implement delivery creation and quote generation
2. implement origin intake and dispatch
3. implement driver transport updates
4. implement destination receipt
5. implement MTN MoMo verification
6. implement proof-of-delivery and admin issue review

## Completion Rule
- A task is complete only when:
  - the code path exists
  - the main acceptance case passes
  - the related doc is updated if behavior changed

## Baseline Status
This task breakdown is now specific enough for sprint planning and critical-path execution.

# Branch Protection And CODEOWNERS

## Purpose
This document defines the repository governance rules that protect `main` from low-signal changes, insecure merges, and orphaned ownership.

## Branch Protection Rules For `main`
- direct pushes disabled
- force push disabled
- branch deletion blocked
- required linear history preferred
- required status checks must pass before merge
- stale approvals dismissed after relevant code changes
- conversation resolution required before merge

## Review Minimums
- ordinary changes: `1` approving review
- Tier 0 or security-sensitive changes: `2` approving reviews
- payment, auth, permissions, and state-machine changes always require one review from the `technical owner`

## Required Status Checks
- lint
- typecheck
- unit tests
- integration tests
- build
- secret scan
- dependency scan

## CODEOWNERS Policy
- `services/api/` -> `technical owner`
- `services/ai/` -> `technical owner`
- `apps/mobile/` -> `technical owner` plus `product owner` for high-impact UX areas
- `apps/admin/` -> `technical owner` plus `support_admin` for workflow-sensitive admin surfaces
- `packages/shared/` -> `technical owner`
- `docs/` -> `product owner` plus `technical owner`

## Emergency Override
- emergency merge without full standard approvals is allowed only for `P1` remediation
- emergency override must produce:
  - incident reference
  - post-merge review
  - follow-up retrospective item

## Tag And Release Rule
- production releases use annotated tags
- release notes must include changed services, rollback target, and verification checklist reference

## Baseline Status
This file is now concrete enough to support GitHub governance and ownership boundaries.

# CI CD Governance

## Purpose
This document defines how code moves from branch to staging to production with strong automation, auditable approvals, and release discipline.

## Platform
- source control: `GitHub`
- CI: `GitHub Actions`
- mobile build pipeline: `EAS`
- deployment target: managed cloud deployment with staged promotion

## Branch Model
- `main`: protected production candidate branch
- `release/*`: release stabilization branches when needed
- `hotfix/*`: emergency repair branches
- feature branches: short-lived PR branches only

## Required Checks On Pull Requests
- install integrity
- lint
- typecheck
- unit tests
- integration tests for affected modules
- secret scanning
- dependency vulnerability scanning
- build verification for impacted apps or services

## Coverage Policy
- payment, auth, permissions, pricing, refunds, and state-transition modules: `100%` line and branch coverage required
- backend domain services overall: `>= 90%`
- shared validation and schema packages: `>= 95%`
- UI code is not held to a fake blanket `100%`; instead it must pass route smoke tests and critical-flow tests

## Deployment Promotion Flow
- PR merge -> staging deployment
- staging validation -> release approval
- signed release tag -> production deployment
- post-deploy verification -> release completion

## Approval Policy
- standard release: `technical owner` plus `product owner`
- payment-affecting release: `technical owner` plus `finance_admin`
- auth or permissions release: `technical owner` plus `ops_admin`

## Freeze Rules
- Tier 0 error-budget exhaustion freezes feature releases
- unresolved `P1` freezes production release
- country-launch freeze applies during first `72 hours` after new-country go-live unless hotfix required

## Environment Rules
- development, staging, and production must remain isolated
- staging callbacks and provider credentials must never point at production assets
- preview environments are required for admin-web changes and strongly preferred for API-affecting PRs

## Baseline Status
This file is now concrete enough to guide CI/CD setup, release approvals, and coverage gates.

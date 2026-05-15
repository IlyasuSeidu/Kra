# Kra

`Kra` is a delivery operating system for Africa, beginning with a Ghana-first pilot and designed for continent-scale growth.

## Repository Surfaces
- `apps/web`: public-facing web pages, landing pages, trust/legal pages, partner pages, and public tracking entry points
- `apps/mobile`: sender, driver, station, and final-mile mobile shells
- `apps/admin`: admin web surface
- `services/api`: delivery, payment, issue, notification, and admin backend
- `services/ai`: AI service for staff-only support and summarization workflows
- `packages/shared`: critical domain logic, schemas, and shared types
- `packages/config`: repository configuration and standards references

## Enforcement Baseline
- protected-branch and CODEOWNERS governance through GitHub config
- local git hooks through `husky`
- CI through `GitHub Actions`
- risk-based coverage enforcement with strict `100%` coverage on critical domain modules
- staged promotion, release gating, and documented rollback expectations

## Getting Started
1. `pnpm install`
2. `pnpm ci:verify`
3. review `.github/CODEOWNERS` and widen ownership from a single account to real teams when collaborators join
4. push to GitHub and enable branch protection or rulesets

## Critical Quality Rule
Payments, auth, permissions, pricing, refunds, and state transitions are treated as zero-shortcut areas. Any change in those modules must keep tests, coverage, and docs aligned.

## Public Web Baseline
The public web surface is part of the core product, not a marketing afterthought. The repository baseline includes landing, pricing, tracking, support, coverage, partner, privacy, and terms surfaces because trust, discoverability, and receiver clarity are product requirements for delivery at African scale.

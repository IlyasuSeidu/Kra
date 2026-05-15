# Coding Standards

## Domain Standards
- Use names that match the delivery business model.
- Keep lifecycle and payment logic explicit.
- Avoid hidden side effects in status transitions.

## API Standards
- Validate input at the boundary.
- Return stable error codes.
- Make writes idempotent where retries are plausible.

## Frontend Standards
- Prefer predictable data flow over clever abstraction.
- Keep role logic out of presentation components when possible.
- Treat forms and queue views as first-class operational surfaces.

## High-Scrutiny Areas
- Payments.
- Handoff events.
- Auth and permissions.
- Admin overrides.

## Approved Toolchain Standards
- package manager: `pnpm`
- language mode: `TypeScript strict`
- linting: `ESLint`
- formatting: `Prettier`
- commit format: `Conventional Commits`

## High-Risk Review Checklist
- permissions enforced on backend
- status transition idempotency
- payment callback replay safety
- audit event emitted where required
- no client secret exposure

## Definition Of Done
- code implemented
- tests added or updated
- docs updated if behavior changed
- lint and test pass

## Baseline Status
This file is now concrete enough to guide code quality and review expectations.

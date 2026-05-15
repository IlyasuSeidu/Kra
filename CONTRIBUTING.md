# Contributing

## Branching
- work from short-lived feature branches
- do not push directly to `main`
- use `hotfix/*` only for urgent production repair

## Required Before Review
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:coverage`
- `pnpm check:critical-coverage`

## Definition Of Done
- behavior implemented
- docs updated if behavior changed
- tests added or adjusted
- no broken coverage gate on critical modules

## Review Focus
- payment safety
- authorization boundaries
- lifecycle correctness
- audit logging
- low-bandwidth and offline behavior for operational surfaces


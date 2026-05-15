# Repo Structure

## Recommended Layout
- `apps/web`
- `apps/mobile`
- `apps/admin`
- `services/api`
- `services/ai`
- `packages/shared`
- `docs`

## Intent Of Each Area
### `apps/web`
- Public landing pages, marketing pages, and public tracking entry points.

### `apps/mobile`
- Sender, driver, station, and final-mile surfaces.

### `apps/admin`
- Admin dashboards and internal tools if desktop-first.

### `services/api`
- Delivery lifecycle, payments, issues, notifications, and admin endpoints.

### `services/ai`
- Prompt orchestration, summarization, and AI-specific evaluations.

### `packages/shared`
- Types, status constants, validation schemas, and client-server shared helpers.

## Approved Repository Decision
- `Kra` uses a `pnpm` monorepo.

## Final Layout
- `apps/web`
- `apps/mobile`
- `apps/admin`
- `services/api`
- `services/ai`
- `packages/shared`
- `packages/config`
- `docs`

## Ownership
- `apps/web`: product owner plus technical owner
- `apps/mobile`: product owner plus technical owner
- `apps/admin`: support and ops review plus technical owner
- `services/api`: technical owner
- `services/ai`: technical owner
- `packages/shared`: technical owner

## Scaffolding Rule
- Implementation starts only from this monorepo layout unless a new decision supersedes it.

## Baseline Status
This file is now concrete enough to scaffold the repository.

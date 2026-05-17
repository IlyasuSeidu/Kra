# Deployment Runbook

## Setup Order
1. Create Firebase environments.
2. Configure auth.
3. Deploy database rules.
4. Deploy Node.js services.
5. Deploy Python AI services.
6. Configure payment callbacks.
7. Configure mobile environment values.

## Release Checklist
- Secrets present.
- `pnpm check:api-env:staging` or `pnpm check:api-env:production` passes against the target environment.
- `pnpm --filter @kra/api check:launch-bootstrap` confirms launch bootstrap payload shape.
- Rules deployed.
- `pnpm check:security-rules` passes against committed `firebase.json`, `firestore.rules`, `storage.rules`, and `firestore.indexes.json`.
- Launch station and active pricing defaults have been bootstrapped with `pnpm --filter @kra/api bootstrap:launch-data` when the environment is new.
- `pnpm check:api-runtime-imports` passes after build, proving the compiled API artifact can be imported by Node before Cloud Run deployment.
- Callback URLs verified.
- Monitoring enabled.
- Rollback plan available.

## Approved Delivery Pipeline
- CI platform: `GitHub Actions`
- Mobile preview builds: `EAS`
- Backend deploy target: `Cloud Run`
- Admin web deploy target: static or managed web hosting behind CI release job

## Expected Commands
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm check:api-runtime-imports`
- `pnpm check:backend-readiness`
- `pnpm deploy:rules:staging`
- `pnpm deploy:api:staging`
- `pnpm deploy:ai:staging`
- `pnpm deploy:admin:staging`

## Production Verification
- auth works
- station intake works
- payment callback path verified
- delivery timeline updates visible
- admin issue queue accessible
- `GET /v1/admin/launch-readiness` returns `ready` before opening public pilot volume

## Rollback Rule
- rules rollback to previous tagged ruleset
- api and ai rollback to previous successful Cloud Run revision
- admin rollback to previous deployed artifact

## Ownership
- release approval: `technical owner` plus `product owner`
- production access: limited to `technical owner` and designated admin

## Baseline Status
This file is now concrete enough to support deployment planning and release control.

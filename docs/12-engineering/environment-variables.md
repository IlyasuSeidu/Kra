# Environment Variables

## Core Variables
- Firebase project configuration
- Firebase service account credentials for backend use
- OpenAI API key
- Vertex AI credentials and project settings
- MTN MoMo credentials
- Hubtel credentials
- Paystack credentials
- Maps provider key

## Environment Rule
- Never expose server-only secrets in the mobile client bundle.
- Separate development, staging, and production credentials.

## Recommended Organization
- Public client config in app-safe variables.
- Secret provider credentials only in backend environments.
- Distinct callback URLs per environment.

## Exact Variable Names
### Public Mobile
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_BASE_URL`

### Backend Secret
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`
- `FIRESTORE_EMULATOR_HOST`
- `API_PORT`
- `INTERNAL_TASK_SHARED_SECRET`
- `MTN_MOMO_BASE_URL`
- `MTN_MOMO_COLLECTION_PRIMARY_KEY`
- `MTN_MOMO_API_USER`
- `MTN_MOMO_API_KEY`
- `MTN_MOMO_TARGET_ENV`
- `MTN_MOMO_WEBHOOK_SHARED_SECRET`
- `HUBTEL_SMS_BASE_URL`
- `HUBTEL_SMS_CLIENT_ID`
- `HUBTEL_SMS_CLIENT_SECRET`
- `HUBTEL_SMS_FROM`
- `PUBLIC_TRACKING_BASE_URL`
- `SENTRY_DSN`

### Backend Bootstrap Only
- `KRA_BOOTSTRAP_SUPER_ADMIN_USER_ID`
- `KRA_BOOTSTRAP_SUPER_ADMIN_FULL_NAME`
- `KRA_BOOTSTRAP_SUPER_ADMIN_EMAIL`
- `KRA_BOOTSTRAP_SUPER_ADMIN_PHONE`
- `KRA_BOOTSTRAP_NOW`

## Secret Storage Rule
- All backend secrets live in cloud secret storage.
- No backend secret may be committed or placed in mobile runtime config.
- Rotation owner: `technical owner`

## Environment Ownership
- development: `technical owner`
- staging: `technical owner`
- production: `technical owner` with business-owner visibility

## Validation Rule
- CI must fail if required variables for target environment are missing.
- Deployment operators must run `pnpm check:api-env:staging` or `node scripts/check-api-env.mjs --target=production --env-path=<secure-env-file>` before deployment.
- `pnpm check:backend-readiness` runs in CI and verifies the deployment gate plus launch bootstrap dry-run.

## Backend Launch Bootstrap
- `pnpm --filter @kra/api check:launch-bootstrap` performs a dry run and prints the launch station and active pricing records that would be written.
- `pnpm --filter @kra/api bootstrap:launch-data` writes launch station defaults and the active `PRC-DEFAULT` pricing rule to Firestore.
- Existing documents are skipped by default; pass `-- --force` only after an explicit release decision.
- Super-admin bootstrap is optional and requires the `KRA_BOOTSTRAP_SUPER_ADMIN_*` variables.

## Baseline Status
This file is now concrete enough to support environment setup and deployment validation.

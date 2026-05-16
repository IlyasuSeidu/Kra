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
- `OPENAI_API_KEY`
- `VERTEX_PROJECT_ID`
- `VERTEX_LOCATION`
- `MTN_MOMO_API_KEY`
- `MTN_MOMO_API_SECRET`
- `MTN_MOMO_CALLBACK_SECRET`
- `HUBTEL_API_KEY`
- `HUBTEL_API_SECRET`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `HUBTEL_SMS_API_KEY`
- `HUBTEL_SMS_API_SECRET`
- `PUBLIC_TRACKING_BASE_URL`
- `SENTRY_DSN`

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

## Baseline Status
This file is now concrete enough to support environment setup and deployment validation.

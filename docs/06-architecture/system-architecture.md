# System Architecture

## Recommended Topology
- `Public web client` for landing pages, marketing surfaces, and public tracking entry points.
- `React Native clients` for sender, driver, station, and final-mile workflows.
- `Admin client` as either React Native for shared code or a separate web app if desktop-heavy operations dominate.
- `Node.js application layer` for delivery orchestration, permissions, payments, and notifications.
- `Python AI layer` for assistant features, issue summarization, and future automation.
- `Firebase platform services` for auth, data, file storage, and analytics collection.

## Architectural Principle
The source of truth should be the delivery event model, not UI state and not payment provider state.

## Main Data Flows
1. User action creates or updates a delivery command.
2. Node.js validates the command against role and lifecycle rules.
3. State transition is persisted.
4. A delivery event is emitted.
5. Notification, analytics, and downstream projections update from that event.

## Separation Of Concerns
- Public web owns marketing content, public tracking entry, and low-risk unauthenticated customer access.
- Clients own presentation and local workflow state.
- Node.js owns business rules and side effects.
- Python owns AI features but should not directly mutate core delivery state without an approved backend path.

## Final Deployment Topology
- `apps/web` delivered as a separate public web app
- `apps/mobile` delivered as a single Expo-based mobile app with role-aware shells
- `apps/admin` delivered as a separate React web client
- `services/api` delivered on Cloud Run
- `services/ai` delivered on Cloud Run
- Firestore as operational database
- Cloud Storage for proof assets
- Cloud Tasks for async jobs

## Client Boundary Decision
- Public web remains a separate client from admin and mobile.
- Admin remains a separate client in v1.
- Sender and operations roles share the mobile codebase but not the same runtime shell after sign-in.

## Monitoring And Incident Tooling
- backend logs and dashboards: `Google Cloud Logging` and `Google Cloud Monitoring`
- client crash reporting: `Sentry`
- product analytics: `Firebase Analytics`

## Approval Rule
- This architecture is the active implementation baseline until a later engineering owner changes it through the decision log.

## Baseline Status
This file is now concrete enough to guide deployment and platform setup.

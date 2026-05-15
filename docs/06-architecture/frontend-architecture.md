# Frontend Architecture

## Stack
- React Native
- Tailwind-style utility workflow
- Redux Toolkit for app state

## Recommended Structure
- `features/auth`
- `features/deliveries`
- `features/payments`
- `features/notifications`
- `features/support`
- `roles/sender`
- `roles/driver`
- `roles/station`
- `roles/final-mile`
- `roles/admin`

## State Management
- Keep server-sourced entities normalized.
- Keep transient form and UI state local where possible.
- Use role-aware selectors instead of duplicating delivery objects per role.

## Client Rules
- Do not let the client authoritatively decide permissions.
- Do not embed route pricing rules in several screens.
- Do not hardcode status transitions in many places; centralize them in domain helpers.

## Approved Frontend Stack Decisions
- Mobile app framework: `Expo React Native`
- Styling: `NativeWind`
- Forms: `React Hook Form + Zod`
- API client and caching: `RTK Query`
- Mobile navigation: `Expo Router`
- Admin web routing: `React Router`

## Folder Structure
- `apps/mobile/src/app`
- `apps/mobile/src/features`
- `apps/mobile/src/roles`
- `apps/mobile/src/components`
- `apps/admin/src/routes`
- `apps/admin/src/features`
- `apps/admin/src/components`
- `packages/shared`

## State Boundaries
- Server state:
  - deliveries
  - payments
  - issues
  - notifications
  live in `RTK Query`
- Local state:
  - form drafts
  - filter state
  - modal state
  stays local to screen or feature slice

## Offline Strategy
- Sender app is online-first.
- Driver, station, and courier flows use local outbox persistence for critical actions.
- Offline queue persistence uses `Expo SQLite`.
- Reads may show cached last-known state with stale marker when offline.

## Baseline Status
This file is now concrete enough to guide client scaffolding and library selection.

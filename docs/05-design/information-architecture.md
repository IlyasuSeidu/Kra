# Information Architecture

## App Structure
The product should be organized by role, but the underlying delivery object should remain consistent across all surfaces.

## Primary Areas
- Public web
- Customer app
- Driver app
- Station operations app
- Final-mile app
- Admin console

## Shared Domains
- Identity and roles
- Deliveries
- Packages
- Payments
- Issues
- Notifications
- Reports

## IA Rule
Navigation should reflect the user's job to be done, not the backend service boundary.

## Approved IA Decisions
- `Public web` is a separate unauthenticated surface for landing pages, support entry, and tracking entry.
- `Sender` uses the customer mobile app.
- `Driver`, `Station Operator`, and `Doorstep Delivery Personnel` use a shared operations mobile app with role-aware shells.
- `Admin` uses a separate web app.

## Top-Level Product Areas
- `Home`
- `Create`
- `Track`
- `History`
- `Payments`
- `Support`
- `Queues`
- `Assignments`
- `Issues`
- `Analytics`
- `Settings`

## IA Validation Rule
- Every top-level area must map directly to a job-to-be-done for that role.
- No role should need more than `2` navigation hops to reach its primary action surface.
- Implementation screen coverage is governed by `docs/05-design/frontend-screen-inventory.md`.

## Baseline Status
This file is now concrete enough to drive navigation and app-shell boundaries.

# Navigation Map

## Public Web Navigation

- Home
- How it works
- Service areas
- Coverage
- Pricing
- Trust and custody
- Track package
- Business
- Partners
- About
- Support

## Public Footer Navigation

- Delivery policy
- Refund policy
- Privacy
- Terms
- Maintenance

## Receiver Public Tracking Navigation

- Secure tracking link
- Phone verification
- OTP verification
- Tracking timeline
- Arrival instructions
- Failed attempt guidance
- Refusal information
- Expired link recovery
- Access denied

## Sender Navigation

- Home
- Create
- Track
- History
- Wallet or Payments
- Support

## Driver Navigation

- Home
- Assigned Runs
- Route
- History
- Earnings
- Support

## Station Navigation

- Overview
- Outbound
- Inbound
- Handoffs
- Reports
- Support

## Doorstep Navigation

- Home
- Assigned
- Route
- Completed
- Earnings
- Issues

## Admin Navigation

- Overview
- Deliveries
- Stations
- Users
- Finance
- Issues
- Analytics
- Settings

## Approved Launch Navigation

### Domain Enforcement Order

- `Auth/account access`
- `Sender booking lifecycle`
- `Station operations`
- `Driver lifecycle`
- `Final-mile courier lifecycle`
- `Issues, support, and disputes`
- `Notifications`
- `Admin operations`
- `Offline and recovery`
- `Public web`

### Sender

- `Home`
- `Create`
- `Quote`
- `Payment`
- `Delivery detail`
- `Track`
- `History`
- `Notifications`
- `Profile`
- `Settings`
- `Support`

### Receiver Public Flow

- `Secure tracking link`
- `Phone verification`
- `Tracking timeline`
- `Arrival instructions`
- `Failed attempt guidance`

### Driver

- `Home`
- `Assigned Runs`
- `Accept run`
- `Manifest`
- `Origin pickup scan`
- `Custody accepted`
- `Mark in transit`
- `Destination arrival`
- `Destination handoff`
- `History`
- `Earnings`
- `Support`

### Station

- `Overview`
- `Intake`
- `Outbound`
- `Inbound`
- `Handoffs`
- `Assignment`
- `Dispatch readiness`
- `Driver pickup scan`
- `Destination receipt`
- `Condition check`
- `Final-mile queue`
- `Blocked queue`
- `Reports`
- `Support`

### Doorstep

- `Home`
- `Assigned`
- `Accept assignment scan`
- `Custody accepted`
- `Out for delivery`
- `Route`
- `Proof`
- `Failed attempt`
- `Return to station`
- `Completed`
- `Earnings`
- `Issues`

### Admin

- `Overview`
- `Launch readiness`
- `Deliveries`
- `Custody`
- `Stations`
- `Users`
- `Pricing`
- `Finance`
- `Issues`
- `Audit`
- `Notifications`
- `Webhooks`
- `Analytics`
- `Export`
- `Settings`

## Hidden In Pilot

- Sender wallet tab is hidden.
- Public ratings tab does not exist.
- Advanced analytics tabs remain admin-only.
- Receiver public tracking routes are deep links and must not appear in authenticated side navigation.
- Admin export and advanced analytics remain governed screens, even when visible in metadata.

## Screen Inventory Mapping Rule

- Every navigation item must map to at least one screen in `frontend-screen-inventory.md`.
- No orphan screens may exist outside the navigation or deep-link system.
- Public web routes in `apps/web/src/index.ts` must map to `frontend-screen-inventory.md` and a public-web screen spec.
- Receiver public routes in `apps/web/src/index.ts` must map to `frontend-screen-inventory.md` and a receiver-public-flow screen spec.
- Mobile role shells in `apps/mobile/src/index.ts` must include every routed sender, driver, station, courier, auth, and shared operations screen.
- Admin surfaces in `apps/admin/src/index.ts` must include every routed admin screen.
- Tracking and custody routes must never expose internal event, actor, payment provider, or audit fields to public receiver routes.

## Baseline Status

This file is now concrete enough to drive role navigation and pilot-tab visibility.

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

### Sender

- `Home`
- `Create`
- `History`
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
- `Origin pickup scan`
- `Custody accepted`
- `Destination arrival`
- `History`
- `Earnings`
- `Support`

### Station

- `Overview`
- `Outbound`
- `Inbound`
- `Handoffs`
- `Driver pickup scan`
- `Destination receipt`
- `Final-mile queue`
- `Support`

### Doorstep

- `Home`
- `Assigned`
- `Accept assignment scan`
- `Out for delivery`
- `Completed`
- `Earnings`
- `Issues`

### Admin

- `Overview`
- `Deliveries`
- `Custody`
- `Stations`
- `Finance`
- `Issues`
- `Audit`
- `Users`
- `Settings`

## Hidden In Pilot

- Sender wallet tab is hidden.
- Public ratings tab does not exist.
- Advanced analytics tabs remain admin-only.
- Receiver public tracking routes are deep links and must not appear in authenticated side navigation.

## Screen Inventory Mapping Rule

- Every navigation item must map to at least one screen in `frontend-screen-inventory.md`.
- No orphan screens may exist outside the navigation or deep-link system.
- Public web routes in `apps/web/src/index.ts` must map to `frontend-screen-inventory.md` and a public-web screen spec.
- Receiver public routes in `apps/web/src/index.ts` must map to `frontend-screen-inventory.md` and a receiver-public-flow screen spec.
- Tracking and custody routes must never expose internal event, actor, payment provider, or audit fields to public receiver routes.

## Baseline Status

This file is now concrete enough to drive role navigation and pilot-tab visibility.

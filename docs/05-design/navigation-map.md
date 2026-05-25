# Navigation Map

## Public Web Navigation

- Home
- How it works
- Service areas
- Coverage
- Pricing
- Trust and custody
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

### Driver

- `Home`
- `Assigned Runs`
- `History`
- `Earnings`
- `Support`

### Station

- `Overview`
- `Outbound`
- `Inbound`
- `Handoffs`
- `Support`

### Doorstep

- `Home`
- `Assigned`
- `Completed`
- `Earnings`
- `Issues`

### Admin

- `Overview`
- `Deliveries`
- `Stations`
- `Finance`
- `Issues`
- `Users`
- `Settings`

## Hidden In Pilot

- Sender wallet tab is hidden.
- Public ratings tab does not exist.
- Advanced analytics tabs remain admin-only.

## Screen Inventory Mapping Rule

- Every navigation item must map to at least one screen in `frontend-screen-inventory.md`.
- No orphan screens may exist outside the navigation or deep-link system.
- Public web routes in `apps/web/src/index.ts` must map to `frontend-screen-inventory.md` and a public-web screen spec.

## Baseline Status

This file is now concrete enough to drive role navigation and pilot-tab visibility.

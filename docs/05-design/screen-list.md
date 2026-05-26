# Screen List

## Canonical Source

The implementation-ready frontend checklist now lives in `docs/05-design/frontend-screen-inventory.md`.

This file remains as the compact legacy screen summary. Claude Code should build from `frontend-screen-inventory.md` because it includes required states, modals, shared infrastructure, backend route coverage, and launch completeness rules.

## Sender

- Onboarding
- Sign In
- Dashboard
- Create Delivery Start
- Create Delivery Stations
- Create Receiver Details
- Create Package Details
- Create Delivery Options
- Quote Review
- Delivery Summary
- Payment Method
- Sender Tracking Timeline
- Sender Delivery History
- Sender Receipt Detail
- Sender Support Thread

## Public

- Landing
- How It Works
- Service Areas
- Coverage
- Pricing
- Trust And Custody
- Business
- Partners
- About
- Support
- Delivery Policy
- Refund Policy
- Privacy
- Terms
- Tracking Entry
- Maintenance

## Driver

- Sign In
- Dashboard
- Assigned Run Detail
- Manifest
- Route
- Destination Handoff
- Earnings
- Support

## Station Operator

- Sign In
- Dashboard
- Intake Queue
- Package Intake
- Outbound Queue
- Driver Assignment
- Destination Receipt
- Final-Mile Assignment
- Handoff Log
- Reports
- Support

## Final-Mile

- Sign In
- Home
- Assignment Detail
- Route
- Proof Capture
- Failed Attempt
- Earnings

## Admin

- Overview
- Delivery Explorer
- Package Detail
- Station Detail
- User Detail
- Finance Summary
- Issue Queue
- Settings

## Approved Launch Screen Inventory

### Out Of Scope For Launch

- public ratings screen
- enterprise invoice screen
- AI customer chat screen
- route-optimization map screen

## Route Names

### Public

- `PublicLanding`
- `PublicHowItWorks`
- `PublicServiceAreas`
- `PublicCoverage`
- `PublicPricingExplainer`
- `PublicTrustCustody`
- `PublicBusiness`
- `PublicPartners`
- `PublicAbout`
- `PublicSupportEntry`
- `PublicDeliveryPolicy`
- `PublicRefundPolicy`
- `PublicPrivacy`
- `PublicTerms`
- `PublicTrackingEntry`
- `PublicMaintenance`

### Sender

- `SenderOnboarding`
- `SenderSignIn`
- `SenderHome`
- `CreateDeliveryStart`
- `CreateDeliveryStations`
- `CreateReceiverDetails`
- `CreatePackageDetails`
- `CreateDeliveryOptions`
- `QuoteReview`
- `DeliverySummary`
- `PaymentMethod`
- `SenderTrackingTimeline`
- `SenderDeliveryHistory`
- `SenderReceiptDetail`
- `SenderSupportThread`

### Driver

- `DriverSignIn`
- `DriverHome`
- `AssignedRunDetail`
- `DriverManifest`
- `DriverRoute`
- `DriverDestinationHandoff`
- `DriverEarnings`
- `DriverSupport`

### Station

- `StationSignIn`
- `StationOverview`
- `StationIntakeQueue`
- `StationPackageIntake`
- `StationOutboundQueue`
- `StationDriverAssignment`
- `StationDestinationReceipt`
- `StationFinalMileAssignment`
- `StationHandoffLog`
- `StationReports`
- `StationSupport`

### Final-Mile

- `CourierSignIn`
- `CourierHome`
- `CourierAssignmentDetail`
- `CourierRoute`
- `CourierProofCapture`
- `CourierFailedAttempt`
- `CourierEarnings`

### Admin

- `AdminOverview`
- `AdminDeliveryExplorer`
- `AdminPackageDetail`
- `AdminStationDetail`
- `AdminUserDetail`
- `AdminFinanceSummary`
- `AdminIssueQueue`
- `AdminSettings`

## Required UI States

- `loading`
- `empty`
- `error`
- `offline`
- `blocked_by_payment`
- `blocked_by_issue`
- `not_authorized`

## Workflow Coverage Rule

- The launch screen set covers:
  - sender booking and payment
  - station intake and dispatch
  - driver transport
  - destination receipt
  - pickup and final-mile completion
  - admin issue and payment review

## Baseline Status

This file is now concrete enough to support route scaffolding and UI-state planning.

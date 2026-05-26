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
- Payment Processing
- Payment Result
- Payment Provider Return
- Payment Failed Recovery
- Sender Delivery Detail
- Sender Tracking Timeline
- Sender Delivery History
- Sender Receipt Detail
- Sender Receipt Share
- Sender Refund Status
- Sender Issue Create
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

## Receiver Public Flow

- Secure Tracking Link Landing
- Phone Verification Request
- OTP Verification
- Receiver Tracking Timeline
- Arrival Instructions
- Failed Attempt Information
- Receiver Refusal Information
- Tracking Link Expired
- Tracking Access Denied

## Driver

- Sign In
- Dashboard
- Assigned Run Detail
- Manifest
- Origin Pickup Scan
- Custody Accepted
- Route
- Destination Arrival
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
- Driver Pickup Scan Review
- Inbound Queue
- Destination Receipt
- Final-Mile Queue
- Final-Mile Assignment
- Handoff Log
- Reports
- Support

## Final-Mile

- Sign In
- Home
- Assignment Detail
- Accept Assignment Scan
- Custody Accepted
- Out For Delivery
- Route
- Proof Capture
- Failed Attempt
- Return To Station
- Completed Jobs
- Earnings

## Admin

- Overview
- Delivery Explorer
- Delivery Detail
- Package Detail
- Custody Chain
- Manual Custody Exception
- Station Detail
- User Detail
- Finance Summary
- Issue Queue
- Audit Events
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

### Receiver Public Flow

- `ReceiverTrackingLanding`
- `ReceiverPhoneChallenge`
- `ReceiverOtpVerify`
- `ReceiverTrackingTimeline`
- `ReceiverArrivalInstructions`
- `ReceiverFailedAttempt`
- `ReceiverRefusalInfo`
- `TrackingLinkExpired`
- `TrackingAccessDenied`

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
- `PaymentProcessing`
- `PaymentResult`
- `PaymentProviderReturn`
- `PaymentFailedRecovery`
- `SenderDeliveryDetail`
- `SenderTrackingTimeline`
- `SenderDeliveryHistory`
- `SenderReceiptDetail`
- `SenderReceiptShare`
- `SenderRefundStatus`
- `SenderIssueCreate`
- `SenderSupportThread`

### Driver

- `DriverSignIn`
- `DriverHome`
- `AssignedRunDetail`
- `DriverManifest`
- `DriverOriginPickupScan`
- `DriverCustodyAccepted`
- `DriverRoute`
- `DriverDestinationArrival`
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
- `StationDriverPickupScan`
- `StationInboundQueue`
- `StationDestinationReceipt`
- `StationFinalMileQueue`
- `StationFinalMileAssignment`
- `StationHandoffLog`
- `StationReports`
- `StationSupport`

### Final-Mile

- `CourierSignIn`
- `CourierHome`
- `CourierAssignmentDetail`
- `CourierAcceptAssignmentScan`
- `CourierCustodyAccepted`
- `CourierOutForDelivery`
- `CourierRoute`
- `CourierProofCapture`
- `CourierFailedAttempt`
- `CourierReturnToStation`
- `CourierCompletedJobs`
- `CourierEarnings`

### Admin

- `AdminOverview`
- `AdminDeliveryExplorer`
- `AdminDeliveryDetail`
- `AdminPackageDetail`
- `AdminCustodyChain`
- `AdminManualCustodyException`
- `AdminStationDetail`
- `AdminUserDetail`
- `AdminFinanceSummary`
- `AdminIssueQueue`
- `AdminAuditEvents`
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
  - public receiver tracking and verification
  - sender tracking timeline
  - station intake and dispatch
  - driver transport
  - destination receipt
  - pickup and final-mile completion
  - operational custody chain and handoff evidence
  - admin custody audit and exception review
  - admin issue and payment review

## Baseline Status

This file is now concrete enough to support route scaffolding and UI-state planning.

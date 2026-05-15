# Screen List

## Sender
- Onboarding
- Sign In
- Dashboard
- Create Delivery
- Delivery Summary
- Payment Method
- Tracking
- History
- Receipt Detail
- Support Thread

## Driver
- Sign In
- Dashboard
- Assigned Run Detail
- Manifest
- Route
- Handoff Confirmation
- Earnings
- Support

## Station Operator
- Sign In
- Dashboard
- Intake
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
- Failure Reason
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
### Sender
- `SenderOnboarding`
- `SenderSignIn`
- `SenderHome`
- `CreateDelivery`
- `DeliverySummary`
- `PaymentMethod`
- `TrackingTimeline`
- `DeliveryHistory`
- `ReceiptDetail`
- `SupportThread`

### Driver
- `DriverSignIn`
- `DriverHome`
- `AssignedRunDetail`
- `DriverManifest`
- `DriverRoute`
- `DriverHandoff`
- `DriverEarnings`
- `DriverSupport`

### Station
- `StationSignIn`
- `StationOverview`
- `StationIntake`
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
- `CourierFailureReason`
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

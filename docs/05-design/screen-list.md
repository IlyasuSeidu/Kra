# Screen List

## Canonical Source

The implementation-ready frontend checklist now lives in `docs/05-design/frontend-screen-inventory.md`.

This file remains as the compact legacy screen summary. Claude Code should build from `frontend-screen-inventory.md` because it includes required states, modals, shared infrastructure, backend route coverage, and launch completeness rules.

## Sender

- Onboarding
- Sign In
- Auth Recovery
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
- Cancel Delivery Request
- Sender Refund Status
- Sender Issue Create
- Sender Support Thread
- Sender Notifications
- Sender Profile
- Sender Settings

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

## Auth And Account

- Role Selection
- Invite Acceptance
- Staff Account Activation
- Passwordless Phone Login
- Session Expired
- Account Locked
- Permission Denied

## Operations Shared

- Role-Aware Home
- Staff Delivery Detail
- Scan Package
- Custody Chain
- Offline Outbox
- Failed Action Recovery
- Staff Issue Creation
- Staff Support

## Driver

- Sign In
- Dashboard
- Assigned Runs
- Assigned Run Detail
- Accept Run
- Manifest
- Origin Pickup Scan
- Custody Accepted
- Route
- Mark In Transit
- Destination Arrival
- Destination Handoff
- History
- Earnings
- Support

## Station Operator

- Sign In
- Dashboard
- Intake Queue
- Package Intake
- Intake Confirmation
- Package Label Print
- Package Label Reprint
- Outbound Queue
- Driver Assignment
- Dispatch Readiness
- Driver Pickup Scan Review
- Inbound Queue
- Destination Receipt
- Condition Check
- Final-Mile Queue
- Final-Mile Assignment
- Handoff Log
- Blocked Queue
- Reports
- Support

## Final-Mile

- Sign In
- Home
- Assignments
- Assignment Detail
- Accept Assignment Scan
- Custody Accepted
- Out For Delivery
- Route
- Proof Capture
- OTP Completion
- Signature Proof
- Photo Proof
- Failed Attempt
- Return To Station
- Completed Jobs
- Earnings
- Issues

## Admin

- Sign In
- Overview
- Launch Readiness
- Launch Readiness Detail
- Delivery Explorer
- Delivery Detail
- Package Detail
- Package Label Registry
- Custody Chain
- Manual Custody Exception
- Blocked Delivery Queue
- Stations
- Station Detail
- Station Validation
- Station Status Override
- Station Capacity
- Users
- User Detail
- User Access
- Staff Activity Log
- Pricing Rules
- Pricing Rule Edit
- Finance Summary
- Payment Reconciliation
- Payment Reconciliation Detail
- Refund Review
- Refund Settlement
- Refund Evidence Review
- Issue Queue
- Issue Detail
- SLA Breach Dashboard
- Audit Events
- Audit Event Detail
- Outbound Notifications
- Notification Detail
- Webhook Events
- Webhook Event Detail
- Analytics
- Export Report
- Settings

## Shared Operational Modals

- Confirm Destructive Action
- Cancel Delivery Reason
- Scan Package
- Wrong Package Scanned
- Package Label Already Used
- Accept Custody
- Reject Assignment
- Failed Delivery Reason
- Upload Proof
- Verify OTP
- Escalate Issue
- Resolve Issue
- Refund Decision
- Refund Settlement
- Station Status Override
- Station Validation
- Pricing Rule Update
- Suspend Or Reactivate User
- Retry Notification
- Replay Webhook
- Export Report
- Audit Sensitive Action Acknowledgement

## Shared Screen States

- Loading
- Empty
- Error
- Offline
- Stale Data
- Not Authorized
- Session Expired
- Blocked By Payment
- Blocked By Issue
- Manual Review Required
- Scan Mismatch
- Duplicate Package Label
- Custody Not Confirmed
- OTP Required
- Proof Required
- Payment Under Review
- Refund Pending
- Webhook Conflict
- Rate Limited

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
- `SenderAuthRecovery`
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
- `CancelDeliveryRequest`
- `SenderRefundStatus`
- `SenderIssueCreate`
- `SenderSupportThread`
- `SenderNotifications`
- `SenderProfile`
- `SenderSettings`

### Operations Shared

- `OpsRoleHome`
- `OpsDeliveryDetail`
- `OpsScanPackage`
- `OpsCustodyChain`
- `OpsOfflineOutbox`
- `OpsActionRecovery`
- `OpsIssueCreate`
- `OpsSupport`

### Driver

- `DriverSignIn`
- `DriverHome`
- `AssignedRuns`
- `AssignedRunDetail`
- `DriverAcceptRun`
- `DriverManifest`
- `DriverOriginPickupScan`
- `DriverCustodyAccepted`
- `DriverRoute`
- `DriverMarkInTransit`
- `DriverDestinationArrival`
- `DriverDestinationHandoff`
- `DriverHistory`
- `DriverEarnings`
- `DriverSupport`

### Station

- `StationSignIn`
- `StationOverview`
- `StationIntakeQueue`
- `StationPackageIntake`
- `StationIntakeConfirmation`
- `PackageLabelPrint`
- `PackageLabelReprint`
- `StationOutboundQueue`
- `StationDriverAssignment`
- `StationDispatchReadiness`
- `StationDriverPickupScan`
- `StationInboundQueue`
- `StationDestinationReceipt`
- `StationConditionCheck`
- `StationFinalMileQueue`
- `StationFinalMileAssignment`
- `StationHandoffLog`
- `StationBlockedQueue`
- `StationReports`
- `StationSupport`

### Final-Mile

- `CourierSignIn`
- `CourierHome`
- `CourierAssignments`
- `CourierAssignmentDetail`
- `CourierAcceptAssignmentScan`
- `CourierCustodyAccepted`
- `CourierOutForDelivery`
- `CourierRoute`
- `CourierProofCapture`
- `CourierOtpCompletion`
- `CourierSignatureProof`
- `CourierPhotoProof`
- `CourierFailedAttempt`
- `CourierReturnToStation`
- `CourierCompletedJobs`
- `CourierEarnings`
- `CourierIssues`

### Admin

- `AdminSignIn`
- `AdminOverview`
- `AdminLaunchReadiness`
- `AdminLaunchReadinessDetail`
- `AdminDeliveryExplorer`
- `AdminDeliveryDetail`
- `AdminPackageDetail`
- `AdminPackageLabelRegistry`
- `AdminCustodyChain`
- `AdminManualCustodyException`
- `AdminBlockedDeliveryQueue`
- `AdminStations`
- `AdminStationDetail`
- `AdminStationValidation`
- `AdminStationStatusOverride`
- `AdminStationCapacity`
- `AdminUsers`
- `AdminUserDetail`
- `AdminUserAccess`
- `AdminStaffActivityLog`
- `AdminPricingRules`
- `AdminPricingRuleEdit`
- `AdminFinanceSummary`
- `AdminPaymentReconciliation`
- `AdminPaymentReconciliationDetail`
- `AdminRefundReview`
- `AdminRefundSettlement`
- `AdminRefundEvidenceReview`
- `AdminIssueQueue`
- `AdminIssueDetail`
- `AdminSlaBreachDashboard`
- `AdminAuditEvents`
- `AdminAuditEventDetail`
- `AdminOutboundNotifications`
- `AdminNotificationDetail`
- `AdminWebhookEvents`
- `AdminWebhookEventDetail`
- `AdminAnalytics`
- `AdminExportReport`
- `AdminSettings`

### Auth And Account

- `AuthRoleSelection`
- `InviteAcceptance`
- `StaffAccountActivation`
- `PasswordlessPhoneLogin`
- `SessionExpired`
- `AccountLocked`
- `PermissionDenied`

### Shared Operational Modals

- `ConfirmDestructiveActionModal`
- `CancelDeliveryReasonModal`
- `ScanPackageModal`
- `WrongPackageScannedModal`
- `PackageLabelAlreadyUsedModal`
- `AcceptCustodyModal`
- `RejectAssignmentModal`
- `FailedDeliveryReasonModal`
- `UploadProofModal`
- `VerifyOtpModal`
- `EscalateIssueModal`
- `ResolveIssueModal`
- `RefundDecisionModal`
- `RefundSettlementModal`
- `StationStatusOverrideModal`
- `StationValidationModal`
- `PricingRuleUpdateModal`
- `SuspendReactivateUserModal`
- `RetryNotificationModal`
- `ReplayWebhookModal`
- `ExportReportModal`
- `AuditSensitiveActionAckModal`

### Shared Screen States

- `loading`
- `empty`
- `error`
- `offline`
- `stale_data`
- `not_authorized`
- `session_expired`
- `blocked_by_payment`
- `blocked_by_issue`
- `manual_review_required`
- `scan_mismatch`
- `duplicate_package_label`
- `custody_not_confirmed`
- `otp_required`
- `proof_required`
- `payment_under_review`
- `refund_pending`
- `webhook_conflict`
- `rate_limited`

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
  - auth and account access
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
  - notifications, webhook visibility, and retry constraints
  - offline action recovery and shared failure states
  - public web acquisition, policy, support, tracking, and maintenance

## Baseline Status

This file is now concrete enough to support route scaffolding and UI-state planning.

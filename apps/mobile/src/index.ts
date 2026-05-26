export const mobileImplementationStatus = "contract_only" as const;

export const mobileAuthAndAccountScreens = [
  "AuthRoleSelection",
  "InviteAcceptance",
  "StaffAccountActivation",
  "PasswordlessPhoneLogin",
  "SessionExpired",
  "AccountLocked",
  "PermissionDenied"
] as const;

export const mobileOperationalSharedScreens = [
  "OpsRoleHome",
  "OpsDeliveryDetail",
  "OpsScanPackage",
  "OpsCustodyChain",
  "OpsOfflineOutbox",
  "OpsActionRecovery",
  "OpsIssueCreate",
  "OpsSupport"
] as const;

export const mobileRoleShells = {
  sender: [
    "SenderOnboarding",
    "SenderSignIn",
    "SenderAuthRecovery",
    "SenderHome",
    "CreateDeliveryStart",
    "CreateDeliveryStations",
    "CreateReceiverDetails",
    "CreatePackageDetails",
    "CreateDeliveryOptions",
    "QuoteReview",
    "DeliverySummary",
    "PaymentMethod",
    "PaymentProcessing",
    "PaymentResult",
    "PaymentProviderReturn",
    "PaymentFailedRecovery",
    "SenderDeliveryDetail",
    "SenderTrackingTimeline",
    "SenderDeliveryHistory",
    "SenderReceiptDetail",
    "SenderReceiptShare",
    "CancelDeliveryRequest",
    "SenderRefundStatus",
    "SenderIssueCreate",
    "SenderSupportThread",
    "SenderNotifications",
    "SenderProfile",
    "SenderSettings"
  ],
  driver: [
    "DriverSignIn",
    "DriverHome",
    "AssignedRuns",
    "AssignedRunDetail",
    "DriverAcceptRun",
    "DriverManifest",
    "DriverOriginPickupScan",
    "DriverCustodyAccepted",
    "DriverRoute",
    "DriverMarkInTransit",
    "DriverDestinationArrival",
    "DriverDestinationHandoff",
    "DriverHistory",
    "DriverEarnings",
    "DriverSupport"
  ],
  station_operator: [
    "StationSignIn",
    "StationOverview",
    "StationIntakeQueue",
    "StationPackageIntake",
    "StationIntakeConfirmation",
    "PackageLabelPrint",
    "PackageLabelReprint",
    "StationOutboundQueue",
    "StationDriverAssignment",
    "StationDispatchReadiness",
    "StationDriverPickupScan",
    "StationInboundQueue",
    "StationDestinationReceipt",
    "StationConditionCheck",
    "StationFinalMileQueue",
    "StationFinalMileAssignment",
    "StationHandoffLog",
    "StationBlockedQueue",
    "StationReports",
    "StationSupport"
  ],
  final_mile_courier: [
    "CourierSignIn",
    "CourierHome",
    "CourierAssignments",
    "CourierAssignmentDetail",
    "CourierAcceptAssignmentScan",
    "CourierCustodyAccepted",
    "CourierOutForDelivery",
    "CourierRoute",
    "CourierProofCapture",
    "CourierOtpCompletion",
    "CourierSignatureProof",
    "CourierPhotoProof",
    "CourierFailedAttempt",
    "CourierReturnToStation",
    "CourierCompletedJobs",
    "CourierEarnings",
    "CourierIssues"
  ]
} as const;

export const mobileDomainLifecycleGroups = {
  auth_account_access: mobileAuthAndAccountScreens,
  sender_booking: [
    "CreateDeliveryStart",
    "CreateDeliveryStations",
    "CreateReceiverDetails",
    "CreatePackageDetails",
    "CreateDeliveryOptions",
    "QuoteReview",
    "DeliverySummary",
    "CancelDeliveryRequest"
  ],
  payment_refund: [
    "PaymentMethod",
    "PaymentProcessing",
    "PaymentResult",
    "PaymentProviderReturn",
    "PaymentFailedRecovery",
    "SenderReceiptDetail",
    "SenderReceiptShare",
    "SenderRefundStatus"
  ],
  sender: ["SenderDeliveryDetail", "SenderTrackingTimeline", "SenderDeliveryHistory"],
  shared_operations: mobileOperationalSharedScreens,
  driver: [
    "AssignedRuns",
    "AssignedRunDetail",
    "DriverAcceptRun",
    "DriverManifest",
    "DriverOriginPickupScan",
    "DriverCustodyAccepted",
    "DriverRoute",
    "DriverMarkInTransit",
    "DriverDestinationArrival",
    "DriverDestinationHandoff",
    "DriverHistory",
    "DriverEarnings"
  ],
  station_operator: [
    "StationOverview",
    "StationIntakeQueue",
    "StationPackageIntake",
    "StationIntakeConfirmation",
    "PackageLabelPrint",
    "PackageLabelReprint",
    "StationOutboundQueue",
    "StationDriverAssignment",
    "StationDispatchReadiness",
    "StationDriverPickupScan",
    "StationInboundQueue",
    "StationDestinationReceipt",
    "StationConditionCheck",
    "StationFinalMileQueue",
    "StationFinalMileAssignment",
    "StationHandoffLog",
    "StationBlockedQueue",
    "StationReports"
  ],
  final_mile_courier: [
    "CourierAssignments",
    "CourierAssignmentDetail",
    "CourierAcceptAssignmentScan",
    "CourierCustodyAccepted",
    "CourierOutForDelivery",
    "CourierRoute",
    "CourierProofCapture",
    "CourierOtpCompletion",
    "CourierSignatureProof",
    "CourierPhotoProof",
    "CourierFailedAttempt",
    "CourierReturnToStation",
    "CourierCompletedJobs",
    "CourierEarnings"
  ],
  issues_support_disputes: [
    "SenderIssueCreate",
    "SenderSupportThread",
    "OpsIssueCreate",
    "OpsSupport",
    "DriverSupport",
    "StationSupport",
    "CourierIssues"
  ],
  notifications: ["SenderNotifications"],
  offline_recovery: ["OpsOfflineOutbox", "OpsActionRecovery"]
} as const;

export const mobileTrackingLifecycleScreens = {
  sender: mobileDomainLifecycleGroups.sender,
  shared_operations: ["OpsDeliveryDetail", "OpsCustodyChain"],
  driver: [
    "AssignedRunDetail",
    "DriverManifest",
    "DriverOriginPickupScan",
    "DriverCustodyAccepted",
    "DriverRoute",
    "DriverDestinationArrival",
    "DriverDestinationHandoff"
  ],
  station_operator: [
    "StationOutboundQueue",
    "StationDriverPickupScan",
    "StationInboundQueue",
    "StationDestinationReceipt",
    "StationFinalMileQueue",
    "StationHandoffLog"
  ],
  final_mile_courier: [
    "CourierAssignmentDetail",
    "CourierAcceptAssignmentScan",
    "CourierCustodyAccepted",
    "CourierOutForDelivery",
    "CourierRoute",
    "CourierProofCapture",
    "CourierFailedAttempt",
    "CourierReturnToStation",
    "CourierCompletedJobs"
  ]
} as const;

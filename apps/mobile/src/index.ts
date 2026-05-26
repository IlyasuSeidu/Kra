export const mobileImplementationStatus = "contract_only" as const;

export const mobileRoleShells = {
  sender: [
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
    "SenderRefundStatus",
    "SenderIssueCreate",
    "SenderSupportThread"
  ],
  driver: [
    "DriverHome",
    "AssignedRunDetail",
    "DriverManifest",
    "DriverOriginPickupScan",
    "DriverCustodyAccepted",
    "DriverRoute",
    "DriverDestinationArrival",
    "DriverDestinationHandoff"
  ],
  station_operator: [
    "StationOverview",
    "StationIntakeQueue",
    "StationPackageIntake",
    "StationOutboundQueue",
    "StationDriverPickupScan",
    "StationInboundQueue",
    "StationDestinationReceipt",
    "StationFinalMileQueue",
    "StationHandoffLog"
  ],
  final_mile_courier: [
    "CourierHome",
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

export const mobileTrackingLifecycleScreens = {
  sender: ["SenderDeliveryDetail", "SenderTrackingTimeline", "SenderDeliveryHistory"],
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

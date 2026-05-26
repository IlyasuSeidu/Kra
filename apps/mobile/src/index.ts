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
    "SenderTrackingTimeline",
    "SenderSupportThread"
  ],
  driver: ["DriverHome", "DriverManifest", "DriverRoute", "DriverDestinationHandoff"],
  station_operator: [
    "StationOverview",
    "StationIntakeQueue",
    "StationPackageIntake",
    "StationOutboundQueue",
    "StationDestinationReceipt"
  ],
  final_mile_courier: [
    "CourierHome",
    "CourierAssignmentDetail",
    "CourierProofCapture",
    "CourierFailedAttempt"
  ]
} as const;

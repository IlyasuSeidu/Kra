export const mobileRoleShells = {
  sender: ["SenderHome", "CreateDelivery", "TrackingTimeline", "SupportThread"],
  driver: ["DriverHome", "DriverManifest", "DriverRoute", "DriverHandoff"],
  station_operator: [
    "StationOverview",
    "StationIntake",
    "StationOutboundQueue",
    "StationDestinationReceipt"
  ],
  final_mile_courier: [
    "CourierHome",
    "CourierAssignmentDetail",
    "CourierProofCapture",
    "CourierFailureReason"
  ]
} as const;


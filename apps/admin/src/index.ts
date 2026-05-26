export const adminSurfaces = [
  "AdminOverview",
  "AdminDeliveryExplorer",
  "AdminDeliveryDetail",
  "AdminPackageDetail",
  "AdminCustodyChain",
  "AdminManualCustodyException",
  "AdminStationDetail",
  "AdminFinanceSummary",
  "AdminIssueQueue",
  "AdminUserDetail",
  "AdminAuditEvents",
  "AdminAuditEventDetail",
  "AdminSettings"
] as const;

export const adminTrackingSurfaces = [
  "AdminDeliveryExplorer",
  "AdminDeliveryDetail",
  "AdminPackageDetail",
  "AdminCustodyChain",
  "AdminManualCustodyException",
  "AdminAuditEvents",
  "AdminAuditEventDetail"
] as const;

export const adminImplementationStatus = "contract_only" as const;

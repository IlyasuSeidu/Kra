export const adminSurfaces = [
  "AdminSignIn",
  "AdminOverview",
  "AdminLaunchReadiness",
  "AdminLaunchReadinessDetail",
  "AdminDeliveryExplorer",
  "AdminDeliveryDetail",
  "AdminPackageDetail",
  "AdminPackageLabelRegistry",
  "AdminCustodyChain",
  "AdminManualCustodyException",
  "AdminBlockedDeliveryQueue",
  "AdminStations",
  "AdminStationDetail",
  "AdminStationValidation",
  "AdminStationStatusOverride",
  "AdminStationCapacity",
  "AdminUsers",
  "AdminUserDetail",
  "AdminUserAccess",
  "AdminStaffActivityLog",
  "AdminPricingRules",
  "AdminPricingRuleEdit",
  "AdminFinanceSummary",
  "AdminPaymentReconciliation",
  "AdminPaymentReconciliationDetail",
  "AdminRefundReview",
  "AdminRefundSettlement",
  "AdminRefundEvidenceReview",
  "AdminIssueQueue",
  "AdminIssueDetail",
  "AdminSlaBreachDashboard",
  "AdminAuditEvents",
  "AdminAuditEventDetail",
  "AdminOutboundNotifications",
  "AdminNotificationDetail",
  "AdminWebhookEvents",
  "AdminWebhookEventDetail",
  "AdminAnalytics",
  "AdminExportReport",
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

export const adminDomainLifecycleGroups = {
  auth_account_access: ["AdminSignIn", "AdminUsers", "AdminUserDetail", "AdminUserAccess"],
  station_operations: [
    "AdminStations",
    "AdminStationDetail",
    "AdminStationValidation",
    "AdminStationStatusOverride",
    "AdminStationCapacity"
  ],
  delivery_tracking_custody: [
    "AdminDeliveryExplorer",
    "AdminDeliveryDetail",
    "AdminPackageDetail",
    "AdminPackageLabelRegistry",
    "AdminCustodyChain",
    "AdminManualCustodyException",
    "AdminBlockedDeliveryQueue"
  ],
  payment_refund: [
    "AdminFinanceSummary",
    "AdminPaymentReconciliation",
    "AdminPaymentReconciliationDetail",
    "AdminRefundReview",
    "AdminRefundSettlement",
    "AdminRefundEvidenceReview"
  ],
  issues_support_disputes: ["AdminIssueQueue", "AdminIssueDetail"],
  notifications_webhooks: [
    "AdminOutboundNotifications",
    "AdminNotificationDetail",
    "AdminWebhookEvents",
    "AdminWebhookEventDetail"
  ],
  pricing_readiness_analytics: [
    "AdminLaunchReadiness",
    "AdminLaunchReadinessDetail",
    "AdminPricingRules",
    "AdminPricingRuleEdit",
    "AdminSlaBreachDashboard",
    "AdminAnalytics",
    "AdminExportReport",
    "AdminSettings"
  ],
  audit: ["AdminStaffActivityLog", "AdminAuditEvents", "AdminAuditEventDetail"]
} as const;

export const adminImplementationStatus = "contract_only" as const;

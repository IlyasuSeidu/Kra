import {
  acceptFinalMileAssignmentRequestSchema,
  acceptRunRequestSchema,
  adminUpdateStationValidationRequestSchema,
  adminUpdateStationValidationResponseSchema,
  adminUpdateStationStatusRequestSchema,
  adminUpdateStationStatusResponseSchema,
  adminUpdateUserAccessRequestSchema,
  adminUserListQuerySchema,
  adminUserListResponseSchema,
  adminUserResponseSchema,
  adminUpsertUserRequestSchema,
  adminWebhookEventListQuerySchema,
  adminWebhookEventListResponseSchema,
  adminOverviewResponseSchema,
  adminDeliveryListResponseSchema,
  adminFinanceResponseSchema,
  adminStationListResponseSchema,
  apiErrorResponseSchema,
  assignDriverRequestSchema,
  assignFinalMileRequestSchema,
  cancelDeliveryRequestSchema,
  cancelDeliveryResponseSchema,
  completeDeliveryRequestSchema,
  confirmIntakeRequestSchema,
  createIssueRequestSchema,
  createDeliveryRequestSchema,
  createDeliveryResponseSchema,
  auditEventListQuerySchema,
  auditEventListResponseSchema,
  confirmDriverPickupRequestSchema,
  deliveryListQuerySchema,
  deliveryListResponseSchema,
  deliveryDetailResponseSchema,
  deliveryLifecycleResponseSchema,
  deliveryTimelineResponseSchema,
  dispatchDeliveryRequestSchema,
  escalateIssueRequestSchema,
  issueListQuerySchema,
  issueListResponseSchema,
  markInTransitRequestSchema,
  markOutForDeliveryRequestSchema,
  issueResponseSchema,
  mtnMomoWebhookRequestSchema,
  mtnMomoWebhookResponseSchema,
  notificationListQuerySchema,
  notificationListResponseSchema,
  paymentInitializeRequestSchema,
  paymentInitializeResponseSchema,
  refundPaymentRequestSchema,
  refundPaymentResponseSchema,
  settleRefundRequestSchema,
  settleRefundResponseSchema,
  paymentVerifyRequestSchema,
  paymentVerifyResponseSchema,
  publicTrackingResponseSchema,
  requestPhoneVerificationChallengeRequestSchema,
  requestPhoneVerificationChallengeResponseSchema,
  recordFailedAttemptRequestSchema,
  receiveDestinationRequestSchema,
  resolveIssueRequestSchema,
  verifyPhoneResponseSchema,
  verifyPhoneRequestSchema,
  type Capability
} from "@kra/shared";

export type ApiModule =
  | "auth"
  | "deliveries"
  | "handoffs"
  | "payments"
  | "notifications"
  | "issues"
  | "admin";

export type HttpMethod = "GET" | "POST";
export type AuthScope = "public" | "authenticated" | "staff" | "admin" | "webhook";

export interface ApiRouteDefinition {
  operationId: string;
  method: HttpMethod;
  path: string;
  module: ApiModule;
  authScope: AuthScope;
  capability?: Capability;
  idempotent: boolean;
  requestSchema?: unknown;
  responseSchema?: unknown;
  errorSchema: typeof apiErrorResponseSchema;
}

export const apiRoutes = [
  {
    operationId: "list_deliveries",
    method: "GET",
    path: "/v1/deliveries",
    module: "deliveries",
    authScope: "authenticated",
    idempotent: true,
    requestSchema: deliveryListQuerySchema,
    responseSchema: deliveryListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "create_delivery",
    method: "POST",
    path: "/v1/deliveries",
    module: "deliveries",
    authScope: "authenticated",
    capability: "create_delivery",
    idempotent: true,
    requestSchema: createDeliveryRequestSchema,
    responseSchema: createDeliveryResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "cancel_delivery",
    method: "POST",
    path: "/v1/deliveries/:id/cancel",
    module: "deliveries",
    authScope: "authenticated",
    capability: "cancel_eligible_delivery",
    idempotent: false,
    requestSchema: cancelDeliveryRequestSchema,
    responseSchema: cancelDeliveryResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "get_delivery",
    method: "GET",
    path: "/v1/deliveries/:id",
    module: "deliveries",
    authScope: "authenticated",
    capability: "view_own_delivery",
    idempotent: true,
    responseSchema: deliveryDetailResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "get_delivery_timeline",
    method: "GET",
    path: "/v1/deliveries/:id/timeline",
    module: "deliveries",
    authScope: "authenticated",
    capability: "view_own_delivery",
    idempotent: true,
    responseSchema: deliveryTimelineResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "get_public_tracking",
    method: "GET",
    path: "/v1/public/track/:trackingCode",
    module: "deliveries",
    authScope: "public",
    idempotent: true,
    responseSchema: publicTrackingResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "request_public_tracking_phone_challenge",
    method: "POST",
    path: "/v1/public/track/:trackingCode/request-verification",
    module: "deliveries",
    authScope: "public",
    idempotent: false,
    requestSchema: requestPhoneVerificationChallengeRequestSchema,
    responseSchema: requestPhoneVerificationChallengeResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "verify_public_tracking_phone",
    method: "POST",
    path: "/v1/public/track/:trackingCode/verify-phone",
    module: "deliveries",
    authScope: "public",
    idempotent: true,
    requestSchema: verifyPhoneRequestSchema,
    responseSchema: verifyPhoneResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "ingest_mtn_momo_webhook",
    method: "POST",
    path: "/v1/webhooks/payments/mtn-momo",
    module: "payments",
    authScope: "webhook",
    idempotent: true,
    requestSchema: mtnMomoWebhookRequestSchema,
    responseSchema: mtnMomoWebhookResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "initialize_payment",
    method: "POST",
    path: "/v1/payments/initialize",
    module: "payments",
    authScope: "authenticated",
    capability: "create_delivery",
    idempotent: true,
    requestSchema: paymentInitializeRequestSchema,
    responseSchema: paymentInitializeResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "verify_payment",
    method: "POST",
    path: "/v1/payments/verify",
    module: "payments",
    authScope: "authenticated",
    capability: "view_own_delivery",
    idempotent: true,
    requestSchema: paymentVerifyRequestSchema,
    responseSchema: paymentVerifyResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "list_notifications",
    method: "GET",
    path: "/v1/notifications",
    module: "notifications",
    authScope: "authenticated",
    idempotent: true,
    requestSchema: notificationListQuerySchema,
    responseSchema: notificationListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "refund_payment",
    method: "POST",
    path: "/v1/payments/refund",
    module: "payments",
    authScope: "admin",
    capability: "approve_refund",
    idempotent: true,
    requestSchema: refundPaymentRequestSchema,
    responseSchema: refundPaymentResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "settle_refund_payment",
    method: "POST",
    path: "/v1/payments/refund/settle",
    module: "payments",
    authScope: "admin",
    capability: "execute_refund",
    idempotent: false,
    requestSchema: settleRefundRequestSchema,
    responseSchema: settleRefundResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "confirm_intake",
    method: "POST",
    path: "/v1/deliveries/:id/intake",
    module: "handoffs",
    authScope: "staff",
    capability: "confirm_intake",
    idempotent: true,
    requestSchema: confirmIntakeRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "assign_driver",
    method: "POST",
    path: "/v1/deliveries/:id/assign-driver",
    module: "handoffs",
    authScope: "staff",
    capability: "assign_driver",
    idempotent: true,
    requestSchema: assignDriverRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "accept_run",
    method: "POST",
    path: "/v1/deliveries/:id/accept-run",
    module: "handoffs",
    authScope: "staff",
    capability: "accept_run",
    idempotent: true,
    requestSchema: acceptRunRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "dispatch_delivery",
    method: "POST",
    path: "/v1/deliveries/:id/dispatch",
    module: "handoffs",
    authScope: "staff",
    capability: "confirm_dispatch",
    idempotent: true,
    requestSchema: dispatchDeliveryRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "confirm_pickup",
    method: "POST",
    path: "/v1/deliveries/:id/confirm-pickup",
    module: "handoffs",
    authScope: "staff",
    capability: "confirm_pickup",
    idempotent: true,
    requestSchema: confirmDriverPickupRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "mark_in_transit",
    method: "POST",
    path: "/v1/deliveries/:id/mark-in-transit",
    module: "handoffs",
    authScope: "staff",
    capability: "update_transit_status",
    idempotent: true,
    requestSchema: markInTransitRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "receive_destination",
    method: "POST",
    path: "/v1/deliveries/:id/receive-destination",
    module: "handoffs",
    authScope: "staff",
    capability: "confirm_destination_receipt",
    idempotent: true,
    requestSchema: receiveDestinationRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "assign_final_mile",
    method: "POST",
    path: "/v1/deliveries/:id/assign-final-mile",
    module: "handoffs",
    authScope: "staff",
    capability: "assign_final_mile",
    idempotent: true,
    requestSchema: assignFinalMileRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "accept_final_mile_assignment",
    method: "POST",
    path: "/v1/deliveries/:id/accept-final-mile-assignment",
    module: "handoffs",
    authScope: "staff",
    capability: "accept_final_mile_assignment",
    idempotent: true,
    requestSchema: acceptFinalMileAssignmentRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "mark_out_for_delivery",
    method: "POST",
    path: "/v1/deliveries/:id/out-for-delivery",
    module: "handoffs",
    authScope: "staff",
    capability: "mark_out_for_delivery",
    idempotent: true,
    requestSchema: markOutForDeliveryRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "record_failed_attempt",
    method: "POST",
    path: "/v1/deliveries/:id/final-mile-failed-attempt",
    module: "handoffs",
    authScope: "staff",
    capability: "record_failed_attempt",
    idempotent: false,
    requestSchema: recordFailedAttemptRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "complete_delivery",
    method: "POST",
    path: "/v1/deliveries/:id/complete",
    module: "handoffs",
    authScope: "staff",
    idempotent: true,
    requestSchema: completeDeliveryRequestSchema,
    responseSchema: deliveryLifecycleResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "list_issues",
    method: "GET",
    path: "/v1/issues",
    module: "issues",
    authScope: "authenticated",
    idempotent: true,
    requestSchema: issueListQuerySchema,
    responseSchema: issueListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "create_issue",
    method: "POST",
    path: "/v1/issues",
    module: "issues",
    authScope: "authenticated",
    idempotent: true,
    requestSchema: createIssueRequestSchema,
    responseSchema: issueResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "get_issue",
    method: "GET",
    path: "/v1/issues/:id",
    module: "issues",
    authScope: "authenticated",
    idempotent: true,
    responseSchema: issueResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "escalate_issue",
    method: "POST",
    path: "/v1/issues/:id/escalate",
    module: "issues",
    authScope: "admin",
    capability: "escalate_case",
    idempotent: true,
    requestSchema: escalateIssueRequestSchema,
    responseSchema: issueResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "resolve_issue",
    method: "POST",
    path: "/v1/issues/:id/resolve",
    module: "issues",
    authScope: "admin",
    idempotent: true,
    requestSchema: resolveIssueRequestSchema,
    responseSchema: issueResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_overview",
    method: "GET",
    path: "/v1/admin/overview",
    module: "admin",
    authScope: "admin",
    idempotent: false,
    responseSchema: adminOverviewResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_deliveries",
    method: "GET",
    path: "/v1/admin/deliveries",
    module: "admin",
    authScope: "admin",
    idempotent: true,
    responseSchema: adminDeliveryListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_stations",
    method: "GET",
    path: "/v1/admin/stations",
    module: "admin",
    authScope: "admin",
    idempotent: true,
    responseSchema: adminStationListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_finance",
    method: "GET",
    path: "/v1/admin/finance",
    module: "admin",
    authScope: "admin",
    idempotent: true,
    responseSchema: adminFinanceResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_users",
    method: "GET",
    path: "/v1/admin/users",
    module: "admin",
    authScope: "admin",
    capability: "manage_users_and_roles",
    idempotent: true,
    requestSchema: adminUserListQuerySchema,
    responseSchema: adminUserListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_upsert_user",
    method: "POST",
    path: "/v1/admin/users",
    module: "admin",
    authScope: "admin",
    capability: "manage_users_and_roles",
    idempotent: true,
    requestSchema: adminUpsertUserRequestSchema,
    responseSchema: adminUserResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_update_user_access",
    method: "POST",
    path: "/v1/admin/users/:id/access",
    module: "admin",
    authScope: "admin",
    capability: "manage_users_and_roles",
    idempotent: true,
    requestSchema: adminUpdateUserAccessRequestSchema,
    responseSchema: adminUserResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_update_station_status",
    method: "POST",
    path: "/v1/admin/stations/:id/status",
    module: "admin",
    authScope: "admin",
    capability: "override_queue_state",
    idempotent: true,
    requestSchema: adminUpdateStationStatusRequestSchema,
    responseSchema: adminUpdateStationStatusResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_update_station_validation",
    method: "POST",
    path: "/v1/admin/stations/:id/validation",
    module: "admin",
    authScope: "admin",
    capability: "override_queue_state",
    idempotent: true,
    requestSchema: adminUpdateStationValidationRequestSchema,
    responseSchema: adminUpdateStationValidationResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_audit_events",
    method: "GET",
    path: "/v1/admin/audit-events",
    module: "admin",
    authScope: "admin",
    idempotent: true,
    requestSchema: auditEventListQuerySchema,
    responseSchema: auditEventListResponseSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_webhook_events",
    method: "GET",
    path: "/v1/admin/webhook-events",
    module: "admin",
    authScope: "admin",
    idempotent: true,
    requestSchema: adminWebhookEventListQuerySchema,
    responseSchema: adminWebhookEventListResponseSchema,
    errorSchema: apiErrorResponseSchema
  }
] as const satisfies readonly ApiRouteDefinition[];

export function getApiRoute(operationId: string): ApiRouteDefinition | undefined {
  return apiRoutes.find((route) => route.operationId === operationId);
}

export function listApiRoutesByModule(module: ApiModule): ApiRouteDefinition[] {
  return apiRoutes.filter((route) => route.module === module);
}

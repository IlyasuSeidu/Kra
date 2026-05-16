import {
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
  deliveryListQuerySchema,
  deliveryListResponseSchema,
  deliveryDetailResponseSchema,
  deliveryLifecycleResponseSchema,
  deliveryTimelineResponseSchema,
  dispatchDeliveryRequestSchema,
  escalateIssueRequestSchema,
  issueListQuerySchema,
  issueListResponseSchema,
  issueResponseSchema,
  mtnMomoWebhookRequestSchema,
  mtnMomoWebhookResponseSchema,
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
    operationId: "refund_payment",
    method: "POST",
    path: "/v1/payments/refund",
    module: "payments",
    authScope: "admin",
    capability: "execute_refund",
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
    capability: "open_issue",
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

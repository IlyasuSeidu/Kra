import {
  apiErrorResponseSchema,
  createDeliveryRequestSchema,
  createDeliveryResponseSchema,
  paymentInitializeRequestSchema,
  paymentInitializeResponseSchema,
  paymentVerifyRequestSchema,
  paymentVerifyResponseSchema,
  publicTrackingResponseSchema,
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

const emptySuccessSchema = {
  type: "empty_success"
} as const;

export const apiRoutes = [
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
    operationId: "get_public_tracking",
    method: "GET",
    path: "/v1/public/track/:trackingCode",
    module: "deliveries",
    authScope: "public",
    idempotent: false,
    responseSchema: publicTrackingResponseSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
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
    responseSchema: emptySuccessSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "complete_delivery",
    method: "POST",
    path: "/v1/deliveries/:id/complete",
    module: "handoffs",
    authScope: "staff",
    capability: "complete_delivery_with_proof",
    idempotent: true,
    responseSchema: emptySuccessSchema,
    errorSchema: apiErrorResponseSchema
  },
  {
    operationId: "admin_overview",
    method: "GET",
    path: "/v1/admin/overview",
    module: "admin",
    authScope: "admin",
    idempotent: false,
    responseSchema: emptySuccessSchema,
    errorSchema: apiErrorResponseSchema
  }
] as const satisfies readonly ApiRouteDefinition[];

export function getApiRoute(operationId: string): ApiRouteDefinition | undefined {
  return apiRoutes.find((route) => route.operationId === operationId);
}

export function listApiRoutesByModule(module: ApiModule): ApiRouteDefinition[] {
  return apiRoutes.filter((route) => route.module === module);
}

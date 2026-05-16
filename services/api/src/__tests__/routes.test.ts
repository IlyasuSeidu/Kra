import { describe, expect, it } from "vitest";

import { apiRoutes, getApiRoute, listApiRoutesByModule } from "../routes";

describe("api routes", () => {
  it("keeps operation ids unique", () => {
    const operationIds = apiRoutes.map((route) => route.operationId);

    expect(new Set(operationIds).size).toBe(operationIds.length);
  });

  it("exposes public tracking routes without authenticated scope", () => {
    expect(getApiRoute("cancel_delivery")).toMatchObject({
      authScope: "authenticated",
      path: "/v1/deliveries/:id/cancel",
      capability: "cancel_eligible_delivery"
    });

    expect(getApiRoute("list_deliveries")).toMatchObject({
      authScope: "authenticated",
      path: "/v1/deliveries"
    });

    expect(getApiRoute("get_delivery")).toMatchObject({
      authScope: "authenticated",
      path: "/v1/deliveries/:id"
    });

    expect(getApiRoute("get_delivery_timeline")).toMatchObject({
      authScope: "authenticated",
      path: "/v1/deliveries/:id/timeline"
    });

    expect(getApiRoute("get_public_tracking")).toMatchObject({
      authScope: "public",
      path: "/v1/public/track/:trackingCode",
      idempotent: true
    });

    expect(getApiRoute("request_public_tracking_phone_challenge")).toMatchObject({
      authScope: "public",
      path: "/v1/public/track/:trackingCode/request-verification",
      idempotent: false
    });

    expect(getApiRoute("verify_public_tracking_phone")).toMatchObject({
      authScope: "public",
      path: "/v1/public/track/:trackingCode/verify-phone",
      idempotent: true
    });

    expect(getApiRoute("verify_public_tracking_phone")?.requestSchema).toBeDefined();
    expect(getApiRoute("verify_public_tracking_phone")?.responseSchema).toBeDefined();
  });

  it("registers the MTN MoMo webhook under webhook auth scope", () => {
    expect(getApiRoute("ingest_mtn_momo_webhook")).toMatchObject({
      authScope: "webhook",
      path: "/v1/webhooks/payments/mtn-momo",
      module: "payments"
    });
  });

  it("registers authenticated notification feed routes", () => {
    expect(getApiRoute("list_notifications")).toMatchObject({
      authScope: "authenticated",
      module: "notifications",
      path: "/v1/notifications",
      idempotent: true
    });

    expect(listApiRoutesByModule("notifications").map((route) => route.operationId)).toEqual([
      "list_notifications",
      "dispatch_due_outbound_notifications"
    ]);
    expect(getApiRoute("list_notifications")?.requestSchema).toBeDefined();
    expect(getApiRoute("list_notifications")?.responseSchema).toBeDefined();
    expect(getApiRoute("dispatch_due_outbound_notifications")).toMatchObject({
      authScope: "internal",
      module: "notifications",
      path: "/v1/internal/outbound-notifications/dispatch-due"
    });
    expect(getApiRoute("dispatch_due_outbound_notifications")?.requestSchema).toBeDefined();
    expect(getApiRoute("dispatch_due_outbound_notifications")?.responseSchema).toBeDefined();
  });

  it("requires admin scope for refund and admin overview endpoints", () => {
    expect(getApiRoute("verify_payment")).toMatchObject({
      authScope: "authenticated",
      capability: "view_own_delivery"
    });

    expect(getApiRoute("verify_payment")?.requestSchema).toBeDefined();
    expect(getApiRoute("verify_payment")?.responseSchema).toBeDefined();

    expect(getApiRoute("refund_payment")).toMatchObject({
      authScope: "admin",
      capability: "approve_refund"
    });

    expect(getApiRoute("refund_payment")?.requestSchema).toBeDefined();
    expect(getApiRoute("refund_payment")?.responseSchema).toBeDefined();

    expect(getApiRoute("settle_refund_payment")).toMatchObject({
      authScope: "admin",
      path: "/v1/payments/refund/settle",
      capability: "execute_refund"
    });

    expect(getApiRoute("admin_overview")).toMatchObject({
      authScope: "admin"
    });

    expect(getApiRoute("admin_overview")?.responseSchema).toBeDefined();
    expect(getApiRoute("admin_deliveries")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/deliveries"
    });
    expect(getApiRoute("admin_finance")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/finance"
    });
    expect(getApiRoute("admin_users")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/users",
      capability: "manage_users_and_roles"
    });
    expect(getApiRoute("admin_upsert_user")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/users",
      capability: "manage_users_and_roles"
    });
    expect(getApiRoute("admin_update_user_access")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/users/:id/access",
      capability: "manage_users_and_roles"
    });
    expect(getApiRoute("admin_update_station_status")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/stations/:id/status",
      capability: "override_queue_state"
    });
    expect(getApiRoute("admin_update_station_validation")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/stations/:id/validation",
      capability: "override_queue_state"
    });
    expect(getApiRoute("admin_audit_events")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/audit-events"
    });
    expect(getApiRoute("admin_outbound_notifications")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/outbound-notifications"
    });
    expect(getApiRoute("admin_outbound_notifications")?.requestSchema).toBeDefined();
    expect(getApiRoute("admin_outbound_notifications")?.responseSchema).toBeDefined();
    expect(getApiRoute("admin_webhook_events")).toMatchObject({
      authScope: "admin",
      path: "/v1/admin/webhook-events"
    });
  });

  it("groups handoff operations under the handoffs module", () => {
    expect(listApiRoutesByModule("handoffs").map((route) => route.operationId)).toEqual([
      "confirm_intake",
      "assign_driver",
      "accept_run",
      "dispatch_delivery",
      "confirm_pickup",
      "mark_in_transit",
      "receive_destination",
      "assign_final_mile",
      "accept_final_mile_assignment",
      "mark_out_for_delivery",
      "record_failed_attempt",
      "complete_delivery"
    ]);
  });

  it("registers issue management routes", () => {
    expect(getApiRoute("list_issues")).toMatchObject({
      authScope: "authenticated",
      module: "issues",
      path: "/v1/issues"
    });
    expect(getApiRoute("create_issue")).toMatchObject({
      authScope: "authenticated",
      module: "issues"
    });
    expect(getApiRoute("escalate_issue")).toMatchObject({
      authScope: "admin",
      capability: "escalate_case"
    });
    expect(getApiRoute("resolve_issue")).toMatchObject({
      authScope: "admin",
      path: "/v1/issues/:id/resolve"
    });
  });
});

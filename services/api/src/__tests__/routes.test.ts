import { describe, expect, it } from "vitest";

import { apiRoutes, getApiRoute, listApiRoutesByModule } from "../routes";

describe("api routes", () => {
  it("keeps operation ids unique", () => {
    const operationIds = apiRoutes.map((route) => route.operationId);

    expect(new Set(operationIds).size).toBe(operationIds.length);
  });

  it("exposes public tracking routes without authenticated scope", () => {
    expect(getApiRoute("get_public_tracking")).toMatchObject({
      authScope: "public",
      path: "/v1/public/track/:trackingCode",
      idempotent: true
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

  it("requires admin scope for refund and admin overview endpoints", () => {
    expect(getApiRoute("verify_payment")).toMatchObject({
      authScope: "authenticated",
      capability: "view_own_delivery"
    });

    expect(getApiRoute("verify_payment")?.requestSchema).toBeDefined();
    expect(getApiRoute("verify_payment")?.responseSchema).toBeDefined();

    expect(getApiRoute("refund_payment")).toMatchObject({
      authScope: "admin",
      capability: "execute_refund"
    });

    expect(getApiRoute("refund_payment")?.requestSchema).toBeDefined();
    expect(getApiRoute("refund_payment")?.responseSchema).toBeDefined();

    expect(getApiRoute("admin_overview")).toMatchObject({
      authScope: "admin"
    });

    expect(getApiRoute("admin_overview")?.responseSchema).toBeDefined();
  });

  it("groups handoff operations under the handoffs module", () => {
    expect(listApiRoutesByModule("handoffs").map((route) => route.operationId)).toEqual([
      "confirm_intake",
      "assign_driver",
      "dispatch_delivery",
      "receive_destination",
      "assign_final_mile",
      "complete_delivery"
    ]);
  });
});

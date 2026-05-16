import { describe, expect, it } from "vitest";

import { getAdminOverview } from "../admin";

describe("admin overview", () => {
  it("returns network-wide delivery, payment, and webhook alert counts", async () => {
    const result = await getAdminOverview({
      deliveries: {
        countByStatus() {
          return Promise.resolve([
            { status: "awaiting_driver_assignment", count: 4 },
            { status: "issue_reported", count: 2 },
            { status: "on_hold", count: 1 },
            { status: "delivered", count: 9 }
          ]);
        }
      },
      payments: {
        countByStatus() {
          return Promise.resolve([
            { status: "pending", count: 3 },
            { status: "confirmed", count: 11 },
            { status: "refund_pending", count: 1 }
          ]);
        }
      },
      webhookEvents: {
        countByProcessingStatus() {
          return Promise.resolve([
            { processingStatus: "processed", count: 10 },
            { processingStatus: "unmatched", count: 2 },
            { processingStatus: "manual_review", count: 1 }
          ]);
        }
      },
      now: () => "2026-05-16T12:00:00.000Z"
    });

    expect(result).toEqual({
      generatedAt: "2026-05-16T12:00:00.000Z",
      deliveryStatusCounts: [
        { status: "awaiting_driver_assignment", count: 4 },
        { status: "issue_reported", count: 2 },
        { status: "on_hold", count: 1 },
        { status: "delivered", count: 9 }
      ],
      paymentStatusCounts: [
        { status: "pending", count: 3 },
        { status: "confirmed", count: 11 },
        { status: "refund_pending", count: 1 }
      ],
      operationalAlerts: {
        openIssueLikeDeliveries: 3,
        unmatchedWebhookEvents: 2,
        manualReviewWebhookEvents: 1
      }
    });
  });
});

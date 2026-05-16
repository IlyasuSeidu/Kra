import { describe, expect, it } from "vitest";

import { getAdminOverview, listAdminStations } from "../admin";

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
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countActiveQueuesByStation() {
          return Promise.resolve([]);
        }
      },
      payments: {
        countByStatus() {
          return Promise.resolve([
            { status: "pending", count: 3 },
            { status: "confirmed", count: 11 },
            { status: "refund_pending", count: 1 }
          ]);
        },
        listRecent() {
          return Promise.resolve([]);
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

describe("admin station list", () => {
  it("returns station validation readiness with station metrics", async () => {
    const result = await listAdminStations({
      deliveries: {
        countByStatus() {
          return Promise.resolve([]);
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countActiveQueuesByStation() {
          return Promise.resolve([{ stationId: "ST-ACC-01", count: 3 }]);
        }
      },
      issues: {
        countOpenByStation(stationId) {
          return Promise.resolve(stationId === "ST-ACC-01" ? 1 : 0);
        }
      },
      stations: {
        getById() {
          return Promise.resolve(undefined);
        },
        list() {
          return Promise.resolve([]);
        },
        save() {
          return Promise.resolve();
        }
      },
      now: () => "2026-05-16T12:30:00.000Z"
    });

    expect(result.stations[0]).toMatchObject({
      stationId: "ST-ACC-01",
      activeQueueCount: 3,
      issueCount: 1,
      validation: {
        status: "not_started",
        goLiveEligible: false
      }
    });
  });
});

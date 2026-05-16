import { describe, expect, it } from "vitest";

import { getAdminOverview, listAdminOutboundNotifications, listAdminStations } from "../admin";

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

describe("admin outbound notification list", () => {
  it("returns filtered outbox records for operations review", async () => {
    const result = await listAdminOutboundNotifications(
      {
        status: "failed",
        limit: 10
      },
      {
        outboundNotifications: {
          listRecent(input) {
            expect(input).toEqual({
              status: "failed",
              limit: 10
            });

            return Promise.resolve([
              {
                outboundNotificationId: "ONF-9401",
                channel: "sms",
                provider: "hubtel",
                kind: "receiver_delivery_sms",
                status: "failed",
                dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
                deliveryId: "DEL-9401",
                recipientPhone: "+233240000000",
                trackingCode: "KRA-9401",
                eventType: "out_for_delivery",
                stationName: "Kumasi Adum",
                attemptCount: 1,
                maxAttempts: 2,
                nextAttemptAt: "2026-05-16T15:30:00.000Z",
                createdAt: "2026-05-16T15:00:00.000Z",
                updatedAt: "2026-05-16T15:00:00.000Z",
                lastAttemptAt: "2026-05-16T15:00:00.000Z",
                lastError: {
                  name: "Error",
                  message: "Hubtel timeout"
                }
              }
            ]);
          }
        },
        now: () => "2026-05-16T15:00:00.000Z"
      }
    );

    expect(result).toMatchObject({
      generatedAt: "2026-05-16T15:00:00.000Z",
      notifications: [
        {
          outboundNotificationId: "ONF-9401",
          status: "failed",
          attemptCount: 1
        }
      ]
    });
  });
});

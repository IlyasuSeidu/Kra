import { describe, expect, it } from "vitest";

import {
  getAdminLaunchReadiness,
  getAdminOverview,
  listAdminOutboundNotifications,
  listAdminStations
} from "../admin";

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
        },
        countReconciliationReviewRequired() {
          return Promise.resolve(0);
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
        },
        countOpenP1ByStation() {
          return Promise.resolve(0);
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
          },
          countByStatus() {
            return Promise.resolve(0);
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

describe("admin launch readiness", () => {
  it("blocks launch when validation, P1 issues, reconciliation, or SMS queues are unsafe", async () => {
    const result = await getAdminLaunchReadiness({
      deliveries: {
        countByStatus() {
          return Promise.resolve([]);
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countActiveQueuesByStation() {
          return Promise.resolve([{ stationId: "ST-ACC-01", count: 5 }]);
        }
      },
      issues: {
        countOpenByStation() {
          return Promise.resolve(0);
        },
        countOpenP1ByStation(stationId) {
          return Promise.resolve(stationId === "ST-ACC-01" ? 2 : 0);
        }
      },
      outboundNotifications: {
        listRecent() {
          return Promise.resolve([]);
        },
        countByStatus(status) {
          return Promise.resolve(status === "dead_letter" ? 1 : 0);
        }
      },
      payments: {
        countByStatus() {
          return Promise.resolve([]);
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countReconciliationReviewRequired() {
          return Promise.resolve(1);
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
      now: () => "2026-05-16T16:00:00.000Z"
    });

    expect(result).toMatchObject({
      generatedAt: "2026-05-16T16:00:00.000Z",
      status: "blocked",
      goLiveEligible: false,
      systemChecks: {
        stationValidation: {
          readyStations: 0,
          totalStations: 3
        },
        unresolvedP1Issues: {
          count: 2
        },
        paymentReconciliation: {
          reviewRequiredCount: 1
        },
        receiverSms: {
          deadLetterCount: 1
        }
      }
    });
    expect(result.blockers.map((blocker) => blocker.code)).toEqual(
      expect.arrayContaining([
        "station_validation_incomplete",
        "unresolved_p1_issue",
        "payment_reconciliation_review",
        "dead_letter_receiver_sms"
      ])
    );
    expect(result.stations[0]).toMatchObject({
      stationId: "ST-ACC-01",
      activeQueueCount: 5,
      unresolvedP1IssueCount: 2
    });
  });

  it("allows launch only when every backend readiness signal is clear", async () => {
    const readyValidation = {
      status: "ready" as const,
      dryRunBusinessDaysCompleted: 2,
      controlledPilotBusinessDaysCompleted: 3,
      checklist: {
        activeOperatorsCanSignIn: true,
        intakeDispatchReceiptAudited: true,
        scanOrManualFallbackTested: true,
        noUnresolvedP1Incidents: true,
        escalationAndRefundHandoffTested: true,
        openingHoursStorageAndHandoffConfirmed: true
      },
      scanFallbackSuccessRatePercent: 98,
      goLiveEligible: true,
      blockers: [],
      updatedAt: "2026-05-16T15:00:00.000Z"
    };

    const result = await getAdminLaunchReadiness({
      deliveries: {
        countByStatus() {
          return Promise.resolve([]);
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countActiveQueuesByStation() {
          return Promise.resolve([]);
        }
      },
      issues: {
        countOpenByStation() {
          return Promise.resolve(0);
        },
        countOpenP1ByStation() {
          return Promise.resolve(0);
        }
      },
      outboundNotifications: {
        listRecent() {
          return Promise.resolve([]);
        },
        countByStatus() {
          return Promise.resolve(0);
        }
      },
      payments: {
        countByStatus() {
          return Promise.resolve([]);
        },
        listRecent() {
          return Promise.resolve([]);
        },
        countReconciliationReviewRequired() {
          return Promise.resolve(0);
        }
      },
      stations: {
        getById() {
          return Promise.resolve(undefined);
        },
        list() {
          return Promise.resolve([
            {
              stationId: "ST-ACC-01",
              name: "Accra Central",
              city: "Accra",
              operatingStatus: "active",
              intakeStatus: "open",
              serviceAvailability: {
                standard: true,
                express: true,
                doorstep: true
              },
              validation: readyValidation,
              createdAt: "2026-05-16T15:00:00.000Z",
              updatedAt: "2026-05-16T15:00:00.000Z"
            },
            {
              stationId: "ST-KMS-01",
              name: "Kumasi Adum",
              city: "Kumasi",
              operatingStatus: "active",
              intakeStatus: "open",
              serviceAvailability: {
                standard: true,
                express: true,
                doorstep: true
              },
              validation: readyValidation,
              createdAt: "2026-05-16T15:00:00.000Z",
              updatedAt: "2026-05-16T15:00:00.000Z"
            },
            {
              stationId: "ST-TML-01",
              name: "Tamale Central",
              city: "Tamale",
              operatingStatus: "active",
              intakeStatus: "open",
              serviceAvailability: {
                standard: true,
                express: true,
                doorstep: true
              },
              validation: readyValidation,
              createdAt: "2026-05-16T15:00:00.000Z",
              updatedAt: "2026-05-16T15:00:00.000Z"
            }
          ]);
        },
        save() {
          return Promise.resolve();
        }
      },
      now: () => "2026-05-16T16:15:00.000Z"
    });

    expect(result).toMatchObject({
      status: "ready",
      goLiveEligible: true,
      blockers: [],
      systemChecks: {
        stationValidation: {
          readyStations: 3,
          totalStations: 3
        }
      }
    });
  });
});

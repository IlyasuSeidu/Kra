import { describe, expect, it } from "vitest";

import {
  createSupportIssue,
  escalateSupportIssue,
  getSupportIssue,
  listSupportIssues
} from "../issues";
import type { DeliveryRecord } from "../deliveries";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-9301",
    trackingCode: "KRA-9301",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Kojo Asante",
      phone: "+233240000000"
    },
    package: {
      description: "Phone accessories",
      weightKg: 1.8,
      sizeTier: "standard",
      isFragile: false,
      declaredValueGhs: 300
    },
    serviceType: "standard",
    doorstepRequested: false,
    currentStatus: "received_at_destination",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: "station_operator",
    currentCustodyActorId: "USR-OP-002",
    latestEvent: {
      type: "delivery_received_at_destination",
      occurredAt: "2026-05-16T14:00:00.000Z"
    },
    latestTouchpoint: {
      role: "station_operator",
      stationId: "ST-KMS-01",
      occurredAt: "2026-05-16T14:00:00.000Z"
    },
    createdAt: "2026-05-16T10:00:00.000Z",
    ...overrides
  };
}

describe("support issue services", () => {
  it("creates a support issue for a sender-owned delivery", async () => {
    const createdIssues: unknown[] = [];

    const result = await createSupportIssue(
      {
        userId: "USR-SND-001",
        role: "sender",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      {
        deliveryId: "DEL-9301",
        category: "delay",
        severity: "p3",
        summary: "Package has not moved today"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery());
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        issues: {
          create(issue) {
            createdIssues.push(issue);
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          save() {
            return resolveVoid();
          },
          listByDeliveryId() {
            return resolve([]);
          },
          listRecent() {
            return resolve([]);
          },
          listByDeliveryIds() {
            return resolve([]);
          },
          countOpenByStation() {
            return resolve(0);
          }
        },
        identityFactory: {
          nextIssueId: () => "ISS-9301"
        },
        now: () => "2026-05-16T14:30:00.000Z"
      }
    );

    expect(createdIssues).toHaveLength(1);
    expect(result.response).toMatchObject({
      issueId: "ISS-9301",
      deliveryId: "DEL-9301",
      status: "open"
    });
  });

  it("escalates and returns an existing issue for admin workflows", async () => {
    const storedIssue = {
      issueId: "ISS-9301",
      deliveryId: "DEL-9301",
      status: "open" as const,
      severity: "p2" as const,
      category: "damage" as const,
      summary: "Package arrived damaged",
      reporter: {
        actorId: "USR-SND-001",
        actorRole: "sender" as const
      },
      createdAt: "2026-05-16T14:30:00.000Z",
      updatedAt: "2026-05-16T14:30:00.000Z"
    };

    const escalated = await escalateSupportIssue(
      {
        userId: "USR-OPS-001",
        role: "ops_admin",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      "ISS-9301",
      {
        reasonCode: "loss_investigation",
        note: "Escalate to operations lead"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery());
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        issues: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(storedIssue);
          },
          save(issue) {
            expect(issue.status).toBe("escalated");
            return resolveVoid();
          },
          listByDeliveryId() {
            return resolve([]);
          },
          listRecent() {
            return resolve([]);
          },
          listByDeliveryIds() {
            return resolve([]);
          },
          countOpenByStation() {
            return resolve(0);
          }
        },
        now: () => "2026-05-16T15:00:00.000Z"
      }
    );

    const fetched = await getSupportIssue(
      {
        userId: "USR-SND-001",
        role: "sender",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      "ISS-9301",
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery());
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        issues: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve({
              ...storedIssue,
              status: "escalated" as const,
              escalatedAt: "2026-05-16T15:00:00.000Z",
              escalatedByActorId: "USR-OPS-001",
              escalationReasonCode: "loss_investigation",
              updatedAt: "2026-05-16T15:00:00.000Z"
            });
          },
          save() {
            return resolveVoid();
          },
          listByDeliveryId() {
            return resolve([]);
          },
          listRecent() {
            return resolve([]);
          },
          listByDeliveryIds() {
            return resolve([]);
          },
          countOpenByStation() {
            return resolve(0);
          }
        }
      }
    );

    expect(escalated.response.status).toBe("escalated");
    expect(fetched).toMatchObject({
      issueId: "ISS-9301",
      escalatedByActorId: "USR-OPS-001"
    });
  });

  it("lists accessible issues for a station operator across accessible deliveries", async () => {
    const response = await listSupportIssues(
      {
        userId: "USR-OP-002",
        role: "station_operator",
        stationId: "ST-KMS-01",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      {
        status: "open"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery());
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          },
          listAccessible() {
            return resolve([makeDelivery()]);
          }
        },
        issues: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          save() {
            return resolveVoid();
          },
          listByDeliveryId() {
            return resolve([]);
          },
          listRecent() {
            return resolve([]);
          },
          listByDeliveryIds() {
            return resolve([
              {
                issueId: "ISS-9302",
                deliveryId: "DEL-9301",
                status: "open" as const,
                severity: "p2" as const,
                category: "handoff" as const,
                summary: "Destination intake needs attention",
                reporter: {
                  actorId: "USR-OP-002",
                  actorRole: "station_operator" as const
                },
                createdAt: "2026-05-16T14:30:00.000Z",
                updatedAt: "2026-05-16T14:35:00.000Z"
              }
            ]);
          },
          countOpenByStation() {
            return resolve(0);
          }
        }
      }
    );

    expect(response).toMatchObject({
      issues: [
        {
          issueId: "ISS-9302",
          deliveryId: "DEL-9301",
          status: "open"
        }
      ]
    });
  });
});

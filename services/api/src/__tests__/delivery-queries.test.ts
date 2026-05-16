import { describe, expect, it } from "vitest";

import { getDeliveryDetail, getDeliveryTimeline } from "../delivery-queries";
import type { DeliveryRecord } from "../deliveries";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-9201",
    trackingCode: "KRA-9201",
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

const senderPrincipal = {
  userId: "USR-SND-001",
  role: "sender" as const,
  capabilities: [],
  authMethod: "firebase_id_token" as const
};

describe("delivery query services", () => {
  it("returns a delivery detail projection for the sender", async () => {
    const result = await getDeliveryDetail(senderPrincipal, "DEL-9201", {
      deliveries: {
        create() {
          return Promise.resolve();
        },
        getById() {
          return resolve(makeDelivery());
        },
        getByTrackingCode() {
          return resolve(undefined);
        },
        updatePaymentStatus() {
          return Promise.resolve();
        }
      }
    });

    expect(result).toMatchObject({
      deliveryId: "DEL-9201",
      trackingCode: "KRA-9201",
      currentStatus: "received_at_destination",
      paymentStatus: "confirmed"
    });
  });

  it("builds a mixed timeline from delivery, handoff, and issue records", async () => {
    const result = await getDeliveryTimeline(senderPrincipal, "DEL-9201", {
      deliveries: {
        create() {
          return Promise.resolve();
        },
        getById() {
          return resolve(makeDelivery());
        },
        getByTrackingCode() {
          return resolve(undefined);
        },
        updatePaymentStatus() {
          return Promise.resolve();
        }
      },
      deliveryEvents: {
        listByDeliveryId() {
          return resolve([
            {
              eventId: "EVT-DEL-9201",
              deliveryId: "DEL-9201",
              type: "delivery_received_at_destination",
              previousStatus: "in_transit",
              nextStatus: "received_at_destination",
              occurredAt: "2026-05-16T14:00:00.000Z",
              actorId: "USR-OP-002",
              actorRole: "station_operator",
              stationId: "ST-KMS-01"
            }
          ]);
        }
      },
      handoffEvents: {
        listByDeliveryId() {
          return resolve([
            {
              handoffEventId: "EVT-HOF-9201",
              deliveryId: "DEL-9201",
              handoffType: "driver_to_destination_station",
              fromRole: "driver",
              fromActorId: "USR-DRV-001",
              toRole: "station_operator",
              toActorId: "USR-OP-002",
              stationId: "ST-KMS-01",
              occurredAt: "2026-05-16T14:00:00.000Z",
              proof: {
                reference: "PKG-9201",
                type: "package_scan",
                condition: "ok"
              }
            }
          ]);
        }
      },
      issues: {
        listByDeliveryId() {
          return resolve([
            {
              issueId: "ISS-9201",
              deliveryId: "DEL-9201",
              status: "open",
              severity: "p3",
              category: "delay",
              summary: "Receiver requested status clarification",
              reporter: {
                actorId: "USR-SND-001",
                actorRole: "sender"
              },
              createdAt: "2026-05-16T14:05:00.000Z",
              updatedAt: "2026-05-16T14:05:00.000Z"
            }
          ]);
        }
      }
    });

    expect(result.entries).toHaveLength(3);
    expect(result.entries[0]).toMatchObject({
      entryType: "issue_event",
      entryId: "ISS-9201"
    });
    expect(result.entries[1]).toMatchObject({
      entryType: "delivery_event",
      entryId: "EVT-DEL-9201"
    });
  });
});

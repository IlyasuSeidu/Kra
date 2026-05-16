import { describe, expect, it } from "vitest";

import { type DeliveryRecord } from "../deliveries";
import { getPublicTracking } from "../public-tracking";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(
  overrides: Partial<DeliveryRecord> = {}
): DeliveryRecord {
  return {
    deliveryId: "DEL-3001",
    trackingCode: "KRA-3001",
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
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_created",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    latestTouchpoint: {
      role: "station_operator",
      stationId: "ST-KMS-01",
      occurredAt: "2026-05-16T09:00:00.000Z"
    },
    createdAt: "2026-05-15T12:00:00.000Z",
    ...overrides
  };
}

describe("public tracking projection", () => {
  it("projects a customer-safe destination-arrival response", async () => {
    const result = await getPublicTracking("KRA-3001", {
      deliveries: {
        create() {
          return resolveVoid();
        },
        getById() {
          return resolve(undefined);
        },
        getByTrackingCode() {
          return resolve(makeDelivery());
        },
        updatePaymentStatus() {
          return resolveVoid();
        }
      }
    });

    expect(result).toEqual({
      deliveryId: "DEL-3001",
      trackingCode: "KRA-3001",
      status: "received_at_destination",
      publicLabel: "Arrived at destination station",
      latestTouchpoint: {
        role: "station_operator",
        stationId: "ST-KMS-01",
        occurredAt: "2026-05-16T09:00:00.000Z"
      },
      receiverVerificationRequired: false,
      etaLabel: "Expected today"
    });
  });

  it("requires verification for pickup or final-mile sensitive stages", async () => {
    const result = await getPublicTracking("KRA-3001", {
      deliveries: {
        create() {
          return resolveVoid();
        },
        getById() {
          return resolve(undefined);
        },
        getByTrackingCode() {
          return resolve(makeDelivery({
            currentStatus: "out_for_delivery",
            latestTouchpoint: {
              role: "final_mile_courier",
              occurredAt: "2026-05-16T11:00:00.000Z"
            }
          }));
        },
        updatePaymentStatus() {
          return resolveVoid();
        }
      }
    });

    expect(result.receiverVerificationRequired).toBe(true);
    expect(result.publicLabel).toBe("Out for delivery");
    expect(result.latestTouchpoint).toEqual({
      role: "final_mile_courier",
      occurredAt: "2026-05-16T11:00:00.000Z"
    });
  });

  it("rejects unknown tracking codes", async () => {
    await expect(() =>
      getPublicTracking("KRA-MISSING", {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        }
      })
    ).rejects.toBeInstanceOf(ApiServiceError);
  });
});

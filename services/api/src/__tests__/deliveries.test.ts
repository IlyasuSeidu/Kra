import { describe, expect, it } from "vitest";

import {
  type DeliveryRecord,
  createDeliveryBooking
} from "../deliveries";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

describe("delivery booking service", () => {
  it("creates and persists a delivery booking with a response contract", async () => {
    const createdDeliveries: DeliveryRecord[] = [];

    const result = await createDeliveryBooking(
      "USR-SND-001",
      {
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
        doorstepRequested: false
      },
      {
        deliveries: {
          create(delivery) {
            createdDeliveries.push(delivery);
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
        },
        identityFactory: {
          nextDeliveryId: () => "DEL-1001",
          nextTrackingCode: () => "KRA-1001"
        },
        now: () => "2026-05-15T14:00:00.000Z"
      }
    );

    expect(createdDeliveries).toHaveLength(1);
    expect(result.delivery.latestTouchpoint).toEqual({
      role: "system",
      occurredAt: "2026-05-15T14:00:00.000Z",
      stationId: "ST-ACC-01"
    });
    expect(result.response).toEqual({
      deliveryId: "DEL-1001",
      trackingCode: "KRA-1001",
      status: "created",
      quote: {
        currency: "GHS",
        amount: 35
      },
      paymentRequiredBeforeDispatch: true
    });
  });

  it("rejects mismatched sender identity", async () => {
    await expect(() =>
      createDeliveryBooking(
        "USR-SND-002",
        {
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
          doorstepRequested: false
        },
        {
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
          },
          identityFactory: {
            nextDeliveryId: () => "DEL-1001",
            nextTrackingCode: () => "KRA-1001"
          },
          now: () => "2026-05-15T14:00:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });
});

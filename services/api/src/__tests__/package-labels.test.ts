import { describe, expect, it } from "vitest";

import type { DeliveryRecord } from "../deliveries";
import {
  assertPackageScanMatchesDelivery,
  reservePackageLabelForDelivery,
  type PackageLabelRecord
} from "../package-labels";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-7101",
    trackingCode: "KRA-7101",
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
    currentStatus: "received_at_origin",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: "station_operator",
    currentCustodyActorId: "USR-OP-001",
    latestEvent: {
      type: "delivery_received_at_origin",
      occurredAt: "2026-05-16T08:00:00.000Z"
    },
    latestTouchpoint: {
      role: "station_operator",
      stationId: "ST-ACC-01",
      occurredAt: "2026-05-16T08:00:00.000Z"
    },
    createdAt: "2026-05-16T07:55:00.000Z",
    ...overrides
  };
}

function makeLabel(overrides: Partial<PackageLabelRecord> = {}): PackageLabelRecord {
  return {
    scanCode: "PKG-7101",
    deliveryId: "DEL-7101",
    trackingCode: "KRA-7101",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    createdAt: "2026-05-16T08:00:00.000Z",
    createdByUserId: "USR-OP-001",
    createdByRole: "station_operator",
    ...overrides
  };
}

describe("package label registry", () => {
  it("reserves a scan code immutably for one delivery", async () => {
    const delivery = makeDelivery();
    const reserved = await reservePackageLabelForDelivery(
      {
        delivery,
        scanCode: "PKG-7101",
        actor: {
          actorId: "USR-OP-001",
          role: "station_operator",
          stationId: "ST-ACC-01"
        },
        occurredAt: "2026-05-16T08:00:00.000Z"
      },
      {
        getByScanCode() {
          return resolve(undefined);
        },
        reserveForDelivery(label) {
          return resolve(label);
        }
      }
    );

    expect(reserved).toMatchObject({
      scanCode: "PKG-7101",
      deliveryId: "DEL-7101",
      trackingCode: "KRA-7101"
    });
  });

  it("blocks reuse of a scan code bound to another delivery", async () => {
    await expect(() =>
      reservePackageLabelForDelivery(
        {
          delivery: makeDelivery(),
          scanCode: "PKG-7101",
          actor: {
            actorId: "USR-OP-001",
            role: "station_operator",
            stationId: "ST-ACC-01"
          },
          occurredAt: "2026-05-16T08:00:00.000Z"
        },
        {
          getByScanCode() {
            return resolve(undefined);
          },
          reserveForDelivery() {
            return resolve(makeLabel({ deliveryId: "DEL-OTHER" }));
          }
        }
      )
    ).rejects.toMatchObject({
      code: "PACKAGE_SCAN_MISMATCH"
    });
  });

  it("blocks handoff scans that do not match the delivery", async () => {
    await expect(() =>
      assertPackageScanMatchesDelivery(
        {
          delivery: makeDelivery(),
          scanCode: "PKG-WRONG"
        },
        {
          getByScanCode() {
            return resolve(makeLabel({ scanCode: "PKG-WRONG", deliveryId: "DEL-OTHER" }));
          },
          reserveForDelivery(label) {
            return resolve(label);
          }
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });
});

import { describe, expect, it } from "vitest";

import { buildPrincipalFromDecodedToken, canAccessDelivery } from "../auth";
import type { DeliveryRecord } from "../deliveries";

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-9101",
    trackingCode: "KRA-9101",
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
    currentStatus: "assigned_to_driver",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: "driver",
    currentCustodyActorId: "USR-DRV-001",
    assignedDriverId: "USR-DRV-001",
    latestEvent: {
      type: "driver_assigned",
      occurredAt: "2026-05-16T12:00:00.000Z"
    },
    latestTouchpoint: {
      role: "driver",
      occurredAt: "2026-05-16T12:00:00.000Z"
    },
    createdAt: "2026-05-16T10:00:00.000Z",
    ...overrides
  };
}

describe("auth helpers", () => {
  it("builds a principal from firebase claims", () => {
    const principal = buildPrincipalFromDecodedToken({
      uid: "USR-DRV-001",
      kra_role: "driver",
      kra_station_id: "ST-ACC-01"
    } as never);

    expect(principal).toMatchObject({
      userId: "USR-DRV-001",
      role: "driver",
      stationId: "ST-ACC-01",
      authMethod: "firebase_id_token"
    });
  });

  it("checks sender, station, and assignment delivery access scopes", () => {
    const delivery = makeDelivery();

    expect(
      canAccessDelivery(
        {
          userId: "USR-SND-001",
          role: "sender",
          capabilities: [],
          authMethod: "firebase_id_token"
        },
        delivery
      )
    ).toBe(true);

    expect(
      canAccessDelivery(
        {
          userId: "USR-OP-001",
          role: "station_operator",
          stationId: "ST-KMS-01",
          capabilities: [],
          authMethod: "firebase_id_token"
        },
        delivery
      )
    ).toBe(true);

    expect(
      canAccessDelivery(
        {
          userId: "USR-DRV-999",
          role: "driver",
          capabilities: [],
          authMethod: "firebase_id_token"
        },
        delivery
      )
    ).toBe(false);
  });
});

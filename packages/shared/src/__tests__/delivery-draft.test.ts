import { describe, expect, it } from "vitest";

import { createDeliveryDraft } from "../domain/delivery-draft";

describe("delivery draft", () => {
  const refs = {
    deliveryId: "DEL-0001",
    trackingCode: "KRA-0001",
    createdAt: "2026-05-15T12:00:00.000Z"
  };

  it("creates a standard delivery draft with a locked quote", () => {
    expect(
      createDeliveryDraft(
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
        refs
      )
    ).toEqual({
      deliveryId: "DEL-0001",
      trackingCode: "KRA-0001",
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
      doorstepDistanceKm: undefined,
      currentStatus: "created",
      paymentStatus: "pending",
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
      createdAt: "2026-05-15T12:00:00.000Z"
    });
  });

  it("supports combined express and doorstep pricing in the draft", () => {
    expect(
      createDeliveryDraft(
        {
          senderId: "USR-SND-001",
          originStationId: "ST-ACC-01",
          destinationStationId: "ST-TML-01",
          receiver: {
            name: "Amina Fuseini",
            phone: "+233550000000",
            addressText: "Tamale Market Road"
          },
          package: {
            description: "Documents",
            weightKg: 2,
            sizeTier: "standard",
            isFragile: false,
            declaredValueGhs: 200
          },
          serviceType: "express",
          doorstepRequested: true,
          doorstepDistanceKm: 4
        },
        {
          deliveryId: "DEL-0002",
          trackingCode: "KRA-0002",
          createdAt: "2026-05-16T09:30:00.000Z"
        }
      ).quote.amount
    ).toBe(106);
  });

  it("rejects same-station bookings", () => {
    expect(() =>
      createDeliveryDraft(
        {
          senderId: "USR-SND-001",
          originStationId: "ST-ACC-01",
          destinationStationId: "ST-ACC-01",
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
        refs
      )
    ).toThrow("Origin and destination stations must be different.");
  });

  it("requires a receiver address for doorstep deliveries", () => {
    expect(() =>
      createDeliveryDraft(
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
          doorstepRequested: true,
          doorstepDistanceKm: 4
        },
        refs
      )
    ).toThrow("Doorstep deliveries require a receiver address.");
  });

  it("requires a distance estimate for doorstep deliveries", () => {
    expect(() =>
      createDeliveryDraft(
        {
          senderId: "USR-SND-001",
          originStationId: "ST-ACC-01",
          destinationStationId: "ST-KMS-01",
          receiver: {
            name: "Kojo Asante",
            phone: "+233240000000",
            addressText: "Kumasi Ridge"
          },
          package: {
            description: "Phone accessories",
            weightKg: 1.8,
            sizeTier: "standard",
            isFragile: false,
            declaredValueGhs: 300
          },
          serviceType: "standard",
          doorstepRequested: true
        },
        refs
      )
    ).toThrow("Doorstep deliveries require a distance estimate.");
  });

  it("rejects doorstep distance when doorstep is not requested", () => {
    expect(() =>
      createDeliveryDraft(
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
          doorstepRequested: false,
          doorstepDistanceKm: 4
        },
        refs
      )
    ).toThrow("Doorstep distance should be omitted when doorstep is not requested.");
  });
});

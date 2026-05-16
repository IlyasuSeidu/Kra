import { describe, expect, it } from "vitest";

import {
  calculateDeliveryQuote,
  calculateDeliveryQuoteBreakdown,
  getBaseRouteFee
} from "../domain/pricing";

describe("pricing", () => {
  it("returns the base fee for a standard small package", () => {
    expect(getBaseRouteFee("ST-ACC-01", "ST-KMS-01")).toBe(35);
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 1.5,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 300
      })
    ).toBe(35);
  });

  it("adds weight and size surcharges", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-KMS-01",
        destinationStationId: "ST-TML-01",
        weightKg: 7,
        sizeTier: "bulky",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 500
      })
    ).toBe(83);
  });

  it("applies the heaviest supported self-serve weight tier", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-KMS-01",
        destinationStationId: "ST-ACC-01",
        weightKg: 15,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 300
      })
    ).toBe(70);
  });

  it("adds fragile, express, and declared value surcharges", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-TML-01",
        weightKg: 3,
        sizeTier: "standard",
        serviceType: "express",
        doorstepRequested: false,
        isFragile: true,
        declaredValueGhs: 2500
      })
    ).toBe(129);
  });

  it("adds doorstep surcharge based on distance", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-TML-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 2,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: true,
        isFragile: false,
        declaredValueGhs: 100,
        doorstepDistanceKm: 6
      })
    ).toBe(75);
  });

  it("allows express service and doorstep surcharge on the same booking", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 1,
        sizeTier: "standard",
        serviceType: "express",
        doorstepRequested: true,
        isFragile: false,
        declaredValueGhs: 100,
        doorstepDistanceKm: 4
      })
    ).toBe(65);
  });

  it("uses the lower doorstep surcharge band for nearby final-mile delivery", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-TML-01",
        weightKg: 2,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: true,
        isFragile: false,
        declaredValueGhs: 150,
        doorstepDistanceKm: 3
      })
    ).toBe(80);
  });

  it("defaults missing doorstep distance to the minimum service band", () => {
    expect(
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 1,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: true,
        isFragile: false,
        declaredValueGhs: 150
      })
    ).toBe(50);
  });

  it("returns a quote breakdown that matches the final total", () => {
    expect(
      calculateDeliveryQuoteBreakdown({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 3,
        sizeTier: "standard",
        serviceType: "express",
        doorstepRequested: true,
        isFragile: true,
        declaredValueGhs: 2500,
        doorstepDistanceKm: 4
      })
    ).toEqual({
      baseFee: 35,
      weightSurcharge: 8,
      sizeSurcharge: 0,
      fragileSurcharge: 10,
      declaredValueSurcharge: 20,
      expressSurcharge: 15,
      doorstepSurcharge: 15,
      totalAmount: 103
    });
  });

  it("rejects unsupported route or unsupported self-serve thresholds", () => {
    expect(() =>
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-ACC-01",
        weightKg: 1,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 100
      })
    ).toThrow("Route is not enabled.");

    expect(() =>
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 21,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 100
      })
    ).toThrow("Manual quote required for weight above 20kg.");
  });

  it("rejects oversized packages and doorstep requests beyond launch radius", () => {
    expect(() =>
      calculateDeliveryQuote({
        originStationId: "ST-ACC-01",
        destinationStationId: "ST-KMS-01",
        weightKg: 5,
        sizeTier: "oversized",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 200
      })
    ).toThrow("Manual quote required for oversized packages.");

    expect(() =>
      calculateDeliveryQuote({
        originStationId: "ST-KMS-01",
        destinationStationId: "ST-TML-01",
        weightKg: 2,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: true,
        isFragile: false,
        declaredValueGhs: 200,
        doorstepDistanceKm: 11
      })
    ).toThrow("Doorstep not available beyond 10km in v1.");
  });

  it("rejects declared values above the self-serve threshold", () => {
    expect(() =>
      calculateDeliveryQuote({
        originStationId: "ST-KMS-01",
        destinationStationId: "ST-ACC-01",
        weightKg: 2,
        sizeTier: "standard",
        serviceType: "standard",
        doorstepRequested: false,
        isFragile: false,
        declaredValueGhs: 5001
      })
    ).toThrow("Declared value above GHS 5,000 is not self-serve in v1.");
  });
});

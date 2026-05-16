import { describe, expect, it } from "vitest";

import {
  apiErrorResponseSchema,
  buildApiErrorResponse,
  createDeliveryRequestSchema,
  mtnMomoWebhookRequestSchema,
  mtnMomoWebhookResponseSchema,
  paymentVerifyRequestSchema,
  paymentVerifyResponseSchema,
  publicTrackingResponseSchema
} from "../contracts/api";

describe("api contracts", () => {
  it("accepts a valid create delivery request", () => {
    expect(
      createDeliveryRequestSchema.parse({
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
      })
    ).toMatchObject({
      originStationId: "ST-ACC-01",
      destinationStationId: "ST-KMS-01",
      doorstepRequested: false
    });
  });

  it("rejects inconsistent doorstep and route input", () => {
    const result = createDeliveryRequestSchema.safeParse({
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
      doorstepRequested: true
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail.");
    }

    expect(result.error.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Origin and destination must be different.",
        "Doorstep delivery requires a receiver address.",
        "Doorstep delivery requires a distance estimate."
      ])
    );
  });

  it("builds a schema-valid api error response", () => {
    expect(
      apiErrorResponseSchema.parse(
        buildApiErrorResponse(
          "REQ-12345",
          "PAYMENT_REQUIRED",
          "Delivery cannot be dispatched before payment is confirmed.",
          {
            deliveryId: "DEL-0001"
          }
        )
      )
    ).toEqual({
      requestId: "REQ-12345",
      error: {
        code: "PAYMENT_REQUIRED",
        message: "Delivery cannot be dispatched before payment is confirmed.",
        details: {
          deliveryId: "DEL-0001"
        }
      }
    });
  });

  it("accepts a public tracking response with a customer-safe touchpoint", () => {
    expect(
      publicTrackingResponseSchema.parse({
        deliveryId: "DEL-0001",
        trackingCode: "KRA-0001",
        status: "received_at_destination",
        publicLabel: "Arrived at destination station",
        latestTouchpoint: {
          role: "station_operator",
          stationId: "ST-KMS-01",
          occurredAt: "2026-05-15T13:30:00.000Z"
        },
        receiverVerificationRequired: false,
        etaLabel: "Expected today"
      })
    ).toMatchObject({
      deliveryId: "DEL-0001",
      status: "received_at_destination"
    });
  });

  it("accepts verify-payment request and response contracts", () => {
    expect(
      paymentVerifyRequestSchema.parse({
        deliveryId: "DEL-0001"
      })
    ).toEqual({
      deliveryId: "DEL-0001"
    });

    expect(
      paymentVerifyResponseSchema.parse({
        paymentId: "PAY-0001",
        deliveryId: "DEL-0001",
        provider: "mtn_momo",
        paymentStatus: "confirmed",
        providerReference: "MTN-REF-0001",
        verificationCheckedAt: "2026-05-15T13:30:00.000Z"
      })
    ).toMatchObject({
      paymentId: "PAY-0001",
      paymentStatus: "confirmed"
    });
  });

  it("accepts MTN MoMo webhook request and acknowledgement contracts", () => {
    expect(
      mtnMomoWebhookRequestSchema.parse({
        providerEventId: "EVT-001",
        providerReference: "MTN-REF-0001",
        eventType: "payment.confirmed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-15T13:30:00.000Z",
        rawPayload: {
          externalId: "abc123"
        }
      })
    ).toMatchObject({
      providerReference: "MTN-REF-0001",
      eventType: "payment.confirmed"
    });

    expect(
      mtnMomoWebhookResponseSchema.parse({
        eventId: "EVT-WEB-0001",
        acknowledgement: "processed",
        matchedPaymentId: "PAY-0001",
        matchedDeliveryId: "DEL-0001"
      })
    ).toMatchObject({
      acknowledgement: "processed",
      matchedPaymentId: "PAY-0001"
    });
  });
});

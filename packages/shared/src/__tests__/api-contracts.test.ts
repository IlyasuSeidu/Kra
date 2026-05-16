import { describe, expect, it } from "vitest";

import {
  acceptFinalMileAssignmentRequestSchema,
  acceptRunRequestSchema,
  adminUpdateStationStatusRequestSchema,
  adminUpdateStationStatusResponseSchema,
  adminUpdateUserAccessRequestSchema,
  adminUserListResponseSchema,
  adminUserResponseSchema,
  adminUpsertUserRequestSchema,
  adminWebhookEventListResponseSchema,
  adminOverviewResponseSchema,
  auditEventListResponseSchema,
  apiErrorResponseSchema,
  assignDriverRequestSchema,
  assignFinalMileRequestSchema,
  buildApiErrorResponse,
  cancelDeliveryRequestSchema,
  cancelDeliveryResponseSchema,
  completeDeliveryRequestSchema,
  confirmDriverPickupRequestSchema,
  confirmIntakeRequestSchema,
  createDeliveryRequestSchema,
  deliveryListResponseSchema,
  deliveryLifecycleResponseSchema,
  dispatchDeliveryRequestSchema,
  issueListResponseSchema,
  markInTransitRequestSchema,
  markOutForDeliveryRequestSchema,
  mtnMomoWebhookRequestSchema,
  mtnMomoWebhookResponseSchema,
  notificationListResponseSchema,
  paymentVerifyRequestSchema,
  paymentVerifyResponseSchema,
  publicTrackingResponseSchema,
  requestPhoneVerificationChallengeRequestSchema,
  requestPhoneVerificationChallengeResponseSchema,
  recordFailedAttemptRequestSchema,
  receiveDestinationRequestSchema,
  refundPaymentRequestSchema,
  refundPaymentResponseSchema,
  resolveIssueRequestSchema,
  settleRefundRequestSchema,
  settleRefundResponseSchema,
  verifyPhoneResponseSchema
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

  it("accepts a delivery list response contract", () => {
    expect(
      deliveryListResponseSchema.parse({
        deliveries: [
          {
            deliveryId: "DEL-0001",
            trackingCode: "KRA-0001",
            currentStatus: "received_at_destination",
            paymentStatus: "confirmed",
            originStationId: "ST-ACC-01",
            destinationStationId: "ST-KMS-01",
            serviceType: "standard",
            receiverName: "Kojo Asante",
            latestOccurredAt: "2026-05-16T14:00:00.000Z",
            latestTouchpointRole: "station_operator",
            latestTouchpointStationId: "ST-KMS-01",
            doorstepRequested: false
          }
        ]
      })
    ).toMatchObject({
      deliveries: [
        {
          deliveryId: "DEL-0001",
          trackingCode: "KRA-0001"
        }
      ]
    });
  });

  it("accepts issue, audit, and reconciliation list response contracts", () => {
    expect(
      resolveIssueRequestSchema.parse({
        nextStatus: "resolved",
        resolutionCode: "refund_approved",
        note: "Refund approved and sender informed."
      })
    ).toMatchObject({
      nextStatus: "resolved",
      resolutionCode: "refund_approved"
    });

    expect(
      issueListResponseSchema.parse({
        issues: [
          {
            issueId: "ISS-0001",
            deliveryId: "DEL-0001",
            status: "open",
            severity: "p2",
            category: "damage",
            summary: "Package arrived damaged",
            reporter: {
              actorId: "USR-SND-001",
              actorRole: "sender"
            },
            createdAt: "2026-05-16T14:00:00.000Z",
            updatedAt: "2026-05-16T14:05:00.000Z",
            resolvedAt: "2026-05-16T14:10:00.000Z",
            resolvedByActorId: "USR-SUP-001",
            resolutionCode: "refund_approved",
            resolutionNote: "Refund approved and sender informed."
          }
        ]
      })
    ).toMatchObject({
      issues: [
        {
          issueId: "ISS-0001"
        }
      ]
    });

    expect(
      auditEventListResponseSchema.parse({
        events: [
          {
            eventId: "AUD-0001",
            requestId: "REQ-0001",
            action: "assign_driver",
            actorId: "USR-OPS-001",
            actorRole: "station_operator",
            occurredAt: "2026-05-16T14:10:00.000Z",
            stationId: "ST-ACC-01",
            targetType: "delivery",
            targetId: "DEL-0001",
            metadata: {
              responseStatusCode: 200
            }
          }
        ]
      })
    ).toMatchObject({
      events: [
        {
          eventId: "AUD-0001",
          targetType: "delivery"
        }
      ]
    });

    expect(
      adminWebhookEventListResponseSchema.parse({
        generatedAt: "2026-05-16T14:15:00.000Z",
        events: [
          {
            eventId: "EVT-WEB-0001",
            provider: "mtn_momo",
            providerReference: "MTN-REF-0001",
            eventType: "payment.confirmed",
            amountGhs: 35,
            currency: "GHS",
            occurredAt: "2026-05-16T14:00:00.000Z",
            receivedAt: "2026-05-16T14:00:05.000Z",
            processingStatus: "processed",
            matchedPaymentId: "PAY-0001",
            matchedDeliveryId: "DEL-0001"
          }
        ]
      })
    ).toMatchObject({
      events: [
        {
          eventId: "EVT-WEB-0001",
          processingStatus: "processed"
        }
      ]
    });
  });

  it("accepts notification feed response contracts", () => {
    expect(
      notificationListResponseSchema.parse({
        notifications: [
          {
            notificationId: "NTF-0001",
            type: "ready_for_pickup",
            status: "unread",
            title: "Ready for pickup",
            body: "Your package is ready for receiver pickup at the destination station.",
            deliveryId: "DEL-0001",
            createdAt: "2026-05-16T14:15:00.000Z"
          }
        ]
      })
    ).toMatchObject({
      notifications: [
        {
          notificationId: "NTF-0001",
          type: "ready_for_pickup"
        }
      ]
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

  it("accepts explicit driver and final-mile progress request contracts", () => {
    expect(
      acceptRunRequestSchema.parse({
        note: "Run acknowledged by driver"
      })
    ).toEqual({
      note: "Run acknowledged by driver"
    });

    expect(
      markInTransitRequestSchema.parse({
        note: "Departed Accra station"
      })
    ).toEqual({
      note: "Departed Accra station"
    });

    expect(
      markOutForDeliveryRequestSchema.parse({
        note: "Courier en route to receiver"
      })
    ).toEqual({
      note: "Courier en route to receiver"
    });

    expect(
      acceptFinalMileAssignmentRequestSchema.parse({
        note: "Courier accepted assignment"
      })
    ).toEqual({
      note: "Courier accepted assignment"
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

  it("accepts a public phone-verification response contract", () => {
    expect(
      requestPhoneVerificationChallengeRequestSchema.parse({
        phone: "+233240000000"
      })
    ).toEqual({
      phone: "+233240000000"
    });

    expect(
      requestPhoneVerificationChallengeResponseSchema.parse({
        deliveryId: "DEL-0001",
        trackingCode: "KRA-0001",
        challengeStatus: "sent",
        challengeId: "CHL-0001",
        channel: "sms",
        maskedPhone: "+233*****0000",
        expiresAt: "2026-05-16T10:10:00.000Z",
        resendAvailableAt: "2026-05-16T10:01:00.000Z"
      })
    ).toMatchObject({
      challengeStatus: "sent",
      channel: "sms"
    });

    expect(
      verifyPhoneResponseSchema.parse({
        deliveryId: "DEL-0001",
        trackingCode: "KRA-0001",
        verificationToken: "pvt_live_delivery_scope_token_0001",
        verifiedAt: "2026-05-16T10:00:00.000Z",
        expiresAt: "2026-05-16T10:30:00.000Z"
      })
    ).toMatchObject({
      deliveryId: "DEL-0001",
      trackingCode: "KRA-0001"
    });
  });

  it("accepts lifecycle mutation request and response contracts", () => {
    expect(
      confirmIntakeRequestSchema.parse({
        measuredWeightKg: 1.9,
        sizeTier: "standard",
        condition: "ok",
        labelScanCode: "PKG-0001"
      })
    ).toMatchObject({
      condition: "ok"
    });

    expect(
      assignDriverRequestSchema.parse({
        driverUserId: "USR-DRV-001"
      })
    ).toEqual({
      driverUserId: "USR-DRV-001"
    });

    expect(
      dispatchDeliveryRequestSchema.parse({
        packageScanCode: "PKG-0001"
      })
    ).toEqual({
      packageScanCode: "PKG-0001"
    });

    expect(
      confirmDriverPickupRequestSchema.parse({
        packageScanCode: "PKG-0001"
      })
    ).toEqual({
      packageScanCode: "PKG-0001"
    });

    expect(
      receiveDestinationRequestSchema.parse({
        packageScanCode: "PKG-0001",
        condition: "ok",
        nextStep: "doorstep"
      })
    ).toMatchObject({
      nextStep: "doorstep"
    });

    expect(
      assignFinalMileRequestSchema.parse({
        courierUserId: "USR-COR-001"
      })
    ).toEqual({
      courierUserId: "USR-COR-001"
    });

    expect(
      recordFailedAttemptRequestSchema.parse({
        reasonCode: "receiver_unavailable",
        note: "Receiver requested a reattempt tomorrow."
      })
    ).toMatchObject({
      reasonCode: "receiver_unavailable"
    });

    expect(
      completeDeliveryRequestSchema.parse({
        proofType: "otp",
        proofReference: "OTP-VERIFIED",
        receivedByName: "Kojo Asante"
      })
    ).toMatchObject({
      proofType: "otp"
    });

    expect(
      cancelDeliveryRequestSchema.parse({
        reasonCode: "sender_changed_mind",
        note: "Customer booked twice"
      })
    ).toMatchObject({
      reasonCode: "sender_changed_mind"
    });

    expect(
      deliveryLifecycleResponseSchema.parse({
        eventId: "EVT-DEL-0001",
        deliveryId: "DEL-0001",
        status: "delivered",
        paymentStatus: "confirmed",
        occurredAt: "2026-05-16T10:30:00.000Z"
      })
    ).toMatchObject({
      eventId: "EVT-DEL-0001",
      status: "delivered"
    });

    expect(
      cancelDeliveryResponseSchema.parse({
        eventId: "EVT-DEL-0002",
        deliveryId: "DEL-0001",
        status: "cancelled",
        paymentStatus: "refund_pending",
        occurredAt: "2026-05-16T10:35:00.000Z",
        refundStatus: "refund_pending",
        refundAmountGhs: 35,
        refundReason: "full_refund_pre_intake"
      })
    ).toMatchObject({
      status: "cancelled",
      refundStatus: "refund_pending"
    });
  });

  it("accepts refund execution request and response contracts", () => {
    expect(
      refundPaymentRequestSchema.parse({
        paymentId: "PAY-0001",
        packageNeverReceivedAtOrigin: true
      })
    ).toEqual({
      paymentId: "PAY-0001",
      packageNeverReceivedAtOrigin: true
    });

    expect(
      refundPaymentResponseSchema.parse({
        paymentId: "PAY-0001",
        deliveryId: "DEL-0001",
        refundStatus: "refund_pending",
        refundAmountGhs: 35,
        refundReason: "never_received_at_origin",
        requiresManualReview: false,
        requestedAt: "2026-05-16T11:00:00.000Z"
      })
    ).toMatchObject({
      paymentId: "PAY-0001",
      refundAmountGhs: 35
    });

    expect(
      settleRefundRequestSchema.parse({
        paymentId: "PAY-0001",
        refundReference: "RFD-MTN-0001"
      })
    ).toEqual({
      paymentId: "PAY-0001",
      refundReference: "RFD-MTN-0001"
    });

    expect(
      settleRefundResponseSchema.parse({
        paymentId: "PAY-0001",
        deliveryId: "DEL-0001",
        refundStatus: "refunded",
        refundAmountGhs: 35,
        refundReason: "never_received_at_origin",
        refundReference: "RFD-MTN-0001",
        settledAt: "2026-05-16T11:30:00.000Z"
      })
    ).toMatchObject({
      refundStatus: "refunded",
      refundReference: "RFD-MTN-0001"
    });
  });

  it("accepts admin user and station-management contracts", () => {
    expect(
      adminUpsertUserRequestSchema.parse({
        userId: "USR-OPS-001",
        fullName: "Ama Owusu",
        role: "station_operator",
        stationId: "ST-ACC-01",
        status: "active",
        phone: "+233240000001"
      })
    ).toMatchObject({
      role: "station_operator",
      stationId: "ST-ACC-01"
    });

    expect(
      adminUpdateUserAccessRequestSchema.parse({
        role: "driver",
        status: "active"
      })
    ).toMatchObject({
      role: "driver",
      status: "active"
    });

    expect(
      adminUserResponseSchema.parse({
        userId: "USR-OPS-001",
        fullName: "Ama Owusu",
        role: "station_operator",
        status: "active",
        stationId: "ST-ACC-01",
        createdAt: "2026-05-16T12:00:00.000Z",
        updatedAt: "2026-05-16T12:05:00.000Z",
        activatedAt: "2026-05-16T12:00:00.000Z"
      })
    ).toMatchObject({
      userId: "USR-OPS-001",
      status: "active"
    });

    expect(
      adminUserListResponseSchema.parse({
        generatedAt: "2026-05-16T12:05:00.000Z",
        users: [
          {
            userId: "USR-OPS-001",
            fullName: "Ama Owusu",
            role: "station_operator",
            status: "active",
            stationId: "ST-ACC-01",
            createdAt: "2026-05-16T12:00:00.000Z",
            updatedAt: "2026-05-16T12:05:00.000Z",
            activatedAt: "2026-05-16T12:00:00.000Z"
          }
        ]
      })
    ).toMatchObject({
      users: [
        {
          userId: "USR-OPS-001"
        }
      ]
    });

    expect(
      adminUpdateStationStatusRequestSchema.parse({
        operatingStatus: "active",
        intakeStatus: "open",
        serviceAvailability: {
          standard: true,
          express: true,
          doorstep: true
        }
      })
    ).toMatchObject({
      operatingStatus: "active"
    });

    expect(
      adminUpdateStationStatusResponseSchema.parse({
        stationId: "ST-ACC-01",
        name: "Accra Central",
        city: "Accra",
        operatingStatus: "active",
        intakeStatus: "restricted",
        serviceAvailability: {
          standard: true,
          express: false,
          doorstep: true
        },
        updatedAt: "2026-05-16T12:10:00.000Z"
      })
    ).toMatchObject({
      stationId: "ST-ACC-01",
      intakeStatus: "restricted"
    });
  });

  it("accepts an admin overview response contract", () => {
    expect(
      adminOverviewResponseSchema.parse({
        generatedAt: "2026-05-16T12:00:00.000Z",
        deliveryStatusCounts: [
          {
            status: "awaiting_driver_assignment",
            count: 4
          }
        ],
        paymentStatusCounts: [
          {
            status: "confirmed",
            count: 11
          }
        ],
        operationalAlerts: {
          openIssueLikeDeliveries: 3,
          unmatchedWebhookEvents: 2,
          manualReviewWebhookEvents: 1
        }
      })
    ).toMatchObject({
      operationalAlerts: {
        openIssueLikeDeliveries: 3
      }
    });
  });
});

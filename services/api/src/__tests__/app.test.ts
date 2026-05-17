import { afterEach, describe, expect, it } from "vitest";
import { adminPricingRulesResponseSchema } from "@kra/shared";

import { createApiApp, type ApiAppDeps } from "../app";
import type { DeliveryRecord } from "../deliveries";
import type { OutboundNotificationRecord } from "../outbound-notifications";
import type { PaymentRecord } from "../payments";
import type { PricingRuleRecord, PricingRouteBaseFee } from "../pricing-rules";
import type { ProofAssetRecord } from "../proof-assets";

const appsToClose: Array<ReturnType<typeof createApiApp>> = [];

afterEach(async () => {
  await Promise.all(appsToClose.splice(0).map((app) => app.close()));
});

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-9401",
    trackingCode: "KRA-9401",
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
    currentCustodyActorId: "USR-OP-001",
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

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    paymentId: "PAY-9401",
    deliveryId: "DEL-9401",
    provider: "mtn_momo",
    providerReference: "MTN-REF-9401",
    payerPhone: "+233240000000",
    amountGhs: 35,
    status: "pending",
    initiatedAt: "2026-05-16T14:30:00.000Z",
    checkoutMode: "ussd_push",
    reconciliationAttemptCount: 0,
    nextReconciliationAt: "2026-05-16T15:00:00.000Z",
    ...overrides
  };
}

function makeProofAsset(overrides: Partial<ProofAssetRecord> = {}): ProofAssetRecord {
  return {
    proofAssetId: "PFA-9401",
    deliveryId: "DEL-9401",
    proofType: "delivery_photo",
    status: "pending_upload",
    contentType: "image/jpeg",
    byteSize: 512_000,
    storageBucket: "kra-proof-assets",
    storageObjectPath: "proof-assets/DEL-9401/PFA-9401.jpg",
    requestedByUserId: "USR-COR-001",
    requestedByRole: "final_mile_courier",
    createdAt: "2026-05-16T15:00:00.000Z",
    uploadExpiresAt: "2026-05-16T15:15:00.000Z",
    updatedAt: "2026-05-16T15:00:00.000Z",
    ...overrides
  };
}

const defaultRouteBaseFees: PricingRouteBaseFee[] = [
  { originStationId: "ST-ACC-01", destinationStationId: "ST-KMS-01", baseFeeGhs: 35 },
  { originStationId: "ST-ACC-01", destinationStationId: "ST-TML-01", baseFeeGhs: 65 },
  { originStationId: "ST-KMS-01", destinationStationId: "ST-ACC-01", baseFeeGhs: 35 },
  { originStationId: "ST-KMS-01", destinationStationId: "ST-TML-01", baseFeeGhs: 50 },
  { originStationId: "ST-TML-01", destinationStationId: "ST-ACC-01", baseFeeGhs: 65 },
  { originStationId: "ST-TML-01", destinationStationId: "ST-KMS-01", baseFeeGhs: 50 }
];

function makePricingRule(
  overrides: Partial<PricingRuleRecord> = {}
): PricingRuleRecord {
  return {
    pricingRuleId: "PRC-9401",
    status: "active",
    currency: "GHS",
    routeBaseFees: defaultRouteBaseFees,
    effectiveAt: "2026-05-16T15:00:00.000Z",
    updatedAt: "2026-05-16T15:00:00.000Z",
    updatedByUserId: "USR-FIN-001",
    ...overrides
  };
}

function makeAppDeps(): ApiAppDeps {
  return {
    config: {
      firebaseProjectId: "kra-test",
      apiPort: 8080,
      internalTaskSharedSecret: "internal-task-secret-123456",
      mtnMomo: {
        baseUrl: "https://sandbox.example.test",
        collectionPrimaryKey: "primary-key-123456",
        apiUser: "api-user-123456",
        apiKey: "api-key-123456",
        targetEnvironment: "sandbox",
        webhookSharedSecret: "webhook-secret-123456"
      }
    },
    authVerifier: {
      verifyBearerToken() {
        return resolve({
          userId: "USR-SND-001",
          role: "sender",
          capabilities: [],
          authMethod: "firebase_id_token" as const
        });
      }
    },
    users: {
      getById() {
        return resolve(undefined);
      },
      save() {
        return resolveVoid();
      },
      list() {
        return resolve([]);
      }
    },
    stations: {
      getById() {
        return resolve(undefined);
      },
      list() {
        return resolve([]);
      },
      save() {
        return resolveVoid();
      }
    },
    notificationFeed: {
      getByDedupeKey() {
        return resolve(undefined);
      },
      create() {
        return resolveVoid();
      },
      listByRecipientUserId() {
        return resolve([]);
      }
    },
    outboundNotifications: {
      getByDedupeKey() {
        return resolve(undefined);
      },
      create() {
        return resolveVoid();
      },
      markSent() {
        return resolveVoid();
      },
      markFailed() {
        return resolveVoid();
      },
      listDue() {
        return resolve([]);
      },
      listRecent() {
        return resolve([]);
      },
      countByStatus() {
        return resolve(0);
      }
    },
    deliveries: {
      create() {
        return resolveVoid();
      },
      getById() {
        return resolve(makeDelivery());
      },
      getByTrackingCode() {
        return resolve(makeDelivery());
      },
      updatePaymentStatus() {
        return resolveVoid();
      },
      save() {
        return resolveVoid();
      },
      listAccessible() {
        return resolve([makeDelivery()]);
      },
      countByStatus() {
        return resolve([]);
      },
      listRecent() {
        return resolve([makeDelivery()]);
      },
      countActiveQueuesByStation() {
        return resolve([]);
      }
    },
    deliveryEvents: {
      create() {
        return resolveVoid();
      },
      listByDeliveryId() {
        return resolve([]);
      }
    },
    handoffEvents: {
      create() {
        return resolveVoid();
      },
      listByDeliveryId() {
        return resolve([]);
      }
    },
    payments: {
      create() {
        return resolveVoid();
      },
      listByDeliveryId() {
        return resolve([]);
      },
      updateStatus() {
        return resolveVoid();
      },
      getByProviderReference() {
        return resolve(undefined);
      },
      listPendingReconciliationDue() {
        return resolve([]);
      },
      markReconciliationPending() {
        return resolveVoid();
      },
      markReconciliationReviewRequired() {
        return resolveVoid();
      },
      listReconciliationReview() {
        return resolve([]);
      },
      getById() {
        return resolve(undefined);
      },
      markRefundPending() {
        return resolveVoid();
      },
      markRefundSettled() {
        return resolveVoid();
      },
      countByStatus() {
        return resolve([]);
      },
      listRecent() {
        return resolve([]);
      },
      countReconciliationReviewRequired() {
        return resolve(0);
      }
    },
    pricingRules: {
      getActive() {
        return resolve(undefined);
      },
      saveActive() {
        return resolveVoid();
      }
    },
    proofAssets: {
      create() {
        return resolveVoid();
      },
      getById() {
        return resolve(undefined);
      },
      markUploaded() {
        return resolveVoid();
      },
      markAttached() {
        return resolveVoid();
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
        return resolve([]);
      },
      countOpenByStation() {
        return resolve(0);
      },
      countOpenP1ByStation() {
        return resolve(0);
      }
    },
    verification: {
      getActiveGrant() {
        return resolve(undefined);
      },
      getLatestChallenge() {
        return resolve(undefined);
      },
      createChallenge() {
        return resolveVoid();
      },
      listFailedAttemptsSince() {
        return resolve([]);
      },
      createFailedAttempt() {
        return resolveVoid();
      },
      consumeChallenge() {
        return resolveVoid();
      },
      createGrant() {
        return resolveVoid();
      }
    },
    webhookEvents: {
      getByProviderReferenceAndEventType() {
        return resolve(undefined);
      },
      create() {
        return resolveVoid();
      },
      listRecent() {
        return resolve([]);
      },
      updateProcessing() {
        return resolveVoid();
      },
      countByProcessingStatus() {
        return resolve([]);
      }
    },
    idempotency: {
      getByScopeKey() {
        return resolve(undefined);
      },
      createPending() {
        return resolveVoid();
      },
      markCompleted() {
        return resolveVoid();
      },
      delete() {
        return resolveVoid();
      }
    },
    auditEvents: {
      create() {
        return resolveVoid();
      },
      listRecent() {
        return resolve([]);
      }
    },
    gateway: {
      initializeCharge() {
        return resolve({
          providerReference: "mtn-ref-9401",
          checkoutMode: "ussd_push" as const
        });
      },
      verifyCharge() {
        return resolve({
          status: "confirmed" as const,
          verifiedAt: "2026-05-16T15:00:00.000Z"
        });
      }
    },
    proofStorage: {
      bucketName: "kra-proof-assets",
      createUploadUrl() {
        return resolve("https://storage.example.test/signed-upload-url");
      }
    },
    identityFactory: {
      nextRequestId: () => "REQ-9401",
      nextDeliveryId: () => "DEL-9401",
      nextTrackingCode: () => "KRA-9401",
      nextIdempotencyRecordId: () => "IDM-9401",
      nextAuditEventId: () => "AUD-9401",
      nextPaymentId: () => "PAY-9401",
      nextWebhookEventId: () => "EVT-WEB-9401",
      nextIssueId: () => "ISS-9401",
      nextNotificationId: () => "NTF-9401",
      nextOutboundNotificationId: () => "ONF-9401",
      nextProofAssetId: () => "PFA-9401",
      nextPricingRuleId: () => "PRC-9401",
      nextChallengeId: () => "CHL-9401",
      nextDeliveryEventId: () => "EVT-DEL-9401",
      nextHandoffEventId: () => "EVT-HOF-9401",
      nextOtpCode: () => "123456",
      nextAttemptId: () => "ATT-9401",
      nextVerificationId: () => "VRF-9401",
      nextVerificationToken: () => "verification-token-9401"
    },
    now: () => "2026-05-16T15:00:00.000Z",
    readinessCheck: () => resolveVoid()
  };
}

describe("api app", () => {
  it("serves health and public tracking endpoints", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const health = await app.inject({
      method: "GET",
      url: "/health/live"
    });
    const tracking = await app.inject({
      method: "GET",
      url: "/v1/public/track/KRA-9401"
    });

    expect(health.statusCode).toBe(200);
    expect(tracking.statusCode).toBe(200);
    expect(tracking.json()).toMatchObject({
      deliveryId: "DEL-9401",
      trackingCode: "KRA-9401"
    });
  });

  it("creates a delivery over the authenticated route surface", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries",
      headers: {
        authorization: "Bearer token-123"
      },
      payload: {
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
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      deliveryId: "DEL-9401",
      trackingCode: "KRA-9401",
      status: "created"
    });
  });

  it("quotes new deliveries from the active database-backed pricing rule", async () => {
    const deps = makeAppDeps();
    let savedDelivery: DeliveryRecord | undefined;

    deps.pricingRules.getActive = () =>
      resolve(
        makePricingRule({
          routeBaseFees: defaultRouteBaseFees.map((fee) =>
            fee.originStationId === "ST-ACC-01" && fee.destinationStationId === "ST-KMS-01"
              ? { ...fee, baseFeeGhs: 41 }
              : fee
          )
        })
      );
    deps.deliveries.create = (delivery) => {
      savedDelivery = delivery;
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries",
      headers: {
        authorization: "Bearer token-123"
      },
      payload: {
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
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      quote: {
        currency: "GHS",
        amount: 41
      }
    });
    expect(savedDelivery?.quote).toEqual({
      currency: "GHS",
      amount: 41
    });
  });

  it("allows an assigned driver to accept a run", async () => {
    const deps = makeAppDeps();
    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-DRV-001",
          role: "driver",
          capabilities: ["accept_run"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.deliveries.getById = () =>
      resolve(
        makeDelivery({
          currentStatus: "assigned_to_driver",
          assignedDriverId: "USR-DRV-001",
          currentCustodyRole: "station_operator",
          currentCustodyActorId: "USR-OP-001"
        })
      );

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/accept-run",
      headers: {
        authorization: "Bearer token-driver"
      },
      payload: {
        note: "Accepted for departure"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deliveryId: "DEL-9401",
      status: "assigned_to_driver"
    });
  });

  it("sends receiver SMS for final-mile delivery milestones when configured", async () => {
    const deps = makeAppDeps();
    const receiverMessages: Array<{
      phone: string;
      trackingCode: string;
      eventType: string;
      stationName?: string;
    }> = [];

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-COR-001",
          role: "final_mile_courier",
          capabilities: ["mark_out_for_delivery"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.notifications = {
      sendPublicTrackingOtp() {
        return resolveVoid();
      },
      sendReceiverDeliverySms(input) {
        receiverMessages.push(input);
        return resolveVoid();
      }
    };
    deps.deliveries.getById = () =>
      resolve(
        makeDelivery({
          currentStatus: "assigned_for_final_mile",
          doorstepRequested: true,
          receiver: {
            name: "Kojo Asante",
            phone: "+233240000000",
            addressText: "15 Ringway Road, Accra"
          },
          currentCustodyRole: "final_mile_courier",
          currentCustodyActorId: "USR-COR-001",
          assignedFinalMileCourierId: "USR-COR-001"
        })
      );

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/out-for-delivery",
      headers: {
        authorization: "Bearer token-courier"
      },
      payload: {
        note: "Courier is en route to receiver"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(receiverMessages).toEqual([
      {
        phone: "+233240000000",
        trackingCode: "KRA-9401",
        eventType: "out_for_delivery",
        stationName: "Kumasi Adum"
      }
    ]);
  });

  it("records receiver SMS delivery failure without failing the lifecycle mutation", async () => {
    const deps = makeAppDeps();
    const outboxRecords: OutboundNotificationRecord[] = [];

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-COR-001",
          role: "final_mile_courier",
          capabilities: ["mark_out_for_delivery"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.notifications = {
      sendPublicTrackingOtp() {
        return resolveVoid();
      },
      sendReceiverDeliverySms() {
        return Promise.reject(new Error("Hubtel unavailable"));
      }
    };
    deps.outboundNotifications = {
      getByDedupeKey(dedupeKey) {
        return resolve(outboxRecords.find((record) => record.dedupeKey === dedupeKey));
      },
      create(record) {
        outboxRecords.push(record);
        return resolveVoid();
      },
      markSent() {
        return resolveVoid();
      },
      markFailed(input) {
        const record = outboxRecords.find(
          (item) => item.outboundNotificationId === input.outboundNotificationId
        );

        if (record) {
          Object.assign(record, {
            status: input.status,
            attemptCount: input.attemptCount,
            lastAttemptAt: input.attemptedAt,
            nextAttemptAt: input.nextAttemptAt,
            lastError: input.lastError,
            updatedAt: input.attemptedAt
          });
        }

        return resolveVoid();
      },
      listDue() {
        return resolve([]);
      },
      listRecent() {
        return resolve([]);
      },
      countByStatus() {
        return resolve(0);
      }
    };
    deps.deliveries.getById = () =>
      resolve(
        makeDelivery({
          currentStatus: "assigned_for_final_mile",
          doorstepRequested: true,
          receiver: {
            name: "Kojo Asante",
            phone: "+233240000000",
            addressText: "15 Ringway Road, Accra"
          },
          currentCustodyRole: "final_mile_courier",
          currentCustodyActorId: "USR-COR-001",
          assignedFinalMileCourierId: "USR-COR-001"
        })
      );

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/out-for-delivery",
      headers: {
        authorization: "Bearer token-courier"
      },
      payload: {
        note: "Courier is en route to receiver"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(outboxRecords).toEqual([
      expect.objectContaining({
        outboundNotificationId: "ONF-9401",
        status: "failed",
        dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
        attemptCount: 1,
        nextAttemptAt: "2026-05-16T15:30:00.000Z",
        lastError: {
          name: "Error",
          message: "Hubtel unavailable"
        }
      })
    ]);
  });

  it("dispatches due outbound notifications over the secured internal task route", async () => {
    const deps = makeAppDeps();
    const outboxRecords: OutboundNotificationRecord[] = [
      {
        outboundNotificationId: "ONF-9401",
        channel: "sms",
        provider: "hubtel",
        kind: "receiver_delivery_sms",
        status: "failed",
        dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
        deliveryId: "DEL-9401",
        recipientPhone: "+233240000000",
        trackingCode: "KRA-9401",
        eventType: "out_for_delivery",
        stationName: "Kumasi Adum",
        attemptCount: 1,
        maxAttempts: 2,
        nextAttemptAt: "2026-05-16T15:00:00.000Z",
        lastAttemptAt: "2026-05-16T14:30:00.000Z",
        createdAt: "2026-05-16T14:30:00.000Z",
        updatedAt: "2026-05-16T14:30:00.000Z"
      }
    ];
    const sentMessages: string[] = [];

    deps.notifications = {
      sendPublicTrackingOtp() {
        return resolveVoid();
      },
      sendReceiverDeliverySms(input) {
        sentMessages.push(input.trackingCode);
        return resolveVoid();
      }
    };
    deps.outboundNotifications = {
      getByDedupeKey() {
        return resolve(undefined);
      },
      create() {
        return resolveVoid();
      },
      markSent(input) {
        const record = outboxRecords.find(
          (item) => item.outboundNotificationId === input.outboundNotificationId
        );

        if (record) {
          Object.assign(record, {
            status: "sent",
            attemptCount: input.attemptCount,
            lastAttemptAt: input.attemptedAt,
            sentAt: input.attemptedAt,
            updatedAt: input.attemptedAt
          });
        }

        return resolveVoid();
      },
      markFailed() {
        return resolveVoid();
      },
      listDue(input) {
        expect(input).toEqual({
          now: "2026-05-16T15:00:00.000Z",
          limit: 10
        });
        return resolve(outboxRecords);
      },
      listRecent() {
        return resolve([]);
      },
      countByStatus() {
        return resolve(0);
      }
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/internal/outbound-notifications/dispatch-due",
      headers: {
        "x-kra-internal-task-secret": "internal-task-secret-123456"
      },
      payload: {
        limit: 10
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      deadLettered: 0,
      results: [
        {
          outboundNotificationId: "ONF-9401",
          status: "sent",
          attemptCount: 2
        }
      ]
    });
    expect(sentMessages).toEqual(["KRA-9401"]);
  });

  it("rejects internal outbound notification dispatch without the task secret", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/internal/outbound-notifications/dispatch-due",
      payload: {
        limit: 10
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN"
      }
    });
  });

  it("reconciles due payments over the secured internal task route", async () => {
    const deps = makeAppDeps();
    const updatedPayments: string[] = [];
    const updatedDeliveries: string[] = [];
    const createdNotifications: string[] = [];

    deps.payments.listPendingReconciliationDue = (input) => {
      expect(input).toEqual({
        now: "2026-05-16T15:00:00.000Z",
        limit: 5
      });
      return resolve([makePayment()]);
    };
    deps.payments.updateStatus = (paymentId, status) => {
      updatedPayments.push(`${paymentId}:${status}`);
      return resolveVoid();
    };
    deps.deliveries.updatePaymentStatus = (deliveryId, status) => {
      updatedDeliveries.push(`${deliveryId}:${status}`);
      return resolveVoid();
    };
    deps.notificationFeed.create = (notification) => {
      createdNotifications.push(`${notification.deliveryId}:${notification.type}`);
      return resolveVoid();
    };
    deps.gateway.verifyCharge = () =>
      resolve({
        status: "confirmed" as const,
        verifiedAt: "2026-05-16T15:00:10.000Z"
      });

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/internal/payments/reconcile-due",
      headers: {
        "x-kra-internal-task-secret": "internal-task-secret-123456"
      },
      payload: {
        limit: 5
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      processed: 1,
      confirmed: 1,
      failed: 0,
      results: [
        {
          paymentId: "PAY-9401",
          action: "confirmed"
        }
      ]
    });
    expect(updatedPayments).toEqual(["PAY-9401:confirmed"]);
    expect(updatedDeliveries).toEqual(["DEL-9401:confirmed"]);
    expect(createdNotifications).toEqual(["DEL-9401:payment_confirmed"]);
  });

  it("lists payment reconciliation review rows for finance admins", async () => {
    const deps = makeAppDeps();

    deps.authVerifier.verifyBearerToken = () =>
      resolve({
        userId: "USR-FIN-001",
        role: "finance_admin",
        capabilities: ["review_reconciliation"],
        authMethod: "firebase_id_token" as const
      });
    deps.payments.listReconciliationReview = (input) => {
      expect(input).toEqual({
        reviewReason: "verification_unresolved_after_30_minutes",
        limit: 20
      });
      return resolve([
        makePayment({
          reconciliationAttemptCount: 3,
          lastReconciliationAt: "2026-05-16T15:00:00.000Z",
          reconciliationReviewRequiredAt: "2026-05-16T15:00:00.000Z",
          reconciliationReviewReason: "verification_unresolved_after_30_minutes"
        })
      ]);
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/payment-reconciliation?reviewReason=verification_unresolved_after_30_minutes&limit=20",
      headers: {
        authorization: "Bearer token-finance"
      }
    });

    expect(response.statusCode).toBe(200);
    const responseBody: {
      csv: string;
      generatedAt: string;
      rows: Array<{
        paymentId: string;
        mismatchType: string;
      }>;
    } = response.json();

    expect(responseBody).toMatchObject({
      generatedAt: "2026-05-16T15:00:00.000Z",
      rows: [
        {
          paymentId: "PAY-9401",
          mismatchType: "verification_unresolved_after_30_minutes"
        }
      ]
    });
    expect(responseBody.csv).toContain("businessDate,provider,providerReference");
  });

  it("creates and confirms delivery proof asset upload intents", async () => {
    const deps = makeAppDeps();
    const createdProofAssets: ProofAssetRecord[] = [];
    const uploadedProofAssets: string[] = [];
    const signedUploadRequests: string[] = [];

    deps.authVerifier.verifyBearerToken = () =>
      resolve({
        userId: "USR-COR-001",
        role: "final_mile_courier",
        capabilities: ["complete_delivery_with_proof"],
        authMethod: "firebase_id_token" as const
      });
    deps.deliveries.getById = () =>
      resolve(
        makeDelivery({
          currentStatus: "out_for_delivery",
          assignedFinalMileCourierId: "USR-COR-001",
          currentCustodyRole: "final_mile_courier",
          currentCustodyActorId: "USR-COR-001"
        })
      );
    deps.proofStorage = {
      bucketName: "kra-proof-assets",
      createUploadUrl(input) {
        signedUploadRequests.push(`${input.objectPath}:${input.contentType}:${input.expiresAt}`);
        return resolve("https://storage.example.test/signed-upload-url");
      }
    };
    deps.proofAssets.create = (record) => {
      createdProofAssets.push(record);
      return resolveVoid();
    };
    deps.proofAssets.getById = () => resolve(createdProofAssets[0]);
    deps.proofAssets.markUploaded = (input) => {
      uploadedProofAssets.push(`${input.proofAssetId}:${input.sha256}`);
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/proof-assets",
      headers: {
        authorization: "Bearer token-courier",
        "idempotency-key": "proof-upload-intent-1"
      },
      payload: {
        proofType: "delivery_photo",
        contentType: "image/jpeg",
        byteSize: 512_000,
        sha256: "a".repeat(64)
      }
    });
    const confirmResponse = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/proof-assets/PFA-9401/confirm-upload",
      headers: {
        authorization: "Bearer token-courier",
        "idempotency-key": "proof-upload-confirm-1"
      },
      payload: {
        byteSize: 512_000,
        sha256: "a".repeat(64),
        storageGeneration: "generation-1"
      }
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({
      proofAssetId: "PFA-9401",
      proofReference: "PFA-9401",
      status: "pending_upload",
      upload: {
        method: "PUT",
        bucket: "kra-proof-assets",
        objectPath: "proof-assets/DEL-9401/PFA-9401.jpg"
      }
    });
    expect(confirmResponse.statusCode).toBe(200);
    expect(confirmResponse.json()).toMatchObject({
      proofAssetId: "PFA-9401",
      status: "uploaded",
      sha256: "a".repeat(64)
    });
    expect(signedUploadRequests).toEqual([
      "proof-assets/DEL-9401/PFA-9401.jpg:image/jpeg:2026-05-16T15:15:00.000Z"
    ]);
    expect(uploadedProofAssets).toEqual([`PFA-9401:${"a".repeat(64)}`]);
  });

  it("requires uploaded fallback proof assets before photo delivery completion", async () => {
    const deps = makeAppDeps();
    const attachedProofAssets: string[] = [];
    let currentDelivery = makeDelivery({
      currentStatus: "out_for_delivery",
      assignedFinalMileCourierId: "USR-COR-001",
      currentCustodyRole: "final_mile_courier",
      currentCustodyActorId: "USR-COR-001"
    });

    deps.authVerifier.verifyBearerToken = () =>
      resolve({
        userId: "USR-COR-001",
        role: "final_mile_courier",
        capabilities: ["complete_delivery_with_proof"],
        authMethod: "firebase_id_token" as const
      });
    deps.deliveries.getById = () => resolve(currentDelivery);
    deps.deliveries.save = (delivery) => {
      currentDelivery = delivery;
      return resolveVoid();
    };
    deps.proofAssets.getById = () =>
      resolve(
        makeProofAsset({
          status: "uploaded",
          uploadedAt: "2026-05-16T15:02:00.000Z",
          sha256: "b".repeat(64)
        })
      );
    deps.proofAssets.markAttached = (input) => {
      attachedProofAssets.push(`${input.proofAssetId}:${input.attachedByUserId}`);
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/deliveries/DEL-9401/complete",
      headers: {
        authorization: "Bearer token-courier",
        "idempotency-key": "complete-with-photo-1"
      },
      payload: {
        proofType: "delivery_photo",
        proofReference: "PFA-9401",
        receivedByName: "Kojo Asante"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deliveryId: "DEL-9401",
      status: "delivered"
    });
    expect(currentDelivery.finalProof).toMatchObject({
      type: "delivery_photo",
      reference: "PFA-9401"
    });
    expect(attachedProofAssets).toEqual(["PFA-9401:USR-COR-001"]);
  });

  it("lets a super admin create a managed user record", async () => {
    const deps = makeAppDeps();
    let savedUserId: string | undefined;

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-SUP-001",
          role: "super_admin",
          capabilities: ["manage_users_and_roles", "override_queue_state"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.users.save = (user) => {
      savedUserId = user.userId;
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/users",
      headers: {
        authorization: "Bearer token-super-admin"
      },
      payload: {
        userId: "USR-OPS-777",
        fullName: "Yaw Mensah",
        role: "station_operator",
        stationId: "ST-ACC-01",
        status: "active"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(savedUserId).toBe("USR-OPS-777");
    expect(response.json()).toMatchObject({
      userId: "USR-OPS-777",
      role: "station_operator",
      stationId: "ST-ACC-01"
    });
  });

  it("lets an operations admin update station validation readiness", async () => {
    const deps = makeAppDeps();
    let savedStation: unknown;

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-OPS-001",
          role: "ops_admin",
          capabilities: ["override_queue_state"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.stations.save = (station) => {
      savedStation = station;
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/stations/ST-ACC-01/validation",
      headers: {
        authorization: "Bearer token-ops-admin"
      },
      payload: {
        dryRunBusinessDaysCompleted: 2,
        controlledPilotBusinessDaysCompleted: 3,
        checklist: {
          activeOperatorsCanSignIn: true,
          intakeDispatchReceiptAudited: true,
          scanOrManualFallbackTested: true,
          noUnresolvedP1Incidents: true,
          escalationAndRefundHandoffTested: true,
          openingHoursStorageAndHandoffConfirmed: true
        },
        scanFallbackSuccessRatePercent: 98
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      stationId: "ST-ACC-01",
      validation: {
        status: "ready",
        goLiveEligible: true,
        blockers: []
      }
    });
    expect(savedStation).toMatchObject({
      stationId: "ST-ACC-01",
      validation: {
        status: "ready"
      }
    });
  });

  it("returns launch readiness blockers for admin go-live review", async () => {
    const deps = makeAppDeps();

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-SUP-001",
          role: "super_admin",
          capabilities: [],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.issues.countOpenP1ByStation = (stationId) =>
      resolve(stationId === "ST-ACC-01" ? 1 : 0);
    deps.payments.countReconciliationReviewRequired = () => resolve(1);
    deps.outboundNotifications.countByStatus = (status) =>
      resolve(status === "dead_letter" ? 1 : 0);

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/launch-readiness",
      headers: {
        authorization: "Bearer token-super-admin"
      }
    });

    const responseBody = response.json<{
      blockers: Array<{ code: string }>;
    }>();

    expect(response.statusCode).toBe(200);
    expect(responseBody).toMatchObject({
      status: "blocked",
      goLiveEligible: false,
      systemChecks: {
        unresolvedP1Issues: {
          count: 1
        },
        paymentReconciliation: {
          reviewRequiredCount: 1
        },
        receiverSms: {
          deadLetterCount: 1
        }
      }
    });
    expect(responseBody.blockers.map((blocker) => blocker.code)).toEqual(
      expect.arrayContaining([
        "station_validation_incomplete",
        "unresolved_p1_issue",
        "payment_reconciliation_review",
        "dead_letter_receiver_sms"
      ])
    );
  });

  it("lets finance admins read and update active route pricing", async () => {
    const deps = makeAppDeps();
    let activePricingRule: PricingRuleRecord | undefined;

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-FIN-001",
          role: "finance_admin",
          capabilities: ["manage_pricing_rules"],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.pricingRules.getActive = () => resolve(activePricingRule);
    deps.pricingRules.saveActive = (record) => {
      activePricingRule = record;
      return resolveVoid();
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const updateResponse = await app.inject({
      method: "POST",
      url: "/v1/admin/pricing-rules/active",
      headers: {
        authorization: "Bearer token-finance-admin"
      },
      payload: {
        routeBaseFees: defaultRouteBaseFees.map((fee) =>
          fee.originStationId === "ST-ACC-01" && fee.destinationStationId === "ST-KMS-01"
            ? { ...fee, baseFeeGhs: 42 }
            : fee
        ),
        note: "Launch corridor finance approval"
      }
    });
    const readResponse = await app.inject({
      method: "GET",
      url: "/v1/admin/pricing-rules",
      headers: {
        authorization: "Bearer token-finance-admin"
      }
    });

    expect(updateResponse.statusCode).toBe(200);
    const updateBody = adminPricingRulesResponseSchema.parse(updateResponse.json());
    expect(updateBody.pricingRuleId).toBe("PRC-9401");
    expect(updateBody.updatedByUserId).toBe("USR-FIN-001");
    expect(
      updateBody.routeBaseFees.some(
        (fee) =>
          fee.originStationId === "ST-ACC-01" &&
          fee.destinationStationId === "ST-KMS-01" &&
          fee.baseFeeGhs === 42
      )
    ).toBe(true);

    expect(readResponse.statusCode).toBe(200);
    const readBody = adminPricingRulesResponseSchema.parse(readResponse.json());
    expect(readBody.pricingRuleId).toBe("PRC-9401");
    expect(
      readBody.routeBaseFees.some(
        (fee) =>
          fee.originStationId === "ST-ACC-01" &&
          fee.destinationStationId === "ST-KMS-01" &&
          fee.baseFeeGhs === 42
      )
    ).toBe(true);
  });

  it("lists accessible deliveries over the authenticated route surface", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/deliveries",
      headers: {
        authorization: "Bearer token-123"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deliveries: [
        {
          deliveryId: "DEL-9401",
          trackingCode: "KRA-9401",
          currentStatus: "received_at_destination",
          receiverName: "Kojo Asante",
          doorstepRequested: false
        }
      ]
    });
  });

  it("lists authenticated notifications for the current user", async () => {
    const deps = makeAppDeps();

    deps.notificationFeed.listByRecipientUserId = (input) =>
      resolve([
        {
          notificationId: "NTF-9401",
          recipientUserId: input.recipientUserId,
          type: "ready_for_pickup",
          status: "unread",
          title: "Ready for pickup",
          body: "Your package is ready for receiver pickup at the destination station.",
          deliveryId: "DEL-9401",
          dedupeKey: "delivery:DEL-9401:ready_for_pickup",
          createdAt: "2026-05-16T15:00:00.000Z"
        }
      ]);

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/notifications?limit=10",
      headers: {
        authorization: "Bearer token-123"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      notifications: [
        {
          notificationId: "NTF-9401",
          type: "ready_for_pickup",
          status: "unread",
          title: "Ready for pickup",
          body: "Your package is ready for receiver pickup at the destination station.",
          deliveryId: "DEL-9401",
          createdAt: "2026-05-16T15:00:00.000Z"
        }
      ]
    });
  });

  it("lists outbound notification recovery records for operational admins", async () => {
    const deps = makeAppDeps();

    deps.authVerifier = {
      verifyBearerToken() {
        return resolve({
          userId: "USR-OPS-001",
          role: "ops_admin",
          capabilities: [],
          authMethod: "firebase_id_token" as const
        });
      }
    };
    deps.outboundNotifications.listRecent = (input) => {
      expect(input).toEqual({
        status: "dead_letter",
        limit: 20
      });

      return resolve([
        {
          outboundNotificationId: "ONF-9401",
          channel: "sms",
          provider: "hubtel",
          kind: "receiver_delivery_sms",
          status: "dead_letter",
          dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
          deliveryId: "DEL-9401",
          recipientPhone: "+233240000000",
          trackingCode: "KRA-9401",
          eventType: "out_for_delivery",
          stationName: "Kumasi Adum",
          attemptCount: 2,
          maxAttempts: 2,
          nextAttemptAt: "2026-05-16T15:00:00.000Z",
          createdAt: "2026-05-16T14:00:00.000Z",
          updatedAt: "2026-05-16T15:00:00.000Z",
          lastAttemptAt: "2026-05-16T15:00:00.000Z",
          lastError: {
            name: "Error",
            message: "Hubtel rejected message"
          }
        }
      ]);
    };

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/outbound-notifications?status=dead_letter&limit=20",
      headers: {
        authorization: "Bearer token-ops-admin"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      generatedAt: "2026-05-16T15:00:00.000Z",
      notifications: [
        {
          outboundNotificationId: "ONF-9401",
          status: "dead_letter",
          deliveryId: "DEL-9401",
          trackingCode: "KRA-9401",
          lastError: {
            message: "Hubtel rejected message"
          }
        }
      ]
    });
  });

  it("lists authenticated issues and rejects reconciliation reads for sender scope", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const issuesResponse = await app.inject({
      method: "GET",
      url: "/v1/issues?deliveryId=DEL-9401",
      headers: {
        authorization: "Bearer token-123"
      }
    });
    const webhookEventsResponse = await app.inject({
      method: "GET",
      url: "/v1/admin/webhook-events?processingStatus=manual_review",
      headers: {
        authorization: "Bearer token-123"
      }
    });

    expect(issuesResponse.statusCode).toBe(200);
    expect(issuesResponse.json()).toEqual({
      issues: []
    });
    expect(webhookEventsResponse.statusCode).toBe(403);
    expect(webhookEventsResponse.json()).toMatchObject({
      error: {
        code: "FORBIDDEN"
      }
    });
  });

  it("allows drivers to create delay issues through the report-delay capability path", async () => {
    const deps = makeAppDeps();
    deps.authVerifier.verifyBearerToken = () =>
      resolve({
        userId: "USR-DRV-001",
        role: "driver",
        capabilities: ["report_delay"],
        authMethod: "firebase_id_token" as const
      });
    deps.deliveries.getById = () =>
      resolve(
        makeDelivery({
          assignedDriverId: "USR-DRV-001",
          currentCustodyRole: "driver",
          currentCustodyActorId: "USR-DRV-001"
        })
      );

    const app = createApiApp(deps);
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/issues",
      headers: {
        authorization: "Bearer token-123"
      },
      payload: {
        deliveryId: "DEL-9401",
        category: "delay",
        severity: "p2",
        summary: "Traffic delayed the line-haul departure"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      issueId: "ISS-9401",
      deliveryId: "DEL-9401",
      category: "delay"
    });
  });

  it("rejects webhook requests with an invalid signature", async () => {
    const app = createApiApp(makeAppDeps());
    appsToClose.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/webhooks/payments/mtn-momo",
      headers: {
        "x-kra-webhook-signature": "invalid-signature"
      },
      payload: {
        providerReference: "mtn-ref-9401",
        eventType: "payment.confirmed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T15:00:00.000Z"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: {
        code: "FORBIDDEN"
      }
    });
  });
});

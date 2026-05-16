import { afterEach, describe, expect, it } from "vitest";

import { createApiApp, type ApiAppDeps } from "../app";
import type { DeliveryRecord } from "../deliveries";

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

function makeAppDeps(): ApiAppDeps {
  return {
    config: {
      firebaseProjectId: "kra-test",
      apiPort: 8080,
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

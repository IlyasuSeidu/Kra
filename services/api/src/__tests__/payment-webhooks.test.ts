import { describe, expect, it } from "vitest";

import { listAdminWebhookEvents, processMtnMomoWebhook } from "../payment-webhooks";
import type { PaymentRecord } from "../payments";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makePayment(
  overrides: Partial<PaymentRecord> = {}
): PaymentRecord {
  return {
    paymentId: "PAY-4001",
    deliveryId: "DEL-4001",
    provider: "mtn_momo",
    providerReference: "MTN-REF-4001",
    payerPhone: "+233240000000",
    amountGhs: 35,
    status: "pending",
    initiatedAt: "2026-05-16T08:00:00.000Z",
    checkoutMode: "ussd_push",
    ...overrides
  };
}

describe("MTN MoMo webhook processing", () => {
  it("persists and processes a confirmed callback for a pending payment", async () => {
    const createdEvents: string[] = [];
    const updatedEvents: string[] = [];
    const updatedPayments: string[] = [];
    const updatedDeliveries: string[] = [];

    const result = await processMtnMomoWebhook(
      {
        providerEventId: "EVT-4001",
        providerReference: "MTN-REF-4001",
        eventType: "payment.confirmed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T08:05:00.000Z",
        rawPayload: {
          status: "SUCCESSFUL"
        }
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
          updatePaymentStatus(deliveryId, paymentStatus) {
            updatedDeliveries.push(`${deliveryId}:${paymentStatus}`);
            return resolveVoid();
          }
        },
        payments: {
          create() {
            return resolveVoid();
          },
          getByProviderReference() {
            return resolve(makePayment());
          },
          listByDeliveryId() {
            return resolve([]);
          },
          updateStatus(paymentId, status) {
            updatedPayments.push(`${paymentId}:${status}`);
            return resolveVoid();
          }
        },
        webhookEvents: {
          getByProviderReferenceAndEventType() {
            return resolve(undefined);
          },
          create(event) {
            createdEvents.push(`${event.eventId}:${event.processingStatus}`);
            return resolveVoid();
          },
          listRecent() {
            return resolve([]);
          },
          updateProcessing(eventId, update) {
            updatedEvents.push(`${eventId}:${update.processingStatus}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextWebhookEventId: () => "EVT-WEB-4001"
        },
        now: () => "2026-05-16T08:05:10.000Z"
      }
    );

    expect(createdEvents).toEqual(["EVT-WEB-4001:received"]);
    expect(updatedPayments).toEqual(["PAY-4001:confirmed"]);
    expect(updatedDeliveries).toEqual(["DEL-4001:confirmed"]);
    expect(updatedEvents).toEqual(["EVT-WEB-4001:processed"]);
    expect(result.response).toEqual({
      eventId: "EVT-WEB-4001",
      acknowledgement: "processed",
      matchedPaymentId: "PAY-4001",
      matchedDeliveryId: "DEL-4001"
    });
  });

  it("returns a duplicate acknowledgement without a second mutation", async () => {
    const result = await processMtnMomoWebhook(
      {
        providerReference: "MTN-REF-4001",
        eventType: "payment.confirmed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T08:05:00.000Z"
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
            throw new Error("should not update delivery for a duplicate event");
          }
        },
        payments: {
          create() {
            return resolveVoid();
          },
          getByProviderReference() {
            throw new Error("should not look up payment for a duplicate event");
          },
          listByDeliveryId() {
            return resolve([]);
          },
          updateStatus() {
            throw new Error("should not update payment for a duplicate event");
          }
        },
        webhookEvents: {
          getByProviderReferenceAndEventType() {
            return resolve({
              eventId: "EVT-WEB-4001",
              provider: "mtn_momo" as const,
              providerReference: "MTN-REF-4001",
              eventType: "payment.confirmed" as const,
              amountGhs: 35,
              currency: "GHS" as const,
              occurredAt: "2026-05-16T08:05:00.000Z",
              receivedAt: "2026-05-16T08:05:10.000Z",
              signatureVerified: true as const,
              processingStatus: "processed" as const,
              retryCount: 0,
              matchedPaymentId: "PAY-4001",
              matchedDeliveryId: "DEL-4001"
            });
          },
          create() {
            throw new Error("should not create a duplicate event");
          },
          listRecent() {
            return resolve([]);
          },
          updateProcessing() {
            throw new Error("should not update processing for a duplicate event");
          }
        },
        identityFactory: {
          nextWebhookEventId: () => "EVT-WEB-IGNORED"
        },
        now: () => "2026-05-16T08:05:10.000Z"
      }
    );

    expect(result.response).toEqual({
      eventId: "EVT-WEB-4001",
      acknowledgement: "duplicate",
      matchedPaymentId: "PAY-4001",
      matchedDeliveryId: "DEL-4001"
    });
  });

  it("acknowledges unmatched verified callbacks for reconciliation review", async () => {
    const updatedEvents: string[] = [];

    const result = await processMtnMomoWebhook(
      {
        providerReference: "MTN-REF-MISSING",
        eventType: "payment.confirmed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T08:05:00.000Z"
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
            throw new Error("should not update delivery for unmatched events");
          }
        },
        payments: {
          create() {
            return resolveVoid();
          },
          getByProviderReference() {
            return resolve(undefined);
          },
          listByDeliveryId() {
            return resolve([]);
          },
          updateStatus() {
            throw new Error("should not update payment for unmatched events");
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
          updateProcessing(eventId, update) {
            updatedEvents.push(`${eventId}:${update.processingStatus}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextWebhookEventId: () => "EVT-WEB-4002"
        },
        now: () => "2026-05-16T08:05:10.000Z"
      }
    );

    expect(updatedEvents).toEqual(["EVT-WEB-4002:unmatched"]);
    expect(result.response).toEqual({
      eventId: "EVT-WEB-4002",
      acknowledgement: "unmatched"
    });
  });

  it("accepts pending provider events without mutating state", async () => {
    const updatedEvents: string[] = [];

    const result = await processMtnMomoWebhook(
      {
        providerReference: "MTN-REF-4001",
        eventType: "payment.pending",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T08:05:00.000Z"
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
            throw new Error("should not update delivery for a pending provider event");
          }
        },
        payments: {
          create() {
            return resolveVoid();
          },
          getByProviderReference() {
            return resolve(makePayment());
          },
          listByDeliveryId() {
            return resolve([]);
          },
          updateStatus() {
            throw new Error("should not update payment for a pending provider event");
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
          updateProcessing(eventId, update) {
            updatedEvents.push(`${eventId}:${update.processingStatus}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextWebhookEventId: () => "EVT-WEB-4003"
        },
        now: () => "2026-05-16T08:05:10.000Z"
      }
    );

    expect(updatedEvents).toEqual(["EVT-WEB-4003:accepted_pending"]);
    expect(result.response).toEqual({
      eventId: "EVT-WEB-4003",
      acknowledgement: "accepted_pending",
      matchedPaymentId: "PAY-4001",
      matchedDeliveryId: "DEL-4001"
    });
  });

  it("routes conflicting final-state callbacks to manual review", async () => {
    const updatedEvents: string[] = [];

    const result = await processMtnMomoWebhook(
      {
        providerReference: "MTN-REF-4001",
        eventType: "payment.failed",
        amountGhs: 35,
        currency: "GHS",
        occurredAt: "2026-05-16T08:05:00.000Z"
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
            throw new Error("should not update delivery on conflicting final-state events");
          }
        },
        payments: {
          create() {
            return resolveVoid();
          },
          getByProviderReference() {
            return resolve(makePayment({
              status: "confirmed",
              verifiedAt: "2026-05-16T08:04:00.000Z"
            }));
          },
          listByDeliveryId() {
            return resolve([]);
          },
          updateStatus() {
            throw new Error("should not update payment on conflicting final-state events");
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
          updateProcessing(eventId, update) {
            updatedEvents.push(`${eventId}:${update.processingStatus}:${update.processingNotes ?? ""}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextWebhookEventId: () => "EVT-WEB-4004"
        },
        now: () => "2026-05-16T08:05:10.000Z"
      }
    );

    expect(updatedEvents).toEqual(["EVT-WEB-4004:manual_review:conflicting_final_payment_status"]);
    expect(result.response).toEqual({
      eventId: "EVT-WEB-4004",
      acknowledgement: "manual_review",
      matchedPaymentId: "PAY-4001",
      matchedDeliveryId: "DEL-4001"
    });
  });

  it("lists admin webhook events for reconciliation", async () => {
    const response = await listAdminWebhookEvents(
      {
        userId: "USR-FIN-001",
        role: "finance_admin",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      {
        processingStatus: "manual_review"
      },
      {
        webhookEvents: {
          getByProviderReferenceAndEventType() {
            return resolve(undefined);
          },
          create() {
            return resolveVoid();
          },
          listRecent() {
            return resolve([
              {
                eventId: "EVT-WEB-4010",
                provider: "mtn_momo" as const,
                providerReference: "MTN-REF-4010",
                eventType: "payment.failed" as const,
                amountGhs: 55,
                currency: "GHS" as const,
                occurredAt: "2026-05-16T08:15:00.000Z",
                receivedAt: "2026-05-16T08:15:03.000Z",
                signatureVerified: true as const,
                processingStatus: "manual_review" as const,
                retryCount: 0,
                matchedPaymentId: "PAY-4010",
                matchedDeliveryId: "DEL-4010",
                processingNotes: "conflicting_final_payment_status"
              }
            ]);
          },
          updateProcessing() {
            return resolveVoid();
          }
        },
        now: () => "2026-05-16T08:20:00.000Z"
      }
    );

    expect(response).toMatchObject({
      generatedAt: "2026-05-16T08:20:00.000Z",
      events: [
        {
          eventId: "EVT-WEB-4010",
          processingStatus: "manual_review"
        }
      ]
    });
  });
});

import { describe, expect, it } from "vitest";

import { cancelDelivery } from "../cancellations";
import type { DeliveryRecord } from "../deliveries";
import type { DeliveryEventRecord } from "../handoffs";
import type { PaymentRecord } from "../payments";
import type { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-8101",
    trackingCode: "KRA-8101",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Ama Owusu",
      phone: "+233240000000"
    },
    package: {
      description: "Shoes",
      weightKg: 1.2,
      sizeTier: "standard",
      isFragile: false,
      declaredValueGhs: 220
    },
    serviceType: "standard",
    doorstepRequested: false,
    currentStatus: "created",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_created",
      occurredAt: "2026-05-16T08:00:00.000Z"
    },
    latestTouchpoint: {
      role: "system",
      stationId: "ST-ACC-01",
      occurredAt: "2026-05-16T08:00:00.000Z"
    },
    createdAt: "2026-05-16T08:00:00.000Z",
    ...overrides
  };
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    paymentId: "PAY-8101",
    deliveryId: "DEL-8101",
    provider: "mtn_momo",
    providerReference: "MTN-8101",
    payerPhone: "+233240000000",
    amountGhs: 35,
    status: "confirmed",
    initiatedAt: "2026-05-16T08:02:00.000Z",
    verifiedAt: "2026-05-16T08:03:00.000Z",
    checkoutMode: "ussd_push",
    ...overrides
  };
}

describe("delivery cancellation", () => {
  it("lets a sender cancel a pre-intake delivery and triggers a full refund", async () => {
    const savedDeliveries: DeliveryRecord[] = [];
    const recordedEvents: DeliveryEventRecord[] = [];
    const refundUpdates: string[] = [];

    const result = await cancelDelivery(
      {
        userId: "USR-SND-001",
        role: "sender",
        capabilities: ["cancel_eligible_delivery"],
        authMethod: "firebase_id_token"
      },
      {
        deliveryId: "DEL-8101",
        reasonCode: "sender_changed_mind",
        note: "Booked twice by mistake"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery());
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          },
          save(delivery) {
            savedDeliveries.push(delivery);
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create(event) {
            recordedEvents.push(event);
            return resolveVoid();
          }
        },
        payments: {
          listByDeliveryId() {
            return resolve([makePayment()]);
          },
          markRefundPending(input) {
            refundUpdates.push(`${input.paymentId}:${input.refundAmountGhs}:${input.refundReason}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-8101"
        },
        now: () => "2026-05-16T09:00:00.000Z"
      }
    );

    expect(refundUpdates).toEqual(["PAY-8101:35:full_refund_pre_intake"]);
    expect(savedDeliveries[0]?.currentStatus).toBe("cancelled");
    expect(savedDeliveries[0]?.paymentStatus).toBe("refund_pending");
    expect(recordedEvents[0]).toMatchObject({
      eventId: "EVT-DEL-8101",
      type: "delivery_cancelled",
      previousStatus: "created",
      nextStatus: "cancelled"
    });
    expect(result.response).toEqual({
      eventId: "EVT-DEL-8101",
      deliveryId: "DEL-8101",
      status: "cancelled",
      paymentStatus: "refund_pending",
      occurredAt: "2026-05-16T09:00:00.000Z",
      refundStatus: "refund_pending",
      refundAmountGhs: 35,
      refundReason: "full_refund_pre_intake"
    });
  });

  it("lets an origin station operator cancel an intake-complete delivery with handling fee retention", async () => {
    const refundUpdates: string[] = [];

    const result = await cancelDelivery(
      {
        userId: "USR-OPS-001",
        role: "station_operator",
        stationId: "ST-ACC-01",
        capabilities: [
          "confirm_intake",
          "assign_driver",
          "confirm_dispatch",
          "confirm_destination_receipt",
          "assign_final_mile",
          "open_issue",
          "cancel_eligible_delivery"
        ],
        authMethod: "firebase_id_token"
      },
      {
        deliveryId: "DEL-8101",
        reasonCode: "support_advised"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(
              makeDelivery({
                currentStatus: "received_at_origin",
                latestEvent: {
                  type: "delivery_received_at_origin",
                  occurredAt: "2026-05-16T08:30:00.000Z"
                },
                latestTouchpoint: {
                  role: "station_operator",
                  stationId: "ST-ACC-01",
                  occurredAt: "2026-05-16T08:30:00.000Z"
                }
              })
            );
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          },
          save() {
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create() {
            return resolveVoid();
          }
        },
        payments: {
          listByDeliveryId() {
            return resolve([makePayment()]);
          },
          markRefundPending(input) {
            refundUpdates.push(`${input.paymentId}:${input.refundAmountGhs}:${input.refundReason}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-8102"
        },
        now: () => "2026-05-16T09:05:00.000Z"
      }
    );

    expect(refundUpdates).toEqual(["PAY-8101:30:post_intake_handling_fee"]);
    expect(result.response.refundAmountGhs).toBe(30);
    expect(result.response.refundReason).toBe("post_intake_handling_fee");
  });

  it("blocks sender cancellation after station intake and rejects non-cancelable statuses", async () => {
    await expect(() =>
      cancelDelivery(
        {
          userId: "USR-SND-001",
          role: "sender",
          capabilities: ["cancel_eligible_delivery"],
          authMethod: "firebase_id_token"
        },
        {
          deliveryId: "DEL-8101",
          reasonCode: "other"
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(
                makeDelivery({
                  currentStatus: "received_at_origin"
                })
              );
            },
            getByTrackingCode() {
              return resolve(undefined);
            },
            updatePaymentStatus() {
              return resolveVoid();
            },
            save() {
              return resolveVoid();
            }
          },
          deliveryEvents: {
            create() {
              return resolveVoid();
            }
          },
          payments: {
            listByDeliveryId() {
              return resolve([makePayment()]);
            },
            markRefundPending() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextDeliveryEventId: () => "EVT-DEL-IGNORED"
          },
          now: () => "2026-05-16T09:10:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN"
    } satisfies Partial<ApiServiceError>);

    await expect(() =>
      cancelDelivery(
        {
          userId: "USR-SUP-001",
          role: "super_admin",
          capabilities: ["cancel_eligible_delivery"],
          authMethod: "firebase_id_token"
        },
        {
          deliveryId: "DEL-8101",
          reasonCode: "support_advised"
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(
                makeDelivery({
                  currentStatus: "assigned_to_driver"
                })
              );
            },
            getByTrackingCode() {
              return resolve(undefined);
            },
            updatePaymentStatus() {
              return resolveVoid();
            },
            save() {
              return resolveVoid();
            }
          },
          deliveryEvents: {
            create() {
              return resolveVoid();
            }
          },
          payments: {
            listByDeliveryId() {
              return resolve([makePayment()]);
            },
            markRefundPending() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextDeliveryEventId: () => "EVT-DEL-IGNORED"
          },
          now: () => "2026-05-16T09:15:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "INVALID_STATUS_TRANSITION"
    } satisfies Partial<ApiServiceError>);
  });
});

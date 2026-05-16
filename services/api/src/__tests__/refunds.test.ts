import { describe, expect, it } from "vitest";

import { type DeliveryRecord } from "../deliveries";
import { type PaymentRecord } from "../payments";
import { requestPaymentRefund, settlePaymentRefund } from "../refunds";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(
  overrides: Partial<DeliveryRecord> = {}
): DeliveryRecord {
  return {
    deliveryId: "DEL-7001",
    trackingCode: "KRA-7001",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Kojo Asante",
      phone: "+233240000000",
      addressText: "Adum High Street, Kumasi"
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
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    latestTouchpoint: {
      role: "system",
      stationId: "ST-ACC-01",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    createdAt: "2026-05-15T12:00:00.000Z",
    ...overrides
  };
}

function makePayment(
  overrides: Partial<PaymentRecord> = {}
): PaymentRecord {
  return {
    paymentId: "PAY-7001",
    deliveryId: "DEL-7001",
    provider: "mtn_momo",
    providerReference: "MTN-REF-7001",
    payerPhone: "+233240000000",
    amountGhs: 35,
    status: "confirmed",
    initiatedAt: "2026-05-15T12:30:00.000Z",
    verifiedAt: "2026-05-15T12:35:00.000Z",
    checkoutMode: "ussd_push",
    ...overrides
  };
}

describe("refund execution", () => {
  it("marks a pre-intake refund as refund_pending", async () => {
    const updatedPayments: string[] = [];
    const updatedDeliveries: string[] = [];

    const result = await requestPaymentRefund(
      {
        paymentId: "PAY-7001"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery({
              currentStatus: "created"
            }));
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
          getById() {
            return resolve(makePayment());
          },
          markRefundPending(input) {
            updatedPayments.push(`${input.paymentId}:${input.refundAmountGhs}:${input.refundReason}`);
            return resolveVoid();
          },
          markRefundSettled() {
            return resolveVoid();
          }
        },
        now: () => "2026-05-16T11:00:00.000Z"
      }
    );

    expect(updatedPayments).toEqual(["PAY-7001:35:full_refund_pre_intake"]);
    expect(updatedDeliveries).toEqual(["DEL-7001:refund_pending"]);
    expect(result.response).toEqual({
      paymentId: "PAY-7001",
      deliveryId: "DEL-7001",
      refundStatus: "refund_pending",
      refundAmountGhs: 35,
      refundReason: "full_refund_pre_intake",
      requiresManualReview: false,
      requestedAt: "2026-05-16T11:00:00.000Z"
    });
  });

  it("refunds unused doorstep surcharge only when no doorstep attempt occurred", async () => {
    const updatedPayments: string[] = [];

    const result = await requestPaymentRefund(
      {
        paymentId: "PAY-7002",
        doorstepAttemptOccurred: false
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(makeDelivery({
              deliveryId: "DEL-7002",
              trackingCode: "KRA-7002",
              doorstepRequested: true,
              doorstepDistanceKm: 4,
              paymentStatus: "confirmed",
              currentStatus: "in_transit",
              quote: {
                currency: "GHS",
                amount: 50
              }
            }));
          },
          getByTrackingCode() {
            return resolve(undefined);
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        payments: {
          getById() {
            return resolve(makePayment({
              paymentId: "PAY-7002",
              deliveryId: "DEL-7002",
              amountGhs: 50
            }));
          },
          markRefundPending(input) {
            updatedPayments.push(`${input.paymentId}:${input.refundAmountGhs}:${input.refundReason}`);
            return resolveVoid();
          },
          markRefundSettled() {
            return resolveVoid();
          }
        },
        now: () => "2026-05-16T11:05:00.000Z"
      }
    );

    expect(updatedPayments).toEqual(["PAY-7002:15:doorstep_surcharge_refund"]);
    expect(result.response.refundAmountGhs).toBe(15);
  });

  it("rejects already-refunded, non-confirmed, and manual-review refund requests", async () => {
    await expect(() =>
      requestPaymentRefund(
        {
          paymentId: "PAY-7003"
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
            }
          },
          payments: {
            getById() {
              return resolve(makePayment({
                paymentId: "PAY-7003",
                status: "refund_pending"
              }));
            },
            markRefundPending() {
              return resolveVoid();
            },
            markRefundSettled() {
              return resolveVoid();
            }
          },
          now: () => "2026-05-16T11:10:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      requestPaymentRefund(
        {
          paymentId: "PAY-7004"
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
            }
          },
          payments: {
            getById() {
              return resolve(makePayment({
                paymentId: "PAY-7004",
                status: "failed"
              }));
            },
            markRefundPending() {
              return resolveVoid();
            },
            markRefundSettled() {
              return resolveVoid();
            }
          },
          now: () => "2026-05-16T11:10:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      requestPaymentRefund(
        {
          paymentId: "PAY-7005"
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(makeDelivery({
                deliveryId: "DEL-7005",
                trackingCode: "KRA-7005",
                currentStatus: "in_transit",
                paymentStatus: "confirmed"
              }));
            },
            getByTrackingCode() {
              return resolve(undefined);
            },
            updatePaymentStatus() {
              return resolveVoid();
            }
          },
          payments: {
            getById() {
              return resolve(makePayment({
                paymentId: "PAY-7005",
                deliveryId: "DEL-7005"
              }));
            },
            markRefundPending() {
              throw new Error("manual-review refunds should not auto-execute");
            },
            markRefundSettled() {
              return resolveVoid();
            }
          },
          now: () => "2026-05-16T11:10:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });

  it("settles a refund-pending payment and closes the delivery payment state", async () => {
    const settledPayments: string[] = [];
    const updatedDeliveries: string[] = [];

    const result = await settlePaymentRefund(
      {
        paymentId: "PAY-7006",
        refundReference: "RFD-MTN-7006"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(
              makeDelivery({
                deliveryId: "DEL-7006",
                trackingCode: "KRA-7006",
                currentStatus: "cancelled",
                paymentStatus: "refund_pending"
              })
            );
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
          getById() {
            return resolve(
              makePayment({
                paymentId: "PAY-7006",
                deliveryId: "DEL-7006",
                status: "refund_pending",
                refundAmountGhs: 35,
                refundReason: "full_refund_pre_intake",
                refundRequestedAt: "2026-05-16T11:00:00.000Z"
              })
            );
          },
          markRefundPending() {
            return resolveVoid();
          },
          markRefundSettled(input) {
            settledPayments.push(`${input.paymentId}:${input.refundReference}:${input.settledAt}`);
            return resolveVoid();
          }
        },
        now: () => "2026-05-16T11:20:00.000Z"
      }
    );

    expect(settledPayments).toEqual(["PAY-7006:RFD-MTN-7006:2026-05-16T11:20:00.000Z"]);
    expect(updatedDeliveries).toEqual(["DEL-7006:refunded"]);
    expect(result.response).toEqual({
      paymentId: "PAY-7006",
      deliveryId: "DEL-7006",
      refundStatus: "refunded",
      refundAmountGhs: 35,
      refundReason: "full_refund_pre_intake",
      refundReference: "RFD-MTN-7006",
      settledAt: "2026-05-16T11:20:00.000Z"
    });
  });
});

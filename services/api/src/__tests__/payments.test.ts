import { describe, expect, it } from "vitest";

import { type DeliveryRecord } from "../deliveries";
import { initializeMtnMomoPayment } from "../payments";
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
    deliveryId: "DEL-2001",
    trackingCode: "KRA-2001",
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
    latestTouchpoint: {
      role: "system",
      stationId: "ST-ACC-01",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    createdAt: "2026-05-15T12:00:00.000Z",
    ...overrides
  };
}

describe("payment initialization service", () => {
  it("initializes a pending MTN MoMo payment for a valid delivery", async () => {
    const createdPayments: unknown[] = [];
    const updatedStatuses: string[] = [];

    const result = await initializeMtnMomoPayment(
      {
        deliveryId: "DEL-2001",
        payerPhone: "+233240000000",
        amountGhs: 35
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
          updatePaymentStatus(deliveryId, paymentStatus) {
            updatedStatuses.push(`${deliveryId}:${paymentStatus}`);
            return resolveVoid();
          }
        },
        payments: {
          create(payment) {
            createdPayments.push(payment);
            return resolveVoid();
          },
          listByDeliveryId() {
            return resolve([]);
          }
        },
        gateway: {
          initializeCharge() {
            return resolve({
              providerReference: "MTN-REF-2001",
              checkoutMode: "ussd_push"
            });
          }
        },
        identityFactory: {
          nextPaymentId: () => "PAY-2001"
        },
        now: () => "2026-05-15T12:30:00.000Z"
      }
    );

    expect(createdPayments).toHaveLength(1);
    expect(updatedStatuses).toEqual(["DEL-2001:pending"]);
    expect(result.response).toEqual({
      paymentId: "PAY-2001",
      deliveryId: "DEL-2001",
      provider: "mtn_momo",
      paymentStatus: "pending",
      providerReference: "MTN-REF-2001",
      checkoutMode: "ussd_push"
    });
  });

  it("returns the existing pending payment idempotently", async () => {
    const result = await initializeMtnMomoPayment(
      {
        deliveryId: "DEL-2001",
        payerPhone: "+233240000000",
        amountGhs: 35
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
          create() {
            throw new Error("should not create a duplicate pending payment");
          },
          listByDeliveryId() {
            return resolve([
              {
                paymentId: "PAY-2001",
                deliveryId: "DEL-2001",
                provider: "mtn_momo" as const,
                providerReference: "MTN-REF-2001",
                payerPhone: "+233240000000",
                amountGhs: 35,
                status: "pending" as const,
                initiatedAt: "2026-05-15T12:30:00.000Z",
                checkoutMode: "ussd_push" as const
              }
            ]);
          }
        },
        gateway: {
          initializeCharge() {
            throw new Error("should not call gateway for an existing pending payment");
          }
        },
        identityFactory: {
          nextPaymentId: () => "PAY-2002"
        },
        now: () => "2026-05-15T12:30:00.000Z"
      }
    );

    expect(result.response.paymentId).toBe("PAY-2001");
  });

  it("rejects missing deliveries, mismatched amounts, confirmed payments, and post-transport states", async () => {
    await expect(() =>
      initializeMtnMomoPayment(
        {
          deliveryId: "DEL-404",
          payerPhone: "+233240000000",
          amountGhs: 35
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
              return resolveVoid();
            }
          },
          payments: {
            create() {
              return resolveVoid();
            },
            listByDeliveryId() {
              return resolve([]);
            }
          },
          gateway: {
            initializeCharge() {
              return resolve({
                providerReference: "MTN-REF-404",
                checkoutMode: "ussd_push"
              });
            }
          },
          identityFactory: {
            nextPaymentId: () => "PAY-404"
          },
          now: () => "2026-05-15T12:30:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      initializeMtnMomoPayment(
        {
          deliveryId: "DEL-2001",
          payerPhone: "+233240000000",
          amountGhs: 36
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
            create() {
              return resolveVoid();
            },
            listByDeliveryId() {
              return resolve([]);
            }
          },
          gateway: {
            initializeCharge() {
              return resolve({
                providerReference: "MTN-REF-2001",
                checkoutMode: "ussd_push"
              });
            }
          },
          identityFactory: {
            nextPaymentId: () => "PAY-2001"
          },
          now: () => "2026-05-15T12:30:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      initializeMtnMomoPayment(
        {
          deliveryId: "DEL-2001",
          payerPhone: "+233240000000",
          amountGhs: 35
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(makeDelivery({
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
            create() {
              return resolveVoid();
            },
            listByDeliveryId() {
              return resolve([]);
            }
          },
          gateway: {
            initializeCharge() {
              return resolve({
                providerReference: "MTN-REF-2001",
                checkoutMode: "ussd_push"
              });
            }
          },
          identityFactory: {
            nextPaymentId: () => "PAY-2001"
          },
          now: () => "2026-05-15T12:30:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      initializeMtnMomoPayment(
        {
          deliveryId: "DEL-2001",
          payerPhone: "+233240000000",
          amountGhs: 35
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(makeDelivery({
                currentStatus: "in_transit"
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
            create() {
              return resolveVoid();
            },
            listByDeliveryId() {
              return resolve([]);
            }
          },
          gateway: {
            initializeCharge() {
              return resolve({
                providerReference: "MTN-REF-2001",
                checkoutMode: "ussd_push"
              });
            }
          },
          identityFactory: {
            nextPaymentId: () => "PAY-2001"
          },
          now: () => "2026-05-15T12:30:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });
});

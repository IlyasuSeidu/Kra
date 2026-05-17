import { describe, expect, it } from "vitest";

import {
  listAdminPaymentReconciliation,
  reconcileDueMtnMomoPayments
} from "../payment-reconciliation";
import type { PaymentRecord } from "../payments";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    paymentId: "PAY-8001",
    deliveryId: "DEL-8001",
    provider: "mtn_momo",
    providerReference: "MTN-REF-8001",
    payerPhone: "+233240000000",
    amountGhs: 35,
    status: "pending",
    initiatedAt: "2026-05-16T08:00:00.000Z",
    checkoutMode: "ussd_push",
    reconciliationAttemptCount: 0,
    nextReconciliationAt: "2026-05-16T08:05:00.000Z",
    ...overrides
  };
}

describe("payment reconciliation", () => {
  it("confirms due pending payments and updates delivery entitlement", async () => {
    const updatedPayments: string[] = [];
    const updatedDeliveries: string[] = [];

    const response = await reconcileDueMtnMomoPayments(
      {
        limit: 10
      },
      {
        payments: {
          listPendingReconciliationDue(input) {
            expect(input).toEqual({
              now: "2026-05-16T08:05:00.000Z",
              limit: 10
            });
            return resolve([makePayment()]);
          },
          updateStatus(paymentId, status) {
            updatedPayments.push(`${paymentId}:${status}`);
            return resolveVoid();
          },
          markReconciliationPending() {
            throw new Error("should not reschedule confirmed payments");
          },
          markReconciliationReviewRequired() {
            throw new Error("should not queue confirmed payments for review");
          },
          listReconciliationReview() {
            return resolve([]);
          }
        },
        deliveries: {
          updatePaymentStatus(deliveryId, status) {
            updatedDeliveries.push(`${deliveryId}:${status}`);
            return resolveVoid();
          }
        },
        gateway: {
          initializeCharge() {
            throw new Error("should not initialize charges during reconciliation");
          },
          verifyCharge() {
            return resolve({
              status: "confirmed" as const,
              verifiedAt: "2026-05-16T08:05:30.000Z"
            });
          }
        },
        now: () => "2026-05-16T08:05:00.000Z"
      }
    );

    expect(updatedPayments).toEqual(["PAY-8001:confirmed"]);
    expect(updatedDeliveries).toEqual(["DEL-8001:confirmed"]);
    expect(response).toMatchObject({
      processed: 1,
      confirmed: 1,
      failed: 0,
      results: [
        {
          paymentId: "PAY-8001",
          action: "confirmed",
          providerPaymentStatus: "confirmed"
        }
      ]
    });
  });

  it("reschedules unresolved provider-pending payments at the approved 15 minute checkpoint", async () => {
    const pendingUpdates: string[] = [];

    const response = await reconcileDueMtnMomoPayments(
      {},
      {
        payments: {
          listPendingReconciliationDue() {
            return resolve([makePayment()]);
          },
          updateStatus() {
            throw new Error("should not finalize provider-pending payments");
          },
          markReconciliationPending(input) {
            pendingUpdates.push(`${input.paymentId}:${input.attemptCount}:${input.nextReconciliationAt}`);
            return resolveVoid();
          },
          markReconciliationReviewRequired() {
            throw new Error("should not require review before the final checkpoint");
          },
          listReconciliationReview() {
            return resolve([]);
          }
        },
        deliveries: {
          updatePaymentStatus() {
            throw new Error("should not update delivery while payment is pending");
          }
        },
        gateway: {
          initializeCharge() {
            throw new Error("should not initialize charges during reconciliation");
          },
          verifyCharge() {
            return resolve({
              status: "pending" as const,
              verifiedAt: "2026-05-16T08:05:30.000Z"
            });
          }
        },
        now: () => "2026-05-16T08:05:00.000Z"
      }
    );

    expect(pendingUpdates).toEqual(["PAY-8001:1:2026-05-16T08:15:00.000Z"]);
    expect(response).toMatchObject({
      processed: 1,
      stillPending: 1,
      reviewRequired: 0,
      results: [
        {
          action: "rescheduled",
          nextReconciliationAt: "2026-05-16T08:15:00.000Z"
        }
      ]
    });
  });

  it("marks payments for finance review when the 30 minute verification checkpoint is still unresolved", async () => {
    const reviewUpdates: string[] = [];

    const response = await reconcileDueMtnMomoPayments(
      {},
      {
        payments: {
          listPendingReconciliationDue() {
            return resolve([
              makePayment({
                reconciliationAttemptCount: 2,
                nextReconciliationAt: "2026-05-16T08:30:00.000Z"
              })
            ]);
          },
          updateStatus() {
            throw new Error("should not finalize unresolved payments");
          },
          markReconciliationPending() {
            throw new Error("should not reschedule after the 30 minute checkpoint");
          },
          markReconciliationReviewRequired(input) {
            reviewUpdates.push(`${input.paymentId}:${input.attemptCount}:${input.reason}`);
            return resolveVoid();
          },
          listReconciliationReview() {
            return resolve([]);
          }
        },
        deliveries: {
          updatePaymentStatus() {
            throw new Error("should not update delivery while payment is unresolved");
          }
        },
        gateway: {
          initializeCharge() {
            throw new Error("should not initialize charges during reconciliation");
          },
          verifyCharge() {
            return resolve({
              status: "pending" as const,
              verifiedAt: "2026-05-16T08:30:30.000Z"
            });
          }
        },
        now: () => "2026-05-16T08:30:00.000Z"
      }
    );

    expect(reviewUpdates).toEqual([
      "PAY-8001:3:verification_unresolved_after_30_minutes"
    ]);
    expect(response).toMatchObject({
      processed: 1,
      reviewRequired: 1,
      results: [
        {
          action: "review_required",
          reviewReason: "verification_unresolved_after_30_minutes"
        }
      ]
    });
  });

  it("lists reconciliation review rows with a fixed-column CSV export", async () => {
    const response = await listAdminPaymentReconciliation(
      {
        reviewReason: "verification_unresolved_after_30_minutes",
        limit: 20
      },
      {
        payments: {
          listPendingReconciliationDue() {
            return resolve([]);
          },
          updateStatus() {
            return resolveVoid();
          },
          markReconciliationPending() {
            return resolveVoid();
          },
          markReconciliationReviewRequired() {
            return resolveVoid();
          },
          listReconciliationReview(input) {
            expect(input).toEqual({
              reviewReason: "verification_unresolved_after_30_minutes",
              limit: 20
            });
            return resolve([
              makePayment({
                reconciliationAttemptCount: 3,
                lastReconciliationAt: "2026-05-16T08:30:00.000Z",
                reconciliationReviewRequiredAt: "2026-05-16T08:30:00.000Z",
                reconciliationReviewReason: "verification_unresolved_after_30_minutes"
              })
            ]);
          }
        },
        now: () => "2026-05-16T09:00:00.000Z"
      }
    );

    expect(response.rows).toEqual([
      expect.objectContaining({
        businessDate: "2026-05-16",
        paymentId: "PAY-8001",
        mismatchType: "verification_unresolved_after_30_minutes",
        reconciliationAttemptCount: 3
      })
    ]);
    expect(response.csv).toContain(
      "businessDate,provider,providerReference,paymentId,deliveryId,quotedAmountGhs"
    );
    expect(response.csv).toContain("2026-05-16,mtn_momo,MTN-REF-8001,PAY-8001,DEL-8001");
  });
});

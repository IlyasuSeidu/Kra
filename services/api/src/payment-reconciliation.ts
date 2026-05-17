import {
  adminPaymentReconciliationQuerySchema,
  adminPaymentReconciliationResponseSchema,
  paymentReconciliationDispatchRequestSchema,
  paymentReconciliationDispatchResponseSchema
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRepository } from "./deliveries";
import type {
  MtnMomoGateway,
  PaymentRecord,
  PaymentReconciliationError,
  PaymentReconciliationReviewReason
} from "./payments";

type ChargePaymentStatus = Extract<PaymentRecord["status"], "pending" | "confirmed" | "failed">;

export interface PaymentReconciliationRepository {
  listPendingReconciliationDue(input: {
    now: string;
    limit: number;
  }): Promise<PaymentRecord[]>;
  markReconciliationPending(input: {
    paymentId: string;
    attemptCount: number;
    checkedAt: string;
    nextReconciliationAt: string;
    lastError?: PaymentReconciliationError;
  }): Promise<void>;
  updateStatus(
    paymentId: string,
    status: Extract<PaymentRecord["status"], "pending" | "confirmed" | "failed">,
    metadata: {
      verifiedAt: string;
      failureReason?: string;
    }
  ): Promise<void>;
  markReconciliationReviewRequired(input: {
    paymentId: string;
    attemptCount: number;
    checkedAt: string;
    reviewRequiredAt: string;
    reason: PaymentReconciliationReviewReason;
    lastError?: PaymentReconciliationError;
  }): Promise<void>;
  listReconciliationReview(input: {
    reviewReason?: PaymentReconciliationReviewReason;
    limit: number;
  }): Promise<PaymentRecord[]>;
}

export type PaymentReconciliationDispatchResponse = z.infer<
  typeof paymentReconciliationDispatchResponseSchema
>;
export type AdminPaymentReconciliationResponse = z.infer<
  typeof adminPaymentReconciliationResponseSchema
>;

const reconciliationAttemptOffsetsMinutes = [5, 15, 30] as const;

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(new Date(isoTimestamp).getTime() + minutes * 60_000).toISOString();
}

function getNextAttemptSchedule(payment: PaymentRecord, attemptCount: number): string | undefined {
  const offsetMinutes = reconciliationAttemptOffsetsMinutes[attemptCount];

  if (offsetMinutes === undefined) {
    return undefined;
  }

  return addMinutes(payment.initiatedAt, offsetMinutes);
}

function summarizeError(error: unknown): PaymentReconciliationError {
  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : undefined;

    return {
      name: error.name,
      message: error.message.slice(0, 300),
      ...(code === undefined ? {} : { code })
    };
  }

  return {
    name: "UnknownError",
    message: "Payment reconciliation failed with a non-error value."
  };
}

function getProviderPaymentStatus(
  payment: PaymentRecord
): "pending" | "confirmed" | "failed" | "unknown" {
  if (
    payment.status === "confirmed" ||
    payment.status === "refund_pending" ||
    payment.status === "refunded"
  ) {
    return "confirmed";
  }

  if (payment.status === "failed") {
    return "failed";
  }

  if (payment.reconciliationReviewReason === "provider_verification_error") {
    return "unknown";
  }

  return "pending";
}

function buildCsv(rows: AdminPaymentReconciliationResponse["rows"]): string {
  const columns = [
    "businessDate",
    "provider",
    "providerReference",
    "paymentId",
    "deliveryId",
    "quotedAmountGhs",
    "chargedAmountGhs",
    "refundedAmountGhs",
    "internalPaymentStatus",
    "providerPaymentStatus",
    "mismatchType",
    "reviewedBy",
    "reviewedAt"
  ] as const;

  const escapeCsv = (value: string | number | undefined): string => {
    const stringValue = value === undefined ? "" : String(value);

    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(","))
  ].join("\n");
}

export async function reconcileDueMtnMomoPayments(
  input: z.input<typeof paymentReconciliationDispatchRequestSchema>,
  deps: {
    payments: PaymentReconciliationRepository;
    deliveries: Pick<DeliveryRepository, "updatePaymentStatus">;
    gateway: MtnMomoGateway;
    now: () => string;
  }
): Promise<PaymentReconciliationDispatchResponse> {
  const parsedInput = paymentReconciliationDispatchRequestSchema.parse(input);
  const limit = parsedInput.limit ?? 25;
  const duePayments = await deps.payments.listPendingReconciliationDue({
    now: deps.now(),
    limit
  });
  const results: PaymentReconciliationDispatchResponse["results"] = [];

  for (const payment of duePayments) {
    const checkedAt = deps.now();
    const reconciliationAttemptCount = (payment.reconciliationAttemptCount ?? 0) + 1;

    try {
      const verification = await deps.gateway.verifyCharge({
        paymentId: payment.paymentId,
        deliveryId: payment.deliveryId,
        providerReference: payment.providerReference
      });

      if (verification.status === "confirmed" || verification.status === "failed") {
        await deps.payments.updateStatus(payment.paymentId, verification.status, {
          verifiedAt: verification.verifiedAt,
          ...(verification.failureReason === undefined
            ? {}
            : { failureReason: verification.failureReason })
        });
        await deps.deliveries.updatePaymentStatus(payment.deliveryId, verification.status);

        results.push({
          paymentId: payment.paymentId,
          deliveryId: payment.deliveryId,
          provider: payment.provider,
          providerReference: payment.providerReference,
          previousPaymentStatus: payment.status as ChargePaymentStatus,
          providerPaymentStatus: verification.status,
          action: verification.status,
          reconciliationAttemptCount,
          checkedAt: verification.verifiedAt,
          ...(verification.failureReason === undefined
            ? {}
            : { failureReason: verification.failureReason })
        });
        continue;
      }

      const nextReconciliationAt = getNextAttemptSchedule(payment, reconciliationAttemptCount);

      if (nextReconciliationAt === undefined) {
        await deps.payments.markReconciliationReviewRequired({
          paymentId: payment.paymentId,
          attemptCount: reconciliationAttemptCount,
          checkedAt,
          reviewRequiredAt: checkedAt,
          reason: "verification_unresolved_after_30_minutes"
        });

        results.push({
          paymentId: payment.paymentId,
          deliveryId: payment.deliveryId,
          provider: payment.provider,
          providerReference: payment.providerReference,
          previousPaymentStatus: payment.status as ChargePaymentStatus,
          providerPaymentStatus: "pending",
          action: "review_required",
          reconciliationAttemptCount,
          checkedAt,
          reviewRequiredAt: checkedAt,
          reviewReason: "verification_unresolved_after_30_minutes"
        });
        continue;
      }

      await deps.payments.markReconciliationPending({
        paymentId: payment.paymentId,
        attemptCount: reconciliationAttemptCount,
        checkedAt,
        nextReconciliationAt
      });

      results.push({
        paymentId: payment.paymentId,
        deliveryId: payment.deliveryId,
        provider: payment.provider,
        providerReference: payment.providerReference,
        previousPaymentStatus: payment.status as ChargePaymentStatus,
        providerPaymentStatus: "pending",
        action: "rescheduled",
        reconciliationAttemptCount,
        checkedAt,
        nextReconciliationAt
      });
    } catch (error) {
      const lastError = summarizeError(error);
      const nextReconciliationAt = getNextAttemptSchedule(payment, reconciliationAttemptCount);
      const reviewRequiredAt = nextReconciliationAt === undefined ? checkedAt : undefined;

      if (nextReconciliationAt !== undefined) {
        await deps.payments.markReconciliationPending({
          paymentId: payment.paymentId,
          attemptCount: reconciliationAttemptCount,
          checkedAt,
          nextReconciliationAt,
          lastError
        });
      } else {
        await deps.payments.markReconciliationReviewRequired({
          paymentId: payment.paymentId,
          attemptCount: reconciliationAttemptCount,
          checkedAt,
          reviewRequiredAt: checkedAt,
          reason: "provider_verification_error",
          lastError
        });
      }

      results.push({
        paymentId: payment.paymentId,
        deliveryId: payment.deliveryId,
        provider: payment.provider,
        providerReference: payment.providerReference,
        previousPaymentStatus: payment.status as ChargePaymentStatus,
        action: "provider_error",
        reconciliationAttemptCount,
        checkedAt,
        ...(nextReconciliationAt === undefined ? {} : { nextReconciliationAt }),
        ...(reviewRequiredAt === undefined
          ? {}
          : {
              reviewRequiredAt,
              reviewReason: "provider_verification_error" as const
            }),
        errorMessage: lastError.message
      });
    }
  }

  return paymentReconciliationDispatchResponseSchema.parse({
    processed: results.length,
    confirmed: results.filter((result) => result.action === "confirmed").length,
    failed: results.filter((result) => result.action === "failed").length,
    stillPending: results.filter((result) => result.action === "rescheduled").length,
    reviewRequired: results.filter((result) => result.reviewRequiredAt !== undefined).length,
    providerErrors: results.filter((result) => result.action === "provider_error").length,
    results
  });
}

export async function listAdminPaymentReconciliation(
  input: z.input<typeof adminPaymentReconciliationQuerySchema>,
  deps: {
    payments: PaymentReconciliationRepository;
    now: () => string;
  }
): Promise<AdminPaymentReconciliationResponse> {
  const parsedInput = adminPaymentReconciliationQuerySchema.parse(input);
  const payments = await deps.payments.listReconciliationReview({
    ...(parsedInput.reviewReason === undefined ? {} : { reviewReason: parsedInput.reviewReason }),
    limit: parsedInput.limit ?? 100
  });

  const rows: AdminPaymentReconciliationResponse["rows"] = payments.map((payment) => {
    const mismatchType: AdminPaymentReconciliationResponse["rows"][number]["mismatchType"] =
      payment.reconciliationReviewReason ?? "none";

    return {
      businessDate: payment.initiatedAt.slice(0, 10),
      provider: payment.provider,
      providerReference: payment.providerReference,
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId,
      quotedAmountGhs: payment.amountGhs,
      chargedAmountGhs:
        payment.status === "confirmed" ||
        payment.status === "refund_pending" ||
        payment.status === "refunded"
          ? payment.amountGhs
          : 0,
      refundedAmountGhs: payment.refundAmountGhs ?? 0,
      internalPaymentStatus: payment.status,
      providerPaymentStatus: getProviderPaymentStatus(payment),
      mismatchType,
      reconciliationAttemptCount: payment.reconciliationAttemptCount ?? 0,
      initiatedAt: payment.initiatedAt,
      ...(payment.lastReconciliationAt === undefined
        ? {}
        : { lastReconciliationAt: payment.lastReconciliationAt }),
      ...(payment.reconciliationReviewRequiredAt === undefined
        ? {}
        : { reviewRequiredAt: payment.reconciliationReviewRequiredAt })
    };
  });

  return adminPaymentReconciliationResponseSchema.parse({
    generatedAt: deps.now(),
    rows,
    csv: buildCsv(rows)
  });
}

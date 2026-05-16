import {
  calculateDeliveryQuoteBreakdown,
  getRefundDecision,
  refundPaymentResponseSchema,
  settleRefundResponseSchema,
  type RefundDecision
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRepository, DeliveryRecord } from "./deliveries";
import type { PaymentRecord } from "./payments";
import { ApiServiceError } from "./service-errors";

export interface RefundPaymentRepository {
  getById(paymentId: string): Promise<PaymentRecord | undefined>;
  markRefundPending(input: {
    paymentId: string;
    refundAmountGhs: number;
    refundReason: RefundDecision["reason"];
    requestedAt: string;
  }): Promise<void>;
  markRefundSettled(input: {
    paymentId: string;
    refundReference: string;
    settledAt: string;
  }): Promise<void>;
}

export interface RequestPaymentRefundDeps {
  deliveries: DeliveryRepository;
  payments: RefundPaymentRepository;
  now: () => string;
}

export type RequestPaymentRefundResponse = z.infer<typeof refundPaymentResponseSchema>;
export type SettlePaymentRefundResponse = z.infer<typeof settleRefundResponseSchema>;

function getRefundStage(delivery: DeliveryRecord): "before_origin_intake" | "after_origin_intake_before_dispatch" | "after_dispatch" {
  if (delivery.currentStatus === "created" || delivery.currentStatus === "cancelled") {
    return "before_origin_intake";
  }

  if (
    delivery.currentStatus === "received_at_origin" ||
    delivery.currentStatus === "awaiting_driver_assignment" ||
    delivery.currentStatus === "assigned_to_driver"
  ) {
    return "after_origin_intake_before_dispatch";
  }

  return "after_dispatch";
}

export async function requestPaymentRefund(
  input: {
    paymentId: string;
    duplicateCharge?: boolean;
    platformPaymentError?: boolean;
    packageNeverReceivedAtOrigin?: boolean;
    doorstepAttemptOccurred?: boolean;
    expressHandlingPerformed?: boolean;
  },
  deps: RequestPaymentRefundDeps
): Promise<{
  payment: PaymentRecord;
  response: RequestPaymentRefundResponse;
}> {
  const payment = await deps.payments.getById(input.paymentId);

  if (!payment) {
    throw new ApiServiceError("NOT_FOUND", "Payment was not found.", {
      paymentId: input.paymentId
    });
  }

  if (payment.status === "refund_pending" || payment.status === "refunded") {
    throw new ApiServiceError("VALIDATION_ERROR", "Refund is already in progress or completed.", {
      paymentId: payment.paymentId,
      paymentStatus: payment.status
    });
  }

  if (payment.status !== "confirmed") {
    throw new ApiServiceError("VALIDATION_ERROR", "Only confirmed payments can be refunded.", {
      paymentId: payment.paymentId,
      paymentStatus: payment.status
    });
  }

  const delivery = await deps.deliveries.getById(payment.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery linked to this payment was not found.", {
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId
    });
  }

  const quoteBreakdown = calculateDeliveryQuoteBreakdown({
    originStationId: delivery.originStationId,
    destinationStationId: delivery.destinationStationId,
    weightKg: delivery.package.weightKg,
    sizeTier: delivery.package.sizeTier,
    serviceType: delivery.serviceType,
    doorstepRequested: delivery.doorstepRequested,
    isFragile: delivery.package.isFragile,
    declaredValueGhs: delivery.package.declaredValueGhs,
    ...(delivery.doorstepDistanceKm === undefined
      ? {}
      : { doorstepDistanceKm: delivery.doorstepDistanceKm })
  });

  const decision = getRefundDecision({
    stage: getRefundStage(delivery),
    amountPaidGhs: payment.amountGhs,
    ...(input.duplicateCharge === undefined ? {} : { duplicateCharge: input.duplicateCharge }),
    ...(input.platformPaymentError === undefined
      ? {}
      : { platformPaymentError: input.platformPaymentError }),
    ...(input.packageNeverReceivedAtOrigin === undefined
      ? {}
      : { packageNeverReceivedAtOrigin: input.packageNeverReceivedAtOrigin }),
    ...(input.doorstepAttemptOccurred === undefined
      ? {}
      : { doorstepAttemptOccurred: input.doorstepAttemptOccurred }),
    doorstepSurchargeGhs: quoteBreakdown.doorstepSurcharge,
    expressSurchargeGhs: quoteBreakdown.expressSurcharge,
    ...(input.expressHandlingPerformed === undefined
      ? {}
      : { expressHandlingPerformed: input.expressHandlingPerformed })
  });

  if (decision.requiresManualReview || decision.amountGhs <= 0) {
    throw new ApiServiceError("VALIDATION_ERROR", "Refund requires manual review before execution.", {
      paymentId: payment.paymentId,
      reason: decision.reason
    });
  }

  const requestedAt = deps.now();

  await deps.payments.markRefundPending({
    paymentId: payment.paymentId,
    refundAmountGhs: decision.amountGhs,
    refundReason: decision.reason,
    requestedAt
  });
  await deps.deliveries.updatePaymentStatus(payment.deliveryId, "refund_pending");

  return {
    payment: {
      ...payment,
      status: "refund_pending"
    },
    response: refundPaymentResponseSchema.parse({
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId,
      refundStatus: "refund_pending",
      refundAmountGhs: decision.amountGhs,
      refundReason: decision.reason,
      requiresManualReview: false,
      requestedAt
    })
  };
}

export async function settlePaymentRefund(
  input: {
    paymentId: string;
    refundReference: string;
    settledAt?: string;
  },
  deps: RequestPaymentRefundDeps
): Promise<{
  payment: PaymentRecord;
  response: SettlePaymentRefundResponse;
}> {
  const payment = await deps.payments.getById(input.paymentId);

  if (!payment) {
    throw new ApiServiceError("NOT_FOUND", "Payment was not found.", {
      paymentId: input.paymentId
    });
  }

  if (payment.status !== "refund_pending") {
    throw new ApiServiceError("VALIDATION_ERROR", "Only refund-pending payments can be settled.", {
      paymentId: payment.paymentId,
      paymentStatus: payment.status
    });
  }

  if (payment.refundAmountGhs === undefined || !payment.refundReason || !payment.refundRequestedAt) {
    throw new ApiServiceError("INTERNAL_ERROR", "Refund settlement is missing refund request metadata.", {
      paymentId: payment.paymentId
    });
  }

  const delivery = await deps.deliveries.getById(payment.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery linked to this refund was not found.", {
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId
    });
  }

  const settledAt = input.settledAt ?? deps.now();

  await deps.payments.markRefundSettled({
    paymentId: payment.paymentId,
    refundReference: input.refundReference,
    settledAt
  });
  await deps.deliveries.updatePaymentStatus(payment.deliveryId, "refunded");

  const settledPayment: PaymentRecord = {
    ...payment,
    status: "refunded",
    refundReference: input.refundReference,
    refundSettledAt: settledAt
  };

  return {
    payment: settledPayment,
    response: settleRefundResponseSchema.parse({
      paymentId: settledPayment.paymentId,
      deliveryId: settledPayment.deliveryId,
      refundStatus: "refunded",
      refundAmountGhs: payment.refundAmountGhs,
      refundReason: payment.refundReason,
      refundReference: input.refundReference,
      settledAt
    })
  };
}

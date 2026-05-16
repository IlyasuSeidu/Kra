import {
  cancelDeliveryResponseSchema,
  getRefundDecision
} from "@kra/shared";
import type { z } from "zod";

import {
  assertCanAccessDelivery,
  assertCapabilityForPrincipal,
  type AuthPrincipal
} from "./auth";
import type { DeliveryRepository, DeliveryRecord } from "./deliveries";
import type { DeliveryEventRepository } from "./handoffs";
import type { PaymentRecord } from "./payments";
import { ApiServiceError } from "./service-errors";

export interface CancelDeliveryPaymentRepository {
  listByDeliveryId(deliveryId: string): Promise<PaymentRecord[]>;
  markRefundPending(input: {
    paymentId: string;
    refundAmountGhs: number;
    refundReason: "full_refund_pre_intake" | "post_intake_handling_fee";
    requestedAt: string;
  }): Promise<void>;
}

export interface CancelDeliveryRepository extends DeliveryRepository {
  save(delivery: DeliveryRecord): Promise<void>;
}

export interface CancelDeliveryIdentityFactory {
  nextDeliveryEventId(): string;
}

export interface CancelDeliveryDeps {
  deliveries: CancelDeliveryRepository;
  deliveryEvents: DeliveryEventRepository;
  payments: CancelDeliveryPaymentRepository;
  identityFactory: CancelDeliveryIdentityFactory;
  now: () => string;
}

export type CancelDeliveryResponse = z.infer<typeof cancelDeliveryResponseSchema>;

function getLatestConfirmedPayment(payments: PaymentRecord[]): PaymentRecord | undefined {
  return [...payments]
    .filter((payment) => payment.status === "confirmed")
    .sort((left, right) =>
      (right.verifiedAt ?? right.initiatedAt).localeCompare(left.verifiedAt ?? left.initiatedAt)
    )[0];
}

function assertCancelableDelivery(principal: AuthPrincipal, delivery: DeliveryRecord): void {
  assertCanAccessDelivery(principal, delivery);
  assertCapabilityForPrincipal(principal, "cancel_eligible_delivery");

  if (delivery.currentStatus !== "created" && delivery.currentStatus !== "received_at_origin") {
    throw new ApiServiceError(
      "INVALID_STATUS_TRANSITION",
      "Delivery cancellation is only allowed before dispatch.",
      {
        deliveryId: delivery.deliveryId,
        currentStatus: delivery.currentStatus
      }
    );
  }

  if (delivery.currentStatus === "received_at_origin") {
    if (principal.role === "sender") {
      throw new ApiServiceError(
        "FORBIDDEN",
        "Sender cancellation after station intake requires staff or admin intervention.",
        {
          deliveryId: delivery.deliveryId,
          currentStatus: delivery.currentStatus
        }
      );
    }

    if (
      principal.role === "station_operator" &&
      principal.stationId !== delivery.originStationId
    ) {
      throw new ApiServiceError(
        "FORBIDDEN",
        "Station operator is outside the origin-station scope for this cancellation.",
        {
          deliveryId: delivery.deliveryId,
          expectedStationId: delivery.originStationId,
          actorStationId: principal.stationId
        }
      );
    }
  }
}

function buildRefundDecision(delivery: DeliveryRecord, payment: PaymentRecord | undefined) {
  if (!payment || payment.status !== "confirmed") {
    return {
      refundStatus: "not_applicable" as const
    };
  }

  const decision = getRefundDecision({
    stage:
      delivery.currentStatus === "created"
        ? "before_origin_intake"
        : "after_origin_intake_before_dispatch",
    amountPaidGhs: payment.amountGhs
  });

  if (decision.requiresManualReview || decision.amountGhs <= 0) {
    return {
      refundStatus: "not_applicable" as const
    };
  }

  return {
    refundStatus: "refund_pending" as const,
    refundAmountGhs: decision.amountGhs,
    refundReason:
      decision.reason === "full_refund_pre_intake"
        ? ("full_refund_pre_intake" as const)
        : ("post_intake_handling_fee" as const)
  };
}

export async function cancelDelivery(
  principal: AuthPrincipal,
  input: {
    deliveryId: string;
    reasonCode:
      | "sender_changed_mind"
      | "duplicate_booking"
      | "pricing_dispute"
      | "receiver_unavailable"
      | "support_advised"
      | "other";
    note?: string;
  },
  deps: CancelDeliveryDeps
): Promise<{
  delivery: DeliveryRecord;
  response: CancelDeliveryResponse;
}> {
  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertCancelableDelivery(principal, delivery);

  const eventId = deps.identityFactory.nextDeliveryEventId();
  const occurredAt = deps.now();
  const confirmedPayment = getLatestConfirmedPayment(
    await deps.payments.listByDeliveryId(delivery.deliveryId)
  );
  const refund = buildRefundDecision(delivery, confirmedPayment);

  if (
    refund.refundStatus === "refund_pending" &&
    confirmedPayment
  ) {
    await deps.payments.markRefundPending({
      paymentId: confirmedPayment.paymentId,
      refundAmountGhs: refund.refundAmountGhs,
      refundReason: refund.refundReason,
      requestedAt: occurredAt
    });
  }

  const nextPaymentStatus =
    refund.refundStatus === "refund_pending" ? "refund_pending" : delivery.paymentStatus;
  const nextDelivery: DeliveryRecord = {
    ...delivery,
    currentStatus: "cancelled",
    paymentStatus: nextPaymentStatus,
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_cancelled",
      occurredAt
    },
    latestTouchpoint: {
      role: principal.role === "station_operator" ? "station_operator" : "system",
      occurredAt,
      stationId: delivery.originStationId
    }
  };

  await deps.deliveries.save(nextDelivery);
  await deps.deliveryEvents.create({
    eventId,
    deliveryId: delivery.deliveryId,
    type: "delivery_cancelled",
    previousStatus: delivery.currentStatus,
    nextStatus: "cancelled",
    occurredAt,
    actorId: principal.userId,
    actorRole: principal.role,
    stationId: delivery.originStationId,
    metadata: {
      reasonCode: input.reasonCode,
      ...(input.note === undefined ? {} : { note: input.note }),
      refundStatus: refund.refundStatus,
      ...(refund.refundStatus === "refund_pending"
        ? {
            refundAmountGhs: refund.refundAmountGhs,
            refundReason: refund.refundReason
          }
        : {})
    }
  });

  return {
    delivery: nextDelivery,
    response: cancelDeliveryResponseSchema.parse({
      eventId,
      deliveryId: nextDelivery.deliveryId,
      status: "cancelled",
      paymentStatus: nextDelivery.paymentStatus,
      occurredAt,
      refundStatus: refund.refundStatus,
      ...(refund.refundStatus === "refund_pending"
        ? {
            refundAmountGhs: refund.refundAmountGhs,
            refundReason: refund.refundReason
          }
        : {})
    })
  };
}

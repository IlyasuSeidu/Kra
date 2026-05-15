import {
  paymentInitializeResponseSchema,
  type PaymentStatus
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRepository, DeliveryRecord } from "./deliveries";
import { ApiServiceError } from "./service-errors";

export interface PaymentRecord {
  paymentId: string;
  deliveryId: string;
  provider: "mtn_momo";
  providerReference: string;
  payerPhone: string;
  amountGhs: number;
  status: Extract<PaymentStatus, "pending" | "confirmed" | "failed" | "refund_pending" | "refunded">;
  initiatedAt: string;
  checkoutMode: "ussd_push";
}

export interface PaymentRepository {
  create(payment: PaymentRecord): Promise<void>;
  listByDeliveryId(deliveryId: string): Promise<PaymentRecord[]>;
}

export interface PaymentIdentityFactory {
  nextPaymentId(): string;
}

export interface MtnMomoGateway {
  initializeCharge(input: {
    deliveryId: string;
    payerPhone: string;
    amountGhs: number;
  }): Promise<{
    providerReference: string;
    checkoutMode: "ussd_push";
  }>;
}

export interface InitializePaymentDeps {
  deliveries: DeliveryRepository;
  payments: PaymentRepository;
  gateway: MtnMomoGateway;
  identityFactory: PaymentIdentityFactory;
  now: () => string;
}

export type InitializePaymentResponse = z.infer<typeof paymentInitializeResponseSchema>;

const transportStartedStatuses = new Set<DeliveryRecord["currentStatus"]>([
  "dispatched_from_origin",
  "in_transit",
  "received_at_destination",
  "awaiting_receiver_pickup",
  "awaiting_final_mile_assignment",
  "assigned_for_final_mile",
  "out_for_delivery",
  "delivered",
  "issue_reported",
  "on_hold",
  "delivery_failed",
  "cancelled",
  "closed"
]);

export async function initializeMtnMomoPayment(
  input: {
    deliveryId: string;
    payerPhone: string;
    amountGhs: number;
  },
  deps: InitializePaymentDeps
): Promise<{
  payment: PaymentRecord;
  response: InitializePaymentResponse;
}> {
  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  if (transportStartedStatuses.has(delivery.currentStatus)) {
    throw new ApiServiceError(
      "INVALID_STATUS_TRANSITION",
      "Payment initialization is not allowed after transport begins.",
      {
        deliveryId: input.deliveryId,
        currentStatus: delivery.currentStatus
      }
    );
  }

  if (delivery.paymentStatus === "confirmed") {
    throw new ApiServiceError("VALIDATION_ERROR", "Payment is already confirmed.", {
      deliveryId: input.deliveryId
    });
  }

  if (input.amountGhs !== delivery.quote.amount) {
    throw new ApiServiceError("VALIDATION_ERROR", "Payment amount does not match the locked quote.", {
      deliveryId: input.deliveryId,
      expectedAmountGhs: delivery.quote.amount,
      receivedAmountGhs: input.amountGhs
    });
  }

  const existingPayments = await deps.payments.listByDeliveryId(input.deliveryId);
  const pendingPayment = existingPayments.find((payment) => payment.status === "pending");

  if (pendingPayment) {
    return {
      payment: pendingPayment,
      response: paymentInitializeResponseSchema.parse({
        paymentId: pendingPayment.paymentId,
        deliveryId: pendingPayment.deliveryId,
        provider: pendingPayment.provider,
        paymentStatus: pendingPayment.status,
        providerReference: pendingPayment.providerReference,
        checkoutMode: pendingPayment.checkoutMode
      })
    };
  }

  const gatewayResult = await deps.gateway.initializeCharge({
    deliveryId: input.deliveryId,
    payerPhone: input.payerPhone,
    amountGhs: input.amountGhs
  });

  const payment: PaymentRecord = {
    paymentId: deps.identityFactory.nextPaymentId(),
    deliveryId: input.deliveryId,
    provider: "mtn_momo",
    providerReference: gatewayResult.providerReference,
    payerPhone: input.payerPhone,
    amountGhs: input.amountGhs,
    status: "pending",
    initiatedAt: deps.now(),
    checkoutMode: gatewayResult.checkoutMode
  };

  await deps.payments.create(payment);
  await deps.deliveries.updatePaymentStatus(input.deliveryId, "pending");

  return {
    payment,
    response: paymentInitializeResponseSchema.parse({
      paymentId: payment.paymentId,
      deliveryId: payment.deliveryId,
      provider: payment.provider,
      paymentStatus: payment.status,
      providerReference: payment.providerReference,
      checkoutMode: payment.checkoutMode
    })
  };
}

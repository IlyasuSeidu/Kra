import type { DeliveryRepository } from "./deliveries";
import type { PaymentRecord, PaymentRepository } from "./payments";

type MtnMomoWebhookEventType = "payment.pending" | "payment.confirmed" | "payment.failed";
type MtnMomoWebhookAcknowledgement =
  | "processed"
  | "duplicate"
  | "unmatched"
  | "accepted_pending"
  | "manual_review";
type WebhookProcessingStatus =
  | "received"
  | "processed"
  | "duplicate"
  | "unmatched"
  | "accepted_pending"
  | "manual_review";

export interface MtnMomoWebhookInput {
  providerEventId?: string;
  providerReference: string;
  eventType: MtnMomoWebhookEventType;
  amountGhs: number;
  currency: "GHS";
  occurredAt: string;
  rawPayload?: Record<string, unknown>;
}

export interface WebhookEventRecord {
  eventId: string;
  provider: "mtn_momo";
  providerEventId?: string;
  providerReference: string;
  eventType: MtnMomoWebhookEventType;
  amountGhs: number;
  currency: "GHS";
  occurredAt: string;
  receivedAt: string;
  signatureVerified: true;
  processingStatus: WebhookProcessingStatus;
  retryCount: number;
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
  processingNotes?: string;
  rawPayload?: Record<string, unknown>;
}

export interface WebhookEventRepository {
  getByProviderReferenceAndEventType(
    providerReference: string,
    eventType: MtnMomoWebhookEventType
  ): Promise<WebhookEventRecord | undefined>;
  create(event: WebhookEventRecord): Promise<void>;
  updateProcessing(
    eventId: string,
    update: {
      processingStatus: Exclude<WebhookProcessingStatus, "received">;
      matchedPaymentId?: string;
      matchedDeliveryId?: string;
      processingNotes?: string;
    }
  ): Promise<void>;
}

export interface PaymentLookupRepository extends PaymentRepository {
  getByProviderReference(providerReference: string): Promise<PaymentRecord | undefined>;
}

export interface PaymentWebhookIdentityFactory {
  nextWebhookEventId(): string;
}

export interface ProcessMtnMomoWebhookDeps {
  deliveries: DeliveryRepository;
  payments: PaymentLookupRepository;
  webhookEvents: WebhookEventRepository;
  identityFactory: PaymentWebhookIdentityFactory;
  now: () => string;
}

export interface ProcessMtnMomoWebhookResponse {
  eventId: string;
  acknowledgement: MtnMomoWebhookAcknowledgement;
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
}

function mapEventTypeToStatus(
  eventType: MtnMomoWebhookEventType
): "pending" | "confirmed" | "failed" {
  switch (eventType) {
    case "payment.pending":
      return "pending";
    case "payment.confirmed":
      return "confirmed";
    case "payment.failed":
      return "failed";
  }
}

function buildResponse(input: {
  eventId: string;
  acknowledgement: MtnMomoWebhookAcknowledgement;
  matchedPaymentId?: string;
  matchedDeliveryId?: string;
}): ProcessMtnMomoWebhookResponse {
  return {
    eventId: input.eventId,
    acknowledgement: input.acknowledgement,
    ...(input.matchedPaymentId === undefined ? {} : { matchedPaymentId: input.matchedPaymentId }),
    ...(input.matchedDeliveryId === undefined ? {} : { matchedDeliveryId: input.matchedDeliveryId })
  };
}

export async function processMtnMomoWebhook(
  input: MtnMomoWebhookInput,
  deps: ProcessMtnMomoWebhookDeps
): Promise<{
  event: WebhookEventRecord;
  response: ProcessMtnMomoWebhookResponse;
}> {
  const duplicate = await deps.webhookEvents.getByProviderReferenceAndEventType(
    input.providerReference,
    input.eventType
  );

  if (duplicate) {
    const event: WebhookEventRecord = {
      ...duplicate,
      processingStatus: "duplicate"
    };

    return {
      event,
      response: buildResponse({
        eventId: event.eventId,
        acknowledgement: "duplicate",
        ...(event.matchedPaymentId === undefined ? {} : { matchedPaymentId: event.matchedPaymentId }),
        ...(event.matchedDeliveryId === undefined ? {} : { matchedDeliveryId: event.matchedDeliveryId })
      })
    };
  }

  const event: WebhookEventRecord = {
    eventId: deps.identityFactory.nextWebhookEventId(),
    provider: "mtn_momo",
    ...(input.providerEventId === undefined ? {} : { providerEventId: input.providerEventId }),
    providerReference: input.providerReference,
    eventType: input.eventType,
    amountGhs: input.amountGhs,
    currency: input.currency,
    occurredAt: input.occurredAt,
    receivedAt: deps.now(),
    signatureVerified: true,
    processingStatus: "received",
    retryCount: 0,
    ...(input.rawPayload === undefined ? {} : { rawPayload: input.rawPayload })
  };

  await deps.webhookEvents.create(event);

  const payment = await deps.payments.getByProviderReference(input.providerReference);

  if (!payment) {
    const updatedEvent: WebhookEventRecord = {
      ...event,
      processingStatus: "unmatched"
    };

    await deps.webhookEvents.updateProcessing(event.eventId, {
      processingStatus: "unmatched"
    });

    return {
      event: updatedEvent,
      response: buildResponse({
        eventId: updatedEvent.eventId,
        acknowledgement: "unmatched"
      })
    };
  }

  const matchedPaymentId = payment.paymentId;
  const matchedDeliveryId = payment.deliveryId;

  if (payment.amountGhs !== input.amountGhs) {
    const updatedEvent: WebhookEventRecord = {
      ...event,
      matchedPaymentId,
      matchedDeliveryId,
      processingStatus: "manual_review",
      processingNotes: "provider_amount_mismatch"
    };

    await deps.webhookEvents.updateProcessing(event.eventId, {
      processingStatus: "manual_review",
      matchedPaymentId,
      matchedDeliveryId,
      processingNotes: "provider_amount_mismatch"
    });

    return {
      event: updatedEvent,
      response: buildResponse({
        eventId: updatedEvent.eventId,
        acknowledgement: "manual_review",
        matchedPaymentId,
        matchedDeliveryId
      })
    };
  }

  const nextStatus = mapEventTypeToStatus(input.eventType);

  if (nextStatus === "pending") {
    const updatedEvent: WebhookEventRecord = {
      ...event,
      matchedPaymentId,
      matchedDeliveryId,
      processingStatus: "accepted_pending"
    };

    await deps.webhookEvents.updateProcessing(event.eventId, {
      processingStatus: "accepted_pending",
      matchedPaymentId,
      matchedDeliveryId
    });

    return {
      event: updatedEvent,
      response: buildResponse({
        eventId: updatedEvent.eventId,
        acknowledgement: "accepted_pending",
        matchedPaymentId,
        matchedDeliveryId
      })
    };
  }

  if (payment.status === nextStatus) {
    const updatedEvent: WebhookEventRecord = {
      ...event,
      matchedPaymentId,
      matchedDeliveryId,
      processingStatus: "processed"
    };

    await deps.webhookEvents.updateProcessing(event.eventId, {
      processingStatus: "processed",
      matchedPaymentId,
      matchedDeliveryId
    });

    return {
      event: updatedEvent,
      response: buildResponse({
        eventId: updatedEvent.eventId,
        acknowledgement: "manual_review",
        matchedPaymentId,
        matchedDeliveryId
      })
    };
  }

  if (payment.status !== "pending") {
    const updatedEvent: WebhookEventRecord = {
      ...event,
      matchedPaymentId,
      matchedDeliveryId,
      processingStatus: "manual_review",
      processingNotes: "conflicting_final_payment_status"
    };

    await deps.webhookEvents.updateProcessing(event.eventId, {
      processingStatus: "manual_review",
      matchedPaymentId,
      matchedDeliveryId,
      processingNotes: "conflicting_final_payment_status"
    });

    return {
      event: updatedEvent,
      response: buildResponse({
        eventId: updatedEvent.eventId,
        acknowledgement: "manual_review",
        matchedPaymentId,
        matchedDeliveryId
      })
    };
  }

  await deps.payments.updateStatus(payment.paymentId, nextStatus, {
    verifiedAt: input.occurredAt
  });
  await deps.deliveries.updatePaymentStatus(payment.deliveryId, nextStatus);

  const updatedEvent: WebhookEventRecord = {
    ...event,
    matchedPaymentId,
    matchedDeliveryId,
    processingStatus: "processed"
  };

  await deps.webhookEvents.updateProcessing(event.eventId, {
    processingStatus: "processed",
    matchedPaymentId,
    matchedDeliveryId
  });

  return {
    event: updatedEvent,
    response: buildResponse({
      eventId: updatedEvent.eventId,
      acknowledgement: "processed",
      matchedPaymentId,
      matchedDeliveryId
    })
  };
}

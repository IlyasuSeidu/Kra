import {
  createDeliveryDraft,
  createDeliveryResponseSchema,
  type CreateDeliveryDraftInput,
  type DeliveryDraft,
  type PaymentStatus
} from "@kra/shared";
import type { z } from "zod";

import { ApiServiceError } from "./service-errors";

export interface DeliveryRecord extends DeliveryDraft {
  paymentStatus: PaymentStatus;
  assignedDriverId?: string;
  assignedFinalMileCourierId?: string;
  finalProof?: {
    type: "otp" | "signature" | "delivery_photo";
    reference: string;
    receivedByName: string;
    capturedAt: string;
  };
  latestTouchpoint: {
    role: "system" | "station_operator" | "driver" | "final_mile_courier";
    occurredAt: string;
    stationId?: DeliveryDraft["originStationId"];
  };
}

export interface DeliveryRepository {
  create(delivery: DeliveryRecord): Promise<void>;
  getById(deliveryId: string): Promise<DeliveryRecord | undefined>;
  getByTrackingCode(trackingCode: string): Promise<DeliveryRecord | undefined>;
  updatePaymentStatus(deliveryId: string, paymentStatus: PaymentStatus): Promise<void>;
}

export interface DeliveryIdentityFactory {
  nextDeliveryId(): string;
  nextTrackingCode(): string;
}

export interface CreateDeliveryBookingDeps {
  deliveries: DeliveryRepository;
  identityFactory: DeliveryIdentityFactory;
  now: () => string;
}

export type CreateDeliveryBookingResponse = z.infer<typeof createDeliveryResponseSchema>;

export async function createDeliveryBooking(
  senderId: string,
  input: CreateDeliveryDraftInput,
  deps: CreateDeliveryBookingDeps
): Promise<{
  delivery: DeliveryRecord;
  response: CreateDeliveryBookingResponse;
}> {
  if (senderId !== input.senderId) {
    throw new ApiServiceError("FORBIDDEN", "Sender cannot create a delivery for another actor.", {
      senderId,
      inputSenderId: input.senderId
    });
  }

  const draft = createDeliveryDraft(input, {
    deliveryId: deps.identityFactory.nextDeliveryId(),
    trackingCode: deps.identityFactory.nextTrackingCode(),
    createdAt: deps.now()
  });

  const delivery: DeliveryRecord = {
    ...draft,
    latestTouchpoint: {
      role: "system",
      occurredAt: draft.createdAt,
      stationId: draft.originStationId
    }
  };

  await deps.deliveries.create(delivery);

  return {
    delivery,
    response: createDeliveryResponseSchema.parse({
      deliveryId: draft.deliveryId,
      trackingCode: draft.trackingCode,
      status: draft.currentStatus,
      quote: draft.quote,
      paymentRequiredBeforeDispatch: draft.paymentRequiredBeforeDispatch
    })
  };
}

import {
  calculateDeliveryQuote,
  createDeliveryDraft,
  createDeliveryResponseSchema,
  type CreateDeliveryDraftInput,
  type DeliveryDraft,
  type PaymentStatus,
  type QuoteInput
} from "@kra/shared";
import type { z } from "zod";

import { ApiServiceError } from "./service-errors";
import {
  getActivePricingRule,
  pricingRuleToConfig,
  type PricingRuleRepository
} from "./pricing-rules";

export interface DeliveryRecord extends DeliveryDraft {
  paymentStatus: PaymentStatus;
  assignedDriverId?: string;
  assignedFinalMileCourierId?: string;
  finalMileAttemptCount?: number;
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
  pricingRules?: PricingRuleRepository;
  identityFactory: DeliveryIdentityFactory;
  now: () => string;
}

export type CreateDeliveryBookingResponse = z.infer<typeof createDeliveryResponseSchema>;

function toQuoteInput(input: CreateDeliveryDraftInput): QuoteInput {
  return {
    originStationId: input.originStationId,
    destinationStationId: input.destinationStationId,
    weightKg: input.package.weightKg,
    sizeTier: input.package.sizeTier,
    serviceType: input.serviceType,
    doorstepRequested: input.doorstepRequested,
    isFragile: input.package.isFragile,
    declaredValueGhs: input.package.declaredValueGhs,
    ...(input.doorstepDistanceKm === undefined
      ? {}
      : { doorstepDistanceKm: input.doorstepDistanceKm })
  };
}

async function getConfiguredQuoteAmountGhs(
  input: CreateDeliveryDraftInput,
  deps: CreateDeliveryBookingDeps
): Promise<number | undefined> {
  if (!deps.pricingRules) {
    return undefined;
  }

  const activePricingRule = await getActivePricingRule({
    pricingRules: deps.pricingRules,
    now: deps.now
  });

  return calculateDeliveryQuote(toQuoteInput(input), pricingRuleToConfig(activePricingRule));
}

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

  const quoteAmountGhs = await getConfiguredQuoteAmountGhs(input, deps);
  const draft = createDeliveryDraft(input, {
    deliveryId: deps.identityFactory.nextDeliveryId(),
    trackingCode: deps.identityFactory.nextTrackingCode(),
    createdAt: deps.now(),
    ...(quoteAmountGhs === undefined ? {} : { quoteAmountGhs })
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

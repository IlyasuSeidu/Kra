import { calculateDeliveryQuote, type QuoteInput, type ServiceType, type SizeTier, type StationId } from "./pricing";
import type { DeliveryStatus } from "./state-machine";

export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "refund_pending"
  | "refunded";

export type DeliveryCustodyRole = "station_operator" | "driver" | "final_mile_courier";

export interface DeliveryReceiverInput {
  name: string;
  phone: string;
  addressText?: string;
}

export interface DeliveryPackageInput {
  description: string;
  weightKg: number;
  sizeTier: SizeTier;
  isFragile: boolean;
  declaredValueGhs: number;
}

export interface CreateDeliveryDraftInput {
  senderId: string;
  originStationId: StationId;
  destinationStationId: StationId;
  receiver: DeliveryReceiverInput;
  package: DeliveryPackageInput;
  serviceType: ServiceType;
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
}

export interface CreateDeliveryDraftRefs {
  deliveryId: string;
  trackingCode: string;
  createdAt: string;
  quoteAmountGhs?: number;
}

export interface DeliveryDraft {
  deliveryId: string;
  trackingCode: string;
  senderId: string;
  originStationId: StationId;
  destinationStationId: StationId;
  receiver: DeliveryReceiverInput;
  package: DeliveryPackageInput;
  serviceType: ServiceType;
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  quote: {
    currency: "GHS";
    amount: number;
  };
  paymentRequiredBeforeDispatch: boolean;
  currentCustodyRole: DeliveryCustodyRole | null;
  currentCustodyActorId: string | null;
  latestEvent: {
    type: string;
    occurredAt: string;
  };
  createdAt: string;
}

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

function assertDraftInputs(input: CreateDeliveryDraftInput): void {
  if (input.originStationId === input.destinationStationId) {
    throw new Error("Origin and destination stations must be different.");
  }

  if (!input.doorstepRequested && input.doorstepDistanceKm !== undefined) {
    throw new Error("Doorstep distance should be omitted when doorstep is not requested.");
  }

  if (input.doorstepRequested && !input.receiver.addressText) {
    throw new Error("Doorstep deliveries require a receiver address.");
  }

  if (input.doorstepRequested && input.doorstepDistanceKm === undefined) {
    throw new Error("Doorstep deliveries require a distance estimate.");
  }
}

export function createDeliveryDraft(
  input: CreateDeliveryDraftInput,
  refs: CreateDeliveryDraftRefs
): DeliveryDraft {
  assertDraftInputs(input);

  return {
    deliveryId: refs.deliveryId,
    trackingCode: refs.trackingCode,
    senderId: input.senderId,
    originStationId: input.originStationId,
    destinationStationId: input.destinationStationId,
    receiver: input.receiver,
    package: input.package,
    serviceType: input.serviceType,
    doorstepRequested: input.doorstepRequested,
    ...(input.doorstepDistanceKm === undefined
      ? {}
      : { doorstepDistanceKm: input.doorstepDistanceKm }),
    currentStatus: "created",
    paymentStatus: "pending",
    quote: {
      currency: "GHS",
      amount: refs.quoteAmountGhs ?? calculateDeliveryQuote(toQuoteInput(input))
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_created",
      occurredAt: refs.createdAt
    },
    createdAt: refs.createdAt
  };
}

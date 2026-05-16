import {
  publicTrackingResponseSchema,
  type DeliveryStatus
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRecord, DeliveryRepository } from "./deliveries";
import { ApiServiceError } from "./service-errors";

const publicLabels: Record<DeliveryStatus, string> = {
  draft: "Draft",
  created: "Booking created",
  received_at_origin: "Received at origin station",
  awaiting_driver_assignment: "Awaiting dispatch",
  assigned_to_driver: "Assigned to line-haul driver",
  dispatched_from_origin: "Left origin station",
  in_transit: "In transit",
  received_at_destination: "Arrived at destination station",
  awaiting_receiver_pickup: "Ready for pickup",
  awaiting_final_mile_assignment: "Waiting for doorstep courier",
  assigned_for_final_mile: "Assigned for doorstep delivery",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  issue_reported: "Issue under review",
  on_hold: "On hold",
  delivery_failed: "Delivery failed",
  cancelled: "Cancelled",
  closed: "Closed"
};

export interface PublicTrackingDeps {
  deliveries: DeliveryRepository;
}

export type PublicTrackingResponse = z.infer<typeof publicTrackingResponseSchema>;

function getEtaLabel(status: DeliveryRecord["currentStatus"]): string | undefined {
  if (
    status === "created" ||
    status === "received_at_origin" ||
    status === "awaiting_driver_assignment" ||
    status === "assigned_to_driver"
  ) {
    return "Awaiting next update";
  }

  if (status === "dispatched_from_origin" || status === "in_transit") {
    return "Expected tomorrow";
  }

  if (
    status === "received_at_destination" ||
    status === "awaiting_receiver_pickup" ||
    status === "awaiting_final_mile_assignment" ||
    status === "assigned_for_final_mile" ||
    status === "out_for_delivery"
  ) {
    return "Expected today";
  }

  return undefined;
}

function requiresReceiverVerification(status: DeliveryRecord["currentStatus"]): boolean {
  return (
    status === "awaiting_receiver_pickup" ||
    status === "awaiting_final_mile_assignment" ||
    status === "assigned_for_final_mile" ||
    status === "out_for_delivery"
  );
}

export async function getPublicTracking(
  trackingCode: string,
  deps: PublicTrackingDeps
): Promise<PublicTrackingResponse> {
  const delivery = await deps.deliveries.getByTrackingCode(trackingCode);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Tracking code was not found.", {
      trackingCode
    });
  }

  return publicTrackingResponseSchema.parse({
    deliveryId: delivery.deliveryId,
    trackingCode: delivery.trackingCode,
    status: delivery.currentStatus,
    publicLabel: publicLabels[delivery.currentStatus],
    latestTouchpoint: {
      role: delivery.latestTouchpoint.role,
      ...(delivery.latestTouchpoint.stationId === undefined
        ? {}
        : { stationId: delivery.latestTouchpoint.stationId }),
      occurredAt: delivery.latestTouchpoint.occurredAt
    },
    receiverVerificationRequired: requiresReceiverVerification(delivery.currentStatus),
    ...(getEtaLabel(delivery.currentStatus) === undefined
      ? {}
      : { etaLabel: getEtaLabel(delivery.currentStatus) })
  });
}

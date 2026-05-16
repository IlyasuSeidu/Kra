import {
  deliveryDetailResponseSchema,
  deliveryTimelineResponseSchema,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";
import { assertCanAccessDelivery } from "./auth";
import type { DeliveryRecord, DeliveryRepository } from "./deliveries";
import type { DeliveryEventRecord, HandoffEventRecord } from "./handoffs";
import type { SupportIssueRecord } from "./issues";
import { ApiServiceError } from "./service-errors";

export interface DeliveryEventReadRepository {
  listByDeliveryId(deliveryId: string): Promise<DeliveryEventRecord[]>;
}

export interface HandoffEventReadRepository {
  listByDeliveryId(deliveryId: string): Promise<HandoffEventRecord[]>;
}

export interface DeliveryIssueReadRepository {
  listByDeliveryId(deliveryId: string): Promise<SupportIssueRecord[]>;
}

export type DeliveryDetailResponse = z.infer<typeof deliveryDetailResponseSchema>;
export type DeliveryTimelineResponse = z.infer<typeof deliveryTimelineResponseSchema>;

function toStationTouchpoint(
  touchpoint: DeliveryRecord["latestTouchpoint"]
): DeliveryDetailResponse["latestTouchpoint"] {
  return {
    role: touchpoint.role,
    occurredAt: touchpoint.occurredAt,
    ...(touchpoint.stationId === undefined ? {} : { stationId: touchpoint.stationId })
  };
}

export async function getDeliveryDetail(
  principal: AuthPrincipal,
  deliveryId: string,
  deps: {
    deliveries: DeliveryRepository;
  }
): Promise<DeliveryDetailResponse> {
  const delivery = await deps.deliveries.getById(deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId
    });
  }

  assertCanAccessDelivery(principal, delivery);

  return deliveryDetailResponseSchema.parse({
    deliveryId: delivery.deliveryId,
    trackingCode: delivery.trackingCode,
    senderId: delivery.senderId,
    originStationId: delivery.originStationId,
    destinationStationId: delivery.destinationStationId,
    currentStatus: delivery.currentStatus,
    paymentStatus: delivery.paymentStatus,
    serviceType: delivery.serviceType,
    doorstepRequested: delivery.doorstepRequested,
    ...(delivery.doorstepDistanceKm === undefined
      ? {}
      : { doorstepDistanceKm: delivery.doorstepDistanceKm }),
    receiver: delivery.receiver,
    package: delivery.package,
    quote: delivery.quote,
    currentCustodyRole: delivery.currentCustodyRole,
    currentCustodyActorId: delivery.currentCustodyActorId,
    ...(delivery.assignedDriverId === undefined ? {} : { assignedDriverId: delivery.assignedDriverId }),
    ...(delivery.assignedFinalMileCourierId === undefined
      ? {}
      : { assignedFinalMileCourierId: delivery.assignedFinalMileCourierId }),
    latestEvent: delivery.latestEvent,
    latestTouchpoint: toStationTouchpoint(delivery.latestTouchpoint),
    ...(delivery.finalProof === undefined ? {} : { finalProof: delivery.finalProof }),
    createdAt: delivery.createdAt
  });
}

function toDeliveryEventLabel(event: DeliveryEventRecord): string {
  return `${event.type.replaceAll("_", " ")}`;
}

function toHandoffLabel(event: HandoffEventRecord): string {
  return `${event.handoffType.replaceAll("_", " ")}`;
}

function buildTimelineStationId(
  delivery: DeliveryRecord,
  stationId?: StationId
): StationId | undefined {
  if (stationId) {
    return stationId;
  }

  return delivery.originStationId ?? undefined;
}

export async function getDeliveryTimeline(
  principal: AuthPrincipal,
  deliveryId: string,
  deps: {
    deliveries: DeliveryRepository;
    deliveryEvents: DeliveryEventReadRepository;
    handoffEvents: HandoffEventReadRepository;
    issues: DeliveryIssueReadRepository;
  }
): Promise<DeliveryTimelineResponse> {
  const delivery = await deps.deliveries.getById(deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId
    });
  }

  assertCanAccessDelivery(principal, delivery);

  const [deliveryEvents, handoffEvents, issues] = await Promise.all([
    deps.deliveryEvents.listByDeliveryId(deliveryId),
    deps.handoffEvents.listByDeliveryId(deliveryId),
    deps.issues.listByDeliveryId(deliveryId)
  ]);

  const entries = [
    ...deliveryEvents.map((event) => ({
      entryId: event.eventId,
      entryType: "delivery_event" as const,
      occurredAt: event.occurredAt,
      label: toDeliveryEventLabel(event),
      actorId: event.actorId,
      actorRole: event.actorRole,
      ...(event.stationId === undefined ? {} : { stationId: event.stationId }),
      ...(event.metadata === undefined ? {} : { metadata: event.metadata })
    })),
    ...handoffEvents.map((event) => ({
      entryId: event.handoffEventId,
      entryType: "handoff_event" as const,
      occurredAt: event.occurredAt,
      label: toHandoffLabel(event),
      actorId: event.toActorId ?? event.fromActorId,
      actorRole: event.toRole ?? event.fromRole,
      ...(buildTimelineStationId(delivery, event.stationId) === undefined
        ? {}
        : { stationId: buildTimelineStationId(delivery, event.stationId) }),
      metadata: {
        proofType: event.proof.type,
        proofReference: event.proof.reference,
        ...(event.proof.condition === undefined ? {} : { condition: event.proof.condition })
      }
    })),
    ...issues.map((issue) => ({
      entryId: issue.issueId,
      entryType: "issue_event" as const,
      occurredAt: issue.updatedAt,
      label: `Issue ${issue.status.replaceAll("_", " ")}`,
      actorId: issue.reporter.actorId,
      actorRole: issue.reporter.actorRole,
      metadata: {
        severity: issue.severity,
        category: issue.category,
        summary: issue.summary
      }
    }))
  ].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

  return deliveryTimelineResponseSchema.parse({
    deliveryId: delivery.deliveryId,
    trackingCode: delivery.trackingCode,
    entries
  });
}

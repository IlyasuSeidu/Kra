import {
  assertTransition,
  canPerform,
  deliveryLifecycleResponseSchema,
  type DeliveryCustodyRole,
  type DeliveryStatus,
  type Role,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRecord } from "./deliveries";
import { ApiServiceError } from "./service-errors";

type StaffDeliveryRole = Exclude<Role, "sender" | "finance_admin" | "support_admin">;
type HandoffType =
  | "sender_to_origin_station"
  | "origin_station_to_driver"
  | "driver_to_destination_station"
  | "destination_station_to_final_mile_courier"
  | "delivery_completion";

type LifecycleEventType =
  | "delivery_received_at_origin"
  | "delivery_queued_for_driver_assignment"
  | "driver_assigned"
  | "delivery_dispatched_from_origin"
  | "delivery_marked_in_transit"
  | "delivery_received_at_destination"
  | "delivery_routed_to_pickup_queue"
  | "delivery_routed_to_final_mile_queue"
  | "delivery_routed_to_issue_queue"
  | "final_mile_courier_assigned"
  | "delivery_marked_out_for_delivery"
  | "delivery_completed"
  | "delivery_cancelled";

export interface OperationalActor {
  actorId: string;
  role: StaffDeliveryRole;
  stationId?: StationId;
}

export interface DeliveryLifecycleRepository {
  getById(deliveryId: string): Promise<DeliveryRecord | undefined>;
  save(delivery: DeliveryRecord): Promise<void>;
}

export interface DeliveryEventRecord {
  eventId: string;
  deliveryId: string;
  type: LifecycleEventType;
  previousStatus: DeliveryStatus;
  nextStatus: DeliveryStatus;
  occurredAt: string;
  actorId: string;
  actorRole: Role;
  stationId?: StationId;
  metadata?: Record<string, unknown>;
}

export interface HandoffEventRecord {
  handoffEventId: string;
  deliveryId: string;
  handoffType: HandoffType;
  fromRole?: "sender" | DeliveryCustodyRole;
  fromActorId?: string;
  toRole?: DeliveryCustodyRole;
  toActorId?: string;
  stationId?: StationId;
  occurredAt: string;
  proof: {
    reference: string;
    type: "package_scan" | "delivery_proof";
    fallbackUsed?: boolean;
    supervisorOverrideActorId?: string;
    condition?: "ok" | "damaged";
  };
}

export interface DeliveryEventRepository {
  create(event: DeliveryEventRecord): Promise<void>;
}

export interface HandoffEventRepository {
  create(event: HandoffEventRecord): Promise<void>;
}

export interface DeliveryLifecycleIdentityFactory {
  nextDeliveryEventId(): string;
  nextHandoffEventId(): string;
}

export interface DeliveryLifecycleDeps {
  deliveries: DeliveryLifecycleRepository;
  deliveryEvents: DeliveryEventRepository;
  handoffEvents: HandoffEventRepository;
  identityFactory: DeliveryLifecycleIdentityFactory;
  now: () => string;
}

export type DeliveryLifecycleResponse = z.infer<typeof deliveryLifecycleResponseSchema>;

function assertCapability(actor: OperationalActor, capability: Parameters<typeof canPerform>[1]): void {
  if (!canPerform(actor.role, capability)) {
    throw new ApiServiceError("FORBIDDEN", "Actor is not allowed to perform this delivery action.", {
      actorId: actor.actorId,
      actorRole: actor.role,
      capability
    });
  }
}

function assertStationScope(
  actor: OperationalActor,
  expectedStationId: StationId,
  action: string
): void {
  if (!actor.stationId || actor.stationId !== expectedStationId) {
    throw new ApiServiceError("FORBIDDEN", "Actor is outside the station scope for this action.", {
      actorId: actor.actorId,
      actorRole: actor.role,
      action,
      expectedStationId
    });
  }
}

function assertPaymentConfirmed(
  delivery: DeliveryRecord,
  nextStatus: DeliveryStatus
): void {
  if (
    delivery.paymentRequiredBeforeDispatch &&
    delivery.paymentStatus !== "confirmed" &&
    (nextStatus === "assigned_to_driver" ||
      nextStatus === "dispatched_from_origin" ||
      nextStatus === "in_transit" ||
      nextStatus === "received_at_destination" ||
      nextStatus === "awaiting_receiver_pickup" ||
      nextStatus === "awaiting_final_mile_assignment" ||
      nextStatus === "assigned_for_final_mile" ||
      nextStatus === "out_for_delivery" ||
      nextStatus === "delivered" ||
      nextStatus === "closed")
  ) {
    throw new ApiServiceError(
      "PAYMENT_REQUIRED",
      "Payment must be confirmed before this delivery can enter transport or completion states.",
      {
        deliveryId: delivery.deliveryId,
        paymentStatus: delivery.paymentStatus,
        nextStatus
      }
    );
  }
}

function buildLifecycleResponse(
  eventId: string,
  delivery: DeliveryRecord,
  occurredAt: string
): DeliveryLifecycleResponse {
  return deliveryLifecycleResponseSchema.parse({
    eventId,
    deliveryId: delivery.deliveryId,
    status: delivery.currentStatus,
    paymentStatus: delivery.paymentStatus,
    occurredAt
  });
}

async function applyTransition(
  input: {
    delivery: DeliveryRecord;
    nextStatus: DeliveryStatus;
    eventType: LifecycleEventType;
    actor: OperationalActor;
    occurredAt: string;
    stationId?: StationId;
    metadata?: Record<string, unknown>;
    currentCustodyRole?: DeliveryCustodyRole | null;
    currentCustodyActorId?: string | null;
    assignedDriverId?: string | null;
    assignedFinalMileCourierId?: string | null;
    finalProof?: DeliveryRecord["finalProof"];
  },
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  event: DeliveryEventRecord;
}> {
  assertTransition(input.delivery.currentStatus, input.nextStatus);
  assertPaymentConfirmed(input.delivery, input.nextStatus);

  const event: DeliveryEventRecord = {
    eventId: deps.identityFactory.nextDeliveryEventId(),
    deliveryId: input.delivery.deliveryId,
    type: input.eventType,
    previousStatus: input.delivery.currentStatus,
    nextStatus: input.nextStatus,
    occurredAt: input.occurredAt,
    actorId: input.actor.actorId,
    actorRole: input.actor.role,
    ...(input.stationId === undefined ? {} : { stationId: input.stationId }),
    ...(input.metadata === undefined ? {} : { metadata: input.metadata })
  };

  const nextDelivery: DeliveryRecord = {
    ...input.delivery,
    currentStatus: input.nextStatus,
    currentCustodyRole:
      input.currentCustodyRole === undefined
        ? input.delivery.currentCustodyRole
        : input.currentCustodyRole,
    currentCustodyActorId:
      input.currentCustodyActorId === undefined
        ? input.delivery.currentCustodyActorId
        : input.currentCustodyActorId,
    ...(input.assignedDriverId === undefined
      ? {}
      : input.assignedDriverId === null
        ? {}
        : { assignedDriverId: input.assignedDriverId }),
    ...(input.assignedFinalMileCourierId === undefined
      ? {}
      : input.assignedFinalMileCourierId === null
        ? {}
        : { assignedFinalMileCourierId: input.assignedFinalMileCourierId }),
    ...(input.finalProof === undefined ? {} : { finalProof: input.finalProof }),
    latestEvent: {
      type: input.eventType,
      occurredAt: input.occurredAt
    },
    latestTouchpoint: {
      role:
        input.currentCustodyRole === null || input.currentCustodyRole === undefined
          ? input.delivery.latestTouchpoint.role
          : input.currentCustodyRole,
      occurredAt: input.occurredAt,
      ...(input.stationId === undefined ? {} : { stationId: input.stationId })
    }
  };

  await deps.deliveries.save(nextDelivery);
  await deps.deliveryEvents.create(event);

  return {
    delivery: nextDelivery,
    event
  };
}

async function createHandoffEvent(
  input: Omit<HandoffEventRecord, "handoffEventId">,
  deps: DeliveryLifecycleDeps
): Promise<HandoffEventRecord> {
  const handoffEvent: HandoffEventRecord = {
    handoffEventId: deps.identityFactory.nextHandoffEventId(),
    ...input
  };

  await deps.handoffEvents.create(handoffEvent);

  return handoffEvent;
}

export async function confirmOriginIntake(
  input: {
    deliveryId: string;
    measuredWeightKg: number;
    sizeTier: DeliveryRecord["package"]["sizeTier"];
    condition: "ok" | "damaged";
    labelScanCode: string;
    fallbackUsed?: boolean;
    supervisorOverrideActorId?: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  assertCapability(actor, "confirm_intake");

  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertStationScope(actor, delivery.originStationId, "confirm_intake");

  const occurredAt = deps.now();
  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery: {
        ...delivery,
        package: {
          ...delivery.package,
          weightKg: input.measuredWeightKg,
          sizeTier: input.sizeTier
        }
      },
      nextStatus: "received_at_origin",
      eventType: "delivery_received_at_origin",
      actor,
      occurredAt,
      stationId: delivery.originStationId,
      currentCustodyRole: "station_operator",
      currentCustodyActorId: actor.actorId,
      metadata: {
        condition: input.condition,
        labelScanCode: input.labelScanCode,
        fallbackUsed: input.fallbackUsed ?? false,
        supervisorOverrideActorId: input.supervisorOverrideActorId
      }
    },
    deps
  );

  await createHandoffEvent(
    {
      deliveryId: delivery.deliveryId,
      handoffType: "sender_to_origin_station",
      fromRole: "sender",
      toRole: "station_operator",
      toActorId: actor.actorId,
      stationId: delivery.originStationId,
      occurredAt,
      proof: {
        reference: input.labelScanCode,
        type: "package_scan",
        condition: input.condition,
        fallbackUsed: input.fallbackUsed ?? false,
        ...(input.supervisorOverrideActorId === undefined
          ? {}
          : { supervisorOverrideActorId: input.supervisorOverrideActorId })
      }
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

export async function assignDriver(
  input: {
    deliveryId: string;
    driverUserId: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  assertCapability(actor, "assign_driver");

  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertStationScope(actor, delivery.originStationId, "assign_driver");

  let workingDelivery = delivery;
  const occurredAt = deps.now();

  if (workingDelivery.currentStatus === "received_at_origin") {
    workingDelivery = (
      await applyTransition(
        {
          delivery: workingDelivery,
          nextStatus: "awaiting_driver_assignment",
          eventType: "delivery_queued_for_driver_assignment",
          actor,
          occurredAt,
          stationId: delivery.originStationId,
          currentCustodyRole: "station_operator",
          currentCustodyActorId: workingDelivery.currentCustodyActorId ?? actor.actorId
        },
        deps
      )
    ).delivery;
  }

  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery: workingDelivery,
      nextStatus: "assigned_to_driver",
      eventType: "driver_assigned",
      actor,
      occurredAt,
      stationId: delivery.originStationId,
      assignedDriverId: input.driverUserId
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

export async function dispatchDelivery(
  input: {
    deliveryId: string;
    packageScanCode: string;
    fallbackUsed?: boolean;
    supervisorOverrideActorId?: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  assertCapability(actor, "confirm_dispatch");

  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertStationScope(actor, delivery.originStationId, "dispatch_delivery");

  if (!delivery.assignedDriverId) {
    throw new ApiServiceError("INVALID_STATUS_TRANSITION", "A driver must be assigned before dispatch.", {
      deliveryId: delivery.deliveryId,
      currentStatus: delivery.currentStatus
    });
  }

  const occurredAt = deps.now();
  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery,
      nextStatus: "dispatched_from_origin",
      eventType: "delivery_dispatched_from_origin",
      actor,
      occurredAt,
      stationId: delivery.originStationId,
      currentCustodyRole: "driver",
      currentCustodyActorId: delivery.assignedDriverId,
      metadata: {
        packageScanCode: input.packageScanCode,
        fallbackUsed: input.fallbackUsed ?? false,
        supervisorOverrideActorId: input.supervisorOverrideActorId
      }
    },
    deps
  );

  await createHandoffEvent(
    {
      deliveryId: delivery.deliveryId,
      handoffType: "origin_station_to_driver",
      fromRole: "station_operator",
      fromActorId: actor.actorId,
      toRole: "driver",
      toActorId: delivery.assignedDriverId,
      stationId: delivery.originStationId,
      occurredAt,
      proof: {
        reference: input.packageScanCode,
        type: "package_scan",
        fallbackUsed: input.fallbackUsed ?? false,
        ...(input.supervisorOverrideActorId === undefined
          ? {}
          : { supervisorOverrideActorId: input.supervisorOverrideActorId })
      }
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

export async function receiveDestination(
  input: {
    deliveryId: string;
    packageScanCode: string;
    condition: "ok" | "damaged";
    nextStep: "pickup" | "doorstep" | "issue";
    fallbackUsed?: boolean;
    supervisorOverrideActorId?: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  assertCapability(actor, "confirm_destination_receipt");

  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertStationScope(actor, delivery.destinationStationId, "receive_destination");

  if (input.nextStep === "doorstep" && !delivery.doorstepRequested) {
    throw new ApiServiceError(
      "VALIDATION_ERROR",
      "Doorstep routing is not available for a non-doorstep delivery.",
      {
        deliveryId: delivery.deliveryId,
        nextStep: input.nextStep
      }
    );
  }

  const occurredAt = deps.now();
  let workingDelivery = delivery;

  if (workingDelivery.currentStatus === "dispatched_from_origin") {
    workingDelivery = (
      await applyTransition(
        {
          delivery: workingDelivery,
          nextStatus: "in_transit",
          eventType: "delivery_marked_in_transit",
          actor,
          occurredAt,
          currentCustodyRole: "driver",
          currentCustodyActorId: workingDelivery.currentCustodyActorId
        },
        deps
      )
    ).delivery;
  }

  const receivedAtDestination = await applyTransition(
    {
      delivery: workingDelivery,
      nextStatus: "received_at_destination",
      eventType: "delivery_received_at_destination",
      actor,
      occurredAt,
      stationId: delivery.destinationStationId,
      currentCustodyRole: "station_operator",
      currentCustodyActorId: actor.actorId,
      metadata: {
        packageScanCode: input.packageScanCode,
        condition: input.condition,
        fallbackUsed: input.fallbackUsed ?? false,
        supervisorOverrideActorId: input.supervisorOverrideActorId
      }
    },
    deps
  );

  await createHandoffEvent(
    {
      deliveryId: delivery.deliveryId,
      handoffType: "driver_to_destination_station",
      fromRole: "driver",
      ...(delivery.assignedDriverId === undefined
        ? {}
        : { fromActorId: delivery.assignedDriverId }),
      toRole: "station_operator",
      toActorId: actor.actorId,
      stationId: delivery.destinationStationId,
      occurredAt,
      proof: {
        reference: input.packageScanCode,
        type: "package_scan",
        condition: input.condition,
        fallbackUsed: input.fallbackUsed ?? false,
        ...(input.supervisorOverrideActorId === undefined
          ? {}
          : { supervisorOverrideActorId: input.supervisorOverrideActorId })
      }
    },
    deps
  );

  const routedStatus =
    input.nextStep === "pickup"
      ? "awaiting_receiver_pickup"
      : input.nextStep === "doorstep"
        ? "awaiting_final_mile_assignment"
        : "issue_reported";
  const routedEventType: LifecycleEventType =
    input.nextStep === "pickup"
      ? "delivery_routed_to_pickup_queue"
      : input.nextStep === "doorstep"
        ? "delivery_routed_to_final_mile_queue"
        : "delivery_routed_to_issue_queue";
  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery: receivedAtDestination.delivery,
      nextStatus: routedStatus,
      eventType: routedEventType,
      actor,
      occurredAt,
      stationId: delivery.destinationStationId,
      currentCustodyRole: "station_operator",
      currentCustodyActorId: actor.actorId,
      metadata: {
        nextStep: input.nextStep
      }
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

export async function assignFinalMileCourier(
  input: {
    deliveryId: string;
    courierUserId: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  assertCapability(actor, "assign_final_mile");

  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  assertStationScope(actor, delivery.destinationStationId, "assign_final_mile");

  const occurredAt = deps.now();
  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery,
      nextStatus: "assigned_for_final_mile",
      eventType: "final_mile_courier_assigned",
      actor,
      occurredAt,
      stationId: delivery.destinationStationId,
      currentCustodyRole: "final_mile_courier",
      currentCustodyActorId: input.courierUserId,
      assignedFinalMileCourierId: input.courierUserId
    },
    deps
  );

  await createHandoffEvent(
    {
      deliveryId: delivery.deliveryId,
      handoffType: "destination_station_to_final_mile_courier",
      fromRole: "station_operator",
      fromActorId: actor.actorId,
      toRole: "final_mile_courier",
      toActorId: input.courierUserId,
      stationId: delivery.destinationStationId,
      occurredAt,
      proof: {
        reference: `${delivery.deliveryId}:${input.courierUserId}`,
        type: "package_scan"
      }
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

export async function completeDelivery(
  input: {
    deliveryId: string;
    proofType: "otp" | "signature" | "delivery_photo";
    proofReference: string;
    receivedByName: string;
  },
  actor: OperationalActor,
  deps: DeliveryLifecycleDeps
): Promise<{
  delivery: DeliveryRecord;
  response: DeliveryLifecycleResponse;
}> {
  const delivery = await deps.deliveries.getById(input.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: input.deliveryId
    });
  }

  const occurredAt = deps.now();

  if (delivery.currentStatus === "awaiting_receiver_pickup") {
    assertStationScope(actor, delivery.destinationStationId, "complete_delivery");
    const { delivery: updatedDelivery, event } = await applyTransition(
      {
        delivery,
        nextStatus: "delivered",
        eventType: "delivery_completed",
        actor,
        occurredAt,
        stationId: delivery.destinationStationId,
        currentCustodyRole: null,
        currentCustodyActorId: null,
        finalProof: {
          type: input.proofType,
          reference: input.proofReference,
          receivedByName: input.receivedByName,
          capturedAt: occurredAt
        }
      },
      deps
    );

    await createHandoffEvent(
      {
        deliveryId: delivery.deliveryId,
        handoffType: "delivery_completion",
        fromRole: "station_operator",
        fromActorId: actor.actorId,
        occurredAt,
        stationId: delivery.destinationStationId,
        proof: {
          reference: input.proofReference,
          type: "delivery_proof"
        }
      },
      deps
    );

    return {
      delivery: updatedDelivery,
      response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
    };
  }

  assertCapability(actor, "complete_delivery_with_proof");

  if (delivery.assignedFinalMileCourierId && delivery.assignedFinalMileCourierId !== actor.actorId) {
    throw new ApiServiceError("FORBIDDEN", "This delivery is assigned to a different courier.", {
      deliveryId: delivery.deliveryId,
      assignedFinalMileCourierId: delivery.assignedFinalMileCourierId,
      actorId: actor.actorId
    });
  }

  let workingDelivery = delivery;

  if (workingDelivery.currentStatus === "assigned_for_final_mile") {
    workingDelivery = (
      await applyTransition(
        {
          delivery: workingDelivery,
          nextStatus: "out_for_delivery",
          eventType: "delivery_marked_out_for_delivery",
          actor,
          occurredAt,
          currentCustodyRole: "final_mile_courier",
          currentCustodyActorId: actor.actorId
        },
        deps
      )
    ).delivery;
  }

  const { delivery: updatedDelivery, event } = await applyTransition(
    {
      delivery: workingDelivery,
      nextStatus: "delivered",
      eventType: "delivery_completed",
      actor,
      occurredAt,
      currentCustodyRole: null,
      currentCustodyActorId: null,
      finalProof: {
        type: input.proofType,
        reference: input.proofReference,
        receivedByName: input.receivedByName,
        capturedAt: occurredAt
      }
    },
    deps
  );

  await createHandoffEvent(
    {
      deliveryId: delivery.deliveryId,
      handoffType: "delivery_completion",
      fromRole: "final_mile_courier",
      fromActorId: actor.actorId,
      occurredAt,
      proof: {
        reference: input.proofReference,
        type: "delivery_proof"
      }
    },
    deps
  );

  return {
    delivery: updatedDelivery,
    response: buildLifecycleResponse(event.eventId, updatedDelivery, occurredAt)
  };
}

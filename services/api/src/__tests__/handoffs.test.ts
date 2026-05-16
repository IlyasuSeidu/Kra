import { describe, expect, it } from "vitest";

import { type DeliveryRecord } from "../deliveries";
import {
  acceptDriverRun,
  acceptFinalMileAssignment,
  assignDriver,
  assignFinalMileCourier,
  completeDelivery,
  confirmDriverPickup,
  confirmOriginIntake,
  dispatchDelivery,
  markDeliveryInTransit,
  markDeliveryOutForDelivery,
  recordFinalMileFailedAttempt,
  receiveDestination,
  type DeliveryEventRecord,
  type HandoffEventRecord
} from "../handoffs";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(
  overrides: Partial<DeliveryRecord> = {}
): DeliveryRecord {
  return {
    deliveryId: "DEL-6001",
    trackingCode: "KRA-6001",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Kojo Asante",
      phone: "+233240000000",
      addressText: "Adum High Street, Kumasi"
    },
    package: {
      description: "Phone accessories",
      weightKg: 1.8,
      sizeTier: "standard",
      isFragile: false,
      declaredValueGhs: 300
    },
    serviceType: "standard",
    doorstepRequested: true,
    doorstepDistanceKm: 4,
    currentStatus: "created",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_created",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    latestTouchpoint: {
      role: "system",
      stationId: "ST-ACC-01",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    createdAt: "2026-05-15T12:00:00.000Z",
    ...overrides
  };
}

describe("delivery lifecycle services", () => {
  it("confirms origin intake and captures the sender-to-station handoff", async () => {
    const savedDeliveries: DeliveryRecord[] = [];
    const deliveryEvents: DeliveryEventRecord[] = [];
    const handoffEvents: HandoffEventRecord[] = [];

    const result = await confirmOriginIntake(
      {
        deliveryId: "DEL-6001",
        measuredWeightKg: 2,
        sizeTier: "standard",
        condition: "ok",
        labelScanCode: "PKG-6001"
      },
      {
        actorId: "USR-OP-001",
        role: "station_operator",
        stationId: "ST-ACC-01"
      },
      {
        deliveries: {
          getById() {
            return resolve(makeDelivery());
          },
          save(delivery) {
            savedDeliveries.push(delivery);
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create(event) {
            deliveryEvents.push(event);
            return resolveVoid();
          }
        },
        handoffEvents: {
          create(event) {
            handoffEvents.push(event);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-6001",
          nextHandoffEventId: () => "EVT-HO-6001"
        },
        now: () => "2026-05-16T08:00:00.000Z"
      }
    );

    expect(savedDeliveries[0]?.currentStatus).toBe("received_at_origin");
    expect(savedDeliveries[0]?.currentCustodyRole).toBe("station_operator");
    expect(deliveryEvents[0]?.type).toBe("delivery_received_at_origin");
    expect(handoffEvents[0]?.handoffType).toBe("sender_to_origin_station");
    expect(result.response).toEqual({
      eventId: "EVT-DEL-6001",
      deliveryId: "DEL-6001",
      status: "received_at_origin",
      paymentStatus: "confirmed",
      occurredAt: "2026-05-16T08:00:00.000Z"
    });
  });

  it("assigns a driver and dispatches the delivery after payment confirmation", async () => {
    const savedDeliveries: DeliveryRecord[] = [];
    const deliveryEvents: string[] = [];
    const handoffEvents: string[] = [];
    let currentDelivery = makeDelivery({
      currentStatus: "received_at_origin",
      currentCustodyRole: "station_operator",
      currentCustodyActorId: "USR-OP-001",
      latestTouchpoint: {
        role: "station_operator",
        stationId: "ST-ACC-01",
        occurredAt: "2026-05-16T08:00:00.000Z"
      }
    });

    const deps = {
      deliveries: {
        getById() {
          return resolve(currentDelivery);
        },
        save(delivery: DeliveryRecord) {
          currentDelivery = delivery;
          savedDeliveries.push(delivery);
          return resolveVoid();
        }
      },
      deliveryEvents: {
        create(event: DeliveryEventRecord) {
          deliveryEvents.push(`${event.eventId}:${event.type}:${event.nextStatus}`);
          return resolveVoid();
        }
      },
      handoffEvents: {
        create(event: HandoffEventRecord) {
          handoffEvents.push(`${event.handoffEventId}:${event.handoffType}`);
          return resolveVoid();
        }
      },
      identityFactory: {
        nextDeliveryEventId: (() => {
          const ids = ["EVT-DEL-6002", "EVT-DEL-6003", "EVT-DEL-6004"];
          return () => ids.shift() ?? "EVT-DEL-EXTRA";
        })(),
        nextHandoffEventId: () => "EVT-HO-6002"
      },
      now: () => "2026-05-16T08:10:00.000Z"
    };

    const assignment = await assignDriver(
      {
        deliveryId: "DEL-6001",
        driverUserId: "USR-DRV-001"
      },
      {
        actorId: "USR-OP-001",
        role: "station_operator",
        stationId: "ST-ACC-01"
      },
      deps
    );

    const dispatch = await dispatchDelivery(
      {
        deliveryId: "DEL-6001",
        packageScanCode: "PKG-6001"
      },
      {
        actorId: "USR-OP-001",
        role: "station_operator",
        stationId: "ST-ACC-01"
      },
      deps
    );

    expect(assignment.response.status).toBe("assigned_to_driver");
    expect(dispatch.response.status).toBe("dispatched_from_origin");
    expect(currentDelivery.assignedDriverId).toBe("USR-DRV-001");
    expect(currentDelivery.currentCustodyRole).toBe("driver");
    expect(deliveryEvents).toEqual([
      "EVT-DEL-6002:delivery_queued_for_driver_assignment:awaiting_driver_assignment",
      "EVT-DEL-6003:driver_assigned:assigned_to_driver",
      "EVT-DEL-6004:delivery_dispatched_from_origin:dispatched_from_origin"
    ]);
    expect(handoffEvents).toEqual(["EVT-HO-6002:origin_station_to_driver"]);
    expect(savedDeliveries.at(-1)?.currentStatus).toBe("dispatched_from_origin");
  });

  it("lets the assigned driver mark the package in transit", async () => {
    let currentDelivery = makeDelivery({
      currentStatus: "dispatched_from_origin",
      assignedDriverId: "USR-DRV-001",
      currentCustodyRole: "driver",
      currentCustodyActorId: "USR-DRV-001"
    });

    const result = await markDeliveryInTransit(
      {
        deliveryId: "DEL-6001",
        note: "Departed Accra station"
      },
      {
        actorId: "USR-DRV-001",
        role: "driver"
      },
      {
        deliveries: {
          getById() {
            return resolve(currentDelivery);
          },
          save(delivery) {
            currentDelivery = delivery;
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create() {
            return resolveVoid();
          }
        },
        handoffEvents: {
          create() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-6004A",
          nextHandoffEventId: () => "EVT-HO-UNUSED"
        },
        now: () => "2026-05-16T08:20:00.000Z"
      }
    );

    expect(result.response.status).toBe("in_transit");
    expect(currentDelivery.currentStatus).toBe("in_transit");
  });

  it("receives a delivery at destination and routes it into the final-mile queue", async () => {
    const deliveryEvents: string[] = [];
    let currentDelivery = makeDelivery({
      currentStatus: "dispatched_from_origin",
      assignedDriverId: "USR-DRV-001",
      currentCustodyRole: "driver",
      currentCustodyActorId: "USR-DRV-001"
    });

    const result = await receiveDestination(
      {
        deliveryId: "DEL-6001",
        packageScanCode: "PKG-6001",
        condition: "ok",
        nextStep: "doorstep"
      },
      {
        actorId: "USR-OP-002",
        role: "station_operator",
        stationId: "ST-KMS-01"
      },
      {
        deliveries: {
          getById() {
            return resolve(currentDelivery);
          },
          save(delivery) {
            currentDelivery = delivery;
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create(event) {
            deliveryEvents.push(`${event.type}:${event.nextStatus}`);
            return resolveVoid();
          }
        },
        handoffEvents: {
          create() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: (() => {
            const ids = ["EVT-DEL-6005", "EVT-DEL-6006"];
            return () => ids.shift() ?? "EVT-DEL-EXTRA";
          })(),
          nextHandoffEventId: () => "EVT-HO-6003"
        },
        now: () => "2026-05-16T13:00:00.000Z"
      }
    );

    expect(deliveryEvents).toEqual([
      "delivery_marked_in_transit:in_transit",
      "delivery_received_at_destination:received_at_destination",
      "delivery_routed_to_final_mile_queue:awaiting_final_mile_assignment"
    ]);
    expect(currentDelivery.currentStatus).toBe("awaiting_final_mile_assignment");
    expect(currentDelivery.currentCustodyRole).toBe("station_operator");
    expect(result.response.status).toBe("awaiting_final_mile_assignment");
  });

  it("assigns a final-mile courier and completes the delivery with proof", async () => {
    const handoffEvents: string[] = [];
    let currentDelivery = makeDelivery({
      currentStatus: "awaiting_final_mile_assignment",
      currentCustodyRole: "station_operator",
      currentCustodyActorId: "USR-OP-002"
    });

    const deps = {
      deliveries: {
        getById() {
          return resolve(currentDelivery);
        },
        save(delivery: DeliveryRecord) {
          currentDelivery = delivery;
          return resolveVoid();
        }
      },
      deliveryEvents: {
        create() {
          return resolveVoid();
        }
      },
      handoffEvents: {
        create(event: HandoffEventRecord) {
          handoffEvents.push(event.handoffType);
          return resolveVoid();
        }
      },
      identityFactory: {
        nextDeliveryEventId: (() => {
          const ids = ["EVT-DEL-6007", "EVT-DEL-6008", "EVT-DEL-6009"];
          return () => ids.shift() ?? "EVT-DEL-EXTRA";
        })(),
        nextHandoffEventId: (() => {
          const ids = ["EVT-HO-6004", "EVT-HO-6005"];
          return () => ids.shift() ?? "EVT-HO-EXTRA";
        })()
      },
      now: () => "2026-05-16T14:00:00.000Z"
    };

    const assignment = await assignFinalMileCourier(
      {
        deliveryId: "DEL-6001",
        courierUserId: "USR-COR-001"
      },
      {
        actorId: "USR-OP-002",
        role: "station_operator",
        stationId: "ST-KMS-01"
      },
      deps
    );

    const completion = await completeDelivery(
      {
        deliveryId: "DEL-6001",
        proofType: "otp",
        proofReference: "OTP-VERIFIED",
        receivedByName: "Kojo Asante"
      },
      {
        actorId: "USR-COR-001",
        role: "final_mile_courier"
      },
      deps
    );

    expect(assignment.response.status).toBe("assigned_for_final_mile");
    expect(completion.response.status).toBe("delivered");
    expect(currentDelivery.finalProof).toEqual({
      type: "otp",
      reference: "OTP-VERIFIED",
      receivedByName: "Kojo Asante",
      capturedAt: "2026-05-16T14:00:00.000Z"
    });
    expect(currentDelivery.currentCustodyRole).toBeNull();
    expect(handoffEvents).toEqual([
      "destination_station_to_final_mile_courier",
      "delivery_completion"
    ]);
  });

  it("lets the assigned final-mile courier mark the package out for delivery", async () => {
    let currentDelivery = makeDelivery({
      currentStatus: "assigned_for_final_mile",
      assignedFinalMileCourierId: "USR-COR-001",
      currentCustodyRole: "final_mile_courier",
      currentCustodyActorId: "USR-COR-001"
    });

    const result = await markDeliveryOutForDelivery(
      {
        deliveryId: "DEL-6001",
        note: "Courier departed destination station"
      },
      {
        actorId: "USR-COR-001",
        role: "final_mile_courier"
      },
      {
        deliveries: {
          getById() {
            return resolve(currentDelivery);
          },
          save(delivery) {
            currentDelivery = delivery;
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create() {
            return resolveVoid();
          }
        },
        handoffEvents: {
          create() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-6009A",
          nextHandoffEventId: () => "EVT-HO-UNUSED"
        },
        now: () => "2026-05-16T14:05:00.000Z"
      }
    );

    expect(result.response.status).toBe("out_for_delivery");
    expect(currentDelivery.currentStatus).toBe("out_for_delivery");
  });

  it("supports station pickup completion and blocks wrong-station or unpaid transport actions", async () => {
    await expect(() =>
      confirmOriginIntake(
        {
          deliveryId: "DEL-6001",
          measuredWeightKg: 2,
          sizeTier: "standard",
          condition: "ok",
          labelScanCode: "PKG-6001"
        },
        {
          actorId: "USR-OP-001",
          role: "station_operator",
          stationId: "ST-KMS-01"
        },
        {
          deliveries: {
            getById() {
              return resolve(makeDelivery());
            },
            save() {
              return resolveVoid();
            }
          },
          deliveryEvents: {
            create() {
              return resolveVoid();
            }
          },
          handoffEvents: {
            create() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextDeliveryEventId: () => "EVT-DEL-FAIL-1",
            nextHandoffEventId: () => "EVT-HO-FAIL-1"
          },
          now: () => "2026-05-16T08:00:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      assignDriver(
        {
          deliveryId: "DEL-6001",
          driverUserId: "USR-DRV-001"
        },
        {
          actorId: "USR-OP-001",
          role: "station_operator",
          stationId: "ST-ACC-01"
        },
        {
          deliveries: {
            getById() {
              return resolve(makeDelivery({
                currentStatus: "received_at_origin",
                paymentStatus: "pending"
              }));
            },
            save() {
              return resolveVoid();
            }
          },
          deliveryEvents: {
            create() {
              return resolveVoid();
            }
          },
          handoffEvents: {
            create() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextDeliveryEventId: (() => {
              const ids = ["EVT-DEL-FAIL-2", "EVT-DEL-FAIL-3"];
              return () => ids.shift() ?? "EVT-DEL-EXTRA";
            })(),
            nextHandoffEventId: () => "EVT-HO-FAIL-2"
          },
          now: () => "2026-05-16T08:05:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "PAYMENT_REQUIRED"
    });

    const pickupCompletion = await completeDelivery(
      {
        deliveryId: "DEL-6001",
        proofType: "otp",
        proofReference: "OTP-PICKUP-VERIFIED",
        receivedByName: "Kojo Asante"
      },
      {
        actorId: "USR-OP-002",
        role: "station_operator",
        stationId: "ST-KMS-01"
      },
      {
        deliveries: {
          getById() {
            return resolve(makeDelivery({
              currentStatus: "awaiting_receiver_pickup",
              currentCustodyRole: "station_operator",
              currentCustodyActorId: "USR-OP-002"
            }));
          },
          save() {
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create() {
            return resolveVoid();
          }
        },
        handoffEvents: {
          create() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-6010",
          nextHandoffEventId: () => "EVT-HO-6010"
        },
        now: () => "2026-05-16T16:00:00.000Z"
      }
    );

    expect(pickupCompletion.response.status).toBe("delivered");
  });

  it("returns a failed doorstep attempt to the final-mile queue, then pickup flow on the second attempt", async () => {
    let currentDelivery = makeDelivery({
      currentStatus: "assigned_for_final_mile",
      assignedFinalMileCourierId: "USR-COR-001",
      currentCustodyRole: "final_mile_courier",
      currentCustodyActorId: "USR-COR-001"
    });
    const handoffEvents: string[] = [];

    const deps = {
      deliveries: {
        getById() {
          return resolve(currentDelivery);
        },
        save(delivery: DeliveryRecord) {
          currentDelivery = delivery;
          return resolveVoid();
        }
      },
      deliveryEvents: {
        create() {
          return resolveVoid();
        }
      },
      handoffEvents: {
        create(event: HandoffEventRecord) {
          handoffEvents.push(event.handoffType);
          return resolveVoid();
        }
      },
      identityFactory: {
        nextDeliveryEventId: (() => {
          const ids = ["EVT-DEL-6011", "EVT-DEL-6012", "EVT-DEL-6013", "EVT-DEL-6014"];
          return () => ids.shift() ?? "EVT-DEL-EXTRA";
        })(),
        nextHandoffEventId: (() => {
          const ids = ["EVT-HO-6011", "EVT-HO-6012"];
          return () => ids.shift() ?? "EVT-HO-EXTRA";
        })()
      },
      now: () => "2026-05-16T15:00:00.000Z"
    };

    const firstAttempt = await recordFinalMileFailedAttempt(
      {
        deliveryId: "DEL-6001",
        reasonCode: "receiver_unavailable",
        note: "Receiver requested a later attempt"
      },
      {
        actorId: "USR-COR-001",
        role: "final_mile_courier"
      },
      deps
    );

    expect(firstAttempt.response.status).toBe("awaiting_final_mile_assignment");
    expect(currentDelivery.finalMileAttemptCount).toBe(1);
    expect(currentDelivery.assignedFinalMileCourierId).toBeUndefined();

    currentDelivery = {
      ...currentDelivery,
      currentStatus: "out_for_delivery",
      assignedFinalMileCourierId: "USR-COR-001",
      currentCustodyRole: "final_mile_courier",
      currentCustodyActorId: "USR-COR-001"
    };

    const secondAttempt = await recordFinalMileFailedAttempt(
      {
        deliveryId: "DEL-6001",
        reasonCode: "address_not_found",
        note: "Address landmark could not be verified"
      },
      {
        actorId: "USR-COR-001",
        role: "final_mile_courier"
      },
      deps
    );

    expect(secondAttempt.response.status).toBe("awaiting_receiver_pickup");
    expect(currentDelivery.finalMileAttemptCount).toBe(2);
    expect(handoffEvents).toEqual([
      "final_mile_courier_to_destination_station",
      "final_mile_courier_to_destination_station"
    ]);
  });

  it("records driver acceptance and pickup confirmation without moving status", async () => {
    const savedDeliveries: DeliveryRecord[] = [];
    const deliveryEvents: DeliveryEventRecord[] = [];

    const deps = {
      deliveries: {
        getById() {
          return resolve(
            makeDelivery({
              currentStatus: "assigned_to_driver",
              assignedDriverId: "USR-DRV-001",
              currentCustodyRole: "station_operator",
              currentCustodyActorId: "USR-OP-001"
            })
          );
        },
        save(delivery: DeliveryRecord) {
          savedDeliveries.push(delivery);
          return resolveVoid();
        }
      },
      deliveryEvents: {
        create(event: DeliveryEventRecord) {
          deliveryEvents.push(event);
          return resolveVoid();
        }
      },
      handoffEvents: {
        create() {
          return resolveVoid();
        }
      },
      identityFactory: {
        nextDeliveryEventId: (() => {
          const ids = ["EVT-DEL-ACCEPT", "EVT-DEL-PICKUP"];
          return () => ids.shift() ?? "EVT-DEL-EXTRA";
        })(),
        nextHandoffEventId: () => "EVT-HO-UNUSED"
      },
      now: () => "2026-05-16T18:00:00.000Z"
    };

    const accepted = await acceptDriverRun(
      {
        deliveryId: "DEL-6001",
        note: "Accepted within SLA"
      },
      {
        actorId: "USR-DRV-001",
        role: "driver"
      },
      deps
    );

    const pickedUp = await confirmDriverPickup(
      {
        deliveryId: "DEL-6001",
        packageScanCode: "PKG-6001"
      },
      {
        actorId: "USR-DRV-001",
        role: "driver"
      },
      deps
    );

    expect(accepted.response.status).toBe("assigned_to_driver");
    expect(pickedUp.response.status).toBe("assigned_to_driver");
    expect(savedDeliveries).toHaveLength(2);
    expect(deliveryEvents.map((event) => event.type)).toEqual([
      "driver_assignment_accepted",
      "driver_pickup_confirmed"
    ]);
  });

  it("records final-mile assignment acceptance without moving status", async () => {
    const deliveryEvents: DeliveryEventRecord[] = [];

    const result = await acceptFinalMileAssignment(
      {
        deliveryId: "DEL-6001",
        note: "Courier ready"
      },
      {
        actorId: "USR-COR-001",
        role: "final_mile_courier"
      },
      {
        deliveries: {
          getById() {
            return resolve(
              makeDelivery({
                currentStatus: "assigned_for_final_mile",
                assignedFinalMileCourierId: "USR-COR-001",
                currentCustodyRole: "final_mile_courier",
                currentCustodyActorId: "USR-COR-001"
              })
            );
          },
          save() {
            return resolveVoid();
          }
        },
        deliveryEvents: {
          create(event: DeliveryEventRecord) {
            deliveryEvents.push(event);
            return resolveVoid();
          }
        },
        handoffEvents: {
          create() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextDeliveryEventId: () => "EVT-DEL-COR-ACCEPT",
          nextHandoffEventId: () => "EVT-HO-UNUSED"
        },
        now: () => "2026-05-16T18:05:00.000Z"
      }
    );

    expect(result.response.status).toBe("assigned_for_final_mile");
    expect(deliveryEvents[0]?.type).toBe("final_mile_assignment_accepted");
  });
});

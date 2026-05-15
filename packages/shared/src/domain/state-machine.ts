export type DeliveryStatus =
  | "draft"
  | "created"
  | "received_at_origin"
  | "awaiting_driver_assignment"
  | "assigned_to_driver"
  | "dispatched_from_origin"
  | "in_transit"
  | "received_at_destination"
  | "awaiting_receiver_pickup"
  | "awaiting_final_mile_assignment"
  | "assigned_for_final_mile"
  | "out_for_delivery"
  | "delivered"
  | "issue_reported"
  | "on_hold"
  | "delivery_failed"
  | "cancelled"
  | "closed";

const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  draft: ["created"],
  created: ["received_at_origin", "cancelled"],
  received_at_origin: ["awaiting_driver_assignment", "cancelled"],
  awaiting_driver_assignment: ["assigned_to_driver", "issue_reported"],
  assigned_to_driver: ["dispatched_from_origin", "issue_reported"],
  dispatched_from_origin: ["in_transit", "issue_reported"],
  in_transit: ["received_at_destination", "issue_reported"],
  received_at_destination: [
    "awaiting_receiver_pickup",
    "awaiting_final_mile_assignment",
    "issue_reported"
  ],
  awaiting_receiver_pickup: ["on_hold", "closed", "issue_reported"],
  awaiting_final_mile_assignment: ["assigned_for_final_mile", "issue_reported"],
  assigned_for_final_mile: ["out_for_delivery", "issue_reported"],
  out_for_delivery: ["delivered", "awaiting_receiver_pickup", "issue_reported"],
  delivered: ["closed"],
  issue_reported: [
    "awaiting_receiver_pickup",
    "awaiting_final_mile_assignment",
    "delivery_failed"
  ],
  on_hold: ["awaiting_receiver_pickup", "delivery_failed"],
  delivery_failed: [],
  cancelled: [],
  closed: []
};

export function canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: DeliveryStatus, to: DeliveryStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid status transition: ${from} -> ${to}`);
  }
}

export function isTerminalStatus(status: DeliveryStatus): boolean {
  return transitions[status].length === 0;
}

export function getNextStatuses(status: DeliveryStatus): readonly DeliveryStatus[] {
  return transitions[status];
}


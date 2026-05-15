export type Role =
  | "sender"
  | "driver"
  | "station_operator"
  | "final_mile_courier"
  | "ops_admin"
  | "finance_admin"
  | "support_admin"
  | "super_admin";

export type Capability =
  | "create_delivery"
  | "edit_pre_intake_delivery"
  | "view_own_delivery"
  | "open_issue"
  | "cancel_eligible_delivery"
  | "accept_run"
  | "confirm_pickup"
  | "update_transit_status"
  | "report_delay"
  | "confirm_intake"
  | "assign_driver"
  | "confirm_dispatch"
  | "confirm_destination_receipt"
  | "assign_final_mile"
  | "accept_final_mile_assignment"
  | "mark_out_for_delivery"
  | "complete_delivery_with_proof"
  | "record_failed_attempt"
  | "reassign_delivery"
  | "override_queue_state"
  | "resolve_operational_issue"
  | "approve_refund"
  | "execute_refund"
  | "review_reconciliation"
  | "manage_issue_thread"
  | "escalate_case"
  | "manage_users_and_roles";

const capabilityMatrix: Record<Role, Capability[]> = {
  sender: [
    "create_delivery",
    "edit_pre_intake_delivery",
    "view_own_delivery",
    "open_issue",
    "cancel_eligible_delivery"
  ],
  driver: ["accept_run", "confirm_pickup", "update_transit_status", "report_delay"],
  station_operator: [
    "confirm_intake",
    "assign_driver",
    "confirm_dispatch",
    "confirm_destination_receipt",
    "assign_final_mile",
    "open_issue"
  ],
  final_mile_courier: [
    "accept_final_mile_assignment",
    "mark_out_for_delivery",
    "complete_delivery_with_proof",
    "record_failed_attempt",
    "open_issue"
  ],
  ops_admin: [
    "reassign_delivery",
    "override_queue_state",
    "resolve_operational_issue",
    "escalate_case"
  ],
  finance_admin: ["approve_refund", "execute_refund", "review_reconciliation"],
  support_admin: ["manage_issue_thread", "escalate_case"],
  super_admin: [
    "reassign_delivery",
    "override_queue_state",
    "resolve_operational_issue",
    "approve_refund",
    "execute_refund",
    "review_reconciliation",
    "manage_issue_thread",
    "escalate_case",
    "manage_users_and_roles"
  ]
};

export function canPerform(role: Role, capability: Capability): boolean {
  return capabilityMatrix[role].includes(capability);
}

export function getCapabilities(role: Role): readonly Capability[] {
  return capabilityMatrix[role];
}


# Authorization Rules

## Core Principle
Access should be based on role, assignment, and station scope, not just on authentication state.

## Sender
- Can create deliveries.
- Can view own deliveries, payments, and support threads.
- Cannot see internal staff notes or unrelated deliveries.

## Driver
- Can view assigned runs and own history.
- Can update only statuses allowed for the current assignment.
- Cannot reassign or administratively close issues.

## Station Operator
- Can work only on deliveries within station scope.
- Can intake, assign, dispatch, and receive according to role permissions.
- Cannot view system-wide financial data by default.

## Admin
- Can access cross-network dashboards and configuration.
- Sensitive override actions should be logged and reviewable.

## Approved Backend Action Mapping
- sender:
  - `create_delivery`
  - `edit_pre_intake_delivery`
  - `view_own_delivery`
  - `open_issue`
  - `cancel_eligible_delivery`
- driver:
  - `accept_run`
  - `confirm_pickup`
  - `update_transit_status`
  - `report_delay`
- station_operator:
  - `confirm_intake`
  - `assign_driver`
  - `confirm_dispatch`
  - `confirm_destination_receipt`
  - `assign_final_mile`
- final_mile_courier:
  - `accept_final_mile_assignment`
  - `mark_out_for_delivery`
  - `complete_delivery_with_proof`
  - `record_failed_attempt`
- ops_admin:
  - `reassign_delivery`
  - `override_queue_state`
  - `resolve_operational_issue`
- finance_admin:
  - `approve_refund`
  - `execute_refund`
  - `review_reconciliation`
- support_admin:
  - `manage_issue_thread`
  - `escalate_case`
- super_admin:
  - all privileged actions

## Subrole Decision
- `station_lead` is an operational designation, not a separate technical role.
- No regional supervisor role is required in v1.

## Data Access Boundaries
- Support admins can read delivery summaries and issue threads across the network.
- Finance admins can read payment and refund detail across the network.
- Neither support nor finance admins may change transport state unless they also hold a privileged admin role.

## Audit Rule
- Every privileged backend action must emit an audit event before success is returned to the caller.

## Baseline Status
This file is now concrete enough to drive backend permission checks.

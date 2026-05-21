# Reject Assignment Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `RejectAssignmentModal` |
| Component target | shared driver and final-mile courier assignment rejection modal |
| Primary test ID | `modal-reject-assignment` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 assignment exception capture |
| Used by | `DriverAcceptRun`, `AssignedRunDetail`, `CourierAssignmentDetail`, `CourierAcceptAssignmentScan`, `OpsActionRecovery`, assignment push notification recovery |
| Backend coverage | issue and assignment path when exposed; no direct reject mutation exists in current backend |
| Current implementation mode | contract-honest issue/escalation modal with future reject mutation boundary |
| Required states | `closed`, `opening`, `reviewing_assignment`, `driver_context`, `courier_context`, `reason_required`, `reason_selected`, `note_required`, `note_invalid`, `deadline_warning`, `custody_blocked`, `already_accepted_blocked`, `already_in_custody_blocked`, `scope_blocked`, `status_blocked`, `payment_blocked`, `issue_lock_blocked`, `offline_blocked`, `offline_issue_draft_available`, `submitting_issue`, `issue_created`, `support_route_ready`, `server_rejected`, `network_error`, `future_reject_supported`, `submitting_future_reject`, `future_reject_confirmed`, `closing` |

## Product Job
`RejectAssignmentModal` lets an assigned driver or final-mile courier say they cannot take a pending assignment, capture a structured operational reason, and route the exception to support or issue handling without moving custody or pretending unsupported backend behavior exists.

The modal answers:
- `Which assignment am I declining or reporting as unavailable?`
- `Is it still safe to report this before custody moves?`
- `Why can I not take it?`
- `Will this create an operational issue, route me to support, or use a future reject endpoint?`
- `What must happen next so the package is not lost or stalled?`
- `Who remains accountable for custody after this action?`
- `Can this action run offline?`

The user should be able to:
- Review the delivery identity and assignment type.
- Understand that assignment is not custody.
- Select one structured reason.
- Add a concise operational note when the reason requires detail.
- Submit an issue/escalation if the current backend has no reject mutation.
- Use a direct reject endpoint only if the host explicitly provides that capability in the future.
- See whether station/support must reassign the delivery.
- Cancel without changing assignment state.
- Avoid seeing receiver-sensitive details unless already available from the parent screen.

The modal is not:
- A reassignment screen.
- A support conversation.
- A route planner.
- A scanner.
- A custody acceptance step.
- A failed delivery attempt form.
- A cancellation form.
- A payment screen.
- A place to mark the package missing after custody has moved.
- A hidden admin override.

## Strategic Role
Kra separates assignment, acceptance, and custody to prevent loss of goods. This modal protects the boundary before the receiving party takes responsibility.

Core principle:
- Assignment tells a staff member what work is reserved for them.
- Acceptance records that the staff member agrees to take the work.
- Scan-confirmed custody records who physically becomes accountable.
- Rejection or inability to accept must not move custody.
- Until a backend-supported reassignment or issue outcome changes the delivery, the current confirmed custodian remains accountable.

For v1, rejecting an assignment is an exception-reporting action, not a lifecycle transition. It should give operations enough structured evidence to reassign quickly, but the UI must not claim the assignment has been removed unless the backend later exposes and confirms a real reject mutation.

## Audience
Primary users:
- Drivers assigned to inter-station runs who cannot accept before pickup.
- Final-mile couriers assigned to doorstep jobs who cannot accept before destination-station custody transfer.

Secondary users:
- Station operators waiting to reassign the package.
- Station leads reviewing a driver or courier availability issue.
- Support staff triaging assignment refusal.
- Ops admins reviewing repeated rejections or capacity problems.
- QA validating the reject boundary.
- Security reviewers validating that sensitive receiver and package data is not leaked.
- Claude Code implementing this modal later.

Non-users:
- Senders.
- Receivers.
- Public tracking visitors.
- Finance-only admins.
- Webhook processors.
- AI agents acting without an authenticated staff user.

## Current Backend Reality
Current backend supports:
- `accept_run` for drivers.
- `confirm_pickup` for driver custody transfer.
- `accept_final_mile_assignment` for courier custody transfer.
- `POST /v1/issues` for issue creation.
- `GET /v1/issues` and issue detail routes.
- Admin/support issue escalation and resolution routes.

Current backend does not expose:
- `reject_run`.
- `reject_final_mile_assignment`.
- `unassign_driver`.
- `unassign_final_mile_courier`.
- Assignment response deadline fields in delivery detail.
- Automatic return from `assigned_to_driver` to `awaiting_driver_assignment` after driver refusal.
- Automatic return from `assigned_for_final_mile` to `awaiting_final_mile_assignment` after courier refusal.

Frontend implication:
- The modal must not call a reject mutation in v1.
- The modal must not change delivery status locally.
- The modal must not remove the assignment from the visible queue without confirmed backend state.
- The modal must create or route to an issue/support flow when rejection is requested.
- The modal must show copy that says support or station staff must reassign the delivery.
- The modal may define a future endpoint contract, but the default v1 behavior is issue/escalation.

Current driver acceptance route:
- Operation key: `accept_run`.
- Route: `POST /v1/deliveries/:id/accept-run`.
- Actor role: `driver`.
- Required status: `assigned_to_driver`.
- Scope: `assignedDriverId === actor.actorId`.
- Success event: `driver_assignment_accepted`.
- Custody does not move.

Current courier acceptance route:
- Operation key: `accept_final_mile_assignment`.
- Route: `POST /v1/deliveries/:id/accept-final-mile-assignment`.
- Actor role: `final_mile_courier`.
- Required status: `assigned_for_final_mile`.
- Scope: `assignedFinalMileCourierId === actor.actorId`.
- Required proof: `packageScanCode`.
- Success event: `final_mile_assignment_accepted`.
- Custody moves to courier.

Issue route:
- Operation key: `open_issue` or `create_issue` depending on client naming.
- Route: `POST /v1/issues`.
- Purpose: create an operational exception when a delivery cannot safely progress.
- This modal should pass assignment context into issue creation when host support tooling is available.

## Source References
External references used for this modal:
- [Bringg assignment rejection reasons](https://help.bringg.com/docs/understand-why-drivers-reject-order-assignments): supports structured driver rejection reasons, short mobile reason labels, lifecycle activity logging, dispatcher alerts, and reporting on repeated rejection causes.
- [Onfleet Mobile Task Overview](https://support.onfleet.com/hc/en-us/articles/27679317055508-Mobile-Task-Overview): supports showing task ID, order ID, task type, recipient/location, notes, and custom fields in the mobile task context.
- [Onfleet Task Assignment](https://support.onfleet.com/hc/en-us/articles/360023910111-Task-Assignment): supports dispatcher-side task assignment and route order visibility in the driver mobile app.
- [Onfleet Route Load Task](https://support.onfleet.com/hc/en-us/articles/47768817655956-Route-Load-Task): supports package verification before route start and alerting dispatch when a package is missing before leaving the hub.
- [Onfleet Custom Task Completion Reasons](https://support.onfleet.com/hc/en-us/articles/9382652814228-Custom-Task-Completion-Reasons): supports structured success/failure reasons, optional required notes, and internal analytics separation from recipient-facing text.
- [Onfleet Driver App Settings](https://support.onfleet.com/hc/en-us/articles/10228814951060-Driver-App-Settings): supports organization-controlled driver workflow rules, offline restrictions, and required completion evidence.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WCAG 2.2 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review and confirmation before important stored data changes.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible progress, issue-created, blocked, and error announcements.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/04-assigned-run-detail.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/05-driver-accept-run.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/04-courier-assignment-detail.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/01-confirm-destructive-action-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/06-accept-custody-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Design Brief
Audience:
- Assigned driver or final-mile courier who needs to report inability to take assigned work before custody transfer.

Context of use:
- Mobile, time-sensitive, often at or near a station, with staff waiting for a decision and weak network possible.

Entry points:
- `DriverAcceptRun` secondary action: `Cannot take this run`.
- `AssignedRunDetail` secondary action when status is `assigned_to_driver`.
- `CourierAssignmentDetail` secondary action when status is `assigned_for_final_mile`.
- `CourierAcceptAssignmentScan` recovery action before custody is accepted.
- `OpsActionRecovery` when a queued accept action fails due to scope, status, or package issue.
- Push notification recovery when user opens an assignment they cannot take.

Success state in v1:
- A delivery-scoped issue or support route is created/opened with structured assignment rejection context.
- User sees that station/support must reassign the job.
- Assignment and custody are unchanged until backend confirms otherwise.

Success state with future backend support:
- A backend `reject_*` route confirms assignment release and returns the delivery to the correct queue.
- Host refreshes delivery detail and routes user back to assignments.

Primary action in v1:
- `Report inability`

Primary action with future reject support:
- `Reject assignment`

Secondary actions:
- `Keep assignment`
- `Open support`
- `Open assignment`
- `Open custody chain`
- `Open offline outbox`

Navigation model:
- Blocking modal over assignment acceptance or detail screen.
- On compact mobile, use bottom sheet only when reason list and confirmation fit without hiding the primary action.
- Use centered modal on tablet/web admin shell.

Density:
- Medium. This is a short decision flow with operational evidence, not a full issue form.

Visual thesis:
- A controlled exception gate with a red-amber reason rail, a calm custody boundary panel, and one explicit report action.

Restraint rule:
- Do not show maps, route optimization, payout information, broad package history, receiver OTP, raw package scan code, or admin reassignment controls.

Product lens:
- Protect custody and speed up reassignment without inventing backend authority.

System stance:
- Modal owns reason capture and user confirmation.
- Host owns data hydration, issue creation, optional future reject mutation, queue invalidation, and navigation.

Interaction thesis:
- User should feel the system is listening to the reason, preserving accountability, and routing the package back to operations without letting a silent gap form.

Signature move:
- A `Still with current custodian` banner that stays visible until the user leaves, making it impossible to confuse rejection with custody transfer.

## Authority Boundary
This modal can:
- Display delivery and assignment context passed by the host.
- Validate reason and note input.
- Explain the current backend limitation.
- Request host issue creation.
- Request host support routing.
- Request host future reject mutation only when explicitly enabled.
- Announce status to assistive technologies.
- Emit analytics events without sensitive data.

This modal cannot:
- Mutate delivery state directly.
- Update assignment fields locally.
- Hide the job from the user's list before backend confirmation.
- Move custody.
- Mark the package missing.
- Assign the job to another person.
- Resolve an issue.
- Cancel the delivery.
- Send receiver notifications directly.
- Store receiver phone, address, scan code, or proof reference.

The host must provide:
- Current authenticated role.
- Delivery identity.
- Assignment type.
- Current status.
- Current custody summary.
- Assignment actor match result.
- Supported action mode.
- Issue creation capability status.
- Network and offline queue status.
- Safe display labels.
- Callback functions for submit, support, close, refresh, and custody chain.

## Assignment Types
Driver assignment:
- `assignmentType`: `driver_run`
- Parent status: `assigned_to_driver`
- Assigned actor field: `assignedDriverId`
- Acceptance action: `accept_run`
- Later custody action: `confirm_pickup`
- Default current custodian before pickup: origin station
- Modal title: `Cannot take this run?`
- Primary v1 action: `Report inability`
- Future action: `Reject run`

Courier assignment:
- `assignmentType`: `final_mile_assignment`
- Parent status: `assigned_for_final_mile`
- Assigned actor field: `assignedFinalMileCourierId`
- Acceptance action: `accept_final_mile_assignment`
- Later custody status after acceptance: final-mile courier
- Default current custodian before courier acceptance: destination station
- Modal title: `Cannot take this doorstep job?`
- Primary v1 action: `Report inability`
- Future action: `Reject assignment`

Shared rule:
- The modal may be opened only before confirmed custody transfer for this assignment type.
- If custody already moved to the actor, use failed attempt, return-to-station, support, or issue flow instead.

## Opening Preconditions
Allowed driver opening:
- `role === "driver"`
- `delivery.currentStatus === "assigned_to_driver"`
- `delivery.assignedDriverId === actor.actorId`
- `currentCustodyRole !== "driver"` for pickup-stage rejection
- Parent screen has fresh or safe cached delivery context.

Allowed courier opening:
- `role === "final_mile_courier"`
- `delivery.currentStatus === "assigned_for_final_mile"`
- `delivery.assignedFinalMileCourierId === actor.actorId`
- `currentCustodyRole !== "final_mile_courier"`
- Parent screen has fresh or safe cached delivery context.

Block opening when:
- Assignment does not belong to this actor.
- Role is not driver or final-mile courier.
- Delivery is already cancelled, delivered, closed, on hold, or issue locked.
- Driver already confirmed pickup.
- Courier already accepted final-mile custody.
- Delivery is out for delivery.
- Delivery is in a failed-attempt workflow.
- Payment is not confirmed for transport or final-mile stage.
- Host cannot determine assignment type safely.

## Close Behavior
User closes intentionally:
- Keep assignment unchanged.
- Return focus to the exact trigger element.
- Do not clear parent screen data.
- Emit `reject_assignment_modal_closed`.

User presses Escape:
- Close only when not submitting.
- Return focus to trigger.
- Announce `Assignment was kept.`

User taps outside:
- Disabled on mobile and desktop because this is a high-impact operational decision.

During submit:
- Disable close buttons unless request exceeds host timeout.
- If timeout occurs, show recovery actions instead of closing silently.

After success:
- Primary close label: `Back to assignments` or role-specific destination.
- Host may auto-route after user acknowledges the result only if the parent flow expects it.

## Information Architecture
Top to bottom:
1. Modal header with role-specific title.
2. Current backend mode badge.
3. Assignment identity card.
4. Custody boundary banner.
5. Deadline or urgency note.
6. Structured reason list.
7. Conditional note field.
8. Consequence review panel.
9. Primary and secondary actions.
10. Offline or error recovery panel.

The first viewport must show:
- Assignment title.
- Delivery reference.
- Custody boundary.
- At least first three reason options.
- Primary action disabled until a reason is selected.

## Visual Design
Tone:
- Serious, field-ready, concise.
- Avoid blame language.
- Avoid celebratory visuals.
- Avoid destructive red-only treatment unless action is using a future real reject route.

Modal container:
- Mobile: rounded top sheet with max height `88vh` and sticky action footer.
- Tablet: centered modal width `560` to `640`.
- Desktop shell: centered modal width `600` with dimmed inert background.
- Border radius: use design system large modal radius.
- Background: elevated neutral surface.
- Shadow: strong enough to separate from scanner/detail host.

Header:
- Icon: assignment exception glyph, not trash icon.
- Title:
  - Driver: `Cannot take this run?`
  - Courier: `Cannot take this doorstep job?`
- Subtitle:
  - `Tell operations why before custody moves.`
- Mode badge:
  - v1: `Issue route`
  - future supported: `Direct rejection`

Assignment card:
- Show tracking code or delivery display ID.
- Show route corridor or station pair.
- Show assignment type.
- Show safe package description when available.
- Show current status label.
- Do not show raw package scan code.
- Do not show full receiver address inside the modal unless courier parent screen already exposed it and user role still qualifies.

Custody boundary banner:
- Label: `Custody does not move`
- Body: `This only reports that you cannot take the assignment. The current confirmed custodian remains accountable until operations reassigns or confirms another handoff.`
- Visual: amber left rail, lock/chain glyph, station-to-staff mini line.

Reason list:
- Use large radio rows.
- One selected reason at a time.
- Each reason has label and short operational meaning.
- Use no icons unless they clarify field conditions.
- Keep labels under `56` characters where possible for mobile readability.

Note field:
- Multiline, `3` to `240` characters when required.
- `0` to `240` characters when optional.
- Character counter only after field has focus.
- Provide clear reason-specific prompt.
- Do not allow secrets, payment details, raw phone numbers, or scan codes.

Action footer:
- Primary button full width on mobile.
- Secondary text action below or left on desktop.
- Sticky while content scrolls.
- Disabled state must explain missing reason or note.

## Copy System
Primary title copy:
- Driver: `Cannot take this run?`
- Courier: `Cannot take this doorstep job?`

Shared subtitle:
- `Tell operations why before custody moves.`

V1 mode body:
- `Kra will create an operational issue for reassignment. This app does not remove the assignment until the backend confirms a reassignment or future reject action.`

Future mode body:
- `Kra will ask the backend to release this assignment and return the package to the right queue.`

Custody banner:
- Title: `Custody stays where it is`
- Body: `This action does not move the package to you and does not remove accountability from the current confirmed custodian.`

No backend reject available:
- Title: `Direct rejection is not available yet`
- Body: `Your reason will be sent to operations so the job can be reassigned without breaking the custody record.`

Reason missing:
- `Choose the reason you cannot take this assignment.`

Note missing:
- `Add a short note so operations can decide the next step.`

Scope block:
- Title: `This assignment is no longer yours`
- Body: `Refresh assignments before taking action.`

Status block:
- Title: `This job has already moved on`
- Body: `The delivery status changed. Review the current assignment before reporting inability.`

Custody already moved:
- Title: `Use a custody recovery flow`
- Body: `You already accepted custody for this package. Report a delivery issue, failed attempt, or return-to-station action instead.`

Issue success:
- Title: `Operations notified`
- Body: `Your reason was recorded. Keep the package with the current custodian until reassignment is confirmed.`

Future reject success:
- Title: `Assignment released`
- Body: `The assignment was released by the backend. The package must stay with the current custodian until another handoff is confirmed.`

Network error:
- Title: `Could not send this yet`
- Body: `Stay on this screen or save an issue draft if your device is allowed to queue support actions.`

Primary labels:
- V1 default: `Report inability`
- Future direct route: `Reject assignment`
- Submitting v1: `Reporting...`
- Submitting future route: `Rejecting...`
- Success acknowledgement: `Back to assignments`

Secondary labels:
- `Keep assignment`
- `Open support`
- `Open custody chain`
- `Refresh assignment`
- `Open offline outbox`

Avoid copy:
- `Cancel job`
- `Drop package`
- `Unassign me`
- `Delete assignment`
- `Mark failed`
- `Package rejected`
- `Done`
- `Success` without explaining next step.

## Reason Taxonomy
Reason values must be stable keys. Labels may be localized later.

Driver reasons:
- `vehicle_unavailable`: `Vehicle unavailable`
- `too_far_from_station`: `Too far from origin station`
- `capacity_full`: `Vehicle capacity is full`
- `schedule_conflict`: `Cannot meet pickup time`
- `unsafe_to_accept`: `Unsafe to take run`
- `package_not_ready`: `Package is not ready`
- `wrong_assignment`: `This is not my run`
- `app_or_network_issue`: `App or network issue`
- `other_operational_reason`: `Other operational reason`

Courier reasons:
- `too_far_from_station`: `Too far from destination station`
- `capacity_full`: `Carrying capacity is full`
- `cannot_meet_delivery_window`: `Cannot meet delivery window`
- `unsafe_to_accept`: `Unsafe to take job`
- `package_not_ready`: `Package is not ready`
- `address_or_instructions_problem`: `Address details need review`
- `wrong_assignment`: `This is not my job`
- `app_or_network_issue`: `App or network issue`
- `other_operational_reason`: `Other operational reason`

Shared reason behavior:
- `unsafe_to_accept` requires note.
- `package_not_ready` requires note.
- `wrong_assignment` requires note only if user says they know the correct owner.
- `address_or_instructions_problem` requires note.
- `other_operational_reason` requires note.
- `app_or_network_issue` requires note when offline issue draft is not available.

Reason display priority:
1. `wrong_assignment`
2. `package_not_ready`
3. `unsafe_to_accept`
4. `too_far_from_station`
5. role-specific time or capacity reason
6. `app_or_network_issue`
7. `other_operational_reason`

Reason severity:
- `unsafe_to_accept`: `p1_operational`
- `wrong_assignment`: `p1_operational`
- `package_not_ready`: `p2_station`
- `address_or_instructions_problem`: `p2_station`
- `vehicle_unavailable`: `p2_capacity`
- `capacity_full`: `p2_capacity`
- `too_far_from_station`: `p2_assignment`
- `schedule_conflict`: `p2_assignment`
- `cannot_meet_delivery_window`: `p2_assignment`
- `app_or_network_issue`: `p2_support`
- `other_operational_reason`: `p3_review`

## Reason-Specific Guidance
`vehicle_unavailable`:
- Driver only.
- Helper: `Use this if the assigned vehicle cannot safely move the package.`
- Note optional.
- Suggested support owner: station lead or dispatch.

`too_far_from_station`:
- Driver and courier.
- Helper: `Use this if you cannot reach the handoff point in time.`
- Note optional.
- If trusted assignment deadline is under `5 minutes`, show amber urgency.

`capacity_full`:
- Driver and courier.
- Helper: `Use this if accepting would overload the vehicle or bag.`
- Note optional unless package is fragile or large.

`schedule_conflict`:
- Driver only.
- Helper: `Use this if you cannot meet pickup or departure expectations.`
- Note optional.

`cannot_meet_delivery_window`:
- Courier only.
- Helper: `Use this if you cannot start doorstep work soon enough.`
- Note optional.

`unsafe_to_accept`:
- Driver and courier.
- Helper: `Use this for safety, road, vehicle, station, or public-order risk.`
- Note required.
- Do not ask for personal medical details.
- Route support action prominently after submit.

`package_not_ready`:
- Driver and courier.
- Helper: `Use this if the package is missing, damaged, not labelled, or not released by station staff.`
- Note required.
- Show `Open custody chain` action.

`address_or_instructions_problem`:
- Courier only.
- Helper: `Use this if receiver address or delivery instructions need operations review before pickup.`
- Note required.
- Do not reveal full receiver address in the modal.

`wrong_assignment`:
- Driver and courier.
- Helper: `Use this if the job appears assigned to the wrong person.`
- Note conditionally required.
- Show `Refresh assignment` action.

`app_or_network_issue`:
- Driver and courier.
- Helper: `Use this if the app or network prevents a safe acceptance action.`
- Note conditionally required.
- Show offline/outbox state if available.

`other_operational_reason`:
- Driver and courier.
- Helper: `Use this only when the listed reasons do not fit.`
- Note required.

## State Machine
`closed`:
- Modal is not mounted or is hidden.
- No internal form state is retained unless host explicitly keeps draft reason.

`opening`:
- Host passes assignment context.
- Validate role, assignment type, status, and custody boundary.
- If validation fails, route to a blocked state.

`reviewing_assignment`:
- Default active state.
- Reason list visible.
- Primary action disabled until reason is selected.

`driver_context`:
- Assignment type is `driver_run`.
- Driver reason set visible.
- Current status expected to be `assigned_to_driver`.

`courier_context`:
- Assignment type is `final_mile_assignment`.
- Courier reason set visible.
- Current status expected to be `assigned_for_final_mile`.

`reason_required`:
- User attempted submit without choosing a reason.
- First invalid reason group receives focus.

`reason_selected`:
- Reason chosen.
- Note field appears if required.
- Primary action enabled only when note rules pass.

`note_required`:
- Required note is empty or under minimum length.
- Announce validation message.

`note_invalid`:
- Note exceeds length, includes blocked sensitive pattern, or contains only whitespace.
- Keep focus in field.

`deadline_warning`:
- Trusted due time exists and is near or expired.
- Show urgency panel.
- If expired but backend may still allow issue creation, do not block reporting.

`custody_blocked`:
- Actor already has custody or delivery moved beyond the pre-custody stage.
- Show recovery route instead of reason form.

`already_accepted_blocked`:
- Driver acceptance event or courier acceptance event is already confirmed.
- Route to custody, failed attempt, return, or support flow.

`already_in_custody_blocked`:
- `currentCustodyActorId === actor.actorId`.
- Do not show reject controls.

`scope_blocked`:
- Assignment no longer belongs to actor.
- Clear local draft and route to refresh.

`status_blocked`:
- Current delivery status is not compatible with assignment rejection.
- Show current safe status label.

`payment_blocked`:
- Payment is not paid and backend would block transport or final-mile action.
- Reporting may still create an issue, but do not show assignment reject language.

`issue_lock_blocked`:
- Active issue lock prevents new issue creation.
- Route to existing issue if host provides it.

`offline_blocked`:
- No network and no allowed issue draft queue.
- User can keep assignment, call support if native dialer policy allows it, or retry.

`offline_issue_draft_available`:
- Host allows local support issue draft.
- Primary label changes to `Save issue draft`.
- Copy says reassignment is not active until sync.

`submitting_issue`:
- Host is creating issue/support record.
- Disable form and duplicate submit.
- Show progress status.

`issue_created`:
- Issue or support handoff succeeded.
- Show next-step panel.
- Host invalidates assignment and issue queries.

`support_route_ready`:
- Issue route is unavailable, but support screen can open with context.
- Primary action opens support prefilled with structured context.

`server_rejected`:
- Backend rejected issue creation or future reject attempt.
- Map safe error code.

`network_error`:
- Request failed without definitive server result.
- Offer retry or issue draft if allowed.

`future_reject_supported`:
- Host says direct reject endpoint is available.
- Modal still shows custody boundary and consequence review.

`submitting_future_reject`:
- Host calls direct reject endpoint.
- Disable close and duplicate submit.

`future_reject_confirmed`:
- Backend confirmed assignment release.
- Host refreshes assignment list and routes away after acknowledgement.

`closing`:
- Return focus to trigger.
- Reset transient validation.

## Data Contract
Component props:

```ts
type RejectAssignmentModalProps = {
  isOpen: boolean;
  assignment: RejectAssignmentContext;
  actor: RejectAssignmentActorContext;
  mode: RejectAssignmentMode;
  network: RejectAssignmentNetworkState;
  issuePolicy: RejectAssignmentIssuePolicy;
  onClose: () => void;
  onCreateIssue: (input: RejectAssignmentIssueInput) => Promise<RejectAssignmentIssueResult>;
  onRejectAssignment?: (input: RejectAssignmentFutureRejectInput) => Promise<RejectAssignmentFutureRejectResult>;
  onOpenSupport: (context: RejectAssignmentSupportContext) => void;
  onOpenCustodyChain: (deliveryId: string) => void;
  onOpenAssignment: (deliveryId: string) => void;
  onOpenOfflineOutbox: () => void;
  onRefreshAssignment: (deliveryId: string) => Promise<void>;
};
```

Assignment context:

```ts
type RejectAssignmentContext = {
  deliveryId: string;
  trackingCode: string;
  assignmentType: "driver_run" | "final_mile_assignment";
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  originStationLabel?: string;
  destinationStationLabel?: string;
  packageSummary?: {
    description?: string;
    sizeTier?: string;
    weightKg?: number;
    isFragile?: boolean;
  };
  assignedActorId: string;
  assignedActorLabel?: string;
  currentCustodyRole?: "origin_station" | "driver" | "destination_station" | "final_mile_courier" | "receiver" | "system";
  currentCustodyActorId?: string;
  currentCustodyLabel?: string;
  assignedAt?: string;
  responseDueAt?: string;
  latestEventType?: string;
  latestEventOccurredAt?: string;
  activeIssueId?: string;
  rejectionAlreadyReported?: boolean;
  privacyScope: "driver_safe" | "courier_safe";
};
```

Actor context:

```ts
type RejectAssignmentActorContext = {
  actorId: string;
  role: "driver" | "final_mile_courier";
  displayName?: string;
  stationScopeId?: string;
  canOpenIssue: boolean;
  canOpenSupport: boolean;
  canUseFutureReject: boolean;
};
```

Mode:

```ts
type RejectAssignmentMode =
  | "issue_only"
  | "support_only"
  | "future_reject_available"
  | "read_only_blocked";
```

Network state:

```ts
type RejectAssignmentNetworkState = {
  isOnline: boolean;
  canQueueIssueDraft: boolean;
  queueLabel?: string;
  lastSyncedAt?: string;
};
```

Issue policy:

```ts
type RejectAssignmentIssuePolicy = {
  issueType: "assignment_exception";
  defaultPriority: "p1" | "p2" | "p3";
  requireNoteForReasons: RejectAssignmentReasonCode[];
  existingIssueHandling: "route_existing" | "allow_new" | "block_new";
};
```

Reason code:

```ts
type RejectAssignmentReasonCode =
  | "vehicle_unavailable"
  | "too_far_from_station"
  | "capacity_full"
  | "schedule_conflict"
  | "cannot_meet_delivery_window"
  | "unsafe_to_accept"
  | "package_not_ready"
  | "address_or_instructions_problem"
  | "wrong_assignment"
  | "app_or_network_issue"
  | "other_operational_reason";
```

Issue input:

```ts
type RejectAssignmentIssueInput = {
  deliveryId: string;
  issueType: "assignment_exception";
  assignmentType: "driver_run" | "final_mile_assignment";
  reasonCode: RejectAssignmentReasonCode;
  reasonLabel: string;
  severity: "p1" | "p2" | "p3";
  note?: string;
  actorRole: "driver" | "final_mile_courier";
  currentStatus: DeliveryStatus;
  currentCustodyRole?: string;
  currentCustodyActorId?: string;
  assignmentActorId: string;
  clientRequestId: string;
};
```

Future reject input:

```ts
type RejectAssignmentFutureRejectInput = {
  deliveryId: string;
  assignmentType: "driver_run" | "final_mile_assignment";
  reasonCode: RejectAssignmentReasonCode;
  note?: string;
  clientRequestId: string;
};
```

Support context:

```ts
type RejectAssignmentSupportContext = {
  deliveryId: string;
  trackingCode: string;
  assignmentType: "driver_run" | "final_mile_assignment";
  reasonCode?: RejectAssignmentReasonCode;
  note?: string;
  currentStatus: DeliveryStatus;
  currentCustodyLabel?: string;
};
```

## Derived Field Rules
`assignmentBelongsToActor`:
- `assignment.assignedActorId === actor.actorId`

`isPreCustodyDriverRejectable`:
- `assignment.assignmentType === "driver_run"`
- `actor.role === "driver"`
- `assignment.currentStatus === "assigned_to_driver"`
- `assignment.currentCustodyActorId !== actor.actorId`

`isPreCustodyCourierRejectable`:
- `assignment.assignmentType === "final_mile_assignment"`
- `actor.role === "final_mile_courier"`
- `assignment.currentStatus === "assigned_for_final_mile"`
- `assignment.currentCustodyActorId !== actor.actorId`

`canShowReasonForm`:
- Assignment belongs to actor.
- Role matches assignment type.
- Status matches pre-custody assignment stage.
- No issue lock blocks reporting.
- Mode is not `read_only_blocked`.

`requiresNote`:
- Reason is in issue policy list.
- Reason is `unsafe_to_accept`.
- Reason is `package_not_ready`.
- Reason is `address_or_instructions_problem`.
- Reason is `other_operational_reason`.

`primaryActionLabel`:
- `future_reject_available`: `Reject assignment`
- `issue_only`: `Report inability`
- `support_only`: `Open support`
- `offline_issue_draft_available`: `Save issue draft`

`submittingLabel`:
- Future reject route: `Rejecting...`
- Issue route: `Reporting...`
- Support route: `Opening support...`
- Offline draft: `Saving draft...`

## Validation Rules
Reason:
- Required.
- Must belong to the reason set for the assignment type.
- Must be one of the stable reason codes.
- Cannot be changed while submit is in progress.

Note:
- Trim before validation.
- Required notes must be at least `3` characters.
- Maximum length `240`.
- Do not accept only punctuation.
- Do not accept raw package scan codes when pattern detection is confident.
- Do not accept full phone numbers.
- Do not accept payment provider references.
- Do not accept secrets or credentials.
- Do not require the user to enter personal medical or security-sensitive details.

Assignment:
- Delivery ID required.
- Tracking code required for display.
- Assignment type required.
- Current status required.
- Assigned actor ID required.

Mode:
- `future_reject_available` requires `onRejectAssignment`.
- `issue_only` requires `onCreateIssue`.
- `support_only` requires `onOpenSupport`.
- `read_only_blocked` disables submit.

Network:
- If offline and `canQueueIssueDraft=false`, do not enable submit.
- If offline and future reject is available, do not queue direct reject unless backend and host explicitly mark it safe. Default is blocked.

## Submit Behavior
V1 issue route:
1. User selects reason.
2. User enters note if required.
3. User taps `Report inability`.
4. Modal builds `RejectAssignmentIssueInput`.
5. Host calls issue creation or issue route handoff.
6. Host invalidates issue list, assignment detail, and role queue reads.
7. Modal shows `Operations notified`.
8. User returns to assignments or opens support.

Support-only route:
1. User selects reason if available.
2. User taps `Open support`.
3. Host routes to support with structured context.
4. Modal closes after navigation starts.
5. Assignment remains unchanged.

Offline issue draft:
1. User selects reason.
2. User enters required note.
3. User taps `Save issue draft`.
4. Host writes encrypted local action with issue context.
5. Modal shows pending-sync copy.
6. User opens offline outbox or returns to assignment.
7. Assignment remains unchanged until sync succeeds and operations acts.

Future direct reject:
1. Host passes `mode="future_reject_available"`.
2. User selects reason and confirms consequence review.
3. User taps `Reject assignment`.
4. Host calls direct reject endpoint.
5. On success, host refreshes delivery and role queue.
6. Modal shows assignment released.
7. Host routes away from the old assignment.

All submit paths:
- Generate a unique `clientRequestId`.
- Block duplicate taps.
- Preserve reason and note on retry.
- Do not emit sensitive fields to analytics.
- Do not close on uncertain network failure.

## Future Backend Contract
This section is not implemented today. It exists to prevent future UI drift.

Potential driver endpoint:

```http
POST /v1/deliveries/:id/reject-run
```

Potential courier endpoint:

```http
POST /v1/deliveries/:id/reject-final-mile-assignment
```

Potential request:

```json
{
  "reasonCode": "capacity_full",
  "note": "Cannot safely carry this package with current load.",
  "clientRequestId": "cra_01HXYZ"
}
```

Required backend rules:
- Actor must be assigned to the delivery.
- Actor role must match assignment type.
- Status must be pre-custody assignment state.
- Custody must not already belong to actor.
- Rejection must emit audit and timeline event.
- Driver rejection should return delivery to `awaiting_driver_assignment` or an issue state based on reason.
- Courier rejection should return delivery to `awaiting_final_mile_assignment` or an issue state based on reason.
- `unsafe_to_accept`, `wrong_assignment`, and `package_not_ready` should create or link an issue.
- Response must include lifecycle response and new assignment state.
- Endpoint must be idempotent by `clientRequestId`.

Until those endpoints exist:
- Claude Code must not wire direct reject calls.
- Product copy must use issue/support wording.
- Tests must assert that no unsupported reject endpoint is called in default v1 mode.

## Error Mapping
`AUTH_REQUIRED`:
- Message: `Sign in again to report this assignment.`
- Action: `Sign in`
- Modal state: `server_rejected`

`FORBIDDEN_ROLE`:
- Message: `This account cannot report this assignment.`
- Action: `Back to assignments`
- Modal state: `scope_blocked`

`ASSIGNMENT_SCOPE_VIOLATION`:
- Message: `This job is no longer assigned to you.`
- Action: `Refresh assignments`
- Modal state: `scope_blocked`

`DELIVERY_NOT_FOUND`:
- Message: `Delivery record was not found.`
- Action: `Back to assignments`
- Modal state: `server_rejected`

`INVALID_STATUS_TRANSITION`:
- Message: `This delivery has already moved to another step.`
- Action: `Open assignment`
- Modal state: `status_blocked`

`DELIVERY_NOT_PAID`:
- Message: `Payment must be confirmed before this work can move forward.`
- Action: `Open assignment`
- Modal state: `payment_blocked`

`ISSUE_LOCK_ACTIVE`:
- Message: `This delivery is locked while an issue is being reviewed.`
- Action: `Open issue`
- Modal state: `issue_lock_blocked`

`CONFLICTING_HANDOFF_STATE`:
- Message: `The custody record changed. Review the latest handoff before acting.`
- Action: `Open custody chain`
- Modal state: `custody_blocked`

`VALIDATION_ERROR`:
- Message: `Check the reason and note, then try again.`
- Action: `Review form`
- Modal state: `note_invalid`

`UNKNOWN_INTERNAL_ERROR`:
- Message: `Kra could not report this right now. Try again or contact support.`
- Action: `Retry`
- Modal state: `server_rejected`

Network timeout:
- Message: `Connection timed out before Kra confirmed the report.`
- Action: `Retry`
- Modal state: `network_error`

## Offline Behavior
Offline default:
- Direct rejection is blocked.
- Issue creation is blocked unless host explicitly supports issue draft queue.
- Assignment state remains visible but marked as saved data.
- User can keep assignment or open offline outbox.

Offline issue draft allowed:
- Store only safe context:
  - delivery ID
  - tracking code
  - assignment type
  - reason code
  - note
  - current status
  - current custody role
  - actor role
  - created at
  - client request ID
- Do not store raw receiver phone.
- Do not store receiver full address.
- Do not store package scan code.
- Do not store proof references.
- Do not mark reassignment pending in the UI.
- Outbox row label: `Assignment exception report`
- Outbox warning: `Reassignment has not started until this syncs.`

Offline conflict on sync:
- If assignment already accepted by actor, show custody recovery.
- If assignment reassigned to another actor, mark draft superseded.
- If delivery moved to issue state, link existing issue when backend returns one.
- If delivery closed, discard draft with audit-safe local record.

## Privacy And Security
Allowed in modal:
- Delivery display ID.
- Tracking code.
- Station pair.
- Role-safe package summary.
- Current safe status label.
- Current custody role label.
- Assigned actor display label when it is the logged-in user.

Never show:
- Raw package scan code.
- Receiver OTP.
- Receiver verification token.
- Proof asset references.
- Full receiver phone.
- Payment provider references.
- Internal security detail.
- Other drivers or couriers as reassignment choices.
- Admin-only notes.

Never store locally:
- Scan code.
- OTP.
- Receiver phone.
- Receiver full address.
- Proof files.
- Admin notes.
- Provider payloads.

Telemetry must redact:
- `note`
- package description
- station free-text labels if they could identify private facilities
- all receiver fields
- all scan/proof values

## Accessibility Requirements
Dialog semantics:
- Use `role="dialog"` for normal reason capture.
- Use `role="alertdialog"` only for future direct rejection consequence confirmation or severe blocked state.
- `aria-modal="true"`.
- Header is modal label.
- Description points to custody boundary and consequence copy.
- Background content inert.

Focus:
- Initial focus goes to modal title on first open if content is long.
- If validation fails, focus goes to first invalid control.
- On close, focus returns to triggering button.
- During submit, focus stays in modal and progress is announced.
- On success, focus moves to success title.

Keyboard:
- Tab and Shift+Tab loop inside modal.
- Escape closes only when not submitting.
- Enter on primary button submits only when enabled.
- Arrow keys may move through radio options if implemented as a radio group.

Screen reader:
- Announce current assignment type.
- Announce selected reason.
- Announce whether note is required.
- Announce submit state.
- Announce issue-created or blocked state with `aria-live="polite"` or `assertive` only for severe blocking errors.

Target size:
- Reason rows at least `44px` high.
- Primary and secondary actions meet design system touch targets.
- Close control is not the only way to exit.

Motion:
- Modal enters with short opacity and translate motion.
- Reason panel changes use subtle height or opacity transition.
- Support `prefers-reduced-motion`.
- No shaking validation animation.

Contrast:
- Custody warning, error, and selected states meet WCAG contrast.
- Do not rely on color alone for severity.

## Responsive Behavior
Compact phones:
- Use bottom sheet with sticky footer.
- Show title, custody banner, and first reasons before scroll.
- Keep primary action thumb-reachable.
- Collapse assignment details behind `View details` if vertical space is low.

Large phones:
- Bottom sheet may show full assignment card and all common reasons.
- Footer remains sticky.

Tablets:
- Centered modal.
- Two-column layout allowed for assignment card and reason list.
- Keep consequence review full width.

Desktop/web shell:
- Centered modal.
- Reason list max width `520`.
- Actions align right except mobile-style shell.

Orientation changes:
- Preserve reason and note.
- Recalculate scroll to keep selected reason and primary action reachable.

Large text:
- Allow modal to scroll.
- Do not truncate reason labels.
- Keep note field usable.

## Component Anatomy
Required components:
- `ModalRoot`
- `ModalHeader`
- `ModeBadge`
- `AssignmentIdentityCard`
- `CustodyBoundaryBanner`
- `DeadlineWarning`
- `ReasonRadioGroup`
- `ReasonOption`
- `ReasonNoteField`
- `ConsequenceReviewPanel`
- `BlockedStatePanel`
- `OfflineStatePanel`
- `SubmitErrorPanel`
- `ModalActionFooter`
- `SuccessPanel`

Optional components:
- `AssignmentDetailDisclosure`
- `ExistingIssueLink`
- `FutureRejectConfirmation`
- `SupportRouteButton`
- `OfflineDraftReceipt`

Component responsibilities:
- `ModalRoot`: focus trap, scroll lock, inert background, Escape rules.
- `ModalHeader`: title, subtitle, close control.
- `ModeBadge`: explains issue route or future direct rejection.
- `AssignmentIdentityCard`: role-safe delivery and assignment context.
- `CustodyBoundaryBanner`: persistent accountability copy.
- `DeadlineWarning`: trusted assignment response time if available.
- `ReasonRadioGroup`: reason selection and validation.
- `ReasonNoteField`: reason-specific note capture.
- `ConsequenceReviewPanel`: explains what will and will not happen.
- `BlockedStatePanel`: status/scope/custody blockers.
- `OfflineStatePanel`: offline submit rules.
- `SubmitErrorPanel`: safe retry and route options.
- `ModalActionFooter`: primary and secondary actions.
- `SuccessPanel`: issue created or future rejection confirmed.

## Host Integration
Driver host:
- Trigger from `DriverAcceptRun` and `AssignedRunDetail`.
- Parent label: `Cannot take this run`.
- Host mode in v1: `issue_only` if issue route available, otherwise `support_only`.
- On v1 issue success, keep driver assignment visible until refresh shows backend change.
- Do not navigate to manifest or pickup scan after issue success.

Courier host:
- Trigger from `CourierAssignmentDetail` and `CourierAcceptAssignmentScan`.
- Parent label: `Cannot take this job`.
- Host mode in v1: `issue_only` if issue route available, otherwise `support_only`.
- On issue success, return to courier assignments with a notice.
- Do not navigate to route, out-for-delivery, or proof after issue success.

Action recovery host:
- Trigger when queued accept fails because of scope/status/custody conflict.
- Reason may default to `app_or_network_issue` or `wrong_assignment` if host can justify it.
- User must still confirm before issue creation.

Push notification host:
- If user opens an assignment notification and chooses inability, hydrate delivery before opening modal.
- If hydration fails, route to support screen rather than opening incomplete modal.

## Query And Cache Invalidation
After v1 issue success:
- Invalidate delivery detail.
- Invalidate role queue:
  - `DriverQueue` for driver.
  - `CourierQueue` for courier.
- Invalidate issue list.
- Invalidate assignment detail if present.
- Do not optimistically remove assignment from list.

After future reject success:
- Invalidate delivery detail.
- Invalidate delivery timeline.
- Invalidate driver/courier queue.
- Invalidate station queue if available.
- Remove assignment from current user's active list only after refreshed data confirms release.

After support route only:
- Keep current query data.
- Preserve selected reason in support route state.

After offline draft:
- Add outbox row.
- Do not invalidate server data until sync succeeds.

## Analytics
Events:
- `reject_assignment_modal_opened`
- `reject_assignment_reason_selected`
- `reject_assignment_note_required`
- `reject_assignment_issue_submit_started`
- `reject_assignment_issue_created`
- `reject_assignment_support_opened`
- `reject_assignment_future_reject_started`
- `reject_assignment_future_reject_confirmed`
- `reject_assignment_blocked`
- `reject_assignment_offline_draft_saved`
- `reject_assignment_retry_tapped`
- `reject_assignment_modal_closed`

Required properties:
- `deliveryId`
- `assignmentType`
- `actorRole`
- `currentStatus`
- `reasonCode`
- `mode`
- `isOnline`
- `blockReason`
- `clientRequestId`

Forbidden properties:
- `note`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `packageScanCode`
- `proofReference`
- `paymentProviderReference`
- `packageDescription`

Metric goals:
- Time from modal open to submit.
- Reason distribution by role.
- Assignment exception reports by station.
- Offline draft sync success rate.
- Unsupported direct rejection attempt count.
- Repeated rejection by actor and reason.

Alert candidates:
- `unsafe_to_accept` repeated for one station.
- `package_not_ready` repeated for one station.
- `wrong_assignment` repeated for one actor or station.
- High issue creation failure rate.
- High offline draft conflict rate.

## Testing Requirements
Unit tests:
- Renders driver title and reason set.
- Renders courier title and reason set.
- Primary action disabled before reason.
- Required note validation works.
- Optional note trims safely.
- Forbidden sensitive values are blocked from note when detection is confident.
- Scope blocked state renders for assignment mismatch.
- Status blocked state renders for incompatible status.
- Custody blocked state renders after actor has custody.
- Offline blocked state prevents submit when queue unavailable.
- Offline draft state uses `Save issue draft`.
- Issue-only mode calls `onCreateIssue`.
- Support-only mode calls `onOpenSupport`.
- Future mode calls `onRejectAssignment` only when available.
- Close returns focus to trigger.

Integration tests:
- Driver from `DriverAcceptRun` opens modal and reports inability.
- Driver issue success does not navigate to pickup scan.
- Courier from `CourierAssignmentDetail` opens modal and reports inability.
- Courier issue success does not navigate to out-for-delivery.
- Assignment changed during submit maps to scope blocked.
- Delivery status changed during submit maps to status blocked.
- Active issue lock routes to existing issue when provided.
- Network timeout preserves reason and note for retry.
- Offline draft appears in offline outbox.

Accessibility tests:
- Dialog has accessible name and description.
- Focus is trapped.
- Escape behavior is disabled while submitting.
- Radio group announces selected reason.
- Validation messages are associated with controls.
- Success and error messages are announced.
- Large text keeps primary action reachable.

Visual regression tests:
- Compact phone default.
- Compact phone with keyboard open.
- Long reason labels.
- Note required error.
- Offline blocked.
- Issue success.
- Future direct rejection consequence review.
- Dark station environment theme if product supports it.

End-to-end tests:
- `e2e-driver-reports-run-inability-no-custody-change`
- `e2e-courier-reports-assignment-inability-no-custody-change`
- `e2e-reject-assignment-scope-change-blocks-submit`
- `e2e-reject-assignment-offline-draft-syncs-to-issue`
- `e2e-reject-assignment-does-not-call-unsupported-endpoint`

Contract tests:
- V1 mode never calls `/reject-run`.
- V1 mode never calls `/reject-final-mile-assignment`.
- Issue input uses approved reason code.
- Note length and redaction rules apply before submit.
- Future endpoint is callable only when host explicitly sets mode and callback.

## Acceptance Criteria
Functional:
- Modal opens from driver and courier assignment contexts.
- Modal blocks non-assigned actor.
- Modal blocks post-custody state.
- Modal blocks incompatible status.
- Modal requires a reason.
- Modal requires note for high-impact reasons.
- V1 mode creates or routes to issue/support.
- V1 mode does not claim assignment was released.
- Future mode uses direct reject callback only when provided.
- Assignment and custody remain unchanged after v1 issue success.

UX:
- User understands why direct rejection is not available in v1.
- User understands who keeps custody.
- User has one primary action.
- Reason list is readable under field conditions.
- Error and success states explain next action.
- Modal is usable offline with clear limits.

Security:
- No receiver-sensitive details leak.
- No scan/proof values are shown or stored.
- Analytics redact note and private fields.
- Unsupported mutations are not called.
- Duplicate submits are blocked.

Accessibility:
- Modal pattern is correct.
- Focus is managed.
- Status messages are announced.
- Touch targets are large enough.
- Motion can be reduced.

## Implementation Notes For Claude Code
Build this as a shared modal component under the operational mobile shared UI layer, not inside only one role screen.

Recommended file ownership:
- `apps/mobile/src/features/ops/components/RejectAssignmentModal.tsx`
- `apps/mobile/src/features/ops/components/rejectAssignmentReasons.ts`
- `apps/mobile/src/features/ops/components/__tests__/RejectAssignmentModal.test.tsx`
- Host integration in driver accept/detail screens.
- Host integration in courier detail/accept-scan screens.

Default v1 wiring:
- Use `mode="issue_only"` where issue creation is implemented.
- Use `mode="support_only"` where issue creation is not available from that screen.
- Do not add direct reject API client functions until backend contract exists.
- Do not optimistically remove assignments from list.
- Do not update delivery status locally.

Implementation sequence:
1. Create reason taxonomy and helper functions.
2. Build pure modal component with state machine.
3. Add v1 issue/support submit path.
4. Add host adapters for driver and courier screens.
5. Add blocked states from current delivery context.
6. Add offline issue draft path only if outbox supports this action type.
7. Add unit and integration tests.
8. Add E2E assertion that no unsupported reject endpoint is called.

Do not implement:
- Route optimization.
- Driver availability editing.
- Courier capacity editing.
- Station reassignment UI.
- Receiver communication.
- Payment or payout logic.
- Scan workflow.
- Failed delivery attempt workflow.
- Admin override.

## Open Backend Gaps
Gap: no direct driver reject mutation.
- Product impact: driver inability is issue/support only.
- UI decision: label action `Report inability`.
- Future owner: backend handoff lifecycle.

Gap: no direct courier reject mutation.
- Product impact: courier inability is issue/support only.
- UI decision: label action `Report inability`.
- Future owner: backend final-mile lifecycle.

Gap: no assignment response deadline fields.
- Product impact: modal cannot always show countdown.
- UI decision: show deadline only when trusted host context exists.
- Future owner: delivery detail and assignment event projection.

Gap: no automatic reassignment workflow from issue.
- Product impact: issue creation does not release assignment.
- UI decision: success copy says operations notified, not assignment released.
- Future owner: station/admin assignment operations.

Gap: no issue assignment owner field in current issue contract.
- Product impact: support ownership is guidance only.
- UI decision: pass role and reason context, do not promise owner routing.
- Future owner: issue management contract.

## Quality Bar
This modal is complete when:
- It prevents unsupported reject claims.
- It protects custody accountability.
- It captures structured reasons.
- It makes issue/support routing fast.
- It handles offline truthfully.
- It is accessible.
- It avoids sensitive data leakage.
- It is reusable by driver and courier flows.
- It leaves a clean path for future backend reject endpoints without UI rewrite.

## Final Handoff Summary
Build `RejectAssignmentModal` as a shared operational modal for drivers and final-mile couriers who cannot take a pre-custody assignment. In v1, submit creates or routes to an assignment exception issue/support flow and must not release assignment, move custody, or call unsupported reject endpoints. Show role-specific reason lists, require notes for high-risk reasons, keep the custody boundary visible, block post-custody or scope-mismatched states, redact sensitive data, and preserve a future direct-reject path behind an explicit host mode only.

# Failed Delivery Reason Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `FailedDeliveryReasonModal` |
| Component target | shared final-mile failed-attempt reason and consequence modal |
| Primary test ID | `modal-failed-delivery-reason` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 final-mile exception control |
| Used by | `CourierFailedAttempt`, `CourierRoute`, `CourierProofCapture`, `CourierOtpCompletion`, `CourierSignatureProof`, `CourierPhotoProof`, `OpsActionRecovery`, `OpsOfflineOutbox` |
| Backend coverage | `record_failed_attempt` |
| Trigger source | failed-attempt child screen, proof child recovery, route exception action, offline action replay |
| Required states | `closed`, `opening`, `reviewing_reason`, `reason_required`, `reason_selected`, `checks_required`, `note_required`, `note_invalid`, `consequence_review`, `first_attempt_context`, `second_attempt_context`, `issue_route_context`, `pickup_route_context`, `reattempt_route_context`, `custody_required_blocked`, `scope_blocked`, `status_blocked`, `proof_still_available`, `offline_blocked`, `offline_queue_available`, `duplicate_risk_blocked`, `submitting`, `server_confirmed`, `queued_pending_sync`, `server_rejected`, `network_error`, `closing` |

## Product Job
`FailedDeliveryReasonModal` asks the assigned final-mile courier to choose the exact reason a doorstep handoff could not complete, review the operational consequence, and confirm submission to `record_failed_attempt`.

The modal answers:
- `Why can this delivery not be completed now?`
- `Is this a normal missed attempt, issue-review case, or pickup-flow return?`
- `What checks should the courier complete before submitting?`
- `What happens to custody after submission?`
- `Will the receiver be notified?`
- `Can this be queued safely?`
- `How does the UI avoid duplicate failed-attempt records?`

The user should be able to:
- Select one backend-supported reason code.
- See reason-specific checks.
- Add a concise note when required or useful.
- Review the next lifecycle path before submit.
- Submit only when the assignment and custody context are valid.
- Recover from network failure without double-counting.
- Understand whether the package should be prepared for reattempt, pickup, issue review, support, or station return.

This modal is not:
- A full failed-attempt page.
- A proof capture flow.
- A receiver OTP flow.
- A signature flow.
- A photo upload flow.
- A support chat.
- An admin dispute decision.
- A station return scan.
- A reassignment decision screen.
- A delivery completion screen.

## Strategic Role
Failed delivery attempts are high-risk because they can affect receiver trust, courier accountability, refund decisions, and package custody. This modal is the final confirmation layer before a courier writes a failed attempt to the backend.

Core principle:
- Complete delivery when valid proof is available.
- Record failed attempt when the receiver, address, safety, proof, or package condition blocks handoff.
- Route severe refusal or package condition issues into issue review.
- Keep ordinary missed attempts out of terminal `delivery_failed`.
- Avoid duplicate attempt count.
- Do not claim destination station receipt unless a real station return flow confirms it.

## Audience
Primary user:
- Assigned final-mile courier who currently has custody and cannot complete receiver handoff.

Secondary users:
- Destination station operator who may receive the package back.
- Support staff reviewing a refusal, unsafe location, proof failure, or package issue.
- Receiver who will receive failed-attempt communication.
- Sender checking tracking.
- Finance/dispute reviewers deciding surcharge and liability outcomes.
- QA validating mutation rules.
- Security reviewers validating proof and receiver data protection.
- Claude Code implementing the modal later.

Non-users:
- Sender-facing booking UI.
- Receiver tracking visitors.
- Drivers.
- Station operators recording intake or receipt.
- Finance admins making refund decisions.
- Webhook processors.

## Current Backend Reality
Mutation:
- Operation key: `record_failed_attempt`.
- Route: `POST /v1/deliveries/:id/final-mile-failed-attempt`.
- Required actor role: `final_mile_courier`.
- Required capability: `record_failed_attempt`.
- Request schema: `recordFailedAttemptRequestSchema`.
- Response schema: `deliveryLifecycleResponseSchema`.
- Route is not idempotent.

Request body:

```json
{
  "reasonCode": "receiver_unavailable",
  "note": "Called receiver twice and waited at the main gate."
}
```

Allowed reason codes:
- `receiver_unreachable`
- `receiver_unavailable`
- `address_not_found`
- `unsafe_to_complete`
- `receiver_refused`
- `proof_failed`
- `package_issue_detected`

Request constraints:
- `reasonCode` is required.
- `note` is optional by backend contract.
- `note` trims whitespace.
- `note` minimum length is `5` when present.
- `note` maximum length is `400`.

Backend behavior:
- Validates `record_failed_attempt`.
- Validates assigned final-mile courier scope when assignment exists.
- Validates final-mile custody.
- If current status is `assigned_for_final_mile`, backend first transitions to `out_for_delivery`.
- Increments `finalMileAttemptCount`.
- Stores failed-attempt reason and count in lifecycle metadata.
- Clears assigned final-mile courier.
- Sends receiver failed-attempt SMS from API route integration.
- Emits delivery status notification.
- Creates a final-mile-courier-to-destination-station handoff event.

Backend routing:
- `receiver_refused` routes to `issue_reported`.
- `package_issue_detected` routes to `issue_reported`.
- First ordinary failed attempt routes to `awaiting_final_mile_assignment`.
- Second or later ordinary failed attempt routes to `awaiting_receiver_pickup`.

Current backend gaps:
- Route is not idempotent, so offline replay must be conservative.
- API accepts only reason and optional note.
- Contact attempts, wait duration, location confidence, safety details, proof failure type, and package condition category are not structured fields yet.
- The backend-created station handoff event is not the same as a physical return scan.
- The mutation does not return receiver notification delivery status.

Frontend implication:
- The modal must prevent duplicate taps.
- The modal must avoid automatic replay unless host can guarantee exactly-once behavior.
- The modal must compress important evidence into note until structured fields exist.
- The modal must say `return or reassignment instructions` rather than `station received package`.
- The modal must distinguish issue routing from ordinary reattempt routing before submit.

## Source References
External references used for this modal:
- [DoorDash customer unavailable guidance](https://help.doordash.com/en-au/dashers/article/how-to-complete-a-delivery-when-the-customer-is-unavailable): supports explicit arrival, call/text attempts, unavailable-customer action, timer, safe location instructions, and evidence before incomplete handoff.
- [Uber delivery basics](https://www.uber.com/us/en/deliver/basics/making-deliveries/how-to-deliver/): supports reviewing delivery details, contacting the customer, following delivery notes, and completing only after the final handoff step.
- [Uber Direct delivery status webhook](https://developer.uber.com/docs/deliveries/daas/references/api/webhooks/delivery-status-webhook): supports explicit returned/undeliverable states, reason/action fields, and return job linkage for operational systems.
- [Onfleet Custom Task Completion Reasons](https://support.onfleet.com/hc/en-us/articles/9382652814228-Custom-Task-Completion-Reasons): supports structured success/failure reason choices, optional required notes, and reason analytics separate from recipient-facing text.
- [Onfleet Driver App Settings](https://support.onfleet.com/hc/en-us/articles/10228814951060-Driver-App-Settings): supports workflow controls that require evidence, completion restrictions, and offline behavior settings.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports high-impact confirmation where the user must explicitly acknowledge consequence.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors for missing reason, checks, or note.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit, queued, confirmed, and rejected announcements.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets in field conditions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/07-courier-out-for-delivery.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/08-courier-route.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/14-courier-return-to-station.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/08-ops-support.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/package-statuses.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Design Brief
Audience:
- Final-mile courier in the receiver leg, carrying the package, unable to complete proof-backed delivery.

Context of use:
- Mobile, outdoor or doorway environment, high pressure, possible safety concern, receiver nearby or absent, unstable network.

Entry point:
- A failed-attempt screen or proof child flow has determined the courier needs to record inability to complete.

Success state:
- Backend records `record_failed_attempt`, updates lifecycle, triggers receiver notification, clears courier assignment, and returns a lifecycle response.

Primary action:
- `Record failed attempt`

Secondary actions:
- `Keep trying delivery`
- `Open support`
- `Open proof options`
- `Open return instructions`
- `Open offline outbox`

Navigation model:
- High-impact modal over `CourierFailedAttempt` or proof child screen.
- Bottom sheet on compact mobile with sticky footer.
- Centered alert dialog for final consequence confirmation on tablet/web shell.

Density:
- Medium. Reason choice must be fast, but consequence must be impossible to miss.

Visual thesis:
- A field-grade incident confirmation: strong reason cards, consequence preview, custody warning, and one accountable submit action.

Restraint rule:
- Do not show maps, route path, payment, earnings, full receiver phone, OTP token, proof asset references, or station reassignment controls.

Product lens:
- Truthful exception capture, not a shortcut around proof.

System stance:
- Host owns delivery data and mutation.
- Modal owns reason selection, validation, consequence review, and safe submit request.

Interaction thesis:
- The courier chooses why delivery cannot complete, confirms what Kra will do next, and receives clear instructions for package custody.

Signature move:
- A consequence card that changes immediately when reason and attempt count change: `Reattempt`, `Receiver pickup`, or `Issue review`.

## Authority Boundary
This modal can:
- Render role-safe delivery context.
- Render failed-attempt reasons.
- Validate reason, checks, and note.
- Explain consequence before submission.
- Call host `onRecordFailedAttempt`.
- Show server-confirmed or queued-pending states.
- Route to support, proof, return, outbox, or assignment detail through host callbacks.
- Emit safe analytics.

This modal cannot:
- Mark delivery complete.
- Capture OTP, signature, or photo proof.
- Upload proof assets.
- Create refund decisions.
- Reassign courier.
- Confirm physical station return.
- Override issue routing.
- Retry automatically without host policy.
- Store receiver phone, address, OTP, proof references, or raw location traces.

Host must provide:
- Delivery ID.
- Tracking code.
- Current status.
- Attempt count.
- Current custody summary.
- Assigned courier match result.
- Receiver contact checks from parent flow if available.
- Proof availability state.
- Network and queue policy.
- Callback for mutation and recovery routes.

## Opening Preconditions
Normal form may open when:
- User is authenticated.
- Actor role is `final_mile_courier`.
- Actor has `record_failed_attempt`.
- Delivery is assigned to this courier or custody still belongs to this courier.
- `currentCustodyRole === "final_mile_courier"`.
- Current status is `assigned_for_final_mile` or `out_for_delivery`.
- Delivery is not delivered, closed, cancelled, or terminal failed.
- No active issue lock blocks this mutation.

Open in blocked mode when:
- Actor no longer has assignment scope.
- Actor no longer has custody.
- Delivery already returned to queue.
- Delivery already has issue route from a previous failed attempt.
- The parent proof flow still has valid completion proof ready and user has not confirmed inability.
- Network is offline and queue policy blocks non-idempotent failed-attempt replay.

Do not open when:
- Delivery ID is missing.
- Assignment type is not final-mile.
- User is not final-mile courier.
- Host cannot determine current status or custody.
- Delivery is already delivered.

## Reason Taxonomy
Reason codes must match backend enum exactly.

`receiver_unreachable`:
- Label: `Receiver unreachable`
- Meaning: courier could not reach the receiver by approved contact method.
- Typical checks: contact attempted, waited where safe, receiver instructions reviewed.
- Normal next path: reattempt queue on first attempt.

`receiver_unavailable`:
- Label: `Receiver unavailable`
- Meaning: receiver was contacted or location reached but cannot receive now.
- Typical checks: receiver contact attempted or receiver stated unavailable.
- Normal next path: reattempt queue on first attempt.

`address_not_found`:
- Label: `Address not found`
- Meaning: courier cannot confidently locate receiver address or landmark.
- Typical checks: route reviewed, instructions checked, support or receiver contact attempted where safe.
- Normal next path: reattempt queue on first attempt.

`unsafe_to_complete`:
- Label: `Unsafe to complete`
- Meaning: location, route, crowd, weather, animal, road, or personal safety risk prevents handoff.
- Typical checks: stop delivery action, move to safe location, contact support when needed.
- Normal next path: reattempt queue unless support escalates.

`receiver_refused`:
- Label: `Receiver refused package`
- Meaning: receiver declined the package or refused required proof.
- Typical checks: refusal confirmed, note required, support route visible.
- Backend next path: issue review.

`proof_failed`:
- Label: `Proof could not be completed`
- Meaning: OTP, signature, or photo proof cannot be validly completed.
- Typical checks: proof options attempted, fallback not valid, receiver context recorded.
- Normal next path: reattempt queue on first attempt.

`package_issue_detected`:
- Label: `Package issue detected`
- Meaning: package damage, mismatch, missing label, tamper concern, or condition issue blocks handoff.
- Typical checks: stop completion, preserve package, route support.
- Backend next path: issue review.

Reason display priority:
1. `receiver_unavailable`
2. `receiver_unreachable`
3. `address_not_found`
4. `proof_failed`
5. `unsafe_to_complete`
6. `receiver_refused`
7. `package_issue_detected`

## Required Checks
The modal should show reason-specific checks as confirmation chips or compact checkboxes. These are UI guardrails until the API supports structured evidence.

Shared checks:
- `I am the courier with current package custody.`
- `I understand this will record a failed attempt.`
- `I understand this may notify the receiver.`

Reason-specific checks:
- `receiver_unreachable`: `I tried the approved contact path where safe.`
- `receiver_unavailable`: `The receiver cannot receive the package now.`
- `address_not_found`: `I reviewed address and landmark instructions.`
- `unsafe_to_complete`: `I am moving or staying in a safe location.`
- `receiver_refused`: `The receiver refused package or required proof.`
- `proof_failed`: `Valid proof cannot be completed right now.`
- `package_issue_detected`: `The package condition or identity needs review.`

Check behavior:
- Required checks must be acknowledged before submit.
- Checks are not sent as separate backend fields today.
- Important check details should be summarized in note when note is required.
- Do not require unsafe couriers to keep interacting at the risky location.

## Note Rules
Backend note is optional, but modal should require a note for high-impact reasons:
- `address_not_found`
- `unsafe_to_complete`
- `receiver_refused`
- `proof_failed`
- `package_issue_detected`

Note optional:
- `receiver_unreachable`
- `receiver_unavailable`

Note constraints:
- Trim whitespace before submit.
- Minimum `5` characters when present.
- Maximum `400`.
- Do not allow only punctuation.
- Do not request raw OTP.
- Do not request full receiver phone number.
- Do not request personal medical details.
- Do not request payment information.
- Do not request secrets, keys, or provider references.

Reason-specific note prompts:
- `receiver_unreachable`: `Add contact or wait details if useful.`
- `receiver_unavailable`: `Add what the receiver said or what happened.`
- `address_not_found`: `Add landmark or address problem.`
- `unsafe_to_complete`: `Add only the safety detail operations needs.`
- `receiver_refused`: `Add refusal context.`
- `proof_failed`: `Add which proof path failed.`
- `package_issue_detected`: `Add package condition or identity issue.`

## Consequence Mapping
First ordinary attempt:
- Applies to `receiver_unreachable`, `receiver_unavailable`, `address_not_found`, `unsafe_to_complete`, `proof_failed`.
- Expected backend status: `awaiting_final_mile_assignment`.
- User-facing consequence: `Kra will prepare this delivery for another doorstep attempt.`
- Receiver communication: failed-attempt notice.
- Courier assignment: cleared.
- Custody instruction: follow return or station instruction from host.

Second or later ordinary attempt:
- Applies to same ordinary reasons.
- Expected backend status: `awaiting_receiver_pickup`.
- User-facing consequence: `Kra will move this package to destination-station pickup flow.`
- Receiver communication: failed-attempt and pickup next-step notice.
- Courier assignment: cleared.
- Custody instruction: return package according to station process.

Issue route:
- Applies to `receiver_refused` and `package_issue_detected`.
- Expected backend status: `issue_reported`.
- User-facing consequence: `Kra will send this delivery to issue review.`
- Receiver communication: depends on notification policy.
- Courier assignment: cleared.
- Custody instruction: preserve package and follow support or station instruction.

Assigned-for-final-mile state:
- Backend may first mark `out_for_delivery`, then record failed attempt.
- User-facing consequence must not imply the courier manually started delivery if parent flow did not.

Station handoff caveat:
- Backend records a courier-to-destination-station handoff event after failed attempt.
- Modal copy must say `Return package by station process` until a future physical return scan exists.

## State Machine
`closed`:
- Modal not visible.
- Internal form state reset unless host keeps draft.

`opening`:
- Validate delivery, actor, status, custody, and route mode.
- Route immediately to blocked state when unsafe.

`reviewing_reason`:
- Default state.
- Reason cards visible.
- Primary disabled until reason selected and required checks pass.

`reason_required`:
- User attempted submit without reason.
- Focus moves to reason group.

`reason_selected`:
- Consequence preview appears.
- Required checks appear.
- Note appears if required or user taps add note.

`checks_required`:
- One or more required checks not acknowledged.
- Focus moves to first missing check.

`note_required`:
- High-impact reason selected and note missing.
- Focus moves to note.

`note_invalid`:
- Note too short, too long, unsafe, or only whitespace/punctuation.
- Preserve entered value.

`consequence_review`:
- User has valid reason/checks/note.
- Consequence card is visible before submit.

`first_attempt_context`:
- Attempt count before submit is `0`.
- Ordinary reason consequence is reattempt queue.

`second_attempt_context`:
- Attempt count before submit is `1` or more.
- Ordinary reason consequence is receiver pickup flow.

`issue_route_context`:
- Reason is `receiver_refused` or `package_issue_detected`.
- Consequence is issue review.

`pickup_route_context`:
- Second ordinary attempt consequence.

`reattempt_route_context`:
- First ordinary attempt consequence.

`custody_required_blocked`:
- Courier does not have custody.
- Show assignment or custody recovery route.

`scope_blocked`:
- Delivery is no longer assigned or accessible to this courier.
- Show refresh/back action.

`status_blocked`:
- Current status cannot record failed attempt.
- Show current status and safe next path.

`proof_still_available`:
- Parent flow says valid proof can still complete.
- Ask user to continue proof or explicitly choose failed attempt.

`offline_blocked`:
- Offline and host cannot queue non-idempotent mutation safely.
- Submit disabled.

`offline_queue_available`:
- Host explicitly supports exactly-once queued failed attempt.
- Primary label becomes `Queue failed attempt`.
- Copy says attempt is not recorded until sync confirms.

`duplicate_risk_blocked`:
- A local pending failed-attempt action exists for this delivery.
- Route to offline outbox or action recovery.

`submitting`:
- Host mutation in progress.
- Disable reason, note, close, and duplicate submit.

`server_confirmed`:
- Backend accepted mutation.
- Show route-specific success state.

`queued_pending_sync`:
- Local queue accepted action.
- Show pending copy and outbox route.

`server_rejected`:
- Backend returned a known safe error.
- Show mapped recovery.

`network_error`:
- No definitive server result.
- Offer retry only if duplicate risk is controlled.

`closing`:
- Return focus to trigger.
- Reset transient validation.

## Data Contract
Component props:

```ts
type FailedDeliveryReasonModalProps = {
  isOpen: boolean;
  delivery: FailedDeliveryReasonContext;
  actor: FailedDeliveryActorContext;
  network: FailedDeliveryNetworkState;
  queuePolicy: FailedDeliveryQueuePolicy;
  proofContext?: FailedDeliveryProofContext;
  onClose: () => void;
  onRecordFailedAttempt: (input: FailedDeliveryReasonSubmitInput) => Promise<FailedDeliveryReasonSubmitResult>;
  onQueueFailedAttempt?: (input: FailedDeliveryReasonSubmitInput) => Promise<FailedDeliveryReasonQueueResult>;
  onOpenSupport: (context: FailedDeliverySupportContext) => void;
  onOpenProofOptions: (deliveryId: string) => void;
  onOpenReturnInstructions: (deliveryId: string) => void;
  onOpenOfflineOutbox: () => void;
  onRefreshDelivery: (deliveryId: string) => Promise<void>;
};
```

Delivery context:

```ts
type FailedDeliveryReasonContext = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  assignedFinalMileCourierId?: string;
  currentCustodyRole?: "station_operator" | "driver" | "final_mile_courier";
  currentCustodyActorId?: string | null;
  destinationStationId?: string;
  destinationStationLabel?: string;
  finalMileAttemptCount?: number;
  doorstepRequested: boolean;
  serviceType: "station_to_station" | "doorstep";
  packageSummary?: {
    sizeTier?: string;
    isFragile?: boolean;
  };
  latestEventType?: string;
  latestEventOccurredAt?: string;
  activeIssueId?: string;
};
```

Actor context:

```ts
type FailedDeliveryActorContext = {
  actorId: string;
  role: "final_mile_courier";
  displayName?: string;
  canRecordFailedAttempt: boolean;
  canOpenSupport: boolean;
};
```

Network state:

```ts
type FailedDeliveryNetworkState = {
  isOnline: boolean;
  lastSyncedAt?: string;
};
```

Queue policy:

```ts
type FailedDeliveryQueuePolicy = {
  canQueueRecordFailedAttempt: boolean;
  hasPendingFailedAttemptForDelivery: boolean;
  queueLabel?: string;
};
```

Proof context:

```ts
type FailedDeliveryProofContext = {
  validProofStillAvailable: boolean;
  availableProofTypes: Array<"otp" | "signature" | "delivery_photo">;
  sourceScreen?: "route" | "proof_capture" | "otp" | "signature" | "photo" | "action_recovery";
};
```

Submit input:

```ts
type FailedDeliveryReasonSubmitInput = {
  deliveryId: string;
  reasonCode: FailedDeliveryReasonCode;
  note?: string;
  clientRequestId: string;
  currentStatusAtSubmit: DeliveryStatus;
  finalMileAttemptCountAtSubmit: number;
};
```

Reason code:

```ts
type FailedDeliveryReasonCode =
  | "receiver_unreachable"
  | "receiver_unavailable"
  | "address_not_found"
  | "unsafe_to_complete"
  | "receiver_refused"
  | "proof_failed"
  | "package_issue_detected";
```

Submit result:

```ts
type FailedDeliveryReasonSubmitResult = {
  status: "confirmed";
  deliveryId: string;
  eventId: string;
  newStatus: DeliveryStatus;
  finalMileAttemptCount: number;
};
```

Queue result:

```ts
type FailedDeliveryReasonQueueResult = {
  status: "queued";
  queueItemId: string;
};
```

Support context:

```ts
type FailedDeliverySupportContext = {
  deliveryId: string;
  trackingCode: string;
  reasonCode?: FailedDeliveryReasonCode;
  currentStatus: DeliveryStatus;
  finalMileAttemptCount?: number;
};
```

## Derived Rules
`hasCourierCustody`:
- `delivery.currentCustodyRole === "final_mile_courier"`
- `delivery.currentCustodyActorId === actor.actorId`

`hasAssignmentOrCustodyScope`:
- `delivery.assignedFinalMileCourierId === actor.actorId || hasCourierCustody`

`canRecord`:
- Actor role is `final_mile_courier`.
- Actor has `record_failed_attempt`.
- Delivery has final-mile custody.
- Status is `assigned_for_final_mile` or `out_for_delivery`.
- No pending failed-attempt action exists for the delivery.
- Not offline blocked.

`attemptNumberAfterSubmit`:
- `(delivery.finalMileAttemptCount ?? 0) + 1`

`routesToIssue`:
- Reason is `receiver_refused` or `package_issue_detected`.

`routesToPickup`:
- Reason is not issue route and `attemptNumberAfterSubmit >= 2`

`routesToReattempt`:
- Reason is not issue route and `attemptNumberAfterSubmit < 2`

`requiresNote`:
- Reason is `address_not_found`, `unsafe_to_complete`, `receiver_refused`, `proof_failed`, or `package_issue_detected`.

`canQueue`:
- Network offline.
- `queuePolicy.canQueueRecordFailedAttempt === true`
- `queuePolicy.hasPendingFailedAttemptForDelivery === false`

## Visual Design
Tone:
- Serious and clear.
- Safety-aware.
- Evidence-focused.
- No casual blame language.

Container:
- Mobile bottom sheet max height `88vh`.
- Tablet and desktop modal width `600` to `680`.
- Sticky footer.
- Scroll body when large text or keyboard is active.

Header:
- Title: `Record failed delivery reason`
- Subtitle: `Choose why this handoff cannot complete.`
- Close label: `Keep trying delivery`
- Use alert icon only after reason routes to issue or pickup.

Assignment card:
- Tracking code.
- Delivery state label.
- Attempt number after submit.
- Destination station label.
- Package size/fragile indicators if available.
- Do not show full receiver phone, OTP, proof references, or address details.

Reason cards:
- Large radio cards.
- One reason selected at a time.
- Each card includes label, one-line meaning, and consequence pill.
- Issue-route reasons use amber/red caution but not destructive styling.

Consequence card:
- Updates as reason changes.
- Shows:
  - `Next status`
  - `Receiver notification`
  - `Courier assignment`
  - `Custody instruction`
- Must be visible before submit.

Required checks:
- Compact checklist below selected reason.
- Checkboxes or acknowledgement rows.
- High-risk reasons show checks before note.

Note field:
- Multiline.
- Min height `88`.
- Character counter visible after focus.
- Reason-specific prompt.

Footer:
- Primary full width on mobile.
- Secondary `Keep trying delivery`.
- Tertiary support link visible for safety, refusal, package issue, and repeated errors.

## Copy System
Title:
- `Record failed delivery reason`

Subtitle:
- `Choose why this receiver handoff cannot complete.`

Custody warning:
- Title: `Package accountability continues`
- Body: `After this is recorded, follow Kra return or reassignment instructions. Do not treat this as delivered.`

First ordinary attempt consequence:
- Title: `This will route to reattempt`
- Body: `Kra will record the failed attempt, notify the receiver, and prepare the package for another doorstep attempt.`

Second ordinary attempt consequence:
- Title: `This will route to pickup`
- Body: `Kra will record the failed attempt and move the package toward destination-station pickup flow.`

Issue consequence:
- Title: `This will route to issue review`
- Body: `Kra will record the failed attempt and send this delivery to support review before the next operational step.`

Proof still available:
- Title: `Proof may still complete this delivery`
- Body: `If valid proof is available, complete delivery instead of recording a failed attempt.`

Offline blocked:
- Title: `Failed attempt cannot be recorded offline`
- Body: `This action can change attempt count. Connect before submitting unless the outbox is explicitly enabled for this workflow.`

Queued pending:
- Title: `Failed attempt queued`
- Body: `This attempt is not recorded until sync succeeds. Keep the package under Kra custody rules.`

Server confirmed:
- Title: `Failed attempt recorded`
- Body: `Kra saved the reason and will show the next path for this package.`

Primary labels:
- `Record failed attempt`
- `Queue failed attempt`
- `Recording...`
- `Queued`
- `Back to assignment`

Secondary labels:
- `Keep trying delivery`
- `Open proof options`
- `Open support`
- `Return instructions`
- `Open offline outbox`

Avoid copy:
- `Delivery failed`
- `Cancel delivery`
- `Drop package`
- `Receiver no-show` as a label.
- `Station received package`
- `Done`
- `Complete`
- `Success` without next step.

## Reason Card Copy
`receiver_unreachable`:
- Label: `Receiver unreachable`
- Helper: `You could not reach the receiver by approved contact path.`
- Consequence pill: `Reattempt or pickup`

`receiver_unavailable`:
- Label: `Receiver unavailable`
- Helper: `Receiver cannot receive the package now.`
- Consequence pill: `Reattempt or pickup`

`address_not_found`:
- Label: `Address not found`
- Helper: `Address or landmark cannot be confirmed safely.`
- Consequence pill: `Reattempt or pickup`

`unsafe_to_complete`:
- Label: `Unsafe to complete`
- Helper: `Location or conditions make handoff unsafe.`
- Consequence pill: `Safety`

`receiver_refused`:
- Label: `Receiver refused package`
- Helper: `Receiver declined the package or required proof.`
- Consequence pill: `Issue review`

`proof_failed`:
- Label: `Proof could not be completed`
- Helper: `OTP, signature, or photo proof cannot be completed validly.`
- Consequence pill: `Reattempt or pickup`

`package_issue_detected`:
- Label: `Package issue detected`
- Helper: `Damage, mismatch, label, or tamper concern blocks handoff.`
- Consequence pill: `Issue review`

## Submit Behavior
Online confirmed path:
1. User selects reason.
2. User completes required checks.
3. User adds note if required.
4. Modal shows consequence card.
5. User taps `Record failed attempt`.
6. Modal creates `clientRequestId` for client tracing.
7. Host calls `record_failed_attempt`.
8. Host blocks duplicate submit until definitive result.
9. On success, host invalidates delivery, timeline, courier queue, issue list when issue route applies, and notification feed if present.
10. Modal shows route-specific confirmed state.

Offline allowed path:
1. Host confirms exactly-once queue support.
2. User selects reason and completes validation.
3. User taps `Queue failed attempt`.
4. Host writes one pending action for this delivery.
5. Modal shows `queued_pending_sync`.
6. User can open offline outbox.
7. Host must prevent another failed-attempt queue item for same delivery.

Offline blocked path:
1. Network offline.
2. Host does not support safe queue.
3. Submit disabled.
4. Modal shows connection requirement and support path if available.

Network uncertain path:
1. Request times out or network drops after submit.
2. Modal does not assume failure or success.
3. Host refreshes delivery if possible.
4. If refresh shows changed attempt count or status, show confirmed or conflict state.
5. If refresh unavailable, offer retry only after duplicate risk is controlled.

Duplicate protection:
- Disable primary after first tap.
- Do not retry automatically.
- Keep local pending marker until host resolves.
- If backend returns updated status, stop retry.
- If outbox has pending failed-attempt item, show `duplicate_risk_blocked`.

## Error Mapping
`AUTH_REQUIRED`:
- Message: `Sign in again to record this attempt.`
- Action: `Sign in`
- State: `server_rejected`

`FORBIDDEN_ROLE`:
- Message: `This account cannot record final-mile failed attempts.`
- Action: `Back to assignments`
- State: `scope_blocked`

`ASSIGNMENT_SCOPE_VIOLATION`:
- Message: `This delivery is no longer assigned to you.`
- Action: `Refresh assignment`
- State: `scope_blocked`

`DELIVERY_NOT_FOUND`:
- Message: `Delivery record was not found.`
- Action: `Back to assignments`
- State: `server_rejected`

`INVALID_STATUS_TRANSITION`:
- Message: `This delivery cannot record a failed attempt from its current status.`
- Action: `Refresh delivery`
- State: `status_blocked`

`FINAL_PROOF_REQUIRED`:
- Message: `Delivery proof is still required to complete this job.`
- Action: `Open proof options`
- State: `proof_still_available`

`REATTEMPT_LIMIT_REACHED`:
- Message: `The reattempt limit has been reached. Return this package to station pickup flow.`
- Action: `Return instructions`
- State: `pickup_route_context`

`ISSUE_LOCK_ACTIVE`:
- Message: `This delivery is locked while an issue is being reviewed.`
- Action: `Open support`
- State: `status_blocked`

`CONFLICTING_HANDOFF_STATE`:
- Message: `The custody record changed. Refresh before recording this attempt.`
- Action: `Refresh delivery`
- State: `custody_required_blocked`

`VALIDATION_ERROR`:
- Message: `Check the reason and note, then try again.`
- Action: `Review form`
- State: `note_invalid`

`UNKNOWN_INTERNAL_ERROR`:
- Message: `Kra could not record this attempt right now.`
- Action: `Retry`
- State: `server_rejected`

Network timeout:
- Message: `Kra did not confirm whether this attempt was recorded. Refresh before retrying.`
- Action: `Refresh delivery`
- State: `network_error`

## Privacy And Security
Allowed in modal:
- Tracking code.
- Delivery ID if operational UI normally shows it.
- Destination station label.
- Current status label.
- Package size tier and fragile flag.
- Attempt count.
- Reason code and safe label.

Never show:
- Receiver OTP.
- Receiver verification token.
- Full receiver phone.
- Full receiver address.
- Proof asset references.
- Signature image.
- Delivery photo.
- Raw GPS trace.
- Payment provider references.
- Internal support-only notes.

Never send to analytics:
- Note text.
- Receiver name.
- Receiver phone.
- Receiver address.
- Proof reference.
- Package scan code.
- GPS coordinates.
- Uploaded image metadata.

Local storage:
- Store pending queue item only if queue policy allows it.
- Pending item may include delivery ID, tracking code, reason code, note, created time, attempt count at submit, and client request ID.
- Pending item must not include receiver phone, OTP, address, proof files, or raw location trace.

## Accessibility Requirements
Dialog:
- Use `role="dialog"` for normal reason selection.
- Use `role="alertdialog"` when showing final high-impact consequence for issue route or pickup route.
- `aria-modal="true"`.
- Labelled by modal title.
- Described by custody warning and consequence copy.
- Background is inert.

Focus:
- Initial focus on title for long content.
- If opened from a reason shortcut, initial focus may go to selected reason.
- Validation focuses first missing reason, check, or note.
- Success focuses success heading.
- Close returns focus to triggering failed-attempt action.

Keyboard:
- Tab loop remains inside modal.
- Escape closes only when not submitting and not in uncertain network state.
- Arrow keys navigate reason radio group.
- Enter submits only when primary is enabled.

Screen reader:
- Announce selected reason.
- Announce whether note is required.
- Announce consequence change when reason changes.
- Announce submitting, queued, confirmed, and rejected states.
- Use `aria-live="polite"` for normal status.
- Use assertive announcement only for safety block or duplicate-risk block.

Touch:
- Reason rows at least `48px` high.
- Primary action at least design system touch minimum.
- Check rows are large enough for one-handed field use.

Motion:
- Short modal enter and exit.
- Consequence card cross-fade or slide under `180ms`.
- Disable decorative motion under reduced-motion preference.
- No shaking on error.

## Responsive Behavior
Compact phone:
- Bottom sheet.
- Sticky footer.
- Reason list scrolls.
- Consequence card stays close to selected reason.
- Keyboard avoids covering note submit area.

Large phone:
- Bottom sheet can show assignment card, selected consequence, and footer together.

Tablet:
- Centered modal.
- Two columns allowed: reason list and consequence panel.
- Note spans modal width.

Desktop shell:
- Centered modal.
- Max width `680`.
- Footer actions align right.

Large text:
- No truncation of reason labels.
- Modal scrolls.
- Footer remains reachable.

Landscape:
- Use compact header.
- Keep consequence and submit visible.

## Component Anatomy
Required:
- `FailedDeliveryReasonModalRoot`
- `FailedDeliveryReasonHeader`
- `FailedDeliveryAssignmentSummary`
- `FailedDeliveryCustodyWarning`
- `FailedDeliveryReasonGroup`
- `FailedDeliveryReasonCard`
- `FailedDeliveryRequiredChecks`
- `FailedDeliveryNoteField`
- `FailedDeliveryConsequenceCard`
- `FailedDeliveryOfflinePanel`
- `FailedDeliveryErrorPanel`
- `FailedDeliverySuccessPanel`
- `FailedDeliveryActionFooter`

Optional:
- `FailedDeliveryProofStillAvailablePanel`
- `FailedDeliveryDuplicateRiskPanel`
- `FailedDeliveryReturnInstructionLink`
- `FailedDeliverySupportLink`

Responsibilities:
- Root handles focus trap, scroll lock, and Escape rules.
- Header communicates task and close.
- Summary provides delivery and attempt context.
- Custody warning prevents false delivery or false station receipt.
- Reason group owns selected reason.
- Checks ensure reason-specific acknowledgement.
- Note field captures only concise operational context.
- Consequence card maps selected reason and attempt count to route result.
- Offline panel prevents unsafe non-idempotent replay.
- Error panel maps safe API errors.
- Success panel shows next path.
- Footer owns primary and secondary actions.

## Host Integration
`CourierFailedAttempt` host:
- Opens modal after parent screen has enough delivery context.
- Passes attempt count and current custody.
- Receives submit result and routes according to new status.
- Owns timeline refresh.

`CourierRoute` host:
- Opens modal only after user chooses `Record failed attempt`.
- Passes route context if available, but modal does not show map.

`CourierProofCapture` host:
- Opens modal when receiver, proof, address, safety, or package condition blocks proof.
- Passes `proofContext.validProofStillAvailable`.

`CourierOtpCompletion` host:
- Opens modal for OTP unavailable, receiver absent, receiver refused, or token flow failure that cannot complete.

`CourierSignatureProof` host:
- Opens modal when receiver cannot or will not sign.

`CourierPhotoProof` host:
- Opens modal when photo proof is invalid, refused, or unsafe to capture.

`OpsActionRecovery` host:
- Opens modal when failed-attempt submission needs recovery.
- Must avoid duplicate submission if backend result is uncertain.

`OpsOfflineOutbox` host:
- Opens modal read-only or review mode for pending queued failed-attempt action.
- Do not let user create a second pending action for same delivery.

## Query And Cache Invalidation
After confirmed submit:
- Invalidate `Delivery`.
- Invalidate `DeliveryTimeline`.
- Invalidate `CourierQueue`.
- Invalidate `IssueList` when reason routes to issue.
- Invalidate notification feed if client has it.
- Clear active proof local state for this delivery.
- Clear active route step for this delivery.

Do not:
- Mark delivered.
- Keep courier assignment active if refreshed backend clears it.
- Show receiver contact action as primary after failed attempt success.
- Remove queue item before server confirmation unless queued state is explicit.

After queued submit:
- Add one outbox item.
- Keep delivery data marked stale.
- Do not invalidate server reads until sync success.

After submit error:
- Preserve selected reason and note.
- Clear submitting flag.
- Require refresh before retry when duplicate risk is unknown.

## Analytics
Events:
- `failed_delivery_reason_modal_opened`
- `failed_delivery_reason_selected`
- `failed_delivery_required_check_toggled`
- `failed_delivery_note_validation_failed`
- `failed_delivery_consequence_viewed`
- `failed_delivery_submit_started`
- `failed_delivery_submit_confirmed`
- `failed_delivery_submit_queued`
- `failed_delivery_submit_rejected`
- `failed_delivery_duplicate_risk_blocked`
- `failed_delivery_support_opened`
- `failed_delivery_modal_closed`

Required properties:
- `deliveryId`
- `actorRole`
- `currentStatus`
- `reasonCode`
- `attemptCountBeforeSubmit`
- `attemptCountAfterSubmit`
- `expectedRoute`
- `isOnline`
- `sourceScreen`
- `blockReason`
- `clientRequestId`

Forbidden properties:
- `note`
- `receiverName`
- `receiverPhone`
- `receiverAddress`
- `otp`
- `proofReference`
- `packageScanCode`
- `gpsCoordinates`
- `photoMetadata`

Key metrics:
- Reason distribution.
- First-attempt versus second-attempt routing.
- Issue-route rate.
- Duplicate-risk block count.
- Offline queue rate and sync success.
- Failed-attempt submission error rate.
- Safety reason rate by station and corridor.

## Testing Requirements
Unit tests:
- Renders all seven backend reason codes.
- Primary disabled until reason selected.
- Required checks block submit.
- Note required for high-impact reasons.
- Optional note validates min and max when present.
- First ordinary attempt consequence is reattempt.
- Second ordinary attempt consequence is pickup.
- Refusal consequence is issue review.
- Package issue consequence is issue review.
- Offline blocked prevents submit.
- Offline queue available changes primary label.
- Duplicate pending action blocks submit.
- Scope block renders for wrong courier.
- Custody block renders when courier lacks custody.
- Proof-available state routes back to proof.
- Submit calls host with exact backend reason code.

Integration tests:
- `CourierFailedAttempt` opens modal and submits `receiver_unavailable`.
- `CourierProofCapture` opens modal and submits `proof_failed`.
- `CourierOtpCompletion` opens modal for receiver absent.
- `CourierPhotoProof` opens modal for receiver refusal.
- Server success routes according to returned status.
- Network timeout requires refresh before retry.
- Server status conflict preserves reason and shows refresh.
- Queued failed attempt appears in offline outbox.

Accessibility tests:
- Modal has accessible name and description.
- Focus trap works.
- Escape disabled while submitting.
- Reason group is announced as radio group.
- Consequence change is announced.
- Validation messages are linked to controls.
- Success and error states are announced.
- Large text keeps primary action reachable.

Visual tests:
- Compact phone default.
- Compact phone with keyboard and note.
- Issue-route reason selected.
- Pickup-route consequence.
- Offline blocked.
- Duplicate-risk blocked.
- Server confirmed.
- Error state.

End-to-end tests:
- `e2e-courier-records-first-failed-attempt-reattempt`
- `e2e-courier-records-second-failed-attempt-pickup`
- `e2e-courier-refusal-routes-to-issue`
- `e2e-courier-package-issue-routes-to-issue`
- `e2e-failed-attempt-duplicate-submit-blocked`
- `e2e-failed-attempt-offline-policy-enforced`

Contract tests:
- Submit body contains only `reasonCode` and optional `note`.
- Reason code is backend enum.
- Note length matches shared contract.
- Non-idempotent route is not auto-replayed by default.
- Receiver-sensitive fields are not sent to analytics.

## Acceptance Criteria
Functional:
- Modal supports all backend reason codes.
- Modal blocks submit without reason.
- Modal requires checks.
- Modal requires note where policy demands.
- Modal maps consequence from reason and attempt count.
- Modal calls `record_failed_attempt` once per submit.
- Modal blocks duplicate pending action.
- Modal handles success, queue, error, and uncertain network states.
- Modal routes to proof, support, return, outbox, or assignment detail as appropriate.

UX:
- Courier understands this is not delivery completion.
- Courier sees exactly what happens next.
- Courier sees whether receiver may be notified.
- Courier sees custody/return instruction.
- Reason selection is fast under field conditions.
- Safety and package issue reasons are prominent but not noisy.

Security:
- No OTP, receiver phone, address, proof reference, scan code, or raw location data appears.
- Note is not sent to analytics.
- Local queue stores only safe fields.
- Unsupported station return confirmation is not claimed.

Accessibility:
- Modal pattern is correct.
- Focus and keyboard behavior work.
- Status updates are announced.
- Touch targets are field-safe.
- Reduced motion is respected.

## Implementation Notes For Claude Code
Build this as a shared modal used by the courier failed-attempt and proof recovery surfaces.

Recommended ownership:
- `apps/mobile/src/features/ops/components/FailedDeliveryReasonModal.tsx`
- `apps/mobile/src/features/ops/components/failedDeliveryReasons.ts`
- `apps/mobile/src/features/ops/components/__tests__/FailedDeliveryReasonModal.test.tsx`
- Host integration in courier failed-attempt and proof child screens.

Implementation sequence:
1. Create reason metadata from backend enum.
2. Create consequence mapper from reason and attempt count.
3. Build pure modal state machine.
4. Wire validation for reason, checks, and note.
5. Wire host submit callback.
6. Add duplicate-submit guard.
7. Add offline blocked and queued states.
8. Add success routing.
9. Add analytics with redaction.
10. Add unit, integration, accessibility, and E2E coverage.

Do not implement:
- New backend fields.
- New failed-attempt endpoint.
- Station return scan.
- Receiver contact controls.
- Proof upload.
- Refund logic.
- Admin resolution.
- Direct station reassignment.
- Automatic retry for non-idempotent failed attempts.

## Open Backend Gaps
Gap: `record_failed_attempt` is not idempotent.
- Product impact: offline replay and retry require caution.
- UI decision: block automatic replay unless host has exactly-once policy.
- Future owner: backend route idempotency.

Gap: evidence fields are compressed into note.
- Product impact: contact attempts and safety details are not structured.
- UI decision: show required checks locally and summarize important facts in note.
- Future owner: failed-attempt request schema.

Gap: backend handoff event may imply destination station handoff without physical return scan.
- Product impact: UI must avoid station receipt copy.
- UI decision: say return/assignment instructions, not station received.
- Future owner: station return-to-custody workflow.

Gap: notification delivery status is not returned.
- Product impact: UI cannot confirm receiver SMS delivery in modal.
- UI decision: say receiver will be notified by Kra workflow, not SMS delivered.
- Future owner: notification feed projection.

Gap: no structured issue link in failed-attempt response.
- Product impact: issue-route success may need timeline/detail refresh.
- UI decision: route to support or issue list only after host refresh confirms link.
- Future owner: lifecycle response extension.

## Quality Bar
This modal is complete when:
- It is contract-honest with `record_failed_attempt`.
- It protects against duplicate attempt count.
- It captures all backend reason codes.
- It explains route consequences before submit.
- It blocks unsafe offline behavior.
- It redacts sensitive receiver and proof data.
- It preserves accessibility.
- It can be reused by all courier proof and route recovery surfaces.

## Final Handoff Summary
Build `FailedDeliveryReasonModal` as the shared final-mile reason confirmation modal for failed doorstep attempts. It must use only the backend `record_failed_attempt` reason enum, require checks and notes where operationally necessary, preview whether the result is reattempt, receiver pickup, or issue review, block duplicate/non-idempotent replay risks, protect custody wording, redact sensitive data, and hand the actual mutation to the host screen.

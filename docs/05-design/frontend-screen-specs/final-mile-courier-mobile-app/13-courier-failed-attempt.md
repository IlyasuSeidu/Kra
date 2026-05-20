# CourierFailedAttempt Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierFailedAttempt` |
| Route | `/(ops)/courier/assignments/:deliveryId/failed-attempt` |
| Primary test ID | `screen-courier-failed-attempt` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `record_failed_attempt`, `get_delivery_timeline`, `create_issue` only when escalation is chosen |
| Offline critical | Yes, but must avoid duplicate failed-attempt submission |
| Required role | `final_mile_courier` |
| Required capability | `record_failed_attempt` |
| Primary mutation | `POST /v1/deliveries/:id/final-mile-failed-attempt` |
| Mutation request | `{ reasonCode, note? }` |
| Success response | `deliveryLifecycleResponseSchema` |
| Parent screens | `CourierRoute`, `CourierProofCapture`, `CourierOtpCompletion`, `CourierSignatureProof`, `CourierPhotoProof`, `CourierAssignmentDetail` |
| Recovery workflows | `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/return-to-station`, `/(ops)/issues/create`, `/(ops)/support`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Structured failed-attempt reason, short evidence note, lifecycle transition, receiver SMS, notification feed update, and timeline event |

## Outcome
`CourierFailedAttempt` lets a final-mile courier record that a doorstep handoff could not safely or legitimately complete.

The screen must answer:
- `Why can this delivery not be completed now?`
- `Did the courier try the required contact or location checks?`
- `Is the selected reason a reattempt, pickup-flow, or issue-review path?`
- `What happens to package custody after recording this attempt?`
- `Is this the first attempt or the second attempt?`
- `Does the receiver get notified?`
- `Can this action be retried without recording duplicate attempts?`
- `Does this need support instead of a normal failed-attempt write?`
- `Does the courier need to return the package to station now?`

This is a safety and accountability screen. It must make legitimate failure fast to record while making careless or fraudulent failure hard to submit.

## Product Definition
This screen is the final-mile exception capture flow.

It allows couriers to:
- Record receiver unreachable.
- Record receiver unavailable.
- Record address not found.
- Record unsafe to complete.
- Record receiver refused.
- Record proof failed.
- Record package issue detected.
- Add a short operational note.
- Review the consequence before submission.
- Submit the failed attempt to backend.
- See whether the next path is reassignment, receiver pickup, issue review, support, or return-to-station.
- Queue the write only if the app can preserve exactly-once behavior.
- Recover from timeouts without double-counting an attempt.

It does not allow couriers to:
- Mark the package delivered.
- Upload signature or photo proof.
- Bypass OTP, signature, or photo proof when delivery can still complete.
- Record a vague failure reason.
- Submit without knowing the downstream consequence.
- Inflate the failed-attempt count through repeated taps.
- Use support as a replacement for structured failed-attempt data.
- Claim station receipt when no physical return scan has happened.
- Hide issue-review routing for receiver refusal or package condition.

## Users
Primary:
- Final-mile couriers carrying a package that cannot be delivered at the receiver location.

Secondary:
- Station operators who will receive the package back or reassign it.
- Support agents reviewing contact, location, refusal, or safety evidence.
- Receivers who will see missed-delivery information.
- Senders who need trustworthy delivery status.
- Finance and dispute teams deciding whether doorstep surcharge was consumed.

## Entry Points
The screen can open from:
- `CourierRoute` when address, receiver, or safety blocks delivery.
- `CourierProofCapture` when proof cannot be completed.
- `CourierOtpCompletion` after OTP cannot be obtained or verification cannot proceed.
- `CourierSignatureProof` after receiver cannot or will not sign.
- `CourierPhotoProof` after receiver refuses photo proof or photo proof is invalid.
- `CourierAssignmentDetail` for direct exception handling.
- `OpsActionRecovery` after a failed queued attempt write.
- `OpsOfflineOutbox` when retrying a queued failed-attempt action.

## Real-World Context
The courier may be outside a locked gate, at the wrong street, near a risky location, dealing with a receiver who refuses the package, handling a damaged package, or unable to complete proof because the receiver is not present.

The screen must support harsh field conditions:
- One-handed use.
- Low bandwidth.
- Bright sunlight.
- Rain or poor visibility.
- Receiver pressure.
- Courier stress.
- Safety urgency.
- Time-sensitive return-to-station decisions.
- Unreliable network after the courier leaves the receiver location.

## User Goal
Primary goal:
- Record a truthful failed doorstep attempt with enough evidence to protect the receiver, sender, courier, station, and Kra.

Secondary goals:
- Know what to do with the package next.
- Notify the receiver through backend workflow.
- Avoid duplicate failed-attempt count.
- Escalate safety or package issues quickly.

## Scope
In scope:
- Failed-attempt reason selection.
- Required checks by reason.
- Short note capture.
- Consequence preview.
- Submission and recovery.
- Attempt count messaging.
- Offline queue rules.
- Return-to-station routing.
- Issue-review routing.
- Support escalation.
- Timeline refresh after submission.

Out of scope:
- Proof upload.
- Receiver OTP verification.
- Signature capture.
- Photo capture.
- Admin adjudication.
- Refund decision.
- Reassignment decision.
- Physical station return scan.
- Full issue conversation.

## Design Thesis
This screen should feel like a professional incident form optimized for speed, not a long support ticket.

Visual direction:
- Strong reason cards.
- Clear consequence summary.
- Safety-first escalation.
- Evidence discipline.
- Large field controls.
- No clutter.
- No casual tone.
- No hidden consequences.

## Research Inputs
Relevant external references:
- [DoorDash customer unavailable guidance](https://help.doordash.com/en-au/dashers/article/how-to-complete-a-delivery-when-the-customer-is-unavailable): supports explicit arrived state, call/text attempts, customer unavailable action, timer, safe-location instructions, and documentation when a handoff cannot complete.
- [Uber Direct delivery status webhook](https://developer.uber.com/docs/deliveries/daas/references/api/webhooks/delivery-status-webhook): supports explicit returned status for undeliverable deliveries, undeliverable reason/action fields, related return jobs, and proof fields for completed dropoff.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local-first read state, queued writes, retry behavior, and backend as source of truth.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors when a reason, note, or required check is missing.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing submit, offline, queued, synced, conflict, and success states without unexpected focus movement.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for reason cards, contact checks, safety action, submit, retry, and return actions.

Internal references:
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/08-courier-route.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/06-technical/api-contracts.md`
- `docs/06-technical/error-codes.md`
- `docs/06-technical/webhooks-and-event-payloads.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`

## Backend Contract
Route:
```http
POST /v1/deliveries/:id/final-mile-failed-attempt
```

Operation ID:
```text
record_failed_attempt
```

Request body:
```json
{
  "reasonCode": "receiver_unavailable",
  "note": "Called receiver twice. Waited at blue gate. No response."
}
```

Allowed `reasonCode` values:
```text
receiver_unreachable
receiver_unavailable
address_not_found
unsafe_to_complete
receiver_refused
proof_failed
package_issue_detected
```

Request constraints:
- `reasonCode` is required.
- `note` is optional.
- If present, `note` must be trimmed.
- If present, `note` must be at least `5` characters.
- If present, `note` must be at most `400` characters.

Response:
```text
deliveryLifecycleResponseSchema
```

Backend side effects:
- Validates `record_failed_attempt` capability.
- Validates assigned final-mile courier scope.
- Validates final-mile custody.
- If current status is `assigned_for_final_mile`, backend first transitions to `out_for_delivery`.
- Increments `finalMileAttemptCount`.
- Writes failed-attempt reason and count into lifecycle event metadata.
- Sends receiver SMS for failed attempt.
- Emits delivery status notification.
- Creates a handoff event from final-mile courier to destination station.
- Clears assigned final-mile courier.

Backend routing:
- `receiver_refused` routes delivery to `issue_reported`.
- `package_issue_detected` routes delivery to `issue_reported`.
- Other reasons on first attempt route delivery to `awaiting_final_mile_assignment`.
- Other reasons on second or later attempt route delivery to `awaiting_receiver_pickup`.

Critical backend gap:
- The mutation accepts only `reasonCode` and optional `note`.
- It does not separately persist contact attempts, wait duration, GPS, arrival distance, safety flag, address confidence, photo evidence, receiver refusal details, package condition category, or courier next-step acknowledgement.
- The UI must capture these as local decision aids and compress the important facts into the note until the API supports structured evidence fields.

Custody contract caveat:
- Current backend creates a final-mile-courier-to-destination-station handoff event when the failed attempt is recorded.
- The UI must not phrase this as physically scanned station receipt unless a future return scan confirms it.
- The UI should say `Package must follow station return or reassignment instructions` instead of `Station has received the package`.

## Eligibility Rules
Render the normal form only when:
- Delivery exists.
- User is authenticated.
- User role is `final_mile_courier`.
- User has `record_failed_attempt`.
- Delivery is assigned to this courier.
- Final-mile custody belongs to this courier.
- Delivery is not already delivered.
- Delivery is not already in issue-only review.
- Delivery is not already awaiting receiver pickup unless opened in read-only result mode.
- Delivery has destination station context.

Block submission when:
- Delivery is missing.
- Delivery belongs to another courier.
- Delivery is already completed.
- Delivery is already returned to pickup flow.
- User lacks capability.
- Backend returns stale-state conflict.
- Offline queue cannot guarantee duplicate protection.
- Reason selection is missing.
- Required reason checks are not complete.
- Note is too short or too long.

## Reason Decision Model
The UI must explain each reason in plain operational language.

`receiver_unreachable`:
- Use when the receiver cannot be reached by available phone/SMS/contact channels.
- Requires at least one contact attempt unless unsafe.
- Best for no answer, unreachable phone, invalid line, or no response.

`receiver_unavailable`:
- Use when the courier is at or near the location but receiver is not present.
- Requires arrival confirmation and wait timer unless unsafe.
- Best for locked gate, no one present, office closed, or receiver away.

`address_not_found`:
- Use when the saved address, landmark, or navigation is insufficient to find the receiver location.
- Requires map/address check and contact attempt unless unsafe.
- Best for missing street, ambiguous compound, unreachable landmark, or mismatched directions.

`unsafe_to_complete`:
- Use when continuing would put courier, receiver, package, or bystanders at risk.
- Does not require wait timer.
- Must surface support escalation immediately.
- Best for violence risk, unsafe crowd, dangerous road, flood/fire, aggressive animal, or police/security restriction.

`receiver_refused`:
- Use when receiver or authorized representative refuses the package or proof process.
- Routes to issue review.
- Requires refusal detail in note.
- Must not push courier to force proof.

`proof_failed`:
- Use when handoff might otherwise be possible but required proof cannot complete.
- Best for OTP unavailable, receiver cannot sign, photo proof not allowed, device issue after proof path, or proof mismatch.
- Must route back to proof flow if a valid proof method is still available.

`package_issue_detected`:
- Use when package condition, label, contents, or custody state blocks handoff.
- Routes to issue review.
- Should offer staff issue creation after failed-attempt submission.

## Attempt Consequence Rules
The consequence panel must compute the likely outcome before submission.

First attempt, non-issue reason:
- Delivery will return to final-mile assignment queue.
- Receiver will be notified.
- Reattempt can happen within policy window.
- Doorstep surcharge is treated as operationally consumed after a valid attempt.

Second attempt or later, non-issue reason:
- Delivery will move to receiver pickup flow.
- Courier must return package according to station instructions.
- Receiver and sender should be notified through backend notification workflow.
- UI should route to `CourierReturnToStation`.

Receiver refused:
- Delivery moves to issue review.
- Courier should not force acceptance or proof.
- UI should offer `OpsIssueCreate` if more detail is needed.

Package issue detected:
- Delivery moves to issue review.
- Courier should preserve package condition and return to station or await support instruction.
- UI should offer `OpsIssueCreate`.

Unsafe to complete:
- Delivery may route to final-mile queue or receiver pickup depending attempt count.
- UI must prioritize courier safety and support.
- No timer or contact requirement can block safety submission.

Proof failed:
- Delivery may route to final-mile queue or receiver pickup depending attempt count.
- UI must offer return to proof options if another proof method is still allowed.

## Required Checks By Reason
`receiver_unreachable` checks:
- `Tried calling receiver`
- `Tried sending receiver message`
- `Waited at or near location`
- `No response before submitting`

`receiver_unavailable` checks:
- `Arrived at receiver location`
- `Tried receiver contact`
- `Wait timer completed`
- `Package still in courier custody`

`address_not_found` checks:
- `Checked saved address and landmark`
- `Tried receiver contact`
- `Could not locate safe delivery point`
- `Package still in courier custody`

`unsafe_to_complete` checks:
- `I am moving to a safer place`
- `Package remains with me`
- `Support may be needed`

`receiver_refused` checks:
- `Receiver refused package or proof`
- `I did not leave the package unattended`
- `Package remains with me`
- `Issue review is required`

`proof_failed` checks:
- `Tried required proof path`
- `No valid fallback proof can be completed now`
- `Package remains with me unless support instructs otherwise`

`package_issue_detected` checks:
- `Package issue blocks handoff`
- `Issue details are written in the note`
- `Package remains secure`
- `Issue review is required`

## Wait Timer Decision
Default wait rule:
- Require a `5 minute` wait after arrival for `receiver_unavailable` unless the location becomes unsafe.

Contact rule:
- Require at least one call or message attempt for `receiver_unreachable`, `receiver_unavailable`, and `address_not_found` unless safety blocks contact.

Safety override:
- `unsafe_to_complete` can submit immediately.
- The UI must ask for a concise safety note but must not trap the courier in the location.

Implementation note:
- The backend does not enforce timer or contact checks.
- The UI must enforce them locally for operational discipline.

## Information Architecture
Top-to-bottom order:
- Header with delivery identity, custody, attempt count, and network state.
- Safety banner when selected reason or context is unsafe.
- Delivery identity card.
- Reason selector.
- Required checks card.
- Contact/wait evidence card.
- Note composer.
- Consequence preview.
- Primary submit bar.
- Recovery and alternate actions.

## Layout
Mobile portrait layout:
- Sticky top header.
- Scrollable form body.
- Sticky bottom submit bar.
- Reason cards in one-column layout.
- Required checks as large check rows.
- Note box above consequence preview.
- Submit confirmation state uses bottom sheet only for high-impact paths.

Mobile landscape layout:
- Two-column split if width allows.
- Left column: identity and reason selection.
- Right column: checks, note, consequence, submit.

Small devices:
- Keep one-column layout.
- Keep submit bar visible.
- Compress delivery identity to essential fields.
- Do not hide consequence preview.

## Component 1: Header
Purpose:
- Confirm this is a failed-attempt recording flow for the correct package.

Content:
- Title: `Record failed attempt`
- Subtitle: receiver or location summary.
- Status chip: current delivery status.
- Attempt chip: `Attempt 1` or `Attempt 2`.
- Custody chip: `In your custody`.
- Network chip: online, offline, queued, syncing, conflict.
- Back action.

Test IDs:
- `courier-failed-header`
- `courier-failed-back-action`
- `courier-failed-status-chip`
- `courier-failed-attempt-chip`
- `courier-failed-custody-chip`
- `courier-failed-network-chip`

Behavior:
- Back before edits returns to source screen.
- Back after edits asks whether to keep or discard local progress.
- Header must show blocked state before form controls.
- Header must never show internal repository IDs beyond user-safe tracking or delivery code.

## Component 2: Delivery Identity Card
Purpose:
- Prevent wrong-package failed-attempt writes.

Content:
- Tracking code.
- Package summary.
- Receiver first name or safe display name.
- Receiver phone masked.
- Destination station.
- Delivery address and landmark.
- Current status.
- Last timeline event.

Test IDs:
- `courier-failed-delivery-card`
- `courier-failed-tracking-code`
- `courier-failed-package-summary`
- `courier-failed-receiver-name`
- `courier-failed-receiver-phone`
- `courier-failed-address`
- `courier-failed-landmark`
- `courier-failed-last-event`

Behavior:
- If receiver phone is missing, disable contact-based checks and explain why.
- If address or landmark is missing, elevate `address_not_found`.
- If delivery is no longer assigned to this courier, block form.

## Component 3: Reason Selector
Purpose:
- Capture the structured reason required by backend.

Reason cards:
- `Receiver unreachable`
- `Receiver unavailable`
- `Address not found`
- `Unsafe to complete`
- `Receiver refused`
- `Proof failed`
- `Package issue detected`

Each card includes:
- Human label.
- Reason code.
- One-line definition.
- Consequence label.
- Required checks count.

Test IDs:
- `courier-failed-reason-selector`
- `courier-failed-reason-receiver-unreachable`
- `courier-failed-reason-receiver-unavailable`
- `courier-failed-reason-address-not-found`
- `courier-failed-reason-unsafe-to-complete`
- `courier-failed-reason-receiver-refused`
- `courier-failed-reason-proof-failed`
- `courier-failed-reason-package-issue-detected`

Behavior:
- Exactly one reason can be selected.
- Selecting a reason resets incompatible required checks.
- Selecting `unsafe_to_complete` expands safety escalation.
- Selecting `receiver_refused` expands issue-review warning.
- Selecting `package_issue_detected` expands package condition warning.
- Selecting `proof_failed` shows return-to-proof options if proof is still possible.

## Component 4: Required Checks Card
Purpose:
- Make the courier verify policy-sensitive prerequisites before submission.

Content:
- Checklist rows driven by selected reason.
- Explanation under each check.
- Safety bypass note where applicable.

Test IDs:
- `courier-failed-checks-card`
- `courier-failed-check-call`
- `courier-failed-check-message`
- `courier-failed-check-arrived`
- `courier-failed-check-waited`
- `courier-failed-check-address`
- `courier-failed-check-safety`
- `courier-failed-check-package-secure`
- `courier-failed-check-issue-review`

Behavior:
- Required checks must be satisfied before submit.
- `unsafe_to_complete` must not require wait timer.
- Disabled checks explain why they are unavailable.
- Checks must be saved locally during screen session.
- Checks must be revalidated when delivery state refreshes.

## Component 5: Contact And Wait Evidence
Purpose:
- Capture operational evidence in a way that can be compressed into the backend note.

Fields:
- Call attempted toggle.
- Message attempted toggle.
- Arrival confirmed toggle.
- Wait timer.
- Contact outcome selector.
- Address confidence selector.
- Safety flag.

Contact outcomes:
- `No answer`
- `Phone off`
- `Wrong number`
- `Receiver asked for later`
- `Receiver refused`
- `Could not contact safely`

Address confidence:
- `Found exact location`
- `Found likely area`
- `Address unclear`
- `Landmark missing`
- `Navigation mismatch`

Test IDs:
- `courier-failed-evidence-card`
- `courier-failed-call-toggle`
- `courier-failed-message-toggle`
- `courier-failed-arrival-toggle`
- `courier-failed-wait-timer`
- `courier-failed-contact-outcome`
- `courier-failed-address-confidence`
- `courier-failed-safety-flag`

Behavior:
- Starting wait timer records local timestamp.
- Wait timer can continue while app is backgrounded.
- Timer pauses only if app cannot trust elapsed time.
- Safety reason can bypass timer.
- Contact evidence should prefill note composer.
- Evidence is not sent as separate fields until backend supports it.

## Component 6: Note Composer
Purpose:
- Create a concise operational note accepted by backend.

Field:
- Multiline text area.

Constraints:
- Minimum `5` characters if provided.
- Maximum `400` characters.
- Trim whitespace before submission.

Recommended note contents:
- Contact attempts.
- Wait time.
- Location clue.
- Safety issue if any.
- Receiver refusal detail if any.
- Package issue summary if any.
- Package custody confirmation.

Test IDs:
- `courier-failed-note-card`
- `courier-failed-note-field`
- `courier-failed-note-count`
- `courier-failed-note-suggestion`
- `courier-failed-note-error`

Behavior:
- If selected reason requires details, note becomes required by UI even though backend marks it optional.
- `receiver_refused`, `unsafe_to_complete`, and `package_issue_detected` always require note.
- Auto-suggestion can fill a concise note from checks.
- Courier can edit the suggestion.
- Character counter turns warning near `360` characters.
- Error appears if note is shorter than `5` characters after trim.
- Error appears if note exceeds `400` characters.

Copy:
- Label: `What happened?`
- Helper: `Keep it factual. Include contact, location, safety, refusal, or package issue details.`
- Counter: `{count}/400`

## Component 7: Consequence Preview
Purpose:
- Show the backend outcome before the courier submits.

Inputs:
- Selected reason.
- Current `finalMileAttemptCount`.
- Delivery status.
- Doorstep policy.

Outputs:
- Receiver notification.
- Next status.
- Package next action.
- Station or issue path.
- Reattempt or pickup warning.

Test IDs:
- `courier-failed-consequence-card`
- `courier-failed-next-status`
- `courier-failed-receiver-notice`
- `courier-failed-package-next-action`
- `courier-failed-issue-warning`
- `courier-failed-return-warning`

First attempt copy:
- Title: `This records attempt 1`
- Body: `The receiver will be notified. The job can return to final-mile assignment for one reattempt.`

Second attempt copy:
- Title: `This records attempt 2`
- Body: `The package moves to receiver pickup flow. Follow return-to-station instructions after submission.`

Refusal copy:
- Title: `This routes to issue review`
- Body: `Do not force the handoff. Keep the package secure and add the refusal details.`

Package issue copy:
- Title: `This routes to issue review`
- Body: `Preserve package condition and add the issue details.`

Unsafe copy:
- Title: `Safety comes first`
- Body: `Move to a safer place. Record only what you can safely verify.`

## Component 8: Submit Bar
Purpose:
- Submit the failed-attempt mutation with duplicate protection.

Primary CTA:
- `Record failed attempt`

Secondary actions:
- `Back to proof options`
- `Open support`
- `Create issue`
- `Return to route`

Test IDs:
- `courier-failed-submit-bar`
- `courier-failed-submit-action`
- `courier-failed-proof-options-action`
- `courier-failed-support-action`
- `courier-failed-create-issue-action`
- `courier-failed-return-route-action`

Behavior:
- Submit disabled until reason and required checks are valid.
- Submit disabled while mutation is in flight.
- Submit disabled if delivery state is stale.
- Submit uses single-flight lock.
- Submit shows consequence confirmation for second attempt, refusal, package issue, and unsafe reason.
- Submit must not create two attempts from repeated taps.

## Confirmation Sheet
Use confirmation sheet only for high-impact reasons:
- `unsafe_to_complete`
- `receiver_refused`
- `package_issue_detected`
- second or later attempt

Content:
- Reason.
- Consequence.
- Package next action.
- Primary CTA: `Confirm failed attempt`
- Secondary CTA: `Review details`

Test IDs:
- `courier-failed-confirm-sheet`
- `courier-failed-confirm-reason`
- `courier-failed-confirm-consequence`
- `courier-failed-confirm-action`
- `courier-failed-review-action`

Behavior:
- Confirmation cannot hide validation errors.
- Confirmation must be dismissed by explicit review/back action.
- Hardware back closes sheet first.

## Success State
Purpose:
- Show backend-accepted failed attempt and next operational step.

Content:
- Success title.
- Reason recorded.
- Attempt count.
- New delivery status.
- Receiver notification statement.
- Package custody/action statement.
- Primary next action.

Test IDs:
- `courier-failed-success-state`
- `courier-failed-success-reason`
- `courier-failed-success-attempt-count`
- `courier-failed-success-next-status`
- `courier-failed-success-next-action`

First attempt success:
- Title: `Failed attempt recorded`
- Body: `Receiver notified. This package can be reassigned for one reattempt.`
- Primary: `Return to assignments`

Second attempt success:
- Title: `Pickup flow started`
- Body: `Receiver pickup is now required. Follow return-to-station instructions.`
- Primary: `Return to station`

Refusal success:
- Title: `Issue review started`
- Body: `Receiver refusal has been recorded. Keep the package secure.`
- Primary: `Add issue details`

Package issue success:
- Title: `Issue review started`
- Body: `Package issue has been recorded. Preserve the package and add details.`
- Primary: `Add issue details`

Unsafe success:
- Title: `Safety attempt recorded`
- Body: `Move to safety and contact support if needed.`
- Primary: `Open support`

## State Model
States:
- `loading`
- `ready`
- `reason_selected`
- `checks_incomplete`
- `note_invalid`
- `wait_timer_running`
- `wait_timer_complete`
- `confirming_high_impact`
- `submitting`
- `queued_offline`
- `syncing_queued`
- `success_first_attempt`
- `success_return_to_pickup`
- `success_issue_review`
- `success_unsafe`
- `blocked_not_found`
- `blocked_permission`
- `blocked_wrong_courier`
- `blocked_custody`
- `blocked_already_delivered`
- `blocked_existing_issue`
- `blocked_already_pickup`
- `conflict`
- `network_error`
- `unknown_submit_result`
- `server_error`

## Loading State
Trigger:
- Route opens and delivery detail is being fetched.

UI:
- Skeleton header.
- Skeleton identity card.
- Skeleton reason cards.
- No submit action.

Test ID:
- `courier-failed-loading-state`

Behavior:
- If cached delivery exists, render read-only cached shell with refresh status.
- Do not allow mutation until fresh eligibility is known unless queued action comes from recovery.

## Ready State
Trigger:
- Delivery is eligible and no reason selected.

UI:
- Delivery identity.
- Reason selector.
- Empty checks card.
- Disabled submit.

Test ID:
- `courier-failed-ready-state`

Behavior:
- Autofocus should not jump into note field.
- Reason cards are first interactive form controls.

## Checks Incomplete State
Trigger:
- Reason is selected but required checks are missing.

UI:
- Missing checks highlighted.
- Submit disabled.
- Status message explains what remains.

Test ID:
- `courier-failed-checks-incomplete-state`

Accessibility:
- Announce missing check count in status region.

## Wait Timer State
Trigger:
- Reason requires wait and timer has not completed.

UI:
- Countdown timer.
- Contact attempt summary.
- Safety override action.

Test IDs:
- `courier-failed-wait-running-state`
- `courier-failed-wait-complete-state`

Behavior:
- Timer duration: `5 minutes`.
- If user selects safety override, switch to `unsafe_to_complete`.
- Do not allow receiver unavailable submission before timer completes.

## Note Invalid State
Trigger:
- Note is required or provided but violates length constraints.

UI:
- Field-level error.
- Character count.
- Submit disabled.

Test ID:
- `courier-failed-note-invalid-state`

Copy:
- Too short: `Add at least 5 characters.`
- Too long: `Keep the note within 400 characters.`
- Required: `Add a short factual note for this reason.`

## Submitting State
Trigger:
- User confirms valid failed attempt.

UI:
- Submit bar loading.
- Reason cards locked.
- Note locked.
- Status: `Recording failed attempt`

Test ID:
- `courier-failed-submitting-state`

Behavior:
- Disable all mutation exits.
- Keep support action visible only for safety reason if it does not interrupt submit.
- Use single-flight lock.
- Store pending operation key in local recovery.

## Offline Queued State
Trigger:
- User submits while offline and offline queue can preserve exactly-once semantics.

UI:
- Queued banner.
- Reason summary.
- Retry status.
- Link to offline outbox.

Test IDs:
- `courier-failed-queued-state`
- `courier-failed-outbox-link`

Rules:
- Queue only one failed-attempt action per delivery at a time.
- Queue must include reason, note, delivery version or last known status, attempt count, and created timestamp.
- Queue must include idempotency key if API client supports it.
- Queue must not submit stale action after delivery becomes delivered, issue-reported, or receiver-pickup.

If queue cannot prevent duplicate attempt count:
- Do not queue.
- Show `Connect to record this attempt`.

## Unknown Submit Result State
Trigger:
- Network times out after request may have reached backend.

UI:
- Do not show success.
- Show status: `Checking whether attempt was recorded`
- Primary action: `Refresh delivery`
- Secondary: `Open action recovery`

Test ID:
- `courier-failed-unknown-result-state`

Behavior:
- Refresh delivery detail and timeline before retry.
- If timeline contains same reason and timestamp window, treat as success.
- If attempt count increased, do not resubmit.
- If backend did not record attempt, allow retry.

## Conflict State
Trigger:
- Backend reports state/custody/assignment conflict or fresh delivery state invalidates form.

UI:
- Conflict panel.
- Latest delivery state.
- Safe next action.

Test ID:
- `courier-failed-conflict-state`

Behavior:
- Disable submit.
- Offer refresh.
- Route to assignment detail, proof, return-to-station, or support based on latest status.

## Blocked States
Not found:
- Test ID: `courier-failed-not-found-state`
- Copy: `This delivery could not be found.`

Permission denied:
- Test ID: `courier-failed-permission-denied-state`
- Copy: `Your account cannot record failed attempts.`

Wrong courier:
- Test ID: `courier-failed-wrong-courier-state`
- Copy: `This delivery is assigned to another courier.`

Custody blocked:
- Test ID: `courier-failed-custody-blocked-state`
- Copy: `You cannot record this attempt because custody is not assigned to you.`

Already delivered:
- Test ID: `courier-failed-already-delivered-state`
- Copy: `This delivery is already completed.`

Existing issue:
- Test ID: `courier-failed-existing-issue-state`
- Copy: `This delivery is already under issue review.`

Already pickup:
- Test ID: `courier-failed-already-pickup-state`
- Copy: `This package is already in receiver pickup flow.`

## Data Requirements
Read from `get_delivery`:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `receiverName`
- `receiverPhone`
- `destinationAddress`
- `destinationLandmark`
- `destinationStationId`
- `assignedFinalMileCourierId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `finalMileAttemptCount`
- `doorstepRequested`
- `paymentStatus`
- `packageDescription`
- `packageLabel`
- `latestEvent`

Read from timeline when needed:
- Prior failed-attempt event.
- Prior reason.
- Prior attempt count.
- Prior handoff event.
- Latest issue event.

Local-only state:
- Selected reason.
- Required checks.
- Contact evidence.
- Wait timer start/end.
- Note draft.
- Confirmation sheet state.
- Pending operation key.
- Offline queue state.

Mutation payload:
```json
{
  "reasonCode": "address_not_found",
  "note": "Checked saved landmark and called receiver. Could not locate safe delivery point."
}
```

Do not send:
- Raw GPS until backend supports it.
- Contact phone content.
- Photos.
- Signature.
- Receiver OTP.
- Internal queue IDs.
- Full address history.
- Device identifiers.

## Note Builder
Purpose:
- Convert structured UI checks into a concise note without exceeding 400 characters.

Format:
```text
{reason summary}. {contact/wait summary}. {location/safety/package detail}. Package remains with courier.
```

Reference notes:
- `Called receiver twice and sent SMS. Waited 5 min at blue gate. No response. Package remains with courier.`
- `Saved landmark and map do not match location. Receiver phone unreachable. Package remains with courier.`
- `Receiver refused package at gate and would not complete proof. Package remains with courier.`
- `Unsafe crowd near dropoff. Courier moved away. Package remains with courier.`
- `Package seal damaged before handoff. Delivery not completed. Package remains secure.`

Rules:
- Keep note factual.
- Avoid blame.
- Avoid private personal details not needed for operations.
- Avoid unverified claims.
- Do not include full phone number.
- Do not include full GPS coordinates until backend field exists.

## API Error Handling
| Error | User-safe message | UI action |
| --- | --- | --- |
| `VALIDATION_ERROR` | Check the reason and note. | Highlight invalid field |
| `FORBIDDEN` | You cannot record this attempt for this delivery. | Refresh or return to assignments |
| `NOT_FOUND` | This delivery could not be found. | Return to assignments |
| `CONFLICT` | Delivery state changed. | Refresh delivery |
| `RATE_LIMITED` | Too many attempts. Try again shortly. | Disable submit with countdown |
| `IDEMPOTENCY_CONFLICT` | This action may already be in progress. | Open action recovery |
| `INTERNAL_ERROR` | We could not record this attempt. | Retry or support |
| Network timeout | Result unknown. | Refresh timeline before retry |

## Offline Behavior
Offline read:
- Show cached delivery details if available.
- Mark cached status clearly.
- Allow reason and note drafting.
- Allow wait timer and contact checks.

Offline submit:
- Prefer queued write only when exactly-once recovery exists.
- If queuing is enabled, write to secure local outbox.
- If queuing is disabled for this route, require connection.

Queued write payload:
- Delivery ID.
- Selected reason.
- Note.
- Local created timestamp.
- Last known status.
- Last known attempt count.
- Actor ID.
- Idempotency key if supported.

Sync rules:
- Refresh delivery before sending queued action.
- If status is delivered, issue-reported, awaiting receiver pickup, or assigned to another courier, stop and open recovery.
- If attempt count already changed with same reason, mark resolved without resubmitting.
- If action fails validation, open action recovery.
- If action succeeds, remove queue item and refresh timeline.

## Security And Privacy
Privacy rules:
- Do not display full receiver phone number.
- Do not store call or message content.
- Do not store sensitive safety details beyond what is operationally necessary.
- Do not expose exact location in analytics.
- Do not include full address in analytics.
- Do not log note body.
- Redact note body from crash reports.
- Do not send local checklist values to analytics if they identify receiver behavior.

Security rules:
- Require authenticated staff session.
- Enforce capability gating.
- Enforce assignment and custody gating.
- Keep queued actions encrypted at rest when platform supports secure storage.
- Clear draft after success or explicit discard.
- Do not allow another user session to submit prior user's queued action.

## Accessibility
Requirements:
- Root view has accessible name `Record failed attempt`.
- Reason cards expose selected state.
- Required checks are reachable by screen reader.
- Timer updates do not steal focus.
- Submit status uses live region.
- Field errors identify invalid field.
- Consequence preview is announced after reason selection.
- Confirmation sheet traps focus until closed.
- Touch targets meet minimum size.
- Color is never the only indicator of selected, unsafe, blocked, or success state.
- All actions have clear accessible labels.

Focus order:
1. Header back action.
2. Delivery identity summary.
3. Reason selector.
4. Required checks.
5. Contact and wait evidence.
6. Note composer.
7. Consequence preview.
8. Submit action.
9. Secondary actions.

## Visual Design
Tone:
- Serious.
- Calm.
- Operational.
- Protective.
- Clear.

Color:
- Deep navy for base shell.
- Warm amber for warning and attempt state.
- Signal red for unsafe, refusal, and package issue.
- Forest green for confirmed success.
- Slate gray for neutral identity and custody.
- High-contrast white cards.

Typography:
- Strong page title.
- Compact operational labels.
- Large reason card labels.
- Monospace only for tracking code.
- No decorative type that harms field readability.

Motion:
- Reason card selection uses fast tactile transition.
- Consequence panel slides in after reason selection.
- Submit progress uses clear step status.
- Unsafe state should avoid distracting animation.
- Respect reduced motion.

## Copy System
Header:
- `Record failed attempt`

Reason helper:
- `Choose the main reason this doorstep handoff cannot complete.`

Checks helper:
- `Complete the required checks before recording the attempt.`

Safety helper:
- `If the location is unsafe, leave first. You can record the attempt from a safe place.`

Submit disabled:
- `Select a reason and complete the required checks.`

Submit in progress:
- `Recording failed attempt...`

Offline:
- `You can prepare this now. It will record only when the app can sync safely.`

Unknown result:
- `Do not submit again yet. We need to check whether the attempt was recorded.`

Success:
- `Failed attempt recorded.`

## Navigation
Route:
```text
/(ops)/courier/assignments/:deliveryId/failed-attempt
```

Expected route params:
- `deliveryId`

Optional route state:
- `source`
- `suggestedReasonCode`
- `contactAttempted`
- `arrivedAtLocation`
- `proofFailureType`
- `safetyFlag`

Back behavior:
- No edits: return to source.
- Draft edits: ask to discard or stay.
- Submitting: block back with status.
- Queued: route to offline outbox or source.
- Success: route to next operational path.

Next routes:
- Proof options: `/(ops)/courier/assignments/:deliveryId/proof`
- Return to station: `/(ops)/courier/assignments/:deliveryId/return-to-station`
- Issue create: `/(ops)/issues/create?deliveryId=:deliveryId`
- Support: `/(ops)/support?deliveryId=:deliveryId`
- Offline outbox: `/(ops)/offline-outbox`
- Action recovery: `/(ops)/action-recovery`

## Analytics
Events:
- `courier_failed_screen_viewed`
- `courier_failed_reason_selected`
- `courier_failed_check_completed`
- `courier_failed_wait_started`
- `courier_failed_wait_completed`
- `courier_failed_note_autofilled`
- `courier_failed_submit_started`
- `courier_failed_submit_succeeded`
- `courier_failed_submit_failed`
- `courier_failed_queued_offline`
- `courier_failed_unknown_result`
- `courier_failed_conflict_seen`
- `courier_failed_support_selected`
- `courier_failed_issue_create_selected`
- `courier_failed_return_to_station_selected`

Allowed properties:
- `deliveryStatus`
- `reasonCode`
- `attemptNumber`
- `resultStatus`
- `sourceScreen`
- `offlineState`
- `errorCode`

Do not include:
- Note body.
- Receiver name.
- Receiver phone.
- Full address.
- GPS.
- Contact content.
- Package value.

## QA Requirements
Functional:
- Renders root `screen-courier-failed-attempt`.
- Fetches delivery by route delivery ID.
- Blocks form for wrong courier.
- Blocks form for missing capability.
- Blocks form for missing custody.
- Shows all seven reason codes.
- Requires reason before submit.
- Requires reason-specific checks.
- Requires wait timer for receiver unavailable.
- Allows safety reason without timer.
- Enforces note length.
- Submits `reasonCode` and trimmed `note`.
- Locks submit while in flight.
- Handles first attempt success.
- Handles second attempt receiver pickup success.
- Handles refusal issue-review success.
- Handles package issue-review success.
- Handles network timeout as unknown result.
- Does not resubmit before refresh after unknown result.
- Queue behavior prevents duplicate attempts.
- Receiver notification statement appears only after backend success.

Accessibility:
- Reason cards expose selected state.
- Field errors are announced.
- Submit progress is announced.
- Timer is accessible.
- Confirmation sheet focus is trapped.
- All touch targets are large enough.

Security:
- Full receiver phone is masked.
- Note body is not logged.
- Analytics excludes private data.
- Queued action belongs to current user session.

## E2E Scenarios
Scenario: first receiver unavailable attempt.
- Courier opens from route.
- Selects `receiver_unavailable`.
- Confirms arrival.
- Calls or messages receiver.
- Waits 5 minutes.
- Adds factual note.
- Submits.
- Backend records attempt 1.
- Screen shows reassignment path.

Scenario: second address not found attempt.
- Delivery has one prior final-mile attempt.
- Courier selects `address_not_found`.
- Confirms address and contact checks.
- Adds note.
- Confirms high-impact sheet.
- Submits.
- Backend routes to receiver pickup.
- Screen routes to return-to-station.

Scenario: receiver refused.
- Courier selects `receiver_refused`.
- Confirms package secure and issue review required.
- Adds refusal note.
- Submits.
- Backend routes to issue review.
- Screen offers issue details.

Scenario: unsafe to complete.
- Courier selects `unsafe_to_complete`.
- Confirms moving to safe place.
- Adds short safety note.
- Submits without timer.
- Screen offers support.

Scenario: unknown result.
- Courier submits.
- Network times out.
- Screen enters unknown result.
- User refreshes.
- Timeline shows attempt recorded.
- Screen resolves to success without resubmitting.

## Component Handoff To Claude Code
Build this file as the canonical failed-attempt screen spec.

Primary route:
```text
/(ops)/courier/assignments/:deliveryId/failed-attempt
```

Root test ID:
```text
screen-courier-failed-attempt
```

Primary backend mutation:
```text
record_failed_attempt
```

Implementation sequence:
1. Load delivery detail.
2. Validate role, capability, assignment, custody, and status.
3. Render identity, attempt count, and custody header.
4. Render seven reason cards.
5. Render required checks based on selected reason.
6. Render contact and wait evidence.
7. Render note composer with 5-400 character validation.
8. Render consequence preview.
9. Add high-impact confirmation sheet.
10. Submit `POST /v1/deliveries/:id/final-mile-failed-attempt`.
11. Handle success path by returned status.
12. Add offline queue and unknown-result recovery.
13. Add blocked, conflict, permission, custody, and error states.
14. Add analytics with privacy restrictions.
15. Add unit, integration, E2E, accessibility, and security tests.

## Acceptance Checklist
- Screen is not a proof-capture flow.
- Screen records only the structured failed-attempt mutation.
- Reason codes exactly match backend enum.
- Note respects backend limits.
- Required checks prevent careless submission.
- Safety can bypass timer.
- Second attempt clearly routes to receiver pickup/return-to-station.
- Refusal and package issue clearly route to issue review.
- Unknown submit result never causes blind resubmit.
- Offline queue prevents duplicate attempt count.
- Courier is told what to do with the package next.
- UI never claims physical station receipt without a return scan.
- Receiver notification is described only after backend success.
- Accessibility and privacy rules are implemented.

## Open Backend Improvements
- Add structured `contactAttempts` field.
- Add structured `waitStartedAt` and `waitCompletedAt` fields.
- Add structured `gps` or `gpsUnavailable` field.
- Add structured `addressConfidence` field.
- Add structured `safetyCategory` field.
- Add structured `packageIssueCategory` field.
- Add explicit return-to-station handoff scan endpoint for failed-attempt returns.
- Align route metadata idempotency flag with implementation behavior.
- Expose attempt policy metadata to UI instead of hardcoding the 5 minute wait.
- Expose receiver notification delivery status after failed attempt.

## Final Standard
This screen is complete when:
- A courier can truthfully record any supported failed-attempt reason.
- The app prevents accidental duplicate failed attempts.
- The app protects courier safety.
- The app protects package custody.
- The app gives the next operational step immediately.
- The app reflects backend policy without inventing completion or station receipt.
- The app is ready for serious field operations across African delivery conditions.

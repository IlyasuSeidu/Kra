# CourierReturnToStation Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierReturnToStation` |
| Route | `/(ops)/courier/assignments/:deliveryId/return-to-station` |
| Primary test ID | `screen-courier-return-to-station` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `get_delivery_timeline`, `record_failed_attempt` only via handoff from failed-attempt flow, `create_issue` for blocked return escalation |
| Offline critical | Yes for cached route guidance and blocked-return draft; no for confirmed return custody |
| Required role | `final_mile_courier` |
| Required capability | `record_failed_attempt` for return cause workflow, `create_issue` when escalation is submitted |
| Primary backend reality | No dedicated courier return-to-station confirmation endpoint exists yet |
| Parent screens | `CourierFailedAttempt`, `CourierRoute`, `CourierAssignmentDetail`, `CourierProofCapture`, `OpsActionRecovery` |
| Recovery workflows | `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/issues/create`, `/(ops)/support`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Return guidance, custody warning, destination-station routing, issue escalation, and pending-return handoff state |

## Outcome
`CourierReturnToStation` tells the final-mile courier exactly how to bring a package back to the destination station after a failed final-mile delivery path, without falsely marking the return handoff complete.

The screen must answer:
- `Why am I returning this package?`
- `Which station should I return to?`
- `Is the package still in my physical custody?`
- `What should I do if I cannot return now?`
- `What does backend already say about failed attempt status?`
- `Has the receiver pickup or issue-review path started?`
- `What does the station operator need to verify?`
- `Can I safely navigate while offline?`
- `What must not be claimed before a station scan?`

This is a custody-protection screen. It must keep courier accountability clear until the package is physically handed back to station operations.

## Product Definition
This screen is the courier-side return guidance flow after final-mile failure.

It allows couriers to:
- Understand the return reason.
- See whether the package moved to receiver pickup, issue review, or reattempt queue.
- Navigate back to the destination station.
- Keep package custody obligations visible.
- Prepare station handoff details.
- Open support when return is unsafe or blocked.
- Create an operational issue if return cannot proceed.
- Recover from stale state or offline conditions.

It does not allow couriers to:
- Confirm station receipt.
- Complete delivery.
- Create proof of delivery.
- Create a return handoff event.
- Override failed-attempt policy.
- Mark the package as physically received by station staff.
- Reassign the package.
- Close an issue-review workflow.
- Decide refunds.
- Decide return-to-sender.

## Users
Primary:
- Final-mile couriers who must bring a package back after a failed doorstep attempt, refusal, unsafe location, proof failure, or package issue.

Secondary:
- Station operators expecting the package.
- Support staff handling blocked returns.
- Operations leads reviewing custody risk.
- Receivers who may switch to pickup flow.
- Senders who need reliable status.

## Entry Points
The screen can open from:
- `CourierFailedAttempt` after second non-issue attempt.
- `CourierFailedAttempt` after receiver refusal.
- `CourierFailedAttempt` after package issue detected.
- `CourierRoute` when return is required by local action recovery.
- `CourierAssignmentDetail` when backend status indicates pickup or issue path.
- `OpsActionRecovery` after a failed or uncertain failed-attempt submission.
- `OpsOfflineOutbox` after a queued failed-attempt write syncs.

## Real-World Context
The courier may be far from the station, low on battery, offline, in traffic, or dealing with a package that now requires issue review. The station may be closing soon. The receiver may call after the failed attempt. The courier may still physically hold the package even though backend status has already moved out of the courier assignment.

The screen must avoid a dangerous mismatch:
- Backend may show the package back in station or pickup flow after `record_failed_attempt`.
- Physical package may still be with the courier until actual station handoff.
- The UI must keep the physical custody warning visible.

## User Goal
Primary goal:
- Return the package to the correct destination station or escalate if return is blocked.

Secondary goals:
- Know the package's next backend path.
- Avoid losing package custody evidence.
- Prevent false station receipt claims.
- Preserve offline guidance.
- Escalate safety, damage, closure, or access issues.

## Scope
In scope:
- Return reason summary.
- Destination station return guidance.
- Physical custody warning.
- Backend status explanation.
- Return checklist.
- Station arrival instructions.
- Blocked return issue escalation.
- Offline cached route support.
- Timeline refresh.
- Action recovery for uncertain failed-attempt state.

Out of scope:
- Station receipt confirmation.
- Station-side package scan.
- New lifecycle mutation for return handoff.
- Receiver pickup completion.
- Return-to-sender creation.
- Refund adjudication.
- Admin issue decision.
- Courier earnings settlement.

## Design Thesis
This screen should feel like a secure custody mission card, not a generic navigation page.

It must be:
- Clear about the package still being the courier's responsibility.
- Direct about the destination station.
- Honest about backend gaps.
- Fast to use in transit.
- Strong on blocked-return escalation.
- Clean enough for one-handed use.
- Serious enough for dispute-grade operations.

## Research Inputs
Relevant external references:
- [Uber Direct delivery status webhook](https://developer.uber.com/docs/deliveries/daas/references/api/webhooks/delivery-status-webhook): supports explicit returned and undeliverable status concepts, return job relationships, and return workflow visibility.
- [DHL eCommerce undeliverable shipments](https://www.dhl.com/us-en/home/ecommerce/business-help-center/undeliverable-shipments.html): supports treating incomplete, incorrect, refused, or undeliverable shipments as return-handling cases that move back into facility processing.
- [UPS Delivery Notice](https://www.ups.com/us/en/support/tracking-support/where-is-my-package/how-to-use-infonotice): supports final-attempt consequences, pickup-location holding, and return handling after unsuccessful delivery attempts.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached reads, queued writes, conflict handling, and clear offline write restrictions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing route status, cached/offline state, return risk, issue submission, and refresh outcome without unexpected focus changes.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field-level errors for blocked-return issue details.

Internal references:
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/08-courier-route.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/17-station-handoff-log.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/06-technical/api-contracts.md`
- `docs/06-technical/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/handoffs.ts`

## Backend Contract Reality
There is no dedicated endpoint like:
```http
POST /v1/deliveries/:id/final-mile-return
```

There is no courier-side request schema for:
- Return package scan.
- Station operator acknowledgement.
- Return condition.
- Return handoff proof.
- Return arrival timestamp.
- Return custody actor.

Existing relevant backend behavior:
- `record_failed_attempt` writes failed-attempt metadata.
- `record_failed_attempt` increments `finalMileAttemptCount`.
- `record_failed_attempt` may set status to `awaiting_receiver_pickup`.
- `record_failed_attempt` may set status to `issue_reported`.
- `record_failed_attempt` clears assigned final-mile courier.
- `record_failed_attempt` creates a handoff event from final-mile courier to destination station.

Critical UX rule:
- The UI must not treat that backend handoff event as physical package receipt unless a station-side scan or future return endpoint verifies it.

Allowed mutation from this screen:
- `create_issue` only when return is blocked, unsafe, delayed, station inaccessible, package condition worsens, or custody state conflicts.

Not allowed from this screen:
- Calling `record_failed_attempt` again after `CourierFailedAttempt` already succeeded.
- Calling `complete_delivery`.
- Calling proof asset endpoints.
- Calling station receipt endpoints.
- Marking return handoff complete locally.

## Eligibility Rules
Render normal return guidance when:
- Delivery exists.
- User is authenticated.
- User role is `final_mile_courier`.
- Delivery has a failed-attempt or issue-return context.
- Delivery destination station is known.
- Delivery is not delivered.
- Delivery is not closed.
- App has enough cached or fresh data to show the correct station.

Show blocked or recovery state when:
- Delivery is not found.
- User lacks staff session.
- Delivery is already delivered.
- Delivery is already closed.
- Failed attempt result is unknown.
- Destination station is missing.
- Package status conflicts with route state.
- Delivery has been reassigned to another courier.

## Return Contexts
`second_failed_attempt_pickup`:
- Current status is `awaiting_receiver_pickup`.
- Prior failed-attempt count is at least `2`.
- Non-issue reason caused receiver pickup path.
- Primary next step is return to destination station.

`receiver_refused_issue`:
- Current status is `issue_reported`.
- Failed-attempt reason is `receiver_refused`.
- Primary next step is return package and add issue context if needed.

`package_issue_detected`:
- Current status is `issue_reported`.
- Failed-attempt reason is `package_issue_detected`.
- Primary next step is protect package condition and return for station review.

`unsafe_return_needed`:
- Failed-attempt reason is `unsafe_to_complete`.
- Courier may need support before returning.
- Primary next step is move safely, then return or support.

`unknown_failed_attempt_result`:
- Failed-attempt submission timed out.
- App must refresh delivery and timeline before showing return instructions as final.

`manual_support_return`:
- Support or station instructed return.
- No dedicated backend field exists.
- UI must show support-linked issue context if available.

## Consequence Language
Allowed phrases:
- `Return required`
- `Bring package to destination station`
- `Station handoff pending`
- `Package still needs physical handoff`
- `Receiver pickup path started`
- `Issue review started`
- `Return cannot be confirmed in this screen`

Forbidden phrases:
- `Package returned`
- `Station received`
- `Return complete`
- `Custody transferred`
- `Handoff confirmed`
- `Receiver pickup ready at station`

Exception:
- These phrases are allowed only if a future station-side scan or return endpoint returns explicit confirmation.

## Information Architecture
Top-to-bottom order:
- Header with return status, station, custody, and network chips.
- Critical custody banner.
- Return reason summary.
- Destination station card.
- Route and arrival guidance.
- Package protection checklist.
- Station handoff readiness.
- Blocked return escalation.
- Timeline and refresh panel.
- Bottom action bar.

## Layout
Mobile portrait:
- Sticky header.
- Full-width custody banner.
- Station card near top.
- Checklist and instructions below.
- Sticky bottom actions.

Mobile landscape:
- Left column: status, station, route.
- Right column: checklist, issue escalation, timeline.

Small devices:
- Keep station and custody banner above fold.
- Collapse timeline by default.
- Keep support and issue actions visible.

## Component 1: Header
Purpose:
- Make the return mission clear.

Content:
- Title: `Return to station`
- Subtitle: destination station or safe station label.
- Status chip: backend status.
- Custody chip: `Physical handoff pending`.
- Attempt chip: latest failed-attempt count when known.
- Network chip.
- Back action.

Test IDs:
- `courier-return-header`
- `courier-return-back-action`
- `courier-return-status-chip`
- `courier-return-custody-chip`
- `courier-return-attempt-chip`
- `courier-return-network-chip`

Behavior:
- Header must not say return complete.
- If status is stale, show `Needs refresh`.
- If offline, show cached timestamp.

## Component 2: Custody Banner
Purpose:
- Keep physical custody accountability visible.

Content:
- Title: `Keep package with you until station staff scan or accept it`
- Body: `This screen guides the return. It does not confirm station receipt.`
- Risk level.

Test IDs:
- `courier-return-custody-banner`
- `courier-return-custody-title`
- `courier-return-custody-body`
- `courier-return-custody-risk`

Behavior:
- Always visible until confirmed by a future backend field.
- If delivery status says `awaiting_receiver_pickup`, still show physical handoff pending.
- If timeline lacks return evidence, elevate warning.

## Component 3: Return Reason Summary
Purpose:
- Show why return is required.

Content:
- Latest failed-attempt reason.
- Attempt count.
- Current backend status.
- Receiver notification state if known.
- Issue state if relevant.

Test IDs:
- `courier-return-reason-card`
- `courier-return-reason-code`
- `courier-return-attempt-count`
- `courier-return-current-status`
- `courier-return-notification-copy`
- `courier-return-issue-state`

Reason copy:
- `receiver_unreachable`: `Receiver could not be reached.`
- `receiver_unavailable`: `Receiver was unavailable at the location.`
- `address_not_found`: `Address could not be safely located.`
- `unsafe_to_complete`: `Location was unsafe to complete.`
- `receiver_refused`: `Receiver refused package or proof.`
- `proof_failed`: `Required proof could not be completed.`
- `package_issue_detected`: `Package issue blocked handoff.`

Behavior:
- If reason is unknown, show `Return reason needs refresh`.
- If failed-attempt result is unknown, route user to action recovery.
- If no failed-attempt exists, route to `CourierFailedAttempt`.

## Component 4: Destination Station Card
Purpose:
- Show where the package should return.

Content:
- Destination station display name if returned.
- Destination station ID.
- Station address if returned.
- Station operating status if returned.
- Station contact if returned.
- Last known station queue status if returned.

Test IDs:
- `courier-return-station-card`
- `courier-return-station-name`
- `courier-return-station-id`
- `courier-return-station-address`
- `courier-return-station-hours`
- `courier-return-station-contact`

Behavior:
- If only station ID exists, show station ID and avoid inventing name/address.
- If station status is unavailable, show support and issue action.
- If station hours are not returned, do not show hours.
- If station location is not returned, offer generic navigation handoff only if route data exists.

## Component 5: Route Guidance
Purpose:
- Help courier get back to station safely.

Content:
- `Open navigation`
- `Call station` when safe contact exists.
- `Copy station code`
- Offline map availability if cached.
- Return priority.

Test IDs:
- `courier-return-route-card`
- `courier-return-open-navigation-action`
- `courier-return-call-station-action`
- `courier-return-copy-station-code-action`
- `courier-return-offline-map-state`

Behavior:
- Use only returned station location data.
- If no coordinates/address exists, show station ID and support action.
- If offline, show cached route only with timestamp.
- Do not start external navigation to an invented location.
- Returning to route source should preserve return progress.

## Component 6: Package Protection Checklist
Purpose:
- Prevent damage, loss, or weak dispute evidence while returning.

Checklist:
- `Package remains sealed or issue is recorded`
- `Package label is visible`
- `Package is kept with courier`
- `Do not leave package unattended`
- `Report damage, theft risk, or station access problem`

Test IDs:
- `courier-return-protection-card`
- `courier-return-check-seal`
- `courier-return-check-label`
- `courier-return-check-with-courier`
- `courier-return-check-not-unattended`
- `courier-return-check-report-problem`

Behavior:
- Checklist does not submit to backend unless issue is created.
- Required only before opening station handoff instructions.
- If package condition worsens, prompt issue creation.

## Component 7: Station Handoff Readiness
Purpose:
- Prepare courier for the station-side receipt step.

Content:
- Package tracking code.
- Package label scan reminder.
- Destination station ID.
- Failed-attempt reason.
- Attempt count.
- Message: `Ask station operator to scan and verify the package.`

Test IDs:
- `courier-return-handoff-card`
- `courier-return-handoff-tracking-code`
- `courier-return-handoff-scan-reminder`
- `courier-return-handoff-station-id`
- `courier-return-handoff-attempt-summary`

Behavior:
- Shows `handoff pending` status only.
- Does not render a confirm button.
- Does not ask courier to scan as station operator.
- Links to support if station operator cannot accept package.

## Component 8: Blocked Return Escalation
Purpose:
- Let courier escalate when return cannot proceed.

Blocked reasons:
- Station closed.
- Station inaccessible.
- Route unsafe.
- Package damaged after failed attempt.
- Courier vehicle issue.
- Package lost or theft risk.
- Backend state conflict.
- Station refuses handoff.
- Other operational blocker.

Fields:
- Blocked reason.
- Short note.
- Optional urgency flag.

Test IDs:
- `courier-return-blocked-card`
- `courier-return-blocked-reason`
- `courier-return-blocked-note`
- `courier-return-blocked-urgent-toggle`
- `courier-return-create-issue-action`

Behavior:
- Requires `create_issue` capability.
- Note is required for blocked return.
- If offline, issue draft can queue only if ops issue queue supports conflict recovery.
- If urgent safety, show support action above issue submission.

## Component 9: Timeline Refresh Panel
Purpose:
- Reconcile backend state before and after return guidance.

Content:
- Latest failed-attempt event.
- Latest status event.
- Latest handoff event.
- Refresh action.
- Stale warning.

Test IDs:
- `courier-return-timeline-panel`
- `courier-return-latest-failed-attempt`
- `courier-return-latest-status`
- `courier-return-latest-handoff`
- `courier-return-refresh-action`

Behavior:
- If timeline shows delivery completed, block return and show conflict.
- If timeline shows reassigned, block return and show support.
- If timeline shows issue review, keep return guidance with issue action.
- If timeline is unavailable, show conservative custody guidance.

## Bottom Action Bar
Primary actions by state:
- Fresh return required: `Open navigation`
- No station route: `Contact support`
- Return blocked: `Create issue`
- Unknown failed attempt result: `Open recovery`
- Issue review: `Add issue details`
- Pickup path: `Return to station`

Secondary actions:
- `Refresh`
- `View assignment`
- `View timeline`
- `Open support`

Test IDs:
- `courier-return-action-bar`
- `courier-return-primary-action`
- `courier-return-refresh-secondary`
- `courier-return-assignment-secondary`
- `courier-return-timeline-secondary`
- `courier-return-support-secondary`

## State Model
States:
- `loading`
- `ready_return_required`
- `ready_issue_return`
- `ready_pickup_return`
- `station_data_limited`
- `offline_cached`
- `return_blocked_draft`
- `issue_submitting`
- `issue_queued`
- `issue_submitted`
- `unknown_failed_attempt_result`
- `blocked_no_failed_attempt`
- `blocked_delivered`
- `blocked_closed`
- `blocked_reassigned`
- `blocked_missing_station`
- `blocked_permission`
- `conflict`
- `error`

## Loading State
Trigger:
- Route opens and delivery detail/timeline is loading.

UI:
- Header skeleton.
- Station card skeleton.
- Custody banner skeleton.
- No confirm action.

Test ID:
- `courier-return-loading-state`

Behavior:
- If cached delivery exists, render cached shell with stale banner.

## Ready Return Required State
Trigger:
- Delivery status and timeline indicate return should proceed.

UI:
- Custody banner.
- Return reason.
- Destination station.
- Route guidance.
- Package protection checklist.
- Handoff readiness.

Test ID:
- `courier-return-ready-state`

Behavior:
- Primary action opens navigation when station location exists.
- If station location missing, primary action opens support.
- Handoff card remains pending.

## Station Data Limited State
Trigger:
- Destination station ID exists but name/address/contact/hours are not returned.

UI:
- Station ID only.
- Support action.
- Warning: `Station details are limited.`

Test ID:
- `courier-return-station-limited-state`

Behavior:
- Do not invent station address.
- Do not show map route.
- Permit support and issue actions.

## Offline Cached State
Trigger:
- App is offline and has cached delivery/station context.

UI:
- Offline banner.
- Cached timestamp.
- Cached station details.
- No return confirmation.
- Issue draft if available.

Test ID:
- `courier-return-offline-state`

Behavior:
- Open cached navigation only if cached station location is present.
- Show `Confirm handoff with station when online` only as instruction, not status.
- Queue issue only with safe local outbox.

## Unknown Failed Attempt Result State
Trigger:
- User came from an uncertain failed-attempt submission.

UI:
- Warning: `Check whether the failed attempt was recorded before returning.`
- Primary: `Open action recovery`
- Secondary: `Refresh delivery`

Test ID:
- `courier-return-unknown-attempt-state`

Behavior:
- Do not show final return path until detail/timeline confirms status.
- Do not call `record_failed_attempt` here.

## Return Blocked Draft State
Trigger:
- User selects a blocked-return reason.

UI:
- Blocked reason form.
- Required note.
- Support action.
- Create issue action.

Test ID:
- `courier-return-blocked-draft-state`

Behavior:
- Keep return guidance visible behind the escalation card.
- If safety is urgent, support action is first.

## Issue Submitted State
Trigger:
- `create_issue` succeeds.

UI:
- Issue created confirmation.
- Issue ID if returned.
- Next action: support, assignment detail, or station route.

Test ID:
- `courier-return-issue-submitted-state`

Behavior:
- Does not change custody status.
- Does not say return complete.

## Blocked States
No failed attempt:
- Test ID: `courier-return-no-failed-attempt-state`
- Copy: `Record the failed attempt before returning to station.`
- Primary: `Record failed attempt`

Delivered:
- Test ID: `courier-return-delivered-state`
- Copy: `This delivery is already completed.`

Closed:
- Test ID: `courier-return-closed-state`
- Copy: `This delivery is closed.`

Reassigned:
- Test ID: `courier-return-reassigned-state`
- Copy: `This delivery has been reassigned. Refresh before moving the package.`

Missing station:
- Test ID: `courier-return-missing-station-state`
- Copy: `Destination station details are missing. Contact support before returning.`

Permission:
- Test ID: `courier-return-permission-state`
- Copy: `Your account cannot manage this return path.`

Conflict:
- Test ID: `courier-return-conflict-state`
- Copy: `Delivery state changed. Refresh and follow the latest instruction.`

## Data Requirements
Read from `get_delivery`:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `receiverName`
- `destinationStationId`
- `assignedFinalMileCourierId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `finalMileAttemptCount`
- `packageDescription`
- `packageLabel`
- `latestEvent`
- station display fields only if returned

Read from `get_delivery_timeline`:
- Latest failed-attempt event.
- Latest failed-attempt reason.
- Latest failed-attempt count.
- Latest issue event.
- Latest handoff event.
- Latest status event.

Local-only:
- Return checklist state.
- Blocked-return reason.
- Blocked-return note.
- Cached route context.
- Issue draft.
- Last refresh timestamp.

Create issue payload:
```json
{
  "deliveryId": "DEL-0001",
  "category": "delivery_exception",
  "description": "Station inaccessible after failed attempt return. Courier still has package."
}
```

Do not send:
- Local checklist without issue.
- Unverified station receipt.
- Receiver phone.
- Full receiver address in analytics.
- Courier exact GPS unless future backend supports safe location fields.

## Offline Behavior
Offline read:
- Show cached delivery and station details.
- Label data as cached.
- Show last sync time.
- Keep custody warning visible.

Offline navigation:
- Use cached station location only if previously verified.
- If not cached, instruct courier to reconnect or contact support.

Offline issue:
- Queue blocked-return issue only if shared issue outbox supports retry and conflict handling.
- Otherwise save draft and require reconnect before submit.

Offline return confirmation:
- Not supported.
- There is no endpoint to confirm return in this screen.

## Security And Privacy
Rules:
- Do not expose receiver phone unless already allowed in courier detail context and masked where possible.
- Do not show sender private data.
- Do not log route or note contents.
- Do not include full address in analytics.
- Do not claim station acceptance from local state.
- Do not let another user submit a saved issue draft.
- Clear blocked-return draft after issue is submitted or discarded.

## Accessibility
Requirements:
- Root view accessible name is `Return to station`.
- Custody warning is announced before route actions.
- Station card labels station ID and unknown fields clearly.
- Offline/stale state uses status message.
- Issue form errors identify the missing field.
- Support and navigation actions have clear labels.
- All touch targets meet minimum size.
- Color is not the only indicator for custody warning, blocked return, or issue state.

Focus order:
1. Back action.
2. Header status.
3. Custody banner.
4. Return reason.
5. Station card.
6. Route action.
7. Package protection checklist.
8. Handoff readiness.
9. Blocked return escalation.
10. Timeline refresh.
11. Bottom action bar.

## Visual Design
Tone:
- Operational.
- High-trust.
- Protective.
- Non-alarmist.
- Direct.

Color:
- Deep teal for return mission state.
- Amber for physical handoff pending.
- Red for blocked or unsafe return.
- Green only for submitted issue or future confirmed handoff.
- Slate for station details.

Typography:
- Large mission title.
- Strong custody warning.
- Compact station details.
- Tracking code in monospaced token style.

Motion:
- Custody banner should appear immediately.
- Route card can slide into view after station data loads.
- Issue drawer opens from bottom.
- Respect reduced motion.

## Copy System
Header:
- `Return to station`

Custody banner:
- `Keep package with you until station staff scan or accept it.`

Station card helper:
- `Use the destination station from this delivery. Do not return to another station unless support instructs you.`

Handoff readiness:
- `Ask station operator to scan and verify this package. This screen does not confirm station receipt.`

Offline:
- `Using cached return details. Confirm with station staff before leaving the package.`

Blocked return:
- `If you cannot return now, create an issue and keep the package secure.`

Unknown result:
- `Check the failed attempt result before returning.`

## Navigation
Route:
```text
/(ops)/courier/assignments/:deliveryId/return-to-station
```

Expected params:
- `deliveryId`

Optional route state:
- `source`
- `failedAttemptReason`
- `attemptCount`
- `returnContext`
- `issueId`
- `fromActionRecovery`

Next routes:
- Failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- Assignment detail: `/(ops)/courier/assignments/:deliveryId`
- Issue create: `/(ops)/issues/create?deliveryId=:deliveryId`
- Support: `/(ops)/support?deliveryId=:deliveryId`
- Offline outbox: `/(ops)/offline-outbox`
- Action recovery: `/(ops)/action-recovery`

Back behavior:
- From failed-attempt success: back returns to failed-attempt result unless user chooses assignment.
- From action recovery: back returns to recovery.
- With issue draft: ask to keep draft or discard.
- During issue submit: block back until result is known.

## Analytics
Events:
- `courier_return_screen_viewed`
- `courier_return_context_resolved`
- `courier_return_navigation_opened`
- `courier_return_station_details_limited`
- `courier_return_check_completed`
- `courier_return_blocked_reason_selected`
- `courier_return_issue_submit_started`
- `courier_return_issue_submit_succeeded`
- `courier_return_issue_submit_failed`
- `courier_return_unknown_attempt_seen`
- `courier_return_refresh_selected`
- `courier_return_support_selected`

Allowed properties:
- `deliveryStatus`
- `returnContext`
- `attemptCount`
- `hasStationLocation`
- `offlineState`
- `blockedReason`
- `errorCode`

Do not include:
- Receiver name.
- Receiver phone.
- Full address.
- Issue note text.
- GPS.
- Tracking code unless analytics policy permits hashed identifiers.

## QA Requirements
Functional:
- Renders root `screen-courier-return-to-station`.
- Loads delivery by route ID.
- Loads timeline when available.
- Shows custody banner in every non-terminal state.
- Does not show return complete.
- Does not show station received.
- Shows return reason from timeline when available.
- Shows `Record failed attempt` route when no failed attempt exists.
- Shows station ID when station display data is limited.
- Does not invent station address or hours.
- Opens navigation only with station location data.
- Shows issue escalation for blocked return.
- Creates issue when blocked return is submitted.
- Queues issue only when issue outbox supports recovery.
- Handles offline cached station details.
- Handles unknown failed-attempt result by routing to recovery.
- Blocks delivered and closed deliveries.
- Blocks reassigned delivery until refresh.

Accessibility:
- Custody banner announced before actions.
- Offline status announced.
- Issue form errors announced.
- Station limited state is clear to screen reader.
- Bottom actions have clear accessible names.

Security:
- Does not log issue note.
- Does not expose receiver private fields in analytics.
- Does not allow local return confirmation.
- Does not submit issue draft from a different signed-in user.

## E2E Scenarios
Scenario: second failed attempt return.
- Failed attempt result returns `awaiting_receiver_pickup`.
- Courier opens return screen.
- Custody banner is visible.
- Station card shows destination station.
- Courier opens navigation.
- Handoff card says station scan is required.

Scenario: receiver refusal return.
- Failed attempt result returns `issue_reported`.
- Courier opens return screen.
- Reason summary shows receiver refused.
- Screen offers issue details and support.
- No return-complete message appears.

Scenario: station details limited.
- Delivery has destination station ID only.
- Screen shows station ID.
- Navigation is disabled.
- Support action is primary.

Scenario: return blocked by station closure.
- Courier selects station closed.
- Adds note.
- Creates issue.
- Screen confirms issue submitted.
- Custody warning remains visible.

Scenario: unknown failed-attempt result.
- Action recovery opens return screen.
- Timeline has not confirmed failed attempt.
- Screen blocks return instructions.
- Primary action opens action recovery.

## Component Handoff To Claude Code
Build this as a return guidance and custody-protection screen, not as a return confirmation screen.

Primary route:
```text
/(ops)/courier/assignments/:deliveryId/return-to-station
```

Root test ID:
```text
screen-courier-return-to-station
```

Implementation sequence:
1. Load delivery detail.
2. Load timeline where available.
3. Resolve return context from status, failed-attempt event, issue event, and route state.
4. Render custody banner before route actions.
5. Render destination station card using only returned station fields.
6. Render route guidance when station location exists.
7. Render package protection checklist.
8. Render handoff readiness with pending status only.
9. Render blocked-return escalation using `create_issue`.
10. Add offline cached guidance.
11. Add unknown failed-attempt recovery.
12. Add blocked, conflict, delivered, closed, missing station, and limited station states.
13. Add analytics with privacy restrictions.
14. Add unit, integration, E2E, accessibility, and security tests.

## Acceptance Checklist
- Screen never confirms station receipt.
- Screen never marks return complete.
- Screen never calls delivery completion.
- Screen never uploads proof assets.
- Screen routes missing failed attempt back to failed-attempt flow.
- Screen shows custody warning in every active return state.
- Screen uses only backend-returned station data.
- Screen handles second failed attempt pickup path.
- Screen handles refusal and package issue paths.
- Screen can create issue for blocked return.
- Screen handles offline cached guidance safely.
- Screen protects receiver and route privacy.
- Screen clearly tells courier to get station operator scan or acceptance.

## Open Backend Improvements
- Add courier return-to-station endpoint.
- Add station operator return receipt scan endpoint if not covered by future scan workflow.
- Add explicit return handoff event with package scan, condition, station actor, and timestamp.
- Add station location and operating-hours endpoint for courier-safe return guidance.
- Add return issue category in `create_issue`.
- Add receiver/sender notification event for confirmed physical return.
- Reconcile failed-attempt backend handoff event with physical station receipt truth.

## Final Standard
This screen is complete when:
- The courier knows exactly where to bring the package.
- The courier sees that physical custody remains pending.
- The courier can escalate blocked return without hiding custody risk.
- The app does not invent station receipt.
- The app works with cached data without claiming backend truth.
- The app is ready for serious failed-delivery operations in African final-mile conditions.

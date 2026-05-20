# CourierCustodyAccepted Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierCustodyAccepted` |
| Route | `/(ops)/courier/assignments/:deliveryId/custody-accepted` |
| Primary test ID | `screen-courier-custody-accepted` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `accept_final_mile_assignment` response plus refreshed `get_delivery` detail |
| Offline critical | Yes, read confirmed custody receipt from cache, but never invent confirmation while sync is pending |
| Required role | `final_mile_courier` |
| Source mutation | `POST /v1/deliveries/:id/accept-final-mile-assignment` through route key `accept_final_mile_assignment` |
| Source response schema | `deliveryLifecycleResponseSchema` |
| Next workflow | `/(ops)/courier/assignments/:deliveryId/out-for-delivery` |
| Related routes | `/(ops)/courier/assignments/:deliveryId`, `/(ops)/courier/assignments/:deliveryId/accept-scan`, `/(ops)/courier/assignments/:deliveryId/out-for-delivery`, `/(ops)/courier/assignments/:deliveryId/route`, `/(ops)/courier/issues`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Server-confirmed custody receipt with accountability, next-step guidance, offline authority labels, and blocked-state recovery |

## Product Job
`CourierCustodyAccepted` is the courier's handoff receipt after destination-station to final-mile custody transfer.

It answers seven operational questions:

- `Did the server confirm this custody transfer?`
- `Who is accountable for the package now?`
- `Which event proves the handoff happened?`
- `What status is the delivery still in?`
- `What is the next safe action?`
- `Can the courier leave the station yet?`
- `What should happen if the confirmation is missing, stale, or contradicted by refreshed data?`

The screen must give the courier and station staff a clear, auditable moment where the package is now in courier custody, without pretending that the package is already out for delivery.

## Product Standard
This screen is a custody receipt, not a celebration page.

The courier should be able to:

- See a server-confirmed acceptance state.
- See the delivery reference.
- See the handoff event ID.
- See the server confirmation time.
- See that current custody is the courier.
- Understand that the next workflow is to start final-mile travel.
- Understand that status may still be `assigned_for_final_mile`.
- Confirm whether fallback acceptance was used when that context is available.
- Open the next `CourierOutForDelivery` workflow.
- Return to assignment detail without losing the confirmed custody receipt.
- Open support if station staff or app state disagrees with the receipt.

The screen must never:

- Show confirmed custody without a successful server response or refreshed delivery custody state.
- Mark the delivery as `out_for_delivery`.
- Call `mark_out_for_delivery` directly from this screen.
- Show raw package scan code.
- Show receiver OTP.
- Show receiver phone.
- Show proof asset references.
- Show a route map.
- Treat queued offline acceptance as confirmed.
- Hide accountability language.
- Use vague success copy that does not say who now holds custody.

## Audience
Primary audience:

- Final-mile couriers who have just accepted package custody from a destination station.

Secondary audience:

- Destination station staff watching the transfer complete.
- Station supervisors handling fallback acceptance.
- Support staff reviewing disputed or duplicated handoff claims.
- QA validating state authority, route handoff, and offline behavior.
- Security reviewers validating redaction of package scan evidence.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may open this screen:

- Immediately after `CourierAcceptAssignmentScan` receives a successful response.
- After background sync confirms a previously queued acceptance.
- From assignment detail when delivery custody already belongs to the courier.
- After app restart if the last confirmed custody receipt was cached.
- After support asks the courier to prove acceptance.

The courier may still be inside the station, outside the station entrance, at a loading area, or preparing transport. The UI must work as a receipt that can be shown quickly without leaking receiver-sensitive data.

## Design Brief
User and job:

- A verified final-mile courier needs proof that custody moved to them and guidance for the next safe step.

Surface type:

- Mobile confirmation and receipt screen.

Primary action:

- Continue to `CourierOutForDelivery`.

Visual thesis:

- `Stamped custody receipt`: a precise, official, low-noise receipt with a strong accountability seal, event metadata, and one dominant next action.

Restraint rule:

- Do not add scanner, proof capture, route map, earnings, or receiver-contact controls. This page confirms custody and routes forward.

Density:

- Medium-low. The page should be scannable in under five seconds but still audit-complete.

Platform stance:

- Native-plus mobile receipt with sticky action footer, clear status authority, strong visual seal, and accessible state announcements.

## External Research Used
Only directly relevant links were used:

- [DoorDash merchant-to-dasher pickup verification](https://help.doordash.com/en-ca/dashers/article/merchant-to-dasher-pickup-verification): supports scan-based pickup confirmation, retry on wrong code, manual entry fallback, and support escalation when pickup cannot be confirmed.
- [Uber delivering using the Driver app](https://www.uber.com/us/en/deliver/basics/making-deliveries/how-to-deliver/): supports matching physical order details to app details, step-by-step pickup and dropoff progression, and in-trip support access.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports explicit local state, synchronization, and clear handling of online and offline data authority.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing confirmation, pending sync, and recovery states without forcing focus changes.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation from receipt status to event metadata to next action.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large action targets for station-counter and one-handed use.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/04-courier-assignment-detail.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/05-courier-accept-assignment-scan.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/package-statuses.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/routes.ts`

## Backend Contract
The source mutation is:

```http
POST /v1/deliveries/:id/accept-final-mile-assignment
```

Route key:

```text
accept_final_mile_assignment
```

Required capability:

```text
accept_final_mile_assignment
```

Source response:

```json
{
  "eventId": "EVT-DEL-ACCEPTED-001",
  "deliveryId": "DEL-6001",
  "status": "assigned_for_final_mile",
  "paymentStatus": "paid",
  "occurredAt": "2026-05-20T10:30:00.000Z"
}
```

Important backend fact:

- Acceptance records custody and handoff evidence.
- Acceptance does not have to change canonical delivery status away from `assigned_for_final_mile`.
- `out_for_delivery` is a separate later transition through `mark_out_for_delivery`.

Successful acceptance writes:

- Delivery event type `final_mile_assignment_accepted`.
- `currentCustodyRole: final_mile_courier`.
- `currentCustodyActorId` equal to the courier actor ID.
- Handoff type `destination_station_to_final_mile_courier`.
- Handoff proof type `package_scan`.
- Handoff proof fallback flag when fallback was used.
- Handoff proof supervisor override actor ID when present.

Next mutation is not performed here:

```http
POST /v1/deliveries/:id/out-for-delivery
```

Next route key:

```text
mark_out_for_delivery
```

This screen may route to the out-for-delivery screen, but it must not call that mutation itself.

## Custody Semantics
The confirmation is valid only when one of these conditions is true:

- The current navigation state contains a successful `deliveryLifecycleResponseSchema` from `accept_final_mile_assignment`.
- A refreshed delivery detail shows `currentCustodyRole=final_mile_courier` and `currentCustodyActorId` equal to the current courier.
- A secure local receipt exists from an already confirmed server response and is not contradicted by refreshed server data.

The confirmation is not valid when:

- The accept-scan mutation is queued offline.
- The outbox row is still waiting.
- The delivery detail says another actor holds custody.
- The delivery detail is missing custody fields.
- The delivery has been reassigned.
- The route was opened without a delivery ID.
- The courier session is expired.

Confirmed custody means:

- The courier is accountable for the package.
- The station has evidence that the package was released to the courier.
- The package can proceed to the final-mile trip start workflow.

Confirmed custody does not mean:

- The courier has started travel.
- The receiver has been notified that the package is out for delivery.
- The package is delivered.
- Doorstep proof has been captured.
- The courier has completed an earning event.

## Route Entry Preconditions
The screen can be opened when:

- `deliveryId` exists in the route.
- User is authenticated.
- User role is `final_mile_courier`.
- User is the assigned final-mile courier or has just received a successful acceptance response.
- A server-confirmed receipt or refreshed custody state exists.

If route entry is unsafe:

- If acceptance is queued offline, route to `OpsOfflineOutbox`.
- If delivery still needs scanning, route to `CourierAcceptAssignmentScan`.
- If delivery is already out for delivery, route to `CourierOutForDelivery` or `CourierRoute`.
- If delivery is no longer assigned, route to `CourierAssignments`.
- If state conflicts, route to `OpsActionRecovery`.

## Information Architecture
The screen has seven zones:

- Authority banner.
- Custody seal.
- Receipt metadata.
- Accountability panel.
- Next-step panel.
- Recovery and support links.
- Sticky action footer.

The first viewport must prove confirmation and show one next action. Secondary details can sit below the fold, but event ID and confirmation time must remain easy to find.

## Authority Banner
Purpose:

- Tell the courier whether this receipt is live, saved, pending, or unsafe.

Authority states:

- `Live confirmation`: server response just confirmed acceptance.
- `Saved confirmation`: server-confirmed receipt is cached for this delivery.
- `Refreshing`: app is checking the latest delivery state.
- `Pending sync`: acceptance is not confirmed and this route should not display the receipt seal.
- `Conflict`: refreshed custody state contradicts local receipt.

Copy:

- Live: `Server confirmed custody`
- Saved: `Saved confirmed receipt`
- Refreshing: `Checking custody record`
- Pending: `Acceptance still waiting to sync`
- Conflict: `Custody record needs review`

Rules:

- Live and saved states may show the receipt.
- Refreshing may show a loading shell plus last known confirmation if available.
- Pending state must route to outbox or action recovery, not show a success seal.
- Conflict state must not show primary start-trip action.

## Custody Seal
Purpose:

- Give the courier and station a strong visual proof that the handoff is complete.

Required content:

- Status icon or seal.
- Title.
- Confirmation subtitle.
- Delivery reference.
- Courier accountability statement.

Primary title:

- `Custody accepted`

Subtitle:

- `The package is now assigned to you as current custodian.`

Accountability line:

- `You are responsible for this package until delivery proof or return handoff is confirmed.`

Visual behavior:

- Use a strong green or verified color only for confirmed states.
- Do not use green for pending sync.
- Use a stamped receipt motif, not party visuals.
- Keep the seal readable in sunlight.
- Allow the seal to be shared visually with station staff without exposing receiver secrets.

## Receipt Metadata
Purpose:

- Provide auditable evidence from the lifecycle response.

Required fields:

- Delivery reference.
- Event ID.
- Server confirmation time.
- Delivery status.
- Payment status.
- Destination station.
- Courier name or actor label if available.
- Fallback indicator when available.

Delivery status display:

- Show `Assigned for final-mile` when response status is `assigned_for_final_mile`.
- Add helper text: `Custody is accepted. Trip has not started yet.`

Event ID:

- Show full event ID.
- Allow copy action if secure clipboard policy permits.
- Do not put raw package scan code beside the event ID.

Confirmation time:

- Show local time and timezone.
- Preserve the server timestamp in data state.
- If device time conflicts with server time, prefer server time and show local display.

Payment status:

- Show `Paid` when `paymentStatus=paid`.
- If not paid, show blocker and route to action recovery because final-mile assignment should require paid status.

Fallback indicator:

- Show `Standard scan` when `fallbackUsed=false` is known.
- Show `Supervised fallback` when `fallbackUsed=true` is known.
- Show `Acceptance method recorded` when method is unknown from route context.

## Accountability Panel
Purpose:

- Make liability clear without creating fear or clutter.

Required copy:

- Title: `Custody is now with you`
- Body: `From this point, package issues are reviewed against your custody period until delivery proof or return handoff is confirmed.`

Required facts:

- Current custodian role.
- Current custodian actor label.
- Destination station handoff source.
- Next accountability release condition.

Release conditions:

- `Delivered with accepted proof`
- `Returned to destination station with confirmed handoff`

Do not show:

- Legalistic paragraphs.
- Internal investigation scoring.
- Earnings estimates.
- Penalty copy.

## Next-Step Panel
Purpose:

- Move the courier from receipt to safe trip start.

Primary next step:

- `Start final-mile trip`

Target route:

```text
/(ops)/courier/assignments/:deliveryId/out-for-delivery
```

Helper text:

- `Start the trip when you are ready to leave the station with this package.`

Rules:

- The button routes to `CourierOutForDelivery`.
- The button does not call `mark_out_for_delivery`.
- If delivery is already out for delivery, primary action becomes `Open route`.
- If acceptance is pending, primary action becomes `Open offline outbox`.
- If custody conflicts, primary action becomes `Open recovery`.

Secondary actions:

- `View assignment details`
- `Open custody chain`
- `Report an issue`

Action hierarchy:

- One dominant primary action.
- Secondary actions as quiet text or compact buttons.
- No receiver contact CTA here.
- No proof capture CTA here.

## Recovery And Support Links
Show recovery links for:

- Station staff says acceptance did not show on their side.
- App shows saved receipt but cannot refresh.
- Receipt conflicts with delivery detail.
- Courier accepted the wrong package.
- Package is damaged after acceptance.
- Courier cannot leave station.

Support payload:

- delivery ID.
- event ID.
- occurred timestamp.
- route key.
- actor ID.
- station ID.
- current status.
- authority state.
- fallback indicator if known.

Do not include:

- raw package scan code.
- receiver phone.
- OTP.
- proof asset reference.
- exact GPS.

## Sticky Action Footer
Footer states:

- Confirmed: primary `Start final-mile trip`.
- Already out for delivery: primary `Open route`.
- Saved and offline: primary `View assignment details`, secondary `Open offline outbox` if pending actions exist.
- Pending sync: primary `Open offline outbox`.
- Conflict: primary `Open recovery`.
- Session expired: primary `Sign in again`.

Rules:

- Footer must remain above safe area.
- Footer must survive large text.
- Footer must not cover receipt metadata.
- Primary action must be disabled while route validation is refreshing.
- Footer must not trigger scanner or proof capture.

## State Model
### Loading
Use when:

- Route params are resolving.
- Receipt state is being read.
- Delivery detail is refreshing.

UI:

- Header shell.
- Receipt skeleton.
- Message: `Checking custody confirmation...`

Rules:

- Do not show success seal until authority is known.
- Do not show trip-start action until custody is confirmed.

### Live Confirmed
Use when:

- Screen opened immediately after successful `accept_final_mile_assignment`.

UI:

- Authority banner `Server confirmed custody`.
- Custody seal.
- Receipt metadata from response.
- Accountability panel.
- Start-trip primary action.

Rules:

- Announce confirmation.
- Clear raw package scan code from previous route state.
- Invalidate delivery, timeline, and courier queue if not already done.

### Saved Confirmed
Use when:

- Screen has a secure confirmed receipt from prior server success.
- Device is offline or refresh is unavailable.

UI:

- Authority banner `Saved confirmed receipt`.
- Custody seal with saved-data label.
- Receipt metadata.
- Clear freshness label.

Rules:

- Do not pretend saved receipt is freshly fetched.
- Allow assignment detail access.
- Allow start-trip route only if the app has no contradictory pending action and business rules allow offline continuation.

### Refreshing
Use when:

- Saved receipt exists but app is checking server data.

UI:

- Keep receipt visible in subdued mode.
- Show inline refresh status.
- Disable primary start-trip action if current custody state is uncertain.

### Pending Sync
Use when:

- Acceptance was queued offline and has not confirmed.

UI:

- No success seal.
- Pending panel.
- Outbox primary action.

Copy:

- Title: `Acceptance is still waiting to sync`
- Body: `Custody is not confirmed until the server accepts the scan. Stay with the station or ask a supervisor before leaving.`

### Conflict
Use when:

- Refreshed delivery state contradicts the receipt.
- Delivery assigned courier changed.
- Current custody is another actor.
- Status moved in an unexpected way.

UI:

- Blocking panel.
- Event ID if available.
- Recovery action.

Copy:

- Title: `Custody record needs review`
- Body: `The latest delivery record does not match this receipt. Do not continue until support or a station supervisor reviews it.`

### Already Out For Delivery
Use when:

- Delivery has already moved to `out_for_delivery` for the same courier.

UI:

- Show compact custody receipt.
- Primary action `Open route`.
- Secondary `View assignment details`.

Rules:

- Do not route back to scanner.
- Do not call out-for-delivery mutation again.

### Blocked Payment
Use when:

- Receipt response or refreshed detail indicates payment is not paid.

UI:

- Blocking panel.
- No start-trip action.
- Recovery route.

Reason:

- Final-mile charges are prepaid before assignment. Any unpaid state after acceptance requires operational review.

## Offline Policy
Offline behavior is allowed only for confirmed receipts.

Allowed offline:

- Read confirmed receipt from secure local state.
- Show saved confirmation authority.
- Show delivery reference, event ID, and occurred time.
- Open assignment detail from cache.
- Open offline outbox.
- Queue navigation intent to out-for-delivery only if product policy allows offline trip start in the next screen.

Disallowed offline:

- Do not convert pending accept-scan outbox row into confirmed receipt.
- Do not show live confirmation.
- Do not call `mark_out_for_delivery` from this screen.
- Do not send notifications.
- Do not show receiver contact.
- Do not hide stale-data labeling.

Offline copy:

- `Saved receipt. Confirm station release if the app cannot refresh.`

Sync success from pending accept:

- If user is on outbox, route to this screen.
- If app is foregrounded on assignment detail, show banner and route option.
- If app is backgrounded, refresh home and assignment queue.

Sync rejection from pending accept:

- Route to `OpsActionRecovery`.
- Do not show this screen as confirmed.

## Data Requirements
Route params:

- `deliveryId`

Required from acceptance response:

- `eventId`
- `deliveryId`
- `status`
- `paymentStatus`
- `occurredAt`

Required from refreshed delivery detail when available:

- delivery ID.
- tracking code.
- current status.
- payment status.
- assigned final-mile courier ID.
- current custody role.
- current custody actor ID.
- destination station ID.
- destination station label.
- receiver display name if already permitted.
- package description if available.
- doorstep requested flag.

Optional local receipt context:

- fallback used.
- supervisor override presence.
- acceptance method label.
- source route.
- accepted while online or after outbox sync.

Do not require:

- package scan code.
- OTP.
- proof asset reference.
- route geometry.
- earnings data.

## Data Storage
Confirmed receipt cache:

- May store event ID.
- May store delivery ID.
- May store response status.
- May store payment status.
- May store occurred timestamp.
- May store fallback indicator.
- May store actor ID.
- May store station ID.

Must not store:

- raw package scan code.
- receiver OTP.
- receiver full phone.
- proof asset data.

Retention:

- Keep confirmed receipt long enough for same-day operational review.
- Remove receipt when delivery is closed or when secure local data is cleared.
- Clear receipt on sign-out.

## API Integration
Queries:

- `get_delivery` for refreshed delivery authority.
- `list_deliveries` invalidation should already refresh courier queue after acceptance.

Mutations:

- None from this screen.

The screen must not call:

- `accept_final_mile_assignment`
- `mark_out_for_delivery`
- `complete_delivery`
- `record_failed_attempt`
- `create_delivery_proof_asset`

Route action:

- Start-trip button navigates to `CourierOutForDelivery`.

Invalidation expectations from prior screen:

- `Delivery`
- `DeliveryTimeline`
- `CourierQueue`

Refresh policy:

- On mount, refresh delivery when online.
- If refresh confirms custody, keep receipt active.
- If refresh contradicts custody, enter conflict.
- If refresh times out, keep saved confirmation but label it as saved.

## Navigation Rules
Entry:

- From `CourierAcceptAssignmentScan` after successful response.
- From `OpsOfflineOutbox` after queued acceptance sync succeeds.
- From `CourierAssignmentDetail` if current custody is courier.
- From notification only after delivery detail precheck.

Exit:

- Primary: `/(ops)/courier/assignments/:deliveryId/out-for-delivery`.
- Secondary: `/(ops)/courier/assignments/:deliveryId`.
- Secondary: `/(ops)/custody-chain` if route exists in shared ops flow.
- Recovery: `/(ops)/action-recovery`.
- Support: `/(ops)/courier/issues`.

Back behavior:

- Back returns to assignment detail.
- Back must not reopen scanner after confirmed custody unless the user explicitly chooses support recovery.
- If route was opened from outbox sync success, back returns to assignments.
- If route opened from notification, back returns to courier home.

Deep link behavior:

- If no confirmed custody exists, redirect based on delivery state.
- If status is `assigned_for_final_mile` and custody is courier, show receipt.
- If status is `out_for_delivery`, show receipt with `Open route`.
- If status is delivered, route to completed job detail when available.
- If status is issue reported, route to issue or detail recovery.

## Content System
Tone:

- Precise.
- Operational.
- Calm.
- Accountable.

Preferred terms:

- `custody accepted`
- `server confirmed`
- `handoff event`
- `current custodian`
- `start final-mile trip`
- `confirmed receipt`

Avoid:

- `done`
- `all set`
- `complete`
- `success` without custody context.
- `out for delivery` unless that status is actually true.

Primary copy:

- Title: `Custody accepted`
- Subtitle: `The package is now assigned to you as current custodian.`
- Accountability: `You are responsible for this package until delivery proof or return handoff is confirmed.`
- Next action helper: `Start the trip when you are ready to leave the station with this package.`

Conflict copy:

- `Do not continue with this package until the custody record is reviewed.`

Pending copy:

- `Custody is not confirmed until the server accepts the scan.`

## Visual System
Overall look:

- Receipt-like confirmation page.
- High-trust operational palette.
- Clear seal.
- Sparse metadata.
- Strong footer action.

Visual hierarchy:

- First: authority banner.
- Second: custody seal.
- Third: delivery reference and event ID.
- Fourth: accountability statement.
- Fifth: next action.

Color:

- Confirmed: verified green.
- Saved: neutral with verified outline.
- Pending: amber.
- Conflict: red.
- Refreshing: blue or neutral progress.

Material:

- Use a receipt card with subtle border and official spacing.
- Use a stamped seal motif, not confetti.
- Use crisp dividers for metadata rows.
- Keep station-facing readability high.

Typography:

- Title should be bold and short.
- Event ID should use monospaced or tabular styling.
- Timestamp should be readable and compact.
- Accountability copy should be plain and serious.

Iconography:

- Shield or verified seal for confirmed custody.
- Clock for timestamp.
- Station icon for source.
- Courier icon for current custodian.
- Warning icon for pending or conflict.

## Motion And Feedback
Motion must reinforce authority, not celebration.

Allowed:

- Brief seal stamp when live confirmation arrives.
- Soft receipt card reveal.
- Footer action settle-in after metadata appears.
- Small refresh spinner in authority banner.

Not allowed:

- Confetti.
- Fireworks.
- Endless celebratory loops.
- Decorative animations around event ID.
- Motion that delays reading accountability copy.

Haptics:

- Success haptic only after live server confirmation.
- No success haptic for saved confirmation on route reopen.
- Warning haptic for conflict.

Reduced motion:

- Replace seal stamp with instant state change.
- Keep text updates and status icons.

## Accessibility
Screen reader announcements:

- On live confirmation: `Custody accepted. The package is now assigned to you as current custodian.`
- On saved confirmation: `Saved custody receipt. Data may need refresh.`
- On pending sync: `Acceptance is still waiting to sync. Custody is not confirmed.`
- On conflict: `Custody record needs review. Do not continue.`

Focus order:

- Back action.
- Authority banner.
- Custody seal title.
- Accountability statement.
- Delivery reference.
- Event ID.
- Confirmation time.
- Current status.
- Primary action.
- Secondary actions.

Touch targets:

- Minimum 44 by 44 points.
- Primary footer action should be larger than the minimum.
- Copy event ID action must have an accessible label.
- Support and recovery links must not be tiny text-only targets.

Labels:

- Event ID copy button: `Copy handoff event ID`.
- Primary action: `Start final-mile trip for this delivery`.
- Recovery action: `Open custody recovery`.

Large text:

- Receipt metadata can wrap.
- Footer must remain visible.
- Event ID can wrap or horizontally scroll only if accessibility label exposes full value.

Color:

- Do not rely on green alone.
- Pair states with text, icon, and accessibility role.

## Privacy And Security
This screen can be shown at the station counter, so it must minimize sensitive data.

Allowed visible data:

- delivery reference.
- event ID.
- confirmation time.
- current status.
- current custodian label.
- station label.
- package description if already allowed in courier detail.

Disallowed visible data:

- raw package scan code.
- receiver phone.
- OTP.
- proof asset reference.
- exact GPS.
- internal fraud flags.
- payment provider reference.

Clipboard:

- Copy event ID only.
- Do not copy raw package code.
- Show `Event ID copied` as a status message if copied.

Screenshots:

- If secure-screen mode is enabled for custody flows, keep it enabled here.
- If not enabled, ensure no secret data is visible.

Analytics:

- Track screen viewed, authority state, next action tapped, recovery opened, and support opened.
- Do not track raw package code.
- Do not track receiver phone.
- Do not track exact address.

## Error Handling
### Missing Receipt
Meaning:

- The route opened without a confirmed response or verified custody detail.

UI title:

- `No confirmed custody receipt`

Body:

- `This delivery still needs a confirmed scan before custody can be shown.`

Actions:

- `Open accept scan`
- `Open assignment detail`

### Pending Offline Acceptance
Meaning:

- The accept scan is still queued.

UI title:

- `Acceptance waiting to sync`

Body:

- `The package is not confirmed in your custody until the server accepts the scan.`

Actions:

- `Open offline outbox`
- `Back to assignment`

### Custody Conflict
Meaning:

- Refreshed delivery detail disagrees with the receipt.

UI title:

- `Custody record needs review`

Body:

- `The latest delivery record does not match this receipt. Do not continue with the package until reviewed.`

Actions:

- `Open recovery`
- `Contact support`

### Reassigned Delivery
Meaning:

- Delivery is assigned to another courier.

UI title:

- `Delivery reassigned`

Body:

- `This package is no longer assigned to you. Return it to the station operator for review.`

Actions:

- `Back to assignments`
- `Contact support`

### Unpaid State
Meaning:

- Payment status is not safe for final-mile continuation.

UI title:

- `Payment status needs review`

Body:

- `Final-mile delivery should not continue until operations confirms the payment state.`

Actions:

- `Open recovery`
- `Contact support`

### Refresh Timeout
Meaning:

- App cannot refresh the delivery after confirmed receipt.

UI title:

- `Could not refresh custody`

Body:

- `A saved confirmed receipt is available. Confirm with station staff before leaving if the app remains offline.`

Actions:

- `Try refresh`
- `View assignment details`
- `Open support`

## Component Inventory
Screen-level components:

- `CourierCustodyAcceptedScreen`
- `CustodyAuthorityBanner`
- `CustodyAcceptedSeal`
- `CustodyReceiptCard`
- `CustodyMetadataRow`
- `CustodyAccountabilityPanel`
- `CustodyNextStepPanel`
- `CustodyConflictPanel`
- `CustodyPendingSyncPanel`
- `CustodyAcceptedFooter`
- `CustodyReceiptSupportLinks`

Shared components:

- `StatusAuthorityStrip`
- `DeliveryReferenceBadge`
- `StationBadge`
- `EventIdCopyControl`
- `CriticalWarningCard`
- `ActionRecoveryLink`
- `OfflineStateBadge`

## Component Responsibilities
`CourierCustodyAcceptedScreen`:

- Own route params, receipt resolution, delivery refresh, authority state, and navigation.

`CustodyAuthorityBanner`:

- Communicate live, saved, refreshing, pending, or conflict authority.

`CustodyAcceptedSeal`:

- Render confirmed custody title, subtitle, and visual seal.

`CustodyReceiptCard`:

- Render delivery reference, event ID, timestamp, status, payment status, and station.

`CustodyMetadataRow`:

- Render accessible key-value receipt rows.

`CustodyAccountabilityPanel`:

- Explain current custodian and release conditions.

`CustodyNextStepPanel`:

- Explain the next workflow without performing the mutation.

`CustodyConflictPanel`:

- Block unsafe continuation and route to recovery.

`CustodyPendingSyncPanel`:

- Explain pending acceptance and route to outbox.

`CustodyAcceptedFooter`:

- Render primary and secondary actions by authority state.

`CustodyReceiptSupportLinks`:

- Offer support with redacted payload.

## State Machine
```text
loading
  -> missing_receipt
  -> pending_sync
  -> live_confirmed
  -> saved_confirmed
  -> conflict

live_confirmed
  -> refreshing
  -> next_step_available
  -> already_out_for_delivery
  -> conflict

saved_confirmed
  -> refreshing
  -> next_step_available
  -> conflict

refreshing
  -> live_confirmed
  -> saved_confirmed
  -> already_out_for_delivery
  -> conflict
  -> refresh_timeout

pending_sync
  -> outbox
  -> action_recovery

missing_receipt
  -> accept_scan
  -> assignment_detail

next_step_available
  -> courier_out_for_delivery

already_out_for_delivery
  -> courier_route

conflict
  -> action_recovery
  -> support
```

## Validation Rules
Receipt validation:

- `deliveryId` in route must match receipt delivery ID.
- `eventId` must exist and match event ID schema when using mutation response.
- `occurredAt` must be valid datetime.
- `status` must be a valid delivery status.
- `paymentStatus` must be a valid payment status.

Custody validation:

- Refreshed delivery custody role must be `final_mile_courier` for confirmed display.
- Refreshed delivery custody actor must match current courier when available.
- Assigned courier must match current courier unless the screen is rendering historical read-only state after later progression.

Navigation validation:

- Start-trip route requires confirmed custody.
- Start-trip route is disabled during refresh when custody is uncertain.
- Start-trip route is replaced by outbox or recovery action when authority is not confirmed.

Redaction validation:

- Raw package scan code must not be in visible text.
- Raw package scan code must not be in analytics payloads.
- Raw package scan code must not be in support payloads.

## Test IDs
Screen:

- `screen-courier-custody-accepted`

Authority:

- `courier-custody-authority-banner`
- `courier-custody-authority-label`
- `courier-custody-refreshing`

Seal:

- `courier-custody-accepted-seal`
- `courier-custody-title`
- `courier-custody-subtitle`
- `courier-custody-accountability-copy`

Receipt:

- `courier-custody-receipt-card`
- `courier-custody-delivery-ref`
- `courier-custody-event-id`
- `courier-custody-copy-event-id`
- `courier-custody-confirmed-at`
- `courier-custody-status`
- `courier-custody-payment-status`
- `courier-custody-station`
- `courier-custody-method`

Panels:

- `courier-custody-accountability-panel`
- `courier-custody-next-step-panel`
- `courier-custody-pending-sync-panel`
- `courier-custody-conflict-panel`
- `courier-custody-support-links`

Footer:

- `courier-custody-start-trip`
- `courier-custody-open-route`
- `courier-custody-open-detail`
- `courier-custody-open-outbox`
- `courier-custody-open-recovery`
- `courier-custody-contact-support`

## Automated Test Matrix
Render tests:

- Renders live confirmed state from successful acceptance response.
- Renders saved confirmed state from secure receipt.
- Renders pending sync state without success seal.
- Renders conflict state without start-trip action.
- Renders already out for delivery state with open-route action.
- Renders payment blocker when payment is not paid.
- Renders missing receipt recovery.

Receipt tests:

- Shows event ID.
- Shows confirmation time.
- Shows delivery reference.
- Shows current status as `assigned_for_final_mile` when acceptance did not move status.
- Shows helper copy that trip has not started.
- Shows fallback indicator when known.
- Does not show raw package scan code.
- Does not show receiver phone.
- Does not show OTP.

Navigation tests:

- Primary action routes to `CourierOutForDelivery` when confirmed.
- Primary action routes to outbox when pending sync.
- Primary action routes to recovery when conflict.
- Already-out-for-delivery state routes to route screen.
- Back returns to assignment detail.
- Deep link without receipt redirects to accept scan or detail.

Authority tests:

- Refreshed custody matching courier keeps receipt confirmed.
- Refreshed custody mismatch enters conflict.
- Reassigned delivery enters conflict or assignments recovery.
- Refresh timeout keeps saved receipt with saved authority label.
- Session expiry pauses route actions and requests sign-in.

Offline tests:

- Offline saved receipt is visible with saved label.
- Pending accept outbox row does not show confirmed receipt.
- Offline start-trip route is allowed only by next screen policy.
- Outbox sync success can open this screen.
- Outbox sync rejection routes to recovery.

Accessibility tests:

- Live confirmation is announced.
- Pending sync is announced.
- Conflict is announced and receives focus.
- Focus order follows authority, seal, metadata, action.
- Event ID copy control has clear label.
- Touch targets meet minimum size.
- Large text keeps footer usable.
- Reduced motion removes seal stamp animation.

Security tests:

- Analytics excludes scan code.
- Support payload excludes scan code.
- Event ID copy copies only event ID.
- Sign-out clears local receipt.
- Screenshot-visible content excludes package code and OTP.

## Manual QA Script
1. Sign in as a final-mile courier.
2. Open an assigned final-mile delivery.
3. Complete accept-scan successfully.
4. Confirm this screen opens.
5. Confirm title says `Custody accepted`.
6. Confirm event ID is visible.
7. Confirm server time is visible.
8. Confirm status can remain `assigned_for_final_mile`.
9. Confirm helper copy says trip has not started.
10. Confirm no raw package scan code appears.
11. Confirm no receiver phone appears.
12. Tap start-trip action.
13. Confirm it routes to `CourierOutForDelivery`.
14. Return and test saved receipt while offline.
15. Confirm saved authority label appears.
16. Create a pending accept outbox state.
17. Confirm this screen does not show confirmed custody.
18. Force refreshed custody mismatch.
19. Confirm conflict state blocks start trip.
20. Force already-out-for-delivery state.
21. Confirm primary action becomes open route.
22. Test large text and screen reader order.
23. Confirm support payload excludes scan code.

## Implementation Notes For Claude Code
Build only the documented screen behavior.

Required implementation approach:

- Use existing route, auth, query, and offline primitives.
- Use acceptance response and refreshed delivery detail as authority inputs.
- Keep this screen read-only with navigation actions only.
- Keep `mark_out_for_delivery` in `CourierOutForDelivery`.
- Preserve route and test IDs exactly.
- Keep copy exact where this spec provides exact copy.
- Redact all package scan code data.
- Treat offline pending acceptance as not confirmed.

Expected file areas:

- Final-mile courier route registration.
- Screen component.
- Receipt authority resolver.
- Secure local receipt reader.
- Delivery refresh hook.
- Navigation tests.
- Accessibility tests.
- Security redaction tests.

Do not invent:

- New backend custody fields.
- New receipt mutation.
- Direct trip-start mutation on this screen.
- Receiver proof controls.
- Route map controls.
- Earnings controls.
- Public tracking controls.

## Acceptance Criteria
Functional:

- Successful acceptance opens a confirmed custody receipt.
- Confirmed receipt shows event ID and server time.
- Confirmed receipt explains courier accountability.
- Confirmed receipt routes to out-for-delivery workflow.
- Pending offline acceptance does not show confirmed custody.
- Custody conflict blocks continuation.
- Already-out-for-delivery state routes forward instead of back to scanner.

UX:

- Courier can show station staff clear proof in under five seconds.
- The page clearly separates custody accepted from trip started.
- The next action is obvious and singular.
- Recovery states tell the courier whether to stay, retry, or contact support.

Security:

- No raw package scan code is visible.
- No receiver phone or OTP is visible.
- Analytics and support payloads are redacted.
- Saved receipts are cleared on sign-out.

Accessibility:

- Confirmation, pending, and conflict states are announced.
- Focus order is predictable.
- Touch targets are large.
- Large text does not block the primary action.

Testing:

- Render, authority, navigation, offline, conflict, accessibility, and security tests cover this screen.
- Tests assert the exact route, test ID, and no direct `mark_out_for_delivery` mutation from this screen.

## Quality Bar
This screen is ready for build only when:

- A courier cannot mistake pending sync for confirmed custody.
- A courier cannot mistake accepted custody for out-for-delivery status.
- The station can visually trust the receipt without seeing sensitive data.
- The event ID and confirmation time are always findable.
- The next action is a route to the correct workflow, not a hidden mutation.
- Conflict states block unsafe movement of goods.
- The UI feels like an official custody record, not a generic success message.


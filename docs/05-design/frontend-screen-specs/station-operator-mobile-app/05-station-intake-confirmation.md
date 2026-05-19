# Station Intake Confirmation Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `StationIntakeConfirmation` |
| App | `apps/mobile` |
| Route | `/(ops)/station/intake/:deliveryId/confirmation` |
| Primary test ID | `screen-station-intake-confirmation` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Station Critical` |
| Backend dependency | `confirm_intake` response, `deliveryLifecycleResponseSchema`, `get_delivery`, `get_delivery_timeline`, local intake receipt snapshot, offline outbox |
| Related routes | `/(ops)/station/intake`, `/(ops)/station/intake/:deliveryId`, `/(ops)/station/packages/:deliveryId/label/print`, `/(ops)/deliveries/:deliveryId`, `/(ops)/deliveries/:deliveryId/custody`, `/(ops)/deliveries/:deliveryId/issues/new`, `/(ops)/offline-outbox`, `/(ops)/station/outbound`, `/(ops)/station/support` |
| Required states | `loading`, `confirmed`, `offline_pending`, `sync_confirmed`, `sync_failed`, `missing_receipt_snapshot`, `stale_confirmation`, `damaged_followup`, `payment_pending_followup`, `payment_failed_followup`, `print_ready`, `print_blocked`, `not_found`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen confirms that station intake has been recorded or durably saved for sync. It shows the package label binding, custody owner, timestamp, payment implication, condition follow-up, and next operational action.

The screen answers one operational question: `What changed after intake, and what must the station do next?`

The station operator should be able to:
- See whether intake is backend-confirmed or only queued for sync.
- Confirm delivery ID and tracking code.
- Confirm package label code.
- Confirm measured package facts.
- Confirm current custody owner.
- See event ID and timestamp when backend has confirmed.
- Understand whether dispatch is blocked by payment.
- Understand whether damaged condition requires issue follow-up.
- Print or open package label only when safe.
- Open the custody chain.
- Open the delivery detail.
- Return to intake queue.
- Open offline outbox for pending or failed sync.

This screen is not:
- A second submit screen.
- A payment confirmation screen.
- A label design screen.
- A dispatch screen.
- A custody override screen.
- A support case editor.
- A place to modify package measurements after intake.
- A place to hide offline uncertainty.

## Audience
Primary audience:
- Station operators who just completed package intake.
- Station leads checking whether intake actually recorded.
- Operators resolving offline intake sync.

Secondary audience:
- Claude Code implementing post-mutation confirmation.
- QA validating the difference between backend-confirmed and offline-pending states.
- Operations leads validating custody and label workflow.
- Security reviewers validating event and data visibility.
- Accessibility reviewers validating success, pending, and error announcements.

## User State
The operator has just completed `StationPackageIntake`, or returned to this screen from an outbox sync update.

The user may be:
- Confirming online backend success.
- Confirming that an offline action was saved for later sync.
- Preparing to print the package label.
- Creating an issue because condition is damaged.
- Checking why dispatch is still blocked after intake.
- Showing the sender an intake acknowledgement.
- Returning to intake queue for the next sender.
- Resolving a sync conflict from offline work.

The screen must:
- Make success and pending states impossible to confuse.
- Show backend event ID only when backend confirmed.
- Show local action ID when offline pending.
- Avoid saying `received` as final when action is only queued.
- Preserve the label code and measured facts from the intake payload snapshot.
- Refetch delivery detail or timeline when the route is opened without a local receipt snapshot.
- Never invent label code, condition, or measured values.

## Backend Contract
Authoritative mutation response:
- `deliveryLifecycleResponseSchema`

Response fields:
- `eventId`
- `deliveryId`
- `status`
- `paymentStatus`
- `occurredAt`

Expected successful status:
- `received_at_origin`

Expected payment states:
- `confirmed`
- `pending`
- `failed`
- `refund_pending`
- `refunded`

Additional local receipt snapshot:
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `receiverName`
- `measuredWeightKg`
- `sizeTier`
- `condition`
- `labelScanCode`
- `fallbackUsed`
- `supervisorOverrideActorId`
- `submittedByActorId`
- `submittedAtLocal`
- `syncState`
- `outboxActionId` when offline

Why local snapshot is required:
- `deliveryLifecycleResponseSchema` confirms lifecycle state but does not include label code, condition, weight, or size.
- The confirmation screen must show exactly what the operator submitted.
- If local snapshot is missing, the screen must fetch delivery detail and timeline, then show only verified fields.

Read recovery:
- `GET /v1/deliveries/:id`
- `GET /v1/deliveries/:id/timeline`

Read recovery rules:
- Use timeline only to confirm event and custody evidence.
- Do not reconstruct label code from unsafe client memory.
- If label code is unavailable, show `Label code unavailable on this device` and route to custody chain or support.
- If backend status is no longer `received_at_origin`, show stale confirmation state and route to delivery detail.

## Confirmation Authority
There are two valid confirmation classes.

### Backend-Confirmed Intake
Use when:
- `confirm_intake` returned successful lifecycle response.
- `status = received_at_origin`.
- `eventId` exists.
- `occurredAt` exists.

Copy:
- Title: `Intake recorded`
- Body: `This station is now the recorded custodian for this package.`

Allowed actions:
- `Print package label`
- `Open custody chain`
- `Open delivery detail`
- `Back to intake queue`
- `Open outbound queue`
- `Create damage issue` when condition is damaged.

### Offline-Pending Intake
Use when:
- `StationPackageIntake` created a durable offline outbox action.
- Backend has not confirmed the mutation yet.

Copy:
- Title: `Intake saved for sync`
- Body: `This package is not backend-confirmed yet. Keep it at the station and resolve sync before dispatch.`

Allowed actions:
- `Open offline outbox`
- `Back to intake queue`
- `Open delivery detail` only if cached detail is safe.

Blocked actions:
- Do not print first package label from this screen.
- Do not open outbound dispatch.
- Do not imply backend event ID exists.
- Do not say `Intake recorded`.

## Primary Action Logic
Primary action by state:
- `confirmed` with `condition=ok`: `Print package label`
- `confirmed` with `condition=damaged`: `Create damage issue`
- `confirmed` with `paymentStatus=pending`: `Print package label`
- `confirmed` with `paymentStatus=failed`: `Print package label`
- `offline_pending`: `Open offline outbox`
- `sync_confirmed`: `Print package label`
- `sync_failed`: `Open offline outbox`
- `missing_receipt_snapshot`: `Open custody chain`
- `stale_confirmation`: `Open delivery detail`
- `not_found`: `Back to intake queue`
- `not_authorized`: `Back to role home`
- `session_expired`: `Sign in`
- `api_error`: `Retry`

Secondary actions:
- `Back to intake queue`
- `Open delivery detail`
- `Open custody chain`
- `Open outbound queue`
- `Open support`

Blocked behavior:
- Do not offer print when sync is pending.
- Do not offer outbound queue when payment is pending or failed.
- Do not offer outbound queue when condition is damaged and issue follow-up has not started.
- Do not show event ID for offline-pending local action.
- Do not show label code if it is not in local snapshot or verified timeline evidence.
- Do not allow edit of measured weight, size tier, condition, or label code.

## Screen Structure
Order:
1. Confirmation state banner.
2. Delivery identity.
3. Custody result.
4. Package label binding.
5. Package measurement receipt.
6. Payment and dispatch note.
7. Condition follow-up.
8. Event and audit details.
9. Next actions.

### Confirmation State Banner
Backend-confirmed:
- Icon: stable success mark.
- Title: `Intake recorded`
- Body: `Package received at {stationName}.`
- Status: `Backend confirmed`

Offline pending:
- Icon: sync pending mark.
- Title: `Intake saved for sync`
- Body: `Backend confirmation is still pending.`
- Status: `Pending sync`

Sync failed:
- Icon: warning mark.
- Title: `Intake sync failed`
- Body: `Review the saved action before retrying.`
- Status: `Needs outbox review`

### Delivery Identity
Show:
- Tracking code.
- Delivery ID.
- Receiver name.
- Route: `{originStationId} to {destinationStationId}`.
- Service type.
- Doorstep requested state.

Do not show:
- Receiver phone.
- Receiver address.
- Payment provider reference.
- Raw staff IDs as primary copy.

### Custody Result
Backend-confirmed copy:
- `Current custodian: {stationName}`
- `Custody role: station operator`
- `Recorded at {localFormattedOccurredAt}`

Offline-pending copy:
- `Custody update pending sync`
- `Keep package at {stationName}`
- `Saved locally at {localFormattedSubmittedAt}`

Required visual treatment:
- Backend-confirmed state uses positive treatment.
- Offline-pending state uses caution treatment.
- Sync-failed state uses blocked treatment.

### Package Label Binding
Backend-confirmed:
- Label: `Package label`
- Value: `{labelScanCode}`
- Help: `This code is locked to this delivery after origin intake.`

Offline-pending:
- Label: `Package label pending sync`
- Value: `{labelScanCode}`
- Help: `This code is reserved locally and will sync when network returns.`

Missing verified label:
- Label: `Package label`
- Value: `Unavailable on this device`
- Help: `Open custody chain or support to verify label evidence.`

Actions:
- `Copy label code`
- `Print package label` when backend-confirmed
- `Open custody chain`

### Package Measurement Receipt
Show:
- Measured weight.
- Size tier.
- Condition.
- Fallback used.
- Supervisor approval indicator when fallback was used.

Labels:
- `Measured weight`
- `Size tier`
- `Condition`
- `Fallback used`
- `Supervisor approved`

Condition copy:
- `Looks okay`
- `Damaged - create issue before dispatch`

### Payment And Dispatch Note
Payment confirmed:
- Title: `Dispatch can continue after station steps`
- Body: `Payment is confirmed. Assign a driver when the package is ready.`

Payment pending:
- Title: `Dispatch blocked until payment confirms`
- Body: `Intake is recorded, but transport must wait for payment confirmation.`

Payment failed:
- Title: `Dispatch blocked by failed payment`
- Body: `Keep custody recorded and ask the sender to resolve payment before dispatch.`

Refund pending or refunded:
- Title: `Payment state needs support`
- Body: `Do not dispatch this package. Open support for review.`

### Condition Follow-Up
Show when `condition=damaged`.

Title:
- `Damage follow-up required`

Body:
- `Create an issue before this package moves to dispatch.`

Primary action:
- `Create damage issue`

Secondary action:
- `Open custody chain`

### Event And Audit Details
Backend-confirmed fields:
- Event ID.
- Delivery ID.
- Status.
- Payment status.
- Occurred at.
- Station ID.
- Operator role.

Offline-pending fields:
- Outbox action ID.
- Delivery ID.
- Local saved time.
- Station ID.
- Operator role.
- Sync state.

Display rules:
- Event ID can be copied.
- Outbox action ID can be copied.
- Actor user ID should be secondary and not prominent.
- Do not show raw JSON payload.

## Component Inventory
`StationIntakeConfirmationScreen`:
- Route-level screen.
- Test ID: `screen-station-intake-confirmation`

`IntakeConfirmationBanner`:
- Confirmed, pending, or failed sync banner.
- Test ID: `station-intake-confirmation-banner`

`IntakeConfirmationIdentity`:
- Delivery identity summary.
- Test ID: `station-intake-confirmation-identity`

`IntakeCustodyResult`:
- Current custody result.
- Test ID: `station-intake-confirmation-custody`

`PackageLabelBindingCard`:
- Label code and binding state.
- Test ID: `station-intake-confirmation-label`

`PackageMeasurementReceipt`:
- Weight, size, condition, fallback state.
- Test ID: `station-intake-confirmation-measurement`

`PaymentDispatchNotice`:
- Payment implication.
- Test ID: `station-intake-confirmation-payment`

`DamageFollowupCard`:
- Damage issue action.
- Test ID: `station-intake-confirmation-damage`

`IntakeAuditDetails`:
- Event or outbox details.
- Test ID: `station-intake-confirmation-audit`

`IntakeNextActions`:
- Primary and secondary actions.
- Test ID: `station-intake-confirmation-actions`

## State Model
`loading`:
- Route opened and receipt data is being resolved.

`confirmed`:
- Backend response exists and status is `received_at_origin`.

`offline_pending`:
- Durable outbox action exists and backend sync has not completed.

`sync_confirmed`:
- Previously offline action has synced successfully.

`sync_failed`:
- Outbox action failed or conflicts with backend state.

`missing_receipt_snapshot`:
- Route opened without local receipt snapshot and verified details are incomplete.

`stale_confirmation`:
- Refetched delivery status conflicts with the confirmation route.

`damaged_followup`:
- Confirmed intake with `condition=damaged`.

`payment_pending_followup`:
- Confirmed intake with pending payment.

`payment_failed_followup`:
- Confirmed intake with failed payment.

`print_ready`:
- Backend-confirmed and package label can be printed.

`print_blocked`:
- Offline pending, missing label code, sync failed, or policy block.

`not_found`:
- Delivery not found or not visible.

`not_authorized`:
- Actor cannot view station confirmation.

`session_expired`:
- Auth token expired or refresh failed.

`api_error`:
- Delivery or timeline recovery failed.

## Copy System
Voice:
- Factual.
- Calm.
- Custody-aware.
- No celebration that hides operational risk.

Preferred words:
- `Recorded`
- `Saved for sync`
- `Current custodian`
- `Dispatch blocked`
- `Print label`
- `Create issue`
- `Open outbox`

Avoid:
- Saying `complete` when sync is pending.
- Saying `delivered`.
- Saying `ready for dispatch` when payment is pending or failed.
- Hiding damaged condition in small text.
- Generic success language.

Key strings:
- `Intake recorded`
- `Intake saved for sync`
- `Backend confirmed`
- `Pending sync`
- `Current custodian`
- `Package label`
- `Dispatch blocked until payment confirms`
- `Damage follow-up required`
- `Create damage issue`

## Offline And Sync Rules
Offline pending:
- Show as pending, not confirmed.
- Keep outbox action ID visible.
- Show saved local timestamp.
- Show station custody instruction: `Keep package at station`.
- Disable print unless local station process explicitly prints physical labels before backend confirmation. V1 default is disabled.

Sync confirmed:
- Replace pending banner with backend-confirmed banner.
- Show event ID and occurredAt.
- Enable label print if label code exists.
- Keep original local submitted time in audit details when available.

Sync failed:
- Show blocked sync banner.
- Primary action opens outbox.
- Do not show print.
- Do not show outbound queue.
- Explain that backend did not accept the action.

Conflict cases:
- Duplicate label.
- Already received.
- Status changed.
- Station scope changed.
- Auth expired.

Conflict handling:
- Route to outbox for retry review.
- Offer custody chain when backend has an event.
- Offer support when evidence cannot be reconciled.

## Label Print Rules
Print is allowed when:
- Backend intake is confirmed.
- `labelScanCode` is known.
- Status is `received_at_origin`.
- No sync conflict exists.

Print is blocked when:
- Offline pending.
- Sync failed.
- Label code is unavailable.
- Delivery status no longer matches intake result.
- User lacks station scope.

Print route:
- `/(ops)/station/packages/:deliveryId/label/print`

Print route params:
- `deliveryId`
- Optional local receipt reference ID.

Do not:
- Print from an unconfirmed offline action.
- Print if label code is missing.
- Print if station scope is not confirmed.

## Navigation Rules
Entry:
- From `StationPackageIntake` after backend success.
- From `StationPackageIntake` after offline queue success.
- From offline outbox after sync success or failure.
- From custody chain only when user selects intake event.

Back:
- Returns to `StationIntakeQueue`.

Primary next routes:
- `PackageLabelPrint`
- `OpsIssueCreate`
- `OpsOfflineOutbox`
- `OpsDeliveryDetail`
- `OpsCustodyChain`
- `StationOutboundQueue`

Return behavior:
- Returning from label print should restore confirmation.
- Returning from issue creation should show issue-follow-up completed if local state knows it.
- Returning from outbox should refresh sync state.

## Accessibility Requirements
Screen reader order:
1. Confirmation state banner.
2. Delivery identity.
3. Custody result.
4. Label binding.
5. Measurement receipt.
6. Payment and dispatch note.
7. Damage follow-up if visible.
8. Audit details.
9. Next actions.

Status announcements:
- Announce `Intake recorded` on backend-confirmed entry.
- Announce `Intake saved for sync` on offline-pending entry.
- Announce `Intake sync failed` when state changes to failed.
- Announce `Print available` when sync changes from pending to confirmed.

Focus:
- Initial focus lands on confirmation title.
- If opened from sync failure, focus lands on failure banner.
- If damaged follow-up is primary, focus order reaches it before label print.
- Copy actions announce copied value type, not raw context first.

Touch targets:
- Primary action must be large and bottom reachable.
- Copy buttons must meet target-size rules or include enough spacing.
- Secondary actions must not be icon-only.

Reduced motion:
- Success mark appears without animated burst.
- Sync state changes use status update, not motion-only cue.

## Security And Privacy
Allowed visible data:
- Tracking code.
- Delivery ID.
- Receiver name.
- Origin and destination station IDs.
- Label code.
- Event ID.
- Outbox action ID.
- Payment status label.

Hidden data:
- Receiver phone.
- Receiver address.
- Payment provider references.
- Raw provider payload.
- Raw auth token.
- Stack traces.
- Full internal audit payload.

Copy behavior:
- Copy label code is allowed.
- Copy event ID is allowed.
- Copy outbox action ID is allowed.
- Copy receiver name is not needed and should not be offered.

Analytics exclusions:
- Do not send receiver name.
- Do not send label code.
- Do not send event ID unless security review approves.
- Do not send raw outbox payload.

## Analytics
Events:
- `station_intake_confirmation_viewed`
- `station_intake_confirmation_print_selected`
- `station_intake_confirmation_damage_issue_selected`
- `station_intake_confirmation_outbox_selected`
- `station_intake_confirmation_custody_chain_selected`
- `station_intake_confirmation_back_to_queue`

Allowed payload fields:
- `deliveryId`
- `stationId`
- `syncState`
- `status`
- `paymentStatus`
- `condition`
- `fallbackUsed`
- `primaryAction`
- `sourceRoute`

Disallowed payload fields:
- `receiverName`
- `labelScanCode`
- `eventId`
- `outboxPayload`
- `paymentProviderReference`

## Error And Recovery
Missing local receipt:
- Try delivery detail and timeline recovery.
- If recovered, show verified status and limited receipt.
- If not recovered, show missing snapshot state.

Delivery not found:
- Show `Delivery not found`.
- Primary action: `Back to intake queue`.

Not authorized:
- Show `You cannot view this intake confirmation`.
- Primary action: `Back to role home`.

Session expired:
- Show `Sign in again to continue`.
- Primary action: `Sign in`.

API error:
- Keep any local receipt visible.
- Show recovery banner.
- Primary action: `Retry`.

Stale confirmation:
- Show `Delivery state changed`.
- Primary action: `Open delivery detail`.

## Visual System Direction
This screen should feel like an official station receipt, not a marketing success page.

Visual thesis:
- A compact operational receipt with a strong state banner, readable custody facts, and clear next action.

Layout:
- Single column.
- Strong top state card.
- Fact cards with clear labels.
- Sticky bottom action area.

Color:
- Confirmed: controlled green or blue.
- Pending sync: amber.
- Sync failed: red/rust.
- Neutral facts: high-contrast black and gray.

Typography:
- State title is dominant.
- Event and label codes use tabular or monospaced numerals where system supports it.
- Body copy stays short.

Motion:
- Minimal.
- State changes can crossfade if reduced motion is not requested.
- No decorative burst animation.

## Performance Requirements
Initial entry:
- Render local receipt immediately when available.
- Fetch recovery data in background only when needed.
- Do not block primary display on timeline if mutation response is present.

Offline:
- Confirmation must load from local receipt and outbox store without network.
- Sync state updates should not clear the screen.

Print action:
- Preload only required label data.
- Do not generate printable output on this screen.

## QA Acceptance Criteria
Backend-confirmed:
- Given lifecycle response with `status=received_at_origin`, show `Intake recorded`.
- Event ID is visible.
- Occurred time is visible.
- Current custodian is station operator at origin station.
- Print label action is available when label code exists.

Offline pending:
- Given outbox action without backend confirmation, show `Intake saved for sync`.
- Event ID is not shown.
- Outbox action ID is shown.
- Print label action is blocked.
- Open outbox is primary.

Sync confirmed:
- When outbox sync succeeds, banner changes to backend-confirmed.
- Event ID appears.
- Print action becomes available.

Sync failed:
- Failure banner appears.
- Print remains blocked.
- Primary action opens outbox.

Payment:
- Confirmed payment shows dispatch can continue after station steps.
- Pending payment shows dispatch blocked until payment confirms.
- Failed payment shows dispatch blocked by failed payment.
- Refund state shows support review.

Condition:
- `ok` shows no damage follow-up.
- `damaged` shows damage follow-up.
- Damage follow-up primary action opens issue creation.

Label:
- Label code from local receipt is visible.
- Missing label code shows unavailable state.
- Copy label action works only when label exists.

Navigation:
- Back returns to intake queue.
- Print opens package label print route.
- Custody chain opens custody route.
- Delivery detail opens operational detail.
- Outbox opens offline outbox.

Accessibility:
- Confirmation title is announced.
- Pending sync state is announced.
- Sync failure is announced.
- Large text does not clip event ID, label code, or primary action.
- Color is not the only state cue.

Privacy:
- Receiver phone is not shown.
- Receiver address is not shown.
- Provider references are not shown.
- Raw payload is not shown.

## Engineering Notes
Recommended feature folder:
- `apps/mobile/features/station/intake-confirmation`

Recommended state holder:
- `useStationIntakeConfirmationScreen`

Recommended selectors:
- `selectConfirmationAuthority`
- `selectReceiptFacts`
- `selectPaymentDispatchNotice`
- `selectConditionFollowup`
- `selectPrintEligibility`
- `selectPrimaryAction`

Recommended local stores:
- `station_intake_receipt_snapshot`
- `station_intake_outbox_action`
- `station_print_eligibility_cache`

Receipt retention:
- Keep local receipt snapshot until:
  - user leaves confirmation and queue has refreshed, or
  - outbox confirms and delivery detail has refreshed, or
  - retention window expires based on app storage policy.

Do not:
- Persist receipt snapshots across sign-out.
- Share receipt snapshots across station IDs.
- Trust a receipt snapshot from another user.

## Implementation Guardrails
Must use:
- `deliveryLifecycleResponseSchema`
- `deliveryDetailResponseSchema`
- `deliveryTimelineResponseSchema`
- Local outbox sync state.

Must show:
- Backend-confirmed vs offline-pending distinction.
- Current custody result.
- Label binding state.
- Payment dispatch implication.
- Damage follow-up when condition is damaged.

Must not:
- Print from offline pending state.
- Claim backend success from local outbox alone.
- Mutate delivery state.
- Edit package facts.
- Hide conflict state.
- Expose sensitive receiver or payment data.

## Web Research Applied
Relevant external sources reviewed for this screen:
- [Material Design snackbars and toasts](https://m1.material.io/components/snackbars-toasts.html): supports concise system feedback, but this screen uses a full receipt because intake is custody-critical.
- [Material Design buttons](https://m1.material.io/components/buttons.html): supports one dominant primary action with secondary actions clearly separated.
- [Android offline-first guidance](https://developer.android.com/topic/architecture/data-layer/offline-first): supports explicit local state, sync status, and safe recovery when network is unreliable.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing success, pending sync, and failure without unexpected focus jumps.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports accessible mobile action targets for print, outbox, issue, and navigation actions.

Design translation:
- A transient toast is insufficient for custody confirmation.
- Confirmation must be a stable receipt-style screen.
- Pending sync must be visually and semantically different from backend success.
- Next action should change based on damage, payment, and sync state.
- Accessibility must treat confirmation state changes as status updates.

## Review Checklist For Claude Code
Before implementing this screen, verify:
- The route is `/(ops)/station/intake/:deliveryId/confirmation`.
- The top-level test ID is `screen-station-intake-confirmation`.
- Backend-confirmed and offline-pending states are visually distinct.
- Event ID appears only after backend confirmation.
- Outbox action ID appears only for offline pending or sync failure.
- Label print is blocked until backend confirmation.
- Damaged condition routes to issue creation.
- Payment pending and failed block dispatch messaging.
- Missing label code does not get invented.
- Sensitive receiver and provider data are hidden.
- Screen reader announcements cover success, pending, and failure.

## Done Definition
The screen is complete when:
- All required states are implemented and tested.
- Backend-confirmed success shows authoritative lifecycle response.
- Offline-pending success shows local outbox state without overstating success.
- Print route is available only when safe.
- Damage follow-up is visible and routed.
- Payment follow-up is specific.
- Custody chain and delivery detail routes work.
- Missing receipt recovery is safe.
- Large text and screen reader flows are usable.
- E2E tests cover backend-confirmed, offline-pending, sync-failed, damaged, and payment-pending paths.

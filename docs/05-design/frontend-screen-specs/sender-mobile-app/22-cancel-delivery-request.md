# Cancel Delivery Request Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CancelDeliveryRequest` |
| App | `apps/mobile` |
| Route | `/(sender)/deliveries/:deliveryId/cancel` |
| Primary test ID | `screen-cancel-delivery-request` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `cancel_delivery`, `deliveryDetailResponseSchema`, `cancelDeliveryRequestSchema`, `cancelDeliveryResponseSchema`, cancellation and refund policy |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/history`, `/(sender)/support`, `/(sender)/receipts/:deliveryId` |
| Required states | `loading`, `eligible`, `blocked_by_status`, `blocked_after_intake`, `blocked_payment_state`, `confirming`, `submitting`, `submitted`, `rejected`, `refund_pending`, `not_found`, `not_authorized`, `offline`, `api_error`, `session_expired` |

## Product Job
This screen lets a sender cancel an eligible delivery safely before origin intake. It must make cancellation consequences clear, collect the approved reason, require explicit confirmation, submit `cancel_delivery` once, and show the authoritative cancellation/refund outcome returned by the backend.

The sender should be able to:
- Understand whether this delivery is eligible for self-service cancellation.
- See why cancellation is blocked when status no longer allows it.
- Understand refund implications before submitting.
- Choose an approved cancellation reason.
- Add an optional note when useful.
- Confirm the irreversible action.
- Submit cancellation only once.
- See success, refund pending, no-refund, rejected, offline, and error states.
- Route to refund status, delivery detail, history, or support after outcome.

This screen is not:
- A delivery edit screen.
- A quote change screen.
- A refund request form.
- A support chat.
- A return-to-sender workflow.
- An admin override.
- A station operator cancellation workflow.
- A receiver refusal workflow.
- A payment retry flow.

## Audience
Primary audience:
- Authenticated senders who intentionally opened cancellation from delivery detail.
- Senders cancelling before origin station intake.
- Senders who changed their mind, created a duplicate booking, disagreed with pricing, or learned the receiver is unavailable.

Secondary audience:
- Senders who try to cancel after origin intake and need clear support routing.
- Claude Code implementing the route.
- QA validating destructive-action safety.
- Support and finance reviewers validating refund wording.
- Operations reviewers validating lifecycle boundaries.

## User State
The sender is making a consequential decision. They may be frustrated, in a hurry, or unsure whether cancellation creates a refund. The screen must slow the final destructive action just enough to prevent accidental cancellation without burying the user in policy text.

The sender may be:
- Cancelling a newly created delivery before payment.
- Cancelling a newly created paid delivery before intake.
- Cancelling because the quote changed or booking was duplicated.
- Trying to cancel after the package was already received at origin.
- Trying to cancel after dispatch, final-mile assignment, delivery, or closure.
- Offline or on weak data.

The screen must:
- Fetch current delivery before showing eligibility.
- Treat backend status as authority.
- Allow sender self-service only for `currentStatus=created`.
- Block sender self-service for `received_at_origin`.
- Block sender self-service for dispatch and later statuses.
- Explain refund implications without promising unsupported settlement.
- Call `cancel_delivery` only after explicit confirmation.
- Never queue offline cancellation.
- Never let the user edit delivery details here.

## Primary Action
Primary action by state:
- Eligible form: `Review cancellation`
- Confirmation: `Cancel delivery`
- Submitted with refund pending: `Track refund`
- Submitted without refund: `Open delivery`
- Blocked: `Contact support`
- Offline/API error: `Try again`

Secondary actions:
- `Keep delivery`
- `Open delivery`
- `Go to history`
- `Contact support`

CTA behavior:
- `Review cancellation` opens confirmation state after valid reason selection.
- `Cancel delivery` submits `POST /v1/deliveries/:id/cancel`.
- `Keep delivery` returns to delivery detail without mutation.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `Open delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Go to history` routes to `/(sender)/history`.
- `Contact support` routes to support with delivery context.
- `Try again` refetches current delivery or retries failed submit depending on state.

Blocked behavior:
- Do not submit cancellation until fresh delivery detail confirms `currentStatus=created`.
- Do not submit cancellation from cached-only data.
- Do not submit cancellation while offline.
- Do not submit cancellation more than once per tap.
- Do not call refund endpoints directly.
- Do not let the user manually choose refund amount.
- Do not promise refund settlement.
- Do not expose payment ID, provider reference, actor ID, or internal event metadata.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Delivery identity.
- Current cancellation eligibility.
- Current delivery status.
- Payment status.
- Expected policy outcome.
- Clear primary action or block reason.

For eligible cancellation, first meaningful value is:
- `This delivery can still be cancelled before origin intake.`
- Reason picker.
- Refund policy preview.

For blocked cancellation, first meaningful value is:
- `This delivery cannot be cancelled in the app now.`
- Clear reason.
- Support route.

## Main Tension
Cancellation must be easy when policy allows it and impossible when policy blocks it. The screen must not frustrate senders with unnecessary friction before origin intake, but it must prevent accidental destructive actions and prevent unsupported post-intake cancellation.

The design must balance:
- Fast self-service against irreversible action safety.
- Refund clarity against settlement uncertainty.
- Policy detail against mobile simplicity.
- Backend authority against user expectation.
- Recovery paths against accidental resubmission.

## Design Brief
User and job:
- An authenticated sender wants to cancel a delivery and understand the refund outcome.

Context of use:
- Mobile, time-sensitive, payment-aware, status-dependent.

Entry point:
- SenderDeliveryDetail cancellation action.
- Support-advised deep link.
- Quote review changed-price cancellation path.

Success state:
- Eligible delivery is cancelled and refund/no-refund outcome is displayed from backend response.

Primary action:
- `Cancel delivery` only after review/confirmation.

Navigation model:
- Focused destructive-action flow. Delivery detail is the parent hub.

Density:
- Low-to-medium. Policy matters, but the form must stay clear.

Visual thesis:
- A serious cancellation checkpoint: calm warning, exact consequence, one irreversible action.

Restraint rule:
- Avoid alarmist visuals, long policy walls, hidden fees, ambiguous buttons, and admin override language.

Product lens:
- Trust-critical destructive action with money impact.

System stance:
- Native mobile form with a confirmation bottom sheet or modal.

Interaction thesis:
- Sender chooses a reason, reviews consequences, confirms once, and then sees the authoritative result.

Signature move:
- A policy outcome card that changes from `Full refund may be requested` to `Support required` based on current status.

Activation event:
- Sender submits confirmed cancellation and backend returns `cancelDeliveryResponseSchema`.

## Elite Quality Gate
This spec is not closed unless cancellation is safe, policy-correct, and backend-authoritative.

Non-negotiable quality requirements:
- Screen fetches fresh `get_delivery` before allowing submission.
- Sender self-service submit is enabled only for `currentStatus=created`.
- `received_at_origin` is blocked for sender self-service and routes to support.
- Dispatch and later statuses are blocked.
- Reason selection uses only `cancelDeliveryRequestSchema` reason codes.
- `other` requires a note.
- Submit requires explicit destructive confirmation.
- Submit button disables while submitting.
- Cancellation mutation runs exactly once per confirmed submission.
- Success state uses only `cancelDeliveryResponseSchema`.
- Refund outcome displays only after backend response.
- Refund pending amount/reason display only if returned.
- Offline cancellation is not queued.
- Screen does not call refund endpoints.
- Screen hides provider references, payment IDs, staff IDs, and raw event metadata.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If sender can cancel after origin intake, the screen remains open.
- If failed submit can be repeated by double tap, the screen remains open.
- If refund amount is promised before backend response, the screen remains open.
- If the destructive and safe buttons are visually equal, the screen remains open.
- If the block reason does not explain what to do next, the screen remains open.
- If cancellation is queued offline, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines for alerts, destructive actions, and feedback support clear consequence language and safe confirmation.
- Material Design 3 dialogs, buttons, radio buttons, text fields, and progress indicators support reason selection, confirmation, and submit states.
- W3C form error and status-message guidance supports accessible validation, submit progress, and backend rejection messaging.
- Kra cancellation rules define sender self-service only before origin intake.
- Kra refund and dispute rules define full refund before origin intake and handling-fee retention after intake when cancellation is approved by staff/admin.
- Kra backend cancellation service blocks sender cancellation after station intake and blocks non-cancelable statuses.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/alerts
- https://developer.apple.com/design/human-interface-guidelines/buttons
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://m3.material.io/components/dialogs/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/radio-button/overview
- https://m3.material.io/components/text-fields/overview
- https://m3.material.io/components/progress-indicators/overview
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- `docs/03-business/cancellation-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/17-sender-delivery-detail.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/cancellations.ts`
- `services/api/src/app.ts`

## Product Assumptions
Assumptions for v1:
- Sender can self-cancel only before origin intake.
- Backend represents pre-intake eligible state as `currentStatus=created`.
- Sender is blocked at `received_at_origin`.
- Staff/admin may handle after-intake cancellation outside this sender screen.
- Dispatch and later cancellation becomes support/admin exception workflow.
- `cancel_delivery` returns authoritative refund outcome.
- Refund endpoint is not called by this screen.
- If payment is confirmed and cancellation succeeds before intake, backend can mark refund pending.
- If no confirmed payment exists, refund can be `not_applicable`.
- `refundAmountGhs` and `refundReason` appear only when backend returns `refundStatus=refund_pending`.
- Cancellation is irreversible from this screen.
- Offline cancellation is not supported.
- The route is sender-focused even though backend operation can serve other roles.

If future product supports sender cancellation after intake, this spec must be revised with new backend permission and refund contract.

## Non-Goals
Do not implement these in this screen:
- Delivery edit.
- Delivery rebooking.
- Return-to-sender workflow.
- Receiver refusal handling.
- Refund request form.
- Refund settlement.
- Admin override.
- Station operator cancellation.
- Support chat messages.
- Payment retry.
- Payment cancellation.
- Provider refund.
- Offline mutation queue.
- Package handoff updates.

## Backend Contract
### Read Before Mutate
Before rendering eligibility:
- Call `get_delivery`.
- Validate `deliveryDetailResponseSchema`.
- Use `currentStatus`, `paymentStatus`, `quote.amount`, `trackingCode`, `originStationId`, `destinationStationId`, `receiver.name`, and `latestEvent.occurredAt`.

Rules:
- Do not infer eligibility from navigation params.
- Do not rely on stale cache for eligibility.
- Refetch or verify freshness before submit if screen has been open long enough for state to change.

### Mutation
Operation:
- `cancel_delivery`.

HTTP route:
- `POST /v1/deliveries/:id/cancel`.

Request schema:
- `cancelDeliveryRequestSchema`.

Request body:
- `reasonCode`
- optional `note`

Approved reason codes:
- `sender_changed_mind`
- `duplicate_booking`
- `pricing_dispute`
- `receiver_unavailable`
- `support_advised`
- `other`

Response schema:
- `cancelDeliveryResponseSchema`.

Response fields:
- `eventId`
- `deliveryId`
- `status=cancelled`
- `paymentStatus`
- `occurredAt`
- `refundStatus`
- optional `refundAmountGhs`
- optional `refundReason`

### Eligibility Matrix
| `currentStatus` | Sender self-service | UI state | Action |
| --- | --- | --- | --- |
| `created` | yes | eligible | show form |
| `received_at_origin` | no | blocked after intake | contact support |
| `awaiting_driver_assignment` | no | blocked by status | contact support |
| `assigned_to_driver` | no | blocked by status | contact support |
| `dispatched_from_origin` | no | blocked by status | contact support |
| `in_transit` | no | blocked by status | contact support |
| `received_at_destination` | no | blocked by status | contact support |
| `awaiting_receiver_pickup` | no | blocked by status | contact support |
| `awaiting_final_mile_assignment` | no | blocked by status | contact support |
| `assigned_for_final_mile` | no | blocked by status | contact support |
| `out_for_delivery` | no | blocked by status | contact support |
| `delivered` | no | blocked by status | contact support |
| `issue_reported` | no | blocked by status | contact support |
| `on_hold` | no | blocked by status | contact support |
| `delivery_failed` | no | blocked by status | contact support |
| `cancelled` | no | already cancelled | open delivery |
| `closed` | no | closed | open delivery |
| `draft` | no | unsupported | go to create flow or support |

### Refund Outcome Mapping
Before submit:
- Show policy preview only.
- Do not show guaranteed refund amount as final.

If `paymentStatus=confirmed` and `currentStatus=created`:
- Preview: `Eligible cancellation before origin intake can request a full refund after cancellation succeeds.`
- Optional estimate: `Estimated policy refund: GHS {quote.amount}` with `Backend confirms after submit.`

If `paymentStatus=pending`:
- Preview: `No confirmed payment is recorded yet. Refund may not apply.`

If `paymentStatus=failed`:
- Preview: `Payment failed. Refund does not apply unless support finds a duplicate or provider issue.`

After submit:
- Use `refundStatus` from response.
- Show `refundAmountGhs` only if present.
- Show `refundReason` only if present.

Refund reason labels:
- `full_refund_pre_intake`: `Full refund before origin intake`
- `post_intake_handling_fee`: `Refund minus GHS 5 handling fee`
- `duplicate_charge`: `Duplicate charge refund`
- `platform_payment_error`: `Platform payment error refund`
- `never_received_at_origin`: `Package not received at origin`
- `doorstep_surcharge_refund`: `Doorstep surcharge refund`
- `express_surcharge_refund`: `Express surcharge refund`

## Form Design
### Delivery Summary Card
Show:
- Tracking code.
- Receiver name.
- Route.
- Current status.
- Payment status.
- Quote amount.
- Latest update time.

Rules:
- Do not show receiver phone.
- Do not show internal actor IDs.
- Do not show provider references.

### Eligibility Card
Eligible copy:
- Title: `This delivery can still be cancelled`
- Body: `Cancellation is available before the origin station receives the package.`

Blocked after intake copy:
- Title: `Station has received this package`
- Body: `Sender self-service cancellation is no longer available after origin intake. Contact support so the team can review the correct next step.`
- CTA: `Contact support`

Blocked after dispatch copy:
- Title: `Cancellation needs support review`
- Body: `This delivery has moved beyond self-service cancellation. Support can review delivery status, custody, and refund policy.`
- CTA: `Contact support`

Already cancelled copy:
- Title: `Delivery already cancelled`
- Body: `This delivery has already been cancelled. Open delivery detail for the latest status.`
- CTA: `Open delivery`

### Reason Picker
Control:
- Radio list.

Reason labels:
- `sender_changed_mind`: `I no longer need this delivery`
- `duplicate_booking`: `I created this delivery twice`
- `pricing_dispute`: `I do not agree with the price`
- `receiver_unavailable`: `Receiver is not available`
- `support_advised`: `Support asked me to cancel`
- `other`: `Something else`

Rules:
- Exactly one reason is required.
- Reason descriptions can be shown below each label if needed.
- Do not preselect a reason.
- Preserve selection if validation fails.

### Note Field
Shown:
- Always visible as optional, or required when `other` is selected.

Label:
- `Add a note`

Hint:
- `Optional unless you choose something else.`

Validation:
- If provided, note length must be `5` to `400`.
- If `other`, note is required and must be `5` to `400`.

Counter:
- `{count}/400`

Do not include:
- Payment card details.
- MoMo PIN.
- One-time password.
- Receiver private notes not needed for cancellation.

### Policy Preview Card
Eligible paid copy:
- Title: `Refund policy preview`
- Body: `If Kra confirms this cancellation before origin intake, an eligible confirmed payment can move to refund pending. Backend response confirms the final outcome after submission.`

Eligible unpaid copy:
- Title: `No confirmed payment yet`
- Body: `If no confirmed payment exists, cancellation can complete without a refund action.`

Blocked copy:
- Title: `Support review required`
- Body: `After intake or dispatch, cancellation and refund outcomes depend on custody, timing, and support review.`

### Confirmation
Use a confirmation sheet or modal after the form is valid.

Confirmation title:
- `Cancel this delivery?`

Confirmation body:
- `This cannot be undone in the app. Kra will stop this delivery if it is still eligible and show the refund outcome returned by the backend.`

Required acknowledgement:
- `I understand this delivery will be cancelled if it is still eligible.`

Primary destructive button:
- `Cancel delivery`

Safe secondary button:
- `Keep delivery`

Rules:
- Destructive button is disabled until acknowledgement is checked.
- Safe secondary button is visually calmer but easy to find.
- Do not use two buttons both labeled with `Cancel`.
- Close icon must behave like `Keep delivery`.

## State Specifications
### Loading
Trigger:
- Initial `get_delivery` is pending.

UI:
- Skeleton delivery card.
- Skeleton eligibility card.
- Skeleton form.

Copy:
- `Checking cancellation eligibility`

Accessibility:
- Announce `Checking cancellation eligibility.`

### Eligible
Trigger:
- Fresh delivery detail has `currentStatus=created`.

UI:
- Delivery summary.
- Eligibility card.
- Reason picker.
- Note field.
- Policy preview.
- `Review cancellation` button.
- `Keep delivery` secondary action.

Rules:
- Disable review until reason is selected and note validation passes.

### Blocked After Intake
Trigger:
- Fresh delivery detail has `currentStatus=received_at_origin` and current user is sender.

UI:
- Block card.
- Policy explanation.
- Contact support.
- Open delivery.

Rules:
- No cancellation form.
- No mutation.

### Blocked By Status
Trigger:
- Fresh delivery detail is any non-eligible status besides `created`, including dispatch and later states.

UI:
- Block card.
- Current status.
- Support route.

Rules:
- No cancellation form.
- No mutation.

### Blocked Payment State
Trigger:
- Delivery status is eligible but payment state or business policy needs special handling.

Current v1:
- Do not block solely for `pending`, `failed`, or `confirmed` if status is `created`.
- Payment affects refund preview, not cancellation eligibility.

Reserved for future:
- Provider state under review may require support if backend introduces a distinct status.

### Confirming
Trigger:
- User taps `Review cancellation` with valid form.

UI:
- Confirmation sheet/modal.

Accessibility:
- Focus moves to confirmation title.
- Acknowledgement checkbox is reachable before destructive button.

### Submitting
Trigger:
- User confirms destructive action.

UI:
- Disable buttons.
- Show progress.
- Keep confirmation context.

Copy:
- `Cancelling delivery`

Rules:
- No duplicate submit.
- Do not navigate away until response or failure.

### Submitted
Trigger:
- `cancel_delivery` succeeds.

UI:
- Success state.
- Cancellation event time.
- Payment status.
- Refund outcome.
- Next actions.

Copy:
- Title: `Delivery cancelled`
- Body: `Kra has stopped this delivery and recorded the cancellation.`

Actions:
- `Open delivery`
- `Go to history`
- `Track refund` if refund pending.

### Refund Pending
Trigger:
- Success response has `refundStatus=refund_pending`.

UI:
- Prominent refund pending card.
- Amount if `refundAmountGhs` exists.
- Reason if `refundReason` exists.
- Track refund CTA.

Copy:
- Title: `Refund pending`
- Body with amount: `Kra recorded a refund request for GHS {refundAmountGhs}.`
- Body without amount: `Kra recorded a refund request. Track refund for settlement details.`

Rules:
- Do not say refund settled.

### Rejected
Trigger:
- `cancel_delivery` returns validation, forbidden, status transition, conflict, or rate-limit error.

UI:
- Rejection state.
- Current explanation.
- Retry only if safe.
- Open delivery/support actions.

Common mappings:
- `INVALID_STATUS_TRANSITION`: `This delivery can no longer be cancelled in the app.`
- `FORBIDDEN`: `This cancellation needs staff or support review.`
- `NOT_FOUND`: `Delivery was not found.`
- `VALIDATION_ERROR`: `Check the reason and note, then try again.`
- `RATE_LIMITED`: `Too many attempts. Wait and try again.`

Rules:
- If rejection is status/forbidden, refetch delivery detail and hide submit form.

### Not Found
Trigger:
- `get_delivery` returns not found.

Copy:
- Title: `Delivery not found`
- Body: `This delivery is not available from this account.`
- CTA: `Go to history`

### Not Authorized
Trigger:
- Backend denies access.

Copy:
- Title: `You cannot cancel this delivery`
- Body: `Sign in with the sender account that created this delivery.`
- CTA: `Sign in`

### Offline
Trigger:
- Device is offline.

Copy:
- Title: `Connect before cancelling`
- Body: `Cancellation changes the delivery record and cannot be queued offline. Connect and try again.`
- CTA: `Try again`

Rules:
- No offline cancellation queue.

### API Error
Trigger:
- Read or submit fails unexpectedly.

Copy:
- Title: `Cancellation did not load`
- Body: `We could not check this delivery right now. Try again before making changes.`
- CTA: `Try again`

### Session Expired
Trigger:
- Auth expires.

Copy:
- Title: `Session expired`
- Body: `Sign in again to cancel this delivery.`
- CTA: `Sign in`

## Visual System
### Art Direction
Use a sober destructive-action style:
- Warm warning tone.
- Calm neutral surface.
- Strong delivery identity.
- Clear consequence card.
- One destructive action.
- Safe escape visible.

Avoid:
- Panic red screen.
- Confetti or success celebration.
- Hidden policy fine print.
- Equal-weight destructive and safe buttons.
- Long legal paragraphs.
- Admin override styling.

### Color Tokens
Use existing app tokens. If new roles are needed:
- `surface.cancel.base`
- `surface.cancel.warning`
- `surface.cancel.success`
- `surface.cancel.blocked`
- `text.primary`
- `text.secondary`
- `border.warning`
- `status.cancel.eligible`
- `status.cancel.blocked`
- `status.cancel.submitted`
- `status.refund.pending`
- `action.destructive`
- `action.safe`

Color behavior:
- Destructive action uses critical tone.
- Eligibility card uses attention tone, not danger.
- Submitted state uses success tone.
- Refund pending uses attention tone.
- Always pair color with text.

### Typography
Hierarchy:
- Screen title.
- Eligibility/block title.
- Delivery tracking code.
- Policy preview title.
- Reason labels.
- Destructive confirmation title.
- Outcome title.

Rules:
- Destructive button label must be explicit.
- Fine print must remain readable.
- Note field validation must be near the field.

### Layout
Recommended order:
1. Top bar.
2. Delivery summary card.
3. Eligibility or blocked card.
4. Refund policy preview.
5. Reason picker and note field when eligible.
6. Primary/secondary actions.
7. Support link.

Rules:
- Do not start with the form before showing eligibility.
- Keep destructive submit out of initial state until confirmation.
- Put `Keep delivery` close enough to be easy.

### Motion
Allowed:
- Confirmation sheet open/close.
- Submit progress.
- Success state entrance.
- Error state entrance.

Rules:
- Respect reduced motion.
- No shaking warning animation.
- No looping danger animation.

## Mobile Ergonomics
One-handed use:
- Reason list is tappable with large targets.
- Review button is reachable.
- Confirmation destructive button has clear separation from safe action.

Small phones:
- Delivery summary stacks.
- Reason labels wrap.
- Note field remains visible above keyboard.
- Confirmation sheet can scroll if needed.

Keyboard:
- Opening note field must keep validation and submit visible.
- Keyboard return should not submit destructive action.

## Accessibility Requirements
### Screen Reader
Screen must expose:
- Screen title.
- Delivery identity.
- Current status.
- Eligibility result.
- Refund policy preview.
- Reason radio group.
- Note validation.
- Confirmation title and acknowledgement.
- Submit progress.
- Success/refund result.
- Rejection reason.

Eligible accessible summary:
- `This delivery can still be cancelled before origin intake. Select a reason before continuing.`

Blocked accessible summary:
- `This delivery cannot be cancelled in the app now. Contact support for review.`

### Focus Order
Default:
- Back.
- Title.
- Delivery summary.
- Eligibility/block card.
- Policy preview.
- Reason group.
- Note field.
- Review cancellation.
- Keep delivery.

Confirmation:
- Focus confirmation title first.
- Then body.
- Then acknowledgement.
- Then destructive button.
- Then safe button.

After success:
- Focus outcome title.

After rejection:
- Focus rejection title.

### Status Announcements
Announce:
- `Checking cancellation eligibility.`
- `Cancellation reason required.`
- `Cancelling delivery.`
- `Delivery cancelled.`
- `Refund pending.`
- `This delivery can no longer be cancelled in the app.`

### Contrast And Text Size
Requirements:
- Destructive action meets contrast AA.
- Error text meets contrast AA.
- Reason list survives large text.
- Confirmation sheet supports large text without clipping buttons.

### Reduced Motion
When reduced motion is enabled:
- Use instant confirmation sheet.
- Use static progress indicator.
- Use instant success/error transition.

## Copy System
Voice:
- Direct.
- Calm.
- Consequence-aware.
- No blame.
- No refund overclaim.

Do:
- Say `before origin intake` where policy matters.
- Say `support review` after intake.
- Say `refund pending` only after backend returns it.
- Say `cannot be undone in the app` in confirmation.

Do not:
- Say `instant refund`.
- Say `automatic refund` before backend response.
- Say `cancel anytime`.
- Say `refund guaranteed`.
- Say `delete delivery`.
- Say `undo`.
- Use raw lifecycle names as visible labels.

### Core Strings
Title:
- `Cancel delivery`

Eligible title:
- `This delivery can still be cancelled`

Blocked after intake title:
- `Station has received this package`

Blocked later title:
- `Cancellation needs support review`

Reason heading:
- `Why are you cancelling?`

Note label:
- `Add a note`

Review CTA:
- `Review cancellation`

Destructive CTA:
- `Cancel delivery`

Safe CTA:
- `Keep delivery`

Submitting:
- `Cancelling delivery`

Success title:
- `Delivery cancelled`

Refund pending title:
- `Refund pending`

## Component Inventory
Claude Code should build or reuse:
- `CancelDeliveryRequestScreen`
- `CancelDeliveryTopBar`
- `CancelDeliverySummaryCard`
- `CancellationEligibilityCard`
- `CancellationPolicyPreview`
- `CancellationReasonRadioGroup`
- `CancellationNoteField`
- `CancellationConfirmationSheet`
- `CancellationSubmittingState`
- `CancellationSuccessState`
- `CancellationRefundPendingCard`
- `CancellationBlockedState`
- `CancellationRejectedState`
- `CancellationOfflineState`
- `CancellationErrorState`

Component constraints:
- Components must use `deliveryDetailResponseSchema` for read state.
- Components must use `cancelDeliveryRequestSchema` values for reasons.
- Components must use `cancelDeliveryResponseSchema` for outcome.
- Components must not call refund endpoints.
- Components must not queue offline mutation.

## Test IDs
Required test IDs:
- `screen-cancel-delivery-request`
- `cancel-delivery-loading`
- `cancel-delivery-summary`
- `cancel-delivery-eligibility`
- `cancel-delivery-blocked`
- `cancel-delivery-policy-preview`
- `cancel-delivery-reason-group`
- `cancel-delivery-reason-sender-changed-mind`
- `cancel-delivery-reason-duplicate-booking`
- `cancel-delivery-reason-pricing-dispute`
- `cancel-delivery-reason-receiver-unavailable`
- `cancel-delivery-reason-support-advised`
- `cancel-delivery-reason-other`
- `cancel-delivery-note`
- `cancel-delivery-review`
- `cancel-delivery-confirmation`
- `cancel-delivery-acknowledgement`
- `cancel-delivery-submit`
- `cancel-delivery-keep`
- `cancel-delivery-submitting`
- `cancel-delivery-success`
- `cancel-delivery-refund-pending`
- `cancel-delivery-rejected`
- `cancel-delivery-offline`
- `cancel-delivery-error`
- `cancel-delivery-support`
- `cancel-delivery-open-detail`
- `cancel-delivery-track-refund`

Test ID rules:
- Do not include tracking code in test ID.
- Keep reason IDs stable.

## Analytics Events
Recommended events:
- `cancel_delivery_viewed`
- `cancel_delivery_eligible`
- `cancel_delivery_blocked`
- `cancel_delivery_reason_selected`
- `cancel_delivery_review_tapped`
- `cancel_delivery_confirmation_viewed`
- `cancel_delivery_kept`
- `cancel_delivery_submitted`
- `cancel_delivery_succeeded`
- `cancel_delivery_rejected`
- `cancel_delivery_refund_pending_shown`
- `cancel_delivery_support_tapped`

Analytics payload:
- `currentStatus`
- `paymentStatus`
- `reasonCode`
- `hasNote` boolean
- `refundStatus`
- `refundReason` when returned
- `refundAmountGhs` when returned
- `blockedReason`
- `isStale` boolean

Do not send:
- Note text.
- Receiver name.
- Tracking code.
- Delivery ID unless analytics policy approves hashed identifiers.
- Payment ID.
- Provider reference.
- Staff actor ID.

## Performance Requirements
Targets:
- Eligibility read starts within `100ms` of screen load.
- Eligible form renders within `2 seconds` p95 after backend response.
- Submit response reflected within `2 seconds` p95.
- Confirmation opens within `150ms`.

Rules:
- Fetch delivery detail only.
- Do not fetch timeline.
- Do not fetch payment list.
- Do not fetch support threads.
- Do not preload refund tracker.
- Disable duplicate mutation calls.

## Privacy And Security
Privacy rules:
- Sender sees only their authorized delivery.
- Note field must warn against sensitive payment credentials.
- Do not show receiver phone.
- Do not show provider references.
- Do not show payment ID.
- Do not show staff IDs.
- Do not show internal event metadata.

Security rules:
- Fresh authorization before mutation is backend responsibility.
- Client must not infer access from cached delivery.
- Offline mutation is blocked.
- Idempotent mutation behavior is handled by backend/app client, but UI must still prevent double submit.
- Error details must be customer-safe.

## Edge Cases
### Status Changes While Screen Is Open
Behavior:
- Refetch before submit if data is older than product freshness threshold.
- If status changed from `created`, block submit and show latest status.

### Already Cancelled
Behavior:
- Show already cancelled state.
- Route to delivery detail or history.
- No mutation.

### Payment Pending
Behavior:
- Allow cancellation if status is `created`.
- Explain refund may not apply because payment is not confirmed.

### Payment Failed
Behavior:
- Allow cancellation if status is `created`.
- Explain refund does not apply unless support identifies a duplicate or provider issue.

### Payment Confirmed
Behavior:
- Allow cancellation if status is `created`.
- Preview policy refund, but final refund comes from backend response.

### Received At Origin
Behavior:
- Sender self-service blocked.
- Explain support/staff review.
- No mutation.

### Dispatched Or Later
Behavior:
- Self-service blocked.
- Explain support review and no automatic full refund.
- No mutation.

### Reason Other Without Note
Behavior:
- Inline validation.
- Do not open confirmation until note is valid.

### Backend Rejection After Confirmation
Behavior:
- Show rejection.
- Refetch delivery detail.
- Disable stale form.

### Network Fails During Submit
Behavior:
- Show failure.
- Do not assume cancellation failed or succeeded.
- Offer `Check status` by refetching delivery detail.

## QA Acceptance Criteria
Functional:
- Screen renders at `/(sender)/deliveries/:deliveryId/cancel`.
- Screen requires authenticated sender.
- Screen fetches `get_delivery`.
- `created` status shows eligible form.
- `received_at_origin` blocks sender cancellation.
- Later statuses block sender cancellation.
- Reason selection is required.
- `other` requires note.
- Valid note must be `5` to `400` characters.
- Confirmation appears after valid form.
- Destructive submit disabled until acknowledgement.
- Submit calls `cancel_delivery` once.
- Success renders backend response.
- Refund pending outcome renders amount/reason only when returned.
- Rejection maps backend error to customer-safe state.
- Offline state blocks mutation.
- Keep delivery routes back to detail.
- Track refund routes to refund status only after refund pending.

Contract:
- Request body uses only `reasonCode` and optional `note`.
- Reason codes match `cancelDeliveryRequestSchema`.
- Response rendering uses `cancelDeliveryResponseSchema`.
- No refund endpoint is called.
- No payment endpoint is called.
- No timeline endpoint is required.

Privacy:
- Note text not sent to analytics.
- Receiver phone absent.
- Provider reference absent.
- Payment ID absent.
- Staff IDs absent.
- Raw event metadata absent.

Accessibility:
- Reason radio group has legend.
- Note field has error text.
- Confirmation focus is trapped.
- Destructive action has clear label.
- Success/rejection is announced.
- Large text does not clip confirmation buttons.
- Reduced motion works.

Visual:
- Destructive action is clearly destructive.
- Safe action is clearly available.
- Policy preview is visible before confirmation.
- Blocked state explains next step.
- Success/refund outcome is unmistakable.

## Implementation Notes For Claude Code
Build this screen as a strict sender self-service cancellation flow.

Use:
- `get_delivery`.
- `deliveryDetailResponseSchema`.
- `cancel_delivery`.
- `cancelDeliveryRequestSchema`.
- `cancelDeliveryResponseSchema`.
- `stationCatalog` for route labels.

Do not use:
- `refund_payment`.
- `settle_refund_payment`.
- `initialize_payment`.
- `verify_payment`.
- `get_delivery_timeline`.
- Admin cancellation paths.
- Offline mutation queue.

Implementation sequence:
1. Add typed `get_delivery` load for route `deliveryId`.
2. Add eligibility mapper that allows submit only for `currentStatus=created`.
3. Add blocked-state mapper for after-intake and later statuses.
4. Add reason picker from schema-approved reason codes.
5. Add note validation with `other` requiring note.
6. Add policy preview from status/payment state.
7. Add confirmation sheet with acknowledgement.
8. Add mutation call to `cancel_delivery`.
9. Add success/refund/rejection/offline/error states.
10. Add accessibility announcements and focus management.
11. Add privacy-safe analytics.
12. Add tests for eligible, blocked, validation, submit, success, refund pending, rejection, and offline states.

## Open Product Decisions
No blocking decisions for v1.

Future decisions:
- Sender cancellation after origin intake.
- Return-to-sender linked delivery flow.
- Support escalation form inside cancellation screen.
- Backend cancellation eligibility endpoint.
- More granular cancellation reason taxonomy.
- Dedicated payment/refund timeline in cancellation result.

These decisions must not be implied by this screen.

## Final Handoff Summary
Claude Code should build `CancelDeliveryRequest` as a strict destructive-action flow. It must fetch fresh delivery detail, allow sender self-service cancellation only when `currentStatus=created`, collect a schema-approved reason and valid note, require explicit confirmation, call `cancel_delivery` once, render the authoritative cancellation/refund response, block offline/stale/post-intake/later-status cancellation, and hide provider references, payment IDs, receiver phone, staff IDs, and raw event metadata.

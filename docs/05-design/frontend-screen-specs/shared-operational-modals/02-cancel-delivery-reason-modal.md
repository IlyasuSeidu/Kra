# Cancel Delivery Reason Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `CancelDeliveryReasonModal` |
| Component target | shared cancellation modal for `apps/mobile`, `apps/web`, and `apps/admin` |
| Primary test ID | `modal-cancel-delivery-reason` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 Launch Critical |
| Used by | sender cancellation request, quote decline cancellation, support-assisted cancellation, admin cancellation review |
| Backend coverage | `cancel_delivery` |
| Request schema | `cancelDeliveryRequestSchema` |
| Response schema | `cancelDeliveryResponseSchema` |
| Required states | `closed`, `opening`, `loading_context`, `eligible_created`, `eligible_received_at_origin_staff`, `reason_selecting`, `note_entry`, `reviewing_policy`, `confirming`, `submitting`, `submitted`, `blocked_by_status`, `sender_after_intake_blocked`, `station_scope_denied`, `permission_denied`, `validation_error`, `network_error`, `server_rejected`, `closing` |

## Product Job
`CancelDeliveryReasonModal` collects the exact cancellation reason and optional cancellation note before a host surface calls `cancel_delivery`. It must make cancellation consequences clear, prevent accidental submission, preserve audit quality, and keep refund expectations aligned with backend policy.

The modal answers:
- `Why is this delivery being cancelled?`
- `Who is cancelling it?`
- `Is this actor allowed to cancel at the current lifecycle state?`
- `What refund outcome may apply?`
- `What audit note is needed?`
- `What happens if the user backs out?`
- `What backend result should the host display after success?`

The user should be able to:
- See the delivery identity in a compact way.
- Understand whether cancellation is still allowed.
- Select one approved reason code.
- Add a note when the reason or workflow requires more context.
- Review refund and custody consequences.
- Cancel safely without mutation.
- Confirm cancellation once.
- Recover from validation, permission, stale state, network, and backend rejection.

This modal is not:
- A complete cancellation page.
- A refund approval tool.
- A refund settlement tool.
- A receiver refusal workflow.
- A return-to-sender workflow.
- A support thread.
- A manual custody exception panel.
- A payment retry flow.
- A station status tool.
- A permission bypass.

## Strategic Role
Cancellation is one of the first trust tests for Kra. It affects the sender, receiver, station workload, driver assignment, custody chain, payment state, support history, and refund tracking. The modal must feel fast enough for legitimate self-service but serious enough that no one can cancel a paid or physically handled delivery by accident.

Core principle:
- The host owns data fetching and mutation.
- The modal owns cancellation intent, reason capture, policy acknowledgement, validation, focus, and submit gating.
- The backend remains the source of truth for permission, lifecycle eligibility, refund result, event creation, and payment state.
- Refund wording before submit is a policy preview, not a settlement promise.
- No cancellation may be queued offline.
- No cancellation may happen from opening, closing, backdrop tap, Escape key, or route transition.

## Audience
Primary users:
- Senders cancelling before origin intake.
- Senders cancelling because the quote changed or the booking is no longer needed.
- Support users assisting a sender with a valid cancellation.
- Admin users reviewing cancellation when the delivery is still within allowed lifecycle bounds.
- Station operators cancelling after origin intake only when backend station scope and capability permit it.

Secondary users:
- Finance reviewers checking refund wording.
- Operations reviewers checking custody impact.
- QA validating reason, note, submit, and blocked states.
- Accessibility reviewers checking modal behavior and screen reader output.
- Claude Code implementing shared modal behavior later.

Non-users:
- Anonymous visitors.
- Receivers using public tracking.
- Drivers cancelling assigned runs.
- Couriers recording failed attempts.
- Webhook processors.
- Scheduled backend jobs.
- AI agents acting without human confirmation.

## Current Backend Reality
Implemented endpoint:
- `cancel_delivery`

Implemented request fields:
- `deliveryId`
- `reasonCode`
- optional `note`

Allowed `reasonCode` values:
- `sender_changed_mind`
- `duplicate_booking`
- `pricing_dispute`
- `receiver_unavailable`
- `support_advised`
- `other`

Implemented note rule:
- If `note` is present, it is trimmed and must be between `5` and `400` characters.

Implemented eligibility:
- Delivery must exist.
- Actor must be allowed to access the delivery.
- Actor must have `cancel_eligible_delivery`.
- Delivery status must be `created` or `received_at_origin`.
- Sender cancellation at `received_at_origin` is forbidden and requires staff or admin intervention.
- Station operator cancellation at `received_at_origin` is forbidden when the actor is outside the origin station scope.
- Dispatch and later statuses reject with `INVALID_STATUS_TRANSITION`.

Implemented refund decision:
- If no confirmed payment exists, response returns `refundStatus=not_applicable`.
- If the delivery is `created` and has confirmed payment, policy may create `refundStatus=refund_pending`.
- If the delivery is `received_at_origin` and staff/admin cancellation is allowed, policy may create `refundStatus=refund_pending` with a handling-fee refund reason.
- If refund policy requires manual review or amount is zero, response returns `refundStatus=not_applicable`.

Implemented success result:
- Delivery status becomes `cancelled`.
- Payment status becomes `refund_pending` only when backend created a pending refund.
- Current custody role and actor are cleared.
- Latest delivery event becomes `delivery_cancelled`.
- Event metadata records reason, optional note, and refund result.
- Response includes `eventId`, `deliveryId`, `status=cancelled`, `paymentStatus`, `occurredAt`, `refundStatus`, and optional refund fields.

Frontend implication:
- The modal can preview policy but must render final refund state only from the response.
- The modal must not choose refund amount.
- The modal must not call refund endpoints.
- The modal must not expose internal payment IDs, provider references, actor IDs, or raw event metadata.
- The modal must be reusable across sender, support, admin, and station-scoped staff hosts.

## Source References
External references used for this modal:
- [WAI-ARIA Authoring Practices: Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports modal focus containment, inert background behavior, Escape handling, initial focus placement, role `dialog`, `aria-modal`, labels, descriptions, and returning focus to the invoking element.
- [Apple Human Interface Guidelines: Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts): supports clear interruptive confirmation for consequential actions, concise language, and a visible Cancel option.
- [Android Developers: Dialogs](https://developer.android.com/develop/ui/views/components/dialogs): supports dialog action layout, Back handling, cancellation callbacks, and separating positive and negative actions.
- [Material Design 3: Dialogs](https://m3.material.io/components/dialogs/overview): supports focused task interruption, dialog actions, and compact decision surfaces.
- [Material Design 3: Radio Button](https://m3.material.io/components/radio-button/overview): supports exclusive single-choice reason selection.
- [Material Design 3: Text Fields](https://m3.material.io/components/text-fields/overview): supports note entry, validation, supporting text, and character counter behavior.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports explicit validation messages for missing reason and invalid note length.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit progress, failure, and success announcements.
- [WCAG 2.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html): supports guarding against accidental activation on touch and pointer input.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable mobile and web action targets.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/01-confirm-destructive-action-modal.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/22-cancel-delivery-request.md`
- `docs/03-business/cancellation-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/refunds.ts`
- `services/api/src/cancellations.ts`
- `services/api/src/app.ts`

## Design Brief
Audience:
- Authenticated users cancelling a delivery in a policy-sensitive and money-sensitive moment.

Context of use:
- Mobile sender flow, mobile operations flow, support console, and admin console.

Entry point:
- Host surface opens the modal from an eligible cancel action.

Success state:
- The user confirms with an approved reason and the host receives a valid cancellation response.

Primary action:
- `Cancel delivery`

Safe action:
- `Keep delivery`

Navigation model:
- Modal dialog on web/admin.
- Bottom sheet or modal screen sheet on mobile.
- Host route remains the source of context.

Density:
- Medium. The modal must fit on small screens but show enough policy detail to avoid refund and custody confusion.

Visual thesis:
- A precise cancellation checkpoint with a stern reason rail, a calm policy card, and one irreversible action.

Restraint rule:
- Do not add illustrations, marketing copy, unrelated delivery data, full legal policy text, or admin-only details in sender flows.

Product lens:
- Trust-critical destructive action with payment and custody impact.

System stance:
- Shared modal powered by design-system primitives and the destructive-action safety pattern.

Interaction thesis:
- Choose reason, add note when needed, review consequence, then confirm once.

Signature move:
- A live policy card that changes from `Eligible before origin intake` to `Staff intervention required` or `Support review required` based on host context.

Activation event:
- Host calls `cancel_delivery` after valid reason, valid note, explicit confirmation, fresh delivery state, and online status.

## Relationship To Confirm Destructive Action Modal
`CancelDeliveryReasonModal` should reuse the same accessibility, focus, action hierarchy, and submit lockout rules as `ConfirmDestructiveActionModal`. It is a specialized modal because cancellation needs reason codes, refund preview, lifecycle eligibility, and custody wording.

Composition options:
- Use `ConfirmDestructiveActionModal` primitives internally.
- Keep a distinct `CancelDeliveryReasonModal` component and test ID.
- Use the shared danger button, safe button, validation summary, busy state, and status-message system.
- Keep cancellation-specific reason picker, note field, policy card, and refund card in this modal.

Do not:
- Render two stacked modals.
- Ask for the same confirmation twice.
- Let the generic modal decide cancellation eligibility.
- Rebuild focus management differently from the shared modal.
- Hide the reason picker inside a generic confirmation footer.

## UX Principles
The modal should feel:
- exact
- serious
- humane
- fast to scan
- policy-aware
- refund-aware
- custody-aware
- recoverable
- audit-ready

The modal must not feel:
- casual
- alarmist
- vague
- punitive
- like a support dead end
- like cancellation already happened
- like refund has already been paid
- like staff can bypass lifecycle policy

Primary promise:
- `Nothing is cancelled until you confirm.`

Operational promise:
- `The cancellation reason and result will be recorded.`

Refund promise:
- `Refund outcome is confirmed only after the backend accepts cancellation.`

## Host Responsibilities
The host must provide:
- `deliveryId`
- delivery display reference
- current lifecycle status
- payment status
- role context
- station context when actor is station scoped
- latest fetched timestamp
- whether the delivery is from a changed quote path
- whether this is sender, support, admin, or station workflow
- whether the app is online
- cancel mutation callback
- close callback
- success callback
- support route callback
- current safe return target

The host must fetch or refresh:
- Current delivery detail before opening or before enabling confirm.
- Current payment status if available through delivery detail.
- Current permission state when role can change during session.

The host must not:
- Let the modal submit from stale cached-only data.
- Let the modal submit while offline.
- Let the modal submit without `deliveryId`.
- Let the modal submit after route context has changed.
- Let the modal bypass permission or lifecycle checks.
- Render internal IDs that are not intended for the current role.
- Store note text outside the current interaction unless submitted.

## Modal Responsibilities
The modal must:
- Render cancellation-specific copy and controls.
- Keep focus inside the modal while open.
- Return focus to the invoking element or safe route on close.
- Require one reason code.
- Enforce note validation before submit.
- Require note for `other`.
- Require confirmation before mutation.
- Disable destructive action while invalid, submitting, or offline.
- Prevent repeated submission.
- Show backend rejection without losing selected reason or note.
- Emit telemetry events without sensitive note body.
- Provide accessible labels, descriptions, errors, and status messages.
- Let the host decide what happens after success.

The modal must not:
- Call `cancel_delivery` before explicit confirmation.
- Infer refund amount by itself.
- Edit package, receiver, payment, or station data.
- Open support thread automatically.
- Create issue records.
- Retry cancellation automatically.
- Save cancellation note as draft after close.
- Show raw event metadata.
- Show provider reference.
- Show payment provider internal reference.
- Show actor IDs.
- Show receiver phone unless the host already has a role-safe display rule.

## Entry Conditions
The modal may open when:
- Host has a `deliveryId`.
- Host has current delivery detail or is able to load it immediately.
- Actor is authenticated.
- Actor is attempting a known cancellation workflow.
- Delivery is not already cancelled in host state.

The modal should open in `loading_context` when:
- Host needs to refresh delivery state.
- Host needs to revalidate permission.
- Host needs to hydrate payment status.

The modal should not open when:
- User is unauthenticated.
- Session is expired.
- Account is locked.
- Route is permission denied.
- Delivery context is missing.
- Host is already submitting another high-risk mutation for the same delivery.

## Eligibility Matrix
| Delivery status | Sender | Support/admin | Station operator at origin | Station operator outside origin | Modal behavior |
| --- | --- | --- | --- | --- | --- |
| `created` | allowed when capability exists | allowed when capability exists | allowed only if host exposes action and capability exists | allowed only if backend access permits | show eligible cancellation |
| `received_at_origin` | blocked | allowed when capability exists | allowed when origin scope matches | blocked | show staff-only eligible or block |
| `awaiting_driver_assignment` | blocked | blocked unless future backend changes | blocked | blocked | show blocked by dispatch preparation |
| `assigned_to_driver` | blocked | blocked unless exception workflow | blocked | blocked | show support or admin exception route |
| `dispatched_from_origin` | blocked | blocked unless exception workflow | blocked | blocked | show post-dispatch block |
| `in_transit` | blocked | blocked unless exception workflow | blocked | blocked | show post-dispatch block |
| `received_at_destination` | blocked | blocked unless exception workflow | blocked | blocked | show destination-stage block |
| `awaiting_receiver_pickup` | blocked | blocked unless exception workflow | blocked | blocked | show receiver pickup block |
| `awaiting_final_mile_assignment` | blocked | blocked unless exception workflow | blocked | blocked | show final-mile block |
| `assigned_for_final_mile` | blocked | blocked unless exception workflow | blocked | blocked | show final-mile block |
| `out_for_delivery` | blocked | blocked unless exception workflow | blocked | blocked | show final-mile block |
| `delivered` | blocked | blocked | blocked | blocked | show delivered block |
| `closed` | blocked | blocked | blocked | blocked | show closed block |
| `cancelled` | blocked | blocked | blocked | blocked | show already cancelled |

## Reason Codes
Render reason choices in this order unless a host passes a narrower allowed list:
- `sender_changed_mind`
- `duplicate_booking`
- `pricing_dispute`
- `receiver_unavailable`
- `support_advised`
- `other`

Reason labels:
- `sender_changed_mind`: `Plans changed`
- `duplicate_booking`: `Booked twice`
- `pricing_dispute`: `Price issue`
- `receiver_unavailable`: `Receiver cannot accept`
- `support_advised`: `Support advised cancellation`
- `other`: `Other reason`

Reason descriptions:
- `sender_changed_mind`: `The sender no longer needs this delivery.`
- `duplicate_booking`: `The same delivery was created more than once.`
- `pricing_dispute`: `The sender does not accept the current price or quote change.`
- `receiver_unavailable`: `The receiver cannot accept or collect the package.`
- `support_advised`: `Kra support asked the user to cancel this delivery.`
- `other`: `The reason does not fit the available choices.`

Reason availability by host:
- Sender flow may show all six reasons.
- Quote decline path may preselect `pricing_dispute`.
- Support-assisted flow may show all six reasons and may preselect `support_advised`.
- Admin flow may show all six reasons unless the host has a case-specific reason.
- Station post-intake flow should prefer `support_advised`, `receiver_unavailable`, or `other` where policy allows.

Reason rules:
- Exactly one reason must be selected.
- Reason choices must map directly to backend enum values.
- Labels must not be submitted to the backend.
- Backend enum values may be hidden from users except in technical admin inspection.
- Host may preselect a reason only when the user path has already made the reason explicit.
- User must still be able to review preselected reason before submit.

## Note Rules
Field label:
- `Add a cancellation note`

Field hint when optional:
- `Optional. Add context for support and audit history.`

Field hint when required:
- `Required for this reason. Use 5 to 400 characters.`

Validation rules:
- Empty note is allowed for all reasons except `other`.
- If note is present, trim leading and trailing whitespace before validation.
- Trimmed note must be at least `5` characters.
- Trimmed note must be at most `400` characters.
- `other` requires a valid note.
- Whitespace-only note is treated as empty.
- Newlines are allowed but should be collapsed for preview.
- Do not allow note to contain unsupported control characters.
- Do not submit a note key when note is empty.

Recommended note behavior:
- Show remaining characters after the user starts typing.
- Show inline validation only after blur, attempted submit, or clear invalid state.
- Preserve note text after backend rejection.
- Clear note text when user closes without submit.
- Do not store note text in analytics.
- Do not show note text in toast.

Validation copy:
- Missing reason: `Choose why this delivery is being cancelled.`
- Missing `other` note: `Add a short note for other reason.`
- Note too short: `Use at least 5 characters or leave the note empty.`
- Note too long: `Keep the note under 400 characters.`
- Unsupported content: `Remove unsupported characters from the note.`

## Refund Preview Rules
The modal can preview policy but cannot promise final settlement.

Before origin intake:
- Title: `Refund may be started after cancellation`
- Body for paid delivery: `If the backend accepts this cancellation before origin intake, the payment can move to refund pending.`
- Body for unpaid delivery: `No payment refund is needed because this delivery is not confirmed as paid.`

After origin intake before dispatch:
- Title: `Staff cancellation may keep handling fee`
- Body: `If staff cancellation is accepted after intake and before dispatch, refund policy may keep the GHS 5 handling fee.`

After dispatch or later:
- Title: `Self-service cancellation is no longer available`
- Body: `This package is already in operational movement. Use support or an admin exception workflow.`

No confirmed payment:
- Title: `No refund action expected`
- Body: `The backend may return no refund action when there is no confirmed payment.`

Backend success with `refund_pending`:
- Title: `Cancellation recorded. Refund pending.`
- Body: `The refund is now pending review or provider processing.`
- If `refundAmountGhs` exists, show the amount.
- If `refundReason` exists, show role-safe reason copy.

Backend success with `not_applicable`:
- Title: `Cancellation recorded. No refund action returned.`
- Body: `The backend did not create a refund action for this cancellation.`

Refund preview must not:
- Say `refund paid`.
- Say `instant refund`.
- Say provider settlement is complete.
- Show provider references.
- Let the user edit refund amount.
- Trigger refund endpoints.

## Custody And Lifecycle Copy
For `created`:
- `The package has not been accepted at the origin station yet.`

For `received_at_origin` and sender:
- `This package has already been accepted at the origin station. Staff or admin help is required.`

For `received_at_origin` and staff/admin:
- `This package has already entered Kra custody. The cancellation reason will be recorded with the audit trail.`

For dispatch or later:
- `This package has already moved into transport or delivery operations. Cancellation must follow an exception workflow.`

For delivered or closed:
- `This delivery is complete. Use support or dispute flow if there is still a problem.`

Custody copy must:
- Use delivery status names for clarity when helpful.
- Use human copy before technical status.
- Avoid accusing the user.
- Avoid implying physical custody changed because the modal opened.
- Avoid exposing staff actor IDs in sender flow.

## Information Architecture
Default layout:
1. Modal header.
2. Delivery identity strip.
3. Eligibility or block card.
4. Reason picker.
5. Note field.
6. Refund and custody preview card.
7. Validation summary when needed.
8. Action footer.

Mobile layout:
1. Sheet drag handle only if platform convention requires it.
2. Header and safe close action.
3. Scrollable body.
4. Sticky action footer.
5. Native keyboard avoidance for note entry.

Admin/web layout:
1. Centered modal with max width.
2. Scrollable body when content exceeds viewport.
3. Sticky footer inside modal.
4. Visible close button only if it does not compete with `Keep delivery`.

Small-screen priority:
1. Header.
2. Delivery reference.
3. Block or eligibility status.
4. Reason picker.
5. Primary and safe actions.
6. Refund details.
7. Secondary policy context.

## Header
Default title:
- `Cancel delivery`

Sender subtitle:
- `Choose a reason before this delivery is cancelled.`

Staff/admin subtitle:
- `Record the cancellation reason and review the policy impact.`

Blocked subtitle:
- `This delivery cannot be cancelled from this step.`

Header must include:
- Clear title.
- Optional short subtitle.
- Safe close affordance.

Header must not include:
- Refund amount.
- Raw status codes as the first line.
- Long policy text.
- Support case details.

## Delivery Identity Strip
Show:
- User-facing delivery reference.
- Origin and destination station names when role-safe.
- Current lifecycle label.
- Payment label when relevant.

Do not show:
- Raw payment ID.
- Provider reference.
- Internal actor ID.
- Internal station ID unless admin host already shows IDs.
- Receiver phone in sender modal unless already visible on the host screen.
- Full address if not already allowed by the host.

Identity copy:
- `Delivery {deliveryReference}`
- `Current status: {statusLabel}`
- `Payment: {paymentStatusLabel}`

If identity is unavailable:
- Show `Delivery details are loading.`
- Disable destructive action.
- Keep safe close available.

## Eligibility Card
Eligible before intake:
- Icon tone: caution.
- Title: `Eligible before origin intake`
- Body: `This delivery can still be cancelled because the package has not been accepted at origin.`

Eligible staff after intake:
- Icon tone: warning.
- Title: `Staff cancellation before dispatch`
- Body: `The package has entered Kra custody. Cancellation will be recorded with audit details and may keep the handling fee.`

Sender after intake blocked:
- Icon tone: warning.
- Title: `Staff help required`
- Body: `The package has already been accepted at origin. Contact support or station staff for cancellation review.`

Post-dispatch blocked:
- Icon tone: blocked.
- Title: `Cancellation is no longer self-service`
- Body: `The package has moved into operational delivery. Use an exception or dispute workflow.`

Already cancelled:
- Icon tone: neutral.
- Title: `Already cancelled`
- Body: `This delivery has already been cancelled.`

Delivered or closed:
- Icon tone: neutral.
- Title: `Delivery already complete`
- Body: `Cancellation is not available after completion. Use support if there is still an issue.`

Permission denied:
- Icon tone: blocked.
- Title: `You cannot cancel this delivery`
- Body: `Your current role does not have permission for this cancellation.`

Station scope denied:
- Icon tone: blocked.
- Title: `Outside station scope`
- Body: `Only the origin station or an authorized admin can cancel after origin intake.`

## Reason Picker
Control:
- Radio group for web/admin.
- Native radio list or accessible single-select cards for mobile.

Group label:
- `Cancellation reason`

Required indicator:
- Use text, not color only.

Each option must include:
- Label.
- Short description.
- Selected state.
- Tap target at least 44 by 44 CSS pixels.

Reason picker must:
- Be reachable by keyboard.
- Use arrow key behavior if implemented as radio group.
- Announce selected option.
- Preserve selection after validation or backend rejection.
- Allow host preselection.
- Avoid list virtualization because there are only six options.

Reason picker must not:
- Allow multiple reasons.
- Submit label text.
- Allow free text reason outside `note`.
- Hide `other` note requirement.
- Reorder options differently per platform unless host has a proven reason.

## Note Field
Control:
- Multi-line text area.

Rows:
- 3 visible rows by default.
- Expand or scroll internally after content grows.

Character count:
- Show `0/400` only after focus or input.
- Announce count only when near limit or invalid.

Autocomplete:
- Off for sensitive admin notes when platform permits.
- Plain text only.

Keyboard:
- Mobile should use sentence text keyboard.
- Return key inserts new line unless platform footer submit is explicit.

Privacy:
- Do not log note body.
- Do not include note body in screen analytics.
- Do not persist note body after safe close.

## Confirmation Step
The modal may use one of two patterns:
- Single-step confirmation: reason and policy card remain visible, footer button says `Cancel delivery`.
- Two-step inline confirmation: after `Review cancellation`, the modal shows a final compact confirmation panel inside the same modal.

Preferred v1 pattern:
- Use two-step inline confirmation for sender flow.
- Use single-step confirmation for support/admin only when host already has an explicit destructive confirmation wrapper.

Two-step sender flow:
1. User selects reason and optional note.
2. User taps `Review cancellation`.
3. Modal changes footer to `Keep delivery` and `Cancel delivery`.
4. Policy card becomes final confirmation copy.
5. User taps `Cancel delivery`.
6. Host mutation runs.

Support/admin flow:
- Host may set `requiresFinalReview=true`.
- If true, use the same two-step pattern.
- If false, keep single-step but still require valid reason and note rules.

Confirmation copy:
- `This cannot be undone from this screen. The cancellation reason will be recorded.`

High-risk staff copy:
- `This package has entered Kra custody. Confirm only if cancellation is approved for this stage.`

## Action Footer
Default valid form:
- Secondary: `Keep delivery`
- Primary before review: `Review cancellation`

Confirmation state:
- Secondary: `Keep delivery`
- Destructive primary: `Cancel delivery`

Submitting:
- Secondary disabled.
- Primary disabled.
- Button label: `Cancelling...`
- Status text: `Cancelling delivery...`

Submitted:
- Host should close modal or replace body with success result depending route.

Blocked state:
- Secondary: `Close`
- Primary: `Contact support` or `Open delivery`

Action hierarchy:
- Safe action must be visible and easy.
- Destructive action must be visually distinct and not visually larger than necessary.
- Destructive action must be disabled until all rules pass.
- Primary and secondary labels must not be ambiguous.

Do not:
- Use `OK`.
- Use `Submit`.
- Use `Continue` for destructive action.
- Use only icon buttons for action footer.
- Put destructive action where a close button usually sits.
- Trigger submit on Enter while focus is in the note field.

## State Machine
`closed`:
- Modal is not rendered.
- No local reason or note state is retained.

`opening`:
- Modal shell appears.
- Focus moves to title or first actionable element based on state.

`loading_context`:
- Delivery context is refreshing.
- Reason picker is disabled.
- Safe close remains enabled.

`eligible_created`:
- Current status allows sender self-service when permission exists.
- Reason picker is enabled.
- Refund preview reflects pre-intake policy.

`eligible_received_at_origin_staff`:
- Current status allows staff/admin cancellation when permission and scope exist.
- Reason picker is enabled.
- Custody audit warning is visible.

`reason_selecting`:
- User can choose reason.
- CTA remains disabled until reason is selected.

`note_entry`:
- Note field is active.
- CTA reflects current validation.

`reviewing_policy`:
- User has valid input and sees final consequence copy.
- Destructive CTA is enabled unless offline or stale.

`confirming`:
- User is at final confirmation step.
- No mutation has run yet.

`submitting`:
- Host mutation is running.
- Inputs and close controls are locked except platform emergency route change.

`submitted`:
- Backend accepted cancellation.
- Host receives response.
- Modal may close into success screen or render a compact result.

`blocked_by_status`:
- Delivery lifecycle state is not eligible.
- Reason picker is hidden or disabled.
- Support or delivery route is offered.

`sender_after_intake_blocked`:
- Sender sees staff-help copy.
- Cancel mutation cannot run.

`station_scope_denied`:
- Station actor is outside allowed origin scope.
- Cancel mutation cannot run from frontend state.

`permission_denied`:
- Actor lacks action permission.
- Cancel mutation cannot run from frontend state.

`validation_error`:
- Missing reason or invalid note.
- Error summary and inline errors are visible.

`network_error`:
- Mutation did not reach backend or response timed out.
- User can retry when online.

`server_rejected`:
- Backend returned validation, permission, status, conflict, rate-limit, or service error.
- Preserve reason and note.

`closing`:
- Safe close animation or route return.
- No mutation may be triggered.

## Data Contract
Component props:
- `isOpen: boolean`
- `deliveryId: string`
- `deliveryReference: string`
- `currentStatus: DeliveryStatus`
- `paymentStatus?: PaymentStatus`
- `originStationName?: string`
- `destinationStationName?: string`
- `actorRole: "sender" | "station_operator" | "support" | "admin" | "finance_admin" | string`
- `actorStationId?: string`
- `originStationId?: string`
- `workflow: "sender_self_service" | "quote_decline" | "support_assisted" | "admin_review" | "station_supervised"`
- `initialReasonCode?: CancelDeliveryReasonCode`
- `allowedReasonCodes?: CancelDeliveryReasonCode[]`
- `requiresFinalReview?: boolean`
- `isOnline: boolean`
- `lastRefreshedAt?: string`
- `onRefreshContext: () => Promise<DeliveryContext>`
- `onCancelDelivery: (input: CancelDeliveryModalSubmitInput) => Promise<CancelDeliveryResponse>`
- `onClose: () => void`
- `onSuccess: (response: CancelDeliveryResponse) => void`
- `onSupport: () => void`
- `onOpenDelivery: () => void`

Internal input:
- `reasonCode`
- `note`
- `confirmed`

Submit payload:
- `deliveryId`
- `reasonCode`
- `note` only when trimmed note is non-empty

Never submit:
- reason label
- refund amount
- actor display name
- delivery status
- payment status
- provider reference
- raw metadata

## Role Rules
Sender:
- Can use modal for `created` only.
- Sees sender-safe policy copy.
- Sees support route for `received_at_origin` and later.
- Does not see station scope internals.
- Does not see admin audit labels.

Support:
- Can use modal when backend permission allows.
- Sees support-assisted copy.
- Must record reason.
- Should add note when acting from a support case.
- Cannot override backend lifecycle.

Admin:
- Can use modal when backend permission allows.
- Sees audit language.
- Should add note for non-standard decisions.
- Cannot edit refund result in this modal.

Station operator:
- Can use modal only when host and backend allow cancellation.
- Must be scoped to origin station for `received_at_origin`.
- Sees custody warning.
- Cannot cancel outside origin station scope.

Finance admin:
- Should not use this modal for refund decisions.
- May see cancellation result elsewhere.
- Must use refund review or settlement modal for money movement actions.

Receiver:
- Must not use this modal.
- Receiver refusal belongs to failed attempt or issue workflow.

## Workflow Variants
`sender_self_service`:
- For sender cancellation before origin intake.
- Uses two-step inline confirmation.
- Requires reason.
- Requires note only for `other`.
- Shows refund preview.

`quote_decline`:
- For sender declining changed quote before payment or before fulfillment begins.
- Preselects `pricing_dispute`.
- Note may be preset by host only if route copy already explained the decision.
- User still reviews before cancellation.

`support_assisted`:
- For support helping a sender.
- May preselect `support_advised`.
- Note is recommended when there is a support case.
- Shows audit wording.

`admin_review`:
- For admin cancellation review while backend allows.
- Shows audit and policy card.
- Note is recommended.
- Does not expose refund settlement controls.

`station_supervised`:
- For allowed post-intake pre-dispatch station cancellation.
- Shows origin-station scope.
- Shows handling-fee policy.
- Requires current station context.

## Error Handling
Validation error:
- Show inline field error.
- Focus first invalid field after submit attempt.
- Keep user input.

`NOT_FOUND`:
- Title: `Delivery not found`
- Body: `This delivery may have been removed or you may no longer have access.`
- CTA: `Close`

`FORBIDDEN`:
- Title: `Cancellation not allowed`
- Body: Use role-safe wording from known context, not raw backend text when it exposes internals.
- CTA: `Contact support` or `Close`

`INVALID_STATUS_TRANSITION`:
- Title: `Status changed`
- Body: `This delivery can no longer be cancelled from here. Refresh the delivery to see the latest status.`
- CTA: `Refresh delivery`

`VALIDATION_ERROR`:
- Title: `Check cancellation details`
- Body: `Fix the highlighted fields and try again.`
- Focus first invalid field.

`RATE_LIMITED`:
- Title: `Too many attempts`
- Body: `Wait a moment before trying again.`
- CTA: `Close`

Network timeout:
- Title: `Connection lost`
- Body: `Cancellation was not confirmed. Check your connection and try again.`
- CTA: `Try again`

Unknown server error:
- Title: `Cancellation could not be completed`
- Body: `The delivery was not cancelled. Try again or contact support.`
- CTA: `Try again`

Error handling must:
- Avoid saying cancellation succeeded unless response is successful.
- Avoid clearing input on rejected submit.
- Avoid automatic retries.
- Refresh context after status-transition rejection.
- Preserve safe close.

## Offline Rules
Offline behavior:
- Modal may open only to explain offline block if host already has context.
- Reason picker may remain visible but destructive action is disabled.
- No cancellation request is queued.
- No cancellation request is stored for later automatic send.
- User can close and retry when online.

Offline copy:
- Title: `You are offline`
- Body: `Cancellation must be confirmed by the server. Reconnect before cancelling this delivery.`
- CTA: `Close`

When connection returns:
- Host must refresh delivery detail before enabling confirm.
- Modal must not assume the previously loaded status is still eligible.

## Privacy And Safety
Sensitive data never shown in this modal:
- payment provider references
- internal payment IDs
- raw event metadata
- staff actor IDs
- full audit payload
- security tokens
- receiver OTP
- private receiver phone when not already role-safe
- private address fields when not already role-safe

Sensitive data never logged:
- note body
- full delivery address
- receiver phone
- provider reference
- payment ID
- actor ID

Allowed telemetry data:
- modal opened
- workflow
- role bucket
- current status
- selected reason code
- whether note was present
- note length bucket
- validation failure type
- submit result
- backend error code
- refund status returned

## Telemetry
Events:
- `cancel_delivery_reason_modal_opened`
- `cancel_delivery_reason_context_loaded`
- `cancel_delivery_reason_selected`
- `cancel_delivery_note_started`
- `cancel_delivery_note_validation_failed`
- `cancel_delivery_review_viewed`
- `cancel_delivery_modal_cancelled`
- `cancel_delivery_submitted`
- `delivery_cancel_requested`
- `cancel_delivery_succeeded`
- `cancel_delivery_rejected`
- `cancel_delivery_refund_pending_shown`
- `cancel_delivery_blocked`
- `cancel_delivery_support_tapped`

Required event properties:
- `deliveryId`
- `workflow`
- `actorRole`
- `currentStatus`
- `reasonCode` when selected or submitted
- `hasNote`
- `noteLengthBucket`
- `refundStatus` when returned
- `errorCode` when rejected

Do not include:
- note body
- provider reference
- receiver phone
- full address
- raw backend payload
- access token

Analytics timing:
- Emit opened when modal becomes visible.
- Emit reason selected only when selection changes by user action.
- Emit submitted once per mutation attempt.
- Emit success only after backend success response.
- Emit rejected only after backend or network rejection.

## Accessibility
Dialog semantics:
- Web/admin root uses `role="dialog"`.
- Use `aria-modal="true"`.
- Set `aria-labelledby` to modal title.
- Set `aria-describedby` to concise consequence text when present.
- Background content is inert while modal is open.

Focus:
- On eligible open, focus modal title or reason group label.
- On destructive confirmation open, focus the safest action when the action is hard to reverse.
- On validation error, focus first invalid field or error summary.
- On submit error, focus error heading.
- On close, return focus to invoking action when still present.

Keyboard:
- Tab stays inside modal.
- Shift Tab cycles inside modal.
- Escape closes only before final submit starts.
- Escape must not submit.
- Enter in note field inserts line break or does nothing, depending platform control.
- Space selects focused radio option.
- Arrow keys move radio selection when implemented as web radio group.

Screen reader:
- Announce modal title.
- Announce eligibility status.
- Announce field errors.
- Announce submitting state.
- Announce backend rejection.
- Announce success if result remains in modal.

Touch and pointer:
- Touch targets meet minimum size.
- Destructive action triggers on completed activation, not pointer down.
- Accidental drag on mobile sheet must not submit.
- Backdrop tap may close before confirmation only when host permits; it must never submit.

Reduced motion:
- Use opacity or transform transitions only.
- Disable non-essential animation when reduced motion is requested.
- Do not animate refund amount in a way that delays comprehension.

High contrast:
- Do not rely on red alone for destructive state.
- Use icons, labels, and text.
- Preserve visible focus ring.
- Maintain readable contrast for disabled controls.

Large text:
- Modal body scrolls.
- Footer stays reachable.
- Reason cards wrap without clipping.
- Note field remains usable with keyboard open.

## Visual Design
Tone:
- serious
- calm
- clear
- compact

Color:
- Use danger token only for destructive action and critical warning accents.
- Use neutral surface for body.
- Use caution token for policy preview.
- Use success token only after backend success.
- Use blocked token for ineligible state.

Typography:
- Title uses modal heading token.
- Body uses readable app body token.
- Reason labels use strong body token.
- Descriptions use secondary text token.
- Error text uses accessible error token.

Spacing:
- Header has enough space to separate title from body.
- Reason options use consistent vertical rhythm.
- Policy card has clear separation from note field.
- Footer is visually separated but not heavy.

Shape:
- Use app modal radius.
- Mobile bottom sheet uses top radius only where platform pattern permits.
- Avoid decorative shapes.

Iconography:
- Use one status icon in eligibility card.
- Do not use icon for every reason.
- Icons must have accessible text equivalent or be hidden when decorative.

Motion:
- Modal opens with quick, calm transition.
- Reason policy card can crossfade when reason/status changes.
- Submit button can show progress indicator.
- Avoid looping movement.

## Copy System
Default title:
- `Cancel delivery`

Default body:
- `Choose a reason. The delivery is cancelled only after you confirm.`

Sender eligible body:
- `This delivery can still be cancelled before origin intake.`

Sender blocked after intake:
- `The package has already been accepted at origin. Staff help is required.`

Staff post-intake body:
- `This package is already in Kra custody. The cancellation reason will be recorded.`

Reason group label:
- `Cancellation reason`

Note label:
- `Add a cancellation note`

Optional note hint:
- `Optional unless you choose Other reason.`

Review CTA:
- `Review cancellation`

Final destructive CTA:
- `Cancel delivery`

Safe CTA:
- `Keep delivery`

Close CTA:
- `Close`

Support CTA:
- `Contact support`

Retry CTA:
- `Try again`

Refresh CTA:
- `Refresh delivery`

Do not use:
- `Are you sure?` by itself.
- `Proceed`.
- `Submit`.
- `Confirm` without the action.
- `Refund guaranteed`.
- `Instant refund`.
- `Delete delivery`.
- `Void package`.

## Responsive Rules
Mobile portrait:
- Sheet width fills viewport.
- Max height should leave visual room for route context only if platform style supports it.
- Body scrolls independently from footer.
- Footer remains above safe area inset.
- Keyboard does not cover note field or CTA.

Mobile landscape:
- Use centered modal or compact sheet depending platform.
- Reduce policy card verbosity.
- Keep reason picker visible above fold when possible.

Tablet:
- Use centered modal with comfortable width.
- Two-column layout is allowed only for admin/staff workflows; sender stays single column.

Desktop web:
- Use max width around one focused column.
- Avoid sprawling modal.
- Keep footer right aligned with safe action first and destructive action second where platform convention permits.

Admin wide screens:
- Modal should not use full viewport width.
- Long audit copy must stay in body, not header.

## Loading Behavior
Initial loading:
- Show title.
- Show delivery identity skeleton only if host has no reference.
- Show status text: `Checking cancellation eligibility...`
- Disable reason picker and destructive action.
- Keep safe close available.

Refresh loading:
- Keep selected reason and note.
- Disable destructive action.
- Show inline status message.
- Do not reset confirmation step until refreshed state changes eligibility.

Submit loading:
- Lock fields.
- Disable close if route risk requires it; if close is allowed, warn that request is still pending only when host can safely handle it.
- Do not allow repeated submit.
- Show progress text in accessible status region.

## Success Behavior
On backend success:
- Host receives response.
- Modal should call `onSuccess(response)`.
- Host may close modal and navigate to cancellation result screen.
- Host may show compact success inside modal for support/admin.

Compact success content:
- Title: `Delivery cancelled`
- Body: `The cancellation was recorded.`
- Status row: `Refund: {refundStatusLabel}`
- Timestamp: role-safe formatted `occurredAt`
- CTA: `Open delivery`

If `refundStatus=refund_pending`:
- Show `Refund pending`.
- Show `refundAmountGhs` only if returned.
- Show reason copy only if returned.

If `refundStatus=not_applicable`:
- Show `No refund action returned`.

Success state must not:
- Offer another cancel action.
- Show raw event ID in sender flow.
- Say provider payout is complete.
- Clear host cache without invalidating delivery and payment data.

## Integration With Host Cache
After success, host should invalidate:
- `Delivery`
- `DeliveryList`
- `Payment`
- `Timeline` if shown on current host
- `Notifications` if host expects cancellation notices

Host should refresh:
- delivery detail
- delivery timeline
- payment/refund status
- active delivery list

Host should not:
- Optimistically set refund amount before response.
- Mark refund settled.
- Remove delivery from history.
- Hide cancellation record from timeline.

## Test IDs
Root:
- `modal-cancel-delivery-reason`

Header:
- `cancel-delivery-title`
- `cancel-delivery-subtitle`
- `cancel-delivery-close`

Context:
- `cancel-delivery-identity`
- `cancel-delivery-status`
- `cancel-delivery-payment-status`
- `cancel-delivery-eligibility-card`
- `cancel-delivery-refund-preview`
- `cancel-delivery-custody-warning`

Reason:
- `cancel-delivery-reason-group`
- `cancel-delivery-reason-sender-changed-mind`
- `cancel-delivery-reason-duplicate-booking`
- `cancel-delivery-reason-pricing-dispute`
- `cancel-delivery-reason-receiver-unavailable`
- `cancel-delivery-reason-support-advised`
- `cancel-delivery-reason-other`

Note:
- `cancel-delivery-note`
- `cancel-delivery-note-count`
- `cancel-delivery-note-error`

Validation:
- `cancel-delivery-validation-summary`
- `cancel-delivery-error-banner`
- `cancel-delivery-status-message`

Actions:
- `cancel-delivery-keep`
- `cancel-delivery-review`
- `cancel-delivery-submit`
- `cancel-delivery-retry`
- `cancel-delivery-refresh`
- `cancel-delivery-support`
- `cancel-delivery-open-delivery`

Result:
- `cancel-delivery-success`
- `cancel-delivery-refund-result`
- `cancel-delivery-refund-amount`

## Component Structure
Recommended composition:
- `CancelDeliveryReasonModal`
- `CancelDeliveryHeader`
- `CancelDeliveryIdentityStrip`
- `CancelDeliveryEligibilityCard`
- `CancelDeliveryReasonGroup`
- `CancelDeliveryReasonOption`
- `CancelDeliveryNoteField`
- `CancelDeliveryPolicyPreview`
- `CancelDeliveryValidationSummary`
- `CancelDeliveryFooter`
- `CancelDeliveryResult`

Shared primitives:
- `Modal`
- `BottomSheet`
- `RadioGroup`
- `TextArea`
- `Button`
- `InlineAlert`
- `StatusMessage`
- `ProgressSpinner`
- `FocusTrap`

Keep business rules in:
- modal validation helper
- host eligibility adapter
- shared cancellation reason constants

Do not scatter reason labels across screens.

## Validation Helper
Create a helper such as:
- `validateCancelDeliveryReasonInput(input)`

Inputs:
- `reasonCode`
- `note`
- `workflow`
- `currentStatus`
- `actorRole`
- `isOnline`

Outputs:
- `isValid`
- `errors`
- `normalizedNote`
- `canReview`
- `canSubmit`

Helper rules:
- Missing reason blocks review.
- Invalid note blocks review and submit.
- Offline blocks submit.
- Ineligible status blocks submit.
- Permission block from host blocks submit.
- `other` requires note.
- Empty optional note is omitted.

## Security Rules
Security expectations:
- Frontend checks improve UX only.
- Backend remains authority.
- Permission denial from backend must be respected.
- Status transition rejection must stop cancellation and refresh host context.
- No role can override lifecycle from this modal.
- No hidden fields should attempt to influence refund result.
- No note body should enter analytics.
- No sensitive backend error payload should be displayed raw.

Abuse prevention:
- Disable repeated submit.
- Rate-limit errors must be shown calmly.
- Do not let malicious note content affect layout.
- Escape all displayed note text in any review or admin result.
- Avoid storing note body in local durable storage.

## Performance
Performance requirements:
- Modal opens within one frame when host already has context.
- Context refresh should show progress by `300ms`.
- Reason selection should be instant.
- Typing in note field should not lag.
- Submit lock should occur immediately on tap.
- Success or rejection should render as soon as mutation resolves.

Avoid:
- Heavy charts.
- Large media.
- Loading full timeline inside modal.
- Running broad delivery list fetch from modal.
- Recalculating refund policy on every keystroke.

## Internationalization
Text must be translation-ready:
- No string concatenation for sentence grammar.
- Use interpolation for delivery reference, status label, amount, and date.
- Keep reason codes separate from labels.
- Use locale-aware currency display for `GHS`.
- Use locale-aware date and time display.
- Keep note limits numeric and clear.

Translation keys should cover:
- titles
- subtitles
- reason labels
- reason descriptions
- validation errors
- eligibility states
- refund preview states
- action labels
- server rejection categories
- success result

## QA Acceptance Criteria
Core:
- Modal opens from eligible sender delivery.
- Modal shows delivery identity and eligible status.
- Reason picker renders six approved reason options.
- Destructive submit disabled until reason is selected.
- `other` requires valid note.
- Optional note is omitted when empty.
- Note shorter than 5 characters blocks submit when present.
- Note over 400 characters blocks submit.
- Review step appears before sender destructive submit.
- Submit calls `cancel_delivery` once.
- Submit sends only `deliveryId`, `reasonCode`, and optional `note`.
- Success calls `onSuccess` with response.
- Refund result uses backend response.

Lifecycle:
- Sender can submit only for `created`.
- Sender is blocked for `received_at_origin`.
- Staff/admin can submit for `received_at_origin` when host context permits.
- Dispatch and later statuses are blocked.
- Already cancelled state is blocked.
- Delivered and closed states are blocked.

Error:
- Backend `FORBIDDEN` renders safe denial copy.
- Backend `INVALID_STATUS_TRANSITION` prompts refresh.
- Network failure preserves input.
- Rate limit does not retry automatically.
- Unknown error does not claim cancellation succeeded.

Accessibility:
- Focus is trapped.
- Escape closes before submit.
- Escape does not submit.
- Screen reader announces title and errors.
- Radio group is keyboard usable.
- Error summary focuses correctly.
- Status message is announced during submit.
- Reduced motion setting is respected.
- Large text remains usable.

Privacy:
- Note body is not in telemetry.
- Provider reference is not displayed.
- Payment ID is not displayed.
- Receiver phone is not displayed unless host already permits it.

## E2E Scenarios
`e2e-sender-cancel-eligible-delivery`:
- Open sender delivery detail.
- Tap cancel.
- Modal opens.
- Select `sender_changed_mind`.
- Review cancellation.
- Confirm.
- Mutation succeeds.
- Result shows cancelled status and backend refund state.

`e2e-sender-cancel-other-requires-note`:
- Open modal.
- Select `other`.
- Try review without note.
- Validation appears.
- Add valid note.
- Review becomes available.

`e2e-sender-cancel-after-intake-blocked`:
- Open modal for `received_at_origin`.
- Sender sees staff-help block.
- Destructive action unavailable.
- Support action is available.

`e2e-staff-cancel-after-intake-origin-scope`:
- Open modal as origin station staff.
- Status is `received_at_origin`.
- Custody warning appears.
- Submit with reason.
- Backend success is shown.

`e2e-staff-cancel-after-intake-outside-scope`:
- Open modal outside origin station scope.
- Station scope block appears.
- Destructive action unavailable.

`e2e-cancel-network-failure`:
- Select reason.
- Confirm.
- Network fails.
- Error appears.
- Inputs remain.
- Retry is available after connection returns.

`e2e-cancel-status-changed`:
- Open eligible modal.
- Delivery status changes before submit.
- Backend rejects with status transition error.
- Modal shows refresh action.
- No success message appears.

## Unit Test Coverage
Validation tests:
- Missing reason invalid.
- Each allowed reason valid.
- Unknown reason invalid before submit.
- Empty optional note omitted.
- Whitespace optional note omitted.
- Short note invalid.
- Long note invalid.
- `other` without note invalid.
- `other` with valid note valid.
- Trimmed note is submitted.

State tests:
- Eligible created sender enables reason selection.
- Received-at-origin sender blocks submit.
- Received-at-origin staff can reach review when host permits.
- Post-dispatch status blocks submit.
- Offline state blocks submit.
- Submitting disables all mutating controls.
- Rejection preserves input.
- Closing clears local input.

Accessibility tests:
- Dialog has title and modal semantics.
- Focus returns after close.
- Radio group has accessible name.
- Note field announces error.
- Submit status uses live region.
- Buttons have explicit labels.

Telemetry tests:
- Open event omits note.
- Reason selected event includes reason code.
- Submit event includes reason code and note presence.
- Success includes refund status.
- Rejection includes error code.

## Design Review Checklist
Before closing implementation:
- The modal makes cancellation consequences clear in under five seconds.
- The safe action is always easy to find.
- The destructive action is explicit and gated.
- Reason options match backend enum values.
- `other` requires a note.
- Refund preview is accurate without promising settlement.
- Sender post-intake cancellation is blocked.
- Staff/admin post-intake cancellation shows audit warning.
- Offline submit is impossible.
- Backend rejection is recoverable.
- Accessibility works with keyboard, screen reader, large text, and reduced motion.
- No sensitive data is exposed.
- No note body enters analytics.
- All required test IDs exist.

## Implementation Handoff
Claude Code should build `CancelDeliveryReasonModal` as a shared cancellation-specific modal that reuses the destructive-action modal primitives. It must collect one backend-approved `reasonCode`, enforce note limits, require note for `other`, show lifecycle and refund policy context, block sender cancellation after origin intake, block offline submit, call host-owned `cancel_delivery` exactly once after explicit confirmation, preserve input after rejection, and render final refund state only from `cancelDeliveryResponseSchema`.


# CourierOtpCompletion Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierOtpCompletion` |
| Route | `/(ops)/courier/assignments/:deliveryId/proof/otp` |
| Primary test ID | `screen-courier-otp-completion` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `complete_delivery` |
| Offline critical | Yes for cached guidance and recovery; no for final OTP completion because backend verification must be live |
| Required role | `final_mile_courier` |
| Required capability | `complete_delivery_with_proof` |
| Required delivery status | `out_for_delivery` or controlled recovery from `assigned_for_final_mile` |
| Required custody | Current courier must hold final-mile custody |
| Previous workflow | `/(ops)/courier/assignments/:deliveryId/proof` |
| Success workflow | `/(ops)/courier/assignments/:deliveryId/completed` when implemented, otherwise assignment detail with delivered state |
| Recovery workflows | `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/proof/signature`, `/(ops)/courier/assignments/:deliveryId/proof/photo`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/action-recovery` |
| Current implementation mode | OTP completion screen that guides receiver verification, validates token readiness, calls `/complete` only with an active receiver verification token, and blocks unsafe raw-code workarounds |

## Product Job
`CourierOtpCompletion` lets the final-mile courier complete a doorstep delivery using OTP-backed receiver phone verification.

It answers eleven operational questions:

- `Is this the correct delivery?`
- `Is the courier still the custodian?`
- `Is the receiver present?`
- `Has the receiver verified their phone for this delivery?`
- `Can the app safely submit OTP proof now?`
- `What name should be recorded as receiver?`
- `What happens if verification is missing or expired?`
- `What happens if network drops?`
- `When should the courier use signature or photo fallback instead?`
- `When should the courier record a failed attempt?`
- `What proof will be written to the timeline after success?`

The screen must make OTP feel fast, but it must not weaken proof integrity by turning a receiver verification token into a visible courier-facing secret.

## Product Standard
This screen is a receiver-verified completion gate.

The courier should be able to:

- Confirm delivery identity.
- Confirm receiver name.
- See proof method as `OTP`.
- See receiver verification readiness.
- Ask the receiver to verify through the secure receiver tracking flow.
- Complete delivery only when an active receiver verification token is available through an approved bridge.
- Handle `PHONE_VERIFICATION_REQUIRED` without confusion.
- Use signature or photo fallback when OTP cannot be completed.
- Record failed attempt when the receiver is unavailable, unreachable, refusing, or the location is unsafe.
- Land in delivered state after successful backend completion.

The screen must never:

- Complete delivery with a raw OTP code.
- Ask the courier to type the receiver's public SMS code into `/complete`.
- Show the receiver verification token.
- Put the receiver verification token in route params, analytics, logs, crash reports, or clipboard.
- Store OTP digits or token beyond the active completion attempt.
- Treat offline state as delivered.
- Mark delivered before `/complete` succeeds.
- Complete another courier's delivery.
- Bypass `PHONE_VERIFICATION_REQUIRED`.
- Hide failed attempt when the receiver is not present.
- Suggest cash collection.

## Audience
Primary audience:

- Final-mile couriers standing with the receiver and ready to hand over the package.

Secondary audience:

- Receivers who need quick guidance to open their secure tracking link and verify.
- Support staff diagnosing OTP completion failures.
- QA validating receiver verification and completion edge cases.
- Security reviewers validating token handling.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may open this screen:

- From `CourierProofCapture` after choosing OTP.
- From a deep link after returning from receiver verification guidance.
- From assignment detail when proof is still needed.
- From action recovery after a failed completion mutation.
- While online near the receiver address.
- While offline and needing instructions, but not final completion.
- After `PHONE_VERIFICATION_REQUIRED` from a prior completion attempt.
- After the receiver's verification grant expired.

The courier may be holding the package, speaking with the receiver, standing in poor connectivity, or handling a receiver who has the SMS link but has not verified yet. The UI must keep the handoff safe, fast, and truthful.

## Design Brief
User and job:

- A courier with active final-mile custody needs to finish delivery only after receiver OTP verification is active.

Surface type:

- Mobile proof completion screen.

Primary action:

- Complete delivery with verified receiver OTP proof.

Visual thesis:

- `Secure handoff console`: a focused completion surface with one proof state, one receiver name field, one completion button, and clear fallback exits.

Restraint rule:

- Do not build a broad OTP auth flow inside the courier app. The receiver verification flow owns SMS challenge and OTP entry.

Density:

- Balanced and task-heavy. It must fit field use while exposing enough proof status to prevent bad handoffs.

Platform stance:

- Native-plus mobile completion screen with large controls, strong status, direct recovery, and no secret leakage.

## External Research Used
Only directly relevant links were used:

- [Uber delivery confirmation with PIN](https://help.uber.com/en/driving-and-delivering/article/delivery-confirmation-with-pin-feature?nodeId=61478729-8a5f-4f93-ba77-8fbcec909c16): supports receiver-provided delivery PINs as handoff confirmation, with help flow when the PIN cannot be confirmed.
- [web.dev SMS OTP form guidance](https://web.dev/articles/sms-otp-form?hl=en): supports one-time-code autocomplete, origin-bound SMS format, paste-friendly OTP entry, and phishing-risk reduction for receiver-side OTP entry.
- [Twilio Verify best practices](https://www.twilio.com/docs/verify/developer-best-practices): supports masking PII for ongoing verification, verification retries with cooldowns, token length and timeout awareness, and strong phone-number verification behavior.
- [OWASP MFA Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html): supports treating OTPs as authentication secrets with short TTL, single use, strict attempt limits, and invalidation after successful verification.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports one-time secrets, replay resistance, protected verifier channels, limited validity, single acceptance during validity, and mobile usability needs for code entry.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible verification, completion, offline, and error status updates without stealing focus.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable focus order through identity, verification state, receiver name, completion action, and recovery paths.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for field completion actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/02-receiver-phone-challenge.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/03-receiver-otp-verify.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/05-receiver-arrival-instructions.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/__tests__/app.test.ts`
- `services/api/src/__tests__/public-tracking-verification.test.ts`

## Backend And Integration Context
Primary read:

- `GET /v1/deliveries/:id` through `get_delivery`.

Completion route:

- `POST /v1/deliveries/:id/complete`

Route key:

- `complete_delivery`

Required capability:

- `complete_delivery_with_proof`

Completion request schema:

```ts
type CompleteDeliveryRequest = {
  proofType: "otp" | "signature" | "delivery_photo";
  proofReference: string;
  receivedByName: string;
};
```

OTP completion body:

```json
{
  "proofType": "otp",
  "proofReference": "active-receiver-verification-token",
  "receivedByName": "Receiver Name"
}
```

Important backend rule:

- `proofReference` for OTP must be the active delivery-scoped receiver verification token generated by `/v1/public/track/:trackingCode/verify-phone`.

Current backend gap:

- The receiver public verification endpoint returns `verificationToken` to the receiver public session.
- The courier mobile app currently has no explicit courier-safe endpoint to fetch, redeem, scan, or receive that token.
- `/complete` does not accept raw OTP digits.
- `/complete` does not accept a boolean such as `receiverVerified=true`.
- Therefore, this screen must not implement courier raw-code completion unless the backend contract changes.

Approved frontend stance until backend parity:

- Show receiver verification instructions.
- Show token readiness only if an approved local handoff state or future backend endpoint provides it.
- Disable final `Complete delivery` CTA when token is missing.
- On `PHONE_VERIFICATION_REQUIRED`, route the courier back to receiver verification guidance and fallback options.
- Treat raw OTP entry in the courier app as out of scope and unsafe for the current backend.

## Required Backend Decision Before Production Completion
For OTP completion to work end to end without leaking tokens, engineering must choose one of these server-authorized approaches:

1. Server-side active grant completion:

- Add a courier completion option where `/complete` can resolve the active receiver verification grant by delivery, receiver phone, and time window without the courier app holding the token.
- The request would still use `proofType=otp`.
- Backend would verify an active grant exists and is unexpired.
- This is the safest user experience because the receiver token never leaves backend-controlled verification context.

2. Courier-safe token exchange:

- Add an authenticated courier endpoint that returns a short-lived completion proof reference only when the receiver has verified, the courier has custody, and the delivery is eligible.
- The endpoint must never return the raw public receiver token as visible text.
- The app stores it in volatile memory only long enough to call `/complete`.

3. Receiver-to-courier bridge:

- Receiver public page exposes a short-lived QR or app link that encodes a courier-redeemable proof reference.
- Courier scans or opens it.
- Backend redeems it once for the assigned courier and delivery.
- The raw receiver token remains hidden from UI.

Rejected approach:

- Courier asks receiver for SMS OTP digits and sends those digits to `/complete`.
- Reason: current backend does not accept raw OTP digits, and this increases social-engineering risk.

## Lifecycle Semantics
Normal entry expects:

```text
currentStatus=out_for_delivery
currentCustodyRole=final_mile_courier
currentCustodyActorId=current courier
assignedFinalMileCourierId=current courier
paymentStatus=paid
doorstepRequested=true
```

Successful OTP completion:

- Calls `POST /v1/deliveries/:id/complete`.
- Uses `proofType=otp`.
- Uses an active receiver verification token or future server-authorized proof reference as `proofReference`.
- Sends `receivedByName`.
- Backend validates receiver verification.
- Backend creates `delivery_completed`.
- Backend creates `delivery_completion` handoff event.
- Backend stores final proof.
- Backend clears active custody.
- UI routes to completed state.

Blocked completion:

- If receiver verification is missing, backend returns `PHONE_VERIFICATION_REQUIRED`.
- If custody is wrong, backend returns `FORBIDDEN`.
- If status is not eligible, backend returns `INVALID_STATUS_TRANSITION`.
- If payload is wrong, backend returns `VALIDATION_ERROR`.

## Proof Integrity Rules
OTP proof is valid only when:

- Receiver phone verification exists for this delivery.
- Verification token is active.
- Token belongs to the same tracking code and receiver phone.
- Token belongs to the same delivery.
- Token is not expired.
- Courier has current custody.
- Courier has completion capability.
- Completion request is authenticated as assigned courier.
- `receivedByName` is present and valid.

OTP proof is invalid when:

- Receiver only verbally says they received an SMS.
- Courier sees or records raw SMS code but no token is available.
- Verification token is expired.
- Token belongs to another delivery.
- Token was already consumed if backend later enforces consumption.
- Courier is offline.
- Delivery is already completed.
- Delivery is in issue review.

The screen must communicate the difference between receiver OTP verification and fallback proof.

## Information Architecture
The screen has ten zones:

1. Status header.
2. Delivery identity strip.
3. Receiver identity and arrival context.
4. OTP proof state.
5. Receiver verification instructions.
6. Receiver name field.
7. Completion action block.
8. Fallback proof exits.
9. Failed attempt and support exits.
10. Recovery footer.

### Zone 1: Status Header
Purpose:

- Orient the courier and prevent wrong-delivery completion.

Content:

- Back control.
- Screen title: `OTP completion`.
- Delivery short reference.
- Status chip.
- Custody chip.
- Network chip.

Test IDs:

- `courier-otp-header`
- `courier-otp-back-action`
- `courier-otp-status-chip`
- `courier-otp-custody-chip`
- `courier-otp-network-chip`

Rules:

- Header must show blocked state before proof action.
- Header must not show raw OTP, token, or receiver phone.

### Zone 2: Delivery Identity Strip
Purpose:

- Confirm the courier is completing the right package.

Content:

- Delivery ID.
- Safe tracking code or short delivery reference.
- Package summary.
- Destination station code.
- Latest event timestamp.

Test IDs:

- `courier-otp-delivery-id`
- `courier-otp-tracking-code`
- `courier-otp-package-summary`
- `courier-otp-destination-station`
- `courier-otp-latest-timestamp`

Rules:

- Do not show package scan code.
- Do not show full private address unless already allowed in route and assignment detail.

### Zone 3: Receiver Identity And Arrival Context
Purpose:

- Confirm the receiver and prepare the handoff.

Content:

- Receiver display name.
- Masked receiver phone if available.
- Arrival instruction excerpt.
- Handoff reminder: `Hand over after accepted proof.`

Actions:

- `Call receiver` if authorized.
- `View route`.
- `Back to proof options`.

Test IDs:

- `courier-otp-receiver-card`
- `courier-otp-receiver-name`
- `courier-otp-masked-phone`
- `courier-otp-call-receiver-action`
- `courier-otp-view-route-action`
- `courier-otp-proof-options-action`

### Zone 4: OTP Proof State
Purpose:

- Make the current verification status obvious.

States:

- `receiver_not_verified`
- `receiver_verifying`
- `receiver_verified_token_ready`
- `receiver_verified_token_missing`
- `verification_expired`
- `verification_required_by_backend`
- `completion_submitting`
- `completion_succeeded`
- `completion_failed`

Ready copy:

- `Receiver verified. You can complete with OTP proof.`

Missing copy:

- `Receiver verification is needed before OTP completion.`

Token gap copy:

- `Receiver may be verified, but the courier app does not yet have a completion proof reference. Use the approved receiver handoff or choose a fallback.`

Test IDs:

- `courier-otp-proof-state-card`
- `courier-otp-proof-state-label`
- `courier-otp-token-ready-indicator`
- `courier-otp-verification-required-message`
- `courier-otp-token-gap-message`

Visual behavior:

- Use a large status card near top.
- Use green only when completion is actually available.
- Use amber for receiver action needed.
- Use red for blocked or expired.

### Zone 5: Receiver Verification Instructions
Purpose:

- Tell the courier exactly how to help the receiver without exposing secrets.

Instructions:

- `Ask the receiver to open the Kra tracking link.`
- `Receiver verifies their phone with SMS OTP.`
- `Keep the package until the app shows receiver verified.`
- `Do not ask the receiver to send the code by chat.`
- `If they cannot verify, use approved fallback proof or failed attempt.`

Optional actions:

- `Show receiver steps`
- `Share tracking link` if policy allows safe resend.
- `Refresh verification status`

Test IDs:

- `courier-otp-receiver-instructions`
- `courier-otp-show-receiver-steps-action`
- `courier-otp-share-tracking-link-action`
- `courier-otp-refresh-verification-action`

Rules:

- Sharing tracking link must not expose token or phone.
- Refresh verification must be rate-limited.
- If no backend endpoint exists to check verification status, refresh only reloads delivery and local handoff state.

### Zone 6: Receiver Name Field
Purpose:

- Satisfy `receivedByName` required by completion schema and provide dispute-safe receiver identity context.

Default value:

- Prefill with delivery receiver name when available.

Allowed edits:

- Courier may update to the actual receiver or authorized representative name if different.

Validation:

- Trim whitespace.
- Minimum `2` characters.
- Maximum `120` characters.
- Reject empty.
- Reject obviously invalid values such as only punctuation.

Test IDs:

- `courier-otp-received-by-field`
- `courier-otp-received-by-error`
- `courier-otp-received-by-clear-action`

Copy:

- Label: `Received by`
- Helper: `Use the name of the person taking the package.`

Privacy:

- Do not send name changes to analytics.
- Do not store prior typed names after leaving screen unless completion is queued by a future approved flow.

### Zone 7: Completion Action Block
Purpose:

- Submit the authoritative completion mutation only when safe.

Primary CTA:

- `Complete delivery`

Enabled when:

- Delivery is eligible.
- Current courier has custody.
- User has `complete_delivery_with_proof`.
- Network is online.
- Receiver verification proof reference is available through approved means.
- `receivedByName` is valid.
- No unresolved prior completion mutation is in progress.

Disabled when:

- Verification is missing.
- Token bridge is missing.
- Network is offline.
- Delivery state is stale.
- Custody is wrong.
- Status is wrong.
- Receiver name is invalid.

Submitting state:

- Button label: `Completing...`
- Disable navigation that would duplicate mutation unless safe cancel is possible.
- Show progress status.

Success state:

- Show delivered confirmation.
- Show event timestamp.
- Route to completed workflow.

Test IDs:

- `courier-otp-complete-action`
- `courier-otp-completing-state`
- `courier-otp-completed-state`
- `courier-otp-completion-event-id`
- `courier-otp-completion-timestamp`

Mutation body:

```json
{
  "proofType": "otp",
  "proofReference": "active-receiver-verification-token",
  "receivedByName": "Receiver Name"
}
```

Idempotency:

- Use a stable idempotency key for one visible completion attempt.
- Do not reuse the key after user edits receiver name or proof reference changes.
- Retry only when backend result is unknown.

### Zone 8: Fallback Proof Exits
Purpose:

- Keep lawful fallback available when OTP cannot be completed.

Actions:

- `Use signature instead`
- `Use photo proof instead`

Routes:

- `/(ops)/courier/assignments/:deliveryId/proof/signature`
- `/(ops)/courier/assignments/:deliveryId/proof/photo`

Test IDs:

- `courier-otp-use-signature-action`
- `courier-otp-use-photo-action`

Rules:

- If fallback reason was already selected in `CourierProofCapture`, preserve it.
- If no fallback reason exists, route through `CourierProofCapture` fallback guard or show the same guard here.
- Do not make fallback visually stronger than completion when OTP is ready.
- When token gap is a backend limitation, fallback should remain available if policy allows and receiver is present.

### Zone 9: Failed Attempt And Support Exits
Purpose:

- Prevent false delivery completion when real handoff failed.

Actions:

- `Record failed attempt`
- `Contact support`

Routes:

- `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- `/(ops)/courier/issues?deliveryId=:deliveryId`

Test IDs:

- `courier-otp-failed-attempt-action`
- `courier-otp-support-action`

Use failed attempt when:

- Receiver is unreachable.
- Receiver is unavailable.
- Address is not found.
- Location is unsafe.
- Receiver refuses.
- OTP proof failed and fallback is not valid.
- Package issue is detected.

Use support when:

- Backend state conflicts.
- Receiver claims verification succeeded but app cannot confirm.
- Completion returns unexpected server error.
- Courier is unsure whether fallback is allowed.

### Zone 10: Recovery Footer
Purpose:

- Give recovery without cluttering the completion path.

Actions:

- `Refresh delivery`
- `Open action recovery`
- `Back to proof options`
- `Open offline outbox`

Test IDs:

- `courier-otp-refresh-delivery-action`
- `courier-otp-action-recovery-link`
- `courier-otp-proof-options-link`
- `courier-otp-offline-outbox-link`

Rules:

- Recovery footer is compact in ready state.
- Recovery footer becomes prominent in conflict, offline, and unknown-result states.

## State Matrix
### Loading State
Trigger:

- Delivery detail fetch is pending and no cache exists.

UI:

- Header skeleton.
- Receiver context skeleton.
- Proof status skeleton.
- Disabled completion action.

Test IDs:

- `courier-otp-loading-state`

### Cached Loading State
Trigger:

- Cached delivery detail exists and refresh is pending.

UI:

- Render cached data.
- Show `Refreshing`.
- Keep completion disabled until online state and proof reference are fresh.

Test IDs:

- `courier-otp-cached-loading-state`

### Receiver Not Verified State
Trigger:

- No active receiver verification proof reference exists.

UI:

- Show receiver steps.
- Primary action is disabled.
- Show `Refresh verification`.
- Show fallback and failed attempt exits.

Test IDs:

- `courier-otp-not-verified-state`

### Receiver Verifying State
Trigger:

- Courier has instructed receiver and app is polling or refreshing.

UI:

- Show progress.
- Keep completion disabled.
- Show cancel to proof options.

Test IDs:

- `courier-otp-verifying-state`

### Token Ready State
Trigger:

- Approved proof reference is available and unexpired.

UI:

- Proof state card turns ready.
- Receiver name field becomes active.
- Complete delivery CTA enabled once name is valid.

Test IDs:

- `courier-otp-token-ready-state`

### Token Missing After Verification State
Trigger:

- Receiver appears verified in local or future status, but courier app has no completion proof reference.

UI:

- Explain token bridge gap.
- Disable completion.
- Offer refresh, fallback, failed attempt, and support.

Test IDs:

- `courier-otp-token-missing-state`

### Expired Verification State
Trigger:

- Active proof reference expiry has passed.

UI:

- Show expiry message.
- Ask receiver to verify again.
- Offer fallback and failed attempt.

Test IDs:

- `courier-otp-expired-state`

### Offline State
Trigger:

- Network unavailable.

UI:

- Show cached instructions and delivery identity.
- Disable completion.
- Show offline outbox if pending actions exist.
- Keep failed attempt route available only if its flow supports offline queueing.

Copy:

- `OTP completion needs live backend verification. Reconnect before completing.`

Test IDs:

- `courier-otp-offline-state`

### Completing State
Trigger:

- `/complete` request is in flight.

UI:

- Lock completion button.
- Show progress status.
- Keep package handoff reminder visible.

Test IDs:

- `courier-otp-submitting-state`

### Completed State
Trigger:

- `/complete` returns success.

UI:

- Show delivered confirmation.
- Show occurred timestamp.
- Show next action to completed job or assignment detail.

Test IDs:

- `courier-otp-success-state`

### Phone Verification Required State
Trigger:

- Backend returns `PHONE_VERIFICATION_REQUIRED`.

UI:

- Show receiver verification needed.
- Clear any unsafe proof reference from volatile state.
- Offer receiver steps, refresh, fallback, failed attempt, and support.

Test IDs:

- `courier-otp-phone-verification-required-state`

### Blocked By Status State
Trigger:

- Delivery not eligible for final-mile completion.

UI:

- Show current status and correct next workflow.
- Disable completion.

Mappings:

- `assigned_for_final_mile`: route to out-for-delivery unless controlled backend completion from assigned status is intentionally supported.
- `awaiting_final_mile_assignment`: route to assignments.
- `received_at_destination`: route to assignment detail.
- `delivered`: show completed state.
- `issue_reported`: route to issue or support.

Test IDs:

- `courier-otp-blocked-status-state`

### Blocked By Custody State
Trigger:

- Current courier is not final-mile custodian.

UI:

- Explain proof requires current custody.
- Disable completion.
- Offer action recovery and support.

Test IDs:

- `courier-otp-blocked-custody-state`

### Permission Denied State
Trigger:

- User lacks `complete_delivery_with_proof`.

UI:

- Disable completion.
- Explain account cannot complete delivery.
- Offer support.

Test IDs:

- `courier-otp-permission-denied-state`

### Already Delivered State
Trigger:

- Delivery status is `delivered` or `finalProof` exists.

UI:

- Show proof type and captured timestamp if safe.
- Remove completion action.
- Route to completed job detail.

Test IDs:

- `courier-otp-already-delivered-state`

### Unknown Completion Result State
Trigger:

- Network drops after request is sent and before response is received.

UI:

- Do not show delivered.
- Show `Checking delivery status`.
- Refresh delivery detail.
- Open action recovery if result remains unknown.

Test IDs:

- `courier-otp-unknown-result-state`

### Error State
Trigger:

- Read or completion fails without specific handled code.

UI:

- Show safe error.
- Retry when safe.
- Offer proof options and support.

Test IDs:

- `courier-otp-error-state`

## Navigation Rules
Entry route:

- `/(ops)/courier/assignments/:deliveryId/proof/otp`

Back behavior:

- Back returns to proof selector.
- Back from completing state is blocked or requires safe confirmation.
- Back from completed state routes to completed job detail or assignment detail.

Forward routes:

- Completed: `/(ops)/courier/assignments/:deliveryId/completed` when available.
- Signature fallback: `/(ops)/courier/assignments/:deliveryId/proof/signature`.
- Photo fallback: `/(ops)/courier/assignments/:deliveryId/proof/photo`.
- Failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`.
- Support: `/(ops)/courier/issues?deliveryId=:deliveryId`.
- Proof options: `/(ops)/courier/assignments/:deliveryId/proof`.
- Action recovery: `/(ops)/action-recovery`.
- Offline outbox: `/(ops)/offline-outbox`.

Deep link behavior:

- Fetch delivery state before showing completion CTA.
- If delivery is already delivered, show completed state.
- If receiver verification state is unavailable, show receiver guidance.

Navigation guards:

- Do not complete from stale cache.
- Do not complete offline.
- Do not complete without proof reference.
- Do not complete when receiver name invalid.
- Do not leave submitting state in a way that duplicates mutation.

## Visual System Direction
Art direction:

- Serious field verification.
- One strong proof state.
- One dominant completion action only when valid.
- Clear receiver guidance without legal heaviness.

Layout:

- Status header at top.
- Receiver card below identity.
- Proof state card near top third.
- Receiver name field before CTA.
- Completion action anchored near thumb zone on smaller phones.
- Fallback and failed attempt below completion area.

Color:

- Ready state uses deep green.
- Verification needed uses amber.
- Blocked uses red.
- Offline uses graphite.
- Neutral cards use warm off-white and crisp dark text.

Typography:

- Large proof state label.
- Clear receiver name field label.
- Short operational copy.
- Use tabular numerals only if a future visible code timer is added.

Motion:

- Readiness change may use subtle status card transition.
- Completion success may use one short confirmation transition.
- Reduced-motion users get instant state changes.

Do not include:

- Decorative locks.
- Long security lecture.
- Confetti.
- Animated code cells.
- Misleading progress.

## Data Requirements
Required delivery data:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `receiver.name`
- `receiver.phone` only masked or through safe controls
- `package.description`
- `destinationStationId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedFinalMileCourierId`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `finalProof`

Required auth data:

- Current user ID.
- Role.
- Capabilities.
- Auth token for mutation.

Required local state:

- Network status.
- Cache freshness.
- Receiver verification proof reference if approved.
- Proof reference expiry if known.
- Completion idempotency key.
- Receiver name field value.
- Unknown-result mutation state.

Forbidden state:

- Raw OTP digits.
- Visible verification token.
- Token in route params.
- Token in persisted storage.
- Token in logs.
- Token in analytics.
- Receiver phone in analytics.
- Full address in analytics.

## API Mapping
Completion request:

```http
POST /v1/deliveries/:id/complete
```

Headers:

```http
Authorization: Bearer <courier-token>
Idempotency-Key: <stable-visible-attempt-key>
```

Body:

```json
{
  "proofType": "otp",
  "proofReference": "active-receiver-verification-token",
  "receivedByName": "Receiver Name"
}
```

Expected success response:

```json
{
  "eventId": "EVT-DEL-0001",
  "deliveryId": "DEL-0001",
  "status": "delivered",
  "paymentStatus": "paid",
  "occurredAt": "2026-05-20T09:00:00.000Z"
}
```

Selector relation:

- `CourierProofCapture` selects OTP.
- `CourierOtpCompletion` completes OTP only when proof reference is ready.
- Signature and photo flows handle fallback proof assets.

Receiver relation:

- `ReceiverPhoneChallenge` sends or resumes SMS challenge.
- `ReceiverOtpVerify` verifies receiver phone and creates token.
- `CourierOtpCompletion` needs a secure bridge to use that verification for `/complete`.

## Error Handling
Backend error mapping:

| Backend condition | UI state | Recovery |
| --- | --- | --- |
| `PHONE_VERIFICATION_REQUIRED` | Receiver verification required | Ask receiver to verify, refresh, fallback, failed attempt |
| `FORBIDDEN` | Permission or custody denied | Refresh, action recovery, support |
| `NOT_FOUND` | Delivery not found | Back to assignments and support |
| `INVALID_STATUS_TRANSITION` | Blocked by status | Route to correct workflow |
| `VALIDATION_ERROR` | Invalid payload or receiver name | Correct field or refresh proof state |
| `PAYMENT_REQUIRED` | Payment not settled | Block completion and support |
| `RATE_LIMITED` | Too many attempts | Wait, refresh later, support if urgent |
| Network timeout before send | Offline | Reconnect before completion |
| Network timeout after send | Unknown result | Refresh delivery before retry |
| `INTERNAL_ERROR` | Server error | Retry only when safe and support |

Error copy:

- `Receiver verification is required before completion.`
- `This delivery state changed. Refresh before completing.`
- `You do not have custody for this delivery.`
- `Completion result is unknown. Checking delivery status.`
- `You are offline. Reconnect before OTP completion.`

Do not show:

- Raw backend token details.
- Receiver phone mismatch details.
- Internal stack traces.
- Storage or database names.

## Offline And Sync Rules
Offline read:

- Show cached delivery identity.
- Show receiver instructions.
- Show fallback and failed attempt routes if those flows have offline support.

Offline completion:

- Do not submit OTP completion offline.
- Do not queue OTP completion unless future backend supports secure offline proof reference and conflict resolution.
- Do not show delivered until backend confirms.

Outbox:

- If a completion request has unknown result, show action recovery rather than a normal queued success.
- If failed attempt or fallback proof is queued by child flows, link to outbox.

Cache:

- Completion CTA requires fresh online state.
- Cached state can never satisfy token readiness by itself unless proof reference is unexpired and approved for volatile storage.

## Security And Privacy
Sensitive data:

- Receiver phone.
- Receiver name.
- Address.
- Verification token.
- OTP digits.
- Delivery ID.
- Tracking code.
- Completion event ID.

Controls:

- Token stays hidden.
- Token stays volatile.
- Token is cleared after completion success, failure with `PHONE_VERIFICATION_REQUIRED`, expiry, or screen unmount.
- Raw OTP digits are not collected on this screen.
- Receiver phone is masked.
- Completion request uses authenticated protected channel.
- Analytics use redacted delivery reference only where possible.
- Crash reports exclude form values and proof reference.

Social-engineering prevention:

- Copy must not tell the receiver to send the SMS code through chat.
- Copy should instruct receiver to verify through the Kra link.
- If receiver cannot verify, use approved fallback or failed attempt.
- Courier must not take possession of receiver device.

Retention alignment:

- OTP token is not retained by UI.
- Final proof metadata follows delivery summary retention.
- Proof disputes rely on backend final proof, handoff event, and audit logs.

## Accessibility Requirements
Screen reader:

- Title announces as `OTP completion`.
- Proof state card is announced after receiver identity.
- Receiver name field has visible label and error text.
- Completion enablement reason is announced when state changes.
- Backend errors are status messages.

Focus order:

1. Back action.
2. Screen title.
3. Delivery identity.
4. Receiver context.
5. OTP proof state.
6. Receiver instructions.
7. Receiver name field.
8. Complete delivery action.
9. Fallback actions.
10. Failed attempt.
11. Support.
12. Recovery footer.

Keyboard and switch access:

- All actions are reachable.
- Disabled completion action exposes reason in text.
- Refresh action does not steal focus unless it resolves to error or success.

Touch targets:

- Complete button must be large and separated from fallback and failed attempt.
- Fallback actions must not be so close that field users tap wrong proof path.

Contrast:

- Ready, warning, blocked, and offline states must use labels plus color.

Motion:

- Respect reduced motion.
- Do not move CTA location during typing or verification refresh.

## Performance Requirements
Initial render:

- Render cached delivery context immediately when available.
- Defer heavy modules.
- No camera or signature code loads here.

Network:

- One delivery refresh on entry.
- Manual refresh is debounced.
- Completion mutation is single-flight.

Memory:

- Keep proof reference only in volatile state.
- Clear proof reference after completion attempt completes or fails with verification-required error.

Battery:

- Do not poll constantly.
- Use manual refresh unless future backend provides push state.
- If polling is added, stop when screen loses focus.

## Analytics And Observability
Allowed events:

- `courier_otp_screen_viewed`
- `courier_otp_receiver_steps_opened`
- `courier_otp_verification_refresh_selected`
- `courier_otp_token_ready`
- `courier_otp_completion_started`
- `courier_otp_completion_succeeded`
- `courier_otp_completion_failed`
- `courier_otp_phone_verification_required`
- `courier_otp_signature_fallback_selected`
- `courier_otp_photo_fallback_selected`
- `courier_otp_failed_attempt_selected`
- `courier_otp_support_selected`

Required event fields:

- `deliveryId`
- `screenId`
- `currentStatus`
- `custodyState`
- `networkState`
- `verificationState`
- `cacheAgeBucket`
- `failureCode` when applicable

Forbidden event fields:

- Raw OTP.
- Verification token.
- Receiver phone.
- Receiver typed name.
- Full address.
- Proof reference.
- Idempotency key.

Operational logs:

- Log mutation start and result by delivery ID and safe error code.
- Do not log request body.
- Do not log token.

## Testing Requirements
Unit tests:

- Renders root `screen-courier-otp-completion`.
- Shows receiver not verified state when no proof reference exists.
- Keeps completion disabled without proof reference.
- Enables completion only with valid receiver name and token-ready state.
- Calls `/complete` with `proofType=otp`.
- Does not call proof asset routes.
- Does not submit raw OTP digits.
- Clears proof reference after `PHONE_VERIFICATION_REQUIRED`.
- Shows offline state and disables completion.
- Shows blocked custody state.
- Shows already delivered state.
- Shows unknown result state after ambiguous network failure.

Integration tests:

- From proof selector, OTP route renders delivery identity and receiver context.
- Receiver verification required error returns to guidance state.
- Token ready state completes delivery and routes to completed flow.
- Expired token routes to receiver verification guidance.
- Signature fallback routes to signature proof flow.
- Photo fallback routes to photo proof flow.
- Failed attempt routes to failed attempt flow.
- Support action opens issue create with delivery context.
- Action recovery opens after conflict.

Accessibility tests:

- Screen has one main heading.
- Receiver name field has label and error message.
- Disabled complete action has visible reason.
- Status changes announce through accessible status message.
- Focus moves to success or error state after mutation.
- Large text keeps completion action visible.

Security tests:

- No OTP, token, phone, or proof reference in route params.
- No OTP, token, phone, or proof reference in analytics payload.
- No request body logged.
- Proof reference cleared after completion.
- Raw OTP input component does not exist on this screen.

E2E tests:

- `e2e-courier-completes-with-otp`: assigned courier with active receiver token completes delivery and final proof records `otp`.
- Receiver missing verification returns `PHONE_VERIFICATION_REQUIRED` and UI shows guidance.
- Courier offline cannot complete OTP and does not show delivered.
- Courier loses network after submission and UI refreshes delivery before retry.
- Reassigned delivery blocks completion.
- Already delivered delivery shows completion state without CTA.

## Acceptance Criteria
Functional acceptance:

- Screen renders at `/(ops)/courier/assignments/:deliveryId/proof/otp`.
- Root element uses `screen-courier-otp-completion`.
- Completion button calls only `/v1/deliveries/:id/complete`.
- Completion payload uses `proofType=otp`.
- Completion payload includes `receivedByName`.
- Completion payload includes only an approved receiver verification proof reference.
- Receiver name validation follows schema.
- Offline disables completion.
- `PHONE_VERIFICATION_REQUIRED` has a clear recovery state.
- Fallback and failed-attempt exits are visible.
- Success routes to delivered state.

Security acceptance:

- Raw OTP entry is not implemented in courier app for current backend.
- Verification token is never visible.
- Verification token is not persisted.
- Token and OTP are excluded from route params, logs, analytics, crash reports, and clipboard.
- Completion cannot happen without current courier custody.
- Completion cannot happen without backend success.

Policy acceptance:

- OTP remains default proof path.
- Signature and photo remain fallback paths.
- Failed attempt remains available when receiver or location blocks handoff.
- No cash collection exists.
- No unsupported backend workaround exists.

Quality acceptance:

- Courier can understand why completion is disabled.
- Receiver guidance is short and useful.
- The screen feels like a serious delivery-proof surface.
- All states are testable with stable test IDs.
- Claude Code can implement without guessing backend authority.

## Implementation Notes For Claude Code
Build this file as OTP completion only.

Use the route:

```text
/(ops)/courier/assignments/:deliveryId/proof/otp
```

Use the root test ID:

```text
screen-courier-otp-completion
```

Implementation sequence:

1. Create route shell and fetch delivery state.
2. Render delivery identity and receiver context.
3. Render OTP proof state card.
4. Render receiver verification instructions.
5. Render `receivedByName` field.
6. Add completion button gated by proof reference, network, custody, status, capability, and valid name.
7. Implement `/complete` mutation with idempotency.
8. Add `PHONE_VERIFICATION_REQUIRED`, offline, blocked, already delivered, unknown result, and generic error states.
9. Add fallback, failed attempt, support, and recovery navigation.
10. Add tests from this spec.

Do not implement:

- Receiver SMS challenge request.
- Receiver OTP entry.
- Raw OTP field in courier app.
- Signature capture.
- Photo capture.
- Proof asset upload.
- Payment collection.
- Public receiver pages.

Required integration boundary:

- Receiver public flow owns SMS OTP verification.
- Backend owns active receiver verification validation.
- Courier OTP screen owns final delivery completion only after approved proof reference is available.
- Action recovery owns unknown mutation results.

## Backend Contract Follow-Up
This screen has one launch-critical integration dependency:

- The courier app needs a secure way to complete with receiver OTP without exposing the receiver verification token.

Recommended contract decision:

- Prefer server-side active grant completion or a courier-safe proof-reference exchange over raw token display.

Minimum backend additions:

- Endpoint or completion mode to resolve active receiver verification for assigned courier.
- Explicit expiry and consumed-state semantics for receiver verification grants.
- Safe status check for whether receiver verification is active.
- Idempotent completion behavior for unknown-result recovery.
- Error detail that distinguishes missing verification from expired verification without leaking phone mismatch information.

Until that is done:

- Build the UI shell and recovery states.
- Keep completion disabled without approved proof reference.
- Do not build raw OTP completion.

## Open Risks
- Current backend requires a token the courier app cannot safely obtain from existing routes.
- Raw code entry would conflict with current schema and increase fraud risk.
- Receiver verification status refresh is not currently defined as an authenticated courier endpoint.
- Unknown-result network failures need action recovery to prevent duplicate completion attempts.
- Token expiry semantics need to be visible enough for courier recovery without exposing secrets.

## Definition Of Done
This screen is done when:

- It renders all required states.
- It completes only through `/complete` with `proofType=otp`.
- It never exposes raw OTP or verification token.
- It blocks completion without an approved proof reference.
- It handles `PHONE_VERIFICATION_REQUIRED` correctly.
- It supports offline guidance without false success.
- It routes to signature, photo, failed attempt, support, and recovery.
- It passes accessibility, security, integration, and E2E tests.
- It documents the backend token bridge dependency clearly enough that implementation cannot invent an unsafe workaround.

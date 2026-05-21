# Verify OTP Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `VerifyOtpModal` |
| Component target | shared OTP verification, OTP grant handoff, and OTP completion modal |
| Primary test ID | `modal-verify-otp` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 receiver verification and final-mile completion guard |
| Used by | `ReceiverOtpVerify`, `ReceiverPhoneChallenge`, `CourierOtpCompletion`, `CourierProofCapture`, `OpsActionRecovery`, future support-assisted receiver verification review |
| Backend coverage | `request_public_tracking_phone_challenge`, `verify_public_tracking_phone`, `complete_delivery` |
| Trigger source | receiver public verification flow, courier OTP completion flow, and recovery from `PHONE_VERIFICATION_REQUIRED` |
| Required states | `closed`, `opening`, `context_loading`, `phone_context_missing`, `phone_challenge_ready`, `challenge_requesting`, `challenge_sent`, `challenge_recently_sent`, `already_verified`, `otp_entry`, `otp_paste_review`, `otp_invalid_local`, `otp_submitting`, `otp_verified`, `completion_ready`, `completion_blocked_missing_grant`, `completion_submitting`, `completion_succeeded`, `wrong_phone_generic`, `otp_wrong_generic`, `otp_expired`, `otp_consumed`, `verification_locked`, `verification_not_required`, `verification_provider_unavailable`, `offline_blocked`, `rate_limited`, `scope_blocked`, `custody_blocked`, `status_blocked`, `server_rejected`, `network_error`, `closing` |

## Product Job
`VerifyOtpModal` gives receivers and couriers a safe OTP-backed handoff without confusing SMS code entry with delivery completion.

It answers:
- `Who is verifying this delivery?`
- `Which phone context is required before OTP entry?`
- `Was a receiver SMS challenge sent, recently sent, or already verified?`
- `Can the receiver enter or paste the OTP quickly?`
- `Is the receiver verification grant active?`
- `Can the courier complete delivery with OTP proof now?`
- `Why is completion blocked if the receiver is not verified?`
- `What fallback should the operator use when OTP is unavailable?`
- `What must never leak to the URL, analytics, logs, clipboard, or visible UI?`

The user should be able to:
- Open the modal from receiver public OTP entry or courier OTP completion.
- See the correct delivery context without exposing sensitive delivery data.
- Enter an SMS OTP in receiver mode.
- Use paste and platform OTP autofill where supported.
- Submit OTP only to the public receiver verification endpoint.
- Receive a backend-issued delivery-scoped verification grant.
- Return the grant to the host through approved ephemeral state only.
- Complete delivery in courier mode only when an approved completion proof reference already exists.
- Recover from wrong code, expired code, throttling, lockout, missing phone context, offline, and backend unavailability.
- Exit to signature, photo, failed attempt, or support flow when OTP cannot safely finish the handoff.

This modal is not:
- A staff sign-in modal.
- A passwordless account login.
- A generic phone auth component.
- A delivery timeline.
- A map.
- A support chat.
- A proof method picker.
- A receiver account creation flow.
- A raw courier code-entry shortcut.
- A broad security education page.
- A place to expose verification tokens.

## Strategic Role
OTP is the default doorstep proof in v1 because it links the delivery to the receiver phone and creates a strong delivery-scoped completion signal. The modal is the controlled bridge between receiver-side SMS verification and courier-side delivery completion.

Core principle:
- Receiver verifies the phone through public tracking.
- Backend creates a short-lived verification grant.
- Courier completion uses an active proof reference, not raw SMS digits.
- Delivery is completed only by the authenticated courier or station operator with the correct capability and custody.
- The modal must keep secrets out of visible UI and analytics.

The operational failure this modal prevents:
- Courier hands over the package after hearing a code but before backend verification exists.
- Receiver verification token leaks into a URL or crash log.
- Expired verification is treated as delivery proof.
- A courier completes a delivery they do not currently hold.
- OTP lockout becomes confusing enough that the courier chooses an unsafe workaround.

## Audience
Primary users:
- Receivers entering SMS OTP from the public tracking flow.
- Final-mile couriers completing doorstep delivery with OTP proof.

Secondary users:
- Station operators completing receiver pickup if OTP proof is allowed by policy for station pickup.
- Support staff guiding a receiver or courier through verification recovery.
- QA validating challenge, verification, lockout, and completion behavior.
- Security reviewers validating token, phone, OTP, and analytics handling.
- Claude Code implementing the modal later.

Non-users:
- Senders creating delivery orders.
- Drivers moving packages between stations.
- Finance admins.
- Pricing admins.
- Webhook processors.
- AI agents without human-verification context.

## Context Of Use
Receiver context:
- Receiver has opened `/r/:trackingCode/verify-otp`.
- Receiver previously submitted the delivery receiver phone at `/r/:trackingCode/verify-phone`.
- Receiver has an SMS code or expects platform autofill.
- Receiver may be on a low-end phone, switching between SMS and browser.
- Receiver may have weak data connectivity.
- Receiver may not understand why tracking details are hidden until verification completes.

Courier context:
- Courier is standing with the receiver and holding the package.
- Courier has selected OTP proof in `CourierProofCapture` or opened `CourierOtpCompletion`.
- Courier must not hand over until the app confirms OTP proof can complete.
- Receiver may have already verified through public tracking.
- Receiver may not have verified yet.
- Courier may need signature, photo, or failed-attempt fallback.
- Network may be unstable, but final completion still requires live backend confirmation.

Station context:
- Station operator may use OTP only if policy allows station pickup completion with receiver phone verification.
- Station operator must be scoped to the destination station.
- Station completion must not reuse courier-only copy or route assumptions.

## Design Brief
Audience:
- A receiver or field operator who needs a fast, trusted, OTP-backed handoff.

Surface type:
- Shared modal over web public flow or mobile operations flow.

Primary action:
- Receiver mode: `Verify code`.
- Courier mode: `Complete with OTP proof`.

Visual thesis:
- `Verified handoff vault`: a calm, high-trust modal with one secret input, one verification status, and decisive completion or fallback paths.

Restraint rule:
- Do not show broad delivery detail, raw phone, raw token, internal IDs, package scan codes, or unrelated proof methods inside the OTP step.

Density:
- Compact enough for mobile field use.
- Explicit enough for lockout, expiry, and missing grant recovery.

Platform stance:
- Native-plus mobile behavior for operations apps.
- Clean public-web behavior for receiver screens.
- Same state logic, different host shell chrome.

## External Research Used
Only directly relevant links were used:
- [Uber delivery confirmation with PIN](https://help.uber.com/en/driving-and-delivering/article/delivery-confirmation-with-pin-feature?nodeId=61478729-8a5f-4f93-ba77-8fbcec909c16): supports a delivery handoff pattern where a receiver-provided PIN confirms delivery and the courier needs a clear recovery route when PIN confirmation cannot be completed.
- [web.dev SMS OTP form guidance](https://web.dev/articles/sms-otp-form): supports paste-friendly OTP entry, `autocomplete="one-time-code"`, numeric input mode, and origin-aware SMS behavior for receiver-side verification.
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports OTP validity windows, replay resistance, limited failed attempts, and secure verifier handling.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports modal focus containment, inert background, keyboard escape behavior, and focus return.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports verification, challenge, lockout, and completion status announcements without moving focus unnecessarily.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports specific field and form error copy for OTP entry and phone-context recovery.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for verify, resend, fallback, and complete actions in field conditions.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/02-receiver-phone-challenge.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/03-receiver-otp-verify.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/04-receiver-tracking-timeline.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Backend Reality
Public challenge route:
- Operation key: `request_public_tracking_phone_challenge`.
- Route: `POST /v1/public/track/:trackingCode/request-verification`.
- Auth scope: public.
- Request schema: `requestPhoneVerificationChallengeRequestSchema`.
- Response schema: `requestPhoneVerificationChallengeResponseSchema`.

Challenge request fields:
- `phone`: E.164 phone number.

Challenge response fields:
- `deliveryId`.
- `trackingCode`.
- `challengeStatus`: `sent`, `recently_sent`, or `already_verified`.
- `maskedPhone`.
- `challengeId`, optional.
- `channel`, optional and currently `sms`.
- `resendAvailableAt`, optional.
- `verificationToken`, optional and only present when already verified.
- `verifiedAt`, optional.
- `expiresAt`.

Public verify route:
- Operation key: `verify_public_tracking_phone`.
- Route: `POST /v1/public/track/:trackingCode/verify-phone`.
- Auth scope: public.
- Request schema: `verifyPhoneRequestSchema`.
- Response schema: `verifyPhoneResponseSchema`.

Verify request fields:
- `phone`: E.164 phone number.
- `otp`: string, trimmed, minimum 4 characters, maximum 8 characters.

Verify response fields:
- `deliveryId`.
- `trackingCode`.
- `verificationToken`.
- `verifiedAt`.
- `expiresAt`.

Completion route:
- Operation key: `complete_delivery`.
- Route: `POST /v1/deliveries/:id/complete`.
- Auth scope: authenticated operational user.
- Required capability: `complete_delivery_with_proof` for final-mile courier completion.
- Station pickup completion uses destination station scope and `confirm_destination_receipt`.

Completion request fields:
- `proofType`: `otp`, `signature`, or `delivery_photo`.
- `proofReference`: active receiver verification token for OTP, uploaded `PFA-*` proof reference for other proof types.
- `receivedByName`: string, trimmed, minimum 2 characters, maximum 120 characters.

OTP completion rule:
- `proofType=otp` uses an active delivery-scoped receiver verification token.
- Backend validates the token against tracking code, receiver phone, delivery, and expiry.
- If validation fails, backend returns `PHONE_VERIFICATION_REQUIRED`.
- The backend does not accept raw OTP digits on `/complete`.

## Current Backend Security Model
Receiver verification constants in service code:
- Challenge TTL: `10 minutes`.
- Resend cooldown: `1 minute`.
- Verification grant TTL: `30 minutes`.
- Lock threshold: `5 failed attempts`.
- Lock window: `15 minutes`.

Failure reasons stored internally:
- `phone_mismatch`.
- `challenge_missing`.
- `challenge_consumed`.
- `challenge_expired`.
- `otp_mismatch`.

Public error behavior:
- Wrong phone and wrong OTP return safe generic verification failure copy.
- Lockout returns `RATE_LIMITED` with lock timing metadata.
- Missing notification gateway returns `ROUTE_NOT_ENABLED`.
- Wrong delivery stage returns `VALIDATION_ERROR`.
- Completion without active verification returns `PHONE_VERIFICATION_REQUIRED`.

Frontend authority rule:
- The modal may display timing and state hints.
- The modal must treat backend response as authority.
- The modal must not calculate attempts remaining as authority.
- The modal must not infer receiver identity from error details.
- The modal must not expose internal failure reason strings to receivers or couriers.

## Access Reality
Receiver public mode:
- No account is required.
- Receiver must have a valid tracking route context.
- Receiver must provide the phone number tied to the delivery through the phone challenge step.
- Receiver may enter OTP only after phone context is present.

Courier completion mode:
- Authenticated final-mile courier must have active delivery custody.
- Courier must be assigned to the delivery when assignment is present.
- Courier must have `complete_delivery_with_proof`.
- Delivery must be eligible for completion.
- Completion must be online.

Station completion mode:
- Authenticated station operator must be scoped to destination station.
- Delivery must be in `awaiting_receiver_pickup`.
- Station policy must allow OTP proof for pickup.
- Station operator must use station-specific copy, not courier doorstep copy.

Blocked:
- Sender.
- Driver.
- Finance admin.
- Support-only admin without operational completion authority.
- Receiver trying to complete authenticated delivery mutation directly.
- Courier without custody.
- Courier trying to complete with raw SMS digits.
- Any actor after delivery is already terminal.

## Modal Modes
### `receiver_verify`
Purpose:
- Receiver enters SMS OTP and receives a backend verification grant.

Allowed calls:
- `verify_public_tracking_phone`.

Optional prior calls:
- `request_public_tracking_phone_challenge` if the host intentionally allows a resend path through this modal.

Returns to host:
- `verificationToken`, only through approved ephemeral state.
- `verifiedAt`.
- `expiresAt`.
- `maskedPhone`.
- `trackingCode`.

Must not call:
- `complete_delivery`.

### `receiver_request_and_verify`
Purpose:
- Receiver can request a challenge and then enter OTP without leaving the modal.

Allowed calls:
- `request_public_tracking_phone_challenge`.
- `verify_public_tracking_phone`.

Use only when:
- Host has a clear phone entry step inside the modal.
- Host owns public receiver tracking context.
- UX is intentionally a modal rather than full page.

Must not be used by:
- Courier app.
- Station app.
- Admin app.

### `courier_completion`
Purpose:
- Courier completes a delivery using OTP proof after an active receiver verification grant is available through an approved bridge.

Allowed calls:
- `complete_delivery`.
- `get_delivery` through host refresh if needed.

Required inputs:
- `deliveryId`.
- `deliveryShortRef`.
- `receiverDisplayName`.
- `receivedByName`.
- `proofReference` that represents an active receiver verification grant.
- `verificationExpiresAt`.
- `custodySummary`.
- `completionEligibility`.

Must not call:
- `verify_public_tracking_phone` with raw receiver OTP.
- `request_public_tracking_phone_challenge` unless host routes into receiver-owned public flow.

### `courier_assist`
Purpose:
- Courier helps receiver understand how to verify, then waits for a host-provided verification state update.

Allowed calls:
- Host-approved delivery refresh.
- Host-approved receiver tracking link share, if policy allows.

Must not collect:
- Raw OTP.
- Receiver full phone.
- Receiver verification token as visible text.

### `station_pickup_completion`
Purpose:
- Station operator completes receiver pickup using OTP proof where allowed.

Allowed calls:
- `complete_delivery`.

Required differences:
- Copy references station pickup, not doorstep delivery.
- Handoff actor is station operator.
- Required scope is destination station.

## Non-Negotiable Product Rules
- OTP entry belongs to the receiver verification context.
- Courier delivery completion must not ask the courier to type the receiver's SMS code.
- `/complete` must never receive raw OTP digits.
- Verification token must never appear in URL, DOM text, analytics, support link, logs, or clipboard.
- Receiver full phone must not be displayed after failures.
- Masked phone may be displayed only after a successful challenge response or verified context.
- Completion button must be disabled when an active proof reference is missing.
- Delivery must not be marked complete until `/complete` succeeds.
- Offline state must never be treated as delivered.
- The modal must show fallback proof routes when OTP is blocked.
- The modal must expose failed-attempt route when receiver is unavailable or verification cannot be completed.
- The modal must make retry timing clear when throttled or recently sent.
- The modal must preserve focus, escape behavior, and status announcements.

## Information Architecture
The modal has eight zones:

1. Handoff identity header.
2. Verification status card.
3. OTP entry or receiver guidance area.
4. Timing and resend area.
5. Completion form area.
6. Recovery and fallback area.
7. Security reassurance area.
8. Footer actions.

### Zone 1: Handoff Identity Header
Purpose:
- Confirm the user is working on the right delivery without exposing sensitive internal data.

Receiver mode content:
- Title: `Verify your delivery`.
- Subtitle: `Enter the SMS code to unlock receiver tracking.`
- Safe tracking short label.
- Optional masked phone after challenge success.

Courier mode content:
- Title: `Verify OTP handoff`.
- Subtitle: `Complete only after receiver verification is active.`
- Delivery short reference.
- Current custody chip.
- Network status chip.

Station mode content:
- Title: `Verify receiver pickup`.
- Subtitle: `Complete pickup only after verification is active.`
- Destination station code.
- Pickup status chip.

Test IDs:
- `verify-otp-header`
- `verify-otp-title`
- `verify-otp-subtitle`
- `verify-otp-delivery-ref`
- `verify-otp-custody-chip`
- `verify-otp-network-chip`
- `verify-otp-close-action`

Rules:
- Do not show full package scan code.
- Do not show full receiver phone.
- Do not show verification token.
- Header must reflect blocked state before any action area.

### Zone 2: Verification Status Card
Purpose:
- Make current OTP readiness unambiguous.

States and labels:
- `phone_context_missing`: `Enter receiver phone first`.
- `challenge_sent`: `Code sent`.
- `challenge_recently_sent`: `Code already sent`.
- `otp_entry`: `Waiting for code`.
- `otp_submitting`: `Checking code`.
- `otp_verified`: `Receiver verified`.
- `completion_ready`: `Ready to complete`.
- `completion_blocked_missing_grant`: `Verification proof missing`.
- `verification_locked`: `Verification temporarily locked`.
- `offline_blocked`: `Online connection required`.
- `completion_succeeded`: `Delivery completed`.

Test IDs:
- `verify-otp-status-card`
- `verify-otp-status-label`
- `verify-otp-status-detail`
- `verify-otp-status-icon`
- `verify-otp-status-countdown`

Visual rules:
- Green is reserved for `otp_verified`, `completion_ready`, and `completion_succeeded`.
- Amber is used for waiting, recent challenge, missing proof, or receiver action needed.
- Red is used for lockout, blocked, or completion failure.
- Neutral is used for loading and closed states.

Copy rules:
- Use plain language.
- Do not say `token`.
- Do not reveal whether a wrong phone matched a delivery.
- Do not reveal internal reason strings.

### Zone 3: OTP Entry Or Receiver Guidance Area
Receiver mode purpose:
- Enter and submit SMS OTP.

Courier mode purpose:
- Explain what the receiver must do and why courier cannot type code for them.

Receiver OTP controls:
- One real text input styled as segmented code boxes or a single premium code field.
- Label: `SMS code`.
- Helper: `Enter the code sent to the receiver phone.`
- Submit button: `Verify code`.
- Paste support.
- Clear action.

Courier guidance content:
- `Ask the receiver to open their Kra tracking link.`
- `Receiver verifies their phone with SMS code.`
- `Keep the package until this screen says ready to complete.`
- `Do not ask the receiver to send the code by chat or read it aloud for courier entry.`

Test IDs:
- `verify-otp-code-field`
- `verify-otp-code-input`
- `verify-otp-code-segments`
- `verify-otp-code-clear-action`
- `verify-otp-code-error`
- `verify-otp-receiver-guidance`
- `verify-otp-show-receiver-steps-action`

Input rules:
- Use `type="text"`.
- Use `inputmode="numeric"`.
- Use `autocomplete="one-time-code"` on web.
- Use platform OTP autofill when native shell supports it.
- Accept paste into the full code field.
- Strip spaces and hyphens.
- Trim leading and trailing whitespace.
- Accept 4 to 8 digits for current backend.
- Do not use `type="number"`.
- Do not split focus across many independent hidden inputs.
- Do not read code aloud automatically.

Validation:
- Empty: `Enter the SMS code.`
- Too short: `Enter at least 4 digits.`
- Too long: `Enter no more than 8 digits.`
- Non-digit characters: `Use digits only.`
- Local validation must run before network submission.
- Backend validation remains final authority.

### Zone 4: Timing And Resend Area
Purpose:
- Help users recover without violating backend cooldown and lockout rules.

Receiver mode content:
- OTP expiry hint from `expiresAt`.
- Resend availability from `resendAvailableAt`.
- Resend CTA if host allows challenge request.
- Lockout message when backend returns `RATE_LIMITED`.

Courier mode content:
- Verification grant expiry when available.
- Refresh verification state action.
- Share tracking link action if policy allows.
- Receiver instruction sheet action.

Test IDs:
- `verify-otp-expiry-hint`
- `verify-otp-resend-action`
- `verify-otp-resend-countdown`
- `verify-otp-lockout-message`
- `verify-otp-refresh-status-action`
- `verify-otp-share-tracking-link-action`

Rules:
- Countdown is guidance only.
- Disable resend until `resendAvailableAt`.
- If clock skew is suspected, submit and trust backend response.
- Never expose raw `challengeId`.
- Never expose raw tracking code in analytics.

### Zone 5: Completion Form Area
Purpose:
- Capture the receiver name required by completion only in operational completion modes.

Visible in:
- `courier_completion`.
- `station_pickup_completion`.

Hidden in:
- `receiver_verify`.
- `receiver_request_and_verify`.
- `courier_assist` unless host is ready for completion.

Fields:
- `Received by`.

Default value:
- Delivery receiver name when available.

Allowed edit:
- Actual receiver or authorized representative name.

Validation:
- Trim whitespace.
- Minimum 2 characters.
- Maximum 120 characters.
- Reject empty value.
- Reject value that is only punctuation.

Test IDs:
- `verify-otp-received-by-field`
- `verify-otp-received-by-input`
- `verify-otp-received-by-error`
- `verify-otp-completion-summary`

Rules:
- Do not show this field to public receiver as a completion field.
- Do not persist typed name outside completion attempt except through explicit host recovery state.
- Do not include prior typed names in analytics.

### Zone 6: Recovery And Fallback Area
Purpose:
- Keep the handoff safe when OTP cannot complete.

Receiver mode recovery:
- `Send a new code`.
- `Use a different phone` by returning to phone challenge.
- `Contact support`.
- `Back to package status`.

Courier mode recovery:
- `Use signature proof`.
- `Use photo proof`.
- `Record failed attempt`.
- `Open support`.
- `Refresh verification status`.
- `Back to proof options`.

Station mode recovery:
- `Use station pickup proof fallback` if policy allows.
- `Escalate to support`.
- `Do not release package`.

Test IDs:
- `verify-otp-fallback-signature-action`
- `verify-otp-fallback-photo-action`
- `verify-otp-failed-attempt-action`
- `verify-otp-support-action`
- `verify-otp-back-to-proof-options-action`
- `verify-otp-station-escalation-action`

Rules:
- Fallback actions must be visible when OTP is blocked.
- Failed attempt must be visible when receiver is unavailable, unreachable, refusing, or unable to verify.
- Fallback proof cannot be framed as weaker or suspicious. It is approved policy when OTP fails.
- Copy must tell courier to keep custody until another approved path succeeds.

### Zone 7: Security Reassurance Area
Purpose:
- Explain enough to build trust without teaching attack details.

Receiver copy:
- `This code only verifies the delivery linked to this phone.`
- `Kra will not show private delivery details until verification succeeds.`

Courier copy:
- `OTP proof is verified by Kra before the package is marked delivered.`
- `Never enter a receiver SMS code yourself. Use the receiver verification flow.`

Station copy:
- `Complete pickup only when receiver verification is active or an approved fallback is captured.`

Test IDs:
- `verify-otp-security-note`
- `verify-otp-no-secret-leak-note`

Rules:
- Keep reassurance short.
- Avoid fear-based copy.
- Do not expose token mechanics.

### Zone 8: Footer Actions
Receiver mode:
- Primary: `Verify code`.
- Secondary: `Send a new code` or `Back`.
- Tertiary: `Contact support`.

Courier completion mode:
- Primary: `Complete with OTP proof`.
- Secondary: `Refresh status`.
- Tertiary: `Use another proof`.

Courier assist mode:
- Primary: `Refresh verification`.
- Secondary: `Show receiver steps`.
- Tertiary: `Use another proof`.

Station mode:
- Primary: `Complete pickup`.
- Secondary: `Refresh status`.
- Tertiary: `Escalate`.

Test IDs:
- `verify-otp-primary-action`
- `verify-otp-secondary-action`
- `verify-otp-tertiary-action`
- `verify-otp-cancel-action`

Rules:
- Primary action must be disabled with explicit reason when prerequisites are missing.
- Disable all duplicate submit paths during mutation.
- Keep footer visible above mobile keyboard where possible.
- Use safe-area padding on mobile devices.

## Data Inputs
### Common Inputs
```ts
type VerifyOtpCommonInput = {
  mode:
    | "receiver_verify"
    | "receiver_request_and_verify"
    | "courier_assist"
    | "courier_completion"
    | "station_pickup_completion";
  trackingCode?: string;
  deliveryId?: string;
  deliveryShortRef?: string;
  maskedPhone?: string;
  openedFrom:
    | "receiver_phone_challenge"
    | "receiver_otp_page"
    | "courier_otp_completion"
    | "courier_proof_capture"
    | "ops_action_recovery"
    | "station_pickup";
};
```

### Receiver Inputs
```ts
type ReceiverVerifyOtpInput = VerifyOtpCommonInput & {
  mode: "receiver_verify" | "receiver_request_and_verify";
  trackingCode: string;
  phone?: string;
  maskedPhone?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  challengeStatus?: "sent" | "recently_sent" | "already_verified";
};
```

### Courier Completion Inputs
```ts
type CourierVerifyOtpInput = VerifyOtpCommonInput & {
  mode: "courier_assist" | "courier_completion";
  deliveryId: string;
  deliveryShortRef: string;
  receiverDisplayName: string;
  receivedByName?: string;
  proofReference?: string;
  verificationExpiresAt?: string;
  completionEligibility: {
    hasCustody: boolean;
    correctCourier: boolean;
    eligibleStatus: boolean;
    online: boolean;
  };
};
```

### Station Completion Inputs
```ts
type StationVerifyOtpInput = VerifyOtpCommonInput & {
  mode: "station_pickup_completion";
  deliveryId: string;
  deliveryShortRef: string;
  receiverDisplayName: string;
  receivedByName?: string;
  proofReference?: string;
  verificationExpiresAt?: string;
  stationId: string;
  completionEligibility: {
    destinationStationScoped: boolean;
    eligibleStatus: boolean;
    policyAllowsOtpPickup: boolean;
    online: boolean;
  };
};
```

## Data Outputs
### Receiver Success Output
```ts
type VerifyOtpReceiverSuccess = {
  kind: "receiver_verified";
  trackingCode: string;
  maskedPhone?: string;
  verifiedAt: string;
  expiresAt: string;
  verificationToken: string;
};
```

Output handling:
- Store in approved ephemeral receiver verification state.
- Do not put into URL.
- Do not render token.
- Clear after expiry, route exit, sign-out, browser storage reset, or successful completion handoff.

### Courier Completion Output
```ts
type VerifyOtpCompletionSuccess = {
  kind: "delivery_completed";
  deliveryId: string;
  lifecycleEventId: string;
  completedAt: string;
  proofType: "otp";
  receivedByName: string;
};
```

Output handling:
- Host routes to delivered state.
- Host refreshes timeline.
- Host clears local proof state.
- Host must not keep proof reference in analytics.

### Blocked Output
```ts
type VerifyOtpBlockedOutput = {
  kind:
    | "phone_context_missing"
    | "verification_required"
    | "verification_locked"
    | "offline_blocked"
    | "missing_completion_grant"
    | "scope_blocked"
    | "custody_blocked"
    | "status_blocked";
  recoveryAction:
    | "go_to_phone_challenge"
    | "refresh_status"
    | "use_signature"
    | "use_photo"
    | "record_failed_attempt"
    | "contact_support"
    | "close";
};
```

## State Machine
### Receiver Verification Flow
```text
closed
  -> opening
  -> context_loading
  -> phone_context_missing
  -> phone_challenge_ready
  -> otp_entry
  -> otp_submitting
  -> otp_verified
  -> closing
```

Alternative receiver paths:
```text
phone_context_missing -> close_to_phone_challenge
phone_challenge_ready -> challenge_requesting
challenge_requesting -> challenge_sent
challenge_requesting -> challenge_recently_sent
challenge_requesting -> already_verified
otp_submitting -> otp_wrong_generic
otp_submitting -> otp_expired
otp_submitting -> verification_locked
otp_submitting -> verification_provider_unavailable
otp_submitting -> network_error
otp_wrong_generic -> otp_entry
otp_expired -> phone_challenge_ready
verification_locked -> closing_or_support
```

### Courier Completion Flow
```text
closed
  -> opening
  -> context_loading
  -> completion_blocked_missing_grant
  -> courier_assist
  -> completion_ready
  -> completion_submitting
  -> completion_succeeded
  -> closing
```

Alternative courier paths:
```text
completion_ready -> offline_blocked
completion_ready -> custody_blocked
completion_ready -> status_blocked
completion_submitting -> phone_verification_required
completion_submitting -> server_rejected
completion_submitting -> network_error
phone_verification_required -> courier_assist
completion_blocked_missing_grant -> fallback_signature
completion_blocked_missing_grant -> fallback_photo
completion_blocked_missing_grant -> failed_attempt
```

### Station Completion Flow
```text
closed
  -> opening
  -> context_loading
  -> completion_ready
  -> completion_submitting
  -> completion_succeeded
  -> closing
```

Alternative station paths:
```text
completion_ready -> scope_blocked
completion_ready -> station_policy_blocked
completion_ready -> offline_blocked
completion_submitting -> phone_verification_required
completion_submitting -> server_rejected
```

## API Calls
### Request Phone Challenge
Use only in receiver-owned contexts.

Request:
```json
{
  "phone": "+233241234567"
}
```

Response handling:
- `sent`: show OTP entry and resend timing.
- `recently_sent`: show OTP entry and cooldown.
- `already_verified`: store verification grant in approved ephemeral state and close or route forward.

Do not render:
- `deliveryId`.
- `challengeId`.
- `verificationToken`.
- Raw `trackingCode` in analytics.

### Verify Phone
Use only in receiver-owned contexts.

Request:
```json
{
  "phone": "+233241234567",
  "otp": "123456"
}
```

Response handling:
- Store `verificationToken` in approved ephemeral receiver state.
- Announce success.
- Close modal or route host to timeline.
- In courier bridge contexts, pass only a courier-safe proof reference if backend provides one.

Do not:
- Show `verificationToken`.
- Persist token in local storage unless security architecture explicitly approves encrypted, expiry-bound storage.
- Send OTP to analytics.
- Log raw phone.

### Complete Delivery
Use only in operational completion contexts.

Request:
```json
{
  "proofType": "otp",
  "proofReference": "active-receiver-verification-token-or-approved-proof-reference",
  "receivedByName": "Kojo Asante"
}
```

Response handling:
- Mark host delivery state as delivered only after success.
- Clear modal proof state.
- Refresh delivery detail and timeline.
- Route to completion success.

Do not:
- Send raw OTP as `proofReference`.
- Send `receiverVerified=true`.
- Submit when missing active proof reference.
- Queue final completion offline.

## Error Mapping
| Backend/Error | User Mode | Modal State | User Copy |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` on OTP field | receiver | `otp_invalid_local` or `server_rejected` | `Check the code and try again.` |
| `FORBIDDEN` from verify | receiver | `otp_wrong_generic` | `We could not verify that code. Check the SMS and try again.` |
| `RATE_LIMITED` | receiver | `verification_locked` | `Verification is temporarily locked. Try again after the time shown.` |
| `ROUTE_NOT_ENABLED` | receiver | `verification_provider_unavailable` | `SMS verification is not available right now. Contact support or use the approved handoff path.` |
| `NOT_FOUND` | receiver | `server_rejected` | `We could not verify this tracking link.` |
| `PHONE_VERIFICATION_REQUIRED` | courier/station | `completion_blocked_missing_grant` | `Receiver verification is required before OTP completion.` |
| `FORBIDDEN` from complete | courier/station | `custody_blocked` or `scope_blocked` | `You do not have permission to complete this handoff.` |
| `INVALID_STATUS_TRANSITION` | courier/station | `status_blocked` | `This delivery is not in a status that can be completed here.` |
| Network timeout | all | `network_error` | `Connection failed. Check your network and try again.` |
| Offline | all | `offline_blocked` | `OTP verification and completion require an online connection.` |

Error copy rules:
- Be specific about user recovery.
- Do not reveal internal failure reason.
- Do not confirm whether a phone belongs to the delivery after a failed attempt.
- Do not blame the receiver.
- Do not suggest bypassing OTP.

## Interaction Details
### Opening
- Freeze background interaction.
- Set focus to modal title, then first actionable field or status card depending on state.
- Restore focus to triggering control on close.
- Load host context before enabling primary action.

### Closing
Allowed close:
- Before submission.
- After success acknowledgement.
- During waiting states.

Blocked close:
- During active OTP submit unless cancel is safe.
- During active completion mutation.

Close copy:
- Receiver mode unsent code: `Close verification?`
- Courier mode ready completion: `Close OTP handoff?`
- Completion submitting: no close action until request resolves.

### Keyboard
- `Escape` closes only when not submitting.
- `Enter` submits when OTP field is valid and focus is inside receiver form.
- `Enter` completes only when completion mode prerequisites are met.
- `Tab` stays inside modal.
- `Shift+Tab` cycles backward inside modal.

### Mobile Keyboard
- Footer primary action remains reachable.
- OTP field remains visible when keyboard opens.
- Scroll container must not trap the input under fixed footer.
- Tap target minimum follows WCAG guidance and platform norms.

### Paste
- Full OTP paste is accepted.
- Spaces and hyphens are stripped.
- Pasted code is not written to analytics.
- Paste success may visually fill segmented boxes but should remain one accessible input.

### Autofill
- Web: `autocomplete="one-time-code"`.
- Mobile native: use platform OTP code suggestion where available.
- Autofill must still require explicit submit unless product chooses automatic verification with clear progress and cancellation.

### Resend
- Resend is receiver-only unless courier opens receiver-owned route.
- Resend disabled until backend cooldown.
- Resend must call backend, not client countdown alone.
- Resend success clears prior OTP field.

### Refresh Verification
- Courier refresh checks host-approved state.
- If backend lacks a courier verification status endpoint, refresh reloads delivery and local bridge state only.
- Refresh never exposes receiver token.

## Visual Design System
### Art Direction
The modal should feel more like a secure handoff console than a generic alert.

Visual traits:
- High contrast status card.
- Focused code input.
- Calm verification language.
- Strong primary CTA.
- Minimal chrome.
- Clear recovery paths.
- No decorative security clutter.

### Layout
Mobile:
- Full-height bottom sheet or full-screen modal for operations app.
- Header fixed at top.
- Content scrolls.
- Footer action bar fixed above safe area.
- OTP input appears in first viewport.

Desktop public web:
- Centered modal with max width around 520 to 600 px.
- Avoid tall dense panels unless lockout or recovery requires detail.
- Keep OTP input and primary action visible without scroll on common laptop viewports.

Tablet operations:
- Centered modal or side sheet depending on host pattern.
- Delivery identity and status can sit side by side if space allows.

### Typography
- Title: strong, direct, 22 to 28 px depending on platform.
- Body: 15 to 17 px, readable under field conditions.
- OTP digits: large and spaced, but not theatrical.
- Error text: direct, adjacent to field and summarized in status area.

### Color
- Success: reserved for verified and completed.
- Warning: used for waiting, missing proof, resend, and expiry.
- Error: used for lockout, blocked status, and failed completion.
- Neutral: used for loading and guidance.
- Never rely on color alone.

### Motion
- Open with subtle scale and opacity.
- Status transitions may use restrained crossfade.
- OTP digit fill may use a short settle motion.
- Error should use field emphasis without shaking aggressively.
- Respect reduced motion.
- No looping animation during code entry.

## Content Specification
### Receiver Mode Copy
Title:
- `Verify your delivery`

Subtitle:
- `Enter the SMS code sent to the receiver phone.`

Field label:
- `SMS code`

Field helper:
- `Use the code from the latest Kra SMS.`

Primary CTA:
- `Verify code`

Resend CTA:
- `Send a new code`

Success:
- `Receiver verified.`

Success detail:
- `You can now continue to your package status.`

Wrong code:
- `We could not verify that code. Check the SMS and try again.`

Expired code:
- `That code expired. Send a new code to continue.`

Locked:
- `Too many attempts. Try again after the time shown or contact support.`

Offline:
- `OTP verification needs an online connection.`

### Courier Mode Copy
Title:
- `Verify OTP handoff`

Subtitle:
- `Complete only after receiver verification is active.`

Ready:
- `Receiver verified. You can complete with OTP proof.`

Missing verification:
- `Receiver verification is required before OTP completion.`

Guidance:
- `Ask the receiver to open their Kra tracking link and verify their phone. Keep the package until this screen is ready.`

Primary CTA:
- `Complete with OTP proof`

Secondary CTA:
- `Refresh status`

Fallback:
- `Use another approved proof`

Blocked:
- `This handoff cannot be completed with OTP yet.`

### Station Mode Copy
Title:
- `Verify receiver pickup`

Subtitle:
- `Complete pickup only after receiver verification is active.`

Ready:
- `Receiver verified. You can complete pickup.`

Missing verification:
- `Receiver verification is required before pickup completion.`

Primary CTA:
- `Complete pickup`

Escalation:
- `Escalate pickup issue`

## Security And Privacy Rules
Secrets:
- OTP digits are secrets.
- Verification token is a secret.
- Public challenge ID is operationally sensitive.
- Raw receiver phone is personally identifiable information.
- Raw tracking code must be treated carefully in analytics.

Storage:
- OTP digits live only in component state.
- Clear OTP on success, close, resend, expiry, lockout, or route change.
- Verification token lives only in approved ephemeral state.
- Do not use query params for OTP, phone, challenge ID, or token.
- Do not write OTP or token to local storage.
- Do not include OTP or token in error boundaries.

Logging:
- Analytics may record modal opened, mode, state group, and high-level outcome.
- Analytics must not record raw OTP, raw phone, verification token, challenge ID, proof reference, or full tracking code.
- Error logs must redact request body for verification and completion calls.

Clipboard:
- Do not copy OTP or token.
- If receiver pastes OTP, do not inspect clipboard outside paste event payload.
- Do not offer copy proof reference.

Screenshots:
- Operations app should allow normal OS behavior unless enterprise policy says otherwise.
- Do not show token, full phone, or OTP after success.

## Accessibility Requirements
Modal:
- `role="dialog"` or native dialog equivalent.
- `aria-modal="true"` where applicable.
- Labelled by visible modal title.
- Described by current state detail.
- Background inert while open.
- Focus trapped while open.
- Focus returns to trigger on close.

Status:
- Verification status changes announced through a polite live region.
- Errors announced through assertive or field-linked messaging.
- Countdown changes should not announce every second.
- Success announced once.

OTP input:
- Visible label.
- Single accessible input preferred.
- Segmented visual boxes must not create inaccessible focus fragmentation.
- Error linked through `aria-describedby`.
- Autocomplete does not replace accessible naming.

Touch:
- Primary, resend, fallback, close, and support controls meet target size guidance.
- Controls have enough spacing for one-handed field use.

Color:
- Status is conveyed through text and icon shape, not only color.
- High contrast mode must preserve all states.

Motion:
- Honor reduced motion.
- Avoid flashing.

## Empty, Loading, And Recovery States
### `context_loading`
Show:
- Skeleton status card.
- Disabled primary action.
- Copy: `Checking verification context.`

Do not:
- Show empty OTP field if phone context is not known.
- Enable completion.

### `phone_context_missing`
Show:
- Copy: `Enter the receiver phone first so Kra can verify the SMS code.`
- CTA: `Go to phone verification`.

Do not:
- Ask for OTP alone.

### `challenge_recently_sent`
Show:
- Masked phone.
- Resend timer.
- OTP input.
- Copy: `A code was already sent. Use the latest SMS.`

### `already_verified`
Show:
- Success status.
- Continue action.
- No OTP input.

### `completion_blocked_missing_grant`
Show:
- Courier guidance.
- Refresh.
- Fallback actions.

Do not:
- Display OTP input in courier mode.

### `offline_blocked`
Show:
- Clear offline status.
- Retry when online.
- Approved offline guidance.

Do not:
- Queue OTP verification.
- Queue final completion.
- Mark delivery complete.

### `verification_locked`
Show:
- Lockout copy.
- Next eligible time if provided.
- Support route.
- Back to package status.

Do not:
- Allow resend until backend allows it.

## Host Integration
### Receiver Public Host
Host responsibilities:
- Provide tracking code.
- Provide phone context from phone challenge step.
- Store verification grant in approved ephemeral state.
- Route verified receiver to timeline.
- Clear grant when expired.

Modal responsibilities:
- Validate OTP input.
- Call verification endpoint.
- Return verified output.
- Keep token invisible.

### Courier Mobile Host
Host responsibilities:
- Provide delivery context.
- Provide custody state.
- Provide active proof reference only through approved bridge.
- Provide fallback route handlers.
- Call route refresh when needed.
- Handle completion success routing.

Modal responsibilities:
- Block completion until proof reference is present.
- Call `complete_delivery` only when prerequisites are met.
- Return completion success output.
- Surface fallback and failed-attempt actions.

### Station Host
Host responsibilities:
- Provide station scope and delivery status.
- Confirm policy allows OTP pickup.
- Provide proof reference through approved receiver verification route.
- Handle station pickup completion success.

Modal responsibilities:
- Use station-specific copy.
- Block wrong station scope.
- Block unsupported station OTP policy.

## Completion Eligibility Rules
Courier primary action is enabled only when:
- Mode is `courier_completion`.
- Delivery ID exists.
- Proof reference exists.
- Verification expiry is absent or still future according to host and backend.
- `receivedByName` passes validation.
- Courier has custody.
- Courier is assigned when assignment exists.
- Delivery status is eligible.
- App is online.
- No completion mutation is in progress.

Station primary action is enabled only when:
- Mode is `station_pickup_completion`.
- Delivery ID exists.
- Proof reference exists.
- `receivedByName` passes validation.
- Operator is scoped to destination station.
- Delivery status is `awaiting_receiver_pickup`.
- Station policy allows OTP pickup.
- App is online.
- No completion mutation is in progress.

Receiver primary action is enabled only when:
- Mode is receiver-owned.
- Tracking code exists.
- Phone exists in approved state.
- OTP passes local validation.
- App is online.
- No verification mutation is in progress.

Disabled reasons must be visible and testable.

## Analytics Events
Allowed event names:
- `verify_otp_modal_opened`.
- `verify_otp_challenge_requested`.
- `verify_otp_challenge_sent`.
- `verify_otp_submit_attempted`.
- `verify_otp_verified`.
- `verify_otp_verification_failed`.
- `verify_otp_completion_attempted`.
- `verify_otp_completion_succeeded`.
- `verify_otp_completion_blocked`.
- `verify_otp_fallback_selected`.
- `verify_otp_modal_closed`.

Allowed properties:
- `mode`.
- `openedFrom`.
- `state`.
- `errorCode`.
- `hasMaskedPhone`.
- `hasProofReference`.
- `fallbackType`.
- `networkState`.
- `timeToVerifyBucket`.
- `timeToCompleteBucket`.

Forbidden properties:
- OTP.
- Raw phone.
- Verification token.
- Proof reference.
- Challenge ID.
- Full tracking code.
- Full delivery ID unless analytics policy explicitly allows delivery ID hashing.
- Receiver name.

## Test Requirements
### Unit Tests
Must cover:
- Receiver OTP empty, short, long, non-digit validation.
- Paste normalization.
- `autocomplete` and numeric input attributes on web.
- Phone context missing state.
- Challenge sent state.
- Recently sent cooldown state.
- Already verified state.
- Successful verification output redacts token from render.
- Wrong code generic error.
- Expired code recovery.
- Lockout recovery.
- Offline blocked state.
- Courier mode does not render OTP input.
- Courier completion disabled without proof reference.
- Courier completion disabled without custody.
- Station completion disabled without destination station scope.
- `receivedByName` validation.
- Duplicate submit prevention.
- Focus return on close.
- Escape disabled during mutation.

### Integration Tests
Must cover:
- Receiver mode calls `verify_public_tracking_phone`.
- Receiver request mode calls `request_public_tracking_phone_challenge` then `verify_public_tracking_phone`.
- Receiver success routes to timeline through host.
- Token never appears in DOM text.
- Token never appears in URL.
- Courier mode calls `complete_delivery` only with `proofType=otp` and proof reference.
- Courier mode never sends raw OTP to `/complete`.
- `PHONE_VERIFICATION_REQUIRED` maps to missing grant recovery.
- Completion success routes to delivered state.
- Network error keeps modal recoverable.
- Lockout shows support path.

### Accessibility Tests
Must cover:
- Dialog labelling.
- Focus trap.
- Focus return.
- Keyboard submit.
- Keyboard close.
- Live status announcements.
- Field error linkage.
- Reduced motion behavior.
- High contrast status legibility.
- Touch target sizing where automated tooling can validate dimensions.

### Security Tests
Must cover:
- No OTP in analytics payload.
- No token in analytics payload.
- No raw phone in analytics payload.
- No challenge ID in analytics payload.
- No OTP in route params.
- No token in route params.
- OTP cleared on close.
- OTP cleared on success.
- OTP cleared on resend.
- Completion rejects missing proof reference.
- Completion rejects raw code-looking proof reference in courier mode if host can detect it.

## QA Scenarios
### Receiver Happy Path
1. Receiver opens modal with valid phone context.
2. OTP field is focused.
3. Receiver pastes code.
4. Modal submits verification.
5. Success status appears.
6. Host receives verification output.
7. Token is not visible.
8. Host routes to timeline.

### Receiver Recently Sent
1. Receiver requests new code during cooldown.
2. Backend returns `recently_sent`.
3. Modal shows cooldown.
4. OTP entry remains available.
5. Resend stays disabled until backend time.

### Receiver Wrong Code
1. Receiver enters wrong code.
2. Backend returns generic failure.
3. Modal keeps OTP entry available.
4. Copy does not reveal internal reason.
5. Attempts remaining may be shown only if backend safely returns it and policy approves.

### Receiver Lockout
1. Receiver exceeds failed attempt threshold.
2. Backend returns `RATE_LIMITED`.
3. Modal shows lockout state.
4. Verify and resend are disabled.
5. Support route is available.

### Courier Missing Verification
1. Courier opens modal in completion mode without proof reference.
2. Modal does not render OTP input.
3. Modal shows receiver guidance.
4. Complete CTA disabled.
5. Signature, photo, failed attempt, and support exits are visible.

### Courier Successful Completion
1. Host provides active proof reference.
2. Courier confirms `receivedByName`.
3. Courier taps `Complete with OTP proof`.
4. Modal submits `/complete`.
5. Backend succeeds.
6. Modal returns completion output.
7. Host routes to delivered state.

### Courier Backend Requires Verification
1. Host provides stale proof reference.
2. Courier submits completion.
3. Backend returns `PHONE_VERIFICATION_REQUIRED`.
4. Modal clears completion-ready state.
5. Modal shows receiver guidance and fallback routes.

### Offline
1. Device goes offline.
2. Receiver verify and courier complete CTAs disable.
3. Modal explains online requirement.
4. No OTP or completion request is queued.

## Implementation Notes For Claude Code
Build this as a shared modal primitive with mode-specific render branches. Do not implement one-off duplicate OTP components across receiver web and operations mobile apps.

Recommended internal structure:
- `VerifyOtpModal`.
- `VerifyOtpStatusCard`.
- `ReceiverOtpEntry`.
- `ReceiverChallengeControls`.
- `CourierOtpGuidance`.
- `OtpCompletionForm`.
- `OtpFallbackActions`.
- `OtpSecurityNote`.

Recommended hooks or services:
- `useVerifyOtpModalState`.
- `useReceiverOtpVerification`.
- `useOtpCompletion`.
- `useOtpRedaction`.
- `useOtpCountdown`.

Contract constraints:
- Receiver mode owns OTP field and verification call.
- Courier mode owns completion call only after proof reference is provided.
- Station mode uses same completion call with station-specific eligibility.
- Analytics adapter must accept only redacted event properties.
- Error mapper must convert backend codes into modal states.

Do not add:
- Raw courier OTP entry for completion.
- Token display.
- Token copy button.
- URL token bridge.
- Offline completion queue.
- Broad delivery details.
- Full receiver phone after failure.
- Hidden multi-input OTP fields that fragment accessibility.

## Acceptance Criteria
This file is complete only when implementation can satisfy all of these:
- Receiver can verify OTP through public verification.
- Courier can complete with OTP proof only when active proof reference exists.
- Station can complete pickup with OTP only when policy and scope allow it.
- Courier mode never asks for raw SMS code.
- `/complete` never receives raw OTP digits.
- Verification token is never rendered, logged, copied, or placed in URL.
- OTP input supports paste and platform autofill.
- Resend honors backend cooldown.
- Lockout honors backend response.
- Offline cannot mark delivery complete.
- Fallback proof routes are visible when OTP is blocked.
- Failed-attempt route is visible when receiver cannot verify.
- Modal accessibility meets dialog, status, error, focus, and target requirements.
- Automated tests cover receiver, courier, station, security, accessibility, and error paths.

## Final Quality Bar
The modal should feel like a premium, field-tested verification experience:
- Fast for a receiver with a code.
- Safe for a courier under handoff pressure.
- Clear for a station operator protecting custody.
- Strict enough for audit and dispute defense.
- Calm enough for low-literacy, weak-network, real-world delivery conditions.
- Strong enough that unsafe OTP shortcuts feel impossible rather than merely discouraged.

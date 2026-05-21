# OTP Required State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `otp_required` |
| Component family | Shared screen state |
| Primary component | `SharedOtpRequiredState` |
| Supporting components | `OtpProofGateCard`, `ReceiverVerificationPrompt`, `OtpTokenReadinessStrip`, `OtpFallbackActions`, `OtpSecurityNotice`, `OtpRateLimitPanel`, `OtpOfflineBoundaryPanel`, `OtpCourierBridgeNotice` |
| Primary surfaces | receiver public flow, final-mile courier mobile app, operations mobile shared proof routes, admin evidence review |
| Required recovery | open receiver phone challenge, open receiver OTP verification, open courier OTP completion, open proof selector, choose approved fallback proof, open failed attempt, or open support |
| Test id root | `state-otp-required` |
| Backend coverage | `PHONE_VERIFICATION_REQUIRED`, `request_public_tracking_phone_challenge`, `verify_public_tracking_phone`, `complete_delivery`, active receiver verification token, OTP proof reference requirement |
| Browser mutation operation | None directly; this state routes users to verification or fallback proof flows before completion |
| Data sensitivity | OTP digits, receiver phone, verification token, challenge state, proof reference, tracking code, receiver identity, courier custody state |
| Offline critical | Yes for guidance and recovery, but final OTP verification and OTP completion require live backend authority |
| Related inventory state | `otp_required` |
| Related state specs | proof required, custody not confirmed, session expired, not authorized, rate limited, offline, stale data, error |
| Design tokens | `otp.blue.700`, `otp.green.700`, `otp.amber.700`, `otp.red.700`, `neutral.950`, `neutral.700`, `neutral.500`, `surface`, spacing `4-40`, radius `8-18` |
| Accessibility target | WCAG 2.1 AA equivalent with labelled OTP guidance, clear recovery, status announcements, large touch targets, and predictable focus order |

## Purpose
`SharedOtpRequiredState` is the shared UI state shown when a delivery completion path requires an active receiver OTP verification token, but that token is missing, expired, invalid, unavailable to the current app surface, or not yet connected to completion.

This state must answer:
- `Why can delivery not be completed with OTP yet?`
- `Who needs to verify?`
- `Where should the receiver go to verify?`
- `What should the courier do while waiting?`
- `Can the user use signature or delivery photo fallback?`
- `Is the app offline, rate limited, expired, or missing safe verification context?`
- `What data must not be shown or logged?`
- `How does this differ from generic proof required?`

The most important rule is:
```text
OTP completion requires an active delivery-scoped receiver verification token. Raw OTP digits are not a courier completion proof.
```

## Product Job
Kra uses OTP as the default proof method for final-mile completion. The receiver proves control of the delivery-linked phone through the public receiver flow. The courier completes delivery only when an approved active receiver verification proof reference is available.

The OTP required state must:
- stop OTP completion when no active verification token exists
- direct receiver-facing users to phone challenge and OTP verification
- direct couriers to receiver verification guidance and approved fallback proof options
- clearly explain that backend verification is required
- prevent raw OTP digits, receiver phone, and verification token exposure
- keep delivery completion disabled until proof authority is satisfied
- handle expired, invalid, throttled, missing-context, offline, and backend-required states
- keep fallback proof controlled and auditable
- avoid confusing OTP proof with account login or staff authentication

## Strategic Role
OTP required is a trust and proof state. It protects the handoff from courier-only confirmation and gives the receiver a simple way to prove presence or consent without exposing internal delivery data.

The design must be strict:
- no courier-entered raw OTP completion
- no token in URLs
- no token in analytics
- no phone number leak
- no offline OTP completion
- no success state before backend completion
- no fallback proof without policy framing
- no repeated OTP requests without cooldown and rate-limit respect

The design must also be practical:
- receivers may not understand the delivery app
- couriers may have weak network at the door
- OTP SMS can be delayed
- receivers can lose the tracking link
- fallbacks must preserve service continuity
- support needs clear evidence when OTP cannot be completed

This state makes the secure path obvious while keeping safe alternatives visible.

## External Research Used
Only directly relevant OTP, MFA, SMS, and accessibility references were used:
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports replay resistance, verifier-side validation, limited validity, and one-time secret handling.
- [OWASP Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html): supports OTP throttling, invalidation after success, recovery controls, and careful failure language.
- [web.dev SMS OTP form guidance](https://web.dev/articles/sms-otp-form): supports `autocomplete="one-time-code"`, numeric input, paste-friendly entry, and origin-bound SMS guidance for receiver web verification.
- [Twilio Verify best practices](https://www.twilio.com/docs/verify/developer-best-practices): supports retry cooldowns, masking sensitive information, token length and timeout awareness, and verification UX discipline.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing verification and completion states without unexpected focus movement.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear OTP error and recovery text.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable focus through verification status, form, actions, and fallback.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports touch targets for receiver and courier recovery actions.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/04-features/tracking-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/design-system.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/02-receiver-phone-challenge.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/03-receiver-otp-verify.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/05-receiver-arrival-instructions.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `packages/shared/src/contracts/api.ts`

## Visual Thesis
OTP required should feel like a secure proof gate: human, calm, and precise, with one clear path for receiver verification and one guarded path for fallback proof.

Use:
- clear proof status panel
- blue for waiting verification
- green only after verified proof is available
- amber for expiry, resend cooldown, or offline guidance
- red for blocked completion or too many attempts
- a step strip showing receiver verifies, courier completes
- large receiver-facing verification actions
- fallback proof options visually secondary

Do not use:
- staff-auth language
- raw OTP display
- raw verification token
- full receiver phone
- `Complete delivery` while proof reference is missing
- hidden fallback after OTP failure
- confusing success color for SMS sent only
- generic `Verification failed`
- unlimited resend affordance

## Audience
Primary users:
- receiver verifying phone through public tracking flow
- final-mile courier trying to complete delivery with OTP proof
- final-mile courier recovering after `PHONE_VERIFICATION_REQUIRED`
- support staff guiding a receiver or courier through proof recovery

Secondary users:
- sender reading proof policy
- ops admin reviewing final-mile proof failures
- QA validating receiver verification and delivery completion
- security reviewer checking OTP and token leakage
- accessibility reviewer validating OTP states
- Claude Code implementing the shared state later

Non-users:
- unauthenticated user without tracking code
- station operator outside support context
- driver outside final-mile proof context
- finance-only admin
- payment provider

## Non-Goals
Do not use OTP required for:
- courier custody missing
- signature required after user chose signature
- delivery photo required after user chose photo
- proof asset upload failure
- package scan mismatch
- duplicate package label
- payment blocker
- active issue lock
- route permission failure
- session expiry
- generic API error
- account sign-in OTP

Use `proof_required` when no proof method has been selected or when signature/photo proof is missing. Use `custody_not_confirmed` when courier custody is missing. Use `rate_limited` when the entire screen is blocked by attempt limits. Use `session_expired` for authenticated courier session expiry.

## State Definition
`otp_required` is active when the intended completion path is OTP and the active receiver verification grant required for completion is not available or not usable.

Canonical triggers:
- backend returns `PHONE_VERIFICATION_REQUIRED`
- courier OTP completion screen loads without active verification proof reference
- receiver OTP verification context is missing
- receiver OTP verification token expired
- receiver challenge exists but OTP has not been verified
- receiver phone challenge has not been requested
- receiver OTP verification failed
- receiver OTP verification is throttled
- OTP completion attempted while offline
- courier app cannot access an approved token bridge

Non-canonical triggers:
- courier lacks final-mile custody
- payment is not confirmed
- proof type is signature or delivery photo
- receiver refuses delivery
- receiver is unavailable
- proof asset upload fails
- delivery already completed
- user cannot access delivery
- active issue lock blocks completion

## OTP Authority Model
Receiver public flow owns:
- phone challenge request
- OTP entry
- challenge expiry
- verification token creation
- receiver-safe tracking continuation

Courier mobile flow owns:
- proof method selection
- receiver verification guidance
- completion submission only with approved proof reference
- fallback route selection
- failed-attempt route

Backend owns:
- OTP generation
- OTP validation
- challenge expiry
- attempt limits
- active verification grant
- one-time acceptance
- delivery completion authority

Frontend must not:
- create OTP values
- validate OTP values as proof locally
- transform raw OTP digits into proof reference
- put verification token in route params
- show verification token
- store OTP after verification

## State Variants
| Variant | Applies when | Tone | Primary action |
| --- | --- | --- | --- |
| `receiver_challenge_needed` | receiver has not requested SMS code | blue | `Send code` |
| `receiver_otp_entry_needed` | SMS code was sent and receiver must enter it | blue | `Enter code` |
| `receiver_otp_invalid` | verify endpoint rejected code safely | amber | `Try code again` |
| `receiver_otp_expired` | challenge or token expired | amber | `Send new code` |
| `receiver_otp_throttled` | too many attempts or resend cooldown | red | `Wait and try again` |
| `receiver_context_missing` | OTP page lacks safe phone context | amber | `Verify phone again` |
| `courier_token_missing` | courier completion has no active proof reference | blue | `Ask receiver to verify` |
| `courier_token_expired` | proof reference expired before completion | amber | `Ask receiver to verify again` |
| `courier_bridge_unavailable` | approved token bridge is not implemented or unavailable | amber | `Use proof fallback` |
| `otp_offline_blocked` | OTP verification or completion attempted offline | amber | `Reconnect to verify` |
| `phone_verification_required` | backend returned `PHONE_VERIFICATION_REQUIRED` | red | `Open OTP proof` |

## Error Code Mapping
| Backend code | State mapping | Receiver message | Courier message |
| --- | --- | --- | --- |
| `PHONE_VERIFICATION_REQUIRED` | `otp_required` | `Receiver verification is required before completion.` | `Receiver OTP verification is required before completion.` |
| `RATE_LIMITED` | `otp_required` or `rate_limited` based on scope | `Too many attempts. Wait before trying again.` | `Verification attempts are cooling down.` |
| `VALIDATION_ERROR` on OTP field | OTP form field error | `Enter the code from the SMS.` | Not shown in courier completion |
| `FORBIDDEN` on receiver verify | invalid or expired OTP state | `That code did not work. Try again or request a new code.` | `Receiver verification is not active.` |
| `NOT_FOUND` on tracking | not found state | `Tracking link not found.` | `Delivery record not found.` |
| `PROVIDER_TIMEOUT` | unavailable state | `Verification service took too long.` | `Verification service took too long.` |
| `INTERNAL_ERROR` | error state | `Something went wrong on our side.` | `Something went wrong on our side.` |

## Role-Based Behavior
| Surface | Can enter OTP | Can see token | Can complete delivery | Primary route |
| --- | --- | --- | --- | --- |
| receiver public OTP page | Yes | No | No | `/r/:trackingCode/verify-otp` |
| receiver phone challenge | No | No | No | `/r/:trackingCode/verify-phone` |
| receiver arrival instructions | No | No | No | `/r/:trackingCode/arrival` |
| courier OTP completion | No raw SMS code | No | Yes, only with approved proof reference | `/(ops)/courier/assignments/:deliveryId/proof/otp` |
| courier proof selector | No | No | No | `/(ops)/courier/assignments/:deliveryId/proof` |
| support admin | No | No | No | issue or support route |
| ops admin | No | No by default | No | evidence review route |

## Information Architecture
The state has six regions:

1. Proof status header
- title
- required proof method
- verification readiness
- blocked completion note

2. Receiver instruction panel
- receiver action
- masked phone if already safe
- resend cooldown or expiry
- public route guidance

3. Courier bridge panel
- whether approved proof reference is available
- whether backend token bridge exists
- whether fallback is allowed

4. Recovery actions
- send code
- enter code
- open OTP proof
- use signature proof
- use delivery photo proof
- record failed attempt
- contact support

5. Security notice
- raw OTP is not shared with courier app
- token stays hidden
- completion requires backend verification

6. Offline and rate limit panel
- live connection required
- cooldown timer
- retry guidance

## Component Anatomy
`SharedOtpRequiredState` should compose:

- `StateShell`
- `OtpProofGateCard`
- `ReceiverVerificationPrompt`
- `OtpTokenReadinessStrip`
- `OtpFallbackActions`
- `OtpSecurityNotice`
- `OtpRateLimitPanel`
- `OtpOfflineBoundaryPanel`
- `OtpCourierBridgeNotice`

Recommended DOM or native order:
1. heading
2. proof status
3. receiver verification prompt
4. token readiness or bridge panel
5. primary action
6. fallback actions
7. security notice
8. support or failed attempt route

## Visual System
Base palette:
- background: `surface`
- foreground: `neutral.950`
- supporting text: `neutral.700`
- muted text: `neutral.500`
- waiting: `otp.blue.700`
- verified: `otp.green.700`
- caution: `otp.amber.700`
- blocked: `otp.red.700`
- border: `neutral.200`
- focus: `focus.ring`

Layout:
- receiver web: centered verification card with progress strip
- courier mobile: full-width proof gate with thumb-reachable actions
- modal host: compact alert-dialog body
- admin evidence: read-only proof requirement panel

Spacing:
- card padding mobile: `20`
- card padding desktop: `28`
- action gap: `12`
- section gap: `18`
- footer safe-area padding on mobile

## Tone And Copy Principles
Copy must be:
- calm
- plain
- receiver-friendly
- specific about who verifies
- clear about online requirement
- explicit that completion is blocked until verification is active

Copy must not:
- reveal whether a specific phone exists
- reveal whether a specific OTP was close
- blame receiver or courier
- call SMS sent a completed proof
- call raw OTP a proof reference
- suggest courier should ask for or store token
- imply fallback is equal priority unless OTP cannot be completed

## Canonical Copy
### Default Title
```text
Receiver verification required
```

### Receiver Challenge Body
```text
Verify the receiver phone before delivery can be completed with OTP.
```

### Receiver OTP Entry Body
```text
Enter the code sent to the receiver phone. The code can be used only for this delivery.
```

### Courier Missing Token Body
```text
The receiver has not completed OTP verification yet. Ask them to verify from their tracking link.
```

### Backend Required Body
```text
Receiver OTP verification is required before completion.
```

### Offline Body
```text
OTP verification needs a live connection. Keep the package in your custody until verification or fallback proof is completed.
```

### Bridge Missing Body
```text
The receiver may verify successfully, but this courier app still needs an approved proof reference before completion.
```

### Security Notice
```text
Do not share or store OTP codes. Kra completes OTP delivery only after backend verification.
```

## Variant Copy Matrix
| Variant | Title | Body | Primary action |
| --- | --- | --- | --- |
| `receiver_challenge_needed` | `Verify receiver phone` | `Send a code to the receiver phone before OTP delivery proof can be used.` | `Send code` |
| `receiver_otp_entry_needed` | `Enter verification code` | `Enter the code sent to the receiver phone. It can be used only for this delivery.` | `Verify code` |
| `receiver_otp_invalid` | `Code did not work` | `Check the SMS code and try again, or request a new code if it expired.` | `Try again` |
| `receiver_otp_expired` | `Code expired` | `Request a new code before delivery can use OTP proof.` | `Send new code` |
| `receiver_otp_throttled` | `Wait before trying again` | `Too many attempts were made. Wait for the timer before requesting or entering another code.` | `Wait` |
| `receiver_context_missing` | `Verify phone again` | `This page no longer has the phone verification context needed for OTP.` | `Verify phone` |
| `courier_token_missing` | `Receiver verification required` | `The receiver has not completed OTP verification yet. Ask them to verify from their tracking link.` | `Open OTP guidance` |
| `courier_token_expired` | `OTP verification expired` | `The receiver verification is no longer active. Ask the receiver to verify again or choose an approved fallback.` | `Ask receiver again` |
| `courier_bridge_unavailable` | `OTP proof not connected` | `This app cannot complete OTP until an approved proof reference is available.` | `Use proof fallback` |
| `otp_offline_blocked` | `Connection required` | `OTP verification and completion need a live backend check.` | `Reconnect to verify` |
| `phone_verification_required` | `Receiver verification required` | `Receiver OTP verification is required before completion.` | `Open OTP proof` |

## Action Hierarchy
Receiver public challenge:
1. `Send code`
2. `Back to tracking`
3. `Contact support`

Receiver public OTP:
1. `Verify code`
2. `Send new code`
3. `Back to phone verification`
4. `Contact support`

Courier OTP completion:
1. `Open OTP guidance`
2. `Use signature proof`
3. `Use delivery photo proof`
4. `Record failed attempt`
5. `Contact support`

Courier backend required:
1. `Open OTP proof`
2. `Use proof fallback`
3. `Record failed attempt`
4. `Open support`

Offline:
1. `Reconnect to verify`
2. `Use approved fallback if receiver cannot verify`
3. `Record failed attempt`

Primary action rules:
- `Complete delivery` appears only when active proof reference exists and custody is confirmed.
- `Send code` respects cooldown.
- `Verify code` is disabled until code length is valid.
- `Use fallback` is visible only when policy allows fallback.
- `Record failed attempt` remains available when receiver cannot verify or is unavailable.

## Navigation Routes
Use existing route contracts:

- receiver phone challenge: `/r/:trackingCode/verify-phone`
- receiver OTP verification: `/r/:trackingCode/verify-otp`
- receiver tracking timeline: `/r/:trackingCode/timeline`
- receiver arrival instructions: `/r/:trackingCode/arrival`
- public support: `/support`
- courier proof selector: `/(ops)/courier/assignments/:deliveryId/proof`
- courier OTP proof: `/(ops)/courier/assignments/:deliveryId/proof/otp`
- courier signature proof: `/(ops)/courier/assignments/:deliveryId/proof/signature`
- courier photo proof: `/(ops)/courier/assignments/:deliveryId/proof/photo`
- courier failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- courier completed: `/(ops)/courier/assignments/:deliveryId/completed`
- offline outbox: `/(ops)/offline-outbox`
- action recovery: `/(ops)/action-recovery`
- issue create: `/(ops)/deliveries/:deliveryId/issues/new`

Route safety:
- do not include OTP in route params
- do not include verification token in route params
- do not include phone in route params
- do not include challenge ID in route params
- do not include proof reference in route params
- use only tracking code path already required by receiver public routes
- pass courier delivery ID only inside authenticated ops routes
- pass safe `source=otp_required` when supported

## Route Payloads
### Receiver Verification Context
Safe receiver state:
```ts
type ReceiverOtpContext = {
  trackingCode: string;
  maskedPhone?: string;
  challengeExpiresAt?: string;
  resendAvailableAt?: string;
  source: "otp_required";
};
```

Forbidden receiver state:
- full phone unless already required for form submit
- OTP after submission
- verification token in URL
- challenge secret
- delivery ID
- staff IDs

### Courier OTP Context
Safe courier state:
```ts
type CourierOtpRequiredContext = {
  deliveryId: string;
  source: "otp_required";
  proofType: "otp";
  receiverVerificationStatus: "missing" | "pending" | "verified" | "expired" | "unavailable";
  fallbackAllowed: boolean;
};
```

Forbidden courier state:
- raw OTP
- receiver verification token in visible state
- receiver full phone
- challenge ID
- proof reference in analytics

## Component Props
```ts
type OtpRequiredVariant =
  | "receiver_challenge_needed"
  | "receiver_otp_entry_needed"
  | "receiver_otp_invalid"
  | "receiver_otp_expired"
  | "receiver_otp_throttled"
  | "receiver_context_missing"
  | "courier_token_missing"
  | "courier_token_expired"
  | "courier_bridge_unavailable"
  | "otp_offline_blocked"
  | "phone_verification_required";

type OtpSurface = "receiver_public" | "courier_mobile" | "admin_evidence" | "support";

type SharedOtpRequiredStateProps = {
  variant: OtpRequiredVariant;
  surface: OtpSurface;
  trackingCode?: string;
  deliveryId?: string;
  maskedPhone?: string;
  resendAvailableAt?: string;
  challengeExpiresAt?: string;
  cooldownSecondsRemaining?: number;
  isOnline: boolean;
  fallbackAllowed: boolean;
  receiverVerificationStatus?: "missing" | "pending" | "verified" | "expired" | "unavailable";
  canSendCode: boolean;
  canVerifyCode: boolean;
  canOpenOtpProof: boolean;
  canUseSignature: boolean;
  canUsePhoto: boolean;
  canRecordFailedAttempt: boolean;
  onSendCode?: () => void;
  onVerifyCode?: () => void;
  onOpenOtpProof?: () => void;
  onOpenPhoneChallenge?: () => void;
  onUseSignature?: () => void;
  onUsePhoto?: () => void;
  onRecordFailedAttempt?: () => void;
  onContactSupport?: () => void;
  onBack?: () => void;
};
```

Prop rules:
- raw OTP is never a prop to this shared state.
- verification token is never a prop to this shared state.
- full phone is not rendered; use `maskedPhone`.
- courier completion proof reference belongs to secure completion state, not this state display.
- route callbacks are host-owned.
- component must not call completion mutation directly.

## Receiver OTP Input Rules
Use on receiver OTP verification form, not courier mobile completion:
- visible label: `Verification code`
- use `autocomplete="one-time-code"` on web
- use numeric input mode where platform supports it
- accept paste of the full code
- trim whitespace
- accept `4` to `8` characters according to shared schema
- show grouped visual slots only if native input remains accessible
- clear OTP after success
- clear OTP when user requests a new code
- do not store OTP beyond active form state
- do not prefill OTP after route reload

Do not:
- use `type="number"` if it breaks leading zeros or accessibility
- split code into inaccessible individual fields
- announce each digit individually
- show whether code was close
- keep code visible in page after success

## Courier OTP Completion Rules
Courier OTP completion screen:
- does not ask courier for raw SMS code
- checks whether an active receiver verification proof reference is available through approved bridge
- disables `Complete delivery` when proof reference is missing
- shows `Receiver verification required`
- routes receiver to public verification guidance
- offers signature or delivery photo fallback when OTP cannot be completed
- offers failed attempt when receiver is absent or refuses
- handles `PHONE_VERIFICATION_REQUIRED` by returning to this state

Completion is allowed only when:
- courier is authenticated
- courier has final-mile custody
- delivery is eligible for completion
- proof type is `otp`
- approved active proof reference exists
- received by name is present
- backend accepts `/complete`

## Backend Bridge Rules
Until a courier-safe proof reference bridge exists:
- do not claim OTP completion is fully connected in courier app
- show bridge unavailable variant when token is missing because contract is absent
- send courier to fallback proof if receiver cannot verify through supported path
- document the backend dependency in implementation notes

Approved future bridge patterns:
- server-side active grant lookup during `/complete`
- authenticated courier proof-reference exchange endpoint
- receiver-to-courier redeemable proof link or QR

Rejected bridge:
- receiver reads SMS OTP to courier and courier submits raw code to `/complete`

## State Machine
```text
idle
  -> verification_required
  -> receiver_challenge_needed
  -> challenge_sent
  -> receiver_otp_entry_needed
  -> verifying_otp
  -> receiver_verified
  -> proof_reference_available
  -> completion_ready

verification_required
  -> courier_token_missing
  -> open_receiver_guidance

verification_required
  -> fallback_selected
  -> proof_required

verification_required
  -> failed_attempt_selected
  -> failed_attempt_flow

verifying_otp
  -> receiver_otp_invalid
  -> receiver_otp_entry_needed

verifying_otp
  -> receiver_otp_expired
  -> receiver_challenge_needed

receiver_verified
  -> token_expired
  -> receiver_otp_expired
```

Forbidden transitions:
- `receiver_challenge_needed -> delivered`
- `receiver_otp_entry_needed -> delivered`
- `courier_token_missing -> complete_delivery`
- `otp_offline_blocked -> complete_delivery`
- `receiver_otp_invalid -> complete_delivery`
- `receiver_otp_throttled -> verify_otp`
- `raw_otp_entered_in_courier_app -> complete_delivery`

## Mobile Layout
Courier mobile state:
- delivery proof header
- verification status card
- receiver instruction text
- primary OTP guidance action
- fallback proof row
- failed attempt action
- security notice
- support link

Mobile layout rules:
- keep primary action thumb-reachable
- keep fallback below OTP guidance
- show offline warning above actions
- do not show token or OTP
- keep receiver name and proof method visible
- disable completion while this state is active

## Receiver Web Layout
Receiver public state:
- centered verification card
- delivery-safe tracking context
- masked phone if available
- OTP input or challenge action
- cooldown and expiry copy
- support link
- privacy note

Receiver layout rules:
- first viewport explains why verification is needed
- OTP field has visible label
- errors appear next to input and in summary when needed
- resend timer is visible and announced
- tracking code can remain in route path
- no internal delivery IDs

## Admin Evidence Layout
Admin evidence state:
- read-only proof requirement panel
- delivery ID and tracking code when allowed
- proof type expected
- verification status if backend exposes it
- no token display
- links to proof evidence review or issue detail

Admin must not:
- reveal receiver OTP
- reveal verification token
- manually mark OTP verified
- bypass proof policy

## Empty And Missing Data Behavior
If tracking code is missing on receiver route:
- show tracking access error
- route to `/track`
- do not ask for OTP alone

If phone context is missing:
- show `Verify phone again`
- route to `/r/:trackingCode/verify-phone`

If masked phone is unavailable:
- omit phone row
- do not show full phone from memory

If delivery ID is missing in courier route:
- show delivery context error
- return to assignment list

If receiver verification status is unavailable:
- show `Receiver verification status is unavailable`
- offer refresh, fallback proof, or failed attempt

If fallback is not allowed:
- hide fallback proof buttons
- show failed attempt and support

## Offline Rules
Receiver public:
- phone challenge request requires network
- OTP verification requires network
- show offline state with retry
- do not store OTP for later background submit

Courier mobile:
- OTP completion requires network
- cached guidance can stay visible
- completion action disabled offline
- fallback proof capture may proceed only if its own offline policy allows it
- failed attempt route may be available if offline policy allows queued failed attempt

Offline copy:
```text
OTP verification needs a live connection. Keep the package in your custody until verification or fallback proof is completed.
```

Do not:
- queue OTP verification
- queue raw OTP completion
- call delivery delivered from local state
- hide online requirement

## Rate Limit And Cooldown Rules
Receiver challenge:
- show resend cooldown
- disable send button until allowed
- show exact wait time when backend provides it
- use generic safe failure copy

Receiver OTP entry:
- limit attempts according to backend response
- after too many attempts, show throttled variant
- do not reveal whether phone, challenge, or OTP caused failure
- allow support route

Courier:
- show waiting state if receiver is rate limited
- offer fallback proof only when policy allows and receiver cannot complete OTP
- do not let courier bypass cooldown with raw code entry

## Privacy And Security Rules
The component must not render:
- raw OTP
- verification token
- challenge ID
- full receiver phone
- receiver private address on public routes
- proof reference
- provider message IDs
- internal user IDs
- raw backend verification metadata

The component may render:
- masked receiver phone
- tracking code on receiver public route
- delivery ID on authenticated courier/admin routes
- proof type
- verification status
- expiry or cooldown labels
- support route

Data handling:
- OTP remains in receiver OTP form state only
- verification token remains in approved secure proof state only
- token is cleared after completion or expiry
- analytics must exclude OTP, phone, token, challenge ID, and proof reference
- logs must not contain OTP or token
- crash reports must not include OTP input value

## Analytics
Event names:
- `otp_required_viewed`
- `otp_required_action_selected`
- `receiver_phone_challenge_requested`
- `receiver_otp_verify_submitted`
- `receiver_otp_verify_failed`
- `receiver_otp_verified`
- `courier_otp_guidance_opened`
- `courier_otp_fallback_selected`
- `courier_otp_completion_blocked`

Required properties:
- `surface`
- `variant`
- `trackingCodePrefix` on receiver public only
- `deliveryId` on authenticated courier/admin routes
- `proofType`
- `receiverVerificationStatus`
- `fallbackAllowed`
- `isOnline`
- `sourceErrorCode`

Forbidden properties:
- raw OTP
- full tracking code in analytics where prefix is enough
- receiver phone
- verification token
- challenge ID
- proof reference
- receiver address

Analytics rules:
- fire viewed once per state presentation
- fire action selected once per user action
- fire failed verification without raw reason detail
- fire verified only after backend success
- do not fire delivered analytics from this state

## Accessibility Requirements
Receiver public:
- OTP input has a visible label
- error summary links to OTP input
- resend timer updates politely
- verification success is announced
- invalid code error is announced
- focus moves to status title on major state transition
- focus order is title, context, input, primary action, resend, support

Courier mobile:
- state title announces verification requirement
- disabled completion has clear reason
- fallback actions are reachable after OTP guidance
- offline and cooldown messages use live region
- all touch targets at least 44 by 44 CSS pixels
- reduced motion disables entrance transform

Modal rendering:
- use alert-dialog when blocking an attempted completion
- trap focus
- keep background action inert
- return focus to attempted completion button after dismiss if still on same route

Color:
- do not rely on blue, amber, green, or red alone
- include text labels such as `Verification needed`, `Code expired`, `Verified`, and `Connection required`

## Content States
### Challenge Needed
Show:
- title
- reason
- masked phone if available
- send code action
- support action

### OTP Entry Needed
Show:
- OTP input
- expiry label
- verify action
- resend action
- support action

### Invalid OTP
Show:
- safe error copy
- code input remains editable
- resend if allowed
- no detailed failure reason

### Expired OTP
Show:
- expiry message
- send new code
- clear old OTP input

### Throttled
Show:
- cooldown timer
- disabled submit
- support route
- no new code until allowed

### Courier Token Missing
Show:
- receiver verification requirement
- open guidance
- fallback proof options
- failed attempt action
- no complete action

### Bridge Unavailable
Show:
- backend dependency explanation
- fallback proof options
- support route
- no token text

### Offline
Show:
- connection required
- retry when online
- fallback only if policy allows
- keep package custody reminder

## Interaction Details
When receiver taps `Send code`:
- call challenge endpoint
- show sent or recently sent state
- route or reveal OTP entry
- do not show OTP

When receiver taps `Verify code`:
- validate field length before submit
- call verify endpoint
- on success, clear OTP and store verification token only in approved ephemeral state
- on failure, show safe invalid or expired state

When receiver taps `Send new code`:
- clear OTP
- call challenge endpoint when cooldown allows
- restart expiry timer from backend response

When courier taps `Open OTP guidance`:
- show instructions for receiver to open tracking link
- offer route to receiver arrival instructions if available
- do not display receiver phone unless route already permits masked value

When courier taps fallback:
- route to signature or photo proof
- require fallback reason in child flow when backend contract supports it
- do not mark OTP as completed

When courier taps failed attempt:
- route to failed attempt screen
- preserve safe reason `receiver_verification_unavailable`

When backend returns `PHONE_VERIFICATION_REQUIRED`:
- show `phone_verification_required`
- disable completion
- keep receiver name input if safe
- route back to OTP guidance or proof selector

## Implementation Notes For Claude Code
Build `SharedOtpRequiredState` as a shared proof gate component.

Required implementation structure:
- shared component in state library
- receiver public wrapper for challenge and OTP entry
- courier wrapper for OTP completion blocker
- pure derivation helper for backend error mapping
- secure state container for receiver verification readiness
- analytics scrubber test
- route callback ownership in host screens

Do not implement:
- courier raw OTP entry for `/complete`
- token display
- token URL param
- phone URL param
- background OTP verification
- offline OTP verification queue
- proof completion from this shared state component

## Test Requirements
Unit tests:
- renders default OTP required title
- renders receiver challenge variant
- renders receiver OTP entry variant
- renders invalid and expired copy
- renders courier token missing variant
- hides complete action when token missing
- hides raw OTP and token props because they are not accepted
- shows fallback actions only when allowed
- shows offline connection requirement

Derivation tests:
- maps `PHONE_VERIFICATION_REQUIRED` to `phone_verification_required`
- maps missing receiver context to `receiver_context_missing`
- maps expired challenge to `receiver_otp_expired`
- maps too many attempts to throttled variant
- maps courier missing proof reference to `courier_token_missing`
- maps absent backend bridge to `courier_bridge_unavailable`
- does not map missing custody to OTP required

Integration tests:
- receiver phone challenge routes to OTP verify
- receiver OTP verify clears OTP after success
- receiver OTP verify omits token from URL and DOM
- courier OTP completion blocks complete without proof reference
- courier OTP completion handles `PHONE_VERIFICATION_REQUIRED`
- courier fallback routes to signature or photo
- offline receiver cannot verify OTP
- offline courier cannot complete OTP

Accessibility tests:
- OTP input has visible label
- invalid error links to OTP input
- cooldown is announced politely
- focus order is predictable
- action targets meet minimum size
- reduced motion works

Privacy tests:
- no raw OTP in DOM after submit
- no token in DOM
- no token in URL
- no phone in analytics
- no proof reference in analytics
- no challenge ID in analytics

## Acceptance Criteria
The state is complete when:
- receiver and courier variants are both covered
- completion is disabled until active receiver verification proof reference exists
- raw OTP is never accepted as courier completion proof
- token is not visible, routed, or logged
- phone is masked or absent
- offline OTP verification and completion are blocked
- fallback proof is visible only under policy
- failed attempt remains available when receiver cannot verify
- route contracts match existing specs
- tests cover mapping, privacy, accessibility, and recovery

## Anti-Patterns To Reject
Reject implementation if it:
- lets courier type raw OTP into completion
- stores OTP after success
- puts OTP in analytics
- puts token in URL
- shows full receiver phone
- treats SMS sent as proof verified
- lets offline OTP complete delivery
- hides fallback when receiver cannot verify
- retries verification without cooldown
- reveals whether phone matched
- uses OTP required for missing custody
- marks delivered before `/complete` succeeds

## QA Scenarios
### Receiver Needs Challenge
Given receiver opens tracking route
And phone verification is required
When no challenge exists
Then OTP required state shows `Verify receiver phone`
And primary action is `Send code`

### Receiver Enters Code
Given challenge is active
When receiver enters valid code
Then backend returns verification token
And OTP input is cleared
And token is not shown in URL, DOM, or analytics

### Courier Missing Verification
Given courier has final-mile custody
And proof type is OTP
And no active proof reference exists
When courier opens OTP completion
Then `Receiver verification required` appears
And `Complete delivery` is disabled
And fallback proof actions are visible when policy allows

### Backend Requires Verification
Given courier submits completion without active receiver proof
When backend returns `PHONE_VERIFICATION_REQUIRED`
Then shared OTP required state appears
And user can open OTP proof guidance or fallback proof

### Offline OTP Blocked
Given receiver or courier is offline
When OTP verification or OTP completion is attempted
Then state shows connection required
And no queued OTP completion is created

## Observability
Operational metrics:
- OTP required views by surface
- receiver challenge request rate
- OTP verify success rate
- OTP verify failure rate
- OTP expiry rate
- OTP throttled rate
- courier completion blocked by missing token
- fallback proof selection after OTP blocker
- failed attempt after OTP blocker

Alerting:
- spike in `PHONE_VERIFICATION_REQUIRED` after receiver verification success
- OTP bridge unavailable on courier app
- token leakage detector hit
- OTP verification provider timeout spike
- excessive fallback use after OTP requirement
- receiver verification failures above threshold

Dashboard grouping:
- corridor or station where safe
- app surface
- variant
- proof type
- provider status
- online or offline
- app version

## Launch Readiness
Before pilot:
- receiver phone challenge works
- receiver OTP verify works
- courier OTP completion blocks without active proof reference
- backend bridge decision is implemented or courier app shows bridge unavailable and fallback path
- fallback proof routes are available
- failed attempt route is available
- OTP and token scrubber tests pass
- rate-limit and expiry copy works
- accessibility tests pass

Before scale:
- OTP success and fallback metrics visible
- provider timeout monitoring exists
- receiver support playbook covers OTP failures
- courier training explains not to ask for raw OTP as completion proof
- backend proof reference bridge is audited

## Open Backend Boundaries
The current backend requires `proofType=otp` and a `proofReference` that represents an active delivery-scoped receiver verification token.

The current courier app spec must not assume it can access that token unless an approved bridge exists.

The current `/complete` route does not accept raw OTP digits. Do not implement raw code completion in courier app.

Receiver public verification can create the verification token. The handoff from receiver verification to courier completion requires an approved backend design before full OTP completion can be seamless.

## Final Build Brief For Claude Code
Build `SharedOtpRequiredState` as the authoritative shared UI state for receiver OTP verification requirements. It must guide receiver public users through phone challenge and OTP verification, guide couriers through OTP proof readiness, disable completion without an active backend-approved proof reference, offer policy-approved fallback proof or failed attempt, and protect OTP digits, receiver phone, challenge IDs, verification tokens, and proof references from URLs, DOM, analytics, logs, and crash reports.

# Proof Required State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `proof_required` |
| Component family | Shared screen state |
| Primary component | `SharedProofRequiredState` |
| Supporting components | `ProofRequirementPanel`, `ProofMethodRail`, `ProofAssetReadinessCard`, `ProofRecoveryActions`, `ProofPrivacyNotice`, `ProofOfflineBoundary`, `ProofBackendConflictPanel`, `ProofFallbackReasonPrompt`, `ProofRouteBridge` |
| Primary surfaces | final-mile courier mobile app, operations mobile shared proof routes, station completion flows, admin evidence review, support workflow |
| Required recovery | open proof selector, open OTP completion, open signature capture, open delivery photo capture, open failed attempt, retry proof upload, refresh delivery, or open support |
| Test id root | `state-proof-required` |
| Backend coverage | `FINAL_PROOF_REQUIRED`, `HANDOFF_PROOF_REQUIRED`, `complete_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, active receiver verification token, uploaded `PFA-*` proof assets |
| Browser mutation operation | None directly; this state routes to proof capture or recovery before completion |
| Data sensitivity | proof method, proof reference, proof asset status, proof asset metadata, receiver name, receiver phone, delivery ID, custody owner, completion attempt, location permission state |
| Offline critical | Yes for guidance and recovery, but final completion and proof upload authority require backend confirmation |
| Related inventory state | `proof_required` |
| Related state specs | OTP required, custody not confirmed, offline, stale data, blocked by issue, rate limited, error, not authorized |
| Design tokens | `proof.green.700`, `proof.blue.700`, `proof.amber.700`, `proof.red.700`, `proof.ink.950`, `proof.surface`, spacing `4-44`, radius `10-20`, motion `proof-slide-160` |
| Accessibility target | WCAG 2.2 AA equivalent with clear error text, status announcements, large touch targets, logical focus, and no proof data leak through labels |

## Purpose
`SharedProofRequiredState` is the shared UI state shown when a delivery, handoff, or completion action cannot proceed because the required proof has not yet been supplied, uploaded, confirmed, or accepted by backend authority.

This state is broader than `otp_required`.

`otp_required` is used when the selected proof path is OTP and the active receiver verification token is missing or unusable.

`proof_required` is used when the user has not selected an accepted proof method, when a selected fallback proof asset is incomplete, or when the backend rejects completion because no accepted proof method is present.

The most important rule is:

```text
Completion is not complete until backend accepts exactly one valid proof method for the delivery.
```

Valid completion proof methods are:

- `otp`
- `signature`
- `delivery_photo`

Valid fallback proof asset methods are:

- `signature`
- `delivery_photo`

## Product Job
Kra uses proof to close the final custody gap. The final-mile courier, station operator, support staff, and admin must be able to see why a completion path is blocked and what the next safe step is without exposing restricted proof data.

The proof required state must:

- prevent delivery completion without accepted proof
- route couriers to the correct proof capture flow
- keep OTP as the default receiver-led proof path
- treat signature and delivery photo as controlled fallback paths
- require uploaded backend `PFA-*` proof assets before fallback completion
- surface failed attempt as the safe option when proof cannot be collected
- protect proof asset URLs, storage paths, raw image data, raw signature data, receiver phone, and verification token
- make backend authority visible without creating operational friction
- avoid duplicate proof asset creation
- explain recovery when upload, confirmation, proof type, or delivery ownership does not match
- keep accessibility and one-handed field use strong

## Strategic Role
Proof required is a liability guard. It stops the system from pretending a package was delivered when the receiver-facing evidence is missing.

The state is also an operator guide. A courier at a receiver door needs a clear decision path:

- try OTP first
- use one approved fallback when OTP cannot work
- record failure when completion is unsafe or impossible
- do not hand over goods without a valid path
- do not mark delivered offline
- do not create duplicate proof records
- do not expose sensitive evidence

The UI must feel strict and humane at the same time. It should not shame the operator. It should make the next lawful action obvious.

## Design Brief
Audience:

- Final-mile couriers and station operators who must close a delivery or handoff with accepted proof.

Surface type:

- Shared operational blocking state used inside mobile and admin workflow hosts.

Primary action:

- Continue to the correct proof capture flow.

Visual thesis:

- `Evidence checkpoint`: a high-trust operational panel with a single proof requirement, clear proof lanes, and guarded recovery actions.

Restraint rule:

- Do not collect proof inside this state. Do not preview proof assets. Do not turn the state into a completion form.

Density:

- Field-dense but calm. The top panel must explain the blocker in one scan, while details can live below.

Platform stance:

- Native mobile first for courier and station flows, responsive web-ready for admin and support embedding.

## External Research Used
Only directly relevant proof, courier delivery, mobile capture, offline, and accessibility references were used:

- [Uber Direct proof of delivery](https://developer.uber.com/docs/deliveries/guides/proof-of-delivery): supports proof verification methods such as signature, picture, barcode, identification, and pincode, plus delivery response evidence references.
- [DoorDash delivery drop-off photos](https://help.doordash.com/en-us/dashers/article/confirming-delivery-drop-off-photos): supports photo proof quality guidance for delivery location context, blur avoidance, and lighting.
- [DoorDash customer unavailable delivery flow](https://help.doordash.com/en-au/dashers/article/how-to-complete-a-delivery-when-the-customer-is-unavailable): supports arrival, receiver contact, unavailable action, timer, safe placement, and documented location when handoff cannot be direct.
- [Android CameraX image capture](https://developer.android.com/media/camera/camerax/take-photo): supports explicit image capture flow, file or memory capture, callback handling, and camera configuration for photo proof child screens.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local reads without network, queued or online-only write decisions, and clear offline write boundaries.
- [W3C Pointer Events](https://www.w3.org/TR/pointerevents/): supports hardware-agnostic pointer handling for signature capture and predictable cancellation behavior.
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing proof upload, waiting, error, and recovery status without unexpected focus movement.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports touch targets that are easier to activate in mobile field conditions.
- [WCAG 2.2 focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports logical navigation through blocker reason, proof methods, and recovery actions.
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports text descriptions for missing proof, invalid proof type, expired upload, and rejected completion.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/06-architecture/backend-architecture.md`
- `docs/06-architecture/security-architecture.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/12-engineering/acceptance-criteria.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/design-system.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/13-courier-failed-attempt.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/09-upload-proof-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/public-tracking-verification.ts`

## Backend Contract
Primary completion route:

- `POST /v1/deliveries/:id/complete`

Proof asset routes:

- `POST /v1/deliveries/:id/proof-assets`
- `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`

Primary read route:

- `GET /v1/deliveries/:id`

Related public receiver verification routes:

- `GET /v1/public/track/:trackingCode`
- `POST /v1/public/track/:trackingCode/request-phone-challenge`
- `POST /v1/public/track/:trackingCode/verify-phone`

Completion request:

```json
{
  "proofType": "delivery_photo",
  "proofReference": "PFA-0001",
  "receivedByName": "Kojo Asante"
}
```

Completion response:

```json
{
  "eventId": "EVT-0001",
  "deliveryId": "DEL-0001",
  "status": "delivered",
  "paymentStatus": "paid",
  "occurredAt": "2026-05-21T10:15:00.000Z"
}
```

Proof asset create request:

```json
{
  "proofType": "signature",
  "contentType": "image/png",
  "byteSize": 284000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

Proof asset create response:

```json
{
  "proofAssetId": "PFA-0001",
  "deliveryId": "DEL-0001",
  "proofReference": "PFA-0001",
  "proofType": "signature",
  "status": "pending_upload",
  "upload": {
    "method": "PUT",
    "url": "https://storage.example.test/signed-upload-url",
    "bucket": "kra-proof-assets",
    "objectPath": "proof-assets/DEL-0001/PFA-0001.png",
    "contentType": "image/png",
    "expiresAt": "2026-05-21T10:30:00.000Z"
  }
}
```

Proof asset confirm response:

```json
{
  "proofAssetId": "PFA-0001",
  "deliveryId": "DEL-0001",
  "proofReference": "PFA-0001",
  "proofType": "signature",
  "status": "uploaded",
  "contentType": "image/png",
  "byteSize": 284000,
  "storageBucket": "kra-proof-assets",
  "storageObjectPath": "proof-assets/DEL-0001/PFA-0001.png",
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "storageGeneration": "generation-1",
  "createdAt": "2026-05-21T10:14:00.000Z",
  "uploadExpiresAt": "2026-05-21T10:30:00.000Z",
  "uploadedAt": "2026-05-21T10:15:00.000Z"
}
```

Contract rules:

- `proofType=otp` requires an active delivery-scoped receiver verification token as `proofReference`.
- `proofType=signature` requires a backend-issued `PFA-*` proof asset reference.
- `proofType=delivery_photo` requires a backend-issued `PFA-*` proof asset reference.
- Signature and delivery-photo proof assets must be uploaded before completion.
- Fallback proof asset type must match the completion `proofType`.
- Proof asset delivery ID must match the route delivery ID.
- Completion must use `receivedByName`.
- Completion changes status to `delivered` only after backend transition succeeds.
- Fallback proof asset status becomes `attached` after successful completion.

## Current Backend Gaps To Preserve
Product policy requires non-OTP completion to store:

- `proof_fallback_reason`
- receiver name
- completion timestamp
- GPS when available
- `gps_unavailable=true` when GPS cannot be captured

Current local `completeDeliveryRequestSchema` accepts only:

- `proofType`
- `proofReference`
- `receivedByName`

Implementation must not hide this gap. The frontend should:

- collect the fallback reason in child fallback flows where the spec requires it
- preserve it in local completion context
- send it only after backend contract adds supported fields
- show a tracked engineering dependency until API support exists
- never claim that fallback reason or GPS was stored if the backend did not accept those fields

## State Definition
`proof_required` is active when a completion or handoff action requires accepted proof and none is currently usable.

Canonical triggers:

- backend returns `FINAL_PROOF_REQUIRED`
- backend returns `HANDOFF_PROOF_REQUIRED`
- completion is attempted without `proofType`
- completion is attempted without `proofReference`
- proof method has not been selected
- selected proof method is not one of `otp`, `signature`, or `delivery_photo`
- selected fallback proof method is missing uploaded `PFA-*`
- proof asset status is `pending_upload`
- proof asset status is `rejected`
- proof asset upload intent expired before confirmation
- proof asset type does not match selected completion type
- proof asset delivery ID does not match route delivery ID
- signature capture exists locally but has not been uploaded
- delivery photo exists locally but has not been uploaded
- upload succeeded but confirmation is unknown
- confirmation succeeded but completion failed before proof attachment
- host screen needs proof method selection after a backend completion rejection
- staff handoff requires proof before custody can move

Non-canonical triggers:

- active receiver OTP token is missing on a known OTP route
- current actor does not hold custody
- package scan does not match delivery binding
- package label is already bound to another delivery
- payment is not confirmed
- active issue blocks the delivery
- user lacks permission
- session has expired
- entire surface is rate limited
- delivery was already completed
- receiver cannot be reached after contact attempts
- camera permission is denied before photo route starts
- signature canvas input fails before upload intent starts

State routing:

- Use `otp_required` when the selected path is specifically OTP and only OTP verification is missing.
- Use `custody_not_confirmed` when custody is missing.
- Use `blocked_by_payment` when payment is the blocker.
- Use `blocked_by_issue` when an active issue prevents movement.
- Use `scan_mismatch` when package identity is wrong.
- Use `duplicate_package_label` when label ownership conflicts.
- Use `rate_limited` when retry cooldown governs the whole state.
- Use `error` for unknown request failures that are not proof-specific.
- Use `proof_required` for missing proof method, incomplete fallback proof, and proof asset readiness blockers.

## Supported Variants
| Variant | Trigger | Primary action | Secondary action |
| --- | --- | --- | --- |
| `proof_method_not_selected` | Host has no selected proof method | `Choose proof method` | `Open failed attempt` |
| `final_proof_required` | `FINAL_PROOF_REQUIRED` from completion | `Open proof capture` | `Refresh delivery` |
| `handoff_proof_required` | `HANDOFF_PROOF_REQUIRED` from handoff | `Add handoff proof` | `Open support` |
| `otp_or_fallback_required` | Courier can use OTP or approved fallback | `Start OTP proof` | `Choose fallback` |
| `signature_capture_required` | Signature route lacks captured signer proof | `Capture signature` | `Use OTP instead` |
| `signature_upload_required` | Signature exists locally but no uploaded asset | `Upload signature proof` | `Retake signature` |
| `photo_capture_required` | Photo route lacks captured delivery image | `Take delivery photo` | `Use OTP instead` |
| `photo_upload_required` | Photo exists locally but no uploaded asset | `Upload photo proof` | `Retake photo` |
| `proof_asset_expired` | Upload intent expired before confirmation | `Start new proof upload` | `Discard local asset` |
| `proof_asset_pending` | Upload intent exists but upload not confirmed | `Continue upload` | `Open recovery` |
| `proof_asset_mismatch` | Proof asset type or delivery ID mismatch | `Start correct proof` | `Open support` |
| `proof_confirmation_unknown` | Upload result unknown after network loss | `Verify upload status` | `Open action recovery` |
| `fallback_reason_required` | Fallback path lacks required reason | `Add reason` | `Use OTP instead` |
| `offline_upload_pending` | Device offline before upload or completion | `View offline guidance` | `Open outbox` |
| `support_escalation_required` | User cannot resolve proof safely | `Contact support` | `Record failed attempt` |

## Required Props
```ts
type ProofRequiredVariant =
  | "proof_method_not_selected"
  | "final_proof_required"
  | "handoff_proof_required"
  | "otp_or_fallback_required"
  | "signature_capture_required"
  | "signature_upload_required"
  | "photo_capture_required"
  | "photo_upload_required"
  | "proof_asset_expired"
  | "proof_asset_pending"
  | "proof_asset_mismatch"
  | "proof_confirmation_unknown"
  | "fallback_reason_required"
  | "offline_upload_pending"
  | "support_escalation_required";

type ProofMethod = "otp" | "signature" | "delivery_photo";

type ProofAssetStatus =
  | "none"
  | "pending_upload"
  | "uploaded"
  | "attached"
  | "rejected"
  | "expired"
  | "unknown";

type SharedProofRequiredStateProps = {
  variant: ProofRequiredVariant;
  deliveryId: string;
  deliveryStatus?: string;
  actorRole?: "station_operator" | "driver" | "final_mile_courier" | "support_admin" | "ops_admin";
  custodyRole?: "station_operator" | "driver" | "final_mile_courier" | null;
  custodyActorLabel?: string;
  selectedProofMethod?: ProofMethod;
  allowedProofMethods: ProofMethod[];
  recommendedProofMethod?: ProofMethod;
  proofAssetStatus?: ProofAssetStatus;
  proofAssetType?: "signature" | "delivery_photo";
  proofAssetAgeSeconds?: number;
  uploadExpiresAt?: string;
  receivedByName?: string;
  fallbackReasonStatus?: "not_required" | "missing" | "captured" | "contract_pending";
  gpsStatus?: "available" | "denied" | "unavailable" | "not_checked" | "contract_pending";
  isOffline?: boolean;
  isStale?: boolean;
  retryAfterSeconds?: number;
  errorCode?: "FINAL_PROOF_REQUIRED" | "HANDOFF_PROOF_REQUIRED" | "VALIDATION_ERROR" | "FORBIDDEN" | "NOT_FOUND";
  onOpenProofSelector: () => void;
  onOpenOtpProof?: () => void;
  onOpenSignatureProof?: () => void;
  onOpenPhotoProof?: () => void;
  onOpenFailedAttempt?: () => void;
  onRetryUpload?: () => void;
  onRefreshDelivery?: () => void;
  onOpenSupport?: () => void;
  onOpenActionRecovery?: () => void;
};
```

Prop rules:

- `allowedProofMethods` must never be empty.
- `recommendedProofMethod` should default to `otp` when allowed.
- `selectedProofMethod` must match the active child route when the state is embedded in a proof child screen.
- `proofAssetStatus` is required for signature and delivery-photo upload variants.
- `proofAssetType` must match the fallback child route.
- `uploadExpiresAt` is required for pending proof assets when known.
- `fallbackReasonStatus=contract_pending` means the UI captured policy data that backend cannot yet store.
- `gpsStatus=contract_pending` means the UI captured or attempted location metadata that backend cannot yet store.
- `errorCode` must be safe and mapped from API error codes.
- Do not pass raw signed upload URL to this component.
- Do not pass storage bucket name to this component.
- Do not pass storage object path to this component.
- Do not pass raw OTP digits to this component.
- Do not pass raw receiver verification token to this component.
- Do not pass raw image bytes to this component.
- Do not pass raw signature strokes to this component.

## Canonical Routes
Courier proof routes:

- `/(ops)/courier/assignments/:deliveryId/proof`
- `/(ops)/courier/assignments/:deliveryId/proof/otp`
- `/(ops)/courier/assignments/:deliveryId/proof/signature`
- `/(ops)/courier/assignments/:deliveryId/proof/photo`
- `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- `/(ops)/courier/assignments/:deliveryId/completed`

Operations shared routes:

- `/(ops)/offline-outbox`
- `/(ops)/action-recovery`
- `/(ops)/deliveries/:deliveryId/issues/new`
- `/(ops)/deliveries/:deliveryId/custody`

Station routes:

- `/(ops)/station/inbound/:deliveryId/receive`
- `/(ops)/station/pickup/:deliveryId/complete`
- `/(ops)/station/support?deliveryId=:deliveryId`

Admin and support routes:

- `/admin/deliveries/:deliveryId`
- `/admin/deliveries/:deliveryId/custody`
- `/admin/deliveries/:deliveryId/package`
- `/admin/issues/:issueId`
- `/admin/support/deliveries/:deliveryId`

Route rules:

- Proof selector opens first when no method is selected.
- OTP route owns OTP proof completion.
- Signature route owns signature capture, upload, confirmation, and completion.
- Photo route owns photo capture, upload, confirmation, and completion.
- Failed attempt route is the safe exit when receiver proof cannot be completed.
- Action recovery route is used for unknown upload or completion results.
- Offline outbox route is used for queued metadata and retry visibility, not final delivered status.

## Information Architecture
The component has five zones:

- Status header
- Required proof explanation
- Proof method rail
- Recovery actions
- Sensitive data notice

Status header content:

- delivery short reference
- current blocker title
- safe operational status
- cached or live data indicator
- cooldown or upload expiry when applicable

Required proof explanation content:

- proof method still needed
- why completion is blocked
- what backend must accept
- what cannot happen yet
- what the user should do next

Proof method rail content:

- OTP lane
- signature lane
- delivery photo lane
- unavailable method labels
- selected method state
- recommended method state

Recovery actions content:

- open proof selector
- start OTP
- open signature
- open photo
- retry upload
- refresh delivery
- open action recovery
- open failed attempt
- open support

Sensitive data notice content:

- proof assets are restricted
- no raw asset preview in this state
- no receiver phone or token display
- final delivery only after backend acceptance

## Visual Design Standard
The proof required state must feel precise and trustworthy, not alarming by default.

Use:

- off-white or warm neutral surface for the shell
- deep ink headings
- green only for accepted proof or uploaded proof
- blue for the primary OTP lane
- amber for pending proof, missing fallback reason, or offline upload boundary
- red for rejected proof asset, mismatch, or unsafe completion block
- a narrow left status spine on desktop and a top status band on mobile
- method cards with one job each
- compact event timestamps
- clear recovery buttons
- stable layout under loading and retry

Do not use:

- celebratory success treatment before completion
- image thumbnails of proof assets
- raw technical stack traces
- wide red error panels for routine missing proof
- more than one visually dominant action
- decorative icons that compete with proof status
- dense legal language in the first viewport
- low-contrast amber text

## Layout
Mobile layout:

- Top safe-area proof status strip.
- Single-column content.
- Primary proof action above fallback methods.
- Fallback methods below a short policy note.
- Sticky bottom action area with one primary action and one secondary action.
- Recovery links below the sticky area or in a compact sheet.

Tablet layout:

- Two-column layout after status header.
- Left column contains proof explanation and method rail.
- Right column contains recovery, privacy, and backend status.

Desktop embedded layout:

- Card can render as a constrained panel inside admin or support workflow.
- Left status spine carries variant color.
- Method rail may render as horizontal steps.
- Actions stay right aligned only when reading order remains logical.

Minimum sizing:

- Mobile width: `320px`
- Preferred mobile action height: `52px`
- Minimum touch target: `44px`
- Spacing scale: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `44`
- Radius: `12px` on operational cards, `18px` on high-emphasis panels

## Component Anatomy
```text
SharedProofRequiredState
  ProofStatusHeader
    ProofStateBadge
    DeliveryReference
    DataFreshnessChip
  ProofRequirementPanel
    Title
    OperationalExplanation
    BackendAuthorityLine
  ProofMethodRail
    ProofMethodOption(OTP)
    ProofMethodOption(Signature)
    ProofMethodOption(DeliveryPhoto)
  ProofAssetReadinessCard
    AssetStatus
    ExpiryCountdown
    UploadRecovery
  ProofFallbackReasonPrompt
    ReasonStatus
    BackendGapNotice
  ProofRecoveryActions
    PrimaryAction
    SecondaryAction
    TertiaryLinks
  ProofPrivacyNotice
  ProofLiveRegion
```

Anatomy rules:

- `ProofAssetReadinessCard` appears only for signature or delivery-photo variants.
- `ProofFallbackReasonPrompt` appears only when fallback proof is selected or required.
- `ProofPrivacyNotice` is always visible in admin and support contexts.
- `ProofLiveRegion` is visually hidden but available to assistive technology.
- `ProofRouteBridge` controls navigation and must be tested separately from presentation.

## Copy System
Primary titles:

- `Proof is required`
- `Choose a proof method`
- `Complete OTP proof first`
- `Upload signature proof`
- `Upload delivery photo proof`
- `Proof upload expired`
- `Proof does not match this delivery`
- `Proof status is unknown`
- `Add fallback reason`
- `Connection required to finish delivery`

Primary explanations:

- `This delivery cannot be completed until Kra accepts one proof method.`
- `OTP is the default proof method. Use signature or delivery photo only when OTP cannot be completed.`
- `This proof asset must be uploaded and confirmed before completion.`
- `The uploaded proof does not match this delivery or proof type. Start the correct proof flow.`
- `You can keep the receiver instructions visible offline, but delivered status requires backend confirmation.`
- `Record a failed attempt if the receiver cannot provide proof safely.`

Button labels:

- `Choose proof method`
- `Start OTP proof`
- `Capture signature`
- `Take delivery photo`
- `Continue upload`
- `Retry upload`
- `Refresh delivery`
- `Open recovery`
- `Record failed attempt`
- `Contact support`

Do not use:

- `Delivered`
- `Force complete`
- `Skip proof`
- `Continue anyway`
- `Trust courier`
- `Proof optional`
- `Override proof`
- `Use any photo`
- `Use old signature`
- `Ignore mismatch`

## Method Rail Rules
OTP method:

- Default lane when allowed.
- Use blue active treatment.
- Explain that receiver verification must be backend-approved.
- Route to OTP completion or receiver verification guidance.
- Never show raw OTP digits.
- Never show raw verification token.

Signature method:

- Secondary fallback lane.
- Requires receiver name and signature capture in child flow.
- Requires backend proof asset upload.
- Requires `proofType=signature`.
- Requires `proofReference=PFA-*`.
- Must not reuse a photo proof asset.

Delivery photo method:

- Secondary fallback lane.
- Requires current delivery scene photo in child flow.
- Requires backend proof asset upload.
- Requires `proofType=delivery_photo`.
- Requires `proofReference=PFA-*`.
- Must not reuse a signature proof asset.

Unavailable method state:

- Show unavailable reason in short text.
- Keep disabled method focusable only when it opens an explanation.
- If disabled, provide an adjacent enabled recovery action.

Recommended method:

- One method can be marked recommended.
- OTP is recommended unless backend or policy says otherwise.
- Fallback lanes must be visually quieter than OTP.

## Proof Asset Readiness
Status meanings:

| Status | Meaning | UI treatment |
| --- | --- | --- |
| `none` | No proof asset exists | show capture action |
| `pending_upload` | Upload intent exists but backend has not confirmed | show upload or continue action |
| `uploaded` | Backend confirmed upload | allow completion action in child route |
| `attached` | Backend attached proof to delivered event | show read-only success in admin context |
| `rejected` | Backend rejected asset | show restart proof action |
| `expired` | Upload URL expired | show start new proof upload |
| `unknown` | Network loss or response uncertainty | show verify upload status |

Readiness rules:

- A pending upload is not accepted proof.
- A local photo is not accepted proof.
- A local signature is not accepted proof.
- A signed upload URL is not accepted proof.
- An uploaded `PFA-*` with wrong type is not accepted proof.
- An uploaded `PFA-*` with wrong delivery ID is not accepted proof.
- An uploaded `PFA-*` can be used once for the matching completion path.
- A proof asset that was attached to a completed delivery becomes evidence, not a reusable proof reference.

## Completion Authority Rules
The UI must never mark delivery as complete from local state.

Completion can show success only after:

- authenticated actor is allowed to complete
- delivery is still eligible for completion
- custody checks pass
- proof method is valid
- proof reference is accepted
- fallback proof asset is uploaded when needed
- backend transition returns `status=delivered`
- timeline and custody state refresh successfully or are clearly marked refreshing

If completion fails after proof upload:

- keep the proof recovery state available
- do not create another proof asset automatically
- refresh the delivery
- show action recovery if result is unknown
- route to support if backend rejects the same valid payload twice

## Offline Behavior
Offline reads:

- Show cached delivery reference.
- Show cached receiver-safe instructions.
- Show cached selected proof method.
- Show cached proof asset workflow status when available.
- Mark all cached content with timestamp.

Offline writes:

- Do not mark delivery `delivered` offline.
- Do not pretend proof upload is complete offline.
- Do not submit `/complete` offline.
- Queue only safe non-authoritative local recovery metadata where the app infrastructure supports it.
- Keep proof capture child flow clear about what is local and what still requires upload.

Pending upload offline:

- If local proof exists and upload has not started, show `Connection required to upload proof`.
- If upload started and network dropped, show `Proof upload status is unknown`.
- If upload confirmed but completion failed because network dropped, show `Open recovery`.
- If upload intent expired while offline, require a new proof upload when back online.

Offline copy:

- `You can keep this delivery open offline, but Kra can only complete it after proof is uploaded and accepted.`
- `Do not hand over the package unless your route policy allows it and proof recovery is available.`
- `If proof cannot be completed safely, record a failed attempt when connection returns.`

## Sensitive Data Rules
Never display:

- signed upload URL
- storage bucket
- storage object path
- raw proof image
- raw signature image
- raw signature strokes
- receiver verification token
- raw OTP digits
- full receiver phone number
- full package scan code
- exact GPS coordinates
- internal staff IDs
- private support notes

Allowed display:

- delivery short reference
- masked receiver name when host already has permission
- proof method label
- proof asset safe status
- upload expiry time
- proof asset age
- role-safe custody label
- backend-safe error code

Admin and support exceptions:

- Admin evidence review can show proof asset metadata only through approved evidence endpoints.
- Support can see restricted proof data only when an active case grants access.
- This shared state must not include raw evidence rendering. Evidence viewing belongs to a separate authorized viewer.

## Analytics
Events:

- `proof_required_viewed`
- `proof_required_action_selected`
- `proof_required_method_selected`
- `proof_required_refresh_requested`
- `proof_required_upload_retry_selected`
- `proof_required_recovery_opened`
- `proof_required_failed_attempt_selected`
- `proof_required_support_selected`
- `proof_required_variant_changed`

Common event fields:

- `deliveryId`
- `surface`
- `actorRole`
- `variant`
- `selectedProofMethod`
- `allowedProofMethodCount`
- `proofAssetStatus`
- `isOffline`
- `isStale`
- `errorCode`
- `sourceRoute`
- `targetRoute`

Never send:

- raw proof asset data
- signed upload URL
- storage bucket
- storage object path
- full receiver phone
- raw OTP
- receiver verification token
- full address
- exact GPS
- support note body
- signature image
- delivery photo

Analytics rules:

- Fire view event once per state entry.
- Fire variant change only when variant actually changes.
- Fire action event before navigation.
- Include route key, not raw URL with sensitive query strings.
- If `proofAssetStatus=unknown`, include only safe status and route.

## Accessibility
Semantic structure:

- Component root uses `section`.
- Header uses `h2` or host-provided heading level.
- Current blocker is exposed as text, not color only.
- Status changes are announced through a polite live region.
- Critical proof rejection uses assertive announcement only when action is blocked.
- Method rail is a radio group when selecting method.
- Method cards are buttons or radio options, not nested interactive cards.
- Disabled methods explain why they are disabled.

Focus order:

- blocker title
- short explanation
- primary method
- fallback methods
- proof asset readiness
- recovery actions
- privacy notice

Keyboard behavior:

- `Tab` moves through actionable controls in logical order.
- `Enter` and `Space` activate buttons.
- Arrow keys may move across radio method options when a radio group is used.
- Focus returns to the triggering action after a child sheet is dismissed.
- Retry action keeps focus on the action until status update arrives.

Touch behavior:

- Minimum target should be `44px`.
- Destructive recovery requires clear label.
- Do not execute completion on pointer down.
- Signature capture child flow must support pointer cancellation.
- Photo capture child flow must not trap focus after permission prompts.

Screen reader copy:

- `Proof is required for delivery DEL ending 014.`
- `OTP is recommended. Signature and delivery photo are fallback methods.`
- `Signature proof is captured locally but has not been uploaded.`
- `Upload expired. Start a new proof upload.`
- `Completion is blocked until backend accepts proof.`

## Loading, Refresh, And Stale Data
Initial loading:

- Use shared `loading` state before proof data is known.
- Do not render proof method actions without delivery context.
- Skeleton must preserve final layout height enough to avoid jump.

Refreshing:

- Keep existing proof state visible.
- Disable duplicate refresh actions.
- Announce refresh in live region.
- Preserve selected method unless backend data invalidates it.

Stale data:

- Show cached timestamp.
- Show `Refresh delivery`.
- Disable completion action if staleness affects proof status.
- Allow proof selector navigation only when route policy permits.

Unknown mutation result:

- Show proof confirmation unknown variant.
- Offer action recovery.
- Do not retry non-idempotent completion silently.
- Use idempotency key from host mutation infrastructure.

## Error Mapping
| Backend condition | Shared state | Variant | Recovery |
| --- | --- | --- | --- |
| `FINAL_PROOF_REQUIRED` | `proof_required` | `final_proof_required` | Open proof capture |
| `HANDOFF_PROOF_REQUIRED` | `proof_required` | `handoff_proof_required` | Add handoff proof |
| missing `proofType` | `proof_required` | `proof_method_not_selected` | Choose proof method |
| missing `proofReference` for fallback | `proof_required` | `signature_upload_required` or `photo_upload_required` | Upload proof asset |
| proof asset pending | `proof_required` | `proof_asset_pending` | Continue upload |
| upload intent expired | `proof_required` | `proof_asset_expired` | Start new upload |
| proof asset wrong type | `proof_required` | `proof_asset_mismatch` | Start correct proof |
| proof asset wrong delivery | `proof_required` | `proof_asset_mismatch` | Open support |
| receiver token missing on OTP route | `otp_required` | not this state | Open OTP verification |
| active issue lock | `blocked_by_issue` | not this state | Open issue detail |
| custody missing | `custody_not_confirmed` | not this state | Open custody chain |
| payment not confirmed | `blocked_by_payment` | not this state | Open payment path |
| too many proof attempts | `rate_limited` | not this state | Wait and retry safely |
| network unavailable | `offline` or `proof_required` child variant | `offline_upload_pending` when proof-specific | Show offline guidance |

## State Machine
```text
proof_required
  -> proof_method_not_selected
  -> otp_or_fallback_required
  -> otp_required
  -> signature_capture_required
  -> signature_upload_required
  -> photo_capture_required
  -> photo_upload_required
  -> proof_asset_pending
  -> proof_asset_expired
  -> proof_asset_mismatch
  -> proof_confirmation_unknown
  -> offline_upload_pending
  -> failed_attempt
  -> delivered
```

Allowed transitions:

- `proof_method_not_selected` -> `otp_or_fallback_required`
- `otp_or_fallback_required` -> `otp_required`
- `otp_or_fallback_required` -> `signature_capture_required`
- `otp_or_fallback_required` -> `photo_capture_required`
- `signature_capture_required` -> `signature_upload_required`
- `signature_upload_required` -> `proof_asset_pending`
- `signature_upload_required` -> `delivered`
- `photo_capture_required` -> `photo_upload_required`
- `photo_upload_required` -> `proof_asset_pending`
- `photo_upload_required` -> `delivered`
- `proof_asset_pending` -> `proof_confirmation_unknown`
- `proof_asset_pending` -> `delivered`
- `proof_asset_expired` -> `signature_capture_required`
- `proof_asset_expired` -> `photo_capture_required`
- `proof_asset_mismatch` -> `signature_capture_required`
- `proof_asset_mismatch` -> `photo_capture_required`
- `offline_upload_pending` -> `proof_asset_pending`
- any proof state -> `failed_attempt`
- any proof state -> `support_escalation_required`

Forbidden transitions:

- `proof_required` -> `delivered` without backend completion response
- `proof_asset_pending` -> `delivered` without upload confirmation
- `signature_capture_required` -> `delivered` without `PFA-*`
- `photo_capture_required` -> `delivered` without `PFA-*`
- `otp_required` -> `delivered` without active receiver verification token
- `proof_asset_mismatch` -> `delivered`
- `offline_upload_pending` -> `delivered`

## Host Integration
Courier proof selector host:

- Passes `variant=proof_method_not_selected` or `otp_or_fallback_required`.
- Sets `recommendedProofMethod=otp`.
- Routes primary action to OTP proof.
- Shows fallback options only after policy note.

Courier OTP host:

- Uses `otp_required` for missing token.
- Uses `proof_required` only when the route is missing proof method context or backend asks for generic proof.

Courier signature host:

- Uses `signature_capture_required` before signature exists.
- Uses `signature_upload_required` after local signature exists.
- Uses `proof_asset_pending` during upload uncertainty.
- Uses `proof_asset_expired` after expired upload intent.
- Uses `proof_asset_mismatch` when backend rejects asset type or delivery.

Courier photo host:

- Uses `photo_capture_required` before image exists.
- Uses `photo_upload_required` after local image exists.
- Uses `proof_asset_pending` during upload uncertainty.
- Uses `proof_asset_expired` after expired upload intent.
- Uses `proof_asset_mismatch` when backend rejects asset type or delivery.

Station host:

- Uses `handoff_proof_required` when pickup completion or station-mediated handoff lacks accepted proof.
- Routes to authorized station proof modal when supported.
- Does not expose courier-only proof flows.

Admin host:

- Uses this state as read-only blocker summary.
- Shows support and evidence-review links when authorized.
- Does not allow proof upload unless admin workflow explicitly supports evidence upload.

Support host:

- Uses this state to guide user support scripts.
- Shows safe explanation and recovery paths.
- Does not reveal raw proof assets from this state.

## Security And Abuse Resistance
Threats:

- courier tries to complete without receiver participation
- old photo is reused for another delivery
- signature asset is used as delivery photo
- proof asset from one delivery is attached to another
- upload URL is exposed in UI logs
- receiver token leaks into analytics
- offline local state is treated as proof
- support role sees raw proof without case authority
- user repeatedly creates proof upload intents to confuse audit trail

Controls:

- backend owns proof acceptance
- frontend only routes and explains
- one visible proof path at a time
- asset type and delivery ID checked before completion
- no raw upload URL in component props
- no proof asset preview in shared state
- no token in route params
- no completion success before backend response
- action recovery for uncertain mutation result
- explicit failed attempt route when proof cannot be collected

## Content Rules By Variant
`proof_method_not_selected`:

- Title: `Choose a proof method`
- Body: `This delivery needs one accepted proof method before it can be completed.`
- Primary: `Start OTP proof`
- Secondary: `Choose fallback`
- Show method rail.

`final_proof_required`:

- Title: `Proof is required`
- Body: `Kra could not complete this delivery because no accepted proof method was supplied.`
- Primary: `Open proof capture`
- Secondary: `Refresh delivery`
- Show backend code when safe.

`handoff_proof_required`:

- Title: `Handoff proof is required`
- Body: `This handoff cannot move custody until proof is added.`
- Primary: `Add handoff proof`
- Secondary: `Open support`
- Show current custody label when safe.

`signature_upload_required`:

- Title: `Upload signature proof`
- Body: `The signature must be uploaded and confirmed before completion.`
- Primary: `Continue upload`
- Secondary: `Retake signature`
- Show expiry if known.

`photo_upload_required`:

- Title: `Upload delivery photo`
- Body: `The delivery photo must be uploaded and confirmed before completion.`
- Primary: `Continue upload`
- Secondary: `Retake photo`
- Show photo quality reminder only in child photo route, not this shared state.

`proof_asset_expired`:

- Title: `Proof upload expired`
- Body: `The upload window closed before Kra confirmed the proof asset. Start a new upload.`
- Primary: `Start new proof upload`
- Secondary: `Open recovery`
- Do not reuse expired URL.

`proof_asset_mismatch`:

- Title: `Proof does not match this delivery`
- Body: `The proof asset is for a different delivery or proof type. Start the correct proof flow.`
- Primary: `Start correct proof`
- Secondary: `Contact support`
- Do not let user continue with mismatched proof.

`offline_upload_pending`:

- Title: `Connection required to finish proof`
- Body: `Proof can stay visible from cache, but upload and delivered status need backend confirmation.`
- Primary: `View offline guidance`
- Secondary: `Open outbox`
- Do not show completion action.

## Motion
Use motion only to clarify state changes:

- Proof state panel enters with `opacity 0 -> 1` and `translateY 8 -> 0` over `160ms`.
- Variant change crossfades the explanation text over `120ms`.
- Method rail selected state moves with a restrained underline or left border.
- Upload pending progress uses determinate progress when byte count is known.
- Countdown updates should not animate every second with layout movement.
- Respect `prefers-reduced-motion`.

Do not:

- loop pulsing alerts
- animate proof asset status with flashing color
- move action buttons after initial load
- trigger haptic feedback for routine missing proof
- use success motion before backend completion

## Responsive Behavior
At `320px`:

- one column
- primary button full width
- secondary button full width below primary
- method rail stacked
- privacy notice collapsed to one paragraph with expansion

At `390px`:

- method cards can show icon, label, and short status
- recovery actions stay sticky at bottom

At `768px`:

- two-column layout allowed
- method rail can be horizontal
- recovery panel can sit beside explanation

At `1024px` and above:

- embedded state max width should be `960px`
- admin host can show compact metadata table
- do not exceed comfortable line length for body copy

## Empty And Edge Cases
Missing delivery ID:

- Use shared `error` state, not `proof_required`.

Delivery already delivered:

- Route to completed state.
- Do not show proof required.

Delivery reassigned:

- Use `not_authorized` or `custody_not_confirmed` depending on backend response.

Proof method list empty:

- Treat as configuration error.
- Show safe error and support action.

All proof methods unavailable:

- Show support escalation and failed attempt if allowed.

Upload URL missing from create response:

- Show error.
- Do not retry automatically more than once.

Upload expiry missing:

- Show pending without countdown.
- Require refresh before completion if the child flow needs expiry certainty.

Backend returns `uploaded` but local asset missing:

- Allow completion only when host can safely bind `proofReference`.
- Otherwise show recovery.

Backend returns `attached` but delivery not delivered:

- Show backend conflict and refresh.
- Route to support if conflict persists.

## QA Matrix
Functional tests:

- renders `proof_method_not_selected` with OTP primary action
- renders `final_proof_required` after backend error
- renders `handoff_proof_required` for station handoff context
- routes to OTP proof from primary action
- routes to signature proof from fallback action
- routes to photo proof from fallback action
- routes to failed attempt when proof cannot be completed
- shows upload expiry for pending fallback proof asset
- blocks completion action for pending upload
- blocks completion action for expired upload
- blocks completion action for mismatched proof asset
- opens action recovery for unknown confirmation
- refresh action preserves current variant while loading
- support action appears for mismatch and repeated rejection

Security tests:

- no signed upload URL is rendered
- no storage bucket is rendered
- no storage object path is rendered
- no raw OTP is rendered
- no receiver verification token is rendered
- no raw proof image is rendered
- no raw signature data is rendered
- analytics excludes restricted proof data
- inaccessible role cannot see proof asset metadata

Accessibility tests:

- root section has accessible name
- status update is announced
- proof error includes text explanation
- method rail is keyboard operable
- disabled method has explanation
- touch targets meet mobile minimum
- focus order is logical
- reduced motion disables nonessential transitions
- color is not the only indicator

Offline tests:

- cached proof blocker renders with timestamp
- completion action hidden or disabled offline
- upload pending shows connection-required copy
- unknown upload result routes to recovery
- stale delivery refresh does not clear selected method

Contract tests:

- `otp` completion requires token reference in child flow
- `signature` completion requires uploaded `PFA-*`
- `delivery_photo` completion requires uploaded `PFA-*`
- proof asset type mismatch renders mismatch variant
- proof asset delivery mismatch renders mismatch variant
- expired upload intent renders expired variant
- fallback reason contract gap is visible when applicable

## Acceptance Criteria
Claude Code implementation is complete when:

- `SharedProofRequiredState` is implemented as a reusable shared state component.
- Every variant listed in this file is supported.
- The component has no direct completion mutation.
- The component has no direct proof upload mutation.
- It routes to proof flows through callbacks.
- It defaults to OTP as the recommended method when allowed.
- It treats signature and delivery photo as fallback methods.
- It never renders restricted proof data.
- It exposes accessible labels and status messages.
- It handles offline and stale data explicitly.
- It supports mobile, tablet, and desktop embedding.
- It has unit tests for all variants.
- It has accessibility tests for focus and live regions.
- It has analytics tests proving restricted fields are excluded.
- It is documented in the shared state component index.

## Claude Code Build Notes
Build this as a presentational component with route callbacks. Keep backend mutations in host screens or dedicated proof hooks.

Recommended files when implementation begins:

- `apps/mobile/src/components/states/SharedProofRequiredState.tsx`
- `apps/mobile/src/components/states/ProofMethodRail.tsx`
- `apps/mobile/src/components/states/ProofAssetReadinessCard.tsx`
- `apps/mobile/src/components/states/__tests__/SharedProofRequiredState.test.tsx`
- `apps/admin/src/components/states/SharedProofRequiredState.tsx` if web and mobile component trees are separate
- `packages/shared/src/ui-state/proof-required.ts` for shared state types if the repo establishes a UI-state package

Implementation sequence:

1. Add typed variant model.
2. Add safe copy map.
3. Add presentational component.
4. Add method rail.
5. Add proof asset readiness card.
6. Add privacy notice.
7. Add live region.
8. Add callback wiring in proof host screens.
9. Add analytics wrapper with restricted-field guard.
10. Add tests and accessibility checks.

Do not build:

- proof upload logic inside this shared state
- proof image preview inside this shared state
- signature drawing inside this shared state
- camera capture inside this shared state
- admin evidence viewer inside this shared state
- backend bypass or forced completion action

## Design Quality Bar
This state must feel like a premium field-control system:

- one obvious primary route
- proof methods organized by trust level
- no clutter
- no hidden blockers
- clear consequences
- strong offline boundaries
- strict data privacy
- crisp accessible copy
- predictable recovery
- polished mobile ergonomics

The best version of this state prevents loss, prevents disputed delivery completion, and helps a courier finish the right way under pressure.

## Final Implementation Checklist
- State ID matches `proof_required`.
- Primary component is `SharedProofRequiredState`.
- Variants map to exact recovery actions.
- API errors map to state variants.
- OTP-specific missing token cases delegate to `otp_required`.
- Custody blockers delegate to `custody_not_confirmed`.
- Payment blockers delegate to `blocked_by_payment`.
- Issue blockers delegate to `blocked_by_issue`.
- Signature fallback requires uploaded `PFA-*`.
- Delivery photo fallback requires uploaded `PFA-*`.
- Proof asset type mismatch blocks completion.
- Proof asset delivery mismatch blocks completion.
- Expired upload intent starts new proof upload.
- Offline state never claims delivery completion.
- Stale data is visible with timestamp.
- Analytics excludes restricted fields.
- Accessibility state changes are announced.
- Mobile action targets are large enough.
- Privacy notice is visible where required.
- No UI route exposes raw proof references unless an authorized host intentionally shows safe metadata.
- No implementation path creates duplicate proof assets silently.
- Failed attempt remains available when proof cannot be collected safely.

# Proof Capture Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Proof capture component |
| Component family | Shared UI infrastructure |
| Primary components | `ProofCaptureComponent`, `ProofCaptureController`, `ProofMethodSelector`, `OtpProofBridge`, `SignatureProofPad`, `DeliveryPhotoCapture`, `ProofAssetUploader`, `ProofCompletionGate` |
| Supporting components | `ProofRequirementBanner`, `ProofCustodyStrip`, `ProofMethodCard`, `ProofFallbackReason`, `ProofAssetReview`, `ProofUploadProgress`, `ProofCompletionSummary`, `ProofRecoveryRail`, `ProofAccessibilityAnnouncer`, `ProofPrivacyBoundary` |
| Inventory behavior | OTP, signature, photo upload, upload confirmation, completion action |
| Repo targets | `apps/mobile`, with web/admin read-only helpers only where explicitly scoped |
| Primary surfaces | final-mile courier mobile app, station operator pickup completion, operations mobile shared recovery, admin/support read-only proof evidence review |
| Primary users | final-mile couriers, destination station operators, support operators, operations leads, QA, security reviewers |
| Backend coverage | `complete_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, receiver phone verification token, proof asset repository, delivery lifecycle, custody and role checks |
| Browser mutation operation | Optional host-owned composition; the component may call typed adapters only when the host explicitly passes a mutation adapter |
| Data sensitivity | receiver name, receiver phone hint, OTP proof reference, signature image, delivery photo, proof asset ID, signed upload URL, SHA-256 hash, storage generation, delivery ID, actor ID, custody owner |
| Offline critical | Yes for proof capture recovery and queued upload preparation; final delivered state remains backend-authoritative |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, offline outbox, role routing, scan component, timeline component, custody chain component, empty/error library, analytics tracking, test harness |
| Related screen specs | `CourierProofCapture`, `CourierOtpCompletion`, `CourierSignatureProof`, `CourierPhotoProof`, `UploadProofModal`, `VerifyOtpModal`, station pickup completion, action recovery |
| Related state specs | proof required, OTP required, custody not confirmed, offline, stale data, blocked by issue, session expired, rate limited, error, not authorized |
| Design tokens | No unique tokens; proof surfaces use existing proof, success, warning, danger, neutral, focus, offline, camera, and privacy tokens |
| Accessibility target | Proof method selection, signature capture, photo capture, upload progress, and completion must work with screen readers, large text, keyboard where relevant, and reduced motion |

## Purpose
The proof capture component is Kra's shared proof-of-delivery and proof-of-pickup primitive.

It coordinates proof method selection, OTP proof reference readiness, signature capture, delivery photo capture, proof asset upload, upload confirmation, and delivery completion readiness. It does not weaken backend authority and it does not replace the specialized child screens. It gives those screens one strict proof contract so every final-mile and station pickup path behaves the same way.

The component must answer:

- Which delivery is being completed?
- Which actor is completing it?
- Does the actor currently have the required custody or station scope?
- Which proof methods are allowed for this delivery state?
- Is OTP available as an active proof reference?
- If OTP is unavailable, why is fallback proof allowed?
- Is the signature or photo asset fresh, valid, private, and tied to this delivery?
- Has the backend created a `PFA-*` upload intent?
- Did the binary upload finish before the signed URL expired?
- Did backend upload confirmation accept byte size, hash, and optional storage generation?
- Is the host allowed to call `complete_delivery` now?
- What recovery path is safest when proof capture, upload, confirmation, or completion fails?

The most important rule is:

```text
Proof is not accepted because the device captured it. Proof is accepted only after the backend validates the proof reference for the delivery, proof type, actor, custody state, and current lifecycle state.
```

## Product Job
Field operators need a proof flow that is fast at the receiver door and strict enough to protect goods, couriers, senders, receivers, and Kra.

The proof capture component must:

- make OTP the preferred receiver-led proof path where available
- support signature and delivery photo as controlled fallback paths
- prevent completion without exactly one accepted proof method
- keep proof capture tied to the current delivery and actor
- provide clear handoff context without exposing private receiver data
- upload fallback proof through backend-created signed upload intents only
- confirm upload before allowing fallback completion
- protect signed upload URLs, raw OTP, signature images, and photo data from UI leakage
- recover cleanly from camera denial, pointer cancellation, upload expiry, offline state, and backend conflicts
- integrate with offline outbox without declaring offline delivery completion
- expose clear accessibility status for every capture, upload, confirmation, and completion stage
- define tests that make unsafe shortcuts fail early

This component must make the right proof path feel natural and unsafe proof shortcuts feel impossible.

## Strategic Role
Proof capture closes the highest-risk delivery gap: the moment goods leave Kra custody.

Without a strict shared component, each app surface can drift:

- one screen may send raw OTP digits instead of an active verification token
- one screen may complete before fallback proof upload is confirmed
- one screen may keep signed upload URLs in logs
- one screen may save proof photos to public device galleries
- one screen may let a courier complete another courier's delivery
- one screen may treat offline local capture as delivered state
- one screen may hide failed attempt when proof cannot be collected

The shared proof capture component is therefore a liability control, not a convenience wrapper.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared proof capture primitives across mobile and web shells.

Surface type:

- Reusable proof workflow controller, child capture surfaces, upload stage, and host completion bridge.

Primary action:

- Produce one backend-acceptable proof reference and hand it to the host completion path.

Visual thesis:

- `Evidence chain`: a composed proof surface with one dominant proof lane, visible backend stages, and a calm recovery rail.

Restraint rule:

- Do not turn proof capture into a media gallery, broad identity check, support conversation, or local completion authority.

Density:

- Low during camera and signature capture. Medium during review, upload, confirmation, and recovery states.

Platform stance:

- Native mobile first for courier and station work. Web/admin variants are read-only or tightly scoped unless camera and upload support are explicitly enabled by the host.

## External Research Used
Only directly relevant proof capture, upload, camera, pointer, offline, and accessibility references were used:

- [Uber Direct proof of delivery](https://developer.uber.com/docs/deliveries/guides/proof-of-delivery): supports proof methods such as picture, signature, barcode, identification, and pincode, plus proof evidence references after delivery.
- [DoorDash delivery drop-off photos](https://help.doordash.com/en-us/dashers/article/confirming-delivery-drop-off-photos): supports photo quality guidance around visibility, blur, lighting, and surrounding delivery context.
- [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/): supports camera launch, media permission hooks, returned asset metadata, and native capture behavior for Expo mobile proof photo flows.
- [MDN MediaDevices getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia): supports secure-context camera access, permission failure handling, and constraints for browser capture planning.
- [Google Cloud Storage signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls): supports time-limited signed URLs for object access without exposing long-term credentials.
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): supports defense-in-depth validation of extension, content type, file size, storage location, and authorization.
- [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/): supports hardware-agnostic touch, pen, and mouse handling for signature capture.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports local reads and write recovery while preserving server authority.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible proof capture, upload, confirmation, and completion status without unexpected focus movement.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear proof, upload, permission, and completion errors.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for capture, retake, clear, upload, retry, and completion actions.
- [WCAG 2.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html): supports avoiding accidental activation during signature drawing and completion controls.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through proof requirements, capture controls, upload progress, and recovery actions.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/09-upload-proof-modal.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/10-verify-otp-modal.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/14-otp-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/15-proof-required-state.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/14-platform/performance-budgets.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/proof-storage.ts`
- `services/api/src/public-tracking-verification.ts`
- `services/api/src/routes.ts`
- `services/api/src/service-errors.ts`

## Non-Goals
The proof capture component must not:

- implement actual frontend screens
- replace backend role, station, assignment, custody, lifecycle, or proof validation
- calculate final delivery authority locally
- send raw OTP digits to `complete_delivery`
- generate proof asset IDs locally
- upload proof bytes without a backend-created signed URL
- call storage SDKs directly from client apps
- show signed upload URLs, storage buckets, object paths, raw hashes, or verification tokens to field users
- save signatures or delivery photos to public device storage
- collect broad identity documents
- photograph receiver faces when package handoff context is enough
- combine multiple fallback proof methods for one completion
- mark delivery complete while offline
- hide failed-attempt paths when proof is unavailable
- expose proof media in sender, receiver, public tracking, or default support views

## Component Boundary
The proof capture component owns:

- proof method rendering
- proof method availability display
- OTP proof-reference readiness display
- signature drawing state
- photo capture permission state
- local proof asset review state
- local file metadata extraction
- file type and size guardrails
- SHA-256 calculation request orchestration
- upload intent request orchestration when a typed adapter is supplied
- signed URL upload progress state
- upload confirmation state
- completion readiness state
- proof recovery state
- accessible status announcements
- local proof cleanup after success, cancellation, or expiry

The host owns:

- route authorization
- actor identity
- role and capability gating
- delivery read freshness
- custody and station scope checks
- deciding whether the component can compose completion
- idempotency key generation
- offline outbox persistence
- final navigation
- analytics event ownership
- support escalation routing
- admin proof evidence permissions
- user-safe copy for sender, receiver, and support contexts

## Backend Contract Summary
Primary completion route:

- `POST /v1/deliveries/:id/complete`

Proof asset routes:

- `POST /v1/deliveries/:id/proof-assets`
- `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`

Delivery proof types:

- `otp`
- `signature`
- `delivery_photo`

Fallback proof asset types:

- `signature`
- `delivery_photo`

Supported fallback proof asset content types:

- `image/jpeg`
- `image/png`
- `image/webp`

Proof asset statuses:

- `pending_upload`
- `uploaded`
- `attached`
- `rejected`

Create proof asset request:

```json
{
  "proofType": "delivery_photo",
  "contentType": "image/jpeg",
  "byteSize": 512000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

Create proof asset response:

```json
{
  "proofAssetId": "PFA-0001",
  "deliveryId": "DEL-0001",
  "proofReference": "PFA-0001",
  "proofType": "delivery_photo",
  "status": "pending_upload",
  "upload": {
    "method": "PUT",
    "url": "https://storage.provider/signed-upload",
    "bucket": "kra-proof-assets",
    "objectPath": "proof-assets/DEL-0001/PFA-0001.jpg",
    "contentType": "image/jpeg",
    "expiresAt": "2026-05-21T10:15:00.000Z"
  }
}
```

Confirm proof asset upload request:

```json
{
  "byteSize": 512000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "storageGeneration": "provider-generation"
}
```

Completion request:

```json
{
  "proofType": "delivery_photo",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Contract rules:

- `byteSize` must be a positive integer no larger than `8_000_000`.
- `sha256` must be lowercase 64-character hex when supplied or confirmed.
- Upload intent expires after `15 minutes`.
- Upload `PUT` content type must match intent content type.
- Upload confirmation user must match the user who requested the proof asset.
- Fallback completion requires a `PFA-*` proof asset belonging to the same delivery and proof type.
- OTP completion requires an active receiver phone-verification token, not raw OTP digits.
- Station pickup proof upload is restricted to the destination station operator.
- Final-mile proof upload is restricted to the assigned courier.
- Final-mile completion requires `complete_delivery_with_proof`.
- Station pickup completion requires station operator authority and destination station scope.

## Host Input Contract
Required props:

```ts
type ProofMethod = "otp" | "signature" | "delivery_photo";

type ProofActorContext = {
  actorId: string;
  role: "station_operator" | "final_mile_courier" | "support_admin" | "ops_admin";
  capabilityKeys: string[];
  stationId?: string;
};

type ProofDeliveryContext = {
  deliveryId: string;
  trackingCode?: string;
  currentStatus:
    | "awaiting_receiver_pickup"
    | "assigned_for_final_mile"
    | "out_for_delivery";
  currentCustodyRole?: "station_operator" | "final_mile_courier";
  currentCustodyActorId?: string;
  assignedFinalMileCourierId?: string;
  destinationStationId: string;
  receiverDisplayName?: string;
  receiverPhoneHint?: string;
  dataFreshness: "live" | "refreshing" | "cached_fresh" | "cached_stale" | "offline_cached";
};

type ProofPolicyContext = {
  allowedMethods: ProofMethod[];
  preferredMethod: ProofMethod;
  fallbackReasonRequired: boolean;
  allowedFallbackReasons: Array<
    | "otp_unavailable"
    | "receiver_phone_unavailable"
    | "receiver_present_no_otp"
    | "support_authorized"
    | "station_pickup_exception"
  >;
  failedAttemptRouteRequired: boolean;
};

type ProofCaptureComponentInput = {
  actor: ProofActorContext;
  delivery: ProofDeliveryContext;
  policy: ProofPolicyContext;
  activeOtpProofReference?: string;
  completionMode: "return_proof_only" | "host_completes" | "component_composes_completion";
  uploadMode: "host_uploads" | "component_uploads_with_adapter";
  offlineMode: "online_only" | "capture_recovery_allowed" | "outbox_allowed";
  safeDisplayLabels: {
    packageLabel: string;
    receiverLabel: string;
    custodyLabel: string;
    nextActionLabel: string;
  };
};
```

Rules:

- `delivery.deliveryId` is required.
- `actor.actorId` is required for all mutation-capable modes.
- `policy.allowedMethods` must include at least one method.
- `policy.preferredMethod` must be inside `allowedMethods`.
- `activeOtpProofReference` must never be a raw OTP-looking digit string.
- `completionMode=component_composes_completion` requires typed mutation adapters.
- `uploadMode=component_uploads_with_adapter` requires create-intent, binary upload, and confirm-upload adapters.
- `offlineMode=outbox_allowed` requires a host-provided outbox adapter and idempotency key factory.
- Host must block mutation modes when role, capability, station scope, assignment, or custody is not established.
- Host must pass safe display labels instead of raw private identifiers where possible.

## Output Contract
The component returns typed outcomes:

```ts
type ProofCaptureOutcome =
  | {
      kind: "proof_ready";
      deliveryId: string;
      proofType: "otp";
      proofReference: string;
      receivedByName: string;
      source: "active_receiver_verification";
    }
  | {
      kind: "proof_ready";
      deliveryId: string;
      proofType: "signature" | "delivery_photo";
      proofReference: string;
      proofAssetId: string;
      receivedByName: string;
      contentType: "image/jpeg" | "image/png" | "image/webp";
      byteSize: number;
      sha256: string;
      uploadedAt: string;
      fallbackReason: string;
    }
  | {
      kind: "completion_requested";
      deliveryId: string;
      proofType: ProofMethod;
      proofReference: string;
      receivedByName: string;
    }
  | {
      kind: "completion_succeeded";
      deliveryId: string;
      eventId: string;
      completedAt: string;
    }
  | {
      kind: "recovery_requested";
      recovery:
        | "retry_upload"
        | "recapture_signature"
        | "retake_photo"
        | "use_otp"
        | "use_signature"
        | "use_photo"
        | "record_failed_attempt"
        | "open_offline_outbox"
        | "open_support";
    }
  | {
      kind: "cancelled";
      reason: "user_closed" | "route_changed" | "permission_denied" | "session_expired";
    };
```

Rules:

- `proof_ready` must never include raw image bytes.
- `proof_ready` for fallback methods must include uploaded proof asset metadata only.
- `completion_requested` must be emitted only when the host owns completion.
- `completion_succeeded` must be emitted only after backend success.
- `cancelled` must clear sensitive local state unless outbox recovery explicitly retains it.

## State Machine
Required component states:

```text
idle
context_validating
method_selecting
otp_waiting_for_reference
otp_reference_ready
signature_instruction
signature_capturing
signature_review
photo_permission_check
photo_camera_ready
photo_capturing
photo_review
fallback_reason_required
asset_validating
asset_hashing
upload_intent_creating
upload_intent_created
uploading_asset
upload_confirming
upload_confirmed
completion_ready
completion_submitting
completion_succeeded
offline_capture_retained
upload_expired
permission_denied
server_rejected
conflict_recovery
cancelled
```

Forbidden transitions:

- `signature_capturing -> completion_submitting`
- `photo_review -> completion_submitting`
- `uploading_asset -> completion_ready`
- `otp_waiting_for_reference -> completion_submitting`
- `offline_capture_retained -> completion_succeeded`
- `permission_denied -> completion_submitting`
- `server_rejected -> completion_succeeded`

Required transitions:

- `signature_review -> asset_validating -> asset_hashing -> upload_intent_creating`
- `photo_review -> asset_validating -> asset_hashing -> upload_intent_creating`
- `upload_intent_created -> uploading_asset -> upload_confirming -> upload_confirmed`
- `upload_confirmed -> completion_ready`
- `completion_ready -> completion_submitting -> completion_succeeded`
- any capture state can transition to `cancelled` after a safe discard or retained recovery decision

## Method Selection Rules
OTP lane:

- First visible method when available.
- Shows receiver verification readiness.
- Uses `activeOtpProofReference` from receiver verification bridge.
- Does not render a raw OTP entry for courier completion.
- Routes to `VerifyOtpModal` or receiver verification flow when proof reference is missing.

Signature lane:

- Visible only when `signature` is in `allowedMethods`.
- Requires fallback reason when policy says so.
- Requires receiver or representative name.
- Requires actual drawn strokes before review.
- Requires upload and confirm before completion.

Delivery photo lane:

- Visible only when `delivery_photo` is in `allowedMethods`.
- Requires fallback reason when policy says so.
- Requires fresh capture from the proof flow.
- Requires review against quality and privacy rules.
- Requires upload and confirm before completion.

Failed attempt lane:

- Visible whenever proof cannot be collected safely.
- Routes to failed-attempt workflow rather than forcing fallback proof.
- Must remain visible when receiver is absent, address is unsafe, camera is blocked, or proof capture fails repeatedly.

## OTP Proof Bridge
OTP proof in the shared component is proof-reference based.

The component may display:

- receiver name or safe receiver label
- masked phone hint when host provides one
- verification state
- proof reference readiness
- retry route
- failed-attempt route

The component must not display:

- raw OTP
- verification token
- challenge ID
- full receiver phone
- receiver private tracking link

Allowed OTP states:

- `not_requested`: receiver verification has not started.
- `sent`: OTP challenge sent in receiver flow.
- `verified`: active proof reference available.
- `expired`: verification token expired.
- `blocked`: phone verification is required before OTP completion.
- `rate_limited`: receiver challenge or verification is temporarily blocked.

Courier completion rule:

```text
The courier may complete with OTP only when the host supplies an active proof reference issued by receiver verification. The courier must not type or send raw OTP digits to complete delivery.
```

## Signature Capture Rules
Signature capture must:

- use a large drawing area that remains usable with finger or stylus
- support pointer down, move, up, cancel, and lost pointer events
- provide `Clear`, `Undo last stroke`, `Use signature`, and `Cancel`
- avoid completion actions on pointer down
- require at least two meaningful strokes or a host-configurable minimum stroke threshold
- show signer name before upload
- support screen-reader instructions for non-visual users through an alternate host-approved flow
- preserve stroke state only in local component memory or encrypted local recovery store
- export to PNG or WebP within proof asset limits
- calculate byte size and SHA-256 before upload intent when possible
- clear signature data after success, cancellation, expiry, or route change

Signature capture must not:

- ask for legal contract consent
- store signature in public gallery
- include receiver phone in the image
- allow blank or dot-only marks
- auto-submit after drawing stops
- use signature as default when OTP is available

## Delivery Photo Capture Rules
Photo capture must:

- prefer fresh camera capture inside the proof flow
- request camera permission in context with a clear reason
- keep permission denial recoverable
- show framing guidance before capture
- allow retake before upload
- validate content type and byte size before upload intent
- compress within quality limits when size is too high
- calculate SHA-256 before upload intent when possible
- keep photo data in private app storage or volatile memory
- clear photo data after success, cancellation, expiry, or route change

Photo guidance must say:

- show the package at the handoff location
- include safe surroundings that prove context
- keep the image clear and well lit
- avoid faces when not necessary
- avoid IDs, payment cards, private documents, and private interior details
- retake if blurry, dark, cropped, or wrong package

Photo capture must not:

- use old gallery images unless policy explicitly enables a restricted recovery path
- save to public camera roll
- capture identity documents
- require continuous GPS stream
- show raw storage details
- auto-complete after capture

## Proof Asset Upload Pipeline
Fallback proof upload sequence:

1. Validate local asset type and size.
2. Compute SHA-256 where platform support allows.
3. Request proof asset upload intent from backend.
4. Store `proofAssetId`, `proofReference`, `contentType`, `expiresAt`, and upload stage in volatile or encrypted recovery state.
5. Upload bytes with `PUT` to signed URL.
6. Confirm upload with byte size, SHA-256, and optional storage generation.
7. Receive `uploaded` proof asset response.
8. Emit `proof_ready` or proceed to completion bridge.

Upload rules:

- Signed URL is a secret and must never appear in UI, analytics, logs, crash reports, or route params.
- Upload must use the exact content type from the intent response.
- Upload progress must be announced accessibly.
- If upload expires, discard signed URL and request a new intent only after user confirms retry.
- If byte size or hash changes after intent, discard the intent and restart.
- If confirm upload rejects, do not call completion.
- If upload succeeds but confirmation fails, show recovery and preserve local recovery record.

## Completion Bridge
The component supports three completion modes.

`return_proof_only`:

- Component emits proof metadata.
- Host decides if and when to call `complete_delivery`.
- Used by child screens that already own completion buttons.

`host_completes`:

- Component emits `completion_requested`.
- Host performs mutation.
- Component displays host-provided pending, success, or error state.

`component_composes_completion`:

- Component performs completion through host-provided typed adapter.
- Requires idempotency key, actor context, delivery context, proof readiness, and explicit host opt-in.
- Used only where it reduces duplication without hiding backend authority.

Completion rules:

- Primary completion button is disabled until `completion_ready`.
- `receivedByName` is always required.
- `proofReference` must be active token for OTP or `PFA-*` for fallback proof.
- Component must refresh or revalidate stale delivery context before completion when online.
- Component must handle backend response as the source of truth.
- Component must clear sensitive proof state after success.

## Offline And Low-Bandwidth Rules
The proof capture component is offline-assisted, not offline-authoritative.

Allowed offline behavior:

- show cached delivery and proof guidance
- collect fallback reason
- capture signature locally
- capture photo locally when permission is already available
- store encrypted local recovery reference
- queue upload preparation metadata when host outbox policy allows
- show outbox and action recovery

Blocked offline behavior:

- create proof asset upload intent
- upload proof bytes
- confirm upload
- verify OTP proof reference
- complete delivery
- declare delivered state

Reconnect behavior:

- refresh delivery and custody before replay
- verify actor still owns the work
- verify delivery is still completion-eligible
- create a fresh upload intent when old intent expired
- discard completion retry if backend already moved to terminal state
- preserve local proof only until recovery completes or retention limit expires

## Privacy And Security Rules
Sensitive fields:

- raw OTP
- active proof reference
- signed upload URL
- signature image
- delivery photo
- SHA-256 hash
- storage bucket
- storage object path
- receiver phone
- full tracking code
- actor ID in public context

Rules:

- Never write raw OTP, signed URL, signature image, photo bytes, or proof reference to analytics.
- Never include sensitive fields in route params.
- Never include sensitive fields in notification payloads.
- Never expose raw proof media to sender, receiver, public tracking, or default support views.
- Never store proof media outside the app-private recovery location.
- Clear sensitive state on success, cancel, sign out, route change, expiry, and delivery reassignment.
- Redact proof reference to short suffix when field users need confirmation.
- Redact phone to a safe hint only.
- Use error boundaries that replace sensitive details with safe labels.
- Treat proof photos and signatures as highly restricted data.

## UX Structure
Mobile full-screen structure:

- Top custody strip with delivery label, custody owner, and status freshness.
- Proof requirement banner with selected method and backend authority note.
- Dominant method lane for OTP or the active selected method.
- Secondary fallback rail with signature, photo, and failed attempt.
- Capture area for signature or camera when selected.
- Review area with quality, privacy, and fallback reason checks.
- Upload chain showing `Prepared`, `Uploaded`, `Confirmed`, `Ready to complete`.
- Sticky primary action with disabled reason.
- Recovery rail below primary action.

Sheet/modal structure:

- Used when launched from a parent screen that already shows delivery context.
- Focus starts on the proof requirement heading.
- Background is inert.
- Escape/back asks for discard when sensitive capture exists.
- Focus returns to the invoking action after close.

Admin/support read-only structure:

- Shows proof metadata status, proof type, actor, and timestamps.
- Does not render raw media unless audited evidence access is explicitly added later.
- Does not show signed URLs, hashes, buckets, or object paths to default roles.

## Visual Direction
The component should feel operational, not decorative.

Core visual behaviors:

- Use one proof lane as the dominant focal point.
- Keep the upload chain linear and unmistakable.
- Use strong status contrast for blocked, pending, confirmed, and expired states.
- Put recovery actions near the blocked reason, not hidden at the bottom.
- Use calm motion only when stage changes.
- Use high-contrast camera and signature surfaces.
- Keep field controls thumb-reachable.
- Keep fallback methods visually secondary to OTP unless OTP is blocked.

Do not use:

- card-heavy proof clutter
- status badge soup
- celebratory completion visuals before backend success
- decorative camera overlays that hide framing
- tiny upload progress text
- ambiguous disabled buttons
- multiple equal primary actions

## Copy Rules
Tone:

- clear
- accountable
- field-friendly
- specific
- non-accusatory

Required copy patterns:

- `OTP is the preferred proof for this delivery.`
- `Signature is fallback proof. Use it only when the receiver is present and OTP cannot be completed.`
- `Photo is fallback proof. Capture the package at the handoff location and avoid private details.`
- `Upload confirmed. This proof can now be used to complete delivery.`
- `Upload expired. Create a new upload before completing delivery.`
- `Completion needs an online connection.`
- `Delivery is complete only after backend confirmation.`

Forbidden copy patterns:

- `Delivery complete` before backend success.
- `Uploaded, you are done` before completion.
- `Just take any photo`.
- `Skip proof`.
- `Use receiver code directly`.
- `Proof saved forever`.
- `Camera is required` when signature or failed attempt remains valid.

## Error Mapping
| Backend or local condition | Component state | User-safe message | Recovery |
| --- | --- | --- | --- |
| `FORBIDDEN` actor mismatch | `server_rejected` | `You are not assigned to complete this delivery.` | Refresh delivery, open support |
| `FORBIDDEN` station scope | `server_rejected` | `This station cannot complete this pickup.` | Return to station queue, open support |
| `INVALID_STATUS_TRANSITION` | `conflict_recovery` | `This delivery is no longer in a proof capture state.` | Refresh delivery |
| `NOT_FOUND` delivery | `server_rejected` | `Delivery was not found.` | Return to list |
| proof asset not found | `server_rejected` | `Proof upload could not be matched to this delivery.` | Restart upload |
| proof type mismatch | `server_rejected` | `This proof type does not match the selected completion method.` | Recapture with correct method |
| proof asset not uploaded | `upload_confirming` | `Proof upload must be confirmed before completion.` | Confirm upload, retry upload |
| byte size mismatch | `server_rejected` | `Proof file changed after upload started.` | Recapture |
| hash mismatch | `server_rejected` | `Proof file integrity check failed.` | Recapture |
| upload expired | `upload_expired` | `Upload expired before confirmation.` | Create new upload |
| camera denied | `permission_denied` | `Camera access is blocked for photo proof.` | Open settings, use signature, failed attempt |
| pointer cancelled | `signature_capturing` | `Signature stroke was cancelled.` | Continue signing |
| offline | `offline_capture_retained` | `Proof can be kept for recovery, but completion needs network.` | Open outbox, retry online |
| rate limited | `server_rejected` | `Too many proof attempts. Wait before retrying.` | Wait, open support |
| session expired | `cancelled` | `Sign in again before completing delivery.` | Sign in |

## Accessibility Requirements
General:

- Provide a logical heading order.
- Provide visible focus for all actions.
- Keep touch targets at least the product minimum and aligned with WCAG target guidance.
- Announce capture, upload, confirm, blocked, and success states through status messages.
- Preserve focus order through method selection, capture, review, upload, and recovery.
- Support reduced motion.
- Support large text without hiding primary actions.
- Do not rely on color alone for method, upload, or error state.

OTP:

- Do not split OTP into inaccessible visual-only inputs in courier mode.
- Announce whether proof reference is ready or blocked.
- Provide a clear route to receiver verification.

Signature:

- Provide text instructions before the pad.
- Keep clear and use actions reachable and labelled.
- Do not trigger completion on pointer down.
- Provide undo or clear.
- Provide alternate escalation when a user cannot sign on glass.

Photo:

- Announce camera permission state.
- Label capture, retake, flash, and upload actions.
- Keep capture control large and stable.
- Avoid motion-only framing instructions.

Upload:

- Announce percent or stage changes without moving focus.
- Provide retry with clear cause.
- Avoid disappearing progress controls.

## Analytics Requirements
Allowed events:

- `proof_component_opened`
- `proof_method_selected`
- `proof_fallback_reason_selected`
- `proof_signature_reviewed`
- `proof_photo_reviewed`
- `proof_asset_upload_started`
- `proof_asset_upload_confirmed`
- `proof_completion_requested`
- `proof_completion_succeeded`
- `proof_recovery_selected`
- `proof_component_cancelled`

Required event fields:

- `deliveryIdHash`
- `actorRole`
- `proofType`
- `surface`
- `dataFreshness`
- `offlineState`
- `fallbackReasonCode`
- `stage`
- `errorCode`

Forbidden event fields:

- raw OTP
- active proof reference
- proof asset ID
- signed upload URL
- receiver phone
- receiver full name
- signature image
- photo bytes
- SHA-256 hash
- storage bucket
- storage object path
- full tracking code

## Performance Requirements
Targets:

- proof component first usable render within `1.5s` on supported field devices
- method switch feedback within `100ms`
- signature stroke latency below visible lag threshold on supported devices
- photo capture controls ready as soon as permission resolves
- local asset validation within `500ms` for normal proof sizes
- upload progress visible within `300ms` after binary upload starts
- proof image upload target within `8s` on workable mobile network after compression

Performance rules:

- Lazy-load camera and signature modules when not active.
- Do not load camera while OTP lane is selected.
- Do not hash on the main UI thread when platform support permits background work.
- Compress photo before upload if over product size thresholds.
- Avoid keeping large base64 strings in React state.
- Release camera resources when leaving photo state.

## Test Requirements
Unit tests:

- allowed method ordering
- completion disabled before proof readiness
- OTP raw digit guard
- fallback reason required rules
- signature minimum stroke validation
- photo content type validation
- byte size validation
- proof asset status mapping
- signed URL redaction
- analytics redaction
- recovery state mapping

Component tests:

- OTP lane ready and blocked states
- signature capture, clear, review, upload, confirm, completion-ready
- photo permission denied, capture, retake, review, upload, confirm, completion-ready
- upload expiry recovery
- confirm upload rejection recovery
- offline capture retained state
- accessible status messages
- focus return after modal close
- large text layout
- reduced motion behavior

Integration tests:

- creates proof upload intent with exact proof type and content type
- uploads binary with matching content type
- confirms upload with byte size and SHA-256
- calls completion only after upload confirmed
- never calls completion with raw OTP digits
- blocks wrong actor and wrong station paths
- refreshes stale delivery context before completion
- queues only allowed recovery records while offline

End-to-end journeys:

- courier completes with OTP proof reference.
- courier captures signature fallback, uploads it, confirms upload, and completes.
- courier captures photo fallback, uploads it, confirms upload, and completes.
- upload expires, courier retries with new intent, then completes.
- camera denied, courier routes to signature or failed attempt.
- offline after capture, local recovery survives restart, upload resumes only after refresh.
- backend rejects proof asset mismatch, user is routed to recapture.

Security tests:

- no signed upload URL in DOM, route, analytics, logs, or crash boundary payloads.
- no raw OTP in completion request.
- no proof media in analytics payload.
- no proof media in public storage path.
- proof state clears on sign out and route change.
- proof reference is redacted in field UI.

## Build Instructions For Claude Code
When implementing later:

- Build the shared controller first, not one-off screen logic.
- Compose child screens through this contract.
- Keep OTP, signature, photo, upload, confirmation, and completion stages explicit.
- Use shared typed API client schemas for all requests and responses.
- Keep host-owned authorization and route guarding outside the component.
- Use host-supplied idempotency keys for create intent, confirm upload, and completion mutations.
- Use app-private local storage for retained capture recovery.
- Keep proof media out of global Redux/RTK Query cache.
- Prefer file references or blobs over base64 in React state.
- Redact all proof-sensitive fields before logging or analytics.
- Add tests before wiring the first screen.

Do not:

- copy proof logic into each courier proof screen
- make upload confirmation optional
- reuse old local media for completion
- allow offline delivered state
- expose raw proof details to public or sender views
- let component decide role authority locally

## Acceptance Checklist
- Component supports OTP proof reference, signature fallback, and delivery photo fallback.
- OTP path never sends raw OTP digits to completion.
- Fallback paths create backend upload intent before binary upload.
- Fallback paths confirm upload before completion.
- Completion is disabled until proof is ready.
- Signed upload URLs are never visible or logged.
- Proof media is retained only in app-private recovery scope.
- Offline mode preserves capture recovery but blocks delivered state.
- Failed-attempt route remains visible when proof cannot be collected.
- Actor, station, assignment, custody, and lifecycle conflicts map to safe recovery.
- Accessibility states cover method selection, capture, upload, confirm, and completion.
- Analytics excludes proof secrets and proof media.
- Tests cover success, blocked, expired, offline, permission, and conflict paths.

## Definition Of Done
This infrastructure spec is complete when a frontend engineer can implement one shared proof capture primitive and wire it into courier, station, and recovery flows without adding separate proof business rules per screen.

The implementation must prove:

- one proof contract
- one upload chain
- one completion gate
- one privacy boundary
- one accessibility model
- one recovery model
- backend authority everywhere

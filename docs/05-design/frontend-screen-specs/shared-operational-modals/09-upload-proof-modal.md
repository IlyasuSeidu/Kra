# Upload Proof Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `UploadProofModal` |
| Component target | shared proof asset upload, confirmation, and recovery modal |
| Primary test ID | `modal-upload-proof` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 final proof upload control |
| Used by | `CourierSignatureProof`, `CourierPhotoProof`, station pickup completion when allowed, `OpsActionRecovery`, `OpsOfflineOutbox` |
| Backend coverage | `create_delivery_proof_asset`, storage `PUT`, `confirm_delivery_proof_asset_upload` |
| Trigger source | proof child screens after local signature or delivery photo evidence is accepted |
| Required states | `closed`, `opening`, `reviewing_asset`, `ready_to_create_intent`, `creating_intent`, `intent_created`, `uploading_binary`, `upload_progress`, `upload_put_failed`, `upload_expired`, `confirming_upload`, `upload_confirmed`, `completion_ready`, `offline_blocked`, `offline_capture_retained`, `hashing_asset`, `hash_failed`, `size_blocked`, `content_type_blocked`, `scope_blocked`, `status_blocked`, `custody_blocked`, `storage_unavailable`, `server_rejected`, `network_error`, `closing` |

## Product Job
`UploadProofModal` takes a locally captured signature or delivery-photo proof asset, creates a backend upload intent, uploads the asset to the signed storage URL, confirms the upload with the backend, and returns a backend-issued `PFA-*` proof reference to the host screen.

The modal answers:
- `What proof asset am I about to upload?`
- `Is the file type and size accepted by the backend contract?`
- `Has the backend created a proof asset reference?`
- `Did the binary upload finish before the signed URL expired?`
- `Did the backend confirm byte size and hash?`
- `Can the host now use this proof reference to complete delivery?`
- `What should the courier do if upload fails, expires, or goes offline?`

The user should be able to:
- Review the proof type and delivery identity.
- Understand that upload is not the same as delivery completion.
- Start upload with one primary action.
- See progress and current stage.
- Retry safely when upload intent expires or upload fails.
- Return to recapture when local evidence is no longer trusted.
- Open support or offline outbox when recovery is blocked.
- Avoid seeing signed upload URL, storage bucket, object path, or sensitive hash data.

This modal is not:
- A camera.
- A signature pad.
- A proof method selector.
- An OTP screen.
- A delivery completion form.
- A file browser.
- A media editor.
- A support thread.
- A station return flow.
- A public proof viewer.

## Strategic Role
Signature and delivery-photo proof are fallback evidence that can settle disputes, protect couriers, and satisfy final-mile completion only after the proof asset is stored and confirmed. This modal is the trust bridge between local evidence and backend completion.

Core principle:
- Capture proves local evidence exists.
- Upload intent reserves a backend proof asset ID.
- Storage `PUT` moves encrypted bytes to the storage gateway.
- Confirm upload proves the backend accepts byte size and hash.
- Completion may use the `PFA-*` proof reference only after confirmation.
- Delivery is not complete inside this modal.

## Audience
Primary users:
- Final-mile couriers uploading signature proof.
- Final-mile couriers uploading delivery-photo proof.

Secondary users:
- Destination station operators completing receiver pickup with signature or photo proof where policy allows.
- Support staff resolving failed proof upload recovery.
- QA validating upload, expiry, retry, and confirm behavior.
- Security reviewers validating signed URL and proof data redaction.
- Claude Code implementing the modal later.

Non-users:
- Senders.
- Receivers using public tracking.
- Drivers.
- Finance-only admins.
- Webhook processors.
- AI agents without authenticated proof authority.

## Current Backend Reality
Create proof asset route:
- Operation key: `create_delivery_proof_asset`.
- Route: `POST /v1/deliveries/:id/proof-assets`.
- Required access: delivery completion access.
- Idempotent through route key and request fingerprint.
- Request schema: `createProofAssetUploadRequestSchema`.
- Response schema: `createProofAssetUploadResponseSchema`.

Create request fields:
- `proofType`: `signature` or `delivery_photo`.
- `contentType`: `image/jpeg`, `image/png`, or `image/webp`.
- `byteSize`: positive integer, maximum `8_000_000`.
- `sha256`: optional lowercase 64-character hex string.

Create response fields:
- `proofAssetId`: `PFA-*`.
- `deliveryId`.
- `proofReference`: same `PFA-*`.
- `proofType`.
- `status`: `pending_upload`.
- `upload.method`: `PUT`.
- `upload.url`: signed storage URL.
- `upload.bucket`.
- `upload.objectPath`.
- `upload.contentType`.
- `upload.expiresAt`.

Storage upload:
- Client performs a `PUT` to `upload.url`.
- Request content type must match `upload.contentType`.
- Upload must finish before `upload.expiresAt`.
- The signed URL must never be shown to the user or logged.

Confirm upload route:
- Operation key: `confirm_delivery_proof_asset_upload`.
- Route: `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`.
- Required access: delivery completion access.
- Idempotent through route key and request fingerprint.
- Request schema: `confirmProofAssetUploadRequestSchema`.
- Response schema: `proofAssetResponseSchema`.

Confirm request fields:
- `byteSize`: positive integer, maximum `8_000_000`.
- `sha256`: required lowercase 64-character hex string.
- `storageGeneration`: optional provider generation string.

Confirm backend rules:
- Proof asset must exist and belong to delivery.
- Proof asset status must be `pending_upload`.
- Confirming user must be the same user who requested the proof asset.
- Upload must not be expired at confirm time.
- Byte size must match original intent.
- If intent had `sha256`, confirm hash must match.
- Success marks proof asset as `uploaded`.

Completion relationship:
- Host may call `complete_delivery` with `proofType=signature` or `delivery_photo` only after proof asset status is `uploaded`.
- `complete_delivery` later marks proof asset as `attached`.
- This modal must not call `complete_delivery` directly unless the host explicitly composes that action outside the modal contract.

## Access Reality
Courier proof upload:
- Allowed when delivery is assigned to the courier or courier has final-mile custody according to completion access rules.
- Typical source screens are `CourierSignatureProof` and `CourierPhotoProof`.
- Courier must have `complete_delivery_with_proof` for final-mile completion.

Station proof upload:
- Allowed for `awaiting_receiver_pickup` completion only by destination station operator.
- Station operator must be scoped to destination station.
- This is why inventory says station when allowed.

Blocked:
- Unassigned courier.
- Wrong station operator.
- Sender.
- Driver.
- Support-only admin without delivery completion authority.
- Any actor after delivery is already terminal unless host opens read-only recovery.

## Source References
External references used for this modal:
- [AWS S3 presigned URL upload user guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html): supports using a presigned URL to upload a specific object with matching content type and expiration limits.
- [Google Cloud Storage signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls): supports time-limited signed URLs for upload/download access without exposing long-term credentials.
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API): supports browser file metadata, size, type, and file reads needed for validation and hashing.
- [MDN Using files from web applications](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications): supports user-selected files, object URLs, and safe client-side file handling.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible upload progress, confirmed, failed, expired, and queued state announcements.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear field and upload-stage errors.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable retry, cancel, recapture, and confirm controls.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background, Escape behavior, and focus return.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/12-courier-photo-proof.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Design Brief
Audience:
- Field operator who has already captured valid local signature or photo proof and needs to upload it safely.

Context of use:
- Mobile, final-mile or station pickup completion, possible weak network, receiver nearby, package handoff pressure.

Entry point:
- Host proof screen has accepted local evidence and passes asset metadata to modal.

Success state:
- Backend proof asset is `uploaded`, and host receives `proofReference=PFA-*` for completion.

Primary action:
- `Upload proof`

Secondary actions:
- `Cancel upload`
- `Retake photo`
- `Recapture signature`
- `Try again`
- `Open support`
- `Open offline outbox`

Navigation model:
- Blocking modal over proof screen.
- On compact mobile, use full-height sheet when progress and recovery need space.
- On tablet/web shell, use centered modal.

Density:
- Medium. Upload state is technical, but the user needs a simple chain of stages.

Visual thesis:
- A secure upload pipeline: local proof -> backend proof ID -> encrypted upload -> backend confirmation -> ready for delivery completion.

Restraint rule:
- Do not show signed URL, storage bucket, object path, raw hash, raw byte logs, or public proof preview beyond what host already allowed.

Product lens:
- Evidence integrity and recovery, not visual media editing.

System stance:
- Host owns local capture, final completion, and route navigation.
- Modal owns proof asset upload sequence and recovery states.

Interaction thesis:
- Make the upload chain visible enough to build trust, but hide storage internals that could create risk.

Signature move:
- Four-step upload rail with exact current stage: `Prepare`, `Reserve`, `Upload`, `Confirm`.

## Authority Boundary
This modal can:
- Validate proof asset metadata.
- Compute or receive SHA-256 hash.
- Request upload intent from backend through host callback.
- Upload bytes to signed URL through host storage adapter.
- Confirm upload through host callback.
- Return confirmed proof asset response to host.
- Show progress, retry, expiry, and recovery states.
- Emit redacted analytics.

This modal cannot:
- Capture camera image.
- Capture signature strokes.
- Choose proof method.
- Complete delivery by itself.
- Mark proof asset attached.
- Show signed upload URL.
- Show storage bucket or object path.
- Read proof assets after upload.
- Expose raw proof to analytics.
- Store proof asset permanently.
- Override backend status, custody, or assignment failures.

Host must provide:
- Local proof byte source or secure file handle.
- Proof type.
- Content type.
- Byte size.
- Optional precomputed SHA-256.
- Delivery and actor context.
- Callbacks for create intent, upload `PUT`, confirm upload, recapture, support, outbox, and close.

## Supported Proof Types
`signature`:
- Source screens: `CourierSignatureProof`, station pickup completion when allowed.
- Content type: prefer `image/png` or `image/webp`.
- Evidence: encoded signature image.
- Required before completion: signer name captured by host.
- Modal must not render signature strokes unless host provides a safe thumbnail.

`delivery_photo`:
- Source screens: `CourierPhotoProof`, station pickup completion when allowed.
- Content type: prefer `image/jpeg`; allow `image/png` and `image/webp`.
- Evidence: freshly captured delivery-photo proof.
- Required before completion: receiver or representative name captured by host.
- Modal may show safe thumbnail if host provides it and privacy rules allow it.

Unsupported:
- `otp`, because OTP is a token proof, not a proof asset upload.
- Audio, video, PDF, document, arbitrary file, or gallery import unless a future policy adds it.

## Opening Preconditions
Open normal upload flow when:
- Delivery ID is present.
- Tracking code or safe display reference is present.
- Proof type is `signature` or `delivery_photo`.
- Content type is `image/jpeg`, `image/png`, or `image/webp`.
- Byte size is positive and at most `8_000_000`.
- Local asset bytes are accessible.
- User has delivery completion access.
- Host status/custody checks have passed for the source proof screen.
- No upload is already confirmed for the same visible asset.

Open blocked state when:
- File is too large.
- Content type is unsupported.
- Local asset cannot be read.
- Hash computation fails.
- User lacks scope.
- Delivery status no longer allows proof upload.
- Courier lost custody.
- Storage gateway is unavailable.
- Device is offline before upload intent.
- Signed upload URL expired.

Do not open when:
- Host has no local evidence.
- Proof type is OTP.
- Delivery is already delivered and host is not in recovery mode.
- Host cannot identify the proof source.

## Upload Pipeline
Stage 1, Prepare:
- Validate proof type, content type, and size.
- Compute SHA-256 if host has not provided it.
- Show file size in friendly units.
- Do not show raw hash.

Stage 2, Reserve:
- Call `create_delivery_proof_asset`.
- Send proof type, content type, byte size, and hash if available.
- Receive `proofAssetId`, `proofReference`, and signed upload information.
- Store signed URL only in memory for this modal session.

Stage 3, Upload:
- Perform `PUT` to signed upload URL.
- Set `Content-Type` to response upload content type.
- Stream or upload bytes according to platform support.
- Track upload progress when adapter supports it.
- Abort if URL is expired before start.
- If expiry happens mid-upload, treat result as uncertain and require new intent unless storage confirms success and backend confirm succeeds.

Stage 4, Confirm:
- Call `confirm_delivery_proof_asset_upload`.
- Send byte size, SHA-256, and storage generation if available.
- Receive `proofAssetResponseSchema` with `status=uploaded`.
- Return proof asset response to host.

Stage 5, Completion-ready:
- Host can enable `Complete delivery` on the parent screen.
- Modal must not mark delivery delivered.
- Modal may auto-close after confirmed state only if host keeps proof reference safely.

## State Machine
`closed`:
- Modal not visible.
- Signed URL and transient upload state cleared.

`opening`:
- Validate props and local evidence.
- Route to blocked state if unsafe.

`reviewing_asset`:
- User sees proof type, delivery reference, size, and upload explanation.
- Primary enabled if online and metadata valid.

`ready_to_create_intent`:
- Metadata ready.
- Awaiting user action.

`hashing_asset`:
- Hash computation in progress.
- User cannot submit or close by outside tap.

`hash_failed`:
- Host cannot compute hash.
- User can retry hash or recapture.

`size_blocked`:
- Byte size exceeds `8_000_000` or is zero.
- User must recapture or compress in host screen if allowed.

`content_type_blocked`:
- File is not `image/jpeg`, `image/png`, or `image/webp`.
- User must recapture in supported format.

`creating_intent`:
- Backend upload intent request in flight.
- Show `Reserve proof reference`.

`intent_created`:
- `PFA-*` reference exists.
- Signed URL available only in memory.

`uploading_binary`:
- Storage `PUT` in flight.
- Show progress if available.

`upload_progress`:
- Progress percentage or stage label visible.
- Do not estimate final time unless adapter supports it.

`upload_put_failed`:
- Storage upload failed before backend confirm.
- User can retry same signed URL only if not expired and adapter says no bytes were accepted.
- Otherwise request new intent with same local evidence.

`upload_expired`:
- Signed URL expired.
- User must create a new intent.
- Old proof asset remains pending and should be left for backend cleanup.

`confirming_upload`:
- Backend confirm request in flight.
- Show `Confirming upload`.

`upload_confirmed`:
- Backend returned `status=uploaded`.
- Host receives proof reference.

`completion_ready`:
- Parent screen can call `complete_delivery`.
- Modal displays `Proof ready`.

`offline_blocked`:
- No network before create, upload, or confirm.
- User can keep local evidence if host secure storage allows it.

`offline_capture_retained`:
- Host saved local evidence for later retry.
- Show privacy warning and outbox/recovery action.

`scope_blocked`:
- Actor is not allowed to upload proof for this delivery.
- Route to refresh or support.

`status_blocked`:
- Delivery status no longer allows proof upload.
- Route to assignment/detail refresh.

`custody_blocked`:
- Courier no longer has final-mile custody.
- Route to custody chain or support.

`storage_unavailable`:
- Backend says proof storage gateway is not configured.
- Route to OTP, failed attempt, or support.

`server_rejected`:
- Backend rejected create or confirm.
- Show mapped safe error.

`network_error`:
- Unknown request failure.
- Require refresh or retry based on stage.

`closing`:
- Clear signed URL from memory.
- Preserve only safe local recovery state if host has accepted it.

## Data Contract
Component props:

```ts
type UploadProofModalProps = {
  isOpen: boolean;
  delivery: UploadProofDeliveryContext;
  actor: UploadProofActorContext;
  asset: UploadProofLocalAsset;
  network: UploadProofNetworkState;
  recoveryPolicy: UploadProofRecoveryPolicy;
  onClose: () => void;
  onCreateUploadIntent: (input: CreateProofAssetUploadInput) => Promise<CreateProofAssetUploadResult>;
  onPutToSignedUrl: (input: PutProofAssetInput) => Promise<PutProofAssetResult>;
  onConfirmUpload: (input: ConfirmProofAssetUploadInput) => Promise<ProofAssetUploadedResult>;
  onProofReady: (result: ProofAssetUploadedResult) => void;
  onRetakePhoto?: () => void;
  onRecaptureSignature?: () => void;
  onOpenSupport: (context: UploadProofSupportContext) => void;
  onOpenOfflineOutbox: () => void;
};
```

Delivery context:

```ts
type UploadProofDeliveryContext = {
  deliveryId: string;
  trackingCode: string;
  currentStatus: DeliveryStatus;
  proofContext: "courier_final_mile" | "station_pickup";
  currentCustodyRole?: "station_operator" | "final_mile_courier" | null;
  currentCustodyActorId?: string | null;
  destinationStationId?: string;
  destinationStationLabel?: string;
};
```

Actor context:

```ts
type UploadProofActorContext = {
  actorId: string;
  role: "final_mile_courier" | "station_operator";
  stationId?: string;
  canUploadProofAsset: boolean;
};
```

Local asset:

```ts
type UploadProofLocalAsset = {
  proofType: "signature" | "delivery_photo";
  contentType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
  sha256?: string;
  localUri?: string;
  bytes?: ArrayBuffer;
  thumbnailUri?: string;
  capturedAt: string;
  sourceScreen: "signature" | "photo" | "station_pickup";
};
```

Network state:

```ts
type UploadProofNetworkState = {
  isOnline: boolean;
  connectionLabel?: string;
};
```

Recovery policy:

```ts
type UploadProofRecoveryPolicy = {
  canRetainLocalAssetSecurely: boolean;
  canQueueUploadPreparation: boolean;
  maxLocalRetentionMinutes: number;
};
```

Create input:

```ts
type CreateProofAssetUploadInput = {
  deliveryId: string;
  proofType: "signature" | "delivery_photo";
  contentType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
  sha256?: string;
};
```

Create result:

```ts
type CreateProofAssetUploadResult = {
  proofAssetId: string;
  deliveryId: string;
  proofReference: string;
  proofType: "signature" | "delivery_photo";
  status: "pending_upload";
  upload: {
    method: "PUT";
    url: string;
    contentType: "image/jpeg" | "image/png" | "image/webp";
    expiresAt: string;
  };
};
```

Signed URL upload input:

```ts
type PutProofAssetInput = {
  url: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  bytes: ArrayBuffer;
  expiresAt: string;
  onProgress?: (progress: UploadProofProgress) => void;
};
```

Confirm input:

```ts
type ConfirmProofAssetUploadInput = {
  deliveryId: string;
  proofAssetId: string;
  byteSize: number;
  sha256: string;
  storageGeneration?: string;
};
```

Uploaded result:

```ts
type ProofAssetUploadedResult = {
  proofAssetId: string;
  deliveryId: string;
  proofReference: string;
  proofType: "signature" | "delivery_photo";
  status: "uploaded";
  contentType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
  uploadedAt?: string;
};
```

## Validation Rules
Proof type:
- Must be `signature` or `delivery_photo`.
- Must match source screen.
- Must match completion proof type intended by host.

Content type:
- Must be `image/jpeg`, `image/png`, or `image/webp`.
- Must match local asset encoding.
- Must match signed upload content type.

Byte size:
- Must be positive.
- Must be `<= 8_000_000`.
- Must match create intent.
- Must match confirm upload.

Hash:
- Must be lowercase 64-character hex string.
- If host did not provide hash, modal or host adapter must compute it before confirm.
- Do not show full hash to user.

Signed URL:
- Must be used only for one upload flow.
- Must not be persisted beyond session.
- Must not be logged or sent to analytics.
- Must not be copied to clipboard.

Delivery context:
- Delivery ID in confirm must match create response.
- Proof asset ID must match create response.
- Actor scope and delivery status must be rechecked by backend.

## Visual Design
Tone:
- Calm, secure, procedural.
- Avoid developer terminology in user-facing copy.
- Avoid celebratory delivery language before completion.

Container:
- Mobile: full-height sheet or near-full modal when upload is active.
- Tablet: centered modal width `620`.
- Desktop shell: centered modal width `640`.
- Footer sticky.
- Background inert.

Header:
- Title by proof type:
  - `Upload signature proof`
  - `Upload photo proof`
- Subtitle: `Kra must store this proof before delivery can be completed.`
- Close disabled while binary upload or confirm is in flight unless host supports safe abort.

Asset preview:
- Show safe thumbnail only if host marks it safe.
- Signature preview can show cropped image.
- Photo preview should avoid zooming into private details.
- If no preview allowed, show proof type tile.

Upload rail:
- Four visible steps:
  - `Prepare`
  - `Reserve`
  - `Upload`
  - `Confirm`
- Each step has state: waiting, active, done, failed.

Progress:
- Show exact percentage only when adapter provides reliable bytes sent.
- Otherwise show stage spinner and text.
- Never show signed URL or storage path.

Recovery panel:
- Appears below rail after failure.
- Gives one primary recovery action and one secondary route.

Footer:
- Primary: `Upload proof`
- In progress: `Uploading proof...`
- Confirmed: `Use this proof`
- Secondary: `Cancel upload`
- Recovery: `Try again`, `Retake photo`, `Recapture signature`, `Open support`

## Copy System
Intro:
- `This proof must be uploaded and confirmed before completion.`

Prepare state:
- `Checking proof file...`

Create intent:
- `Reserving secure proof reference...`

Upload state:
- `Uploading proof securely...`

Confirm state:
- `Confirming upload with Kra...`

Confirmed:
- Title: `Proof uploaded`
- Body: `This proof reference is ready for delivery completion.`

Offline before upload:
- Title: `Connect to upload proof`
- Body: `Proof upload needs a live connection. Keep the captured proof only if this device can store it securely.`

Expired:
- Title: `Upload link expired`
- Body: `Create a new secure upload link and upload this proof again.`

Storage unavailable:
- Title: `Proof upload is unavailable`
- Body: `Kra proof storage is not configured right now. Use another valid proof path or contact support.`

Hash mismatch:
- Title: `Proof file changed`
- Body: `The file no longer matches the upload record. Recapture or retry from trusted local proof.`

Size blocked:
- Title: `Proof file is too large`
- Body: `Maximum proof asset size is 8 MB. Retake or recapture with supported settings.`

Content blocked:
- Title: `Unsupported proof file type`
- Body: `Use JPEG, PNG, or WebP proof assets only.`

Scope blocked:
- Title: `You cannot upload proof for this delivery`
- Body: `Refresh the delivery or contact support.`

Avoid copy:
- `Delivery complete`
- `Proof public`
- `Storage path`
- `Signed link`
- `Upload to bucket`
- `Ignore and finish`
- `Force complete`

## Error Mapping
`AUTH_REQUIRED`:
- Message: `Sign in again to upload proof.`
- Action: `Sign in`
- State: `server_rejected`

`FORBIDDEN_ROLE`:
- Message: `This account cannot upload proof for this delivery.`
- Action: `Back to proof`
- State: `scope_blocked`

`ASSIGNMENT_SCOPE_VIOLATION`:
- Message: `This proof is no longer assigned to your account.`
- Action: `Refresh delivery`
- State: `scope_blocked`

`DELIVERY_NOT_FOUND`:
- Message: `Delivery record was not found.`
- Action: `Back to assignments`
- State: `server_rejected`

`INVALID_STATUS_TRANSITION`:
- Message: `This delivery cannot accept proof from its current status.`
- Action: `Refresh delivery`
- State: `status_blocked`

`FINAL_PROOF_REQUIRED`:
- Message: `Upload and confirm proof before completing delivery.`
- Action: `Continue upload`
- State: `ready_to_create_intent`

`VALIDATION_ERROR` during create:
- Message: `Check proof type, size, and file format.`
- Action: `Review proof`
- State: `server_rejected`

`VALIDATION_ERROR` during confirm:
- Message: `Proof upload did not match the reserved record.`
- Action: `Try again`
- State: `server_rejected`

`ROUTE_NOT_ENABLED` with `missing_proof_storage_gateway`:
- Message: `Proof upload storage is not available.`
- Action: `Open support`
- State: `storage_unavailable`

`PROVIDER_TIMEOUT`:
- Message: `Storage took too long to respond.`
- Action: `Try again`
- State: `network_error`

`UNKNOWN_INTERNAL_ERROR`:
- Message: `Kra could not upload this proof right now.`
- Action: `Try again`
- State: `server_rejected`

Signed URL expired:
- Message: `The secure upload link expired.`
- Action: `Create new upload link`
- State: `upload_expired`

Storage `PUT` failure:
- Message: `Proof file did not upload.`
- Action: `Try again`
- State: `upload_put_failed`

## Offline Behavior
Offline before create intent:
- Block upload.
- Show offline state.
- If secure retention is allowed, offer `Keep proof for later`.
- If secure retention is not allowed, prompt recapture when online.

Offline after local capture:
- Host may keep local proof in encrypted storage only.
- Modal should show retention timer if available.
- Do not mark proof uploaded.

Offline after intent created:
- Signed URL may expire while offline.
- Do not queue storage `PUT` unless host can guarantee URL validity at replay time.
- Prefer new intent after reconnect.

Offline after storage upload but before confirm:
- This is uncertain state.
- Host should attempt confirm when online if URL and proof asset are still valid.
- If confirm says expired or mismatch, create a new intent from trusted local evidence.

Queued behavior:
- Queue only upload preparation or confirm retry when host has exact stage and secure local proof.
- Do not queue final delivery completion from this modal.

## Privacy And Security
Never show to user:
- Signed upload URL.
- Storage bucket.
- Object path.
- Full hash.
- Storage generation.
- Internal proof storage errors.

Never send to analytics:
- Signed upload URL.
- Storage bucket.
- Object path.
- Hash.
- Local file URI.
- Image bytes.
- Thumbnail URI.
- Receiver name.
- Receiver phone.
- Receiver address.
- Proof image data.

Local proof handling:
- Local proof must be cleared after delivery completion.
- If upload confirmed but completion not yet done, host may keep only proof asset ID and safe status.
- Signed URL must be memory-only.
- Crash reports must redact file URI and proof bytes.
- Logs must include proof asset ID only when safe and necessary.

Retention:
- Proof images and signatures follow the product retention policy: `180 days` unless tied to active dispute, then `24 months`.
- This modal does not implement retention; it must not promise deletion timing beyond policy copy.

## Accessibility Requirements
Dialog:
- Use `role="dialog"`.
- Use `aria-modal="true"`.
- Title labels the modal.
- Description points to upload-stage explanation.
- Background is inert.

Focus:
- Initial focus on title in review state.
- Progress start announces current stage.
- Failure moves focus to failure title.
- Confirmed state moves focus to `Proof uploaded`.
- Close returns focus to triggering upload button.

Keyboard:
- Tab loop inside modal.
- Escape closes only before upload starts or after confirmed state.
- Escape disabled during storage `PUT` unless host supports abort.
- Enter triggers primary only when valid.

Status:
- Use live region for upload stage changes.
- Progress should expose `aria-valuenow` when determinate.
- Indeterminate progress should announce stage text.
- Error messages must identify failed stage.

Touch:
- Retry, cancel, support, recapture, and use-proof actions meet touch target minimum.
- Avoid tiny icon-only cancel while upload is active.

Motion:
- Use restrained progress animation.
- Honor reduced-motion preference.
- Do not loop decorative animation.

## Responsive Behavior
Compact phone:
- Full-height or `90vh` sheet.
- Sticky footer.
- Upload rail vertical.
- Preview small and optional.

Large phone:
- Rail and preview can sit together.
- Recovery panel remains above footer.

Tablet:
- Centered modal.
- Two-column layout allowed: preview left, rail right.

Desktop shell:
- Centered modal.
- Progress and details grouped.
- Footer right-aligned.

Large text:
- Modal scrolls.
- Upload rail labels wrap.
- Footer remains reachable.

## Component Anatomy
Required:
- `UploadProofModalRoot`
- `UploadProofHeader`
- `UploadProofAssetSummary`
- `UploadProofSecureNotice`
- `UploadProofStepRail`
- `UploadProofProgress`
- `UploadProofErrorPanel`
- `UploadProofOfflinePanel`
- `UploadProofConfirmedPanel`
- `UploadProofActionFooter`

Optional:
- `UploadProofSafeThumbnail`
- `UploadProofRetentionNotice`
- `UploadProofRecoveryActions`
- `UploadProofDebugDetails` for non-production QA only, hidden from user builds.

Responsibilities:
- Root handles focus, inert background, and close rules.
- Header explains proof upload purpose.
- Asset summary shows safe proof type and metadata.
- Secure notice explains upload before completion.
- Step rail visualizes prepare/reserve/upload/confirm.
- Progress reports upload state.
- Error panel maps stage-specific recovery.
- Offline panel explains blocked or retained local evidence.
- Confirmed panel returns proof reference to host.
- Footer owns primary and recovery actions.

## Host Integration
`CourierSignatureProof` host:
- Opens modal after signature image is accepted.
- Passes `proofType=signature`.
- Passes signer name outside modal for later completion.
- On proof ready, enables completion with `proofType=signature` and `proofReference=PFA-*`.
- Clears local signature after delivery completion.

`CourierPhotoProof` host:
- Opens modal after photo is accepted.
- Passes `proofType=delivery_photo`.
- On proof ready, enables completion with `proofType=delivery_photo` and `proofReference=PFA-*`.
- Clears local photo after delivery completion.

Station pickup completion host:
- Opens modal only when station operator is completing `awaiting_receiver_pickup` with allowed signature/photo proof.
- Passes `proofContext=station_pickup`.
- Must ensure station scope before opening.

`OpsActionRecovery` host:
- Opens modal for expired upload, failed confirm, or completion blocked by missing proof asset upload.
- Must pass recovery stage.

`OpsOfflineOutbox` host:
- Shows queued proof preparation or confirm retry.
- Must not expose signed URL.

## Query And Cache Invalidation
After create intent:
- Invalidate or update `ProofAsset` cache.
- Do not invalidate delivery yet.

After upload confirmed:
- Update `ProofAsset` cache to `uploaded`.
- Do not mark delivery delivered.
- Host may enable completion.

After completion in parent screen:
- Invalidate `Delivery`.
- Invalidate `DeliveryTimeline`.
- Invalidate `CourierQueue`.
- Mark proof asset attached if backend response or completion path confirms it.

After failure:
- Preserve local proof only if secure policy allows.
- Clear signed URL when expired or closed.
- Do not keep stale upload URL in cache.

## Analytics
Events:
- `upload_proof_modal_opened`
- `upload_proof_asset_reviewed`
- `upload_proof_hash_started`
- `upload_proof_hash_failed`
- `upload_proof_intent_started`
- `upload_proof_intent_created`
- `upload_proof_put_started`
- `upload_proof_put_progress`
- `upload_proof_put_failed`
- `upload_proof_link_expired`
- `upload_proof_confirm_started`
- `upload_proof_confirmed`
- `upload_proof_blocked`
- `upload_proof_recapture_selected`
- `upload_proof_support_opened`
- `upload_proof_modal_closed`

Allowed properties:
- `deliveryId`
- `proofAssetId` after create
- `proofType`
- `contentType`
- `byteSize`
- `stage`
- `isOnline`
- `sourceScreen`
- `blockReason`
- `durationMs`

Forbidden properties:
- signed URL
- bucket
- object path
- hash
- storage generation
- local URI
- image bytes
- thumbnail URI
- receiver fields

## Testing Requirements
Unit tests:
- Renders signature upload title.
- Renders photo upload title.
- Blocks unsupported proof type.
- Blocks unsupported content type.
- Blocks zero byte size.
- Blocks size above `8_000_000`.
- Computes hash state when no hash provided.
- Calls create intent with exact contract fields.
- Calls storage `PUT` with signed URL and content type through adapter.
- Calls confirm upload with byte size and hash.
- Returns proof ready only after confirm success.
- Clears signed URL on close.
- Does not call completion.

Integration tests:
- Signature proof host opens modal and receives `PFA-*`.
- Photo proof host opens modal and receives `PFA-*`.
- Expired URL requests new intent.
- Storage unavailable routes support.
- Confirm hash mismatch routes recapture/retry.
- Offline before intent blocks upload.
- Offline after capture offers secure retention only when allowed.
- Action recovery resumes confirm when safe.

Accessibility tests:
- Dialog has accessible title and description.
- Progress stages are announced.
- Determinate progress exposes value.
- Error panel receives focus.
- Confirmed panel receives focus.
- Escape behavior matches upload stage.
- Large text keeps actions reachable.

Security tests:
- Signed URL never appears in rendered text.
- Bucket and object path never appear in rendered text.
- Analytics omit signed URL, hash, object path, and local URI.
- Crash/log adapter redaction tests cover upload failures.

End-to-end tests:
- `e2e-courier-uploads-signature-proof`
- `e2e-courier-uploads-photo-proof`
- `e2e-proof-upload-expired-intent-recovery`
- `e2e-proof-upload-confirm-mismatch-blocks-completion`
- `e2e-proof-upload-does-not-complete-delivery`
- `e2e-station-pickup-proof-upload-scope`

Contract tests:
- Create request matches `createProofAssetUploadRequestSchema`.
- Confirm request matches `confirmProofAssetUploadRequestSchema`.
- Maximum file size is enforced.
- Supported content types only.
- `proofReference` must be `PFA-*`.
- Completion is blocked until proof asset status is `uploaded`.

## Acceptance Criteria
Functional:
- Modal uploads signature and delivery-photo proof assets.
- Modal validates size, type, and hash.
- Modal creates intent before storage upload.
- Modal confirms upload after storage `PUT`.
- Modal returns `PFA-*` proof reference.
- Modal never marks delivery complete.
- Modal supports retry and recapture for failed stages.
- Modal blocks unsafe offline upload.

UX:
- User understands upload is required before completion.
- User sees current upload stage.
- User gets one clear recovery action on failure.
- User never sees storage internals.
- Modal works under low bandwidth and interruption.

Security:
- Signed URL is memory-only.
- Proof bytes and local URI are never logged or analyzed.
- Storage internals are hidden.
- Proof evidence is cleared or retained only under secure host policy.

Accessibility:
- Modal focus and status behavior are correct.
- Upload progress is announced.
- Error states are identifiable.
- Touch controls meet size requirements.

## Implementation Notes For Claude Code
Build this as a shared operational modal consumed by proof child screens.

Recommended ownership:
- `apps/mobile/src/features/ops/components/UploadProofModal.tsx`
- `apps/mobile/src/features/ops/components/uploadProofState.ts`
- `apps/mobile/src/features/ops/components/__tests__/UploadProofModal.test.tsx`
- Host adapters in `CourierSignatureProof`, `CourierPhotoProof`, and station pickup completion when implemented.

Implementation sequence:
1. Create proof upload state machine.
2. Create validation helpers for type, size, hash, and expiry.
3. Build pure modal UI.
4. Add host create-intent callback.
5. Add storage `PUT` adapter integration.
6. Add confirm-upload callback.
7. Add recovery states.
8. Add redacted analytics.
9. Add tests for contract, accessibility, and security.

Do not implement:
- Proof capture.
- Media editor.
- Public proof viewer.
- Delivery completion inside modal.
- Storage bucket display.
- Signed URL display.
- Long-term local proof retention.
- New proof asset status endpoint.

## Open Backend Gaps
Gap: no proof asset status read endpoint.
- Product impact: recovery after app restart may need timeline/detail inference or action recovery.
- UI decision: host must retain enough safe local state or require recapture.
- Future owner: proof asset read projection.

Gap: no direct upload progress from backend.
- Product impact: progress is client adapter only.
- UI decision: show determinate progress only when adapter supports it.
- Future owner: upload adapter layer.

Gap: create intent may leave pending proof asset if upload expires.
- Product impact: backend cleanup policy must handle abandoned pending assets.
- UI decision: create new intent after expiry and do not reuse expired URL.
- Future owner: proof asset cleanup job.

Gap: station pickup proof host is policy-allowed but not necessarily implemented everywhere.
- Product impact: modal must support station context without assuming it is live in all screens.
- UI decision: expose station scope fields but let host decide entry availability.
- Future owner: station pickup completion screen.

## Quality Bar
This modal is complete when:
- It uses the exact proof asset contracts.
- It hides signed storage internals.
- It handles expiry and retry safely.
- It blocks completion until backend upload confirmation.
- It avoids offline truth gaps.
- It supports signature and photo proof without duplicating capture screens.
- It is accessible and field-ready.

## Final Handoff Summary
Build `UploadProofModal` as the shared proof asset upload modal for signature and delivery-photo proof. It validates local asset metadata, creates a backend `PFA-*` upload intent, uploads to the signed URL without exposing storage internals, confirms byte size and hash with the backend, returns the uploaded proof reference to the host, and never completes delivery itself.

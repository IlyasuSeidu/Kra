# CourierPhotoProof Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierPhotoProof` |
| Route | `/(ops)/courier/assignments/:deliveryId/proof/photo` |
| Primary test ID | `screen-courier-photo-proof` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `complete_delivery` |
| Offline critical | Yes for cached guidance and secure captured-photo recovery; no for delivered state until backend confirms upload and completion |
| Required role | `final_mile_courier` |
| Required capability | `complete_delivery_with_proof` |
| Required delivery status | `out_for_delivery` or controlled recovery from `assigned_for_final_mile` |
| Required custody | Current courier must hold final-mile custody |
| Previous workflow | `/(ops)/courier/assignments/:deliveryId/proof` or `/(ops)/courier/assignments/:deliveryId/proof/otp` |
| Success workflow | `/(ops)/courier/assignments/:deliveryId/completed` when implemented, otherwise assignment detail with delivered state |
| Recovery workflows | `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/proof/otp`, `/(ops)/courier/assignments/:deliveryId/proof/signature`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Delivery-photo fallback proof capture, proof asset upload, upload confirmation, and delivery completion with `proofType=delivery_photo` |

## Product Job
`CourierPhotoProof` lets the final-mile courier complete delivery with delivery-photo fallback when OTP cannot be completed, signature is not the chosen fallback, and photo proof is valid for the handoff.

It answers twelve operational questions:

- `Is photo fallback allowed for this delivery?`
- `Why is OTP not being used?`
- `Is the receiver or approved handoff context present?`
- `What should be visible in the photo?`
- `Is the photo clear, well lit, and tied to the correct delivery?`
- `Does the photo avoid unnecessary private information?`
- `Was the photo captured fresh in this flow?`
- `Was the photo uploaded and confirmed?`
- `Can the app complete delivery now?`
- `What happens if camera permission is denied?`
- `What happens if upload expires or network drops?`
- `When should the courier record a failed attempt instead?`

The screen must make photo proof useful for dispute resolution without encouraging couriers to photograph people, IDs, private interiors, or wrong locations.

## Product Standard
This screen is a guarded photo fallback proof workflow.

The courier should be able to:

- Verify delivery identity and custody.
- See that photo is fallback proof.
- Confirm the reason OTP cannot be completed.
- Capture a fresh proof photo.
- Review photo quality before upload.
- Retake photo if it is blurry, dark, or missing context.
- Upload the photo as a backend proof asset.
- Confirm upload before completion.
- Complete delivery with `proofType=delivery_photo`.
- Recover if camera permission, upload, confirm upload, or completion fails.
- Choose OTP, signature, failed attempt, or support when photo is not valid.

The screen must never:

- Treat photo as default proof.
- Complete without a photo asset.
- Complete before upload confirmation succeeds.
- Use `proofType=signature` or `proofType=otp`.
- Use a signature proof asset in this flow.
- Upload from public gallery unless policy explicitly allows it.
- Reuse an older local photo.
- Show signed upload URLs.
- Show storage bucket or object path in courier UI.
- Store proof photo in public media library.
- Photograph receiver ID unless a separate restricted-item policy exists.
- Encourage face photos when handoff context is enough.
- Mark delivered while offline.
- Hide failed attempt when receiver is absent, address is wrong, or location is unsafe.

## Audience
Primary audience:

- Final-mile couriers completing a valid delivery-photo fallback handoff.

Secondary audience:

- Receivers or representatives who need to understand why a photo is being taken.
- Support staff reviewing photo proof disputes.
- QA validating photo capture, upload, and completion.
- Security reviewers validating sensitive photo handling.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may open this screen:

- From `CourierProofCapture` after choosing photo fallback.
- From `CourierOtpCompletion` after OTP cannot be completed.
- From action recovery after a prior photo upload or completion failed.
- When receiver is present but OTP is unavailable and signature is not appropriate.
- When support approves photo proof as the fallback method.
- While online near the receiver location.
- While briefly offline after photo capture, before upload.
- After camera permission denial or recovery.
- After upload intent expiration.

The courier may be outdoors, in a hallway, by a gate, inside a station compound, or near the receiver. The screen must provide photo guidance that is specific enough to prevent bad evidence while staying fast in the field.

## Design Brief
User and job:

- A courier needs to capture a valid delivery-photo fallback proof and complete delivery only after the photo asset is uploaded and confirmed.

Surface type:

- Mobile camera capture, proof review, upload, and completion workflow.

Primary action:

- Capture and submit delivery photo proof.

Visual thesis:

- `Evidence camera`: a field camera flow with clear framing guidance, privacy boundaries, upload chain visibility, and strong recovery exits.

Restraint rule:

- Do not build a general camera gallery, customer album, or media editor. Capture only the delivery proof needed for this handoff.

Density:

- Balanced. The camera preview needs space, but proof rules and upload state must remain visible.

Platform stance:

- Native-plus camera flow with large capture controls, explicit retake, accessible status, secure local recovery, and no photo leakage.

## External Research Used
Only directly relevant links were used:

- [DoorDash delivery drop-off photos](https://help.doordash.com/en-us/dashers/article/confirming-delivery-drop-off-photos): supports requiring a high-quality proof photo before completion, including surrounding features, avoiding blur, and using light or flash when needed.
- [Uber Direct proof of delivery](https://developer.uber.com/docs/deliveries/guides/proof-of-delivery): supports picture as a proof-of-delivery method and warns that photo proof can be unintuitive for meet-at-door flows when not policy-appropriate.
- [Android CameraX capture image](https://developer.android.com/media/camera/camerax/take-photo?hl=en): supports high-quality photo capture with `ImageCapture`, file or in-memory output, and executor-backed callbacks.
- [Android CameraX photo options](https://developer.android.com/media/camera/camerax/take-photo/options?hl=en): supports capture modes, flash controls, and JPEG output guidance relevant to low-light field proof.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached reads and local write recovery while keeping backend state authoritative.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible capture, upload, offline, and completion status updates without unexpected focus movement.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large capture, flash, retake, upload, and completion controls.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through camera permission, guidance, capture, review, upload, completion, and recovery actions.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/11-courier-signature-proof.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/05-ops-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/06-ops-action-recovery.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/04-features/doorstep-delivery-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/app.ts`
- `services/api/src/proof-assets.ts`
- `services/api/src/handoffs.ts`

## Backend And Integration Context
Primary read:

- `GET /v1/deliveries/:id` through `get_delivery`.

Mutation sequence:

1. `POST /v1/deliveries/:id/proof-assets`
2. `PUT` encoded photo to signed upload URL returned by backend storage gateway
3. `POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload`
4. `POST /v1/deliveries/:id/complete`

Route keys:

- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `complete_delivery`

Required capability:

- `complete_delivery_with_proof`

Create proof asset request:

```json
{
  "proofType": "delivery_photo",
  "contentType": "image/jpeg",
  "byteSize": 512000,
  "sha256": "64-lowercase-hex-characters"
}
```

Confirm proof asset upload request:

```json
{
  "byteSize": 512000,
  "sha256": "64-lowercase-hex-characters",
  "storageGeneration": "provider-generation"
}
```

Complete delivery request:

```json
{
  "proofType": "delivery_photo",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Proof asset constraints:

- `proofType` must be `delivery_photo`.
- Content type must be `image/jpeg`, `image/png`, or `image/webp`.
- Byte size must be positive and no more than `8_000_000`.
- Optional pre-upload hash must be lowercase SHA-256 hex.
- Upload intent expires after `15 minutes`.
- Upload must be confirmed before completion.
- `/complete` rejects photo proof unless `PFA-*` asset is `uploaded` or `attached`.
- Asset must belong to the same delivery.
- Asset type must match `delivery_photo`.

Current backend gap:

- Doorstep policy requires `proof_fallback_reason`, receiver name, completion timestamp, GPS or unavailable-location attestation.
- Current `completeDeliveryRequestSchema` accepts only `proofType`, `proofReference`, and `receivedByName`.
- The UI must collect fallback reason and location state locally for future-compatible handoff, but must not claim backend persistence until the contract supports it.

## Lifecycle Semantics
Normal entry expects:

```text
currentStatus=out_for_delivery
currentCustodyRole=final_mile_courier
currentCustodyActorId=current courier
assignedFinalMileCourierId=current courier
paymentStatus=paid
doorstepRequested=true
fallbackReason selected or required on this screen
```

Successful photo completion:

- Captures fresh proof photo.
- Creates proof asset upload intent.
- Uploads photo to signed URL.
- Confirms upload with byte size, SHA-256, and optional storage generation.
- Calls `/complete` with `proofType=delivery_photo` and `proofReference=PFA-*`.
- Backend creates `delivery_completed`.
- Backend creates `delivery_completion` handoff event.
- Backend attaches proof asset.
- Backend clears active custody.
- UI routes to delivered state.

Blocked completion:

- No fresh photo.
- Photo is blurry, too dark, or missing handoff context.
- Fallback reason missing.
- Receiver name missing.
- Upload not confirmed.
- Upload intent expired.
- Courier lacks custody.
- Delivery already delivered.
- Delivery entered issue review.
- Camera permission denied.
- Network unavailable during upload or completion.

## Fallback Policy
Photo proof is allowed only when:

- OTP cannot be completed.
- Signature is unavailable, inappropriate, or support-approved not to use.
- Receiver or approved handoff context is present.
- The photo shows the package handoff or package at the agreed delivery point.
- The image includes enough surrounding context to resolve disputes.
- Courier still has custody.
- Completion happens only after upload confirmation.

Photo proof is not allowed when:

- Receiver is absent and no policy authorizes leaving the package.
- Address cannot be found.
- Location is unsafe.
- Receiver refuses package.
- Package condition is disputed before handoff.
- Courier wants a faster path than OTP without valid reason.
- Courier wants to use an old photo.
- Courier wants to photograph private ID or face without restricted-item policy.

Fallback reason requirement:

- If route state includes a reason from `CourierProofCapture`, show it and allow edit before capture.
- If missing, require a reason before enabling camera capture.
- Reasons that imply failed delivery must route to failed attempt, not photo proof.

Allowed fallback reasons:

- `receiver_cannot_access_otp`
- `receiver_phone_unavailable`
- `receiver_verified_in_person`
- `otp_network_blocked`
- `other_support_approved`

Route away reasons:

- Receiver not present.
- Address not found.
- Unsafe to complete.
- Receiver refused.
- Package issue detected.

## Photo Quality Policy
Required photo qualities:

- Package or handoff context is visible.
- Surrounding delivery-point features are visible.
- Image is not blurry.
- Image is well lit or flash-assisted.
- Image is captured during this proof flow.
- Photo is tied to the active delivery.
- Photo avoids private interiors where possible.
- Photo avoids faces unless unavoidable and policy-approved.
- Photo avoids IDs, payment cards, and unrelated personal documents.

Rejected photo qualities:

- Only a wall, floor, bag corner, or dark image.
- Package not visible.
- Wrong address context.
- Old image from gallery.
- Image taken before arrival.
- Image containing unnecessary private documents.
- Image where receiver clearly refused being photographed.

Local quality checks:

- Minimum dimensions after processing.
- Byte size below backend maximum.
- Basic blur or focus check if available.
- Low-light warning if image appears too dark.
- Confirm retake if package or location context is not visible.

## Information Architecture
The screen has eleven zones:

1. Status header.
2. Delivery identity strip.
3. Fallback reason card.
4. Photo guidance card.
5. Camera permission gate.
6. Camera capture surface.
7. Photo review panel.
8. Upload and completion progress.
9. Fallback and failed-attempt exits.
10. Offline and recovery panel.
11. Recovery footer.

### Zone 1: Status Header
Purpose:

- Orient the courier before sensitive proof capture.

Content:

- Back control.
- Screen title: `Photo proof`.
- Delivery reference.
- Status chip.
- Custody chip.
- Network chip.

Test IDs:

- `courier-photo-header`
- `courier-photo-back-action`
- `courier-photo-status-chip`
- `courier-photo-custody-chip`
- `courier-photo-network-chip`

Rules:

- Header must show `Fallback proof`.
- Header must show blocked state before camera controls.
- Header must not expose `PFA-*`, signed URL, bucket, or object path.

### Zone 2: Delivery Identity Strip
Purpose:

- Prevent wrong-delivery photo capture.

Content:

- Delivery ID.
- Safe tracking code or short delivery reference.
- Package summary.
- Receiver display name.
- Latest status timestamp.

Test IDs:

- `courier-photo-delivery-id`
- `courier-photo-tracking-code`
- `courier-photo-package-summary`
- `courier-photo-receiver-name`
- `courier-photo-latest-timestamp`

Rules:

- Do not show package scan code.
- Do not show proof asset object path.
- Do not show full receiver phone.

### Zone 3: Fallback Reason Card
Purpose:

- Make the exception reason explicit before camera capture.

Content:

- Current reason label.
- Explanation: `Photo is fallback proof because OTP could not be completed.`
- Edit action.

Test IDs:

- `courier-photo-fallback-reason-card`
- `courier-photo-fallback-reason-label`
- `courier-photo-edit-reason-action`

Behavior:

- If reason is missing, show reason selector before camera.
- If selected reason requires failed attempt, route to failed attempt.
- Completion remains disabled until valid fallback reason exists.

### Zone 4: Photo Guidance Card
Purpose:

- Tell the courier what to capture and what to avoid.

Content:

- `Show the package and handoff location.`
- `Include nearby door, gate, landmark, or agreed drop point.`
- `Avoid faces, IDs, payment cards, and private documents.`
- `Retake if blurry or dark.`

Test IDs:

- `courier-photo-guidance-card`
- `courier-photo-guidance-package`
- `courier-photo-guidance-surroundings`
- `courier-photo-guidance-privacy`
- `courier-photo-guidance-quality`

Visual behavior:

- Guidance sits above camera preview.
- Use concise bullets.
- Keep privacy warning visible before capture.

### Zone 5: Camera Permission Gate
Purpose:

- Handle camera access before proof capture.

States:

- `permission_unknown`
- `permission_granted`
- `permission_denied`
- `permission_blocked`
- `camera_unavailable`

Test IDs:

- `courier-photo-permission-gate`
- `courier-photo-request-camera-action`
- `courier-photo-open-settings-action`
- `courier-photo-camera-unavailable-state`

Rules:

- Ask for camera permission only after showing why it is needed.
- If denied, explain recovery and provide settings path.
- If camera unavailable, route to signature fallback, failed attempt, or support.
- Do not allow gallery fallback unless policy explicitly allows it.

### Zone 6: Camera Capture Surface
Purpose:

- Capture fresh delivery photo.

Component requirements:

- Full-width camera preview.
- Large capture button.
- Flash toggle.
- Reticle or framing hint.
- Camera unavailable state.
- Orientation-safe preview.
- Capture uses camera lifecycle correctly.
- Capture avoids storing photo in public library.

Test IDs:

- `courier-photo-camera-preview`
- `courier-photo-capture-action`
- `courier-photo-flash-toggle`
- `courier-photo-framing-hint`
- `courier-photo-camera-error`

Instruction copy:

- `Frame the package and delivery point.`

Do not:

- Open public gallery by default.
- Capture silently.
- Capture while delivery state is blocked.
- Complete from camera preview without review.
- Store image bytes in analytics.

### Zone 7: Photo Review Panel
Purpose:

- Confirm photo quality before upload.

Content:

- Photo preview.
- Delivery reference.
- Receiver name field if not already collected.
- Fallback reason.
- Quality checklist.
- Privacy note.

Actions:

- `Retake photo`
- `Upload photo proof`

Test IDs:

- `courier-photo-review-panel`
- `courier-photo-preview`
- `courier-photo-received-by-field`
- `courier-photo-quality-checklist`
- `courier-photo-retake-action`
- `courier-photo-upload-action`

Quality checklist:

- `Package visible`
- `Delivery point visible`
- `Image clear`
- `Image well lit`
- `No unnecessary private information`

Rules:

- Upload is disabled until required checklist is accepted or automated checks pass.
- Retake clears only current photo, not delivery context.
- Preview must not expose signed upload URL.

### Zone 8: Upload And Completion Progress
Purpose:

- Make the proof asset sequence visible.

Progress steps:

1. `Preparing photo proof`
2. `Uploading photo`
3. `Confirming upload`
4. `Completing delivery`
5. `Delivered`

Test IDs:

- `courier-photo-progress-panel`
- `courier-photo-progress-prepare`
- `courier-photo-progress-upload`
- `courier-photo-progress-confirm`
- `courier-photo-progress-complete`
- `courier-photo-progress-delivered`

Rules:

- Show signed upload expiry only as safe relative text if useful.
- Do not show signed URL.
- Do not show bucket or object path.
- If upload expires, show recovery.
- If confirm upload succeeds but complete fails, keep proof asset reference in secure local recovery state.
- If complete succeeds, clear local photo evidence.

### Zone 9: Fallback And Failed-Attempt Exits
Purpose:

- Prevent forced photo proof when another path is safer.

Actions:

- `Try OTP instead`
- `Use signature instead`
- `Record failed attempt`
- `Contact support`

Routes:

- `/(ops)/courier/assignments/:deliveryId/proof/otp`
- `/(ops)/courier/assignments/:deliveryId/proof/signature`
- `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- `/(ops)/courier/issues?deliveryId=:deliveryId`

Test IDs:

- `courier-photo-try-otp-action`
- `courier-photo-use-signature-action`
- `courier-photo-failed-attempt-action`
- `courier-photo-support-action`

Rules:

- Failed attempt remains visible before upload.
- During upload, exits move to recovery mode.
- If receiver refuses photo, route to signature, failed attempt, or support according to context.

### Zone 10: Offline And Recovery Panel
Purpose:

- Preserve sensitive photo evidence safely during network problems.

Offline states:

- `offline_before_capture`
- `offline_after_capture`
- `offline_during_upload`
- `unknown_upload_result`
- `unknown_completion_result`

Test IDs:

- `courier-photo-offline-panel`
- `courier-photo-outbox-link`
- `courier-photo-action-recovery-link`

Rules:

- Offline before capture can show guidance but should warn upload requires network.
- Offline after capture may preserve encrypted local photo evidence only if secure storage exists.
- Offline during upload must not show delivered.
- Unknown upload result must verify proof asset status before retry.
- Unknown completion result must refresh delivery state before retry.

### Zone 11: Recovery Footer
Purpose:

- Keep repair actions available without clutter.

Actions:

- `Refresh delivery`
- `Resume photo upload`
- `Open action recovery`
- `Back to proof options`

Test IDs:

- `courier-photo-refresh-action`
- `courier-photo-resume-upload-action`
- `courier-photo-recovery-footer`
- `courier-photo-proof-options-link`

Rules:

- Recovery footer is compact in normal capture.
- Recovery footer becomes prominent in expired, failed, conflict, and unknown-result states.

## State Matrix
### Loading State
Trigger:

- Delivery detail fetch is pending and no cache exists.

UI:

- Header skeleton.
- Identity skeleton.
- Camera controls disabled.

Test IDs:

- `courier-photo-loading-state`

### Missing Fallback Reason State
Trigger:

- Route lacks valid fallback reason.

UI:

- Reason selector.
- Camera disabled.
- Failed attempt visible.

Test IDs:

- `courier-photo-missing-reason-state`

### Permission Needed State
Trigger:

- Camera permission has not been granted.

UI:

- Explain why camera is needed.
- Show permission CTA.
- Show non-camera exits.

Test IDs:

- `courier-photo-permission-needed-state`

### Permission Denied State
Trigger:

- Camera permission denied or blocked.

UI:

- Explain recovery.
- Offer settings, signature fallback, failed attempt, support.

Test IDs:

- `courier-photo-permission-denied-state`

### Ready To Capture State
Trigger:

- Eligible delivery, valid fallback reason, camera permission granted, online or capture-safe offline state.

UI:

- Camera preview.
- Guidance.
- Capture action.
- Flash toggle.

Test IDs:

- `courier-photo-ready-state`

### Capturing State
Trigger:

- User taps capture and camera is processing.

UI:

- Disable capture.
- Show capture progress.

Test IDs:

- `courier-photo-capturing-state`

### Review State
Trigger:

- Photo captured locally.

UI:

- Photo preview.
- Quality checklist.
- Retake.
- Upload CTA.

Test IDs:

- `courier-photo-review-state`

### Quality Error State
Trigger:

- Photo fails manual or automated quality check.

UI:

- Explain issue.
- Retake is primary.

Copy:

- `Retake the photo so the package and delivery point are clear.`

Test IDs:

- `courier-photo-quality-error-state`

### Upload Intent State
Trigger:

- App is creating proof asset upload intent.

UI:

- Progress step `Preparing photo proof`.

Test IDs:

- `courier-photo-upload-intent-state`

### Uploading State
Trigger:

- App is uploading encoded photo to signed URL.

UI:

- Progress step `Uploading photo`.

Test IDs:

- `courier-photo-uploading-state`

### Confirming Upload State
Trigger:

- Upload finished and app is calling confirm upload.

UI:

- Progress step `Confirming upload`.

Test IDs:

- `courier-photo-confirming-state`

### Completing State
Trigger:

- Upload confirmed and app is calling `/complete`.

UI:

- Progress step `Completing delivery`.
- Do not allow duplicate completion.

Test IDs:

- `courier-photo-completing-state`

### Delivered State
Trigger:

- `/complete` returns success.

UI:

- Delivered confirmation.
- Completion timestamp.
- Route to completed workflow.

Test IDs:

- `courier-photo-delivered-state`

### Upload Expired State
Trigger:

- Signed URL or upload intent expires before confirm upload.

UI:

- Explain expiry.
- Offer create new upload intent from secure local photo if still valid.
- Offer retake if local evidence cannot be trusted.

Test IDs:

- `courier-photo-upload-expired-state`

### Offline State
Trigger:

- Network unavailable.

UI:

- Preserve local photo only in secure storage.
- Completion disabled.
- Link to outbox or recovery.

Test IDs:

- `courier-photo-offline-state`

### Backend Conflict State
Trigger:

- Delivery state changes during capture or upload.

UI:

- Stop completion.
- Preserve evidence for support if safe.
- Refresh and route to recovery.

Examples:

- Delivery delivered elsewhere.
- Delivery reassigned.
- Custody changed.
- Issue review started.

Test IDs:

- `courier-photo-conflict-state`

### Blocked By Custody State
Trigger:

- Current courier does not hold final-mile custody.

UI:

- Disable camera and completion.
- Route to action recovery.

Test IDs:

- `courier-photo-blocked-custody-state`

### Account Permission Denied State
Trigger:

- User lacks `complete_delivery_with_proof`.

UI:

- Disable camera and completion.
- Offer support.

Test IDs:

- `courier-photo-account-permission-denied-state`

### Already Delivered State
Trigger:

- Delivery status is `delivered` or final proof exists.

UI:

- Remove camera controls.
- Show delivered summary.

Test IDs:

- `courier-photo-already-delivered-state`

### Error State
Trigger:

- Read, camera, upload, confirm, or completion fails.

UI:

- Show safe error.
- Offer specific retry from last safe step.
- Offer support.

Test IDs:

- `courier-photo-error-state`

## Navigation Rules
Entry route:

- `/(ops)/courier/assignments/:deliveryId/proof/photo`

Back behavior:

- Back returns to proof selector before photo capture.
- Back after capture asks whether to keep local photo evidence, discard it, or stay.
- Back during upload routes to recovery mode, not silent discard.
- Back after delivered routes to completed workflow.

Forward routes:

- Completed: `/(ops)/courier/assignments/:deliveryId/completed` when available.
- OTP: `/(ops)/courier/assignments/:deliveryId/proof/otp`.
- Signature: `/(ops)/courier/assignments/:deliveryId/proof/signature`.
- Failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`.
- Support: `/(ops)/courier/issues?deliveryId=:deliveryId`.
- Offline outbox: `/(ops)/offline-outbox`.
- Action recovery: `/(ops)/action-recovery`.

Navigation guards:

- Do not leave upload in unknown state without recovery marker.
- Do not start signature fallback while photo upload is in flight.
- Do not complete if route delivery ID does not match proof asset delivery ID.
- Do not complete if proof asset type is not `delivery_photo`.
- Do not let gallery selection bypass fresh-capture rule.

## Visual System Direction
Art direction:

- Serious camera proof, not a social camera.
- Clear framing guidance.
- High-confidence capture and review.
- Upload chain feels auditable.
- Privacy boundaries are visible.

Layout:

- Header and delivery identity at top.
- Reason and guidance above camera.
- Camera preview gets the largest single area.
- Capture and flash controls are thumb reachable.
- Review panel follows capture.
- Failed attempt remains accessible below proof controls.

Color:

- Neutral camera chrome.
- Deep green for confirmed upload and delivered state.
- Amber for fallback, low light, and expiry.
- Red for blocked states.
- Graphite for offline and recovery.

Typography:

- Short camera instructions.
- Strong quality checklist labels.
- No dense policy copy.
- Readable in outdoor light.

Motion:

- Capture shutter feedback is brief.
- Review panel appears after capture.
- Progress steps advance through status changes.
- Reduced-motion users get instant changes.

Do not include:

- Social media filters.
- Beauty effects.
- Photo stickers or annotations.
- Celebration effects.
- Progress that overstates backend state.

## Data Requirements
Required delivery data:

- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `doorstepRequested`
- `receiver.name`
- `package.description`
- `destinationStationId`
- `currentCustodyRole`
- `currentCustodyActorId`
- `assignedFinalMileCourierId`
- `latestEvent.type`
- `latestEvent.occurredAt`
- `finalProof`

Required local data:

- Current user ID.
- Role.
- Capabilities.
- Network status.
- Cache timestamp.
- Fallback reason.
- Receiver name.
- Camera permission state.
- Captured image URI or secure buffer reference.
- Encoded photo byte size.
- SHA-256 hash.
- Proof asset ID after upload intent.
- Upload expiry timestamp.
- Upload confirmation state.
- Idempotency keys for each mutation step.

Forbidden data handling:

- Do not persist photo longer than needed.
- Do not write photo to public media library.
- Do not include photo bytes in analytics.
- Do not expose upload URL in logs.
- Do not store bucket or object path in visible UI.
- Do not retain local photo after delivered success.
- Do not collect receiver ID images in this flow.

## API Mapping
Step 1, create proof asset:

```http
POST /v1/deliveries/:id/proof-assets
```

```json
{
  "proofType": "delivery_photo",
  "contentType": "image/jpeg",
  "byteSize": 512000,
  "sha256": "64-lowercase-hex-characters"
}
```

Step 2, upload encoded photo:

```http
PUT <signed upload URL>
```

Step 3, confirm upload:

```http
POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload
```

```json
{
  "byteSize": 512000,
  "sha256": "64-lowercase-hex-characters",
  "storageGeneration": "provider-generation"
}
```

Step 4, complete delivery:

```http
POST /v1/deliveries/:id/complete
```

```json
{
  "proofType": "delivery_photo",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Idempotency:

- Use separate stable idempotency keys for upload intent, upload confirmation, and completion.
- Do not reuse completion key if receiver name or proof asset ID changes.
- Retry from the last known safe step.

## Error Handling
Backend error mapping:

| Backend condition | UI state | Recovery |
| --- | --- | --- |
| `ROUTE_NOT_ENABLED` with `missing_proof_storage_gateway` | Photo proof unavailable | Use OTP, signature if valid, failed attempt, or support |
| `FORBIDDEN` | Permission or custody denied | Refresh, action recovery, support |
| `NOT_FOUND` | Delivery or proof asset not found | Refresh, recover, support |
| `INVALID_STATUS_TRANSITION` | Blocked by status | Route to correct workflow |
| `VALIDATION_ERROR` during upload intent | Invalid asset metadata | Re-encode or retake |
| `VALIDATION_ERROR` during confirm upload | Byte size or hash mismatch | Re-upload from secure local evidence or retake |
| `VALIDATION_ERROR` during completion | Proof asset not uploaded or wrong type | Confirm upload or recover proof asset |
| `PAYMENT_REQUIRED` | Payment not settled | Block completion and support |
| `RATE_LIMITED` | Too many attempts | Wait and retry from safe step |
| Network timeout before upload | Offline | Preserve local evidence if secure |
| Network timeout after upload | Unknown upload result | Confirm status before retry |
| Network timeout after completion | Unknown completion result | Refresh delivery before retry |

Camera error mapping:

| Camera condition | UI state | Recovery |
| --- | --- | --- |
| Permission denied | Permission denied | Open settings, signature, failed attempt, support |
| Camera unavailable | Camera unavailable | Signature, failed attempt, support |
| Capture failed | Camera error | Retry capture |
| Low light | Quality warning | Flash or retake |
| Blur detected | Quality error | Retake |

Do not show:

- Signed upload URL.
- Storage object path.
- SHA-256 value.
- Internal stack trace.
- Receiver phone mismatch details.

## Offline And Sync Rules
Offline before capture:

- Show policy and receiver context.
- Warn upload and completion need network.

Offline after capture:

- Preserve photo only in encrypted app storage if available.
- Show `Upload pending`.
- Link to offline outbox.

Offline during upload:

- Mark state as unknown.
- Retry only after checking whether upload confirmation exists.

Offline after confirm upload:

- Keep `PFA-*` proof reference in secure recovery state.
- Complete only when online.

Offline after completion request:

- Refresh delivery before retry.
- Do not show delivered until backend confirms.

Conflict principle:

- Backend delivery status and custody always win.
- Local photo evidence can help retry only if still tied to the same delivery and proof asset.

## Security And Privacy
Sensitive fields:

- Proof photo.
- Receiver name.
- Receiver phone.
- Delivery address.
- Proof asset ID.
- Signed upload URL.
- GPS state.

Controls:

- Photo stored only in secure app storage before upload.
- Photo deleted after delivered success.
- Signed upload URL kept in volatile state.
- Proof asset ID may be kept only for recovery.
- Logs redact signed URL, storage path, hash, and photo bytes.
- Analytics exclude receiver name and photo data.
- Crash reports exclude form values and photo image.
- Camera capture avoids public media library.

Retention alignment:

- Photo proof follows `180 days` retention unless tied to active dispute, then `24 months`.
- GPS and route snapshots follow `30 days`.
- Delivery summary follows `24 months`.
- Issue and audit history follow `24 months`.

Fraud and privacy risks:

- Courier may photograph wrong location.
- Courier may reuse old image.
- Courier may photograph private documents.
- Receiver may refuse photo.
- Photo may be unreadable.
- Photo may reveal too much personal information.

Mitigations:

- Fresh in-flow capture.
- Quality checklist.
- Fallback reason required.
- Failed attempt visible.
- Support visible.
- Completion only after backend proof asset confirmation.
- Privacy guidance visible before capture.

## Accessibility Requirements
Screen reader:

- Screen title announces as `Photo proof`.
- Fallback reason is announced before camera capture.
- Camera permission state is announced.
- Capture, flash, retake, upload, and completion controls have accessible names.
- Upload progress steps announce as status messages.
- Errors move focus to relevant state title.

Focus order:

1. Back action.
2. Screen title.
3. Delivery identity.
4. Fallback reason.
5. Photo guidance.
6. Camera permission action.
7. Camera preview label.
8. Flash toggle.
9. Capture action.
10. Review photo.
11. Retake.
12. Upload action.
13. Failed attempt.
14. Support.
15. Recovery footer.

Touch and camera:

- Capture button is large and thumb reachable.
- Flash and retake controls are separated.
- Controls do not activate from accidental drags.
- Camera preview does not trap screen reader focus.

Alternatives:

- If camera cannot be used, route to signature proof, failed attempt, or support.
- If receiver refuses photo, route to signature, failed attempt, or support.

Contrast:

- Camera guidance must remain readable over or near preview.
- Error states use labels plus color.

Motion:

- Reduced motion disables shutter and panel transitions.

## Performance Requirements
Initial render:

- Render cached delivery context quickly.
- Load camera module only for this screen.
- Do not load signature drawing module.

Capture:

- Camera preview must start only while screen is focused.
- Release camera when screen blurs or unmounts.
- Use capture settings appropriate for quality and latency.
- Use flash when low-light warning applies.

Upload:

- Compress or resize only within policy and quality limits.
- Compute byte size and hash before upload intent when possible.
- Avoid duplicate encoding.
- Show progress without blocking main thread.

Memory:

- Clear image buffers after delivered success.
- Release large image data when navigating away after discard.

Battery:

- Do not run camera in background.
- Do not run continuous GPS tracking.
- Capture one location state only if completion policy requires it and platform allows.

## Analytics And Observability
Allowed events:

- `courier_photo_screen_viewed`
- `courier_photo_reason_selected`
- `courier_photo_permission_requested`
- `courier_photo_captured`
- `courier_photo_retake_selected`
- `courier_photo_quality_failed`
- `courier_photo_upload_intent_started`
- `courier_photo_upload_succeeded`
- `courier_photo_upload_failed`
- `courier_photo_confirm_succeeded`
- `courier_photo_completion_started`
- `courier_photo_completion_succeeded`
- `courier_photo_completion_failed`
- `courier_photo_failed_attempt_selected`
- `courier_photo_support_selected`

Required event fields:

- `deliveryId`
- `screenId`
- `currentStatus`
- `custodyState`
- `networkState`
- `fallbackReasonCode`
- `proofAssetState`
- `cameraPermissionState`
- `failureCode` when applicable

Forbidden event fields:

- Photo bytes.
- Receiver name.
- Receiver phone.
- Full address.
- Signed upload URL.
- Storage path.
- SHA-256 hash.
- Idempotency key.
- Exact coordinates.

## Testing Requirements
Unit tests:

- Renders root `screen-courier-photo-proof`.
- Shows missing reason state when no fallback reason exists.
- Shows camera permission gate before capture.
- Blocks gallery upload by default.
- Shows quality error for blurry or dark photo state.
- Enables review only after valid fresh capture.
- Creates proof asset with `proofType=delivery_photo`.
- Confirms upload before completion.
- Calls `/complete` with `proofType=delivery_photo` and `proofReference=PFA-*`.
- Does not call `/complete` before upload confirmation.
- Clears local photo after success.
- Blocks completion offline.
- Shows failed attempt exit.

Integration tests:

- From proof selector, selected fallback reason opens photo screen.
- Photo capture, upload intent, upload confirm, and completion succeed in sequence.
- Camera permission denial routes to signature, failed attempt, or support.
- Expired upload intent recovers from secure local photo or asks for retake.
- Hash mismatch routes to re-upload or retake.
- Completion validation error for wrong proof type opens recovery.
- Reassigned delivery blocks capture and completion.
- Already delivered state removes camera controls.
- Offline after capture opens outbox.

Accessibility tests:

- Camera preview has accessible label.
- Capture, flash, retake, and upload controls have accessible names.
- Progress changes announce.
- Focus order remains logical.
- Permission errors move focus to permission state.
- Large text keeps guidance and controls visible.

Security tests:

- Signed upload URL not visible in UI.
- Photo bytes not in analytics.
- Receiver name not in analytics.
- Local photo evidence clears after delivered success.
- Completion request does not include fallback reason until backend supports it.
- Gallery import is not enabled unless policy explicitly allows it.

E2E tests:

- `e2e-courier-completes-with-photo`: courier captures photo, uploads `PFA-*`, confirms upload, completes delivery, and final proof records `delivery_photo`.
- Courier cannot complete if upload confirmation fails.
- Courier cannot complete with signature proof asset on photo route.
- Courier cannot complete another courier's delivery.
- Courier offline after upload sees recovery, not delivered.
- Receiver refusal routes to failed attempt or signature according to policy.

## Acceptance Criteria
Functional acceptance:

- Screen renders at `/(ops)/courier/assignments/:deliveryId/proof/photo`.
- Root element uses `screen-courier-photo-proof`.
- Fallback reason is required.
- Fresh photo capture is required.
- Quality review is required.
- Upload intent uses `proofType=delivery_photo`.
- Upload confirmation completes before delivery completion.
- Completion uses `proofType=delivery_photo`.
- Completion uses backend `PFA-*` proof reference.
- Offline does not show delivered.
- Success routes to delivered workflow.

Policy acceptance:

- Photo is treated as fallback proof only.
- OTP remains preferred where possible.
- Signature remains separate.
- Failed attempt remains available.
- Receiver absence never silently routes to photo completion.
- No cash collection appears.
- UI does not claim fallback reason or GPS are backend-persisted until contract supports them.

Security acceptance:

- Photo proof is sensitive.
- Signed upload URL is hidden.
- Storage path is hidden.
- Photo data is excluded from analytics and crash reports.
- Local photo evidence is cleared after success.
- Proof asset ownership and type are respected.
- Old photos are not accepted by default.

Quality acceptance:

- Camera controls are large and usable outdoors.
- Guidance helps capture package plus delivery-point context.
- Privacy warnings are clear.
- Recovery states are explicit.
- All critical states have test IDs.
- Claude Code can implement without inventing backend behavior.

## Implementation Notes For Claude Code
Build this file as delivery-photo fallback proof only.

Use the route:

```text
/(ops)/courier/assignments/:deliveryId/proof/photo
```

Use the root test ID:

```text
screen-courier-photo-proof
```

Implementation sequence:

1. Create route shell and fetch delivery state.
2. Validate role, capability, status, custody, and fallback reason.
3. Render delivery identity and photo guidance.
4. Render camera permission gate.
5. Render camera preview, flash toggle, and capture action.
6. Capture fresh proof photo.
7. Run local quality checks and show review.
8. Encode photo and compute byte size plus hash.
9. Create proof asset upload intent with `proofType=delivery_photo`.
10. Upload encoded photo to signed URL.
11. Confirm upload.
12. Complete delivery with `proofType=delivery_photo`, `proofReference=PFA-*`, and `receivedByName`.
13. Clear local photo evidence after success.
14. Add recovery, offline, blocked, conflict, permission, and already delivered states.
15. Add tests from this spec.

Do not implement:

- OTP receiver verification.
- Signature capture.
- Public receiver pages.
- Payment collection.
- Gallery import unless product policy explicitly approves it.
- Fallback reason submission unless backend adds it.
- GPS submission unless backend adds it.

Required integration boundary:

- `CourierProofCapture` owns fallback method selection and initial reason.
- `CourierPhotoProof` owns photo capture, asset upload, upload confirmation, and completion.
- `CourierSignatureProof` owns signature proof.
- `CourierFailedAttempt` owns failed attempt mutation.
- `OpsOfflineOutbox` owns queued upload visibility.
- `OpsActionRecovery` owns ambiguous backend results.

## Backend Contract Follow-Up
Required backend additions for full policy parity:

- Add `proofFallbackReason` to non-OTP completion.
- Add GPS capture or unavailable-location attestation to completion.
- Add proof asset status read endpoint if upload recovery needs explicit polling.
- Add backend photo quality review only if dispute rate requires it.
- Add policy flag if gallery import is ever allowed.

Until those exist:

- Collect fallback reason for UI and future-compatible route state.
- Do not submit unsupported fields.
- Do not tell the courier that unsupported fields are saved.
- Require fresh in-flow camera capture.

## Open Risks
- Photo fallback can be abused if old images are accepted.
- Photo may reveal private details.
- Low-light images may be unusable.
- Offline local photo storage increases privacy and device-loss risk.
- Upload expiration can strand evidence if recovery is weak.
- Current backend does not persist fallback reason or GPS state.

## Definition Of Done
This screen is done when:

- It captures fresh delivery photo proof.
- It uploads a `delivery_photo` proof asset.
- It confirms upload before completion.
- It completes only with `proofType=delivery_photo`.
- It never marks delivered offline.
- It protects signed upload URL and photo image.
- It supports retry and recovery from every mutation step.
- It routes to OTP, signature, failed attempt, support, outbox, and action recovery.
- It passes accessibility, security, integration, and E2E tests.

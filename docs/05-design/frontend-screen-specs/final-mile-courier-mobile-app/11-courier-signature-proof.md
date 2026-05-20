# CourierSignatureProof Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CourierSignatureProof` |
| Route | `/(ops)/courier/assignments/:deliveryId/proof/signature` |
| Primary test ID | `screen-courier-signature-proof` |
| Surface | Final-mile courier mobile app |
| Backend coverage | `get_delivery`, `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `complete_delivery` |
| Offline critical | Yes for capture recovery and queued upload preparation; no for final delivered state until backend confirms upload and completion |
| Required role | `final_mile_courier` |
| Required capability | `complete_delivery_with_proof` |
| Required delivery status | `out_for_delivery` or controlled recovery from `assigned_for_final_mile` |
| Required custody | Current courier must hold final-mile custody |
| Previous workflow | `/(ops)/courier/assignments/:deliveryId/proof` or `/(ops)/courier/assignments/:deliveryId/proof/otp` |
| Success workflow | `/(ops)/courier/assignments/:deliveryId/completed` when implemented, otherwise assignment detail with delivered state |
| Recovery workflows | `/(ops)/courier/assignments/:deliveryId/proof`, `/(ops)/courier/assignments/:deliveryId/proof/otp`, `/(ops)/courier/assignments/:deliveryId/proof/photo`, `/(ops)/courier/assignments/:deliveryId/failed-attempt`, `/(ops)/offline-outbox`, `/(ops)/action-recovery` |
| Current implementation mode | Signature fallback proof capture, proof asset upload, upload confirmation, and delivery completion with `proofType=signature` |

## Product Job
`CourierSignatureProof` lets the final-mile courier complete delivery with receiver signature fallback when OTP cannot be completed and the receiver is physically present.

It answers twelve operational questions:

- `Is signature fallback allowed for this handoff?`
- `Is the receiver present?`
- `Why is OTP not being used?`
- `Who is signing for the package?`
- `Is the signature usable enough to upload?`
- `Is the signature asset tied to the correct delivery?`
- `Was the signature uploaded and confirmed?`
- `Can the app complete delivery now?`
- `What happens if upload expires?`
- `What happens if the app goes offline?`
- `When should the courier use photo proof instead?`
- `When should the courier record a failed attempt?`

The screen must make fallback proof fast enough for field use without making signature feel equal to OTP. It is an exception path with stronger accountability requirements.

## Product Standard
This screen is a fallback proof capture and completion workflow.

The courier should be able to:

- Verify delivery identity and custody.
- See that signature is fallback proof.
- Confirm the reason OTP cannot be completed.
- Capture receiver or representative name.
- Capture a clear signature using finger or stylus.
- Review signature before upload.
- Upload the signature as a backend proof asset.
- Confirm upload before completion.
- Complete delivery with `proofType=signature`.
- Recover if upload expires, fails, or conflicts with backend state.
- Choose photo fallback or failed attempt when signature is not valid.

The screen must never:

- Treat signature as default proof.
- Complete without a signature asset.
- Complete before upload confirmation succeeds.
- Use `proofType=otp`.
- Use a delivery photo proof asset in this flow.
- Create multiple proof assets silently for one visible signature attempt.
- Expose signed upload URLs.
- Expose storage bucket or object path in courier UI.
- Store signature image in public media storage.
- Mark delivered while offline.
- Hide failed attempt when the receiver is absent or refuses.
- Suggest cash collection.

## Audience
Primary audience:

- Final-mile couriers completing handoff with receiver signature fallback.

Secondary audience:

- Receivers or authorized representatives signing on screen.
- Support staff reviewing a signature proof dispute.
- QA validating asset upload and completion sequencing.
- Security reviewers validating sensitive proof handling.
- Claude Code implementing the React Native screen and tests.

## Context Of Use
The courier may open this screen:

- From `CourierProofCapture` after selecting signature fallback.
- From `CourierOtpCompletion` after OTP cannot be completed.
- From action recovery after a prior signature upload or completion failed.
- While online with receiver present.
- While briefly offline after signature capture, before upload.
- After proof upload intent expired.
- After backend rejects a proof asset due to wrong delivery, wrong type, size mismatch, or missing upload confirmation.

The courier may be outdoors, in a building lobby, in poor lighting, holding the phone for the receiver, or dealing with a receiver who is impatient. The UI must be calm, large-target, and resistant to accidental completion.

## Design Brief
User and job:

- A courier needs to collect receiver signature fallback proof and complete delivery only after the signature asset is uploaded and confirmed.

Surface type:

- Mobile proof capture and upload workflow.

Primary action:

- Submit signature proof and complete delivery.

Visual thesis:

- `Accountable signature desk`: a focused field-grade signing surface, clear receiver identity, visible upload chain, and strong recovery exits.

Restraint rule:

- Do not add broad document-signing features. Capture only the minimum proof needed for the delivery handoff.

Density:

- Balanced. The signing surface needs space, while upload and policy state must remain visible.

Platform stance:

- Native-plus mobile capture flow with direct manipulation support, explicit review, durable local recovery, and no secret leakage.

## External Research Used
Only directly relevant links were used:

- [Uber Direct proof of delivery](https://developer.uber.com/docs/deliveries/guides/proof-of-delivery): supports signature as a dropoff verification method, signer name collection, and proof image retrieval after delivery.
- [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/): supports hardware-agnostic pointer handling for mouse, pen, and touch input, relevant to robust mobile signature drawing.
- [WCAG pointer cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html): supports avoiding accidental activation from down-events and giving users a way to abort or undo pointer actions.
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports large touch targets for field capture, clear, retry, upload, and completion controls.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible upload, offline, validation, and completion status announcements without unexpected focus movement.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through receiver identity, fallback reason, signer name, signature pad, review, upload, and completion.
- [Android offline-first app architecture](https://developer.android.com/topic/architecture/data-layer/offline-first): supports cached reads and local write recovery while still making backend state authoritative.

## Local Product References
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/09-courier-proof-capture.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/10-courier-otp-completion.md`
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
2. `PUT` signature image to signed upload URL returned by backend storage gateway
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
  "proofType": "signature",
  "contentType": "image/png",
  "byteSize": 240000,
  "sha256": "64-lowercase-hex-characters"
}
```

Confirm proof asset upload request:

```json
{
  "byteSize": 240000,
  "sha256": "64-lowercase-hex-characters",
  "storageGeneration": "provider-generation"
}
```

Complete delivery request:

```json
{
  "proofType": "signature",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Proof asset constraints:

- `proofType` must be `signature`.
- Content type must be `image/jpeg`, `image/png`, or `image/webp`.
- Byte size must be positive and no more than `8_000_000`.
- Optional pre-upload hash must be lowercase SHA-256 hex.
- Upload intent expires after `15 minutes`.
- Upload must be confirmed before completion.
- `/complete` rejects signature proof unless `PFA-*` asset is `uploaded` or `attached`.
- Asset must belong to the same delivery.
- Asset type must match `signature`.

Current backend gap:

- Doorstep policy requires `proof_fallback_reason`, receiver name, completion timestamp, GPS or unavailable-location attestation.
- Current `completeDeliveryRequestSchema` accepts only `proofType`, `proofReference`, and `receivedByName`.
- The UI must collect fallback reason and GPS state locally for forward-compatible handoff, but must not claim backend persistence until the contract supports it.

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

Successful signature completion:

- Captures signature image.
- Creates proof asset upload intent.
- Uploads signature image to signed URL.
- Confirms upload with byte size, SHA-256, and optional storage generation.
- Calls `/complete` with `proofType=signature` and `proofReference=PFA-*`.
- Backend creates `delivery_completed`.
- Backend creates `delivery_completion` handoff event.
- Backend attaches proof asset.
- Backend clears active custody.
- UI routes to delivered state.

Blocked completion:

- No signature strokes.
- Signer name missing.
- Fallback reason missing.
- Upload not confirmed.
- Upload intent expired.
- Courier lacks custody.
- Delivery is already delivered.
- Delivery entered issue review.
- Network unavailable during upload or completion.

## Fallback Policy
Signature proof is allowed only when:

- OTP cannot be completed.
- Receiver or authorized representative is present.
- The signer can provide a name.
- The signer gives an on-screen signature.
- Courier still has custody.
- The package is handed over only after accepted proof path succeeds.

Signature proof is not allowed when:

- Receiver is absent.
- Address cannot be found.
- Location is unsafe.
- Receiver refuses package.
- Package condition is disputed before handoff.
- Courier wants a faster path than OTP without a valid reason.
- Network is offline and no secure upload recovery exists.

Fallback reason requirement:

- If route state includes a reason from `CourierProofCapture`, show it and allow edit before capture.
- If missing, require a reason before enabling signature capture.
- Reasons that imply failed delivery must route to failed attempt, not signature proof.

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

## Information Architecture
The screen has eleven zones:

1. Status header.
2. Delivery identity strip.
3. Fallback reason card.
4. Receiver and signer details.
5. Signature capture surface.
6. Signature quality controls.
7. Proof review panel.
8. Upload and completion progress.
9. Fallback and failed-attempt exits.
10. Offline and recovery panel.
11. Recovery footer.

### Zone 1: Status Header
Purpose:

- Orient the courier before sensitive proof capture.

Content:

- Back control.
- Screen title: `Signature proof`.
- Delivery reference.
- Status chip.
- Custody chip.
- Network chip.

Test IDs:

- `courier-signature-header`
- `courier-signature-back-action`
- `courier-signature-status-chip`
- `courier-signature-custody-chip`
- `courier-signature-network-chip`

Rules:

- Header must show `Fallback proof`.
- Header must show blocked state before capture controls.
- Header must not expose `PFA-*`, signed URL, or storage path.

### Zone 2: Delivery Identity Strip
Purpose:

- Prevent wrong-delivery signature capture.

Content:

- Delivery ID.
- Safe tracking code or short delivery reference.
- Package summary.
- Receiver display name.
- Latest status timestamp.

Test IDs:

- `courier-signature-delivery-id`
- `courier-signature-tracking-code`
- `courier-signature-package-summary`
- `courier-signature-receiver-name`
- `courier-signature-latest-timestamp`

Rules:

- Do not show package scan code.
- Do not show proof asset object path.
- Do not show full phone number.

### Zone 3: Fallback Reason Card
Purpose:

- Make the exception reason explicit before signature capture.

Content:

- Current reason label.
- Explanation: `Signature is fallback proof because OTP could not be completed.`
- Edit action.

Test IDs:

- `courier-signature-fallback-reason-card`
- `courier-signature-fallback-reason-label`
- `courier-signature-edit-reason-action`

Behavior:

- If reason is missing, show reason selector before capture.
- If selected reason requires failed attempt, route to failed attempt.
- Completion remains disabled until valid fallback reason exists.

### Zone 4: Receiver And Signer Details
Purpose:

- Capture who received the package.

Fields:

- `Received by`
- Optional relationship if future backend supports it.

Current backend field:

- `receivedByName`

Validation:

- Minimum `2` characters.
- Maximum `120` characters.
- Trim whitespace.
- Reject empty or punctuation-only values.

Test IDs:

- `courier-signature-signer-card`
- `courier-signature-received-by-field`
- `courier-signature-received-by-error`
- `courier-signature-relationship-field`

Current relationship behavior:

- Do not submit relationship to backend until contract supports it.
- If collected for local context, keep it out of completion request and analytics.

### Zone 5: Signature Capture Surface
Purpose:

- Capture a clear receiver signature.

Component requirements:

- Large white or light neutral drawing area.
- Clear boundary.
- Instruction text above, not inside the drawing area.
- Supports finger and stylus.
- Tracks pointer down, move, up, cancel.
- Uses pressure only as optional visual enhancement, not as proof requirement.
- Prevents page scroll while drawing.
- Releases pointer capture correctly when touch ends or cancels.
- Supports left-handed and right-handed use.

Test IDs:

- `courier-signature-pad`
- `courier-signature-pad-instruction`
- `courier-signature-stroke-count`

Instruction copy:

- `Ask the receiver to sign inside the box.`

Do not:

- Auto-accept a single dot.
- Auto-accept accidental swipes.
- Put critical controls inside the drawing area.
- Trigger completion from pointer down.
- Store strokes in analytics.

### Zone 6: Signature Quality Controls
Purpose:

- Let the courier and receiver correct the signature before upload.

Controls:

- `Clear signature`
- `Undo last stroke` if supported.
- `Accept signature`

Test IDs:

- `courier-signature-clear-action`
- `courier-signature-undo-action`
- `courier-signature-accept-action`

Rules:

- `Clear signature` requires confirmation only after meaningful strokes exist.
- `Undo` is disabled when no strokes exist.
- `Accept signature` is disabled until minimum stroke quality passes.
- Pointer cancellation must not accidentally clear or accept signature.

Minimum local quality:

- At least one continuous stroke with meaningful length.
- Minimum bounding-box area threshold.
- Not only a tap.
- Signature image byte size under backend maximum after encoding.

### Zone 7: Proof Review Panel
Purpose:

- Confirm what will be uploaded before contacting storage.

Content:

- Signature preview.
- Signer name.
- Fallback reason.
- Delivery reference.
- Privacy note: `Signature proof is stored for delivery accountability and dispute review.`

Actions:

- `Edit signature`
- `Upload signature proof`

Test IDs:

- `courier-signature-review-panel`
- `courier-signature-preview`
- `courier-signature-edit-signature-action`
- `courier-signature-upload-action`

Rules:

- Upload starts only from review state.
- Preview must not include raw upload URL.
- Preview must not write to public media storage.

### Zone 8: Upload And Completion Progress
Purpose:

- Make the proof asset sequence transparent.

Progress steps:

1. `Preparing proof`
2. `Uploading signature`
3. `Confirming upload`
4. `Completing delivery`
5. `Delivered`

Test IDs:

- `courier-signature-progress-panel`
- `courier-signature-progress-prepare`
- `courier-signature-progress-upload`
- `courier-signature-progress-confirm`
- `courier-signature-progress-complete`
- `courier-signature-progress-delivered`

Rules:

- Show signed upload expiry in safe relative text if useful.
- Do not show signed URL.
- Do not show bucket or object path.
- If upload expires, show recovery.
- If confirm upload succeeds but complete fails, keep proof asset reference in secure local recovery state.
- If complete succeeds, clear local signature image.

### Zone 9: Fallback And Failed-Attempt Exits
Purpose:

- Prevent forced signature when another path is safer.

Actions:

- `Try OTP instead`
- `Use photo proof instead`
- `Record failed attempt`
- `Contact support`

Routes:

- `/(ops)/courier/assignments/:deliveryId/proof/otp`
- `/(ops)/courier/assignments/:deliveryId/proof/photo`
- `/(ops)/courier/assignments/:deliveryId/failed-attempt`
- `/(ops)/courier/issues?deliveryId=:deliveryId`

Test IDs:

- `courier-signature-try-otp-action`
- `courier-signature-use-photo-action`
- `courier-signature-failed-attempt-action`
- `courier-signature-support-action`

Rules:

- Failed attempt remains visible before upload.
- During upload, exits move to recovery mode rather than discarding evidence.
- If receiver refuses to sign, route to failed attempt or support, not photo proof by default.

### Zone 10: Offline And Recovery Panel
Purpose:

- Preserve sensitive evidence safely during network problems.

Offline states:

- `offline_before_capture`
- `offline_after_capture`
- `offline_during_upload`
- `unknown_upload_result`
- `unknown_completion_result`

Test IDs:

- `courier-signature-offline-panel`
- `courier-signature-outbox-link`
- `courier-signature-action-recovery-link`

Rules:

- Offline before capture can show guidance but should warn upload requires network.
- Offline after capture may preserve encrypted local signature evidence only if the app has secure storage.
- Offline during upload must not show delivered.
- Unknown upload result must verify proof asset status before retry.
- Unknown completion result must refresh delivery state before retry.

### Zone 11: Recovery Footer
Purpose:

- Keep repair actions available without clutter.

Actions:

- `Refresh delivery`
- `Resume proof upload`
- `Open action recovery`
- `Back to proof options`

Test IDs:

- `courier-signature-refresh-action`
- `courier-signature-resume-upload-action`
- `courier-signature-recovery-footer`
- `courier-signature-proof-options-link`

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
- Signature controls disabled.

Test IDs:

- `courier-signature-loading-state`

### Ready To Sign State
Trigger:

- Eligible delivery, valid fallback reason, online or capture-safe offline state.

UI:

- Receiver details.
- Signature pad.
- Clear and accept controls.
- Completion disabled until signature accepted.

Test IDs:

- `courier-signature-ready-state`

### Missing Fallback Reason State
Trigger:

- Route lacks valid fallback reason.

UI:

- Reason selector.
- Signature pad disabled.
- Failed attempt visible.

Test IDs:

- `courier-signature-missing-reason-state`

### Drawing State
Trigger:

- Receiver is actively signing.

UI:

- Suppress accidental navigation.
- Keep clear and accept controls inactive until pointer up.
- Do not scroll page from drawing gesture.

Test IDs:

- `courier-signature-drawing-state`

### Empty Or Too Small Signature State
Trigger:

- Signature fails local quality threshold.

UI:

- Show correction message.
- Keep upload disabled.

Copy:

- `Ask the receiver to sign again so the proof is readable.`

Test IDs:

- `courier-signature-quality-error-state`

### Review State
Trigger:

- Signature accepted locally.

UI:

- Show signature preview.
- Show signer name and reason.
- Upload CTA enabled when online and name valid.

Test IDs:

- `courier-signature-review-state`

### Upload Intent State
Trigger:

- App is creating proof asset upload intent.

UI:

- Progress step `Preparing proof`.
- Disable signature edits.

Test IDs:

- `courier-signature-upload-intent-state`

### Uploading State
Trigger:

- App is uploading encoded signature image to signed URL.

UI:

- Progress step `Uploading signature`.
- Show retry only after failure.

Test IDs:

- `courier-signature-uploading-state`

### Confirming Upload State
Trigger:

- Upload finished and app is calling confirm upload.

UI:

- Progress step `Confirming upload`.

Test IDs:

- `courier-signature-confirming-state`

### Completing State
Trigger:

- Upload confirmed and app is calling `/complete`.

UI:

- Progress step `Completing delivery`.
- Do not allow duplicate completion.

Test IDs:

- `courier-signature-completing-state`

### Delivered State
Trigger:

- `/complete` returns success.

UI:

- Delivered confirmation.
- Completion timestamp.
- Route to completed workflow.

Test IDs:

- `courier-signature-delivered-state`

### Upload Expired State
Trigger:

- Signed URL or upload intent passes expiry before confirm upload.

UI:

- Explain expiry.
- Offer create new upload intent from existing local signature if still secure.
- Offer recapture signature if local evidence cannot be trusted.

Test IDs:

- `courier-signature-upload-expired-state`

### Offline State
Trigger:

- Network unavailable.

UI:

- Preserve local signature only in secure storage.
- Completion disabled.
- Link to outbox or recovery.

Test IDs:

- `courier-signature-offline-state`

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

- `courier-signature-conflict-state`

### Blocked By Custody State
Trigger:

- Current courier does not hold final-mile custody.

UI:

- Disable capture and completion.
- Route to action recovery.

Test IDs:

- `courier-signature-blocked-custody-state`

### Permission Denied State
Trigger:

- User lacks `complete_delivery_with_proof`.

UI:

- Disable capture and completion.
- Offer support.

Test IDs:

- `courier-signature-permission-denied-state`

### Already Delivered State
Trigger:

- Delivery status is `delivered` or final proof exists.

UI:

- Remove capture controls.
- Show delivered summary.

Test IDs:

- `courier-signature-already-delivered-state`

### Error State
Trigger:

- Read, upload, confirm, or completion fails.

UI:

- Show safe error.
- Offer specific retry from last safe step.
- Offer support.

Test IDs:

- `courier-signature-error-state`

## Navigation Rules
Entry route:

- `/(ops)/courier/assignments/:deliveryId/proof/signature`

Back behavior:

- Back returns to proof selector before signature strokes exist.
- Back after strokes exist asks whether to keep local signature evidence, discard it, or stay.
- Back during upload routes to recovery mode, not silent discard.
- Back after delivered routes to completed workflow.

Forward routes:

- Completed: `/(ops)/courier/assignments/:deliveryId/completed` when available.
- OTP: `/(ops)/courier/assignments/:deliveryId/proof/otp`.
- Photo: `/(ops)/courier/assignments/:deliveryId/proof/photo`.
- Failed attempt: `/(ops)/courier/assignments/:deliveryId/failed-attempt`.
- Support: `/(ops)/courier/issues?deliveryId=:deliveryId`.
- Offline outbox: `/(ops)/offline-outbox`.
- Action recovery: `/(ops)/action-recovery`.

Navigation guards:

- Do not leave upload in unknown state without recovery marker.
- Do not start photo fallback while signature upload is in flight.
- Do not complete if route delivery ID does not match proof asset delivery ID.
- Do not complete if proof asset type is not `signature`.

## Visual System Direction
Art direction:

- Serious and precise.
- Signature area feels like a clean receipt pad.
- Upload chain feels auditable, not decorative.
- Fallback status is visible but not alarming.

Layout:

- Header and delivery identity at top.
- Reason and signer details above signature pad.
- Signature pad gets the largest single area.
- Review and upload controls below pad.
- Failed attempt remains accessible below proof controls.

Color:

- Neutral canvas for signing.
- Deep green for confirmed upload and delivered state.
- Amber for fallback and expiry warnings.
- Red for blocked states.
- Graphite for offline and recovery.

Typography:

- Short labels.
- Strong field labels.
- No dense legal copy.
- Use readable body size for outdoor use.

Motion:

- Signature strokes appear immediately.
- Review panel slides in only after accept.
- Progress steps advance with subtle status changes.
- Reduced-motion users get instant changes.

Do not include:

- Decorative signature flourishes.
- Celebration effects.
- Heavy shadows around the pad.
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
- Signer name.
- Signature stroke data before encoding.
- Encoded signature byte size.
- SHA-256 hash.
- Proof asset ID after upload intent.
- Upload expiry timestamp.
- Upload confirmation state.
- Idempotency keys for each mutation step.

Forbidden data handling:

- Do not persist raw strokes longer than needed.
- Do not write signature image to public photo library.
- Do not include signature bytes in analytics.
- Do not expose upload URL in logs.
- Do not store bucket or object path in visible UI.
- Do not retain local signature after delivered success.

## API Mapping
Step 1, create proof asset:

```http
POST /v1/deliveries/:id/proof-assets
```

```json
{
  "proofType": "signature",
  "contentType": "image/png",
  "byteSize": 240000,
  "sha256": "64-lowercase-hex-characters"
}
```

Step 2, upload encoded signature:

```http
PUT <signed upload URL>
```

Step 3, confirm upload:

```http
POST /v1/deliveries/:id/proof-assets/:proofAssetId/confirm-upload
```

```json
{
  "byteSize": 240000,
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
  "proofType": "signature",
  "proofReference": "PFA-0001",
  "receivedByName": "Receiver Name"
}
```

Idempotency:

- Use separate stable idempotency keys for upload intent, upload confirmation, and completion.
- Do not reuse completion key if signer name or proof asset ID changes.
- Retry from the last known safe step.

## Error Handling
Backend error mapping:

| Backend condition | UI state | Recovery |
| --- | --- | --- |
| `ROUTE_NOT_ENABLED` with `missing_proof_storage_gateway` | Signature proof unavailable | Use OTP, photo if available, failed attempt, or support |
| `FORBIDDEN` | Permission or custody denied | Refresh, action recovery, support |
| `NOT_FOUND` | Delivery or proof asset not found | Refresh, recover, support |
| `INVALID_STATUS_TRANSITION` | Blocked by status | Route to correct workflow |
| `VALIDATION_ERROR` during upload intent | Invalid asset metadata | Re-encode or recapture |
| `VALIDATION_ERROR` during confirm upload | Byte size or hash mismatch | Re-upload from secure local evidence or recapture |
| `VALIDATION_ERROR` during completion | Proof asset not uploaded or wrong type | Confirm upload or recover proof asset |
| `PAYMENT_REQUIRED` | Payment not settled | Block completion and support |
| `RATE_LIMITED` | Too many attempts | Wait and retry from safe step |
| Network timeout before upload | Offline | Preserve local evidence if secure |
| Network timeout after upload | Unknown upload result | Confirm status before retry |
| Network timeout after completion | Unknown completion result | Refresh delivery before retry |

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

- Preserve signature only in encrypted app storage if available.
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
- Local signature evidence can help retry only if still tied to the same delivery and proof asset.

## Security And Privacy
Sensitive fields:

- Signature image.
- Signer name.
- Receiver name.
- Receiver phone.
- Delivery address.
- Proof asset ID.
- Signed upload URL.
- GPS state.

Controls:

- Signature image stored only in secure app storage before upload.
- Signature image deleted after delivered success.
- Signed upload URL kept in volatile state.
- Proof asset ID may be kept only for recovery.
- Logs redact signed URL, storage path, hash, and signature bytes.
- Analytics exclude signer name and signature data.
- Crash reports exclude form values and signature image.

Retention alignment:

- Signature proof follows `180 days` retention unless tied to active dispute, then `24 months`.
- Delivery summary follows `24 months`.
- Issue and audit history follow `24 months`.

Fraud and coercion risks:

- Receiver may refuse to sign.
- Courier may try to sign for receiver.
- Wrong person may sign.
- Signature may be unreadable.
- Phone may be handed to receiver without clear context.

Mitigations:

- Signer name required.
- Fallback reason required.
- Failed attempt visible.
- Support visible.
- Signature quality threshold.
- Completion only after backend proof asset confirmation.

## Accessibility Requirements
Screen reader:

- Screen title announces as `Signature proof`.
- Fallback reason is announced before signature capture.
- Signature pad has clear label and instructions.
- Clear, undo, and accept controls have accessible names.
- Upload progress steps announce as status messages.
- Errors move focus to the relevant state title.

Focus order:

1. Back action.
2. Screen title.
3. Delivery identity.
4. Fallback reason.
5. Signer name field.
6. Signature pad instructions.
7. Signature pad.
8. Clear signature.
9. Undo last stroke.
10. Accept signature.
11. Review panel.
12. Upload action.
13. Failed attempt.
14. Support.
15. Recovery footer.

Touch and pointer:

- Signature pad supports touch and stylus.
- Controls do not activate on pointer down alone.
- Clear and accept are separated from the drawing surface.
- Touch targets meet mobile sizing requirements.

Alternatives:

- If receiver cannot physically sign, route to photo proof or failed attempt according to policy.
- If assistive technology cannot use drawing surface, support must be reachable.

Contrast:

- Signature strokes must be high contrast against pad.
- Error states use labels plus color.

Motion:

- Reduced motion disables panel transitions.

## Performance Requirements
Initial render:

- Render cached delivery context quickly.
- Load signature drawing module only for this screen.
- Do not load camera modules.

Capture:

- Drawing must feel immediate.
- Avoid expensive re-render for every pointer move.
- Encode image only after signature acceptance.

Upload:

- Compute byte size and hash before upload intent when possible.
- Avoid duplicate encoding.
- Show progress without blocking main thread.

Memory:

- Clear stroke and image buffers after delivered success.
- Release large image data when navigating away after discard.

Battery:

- Do not run continuous GPS tracking.
- Capture one location state only if completion policy requires it and platform allows.

## Analytics And Observability
Allowed events:

- `courier_signature_screen_viewed`
- `courier_signature_reason_selected`
- `courier_signature_started`
- `courier_signature_cleared`
- `courier_signature_accepted`
- `courier_signature_upload_intent_started`
- `courier_signature_upload_succeeded`
- `courier_signature_upload_failed`
- `courier_signature_confirm_succeeded`
- `courier_signature_completion_started`
- `courier_signature_completion_succeeded`
- `courier_signature_completion_failed`
- `courier_signature_failed_attempt_selected`
- `courier_signature_support_selected`

Required event fields:

- `deliveryId`
- `screenId`
- `currentStatus`
- `custodyState`
- `networkState`
- `fallbackReasonCode`
- `proofAssetState`
- `failureCode` when applicable

Forbidden event fields:

- Signature strokes.
- Signature image.
- Signer name.
- Receiver phone.
- Full address.
- Signed upload URL.
- Storage path.
- SHA-256 hash.
- Idempotency key.

## Testing Requirements
Unit tests:

- Renders root `screen-courier-signature-proof`.
- Shows missing reason state when no fallback reason exists.
- Disables signature acceptance when strokes are empty.
- Shows quality error for tap-only signature.
- Enables review only after valid signature and signer name.
- Creates proof asset with `proofType=signature`.
- Confirms upload before completion.
- Calls `/complete` with `proofType=signature` and `proofReference=PFA-*`.
- Does not call `/complete` before upload confirmation.
- Clears local signature after success.
- Blocks completion offline.
- Shows failed attempt exit.

Integration tests:

- From proof selector, selected fallback reason opens signature screen.
- Signature capture, upload intent, upload confirm, and completion succeed in sequence.
- Expired upload intent recovers from secure local signature or asks for recapture.
- Hash mismatch routes to re-upload or recapture.
- Completion validation error for wrong proof type opens recovery.
- Reassigned delivery blocks capture and completion.
- Already delivered state removes capture controls.
- Offline after capture opens outbox.

Accessibility tests:

- Signature pad has accessible label.
- Controls have accessible names.
- Progress changes announce.
- Focus order remains logical.
- Clear action is cancellable.
- Large text keeps pad instructions and controls visible.

Security tests:

- Signed upload URL not visible in UI.
- Signature image not in analytics.
- Signer name not in analytics.
- Local signature evidence clears after delivered success.
- Completion request does not include fallback reason until backend supports it.
- Relationship field does not submit unless backend supports it.

E2E tests:

- `e2e-courier-completes-with-signature`: courier captures signature, uploads `PFA-*`, confirms upload, completes delivery, and final proof records `signature`.
- Courier cannot complete if upload confirmation fails.
- Courier cannot complete with photo proof asset on signature route.
- Courier cannot complete another courier's delivery.
- Courier offline after upload sees recovery, not delivered.
- Receiver refusal routes to failed attempt.

## Acceptance Criteria
Functional acceptance:

- Screen renders at `/(ops)/courier/assignments/:deliveryId/proof/signature`.
- Root element uses `screen-courier-signature-proof`.
- Fallback reason is required.
- Signer name is required and validates against schema.
- Signature must pass local quality threshold.
- Upload intent uses `proofType=signature`.
- Upload confirmation completes before delivery completion.
- Completion uses `proofType=signature`.
- Completion uses backend `PFA-*` proof reference.
- Offline does not show delivered.
- Success routes to delivered workflow.

Policy acceptance:

- Signature is treated as fallback proof only.
- OTP remains available as preferred proof where possible.
- Photo proof remains separate.
- Failed attempt remains available.
- Receiver absence never routes to signature completion.
- No cash collection appears.
- UI does not claim fallback reason or GPS are backend-persisted until contract supports them.

Security acceptance:

- Signature image is sensitive.
- Signed upload URL is hidden.
- Storage path is hidden.
- Signature data is excluded from analytics and crash reports.
- Local signature evidence is cleared after success.
- Proof asset ownership and type are respected.

Quality acceptance:

- Signature pad is large and usable outdoors.
- Clear, undo, accept, upload, and complete controls are hard to confuse.
- Recovery states are explicit.
- All critical states have test IDs.
- Claude Code can implement without inventing backend behavior.

## Implementation Notes For Claude Code
Build this file as signature fallback proof only.

Use the route:

```text
/(ops)/courier/assignments/:deliveryId/proof/signature
```

Use the root test ID:

```text
screen-courier-signature-proof
```

Implementation sequence:

1. Create route shell and fetch delivery state.
2. Validate role, capability, status, custody, and fallback reason.
3. Render delivery identity and signer details.
4. Render signature pad with clear, undo, and accept controls.
5. Validate signature quality locally.
6. Encode signature image and compute byte size plus hash.
7. Create proof asset upload intent with `proofType=signature`.
8. Upload encoded image to signed URL.
9. Confirm upload.
10. Complete delivery with `proofType=signature`, `proofReference=PFA-*`, and `receivedByName`.
11. Clear local signature evidence after success.
12. Add recovery, offline, blocked, conflict, and already delivered states.
13. Add tests from this spec.

Do not implement:

- OTP receiver verification.
- Photo proof capture.
- Public receiver pages.
- Payment collection.
- Relationship submission unless backend adds it.
- Fallback reason submission unless backend adds it.
- GPS submission unless backend adds it.

Required integration boundary:

- `CourierProofCapture` owns fallback method selection and initial reason.
- `CourierSignatureProof` owns signature capture, asset upload, upload confirmation, and completion.
- `CourierPhotoProof` owns photo proof.
- `CourierFailedAttempt` owns failed attempt mutation.
- `OpsOfflineOutbox` owns queued upload visibility.
- `OpsActionRecovery` owns ambiguous backend results.

## Backend Contract Follow-Up
Required backend additions for full policy parity:

- Add `proofFallbackReason` to non-OTP completion.
- Add GPS capture or unavailable-location attestation to completion.
- Add optional signer relationship if business policy wants it.
- Add proof asset status read endpoint if upload recovery needs explicit polling.
- Add server-side signature quality review only if fraud rate requires it.

Until those exist:

- Collect fallback reason for UI and future-compatible route state.
- Do not submit unsupported fields.
- Do not tell the courier that unsupported fields are saved.

## Open Risks
- Signature fallback can be abused if reason is weak.
- Signature drawing may be hard for some receivers.
- Offline local signature storage increases privacy and device-loss risk.
- Upload expiration can strand evidence if recovery is weak.
- Current backend does not persist fallback reason or GPS state.

## Definition Of Done
This screen is done when:

- It captures a clear signature.
- It uploads a `signature` proof asset.
- It confirms upload before completion.
- It completes only with `proofType=signature`.
- It never marks delivered offline.
- It protects signed upload URL and signature image.
- It supports retry and recovery from every mutation step.
- It routes to OTP, photo, failed attempt, support, outbox, and action recovery.
- It passes accessibility, security, integration, and E2E tests.

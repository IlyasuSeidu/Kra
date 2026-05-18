# Sender Receipt Share Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderReceiptShare` |
| App | `apps/mobile` |
| Route | `/(sender)/receipts/:deliveryId/share` |
| Primary test ID | `screen-sender-receipt-share` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `deliveryDetailResponseSchema`, client receipt export |
| Related routes | `/(sender)/receipts/:deliveryId`, `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/history`, `/(sender)/support` |
| Required states | `loading`, `ready`, `generating`, `system_share_open`, `success`, `failure`, `receipt_unavailable`, `refund_pending`, `refunded`, `offline`, `stale_blocked`, `not_found`, `not_authorized`, `api_error`, `session_expired` |

## Product Job
This screen lets a sender generate and share a sender-safe receipt artifact for one delivery. It must create a clean export from the same contract-safe data as receipt detail, open the native share/print path, and make the receipt state impossible to misunderstand.

The sender should be able to:
- Generate a receipt artifact from the latest authorized delivery data.
- Share the receipt through the platform share sheet.
- Save or print through platform-supported actions.
- Copy a plain-text receipt summary when file sharing fails.
- See a clear generating state.
- See success or failure after share/export attempt.
- Understand when receipt export is blocked because payment is pending or failed.
- Understand when export is blocked because data is stale.
- Share refund-pending or refunded receipts with an explicit state stamp.
- Return to receipt detail, refund status, delivery detail, history, or support.

This screen is not:
- The receipt detail screen.
- The payment confirmation screen.
- The payment retry screen.
- The refund tracker.
- The refund approval or settlement screen.
- An email composer owned by Kra.
- A finance admin export.
- A provider receipt export.
- A tax invoice generator unless future tax rules define tax invoice support.

## Audience
Primary audience:
- Authenticated senders sharing proof of payment.
- Small-business senders saving payment records.
- Senders sharing a refund-state receipt with support, a receiver, or internal bookkeeping.

Secondary audience:
- Claude Code implementing export handoff.
- QA validating file generation, share outcomes, and failure paths.
- Finance/support reviewers confirming exported receipt language.
- Privacy reviewers confirming no hidden internal fields leak into files.

## User State
The sender is task-focused and usually wants to leave the screen quickly after sharing. They may be under pressure from a receiver, a business customer, or support. The screen must be calm and direct: generate the receipt, open the share sheet, confirm the attempt, and provide recovery if the platform blocks sharing.

The sender may be:
- Coming from `SenderReceiptDetail`.
- Returning after payment result.
- Sharing a receipt from history.
- Sharing a refund-pending payment state.
- Sharing a refunded payment state.
- Trying to export while offline.
- Trying to export before payment is confirmed.
- Using a device where native file sharing is restricted.

The screen must:
- Fetch latest delivery data before official export.
- Block export for pending or failed payment.
- Block export when only stale data is available.
- Mark refund states clearly in the exported artifact.
- Keep provider references, payer phone, staff IDs, proof references, and receiver phone out of the artifact.
- Provide plain-text fallback only after file share generation fails.
- Never mutate payment, refund, delivery, support, proof, or custody state.

## Primary Action
Primary action:
- `Generate receipt`

Secondary actions:
- `Share again`
- `Copy receipt text`
- `Open receipt`
- `Track refund`
- `Contact support`
- `Go to history`

CTA behavior:
- `Generate receipt` refreshes `get_delivery`, validates eligibility, builds client artifact, then opens system share.
- `Share again` repeats generation from fresh data when possible.
- `Copy receipt text` copies a plain-text sender-safe receipt summary.
- `Open receipt` routes to `/(sender)/receipts/:deliveryId`.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `Contact support` routes to support with delivery context.
- `Go to history` routes to `/(sender)/history`.

Blocked behavior:
- Do not share from stale cache as official receipt.
- Do not generate export for `paymentStatus=pending`.
- Do not generate export for `paymentStatus=failed`.
- Do not call payment initialization.
- Do not call payment verification.
- Do not call refund request or settlement.
- Do not email from Kra directly unless a future backend notification endpoint exists.
- Do not upload the generated receipt to backend storage.
- Do not include hidden fields absent from `deliveryDetailResponseSchema`.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Which receipt will be shared.
- Payment/refund state.
- Amount.
- Tracking code.
- Route.
- Generate action.
- A short explanation of what will and will not be included.

The first viewport must answer:
- What am I sharing?
- Is the payment state valid for sharing?
- Will refund state be shown?
- What happens when I tap generate?

## Main Tension
Receipt sharing needs to feel official, but it is still a client-side export based on the current delivery detail contract. The UI and artifact must avoid pretending it is a provider-issued settlement document or tax invoice. It must be useful for senders without leaking internal or unsupported finance data.

The design must balance:
- Speed against fresh-data accuracy.
- Share convenience against privacy protection.
- Official visual quality against contract limitations.
- Refund transparency against unsupported refund amount/reference fields.
- Platform-native sharing against clear app-level recovery.

## Design Brief
User and job:
- An authenticated sender wants to share or save a receipt artifact for a delivery.

Context of use:
- Mobile, post-payment, often time-sensitive, often outside the app after share completes.

Entry point:
- SenderReceiptDetail.
- PaymentResult.
- SenderDeliveryHistory.
- SenderRefundStatus.
- Support context.

Success state:
- The native share path opens, the user shares or saves the artifact, and the screen confirms the attempt without claiming recipient delivery.

Primary action:
- `Generate receipt`

Navigation model:
- Share is a focused task route. Receipt detail remains the read-only content view.

Density:
- Low. This screen should not repeat the full receipt; it previews the critical facts and controls export.

Visual thesis:
- A compact export dock: official, confident, minimal, with one clear generate action and no finance clutter.

Restraint rule:
- Avoid custom share networks, provider logos, email form fields, export settings overload, or file-format complexity.

Product lens:
- Trustworthy customer proof with privacy-safe export.

System stance:
- Native share first, app fallback second.

Interaction thesis:
- The sender taps once, watches a short generating state, then uses the platform share sheet.

Signature move:
- A stamped receipt preview card that changes its state label for paid, refund pending, and refunded exports.

Activation event:
- Native share sheet opens with generated receipt artifact.

## Elite Quality Gate
This spec is not closed unless share/export is fresh, state-stamped, privacy-safe, and recoverable.

Non-negotiable quality requirements:
- First viewport shows receipt identity, amount, payment/refund state, and generate action.
- Export uses fresh `get_delivery` response.
- Export blocks stale-only data.
- Export blocks `pending` and `failed` payment states.
- Export supports `confirmed`, `refund_pending`, and `refunded` states with explicit labels.
- Export artifact includes delivery ID, tracking code, amount, route, service, receiver name, package summary, created date, generated date, and payment/refund state.
- Export artifact does not include receiver phone, payer phone, provider reference, staff IDs, proof reference, or raw backend metadata.
- Share uses the platform share sheet or platform equivalent.
- Fallback copy text is sender-safe and state-stamped.
- Success state does not claim the recipient received the file.
- Failure state provides a retry and copy fallback.
- Accessibility, large text, high contrast, reduced motion, and small phones are supported.

Closure rule:
- If export can happen from stale-only data, the screen remains open.
- If refund-pending export looks like fully settled paid receipt, the screen remains open.
- If failed payment can export a paid receipt, the screen remains open.
- If provider reference leaks into the file, the screen remains open.
- If share failure leaves the sender stuck, the screen remains open.
- If the file has no generated timestamp, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines for sharing and activity views support native share-sheet handoff rather than custom share controls.
- Apple HIG feedback guidance supports clear generation and completion feedback without overclaiming share delivery.
- Material Design 3 progress indicators, snackbars, cards, and buttons support generation, failure recovery, and compact preview hierarchy.
- W3C status-message and error-identification guidance supports accessible progress, result, and error announcements.
- Stripe receipt documentation reinforces that customer receipts need clear payment state and should not expose backend objects as user-facing proof.
- Kra receipt detail spec locks export data to `deliveryDetailResponseSchema`.
- Kra payment policy says confirmed payments surface receipts, failed payments block dispatch, and refund state must remain visible.
- Kra refund policy says refunds can be pending or completed; this export must show that distinction.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/sharing
- https://developer.apple.com/design/human-interface-guidelines/activity-views
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://m3.material.io/components/progress-indicators/overview
- https://m3.material.io/components/snackbar/overview
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/buttons/overview
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- https://docs.stripe.com/receipts
- `docs/05-design/frontend-screen-specs/sender-mobile-app/20-sender-receipt-detail.md`
- `docs/04-features/payments-spec.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `services/api/src/delivery-queries.ts`

## Product Assumptions
Assumptions for v1:
- Share/export is client-side.
- Share/export uses `get_delivery` for fresh data.
- Share/export uses `deliveryDetailResponseSchema`.
- No dedicated receipt endpoint exists yet.
- No server receipt file endpoint exists yet.
- No backend email receipt endpoint exists yet.
- No payment provider receipt URL is exposed to sender.
- No tax invoice support exists in v1.
- `quote.amount` is the displayed receipt amount for eligible states.
- `paymentStatus=confirmed` can export as `Paid`.
- `paymentStatus=refund_pending` can export as `Refund pending`.
- `paymentStatus=refunded` can export as `Refunded`.
- `paymentStatus=pending` and `failed` cannot export as receipt.
- Export should be blocked when only stale cached data is available.
- Export artifact can include a generated-on-device timestamp.
- Share success means the OS share sheet accepted the artifact, not that a recipient received it.

If a future receipt endpoint is added, this screen should switch from client rendering to backend-provided receipt artifact or verified receipt payload.

## Non-Goals
Do not implement these in this screen:
- Payment initialization.
- Payment verification.
- Payment retry.
- Refund request.
- Refund settlement.
- Support message sending.
- Receipt editing.
- Tax invoice creation.
- Provider receipt retrieval.
- Backend file upload.
- Backend file storage.
- Email sending from Kra.
- Admin finance export.
- Reconciliation review.
- Full delivery detail view.
- Full refund tracker.

## Backend Contract
### Endpoint
- Operation name: `get_delivery`.
- HTTP route: `GET /v1/deliveries/:id`.
- Access: authenticated.
- Server response policy: `setNoStore(reply)`.

### Required Freshness
Before artifact generation:
- Call `get_delivery`.
- Validate response against `deliveryDetailResponseSchema`.
- Recompute receipt eligibility from fresh `paymentStatus`.
- Abort generation if request fails and only stale data exists.

Allowed payment states:
- `confirmed`
- `refund_pending`
- `refunded`

Blocked payment states:
- `pending`
- `failed`

### Export Data Inputs
Use only:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `doorstepDistanceKm` when present
- `receiver.name`
- `package.description`
- `package.weightKg`
- `package.sizeTier`
- `package.isFragile`
- `package.declaredValueGhs`
- `quote.currency`
- `quote.amount`
- `createdAt`
- `latestEvent.occurredAt`

Use station names from:
- `stationCatalog`

Do not use:
- `senderId`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `finalProof.reference`
- provider reference
- payer phone
- receiver phone
- refund amount
- refund reason
- refund reference
- backend audit metadata

### Export Artifact Fields
Receipt artifact must include:
- Brand name: `Kra`.
- Document title: `Delivery receipt`.
- Payment state: `Paid`, `Refund pending`, or `Refunded`.
- Amount: `GHS {quote.amount}`.
- Delivery ID.
- Tracking code.
- Route label.
- Origin station.
- Destination station.
- Service type.
- Doorstep state.
- Receiver name.
- Package description.
- Weight.
- Size tier.
- Fragile state.
- Declared value.
- Delivery created date.
- Latest update date.
- Generated date.
- Data source statement.

Data source statement:
- `Generated from Kra delivery records for this sender account.`

Refund pending statement:
- `Refund is pending. Open refund status in Kra for settlement details.`

Refunded statement:
- `Refund is marked completed in Kra. Open refund status in Kra for settlement details.`

Do not include:
- Paid timestamp unless future contract provides it.
- Receipt number unless future contract provides it.
- Provider reference unless future contract provides sender-safe reference.
- Tax details unless future contract provides tax rules.

## Export Format Rules
### Primary Format
Primary artifact:
- PDF when the mobile stack supports accessible PDF generation reliably.

Fallback artifact:
- Image only if PDF generation is unavailable and text alternative is also available.

Text fallback:
- Plain text receipt summary copied to clipboard.

Rules:
- PDF must use selectable text if the library supports it.
- PDF must have readable text contrast.
- PDF must not rely on color alone for refund state.
- File name must be deterministic and sender-safe.

File name:
- `kra-receipt-{trackingCode}.pdf`

If tracking code contains unsupported filename characters:
- Sanitize to uppercase letters, digits, and hyphen.

Do not include receiver name in filename.

### Print
Print is accessed through platform share/print actions.

Do not build custom print UI in v1.

### Save
Save is accessed through platform share/save actions.

Do not build custom file browser in v1.

## Information Architecture
### Top Bar
Contains:
- Back button.
- Title: `Share receipt`
- Optional support overflow.

Rules:
- Back returns to receipt detail.
- If deep-linked, back routes to receipt detail for `deliveryId`.

### Receipt Preview Card
Shows:
- `Kra`
- `Delivery receipt`
- Payment/refund state stamp.
- Amount.
- Tracking code.
- Route.
- Generated-state note.

States:
- Paid stamp: `Paid`
- Refund pending stamp: `Refund pending`
- Refunded stamp: `Refunded`
- Unavailable stamp: `Receipt unavailable`

Preview rule:
- The preview is a visual summary, not the generated file itself.
- It must not show fields that will be absent from export.

### Export Controls
Primary:
- `Generate receipt`

While generating:
- Disabled primary button.
- Progress message.

After system share opens:
- Show return state when user comes back.

After success:
- `Share again`
- `Open receipt`

After failure:
- `Try again`
- `Copy receipt text`
- `Contact support`

### Included Data Section
Title:
- `Included in this receipt`

Items:
- Amount and payment state.
- Delivery and tracking IDs.
- Route and service.
- Receiver name.
- Package summary.
- Generated date.

Excluded data note:
- `Phone numbers, provider references, staff IDs, and proof references are not included.`

### Refund State Section
Visible for:
- `refund_pending`
- `refunded`

Refund pending:
- Title: `Refund state will be shown`
- Body: `The shared receipt will say refund pending and point back to refund status for settlement details.`
- CTA: `Track refund`

Refunded:
- Title: `Refund state will be shown`
- Body: `The shared receipt will say refunded and point back to refund status for settlement details.`
- CTA: `View refund`

## State Specifications
### Loading
Trigger:
- Screen loads and fresh delivery request is pending.

UI:
- Top bar.
- Preview skeleton.
- Control skeleton.
- Included data skeleton.

Copy:
- `Loading receipt sharing`

Accessibility:
- Announce `Loading receipt sharing.`

### Ready
Trigger:
- Fresh delivery detail is loaded and receipt is eligible.

UI:
- Preview card.
- Generate button.
- Included data section.
- Refund section if relevant.

Copy:
- Title: `Ready to share`
- Body: `Generate a sender-safe receipt from the latest Kra delivery record.`
- CTA: `Generate receipt`

### Generating
Trigger:
- User taps generate and artifact build is in progress.

UI:
- Progress indicator.
- Disabled controls except cancel if platform supports safe cancellation.
- Keep preview visible.

Copy:
- `Preparing receipt`
- `This usually takes a few seconds.`

Accessibility:
- Announce `Preparing receipt.`

Rules:
- Prevent duplicate generation taps.
- Do not navigate away automatically.

### System Share Open
Trigger:
- Artifact is ready and platform share sheet opens.

UI:
- If app remains visible behind sheet, show `Choose where to share`.

Copy:
- `Choose where to share your receipt.`

Rules:
- Do not claim success until platform callback/return indicates share sheet was presented.

### Success
Trigger:
- Platform accepts artifact into share flow or user returns from share sheet after presentation.

UI:
- Success panel.
- Share again.
- Open receipt.

Copy:
- Title: `Receipt ready`
- Body: `Your device opened sharing options for this receipt.`
- CTA: `Share again`

Rules:
- Do not say recipient received it.
- Do not say file was sent.

### Failure
Trigger:
- Fresh data loads but artifact generation or share presentation fails.

UI:
- Error panel.
- Retry.
- Copy fallback.
- Support link.

Copy:
- Title: `Receipt could not be shared`
- Body: `Try again, or copy a text receipt summary instead.`
- Primary: `Try again`
- Secondary: `Copy receipt text`

### Receipt Unavailable
Trigger:
- Fresh delivery detail has `paymentStatus=pending` or `failed`.

UI:
- Unavailable card.
- Open receipt/detail or resolve payment action.

Pending copy:
- Title: `Receipt is not ready`
- Body: `A receipt can be shared after Kra confirms payment.`
- CTA: `Open receipt`

Failed copy:
- Title: `Payment failed`
- Body: `Resolve payment before sharing a receipt.`
- CTA: `Resolve payment`

Rules:
- No export artifact is generated.

### Refund Pending
Trigger:
- Fresh delivery detail has `paymentStatus=refund_pending`.

UI:
- Preview card stamped `Refund pending`.
- Refund state section.
- Generate allowed.

Copy:
- `This receipt will show refund pending.`

### Refunded
Trigger:
- Fresh delivery detail has `paymentStatus=refunded`.

UI:
- Preview card stamped `Refunded`.
- Refund state section.
- Generate allowed.

Copy:
- `This receipt will show refunded.`

### Offline
Trigger:
- Device offline before fresh data is fetched.

UI:
- Offline state.

Copy:
- Title: `Connect to share receipt`
- Body: `Receipt sharing needs the latest payment state before export.`
- CTA: `Try again`

Rules:
- Do not generate official receipt from offline-only data.

### Stale Blocked
Trigger:
- Cached receipt exists but fresh request failed.

UI:
- Stale blocked state with cache preview lower priority.

Copy:
- Title: `Refresh before sharing`
- Body: `This saved receipt may not show the latest payment or refund state. Connect and refresh before sharing.`
- CTA: `Try again`

Rules:
- Copy text fallback is blocked unless explicitly labeled `saved details` and product approves. V1 blocks it.

### Not Found
Trigger:
- Backend returns not found.

Copy:
- Title: `Receipt not found`
- Body: `This receipt is not available from this account.`
- CTA: `Go to history`

### Not Authorized
Trigger:
- Backend denies access.

Copy:
- Title: `You cannot share this receipt`
- Body: `Sign in with the sender account that created this delivery.`
- CTA: `Sign in`

### API Error
Trigger:
- Fresh data request fails and no cache path is valid for export.

Copy:
- Title: `Receipt sharing did not load`
- Body: `We could not load the latest receipt data. Check your connection and try again.`
- CTA: `Try again`

### Session Expired
Trigger:
- Auth state expires.

Copy:
- Title: `Session expired`
- Body: `Sign in again to share this receipt.`
- CTA: `Sign in`

## Artifact Content Spec
### Header
Fields:
- `Kra`
- `Delivery receipt`
- State stamp.
- Generated date.

State stamp values:
- `Paid`
- `Refund pending`
- `Refunded`

### Payment Block
Fields:
- Amount.
- Currency.
- Payment state.
- Data statement.

Copy:
- `Amount recorded by Kra`
- `Payment state`
- `Generated from Kra delivery records for this sender account.`

Do not show:
- Provider reference.
- Payer phone.
- Payment ID.
- Paid timestamp.

### Delivery Block
Fields:
- Delivery ID.
- Tracking code.
- Route.
- Service type.
- Doorstep state.
- Delivery created.
- Latest update.

### Receiver And Package Block
Fields:
- Receiver name.
- Package description.
- Weight.
- Size tier.
- Fragile state.
- Declared value.

Do not show:
- Receiver phone.
- Receiver address.

### Refund Block
Visible for:
- `refund_pending`
- `refunded`

Refund pending copy:
- `Refund is pending. Open refund status in Kra for settlement details.`

Refunded copy:
- `Refund is marked completed in Kra. Open refund status in Kra for settlement details.`

Do not show:
- Refund amount.
- Refund reason.
- Refund reference.
- Settlement date.

### Footer
Fields:
- `This receipt was generated on this device from the sender's Kra account.`
- `For payment or refund questions, contact Kra support with the tracking code.`

Do not include:
- Legal tax claim.
- Terms not approved by legal.
- Staff-only support notes.

## Plain Text Fallback
Plain-text receipt summary includes:
- `Kra delivery receipt`
- Payment state.
- Amount.
- Delivery ID.
- Tracking code.
- Route.
- Service type.
- Receiver name.
- Package summary.
- Generated date.
- Refund state note when applicable.

Plain-text fallback excludes:
- Phone numbers.
- Provider reference.
- Payment ID.
- Staff IDs.
- Proof reference.
- Receiver address.

Copy success:
- `Receipt text copied.`

Copy failure:
- `Receipt text could not be copied. Try sharing again.`

## Visual System
### Art Direction
Use a focused export flow:
- Calm receipt preview.
- Clear state stamp.
- One dominant generate button.
- Minimal settings.
- Strong progress feedback.
- No decorative sharing grid.

Avoid:
- Custom social share buttons.
- Provider logos.
- Complex file settings.
- Receipt-paper gimmicks.
- Spinning screens without details.
- Finance admin table styling.

### Color Tokens
Use existing app tokens. If new roles are needed later:
- `surface.export.base`
- `surface.export.preview`
- `surface.export.stamp`
- `text.primary`
- `text.secondary`
- `text.muted`
- `border.subtle`
- `status.export.ready`
- `status.export.generating`
- `status.payment.confirmed`
- `status.refund.pending`
- `status.refund.settled`
- `status.error`
- `action.primary`

Color behavior:
- Paid stamp uses positive tone.
- Refund pending stamp uses attention tone.
- Refunded stamp uses neutral-positive tone.
- Failure uses critical tone.
- Stale blocked uses attention tone.
- Always pair color with text.

### Typography
Hierarchy:
- Screen title.
- Preview state stamp.
- Amount.
- Tracking code.
- Generate button.
- Included data headings.
- Fine print.

Rules:
- Amount must be readable.
- Fine print must not drop below accessible size.
- File name can use tabular or monospaced style only if app system supports it.

### Layout
Recommended order:
1. Top bar.
2. Receipt preview card.
3. Primary generate action.
4. Included data section.
5. Refund state section if applicable.
6. Failure or support recovery block.

Rules:
- Keep first viewport focused on export readiness.
- Avoid full receipt duplication.
- Keep support below primary export actions.

### Motion
Allowed:
- Short progress transition.
- Share sheet handoff feedback.
- Success check state.
- Error panel entrance.

Rules:
- Respect reduced motion.
- No looping progress after timeout.
- No amount animation.
- No decorative file flyout.

## Mobile Ergonomics
One-handed use:
- Generate button is reachable.
- Retry and copy fallback are reachable.
- Share again is reachable after return.

Small phones:
- Preview card stays compact.
- Long tracking code wraps or middle truncates.
- Included data list can wrap.
- Buttons stack vertically.

Large phones:
- Keep preview max width readable.
- Do not split into multiple columns.

Platform behavior:
- Use native share APIs for iOS and Android.
- Use platform print/save only through share options unless app platform requires a separate print action.
- Do not build custom recipient picker.

## Accessibility Requirements
### Screen Reader
Screen must expose:
- Screen title.
- Receipt identity.
- Payment/refund state.
- Amount.
- Generate action.
- Progress status.
- Success/failure status.
- Included/excluded data explanation.
- Fallback copy action.

Preview accessible label:
- `Receipt preview. {state}. Amount GHS {amount}. Tracking code {trackingCode}.`

Generate button accessible hint:
- `Creates a receipt file and opens device sharing options.`

### Status Announcements
Announce:
- `Preparing receipt.`
- `Sharing options opened.`
- `Receipt could not be shared.`
- `Receipt text copied.`
- `Refresh before sharing.`
- `Receipt is not ready.`

### Focus Order
Default:
- Back.
- Title.
- Preview card.
- Generate action.
- Included data.
- Refund state section if present.
- Support/recovery actions.

After generation failure:
- Move focus to failure heading.

After copy success:
- Keep focus on copy button and announce status.

After share sheet closes:
- Return focus to `Share again`.

### Contrast And Text Size
Requirements:
- State stamp must meet contrast AA.
- Primary button must meet target size.
- Preview card must survive large text.
- Artifact text must be readable when printed or saved.

### Reduced Motion
When reduced motion is enabled:
- Disable animated progress transitions.
- Use static progress indicator.
- Use instant success/failure panel.

## Copy System
Voice:
- Clear.
- Official.
- Brief.
- Task-focused.
- No overclaiming.

Do:
- Say `sharing options opened`.
- Say `generated from Kra delivery records`.
- Say `refund pending` or `refunded` inside shared artifact.
- Say `connect and refresh before sharing` for stale data.

Do not:
- Say `sent` unless OS confirms sending, which most share sheets do not.
- Say `paid on` without paid timestamp.
- Say `provider receipt`.
- Say `tax invoice`.
- Say `refund settled` unless payment state is `refunded`.
- Say `live` unless fresh request succeeded.

### Core Strings
Title:
- `Share receipt`

Ready title:
- `Ready to share`

Ready body:
- `Generate a sender-safe receipt from the latest Kra delivery record.`

Primary CTA:
- `Generate receipt`

Generating:
- `Preparing receipt`

Share opened:
- `Choose where to share your receipt.`

Success title:
- `Receipt ready`

Success body:
- `Your device opened sharing options for this receipt.`

Failure title:
- `Receipt could not be shared`

Failure body:
- `Try again, or copy a text receipt summary instead.`

Stale blocked title:
- `Refresh before sharing`

Stale blocked body:
- `This saved receipt may not show the latest payment or refund state. Connect and refresh before sharing.`

Unavailable pending:
- `A receipt can be shared after Kra confirms payment.`

Unavailable failed:
- `Resolve payment before sharing a receipt.`

## Component Inventory
Claude Code should build or reuse:
- `SenderReceiptShareScreen`
- `ReceiptShareTopBar`
- `ReceiptExportPreviewCard`
- `ReceiptExportStateStamp`
- `ReceiptExportPrimaryAction`
- `ReceiptIncludedDataList`
- `ReceiptExportRefundNotice`
- `ReceiptExportProgressState`
- `ReceiptExportSuccessState`
- `ReceiptExportFailureState`
- `ReceiptExportUnavailableState`
- `ReceiptExportOfflineState`
- `ReceiptExportStaleBlockedState`
- `ReceiptTextFallbackButton`
- `ReceiptShareSupportBlock`

Component constraints:
- Components must use `deliveryDetailResponseSchema` data.
- Components must not require payment repository records.
- Components must not expose internal IDs.
- Components must not perform backend mutations.
- Components must isolate client export logic behind one service/helper.

## Test IDs
Required test IDs:
- `screen-sender-receipt-share`
- `sender-receipt-share-loading`
- `sender-receipt-share-preview`
- `sender-receipt-share-state-stamp`
- `sender-receipt-share-amount`
- `sender-receipt-share-generate`
- `sender-receipt-share-progress`
- `sender-receipt-share-success`
- `sender-receipt-share-failure`
- `sender-receipt-share-copy-text`
- `sender-receipt-share-open-receipt`
- `sender-receipt-share-track-refund`
- `sender-receipt-share-support`
- `sender-receipt-share-included-data`
- `sender-receipt-share-refund-notice`
- `sender-receipt-share-unavailable`
- `sender-receipt-share-offline`
- `sender-receipt-share-stale-blocked`
- `sender-receipt-share-retry`

Test ID rules:
- Do not include tracking code in test ID.
- Keep IDs stable across visual revisions.

## Analytics Events
Recommended events:
- `sender_receipt_share_viewed`
- `sender_receipt_share_loaded`
- `sender_receipt_share_blocked_unavailable`
- `sender_receipt_share_blocked_stale`
- `sender_receipt_export_started`
- `sender_receipt_export_generated`
- `sender_receipt_share_sheet_opened`
- `sender_receipt_export_failed`
- `sender_receipt_text_copied`
- `sender_receipt_share_retry_tapped`
- `sender_receipt_share_refund_tapped`
- `sender_receipt_share_support_tapped`

Analytics payload:
- `paymentStatus`
- `currentStatus`
- `serviceType`
- `doorstepRequested`
- `amountGhs`
- `exportFormat`
- `failureStage`
- `isStale`

Do not send:
- Receiver name.
- Tracking code.
- Delivery ID unless analytics policy approves hashed identifiers.
- Package description.
- Declared value.
- Generated file contents.
- Provider reference.
- Raw platform share error.

## Performance Requirements
Targets:
- Fresh data check starts within `100ms` of screen load.
- Generate action starts within `100ms` of tap.
- Receipt artifact generation completes within `3 seconds` for normal content.
- If generation exceeds `3 seconds`, keep progress copy visible.
- If generation exceeds `10 seconds`, show timeout recovery.

Rules:
- Do not fetch timeline.
- Do not fetch proof assets.
- Do not render maps.
- Do not upload file to backend.
- Use lightweight PDF/image generation.
- Keep fallback text generation instant.

## Timeout And Failure Handling
Timeout at `10 seconds`:
- Stop generation.
- Show failure state.
- Offer retry and text fallback.

Failure stages:
- `fresh_data_load_failed`
- `receipt_ineligible`
- `artifact_generation_failed`
- `share_sheet_failed`
- `copy_failed`

Each failure must:
- Show plain language.
- Preserve route context.
- Avoid raw stack trace.
- Offer next action.

## Privacy And Security
Privacy rules:
- Only authorized sender can share.
- Fresh backend authorization is required.
- Generated artifact excludes receiver phone.
- Generated artifact excludes payer phone.
- Generated artifact excludes provider reference.
- Generated artifact excludes staff actor IDs.
- Generated artifact excludes proof reference.
- Generated artifact excludes internal notes.
- Generated artifact excludes raw backend metadata.

Security rules:
- Do not store generated artifact in app cache after share unless platform requires temp file.
- If temp file is required, delete it after share attempt when feasible.
- Do not upload generated artifact to backend.
- Do not expose artifact path in analytics.
- Do not include auth tokens in file metadata.

## Edge Cases
### Pending Payment
Behavior:
- Block export.
- Explain receipt can be shared after payment confirmation.
- Route to receipt detail or delivery detail.

### Failed Payment
Behavior:
- Block export.
- Route to payment recovery or receipt detail.

### Refund Pending
Behavior:
- Allow export.
- Stamp artifact `Refund pending`.
- Add refund pending note.
- Route to refund status.

### Refunded
Behavior:
- Allow export.
- Stamp artifact `Refunded`.
- Add refunded note.
- Route to refund status.

### Offline With Cached Receipt
Behavior:
- Block official export.
- Explain refresh requirement.
- Retry when online.

### Share Sheet Cancelled
Behavior:
- Treat as neutral return.
- Show `Receipt ready` and `Share again`.
- Do not show error.

### Share Sheet Unavailable
Behavior:
- Show failure.
- Offer text fallback.

### PDF Generation Unsupported
Behavior:
- Use platform-supported artifact fallback if available.
- Keep text fallback.
- Explain that file sharing is unavailable if no artifact can be produced.

### Long Receiver Or Package Text
Behavior:
- Wrap in artifact.
- Keep layout readable.
- Do not truncate inside exported PDF if avoidable.

### Unknown Station Mapping
Behavior:
- Use station ID.
- Do not block export.

### Invalid Delivery ID
Behavior:
- Show not found or route invalid state.
- Do not attempt export.

## QA Acceptance Criteria
Functional:
- Screen renders at `/(sender)/receipts/:deliveryId/share`.
- Screen requires authenticated sender access.
- Screen fetches fresh `get_delivery`.
- Confirmed payment can generate artifact.
- Refund pending can generate artifact with refund pending stamp.
- Refunded can generate artifact with refunded stamp.
- Pending payment blocks generation.
- Failed payment blocks generation.
- Stale-only data blocks generation.
- Generate opens native share path or platform equivalent.
- Share failure shows retry and copy text fallback.
- Copy text fallback produces sender-safe text.
- Success copy does not claim recipient delivery.
- Refund CTA routes to refund status.
- Open receipt routes to receipt detail.

Contract:
- No payment mutation endpoint is called.
- No refund mutation endpoint is called.
- No delivery mutation endpoint is called.
- No timeline endpoint is required.
- No fields outside `deliveryDetailResponseSchema` are required.
- Artifact uses only approved fields.

Privacy:
- Receiver phone absent from artifact.
- Payer phone absent from artifact.
- Provider reference absent from artifact.
- Payment ID absent unless future contract permits it.
- Staff IDs absent.
- Proof reference absent.
- Raw backend metadata absent.

Accessibility:
- Generate action has accessible hint.
- Progress is announced.
- Share-open state is announced.
- Failure heading receives focus.
- Copy success is announced.
- Artifact text is readable.
- Large text layout survives.
- Reduced motion works.

Visual:
- Preview card is clear and not overloaded.
- Refund state is impossible to miss.
- Generate button is dominant.
- Failure recovery is visible.
- No custom share-network clutter appears.

## Implementation Notes For Claude Code
Build this screen as a focused client export/share route.

Use:
- `get_delivery`.
- `deliveryDetailResponseSchema`.
- `stationCatalog`.
- Native platform share APIs.
- Lightweight local artifact generation.

Do not use:
- `initialize_payment`.
- `verify_payment`.
- `refund_payment`.
- `settle_refund_payment`.
- `get_delivery_timeline`.
- Admin finance endpoints.
- Provider webhook data.
- Payment repository internals.
- Backend file upload.

Implementation sequence:
1. Add typed fresh `get_delivery` load for route `deliveryId`.
2. Add eligibility mapper for `confirmed`, `refund_pending`, `refunded`, `pending`, and `failed`.
3. Add export data builder from approved fields.
4. Add artifact renderer with PDF preferred and platform fallback.
5. Add native share invocation.
6. Add text fallback builder.
7. Add all loading, ready, generating, success, failure, unavailable, offline, stale, not-found, unauthorized, and session states.
8. Add accessibility announcements.
9. Add privacy-safe analytics.
10. Add tests for every payment/refund/export state.

## Open Product Decisions
No blocking decisions for v1.

Future decisions:
- Dedicated backend receipt endpoint.
- Server-signed receipt artifact.
- Receipt number format.
- Tax invoice support.
- Sender-safe payment reference exposure.
- Masked payer phone exposure.
- Backend email receipt delivery.
- Long-term receipt file storage.
- Business account bulk export.

These decisions must not be implied by this screen.

## Final Handoff Summary
Claude Code should build `SenderReceiptShare` as a focused, client-side receipt export route. It must fetch fresh `get_delivery` data, allow export only for `confirmed`, `refund_pending`, and `refunded` states, stamp refund state directly into the artifact, block stale/pending/failed export, use native sharing, provide retry and plain-text fallback on failure, and exclude receiver phone, payer phone, provider reference, payment ID, staff IDs, proof references, and raw metadata from both files and analytics.

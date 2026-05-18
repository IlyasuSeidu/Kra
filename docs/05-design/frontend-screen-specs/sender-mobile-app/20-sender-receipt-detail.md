# Sender Receipt Detail Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderReceiptDetail` |
| App | `apps/mobile` |
| Route | `/(sender)/receipts/:deliveryId` |
| Primary test ID | `screen-sender-receipt-detail` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `deliveryDetailResponseSchema`, payment policy, refund policy |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/history`, `/(sender)/receipts/:deliveryId/share`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/support` |
| Required states | `loading`, `ready_paid`, `refund_pending`, `refunded`, `receipt_unavailable`, `refreshing`, `stale_cache`, `not_found`, `not_authorized`, `offline`, `api_error`, `session_expired` |

## Product Job
This screen shows the sender a clear, trustworthy receipt for a delivery payment after payment policy permits receipt access. It must summarize the payment, delivery, route, receiver, package, and refund state without pretending the current backend exposes a full finance ledger or provider-issued receipt.

The sender should be able to:
- Confirm that payment is recorded by Kra.
- See the paid amount tied to the locked delivery quote.
- See the delivery and tracking identifiers.
- See route, service, doorstep, receiver, and package summary.
- See whether the receipt is paid, refund pending, or refunded.
- Open refund status when applicable.
- Open delivery detail or timeline for operational context.
- Open the receipt share route.
- Understand when receipt access is not yet available.
- Recover safely when offline, stale, unauthorized, missing, or failed.

This screen is not:
- The payment method screen.
- The provider return screen.
- The payment processing screen.
- The failed payment recovery screen.
- The refund tracker.
- The receipt share/export screen.
- A provider dashboard.
- A finance admin ledger.
- A reconciliation review.
- A tax invoice unless future business rules define tax invoice requirements.

## Audience
Primary audience:
- Authenticated senders who completed payment.
- Small-business senders who need proof of payment for their own records.
- Senders whose payment later entered refund pending or refunded state.
- Senders opening receipt from delivery detail, history, payment result, notification, or support.

Secondary audience:
- Claude Code implementing the receipt route.
- QA validating payment-state gates.
- Finance and support reviewers checking customer-safe receipt copy.
- Product reviewers confirming the receipt does not overclaim provider settlement details.

## User State
The sender expects proof. They may be sharing payment confirmation with a receiver, reconciling business expenses, checking a refund, or asking support for help. The screen must feel official, stable, and easy to read. It must not create anxiety by exposing provider internals, staff IDs, or ambiguous refund language.

The sender may be:
- Coming from a successful payment result.
- Opening a delivered package receipt.
- Returning from support.
- Checking a cancelled delivery that entered refund pending.
- Checking a completed refund.
- Trying to view a receipt before payment is confirmed.
- Opening from saved history on weak data.

The screen must:
- Treat backend delivery detail as authoritative.
- Show receipt only for permitted payment states.
- Keep payment and refund truth above decorative details.
- Avoid showing fields not returned by `deliveryDetailResponseSchema`.
- Route sharing/exporting to `SenderReceiptShare`.
- Route refund detail to `SenderRefundStatus`.
- Never mutate payment, refund, delivery, issue, or proof state.

## Primary Action
Primary action changes by state:
- `ready_paid`: `Share receipt`
- `refund_pending`: `Track refund`
- `refunded`: `View refund`
- `receipt_unavailable` with `pending` or `failed`: `Resolve payment`
- `offline` with no cache: `Try again`
- `api_error`: `Try again`

Secondary actions:
- `Open delivery`
- `View timeline`
- `Copy tracking code`
- `Contact support`
- `Go to history`

CTA behavior:
- `Share receipt` routes to `/(sender)/receipts/:deliveryId/share`.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `View refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `Resolve payment` routes to `/(sender)/payments/:deliveryId/recover` for `failed`, or to delivery detail for `pending`.
- `Open delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `View timeline` routes to `/(sender)/deliveries/:deliveryId/timeline`.
- `Copy tracking code` copies only `trackingCode`.
- `Contact support` routes to support with delivery context.
- `Try again` refetches `get_delivery`.

Blocked behavior:
- Do not initialize payment.
- Do not verify payment.
- Do not request refund.
- Do not settle refund.
- Do not generate export artifact on this route.
- Do not expose provider reference unless a future sender-safe receipt contract adds it.
- Do not expose payer phone.
- Do not expose `senderId`, `currentCustodyActorId`, assigned driver ID, assigned courier ID, proof reference, or raw internal event type as primary receipt copy.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Receipt state.
- Amount.
- Delivery tracking code.
- Delivery route.
- Payment status.
- Receipt date basis.
- Primary next action.

The first viewport must answer:
- Was this paid?
- How much was recorded?
- Which delivery is this for?
- What can I do next?

For refund states, first meaningful value must also answer:
- Is refund still pending or completed?
- Where do I track refund details?

## Main Tension
The current backend exposes delivery detail, not a dedicated receipt ledger. The UI must still feel official and complete without inventing payment fields. It should display a strong customer-facing receipt summary while being explicit about what the backend can prove today.

The design must balance:
- Official receipt feel against limited current payment detail fields.
- Payment proof against provider privacy.
- Refund visibility against missing refund amount/reference on the delivery detail contract.
- Readability against legal/financial precision.
- Share readiness against keeping export logic in the share screen.

## Design Brief
User and job:
- An authenticated sender wants payment proof for one delivery.

Context of use:
- Mobile, post-payment, often shared, sometimes opened during support or refund review.

Entry point:
- PaymentResult.
- SenderDeliveryDetail.
- SenderDeliveryHistory.
- SenderRefundStatus.
- SenderSupportThread.
- Notification.

Success state:
- Sender confirms payment state and routes to share, refund, delivery detail, timeline, or support.

Primary action:
- State-driven receipt sharing or refund tracking.

Navigation model:
- Receipt detail is a read-only proof surface. Share/export is one route deeper.

Density:
- Medium-low. Receipt data must be scannable, not ledger-dense.

Visual thesis:
- A quiet official payment card with strong amount hierarchy, verification cues, and clean delivery context.

Restraint rule:
- Avoid provider dashboards, accounting tables, celebratory graphics, provider raw fields, and dense legal footers.

Product lens:
- Customer trust and payment accountability.

System stance:
- Native mobile receipt surface with strong structured summary and safe export handoff.

Interaction thesis:
- The sender should be able to verify, share, and move on in under 30 seconds.

Signature move:
- A "payment seal" header that combines amount, payment state, tracking code, and route in one official block.

Activation event:
- Sender opens share route, refund route, delivery detail, or timeline.

## Elite Quality Gate
This spec is not closed unless receipt detail is official, contract-accurate, and payment-state safe.

Non-negotiable quality requirements:
- First viewport shows receipt state, amount, tracking code, route, and primary action.
- Receipt displays only when `paymentStatus` allows it.
- `pending` and `failed` states must not look like paid receipts.
- `refund_pending` and `refunded` states must show refund callouts.
- Share/export must route to `SenderReceiptShare`.
- Refund details must route to `SenderRefundStatus`.
- The screen must call `get_delivery` and no mutation endpoints.
- The screen must not require fields absent from `deliveryDetailResponseSchema`.
- The screen must not show provider reference, payer phone, staff IDs, proof reference, or raw custody actor IDs.
- Amount must come from `quote.amount` only when the payment state makes receipt display valid.
- The screen must handle stale data without implying current verified finance state.
- Screen reader, large text, high contrast, reduced motion, and small phones must be supported.

Closure rule:
- If the receipt can render for failed payment, the screen remains open.
- If refund pending looks like settled refund, the screen remains open.
- If share/export is done directly on this route, the screen remains open.
- If provider reference is shown without a sender-safe contract, the screen remains open.
- If the paid amount is calculated locally outside the locked quote, the screen remains open.
- If the screen cannot explain why receipt is unavailable, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines for sharing and activity views support using the platform share model from the dedicated share route.
- Apple HIG lists and navigation guidance supports structured receipt drill-down and predictable back navigation.
- Material Design 3 cards, lists, dividers, buttons, and badges support clear receipt hierarchy and status labeling.
- W3C status-message and error-identification guidance supports accessible payment/refund state announcements.
- Stripe customer receipt and payment documentation reinforces the need to separate customer-facing payment confirmation from backend provider objects.
- Kra payment policy says confirmed payments surface receipts, failed payments block dispatch, and unresolved payments show review guidance.
- Kra refund policy says approved refunds should appear on the same payment timeline as the original charge, but the current delivery detail contract does not expose full refund fields.
- Kra privacy policy says payment and refund records are retained for `36 months`.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/sharing
- https://developer.apple.com/design/human-interface-guidelines/activity-views
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/lists/overview
- https://m3.material.io/components/buttons/overview
- https://m3.material.io/components/badges/overview
- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- https://docs.stripe.com/receipts
- `docs/04-features/payments-spec.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- Receipt detail is read-only.
- Receipt detail uses `GET /v1/deliveries/:id`.
- Response uses `deliveryDetailResponseSchema`.
- There is no dedicated customer receipt endpoint yet.
- Delivery detail does not expose `paymentId`.
- Delivery detail does not expose provider reference.
- Delivery detail does not expose payer phone.
- Delivery detail does not expose refund amount, refund reason, refund reference, or refund settled time.
- V1 does not support partial payment.
- `quote.amount` is the locked delivery charge.
- Receipt can render for `paymentStatus=confirmed`.
- Receipt can render with refund callout for `paymentStatus=refund_pending`.
- Receipt can render with refunded callout for `paymentStatus=refunded`.
- Receipt must not render as paid for `paymentStatus=pending` or `failed`.
- Share/export is handled by `SenderReceiptShare`.
- Refund detail is handled by `SenderRefundStatus`.
- Backend sets no-store on delivery detail.
- Local cached delivery detail may exist, but stale display must be visibly marked.

Future receipt endpoint should add:
- `paymentId`
- payment provider display name
- sender-safe payment reference
- payer phone masked
- paid timestamp
- receipt number
- refund amount
- refund reason
- refund reference
- refund settled timestamp
- tax fields if business requires tax invoice support

Until that endpoint exists, this screen must not invent those fields.

## Non-Goals
Do not implement these in this screen:
- Payment initialization.
- Payment verification.
- Provider return handling.
- Payment retry form.
- Refund request.
- Refund approval.
- Refund settlement.
- Share/export artifact creation.
- PDF rendering.
- Image rendering.
- Email sending.
- Receipt editing.
- Tax invoice generation.
- Admin finance notes.
- Reconciliation mismatch explanation.
- Full payment timeline.
- Full delivery timeline.
- Full proof viewer.
- Support conversation.

## Backend Contract
### Endpoint
- Operation name: `get_delivery`.
- HTTP route: `GET /v1/deliveries/:id`.
- Access: authenticated.
- Server handler: `rateLimitedApp.get("/v1/deliveries/:id", authenticated read prehandler, require authenticated)`.
- Server response policy: `setNoStore(reply)`.

### Route Input
Route param:
- `deliveryId` from `/(sender)/receipts/:deliveryId`.

Rules:
- Do not accept tracking code as route identity for this screen.
- Do not use query params to determine payment status.
- Do not trust cached ownership; backend authorization must decide.

### Response Fields Used
Required fields:
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
- `latestEvent.occurredAt`
- `latestTouchpoint`
- `createdAt`

Fields allowed only if carefully translated:
- `finalProof.type`
- `finalProof.receivedByName`
- `finalProof.capturedAt`

Fields not visible in receipt:
- `senderId`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `finalProof.reference`
- raw `latestEvent.type` as primary copy
- raw station IDs when station names are available

### Receipt Eligibility
Render receipt content when:
- `paymentStatus=confirmed`
- `paymentStatus=refund_pending`
- `paymentStatus=refunded`

Render receipt unavailable state when:
- `paymentStatus=pending`
- `paymentStatus=failed`

Do not show paid receipt for:
- Missing delivery.
- Unauthorized delivery.
- Pending payment.
- Failed payment.
- Invalid delivery detail response.

### Amount Rule
Displayed amount:
- Use `quote.currency` and `quote.amount`.

Format:
- `GHS {amount}`.
- The current money schema stores integer amount.
- Do not infer pesewas.
- Do not recalculate pricing locally.
- Do not apply refund math locally.

Refund amount:
- Do not show refund amount from this screen until a contract exposes it.
- Link to refund route for details.

## Information Architecture
### Top Bar
Contains:
- Back button.
- Title: `Receipt`.
- Optional overflow with `Contact support`.

Rules:
- Back returns to previous route if available.
- If deep-linked, back routes to delivery detail or history.
- Do not place share icon as the only primary action unless text CTA is also available in first viewport.

### Payment Seal Header
Primary visual block.

Content:
- Status eyebrow.
- Amount.
- Receipt state.
- Tracking code.
- Route label.
- Freshness/stale marker when applicable.

Paid state copy:
- Eyebrow: `Payment recorded`
- Amount: `GHS {amount}`
- State: `Paid`
- Support: `Receipt for delivery {trackingCode}`

Refund pending copy:
- Eyebrow: `Payment recorded`
- Amount: `GHS {amount}`
- State: `Refund pending`
- Support: `Kra has a refund action in progress for this payment.`

Refunded copy:
- Eyebrow: `Payment recorded`
- Amount: `GHS {amount}`
- State: `Refunded`
- Support: `This payment has completed refund flow.`

Receipt unavailable pending copy:
- Eyebrow: `Receipt unavailable`
- State: `Payment pending`
- Support: `A receipt appears after Kra confirms payment.`

Receipt unavailable failed copy:
- Eyebrow: `Receipt unavailable`
- State: `Payment failed`
- Support: `Resolve payment before a receipt can be issued.`

### Primary Action Area
One dominant CTA:
- Paid: `Share receipt`
- Refund pending: `Track refund`
- Refunded: `View refund`
- Pending/failed: `Resolve payment`

Secondary text action:
- `Open delivery`
- `View timeline`

Rules:
- Do not show more than two visible actions in first viewport.
- Place support in overflow or lower support block.

### Receipt Summary
Fields:
- Receipt basis: `Kra delivery payment`
- Amount: `GHS {quote.amount}`
- Currency: `GHS`
- Payment state.
- Delivery ID.
- Tracking code.
- Created date from `createdAt`.
- Latest update date from `latestEvent.occurredAt`.

Do not label `createdAt` as paid time.
Use:
- `Delivery created`
- `Latest payment/delivery update` only if wording does not imply payment timestamp.

If no paid timestamp exists:
- Do not show `Paid on`.
- Use `Payment state confirmed by Kra` in paid state.

### Delivery Context
Fields:
- Route.
- Service type.
- Doorstep requested.
- Receiver name.
- Package description.
- Weight.
- Size tier.
- Fragile marker.
- Declared value.

Rules:
- Keep delivery context below payment seal.
- Use rows, not dense paragraph.
- Receiver phone is not shown.

### Refund Callout
Visible only for:
- `refund_pending`
- `refunded`

Refund pending:
- Title: `Refund in progress`
- Body: `Track refund status for settlement details and next steps.`
- CTA: `Track refund`

Refunded:
- Title: `Refund completed`
- Body: `Open refund status for settlement details.`
- CTA: `View refund`

Rules:
- Do not show refund amount without contract support.
- Do not show refund reference without contract support.
- Do not promise completion time beyond refund policy text.

### Support And Policy Block
Content:
- Short explanation for disputes.
- Link to support.
- Link to public refund policy if web route is available.

Copy:
- Title: `Need help with this receipt?`
- Body: `Support can review payment, delivery, refund, and timeline records for this delivery.`
- CTA: `Contact support`

## State Specifications
### Loading
Trigger:
- Initial `get_delivery` request is pending and no cache is available.

UI:
- Header skeleton.
- Payment seal skeleton.
- Summary row skeletons.
- No blank screen.

Copy:
- `Loading receipt`

Accessibility:
- Announce `Loading receipt.`

### Ready Paid
Trigger:
- `paymentStatus=confirmed`.

UI:
- Payment seal with paid state.
- Share receipt primary CTA.
- Receipt summary.
- Delivery context.
- Support block.

Copy:
- `Payment recorded`
- `Paid`
- `Share receipt`

### Refund Pending
Trigger:
- `paymentStatus=refund_pending`.

UI:
- Payment seal with refund pending state.
- Refund callout above delivery context.
- `Track refund` primary CTA.
- Secondary `Share receipt` can appear lower only if product allows sharing refund-pending receipt.

Copy:
- `Refund pending`
- `Track refund`

Rules:
- Make clear original payment was recorded.
- Do not imply refund is settled.

### Refunded
Trigger:
- `paymentStatus=refunded`.

UI:
- Payment seal with refunded state.
- Refund completed callout.
- `View refund` primary CTA.
- Optional `Share receipt` secondary lower on screen if product allows.

Copy:
- `Refunded`
- `View refund`

Rules:
- Do not show refund reference or amount unless future contract supplies it.

### Receipt Unavailable
Trigger:
- `paymentStatus=pending` or `paymentStatus=failed`.

UI:
- Receipt unavailable state.
- Payment state explanation.
- Resolve payment or open delivery CTA.

Pending copy:
- Title: `Receipt not ready`
- Body: `A receipt appears after Kra confirms payment for this delivery.`
- CTA: `Open delivery`

Failed copy:
- Title: `Payment failed`
- Body: `Resolve payment before a receipt can be issued.`
- CTA: `Resolve payment`

Rules:
- Do not render amount as paid.
- Amount can appear only as `Quoted amount`, not paid amount, if needed.

### Refreshing
Trigger:
- User pulls to refresh or taps retry while data is already visible.

UI:
- Keep current receipt visible.
- Show refresh indicator.
- Do not clear payment seal.

Copy:
- `Refreshing receipt`

### Stale Cache
Trigger:
- Cached receipt data is shown after offline or failed fresh request.

UI:
- Persistent stale banner.
- Receipt content remains visible but marked.

Copy:
- Banner: `Showing saved receipt details. Refresh to confirm the latest payment or refund state.`

Rules:
- Disable share if product requires fresh state for exported receipt.
- Allow open delivery if detail route can handle stale state.

### Offline
Trigger:
- Device is offline.

UI:
- If cache exists, use stale cache state.
- If no cache, show offline state.

Copy:
- Title: `Receipt needs a connection`
- Body: `Connect to the internet to load this receipt.`
- CTA: `Try again`

### API Error
Trigger:
- `get_delivery` fails and no cache is available.

UI:
- Full-state error.
- Retry.
- Support link after repeated failures.

Copy:
- Title: `Receipt did not load`
- Body: `We could not load this receipt. Check your connection and try again.`
- CTA: `Try again`

### Not Found
Trigger:
- Backend returns not found.

UI:
- Missing receipt state.

Copy:
- Title: `Receipt not found`
- Body: `This delivery receipt is not available from this account.`
- CTA: `Go to history`

### Not Authorized
Trigger:
- Backend denies access.

UI:
- Protected state.

Copy:
- Title: `You cannot view this receipt`
- Body: `Sign in with the sender account that created this delivery.`
- CTA: `Sign in`

### Session Expired
Trigger:
- Auth state expires.

UI:
- Session state.

Copy:
- Title: `Session expired`
- Body: `Sign in again to view your receipt.`
- CTA: `Sign in`

## Visual System
### Art Direction
Use a premium financial-document style:
- Calm paper-like surface.
- Strong amount hierarchy.
- Clear verification cue.
- Compact route context.
- Thin dividers.
- Minimal color.
- No noisy background.

Avoid:
- Confetti.
- Provider logos unless approved.
- Decorative calculators.
- Long legal blocks in first viewport.
- Status badge clutter.
- Receipt tape visual gimmicks.
- Admin ledger density.

### Color Tokens
Use existing app tokens when available. If tokens are needed later, map to:
- `surface.receipt.base`
- `surface.receipt.seal`
- `surface.receipt.row`
- `text.primary`
- `text.secondary`
- `text.muted`
- `border.receipt`
- `status.payment.confirmed`
- `status.payment.pending`
- `status.payment.failed`
- `status.refund.pending`
- `status.refund.settled`
- `action.primary`
- `action.secondary`

Color behavior:
- Paid uses positive tone but remains official, not celebratory.
- Refund pending uses attention tone.
- Refunded uses neutral-positive tone.
- Failed uses critical tone.
- Pending uses attention tone.
- Always pair color with text.

### Typography
Hierarchy:
- Screen title: compact.
- Amount: strongest text on page.
- Receipt state: strong but below amount.
- Tracking code: high-utility, secondary to amount.
- Section headings: clear and short.
- Row labels: secondary.
- Row values: primary.

Rules:
- Do not use tiny receipt-print typography.
- Keep amount readable on small phones.
- Use tabular numerals if design system supports it.
- Do not overemphasize delivery ID over tracking code.

### Layout
Recommended order:
1. Top bar.
2. Payment seal header.
3. Primary action area.
4. Refund callout when applicable.
5. Receipt summary.
6. Delivery context.
7. Support and policy block.

Spacing:
- Use generous spacing around payment seal.
- Use compact row spacing inside summary.
- Preserve bottom safe area.
- Keep first viewport focused on amount and status.

### Motion
Allowed motion:
- Page entrance fade/slide for payment seal.
- Pull-to-refresh indicator.
- Button press feedback.
- Copy tracking code confirmation.

Rules:
- Respect reduced motion.
- Avoid looping verification animations.
- Avoid amount counting animation.
- Avoid receipt tear-off animations.

## Mobile Ergonomics
One-handed use:
- Primary CTA must be reachable.
- Share/refund CTA should not be only in top-right icon.
- Copy tracking code must be easy to trigger.
- Row values should not require horizontal scrolling.

Small phones:
- Payment seal stacks.
- Amount remains visible.
- Tracking code can wrap or truncate middle if full value is copyable.
- Summary rows wrap values below labels.

Large phones:
- Keep receipt narrow enough for comfortable reading.
- Do not add extra columns.

Keyboard:
- No keyboard expected on this screen.

## Accessibility Requirements
### Screen Reader
Screen must expose:
- Screen title.
- Receipt state.
- Amount.
- Tracking code.
- Route.
- Payment status.
- Refund state when applicable.
- Section headings.
- Primary and secondary actions.
- Stale/offline/error state.

Payment seal accessible label:
- `Receipt. Payment recorded. Amount GHS {amount}. Tracking code {trackingCode}.`

Refund pending accessible label:
- `Receipt. Payment recorded. Refund pending. Amount GHS {amount}. Tracking code {trackingCode}.`

Refunded state accessible label:
- `Receipt. Payment recorded. Refunded. Amount GHS {amount}. Tracking code {trackingCode}.`

Receipt unavailable accessible label:
- `Receipt unavailable. Payment {paymentStatus}.`

### Focus Order
Default:
- Back button.
- Screen title.
- Payment seal.
- Primary CTA.
- Secondary actions.
- Receipt summary rows.
- Delivery context rows.
- Support block.

When copy tracking code succeeds:
- Announce status without moving focus.

When stale banner appears:
- Announce once.

### Contrast And Text Size
Requirements:
- Amount must meet contrast AA.
- Status labels must meet contrast AA.
- Buttons must meet target size.
- Rows must expand for large text.
- Values must not overlap labels.

### Reduced Motion
When reduced motion is enabled:
- Remove entrance motion.
- Use instant copy confirmation.
- Keep refresh accessible.

## Copy System
Voice:
- Official.
- Direct.
- Calm.
- Financially precise.
- No hype.

Do:
- Say `Payment recorded` instead of unsupported provider settlement wording.
- Say `Receipt not ready` for pending state.
- Say `Resolve payment` for failed state.
- Say `Track refund` when refund details belong elsewhere.
- Use `GHS` consistently.

Do not:
- Say `Paid on` without paid timestamp.
- Say `Provider settled` without provider settlement contract.
- Use `Refund completed` only for settled refund state.
- Say `Tax invoice` unless future tax rules exist.
- Say `Guaranteed refund`.
- Say `Live receipt` unless data is live.

### Core Strings
Title:
- `Receipt`

Primary paid CTA:
- `Share receipt`

Primary refund pending CTA:
- `Track refund`

Primary refunded CTA:
- `View refund`

Payment failed CTA:
- `Resolve payment`

Secondary:
- `Open delivery`
- `View timeline`
- `Copy tracking code`
- `Contact support`
- `Go to history`

### Receipt Rows
Recommended labels:
- `Receipt type`
- `Payment state`
- `Amount`
- `Currency`
- `Delivery ID`
- `Tracking code`
- `Delivery created`
- `Latest update`
- `Route`
- `Service`
- `Doorstep`
- `Receiver`
- `Package`
- `Weight`
- `Size`
- `Fragile`
- `Declared value`

Recommended values:
- `Kra delivery payment`
- `Paid`
- `Refund pending`
- `Refunded`
- `Standard`
- `Express`
- `Doorstep requested`
- `Station pickup`
- `Fragile`
- `Not fragile`

### Unavailable Copy
Pending:
- Title: `Receipt not ready`
- Body: `A receipt appears after Kra confirms payment for this delivery.`
- CTA: `Open delivery`

Failed:
- Title: `Payment failed`
- Body: `Resolve payment before a receipt can be issued.`
- CTA: `Resolve payment`

### Stale Copy
Banner:
- `Showing saved receipt details. Refresh to confirm the latest payment or refund state.`

### Support Copy
Title:
- `Need help with this receipt?`

Body:
- `Support can review payment, delivery, refund, and timeline records for this delivery.`

CTA:
- `Contact support`

## Component Inventory
Claude Code should build or reuse:
- `SenderReceiptDetailScreen`
- `ReceiptTopBar`
- `ReceiptPaymentSeal`
- `ReceiptStatusBadge`
- `ReceiptPrimaryActions`
- `ReceiptSummarySection`
- `ReceiptSummaryRow`
- `ReceiptDeliveryContextSection`
- `ReceiptRefundCallout`
- `ReceiptSupportBlock`
- `ReceiptUnavailableState`
- `ReceiptOfflineState`
- `ReceiptErrorState`
- `ReceiptStaleBanner`
- `ReceiptSkeleton`
- `CopyTrackingCodeButton`

Component constraints:
- Components must accept `deliveryDetailResponseSchema` data.
- Components must not require payment records.
- Components must not require provider references.
- Components must not perform export.
- Components must not perform mutations.

## Test IDs
Required test IDs:
- `screen-sender-receipt-detail`
- `sender-receipt-loading`
- `sender-receipt-payment-seal`
- `sender-receipt-amount`
- `sender-receipt-status`
- `sender-receipt-tracking-code`
- `sender-receipt-copy-tracking`
- `sender-receipt-share`
- `sender-receipt-track-refund`
- `sender-receipt-view-refund`
- `sender-receipt-open-delivery`
- `sender-receipt-view-timeline`
- `sender-receipt-summary`
- `sender-receipt-delivery-context`
- `sender-receipt-refund-callout`
- `sender-receipt-support`
- `sender-receipt-unavailable`
- `sender-receipt-offline`
- `sender-receipt-error`
- `sender-receipt-stale-banner`
- `sender-receipt-refresh`

Test ID rules:
- Keep IDs stable.
- Do not include tracking code in test ID.
- Use route `deliveryId` only when row-level uniqueness is needed.

## Analytics Events
Recommended events:
- `sender_receipt_viewed`
- `sender_receipt_loaded`
- `sender_receipt_load_failed`
- `sender_receipt_unavailable_viewed`
- `sender_receipt_share_tapped`
- `sender_receipt_refund_tapped`
- `sender_receipt_delivery_opened`
- `sender_receipt_timeline_opened`
- `sender_receipt_tracking_copied`
- `sender_receipt_support_tapped`
- `sender_receipt_refreshed`

Analytics payload:
- `paymentStatus`
- `currentStatus`
- `serviceType`
- `doorstepRequested`
- `amountGhs`
- `isStale`
- `sourceRoute` when safe

Do not send:
- Receiver name.
- Tracking code.
- Delivery ID unless analytics policy approves hashed identifiers.
- Package description.
- Declared value.
- Proof reference.
- Provider reference.
- Raw error body.

## Performance Requirements
Targets:
- Initial shell render: under `1 second`.
- Fresh receipt load: under `2 seconds` p95.
- Copy tracking feedback: under `100ms`.
- Route to share/refund/detail: under `100ms` after tap.

Rules:
- Fetch only delivery detail.
- Do not fetch timeline on initial receipt load.
- Do not fetch proof asset on initial receipt load.
- Do not render export artifact on this route.
- Avoid heavy shadows or images.

## Privacy And Security
Privacy rules:
- Receipt is visible only to authenticated users authorized for the delivery.
- Do not show sender raw user ID.
- Do not show staff actor IDs.
- Do not show assigned driver or courier ID.
- Do not show provider reference.
- Do not show payer phone.
- Do not show receiver phone.
- Do not show proof reference.
- Do not show internal issue notes.
- Do not expose backend error details.

Security rules:
- Backend authorization decides access.
- Cached receipt must be treated as stale until refreshed.
- Share route must perform its own eligibility checks.
- Refund route must perform its own eligibility checks.
- Do not store generated export content from this screen.

## Edge Cases
### Payment Pending
Behavior:
- Show receipt unavailable.
- Explain that receipt appears after payment confirmation.
- Route to delivery detail unless product explicitly uses payment processing state.

### Payment Failed
Behavior:
- Show payment failed state.
- Route to payment recovery.
- Do not display a paid amount as receipt amount.

### Refund Pending
Behavior:
- Show original payment recorded.
- Show refund pending callout.
- Route to refund tracker.
- Do not show refund amount without contract support.

### Refunded
Behavior:
- Show original payment recorded.
- Show refunded callout.
- Route to refund tracker.
- Do not show refund reference without contract support.

### Delivered But Payment Pending
Behavior:
- Treat as policy inconsistency.
- Do not show paid receipt.
- Show receipt unavailable plus support route.
- Capture telemetry.

### Cancelled With Refund Pending
Behavior:
- Show refund pending receipt state.
- Route refund tracker.
- Delivery status can appear in delivery context.

### Missing Station Mapping
Behavior:
- Use station ID.
- Do not block receipt render.

### Missing Final Proof
Behavior:
- Receipt still renders if payment status allows.
- Do not imply delivery proof exists.

### Stale Cache With Refunded Status
Behavior:
- Mark stale.
- Encourage refresh for latest refund state.
- Share should be disabled if share route requires fresh data.

### Deep Link Without Auth
Behavior:
- Route to sign-in with safe next route.
- Do not leak receipt data.

### Invalid Delivery ID
Behavior:
- Show not found or route-level invalid state.
- Do not call unrelated endpoints.

## QA Acceptance Criteria
Functional:
- Screen renders at `/(sender)/receipts/:deliveryId`.
- Screen requires authenticated sender access.
- Screen calls `get_delivery`.
- Confirmed payment renders receipt.
- Refund pending renders receipt plus refund pending callout.
- Refunded renders receipt plus refunded callout.
- Pending payment renders receipt unavailable.
- Failed payment renders receipt unavailable and recovery CTA.
- Share CTA routes to `SenderReceiptShare`.
- Refund CTA routes to `SenderRefundStatus`.
- Open delivery routes to delivery detail.
- View timeline routes to timeline.
- Copy tracking code copies only tracking code.
- Refresh refetches delivery detail.
- Offline and stale states render.
- API error state renders.
- Not found state renders.
- Not authorized state renders.

Contract:
- No payment initialization endpoint is called.
- No payment verification endpoint is called.
- No refund endpoint is called.
- No settlement endpoint is called.
- No delivery mutation endpoint is called.
- No timeline endpoint is called on initial receipt load.
- No fields outside `deliveryDetailResponseSchema` are required.
- `quote.amount` is the only amount used for receipt amount.
- Refund amount/reference is not rendered until contract supports it.

Privacy:
- Provider reference absent.
- Payer phone absent.
- Receiver phone absent.
- Sender ID absent.
- Staff actor IDs absent.
- Proof reference absent.
- Raw latest event type is not primary copy.

Accessibility:
- Payment seal has accessible label.
- Amount is announced with currency.
- Receipt unavailable states have clear headings.
- Refund state changes are announced.
- Copy tracking success is announced.
- Large text preserves amount, status, and CTA.
- High contrast mode keeps state labels readable.
- Reduced motion disables nonessential animation.

Visual:
- Amount and status dominate first viewport.
- Receipt looks official and calm.
- Refund callouts are visible without being alarming.
- Delivery context is scannable.
- No admin ledger density appears.

## Implementation Notes For Claude Code
Build this screen as a read-only receipt detail route.

Use:
- `get_delivery`.
- `deliveryDetailResponseSchema`.
- `stationCatalog`.
- `paymentStatusSchema`.
- `serviceTypeSchema`.

Do not use:
- `initialize_payment`.
- `verify_payment`.
- `refund_payment`.
- `settle_refund_payment`.
- `get_delivery_timeline` on initial load.
- Admin finance endpoints.
- Provider webhook data.
- Payment repository internals.
- Proof asset reference.

Implementation sequence:
1. Add typed data hook for `get_delivery`.
2. Add receipt eligibility mapper for `confirmed`, `refund_pending`, `refunded`, `pending`, and `failed`.
3. Add amount formatter for `quote.currency` and `quote.amount`.
4. Add payment seal.
5. Add receipt summary rows using only available contract fields.
6. Add delivery context rows.
7. Add refund pending/refunded callout.
8. Add unavailable, loading, stale, offline, not-found, unauthorized, session-expired, and API-error states.
9. Add share/refund/detail/timeline route actions.
10. Add accessibility labels and status announcements.
11. Add privacy-safe analytics.
12. Add tests for all payment states.

## Open Product Decisions
No blocking decisions for v1.

Future decisions:
- Dedicated receipt endpoint.
- Receipt number format.
- Sender-safe payment reference exposure.
- Paid timestamp exposure.
- Provider display rules.
- Masked payer phone display.
- Tax invoice support.
- Refund amount and reference display.
- Whether refund-pending receipts are shareable.
- Whether receipt exports require fresh network state.

These decisions must not be implied by this screen.

## Final Handoff Summary
Claude Code should build `SenderReceiptDetail` as the sender-safe read-only receipt screen. It must call `get_delivery`, render receipt content only for `confirmed`, `refund_pending`, and `refunded` payment states, use `quote.amount` as the displayed receipt amount, route sharing to `SenderReceiptShare`, route refund states to `SenderRefundStatus`, handle unavailable/offline/stale/error/access states, and hide provider references, payer phone, receiver phone, staff IDs, proof references, and any field not exposed by `deliveryDetailResponseSchema`.

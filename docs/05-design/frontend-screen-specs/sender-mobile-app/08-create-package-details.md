# Create Package Details Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CreatePackageDetails` |
| App | `apps/mobile` |
| Route | `/(sender)/create/package` |
| Primary test ID | `screen-create-package-details` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Local draft, `deliveryPackageSchema`, pricing rules, shared pricing domain |
| Related routes | `/(sender)/create/receiver`, `/(sender)/create/options`, `/(sender)/create/quote`, `/(sender)/home` |
| Required states | `loading`, `normal`, `field_errors`, `manual_quote_blocked`, `declared_value_review_notice`, `fragile_selected`, `offline`, `draft_write_failed`, `missing_receiver_prerequisite`, `stale_draft` |

## Product Job
This screen captures enough package information to price the delivery safely later and prevent self-serve bookings that the v1 rules do not allow. It must help the sender describe the package, estimate weight, choose a size tier, mark fragile handling, and declare value without making the screen feel like a warehouse intake console.

The sender should be able to:
- Enter a clear package description.
- Enter estimated package weight in kilograms.
- Choose a supported size tier.
- Mark whether the package is fragile.
- Enter declared value in Ghana cedis.
- Understand manual-quote boundaries before reaching quote review.
- Save package details to the local create-delivery draft.
- Continue to delivery options only when self-serve package rules pass.

This screen is not station intake, courier proof capture, quote review, payment, issue filing, or support.

## Audience
Primary audience:
- Authenticated senders booking a parcel.
- Small-business senders entering packages repeatedly.
- First-time senders who need help understanding size and weight limits.
- Senders using low-end devices or weak data.

Secondary audience:
- Station operators who later verify package weight and condition.
- Finance reviewers who depend on declared value and pricing rules.
- QA engineers validating field boundaries.
- Claude Code implementing this route from the spec.

## User State
The sender has selected stations and entered receiver details. They now need to describe the item well enough for price, handling, and later station intake. They may not know exact weight or longest side, so the UI must support reasonable estimates while making station verification clear.

The sender may be:
- Booking from home before visiting a station.
- Booking at a shop counter with the package nearby.
- Unsure whether the package is standard or bulky.
- Unsure whether the value triggers review.
- Trying to enter details quickly with keyboard open.

The screen must:
- Keep required package fields clear.
- Block weight above `20kg` from self-serve booking.
- Block oversized package selection from self-serve booking.
- Allow declared value up to `GHS 5,000`.
- Show review notice above `GHS 2,000`.
- Explain that station intake may adjust quote if weight or size changes.
- Avoid showing final quote amount.
- Avoid creating backend delivery.

## Primary Action
Primary CTA:
- `Continue to options`

Secondary actions:
- `Back`
- `Clear package`
- `Learn size tiers`

CTA behavior:
- `Continue to options` validates package details, persists the package object into the local draft, and routes to `/(sender)/create/options`.
- `Back` routes to `/(sender)/create/receiver`.
- `Clear package` clears package fields from this draft section only.
- `Learn size tiers` opens inline sizing guidance, not an external browser.

Rules:
- `Continue to options` must stay disabled until all required self-serve package fields pass validation.
- `Continue to options` must stay disabled for weight above `20kg`.
- `Continue to options` must stay disabled for `oversized` size tier.
- `Continue to options` must not call `create_delivery`.
- `Continue to options` must not calculate or reveal quote amount.
- `Continue to options` must not initialize payment.
- `Continue to options` must not upload proof assets.

## First Meaningful Value
First meaningful value is reached when the sender understands whether the package can continue through self-serve booking and what package facts will affect the quote later.

The screen creates value by:
- Preventing packages outside v1 self-serve limits from reaching payment.
- Making price drivers visible without showing premature price.
- Capturing package details in backend-compatible shape.
- Making fragile and declared value handling visible early.
- Setting station verification expectations before intake.

Backend delivery state is still not created on this screen.

## Main Tension
Package details drive price and handling, but senders may not know exact measurements. The UX must support fast estimates while refusing values that v1 cannot process through self-serve booking. It should feel like guided logistics, not paperwork.

The screen must balance:
- Accurate enough input against sender effort.
- Self-serve limits against manual-quote needs.
- Pricing transparency against no premature quote.
- Fragile handling seriousness against form simplicity.
- Declared value risk against low-friction booking.

## Design Brief
User and job:
- An authenticated sender wants to enter package details that can be priced and checked at station intake.

Context of use:
- Transactional, estimate-based, sometimes repetitive, price-sensitive.

Entry point:
- `/(sender)/create/receiver` after valid receiver details.

Success state:
- Local draft has valid package description, weight, size tier, fragile flag, declared value, and app routes to `/(sender)/create/options`.

Primary action:
- `Continue to options`

Navigation model:
- Step 4 of sender create-delivery stack flow.

Density:
- Balanced form density with compact guidance.

Visual thesis:
- A smart parcel intake card: clear package facts, visible self-serve limits, and a calm warning system for values that need review.

Restraint rule:
- Avoid warehouse jargon, long measurement forms, price totals, media capture, and freight-grade complexity.

Product lens:
- Trust-critical transactional form.

System stance:
- Match the create-delivery visual language from station and receiver steps.

Interaction thesis:
- Numeric fields guide instead of punish, size tier cards explain themselves, and manual-quote boundaries appear before the sender wastes effort.

Signature move:
- A compact "self-serve fit meter" that updates from package fields without showing a price.

Activation event:
- Sender continues with package details that are eligible for self-serve quote generation later.

## Elite Quality Gate
This spec is not closed unless the resulting screen captures package details in a backend-compatible shape and blocks known manual-quote cases before quote review.

Non-negotiable quality requirements:
- The first viewport must show package description and weight.
- Size tier must be understandable without external docs.
- Weight above `20kg` must block self-serve continuation.
- `oversized` must block self-serve continuation.
- Declared value above `GHS 2,000` must show review notice.
- Declared value above `GHS 5,000` must block continuation.
- Fragile selection must explain later intake/photo implications without asking for proof here.
- The screen must not call `create_delivery`.
- The screen must not show quote amount.
- The screen must not initialize payment.
- The screen must not collect unsupported `specialHandlingNotes` until the API contract includes it.
- The screen must be keyboard-safe.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If a package above `20kg` can continue, the screen remains open.
- If `oversized` can continue, the screen remains open.
- If declared value above `GHS 5,000` can continue, the screen remains open.
- If final price appears, the screen remains open.
- If package data is sent to backend from this screen, the screen remains open.
- If fragile handling has no operational explanation, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support focused mobile input, keyboard behavior, steppers, clear controls, and progressive disclosure.
- Material Design guidance for text fields, switches, segmented buttons, cards, and error states supports clear touch input and field validation.
- Nielsen Norman Group mobile form guidance supports reducing typing, using correct keyboards, visible labels, and inline errors.
- W3C WCAG 2.2 supports input labels, error identification, target size, focus order, and status messages.
- Kra sender app spec defines final package fields and edge states.
- Kra pricing rules define weight tiers, size tiers, fragile surcharge, declared value review, and manual-quote boundaries.
- Kra shared pricing domain defines `sizeTiers`, `QuoteInput`, and quote rules that throw for oversized packages or weight above `20kg`.
- Kra API contracts define `deliveryPackageSchema` for later delivery creation.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/text-fields/overview
- https://m3.material.io/components/switch/overview
- https://m3.material.io/components/segmented-buttons/overview
- https://m3.material.io/components/cards/overview
- https://www.nngroup.com/articles/mobile-forms/
- https://www.w3.org/WAI/WCAG22/quickref/
- `docs/04-features/sender-app-spec.md`
- `docs/03-business/pricing-rules.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `packages/shared/src/domain/delivery-draft.ts`
- `services/api/src/routes.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- Station and receiver draft sections are valid before normal rendering.
- Package description is required.
- Weight estimate is required.
- Size tier is required.
- Fragile flag is required.
- Declared value is required.
- Weight above `20kg` is not self-serve in v1.
- `oversized` packages are not self-serve in v1.
- Declared value above `GHS 2,000` can continue but requires review notice.
- Declared value above `GHS 5,000` is blocked from self-serve booking.
- Exact quote appears later on quote review.
- Station intake can adjust quote if actual weight or size differs.
- Proof photos are captured later by staff when fragile handling requires them.

If product requires special handling notes, the API contract must first add that field to `deliveryPackageSchema` or another documented request object. Until then, this screen must not collect notes that cannot be submitted.

## Non-Goals
Do not implement these in this screen:
- Station intake confirmation.
- Measured weight capture.
- Scan code capture.
- Package label generation.
- Photo upload.
- Proof asset upload.
- Manual quote request workflow.
- Special handling notes without backend contract.
- Quote amount.
- Payment method.
- Payment initialization.
- Delivery creation.
- Doorstep address.
- Receiver phone verification.
- Support issue creation.
- Insurance policy purchase.
- Customs documentation.

## Route Rules
### Route
- Render at `/(sender)/create/package`.
- Must require authenticated sender session.
- Must require sender role.
- Must not render for unauthenticated users.
- Must not render for staff/admin roles.
- Must require valid station pair and receiver details before normal rendering.
- Must be reachable from `/(sender)/create/receiver`.
- Must route forward to `/(sender)/create/options` only after package validation succeeds.

### Accepted Query Params
Allowed:
- `source`: `receiver`, `resume`, `back`, `unknown`.
- `focus`: `description`, `weight`, `size`, `value`, or omitted.

Ignored safely:
- Unknown query params.

Rules:
- `focus=description` moves focus to package description after first render.
- `focus=weight` moves focus to weight field.
- `focus=size` moves focus to size tier group.
- `focus=value` moves focus to declared value.
- Query params must not override saved draft values.

### Entry Preconditions
Before rendering normal state:
- Confirm sender session is valid.
- Load local create-delivery draft.
- Confirm `originStationId` and `destinationStationId` exist.
- Confirm receiver name exists.
- Confirm receiver phone is E.164.

If prerequisite is missing:
- Show missing prerequisite state.
- Route recovery should go to the first missing step.

If local draft is stale:
- Show stale draft state.
- Offer `Start again` and `Back to home`.

### Exit Rules
On valid continue:
- Trim package description.
- Parse weight as number of kilograms.
- Save size tier.
- Save fragile boolean.
- Parse declared value as number of GHS.
- Persist package object to local draft.
- Persist `packageDetailsCompletedAt`.
- Route to `/(sender)/create/options`.

On back:
- Preserve entered package fields when possible.
- Route to `/(sender)/create/receiver`.

On clear:
- Remove package object.
- Remove `packageDetailsCompletedAt`.
- Stay on the same route.

## Backend And Data Contract
### Current Backend Boundary
This route is local-draft only. It prepares package data for later quote and delivery creation but must not call backend mutation operations.

Allowed:
- Read local draft.
- Patch local draft package fields.
- Use local validation aligned with product rules and `deliveryPackageSchema`.
- Use shared pricing constants for self-serve boundary logic.
- Use privacy-safe analytics.

Not allowed:
- `POST /v1/deliveries`
- `POST /v1/payments/initialize`
- Proof asset creation.
- Station intake endpoint.
- Package label endpoint.
- Admin endpoints.

### API Schema Alignment
Backend package schema:

```ts
export const deliveryPackageSchema = z.object({
  description: z.string().trim().min(3).max(160),
  weightKg: z.number().positive(),
  sizeTier: sizeTierSchema,
  isFragile: z.boolean(),
  declaredValueGhs: z.number().nonnegative().max(5000)
});
```

UI validation must be stricter where business policy is stricter:
- Description: `3-120` characters per sender app spec.
- Weight: `0.1-20kg` for self-serve.
- Size tier: `standard` or `bulky` can continue; `oversized` blocks self-serve.
- Declared value: `0-5000`.

### Draft Package Shape
The screen owns this draft patch:

```ts
type PackageDraftPatch = {
  package?: {
    description: string;
    weightKg: number;
    sizeTier: "standard" | "bulky";
    isFragile: boolean;
    declaredValueGhs: number;
  };
  packageDetailsCompletedAt?: string;
};
```

Rules:
- `description` stores trimmed text.
- `weightKg` stores numeric kilograms.
- `sizeTier` stores only self-serve tier on continue.
- `isFragile` stores boolean.
- `declaredValueGhs` stores numeric GHS amount.
- `packageDetailsCompletedAt` is set only after valid continue.

### Unsupported Field Decision
`specialHandlingNotes` exists in the sender app spec but not in the current API `deliveryPackageSchema`.

V1 UI decision:
- Do not collect special handling notes on this screen.
- Do not store special handling notes locally as if they will be submitted.
- If the product owner requires notes, update the API contract and backend first.

Reason:
- Capturing unsubmitted handling notes would create false operational trust.

### Self-Serve Eligibility Rules
Self-serve eligible when:
- Description is valid.
- Weight is `>=0.1kg` and `<=20kg`.
- Size tier is `standard` or `bulky`.
- Fragile flag is either true or false.
- Declared value is `>=0` and `<=5000`.

Self-serve blocked when:
- Weight is above `20kg`.
- Size tier is `oversized`.
- Declared value is above `GHS 5,000`.

Review notice, but not blocked:
- Declared value above `GHS 2,000` and at or below `GHS 5,000`.
- Fragile selected.
- Bulky selected.

### Pricing Boundary
Do:
- Tell sender which inputs affect price.
- Tell sender final price appears before payment.
- Tell sender station intake can adjust quote if measured weight or size differs.

Do not:
- Show route fee.
- Show weight surcharge amount.
- Show bulky surcharge amount.
- Show fragile surcharge amount.
- Show declared-value surcharge amount.
- Show total quote.

The quote screen owns price display.

## Information Architecture
### Screen Regions
1. Top navigation
2. Step header
3. Self-serve fit meter
4. Package description field
5. Weight field
6. Size tier selector
7. Fragile selector
8. Declared value field
9. Review and manual-quote notices
10. Intake adjustment note
11. Sticky continue action

### Priority Order
The visual hierarchy must be:
- Current step and task.
- Package description.
- Weight.
- Size tier.
- Self-serve status.
- Fragile and value details.
- Continue CTA.

### First Viewport
On an iPhone-sized viewport, the first screen view should include:
- Back affordance.
- `Package details` title.
- Short task copy.
- Package description field.
- Weight field.
- A visible cue that size and value come next.

The sticky CTA can sit at bottom but must not obscure fields.

## Layout System
### Screen Frame
Use a mobile form layout:
- Safe-area top padding.
- Header area.
- Scrollable content.
- Sticky bottom CTA bar.
- Safe-area bottom padding.

Recommended content width:
- `20px` side padding on compact phones.
- `24px` side padding on larger phones.
- Max content width `430px`.

### Top Navigation
Elements:
- Back icon button.
- Step label.
- Optional progress text `Step 4 of 6`.

Rules:
- Back target is receiver details.
- Back button hit area minimum `44px` by `44px`.
- Do not add unrelated actions.

### Step Header
Content:
- Eyebrow: `Create delivery`
- Title: `Package details`
- Body: `Describe the package so Kra can price and handle it correctly.`

Rules:
- Body copy must stay under 100 characters.
- Do not mention payment.
- Do not mention package labels here.

### Self-Serve Fit Meter
Purpose:
- Show whether the package can continue through self-serve booking.

States:
- `Ready for self-serve`
- `Needs package details`
- `Manual quote needed`
- `Review notice`

Rules:
- Do not show price.
- Use it as an eligibility indicator only.
- Keep it compact.
- Avoid celebratory copy.

Recommended valid copy:
- `This package can continue to options. Final price appears before payment.`

Recommended incomplete copy:
- `Add package details to check self-serve fit.`

Recommended blocked copy:
- `This package needs manual review and cannot continue through self-serve booking.`

### Package Description Field
Label:
- `Package description`

Helper:
- `Use a clear description such as clothing, books, documents, or electronics.`

Rules:
- Required.
- Single-line or short multi-line input.
- Minimum `3` characters.
- Maximum `120` characters.
- Do not ask for highly sensitive content details unless needed.

### Weight Field
Label:
- `Estimated weight`

Unit:
- `kg`

Helper:
- `Use your best estimate. Station intake can adjust if measured weight differs.`

Rules:
- Required.
- Numeric keyboard.
- Accept decimals.
- Minimum `0.1`.
- Maximum self-serve `20`.
- Values above `20` trigger manual-quote block.
- Do not allow negative values.

### Size Tier Selector
Options:
- `Standard`
- `Bulky`
- `Oversized`

Option copy:
- `Standard`: `Longest side up to 40cm`
- `Bulky`: `Longest side over 40cm and up to 70cm`
- `Oversized`: `Over 70cm, manual quote only`

Rules:
- Required.
- `Standard` and `Bulky` can continue if other fields valid.
- `Oversized` displays manual-quote block and disables CTA.
- Use cards or segmented choice with enough text.
- Do not hide the over-70cm rule.

### Fragile Selector
Label:
- `Fragile item`

Options:
- `No`
- `Yes`

Helper when no:
- `Choose yes if the package needs careful handling.`

Helper when yes:
- `Fragile packages require extra handling checks at intake and destination.`

Rules:
- Required boolean.
- Default may be `No` only if product accepts explicit default; otherwise force first selection.
- If defaulting to `No`, make it visible and editable.
- Do not ask for photo on this screen.

### Declared Value Field
Label:
- `Declared value`

Unit:
- `GHS`

Helper:
- `Used for handling review and dispute support.`

Rules:
- Required.
- Numeric keyboard.
- Accept whole GHS values.
- Minimum `0`.
- Maximum `5000`.
- Above `2000` shows review notice.
- Above `5000` blocks self-serve.

### Intake Adjustment Note
Recommended copy:
- `Final charge may be adjusted at station intake if weight or size changes.`

Rules:
- This copy comes directly from sender app baseline.
- Keep visible before CTA or inside fit meter.
- Do not make it sound like arbitrary repricing.

### Sticky Bottom CTA
Elements:
- Primary button `Continue to options`
- Support line.

Support line variants:
- Disabled missing: `Complete package details to continue.`
- Disabled manual: `Manual quote needed for this package.`
- Enabled: `Next: delivery options`
- Saving: `Saving package`

Rules:
- CTA remains visible at bottom.
- CTA respects safe-area inset.
- CTA avoids keyboard overlap.
- Disabled reason must be visible outside the disabled button.

## Visual Direction
### Design Character
The screen should feel like a precise parcel checkpoint with friendly guidance. It should not look like a freight form or a generic checkout page.

Use:
- Clear form fields.
- Size tier cards with concise dimensions.
- One eligibility meter.
- Strong field labels.
- Quiet warning surfaces.
- Numeric input affordances.

Avoid:
- Weight tables.
- Long policy blocks.
- Price breakdowns.
- Photo capture surfaces.
- Warehouse dashboards.
- Complex dimension calculators.
- Decorative parcel illustrations.

### Color Tokens
Recommended token roles:
- `surface.base`: app background.
- `surface.card`: form card background.
- `surface.notice`: review notice background.
- `surface.blocked`: manual-quote block background.
- `border.default`: quiet field border.
- `border.focus`: focused field border.
- `border.error`: invalid field border.
- `text.primary`: headings and labels.
- `text.secondary`: helper text.
- `text.error`: field errors.
- `accent.primary`: CTA and focus.
- `state.warning`: review notice.
- `state.danger`: manual-quote block.

Rules:
- Use warning color only for review notices.
- Use danger color only for blocked self-serve states.
- Do not use color alone to communicate tier selection.
- Maintain WCAG AA contrast.

### Typography
Recommended hierarchy:
- Screen title: 28 to 34px, strong weight.
- Field labels: 14 to 16px, medium to strong weight.
- Field input: 17 to 19px.
- Size tier title: 16 to 18px.
- Size tier helper: 13 to 14px.
- Notice text: 13 to 15px.
- CTA label: 16 to 17px, strong weight.

Rules:
- Keep labels visible while typing.
- Keep tier descriptions short.
- Let warnings wrap cleanly.

### Spacing
Recommended spacing:
- Screen side padding: `20px`.
- Header bottom gap: `20px`.
- Field vertical gap: `14px`.
- Size tier card gap: `10px`.
- Notice top gap: `12px`.
- Sticky CTA padding: `16px` plus safe area.

Rules:
- Keep package fields in a coherent order.
- Keep manual-quote block close to the field that caused it.
- Avoid stacking too many notices together without hierarchy.

### Iconography
Allowed icons:
- Back chevron.
- Box or parcel glyph for package header.
- Scale glyph for weight.
- Ruler glyph for size tier guidance.
- Shield or caution glyph for declared value review.
- Alert glyph for blocked self-serve cases.

Rules:
- Icons must support meaning.
- Do not use icon-only tier labels.
- Icon-only buttons require accessible labels.

## Component Inventory
### `CreatePackageDetailsScreen`
Responsibilities:
- Own route rendering.
- Validate station and receiver prerequisites.
- Restore package draft values.
- Validate fields.
- Derive self-serve status.
- Persist package draft patch.
- Navigate forward/back.
- Render all states.

Required props if implemented as a pure screen component:
- `session`
- `initialDraft`
- `onPatchDraft`
- `onNavigate`
- `now`

### `CreateFlowHeader`
Responsibilities:
- Back navigation.
- Step label.
- Title region.

States:
- Default.
- Loading.
- Missing prerequisite.

### `SelfServeFitMeter`
Responsibilities:
- Show package eligibility status.
- Render review and blocked state summary.
- Avoid showing price.

Required test ID:
- `package-self-serve-fit`

### `PackageDescriptionField`
Responsibilities:
- Capture package description.
- Display length and validation errors.

Required test ID:
- `package-description-input`

### `PackageWeightField`
Responsibilities:
- Capture numeric weight in kg.
- Display self-serve weight limit.
- Display manual-quote block when needed.

Required test ID:
- `package-weight-input`

### `SizeTierSelector`
Responsibilities:
- Render `standard`, `bulky`, and `oversized` choices.
- Explain longest-side limits.
- Display selected and blocked states.

Required test IDs:
- `package-size-tier-standard`
- `package-size-tier-bulky`
- `package-size-tier-oversized`

### `FragileSelector`
Responsibilities:
- Capture fragile boolean.
- Explain handling implication.

Required test ID:
- `package-fragile-selector`

### `DeclaredValueField`
Responsibilities:
- Capture numeric declared value in GHS.
- Show review notice above threshold.
- Block above maximum.

Required test ID:
- `package-declared-value-input`

### `PackageNoticePanel`
Responsibilities:
- Render intake adjustment, review, and manual-quote notices.

Required test ID:
- `package-notice-panel`

### `StickyContinueBar`
Responsibilities:
- Render CTA and support line.
- Handle disabled and saving states.

Required test ID:
- `package-continue-bar`

## Content Specification
### Header Copy
Eyebrow:
- `Create delivery`

Title:
- `Package details`

Body:
- `Describe the package so Kra can price and handle it correctly.`

### Step Indicator
Preferred:
- `Step 4 of 6`

Allowed if design system uses labels:
- `Package`

Do not show:
- `Quote`
- `Payment`
- `Station intake`

### Field Labels
Description:
- `Package description`

Weight:
- `Estimated weight`

Size:
- `Package size`

Fragile:
- `Fragile item`

Declared value:
- `Declared value`

### Helpers
Description helper:
- `Use a clear description such as clothing, books, documents, or electronics.`

Weight helper:
- `Use your best estimate. Station intake can adjust if measured weight differs.`

Size helper:
- `Choose by the longest side of the package.`

Fragile helper default:
- `Choose yes if the package needs careful handling.`

Fragile helper selected:
- `Fragile packages require extra handling checks at intake and destination.`

Declared value helper:
- `Used for handling review and dispute support.`

### Size Tier Copy
Standard:
- Label: `Standard`
- Body: `Longest side up to 40cm`

Bulky:
- Label: `Bulky`
- Body: `Over 40cm and up to 70cm`

Oversized:
- Label: `Oversized`
- Body: `Over 70cm, manual quote only`

### Fit Meter Copy
Incomplete:
- `Add package details to check self-serve fit.`

Valid:
- `This package can continue to options. Final price appears before payment.`

Review:
- `This package can continue, but station staff may review value or handling at intake.`

Blocked:
- `This package needs manual review and cannot continue through self-serve booking.`

### Notice Copy
Intake adjustment:
- `Final charge may be adjusted at station intake if weight or size changes.`

Weight blocked:
- `Packages above 20kg require manual review and are not self-serve in v1.`

Oversized blocked:
- `Packages with longest side over 70cm require manual review and are not self-serve in v1.`

Declared value review:
- `Declared value above GHS 2,000 requires operator review.`

Declared value blocked:
- `Declared value above GHS 5,000 is not accepted through self-serve booking.`

Fragile notice:
- `Fragile handling adds extra checks at intake and destination.`

### Error Copy
Missing description:
- `Enter a package description.`

Description too short:
- `Package description must be at least 3 characters.`

Description too long:
- `Package description must be 120 characters or less.`

Missing weight:
- `Enter estimated package weight.`

Invalid weight:
- `Enter a valid weight in kilograms.`

Weight too low:
- `Weight must be at least 0.1kg.`

Weight too high:
- `Packages above 20kg require manual review.`

Missing size:
- `Choose a package size.`

Oversized selected:
- `Oversized packages require manual review.`

Missing fragile:
- `Choose whether the package is fragile.`

Missing declared value:
- `Enter declared value.`

Invalid declared value:
- `Enter a valid amount in GHS.`

Declared value too high:
- `Declared value must be GHS 5,000 or less.`

Draft write failed:
- `Package details were not saved. Try again before continuing.`

Missing prerequisite:
- `Complete station and receiver details before adding package details.`

### Button Copy
Primary enabled:
- `Continue to options`

Primary disabled:
- `Continue to options`

Primary saving:
- `Saving package`

Back:
- `Back`

Clear:
- `Clear package`

Learn size tiers:
- `Learn size tiers`

Start again:
- `Start again`

### Copy Tone
The copy must be:
- Direct.
- Practical.
- Calm.
- Specific.
- Operational.
- Short.

Avoid:
- `Guaranteed price`
- `Exact weight not needed`
- `Any package accepted`
- `Insured`
- `Premium handling`
- `Pay now`
- `Book now`

## State Model
### `loading`
When:
- Local draft is loading.
- Existing package fields are being restored.

UI:
- Show header skeleton.
- Show field skeletons for description, weight, and size.
- Show disabled CTA.

Copy:
- `Loading package details`

Rules:
- If local data is immediately available, render normal state directly.
- Do not call backend.

### `normal`
When:
- Prerequisites are valid.
- Draft is available.
- Package fields are empty or valid.

UI:
- Show package form.
- Show self-serve fit meter.
- Show intake adjustment note.
- CTA disabled until fields valid and self-serve eligible.

### `field_errors`
When:
- Any field fails validation after blur, continue press, or direct interaction.

UI:
- Show field-level error below affected field.
- Mark field with error border.
- Announce error.
- Keep CTA disabled.

Rules:
- Do not show all errors before user interaction unless continue was pressed.
- Error text must explain correction.

### `manual_quote_blocked`
When:
- Weight above `20kg`.
- Size tier is `oversized`.
- Declared value above `GHS 5,000`.

UI:
- Show manual-quote block near causing field.
- Fit meter state is blocked.
- CTA disabled.

Copy:
- Use relevant blocked notice.

Recovery:
- User changes weight, size tier, or declared value.

### `declared_value_review_notice`
When:
- Declared value is above `GHS 2,000` and at or below `GHS 5,000`.

UI:
- Show review notice.
- Fit meter can be review state.
- CTA can remain enabled if all fields valid.

Copy:
- `Declared value above GHS 2,000 requires operator review.`

### `fragile_selected`
When:
- Fragile value is `true`.

UI:
- Show fragile notice.
- CTA can remain enabled if all fields valid.

Copy:
- `Fragile handling adds extra checks at intake and destination.`

### `offline`
When:
- Device is offline but local draft is available.

UI:
- Render form normally.
- Show quiet offline note.

Copy:
- `You can save package details now. Final checks happen before payment.`

Rules:
- Do not block local entry.
- Do not create delivery.

### `draft_write_failed`
When:
- Local draft write fails.

UI:
- Keep entered values in memory.
- Show inline error near CTA.
- Allow retry.

Copy:
- `Package details were not saved. Try again before continuing.`

### `missing_receiver_prerequisite`
When:
- Draft lacks valid station or receiver data.

UI:
- Show recovery panel.
- Route to first missing step.

Copy:
- `Complete station and receiver details before adding package details.`

### `stale_draft`
When:
- Draft format is invalid.
- Draft version unsupported.

UI:
- Show restart panel.
- Offer `Start again`.
- Offer `Back to home`.

Copy:
- `This draft needs to be restarted before package details can be saved.`

## Interaction Rules
### Description Field
Behavior:
- Text keyboard.
- Sentence capitalization.
- Trim on blur and continue.
- Return key moves to weight.

Validation timing:
- Show length errors after blur or continue press.
- Show live character count only when nearing limit.

### Weight Field
Behavior:
- Decimal numeric keyboard.
- Accept `.` as decimal separator.
- Parse to number on blur and continue.
- Preserve typed value if parse fails.
- Return key moves to size tier.

Validation:
- Empty invalid.
- Non-number invalid.
- Below `0.1` invalid.
- Above `20` blocked.

### Size Tier Selector
Behavior:
- Tapping a card selects the tier.
- Selected state visible by border, check, and accessibility state.
- `Oversized` can be selected to show block, but cannot continue.

Guidance:
- `Learn size tiers` opens inline explanation and keeps focus near size group.
- Do not open external browser.

### Fragile Selector
Behavior:
- Use two-choice segmented control or switch with clear yes/no label.
- If default is `No`, make the default visible.
- Selection updates fragile notice.

Accessibility:
- Announce selected value.

### Declared Value Field
Behavior:
- Numeric keyboard.
- Whole GHS values preferred.
- Allow zero.
- Strip currency symbols before parse if pasted.
- Preserve typed value if parse fails.

Validation:
- Empty invalid.
- Negative invalid.
- Above `5000` blocked.
- Above `2000` notice.

### Continue
On press:
1. Validate prerequisites.
2. Validate description.
3. Validate weight.
4. Validate size tier.
5. Validate fragile boolean.
6. Validate declared value.
7. Confirm self-serve eligibility.
8. Persist package patch.
9. Set `packageDetailsCompletedAt`.
10. Navigate to `/(sender)/create/options`.

Failure:
- If validation fails, focus first invalid field.
- If manual-quote block is active, focus blocked field or block panel.
- If local write fails, stay on screen.
- If session expires, route to sender sign-in with return destination.

### Back
On press:
- Save draft opportunistically if fields are valid or partially entered.
- Route to `/(sender)/create/receiver`.

If save fails:
- Still allow back.

### Clear Package
On press:
- If no package data exists, keep button hidden or disabled.
- If later options/quote steps are complete, ask confirmation.
- Otherwise clear without confirmation.

Confirmation copy:
- Title: `Clear package details?`
- Body: `This removes package facts used for options and quote review. Later steps may need review.`
- Confirm: `Clear package`
- Cancel: `Keep details`

## Accessibility Requirements
### Semantics
Screen:
- Main container has test ID `screen-create-package-details`.
- Screen title is primary heading.
- Package form fields are grouped.
- Size tier selector exposes selected state.
- Fit meter exposes status.
- Manual-quote block uses alert semantics after user selection.

Fields:
- Every input has visible label.
- Required state is announced.
- Unit labels are announced.
- Error text is associated with field.
- Helper text is associated where supported.

### Focus Order
Focus order:
1. Back button.
2. Step label/title.
3. Self-serve fit meter.
4. Package description.
5. Weight.
6. Size tier selector.
7. Fragile selector.
8. Declared value.
9. Notices.
10. Continue CTA.

Error focus:
- On continue press with invalid fields, focus first invalid field.
- For manual-quote block, focus the field that caused it.

### Target Size
Minimum targets:
- Back button: `44px` by `44px`.
- Text input height: minimum `48px`.
- Size tier card: minimum `56px` high.
- Fragile selector choices: minimum `44px` high.
- Continue button: minimum `52px` high.

### Contrast
Required:
- Text contrast at least WCAG AA.
- Warning and blocked surfaces meet WCAG AA.
- Error borders visible in high contrast mode.
- Focus ring visible.

### Large Text
At large text sizes:
- Size tier cards grow vertically.
- Fit meter wraps.
- Sticky CTA does not cover fields.
- Numeric unit labels remain associated.

### Reduced Motion
If `prefers-reduced-motion` is enabled:
- Fit meter state changes should use instant update or short fade.
- Do not shake invalid fields.
- Do not use continuous meter animation.

## Keyboard And Input Requirements
### Keyboard Behavior
Description field:
- Text keyboard.
- Return key `Next`.

Weight field:
- Numeric decimal keyboard.
- Return key `Next`.

Declared value field:
- Numeric keyboard.
- Return key `Done`.

Rules:
- Active field must stay visible.
- Sticky CTA must avoid keyboard overlap.
- Scroll view must allow enough bottom padding.
- Tapping outside can dismiss keyboard if platform norm supports it.

### Numeric Parsing
Weight:
- Accept decimals.
- Round only for display if needed; keep enough precision for quote.
- Do not accept negative values.

Declared value:
- Store as numeric GHS.
- Whole-number GHS is preferred for v1.
- Do not store currency symbol.

## Performance And Offline Rules
### Performance
Targets:
- Initial render under `1s` when local draft is available.
- Field input feedback under `100ms`.
- Eligibility calculation under `50ms`.
- Draft write completes quickly; show saving state only if needed.

Rules:
- Do not load remote assets.
- Do not call backend.
- Do not add heavyweight form library unless already used by app.
- Keep eligibility calculation pure and synchronous.

### Offline
Offline behavior:
- Allow package details entry.
- Save to local draft if storage works.
- Show quiet offline note.
- Continue to options locally if fields validate and self-serve eligible.

Offline must not:
- Create delivery.
- Calculate backend-authoritative quote.
- Initialize payment.
- Upload proof.

### Low Bandwidth
Low-bandwidth posture:
- Text-only guidance.
- Local icons only.
- No images.
- No remote policy content.

## Security And Privacy
### Data Sensitivity
Package data can reveal personal or business information.

Rules:
- Do not log raw description in analytics.
- Do not log declared value as exact raw value unless analytics policy allows; bucket it instead.
- Do not include package description in crash breadcrumbs.
- Do not request photo or proof on this screen.
- Do not send package data to backend from this screen.

### Draft Storage
Local draft storage must:
- Store only package fields required for quote and delivery creation.
- Clear on logout or explicit draft reset.
- Avoid carrying package data across sender accounts.

### Risk Copy
The screen must not imply:
- Kra accepts every package.
- Fragile item is insured.
- Declared value creates automatic compensation.
- Manual review is guaranteed approval.

## Analytics And Observability
Analytics must avoid raw package details.

Recommended events:
- `sender_create_package_viewed`
- `sender_create_package_description_valid`
- `sender_create_package_weight_valid`
- `sender_create_package_manual_block`
- `sender_create_package_size_selected`
- `sender_create_package_fragile_selected`
- `sender_create_package_declared_value_notice`
- `sender_create_package_continue_pressed`
- `sender_create_package_draft_write_failed`

Allowed event properties:
- `source`
- `weightTier`
- `sizeTier`
- `isFragile`
- `declaredValueBucket`
- `selfServeStatus`
- `isOffline`
- `draftAgeBucket`

Do not send:
- Raw package description.
- Exact declared value unless approved by analytics policy.
- Receiver data.
- Payment data.

## Test IDs
Required test IDs:
- `screen-create-package-details`
- `create-package-back`
- `create-package-step-label`
- `create-package-title`
- `package-self-serve-fit`
- `package-description-input`
- `package-description-error`
- `package-weight-input`
- `package-weight-error`
- `package-size-tier-standard`
- `package-size-tier-bulky`
- `package-size-tier-oversized`
- `package-size-tier-error`
- `package-fragile-selector`
- `package-fragile-error`
- `package-declared-value-input`
- `package-declared-value-error`
- `package-notice-panel`
- `package-clear`
- `package-continue`
- `package-continue-bar`
- `package-offline-note`
- `package-draft-write-error`
- `package-missing-prerequisite`
- `package-stale-draft`

## QA Scenarios
### Happy Path Standard Package
1. Open `/(sender)/create/package` with authenticated sender and valid station and receiver draft.
2. Confirm title is visible.
3. Enter valid description.
4. Enter weight `2`.
5. Choose `Standard`.
6. Choose fragile `No`.
7. Enter declared value within limit.
8. Confirm self-serve fit is valid.
9. Press `Continue to options`.
10. Confirm draft stores package fields.
11. Confirm route changes to `/(sender)/create/options`.

### Happy Path Bulky Package
1. Enter valid description.
2. Enter weight within limit.
3. Choose `Bulky`.
4. Choose fragile value.
5. Enter declared value within limit.
6. Confirm CTA enables.

### Fragile Selected
1. Choose fragile `Yes`.
2. Confirm fragile notice appears.
3. Confirm CTA can remain enabled if all fields valid.
4. Confirm no proof upload appears.

### Declared Value Review
1. Enter declared value above `GHS 2,000` and at or below `GHS 5,000`.
2. Confirm review notice appears.
3. Confirm CTA can remain enabled if all fields valid.

### Declared Value Blocked
1. Enter declared value above `GHS 5,000`.
2. Confirm blocked error appears.
3. Confirm CTA disabled.

### Weight Above Limit
1. Enter weight above `20`.
2. Confirm manual-quote block appears.
3. Confirm CTA disabled.

### Weight Too Low
1. Enter weight below `0.1`.
2. Confirm field error appears.
3. Confirm CTA disabled.

### Oversized Selected
1. Choose `Oversized`.
2. Confirm manual-quote block appears.
3. Confirm CTA disabled.

### Missing Description
1. Leave description blank.
2. Fill other fields valid.
3. Press continue.
4. Confirm description error and focus.

### Description Too Long
1. Enter description over `120` characters.
2. Confirm length error.
3. Confirm CTA disabled.

### Missing Fragile Selection
1. Configure implementation with no default fragile value.
2. Fill all other fields.
3. Press continue.
4. Confirm fragile required error.

### Missing Prerequisite
1. Open route without valid receiver draft.
2. Confirm prerequisite recovery panel.
3. Confirm app routes back to first missing step.

### Offline Local Save
1. Simulate offline device with local draft available.
2. Fill valid package fields.
3. Confirm offline note appears.
4. Continue.
5. Confirm local draft saves and routes to options.

### Draft Write Failure
1. Force local storage write failure.
2. Fill valid package fields.
3. Press continue.
4. Confirm write failure copy appears.
5. Confirm route does not advance.

### No Backend Mutation
1. Open screen.
2. Fill valid package fields.
3. Continue.
4. Confirm no `POST /v1/deliveries` call occurred.
5. Confirm no payment operation occurred.
6. Confirm no proof upload operation occurred.

### Accessibility
1. Navigate with screen reader.
2. Confirm field labels and units are announced.
3. Trigger oversized block.
4. Confirm blocked message is announced.
5. Increase text size.
6. Confirm no tier card or CTA is clipped.

## Implementation Notes For Claude Code
### File Placement
Claude Code should implement this screen under the sender create-delivery stack when the actual mobile app UI is built. Suggested conceptual placement:
- `apps/mobile/src/screens/sender/create/CreatePackageDetailsScreen.tsx`
- `apps/mobile/src/screens/sender/create/components/PackageDescriptionField.tsx`
- `apps/mobile/src/screens/sender/create/components/PackageWeightField.tsx`
- `apps/mobile/src/screens/sender/create/components/SizeTierSelector.tsx`
- `apps/mobile/src/screens/sender/create/components/SelfServeFitMeter.tsx`

If the repo structure differs when UI implementation begins, preserve the route and test IDs from this spec.

### Package Form State
Recommended local form state:

```ts
type PackageFormState = {
  description: string;
  weightInput: string;
  weightKg?: number;
  sizeTier?: "standard" | "bulky" | "oversized";
  isFragile?: boolean;
  declaredValueInput: string;
  declaredValueGhs?: number;
  touched: {
    description: boolean;
    weight: boolean;
    sizeTier: boolean;
    isFragile: boolean;
    declaredValue: boolean;
  };
};
```

Rules:
- Keep typed numeric strings separate from parsed numbers.
- Only write parsed numbers to draft after validation.
- Do not lose typed values when parsing fails.

### Validation Function
Use pure validation:

```ts
type PackageSelfServeStatus =
  | "incomplete"
  | "valid"
  | "review_notice"
  | "blocked";

type PackageValidationResult = {
  isValid: boolean;
  selfServeStatus: PackageSelfServeStatus;
  packageValue?: {
    description: string;
    weightKg: number;
    sizeTier: "standard" | "bulky";
    isFragile: boolean;
    declaredValueGhs: number;
  };
  errors: {
    description?: string;
    weightKg?: string;
    sizeTier?: string;
    isFragile?: string;
    declaredValueGhs?: string;
  };
  notices: string[];
};
```

Rules:
- Trim description before validation.
- Parse weight before validation.
- Parse declared value before validation.
- Treat `oversized` as selected-but-blocked, not valid draft value.
- Return review notice for declared value above `2000`.
- Return fragile notice when fragile is true.

### Draft Patch Function
Use one package patch:

```ts
type PatchPackageDraftInput = {
  package: {
    description: string;
    weightKg: number;
    sizeTier: "standard" | "bulky";
    isFragile: boolean;
    declaredValueGhs: number;
  };
  packageDetailsCompletedAt: string;
};
```

Rules:
- Patch only after validation.
- Do not write `oversized` from self-serve path.
- Do not write unsupported special handling notes.

### Navigation
Forward route:
- `/(sender)/create/options`

Back route:
- `/(sender)/create/receiver`

Missing prerequisite route:
- First missing route among stations and receiver.

Auth failure route:
- Sender sign-in with return destination.

## Visual QA Checklist
Before closing implementation, inspect:
- Description and weight are visible in the first viewport.
- Weight unit is obvious.
- Size tier explanations are understandable.
- Oversized block is clear and close to size tier.
- Declared value notice does not look like an error when under max.
- Fragile notice is visible only when useful.
- Final quote amount does not appear.
- Sticky CTA stays usable with keyboard open.
- Large text does not clip tier cards.
- No unsupported special handling notes field appears.
- No photo/proof capture appears.

## Engineering QA Checklist
Before closing implementation, verify:
- Route exists at `/(sender)/create/package`.
- Primary test ID is present.
- All listed test IDs are present.
- Station and receiver prerequisites are enforced.
- Description validation uses `3-120` product limit.
- Weight validation blocks above `20kg`.
- Size validation blocks `oversized`.
- Declared value validation blocks above `5000`.
- Declared value above `2000` shows review notice.
- Fragile boolean is stored.
- CTA writes local draft only.
- CTA routes only after successful local write.
- No backend delivery is created.
- No payment operation is called.
- No proof upload operation is called.
- Analytics excludes raw package description.
- Screen reader labels and error associations are present.
- Keyboard-open layout is usable.
- Unit tests cover package validation and self-serve status.
- Screen tests cover happy path, oversized, overweight, declared value review, declared value block, missing prerequisite, and draft write failure.

## Acceptance Criteria
The screen is complete when:
- Authenticated sender can enter package description, weight, size tier, fragile flag, and declared value.
- Valid self-serve package details are stored in local draft.
- Weight above `20kg` blocks continuation.
- `Oversized` blocks continuation.
- Declared value above `GHS 2,000` shows review notice.
- Declared value above `GHS 5,000` blocks continuation.
- Fragile selection shows handling notice without proof upload.
- Continuing routes to `/(sender)/create/options`.
- No backend delivery is created.
- No quote amount is shown.
- No payment operation is called.
- No unsupported special handling notes field is present.
- Missing prerequisite is handled.
- Field errors are specific and accessible.
- Offline local save behavior works.
- The screen passes accessibility checks for labels, focus order, errors, target size, contrast, dynamic type, and reduced motion.
- Tests verify all critical behaviors.


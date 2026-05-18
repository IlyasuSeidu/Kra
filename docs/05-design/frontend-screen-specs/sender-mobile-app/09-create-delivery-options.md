# Create Delivery Options Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CreateDeliveryOptions` |
| App | `apps/mobile` |
| Route | `/(sender)/create/options` |
| Primary test ID | `screen-create-delivery-options` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Local draft, `serviceTypeSchema`, `createDeliveryRequestSchema`, doorstep policy, pricing rules |
| Related routes | `/(sender)/create/package`, `/(sender)/create/receiver`, `/(sender)/create/quote`, `/(sender)/home` |
| Required states | `loading`, `normal`, `selected`, `doorstep_unavailable`, `doorstep_address_required`, `distance_required`, `distance_blocked`, `field_errors`, `offline`, `draft_write_failed`, `missing_package_prerequisite`, `stale_draft` |

## Product Job
This screen lets the sender choose delivery options before quote review: standard or express handling, and station pickup or doorstep delivery when policy permits it. It must separate service speed from final-mile choice because the backend contract stores them separately as `serviceType`, `doorstepRequested`, and optional `doorstepDistanceKm`.

The sender should be able to:
- Choose `standard` or `express` service.
- Understand that express affects the final quote later.
- Choose station pickup as the default final-mile path.
- Choose doorstep delivery only when receiver address and distance rules allow it.
- Understand that doorstep charges are prepaid before assignment.
- Save options to the local create-delivery draft.
- Continue to quote review only when options satisfy backend request rules.

This screen is not quote review, payment, route pricing display, station intake, courier assignment, proof capture, or support.

## Audience
Primary audience:
- Authenticated senders choosing delivery speed and final-mile preference.
- Small-business senders who need predictable default options.
- First-time senders who need clear difference between pickup and doorstep.
- Senders with receiver address ready for final-mile service.

Secondary audience:
- Receivers affected by pickup or doorstep communication.
- Final-mile couriers affected by doorstep eligibility.
- QA engineers validating option state and schema constraints.
- Claude Code implementing this route from the spec.

## User State
The sender has selected stations, entered receiver details, and entered a self-serve package. They now need to decide how Kra should handle service speed and final-mile completion. They may assume doorstep is always available, so the screen must be clear that doorstep requires address, distance, prepaid charge, and final checks.

The sender may be:
- Booking station pickup to keep cost predictable.
- Choosing express for urgency.
- Adding doorstep because receiver cannot visit the station.
- Unsure how far the receiver address is from the destination station.
- Returning from receiver details after adding address.

The screen must:
- Default to a safe self-serve path.
- Keep standard and express as service speed choices.
- Keep doorstep as a separate final-mile choice.
- Require receiver address if doorstep is selected.
- Require distance estimate if doorstep is selected.
- Block doorstep above `10km`.
- Omit distance when doorstep is not selected.
- Avoid showing final price.
- Avoid creating backend delivery.

## Primary Action
Primary CTA:
- `Review quote`

Secondary actions:
- `Back`
- `Add receiver address`
- `Change address`
- `Clear options`

CTA behavior:
- `Review quote` validates delivery options, persists them into the local draft, and routes to `/(sender)/create/quote`.
- `Back` routes to `/(sender)/create/package`.
- `Add receiver address` routes to `/(sender)/create/receiver?focus=address`.
- `Change address` routes to `/(sender)/create/receiver?focus=address`.
- `Clear options` resets options to default draft state.

Rules:
- `Review quote` must stay disabled until `serviceType` is selected.
- `Review quote` must stay enabled for station pickup when package and receiver prerequisites are valid.
- `Review quote` must stay disabled for doorstep until address and distance estimate are valid.
- `Review quote` must stay disabled for doorstep above `10km`.
- `Review quote` must not call `create_delivery`.
- `Review quote` must not initialize payment.
- `Review quote` must not display quote amount.
- `Review quote` must not dispatch final-mile assignment.

## First Meaningful Value
First meaningful value is reached when the sender understands the two option decisions and can choose a valid path to quote review.

The screen creates value by:
- Preventing invalid doorstep requests before quote review.
- Making station pickup the clear default.
- Separating service speed from final-mile delivery.
- Explaining that doorstep charges must be paid before assignment.
- Avoiding surprises when quote review shows final amount.

Backend delivery state is still not created on this screen.

## Main Tension
Options are where senders may accidentally overcommit. Express, doorstep, receiver address, distance, final-mile attempts, and refund rules are all policy-heavy. The screen must make the decisions simple without hiding requirements that matter later. The right UX is a two-part selector with policy-aware validation, not a pricing table.

The screen must balance:
- Fast option selection against doorstep serviceability.
- Pricing transparency against no premature quote.
- Doorstep convenience against proof, failed-attempt, and prepaid-charge rules.
- Low-bandwidth simplicity against enough explanation.
- Backend schema constraints against friendly language.

## Design Brief
User and job:
- An authenticated sender wants to choose speed and final-mile option before quote review.

Context of use:
- Transactional, price-sensitive, policy-sensitive, sometimes urgent.

Entry point:
- `/(sender)/create/package` after self-serve package details.

Success state:
- Local draft contains valid `serviceType`, `doorstepRequested`, and only when needed `doorstepDistanceKm`, then app routes to `/(sender)/create/quote`.

Primary action:
- `Review quote`

Navigation model:
- Step 5 of sender create-delivery stack flow.

Density:
- Calm option-card layout with compact policy notes.

Visual thesis:
- A clear choice board: speed on top, final-mile path below, with doorstep rules surfaced only when selected.

Restraint rule:
- Avoid price amounts, route maps, courier scheduling, proof details, and refund-policy walls.

Product lens:
- Trust-critical guided transaction.

System stance:
- Match the create-delivery flow while making option cards feel decisive and tappable.

Interaction thesis:
- Option cards update a compact readiness panel, doorstep expands only when selected, and invalid doorstep paths route the sender to the exact fix.

Signature move:
- A "quote readiness" panel that confirms schema readiness without showing money.

Activation event:
- Sender reaches quote review with valid service and final-mile choices.

## Elite Quality Gate
This spec is not closed unless the resulting screen cleanly separates service speed from final-mile choice and prevents invalid doorstep requests before quote review.

Non-negotiable quality requirements:
- The first viewport must show service speed choices.
- Standard service must be available.
- Express must be selectable when route policy allows it.
- Station pickup must be the safe default final-mile option.
- Doorstep must require receiver address.
- Doorstep must require distance estimate.
- Doorstep above `10km` must be blocked.
- Doorstep distance must be omitted when doorstep is not selected.
- The screen must not call `create_delivery`.
- The screen must not show quote amount.
- The screen must not initialize payment.
- The screen must not assign final-mile courier.
- The screen must explain that doorstep charges are prepaid before assignment.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If doorstep can continue without address, the screen remains open.
- If doorstep can continue without distance estimate, the screen remains open.
- If station pickup stores a distance value, the screen remains open.
- If a quote amount appears, the screen remains open.
- If backend delivery can be created from this screen, the screen remains open.
- If sender cannot distinguish express from doorstep, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear choice controls, toggles, progressive disclosure, and platform-native navigation.
- Material Design guidance for segmented buttons, switches, cards, and supporting text supports touch-friendly option selection.
- Nielsen Norman Group mobile form guidance supports progressive disclosure, visible labels, and avoiding unnecessary fields until relevant.
- W3C WCAG 2.2 supports target size, labels, focus order, error identification, and accessible status messages.
- Kra sender app spec defines standard, express, and doorstep selection requirements.
- Kra doorstep delivery rules define address, phone, distance, prepaid charge, failed attempt, and proof constraints.
- Kra pricing rules define express, doorstep distance bands, and no cash collection through final-mile flow.
- Kra API contracts define `serviceType`, `doorstepRequested`, and `doorstepDistanceKm` request rules.
- Kra shared pricing domain defines `serviceTypes` as `standard` and `express`; doorstep is a separate boolean.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/segmented-buttons/overview
- https://m3.material.io/components/switch/overview
- https://m3.material.io/components/cards/overview
- https://m3.material.io/components/text-fields/overview
- https://www.nngroup.com/articles/mobile-forms/
- https://www.w3.org/WAI/WCAG22/quickref/
- `docs/04-features/sender-app-spec.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/pricing-rules.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `packages/shared/src/domain/delivery-draft.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- Station, receiver, and package draft sections are valid before normal rendering.
- `serviceType` values are `standard` and `express`.
- Doorstep is not a `serviceType`; it is represented by `doorstepRequested`.
- Station pickup means `doorstepRequested=false` and `doorstepDistanceKm` omitted.
- Doorstep means `doorstepRequested=true` and `doorstepDistanceKm` present.
- Doorstep requires receiver address or landmark.
- Doorstep requires receiver phone, which was captured in receiver details.
- Doorstep is limited to `10km` from destination station.
- Doorstep final-mile charges are prepaid before courier assignment.
- Exact quote appears later on quote review.
- No cash collection is allowed during final-mile completion.

If a sender-safe distance or serviceability endpoint is added later, this screen may use it after the contract is documented. Until then, it uses sender-entered distance band or estimate and later station/final checks.

## Non-Goals
Do not implement these in this screen:
- Quote amount.
- Quote breakdown.
- Payment method.
- Payment initialization.
- Delivery creation.
- Final-mile courier assignment.
- Courier schedule picker.
- GPS permission.
- Map search.
- Live distance calculation.
- Proof capture.
- Failed attempt reporting.
- Refund request.
- Support issue creation.
- Receiver OTP verification.

## Route Rules
### Route
- Render at `/(sender)/create/options`.
- Must require authenticated sender session.
- Must require sender role.
- Must not render for unauthenticated users.
- Must not render for staff/admin roles.
- Must require valid station, receiver, and package draft sections before normal rendering.
- Must be reachable from `/(sender)/create/package`.
- Must route forward to `/(sender)/create/quote` only after option validation succeeds.

### Accepted Query Params
Allowed:
- `source`: `package`, `receiver`, `resume`, `back`, `unknown`.
- `focus`: `service`, `final-mile`, `distance`, or omitted.

Ignored safely:
- Unknown query params.

Rules:
- `focus=service` moves focus to service speed group.
- `focus=final-mile` moves focus to final-mile group.
- `focus=distance` expands doorstep and moves focus to distance control if address exists.
- Query params must not override saved draft values.

### Entry Preconditions
Before rendering normal state:
- Confirm sender session is valid.
- Load local create-delivery draft.
- Confirm station pair exists and is valid.
- Confirm receiver name and E.164 phone exist.
- Confirm package fields are self-serve eligible.

If prerequisite is missing:
- Show missing prerequisite state.
- Route recovery should go to the first missing step.

If draft is stale:
- Show stale draft state.
- Offer `Start again` and `Back to home`.

### Exit Rules
On valid continue:
- Persist `serviceType`.
- Persist `doorstepRequested`.
- Persist `doorstepDistanceKm` only if `doorstepRequested=true`.
- Remove `doorstepDistanceKm` if `doorstepRequested=false`.
- Persist `deliveryOptionsCompletedAt`.
- Route to `/(sender)/create/quote`.

On back:
- Preserve entered options when possible.
- Route to `/(sender)/create/package`.

On clear:
- Reset to default options.
- Remove `deliveryOptionsCompletedAt`.
- Stay on the same route.

## Backend And Data Contract
### Current Backend Boundary
This route is local-draft only. It prepares option data for later quote and delivery creation but must not call backend mutation operations.

Allowed:
- Read local draft.
- Patch local draft option fields.
- Use local validation aligned with `createDeliveryRequestSchema`.
- Use route and station data already present in draft.
- Use privacy-safe analytics.

Not allowed:
- `POST /v1/deliveries`
- `POST /v1/payments/initialize`
- Public tracking endpoints.
- Final-mile assignment endpoints.
- Proof endpoints.
- Admin endpoints.

### API Schema Alignment
Relevant create-delivery schema:

```ts
export const createDeliveryRequestSchema = z
  .object({
    serviceType: serviceTypeSchema,
    doorstepRequested: z.boolean(),
    doorstepDistanceKm: z.number().positive().max(10).optional()
  })
  .superRefine((value, ctx) => {
    if (value.doorstepRequested && !value.receiver.addressText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep delivery requires a receiver address.",
        path: ["receiver", "addressText"]
      });
    }

    if (value.doorstepRequested && value.doorstepDistanceKm === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep delivery requires a distance estimate.",
        path: ["doorstepDistanceKm"]
      });
    }

    if (!value.doorstepRequested && value.doorstepDistanceKm !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep distance should be omitted when doorstep is not requested.",
        path: ["doorstepDistanceKm"]
      });
    }
  });
```

The real schema also includes station, receiver, and package objects. This route owns only service and doorstep option fields.

### Draft Option Shape
The screen owns this draft patch:

```ts
type DeliveryOptionsDraftPatch = {
  serviceType: "standard" | "express";
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  deliveryOptionsCompletedAt?: string;
};
```

Rules:
- `serviceType` is required.
- `doorstepRequested=false` omits `doorstepDistanceKm`.
- `doorstepRequested=true` requires `doorstepDistanceKm`.
- `deliveryOptionsCompletedAt` is set only after valid continue.

### Service Speed Rules
Service options:
- `standard`
- `express`

V1 behavior:
- `standard` is available for self-serve routes.
- `express` is available when route policy allows it.
- Current shared pricing supports express as a service type.
- If future route-level express availability exists, disable express when unavailable.

Copy:
- Standard: `Regular station processing`
- Express: `Priority handling when available`

Do not:
- Promise exact delivery time.
- Show express surcharge amount.
- Say express guarantees same-day delivery.

### Final-Mile Rules
Final-mile options:
- `Station pickup`
- `Doorstep delivery`

Station pickup:
- Stores `doorstepRequested=false`.
- Omits `doorstepDistanceKm`.
- Uses destination station as receiver pickup point.

Doorstep:
- Stores `doorstepRequested=true`.
- Requires receiver address or landmark.
- Requires `doorstepDistanceKm`.
- Blocks above `10km`.
- Reminds sender final-mile charge is prepaid before courier assignment.

### Doorstep Distance Policy
Distance options may be represented as bands for UI clarity:
- `Within 5km`
- `Over 5km and up to 10km`
- `Over 10km`

Storage mapping:
- `Within 5km` stores `5`.
- `Over 5km and up to 10km` stores `10`.
- `Over 10km` does not store distance and blocks continuation.

If the implementation uses numeric input instead:
- Accept values greater than `0`.
- Accept values up to `10`.
- Block values above `10`.
- Store the numeric value.

Band UI is preferred for low-friction mobile use because pricing policy depends on thresholds, not exact route geometry in the current contract.

### Doorstep Address Rule
If receiver address is missing:
- Doorstep card can be visible but unavailable.
- Doorstep card must explain address requirement.
- Provide `Add receiver address`.
- Do not allow `Review quote` with doorstep selected.

If receiver address exists:
- Doorstep can expand to distance choice.
- Allow address review line.
- Provide `Change address`.

Do not collect address here unless product chooses to embed address editing. Preferred path is routing back to receiver details to keep one owner for receiver data.

## Information Architecture
### Screen Regions
1. Top navigation
2. Step header
3. Quote readiness panel
4. Service speed selector
5. Final-mile selector
6. Doorstep requirements panel
7. Distance estimate selector
8. Policy notes
9. Sticky continue action

### Priority Order
The visual hierarchy must be:
- Current step and task.
- Service speed.
- Final-mile choice.
- Doorstep eligibility or fix.
- Quote readiness.
- Continue CTA.

### First Viewport
On an iPhone-sized viewport, the first screen view should include:
- Back affordance.
- `Delivery options` title.
- Short task copy.
- Standard and express choices.
- Beginning of final-mile choice or readiness panel.

The doorstep details can appear below fold after selection.

## Layout System
### Screen Frame
Use a mobile option-card layout:
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
- Optional progress text `Step 5 of 6`.

Rules:
- Back target is package details.
- Back button hit area minimum `44px` by `44px`.
- Do not add unrelated actions.

### Step Header
Content:
- Eyebrow: `Create delivery`
- Title: `Delivery options`
- Body: `Choose speed and how the receiver gets the package.`

Rules:
- Body copy must stay under 90 characters.
- Do not mention quote amount.
- Do not mention payment method.

### Quote Readiness Panel
Purpose:
- Summarize whether options are ready for quote review.

States:
- `Choose service speed`
- `Ready for quote review`
- `Address needed for doorstep`
- `Distance needed for doorstep`
- `Doorstep unavailable over 10km`

Rules:
- Do not show price.
- Do not show surcharge amounts.
- Keep compact.

### Service Speed Selector
Options:
- `Standard`
- `Express`

Recommended layout:
- Two cards or segmented cards.
- Each card has label, support copy, selected state.

Standard copy:
- `Regular station processing.`

Express copy:
- `Priority handling when available.`

Rules:
- Required.
- `standard` should be selected by default only if product accepts safe default.
- If default selected, make it visually explicit.
- Express must not promise exact delivery time.

### Final-Mile Selector
Options:
- `Station pickup`
- `Doorstep delivery`

Station pickup copy:
- `Receiver collects from the destination station.`

Doorstep copy:
- `Kra can hand off from the destination station to a final-mile courier when address and distance rules pass.`

Rules:
- Station pickup is default.
- Doorstep expands requirements only when selected.
- Doorstep unavailable state must still explain why.

### Doorstep Requirements Panel
Show when doorstep is selected or unavailable.

Must communicate:
- Receiver address or landmark is required.
- Receiver phone is required and already captured.
- Doorstep must be within `10km` of destination station.
- Doorstep charge is prepaid before courier assignment.

Do not over-explain:
- Failed attempt policy.
- Refund details.
- Proof fallback details.

### Distance Estimate Selector
Show only when doorstep is selected and address exists.

Preferred band options:
- `Within 5km`
- `5km to 10km`
- `More than 10km`

Rules:
- Required for doorstep.
- `More than 10km` blocks continuation.
- Explain that final checks happen before payment.

### Sticky Bottom CTA
Elements:
- Primary button `Review quote`
- Support line.

Support line variants:
- Disabled service: `Choose a service speed to continue.`
- Disabled address: `Add receiver address for doorstep delivery.`
- Disabled distance: `Choose doorstep distance to continue.`
- Disabled over limit: `Doorstep is limited to 10km in v1.`
- Enabled: `Next: quote review`
- Saving: `Saving options`

Rules:
- CTA remains visible at bottom.
- CTA respects safe-area inset.
- Disabled reason must be visible.

## Visual Direction
### Design Character
The screen should feel like an operational choice board. It should be simple, decisive, and policy-aware without feeling bureaucratic.

Use:
- Large option cards.
- Clear selected states.
- One readiness panel.
- Progressive doorstep detail.
- Quiet policy notes.
- Minimal icons.

Avoid:
- Price tables.
- Dense legal copy.
- Maps.
- Courier timelines.
- Multiple warning panels competing.
- Toggle-only labels without explanation.

### Color Tokens
Recommended token roles:
- `surface.base`: app background.
- `surface.card`: option card background.
- `surface.selected`: selected option background.
- `surface.notice`: doorstep requirement panel.
- `surface.blocked`: unavailable doorstep panel.
- `border.default`: quiet card border.
- `border.selected`: selected option border.
- `border.error`: invalid/blocked border.
- `text.primary`: headings and option labels.
- `text.secondary`: support copy.
- `text.error`: blocked state copy.
- `accent.primary`: CTA and selected state.
- `state.warning`: doorstep requirement.
- `state.danger`: over-distance block.

Rules:
- Do not rely on color alone for selected state.
- Keep warning/danger restrained.
- Maintain WCAG AA contrast.

### Typography
Recommended hierarchy:
- Screen title: 28 to 34px, strong weight.
- Option label: 17 to 19px, strong weight.
- Option support: 13 to 15px.
- Readiness panel: 14 to 16px.
- Policy note: 13 to 14px.
- CTA label: 16 to 17px, strong weight.

Rules:
- Keep option support copy short.
- Allow doorstep copy to wrap.
- Avoid all caps for option labels.

### Spacing
Recommended spacing:
- Screen side padding: `20px`.
- Header bottom gap: `20px`.
- Option group gap: `24px`.
- Option card gap: `10px`.
- Doorstep panel top gap: `12px`.
- Sticky CTA padding: `16px` plus safe area.

Rules:
- Separate service speed from final-mile choice.
- Keep doorstep details attached to doorstep selection.
- Avoid repeating policy notes in multiple places.

### Iconography
Allowed icons:
- Back chevron.
- Clock or speed glyph for express.
- Station glyph for pickup.
- Home or route glyph for doorstep.
- Alert glyph for unavailable doorstep.
- Check mark for selected cards.

Rules:
- Icons must support meaning.
- Do not use icon-only options.
- Icon-only buttons require accessible labels.

## Component Inventory
### `CreateDeliveryOptionsScreen`
Responsibilities:
- Own route rendering.
- Validate prerequisites.
- Restore option draft values.
- Validate service and doorstep fields.
- Persist option draft patch.
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

### `QuoteReadinessPanel`
Responsibilities:
- Summarize option readiness.
- Render disabled reasons.
- Avoid showing price.

Required test ID:
- `options-quote-readiness`

### `ServiceSpeedSelector`
Responsibilities:
- Render standard and express choices.
- Store `serviceType`.
- Show route/service unavailable if future data supports it.

Required test IDs:
- `service-type-standard`
- `service-type-express`

### `FinalMileSelector`
Responsibilities:
- Render station pickup and doorstep choices.
- Store `doorstepRequested`.
- Expand doorstep requirements when selected.

Required test IDs:
- `final-mile-station-pickup`
- `final-mile-doorstep`

### `DoorstepRequirementsPanel`
Responsibilities:
- Show address requirement, distance requirement, and prepaid-charge note.
- Offer address action.

Required test ID:
- `doorstep-requirements-panel`

### `DoorstepDistanceSelector`
Responsibilities:
- Capture distance estimate or distance band.
- Map valid bands to numeric `doorstepDistanceKm`.
- Block over-10km.

Required test IDs:
- `doorstep-distance-within-5km`
- `doorstep-distance-5-to-10km`
- `doorstep-distance-over-10km`

### `StickyContinueBar`
Responsibilities:
- Render CTA and support line.
- Handle disabled and saving states.

Required test ID:
- `options-continue-bar`

## Content Specification
### Header Copy
Eyebrow:
- `Create delivery`

Title:
- `Delivery options`

Body:
- `Choose speed and how the receiver gets the package.`

### Step Indicator
Preferred:
- `Step 5 of 6`

Allowed if design system uses labels:
- `Options`

Do not show:
- `Payment`
- `Dispatch`
- `Courier assignment`

### Service Speed Copy
Group heading:
- `Service speed`

Group helper:
- `Choose how Kra should prioritize station handling.`

Standard label:
- `Standard`

Standard body:
- `Regular station processing.`

Express label:
- `Express`

Express body:
- `Priority handling when available.`

Express unavailable body:
- `Express is not available for this route right now.`

### Final-Mile Copy
Group heading:
- `Receiver handoff`

Group helper:
- `Choose whether the receiver collects at station or requests doorstep delivery.`

Station pickup label:
- `Station pickup`

Station pickup body:
- `Receiver collects from the destination station.`

Doorstep label:
- `Doorstep delivery`

Doorstep body:
- `A final-mile courier delivers from the destination station when rules pass.`

### Doorstep Requirement Copy
Address missing:
- `Add receiver address or landmark before choosing doorstep delivery.`

Address present:
- `Doorstep uses the receiver address saved in this draft.`

Phone present:
- `Receiver phone is already saved for delivery notices and proof checks.`

Distance required:
- `Choose the estimated distance from the destination station.`

Prepaid note:
- `Doorstep charges are paid before courier assignment. No cash collection in v1.`

Over-distance:
- `Doorstep delivery is limited to 10km from the destination station in v1.`

### Distance Copy
Within 5km:
- `Within 5km`

Within 5km body:
- `Closest doorstep band.`

Five to ten:
- `5km to 10km`

Five to ten body:
- `Available in v1 with final checks.`

Over ten:
- `More than 10km`

Over ten body:
- `Not available for doorstep in v1.`

### Readiness Copy
Choose service:
- `Choose a service speed to continue.`

Ready station pickup:
- `Options are ready for quote review. Receiver will collect at destination station.`

Ready doorstep:
- `Options are ready for quote review. Doorstep will be checked before payment.`

Address needed:
- `Doorstep needs a receiver address before quote review.`

Distance needed:
- `Doorstep needs a distance estimate before quote review.`

Distance blocked:
- `Doorstep is not available above 10km in v1.`

### Error Copy
Missing service:
- `Choose standard or express service.`

Express unavailable:
- `Express is not available for this route right now.`

Doorstep address required:
- `Doorstep delivery requires a receiver address or landmark.`

Doorstep distance required:
- `Doorstep delivery requires a distance estimate.`

Doorstep over distance:
- `Doorstep delivery is limited to 10km in v1.`

Draft write failed:
- `Delivery options were not saved. Try again before continuing.`

Missing prerequisite:
- `Complete station, receiver, and package details before choosing delivery options.`

### Button Copy
Primary enabled:
- `Review quote`

Primary disabled:
- `Review quote`

Primary saving:
- `Saving options`

Back:
- `Back`

Add address:
- `Add receiver address`

Change address:
- `Change address`

Clear:
- `Clear options`

Start again:
- `Start again`

### Copy Tone
The copy must be:
- Direct.
- Calm.
- Policy-aware.
- Specific.
- Short.

Avoid:
- `Guaranteed fast delivery`
- `Same day`
- `Cheapest`
- `Pay now`
- `Courier assigned`
- `Cash on delivery`
- `Doorstep always available`

## State Model
### `loading`
When:
- Local draft is loading.
- Existing options are being restored.

UI:
- Show header skeleton.
- Show option-card skeletons.
- Show disabled CTA.

Copy:
- `Loading delivery options`

Rules:
- If local data is immediately available, render normal state directly.
- Do not call backend.

### `normal`
When:
- Prerequisites are valid.
- Draft is available.
- Options are empty or valid.

UI:
- Show service speed group.
- Show final-mile group.
- Show readiness panel.
- CTA disabled until service is selected.

### `selected`
When:
- Service is selected.
- Final-mile choice is station pickup, or valid doorstep state is complete.

UI:
- Selected cards are visually clear.
- Readiness panel says ready.
- CTA enabled.

### `doorstep_unavailable`
When:
- Doorstep is selected but policy blocks it.
- Doorstep distance is above `10km`.
- Future availability data blocks doorstep for destination.

UI:
- Doorstep card remains selected or focused.
- Blocked panel explains why.
- CTA disabled.

### `doorstep_address_required`
When:
- Doorstep selected.
- Receiver address is missing.

UI:
- Doorstep requirements panel shows address requirement.
- CTA disabled.
- `Add receiver address` visible.

### `distance_required`
When:
- Doorstep selected.
- Address exists.
- Distance estimate missing.

UI:
- Distance selector visible.
- CTA disabled.

### `distance_blocked`
When:
- Doorstep selected.
- Distance is above `10km` or over-10km band selected.

UI:
- Over-distance card selected or marked.
- Blocked panel visible.
- CTA disabled.

### `field_errors`
When:
- User presses continue and required service or doorstep fields are missing.

UI:
- Show field-level errors.
- Focus first invalid group.
- Announce error.

### `offline`
When:
- Device is offline but local draft is available.

UI:
- Render options normally.
- Show quiet offline note.

Copy:
- `You can save options now. Final checks happen before payment.`

Rules:
- Do not block local option selection.
- Do not create delivery.

### `draft_write_failed`
When:
- Local draft write fails.

UI:
- Keep selected values in memory.
- Show inline error near CTA.
- Allow retry.

Copy:
- `Delivery options were not saved. Try again before continuing.`

### `missing_package_prerequisite`
When:
- Draft lacks valid station, receiver, or package data.

UI:
- Show recovery panel.
- Route to first missing step.

Copy:
- `Complete station, receiver, and package details before choosing delivery options.`

### `stale_draft`
When:
- Draft format is invalid.
- Draft version unsupported.

UI:
- Show restart panel.
- Offer `Start again`.
- Offer `Back to home`.

Copy:
- `This draft needs to be restarted before delivery options can be saved.`

## Interaction Rules
### Service Speed Selection
Behavior:
- Tapping `Standard` stores `serviceType=standard`.
- Tapping `Express` stores `serviceType=express` if available.
- Selected state updates immediately.
- Readiness panel updates.

Default:
- If product chooses default, use `standard`.
- If default selected, display it as selected and explain it.

Unavailable express:
- Disable or allow focus on express card.
- Explain unavailable state.
- Do not allow continue with express if unavailable.

### Final-Mile Selection
Behavior:
- Tapping `Station pickup` sets `doorstepRequested=false` and removes `doorstepDistanceKm`.
- Tapping `Doorstep delivery` sets pending doorstep intent and checks requirements.
- If address missing, show address required state.
- If address exists, reveal distance selector.

Rules:
- Station pickup must not keep stale distance value.
- Doorstep must not continue without distance.

### Distance Selection
Band behavior:
- Selecting `Within 5km` stores pending distance `5`.
- Selecting `5km to 10km` stores pending distance `10`.
- Selecting `More than 10km` blocks continuation and clears pending storable distance.

Numeric behavior if used:
- Values must be greater than `0`.
- Values must be at most `10`.
- Values above `10` block.

### Address Action
When address missing:
- `Add receiver address` routes to `/(sender)/create/receiver?focus=address`.
- Preserve selected service speed and doorstep intent if safe.

When address exists:
- `Change address` routes to `/(sender)/create/receiver?focus=address`.

### Continue
On press:
1. Validate prerequisites.
2. Validate service type.
3. Validate final-mile choice.
4. If station pickup, set `doorstepRequested=false` and omit distance.
5. If doorstep, require address and distance.
6. Persist options patch.
7. Set `deliveryOptionsCompletedAt`.
8. Navigate to `/(sender)/create/quote`.

Failure:
- If validation fails, focus first invalid option group.
- If local write fails, stay on screen.
- If session expires, route to sender sign-in with return destination.

### Back
On press:
- Save option draft opportunistically if valid.
- Route to `/(sender)/create/package`.

If save fails:
- Still allow back.

### Clear Options
On press:
- Reset `serviceType` to default if default exists, otherwise clear.
- Set `doorstepRequested=false`.
- Remove `doorstepDistanceKm`.
- Remove `deliveryOptionsCompletedAt`.
- Stay on same route.

Confirmation:
- Not required unless quote step already exists in draft.

If quote step exists:
- Ask confirmation because options change invalidates quote.

Confirmation copy:
- Title: `Clear delivery options?`
- Body: `This removes speed and doorstep choices. Quote review will need to be rebuilt.`
- Confirm: `Clear options`
- Cancel: `Keep options`

## Accessibility Requirements
### Semantics
Screen:
- Main container has test ID `screen-create-delivery-options`.
- Screen title is primary heading.
- Service speed group is a radio group.
- Final-mile group is a radio group.
- Distance selector is a radio group when bands are used.
- Readiness panel uses status semantics.
- Blocked doorstep message uses alert semantics after user action.

Option cards:
- Expose selected state.
- Expose disabled state and reason.
- Include label plus supporting copy.

### Focus Order
Focus order:
1. Back button.
2. Step label/title.
3. Quote readiness panel.
4. Service speed group.
5. Final-mile group.
6. Doorstep requirements panel if visible.
7. Distance selector if visible.
8. Policy note.
9. Continue CTA.

Error focus:
- On continue press with invalid option, focus the first invalid group.
- Announce blocked distance or missing address.

### Target Size
Minimum targets:
- Back button: `44px` by `44px`.
- Option card: minimum `56px` high.
- Distance card: minimum `56px` high.
- Continue button: minimum `52px` high.

### Contrast
Required:
- Text contrast at least WCAG AA.
- Selected cards visible in high contrast.
- Disabled states remain readable.
- Focus ring visible.

### Large Text
At large text sizes:
- Option cards grow vertically.
- Doorstep panel wraps cleanly.
- Sticky CTA does not cover options.
- Readiness panel remains readable.

### Reduced Motion
If `prefers-reduced-motion` is enabled:
- Doorstep expansion should be instant or short fade.
- Avoid sliding panels that disorient.
- Do not animate selected state continuously.

## Performance And Offline Rules
### Performance
Targets:
- Initial render under `1s` when local draft is available.
- Option tap feedback under `100ms`.
- Eligibility calculation under `50ms`.
- Draft write completes quickly; show saving state only if needed.

Rules:
- Do not load maps.
- Do not request GPS permission.
- Do not call backend.
- Keep validation pure and synchronous.

### Offline
Offline behavior:
- Allow option selection.
- Save to local draft if storage works.
- Show quiet offline note.
- Continue to quote route locally if quote route can calculate from local data.

Offline must not:
- Create delivery.
- Initialize payment.
- Dispatch courier.
- Claim live service availability.

### Low Bandwidth
Low-bandwidth posture:
- Text-only option cards.
- Local icons only.
- No remote maps.
- No remote policy content.

## Security And Privacy
### Data Sensitivity
Options include receiver final-mile preferences and approximate address distance.

Rules:
- Do not log receiver address in analytics.
- Do not log exact doorstep distance if not necessary; use distance band.
- Do not send option data to backend from this screen.
- Do not request GPS.

### Policy Safety
The screen must not imply:
- Doorstep is guaranteed.
- Express guarantees delivery time.
- Cash collection is allowed.
- Courier is assigned before payment.
- Failed doorstep attempts have unlimited retries.

## Analytics And Observability
Analytics must avoid personal address details.

Recommended events:
- `sender_create_options_viewed`
- `sender_create_service_type_selected`
- `sender_create_final_mile_selected`
- `sender_create_doorstep_address_missing`
- `sender_create_doorstep_distance_selected`
- `sender_create_doorstep_distance_blocked`
- `sender_create_options_continue_pressed`
- `sender_create_options_draft_write_failed`

Allowed event properties:
- `source`
- `serviceType`
- `doorstepRequested`
- `distanceBand`
- `doorstepStatus`
- `hasReceiverAddress`
- `isOffline`
- `draftAgeBucket`

Do not send:
- Receiver address.
- Receiver phone.
- Exact address text.
- Raw distance input if numeric.
- Payment data.

## Test IDs
Required test IDs:
- `screen-create-delivery-options`
- `create-options-back`
- `create-options-step-label`
- `create-options-title`
- `options-quote-readiness`
- `service-type-standard`
- `service-type-express`
- `service-type-error`
- `final-mile-station-pickup`
- `final-mile-doorstep`
- `final-mile-error`
- `doorstep-requirements-panel`
- `doorstep-add-address`
- `doorstep-change-address`
- `doorstep-distance-within-5km`
- `doorstep-distance-5-to-10km`
- `doorstep-distance-over-10km`
- `doorstep-distance-error`
- `options-clear`
- `options-continue`
- `options-continue-bar`
- `options-offline-note`
- `options-draft-write-error`
- `options-missing-prerequisite`
- `options-stale-draft`

## QA Scenarios
### Happy Path Station Pickup Standard
1. Open `/(sender)/create/options` with authenticated sender and valid prior draft sections.
2. Confirm title is visible.
3. Select `Standard`.
4. Select `Station pickup`.
5. Confirm readiness panel says options are ready.
6. Press `Review quote`.
7. Confirm draft stores `serviceType=standard`.
8. Confirm draft stores `doorstepRequested=false`.
9. Confirm draft omits `doorstepDistanceKm`.
10. Confirm route changes to `/(sender)/create/quote`.

### Express Station Pickup
1. Select `Express`.
2. Select `Station pickup`.
3. Continue.
4. Confirm draft stores `serviceType=express` and no doorstep distance.

### Doorstep Address Missing
1. Load draft without receiver address.
2. Select doorstep.
3. Confirm address required message.
4. Confirm CTA disabled.
5. Tap `Add receiver address`.
6. Confirm route goes to receiver address focus.

### Doorstep Within 5km
1. Load draft with receiver address.
2. Select standard service.
3. Select doorstep.
4. Select `Within 5km`.
5. Continue.
6. Confirm draft stores `doorstepRequested=true`.
7. Confirm draft stores `doorstepDistanceKm=5`.

### Doorstep 5km To 10km
1. Load draft with receiver address.
2. Select doorstep.
3. Select `5km to 10km`.
4. Continue.
5. Confirm draft stores `doorstepDistanceKm=10`.

### Doorstep Over 10km
1. Load draft with receiver address.
2. Select doorstep.
3. Select `More than 10km`.
4. Confirm blocked message.
5. Confirm CTA disabled.

### Switch From Doorstep To Pickup
1. Select doorstep with valid distance.
2. Switch to station pickup.
3. Continue.
4. Confirm draft omits `doorstepDistanceKm`.

### Express Unavailable Future State
1. Configure express unavailable for route.
2. Confirm express card is disabled or blocked with reason.
3. Confirm selected express cannot continue.

### Missing Service
1. Configure no default service.
2. Select station pickup only.
3. Press continue.
4. Confirm service error.

### Missing Prerequisite
1. Open route without valid package draft.
2. Confirm prerequisite recovery panel.
3. Confirm app routes back to first missing step.

### Offline Local Save
1. Simulate offline device with local draft available.
2. Select valid options.
3. Confirm offline note appears.
4. Continue.
5. Confirm local draft saves and routes to quote.

### Draft Write Failure
1. Force local storage write failure.
2. Select valid options.
3. Press continue.
4. Confirm write failure copy appears.
5. Confirm route does not advance.

### No Backend Mutation
1. Open screen.
2. Select valid options.
3. Continue.
4. Confirm no `POST /v1/deliveries` call occurred.
5. Confirm no payment operation occurred.
6. Confirm no final-mile assignment occurred.

### Accessibility
1. Navigate with screen reader.
2. Confirm radio groups and selected states are announced.
3. Trigger address required state.
4. Confirm message is announced.
5. Increase text size.
6. Confirm option cards and CTA are not clipped.

## Implementation Notes For Claude Code
### File Placement
Claude Code should implement this screen under the sender create-delivery stack when the actual mobile app UI is built. Suggested conceptual placement:
- `apps/mobile/src/screens/sender/create/CreateDeliveryOptionsScreen.tsx`
- `apps/mobile/src/screens/sender/create/components/ServiceSpeedSelector.tsx`
- `apps/mobile/src/screens/sender/create/components/FinalMileSelector.tsx`
- `apps/mobile/src/screens/sender/create/components/DoorstepDistanceSelector.tsx`
- `apps/mobile/src/screens/sender/create/components/QuoteReadinessPanel.tsx`

If the repo structure differs when UI implementation begins, preserve the route and test IDs from this spec.

### Options Form State
Recommended local form state:

```ts
type DeliveryOptionsFormState = {
  serviceType?: "standard" | "express";
  finalMile: "station_pickup" | "doorstep";
  doorstepDistanceBand?: "within_5km" | "five_to_ten_km" | "over_10km";
  touched: {
    serviceType: boolean;
    finalMile: boolean;
    distance: boolean;
  };
};
```

Rules:
- Keep distance band separate from persisted numeric value.
- Convert band to `doorstepDistanceKm` only on valid continue.
- Do not store `doorstepDistanceKm` for station pickup.

### Validation Function
Use pure validation:

```ts
type DeliveryOptionsValidationResult = {
  isValid: boolean;
  patch?: {
    serviceType: "standard" | "express";
    doorstepRequested: boolean;
    doorstepDistanceKm?: number;
  };
  errors: {
    serviceType?: string;
    finalMile?: string;
    doorstepDistanceKm?: string;
  };
  readiness:
    | "choose_service"
    | "ready_station_pickup"
    | "ready_doorstep"
    | "address_needed"
    | "distance_needed"
    | "distance_blocked";
};
```

Rules:
- Require `serviceType`.
- If final-mile is pickup, patch `doorstepRequested=false` and omit distance.
- If final-mile is doorstep, require receiver address and distance.
- Map `within_5km` to `5`.
- Map `five_to_ten_km` to `10`.
- Block `over_10km`.

### Draft Patch Function
Use one options patch:

```ts
type PatchDeliveryOptionsDraftInput = {
  serviceType: "standard" | "express";
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  deliveryOptionsCompletedAt: string;
};
```

Rules:
- Patch only after validation.
- Remove stale `doorstepDistanceKm` when pickup is selected.
- Do not patch if service unavailable.

### Navigation
Forward route:
- `/(sender)/create/quote`

Back route:
- `/(sender)/create/package`

Address route:
- `/(sender)/create/receiver?focus=address`

Missing prerequisite route:
- First missing route among stations, receiver, and package.

Auth failure route:
- Sender sign-in with return destination.

## Visual QA Checklist
Before closing implementation, inspect:
- Standard and express are visible in the first viewport.
- Station pickup and doorstep are clearly different.
- Doorstep expansion does not crowd the screen.
- Address missing state has an obvious action.
- Distance bands are clear.
- Over-10km state blocks without ambiguity.
- No price appears.
- No payment or courier assignment language appears.
- Sticky CTA remains reachable.
- Large text does not clip option cards.
- Selected states are visible without color alone.

## Engineering QA Checklist
Before closing implementation, verify:
- Route exists at `/(sender)/create/options`.
- Primary test ID is present.
- All listed test IDs are present.
- Station, receiver, and package prerequisites are enforced.
- `serviceType` stores only `standard` or `express`.
- `doorstepRequested=false` omits distance.
- Doorstep requires receiver address.
- Doorstep requires distance.
- Over-10km blocks.
- Distance band maps to allowed numeric value.
- CTA writes local draft only.
- CTA routes only after successful local write.
- No backend delivery is created.
- No payment operation is called.
- No final-mile assignment is called.
- Analytics excludes receiver address and raw distance input.
- Screen reader labels and selected states are present.
- Unit tests cover validation and distance mapping.
- Screen tests cover pickup, express, address missing, valid doorstep, over-distance, switching back to pickup, missing prerequisite, and write failure.

## Acceptance Criteria
The screen is complete when:
- Authenticated sender can choose standard or express service.
- Sender can choose station pickup.
- Sender can choose doorstep only when address and distance rules pass.
- Doorstep above `10km` blocks continuation.
- Station pickup omits `doorstepDistanceKm`.
- Valid options are stored in local draft.
- Continuing routes to `/(sender)/create/quote`.
- No backend delivery is created.
- No quote amount is shown.
- No payment operation is called.
- No final-mile assignment is called.
- Missing prerequisite is handled.
- Field and option errors are specific and accessible.
- Offline local save behavior works.
- The screen passes accessibility checks for labels, focus order, selected states, errors, target size, contrast, dynamic type, and reduced motion.
- Tests verify all critical behaviors.


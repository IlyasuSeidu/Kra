# Create Receiver Details Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `CreateReceiverDetails` |
| App | `apps/mobile` |
| Route | `/(sender)/create/receiver` |
| Primary test ID | `screen-create-receiver-details` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Local draft, `deliveryReceiverSchema`, notification and privacy policies |
| Related routes | `/(sender)/create/stations`, `/(sender)/create/package`, `/(sender)/create/options`, `/(sender)/home` |
| Required states | `loading`, `normal`, `field_errors`, `phone_normalization_error`, `optional_address`, `offline`, `draft_write_failed`, `missing_station_prerequisite`, `stale_draft` |

## Product Job
This screen captures the receiver identity and phone number that Kra will use for pickup notices, secure tracking access, and proof-sensitive receiver flows. It must make the sender confident that receiver contact details are important operational data, not marketing data, while keeping the form short enough to complete on a phone.

The sender should be able to:
- Enter receiver name.
- Enter receiver phone in a Ghana-friendly way.
- Understand why receiver phone is required.
- Optionally add receiver address or landmark instructions.
- Continue only when required receiver fields are valid.
- Save receiver details to the local create-delivery draft.
- Move to package details without creating backend delivery state.

This screen is not package details, doorstep option selection, quote review, payment, tracking, receiver verification, or support.

## Audience
Primary audience:
- Authenticated senders creating a delivery for another person.
- Small-business senders booking delivery for customers.
- First-time senders who need clear guidance on receiver phone requirements.
- Repeat senders who need fast form entry and minimal friction.

Secondary audience:
- Receivers indirectly affected by notification accuracy.
- Support staff who later investigate wrong receiver details.
- QA engineers validating field errors and phone normalization.
- Claude Code implementing this route from the spec.

## User State
The sender has already selected a valid origin and destination station pair. The sender now needs to enter the person who will receive pickup notifications or final-mile updates. They may have the receiver phone in contacts, copied from chat, or written in local Ghana format. The screen must support practical entry while storing the backend-required E.164 phone format.

The sender may be:
- In a busy shop entering customer details.
- Copying the receiver number from WhatsApp or SMS.
- Unsure whether the receiver address is required.
- On a small phone with keyboard covering lower fields.
- Offline or on weak data while preparing the booking.

The screen must:
- Keep receiver name and phone as the only required fields.
- Make address optional at this step.
- Explain address becomes required only if doorstep is chosen later.
- Normalize phone into E.164 before local draft completion.
- Avoid creating backend delivery.
- Avoid sending SMS from this screen.
- Avoid asking receiver to create an account.

## Primary Action
Primary CTA:
- `Continue to package`

Secondary actions:
- `Back`
- `Clear receiver`
- `Add address`
- `Remove address`

CTA behavior:
- `Continue to package` validates receiver fields, persists the receiver object into the local draft, and routes to `/(sender)/create/package`.
- `Back` routes to `/(sender)/create/stations`.
- `Clear receiver` clears receiver name, phone, and optional address from this draft section only.
- `Add address` expands optional address fields.
- `Remove address` clears optional address and collapses the address section.

Rules:
- `Continue to package` must stay disabled until required fields pass local validation.
- `Continue to package` must not call `create_delivery`.
- `Continue to package` must not send receiver SMS.
- `Continue to package` must not create a tracking link.
- `Continue to package` must not initialize payment.
- `Continue to package` must not force address unless later doorstep choice already exists in draft metadata.

## First Meaningful Value
First meaningful value is reached when the sender understands that the receiver phone is needed for delivery reliability and can enter it in a format the backend will accept later.

The screen creates value by:
- Preventing wrong-contact failures before booking.
- Making receiver phone purpose transparent.
- Accepting practical Ghana phone entry and storing canonical E.164 format.
- Keeping optional address out of the critical path unless needed.
- Protecting receiver privacy through clear, restrained copy.

Backend delivery state is still not created on this screen.

## Main Tension
Receiver details are sensitive and operationally critical. If the UI feels like a long customer profile form, senders will slow down or abandon. If it is too casual, wrong phone numbers will break SMS, tracking access, OTP proof, failed-attempt recovery, and support investigations. The right UX is a short, serious form with strong input support, immediate validation, and plain-language privacy reassurance.

The screen must balance:
- Speed against contact accuracy.
- Ghana-friendly entry against backend E.164 storage.
- Operational explanation against small-screen brevity.
- Optional address convenience against doorstep rules.
- Privacy reassurance against copy clutter.

## Design Brief
User and job:
- An authenticated sender wants to enter the person who will receive the delivery or pickup notices.

Context of use:
- Transactional, mobile-first, interruption-prone, privacy-sensitive.

Entry point:
- `/(sender)/create/stations` after a valid station pair.

Success state:
- Local draft has valid `receiver.name` and canonical `receiver.phone`, optional `receiver.addressText` if provided, and app routes to `/(sender)/create/package`.

Primary action:
- `Continue to package`

Navigation model:
- Step 3 of sender create-delivery stack flow.

Density:
- Calm form density with high input clarity.

Visual thesis:
- A compact contact card for a serious delivery network: personal data feels protected, phone accuracy feels important, and the next step stays obvious.

Restraint rule:
- Avoid profile-building, contact import pressure, marketing opt-ins, account creation prompts, and address-heavy layout.

Product lens:
- Trust-critical transactional form.

System stance:
- Match the create-delivery visual language established by the station step.

Interaction thesis:
- Field-level validation, keyboard-safe continuation, and a privacy note that is visible without becoming a wall.

Signature move:
- A receiver contact card with a "why phone matters" micro-panel tied directly to SMS and secure tracking.

Activation event:
- Sender continues with valid receiver contact details.

## Elite Quality Gate
This spec is not closed unless the resulting screen makes receiver phone collection fast, accurate, privacy-aware, and aligned with backend validation.

Non-negotiable quality requirements:
- The first viewport must show receiver name and phone as the required fields.
- Phone must be stored as E.164.
- Ghana-friendly entry must be supported without weakening backend schema compliance.
- The sender must understand why the receiver phone is required.
- Address must be optional unless a later doorstep state explicitly makes it required.
- The screen must not call `create_delivery`.
- The screen must not send receiver SMS.
- The screen must not create or reveal tracking link.
- The screen must not ask the receiver to create an account.
- Field errors must be specific and actionable.
- Sensitive data must be treated as operational data only.
- The screen must be keyboard-safe.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If an invalid phone can continue, the screen remains open.
- If phone is stored in non-E.164 format, the screen remains open.
- If address is mandatory for station pickup, the screen remains open.
- If receiver data is sent to backend from this screen, the screen remains open.
- If sender cannot understand the phone purpose, the screen remains open.
- If keyboard hides the CTA or active field, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Apple Human Interface Guidelines support clear text-entry flows, keyboard-aware layouts, content grouping, and platform-native form behavior.
- Material Design text-field guidance supports labels, helper text, error text, and clear field states.
- Nielsen Norman Group mobile form guidance supports short forms, visible labels, clear error handling, and reduced typing friction.
- W3C WCAG 2.2 supports labels, instructions, input error identification, target size, focus order, and accessible status updates.
- Ghana National Communications Authority materials define Ghana numbering as part of the national E.164 numbering plan.
- Google libphonenumber supports practical phone parsing and formatting across countries and should guide phone normalization behavior when available.
- Kra sender app spec defines receiver name and receiver phone as required and address as required only for doorstep.
- Kra authentication flows define receivers as delivery-scoped in v1 rather than account holders.
- Kra notification spec defines receiver SMS events and dedupe policy after lifecycle milestones.
- Kra privacy policy defines names, phones, and addresses as sensitive data.

Reference links:
- https://developer.apple.com/design/human-interface-guidelines/
- https://m3.material.io/components/text-fields/overview
- https://www.nngroup.com/articles/mobile-forms/
- https://www.w3.org/WAI/WCAG22/quickref/
- https://nca.org.gh/2017/09/30/national-itu-t-e-164-numbering-plan/
- https://github.com/google/libphonenumber
- `docs/04-features/sender-app-spec.md`
- `docs/04-features/notifications-spec.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/delivery-draft.ts`
- `services/api/src/app.ts`

## Product Assumptions
Assumptions for v1:
- Sender is authenticated before entering this route.
- Station selection is already valid in the local draft.
- Receiver account creation is not part of v1.
- Receiver access is delivery-scoped through secure link and phone verification.
- Receiver phone is mandatory for pickup notifications, final-mile notifications, and OTP-sensitive proof flows.
- Receiver address is optional at this step.
- Receiver address becomes required later only if doorstep delivery is selected.
- Phone must be stored in E.164 format before delivery creation.
- SMS is sent later from lifecycle events, not from this screen.
- Delivery creation happens later after quote review.

If product later adds contact import, that must be permission-gated and separately specified. This screen must not require contact access.

## Non-Goals
Do not implement these in this screen:
- Contact import permission prompt.
- Receiver account creation.
- Receiver sign-in.
- Receiver OTP verification.
- Secure tracking link generation.
- SMS sending.
- Package description.
- Package weight.
- Package size.
- Service option selection.
- Doorstep selection.
- Doorstep distance calculation.
- Quote amount.
- Payment.
- Backend delivery creation.
- Support issue creation.
- Marketing opt-in.
- Address map search.
- GPS permission.

## Route Rules
### Route
- Render at `/(sender)/create/receiver`.
- Must require authenticated sender session.
- Must require sender role.
- Must not render for unauthenticated users.
- Must not render for staff/admin roles.
- Must require a valid local station pair before normal rendering.
- Must be reachable from `/(sender)/create/stations`.
- Must route forward to `/(sender)/create/package` only after receiver validation succeeds.

### Accepted Query Params
Allowed:
- `source`: `stations`, `resume`, `back`, `unknown`.
- `focus`: `name`, `phone`, `address`, or omitted.

Ignored safely:
- Unknown query params.

Rules:
- `focus=name` moves initial focus to receiver name after first render.
- `focus=phone` moves initial focus to phone field after first render.
- `focus=address` expands optional address and moves focus there.
- Query params must not override saved draft values.

### Entry Preconditions
Before rendering normal state:
- Confirm sender session is valid.
- Load local create-delivery draft.
- Confirm `originStationId` exists.
- Confirm `destinationStationId` exists.
- Confirm origin and destination are different.

If station prerequisite is missing:
- Show missing station prerequisite state.
- Provide `Choose stations`.
- Do not render receiver form as normal.

If local draft is stale:
- Show stale draft state.
- Offer `Start again` and `Back to home`.
- Do not silently discard receiver data.

### Exit Rules
On valid continue:
- Trim receiver name.
- Normalize receiver phone to E.164.
- Trim optional address.
- Omit address if blank.
- Persist receiver object to local draft.
- Persist `receiverDetailsCompletedAt`.
- Route to `/(sender)/create/package`.

On back:
- Preserve entered receiver fields when possible.
- Route to `/(sender)/create/stations`.

On clear:
- Remove `receiver.name`.
- Remove `receiver.phone`.
- Remove `receiver.addressText`.
- Remove `receiverDetailsCompletedAt`.
- Stay on the same route.

## Backend And Data Contract
### Current Backend Boundary
This route is local-draft only. It prepares data for the later `create_delivery` request but must not call that operation.

Allowed:
- Read local draft.
- Patch local draft receiver fields.
- Use local validation aligned with `deliveryReceiverSchema`.
- Use local phone normalization helper.
- Use local analytics with privacy-safe metadata.

Not allowed:
- `POST /v1/deliveries`
- `POST /v1/payments/initialize`
- `POST /v1/public/track/:trackingCode/request-verification`
- `POST /v1/public/track/:trackingCode/verify-phone`
- Receiver SMS dispatch.
- Tracking link creation.
- Admin endpoints.

### API Schema Alignment
Backend receiver schema:

```ts
const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format.");

export const deliveryReceiverSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  addressText: z.string().trim().min(5).max(240).optional()
});
```

UI validation must be equal to or stricter than this schema.

### Draft Receiver Shape
The screen owns this draft patch:

```ts
type ReceiverDraftPatch = {
  receiver?: {
    name: string;
    phone: string;
    addressText?: string;
  };
  receiverDetailsCompletedAt?: string;
};
```

Rules:
- `receiver.name` stores trimmed text.
- `receiver.phone` stores canonical E.164 text.
- `receiver.addressText` is omitted when blank.
- `receiverDetailsCompletedAt` is set only after valid continue.

### Field Limits
Receiver name:
- Required.
- Trim whitespace.
- Minimum `2` characters.
- Maximum `120` characters to match backend.
- UI should guide users toward real full name but must not require two separate fields.

Receiver phone:
- Required.
- Must normalize to E.164.
- Must start with `+`.
- Must have a country code and 8 to 14 digits after the first digit according to backend regex.
- Default country context should be Ghana `+233`.

Receiver address:
- Optional at this step.
- Trim whitespace.
- If present, minimum `5` characters.
- Maximum `240` characters.
- Should support landmarks and pickup instructions.
- Required later only if doorstep delivery is selected.

### Phone Normalization Policy
Accepted user entry patterns:
- E.164 with plus sign.
- Ghana local number with leading zero.
- Ghana number without leading zero when `+233` country context is selected.
- Pasted text with spaces or hyphens if it can normalize safely.

Rejected:
- Empty phone.
- Too short.
- Too long.
- Letters.
- Multiple plus signs.
- Ambiguous country code when non-Ghana country is not selected.
- Service short codes.

Storage:
- Always store E.164.
- For Ghana, stored value starts with `+233`.

Recommended implementation:
- Prefer libphonenumber or a proven equivalent parser when the mobile stack supports it.
- If no parser is available at first UI build, implement a narrow Ghana-only normalizer and keep it covered by tests.
- Do not hand-roll broad international phone parsing beyond supported scope.

### Privacy Boundary
Receiver name, phone, and address are sensitive data.

Rules:
- Do not log raw receiver phone in analytics.
- Do not log receiver address in analytics.
- Do not show phone in crash breadcrumbs.
- Do not use receiver data for marketing opt-in.
- Do not store receiver contact outside the create-delivery draft path.
- Clear draft receiver data on logout according to app draft policy.

## Information Architecture
### Screen Regions
1. Top navigation
2. Step header
3. Receiver contact card
4. Phone purpose panel
5. Optional address section
6. Privacy note
7. Sticky continue action

### Priority Order
The visual hierarchy must be:
- Current step and task.
- Receiver name field.
- Receiver phone field.
- Phone purpose.
- Optional address.
- Validation summary if needed.
- Continue CTA.

### First Viewport
On an iPhone-sized viewport, the first screen view should include:
- Back affordance.
- `Receiver details` title.
- Short task copy.
- Receiver name field.
- Receiver phone field.
- At least part of phone purpose or CTA support copy.

The optional address section may sit below first viewport.

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
- Optional progress text `Step 3 of 6`.

Rules:
- Back target is station selection.
- Back button hit area minimum `44px` by `44px`.
- Do not add a close button unless the create flow shell already provides one.

### Step Header
Content:
- Eyebrow: `Create delivery`
- Title: `Receiver details`
- Body: `Add the person Kra should notify for pickup or delivery updates.`

Rules:
- Body copy must stay under 100 characters.
- Do not mention account creation.
- Do not mention marketing.

### Receiver Contact Card
Fields:
- Receiver name.
- Receiver phone.

Visual rules:
- Treat the two required fields as one contact card.
- Use visible labels, not only hint text.
- Use helper copy only where it reduces error.
- Keep card chrome restrained.
- Keep fields large enough for thumbs.

### Phone Purpose Panel
Purpose:
- Explain why the phone field is required.

Recommended copy:
- `Kra uses this number for pickup notices, secure tracking checks, and delivery proof.`

Rules:
- Keep under 120 characters.
- Use a small icon only if it supports scanning.
- Do not over-explain SMS internals.
- Do not claim SMS will be sent immediately.

### Optional Address Section
Default collapsed heading:
- `Address or landmark`

Collapsed body:
- `Optional now. Required later only if you choose doorstep delivery.`

Expanded field label:
- `Receiver address or landmark`

Field helper:
- `Add clear directions if doorstep delivery may be needed later.`

Rules:
- Address section is optional unless draft already has `doorstepRequested=true`.
- If `doorstepRequested=true` from a resumed draft, address becomes required with clear copy.
- Do not include map search.
- Do not request location permission.

### Privacy Note
Recommended copy:
- `Receiver details are used only to move the package, send delivery notices, verify access, and resolve issues.`

Rules:
- Place below form fields or near CTA support text.
- Keep visible but visually quiet.
- Do not hide privacy entirely behind a link.
- Link to privacy policy only if the app shell supports policy routing.

### Sticky Bottom CTA
Elements:
- Primary button `Continue to package`
- Support line.

Support line variants:
- Disabled missing: `Enter receiver name and phone to continue.`
- Disabled invalid phone: `Enter a valid receiver phone number.`
- Enabled: `Next: package details`
- Saving: `Saving receiver details`

Rules:
- CTA remains visible at bottom.
- CTA respects safe-area inset.
- CTA moves or remains visible when keyboard opens.
- CTA must not cover active fields.

## Visual Direction
### Design Character
The screen should feel like a secure contact capture step, not a generic address book form.

Use:
- Clean form fields.
- Strong labels.
- Quiet privacy treatment.
- A warm but restrained phone-purpose panel.
- Clear error states.
- Keyboard-aware spacing.

Avoid:
- Long profile forms.
- Contact import prompts.
- Receiver avatar upload.
- Decorative illustrations.
- Marketing language.
- Address-first layout.
- Tiny inline error text.
- Hidden labels.

### Color Tokens
Recommended token roles:
- `surface.base`: app background.
- `surface.card`: receiver contact card.
- `surface.notice`: phone purpose panel.
- `border.default`: quiet field border.
- `border.focus`: focused field border.
- `border.error`: invalid field border.
- `text.primary`: headings and labels.
- `text.secondary`: helper copy.
- `text.error`: field errors.
- `accent.primary`: CTA and focused progress.

Rules:
- Use error color only for errors.
- Do not use green for valid fields unless the design system already does.
- Maintain WCAG AA contrast.
- Keep selected/focused states clear in high contrast mode.

### Typography
Recommended hierarchy:
- Screen title: 28 to 34px, strong weight.
- Field labels: 14 to 16px, medium to strong weight.
- Field input: 17 to 19px.
- Helper copy: 13 to 14px.
- Error copy: 13 to 14px, strong enough for scanning.
- CTA label: 16 to 17px, strong weight.

Rules:
- Labels must remain visible while text is entered.
- Avoid long helper paragraphs.
- Keep phone purpose copy concise.

### Spacing
Recommended spacing:
- Screen side padding: `20px`.
- Header bottom gap: `20px`.
- Field vertical gap: `14px`.
- Contact card padding: `16px`.
- Notice panel padding: `14px`.
- Optional address section gap: `20px`.
- Sticky CTA padding: `16px` plus safe area.

Rules:
- Keep related fields close.
- Separate optional address from required contact fields.
- Increase bottom padding when keyboard and sticky CTA interact.

### Iconography
Allowed icons:
- Back chevron.
- Phone glyph for purpose panel.
- Lock or shield glyph for privacy note.
- Alert glyph for errors.
- Chevron for address expand/collapse.

Rules:
- Icons must support meaning.
- Do not use icon-only form labels.
- Icon-only buttons require accessible labels.

## Component Inventory
### `CreateReceiverDetailsScreen`
Responsibilities:
- Own route rendering.
- Validate station prerequisite.
- Restore draft receiver fields.
- Normalize phone.
- Persist receiver patch.
- Navigate forward/back.
- Render all states.

Required props if implemented as a pure screen component:
- `session`
- `initialDraft`
- `onPatchDraft`
- `onNavigate`
- `now`
- `phoneNormalizer`

### `CreateFlowHeader`
Responsibilities:
- Back navigation.
- Step label.
- Title region.

States:
- Default.
- Loading.
- Missing prerequisite.

### `ReceiverContactCard`
Responsibilities:
- Render receiver name and phone fields.
- Display field errors.
- Coordinate keyboard return behavior.

Required test ID:
- `receiver-contact-card`

### `ReceiverNameField`
Responsibilities:
- Capture and validate receiver name.

Required test ID:
- `receiver-name-input`

### `ReceiverPhoneField`
Responsibilities:
- Capture phone input.
- Apply Ghana default country context.
- Normalize to E.164.
- Display phone errors.

Required test ID:
- `receiver-phone-input`

### `PhonePurposePanel`
Responsibilities:
- Explain why phone is required.
- Reassure sender that it is operational.

Required test ID:
- `receiver-phone-purpose`

### `OptionalAddressSection`
Responsibilities:
- Expand/collapse optional address.
- Render address input.
- Validate address only when non-empty or required by doorstep state.

Required test IDs:
- `receiver-address-toggle`
- `receiver-address-input`

### `ReceiverPrivacyNote`
Responsibilities:
- Render privacy copy.

Required test ID:
- `receiver-privacy-note`

### `StickyContinueBar`
Responsibilities:
- Render CTA and support line.
- Handle disabled and saving states.

Required test ID:
- `receiver-continue-bar`

## Content Specification
### Header Copy
Eyebrow:
- `Create delivery`

Title:
- `Receiver details`

Body:
- `Add the person Kra should notify for pickup or delivery updates.`

### Step Indicator
Preferred:
- `Step 3 of 6`

Allowed if design system uses labels:
- `Receiver`

Do not show:
- `Account`
- `Payment`
- `OTP`

### Required Field Labels
Receiver name:
- `Receiver name`

Receiver phone:
- `Receiver phone`

### Required Field Helpers
Receiver name helper:
- `Use the name station staff or courier should ask for.`

Receiver phone helper:
- `Use a number that can receive delivery SMS.`

Phone format helper:
- `Ghana numbers are saved in +233 format.`

### Optional Address Copy
Collapsed title:
- `Address or landmark`

Collapsed body:
- `Optional now. Required later only if you choose doorstep delivery.`

Expanded field label:
- `Receiver address or landmark`

Expanded helper:
- `Add clear directions if doorstep delivery may be needed later.`

Doorstep-required helper if returning from options:
- `Doorstep delivery needs a usable address or landmark.`

### Purpose Copy
Phone purpose:
- `Kra uses this number for pickup notices, secure tracking checks, and delivery proof.`

Privacy note:
- `Receiver details are used only to move the package, send delivery notices, verify access, and resolve issues.`

### Error Copy
Missing name:
- `Enter the receiver name.`

Name too short:
- `Receiver name must be at least 2 characters.`

Name too long:
- `Receiver name must be 120 characters or less.`

Missing phone:
- `Enter the receiver phone number.`

Invalid phone:
- `Enter a valid receiver phone number.`

Phone not E.164 after normalization:
- `Use a phone number that can be saved in international format.`

Address too short:
- `Address or landmark must be at least 5 characters.`

Address too long:
- `Address or landmark must be 240 characters or less.`

Doorstep address required:
- `Doorstep delivery requires a receiver address or landmark.`

Draft write failed:
- `Receiver details were not saved. Try again before continuing.`

Missing station prerequisite:
- `Choose origin and destination stations before adding receiver details.`

Stale draft:
- `This draft needs to be restarted before receiver details can be saved.`

### Button Copy
Primary enabled:
- `Continue to package`

Primary disabled:
- `Continue to package`

Primary saving:
- `Saving receiver`

Back:
- `Back`

Clear:
- `Clear receiver`

Add address:
- `Add address`

Remove address:
- `Remove address`

Choose stations:
- `Choose stations`

Start again:
- `Start again`

### Copy Tone
The copy must be:
- Direct.
- Calm.
- Privacy-aware.
- Operational.
- Specific.
- Short.

Avoid:
- `Add customer profile`
- `Invite receiver`
- `Create receiver account`
- `Marketing updates`
- `Verify now`
- `Send SMS`
- `Pay now`

## State Model
### `loading`
When:
- Local draft is loading.
- Existing receiver fields are being restored.

UI:
- Show header skeleton.
- Show two field skeletons.
- Show disabled CTA.

Copy:
- `Loading receiver details`

Rules:
- If local data is immediately available, render normal state directly.
- Do not call backend.

### `normal`
When:
- Station prerequisite is valid.
- Draft is available.
- Required fields are empty or valid.

UI:
- Show receiver contact card.
- Show phone purpose panel.
- Show optional address section collapsed unless existing address exists.
- Show privacy note.
- CTA disabled until required fields valid.

### `field_errors`
When:
- Name, phone, or address validation fails after blur, continue press, or field interaction.

UI:
- Show field-level error below each affected field.
- Mark fields with error border.
- Announce errors accessibly.
- Keep CTA disabled.

Rules:
- Do not show all errors before user interaction unless continue was pressed.
- Do not replace helper text entirely if helper is needed for correction; error takes priority.

### `phone_normalization_error`
When:
- User-entered phone cannot be converted to E.164.

UI:
- Show phone field error.
- Keep phone input text available for correction.
- Keep CTA disabled.

Copy:
- `Enter a valid receiver phone number.`

Recovery:
- User edits phone.

### `optional_address`
When:
- User expands address section.

UI:
- Show address text area.
- Show helper copy.
- Validate if non-empty.

Rules:
- Address is optional unless doorstep is already selected in draft.
- If empty and optional, omit from draft.

### `doorstep_address_required`
When:
- A resumed draft already has `doorstepRequested=true`.
- Address is missing or invalid.

UI:
- Address section opens automatically.
- Address field shows required state.
- CTA disabled until valid.

Copy:
- `Doorstep delivery requires a receiver address or landmark.`

### `offline`
When:
- Device is offline but local draft is available.

UI:
- Render form normally.
- Show quiet offline note.

Copy:
- `You can save receiver details now. Final checks happen before payment.`

Rules:
- Do not block local draft entry.
- Do not send SMS.

### `draft_write_failed`
When:
- Local draft write fails.

UI:
- Keep entered values in memory.
- Show inline error near CTA.
- Allow retry.

Copy:
- `Receiver details were not saved. Try again before continuing.`

### `missing_station_prerequisite`
When:
- Draft lacks valid station IDs.

UI:
- Show recovery panel.
- Provide `Choose stations`.
- Provide `Back to home`.
- Do not render normal form as primary content.

Copy:
- `Choose origin and destination stations before adding receiver details.`

### `stale_draft`
When:
- Draft format is invalid.
- Draft version unsupported.
- Existing station or receiver data cannot be trusted.

UI:
- Show restart panel.
- Offer `Start again`.
- Offer `Back to home`.

Copy:
- `This draft needs to be restarted before receiver details can be saved.`

## Interaction Rules
### Name Field
Behavior:
- Auto-capitalization should use words if platform supports it.
- Trim on blur and continue.
- Keep internal spacing typed by user unless multiple spaces cause validation problem.
- Return key moves to phone field.

Validation timing:
- Show missing error after blur if touched.
- Show all required errors after continue press.

### Phone Field
Behavior:
- Default country context is Ghana `+233`.
- Use phone keypad.
- Accept paste.
- Strip spaces, hyphens, and parentheses before normalization.
- Preserve visible typed value while editing.
- Show normalized display only after blur or valid continue, if the design supports it.

Formatting:
- Field label remains `Receiver phone`.
- Prefix treatment may show `+233` as a fixed country selector if implementation supports it.
- If fixed prefix is used, store the full E.164 value in draft.

Validation timing:
- Do not show error on first character.
- Show error on blur if invalid.
- Show error on continue press if invalid.

Return key:
- If address collapsed, return key can dismiss keyboard.
- If address expanded, return key moves to address field.

### Address Section
Behavior:
- Collapsed by default.
- Expands on `Add address`.
- If address already exists in draft, starts expanded.
- If doorstep is already selected in resumed draft, starts expanded and required.
- Text area supports multi-line entry.

Validation:
- If blank and optional, valid.
- If non-empty under 5 characters, invalid.
- If over 240 characters, invalid.

### Continue
On press:
1. Validate station prerequisite.
2. Validate name.
3. Normalize and validate phone.
4. Validate address if present or required.
5. Persist receiver patch to local draft.
6. Set `receiverDetailsCompletedAt`.
7. Navigate to `/(sender)/create/package`.

Failure:
- If validation fails, focus first invalid field.
- If local write fails, stay on screen.
- If session expires, route to sender sign-in with return destination.

### Back
On press:
- Save draft opportunistically if fields are valid or partially entered.
- Route to `/(sender)/create/stations`.

If save fails:
- Still allow back.
- Preserve in-memory values only while screen remains mounted.

### Clear Receiver
On press:
- If no receiver data exists, keep button hidden or disabled.
- If receiver data exists and no later steps are complete, clear without confirmation.
- If later package/options/quote steps are complete, ask confirmation.

Confirmation copy:
- Title: `Clear receiver details?`
- Body: `This removes the person Kra will notify for this draft. Later steps may need review.`
- Confirm: `Clear receiver`
- Cancel: `Keep details`

## Accessibility Requirements
### Semantics
Screen:
- Main container has test ID `screen-create-receiver-details`.
- Screen title is primary heading.
- Receiver contact card is a form group.
- Optional address section exposes expanded/collapsed state.
- Error summary is not required if field errors are close to fields, but field errors must be announced.

Fields:
- Every input has a visible label.
- Required state is announced.
- Error text is associated with the field.
- Helper text is associated where supported.

Phone purpose panel:
- Exposed as informative text, not alert.

Privacy note:
- Exposed as informative text.

### Focus Order
Focus order:
1. Back button.
2. Step label/title.
3. Receiver name.
4. Receiver phone.
5. Phone purpose panel.
6. Address toggle.
7. Address input if expanded.
8. Privacy note.
9. Continue CTA.

Error focus:
- On continue press with invalid fields, focus first invalid field.
- Announce error message after focus.

### Target Size
Minimum targets:
- Back button: `44px` by `44px`.
- Text input height: minimum `48px`.
- Address toggle: minimum `44px` high.
- Continue button: minimum `52px` high.

### Contrast
Required:
- Text contrast at least WCAG AA.
- Error text and borders must be visible in high contrast mode.
- Focus ring must be visible.

### Large Text
At large text sizes:
- Fields grow vertically.
- Helper and error text wrap.
- Sticky CTA does not cover inputs.
- Address text area remains usable.

### Reduced Motion
If `prefers-reduced-motion` is enabled:
- Address expand/collapse should be instant or short fade.
- Error reveal should not shake.
- CTA saving state should not rely on continuous motion.

## Keyboard And Input Requirements
### Keyboard Behavior
Name field:
- Text keyboard.
- Auto-capitalization words.
- Return key `Next`.

Phone field:
- Phone keypad.
- Return key `Done` or `Next` depending on address state.

Address field:
- Text keyboard.
- Multi-line.
- Return key inserts newline if native text area does so.

Keyboard rules:
- Active field must stay visible.
- Sticky CTA must avoid keyboard overlap.
- Scroll view must allow enough bottom padding.
- Tapping outside field may dismiss keyboard if platform norm supports it.

### Autofill
Allowed:
- Contact name autofill if platform offers it without permission prompt.
- Phone autofill if platform offers it without permission prompt.

Not allowed:
- Contacts permission prompt from this screen.
- Silent contact book scan.

## Performance And Offline Rules
### Performance
Targets:
- Initial render under `1s` when local draft is available.
- Field entry feedback under `100ms`.
- Phone normalization on blur or continue under `100ms`.
- Draft write should complete quickly; show saving state only when needed.

Rules:
- Do not load map SDKs.
- Do not request contacts permission.
- Do not request GPS permission.
- Do not call backend.
- Do not add heavy validation libraries unless already part of app stack.

### Offline
Offline behavior:
- Allow receiver details entry.
- Save to local draft if storage works.
- Show quiet offline note.
- Continue to package locally if fields validate.

Offline must not:
- Send SMS.
- Verify receiver phone.
- Create delivery.
- Claim final backend acceptance.

### Low Bandwidth
Low-bandwidth posture:
- Text-only form.
- No remote images.
- Local icons only.
- No remote address search.

## Security And Privacy
### Sensitive Data
Receiver data includes:
- Personal name.
- Phone number.
- Address or landmark if provided.

Rules:
- Treat all as sensitive.
- Do not log raw values.
- Do not include raw phone in analytics.
- Do not include address in analytics.
- Do not show receiver phone in notifications from this screen.
- Do not send data to backend from this screen.

### User-Facing Privacy
Privacy copy must make three things clear:
- Why data is collected.
- What it is used for.
- What it is not used for.

Required idea:
- Operational delivery use only.

Do not imply:
- Marketing use.
- Receiver account creation.
- SMS sent immediately.

### Draft Storage
Local draft storage must:
- Store only what the sender typed and normalized phone.
- Preserve values through app backgrounding.
- Clear on logout or explicit draft reset.
- Avoid stale receiver details carrying into a different sender account.

## Analytics And Observability
Analytics must be privacy-safe.

Recommended events:
- `sender_create_receiver_viewed`
- `sender_create_receiver_name_entered`
- `sender_create_receiver_phone_valid`
- `sender_create_receiver_phone_invalid`
- `sender_create_receiver_address_expanded`
- `sender_create_receiver_continue_pressed`
- `sender_create_receiver_draft_write_failed`

Allowed event properties:
- `source`
- `hasReceiverName`
- `phoneCountryCode`
- `phoneValidationStatus`
- `hasAddress`
- `addressRequired`
- `isOffline`
- `draftAgeBucket`

Do not send:
- Receiver name.
- Receiver phone.
- Receiver address.
- Full typed phone.
- Raw validation input.

## Test IDs
Required test IDs:
- `screen-create-receiver-details`
- `create-receiver-back`
- `create-receiver-step-label`
- `create-receiver-title`
- `receiver-contact-card`
- `receiver-name-input`
- `receiver-name-error`
- `receiver-phone-input`
- `receiver-phone-error`
- `receiver-phone-purpose`
- `receiver-address-toggle`
- `receiver-address-input`
- `receiver-address-error`
- `receiver-privacy-note`
- `receiver-clear`
- `receiver-continue`
- `receiver-continue-bar`
- `receiver-offline-note`
- `receiver-draft-write-error`
- `receiver-missing-station-prerequisite`
- `receiver-stale-draft`

## QA Scenarios
### Happy Path
1. Open `/(sender)/create/receiver` with authenticated sender and valid station draft.
2. Confirm title is visible.
3. Enter receiver name.
4. Enter a valid Ghana receiver phone.
5. Confirm privacy note is visible.
6. Confirm CTA enables.
7. Press `Continue to package`.
8. Confirm draft stores receiver name.
9. Confirm draft stores receiver phone in E.164 format.
10. Confirm route changes to `/(sender)/create/package`.

### Optional Address
1. Open screen.
2. Expand address section.
3. Enter a valid address or landmark.
4. Continue.
5. Confirm draft includes `receiver.addressText`.

### Address Blank And Optional
1. Open screen.
2. Leave address collapsed.
3. Enter valid name and phone.
4. Continue.
5. Confirm draft omits `receiver.addressText`.

### Doorstep Requires Address On Resume
1. Load draft with `doorstepRequested=true` and no address.
2. Open receiver route.
3. Confirm address section is expanded and required.
4. Try to continue.
5. Confirm address required error.

### Missing Name
1. Enter valid phone.
2. Leave name blank.
3. Press continue.
4. Confirm missing name error.
5. Confirm focus moves to name field.

### Name Too Short
1. Enter one visible character.
2. Enter valid phone.
3. Press continue.
4. Confirm name length error.

### Invalid Phone
1. Enter valid name.
2. Enter invalid phone.
3. Press continue.
4. Confirm phone error says `Enter a valid receiver phone number.`
5. Confirm focus moves to phone field.

### Phone Normalization
1. Enter valid name.
2. Enter Ghana local phone format.
3. Press continue.
4. Confirm stored phone starts with `+233`.
5. Confirm UI does not store spaces or hyphens.

### Pasted Phone
1. Paste a phone containing spaces or hyphens.
2. Confirm field accepts input.
3. Blur or continue.
4. Confirm normalization succeeds if digits are valid.

### Address Too Short
1. Expand address section.
2. Enter fewer than 5 characters.
3. Press continue.
4. Confirm address length error.

### Missing Station Prerequisite
1. Open route with no station draft.
2. Confirm prerequisite recovery panel.
3. Confirm `Choose stations` route works.
4. Confirm receiver form is not primary content.

### Offline Local Save
1. Simulate offline device with local draft available.
2. Enter valid receiver fields.
3. Confirm offline note appears.
4. Continue.
5. Confirm local draft saves and routes to package.

### Draft Write Failure
1. Force local storage write failure.
2. Enter valid receiver fields.
3. Press continue.
4. Confirm write failure copy appears.
5. Confirm route does not advance.

### No Backend Mutation
1. Open the screen.
2. Enter valid receiver fields.
3. Continue.
4. Confirm no `POST /v1/deliveries` call occurred.
5. Confirm no receiver SMS operation occurred.
6. Confirm no payment operation occurred.

### Accessibility
1. Navigate with screen reader.
2. Confirm field labels are announced.
3. Trigger phone error.
4. Confirm error is announced and associated with phone field.
5. Increase text size.
6. Confirm no field or CTA is clipped.

## Implementation Notes For Claude Code
### File Placement
Claude Code should implement this screen under the sender create-delivery stack when the actual mobile app UI is built. Suggested conceptual placement:
- `apps/mobile/src/screens/sender/create/CreateReceiverDetailsScreen.tsx`
- `apps/mobile/src/screens/sender/create/components/ReceiverContactCard.tsx`
- `apps/mobile/src/screens/sender/create/components/ReceiverPhoneField.tsx`
- `apps/mobile/src/screens/sender/create/components/OptionalAddressSection.tsx`

If the repo structure differs when UI implementation begins, preserve the route and test IDs from this spec.

### Receiver Form State
Recommended local form state:

```ts
type ReceiverFormState = {
  name: string;
  phoneInput: string;
  normalizedPhone?: string;
  addressText: string;
  addressExpanded: boolean;
  touched: {
    name: boolean;
    phone: boolean;
    address: boolean;
  };
};
```

Rules:
- Keep `phoneInput` separate from `normalizedPhone`.
- Only write `normalizedPhone` to draft after validation.
- Do not lose typed phone if normalization fails.

### Validation Function
Use pure validation:

```ts
type ReceiverValidationResult = {
  isValid: boolean;
  normalizedPhone?: string;
  errors: {
    name?: string;
    phone?: string;
    addressText?: string;
  };
};
```

Rules:
- Trim before validation.
- Normalize phone before setting `normalizedPhone`.
- Use backend-compatible E.164 regex as final gate.
- Omit address if blank and not required.

### Ghana Phone Normalizer
Recommended behavior:
- If input starts with `+`, parse as international.
- If input starts with `0`, remove leading `0` and prefix `+233`.
- If input starts with Ghana mobile national digits without leading `0`, prefix `+233`.
- Reject ambiguous non-Ghana numbers unless future country selector exists.

Final guard:

```ts
const e164Regex = /^\+[1-9]\d{7,14}$/;
```

Use libphonenumber if available. If not available, keep the narrow Ghana formatter small and heavily tested.

### Draft Patch Function
Use one receiver patch:

```ts
type PatchReceiverDraftInput = {
  receiver: {
    name: string;
    phone: string;
    addressText?: string;
  };
  receiverDetailsCompletedAt: string;
};
```

Rules:
- Patch only after validation.
- Do not write invalid phone.
- Do not include blank address.

### Navigation
Forward route:
- `/(sender)/create/package`

Back route:
- `/(sender)/create/stations`

Missing station route:
- `/(sender)/create/stations`

Auth failure route:
- Sender sign-in with return destination.

## Visual QA Checklist
Before closing implementation, inspect:
- Receiver name and phone are visible in the first viewport.
- Phone purpose is clear without becoming a paragraph.
- Address does not dominate the screen.
- Privacy note is visible and calm.
- Required fields have visible labels.
- Field errors are close to fields.
- CTA remains usable when keyboard is open.
- Phone keypad appears for phone field.
- Large text does not clip labels or errors.
- No copy implies receiver account creation.
- No copy implies SMS is sent immediately.
- No quote, payment, or tracking link appears.

## Engineering QA Checklist
Before closing implementation, verify:
- Route exists at `/(sender)/create/receiver`.
- Primary test ID is present.
- All listed test IDs are present.
- Valid station prerequisite is enforced.
- Name validation matches backend length rules.
- Phone stores E.164.
- Invalid phone cannot continue.
- Optional blank address is omitted.
- Non-empty address validates against backend length.
- Doorstep-resumed draft requires address.
- CTA writes local draft only.
- CTA routes only after successful local write.
- No backend delivery is created.
- No SMS operation is called.
- No payment operation is called.
- Analytics excludes raw receiver data.
- Screen reader labels and error associations are present.
- Keyboard-open layout is usable.
- Unit tests cover phone normalization.
- Screen tests cover happy path, invalid phone, optional address, doorstep-required address, missing station prerequisite, and draft write failure.

## Acceptance Criteria
The screen is complete when:
- Authenticated sender can enter receiver name and phone.
- Receiver phone is stored in E.164 format.
- Invalid phone cannot continue.
- Receiver address is optional unless doorstep already requires it.
- Privacy purpose is visible.
- Phone purpose is visible.
- Continuing stores receiver details in local draft.
- Continuing routes to `/(sender)/create/package`.
- No backend delivery is created.
- No receiver SMS is sent.
- No payment operation is called.
- Missing station prerequisite is handled.
- Field errors are specific and accessible.
- Offline local save behavior works.
- The screen passes accessibility checks for labels, focus order, errors, target size, contrast, dynamic type, and reduced motion.
- Tests verify all critical behaviors.


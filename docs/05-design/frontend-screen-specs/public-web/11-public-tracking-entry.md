# Public Tracking Entry Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicTrackingEntry` |
| App | `apps/web` |
| Route | `/track` |
| Primary test ID | `screen-public-tracking-entry` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_public_tracking` |
| Related routes | `/`, `/support`, `/delivery-policy`, `/privacy`, receiver public tracking flow |
| Required states | `loading`, `invalid code`, `rate limited`, `normal` |

## Product Job
This page must let a sender or receiver enter a Kra tracking code and reach the correct public tracking experience without creating an account. It must be fast, privacy-safe, accessible, and explicit about what public tracking can and cannot show.

The page must help users:
- Enter a tracking code in the expected `KRA-...` format.
- Normalize obvious input issues such as surrounding spaces and lowercase letters.
- Understand format errors before an API call.
- Submit a valid code to `GET /v1/public/track/:trackingCode`.
- See a safe loading state while the lookup runs.
- Recover from invalid code, not found, service unavailable, and rate-limited states.
- Continue into receiver phone verification when the delivery stage requires it.
- Continue into receiver-safe tracking details when verification is not required for the current state.
- Understand that public tracking is event-first and does not show internal notes, payment internals, raw proof files, staff IDs, or precise live GPS trails.

This screen is an entry point. It must not try to replace the full receiver tracking timeline, phone challenge, OTP verification, arrival instructions, failed attempt, or access-denied screens.

## Audience
Primary audience:
- Receivers opening a tracking link or typing a tracking code from SMS.
- Senders checking package progress from a public web browser.

Secondary audience:
- Support users who have a tracking code but no app session.
- Visitors checking how Kra tracking works before sending.
- Business senders supporting their own customers.

## User State
Users may be anxious, distracted, or using a phone on a weak network. Some will paste a code with spaces, lowercase letters, or extra words around it. Some will use an expired or wrong code. The page must be forgiving on input but strict about privacy and backend contract boundaries.

## Primary Action
Primary CTA: `Track package`

Secondary CTA: `Need help?`

Tertiary CTA: `How tracking works`

CTA behavior:
- `Track package` submits the tracking form.
- `Need help?` routes to `/support`.
- `How tracking works` routes to `/delivery-policy` or an in-page explanation section if implemented.

## Main Tension
Tracking must feel immediate without overexposing delivery data. The entry page should help legitimate users get to the right flow quickly, but it must not become a public data leak, live-map promise, refund explainer, or support case form.

## Visual Thesis
Design this page as a high-trust tracking console: one focused input, one confident action, a privacy-safe status preview, and clear recovery paths. It should feel as polished as a top-tier carrier tracking page but more transparent about handoffs and receiver verification.

## Restraint Rule
Do not build a noisy tracking dashboard on the entry page. Avoid live-map theatrics, invented route animations, invented tracking events, generic package illustrations, countdown pressure, and broad ETA promises.

Every visual element must help one of these:
- Enter the tracking code.
- Explain code format.
- Show lookup progress.
- Recover from a lookup problem.
- Route to receiver verification or tracking detail.
- Explain tracking privacy.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of public carrier tracking, fintech lookup, and support-entry experiences.

Non-negotiable quality requirements:
- The first viewport must have a focused tracking-code input and primary action.
- The input label must be visible, not hint-only.
- The page must validate empty and badly formatted codes before calling the API.
- The page must call only `get_public_tracking` for lookup.
- Loading state must be clear and non-jumpy.
- Invalid format, not found, rate limited, and unavailable states must be distinct.
- The page must never show internal notes, staff names, staff IDs, payment internals, refund reasoning, raw proof files, audit records, provider references, or precise live GPS trails.
- The page must explain receiver phone verification without asking for phone on the entry form.
- The page must not show a full timeline unless routed into the tracking detail screen.
- The page must work on mobile with one-thumb input and CTA use.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, and large text.

Closure rule:
- If a user cannot submit a valid tracking code in under `20 seconds`, the screen remains open.
- If wrong-code recovery feels accusatory or leaks data, the screen remains open.
- If tracking privacy boundaries are invisible, the screen remains open.
- If the page creates full tracking UI that belongs to receiver detail screens, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- FedEx tracking guidance: carrier tracking entry must focus on a tracking identifier, useful status, and clear exception recovery.
- UPS tracking and InfoNotice guidance: users need clear next steps when a code or attempted delivery requires action.
- DHL tracking patterns: shipment lookup experiences should support code entry, state feedback, and simple recovery.
- GOV.UK form/error guidance: the tracking form must use visible labels, field-specific errors, accessible error summaries, and clear validation language.
- W3C WCAG 2.2 quick reference: forms, status messages, errors, focus, and reduced motion must remain accessible.

Reference links:
- https://www.fedex.com/en-us/tracking.html
- https://www.ups.com/track
- https://www.dhl.com/global-en/home/tracking.html
- https://design-system.service.gov.uk/components/error-summary/
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external carrier layouts, wording, tracking statuses, error copy, icons, maps, animations, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- Where do I enter my tracking code?
- What format should the tracking code use?
- What happens after I submit?
- Why might I need phone verification?
- What public tracking can show?
- What public tracking never shows?
- What should I do if the code is wrong?
- What should I do if I am rate limited?
- Where can I get support?

## Route And Navigation Rules
### Route
- Render at `/track`.
- Must be public and unauthenticated.
- Must not require app install.
- Must not require account creation.
- Must not request receiver phone on this page.
- Must not show full tracking timeline on this page unless the app routing architecture intentionally combines entry and detail, in which case the detail state must still respect the receiver tracking specs.

### Optional Route Inputs
The page may support:
- `/track?code=KRA-...`
- `/track#KRA-...`

Rules:
- Query or hash code must be normalized and placed in the input.
- Auto-submit may be allowed only if the code passes client format validation and the product team accepts automatic lookup.
- Auto-submit must not happen repeatedly on every render.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- `Track package` action should be active or visually emphasized for `/track`.

Desktop header links:
- `How it works` -> `/how-it-works`
- `Service areas` -> `/service-areas`
- `Pricing` -> `/pricing`
- `Trust and custody` -> `/trust-and-custody`
- `Support` -> `/support`

Desktop actions:
- Primary: `Track package` -> `/track`
- Secondary: `Start delivery` -> sender entry route when available

Mobile header:
- Shared public mobile header.
- `Track` action visible without opening menu.
- Menu close returns focus to menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Tracking.
- Support.
- Delivery policy.
- Privacy.
- Terms.
- Refund policy.

## Page IA
Render sections in this exact order:

1. `PublicTrackingEntryHeader`
2. `PublicTrackingEntryHero`
3. `PublicTrackingLookupPanel`
4. `PublicTrackingLookupResult`
5. `PublicTrackingPrivacyExplainer`
6. `PublicTrackingHelpCards`
7. `PublicTrackingFaq`
8. `PublicTrackingEntryFooter`

Do not place FAQ above the lookup panel.

## Global Layout
### Desktop
- Max content width: `1120px`.
- Page gutters: `32px` minimum.
- Hero and lookup panel should fit in first viewport where possible.
- Use a focused two-column layout:
  - left: headline, copy, privacy note
  - right: lookup panel
- Section spacing: `72px`.

### Tablet
- Gutters: `28px`.
- Hero and lookup stack cleanly.
- Lookup panel remains visually dominant.

### Mobile
- Gutters: `20px`.
- Input and button stack.
- CTA button full width.
- Error messages sit directly below input.
- Support link remains visible after error.
- No horizontal scroll.

## Visual System Direction
Follow public web design language from previous specs while emphasizing speed, clarity, and trust.

Recommended art direction:
- Background: warm neutral with a subtle route-grid or scan-line texture.
- Primary accent: trust green for successful lookup and verified events.
- Secondary accent: deep blue or charcoal for tracking code, form, and status.
- Amber: verification required or action needed.
- Red: invalid format, not found, or rate limit only when needed.
- Visual motifs: scan code chip, event milestone, receiver-safe shield, station handoff line.

Do not use:
- precise live-map visuals
- moving vehicle animation that implies real-time location
- countdown ETA promises
- invented package events
- decorative carrier-style map noise
- internal operations dashboards

## Copy System
### Voice
- Clear.
- Calm.
- Fast.
- Privacy-aware.
- Practical.

### Forbidden Copy
Do not use:
- `live GPS`
- `real-time map`
- `exact location`
- `guaranteed arrival`
- `always on time`
- `instant update`
- `full delivery file`
- `staff location`
- `payment details`
- `refund decision`
- `proof photo`

### Required Terms
Use these terms consistently:
- `tracking code`
- `package`
- `delivery status`
- `verified milestone`
- `receiver verification`
- `phone verification`
- `public tracking`
- `latest update`
- `next step`
- `support`

### Plain-Language Rule
Use public labels and avoid backend status names as primary copy.

Internal: `awaiting_final_mile_assignment`

Public: `Waiting for doorstep courier`

Internal: `receiverVerificationRequired`

Public: `Phone verification needed for receiver details`

## Tracking Code Rules
### Accepted Format
Tracking code schema:
- `KRA-[A-Z0-9-]+`

Input behavior:
- Trim leading and trailing spaces.
- Convert lowercase letters to uppercase.
- Preserve hyphens.
- Remove internal spaces only if the UI clearly tells the user it normalized spacing.
- Do not accept codes that do not start with `KRA-`.
- Do not accept characters outside uppercase letters, numbers, and hyphens after normalization.

Examples for implementation tests:
- `kra-1234` normalizes to `KRA-1234`.
- ` KRA-1234 ` normalizes to `KRA-1234`.
- `ABC-1234` is invalid.
- `KRA 1234` should either normalize to `KRA-1234` only if deliberate spacing normalization is implemented, or show format guidance.

Public helper copy:
- `Tracking codes start with KRA- and include letters, numbers, or hyphens.`

### Empty State Validation
If input is empty:
- Error summary: `Enter your tracking code.`
- Field error: `Enter the tracking code from your receipt, SMS, or sender message.`

### Invalid Format Validation
If code format is invalid:
- Error summary: `Check the tracking code format.`
- Field error: `Use a tracking code that starts with KRA-.`

Do not call the API for empty or invalid format.

## Backend Lookup Rules
### Endpoint
Use:
- `GET /v1/public/track/:trackingCode`

Operation:
- `get_public_tracking`

Do not use:
- authenticated sender delivery endpoint
- admin endpoint
- payment endpoint
- issue endpoint
- phone verification endpoint before the user reaches the receiver verification flow

### Expected Success Payload Concepts
The lookup may return:
- `deliveryId`
- `trackingCode`
- `status`
- `publicLabel`
- `latestTouchpoint`
- `receiverVerificationRequired`
- `etaLabel`

Public entry page may show:
- `publicLabel`
- `latestTouchpoint.role`
- `latestTouchpoint.stationId` only if station-safe display rules allow station IDs or mapped station names.
- `latestTouchpoint.occurredAt` formatted as user-readable time.
- `etaLabel` if present.
- `receiverVerificationRequired` as a next-step prompt.

Public entry page must not show:
- internal delivery ID
- staff name
- actor ID
- payment status
- refund reason
- proof asset ID
- audit record
- precise GPS
- internal notes

### Success Routing
After successful lookup:
- If `receiverVerificationRequired=true`, show a result card explaining that phone verification may be needed and route to `ReceiverPhoneChallenge` flow.
- If `receiverVerificationRequired=false`, route to `ReceiverTrackingLanding` or `ReceiverTrackingTimeline` according to app routing.

Recommended route pattern:
- `/track/:trackingCode`

If the app does not yet have nested route definitions, this spec still requires a named handoff:
- `onTrackingResolved(trackingCode, publicTrackingResponse)`

Do not keep users on entry page after success unless a compact preview and clear `View tracking` action are shown.

## Component Specifications
### `PublicTrackingEntryHero`
Purpose:
- Explain that users can track without an account and set privacy expectations.

Layout:
- Desktop two-column composition with lookup panel visible in first viewport.
- Mobile: headline, subheadline, lookup panel, helper note.

Required copy:
- Eyebrow: `Track your package`
- Headline: `Enter your Kra tracking code.`
- Subheadline: `See verified delivery progress, latest milestone, and the next safe step without creating an account.`
- Privacy note: `Public tracking shows delivery milestones, not internal notes, payment details, staff IDs, or precise live GPS.`

### `PublicTrackingLookupPanel`
Purpose:
- Collect, normalize, validate, and submit tracking code.

Required fields:
- Label: `Tracking code`
- Helper text: `Starts with KRA-. You can find it on your receipt, SMS, or sender message.`
- Input hint text: `KRA-...`
- Button: `Track package`

Required attributes:
- `data-testid="screen-public-tracking-entry"` on screen root.
- `data-testid="field-public-tracking-code"` on input.
- `data-testid="action-public-track-submit"` on submit.
- `autocomplete="off"` or equivalent if project convention supports it.
- `inputmode="text"`.
- `aria-describedby` connected to helper/error text.

Behavior:
- Submit on button click.
- Submit on Enter while input focused.
- Disable duplicate submit while loading.
- Preserve input value after errors.
- Normalize before validation.
- Do not store tracking code in analytics.

### `PublicTrackingLookupResult`
Purpose:
- Show safe feedback after lookup.

States:
- `idle`
- `loading`
- `success_verification_required`
- `success_tracking_ready`
- `invalid_format`
- `not_found`
- `rate_limited`
- `service_unavailable`
- `unknown_error`

#### Loading
Required copy:
- Title: `Checking tracking code`
- Body: `This usually takes a moment.`

Design:
- Use skeleton or progress indicator.
- Do not show invented status cards.
- Keep layout stable.

#### Success Verification Required
Required copy:
- Title: `Phone verification may be needed`
- Body: `This package has receiver-sensitive next steps. Verify the receiver phone to continue.`
- CTA: `Continue to verification`

Show:
- `publicLabel`
- `latest update` if available
- `etaLabel` if available

Do not ask for phone on this entry page.

#### Success Tracking Ready
Required copy:
- Title: `Tracking found`
- Body: `Continue to see receiver-safe delivery progress.`
- CTA: `View tracking`

Show:
- `publicLabel`
- `latest update` if available
- `etaLabel` if available

#### Invalid Format
Required copy:
- Title: `Check the tracking code format`
- Body: `Tracking codes start with KRA- and include letters, numbers, or hyphens.`
- CTA: `Try again`

No API call should have happened.

#### Not Found
Required copy:
- Title: `Tracking code not found`
- Body: `Check the code from your receipt, SMS, or sender message. If it still does not work, contact support.`
- Primary CTA: `Try again`
- Secondary CTA: `Contact support`

Privacy rule:
- Do not say whether the code belongs to another person or expired delivery unless backend explicitly supports that safe distinction.

#### Rate Limited
Required copy:
- Title: `Too many tracking attempts`
- Body: `Wait a short time before trying again. This protects delivery information from repeated guessing.`
- Secondary CTA: `Contact support`

If backend includes retry timing:
- Show a user-safe retry label.
- Do not show internal rate-limit bucket names.

#### Service Unavailable
Required copy:
- Title: `Tracking is temporarily unavailable`
- Body: `Your code was not checked. Try again shortly or contact support if the package needs urgent help.`
- Primary CTA: `Try again`
- Secondary CTA: `Contact support`

#### Unknown Error
Required copy:
- Title: `We could not check this code`
- Body: `Try again. If the issue continues, contact support with your tracking code.`
- Primary CTA: `Try again`
- Secondary CTA: `Contact support`

### `PublicTrackingPrivacyExplainer`
Purpose:
- Make public tracking boundaries visible without slowing down lookup.

Layout:
- Three compact cards:
  1. `Verified milestones`
  2. `Receiver-safe access`
  3. `No live GPS trail`

Required copy:
- Verified milestones: `Kra tracking is based on confirmed delivery events, not guesses.`
- Receiver-safe access: `Some receiver actions require phone verification tied to the delivery.`
- No live GPS trail: `Public tracking does not show precise staff or courier location.`

### `PublicTrackingHelpCards`
Purpose:
- Route confused users without adding form complexity.

Cards:
1. `Where do I find the code?`
   - Body: `Check your receipt, SMS, sender message, or package update.`
2. `Receiver verification`
   - Body: `If the package needs receiver action, Kra may ask for phone verification on the next screen.`
3. `Something looks wrong`
   - Body: `Support can help with wrong code, missing package, payment, proof, or failed attempt questions.`

CTAs:
- `Contact support` -> `/support`
- `Read delivery policy` -> `/delivery-policy`
- `Read privacy policy` -> `/privacy`

## FAQ Content
### Required Questions
Render these questions in this order:

1. `Where do I find my tracking code?`
2. `Do I need a Kra account to track?`
3. `Why might Kra ask for phone verification?`
4. `Does tracking show live GPS?`
5. `Why does my tracking code not work?`
6. `What if tracking says phone verification is needed?`
7. `Can tracking show refund decisions?`
8. `Can support track it for me?`

### Required Answers
Question: `Where do I find my tracking code?`

Answer: `Check your receipt, SMS, sender message, or package update. Kra tracking codes start with KRA-.`

Question: `Do I need a Kra account to track?`

Answer: `No. Public tracking works without a full account. Some receiver-sensitive actions may require phone verification tied to the delivery.`

Question: `Why might Kra ask for phone verification?`

Answer: `Phone verification protects receiver-specific next steps, such as pickup or doorstep instructions, from being shown to the wrong person.`

Question: `Does tracking show live GPS?`

Answer: `No. Kra public tracking is event-first. It shows verified milestones and safe next steps, not precise live GPS trails.`

Question: `Why does my tracking code not work?`

Answer: `The code may be typed incorrectly, not created yet, or unavailable temporarily. Check the KRA- format and try again, or contact support.`

Question: `What if tracking says phone verification is needed?`

Answer: `Continue to verification. Kra will send or check a receiver phone challenge before showing receiver-sensitive next steps.`

Question: `Can tracking show refund decisions?`

Answer: `No. Public tracking does not show payment internals or refund reasoning. Use support or refund policy for refund questions.`

Question: `Can support track it for me?`

Answer: `Support can help if your code does not work or the package needs review. Keep your tracking code ready when contacting support.`

## State Requirements
### Normal
Must render:
- Header.
- Hero.
- Lookup panel.
- Privacy explainer.
- Help cards.
- FAQ.
- Footer.

### Loading
Must render:
- Existing input value.
- Disabled submit button.
- Loading status with `aria-live="polite"`.
- No invented result data.
- No layout jump.

### Invalid Code
Must render:
- Error summary.
- Field-level error.
- Input with preserved value.
- Focus should move to error summary or field according to project form convention.
- No API call.

### Not Found
Must render:
- Not found result card.
- Try again action.
- Support action.
- Privacy-safe copy.

### Rate Limited
Must render:
- Rate limit result card.
- Retry guidance.
- Support action.
- No internal retry bucket or backend implementation detail.

### Service Unavailable
Must render:
- Temporary unavailable result card.
- Retry action.
- Support action.

## Interaction Requirements
### Input Normalization
On input submit:
1. Trim leading/trailing spaces.
2. Uppercase letters.
3. Validate against `KRA-[A-Z0-9-]+`.
4. If valid, call lookup.
5. If invalid, show field error and do not call lookup.

### Handoff Behavior
After successful lookup:
- `Continue to verification` moves to `ReceiverPhoneChallenge`.
- `View tracking` moves to `ReceiverTrackingLanding` or `ReceiverTrackingTimeline`.
- Handoff must pass normalized tracking code.
- Do not pass public tracking response through URL query string.

### Back/Retry Behavior
- Browser back from verification/detail should return to `/track` with input preserved only if safe local state exists.
- Retry should keep normalized code in input.
- Clear input action may be provided but is not required.

### Motion
Allowed:
- Hero/lookup panel reveal.
- Loading shimmer.
- Result card fade/slide.

Rules:
- Motion must use transform and opacity.
- Duration: `160ms` to `360ms`.
- Respect `prefers-reduced-motion`.
- Do not animate invented package movement.

## Accessibility Requirements
### Structure
- Use one `h1`.
- Visible label for tracking input.
- Error summary for validation and server errors.
- Status updates use `aria-live`.
- Result card receives programmatic focus after lookup outcome if it helps screen-reader flow.

### Keyboard
- Input, submit, retry, support, FAQ, and footer links must be keyboard accessible.
- Enter submits form.
- Escape must not clear the form unexpectedly.
- Focus state must be visible.

### Screen Reader
- Loading state must announce.
- Validation errors must be associated with input.
- Result state must announce the outcome.
- Privacy explainer cards must use real headings.

### Contrast
- Body text and helper text meet WCAG AA.
- Error text must not rely on red alone.
- Focus ring must remain visible on high-contrast backgrounds.

### Large Text
- Page must survive `200%` browser zoom.
- Input and CTA must not overlap.
- Error copy must wrap cleanly.

### Reduced Motion
- Disable shimmer and reveal motion.
- Show static loading indicator.

## Responsive Requirements
### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px` to `1023px`
- Desktop: `1024px+`

### Mobile Rules
- Lookup panel appears immediately after headline.
- Input font size at least `16px`.
- Submit button full width.
- Help cards stack.
- FAQ stack.
- Result card should appear directly under form.

### Desktop Rules
- Lookup panel visible in first viewport.
- Privacy explainer below lookup or in adjacent column.
- Help cards may use three columns.
- FAQ max width remains readable.

## Data And Content Rules
### Static Content
The page can define:
- hero copy
- helper text
- privacy explainer cards
- help cards
- FAQ
- error copy

### Dynamic Data
The page may display only safe fields from public tracking lookup:
- `trackingCode`
- `publicLabel`
- `latestTouchpoint.role`
- station-safe touchpoint label
- `latestTouchpoint.occurredAt`
- `etaLabel`
- `receiverVerificationRequired`

### Forbidden Dynamic Data
Never render:
- internal delivery ID
- actor ID
- staff name
- staff phone
- receiver phone
- sender phone
- address
- payment status
- provider reference
- refund reason
- proof asset ID
- proof image
- signature image
- audit event
- internal notes
- precise GPS

## Analytics Requirements
Track only privacy-safe public events:
- `public_tracking_entry_viewed`
- `public_tracking_code_submitted`
- `public_tracking_lookup_succeeded`
- `public_tracking_lookup_failed`
- `public_tracking_verification_handoff_clicked`
- `public_tracking_detail_handoff_clicked`
- `public_tracking_support_clicked`
- `public_tracking_faq_opened`

Event properties:
- `screen_id`
- `route`
- `result_type`
- `error_type`
- `cta_id`
- `faq_question_id`

Do not track:
- tracking code
- delivery ID
- phone number
- station ID if it can identify sensitive route context beyond public response
- receiver name
- sender name
- address
- payment data
- proof data

## SEO Requirements
### Metadata
Title:
- `Track Package | Kra`

Description:
- `Enter your Kra tracking code to see receiver-safe delivery progress, latest verified milestone, and next step without creating an account.`

Canonical:
- `/track`

### Open Graph
Title:
- `Track a Kra Package`

Description:
- `Use a Kra tracking code to check package status, latest milestone, and safe next step.`

### Structured Content
- Do not add shipment structured data unless it is backed by safe public data and product/legal approval.
- FAQ structured data may be added only if answers exactly match visible FAQ copy.

## Performance Requirements
- Page must be interactive fast on mobile.
- No third-party carrier widget.
- No map SDK.
- No heavy animation library.
- Lookup panel should render without waiting for JavaScript data fetch.
- Network lookup should have timeout handling.

Targets:
- Largest Contentful Paint target: under `2.5s` on mid-tier mobile.
- Interaction to Next Paint target: under `200ms` for input and submit.
- Cumulative Layout Shift target: under `0.1`.

## Security And Privacy Requirements
- Do not expose whether a code belongs to a specific person.
- Do not request receiver phone until the verification screen.
- Do not log tracking code in analytics.
- Do not store tracking code in long-lived local storage.
- Do not include tracking code in third-party analytics events.
- Do not include public tracking response in query string.
- Do not show internal backend error payload.

## Error Prevention Rules
The UI must prevent these misunderstandings:
- User thinks tracking shows precise live GPS.
- User thinks tracking shows payment/refund details.
- User thinks phone verification is account signup.
- User thinks not found means the package is lost.
- User thinks rate limiting is a delivery issue.
- User thinks loading card is live tracking data.

Recommended copy qualifiers:
- `verified milestone`
- `latest update`
- `may require verification`
- `receiver-safe`
- `try again`
- `temporarily unavailable`

Avoid:
- `live`
- `exact`
- `guaranteed`
- `instant`
- `full file`
- `internal`

## Testing Requirements
### Unit/Component Tests
Create tests that verify:
- Page renders `screen-public-tracking-entry`.
- Input has visible label `Tracking code`.
- Empty submit shows `Enter your tracking code`.
- Invalid format does not call API.
- Lowercase code normalizes to uppercase.
- Submit calls `get_public_tracking` for valid code.
- Loading state disables submit.
- Success with `receiverVerificationRequired=true` shows `Continue to verification`.
- Success with `receiverVerificationRequired=false` shows `View tracking`.
- Not found state shows support route.
- Rate limited state shows retry guidance and support route.
- Service unavailable state shows retry guidance.
- Privacy explainer says no precise live GPS.
- Page does not render payment, refund, proof, audit, or staff data.

### Accessibility Tests
Run automated checks for:
- Visible input label.
- Error summary is linked to input.
- `aria-live` loading/result messages.
- No keyboard traps.
- No low-contrast text.
- No unlabeled buttons.

Manual keyboard checklist:
- Tab to input.
- Submit with Enter.
- Submit with button.
- Reach error summary.
- Retry after error.
- Reach support link.
- Reach FAQ accordions.

### Visual Regression Tests
Capture:
- Desktop normal.
- Desktop loading.
- Desktop invalid format.
- Desktop success verification required.
- Desktop not found.
- Mobile normal.
- Mobile loading.
- Mobile error.
- Reduced motion.
- High contrast mode where supported.

### Content Regression Tests
Assert the page does not include:
- `live GPS`
- `real-time map`
- `exact location`
- `guaranteed arrival`
- `always on time`
- `instant update`
- `payment details`
- `refund decision`
- `proof photo`

### Policy Alignment Tests
Assert:
- Tracking code format uses `KRA-`.
- Page says no account is required for public tracking.
- Page says phone verification may be required for receiver-sensitive next steps.
- Page says public tracking is event-first.
- Page says public tracking does not show precise live GPS trails.
- Page does not request receiver phone on entry page.
- Page uses `get_public_tracking` and no authenticated endpoint.

## Implementation Notes For Claude Code
### File Placement
Expected route implementation:
- `apps/web/src/routes/track` or the app's equivalent routing convention.

Expected shared components:
- Reuse public header/footer from prior public specs.
- Reuse accessible form primitives.
- Reuse public CTA/button primitives.
- Reuse policy/help card primitives only if accessible.

### Do Not Build
Do not build:
- full receiver tracking timeline on this page
- phone challenge form on this page
- OTP verification on this page
- live map
- payment detail
- refund detail
- support form
- admin tracking console

Those are separate screens in the inventory.

### Build With Real Backend Contract
Use the actual public tracking contract and safe fields. Do not insert invented tracking events, invented codes, invented station updates, invented timeline rows, or invented ETA data.

### Copy Constants
Recommended content constants:
- `TRACKING_ENTRY_HELP_CARDS`
- `TRACKING_ENTRY_PRIVACY_CARDS`
- `TRACKING_ENTRY_FAQ`
- `TRACKING_ENTRY_ERROR_COPY`
- `TRACKING_ENTRY_RESULT_COPY`

Keep constants close to the route unless the team already has a content module convention.

## Design Quality Review
Before closing implementation, review the screen from five perspectives:

Founder:
- Does this make Kra feel as serious as a major carrier but clearer about privacy?

Anxious receiver:
- Can I enter a code quickly and understand why phone verification may happen?

Sender:
- Can I check status without being pushed into account creation?

Support operator:
- Do error states reduce vague support contacts and preserve privacy?

Accessibility reviewer:
- Can I complete lookup and recover from errors without mouse, color, animation, or perfect vision?

If any answer is weak, revise before shipping.

## Content QA Checklist
- Lookup input is visible in first viewport.
- Label is visible.
- Helper text explains `KRA-`.
- Empty error is field-specific.
- Invalid format error is field-specific.
- Not found error is privacy-safe.
- Rate limit copy explains protection from guessing.
- Privacy explainer is visible before FAQ.
- No live GPS promise.
- No payment/refund/proof detail.
- Success handoff routes are clear.

## Source Alignment
This spec is grounded in:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/tracking-spec.md`
- `docs/07-api/api-contracts.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/public-tracking.ts`
- `services/api/src/public-tracking-verification.ts`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/05-design/copy-deck.md`

The screen must not contradict those sources.

## Spec Quality Review
### Completeness
Pass. The spec covers screen contract, route behavior, page IA, visual system, copy system, code validation, backend lookup, result states, privacy boundaries, help content, FAQ, accessibility, SEO, performance, analytics, testing, and implementation boundaries.

### Policy Accuracy
Pass. The spec uses the public tracking contract, tracking code format, event-first tracking rule, receiver verification requirement, ETA labels, and public privacy limits.

### Backend Boundary
Pass. The spec uses only `get_public_tracking` for entry lookup and does not create phone challenge, OTP verification, full timeline, payment, refund, support, or admin behavior on this page.

### UX Quality
Pass. The spec prioritizes one focused input, fast validation, clear result states, support recovery, and privacy-safe handoff to the correct receiver tracking flow.

### Copy Quality
Pass. The spec uses short, direct, recovery-oriented tracking copy and rejects live-map, guarantee, payment, refund, and proof overclaims.

### Accessibility
Pass. The spec requires visible labels, field errors, error summary, `aria-live` status updates, keyboard access, contrast, reduced motion, and large-text resilience.

### Implementation Readiness
Pass. Claude Code can build this screen from the named components, content constants, interaction rules, and test requirements without needing hidden product decisions.

### Close Decision
Closed for implementation. This file is full enough for Claude Code to build `PublicTrackingEntry` end to end as a public, privacy-safe, backend-aligned tracking entry page without creating frontend UI in this docs pass.

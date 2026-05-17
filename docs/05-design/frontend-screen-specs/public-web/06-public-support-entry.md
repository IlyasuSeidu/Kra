# Public Support Entry Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicSupportEntry` |
| App | `apps/web` |
| Route | `/support` |
| Primary test ID | `screen-public-support` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `create_issue` when authenticated/support-capable path exists; otherwise public support contact |
| Related routes | `/`, `/track`, `/how-it-works`, `/service-areas`, `/pricing`, `/trust-and-custody`, `/delivery-policy`, `/refund-policy` |
| Required states | `loading`, `submitted`, `error`, `normal` |

## Product Job
This page must help a sender, receiver, or public visitor reach the right support path without installing an app. It must reduce panic, collect the right context, avoid unsafe promises, and route the user to tracking, policy, or issue creation depending on what they need.

The page must support:
- Delivery tracking help.
- Payment and refund questions.
- Delay reports.
- Loss or missing package reports.
- Damage reports.
- Receiver refusal or failed doorstep delivery questions.
- Handoff, scan, OTP, or proof concerns.
- General support contact.

The page must not promise instant refunds, automatic compensation, guaranteed delivery times, or support outcomes before review.

## Audience
Primary audience:
- Senders and receivers who need help with an active or recently completed delivery.

Secondary audience:
- Visitors checking policy before sending.
- Business senders needing support guidance.
- Unauthenticated users who may only have a tracking code, phone number, or public delivery link.

## User State
Users may be worried, frustrated, or blocked. Some will have a tracking code. Some will not. Some will expect an immediate refund or compensation. The page must stay calm, ask for only necessary information, and explain what happens next.

## Primary Action
Primary CTA: `Start support request`

Secondary CTA: `Track a package`

Tertiary CTA: `Read refund policy`

CTA behavior:
- `Start support request` anchors to the support triage form.
- `Track a package` routes to `/track`.
- `Read refund policy` routes to `/refund-policy`.

## Main Tension
Support must feel accessible without weakening operational discipline. Kra should help users start the right path, but the frontend must not create backend issues without the required authenticated route or approved public issue endpoint.

## Visual Thesis
Design this page as a calm support command desk: clear intake, visible next steps, policy-backed expectations, and no panic styling. It should feel closer to a premium fintech support flow than a generic contact form.

## Restraint Rule
Do not build a noisy help center homepage. Avoid chat bubbles that do nothing, fake live-agent availability, generic smiling-agent stock photos, endless FAQ grids, or refund-promising banners.

Every visual element must help one of these:
- Identify the support reason.
- Collect safe context.
- Route to tracking or policy.
- Explain response expectations.
- Submit or prepare a support request.
- Recover from loading, submitted, or error state.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of support, fintech, marketplace, and logistics help surfaces.

Non-negotiable quality requirements:
- The first viewport must show the page purpose, urgent next action, and tracking path.
- The support intake must be easy to complete on mobile.
- The page must distinguish tracking help, issue creation, payment/refund, damage/loss, and general questions.
- The page must use progressive disclosure so users are not confronted with a long generic form immediately.
- The page must show what happens after submission.
- The page must define loading, submitted, and error states.
- The page must not expose internal issue IDs, staff IDs, audit records, payment provider references, or raw backend error details.
- The page must not promise automatic refunds or compensation.
- The page must remain accessible with keyboard, screen reader, high contrast, and reduced motion needs.
- Form errors must name the field and recovery action.

Closure rule:
- If a user with a tracking code cannot find the right support path in under one minute, the screen remains open.
- If a user can submit a vague issue without enough context to help support, the screen remains open.
- If unauthenticated and authenticated paths are blurred, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- GOV.UK form and error-message guidance: forms must use clear labels, field-specific errors, and accessible error summaries.
- Zendesk ticket form guidance: support forms should collect structured context so end users and agents have a better experience.
- Intercom help center/contact patterns: support entry should guide users to self-serve help or contact paths without burying the request path.
- Freshdesk customer portal concepts: ticket request flows should make status and follow-up expectations clear.
- W3C WCAG 2.2 quick reference: support forms, validation, focus, and status messages must remain accessible.

Reference links:
- https://design-system.service.gov.uk/components/error-message/
- https://support.zendesk.com/hc/en-us/articles/4408882701338-Designing-your-ticket-forms-for-a-better-agent-and-end-user-experience
- https://www.intercom.com/help/en/
- https://support.freshdesk.com/support/solutions/articles/50000000313-creating-ticket-forms
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external layouts, wording, help-center structures, ticket-form labels, illustrations, or brand assets.

## Required Page Outcomes
A successful user must be able to answer:
- Should I track first or start a support request?
- What support category matches my issue?
- What information do I need before reporting?
- Can I create a backend issue from this state?
- What happens after submission?
- What if submission fails?
- What refund/dispute expectations apply?
- Where can I read policy instead of filing a request?

## Route And Navigation Rules
### Route
- Render at `/support`.
- Must be public and unauthenticated.
- Must not require app install.
- May submit to `POST /v1/issues` only when the user is authenticated and has issue creation access.
- If no authenticated/support-capable issue path exists for the visitor, the page must guide to tracking, policy, or configured public support contact.
- Must not invent a public issue API.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- `Support` must be active for `/support`.

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
- Kra wordmark, `Track` action, and menu button.
- Full-height menu sheet with the same links as desktop.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Public routes.
- Policy links.
- Support route.
- Tracking route.

## Page IA
Render sections in this exact order:

1. `PublicSupportHeader`
2. `PublicSupportHero`
3. `PublicSupportQuickPaths`
4. `PublicSupportTriageForm`
5. `PublicSupportRequestDetails`
6. `PublicSupportSubmissionPanel`
7. `PublicSupportPolicyExpectations`
8. `PublicSupportUrgencyGuide`
9. `PublicSupportFaq`
10. `PublicSupportFinalCta`
11. `PublicSupportFooter`

Do not put a giant FAQ before the triage path. Support users need a route first, then explanations.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `560px`.
- Section spacing: `80px`.
- Triage form should be prominent and no wider than needed for easy completion.
- Policy expectation cards can sit beside or below the form depending on viewport.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Triage and policy content stack cleanly.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Quick paths become large tap cards.
- Form fields stack.
- Summary/review panel appears before submission.
- Status messages stay close to the form.

## Visual System Direction
Follow the public web design language from previous specs, with a calm service-desk tone.

Recommended art direction:
- Background: warm neutral with subtle ticket/thread texture.
- Primary accent: operational green for submitted/confirmed next step.
- Secondary accent: amber for review, missing information, or pending response.
- Severe accent: restrained red only for true submission failure or urgent caution.
- Visual motifs: support desk, request thread, evidence checklist, route-to-help cards.

Do not use:
- Fake live chat.
- Fake agent avatars.
- Stock support headset photos.
- Red panic backgrounds.
- Generic "we are here for you" hero without a concrete action.

## Copy System
### Voice
- Calm.
- Direct.
- Accountable.
- Practical.
- Evidence-led.

### Forbidden Copy
Do not use:
- `instant refund`
- `guaranteed compensation`
- `we will fix it immediately`
- `always covered`
- `no questions asked`
- `live agent now` unless live agent staffing exists
- `claim approved`
- `insurance guaranteed`
- `urgent` for all cases

### Required Terms
Use these terms consistently:
- `support request`
- `tracking code`
- `delivery ID`
- `issue category`
- `refund review`
- `dispute review`
- `handoff evidence`
- `proof`
- `next step`

### Plain-Language Rule
Use public language and avoid internal labels unless the label is useful to the user.

Internal: `category=handoff`

Public: `Package handoff, scan, or proof issue`

## Support Paths
### Quick Path Cards
Render four cards above the form:

Card 1:
- Title: `Track a package`
- Body: `Use this first if you only need the latest delivery status or receiver instructions.`
- Action: `Open tracking`
- Route: `/track`

Card 2:
- Title: `Report a delivery issue`
- Body: `Use this for delay, damage, missing package, failed attempt, refusal, or handoff concerns.`
- Action: `Start request`
- Anchor: `#support-request`

Card 3:
- Title: `Ask about payment or refund`
- Body: `Use this for duplicate charges, refund status, payment failure, or policy questions.`
- Action: `Start request`
- Anchor: `#support-request`

Card 4:
- Title: `Read policy first`
- Body: `Check delivery, refund, and trust rules before opening a request.`
- Action: `View policies`
- Route: `/refund-policy`

### Support Category Mapping
Public categories should map to backend issue categories only when issue creation is available.

| Public reason | Backend category | Default severity | Notes |
| --- | --- | --- | --- |
| `Delivery is delayed` | `delay` | `p3` | Escalate only if SLA/policy threshold is met by support logic |
| `Package is damaged` | `damage` | `p2` | Requires description and evidence guidance |
| `Package may be missing` | `loss` | `p2` | Support review should inspect handoff timeline |
| `Payment or refund issue` | `payment` | `p3` | Duplicate charge can be upgraded after verification |
| `Handoff, scan, OTP, or proof issue` | `handoff` | `p2` | Use for custody/proof mismatch |
| `Receiver refused package` | `other` | `p3` | Public label is clearer than backend category |
| `Something else` | `other` | `p3` | Requires summary and description |

Do not let public users self-label a case as `p1`. P1 escalation is an internal support/admin decision.

## Section Specs
### 1. `PublicSupportHeader`
Purpose:
- Keep support route easy to reach.

Required:
- Shared public header.
- Active nav item: `Support`.
- Primary header CTA: `Track package`.

Acceptance:
- Active state appears.
- Header does not add fake chat controls.

### 2. `PublicSupportHero`
Purpose:
- Calmly orient the user and offer immediate paths.

Hero content:
- Eyebrow: `Support`
- H1: `Get the right help for your delivery.`
- Subheadline: `Track a package, report a delivery issue, or prepare a support request with the details Kra needs to review it properly.`
- Primary CTA: `Start support request`
- Secondary CTA: `Track a package`
- Trust line: `Evidence first. Clear next steps. No refund promises before review.`

Hero visual:
- Use a `SupportRequestThreadPreview`.
- Show public-safe steps:
  - `Choose issue`
  - `Add delivery context`
  - `Review policy`
  - `Submit or contact support`
- Do not show real issue IDs or fake support conversations.

### 3. `PublicSupportQuickPaths`
Purpose:
- Help the user choose tracking, request, payment/refund, or policy.

Requirements:
- Render four quick path cards from `Support Paths`.
- Cards must have clear actions.
- Cards must not use vague labels like `Learn more` unless the destination is policy content.

Acceptance:
- Tracking path is visible before form.
- Report issue path anchors to form.

### 4. `PublicSupportTriageForm`
Purpose:
- Collect the minimum context needed to decide the next support path.

Section heading:
- Eyebrow: `Start a request`
- H2: `Tell Kra what you need help with.`
- Intro: `Use the details you have. If you have a tracking code, start there so support can connect the request to the right delivery.`

Fields:
- `field-support-reason`
- `field-tracking-code`
- `field-delivery-id`
- `field-contact-name`
- `field-contact-phone-or-email`
- `field-summary`
- `field-description`
- `field-consent-followup`

Field rules:
- `supportReason` is required.
- Either `trackingCode`, `deliveryId`, or contact detail is required for public fallback.
- `summary` is required, `5` to `160` characters.
- `description` is optional initially, but required for damage, loss, handoff/proof, or payment/refund requests; `5` to `500` characters when present.
- `consentFollowup` is required before collecting contact details for public support contact.

Authenticated issue creation request:
```json
{
  "deliveryId": "DEL-0001",
  "category": "damage",
  "severity": "p2",
  "summary": "Package arrived damaged",
  "description": "The box was wet at pickup and the item inside was cracked."
}
```

Rules:
- Use `POST /v1/issues` only when authenticated and authorized.
- Public unauthenticated users should not be told an issue was created unless the backend confirms it.
- If unauthenticated, show the prepared support summary and route to configured public contact or tracking verification path.

### 5. `PublicSupportRequestDetails`
Purpose:
- Show tailored guidance after the user selects a support reason.

Reason-specific guidance:

Delivery delay:
- Ask for tracking code or delivery ID.
- Link to `/track`.
- Explain that delay support reviews delivery timeline and current state.

Damage:
- Ask for delivery ID/tracking code, pickup/delivery context, and short damage description.
- Explain that damage claims require manual review.
- Do not promise compensation.

Missing package or loss:
- Ask for tracking code/delivery ID and last known update.
- Explain that support reviews handoff evidence and proof records.

Payment or refund:
- Ask for delivery ID, payment context, and refund reason.
- Explain that duplicate charge and platform-side payment errors can qualify for full refund if verified.
- Link to `/refund-policy`.

Handoff, scan, OTP, or proof:
- Ask what failed: scan mismatch, OTP issue, signature/photo proof issue, or wrong handoff.
- Explain that proof issues are reviewed against the delivery timeline.

Receiver refusal:
- Explain that refusal creates review, not automatic cancellation.
- Link to policy.

Something else:
- Ask for a short summary and best contact path.

Design:
- Use an adaptive guidance panel, not a long static wall.
- The panel must be readable without JavaScript by rendering all reason guidance in accessible markup or progressive enhancement.

### 6. `PublicSupportSubmissionPanel`
Purpose:
- Review details and submit or route appropriately.

Authenticated state:
- Button label: `Submit support request`
- Loading label: `Submitting request...`
- Submitted title: `Support request submitted.`
- Submitted body: `Kra has opened your support request and will review the delivery details. Save your issue reference if one is shown.`

Unauthenticated fallback state:
- Button label: `Prepare support request`
- Submitted title: `Support request prepared.`
- Submitted body: `Use the prepared details with Kra support, or track the package first if you have a tracking code.`
- Primary action: `Track package`
- Secondary action: `Contact support`

Error state:
- Title: `Support request could not be submitted.`
- Body: `Check the required fields and try again. If the problem continues, contact support before sending another package.`
- Do not expose raw backend errors.
- Safe customer messages may use `VALIDATION_ERROR`, `AUTH_REQUIRED`, `DELIVERY_NOT_FOUND`, `UNKNOWN_INTERNAL_ERROR`, or rate-limit copy if returned by implementation.

Submission rules:
- Disable duplicate submit while loading.
- Preserve user input after error.
- Do not submit if required fields are invalid.
- Do not claim backend issue creation on fallback-only path.

### 7. `PublicSupportPolicyExpectations`
Purpose:
- Set honest expectations before submission.

Section heading:
- Eyebrow: `What to expect`
- H2: `Support decisions depend on delivery evidence.`
- Intro: `Kra reviews tracking history, payment status, handoff evidence, proof records, and support notes before deciding outcomes.`

Cards:

Card 1:
- Title: `Acknowledgement target`
- Body: `Internal acknowledgement target is 48 hours for standard disputes.`

Card 2:
- Title: `Standard review`
- Body: `Standard disputes with complete evidence should be resolved within 5 business days.`

Card 3:
- Title: `Complex review`
- Body: `Complex loss, damage, or provider-settlement disputes may extend to 10 business days with admin approval and a case note.`

Card 4:
- Title: `No automatic outcome`
- Body: `Refund and compensation outcomes depend on policy review and evidence.`

Required link:
- `Read refund policy` -> `/refund-policy`

### 8. `PublicSupportUrgencyGuide`
Purpose:
- Help users understand what is urgent without letting public users self-escalate everything.

Section heading:
- Eyebrow: `Urgency`
- H2: `Some issues need faster review.`
- Intro: `Kra uses severity internally so support can focus on operational risk. Public users should describe impact clearly instead of guessing severity.`

Urgency examples:
- `Package may be missing`
- `Package appears damaged`
- `Payment was duplicated`
- `Receiver refused package`
- `OTP or proof cannot be completed`
- `Wrong package or scan mismatch`

Rules:
- Public UI must not expose `p1`, `p2`, `p3` as selectable labels.
- Backend issue severity can be mapped internally from reason and impact.
- Support/admin can escalate.

### 9. `PublicSupportFaq`
Purpose:
- Resolve common support questions without burying the form.

Behavior:
- Accessible accordion.
- Literal question headings.

Required FAQ items:

FAQ 1:
- Question: `Should I track first or open a support request?`
- Answer: `Track first if you only need the latest status. Open a support request when the status does not answer your issue or you need review.`

FAQ 2:
- Question: `Can I report an issue without signing in?`
- Answer: `You can prepare a support request and use the public contact path. Backend issue creation is available only through an authenticated or approved support-capable path.`

FAQ 3:
- Question: `What details should I include?`
- Answer: `Include tracking code or delivery ID when available, the issue reason, a short summary, and any useful delivery context.`

FAQ 4:
- Question: `Can support approve my refund immediately?`
- Answer: `No. Refunds depend on timing, payment records, delivery timeline, handoff evidence, proof, and policy review.`

FAQ 5:
- Question: `What if my package is damaged?`
- Answer: `Report the issue with the delivery reference and a clear description. Damage claims require manual review.`

FAQ 6:
- Question: `What if the receiver refused the package?`
- Answer: `Receiver refusal creates review. Station support decides whether the package enters pickup flow, return-to-sender flow, or dispute outcome.`

FAQ 7:
- Question: `What if OTP or proof failed?`
- Answer: `Report the proof issue. Kra reviews the delivery timeline, proof requirements, and available handoff evidence.`

FAQ 8:
- Question: `Will I get an issue reference?`
- Answer: `If a backend issue is created, show the confirmed issue reference. If the page only prepares a public contact request, do not show a fake issue reference.`

Required links below FAQ:
- `Track a package` -> `/track`
- `Read refund policy` -> `/refund-policy`
- `Read delivery policy` -> `/delivery-policy`

### 10. `PublicSupportFinalCta`
Purpose:
- Close with tracking or support path.

Copy:
- Eyebrow: `Need help now?`
- H2: `Start with the details support can verify.`
- Body: `Use your tracking code or delivery ID where possible, choose the issue reason, and Kra will route the request through the right review path.`
- Primary CTA: `Start support request`
- Secondary CTA: `Track a package`
- Tertiary text link: `Read refund policy`

Behavior:
- Primary anchors to `#support-request`.
- Secondary routes to `/track`.
- Tertiary routes to `/refund-policy`.

### 11. `PublicSupportFooter`
Purpose:
- Provide stable public navigation and policy routes.

Required:
- Shared public footer.
- Tracking, support, refund policy, delivery policy, privacy, and terms routes visible when available.

## Component Inventory
Claude Code should create or reuse components with these responsibilities:

### `PublicSupportEntryPage`
- Owns page composition.
- Sets metadata.
- Renders `data-testid="screen-public-support"`.
- Supports `normal`, `loading`, `submitted`, and `error` states.
- Does not invent unauthenticated backend issue creation.

### `SupportQuickPathCards`
- Renders tracking, report issue, payment/refund, and policy paths.

### `SupportTriageForm`
- Captures reason, tracking code, delivery ID, contact details, summary, description, and consent.
- Uses visible labels.
- Emits accessible validation errors.

### `SupportReasonGuidance`
- Renders reason-specific guidance.
- Helps user understand needed evidence.

### `SupportSubmissionPanel`
- Handles authenticated submit or public fallback prepare flow.
- Shows loading, submitted, and error states.

### `SupportPolicyExpectations`
- Renders response and review expectations.

### `SupportUrgencyGuide`
- Explains impact without exposing public severity controls.

### `PublicFaqAccordion`
- Shared accessible FAQ accordion.

### `PublicFinalCta`
- Shared final CTA pattern.

## Data And Content Source
Allowed local sources:
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/handoff-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/copy-deck.md`

Authenticated issue endpoint:
- `POST /v1/issues`

Request fields:
- `deliveryId`
- `category`
- `severity`
- `summary`
- `description`

Do not collect or submit:
- Payment provider references.
- Card or mobile-money credentials.
- Staff names.
- Internal audit data.
- Proof asset IDs.
- Sensitive identity documents.

## State Handling
### `normal`
Use when the page is ready for triage.

Required:
- Hero.
- Quick paths.
- Triage form.
- Policy expectations.
- FAQ.

### `loading`
Use while authenticated issue creation is submitting.

Loading copy:
- `Submitting request...`

Rules:
- Disable submit button.
- Keep form values visible.
- Do not navigate away.

### `submitted`
Use when support request is created or prepared.

Authenticated submitted:
- Show confirmed issue reference only if backend returns one.
- Copy: `Support request submitted.`

Fallback submitted:
- Do not show fake issue reference.
- Copy: `Support request prepared.`

Rules:
- Show next actions.
- Explain expected review path.

### `error`
Use when validation or submission fails.

Error copy:
- Title: `Support request could not be submitted.`
- Body: `Check the required fields and try again. If the problem continues, use tracking or contact support.`

Field errors:
- `Choose what you need help with.`
- `Add a tracking code, delivery ID, or contact detail so support can follow up.`
- `Write a short summary between 5 and 160 characters.`
- `Add a description for this issue type.`
- `Confirm Kra may use these details to follow up.`

Rules:
- Preserve user input.
- Move focus to error summary.
- Do not expose raw backend errors.

## Interaction Rules
### Triage
- Selecting a support reason updates guidance.
- Guidance update should be announced politely.
- If JavaScript fails, all fields and static guidance remain visible.

### Contact Detail
- Use one contact field if the actual contact method model is not finalized.
- Label it clearly: `Phone or email for follow-up`.
- Do not validate phone as E.164 if email is also allowed in same field.

### Authenticated Issue Creation
- If auth state is available and user can create issue:
  - submit to `POST /v1/issues`
  - map public reason to backend category
  - map severity internally
  - show backend-confirmed issue reference
- If not:
  - prepare request summary
  - route to public contact path
  - do not claim issue creation

### Motion
Allowed:
- Subtle reason-guidance transition.
- Submitted state confirmation.
- CTA hover/focus transitions.

Rules:
- Respect `prefers-reduced-motion`.
- No loading spinners without text.
- No fake "agent typing" animation.

## Accessibility Requirements
Baseline:
- One `h1`.
- Semantic `main`, header, footer.
- Logical heading order.
- All form controls have visible labels.
- Required fields are marked in text.
- Error summary appears before form on validation failure.
- Field errors are programmatically associated with fields.
- Keyboard can complete and submit the form.
- Focus moves to submitted or error state after submit.
- Color contrast meets WCAG AA.
- Text remains readable at 200% zoom.
- No horizontal scroll at `320px`.

Form:
- Use native inputs/selects where possible.
- Do not rely on placeholder text as labels.
- Do not hide consent copy.
- `aria-live="polite"` for reason guidance and submission status.

## Performance Requirements
- No chat widget script unless a real support provider is approved.
- No third-party help-center embed.
- No autoplay media.
- No heavy form library solely for this page.
- Static support content must render immediately.
- Submission logic should be lazy enough not to block first render.

Performance acceptance:
- Page is usable without third-party scripts.
- Form remains responsive on low-end mobile.
- No dependency is added solely for fake live support.

## SEO And Metadata
Page title:
- `Support | Kra`

Meta description:
- `Get help with Kra tracking, delivery issues, payment and refund questions, package damage, missing packages, handoff proof, and receiver delivery problems.`

Open Graph:
- Title: `Kra support`
- Description: `Track a package, prepare a support request, or review delivery and refund policy.`
- Image: approved public brand/social image only.

Structured content:
- Use semantic headings.
- FAQ schema may be used only if existing public SEO tooling supports it.

## Analytics Contract
Use analytics only if the public analytics layer already exists.

Events:

### `public_support_viewed`
Payload:
- `route`: `/support`
- `screen_id`: `PublicSupportEntry`

### `public_support_reason_selected`
Payload:
- `reason_key`

### `public_support_submit_attempted`
Payload:
- `path`: `authenticated_issue` | `public_fallback`
- `reason_key`

### `public_support_submitted`
Payload:
- `path`: `authenticated_issue` | `public_fallback`
- `reason_key`

### `public_support_error_shown`
Payload:
- `error_type`: `validation` | `auth_required` | `not_found` | `server` | `unknown`

Privacy:
- Never send summary, description, phone, email, tracking code, delivery ID, payment reference, or issue content in analytics.

## Testing Contract
### Unit And Component Tests
Required tests:
- Renders `screen-public-support`.
- Renders hero H1 exactly.
- Renders quick path cards.
- Renders required support reason options.
- Selecting each reason renders guidance.
- Validation requires support reason.
- Validation requires tracking code, delivery ID, or contact detail.
- Validation requires summary length.
- Damage/loss/handoff/payment reasons require description.
- Loading state disables submit and shows `Submitting request...`.
- Submitted authenticated state shows backend issue reference only when provided.
- Submitted fallback state does not show fake issue reference.
- Error state preserves form values.
- Does not expose raw backend errors.

### Accessibility Tests
Required:
- Automated accessibility check has no critical violations.
- Keyboard can reach all fields and submit actions.
- Error summary receives focus after invalid submit.
- Field errors are associated with fields.
- Submitted status is announced.
- Reduced motion does not hide guidance or submission status.

### E2E Tests
Add or extend public web E2E coverage:

Test name:
- `e2e-public-support-triage`

Flow:
- Visit `/support`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Click `Start support request`.
- Select `Payment or refund issue`.
- Enter summary and contact detail.
- Submit fallback path if unauthenticated.
- Assert `Support request prepared.`

Test name:
- `e2e-public-support-validation`

Flow:
- Visit `/support`.
- Submit empty form.
- Assert error summary.
- Assert support reason error.
- Assert context/contact error.
- Assert summary error.

### Visual Regression
Capture:
- Desktop hero and quick paths.
- Desktop triage form with guidance.
- Mobile form validation error.
- Submitted fallback state.
- Error state.

Do not accept:
- Fake live chat.
- Hidden labels.
- Placeholder-only fields.
- Raw backend error detail.
- Fake issue references.
- Refund promise banners.

## Content Acceptance Checklist
- Page renders `/support`.
- Page renders `screen-public-support`.
- Page provides tracking path.
- Page provides support request path.
- Page provides refund policy path.
- Page includes delay, damage, loss, payment/refund, handoff/proof, receiver refusal, and other reasons.
- Page maps public reasons to backend categories only when issue creation is available.
- Page does not let public users self-select `p1`.
- Page defines loading state.
- Page defines submitted state.
- Page defines error state.
- Page says backend issue creation is authenticated/support-capable only.
- Page says unauthenticated users can prepare a request or use public support contact.
- Page does not promise instant refund.
- Page does not promise automatic compensation.
- Page does not expose provider references, audit records, staff IDs, or proof asset IDs.

## Design Quality Review Checklist
Before closing implementation, review the UI against five perspectives:

Founder:
- Does the page make Kra feel accountable without promising outcomes it cannot guarantee?

Worried sender:
- Can I quickly find the right support path and know what details to provide?

Receiver:
- Can I tell whether to track, report failed delivery, or read policy?

Support operator:
- Does the form collect enough context to route the issue?

Accessibility reviewer:
- Can I complete support intake with keyboard and screen reader, including validation?

Creative director:
- Does the page feel like a calm support desk instead of a generic contact form?

If any answer is weak, revise before moving to the next screen spec.

## Claude Code Build Notes
Claude Code should:
- Build only this screen and shared components required by this screen.
- Keep unauthenticated fallback honest.
- Reuse shared public header, footer, FAQ, and final CTA components.
- Use existing API client patterns only if authenticated issue creation exists.
- Add tests for validation, submitted, loading, and error states.

Claude Code should not:
- Implement unrelated screens.
- Add a fake chat widget.
- Add fake support agents.
- Add a public issue API not backed by backend.
- Show fake issue references.
- Collect sensitive payment credentials.
- Promise refunds or compensation.
- Expose raw backend error details.
- Add demo or sample issue records.

## Open Decisions
No product decision blocks the support entry spec.

Implementation may choose:
- Whether public fallback opens configured email/contact channel or routes to a contact page.
- Whether authenticated users submit directly or are routed to an app support route.
- Whether reason guidance is expanded inline or in a side panel.

Implementation must not choose:
- Public unauthenticated backend issue creation without an approved endpoint.
- Public self-selection of P1 severity.
- Refund or compensation promises.
- Fake live support.
- Internal data exposure.

## Spec Quality Review
### Top-Tier Product Standard Pass
Pass. The spec defines a calm, evidence-led support entry with quick paths, triage, adaptive guidance, submission states, policy expectations, urgency guidance, accessibility, privacy, and strict anti-fake-support rules.

### Industry Inspiration Translation Pass
Pass. External references are translated into directly relevant principles:
- Support forms need structured context for better user and agent outcomes.
- Form errors must be field-specific, accessible, and recoverable.
- Contact paths should guide users without burying support.
- Status and submitted states should set clear expectations.

No external wording, layouts, support-widget behavior, or brand assets are copied.

### Implementation Readiness Pass
Pass. The spec includes route contract, page IA, exact copy, form fields, backend mapping, states, interactions, accessibility, analytics, SEO, tests, and close criteria.

### Policy Consistency Pass
Pass. The spec aligns to issue API contracts, error codes, refund/dispute rules, doorstep/refusal policy, handoff/proof concerns, copy deck constraints, and frontend inventory states.

### Remaining Constraints Accepted
Accepted:
- Public unauthenticated issue creation is not assumed.
- Authenticated issue creation uses `POST /v1/issues` only when available.
- Public fallback prepares or routes support contact without fake issue creation.
- No UI implementation is included.

### Close Decision
Ready for Claude Code implementation after this document is merged and CI is green.

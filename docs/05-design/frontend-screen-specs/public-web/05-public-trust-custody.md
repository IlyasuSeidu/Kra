# Public Trust Custody Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicTrustCustody` |
| App | `apps/web` |
| Route | `/trust-and-custody` |
| Primary test ID | `screen-public-trust-custody` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/how-it-works`, `/service-areas`, `/pricing`, `/track`, `/support` |
| Required states | `normal` |

## Product Job
This page must explain how Kra prevents package loss through scan-bound custody, role-specific handoffs, receiver proof, and evidence-backed support review.

The page must explain:
- Why memory, paper alone, or verbal confirmation are not enough.
- How the package scan code is bound to one delivery.
- Why assignment is not custody.
- Which proof is required at every handoff.
- How OTP, signature, or photo proof closes delivery.
- What happens when scan hardware, network, or proof fails.
- How liability is determined when something goes wrong.
- What public tracking can show without leaking internal data.

This page should make Kra feel operationally serious without exposing internal audit systems.

## Audience
Primary audience:
- Senders deciding whether Kra is trustworthy enough to handle a package.

Secondary audience:
- Receivers who need to understand OTP, signature, or photo proof.
- Business senders evaluating accountability.
- Partners, operators, support staff, and investors checking the seriousness of the custody model.

## User State
Visitors are skeptical. They may have experienced informal deliveries where nobody can say who last held the package. They need a clear explanation of how Kra knows who has the package, what proof exists, and what happens when proof is missing.

## Primary Action
Primary CTA: `Track a package`

Secondary CTA: `See how Kra works`

Tertiary CTA: `Contact support`

CTA behavior:
- `Track a package` routes to `/track`.
- `See how Kra works` routes to `/how-it-works`.
- `Contact support` routes to `/support`.

## Main Tension
The visitor wants trust but does not want internal complexity. The page must explain the evidence model in public language:
- Package scan codes keep the package tied to the delivery.
- Handoffs make accountability move from one role to another.
- Assignment alone does not move custody.
- Delivery completion requires accepted receiver proof.
- Exceptions go to review instead of silent success.

## Visual Thesis
Design the page as a premium custody ledger made understandable for everyday senders: precise, calm, evidence-led, and human-readable. It should feel like a trusted fintech audit trail translated into a logistics product page.

## Restraint Rule
Do not turn trust into vague badges. Avoid shield-icon spam, fake certifications, generic safety claims, fake audit logs, stock photos of warehouses, or intimidating legal language.

Every visual element must explain one of these:
- Which proof exists.
- Which actor is accountable.
- Which handoff moves custody.
- Which fallback requires supervisor approval.
- Which receiver proof closes delivery.
- Which data is intentionally hidden from public tracking.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of trust, logistics, fintech, marketplace, and safety pages.

Non-negotiable quality requirements:
- The first viewport must explain Kra's trust mechanism, not only claim safety.
- The page must make package scan binding and custody transfer clear.
- The page must state that assignment is not custody.
- The page must list required proof by handoff.
- The page must explain OTP, signature, and photo proof without exposing internal proof asset IDs.
- The page must explain fallback controls without making fallback sound casual.
- The page must explain liability in public language.
- The page must not expose internal staff IDs, audit metadata, payment provider references, raw issue notes, or internal proof asset references.
- The page must work on mobile without table overflow.
- The page must be accessible with keyboard, screen reader, high contrast, and reduced motion needs.

Closure rule:
- If a first-time sender cannot explain how Kra knows who last held the package, the screen remains open.
- If a receiver cannot explain why OTP or proof is requested, the screen remains open.
- If the page sounds like marketing trust claims without operational evidence, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- GS1 traceability standards: reliable supply-chain traceability depends on identifying objects, capturing events, and sharing relevant event context.
- FedEx picture proof of delivery: delivery evidence can increase recipient confidence and reduce delivery uncertainty.
- UPS proof-of-delivery and tracking support patterns: delivery confirmation should help customers verify outcome and resolve questions.
- NIST digital identity guidance: OTP and authenticator copy should be precise, user-understandable, and not overstate identity guarantees.
- W3C WCAG 2.2 quick reference: trust explanations, tables, accordions, diagrams, and focus states must remain accessible.

Reference links:
- https://www.gs1.org/standards/traceability
- https://www.fedex.com/en-us/tracking/picture-proof-delivery.html
- https://www.ups.com/us/en/support/tracking-support.page
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external layouts, proof visuals, wording, security claims, badge designs, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- What makes Kra safer than informal handoff?
- What is a package scan code?
- When does custody actually move?
- Why is assignment not custody?
- What proof is required at each handoff?
- What closes a final-mile delivery?
- What happens if scan hardware or network fails?
- Who is accountable when evidence is missing?
- What public tracking shows and intentionally hides?
- Where do I go if I need support?

## Route And Navigation Rules
### Route
- Render at `/trust-and-custody`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not expose internal actor IDs, staff IDs, audit metadata, payment provider references, raw issue notes, or proof asset IDs.
- Must not render fake tracking records or fake audit logs.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- `Trust and custody` must be active for `/trust-and-custody`.

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
- Full-height menu sheet with same links as desktop.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Public routes.
- Support route.
- Policy links.
- Trust and custody link.

## Page IA
Render sections in this exact order:

1. `PublicTrustCustodyHeader`
2. `PublicTrustCustodyHero`
3. `PublicTrustCustodyTrustMechanism`
4. `PublicTrustCustodyPackageScanBinding`
5. `PublicTrustCustodyHandoffProofMatrix`
6. `PublicTrustCustodyAssignmentVsCustody`
7. `PublicTrustCustodyReceiverProof`
8. `PublicTrustCustodyFallbackControls`
9. `PublicTrustCustodyLiabilityReview`
10. `PublicTrustCustodyPrivacyBoundary`
11. `PublicTrustCustodyFaq`
12. `PublicTrustCustodyFinalCta`
13. `PublicTrustCustodyFooter`

Do not add vague testimonial or badge sections before the evidence model is explained.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `620px`.
- Section spacing: `88px`.
- Handoff proof matrix may use table layout on desktop.
- Evidence diagrams should be text-backed and not map-heavy.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Matrix can become grouped cards.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- Hero stacks with copy first.
- Handoff matrix becomes cards.
- Diagrams must not require pinch zoom.
- Proof and fallback controls must be readable at `320px`.

## Visual System Direction
Follow public web language from previous specs, with a more trust/evidence-led tone.

Recommended art direction:
- Background: warm neutral base with ledger-line texture.
- Primary accent: operational green for confirmed proof.
- Secondary accent: amber for fallback or review.
- Strong neutral: deep ink for custody labels and actor names.
- Visual motifs: scan label, custody stamp, evidence card, proof chain, locked receipt.

Do not use:
- Fake security seals.
- Fake compliance badges.
- Fake audit logs.
- Generic shield patterns.
- Dark cyber-security UI.
- Red panic styling except for severe missing-proof warnings.

## Copy System
### Voice
- Clear.
- Calm.
- Evidence-led.
- Public-safe.
- Operationally honest.

### Forbidden Copy
Do not use:
- `unbreakable`
- `impossible to lose`
- `guaranteed safe`
- `fully insured`
- `military-grade`
- `bank-level security`
- `blockchain`
- `tamper-proof`
- `zero risk`
- `instant compensation`

### Required Terms
Use these terms consistently:
- `package scan code`
- `handoff`
- `custody`
- `assignment`
- `confirmed proof`
- `receiver proof`
- `OTP`
- `signature`
- `photo proof`
- `fallback handoff`
- `support review`

### Plain-Language Rule
Public copy should translate internal controls without exposing internals.

Internal: `The last fully confirmed custodian remains accountable by default.`

Public: `If something goes wrong, Kra starts review from the last person or station that fully accepted the package.`

## Section Specs
### 1. `PublicTrustCustodyHeader`
Purpose:
- Keep public navigation consistent.
- Make the trust/custody route findable.

Required:
- Shared public header.
- Active nav item: `Trust and custody`.
- Primary header CTA: `Track package`.

Acceptance:
- Header active state is visible.
- Public links use approved routes.

### 2. `PublicTrustCustodyHero`
Purpose:
- Explain the trust mechanism immediately.

Hero content:
- Eyebrow: `Trust and custody`
- H1: `Every handoff needs proof.`
- Subheadline: `Kra ties each package to a scan code, moves custody only after confirmed handoff, and closes delivery only with receiver proof.`
- Primary CTA: `Track a package`
- Secondary CTA: `See how Kra works`
- Trust line: `No memory-only handoffs. No silent delivery completion.`

Hero visual:
- Use a `CustodyLedgerPreview`.
- Show a conceptual chain:
  - `Origin station`
  - `Driver`
  - `Destination station`
  - `Receiver or courier`
- Each link should show a proof marker:
  - `scan`
  - `timestamp`
  - `confirmation`
  - `receiver proof`

Do not show:
- Real package IDs.
- Real staff names.
- Fake delivery records.
- Internal audit fields.

Quality bar:
- The hero must teach proof-before-custody, not just claim trust.

### 3. `PublicTrustCustodyTrustMechanism`
Purpose:
- Summarize Kra's trust model in public language.

Section heading:
- Eyebrow: `The trust model`
- H2: `Trust comes from evidence, not memory.`
- Intro: `Kra does not rely on verbal updates or paper alone. The system records who accepted the package, when they accepted it, and what proof was used.`

Required cards:

Card 1:
- Title: `One package, one scan code`
- Body: `The origin station binds the package scan code to one delivery so later scans must match that delivery.`

Card 2:
- Title: `Custody moves by confirmation`
- Body: `A person can be assigned work before they hold the package. Custody moves only after the required handoff proof.`

Card 3:
- Title: `Delivery closes with proof`
- Body: `Final delivery requires OTP, signature, or photo proof plus a timestamp.`

Card 4:
- Title: `Exceptions go to review`
- Body: `Missing proof, scan mismatch, or fallback handoff does not become silent success.`

Acceptance:
- The section names evidence, scan, custody, and receiver proof.

### 4. `PublicTrustCustodyPackageScanBinding`
Purpose:
- Explain how the package scan code prevents wrong-package handoffs.

Section heading:
- Eyebrow: `Package scan code`
- H2: `The package label is tied to one delivery.`
- Intro: `At origin intake, Kra reserves the package scan code for one delivery. Later staff, driver, or courier scans must match that same binding before the handoff can proceed.`

Required explanation:
- Origin intake reserves the package scan code in the package label registry.
- The scan code belongs to one delivery only.
- Duplicate labels should block.
- Wrong package scan should block.
- Manual entry is fallback, not default.

Visual:
- Use a `ScanBindingDiagram`:
  - Delivery.
  - Package scan code.
  - Allowed next handoff.
  - Blocked mismatch.
- Include text equivalent.

Required blocker examples:
- `Wrong package scanned`
- `Package label already used`
- `Package not ready for dispatch`

Acceptance:
- Visitor understands why scanning protects package identity.
- Page does not expose backend collection names except where not user-facing.

### 5. `PublicTrustCustodyHandoffProofMatrix`
Purpose:
- Publish the required proof by handoff.

Section heading:
- Eyebrow: `Handoff proof`
- H2: `Each handoff has required evidence.`
- Intro: `The package can move through the chain only when the required handoff evidence is recorded.`

Required matrix:

| Handoff | Public explanation | Required proof |
| --- | --- | --- |
| `Sender -> Origin station` | Station receives the package and records intake. | Package ID, intake timestamp, sender acknowledgement |
| `Origin station -> Driver` | Assigned driver confirms pickup with the package scan. | Package scan, driver confirmation, dispatch timestamp |
| `Driver -> Destination station` | Destination station receives, scans, and checks condition. | Package scan, operator confirmation, condition check |
| `Destination station -> Final-mile courier` | Assigned courier confirms package before doorstep custody starts. | Package scan, courier confirmation, assignment timestamp |
| `Final-mile courier -> Receiver` | Receiver proof closes delivery. | Verified receiver OTP token, signature, or delivery photo plus timestamp |

Design:
- Desktop can use a table.
- Mobile must use handoff cards.
- Required proof chips must be readable as text.
- Use actor names, not internal roles or IDs.

Acceptance:
- All five handoffs appear.
- Required proof values match policy.
- Mobile version does not overflow.

### 6. `PublicTrustCustodyAssignmentVsCustody`
Purpose:
- Explain the most important operational distinction.

Section heading:
- Eyebrow: `Assignment is not custody`
- H2: `Being assigned does not mean holding the package.`
- Intro: `Kra separates task assignment from package custody so accountability does not move too early.`

Required comparison:

Assignment:
- Meaning: `A person has been selected for the next task.`
- Example: `A driver is assigned to pick up from the origin station.`
- Does it move custody? `No.`

Custody:
- Meaning: `A person or station has accepted the correct package with required proof.`
- Example: `The assigned driver scans the package and confirms pickup.`
- Does it move accountability? `Yes.`

Required copy:
- `Station dispatch does not transfer custody by itself.`
- `Origin-station to driver custody transfers only when the assigned driver confirms pickup with the registered package scan code.`
- `Destination-station to final-mile custody transfers only when the assigned courier accepts the assignment with the registered package scan code.`

Design:
- Use a split panel with `Assigned` and `In custody`.
- Use a clear visual transition only after proof.

Acceptance:
- Page explicitly states assignment is not custody.
- Page states custody moves after proof.

### 7. `PublicTrustCustodyReceiverProof`
Purpose:
- Explain final delivery proof and receiver expectations.

Section heading:
- Eyebrow: `Receiver proof`
- H2: `Delivery is not complete until receiver proof is accepted.`
- Intro: `For doorstep delivery, OTP is the default proof method. If OTP cannot be completed, policy may allow signature or photo proof.`

Required proof cards:

Card 1:
- Title: `OTP`
- Body: `The receiver verifies delivery with a delivery-scoped OTP token.`
- Note: `Default final-mile proof method in v1.`

Card 2:
- Title: `Signature`
- Body: `A receiver signature may be used as approved fallback proof.`
- Note: `Requires recorded receiver name and completion timestamp.`

Card 3:
- Title: `Photo proof`
- Body: `A delivery photo may be used as approved fallback proof when policy allows.`
- Note: `Used to support proof of handoff, not to expose private details publicly.`

Required rules:
- A delivery cannot be marked delivered without one accepted proof method plus a timestamp.
- Signature and photo fallback proof must be uploaded and confirmed before completion.
- Public pages must not expose proof asset IDs.

Acceptance:
- Receiver understands why OTP may be requested.
- Page does not overstate OTP as legal identity verification.

### 8. `PublicTrustCustodyFallbackControls`
Purpose:
- Explain fallback handoffs without normalizing them.

Section heading:
- Eyebrow: `Fallback controls`
- H2: `Fallback is allowed only with extra controls.`
- Intro: `If scan hardware or network fails, Kra can use fallback handoff only with stricter evidence and review markers.`

Required fallback requirements:
- Manual package ID entry.
- Receiving-party confirmation.
- Supervisor PIN override.
- Automatic fallback marker on the handoff event.

Public wording:
- `Fallback handoff is not a shortcut. It creates extra responsibility until a later fully confirmed handoff occurs.`

Liability note:
- `When fallback is used, accountability shifts jointly to the receiving role and the authorizing supervisor until a later fully confirmed handoff occurs.`

Design:
- Use amber review styling.
- Do not use green success styling for fallback.

Acceptance:
- Fallback is presented as controlled exception, not normal path.

### 9. `PublicTrustCustodyLiabilityReview`
Purpose:
- Explain how Kra reviews loss, damage, or custody disputes.

Section heading:
- Eyebrow: `If something goes wrong`
- H2: `Review starts from the last confirmed custodian.`
- Intro: `Kra uses handoff events, payment records, proof artifacts, and support notes to decide what happened and who is accountable.`

Required explanation:
- The last fully confirmed custodian remains accountable by default.
- Missing proof means handoff remains operationally incomplete and should trigger review.
- Confirmed handoff events are the strongest dispute evidence.
- Proof-of-delivery or proof-of-return evidence supports review.
- Manual witness statements are considered only when digital evidence is incomplete.

Evidence order:
1. Confirmed handoff events.
2. Payment verification and settlement records.
3. Proof-of-delivery or proof-of-return artifacts.
4. Issue thread and support notes.
5. Manual witness statements only if digital evidence is incomplete.

Required link:
- `Contact support` -> `/support`

Acceptance:
- The liability section is clear without becoming legal advice.
- Page does not promise automatic compensation.

### 10. `PublicTrustCustodyPrivacyBoundary`
Purpose:
- Explain what public tracking shows and hides.

Section heading:
- Eyebrow: `Public tracking privacy`
- H2: `Tracking shows progress without exposing internal records.`
- Intro: `Kra public tracking is receiver-safe. It explains package progress and next steps without showing unnecessary internal data.`

Public tracking can show:
- Public status labels.
- Station-level progress.
- Pickup readiness.
- Out-for-delivery state.
- Failed attempt next step.
- Delivered state.
- Receiver instructions where appropriate.

Public tracking must not show:
- Sender IDs.
- Staff IDs.
- Driver IDs.
- Payment provider references.
- Internal audit metadata.
- Raw issue descriptions.
- Internal proof asset references.
- Internal admin notes.

Design:
- Use a two-column `Shows` and `Does not show` panel.
- Avoid security-theater language.

Required link:
- `Track a package` -> `/track`

Acceptance:
- Visitor understands tracking is useful but privacy-bounded.

### 11. `PublicTrustCustodyFaq`
Purpose:
- Resolve trust, scan, proof, OTP, fallback, and privacy questions.

Behavior:
- Use accessible accordion.
- Keep answers short and literal.

Required FAQ items:

FAQ 1:
- Question: `What is custody?`
- Answer: `Custody means a person or station has accepted the correct package with the required proof and is accountable until the next confirmed handoff.`

FAQ 2:
- Question: `Is assignment the same as custody?`
- Answer: `No. Assignment means someone has been selected for a task. Custody moves only after the required proof confirms the correct package was accepted.`

FAQ 3:
- Question: `Why does Kra scan packages?`
- Answer: `The scan code ties the package to one delivery and helps block wrong-package or duplicate-label handoffs.`

FAQ 4:
- Question: `What proof is needed for final delivery?`
- Answer: `Doorstep delivery uses OTP by default. Signature or photo proof may be used as approved fallback proof.`

FAQ 5:
- Question: `What happens if the scan fails?`
- Answer: `Fallback handoff can proceed only with manual package ID, receiving-party confirmation, supervisor PIN override, and a fallback flag for review.`

FAQ 6:
- Question: `Who is accountable if a package is lost?`
- Answer: `Kra starts review from the last fully confirmed custodian and then checks handoff events, payment records, proof, support notes, and any approved fallback records.`

FAQ 7:
- Question: `Does public tracking show staff details?`
- Answer: `No. Public tracking shows useful package progress and next steps without exposing sender IDs, staff IDs, payment provider references, audit metadata, or internal issue details.`

FAQ 8:
- Question: `Does proof mean automatic compensation?`
- Answer: `No. Proof supports support and dispute review. Refund or compensation outcomes depend on policy, evidence, and review.`

Required links below FAQ:
- `Track a package` -> `/track`
- `How Kra works` -> `/how-it-works`
- `Contact support` -> `/support`

### 12. `PublicTrustCustodyFinalCta`
Purpose:
- Turn trust understanding into action.

Copy:
- Eyebrow: `Follow the proof`
- H2: `Track packages through a verified chain.`
- Body: `Kra records scans, handoffs, and receiver proof so package movement has an accountable trail.`
- Primary CTA: `Track a package`
- Secondary CTA: `See how Kra works`
- Tertiary text link: `Contact support`

Behavior:
- Primary routes to `/track`.
- Secondary routes to `/how-it-works`.
- Tertiary routes to `/support`.

### 13. `PublicTrustCustodyFooter`
Purpose:
- Provide stable public navigation and support routes.

Required:
- Same shared footer as public landing.
- Support and policy links visible.
- Trust and custody link visible.

## Component Inventory
Claude Code should create or reuse components with these responsibilities:

### `PublicTrustCustodyPage`
- Owns page composition.
- Sets metadata.
- Renders `data-testid="screen-public-trust-custody"`.
- Does not fetch authenticated data.

### `CustodyLedgerPreview`
- Renders conceptual custody chain in hero.
- Uses public-safe labels only.
- Does not show fake delivery records.

### `TrustMechanismCards`
- Renders scan, custody, receiver proof, and review principles.

### `ScanBindingDiagram`
- Explains one package scan code to one delivery.
- Includes text equivalent.

### `HandoffProofMatrix`
- Renders required proof by handoff.
- Converts to cards on mobile.
- Uses exact approved proof rules.

### `AssignmentCustodyCompare`
- Renders assignment versus custody comparison.
- Makes proof transition explicit.

### `ReceiverProofCards`
- Renders OTP, signature, and photo proof explanation.

### `FallbackControlPanel`
- Renders fallback requirements and joint accountability note.
- Uses review styling, not success styling.

### `LiabilityReviewStack`
- Renders evidence hierarchy and last confirmed custodian rule.

### `PrivacyBoundaryPanel`
- Renders public tracking shows/hides content.

### `PublicFaqAccordion`
- Shared accessible FAQ accordion.

### `PublicFinalCta`
- Shared final CTA pattern.

## Data And Content Source
This page is static public content for v1.

Allowed local sources:
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/copy-deck.md`

Do not fetch:
- Delivery records.
- Audit logs.
- Staff records.
- Proof assets.
- Payment provider data.
- Issue descriptions.
- Real package scan codes.

## State Handling
Required page state:
- `normal`

No full-page states required:
- No loading.
- No empty.
- No unavailable.
- No authenticated error state.

Non-blocking component fallback:
- If a diagram asset fails, render all text explanations and matrices normally.
- Fallback text: `The custody proof steps are listed below.`

## Interaction Rules
### In-Page Navigation
Optional but recommended on desktop:
- `Scan`
- `Handoffs`
- `Custody`
- `Receiver proof`
- `Fallback`
- `Privacy`
- `FAQ`

Rules:
- Anchor links only.
- Active section must not rely on color alone.
- Do not create route changes.

### Proof Matrix
- Desktop table is allowed.
- Mobile must use cards.
- Proof chips must be text, not icons alone.
- Do not hide required proof behind hover.

### Comparison And Panels
- Assignment/custody comparison can use tabs only if accessible.
- Prefer side-by-side desktop and stacked mobile.
- Privacy shows/hides panel must be explicit and readable.

### Motion
Allowed:
- Subtle proof-chain reveal.
- Handoff connector reveal.
- CTA hover/focus transitions.

Rules:
- Respect `prefers-reduced-motion`.
- No pulsing warning loops.
- No fake scanning animation that looks like live data capture.

## Accessibility Requirements
Baseline:
- One `h1`.
- Semantic `main`, header, footer.
- Logical heading order.
- Tables have headers.
- Mobile cards preserve table header meaning.
- Keyboard can reach all links, accordions, and optional in-page nav.
- Visible focus states.
- Color contrast meets WCAG AA.
- Text remains readable at 200% zoom.
- No horizontal scroll at `320px`.

Trust/proof content:
- Do not communicate proof state by color alone.
- Icons must have text labels.
- Avoid tiny legal footnotes.
- Fallback warnings must be readable and not hidden behind tooltips.

Diagrams:
- Informational diagrams need text equivalent.
- Decorative visuals use empty alt text.

FAQ:
- Button triggers.
- `aria-expanded` reflects state.
- Focus order remains predictable.

## Performance Requirements
- No heavy charting or diagram library.
- No third-party trust badge scripts.
- No real-time tracking scripts.
- No payment provider scripts.
- No autoplay media.
- Diagrams should be CSS, SVG, or lightweight optimized assets.
- Page remains understandable if diagrams fail.

Performance acceptance:
- Static trust content renders immediately.
- No dependency is added solely for proof-chain visuals.
- Mobile proof cards remain lightweight.

## SEO And Metadata
Page title:
- `Trust, Custody, And Proof | Kra`

Meta description:
- `Learn how Kra uses package scan codes, confirmed handoffs, custody rules, OTP, signature, and photo proof to keep deliveries accountable.`

Open Graph:
- Title: `Kra trust and custody`
- Description: `Scan-bound handoffs and receiver proof for accountable package delivery.`
- Image: approved public brand/social image only.

Structured content:
- Use semantic headings.
- Do not add security certification schema or claims.

## Analytics Contract
Use analytics only if the public analytics layer already exists.

Events:

### `public_trust_custody_viewed`
Fire when page renders.

Payload:
- `route`: `/trust-and-custody`
- `screen_id`: `PublicTrustCustody`

### `public_trust_custody_section_viewed`
Fire when major sections become visible if scroll analytics already exist.

Payload:
- `section`

### `public_trust_custody_cta_clicked`
Fire when major CTA is clicked.

Payload:
- `cta_label`
- `destination_route`
- `section`

### `public_trust_custody_faq_opened`
Fire when FAQ opens.

Payload:
- `question_key`

Privacy:
- Never collect tracking codes, phone numbers, delivery IDs, package scan codes, actor IDs, or proof asset references from this static page.
- Do not include raw query strings.

## Testing Contract
### Unit And Component Tests
Required tests:
- Renders `screen-public-trust-custody`.
- Renders hero H1 exactly.
- Renders primary CTA linking to `/track`.
- Renders package scan binding explanation.
- Renders assignment is not custody copy.
- Renders all five handoff proof rows/cards.
- Renders OTP, signature, and photo proof cards.
- Renders fallback requirements.
- Renders last confirmed custodian rule.
- Renders public tracking privacy boundary.
- Renders all FAQ questions.
- Does not render internal actor IDs, staff IDs, audit metadata, payment references, or proof asset IDs.

### Accessibility Tests
Required:
- Automated accessibility check has no critical violations.
- Keyboard can reach:
  - header links
  - in-page nav if present
  - FAQ triggers
  - final CTA
- Tables or mobile cards preserve label/value relationships.
- Reduced motion does not hide content.

### E2E Tests
Add or extend public web E2E coverage:

Test name:
- `e2e-public-trust-custody-content`

Flow:
- Visit `/trust-and-custody`.
- Assert screen test ID exists.
- Assert hero H1 is visible.
- Assert `assignment is not custody` copy is visible.
- Assert `Final-mile courier -> Receiver` handoff is visible.
- Assert `OTP`, `signature`, and `photo proof` are visible.
- Click `Track a package`.
- Assert route is `/track`.

Test name:
- `e2e-public-trust-custody-mobile`

Flow:
- Set mobile viewport.
- Visit `/trust-and-custody`.
- Assert no horizontal overflow.
- Assert handoff proof cards are readable.
- Open FAQ about public tracking staff details.
- Assert answer says public tracking does not show staff details.

### Visual Regression
Capture:
- Desktop hero and custody ledger.
- Desktop handoff proof matrix.
- Mobile handoff proof cards.
- Fallback controls panel.
- Privacy boundary panel.
- FAQ open state.

Do not accept:
- Fake audit logs.
- Shield-icon-only trust claims.
- Clipped proof matrix.
- Hidden fallback controls.
- Low-contrast proof chips.
- Internal IDs in UI.

## Content Acceptance Checklist
- Page renders `/trust-and-custody`.
- Page states no memory-only handoffs.
- Page explains one package scan code to one delivery.
- Page states assignment is not custody.
- Page states custody moves only after proof.
- Page lists all five required handoffs.
- Page lists required proof for each handoff.
- Page states final delivery requires OTP, signature, or photo proof.
- Page states delivery cannot be marked delivered without proof and timestamp.
- Page states fallback requires manual package ID, receiving confirmation, supervisor PIN, and fallback flag.
- Page states last fully confirmed custodian remains accountable by default.
- Page states public tracking hides staff IDs and internal records.
- Page does not expose internal proof asset IDs.
- Page does not promise zero risk or automatic compensation.
- Page links to `/track`.
- Page links to `/how-it-works`.
- Page links to `/support`.

## Design Quality Review Checklist
Before closing implementation, review the UI against five perspectives:

Founder:
- Does the page make Kra's trust model feel operationally real?

Skeptical sender:
- Can I explain who is accountable if a package goes missing?

Receiver:
- Do I understand why OTP, signature, or photo proof may be required?

Operator:
- Does the page describe custody accurately without exposing internal systems?

Accessibility reviewer:
- Can I understand the proof model without a mouse, wide screen, animation, or perfect vision?

Creative director:
- Does the page have a memorable custody-led visual idea instead of generic trust badges?

If any answer is weak, revise before moving to the next screen spec.

## Claude Code Build Notes
Claude Code should:
- Build only this screen and shared components required by this screen.
- Keep content static and public-safe.
- Reuse shared public header, footer, FAQ, and final CTA components.
- Convert matrices to accessible mobile cards.
- Add tests at the same quality level as other public web routes.

Claude Code should not:
- Implement unrelated screens.
- Add real delivery data.
- Add fake tracking records.
- Add fake audit logs.
- Add trust badges or certifications not approved by policy.
- Expose staff, audit, payment, issue, or proof asset internals.
- Render raw backend fallback flags such as `fallback_used=true` in public copy.
- Add security claims not backed by policy.
- Add demo or sample custody records.

## Open Decisions
No product decision blocks this static trust/custody explainer.

Implementation may choose:
- Whether proof matrix is table-first or card-first.
- Whether hero ledger visual is CSS, SVG, or optimized image.
- Whether in-page navigation is sticky on desktop.

Implementation must not choose:
- Different handoff proof requirements.
- Different custody-transfer rules.
- Public exposure of internal IDs.
- Claims of guaranteed safety or automatic compensation.
- OTP language that overstates identity verification.

## Spec Quality Review
### Top-Tier Product Standard Pass
Pass. The spec defines a serious custody and proof explainer with exact scan, handoff, proof, fallback, liability, privacy, accessibility, testing, and anti-security-theater requirements.

### Industry Inspiration Translation Pass
Pass. External references are translated into directly relevant principles:
- Traceability depends on identifying objects and capturing events.
- Proof-of-delivery evidence improves confidence and dispute resolution.
- OTP/security copy should be precise and not overclaim.
- Accessibility must apply to matrices, accordions, diagrams, and proof labels.

No external wording, assets, security claims, or layouts are copied.

### Implementation Readiness Pass
Pass. The spec provides route contract, page IA, exact copy, components, interaction rules, privacy boundaries, accessibility, analytics, SEO, tests, and close criteria.

### Policy Consistency Pass
Pass. The spec aligns to handoff rules, delivery lifecycle, doorstep proof policy, refund/dispute evidence hierarchy, copy deck constraints, and frontend inventory boundaries.

### Remaining Constraints Accepted
Accepted:
- This page is static and public-safe.
- It does not show real tracking or audit data.
- It does not implement UI.
- It does not expose internal proof asset references.

### Close Decision
Ready for Claude Code implementation after this document is merged and CI is green.

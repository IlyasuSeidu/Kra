# Public Privacy Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicPrivacy` |
| App | `apps/web` |
| Route | `/privacy` |
| Primary test ID | `screen-public-privacy` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | None for page render |
| Related routes | `/`, `/track`, `/support`, `/delivery-policy`, `/refund-policy`, `/terms` |
| Required states | `normal` |

## Product Job
This page must publish Kra's public privacy notice in clear customer language. It must explain what data Kra collects, why it is needed, how long it is retained, how sensitive proof and location records are protected, what public tracking hides, what analytics must not capture, and how users can request export or deletion review.

The page must help users understand:
- Kra stores only the data needed to move packages, confirm payment, resolve issues, and maintain accountability.
- Names, phone numbers, addresses, delivery instructions, payment references, proof images, signatures, and operational location data are sensitive.
- Customer data is not used for unrelated marketing automation in the pilot.
- Public tracking is event-first and privacy-safe, not a live GPS feed.
- Receiver access is delivery-scoped and may require phone verification.
- Raw proof assets are restricted and are not public tracking content.
- Delivery summaries are retained for `24 months`.
- Issue and audit history is retained for `24 months`.
- Payment and refund records are retained for `36 months`.
- Proof images and signatures are retained for `180 days` unless tied to active dispute, then `24 months`.
- GPS and route snapshots are retained for `30 days`.
- Sender data export requests go through support.
- Deletion requests are reviewed against dispute, audit, and payment-retention obligations.
- Proof assets and GPS data should be archived or deleted first when eligible.

This page must reduce privacy anxiety without hiding operational realities. Kra needs accountability records to protect packages, payments, handoffs, disputes, and receivers. The page must state that plainly.

## Audience
Primary audience:
- Senders and receivers who want to understand how Kra handles delivery, payment, tracking, proof, and support data.

Secondary audience:
- Staff users checking public-facing privacy wording.
- Business senders evaluating whether Kra has serious privacy and accountability discipline.
- Support users preparing export or deletion requests.
- Visitors comparing Kra with informal delivery alternatives.

## User State
Users may arrive before sending, after receiving a tracking link, after a support issue, or while considering a data request. They may worry about phone numbers, receiver addresses, proof photos, signatures, payment records, and location tracking. The page must be transparent enough to build trust and concrete enough to guide action.

## Primary Action
Primary CTA: `Contact support about your data`

Secondary CTA: `Track a package`

Tertiary CTA: `Read terms`

CTA behavior:
- `Contact support about your data` routes to `/support` with privacy/data context when routing supports it.
- `Track a package` routes to `/track`.
- `Read terms` routes to `/terms`.

## Main Tension
Privacy copy must not sound like vague legal boilerplate, but it also must not make impossible deletion promises. Kra keeps operational records because delivery disputes, payment reconciliation, custody proof, fraud prevention, and audit trails require evidence.

## Visual Thesis
Design the page as a transparent data-control room: calm, structured, plain-language, and accountable. It should feel like a premium trust center for a logistics-fintech system, not a wall of legal text.

## Restraint Rule
Do not build a decorative privacy manifesto. Avoid vague "we value your privacy" copy, oversized lock illustrations, legal walls, generic cookie banners inside the page, and claims that data is deleted on demand without review.

Every visual element must help one of these:
- Show what data Kra collects.
- Explain why that data is needed.
- Show retention periods.
- Explain who can see what.
- Clarify tracking privacy.
- Route export or deletion requests.
- Explain proof and location safeguards.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of public privacy notices, trust centers, logistics policy pages, and fintech data-rights pages.

Non-negotiable quality requirements:
- The first viewport must explain data collection purpose, privacy promise, and the support path for data requests.
- Sensitive data categories must be visible before retention details.
- Retention periods must be visible in a scannable table or card system.
- Proof asset protections must be explicit.
- Public tracking privacy boundaries must be explicit.
- Analytics restrictions must be explicit.
- Export and deletion request flow must be explicit.
- The page must not promise unconditional deletion.
- The page must not imply precise live GPS is shown to public users.
- The page must not imply raw proof photos or signatures are publicly visible.
- The page must not expose real names, phone numbers, addresses, provider references, proof asset IDs, audit event IDs, or staff IDs.
- The page must work on mobile without table overflow.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, and large text.

Closure rule:
- If a receiver cannot understand why phone verification may be required, the screen remains open.
- If a sender cannot find the retention periods in under one minute, the screen remains open.
- If the page implies deletion is immediate or unconditional, the screen remains open.
- If the page hides proof asset and GPS rules in fine print, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- Ghana Data Protection Commission: Kra should communicate personal-data use, accountability, and data-subject request paths in a way aligned with Ghana privacy expectations.
- ICO right-to-be-informed guidance: privacy notices should be concise, transparent, intelligible, and easy to access.
- FTC privacy and security guidance: public privacy communication should be specific about data practices and avoid vague or deceptive claims.
- GOV.UK service/content guidance: public policy pages should use plain language, clear headings, and task-oriented structure.
- W3C WCAG 2.2 quick reference: privacy notices, tables, accordions, links, and support paths must remain accessible.

Reference links:
- https://www.dataprotection.org.gh/
- https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/right-to-be-informed/
- https://www.ftc.gov/business-guidance/privacy-security
- https://www.gov.uk/service-manual/design/writing-for-user-interfaces
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external legal language, privacy notice wording, page layout, data-rights labels, illustrations, icons, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- What personal data does Kra collect?
- Why does Kra need this data?
- What data is considered highly sensitive?
- How long does Kra keep delivery, issue, audit, payment, proof, and GPS records?
- What does public tracking show?
- What does public tracking never show?
- What happens to proof photos and signatures?
- Does Kra use customer data for unrelated marketing automation in the pilot?
- How do I request export?
- How do I request deletion review?
- Why might deletion not be immediate?
- Where can I ask privacy questions?

## Route And Navigation Rules
### Route
- Render at `/privacy`.
- Must be public and unauthenticated.
- Must not call authenticated APIs.
- Must not collect data directly on this page.
- Must not embed a privacy request form unless a real backend support path exists and is approved.
- Must not render cookie consent controls unless the app has actual cookie tracking controls wired.

### Header
Reuse the public web header behavior defined by `PublicLanding`.

Header active state:
- No primary top-level nav item must be active unless the public navigation includes `Privacy`.
- If nested under footer policy links, breadcrumb/current page should show `Privacy`.

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
- `Privacy` must remain reachable from the mobile menu or footer.
- Menu close returns focus to the menu button.

### Footer
Reuse the public footer behavior defined by `PublicLanding`.

Footer must include:
- Privacy.
- Terms.
- Refund policy.
- Delivery policy.
- Support.
- Tracking.

## Page IA
Render sections in this exact order:

1. `PublicPrivacyHeader`
2. `PublicPrivacyHero`
3. `PublicPrivacySummary`
4. `PublicPrivacyDataCategories`
5. `PublicPrivacyWhyWeUseData`
6. `PublicPrivacyTrackingBoundaries`
7. `PublicPrivacyProofAndLocationControls`
8. `PublicPrivacyRetentionTable`
9. `PublicPrivacyAccessAndSharing`
10. `PublicPrivacyAnalyticsControls`
11. `PublicPrivacyExportDeletionRequests`
12. `PublicPrivacySecurityPractices`
13. `PublicPrivacyFaq`
14. `PublicPrivacyFinalCta`
15. `PublicPrivacyFooter`

Do not put FAQ before data categories and retention. Privacy users need direct answers before edge-case questions.

## Global Layout
### Desktop
- Max content width: `1180px`.
- Page gutters: `32px` minimum.
- Use a 12-column grid.
- Hero min height: `540px`.
- Section spacing: `80px`.
- Retention should be a card-table hybrid, not a dense legal table.
- Proof and tracking boundaries can sit side by side on wide screens.

### Tablet
- Gutters: `28px`.
- Section spacing: `72px`.
- Sensitive-data cards should use two columns when room allows.
- Retention cards wrap without horizontal scroll.

### Mobile
- Gutters: `20px`.
- Section spacing: `56px`.
- All tables become stacked cards.
- Retention cards must show the data type and period without truncation.
- CTA stack order: primary, secondary, tertiary.
- No horizontal scroll.

## Visual System Direction
Follow the public web design language from previous specs while moving toward a trust-center tone.

Recommended art direction:
- Background: warm neutral base with subtle ledger or data-line texture.
- Primary accent: trust green for protected and controlled concepts.
- Secondary accent: deep blue or charcoal for privacy, policy, and security.
- Amber: caution for retention, dispute hold, and deletion review.
- Red: only for "never show" or "restricted" warnings, used sparingly.
- Visual motifs: data vault, proof envelope, retention timeline, access boundary, receiver-safe tracking.

Do not use:
- Generic lock hero as the main idea.
- Surveillance imagery.
- Face/photo thumbnails.
- Live-map route art.
- Staff avatars.
- Payment provider logos.
- Decorative data streams that make the page feel like cyber theater.

## Copy System
### Voice
- Clear.
- Calm.
- Accountable.
- Plain-language.
- Evidence-aware.
- Low-hype.

### Forbidden Copy
Do not use:
- `we never collect personal data`
- `delete anytime`
- `instant deletion`
- `anonymous tracking`
- `live GPS for everyone`
- `public proof photos`
- `we sell data`
- `marketing automation`
- `no retention`
- `complete anonymity`

### Required Terms
Use these terms consistently:
- `personal data`
- `delivery data`
- `payment record`
- `proof asset`
- `phone verification`
- `public tracking`
- `support request`
- `retention period`
- `export request`
- `deletion review`
- `audit trail`
- `operational accountability`

### Plain-Language Rule
Use public explanations before technical labels.

Technical: `ProofAsset`

Public: `proof photo or signature record`

Technical: `gpsSnapshot`

Public: `route or location snapshot`

Technical: `audit event`

Public: `record of who changed what and when`

## Policy Content Model
### Privacy Promise
Required public promise:
`Kra uses delivery data to move packages, confirm payment, resolve issues, and keep accountability records. We do not use customer data for unrelated marketing automation in the pilot.`

Do not expand this into a broad, universal privacy guarantee.

### Sensitive Data Categories
The page must show these categories:

| Category | Public Explanation | Sensitivity |
| --- | --- | --- |
| `Names and phone numbers` | Used to identify senders, receivers, and authorized delivery contacts | `Restricted` |
| `Addresses and delivery instructions` | Used for doorstep delivery, pickup guidance, and issue recovery | `Restricted` |
| `Payment references` | Used to confirm payment, reconcile charges, and resolve refunds | `Restricted` |
| `Proof images and signatures` | Used to confirm delivery, return, damage, or dispute evidence | `Highly Restricted` |
| `Operational location data` | Used for route support, courier accountability, and exception review | `Restricted` or `Highly Restricted` depending on detail |
| `Audit and support history` | Used to resolve issues, investigate disputes, and prevent silent changes | `Internal` or `Restricted` depending on content |

Do not label any sensitive data category as public.

### Retention Periods
The page must show these approved baseline periods:

| Data Type | Retention Period | Public Reason |
| --- | --- | --- |
| `Delivery summary` | `24 months` | Package accountability, support history, operational review |
| `Issue and audit history` | `24 months` | Dispute resolution, abuse prevention, operational accountability |
| `Payment and refund records` | `36 months` | Reconciliation, refunds, finance review, legal/accounting obligations |
| `Proof images and signatures` | `180 days` unless tied to active dispute, then `24 months` | Delivery proof and dispute evidence |
| `GPS and route snapshots` | `30 days` | Route support, exception investigation, short-term operational review |

Retention copy must say:
`These retention periods are the active build baseline until replaced by formal legal review.`

### Tracking Boundaries
Public tracking may show:
- Current delivery status.
- Latest verified station or courier milestone.
- Pickup readiness.
- Doorstep attempt outcome.
- Limited ETA language when confidence is high enough.
- Receiver-safe next step.

Public tracking must never show:
- Internal notes.
- Staff names beyond role labels.
- Precise live GPS trails.
- Payment internals.
- Refund reasoning.
- Raw proof photos.
- Signatures.
- Staff IDs.
- Audit records.

### Receiver Access Rule
Required copy:
`Receivers do not need a full Kra account in v1. Receiver access is delivery-scoped and may require phone verification before sensitive receiver actions or proof-related steps.`

Explain:
- Secure tracking link is tied to the delivery.
- Phone verification protects receiver-specific access.
- The receiver sees safe delivery progress, not internal operations data.

### Proof Asset Controls
Required content:
- Proof photos and signatures are controlled assets.
- Clients receive short-lived signed upload URLs only after backend checks.
- Raw proof assets are not directly readable by client-side rules.
- Public views show proof metadata only where appropriate.
- Raw proof asset access requires a separate audited backend flow.

Do not expose proof asset IDs in public copy.

### Analytics Controls
Required content:
- Analytics should avoid raw proof assets and full phone numbers.
- Public page analytics must not send tracking codes, payment references, phone numbers, addresses, receiver names, support narratives, or proof content.
- Allowed public privacy page analytics are limited to page views, CTA clicks, FAQ opens, and section views.

### Export And Deletion Requests
Required content:
- Sender may request personal-data export through support.
- Deletion requests are reviewed against dispute, audit, and payment-retention obligations.
- Proof assets and GPS data should be archived or deleted first when eligible.
- Kra cannot promise immediate deletion where records are needed for active disputes, audit, payment, refund, or legal retention.

## Component Specifications
### `PublicPrivacyHero`
Purpose:
- Establish what Kra uses data for and where users can ask privacy questions.

Layout:
- Two-column desktop hero.
- Left column: eyebrow, headline, subheadline, CTA row, privacy promise.
- Right column: data boundary visual showing `Delivery`, `Payment`, `Proof`, `Tracking`, `Support`.
- Mobile: text first, visual second.

Required copy:
- Eyebrow: `Privacy and data retention`
- Headline: `Your delivery data should explain the package journey, not expose it.`
- Subheadline: `Kra uses personal data to move packages, confirm payment, protect handoffs, resolve issues, and maintain accountability records. This notice explains what we collect, why we keep it, and how to ask about your data.`
- Primary CTA: `Contact support about your data`
- Secondary CTA: `Track a package`
- Trust note: `Customer data is not used for unrelated marketing automation in the pilot.`

Visual requirements:
- Data boundary visual must be abstract and privacy-safe.
- Do not show real people, faces, phone numbers, addresses, maps, or proof thumbnails.
- If labels appear in the visual, use real DOM text.

Accessibility:
- Hero visual must be decorative unless labels are important.
- CTA labels must be specific and keyboard accessible.

### `PublicPrivacySummary`
Purpose:
- Give a short, memorable summary before detailed policy sections.

Layout:
- Four summary cards.

Cards:
1. `Only for the delivery job`
   - Body: `Kra stores data needed to move packages, confirm payment, resolve issues, and keep accountability records.`
2. `Tracking is privacy-safe`
   - Body: `Public tracking shows verified milestones, not internal notes, staff IDs, or precise live GPS trails.`
3. `Proof is restricted`
   - Body: `Proof photos and signatures are controlled assets, not public tracking content.`
4. `Retention is defined`
   - Body: `Delivery, issue, payment, proof, and route records have specific retention periods.`

Design:
- Cards should be concise and high contrast.
- Avoid generic "secure by design" statements unless followed by concrete practice.

### `PublicPrivacyDataCategories`
Purpose:
- Show what Kra collects and why.

Layout:
- Grouped card grid with sensitivity labels.

Required groups:
1. `Identity and contact`
2. `Delivery and address`
3. `Payment and refund`
4. `Proof and dispute`
5. `Route and operational`
6. `Support and audit`

Group content:
- Identity and contact:
  - Data: `sender name`, `receiver name`, `phone number`
  - Use: `identify delivery contacts and protect receiver access`
- Delivery and address:
  - Data: `origin station`, `destination station`, `receiver address`, `delivery instructions`
  - Use: `move the package and support doorstep or pickup delivery`
- Payment and refund:
  - Data: `payment status`, `provider`, `provider reference`, `refund status`
  - Use: `confirm payment, reconcile charges, and resolve refunds`
- Proof and dispute:
  - Data: `proof photo`, `signature`, `OTP proof metadata`, `condition record`
  - Use: `complete delivery and resolve disputes`
- Route and operational:
  - Data: `route snapshot`, `station milestone`, `courier event`, `GPS snapshot where allowed`
  - Use: `support operations and investigate exceptions`
- Support and audit:
  - Data: `support issue`, `case note`, `audit trail`, `admin action`
  - Use: `resolve issues and prevent silent changes`

Privacy copy:
- Do not use "we collect everything" language.
- Do not imply the public user can see all listed data.

### `PublicPrivacyWhyWeUseData`
Purpose:
- Explain the lawful/product reasons in customer language.

Required headings:
- `Move the package`
- `Confirm payment`
- `Verify handoffs`
- `Complete delivery with proof`
- `Resolve support and disputes`
- `Prevent fraud and misuse`
- `Meet audit and finance obligations`

Each heading must include:
- One short explanation.
- One example of data used.
- One privacy boundary.

Example:
- Heading: `Verify handoffs`
- Explanation: `Kra records scan and handoff events so the package has a clear chain of accountability.`
- Data used: `package scan, actor role, timestamp`
- Boundary: `Public users do not see staff IDs or internal audit notes.`

### `PublicPrivacyTrackingBoundaries`
Purpose:
- Make public tracking privacy boundaries impossible to miss.

Layout:
- Two-column comparison:
  - `Public tracking can show`
  - `Public tracking never shows`

Can show:
- `Current delivery status`
- `Latest verified milestone`
- `Pickup readiness`
- `Doorstep attempt outcome`
- `Limited ETA language when confidence is high enough`
- `Receiver-safe next step`

Never shows:
- `Internal notes`
- `Staff IDs or staff names beyond role labels`
- `Precise live GPS trails`
- `Payment internals`
- `Refund reasoning`
- `Raw proof photos or signatures`
- `Audit records`

Required note:
`Kra tracking is event-first. Verified delivery events matter more than a noisy moving dot.`

### `PublicPrivacyProofAndLocationControls`
Purpose:
- Explain proof and location controls in plain language.

Subsections:
1. `Proof photos and signatures`
2. `Route and GPS snapshots`
3. `Phone verification`

Proof content:
- `Proof photos and signatures are highly restricted. They are stored through backend-controlled upload paths and are not directly readable by public clients.`
- `Public views may show proof status or proof type, not raw proof images or signature files.`

Route/GPS content:
- `GPS and route snapshots are short-retention operational records. They are used for route support and exception investigation, not public live tracking.`
- `Public users do not see precise live GPS trails.`

Phone verification content:
- `Receiver-sensitive access may require phone verification tied to the delivery. This helps prevent a tracking link from exposing receiver-only actions to the wrong person.`

Design:
- Use a three-card control system.
- Each card must include `What it protects`, `How Kra handles it`, and `What public users see`.

### `PublicPrivacyRetentionTable`
Purpose:
- Make retention periods scannable and exact.

Layout:
- Desktop: accessible table or card-table hybrid.
- Mobile: stacked retention cards.

Required rows:
- `Delivery summary` -> `24 months`
- `Issue and audit history` -> `24 months`
- `Payment and refund records` -> `36 months`
- `Proof images and signatures` -> `180 days unless tied to active dispute, then 24 months`
- `GPS and route snapshots` -> `30 days`

Required note:
`Retention periods are the active build baseline until replaced by formal legal review.`

Do not add extra retention periods without product/legal decision.

### `PublicPrivacyAccessAndSharing`
Purpose:
- Explain who can access what.

Required access groups:
- `Sender and receiver`
- `Station, driver, and courier staff`
- `Support and finance`
- `Admins`
- `Payment providers`
- `Cloud infrastructure providers`

Content rules:
- Sender and receiver: `see delivery-safe information for their role and verification state`.
- Staff: `see only what their role, station, or assignment requires`.
- Support and finance: `access payment, refund, and issue data needed for review`.
- Admins: `access controlled operational data with audit logging`.
- Payment providers: `receive payment information needed to process and verify payment`.
- Cloud providers: `host infrastructure, storage, logs, and security controls`.

Do not claim data is never shared. State limited operational sharing instead.

### `PublicPrivacyAnalyticsControls`
Purpose:
- Explain privacy-safe analytics.

Required content:
- `Kra uses analytics to understand product usage and operational health.`
- `Analytics must not include raw proof assets, full phone numbers, receiver addresses, payment references, support narratives, or tracking codes.`
- `Privacy page analytics should be limited to page views, section views, CTA clicks, and FAQ opens.`

Allowed public analytics:
- `public_privacy_viewed`
- `public_privacy_section_viewed`
- `public_privacy_support_cta_clicked`
- `public_privacy_track_cta_clicked`
- `public_privacy_faq_opened`

Forbidden analytics payloads:
- phone number
- address
- tracking code
- payment reference
- proof content
- support message
- receiver name
- provider payload

### `PublicPrivacyExportDeletionRequests`
Purpose:
- Tell users how to ask about their data without overpromising deletion.

Layout:
- Step cards:
  1. `Contact support`
  2. `Kra verifies the request`
  3. `Kra checks retention obligations`
  4. `Kra exports, archives, deletes, or explains what must be retained`

Required copy:
- `Sender data export requests go through support.`
- `Deletion requests are reviewed against dispute, audit, and payment-retention obligations.`
- `Proof assets and GPS data should be archived or deleted first when eligible.`
- `Kra cannot delete records immediately when they are needed for active disputes, audit trails, payment reconciliation, refunds, fraud prevention, or required retention.`

Primary CTA:
- `Contact support about your data`

Do not include a form unless real support backend behavior exists.

### `PublicPrivacySecurityPractices`
Purpose:
- Summarize concrete security controls without exposing implementation secrets.

Required cards:
1. `Role-based access`
   - `Staff access is scoped by role, station, assignment, or admin permissions.`
2. `Audit trails`
   - `Privileged actions generate records so silent changes can be investigated.`
3. `Controlled proof storage`
   - `Proof uploads use backend-created controlled paths and short-lived upload access.`
4. `Payment callback protection`
   - `Payment callbacks are verified before trusted payment state changes.`
5. `Alerting`
   - `Authentication anomalies, webhook signature failures, repeated duplicate scans, and proof-access anomalies generate alerts.`

Do not expose:
- credential names
- storage bucket names
- security secrets
- raw signed URL structure
- provider signature algorithms unless already public and approved

## FAQ Content
### Required Questions
Render these questions in this order:

1. `What data does Kra collect?`
2. `Why does Kra need my phone number?`
3. `Can receivers track without a Kra account?`
4. `Does public tracking show live GPS?`
5. `Can public users see proof photos or signatures?`
6. `How long does Kra keep delivery data?`
7. `Does Kra use my data for marketing automation?`
8. `Can I export my data?`
9. `Can I delete my data?`
10. `Who can access my data?`

### Required Answers
Question: `What data does Kra collect?`

Answer: `Kra collects data needed to move packages, confirm payment, protect handoffs, resolve issues, and maintain accountability. This includes names, phone numbers, delivery details, payment records, proof records, route snapshots, support history, and audit records where needed.`

Question: `Why does Kra need my phone number?`

Answer: `Phone numbers help identify delivery contacts, send receiver tracking or verification, and protect sensitive receiver actions from the wrong person.`

Question: `Can receivers track without a Kra account?`

Answer: `Yes. Receivers do not need a full account in v1. Receiver access is delivery-scoped and may require phone verification.`

Question: `Does public tracking show live GPS?`

Answer: `No. Public tracking is event-first. It may show verified milestones and limited ETA language, but it does not show precise live GPS trails.`

Question: `Can public users see proof photos or signatures?`

Answer: `No. Proof photos and signatures are controlled assets. Public views may show proof status or proof type where appropriate, not raw proof files.`

Question: `How long does Kra keep delivery data?`

Answer: `Delivery summaries and issue/audit history are kept for 24 months. Payment and refund records are kept for 36 months. Proof images and signatures are kept for 180 days unless tied to active dispute, then 24 months. GPS and route snapshots are kept for 30 days.`

Question: `Does Kra use my data for marketing automation?`

Answer: `Customer data is not used for unrelated marketing automation in the pilot.`

Question: `Can I export my data?`

Answer: `Senders may request personal-data export through support. Kra may need to verify the request before preparing export.`

Question: `Can I delete my data?`

Answer: `You may request deletion review through support. Kra reviews deletion requests against dispute, audit, payment, refund, fraud-prevention, and retention obligations.`

Question: `Who can access my data?`

Answer: `Access depends on role and need. Senders, receivers, staff, support, finance, admins, payment providers, and infrastructure providers only get the data needed for their delivery, support, payment, security, or operational responsibilities.`

## Final CTA
Component: `PublicPrivacyFinalCta`

Purpose:
- Route users to support or tracking after they understand the policy.

Required copy:
- Heading: `Have a privacy or data request?`
- Body: `Contact support if you need export help, deletion review, or a privacy question answered. If you only need package progress, use tracking.`
- Primary CTA: `Contact support about your data`
- Secondary CTA: `Track a package`

Design:
- Calm and practical.
- Include one compact reminder: `Deletion may require review when records are needed for disputes, audit trails, payment records, or refunds.`

## State Requirements
### Normal
Must render:
- Header.
- Hero.
- Summary.
- Data categories.
- Data-use reasons.
- Tracking boundaries.
- Proof and location controls.
- Retention table.
- Access and sharing section.
- Analytics controls.
- Export/deletion request section.
- Security practices.
- FAQ.
- Final CTA.
- Footer.

### Degraded Marketing Asset Load
If decorative images or textures fail:
- Content must remain fully readable.
- No layout shift larger than `0.1` CLS contribution.
- Decorative visual areas may become plain cards.

### No Form State
This page does not have:
- form loading
- form submitted
- form error
- export pending
- deletion pending

Those states belong to support or authenticated account surfaces when implemented.

## Interaction Requirements
### Retention Cards
- Retention rows may expand to show public reason, but the period must be visible before expansion.
- Accordion buttons must expose `aria-expanded`.
- Keyboard users must be able to open and close sections.

### CTA Interaction
- Primary CTA routes to `/support`.
- Secondary CTA routes to `/track`.
- Terms CTA routes to `/terms`.
- Links must preserve normal browser behavior.
- Visible focus required.

### FAQ Interaction
- FAQ may use accordions.
- FAQ must be keyboard accessible.
- FAQ open state must not hide required privacy content from the main page.

### Motion
Allowed:
- Hero reveal.
- Data category cards fade in.
- Retention cards subtle reveal.

Rules:
- Motion must use transform and opacity.
- Duration: `180ms` to `420ms`.
- Respect `prefers-reduced-motion`.
- Do not animate sensitive-data cards in a way that feels like surveillance or scanning.

## Accessibility Requirements
### Structure
- Use one `h1`.
- Maintain logical heading order.
- Each policy topic must have a semantic section heading.
- Retention information must be understandable linearly.

### Contrast
- Body text contrast at least WCAG AA.
- Sensitivity labels must meet contrast requirements.
- Do not use pale grey for retention periods or warnings.

### Keyboard
- All links, accordions, and menu controls must be keyboard accessible.
- Focus state must be visible.
- Skip link should jump to main content.

### Screen Reader
- Decorative visuals must be `aria-hidden`.
- Retention periods must be real text.
- Sensitivity labels must not rely on color alone.
- Comparison lists must be announced as lists, not visual columns only.

### Large Text
- Page must survive `200%` browser zoom.
- Retention cards must wrap without clipping.
- CTA buttons must not overlap.

### Reduced Motion
- Disable staggered reveals.
- Keep content visible without animation.

## Responsive Requirements
### Breakpoints
- Mobile: `< 640px`
- Tablet: `640px` to `1023px`
- Desktop: `1024px+`

### Mobile Rules
- Hero headline line length must stay controlled.
- Data category cards stack.
- Tracking comparison stacks with `Can show` first and `Never shows` second.
- Retention table becomes cards.
- Access/sharing groups stack.
- Final CTA stacks.

### Desktop Rules
- Hero uses 12-column grid.
- Data category grid can use three columns.
- Proof/location controls can use three cards in one row.
- Retention table can use card-table hybrid.
- FAQ max width should remain readable.

## Data And Content Rules
### Static Policy Data
The page can define static policy data from docs:
- Sensitive data categories.
- Data use reasons.
- Tracking boundaries.
- Proof and location controls.
- Retention periods.
- Access and sharing groups.
- Analytics controls.
- Export/deletion flow.
- Security practice summaries.

### No Live Account Data
The page must not load:
- user profile
- delivery record
- receiver phone
- address
- payment record
- proof asset
- support issue
- audit record

### No Sensitive Examples
Do not include illustrative personal data. No phone numbers, addresses, payment references, names, tracking codes, proof IDs, or staff IDs.

## Analytics Requirements
Track only privacy-safe public events:
- `public_privacy_viewed`
- `public_privacy_section_viewed`
- `public_privacy_support_cta_clicked`
- `public_privacy_track_cta_clicked`
- `public_privacy_terms_cta_clicked`
- `public_privacy_faq_opened`

Event properties:
- `screen_id`
- `route`
- `section_id`
- `cta_id`
- `faq_question_id`

Do not track:
- phone number
- address
- tracking code
- delivery ID
- payment reference
- provider reference
- proof content
- support message
- receiver name
- sender name
- staff identity

## SEO Requirements
### Metadata
Title:
- `Privacy Policy | Kra`

Description:
- `Learn how Kra handles delivery data, payment records, proof assets, tracking visibility, retention periods, analytics, export requests, and deletion review.`

Canonical:
- `/privacy`

### Open Graph
Title:
- `Kra Privacy Policy`

Description:
- `Clear privacy and data retention rules for Kra delivery, tracking, payment, proof, support, and audit records.`

### Structured Content
- Use semantic sections and headings.
- FAQ structured data may be added only if product/legal approves and answers match visible content exactly.
- Do not add structured data that implies legal rights beyond approved policy.

## Performance Requirements
- Page must not require JavaScript to read the privacy notice.
- Initial content should be server-renderable or statically renderable.
- Avoid heavy animation libraries.
- Use CSS for visual texture where possible.
- No third-party privacy widgets unless approved and functional.
- Decorative assets must be optimized and lazy-loaded.

Targets:
- Largest Contentful Paint target: under `2.5s` on a mid-tier mobile device.
- Cumulative Layout Shift target: under `0.1`.
- Interaction to Next Paint target: under `200ms` for accordions and CTA interactions.

## Security And Privacy Requirements
- Public page must not call authenticated APIs.
- Public page must not expose internal IDs or sensitive records.
- Public page must not embed unapproved analytics or trackers.
- Public page must not collect privacy request details without a real backend.
- Public page must not include real operational records.
- Public page must not expose security implementation secrets.

## Error Prevention Rules
The UI must prevent these misunderstandings:
- User thinks Kra does not collect any personal data.
- User thinks deletion is unconditional.
- User thinks public tracking shows precise live GPS.
- User thinks public tracking shows proof photos or signatures.
- User thinks receiver tracking gives account-wide access.
- User thinks support can bypass payment, refund, audit, or dispute retention.
- User thinks analytics can include phone numbers or tracking codes.

Recommended copy qualifiers:
- `when needed`
- `where appropriate`
- `may require verification`
- `reviewed against retention obligations`
- `delivery-scoped`
- `not public tracking content`

Avoid:
- `always deleted`
- `anonymous`
- `live location`
- `fully public`
- `no records kept`

## Testing Requirements
### Unit/Component Tests
Create tests that verify:
- Page renders `screen-public-privacy`.
- Hero headline is visible.
- Primary CTA links to `/support`.
- Secondary CTA links to `/track`.
- Terms CTA links to `/terms`.
- Sensitive data categories render.
- Public tracking boundaries render.
- Proof controls render.
- Retention table renders all required rows.
- `24 months` delivery summary retention renders.
- `24 months` issue and audit retention renders.
- `36 months` payment and refund retention renders.
- `180 days` proof retention renders.
- `24 months` active-dispute proof retention renders.
- `30 days` GPS and route snapshot retention renders.
- Export/deletion section renders.
- Analytics controls render.
- Page does not render a privacy form.
- Page does not call authenticated APIs.

### Accessibility Tests
Run automated checks for:
- No heading order violations.
- No unlabeled buttons.
- No inaccessible accordion controls.
- No low-contrast text.
- No keyboard traps.
- Retention periods are reachable by screen reader.

Manual keyboard checklist:
- Tab through header, CTAs, retention expanders if present, FAQ, and footer.
- Activate every accordion with keyboard.
- Confirm focus order follows visual order.
- Confirm mobile menu close returns focus correctly.

### Visual Regression Tests
Capture:
- Desktop normal.
- Tablet normal.
- Mobile normal.
- Mobile with retention card expanded.
- FAQ expanded state.
- Reduced motion.
- High contrast mode where supported.

### Content Regression Tests
Assert the page does not include:
- `delete anytime`
- `instant deletion`
- `anonymous tracking`
- `live GPS for everyone`
- `public proof photos`
- `complete anonymity`
- `no retention`
- `we never collect personal data`

### Policy Alignment Tests
Assert:
- Page states delivery data is used to move packages, confirm payment, resolve issues, and maintain accountability.
- Page states no unrelated marketing automation in pilot.
- Page lists personal names and phone numbers.
- Page lists addresses and delivery instructions.
- Page lists payment references.
- Page lists proof images and signatures.
- Page lists operational location data.
- Page states delivery summary retention is `24 months`.
- Page states issue and audit history retention is `24 months`.
- Page states payment and refund record retention is `36 months`.
- Page states proof images and signatures retention is `180 days` unless tied to active dispute, then `24 months`.
- Page states GPS and route snapshot retention is `30 days`.
- Page states deletion requests are reviewed against obligations.
- Page states public tracking does not show precise live GPS.
- Page states public views do not show raw proof photos or signatures.

## Implementation Notes For Claude Code
### File Placement
Expected route implementation:
- `apps/web/src/routes/privacy` or the app's equivalent routing convention.

Expected shared components:
- Reuse public header/footer from prior public specs.
- Reuse public CTA/button primitives.
- Reuse policy card, accordion, comparison, and section primitives only if accessible.

### Do Not Build
Do not build:
- privacy request form
- cookie preference center
- account privacy settings
- export download flow
- deletion workflow
- live data viewer
- proof asset viewer
- staff/admin privacy audit console

Those are separate surfaces if approved later.

### Build With Real Policy Content
All user-facing content must come from this spec and local docs. Do not insert invented personal records, invented support cases, invented proof files, invented addresses, invented phone numbers, or invented provider records.

### Copy Constants
Recommended content constants:
- `PRIVACY_SUMMARY_CARDS`
- `PRIVACY_DATA_CATEGORIES`
- `PRIVACY_USE_REASONS`
- `PUBLIC_TRACKING_BOUNDARIES`
- `PROOF_LOCATION_CONTROLS`
- `PRIVACY_RETENTION_ROWS`
- `PRIVACY_ACCESS_GROUPS`
- `PRIVACY_ANALYTICS_RULES`
- `PRIVACY_REQUEST_STEPS`
- `PRIVACY_FAQ`

Keep constants close to the route unless the team already has a content module convention.

## Design Quality Review
Before closing implementation, review the screen from five perspectives:

Founder:
- Does this make Kra feel like a serious delivery company with real privacy discipline?

Skeptical sender:
- Can I understand what data is collected, why, and how long it stays?

Receiver:
- Can I understand tracking-link privacy and phone verification without creating an account?

Support/admin operator:
- Does public copy match retention, proof, tracking, security, and analytics constraints?

Accessibility reviewer:
- Can I read and navigate the data categories, retention periods, and request path without color, mouse, or animation?

If any answer is weak, revise before shipping.

## Content QA Checklist
- Headline is specific and not generic.
- Sensitive categories are visible before retention.
- Retention periods match `docs/08-security/privacy-and-data-retention.md`.
- Tracking limits match `docs/04-features/tracking-spec.md`.
- Proof controls match `docs/06-architecture/security-architecture.md`.
- Analytics restrictions match `docs/11-analytics/events-tracking-plan.md`.
- Export and deletion request wording does not overpromise.
- Copy does not imply precise live GPS is public.
- Copy does not imply raw proof files are public.
- Copy does not expose internal IDs.

## Source Alignment
This spec is grounded in:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/06-architecture/security-architecture.md`
- `docs/04-features/tracking-spec.md`
- `docs/07-data/data-model.md`
- `docs/07-data/firestore-schema.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/05-design/copy-deck.md`

The screen must not contradict those sources.

## Spec Quality Review
### Completeness
Pass. The spec covers screen contract, route behavior, page IA, visual system, copy system, sensitive-data categories, retention periods, tracking boundaries, proof and location controls, access/sharing, analytics, export/deletion requests, security practices, FAQ, accessibility, SEO, testing, and implementation boundaries.

### Policy Accuracy
Pass. The spec uses the approved privacy and retention baseline, security architecture, tracking visibility rules, analytics privacy rule, and data model constraints.

### Backend Boundary
Pass. The spec does not require authenticated APIs, live account data, privacy request forms, export downloads, deletion workflows, proof viewers, or admin tools on the public page.

### UX Quality
Pass. The spec requires data categories before retention, exact retention periods, tracking boundaries, proof controls, and export/deletion request path before FAQ.

### Copy Quality
Pass. The spec uses clear, direct, low-hype privacy language and rejects vague or impossible privacy promises.

### Accessibility
Pass. The spec requires semantic headings, keyboard-safe expanders, accessible retention content, contrast, reduced motion, large text, and no color-only meaning.

### Implementation Readiness
Pass. Claude Code can build this screen from the named components, content constants, interaction rules, and test requirements without needing hidden product decisions.

### Close Decision
Closed for implementation. This file is full enough for Claude Code to build `PublicPrivacy` end to end as a public, privacy-safe, retention-accurate policy page without creating frontend UI in this docs pass.

# Public Partners Screen Spec

## Screen Contract

| Field              | Value                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Screen ID          | `PublicPartners`                                                                              |
| App                | `apps/web`                                                                                    |
| Route              | `/partners`                                                                                   |
| Primary test ID    | `screen-public-partners`                                                                      |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                 |
| Build priority     | `P2 Post-Pilot` for scaled partner intake; `P1` for public interest and support routing       |
| Backend dependency | none for v1; partner interest routes through public support contact until intake API exists   |
| Related routes     | `/about`, `/coverage`, `/service-areas`, `/trust-and-custody`, `/support`, `/delivery-policy` |
| Required states    | `normal`, `submitted`, `support_unavailable`, `degraded_marketing_asset_load`                 |

## Product Job

This page explains how potential station, fleet, courier, business, and operating partners can understand Kra's standards and express interest without bypassing launch readiness or operational validation.

The page must answer:

- What kinds of partners Kra works with.
- What standards partners must meet.
- Why station validation, custody discipline, payment controls, and support readiness come before expansion.
- How interested partners contact Kra in v1.
- What Kra does not approve automatically.

The page must support growth without weakening the operating model.

## Audience

Primary audience:

- Station owners or managers interested in becoming Kra stations.
- Fleet operators interested in inter-station transport.
- Independent couriers interested in final-mile work.
- Local businesses exploring repeat sender or partner relationships.

Secondary audience:

- Operations leaders screening partner interest.
- Support staff receiving partner inquiries.
- Admins validating public promises against station readiness policy.
- Claude Code implementing the partner page.

## User State

Partner visitors may be ambitious and may expect a quick signup form. The page must be clear that Kra is not an open marketplace at v1. Partners enter a review path because station discipline and custody evidence are core to the product.

The page should feel selective and professional, not closed or vague.

## Primary Action

Primary CTA: `Register partner interest`

Secondary CTA: `See operating standards`

Tertiary CTA: `View coverage model`

CTA behavior:

- `Register partner interest` routes to `/support?intent=partner`.
- `See operating standards` scrolls to partner requirements.
- `View coverage model` routes to `/coverage`.
- No CTA can imply instant onboarding, automatic approval, public marketplace participation, or guaranteed work volume.

## Visual Thesis

Design this page as a partner qualification surface for an accountable logistics network. It should feel selective, operational, and high-trust: a calm grid of partner paths, standards, evidence, and next steps rather than a salesy application page.

## Restraint Rule

Do not show generic handshake photos, invented partner logos, marketplace dashboards, driver earnings guarantees, station revenue promises, or onboarding forms that imply backend approval. The page must not feel like a loose recruitment funnel.

## Research Inputs

Use these principles without copying layout:

- GOV.UK interface writing guidance: clear action labels and user-language section titles.
- GOV.UK service navigation guidance: related service pages must be discoverable.
- W3C WCAG 2.2: focus visibility, headings, labels, and accessible forms.
- NN/g corporate information guidance: key facts and credibility information must be scannable.

## Page Information Architecture

1. Hero: partner thesis and selective network message.
2. Partner paths: station, fleet, final-mile, business, support ecosystem.
3. Operating standards: validation, custody, payment, support, evidence.
4. Review process: interest, screening, validation, pilot approval, activation.
5. What Kra will not approve automatically.
6. Coverage and expansion context.
7. Partner inquiry guidance.
8. FAQ.
9. Closing CTA.

## Hero Requirements

Hero headline:

`Build delivery infrastructure with discipline`

Hero body must explain:

- Kra works with partners who can protect packages, follow scan-backed handoffs, and support reliable station or transport operations.
- Partner growth is controlled by readiness.
- Interest starts through support until a dedicated intake workflow exists.

Hero CTAs:

- Primary: `Register partner interest`
- Secondary: `See standards`

Hero trust row:

- `Station validation`
- `Scan-backed custody`
- `Payment controls`
- `Support accountability`

## Partner Path Cards

Required partner paths:

| Partner Path        | Public Description                                                            | Required Limit                                          |
| ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Station partners    | Local operating points for intake, receipt, and handoff discipline.           | No automatic station approval.                          |
| Fleet partners      | Transport operators for controlled inter-station movement.                    | No guaranteed route volume.                             |
| Final-mile couriers | Delivery personnel for doorstep completion around destination stations.       | No guaranteed earnings or assignments.                  |
| Business partners   | Repeat senders and merchants who need accountable station delivery.           | No enterprise portal or invoicing claim in v1.          |
| Support ecosystem   | Local operators who help with customer communication or exception resolution. | No access to restricted delivery data without approval. |

Each card must include:

- Who it is for.
- What good partnership requires.
- What Kra reviews.
- Primary next action.

## Operating Standards Section

Standards must cover:

- Identity and role verification.
- Station scope and physical readiness.
- Package handling discipline.
- Scan and label handling.
- Custody evidence.
- Payment-before-dispatch.
- Issue escalation.
- Data privacy.
- Customer communication.
- Pilot validation.

The page must tie standards to customer trust rather than bureaucracy.

## Review Process

Render as a five-step process:

1. Partner submits interest through support.
2. Kra reviews fit, location, role, and operating readiness.
3. Kra requests evidence or schedules operational validation.
4. Approved partner enters pilot onboarding or station validation.
5. Activated partner receives role-specific access through the staff onboarding path.

The page must state that v1 partner interest does not create an account, grant access, or approve station operations.

## Unsupported Partner Claims

The page must not claim:

- instant station approval.
- automatic driver or courier onboarding.
- guaranteed route volume.
- guaranteed earnings.
- public franchise package.
- marketplace listing.
- backend partner dashboard.
- self-serve contract signing.
- insurance underwriting.
- financing.

If these topics appear in user-facing copy, they must be framed as unavailable in v1.

## Inquiry Guidance

The partner support path must ask for safe, useful information:

- Partner type.
- City or station area.
- Operating hours.
- Facilities or vehicle type.
- Contact name and business contact.
- Relevant experience.
- Route or corridor interest.

The page must warn users not to include:

- payment PINs.
- receiver OTPs.
- customer private data.
- full package contents for sensitive goods.
- staff credentials.

## Visual System Rules

Layout:

- Hero plus partner path grid.
- Standards as a structured checklist.
- Review process as a stepper.
- FAQ near bottom.
- Closing CTA with support intent.

Desktop:

- Use a two-column standards area: standard label and why it matters.
- Keep partner cards equal height only if content remains readable.

Mobile:

- Use single-column cards.
- Keep the partner inquiry CTA sticky only after the first standards section has passed.
- Avoid dense forms on this page.

Motion:

- Use restrained stagger for partner cards.
- Disable under reduced motion.
- No celebratory confetti or animated approval sequence.

## Accessibility Requirements

The page must:

- Use one `h1`.
- Use headings for each partner path.
- Use real lists for standards and process steps.
- Keep CTA labels unique.
- Preserve visible keyboard focus.
- Avoid color-only partner status indicators.
- Make the support intent route reachable by keyboard.
- Support high contrast, large text, and reduced motion.

## SEO Requirements

Page title:

`Partner With Kra | Stations, Fleets, Couriers, And Business Senders`

Meta description:

`Learn how stations, fleet operators, couriers, and business senders can express interest in partnering with Kra's scan-backed delivery network.`

Canonical URL:

`/partners`

Required searchable phrases:

- `delivery partners`
- `station partners`
- `fleet partners`
- `courier partners`
- `partner with Kra`

## Analytics Events

Required events:

| Event Name                       | Trigger                      | Properties              |
| -------------------------------- | ---------------------------- | ----------------------- |
| `public_partners_viewed`         | page view                    | `route`, `surface`      |
| `public_partners_cta_clicked`    | CTA click                    | `cta`, `destination`    |
| `public_partner_path_selected`   | partner path interaction     | `partnerPath`           |
| `public_partner_standard_opened` | standard detail interaction  | `standardKey`           |
| `public_partner_support_click`   | partner support route opened | `intent`, `partnerPath` |

Analytics must not collect free-text partner descriptions, phone numbers, email addresses, staff IDs, or private customer data.

## Test Requirements

Unit and component tests:

- Renders root with `screen-public-partners`.
- Partner path cards render for station, fleet, final-mile, business, and support ecosystem.
- Primary CTA routes to `/support?intent=partner`.
- Standards section renders.
- Review process renders in correct order.
- Unsupported claims are absent from visible copy.
- Reduced-motion mode disables card stagger.

Accessibility tests:

- One `h1`.
- Partner path headings are navigable.
- Process stepper uses ordered list semantics.
- CTA focus states are visible.
- Color is not the only standard status signal.

End-to-end checks:

- Visitor opens `/partners`.
- Visitor selects station partner path.
- Visitor opens support with partner intent.
- Visitor navigates to coverage and trust/custody pages.
- No account creation, partner approval, or admin access is triggered.

## Final Implementation Decisions

`/partners` is an interest and qualification page, not a self-serve onboarding product.

All partner interest must route through support until a dedicated partner intake backend exists.

The page must describe standards and review steps without promising approval, volume, revenue, route access, or staff credentials.

## Definition Of Done

The screen is complete when:

- It renders at `/partners`.
- It exposes `screen-public-partners`.
- It is listed in the public web inventory and exact route map.
- It explains partner paths, standards, review process, and limits.
- It routes partner interest to public support with partner intent.
- It avoids unsupported partner approval, earnings, portal, and marketplace claims.
- It passes accessibility, responsive, SEO, analytics, and policy-link tests.

## Final Build Instruction

Build `PublicPartners` as Kra's public partner qualification page. It must attract serious station, fleet, courier, and business partners while protecting the operating model: no automatic approval, no unsupported work guarantees, and no bypass around validation, custody, payment, support, or role access controls.

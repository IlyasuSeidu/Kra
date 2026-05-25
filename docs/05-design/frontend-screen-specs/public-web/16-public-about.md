# Public About Screen Spec

## Screen Contract

| Field              | Value                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Screen ID          | `PublicAbout`                                                                                |
| App                | `apps/web`                                                                                   |
| Route              | `/about`                                                                                     |
| Primary test ID    | `screen-public-about`                                                                        |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                |
| Build priority     | `P1 Operational Completeness`                                                                |
| Backend dependency | none                                                                                         |
| Related routes     | `/`, `/how-it-works`, `/trust-and-custody`, `/coverage`, `/partners`, `/support`, `/privacy` |
| Required states    | `normal`, `degraded_marketing_asset_load`, `reduced_motion_mode`                             |

## Product Job

This page explains why Kra exists, what operating principles guide the product, and how the company intends to solve delivery trust problems in Africa without overclaiming scale before the network is ready.

The page must answer:

- What Kra does.
- Who Kra serves.
- Why custody, station discipline, payment controls, and proof matter.
- What Kra believes about delivery infrastructure in Africa.
- How Kra expands responsibly.
- Where users should go next.

The page must build trust through clarity, not corporate vagueness.

## Audience

Primary audience:

- Senders deciding whether Kra is credible.
- Receivers checking whether a tracking link is from a serious operator.
- Business senders evaluating repeat use.
- Partners evaluating whether Kra's operating model fits them.

Secondary audience:

- Press, investors, operators, and future hires looking for company context.
- Support teams needing a public articulation of Kra's purpose.
- Claude Code implementing the public about page.

## User State

The user may have heard the name Kra but not understand the model. They may be wary of delivery companies that promise speed and then lose accountability between handoffs. They need a concise explanation of the company, the operating philosophy, and the reason for controlled launch scope.

## Primary Action

Primary CTA: `See how Kra works`

Secondary CTA: `Read trust and custody`

Tertiary CTA: `Check coverage`

CTA behavior:

- `See how Kra works` routes to `/how-it-works`.
- `Read trust and custody` routes to `/trust-and-custody`.
- `Check coverage` routes to `/coverage`.
- Partner CTA routes to `/partners`.
- Support CTA routes to `/support`.

## Visual Thesis

Design this page as a founder-quality company story for a logistics infrastructure product: editorial, grounded, and operationally specific. It should feel ambitious about Africa's delivery problems while staying humble about v1 coverage and concrete about package safety.

## Restraint Rule

Do not use generic startup slogans, invented history, office culture filler, unapproved team photos, unsupported scale numbers, or pan-African claims that exceed launch coverage. This page must earn trust with operating principles and specific product discipline.

## Research Inputs

Use these principles without copying layout:

- GOV.UK interface writing guidance: use plain user language and clear labels.
- W3C WCAG 2.2: preserve headings, focus visibility, readable structure, and accessible navigation.
- NN/g corporate information research: company pages should answer what the organization does and provide scannable credibility facts.
- NN/g navigation research: current location and clear route labels help users understand site structure.

## Page Information Architecture

1. Hero: what Kra is and why it exists.
2. Problem: delivery trust breaks at handoffs.
3. Operating model: station, driver, courier, receiver proof.
4. Principles: accountable custody, payment clarity, responsible coverage, support ownership.
5. Africa focus: solve real delivery constraints with local operating discipline.
6. What Kra is not.
7. Where to go next: how it works, coverage, trust, partners, support.
8. Closing statement.

## Hero Requirements

Hero headline:

`Kra is building accountable delivery infrastructure for Africa`

Hero body must explain:

- Kra is a station-based delivery network for senders, receivers, operators, and admins.
- The product focuses on custody evidence, payment confirmation, receiver-safe tracking, and proof-based completion.
- Kra expands route by route when operations are ready.

Hero CTAs:

- Primary: `See how Kra works`
- Secondary: `Check coverage`

Hero trust row:

- `Station-based network`
- `Scan-backed custody`
- `Payment-before-dispatch`
- `Receiver-safe proof`

## Company Explanation Section

Required copy points:

- Kra helps people and businesses send packages through an accountable station and handoff chain.
- The delivery object stays consistent across sender, receiver, station, driver, courier, support, finance, and admin surfaces.
- Kra's product discipline is designed to reduce loss, confusion, and unsupported status claims.
- Launch scope is controlled because reliability matters more than appearing broad.

This section must avoid founding-date, team-size, funding, or operating-country claims unless approved source data exists.

## Problem Section

Explain the real-world problem:

- Informal delivery often depends on personal trust and manual phone calls.
- Package state can become unclear between pickup, transport, station receipt, final-mile handoff, and receiver proof.
- Payment, refund, and dispute handling can become disconnected from delivery evidence.
- Receivers may lack a safe way to check status without exposing internal data.

The page must not attack specific competitors or informal operators.

## Operating Model Section

Render four operating pillars:

| Pillar              | Required Explanation                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| Stations            | Physical operating points for intake, receipt, assignment, and handoff discipline.      |
| Drivers             | Assigned transport actors for station-to-station movement.                              |
| Final-mile couriers | Doorstep actors who receive custody only after assignment and scan-backed acceptance.   |
| Receiver-safe proof | OTP, signature, or photo proof supports completion without exposing restricted records. |

Each pillar must link to a relevant page where possible:

- Stations and coverage: `/coverage` and `/service-areas`
- Handoffs: `/trust-and-custody`
- Delivery rules: `/delivery-policy`

## Principles Section

Required principles:

1. `Custody must be visible`
2. `Payment must be confirmed before transport`
3. `Coverage must be earned by readiness`
4. `Receivers deserve privacy-safe tracking`
5. `Issues and refunds need evidence`
6. `Growth must not weaken operations`

Each principle must include:

- One short statement.
- One operational example.
- One link to a deeper public page where available.

## Africa Focus Section

The Africa focus section must be ambitious but precise:

- Kra is built for the delivery constraints common across African markets: fragmented handoffs, station-based movement, inconsistent proof, payment uncertainty, and support gaps.
- The v1 launch proves the operating system on controlled routes before broader expansion.
- The goal is better delivery accountability, not visual scale.

Do not claim:

- continent-wide availability.
- regulatory approval in every market.
- full automation.
- drone, robot, or telematics operations.
- cross-border coverage.

## What Kra Is Not

Include a short clarity block:

- Not a ride-hailing map.
- Not a warehouse inventory system.
- Not a merchant marketplace.
- Not an enterprise invoice portal in v1.
- Not a promise of delivery everywhere.
- Not a replacement for legal, regulated transport requirements.

This section exists to prevent misunderstanding, not to reduce confidence.

## Visual System Rules

Layout:

- Editorial hero with operating proof rail.
- Problem section with concise contrast statements.
- Pillars as structured content, not a decorative icon grid.
- Principles as a scannable list with deep links.
- Closing navigation grid to key public pages.

Desktop:

- Use wide editorial rhythm, strong headings, and restrained proof panels.
- Keep line lengths readable.

Mobile:

- Put proof rail after hero copy and CTAs.
- Collapse principle examples only if the expanded content remains keyboard accessible.
- Avoid large decorative images that delay core content.

Motion:

- One gentle reveal for the operating model.
- Reduced motion disables reveal.
- No auto-playing video.

## Accessibility Requirements

The page must:

- Use one `h1`.
- Use semantic landmarks.
- Use ordered lists where sequence matters.
- Use descriptive link labels.
- Preserve visible focus states.
- Provide text alternatives for any informational diagram.
- Avoid autoplay media.
- Support high contrast, large text, and reduced motion.

## SEO Requirements

Page title:

`About Kra | Accountable Delivery Infrastructure For Africa`

Meta description:

`Learn why Kra is building a station-based delivery network with scan-backed custody, payment confirmation, receiver-safe tracking, and proof-based handoffs.`

Canonical URL:

`/about`

Required searchable phrases:

- `about Kra`
- `delivery infrastructure Africa`
- `station delivery network`
- `scan-backed custody`
- `receiver-safe tracking`

## Analytics Events

Required events:

| Event Name                    | Trigger                 | Properties               |
| ----------------------------- | ----------------------- | ------------------------ |
| `public_about_viewed`         | page view               | `route`, `surface`       |
| `public_about_cta_clicked`    | CTA click               | `cta`, `destination`     |
| `public_about_principle_open` | principle interaction   | `principleKey`           |
| `public_about_route_clicked`  | public route grid click | `destination`, `section` |

Analytics must not capture free-text support content, contact details, or any restricted operational data.

## Test Requirements

Unit and component tests:

- Renders root with `screen-public-about`.
- Primary CTA routes to `/how-it-works`.
- Coverage CTA routes to `/coverage`.
- Trust CTA routes to `/trust-and-custody`.
- Principles render in the required order.
- Unsupported scale claims are absent.
- Reduced-motion mode disables operating model reveal.

Accessibility tests:

- One `h1`.
- Link names are descriptive.
- Keyboard reaches all route-grid links.
- Focus states are visible.
- Informational visuals have text alternatives.

End-to-end checks:

- Visitor opens `/about`.
- Visitor navigates to how-it-works, trust/custody, coverage, partners, and support.
- Visitor can understand Kra without signing in.
- No unapproved scale, coverage, team, funding, or automation claims render.

## Final Implementation Decisions

`/about` is an operating-principles page, not a recruiting page, investor page, or press kit.

All claims must be based on approved product and policy docs. If company facts such as founding date, team size, funding, or office locations are unavailable, the page omits them.

The page must frame Africa delivery ambition through controlled operational discipline, not unsupported geographic breadth.

## Definition Of Done

The screen is complete when:

- It renders at `/about`.
- It exposes `screen-public-about`.
- It is listed in the public web inventory and exact route map.
- It explains Kra's mission, operating model, principles, and limits.
- It links to how-it-works, trust/custody, coverage, partners, support, privacy, and policy pages.
- It avoids unsupported company, coverage, scale, and automation claims.
- It passes accessibility, responsive, SEO, analytics, and route-link tests.

## Final Build Instruction

Build `PublicAbout` as Kra's public company story and operating-principles page. It must be ambitious about solving delivery issues in Africa while staying exact about v1: controlled routes, station discipline, scan-backed custody, payment confirmation, privacy-safe tracking, proof, support, and evidence-led growth.

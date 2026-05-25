# Public Coverage Screen Spec

## Screen Contract

| Field              | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Screen ID          | `PublicCoverage`                                                                        |
| App                | `apps/web`                                                                              |
| Route              | `/coverage`                                                                             |
| Primary test ID    | `screen-public-coverage`                                                                |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                           |
| Build priority     | `P1 Operational Completeness`                                                           |
| Backend dependency | station data when exposed; static approved launch coverage is allowed for v1            |
| Related routes     | `/service-areas`, `/how-it-works`, `/pricing`, `/track`, `/delivery-policy`, `/support` |
| Required states    | `loading`, `unavailable`, `normal`, `degraded_marketing_asset_load`                     |

## Product Job

This page explains how Kra coverage works before the user looks at individual stations. It must make the coverage model clear: Kra launches by controlled corridors and station readiness, not by broad city or country claims.

The page answers:

- Where Kra can operate at launch.
- How station-to-station coverage differs from doorstep delivery.
- Why a listed city does not mean every address is serviceable.
- How routes expand.
- What to do when a route, station, or final-mile address is unavailable.

`PublicCoverage` is the public coverage model page. `PublicServiceAreas` remains the directory-style page for approved service areas and station details.

## Audience

Primary audience:

- Senders checking whether Kra works for their route.
- Receivers checking whether doorstep delivery is realistic.
- Business senders planning recurring routes.

Secondary audience:

- Support staff who need precise public coverage copy.
- Operations leads validating expansion promises.
- Claude Code implementing the public coverage route.

## User State

Users arrive with one question: `Can Kra deliver there?`

They may assume:

- City coverage means address coverage.
- A station in a city means all nearby suburbs are covered.
- Doorstep delivery is always available.
- Coverage will be updated live like a ride-hailing map.

The page must correct those assumptions without making Kra feel small or uncertain.

## Primary Action

Primary CTA: `View service areas`

Secondary CTA: `Check tracking`

Tertiary CTA: `Ask about a route`

CTA behavior:

- `View service areas` routes to `/service-areas`.
- `Check tracking` routes to `/track`.
- `Ask about a route` routes to `/support?intent=coverage`.
- No CTA can imply live route quoting unless a backend quote or serviceability contract exists.

## Visual Thesis

Design this page as a clear coverage explainer with a restrained network-map feel: precise, geographic, and operational, but not flashy. The visual language should communicate controlled expansion, route confidence, and station discipline.

## Restraint Rule

Do not show speculative country-wide maps, animated vehicles, exact unapproved station pins, unsupported delivery-radius circles, or city badges that imply full city coverage. The page must avoid visual overclaiming.

## Research Inputs

Use these principles without copying layout:

- GOV.UK writing guidance: make service limits clear in user language.
- GOV.UK navigation guidance: make related service pages easy to find.
- W3C WCAG 2.2: preserve headings, focus visibility, keyboard access, and clear labels.
- NN/g navigation research: labels must be familiar and help users predict destination content.

## Page Information Architecture

1. Hero: controlled coverage statement and route to service areas.
2. Coverage model: corridor, station, and doorstep definitions.
3. Coverage confidence tiers: active, planned, unavailable.
4. How route availability is decided.
5. Doorstep service limits.
6. What happens when an area is not covered.
7. Expansion principles.
8. FAQ.
9. Closing CTA.

## Hero Requirements

Hero headline:

`Coverage that expands only when operations are ready`

Hero body must state:

- Kra operates through approved stations and corridors.
- Doorstep delivery depends on destination station serviceability.
- Coverage information must be honest before it is broad.
- Users should check approved service areas before creating a delivery.

Hero CTAs:

- Primary: `View service areas`
- Secondary: `Ask about a route`

Hero proof points:

- `Station-based launch`
- `Controlled corridors`
- `Doorstep service limits`
- `Expansion after validation`

## Coverage Model Section

Define these terms:

| Term                | Definition                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Launch corridor     | An approved origin and destination station pair that Kra operations can support.            |
| Origin station      | The station where package intake and label binding happen.                                  |
| Destination station | The station where driver handoff, receipt, and final-mile routing can happen.               |
| Station pickup      | Receiver or sender-facing pickup from the destination station when doorstep is unavailable. |
| Doorstep delivery   | Courier handoff near the destination station when serviceability and distance rules pass.   |
| Unavailable route   | A route Kra does not accept until station, payment, support, and handoff readiness exist.   |

This section must link `station pickup` and `doorstep delivery` to delivery policy copy when helpful.

## Coverage Confidence Tiers

Use three tiers:

| Tier          | User Meaning                                             | UI Treatment                                   |
| ------------- | -------------------------------------------------------- | ---------------------------------------------- |
| `active`      | Route or station is approved for launch operations.      | strongest treatment, CTA to service areas      |
| `planned`     | Route is under review or future expansion consideration. | muted treatment, no delivery-start CTA         |
| `unavailable` | Route is not supported for v1.                           | clear limit with support or waitlist direction |

If no backend station data exists:

- Render approved static launch content only.
- Mark content as `Launch coverage`.
- Do not show live availability timestamps.

If station data is unavailable:

- Show the coverage model.
- Hide specific station claims that require data.
- Show a support route for route questions.

## Doorstep Service Rules

The page must state:

- Doorstep delivery is final-mile service around a destination station.
- Doorstep availability is not the same as intercity route availability.
- Distance, station service settings, courier assignment, package status, payment state, and issue state affect final-mile availability.
- The sender must not assume doorstep service until the delivery flow confirms it.

Do not expose internal courier availability, capacity, live location, or assignment logic.

## Route Availability Decision Model

Explain that Kra accepts a delivery route only when:

- Origin station is active for intake.
- Destination station is active for receipt.
- Route pricing exists.
- Payment can be initialized and confirmed.
- Handoff path is supported.
- Support and issue handling are available.
- Launch validation has not blocked the station.

This is public explanation only. It must not expose admin readiness data, station validation internals, or unresolved P1 issue counts.

## Not Covered Path

When a route or area is unavailable, the page must direct users to:

- Try station pickup if doorstep is unavailable.
- Contact support with route details.
- Check coverage again later.
- Use only approved Kra routes.

The copy must not shame the user or imply failure. It must frame limits as part of safe operations.

## Expansion Principles

Expansion copy must say:

- Kra expands after station validation and operational readiness.
- Expansion depends on custody discipline, payment reliability, support capacity, and route demand.
- New coverage must not weaken package safety.

Expansion copy must not include:

- exact launch dates unless approved.
- unapproved city names.
- investor-style growth language.
- guaranteed rollout sequence.

## Visual System Rules

Layout:

- Use a hero plus coverage model diagram.
- Use three coverage tier panels.
- Use a clear route from coverage model to service area directory.
- On mobile, the coverage model must become a vertical stepper.

Map treatment:

- Static diagram is preferred.
- If a map is used, it must have accessible text alternatives and a list fallback.
- Pins must represent approved public stations only.
- Coverage areas must not imply exact radius unless policy-approved.

Motion:

- Use subtle path reveal for the coverage model.
- Reduced motion shows the full path without animation.
- No moving vehicle loops.

## Accessibility Requirements

The page must:

- Use one `h1`.
- Use semantic lists for coverage rules.
- Use table summaries where tables appear.
- Provide text alternatives for diagrams.
- Make tier labels visible in text, not color alone.
- Preserve keyboard focus and skip-link behavior.
- Keep map/list content reachable without pointer input.
- Support high contrast and reduced motion.

## SEO Requirements

Page title:

`Kra Coverage Model | Routes, Stations, And Doorstep Limits`

Meta description:

`Learn how Kra delivery coverage works through approved stations, launch corridors, and doorstep service limits before checking active service areas.`

Canonical URL:

`/coverage`

The page must include search-visible phrases:

- `delivery coverage`
- `launch corridors`
- `station delivery`
- `doorstep delivery`
- `service areas`

## Analytics Events

Required events:

| Event Name                      | Trigger              | Properties              |
| ------------------------------- | -------------------- | ----------------------- |
| `public_coverage_viewed`        | page view            | `route`, `surface`      |
| `public_coverage_cta_clicked`   | CTA click            | `cta`, `destination`    |
| `public_coverage_tier_selected` | tier interaction     | `tier`                  |
| `public_coverage_support_click` | support route click  | `intent`, `sourceRoute` |
| `public_coverage_service_areas` | service areas opened | `sourceSection`         |

Analytics must not collect address text, receiver phone, station staff data, or unsupported route free text without explicit support-form handling.

## Test Requirements

Unit and component tests:

- Renders root with `screen-public-coverage`.
- Primary CTA routes to `/service-areas`.
- Support CTA routes with coverage intent.
- Active, planned, and unavailable tier copy renders.
- Doorstep limits section renders.
- No live availability timestamp renders without station data.
- Reduced-motion mode disables path animation.

Accessibility tests:

- One `h1`.
- Tier states do not rely on color alone.
- Map or diagram has text fallback.
- Keyboard reaches all interactive elements.
- Focus indicators are visible.

End-to-end checks:

- Visitor opens `/coverage`.
- Visitor navigates to `/service-areas`.
- Visitor navigates to `/support?intent=coverage`.
- Visitor can reach pricing, tracking, and delivery policy pages.
- No unsupported station, route, ETA, or courier availability data renders.

## Final Implementation Decisions

`/coverage` is an explanatory page. `/service-areas` is the station and corridor directory.

The page can use static approved launch content until a public station coverage endpoint exists.

The page must not offer route quotes, live ETA, exact address serviceability, or courier availability.

## Definition Of Done

The screen is complete when:

- It renders at `/coverage`.
- It exposes `screen-public-coverage`.
- It is listed in the public web inventory and exact route map.
- It explains corridor, station, and doorstep coverage accurately.
- It links to `/service-areas` as the directory page.
- It handles unavailable station data without overclaiming.
- It passes accessibility, responsive, SEO, analytics, and policy-link tests.

## Final Build Instruction

Build `PublicCoverage` as the public explanation of Kra's controlled launch coverage model. It must make coverage feel trustworthy because it is specific and honest, not because it looks large.

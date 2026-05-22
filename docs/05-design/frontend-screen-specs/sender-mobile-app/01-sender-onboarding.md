# Sender Onboarding Screen Spec

## Screen Contract

| Field              | Value                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID          | `SenderOnboarding`                                                                                                             |
| App                | `apps/mobile`                                                                                                                  |
| Route              | `/(sender)/onboarding`                                                                                                         |
| Primary test ID    | `screen-sender-onboarding`                                                                                                     |
| Source inventory   | `docs/05-design/frontend-screen-inventory.md`                                                                                  |
| Build priority     | `P0 Launch Critical`                                                                                                           |
| Backend dependency | `auth`                                                                                                                         |
| Related routes     | `/(auth)/sender/sign-in`, `/(sender)/create`, `/(sender)/home`, `/track`, `/privacy`, `/terms`, `/delivery-policy`, `/pricing` |
| Required states    | `normal`                                                                                                                       |

## Product Job

This screen introduces a sender to Kra and moves them toward their first delivery with minimum friction. It must explain the station-based delivery model, the custody proof promise, payment-before-dispatch rule, tracking value, and phone OTP entry path without turning first launch into a long lesson.

The sender should leave this screen knowing:

- Kra moves packages through verified stations, drivers, and final-mile couriers.
- Every custody handoff needs evidence instead of verbal memory.
- The sender sees the price before payment.
- Dispatch starts only after payment is confirmed.
- Receivers track with delivery-scoped verification rather than full receiver accounts.
- The next action is to continue with phone OTP and start a delivery.

This screen is not a full sign-in form, quote calculator, delivery creation wizard, payment page, tracking timeline, policy center, support thread, station search, courier workflow, admin screen, or staff onboarding screen.

## Audience

Primary audience:

- First-time senders using the Kra mobile app.
- Repeat local merchants who send packages between pilot corridors.
- Individuals sending packages to family, customers, or business contacts.
- Small-business operators who need proof, payment clarity, and reliable handoffs.

Secondary audience:

- Returning senders who landed here after reinstalling the app or clearing local state.
- Support staff explaining the sender app first-run path.
- QA and Claude Code builders implementing the first mobile sender screen.

## User State

The sender is likely comparing Kra with informal courier handoffs, bus-station package sending, phone calls, and unreliable receiver updates. They may be worried about package loss, hidden fees, unclear driver accountability, and whether the receiver will actually know where to pick up.

The page must reduce anxiety quickly:

- Show the service model in one scan.
- Make custody accountability concrete.
- Keep the path to first delivery obvious.
- Avoid long brand theater before value.
- Avoid any form fields until the sender chooses to continue.

## Primary Action

Primary CTA:

- `Start sending`

Secondary CTA:

- `I already have an account`

Tertiary route:

- `Track a package`

CTA behavior:

- `Start sending` routes to `/(auth)/sender/sign-in` with intent `signup`.
- `I already have an account` routes to `/(auth)/sender/sign-in` with intent `signin`.
- `Track a package` opens the public tracking entry route when the mobile shell exposes it, otherwise opens the web public tracking route.
- The app may persist `sender_onboarding_seen=true` only after the sender taps a CTA, not on initial render.

## First Meaningful Value

First meaningful value for this onboarding path is not the final onboarding screen. It is the moment a sender reaches `/(sender)/create` with an authenticated session and can begin a delivery draft.

Therefore:

- Keep the first-run screen short.
- Do not require swiping through many pages.
- Do not ask for profile fields here.
- Do not request device permissions here.
- Do not ask for payment details here.
- Do not ask the sender to choose a station here.
- Route quickly into phone OTP, then delivery creation.

## Main Tension

Kra must feel safer than informal delivery without sounding heavy, bureaucratic, or slow. The screen must sell accountability and speed at the same time: clear price, verified handoffs, receiver tracking, and a fast route into phone OTP.

## Design Brief

User and job:

- A sender wants to understand whether Kra can safely carry a package and then start the first delivery.

Context of use:

- Mobile-first, transactional, often interrupted, sometimes on weak networks.

Entry point:

- Fresh install, logged-out sender route, public web app install prompt, or deep link from a sender-focused CTA.

Success state:

- The sender taps `Start sending` or `I already have an account` and reaches the sender auth route.

Primary action:

- `Start sending`

Navigation model:

- Stack screen in the sender app shell before authenticated sender tabs are shown.

Density:

- Calm but useful. One premium hero, one compact service explanation, one proof strip, one bottom CTA area.

Visual thesis:

- A polished African logistics control surface: warm, precise, trustworthy, and fast, with a route-line composition that makes custody feel tangible.

Restraint rule:

- Avoid decorative story slides, crowded card grids, trust-badge piles, staff workflow detail, price tables, and policy walls.

Product lens:

- Trust-critical activation.

System stance:

- Establish the sender mobile visual language while staying compatible with later delivery creation screens.

Interaction thesis:

- Smooth entry, clear progression, and tactile confidence through one route-line reveal, one custody proof reveal, and stable thumb-reachable actions.

Signature move:

- A vertical "custody rail" that turns the service promise into a live-feeling chain: Sender, Origin station, Driver, Destination station, Receiver.

Activation event:

- Authenticated sender lands on `/(sender)/create` and sees the first delivery draft step.

## Elite Quality Gate

This spec is not closed unless the resulting screen feels like the entry point to a serious logistics network, not a generic app intro.

Non-negotiable quality requirements:

- The first viewport must explain Kra in one glance.
- The primary CTA must be visible without scrolling on standard phone sizes.
- The page must not require horizontal swiping to understand the product.
- The sender must understand proof of custody before starting.
- The sender must understand price-before-payment before starting.
- The sender must understand that phone OTP is the login method before routing to auth.
- The page must avoid unsupported service claims outside approved corridors and rules.
- The page must not calculate prices locally.
- The page must not claim doorstep is always available.
- The page must not imply cash payment is supported in v1.
- The page must not imply dispatch can happen before payment confirmation.
- The page must not expose staff, station, route, or pricing internals that are not public.
- The page must remain clear on low bandwidth, small screens, large text, screen readers, reduced motion, and offline app launch.

Closure rule:

- If the sender cannot explain what Kra does after 10 seconds, the screen remains open.
- If the sender cannot find the next action with one thumb, the screen remains open.
- If the design relies on decorative slides instead of product clarity, the screen remains open.
- If the design hides the auth route below scroll, the screen remains open.
- If the design overpromises delivery availability, the screen remains open.

## Inspiration And Context Inputs

Use these sources as product and UX context, not as copy, layout, or branding to copy:

- Apple Human Interface Guidelines on onboarding: keep onboarding fast, useful, and focused on what people need to begin.
- Expo Router authentication docs: auth gates should redirect users based on session state while protecting authenticated routes.
- Firebase Authentication phone docs: phone verification is a supported sender auth direction and must be handled as a secure verification flow.
- W3C WCAG 2.2 guidance: touch targets, focus order, text resizing, status messaging, and reduced motion are required quality constraints.
- GSMA mobile money industry reporting: African mobile products must respect phone-led onboarding, trust, and transaction confidence.
- GhanaPost GPS context: Ghana delivery UX benefits from address and landmark awareness, but onboarding must not collect those details yet.
- Nielsen Norman Group onboarding guidance: onboarding should reduce friction and guide people to first useful action quickly.

Reference links:

- https://developer.apple.com/design/human-interface-guidelines/onboarding
- https://docs.expo.dev/router/advanced/authentication/
- https://firebase.google.com/docs/auth/web/phone-auth
- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.gsma.com/sotir/
- https://ghanapostgps.com/
- https://www.nngroup.com/articles/mobile-app-onboarding/

Do not copy external app layouts, operating-system screenshots, carrier imagery, maps, logos, illustrations, icons, or copy.

## Product Assumptions

Assumptions for v1:

- Sender auth uses phone OTP.
- Sender session duration is `30 days` unless revoked.
- Receivers do not create full accounts in v1.
- Sender first value is creating a delivery draft.
- Pilot launch supports the approved corridors in the pricing policy.
- Payment is prepaid and verified before dispatch.
- Doorstep delivery exists only when the destination address is serviceable under policy.
- MTN MoMo is the primary production payment path for the pilot.
- Public tracking remains available for senders and receivers.

If any assumption changes, update this spec before UI build begins.

## Non-Goals

Do not implement these in this screen:

- Phone number entry.
- OTP code entry.
- Password or PIN entry.
- Social login.
- Station selection.
- Quote generation.
- Price estimate.
- Delivery draft form.
- Package details form.
- Receiver details form.
- Payment method choice.
- Payment processing.
- Delivery timeline.
- Issue creation.
- Support chat.
- Profile creation.
- Device permission prompts.
- Staff account activation.
- Admin role selection.
- Public policy article rendering.

## Route Rules

### Route

- Render at `/(sender)/onboarding`.
- Must be accessible before sender authentication.
- Must be part of the mobile app stack, not public web shell.
- Must not render authenticated sender tabs.
- Must not require API data to render the normal state.

### Session-Aware Redirect

On mount:

- If no valid sender session exists, render onboarding.
- If a valid sender session exists and the sender has no active delivery draft, route to `/(sender)/home` unless product decides to resume create flow.
- If a valid sender session exists and a locally recoverable delivery draft exists, offer resume only from sender home or create start, not from onboarding.

Rules:

- Do not call delivery list APIs from onboarding just to decide redirect.
- Use the centralized auth/session provider.
- Do not trust local `sender_onboarding_seen` as authorization.
- Do not expose authenticated routes before token validation completes.
- Prevent navigation loops between onboarding and sign-in.

### Route Params

Allowed navigation params into onboarding:

- `source`, safe string values: `install`, `public_web`, `tracking_entry`, `signed_out`, `unknown`.
- `next`, only if route allowlisted.

Forbidden params:

- `deliveryId`
- `trackingCode`
- `phone`
- `otp`
- `paymentReference`
- `stationId`
- `senderId`
- `receiverPhone`
- `price`
- `quoteId`
- `role`

### Outbound Routes

Allowed outbound routes:

- `/(auth)/sender/sign-in?intent=signup`
- `/(auth)/sender/sign-in?intent=signin`
- `/(sender)/create` only after authenticated redirect from the auth flow
- Public tracking entry
- Public policy pages

Do not deep-link directly from onboarding to:

- Payment screens.
- Delivery detail.
- Station operations.
- Driver or courier routes.
- Admin routes.
- Receiver private routes.
- Issue routes.

## Auth And Security Rules

Auth model:

- Sender uses `phone_otp`.
- Sender session TTL is `30 days`.
- Lockout policy is enforced by auth/backend, not this screen.
- Onboarding does not create an account.
- Onboarding does not prove sender identity.
- Onboarding does not authorize delivery operations.

Security requirements:

- The CTA must route into the approved auth flow.
- The screen must not collect PII.
- The screen must not store a phone number.
- The screen must not write tokens.
- The screen must not create an unauthenticated delivery.
- The screen must not infer role from untrusted route params.
- Any analytics payload must exclude phone, tracking code, station ID, delivery ID, and route-specific sensitive data.

Privacy copy:

- Keep privacy reassurance short and true.
- Do not claim end-to-end encryption unless implemented.
- Do not claim receiver account privacy beyond the delivery-scoped v1 decision.
- Do not mention internal fraud scoring, provider references, audit metadata, or staff IDs.

## State Model

Required inventory state:

- `normal`

Additional implementation states that may exist internally:

- `checking_session`
- `ready`
- `routing`
- `offline_notice`
- `reduced_motion`

State display rules:

- `checking_session`: show app shell background and a small progress affordance only if session check exceeds `400ms`.
- `ready`: render full onboarding.
- `routing`: disable CTAs and show route progress on the tapped button.
- `offline_notice`: show a compact top notice that first-run sign-in needs connectivity.
- `reduced_motion`: replace route-line animation with instant reveal.

Do not introduce error-heavy onboarding states. Auth, network, lockout, and invalid credentials belong to `SenderSignIn` and related auth screens.

## Information Architecture

Screen order:

1. Status-safe app header.
2. Hero promise and primary CTA.
3. Custody rail.
4. Price and payment promise.
5. Receiver tracking promise.
6. Bottom CTA dock.
7. Compact policy links.

The first viewport must include:

- Kra wordmark or product mark.
- One-line category description.
- Main headline.
- Support line.
- Primary CTA.
- Secondary CTA.
- At least one visible custody or proof cue.

Below first viewport:

- The custody rail explains the chain.
- Price and payment tile explains quote lock and no pay-on-delivery v1 rule.
- Tracking tile explains receiver-safe tracking.
- Policy links remain compact.

## Layout Blueprint

### Phone Baseline

Target frame:

- iPhone 15/16/17 class width: `393px`.
- Small Android width: `360px`.
- Large phone width: `430px`.
- Minimum supported width: `320px`.

Safe area:

- Respect top and bottom safe areas.
- Bottom CTA dock must sit above the home indicator.
- No control may be obscured by OS navigation.

Page structure:

- `ScrollView` or equivalent vertical scroll container.
- Header and hero inside scroll.
- CTA dock pinned to bottom after the first viewport only if content height exceeds screen height.
- CTA dock must not cover content; add bottom inset equal to dock height plus safe area.

### First Viewport Composition

Top:

- App mark on the left.
- Small trust phrase on the right: `Verified handoffs`

Hero:

- Eyebrow: `Station-to-station delivery for Ghana`
- Headline: `Send packages with proof at every handoff.`
- Body: `Kra connects senders, stations, drivers, and receivers so every package move is tracked before it leaves the next custody point.`

Primary visual:

- Vertical route rail with five nodes:
  - `Sender`
  - `Origin station`
  - `Driver`
  - `Destination station`
  - `Receiver`

CTA block:

- Primary: `Start sending`
- Secondary text button: `I already have an account`
- Tertiary link: `Track a package`

### Scroll Continuation

Section: `How Kra protects a package`

- Three compact rows:
  - `Verified intake`: `Station confirms the package before transport.`
  - `Payment gate`: `Dispatch waits for confirmed payment.`
  - `Receiver-safe tracking`: `Receivers verify access before package details show.`

Section: `What you do first`

- Ordered mini-flow:
  - `Sign in with phone`
  - `Choose stations and package details`
  - `Review price before payment`
  - `Track handoffs until delivery`

Section: `Pilot note`

- Short text:
  - `Kra launches by corridor. Availability and doorstep delivery depend on station coverage and policy rules shown before payment.`

Footer links:

- `Pricing`
- `Delivery policy`
- `Privacy`
- `Terms`

## Component Contract

### `SenderOnboardingScreen`

Responsibilities:

- Render onboarding content.
- Read session state from central auth provider.
- Redirect authenticated senders safely.
- Handle CTA navigation.
- Render offline notice.
- Persist onboarding-seen only after CTA action.
- Emit safe analytics events.

Props:

- None from parent route except safe navigation params.

Dependencies:

- Auth session provider.
- Navigation/router.
- Network status provider.
- Local preference storage.
- Analytics client.
- Feature flag provider only for content visibility, not authorization.

Must not depend on:

- Delivery list query.
- Quote query.
- Payment provider query.
- Station list query.
- Issue query.
- Public tracking detail query.

### `OnboardingHeader`

Purpose:

- Brand orientation and trust cue.

Content:

- Left: Kra mark and `Kra`
- Right: `Verified handoffs`

Rules:

- Header must be visually light.
- Do not add account avatar.
- Do not add menu drawer.
- Do not add notification bell.
- Do not add station selector.

### `OnboardingHero`

Purpose:

- Explain the product and drive primary action.

Content:

- Eyebrow.
- Headline.
- Body.
- Route rail preview.
- CTA group.

Rules:

- Headline should not exceed three lines on `360px`.
- Body should not exceed four lines on `360px`.
- CTA group must be reachable without scrolling on normal dynamic type.
- Large text may push secondary content down, but primary CTA must remain clear.

### `CustodyRail`

Purpose:

- Make custody accountability tangible.

Nodes:

- `Sender`
- `Origin station`
- `Driver`
- `Destination station`
- `Receiver`

Visual behavior:

- Nodes are connected by a single vertical rail.
- Active visual emphasis starts at `Sender` and ends with a locked receiver node.
- Each node uses one concise label.
- No live status is shown because this is not a delivery timeline.

Rules:

- Do not show real station names.
- Do not show driver names.
- Do not show package IDs.
- Do not show tracking codes.
- Do not show location map.
- Do not imply a delivery already exists.

### `TrustProofStrip`

Purpose:

- Summarize the operating promise in three facts.

Facts:

- `Intake is recorded`
- `Payment is verified`
- `Proof closes delivery`

Rules:

- Keep as a compact strip, not a large grid.
- Icons must be functional and consistent.
- Avoid status colors that imply current delivery states.

### `HowItWorksMiniFlow`

Purpose:

- Explain next steps after auth.

Steps:

1. `Sign in with phone`
2. `Create delivery`
3. `Pay after quote`
4. `Track custody`

Rules:

- Use verbs.
- Do not show route prices.
- Do not say all routes are available.
- Do not promise same-day delivery.

### `PilotCoverageNote`

Purpose:

- Prevent overclaiming.

Copy:

- `Kra launches by corridor. The app shows available stations, doorstep options, and final price before payment.`

Rules:

- This note must be visible before policy links.
- It may be collapsed only after the sender has seen it once and the product owner approves.

### `BottomActionDock`

Purpose:

- Keep conversion action reachable.

Content:

- Primary button: `Start sending`
- Secondary: `I already have an account`

Behavior:

- Sticky only when content scrolls under it.
- Button enters loading state after tap.
- Secondary remains visible but visually subordinate.
- Dock respects safe area.

Rules:

- Do not add more than two actions to the dock.
- Do not add a close button that leaves the sender without a route.
- Do not put policy links in the dock.

## Exact Copy

### Header

Brand:

- `Kra`

Trust cue:

- `Verified handoffs`

### Hero

Eyebrow:

- `Station-to-station delivery for Ghana`

Headline:

- `Send packages with proof at every handoff.`

Body:

- `Kra connects senders, stations, drivers, and receivers so every package move is tracked before it leaves the next custody point.`

Primary CTA:

- `Start sending`

Secondary CTA:

- `I already have an account`

Tertiary link:

- `Track a package`

### Trust Proof Strip

Item 1:

- Title: `Intake is recorded`
- Body: `The origin station confirms the package before transport.`

Item 2:

- Title: `Payment is verified`
- Body: `Dispatch waits until payment is confirmed.`

Item 3:

- Title: `Proof closes delivery`
- Body: `Final delivery needs accepted receiver proof.`

### Mini Flow

Section title:

- `What happens after you start`

Step 1:

- Title: `Sign in with phone`
- Body: `Use OTP to continue as a sender.`

Step 2:

- Title: `Create delivery`
- Body: `Choose stations and enter receiver details.`

Step 3:

- Title: `Review price`
- Body: `See the final quote before payment.`

Step 4:

- Title: `Track custody`
- Body: `Follow package movement from intake to delivery.`

### Pilot Coverage Note

Title:

- `Built for corridor coverage`

Body:

- `Kra launches by corridor. The app shows available stations, doorstep options, and final price before payment.`

### Offline Notice

Text:

- `You can review this screen offline. Sign in needs a connection.`

### Routing Button States

Primary loading:

- `Opening phone sign-in...`

Secondary loading:

- `Opening sign-in...`

Track loading:

- `Opening tracking...`

### Accessibility Labels

Primary button:

- `Start sending with Kra`

Secondary button:

- `Sign in to an existing sender account`

Track link:

- `Track a package`

Custody rail:

- `Package custody path from sender to receiver`

Offline notice:

- `Connection unavailable. Sign in needs a connection.`

## Copy Rules

Use these terms consistently:

- `sender`
- `receiver`
- `origin station`
- `destination station`
- `driver`
- `final-mile courier`
- `handoff`
- `custody`
- `quote`
- `payment`
- `tracking`

Avoid these terms on this screen:

- `fleet`
- `manifest`
- `dispatch console`
- `admin`
- `reconciliation`
- `manual override`
- `supervisor PIN`
- `provider reference`
- `internal task`
- `MFA`
- `Firebase`
- `Firestore`
- `webhook`

Tone:

- Direct.
- Confident.
- Practical.
- Low hype.
- Human.

Do not use:

- Vague claims like `fastest in Africa`.
- Absolute promises like `never lost`.
- Unsupported claims like `guaranteed same day`.
- Technical explanations of backend systems.
- Long policy paragraphs.

## Visual System Direction

### Overall Style

The screen should feel like a premium logistics app built for real streets, stations, and phone-led commerce. The art direction should be warm and operational rather than cold enterprise.

Visual keywords:

- Trustworthy.
- Fast.
- Grounded.
- African urban logistics.
- Clean.
- Evidence-led.

Do not make it:

- Purple SaaS.
- Generic fintech.
- Overly playful.
- Map-heavy.
- Dense with cards.
- Luxury fashion.
- Government form.

### Color Tokens

Recommended semantic token direction:

- `surface.base`: warm off-white, similar to paper under sunlight.
- `surface.raised`: clean white with subtle warm tint.
- `ink.primary`: deep charcoal with a green undertone.
- `ink.secondary`: muted slate.
- `accent.primary`: route green.
- `accent.secondary`: sun amber.
- `accent.custody`: deep indigo or navy for proof moments.
- `state.success`: operational green.
- `state.warning`: amber.
- `state.error`: red reserved for real errors only.

Rules:

- Do not use warning or error colors in normal onboarding.
- Do not use more than two accent colors in the first viewport.
- Maintain WCAG contrast for all text.
- Route rail can use a gradient only if it improves path comprehension.

### Typography

Direction:

- Use a strong display face for headline if available in the app design system.
- Use a highly legible body face for content.
- Avoid default-looking type stacks unless the app system already mandates them.

Hierarchy:

- Eyebrow: small, uppercase optional, letter-spaced only if readable.
- Headline: bold, confident, `32-40px` equivalent depending on device.
- Body: `16-18px` equivalent, comfortable line height.
- CTA: `16-17px`, medium or bold.
- Captions: no smaller than `13px`.

Rules:

- Headline must not wrap into more than three lines on common phone width.
- Body text must not be lighter than accessible contrast.
- Do not use decorative script or novelty type.

### Spacing

Use consistent spacing steps:

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`
- `56`

Layout rules:

- Hero top padding should respect safe area plus `16`.
- CTA block should have at least `20` above and below.
- Content sections should not sit edge-to-edge unless using intentional full-bleed route art.
- Minimum horizontal inset is `20` on common phones and `16` on narrow phones.

### Shape And Surface

Surface language:

- Use one hero surface and one or two compact proof surfaces.
- Prefer soft radius between `20` and `28` for major surfaces.
- Use hairline dividers and tint shifts before heavy shadows.
- Use shadow only for CTA dock or raised hero material.

Do not:

- Nest surfaces more than one level.
- Use many equal cards.
- Use border-heavy dashboard styling.
- Put every piece of copy in a separate panel.

### Iconography

Use a single icon family.

Suggested icon concepts:

- Package.
- Station.
- Scan.
- Shield check.
- Route.
- Phone.

Rules:

- Icons must support scanning, not decoration.
- Icons must have accessible labels only when they carry meaning.
- Do not mix outlined, filled, and 3D icon styles.

## Motion And Interaction

Motion energy:

- Subtle.

Allowed motion:

- Hero content fades up with slight vertical travel.
- Custody rail draws once from sender node to receiver node.
- Proof strip items reveal with a short stagger.
- CTA press uses native scale or opacity feedback.

Timing:

- First content visible under `300ms`.
- Route rail reveal under `700ms`.
- CTA press feedback under `100ms`.
- Full entrance sequence under `900ms`.

Reduced motion:

- No rail drawing.
- No stagger.
- Use instant visibility with opacity disabled or near-instant.
- Preserve route comprehension with static rail.

Haptics:

- Light impact on primary CTA tap if platform supports it.
- No haptics on passive scroll.
- No success haptic before auth result.

Rules:

- Do not animate continuously.
- Do not use bouncing package graphics.
- Do not delay CTA interactivity for animation.
- Do not animate policy text.

## Platform Rules

### iOS

- Respect safe area and home indicator.
- Prefer native-feeling button press states.
- Use large-title-like headline scale without making navigation feel like Settings.
- Use `Linking` safely for public web routes if needed.
- Keep bottom dock above home indicator.

### Android

- Respect gesture navigation bottom inset.
- Avoid placing primary CTA too close to system navigation.
- Use ripple or equivalent press feedback if the design system supports it.
- Ensure back button from onboarding exits or returns to the prior public entry, not an auth loop.

### Shared

- All touch targets at least `44x44` effective points.
- Primary CTA height at least `52`.
- Text links need visible hit zones, not tiny text only.
- Screen must work with large font settings.
- Screen must remain useful in portrait. Landscape may render as a compact scroll state.

## Offline And Weak Network Behavior

Onboarding content must render without network after app bundle load.

Offline rules:

- Show offline notice only if the user tries to continue or network provider reports offline.
- `Start sending` may remain enabled, but tapping it should route to auth where the auth screen owns network error display, or show a short offline notice before navigation if auth cannot render offline.
- Do not show a full-screen error for onboarding offline.
- Do not hide policy links solely because offline; links may open when connection returns.

Weak network:

- The screen should not block on remote config.
- If feature flags are unavailable, use launch defaults.
- If analytics fails, ignore silently.

## Accessibility Requirements

Structure:

- One screen title.
- Logical reading order: header, hero, CTA, custody explanation, proof strip, mini flow, policy links.
- CTA order in screen reader must match visual priority.

Screen reader:

- Custody rail must be readable as a concise sequence.
- Decorative route line must be hidden from accessibility tree.
- Button labels must state action clearly.
- Offline notice must be announced when it appears.

Focus:

- Focus lands on screen title on first render only when navigation requires it.
- CTA focus order follows visual order.
- Returning from auth should not trap focus.

Contrast:

- Body text meets WCAG AA.
- CTA text meets WCAG AA.
- Disabled/loading text remains legible.
- Do not rely on color alone to communicate proof states.

Text size:

- Support large text without clipping.
- CTA dock may become two rows if required by accessibility text size.
- Do not truncate headline in large text; allow wrapping.

Motion:

- Support reduced motion.
- Do not use motion as the only way to understand the custody rail.

Touch:

- All actions meet target size rules.
- Link hit zones include padding.
- No core action requires horizontal swipe.

## Analytics

Allowed events:

- `sender_onboarding_viewed`
- `sender_onboarding_start_tapped`
- `sender_onboarding_signin_tapped`
- `sender_onboarding_track_tapped`
- `sender_onboarding_policy_link_tapped`
- `sender_onboarding_offline_notice_shown`

Required event fields:

- `source`
- `appVersion`
- `platform`
- `screenId`
- `route`
- `isAuthenticated`

Forbidden event fields:

- Phone number.
- Tracking code.
- Delivery ID.
- Sender ID.
- Receiver name.
- Receiver phone.
- Station ID.
- Payment reference.
- Quote amount.
- GPS.
- Device contact data.

Analytics rules:

- Fire `sender_onboarding_viewed` once per visible screen session.
- Fire CTA events before navigation starts.
- Do not block navigation on analytics.
- Do not record scroll depth unless product explicitly approves.
- Do not record touch coordinates.

## Backend Alignment

This screen has no required backend query.

It must align with:

- `packages/shared/src/domain/auth-policy.ts`
- `docs/08-security/authentication-flows.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/pricing-rules.md`
- `docs/03-business/doorstep-delivery-rules.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/05-design/frontend-screen-inventory.md`

Backend facts that may be referenced in copy:

- Sender auth uses phone OTP.
- Payment must be confirmed before transport states.
- Package custody requires evidence at handoff points.
- Receivers access tracking through delivery-scoped verification.
- Final price appears before payment.
- Doorstep availability depends on serviceability rules.

Backend facts that must not be exposed in normal onboarding:

- Internal rule IDs.
- Firestore paths.
- Provider references.
- Internal worker routes.
- Admin endpoint names.
- Supervisor override logic.
- Staff session TTLs.
- Issue escalation internals.

## Data And Storage

Local storage key:

- `sender_onboarding_seen`

Allowed values:

- `true`
- absent

Write timing:

- Set to `true` only after the sender taps `Start sending` or `I already have an account`.

Do not store:

- Phone.
- Intent as permanent identity.
- Tracking code.
- Delivery data.
- Station data.
- Payment data.
- Receiver data.

Reset behavior:

- If app storage is cleared, onboarding may show again.
- If the user is authenticated, session redirect wins over onboarding-seen state.

## Error Handling Boundaries

This screen owns:

- Offline notice for first-run CTA.
- Safe routing fallback if public tracking route is unavailable.
- Session check delay UI if needed.

This screen does not own:

- Invalid credentials.
- OTP expired.
- OTP resend limit.
- Account locked.
- Sender suspended.
- Auth provider unavailable.
- Delivery validation errors.
- Quote failures.
- Payment failures.

If a routing error occurs:

- Keep the sender on onboarding.
- Re-enable CTA.
- Show compact message:
  - `We could not open sign-in. Check your connection and try again.`

Avoid technical codes on this screen.

## Content Governance

Content owner:

- Product owner for sender activation.

Policy owner:

- Operations owner for custody and handoff claims.
- Finance owner for price-before-payment and no-cash messaging.
- Security owner for phone OTP and privacy wording.

Change rules:

- Any claim about coverage, delivery time, refunds, or payment must map to policy docs.
- Any claim about proof or custody must map to handoff rules.
- Any auth claim must map to authentication docs.
- Any public web link must map to approved public pages.

## Implementation Notes For Claude Code

Build only the sender onboarding screen and its local presentational components.

Expected file grouping when implementing later:

- Route file for `/(sender)/onboarding`.
- Component file for hero.
- Component file for custody rail.
- Component file for proof strip.
- Component file for bottom action dock.
- Test file for render and navigation.

Do not implement:

- Sign-in UI.
- OTP form.
- Delivery draft UI.
- Payment UI.
- Tracking timeline UI.
- Public web pages.
- Staff screens.

Navigation:

- Use the app's router abstraction.
- Do not hardcode unauthorized redirects across unrelated roles.
- Use allowlisted route names.

Styling:

- Use shared mobile design tokens when available.
- If tokens are missing, define local tokens in the onboarding module and open a follow-up to lift them into the mobile design system.
- Do not create one-off styles that later sender screens cannot reuse.

Testing:

- Add unit or component tests for CTA routing.
- Add accessibility checks for labels and touch targets.
- Add reduced-motion branch test if the app has motion utilities.
- Add offline notice test.

## Test IDs

Primary:

- `screen-sender-onboarding`

Recommended child test IDs:

- `sender-onboarding-header`
- `sender-onboarding-hero`
- `sender-onboarding-custody-rail`
- `sender-onboarding-proof-strip`
- `sender-onboarding-mini-flow`
- `sender-onboarding-pilot-note`
- `sender-onboarding-start-button`
- `sender-onboarding-signin-button`
- `sender-onboarding-track-link`
- `sender-onboarding-offline-notice`
- `sender-onboarding-policy-links`
- `sender-onboarding-bottom-dock`

Test ID rules:

- Stable.
- Lowercase kebab case.
- No dynamic values.
- No sensitive values.

## QA Acceptance Criteria

Normal render:

- Given no sender session, the screen renders at `/(sender)/onboarding`.
- The root has test ID `screen-sender-onboarding`.
- The headline is visible.
- The primary CTA is visible without scrolling on common phone height.
- The custody rail is visible in or near the first viewport.
- Policy links are visible after scroll.

CTA routing:

- Tapping `Start sending` routes to `/(auth)/sender/sign-in` with signup intent.
- Tapping `I already have an account` routes to `/(auth)/sender/sign-in` with signin intent.
- Tapping `Track a package` opens the public tracking entry route.
- CTAs show loading only after tap.
- CTAs recover if routing fails.

Session redirect:

- Authenticated sender does not remain on onboarding.
- Expired session does not expose authenticated sender routes.
- Onboarding-seen state does not authorize anything.

Offline:

- Content renders offline.
- Offline notice is concise.
- No full-screen failure appears solely because network is unavailable.

Accessibility:

- Screen reader reads the content in correct order.
- Primary CTA has descriptive label.
- Touch targets meet minimum size.
- Large text does not clip core CTAs.
- Reduced motion disables rail drawing.

Policy alignment:

- No local price calculation appears.
- No guaranteed delivery time appears.
- No pay-on-delivery promise appears.
- No universal doorstep availability appears.
- No staff or admin internals appear.

Analytics:

- View and CTA events fire with safe payload.
- Analytics failure does not block navigation.
- No sensitive identifiers are sent.

## Visual QA Checklist

Founder lens:

- Does the first viewport feel like a serious logistics network worth trusting?
- Is the main promise sharper than a generic delivery app intro?
- Is there one memorable visual idea?

Skeptical sender lens:

- Do I understand what happens to my package?
- Do I understand why Kra is safer than verbal handoffs?
- Do I understand when I will see the price?
- Do I understand what to do next?

Operator lens:

- Are claims aligned with real custody and payment rules?
- Does the screen avoid unsupported coverage promises?
- Does it route to auth without creating operational state?

Accessibility lens:

- Can this be used with large text and screen reader?
- Can it be used without motion?
- Are all controls reachable and correctly labeled?

Creative director lens:

- Is the custody rail distinctive and useful?
- Is the design restrained enough for trust?
- Does every visual element earn its space?

## Build Boundaries

In scope:

- Sender onboarding route.
- Presentational components listed above.
- Safe navigation handlers.
- Safe analytics handlers.
- Offline notice.
- Reduced-motion handling.
- Local onboarding-seen preference write after CTA.

Out of scope:

- Auth provider implementation.
- Firebase configuration.
- OTP entry.
- Sender profile creation.
- Delivery creation.
- Station directory.
- Quote service.
- Payment service.
- Tracking detail.
- Support flow.
- Push permissions.
- Contact permissions.
- Camera permissions.

## Final Implementation Decisions

Typography must use the shared app design-system type tokens. This screen must not introduce a screen-specific font pair.

The product mark must come from the shared brand asset package. If the asset is unavailable, the screen must render the approved text wordmark from the design system and must not create a local mark.

Color values must use shared theme tokens only. Screen-local hex values are not allowed except through approved token definitions.

Public tracking must open the in-app tracking route when that route exists. External browser fallback is allowed only when the in-app route is unavailable or explicitly disabled by platform policy.

On narrow phones, the route rail must be text-first. Icons can be decorative support only and must not become the sole indicator of step meaning.

## Definition Of Done

This screen is done when:

- It renders at the inventory route.
- It uses the inventory test ID.
- It routes to sender sign-in for both new and returning senders.
- It does not require backend data to render.
- It does not collect PII.
- It uses safe analytics only.
- It handles offline first launch gracefully.
- It respects mobile safe areas.
- It supports screen reader, large text, high contrast, and reduced motion.
- It matches the policy rules for auth, custody, price, payment, receiver tracking, and doorstep availability.
- It avoids unsupported claims.
- It feels premium, clear, and specific to Kra's delivery network.

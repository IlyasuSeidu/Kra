# Localization Foundation Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Localization foundation |
| Component family | Shared UI infrastructure |
| Primary modules | `KraI18nProvider`, `LocaleConfigProvider`, `TranslationKeyRegistry`, `CopyNamespaceLoader`, `MessageFormatter`, `MoneyFormatter`, `DateTimeFormatter`, `DurationFormatter`, `DistanceFormatter`, `PhoneDisplayFormatter`, `AddressDisplayPolicy`, `LocalizedRouteMetadata`, `CopyReviewGate`, `LocaleTestHarness` |
| Supporting modules | `LocalizedText`, `LocalizedHeading`, `LocalizedActionLabel`, `LocalizedStatusLabel`, `LocalizedErrorMessage`, `LocalizedEmptyStateCopy`, `LocalizedNotificationCopy`, `LocalizedFormCopy`, `LocalizedTableCopy`, `LocalizedTimelineCopy`, `LocalizedPaymentCopy`, `LocalizedIssueCopy`, `LocalizedProofCopy`, `LocalizedSeoMetadata`, `LocaleAwareLink`, `LanguagePackManifest`, `CountryPackResolver`, `CopyTelemetryBridge` |
| Inventory behavior | Ghana launch copy first, string keys ready for expansion |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, future shared frontend UI package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web console |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, support admins, finance admins, ops admins, super admins, translators, copy reviewers, QA, accessibility reviewers, support leads |
| Backend coverage | typed API client responses, API error codes, delivery lifecycle states, payment states, issue states, refund states, notification events, country pack configuration, analytics events |
| Browser mutation operation | None directly; localization renders copy, labels, formats, metadata, and user-facing messages only |
| Data sensitivity | receiver names, receiver phones, station names, addresses, package descriptions, payment amounts, refund amounts, issue reasons, proof references, scan codes, request IDs, admin audit records, provider references |
| Offline critical | Yes for field-operation copy, queued action copy, stale data labels, and accessible status messages under weak network conditions |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, scan component, proof capture component, timeline component, custody chain component, payment status component, issue status component, notification system, form system, empty/error library, accessibility foundation, analytics tracking, test harness |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, blocked by payment, blocked by issue, manual review required, scan mismatch, duplicate package label, custody not confirmed, OTP required, proof required, payment under review, refund pending, webhook conflict, rate limited |
| Related product docs | glossary, copy deck, accessibility and localization, country expansion strategy, pricing rules, delivery lifecycle, refund and dispute rules, webhooks and event payloads, error codes |
| Design tokens | type scale, line height, spacing, direction, focus, status color, status text, density, truncation, wrap, number alignment, currency, date, time, phone, route, landmark, surface, and motion tokens |
| Accessibility target | Localized copy must preserve WCAG 2.2 AA web behavior and platform-native mobile accessibility behavior, including language tags, clear labels, status announcements, text scaling, focus order, and non-color state meaning |
| Launch locale | `en-GH` |
| Launch country | `GH` |
| Launch timezone | `Africa/Accra` |
| Launch currency | `GHS` |
| Launch language | English |

## Purpose
The localization foundation is Kra's shared contract for copy, locale, country, formatting, and future language pack readiness.

It covers:

- customer-facing English launch copy for Ghana
- string key ownership
- namespace loading
- message interpolation
- plural-ready message structure
- date and time formatting
- currency formatting
- phone display formatting
- address display behavior
- route metadata copy
- public web SEO metadata
- form labels, hints, and validation copy
- state copy
- notification copy
- payment and refund copy
- issue copy
- proof and scan copy
- admin audit-sensitive copy
- offline and stale state copy
- future Twi and Ewe readiness
- future country pack readiness

The most important rule is:

```text
Kra launch copy is English for Ghana, but every user-facing string must be owned by a stable key, formatted through locale-aware utilities, and ready for later language packs without restructuring screens.
```

## Product Job
Kra cannot solve delivery trust across Africa with copy that is hard-coded, vague, or tied to one city, one payment provider, one station model, or one language.

The localization foundation must:

- keep launch copy consistent across all apps
- make Ghana the concrete first market
- avoid hard-coded user-facing strings inside screens
- prevent raw backend enum values from appearing in UI
- format money, dates, times, phone numbers, and counts consistently
- keep future translation work structural instead of screen-by-screen
- keep public copy, sender copy, receiver copy, operations copy, and admin copy separated where risk differs
- protect privacy in localized messages
- keep copy short enough for mobile and long enough for clarity
- preserve accessibility labels and announcements across locales
- support local address and name conventions without rigid foreign formats
- support country expansion through configuration and language packs

The system must make the right wording the easiest path for Claude Code and frontend engineers.

## Strategic Role
Localization is not just translation. It is operational correctness.

Kra copy must explain:

- who has custody
- what payment state means
- when a package can move
- where the receiver should go
- which station is responsible
- what proof is required
- what failed
- what can be retried
- what cannot be retried
- when support should be contacted
- what the user is allowed to see

Weak localization creates delivery risk:

- a sender may think payment is final when it is still under review
- a receiver may reveal too much information on a public tracking page
- a station operator may scan the wrong package because state copy is unclear
- a courier may treat queued proof as delivered
- an admin may approve a refund with unclear policy wording
- a future country team may fork the UI because strings were hard-coded

The localization foundation is therefore part of trust, fraud control, loss prevention, refund safety, support quality, and expansion speed.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing Kra frontend surfaces.

Surface type:

- Shared copy, locale, formatting, and expansion infrastructure for all frontend surfaces.

Primary action:

- Make every user-facing word, number, date, time, amount, status, and recovery instruction locale-aware and policy-safe.

Visual thesis:

- `Local precision without visual clutter`: Kra should feel Ghana-ready on day one, with crisp English copy, correct money and time formats, flexible local input, and no brittle layout assumptions.

Restraint rule:

- Do not add a language switcher, translation workflow UI, or multilingual marketing pages until approved language packs exist. Build the foundation now; ship English Ghana copy first.

Density:

- Public and receiver copy stays short, plain, and trust-led.
- Sender copy stays outcome-led and action-led.
- Operations copy stays direct, scan-safe, and status-led.
- Admin copy can include diagnostic context if role policy permits.

Platform stance:

- Web must set `lang="en-GH"` at launch and keep direction `ltr`.
- Mobile must expose the current locale through shared app context.
- Public SEO metadata must use the launch locale and avoid unapproved country claims.
- Formatting must use centralized utilities, not component-local string logic.
- Future language packs must not require screen rewrites.

## External Research Used
Only directly relevant localization, internationalization, and formatting sources were used:

- [W3C Internationalization Quick Tips](https://www.w3.org/International/quicktips/): supports UTF-8, declared language, semantic content, translatable assets, local forms, concise text, careful string composition, and right-to-left readiness.
- [W3C language tags in HTML and XML](https://www.w3.org/International/articles/language-tags/): supports BCP 47 language tag usage, region subtags, and locale identifiers for culturally affected behavior.
- [Unicode CLDR LDML](https://unicode-org.github.io/cldr/ldml/tr35.html): supports locale data categories for numbers, currencies, plural rules, dates, times, and time zones.
- [ICU MessageFormat guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/): supports message patterns, interpolation, plural arguments, select arguments, and keeping complex messages together for translation context.
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat): supports language-sensitive number and currency formatting.
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat): supports language-sensitive date and time formatting with explicit locale and timezone options.
- [i18next TypeScript](https://www.i18next.com/overview/typescript): supports typed resources, namespace configuration, and strict key checking options.
- [i18next plurals](https://www.i18next.com/translation-function/plurals): supports plural handling aligned with the Intl plural rules model.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/01-product/glossary.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/accessibility-and-localization.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/06-scan-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/07-proof-capture-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/08-timeline-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/09-custody-chain-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/10-payment-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/11-issue-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/12-notification-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/13-form-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/14-empty-error-library.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/15-accessibility-foundation.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/07-api/webhooks-and-event-payloads.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/country-expansion-strategy.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/15-qa/quality-strategy.md`
- `apps/web/src/index.ts`
- `package.json`
- `packages/shared/package.json`

## Non-Goals
The localization foundation must not:

- implement actual frontend screens in this documentation PR
- introduce a public language switcher before approved language packs exist
- translate launch UI into Twi or Ewe before a reviewed language pack is approved
- translate backend contract values directly
- translate API error codes
- translate audit event type identifiers
- translate route IDs, station IDs, delivery IDs, payment IDs, issue IDs, or request IDs
- expose internal enum names to users
- expose raw provider messages
- make customer copy depend on admin-only data
- add country-specific code forks
- add local pricing authority to frontend formatting
- format money by string concatenation
- format dates by string concatenation
- build rigid address fields that reject local conventions
- assume all future languages have English word order
- assume all future languages fit current button widths
- rely on icons, flags, or color as language indicators
- hide required copy from screen readers
- log localized messages instead of stable event keys

## Current Dependency Reality
Current repo dependency state:

- `zod` exists in root and shared package dependencies.
- No localization library is currently declared in checked package manifests.
- `apps/web/src/index.ts` already declares public SEO baseline locale as `en-GH`.
- Product docs already lock launch language to English.
- Product docs already require Ghana cedi formatting, Ghana-friendly date and time display, and future Twi and Ewe readiness.

Implementation implication:

- Claude Code must not add screen-level string constants as the long-term pattern.
- A single shared localization package or module must be introduced before production UI work scales.
- If the team selects i18next, enable typed resources, namespace ownership, and strict key checks.
- If the team selects another library, it must still satisfy this spec's key, formatter, plural, accessibility, privacy, and testing contracts.

## Launch Decisions
Kra v1 launch localization decisions are fixed:

| Decision | Value |
| --- | --- |
| Country | Ghana |
| Country code | `GH` |
| Locale | `en-GH` |
| Language | English |
| Text direction | `ltr` |
| Currency | `GHS` |
| Timezone | `Africa/Accra` |
| Public site locale | `en-GH` |
| Customer status language | plain English |
| Internal status language | plain English with approved operational terms |
| Future language readiness | Twi and Ewe without screen redesign |
| Country expansion readiness | language packs and country packs, not forks |

Rules:

- Use `package` for customer-facing physical parcel language.
- Use `delivery` for the commercial and operational record.
- Use `handoff` only when the audience understands custody transfer.
- Avoid guaranteed arrival language.
- Use `estimated` or `expected` for ETA copy.
- Use `review` language for refunds and disputes.
- Use `confirmed` only when backend state is final enough to support it.

## Architecture Overview
The localization system has seven layers.

### Locale Configuration Layer
The locale configuration layer resolves:

- active country
- active locale
- active timezone
- active currency
- active text direction
- active measurement policy
- active phone display policy
- active address display policy
- enabled language packs
- fallback locale

Launch resolution:

```ts
export const launchLocaleConfig = {
  countryCode: "GH",
  locale: "en-GH",
  language: "en",
  currencyCode: "GHS",
  timeZone: "Africa/Accra",
  direction: "ltr",
  fallbackLocale: "en-GH"
} as const;
```

### Country Pack Layer
The country pack layer owns market-level defaults:

- country code
- currency code
- timezone set
- phone validation policy
- address policy
- operating-hour defaults
- payment provider labels
- notification sender labels
- language pack allowlist
- policy references
- launch corridor labels
- support escalation wording

Country packs must be versioned.

Country packs must not contain screen layout rules.

Country packs must not override security, custody, payment, refund, or authorization guarantees.

### Language Pack Layer
The language pack layer owns user-facing strings:

- public marketing copy
- public policy copy
- sender copy
- receiver copy
- operations copy
- admin copy
- form labels
- form hints
- validation messages
- state copy
- notification copy
- accessibility labels
- SEO metadata

Language packs must be loaded by namespace and surface.

Language packs must be typed.

Language packs must be reviewed before production release.

### Formatter Layer
The formatter layer owns locale-aware output:

- money
- dates
- times
- date ranges
- relative time
- durations
- counts
- weights
- distances
- phone display
- address display
- list display

Screens must not hand-format these values.

### Message Layer
The message layer owns interpolation:

- named variables
- plural rules
- select rules
- role variants
- status variants
- action variants
- safe rich text boundaries

Messages must be whole thoughts, not fragments.

### Surface Adapter Layer
The surface adapter layer connects localization to:

- public web
- receiver flow
- sender mobile
- operations mobile
- admin web
- shared components
- shared screen states
- shared operational modals

Each adapter must enforce role-safe copy.

### Test And Review Layer
The test and review layer verifies:

- missing keys
- orphan keys
- forbidden raw user-facing strings
- interpolation variables
- plural coverage
- locale formatting
- accessibility labels
- privacy redaction
- copy policy compliance
- public SEO metadata
- country pack compatibility

## Module Contracts
Required modules:

| Module | Job |
| --- | --- |
| `KraI18nProvider` | Provides locale state, language packs, formatters, and fallback behavior to frontend apps. |
| `LocaleConfigProvider` | Resolves launch locale and future country pack locale decisions. |
| `TranslationKeyRegistry` | Defines stable key ownership, namespace schema, and compile-time key coverage. |
| `CopyNamespaceLoader` | Loads only required copy namespaces per app, route, and role. |
| `MessageFormatter` | Formats keyed messages with named variables, plural rules, and select rules. |
| `MoneyFormatter` | Formats backend-authoritative money values with locale and currency policy. |
| `DateTimeFormatter` | Formats timestamps with explicit locale and timezone policy. |
| `DurationFormatter` | Formats elapsed, remaining, stale, and retry windows. |
| `DistanceFormatter` | Formats route and doorstep distances when such values are approved for display. |
| `PhoneDisplayFormatter` | Formats phone values for display while preserving backend normalized storage. |
| `AddressDisplayPolicy` | Displays local address and landmark content without rigid foreign templates. |
| `LocalizedRouteMetadata` | Provides route titles, document titles, descriptions, and SEO metadata. |
| `CopyReviewGate` | Blocks release if launch copy or language pack changes are not reviewed. |
| `LocaleTestHarness` | Provides test utilities for key coverage, formatting, and layout expansion. |

## Key Namespace Model
Namespaces must be grouped by product surface and shared system area.

Required top-level namespaces:

| Namespace | Owner | Examples |
| --- | --- | --- |
| `public` | public web team | landing, pricing explainer, trust, FAQ, privacy, terms, maintenance |
| `receiver` | receiver flow team | verify, tracking, station pickup, doorstep, proof, support |
| `sender` | sender app team | onboarding, auth, create delivery, payment, tracking, issue, refund |
| `station` | operations app team | intake, dispatch, receive, assignment, issue, scan, proof |
| `driver` | operations app team | assignments, pickup, route, line-haul handoff, incidents |
| `courier` | operations app team | doorstep route, receiver verification, proof capture, failed attempt |
| `admin` | admin web team | finance, station, user, issue, refund, webhook, export, audit |
| `shared` | design system team | buttons, navigation, states, forms, notifications, accessibility |
| `status` | platform team | payment, delivery, issue, refund, custody, outbox |
| `errors` | API platform team | mapped API error messages and recovery labels |
| `seo` | public web team | document titles, meta descriptions, social titles, structured metadata |

Key shape:

```text
<namespace>.<surface>.<screen>.<element>.<state>
```

Approved patterns:

```text
sender.createDelivery.receiverDetails.heading.default
sender.createDelivery.receiverDetails.phone.label
sender.payment.method.amount.locked
receiver.tracking.timeline.event.readyForPickup
station.intake.scan.result.mismatch
admin.refunds.review.action.approve
shared.states.offline.heading
errors.payment.providerUnavailable.recovery
```

Rules:

- Keys are stable contract identifiers.
- Keys are not user-facing copy.
- Keys must use lower camel case segments.
- Keys must not contain raw IDs.
- Keys must not contain customer names.
- Keys must not contain station names.
- Keys must not contain provider names unless provider-specific copy is approved.
- Keys must not encode locale.
- Keys must not encode route path.
- Keys must not encode visual component names when copy is product-owned.

## String Ownership Rules
Each string must have one owner.

| String type | Owner |
| --- | --- |
| Public marketing headline | public web spec and copy deck |
| Public policy sentence | policy doc and public web spec |
| Sender workflow instruction | sender screen spec |
| Receiver tracking sentence | receiver screen spec |
| Operations task instruction | operations screen spec |
| Admin review instruction | admin screen spec |
| Form label | form system and owning screen spec |
| Validation message | shared schema and form system |
| API error message | typed API client and error code map |
| Empty state copy | empty/error library and owning screen spec |
| Notification copy | notification system and owning event spec |
| Accessibility label | accessibility foundation and owning component spec |
| SEO title | public web spec and SEO namespace |

Rules:

- Shared copy belongs in `shared` only when it is truly shared.
- Screen-specific copy stays in the screen namespace.
- Backend codes remain backend codes.
- Frontend maps codes to role-safe messages.
- Admin-only diagnostic copy must not appear in customer namespaces.
- Customer-safe copy must not expose internal actor IDs or station scope logic.

## Message Formatting Rules
Messages must use named variables.

Allowed:

```text
Your package is ready for pickup at {stationName}.
Payment must be confirmed before this package can move.
{count, plural, one {# package needs action} other {# packages need action}}
```

Not allowed:

```text
"Your package is ready for pickup at " + stationName
"Payment " + status
count + " packages"
```

Rules:

- Do not concatenate sentences.
- Do not split one sentence across multiple translation keys.
- Do not put punctuation outside translated messages.
- Do not put unreviewed provider copy into localized messages.
- Do not allow HTML from translation bundles.
- Use explicit rich text slots when links or emphasis are required.
- Use named variables that describe meaning, not position.
- Use plural support for any count.
- Use select support for status-driven messages.
- Keep complex plural or select messages as whole sentences.
- Keep fallback messages safe and clear.

## Variable Naming Rules
Variables must be semantic.

Approved variables:

- `stationName`
- `receiverName`
- `packageCount`
- `amount`
- `currencyCode`
- `estimatedDate`
- `estimatedTime`
- `retryAfter`
- `requestId`
- `supportReference`
- `routeName`
- `handoffActor`
- `issueCategory`
- `refundStatus`

Rejected variable styles:

- `value`
- `label`
- `data`
- `x`
- `name` when the entity is unclear
- `status` when the status source is unclear
- `amountText` when the formatter should produce display text

## Formatter Contracts
Screens must call formatter modules, not local formatting code.

### Money
Money formatting rules:

- Backend owns amount value.
- Backend owns currency code unless country pack overrides display currency for a new market.
- Frontend formats display only.
- Launch display uses `GHS`.
- Public pricing explainers must not calculate fees locally.
- Payment screens must show locked backend quote amounts.
- Refund screens must show backend-approved refund amounts only.
- Admin screens may show amount, fee type, and currency if role permits.

Money API:

```ts
type MoneyInput = {
  amountMinor: number;
  currencyCode: "GHS" | string;
  locale: string;
  display?: "code" | "symbol";
};

type MoneyFormatter = {
  formatMoney(input: MoneyInput): string;
  formatSignedMoney(input: MoneyInput & { sign: "credit" | "debit" }): string;
};
```

Launch rule:

```text
Use `GHS 35.00` style in customer copy unless a product decision approves a different Ghana display.
```

### Dates And Times
Date and time rules:

- Use locale `en-GH` at launch.
- Use timezone `Africa/Accra` for Ghana launch operational times unless a record explicitly stores a different timezone context.
- Never use browser default timezone for operational commitments.
- Show dates in clear day-month-year wording where required by product docs.
- Show time in 24-hour format where required by product docs.
- Use `estimated` or `expected` for non-final times.
- Use absolute time where accountability matters.
- Use relative time only with an accessible absolute equivalent.

Date API:

```ts
type DateTimeFormatter = {
  formatDate(value: string | Date, options?: DateDisplayOptions): string;
  formatTime(value: string | Date, options?: TimeDisplayOptions): string;
  formatDateTime(value: string | Date, options?: DateTimeDisplayOptions): string;
  formatRelative(value: string | Date, now?: Date): string;
};
```

### Durations
Duration rules:

- Use durations for retry windows, stale data age, queue age, and SLA labels.
- Do not make duration copy sound like guaranteed arrival.
- Use compact durations in mobile task bars.
- Use precise durations in admin review panels.

### Counts
Count rules:

- Any count requires plural-ready messaging.
- Zero states must use state copy, not a forced plural sentence, when no data is the primary state.
- Queue badges may use compact count labels if accessible text is complete.

### Phone Display
Phone rules:

- Store normalized phone values through backend contracts.
- Display Ghana-friendly values for users.
- Never expose receiver phone on public surfaces unless the policy and screen spec allow it.
- Use masked phone display where privacy requires it.
- Do not use phone number text as identity proof without OTP or role policy.

### Address Display
Address rules:

- Support free-form multiline address text.
- Support landmark notes.
- Do not require foreign postal structures.
- Preserve user-provided local naming.
- Avoid over-normalizing local place names.
- Truncate carefully with detail expansion on authorized surfaces.
- Never expose full address on public tracking if the public screen policy forbids it.

### Distance And Units
Distance rules:

- Use metric units for Ghana launch.
- Show route distance only when backend or approved provider data supplies it.
- Do not infer precise doorstep distance from partial user input.
- Use approximate wording when source precision is low.

## Role-Safe Copy Matrix
Copy must be scoped by role.

| Audience | Copy tone | Data allowed | Data forbidden |
| --- | --- | --- | --- |
| Public visitor | outcome-led, trust-led, plain | service value, pricing policy, support path | internal routes, internal station readiness, actor IDs |
| Receiver | clear, minimal, privacy-safe | tracking milestones, pickup station, safe next action | sender payment details, internal issue notes, staff IDs |
| Sender | action-led, reassurance without overpromise | delivery status, payment status, refund status, issue status | internal provider payloads, staff-only notes |
| Station operator | direct, scan-safe, custody-aware | package action state, station queue, handoff requirement | finance-only details unless required |
| Driver | route and handoff focused | assigned load, origin, destination, custody proof | unrelated sender payment details |
| Final-mile courier | doorstep and proof focused | receiver verification instruction, proof requirement | hidden receiver identity data beyond policy |
| Support admin | diagnostic but safe | issue context, customer-safe timeline, request IDs | raw secrets, private payment provider payloads |
| Finance admin | precise and auditable | payment and refund status, settlement references | unrelated package content |
| Ops admin | network and station focused | station scope, dispatch state, route exceptions | finance-only settlement details unless permitted |
| Super admin | full authorized operational context | cross-domain admin context | secrets, credentials, raw provider secrets |

Rules:

- The same backend state may require different copy per role.
- Role variants must be explicit keys, not runtime string edits.
- Public copy must not confirm hidden record existence after authorization denial.
- Admin copy must identify exact review responsibilities without leaking secrets.

## Status Copy Rules
Backend states must map to approved labels.

Delivery states:

- Use customer-friendly labels for sender and receiver surfaces.
- Use operational labels for station, driver, courier, and admin surfaces.
- Do not show raw enum names.
- Do not imply movement is allowed before payment and custody rules permit it.

Payment states:

- `pending` copy must say payment is not final.
- `confirmed` copy may say payment is confirmed.
- `under review` copy must block transport bypass.
- `failed` copy must provide recovery without exposing provider internals.
- `refunded` copy must align with refund policy.

Issue states:

- Issue copy must state review status and next action.
- Severity labels must avoid panic on customer surfaces.
- Admin severity labels must remain explicit.

Refund states:

- Refund copy must say review or settlement state.
- Refund copy must not promise automatic compensation.
- Finance admin copy must include auditable action labels.

Custody states:

- Internal surfaces may use custody and handoff terms.
- Customer surfaces must explain package movement in plain language.
- Handoff copy must identify accountable next action.

Outbox states:

- Queued copy must say the action has not reached the server.
- Syncing copy must say the app is sending the action.
- Synced copy must say the server accepted the action.
- Conflict copy must say review is required.
- Outbox copy must not say the task is complete before acceptance.

## Public Web Localization Rules
Public web pages must:

- set document language to `en-GH`
- use locale-aware SEO metadata
- keep one primary CTA per page where the page spec requires it
- avoid country expansion claims beyond approved markets
- avoid guaranteed delivery language
- avoid provider-specific copy unless provider display is approved
- keep pricing explanation as policy and backend authority, not local calculation
- keep privacy, refund, support, and maintenance copy aligned with policy docs
- keep strings ready for future language pack export

Public web namespaces:

```text
public.home
public.pricing
public.business
public.receiver
public.tracking
public.support
public.privacy
public.terms
public.maintenance
seo.public
```

SEO rules:

- Page title strings must be localized keys.
- Meta description strings must be localized keys.
- Open Graph titles must be localized keys.
- Social image alt text must be localized keys.
- Do not hard-code Ghana claims in SEO outside country-approved content.

## Sender Mobile Localization Rules
Sender mobile copy must:

- use direct task language
- keep receiver and package fields clear
- show locked quote amount through `MoneyFormatter`
- use payment-before-dispatch wording consistently
- explain cancellation and refund review without overpromising
- keep issue creation language calm and specific
- avoid internal terms like raw custody states

Sender namespaces:

```text
sender.onboarding
sender.auth
sender.home
sender.createDelivery
sender.quote
sender.payment
sender.tracking
sender.history
sender.issue
sender.refund
sender.profile
sender.support
```

## Receiver Public Flow Localization Rules
Receiver copy must:

- be understandable without app install
- avoid revealing more than the receiver is authorized to see
- explain OTP and verification steps clearly
- show station pickup requirements plainly
- show doorstep status without precise location leakage
- give support paths without sender-only data

Receiver namespaces:

```text
receiver.verify
receiver.tracking
receiver.stationPickup
receiver.doorstep
receiver.proof
receiver.support
receiver.states
```

## Operations Mobile Localization Rules
Operations copy must:

- prioritize scan result clarity
- identify package and station context safely
- state handoff accountability
- distinguish queued, synced, and conflict states
- keep copy readable in field conditions
- avoid long paragraphs during active scanning
- support manual fallback paths
- preserve accessible announcements

Operations namespaces:

```text
station.home
station.intake
station.dispatch
station.receive
station.assignments
station.issues
driver.home
driver.assignments
driver.pickup
driver.route
driver.handoff
courier.home
courier.route
courier.receiverVerification
courier.proof
courier.failedAttempt
```

## Admin Web Localization Rules
Admin copy must:

- be precise
- be auditable
- distinguish view, review, approve, reject, override, replay, export, and settle actions
- include request IDs only where useful and authorized
- never expose secrets
- keep customer-safe text separate from admin notes
- make irreversible or high-risk actions explicit
- require confirmation copy for overrides

Admin namespaces:

```text
admin.dashboard
admin.deliveries
admin.stations
admin.stationValidation
admin.pricing
admin.users
admin.finance
admin.payments
admin.refunds
admin.issues
admin.webhooks
admin.notifications
admin.exports
admin.audit
```

## Shared Component Integration
### Form System
The form system must consume localization for:

- field labels
- group legends
- field hints
- format guidance
- validation errors
- server validation messages
- submit labels
- dirty state warnings
- confirmation copy

Rules:

- Field labels are keys.
- Field hints are keys.
- Validation messages are keys.
- Error summaries use the same messages as field-level errors.
- Required field copy must be localized.
- Optional field copy must be localized.
- Backend schema names must not leak into user copy.

### Empty And Error Library
The empty/error library must consume localization for:

- headings
- reasons
- recovery action labels
- secondary actions
- support copy
- request ID labels
- offline copy
- stale data copy
- rate limit copy
- authorization denial copy

Rules:

- Empty copy must not be reused for error states.
- Error copy must not expose raw provider data.
- Public denial copy must not confirm hidden resource existence.
- Admin error copy may include safe diagnostic labels.

### Notification System
The notification system must consume localization for:

- toast titles
- toast body copy
- inbox notification titles
- inbox notification body copy
- push notification copy
- email subject copy
- SMS copy if used later
- retry labels
- channel failure labels

Rules:

- Notification copy must be event-keyed.
- Notification copy must not expose sensitive details on lock screens.
- Push copy must be shorter than in-app copy.
- Email copy may include more context if policy permits.
- SMS copy must be concise and privacy-safe if introduced.

### Timeline Component
The timeline component must consume localization for:

- event labels
- event descriptions
- timestamp labels
- actor labels
- station labels
- proof labels
- hidden event explanations

Rules:

- Customer timeline labels must use customer language.
- Internal timeline labels may use operational language.
- Hidden events must have a safe explanation when the UI shows a gap.

### Custody Chain Component
The custody chain component must consume localization for:

- current holder labels
- handoff requirement labels
- proof requirement labels
- blocked transfer labels
- conflict labels
- audit labels

Rules:

- Use handoff and custody wording only on internal surfaces.
- Customer surfaces should explain package movement and next action.

### Payment Status Component
The payment status component must consume localization for:

- status labels
- amount labels
- provider-safe failure messages
- recovery action labels
- under-review labels
- refund labels

Rules:

- Amount display must come from `MoneyFormatter`.
- Payment failure copy must not expose provider internals.
- Payment success copy must match backend state.

### Issue Status Component
The issue status component must consume localization for:

- issue category labels
- severity labels
- status labels
- assigned team labels
- resolution labels
- customer-safe explanations

Rules:

- Severity copy differs by role.
- Public and sender surfaces must avoid panic language.
- Admin surfaces must keep severity operationally explicit.

## Accessibility Localization Rules
Localized copy must preserve accessibility.

Rules:

- Web root uses `lang="en-GH"` at launch.
- Future localized documents must set the correct BCP 47 language tag.
- Direction defaults to `ltr`.
- Future right-to-left language packs must set direction through locale config.
- Screen-reader labels must be localized keys.
- Hidden accessibility text must not reveal more data than visible authorized UI.
- Live region messages must be localized keys.
- Route change announcements must be localized keys.
- Button labels must remain action-specific after translation.
- Text scaling must be tested with expanded copy.
- Layouts must handle longer future translations.

Do not:

- use English-only abbreviations without accessible expansion
- rely on flag icons to identify languages
- hide critical context in tooltip-only copy
- use visual-only status labels
- shorten copy until it becomes ambiguous

## Privacy And Security Rules
Localization must not weaken privacy.

Rules:

- Translation keys must never contain personal data.
- Localized copy logs must use keys, not rendered messages, when possible.
- Analytics must track key IDs and action IDs, not sensitive rendered values.
- User-provided values must be interpolated only after authorization and redaction checks.
- Receiver phone display must follow screen-specific privacy policy.
- Address display must follow screen-specific privacy policy.
- Provider errors must map to safe frontend messages.
- Request IDs may appear only where support and role policy permit.
- Admin notes must not be copied into customer messages unless a reviewed customer-safe summary exists.

## Analytics Rules
Analytics must use stable event names and copy keys.

Rules:

- Do not track rendered localized text as event names.
- Track translation key ID only when needed for copy experiment or support investigation.
- Track locale, country code, and surface where useful.
- Do not track user-provided message variables.
- Do not track receiver names, phone numbers, or addresses in localization events.
- Do not track package descriptions in localization events.
- Track missing key failures as operational errors.
- Track fallback use by namespace and key, not rendered value.

Event examples:

```text
localization.missing_key_detected
localization.fallback_used
localization.namespace_load_failed
localization.formatter_error
localization.copy_review_gate_failed
```

## Offline And Low-Bandwidth Rules
Localization must work under poor connectivity.

Rules:

- Launch `en-GH` core namespaces must be bundled or reliably cached for each app.
- Operations mobile must have offline access to scan, proof, handoff, outbox, and error copy.
- Public web critical pages must render core copy without waiting on optional language resources.
- Missing namespace failures must fall back to safe launch copy.
- Fallback copy must never expose raw keys to users.
- Outbox and conflict messages must remain available offline.
- Formatter utilities must not require network access.

Required offline copy namespaces:

```text
shared.states
shared.forms
shared.accessibility
status.delivery
status.payment
status.custody
station.intake
station.dispatch
driver.assignments
driver.handoff
courier.proof
errors.network
errors.offline
```

## Country Expansion Rules
New country rollout requires:

- country pack
- launch locale decision
- currency decision
- timezone decision
- phone policy
- address policy
- support copy
- payment provider labels
- public legal copy review
- privacy review
- refund policy copy review
- station operating copy review
- support escalation copy review
- language pack readiness review
- locale formatter test run
- layout expansion test run

Country pack admission gate:

```text
A new country cannot launch until all customer-facing strings used by enabled routes are keyed, reviewed, formatted, and covered by locale tests.
```

Rules:

- Do not fork screens by country.
- Do not add country names inside shared keys.
- Do not use hard-coded currency labels.
- Do not hard-code provider copy.
- Do not hard-code timezone assumptions.
- Do not assume Ghana address rules apply everywhere.

## Future Language Readiness
Launch language remains English.

Future language readiness requires:

- stable keys
- whole-message formatting
- plural readiness
- select readiness
- longer-copy layout tolerance
- local address tolerance
- accessible language tags
- copy review workflow
- namespace ownership
- country pack compatibility

Future Twi and Ewe considerations:

- Do not assume English word order.
- Do not compose sentences from fragments.
- Do not assume label lengths.
- Do not assume all future copy has the same punctuation.
- Do not use graphics with embedded text.
- Do not make button width fixed to English labels.
- Do not treat translation as a final pass.

## Visual And Interaction Standards
Localization must preserve premium UI quality.

Visual rules:

- Let content breathe when text expands.
- Use responsive containers, not fixed copy widths.
- Allow titles and labels to wrap gracefully.
- Use line-height tokens that remain readable.
- Use compact labels only when an accessible expanded label exists.
- Use numbers with tabular alignment in admin tables where helpful.
- Use currency code alignment for finance tables.
- Use clear hierarchy before using color.

Interaction rules:

- Button labels must remain specific.
- Navigation labels must remain stable and predictable.
- Scan result messages must be immediate and clear.
- Form recovery messages must point to the exact field.
- Admin destructive action copy must identify the action and consequence.
- Public CTAs must not become crowded by secondary links.

Motion rules:

- Locale changes in future must not animate entire app remounts.
- Copy updates must not cause layout jumps in critical task flows.
- Reduced motion behavior must remain intact.

## Copy Governance
Every localization change must answer:

- Which namespace owns this key?
- Which screen or component uses it?
- Which roles can see it?
- Which variables can enter it?
- Which backend state can trigger it?
- Is the copy customer-safe or internal-only?
- Does it follow the copy deck?
- Does it avoid guaranteed delivery language?
- Does it avoid unapproved refund promises?
- Does it avoid provider internals?
- Does it preserve accessibility?
- Does it fit mobile?
- Does it work offline if needed?

Review owners:

| Copy area | Required reviewer |
| --- | --- |
| Public landing and pricing | product lead |
| Privacy and terms | policy lead |
| Payment and refund | finance lead |
| Delivery lifecycle and handoff | operations lead |
| Issue and support | support lead |
| Admin override and audit | ops admin lead |
| Accessibility labels | accessibility reviewer |
| New country copy | country launch lead |
| New language pack | language reviewer and product lead |

## Error Code Mapping
API error codes must remain stable contract values.

Mapping rules:

- Map error code to localized message key.
- Map message key to role-safe rendered copy.
- Map recovery action to localized action label.
- Preserve request ID only where role policy allows.
- Never display raw code as the primary message.
- Admin details may show code in diagnostic area.
- Customer surfaces may show support reference if approved.

Example shape:

```ts
type LocalizedApiError = {
  code: string;
  messageKey: TranslationKey;
  recoveryKey?: TranslationKey;
  severity: "info" | "warning" | "error" | "blocked";
  requestId?: string;
};
```

## Data Model Contracts
Core types:

```ts
type LocaleCode = string;
type CountryCode = string;
type CurrencyCode = string;
type TranslationKey = string;
type TranslationNamespace = string;

type LocaleConfig = {
  countryCode: CountryCode;
  locale: LocaleCode;
  language: string;
  currencyCode: CurrencyCode;
  timeZone: string;
  direction: "ltr" | "rtl";
  fallbackLocale: LocaleCode;
};

type LanguagePackManifest = {
  locale: LocaleCode;
  countryCode: CountryCode;
  version: string;
  namespaces: TranslationNamespace[];
  reviewedAt: string;
  reviewedBy: string;
};

type TranslationMessage = {
  key: TranslationKey;
  value: string;
  description: string;
  variables?: Record<string, "string" | "number" | "date" | "money">;
  maxSurface?: "public" | "customer" | "operations" | "admin";
};
```

Rules:

- `description` is required for non-obvious keys.
- Variable types must be explicit.
- Admin-only messages must be marked by surface.
- Public messages must be approved for unauthenticated display.
- Language pack version must be traceable.

## File And Folder Expectations
Claude Code should create localization infrastructure in a shared frontend area when implementation begins.

Expected structure:

```text
packages/frontend-i18n/
  src/
    config/
      launch-locale.ts
      country-packs.ts
    formatters/
      money.ts
      datetime.ts
      duration.ts
      distance.ts
      phone.ts
      address.ts
    messages/
      registry.ts
      namespaces.ts
      validators.ts
    react/
      KraI18nProvider.tsx
      useKraTranslation.ts
      LocalizedText.tsx
    testing/
      locale-test-harness.ts
      key-coverage.ts
```

If the repo chooses a different package location, the same boundaries still apply.

## Release Gates
The localization foundation is release-ready only when:

- every user-facing string in implemented screens uses a key
- every required namespace has an owner
- launch `en-GH` resources cover all enabled routes
- no critical screen renders raw translation keys
- money formatting is centralized
- date and time formatting is centralized
- API error code mapping is role-safe
- notification copy is event-keyed
- accessibility labels are localized keys
- public SEO metadata is keyed
- operations offline copy is bundled or cached
- missing key test fails CI
- formatter test fails CI on invalid output
- copy review gate is required for language pack changes
- layout expansion checks run for critical flows

## Testing Requirements
Unit tests:

- translation key lookup returns launch copy
- missing key throws or fails according to test environment policy
- fallback locale works
- namespace loading resolves required keys
- interpolation requires all variables
- plural messages handle zero, one, and many counts
- select messages handle every declared branch and fallback branch
- money formatter renders `GHS` values consistently
- date formatter uses `Africa/Accra`
- time formatter uses 24-hour display where required
- phone formatter masks values where policy requires
- API error mapper returns role-safe keys

Component tests:

- public pages render keyed SEO copy
- sender payment screen renders locked amount through formatter
- receiver tracking renders customer-safe state labels
- station scan states render offline-safe copy
- courier proof flow renders queued and accepted copy correctly
- admin refund review renders audit-sensitive copy
- form labels, hints, and errors use localized keys
- empty/error library renders localized recovery actions
- notification system renders event-keyed messages

Accessibility tests:

- document language is `en-GH` at launch
- route change announcements use localized copy
- live region status messages use localized copy
- accessibility labels do not expose restricted data
- expanded text remains readable at 200 percent zoom
- focus order does not break when copy wraps
- reduced motion behavior remains unchanged

Integration tests:

- no enabled route renders raw key strings
- no enabled route uses raw backend enum as user copy
- no enabled route hand-formats money
- no enabled route hand-formats dates
- offline operations flow has all required copy
- API errors map to correct role-safe messages
- public tracking denial does not confirm hidden record existence
- admin diagnostic errors show only safe request context

CI gates:

```text
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm check:critical-coverage
pnpm check:i18n-keys
pnpm check:i18n-formatters
pnpm check:i18n-raw-strings
pnpm check:i18n-privacy
```

The last four commands do not need to exist in this documentation PR, but the implementation work must add equivalent gates before UI scale-up.

## Raw String Guard
Frontend source should reject unowned user-facing strings.

Allowed raw strings:

- test IDs
- aria role names required by platform
- enum constants
- route paths
- analytics event names
- backend contract keys
- code comments
- non-user-visible developer diagnostics

Disallowed raw strings:

- headings
- labels
- buttons
- links
- hints
- validation messages
- state copy
- notification copy
- modal copy
- table headers
- empty state copy
- error state copy
- accessibility labels
- SEO metadata

## Layout Expansion Guard
Every critical screen must survive longer copy.

Minimum checks:

- primary buttons wrap or resize safely
- app bars do not overlap status areas
- cards expand vertically without clipping
- tables support column wrapping and tooltips where allowed
- bottom sheets remain scrollable
- modals remain keyboard and screen-reader usable
- scan result banners remain readable
- proof capture instructions remain visible
- admin filters remain usable
- public hero remains clear on mobile

## Implementation Roadmap
### Phase 1: Foundation
Build:

- launch locale config
- country pack model
- translation key registry
- formatter utilities
- provider interface
- namespace naming standard
- missing key policy
- key coverage test

Exit criteria:

- shared infrastructure can render `en-GH` copy through keys
- money and datetime formatting tests pass
- no enabled shell requires hard-coded launch copy

### Phase 2: Shared Components
Integrate:

- app shells
- form system
- empty/error library
- notification system
- payment status component
- issue status component
- timeline component
- custody chain component
- scan component
- proof capture component

Exit criteria:

- shared components accept keys or key descriptors
- shared components do not embed user-facing English except reviewed defaults
- operations offline copy is available without network

### Phase 3: Public And Customer Flows
Integrate:

- public web pages
- receiver public flow
- sender mobile onboarding
- sender create delivery
- sender payment
- sender tracking
- sender issue and refund flows

Exit criteria:

- public SEO metadata is keyed
- customer flows show no raw backend values
- payment and refund copy passes finance review

### Phase 4: Operations And Admin
Integrate:

- station workflows
- driver workflows
- courier workflows
- admin finance
- admin station
- admin issue
- admin refund
- admin webhook
- admin export
- admin audit

Exit criteria:

- all critical task flows have offline-safe copy
- admin copy is role-safe and audit-specific
- high-risk actions have reviewed confirmation copy

### Phase 5: Expansion Readiness
Build:

- language pack manifest validation
- country pack validation
- layout expansion checks
- copy review gate
- language pack import path
- locale switch test path for QA only

Exit criteria:

- future language pack can be added without screen rewrites
- future country pack can be added without code fork
- release gate blocks unreviewed language pack changes

## Claude Code Build Brief
When Claude Code implements this foundation, build it as production infrastructure, not visual page work.

Claude Code must:

- create shared localization modules before adding screen copy at scale
- wire launch locale as `en-GH`
- wire launch country as `GH`
- wire launch currency as `GHS`
- wire launch timezone as `Africa/Accra`
- expose typed translation key helpers
- expose centralized formatters
- expose role-aware error mapping hooks
- integrate with form, state, notification, payment, issue, timeline, custody, scan, and proof components
- add tests for missing keys and formatter output
- add CI enforcement for raw user-facing strings
- keep backend contract codes untranslated
- keep public, customer, operations, and admin namespaces separated
- avoid actual public language switch UI until approved language packs exist

Claude Code must not:

- implement decorative language UI
- hard-code English strings in screen components as the long-term pattern
- use browser default timezone for operational times
- calculate prices locally
- expose raw provider messages
- expose raw enum values
- put personal data into keys
- treat Ghana launch copy as a throwaway layer

## Edge Cases
Required handling:

- missing language namespace
- malformed language pack
- missing interpolation variable
- extra interpolation variable
- unsupported locale
- unsupported country pack
- unsupported currency
- invalid timezone
- browser Intl support gap
- user device locale differs from Kra launch locale
- user enters non-English name or address text
- future right-to-left locale
- translation longer than current button width
- station name longer than expected
- payment provider label unavailable
- backend returns unknown error code
- stale cached copy after app update
- offline operations app before namespace refresh
- public page with JavaScript disabled where static copy still renders

Recovery rules:

- Unknown locale falls back to `en-GH`.
- Unknown country falls back to launch-safe unsupported-country copy.
- Unknown error code maps to a safe generic error message with support path.
- Missing key fails tests and shows safe fallback in production.
- Missing variable fails tests and logs a safe diagnostics event.
- Formatter failure shows safe plain fallback only if it does not change meaning.

## Acceptance Checklist
Product:

- Ghana launch decisions are explicit.
- English launch copy remains authoritative.
- Twi and Ewe readiness is structural.
- Country expansion happens through packs, not forks.
- Public, customer, operations, and admin copy boundaries are clear.

Engineering:

- Key namespace model is defined.
- Formatter contracts are defined.
- Provider contracts are defined.
- Error mapping contract is defined.
- Offline namespace rules are defined.
- Testing and CI gates are defined.

UX:

- Copy stays role-safe.
- Layout expansion is required.
- Public SEO copy is covered.
- Form and state copy are covered.
- Notification and status copy are covered.
- Accessibility copy is covered.

Risk:

- No raw provider messages.
- No raw backend enum display.
- No local pricing math.
- No hidden privacy leak through accessibility labels.
- No launch language switcher before approved language packs.
- No country-specific screen forks.

## Completion Statement
Claude Code should build `LocalizationFoundation` as the shared copy, locale, country, and formatting infrastructure for Kra. It must launch with `en-GH`, `GHS`, `Africa/Accra`, and English copy, while enforcing stable keys, centralized formatters, role-safe message mapping, offline-safe operations copy, accessibility-safe labels, public SEO metadata, and future Twi, Ewe, and country-pack readiness. It must not implement frontend page UI in this documentation step, must not translate backend contract identifiers, and must not allow hard-coded user-facing strings to scale across the apps.

# Accessibility Foundation Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Accessibility foundation |
| Component family | Shared UI infrastructure |
| Primary modules | `AccessibilityProvider`, `AccessibilityTokenRegistry`, `AccessiblePressable`, `AccessibleText`, `AccessibleHeading`, `FocusRing`, `FocusScope`, `SkipLink`, `LiveRegion`, `StatusAnnouncer`, `ReducedMotionGate`, `TextScaleGuard`, `ContrastGuard`, `AccessibleRouteChange`, `A11yTestHarness` |
| Supporting modules | `AccessibleFormField`, `AccessibleChoiceGroup`, `AccessibleDialog`, `AccessibleDrawer`, `AccessibleTabs`, `AccessibleTable`, `AccessibleList`, `AccessibleTimeline`, `AccessibleToast`, `AccessibleMapFallback`, `AccessibleMediaFallback`, `AccessibleProofCaptureAdapter`, `AccessibleScanAdapter`, `AccessibleStatePresenter` |
| Inventory behavior | Focus states, labels, reduced motion, contrast, text scaling |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, future shared frontend UI package if introduced |
| Primary surfaces | public web, receiver public flow, sender mobile, operations mobile, admin web console |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, support admins, finance admins, ops admins, super admins, keyboard users, screen-reader users, low-vision users, motion-sensitive users, users with motor impairments, QA, accessibility reviewers |
| Backend coverage | None directly; accessibility wraps UI for all backend states, forms, navigation, scans, proof capture, payments, issues, refunds, station actions, admin actions, and public flows |
| Browser mutation operation | None directly; this layer never performs backend mutation |
| Data sensitivity | visible and announced delivery, payment, station, issue, proof, scan, receiver, and admin details must respect each screen's privacy and redaction rules |
| Offline critical | Yes for operations mobile because field users must be able to scan, queue, recover, and understand sync state accessibly under weak network conditions |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, scan component, proof capture component, timeline component, custody chain component, payment status component, issue status component, notification system, form system, empty/error library, localization foundation, analytics tracking, test harness |
| Related state specs | loading, empty, error, offline, stale data, not authorized, session expired, blocked by payment, blocked by issue, manual review required, scan mismatch, duplicate package label, custody not confirmed, OTP required, proof required, payment under review, refund pending, webhook conflict, rate limited |
| Design tokens | focus, contrast, type scale, spacing, target size, motion, reduced motion, status color, non-color indicator, outline, hit area, density, elevation, and surface tokens |
| Accessibility target | WCAG 2.2 AA baseline for web; platform-native accessibility parity for iOS and Android; stronger internal bar for critical delivery, custody, payment, proof, refund, and admin controls |

## Purpose
The accessibility foundation is Kra's shared contract for making every product surface perceivable, operable, understandable, and robust.

It covers:

- visible focus states
- keyboard access
- screen-reader labels, roles, values, and states
- route change announcements
- status announcements
- accessible form labels and errors
- accessible empty and error states
- accessible modals and drawers
- target sizes
- text scaling
- high contrast
- non-color indicators
- reduced motion
- scan and proof fallback paths
- table and list semantics
- mobile assistive technology support
- automated and manual test requirements

The most important rule is:

```text
Kra must not require perfect vision, precise motor control, motion tolerance, hearing, or color perception to create, track, move, hand off, prove, pay, refund, or review a delivery.
```

## Product Job
Kra will be used in stressful, low-bandwidth, mobile-first delivery contexts. Accessibility is not a polish pass. It is part of operational safety.

The foundation must:

- let senders create and pay for deliveries with assistive technology
- let receivers verify and track deliveries without app install
- let station operators scan, receive, dispatch, and recover packages accessibly
- let drivers and couriers perform task flows with clear focus and state
- let admins review finance, station, issue, refund, audit, and notification data without visual-only cues
- let every user recover from loading, empty, error, offline, stale, denied, and blocked states
- prevent color-only status communication
- prevent animation-dependent understanding
- keep text usable when scaled
- support keyboard and screen reader operation across web and mobile

The product should feel serious and efficient, not simplified in a way that removes power from accessibility users.

## Strategic Role
Kra is solving delivery reliability across African conditions. Accessibility makes the system more reliable for everyone:

- clear labels reduce wrong receiver and payment details
- visible focus reduces admin mistakes
- status announcements reduce missed failures
- large touch targets reduce field entry errors
- reduced motion prevents discomfort during critical work
- color-independent status reduces payment, issue, and custody confusion
- accessible scan fallback keeps package flow moving when camera or vision access fails
- accessible proof capture helps couriers complete delivery with confidence

If accessibility is weak, the app can become unsafe:

- a station operator may not know a scan failed
- a courier may miss proof requirements
- a sender may think payment succeeded when it is under review
- an admin may approve a refund from a visually hidden warning
- a keyboard user may be trapped in a modal
- a screen-reader user may lose route context after navigation

Accessibility is part of loss prevention, payment trust, and operational quality.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing all Kra frontend surfaces.

Surface type:

- Non-visual and visual shared infrastructure for accessibility behavior across web and mobile.

Primary action:

- Make accessible behavior the default path for every shared primitive and screen.

Visual thesis:

- `Accessible by construction`: clear structure, obvious focus, legible contrast, calm motion, and explicit status create a product that feels stronger for all users.

Restraint rule:

- Do not add accessibility as one-off attributes after screens are built. Build primitives, tokens, and tests that make inaccessible patterns hard to ship.

Density:

- Mobile task flows prioritize large targets and clear state.
- Admin workflows prioritize semantic structure and keyboard efficiency.
- Public pages prioritize plain language, heading structure, and resilient layouts.

Platform stance:

- Web follows semantic HTML first, ARIA only where native semantics are insufficient.
- React Native follows native accessibility props, roles, labels, hints, values, states, and platform-specific behavior.
- All custom components need an explicit accessibility contract.

## External Research Used
Only directly relevant accessibility standards and platform sources were used:

- [Apple Human Interface Guidelines accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility): supports perceivable, adaptable, intuitive interfaces, larger text, contrast, and reduced motion principles for Apple platforms.
- [React Native accessibility](https://reactnative.dev/docs/accessibility): documents `accessible`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState`, `accessibilityValue`, and `role` behavior across iOS and Android.
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/): supports custom widget semantics, keyboard interaction patterns, dialogs, tabs, grids, and focus management.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing dynamic state changes without moving focus unexpectedly.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear text identification of input and action failures.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports meaningful focus sequence.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports minimum target sizing and spacing.
- [WCAG 2.2 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): supports visible boundaries, controls, and focus indicators.
- [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): supports readable text contrast.
- [WCAG 2.2 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): supports disabling non-essential motion triggered by user interaction.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/06-scan-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/07-proof-capture-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/08-timeline-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/09-custody-chain-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/10-payment-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/11-issue-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/12-notification-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/13-form-system.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/14-empty-error-library.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/15-qa/quality-strategy.md`

## Non-Goals
The accessibility foundation must not:

- implement actual frontend screens in this documentation PR
- reduce product capability for accessibility users
- rely only on automated checks
- replace manual screen-reader testing
- replace platform-specific behavior testing
- use ARIA to override correct native semantics without reason
- expose restricted data through accessibility labels
- add hidden text that says more than sighted users are authorized to see
- treat color contrast as the whole accessibility program
- treat keyboard support as web-only
- ignore mobile text scaling
- ignore reduced motion
- ignore offline and status announcements

## Accessibility Principles
Kra follows these principles:

### Perceivable
Users must be able to perceive:

- page purpose
- current route
- current delivery or task context
- payment status
- issue status
- custody status
- proof requirements
- scan result
- offline and sync state
- form errors
- next action

Rules:

- Use visible headings.
- Use labels and legends.
- Use text status with color.
- Use status icons with accessible names where meaningful.
- Use live announcements for asynchronous results.
- Provide text alternatives for meaningful images and media.

### Operable
Users must be able to operate:

- navigation
- menus
- forms
- scans with manual fallback
- proof capture alternatives
- filters
- tables
- modals
- drawers
- critical confirmations
- retry and recovery actions

Rules:

- Keyboard users can reach and activate every interactive control.
- Mobile assistive technology users can reach and understand every control.
- Touch targets meet minimum size and spacing.
- Focus is visible and not hidden by sticky UI.
- No action requires drag, gesture, or camera-only input without an accessible alternative.

### Understandable
Users must understand:

- what changed
- what failed
- what is pending
- what is confirmed
- what is blocked
- what must happen next

Rules:

- Use plain language.
- Avoid raw enum labels.
- Avoid internal codes except where admin-safe.
- Keep labels consistent.
- Use predictable layouts.
- Announce route changes and status changes.

### Robust
The UI must work with:

- screen readers
- keyboard
- switch control patterns where platform supports them
- high contrast
- larger text
- reduced motion
- platform zoom
- different device sizes
- offline or stale data markers

Rules:

- Use semantic HTML on web.
- Use React Native accessibility props on mobile.
- Keep custom widgets aligned with WAI-ARIA patterns where web needs them.
- Test with real assistive technology, not only static analysis.

## Token Requirements
### Focus Tokens
Required tokens:

- `focus.ring.color`
- `focus.ring.width`
- `focus.ring.offset`
- `focus.ring.radius`
- `focus.ring.inset`
- `focus.background`
- `focus.text`

Rules:

- Focus ring must be visible on all interactive controls.
- Focus ring must work on dark, light, and colored surfaces.
- Focus ring must not be clipped by overflow.
- Focus ring must remain visible inside cards, dialogs, tables, bottom bars, and list rows.
- Do not remove focus outline without replacing it with an equal or stronger visible indicator.

### Contrast Tokens
Required token pairs:

- text on surface
- text on inverse surface
- muted text on surface
- danger text on surface
- warning text on surface
- success text on surface
- focus ring on surface
- border on surface
- disabled text on surface

Rules:

- Token pairs must meet the selected contrast bar before use.
- Disabled controls must still be identifiable.
- Status colors require text, icon, shape, or label backup.
- Charts and maps must not use color alone.

### Text Scale Tokens
Required tokens:

- body
- body strong
- caption
- label
- field input
- table cell
- title
- heading
- display
- button

Rules:

- Text must support platform text scaling.
- Layout must survive large text.
- Critical mobile actions must not disappear when text scales.
- Avoid fixed-height containers for text-heavy content.
- Table cells must wrap or expose detail view.

### Target Size Tokens
Required tokens:

- `target.minimum`
- `target.compact`
- `target.comfortable`
- `target.critical`
- `target.spacing`

Rules:

- Critical actions use comfortable or critical targets.
- Dense admin tables may use compact targets only when keyboard and row detail alternatives exist.
- Mobile field operations use larger targets.
- Icon-only controls need accessible names and adequate hit areas.

### Motion Tokens
Required tokens:

- `motion.duration.fast`
- `motion.duration.normal`
- `motion.duration.slow`
- `motion.easing.standard`
- `motion.reduced.duration`
- `motion.reduced.transform`

Rules:

- Motion must clarify state, not carry meaning alone.
- Reduced motion must remove non-essential transforms.
- Status changes must not depend on animation.
- Avoid constant pulsing or looping on task screens.
- Critical toasts and banners need text state, not motion-only attention.

## Semantic Structure
### Web
Web surfaces must use:

- one primary `h1` per route
- ordered heading levels
- `main`
- `nav`
- `header`
- `footer` where applicable
- `button` for actions
- `a` for navigation
- `form`, `label`, `fieldset`, and `legend` for forms
- semantic tables for tabular data
- list semantics for lists
- dialog semantics for modals

Rules:

- Do not use clickable `div` when native control works.
- Do not use ARIA role to hide broken semantics.
- Do not place focusable controls inside `aria-hidden` containers.
- Do not create nested interactive controls.

### Mobile
React Native surfaces must use:

- `accessibilityLabel`
- `accessibilityHint` where action result is not obvious
- `accessibilityState`
- `accessibilityValue`
- `accessibilityRole` or `role`
- grouped labels for complex controls
- native modal accessibility where available

Rules:

- Touchable controls must be accessible.
- Icon-only controls must have labels.
- Selected, disabled, expanded, checked, and busy states must be exposed.
- Lists must expose item purpose and state.
- Status changes must be announced through platform mechanism where feasible.

## Focus Management
Route changes:

- focus route heading on web
- announce route title on mobile
- preserve focus only for in-place updates
- do not leave focus on removed element

Modals:

- move focus into modal when opened
- trap focus while modal is active
- restore focus to opener when closed
- close button must be reachable
- destructive modals need clear title and action labels

Drawers:

- trap focus when modal drawer is active
- restore focus when closed
- do not leave background controls reachable

Inline updates:

- do not steal focus for background refresh
- announce important status through live region
- keep user editing position stable

Error states:

- form submit failure focuses error summary on web
- route error focuses route state heading
- modal error stays inside modal
- mobile announces the error state and exposes first recovery action

## Keyboard Support
Required keyboard behavior:

- Tab reaches all controls in logical order.
- Shift+Tab moves backward.
- Enter activates primary buttons and submitted forms where safe.
- Space toggles buttons, checkboxes, switches, and selected cards where appropriate.
- Escape closes dismissible modals, drawers, and popovers.
- Arrow keys work in tabs, segmented controls, radio groups, menus, grids, and table navigation where custom components are used.

Rules:

- Never trap keyboard focus unintentionally.
- Never require mouse hover to reveal critical actions.
- Provide non-drag alternatives.
- Provide non-camera alternatives.
- Provide visible skip links on web.
- Sticky headers and footers must not obscure focus.

## Labels And Names
Every interactive control must have an accessible name.

Rules:

- Visible label preferred.
- Icon-only controls need accessible labels.
- Field labels must stay visible.
- Group labels use `fieldset` and `legend` on web where applicable.
- Error text and hint text connect to fields.
- Accessibility labels must not reveal data that visual UI hides for privacy.
- Do not duplicate visible text with extra hidden meaning unless it clarifies control purpose.

Forbidden:

- empty button names
- repeated `More` buttons without context
- unlabeled icon buttons
- hidden labels that expose restricted data
- raw enum labels where user-facing labels exist

## Status Announcements
Use `StatusAnnouncer` for:

- route loaded
- refresh complete
- refresh failed
- offline
- back online
- queued offline action
- sync complete
- scan detected
- scan mismatch
- proof upload started
- proof upload complete
- payment confirmed
- payment failed
- issue created
- form submit failed
- filter result count changed
- table export ready

Rules:

- Do not over-announce every keystroke.
- Do not announce decorative changes.
- Assertive announcements only for urgent blocking states.
- Polite announcements for progress and refresh state.
- Repeated identical announcements should be suppressed unless user retriggers action.

## Forms And Validation
The form system must satisfy accessibility foundation rules:

- visible label for every field
- hint connected to field
- error connected to field
- error summary after failed submit
- focus to summary on web
- status announcement on mobile
- optional fields clearly marked
- grouped controls use group label
- disabled submit reason available when needed
- large text supported
- keyboard-safe sticky submit area

Validation copy:

- names the field
- names the problem
- gives recovery where possible
- avoids raw schema wording

## Loading, Empty, And Error States
The empty/error library must satisfy accessibility foundation rules:

- every state has a heading
- every state has a text reason
- every state has non-color status
- dynamic state changes are announced
- retry actions have clear names
- request IDs are accessible when shown
- table empty rows preserve table structure
- banner states do not steal focus unless route-level
- offline queued state is not announced as backend-confirmed success

## Scan Accessibility
The scan component must:

- provide manual entry fallback
- explain what is being scanned
- expose scan state
- announce scan success or mismatch
- allow rescan and manual recovery
- not require camera-only completion
- not expose raw scan code after validation unless screen policy allows it
- keep focus on recovery actions after failure

## Proof Accessibility
The proof capture component must:

- explain proof type
- expose upload progress
- announce upload success or failure
- provide non-visual text state for proof requirement
- support OTP entry accessibly
- support signature and photo flows with clear alternatives where policy allows
- avoid using image preview as the only confirmation
- keep final completion action distinct from upload action

## Timeline And Custody Accessibility
Timeline:

- expose events in chronological order
- expose current status
- expose stale or partial evidence
- do not require visual connector lines to understand order
- support screen-reader navigation by event heading

Custody chain:

- expose current owner role where safe
- expose required next actor
- expose evidence confidence
- expose missing proof state
- avoid color-only custody confidence
- hide restricted actor IDs from accessibility labels when hidden visually

## Payment, Issue, And Refund Accessibility
Payment:

- status text must say pending, confirmed, failed, under review, refunded, or partial refund
- color must not be the only status cue
- payment retry state must explain whether backend confirmed failure or review

Issue:

- issue status must be text-visible
- escalated and manual review states need clear next action
- sender and field roles must not hear admin-only details through labels

Refund:

- refund status must expose amount and state only where role-safe
- pending and settled states must be distinct
- finance actions need review and keyboard confirmation

## Admin Accessibility
Admin console must support:

- keyboard navigation
- skip links
- semantic tables
- sortable header labels
- filter labels
- form summaries
- dialogs with focus trap
- persistent route heading
- visible focus in dense tables
- readable chart alternatives
- export state announcements
- request ID copy buttons with labels

Admin table rules:

- columns have headers
- row actions have unique names
- expandable rows expose expanded state
- selected rows expose selected state
- bulk actions explain count
- filter changes announce result count

## Public Web Accessibility
Public pages must support:

- clear heading hierarchy
- skip link
- visible focus
- plain language
- responsive text scaling
- accessible CTAs
- accessible tracking entry
- accessible policy pages
- no autoplay motion that blocks reading
- no image-only explanation of custody or trust

Landing page:

- hero CTA must be keyboard reachable
- sections must have headings
- trust and custody explanation must not rely on icons alone
- pricing explanation must be text-readable

## Receiver Flow Accessibility
Receiver flow must support:

- tracking link status without exposing private data
- phone challenge instructions
- OTP field accessibility
- expiry and rate-limit messages
- timeline status announcements
- arrival instructions in text
- proof or pickup requirements in plain language
- safe support route

Rules:

- Do not reveal hidden delivery facts through labels.
- Do not require app install.
- Do not require visual timeline scanning to know status.

## Operations Mobile Accessibility
Field staff flows must support:

- large touch targets
- visible task context
- scan fallback
- offline state announcements
- outbox visibility
- clear proof requirement
- single dominant action
- reduced motion
- large text
- high contrast
- recovery from conflicts

Rules:

- Do not depend on sound for scan success.
- Do not depend on vibration for feedback.
- Do not depend on camera-only input.
- Do not use tiny controls for custody-moving actions.
- Do not hide blocked reason behind icon-only badges.

## Privacy And Accessibility
Accessibility labels must follow the same privacy rules as visual UI.

Rules:

- If visual UI redacts data, accessibility label must redact it too.
- If visual UI hides staff IDs, screen reader labels must hide them too.
- If public UI cannot confirm delivery existence, labels must not confirm it.
- If customer UI hides provider reference, labels must hide it.
- If admin UI shows request ID, label may include request ID only where safe.

Forbidden:

- hidden full phone number when visual phone is masked
- hidden full address when visual address is omitted
- hidden package scan code after visual redaction
- hidden proof URL
- hidden internal note
- hidden denied record title

## Reduced Motion
The motion system must respect reduced motion.

Rules:

- Replace large movement with opacity or instant state changes.
- Remove parallax.
- Remove looping decorative motion.
- Avoid shaking fields as error feedback.
- Avoid animated route transitions that carry meaning.
- Keep progress indicators accessible with text.
- Keep scan and proof feedback textual.

Allowed motion:

- short focus-safe transition
- loading indicator with text
- brief status change if reduced motion is off

Reduced motion mode:

- no non-essential transform animation
- no looping attention animation
- no movement required to understand state

## Contrast And Color
Rules:

- Text contrast meets selected bar on every surface.
- Non-text indicators meet non-text contrast bar.
- Focus indicators meet contrast requirements.
- Disabled controls remain identifiable.
- Charts, maps, and status groups use labels or patterns beyond color.
- Payment, issue, refund, custody, scan, and proof states always include text.

Forbidden:

- red/green only status
- low-contrast disabled labels
- focus ring hidden on colored cards
- warning text on amber without contrast check
- gray text below readability bar

## Text Scaling
Rules:

- Support browser zoom and platform font scaling.
- Avoid fixed-height text containers.
- Avoid clipping labels.
- Sticky bottom bars must not cover large text fields.
- Tables need wrapping, horizontal scroll, or detail mode.
- Cards need vertical expansion.
- Mobile headers must not truncate critical status without accessible full text.

Text scaling tests:

- public landing
- tracking entry
- sender create delivery
- payment result
- issue create
- station scan
- courier proof
- admin table
- admin form
- modal confirmation

## Touch And Pointer
Rules:

- All critical controls meet target size.
- Icon controls have larger hit areas than icon art.
- Adjacent destructive and safe actions need spacing.
- Drag actions require button alternative.
- Swipe actions require visible action alternative.
- Hover-only content must also be available on focus and touch.

## Component Contracts
Every shared component must document:

- accessible role
- accessible name source
- accessible description source
- accessible state
- keyboard behavior
- focus behavior
- reduced motion behavior
- contrast requirements
- text scaling behavior
- test IDs
- forbidden data in labels

Component sign-off requires:

- visual review
- keyboard review
- screen-reader review
- large text review
- contrast review
- reduced motion review
- automated test coverage

## Analytics
Accessibility telemetry must be privacy-safe.

Allowed:

- accessibility mode flag only if user explicitly opts in or platform exposes non-sensitive setting in allowed way
- reduced motion detected true or false
- high contrast detected where allowed
- text scale bucket where allowed
- focus recovery failure count
- inaccessible action blocked in test environment
- state announcement emitted

Forbidden:

- screen-reader user identity
- disability inference
- assistive technology names in user analytics without explicit policy
- raw content from labels
- sensitive field values
- hidden accessibility labels

## Testing Requirements
Automated tests:

- axe or equivalent for web where applicable
- React Native accessibility prop tests for mobile primitives
- keyboard navigation tests for admin and web
- focus management tests for route, modal, drawer, and error summary
- color contrast token tests
- reduced motion token tests
- text scaling layout checks where feasible
- status announcer tests
- no unlabeled icon button tests

Manual tests:

- VoiceOver on iOS
- TalkBack on Android
- keyboard-only web
- browser zoom
- large text
- reduced motion
- high contrast or equivalent
- low-bandwidth and offline state with assistive technology

Critical journey tests:

- public tracking entry
- receiver OTP verification
- sender create delivery
- sender payment failed recovery
- sender issue create
- station intake scan fallback
- driver pickup scan
- courier proof capture
- offline outbox recovery
- admin pricing rule edit
- admin station validation
- admin refund settlement
- admin issue resolution

## Test IDs
Shared accessibility test IDs:

```text
a11y-skip-link
a11y-route-heading
a11y-live-region-polite
a11y-live-region-assertive
a11y-focus-scope
a11y-focus-return
a11y-reduced-motion-gate
a11y-contrast-guard
a11y-text-scale-guard
a11y-target-size-guard
a11y-dialog
a11y-drawer
a11y-table
a11y-form-summary
a11y-status-announcer
```

Rules:

- Test IDs must not include sensitive values.
- Route-specific components can prefix with screen ID.
- Test IDs identify behavior, not visual styling.

## Implementation Plan For Claude Code
1. Create accessibility token registry.
2. Create focus ring and focus scope primitives.
3. Create route change focus and announcement helper.
4. Create live region and status announcer.
5. Create reduced motion gate.
6. Create text scale guard.
7. Create contrast guard for token pairs.
8. Create target size guard.
9. Create accessible pressable primitive.
10. Create accessible heading and text primitives.
11. Create modal and drawer focus primitives.
12. Create form integration helpers.
13. Create empty/error library integration helpers.
14. Create scan and proof accessibility adapters.
15. Create admin table accessibility helpers.
16. Add automated accessibility tests.
17. Add manual accessibility QA checklist.

Do not retrofit route by route first. Build primitives, tokens, and tests, then require screens to use them.

## Completion Checklist
The accessibility foundation is complete when an engineer can answer:

- What is the accessible name of every control?
- What is the role of every custom component?
- Where does focus go after navigation?
- Where does focus go after modal open and close?
- How are status changes announced?
- How are form errors announced?
- How does the screen work without color?
- How does the screen work with reduced motion?
- How does the screen work with large text?
- What is the manual fallback for camera scan?
- What is the non-visual proof confirmation?
- What sensitive data is excluded from labels?
- Which tests enforce the behavior?

## Final Quality Bar
The implementation is not acceptable unless:

- every route has a meaningful heading
- every interactive control has an accessible name
- every custom control has role, state, focus, and keyboard behavior
- every critical action is keyboard and screen-reader reachable
- every form has labels, hints, field errors, and summary behavior
- every dynamic status has an announcement path
- every status has non-color indication
- every focus state is visible
- every modal traps and restores focus
- every route-level state manages focus
- every mobile task supports large targets
- every screen supports reduced motion
- every screen survives large text
- every sensitive label respects redaction policy
- every critical journey has accessibility tests

This infrastructure spec is complete when Claude Code can build Kra frontend screens where accessibility is the default behavior of shared primitives, not a late route-by-route correction.

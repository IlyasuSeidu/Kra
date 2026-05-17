# Public Maintenance Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PublicMaintenance` |
| App | `apps/web` |
| Route | `/maintenance` |
| Primary test ID | `screen-public-maintenance` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Health/config signal only |
| Related routes | `/`, `/track`, `/support`, `/service-areas`, `/delivery-policy`, `/privacy`, `/terms` |
| Required states | `normal` |

## Product Job
This page must explain a service interruption without creating panic, false promises, or data exposure. It is the public fallback when Kra knows the web experience, tracking lookup, or delivery creation path should not continue normally because a maintenance flag, readiness failure, deployment interruption, or platform-level incident is active.

The page must help users:
- Understand that Kra is temporarily unavailable or partially unavailable.
- Know whether tracking, support, or policy pages may still be accessible.
- Retry safely without repeated form submissions.
- Reach support when they have an urgent delivery concern.
- Avoid taking operational action based on stale or incomplete information.
- Trust that the issue is being handled without seeing internal incident data.
- Return to normal flows when service recovers.

This page is not an incident dashboard, admin console, public status page, support thread, or delivery timeline. It is a controlled public interruption surface.

## Audience
Primary audience:
- Senders trying to create, pay for, or check a delivery.
- Receivers trying to track a package or open a tracking link.
- Visitors evaluating whether Kra is currently available.

Secondary audience:
- Support users who need a safe route to contact Kra during an outage.
- Operations staff who may be asked by customers what the public page says.
- Partners or business senders checking whether service is open.

## User State
Users may be blocked, anxious, on a weak network, or already dealing with a package delay. They may reload repeatedly. They may assume their package or payment has been lost if the page sounds vague. The page must be direct, calm, and specific about what the user can do now.

## Primary Action
Primary CTA: `Try again`

Secondary CTA: `Track a package`

Tertiary CTA: `Contact support`

CTA behavior:
- `Try again` rechecks the safe public availability signal and returns to the originally requested route only when the signal is clear.
- `Track a package` routes to `/track` only when public tracking is not marked unavailable; otherwise it shows a clear disabled or unavailable state.
- `Contact support` routes to `/support` if support is available; otherwise it exposes the approved emergency support instruction from configuration or public copy.

## Main Tension
The page must be transparent without overdisclosing. Users need enough information to act, but the UI must not publish internal incident identifiers, engineering notes, unresolved security details, provider internals, staff names, raw health payloads, stack traces, or exact restoration claims that the business cannot guarantee.

## Visual Thesis
Design this page as a calm operations notice: a focused service-status panel, clear next action, restrained operational context, and a direct path to tracking or support. It should feel serious and premium, not like a generic error page.

## Restraint Rule
Do not turn the maintenance page into a full status center. Avoid live incident feeds, public uptime charts, animated panic graphics, broad recovery promises, invented support contacts, countdown timers, false progress, and generic server-error art.

Every visual element must help one of these:
- Explain the current interruption.
- Tell the user what still works.
- Provide a safe next action.
- Prevent duplicate action or payment confusion.
- Route urgent users to support.
- Preserve accessibility on low-end phones and weak networks.

## Elite Quality Gate
This spec is not closed unless the resulting UI can stand beside the top `0.1%` of reliability, logistics, fintech, carrier, and public-service interruption experiences.

Non-negotiable quality requirements:
- The first viewport must say service is temporarily unavailable or under maintenance.
- The page must not render raw backend health responses.
- The page must not expose stack traces, incident keys, internal owners, provider references, secrets, or environment names.
- The page must not promise a precise restoration time unless a reviewed public message provides one.
- The page must show what users can do now.
- The page must distinguish platform maintenance from route unavailability when the signal allows it.
- The page must route support and tracking safely, not blindly.
- The page must avoid repeated auto-refresh that drains battery or hammers the API.
- The page must work when JavaScript is delayed, partial, or unavailable where the hosting stack allows static fallback.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and poor network conditions.

Closure rule:
- If users cannot tell whether to retry, track, or contact support, the screen remains open.
- If the page can leak internal outage details, the screen remains open.
- If the page implies packages are lost or payments failed without backend confirmation, the screen remains open.
- If the design looks like a generic `500` page instead of a trusted Kra interruption surface, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- Atlassian Statuspage scheduled-maintenance guidance: maintenance communication should identify service impact, timing, and updates without burying the status.
- Cloudflare Status guidance: public availability communication should separate platform health from support and documentation access.
- GOV.UK service problem patterns: interruption pages should be direct, plain-language, and action-oriented.
- MDN HTTP `503` guidance: temporary unavailability can include retry semantics, but clients must not assume recovery timing unless provided.
- W3C WCAG 2.2 quick reference: status messages, focus, contrast, error prevention, and navigation must remain accessible.

Reference links:
- https://support.atlassian.com/statuspage/docs/schedule-maintenance/
- https://www.cloudflarestatus.com/
- https://design-system.service.gov.uk/patterns/there-is-a-problem-with-the-service-pages/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external status layouts, incident language, illustrations, icons, page titles, error wording, or brand assets.

## Required Page Outcomes
A successful visitor must be able to answer:
- Is Kra unavailable right now?
- Is this maintenance, an incident, or a limited-service interruption?
- Can I still track my package?
- Can I still contact support?
- Should I retry now or wait?
- Will retrying create a duplicate delivery or payment?
- What should I do if my package is urgent?
- Where can I read public delivery and refund rules?
- How do I know when normal service returns?

## Route And Navigation Rules
### Canonical Route
- Render at `/maintenance`.
- Must be public and unauthenticated.
- Must not require account creation.
- Must not require app install.
- Must not require receiver phone verification.
- Must not call authenticated admin APIs.
- Must not read admin launch readiness directly.
- Must not expose operational dashboards.

### Automatic Routing Into Maintenance
The app may route a user to `/maintenance` when:
- A public runtime configuration marks maintenance active.
- The web host or edge router rewrites user-facing routes to `/maintenance`.
- A safe public health/config probe returns an approved maintenance state.
- The API readiness check fails and the web shell is configured to use maintenance fallback.
- A deployment flag intentionally pauses public delivery creation or tracking.

Rules:
- Preserve the originally requested path in a safe, client-local `returnTo` value when possible.
- `returnTo` must only allow same-origin relative paths.
- Never store a full URL containing secrets, tokens, or private query values.
- Do not redirect into maintenance for normal validation errors.
- Do not redirect into maintenance for route-level serviceability errors such as an unsupported corridor.
- Do not redirect into maintenance for ordinary `404` pages.
- Do not redirect into maintenance for authenticated permission errors.

### Direct Route Visit
When a user opens `/maintenance` directly:
- Render the normal maintenance page.
- Do not assume there is an active incident unless the current signal says so.
- If no active maintenance signal exists, show a light `service is available` state with routes back to `/`, `/track`, and `/support`.
- Do not auto-redirect immediately in a way that disorients screen-reader or keyboard users.

### Return Behavior
When the user taps `Try again`:
- Recheck the public availability signal.
- If service is available and `returnTo` is safe, route back to `returnTo`.
- If service is available and `returnTo` is absent, route to `/`.
- If service is still unavailable, keep the user on `/maintenance` and update the visible status message.
- If the check fails due to network loss, show network recovery copy instead of implying Kra is still down.

## Activation Signal Contract
The inventory names the backend coverage as `health/config signal`. Implement this as a frontend contract, not as a new backend feature unless backend docs later define one.

### Existing Backend Health Signals
Current backend code exposes:
- `/health/live`
- `/health/ready`

The API health contract declares:
- service: `api`
- readiness checks: `firestore`, `storage`, `task-queue`
- liveness checks: `process`, `configuration`

Frontend behavior:
- Use public app configuration for intentional maintenance where available.
- Use `/health/ready` only as a coarse readiness signal when the web architecture supports it.
- Treat `/health/live` as infrastructure liveness, not user-facing product availability.
- Do not render raw health response fields to public users.
- Do not expose `firestore`, `storage`, `task-queue`, `process`, or `configuration` as public failure labels.

### Supported Public Signal Shape
If the frontend introduces a public config object, it should normalize to:

```ts
type PublicMaintenanceSignal = {
  active: boolean;
  mode: "maintenance" | "partial_outage" | "recovery" | "available";
  affectedSurfaces: Array<"tracking" | "delivery_creation" | "payment" | "support" | "public_web">;
  publicMessage?: string;
  nextUpdateAt?: string;
  retryAfterSeconds?: number;
};
```

Rules:
- `active` controls whether `/maintenance` acts as an interruption page.
- `mode` controls tone and explanation.
- `affectedSurfaces` controls which links are enabled or disabled.
- `publicMessage` must be preapproved customer-facing copy.
- `nextUpdateAt` may say when Kra expects to post another update, not when service is guaranteed to return.
- `retryAfterSeconds` may throttle the `Try again` button, but must never create a forced countdown promise.

### Signal Precedence
Use this precedence:
- Explicit public maintenance config.
- Edge-host maintenance flag.
- API readiness fallback.
- Local network failure state.
- No active maintenance.

If signals conflict:
- Favor the safer interruption state.
- Avoid exposing low-level conflict details.
- Log client-side conflict telemetry without showing raw configuration.

## Backend And API Boundaries
### Allowed Calls
The page may call:
- Safe public config endpoint if one exists.
- `/health/ready` if the public web architecture approves it.
- No-store static config loaded with the web shell.

### Disallowed Calls
The page must not call:
- `GET /v1/admin/launch-readiness`
- Admin station endpoints.
- Delivery mutation endpoints.
- Payment initialization or verification endpoints.
- Support issue mutation endpoint unless the user explicitly enters the support flow.
- Public tracking lookup automatically unless the user chooses tracking.

### Error Handling Boundary
If readiness returns a server error:
- Show a broad public service interruption message.
- Do not show the backend error code.
- Do not show stack traces.
- Do not show provider names.
- Do not show internal checks.

If readiness times out:
- Show `We could not confirm service status from this connection.`
- Offer `Try again`.
- Offer `/support` only if support is available.

If the browser is offline:
- Show `Your connection appears offline.`
- Explain that package status cannot be checked until the device reconnects.
- Do not label Kra as down.

## Information Architecture
Recommended page sections:
- Status hero.
- What you can do now.
- Affected service summary.
- Safe retry and recovery.
- Urgent package help.
- Policy and trust links.
- Footer.

Section order must stay this focused on mobile:
- Status hero.
- Primary action row.
- Affected service summary.
- Support route.
- Policy links.

Do not bury the recovery action below long incident explanation.

## Content Model
### Required Content Fields
The screen must have:
- Page title.
- Plain-language status statement.
- Short explanation.
- Current action guidance.
- Retry control.
- Tracking route status.
- Support route status.
- Optional next update statement.
- Links to delivery policy, refund policy, privacy, and terms.

### Optional Content Fields
The screen may show:
- Maintenance mode label.
- Partial outage label.
- Recovery mode label.
- Next update time.
- Retry availability time.
- Affected public surfaces.
- Support availability instruction.

### Forbidden Content Fields
The screen must never show:
- Internal incident ID.
- Internal issue ID.
- Raw request ID.
- Stack trace.
- Cloud provider region.
- Database name.
- Queue name.
- Secret or environment variable name.
- Staff name or staff ID.
- Provider payload.
- Internal runbook link.
- Admin dashboard URL.
- Security investigation details.

## State Model
Although the inventory lists `normal`, implementation must distinguish sub-states inside the page so users get precise copy.

### `maintenance_active`
Use when:
- Planned maintenance is active.
- Public config says the platform is intentionally paused.

Required UI:
- Title: `Kra is under maintenance`
- Body explains that service is paused while work is completed.
- Primary action is `Try again`.
- Secondary action routes to available surfaces.
- Show next update time only when supplied by public config.

### `partial_outage`
Use when:
- Some public services are unavailable but others can continue.

Required UI:
- Title: `Some Kra services are unavailable`
- Body explains that affected services are limited.
- Render an affected service summary.
- Keep available routes enabled.
- Disable unavailable routes with visible reason text.

### `recovery`
Use when:
- Service is coming back but may still be unstable.

Required UI:
- Title: `Kra is recovering`
- Body explains that normal service is returning and some actions may take longer.
- Primary action remains `Try again`.
- Avoid declaring the incident resolved until signal says `available`.

### `available`
Use when:
- The user visits `/maintenance` but no interruption signal is active.

Required UI:
- Title: `Kra is available`
- Body explains that the user can return to normal service.
- Primary action routes to `/`.
- Secondary action routes to `/track`.
- Do not render alarming outage language.

### `network_unknown`
Use when:
- Browser or request failure prevents status confirmation.

Required UI:
- Title: `We could not check service status`
- Body explains that the connection may be unavailable.
- Primary action is `Try again`.
- Secondary action can route to cached public policy pages if available.
- Do not blame Kra.

### `retry_limited`
Use when:
- `retryAfterSeconds` exists or repeated retry attempts are throttled locally.

Required UI:
- Disable `Try again` until the configured delay ends.
- Explain `You can try again shortly.`
- Avoid a recovery countdown that implies service will return at that time.

## Layout Blueprint
### Desktop
Use a restrained two-column layout:
- Left column: status hero, explanation, actions.
- Right column: affected services, support path, policy links.

Recommended structure:
- Header with Kra wordmark and minimal navigation.
- Centered main container with max width around `1120px`.
- Hero card with a strong status icon or signal bar.
- Action row with primary and secondary CTAs.
- Service summary card.
- Support card.
- Policy link strip.
- Footer.

### Tablet
Use stacked cards:
- Hero full width.
- Service summary and support cards in two columns if space allows.
- Policy links below.

### Mobile
Use one-column layout:
- Header compressed.
- Hero starts above the fold.
- CTAs full width.
- Service summary uses compact rows.
- Support route appears before policy links.
- Footer remains short.

Mobile must avoid:
- Horizontal scrolling.
- Dense tables.
- Small touch targets.
- Long paragraphs above the primary action.
- Sticky banners that cover action buttons.

## Visual Direction
### Mood
Calm, operational, serious, and clear.

### Composition
- Use a large status panel with strong typography.
- Use neutral background with a subtle operational grid or soft gradient.
- Use one accent color based on mode.
- Use generous whitespace so the page feels controlled, not broken.

### Color Rules
- Maintenance active: use `warning.amber.600` as the accent.
- Partial outage: use `warning.amber.600` with neutral framing.
- Recovery: use `brand.blue.600` as the accent.
- Available: use `success.green.600` as the accent.
- Unknown or severe outage: use `danger.red.600` sparingly, only when the message requires it.

Status color must never be the only indicator. Pair color with text and iconography.

### Typography
- Use the repository-approved public design system.
- Headings use `Manrope`.
- Body and data-heavy labels use `Inter`.
- The hero title should be large enough to dominate the first viewport.
- Body copy should be short, concrete, and readable at mobile sizes.

### Iconography
Use one high-quality line or filled icon per status:
- Maintenance: tool or shield-check motif.
- Partial outage: split signal motif.
- Recovery: circular progress or pulse motif.
- Available: check motif.
- Unknown: connection or alert motif.

Icons must be decorative only if the text already says the status. If the icon carries meaning, provide an accessible label.

## Header Rules
The header should include:
- Kra wordmark.
- Link to `/`.
- Link to `/track` only if tracking is available or marked as checkable.
- Link to `/support` only if support is available or marked as checkable.

The header should not include:
- Full marketing navigation.
- Sign-in pressure.
- Pricing CTA.
- App download CTA.
- Admin links.

When maintenance is active, the header should feel stable and minimal, not promotional.

## Hero Section
### Required Elements
- Status label.
- Page title.
- Short explanation.
- Last checked text or next update text when available.
- Primary action.
- Secondary action.

### Hero Copy Patterns
Maintenance active:
- Label: `Maintenance`
- Title: `Kra is under maintenance`
- Body: `We are making a planned update. Some delivery and tracking actions may not be available right now.`

Partial outage:
- Label: `Limited service`
- Title: `Some Kra services are unavailable`
- Body: `You may still be able to track a package or contact support, but some actions are temporarily paused.`

Recovery:
- Label: `Recovering`
- Title: `Kra is recovering`
- Body: `Service is returning. If an action fails, wait briefly and try again.`

Available:
- Label: `Available`
- Title: `Kra is available`
- Body: `No active maintenance message is published right now. You can return to normal service.`

Network unknown:
- Label: `Connection`
- Title: `We could not check service status`
- Body: `Your connection may be offline or slow. Reconnect and try again.`

### Hero Do Not
- Do not say `Everything is safe` unless backed by incident review.
- Do not say `No packages are affected` unless public incident copy explicitly says it.
- Do not say `Back in 5 minutes` unless public config provides a reviewed update time and copy.
- Do not show `500`, `503`, or `504` as the main title.
- Do not use humor.

## Action Area
### Primary Retry Button
Label:
- `Try again`

Behavior:
- Calls the status recheck.
- Shows loading state while checking.
- Uses visible focus state.
- Disables only while checking or retry-limited.
- Does not submit any delivery, payment, tracking, or support mutation.

Loading copy:
- `Checking service status...`

Failure copy:
- `We could not confirm service status. Check your connection and try again.`

Still unavailable copy:
- `Service is still unavailable. We will keep this page updated when public status changes.`

### Tracking Button
Label:
- `Track a package`

Behavior:
- Routes to `/track` when tracking is available or unknown but not explicitly disabled.
- If tracking is affected, keep the button visible but disabled with explanation.
- Do not auto-run tracking lookup from this page.

Disabled explanation:
- `Tracking is temporarily unavailable. Try again shortly or contact support for urgent package questions.`

### Support Button
Label:
- `Contact support`

Behavior:
- Routes to `/support` when support is available.
- If support is affected, show approved emergency instruction if configured.
- If no emergency instruction exists, show `Support is temporarily unavailable. Try again shortly.`

## Affected Service Summary
Render a compact summary card titled:
- `What is affected`

Rows:
- `Public web`
- `Package tracking`
- `Delivery creation`
- `Payments`
- `Support`

Row status values:
- `Available`
- `Limited`
- `Unavailable`
- `Checking`

Rules:
- Only show rows that are relevant to the public web experience.
- Do not show internal infrastructure such as database, storage, queue, task workers, readiness checks, or region.
- Do not show internal severity codes.
- Do not show exact incident root cause unless public copy explicitly provides it.

Recommended row copy:
- `Public web`: `This page is available.`
- `Package tracking`: `Tracking may be delayed or unavailable.`
- `Delivery creation`: `New delivery actions may be paused.`
- `Payments`: `Do not retry payment unless the app asks you to.`
- `Support`: `Use support for urgent delivery concerns when available.`

Payment row rule:
- Be especially careful with payment copy. Never imply that a failed page load means a payment failed, succeeded, or duplicated. Direct users to the payment result screen or support when normal service returns.

## Safe Retry And Refresh
### Retry Cadence
- Manual retry is preferred.
- Automatic recheck may run no more often than every `60 seconds`.
- Pause automatic recheck when the browser tab is hidden.
- Respect `retryAfterSeconds` when supplied.
- Stop automatic recheck after repeated failures and ask the user to retry manually.

### Avoid API Pressure
- Use exponential backoff for repeated failures.
- Cache the last known signal for a short safe period.
- Do not poll protected endpoints.
- Do not run tracking lookups in the background.
- Do not run payment verification in the background.

### User Feedback
Show one of:
- `Last checked just now.`
- `Last checked {relativeTime}.`
- `Next public update expected {time}.`
- `You can try again shortly.`

Do not show:
- Internal timestamps.
- Server clock drift.
- Raw retry headers.
- Unreviewed maintenance window details.

## Urgent Package Help
Render a section titled:
- `If your package is urgent`

Required copy:
- `If you believe a package is at risk, contact support when the support route is available. Do not create a second delivery or repeat payment unless the app confirms the original action failed.`

Support guidance:
- Link to `/support` when available.
- Link to `/delivery-policy` for delivery lifecycle expectations.
- Link to `/refund-policy` for refund and dispute expectations.
- Link to `/track` when tracking is available.

Do not provide:
- Personal phone numbers unless approved in config.
- Staff names.
- Station staff contacts.
- Emergency claims not supported by operations.
- Package-specific status without tracking verification.

## Policy Link Strip
Include compact links:
- `Delivery policy`
- `Refund policy`
- `Privacy`
- `Terms`

Purpose:
- Help blocked users understand policy boundaries without opening support prematurely.
- Preserve trust during interruptions.

Rules:
- Links must remain accessible.
- Links should open same tab by default.
- Do not hide policy links behind accordions on desktop.
- On mobile, a simple list is acceptable.

## Copy System
### Voice
Use:
- Clear.
- Calm.
- Operational.
- Accountable.
- Low-hype.

Avoid:
- Marketing language.
- Jokes.
- Blame.
- Technical jargon.
- Over-apology.
- Vague reassurance.

### Approved Terms
Use:
- `package`
- `tracking`
- `delivery`
- `support`
- `maintenance`
- `temporarily unavailable`
- `try again`
- `public update`

Avoid in public copy:
- `custody`
- `projection`
- `firestore`
- `task queue`
- `deployment rollback`
- `incident commander`
- `root cause`
- `P1`
- `SLO`
- `error budget`

Internal terms may appear in developer notes inside this spec, but not in customer-facing UI copy.

### Main Page Copy
Default active message:
- `Kra is temporarily unavailable. We are working to restore normal service. You can try again, track a package if tracking is available, or contact support for urgent delivery concerns.`

Planned maintenance message:
- `Kra is under maintenance. We are making a planned update, so some delivery and tracking actions may not be available right now.`

Partial outage message:
- `Some Kra services are unavailable. Available actions remain open below, and affected actions are marked clearly.`

Recovery message:
- `Kra is recovering. Service may still be slower than usual while normal operations return.`

Available message:
- `Kra is available. There is no active maintenance message right now.`

Network unknown message:
- `We could not check service status from this connection. Reconnect and try again.`

### Button Copy
Use exact labels:
- `Try again`
- `Track a package`
- `Contact support`
- `Return home`
- `Read delivery policy`
- `Read refund policy`

Do not use:
- `Go back to safety`
- `Panic button`
- `Refresh server`
- `Resolve incident`
- `Force retry`

## Component Requirements
### `MaintenanceStatusHero`
Props:
- `mode`
- `title`
- `body`
- `lastCheckedAt`
- `nextUpdateAt`
- `retryDisabledUntil`
- `onRetry`
- `isChecking`

Behavior:
- Renders mode-specific label, title, body, and actions.
- Announces status changes through an accessible status region.
- Does not use route-specific delivery data.

### `AffectedServicesCard`
Props:
- `services`

Behavior:
- Renders public service rows only.
- Uses text plus color.
- Hides internal infrastructure.
- Keeps layout table-free on mobile.

### `MaintenanceActionGroup`
Props:
- `canTrack`
- `canContactSupport`
- `retryState`
- `returnTo`

Behavior:
- Controls primary and secondary actions.
- Prevents unsafe return paths.
- Shows disabled explanations inline.

### `UrgentPackageHelp`
Props:
- `supportAvailable`
- `trackingAvailable`

Behavior:
- Gives package-safe guidance.
- Does not imply package status.
- Routes users to support or policy.

### `MaintenancePolicyLinks`
Props:
- none required.

Behavior:
- Renders required policy links.
- Keeps link text direct.
- Supports keyboard and screen reader navigation.

## Interaction Details
### Page Load
On load:
- Render the static shell immediately.
- Show the best known public signal.
- Start one safe status check if configured.
- Announce the status only after the check resolves or changes.

Do not:
- Block first paint on a slow health check.
- Show a blank page.
- Flash a stack error.
- Redirect repeatedly between requested route and `/maintenance`.

### Retry
On retry:
- Put focus on the status region after the check completes.
- If recovered, route safely to the original path or home.
- If still down, keep focus on the updated status message.
- If network unknown, show connection-specific copy.

### Disabled Actions
If tracking or support is disabled:
- Keep the button or link visible.
- Use `aria-disabled` for non-button links as appropriate.
- Provide an adjacent reason.
- Do not make disabled controls focus traps.

### Keyboard
Keyboard order:
- Skip link.
- Header logo/home.
- Status hero.
- `Try again`.
- `Track a package`.
- `Contact support`.
- Affected services.
- Policy links.
- Footer.

Focus must never jump unexpectedly during status polling.

## Accessibility Requirements
### Semantics
- Use one `h1`.
- Use logical `h2` headings for sections.
- Use `main`.
- Use a `role="status"` or `aria-live="polite"` region for status changes.
- Use `aria-busy` while retry check is running.
- Use `aria-describedby` for disabled action explanations.

### Status Messages
- Status changes must be announced without moving focus unless the user initiated retry.
- Do not use assertive live regions except for a severe action-blocking error.
- Avoid constantly changing text that screen readers reannounce.

### Contrast And Text
- Meet WCAG AA contrast at minimum.
- Body text should not drop below `16px`.
- Interactive targets should be at least `44px` high on touch devices.
- Long copy must remain readable at `200%` zoom.

### Motion
- Support `prefers-reduced-motion`.
- Use motion only for the retry spinner or subtle status transition.
- Do not use looping animation.
- Do not animate the page into view in a way that delays status comprehension.

### Offline And Low Bandwidth
- The shell should be small and resilient.
- Avoid remote decorative assets.
- Do not rely on video.
- Do not load heavy illustration bundles.
- Render useful text even if custom fonts fail.

## Responsive Requirements
### Breakpoints
Use project breakpoints, but ensure:
- `320px` width remains usable.
- `375px` common mobile width has no horizontal overflow.
- Tablet layout uses two cards only if content remains readable.
- Desktop layout keeps line length controlled.

### Mobile Rules
- Primary action appears before service detail.
- CTAs are full width.
- Service rows use stacked labels.
- Policy links become a vertical list.
- Header navigation is reduced.

### Desktop Rules
- Hero occupies the strongest visual weight.
- Service summary is visible above fold or immediately after the hero.
- Support route is visible without scrolling on common laptop heights where possible.

## SEO And Metadata
### Metadata
Set:
- `title`: `Kra Service Status`
- `description`: `Kra is temporarily unavailable or under maintenance. Check service status, retry, track a package when available, or contact support.`

### Robots
Use:
- `robots: noindex, nofollow` when active maintenance is being served to crawlers.
- If `/maintenance` is a permanent route and no active maintenance exists, still prefer `noindex` because this page is operational fallback, not evergreen content.

### Canonical
- Canonical route: `/maintenance`.
- Do not canonicalize normal public pages to `/maintenance`.
- Do not replace marketing page metadata globally when maintenance is inactive.

### HTTP And Hosting
If the hosting layer can set response status:
- Planned maintenance may use `503 Service Unavailable`.
- Include `Retry-After` only when a reviewed retry time exists.
- If the static app cannot set status, the page must still render correct UI copy and telemetry.

Do not rely on HTTP status alone for user communication.

## Security And Privacy
### Public Data Rule
This page must be safe to view by anyone with no authentication.

Do not display:
- Delivery IDs.
- Tracking codes.
- Receiver phone numbers.
- Sender information.
- Payment state.
- Refund state.
- Proof assets.
- Staff or station internal records.

### Return URL Rule
If preserving `returnTo`:
- Allow only same-origin relative paths.
- Strip unsafe query values.
- Reject protocol-relative URLs.
- Reject absolute external URLs.
- Reject paths containing auth tokens.

### Logging Rule
Client telemetry may record:
- screen viewed.
- mode.
- affected public surface count.
- retry clicked.
- route selected.
- recovery route taken.

Client telemetry must not record:
- tracking code.
- phone number.
- payment reference.
- raw health payload.
- incident internals.
- full `returnTo` with private query values.

## Analytics Requirements
Required events:
- `public_maintenance_viewed`
- `public_maintenance_retry_clicked`
- `public_maintenance_retry_result`
- `public_maintenance_tracking_clicked`
- `public_maintenance_support_clicked`
- `public_maintenance_returned_to_service`

Event properties:
- `mode`
- `affectedSurfaceCount`
- `trackingAvailable`
- `supportAvailable`
- `hasNextUpdateAt`
- `retryResult`

Allowed `retryResult` values:
- `available`
- `still_unavailable`
- `network_unknown`
- `retry_limited`
- `error`

Do not include:
- tracking code.
- delivery ID.
- user ID.
- phone number.
- payment reference.
- raw URL.

## Error And Edge Cases
### Config Missing
If public config is missing:
- Show `We could not check service status`.
- Offer retry.
- Do not show internal config error.

### Config Malformed
If public config is malformed:
- Fall back to `network_unknown` or safe maintenance mode based on routing context.
- Log sanitized client error.
- Show general public copy.

### Health Check Timeout
If `/health/ready` times out:
- Show connection/service uncertainty.
- Do not show endpoint name.
- Offer retry.

### Maintenance Ends While User Is Viewing
If the signal changes to available:
- Update title to `Kra is available`.
- Offer return to previous route.
- Do not force redirect unless the user initiated retry or the route guard requires it.

### User Opens Tracking During Partial Outage
If tracking is available:
- Route to `/track`.
- Do not prefill or infer a tracking code.

If tracking is unavailable:
- Keep user on maintenance.
- Show disabled reason.

### User Opens Support During Partial Outage
If support is available:
- Route to `/support`.

If support is unavailable:
- Show approved public instruction or disabled reason.

### Browser Offline
If `navigator.onLine` is false or fetch fails before reaching server:
- Use `network_unknown`.
- Mention connection.
- Do not imply platform outage.

## Performance Requirements
### Initial Load
- The static shell should render fast on low-end mobile devices.
- Avoid heavy assets.
- Avoid blocking status text on web font load.
- Avoid client bundle growth from decorative animation libraries.

### Runtime
- Polling must be bounded.
- Retry checks must be cancellable on route change.
- Use `AbortController` or project-equivalent fetch cancellation.
- Avoid layout shift when status changes.

### Asset Rules
- No video.
- No large background images.
- SVG or CSS illustration only if small and meaningful.
- Do not load maps.
- Do not load tracking timeline components.
- Do not load payment modules.

## Testing Requirements
### Unit Tests
Test:
- Renders maintenance active state.
- Renders partial outage state.
- Renders recovery state.
- Renders available state.
- Renders network unknown state.
- Sanitizes `returnTo`.
- Disables tracking when affected.
- Disables support when affected.
- Does not expose raw health fields.
- Does not expose internal infrastructure labels.

### Integration Tests
Test:
- `/maintenance` renders `screen-public-maintenance`.
- Retry calls only the approved status/config source.
- Retry returns to safe `returnTo` when available.
- Unsafe `returnTo` falls back to `/`.
- Tracking button routes to `/track` when available.
- Support button routes to `/support` when available.
- Active maintenance keeps user on page when service remains unavailable.
- Browser offline state does not blame Kra.

### Accessibility Tests
Test:
- One `h1`.
- Status updates are announced.
- Buttons are keyboard reachable.
- Disabled actions have readable reasons.
- Contrast passes.
- Reduced motion removes nonessential animation.
- Page works at `200%` zoom.
- No focus trap after retry.

### End-To-End Tests
Test name: `public_maintenance_active`
- Visit `/maintenance` with active maintenance signal.
- Assert `screen-public-maintenance` is visible.
- Assert title is visible.
- Assert `Try again` is visible.
- Assert no raw health fields appear.

Test name: `public_maintenance_partial_outage`
- Provide partial outage signal with tracking unavailable and support available.
- Assert tracking action is disabled with reason.
- Assert support action routes to `/support`.

Test name: `public_maintenance_recovered_return`
- Visit `/maintenance?returnTo=/track`.
- Set retry response to available.
- Click `Try again`.
- Assert route becomes `/track`.

Test name: `public_maintenance_blocks_unsafe_return`
- Visit `/maintenance?returnTo=https://attacker.invalid`.
- Set retry response to available.
- Click `Try again`.
- Assert route becomes `/`.

Test name: `public_maintenance_network_unknown`
- Simulate status check network failure.
- Assert connection-specific copy.
- Assert platform outage wording is not shown as fact.

## Implementation Notes For Claude Code
### Build Scope
Build only the public maintenance screen and its supporting components. Do not implement admin incident tooling, public status subscriptions, launch-readiness dashboards, or delivery-specific state.

### Files To Consider
Likely implementation areas:
- `apps/web` route for `/maintenance`.
- Shared public layout components.
- Public status/config client if one already exists.
- Public analytics wrapper.
- Public test utilities.

Follow existing project patterns for routing, metadata, styling, and tests.

### Data Contract Discipline
If no public config endpoint exists:
- Implement the page with a typed local adapter that can consume future config.
- Do not add backend endpoints without a separate backend task.
- Do not call admin APIs.
- Do not create frontend-only launch readiness logic.

### Styling Discipline
Use existing tokens:
- `brand.blue.600`
- `success.green.600`
- `warning.amber.600`
- `danger.red.600`
- `neutral.900`
- `neutral.700`
- `neutral.500`
- `neutral.100`
- `surface`

Use existing spacing tokens:
- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

Avoid one-off colors unless added to the design system by a separate design-system task.

## Acceptance Criteria
The screen is complete when:
- `/maintenance` renders correctly.
- Primary test ID is `screen-public-maintenance`.
- The page supports active, partial outage, recovery, available, network unknown, and retry-limited sub-states.
- The page never exposes raw health/config internals.
- The page never calls admin endpoints.
- Retry returns only to safe same-origin routes.
- Tracking and support actions respect availability.
- Policy links are present.
- Metadata is set.
- `noindex` is applied.
- Analytics events are implemented without sensitive values.
- Accessibility tests pass.
- End-to-end tests cover active, partial outage, recovery, unsafe return, and network unknown cases.
- The UI remains useful on mobile and weak networks.

## Source Alignment Checklist
This spec aligns with:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/07-api/error-codes.md`
- `docs/11-ops/incident-management.md`
- `docs/12-engineering/deployment-runbook.md`
- `docs/12-engineering/release-plan.md`
- `docs/14-platform/slo-sla.md`
- `docs/14-platform/observability-and-alerting.md`
- `docs/14-platform/disaster-recovery.md`
- `services/api/src/app.ts`
- `services/api/src/index.ts`

## Anti-Patterns To Reject
Reject any implementation that:
- Shows a generic unstyled error page.
- Uses a full public incident feed without product approval.
- Shows raw `503` or stack trace as user copy.
- Shows internal readiness check names.
- Uses alarming visuals that imply package loss.
- Promises automatic refunds.
- Promises a guaranteed restoration time.
- Starts a delivery or payment retry from the maintenance page.
- Routes users to admin surfaces.
- Records sensitive values in analytics.
- Polls aggressively.
- Breaks on small screens.
- Hides support and policy paths.

## Final Quality Review
Before closing implementation, review the built screen from five viewpoints:
- Blocked sender: understands not to create duplicate delivery or repeat payment.
- Receiver: knows whether tracking is available and how to get help.
- Support lead: can defend the public copy during an incident.
- Security reviewer: sees no internal data leakage.
- Accessibility reviewer: can navigate and understand state changes without visual cues.

Pass condition:
- The page feels like a controlled Kra service notice, not a broken app.
- The interruption copy is specific without overpromising.
- Recovery paths are obvious.
- The UI is visually polished, lightweight, mobile-safe, and operationally honest.

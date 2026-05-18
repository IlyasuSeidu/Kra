# Tracking Access Denied Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `TrackingAccessDenied` |
| App | `apps/web` |
| Route | `/r/access-denied` |
| Primary test ID | `screen-tracking-access-denied` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | Public tracking access result; current safe fallback is no initial API call |
| Related routes | `/track`, `/r/expired`, `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/support`, `/privacy` |
| Required states | `denied` |

## Product Job
This screen blocks receiver tracking when a public link, receiver verification attempt, or access result cannot safely continue. It must tell the receiver that package details cannot be shown, provide safe recovery, and avoid revealing whether the tracking code, phone number, receiver, package, link, or delivery exists.

The page must help receivers:
- Understand that this access path cannot show package details.
- Retry through the normal tracking-code entry path if they have a code.
- Verify phone again only through the correct receiver flow.
- Contact support without exposing sensitive delivery data in the URL.
- Avoid repeated attempts that could lock or rate-limit verification.
- Understand that access denial does not prove package loss, cancellation, or delivery failure.

This screen is not a full tracking page, phone challenge page, OTP page, support case form, receiver account page, sender dashboard, payment page, proof page, or staff permission page.

## Audience
Primary audience:
- Receivers who entered a phone number that did not match the delivery record.
- Receivers who opened a link that cannot safely continue.
- Receivers who were redirected after a `FORBIDDEN` public receiver access result.
- Receivers who returned to a stale or unsafe receiver route state.

Secondary audience:
- Senders helping receivers regain safe access.
- Support staff explaining privacy-safe recovery.
- QA engineers verifying that receiver access denial does not leak sensitive signals.

## User State
The receiver may believe they entered the correct phone number, opened the correct tracking link, or received a valid sender message. They may be worried the package was delivered to someone else. The page must be short, neutral, and recoverable without confirming or denying private delivery facts.

## Primary Action
Primary CTA:
- `Enter tracking code`

Secondary CTA:
- `Contact support`

Tertiary CTA:
- `Read privacy policy`

CTA behavior:
- `Enter tracking code` routes to `/track` or expands a tracking-code recovery form.
- `Contact support` routes to `/support` without sensitive query values.
- `Read privacy policy` routes to `/privacy`.
- The page must not route directly to `/r/:trackingCode/verify-phone` unless a validated tracking code is available through trusted non-URL navigation state.

## Main Tension
The page exists because access failed, but explaining why can leak private delivery data. If the UI says the phone number was wrong, an attacker learns the tracking code exists and that a different phone is attached. If it says the package exists but access is denied, that is also leakage. The screen must use generic denial copy and safe recovery.

## Visual Thesis
Design this page as a privacy gate: a calm denied-state hero, one safe recovery action, one support route, and one brief privacy explanation. It should feel secure and intentional, not like a broken page.

## Restraint Rule
Do not build a diagnostic page. Avoid reason details, phone masks, package previews, tracking status, station detail, sender names, receiver names, proof data, maps, issue data, payment data, or technical error codes.

Every element must help one of these:
- Block unsafe access.
- Explain privacy protection.
- Offer safe recovery.
- Prevent enumeration.
- Route to support.

## Elite Quality Gate
This spec is not closed unless the resulting UI can deny access without revealing any private delivery, identity, or verification signal.

Non-negotiable quality requirements:
- The first viewport must state that the link cannot show package details and present a recovery action.
- The page must not call `get_public_tracking` on initial load because `/r/access-denied` has no route tracking code.
- The page must not call `request_public_tracking_phone_challenge` or `verify_public_tracking_phone`.
- The page must not render phone mismatch, receiver mismatch, token mismatch, delivery exists, delivery not found, tracking code exists, or package status.
- Recovery errors must be generic enough to avoid enumeration.
- The page must never expose tracking code, phone, token, verification token, challenge ID, delivery ID, station ID, sender ID, receiver name, payment, proof, issue, staff identity, or GPS.
- Support route must not include sensitive query parameters.
- Access denied must not imply package loss, cancellation, delivery failure, or fraud.
- The page must work first on mobile.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network.

Closure rule:
- If a user can infer whether the tracking code exists, the screen remains open.
- If a user can infer whether the phone mismatched, the screen remains open.
- If the page shows delivery status, the screen remains open.
- If the page retries verification directly, the screen remains open.
- If the support URL leaks delivery data, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- OWASP Authentication guidance explains that authentication-like failures should use generic error messages to reduce account or identity enumeration.
- NIST SP 800-63B supports privacy-aware authentication and session handling, including reauthentication when access is not valid.
- GOV.UK Design System error-message guidance says permission or eligibility problems should use a page that explains the problem and next steps, not an inline validation error.
- ONS error and status page guidance includes access-denied pages as a clear status-page pattern with concise problem summary and next steps.
- W3C WCAG 2.2 guidance requires accessible error identification, status messages, focus order, and accessible authentication.

Reference links:
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://pages.nist.gov/800-63-4/sp800-63b.html
- https://design-system.service.gov.uk/components/error-message/
- https://service-manual.ons.gov.uk/design-system/patterns/error-status-pages
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external service page layouts, government copy, authentication screens, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Why can I not continue from this link?
- Does this page show package details?
- What can I do now?
- Can I enter the tracking code again?
- Can support help if I cannot access tracking?
- Should I keep trying phone numbers?
- Why is the reason not shown?

## Route And Access Rules
### Route
- Render at `/r/access-denied`.
- Must be public and unauthenticated.
- Must not require receiver account creation.
- Must not show delivery data on initial render.
- Must not accept tracking code, token, OTP, challenge ID, verification token, delivery ID, or phone as route parameters.

### Optional Navigation State
The page may receive non-URL navigation state from another receiver route:
- `deniedSource`, with safe values `receiver_link`, `phone_verification`, `otp_verification`, `grant_guard`, `unknown`.
- `validatedTrackingCode`, only if the app already validated it and it is needed to route to normal recovery.

Rules:
- Do not render `validatedTrackingCode`.
- Do not store navigation state beyond recovery.
- Do not put navigation state in analytics.
- Do not require navigation state.

### URL Query Parameters
Allowed:
- None required.

Forbidden:
- `trackingCode`
- `deliveryId`
- `token`
- `verificationToken`
- `challengeId`
- `otp`
- `phone`
- `stationId`
- `issueId`
- `reason`
- `status`

If forbidden query parameters are present:
- Ignore them.
- Clear them from URL if frontend router supports safe replacement.
- Render generic denial state.
- Do not log values.

## Backend Contract
### Current Access Result Sources
Possible redirect sources:
- `request_public_tracking_phone_challenge` returns `FORBIDDEN` for phone mismatch.
- `verify_public_tracking_phone` returns `FORBIDDEN` for invalid, missing, consumed, expired, or mismatched challenge.
- Receiver route guard detects missing, invalid, or unsafe verification grant.
- Future signed receiver link access layer returns access denied.

Important backend behavior:
- Phone mismatch is recorded internally as `phone_mismatch`, but the public error message is generic.
- Public tracking itself does not authenticate receiver identity.
- Receiver-sensitive statuses require verification before full receiver tracking details.

Public UI implication:
- Do not display the backend reason.
- Do not display phone mismatch.
- Do not display challenge status.
- Do not show package existence.

### Current Page Network Rule
Initial render:
- No API call.

Recovery:
- Route to `/track` for manual tracking entry.
- If trusted navigation state contains a validated tracking code, the primary recovery may route to `/r/:trackingCode/verify-phone`.

This page itself must not perform phone challenge or OTP verification.

### Future Public Access Result Contract
If a future public access result endpoint exists, it may return only:
```ts
type PublicReceiverAccessDeniedResponse = {
  accessAllowed: false;
  publicReason: "cannot_continue" | "verification_required" | "expired_or_invalid" | "try_again_later";
  nextPublicAction: "enter_tracking_code" | "verify_phone" | "contact_support";
};
```

Forbidden public fields:
- tracking code
- delivery ID
- phone
- phone mask
- receiver name
- sender ID
- station ID
- package status
- issue category
- internal reason code
- attempt count
- lock details unless backend provides a safe retry label

## Authorized And Forbidden Operations
### Authorized
This screen may:
- Render generic access-denied state.
- Route to `/track`.
- Route to `/support`.
- Route to `/privacy`.
- Route to `/r/:trackingCode/verify-phone` only with trusted validated navigation state.
- Clear unsafe URL parameters.

### Forbidden
This screen must never call:
- `get_public_tracking` on initial load.
- `request_public_tracking_phone_challenge`.
- `verify_public_tracking_phone`.
- `get_delivery`.
- `get_delivery_timeline`.
- `list_issues`.
- `get_issue`.
- `create_issue`.
- `record_failed_attempt`.
- `complete_delivery`.
- `create_delivery_proof_asset`.
- `confirm_delivery_proof_asset_upload`.
- `refund_payment`.
- Any staff, sender, station, courier, finance, support-admin, or admin endpoint.

This screen must never render controls for:
- Entering phone number.
- Entering OTP.
- Resending OTP.
- Checking package status inline.
- Creating support issue inline.
- Uploading proof.
- Starting refund.
- Editing address.
- Signing in as staff or sender.

## State Model
### `denied`
Use when:
- Page is opened normally.
- Access denial source is unknown.
- Unsafe route state is detected.

Required UI:
- Title: `This link cannot be opened`
- Body: `For privacy, this receiver link cannot show package details. Enter the tracking code again or contact support.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Test ID:
- `state-tracking-access-denied`

### `receiver_link_denied`
Use when:
- Safe navigation state says a receiver link cannot continue.

Required UI:
- Title: `This receiver link cannot be opened`
- Body: `This link cannot safely show package details. Use the tracking code or request help.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Test ID:
- `state-tracking-access-denied-receiver-link`

### `verification_denied`
Use when:
- Safe navigation state says phone or OTP verification could not continue.

Required UI:
- Title: `We could not verify access`
- Body: `For privacy, we cannot show whether the phone, code, or delivery matched. Enter the tracking code again or request help.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Rules:
- Do not say phone mismatch.
- Do not say OTP mismatch.
- Do not show attempts remaining unless backend provides a public-safe retry label.

Test ID:
- `state-tracking-access-denied-verification`

### `grant_guard_denied`
Use when:
- Receiver route guard blocks because a verification grant is missing, invalid, or unsafe.

Required UI:
- Title: `Tracking access needs verification`
- Body: `Receiver tracking cannot continue from this session. Enter the tracking code again to restart verification.`
- Primary CTA: `Enter tracking code`
- Secondary CTA: `Contact support`

Test ID:
- `state-tracking-access-denied-grant-guard`

### `trusted_code_recovery`
Use when:
- Trusted non-URL navigation state contains a validated tracking code.

Required UI:
- Title: `Verify phone to continue`
- Body: `Receiver tracking needs phone verification before package details can be shown.`
- Primary CTA: `Verify phone`
- Secondary CTA: `Contact support`

Rules:
- Do not display the tracking code.
- Do not show package details.
- Do not call phone challenge from this page.
- CTA routes to `/r/:trackingCode/verify-phone`.

Test ID:
- `state-tracking-access-denied-trusted-code`

### `request_support`
Use when:
- Receiver chooses support path.
- Receiver cannot recover through tracking code.
- Repeated access denial happened.

Required UI:
- Title: `Request help with tracking access`
- Body: `Support can help if you cannot verify receiver access or the tracking link cannot be opened.`
- CTA: `Contact support`
- Secondary CTA: `Enter tracking code`

Test ID:
- `state-tracking-access-denied-request-support`

## Layout Blueprint
### Mobile
Order:
- Header.
- Denied-state hero.
- Primary recovery action.
- Privacy explanation.
- Support card.
- Privacy policy link.

Rules:
- Denied explanation and recovery action must appear above fold.
- Keep content short.
- Avoid forms unless routing to `/track` is replaced by a validated local code entry pattern.
- Avoid tables.
- Avoid horizontal scroll.
- Keep tap targets at least `44px`.

### Desktop
Use a centered privacy-gate layout:
- Main card: denied explanation and recovery CTA.
- Side card: why details are hidden and support route.

Keep max content width around `920px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Tracking access`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in.
- Staff sign-in.
- Admin links.
- Pricing CTA.

## Visual Direction
### Mood
Secure, calm, firm, and recoverable.

### Composition
- Clear access-denied badge.
- Large heading.
- Short explanation.
- One dominant recovery CTA.
- Support fallback.
- Privacy note.

### Color Rules
- `danger.red.600` for access denied emphasis.
- `brand.blue.600` for safe recovery action.
- `warning.amber.600` only for retry caution.
- Neutral surfaces for privacy and support.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and support copy.
- Keep paragraphs short.
- Primary CTA should be visually dominant.

### Iconography
Allowed icon ideas:
- Shield.
- Blocked link.
- Privacy gate.
- Help circle.

Rules:
- Icons must be secondary to text.
- Do not use package icons, map pins, station icons, phone masks, or courier icons.
- Do not imply fraud.

### Motion
- Use subtle entry motion only if it helps orientation.
- No shaking error card.
- No animated lock.
- No countdown.
- Respect `prefers-reduced-motion`.

## Content Structure
### Denied Hero
Title variants:
- `This link cannot be opened`
- `This receiver link cannot be opened`
- `We could not verify access`
- `Tracking access needs verification`

Body variants:
- Generic: `For privacy, this receiver link cannot show package details. Enter the tracking code again or contact support.`
- Receiver link: `This link cannot safely show package details. Use the tracking code or request help.`
- Verification: `For privacy, we cannot show whether the phone, code, or delivery matched. Enter the tracking code again or request help.`
- Guard: `Receiver tracking cannot continue from this session. Enter the tracking code again to restart verification.`

### Recovery Actions
Primary:
- `Enter tracking code`

Trusted validated code:
- `Verify phone`

Secondary:
- `Contact support`

Tertiary:
- `Read privacy policy`

Rules:
- Do not use `Try again` as the only action.
- Do not suggest trying many phone numbers.
- Do not show package status.

### Privacy Explanation
Title:
- `Why details are hidden`

Copy:
- `Kra does not show whether a tracking code, phone number, receiver, or package matched on this page. This protects delivery details from old links, forwarded messages, and repeated access attempts.`

### Support Card
Title:
- `Need help with receiver access?`

Copy:
- `Contact support if the receiver cannot verify phone access, the tracking link came from the sender, or the link keeps returning here.`

CTA:
- `Contact support`

Rules:
- Do not prefill support with tracking code, phone, token, or delivery ID.
- Do not collect support evidence on this page.

### What Not To Do
Title:
- `Do not keep guessing`

Copy:
- `Repeated phone or code attempts may be blocked. Use the tracking code from the sender or contact support.`

Rules:
- Do not show exact attempt counts unless backend exposes a public-safe retry label.
- Do not show lock window unless backend exposes a public-safe retry label.

## Information Architecture
### Required Components
`ReceiverPublicShell`
- Shared receiver public header and safe page frame.

`TrackingAccessDeniedHero`
- Renders denied title, body, and primary recovery action.

`TrackingAccessDeniedPrivacyNote`
- Renders why details are hidden.

`TrackingAccessDeniedSupportCard`
- Renders support route.

`TrackingAccessDeniedCaution`
- Renders repeated-attempt warning.

### Component Boundaries
Do not build:
- Phone input.
- OTP input.
- Tracking timeline.
- Package status card.
- Support issue form.
- Sender login.
- Account creation.
- Proof upload.
- Payment recovery.
- Map.
- Station directory.

Small shared components are allowed only when they support receiver public recovery screens.

## Data Handling Rules
### Tracking Code
- Do not accept tracking code in URL.
- Do not render tracking code from navigation state.
- Do not send tracking code to analytics.
- Route to `/track` for manual entry unless trusted validated state allows direct phone verification.

### Phone
- Do not render phone.
- Do not render masked phone.
- Do not send phone to analytics.
- Do not say whether phone matched.

### Tokens And OTPs
- Do not render token, verification token, challenge ID, or OTP.
- Do not retry token.
- Do not send token-like values to API.
- Clear unsafe route state when safe.

### Public Access Result
- Use only to choose generic denial state.
- Do not show backend code.
- Do not show internal reason.
- Do not show attempt count.

### Support
- Support route must not include sensitive query parameters.
- If future support handoff is added, use secure server-side handoff rather than URL query data.

## Accessibility Requirements
### Semantics
- Page has one `h1`.
- Access denied state is announced as page content, not only toast.
- Support and recovery links are descriptive.
- If state changes after route cleanup, announce through a polite live region.

### Keyboard
- Primary CTA is reachable after heading.
- Support CTA is reachable without hidden menus.
- Focus moves to page heading on route load.
- If unsafe query parameters are removed, focus must not jump.

### Screen Reader
- Heading must explain the access problem.
- Body must explain next action.
- Privacy note must not be icon-only.
- Links must make sense out of context.

### Contrast And Text
- All normal text meets WCAG AA contrast.
- Denied state must not rely only on red.
- Minimum body text `16px`.
- Large text must not hide CTAs.

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Disable decorative denial animation.
- Keep focus indicators visible.

## Responsive Requirements
### Mobile
- Primary target viewport is `360px` to `430px`.
- Denied explanation and recovery CTA above fold.
- No horizontal scrolling.
- Support route visible without excessive scrolling.
- Text should remain short enough for SMS-to-browser context.

### Tablet
- Preserve mobile reading order.
- Avoid decorative split layouts.

### Desktop
- Center privacy-gate content.
- Use side card only for privacy and support explanation.
- Keep main card readable and narrow.

## Empty, Error, And Edge Cases
### No Context
Use generic `denied` state.

### Forbidden Query Parameters Present
Use generic `denied` state.

Rules:
- Ignore sensitive parameters.
- Replace URL with `/r/access-denied` when safe.
- Do not log values.

### Phone Mismatch Redirect
Use `verification_denied`.

Rules:
- Do not say phone mismatch.
- Do not reveal masked phone.
- Do not show attempts remaining unless backend provides public-safe copy.

### OTP Mismatch Redirect
Use `verification_denied`.

Rules:
- Do not say whether OTP, phone, or challenge mismatched.
- Route to `/track` or support, not direct OTP retry.

### Grant Guard Redirect
Use `grant_guard_denied`.

Rules:
- If trusted validated code exists, allow `Verify phone`.
- Otherwise route to `/track`.

### Repeated Attempts
Show caution:
- `Do not keep guessing. Repeated attempts may be blocked.`

Do not show exact lock window unless backend exposes a public-safe retry label.

## Copy System
### Voice
- Calm.
- Firm.
- Privacy-first.
- Non-technical.
- Helpful.

### Words To Prefer
- `cannot be opened`
- `for privacy`
- `receiver link`
- `enter tracking code`
- `contact support`
- `verify phone`
- `package details`

### Words To Avoid
- `forbidden`
- `unauthorized`
- `phone mismatch`
- `wrong OTP`
- `wrong receiver`
- `tracking code exists`
- `package found`
- `invalid token`
- `failed authentication`
- `fraud`
- `blocked user`

### Microcopy Rules
- Explain privacy before support.
- Give one main next action.
- Avoid blame.
- Avoid exact reason.
- Avoid technical terms.

## Analytics
Events must not include raw tracking code, token, OTP, challenge ID, verification token, phone, delivery ID, station ID, issue ID, proof reference, address, or status.

Allowed events:
- `tracking_access_denied_viewed`
- `tracking_access_denied_state_rendered`
- `tracking_access_denied_recovery_clicked`
- `tracking_access_denied_support_clicked`
- `tracking_access_denied_privacy_clicked`
- `tracking_access_denied_query_cleared`

Allowed properties:
- `denied_source`: `receiver_link`, `phone_verification`, `otp_verification`, `grant_guard`, `unknown`
- `has_trusted_code_context`: boolean
- `next_route_type`: `track`, `verify_phone`, `support`, `privacy`, `none`
- `unsafe_query_present`: boolean

Forbidden properties:
- `trackingCode`
- `deliveryId`
- `token`
- `verificationToken`
- `challengeId`
- `otp`
- `phone`
- `stationId`
- `issueId`
- `rawStatus`
- `backendReason`
- `attemptCount`

## SEO And Metadata
This is a delivery-scoped recovery page.

Metadata:
- `robots`: `noindex,nofollow`
- Title: `Tracking access denied | Kra`
- Description: `Recover from a Kra receiver tracking access issue.`

Rules:
- Do not put tracking code in title.
- Do not expose access result in Open Graph metadata.
- Do not generate public share cards with denial state.

## Security And Privacy Requirements
- Treat route as public.
- Do not show delivery data.
- Do not reveal whether tracking code, phone, receiver, or package matched.
- Do not call verification endpoints.
- Do not leak sensitive data through URL, analytics, logs, DOM attributes, title, metadata, or support links.
- Use generic denial copy.
- Clear unsafe query parameters when safe.
- Do not require receiver account creation.

## Performance Requirements
- Initial page must render without API dependency.
- No network call is required for generic denial state.
- No map SDK.
- No real-time socket.
- No heavy animation package.
- No remote decorative video.
- Layout must avoid content shift after query cleanup.
- Critical text must be HTML, not image text.

## Test IDs
Required:
- `screen-tracking-access-denied`
- `state-tracking-access-denied`
- `state-tracking-access-denied-receiver-link`
- `state-tracking-access-denied-verification`
- `state-tracking-access-denied-grant-guard`
- `state-tracking-access-denied-trusted-code`
- `state-tracking-access-denied-request-support`
- `component-tracking-access-denied-hero`
- `component-tracking-access-denied-privacy-note`
- `component-tracking-access-denied-support`
- `component-tracking-access-denied-caution`
- `cta-tracking-access-denied-recovery`
- `cta-tracking-access-denied-support`
- `cta-tracking-access-denied-privacy`
- `cta-tracking-access-denied-verify-phone`

Rules:
- Test IDs must be stable.
- Do not encode tracking code, denial source, backend reason, or status into test IDs.

## Unit Test Coverage
### Route And Initial State
- `/r/access-denied` renders without API call.
- Generic denied state renders when no context exists.
- Receiver-link source renders receiver-link state.
- Phone-verification source renders verification-denied state.
- OTP-verification source renders verification-denied state.
- Grant-guard source renders grant-guard state.
- Forbidden query parameters are ignored and cleaned when safe.

### Recovery Behavior
- `Enter tracking code` routes to `/track`.
- `Contact support` routes to `/support` with no sensitive query values.
- `Read privacy policy` routes to `/privacy`.
- Trusted validated code context shows `Verify phone`.
- `Verify phone` routes to `/r/:trackingCode/verify-phone` without rendering tracking code.

### Privacy
- No delivery status is rendered.
- No tracking code is rendered.
- No phone or masked phone is rendered.
- No token, OTP, challenge ID, or verification token is rendered.
- No backend reason is rendered.
- No attempts remaining or lock detail is rendered unless public-safe copy exists.
- No package, station, payment, proof, issue, or GPS data is rendered.

### Operations
- Initial page does not call `get_public_tracking`.
- Page never calls `request_public_tracking_phone_challenge`.
- Page never calls `verify_public_tracking_phone`.
- Page never calls authenticated delivery, issue, proof, payment, refund, staff, or admin endpoints.

### Copy
- Generic state says link cannot show package details.
- Verification state says it cannot show whether phone, code, or delivery matched.
- Caution discourages guessing.
- Copy does not include forbidden words like phone mismatch or wrong OTP.

## Integration Test Coverage
Use frontend test harness with API interception.

Scenarios:
- Receiver opens `/r/access-denied` and sees generic denial recovery.
- Receiver arrives from phone verification denial and sees generic verification copy.
- Receiver arrives from grant guard with no validated code and routes to `/track`.
- Receiver arrives from grant guard with trusted validated code and sees verify-phone CTA.
- Receiver opens URL with forbidden query parameters and they are removed or ignored.
- Receiver clicks support and URL excludes tracking code, phone, token, delivery ID, backend reason, and status.

Assertions:
- `screen-tracking-access-denied` is visible on initial render.
- First viewport contains denial explanation and recovery action.
- No network request is made on initial render.
- No forbidden endpoint is called.
- No forbidden data appears in DOM.
- Focus order follows header, hero, recovery CTA, support, privacy.

## End-To-End Acceptance
### Generic Denied Link
Given:
- User visits `/r/access-denied`.

When:
- Page renders.

Then:
- Page shows `This link cannot be opened`.
- Page shows `Enter tracking code` and `Contact support`.
- No API request is made.
- No package details are shown.

### Verification Denied
Given:
- User is redirected from receiver phone or OTP verification after forbidden result.

When:
- Page renders.

Then:
- Page says access could not be verified.
- Page does not say phone mismatch, OTP mismatch, delivery exists, or package found.
- Page routes to `/track` or support.

### Trusted Code Recovery
Given:
- User is redirected from a route guard with trusted validated tracking code in non-URL navigation state.

When:
- Page renders.

Then:
- Page shows `Verify phone`.
- Page does not display the tracking code.
- Clicking `Verify phone` routes to `/r/:trackingCode/verify-phone`.

### Unsafe Query Cleanup
Given:
- User opens `/r/access-denied?trackingCode=...&phone=...&reason=...`.

When:
- Page renders.

Then:
- Sensitive query values are ignored.
- Page renders generic denial state.
- Analytics records only that unsafe query was present, not its values.

## Implementation Notes For Claude Code
Build only the tracking access denied recovery screen and receiver-safe supporting components. Do not implement phone verification, OTP entry, tracking lookup, support case creation, sender dashboard, proof upload, payment recovery, account sign-in, or staff permission UI in this task.

Recommended implementation sequence:
- Add route `/r/access-denied`.
- Reuse receiver public route shell.
- Add safe denied-source parser for non-URL navigation state.
- Add forbidden query cleanup.
- Build denied hero.
- Build privacy note.
- Build support card.
- Build repeated-attempt caution.
- Add route actions to `/track`, `/support`, `/privacy`, and trusted-code verify-phone.
- Add unit tests.
- Add integration tests.
- Add accessibility tests.

Do not add backend fields for this page. If future public access-result contracts are added, update shared contracts and this spec before rendering new state.

## Definition Of Done
- Route exists at `/r/access-denied`.
- `screen-tracking-access-denied` renders without API call.
- All required state test IDs exist.
- Generic, receiver-link, verification, grant-guard, trusted-code, and support states are covered.
- Page never calls public verification endpoints.
- Page never renders delivery status or access reason.
- Support route carries no sensitive query values.
- Unsafe query values are ignored and cleaned when safe.
- No forbidden data appears in DOM, analytics, logs, title, metadata, or links.
- Mobile layout is clean at `360px`.
- Keyboard and screen reader behavior passes accessibility checks.
- Reduced motion is honored.
- Unit, integration, accessibility, and route tests pass.
- Documentation and implementation remain aligned with public tracking, phone challenge, OTP verification, and privacy rules.

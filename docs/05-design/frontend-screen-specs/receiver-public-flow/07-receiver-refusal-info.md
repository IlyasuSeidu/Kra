# Receiver Refusal Information Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `ReceiverRefusalInfo` |
| App | `apps/web` |
| Route | `/r/:trackingCode/refusal` |
| Primary test ID | `screen-receiver-refusal` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `issue status` public contract required; current safe fallback is `get_public_tracking` |
| Related routes | `/r/:trackingCode`, `/r/:trackingCode/verify-phone`, `/r/:trackingCode/verify-otp`, `/r/:trackingCode/timeline`, `/r/:trackingCode/arrival`, `/r/:trackingCode/failed-attempt`, `/support`, `/delivery-policy`, `/privacy` |
| Required states | `issue created`, `review pending` |

## Product Job
This screen explains what happens when receiver refusal may have moved a delivery into review. It must give receivers a calm, policy-safe explanation of the review process while avoiding internal issue details that are not public. Until a public issue-status contract exists, the page must not claim a specific refusal reason, issue ID, reviewer, resolution path, refund result, or return-to-sender decision.

The page must help receivers:
- Understand that receiver refusal can move a package into `issue_reported` review.
- Understand that refusal does not automatically cancel the delivery contract.
- Understand that station review decides pickup, return-to-sender, or dispute outcome.
- Know that no cash should be paid during final-mile completion.
- Know not to share OTP after refusal unless a new valid handoff occurs.
- Know where to get support if the public tracking status is unclear.
- Understand why internal issue notes are not public.

This screen is not a dispute form, refund claim, issue management console, support thread, return-to-sender booking page, proof gallery, payment page, courier report, or account area.

## Audience
Primary audience:
- Receivers who refused a package or were told that a refusal was recorded.
- Receivers whose tracking link routes to refusal review.
- Receivers checking why normal pickup or doorstep delivery is paused.

Secondary audience:
- Senders trying to understand refusal consequences.
- Support staff explaining refusal policy.
- Station operators checking that public copy matches operational issue handling.

## User State
The receiver may be worried they will be charged, blamed, or blocked from receiving the package. They may also believe the refusal was recorded incorrectly. The page must be neutral, precise, and action-oriented. It should explain process and recovery without making a judgment.

## Primary Action
Primary CTA depends on available public data:
- `Contact support` for refusal review, issue review, hold, blocked, or mismatch states.
- `Back to tracking timeline` for status context.
- `View arrival instructions` when current tracking shows pickup or active handoff instead of refusal review.
- `Read delivery policy` for policy support.

CTA behavior:
- `Contact support` routes to `/support` without sensitive query values.
- `Back to tracking timeline` routes to `/r/:trackingCode/timeline`.
- `View arrival instructions` routes to `/r/:trackingCode/arrival`.
- `Read delivery policy` routes to `/delivery-policy`.
- No CTA may call authenticated issue endpoints or create a public issue automatically.

## Main Tension
The inventory references `issue status`, but current API routes expose issue status only through authenticated `list_issues` and `get_issue`. Public tracking exposes `issue_reported`, `on_hold`, and `delivery_failed`, but does not expose issue ID, issue category, refusal reason, review status, or resolution. The UI must make this gap explicit in the implementation contract. It can explain the refusal review policy, but it must not pretend it has issue details.

## Visual Thesis
Design this page as a review-status explainer: one calm status hero, one refusal-process card, one decision-path diagram, and one strong support route. It should feel like a serious case-status page, not a complaint form or legal notice.

## Restraint Rule
Do not build a public issue console. Avoid case IDs, staff notes, courier statements, refund panels, return labels, blame copy, legalistic walls of text, proof images, signatures, GPS, and internal workflow names.

Every element must help one of these:
- Explain that review is required.
- Clarify refusal consequences.
- Prevent unsafe OTP or cash behavior.
- Explain possible next paths without promising them.
- Route to support or policy.

## Elite Quality Gate
This spec is not closed unless the resulting UI is clear enough for a stressed receiver, precise enough for support staff, and privacy-safe enough for a public tracking link.

Non-negotiable quality requirements:
- The first viewport must show current public status and next receiver action.
- The page must not call authenticated `list_issues`, `get_issue`, `create_issue`, `escalate_issue`, `resolve_issue`, or staff endpoints from a public route.
- The page must not expose issue ID, issue category, issue severity, summary, description, reporter, escalation reason, resolution note, staff identity, courier identity, station ID, receiver phone, address, payment, refund, proof asset, or GPS.
- If a future public issue-status endpoint exists, it must expose only receiver-safe fields before this page renders `issue created` or `review pending` as factual issue states.
- Current v1 fallback may use `get_public_tracking` only to confirm package status.
- The page must not claim the receiver refused unless the public contract confirms refusal category.
- The page must not promise refund, compensation, return-to-sender, or cancellation.
- The page must state that refusal does not automatically cancel the delivery.
- The page must state that station review decides pickup, return-to-sender, or dispute outcome.
- The page must work first on mobile.
- The page must remain accessible with keyboard, screen reader, high contrast, reduced motion, large text, and weak network.

Closure rule:
- If the page renders private issue details, the screen remains open.
- If the page calls authenticated issue APIs from a public route, the screen remains open.
- If the page claims a refusal reason from public tracking alone, the screen remains open.
- If receiver action is unclear, the screen remains open.
- If the page implies automatic refund or cancellation, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy or layout to clone:

- FedEx refusal guidance shows that a receiver can refuse a delivery and that refusal may change the package path, but Kra must not copy carrier-specific return rules.
- UPS return/refusal guidance shows that refusal and return handling are operationally distinct from normal delivery, so public copy should clarify next action and support route.
- DHL refusal and delivery exception guidance shows that refusal can route a shipment into exception handling, which supports keeping this screen review-focused.
- GOV.UK complaint and service recovery guidance supports clear next steps, plain language, and expected response handling without exposing internal notes.
- W3C WCAG 2.2 guidance requires clear status, predictable navigation, error identification, accessible instructions, and readable recovery paths.

Reference links:
- https://www.fedex.com/en-us/customer-support/faqs/receiving/delivery-options/how-to-refuse-package.html
- https://www.ups.com/us/en/support/shipping-support/print-shipping-labels/how-to-return-a-package.page
- https://www.dhl.com/us-en/home/customer-service.html
- https://www.gov.uk/service-manual/helping-people-to-use-your-service/getting-feedback-from-users
- https://www.w3.org/WAI/WCAG22/quickref/

Do not copy external carrier refusal rules, return labels, account flows, fee language, legal wording, layouts, icons, or brand assets.

## Required Page Outcomes
A successful receiver must be able to answer:
- Is this package currently under review?
- Does refusal automatically cancel the delivery?
- What can happen after refusal review?
- Should I share OTP now?
- Should I pay cash?
- Can I see internal issue notes?
- What if refusal was recorded incorrectly?
- Where do I get help?
- Why is issue detail limited on a public route?

## Route And Access Rules
### Route
- Render at `/r/:trackingCode/refusal`.
- Must be public and unauthenticated.
- Must remain delivery-scoped.
- Must not require receiver account creation.
- Must not expose staff tools.

### Route Parameter
`trackingCode` must:
- Match `^KRA-[A-Z0-9-]+$`.
- Never be recorded raw in analytics.
- Never be included in title metadata.
- Be displayed only as receiver reference.

If malformed:
- Show invalid tracking recovery or route to `/track`.
- Do not call API.

### Verification Gate
When current fallback uses `get_public_tracking` and response returns `receiverVerificationRequired: true`:
- If active receiver verification grant exists, render refusal information.
- If no active grant exists, route to `/r/:trackingCode/verify-phone`.
- If grant is expired, route to phone verification with expired-session copy.

When future public issue-status endpoint exists:
- It must still use delivery-scoped receiver verification when issue details could expose sensitive receiver context.
- It must not accept issue ID in URL unless the issue ID is public-safe and scoped to tracking code.

Rules:
- Do not pass verification token in URL.
- Do not render verification token.
- Do not call issue mutation endpoints.

## Backend Contract
### Current Safe Fallback
Operation:
- `get_public_tracking`

Endpoint:
- `GET /v1/public/track/:trackingCode`

Renderable fields:
- `trackingCode`, formatted safely.
- `publicLabel`.
- Public role label derived from `latestTouchpoint.role`.
- Formatted `latestTouchpoint.occurredAt`.
- `etaLabel` exactly as returned.
- `receiverVerificationRequired` for route gating.

Do not render:
- `deliveryId`.
- Raw `status`.
- Raw `stationId`.
- Raw role enum.
- Raw ISO timestamp.

### Required Future Public Issue-Status Contract
The full `ReceiverRefusalInfo` experience requires a public-safe issue status contract before implementation can render refusal-specific issue states.

Recommended future operation:
- `get_public_receiver_issue_status`

Recommended future endpoint:
- `GET /v1/public/track/:trackingCode/issues/current`

Recommended public-safe response:
```ts
type PublicReceiverIssueStatusResponse = {
  trackingCode: string;
  issueKind: "receiver_refusal" | "package_issue" | "pickup_hold" | "other";
  publicStatus: "created" | "review_pending" | "resolved" | "closed";
  publicLabel: string;
  openedAt: string;
  updatedAt: string;
  nextPublicAction: "contact_support" | "wait_for_review" | "view_tracking" | "view_arrival";
  resolutionSummary?: "pickup_available" | "return_to_sender_review" | "support_follow_up_required";
};
```

Fields that must not be public:
- `issueId`
- `deliveryId`
- `severity`
- internal category enum unless mapped to public `issueKind`
- summary
- description
- reporter actor ID
- reporter role
- escalation reason
- resolver actor ID
- resolution note
- support thread content
- payment or refund data
- staff or courier identity

Until this contract exists:
- Render only generic refusal review education from public tracking status.
- Do not render factual `issue created` timestamp.
- Do not render factual `review pending` step.
- Do not create an issue from this public route.

## Authorized And Forbidden Operations
### Authorized Current V1
This screen may call:
- `get_public_tracking`

This screen may read:
- Active receiver verification grant existence.
- Verification grant expiry timestamp.
- Browser online/offline state.

### Authorized Future Contract
This screen may call:
- `get_public_receiver_issue_status` only after it exists in shared contracts, route definitions, backend implementation, tests, and documentation.

### Forbidden
This screen must never call from the public route:
- `list_issues`
- `get_issue`
- `create_issue`
- `escalate_issue`
- `resolve_issue`
- `record_failed_attempt`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`
- `refund_payment`
- Any staff, admin, station, courier, finance, or authenticated sender endpoint.

This screen must never render controls for:
- Creating dispute.
- Approving refund.
- Editing issue.
- Escalating issue.
- Resolving issue.
- Reopening issue.
- Recording refusal.
- Recording failed attempt.
- Uploading proof.
- Starting return-to-sender.
- Cancelling delivery.

## Business Policy Summary
Receiver refusal policy:
- Receiver refusal does not automatically cancel the original service contract.
- Receiver refusal creates or moves the delivery into `issue_reported`.
- Station review decides whether the package enters pickup flow, return-to-sender flow, or dispute outcome.
- A refusal caused by sender-provided error is not automatically refundable.
- Post-dispatch refund requires verified service failure, duplicate charge, or formal dispute ruling.
- No cash collection is allowed during final-mile completion in v1.
- OTP should only be used during a valid physical handoff.

Public UI implications:
- Show refusal as review process, not final outcome.
- Avoid blame.
- Avoid refund promises.
- Avoid return-to-sender promises.
- Direct mismatch cases to support.

## Status Interpretation
### `issue_created`
Use only when:
- Future public issue-status contract returns `issueKind=receiver_refusal` and `publicStatus=created`.

Current v1 fallback:
- If `get_public_tracking.status` is `issue_reported`, render `review_pending_public_tracking` instead of factual issue-created state.

Receiver action:
- Contact support if details are wrong.
- Wait for review if no action is needed.

### `review_pending`
Use only when:
- Future public issue-status contract returns `issueKind=receiver_refusal` and `publicStatus=review_pending`.

Current v1 fallback:
- If `get_public_tracking.status` is `issue_reported` or `on_hold`, render generic review pending based on public status only.

Receiver action:
- Do not attempt pickup or OTP handoff until tracking changes or support advises.
- Contact support if refusal was incorrect.

### `not_refusal_context`
Use when:
- Public tracking status does not indicate issue, hold, or blocked review.

Receiver action:
- Return to tracking timeline.
- View arrival instructions if current status is actionable.

### `resolved_or_next_path`
Use when:
- Future public issue-status contract says resolved with receiver-safe summary.
- Current public tracking has moved to pickup, final-mile assignment, out-for-delivery, delivered, closed, or cancelled.

Receiver action:
- Follow current tracking status.

## State Model
### `loading`
Use when:
- Public tracking or future public issue-status lookup is in flight.

Required UI:
- Skeleton status hero.
- Skeleton review process card.
- Text: `Loading refusal review information...`

Test ID:
- `state-receiver-refusal-loading`

### `verification_required`
Use when:
- Receiver-sensitive public status requires verification and no active grant exists.

Required UI:
- Title: `Verify phone to view refusal review information`
- Body: `This package is in a receiver-sensitive stage. Verify the receiver phone before viewing review information.`
- CTA: `Verify phone`

Test ID:
- `state-receiver-refusal-verification-required`

### `issue_created`
Use when:
- Future public issue-status contract confirms receiver-refusal issue exists and `publicStatus=created`.

Required UI:
- Title: `Refusal review opened`
- Body: `Kra has opened a receiver-refusal review for this package. Support will use the verified delivery record to decide the next path.`
- Primary CTA: `Contact support`
- Secondary CTA: `Back to tracking timeline`

Rules:
- Do not show issue ID.
- Do not show issue severity.
- Do not show reporter.
- Do not show internal summary.

Test ID:
- `state-receiver-refusal-issue-created`

### `review_pending`
Use when:
- Future public issue-status contract confirms receiver-refusal review is pending.

Required UI:
- Title: `Refusal review is pending`
- Body: `Kra is reviewing whether this package should move to pickup, return-to-sender review, or another support outcome.`
- Primary CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Test ID:
- `state-receiver-refusal-review-pending`

### `review_pending_public_tracking`
Use when:
- Current fallback `get_public_tracking.status` is `issue_reported` or `on_hold`, but no public issue-status contract confirms refusal category.

Required UI:
- Title: `Package review is in progress`
- Body: `Public tracking shows this package needs review. A receiver refusal can create this review state, but this page cannot show private issue details.`
- Primary CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Rules:
- Use this as the v1 public-safe default.
- Do not state the receiver refused.
- Do not state issue was created by refusal.

Test ID:
- `state-receiver-refusal-review-public-tracking`

### `resolved_or_next_path`
Use when:
- Future public issue-status contract returns resolved or closed with safe next action.
- Current public tracking now shows an actionable status.

Required UI:
- Title: `Follow the current tracking status`
- Body: `The package has moved out of refusal review on this public page. Follow the current tracking status for the next receiver step.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `View arrival instructions` when pickup or doorstep status is actionable.

Test ID:
- `state-receiver-refusal-resolved-next-path`

### `not_refusal_context`
Use when:
- Status is valid but does not indicate issue review.

Required UI:
- Title: `No refusal review is available`
- Body: `Current tracking does not show a public receiver-refusal review for this package.`
- Primary CTA: `Back to tracking timeline`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-refusal-not-context`

### `delivered`
Use when:
- Current status is `delivered`.

Required UI:
- Title: `Delivery is complete`
- Body: `This package has been marked delivered with accepted proof. Contact support if this conflicts with what happened.`
- Primary CTA: `Contact support`
- Secondary CTA: `Back to tracking timeline`

Test ID:
- `state-receiver-refusal-delivered`

### `closed`
Use when:
- Current status is `cancelled`, `closed`, or `delivery_failed`.

Required UI:
- Title: `Delivery is closed or blocked`
- Body: `This package is not open for normal receiver handoff from this page. Contact support for next steps.`
- Primary CTA: `Contact support`
- Secondary CTA: `Read delivery policy`

Test ID:
- `state-receiver-refusal-closed`

### `service_unavailable`
Use when:
- API returns 5xx, timeout, maintenance, or route unavailable.

Required UI:
- Title: `Refusal review information is temporarily unavailable`
- Body: `Try again. If someone is asking for OTP, cash, or personal details, contact support before sharing anything.`
- CTA: `Try again`
- Secondary CTA: `Contact support`

Test ID:
- `state-receiver-refusal-unavailable`

### `offline`
Use when:
- Browser is offline or cannot reach Kra.

Required UI:
- Title: `Your connection appears offline`
- Body: `Reconnect to load the current review status. Do not rely on an old screenshot for refusal or handoff decisions.`
- CTA: `Try again`

Test ID:
- `state-receiver-refusal-offline`

### `invalid_tracking_code`
Use when:
- Route parameter fails validation.

Required UI:
- Title: `Tracking link is not valid`
- Body: `Check the tracking link and try again.`
- CTA: `Track another package`

Test ID:
- `state-receiver-refusal-invalid`

## Layout Blueprint
### Mobile
Order:
- Header.
- Current public status hero.
- Review status card.
- Refusal process card.
- Possible next paths.
- Safety reminders.
- Support card.
- Privacy note.

Rules:
- Current status and support action must appear above fold for review states.
- Use compact sections with strong labels.
- Avoid tables.
- Avoid horizontal scroll.
- Keep tap targets at least `44px`.

### Desktop
Use a two-zone layout:
- Main column: status hero, review status, refusal process, possible next paths.
- Side column: support, safety reminders, privacy note.

Keep max content width around `1120px`.

### Header
Header should include:
- Kra wordmark.
- Label: `Refusal review`
- Link to `/track`.

Header should not include:
- Full marketing navigation.
- Sender sign-in.
- Staff sign-in.
- Admin links.
- Pricing CTA.

## Visual Direction
### Mood
Neutral, serious, accountable, and non-judgmental.

### Composition
- Large status hero.
- Review card with one decisive CTA.
- Three-outcome process panel.
- Safety reminder panel.
- Compact privacy note.

### Color Rules
- `warning.amber.600` for review pending.
- `brand.blue.600` for next valid action.
- `success.green.600` for resolved or delivered.
- `danger.red.600` only for unavailable, blocked, or unsafe-sharing warnings.
- Neutral surfaces for process and policy explanation.

Color must never be the only state signal.

### Typography
- Use `Manrope` for headings.
- Use `Inter` for body, labels, and process text.
- Status heading must be dominant.
- Policy copy must use plain language, not legal-heavy phrasing.

### Iconography
Allowed icon ideas:
- Review.
- Support.
- Pickup path.
- Return review.
- Shield for OTP and cash safety.

Rules:
- Icons must not imply an outcome has already been decided.
- Do not use scales, legal stamps, courier face, vehicle route, proof image, or cash icon as primary meaning.

### Motion
- Use subtle reveal only for initial layout.
- No animated case timeline.
- No countdown.
- No route animation.
- Respect `prefers-reduced-motion`.

## Content Structure
### Status Hero
Required fields:
- Eyebrow: `Refusal review`
- Tracking code, formatted safely.
- Public label from tracking or future public issue label.
- Latest verified update source.
- ETA label if provided by public tracking.

Copy:
- Supporting line for fallback: `Public tracking shows the current receiver-safe package status.`
- Supporting line for future issue contract: `This is the receiver-safe issue status for this package.`

Do not show:
- Raw status enum.
- Raw station ID.
- Raw issue status enum.
- Raw issue kind enum.
- Issue ID.
- Delivery ID.
- Raw ISO timestamp.

### Review Status Card
Purpose:
- Tell receiver whether review is open, pending, resolved, or unavailable.

Required variants:
- `issue_created`: refusal review opened.
- `review_pending`: refusal review pending.
- `review_pending_public_tracking`: package review in progress with refusal-policy education.
- `resolved_or_next_path`: follow current tracking.
- `not_refusal_context`: no public refusal review.
- `closed`: support-first.

Rules:
- Exactly one dominant CTA.
- Do not expose internal workflow names.

### Refusal Process Card
Title:
- `What refusal review means`

Required copy:
- `Receiver refusal does not automatically cancel the delivery.`
- `Kra reviews the verified delivery record before deciding the next path.`
- `The package may move to pickup, return-to-sender review, or dispute handling depending on evidence.`
- `A refusal caused by sender-provided error is not automatically refundable.`

Rules:
- Do not say which outcome applies unless public contract says it.
- Do not show payment or refund data.

### Possible Next Paths
Title:
- `Possible next paths`

Cards:
- `Pickup`: `The package may return to destination-station pickup if receiver handoff can continue safely.`
- `Return review`: `Kra may review whether the package should return to sender.`
- `Support decision`: `Support may need more evidence before the public status changes.`

Rules:
- Use `may`.
- Do not promise return-to-sender.
- Do not promise refund.
- Do not expose station ID.

### Safety Reminders
Title:
- `Before any new handoff`

Content:
- `Do not share OTP unless a valid Kra courier or station operator is physically completing handoff.`
- `Do not pay cash for final-mile completion.`
- `Do not rely on old screenshots if tracking has changed.`
- `Contact support if refusal was recorded incorrectly.`

### Support Card
Title:
- `Need to correct or explain the refusal?`

Copy:
- `Contact support if the receiver did not refuse, the package was damaged, the wrong package arrived, the courier could not verify the handoff, or tracking looks wrong.`

CTA:
- `Contact support`

Rules:
- Do not prefill support URL with tracking code.
- Do not collect issue evidence on this screen.

### Privacy Note
Title:
- `Why issue details are limited`

Copy:
- `Kra keeps internal issue notes, courier statements, receiver phone, address, proof files, payment details, staff identities, and GPS out of public tracking pages.`

## Public Status Copy
### Public Tracking Role Map
- `system`: `Kra system update`
- `station_operator`: `Kra station update`
- `driver`: `Line-haul update`
- `final_mile_courier`: `Doorstep delivery update`
- Unknown: `Kra update`

### Future Issue Status Labels
If public issue-status contract is added, map public issue status:
- `created`: `Review opened`
- `review_pending`: `Review pending`
- `resolved`: `Review resolved`
- `closed`: `Review closed`

Rules:
- Do not show raw enum.
- Do not show issue ID.
- Do not show staff actor.

## Status Copy Matrix
### Future `issue_created`
State:
- `issue_created`

Action title:
- `Refusal review opened`

Body:
- `Kra has opened a receiver-refusal review for this package.`

Primary CTA:
- `Contact support`

### Future `review_pending`
State:
- `review_pending`

Action title:
- `Refusal review is pending`

Body:
- `Kra is reviewing the verified delivery record before deciding the next public path.`

Primary CTA:
- `Contact support`

### Current `issue_reported`
State:
- `review_pending_public_tracking`

Action title:
- `Package review is in progress`

Body:
- `Public tracking shows this package needs review. A receiver refusal can create this review state, but private issue details are not public.`

Primary CTA:
- `Contact support`

Secondary CTA:
- `Read delivery policy`

### Current `on_hold`
State:
- `review_pending_public_tracking`

Action title:
- `Package is on hold`

Body:
- `Normal receiver handoff is paused while Kra reviews the package status.`

Primary CTA:
- `Contact support`

### Current `awaiting_receiver_pickup`
State:
- `resolved_or_next_path`

Action title:
- `Pickup is the current next path`

Body:
- `Follow arrival instructions before going to the destination Kra station.`

Primary CTA:
- `View arrival instructions`

### Current `awaiting_final_mile_assignment`
State:
- `resolved_or_next_path`

Action title:
- `Doorstep handoff is being prepared`

Body:
- `Follow tracking for the next doorstep update.`

Primary CTA:
- `Back to tracking timeline`

### Current `assigned_for_final_mile`
State:
- `resolved_or_next_path`

Action title:
- `Courier assignment is active`

Body:
- `View arrival instructions before any handoff proof.`

Primary CTA:
- `View arrival instructions`

### Current `out_for_delivery`
State:
- `resolved_or_next_path`

Action title:
- `Delivery is active now`

Body:
- `Prepare for valid physical handoff and OTP proof.`

Primary CTA:
- `View arrival instructions`

### Current `delivered`
State:
- `delivered`

Action title:
- `Delivery is complete`

Body:
- `This package has been marked delivered with accepted proof. Contact support if this conflicts with what happened.`

Primary CTA:
- `Contact support`

### Current `delivery_failed`
State:
- `closed`

Action title:
- `Delivery cannot continue from this page`

Body:
- `Contact support for next steps.`

Primary CTA:
- `Contact support`

### Current `cancelled`
State:
- `closed`

Action title:
- `Delivery is cancelled`

Body:
- `This package is not open for receiver handoff.`

Primary CTA:
- `Contact support`

### Current `closed`
State:
- `closed`

Action title:
- `Delivery is closed`

Body:
- `This tracking code is not open for receiver handoff.`

Primary CTA:
- `Contact support`

### Pre-receiver statuses
State:
- `not_refusal_context`

Action title:
- `No refusal review is available`

Body:
- `Current tracking does not show a public receiver-refusal review for this package.`

Primary CTA:
- `Back to tracking timeline`

## Information Architecture
### Required Components
`ReceiverPublicShell`
- Shared receiver public header and safe page frame.

`ReceiverRefusalStatusHero`
- Renders public status, tracking code, latest update source, and data-limit copy.

`ReceiverRefusalReviewCard`
- Renders issue-created, review-pending, fallback review, resolved, not-context, delivered, or closed state.

`ReceiverRefusalProcessCard`
- Renders refusal process policy.

`ReceiverRefusalNextPaths`
- Renders possible pickup, return review, or support decision paths.

`ReceiverRefusalSafetyCard`
- Renders OTP, cash, screenshot, and mismatch safety.

`ReceiverRefusalSupportCard`
- Renders support criteria and CTA.

`ReceiverRefusalPrivacyNote`
- Renders issue-data limitation.

### Component Boundaries
Do not build:
- Issue thread.
- Issue creation form.
- Dispute form.
- Refund request.
- Return-to-sender booking.
- Proof upload.
- Signature capture.
- Photo capture.
- Courier note view.
- Staff assignment view.
- Station directory.
- Payment details.
- Account creation.

Small shared components are allowed only when they support receiver public screens.

## Data Handling Rules
### Tracking Code
- Show as public receiver reference.
- Mask in analytics.
- Do not include in support URL.
- Do not include in metadata.

### Verification Grant
- Use only to decide access.
- Do not render token.
- Do not send token to analytics.
- Do not store beyond expiry.
- Do not convert into account session.

### Issue Data
Until public issue-status contract exists:
- Do not fetch issue data.
- Do not render issue data.
- Do not infer issue category from route alone.

When public issue-status contract exists:
- Render only public-safe status and next action.
- Do not render raw issue ID or internal fields.
- Do not expose support notes or actor IDs.

### Latest Touchpoint
- Format time in local readable form.
- Use role label mapping.
- Do not infer refusal timestamp from latest touchpoint unless public issue-status says so.

### ETA
- Render `etaLabel` exactly if provided by public tracking.
- Do not turn ETA into review SLA.
- If missing, omit ETA.

### Station
- Do not show raw `stationId`.
- Do not infer name or address from station ID.
- Use `destination Kra station` only where pickup path is current.

### Payment And Refund
- Do not show payment status.
- Do not show refund eligibility.
- Do not promise compensation.
- Show only: no cash collection during final-mile completion.

## Accessibility Requirements
### Semantics
- Page has one `h1`.
- Major sections use ordered heading levels.
- Possible next paths use semantic list or card list markup.
- Status updates after retry use a polite live region.
- CTA text must be specific out of context.

### Keyboard
- All CTAs are reachable by keyboard.
- Focus moves to page heading after route transition.
- Retry returns focus to status region after request resolves.
- Support CTA is reachable in every review and blocked state.

### Screen Reader
- Status hero announces current review or tracking state.
- Process steps announce as separate items.
- Safety card must be text-first, not icon-only.
- Tracking code must be grouped for readable announcement.

### Contrast And Text
- All normal text meets WCAG AA contrast.
- Review and warning states must not rely only on color.
- Minimum body text `16px`.
- Large text must not clip CTAs or process cards.

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Disable decorative reveal animation.
- Keep focus indicators visible.

### Error Identification
- Invalid link, unavailable service, offline state, and verification-required state must identify the issue in text.
- Recovery action must be adjacent to explanation.
- Do not expose raw backend error or stack trace.

## Responsive Requirements
### Mobile
- Primary target viewport is `360px` to `430px`.
- No horizontal scrolling.
- Current status and support CTA above fold in review states.
- Possible next paths must stack.
- Safety reminders appear before privacy note.

### Tablet
- Preserve mobile reading order.
- Use side-by-side next-path cards only if readable.

### Desktop
- Use two-column layout only above reasonable width.
- Keep main reading line under `74` characters.
- Side column must not contain unique critical information.

## Empty, Error, And Edge Cases
### API 404
Title:
- `Tracking code was not found`

Body:
- `Check the tracking code and try again.`

CTA:
- `Track another package`

Test ID:
- `state-receiver-refusal-not-found`

### API 429
Title:
- `Too many tracking attempts`

Body:
- `Wait a short time before trying again.`

CTA:
- `Try again later`

Test ID:
- `state-receiver-refusal-rate-limited`

### API 5xx
Title:
- `Refusal review information is temporarily unavailable`

Body:
- `Try again. If someone is asking for OTP, cash, or personal details, contact support before sharing anything.`

CTA:
- `Try again`

Test ID:
- `state-receiver-refusal-unavailable`

### Expired Verification Grant
Title:
- `Verify phone again`

Body:
- `Your receiver verification expired. Verify the receiver phone again to view review information.`

CTA:
- `Verify phone`

Test ID:
- `state-receiver-refusal-grant-expired`

### Public Issue Contract Missing
Use:
- `review_pending_public_tracking` when tracking status is `issue_reported` or `on_hold`.
- `not_refusal_context` when tracking status does not indicate review.

Must not:
- Render `issue_created` or `review_pending` as issue-specific states.
- Display issue status details from authenticated routes.

### Status Changed While Page Is Open
If refresh returns a new status:
- Update state mapping.
- Announce status update through a polite live region.
- Do not keep old refusal text if status moved to pickup, out-for-delivery, delivered, or closed.

## Copy System
### Voice
- Neutral.
- Calm.
- Precise.
- Non-judgmental.
- Policy-clear.

### Words To Prefer
- `review`
- `receiver refusal`
- `next path`
- `pickup`
- `return-to-sender review`
- `support outcome`
- `current tracking status`
- `verified delivery record`

### Words To Avoid
- `you refused` unless public contract confirms refusal category.
- `fault`
- `blame`
- `automatic refund`
- `cancelled automatically`
- `guaranteed return`
- `cash on delivery`
- `case details` unless public contract exists.
- `internal issue queue` in customer-facing copy.

### Microcopy Rules
- Use `can create this review state`, not `created this review`, under current fallback.
- Use `contact support`, not `appeal`, unless a formal appeal flow exists.
- Use `return-to-sender review`, not `return to sender confirmed`, unless future contract confirms it.
- Use `delivery contract`, not legal-heavy terms.

## Analytics
Events must not include raw tracking code, phone, verification token, station ID, delivery ID, proof reference, address, issue ID, issue category, severity, receiver name, courier ID, or payment data.

Allowed events:
- `receiver_refusal_viewed`
- `receiver_refusal_state_rendered`
- `receiver_refusal_support_clicked`
- `receiver_refusal_timeline_clicked`
- `receiver_refusal_arrival_clicked`
- `receiver_refusal_policy_clicked`
- `receiver_refusal_retry_clicked`
- `receiver_refusal_verification_redirected`

Allowed properties:
- `status_group`: `issue_created`, `review_pending`, `public_tracking_review`, `resolved_next_path`, `not_context`, `delivered`, `closed`, `unavailable`
- `verification_required`: boolean
- `has_eta_label`: boolean
- `has_public_issue_contract`: boolean
- `role_group`: `system`, `station`, `line_haul`, `final_mile`, `unknown`
- `result`: `success`, `not_found`, `rate_limited`, `unavailable`, `offline`, `invalid`

Forbidden properties:
- `trackingCode`
- `deliveryId`
- `stationId`
- `phone`
- `verificationToken`
- `issueId`
- `issueCategory`
- `issueSeverity`
- `issueSummary`
- `issueDescription`
- `proofReference`
- `address`
- `receiverName`
- `courierId`
- `rawStatus`
- `paymentStatus`

## SEO And Metadata
This is a delivery-scoped receiver page.

Metadata:
- `robots`: `noindex,nofollow`
- Title: `Refusal review information | Kra`
- Description: `Receiver refusal review information for Kra tracking.`

Rules:
- Do not put tracking code in title.
- Do not put tracking code in description.
- Do not expose issue status in Open Graph metadata.
- Do not generate public share cards with package or issue state.

## Security And Privacy Requirements
- Treat route as public but delivery-scoped.
- Validate tracking code before API call.
- Do not expose hidden fields from API response.
- Do not call authenticated issue APIs from this public route.
- Do not leak verification token through URL, analytics, logs, DOM attributes, or metadata.
- Do not reveal issue ID, category, notes, reporter, staff identity, courier identity, receiver phone, address, station ID, proof files, payment, refund, or GPS.
- Do not encourage OTP sharing outside physical handoff.
- Do not require receiver account creation.

## Performance Requirements
- Initial route shell should render quickly on weak mobile connections.
- Public tracking request should be the only current network dependency.
- Future public issue-status request must not block safe fallback status longer than normal loading budget.
- No map SDK.
- No real-time socket.
- No heavy animation package.
- No remote decorative video.
- Layout must avoid content shift after status loads.
- Critical text must be HTML, not image text.

## Test IDs
Required:
- `screen-receiver-refusal`
- `state-receiver-refusal-loading`
- `state-receiver-refusal-verification-required`
- `state-receiver-refusal-issue-created`
- `state-receiver-refusal-review-pending`
- `state-receiver-refusal-review-public-tracking`
- `state-receiver-refusal-resolved-next-path`
- `state-receiver-refusal-not-context`
- `state-receiver-refusal-delivered`
- `state-receiver-refusal-closed`
- `state-receiver-refusal-unavailable`
- `state-receiver-refusal-offline`
- `state-receiver-refusal-invalid`
- `state-receiver-refusal-not-found`
- `component-receiver-refusal-status-hero`
- `component-receiver-refusal-review-card`
- `component-receiver-refusal-process-card`
- `component-receiver-refusal-next-paths`
- `component-receiver-refusal-safety-card`
- `component-receiver-refusal-support`
- `component-receiver-refusal-privacy-note`
- `cta-receiver-refusal-support`
- `cta-receiver-refusal-timeline`
- `cta-receiver-refusal-arrival`
- `cta-receiver-refusal-policy`
- `cta-receiver-refusal-retry`

Rules:
- Test IDs must be stable.
- Do not encode tracking code, issue status, issue category, or raw delivery status into test IDs.

## Unit Test Coverage
### Route And Validation
- Valid route calls `get_public_tracking` under current fallback.
- Malformed tracking code does not call API.
- 404 renders not-found state.
- 429 renders rate-limited state.
- 5xx renders unavailable state.
- Offline renders offline state.

### Verification Gate
- `receiverVerificationRequired=true` and no active grant routes to phone verification.
- `receiverVerificationRequired=true` and active grant renders screen.
- Expired grant routes to phone verification with expired copy.
- Verification token never appears in DOM.
- Verification token is not sent to analytics.

### Current Fallback Status Rendering
- `issue_reported` renders `review_pending_public_tracking`.
- `on_hold` renders `review_pending_public_tracking`.
- `awaiting_receiver_pickup` renders resolved or next path with arrival CTA.
- `awaiting_final_mile_assignment` renders resolved or next path with timeline CTA.
- `assigned_for_final_mile` renders resolved or next path with arrival CTA.
- `out_for_delivery` renders resolved or next path with arrival CTA.
- `delivered` renders delivered state.
- `delivery_failed` renders closed state.
- `cancelled` renders closed state.
- `closed` renders closed state.
- Pre-receiver statuses render not-context state.

### Future Public Issue Contract Rendering
- `issueKind=receiver_refusal` and `publicStatus=created` renders issue-created state.
- `issueKind=receiver_refusal` and `publicStatus=review_pending` renders review-pending state.
- `publicStatus=resolved` renders resolved-next-path state.
- Non-refusal `issueKind` does not render receiver-refusal claim.

### Privacy
- `deliveryId` is not rendered.
- Raw `stationId` is not rendered.
- Raw status enum is not rendered.
- Raw issue status enum is not rendered.
- Issue ID is not rendered.
- Issue category is not rendered.
- Issue severity is not rendered.
- Issue summary is not rendered.
- Issue description is not rendered.
- Reporter actor is not rendered.
- Receiver phone is not rendered.
- Courier ID is not rendered.
- Payment or refund state is not rendered.
- Proof asset reference is not rendered.
- GPS is not rendered.

### Operations
- Current fallback calls only `get_public_tracking`.
- Screen never calls `list_issues`.
- Screen never calls `get_issue`.
- Screen never calls `create_issue`.
- Screen never calls `escalate_issue`.
- Screen never calls `resolve_issue`.
- Screen never calls `record_failed_attempt`.
- Screen never calls `refund_payment`.
- Screen never calls proof or completion endpoints.

### Copy
- Refusal does not automatically cancel copy appears.
- Station review decides next path copy appears.
- No automatic refund copy appears.
- No-cash warning appears.
- OTP physical handoff warning appears.
- Current fallback does not say `you refused`.

## Integration Test Coverage
Use frontend test harness with API interception.

Scenarios:
- Receiver opens `/r/KRA-ACC-001/refusal` with `issue_reported` and sees public-tracking review state.
- Receiver opens with `on_hold` and sees review state.
- Receiver opens with `awaiting_receiver_pickup` and sees current next-path copy, not refusal claim.
- Receiver opens with `out_for_delivery` and sees arrival CTA, not refusal claim.
- Receiver opens with `delivered` and sees delivered conflict support route.
- Receiver opens with `delivery_failed` and sees support-first closed state.
- Receiver opens with pre-receiver status and sees no public refusal review.
- Receiver opens with `receiverVerificationRequired=true` and no grant and is routed to phone verification.
- Receiver opens with malformed tracking code and no network request is made.
- Receiver clicks support and route excludes tracking code, phone, token, issue ID, delivery ID, and status details.

Assertions:
- `screen-receiver-refusal` is visible after successful render.
- First viewport contains status and support or next action.
- No authenticated issue endpoint is called.
- No forbidden data appears in DOM.
- Focus order follows header, hero, review card, process, next paths, safety, support.

## End-To-End Acceptance
### Public Tracking Review Fallback
Given:
- Public tracking returns `issue_reported`.
- No public issue-status contract exists.

When:
- Receiver visits `/r/:trackingCode/refusal`.

Then:
- Page shows `Package review is in progress`.
- Page explains refusal can create this review state.
- Page does not claim the receiver refused.
- Page does not show issue ID, category, notes, severity, staff identity, or payment data.

### Future Issue Created Path
Given:
- Future public issue-status contract returns `issueKind=receiver_refusal` and `publicStatus=created`.

When:
- Receiver visits refusal route.

Then:
- Page shows `Refusal review opened`.
- Page routes to support and timeline.
- Page does not expose internal issue fields.

### Future Review Pending Path
Given:
- Future public issue-status contract returns `issueKind=receiver_refusal` and `publicStatus=review_pending`.

When:
- Receiver visits refusal route.

Then:
- Page shows `Refusal review is pending`.
- Page explains possible next paths without promising outcome.
- Page does not promise refund or cancellation.

### Not Refusal Context
Given:
- Public tracking returns `in_transit`.

When:
- Receiver visits refusal route.

Then:
- Page shows no public receiver-refusal review.
- Page routes back to tracking timeline.
- Page does not claim issue state.

## Implementation Notes For Claude Code
Build only the receiver refusal information screen and receiver-safe supporting components. Do not implement authenticated issue thread, public issue creation, dispute filing, refund request, return-to-sender booking, proof upload, courier report, station directory, or account UI in this task.

Recommended implementation sequence:
- Add route `/r/:trackingCode/refusal`.
- Reuse receiver public route shell from prior receiver screens.
- Use `get_public_tracking` as current safe fallback.
- Reuse receiver verification grant guard.
- Add status-to-refusal-state mapper with tests.
- Add future public issue-status adapter behind a feature flag or contract gate only after backend contract exists.
- Build status hero.
- Build review card.
- Build refusal process card.
- Build possible next paths.
- Build safety and privacy cards.
- Add unit tests.
- Add integration tests.
- Add accessibility tests.

Do not add frontend-only issue state fields. If refusal category or review status is needed, open an API contract change first.

## Definition Of Done
- Route exists at `/r/:trackingCode/refusal`.
- `screen-receiver-refusal` renders for valid states.
- All required state test IDs exist.
- Current fallback calls only `get_public_tracking`.
- No authenticated issue endpoint is called from the public route.
- Verification gate redirects correctly.
- Issue-created, review-pending, public-tracking review, resolved-next-path, not-context, delivered, closed, unavailable, offline, invalid, and not-found states are covered.
- Refusal policy, station review, no automatic refund, no-cash, and OTP safety copy are present.
- Current fallback does not claim receiver refusal as fact.
- No forbidden data appears in DOM, analytics, logs, title, metadata, or links.
- Mobile layout is clean at `360px`.
- Keyboard and screen reader behavior passes accessibility checks.
- Reduced motion is honored.
- Unit, integration, accessibility, and route tests pass.
- Documentation and implementation remain aligned with doorstep, handoff, refund-dispute, issue, and public tracking contracts.

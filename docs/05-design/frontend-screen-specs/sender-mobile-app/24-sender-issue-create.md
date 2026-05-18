# Sender Issue Create Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderIssueCreate` |
| App | `apps/mobile` |
| Route | `/(sender)/deliveries/:deliveryId/issues/new` |
| Primary test ID | `screen-sender-issue-create` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `get_delivery`, `list_issues`, `create_issue`, `deliveryDetailResponseSchema`, `issueListResponseSchema`, `createIssueRequestSchema`, `issueResponseSchema` |
| Related routes | `/(sender)/deliveries/:deliveryId`, `/(sender)/deliveries/:deliveryId/timeline`, `/(sender)/deliveries/:deliveryId/refund`, `/(sender)/support/:issueId`, `/(sender)/history`, `/(sender)/notifications` |
| Required states | `loading`, `ready`, `existing_issue_warning`, `field_errors`, `submitting`, `submitted`, `not_found`, `not_authorized`, `offline`, `api_error`, `rate_limited`, `session_expired` |

## Product Job
This screen lets a sender report a delivery, package, payment, refund, delay, damage, loss, or proof problem in a structured way that backend support can triage. It must collect only the fields accepted by `createIssueRequestSchema`, keep the sender focused, prevent accidental duplicate issue creation, submit once, and route the sender into the created support thread.

The sender should be able to:
- Confirm the delivery they are reporting.
- Choose the issue category in customer language.
- Choose urgency without seeing internal severity codes.
- Write a concise summary.
- Add optional details when needed.
- See clear validation errors.
- Understand what happens after submission.
- Avoid creating a duplicate when an active issue already exists.
- Submit the issue once.
- Open the created support thread after success.
- Recover from offline, authorization, not found, rate-limit, and API errors.

This screen is not:
- A support thread.
- A chat surface.
- A refund approval screen.
- A cancellation form.
- A payment retry form.
- A proof upload screen.
- A damage compensation decision.
- An admin triage queue.
- A staff escalation form.
- A public tracking help page.

## Audience
Primary audience:
- Authenticated senders who need support for one delivery.
- Senders reporting delay, package damage, possible loss, payment/refund problem, handoff/proof mismatch, or another delivery issue.
- Senders arriving from delivery detail, timeline, refund status, receipt detail, notification, or history.

Secondary audience:
- Claude Code implementing the sender route.
- QA validating schema-bound form behavior.
- Support reviewers validating intake quality.
- Operations reviewers validating custody and handoff issue capture.
- Finance reviewers validating payment/refund intake language.

## User State
The sender is usually blocked, worried, or frustrated. They need to report a problem quickly without learning Kra's internal operations language. The form must reduce friction while capturing enough structure for support to act without asking the sender to repeat everything.

The sender may be:
- Reporting a late delivery.
- Reporting payment or refund concern.
- Reporting that proof of delivery looks wrong.
- Reporting a missing package.
- Reporting damage.
- Reporting a wrong receiver or handoff concern.
- Reporting a general question tied to one delivery.
- Opening the form while offline.
- Returning after seeing an existing issue.

The screen must:
- Load delivery context before submission when possible.
- Use route `deliveryId` as the issue target.
- Submit only fields accepted by `createIssueRequestSchema`.
- Map customer category choices to backend `issueCategorySchema`.
- Map customer urgency choices to backend `issueSeveritySchema`.
- Validate summary and description exactly.
- Show active existing issue warning if `list_issues` returns open review context.
- Never upload evidence from this route.
- Never create issue automatically.
- Never expose internal actor IDs or raw issue metadata.

## Primary Action
Primary action by state:
- `ready`: `Submit issue`
- `existing_issue_warning`: `Open existing issue`
- `field_errors`: `Fix highlighted fields`
- `submitting`: disabled `Submitting issue`
- `submitted`: `Open support thread`
- `offline`: `Try again`
- `api_error`: `Try again`
- `rate_limited`: `Try later`

Secondary actions:
- `Create a new issue anyway`
- `Open delivery`
- `View timeline`
- `Track refund`
- `Go back`
- `Contact support`

CTA behavior:
- `Submit issue` calls `POST /v1/issues`.
- `Open support thread` routes to `/(sender)/support/:issueId`.
- `Open existing issue` routes to the latest active issue for the delivery.
- `Create a new issue anyway` keeps the form open and requires explicit confirmation if an active issue exists.
- `Open delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `View timeline` routes to `/(sender)/deliveries/:deliveryId/timeline`.
- `Track refund` routes to `/(sender)/deliveries/:deliveryId/refund`.
- `Try again` retries failed reads or submit depending on state.

Blocked behavior:
- Do not submit if route `deliveryId` is invalid.
- Do not submit if category is missing.
- Do not submit if severity is missing.
- Do not submit if summary is under `5` chars or over `160` chars.
- Do not submit if description exists and is under `5` chars or over `500` chars.
- Do not submit while offline.
- Do not submit from stale-only delivery context unless user explicitly confirms the delivery.
- Do not submit twice while the first request is in flight.
- Do not call `resolve_issue`.
- Do not call `escalate_issue`.
- Do not call refund, payment, cancellation, handoff, or proof mutation endpoints.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Delivery identity.
- Current delivery status.
- The issue category choices.
- What support will receive.
- Whether an active issue already exists.
- The primary next action.

The first viewport must answer:
- `Which delivery am I reporting?`
- `What kind of problem is this?`
- `How urgent is it?`
- `What happens after I submit?`

## Main Tension
Support intake must be short enough for mobile but structured enough for operations, finance, and support teams to act. If the form is too loose, support gets weak reports. If it is too heavy, senders abandon or create angry low-quality issues.

The design must balance:
- Fast reporting against actionable details.
- Customer language against backend enums.
- Duplicate prevention against valid separate concerns.
- Calm tone against urgent problem handling.
- Evidence needs against missing sender upload contract.
- Error clarity against small-screen density.

## Design Brief
User and job:
- An authenticated sender wants to report a problem for one delivery.

Context of use:
- Mobile, potentially emotional, delivery-specific, often during active service failure.

Entry point:
- SenderDeliveryDetail.
- SenderTrackingTimeline.
- SenderRefundStatus.
- SenderReceiptDetail.
- SenderNotifications.
- SenderDeliveryHistory.

Success state:
- Issue is created, sender sees confirmation, and can open the support thread.

Primary action:
- `Submit issue`.

Navigation model:
- Issue creation is a focused form. Support thread is the next route after success.

Density:
- Medium-low. The screen needs structured choices but should avoid long forms.

Visual thesis:
- A calm incident intake card: delivery context first, guided category chips, urgency as plain language, and one strong submit path.

Restraint rule:
- Avoid chat UI, file upload zones, legal walls, admin jargon, and multi-page questionnaires.

Product lens:
- Trust-critical support intake for money, custody, and service failure.

System stance:
- Native mobile form with progressive disclosure and strong validation.

Interaction thesis:
- Sender selects category, confirms urgency, writes one clear summary, optionally adds details, then submits once.

Signature move:
- Category-first issue composer that changes guidance text, default urgency suggestion, and help copy based on the selected issue type.

Activation event:
- Backend returns `issueResponseSchema`, and sender opens the new support thread.

## Elite Quality Gate
This spec is not closed unless issue creation is schema-bound, fast, accessible, and support-actionable.

Non-negotiable quality requirements:
- First viewport shows delivery context and category selection.
- Category values map exactly to `issueCategorySchema`.
- Severity values map exactly to `issueSeveritySchema`.
- Summary obeys `5` to `160` characters.
- Description is optional but, if present, obeys `5` to `500` characters.
- Submit calls only `create_issue`.
- Submitted state uses `issueResponseSchema`.
- Active existing issue is shown before new issue submission when available.
- Sender can still create a separate issue after explicit confirmation.
- Offline issue creation is not queued.
- The screen does not add evidence upload until backend contract exists.
- The screen hides staff IDs, reporter actor ID, raw notes, escalation metadata, and raw issue metadata.
- Field errors are visible, specific, and announced.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the screen sends fields outside `createIssueRequestSchema`, it remains open.
- If backend enum values are shown as raw jargon, it remains open.
- If submit can double-create on repeated taps, it remains open.
- If existing issue warning blocks valid separate issues entirely, it remains open.
- If damage/loss/proof issue asks for upload here, it remains open.
- If field errors are only color-coded, it remains open.
- If the success state does not route to support thread, it remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, code, or visual assets to copy:

- [GOV.UK Design System error message](https://design-system.service.gov.uk/components/error-message/): supports specific, field-near validation messages.
- [GOV.UK Design System error summary](https://design-system.service.gov.uk/components/error-summary/): supports top-level form error summaries that link to failed fields.
- [W3C WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports identifying input errors in text.
- [W3C WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit progress and success updates.
- [Apple Human Interface Guidelines: text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields): supports clear labels, helpful input context, and platform-native editing behavior.
- Kra `packages/shared/src/contracts/api.ts`: defines issue categories, severity values, request body, and response body.
- Kra `services/api/src/issues.ts`: defines sender issue creation permissions and default `open` status.
- Kra `docs/03-business/refund-and-dispute-rules.md`: defines payment/refund, loss, damage, and dispute context.

## Backend Contract Alignment
Primary read:
- Operation: `get_delivery`.
- Purpose: show delivery context and catch not found or unauthorized early.
- Response schema: `deliveryDetailResponseSchema`.
- Required fields:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `receiver.name`
- `package.description`
- `quote.amount`
- `latestEvent.type`
- `latestEvent.occurredAt`

Duplicate-prevention read:
- Operation: `list_issues`.
- Query:
- `deliveryId`
- `limit=50`
- Response schema: `issueListResponseSchema`.
- Relevant existing issues:
- `status=open`
- `status=in_review`
- `status=escalated`
- Same `deliveryId`
- Any category, but prioritize same category once user selects category.

Primary mutation:
- Operation: `create_issue`.
- Method: `POST`.
- Path: `/v1/issues`.
- Request schema: `createIssueRequestSchema`.
- Response schema: `issueResponseSchema`.
- Idempotency: backend route is idempotent by request fingerprint.

Allowed request body:
- `deliveryId`
- `category`
- `severity`
- `summary`
- optional `description`

Allowed category values:
- `delay`
- `damage`
- `loss`
- `payment`
- `handoff`
- `other`

Allowed severity values:
- `p1`
- `p2`
- `p3`

Forbidden fields:
- `issueId`
- `status`
- `reporter`
- `resolutionCode`
- `resolutionNote`
- `escalationReasonCode`
- `proofReference`
- `paymentId`
- `providerReference`
- `actorId`
- `stationId`
- any attachment metadata.

Forbidden mutations:
- `resolve_issue`
- `escalate_issue`
- `refund_payment`
- `settle_refund_payment`
- `cancel_delivery`
- `initialize_payment`
- `verify_payment`
- `record_handoff`
- `complete_delivery`
- `create_delivery_proof_asset`
- `confirm_delivery_proof_asset_upload`

## Category Model
Customer-facing categories must be plain language while mapping exactly to backend enum values.

Category options:
| Customer label | Backend category | Recommended default severity | Guidance |
| --- | --- | --- | --- |
| `Delivery is late` | `delay` | `p2` | Ask when they expected movement or arrival. |
| `Package is damaged` | `damage` | `p1` | Ask what damage is visible and when it was noticed. |
| `Package may be missing` | `loss` | `p1` | Ask what status or handoff looks wrong. |
| `Payment or refund` | `payment` | `p2` | Ask for payment/refund concern without provider reference. |
| `Handoff or proof problem` | `handoff` | `p1` | Ask what proof, scan, or handoff does not match. |
| `Something else` | `other` | `p3` | Ask for a concise description. |

Category behavior:
- Category is required.
- Selecting category updates guidance copy.
- Selecting category can set recommended severity if sender has not manually chosen severity.
- If sender has manually chosen severity, do not override it.
- Category chips must be accessible radio options.
- Category labels must never expose raw enum values as visible labels.

Category-specific prompts:
- Delay: `What movement or delivery update is late?`
- Damage: `What is damaged, and when did you notice it?`
- Loss: `What makes you think the package is missing?`
- Payment: `What payment or refund issue should support review?`
- Handoff: `Which scan, handoff, or proof detail looks wrong?`
- Other: `What should support know?`

Category-specific helper text:
- Delay: `Include the expected movement or arrival time if you know it.`
- Damage: `Support may ask for evidence in the thread after this issue is opened.`
- Loss: `Include the last status that looked correct.`
- Payment: `Do not include full wallet or provider reference details in this message.`
- Handoff: `Tell us what does not match the package or receiver experience.`
- Other: `Keep it specific so support can route it correctly.`

## Severity Model
Customer-facing severity must not expose `p1`, `p2`, or `p3` as the visible labels.

Severity options:
| Customer label | Backend severity | Use when |
| --- | --- | --- |
| `Urgent` | `p1` | Loss, damage, wrong proof, unsafe handoff, or money risk that needs fast review. |
| `Important` | `p2` | Delay, refund, payment, or service problem that needs support action. |
| `Standard` | `p3` | General question or low-risk issue. |

Defaulting:
- `damage`, `loss`, and `handoff` default to `p1`.
- `delay` and `payment` default to `p2`.
- `other` defaults to `p3`.

User override:
- Sender can change severity before submission.
- UI should explain urgency choice in human terms.
- Do not let severity be empty.

Severity copy:
- Urgent: `Support should review this quickly.`
- Important: `Support should review and respond.`
- Standard: `This can be handled through normal support.`

## Form Fields
### Delivery Context Card
Purpose:
- Confirm the sender is reporting the right delivery.

Content:
- Tracking code.
- Current delivery status.
- Route summary.
- Package description.
- Original quote amount.

Actions:
- `Open delivery`
- `View timeline`

Privacy:
- Do not show receiver phone.
- Do not show custody actor IDs.
- Do not show assigned driver or courier IDs.
- Do not show proof reference.

### Category
Type:
- Radio chips or single-select list.

Required:
- Yes.

Validation error:
- `Choose what kind of issue this is.`

Interaction:
- Selecting category updates guidance.
- If active issue exists in same category, show warning.

### Severity
Type:
- Segmented control or radio list.

Required:
- Yes.

Validation error:
- `Choose how urgent this issue is.`

Interaction:
- Default from category.
- User can override.

### Summary
Type:
- Single-line or compact multi-line text field.

Required:
- Yes.

Limits:
- Minimum `5`.
- Maximum `160`.

Label:
- `Short summary`

Hint:
- `Write one clear sentence support can scan.`

Validation:
- Empty: `Write a short summary.`
- Too short: `Summary must be at least 5 characters.`
- Too long: `Summary must be 160 characters or less.`

Character count:
- Show count after first input.
- Warn at `140`.
- Error above `160`.

### Description
Type:
- Multi-line text area.

Required:
- No.

Limits:
- If present, minimum `5`.
- Maximum `500`.

Label:
- `Details`

Hint:
- `Add timing, status, or context that helps support act.`

Validation:
- Too short: `Details must be at least 5 characters or left blank.`
- Too long: `Details must be 500 characters or less.`

Character count:
- Show count after input.
- Warn at `450`.
- Error above `500`.

### Attachment Notice
Current v1 decision:
- No upload control on this screen.

Notice copy for damage/loss/handoff:
- `Support may ask for photos or proof details in the support thread.`

Guardrail:
- Do not show upload button.
- Do not collect local files.
- Do not reference a proof asset API from this screen.

## Information Architecture
Top-to-bottom order:
1. Header.
2. Delivery context.
3. Existing issue warning.
4. Category selection.
5. Severity selection.
6. Summary field.
7. Details field.
8. What happens next panel.
9. Submit footer.
10. Help links.

Header:
- Back control.
- Title: `Report an issue`.
- Optional close only if app route pattern uses it.

Delivery context:
- Compact card.
- Current status.
- Tracking code.
- Route.
- Link to timeline.

Existing issue warning:
- Appears only when active issue exists.
- Shows latest active issue status and category.
- Primary action opens existing support thread.
- Secondary action allows creating a separate issue.

Category:
- Strong visual focus.
- Use two-column chips only if labels fit.
- Otherwise use full-width list rows.

Severity:
- Show after category.
- Use default suggestion but keep editable.

Summary/details:
- Keep labels persistent.
- Do not rely on hint text as label.

What happens next:
- Support creates an open issue.
- Sender can continue in support thread.
- Support may ask for evidence or clarification.

Footer:
- Sticky submit button.
- Disabled until required fields are valid.
- If active issue exists and sender has not confirmed separate issue, footer primary opens existing issue.

## Visual System
Visual thesis:
- Serious, guided, and low-friction. The form should feel like a clean incident intake, not a generic contact form.

Design direction:
- White or warm-neutral screen surface.
- Delivery context card uses dark ink text and subtle route line.
- Category chips have strong selected state.
- Urgency uses clear labels with restrained color.
- Error states use red plus icons and text.
- Existing issue warning uses amber or blue, not alarming red.

Color roles:
- `issue.surface`
- `issue.card`
- `issue.text`
- `issue.muted`
- `issue.selected`
- `issue.warning`
- `issue.error`
- `issue.success`
- `issue.divider`

Color constraints:
- Never use color alone for selected, error, warning, or severity.
- Urgent does not need aggressive red unless combined with an actual error.
- High contrast mode must add outlines.

Typography:
- Header title medium-large.
- Delivery tracking code uses tabular or monospace styling.
- Category labels use medium weight.
- Helper text small but readable.
- Error text not below 13 points.

Spacing:
- Keep category and severity controls close to their labels.
- Give error summaries enough top spacing.
- Keep sticky footer separated from fields.
- Ensure the final text area remains reachable above the footer.

Motion:
- Use small expansion when category guidance changes.
- Use static swap under reduced motion.
- Do not animate error fields repeatedly.

## Layout
Base layout:
- Safe-area aware.
- Scrollable form.
- Sticky bottom submit.
- Keyboard-aware.

Small phones:
- Full-width category rows.
- Severity as vertical radio list.
- Sticky footer uses one primary button.
- Existing issue warning uses compact copy.

Large phones:
- Category can use two-column chips if labels do not truncate.
- Severity can use segmented control.

Keyboard-open layout:
- Sticky footer lifts above keyboard.
- Focused field scrolls into view.
- Error summary does not cover focused input.

Landscape:
- Keep single-column.
- Footer does not overlap content.

## Component Inventory
Screen components:
- `SenderIssueCreateScreen`
- `IssueCreateHeader`
- `IssueDeliveryContextCard`
- `ExistingIssueWarning`
- `IssueCategorySelector`
- `IssueSeveritySelector`
- `IssueSummaryField`
- `IssueDescriptionField`
- `IssueNextStepsCard`
- `IssueSubmitFooter`
- `IssueCreateSkeleton`
- `IssueCreateSuccessPanel`
- `IssueCreateErrorPanel`

Shared components allowed:
- App header.
- Button.
- Text field.
- Text area.
- Radio group.
- Status badge.
- Inline alert.
- Error summary.
- Toast.
- Loading skeleton.

Components not allowed:
- Chat composer.
- Attachment uploader.
- Admin issue queue.
- Refund approval dialog.
- Escalation dialog.
- Resolution dialog.
- Proof asset uploader.

## Screen States
### Loading
Trigger:
- Delivery context and existing issues are loading with no cache.

UI:
- Header visible.
- Delivery context skeleton.
- Category selector skeleton.
- Disabled submit footer.

Copy:
- `Loading issue form`
- `Checking the delivery record before you report an issue.`

Accessibility:
- Announce loading once.

### Ready
Trigger:
- Delivery context loaded.
- No active existing issue, or sender chooses to create separate issue.

UI:
- Delivery context.
- Category selector.
- Severity selector.
- Summary field.
- Details field.
- Next steps panel.
- Submit footer.

Submit enabled when:
- Category selected.
- Severity selected.
- Summary valid.
- Description empty or valid.
- Online.
- Not submitting.

### Existing Issue Warning
Trigger:
- `list_issues` returns an active issue for the delivery.

Active statuses:
- `open`
- `in_review`
- `escalated`

Warning title:
- `There is already an open issue for this delivery.`

Body:
- `Opening the existing thread usually gets a faster response because support can see the full history.`

Primary action:
- `Open existing issue`

Secondary action:
- `Create a separate issue`

If same selected category:
- Strengthen warning:
- `You already have an active issue in this category.`

If different category:
- Allow creation after confirmation.

### Field Errors
Trigger:
- User taps submit with invalid fields, or backend returns validation error.

UI:
- Top error summary.
- Field-level errors.
- Focus first invalid field.

Error summary title:
- `Fix the highlighted fields.`

Error summary links:
- Category.
- Severity.
- Summary.
- Details.

### Submitting
Trigger:
- Valid form submitted.

UI:
- Disable all submit controls.
- Keep fields visible.
- Show submit progress.
- Prevent navigation confirmation only if app has unsaved-change pattern and request is not complete.

Button:
- `Submitting issue`

Accessibility:
- Announce `Submitting issue.`

### Submitted
Trigger:
- `create_issue` returns `issueResponseSchema`.

Hero:
- `Issue submitted`

Body:
- `Support has opened this issue for your delivery. Continue in the support thread for updates.`

Primary action:
- `Open support thread`

Secondary actions:
- `Open delivery`
- `View timeline`

Display:
- Issue category.
- Issue status `Open`.
- Created time.

Do not display:
- Reporter actor ID.
- Internal issue metadata.
- Staff IDs.

### Not Found
Trigger:
- `get_delivery` or `create_issue` returns `NOT_FOUND`.

Headline:
- `Delivery not found.`

Body:
- `This issue cannot be created because the delivery record was not found.`

Primary action:
- `Go to history`

### Not Authorized
Trigger:
- `FORBIDDEN`.

Headline:
- `You cannot report an issue for this delivery.`

Body:
- `Sign in with the sender account that created this delivery, or contact support.`

Primary action:
- `Go back`

Secondary action:
- `Contact support`

### Offline
Trigger:
- Device is offline.

Headline:
- `Issue reporting needs internet.`

Body:
- `Connect to the internet before submitting so support receives the issue once.`

Primary action:
- `Try again`

Guardrail:
- Do not queue issue creation offline.

### API Error
Trigger:
- Non-auth, non-rate-limit server or network failure.

Headline:
- `We could not submit this issue.`

Body:
- `Try again. If this keeps happening, contact support from the delivery screen.`

Primary action:
- `Try again`

### Rate Limited
Trigger:
- `RATE_LIMITED`.

Headline:
- `Too many issue attempts.`

Body:
- `Wait a short while before trying again. This prevents duplicate support records.`

Primary action:
- `Try later`

### Session Expired
Trigger:
- Auth token expired or missing.

Headline:
- `Sign in to report this issue.`

Body:
- `Issue reports are tied to the sender account for this delivery.`

Primary action:
- `Sign in`

## Copy System
Voice:
- Calm.
- Direct.
- Actionable.
- Not defensive.
- Not legalistic.

Words to prefer:
- `issue`
- `support`
- `delivery`
- `package`
- `payment`
- `refund`
- `handoff`
- `proof`
- `review`
- `thread`

Words to avoid:
- `ticket` as the primary word unless app already uses it.
- `case number` unless backend exposes it.
- `guaranteed`
- `instant`
- `investigation complete`
- `compensation approved`
- `refund approved`
- Raw `p1`, `p2`, `p3` labels.

Headlines:
- Form: `Report an issue`
- Existing issue: `There is already an open issue for this delivery.`
- Success: `Issue submitted`
- Offline: `Issue reporting needs internet.`
- Error: `We could not submit this issue.`

Next steps copy:
- `Support will review the issue and continue in the support thread.`
- `For damage, loss, or handoff concerns, support may ask for photos or more details in the thread.`
- `For payment or refund issues, do not enter full wallet or provider reference details here.`

Validation copy:
- Category: `Choose what kind of issue this is.`
- Severity: `Choose how urgent this issue is.`
- Summary empty: `Write a short summary.`
- Summary short: `Summary must be at least 5 characters.`
- Summary long: `Summary must be 160 characters or less.`
- Details short: `Details must be at least 5 characters or left blank.`
- Details long: `Details must be 500 characters or less.`

## Data Formatting
Delivery status:
- Use existing status label mapper from sender delivery detail if available.
- Do not show raw enum as primary label.

Tracking code:
- Show `trackingCode`.
- Copy action optional.

Route:
- Show station names if mapping exists.
- Otherwise show station IDs in secondary copy.

Money:
- Show `GHS {quote.amount}` only as original quote context.
- Do not imply refund or compensation.

Time:
- Show latest event time if helpful.
- Use local date formatting.

Issue status after submit:
- Show `Open`.
- Do not show raw backend status as lowercase enum.

## Interaction Rules
Category selection:
- Required.
- Updates default severity only until sender manually edits severity.
- Updates helper text.
- Updates summary prompt.
- Rechecks existing active issue for same category.

Severity selection:
- Required.
- Always editable.
- Plain-language labels.

Summary:
- Required.
- Trim before submit.
- Preserve user text on validation failure.

Description:
- Optional.
- Trim before submit.
- If empty after trim, omit from request body.
- Preserve user text on validation failure.

Submit:
- Validate client-side first.
- Show error summary if invalid.
- On valid submit, call `create_issue`.
- Disable submit until request completes.
- On success, render submitted state and store returned `issueId` for navigation.

Back navigation:
- If form has user input, show unsaved-change confirmation if app has an existing pattern.
- If no input, go back immediately.
- Do not show confirmation after submitted state.

Existing issue flow:
- If active issue exists before any form input, show warning above category.
- Primary action opens issue thread.
- Secondary action sets `creatingSeparateIssue=true`.
- If active issue appears after refresh, do not erase form.

## Accessibility
Screen reader:
- Announce page title.
- Announce existing issue warning when it appears.
- Announce validation summary after failed submit.
- Announce submit progress.
- Announce success.

Labels:
- Category group label: `Issue type`.
- Severity group label: `Urgency`.
- Summary label: `Short summary`.
- Details label: `Details`.

Radio groups:
- Category chips must be real radio choices.
- Severity options must be real radio choices.
- Selected state must be announced.

Error summary:
- Focus error summary after invalid submit.
- Each summary item moves focus to the corresponding field.
- Field errors are connected to inputs.

Dynamic type:
- Category chips wrap or become rows.
- Summary/details labels remain visible.
- Sticky footer does not cover fields.

Reduced motion:
- Disable category guidance animation.
- Keep error and success transitions static.

High contrast:
- Selected options use outline and text.
- Error fields use icon and text.
- Warning panel uses text and border.

Touch targets:
- Minimum `44x44` points.
- Radio rows should be full-width tappable.

## Privacy And Security
Hide:
- Receiver phone.
- Payer phone.
- Provider references.
- Payment IDs.
- Staff actor IDs.
- Reporter actor ID.
- Assigned driver ID.
- Assigned courier ID.
- Custody actor ID.
- Proof asset reference.
- Raw issue metadata.
- Raw delivery event metadata.

Collect:
- Category.
- Severity.
- Summary.
- Optional description.

Do not collect:
- Full wallet number.
- Provider reference.
- Bank details.
- GPS coordinates.
- Photos.
- Signatures.
- Government ID.
- Passwords or OTPs.

Security:
- Require authenticated sender access.
- Respect backend `FORBIDDEN`.
- Clear form draft on sign out.
- Do not include description in analytics.
- Do not include summary in analytics.

## Analytics
Events:
- `sender_issue_create_viewed`
- `sender_issue_delivery_loaded`
- `sender_issue_existing_issue_shown`
- `sender_issue_existing_issue_opened`
- `sender_issue_separate_issue_chosen`
- `sender_issue_category_selected`
- `sender_issue_severity_selected`
- `sender_issue_submit_tapped`
- `sender_issue_validation_failed`
- `sender_issue_submitted`
- `sender_issue_submit_failed`
- `sender_issue_support_thread_opened`
- `sender_issue_offline_shown`

Allowed properties:
- `deliveryId`
- `category`
- `severity`
- `hasActiveIssue`
- `activeIssueStatus`
- `currentStatus`
- `paymentStatus`
- `entryPoint`
- `errorCode`

Forbidden properties:
- `summary`
- `description`
- `receiverPhone`
- `payerPhone`
- `providerReference`
- `paymentId`
- `actorId`
- `rawMetadata`

Activation:
- Sender submits issue successfully.
- Sender opens created support thread.
- Sender opens existing issue instead of creating duplicate.

## Error Mapping
Backend error mapping:
| Error | UI title | Primary action | Notes |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` | `Fix the highlighted fields.` | `Fix fields` | Map details to fields when possible. |
| `FORBIDDEN` | `You cannot report an issue for this delivery.` | `Go back` | Offer support. |
| `NOT_FOUND` | `Delivery not found.` | `Go to history` | Do not reveal other-user ownership. |
| `RATE_LIMITED` | `Too many issue attempts.` | `Try later` | Keep form text. |
| `INTERNAL_ERROR` | `We could not submit this issue.` | `Try again` | Keep form text. |

Delivery read failure:
- If no delivery data, block form.
- If cache exists, show stale banner and require confirmation before submit.

Existing issue read failure:
- Do not block form.
- Show compact banner:
- `Could not check for existing issues.`

Submit failure:
- Preserve all user input.
- Keep category/severity selections.
- Move focus to error panel.

## Edge Cases
Invalid route delivery ID:
- Show error before fetching.
- Primary action `Go back`.

Delivery already closed:
- Allow issue creation.
- Many issues can be post-delivery.
- Guidance should say support will review the record.

Delivery cancelled:
- Allow payment/refund or cancellation issue.
- Category default can be `payment` if entry came from refund status.

Payment failed:
- Allow payment issue.
- Suggest payment recovery route only from delivery/payment screens, not as primary here.

Refund pending:
- Payment category guidance should mention refund status route.
- Secondary action can be `Track refund`.

Delivered but receiver says not received:
- Recommend `handoff` with `Urgent`.
- Do not complete or reverse delivery from this screen.

Damage:
- Recommend `damage` with `Urgent`.
- Mention support may ask for photos in thread.
- Do not upload on this route.

Loss:
- Recommend `loss` with `Urgent`.
- Ask for last correct status.

Delay:
- Recommend `delay` with `Important`.
- Ask expected movement or arrival.

Duplicate active issue:
- Show existing issue warning.
- Sender can create separate issue only after confirmation.

Offline after form completion:
- Disable submit.
- Preserve text locally in memory.
- Do not queue request.

App killed during form:
- Draft persistence may be app-wide decision.
- If draft persistence exists, encrypt or keep within app storage policy.
- If no draft persistence, losing unsubmitted text is acceptable.

## Performance
Initial load:
- Fetch delivery and existing issues in parallel.
- Render skeleton until delivery loads.
- If issues load slower, render form and then existing issue warning when available.

Submit:
- One network mutation.
- No attachment upload.
- No polling.

Caching:
- Do not cache submitted form body after success.
- Invalidate issue list cache for this delivery after success.
- Invalidate support thread cache for returned `issueId`.

Rendering:
- Use simple controls.
- Avoid heavy animation.
- Avoid media previews.
- Keep form component tree shallow.

## Testing Requirements
Unit tests:
- Category labels map to backend enum values.
- Severity labels map to backend enum values.
- Category default severity works.
- Manual severity override is preserved when category changes.
- Summary validation enforces `5` to `160`.
- Description validation enforces optional empty or `5` to `500`.
- Request body omits empty description.
- Existing active issue detection uses same delivery only.
- Existing active issue prioritizes open/in_review/escalated.

Component tests:
- `screen-sender-issue-create` renders loading state.
- Delivery context renders after `get_delivery`.
- Category selection updates guidance.
- Existing issue warning opens support thread.
- Submit button disables until valid.
- Error summary links to fields.
- Success state routes to returned issue ID.
- Offline state blocks submit.

Integration tests:
- Calls `get_delivery`.
- Calls `list_issues`.
- Calls `create_issue` with only allowed fields.
- Does not call `resolve_issue`.
- Does not call `escalate_issue`.
- Does not call proof upload endpoints.
- Handles `VALIDATION_ERROR`.
- Handles `FORBIDDEN`.
- Handles `NOT_FOUND`.
- Handles `RATE_LIMITED`.

E2E tests:
- Sender creates delay issue and opens support thread.
- Sender sees active issue and opens existing thread.
- Sender creates separate damage issue after confirming active issue warning.
- Sender fixes validation errors and submits.
- Sender cannot submit while offline.

Accessibility tests:
- Category and severity groups are announced.
- Field errors are connected to inputs.
- Error summary receives focus.
- Submit progress is announced.
- Success state is announced.
- Large text does not clip.
- High contrast has visible selected and error states.

## Test IDs
Screen:
- `screen-sender-issue-create`

Delivery:
- `issue-delivery-context`
- `issue-delivery-tracking-code`
- `issue-delivery-status`
- `issue-delivery-route`
- `issue-delivery-open-action`
- `issue-delivery-timeline-action`

Existing issue:
- `issue-existing-warning`
- `issue-existing-open-action`
- `issue-existing-create-separate-action`

Category:
- `issue-category-selector`
- `issue-category-delay`
- `issue-category-damage`
- `issue-category-loss`
- `issue-category-payment`
- `issue-category-handoff`
- `issue-category-other`

Severity:
- `issue-severity-selector`
- `issue-severity-urgent`
- `issue-severity-important`
- `issue-severity-standard`

Fields:
- `issue-summary-field`
- `issue-summary-error`
- `issue-description-field`
- `issue-description-error`
- `issue-error-summary`

Actions:
- `issue-submit-action`
- `issue-success-open-thread-action`
- `issue-track-refund-action`
- `issue-try-again-action`

States:
- `issue-loading-state`
- `issue-submitting-state`
- `issue-submitted-state`
- `issue-offline-state`
- `issue-api-error-state`
- `issue-rate-limited-state`

## Implementation Notes For Claude Code
Data hooks:
- Use `useGetDeliveryQuery(deliveryId)`.
- Use `useListIssuesQuery({ deliveryId, limit: 50 })`.
- Use `useCreateIssueMutation()`.
- Do not import refund/admin/proof mutation hooks.

State model:
- `category: "delay" | "damage" | "loss" | "payment" | "handoff" | "other" | null`
- `severity: "p1" | "p2" | "p3" | null`
- `summary: string`
- `description: string`
- `creatingSeparateIssue: boolean`
- `hasUserChangedSeverity: boolean`
- `submitState: "idle" | "submitting" | "submitted" | "error"`

Pure helpers:
- `mapIssueCategoryOptionToApiValue`.
- `mapSeverityOptionToApiValue`.
- `getDefaultSeverityForCategory`.
- `validateIssueCreateForm`.
- `buildCreateIssueRequest`.
- `findActiveIssueForDelivery`.

Request builder:
- Trim `summary`.
- Trim `description`.
- Omit `description` if trimmed value is empty.
- Include route `deliveryId`.
- Include category and severity enum values.

Success handling:
- Store returned `issueId`.
- Show submitted state.
- Invalidate issue list.
- Route to `/(sender)/support/:issueId` on primary action.

Do not implement:
- Chat thread UI.
- Evidence upload.
- Admin issue queue.
- Refund approval.
- Issue escalation.
- Issue resolution.
- Payment retry.

## QA Review Checklist
Contract:
- Uses `createIssueRequestSchema`.
- Uses `issueResponseSchema`.
- Uses enum values exactly.
- Does not send unsupported fields.
- Does not call unsupported mutations.

UX:
- Delivery context is clear.
- Category choices are customer language.
- Severity choices are customer language.
- Existing issue warning is useful but not blocking forever.
- Submit state prevents duplicate requests.
- Success routes to support thread.

Copy:
- No raw `p1`, `p2`, `p3` visible as primary labels.
- No refund or compensation promises.
- Damage/loss copy says support may ask for evidence later.
- Payment/refund copy avoids provider reference collection.

Accessibility:
- Error summary works.
- Field errors are clear.
- Radio groups are accessible.
- Keyboard and focus behavior work.
- Large text works.

Privacy:
- No receiver phone.
- No provider reference.
- No payment ID.
- No actor IDs.
- No raw issue metadata.
- No summary/description analytics.

## Open Backend Gaps To Track Outside This Screen
These are not blockers for this screen:

- Sender evidence upload for damage/loss issue threads.
- Issue subcategory taxonomy.
- Duplicate issue prevention on backend.
- Sender-visible issue SLA estimate.
- Structured payment/refund issue fields.
- Dedicated issue draft persistence policy.

Current decision:
- Build the screen with the existing issue API.
- Use category, severity, summary, and optional description only.
- Route evidence and ongoing support to the support thread.
- Do not add fields not accepted by the backend.

## Build Sequence
1. Add route file for `/(sender)/deliveries/:deliveryId/issues/new`.
2. Add typed delivery context query.
3. Add typed issue list query for active issue warning.
4. Add category and severity option models.
5. Add validation helper aligned to `createIssueRequestSchema`.
6. Add request builder that omits empty description.
7. Add delivery context card.
8. Add existing issue warning.
9. Add category selector.
10. Add severity selector.
11. Add summary and details fields.
12. Add next steps panel.
13. Add submit footer.
14. Add submitted state.
15. Add loading, offline, stale, error, not found, unauthorized, and rate-limit states.
16. Add analytics with safe properties.
17. Add accessibility labels, error summary, and status announcements.
18. Add unit, component, integration, and E2E coverage.
19. Run lint, typecheck, coverage, and critical coverage.

## Final Acceptance Statement
Claude Code should build `SenderIssueCreate` as a schema-bound, mobile-first support intake form. It must load delivery context, warn about active existing issues, collect category, urgency, summary, and optional details, validate exactly against `createIssueRequestSchema`, submit `create_issue` once, render the returned `issueResponseSchema`, route to the support thread, avoid unsupported upload/refund/admin behavior, and protect receiver, payment, provider, staff, actor, and raw metadata from the sender UI and analytics.

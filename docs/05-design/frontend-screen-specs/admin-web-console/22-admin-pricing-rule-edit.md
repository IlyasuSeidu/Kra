# Admin Pricing Rule Edit Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID            | `AdminPricingRuleEdit`                                                                                                                                                                      |
| Route                | `/admin/pricing-rules/edit`                                                                                                                                                                 |
| Primary test ID      | `screen-admin-pricing-rule-edit`                                                                                                                                                            |
| Surface              | Admin web console                                                                                                                                                                           |
| Backend coverage     | `admin_pricing_rules`, `admin_update_pricing_rules`                                                                                                                                         |
| Offline critical     | No                                                                                                                                                                                          |
| Required read role   | `finance_admin` or `super_admin` through `manage_pricing_rules` capability                                                                                                                  |
| Required submit role | `finance_admin` or `super_admin` through `manage_pricing_rules` capability                                                                                                                  |
| Required states      | `loading`, `ready`, `dirty`, `client_invalid`, `review`, `confirm`, `submitting`, `saved`, `not_authorized`, `session_expired`, `api_error`, `server_validation_error`, `stale_active_rule` |
| Parent screens       | `AdminPricingRules`, protected admin shell                                                                                                                                                  |
| Related screens      | `AdminPricingRules`, `AdminFinanceSummary`, `AdminAuditEvents`, `PublicPricingExplainer`, `SenderQuoteReview`, `AdminLaunchReadiness`                                                       |

## Purpose

`AdminPricingRuleEdit` is the finance-controlled workflow for replacing the active launch corridor base-fee table. It lets an authorized finance admin or super admin edit all required one-way launch corridor base fees, choose an optional effective timestamp, add an optional finance note, review the full payload, confirm the impact, and submit an idempotent update.

The screen should answer:

- `What is the current active pricing rule?`
- `Which route base fees are changing?`
- `Are all required launch corridors present?`
- `Are all fees valid GHS integer amounts?`
- `When should this rule become effective?`
- `What finance note explains the change?`
- `What exact payload will be submitted?`
- `What happens to existing delivery quotes?`
- `Did the backend save the new active rule?`

This screen is a high-impact finance control. It must prevent incomplete route tables, duplicate corridors, accidental same-station routes, silent changes, and unclear effective timing.

## Backend Reality

The active pricing read endpoint is:

```http
GET /v1/admin/pricing-rules
```

The update endpoint is:

```http
POST /v1/admin/pricing-rules/active
```

Read operation:

```text
admin_pricing_rules
```

Mutation operation:

```text
admin_update_pricing_rules
```

Capability:

```text
manage_pricing_rules
```

Request body:

```json
{
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 35
    }
  ],
  "effectiveAt": "2026-05-20T09:00:00.000Z",
  "note": "Launch corridor finance approval."
}
```

Successful response:

```json
{
  "pricingRuleId": "PRC-0002",
  "status": "active",
  "currency": "GHS",
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 35
    }
  ],
  "effectiveAt": "2026-05-20T09:00:00.000Z",
  "updatedAt": "2026-05-20T08:50:00.000Z",
  "updatedByUserId": "USR-FIN-001",
  "note": "Launch corridor finance approval."
}
```

Important backend facts:

- The endpoint requires `manage_pricing_rules`.
- The body requires a complete route table of six launch corridors.
- Each base fee must be a positive integer and max `10000`.
- Origin and destination must be different.
- Duplicate corridors are rejected.
- Missing corridors are rejected.
- `effectiveAt` is optional; backend uses current time when omitted.
- `note` is optional and must be `3..240` characters if present.
- Backend sorts route fees by route key before saving.
- Backend creates a new pricing rule ID.
- Backend saves the new record as active.
- The mutation is idempotent when the request includes `Idempotency-Key`.
- Existing delivery quotes store their quoted amount and are not retroactively changed by later pricing updates.

Therefore:

- The screen must load current active pricing before editing.
- The screen must submit a complete six-corridor table every time.
- The screen must not let the admin remove required corridors.
- The screen must not let the admin add non-launch corridors.
- The screen must not submit partial changes.
- The screen must not update non-route surcharges.
- The screen must require review and confirmation before submit.
- The screen must include an idempotency key on submit.

## Primary Users

Primary:

- `finance_admin` updating launch corridor base fees.
- `super_admin` updating pricing when finance governance permits.

Secondary:

- Product owner reviewing price change impact.
- Operations owner checking corridor service implications.
- QA validating pricing edit behavior.
- Security reviewer validating finance control boundaries.
- Claude Code implementing the admin console later.

Non-users:

- `ops_admin` without pricing capability.
- `support_admin`.
- `station_operator`.
- `driver`.
- `final_mile_courier`.
- `sender`.
- Public visitor.

## User Goal

Authorized admins use this screen to:

- Start from the current active route table.
- Edit one or more corridor base fees.
- Keep all six one-way corridors present.
- Set an optional future effective time.
- Add a finance or approval note.
- Review changes against current active values.
- Confirm that existing delivery quotes are not changed retroactively.
- Submit the update once.
- See the backend-saved active rule.
- Return to pricing rules or finance summary.

The screen should be efficient for finance staff but strict enough to prevent accidental production price changes.

## Entry Points

The screen can open from:

- `AdminPricingRules` primary action.
- `AdminFinanceSummary` pricing shortcut.
- `AdminLaunchReadiness` pricing readiness issue.
- `AdminAuditEvents` pricing update context.
- Direct route `/admin/pricing-rules/edit`.

The screen must not open from:

- Public web.
- Sender app.
- Receiver tracking.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Support-only admin navigation.

## Scope

In scope:

- Load active pricing rule.
- Edit six route base fees.
- Optional effective time.
- Optional note.
- Client route-table validation.
- Changed-fee summary.
- Review step.
- Confirmation dialog.
- Idempotent submit.
- Saved backend result.
- Unsaved-change guard.
- Stale active-rule warning.
- Authorization, session, validation, API, and server errors.
- Accessibility, analytics, and responsive behavior.

Out of scope:

- Inline mutation on `AdminPricingRules`.
- Editing weight surcharges.
- Editing size surcharges.
- Editing express surcharge formula.
- Editing doorstep surcharge bands.
- Editing fragile surcharge.
- Editing declared-value surcharge.
- Currency conversion.
- Tax rules.
- Historical pricing list.
- Pricing export.
- Public pricing content editing.
- Quote calculation.
- Refund calculation.

## Design Thesis

The screen should feel like a controlled finance change set: exact, complete, and review-first. The admin should always see current versus proposed fees, required corridors, validation status, and final impact before saving.

Visual direction:

- Use a structured finance workspace.
- Use a full-width editable corridor table on desktop.
- Use one card per corridor on mobile.
- Use current and proposed values side by side.
- Use amber for unsaved or future effective states.
- Use red only for invalid and destructive-risk language.
- Use monospaced station IDs.
- Use clear GHS amount inputs.
- Use a fixed review rail on desktop after changes exist.

Restraint rule:

- No spreadsheet-like infinite grid, no auto-added corridors, no hidden formula editor, no animated price changes, and no unrelated surcharge controls.

## Research Inputs

External research used for this screen:

- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-submit for high-impact changes.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): supports focused fields, clear labels, and explicit back behavior.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports accessible labels, fieldsets, hints, validation, and error summaries.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible editable-table structure when paired with clear form labels.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports final confirmation only when the user must focus on a high-impact action.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review, correction, and confirmation for data with financial impact.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible validation, submit, and saved feedback.

How the research affects the screen:

- Check-answer and WCAG error-prevention guidance require a review step before submit.
- Question-page and form guidance shape labels, hints, and field errors.
- Table guidance shapes desktop corridor editing.
- Modal guidance limits confirmation to the final high-impact submit.
- Status-message guidance shapes loading, invalid, submitting, and saved announcements.

## Backend Data Contract

### Read Active Rule

Request:

```http
GET /v1/admin/pricing-rules
```

Use:

- Populate edit baseline.
- Detect fallback default.
- Compare current and proposed values.
- Guard against stale updates.

### Update Active Rule

Request:

```http
POST /v1/admin/pricing-rules/active
```

Request body:

```json
{
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 35
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 35
    },
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-ACC-01",
      "baseFeeGhs": 65
    },
    {
      "originStationId": "ST-KMS-01",
      "destinationStationId": "ST-TML-01",
      "baseFeeGhs": 50
    },
    {
      "originStationId": "ST-TML-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 50
    }
  ],
  "effectiveAt": "2026-05-20T09:00:00.000Z",
  "note": "Finance approved launch corridor update."
}
```

Required header:

```http
Idempotency-Key: <stable-key-for-this-payload>
```

Response:

- Same shape as `admin_pricing_rules` response.
- Treat response as final active rule.

Rules:

- Body must include all six route base fees.
- Body must not include currency or status.
- Body must not include pricing rule ID.
- Body must not include updater user ID.
- Body must not include non-route surcharge values.

## Launch Corridor Edit Model

Required corridors:

- `ST-ACC-01 -> ST-KMS-01`
- `ST-KMS-01 -> ST-ACC-01`
- `ST-ACC-01 -> ST-TML-01`
- `ST-TML-01 -> ST-ACC-01`
- `ST-KMS-01 -> ST-TML-01`
- `ST-TML-01 -> ST-KMS-01`

Station labels:

- `ST-ACC-01`: Accra Central.
- `ST-KMS-01`: Kumasi Adum.
- `ST-TML-01`: Tamale Central.

Rules:

- Corridors are fixed.
- Admin edits only `baseFeeGhs`.
- Admin cannot add a seventh corridor.
- Admin cannot remove a corridor.
- Admin cannot change origin or destination in v1.
- Opposite directions are separate fees.
- Same-station routes are never shown.

## Form Fields

### Route Base Fees

Field per corridor:

- `baseFeeGhs`

Validation:

- Required.
- Integer.
- Positive.
- Maximum `10000`.

Input behavior:

- Use numeric input with `GHS` prefix or suffix text.
- Do not allow decimal values.
- Preserve typed value until validation.
- Show current value beside proposed value.

### Effective At

Field:

- `effectiveAt`

Validation:

- Optional.
- Must be valid datetime if present.

Behavior:

- If blank, backend uses current time.
- If set in the future, show future-effective warning.
- If set in the past, allow only if product permits immediate backdated effective time; otherwise validate against now.

V1 decision:

- Allow blank or future datetime.
- Do not allow past datetime in the UI unless backend product policy later changes.

### Note

Field:

- `note`

Validation:

- Optional.
- If present, trimmed length `3..240`.

Rules:

- Note should explain approval context.
- Note must not include customer names, phone numbers, payment provider secrets, or private incident details.
- Do not send blank note.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. Header.
3. Current active rule summary.
4. Editable route-fee table.
5. Effective time and note panel.
6. Change summary.
7. Review step.
8. Confirmation dialog.
9. Saved result.
10. Policy warning.

Mobile order:

1. Header.
2. Current active rule summary.
3. Corridor fee cards.
4. Effective time and note.
5. Change summary.
6. Review.
7. Confirmation.
8. Saved result.
9. Policy warning.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main width max `1280px`.
- Two-column content after header.
- Left column: editable fee table and supporting fields.
- Right column: change summary and review rail.
- Right rail sticky below shell header.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Editable table with wrapped columns if readable.
- Review rail moves below form.

### Mobile

Viewport:

- `<768px`

Layout:

- Corridor cards.
- One fee input per card.
- Sticky bottom review action only after validation passes.
- Review rows stacked.

Mobile rules:

- No horizontal scrolling.
- Every amount input has corridor name in label.
- Current value and proposed value stay visible.

## Components

### `AdminPricingRuleEditPage`

Responsibilities:

- Verify capability.
- Fetch current active pricing rule.
- Build fixed corridor form.
- Manage dirty state.
- Validate all fields.
- Build review payload.
- Manage confirmation dialog.
- Submit update with idempotency key.
- Render saved backend result.
- Protect navigation with unsaved changes.

Test id:

```text
screen-admin-pricing-rule-edit
```

### `PricingEditHeader`

Content:

- Title: `Edit pricing rules`
- Subtitle: `Update active launch corridor base fees.`
- Back link to `AdminPricingRules`.
- Refresh active rule action.

Rules:

- Refresh warns if dirty.
- Do not include submit in header before review.

### `CurrentPricingRuleBanner`

Content:

- Current pricing rule ID.
- Currency.
- Effective at.
- Updated at.
- Updated by.
- Default fallback indicator.

Rules:

- Use current active rule as baseline.
- If fallback default is active, show amber notice.
- If active rule reloads while dirty and differs from baseline, show stale active-rule warning.

### `EditableRouteFeeTable`

Purpose:

- Edit all six route base fees.

Columns:

- Origin.
- Destination.
- Current fee.
- New fee.
- Change.
- Validation.

Rules:

- Use semantic table where accessible.
- Each input has visible label or aria label containing origin and destination.
- Current fee is read-only.
- New fee is editable.
- Change column shows `No change`, `Increase`, or `Decrease`.
- Validation column shows field error if any.

### `EditableRouteFeeCardList`

Purpose:

- Mobile fee editor.

Rules:

- One card per required corridor.
- Card title is corridor direction.
- Current fee and new fee are both visible.
- Error appears below amount field.

### `EffectiveAndNotePanel`

Fields:

- Effective datetime.
- Finance note.

Rules:

- Blank effective time means immediate backend timestamp.
- Note explains approval or reason.
- Note privacy hint is visible.

### `PricingChangeSummary`

Metrics:

- Changed corridor count.
- Increased corridors.
- Decreased corridors.
- Highest new fee.
- Lowest new fee.
- Effective timing.

Rules:

- Derived locally.
- Do not show total revenue projections.
- Do not claim customer impact beyond route fees.

### `PricingReviewStep`

Purpose:

- Confirm complete payload before final confirmation.

Content:

- Current pricing rule ID.
- New route fee rows.
- Changed corridors.
- Effective time.
- Note presence and note text.
- Quote-locking reminder.
- Backend operation name.

Actions:

- `Change route fees`.
- `Change effective time`.
- `Change note`.
- `Continue to confirmation`.
- `Cancel`.

Rules:

- Open only after validation passes.
- Focus moves to review heading.
- Review shows all six route fees, not only changed rows.
- User can return to edit without losing values.

### `PricingConfirmationDialog`

Purpose:

- Final high-impact confirmation.

Title:

```text
Confirm pricing rule update
```

Body:

```text
This saves a new active route base-fee table. Existing delivery quotes keep their stored amounts.
```

Actions:

- `Save active pricing rule`
- `Go back to review`

Rules:

- Dialog opens from review only.
- Trap focus.
- Submit disabled while in flight.
- Do not include full form inside dialog.

### `PricingSavedPanel`

Purpose:

- Show backend-saved active rule.

Content:

- New pricing rule ID.
- Currency.
- Effective at.
- Updated at.
- Updated by.
- Route fee table.
- Note.

Actions:

- `Back to pricing rules`.
- `Open finance summary`.
- `Open audit events`.

Rules:

- Use backend response as final truth.
- Clear dirty state.
- Do not auto-navigate.

## Client Validation Rules

Route table:

- Exactly six corridors.
- All required route keys present.
- No duplicate route keys.
- No origin equals destination.
- Every fee is integer.
- Every fee is positive.
- Every fee is `<= 10000`.

Effective time:

- Optional.
- If present, valid datetime.
- UI should reject past datetime for v1.

Note:

- Optional.
- If present, trimmed length `3..240`.
- Blank becomes omitted.

Review:

- At least one fee, effective time, or note differs from baseline before review.
- If only note changes, allow submit because backend creates a new active rule with note.
- If no changes, disable review with explanation.

Client validation must not:

- Add corridors.
- Remove corridors.
- Submit non-route surcharges.
- Submit decimal GHS amounts.
- Submit partial table.
- Submit without review.

## Stale Active Rule Handling

Cause:

- User loaded baseline.
- Another active rule is saved before this user submits.
- Refresh detects current active rule differs from baseline.

Rules:

- Show `stale_active_rule`.
- Do not silently overwrite the newer active rule.
- Offer `Reload latest active rule`.
- Offer `Continue from old baseline` only if product explicitly permits; v1 should not permit this.

V1 decision:

- Block submit after stale active rule detection until the admin reloads and reapplies intended changes.

## Submission Flow

Before review:

1. Validate all route fees.
2. Validate effective time.
3. Validate note.
4. Detect changes.
5. Build complete payload.
6. Open review.

Before submit:

1. User checks review.
2. User opens confirmation dialog.
3. Generate idempotency key for exact payload.

On submit:

1. Disable final submit.
2. Send `POST /v1/admin/pricing-rules/active`.
3. Include `Idempotency-Key`.
4. Parse backend response.
5. Invalidate `AdminPricingRules`.
6. Invalidate finance summary data.
7. Render saved result.

On retry:

- Reuse idempotency key if payload is unchanged after transient failure.
- Generate new key if payload changes.
- Do not retry automatically after validation or authorization error.

## Error States

### Not Authorized

Cause:

- User lacks `manage_pricing_rules`.

Copy:

```text
You do not have permission to edit pricing rules.
```

Rules:

- Do not show active pricing data.
- Do not render form.

### Client Invalid

Rules:

- Show error summary.
- Link summary errors to fields.
- Keep edits.
- Do not open review.

### Server Validation Error

Rules:

- Map duplicate, missing corridor, same-station, amount, note, and datetime errors where possible.
- Preserve payload.
- Close confirmation dialog.
- Return to form or review with errors.

### API Error

Rules:

- Show request-safe message.
- Preserve payload.
- Offer retry if transient.
- Reuse idempotency key only if payload unchanged.

### Session Expired

Rules:

- Stop submit.
- Preserve edit state in memory only.
- Route to sign-in.
- Do not persist pricing payload to local storage.

## Copy System

Tone:

- Precise.
- Finance-controlled.
- Serious.
- Plain.

Preferred labels:

- `Current fee`
- `New fee`
- `Effective time`
- `Finance note`
- `Review pricing update`
- `Confirm pricing rule update`
- `Save active pricing rule`
- `Existing quotes are not changed`

Warnings:

```text
All six one-way launch corridors must be submitted.
```

```text
Existing delivery quotes keep the amount stored at booking time.
```

```text
This update creates a new active pricing rule.
```

Avoid:

- `Quick save`
- `Draft price`
- `Try this`
- `Discount`
- `Deal`
- `Surge`
- `Dynamic pricing`
- `Change customer payments`

## Analytics

Events:

- `admin_pricing_rule_edit_viewed`
- `admin_pricing_rule_edit_dirty`
- `admin_pricing_rule_edit_review_opened`
- `admin_pricing_rule_edit_confirmation_opened`
- `admin_pricing_rule_edit_submitted`
- `admin_pricing_rule_edit_saved`
- `admin_pricing_rule_edit_server_validation_error`
- `admin_pricing_rule_edit_stale_active_rule`
- `admin_pricing_rule_edit_unauthorized`
- `admin_pricing_rule_edit_api_error`

Allowed properties:

- `changed_corridor_count_bucket`
- `increased_corridor_count_bucket`
- `decreased_corridor_count_bucket`
- `has_effective_at`
- `has_note`
- `baseline_is_default`
- `result_status`

Forbidden properties:

- Pricing rule ID.
- Updated by user ID.
- Station IDs.
- Exact fee values.
- Note text.
- Idempotency key.
- Raw error payload.
- Auth tokens.

Count buckets:

- `0`
- `1-2`
- `3-5`
- `6`

## Accessibility

Landmarks:

- One `main`.
- One `h1`.
- Form has accessible name.
- Review has accessible section name.

Forms:

- Every amount input has visible label or equivalent table header association.
- Error summary links to fields.
- Note includes privacy hint.
- Effective time includes expected format.

Table:

- If using table, inputs remain label-associated.
- Table caption explains corridor base-fee editing.
- Current and new fee are not color-only.

Review:

- Focus moves to review heading.
- Review rows show labels and values.
- Change actions return focus to relevant field.

Dialog:

- Confirmation dialog has labelled heading.
- Description explains impact.
- Focus is trapped.
- Cancel returns to review action.

Status messages:

- Loading, dirty, submitting, saved, validation, and stale states are announced.

Keyboard:

- Inputs follow corridor order.
- Review and confirmation actions are reachable.
- No row-click-only controls.

## Privacy And Security

Security:

- Requires `manage_pricing_rules`.
- Do not render pricing data before authorization.
- Do not persist edit payload outside memory.
- Include idempotency key.
- Do not submit unsupported fields.
- Do not hide stale active-rule conflicts.

Privacy:

- Finance note must not contain personal data.
- Analytics must not include exact fees, notes, station IDs, rule IDs, or updater IDs.

Audit posture:

- Backend creates audit events for privileged mutation.
- UI should route to audit events after save when supported.
- UI analytics do not replace backend audit events.

## Performance

Targets:

- Current pricing loads within `1500ms` on normal admin network.
- Fee input latency below `50ms`.
- Review opens within `100ms`.

Rules:

- Fetch active pricing once on entry.
- Refresh only on user action or stale check.
- Do not fetch finance records.
- Do not fetch delivery quote data.
- Do not poll.

## Responsive Behavior

Desktop:

- Editable table plus review rail.

Tablet:

- Editable table or cards depending readability.

Mobile:

- Corridor cards with one amount input each.
- Sticky review action only after form has valid changes.

Mobile rules:

- No horizontal scrolling.
- Current and new fee visible per corridor.
- Error appears beside the relevant amount input.

## Testing Requirements

Unit tests:

- Baseline form builder.
- Complete route table builder.
- Route fee validator.
- Effective time validator.
- Note validator.
- Changed corridor derivation.
- Payload builder.
- Review row builder.
- Stale active-rule detector.
- Idempotency key reuse rules.
- Analytics sanitizer.

Integration tests:

- Loads `admin_pricing_rules`.
- Requires `manage_pricing_rules`.
- Renders all six corridor inputs.
- Rejects missing or invalid fee.
- Rejects decimal fee.
- Rejects past effective time in v1.
- Rejects too-short note.
- Opens review with complete payload.
- Opens confirmation dialog.
- Submits `admin_update_pricing_rules`.
- Sends `Idempotency-Key`.
- Does not submit unsupported fields.
- Shows saved backend response.
- Handles server validation error.
- Handles stale active rule.
- Handles unauthorized state.

Accessibility tests:

- Page has one `h1`.
- Amount inputs are labelled by corridor.
- Error summary links to inputs.
- Review focus moves correctly.
- Confirmation dialog traps focus.
- Saved result is announced.
- Mobile cards repeat labels.

Visual regression states:

- Ready active rule.
- Dirty one corridor.
- Dirty all corridors.
- Future effective time.
- Client invalid.
- Review step.
- Confirmation dialog.
- Submitting.
- Saved result.
- Stale active rule.
- Unauthorized.
- API error.
- Mobile cards.

## Implementation Checklist

- Create route `/admin/pricing-rules/edit`.
- Use protected admin shell.
- Gate route with `manage_pricing_rules`.
- Fetch `admin_pricing_rules`.
- Build fixed six-corridor edit form.
- Build effective time and note fields.
- Build validation and error summary.
- Build change summary.
- Build review step.
- Build confirmation dialog.
- Submit `admin_update_pricing_rules` with idempotency key.
- Invalidate pricing and finance caches after success.
- Render saved result.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Inline edits in `AdminPricingRules`.
- Partial route-fee submit.
- Add corridor.
- Remove corridor.
- Edit station IDs.
- Edit non-route surcharges.
- Edit currency.
- Edit tax rules.
- Edit payment provider fees.
- Historical price browser.
- Quote calculator.
- Refund calculator.
- Export flow.
- Analytics containing exact fee values, station IDs, rule IDs, note text, or idempotency key.

## Acceptance Criteria

The screen is complete when:

- `/admin/pricing-rules/edit` renders with test id `screen-admin-pricing-rule-edit`.
- It requires `manage_pricing_rules`.
- It loads the current active pricing rule.
- It renders exactly six required one-way corridor fee controls.
- It validates every route fee as positive integer GHS amount.
- It supports optional future effective time and optional note.
- It blocks partial or duplicate corridor payloads.
- It requires review and confirmation.
- It submits `admin_update_pricing_rules` with `Idempotency-Key`.
- It renders backend saved response as final truth.
- It blocks stale active-rule overwrite in v1.
- It does not edit non-route surcharges.
- It protects fees, notes, station IDs, and rule IDs from analytics.
- It handles loading, ready, dirty, invalid, review, confirm, submitting, saved, stale, unauthorized, session expired, server validation, and API error states.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminPricingRuleEdit` as the finance-controlled pricing mutation flow for `/admin/pricing-rules/edit`. Load `admin_pricing_rules`, render fixed inputs for all six one-way launch corridor base fees, validate integer GHS amounts, support optional future `effectiveAt` and optional note, require review plus confirmation, block stale active-rule overwrite, submit `admin_update_pricing_rules` with an idempotency key, render the backend saved rule, and never edit non-route surcharges or leak exact fees and notes to analytics.

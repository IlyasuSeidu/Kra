# Admin Pricing Rules Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminPricingRules` |
| Route | `/admin/pricing-rules` |
| Test id | `screen-admin-pricing-rules` |
| Surface | Admin web console |
| Backend coverage | `admin_pricing_rules`; route edits to `admin_update_pricing_rules` owner screen |
| Offline critical | No |
| Required read role | `finance_admin` or `super_admin` through `manage_pricing_rules` capability |
| Required mutation role | No direct mutation on this screen; edit flow requires `manage_pricing_rules` |
| Required states | `loading`, `ready`, `default_rule`, `invalid`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | Protected admin shell |
| Related screens | `AdminPricingRuleEdit`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminAuditEvents`, `PublicPricingExplainer`, `SenderQuoteReview`, `AdminLaunchReadiness` |

## Purpose
`AdminPricingRules` is the read-only finance and operations view of the active pricing configuration. It lets authorized admins inspect the active route base-fee table, see the currency, rule identity, effective timestamp, update timestamp, updater, note, and route completeness before routing to the dedicated edit flow.

The screen should answer:
- `Which pricing rule is active?`
- `Is the active rule a persisted finance-approved rule or the system fallback?`
- `Which launch corridors are priced?`
- `Are all one-way launch corridors present exactly once?`
- `What is the base fee for each corridor?`
- `When did this rule become effective?`
- `Who last updated it?`
- `What note was attached to the rule?`
- `Which pricing inputs are handled outside the route base-fee table?`
- `Where should an authorized finance admin go to update pricing?`

This screen is a source-of-truth inspection surface. It must not let an admin edit values inline or imply that route prices change existing delivery quotes.

## Backend Reality
The active pricing read endpoint is concrete:
```http
GET /v1/admin/pricing-rules
```

Operation:
```text
admin_pricing_rules
```

Capability:
```text
manage_pricing_rules
```

Successful response:
```json
{
  "pricingRuleId": "PRC-0001",
  "status": "active",
  "currency": "GHS",
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 35
    }
  ],
  "effectiveAt": "2026-05-16T12:20:00.000Z",
  "updatedAt": "2026-05-16T12:20:00.000Z",
  "updatedByUserId": "USR-FIN-001",
  "note": "Launch corridor finance approval."
}
```

Important backend facts:
- The endpoint requires `manage_pricing_rules`.
- `finance_admin` and `super_admin` currently have `manage_pricing_rules`.
- The endpoint returns the active pricing rule.
- If no persisted active rule exists, backend returns the approved default launch table.
- The default fallback rule has `pricingRuleId = PRC-DEFAULT`.
- The default fallback rule has `updatedByUserId = USR-SYSTEM`.
- The response currency is always `GHS`.
- The response status is always `active`.
- The route base-fee table must contain every one-way launch corridor exactly once.
- There are three launch stations: `ST-ACC-01`, `ST-KMS-01`, and `ST-TML-01`.
- There are six one-way launch corridors.
- The edit endpoint is separate: `POST /v1/admin/pricing-rules/active`.
- Mutating pricing belongs in `AdminPricingRuleEdit`.

Therefore:
- This screen must fetch only `admin_pricing_rules`.
- This screen must not submit pricing changes.
- This screen must not build inline fee inputs.
- This screen must not invent route corridors.
- This screen must validate response completeness for display integrity.
- This screen must show a visible fallback notice when `PRC-DEFAULT` is active.
- This screen must route edits to `/admin/pricing-rules/edit`.

## Primary Users
Primary:
- `finance_admin` reviewing the active pricing table.
- `super_admin` reviewing or preparing to update pricing.

Secondary:
- Product owner verifying launch corridor pricing.
- Operations owner validating station-to-station route availability.
- QA validating pricing contract and display.
- Security reviewer validating read-only and mutation separation.
- Claude Code implementing the admin console later.

Non-users:
- `ops_admin` without pricing capability.
- `support_admin`.
- `station_operator`.
- `driver`.
- `final_mile_courier`.
- `sender`.
- Public visitor.

These roles must not access this screen unless backend capabilities change later.

## User Goal
Authorized admins use this screen to:
- Review the active pricing rule.
- Confirm route coverage.
- Confirm GHS base fees.
- Confirm whether the rule is persisted or fallback.
- Confirm effective and updated timestamps.
- Confirm who updated the rule.
- Read the finance note.
- Understand which surcharges are outside this endpoint.
- Route to pricing edit when a change is required.
- Route to audit events for pricing updates when supported.

The screen should make pricing configuration transparent without making changes easy to do accidentally.

## Entry Points
The screen can open from:
- Admin shell navigation.
- `AdminFinanceSummary` pricing shortcut.
- `AdminOverview` finance shortcut.
- `AdminLaunchReadiness` pricing readiness link.
- `PublicPricingExplainer` internal review link.
- `AdminAuditEvents` pricing action context.
- Direct route `/admin/pricing-rules`.

The screen must not open from:
- Public web navigation.
- Sender app.
- Receiver tracking.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Support-only admin navigation.

## Scope
In scope:
- Active pricing rule loading.
- Active rule identity display.
- Currency display.
- Status display.
- Effective timestamp display.
- Updated timestamp display.
- Updated-by display.
- Optional note display.
- Route base-fee table.
- Route completeness integrity check.
- Duplicate corridor integrity check.
- Self-corridor integrity check.
- Default fallback notice.
- Static surcharge policy summary from shared pricing rules.
- Route to edit screen.
- Route to audit events when supported.
- Loading, invalid, unauthorized, stale, refresh, and API error states.
- Accessibility, analytics, and responsive behavior.

Out of scope:
- Inline route fee editing.
- Pricing mutation submit.
- Effective date editing.
- Note editing.
- Historical pricing list.
- Pricing diff against prior rule.
- Quote creation.
- Sender-facing price calculator.
- Refund calculation.
- Tax configuration.
- Payment provider fees.
- Currency conversion.
- Public pricing content management.
- Export from this screen.

## Design Thesis
The screen should feel like a finance control board: precise, quiet, and difficult to misread. It should make the active table obvious, flag fallback or invalid data, and keep editing behind a separate intentional route.

Visual direction:
- Use a white admin workspace with a clear finance header.
- Use a top summary strip for rule ID, status, currency, effective date, updated date, and updater.
- Use a six-row corridor table with origin, destination, station names, and base fee.
- Use GHS formatting consistently.
- Use amber for fallback and stale states.
- Use red for invalid route-table integrity.
- Use monospaced station IDs and rule IDs.
- Use a read-only notice near the edit action.

Restraint rule:
- No inline inputs, drag-to-edit table cells, animated price counters, charts, or public marketing copy on this admin screen.

## Research Inputs
External research used for this screen:
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible structured data for route-fee comparison.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports clear read-only filter and control labeling for admin surfaces.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-oriented summaries and clear finality before any separate change flow.
- [GOV.UK search pattern](https://design-system.service.gov.uk/patterns/search/): supports explicit scope copy when any table search is added later.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, refresh, invalid, and saved-state announcements.

How the research affects the screen:
- Table guidance shapes the route base-fee grid and mobile alternatives.
- Form guidance shapes capability-safe action controls and labels.
- Check-answer guidance shapes rule summary rows and edit routing.
- Search guidance prevents unclear global search claims.
- WCAG guidance shapes refresh, invalid data, and fallback announcements.

## Backend Data Contract
### Active Pricing Rules
Request:
```http
GET /v1/admin/pricing-rules
```

Operation:
```text
admin_pricing_rules
```

Capability:
```text
manage_pricing_rules
```

Fields used:
- `pricingRuleId`
- `status`
- `currency`
- `routeBaseFees[].originStationId`
- `routeBaseFees[].destinationStationId`
- `routeBaseFees[].baseFeeGhs`
- `effectiveAt`
- `updatedAt`
- `updatedByUserId`
- `note`

Response validation:
- `pricingRuleId` matches pricing rule ID schema.
- `status` is `active`.
- `currency` is `GHS`.
- `routeBaseFees` length is `6`.
- Each fee has valid origin and destination station IDs.
- Origin and destination are different.
- Every one-way launch corridor exists once.
- `baseFeeGhs` is positive integer and max `10000`.
- `effectiveAt` is datetime.
- `updatedAt` is datetime.
- `updatedByUserId` matches user ID schema.
- `note` is optional and `3..240` characters if present.

### Related Edit Flow
Route:
```text
/admin/pricing-rules/edit
```

Operation:
```text
admin_update_pricing_rules
```

Rules:
- This view screen can link to edit.
- This view screen must not call the update endpoint.
- Edit flow owns validation, review, idempotency, and submit.

## Launch Corridor Model
Launch stations:
- `ST-ACC-01`: Accra Central.
- `ST-KMS-01`: Kumasi Adum.
- `ST-TML-01`: Tamale Central.

Required one-way corridors:
- `ST-ACC-01 -> ST-KMS-01`
- `ST-KMS-01 -> ST-ACC-01`
- `ST-ACC-01 -> ST-TML-01`
- `ST-TML-01 -> ST-ACC-01`
- `ST-KMS-01 -> ST-TML-01`
- `ST-TML-01 -> ST-KMS-01`

Default launch base fees:
- `ST-ACC-01 -> ST-KMS-01`: `GHS 35`
- `ST-KMS-01 -> ST-ACC-01`: `GHS 35`
- `ST-ACC-01 -> ST-TML-01`: `GHS 65`
- `ST-TML-01 -> ST-ACC-01`: `GHS 65`
- `ST-KMS-01 -> ST-TML-01`: `GHS 50`
- `ST-TML-01 -> ST-KMS-01`: `GHS 50`

Display rules:
- Show city/station names with IDs.
- Show one-way direction clearly.
- Do not merge opposite directions.
- Sort corridors in backend order or stable launch order.
- Show `GHS` before the amount or in a dedicated currency column.

## Non-Route Pricing Policy Summary
This endpoint only returns route base fees. The screen should include a read-only policy summary for other price components so finance admins understand what is not editable here.

Weight surcharge policy:
- `0kg to 2kg`: included.
- `>2kg to 5kg`: `+GHS 8`.
- `>5kg to 10kg`: `+GHS 18`.
- `>10kg to 20kg`: `+GHS 35`.
- `>20kg`: manual quote only in v1.

Size surcharge policy:
- `standard`: included.
- `bulky`: `+GHS 15`.
- `oversized`: manual quote only in v1.

Service surcharge policy:
- `express`: `40%` of route base fee, minimum `GHS 15`.
- `doorstep within 5km`: `+GHS 15`.
- `doorstep above 5km and up to 10km`: `+GHS 25`.
- `doorstep above 10km`: not available in v1.

Special handling:
- Fragile: `+GHS 10`.
- Declared value above `GHS 2,000`: `+GHS 20` and manual operator approval.
- Declared value above `GHS 5,000`: not self-serve in v1.

Rules:
- Label this section `Not edited on this screen`.
- Do not present these values as returned by `admin_pricing_rules`.
- Do not add edit controls for these values.
- Link to product pricing policy docs if available.

## Information Architecture
Desktop order:
1. Admin shell and breadcrumb.
2. Page header.
3. Rule identity summary.
4. Fallback or invalid notices.
5. Route base-fee table.
6. Non-route pricing policy summary.
7. Change and audit actions.
8. Pricing integrity notice.

Mobile order:
1. Header.
2. Rule identity summary.
3. Fallback or invalid notice.
4. Corridor cards.
5. Policy summary.
6. Actions.
7. Integrity notice.

## Layout
### Desktop
Viewport:
- `min-width: 1024px`

Layout:
- Protected admin shell.
- Main width max `1200px`.
- Summary strip across top.
- Route table full width.
- Policy summary in compact cards below table.
- Actions in right-aligned header group.

Table columns:
- Origin.
- Destination.
- Direction.
- Base fee.
- Default comparison.
- Integrity.

### Tablet
Viewport:
- `768px` to `1023px`

Layout:
- Summary strip wraps.
- Table remains visible if width supports it.
- Default comparison can move into row expansion.

### Mobile
Viewport:
- `<768px`

Layout:
- Corridor rows become cards.
- Each card repeats origin, destination, direction, and base fee labels.
- Policy summary stacks.
- Edit action appears after the active rule summary and again after route table if needed.

Mobile rules:
- No horizontal scrolling.
- Do not hide base fee.
- Do not rely on arrows alone for direction.

## Components
### `AdminPricingRulesPage`
Responsibilities:
- Verify capability-gated access.
- Fetch `admin_pricing_rules`.
- Parse response.
- Derive fallback state.
- Derive route table integrity.
- Render summary, table, policy summary, actions, and notices.
- Render invalid response state without crashing.
- Route to edit and audit screens.

Test id:
```text
screen-admin-pricing-rules
```

### `PricingRulesHeader`
Content:
- Title: `Pricing rules`
- Subtitle: `Review the active launch corridor base-fee table.`
- Refresh action.
- Primary route action to `AdminPricingRuleEdit`.
- Secondary action to audit events when supported.

Rules:
- Show edit action only to users with `manage_pricing_rules`.
- Since the route is capability-gated, missing edit action should only occur if frontend policy changes.
- Do not put route fee inputs in the header.

### `PricingRuleSummary`
Fields:
- Pricing rule ID.
- Status.
- Currency.
- Effective at.
- Updated at.
- Updated by user ID.
- Note.

Rules:
- Use summary-list layout.
- Use machine-readable datetime.
- Show missing optional note as `No note recorded`.
- Use monospaced IDs.

### `DefaultPricingNotice`
Condition:
- `pricingRuleId === "PRC-DEFAULT"` or `updatedByUserId === "USR-SYSTEM"`.

Copy:
```text
The system default launch table is active.
```

Supporting copy:
```text
Persisted finance-approved pricing has not replaced the default active rule yet.
```

Rules:
- Use amber notice.
- Do not treat default fallback as broken.
- Route to edit screen for authorized finance update.

### `PricingIntegrityNotice`
Conditions:
- Missing required corridor.
- Duplicate corridor.
- Origin equals destination.
- Invalid station ID.
- Base fee outside schema range.
- Currency is not `GHS`.
- Status is not `active`.

Copy:
```text
The returned pricing rule does not match the launch pricing contract.
```

Rules:
- Use red notice.
- Keep raw response hidden.
- Show integrity issue list.
- Disable edit shortcut only if product requires investigation first; otherwise route to edit with warning.
- Offer refresh.

### `RouteBaseFeeTable`
Purpose:
- Display active one-way launch route fees.

Rows:
- One row per corridor.

Columns:
- Origin station.
- Destination station.
- Direction.
- Base fee.
- Default fee comparison.
- Integrity.

Rules:
- Use semantic table.
- Include caption.
- Show all six corridors.
- Use stable corridor order.
- Format values as `GHS 35`.
- If fee differs from default, show `Changed from default`.
- If fee matches default, show `Matches default`.
- Do not let values become inputs.

### `RouteBaseFeeCardList`
Purpose:
- Mobile representation of corridor fees.

Rules:
- Repeat all labels.
- Include station names and IDs.
- Include base fee in large readable text.
- Include default comparison.
- Keep direction text explicit.

### `NonRoutePricingPolicySummary`
Purpose:
- Show pricing components not returned by the active route-fee endpoint.

Sections:
- Weight.
- Size.
- Express.
- Doorstep.
- Fragile and declared value.
- Refund and cancellation price handling link.

Rules:
- Label as policy summary.
- Do not show edit controls.
- Do not call this backend-returned active rule data.
- Keep copy short and link to docs for detail.

### `PricingRuleActions`
Actions:
- `Edit pricing rules`.
- `Open pricing audit events`.
- `Open public pricing explainer`.
- `Open finance summary`.

Rules:
- Primary action routes to `/admin/pricing-rules/edit`.
- Audit events link should use action filter only if supported later; current backend has no action filter, so route to audit events without unsupported query or with future-safe local search state only.
- Public pricing explainer opens read-only public docs route if implemented.
- Finance summary opens `/admin/finance`.

## Client Validation And Derived Integrity
Client integrity checks:
- Expected corridor count is `6`.
- Required route keys are present.
- Route keys are unique.
- Origin and destination differ.
- Station IDs are known launch station IDs.
- Base fee is positive integer.
- Base fee is `<= 10000`.
- Currency is `GHS`.
- Status is `active`.

Integrity derivations:
- `complete`: All checks pass.
- `fallback`: Complete table from system default.
- `invalid`: One or more checks fail.

Rules:
- Integrity checks protect display and QA.
- Backend remains source of truth.
- Do not mutate data client-side to hide backend defects.

## Empty And State Handling
### Loading
Show:
- Header skeleton.
- Summary skeleton.
- Route table skeleton.
- Policy summary skeleton.

Do not show:
- Assumed active rule ID.
- Assumed updated user.

### Ready
Rules:
- Show summary.
- Show route table.
- Show policy summary.
- Show route action to edit.

### Default Rule
Rules:
- Show all ready content.
- Add default pricing notice.
- Do not call it invalid.

### Invalid
Rules:
- Show integrity notice.
- Show returned safe fields where possible.
- Show issue list.
- Offer refresh.
- Route to edit with caution if user can manage pricing.

### Not Authorized
Cause:
- User lacks `manage_pricing_rules`.

Copy:
```text
You do not have permission to view pricing rules.
```

Rules:
- Do not show pricing table.
- Offer admin home route if allowed.

### API Error
Rules:
- Show request-safe error.
- Preserve shell.
- Offer refresh.
- Do not show default values as if they were loaded.

## Copy System
Tone:
- Precise.
- Finance-aware.
- Calm.
- Operational.

Preferred labels:
- `Active pricing rule`
- `Route base fees`
- `Currency`
- `Effective at`
- `Updated by`
- `Matches default`
- `Changed from default`
- `System default active`
- `Not edited on this screen`
- `Edit pricing rules`

Fallback copy:
```text
The system default launch table is active.
```

Read-only copy:
```text
This page is read-only. Use the edit flow to change active corridor fees.
```

Quote-locking copy:
```text
Existing delivery quotes keep the amount stored at booking time.
```

Avoid:
- `Cheap`
- `Expensive`
- `Discount`
- `Deal`
- `Surge`
- `Dynamic pricing`
- `Change price here`
- Public marketing promises.

## Analytics
Events:
- `admin_pricing_rules_viewed`
- `admin_pricing_rules_refreshed`
- `admin_pricing_rules_default_active`
- `admin_pricing_rules_invalid`
- `admin_pricing_rules_edit_opened`
- `admin_pricing_rules_audit_opened`
- `admin_pricing_rules_finance_opened`
- `admin_pricing_rules_unauthorized`
- `admin_pricing_rules_api_error`

Allowed properties:
- `pricing_rule_status`
- `is_default_rule`
- `route_fee_count`
- `integrity_status`
- `changed_from_default_count_bucket`
- `currency`
- `has_note`
- `result_status`

Forbidden properties:
- Pricing rule ID.
- Updated by user ID.
- Station IDs.
- Raw note text.
- Raw error payload.
- Auth tokens.

Count buckets:
- `0`
- `1-2`
- `3-5`
- `6`

## Accessibility
Landmarks:
- One `main` region.
- One `h1`.
- Rule summary has accessible section name.
- Route table has caption.

Table:
- Use semantic table.
- Header cells identify origin, destination, base fee, default comparison, and integrity.
- Currency is text, not icon-only.
- Station IDs have visible labels.

Status messages:
- Loading, refreshing, fallback, and invalid states use live regions.
- API error and unauthorized states use assertive region.

Keyboard:
- Refresh, edit, audit, and finance actions are reachable in order.
- Table links do not depend on row click.
- Mobile cards expose actions as buttons or links.

Color:
- Fallback amber includes text.
- Invalid red includes text.
- Default comparison includes text.

## Privacy And Security
Security:
- Requires `manage_pricing_rules`.
- Do not render pricing data before authorization.
- Do not mutate pricing on this screen.
- Do not send unsupported query params.
- Do not expose raw backend errors.

Privacy:
- Pricing table is business-sensitive internal config.
- Do not send pricing rule ID or updater user ID to analytics.
- Do not expose internal finance note outside admin.

Audit posture:
- Pricing mutations are audit-sensitive.
- This screen may route to audit events but must not invent audit data.
- Existing delivery quotes remain locked and must not be retroactively changed by display copy.

## Performance
Targets:
- Active pricing table visible within `1500ms` on normal admin network.
- Refresh response announced within `100ms` after data changes.

Rules:
- Fetch only `admin_pricing_rules`.
- Do not fetch delivery quote data.
- Do not fetch payment records.
- Do not fetch audit events by default.
- Do not poll.

## Responsive Behavior
Desktop:
- Summary strip and full corridor table.

Tablet:
- Wrapped summary and readable table.

Mobile:
- Summary cards and corridor cards.

Mobile rules:
- No horizontal scrolling.
- Keep base fee visible.
- Repeat origin and destination labels.
- Keep read-only notice visible before edit action.

## Testing Requirements
Unit tests:
- Active pricing response parser.
- Fallback detection.
- Required route key derivation.
- Missing corridor detection.
- Duplicate corridor detection.
- Self-corridor detection.
- Default comparison derivation.
- GHS formatter.
- Changed-from-default count bucket.
- Analytics sanitizer.

Integration tests:
- Loads `admin_pricing_rules`.
- Requires `manage_pricing_rules`.
- Renders active rule summary.
- Renders all six corridors.
- Shows default rule notice.
- Shows invalid route-table notice.
- Routes to `AdminPricingRuleEdit`.
- Does not call update endpoint.
- Does not render inline inputs.
- Refreshes active rule.
- Handles unauthorized state.
- Handles API error state.

Accessibility tests:
- Page has one `h1`.
- Route table has caption.
- Table headers are correct.
- Mobile cards repeat labels.
- Fallback notice is text-readable.
- Invalid notice is announced.
- Edit action has clear accessible name.

Visual regression states:
- Active persisted pricing rule.
- Default active pricing rule.
- Changed route fees.
- Invalid missing corridor.
- Invalid duplicate corridor.
- Unauthorized.
- API error.
- Mobile corridor cards.

## Implementation Checklist
- Create route `/admin/pricing-rules`.
- Use protected admin shell.
- Gate route with `manage_pricing_rules`.
- Fetch `admin_pricing_rules`.
- Build rule summary.
- Build fallback notice.
- Build integrity checks.
- Build route base-fee table.
- Build mobile corridor cards.
- Build non-route policy summary.
- Build route actions.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build
Do not build:
- Inline fee editing.
- Pricing update submit.
- Effective date input.
- Note input.
- Historical pricing browser.
- Quote calculator.
- Refund calculator.
- Currency conversion.
- Public pricing content editor.
- Raw audit event list.
- Unsupported action filter to audit endpoint.
- Analytics containing rule ID, updater ID, station IDs, note text, or raw errors.

## Acceptance Criteria
The screen is complete when:
- `/admin/pricing-rules` renders with test id `screen-admin-pricing-rules`.
- It requires `manage_pricing_rules`.
- It fetches `admin_pricing_rules`.
- It renders rule ID, status, currency, effective time, updated time, updated-by user ID, and note.
- It renders every one-way launch corridor with base fee in GHS.
- It detects fallback default active rule.
- It detects invalid route table states.
- It explains non-route surcharge policy as read-only context.
- It routes pricing changes to `AdminPricingRuleEdit`.
- It does not submit pricing changes.
- It protects internal IDs and notes from analytics.
- It handles loading, ready, default rule, invalid, unauthorized, stale, refresh, and API error states.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief
Build `AdminPricingRules` as a read-only finance control screen for `/admin/pricing-rules`. Use `admin_pricing_rules`, require `manage_pricing_rules`, show the active GHS route base-fee table for all six one-way launch corridors, make `PRC-DEFAULT` fallback visible, detect invalid route-table integrity, explain non-route surcharges as read-only policy context, route edits to `/admin/pricing-rules/edit`, and never mutate pricing or send internal IDs and notes to analytics.

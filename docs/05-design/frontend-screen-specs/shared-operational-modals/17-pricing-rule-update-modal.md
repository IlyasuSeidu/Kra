# Pricing Rule Update Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `PricingRuleUpdateModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screen | `AdminPricingRuleEdit` |
| Secondary host screens | `AdminPricingRules`, `AdminFinanceSummary`, `AdminLaunchReadiness` only as launch points into edit/review flow |
| Test id root | `modal-pricing-rule-update` |
| Backend coverage | `admin_pricing_rules`, `admin_update_pricing_rules` |
| Read operation | `admin_pricing_rules` |
| Mutation operation | `admin_update_pricing_rules` |
| Read endpoint | `GET /v1/admin/pricing-rules` |
| Mutation endpoint | `POST /v1/admin/pricing-rules/active` |
| Required capability | `manage_pricing_rules` |
| Allowed roles | `finance_admin`, `super_admin` |
| Offline critical | No |
| Data sensitivity | Financial configuration, route pricing, admin user ID, audit note |
| Required modal states | `closed`, `opening`, `review`, `client_invalid`, `requires_confirmation`, `submitting`, `saved`, `server_validation_error`, `stale_rule`, `not_authorized`, `session_expired`, `api_error` |
| Related specs | `AdminPricingRules`, `AdminPricingRuleEdit`, `ConfirmDestructiveActionModal`, `AdminAuditEvents`, `PublicPricingExplainer`, `QuoteReview` |

## Purpose
`PricingRuleUpdateModal` is the final finance-control checkpoint before Kra replaces the active launch corridor base-fee table. It exists because a pricing rule update affects every new delivery quote after the backend saves the active rule.

The modal must answer:
- `Which active pricing rule is being replaced?`
- `Which corridors are changing?`
- `Are all six one-way launch corridors present exactly once?`
- `Are all proposed base fees valid GHS integer amounts?`
- `Does the admin understand that existing locked delivery quotes will not change?`
- `Does the admin understand that the current backend uses the saved active rule immediately?`
- `What approval or finance note will be stored with the update?`
- `What exact payload will be sent?`
- `Did the backend create and return the new active pricing rule?`

This modal is not a route-fee editor by itself. The host screen owns editing. The modal owns final review, impact explanation, confirmation, submit, and success handling.

## Product Job
Finance admins need a disciplined way to commit route price changes without silently changing production quote behavior. The modal should slow the final step just enough to catch incomplete route tables, wrong-direction corridors, accidental same-station routes, unclear approvals, and misunderstanding about immediate activation.

The modal should feel like a controlled release gate for money:
- The proposed table is complete.
- The diff is visible.
- The consequence is plain.
- The submit action is hard to trigger by accident.
- The saved backend response becomes the visible source of truth.

## Strategic Role
Pricing trust is central to sender adoption. If route prices change unpredictably, senders will not trust checkout and operators will absorb disputes. This modal protects that trust by making price changes visible, intentional, auditable, and aligned with the implemented backend contract.

It must not overpromise future scheduling, approval workflows, tax handling, surcharge editing, or quote recalculation features that are not implemented.

## Primary Users
Primary users:
- `finance_admin` replacing the active corridor base-fee table.
- `super_admin` replacing pricing when finance governance allows.

Secondary users:
- Product owner reviewing the impact of a price change.
- Operations owner confirming corridor coverage.
- QA validating pricing update behavior.
- Security reviewer validating mutation control and capability boundaries.
- Claude Code implementing the frontend later.

Non-users:
- `ops_admin` without `manage_pricing_rules`.
- `support_admin`.
- `station_operator`.
- `driver`.
- `final_mile_courier`.
- `sender`.
- `receiver`.
- Public visitor.

## User Goals
The authorized admin uses the modal to:
- Review current versus proposed base fees.
- Verify every launch corridor is present.
- Confirm the route directions are correct.
- Confirm GHS amounts are valid and intentional.
- Add or verify a meaningful finance note.
- Understand activation impact.
- Submit exactly one pricing update.
- See the new backend-issued `pricingRuleId`.
- Return to the active pricing rules screen with fresh data.

The admin should never need to guess whether a price change is active.

## Non-Goals
Do not build these into the modal:
- Inline editing of base fees.
- Adding arbitrary corridors.
- Removing required launch corridors.
- Editing station catalog data.
- Editing weight surcharges.
- Editing size surcharges.
- Editing express surcharge formula.
- Editing doorstep surcharge bands.
- Editing fragile surcharge.
- Editing declared-value surcharge.
- Currency conversion.
- Tax configuration.
- Payment provider fee settings.
- Historical price-rule list.
- Price-change approval workflow storage beyond `note`.
- Future activation scheduler.
- Quote recalculation for existing deliveries.
- Refund recalculation.
- Public pricing content management.
- Driver or courier payout rules.

## Hard Backend Reality
Implemented endpoints:
```http
GET /v1/admin/pricing-rules
POST /v1/admin/pricing-rules/active
```

Implemented operations:
```text
admin_pricing_rules
admin_update_pricing_rules
```

Capability:
```text
manage_pricing_rules
```

Allowed roles today:
```text
finance_admin
super_admin
```

The update request schema is:
```ts
{
  routeBaseFees: Array<{
    originStationId: StationId;
    destinationStationId: StationId;
    baseFeeGhs: number;
  }>;
  effectiveAt?: string;
  note?: string;
}
```

The backend requires:
- `routeBaseFees` length equals the full launch corridor count.
- Every launch corridor is present exactly once.
- No duplicate route key.
- No same-station route.
- `baseFeeGhs` is a positive integer.
- `baseFeeGhs` is at most `10000`.
- `effectiveAt` is an optional datetime string.
- `note` is optional, trimmed, and must be `3..240` characters when present.

The response schema is:
```ts
{
  pricingRuleId: string;
  status: "active";
  currency: "GHS";
  routeBaseFees: Array<{
    originStationId: StationId;
    destinationStationId: StationId;
    baseFeeGhs: number;
  }>;
  effectiveAt: string;
  updatedAt: string;
  updatedByUserId: string;
  note?: string;
}
```

Critical implementation truth:
- The backend saves the new record as `pricing_rules/active`.
- The quote path reads the active pricing rule and converts it directly into quote config.
- The current quote path does not check `effectiveAt` before using the active rule.
- Therefore, after a successful save, new delivery quotes use the new route table immediately.
- `effectiveAt` is currently stored metadata, not a delayed activation scheduler.

The modal must say this plainly:
```text
This update becomes the active backend pricing rule when saved. New delivery quotes will use it immediately. Existing locked delivery quotes will not change.
```

Do not label future `effectiveAt` as scheduled activation until the backend implements scheduled activation.

## Local Source References
Use these local files as implementation authority:
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/pricing.ts`
- `services/api/src/pricing-rules.ts`
- `services/api/src/deliveries.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/pricing-rules.test.ts`
- `services/api/src/__tests__/app.test.ts`
- `docs/03-business/pricing-rules.md`
- `docs/07-api/api-contracts.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/21-admin-pricing-rules.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/22-admin-pricing-rule-edit.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/01-confirm-destructive-action-modal.md`
- `docs/08-security/authorization-rules.md`

## External Research Inputs
Only directly relevant references should inform this modal:
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports a final review surface for critical submitted information.
- [GOV.UK question pages pattern](https://design-system.service.gov.uk/patterns/question-pages/): supports focused, plain-language confirmation steps before moving forward.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports accessible field labels, hints, grouped controls, and validation.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports structured comparison tables for corridor fee review.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports modal use only when user focus must remain on a high-impact decision.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): defines focus containment, accessible naming, and close behavior expectations.
- [WCAG Error Prevention For Legal, Financial, Data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review, correction, and confirmation before financial data is committed.
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports field-level validation messages that clearly identify what must be corrected.
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports non-disruptive announcements for validation, submit, and saved states.
- [Stripe Prices API](https://docs.stripe.com/api/prices): supports the product decision that high-impact pricing should be versioned as a new active record rather than silently rewriting past payment obligations.

How the research changes the modal:
- The modal must be review-first, not input-first.
- The final confirmation must be explicit because this is financial configuration.
- Validation must be visible before submit.
- Table comparison must remain understandable on desktop and mobile.
- Focus must stay inside the modal while open.
- Success and error state changes must be announced without stealing focus unnecessarily.

## Information Architecture
The modal has five main layers:
1. Header and irreversible-impact summary.
2. Current active rule summary.
3. Proposed route-fee change set.
4. Validation and policy checklist.
5. Confirmation, submit, and saved response.

The modal should not hide the actual route table behind collapses by default. Pricing is money. The admin must see the numbers.

## Launch Corridor Authority
The launch station IDs are:
```text
ST-ACC-01
ST-KMS-01
ST-TML-01
```

The required one-way route keys are:
```text
ST-ACC-01:ST-KMS-01
ST-KMS-01:ST-ACC-01
ST-ACC-01:ST-TML-01
ST-TML-01:ST-ACC-01
ST-KMS-01:ST-TML-01
ST-TML-01:ST-KMS-01
```

Human labels:
```text
Accra Central to Kumasi Adum
Kumasi Adum to Accra Central
Accra Central to Tamale Central
Tamale Central to Accra Central
Kumasi Adum to Tamale Central
Tamale Central to Kumasi Adum
```

The modal may use `stationCatalog` labels from shared pricing domain. It must still submit station IDs, not names.

## Active Rule Summary
Show a compact summary at the top:
- Current rule ID.
- Current status.
- Currency.
- Effective timestamp.
- Updated timestamp.
- Updated by user ID.
- Current note if present.
- Whether current rule is backend fallback `PRC-DEFAULT`.

Copy when `PRC-DEFAULT` is active:
```text
The current active rule is the backend launch fallback. Saving will create the first persisted active pricing rule.
```

Copy for persisted active rule:
```text
Saving will replace this active pricing rule with a new active rule ID.
```

Do not say the old rule is deleted. The repository writes the active record and an immutable rule ID document.

## Proposed Change Summary
The modal receives proposed values from the host screen:
```ts
type ProposedPricingRuleChange = {
  routeBaseFees: Array<{
    originStationId: StationId;
    destinationStationId: StationId;
    baseFeeGhs: number;
  }>;
  effectiveAt?: string;
  note?: string;
};
```

The modal computes:
- Total corridors provided.
- Missing route keys.
- Duplicate route keys.
- Same-station rows.
- Invalid fee values.
- Changed corridors.
- Unchanged corridors.
- Highest absolute increase.
- Highest absolute decrease.
- Percent change per changed corridor for display only.
- Whether note is present and useful.
- Whether `effectiveAt` is in the past, now, or future.

Do not send computed diff fields to the backend.

## Diff Table
Desktop table columns:
- Corridor.
- Route key.
- Current base fee.
- Proposed base fee.
- Delta.
- Delta percent.
- Status.

Status values:
- `unchanged`
- `increase`
- `decrease`
- `new persisted value`
- `invalid`

Formatting:
- Currency displays as `GHS 35`.
- Delta displays as `+GHS 7` or `-GHS 5`.
- Percent displays as `+20.0%` only when current fee is positive.
- Route key uses monospace.
- Increased values use amber accent, not panic red.
- Decreased values use green accent, not promotional styling.
- Invalid values use red with field-level message.

Mobile layout:
- One card per corridor.
- Card title is human route label.
- Route key appears beneath title.
- Current, proposed, and delta appear as a three-row definition list.
- Validation message appears under the proposed fee.
- Cards remain in canonical route order.

Do not use charts. A six-row money table is clearer than a chart.

## Validation Rules
The modal must independently validate before submit, using the same rules as the shared schema.

Client validation:
- Exactly six route rows.
- Each required route key present once.
- No duplicate route key.
- No missing route key.
- No origin equal to destination.
- Origin is one of the launch station IDs.
- Destination is one of the launch station IDs.
- Base fee is a number.
- Base fee is an integer.
- Base fee is greater than `0`.
- Base fee is less than or equal to `10000`.
- `effectiveAt`, if present, parses as valid ISO datetime.
- `note`, if present, trims to `3..240` characters.

Frontend governance validation:
- Require at least one changed corridor unless the host explicitly supports re-saving active metadata.
- Require a finance note for any changed base fee.
- Require note text to mention the approval basis in plain language.
- Require typed confirmation before submit.
- Require the admin to acknowledge immediate activation.
- Require the admin to acknowledge existing locked quotes remain unchanged.

These governance checks are frontend-only unless backend adds fields later. Do not send acknowledgement booleans.

## Note Requirement
Backend makes `note` optional, but the modal should require a note when any fee changes because pricing is financial configuration.

Minimum frontend note guidance:
```text
Add a finance note explaining who approved this change and why it is being applied.
```

Valid note examples are not needed in the UI. Provide hints instead:
```text
Mention the approval source, corridor reason, or launch pricing decision. This note is stored with the active pricing rule.
```

Do not store secret approval links, personal phone numbers, or payment credentials in the note.

Suggested frontend note limits:
- Trim whitespace.
- Block if fewer than `12` meaningful characters for changed fees.
- Block if over `240` characters.
- If note is `3..11` characters, explain that backend allows it but the product flow requires more context.

Payload still sends only `note`.

## Effective Timestamp Handling
Because the backend currently saves to `pricing_rules/active`, the modal must not present `effectiveAt` as delayed activation.

Allowed copy:
```text
Recorded effective time
```

Blocked copy:
```text
Schedule activation
```

Required warning when `effectiveAt` is future-dated:
```text
The current backend does not defer activation by this timestamp. If you save now, new delivery quotes use the proposed table immediately.
```

Recommended behavior:
- If `effectiveAt` is omitted, show `Backend will record the save time as effective time.`
- If `effectiveAt` is in the past, show `This records a past effective timestamp but still saves the rule now.`
- If `effectiveAt` is future, require an extra acknowledgement or block submit until the selected time, depending on product policy.

Decision for v1:
- The modal should block future `effectiveAt` submit by default unless a feature flag named `allowImmediateSaveWithFutureEffectiveAt` is explicitly enabled.
- If the flag is enabled, the immediate-activation warning and acknowledgement are mandatory.

This avoids building a false scheduler.

## Price Change Policy Panel
Show a policy panel above confirmation:
```text
Pricing policy
Route base-fee changes require product, finance, and operations approval. Non-emergency price changes require 7 calendar days notice outside this backend flow. This save replaces the active backend route table for new quotes.
```

The panel should include:
- Product approval required.
- Finance approval required.
- Operations approval required.
- Seven-day notice policy.
- Backend active-immediately caveat.
- Existing quotes stay locked.

Do not include approval checkboxes that imply backend stores the approval actors. Use a single typed confirmation and note instead.

## Confirmation Model
The modal requires typed confirmation.

Confirmation phrase:
```text
UPDATE PRICING
```

The submit button remains disabled until:
- Client schema validation passes.
- Frontend governance validation passes.
- Required note exists.
- Immediate activation acknowledgement is checked.
- Existing locked quote acknowledgement is checked.
- Typed phrase exactly matches `UPDATE PRICING`.
- User has `manage_pricing_rules`.
- No submit is currently in flight.

Button labels:
- Primary in review state: `Update active pricing`
- Primary while submitting: `Updating pricing`
- Secondary: `Return to edit`
- Close when dirty: `Keep reviewing`

Destructive tone:
- Use serious finance language, not fear language.
- Pricing update is high-impact but not destructive to existing locked quotes.

## Modal Layout
Desktop:
- Width: `960px` max.
- Height: max `88vh`.
- Header fixed.
- Body scrolls.
- Footer fixed.
- Diff table uses horizontal overflow only if viewport is narrow.
- Confirmation controls sit in footer plus full details in body.

Tablet:
- Width: `min(92vw, 900px)`.
- Diff table can switch to compact table.
- Policy panel remains near top.

Mobile:
- Full-screen sheet.
- Header remains sticky.
- Corridor cards replace table.
- Footer action stack is vertical.
- Typed confirmation stays above buttons, not hidden at bottom.

The modal must be usable on a 360px wide device without horizontal body scroll.

## Header Content
Title:
```text
Update active pricing rule
```

Subtitle variants:
- Current persisted rule:
```text
Review the proposed corridor base-fee table before replacing PRC-0001.
```
- Current fallback rule:
```text
Review the proposed corridor base-fee table before creating the first persisted active rule.
```

Header badges:
- `Finance control`
- `GHS`
- `6 required corridors`
- `Immediate backend activation`

Do not use decorative warning icons without accessible labels.

## Body Sections
Required section order:
1. Impact summary.
2. Current active rule.
3. Proposed changes.
4. Route table validation.
5. Policy and activation warning.
6. Payload preview.
7. Confirmation.

This order keeps the consequence before the fields.

## Impact Summary
Show three cards:
- New quotes impact.
- Existing quotes impact.
- Audit record impact.

New quotes card:
```text
New delivery quotes use the saved active table immediately after the backend accepts this update.
```

Existing quotes card:
```text
Already locked delivery quotes and payment obligations do not change.
```

Audit card:
```text
The backend returns a new pricing rule ID and records the updating user ID and timestamps.
```

If no fee changes:
```text
No corridor base fee is changing. Return to edit unless you are intentionally replacing metadata.
```

## Current Active Rule Section
Fields:
- Rule ID.
- Status.
- Currency.
- Effective time.
- Updated time.
- Updated by.
- Note.
- Fallback status.

Display missing optional note as:
```text
No note stored on current rule.
```

Do not expose raw database paths.

## Proposed Changes Section
Summary row:
- `6 corridors submitted`
- `N corridors changed`
- `Highest increase`
- `Highest decrease`
- `Recorded effective time`

When `N = 0`:
```text
No base-fee change detected.
```

When all six change:
```text
All launch corridors are changing. Review each direction carefully.
```

When one direction changes but reverse direction does not:
```text
Only one direction is changing. Confirm this is intentional.
```

This is a warning, not a blocker. One-way routes can have different prices.

## Route Direction Safety
Route direction matters because all launch corridors are one-way.

The modal must:
- Show origin and destination labels separately.
- Show route key.
- Avoid bidirectional arrows in labels.
- Use `to`, not `between`, in human route labels.
- Mark reverse route separately.

Correct:
```text
Accra Central to Kumasi Adum
Kumasi Adum to Accra Central
```

Incorrect:
```text
Accra Central / Kumasi Adum
```

## Payload Preview
Show a compact code-style payload preview after validation passes:
```json
{
  "routeBaseFees": [
    {
      "originStationId": "ST-ACC-01",
      "destinationStationId": "ST-KMS-01",
      "baseFeeGhs": 42
    }
  ],
  "note": "Finance approval for revised launch corridor pricing."
}
```

Rules:
- Include all six `routeBaseFees`.
- Sort by canonical route key.
- Omit `effectiveAt` if absent.
- Omit `note` only if no note is sent.
- Do not include typed confirmation.
- Do not include acknowledgement flags.
- Do not include admin display name.
- Do not include current rule fields.
- Do not include diff fields.

If payload preview is hidden on mobile, provide a `View payload` disclosure that is keyboard accessible.

## Request Builder
Build the request as:
```ts
const request: AdminUpdatePricingRulesRequest = {
  routeBaseFees: canonicalRouteBaseFees.map((fee) => ({
    originStationId: fee.originStationId,
    destinationStationId: fee.destinationStationId,
    baseFeeGhs: fee.baseFeeGhs
  })),
  ...(effectiveAt ? { effectiveAt } : {}),
  ...(note.trim() ? { note: note.trim() } : {})
};
```

Required client behavior:
- Canonicalize route order before submit.
- Preserve exact station IDs.
- Convert amount inputs to integers before modal opens or before submit.
- Reject decimals rather than rounding silently.
- Create an `Idempotency-Key` for each unique final payload.
- Reuse the same key while retrying the same in-flight submission.
- Generate a new key only after the user edits the payload after an error.

Do not submit when validation fails.

## Server Submit
Endpoint:
```http
POST /v1/admin/pricing-rules/active
```

Headers:
```http
Content-Type: application/json
Idempotency-Key: <stable-key-for-this-final-payload>
```

Expected success:
- HTTP `200`.
- Response parses as `adminPricingRulesResponseSchema`.
- `status` is `active`.
- `currency` is `GHS`.
- `routeBaseFees` length is six.
- `pricingRuleId` is not empty.
- `updatedByUserId` is present.
- `updatedAt` is present.

After success:
- Show saved state inside modal.
- Invalidate `admin_pricing_rules`.
- Invalidate finance/pricing dashboard queries that display active pricing.
- Navigate back to `/admin/pricing-rules` only after user chooses `View active pricing`.
- Do not auto-close before the admin sees the new rule ID.

## Saved State
Saved title:
```text
Pricing rule updated
```

Saved body:
```text
The backend saved PRC-0002 as the active pricing rule. New delivery quotes will use this active route table. Existing locked delivery quotes were not changed.
```

Show saved response:
- New pricing rule ID.
- Effective time returned by backend.
- Updated time.
- Updated by user ID.
- Route count.
- Changed corridor count.
- Note stored.

Primary action:
```text
View active pricing
```

Secondary action:
```text
Stay here
```

Do not say the update is queued.

## Error States
### `client_invalid`
Use when local validation fails.

Show:
- Error summary at top of modal body.
- Per-row or per-card field errors.
- Disabled submit.
- Linkable error summary entries that focus the affected field or row.

Copy:
```text
Fix the pricing table before updating the active rule.
```

### `server_validation_error`
Use when backend rejects schema or business rule.

Common causes:
- Missing launch corridor.
- Duplicate corridor.
- Same-station route.
- Invalid amount.
- Invalid datetime.
- Invalid note length.

Copy:
```text
The backend rejected this pricing update. Review the highlighted fields and submit again.
```

### `stale_rule`
Use when the active rule changed after the host opened the edit flow.

Detection options:
- Host passes baseline `pricingRuleId` and `updatedAt`.
- Modal refetches `GET /v1/admin/pricing-rules` on open.
- If latest active rule differs from baseline, block submit.

Copy:
```text
The active pricing rule changed while you were editing. Reload the pricing table before updating.
```

Actions:
- `Reload active pricing`
- `Return to edit`

Do not try to merge two admins' changes automatically.

### `not_authorized`
Use for `401`, `403`, missing session, or missing capability.

Copy:
```text
Your account cannot update pricing rules.
```

Action:
```text
Return to pricing rules
```

### `session_expired`
Use when auth token expired.

Copy:
```text
Your session expired before the pricing update was saved. Sign in again and review the pricing table before submitting.
```

Do not retry automatically after reauth without returning to review.

### `api_error`
Use for network errors, rate limits, or unexpected server failures.

Copy:
```text
The pricing update was not saved. Keep this modal open and retry after checking your connection.
```

If request may have reached server:
```text
Refresh active pricing before submitting again if you are unsure whether the request completed.
```

## API Error Mapping
Map these responses:
- `400` validation: show `server_validation_error`.
- `401`: show `session_expired`.
- `403`: show `not_authorized`.
- `409`: show `stale_rule` if backend later adds conflict detection, otherwise show API error with refresh action.
- `422`: show `server_validation_error`.
- `429`: show retry-later API error.
- `500`: show API error.
- Network timeout: show API error with safe refresh guidance.

Never show raw stack traces.

## Stale Rule Protection
The modal should refetch active pricing on open when possible:
```http
GET /v1/admin/pricing-rules
```

Compare:
- Baseline `pricingRuleId`.
- Baseline `updatedAt`.
- Baseline `routeBaseFees`.

If changed:
- Block submit.
- Show stale rule state.
- Provide reload.

If refetch fails:
- Allow the admin to retry refetch.
- Do not submit while current active rule freshness is unknown.

Rationale:
- This prevents overwriting another finance admin's recent active rule without seeing it.

## State Machine
```text
closed
  -> opening
opening
  -> review
  -> not_authorized
  -> api_error
review
  -> client_invalid
  -> requires_confirmation
  -> stale_rule
  -> closed
client_invalid
  -> review
  -> closed
requires_confirmation
  -> submitting
  -> review
  -> closed
submitting
  -> saved
  -> server_validation_error
  -> stale_rule
  -> not_authorized
  -> session_expired
  -> api_error
saved
  -> closed
  -> view_active_pricing
server_validation_error
  -> review
  -> closed
stale_rule
  -> reload_active_pricing
  -> closed
```

Invalid transitions:
- `closed -> submitting`
- `review -> saved`
- `client_invalid -> submitting`
- `not_authorized -> submitting`
- `saved -> submitting`

## Component Contract
Recommended props:
```ts
type PricingRuleUpdateModalProps = {
  open: boolean;
  currentRule: AdminPricingRulesResponse;
  proposedRule: AdminUpdatePricingRulesRequest;
  currentUser: {
    userId: string;
    role: "finance_admin" | "super_admin" | string;
    capabilities: string[];
  };
  onClose: () => void;
  onReturnToEdit: () => void;
  onSaved: (savedRule: AdminPricingRulesResponse) => void;
  onReloadCurrentRule: () => Promise<AdminPricingRulesResponse>;
};
```

The modal must not own route editing state except local confirmation state.

Local state:
- validation result.
- typed confirmation.
- acknowledgement booleans.
- submit status.
- server error.
- saved response.
- idempotency key.

Do not store full payload in local storage.

## Query And Cache Behavior
On open:
- Use host-provided current rule immediately for rendering.
- Refetch active pricing to check freshness when network is available.
- If refetch differs from baseline, block submit.

On submit success:
- Update active pricing query cache with returned response.
- Invalidate `admin_pricing_rules`.
- Invalidate related finance summary queries.
- Invalidate admin overview only if it displays pricing readiness.
- Do not invalidate sender quote caches globally; new quote creation should fetch active pricing through backend.

On close without save:
- Leave host edit form intact.
- Do not discard host state unless user explicitly chooses return/cancel behavior in host.

## Visual Design Direction
The modal should look precise and serious:
- Off-white modal surface.
- Dark ink text.
- Finance green for saved confirmation.
- Amber for immediate activation and asymmetric direction warnings.
- Red only for invalid or unauthorized states.
- Thin dividers.
- Compact data cards.
- Monospace IDs.
- Strong table hierarchy.

Avoid:
- Marketing gradients.
- Decorative financial charts.
- Confetti.
- Animated counters.
- Vague success language.
- Panic styling for normal price increases.

The visual language should feel like the final release gate of a trusted financial operations system.

## Typography
Use the admin console typography system when it exists.

If the frontend has no final admin type scale yet:
- Title: 24px, 700.
- Section titles: 16px, 700.
- Body: 14px, 400.
- Table header: 12px, 700, uppercase optional.
- Money values: 15px, 700.
- IDs: 13px monospace.
- Error text: 13px, 600.

Do not use oversized display typography in this modal.

## Spacing
Desktop:
- Modal padding: 24px.
- Section gap: 24px.
- Field gap: 12px.
- Table row vertical padding: 12px.
- Footer gap: 12px.

Mobile:
- Sheet padding: 16px.
- Section gap: 20px.
- Card gap: 12px.
- Footer gap: 10px.

Keep the footer visible without hiding validation errors.

## Interaction Rules
Open behavior:
- Focus moves to modal title or first meaningful warning.
- Body scroll position starts at top.
- Background is inert.

Close behavior:
- `Escape` closes only if not submitting.
- Close button returns to host review state.
- If confirmation fields are dirty, confirm before closing or show `Keep reviewing`.
- Clicking backdrop should not close after typed confirmation starts.

Submit behavior:
- Submit can be triggered only from enabled primary button.
- Enter key in typed confirmation field should not submit until all checks pass.
- While submitting, disable close and primary action.
- Do not show duplicate toasts for the same saved response.

Success behavior:
- Focus moves to saved title.
- Announce saved status.
- Keep modal open until user chooses next action.

## Accessibility Requirements
Modal semantics:
- Use `role="dialog"` or native dialog with correct polyfill behavior.
- Set `aria-modal="true"` when using ARIA dialog.
- Connect `aria-labelledby` to the modal title.
- Connect `aria-describedby` to the impact summary or warning.
- Trap focus while open.
- Restore focus to the launching element on close.

Keyboard:
- All controls reachable by keyboard.
- Table disclosures reachable.
- Error summary links focus affected row or card.
- `Escape` works only when safe.

Screen reader:
- Currency and deltas read clearly.
- Do not rely on color for increase/decrease.
- Validation summary announces changes.
- Submission state announced with polite live region.
- Saved state announced with assertive or focus movement, not both if that causes double speech.

Touch targets:
- Minimum `44px` height for buttons and checkboxes.
- Text input target height at least `44px` on mobile.

Reduced motion:
- Modal entrance can fade quickly.
- Disable sliding or animated table transitions when reduced motion is set.

## Error Summary Accessibility
Error summary should:
- Be focusable.
- Appear before the invalid sections.
- Include a heading.
- Link to invalid row/card/field.
- Use plain language.

Error summary title:
```text
Pricing update cannot be submitted
```

Error entry examples:
```text
Accra Central to Kumasi Adum must have a positive whole GHS amount.
The Tamale Central to Accra Central corridor is missing.
The note must explain the approval basis for this price change.
```

Do not include generic `Invalid input`.

## Security And Authorization
Frontend must:
- Check current user capability before showing submit.
- Hide or disable submit if `manage_pricing_rules` is absent.
- Still rely on backend authorization.
- Never expose this modal from public routes.
- Never persist pricing payload in browser storage.
- Never send sensitive credentials in note.
- Never include user-entered note in logs without normal app privacy rules.
- Avoid leaking route prices to unauthorized roles.

Backend remains final authority.

## Privacy
The modal shows:
- Route prices.
- Admin user ID from current rule.
- Finance note.

The modal should not show:
- Customer names.
- Receiver phone numbers.
- Sender payment references.
- Provider callback payloads.
- Driver payout details.
- Internal secrets.

## Audit Expectations
The current backend response includes `updatedByUserId`, `updatedAt`, and optional `note`. The modal should make those fields visible after save.

If audit events are available in the frontend:
- Link to filtered audit events for `admin_update_pricing_rules`.
- Do not claim an audit link exists if route support is not implemented.

Suggested post-save helper copy:
```text
Use audit events to review who updated pricing and when.
```

Only show this as a link if the audit screen supports the filter.

## Analytics
Use privacy-safe admin analytics events.

Events:
- `pricing_update_modal_opened`
- `pricing_update_modal_validation_failed`
- `pricing_update_modal_stale_rule_detected`
- `pricing_update_modal_confirmation_completed`
- `pricing_update_modal_submitted`
- `pricing_update_modal_saved`
- `pricing_update_modal_failed`
- `pricing_update_modal_closed`

Allowed properties:
- `currentPricingRuleId`
- `changedCorridorCount`
- `hasFutureEffectiveAt`
- `hasNote`
- `validationErrorCount`
- `errorCode`
- `savedPricingRuleId`

Do not send:
- Full route table.
- Note content.
- User names.
- Payment data.

## Copy System
Tone:
- Clear.
- Direct.
- Serious.
- Operational.

Avoid:
- `Oops`.
- `No worries`.
- `Just`.
- `Maybe`.
- `Scheduled` unless backend scheduling exists.
- `Safe to update` because money changes require care.

Primary warning:
```text
This update becomes the active backend pricing rule when saved.
```

Quote lock copy:
```text
Existing delivery quotes stay locked. New quotes use the saved active table.
```

Future timestamp copy:
```text
Recorded effective time is not delayed activation in the current backend.
```

No change copy:
```text
No corridor base-fee change is detected.
```

Saved copy:
```text
Pricing rule updated.
```

## Empty And Edge States
### Missing current rule
This should be rare because backend returns fallback.

Copy:
```text
Active pricing could not be loaded. Reload pricing before updating.
```

### Fallback current rule
Show fallback notice and allow save if proposed table is valid.

### No changed corridors
Disable submit by default.

Copy:
```text
Return to edit unless you need to save a new active record with updated note metadata.
```

Only allow metadata-only submit behind explicit host flag.

### All corridors changed
Allow, but show:
```text
All route base fees are changing. Review each direction before confirming.
```

### Extreme fee increase
If a route changes by more than 50 percent:
```text
This route changes by more than 50 percent. Confirm the finance note explains the reason.
```

This is a warning, not a backend rule.

### Fee at maximum
If `baseFeeGhs` is `10000`:
```text
This is the maximum value the backend accepts.
```

## Testing Requirements
Unit tests:
- Renders current rule summary.
- Renders fallback rule notice for `PRC-DEFAULT`.
- Computes changed corridor count.
- Computes deltas.
- Detects missing route.
- Detects duplicate route.
- Detects same-station route.
- Rejects decimal fee.
- Rejects zero fee.
- Rejects fee above `10000`.
- Blocks submit without note when a fee changes.
- Blocks submit without typed confirmation.
- Blocks submit without immediate-activation acknowledgement.
- Blocks future `effectiveAt` by default.
- Builds payload with canonical route order.
- Omits confirmation-only fields from payload.
- Sends `Idempotency-Key`.
- Keeps same idempotency key during retry of unchanged payload.
- Creates new idempotency key after payload change.
- Handles success response.
- Handles backend validation error.
- Handles stale active rule.
- Handles unauthorized.
- Handles session expired.
- Restores focus on close.

Integration tests:
- Host edit screen opens modal with proposed table.
- Modal refetches active pricing on open.
- Stale active rule blocks submit.
- Successful submit invalidates active pricing query.
- Saved state returns to active pricing screen.
- Existing quote warning remains visible before submit.

Accessibility tests:
- Dialog has accessible name.
- Focus trap works.
- Keyboard can complete confirmation.
- Error summary links focus invalid fields.
- Live region announces saved state.
- Mobile cards preserve route labels and values.

End-to-end test:
- Finance admin opens pricing edit.
- Changes `ST-ACC-01` to `ST-KMS-01` base fee.
- Opens update modal.
- Reviews diff.
- Adds finance note.
- Confirms immediate activation and locked quote behavior.
- Types `UPDATE PRICING`.
- Submits.
- Sees new `pricingRuleId`.
- Returns to active pricing rules.
- Creates or verifies a new quote uses the updated active route table through backend flow.

## Acceptance Criteria
The modal is complete when:
- It opens only for authorized pricing update flow.
- It displays current active rule details.
- It displays proposed route-fee diff for all six launch corridors.
- It validates complete route coverage before submit.
- It blocks duplicate and missing corridors.
- It blocks invalid fee values.
- It blocks future `effectiveAt` by default because backend activation is immediate.
- It requires meaningful note for changed fees.
- It requires acknowledgement of immediate activation.
- It requires acknowledgement that existing locked quotes do not change.
- It requires typed confirmation.
- It sends only schema-supported payload fields.
- It uses idempotent submit.
- It handles stale active rule safely.
- It shows saved response with new pricing rule ID.
- It invalidates pricing queries after save.
- It is accessible by keyboard and screen reader.
- It works on desktop, tablet, and mobile.
- It contains no public pricing marketing copy.
- It does not implement unsupported scheduler, surcharge editing, tax settings, or historical pricing.

## Implementation Notes For Claude Code
Build `PricingRuleUpdateModal` as a shared admin modal used by `AdminPricingRuleEdit`. The host owns editing; this modal owns final review and submit.

Keep the backend contract tight:
- Read current rule from `admin_pricing_rules`.
- Submit through `admin_update_pricing_rules`.
- Send complete `routeBaseFees`.
- Send optional `effectiveAt` only when allowed by the host policy.
- Send trimmed `note`.
- Send no extra acknowledgement or confirmation fields.

The most important product nuance is activation timing. The current backend stores `effectiveAt`, but quote calculation uses the saved active rule immediately. The modal must not call this a scheduler.

## Build Checklist
1. Define modal props and saved response callback.
2. Import shared contract types.
3. Build canonical route list from shared station IDs.
4. Build route key utility or reuse shared helper.
5. Render header with immediate activation badge.
6. Render current active rule summary.
7. Render proposed diff table for desktop.
8. Render proposed diff cards for mobile.
9. Add client schema validation.
10. Add governance validation for note and acknowledgements.
11. Add future `effectiveAt` blocking by default.
12. Add stale active rule refetch on open.
13. Add error summary with focus links.
14. Add typed confirmation.
15. Add idempotency key generation and reuse rules.
16. Add submit mutation.
17. Parse and display backend response.
18. Invalidate active pricing queries after success.
19. Add accessibility attributes and focus management.
20. Add responsive layout.
21. Add unit, integration, accessibility, and end-to-end tests.
22. Verify no unsupported pricing features are exposed.

## Final Directive
`PricingRuleUpdateModal` must be the final audited finance checkpoint for replacing the active launch corridor pricing rule. It must submit only `admin_update_pricing_rules`, require `manage_pricing_rules`, review every one-way corridor, block invalid route tables, explain immediate backend activation, preserve existing locked quotes, require meaningful confirmation, and never build unsupported delayed activation, surcharge editing, tax settings, or historical pricing workflows.

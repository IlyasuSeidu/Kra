# Form System Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Form system |
| Component family | Shared UI infrastructure |
| Primary modules | `KraFormProvider`, `createKraForm`, `formSchemaRegistry`, `fieldErrorMapper`, `FormSubmitController`, `FormErrorSummary`, `FormDirtyGuard`, `FormSection`, `FormField`, `FieldMessage`, `FieldHint`, `FieldError`, `SubmitBar` |
| Supporting modules | `TextField`, `PhoneField`, `MoneyField`, `NumberField`, `SelectField`, `RadioCardGroup`, `CheckboxGroup`, `SwitchField`, `TextareaField`, `DateTimeField`, `OtpField`, `PackageScanFieldAdapter`, `ProofReferenceFieldAdapter`, `ManualBlockerListField`, `RouteFeeTableField`, `FormAnalyticsBridge`, `FormFocusManager` |
| Inventory behavior | React Hook Form plus Zod, consistent field errors |
| Repo targets | `apps/web`, `apps/mobile`, `apps/admin`, future shared frontend UI package if introduced |
| Primary surfaces | public web forms, receiver verification flow, sender create-delivery flow, sender payment and issue forms, operations mobile forms, admin finance, station, user, issue, refund, webhook, and export forms |
| Primary users | public visitors, receivers, senders, station operators, drivers, final-mile couriers, support admins, finance admins, ops admins, super admins, QA, accessibility reviewers |
| Backend coverage | `packages/shared/src/contracts/api.ts`, typed API client request schemas, API error response schema, idempotency policy, delivery draft domain, role permission policy, offline outbox policy |
| Browser mutation operation | None directly; this infrastructure prepares validated payloads for host screens and typed API mutations |
| Data sensitivity | auth credentials, receiver phone, receiver address, package description, declared value, payment phone, issue text, station evidence, pricing fees, staff access, refund evidence, proof references, package scan codes, admin notes |
| Offline critical | Yes for field-operation forms that submit through the offline outbox; no for finance, admin, auth, receiver OTP, payment, refund settlement, notification retry, webhook replay, and export forms |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | app shells, role routing, typed API client, RTK Query cache, offline outbox, scan component, proof capture component, payment status component, issue status component, notification system, empty/error library, accessibility foundation, localization foundation, analytics tracking, test harness |
| Related screen specs | create delivery screens, payment method, payment failed recovery, cancel delivery request, sender issue create, sender profile, staff auth screens, station validation, station status override, admin pricing rule edit, admin user access, admin refund review, admin refund settlement, admin issue detail, admin export report, shared operational modals |
| Related state specs | validation error, loading, offline, stale data, not authorized, session expired, rate limited, blocked by payment, blocked by issue, manual review required, scan mismatch, proof required |
| Design tokens | Uses existing form, focus, error, warning, success, neutral, disabled, offline, stale, admin evidence, mobile task, and high-risk action tokens |
| Accessibility target | Every field, group, error, hint, summary, submit state, dirty warning, and server validation result must be perceivable, keyboard reachable, screen-reader understandable, and recoverable without color, animation, or pointer-only interaction |

## Purpose
The form system is Kra's shared infrastructure for collecting, validating, reviewing, and submitting user input across every product surface.

It covers:

- sender delivery creation forms
- receiver phone verification forms
- sender payment forms
- sender issue and cancellation forms
- station, driver, and courier operational action forms
- admin pricing, station validation, user access, refund, issue, notification, webhook, and export forms
- shared operational confirmation modals
- field-level validation
- form-level error summaries
- server validation mapping
- idempotent submit control
- offline outbox handoff for approved staff actions
- analytics-safe form lifecycle tracking

The most important rule is:

```text
Every Kra form must validate against a Zod schema that is either imported from shared contracts or explicitly derived from a shared contract. Screens must not invent separate field rules when a backend schema exists.
```

## Product Job
Kra forms are not generic data entry. They move packages, money, custody, proof, station readiness, refunds, and access permissions.

The form system must:

- make valid input easy
- make invalid input clear and recoverable
- keep backend schemas as the source of truth
- prevent unsafe local-only rules
- support low-bandwidth and mobile field conditions
- reduce repeated form code across surfaces
- keep field names, labels, hints, and errors consistent
- keep sensitive values out of analytics and logs
- support idempotent mutation submissions
- block high-risk forms until review and confirmation are complete
- integrate approved offline operations with the offline outbox
- expose stable test IDs and interaction contracts for Claude Code

The system must feel direct and calm. Forms should guide users through operational work without turning into paperwork.

## Strategic Role
Delivery systems fail when forms accept ambiguous or invalid input.

For Kra, form failures can become operational failures:

- wrong receiver phone blocks secure tracking and OTP proof
- missing receiver address blocks doorstep service
- package weight or size errors produce wrong quote expectations
- payment phone errors block provider checkout
- staff action forms can move custody with weak evidence
- station validation forms can mark a station launch-ready without required evidence
- pricing forms can change corridor fees incorrectly
- refund forms can approve money movement without required policy conditions
- issue forms can send weak support cases to triage
- admin user forms can grant access with wrong station scope

The form system is therefore part of safety, finance control, and trust.

## Design Brief
Audience:

- Claude Code and frontend engineers building production forms for web, mobile, and admin surfaces.

Surface type:

- Shared form infrastructure with visual primitives, validation adapters, state orchestration, accessibility behavior, and testing rules.

Primary action:

- Let each screen collect exactly the data allowed by its contract and submit it through the correct typed API or offline outbox path.

Visual thesis:

- `Precise operating forms`: compact, serious, field-first interfaces that make the next valid action obvious and make mistakes easy to fix.

Restraint rule:

- Do not create decorative, chat-like, or survey-like forms for operational actions. Use structure, labels, hints, grouping, and review steps instead of visual noise.

Density:

- Mobile forms are step-based and keyboard-safe.
- Admin forms are evidence-led and review-first.
- Public forms are short, plain-language, and privacy-aware.

Platform stance:

- React Hook Form is the form state and field registration layer.
- Zod is the runtime schema and TypeScript type authority.
- `@hookform/resolvers/zod` bridges React Hook Form with Zod.
- Shared backend schemas from `packages/shared/src/contracts/api.ts` are preferred over app-local schemas.
- App-local schemas are allowed only for local drafts, view-only filters, or UI-only choices that do not submit to backend.

## External Research Used
Only directly relevant form, validation, and accessibility sources were used:

- [React Hook Form resolvers](https://github.com/react-hook-form/resolvers): documents resolver integration with validation libraries, including Zod, automatic output type inference, and `zodResolver`.
- [Zod basics](https://zod.dev/basics): documents runtime parsing, `safeParse`, and TypeScript type inference through `z.infer`, `z.input`, and `z.output`.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): requires detected input errors to identify the field and describe the error in text.
- [WCAG 2.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html): supports visible labels, instructions, expected formats, grouped controls, and required-field cues.
- [GOV.UK Design System error summary](https://design-system.service.gov.uk/components/error-summary/): supports a top-level error summary, focus movement to the summary, links to invalid fields, and matching summary and field error text.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports fieldsets and legends for grouped controls, marking optional fields clearly, and field-level error notification.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/01-app-shells.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/02-role-routing.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/06-scan-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/07-proof-capture-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/10-payment-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/11-issue-status-component.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/12-notification-system.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/03-error-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/04-offline-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/05-stale-data-state.md`
- `docs/05-design/frontend-screen-specs/shared-screen-states/19-rate-limited-state.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/07-create-receiver-details.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/08-create-package-details.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/12-payment-method.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/22-cancel-delivery-request.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/24-sender-issue-create.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/14-admin-station-validation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/15-admin-station-status-override.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/19-admin-user-access.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/22-admin-pricing-rule-edit.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/26-admin-refund-review.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/27-admin-refund-settlement.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/30-admin-issue-detail.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `docs/15-qa/quality-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/delivery-draft.ts`
- `packages/shared/src/domain/permissions.ts`
- `packages/shared/src/domain/pricing.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/app.ts`
- `services/api/src/service-errors.ts`

## Current Dependency Reality
Current repo dependency state:

- `zod` exists in root and shared package dependencies.
- `react-hook-form` is not currently present in the workspace dependency search.
- `@hookform/resolvers` is not currently present in the workspace dependency search.

Implementation requirement:

- Add `react-hook-form` and `@hookform/resolvers` to each frontend app package that owns forms, or add them to a shared frontend package if the repo introduces one.
- Do not add a second runtime validation library for Kra forms.
- Do not create a parallel custom form engine.
- Do not bypass Zod validation for backend-bound payloads.

## Non-Goals
The form system must not:

- implement actual frontend screens in this documentation PR
- replace backend authorization
- replace the typed API client
- replace the offline outbox
- replace proof capture or scan components
- calculate pricing locally as authority
- approve refunds locally
- grant user access locally
- make station go-live decisions locally
- turn admin review forms into direct one-click mutations
- persist sensitive input longer than the host screen requires
- send analytics with raw user-entered values
- show raw backend validation internals to customers
- create form fields that are not accepted by the target request schema
- rely on browser-only behavior for mobile-native forms

## Architecture Overview
The form system has five layers.

### Schema Layer
Source:

- `packages/shared/src/contracts/api.ts`
- app-local draft schemas only when no backend request exists yet

Responsibilities:

- expose canonical Zod schemas
- infer input and output types
- describe field paths
- describe optional fields
- describe cross-field refinements
- expose safe error copy keys
- keep schemas reusable across web, mobile, and admin forms

Rules:

- Import backend request schemas where available.
- Use `z.input<typeof Schema>` for pre-normalized form input when needed.
- Use `z.output<typeof Schema>` for payloads after resolver transformation.
- Avoid duplicating backend `.superRefine` logic in components.
- Local schemas must live near the form registry and must cite why no backend schema exists.
- Local schemas for filters must not be reused as mutation schemas.

### Form State Layer
Source:

- React Hook Form

Responsibilities:

- register fields
- track dirty state
- track touched state
- track submit state
- expose field errors
- expose form-level validity
- isolate field rerenders
- provide submission lifecycle
- support controlled components through controller adapters only when required

Rules:

- Prefer uncontrolled field registration for simple text, number, and textarea controls.
- Use controlled adapters for native pickers, segmented choices, scan adapters, proof adapters, and custom card selectors.
- Keep form state local to the screen or modal.
- Do not put active field values into Redux or RTK Query cache.
- Do not store active sensitive field values in analytics state.

### Resolver Layer
Source:

- `@hookform/resolvers/zod`

Responsibilities:

- connect React Hook Form to Zod
- produce field-level errors from schema violations
- preserve schema-inferred payload types
- support safe parsing before mutation submit

Rules:

- Every backend-bound form uses `zodResolver(schema)`.
- Use `criteriaMode: "all"` only where the screen needs all field reasons at once.
- Default to one primary error per field for mobile task speed.
- Use `safeParse` in submit controllers before queueing offline actions.
- Resolver output must be the payload shape sent to typed API or offline outbox.

### Component Layer
Source:

- shared form primitives and app adapters

Responsibilities:

- render accessible fields
- render hints and errors
- provide consistent labels
- provide group semantics
- provide mobile keyboard and admin table field layouts
- provide action bars
- provide review sections

Rules:

- Field primitives must not know backend operation names.
- Host screens pass schema, default values, submit handler, and copy.
- Field primitives emit typed values only.
- Custom controls must expose accessible names, values, states, and error relationships.
- Do not hide labels and rely on in-field prompt text.

### Submit Layer
Source:

- host screen submit controllers
- typed API client
- offline outbox adapter where approved

Responsibilities:

- block duplicate submit
- attach idempotency key where required
- map server validation errors back to fields
- map non-field API errors to form summary
- invalidate RTK Query tags after success
- queue approved offline staff actions
- route to success state

Rules:

- Host owns mutation selection.
- Host owns route transition after success.
- Host owns offline eligibility.
- Host owns high-risk review requirements.
- The form infrastructure only provides reusable mechanics.

## Canonical Form Factory
Implement a factory that standardizes form setup.

Required API shape:

```ts
type KraFormConfig<Schema extends z.ZodTypeAny> = {
  schema: Schema;
  defaultValues: z.input<Schema>;
  mode?: "onSubmit" | "onBlur" | "onChange";
  reValidateMode?: "onBlur" | "onChange" | "onSubmit";
  formId: string;
  operationId?: string;
  redactionPolicy: FormRedactionPolicy;
};
```

Required defaults:

- `mode`: `onSubmit` for high-risk admin and finance forms.
- `mode`: `onBlur` for sender and receiver short forms where early help reduces friction.
- `mode`: `onChange` only for tiny OTP, search, filters, and choice groups where validation is cheap.
- `reValidateMode`: `onChange` after a field has shown an error.
- `shouldFocusError`: true for web, adapted through `FormFocusManager` for mobile.
- `shouldUnregister`: false for multi-step forms that preserve hidden step data.
- `criteriaMode`: `firstError` unless the host explicitly needs grouped reasons.

Factory responsibilities:

- call `useForm` with `zodResolver`
- attach form metadata
- configure analytics-safe field registry
- expose typed `handleValidSubmit`
- expose typed `handleInvalidSubmit`
- expose dirty state
- expose form reset with safe redaction hooks

## Schema Registry
Create a central registry for all backend-bound form schemas.

Required registry entries:

```ts
type FormSchemaRegistryEntry = {
  formId: string;
  operationId: string;
  schemaName: string;
  schemaSource: "shared_contract" | "domain_draft" | "ui_filter";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresIdempotencyKey: boolean;
  offlineEligible: boolean;
  reviewRequired: boolean;
  analyticsRedaction: "none" | "field_names_only" | "counts_only";
};
```

Registry rules:

- Every mutation form must have one registry entry.
- Every registry entry must point to a real schema.
- Every high-risk or critical form must require review or explicit confirmation.
- Every offline-eligible form must map to the offline outbox spec.
- Every finance, access, refund, station validation, custody, and proof form must be marked high or critical.
- UI-only filter forms may use local schemas but must not carry mutation metadata.

## Required Registry Coverage
Sender and receiver:

| Form | Schema | Risk | Offline | Review |
| --- | --- | --- | --- | --- |
| `create_receiver_details` | local draft derived from `deliveryReceiverSchema` | medium | no | no |
| `create_package_details` | local draft derived from `deliveryPackageSchema` | medium | no | no |
| `create_delivery_options` | local draft derived from `createDeliveryRequestSchema` service fields | medium | no | no |
| `delivery_summary_submit` | `createDeliveryRequestSchema` | high | no | yes |
| `payment_method` | `paymentInitializeRequestSchema` | high | no | yes |
| `payment_verify` | `paymentVerifyRequestSchema` | medium | no | no |
| `cancel_delivery` | `cancelDeliveryRequestSchema` | high | no | yes |
| `sender_issue_create` | `createIssueRequestSchema` | medium | no | no |
| `receiver_phone_challenge` | public tracking phone challenge schema | medium | no | no |
| `receiver_otp_verify` | public tracking verification schema | high | no | no |

Operations mobile:

| Form | Schema | Risk | Offline | Review |
| --- | --- | --- | --- | --- |
| `station_intake` | intake request schema | critical | yes | yes |
| `station_driver_assignment` | assignment request schema | high | yes | yes |
| `station_dispatch_readiness` | dispatch request schema | critical | yes | yes |
| `driver_accept_run` | accept run request schema | high | yes | yes |
| `driver_pickup_scan` | pickup request schema | critical | yes | yes |
| `driver_mark_in_transit` | lifecycle request schema | high | yes | no |
| `station_destination_receipt` | destination receipt schema | critical | yes | yes |
| `courier_accept_assignment` | final-mile accept schema | critical | yes | yes |
| `courier_out_for_delivery` | lifecycle request schema | high | yes | no |
| `courier_complete_delivery` | `completeDeliveryRequestSchema` | critical | yes | yes |
| `courier_failed_attempt` | `recordFailedAttemptRequestSchema` | critical | yes | yes |
| `ops_issue_create` | `createIssueRequestSchema` | medium | yes | no |

Admin:

| Form | Schema | Risk | Offline | Review |
| --- | --- | --- | --- | --- |
| `admin_pricing_rule_edit` | `adminUpdatePricingRulesRequestSchema` | critical | no | yes |
| `admin_user_upsert` | `adminUpsertUserRequestSchema` | critical | no | yes |
| `admin_user_access` | `adminUpdateUserAccessRequestSchema` | critical | no | yes |
| `admin_station_status_override` | `adminUpdateStationStatusRequestSchema` | critical | no | yes |
| `admin_station_validation` | `adminUpdateStationValidationRequestSchema` | critical | no | yes |
| `admin_refund_review` | `refundPaymentRequestSchema` | critical | no | yes |
| `admin_refund_settlement` | `settleRefundRequestSchema` | critical | no | yes |
| `admin_issue_escalate` | `escalateIssueRequestSchema` | high | no | yes |
| `admin_issue_resolve` | `resolveIssueRequestSchema` | high | no | yes |
| `admin_export_report` | admin export request schema when introduced | medium | no | no |
| `admin_webhook_replay` | webhook replay schema when introduced | critical | no | yes |

## Shared Field Primitives
Every field primitive must support:

- `id`
- `name`
- `label`
- `hint`
- `error`
- `required`
- `optional`
- `disabled`
- `readOnly`
- `autoComplete`
- `inputMode`
- `keyboardType` for native mobile
- `testID`
- `aria-describedby` or native equivalent
- focus method
- value redaction metadata

### TextField
Used for:

- names
- station notes
- issue summaries
- refund references
- provider references when visible to admin
- route search

Rules:

- Always show a visible label.
- Use hint text for format guidance.
- Do not rely on in-field prompt text as the only label.
- Trim on schema parse, not on every keystroke unless the field is an ID or code.
- Preserve user typing while editing.
- Show character counters only when max length materially affects success.

### PhoneField
Used for:

- receiver phone
- payment phone
- staff phone
- passwordless login
- receiver verification

Rules:

- Accept Ghana-friendly entry where screen policy allows.
- Normalize to E.164 before backend submit.
- Keep displayed formatting readable without changing the stored payload.
- Do not send a verification challenge on blur.
- Do not log full phone number.
- Use `tel` input mode or native phone keyboard.
- Provide country assumption text where relevant.

### MoneyField
Used for:

- route base fees
- declared values
- refunds
- settlement values if later introduced

Rules:

- Store GHS integer amounts where backend expects integer GHS.
- Use tabular numerals in admin forms.
- Reject negative values unless schema explicitly allows them.
- Do not accept currency symbols into numeric payload.
- Show currency as an adornment, label, or adjacent text, not as user-entered data.
- Avoid floating currency math in UI.

### NumberField
Used for:

- package weight
- scan success rate
- dry-run days
- pilot business days
- route fees when not using `MoneyField`

Rules:

- Use numeric keyboard where platform supports it.
- Parse blank as missing, not zero.
- Preserve decimal entry while the user is typing.
- Validate exact min and max from schema.
- Show units beside the field.
- Do not auto-correct a value into a different submitted value without review.

### SelectField
Used for:

- station choices
- issue categories
- issue severities
- staff roles
- account status
- delivery filters

Rules:

- Options must come from shared enums or backend data.
- Option labels must be user-facing, not raw enum names.
- Raw enum values stay in payload.
- Disabled options need a visible reason.
- Searchable select is allowed only when option count requires it.

### RadioCardGroup
Used for:

- service type
- package size tier
- issue category
- proof method
- delivery option choices

Rules:

- Use fieldset and legend on web.
- Use native accessibility grouping on mobile.
- Each card must expose role, selected state, label, and hint.
- Card visuals must not be the only selected indicator.
- The first error for the group attaches to the group, not only to one option.

### CheckboxGroup
Used for:

- station validation checklist
- refund policy factors
- export report columns
- launch readiness acknowledgements

Rules:

- Use fieldset and legend on web.
- Each option needs a visible label.
- Required group errors attach to the group.
- For critical forms, show a review summary of checked and unchecked values.

### SwitchField
Used for:

- simple booleans like fragile package, status flags, and availability toggles

Rules:

- Use only for immediate yes/no meaning.
- Do not use switches for high-risk submit actions.
- If a switch changes dependent fields, announce the change and preserve focus.
- Critical toggles still require review before submit.

### TextareaField
Used for:

- issue description
- support notes
- station validation note
- refund review notes
- operational blockers

Rules:

- Show max length when close to limit or always for strict fields.
- Do not allow unbounded paste without counter feedback.
- Do not store rich text.
- Do not preserve sensitive notes after successful submit unless screen policy requires the saved result view.

### DateTimeField
Used for:

- effective pricing time
- station validation start and completion
- refund settlement time when supplied
- export ranges

Rules:

- Store ISO datetime strings where backend expects datetime.
- Show timezone clearly.
- Do not submit local display strings.
- Avoid split date/time fields unless accessibility and mobile keyboard behavior are explicitly handled.
- For date groups, errors must identify the specific missing part or the group.

### OtpField
Used for:

- receiver verification
- passwordless login
- receiver proof completion where applicable

Rules:

- Do not reveal OTP in analytics or logs.
- Support paste into full code.
- Keep digit boxes accessible as one logical input where possible.
- Rate-limit and expiry states come from backend.
- Do not queue OTP verification offline.

### RouteFeeTableField
Used for:

- admin pricing rule edit

Rules:

- Always render all required launch corridors.
- Do not allow adding unsupported corridors.
- Do not allow removing required corridors.
- Validate duplicates and missing corridor coverage through schema.
- Show current fee, proposed fee, and delta.
- Review step must show the exact submitted table.

### ManualBlockerListField
Used for:

- admin station validation

Rules:

- Each blocker is a text item between schema min and max.
- Maximum count comes from schema.
- Empty array is omitted when policy says optional omit.
- Duplicate blocker text should be warned against but not silently removed.
- Review step must show blocker count and full text.

## Field Error Model
Use a single internal field error shape:

```ts
type KraFieldError = {
  fieldPath: string;
  code: string;
  message: string;
  source: "client_schema" | "server_validation" | "network_submit" | "offline_queue" | "host_policy";
  severity: "info" | "warning" | "error";
  focusTargetId: string;
};
```

Rules:

- `fieldPath` must match Zod path or registered field name.
- `message` is safe user-facing copy.
- `code` is stable for tests and analytics.
- `source` must be preserved for QA and debugging.
- One visible primary error per field is the default.
- Additional technical reasons may be hidden behind admin-only details where allowed.
- Do not show raw Zod issue objects to users.
- Do not show raw backend stack details to users.

## Form Error Summary
Every submitted form with validation errors must render a form-level summary.

Summary rules:

- Title: `There is a problem`
- Content: one link or focus action per invalid field or group
- Copy: summary message matches the field error text
- Focus: move focus to summary after failed submit on web
- Mobile: move screen reader focus or announce summary, then let user jump to first invalid field
- Multiple-field groups: link to the first invalid field or the group legend
- Long admin forms: keep summary sticky only if it does not cover fields
- Modal forms: summary remains inside the modal focus trap

Do not:

- show only red borders
- show only toast errors for validation
- scroll without announcing
- hide field errors below collapsed sections without a section-level error marker
- present different copy in summary and field error

## Server Validation Mapping
Backend validation errors must map back into the same form error model.

Supported API response:

- `VALIDATION_ERROR` from `docs/07-api/error-codes.md`
- request ID if returned
- field-specific details if the typed API client exposes them
- operation-specific safe message

Mapping rules:

- If backend returns a field path, attach error to that field.
- If backend returns an unknown field path, attach to form summary as server validation.
- If backend returns only `VALIDATION_ERROR`, show the safe default and keep user input.
- If backend returns business conflict, route to a state component, not field validation.
- If backend returns `AUTH_REQUIRED`, route to session expired.
- If backend returns `FORBIDDEN_ROLE`, route to permission denied.
- If backend returns `RATE_LIMITED` once introduced, route to rate-limited state.
- If backend returns provider or server failure, show safe non-field error.

Non-field backend errors:

| Error code | Form treatment | Recovery |
| --- | --- | --- |
| `AUTH_REQUIRED` | session expired state | sign in again |
| `FORBIDDEN_ROLE` | not authorized state | return to safe route |
| `STATION_SCOPE_VIOLATION` | not authorized or station scope state | refresh assignment |
| `ASSIGNMENT_SCOPE_VIOLATION` | not authorized or assignment state | return to assigned work |
| `DELIVERY_NOT_FOUND` | not found state | return to list |
| `INVALID_STATUS_TRANSITION` | stale or conflict state | refresh delivery |
| `DELIVERY_NOT_PAID` | blocked by payment state | open payment context |
| `HANDOFF_PROOF_REQUIRED` | proof required state | open proof capture |
| `PACKAGE_SCAN_MISMATCH` | scan mismatch state | rescan or manual recovery |
| `FINAL_PROOF_REQUIRED` | proof required state | add proof |
| `REFUND_NOT_ALLOWED` | refund policy state | review evidence |
| `ISSUE_LOCK_ACTIVE` | blocked by issue state | open issue |
| `PAYMENT_PROVIDER_UNAVAILABLE` | provider unavailable state | retry later |
| `UNKNOWN_INTERNAL_ERROR` | safe API error state | retry or contact support |

## Validation Timing
Validation must match risk and context.

Short sender forms:

- validate on blur
- revalidate on change after error
- do not block typing with aggressive red states
- show CTA disabled only when required fields are clearly absent or known invalid

OTP forms:

- validate format as the user types
- submit only when code length is complete
- server decides expiry and correctness
- rate-limit response controls recovery

Field operations:

- validate required proof, scan, and role context before submit
- validate again before offline queue write
- do not queue if schema fails
- do not queue if action is not approved by offline policy

Admin critical forms:

- validate before entering review
- show summary on review page if invalid
- require confirmation before mutation
- block submit while stale active record warning is unresolved

Search and filter forms:

- local schema allowed
- submit through query params or local state
- debounce carefully
- do not show full validation summary for simple search unless submit fails

## High-Risk Review Pattern
The form system must support review-before-submit for critical forms.

Review required for:

- delivery summary submit
- payment initialization
- cancellation
- station intake and handoff custody transitions
- final delivery completion
- failed delivery attempt
- admin pricing rule edit
- admin user access
- admin station status override
- admin station validation
- refund approval
- refund settlement
- issue escalation
- issue resolution
- webhook replay

Review pattern:

- show all values that will be submitted
- show omitted optional values as `Not provided`
- show backend authority statement
- show idempotency and duplicate-submit protection
- show risk-specific consequences
- require explicit final action label
- keep edit action available

Critical review CTA copy examples:

- `Confirm station validation`
- `Save pricing rule`
- `Apply access change`
- `Approve refund request`
- `Settle refund`
- `Complete delivery`
- `Record failed attempt`

Do not use vague labels such as:

- `Submit`
- `OK`
- `Continue`
- `Done`

when the action changes money, custody, proof, access, or station readiness.

## Idempotency Policy
Mutation forms that call idempotent backend operations must attach exactly one idempotency key per submit attempt.

Rules:

- Generate the key when the submit attempt begins.
- Reuse the same key for retry of the same in-flight attempt.
- Generate a new key only after the user edits values or starts a new attempt.
- Persist the key with offline outbox items.
- Do not expose the key in UI.
- Do not send idempotency key in analytics.
- Clear the key after definitive success or cancellation.

Forms requiring idempotency:

- create delivery
- payment initialize
- cancel delivery
- all staff custody and lifecycle mutations
- complete delivery
- record failed attempt
- create issue where backend policy marks it idempotent
- admin pricing rule update
- admin user access mutation
- admin station status mutation
- admin station validation mutation
- refund request
- refund settlement
- webhook replay when introduced

## Offline Form Policy
Only approved operations mobile forms can submit offline.

Offline-eligible forms:

- station intake
- station driver assignment
- station dispatch readiness
- driver accept run
- driver pickup scan
- driver mark in transit
- station destination receipt
- courier accept assignment
- courier out for delivery
- courier complete delivery
- courier failed attempt
- ops issue create if offline outbox permits it

Offline-ineligible forms:

- auth
- receiver OTP
- payment
- refund request
- refund settlement
- admin pricing
- admin station validation
- admin user access
- notification retry
- webhook replay
- export report
- public support entry unless a backend endpoint and queue policy are introduced

Offline submit flow:

1. Validate with Zod.
2. Verify offline policy allows the operation.
3. Attach operation ID.
4. Attach idempotency key.
5. Attach payload.
6. Attach redacted display summary.
7. Add to offline outbox.
8. Show queued confirmation with recovery route.

Offline errors:

- schema failure stays in form
- policy denial routes to offline state
- queue write failure shows form-level error
- replay conflict routes to action recovery

## Multi-Step Form Policy
Multi-step forms must preserve valid progress without creating backend state early.

Sender create delivery flow:

- station selection writes local draft
- receiver details write local draft
- package details write local draft
- options write local draft
- quote review calls backend only at approved step
- delivery summary submits `createDeliveryRequestSchema`

Rules:

- Each step validates only its owned fields and known dependencies.
- Final submit validates the complete backend request schema.
- Hidden fields must not silently become invalid.
- The final summary must show all submitted values.
- Draft data must clear after successful delivery creation.
- Draft data must not sync across accounts unless explicit product policy exists.

Admin multi-step forms:

- evidence step collects values
- review step shows exact payload
- confirmation modal captures final intent
- result step shows backend response

Rules:

- Review step cannot mutate data.
- Confirmation cannot change data.
- Edit returns to form with values preserved.
- Backend result wins over local predicted outcome.

## Data Redaction
Form analytics and logs must never include raw sensitive values.

Forbidden analytics values:

- auth credentials
- OTP
- receiver phone
- payer phone
- staff phone
- receiver address
- package scan code
- proof reference
- proof asset path
- upload URL
- package description
- issue summary
- issue description
- admin notes
- manual blocker text
- refund reference
- provider reference
- tracking code
- delivery ID unless analytics policy explicitly allows hashed or categorized values
- user ID unless analytics policy explicitly allows role-scoped internal IDs

Allowed analytics values:

- form ID
- operation ID
- field count
- invalid field count
- field names only when not sensitive
- error code
- error source
- risk level
- role
- app surface
- offline eligible true or false
- submit success or failure
- duration bucket
- retry count

Redaction rules:

- Field registry must mark sensitive fields.
- Sensitive fields default to excluded.
- Form submit analytics must pass through redaction helper.
- Crash logs must not serialize full form values.
- Review screens may display sensitive values only when the user is authorized and the screen spec permits it.

## Accessibility Requirements
Every form must satisfy these requirements.

Labels:

- visible label for every input
- visible legend for every field group
- optional fields marked with `(optional)`
- required fields described in intro or labels
- format guidance shown near the field
- no visual-only labels

Hints:

- hint text attached through `aria-describedby` or native equivalent
- hints stay available when field has error
- long hints use progressive help only when the field remains understandable without opening it

Errors:

- field error text appears next to the field
- summary appears after failed submit
- summary links or focuses invalid fields
- error copy identifies what is wrong
- error copy explains how to fix when possible
- color is never the only signal
- icons include accessible text or are decorative

Focus:

- focus moves to summary on failed web submit
- mobile announces summary and offers first-error jump
- modal focus remains trapped
- success state focuses confirmation heading
- route changes after submit set focus to new screen heading
- disabled submit state is explained when not obvious

Keyboard and touch:

- all fields keyboard reachable
- all actions keyboard reachable
- touch targets meet platform size rules
- sticky submit bars do not cover active fields
- keyboard opening does not hide active field or CTA
- focus order follows visual order

Motion:

- error reveal uses minimal motion
- support reduced motion
- do not shake fields as the only error cue
- do not auto-advance fields if it disrupts assistive technology

## Mobile UX Rules
Mobile forms are primary for senders, receivers, and field staff.

Rules:

- keep one main action visible
- use step flows for long forms
- keep labels above fields
- keep helper text concise
- use native keyboards by input type
- avoid dense two-column layouts
- prevent sticky submit bars from covering content
- preserve progress when app backgrounds
- support large text and narrow screens
- ensure offline state is visible before submit when relevant

Sender mobile:

- prioritize speed and privacy
- use plain customer language
- show why sensitive data is needed
- avoid admin jargon
- keep form copy short

Operations mobile:

- prioritize proof, scan, custody, and task safety
- show current package and required next action above form
- use large controls for field work
- make offline queue result explicit
- require confirmation for custody-moving actions

Receiver public flow:

- keep verification forms short
- do not expose delivery details before verification
- do not reveal account existence
- make expiry and rate-limit states clear

## Admin UX Rules
Admin forms need stronger review, evidence, and audit cues.

Rules:

- use full-width layouts for dense tables
- keep form sections named by operational meaning
- show current value beside proposed value for high-risk changes
- show role and capability requirement near action
- show stale data warning if source record changed
- include review step for critical forms
- include audit note where backend accepts it
- include backend result after submit
- keep raw sensitive fields hidden unless screen policy allows them

Admin form visual principles:

- finance forms use tabular numeric alignment
- station validation forms use evidence progress and blockers
- user access forms show role, status, station scope, and consequence
- refund forms show policy factors before decision
- issue forms show current issue status and next permitted transition
- webhook replay forms show replay scope and risk

## Copy System
Form copy must be specific, short, and action-oriented.

Labels:

- use noun labels: `Receiver phone`, `Package weight`, `Base fee`
- avoid internal names: do not label customer fields with enum names
- include unit where needed: `Weight in kg`, `Base fee in GHS`

Hints:

- tell the user what format or decision is needed
- explain operational reason only when it affects trust or success
- keep one hint per field unless high-risk

Errors:

- identify field
- identify problem
- explain fix when possible
- avoid blame
- avoid raw schema language

Good error patterns:

- `Enter receiver phone in a valid Ghana or international format.`
- `Package weight must be 20 kg or less for self-service booking.`
- `Add at least one reason before resolving this issue.`
- `Base fee must be a whole GHS amount.`
- `Choose a station before assigning this operator.`

Avoid:

- `Invalid input`
- `Bad request`
- `Required`
- `Schema failed`
- `An error occurred`
- raw enum values

## State Model
Every form has a state machine.

Baseline states:

```ts
type KraFormState =
  | "idle"
  | "editing"
  | "dirty"
  | "client_invalid"
  | "review"
  | "confirm"
  | "submitting"
  | "queued_offline"
  | "submitted"
  | "server_validation_error"
  | "api_error"
  | "conflict"
  | "not_authorized"
  | "session_expired";
```

State rules:

- `idle` means loaded with default values.
- `editing` means focused or changed without validation error.
- `dirty` means values differ from defaults.
- `client_invalid` means Zod rejected current values.
- `review` means values are valid but final confirmation remains.
- `confirm` means high-risk confirmation is active.
- `submitting` means network or queue write is active.
- `queued_offline` means accepted by offline outbox.
- `submitted` means backend accepted mutation.
- `server_validation_error` means backend rejected field semantics.
- `api_error` means safe retry is possible or support route is needed.
- `conflict` means data changed or state transition is invalid.
- `not_authorized` and `session_expired` route to shared states.

## State Matrix
Initial loading:

- show skeleton or loading state
- do not show incomplete form controls as editable
- preserve route context

Ready:

- render form with default values
- show required and optional markers
- primary action matches screen state

Dirty:

- enable save or continue if locally valid
- show unsaved-change warning on route leave where loss matters
- do not show warning for short OTP or search forms

Client invalid:

- show summary after submit attempt
- show field errors
- keep values
- focus summary or announce summary

Review:

- show read-only values
- show exact payload shape where useful
- show edit action
- show final confirmation action

Submitting:

- disable fields that should not change during request
- disable duplicate submit
- show progress on primary action
- keep cancel behavior screen-specific

Queued offline:

- show outbox confirmation
- show delivery or task context
- show action recovery route
- do not claim backend success

Submitted:

- show success confirmation
- clear sensitive active form values
- invalidate cache through host
- route according to screen spec

Server validation error:

- map known field errors
- show safe non-field summary for unknown paths
- keep values
- include request ID only if safe

Conflict:

- show stale data or status conflict state
- offer refresh
- do not resubmit automatically

Not authorized:

- stop submit
- show permission state
- clear sensitive values if route is leaving

Session expired:

- stop submit
- route to session expired
- preserve only safe draft values according to app policy

## Form Submission Contract
Every host screen submit handler must follow this order:

1. Validate client schema.
2. If critical, enter review state.
3. If confirmation required, require explicit confirmation.
4. If offline, verify operation is approved for queue.
5. Create idempotency key when required.
6. Build typed payload from resolver output.
7. Submit through typed API client or offline outbox.
8. Map backend response through response schema.
9. Invalidate RTK Query tags through host policy.
10. Emit redacted analytics.
11. Clear or preserve form state according to screen success policy.

Submit must stop if:

- schema validation fails
- auth is absent
- role/capability is not present
- required source data is stale
- high-risk review is not complete
- offline policy denies queueing
- idempotency key could not be created for required operation
- typed API client cannot map operation

## Screen Integration Rules
Each screen spec owns:

- route
- role gate
- data prefetch
- default values
- submit endpoint
- success navigation
- cache invalidation
- copy variants
- role-safe field visibility
- high-risk review requirement

The form system owns:

- form provider
- field primitives
- validation wiring
- error summary
- dirty guard
- focus behavior
- submit lifecycle primitives
- redaction helpers
- test utilities

Screens must not:

- build one-off field components for common input types
- bypass `FormErrorSummary`
- serialize payload manually when schema output is available
- scatter field validation across component state
- store active values in RTK Query
- send analytics before redaction

## Role And Permission Rules
Forms must not infer authority from UI route alone.

Rules:

- Form rendering may hide fields based on role.
- Submit must rely on backend capability through typed API response.
- Read-only form mode must explain why edits are unavailable.
- Admin forms with missing capability must render read-only when the screen spec permits reading.
- Field staff must not see admin-only notes or raw IDs.
- Sender forms must not expose staff-only recovery fields.
- Receiver forms must not expose authenticated delivery fields before verification.

Role-specific behavior:

| Role | Form behavior |
| --- | --- |
| public visitor | public support, tracking entry, and policy forms only |
| receiver | delivery-scoped verification and tracking forms only |
| sender | sender delivery, payment, issue, profile, cancellation forms |
| station operator | station-scoped operational forms |
| driver | assigned-run operational forms |
| final-mile courier | assigned-doorstep operational forms |
| support admin | issue, notification, user read or limited forms by capability |
| finance admin | finance, pricing, refund, reconciliation forms by capability |
| ops admin | station, custody, launch, issue operations forms by capability |
| super admin | all admin forms allowed by backend capability |

## Privacy Rules
Sensitive form values require explicit handling.

Rules:

- Mask phone numbers outside active edit unless screen needs full visibility.
- Do not show receiver address on screens that do not need it.
- Do not show package scan code after scan except controlled review.
- Do not show proof storage paths.
- Do not show provider secrets or raw provider payload.
- Do not preserve OTP after failed or successful submit longer than required.
- Do not include sensitive values in URL params.
- Do not include sensitive values in local screen title.
- Do not include sensitive values in notification toast.
- Clear sensitive field state after successful submit where route no longer needs it.

## Performance Rules
Forms must stay fast on low-end devices.

Rules:

- avoid rerendering whole forms on every keystroke
- isolate fields with React Hook Form subscriptions
- avoid expensive validation loops while typing
- debounce filter forms only, not critical mutation forms
- do not run package-size table validation on every unrelated field edit
- lazy-load heavy admin form sections where route allows it
- avoid large option arrays in memory when remote search is required
- keep mobile field animations minimal
- keep offline queue payload serialization cheap

Performance targets:

- first usable form fields render within app shell budget
- keystrokes stay responsive on low-end Android devices
- admin pricing table remains usable with all required corridors
- station validation checklist remains visible without layout shift
- error summary render does not reflow entire page repeatedly

## Analytics
Required form events:

- `form_viewed`
- `form_field_error_seen`
- `form_submit_attempted`
- `form_submit_blocked`
- `form_review_viewed`
- `form_confirmed`
- `form_submit_succeeded`
- `form_submit_failed`
- `form_offline_queued`
- `form_dirty_exit_prompted`

Required event fields:

- `form_id`
- `operation_id`
- `surface`
- `role`
- `risk_level`
- `offline_eligible`
- `review_required`
- `invalid_field_count`
- `error_source`
- `error_code`
- `duration_bucket`
- `retry_count`

Forbidden event fields:

- raw input value
- phone
- OTP
- address
- issue text
- note text
- scan code
- proof reference
- payment provider reference
- refund reference
- exact route fee values unless analytics policy approves finance aggregates

## Testing Requirements
Every form infrastructure implementation must include tests.

Unit tests:

- factory wires Zod resolver
- schema registry requires operation metadata
- field error mapper converts Zod paths
- server validation maps to fields
- unknown server paths become form summary errors
- redaction removes sensitive values
- idempotency key lifecycle works
- offline eligibility is enforced
- dirty guard triggers only where required

Component tests:

- every field primitive renders label, hint, error, and disabled state
- field groups expose legend and option labels
- error summary links or focuses invalid fields
- mobile submit bar does not cover active field in layout tests where feasible
- admin review step shows exact values
- sensitive values are not in analytics payload

Integration tests:

- sender receiver details validates phone and address rules
- package details validates weight, size, fragile, and declared value
- delivery summary validates complete request schema
- payment method validates payer phone and amount
- sender issue create validates category, severity, summary, and description
- station validation validates day counts, checklist, blocker list, dates, and note
- pricing rule edit validates complete route table
- user access validates role/station relationship
- refund review validates policy factors
- offline staff form queues only approved action

E2E tests:

- failed submit focuses error summary and field
- successful sender delivery creation clears draft
- admin pricing edit requires review and confirmation
- station validation success shows backend-derived result
- offline staff custody action queues and appears in outbox
- session expiry during submit routes correctly
- permission denial during submit routes correctly

Accessibility tests:

- no input without accessible name
- no grouped choices without group label
- field errors are announced
- form summary is announced
- focus order is predictable
- keyboard can complete web forms
- reduced motion does not hide error feedback
- color is not the only error indicator

## Test IDs
Shared test ID pattern:

```text
form-{formId}
form-{formId}-summary
form-{formId}-field-{fieldName}
form-{formId}-field-{fieldName}-hint
form-{formId}-field-{fieldName}-error
form-{formId}-group-{groupName}
form-{formId}-submit
form-{formId}-review
form-{formId}-confirm
form-{formId}-dirty-guard
```

Rules:

- Use stable field names from schema path.
- Convert nested paths with hyphens.
- Do not include field values in test IDs.
- Do not include delivery IDs, phone numbers, tracking codes, or station IDs in test IDs.

## Implementation Plan For Claude Code
1. Add `react-hook-form` and `@hookform/resolvers` to the selected frontend package strategy.
2. Create shared form infrastructure module.
3. Create schema registry from shared contracts.
4. Create form factory with Zod resolver.
5. Create field error model and mapper.
6. Create `FormErrorSummary`.
7. Create basic field primitives.
8. Create grouped choice primitives.
9. Create mobile submit bar adapter.
10. Create admin review section primitive.
11. Create dirty guard.
12. Create redaction helper.
13. Create analytics bridge.
14. Create offline submit adapter for approved operations.
15. Wire one low-risk sender form.
16. Wire one high-risk admin form.
17. Wire one offline operations form.
18. Add tests for all infrastructure behavior before broad rollout.

Do not start by wiring every screen at once. Prove the system with one representative form from each risk class, then expand.

## Implementation Boundaries
Claude Code must not:

- implement actual screens from this documentation PR
- add fields outside API contracts
- build a second validation stack
- submit forms with untyped fetch calls
- use only HTML required attributes as validation
- rely on disabled buttons without explaining blocked state
- show toasts as the only validation feedback
- put active sensitive values into global state
- skip review for critical forms
- queue offline forms that are not approved
- mutate backend from review screens before final confirmation

## Completion Checklist
The form system spec is complete when an engineer can answer:

- Which schema validates this form?
- Which form ID identifies it?
- Which operation submits it?
- Is it offline eligible?
- Does it require review?
- Does it require idempotency?
- Which fields are sensitive?
- Which field errors are possible?
- How are server validation errors mapped?
- What gets logged?
- What gets redacted?
- What gets tested?
- What happens on session expiry?
- What happens on permission denial?
- What happens on conflict?
- What happens when the user leaves with dirty values?

## Final Quality Bar
The implementation is not acceptable unless:

- every backend-bound form uses Zod
- every backend-bound form uses the shared form factory
- every common field uses shared primitives
- every validation failure has field text and summary text
- every critical form has review or confirmation
- every idempotent mutation sends an idempotency key
- every offline form is explicitly approved by policy
- every sensitive field is redacted from analytics
- every form supports keyboard, screen reader, large text, and reduced motion
- every form maps backend errors into safe recovery states
- every form can be tested with stable IDs

This infrastructure spec is complete when Claude Code can build consistent, schema-bound, accessible, high-trust forms across Kra without inventing field rules, losing sensitive data boundaries, or weakening backend authority.

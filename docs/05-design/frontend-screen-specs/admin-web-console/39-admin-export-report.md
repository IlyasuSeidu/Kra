# Admin Export Report Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminExportReport` |
| Route | `/admin/exports/new` |
| Test id | `screen-admin-export-report` |
| Surface | Admin web console |
| Backend coverage | Approved admin list endpoints; no dedicated export job endpoint exists yet |
| Offline critical | No |
| Required read role | `ops_admin`, `finance_admin`, `support_admin`, or `super_admin`, scoped by selected report type |
| Required action role | Same as read role for selected source endpoint |
| Required states | `loading`, `configuring`, `generating`, `ready`, `failed`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens | `AdminAnalytics`, `AdminOverview`, `AdminFinanceSummary`, `AdminAuditEvents`, `AdminDeliveryExplorer` |
| Related screens | `AdminAnalytics`, `AdminDeliveryExplorer`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminWebhookEvents`, `AdminOutboundNotifications` |

## Purpose
`AdminExportReport` is the controlled export builder for admin-readable operational, finance, issue, audit, webhook, and analytics reports. It lets authorized admins select an approved report type, understand exactly which endpoint and fields will be used, generate a privacy-safe file in the browser, and download the file without exposing raw payloads or unsupported data.

The screen should answer:
- `Which reports can I export with my role?`
- `Which backend endpoint powers this report?`
- `Which fields will be included?`
- `Which sensitive fields are excluded?`
- `Is the data current enough to export?`
- `What format will be generated?`
- `What filename will be used?`
- `Did the export succeed or fail?`
- `What should I do if a report type is not supported yet?`

This screen is not a broad database export tool. It must not expose raw audit bodies, raw webhook payloads, proof assets, full receiver phone numbers unless explicitly approved, provider secrets, private staff notes, or fields not returned by approved endpoints.

## Strategic Role
Exporting is risky because it moves data out of the application boundary. A serious logistics platform needs exports for finance reviews, compliance checks, launch meetings, and operational audits, but every export must be deliberate, scoped, and traceable.

The screen must make the export contract visible before generation:
- report purpose
- source endpoint
- role access
- included fields
- excluded fields
- file format
- generated timestamp
- retention warning
- audit-sensitive notice

The user should never feel like they are pressing a mysterious `download everything` button.

## Audience
Primary users:
- finance admins exporting finance, refund, reconciliation, and webhook review records
- ops admins exporting delivery and operational queue reports
- support admins exporting issue queues and case review reports
- super admins exporting cross-functional launch and analytics reports

Secondary users:
- security reviewers checking export boundaries
- QA reviewers validating export field contracts
- business owner reviewing pilot reports
- engineering leads identifying future export endpoint requirements

Non-users:
- senders
- receivers
- drivers
- station operators
- final-mile couriers
- public web visitors

## Backend Reality
No dedicated export endpoint exists today.

Supported current strategy:
- fetch approved admin list endpoints
- transform returned safe fields into a client-generated file
- keep file generation local to the browser session
- do not persist generated report content on the server
- do not call unsupported report job endpoints

Approved endpoint families:
- `GET /v1/admin/overview`
- `GET /v1/admin/deliveries`
- `GET /v1/admin/finance`
- `GET /v1/admin/payment-reconciliation`
- `GET /v1/issues`
- `GET /v1/admin/audit-events`
- `GET /v1/admin/webhook-events`
- `GET /v1/admin/outbound-notifications`

Endpoint availability depends on role and existing backend guards.

Current backend limits:
- No server-side export job endpoint exists.
- No asynchronous export queue exists.
- No export history endpoint exists.
- No signed download URL endpoint exists.
- No server-generated PDF endpoint exists.
- No server-generated spreadsheet endpoint exists.
- No date-range export endpoint exists.
- No cursor-based full-dataset export exists.
- Some list endpoints return capped recent rows only.
- Some endpoints are role-restricted.
- Some endpoints intentionally omit raw sensitive fields.

Therefore:
- Export scope must be labeled as `current returned rows`.
- The UI must not claim full historical coverage unless the source endpoint guarantees it.
- The UI must mark unsupported full exports as future backend work.

## Source References
External references used for this screen:
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports treating data import and export as security-relevant events and excluding sensitive values from logs.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework/privacy-framework): supports privacy risk management, data governance, minimization, and accountability around data handling.
- [GOV.UK guidance on publishing files](https://www.gov.uk/guidance/how-to-publish-on-gov-uk/creating-and-updating-pages): supports clear file names and useful file metadata so exported files make sense after download.
- [GOV.UK attachment component documentation](https://docs.publishing.service.gov.uk/repos/govuk-design-guide/components/attachment.html): supports showing file format, file size, and download affordances clearly.
- [GOV.UK File upload component](https://design-system.service.gov.uk/components/file-upload/): supports warning about public-device privacy when making files available for preview or download.
- [WCAG 2.2 Status Messages](https://w3c.github.io/wcag/understanding/status-messages): supports announcing generation progress, success, and failure without unexpected focus movement.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/authorization-rules.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/07-api/api-contracts.md`
- `docs/11-analytics/kpis.md`
- `docs/11-analytics/dashboard-metrics.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/05-admin-delivery-explorer.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/23-admin-finance-summary.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/24-admin-payment-reconciliation.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/29-admin-issue-queue.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/32-admin-audit-events.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/36-admin-webhook-events.md`

## Design Thesis
Design this as a controlled report console: serious, explicit, security-aware, and calm. It should feel like preparing a governed business record, not clicking a casual download button.

Visual direction:
- step-based report builder
- left-side report type menu
- right-side source and field contract preview
- strong data-scope warning
- file readiness card
- muted security notices
- clear generated-file metadata
- no decorative charts

Restraint rule:
- Keep the user focused on choosing a report, checking the field contract, and generating a safe file. Do not add broad dashboards, unrelated filters, or unsupported file formats.

## Product Principle
An export is a data release. Every export must be scoped, explainable, role-appropriate, and recoverable if generation fails.

Each export must show:
- report type
- owner role
- source endpoint
- scope
- included field list
- excluded field list
- format
- generated timestamp
- retention warning

## Supported Report Types
### Analytics snapshot
Source:
- `GET /v1/admin/overview`

Allowed roles:
- all admin roles

Formats:
- CSV
- JSON

Scope:
- current overview snapshot

Fields:
- generated time
- delivery status counts
- payment status counts
- operational alert counts

Routes:
- source screen: `/admin/analytics`
- owner screen: `/admin`

### Delivery list report
Source:
- `GET /v1/admin/deliveries`

Allowed roles:
- all admin roles

Formats:
- CSV
- JSON

Scope:
- current returned admin delivery rows

Fields:
- delivery ID
- tracking code
- current status
- payment status
- origin station ID
- destination station ID
- latest occurred time

Excluded:
- receiver phone
- receiver address
- proof assets
- internal staff notes
- raw event metadata

### Finance summary report
Source:
- `GET /v1/admin/finance`

Allowed roles:
- `finance_admin`
- `super_admin`

Formats:
- CSV
- JSON

Scope:
- current finance summary response

Fields:
- payment status counts
- refund status counts
- review counts
- generated time

Excluded:
- provider secrets
- payer phone
- raw provider payload
- internal stack traces

### Payment reconciliation report
Source:
- `GET /v1/admin/payment-reconciliation`

Allowed roles:
- `finance_admin`
- `super_admin`

Formats:
- CSV
- JSON

Scope:
- current returned reconciliation rows

Fields:
- business date
- provider
- provider reference if returned by endpoint
- payment ID
- delivery ID
- internal status
- provider status
- amount
- review reason

Excluded:
- provider secrets
- raw provider payload
- customer phone

### Issue queue report
Source:
- `GET /v1/issues`

Allowed roles:
- support and admin roles as allowed by backend

Formats:
- CSV
- JSON

Scope:
- current returned issue rows

Fields:
- issue ID
- delivery ID
- category
- priority
- status
- created time
- updated time

Excluded:
- full issue description unless endpoint and policy approve
- receiver phone
- private customer messages
- proof assets

### Audit events report
Source:
- `GET /v1/admin/audit-events`

Allowed roles:
- admin roles allowed by backend

Formats:
- CSV
- JSON

Scope:
- current returned audit rows

Fields:
- audit event ID
- action
- actor role
- occurred time
- target type
- target ID if returned

Excluded:
- raw metadata body
- secrets
- session tokens
- request headers

### Webhook events report
Source:
- `GET /v1/admin/webhook-events`

Allowed roles:
- `finance_admin`
- `super_admin`

Formats:
- CSV
- JSON

Scope:
- current returned webhook rows

Fields:
- event ID
- provider
- provider reference if returned by endpoint
- event type
- amount
- processing status
- matched payment ID
- matched delivery ID
- received time

Excluded:
- raw payload
- signature material
- provider secrets

### Outbound notifications report
Source:
- `GET /v1/admin/outbound-notifications`

Allowed roles:
- `ops_admin`
- `support_admin`
- `super_admin`

Formats:
- CSV
- JSON

Scope:
- current returned notification rows

Fields:
- outbound notification ID
- status
- provider
- kind
- delivery ID
- tracking code
- event type
- attempt count
- updated time

Excluded:
- full recipient phone
- message body
- provider payload
- provider secret

## Unsupported Report Types
Do not offer:
- full database export
- raw audit export
- raw webhook payload export
- proof asset export
- customer address export
- full receiver phone export
- provider secret export
- staff account export
- all-time finance export
- route-level revenue export without approved endpoint

If product requires these later, they need server-side export jobs, audit events, data classification, approval flow, and legal review.

## Information Architecture
Desktop layout:
- Admin shell and breadcrumb.
- Header with export purpose and safety note.
- Step 1: choose report type.
- Step 2: review data source and scope.
- Step 3: choose format and field profile.
- Step 4: generate file.
- Ready state with file metadata and download action.
- Failure state with retry and source screen route.

Mobile layout:
- Header stack.
- Report type select.
- Field contract accordion.
- Format card.
- Generate button.
- Ready card.
- Safety notice.

## Step Flow
### Step 1: Choose Report
Fields:
- report type
- role availability indicator
- source endpoint
- owner role

Rules:
- Unavailable reports are shown disabled with reason.
- Disabled reason must mention role or missing backend support.
- Default selection should match entry screen when navigation state is provided.

### Step 2: Review Scope
Show:
- endpoint
- row scope
- freshness rule
- included fields
- excluded fields
- data sensitivity level

Rules:
- For capped endpoints, say `current returned rows`.
- For snapshot endpoint, say `current snapshot`.
- Do not say `all records` unless endpoint supports all records.

### Step 3: Choose Format
Formats:
- CSV
- JSON

Default:
- CSV for business reports
- JSON for technical reports only if user selects it

Rules:
- PDF is not supported until a document generation path exists.
- Spreadsheet workbook is not supported until a library path is added and verified.
- CSV uses safe column names.
- JSON includes a metadata wrapper with generated time and source endpoint.

### Step 4: Generate
Trigger:
- user clicks `Generate report`

Behavior:
- fetch source endpoint
- transform allowed fields only
- build file in memory
- show generated metadata
- enable download

Rules:
- Do not auto-download before user confirms generation.
- Do not persist file content in local storage.
- Do not keep file URL after user leaves route.
- Revoke object URL when user generates a new file or leaves the route.

## File Naming
Filename pattern:
```text
kra-{report-type}-{scope}-{yyyy-mm-dd}-{hhmm}.csv
```

Examples:
```text
kra-deliveries-current-2026-05-21-0545.csv
kra-webhook-events-current-2026-05-21-0545.json
```

Rules:
- lowercase
- hyphen-separated
- no customer names
- no phone numbers
- no provider references
- no user IDs
- include date and time
- use `.csv` or `.json`

## Generating State
Trigger:
- source fetch and transformation in progress

Copy:
```text
Generating report...
Keep this tab open until the file is ready.
```

UI:
- progress indicator
- selected report summary
- source endpoint label
- cancel or back only if safe

Rules:
- Disable duplicate generation clicks.
- Keep selected settings visible.
- Announce progress through a status message.
- If fetch fails, move to failed state.

## Ready State
Trigger:
- file blob created successfully

Copy:
```text
Report is ready.
Review the file details before downloading.
```

Show:
- report type
- format
- filename
- source endpoint
- generated time
- row count
- included field count
- excluded field notice

Actions:
- `Download report`
- `Generate again`
- `Open source screen`

Rules:
- Download button appears only after file is created.
- Ready state must not expose hidden fields in preview.
- File content remains in browser memory only.

## Failed State
Trigger:
- source fetch fails
- authorization fails
- transformation fails
- file creation fails

Copy:
```text
Report could not be generated.
Retry, or open the source screen to review the data directly.
```

Actions:
- `Retry`
- `Change report`
- `Open source screen`

Rules:
- Do not expose stack traces.
- Do not leave a stale download button visible.
- Keep selected report settings intact.
- For authorization failure, switch to not-authorized state.

## Not Authorized State
Trigger:
- user selects a report they cannot access
- source endpoint returns forbidden

Copy:
```text
You do not have permission to export this report.
Choose a report available to your role, or ask a super admin to review access.
```

Actions:
- `Choose another report`
- `Back to admin overview`

Rules:
- Do not fetch forbidden data again until selection changes.
- Do not preserve generated content after access failure.

## Session Expired State
Trigger:
- source endpoint returns unauthorized

Copy:
```text
Your admin session expired.
Sign in again to generate this report.
```

Actions:
- `Sign in`

Rules:
- Clear generated content.
- Clear object URL.
- Preserve selected report settings only if safe after reauthentication.

## API Error State
Trigger:
- validation error
- unsupported source state
- source endpoint unavailable

Copy:
```text
The report source is not available right now.
Use the source screen while the export flow is unavailable.
```

Actions:
- `Open source screen`
- `Retry`

## Report Field Contract Preview
The preview must show two lists before generation:
- Included fields
- Excluded fields

Rules:
- Included list must match actual output columns.
- Excluded list must name sensitive categories, not values.
- The user can expand technical field names.
- Field lists are static per report type unless backend contract changes.

## Output Rules
CSV:
- one header row
- UTF-8
- comma separated
- quote fields containing comma, quote, or newline
- escape quotes
- no formula injection
- prefix formula-like cell values with safe text handling

Formula-risk prefixes:
- `=`
- `+`
- `-`
- `@`
- tab
- carriage return

JSON:
- top-level metadata object
- `generatedAt`
- `reportType`
- `sourceEndpoint`
- `scope`
- `rows`
- safe fields only

No output:
- raw proof assets
- binary files
- provider signatures
- raw payloads
- private notes
- session tokens

## Privacy And Security
Export warnings:
- Generated files may contain operational or financial data.
- Do not download on shared or public devices unless required.
- Store reports only in approved business locations.
- Delete local copies when no longer needed.

Security controls:
- role gate before source fetch
- source endpoint authorization remains source of truth
- field allowlist per report type
- no persistent browser storage
- object URL revocation
- no hidden raw payload columns
- safe CSV cell escaping
- no sensitive analytics values

Audit note:
- The current backend has no export audit endpoint.
- The frontend should emit privacy-safe analytics for export start, success, and failure.
- Future server-side export must create audit events.

## Accessibility
Required:
- one `h1`: `Export report`
- step labels announced clearly
- selected report state conveyed by text and control state
- field lists accessible as semantic lists
- generation status uses live region
- ready and failed states announced
- download action has accessible name with report type and format
- keyboard can complete the full flow

Status messages:
- `Generating report`
- `Report is ready`
- `Report could not be generated`
- `Report download started`

Focus rules:
- changing report keeps focus on report control
- generate keeps focus on button until state changes
- ready state moves focus to ready heading only if generation was user-triggered
- failed state moves focus to error heading

## Responsive Behavior
Desktop, `>= 1200px`:
- report type rail on left
- field contract and generation panel on right
- ready file card in right panel

Laptop, `900px - 1199px`:
- report type grid above field contract
- generation panel below

Tablet, `700px - 899px`:
- report type select
- accordions for scope and fields
- sticky generate action if not covering content

Mobile, `< 700px`:
- single-column step cards
- report type select
- field lists collapsed by default
- large primary generate button
- ready card with clear download button

## Role Availability Matrix
| Report | ops admin | finance admin | support admin | super admin |
| --- | --- | --- | --- | --- |
| Analytics snapshot | Yes | Yes | Yes | Yes |
| Delivery list | Yes | Yes | Yes | Yes |
| Finance summary | No | Yes | No | Yes |
| Payment reconciliation | No | Yes | No | Yes |
| Issue queue | Yes, if backend allows | Yes, if backend allows | Yes | Yes |
| Audit events | Yes, if backend allows | Yes, if backend allows | Yes, if backend allows | Yes |
| Webhook events | No | Yes | No | Yes |
| Outbound notifications | Yes | No | Yes | Yes |

Rules:
- The UI may show role-specific disabled reports.
- Backend authorization remains final.
- If the matrix and backend disagree, backend wins and the UI shows not-authorized.

## Observability
Frontend events:
- `admin_export_report_viewed`
- `admin_export_report_type_selected`
- `admin_export_report_format_selected`
- `admin_export_report_generation_started`
- `admin_export_report_generation_ready`
- `admin_export_report_download_clicked`
- `admin_export_report_generation_failed`
- `admin_export_report_not_authorized`

Allowed analytics fields:
- report type
- format
- role class
- row count bucket
- field count
- source endpoint name
- result state

Forbidden analytics fields:
- delivery ID
- tracking code
- payment ID
- provider reference
- event ID
- issue ID
- audit event ID
- user ID
- phone number
- exported file content
- filename if it ever contains sensitive values

## Performance
Rules:
- Fetch only the selected source endpoint.
- Do not fetch all report sources at route load.
- Do not generate more rows than the endpoint returns.
- Avoid heavy file libraries for CSV/JSON.
- Stream-like generation is not required for capped current rows.
- Revoke object URLs.

UI targets:
- report type selection instant
- generation progress visible within one frame after click
- generated file metadata visible before download

## Edge Cases
Handle:
- zero returned rows
- missing optional fields
- forbidden source endpoint
- expired session mid-generation
- network failure after generation starts
- user changes report while generation is active
- user clicks generate twice
- CSV formula-risk values
- JSON generation for empty rows
- object URL creation failure
- browser blocks download
- public-device warning dismissed then report changed

## QA Scenarios
1. Admin opens `/admin/exports/new` and sees report type choices.
2. Report type list reflects role availability.
3. Selecting delivery report shows `/v1/admin/deliveries` as source.
4. Selecting finance report as finance admin is allowed.
5. Selecting finance report as ops admin is disabled or forbidden.
6. Field contract lists included and excluded fields before generation.
7. Generate calls only the selected source endpoint.
8. Generating state prevents duplicate clicks.
9. Ready state shows filename, format, row count, and source endpoint.
10. Download button appears only after generation succeeds.
11. Failed source fetch shows failed state without stale download button.
12. Unauthorized source response clears generated content.
13. Session expiry clears generated content.
14. CSV output escapes formula-risk values.
15. JSON output includes metadata wrapper.
16. Delivery export excludes receiver phone and address.
17. Audit export excludes raw metadata body.
18. Webhook export excludes raw payload and signature material.
19. Outbound notification export excludes full recipient phone and message body.
20. Export analytics exclude identifiers and file content.
21. Object URL is revoked after report change or route leave.
22. Mobile flow remains one-column and keyboard usable.
23. Screen reader hears generating and ready states.
24. Empty source rows still generate a valid file with headers and metadata.
25. Browser download failure shows a recovery state.

## Acceptance Criteria
Functional:
- Route is `/admin/exports/new`.
- Root test id is `screen-admin-export-report`.
- Uses only approved admin list endpoints.
- Does not call a non-existent export job endpoint.
- Supports CSV and JSON only.
- Shows source, scope, included fields, excluded fields, and role requirements before generation.
- Generates file only after explicit user action.
- Shows ready state with file metadata.
- Handles failed, unauthorized, and expired states.

Security:
- Exports use allowlisted fields.
- Raw payloads are excluded.
- Provider secrets are excluded.
- Full phone and address fields are excluded unless a future approved report allows them.
- Generated content is not persisted in local storage.
- Object URL is revoked.
- Analytics exclude sensitive values.

Accessibility:
- Full flow is keyboard usable.
- Generation and ready states are announced.
- Field contract is readable by assistive technology.
- Download button has clear accessible name.

Quality:
- Works with zero rows.
- Works with role-restricted reports.
- Works with source endpoint failure.
- Handles CSV cell safety.
- Does not imply full historical export when source endpoint is capped.

## Component Inventory
Required components:
- `AdminPageShell`
- `AdminBreadcrumb`
- `AdminExportHeader`
- `ReportTypeSelector`
- `ReportScopePanel`
- `ReportFieldContract`
- `ReportFormatSelector`
- `ReportSafetyNotice`
- `ReportGenerateButton`
- `ReportGeneratingState`
- `ReportReadyCard`
- `ReportFailedState`
- `ReportPermissionState`
- `AdminLiveRegion`

Optional components:
- `ReportFieldDisclosure`
- `ReportPublicDeviceWarning`
- `ReportSourceRouteLink`
- `ReportFilenamePreview`

Do not build:
- server export job UI
- export history list
- raw audit export
- raw webhook export
- proof asset export
- PDF generator
- spreadsheet workbook generator
- scheduled report form

## Implementation Notes For Claude Code
Build sequence:
1. Add route `/admin/exports/new`.
2. Add report type configuration with endpoint, roles, fields, exclusions, and formats.
3. Render selection and field contract.
4. Gate unavailable reports by role.
5. Implement source endpoint fetch only after generation click.
6. Transform response through report field allowlist.
7. Generate CSV and JSON safely.
8. Render ready state with metadata and download link.
9. Revoke object URLs on cleanup.
10. Add failed and permission states.
11. Add accessibility live-region announcements.
12. Add privacy-safe analytics.
13. Add tests for every report type and field exclusion.

Implementation boundaries:
- Do not add backend endpoints.
- Do not fetch all sources upfront.
- Do not include sensitive fields not explicitly allowed.
- Do not persist generated files.
- Do not implement PDF or workbook output.

## Test Plan
Unit tests:
- report type role availability
- endpoint selection
- field allowlist transform
- excluded field enforcement
- CSV escaping
- JSON metadata wrapper
- filename generation
- object URL cleanup helper
- analytics sanitizer

Component tests:
- configuring state
- generating state
- ready state
- failed state
- unauthorized state
- session expired state
- field contract preview
- public-device warning
- disabled report reason

Integration tests:
- delivery export happy path
- finance export role-gated path
- payment reconciliation export happy path
- issue export safe field path
- audit export excludes metadata body
- webhook export excludes raw payload
- outbound notification export excludes full phone
- source endpoint failure path

Accessibility tests:
- heading structure
- report selector keyboard flow
- generate live-region update
- ready live-region update
- download accessible name
- error focus behavior

## Content Checklist
Before implementation is accepted:
- Every report has source endpoint.
- Every report has role rule.
- Every report has included fields.
- Every report has excluded fields.
- Every report has scope copy.
- No report promises full historical coverage.
- No raw payload export appears.
- No PDF or workbook output appears.
- Privacy warning is visible before generation.
- Ready state shows file metadata before download.

## Open Backend Gaps For Future Work
Not required for current export builder:
- server-side export job endpoint
- export audit events
- export history endpoint
- signed download URLs
- server-generated PDFs
- spreadsheet workbook generation
- cursor-based full dataset export
- date range export
- approval workflow for sensitive exports
- privacy request export workflow

These gaps should be listed as future work, not hidden behind inactive buttons.

## Final Screen Contract
`AdminExportReport` is complete when authorized admins can select an approved report, review source and field boundaries, generate a CSV or JSON file from current returned rows, download it safely, and recover from failures without leaking sensitive data or implying unsupported full-system export capability.

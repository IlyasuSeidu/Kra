# Export Report Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `ExportReportModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screen | `AdminExportReport` |
| Secondary host screens | `AdminAnalytics`, `AdminDeliveryExplorer`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminWebhookEvents`, `AdminOutboundNotifications` |
| Test id root | `modal-export-report` |
| Backend coverage | Approved admin list endpoints; no dedicated export endpoint exists |
| Browser mutation operation | None |
| Server export operation | None in current backend |
| Supported formats | CSV, JSON |
| Unsupported formats | PDF, XLSX, server-generated ZIP, proof asset bundle |
| Offline critical | No |
| Data sensitivity | Delivery, finance, issue, audit, webhook, notification, and analytics records |
| Required modal states | `closed`, `opening`, `configuring`, `reviewing_scope`, `generating`, `ready`, `failed`, `not_authorized`, `session_expired`, `api_error` |
| Related specs | `AdminExportReport`, `AdminDeliveryExplorer`, `AdminFinanceSummary`, `AdminPaymentReconciliation`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminWebhookEvents`, `AdminOutboundNotifications`, `AuditSensitiveActionAckModal` |

## Purpose
`ExportReportModal` is the controlled in-context export flow for admin-readable operational, finance, support, audit, webhook, notification, and analytics records.

The current backend does not provide a dedicated export job endpoint. The modal must therefore generate only CSV or JSON files in the browser from approved source endpoints and approved field allowlists.

The modal must answer:
- `Which report is being exported?`
- `Which endpoint powers this report?`
- `Which role is allowed to read the source data?`
- `What exact scope will the file cover?`
- `Which fields will be included?`
- `Which fields are intentionally excluded?`
- `Which file format will be generated?`
- `What filename will be used?`
- `Did generation succeed or fail?`
- `What safe recovery path exists if generation fails?`

The most important boundary is:
```text
This is a current returned rows export, not a full historical export.
```

## Product Job
Admins need export files for launch meetings, finance reconciliation, operational review, issue follow-up, and audit evidence. But exports move data outside the product boundary, so the UI must make scope, fields, and privacy rules explicit before any file is generated.

The modal should:
- Let a host screen start with a sensible report type.
- Show the source endpoint before generation.
- Show included and excluded fields before generation.
- Generate only allowlisted fields.
- Use CSV or JSON only.
- Keep generated content in browser memory only.
- Revoke object URLs after use.
- Avoid storing report content in local storage or analytics.

## Strategic Role
Exporting is not a convenience action; it is a data release. The modal must behave like a controlled operations record builder, not a casual download prompt.

A serious logistics company needs exports that are:
- scoped
- explainable
- role-aware
- privacy-safe
- repeatable
- accessible
- recoverable
- honest about backend limits

The modal must stop three dangerous outcomes:
- broad export that includes fields the endpoint did not approve
- file generation that claims full history from capped list endpoints
- analytics or browser storage that captures exported content

## Primary Users
Primary users:
- `ops_admin` exporting delivery and operational queue context.
- `finance_admin` exporting finance, reconciliation, and webhook reports.
- `support_admin` exporting issue and notification reports.
- `super_admin` exporting any approved admin report.

Secondary users:
- Security reviewers checking export boundaries.
- QA reviewers validating field allowlists.
- Business owners preparing pilot readiness material.
- Engineering leads identifying future server-side export requirements.
- Claude Code implementing the frontend later.

Non-users:
- sender
- receiver
- station operator
- driver
- final-mile courier
- public visitor
- unauthenticated user

## User Goals
Admins use the modal to:
- Choose a report.
- Confirm they are allowed to export it.
- Understand what data will leave the product.
- Choose CSV or JSON.
- Generate a file.
- Download only after the file is ready.
- Recover from source fetch failures.
- Avoid exporting sensitive fields by accident.

They should never have to guess whether a hidden field is included.

## Non-Goals
Do not build these into the current modal:
- Server export job creation.
- Export history.
- Scheduled report delivery.
- Email report delivery.
- Shared download links.
- Signed URL generation.
- Server-generated PDF.
- Spreadsheet workbook generation.
- Full database export.
- Full historical export.
- Date-range export unless a source endpoint supports it.
- Raw audit metadata export.
- Raw webhook payload export.
- Proof asset export.
- Provider secret export.
- Full receiver phone export.
- Customer address export.
- Staff user export.
- Route-level revenue export without approved endpoint support.
- Background generation after modal closes.
- Automatic download before explicit generate action.

If any of these are required later, backend export jobs, audit events, legal review, and data classification must exist first.

## Hard Backend Reality
No dedicated export route exists today.

Unsupported current routes:
- `POST /v1/admin/exports`
- `GET /v1/admin/exports`
- `GET /v1/admin/exports/:id`
- `POST /v1/admin/reports`
- `GET /v1/admin/reports/:id/download`
- any signed export download route

Supported current strategy:
- user chooses one approved report type
- frontend fetches one approved source endpoint
- frontend transforms only allowlisted fields
- frontend creates CSV or JSON in memory
- frontend creates a temporary object URL
- user explicitly downloads the ready file
- frontend revokes the object URL on cleanup

Approved source endpoints:
- `GET /v1/admin/overview`
- `GET /v1/admin/deliveries`
- `GET /v1/admin/finance`
- `GET /v1/admin/payment-reconciliation`
- `GET /v1/issues`
- `GET /v1/admin/audit-events`
- `GET /v1/admin/webhook-events`
- `GET /v1/admin/outbound-notifications`

Rules:
- Fetch only the selected source endpoint.
- Do not fetch every endpoint at modal open.
- Do not claim more rows than the endpoint returns.
- Do not bypass source endpoint authorization.
- Do not add fields from local cache unless those fields are also in the selected report allowlist.

## Source Endpoint Permissions
Source endpoint gates:
- `GET /v1/admin/overview`: admin role required.
- `GET /v1/admin/deliveries`: admin role required.
- `GET /v1/admin/finance`: `finance_admin` or `super_admin`.
- `GET /v1/admin/payment-reconciliation`: `review_reconciliation` capability.
- `GET /v1/issues`: authenticated; admin-wide issue export should be limited to admin roles.
- `GET /v1/admin/audit-events`: admin role required.
- `GET /v1/admin/webhook-events`: `review_reconciliation` capability.
- `GET /v1/admin/outbound-notifications`: `ops_admin`, `support_admin`, or `super_admin`.

Backend authorization remains final. If the modal role matrix and endpoint response disagree, the backend response wins and the modal must show `not_authorized`.

## Source References
External references used for this modal:
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection): supports escaping formula-risk cells before CSV export.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports excluding sensitive values from logs and analytics.
- [MDN URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static): supports temporary object URL creation for browser-generated files.
- [MDN URL.revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static): supports cleanup after generated file URLs are no longer needed.
- [MDN HTML download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download): supports explicit filename handling for browser downloads.
- [RFC 4180 CSV format](https://www.rfc-editor.org/rfc/rfc4180): supports CSV quote, delimiter, and line handling.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework): supports data minimization, governance, and privacy risk management.
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus management, modal semantics, and keyboard behavior.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing generation, ready, and failed states.
- [GOV.UK attachment component](https://docs.publishing.service.gov.uk/repos/govuk-design-guide/components/attachment.html): supports clear file metadata around downloadable files.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/39-admin-export-report.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/08-security/audit-trail-spec.md`
- `docs/08-security/authorization-rules.md`
- `docs/07-api/api-contracts.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`
- `services/api/src/admin.ts`
- `services/api/src/issues.ts`

## Design Thesis
Design this as a governed export drawer: compact, deliberate, and evidence-forward. The admin should see exactly what file will be produced before generation, then see exact file metadata before download.

Visual direction:
- centered modal or right-side drawer depending on host density
- step indicator with `Report`, `Scope`, `Format`, `Generate`
- strong privacy warning near the top
- field contract preview in a bordered panel
- generated file card with filename, format, row count, and source
- no decorative graphics
- no broad dashboard elements

Tone:
- serious
- direct
- privacy-aware
- specific about limits
- no legal overstatement

## Product Principle
The file is not safe because it is small. The file is safe only if the fields are approved, the role is allowed, and the scope is honest.

Priority order:
1. Role and endpoint authorization.
2. Field allowlist.
3. Scope clarity.
4. CSV and JSON safety.
5. Object URL cleanup.
6. Clear recovery if generation fails.

## Modal Variants
Supported variants:
- `configure`: user chooses report, scope, and format.
- `confirm`: host already chose report and modal asks user to review fields before generation.
- `ready`: host generated data and modal shows download metadata.

Recommended default:
- `configure` when opened from `/admin/exports/new`
- `confirm` when opened from a source screen, such as `/admin/webhook-events`

Do not build a variant that immediately downloads without user confirmation.

## Modal Entry Points
Primary entry:
- `/admin/exports/new` opens or embeds export flow.

Secondary entries:
- `AdminAnalytics`: export analytics snapshot.
- `AdminDeliveryExplorer`: export current delivery rows.
- `AdminFinanceSummary`: export finance summary.
- `AdminPaymentReconciliation`: export reconciliation rows.
- `AdminIssueQueue`: export current issue rows.
- `AdminAuditEvents`: export audit rows.
- `AdminWebhookEvents`: export webhook rows.
- `AdminOutboundNotifications`: export notification rows.

Do not open from:
- public web
- sender mobile
- receiver public tracking
- station operator mobile
- driver mobile
- final-mile courier mobile

## State Model
States:
- `closed`: modal is not visible.
- `opening`: host is resolving initial report type and permissions.
- `configuring`: user can choose report and format.
- `reviewing_scope`: selected report is ready for final review before generation.
- `generating`: source endpoint request, transform, and file creation are running.
- `ready`: file blob exists and download is available.
- `failed`: source fetch, transform, file creation, or download preparation failed.
- `not_authorized`: selected endpoint is forbidden or role matrix blocks it.
- `session_expired`: auth expired before or during generation.
- `api_error`: source endpoint returned a non-auth API error.

State rule:
- A generated file must exist only in `ready`.
- Leaving `ready` must revoke the object URL.
- Closing the modal must revoke the object URL.
- Changing report type must clear generated content.

## Report Catalog
### Analytics Snapshot
Report key:
```text
analytics_snapshot
```

Source:
```http
GET /v1/admin/overview
```

Scope:
```text
current overview snapshot
```

Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Allowed fields:
- `generatedAt`
- `deliveryStatusCounts.status`
- `deliveryStatusCounts.count`
- `paymentStatusCounts.status`
- `paymentStatusCounts.count`
- `operationalAlerts.openIssueLikeDeliveries`
- `operationalAlerts.unmatchedWebhookEvents`
- `operationalAlerts.manualReviewWebhookEvents`

Excluded fields:
- raw delivery rows
- raw payment rows
- raw issue descriptions
- customer identifiers

### Delivery List
Report key:
```text
delivery_list
```

Source:
```http
GET /v1/admin/deliveries
```

Scope:
```text
current returned admin delivery rows
```

Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Allowed fields:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `senderId`
- `latestOccurredAt`
- `receiverName`

Excluded fields:
- receiver phone
- receiver address
- delivery instructions
- proof assets
- raw timeline metadata
- staff notes

### Finance Summary
Report key:
```text
finance_summary
```

Source:
```http
GET /v1/admin/finance
```

Scope:
```text
current finance summary and current returned payment rows
```

Allowed roles:
- `finance_admin`
- `super_admin`

Allowed fields:
- `generatedAt`
- `totals.confirmedAmountGhs`
- `totals.refundPendingAmountGhs`
- `totals.refundedAmountGhs`
- `payments.paymentId`
- `payments.deliveryId`
- `payments.provider`
- `payments.providerReference`
- `payments.status`
- `payments.amountGhs`
- `payments.initiatedAt`
- `payments.verifiedAt`
- `payments.refundAmountGhs`

Excluded fields:
- provider secrets
- payer phone
- raw provider payload
- request headers
- stack traces

### Payment Reconciliation
Report key:
```text
payment_reconciliation
```

Source:
```http
GET /v1/admin/payment-reconciliation
```

Scope:
```text
current returned reconciliation rows
```

Allowed roles:
- `finance_admin`
- `super_admin`

Allowed fields:
- `generatedAt`
- `businessDate`
- `provider`
- `providerReference`
- `paymentId`
- `deliveryId`
- `quotedAmountGhs`
- `chargedAmountGhs`
- `refundedAmountGhs`
- `internalPaymentStatus`
- `providerPaymentStatus`
- `mismatchType`
- `reconciliationAttemptCount`
- `initiatedAt`
- `lastReconciliationAt`
- `reviewRequiredAt`
- `reviewedBy`
- `reviewedAt`

Special current field:
- backend response also includes `csv`; the modal must not trust that field blindly if the selected output is generated through the frontend allowlist

Excluded fields:
- provider secrets
- raw provider payload
- customer phone
- customer address

### Issue Queue
Report key:
```text
issue_queue
```

Source:
```http
GET /v1/issues
```

Scope:
```text
current returned issue rows
```

Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Allowed fields:
- `issueId`
- `deliveryId`
- `status`
- `severity`
- `category`
- `summary`
- `reporter.actorRole`
- `createdAt`
- `updatedAt`
- `escalatedAt`
- `resolvedAt`
- `closedAt`
- `resolutionCode`

Excluded fields:
- full issue description by default
- resolution note by default
- reporter actor ID by default
- private customer message text
- receiver phone
- proof assets

Reason:
- `description` and `resolutionNote` can include sensitive human-entered text, so they need a future explicit export profile before inclusion.

### Audit Events
Report key:
```text
audit_events
```

Source:
```http
GET /v1/admin/audit-events
```

Scope:
```text
current returned audit rows
```

Allowed roles:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Allowed fields:
- `eventId`
- `requestId`
- `action`
- `actorRole`
- `occurredAt`
- `stationId`
- `targetType`
- `targetId`

Excluded fields:
- `metadata`
- `actorId` by default
- session tokens
- request headers
- raw proof asset URLs
- secrets

### Webhook Events
Report key:
```text
webhook_events
```

Source:
```http
GET /v1/admin/webhook-events
```

Scope:
```text
current returned trusted webhook rows
```

Allowed roles:
- `finance_admin`
- `super_admin`

Allowed fields:
- `generatedAt`
- `eventId`
- `provider`
- `providerEventId`
- `providerReference`
- `eventType`
- `amountGhs`
- `currency`
- `occurredAt`
- `receivedAt`
- `processingStatus`
- `matchedPaymentId`
- `matchedDeliveryId`
- `processingNotes`

Excluded fields:
- raw payload
- signature material
- provider secrets
- request headers

### Outbound Notifications
Report key:
```text
outbound_notifications
```

Source:
```http
GET /v1/admin/outbound-notifications
```

Scope:
```text
current returned outbound notification rows
```

Allowed roles:
- `ops_admin`
- `support_admin`
- `super_admin`

Allowed fields:
- `generatedAt`
- `outboundNotificationId`
- `channel`
- `provider`
- `kind`
- `status`
- `deliveryId`
- `trackingCode`
- `eventType`
- `stationName`
- `attemptCount`
- `maxAttempts`
- `nextAttemptAt`
- `createdAt`
- `updatedAt`
- `lastAttemptAt`
- `sentAt`
- `lastError.name`
- `lastError.code`

Excluded fields:
- full `recipientPhone`
- `dedupeKey` by default
- `lastError.message` by default
- message body
- provider payload
- provider secret

## Report Type Selector
The selector must show:
- report name
- short purpose
- source endpoint
- scope label
- role availability
- supported formats

Unavailable report behavior:
- disabled row or card
- clear reason
- no source fetch
- no generation

Disabled reasons:
- `Your role cannot export this report.`
- `Backend support is not available for this report.`
- `This report needs a server-side export job before it can be offered.`

Do not hide unavailable reports if their presence helps admins understand why an option is blocked.

## Scope Review
The modal must show:
- source endpoint
- operation ID
- scope label
- freshness timestamp if known
- row cap if known
- included field list
- excluded field list
- data sensitivity warning

Required scope labels:
- `current overview snapshot`
- `current returned admin delivery rows`
- `current finance summary and current returned payment rows`
- `current returned reconciliation rows`
- `current returned issue rows`
- `current returned audit rows`
- `current returned trusted webhook rows`
- `current returned outbound notification rows`

Forbidden scope labels:
- `all data`
- `complete history`
- `full database`
- `all records`
- `everything`

## Format Selection
Supported:
- CSV
- JSON

Defaults:
- CSV for delivery, finance, reconciliation, issue, audit, webhook, and notification reports.
- JSON for analytics snapshot only if host requests technical export.

Unsupported:
- PDF
- XLSX
- ZIP
- image files
- proof asset bundle

If unsupported format is requested by host:
- render `api_error` or configuration error
- do not generate
- tell user the format is not supported in current export contract

## CSV Rules
CSV output must:
- use one header row
- use UTF-8 text
- use comma-separated cells
- quote fields containing comma, quote, or newline
- escape quotes by doubling them
- use safe line endings consistently
- preserve empty optional fields as empty cells
- block formula injection

Formula-risk prefixes:
- `=`
- `+`
- `-`
- `@`
- tab
- carriage return

Safe handling:
- prefix formula-risk cells with a safe leading apostrophe or equivalent neutral text strategy
- apply to every string cell, including IDs and notes
- test the helper independently

CSV must not:
- include hidden columns
- include raw JSON blobs
- include raw metadata
- include full phone numbers where excluded
- include object URLs

## JSON Rules
JSON output must use a metadata wrapper:
```json
{
  "metadata": {
    "reportType": "delivery_list",
    "format": "json",
    "sourceEndpoint": "GET /v1/admin/deliveries",
    "scope": "current returned admin delivery rows",
    "generatedAt": "2026-05-21T18:45:00.000Z",
    "rowCount": 12
  },
  "rows": []
}
```

Rules:
- Include only allowlisted fields.
- Do not copy source response wholesale.
- Do not include unsupported source fields.
- Do not include raw error objects.
- Do not include stack traces.
- Do not include tokens.

## Filename Rules
Pattern:
```text
kra-{report-key}-{scope-key}-{yyyy-mm-dd}-{hhmm}.{extension}
```

Scope key:
```text
current
```

Examples:
```text
kra-delivery-list-current-2026-05-21-1845.csv
kra-webhook-events-current-2026-05-21-1845.json
```

Rules:
- lowercase
- hyphen-separated
- no spaces
- no customer names
- no phone numbers
- no provider references
- no payment IDs
- no delivery IDs
- no issue IDs
- no event IDs
- extension must match selected format

## Generation Flow
Current flow:
1. User opens modal.
2. Modal resolves initial report type.
3. User reviews scope and field contract.
4. User chooses CSV or JSON.
5. User clicks `Generate report`.
6. Modal fetches one source endpoint.
7. Modal transforms response through allowlist.
8. Modal creates file content in memory.
9. Modal creates blob and object URL.
10. Modal shows ready card.
11. User clicks `Download report`.
12. Modal records privacy-safe analytics only.
13. Modal revokes object URL on close, report change, regeneration, or route leave.

No server-side file is created.

## Generating State
Copy:
```text
Generating report...
Keep this tab open until the file is ready.
```

Show:
- report type
- format
- source endpoint
- scope
- progress indicator

Rules:
- disable report changes while transforming unless cancel logic is explicit
- disable generate button
- hide download button
- announce `Generating report`
- do not close automatically
- do not auto-download

If user closes during generation:
- cancel local transformation if possible
- ignore late promise resolution
- clear partial file content
- no object URL should remain active

## Ready State
Copy:
```text
Report is ready.
Review the file details before downloading.
```

Show:
- report name
- filename
- format
- source endpoint
- scope
- generated time
- row count
- included field count
- excluded categories

Actions:
- `Download report`
- `Generate again`
- `Change report`
- `Open source screen`
- `Close`

Rules:
- download button appears only after file creation succeeds
- download button uses the `download` filename
- object URL exists only in memory
- generated content is not previewed in full
- ready card must not show hidden fields

## Download Behavior
When user clicks download:
- trigger browser download from object URL
- preserve filename from filename rules
- announce `Report download started`
- keep modal open so user can retry if browser blocks it

If browser blocks download:
- show failed state with `Download did not start`
- keep generated file available until user changes report or closes modal

Do not:
- use server upload
- use email
- write content to local storage
- write content to IndexedDB
- add report content to URL
- log report content

## Object URL Lifecycle
Create object URL only after blob is ready.

Revoke object URL when:
- modal closes
- report type changes
- format changes after generation
- user generates a new file
- source data changes after regeneration
- component unmounts
- auth session changes

Never:
- store object URL in local storage
- include object URL in analytics
- leave old object URLs active after regeneration

## Field Allowlist Enforcement
Each report type must have:
- `reportKey`
- `displayName`
- `sourceEndpoint`
- `operationId`
- `allowedRoles`
- `allowedFormats`
- `scopeLabel`
- `includedFields`
- `excludedFields`
- `mapRows(response)`

Rules:
- `mapRows` must construct output from allowed fields only.
- Missing optional fields become empty cells in CSV.
- Missing optional fields may be omitted or set to `null` in JSON if consistent.
- Extra fields returned by backend are ignored unless explicitly added to allowlist.
- Field allowlist tests must fail if a sensitive field appears in output.

## Privacy Warning
Show before generation:
```text
Generated reports may contain operational or financial data. Download only on an approved device and store the file in an approved business location.
```

Show after ready:
```text
Delete local copies when they are no longer needed under Kra retention policy.
```

Do not use alarmist language. Be clear and specific.

## Permission Matrix
| Report | ops admin | finance admin | support admin | super admin |
| --- | --- | --- | --- | --- |
| Analytics snapshot | Yes | Yes | Yes | Yes |
| Delivery list | Yes | Yes | Yes | Yes |
| Finance summary | No | Yes | No | Yes |
| Payment reconciliation | No | Yes | No | Yes |
| Issue queue | Yes | Yes | Yes | Yes |
| Audit events | Yes | Yes | Yes | Yes |
| Webhook events | No | Yes | No | Yes |
| Outbound notifications | Yes | No | Yes | Yes |

Backend response wins over this matrix.

If forbidden:
- clear generated content
- revoke object URL
- show `not_authorized`
- do not display returned data

## Error Handling
| Condition | State | Copy | Recovery |
| --- | --- | --- | --- |
| source endpoint returns `FORBIDDEN` | `not_authorized` | You do not have permission to export this report. | Choose another report |
| source endpoint returns `UNAUTHORIZED` | `session_expired` | Your admin session expired. | Sign in again |
| source endpoint returns `VALIDATION_ERROR` | `api_error` | The report request was not valid. | Change report |
| source endpoint returns `RATE_LIMITED` | `failed` | Report source is temporarily rate limited. | Try again later |
| network failure | `failed` | Report could not be generated. | Retry |
| transform failure | `failed` | Report fields could not be prepared safely. | Open source screen |
| object URL failure | `failed` | Browser could not prepare the file. | Retry |
| unsupported format | `api_error` | This file format is not supported yet. | Choose CSV or JSON |

Do not show raw stack traces.

## Accessibility
Dialog:
- `role="dialog"`
- `aria-modal="true"`
- title referenced by `aria-labelledby`
- scope warning referenced by `aria-describedby`

Keyboard:
- focus moves to modal title on open
- `Tab` stays inside modal
- `Escape` closes unless a critical cleanup action is running
- focus returns to trigger on close
- all controls are reachable without pointer input

Live regions:
- `Generating report`
- `Report is ready`
- `Report could not be generated`
- `Report download started`

Screen reader requirements:
- report selector announces selected report
- disabled report explains why
- field lists are semantic lists
- ready file card has accessible name
- download button includes report type and format

Motion:
- short fade and slide
- no spinner-only progress
- reduced motion disables transition

## Responsive Behavior
Desktop:
- modal width between `720px` and `860px`
- report selector on left if space allows
- scope and field contract on right
- footer actions aligned right

Tablet:
- report selector becomes top segmented list or select
- field contract stacks below scope
- footer remains sticky

Mobile:
- full-screen sheet
- single-column steps
- field lists collapsed by default
- sticky bottom action bar
- download button full width in ready state

No horizontal scroll is allowed.

## Host Integration Contract
Props:
```ts
type ExportReportModalProps = {
  open: boolean;
  initialReportKey?: AdminReportKey;
  sourceContext?: {
    screen: string;
    query?: Record<string, string>;
  };
  currentUserRole: AdminRole;
  onClose: () => void;
  onOpenSourceScreen: (reportKey: AdminReportKey) => void;
};
```

Report key:
```ts
type AdminReportKey =
  | "analytics_snapshot"
  | "delivery_list"
  | "finance_summary"
  | "payment_reconciliation"
  | "issue_queue"
  | "audit_events"
  | "webhook_events"
  | "outbound_notifications";
```

Format:
```ts
type ExportFormat = "csv" | "json";
```

Do not add a server export job ID prop until backend support exists.

## Source Query Policy
Default queries:
- delivery list: no extra filter unless host supplies a safe current filter
- payment reconciliation: preserve supported `reviewReason` only
- issue queue: preserve supported `status`, `severity`, and `deliveryId` only
- audit events: preserve supported `actorId`, `targetType`, `targetId`, and `limit` only if authorized
- webhook events: preserve supported `processingStatus` only
- outbound notifications: preserve supported `status` only

Limit:
- use endpoint defaults unless host already has a safe supported limit
- never request more than endpoint max `100`

Unknown query keys:
- drop them
- do not serialize them into file metadata

## Analytics
Allowed events:
- `export_report_modal_opened`
- `export_report_type_selected`
- `export_report_format_selected`
- `export_report_generation_started`
- `export_report_generation_ready`
- `export_report_download_clicked`
- `export_report_generation_failed`
- `export_report_not_authorized`
- `export_report_modal_closed`

Allowed properties:
- `reportKey`
- `format`
- `role`
- `sourceScreen`
- `sourceEndpointName`
- `rowCountBucket`
- `fieldCount`
- `result`

Forbidden properties:
- filename
- file content
- delivery ID
- tracking code
- payment ID
- provider reference
- issue ID
- audit event ID
- notification ID
- user ID
- phone number
- raw error body

## Security Requirements
The modal must:
- use source endpoint authorization
- use report-specific field allowlists
- block unsupported formats
- escape CSV formula-risk cells
- avoid raw payloads
- avoid private notes
- avoid full phone numbers unless future approved profile exists
- avoid address fields
- avoid proof asset links
- avoid provider secrets
- avoid session tokens
- clear generated content after close
- revoke object URLs
- keep export content out of analytics

The modal must not:
- persist report content in local storage
- persist report content in IndexedDB
- add report content to URL params
- print report content to console
- expose report content in error telemetry

## Future Backend Gate
Only add server-side export support after backend implements:
- export job route
- export job status route
- signed download URL route
- export audit event
- role-specific export policy
- report type schema
- field profile schema
- retention policy for generated reports
- deletion policy for generated reports
- tests for access, field redaction, and expired links

Candidate future route set:
```http
POST /v1/admin/exports
GET /v1/admin/exports/:exportId
GET /v1/admin/exports/:exportId/download
```

Do not reference these routes as current implementation.

## Testing Requirements
Unit tests:
- report catalog contains every supported report key
- role matrix disables unavailable reports
- backend forbidden clears generated content
- field allowlist excludes sensitive fields
- CSV escaping quotes, commas, newlines, and formula-risk prefixes
- JSON wrapper contains metadata and rows only
- filename builder excludes identifiers
- object URL cleanup runs on close and regeneration
- unknown query keys are dropped
- analytics sanitizer strips identifiers

Component tests:
- configuring state renders report selector
- reviewing scope shows source endpoint
- field contract shows included and excluded fields
- generating state disables duplicate clicks
- ready state shows file metadata
- failed state hides stale download button
- not authorized hides data
- session expired clears file content
- unsupported format is blocked

Integration tests:
- delivery list export calls only `/v1/admin/deliveries`
- finance summary export is blocked for non-finance admin
- payment reconciliation export calls only `/v1/admin/payment-reconciliation`
- issue queue export excludes description and resolution note by default
- audit export excludes metadata
- webhook export excludes raw payload
- outbound notification export excludes full recipient phone
- changing report revokes previous object URL

Accessibility tests:
- modal has accessible title and description
- focus traps and returns
- disabled reports have reason text
- generating state is announced
- ready state is announced
- download button has report type and format in accessible name
- keyboard can complete full flow

E2E scenarios:
- `e2e-export-delivery-current-rows`: generate delivery CSV from current returned rows.
- `e2e-export-finance-role-gated`: non-finance admin cannot generate finance report.
- `e2e-export-webhook-safe-fields`: webhook JSON excludes raw payload and signatures.
- `e2e-export-notification-redaction`: notification CSV excludes full recipient phone.
- `e2e-export-audit-metadata-excluded`: audit export excludes metadata object.
- `e2e-export-object-url-cleanup`: changing report revokes prior URL.
- `e2e-export-api-failure-recovery`: source failure shows retry and source route.

## Done Criteria
The modal is complete when:
1. It supports only approved report types.
2. It fetches only one selected source endpoint per generation.
3. It shows source, scope, format, included fields, and excluded fields before generation.
4. It blocks reports the user role cannot access.
5. It uses backend authorization as final truth.
6. It supports CSV and JSON only.
7. It uses field allowlists for every report.
8. It escapes CSV formula-risk values.
9. It creates files in browser memory only.
10. It revokes object URLs on close, change, and regeneration.
11. It never persists report content in browser storage.
12. It never logs report content or identifiers in analytics.
13. It handles zero rows.
14. It handles source endpoint failure.
15. It handles forbidden and expired sessions safely.
16. It is keyboard and screen-reader accessible.
17. It does not imply full historical export from capped endpoints.
18. It documents future server export requirements without enabling them.

## Claude Code Build Instruction
Build `ExportReportModal` as a governed client-side export flow for admin reports. It must show the selected source endpoint, scope, role rule, included fields, excluded fields, and format before generation; generate only CSV or JSON from allowlisted current returned rows; block unsupported reports and formats; protect sensitive fields; clean up object URLs; and never call or imply a server-side export job until the backend exposes an audited export API.

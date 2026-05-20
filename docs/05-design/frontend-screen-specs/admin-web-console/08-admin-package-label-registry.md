# AdminPackageLabelRegistry Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminPackageLabelRegistry` |
| Route | `/admin/package-labels` |
| Primary test ID | `screen-admin-package-label-registry` |
| Surface | Admin web console |
| Backend coverage | No direct admin package-label API exists today; future read-only admin registry API required |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `api_not_available`, `empty`, `not_found`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | Protected admin shell, `AdminPackageDetail`, `AdminCustodyChain`, `AdminManualCustodyException` |
| Related screens | `AdminPackageDetail`, `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminManualCustodyException`, `AdminAuditEvents`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue` |
| Current implementation mode | Read-only contract-gap screen until an admin registry endpoint is implemented |

## Outcome
`AdminPackageLabelRegistry` is the admin screen for auditing the immutable scan-code binding between a physical package label and a delivery.

The screen must answer:
- `Does this package label belong to a delivery?`
- `Which delivery is the label bound to?`
- `When was the label reserved?`
- `Which origin station created the binding?`
- `Which destination station is attached to the binding?`
- `Which actor role created the binding?`
- `Has the label ever been reused or challenged?`
- `What delivery and custody screens should the admin open next?`

Current reality:
- The server has a `PackageLabelRepository`.
- The Firestore collection is `package_labels`.
- The handoff service validates package scans against the registry when the repository is configured.
- There is no admin API route that lists or reads registry rows.

Therefore the first build of this route must be honest. It can render a polished unavailable state and link to related package evidence screens, but it must not read Firestore directly, expose raw scan codes, or pretend the registry endpoint exists.

## Product Definition
This screen will allow admins to:
- Search package-label registry records when a future admin endpoint exists.
- Review immutable label-to-delivery binding facts.
- Review binding creation timestamp.
- Review creating actor role.
- Review origin and destination station IDs.
- Review tracking code and delivery ID.
- Review whether direct registry lookup is unavailable in the current backend.
- Open the related delivery detail.
- Open the related package detail.
- Open the custody chain for the delivery.
- Open manual custody exception review when label conflict evidence exists.
- Open audit events scoped to package-label actions when available.

It does not allow admins to:
- Create a package label.
- Reserve a scan code.
- Reassign a label.
- Delete a label.
- Reprint a label.
- Submit a package scan.
- Confirm custody.
- Reveal raw scan code by default.
- Search by raw scan code in a URL.
- Write directly to Firestore.
- Override registry data.
- Resolve disputes.
- Approve refunds.
- View receiver phone or address.
- View payment provider references.

## Backend Boundary
Current backend facts:
- `PackageLabelRecord` exists in `services/api/src/package-labels.ts`.
- `PackageLabelRepository` exposes `getByScanCode(scanCode)` and `reserveForDelivery(label)`.
- The Firestore implementation stores rows in `package_labels`.
- `reserveForDelivery` creates the row in a transaction if the scan code is unused.
- If the scan code already exists, the repository returns the existing row.
- `assertPackageScanMatchesDelivery` throws `PACKAGE_SCAN_MISMATCH` when scan code is unregistered or bound to another delivery.
- Lifecycle mutations call package-label validation for later scans.
- `services/api/src/routes.ts` does not define `admin_package_labels`, `get_package_label`, or `search_package_labels`.

Current frontend boundary:
- This route must not call a non-existent endpoint.
- This route must not read Firestore from the client.
- This route must not infer registry rows from delivery timeline metadata alone.
- This route may accept a safe `deliveryId` query parameter to link admins back to package detail.
- This route must not accept raw scan code in query string.

Future backend endpoint required before full registry audit:
```http
GET /v1/admin/package-labels
```

Future query options:
```ts
type AdminPackageLabelListQuery = {
  deliveryId?: string;
  trackingCode?: string;
  originStationId?: string;
  destinationStationId?: string;
  createdByRole?: "station_operator" | "driver" | "final_mile_courier" | "ops_admin" | "super_admin";
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  cursor?: string;
};
```

Future response:
```ts
type AdminPackageLabelRegistryResponse = {
  labels: Array<{
    scanCodeFingerprint: string;
    deliveryId: string;
    trackingCode: string;
    originStationId: string;
    destinationStationId: string;
    createdAt: string;
    createdByUserId: string;
    createdByRole: string;
    conflictCount: number;
    lastValidatedAt?: string;
    lastConflictAt?: string;
  }>;
  nextCursor?: string;
};
```

Important future API rule:
- The response should return a server-generated fingerprint or redacted reference, not the raw scan code.

## Users
Primary:
- `ops_admin` investigating scan-code binding, label reuse risk, and custody mismatch.
- `support_admin` checking whether a package-related complaint has registry evidence.
- `super_admin` reviewing sensitive registry records and future audited reveal workflows.

Secondary:
- QA validating current unavailable state and future registry state.
- Security reviewers validating scan-code protection.
- Backend engineers implementing the missing endpoint.
- Claude Code implementing the admin route later.

## Entry Points
The screen can open from:
- `AdminPackageDetail` registry link.
- `AdminCustodyChain` package-scan evidence row.
- `AdminManualCustodyException` label conflict review.
- `AdminBlockedDeliveryQueue` package blocker.
- `AdminIssueDetail` package-related issue.
- `AdminAuditEventDetail` package-label event.
- Direct route `/admin/package-labels`.

Allowed query parameters:
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`

Disallowed query parameters:
- `scanCode`
- `labelScanCode`
- `packageScanCode`
- `proofReference`
- `raw`

If a disallowed parameter appears:
- Remove it from in-memory state.
- Replace the URL with a safe URL.
- Show `Raw scan references cannot be searched from this route.`
- Send analytics without the raw value.

## Real-World Context
The registry is a loss-prevention control. In a delivery network, the physical label is the durable bridge between a package, delivery record, scan events, and custody transfers. If the same code is reused, copied, misread, or typed into the wrong delivery, the package can become difficult to trace.

This screen must feel like a registry audit tool, not a normal search page. It should be precise, restrained, and safety-first. Admins should know exactly what is proven, what is unavailable, and which screen owns the next action.

## User Goal
Admins use this screen when they need to answer:
- `Is this label binding visible to the admin console?`
- `Which delivery owns this label?`
- `Was the label created at the correct origin station?`
- `Did later scans rely on the same registered binding?`
- `Is there a reason to open a custody exception?`
- `What backend endpoint is missing before registry audit can be complete?`

The screen must support investigation without leaking the very scan values that secure the package.

## Scope
In scope:
- Current unavailable state for missing admin endpoint.
- Future registry list state.
- Future filtered search by safe delivery and route fields.
- Future registry row detail expansion.
- Redacted scan fingerprint display.
- Registry conflict and validation summary when backend supports it.
- Route links to package detail, delivery detail, custody chain, and audit events.
- Strict privacy and analytics rules.

Out of scope:
- Raw scan-code reveal.
- Label creation.
- Label rebinding.
- Label reprint.
- Direct Firestore browser.
- Station operator print workflow.
- Public tracking.
- Receiver data.
- Payment data.
- Proof asset viewing.
- Custody mutation.
- Refund or dispute decision.

## Design Thesis
The screen should feel like a secure registry console: exact, minimal, highly legible, and visibly controlled. Use a split layout with search and filters on the left/top, result evidence table in the center, and a registry-boundary panel when the API is unavailable.

Visual decisions:
- Use charcoal, paper, and signal amber as the core palette.
- Use green only for server-confirmed bindings.
- Use red only for conflicts or unsafe raw input.
- Use a monospaced type treatment for fingerprints and IDs.
- Use table density carefully, with strong row rhythm and clear empty states.
- Use a single dominant action in unavailable mode: `Open package detail`.
- Use no decorative graphs.

Restraint rule:
- Do not make registry search feel casual. Every input and result should communicate that labels are security-sensitive.

## Research Inputs
External research used for this screen:
- [GS1 Canada traceability standards](https://gs1ca.org/standards/traceability-standards/): supports traceability through consistent product and event identification.
- [GS1 logistic label guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3): supports label-based logistics identification and scannable package movement.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense operational tables with toolbar, filtering, and row actions.
- [USWDS table](https://designsystem.digital.gov/components/table/): supports accessible table structure for government-grade operational data.
- [USWDS search](https://designsystem.digital.gov/components/search/): supports clear search affordance and accessible search labeling.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports excluding sensitive values from logs and analytics.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, refresh, and error announcements.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports robust focus treatment in dense admin tables.

How the research affects the screen:
- Traceability references justify immutable binding, event capture, and evidence-first wording.
- Carbon and USWDS table guidance shape registry rows, sorting, and empty states.
- USWDS search guidance shapes safe filtered lookup.
- OWASP guidance shapes analytics and log redaction.
- WCAG guidance shapes focus and status announcements.

## Current API Unavailable Mode
This is the required current implementation behavior.

Trigger:
- No `GET /v1/admin/package-labels` operation exists in the shared route contract.

UI:
- Render the screen shell.
- Show title `Package label registry`.
- Show an amber contract-boundary panel.
- Show safe context if `deliveryId` query exists.
- Offer route links to `AdminPackageDetail`, `AdminDeliveryDetail`, and `AdminCustodyChain`.
- Disable registry search input.
- Disable registry table.
- Show backend requirement summary.

Copy:
```text
Registry audit API not available yet.
```

Body:
```text
Kra validates package scan codes on lifecycle actions, but the admin console does not currently receive a read-only package-label registry endpoint. Use package detail and custody chain until the registry API is added.
```

Actions:
- `Open package detail`
- `Open delivery detail`
- `Open custody chain`
- `View backend requirement`

Do not:
- Fire a request to an undefined route.
- Read Firestore directly.
- Ask the admin to paste a raw scan code.
- Store raw scan values.
- Render a search input that looks active when it cannot work.

## Future Backend Contract
The full screen requires a read-only admin endpoint.

Recommended operation:
```text
admin_package_labels
```

Recommended route:
```http
GET /v1/admin/package-labels
```

Required permissions:
- `ops_admin`
- `support_admin`
- `super_admin`

Response requirements:
- Return redacted or fingerprinted scan code only.
- Include delivery ID.
- Include tracking code.
- Include origin station ID.
- Include destination station ID.
- Include created timestamp.
- Include creating actor role.
- Include creating actor ID only if policy allows.
- Include conflict count.
- Include last validation timestamp when known.
- Include pagination cursor.

Response must not include:
- Raw scan code.
- Receiver phone.
- Receiver address.
- Payment provider references.
- Proof asset storage paths.
- Unredacted free text.

## Future Data Model
Registry row:
```ts
type RegistryRow = {
  scanCodeFingerprint: string;
  deliveryId: string;
  trackingCode: string;
  originStationId: string;
  destinationStationId: string;
  createdAt: string;
  createdByRole: string;
  createdByUserId?: string;
  conflictCount: number;
  lastValidatedAt?: string;
  lastConflictAt?: string;
};
```

Derived presentation state:
```ts
type RegistryRowState =
  | "bound"
  | "validated"
  | "conflict"
  | "stale"
  | "unknown";
```

Derivation:
- `conflictCount > 0` -> `conflict`
- `lastValidatedAt` present and no conflicts -> `validated`
- Row exists with no validation timestamp -> `bound`
- Row older than configured review window and no validation -> `stale`
- Missing row -> `unknown`

Do not derive:
- Actual physical package location.
- Liability.
- Refund eligibility.
- Package condition.
- Custody owner.
- Raw scan value equality.

## Search And Filter Model
Current build:
- Search is disabled.
- Safe query context can appear from route params.

Future build:
- Search by `deliveryId`.
- Search by `trackingCode`.
- Filter by origin station.
- Filter by destination station.
- Filter by created date range.
- Filter by creator role.
- Filter by conflict state.
- Filter by validation state.

Forbidden search:
- Raw scan code.
- Receiver phone.
- Receiver name.
- Receiver address.
- Payment reference.
- Actor free text.

Safe search fields:
- Delivery ID.
- Tracking code.
- Station ID.
- Date.
- Role.

Search behavior:
- Submit only on explicit action.
- Do not query on every keypress for sensitive registry data.
- Debounced local filtering can apply to already loaded rows only.
- Preserve filters in URL only when values are safe.
- Clear disallowed query params immediately.

## Required Layout
Desktop layout:
- Header and contract status at top.
- Filter bar under header.
- Results table as main content.
- Right rail for registry rules and related routes.
- Max content width `1440px`.
- Page padding `32px`.

Current unavailable layout:
- Header.
- Contract-boundary panel.
- Safe query context card.
- Backend requirement card.
- Related route cards.

Future ready layout:
- Header.
- Search/filter bar.
- Registry evidence table.
- Row detail drawer or inline expansion.
- Right rail with traceability rules.
- Pagination footer.

Tablet layout:
- Filter bar stacks into two rows.
- Right rail moves below table.
- Table keeps core columns and moves secondary columns into expansion.

Mobile layout:
- Admin web must remain usable at narrow widths.
- Use one column.
- Replace table with registry row cards.
- Hide non-critical columns inside disclosure panels.
- Keep redaction visible.

## Breadcrumb
Breadcrumb path:
```text
Admin / Package labels
```

If opened with safe `deliveryId`:
```text
Admin / Deliveries / {deliveryId} / Package labels
```

Rules:
- `Admin` links to `AdminOverview`.
- `Deliveries` links to `AdminDeliveryExplorer`.
- `{deliveryId}` links to `AdminDeliveryDetail`.
- `Package labels` is current.
- Use `aria-current="page"`.

## Header
Header content:
- Eyebrow: `Registry audit`
- Title: `Package label registry`
- Subtitle: `Immutable scan-code bindings for package custody validation.`
- Status chip:
  - Current: `API not available`
  - Future ready: `Read-only`
- Primary action:
  - Current: `Open package detail`
  - Future ready: `Search registry`

Rules:
- Do not ask for raw scan code.
- Do not include raw scan code in header.
- Do not show decorative counters until backend returns counts.

## Contract Boundary Panel
This panel is required in current mode.

Title:
```text
Registry audit API not available yet
```

Body:
```text
The backend owns package-label validation during scan actions. The admin console needs a read-only registry endpoint before it can list or inspect label bindings here.
```

Facts:
- Server collection: `package_labels`.
- Server record: `PackageLabelRecord`.
- Server repository: `PackageLabelRepository`.
- Current validator: `assertPackageScanMatchesDelivery`.
- Missing admin route: `GET /v1/admin/package-labels`.

Actions:
- `Open package detail`
- `Open custody chain`
- `Open API contracts`

Visual:
- Amber left border.
- Monospaced contract names.
- No error tone unless a route attempted unsupported fetch.

## Safe Query Context Card
If opened with `deliveryId`, show:
- Delivery ID.
- Tracking code if supplied safely.
- Link to package detail.
- Link to delivery detail.
- Link to custody chain.

If opened without query:
- Show `No delivery context selected`.
- Offer `Search deliveries`.

If unsafe query parameter was removed:
- Show `Unsafe scan reference removed from URL`.
- Explain that raw scan values are never kept in routes.

## Future Results Table
The future table is shown only when the endpoint exists.

Columns:
- Fingerprint.
- Delivery ID.
- Tracking code.
- Origin station.
- Destination station.
- Created.
- Created by role.
- Validation state.
- Conflict count.
- Actions.

Default sort:
- `createdAt` descending.

Row actions:
- `Open package`
- `Open delivery`
- `Open custody`
- `Open audit`
- `Open exception` when conflict count is greater than zero.

Column rules:
- Fingerprint uses monospaced text.
- Delivery and tracking IDs are copyable.
- Fingerprint copy is allowed only if it is a fingerprint, never raw scan.
- Created date shows absolute and relative time.
- Conflict count has text plus color.

Empty table:
- Title: `No registry rows found`
- Body: `No package-label binding matches the current safe filters.`
- Action: `Clear filters`

## Row Detail Expansion
Future row expansion shows:
- Binding summary.
- Created timestamp.
- Created by role.
- Origin and destination station IDs.
- Last validation timestamp.
- Last conflict timestamp.
- Conflict count.
- Related delivery links.
- Contract note.

It must not show:
- Raw scan code.
- Receiver data.
- Payment data.
- Proof asset path.
- Raw free-text notes.

If actor ID is present:
- Hide by default.
- Show only if policy later allows restricted reveal.
- Do not build reveal behavior in current spec.

## Registry Conflict States
Conflict sources in future endpoint:
- Reused scan attempt.
- Package scan mismatch.
- Label bound to another delivery.
- Unregistered scan attempt.
- Supervisor fallback after scan failure.
- Issue category `handoff` or `loss` linked to package-label evidence.

Display:
- Conflict rows use red risk tag.
- Fallback rows use amber tag.
- Validated rows use green tag.
- Bound-only rows use neutral tag.

Copy:
- `Conflict recorded`
- `Fallback reviewed`
- `Binding validated`
- `Binding exists`

Rules:
- Do not determine liability.
- Do not mark package lost.
- Do not trigger refund.
- Route to exception review for conflicts.

## Related Route Rail
Cards:
- `Package detail`
- `Delivery detail`
- `Custody chain`
- `Manual custody exception`
- `Audit events`
- `Blocked delivery queue`

Current route behavior:
- If `deliveryId` exists, direct links include the delivery ID.
- If no `deliveryId`, link to delivery search.
- If a route is not implemented, show disabled state with exact route dependency.

## Loading State
Current unavailable mode:
- No API call should happen.
- Loading state should be brief and only for route/query validation.

Future ready mode:
- Show table skeleton rows.
- Show filter skeleton.
- Show `Loading registry rows...`.

Rules:
- Loading must not reveal stale raw values.
- Loading status uses `aria-live="polite"`.

## Ready State
Current ready state means:
- The screen rendered the unavailable contract-boundary view.
- Safe query context is parsed.
- Unsafe query parameters were removed.
- Related actions are available.

Future ready state means:
- Admin registry endpoint loaded.
- Results table rendered.
- Filters applied safely.
- Redaction verified.
- Pagination rendered when needed.

## API Not Available State
This is a first-class state, not a broken page.

State name:
```text
api_not_available
```

Message:
```text
Read-only registry API is not implemented yet.
```

Admin next steps:
- Open package detail.
- Open custody chain.
- Track backend endpoint requirement.

Engineering next steps:
- Add route contract.
- Add admin service method.
- Add repository reverse lookup by delivery ID.
- Add redacted fingerprint response.
- Add audit-safe tests.

## Not Found State
Future trigger:
- Registry endpoint exists.
- Filter by delivery or fingerprint returns no rows.

UI:
- Title: `No package-label binding found`
- Body: `No registry row matches the current safe filters.`
- Actions:
  - `Clear filters`
  - `Open package detail`
  - `Open custody chain`

Rules:
- Do not expose whether a raw scan value exists.
- Do not echo unsafe user input.

## Not Authorized State
Trigger:
- User role lacks access.

UI:
- Title: `Access denied`
- Body: `Your admin role cannot view package-label registry records.`
- Actions:
  - `Back`
  - `Open support`

Rules:
- Do not show any registry context.
- Do not retain results from prior users.

## Session Expired State
Trigger:
- Auth session missing or expired.

UI:
- Title: `Session expired`
- Body: `Sign in again to view registry audit tools.`
- Action: `Sign in`

Rules:
- Clear filters.
- Clear registry rows.
- Remove unsafe route state.

## API Error State
Future trigger:
- Registry endpoint returns network or server error.

UI:
- Title: `Registry rows could not load`
- Body: `Refresh the registry. If this continues, open support with the safe delivery reference.`
- Actions:
  - `Retry`
  - `Open support`

Support payload may include:
- Delivery ID.
- Tracking code.
- Endpoint name.
- Timestamp.
- Role.

Support payload must exclude:
- Raw scan code.
- Raw proof reference.
- Receiver data.
- Payment data.

## Security And Privacy
Protected values:
- Raw scan code.
- Label scan code.
- Package scan code.
- Proof reference.
- Receiver phone.
- Receiver address.
- Payment provider reference.
- Raw actor ID.
- Supervisor override actor ID.

Rules:
- Never place raw scan values in URL.
- Never request raw scan values in a normal text search field.
- Never send raw scan values to analytics.
- Never log raw scan values.
- Never put raw scan values in toast copy.
- Never put raw scan values in `aria-label` or `title`.
- Use server-generated fingerprints.
- Use delivery ID and tracking code as safe investigation keys.
- Treat free text as untrusted and sanitize before display.

## Accessibility Requirements
Semantics:
- One `h1`.
- Contract-boundary panel has a heading.
- Future table uses semantic table markup.
- Row actions have unique accessible names.
- Status messages use polite live regions.
- Errors use alert behavior only when immediate attention is required.

Keyboard:
- Filter controls are reachable.
- Table rows and actions are reachable.
- Pagination is reachable.
- Disabled controls explain why unavailable.
- Focus order follows visible layout.

Focus:
- Visible focus ring on all inputs, links, buttons, row actions, and pagination.
- Focus ring must remain visible in dense table rows.
- Focus must not disappear when unsafe query is removed.

Screen reader:
- Unavailable state announces `Registry audit API not available yet`.
- Redacted fingerprints announce as `Package label fingerprint`.
- Conflict rows announce conflict count and state.
- Refresh completion announces row count.

Color:
- Conflict, fallback, and valid states include text labels.
- Color is secondary.
- Contrast meets WCAG AA at minimum.

## Responsive Rules
Desktop:
- Full table with all columns.
- Right rail visible.
- Filters in horizontal bar.

Tablet:
- Filters wrap.
- Table hides secondary columns in row expansion.
- Right rail moves below table.

Mobile:
- Row cards replace table.
- Filters collapse into `Filter registry`.
- Related route rail becomes action list.
- IDs truncate visually but keep full accessible labels.
- No horizontal scroll for primary content.

## Motion
Allowed:
- Subtle panel fade on load.
- Row highlight after refresh when new rows arrive.
- Filter drawer slide on narrow screens.

Not allowed:
- Looping motion.
- Decorative scanners.
- Animated code streams.
- Motion that reveals sensitive values.

Respect `prefers-reduced-motion`.

## Analytics
Events:
- `admin_package_label_registry_viewed`
- `admin_package_label_registry_api_unavailable`
- `admin_package_label_registry_filter_submitted`
- `admin_package_label_registry_row_opened`
- `admin_package_label_registry_unsafe_query_removed`
- `admin_package_label_registry_related_route_clicked`

Allowed properties:
- `hasDeliveryContext`
- `deliveryId`
- `trackingCode`
- `originStationId`
- `destinationStationId`
- `createdByRole`
- `resultCount`
- `conflictCount`
- `apiAvailable`
- `routeName`

Forbidden properties:
- Raw scan code.
- Raw proof reference.
- Receiver phone.
- Receiver address.
- Payment provider reference.
- Actor ID.
- Supervisor override actor ID.
- Free text.

## Test Plan
### Current Contract-Gap Tests
- Renders route at `/admin/package-labels`.
- Root has `data-testid="screen-admin-package-label-registry"`.
- Shows `api_not_available` state when registry endpoint is absent.
- Does not call undefined admin registry endpoint.
- Does not read Firestore client-side.
- Shows package-detail link when `deliveryId` query is present.
- Shows delivery search route when no safe context exists.
- Removes unsafe scan query parameters.
- Does not render raw unsafe query values.

### Future Registry Tests
- Renders registry table from future endpoint.
- Filters by delivery ID.
- Filters by tracking code.
- Filters by station IDs.
- Filters by date range.
- Shows pagination cursor.
- Handles empty result.
- Handles not found.
- Handles not authorized.
- Handles session expired.
- Handles API error.

### Redaction Tests
- Raw scan code never renders.
- Raw scan code never appears in URL after parsing.
- Raw scan code never appears in analytics.
- Raw scan code never appears in copied text.
- Raw proof reference never renders.
- Receiver phone never renders.
- Receiver address never renders.
- Actor ID does not render in default view.

### Accessibility Tests
- Page has one `h1`.
- Breadcrumb uses `aria-current`.
- Unavailable state is announced.
- Disabled search explains unavailable API.
- Filter controls have labels.
- Future table has accessible headers.
- Row actions have unique accessible names.
- Focus remains visible.
- Narrow layout remains navigable.

### Visual Regression Tests
- Current unavailable mode desktop.
- Current unavailable mode mobile.
- Future table ready mode.
- Empty state.
- Conflict rows.
- Long IDs.
- Filter wrap on tablet.
- Row cards on mobile.

## Acceptance Criteria
- The screen spec exists at `docs/05-design/frontend-screen-specs/admin-web-console/08-admin-package-label-registry.md`.
- The route is `/admin/package-labels`.
- The primary test ID is `screen-admin-package-label-registry`.
- Current implementation mode shows `api_not_available`.
- Current implementation does not call undefined endpoints.
- Current implementation does not read Firestore directly.
- Raw scan values are never accepted in URL, analytics, copy, logs, or UI.
- Registry search is disabled until backend API exists.
- Safe delivery context can route to package detail, delivery detail, and custody chain.
- Future endpoint requirements are explicit.
- Future rows use server-provided fingerprints, not raw scan values.
- Conflict states route to custody exception review.
- Accessibility, privacy, and responsive behavior are specified.

## Implementation Notes For Claude Code
Build current mode first:
1. Add protected admin route `/admin/package-labels`.
2. Render screen shell with `api_not_available`.
3. Parse safe query params only.
4. Remove unsafe query params.
5. Render related route links.
6. Disable registry search and explain why.
7. Add redaction tests.
8. Add analytics tests.

Do not:
- Add a client Firestore query.
- Add an app-side registry cache.
- Add raw scan search.
- Add lifecycle mutations.
- Add label creation or reprint.
- Add raw reveal.

Future mode after backend lands:
1. Add generated route contract for `GET /v1/admin/package-labels`.
2. Use typed query and response schemas.
3. Render table from server response.
4. Use server-provided fingerprint.
5. Add pagination.
6. Add conflict route actions.
7. Add not found, empty, and API error states.

## Future Enhancements
Backend:
- `GET /v1/admin/package-labels`.
- `GET /v1/admin/package-labels/by-delivery/:deliveryId`.
- Server-generated scan-code fingerprint.
- Conflict event projection.
- Last validation projection.
- Audit event projection.
- Restricted audited raw reveal workflow if policy approves.

Frontend:
- Registry row drawer.
- Registry conflict detail.
- Saved safe filters.
- Case export with redacted references.
- Cross-link to audit events.
- Bulk conflict triage route.

## Done Definition
The screen is complete when:
- It clearly explains the current backend gap.
- It does not invent registry access.
- It protects raw scan data.
- It provides safe routes to package detail and custody evidence.
- It defines the future endpoint contract enough for backend implementation.
- It can become a full registry table once the backend adds a read-only API.
- It passes content, privacy, accessibility, responsive, and analytics tests.

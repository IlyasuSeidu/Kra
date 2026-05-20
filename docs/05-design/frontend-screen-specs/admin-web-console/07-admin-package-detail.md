# AdminPackageDetail Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminPackageDetail` |
| Route | `/admin/deliveries/:deliveryId/package` |
| Primary test ID | `screen-admin-package-detail` |
| Surface | Admin web console |
| Backend coverage | `get_delivery` through `GET /v1/deliveries/:id`; `get_delivery_timeline` through `GET /v1/deliveries/:id/timeline` |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `partial_timeline`, `label_evidence_unavailable`, `mismatch_risk`, `exception_present`, `not_found`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | `AdminDeliveryDetail`, protected admin shell |
| Related screens | `AdminDeliveryDetail`, `AdminPackageLabelRegistry`, `AdminCustodyChain`, `AdminManualCustodyException`, `AdminBlockedDeliveryQueue`, `AdminIssueQueue`, `AdminAuditEvents`, `AdminStationDetail` |
| Current implementation mode | Read-only package evidence view composed from delivery detail and delivery timeline |

## Outcome
`AdminPackageDetail` lets an admin inspect the package side of a delivery without turning the page into a status editor, scan tool, or raw registry browser.

The screen must answer:
- `What physical package was declared for this delivery?`
- `What package facts changed at origin intake?`
- `Was a package label scan captured?`
- `Which lifecycle steps reused package-scan evidence?`
- `Do any events suggest mismatch, fallback, damage, or exception risk?`
- `Who currently holds custody according to the delivery record?`
- `What evidence is visible through current APIs?`
- `What evidence requires a deeper registry or custody screen?`

The page is a read-only package case file. It must make the evidence clear enough for support, ops, and finance admins to decide the next route, while avoiding raw scan-code exposure and avoiding claims that are not backed by the current backend contract.

## Product Definition
This screen allows admins to:
- Load one delivery by `deliveryId`.
- Review the delivery tracking code and current lifecycle status.
- Review route, service, payment, and custody context.
- Review package description, measured weight, size tier, fragile flag, and declared value.
- Compare declared package facts with intake and timeline evidence when exposed.
- See whether package-scan proof exists in the timeline.
- See whether scan proof used normal scanner capture or supervised fallback when exposed.
- See package condition evidence from intake, destination receipt, and handoff entries when exposed.
- See issue timeline entries that relate to damage, loss, handoff, or other package concerns.
- Open the full custody chain for all handoff chronology.
- Open the package label registry when that screen is available.
- Open manual custody exception review when evidence conflict exists.
- Open blocked delivery queue or issue queue when package risk blocks operations.
- Refresh delivery detail and timeline together.

It does not allow admins to:
- Change package facts.
- Edit declared value.
- Change size tier.
- Change delivery status.
- Confirm intake.
- Dispatch package.
- Confirm driver pickup.
- Receive destination.
- Assign final-mile courier.
- Complete delivery.
- Record failed attempt.
- Upload proof.
- Reprint a label.
- Rebind a package label.
- Reveal full raw scan code by default.
- Reveal full receiver phone or address.
- View raw proof asset files.
- Edit timeline entries.
- Resolve disputes.
- Override custody.
- Execute payouts or refunds.

## Backend Boundary
This screen uses two existing authenticated endpoints:
```http
GET /v1/deliveries/:id
GET /v1/deliveries/:id/timeline
```

Operations:
```text
get_delivery
get_delivery_timeline
```

Important backend facts:
- There is no admin-specific package detail endpoint today.
- There is no public package-label lookup endpoint today.
- `PackageLabelRepository` exists server-side and binds one `scanCode` to one `deliveryId`.
- `package_labels/{encodedScanCode}` is a backend data source, not a direct frontend contract.
- `deliveryDetailResponseSchema` returns the package object.
- `deliveryTimelineResponseSchema` returns delivery events, handoff events, and issue events.
- Handoff timeline entries expose metadata for proof type and proof reference.
- Delivery event timeline entries may expose metadata such as condition, label scan, package scan, fallback, or supervisor override when recorded.
- The API does not expose a normalized scan registry row.
- The API does not expose package label creation actor as a first-class response object.
- The API does not expose station names, user names, or user profiles.
- The API does not expose proof asset bytes.

Therefore:
- The package facts section must be driven by `delivery.package`.
- The scan evidence section must be driven by timeline metadata when present.
- The page must mark label-registry detail as unavailable when only delivery/timeline data exists.
- The page must not pretend to verify registry uniqueness unless a registry endpoint has been called.
- The page must link to `AdminPackageLabelRegistry` for deeper registry audit when supported.
- Raw proof references must be redacted unless a future audited reveal workflow exists.
- Current custody must come from `delivery.currentCustodyRole` and `delivery.currentCustodyActorId`.
- Historical custody must come from `get_delivery_timeline`, not from inferred local state.

## Users
Primary:
- `ops_admin` investigating package movement, scan evidence, condition, and custody confidence.
- `support_admin` reviewing package-related complaints before issue triage.
- `finance_admin` checking package facts that can affect refund eligibility or declared-value disputes.
- `super_admin` reviewing high-risk package records and operational exceptions.

Secondary:
- QA validating evidence and redaction behavior.
- Security reviewers validating scan-code and receiver-data exposure.
- Operations leads validating loss-prevention workflows.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- `AdminDeliveryDetail` package card.
- `AdminCustodyChain` package evidence row.
- `AdminBlockedDeliveryQueue` row action.
- `AdminIssueDetail` related package link.
- `AdminManualCustodyException` related package link.
- `AdminAuditEventDetail` related object link.
- `AdminStationDetail` queue row.
- Direct route `/admin/deliveries/:deliveryId/package`.

The screen must not be reachable:
- Without admin authorization.
- Without a valid `deliveryId`.
- From public tracking.
- From sender, driver, station-operator, or final-mile courier routes.

Invalid route behavior:
- If `deliveryId` does not match the app delivery ID format, do not call the API.
- Show `Invalid delivery reference`.
- Offer `Back to delivery search`.
- Log only route validation failure, never receiver or scan data.

## Real-World Context
Package loss, damage, and misrouting often come from weak evidence at transfer points. Kra is trying to solve delivery issues across African station networks, where handoffs can cross people, stations, poor connectivity, and fast physical movement. This screen must treat the package as the object of accountability.

The admin should not have to read raw JSON, ask a station worker for memory, or jump across unrelated pages to understand whether the package evidence is strong. At the same time, the admin page must not expose secrets or raw scan values casually. The right experience is an evidence-led case file: calm, exact, chronological, and strict about uncertainty.

## User Goal
When an admin opens this page, they are usually trying to answer one of these questions:
- `Was the correct package accepted into the network?`
- `Did every package scan point to the same delivery?`
- `Where did the package condition change?`
- `Did a fallback or supervisor override occur?`
- `Is the package currently with a station, driver, courier, or no active custodian?`
- `Should this be escalated as damage, loss, handoff conflict, or label issue?`

The page should reduce investigation time and reduce dangerous assumptions. It must make strong evidence feel strong and missing evidence feel visible.

## Scope
In scope:
- Package identity facts from the delivery detail response.
- Package value and handling facts.
- Current custody state.
- Timeline-derived package-scan evidence.
- Timeline-derived package-condition evidence.
- Timeline-derived issue evidence.
- Fallback and supervisor override indicators when exposed.
- Redacted proof references.
- Links to deeper admin investigation routes.
- Safe loading, partial, stale, empty, and error states.

Out of scope:
- Label creation workflow.
- Label reprint workflow.
- Package scan submission.
- Custody transfer mutation.
- Issue resolution mutation.
- Refund decision mutation.
- Full audit-log browser.
- Full proof-asset viewer.
- User profile lookup.
- Station profile enrichment.
- Payment provider inspection.
- Bulk package registry search.

## Design Thesis
The screen should feel like a premium logistics evidence desk: dense, quiet, exact, and high-trust. Use a wide case-file layout, strong typographic grouping, and a central evidence timeline. Avoid decorative dashboards. The visual language should make chain-of-custody uncertainty impossible to miss.

Visual decisions:
- Use a restrained graphite, ivory, and amber palette for evidence and warning states.
- Use green only for verified current-state facts.
- Use amber for partial evidence and fallback.
- Use red only for mismatch, loss, or blocking exception.
- Use monospaced text for IDs and redacted scan references.
- Use strong spacing and section rhythm instead of heavy borders.
- Use compact structured lists for package facts.
- Use timeline rows for scan and condition events.
- Keep one primary action: `Open custody chain`.

Restraint rule:
- Do not create chart cards, animated maps, or decorative icons. This screen is about proving what happened to one package.

## Research Inputs
External research used for this screen:
- [GS1 Canada traceability standards](https://gs1ca.org/standards/traceability-standards/): supports the need for consistent identification, event capture, and traceability records around goods movement.
- [GS1 logistic label guideline](https://www.gs1.org/standards/gs1-logistic-label-guideline/1-3): supports label-driven logistics identification and the importance of scannable labels in supply-chain movement.
- [IBM Carbon structured list](https://v10.carbondesignsystem.com/components/structured-list/usage/): supports grouped read-only facts that are easier to scan than long free-form text.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports dense operational rows, sorting discipline, and clear table states.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports concise summary panels for important operational context.
- [USWDS table](https://designsystem.digital.gov/components/table/): supports accessible tabular presentation for dense records.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing load, refresh, and error states without moving focus.
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html): supports visible focus treatment for dense admin tools.

How the research affects the screen:
- Traceability references justify unique label and event emphasis.
- Carbon structured lists guide package fact grouping.
- Carbon and USWDS table guidance shape the event table and empty states.
- USWDS summary box guidance shapes the top package evidence summary.
- WCAG guidance controls focus, status messaging, and screen-reader updates.

## Backend Contract
### Delivery Detail Request
```http
GET /v1/deliveries/:id
```

Expected response fields used:
```ts
type AdminPackageDeliveryDetail = {
  deliveryId: string;
  trackingCode: string;
  senderId: string;
  originStationId: string;
  destinationStationId: string;
  currentStatus: string;
  paymentStatus: string;
  serviceType: string;
  doorstepRequested: boolean;
  doorstepDistanceKm?: number;
  receiver: {
    name: string;
    phone: string;
    addressText?: string;
  };
  package: {
    description: string;
    weightKg: number;
    sizeTier: "small" | "medium" | "large";
    isFragile: boolean;
    declaredValueGhs: number;
  };
  quote: {
    currency: "GHS";
    amount: number;
  };
  currentCustodyRole: "station_operator" | "driver" | "final_mile_courier" | null;
  currentCustodyActorId: string | null;
  assignedDriverId?: string;
  assignedFinalMileCourierId?: string;
  latestEvent: {
    type: string;
    occurredAt: string;
  };
  latestTouchpoint: {
    role: "system" | "station_operator" | "driver" | "final_mile_courier";
    stationId?: string;
    occurredAt: string;
  };
  finalProof?: {
    type: "otp" | "signature" | "delivery_photo";
    reference: string;
    receivedByName: string;
    capturedAt: string;
  };
  createdAt: string;
};
```

### Delivery Timeline Request
```http
GET /v1/deliveries/:id/timeline
```

Expected response fields used:
```ts
type AdminPackageTimeline = {
  deliveryId: string;
  trackingCode: string;
  entries: Array<{
    entryId: string;
    entryType: "delivery_event" | "handoff_event" | "issue_event";
    occurredAt: string;
    label: string;
    actorId?: string;
    actorRole?: string;
    stationId?: string;
    metadata?: Record<string, unknown>;
  }>;
};
```

### Timeline Metadata Expected By Current Backend
Delivery event metadata can include:
- `condition`
- `labelScanCode`
- `packageScanCode`
- `fallbackUsed`
- `supervisorOverrideActorId`
- `nextStep`
- `reasonCode`
- `note`

Handoff event metadata can include:
- `proofType`
- `proofReference`
- `condition`

Issue event metadata can include:
- `severity`
- `category`
- `summary`

The UI must treat metadata as optional and untrusted for presentation shape:
- Validate type before rendering.
- Use safe labels for unknown metadata.
- Redact raw values that may contain scan codes, proof references, phone numbers, addresses, or free text.
- Do not crash when metadata contains an unexpected shape.

## Data Loading Strategy
Initial load:
1. Validate route `deliveryId`.
2. Fetch `get_delivery`.
3. Fetch `get_delivery_timeline` in parallel after route validation.
4. Render the shell and loading skeleton immediately.
5. If detail succeeds and timeline is pending, render package facts with `Loading evidence`.
6. If detail succeeds and timeline fails, render `partial_timeline`.
7. If detail fails with `404`, render `not_found`.
8. If detail fails with `403`, render `not_authorized`.
9. If auth session fails, render `session_expired`.

Refresh:
- Refresh detail and timeline together.
- Keep visible stale data while refresh is running.
- Show `Refreshing package evidence`.
- Mark the data timestamp.
- If refresh partially fails, keep last good detail and mark timeline as partial.

Caching:
- Use normal authenticated app query cache.
- Do not persist raw timeline metadata to local storage.
- Do not store raw proof references in analytics.
- Clear package detail cache on sign-out.

## Derived Evidence Model
The UI should derive a local evidence model from the delivery and timeline responses. This is a presentation model only.

```ts
type PackageEvidenceState =
  | "not_received"
  | "label_recorded"
  | "scan_reused"
  | "fallback_present"
  | "condition_issue"
  | "issue_present"
  | "mismatch_risk"
  | "delivered"
  | "registry_unavailable";
```

Derivation rules:
- If delivery status is `created`, show `not_received`.
- If a timeline entry has `metadata.proofType = package_scan`, show package scan evidence.
- If a timeline entry has `metadata.labelScanCode` or `metadata.packageScanCode`, show scan capture evidence after redaction.
- If any relevant entry has `metadata.fallbackUsed = true`, show `fallback_present`.
- If any relevant entry has `metadata.condition = damaged`, show `condition_issue`.
- If any issue entry has category `damage`, `loss`, or `handoff`, show `issue_present`.
- If timeline entries include proof references that cannot be normalized or cross-checked by frontend contract, show `registry_unavailable`, not `verified_unique`.
- If final proof exists and current status is `delivered`, show `delivered`.

Do not derive:
- Actual registry uniqueness.
- Label creator identity.
- Station staff names.
- Raw scan value equality unless backend returns a normalized comparison.
- Physical package location beyond current custody and latest touchpoint.
- Liability result.
- Refund eligibility result.

## Evidence Confidence
Use five confidence levels:

| Level | Label | Meaning | Source |
| --- | --- | --- | --- |
| `strong` | Strong evidence | Backend current state plus timeline proof agree at presentation level | Detail plus timeline |
| `partial` | Partial evidence | Detail loaded but timeline evidence is incomplete or unavailable | Detail only or partial timeline |
| `fallback` | Fallback evidence | Manual or supervisor-assisted flow is visible | Timeline metadata |
| `risk` | Risk present | Issue, damage, loss, or handoff conflict is visible | Timeline issue or condition |
| `unknown` | Registry unavailable | Direct package-label registry row is not available to this screen | Contract boundary |

Confidence display rules:
- The confidence label must be visible near the page title.
- Confidence copy must describe why the level is shown.
- Confidence cannot say `verified registry match` unless a registry endpoint is used.
- Confidence must update after refresh.
- Confidence must not be color-only.

## Data Presentation Rules
Package facts:
- Show `description` as provided, trimmed.
- Show `weightKg` with up to two decimal places.
- Show `sizeTier` as title case.
- Show `isFragile` as `Fragile` or `Not fragile`.
- Show `declaredValueGhs` as `GHS {value}`.
- If value is `0`, show `No declared value`.
- Do not show quote amount as package value.

Delivery facts:
- Show `deliveryId` and `trackingCode` in monospaced text.
- Show station IDs until station names are available.
- Show current status as a lifecycle chip.
- Show payment status as secondary context.
- Show service type and doorstep flag.

Scan references:
- Never show full raw scan code by default.
- Render a redacted form using first 3 visible characters, ellipsis, and last 4 visible characters when safe.
- If value is shorter than 8 characters, show `Redacted`.
- Never put raw scan values in titles, URLs, analytics, toast messages, screenshots, or crash logs.
- Use `Copy redacted reference` only for the redacted value.

Proof references:
- If `proofType = package_scan`, display `Package scan proof`.
- If `proofReference` exists, show redacted value only.
- If proof type is `delivery_proof`, link to proof summary but do not show proof asset bytes.

Actor IDs:
- Hide raw actor IDs in the default compact view.
- Show role names and station IDs.
- Allow a collapsed `Technical IDs` section only for `super_admin` if a future audited reveal pattern exists.
- Under current implementation, do not build a reveal pattern.

## Required Layout
Desktop layout:
- Width: max content `1440px`.
- Page padding: `32px` top, `32px` sides, `48px` bottom.
- Layout grid: `minmax(0, 1fr) 360px`.
- Left column: package facts, label evidence, scan timeline.
- Right column: evidence summary, custody snapshot, related actions.
- Sticky right rail begins below the app header and ends above footer.

Tablet layout:
- Use one column until `1024px`.
- Move evidence summary above package facts.
- Keep related actions under evidence summary.
- Timeline rows become stacked cards with the same order.

Mobile layout:
- This is an admin web page, but must remain usable at narrow widths.
- Use one column.
- Collapse dense fact groups into accordions.
- Keep `Open custody chain` and `Refresh` visible in the top action area.
- Tables become ordered event cards.
- No horizontal scrolling for core facts.

Visual hierarchy:
1. Breadcrumb and page identity.
2. Evidence confidence summary.
3. Package facts.
4. Scan and condition evidence.
5. Current custody and related routes.
6. Technical contract notes.

## Breadcrumb
Breadcrumb path:
```text
Admin / Deliveries / {deliveryId} / Package
```

Behavior:
- `Admin` links to `AdminOverview`.
- `Deliveries` links to `AdminDeliveryExplorer`.
- `{deliveryId}` links to `AdminDeliveryDetail`.
- `Package` is current and not clickable.

Accessibility:
- Wrap in `nav` with `aria-label="Breadcrumb"`.
- Current item uses `aria-current="page"`.
- Long delivery IDs truncate visually but preserve full accessible text.

## Identity Header
Purpose:
- Establish the package case-file identity immediately.
- Make current package confidence visible.
- Provide the main route to custody investigation.

Content:
- Eyebrow: `Package evidence`
- Title: `{trackingCode}`
- Subtitle: `Delivery {deliveryId}`
- Status chips:
  - Current delivery status.
  - Evidence confidence.
  - Current custody role.
  - Package condition state when known.
- Actions:
  - Primary: `Open custody chain`
  - Secondary: `Open delivery`
  - Secondary: `Refresh`

Header copy examples:
- `Package evidence`
- `Delivery DEL-8K2A91`
- `Evidence is partial until registry lookup is available.`
- `Current custodian: Driver`

Rules:
- Do not show receiver phone.
- Do not show raw scan code.
- Do not show raw actor ID in header.
- If timeline is unavailable, show `Timeline unavailable` in the chip row.
- If delivery is stale, show `Last loaded {relativeTime}`.

## Evidence Summary Rail
Purpose:
- Give admins a fast decision summary without requiring timeline reading.

Cards:
1. `Package status`
2. `Label evidence`
3. `Current custody`
4. `Risk flags`
5. `Next admin route`

### Package Status Card
Fields:
- Description.
- Size tier.
- Weight.
- Fragile state.
- Declared value.
- Delivery lifecycle status.

Copy:
- `Package facts are from the delivery detail contract.`
- `Measured intake changes are visible only when the timeline exposes them.`

### Label Evidence Card
States:
- `Not yet recorded`: delivery is before origin intake.
- `Scan evidence recorded`: timeline contains package-scan proof.
- `Fallback used`: timeline indicates supervised manual fallback.
- `Registry row not exposed`: no package-label endpoint is available to this screen.
- `Mismatch risk`: issue or error state indicates scan mismatch or custody conflict.

Copy:
- `Registry row not exposed by current API. Use the registry screen when available.`
- `Scan proof exists in timeline metadata, with raw reference redacted.`

### Current Custody Card
Fields:
- Custody role.
- Redacted actor state.
- Latest touchpoint role.
- Latest touchpoint station ID.
- Latest touchpoint time.

States:
- `No active custodian`.
- `Origin station custody`.
- `Driver custody`.
- `Destination station custody`.
- `Final-mile courier custody`.
- `Delivered`.

Rules:
- Use `currentCustodyRole` as the authority.
- If `currentCustodyActorId` is null, do not infer actor from timeline.
- If final proof exists and current custody is null, explain that delivery completion can clear active custody.

### Risk Flags Card
Risk sources:
- `condition = damaged`.
- Issue category `damage`.
- Issue category `loss`.
- Issue category `handoff`.
- Fallback evidence present.
- Timeline unavailable.
- Current status conflicts with expected package stage at presentation level.

Risk presentation:
- Show count.
- Show highest severity.
- Show route to issue queue or manual custody exception.
- Do not decide liability.

### Next Admin Route Card
Route rules:
- If timeline missing: `Refresh evidence`.
- If fallback present: `Open custody chain`.
- If issue present: `Open issue queue`.
- If mismatch risk: `Open manual custody exception`.
- If delivered: `Open final proof summary`.
- Default: `Open custody chain`.

## Package Facts Panel
Purpose:
- Show the canonical package facts from `delivery.package`.

Required fields:
- Package description.
- Weight.
- Size tier.
- Fragile flag.
- Declared value.
- Service type.
- Doorstep requested.
- Doorstep distance when present.
- Origin station ID.
- Destination station ID.

Presentation:
- Use a structured list, not a paragraph.
- Put operationally critical facts first.
- Use label/value pairs.
- Keep IDs monospaced.
- Show empty optional distance as `Not requested`.

Validation display:
- If `weightKg` is missing due to unexpected contract issue, show `Weight unavailable`.
- If `declaredValueGhs` is `0`, show `No declared value`.
- If `isFragile` is true, show a visible `Handle as fragile` tag.
- If service type is express, show `Express handling`.

Do not:
- Convert declared value into refund promise.
- Use declared value as insurance payout.
- Infer package category from description.
- Let long description break layout.

## Label Evidence Panel
Purpose:
- Explain what the app knows about the package label and scan evidence without direct registry access.

Sections:
- `Registry boundary`
- `First label evidence`
- `Later scan evidence`
- `Fallback evidence`
- `Redaction policy`

### Registry Boundary
Copy:
```text
The package-label registry is enforced by the backend during scan mutations. This page does not receive the registry row directly, so it can show timeline evidence but cannot independently prove registry uniqueness.
```

Required visual:
- Use an amber-neutral information panel.
- Include link: `Open package label registry`.
- If `AdminPackageLabelRegistry` is not wired yet, show route as disabled with `Registry route not available in this build`.

### First Label Evidence
Derive from:
- Delivery timeline event with `metadata.labelScanCode`.
- Handoff event with `metadata.proofType = package_scan`.
- Handoff label `sender to origin station`.

Display:
- Event type.
- Occurred time.
- Station ID.
- Actor role.
- Proof type.
- Redacted proof reference.
- Condition.
- Fallback state.

If missing:
- If delivery status is `created`, show `Package has not reached origin intake yet`.
- If status is after intake and no label evidence exists, show `Label evidence not visible in timeline`.

### Later Scan Evidence
Expected later scan moments:
- Station dispatch readiness.
- Driver origin pickup.
- Destination receipt.
- Final-mile custody acceptance.

For each moment:
- Show whether a timeline event exists.
- Show the event time.
- Show role and station when exposed.
- Show proof type.
- Show redacted proof reference.
- Show fallback state.

Do not:
- Show raw scan code equality.
- Claim two scans match unless backend gives a normalized match result.
- Treat assignment events as custody scans.

### Fallback Evidence
Fallback signals:
- `metadata.fallbackUsed = true`.
- `metadata.supervisorOverrideActorId` present.
- Handoff proof fallback flag exposed in future metadata.

Display:
- `Fallback used`
- `Supervisor override recorded`
- `Review custody chain`

Copy:
```text
Fallback does not mean invalid. It means the package moved with supervised evidence instead of normal scan-only proof.
```

### Redaction Policy
Visible redacted form:
```text
PKG...7F2A
```

If value is unsafe or too short:
```text
Redacted
```

Rules:
- Never include full scan value in `title` attributes.
- Never include full scan value in `aria-label`.
- Never include full scan value in copied text.
- Never include full scan value in logs.
- Never include full scan value in route params.

## Scan Evidence Timeline
Purpose:
- Show scan-related delivery and handoff entries in a focused chronological view.

Source:
- `deliveryTimelineResponse.entries`

Filter rules:
- Include handoff entries with `metadata.proofType = package_scan`.
- Include delivery entries whose metadata contains `labelScanCode`, `packageScanCode`, `condition`, `fallbackUsed`, or `supervisorOverrideActorId`.
- Include issue entries whose metadata category is `damage`, `loss`, or `handoff`.
- Include final proof event summary when current status is `delivered`.

Sort:
- Default sort newest first to match backend response.
- Provide toggle `Oldest first` for chain review.
- Do not mutate backend order; sorting is client presentation only.

Row fields:
- Time.
- Evidence type.
- Lifecycle or handoff label.
- Role.
- Station ID.
- Condition.
- Fallback state.
- Redacted proof reference.
- Risk tag.

Row actions:
- `Open custody event` routes to `AdminCustodyChain` anchored to entry ID when supported.
- `Open related issue` routes to issue screen when entry type is issue and route exists.
- `Copy entry ID` copies only the entry ID.

Empty state:
- Title: `No package scan evidence visible`
- Body: `The delivery detail loaded, but the current timeline does not expose package scan proof for this delivery.`
- Action: `Open custody chain`

Partial state:
- Title: `Timeline unavailable`
- Body: `Package facts are visible, but scan and condition evidence could not load. Refresh before making an operational decision.`
- Action: `Refresh evidence`

## Condition And Damage Panel
Purpose:
- Make package condition visible without mixing it with liability or refund decisions.

Condition sources:
- Intake metadata `condition`.
- Destination receipt metadata `condition`.
- Handoff metadata `condition`.
- Issue metadata category `damage`.
- Issue metadata summary, redacted and length-limited.

States:
- `No condition issue visible`.
- `Damaged condition recorded`.
- `Condition unknown`.
- `Issue present`.
- `Timeline unavailable`.

Display:
- Most recent known condition.
- First known condition.
- Whether damage issue exists.
- Link to issue queue filtered by delivery when available.
- Link to custody chain for full event sequence.

Rules:
- Do not determine who caused damage.
- Do not approve refund.
- Do not expose free text without sanitizing.
- Truncate issue summaries after 160 characters.
- Preserve full text only in the related issue screen if policy allows.

## Current Custody Snapshot
Purpose:
- Show current custody separately from package evidence history.

Fields:
- Current custody role.
- Current custody actor state.
- Latest touchpoint role.
- Latest touchpoint station.
- Latest touchpoint time.
- Assigned driver ID state.
- Assigned final-mile courier ID state.

Display rules:
- `currentCustodyRole = null`: `No active custody holder`.
- `currentCustodyActorId = null`: `Actor not exposed`.
- Assigned IDs are not custody by themselves.
- If assigned driver exists but current custody is station operator, show `Assigned, not custodian`.
- If assigned final-mile courier exists but current custody is station operator, show `Assigned, awaiting custody acceptance`.
- If current status is `delivered`, show `Custody closed by final proof`.

Primary link:
- `Open custody chain`

Secondary link:
- `Open delivery detail`

## Package Stage Map
Purpose:
- Help admins map package stage to expected evidence without showing a public-facing map.

Stages:
1. `Created`
2. `Origin intake`
3. `Origin dispatch readiness`
4. `Driver pickup`
5. `In transit`
6. `Destination receipt`
7. `Pickup queue or final-mile queue`
8. `Final-mile custody`
9. `Delivered or closed`

For each stage show:
- Expected evidence.
- Whether timeline evidence is visible.
- Whether current status has passed that stage.
- Risk tag when evidence is absent after stage should have occurred.

Expected evidence:
- Origin intake: label scan and condition.
- Dispatch readiness: package scan.
- Driver pickup: package scan and driver custody.
- Destination receipt: package scan and condition.
- Final-mile custody: package scan by assigned courier.
- Completion: receiver proof.

Rules:
- Assignment is not custody.
- Dispatch readiness is not custody transfer.
- Missing visible evidence is a review signal, not proof of loss.
- Use `Open custody chain` for full chronology.

## Related Actions
Actions must be route-only or read-only. No mutation from this page.

Primary action:
- `Open custody chain`

Secondary actions:
- `Open delivery detail`
- `Open package label registry`
- `Open blocked queue`
- `Open issue queue`
- `Open manual custody exception`
- `Open audit events`
- `Open origin station`
- `Open destination station`
- `Refresh`

Action visibility:
- `Open package label registry`: show when registry screen route exists.
- `Open manual custody exception`: show when fallback, mismatch risk, issue, or missing evidence exists.
- `Open issue queue`: show when issue entries exist or condition is damaged.
- `Open blocked queue`: show when current status or issue state indicates operational block.
- Station links always use station IDs from delivery.

Disabled states:
- If route is not implemented, render disabled action with contract note.
- If user lacks required capability, hide action or show not-authorized state based on admin shell rules.
- Do not show actions that create false expectation of immediate mutation.

## Loading State
Use skeletons that match the final layout:
- Header identity skeleton.
- Evidence summary rail skeleton.
- Package fact list skeleton.
- Timeline row skeletons.
- Related actions skeleton.

Loading copy:
```text
Loading package evidence...
```

Rules:
- Do not show blank white page.
- Do not show random animated decoration.
- Do not display stale scan data without stale label.
- Announce loading state through a polite status region.

## Ready State
Ready state requires:
- Delivery detail loaded.
- Timeline loaded or explicitly marked partial.
- Package facts rendered.
- Evidence confidence calculated.
- All raw scan-like fields redacted.
- Related actions rendered according to route availability.

The first viewport must include:
- Tracking code.
- Delivery ID.
- Evidence confidence.
- Current status.
- Current custody.
- Package description.
- Primary action.

## Partial Timeline State
Trigger:
- `get_delivery` succeeds.
- `get_delivery_timeline` fails or times out.

UI:
- Keep package facts visible.
- Show alert: `Package facts loaded. Timeline evidence unavailable.`
- Mark confidence as `Partial evidence`.
- Disable event-specific rows.
- Keep `Refresh evidence` visible.
- Keep `Open custody chain` visible if route can attempt reload.

Do not:
- Hide package facts.
- Claim no scan evidence exists.
- Infer condition from delivery detail only.

## Label Evidence Unavailable State
Trigger:
- Delivery and timeline load.
- No direct package-label registry row is available.

UI:
- Show registry-boundary panel.
- Mark confidence as `Registry unavailable`.
- Show timeline evidence if present.
- Link to registry screen when available.

Copy:
```text
The backend enforces package-label matching during scan actions, but this screen does not receive the registry row directly.
```

## Mismatch Risk State
Trigger from current API:
- Issue entry category `handoff`, `loss`, or `damage`.
- Timeline labels or metadata indicate scan mismatch through issue summary.
- API error from a prior linked flow is passed through navigation state.
- Status is advanced but expected package evidence is not visible.

UI:
- Show red risk banner.
- Show `Open manual custody exception`.
- Show `Open custody chain`.
- Show related issue entries.

Copy:
```text
Package evidence needs review before further operational action.
```

Rules:
- Do not declare package lost.
- Do not assign liability.
- Do not trigger refund.

## Exception Present State
Trigger:
- Fallback evidence exists.
- Supervisor override appears in metadata.
- Issue entry exists with handoff or loss category.

UI:
- Show amber exception panel.
- Explain fallback context.
- Route to custody chain and exception review.

Copy:
```text
This package has exception evidence. Review the custody chain before making an operational decision.
```

## Not Found State
Trigger:
- `get_delivery` returns `NOT_FOUND`.

UI:
- Title: `Delivery not found`
- Body: `No package evidence can be loaded for this delivery reference.`
- Actions:
  - `Back to delivery search`
  - `Open support`

Rules:
- Do not retry in a loop.
- Do not expose route ID beyond the visible delivery reference.

## Not Authorized State
Trigger:
- API returns `FORBIDDEN`.

UI:
- Title: `Access denied`
- Body: `Your admin role cannot view this package record.`
- Actions:
  - `Back`
  - `Open support`

Rules:
- Do not reveal whether the package exists beyond the authorized response.
- Do not show cached package facts after authorization failure.

## Session Expired State
Trigger:
- Auth token is expired or missing.

UI:
- Title: `Session expired`
- Body: `Sign in again to view package evidence.`
- Action: `Sign in`

Rules:
- Clear package data from memory.
- Do not preserve raw timeline metadata.

## API Error State
Trigger:
- Network or server error not covered above.

UI:
- Title: `Package evidence could not load`
- Body: `Refresh the page. If this continues, open support with the delivery ID.`
- Actions:
  - `Retry`
  - `Open support`

Support payload:
- Include delivery ID.
- Include endpoint name.
- Include timestamp.
- Exclude scan references.
- Exclude receiver phone.
- Exclude receiver address.
- Exclude proof references.

## Security And Privacy
Protected data:
- Receiver phone.
- Receiver address.
- Raw package scan code.
- Raw label scan code.
- Raw proof reference.
- Raw proof asset path.
- Current custody actor ID.
- Supervisor override actor ID.
- Payment provider reference.
- Free-text issue summaries that may contain personal data.

Default protection:
- Hide receiver phone and address entirely.
- Redact scan and proof references.
- Limit issue summary display.
- Do not expose actor IDs in default view.
- Do not write sensitive fields to analytics.
- Do not include sensitive fields in copied text.

Audit-sensitive future behavior:
- If future product requires raw scan reveal, it must be a separate audited workflow.
- That workflow must require explicit reason, role check, visible warning, and audit event.
- This spec does not authorize raw reveal.

## Accessibility Requirements
Semantics:
- Page has one `h1`.
- Each major panel uses a logical heading.
- Timeline is a list or table with accessible row labels.
- Status and error messages use `role="status"` or `aria-live="polite"` as appropriate.
- Critical errors use `role="alert"` only when immediate attention is required.

Keyboard:
- All actions reachable by keyboard.
- Timeline sort toggle reachable by keyboard.
- Focus order follows visual order.
- Refresh does not move focus unless recovery requires it.
- Disabled route actions must be explainable with accessible text.

Focus:
- Visible focus indicator must meet WCAG focus appearance guidance.
- Focus ring must not rely on color alone.
- Focus must remain visible on dense timeline rows.

Screen reader:
- Redacted scan references announced as `Redacted package scan reference`.
- Evidence confidence announced with label and reason.
- Timeline row announced with time, event type, condition, and risk state.
- Refresh result announced without moving focus.

Color:
- Status chips must include text labels.
- Red, amber, and green must never be the only signal.
- Text contrast must meet WCAG AA at minimum.

## Responsive Rules
Desktop:
- Two-column evidence desk.
- Right rail sticky.
- Timeline table can use compact density.

Tablet:
- Single column.
- Evidence summary moves above timeline.
- Timeline table becomes stacked row cards if width is constrained.

Mobile:
- Single column.
- Top actions wrap.
- Package facts remain readable.
- Timeline rows use card layout.
- IDs truncate with accessible full text.
- No raw data in hidden overflow title text.

Print:
- Provide a print-safe case summary when browser print is used.
- Print must still redact scan references.
- Print must show timestamp and admin role.
- Print must not include receiver phone or address.

## Motion
Use restrained motion:
- Fade in panel content after load.
- Use subtle row highlight after refresh when a new event appears.
- Use no looping animation.
- Respect `prefers-reduced-motion`.
- Do not animate sensitive values.

Motion must clarify state changes, not create spectacle.

## Analytics
Events:
- `admin_package_detail_viewed`
- `admin_package_detail_refreshed`
- `admin_package_timeline_partial`
- `admin_package_registry_link_clicked`
- `admin_package_custody_chain_clicked`
- `admin_package_issue_route_clicked`
- `admin_package_exception_route_clicked`

Allowed properties:
- `deliveryId`
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `currentCustodyRole`
- `evidenceConfidence`
- `timelineEntryCount`
- `riskFlagCount`
- `hasFallback`
- `hasConditionIssue`
- `hasIssueEvent`

Forbidden properties:
- Receiver phone.
- Receiver address.
- Package description free text.
- Raw scan code.
- Raw proof reference.
- Raw actor ID.
- Supervisor override actor ID.
- Issue summary free text.
- Payment provider reference.

## Test Plan
### Contract Tests
- Renders delivery package facts from `deliveryDetailResponseSchema`.
- Renders current custody from `currentCustodyRole`.
- Handles `currentCustodyRole = null`.
- Handles `currentCustodyActorId = null`.
- Renders timeline entries from `deliveryTimelineResponseSchema`.
- Handles missing timeline metadata.
- Handles unexpected metadata shape.
- Handles empty timeline entries.
- Handles final proof when present.
- Handles no final proof.

### Redaction Tests
- Full package scan code never renders.
- Full label scan code never renders.
- Full proof reference never renders.
- Full receiver phone never renders.
- Full receiver address never renders.
- Raw actor ID does not render in default view.
- Copied scan reference is redacted.
- Analytics payload excludes sensitive fields.
- Support payload excludes sensitive fields.

### State Tests
- Loading state renders.
- Ready state renders.
- Partial timeline state renders when timeline fails.
- Label evidence unavailable state renders without registry endpoint.
- Mismatch risk state renders from issue evidence.
- Exception present state renders from fallback metadata.
- Not found state renders.
- Not authorized state clears visible package data.
- Session expired state clears visible package data.
- API error state offers retry.
- Refresh keeps stale content visibly marked.

### Evidence Tests
- Created delivery shows package not received.
- Intake timeline with label evidence shows scan evidence recorded.
- Handoff timeline with package scan proof shows scan proof row.
- Fallback metadata shows fallback panel.
- Damaged condition shows condition issue.
- Issue category `damage` shows risk flag.
- Issue category `loss` shows risk flag.
- Issue category `handoff` shows risk flag.
- Delivered delivery with final proof shows completion summary.
- Assignment events do not count as custody transfer.
- Dispatch readiness does not count as custody transfer.

### Accessibility Tests
- Page has one `h1`.
- Breadcrumb uses `aria-current`.
- Loading and refresh status are announced.
- Timeline rows are keyboard reachable.
- Focus indicator is visible on actions and row controls.
- Color-only status does not exist.
- Screen reader labels redacted references correctly.
- Narrow viewport has no horizontal scroll for core facts.

### Visual Regression Tests
- Desktop two-column layout.
- Tablet one-column layout.
- Mobile card timeline.
- Long package description wraps safely.
- Long delivery ID truncates safely.
- Long station ID does not break layout.
- Empty evidence state remains balanced.
- Partial timeline state remains clear.

## Acceptance Criteria
- The screen is reachable at `/admin/deliveries/:deliveryId/package`.
- Primary root has `data-testid="screen-admin-package-detail"`.
- The screen calls `get_delivery`.
- The screen calls `get_delivery_timeline`.
- Package facts come from `delivery.package`.
- Timeline evidence comes from `deliveryTimelineResponse.entries`.
- Direct package-label registry detail is marked unavailable unless a registry endpoint is used.
- Full raw scan codes never render.
- Full raw proof references never render.
- Receiver phone and address do not render.
- Current custody is shown separately from historical timeline.
- Assignment is not shown as custody.
- Fallback evidence is visible when metadata exposes it.
- Damaged condition and relevant issue categories show risk.
- Partial timeline failure keeps package facts visible.
- All admin actions are route-only or refresh-only.
- No mutation endpoint is called from this screen.
- Accessibility states are announced.
- Analytics excludes protected data.

## Implementation Notes For Claude Code
Build this as a read-only admin route.

Recommended data hooks:
- `useAdminDeliveryDetail(deliveryId)`
- `useAdminDeliveryTimeline(deliveryId)`
- `usePackageEvidenceModel(detail, timeline)`
- `useRedactedReference(value)`

Recommended components:
- `AdminPackageIdentityHeader`
- `PackageEvidenceSummaryRail`
- `PackageFactsPanel`
- `LabelEvidencePanel`
- `PackageScanTimeline`
- `ConditionAndDamagePanel`
- `CurrentCustodySnapshot`
- `PackageStageMap`
- `RelatedAdminActions`
- `PackageEvidenceStateView`

Implementation guardrails:
- Keep raw API data inside query scope.
- Pass redacted values into presentational components.
- Validate metadata before rendering.
- Treat missing timeline as partial evidence.
- Keep registry limitations explicit.
- Do not create local package-verification authority.
- Do not call lifecycle mutation endpoints.
- Do not build raw reveal UI.

Suggested rendering sequence:
1. Validate `deliveryId`.
2. Load detail and timeline.
3. Render identity header as soon as detail exists.
4. Derive evidence confidence.
5. Render package facts.
6. Render registry boundary.
7. Render scan evidence timeline.
8. Render condition and issue risk.
9. Render custody snapshot.
10. Render related actions.
11. Add redaction and analytics tests.
12. Add responsive and accessibility tests.

## Future Enhancements
Useful backend additions:
- Admin package-label registry lookup by delivery ID.
- Normalized package evidence endpoint.
- Server-side scan match summary.
- Server-side package condition history.
- Audited raw scan reveal workflow for restricted roles.
- Package label reprint audit endpoint.
- Package damage evidence asset endpoint.
- Custody exception detail endpoint.
- Station and user display-name expansion with privacy policy.

Useful frontend additions after backend support:
- Direct registry row panel.
- Server-generated evidence confidence.
- Anchored custody-chain entry route.
- Restricted reveal request flow.
- Exportable redacted case report.
- Issue queue filtered by package risk.
- Audit-events panel scoped to delivery package.

## Done Definition
The screen is complete when:
- It gives admins a trustworthy package evidence view.
- It uses only current backend contracts.
- It makes registry gaps explicit.
- It separates current custody from evidence history.
- It redacts scan and proof data.
- It surfaces fallback, damage, issue, and mismatch risk.
- It routes deeper investigation to the correct admin screens.
- It works on desktop, tablet, and narrow browser widths.
- It passes unit, accessibility, redaction, analytics, and responsive tests.
- It does not implement any frontend UI beyond the specification file in this repository pass.

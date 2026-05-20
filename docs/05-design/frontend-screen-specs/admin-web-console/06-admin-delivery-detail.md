# AdminDeliveryDetail Screen Specification

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AdminDeliveryDetail` |
| Route | `/admin/deliveries/:deliveryId` |
| Primary test ID | `screen-admin-delivery-detail` |
| Surface | Admin web console |
| Backend coverage | `get_delivery` through `GET /v1/deliveries/:id`; optional links to related admin screens |
| Offline critical | No |
| Required role | `ops_admin`, `support_admin`, `finance_admin`, or `super_admin` |
| Required states | `loading`, `ready`, `not_found`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | `AdminDeliveryExplorer`, protected admin shell |
| Related screens | `AdminPackageDetail`, `AdminCustodyChain`, `AdminIssueQueue`, `AdminPaymentReconciliation`, `AdminRefundEvidenceReview`, `AdminAuditEvents`, `AdminUserDetail`, `AdminStationDetail` |
| Current implementation mode | Read-only delivery record view using the shared delivery detail endpoint |

## Outcome
`AdminDeliveryDetail` gives admins a single, safe, evidence-led view of one delivery so they can decide the next investigation route without mutating delivery state from this page.

The screen must answer:
- `What delivery is this?`
- `What is its current lifecycle status?`
- `What is the current payment status?`
- `Who currently holds custody?`
- `Which staff actors are assigned?`
- `Where did it start and where should it go?`
- `What package facts are on record?`
- `What receiver context is safe to show?`
- `Is final delivery proof attached?`
- `Which deeper admin screen owns the next action?`

The page is a read-only record. It is not a workflow screen, not a custody chain, not a proof gallery, not a refund decision screen, and not a support issue thread.

## Product Definition
This screen allows admins to:
- Load one delivery by `deliveryId`.
- Review canonical delivery identifiers.
- Review current delivery status.
- Review payment status.
- Review service type.
- Review doorstep request state.
- Review origin and destination station IDs.
- Review sender ID.
- Review receiver name.
- Review masked receiver contact and address handling.
- Review package description, weight, size tier, fragile flag, and declared value.
- Review quote amount.
- Review current custody role and actor ID.
- Review assigned driver and final-mile courier IDs.
- Review latest event and latest touchpoint.
- Review final proof summary when attached.
- Open package detail.
- Open custody chain.
- Open issue queue filtered by delivery when route support exists.
- Open payment reconciliation or refund evidence review when relevant.
- Open station detail for origin or destination.
- Refresh the detail.

It does not allow admins to:
- Change delivery status.
- Cancel delivery.
- Assign driver.
- Assign courier.
- Confirm intake.
- Confirm pickup.
- Mark in transit.
- Receive destination.
- Complete delivery.
- Record failed attempt.
- Upload proof.
- Resolve issue.
- Approve refund.
- Settle refund.
- Edit receiver data.
- Edit package data.
- Edit quote.
- Reveal full receiver phone or address without an audited reveal workflow.
- View raw proof asset bytes.
- View raw payment provider payloads.

## Backend Boundary
This admin screen uses the shared authenticated delivery detail endpoint:
```http
GET /v1/deliveries/:id
```

Operation:
```text
get_delivery
```

Important backend facts:
- There is no admin-only delivery detail endpoint today.
- Admin roles pass the shared `assertCanAccessDelivery` policy.
- The endpoint returns a rich delivery detail payload.
- The endpoint includes receiver phone and optional address because other authenticated workflows use the same contract.
- The admin UI must still minimize exposure by default.
- The endpoint does not return issue list.
- The endpoint does not return full custody timeline.
- The endpoint does not return payment provider references.
- The endpoint does not return station names.
- The endpoint does not return sender profile details.

Therefore:
- The default screen must show safe delivery facts.
- Full custody history belongs in `AdminCustodyChain`.
- Package evidence belongs in `AdminPackageDetail`.
- Issue work belongs in `AdminIssueQueue` and `AdminIssueDetail`.
- Payment mismatch work belongs in `AdminPaymentReconciliation`.
- Refund evidence belongs in `AdminRefundEvidenceReview`.
- Station context belongs in `AdminStationDetail`.
- User context belongs in `AdminUserDetail`.

## Users
Primary:
- `ops_admin` checking lifecycle, custody, station, package, and assignment context.
- `support_admin` verifying delivery facts before issue triage.
- `finance_admin` checking payment status, quote, and refund context.
- `super_admin` reviewing high-risk delivery records.

Secondary:
- QA validating delivery detail and permissions.
- Security reviewers validating personal data exposure.
- Engineering leads validating frontend and backend contract boundaries.
- Claude Code implementing the admin console later.

## Entry Points
The screen can open from:
- `AdminDeliveryExplorer` row action.
- `AdminBlockedDeliveryQueue` row action.
- `AdminIssueDetail` related delivery link.
- `AdminPaymentReconciliationDetail` related delivery link.
- `AdminRefundEvidenceReview` related delivery link.
- `AdminStationDetail` queue row.
- `AdminAuditEventDetail` related object link.
- Direct route `/admin/deliveries/:deliveryId`.

The screen must not be reachable:
- Without admin authorization.
- From public web.
- From receiver public tracking.
- From sender mobile unless using the sender-specific route.
- From station, driver, or courier mobile shells.

## Real-World Context
Admins open this page when a delivery is late, disputed, blocked, damaged, failed, unpaid, refunded, or tied to a support issue. The page must make the current truth obvious without encouraging unsafe direct operations.

The screen must support:
- Fast investigation.
- Safe personal data handling.
- Clear route to deeper owner screens.
- Consistent status language.
- Keyboard-heavy support workflows.
- Finance review without raw provider data.
- Ops review without accidental mutation.

## User Goal
Primary goal:
- Understand the current state of one delivery and open the correct next admin screen.

Secondary goals:
- Verify identity using delivery ID and tracking code.
- Confirm current status and payment status.
- Confirm custody holder.
- Confirm assignment IDs.
- Confirm route and service type.
- Confirm package and declared value.
- Confirm final proof summary.
- Determine whether issue, custody, finance, station, user, or package detail is the next path.

## Scope
In scope:
- Detail fetch by delivery ID.
- Safe identity summary.
- Lifecycle summary.
- Payment summary.
- Service and route summary.
- Sender and receiver summary with privacy controls.
- Package summary.
- Custody and assignment summary.
- Latest event and latest touchpoint summary.
- Final proof summary.
- Related navigation cards.
- Loading, stale, error, not found, unauthorized, and session expired states.
- Accessibility.
- Analytics.
- Security and privacy boundaries.

Out of scope:
- Delivery mutations.
- Full custody timeline.
- Full issue thread.
- Full payment ledger.
- Raw provider payloads.
- Proof asset rendering.
- Receiver contact edit.
- Package edit.
- Station edit.
- User edit.
- Audit event list.
- Export.

## Design Thesis
This screen should feel like a secure operations case file: compact, precise, layered, and careful with sensitive information.

Visual thesis:
- `delivery case file`: crisp identity header, status spine, evidence cards, masked personal data, clear next-action routes, and a restrained timeline preview.

Design principles:
- Identity first, then risk.
- Status and custody must be visible without scrolling.
- Sensitive fields are masked or withheld by default.
- Every action opens an owner screen.
- Read-only must be visually clear.
- Unknown or unavailable related data must be labeled.
- Do not make admins infer backend truth from decoration.

Restraint rule:
- No map, no proof gallery, no mutation toolbar, no customer-service chat panel, no raw IDs beyond contract fields, and no unsupported issue or audit feed.

## Research Inputs
Relevant external references:
- [IBM Carbon structured list](https://carbondesignsystem.com/components/structured-list/usage/): supports dense key-value record presentation in enterprise products.
- [IBM Carbon data table](https://carbondesignsystem.com/components/data-table/usage/): supports compact related row and action patterns.
- [USWDS summary box](https://designsystem.digital.gov/components/summary-box/): supports highlighting the most important record facts and next steps.
- [Material Design tabs](https://m3.material.io/components/tabs/overview): supports disciplined section switching when detail pages contain several evidence groups.
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html): supports not logging sensitive personal or payment data.
- [WCAG focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation across header, evidence cards, and related actions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports announcing loading, refresh, errors, and data state changes.

Internal references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/05-admin-delivery-explorer.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/permissions-matrix.md`
- `docs/09-payments/hubtel-flow.md`
- `docs/04-features/payments-spec.md`
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/state-machine.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/auth.ts`
- `services/api/src/routes.ts`
- `services/api/src/app.ts`

## Backend Contract
Endpoint:
```http
GET /v1/deliveries/:id
```

Operation:
```text
get_delivery
```

Auth:
- Authenticated bearer token.
- Admin roles are allowed by `assertCanAccessDelivery`.
- Non-admin actors are scoped by sender, station, driver, or courier rules.

Response:
```json
{
  "deliveryId": "DEL-9201",
  "trackingCode": "KRA-9201",
  "senderId": "USR-SEN-001",
  "originStationId": "ST-ACC-01",
  "destinationStationId": "ST-KMS-01",
  "currentStatus": "received_at_destination",
  "paymentStatus": "confirmed",
  "serviceType": "standard",
  "doorstepRequested": true,
  "doorstepDistanceKm": 4.2,
  "receiver": {
    "name": "Ama Mensah",
    "phone": "+233555000000",
    "addressText": "North Ridge, Accra"
  },
  "package": {
    "description": "Books",
    "weightKg": 2.4,
    "sizeTier": "medium",
    "isFragile": false,
    "declaredValueGhs": 200
  },
  "quote": {
    "currency": "GHS",
    "amount": 4500
  },
  "currentCustodyRole": "station_operator",
  "currentCustodyActorId": "USR-OP-002",
  "assignedDriverId": "USR-DRV-001",
  "assignedFinalMileCourierId": "USR-FMC-001",
  "latestEvent": {
    "type": "delivery_received_at_destination",
    "occurredAt": "2026-05-16T14:00:00.000Z"
  },
  "latestTouchpoint": {
    "role": "station_operator",
    "stationId": "ST-KMS-01",
    "occurredAt": "2026-05-16T14:00:00.000Z"
  },
  "finalProof": {
    "type": "otp",
    "reference": "PROOF-123",
    "receivedByName": "Ama Mensah",
    "capturedAt": "2026-05-16T18:00:00.000Z"
  },
  "createdAt": "2026-05-16T09:00:00.000Z"
}
```

## Data Presentation Rules
Primary identity:
- `trackingCode`
- `deliveryId`
- `currentStatus`
- `paymentStatus`

Secondary identity:
- `senderId`
- `originStationId`
- `destinationStationId`
- `createdAt`

Sensitive but returned:
- `receiver.phone`
- `receiver.addressText`
- `finalProof.reference`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`

Default handling:
- Show receiver name.
- Mask receiver phone by default.
- Mask receiver address by default.
- Show proof type and captured time.
- Hide or truncate proof reference by default.
- Show staff actor IDs because admin operations need custody and assignment context, but do not emit them to analytics.

Reveal handling:
- Do not reveal full phone or address unless a future audited reveal workflow exists.
- If future reveal exists, require reason selection and audit event before reveal.
- Current spec should show masked fields and route to support or custody owner screens instead.

## Required Layout
Desktop layout:
- Protected admin shell.
- Breadcrumb.
- Identity header.
- Risk and status summary.
- Two-column body.
- Main column:
  - Lifecycle and payment.
  - Route and service.
  - Custody and assignments.
  - Package.
  - Receiver.
  - Proof summary.
- Side column:
  - Related actions.
  - Latest event and touchpoint.
  - Data sensitivity notice.
  - Snapshot metadata.

Tablet layout:
- Identity header full width.
- Related actions directly below header.
- Evidence cards in two columns.
- Sensitive receiver panel below package.

Mobile-width web layout:
- Single column.
- Identity header.
- Status summary.
- Related actions.
- Evidence cards.
- Sensitive fields remain masked.

Minimum content order:
1. Skip link.
2. Admin shell.
3. Breadcrumb.
4. Page title.
5. Delivery identity.
6. Status and payment.
7. Related actions.
8. Custody and assignments.
9. Route and service.
10. Package.
11. Receiver.
12. Proof.
13. Latest event and touchpoint.
14. Metadata.

## Breadcrumb
Path:
- `Admin`
- `Deliveries`
- `{trackingCode or deliveryId}`

Behavior:
- `Admin` links to `/admin`.
- `Deliveries` links to `/admin/deliveries`.
- Current crumb uses tracking code after data loads.
- Before data loads, current crumb can use route delivery ID.

Accessibility:
- Use `nav` with `aria-label="Breadcrumbs"`.
- Use ordered list semantics.
- Current crumb uses `aria-current="page"`.

## Identity Header
Title:
```text
Delivery {trackingCode}
```

Fallback title before data load:
```text
Delivery {deliveryId}
```

Header facts:
- Delivery ID.
- Tracking code.
- Current status.
- Payment status.
- Created date.
- Latest event date.

Header actions:
- `Refresh`
- `Open package`
- `Open custody chain`
- `Back to deliveries`

Header must show:
- Read-only label.
- Source: `get_delivery`.
- Last refreshed time.

Header must not show:
- Receiver phone.
- Receiver address.
- Proof reference.
- Raw error details.

## Status Summary
Status summary is the first evidence section.

Fields:
- Current status.
- Payment status.
- Latest event type.
- Latest event timestamp.
- Latest touchpoint role.
- Latest touchpoint station when present.

Status tone:
- Critical: `issue_reported`, `on_hold`, `delivery_failed`, payment `failed`, payment `refund_pending`.
- Warning: `pending`, `draft`, `created`, or stale latest event.
- Clear: `confirmed` payment with active progress, `delivered`, or `closed`.

Rules:
- Always show exact backend status.
- Use readable labels in addition to raw status.
- Do not derive a new status.
- Do not show a timeline unless `get_delivery_timeline` is called by a child screen.

## Payment Summary
Fields:
- Payment status.
- Quote currency.
- Quote amount.
- Refund-related status when payment status is `refund_pending` or `refunded`.

Formatting:
- Quote amount is stored as integer minor units.
- Display as `GHS {amount / 100}` only if existing money formatter uses this convention.
- If money formatter is not established, display both safe label and integer amount with docs-backed formatting decision before implementation.

Actions:
- `Open payment reconciliation` when payment status is `failed`, `refund_pending`, or admin needs review.
- `Open refund evidence` when payment status is `refund_pending` or `refunded`.

Rules:
- Do not show provider reference.
- Do not initiate refund here.
- Do not verify payment here.
- Do not settle refund here.

## Route And Service Summary
Fields:
- Origin station ID.
- Destination station ID.
- Service type.
- Doorstep requested.
- Doorstep distance when present.

Actions:
- `Open origin station`
- `Open destination station`

Display rules:
- Do not invent station names.
- Use station IDs unless station detail lookup is explicitly added later.
- Doorstep distance is shown only when present.
- Doorstep requested is shown as yes or no.

## Custody And Assignment Summary
Fields:
- Current custody role.
- Current custody actor ID.
- Assigned driver ID.
- Assigned final-mile courier ID.
- Latest touchpoint role.
- Latest touchpoint station ID.

Current custody role labels:
- `station_operator`: `Station operator`
- `driver`: `Driver`
- `final_mile_courier`: `Final-mile courier`
- `null`: `No active custody role returned`

Actions:
- `Open custody chain`
- `Open staff activity`
- `Open user detail` when user detail route exists.

Rules:
- Show actor IDs as operational IDs.
- Do not show staff names unless a future user join exists.
- Do not infer custody history from current custody fields.
- Do not mark custody as safe without timeline evidence.
- Route full evidence review to `AdminCustodyChain`.

## Package Summary
Fields:
- Package description.
- Weight in kilograms.
- Size tier.
- Fragile flag.
- Declared value in GHS.

Actions:
- `Open package detail`
- `Open custody chain`

Rules:
- Package description is operationally sensitive.
- Do not emit package description to analytics.
- Do not copy package description.
- Declared value must not be used for refund decision on this screen alone.
- Do not render package label scan code unless future endpoint returns it and package detail screen governs it.

## Receiver Summary
Fields:
- Receiver name.
- Masked phone.
- Masked address if present.

Default copy:
```text
Receiver contact is masked on this page. Use approved support workflows for contact-sensitive actions.
```

Masking:
- Phone: show country code and last two digits only when formatting is reliable.
- Address: show `Address on file` when present, not the full address.
- If address absent, show `No address returned`.

Actions:
- `Open issue queue`
- `Open public tracking support context` only if route exists later.

Rules:
- Do not show full phone.
- Do not show full address.
- Do not put receiver name in analytics.
- Do not allow copying receiver fields.
- Do not reveal fields through tooltip.

## Final Proof Summary
Show when `finalProof` exists.

Fields:
- Proof type.
- Captured at.
- Received by name.
- Masked proof reference.

Proof type labels:
- `otp`: `OTP`
- `signature`: `Signature`
- `delivery_photo`: `Delivery photo`

Actions:
- `Open custody chain`
- `Open package detail`

Rules:
- Do not render proof image.
- Do not render signature image.
- Do not render full proof reference by default.
- Do not download proof.
- Do not treat proof alone as enough for refund or dispute decision.

No proof state:
- Text: `No final delivery proof is attached to this delivery yet.`
- This is neutral unless status is `delivered`.
- If status is `delivered` and no final proof exists, show warning and route to custody chain.

## Latest Event And Touchpoint
Latest event fields:
- Event type.
- Occurred at.

Latest touchpoint fields:
- Role.
- Station ID when present.
- Occurred at.

Display:
- Human-readable labels.
- Exact timestamp available.
- Relative time visible.

Rules:
- Do not show full timeline.
- Do not infer missing handoff evidence.
- Link to `AdminCustodyChain` for full timeline.

## Related Action Cards
Required related actions:
- `Open package detail`
- `Open custody chain`
- `Open issue queue`
- `Open payment reconciliation`
- `Open refund evidence`
- `Open audit events`
- `Open origin station`
- `Open destination station`
- `Open sender user`
- `Open assigned driver`
- `Open assigned courier`

Action availability:
- Enabled only when route exists and required ID is present.
- Disabled with clear reason when route is not implemented yet.
- Never route to a public page.

Recommended action priority:
1. Custody chain for custody, proof, or lifecycle uncertainty.
2. Package detail for package, label, or scan context.
3. Issue queue for issue-like delivery statuses.
4. Payment reconciliation for payment risk.
5. Refund evidence for refund states.
6. Station details for station context.
7. User detail for staff or sender context.

## Loading State
Initial loading:
- Show breadcrumb.
- Show identity header skeleton.
- Show status summary skeleton.
- Show evidence card skeletons.
- Announce `Loading delivery detail`.

Rules:
- Do not show stale delivery data without label.
- Do not show receiver fields until data loads.
- Do not show not found before request completes.

Refreshing:
- Keep current data visible.
- Show refresh indicator near header.
- Announce `Refreshing delivery detail`.
- On success, update all fields.
- On failure, keep old data with refresh error banner.

## Stale State
Stale based on client-side age since last successful fetch.

Recommended threshold:
- Older than 5 minutes: show stale notice.
- Older than 15 minutes: strong stale notice.

Stale copy:
```text
This delivery detail may be stale. Refresh before acting on this record.
```

Rules:
- Do not change status locally.
- Do not hide data.
- Do not enable mutation actions.
- Do not reveal sensitive fields due to stale data.

## Not Found State
When backend returns `NOT_FOUND`:
- Title: `Delivery not found`
- Body: `No delivery record was found for this ID.`
- Primary CTA: `Back to delivery explorer`
- Secondary CTA: `Refresh`

Rules:
- Do not show route ID in analytics.
- Do not guess tracking code.
- Do not search local explorer rows unless user returns to explorer.

## Not Authorized State
When backend returns forbidden:
- Title: `Delivery access denied`
- Body: `Your current admin session cannot view this delivery record.`
- CTA: `Back to delivery explorer`

Rules:
- Do not reveal delivery existence beyond backend error semantics.
- Do not show stale data from another session.
- Clear in-memory detail on sign out.

## Session Expired State
Content:
- Title: `Session expired`
- Body: `Sign in again to review this delivery.`
- CTA: `Sign in again`

Rules:
- Preserve safe return path.
- Do not retain detail payload after session expiration.

## API Error State
Content:
- Title: `Delivery detail unavailable`
- Body: `The delivery detail could not be loaded.`
- CTA: `Retry`
- Secondary CTA: `Back to delivery explorer`

Rules:
- Show request ID when available.
- Do not expose raw error.
- Do not expose stack trace.

## Security And Privacy
Security rules:
- Require admin role.
- Do not store detail payload in local storage.
- Do not store detail payload in indexed database.
- Clear in-memory data on sign out.
- Do not log detail payload to console.
- Do not emit sensitive fields to analytics.
- Do not put receiver phone or address in URL.
- Do not put proof reference in URL.
- Do not expose raw proof reference through hidden DOM text.

Sensitive fields:
- `receiver.phone`
- `receiver.addressText`
- `package.description`
- `finalProof.reference`
- `currentCustodyActorId`
- `assignedDriverId`
- `assignedFinalMileCourierId`
- `senderId`

Analytics and logs must not include these values.

Privacy defaults:
- Receiver contact masked.
- Address withheld.
- Proof reference masked.
- Package description visible to admin but not copyable by default.
- Actor IDs visible but not emitted.

## Accessibility Requirements
Semantic structure:
- One `h1`.
- Breadcrumb `nav`.
- Summary sections use `h2`.
- Key-value data uses definition list or accessible structured list.
- Related actions use list semantics.
- Status changes announced.

Keyboard:
- Refresh reachable.
- Related actions reachable before long evidence.
- Copy ID actions reachable.
- No focus trap.
- Disabled actions state announced.

Screen reader:
- Status badges include text labels.
- Payment status includes text label.
- Masked fields are announced as masked.
- Exact timestamps available.
- Read-only page state announced.

Contrast:
- Status and payment badges meet WCAG AA.
- Warning and critical panels meet text contrast.
- Masked-sensitive notices readable.

Motion:
- Minimal load transitions.
- No pulsing status.
- Respect `prefers-reduced-motion`.

## Responsive Rules
Desktop:
- Two-column case-file layout.
- Sticky side action panel only if it does not create focus-order confusion.
- Evidence sections stay readable.

Tablet:
- Related action panel moves below header.
- Evidence cards in two columns.

Mobile-width:
- Single-column cards.
- Receiver masking notice remains near receiver section.
- Status and payment remain above fold.
- Related actions use full-width links.

## Analytics
Emit:
- `admin_delivery_detail_viewed`
- `admin_delivery_detail_refreshed`
- `admin_delivery_detail_related_action_clicked`
- `admin_delivery_detail_copy_id_clicked`
- `admin_delivery_detail_stale_seen`
- `admin_delivery_detail_error_seen`
- `admin_delivery_detail_not_found_seen`
- `admin_delivery_detail_denied_seen`

Event properties:
- `currentStatus`
- `paymentStatus`
- `serviceType`
- `doorstepRequested`
- `hasFinalProof`
- `hasAssignedDriver`
- `hasAssignedCourier`
- `hasCurrentCustody`
- `relatedAction`
- `ageBucket`

Do not emit:
- Delivery ID.
- Tracking code.
- Sender ID.
- Receiver name.
- Receiver phone.
- Receiver address.
- Package description.
- Proof reference.
- Actor IDs.

## Test Plan
Unit tests:
- Renders loading state.
- Renders ready state.
- Renders not found state.
- Renders denied state.
- Renders session expired state.
- Renders API error state.
- Shows delivery ID and tracking code.
- Shows current status and payment status.
- Shows service type and doorstep state.
- Shows route station IDs.
- Shows quote.
- Shows package fields.
- Masks receiver phone.
- Masks receiver address.
- Does not render full receiver phone.
- Does not render full receiver address.
- Shows custody role and actor ID.
- Shows assigned driver when present.
- Shows assigned courier when present.
- Shows final proof summary when present.
- Shows no-proof state when absent.
- Warns when delivered without final proof.
- Shows latest event.
- Shows latest touchpoint.
- Disables unavailable related actions with reason.
- Keeps current data visible on refresh.
- Shows stale warning after threshold.

Integration tests:
- Calls `GET /v1/deliveries/:id` on route entry.
- Does not call delivery mutation endpoints.
- Does not call payment mutation endpoints.
- Does not call issue mutation endpoints.
- Refresh calls same endpoint once.
- Package action routes to `/admin/deliveries/:deliveryId/package`.
- Custody action routes to `/admin/deliveries/:deliveryId/custody`.
- Issue action routes to issue queue when supported.
- Payment action routes to reconciliation when relevant.
- Station actions route to station details.
- Session expiration clears detail and routes to sign-in.

Accessibility tests:
- `screen-admin-delivery-detail` exists.
- Page has one `h1`.
- Breadcrumb uses `nav`.
- Read-only state is announced.
- Masked contact fields are announced as masked.
- Related actions are keyboard reachable.
- Disabled actions are announced.
- Status badges are not color-only.
- Axe scan has no serious or critical violations.

End-to-end tests:
- Admin opens delivery detail from delivery explorer.
- Admin sees status, payment, route, custody, package, and proof summary.
- Admin opens custody chain from detail.
- Admin opens package detail from detail.
- Delivered delivery without proof shows warning.
- Unauthorized sender cannot open admin route.
- Admin session expiration redirects safely.

Visual regression tests:
- Desktop ready state.
- Desktop issue-like status.
- Desktop delivered with proof.
- Desktop delivered without proof.
- Mobile-width ready state.
- Stale state.
- Not found state.
- API error state.

## Acceptance Criteria
The screen is complete only when:
- Route `/admin/deliveries/:deliveryId` renders protected admin page.
- Primary test ID is `screen-admin-delivery-detail`.
- Screen reads `get_delivery`.
- Screen does not invent an admin-only detail endpoint.
- Screen shows identity, status, payment, route, service, package, receiver, custody, assignments, latest event, latest touchpoint, and proof summary.
- Receiver phone and address are masked by default.
- Proof reference is masked or withheld by default.
- Package description is not emitted to analytics.
- No delivery, payment, issue, proof, station, or user mutation endpoint is called.
- Related actions route to real owner screens or show a clear unavailable state.
- Loading, refresh, stale, not found, denied, session expired, and API error states work.
- Accessibility tests pass.
- Analytics exclude sensitive identifiers and personal data.

## Implementation Notes For Claude Code
Build this screen as a read-only admin route using the shared delivery detail API.

Use:
- `deliveryDetailResponseSchema`
- operation key `get_delivery`
- endpoint `/v1/deliveries/:id`

Recommended component structure:
- `AdminDeliveryDetailPage`
- `AdminDeliveryIdentityHeader`
- `AdminDeliveryStatusSummary`
- `AdminDeliveryPaymentSummary`
- `AdminDeliveryRouteSummary`
- `AdminDeliveryCustodySummary`
- `AdminDeliveryPackageSummary`
- `AdminDeliveryReceiverSummary`
- `AdminDeliveryProofSummary`
- `AdminDeliveryRelatedActions`
- `AdminDeliveryDetailErrorState`

Required implementation boundaries:
- Do not implement any delivery lifecycle mutation.
- Do not reveal full receiver phone or address.
- Do not render proof assets.
- Do not fetch full timeline unless the user opens custody chain.
- Do not fetch issue thread unless the user opens issue queue.
- Do not fetch payment provider payloads.
- Do not store detail data durably in the browser.

## Future Enhancements
Possible additions after backend support:
- Admin-specific redacted detail endpoint.
- Audited receiver contact reveal.
- Embedded timeline preview.
- Issue count join.
- Payment reconciliation join.
- Station name join.
- Sender profile join.
- Proof asset secure viewer.
- Admin note thread.
- Delivery case export.

These enhancements require explicit backend contracts, authorization rules, privacy review, and tests before UI implementation.

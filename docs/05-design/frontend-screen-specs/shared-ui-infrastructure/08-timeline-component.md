# Timeline Component Infrastructure Spec

## Metadata
| Field | Value |
| --- | --- |
| Infrastructure item | Timeline component |
| Component family | Shared UI infrastructure |
| Primary components | `DeliveryTimelineComponent`, `TimelineController`, `TimelineEntryList`, `TimelineEntryCard`, `TimelineStageGuide`, `TimelineFreshnessBanner`, `TimelinePrivacyRedactor` |
| Supporting components | `TimelineLatestEvent`, `TimelineDateGroup`, `TimelineEntryDisclosure`, `TimelineProofChip`, `TimelineIssueChip`, `TimelineHandoffChip`, `TimelineEmptyState`, `TimelinePartialState`, `TimelineRefreshControl`, `TimelineAccessibilityAnnouncer` |
| Inventory behavior | Sender, receiver-safe, staff, and admin variants |
| Repo targets | `apps/mobile`, `apps/web`, `apps/admin` |
| Primary surfaces | sender tracking timeline, receiver public tracking timeline, operations delivery detail, operations custody chain, station handoff log, admin delivery detail, admin custody chain, refund evidence review |
| Primary users | senders, receivers, station operators, drivers, final-mile couriers, support admins, ops admins, finance admins, QA, security reviewers |
| Backend coverage | `get_delivery_timeline`, `get_public_tracking`, `deliveryTimelineResponseSchema`, `publicTrackingResponseSchema`, delivery events, handoff events, issue events, public tracking touchpoint |
| Browser mutation operation | None; timeline component is read-only and emits navigation or refresh intents only |
| Data sensitivity | delivery ID, tracking code, actor ID, actor role, station ID, proof reference, proof type, package condition, issue severity, issue category, issue summary, timestamps, metadata |
| Offline critical | Yes for cached sender and staff reads; admin and receiver-safe public reads are online-first unless host cache policy says otherwise |
| Related inventory section | Shared UI Infrastructure |
| Related infrastructure specs | typed API client, RTK Query cache, offline outbox, role routing, custody chain component, proof capture component, issue status component, accessibility foundation, localization foundation, analytics tracking |
| Related screen specs | `SenderTrackingTimeline`, `ReceiverTrackingTimeline`, `OpsDeliveryDetail`, `OpsCustodyChain`, `StationHandoffLog`, `AdminDeliveryDetail`, `AdminCustodyChain`, `AdminRefundEvidenceReview` |
| Related state specs | stale data, offline, not authorized, session expired, proof required, custody not confirmed, error, rate limited |
| Design tokens | No unique tokens; timeline uses existing status, proof, issue, custody, neutral, warning, danger, focus, offline, and admin evidence tokens |
| Accessibility target | Chronological entries must preserve semantic time, logical focus order, readable group labels, status messages, and large text support across all variants |

## Purpose
The timeline component is Kra's shared event-history primitive.

It renders delivery progress, handoff evidence, issue history, public tracking progress, and admin evidence views without letting one surface leak data from another. It is read-only, variant-scoped, and driven by backend contracts.

The component must answer:

- What timeline source is being rendered?
- Which user-safe variant is active?
- What is the latest verified event?
- Is the list full, public-limited, partial, stale, or offline cached?
- Which entries are delivery events, handoff events, or issue events?
- What proof fields can be shown in this variant?
- What actor and station fields can be shown in this variant?
- Are entries ordered clearly?
- Does the UI distinguish confirmed event timestamps from stage guidance?
- What can the user do when the timeline is empty, stale, blocked, or failed?

The most important rule is:

```text
A timeline is evidence only for events returned by the backend contract that the current surface is allowed to show.
```

## Product Job
Kra's users need different event histories for the same delivery.

The sender needs trustworthy progress and issue visibility.

The receiver needs a safe public status view that does not expose authenticated timeline records.

The staff member needs operational evidence for physical package handling.

The admin needs investigation density without bypassing proof, audit, privacy, or issue ownership boundaries.

The timeline component must:

- render backend-provided authenticated timeline entries
- render receiver-safe public tracking as a stage guide plus latest touchpoint
- protect actor IDs, proof references, station IDs, and issue metadata by variant
- show stale, cached, partial, and empty states clearly
- support date grouping and latest-event emphasis
- preserve chronological order while supporting newest-first and oldest-first presentations
- make proof and custody evidence visible only at the safe level
- keep public tracking event-first and avoid live-map assumptions
- support refresh, row disclosure, issue route, delivery route, custody route, and support route intents
- support mobile field use and admin dense review
- provide testable redaction, ordering, accessibility, and state behavior

## Strategic Role
Kra is solving delivery trust and accountability. The timeline is the visible record of that trust.

If the timeline is weak, users will fill the gaps with guesses:

- senders may assume a package is lost when data is only stale
- receivers may expect live GPS where none exists
- staff may treat assignment as custody
- admins may rely on labels that are not legally precise
- support may expose proof references in customer-facing channels
- offline screens may make old evidence look fresh

The shared timeline component prevents these failures by making source, variant, freshness, and redaction explicit.

## Design Brief
Audience:

- Claude Code and frontend engineers implementing shared timeline primitives across web, mobile, and admin surfaces.

Surface type:

- Reusable chronological event component, public stage guide, and admin evidence list.

Primary action:

- Help the current user understand verified delivery history and choose a safe next route.

Visual thesis:

- `Verified event rail`: a crisp, timestamp-first history surface that feels calm for customers and forensic for operations.

Restraint rule:

- Do not render live maps, animated package dots, raw metadata, raw proof references, or mutation buttons inside the timeline.

Density:

- Sender and receiver variants are low to medium density.
- Staff variant is medium density.
- Admin variant is medium-high density with disclosure controls.

Platform stance:

- Mobile-first for sender, receiver, and operations. Desktop-dense for admin. The contract stays one shared component with variant-specific redaction and layout.

## External Research Used
Only directly relevant timeline, chronological-list, semantic-time, process-list, and accessibility references were used:

- [DWP Design System timeline design notes](https://design-system.dwp.gov.uk/components/timeline/design-notes): supports a simple standard component for time-series events and highlights contrast and consistent event presentation needs.
- [Home Office Design System timeline](https://design.homeoffice.gov.uk/design-system/components?name=Timeline): supports time-ordered activity for a person or object with date, description, actor, and actions when real data exists.
- [MOJ Design System timeline](https://design-patterns.service.justice.gov.uk/components/timeline/): supports case-style event entries with title, byline, date, description, and optional details or actions.
- [USWDS process list](https://designsystem.digital.gov/components/process-list/): supports a vertical process sequence when a public stage guide is more appropriate than a full event feed.
- [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): supports accessible dynamic feeds only when the implementation truly loads additional articles as users move through the feed.
- [MDN HTML time element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time): supports machine-readable timestamps with `datetime`.
- [WCAG 2.2 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html): supports preserving semantic relationships among dates, headings, descriptions, and entry groups.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible loading, refresh, stale, and error announcements.
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): supports predictable navigation through entries, disclosures, and route actions.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports clear empty, blocked, stale, and failed-load messages.

## Local Sources
Local implementation and policy inputs:

- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/18-sender-tracking-timeline.md`
- `docs/05-design/frontend-screen-specs/receiver-public-flow/04-receiver-tracking-timeline.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/02-ops-delivery-detail.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/17-station-handoff-log.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/06-admin-delivery-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/09-admin-custody-chain.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/28-admin-refund-evidence-review.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/03-typed-api-client.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/04-rtk-query-cache.md`
- `docs/05-design/frontend-screen-specs/shared-ui-infrastructure/05-offline-outbox.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/07-api/api-contracts.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/privacy-and-data-retention.md`
- `docs/11-analytics/events-tracking-plan.md`
- `docs/14-platform/offline-first-and-low-bandwidth-strategy.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/delivery-queries.ts`
- `services/api/src/public-tracking.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`

## Non-Goals
The timeline component must not:

- implement actual frontend screens
- mutate delivery, custody, proof, issue, payment, refund, station, or notification state
- fetch data directly unless a host explicitly supplies a query adapter
- call `get_delivery_timeline` from receiver public tracking
- invent historical events for receiver-safe public views
- infer custody transfer from assignment
- infer proof acceptance from a label alone
- expose raw timeline metadata by default
- expose raw proof references by default
- expose raw actor IDs to sender or receiver variants
- show raw station IDs in receiver-safe public views
- render proof media
- render payment provider payloads
- turn admin evidence into a public tracking experience
- hide stale or partial data

## Component Boundary
The timeline component owns:

- variant-specific rendering
- entry normalization
- safe event label mapping
- date grouping
- latest-event emphasis
- stage-guide rendering for receiver-safe public views
- freshness banners
- stale and offline display state
- proof, issue, actor, and station redaction
- row disclosure state
- empty, loading, partial, and error states
- accessible list semantics
- status announcements
- route intent emissions

The host owns:

- route authorization
- data fetching and cache policy
- query invalidation
- delivery read freshness
- user role and permission context
- station and assignment scope context
- public tracking verification gate
- navigation targets
- support route behavior
- issue route behavior
- admin audited reveal behavior
- analytics event dispatch

## Data Sources
The component supports two source kinds.

Authenticated delivery timeline:

- Operation: `get_delivery_timeline`
- HTTP: `GET /v1/deliveries/:id/timeline`
- Schema: `deliveryTimelineResponseSchema`
- Used by: sender, staff, admin, refund evidence review, custody chain, handoff log

Receiver-safe public tracking:

- Operation: `get_public_tracking`
- HTTP: `GET /v1/public/track/:trackingCode`
- Schema: `publicTrackingResponseSchema`
- Used by: receiver public tracking timeline

Rules:

- Authenticated timeline entries must come from `deliveryTimelineResponseSchema.entries`.
- Public tracking must not call authenticated timeline endpoints.
- Public tracking may render only current status, latest touchpoint, ETA label, and receiver-safe stage guide from `publicTrackingResponseSchema`.
- Host must pass `sourceKind` so the component can enforce data rules.

## Backend Contract Summary
Authenticated timeline entry:

```ts
type DeliveryTimelineEntry = {
  entryId: string;
  entryType: "delivery_event" | "handoff_event" | "issue_event";
  occurredAt: string;
  label: string;
  actorId?: string;
  actorRole?: string;
  stationId?: string;
  metadata?: Record<string, unknown>;
};
```

Authenticated timeline response:

```ts
type DeliveryTimelineResponse = {
  deliveryId: string;
  trackingCode: string;
  entries: DeliveryTimelineEntry[];
};
```

Public tracking response:

```ts
type PublicTrackingResponse = {
  deliveryId: string;
  trackingCode: string;
  status: string;
  publicLabel: string;
  latestTouchpoint: {
    role: "system" | "station_operator" | "driver" | "final_mile_courier";
    stationId?: string;
    occurredAt: string;
  };
  receiverVerificationRequired: boolean;
  etaLabel?: string;
};
```

Current backend facts:

- Authenticated timeline entries are sorted newest first by backend.
- Authenticated timeline combines delivery events, handoff events, and issue records.
- Handoff entries expose proof metadata as `metadata.proofType`, `metadata.proofReference`, and optional `metadata.condition`.
- Issue entries expose severity, category, and summary in metadata.
- Public tracking exposes no full historical array today.
- Public tracking latest touchpoint may include a station ID, but receiver variant must not expose raw station IDs.
- Raw proof URLs are not exposed in summaries, timelines, or public tracking.

## Variant Matrix
| Variant | Source | Primary surface | Actor detail | Proof detail | Station detail | Issue detail | Density |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `receiver_safe` | public tracking only | receiver public flow | public role label only | none | no raw station ID | public issue label only | low |
| `sender` | authenticated timeline | sender mobile | role label only | proof type only | safe station label if available | safe issue label and route | medium |
| `staff` | authenticated timeline | operations mobile | role label; no raw actor ID by default | proof type and condition; no reference | scoped station label or ID when safe | severity, category, short summary | medium |
| `admin` | authenticated timeline | admin web | role and redacted actor ID by default | proof type, redacted reference, condition | station ID or station label | severity, category, summary, investigation route | medium-high |

Hard rules:

- `receiver_safe` cannot accept `DeliveryTimelineResponse`.
- `sender` cannot render `actorId`, `proofReference`, or raw metadata.
- `staff` cannot render raw `proofReference` unless host passes a restricted evidence mode.
- `admin` cannot render raw proof references unless host passes audited reveal state from a separate workflow.
- No variant can render raw proof media.

## Host Input Contract
Required props:

```ts
type TimelineVariant = "receiver_safe" | "sender" | "staff" | "admin";

type TimelineSource =
  | {
      sourceKind: "authenticated_delivery_timeline";
      response: DeliveryTimelineResponse;
    }
  | {
      sourceKind: "public_tracking";
      response: PublicTrackingResponse;
    };

type TimelineFreshness =
  | "loading"
  | "fresh"
  | "refreshing"
  | "cached_fresh"
  | "cached_stale"
  | "offline_cached"
  | "partial"
  | "error";

type TimelineRedactionPolicy = {
  actorId: "hidden" | "redacted" | "visible";
  stationId: "hidden" | "label" | "visible";
  proofReference: "hidden" | "redacted" | "visible_audited";
  metadata: "hidden" | "safe_summary" | "admin_disclosure";
};

type DeliveryTimelineComponentInput = {
  variant: TimelineVariant;
  source: TimelineSource;
  freshness: TimelineFreshness;
  sortOrder: "newest_first" | "oldest_first";
  density: "compact" | "comfortable" | "evidence_dense";
  redaction: TimelineRedactionPolicy;
  latestEventMode: "prominent" | "inline" | "none";
  groupByDate: boolean;
  showRefreshAction: boolean;
  emptyStateRoute?: "delivery_detail" | "tracking_entry" | "support" | "admin_search";
};
```

Rules:

- `variant=receiver_safe` requires `sourceKind=public_tracking`.
- `variant=sender`, `staff`, or `admin` requires `sourceKind=authenticated_delivery_timeline`.
- Host must provide safe station labels if `stationId=label`.
- `proofReference=visible_audited` must be rejected unless variant is `admin` and host supplies audited reveal state outside this component.
- `metadata=admin_disclosure` must be rejected unless variant is `admin`.
- `density=evidence_dense` is allowed only for `admin`.
- `freshness=partial` must include a user-visible explanation.

## Output Contract
The component emits read-only intents:

```ts
type TimelineComponentOutcome =
  | {
      kind: "refresh_requested";
      reason: "manual" | "stale" | "partial" | "offline_reconnect";
    }
  | {
      kind: "entry_selected";
      entryId: string;
      entryType: "delivery_event" | "handoff_event" | "issue_event";
      action: "open_detail" | "open_issue" | "open_custody" | "open_support";
    }
  | {
      kind: "route_requested";
      route:
        | "delivery_detail"
        | "receiver_arrival"
        | "receiver_support"
        | "sender_issue"
        | "staff_custody"
        | "staff_support"
        | "admin_custody"
        | "admin_issue"
        | "admin_audit";
    }
  | {
      kind: "copy_requested";
      field: "tracking_code";
    };
```

Rules:

- No outcome may contain raw proof references.
- No outcome may contain raw metadata.
- No outcome may mutate backend state.
- Copy action is allowed only for tracking code when host permits it.

## Entry Normalization
Authenticated entries normalize into:

```ts
type NormalizedTimelineEntry = {
  entryId: string;
  entryType: "delivery_event" | "handoff_event" | "issue_event";
  occurredAt: string;
  title: string;
  safeActorLabel?: string;
  safeStationLabel?: string;
  chips: Array<"delivery" | "handoff" | "issue" | "proof" | "condition" | "missing" | "review">;
  safeDescription?: string;
  proofSummary?: {
    proofType: "package_scan" | "delivery_proof" | "otp" | "signature" | "delivery_photo" | "unknown";
    referenceDisplay: "hidden" | string;
  };
  issueSummary?: {
    severity?: string;
    category?: string;
    safeSummary?: string;
  };
  rawMetadataAvailable: boolean;
};
```

Normalization rules:

- `title` comes from backend `label`, transformed only for capitalization and localization.
- `occurredAt` must remain the backend timestamp.
- `entryType` must control icon, chip, and role treatment.
- `actorId` is never used directly in sender or receiver copy.
- `proofReference` is hidden unless admin audited reveal is active.
- Unknown metadata keys remain hidden by default.
- Missing metadata must show `Detail unavailable`, not guessed values.

## Receiver-Safe Stage Guide
Receiver-safe public timeline renders:

- current public label
- latest verified touchpoint
- stage guide
- next receiver action
- stale or issue state

Stage groups:

- `Booking`
- `Origin station`
- `In transit`
- `Destination station`
- `Receiver action`
- `Delivered or closed`

Rules:

- The stage guide is guidance, not a historical event feed.
- Only latest touchpoint gets a real timestamp.
- Completed stages cannot display timestamps unless backend later provides them.
- Public stage labels must not show raw station IDs.
- Public role labels must be receiver-safe.
- If `receiverVerificationRequired` is true and host has no active grant, host must route to verification before rendering sensitive state.

Receiver-safe must not render:

- `deliveryId`
- actor IDs
- staff names
- raw station IDs
- proof type
- proof reference
- issue summary
- payment state
- sender ID
- receiver phone
- exact GPS
- authenticated timeline entries

## Sender Variant Rules
Sender timeline renders:

- tracking code
- latest verified event
- date-grouped authenticated entries
- delivery event labels
- handoff labels in sender-safe wording
- proof type where safe
- issue events in sender-safe wording
- stale and offline state
- route to delivery detail and issue creation

Sender timeline must not render:

- actor ID
- current custody actor ID
- raw proof reference
- raw metadata
- raw station ID unless station names are not available and product accepts station codes
- support-only notes
- admin audit links
- payment provider payloads

Sender copy rules:

- Use `Kra station team`, `line-haul driver`, `doorstep courier`, or `system` where actor role is safe.
- Use `Proof recorded` instead of proof reference.
- Use `Issue under review` instead of internal issue summary when summary may contain sensitive notes.
- Use stale warnings when cached.

## Staff Variant Rules
Staff timeline renders:

- tracking code
- latest operational event
- delivery, handoff, and issue rows
- actor role labels
- station label or scoped station ID
- proof type
- package condition when present
- issue severity and category
- row disclosures for safe operational metadata
- route to scan, custody, issue, support, or offline outbox when host allows

Staff timeline must not render:

- raw proof reference by default
- raw actor ID by default
- raw metadata dump
- sender private payment fields
- receiver public link
- admin audit reveal controls

Staff special rules:

- Current custody comes from delivery detail, not timeline alone.
- Assignment is not custody.
- Missing handoff entries must be called out by custody chain component, not hidden inside a generic timeline.
- Offline cached state must be visually and textually obvious.

## Admin Variant Rules
Admin timeline renders:

- tracking code
- entry count
- latest event
- date groups
- delivery, handoff, and issue rows
- actor role
- redacted actor ID by default
- station ID or station label
- proof type
- redacted proof reference by default
- condition
- severity, category, and issue summary
- metadata disclosure only for safe or audited admin contexts
- routes to custody, issue, package detail, refund evidence, and audit screens

Admin timeline must not render:

- raw proof media
- raw proof references without audited reveal state
- raw payment provider payloads
- mutation controls
- backend JSON as normal UI
- hidden personal data through copy actions

Admin special rules:

- Label text alone is not legal-grade classification. Where backend lacks typed handoff fields, mark classification confidence as partial.
- Admin disclosure must distinguish backend field from derived UI wording.
- Audit events belong in admin audit screens, not this timeline component unless a future endpoint explicitly merges them.

## State Model
Required states:

```text
loading
ready
refreshing
empty
public_limited
partial
cached_fresh
cached_stale
offline_cached
not_authorized
not_found
session_expired
rate_limited
api_error
redaction_blocked
```

State behavior:

- `loading`: show skeleton entries with a status message.
- `ready`: show latest event and entries or stage guide.
- `refreshing`: keep current entries visible and announce refresh.
- `empty`: show source-specific empty state.
- `public_limited`: receiver-safe public tracking has latest touchpoint but no historical array.
- `partial`: one source loaded while another failed or metadata required by host is absent.
- `cached_stale`: show cached entries with stale banner.
- `offline_cached`: show cached entries with offline banner and no fresh claims.
- `not_authorized`: show safe denial and return route.
- `redaction_blocked`: show developer-safe error when host asks to reveal fields this variant cannot show.

## Ordering And Grouping
Ordering rules:

- Preserve backend order unless host explicitly requests `oldest_first`.
- If reordering, do it after parsing and before grouping.
- Latest-event card must always name the actual latest event by `occurredAt`, not first visible row after filtering.
- Date groups use local formatting but keep machine-readable timestamps.
- Entries with equal `occurredAt` retain backend order.

Grouping rules:

- Mobile sender and staff may group by day.
- Receiver-safe stage guide does not group because it is not a full event list.
- Admin may group by day and entry type filters.
- Group labels must include actual date, not relative-only text.
- Relative labels such as `Today` may be secondary.

## Privacy And Redaction Rules
Sensitive fields:

- `deliveryId`
- `actorId`
- `currentCustodyActorId`
- `proofReference`
- `metadata`
- `stationId`
- issue summary
- receiver phone
- sender ID
- proof asset storage details

Redaction rules:

- Receiver variant hides all sensitive fields.
- Sender variant hides actor IDs, proof references, raw metadata, raw station IDs by default, and issue summaries unless safe.
- Staff variant hides actor IDs and proof references by default but may show station scope when operationally needed.
- Admin variant redacts IDs by default and can show more only through host-controlled, audited disclosure.
- Redacted proof reference format must reveal no more than last 4 safe characters and only in admin contexts.
- Analytics must receive hashed delivery ID or tracking code only.
- Error boundaries must not include raw timeline payload.

## Accessibility Requirements
General:

- Use a semantic list for static timelines.
- Use WAI-ARIA feed only when implementing dynamic incremental loading.
- Each entry must have a clear heading or accessible label.
- Each timestamp must use a machine-readable time element on web surfaces.
- Entry type must not rely on color alone.
- Refresh, stale, empty, partial, and error states must be announced.
- Disclosures must be keyboard reachable.
- Focus order follows latest event, filters, entries, recovery actions.
- Large text must not overlap date, title, chips, or actions.
- Reduced motion must disable rail animations.

Mobile:

- Entry cards must keep touch targets usable.
- Sticky refresh or route controls must not cover entries.
- Screen readers must hear group labels before entries.

Admin:

- Dense rows must remain keyboard navigable.
- Disclosures must have clear accessible names.
- Copy controls must identify the copied field without exposing hidden value.

## Visual Rules
Shared:

- Use a single vertical rail for chronological evidence.
- Put timestamp first or visually adjacent to title.
- Use entry type chips sparingly.
- Use issue and proof markers only when useful.
- Keep latest event prominent.
- Make stale and partial banners visually distinct.
- Do not overload the rail with icons.

Receiver:

- Use a simple stage guide and latest update card.
- Avoid dense event cards.
- Avoid admin-looking tables.

Sender:

- Use comfortable cards with clear progress language.
- Emphasize latest verified update.
- Keep issue route visible when issue entries exist.

Staff:

- Use compact operational rows.
- Show proof and condition chips.
- Keep recovery route near blocked or partial evidence.

Admin:

- Use evidence-dense rows or split ledger layout.
- Support disclosure panels.
- Keep redaction visible.
- Preserve scanability with date groups and entry type filters.

## Copy Rules
Required copy:

- `Latest verified update`
- `Timeline is showing cached data`
- `Refresh before relying on this evidence`
- `Public tracking shows the latest safe update, not the full internal timeline`
- `Proof recorded`
- `Proof reference hidden`
- `Timeline details unavailable`
- `No timeline entries yet`
- `Issue under review`
- `This timeline is read-only`

Forbidden copy:

- `Live location`
- `Real-time route`
- `Staff member named`
- `Proof image available` unless audited evidence viewer exists
- `Custody confirmed` when only assignment exists
- `Delivered` unless backend status or event says delivered
- `No issue` when issue timeline failed to load

## Error Mapping
| Condition | State | User-safe message | Recovery |
| --- | --- | --- | --- |
| `NOT_FOUND` | `not_found` | `Timeline was not found for this delivery.` | Return to delivery list or tracking entry |
| `FORBIDDEN` | `not_authorized` | `You do not have access to this timeline.` | Return to safe home |
| `SESSION_EXPIRED` | `session_expired` | `Sign in again to view this timeline.` | Sign in |
| `RATE_LIMITED` | `rate_limited` | `Too many timeline requests. Wait before refreshing.` | Wait, retry |
| Public tracking has no historical array | `public_limited` | `This public view shows the latest safe update only.` | View package status or support |
| Timeline empty | `empty` | `No timeline entries are available yet.` | Refresh or return |
| Timeline query failed after detail loaded | `partial` | `Delivery loaded, but timeline evidence could not be loaded.` | Refresh timeline |
| Offline with cache | `offline_cached` | `Showing cached timeline while offline.` | Refresh when online |
| Host requests unsafe reveal | `redaction_blocked` | `This timeline variant cannot show that field.` | Fix host config |
| Unknown metadata | `ready` | `Additional detail hidden` | Admin disclosure if allowed |

## Analytics Requirements
Allowed events:

- `timeline_component_rendered`
- `timeline_refresh_requested`
- `timeline_entry_selected`
- `timeline_empty_shown`
- `timeline_partial_shown`
- `timeline_stale_shown`
- `timeline_redaction_blocked`

Allowed fields:

- `surface`
- `variant`
- `sourceKind`
- `entryCount`
- `entryTypes`
- `freshness`
- `sortOrder`
- `groupByDate`
- `hasIssueEntries`
- `hasHandoffEntries`
- `hasProofSummary`
- `errorCode`

Forbidden fields:

- raw delivery ID
- raw tracking code
- actor ID
- proof reference
- raw metadata
- issue summary
- receiver phone
- sender ID
- station ID for public and sender variants

## Performance Requirements
Targets:

- First visible timeline shell within `1s`.
- First meaningful latest event within `1.5s` after data arrives.
- Refresh state feedback within `100ms`.
- Entry disclosure open within `100ms`.
- Admin timelines up to `500` entries remain scrollable without blocking input.

Performance rules:

- Do not parse or stringify full metadata for normal rendering.
- Memoize normalized entries by response identity and redaction policy.
- Virtualize admin-only long timelines carefully.
- Do not virtualize short mobile timelines.
- Preserve accessible positions if dynamic loading is introduced.
- Keep receiver-safe stage guide lightweight.
- Avoid expensive date formatting inside row render loops.

## Test Requirements
Unit tests:

- source-kind and variant compatibility
- sender redaction policy
- receiver-safe rejection of authenticated timeline response
- admin redacted proof reference behavior
- entry normalization for delivery, handoff, and issue events
- latest event calculation
- sort order
- date grouping
- public stage mapping
- stale and partial state selection
- unsafe reveal rejection

Component tests:

- receiver-safe public latest update and stage guide
- sender latest event with redacted proof
- staff handoff row with proof type and hidden reference
- admin disclosure with redacted actor ID
- empty state
- loading state
- refreshing state
- offline cached state
- partial timeline state
- keyboard disclosure navigation
- large text layout
- reduced motion

Integration tests:

- `get_delivery_timeline` response parses with shared schema.
- `get_public_tracking` response renders receiver-safe variant without authenticated entries.
- Timeline refresh emits refresh outcome without mutation.
- Entry selection emits route intent only.
- Raw proof reference never appears in sender, receiver, or staff DOM snapshots.
- Actor IDs never appear in sender or receiver DOM snapshots.
- Public tracking never calls authenticated timeline query.

End-to-end journeys:

- Sender opens delivery timeline, sees latest event, refreshes, and opens issue route.
- Receiver opens public timeline, sees latest safe update and stage guide, then opens arrival instructions.
- Staff opens delivery detail timeline preview while offline and sees cached warning.
- Staff opens custody chain and timeline partial state routes to refresh/support.
- Admin opens custody timeline and sees redacted proof reference plus investigation routes.
- Admin timeline with long event history remains usable by keyboard.

Security tests:

- No raw proof references in unsafe variants.
- No raw actor IDs in sender or receiver variants.
- No raw metadata dump in any normal row.
- No public timeline endpoint uses authenticated delivery timeline data.
- Analytics excludes sensitive fields.
- Error boundary redacts timeline payload.

## Build Instructions For Claude Code
When implementing later:

- Build one shared normalizer first.
- Build variant renderers on top of the same normalized entry contract.
- Keep receiver-safe public tracking as a separate source path.
- Use typed API schemas before rendering.
- Keep timeline read-only.
- Put custody confidence derivation in custody chain component, not the base timeline.
- Keep proof media out of timeline.
- Keep raw metadata hidden unless admin disclosure explicitly owns it.
- Add redaction tests before visual tests.
- Add accessibility tests before shipping screens that depend on timeline.

Do not:

- copy event-row logic into every screen
- call authenticated timeline from public receiver routes
- show raw proof references because they are present in metadata
- use label text as the only legal custody classifier
- hide stale cache warnings
- make timeline entries mutate backend state

## Acceptance Checklist
- Component supports `receiver_safe`, `sender`, `staff`, and `admin` variants.
- Receiver-safe variant uses only public tracking data.
- Sender variant hides actor IDs, proof references, and raw metadata.
- Staff variant hides raw proof references and actor IDs by default.
- Admin variant redacts proof references by default and routes deeper review to owner screens.
- Latest verified event is clear.
- Empty, stale, offline, partial, rate-limited, unauthorized, and error states are distinct.
- Timestamps use semantic time on web.
- Public stage guide does not invent historical timestamps.
- Refresh emits intent without mutation.
- Analytics excludes sensitive fields.
- Tests cover redaction, ordering, state, accessibility, and source separation.

## Definition Of Done
This infrastructure spec is complete when a frontend engineer can build one timeline system that powers customer tracking, field operations, and admin evidence review without duplicating event parsing or weakening data boundaries.

The implementation must prove:

- one normalizer
- four safe variants
- strict source separation
- clear freshness states
- semantic chronological rendering
- redaction by default
- no mutation authority

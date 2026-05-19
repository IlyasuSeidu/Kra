# Ops Role Home Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `OpsRoleHome` |
| App | `apps/mobile` |
| Route | `/(ops)/home` |
| Primary test ID | `screen-ops-role-home` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Operations Critical` |
| Backend dependency | `list_deliveries`, `deliveryListQuerySchema`, `deliveryListResponseSchema`, `AuthPrincipal`, `roleSchema`, `getCapabilities`, `canPerform` |
| Related routes | `/(ops)/station/overview`, `/(ops)/station/intake`, `/(ops)/station/outbound`, `/(ops)/station/inbound`, `/(ops)/station/final-mile`, `/(ops)/station/blocked`, `/(ops)/driver/home`, `/(ops)/driver/runs`, `/(ops)/courier/home`, `/(ops)/courier/assignments`, `/(ops)/offline-outbox`, `/(ops)/support` |
| Required states | `loading_role`, `loading_work`, `station_ready`, `driver_ready`, `courier_ready`, `empty_work`, `offline_cached`, `stale_cache`, `unsupported_role`, `missing_station_scope`, `not_authorized`, `session_expired`, `api_error` |

## Product Job
This screen is the role-aware operations home for field staff. It must route station operators, drivers, and final-mile couriers to the right work without making them understand the whole application map. The screen answers one operational question: `What should I do now, given my role and current assignments?`

The staff member should be able to:
- See their recognized role.
- See whether the app has fresh work data.
- See urgent work first.
- Navigate to the correct role home or queue.
- Continue queued offline work.
- Open shared delivery detail when a delivery requires attention.
- Open shared scan, custody, issue, or support tools only when the role can use them.
- Recover from missing role, missing station scope, expired session, offline state, and API errors.

This screen is not:
- An admin dashboard.
- A finance console.
- A full station queue replacement.
- A driver run detail screen.
- A courier assignment detail screen.
- A custody transfer screen.
- A scan screen.
- A support issue form.
- A place to override role or capability.
- A place to change station assignment.

## Audience
Primary audience:
- Station operators starting or returning to a shift.
- Line-haul drivers checking assigned runs.
- Final-mile couriers checking doorstep assignments.
- Field staff using low-bandwidth devices during active operations.

Secondary audience:
- Claude Code implementing the shared ops route.
- QA validating role routing.
- Operations leads checking custody-safe navigation.
- Security reviewers checking role/capability authority.
- Accessibility reviewers checking task navigation.

## User State
The user is likely on duty and time-sensitive. They do not want a decorative dashboard. They need the next operational surface: station queue, assigned run, courier assignment, offline outbox, or support escalation.

The user may be:
- Starting a shift.
- Returning after app suspension.
- Opening the app after a notification.
- Working offline with queued actions.
- Scanning a package at a station.
- Looking for assigned transport work.
- Looking for final-mile assignments.
- Escalating an operational problem.
- Using a role that belongs in admin web, not ops mobile.

The screen must:
- Use backend role and capability data as authority.
- Use `list_deliveries` only as a read source.
- Scope work according to backend access rules.
- Route station, driver, and courier roles differently.
- Avoid client-only role assumptions.
- Avoid showing admin-only actions to field staff.
- Avoid moving custody or changing delivery state from this screen.
- Always keep offline outbox access visible when queued actions exist.

## Primary Action
Primary action by role:
- `station_operator`: `Open station overview`
- `driver`: `Open assigned runs`
- `final_mile_courier`: `Open courier assignments`
- `ops_admin`: `Open support or admin console link` only if configured
- `support_admin`: `Open support` only if configured
- `finance_admin`: show unsupported mobile role and route to admin web if configured
- `super_admin`: show unsupported mobile role and route to admin web if configured

Primary action by state:
- `loading_role`: wait.
- `loading_work`: keep role route available if safe.
- `empty_work`: open role home/queue.
- `offline_cached`: open offline outbox or cached queue.
- `stale_cache`: refresh.
- `unsupported_role`: open supported console or sign out.
- `missing_station_scope`: contact supervisor/support.
- `not_authorized`: sign in again.
- `session_expired`: sign in again.
- `api_error`: try again.

Secondary actions:
- `Open offline outbox`
- `Open support`
- `Refresh work`
- `Open delivery detail`
- `Sign out`

Blocked behavior:
- Do not call mutation endpoints.
- Do not accept a run.
- Do not confirm pickup.
- Do not confirm intake.
- Do not dispatch a package.
- Do not receive a package.
- Do not assign final-mile courier.
- Do not mark out for delivery.
- Do not complete delivery.
- Do not create issue directly from the home row without a delivery context.
- Do not override role or station assignment.
- Do not show finance/admin controls.
- Do not rely on locally edited role state.

## First Meaningful Value
First meaningful value is reached when staff sees:
- Recognized role.
- Freshness state.
- Primary route for that role.
- Top urgent work count or empty state.
- Offline outbox status if queued actions exist.
- Support route.

The first viewport must answer:
- `Who does the app think I am?`
- `Is my work data fresh?`
- `What queue should I open first?`
- `Do I have urgent or blocked work?`
- `Do I have offline actions waiting?`

## Main Tension
Ops staff need speed, but every delivery operation has custody and scope consequences. A role home must help them move fast without hiding the authority boundary between route selection and state-changing actions.

The design must balance:
- Fast role routing against role/capability verification.
- Work urgency against not duplicating every queue.
- Offline continuity against stale-data risk.
- Station, driver, and courier needs in one shared shell.
- Admin/supervisor roles against field-only mobile surfaces.
- Simplicity against real operational exceptions.

## Design Brief
User and job:
- Field staff wants to start the correct work surface for their role.

Context of use:
- Mobile, active shift, physical package handling, low bandwidth, custody-sensitive.

Entry point:
- Staff sign-in success.
- App launch.
- Return from offline outbox.
- Push/SMS staff link if supported.
- Deep link fallback from a role-specific route.

Success state:
- User lands on the correct role queue or opens urgent work without unsafe shortcuts.

Primary action:
- Role-specific queue/home route.

Navigation model:
- Role-aware command hub with one dominant role route, urgent work cards, offline outbox, and support.

Density:
- Medium. Staff need enough context to choose correctly, but not all queue contents.

Visual thesis:
- A field operations launchpad: clear role identity, crisp urgency, and high-trust route cards.

Restraint rule:
- Avoid a generic dashboard wall, map-first clutter, admin metrics, and mutation controls.

Product lens:
- Operational clarity and custody safety.

System stance:
- Native mobile work hub with strong role cards and explicit freshness.

Interaction thesis:
- Verify role, show work state, route to correct operational surface.

Signature move:
- A role banner that pairs identity, shift freshness, and the one next queue that matters.

Activation event:
- Staff opens role-specific work route, offline outbox, support, or an urgent delivery detail.

## Elite Quality Gate
This spec is not closed unless `OpsRoleHome` is role-accurate, custody-safe, and useful under weak network conditions.

Non-negotiable quality requirements:
- First viewport shows role, work freshness, and role-specific primary route.
- `list_deliveries` is read-only.
- Role routing uses verified `AuthPrincipal.role`.
- Capabilities use `getCapabilities` or equivalent shared policy.
- Station operator without `stationId` gets a blocked state.
- Driver sees assigned-run path.
- Courier sees assignment path.
- Admin-only roles do not get field mutation shortcuts.
- Offline outbox is visible when queued work exists.
- Stale cached work is marked clearly.
- No custody or delivery state changes happen from this screen.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If a client-only role value can unlock routes, the screen remains open.
- If the home screen can mutate delivery state, the screen remains open.
- If offline data looks fresh when stale, the screen remains open.
- If station operator can proceed without `stationId`, the screen remains open.
- If driver/courier sees unrelated assignments, the screen remains open.

## Research And Inspiration Notes
Use these sources for quality direction, not visual copying:
- [Material Design 3 lists](https://m3.material.io/components/lists/overview): role routes and work rows should be scan-friendly and predictable.
- [Material Design 3 cards](https://m3.material.io/components/cards/overview): top work cards should group actions without becoming clutter.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): field staff actions need reliable touch targets.
- [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/): controls, messages, and grouped regions need clear accessible labels.
- [web.dev Offline Cookbook](https://web.dev/articles/offline-cookbook): offline states need explicit cache and freshness treatment.

Applied decisions:
- Use a role-first hub, not a generic dashboard.
- Use route cards for complex role workflows.
- Keep mutation actions inside dedicated workflow screens.
- Show offline outbox status as operational safety, not a hidden utility.
- Distinguish fresh, stale, and offline work data visibly.

## Data Contract And Backend Alignment
Primary read:
- Operation: `list_deliveries`.
- HTTP: `GET /v1/deliveries`.
- Schema: `deliveryListQuerySchema`.
- Response: `deliveryListResponseSchema`.
- Default backend limit: 50 when no limit is provided.

Primary auth:
- `AuthPrincipal`.
- `roleSchema`.
- `getCapabilities`.
- `canPerform`.
- `getSessionTtlHours`.

Allowed fields from delivery list:
- `deliveryId`
- `trackingCode`
- `currentStatus`
- `paymentStatus`
- `originStationId`
- `destinationStationId`
- `serviceType`
- `receiverName`
- `latestOccurredAt`
- `latestTouchpointRole`
- optional `latestTouchpointStationId`
- `doorstepRequested`

Role scope from backend:
- `station_operator`: deliveries where assigned station scope permits access.
- `driver`: deliveries where `assignedDriverId` matches principal.
- `final_mile_courier`: deliveries where `assignedFinalMileCourierId` matches principal.
- admin roles may have broader API access, but mobile home must not expose field workflows unless product policy explicitly supports it.

Auth facts:
- `driver`, `station_operator`, and `final_mile_courier` use `phone_pin`.
- admin roles use `email_password_mfa`.
- staff mobile session TTL is shorter than sender session.
- station operators require `stationId` for station-scoped work.

Disallowed data:
- Raw capability array in visible UI.
- Raw token.
- Staff internal IDs.
- Sender phone.
- Receiver phone.
- Payment provider references.
- Proof asset references.
- Admin-only fields.
- Audit metadata.

## Role Routing Matrix
| Role | Primary route | Secondary routes | Required scope |
| --- | --- | --- | --- |
| `station_operator` | `/(ops)/station/overview` | intake, outbound, inbound, final-mile, blocked, handoff log | `stationId` |
| `driver` | `/(ops)/driver/runs` | driver home, run detail, route, support | assigned driver scope |
| `final_mile_courier` | `/(ops)/courier/assignments` | courier home, assignment detail, route, support | assigned courier scope |
| `ops_admin` | admin/support handoff | ops support if configured | admin role |
| `support_admin` | support handoff | ops support if configured | support role |
| `finance_admin` | unsupported mobile role | admin console if configured | finance role |
| `super_admin` | unsupported mobile role | admin console if configured | super admin role |
| `sender` | not authorized | sender home | sender role |

Station route cards:
- `Station overview`
- `Intake queue`
- `Outbound queue`
- `Inbound queue`
- `Final-mile queue`
- `Blocked queue`
- `Handoff log`

Driver route cards:
- `Assigned runs`
- `Active route`
- `Run history`
- `Driver support`

Courier route cards:
- `Assigned jobs`
- `Active doorstep route`
- `Completed jobs`
- `Courier support`

Shared route cards:
- `Offline outbox`
- `Support`

## Work Classification
Use returned deliveries to classify work locally for summary only.

Station operator summary groups:
- Intake work: `created`, `payment_confirmed`, and delivery states awaiting origin receipt.
- Outbound work: `received_at_origin`, `awaiting_driver_assignment`, `assigned_to_driver`.
- Inbound work: `in_transit`, `dispatched_from_origin` when destination station matches scope.
- Final-mile work: `received_at_destination`, `awaiting_final_mile_assignment`, `assigned_for_final_mile`.
- Blocked work: `issue_reported`, payment blocked, or any local policy marker returned by backend.

Driver summary groups:
- New assigned runs: `assigned_to_driver`.
- Pickup needed: assigned runs not yet scanned into driver custody.
- In transit: `dispatched_from_origin`, `in_transit`.
- Destination handoff needed: arriving or ready for destination receipt.

Courier summary groups:
- New assignments: `assigned_for_final_mile`.
- Pickup/acceptance needed: assigned but not accepted.
- Out for delivery: `out_for_delivery`.
- Proof needed: delivered action not completed.
- Failed attempts: states or issues indicating attempted delivery problem.

Classification rules:
- If status mapping is ambiguous, route to role queue rather than claim exact next action.
- Do not use status labels to bypass backend authorization.
- Do not show mutation CTAs from classification.
- Keep role-specific screens responsible for exact action eligibility.

## Information Architecture
Screen sections in order:
1. Role and freshness banner.
2. Primary work route card.
3. Urgent work summary.
4. Role-specific route grid.
5. Offline outbox.
6. Support and account utilities.

Above the fold:
- Top bar.
- Role banner.
- Primary route card.
- Offline/stale banner if needed.
- First urgent work card.

Below the fold:
- Role route grid.
- Shared tools.
- Support.
- Sign-out/account entry if app shell places it here.

Do not include:
- Large analytics charts.
- Admin finance cards.
- Pricing cards.
- User management links.
- Raw role/capability dump.

## Layout Structure
Root:
- Safe area view.
- Scroll view.
- Warm neutral or dark-on-light operations theme.
- High contrast row surfaces.
- Sticky refresh/freshness affordance if route pattern supports it.

Top bar:
- Title: `Operations`
- Subtitle or compact chip with role.
- Optional account/menu button.
- Optional refresh button.

Role banner:
- Role label.
- Station or assignment scope summary if safe.
- Last sync time.
- Session freshness indicator.
- Primary route CTA.

Primary work route card:
- Large tap target.
- Role-specific title.
- Short helper.
- Count summary.
- Chevron or route arrow.

Urgent work summary:
- Up to 3 cards.
- Each card routes to role queue or delivery detail.
- Show status, route/corridor, and latest time.
- Avoid showing receiver phone or package value.

Role route grid:
- 2-column on larger phones if readable.
- Single-column on compact phones.
- Each card has icon, label, helper, and count if safe.

Offline outbox:
- Always visible when queued actions exist.
- Visible as low-priority utility when empty if offline capability is core.

Support:
- Route to `/(ops)/support`.
- Explain when to escalate.

## Visual Direction
Mood:
- Operational.
- Focused.
- Calm under pressure.
- Durable.
- Low-noise.

Avoid:
- Vanity dashboard tiles.
- Map-first layout.
- Excessive badges.
- Decorative vehicle illustrations.
- Admin web density.
- Bright warning everywhere.

Color direction:
- Background: warm gray or sand.
- Primary action: deep green or ink.
- Urgent: amber.
- Critical: controlled red.
- Fresh: green.
- Stale/offline: amber/neutral.
- Disabled: neutral slate.

Typography:
- Role banner title uses strong weight.
- Queue card titles are short.
- Counts are large enough to scan.
- Helper text is literal and brief.

Motion:
- Use small entry stagger only for first load.
- Refresh indicator should be functional.
- Offline banner should not pulse.
- Respect reduced motion.

## Copy System
Voice:
- Direct.
- Operational.
- Calm.
- No blame.
- No hype.

Role labels:
- `station_operator`: `Station operator`
- `driver`: `Line-haul driver`
- `final_mile_courier`: `Doorstep courier`
- `ops_admin`: `Operations admin`
- `support_admin`: `Support admin`
- `finance_admin`: `Finance admin`
- `super_admin`: `Super admin`

Primary route copy:
- Station title: `Open station overview`
- Station helper: `Review intake, outbound, inbound, and blocked station work.`
- Driver title: `Open assigned runs`
- Driver helper: `Review runs assigned to you before scanning or moving packages.`
- Courier title: `Open courier assignments`
- Courier helper: `Review doorstep assignments before pickup, route, or proof.`

Freshness copy:
- Fresh: `Updated just now`
- Stale: `Work may be out of date`
- Offline: `Offline work view`
- Loading: `Checking your work...`

Empty copy:
- Station: `No station work is waiting in your visible queues.`
- Driver: `No assigned runs are waiting.`
- Courier: `No doorstep assignments are waiting.`
- Shared body: `Refresh before ending your shift or contact support if this looks wrong.`

Unsupported role copy:
- Title: `This mobile workspace is for field operations`
- Body: `Your account does not have a field role for this app. Use the admin console or contact your supervisor.`
- Primary: `Go to support`
- Secondary: `Sign out`

Missing station scope:
- Title: `Station assignment missing`
- Body: `This station operator account has no station scope. Contact a supervisor before handling packages.`
- Primary: `Contact support`
- Secondary: `Sign out`

Error copy:
- API error title: `Work could not load`
- API error body: `Try again. Do not scan or move packages until your queue is current.`
- Session expired title: `Sign in again`
- Session expired body: `Your staff session expired. Sign in again before handling packages.`
- Not authorized title: `Operations access unavailable`
- Not authorized body: `This account cannot open the operations workspace.`

## Component Inventory
Required components:
- `OpsRoleHomeScreen`
- `OpsTopBar`
- `RoleFreshnessBanner`
- `PrimaryWorkRouteCard`
- `UrgentWorkSummary`
- `UrgentWorkCard`
- `RoleRouteGrid`
- `RoleRouteCard`
- `OfflineOutboxStrip`
- `OpsSupportCard`
- `OpsStateView`
- `UnsupportedRolePanel`
- `MissingStationScopePanel`
- `OpsRefreshControl`

Shared component candidates:
- `AppScreen`
- `SafeScrollView`
- `StatusChip`
- `CountBadge`
- `QueueCard`
- `InlineAlert`
- `RetryPanel`
- `SkeletonBlock`
- `EmptyState`

Component responsibilities:
- `OpsRoleHomeScreen` owns role state, query state, and route selection.
- `OpsTopBar` provides title, refresh, and account/menu access.
- `RoleFreshnessBanner` translates auth role, station scope, and last sync.
- `PrimaryWorkRouteCard` routes to the dominant role home/queue.
- `UrgentWorkSummary` classifies and orders visible returned deliveries.
- `UrgentWorkCard` routes to delivery detail or role queue.
- `RoleRouteGrid` shows role-specific destinations.
- `OfflineOutboxStrip` exposes queued offline actions.
- `OpsSupportCard` routes support/escalation.
- `OpsStateView` handles loading/error/empty/expired/offline states.

## State Model
State names:
- `loading_role`
- `loading_work`
- `station_ready`
- `driver_ready`
- `courier_ready`
- `empty_work`
- `offline_cached`
- `stale_cache`
- `unsupported_role`
- `missing_station_scope`
- `not_authorized`
- `session_expired`
- `api_error`

State sources:
- Auth session.
- `AuthPrincipal.role`.
- `AuthPrincipal.stationId`.
- `getCapabilities(role)`.
- `list_deliveries` query state.
- Network state.
- Offline outbox count.
- Cached delivery list age.

State priority:
1. `session_expired`
2. `not_authorized`
3. `loading_role`
4. `unsupported_role`
5. `missing_station_scope`
6. `offline_cached`
7. `api_error`
8. `loading_work`
9. `stale_cache`
10. role ready state
11. `empty_work`

Station ready criteria:
- Role is `station_operator`.
- `stationId` exists.
- Work query is loaded or cached with visible freshness.

Driver ready criteria:
- Role is `driver`.
- Work query is loaded or cached with visible freshness.

Courier ready criteria:
- Role is `final_mile_courier`.
- Work query is loaded or cached with visible freshness.

Empty work criteria:
- Role is field-supported.
- Query succeeded.
- Returned delivery list has no visible action items.

Unsupported role criteria:
- Role is not `station_operator`, `driver`, or `final_mile_courier`.
- Sender role is always not authorized for ops shell.
- Admin roles are not given field workflow shortcuts.

Missing station scope criteria:
- Role is `station_operator`.
- `stationId` is absent.

## Loading Behavior
Role loading:
- Show ops shell skeleton.
- Do not show role cards until role is known.
- Keep sign-out/account menu available if global shell permits.

Work loading:
- Show role banner once role is known.
- Show primary route card skeleton.
- Show up to three work card skeletons.
- Do not block primary route if role home can load its own data.

Refresh:
- Pull-to-refresh or top refresh button.
- Refetch `list_deliveries`.
- Refresh offline outbox count.
- Update freshness timestamp.

Timeout:
- If role load times out, show session/auth error.
- If work load times out, show API error with safe route fallback.

## Ready State By Role
### Station Operator
Primary route:
- `/(ops)/station/overview`

Top sections:
- Station overview card.
- Intake queue count.
- Outbound queue count.
- Inbound queue count.
- Final-mile queue count.
- Blocked queue count.
- Offline outbox strip.

Critical rules:
- Require `stationId`.
- Show station scope in customer-safe station label if available.
- Do not allow station work if station scope is missing.
- Do not move custody from this home screen.

### Driver
Primary route:
- `/(ops)/driver/runs`

Top sections:
- Assigned runs card.
- Next pickup or active run card.
- In-transit summary.
- Offline outbox strip.
- Driver support.

Critical rules:
- Only assigned work.
- Do not show station queue shortcuts.
- Do not confirm pickup or mark transit from home.
- Route exact actions to driver screens.

### Final-Mile Courier
Primary route:
- `/(ops)/courier/assignments`

Top sections:
- Assigned jobs card.
- Next doorstep delivery card.
- Proof-needed summary.
- Failed attempt/support route.
- Offline outbox strip.

Critical rules:
- Only assigned final-mile work.
- Do not show driver line-haul routes.
- Do not capture proof from home.
- Route exact actions to courier screens.

### Admin Or Support Role
Render unsupported field role unless mobile admin support exists.

Allowed:
- Explain that this app shell is for field operations.
- Route to support.
- Route to admin web if configured.
- Sign out.

Disallowed:
- Showing field queue actions due broad admin API access.
- Showing admin-only finance, pricing, users, or audit controls.

## Empty State
Station empty:
- Title: `No station work waiting`
- Body: `Your visible station queues are clear. Refresh before changing shift or contact support if packages are physically present.`
- Primary: `Refresh`
- Secondary: `Open station overview`

Driver empty:
- Title: `No assigned runs`
- Body: `You do not have line-haul runs assigned right now. Refresh before leaving the station.`
- Primary: `Refresh`
- Secondary: `Open driver support`

Courier empty:
- Title: `No doorstep assignments`
- Body: `You do not have final-mile jobs assigned right now. Refresh before ending availability.`
- Primary: `Refresh`
- Secondary: `Open courier support`

Rules:
- Empty state must not imply the shift is over.
- Empty state must not hide offline outbox.
- Empty state must show freshness.

## Offline And Stale Data
Offline cached:
- Show cached role and work summary if available.
- Banner: `Offline work view`.
- Body: `Use cached queues only for review. Do not scan or move packages unless the action is supported by offline outbox policy.`
- Primary: `Open offline outbox`
- Secondary: `Retry connection`

Stale cache:
- Show timestamp.
- Use amber freshness chip.
- Keep route cards available.
- Mark counts as `Last saved`.

No cached work:
- Show offline state with support and sign-out.
- Do not invent counts.

Offline outbox:
- Show count of queued actions.
- Show failed count if any.
- Route to `/(ops)/offline-outbox`.

## Error State
API error:
- Title: `Work could not load`
- Body: `Try again. Do not scan or move packages until your queue is current.`
- Primary: `Try again`
- Secondary: `Open offline outbox` if queued actions exist.

Rate limited:
- Title: `Too many refresh attempts`
- Body: `Wait a moment before refreshing again.`
- Primary: `Try later`

Forbidden:
- Title: `Operations access unavailable`
- Body: `This account cannot open the operations workspace.`
- Primary: `Sign in again`

Missing station:
- Title: `Station assignment missing`
- Body: `This station operator account has no station scope. Contact a supervisor before handling packages.`
- Primary: `Contact support`
- Secondary: `Sign out`

## Privacy And Security Rules
Allowed display:
- Role label.
- Station label or station ID only if station labels are unavailable and station ID is already used in ops app.
- Delivery IDs.
- Tracking codes.
- Receiver name if returned by `deliveryListResponseSchema`.
- Current status.
- Payment status only as operational blocker.
- Latest touchpoint role/station.

Do not display:
- Sender ID.
- Sender phone.
- Receiver phone.
- Staff internal user IDs.
- Payment provider references.
- Proof asset references.
- Raw metadata.
- Audit event IDs.
- Capability arrays.
- JWT or token fields.

Security:
- Role cards are not authorization.
- Backend must still enforce every route and mutation.
- Session-expired state must block operations.
- Offline cached state must not hide stale risk.

## Accessibility Requirements
Screen reader:
- Root heading is `Operations`.
- Role banner announces role and freshness.
- Primary route card announces role-specific destination.
- Counts announce label and state, not only number.
- Offline/stale warnings are announced.
- Empty and error panels announce title and recovery action.

Touch:
- Primary route card is large enough for field use.
- All cards meet target-size requirements.
- Refresh and support actions are reachable.

Text:
- Supports large text.
- Count labels wrap.
- No row depends on color alone.
- Avoid abbreviations that screen readers cannot pronounce clearly.

Contrast:
- Urgent, stale, and error states meet contrast.
- Disabled unsupported routes remain readable.

Motion:
- Respect reduced motion.
- Avoid looping progress visuals.
- Refresh animation must not obscure task cards.

Keyboard and switch access:
- Focus order follows visual order.
- Cards are focusable.
- Support and offline outbox are reachable.

## Interaction Details
Primary route card:
- Tap routes to role-specific destination.
- Prevent double navigation.
- Use pressed state.

Urgent work card:
- Tap opens `/(ops)/deliveries/:deliveryId` unless role-specific detail route is clearer and supported.
- Do not call mutation.

Role route card:
- Tap opens route.
- If route requires missing scope, show blocked state instead.

Refresh:
- Refetch deliveries.
- Update freshness timestamp.
- Preserve scroll if possible.

Offline outbox:
- Tap opens `/(ops)/offline-outbox`.
- If failed actions exist, badge as `Needs review`.

Support:
- Tap opens `/(ops)/support`.
- If role-specific support route exists and is preferred, route there.

## Performance Requirements
Initial load:
- Auth/role state must resolve before work routing.
- `list_deliveries` should request a practical limit.
- Do not fetch every role-specific queue separately from the shared home.

Query strategy:
- Use one `list_deliveries` read for summary.
- Role-specific screens can fetch their own scoped queues.
- Avoid blocking navigation on decorative counts.

Low bandwidth:
- Use compact work summaries.
- Do not load maps or heavy media.
- Defer route maps to role-specific route screens.

Cache:
- Cache last role home response.
- Mark stale clearly.
- Do not treat cached work as fresh after TTL.

## Analytics
Events:
- `ops_role_home_viewed`
- `ops_role_home_primary_route_pressed`
- `ops_role_home_refresh_pressed`
- `ops_role_home_delivery_pressed`
- `ops_role_home_offline_outbox_pressed`
- `ops_role_home_support_pressed`
- `ops_role_home_empty_viewed`
- `ops_role_home_unsupported_role_viewed`
- `ops_role_home_missing_station_scope_viewed`
- `ops_role_home_error_viewed`

Event properties:
- `role`: safe role category.
- `work_count_bucket`: coarse count bucket.
- `urgent_count_bucket`: coarse count bucket.
- `offline_outbox_count_bucket`: coarse count bucket.
- `freshness_state`: `fresh`, `stale`, `offline`, `unknown`.
- `entrypoint`: previous route category.

Do not log:
- Delivery IDs from home card taps unless analytics policy permits.
- Receiver names.
- Staff user IDs.
- Station internal IDs if avoidable.
- Tokens.
- Capability arrays.

## QA Scenarios
Core:
- Station operator with station scope opens role home.
- Station operator without station scope sees blocked state.
- Driver opens role home with assigned runs.
- Driver opens role home with no assigned runs.
- Courier opens role home with assignments.
- Courier opens role home with no assignments.
- Sender tries to open ops home.
- Finance admin opens ops mobile and sees unsupported role.
- Support admin opens ops mobile and sees supported handoff or unsupported field role.
- Offline cached station state renders stale banner.
- Offline with queued actions shows offline outbox.
- API error maps to safe recovery.
- Session expired blocks operations.
- Refresh refetches work.
- Primary route card opens correct role route.
- Urgent work card opens shared delivery detail.

Accessibility:
- Screen reader announces role and freshness.
- Counts are meaningful without visual layout.
- Large text keeps route cards usable.
- Reduced motion disables decorative entry effects.
- Offline and stale warnings are announced.

Privacy:
- No sender phone appears.
- No receiver phone appears.
- No staff user ID appears.
- No raw capability list appears.
- No admin-only route appears for field roles.

Contract:
- Calls `list_deliveries` only for reads.
- Does not call mutation endpoints.
- Uses `deliveryListResponseSchema` fields only.
- Uses verified role for routing.
- Keeps backend route guards as authority.

## Implementation Notes For Claude Code
Recommended route file:
- `apps/mobile/src/app/(ops)/home.tsx` or equivalent Expo Router path.

Recommended local modules:
- `useAuthSession`
- `useOpsPrincipal`
- `useListDeliveriesQuery`
- `useNetworkStatus`
- `useOfflineOutboxSummary`
- `useRoleRouteConfig`
- `useFreshnessLabel`

Implementation sequence:
1. Create ops shared specs folder route shell.
2. Wire role/auth state.
3. Build role routing config.
4. Add one `list_deliveries` query for role work summary.
5. Build role/freshness banner.
6. Build primary route card.
7. Add urgent work summary.
8. Add role route grid.
9. Add offline outbox strip.
10. Add unsupported role and missing station scope states.
11. Add accessibility labels.
12. Add analytics.
13. Add tests for role routing and no mutation calls.

Do not implement:
- State mutation buttons.
- Scan actions.
- Custody transfer.
- Admin finance/user routes.
- Role switching.
- Station assignment editing.
- Maps.
- Payment management.

## Test ID Contract
Required test IDs:
- `screen-ops-role-home`
- `ops-role-home-top-bar`
- `ops-role-home-role-banner`
- `ops-role-home-freshness-chip`
- `ops-role-home-primary-route-card`
- `ops-role-home-urgent-summary`
- `ops-role-home-urgent-card`
- `ops-role-home-route-grid`
- `ops-role-home-route-card`
- `ops-role-home-offline-outbox`
- `ops-role-home-support-card`
- `ops-role-home-refresh`
- `ops-role-home-state-loading-role`
- `ops-role-home-state-loading-work`
- `ops-role-home-state-empty`
- `ops-role-home-state-offline`
- `ops-role-home-state-stale`
- `ops-role-home-state-unsupported-role`
- `ops-role-home-state-missing-station-scope`
- `ops-role-home-state-not-authorized`
- `ops-role-home-state-session-expired`
- `ops-role-home-state-error`

Optional test IDs:
- `ops-role-home-station-card`
- `ops-role-home-driver-card`
- `ops-role-home-courier-card`
- `ops-role-home-count-badge`
- `ops-role-home-last-sync`

## Visual QA Checklist
Before closing implementation:
- Role is obvious above the fold.
- Primary route card is dominant.
- Fresh/stale/offline states are visually distinct.
- Route grid is not crowded.
- Offline outbox is visible when actions are queued.
- Urgent work cards do not expose sensitive data.
- Empty state does not imply shift completion.
- Unsupported role state is clear and calm.
- Large text keeps primary action visible.

## Copy QA Checklist
Before closing implementation:
- Role labels are human-readable.
- No raw enum is used as visible headline.
- Work freshness copy is explicit.
- Error copy says not to scan/move packages until current.
- Missing station copy tells user to contact supervisor/support.
- Unsupported role copy does not blame the user.
- Offline copy warns about stale queues.

## Handoff Summary
Build `OpsRoleHome` as the shared field-operations entry point. It should verify role, show freshness, summarize visible work from `list_deliveries`, and route staff to the correct role-specific queue without ever mutating delivery state.

The central product rule is:
- Home routes work.
- Dedicated workflow screens perform work.
- Backend role and capability policy remains the authority.


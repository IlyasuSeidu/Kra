# Admin Users Screen Spec

## Metadata
| Field | Value |
| --- | --- |
| Screen name | `AdminUsers` |
| Route | `/admin/users` |
| Test id | `screen-admin-users` |
| Surface | Admin web console |
| Backend coverage | `admin_users`; route actions to `admin_upsert_user` and `admin_update_user_access` owner screens |
| Offline critical | No |
| Required read role | `super_admin` through `manage_users_and_roles` capability |
| Required mutation role | No direct mutation on this screen; owner flows require `super_admin` through `manage_users_and_roles` |
| Required states | `loading`, `ready`, `empty`, `filtered_empty`, `not_authorized`, `session_expired`, `stale`, `refreshing`, `api_error` |
| Parent screens | Protected admin shell |
| Related screens | `AdminUserDetail`, `AdminUserAccess`, `AdminStaffActivityLog`, `AdminAuditEvents`, `AdminStations`, `AdminStationDetail`, `AdminIssueQueue` |

## Purpose
`AdminUsers` is the high-trust user directory for the admin console. It lets a super admin find sender, driver, station operator, final-mile courier, admin, and support records, understand access state, and route to the correct user detail or access-management screen.

The screen should answer:
- `Who has access to the system?`
- `Which role does each user hold?`
- `Which users are active or inactive?`
- `Which station operators are scoped to which station?`
- `Which records need access review?`
- `Which user should I open next?`

The screen must treat user management as security-sensitive. It should be dense and useful, but it must not expose more personal data than the list workflow needs.

## Backend Reality
The user list endpoint is concrete:
```http
GET /v1/admin/users
```

Operation:
```text
admin_users
```

Capability:
```text
manage_users_and_roles
```

Supported query parameters:
- `role`
- `status`
- `stationId`
- `limit`

Limit:
- Positive integer.
- Maximum `100`.
- Defaults to `100`.

Important backend facts:
- The endpoint is admin-only and capability-gated.
- In the current permission matrix, `super_admin` has `manage_users_and_roles`.
- Other admin roles do not have this capability.
- The endpoint returns up to the requested limit.
- There is no text search backend parameter.
- There is no pagination cursor.
- There is no bulk action endpoint.
- There is no delete endpoint.
- There is no password or credential endpoint.
- There is no direct role mutation on this list screen.

Therefore:
- The screen must not call unsupported search or pagination params.
- The screen must not build bulk role changes.
- The screen must not expose inline role/status mutation controls.
- The screen must route detail and access edits to owner screens.
- The screen must clearly label when local search is limited to loaded rows.

## Primary Users
Primary:
- `super_admin` reviewing and managing access records.

Secondary:
- QA validating role/station/status filtering.
- Security reviewers validating least-privilege and personal data exposure.
- Engineering leads validating user-management contract boundaries.
- Claude Code implementing the admin console later.

Non-users:
- `ops_admin`
- `support_admin`
- `finance_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`

These roles must not access this screen unless backend capabilities change later.

## User Goal
Super admins use this screen to:
- Review all returned users.
- Filter by role.
- Filter by active or inactive status.
- Filter station-scoped users by station.
- Limit returned rows.
- Locally search loaded rows by user ID, full name, email, masked phone, role, status, or station ID.
- Open user detail.
- Open access-management flow.
- Open station detail for station operators.
- Refresh the directory.

The screen should make access posture visible quickly without encouraging accidental high-impact mutations.

## Entry Points
The screen can open from:
- Admin shell navigation.
- `AdminOverview` security or staff shortcut.
- `AdminStationDetail` station operator context when supported.
- `AdminStaffActivityLog` actor link.
- `AdminAuditEvents` actor link.
- Direct route `/admin/users`.

The screen must not open from:
- Public web navigation.
- Sender app.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Finance-only admin navigation.
- Support-only admin navigation.

## Scope
In scope:
- User list loading.
- Backend role filter.
- Backend status filter.
- Backend station filter.
- Backend limit filter.
- Local search across loaded rows.
- Sort loaded rows.
- Row actions.
- Access-state summary.
- Station-scope visibility.
- Empty and filtered-empty states.
- Privacy-safe display.
- Role-safe authorization handling.
- Accessibility, analytics, and responsive behavior.

Out of scope:
- Inline role mutation.
- Inline status mutation.
- Inline station assignment mutation.
- Bulk access changes.
- Password reset.
- Credential revocation.
- Full authentication history.
- Staff shift history.
- Payroll or payout data.
- Sender delivery history.
- Driver run history.
- Courier proof history.
- Raw audit event stream.
- User deletion.

## Design Thesis
The screen should feel like a secure operations directory: clear, restrained, and tuned for access review. It should not look like a social CRM or marketing contact list.

Visual direction:
- Use a white admin workspace with a dense, accessible table.
- Use strong role and status chips with text labels.
- Use station ID as monospaced text.
- Use a summary band for active users, inactive users, admin users, station-scoped users, and returned-row scope.
- Use restrained red for inactive or access-risk states.
- Use amber for missing optional contact fields.
- Use blue for neutral navigation.
- Use gray for absent optional station scope.

Restraint rule:
- No avatars, contact-card gallery, decorative people photos, bulk action toolbar, or inline mutation controls.

## Research Inputs
External research used for this screen:
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-4/): supports account lifecycle, identity assurance, and access-management rigor.
- [Microsoft Entra least privileged roles](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/delegate-by-task): supports least-privilege role administration.
- [USWDS table component](https://designsystem.digital.gov/components/table/): supports accessible tabular data for government-grade admin records.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports clear filters, labels, and validation.
- [GOV.UK search pattern](https://design-system.service.gov.uk/patterns/search/): supports predictable search behavior and result clarity.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible refresh and filter result announcements.

How the research affects the screen:
- Identity guidance shapes least-exposure display and access lifecycle language.
- Least-privilege guidance keeps the route super-admin-only.
- Table guidance shapes row structure, headers, and keyboard actions.
- Search and form guidance shapes explicit filter labels and local-search scope copy.
- WCAG guidance shapes loading, refresh, and result-count announcements.

## Backend Data Contract
### User List
Request:
```http
GET /v1/admin/users
```

Query parameters:
```text
role?: Role
status?: active | inactive
stationId?: StationId
limit?: number
```

Operation:
```text
admin_users
```

Capability:
```text
manage_users_and_roles
```

Response fields:
- `generatedAt`
- `users[].userId`
- `users[].fullName`
- `users[].role`
- `users[].status`
- `users[].stationId`
- `users[].email`
- `users[].phone`
- `users[].createdAt`
- `users[].updatedAt`
- `users[].activatedAt`
- `users[].deactivatedAt`

Rules:
- Use backend filters only for supported fields.
- Use local search only for loaded rows.
- Do not request more than `100`.
- Do not infer missing contact data as an error.
- Do not expose raw phone number by default if list policy chooses masked display.

### Related Upsert Owner Flow
User create or full record edit belongs to:
```http
POST /v1/admin/users
```

Operation:
```text
admin_upsert_user
```

This list screen may route to `AdminUserDetail` for record creation or detail review, but it must not submit upserts inline.

### Related Access Owner Flow
Role, status, and station-scope changes belong to:
```http
POST /v1/admin/users/:id/access
```

Operation:
```text
admin_update_user_access
```

This list screen may route to `AdminUserAccess`, but it must not submit access changes inline.

## Role And Station Rules
Roles:
- `sender`
- `driver`
- `station_operator`
- `final_mile_courier`
- `ops_admin`
- `finance_admin`
- `support_admin`
- `super_admin`

Statuses:
- `active`
- `inactive`

Station-scope rules:
- `station_operator` requires `stationId`.
- `sender` forbids `stationId`.
- `ops_admin` forbids `stationId`.
- `finance_admin` forbids `stationId`.
- `support_admin` forbids `stationId`.
- `super_admin` forbids `stationId`.

List display rules:
- If a `station_operator` row lacks `stationId`, show integrity warning.
- If a forbidden-station role includes `stationId`, show integrity warning.
- Do not let the list edit the invalid record inline.
- Route to `AdminUserAccess` for correction.

## Information Architecture
Desktop order:
1. Admin shell and breadcrumb.
2. Page header.
3. Access posture summary.
4. Backend filters.
5. Local search and sort.
6. User table.
7. Scope and privacy notice.

Mobile order:
1. Header.
2. Access posture summary.
3. Filters.
4. User cards.
5. Scope notice.

## Layout
### Desktop
Viewport:
- `min-width: 1024px`

Layout:
- Protected admin shell.
- Main width max `1440px`.
- Summary band across top.
- Filters in a compact horizontal bar.
- Table full width.

Table columns:
- User.
- Role.
- Status.
- Station scope.
- Contact.
- Created.
- Updated.
- Access lifecycle.
- Actions.

### Tablet
Viewport:
- `768px` to `1023px`

Layout:
- Summary band wraps.
- Filters use two rows.
- Table hides lifecycle detail behind row expansion.

### Mobile
Viewport:
- `<768px`

Layout:
- Filters stack.
- User rows become cards.
- Row actions become explicit buttons.
- Contact and lifecycle details are collapsed under `User metadata`.

Mobile rules:
- No horizontal scrolling.
- Role and status remain visible.
- Access actions remain explicit.

## Components
### `AdminUsersPage`
Responsibilities:
- Verify capability-gated access.
- Manage backend filters.
- Fetch `admin_users`.
- Run local search across loaded rows.
- Sort loaded rows.
- Render summary, table, and mobile cards.
- Route to user detail and access screens.
- Render authorization and error states.

Test id:
```text
screen-admin-users
```

### `UsersHeader`
Content:
- Title: `Users and access`
- Subtitle: `Review returned user records, access status, and station scope.`
- Refresh action.
- Generated timestamp.

Rules:
- Do not show create or edit controls to unauthorized users.
- Keep scope text visible.

### `AccessPostureSummary`
Metrics:
- Returned users.
- Active users.
- Inactive users.
- Admin users.
- Station operators.
- Station-scope warnings.

Rules:
- Metrics are based on returned rows.
- Label summary as `Returned row summary`.
- Do not claim total system user count unless backend later returns total count.

### `AdminUserFilters`
Backend filters:
- Role.
- Status.
- Station ID.
- Limit.

Rules:
- Submitting filters triggers `admin_users` query with supported params only.
- Limit choices should be `25`, `50`, `100`.
- Role and station filters must preserve schema rules.
- Station filter should be available for station-scoped review, not only station operators, because backend supports `stationId`.

### `AdminUserLocalSearch`
Purpose:
- Find loaded rows quickly without unsupported backend search.

Search fields:
- User ID.
- Full name.
- Role.
- Status.
- Station ID.
- Email.
- Masked phone.

Rules:
- Label as `Search loaded rows`.
- Do not call backend text search.
- Announce result count.
- Clearing search restores loaded rows.

### `AdminUserTable`
Purpose:
- Show returned users in a dense table.

Row content:
- Full name.
- User ID.
- Role.
- Status.
- Station ID if present.
- Email if present.
- Masked phone if present.
- Created time.
- Updated time.
- Activated or deactivated time.

Rules:
- Use real table headers.
- Use row action buttons, not only row click.
- Use role chips with text.
- Use status chips with text.
- Use monospaced user IDs and station IDs.

### `AdminUserCardList`
Purpose:
- Mobile representation of loaded users.

Rules:
- Repeat all labels.
- Keep role and status visible at top.
- Put actions at bottom.
- Do not hide inactive status.

### `UserContactCell`
Display:
- Email: show if present.
- Phone: masked by default, such as last four visible.
- Missing contact: show `No contact recorded`.

Rules:
- Do not add reveal control on this list screen.
- Do not send contact values to analytics.
- Do not use contact data as row action label.

### `UserStationScopeCell`
Display:
- Station ID if present.
- `No station scope` when absent.
- Integrity warning when role/station rule is violated.

Actions:
- Station ID links to `AdminStationDetail` for valid station IDs.
- Integrity warning links to `AdminUserAccess`.

### `UserRowActions`
Actions:
- `Open user detail`
- `Manage access`
- `Open station detail` when valid `stationId` exists.
- `Open audit events` when actor filtering is supported.

Rules:
- Do not include inline activate, deactivate, or role-change buttons.
- Do not include delete.
- Action labels include user name or ID for accessibility.

## Sorting
Sort keys:
- Updated time.
- Full name.
- Role.
- Status.
- Station ID.
- Created time.

Default sort:
- Updated time descending.

Rules:
- Sorting is client-side on loaded rows.
- Announce sort changes.
- Do not call unsupported backend sort params.

## Empty And State Handling
### Loading
Show:
- Header skeleton.
- Filter bar skeleton.
- Table skeleton.

Do not show:
- Assumed counts.
- Assumed roles.

### Empty
Cause:
- Backend returns zero users for current filters.

Copy:
```text
No users returned for these filters.
```

Actions:
- Clear filters.
- Refresh.

### Filtered Empty
Cause:
- Backend returned users, but local search removed all visible rows.

Copy:
```text
No loaded users match this local search.
```

Actions:
- Clear search.

### Not Authorized
Cause:
- User lacks `manage_users_and_roles`.

Copy:
```text
You do not have permission to view user management.
```

Rules:
- Do not show partial user data.
- Offer admin home route if allowed.

### API Error
Rules:
- Show request-safe message.
- Offer refresh.
- Do not expose raw payload.

## Privacy And Security
Security:
- Screen requires `manage_users_and_roles`.
- Do not render user rows before authorization passes.
- Do not expose management actions to unauthorized roles.
- Do not store query payloads with personal data beyond supported filters.

Privacy:
- Treat phone and email as sensitive contact data.
- Do not send contact data to analytics.
- Do not include full name in analytics unless policy later approves.
- Do not include user names or emails in URLs.
- Do not show sender delivery history on this list.

Self-access guardrail:
- Backend prevents super admins from removing their own access.
- List screen must still warn when opening access management for the current signed-in user.

## Analytics
Events:
- `admin_users_viewed`
- `admin_users_refreshed`
- `admin_users_backend_filtered`
- `admin_users_local_searched`
- `admin_users_sorted`
- `admin_users_detail_opened`
- `admin_users_access_opened`
- `admin_users_station_opened`
- `admin_users_unauthorized`

Allowed properties:
- `returned_user_count_bucket`
- `active_count_bucket`
- `inactive_count_bucket`
- `admin_count_bucket`
- `station_operator_count_bucket`
- `role_filter`
- `status_filter`
- `station_filter_present`
- `limit`
- `sort_key`
- `role`

Forbidden properties:
- User ID.
- Full name.
- Email.
- Phone.
- Station note.
- Auth tokens.
- Raw error payloads.

Count buckets:
- `0`
- `1-25`
- `26-50`
- `51-100`

## Accessibility
Landmarks:
- One `main` region.
- One `h1`.
- Filter form has accessible name.
- Table has caption and headers.

Forms:
- Every filter has visible label.
- Limit control explains maximum `100`.
- Local search label says `Search loaded rows`.

Status messages:
- Loading, refreshing, filtering, searching, and sorting use polite live regions.
- Unauthorized and API error states use assertive region.

Keyboard:
- Filters are reachable before table.
- Row actions are reachable in visual order.
- Sort buttons are keyboard accessible.
- Mobile cards expose actions as buttons.

Color:
- Role and status chips include text.
- Inactive status is not color-only.
- Integrity warnings include text.

## Performance
Targets:
- Initial list visible within `1500ms` on normal admin network.
- Local search and sort under `100ms` for up to `100` rows.

Rules:
- Do not poll.
- Do not fetch related user details per row.
- Do not fetch station details per row.
- Do not use virtualization for `100` rows unless table component already does.
- Keep filters in URL query only for non-sensitive values.

## Responsive Behavior
Desktop:
- Summary band, filter row, table.

Tablet:
- Wrapped summary and filters.
- Table row expansion for lower-priority data.

Mobile:
- Summary cards.
- Stacked filters.
- User cards.
- Explicit action buttons.

Mobile rules:
- No horizontal scrolling.
- User role and status must stay visible.
- Contact data remains minimized.

## Testing Requirements
Unit tests:
- Backend filter query builder.
- Limit options and max enforcement.
- Local search logic.
- Sort logic.
- Summary metric derivation.
- Station role binding warning derivation.
- Contact masking.
- Role action visibility.
- Analytics sanitizer.

Integration tests:
- Loads users from `admin_users`.
- Sends role filter.
- Sends status filter.
- Sends station filter.
- Sends limit.
- Does not send unsupported text search param.
- Shows empty state.
- Shows filtered empty state.
- Shows not-authorized state.
- Routes to user detail.
- Routes to access screen.
- Routes to station detail for station-scoped rows.

Accessibility tests:
- Page has one `h1`.
- Filter labels exist.
- Table caption exists.
- Sort controls have accessible names.
- Search result count is announced.
- Mobile cards repeat labels.
- Row action labels include user context.

Visual regression states:
- Populated user list.
- Empty list.
- Filtered empty.
- Inactive users.
- Station-scoped users.
- Integrity warning.
- Not authorized.
- API error.
- Mobile user cards.

## Implementation Checklist
- Create route `/admin/users`.
- Use protected admin shell.
- Gate route with `manage_users_and_roles`.
- Build backend filter state for role, status, station, and limit.
- Fetch `admin_users`.
- Build local search over loaded rows.
- Build sort over loaded rows.
- Build access posture summary.
- Build desktop table.
- Build mobile cards.
- Add privacy-safe contact display.
- Add route actions.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build
Do not build:
- Inline role changes.
- Inline status changes.
- Inline station assignment.
- Bulk access actions.
- User deletion.
- Password reset.
- Credential management.
- Sender delivery history.
- Driver run history.
- Courier proof history.
- Payroll or payout records.
- Unsupported backend text search.
- Unsupported pagination cursor.
- Analytics containing personal data.

## Acceptance Criteria
The screen is complete when:
- `/admin/users` renders with test id `screen-admin-users`.
- It requires `manage_users_and_roles`.
- It fetches `admin_users`.
- It supports backend role, status, station, and limit filters only.
- It supports clearly labeled local search over loaded rows.
- It shows user ID, name, role, status, station scope, minimized contact, and timestamps.
- It routes to user detail and access management.
- It does not mutate users inline.
- It protects personal data from analytics.
- It handles loading, empty, filtered empty, unauthorized, stale, refresh, and error states.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief
Build `AdminUsers` as a secure super-admin user directory for `/admin/users`. Use `admin_users` with only supported backend filters, provide local search over loaded rows, show role/status/station/access lifecycle clearly, minimize contact exposure, route edits to `AdminUserDetail` and `AdminUserAccess`, and never perform inline user mutations or send personal data to analytics.

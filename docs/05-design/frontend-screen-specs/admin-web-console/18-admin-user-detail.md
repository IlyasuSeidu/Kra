# Admin User Detail Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Screen ID            | `AdminUserDetail`                                                                                                                                                  |
| Route                | `/admin/users/:userId`                                                                                                                                             |
| Primary test ID      | `screen-admin-user-detail`                                                                                                                                         |
| Surface              | Admin web console                                                                                                                                                  |
| Backend coverage     | `admin_users`, `admin_upsert_user`; route actions to `admin_update_user_access` owner screen                                                                       |
| Offline critical     | No                                                                                                                                                                 |
| Required read role   | `super_admin` through `manage_users_and_roles` capability                                                                                                          |
| Required submit role | `super_admin` through `manage_users_and_roles` capability                                                                                                          |
| Required states      | `loading`, `ready`, `not_found`, `create_candidate`, `dirty`, `client_invalid`, `confirm`, `submitting`, `saved`, `not_authorized`, `session_expired`, `api_error` |
| Parent screens       | `AdminUsers`, protected admin shell                                                                                                                                |
| Related screens      | `AdminUsers`, `AdminUserAccess`, `AdminStaffActivityLog`, `AdminAuditEvents`, `AdminStationDetail`, `AdminIssueQueue`                                              |

## Purpose

`AdminUserDetail` is the super-admin record workspace for one user ID. It lets a super admin review a user record, maintain profile/contact fields, and route high-impact role or activation changes to the dedicated access-management screen.

The screen should answer:

- `Which user record is this?`
- `Is the record active or inactive?`
- `Which role is assigned?`
- `Is station scope valid for this role?`
- `Which contact fields are recorded?`
- `When was the record created, updated, activated, or deactivated?`
- `What changes are safe to make here?`
- `Which access changes belong in the access screen?`

The page must protect identity and access data. It is not a general staff profile page, not a payroll page, and not a user activity timeline.

## Backend Reality

There is no single-user read endpoint today.

The screen must resolve a user by fetching:

```http
GET /v1/admin/users
```

Operation:

```text
admin_users
```

The route parameter is:

```text
:userId
```

The screen can submit full user records through:

```http
POST /v1/admin/users
```

Operation:

```text
admin_upsert_user
```

Capability:

```text
manage_users_and_roles
```

Important backend facts:

- `admin_users` returns at most `100` users.
- `admin_users` does not support `userId` query filtering.
- `admin_upsert_user` can create a record or update a record by `userId`.
- `admin_upsert_user` accepts full name, role, optional status, optional station ID, optional email, and optional phone.
- Backend enforces role and station binding rules.
- Backend prevents super admins from deactivating their own account through upsert.
- Mutating POST requests are idempotent with `Idempotency-Key`.

Therefore:

- Existing record resolution is limited to loaded admin user rows.
- If the route user ID is not in the loaded list, the screen must not claim the user does not exist globally.
- The not-found state must say the user was not returned by the current backend list.
- Access changes should route to `AdminUserAccess` unless the screen is intentionally creating a new record from a known user ID.
- The screen must not show raw credential or authentication data.

## Primary Users

Primary:

- `super_admin` reviewing and maintaining user records.

Secondary:

- QA validating user detail and upsert behavior.
- Security reviewers validating least-privilege and personal data exposure.
- Engineering leads validating backend boundary honesty.
- Claude Code implementing the admin console later.

Non-users:

- `ops_admin`
- `support_admin`
- `finance_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`

These roles must not access the page unless backend capabilities change later.

## User Goal

Super admins use this screen to:

- Open one user record by user ID.
- Review identity, role, status, station scope, contact, and lifecycle timestamps.
- Edit full name.
- Edit email.
- Edit phone.
- Create a record for a known user ID when the backend did not return it and the admin intentionally proceeds.
- Review the exact upsert payload.
- Submit an idempotent upsert.
- Navigate to access management for role, status, and station-scope changes.
- Navigate to audit or station context when supported.

The screen should make it difficult to confuse profile maintenance with access control.

## Entry Points

The screen can open from:

- `AdminUsers` row action.
- `AdminUserAccess` back link.
- `AdminStaffActivityLog` actor link.
- `AdminAuditEvents` actor link.
- `AdminIssueDetail` actor context when supported.
- Direct route `/admin/users/:userId`.

The screen must not open from:

- Public web.
- Sender app.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Non-super-admin navigation.

## Scope

In scope:

- Route user ID display.
- User resolution from loaded `admin_users`.
- Current user detail display.
- Create-candidate handling when user is not returned.
- Profile/contact edit form.
- Current role and status display.
- Station scope display.
- Role/station integrity warning.
- Upsert review step.
- Idempotent upsert submit.
- Backend saved result.
- Privacy-safe contact handling.
- Route actions to access management, station detail, and audit screens.
- Authorization, loading, not-found, stale, refresh, and API error states.

Out of scope:

- Inline role change for existing users.
- Inline activation or deactivation for existing users.
- Inline station assignment for existing users.
- Bulk actions.
- Password reset.
- Credential revocation.
- Authentication event history.
- Full audit event timeline.
- Delivery history.
- Staff shift history.
- Payroll or payout data.
- User deletion.

## Design Thesis

The screen should feel like a secure identity record: structured, quiet, explicit about what is editable, and strict about routing access changes to the right flow.

Visual direction:

- Use a two-column desktop layout with identity summary and edit form.
- Use a persistent access-state panel.
- Use clear read-only rows for role, status, and station scope.
- Use restrained warning bands for integrity issues.
- Use contact fields with privacy hints.
- Use a review step before upsert.
- Use monospaced user IDs and station IDs.

Restraint rule:

- No avatars, social profile styling, timeline feed, inline access toggles, or one-click save.

## Research Inputs

External research used for this screen:

- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports lifecycle-aware identity handling and careful account data treatment.
- [Microsoft Entra access reviews deployment](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews): supports least-privilege review and governance framing for identity records.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-submit for record changes.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): supports clear labels, hints, and focused record fields.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports accessible form labels, hints, and errors.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports field-specific error messages.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports save and refresh announcements.

How the research affects the screen:

- Identity lifecycle guidance shapes privacy and access-change separation.
- Governance guidance keeps least-privilege context visible.
- Check-answer guidance shapes the upsert confirmation step.
- Form and WCAG guidance shape labels, hints, errors, and save feedback.

## Backend Data Contract

### Resolve User

Request:

```http
GET /v1/admin/users?limit=100
```

Operation:

```text
admin_users
```

Fields used:

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

Resolution rules:

- Match `:userId` exactly against loaded `users[].userId`.
- If found, render ready state.
- If not found, render `not_found` or `create_candidate` depending on route intent.
- Do not call unsupported `userId` query.
- Do not claim global non-existence.

### Upsert User

Request:

```http
POST /v1/admin/users
```

Operation:

```text
admin_upsert_user
```

Request body:

```json
{
  "userId": "USR-OPS-001",
  "fullName": "Ama Owusu",
  "role": "station_operator",
  "status": "active",
  "stationId": "ST-ACC-01",
  "email": "ama@example.com",
  "phone": "+233240000001"
}
```

Response:

- `userId`
- `fullName`
- `role`
- `status`
- `stationId`
- `email`
- `phone`
- `createdAt`
- `updatedAt`
- `activatedAt`
- `deactivatedAt`

Rules:

- Existing-user detail should use upsert only for safe profile/contact maintenance unless product explicitly chooses full-record edit.
- Access changes for existing users route to `AdminUserAccess`.
- Create-candidate mode can collect full required upsert values.
- Include idempotency key for submit.
- Invalidate `AdminUserList` and `User` caches after success.

## Role And Station Rules

Backend-enforced rules:

- `station_operator` requires `stationId`.
- `sender` forbids `stationId`.
- `ops_admin` forbids `stationId`.
- `finance_admin` forbids `stationId`.
- `support_admin` forbids `stationId`.
- `super_admin` forbids `stationId`.

Detail display:

- Show role.
- Show status.
- Show station scope.
- Show integrity warning if current backend data violates role/station rules.
- Route correction to `AdminUserAccess`.

Existing user edit policy:

- Full name, email, and phone are editable on this screen.
- Role, status, and station scope are read-only and changed through `AdminUserAccess`.

Create-candidate policy:

- If product supports creating from `/admin/users/:userId`, the screen may collect role, status, and station scope because a complete record is required.
- Create-candidate mode must use stronger confirmation.
- Create-candidate mode must not appear accidentally after a failed list fetch.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. User identity header.
3. Access state panel.
4. Profile/contact detail form.
5. Lifecycle timestamps.
6. Related actions.
7. Scope and privacy notice.

Mobile order:

1. Header.
2. Access state.
3. Profile/contact form.
4. Lifecycle details.
5. Actions.
6. Privacy notice.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main width max `1200px`.
- Two-column content.
- Left column identity, form, timestamps.
- Right column access state and actions.
- Right panel sticky below shell header.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Single-column.
- Access panel below header.
- Form sections stacked.

### Mobile

Viewport:

- `<768px`

Layout:

- Single-column.
- Sticky bottom primary action when dirty.
- Access actions below detail summary.
- Review step as stacked rows.

## Components

### `AdminUserDetailPage`

Responsibilities:

- Verify capability-gated access.
- Read route `userId`.
- Fetch `admin_users`.
- Resolve loaded user.
- Manage ready, not-found, and create-candidate states.
- Initialize edit form.
- Build upsert payload.
- Manage review and submit flow.
- Render backend saved result.
- Route access changes to `AdminUserAccess`.

Test id:

```text
screen-admin-user-detail
```

### `UserDetailHeader`

Content:

- Full name or route user ID.
- User ID.
- Role.
- Status.
- Last updated timestamp.
- Breadcrumb back to users.

Rules:

- Use route user ID if user is not returned.
- Do not show email or phone in page title.

### `UserAccessStatePanel`

Content:

- Role.
- Status.
- Station scope.
- Capabilities derived from role.
- Integrity warnings.
- Action to `AdminUserAccess`.

Rules:

- Read-only on this screen for existing users.
- Show self-access warning if route user ID matches signed-in user ID.
- Do not allow self-deactivation from this page.

### `UserProfileForm`

Fields:

- `fullName`
- `email`
- `phone`

Rules:

- Full name is required.
- Email is optional and must be valid if present.
- Phone is optional and must match backend phone schema if present.
- Contact fields include privacy hints.
- Empty optional fields are omitted from payload.

### `CreateCandidateForm`

Purpose:

- Create a user record for a known route user ID when the backend did not return it and the admin intentionally proceeds.

Fields:

- `userId` from route, read-only.
- `fullName`
- `role`
- `status`
- `stationId`
- `email`
- `phone`

Rules:

- Apply role/station rules.
- Default status to `active` only if the admin confirms.
- Require review before submit.
- Do not show create candidate after `admin_users` API failure.

### `UserLifecyclePanel`

Fields:

- `createdAt`
- `updatedAt`
- `activatedAt`
- `deactivatedAt`

Rules:

- Use local display plus machine-readable datetime.
- Missing optional timestamps show `Not recorded`.

### `UserDetailReviewStep`

Purpose:

- Confirm profile/contact or create-candidate payload before submit.

Content:

- User ID.
- Changed fields.
- Contact field presence.
- Access fields if create-candidate mode.
- Privacy warning.
- Idempotency behavior.

Rules:

- Submit action appears only in review step.
- Focus moves to review heading.
- Back action preserves edits.

### `UserDetailResultPanel`

Purpose:

- Show backend-saved user record.

Content:

- Saved full name.
- Saved role.
- Saved status.
- Saved station scope.
- Saved contact presence.
- Updated time.
- Follow-up actions.

Rules:

- Use backend response as final truth.
- Do not auto-navigate.

## Client Validation Rules

Existing-user mode:

- Route user ID is present.
- Full name is `2..120` characters.
- Email is valid if present and max `254`.
- Phone matches backend phone format if present.
- At least one editable field changed before review.

Create-candidate mode:

- User ID is route value and read-only.
- Full name is `2..120`.
- Role is valid.
- Status is valid if present.
- `station_operator` requires station ID.
- Sender and admin roles forbid station ID.
- Email is valid if present.
- Phone matches backend phone format if present.

Client validation must not:

- Modify role/status/station for existing users.
- Submit unsupported fields.
- Claim a not-returned user does not exist globally.
- Expose raw backend payloads.

## Submission Flow

Before submit:

1. Validate form.
2. Confirm capability.
3. Build upsert payload.
4. Generate idempotency key.
5. Enter review step.

On submit:

1. Disable submit.
2. Send `POST /v1/admin/users`.
3. Include `Idempotency-Key`.
4. Parse backend response.
5. Invalidate `AdminUserList` and `User` query data.
6. Render saved result.

On retry:

- Reuse idempotency key only for the same payload after transient failure.
- Generate new key after payload changes.

## Unsaved Changes

Dirty state starts when:

- Full name changes.
- Email changes.
- Phone changes.
- Create-candidate fields change.

Dirty state clears when:

- Backend save succeeds and response becomes baseline.
- User resets fields to loaded values.

Navigation guard:

- Warn before leaving with unsaved changes.
- Do not warn after successful save.

## Error States

### Not Authorized

Cause:

- User lacks `manage_users_and_roles`.

Rules:

- Do not show user details.
- Offer admin home route if allowed.

### Not Found

Cause:

- `admin_users` succeeds but route user ID is not in returned rows.

Copy:

```text
This user was not returned by the current admin user list.
```

Actions:

- Back to users.
- Refresh.
- Create record for this user ID when product enables create-candidate mode.

### API Error

Rules:

- Show request-safe error.
- Do not show create-candidate mode.
- Offer retry.

### Server Validation Error

Rules:

- Map field errors where possible.
- Preserve edits.
- Do not guess save success.

## Copy System

Tone:

- Direct.
- Security-aware.
- Calm.

Preferred labels:

- `User record`
- `Access state`
- `Profile and contact`
- `Manage access`
- `Review user update`
- `Submit user update`
- `Create user record`

Warnings:

- `Role and activation changes are managed in the access screen.`
- `This user was not returned by the current list response.`
- `Do not enter customer personal data in admin notes or unsupported fields.`

Avoid:

- Casual CRM language.
- `Invite teammate` unless invitation backend exists.
- `Delete user`
- `Deactivate` on this screen for existing users.

## Analytics

Events:

- `admin_user_detail_viewed`
- `admin_user_detail_not_returned`
- `admin_user_detail_dirty`
- `admin_user_detail_review_opened`
- `admin_user_detail_submitted`
- `admin_user_detail_saved`
- `admin_user_detail_access_opened`
- `admin_user_detail_station_opened`
- `admin_user_detail_server_error`
- `admin_user_detail_unauthorized`

Allowed properties:

- `role`
- `target_role`
- `target_status`
- `station_scope_present`
- `mode`
- `changed_field_count`
- `has_email`
- `has_phone`
- `result_status`

Forbidden properties:

- User ID.
- Full name.
- Email.
- Phone.
- Auth tokens.
- Raw error payloads.

## Accessibility

Landmarks:

- One `main` region.
- One `h1`.
- Access panel has accessible section name.
- Form fields have visible labels.

Forms:

- Field errors are field-specific.
- Error summary links to fields.
- Review step receives focus.

Status messages:

- Loading, refreshing, submitting, and saved states use polite live regions.
- Authorization and page-level API errors use assertive region.

Keyboard:

- Action buttons are reachable in order.
- Sticky primary action follows DOM order.
- Review back action preserves focus.

Color:

- Role, status, and warning states include text.
- Do not rely on chip color alone.

## Privacy And Security

Security:

- Requires `manage_users_and_roles`.
- Do not render user data before authorization.
- Do not expose credential data.
- Do not allow inline access mutation for existing users.
- Use idempotency key for upsert.

Privacy:

- Email and phone are sensitive contact data.
- Do not send contact values to analytics.
- Do not include user names or contact values in URLs.
- Do not display unrelated delivery or payment data.

Self-access:

- If the target user is the signed-in super admin, show self-access warning.
- Route role/status changes to `AdminUserAccess`, where backend still prevents self-access removal.

## Performance

Targets:

- Detail record visible within `1500ms` on normal admin network when user is in returned rows.
- Local form latency below `50ms`.

Rules:

- Fetch only `admin_users`; do not fetch every related object.
- Do not poll.
- Do not fetch audit events by default.
- Do not use unsupported user ID query param.

## Responsive Behavior

Desktop:

- Identity/form left, access panel right.

Tablet:

- Single column, access panel below header.

Mobile:

- Single column.
- Sticky bottom primary action when dirty.
- Review step as stacked rows.

Mobile rules:

- No horizontal scrolling.
- Contact fields are clearly labeled.
- Access state remains visible before edit form.

## Testing Requirements

Unit tests:

- User resolution from loaded list.
- Not-returned state.
- Existing-user form initialization.
- Create-candidate validation.
- Role/station rule warnings.
- Payload builder.
- Dirty-state derivation.
- Contact validation.
- Self-access warning.
- Analytics sanitizer.

Integration tests:

- Loads user from `admin_users`.
- Shows not-returned state.
- Does not call unsupported user ID query.
- Opens access management route.
- Opens station detail for station-scoped user.
- Edits profile/contact fields.
- Opens review step.
- Submits `admin_upsert_user`.
- Sends idempotency key.
- Shows saved backend result.
- Preserves edits on server error.
- Handles unauthorized state.

Accessibility tests:

- Page has one `h1`.
- Form labels exist.
- Error summary links to fields.
- Review focus moves correctly.
- Saved status is announced.
- Mobile layout repeats labels.

Visual regression states:

- Existing active user.
- Existing inactive user.
- Station-scoped user.
- Integrity warning.
- Create-candidate mode.
- Review step.
- Saved result.
- Not returned.
- Unauthorized.
- Mobile detail.

## Implementation Checklist

- Create route `/admin/users/:userId`.
- Use protected admin shell.
- Gate with `manage_users_and_roles`.
- Fetch `admin_users`.
- Resolve route user from loaded rows.
- Build not-returned state.
- Build create-candidate mode only behind intentional action.
- Build existing-user profile/contact form.
- Build access state panel.
- Build lifecycle panel.
- Build review step.
- Submit `admin_upsert_user` with idempotency key.
- Invalidate `AdminUserList` and `User` after success.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Single-user backend call.
- Unsupported `userId` query param.
- Inline access mutation for existing users.
- Password reset.
- Credential revocation.
- User deletion.
- Full audit timeline.
- Delivery history.
- Payroll or payout records.
- Analytics containing personal data.
- One-click save.

## Acceptance Criteria

The screen is complete when:

- `/admin/users/:userId` renders with test id `screen-admin-user-detail`.
- It requires `manage_users_and_roles`.
- It resolves the user from `admin_users`.
- It clearly handles route users not returned by the loaded list.
- It displays identity, role, status, station scope, contact fields, and lifecycle timestamps.
- It edits only profile/contact fields for existing users.
- It routes role/status/station access changes to `AdminUserAccess`.
- It submits `admin_upsert_user` only through review and idempotency.
- It protects personal data from analytics.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminUserDetail` as a secure super-admin user record workspace for `/admin/users/:userId`. Resolve the target from `admin_users` without inventing a single-user endpoint, separate profile/contact maintenance from access changes, route role/status/station changes to `AdminUserAccess`, support intentional create-candidate mode for known user IDs, submit `admin_upsert_user` only after review with an idempotency key, and protect personal data from analytics.

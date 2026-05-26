# Admin User Access Screen Spec

## Screen Contract

| Field                | Value                                                                                                                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen ID            | `AdminUserAccess`                                                                                                                                                                                                                              |
| Route                | `/admin/users/:userId/access`                                                                                                                                                                                                                  |
| Primary test ID      | `screen-admin-user-access`                                                                                                                                                                                                                     |
| Surface              | Admin web console                                                                                                                                                                                                                              |
| Backend coverage     | `admin_update_user_access`; reads user context from `admin_users`                                                                                                                                                                              |
| Offline critical     | No                                                                                                                                                                                                                                             |
| Required read role   | `super_admin` through `manage_users_and_roles` capability                                                                                                                                                                                      |
| Required submit role | `super_admin` through `manage_users_and_roles` capability                                                                                                                                                                                      |
| Required states      | `loading`, `ready`, `target_not_returned`, `self_access_blocked`, `dirty`, `client_invalid`, `review`, `confirm`, `submitting`, `saved`, `not_authorized`, `session_expired`, `api_error`, `server_validation_error`, `not_found_after_submit` |
| Parent screens       | `AdminUsers`, `AdminUserDetail`, protected admin shell                                                                                                                                                                                         |
| Related screens      | `AdminUsers`, `AdminUserDetail`, `AdminStations`, `AdminStationDetail`, `AdminAuditEvents`, `AdminStaffActivityLog`, `AdminIssueQueue`                                                                                                         |

## Purpose

`AdminUserAccess` is the super-admin access-control workspace for one user. It lets a super admin review the current role, activation state, and station scope, then submit a deliberate role/status/station update through the dedicated access endpoint.

The screen should answer:

- `Which user access record is being changed?`
- `What access does the user have now?`
- `What access will the user have after save?`
- `Does the selected role require station scope?`
- `Does the selected role forbid station scope?`
- `Will this deactivate or reactivate the user?`
- `Is the target the signed-in super admin?`
- `What exactly will be sent to the backend?`
- `Did the backend save the access change?`

This screen is security-critical. It must make high-impact access changes slower, clearer, and harder to do by accident.

## Backend Reality

The access mutation endpoint is concrete:

```http
POST /v1/admin/users/:id/access
```

Operation:

```text
admin_update_user_access
```

Capability:

```text
manage_users_and_roles
```

Request body:

```json
{
  "role": "station_operator",
  "status": "active",
  "stationId": "ST-ACC-01"
}
```

Successful response:

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

Important backend facts:

- The route parameter `:id` is the target user ID.
- The body never includes `userId`.
- The body requires `role`.
- The body requires `status`.
- The body accepts optional `stationId`.
- The backend enforces role and station binding rules.
- The backend fetches the target by ID before saving.
- The backend returns `NOT_FOUND` if the user does not exist.
- The backend prevents a super admin from modifying their own role or activation state.
- The endpoint is idempotent when the request includes `Idempotency-Key`.
- There is still no single-user read endpoint for preloading the target.

Therefore:

- The screen should preload target context from `admin_users` or existing query cache.
- The screen must not call an unsupported single-user read endpoint.
- The screen must not call `GET /v1/admin/users?userId=...`.
- If the target is not returned by the current list context, the screen must not blindly submit access changes.
- If the backend returns `FORBIDDEN` for self-access, the screen must show that backend result clearly.
- The saved panel must render backend response as final truth.

## Primary Users

Primary:

- `super_admin` changing access for operational and admin users.

Secondary:

- Security reviewer validating least-privilege behavior.
- QA validating access-change safety and backend parity.
- Engineering lead validating contract boundaries.
- Claude Code implementing the admin console later.

Non-users:

- `ops_admin`
- `support_admin`
- `finance_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`

These roles must not access the screen unless backend capabilities change later.

## User Goal

Super admins use this screen to:

- Review the current target access state.
- Change user role.
- Suspend a user by setting status to `inactive`.
- Reactivate a user by setting status to `active`.
- Assign station scope only when role is `station_operator`.
- Remove station scope when changing to a role that forbids it.
- Review the exact access payload before submit.
- Confirm high-impact changes.
- Submit with idempotency protection.
- See the backend-saved access record.
- Return to the user list or user detail after save.

The screen should support a serious access-governance workflow, not a casual settings toggle.

## Entry Points

The screen can open from:

- `AdminUsers` row action `Manage access`.
- `AdminUserDetail` access-state panel.
- `AdminStationDetail` station operator context.
- `AdminAuditEvents` actor context when a user ID is available.
- `AdminStaffActivityLog` actor context when a user ID is available.
- Direct route `/admin/users/:userId/access`.

The screen must not open from:

- Public web navigation.
- Sender app.
- Driver app.
- Station operator app.
- Final-mile courier app.
- Non-super-admin navigation.
- Finance-only admin navigation.
- Support-only admin navigation.

## Scope

In scope:

- Target user access context.
- Current role display.
- Current status display.
- Current station scope display.
- Role change.
- Status change.
- Station scope change for `station_operator`.
- Station scope removal for roles that forbid it.
- Self-access guardrail.
- Role/station validation.
- Review-before-submit.
- Confirmation for role/status/station changes.
- Idempotent submit.
- Backend saved result.
- Not-returned target handling.
- Authorization, session, validation, API, and not-found states.
- Privacy-safe analytics.
- Accessibility and responsive behavior.

Out of scope:

- User creation.
- Full name edit.
- Email edit.
- Phone edit.
- Password reset.
- Credential revocation.
- Multi-factor reset.
- Delete user.
- Bulk access changes.
- Access review campaign management.
- Payroll access.
- Delivery assignment history.
- Driver run history.
- Sender delivery history.
- Full audit event stream.

## Design Thesis

The screen should feel like an access-control chamber: deliberate, structured, and audit-ready. It should make the before and after state obvious, keep destructive actions visibly constrained, and avoid one-click privilege changes.

Visual direction:

- Use a focused two-column desktop layout.
- Put current access and proposed access side by side.
- Use strong labels for role, status, and station scope.
- Use amber for risk and review states.
- Use red only for suspension and self-access blocked states.
- Use a fixed review rail on desktop.
- Use explicit action buttons instead of hidden row clicks.
- Use monospaced user ID and station ID.
- Use clear step labels: `Current`, `Change`, `Review`, `Saved`.

Restraint rule:

- No avatars, people-card visuals, inline toggles, celebratory graphics, or access changes outside review.

## Research Inputs

External research used for this screen:

- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/Pubs/sp/800/53/r5/upd1/Final): supports access control, least privilege, auditability, and control rigor.
- [Microsoft Entra principle of least privilege](https://learn.microsoft.com/en-us/entra/id-governance/scenarios/least-privileged): supports minimum necessary access, role-based access, regular review, and deny-by-default thinking.
- [Microsoft Entra access reviews overview](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview): supports periodic review of role assignments and removal of access no longer needed.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-submit for important record changes.
- [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): supports focused questions, clear labels, and back navigation during high-stakes forms.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports sparing use of confirmation dialogs for actions requiring full attention.
- [USWDS form component](https://designsystem.digital.gov/components/form/): supports aligned validation, fieldsets, legends, and visible labels.
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports confirming, correcting, or reversing important submissions.
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible save, validation, and loading announcements.

How the research affects the screen:

- Least-privilege guidance keeps access changes explicit and scoped.
- Access-review guidance shapes the before/after comparison.
- Check-answer guidance shapes review rows and change links.
- Question-page guidance shapes focused form sections and back behavior.
- Modal guidance limits confirmation dialogs to high-impact final actions.
- Form guidance shapes fieldsets, labels, and validation placement.
- WCAG guidance requires review and correction before final save, plus accessible status updates.

## Backend Data Contract

### Resolve Target Context

Primary preload:

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

- Match route `:userId` exactly against loaded `users[].userId`.
- If query cache already contains the exact user from `AdminUsers` or `AdminUserDetail`, it may seed the screen while the list refreshes.
- If the route user is not returned and no trusted cache exists, show `target_not_returned`.
- Do not submit from `target_not_returned`.
- Do not claim the user does not exist globally.
- Do not call unsupported read params.

### Update User Access

Request:

```http
POST /v1/admin/users/:id/access
```

Route parameter:

```text
:id = target user ID
```

Request body:

```json
{
  "role": "driver",
  "status": "inactive"
}
```

Station operator request body:

```json
{
  "role": "station_operator",
  "status": "active",
  "stationId": "ST-ACC-01"
}
```

Operation:

```text
admin_update_user_access
```

Capability:

```text
manage_users_and_roles
```

Required header:

```http
Idempotency-Key: <stable-key-for-this-payload>
```

Response:

```json
{
  "userId": "USR-OPS-001",
  "fullName": "Ama Owusu",
  "role": "station_operator",
  "status": "active",
  "stationId": "ST-ACC-01",
  "createdAt": "2026-05-16T12:00:00.000Z",
  "updatedAt": "2026-05-16T18:00:00.000Z",
  "activatedAt": "2026-05-16T12:00:00.000Z"
}
```

Response rules:

- Treat backend response as final saved state.
- Replace local baseline with response.
- Clear dirty state after successful save.
- Invalidate `AdminUserList` and `User`.
- Invalidate any station user summaries when station scope changed.

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

Backend-enforced station rules:

- `station_operator` requires `stationId`.
- `sender` forbids `stationId`.
- `ops_admin` forbids `stationId`.
- `finance_admin` forbids `stationId`.
- `support_admin` forbids `stationId`.
- `super_admin` forbids `stationId`.

Current backend nuance:

- `driver` and `final_mile_courier` are not explicitly forbidden from carrying `stationId` by the shared schema.
- The UI should still default station scope to empty for these roles unless product policy later defines scoped driver or courier access.
- If a loaded `driver` or `final_mile_courier` has station scope, show a neutral review note instead of treating it as invalid.

Role selection rules:

- Selecting `station_operator` reveals required station ID field.
- Selecting `sender`, `ops_admin`, `finance_admin`, `support_admin`, or `super_admin` clears station ID before review.
- Selecting `driver` or `final_mile_courier` clears station ID unless user intentionally keeps existing scope through a future policy-controlled option.
- The initial implementation should not offer station scope for `driver` or `final_mile_courier`.

Station selection rules:

- Station ID is required for `station_operator`.
- Station ID is hidden for roles that forbid it.
- Station ID input must use a valid existing station selector when station list data is available.
- If station list data is unavailable, accept typed station ID only if it matches the station ID schema and show a validation warning that existence is verified by backend or station data later.

## Self-Access Guardrail

Definition:

- The target user ID equals the signed-in principal user ID.

Backend behavior:

- `admin_update_user_access` rejects any attempt to modify own role or activation state.

Screen behavior:

- Detect self-access before edit.
- Render `self_access_blocked` state for mutation controls.
- Show current access read-only.
- Do not render role/status/station form.
- Do not allow review or submit.
- Offer `Back to user detail` and `Back to users`.

Copy:

```text
You cannot change your own role or activation state.
```

Supporting copy:

```text
This protects the admin console from accidental lockout and privilege removal.
```

If backend still returns `FORBIDDEN`:

- Show the backend-safe error.
- Keep form disabled.
- Clear the in-flight idempotency key.
- Do not retry automatically.

## Information Architecture

Desktop order:

1. Admin shell and breadcrumb.
2. Header with target identity and access risk.
3. Current access panel.
4. Access edit form.
5. Proposed access panel.
6. Review section.
7. Confirmation dialog.
8. Saved result.
9. Policy and audit notice.

Mobile order:

1. Header.
2. Current access.
3. Access edit form.
4. Proposed access.
5. Review.
6. Confirmation.
7. Saved result.
8. Policy notice.

## Layout

### Desktop

Viewport:

- `min-width: 1024px`

Layout:

- Protected admin shell.
- Main width max `1200px`.
- Two-column body.
- Left column: current state, edit form, policy notice.
- Right column: proposed state, review, saved result.
- Right rail sticky below shell header.

### Tablet

Viewport:

- `768px` to `1023px`

Layout:

- Single-column with section cards.
- Proposed access appears immediately after form.
- Review appears below proposed access.
- Confirmation remains a focused dialog.

### Mobile

Viewport:

- `<768px`

Layout:

- Single-column.
- Form fields stack.
- Review rows stack with labels.
- Primary action appears below review, not as a hidden floating control.
- Current and proposed access remain visually distinct.

Mobile rules:

- No horizontal scrolling.
- Role and status controls must remain full width.
- Confirmation buttons must be stacked with safe action first when space is tight.

## Components

### `AdminUserAccessPage`

Responsibilities:

- Verify capability-gated access.
- Read route `userId`.
- Fetch or read cached `admin_users` data.
- Resolve target context.
- Detect self-access.
- Initialize form from target access.
- Validate role/status/station selection.
- Build proposed access.
- Manage review and confirmation.
- Submit `admin_update_user_access`.
- Render saved backend result.
- Route back to detail, users, station detail, and audit context.

Test id:

```text
screen-admin-user-access
```

### `UserAccessHeader`

Content:

- Title: `Manage user access`
- Target full name when resolved.
- Target user ID.
- Current role.
- Current status.
- Last updated timestamp.
- Breadcrumb to `AdminUsers`.
- Back link to `AdminUserDetail`.

Rules:

- Use user ID when full name is unavailable.
- Do not show email or phone in the header.
- Show a `Self access` warning if target equals signed-in user.
- Show `Target not returned` if the route user cannot be resolved from current context.

### `CurrentAccessPanel`

Purpose:

- Show the exact access state before change.

Content:

- Role.
- Status.
- Station scope.
- Created time.
- Updated time.
- Activated time.
- Deactivated time.
- Capabilities derived from role.

Rules:

- Mark all values read-only.
- Use text labels for role and status.
- Use monospaced IDs.
- Show missing optional timestamps as `Not recorded`.
- Show current station scope as `No station scope` when absent.

### `AccessEditForm`

Purpose:

- Collect the next role, status, and station scope.

Fields:

- `role`
- `status`
- `stationId`

Controls:

- Role select or radio group.
- Status radio group.
- Station selector or station ID input for `station_operator`.

Rules:

- Group role options in a fieldset.
- Group status options in a fieldset.
- Do not use a toggle for activation because inactive is a high-impact access state.
- Hide station field unless selected role is `station_operator`.
- Clear forbidden station scope when role changes.
- Preserve previous role/status values until user chooses a change.
- Use visible help text for station requirements.

### `RoleOptionContent`

Purpose:

- Explain the operational meaning of each role without overloading the form.

Role summaries:

- `sender`: Can create and manage own sender-side deliveries.
- `driver`: Can accept runs, confirm pickup, update transit, and report delay.
- `station_operator`: Can run station intake, assignment, dispatch, destination receipt, and final-mile assignment for scoped station.
- `final_mile_courier`: Can accept final-mile assignment, mark out for delivery, complete delivery with proof, and record failed attempt.
- `ops_admin`: Can resolve operational issues and override queue state.
- `finance_admin`: Can approve refunds, execute refunds, review reconciliation, and manage pricing.
- `support_admin`: Can manage issue threads and escalate cases.
- `super_admin`: Can perform all admin actions including user and role management.

Rules:

- Keep summaries short.
- Do not list every endpoint.
- Use existing permission matrix as source.
- Do not imply access beyond current backend capabilities.

### `StatusOptionContent`

Purpose:

- Explain active versus inactive.

Active copy:

```text
Active users can sign in and use capabilities allowed by their role.
```

Inactive copy:

```text
Inactive users should not be able to use the app until reactivated.
```

Rules:

- Inactive is not a delete action.
- Inactive must not imply data removal.
- Reactivation should explain that role and station scope still apply.

### `StationScopeSelector`

Purpose:

- Capture station scope for `station_operator`.

Fields:

- `stationId`
- Optional station display name if available.
- Optional station city if available.

Rules:

- Required only for `station_operator`.
- Prefer controlled station selector using station list data.
- Allow typed station ID only when station list data is not available.
- Show `Station ID is required for station operators.` as field error when missing.
- Link resolved station to `AdminStationDetail`.
- Do not allow station notes or station status edits here.

### `ProposedAccessPanel`

Purpose:

- Show after-state before review.

Content:

- Target role.
- Target status.
- Target station scope.
- Changed fields count.
- Risk flags.

Risk flags:

- Role changes to an admin role.
- Status changes from `active` to `inactive`.
- Status changes from `inactive` to `active`.
- Station scope changes.
- Station scope removed.
- Target role becomes `super_admin`.

Rules:

- Proposed state updates as form changes.
- Never submit from this panel.
- If there are no changes, primary action is disabled with explanation.

### `AccessReviewStep`

Purpose:

- Let the admin check changes before confirmation.

Content:

- User ID.
- User name if available.
- Current role.
- New role.
- Current status.
- New status.
- Current station scope.
- New station scope.
- Idempotency behavior.
- Self-access warning when applicable.
- Backend operation name.

Actions:

- `Change role`
- `Change status`
- `Change station scope`
- `Continue to confirmation`
- `Cancel`

Rules:

- Review opens only after client validation passes.
- Focus moves to review heading.
- Review rows must use labels and values.
- Sensitive personal fields must not appear.
- User can go back without losing selected values.

### `AccessConfirmationDialog`

Purpose:

- Force deliberate confirmation for final submit.

Open conditions:

- Review is complete.
- User chooses `Continue to confirmation`.

Content:

- Concise title.
- One-sentence impact summary.
- Changed fields list.
- Final submit button.
- Cancel button.

Title options:

- `Confirm access change`
- `Confirm user suspension`
- `Confirm reactivation`
- `Confirm super admin access`

Rules:

- Use dialog only for final confirmation.
- Do not put the full form inside the dialog.
- Trap focus while open.
- Label dialog by heading.
- Provide description text.
- Disable close without choice only if product requires forced decision; otherwise allow cancel.
- Destructive action button text must name the result, such as `Suspend user`.
- Safe action text must be clear, such as `Go back to review`.

### `AccessSavedPanel`

Purpose:

- Show backend-saved access result.

Content:

- Saved role.
- Saved status.
- Saved station scope.
- Saved updated time.
- Activated or deactivated timestamp.
- Follow-up actions.

Actions:

- `Back to user detail`
- `Back to users`
- `Open station detail` when station scope exists.
- `Open audit events` when actor filtering exists.

Rules:

- Use backend response as final truth.
- Do not show contact fields.
- Do not auto-navigate after save.
- Announce save status.

### `TargetNotReturnedPanel`

Purpose:

- Handle direct route or stale context when target cannot be resolved.

Copy:

```text
This user was not returned by the current admin user list.
```

Supporting copy:

```text
Access changes are blocked until the target user is verified from a trusted user record.
```

Actions:

- `Back to users`
- `Refresh user list`
- `Open user detail`

Rules:

- Do not render access form.
- Do not submit against route-only user ID.
- Do not say the user does not exist.
- Do not offer record creation here.

### `SelfAccessBlockedPanel`

Purpose:

- Prevent self-role and self-activation changes in UI before backend rejection.

Content:

- Current role.
- Current status.
- Current station scope.
- Backend policy copy.
- Safe navigation actions.

Rules:

- Render before edit form.
- Do not render submit action.
- Do not open confirmation dialog.

## Client State Model

State fields:

- `routeUserId`
- `principalUserId`
- `targetUser`
- `targetResolution`
- `initialRole`
- `initialStatus`
- `initialStationId`
- `selectedRole`
- `selectedStatus`
- `selectedStationId`
- `validationErrors`
- `dirtyFields`
- `reviewOpen`
- `confirmationOpen`
- `idempotencyKey`
- `submitState`
- `savedUser`

Target resolution values:

- `resolved_from_list`
- `resolved_from_cache`
- `not_returned`
- `api_error`

Submit states:

- `idle`
- `submitting`
- `saved`
- `server_validation_error`
- `forbidden`
- `not_found`
- `api_error`

Dirty derivation:

- Role changed.
- Status changed.
- Station ID changed.

Dirty clears when:

- Saved response becomes baseline.
- User resets all selected values to baseline.

## Client Validation Rules

Common:

- Route user ID exists.
- User is authorized with `manage_users_and_roles`.
- Target user is resolved.
- Target user is not signed-in principal.
- Role is one of the supported role enum values.
- Status is `active` or `inactive`.
- At least one access field changes before review.

Station rules:

- If role is `station_operator`, station ID is required.
- If role is `sender`, station ID must be omitted.
- If role is `ops_admin`, station ID must be omitted.
- If role is `finance_admin`, station ID must be omitted.
- If role is `support_admin`, station ID must be omitted.
- If role is `super_admin`, station ID must be omitted.
- Initial implementation omits station ID for `driver` and `final_mile_courier`.

High-impact review rules:

- Role changed to `super_admin` requires stronger confirmation copy.
- Status changed to `inactive` requires suspension confirmation copy.
- Status changed to `active` requires reactivation confirmation copy.
- Station scope changed requires station-scope confirmation copy.

Client validation must not:

- Mutate full name.
- Mutate contact data.
- Create users.
- Delete users.
- Send user ID in request body.
- Send station ID when role forbids it.
- Submit without review.

## Submission Flow

Before review:

1. Validate target is resolved.
2. Validate self-access is not blocked.
3. Validate role/status/station fields.
4. Compute changed fields.
5. Build proposed payload.
6. Open review step.

Before final submit:

1. Review rows show current and proposed values.
2. User opens confirmation dialog.
3. Dialog explains impact.
4. Generate idempotency key for the exact payload.

On submit:

1. Disable final submit.
2. Send `POST /v1/admin/users/:id/access`.
3. Include `Idempotency-Key`.
4. Parse backend response.
5. Invalidate `AdminUserList`.
6. Invalidate target `User` cache if present.
7. Invalidate station user summaries if station scope changed.
8. Render saved result.

On transient retry:

- Reuse idempotency key if payload is unchanged.
- Generate new key if any payload field changes.
- Do not retry automatically after forbidden or validation errors.

## Request Builder

Route:

```text
/v1/admin/users/{routeUserId}/access
```

Payload for non-station role:

```json
{
  "role": "driver",
  "status": "active"
}
```

Payload for station operator:

```json
{
  "role": "station_operator",
  "status": "active",
  "stationId": "ST-ACC-01"
}
```

Payload rules:

- `userId` stays in route only.
- `role` always present.
- `status` always present.
- `stationId` present only when selected role needs station scope or backend policy later allows it.
- Empty station strings are omitted.
- Unknown fields are not sent.

## Error States

### Not Authorized

Cause:

- User lacks `manage_users_and_roles`.

Copy:

```text
You do not have permission to manage user access.
```

Rules:

- Do not show target user data.
- Do not render access controls.
- Offer admin home route if available.

### Session Expired

Cause:

- Auth session expires while loading or submitting.

Rules:

- Stop submit.
- Preserve unsaved selections in memory only.
- Route to sign-in.
- Do not persist selected role/status/station in local storage.

### Target Not Returned

Cause:

- `admin_users` succeeds, but target user ID is not in returned rows and no trusted cache has it.

Rules:

- Block submit.
- Explain list limitation.
- Offer refresh and back actions.

### Self Access Blocked

Cause:

- Target user ID equals current principal ID.

Rules:

- Block edit.
- Explain backend policy.
- Show read-only current access.

### Client Invalid

Cause:

- Missing station ID.
- Forbidden station scope.
- No changes.
- Invalid enum value from corrupted state.

Rules:

- Show field-level errors.
- Show error summary.
- Do not open review.

### Server Validation Error

Cause:

- Backend rejects role/station payload.

Rules:

- Map error to relevant field when possible.
- Preserve selected values.
- Close confirmation dialog.
- Keep review available.

### Not Found After Submit

Cause:

- Backend returns `NOT_FOUND`.

Copy:

```text
The backend could not find this user when saving the access change.
```

Rules:

- Stop submit.
- Preserve selected values.
- Offer refresh.
- Do not claim the user was deleted unless backend says so through a future explicit code.

### API Error

Cause:

- Network error.
- Rate limit.
- Service error.

Rules:

- Show request-safe message.
- Preserve selections.
- Offer retry for transient errors.
- Reuse idempotency key only if payload is unchanged.

## Copy System

Tone:

- Direct.
- Serious.
- Security-aware.
- Clear about consequences.

Preferred labels:

- `Current access`
- `Proposed access`
- `Role`
- `Activation status`
- `Station scope`
- `Review access change`
- `Confirm access change`
- `Save access change`
- `Suspend user`
- `Reactivate user`
- `Assign station scope`

Warning copy:

```text
Changing this role changes what the user can do across Kra.
```

Suspension copy:

```text
Suspending this user sets their account status to inactive.
```

Reactivation copy:

```text
Reactivating this user restores access allowed by the selected role and station scope.
```

Station copy:

```text
Station operators must be scoped to one station.
```

Self-access copy:

```text
You cannot change your own role or activation state.
```

Avoid:

- `Ban user`
- `Kick out`
- `Delete access`
- `Invite user`
- `Quick change`
- `Just save`
- Casual role names not backed by enum values.

## Analytics

Events:

- `admin_user_access_viewed`
- `admin_user_access_target_not_returned`
- `admin_user_access_self_blocked`
- `admin_user_access_dirty`
- `admin_user_access_review_opened`
- `admin_user_access_confirmation_opened`
- `admin_user_access_submitted`
- `admin_user_access_saved`
- `admin_user_access_server_validation_error`
- `admin_user_access_not_found`
- `admin_user_access_forbidden`
- `admin_user_access_api_error`

Allowed properties:

- `current_role`
- `new_role`
- `current_status`
- `new_status`
- `station_scope_changed`
- `station_scope_present_before`
- `station_scope_present_after`
- `changed_field_count`
- `target_is_self`
- `target_resolution`
- `result_status`

Forbidden properties:

- User ID.
- Full name.
- Email.
- Phone.
- Station ID.
- Auth tokens.
- Idempotency key.
- Raw error payload.

Analytics rules:

- Bucket counts if needed.
- Never include target identifiers.
- Never include typed station ID.
- Track only the access shape and result.

## Accessibility

Landmarks:

- One `main` region.
- One `h1`.
- Current access, edit form, proposed access, and review have named sections.

Headings:

- `h1`: `Manage user access`
- `h2`: `Current access`
- `h2`: `Change access`
- `h2`: `Proposed access`
- `h2`: `Review access change`

Forms:

- Role controls use fieldset and legend.
- Status controls use fieldset and legend.
- Station field has visible label and hint.
- Errors are field-specific.
- Error summary links to fields.

Review:

- Focus moves to review heading when review opens.
- Change links or buttons have accessible names.
- Review rows are readable as key/value pairs.

Dialog:

- Dialog has `aria-labelledby`.
- Dialog has `aria-describedby`.
- Focus is trapped while open.
- Escape and cancel behavior is defined.
- Final submit button text names the result.

Status messages:

- Loading target context uses polite live region.
- Client validation errors use assertive region.
- Submitting uses polite live region.
- Saved result uses polite live region.
- Forbidden and not-found after submit use assertive region.

Keyboard:

- Tab order follows visual order.
- Safe back/cancel actions are reachable.
- Primary action is not before required fields in DOM.
- Dialog returns focus to review action after cancel.

Color:

- Role, status, and risk states include text.
- Do not rely on red, amber, or green alone.
- Inactive state includes text and icon label if icon is used.

## Privacy And Security

Security:

- Requires `manage_users_and_roles`.
- Do not render target data before authorization.
- Do not render access form for self-access.
- Do not render access form for unresolved route-only target.
- Do not submit without idempotency key.
- Do not mutate profile/contact fields.
- Do not allow bulk changes.
- Do not store selected access payload in local storage.

Privacy:

- Do not show email or phone unless a surrounding page already exposes it for context.
- Do not send personal data to analytics.
- Do not place user names or contact values in URLs.
- Keep user ID in route because it is the resource identifier.

Audit readiness:

- Show operation name in review copy for internal QA.
- Show changed fields clearly.
- Keep backend response as final truth.
- Route audit review to `AdminAuditEvents` when supported.

## Performance

Targets:

- Resolved target access visible within `1500ms` on normal admin network when user is in loaded rows.
- Form interaction latency below `50ms`.
- Submit feedback starts within `100ms` after final action.

Rules:

- Fetch only `admin_users` for target context.
- Do not fetch all stations unless station selector is open or already cached.
- Do not fetch audit events by default.
- Do not poll.
- Do not retry failed mutation automatically.
- Keep review computation local.

## Responsive Behavior

Desktop:

- Current access and form on left.
- Proposed access and review on right.
- Review rail sticky.

Tablet:

- Current, form, proposed, review stacked.
- Confirmation dialog centered.

Mobile:

- Sections stacked.
- Role and status controls full width.
- Review rows stacked.
- Confirmation actions stacked.

Mobile rules:

- No horizontal scrolling.
- Avoid dense side-by-side comparison that forces pinch zoom.
- Keep current and proposed labels repeated.
- Do not hide changed fields inside collapsed content.

## Testing Requirements

Unit tests:

- Target resolution from `admin_users`.
- Target resolution from trusted query cache.
- Target-not-returned state.
- Self-access blocked state.
- Role option rendering.
- Status option rendering.
- Station field visibility.
- Role/station validation.
- Payload builder without user ID body.
- Payload builder with station operator station ID.
- Station ID clearing for forbidden roles.
- Dirty-state derivation.
- Review-row generation.
- Confirmation title selection.
- Idempotency key reuse rules.
- Analytics sanitizer.

Integration tests:

- Loads target context from `admin_users`.
- Does not call unsupported single-user read endpoint.
- Does not call unsupported `userId` query.
- Blocks submit when target is not returned.
- Blocks self-access edit.
- Changes role.
- Changes status to inactive.
- Changes status to active.
- Requires station ID for station operator.
- Clears station ID for admin roles.
- Opens review step.
- Opens confirmation dialog.
- Sends `POST /v1/admin/users/:id/access`.
- Sends `Idempotency-Key`.
- Sends route user ID in path, not body.
- Shows saved backend response.
- Handles `FORBIDDEN`.
- Handles `NOT_FOUND`.
- Handles server validation error.
- Preserves selections on transient error.

Accessibility tests:

- Page has one `h1`.
- Role fieldset has legend.
- Status fieldset has legend.
- Station field has visible label when shown.
- Error summary links to fields.
- Review receives focus.
- Dialog traps focus.
- Dialog is labelled by heading.
- Saved state is announced.
- Mobile review repeats labels.

Visual regression states:

- Active station operator.
- Inactive station operator.
- Driver with no station scope.
- Admin role access.
- Role change to admin.
- Status change to inactive.
- Reactivation.
- Station scope change.
- Self-access blocked.
- Target not returned.
- Review step.
- Confirmation dialog.
- Saved result.
- Unauthorized.
- Server validation error.
- Mobile stacked layout.

## Implementation Checklist

- Create route `/admin/users/:userId/access`.
- Use protected admin shell.
- Gate route with `manage_users_and_roles`.
- Read route `userId`.
- Fetch `admin_users?limit=100`.
- Resolve target from loaded list or trusted cache.
- Build target-not-returned state.
- Detect self-access.
- Build current access panel.
- Build role/status/station form.
- Build proposed access panel.
- Build review step.
- Build final confirmation dialog.
- Submit `admin_update_user_access` with idempotency key.
- Invalidate `AdminUserList`.
- Invalidate target `User` cache if present.
- Invalidate station user summaries if station scope changed.
- Build saved result panel.
- Add analytics sanitizer.
- Add tests listed above.

## Do Not Build

Do not build:

- Single-user read endpoint call.
- Unsupported `userId` query parameter.
- User creation.
- Full name edit.
- Email edit.
- Phone edit.
- Password reset.
- Credential reset.
- User deletion.
- Bulk access editor.
- Inline access toggle on list or detail.
- Access change without review.
- Access change without idempotency key.
- Submit from unresolved route-only target.
- Analytics containing user ID, full name, email, phone, station ID, or idempotency key.

## Acceptance Criteria

The screen is complete when:

- `/admin/users/:userId/access` renders with test id `screen-admin-user-access`.
- It requires `manage_users_and_roles`.
- It resolves target context from `admin_users` or trusted user cache.
- It never calls unsupported single-user read or `userId` query.
- It blocks submit when the target is not returned and no trusted target context exists.
- It blocks self-access changes before submit.
- It shows current role, status, station scope, and lifecycle timestamps.
- It lets super admins change role, status, and valid station scope.
- It enforces role/station validation before review.
- It shows proposed access before review.
- It requires review and confirmation before submit.
- It submits `admin_update_user_access` with `Idempotency-Key`.
- It sends target user ID only in the route path.
- It renders backend response as saved truth.
- It protects personal data from analytics.
- It handles loading, unauthorized, session expired, target not returned, self blocked, validation, submitting, saved, forbidden, not found, and API error states.
- It passes accessibility, responsive, and visual regression checks.

## Claude Code Build Brief

Build `AdminUserAccess` as a secure super-admin access-management screen for `/admin/users/:userId/access`. Resolve the target from `admin_users` or trusted cache without inventing a single-user read endpoint, block unresolved and self-access changes, enforce role/status/station rules, require review plus confirmation, submit `admin_update_user_access` with an idempotency key, render backend response as final truth, and keep user identity and station identifiers out of analytics.

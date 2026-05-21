# Suspend Reactivate User Modal Spec

## Metadata
| Field | Value |
| --- | --- |
| Component name | `SuspendReactivateUserModal` |
| Component type | Shared operational modal |
| Primary surface | Admin web console |
| Primary host screen | `AdminUserAccess` |
| Secondary host screens | `AdminUsers`, `AdminUserDetail`, `AdminStaffActivityLog`, `AdminAuditEvents` only as launch points into access management |
| Test id root | `modal-suspend-reactivate-user` |
| Backend coverage | `admin_users`, `admin_update_user_access` |
| Read operation | `admin_users` |
| Mutation operation | `admin_update_user_access` |
| Read endpoint | `GET /v1/admin/users` |
| Mutation endpoint | `POST /v1/admin/users/:id/access` |
| Required capability | `manage_users_and_roles` |
| Allowed role | `super_admin` |
| Offline critical | No |
| Data sensitivity | User identity, role, activation state, station scope, contact metadata |
| Required modal states | `closed`, `opening`, `review_suspend`, `review_reactivate`, `client_invalid`, `self_access_blocked`, `target_stale`, `submitting`, `saved`, `server_validation_error`, `target_not_found`, `not_authorized`, `session_expired`, `api_error` |
| Related specs | `AdminUsers`, `AdminUserDetail`, `AdminUserAccess`, `ConfirmDestructiveActionModal`, `AdminAuditEvents`, `AdminStaffActivityLog` |

## Purpose
`SuspendReactivateUserModal` is the final access-control checkpoint for changing one user record between `active` and `inactive`. It exists because activation state controls whether a person should continue to operate inside Kra, and because accidental deactivation can disrupt station operations, driver runs, final-mile work, finance workflows, and support coverage.

The modal must answer:
- `Which user is being changed?`
- `What is the user's current role?`
- `What station scope, if any, is attached to this role?`
- `Is this a suspension or reactivation?`
- `Is the target the signed-in super admin?`
- `What exactly will be sent to the backend?`
- `What does the current backend actually change?`
- `What does the current backend not change?`
- `Did the backend save the new access state?`

The modal is not a role editor. It is not a station reassignment editor. It is not a credential revocation tool. It is a status-change confirmation layer over the implemented `admin_update_user_access` endpoint.

## Product Job
Super admins need to suspend or reactivate users without accidentally changing role, station assignment, or identity details. The modal should create a clear final pause before changing access state and should be honest about what the backend can enforce today.

The modal should:
- Make target identity unmistakable.
- Compare current and proposed state.
- Preserve current role and station scope in the payload.
- Block self-access changes before the backend does.
- Require typed confirmation.
- Explain that current backend user status is not the same as provider session revocation.
- Show the saved backend response as final truth.

## Strategic Role
Kra is an operational network handling physical goods. Account access mistakes can create package loss, custody confusion, refund disputes, and station coverage gaps. This modal protects the network by making access-state changes deliberate, auditable, and tightly scoped to the implemented backend.

The highest standard here is not visual drama. It is operational clarity.

## Primary Users
Primary user:
- `super_admin` suspending or reactivating a user.

Secondary users:
- Security reviewer validating access-control behavior.
- QA validating self-access and role/station guardrails.
- Operations lead reviewing staffing impact.
- Engineering lead validating backend boundary honesty.
- Claude Code implementing the frontend later.

Non-users:
- `ops_admin`
- `finance_admin`
- `support_admin`
- `station_operator`
- `driver`
- `final_mile_courier`
- `sender`
- `receiver`
- Public visitor.

Only `super_admin` currently has `manage_users_and_roles`.

## User Goals
The authorized super admin uses the modal to:
- Confirm target user identity.
- Confirm the current role and station scope.
- Suspend an active user by saving `status: "inactive"`.
- Reactivate an inactive user by saving `status: "active"`.
- Preserve the target role.
- Preserve valid station scope for station operators.
- Remove no station scope unless the existing role forbids station scope.
- Avoid modifying their own account.
- Submit the access update once.
- See `activatedAt` or `deactivatedAt` changes from the backend response.
- Return to the user access or user detail screen with fresh data.

The super admin should never confuse status-only action with role reassignment.

## Non-Goals
Do not build these into the modal:
- Role selection.
- Station selection.
- Full name edit.
- Email edit.
- Phone edit.
- User creation.
- User deletion.
- Password reset.
- Multi-factor reset.
- Credential revocation.
- Firebase custom-claims update.
- Provider-level account blocking.
- Session revocation.
- Reason capture sent to backend.
- Bulk suspension.
- Bulk reactivation.
- Access review campaign management.
- Payroll or payout changes.
- Delivery reassignment.
- Driver run reassignment.
- Station shift scheduling.
- Full audit event browser.

If product needs provider-level lockout or reason storage, backend contracts must be expanded before the frontend claims those features.

## Hard Backend Reality
Implemented mutation:
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
```ts
{
  role: Role;
  status: "active" | "inactive";
  stationId?: StationId;
}
```

Successful response:
```ts
{
  userId: string;
  fullName: string;
  role: Role;
  status: "active" | "inactive";
  stationId?: StationId;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
}
```

Backend rules:
- `:id` is the target user ID.
- Body requires `role`.
- Body requires `status`.
- Body accepts `stationId` only when role requires it.
- `station_operator` requires `stationId`.
- `sender`, `ops_admin`, `finance_admin`, `support_admin`, and `super_admin` forbid `stationId`.
- Backend fetches the existing target by ID.
- Missing user returns `NOT_FOUND`.
- Super admins cannot modify their own role or activation state through this endpoint.
- Setting `status` to `inactive` sets `deactivatedAt` to backend time.
- Setting `status` to `active` sets `activatedAt` if not already set and removes `deactivatedAt`.
- Mutating request is idempotent when sent with `Idempotency-Key`.

Important security truth:
- The current endpoint updates Kra's user record.
- The current endpoint does not accept a reason note.
- The current endpoint does not revoke Firebase refresh tokens.
- The current endpoint does not update identity-provider custom claims.
- The current auth verifier builds the request principal from verified token claims.
- The current auth middleware does not look up the saved user record status before each request.

Therefore:
- Do not claim suspension instantly terminates existing sessions.
- Do not claim reactivation updates provider claims.
- Do not claim a reason is stored with this mutation.
- Do not claim the target is blocked at the identity provider.
- Do show the saved Kra user record status.
- Do document provider revocation as a backend gap, not a frontend feature.

Required modal copy:
```text
This changes the user's Kra access record. It does not revoke provider sessions or update authentication claims in the current backend.
```

## External Research Inputs
Only directly relevant references should inform this modal:
- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final): supports rigorous account management, access control, and audit expectations.
- [Microsoft Entra least privilege](https://learn.microsoft.com/en-us/entra/id-governance/scenarios/least-privileged): supports minimum necessary access and careful privileged role handling.
- [Microsoft Entra access reviews](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview): supports review-oriented access governance and removal of access no longer needed.
- [Firebase Admin revoke refresh tokens](https://firebase.google.com/docs/auth/admin/manage-sessions): shows that provider session revocation is a distinct backend action, not implied by editing a local user record.
- [Okta User Lifecycle API](https://developer.okta.com/docs/api/openapi/okta-management/management/tag/UserLifecycle/): shows provider lifecycle suspend/activate actions are explicit identity-provider operations.
- [Auth0 Management API user update](https://auth0.com/docs/api/management/v2/users/patch-users-by-id): shows provider-level user blocking is an explicit identity-provider user property update.
- [GOV.UK check answers pattern](https://design-system.service.gov.uk/patterns/check-answers/): supports review-before-submit for important changes.
- [USWDS modal component](https://designsystem.digital.gov/components/modal/): supports modal use only when the action requires focused attention.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): defines focus containment and accessible dialog behavior.
- [WCAG Error Prevention For Legal, Financial, Data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports confirmation and correction before high-impact data changes.
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible submit and saved feedback.

How the research changes the modal:
- Access change must be review-first.
- Privileged action needs explicit confirmation.
- Provider session lockout must not be implied.
- User lifecycle copy must separate Kra record status from identity-provider state.
- Dialog behavior must preserve keyboard and screen-reader control.

## Local Source References
Use these local files as implementation authority:
- `packages/shared/src/contracts/api.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/users.ts`
- `services/api/src/auth.ts`
- `services/api/src/app.ts`
- `services/api/src/routes.ts`
- `services/api/src/__tests__/users.test.ts`
- `services/api/src/__tests__/app.test.ts`
- `docs/02-users/user-roles.md`
- `docs/07-api/api-contracts.md`
- `docs/08-security/authorization-rules.md`
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/17-admin-users.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/18-admin-user-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/19-admin-user-access.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/01-confirm-destructive-action-modal.md`

## Information Architecture
The modal has six layers:
1. Action header.
2. Target identity and current access.
3. Proposed access state.
4. Backend reality and impact explanation.
5. Payload review.
6. Confirmation and saved result.

The modal should not bury the backend limitation. The admin must see it before submitting.

## Action Types
Two action variants exist:
```ts
type AccessStatusAction = "suspend" | "reactivate";
```

Suspend:
- Current status must be `active`.
- Proposed status is `inactive`.
- Confirmation phrase is `SUSPEND USER`.
- Visual severity is high.

Reactivate:
- Current status must be `inactive`.
- Proposed status is `active`.
- Confirmation phrase is `REACTIVATE USER`.
- Visual severity is moderate.

If current status already matches proposed status, block submit and ask host to refresh.

## Target Identity Summary
Show these fields:
- Full name.
- User ID.
- Role.
- Current status.
- Station ID if present.
- Email if available and allowed.
- Phone if available and allowed.
- Created time.
- Updated time.
- Activated time if present.
- Deactivated time if present.

Privacy display:
- User ID is always visible.
- Full name is visible to `super_admin`.
- Email can be visible if already shown on the host screen.
- Phone should be masked by default unless the admin opens detail.

Phone display:
```text
+233 *** *** 001
```

Do not show:
- Password data.
- Token data.
- Provider UID unless backend adds it.
- Delivery history.
- Payroll data.
- Proof assets.

## Current Access Panel
Panel title:
```text
Current access
```

Rows:
- `Role`
- `Status`
- `Station scope`
- `Last updated`
- `Activation timestamp`
- `Deactivation timestamp`

Status labels:
- `active`: `Active`
- `inactive`: `Inactive`

Role labels:
- `sender`: `Sender`
- `driver`: `Driver`
- `station_operator`: `Station operator`
- `final_mile_courier`: `Final-mile courier`
- `ops_admin`: `Operations admin`
- `finance_admin`: `Finance admin`
- `support_admin`: `Support admin`
- `super_admin`: `Super admin`

Station scope:
- Show station ID for station operators.
- Show `No station scope` for roles that forbid station scope.
- Show an integrity error if role and station state conflict.

## Proposed Access Panel
Panel title variants:
- Suspend: `After suspension`
- Reactivate: `After reactivation`

Rows:
- Role unchanged.
- Status changes to target status.
- Station scope unchanged.
- Backend timestamp that will change.

Suspend copy:
```text
The user record will become inactive. The backend will set deactivatedAt to the save time.
```

Reactivate copy:
```text
The user record will become active. The backend will remove deactivatedAt and keep or set activatedAt.
```

Do not say role changes. Do not say station assignment changes.

## Payload Builder
The modal must preserve the current role and station scope.

Suspend payload for station operator:
```json
{
  "role": "station_operator",
  "status": "inactive",
  "stationId": "ST-ACC-01"
}
```

Suspend payload for admin role:
```json
{
  "role": "support_admin",
  "status": "inactive"
}
```

Reactivate payload for driver:
```json
{
  "role": "driver",
  "status": "active"
}
```

Builder rule:
```ts
const request = {
  role: currentUser.role,
  status: action === "suspend" ? "inactive" : "active",
  ...(currentUser.role === "station_operator" ? { stationId: currentUser.stationId } : {})
};
```

Do not send:
- `userId` in body.
- `fullName`.
- `email`.
- `phone`.
- confirmation phrase.
- reason text.
- audit note.
- provider action flags.

The route parameter carries the target ID:
```http
POST /v1/admin/users/USR-DRV-001/access
```

## Validation Rules
Client validation must block submit when:
- Target user is missing.
- Target user ID is invalid.
- Target is the signed-in user.
- Current role is missing.
- Current status is missing.
- Current status already equals proposed status.
- Current role is `station_operator` and station ID is missing.
- Current role forbids station ID but station ID exists.
- Current user lacks `manage_users_and_roles`.
- Confirmation phrase is absent or incorrect.
- Backend reality acknowledgement is unchecked.
- High-impact acknowledgement is unchecked.
- Submit is already in progress.

Station role validation must match shared contract:
- `station_operator` requires `stationId`.
- `sender` forbids `stationId`.
- `ops_admin` forbids `stationId`.
- `finance_admin` forbids `stationId`.
- `support_admin` forbids `stationId`.
- `super_admin` forbids `stationId`.

If the current user record violates role/station rules, do not submit. Route to the full `AdminUserAccess` screen for correction.

## Confirmation Model
Typed phrases:
```text
SUSPEND USER
REACTIVATE USER
```

Suspend requires:
- typed phrase `SUSPEND USER`
- checkbox `I understand this changes the Kra user record to inactive.`
- checkbox `I understand this does not revoke provider sessions in the current backend.`

Reactivate requires:
- typed phrase `REACTIVATE USER`
- checkbox `I understand this changes the Kra user record to active.`
- checkbox `I understand this does not update provider claims in the current backend.`

The primary button remains disabled until all required checks pass.

Button labels:
- Suspend review: `Suspend user`
- Suspend submitting: `Suspending user`
- Reactivate review: `Reactivate user`
- Reactivate submitting: `Reactivating user`
- Saved: `View user access`
- Secondary: `Return to access screen`

Do not use one-click toggles.

## Backend Reality Panel
This panel is mandatory.

Title:
```text
What this changes
```

Suspend body:
```text
This saves the user's Kra record as inactive and records a deactivation timestamp. The current backend does not revoke provider sessions or update authentication claims.
```

Reactivate body:
```text
This saves the user's Kra record as active and clears the deactivation timestamp. The current backend does not update identity-provider claims.
```

Secondary copy:
```text
If provider-level lockout or session revocation is required, backend support must be added before the UI can claim that behavior.
```

Do not make this copy dismissible.

## Self-Access Guard
If target user ID equals signed-in user ID, the modal enters `self_access_blocked`.

Copy:
```text
You cannot suspend, reactivate, or modify your own access from this flow.
```

Body:
```text
The backend also rejects self-access changes. Ask another super admin to review your access if needed.
```

Actions:
- `Return to user access`
- `View user detail`

Do not show confirmation fields.

## Target Freshness
The modal should receive target user context from `AdminUserAccess`. On open, it should refetch user list when possible:
```http
GET /v1/admin/users?limit=100
```

Freshness comparison:
- `userId`
- `role`
- `status`
- `stationId`
- `updatedAt`

If the target was changed after host state loaded:
- block submit.
- show `target_stale`.
- offer reload.

Copy:
```text
This user's access changed while you were reviewing. Reload the latest record before submitting.
```

Do not merge old and latest access states automatically.

## No Single-User Read Endpoint
There is no implemented endpoint:
```http
GET /v1/admin/users/:id
```

The modal must not call it.

If the target is not returned by `GET /v1/admin/users`, show:
```text
This user was not returned by the current admin user list. Reload the list or return to user access before changing status.
```

Do not claim the user does not exist globally.

## Request Submit
Endpoint:
```http
POST /v1/admin/users/:id/access
```

Headers:
```http
Content-Type: application/json
Idempotency-Key: <stable-key-for-this-status-change>
```

Idempotency rules:
- Generate key when final payload becomes valid.
- Reuse key while retrying same payload.
- Generate new key if target user, action, role, status, or station ID changes.

Expected success:
- HTTP `200`.
- Response parses as `adminUserResponseSchema`.
- Response `userId` equals target user ID.
- Response `status` equals target status.
- Response `role` equals preserved role.
- Response station scope matches role rules.

After success:
- Show saved state.
- Invalidate `admin_users`.
- Invalidate user detail/access caches.
- Invalidate staff activity or audit query only if those screens display current user status.
- Do not auto-close before saved state is visible.

## Saved State
Suspend saved title:
```text
User suspended
```

Suspend saved body:
```text
The backend saved this user record as inactive. Review provider session controls separately if immediate session revocation is required.
```

Reactivate saved title:
```text
User reactivated
```

Reactivate saved body:
```text
The backend saved this user record as active. Confirm provider claims separately if this user needs a new authentication role.
```

Show saved fields:
- User ID.
- Full name.
- Role.
- Status.
- Station ID if any.
- Updated time.
- Activated time if any.
- Deactivated time if any.

Primary action:
```text
View user access
```

Secondary action:
```text
View user detail
```

Do not show celebratory language.

## Error States
### `client_invalid`
Use when local checks fail.

Copy:
```text
This access change cannot be submitted yet.
```

Show each blocking issue:
- target missing
- self-access blocked
- invalid role/station pairing
- confirmation phrase missing
- acknowledgement missing

### `server_validation_error`
Use when backend rejects role/station payload.

Copy:
```text
The backend rejected this access update. Review the role and station scope before trying again.
```

### `target_not_found`
Use when backend returns `NOT_FOUND`.

Copy:
```text
The backend could not find this user record.
```

Body:
```text
Refresh the user list before trying again. The record may have changed or may not be available through the current backend list.
```

### `not_authorized`
Use for `403` or missing capability.

Copy:
```text
Your account cannot change user access.
```

### `session_expired`
Use for expired or missing auth.

Copy:
```text
Your session expired before the user access update was saved.
```

Action:
```text
Sign in again
```

### `api_error`
Use for network, timeout, `429`, or unexpected server errors.

Copy:
```text
The access update was not saved. Keep this modal open and retry after checking the connection.
```

If request may have reached server:
```text
Refresh the user record before retrying if you are unsure whether the request completed.
```

## API Error Mapping
Map:
- `400`: `server_validation_error`
- `401`: `session_expired`
- `403`: `not_authorized`, or `self_access_blocked` when error metadata indicates target equals actor
- `404`: `target_not_found`
- `409`: `target_stale` if backend later adds conflict detection
- `422`: `server_validation_error`
- `429`: `api_error`
- `500`: `api_error`
- network timeout: `api_error`

Never expose raw stack traces.

## Modal Layout
Desktop:
- Width max `760px`.
- Body max height `82vh`.
- Header fixed.
- Footer fixed.
- Body scrolls.
- Before/after panels sit side by side.
- Backend reality panel spans full width.

Tablet:
- Width `min(92vw, 760px)`.
- Before/after panels may stack.

Mobile:
- Full-screen sheet.
- Before/after panels stack.
- Confirmation input and checkboxes remain above action buttons.
- Footer actions stack vertically.
- No horizontal scrolling.

The modal should survive large text settings and long names.

## Header Content
Suspend title:
```text
Suspend user access
```

Reactivate title:
```text
Reactivate user access
```

Suspend subtitle:
```text
Review the target user before saving this Kra record as inactive.
```

Reactivate subtitle:
```text
Review the target user before saving this Kra record as active.
```

Header badges:
- `Super admin`
- `Access control`
- `Kra record status`

For self-access blocked:
```text
Self-access change blocked
```

## Body Section Order
Required order:
1. Target identity.
2. Current access.
3. After change.
4. Backend reality.
5. Payload preview.
6. Confirmation.

For saved state:
1. Saved result.
2. Backend response.
3. Next actions.

## Payload Preview
Show compact payload preview:
```json
{
  "role": "station_operator",
  "status": "inactive",
  "stationId": "ST-ACC-01"
}
```

Rules:
- Show route path above payload.
- Include only body fields.
- Make clear `userId` is route parameter, not body.
- Do not include hidden fields.
- Do not include confirmation phrase.

Route display:
```text
POST /v1/admin/users/USR-OPS-001/access
```

## Visual Design Direction
The modal should feel like a secure access-control checkpoint:
- Quiet white or light-gray surface.
- Dark text.
- Red accent for suspension.
- Green or blue accent for reactivation.
- Amber accent for backend limitation.
- Monospace for IDs.
- Clear before/after comparison.
- Minimal icon use with text labels.

Avoid:
- Avatars.
- People illustrations.
- Toggle switches.
- Dramatic lock graphics.
- Celebratory reactivation visuals.
- Hidden one-line consequences.
- Any design that makes suspension feel casual.

## Typography
Use existing admin typography.

Fallback scale:
- Title: 24px, 700.
- Section heading: 16px, 700.
- Body: 14px, 400.
- Metadata label: 12px, 600.
- Metadata value: 14px, 500.
- IDs: 13px monospace.
- Warning copy: 14px, 600.

Keep line length under 72 characters for warning paragraphs.

## Spacing
Desktop:
- Modal padding: 24px.
- Section gap: 24px.
- Panel gap: 16px.
- Row gap: 10px.
- Footer gap: 12px.

Mobile:
- Sheet padding: 16px.
- Section gap: 20px.
- Panel gap: 12px.
- Button gap: 10px.

Leave enough space around typed confirmation to avoid accidental submission.

## Interaction Rules
Open behavior:
- Focus title or first warning.
- Background inert.
- Body scroll starts at top.

Close behavior:
- `Escape` closes only when not submitting.
- Backdrop click should not close after confirmation text is entered.
- Close returns focus to launch button.

Submit behavior:
- Disable primary while submitting.
- Disable close while submitting.
- Prevent double submit.
- Reuse idempotency key for unchanged retry.

Saved behavior:
- Focus saved title.
- Announce saved result.
- Keep modal open until user chooses next action.

## Accessibility Requirements
Dialog:
- Use `role="dialog"` or native dialog.
- Set accessible name from title.
- Use `aria-modal="true"` when using ARIA dialog.
- Tie description to high-impact copy.
- Trap focus.
- Restore focus.

Keyboard:
- All controls reachable.
- Confirmation field reachable.
- Checkboxes reachable.
- Buttons have visible focus.
- Error summary links focus related controls.

Screen reader:
- Before and after state read as structured groups.
- Status colors have text labels.
- Backend limitation is read in normal flow.
- Submit and saved states announced.

Touch:
- Controls at least `44px` high.
- Confirmation input easy to tap.

Reduced motion:
- Fade is allowed.
- No sliding lock animation.

## Error Summary Accessibility
When invalid, show a focusable summary:
```text
Access change cannot be submitted
```

Entries:
```text
You cannot change your own access.
Station operator access requires a station ID.
Type SUSPEND USER to confirm.
Confirm that provider sessions are not revoked by this backend action.
```

Each entry should focus the related issue.

## Security And Authorization
Frontend must:
- Check `manage_users_and_roles`.
- Check current role is `super_admin`.
- Block self-access change locally.
- Still rely on backend authorization.
- Never expose modal from non-admin routes.
- Avoid storing target access payload in browser storage.
- Avoid writing target personal data to analytics.
- Avoid showing raw phone unless host policy allows.
- Avoid claiming credential revocation.

Backend remains final authority.

## Privacy
The modal may show:
- Full name.
- User ID.
- Role.
- Status.
- Station ID.
- Masked phone.
- Email if already shown in host.
- Lifecycle timestamps.

The modal must not show:
- Passwords.
- Auth tokens.
- Provider refresh tokens.
- Provider UID unless backend adds it.
- Delivery history.
- Payment history.
- Payroll or payout data.
- Proof assets.
- Receiver details.

## Audit Expectations
Current backend access update records user fields and timestamps but the request has no note field. The modal should not ask for a reason as if it will be saved.

If the admin needs to document reason:
- Link to future audit or ticket workflow only if implemented.
- Otherwise show:
```text
Reason capture is not part of the current backend access update.
```

If audit event screens support filtering by action:
- Link to `admin_update_user_access` events after save.
- Do not show a link if unsupported.

## Analytics
Use privacy-safe events:
- `user_status_modal_opened`
- `user_status_modal_self_blocked`
- `user_status_modal_validation_failed`
- `user_status_modal_confirmation_completed`
- `user_status_modal_submitted`
- `user_status_modal_saved`
- `user_status_modal_failed`
- `user_status_modal_closed`

Allowed properties:
- `action`
- `targetRole`
- `targetStatusBefore`
- `targetStatusAfter`
- `hasStationScope`
- `isSelfTarget`
- `errorCode`

Do not send:
- full name
- email
- phone
- user ID unless analytics policy allows hashed IDs
- station name
- confirmation phrase

## Copy System
Tone:
- Direct.
- Calm.
- Security-aware.
- Honest about backend scope.

Avoid:
- `Deactivate forever`
- `Lock out immediately`
- `Kick user out`
- `All sessions revoked`
- `Fully restored`
- `No risk`
- `Quick toggle`

Preferred suspend copy:
```text
Suspend user access
```

Preferred reactivate copy:
```text
Reactivate user access
```

Provider limitation copy:
```text
Provider sessions and authentication claims are not changed by this backend action.
```

Saved copy:
```text
The backend saved the user's Kra record.
```

## Edge Cases
### Target already inactive
If action is suspend and current status is `inactive`:
```text
This user is already inactive. Reload the latest access record.
```

### Target already active
If action is reactivate and current status is `active`:
```text
This user is already active. Reload the latest access record.
```

### Target role changed
If freshness check finds role changed:
```text
This user's role changed while you were reviewing. Reload before changing status.
```

### Station scope missing for station operator
Block submit:
```text
Station operator access requires a station ID before status can be changed.
```

### Station scope exists for admin role
Block submit:
```text
This role cannot have station scope. Fix access details before changing status.
```

### Self target
Block:
```text
You cannot change your own access.
```

### Unknown provider state
Show:
```text
Provider account state is not available in this backend response.
```

## Future Backend Gaps
These are not modal features until backend contracts exist:
- Access-change reason field.
- Provider account disablement.
- Firebase refresh-token revocation on suspension.
- Firebase custom-claims update on role change.
- Single-user read endpoint.
- Access-review assignment and approval.
- Session inventory.
- Reauthentication requirement for super admin before sensitive access change.
- Bulk offboarding.

Claude Code must not implement UI controls for these gaps as active features.

## Testing Requirements
Unit tests:
- Renders suspend variant for active user.
- Renders reactivate variant for inactive user.
- Blocks self target.
- Preserves current role in payload.
- Preserves station ID for station operator.
- Omits station ID for roles that forbid it.
- Blocks station operator without station ID.
- Blocks admin role with station ID.
- Blocks when current status equals proposed status.
- Blocks without typed confirmation.
- Blocks without backend limitation acknowledgement.
- Builds route path with target user ID.
- Sends request body without `userId`.
- Sends `Idempotency-Key`.
- Reuses idempotency key for unchanged retry.
- Creates new key if action changes.
- Handles saved suspend response.
- Handles saved reactivate response.
- Handles `NOT_FOUND`.
- Handles `FORBIDDEN` self-access.
- Handles backend validation error.
- Restores focus on close.

Integration tests:
- `AdminUserAccess` opens modal with target user.
- Modal refetches users and detects stale target.
- Successful suspend invalidates `admin_users`.
- Successful reactivate invalidates `admin_users`.
- Saved state returns to user access screen.
- Non-super-admin cannot open submit flow.

Accessibility tests:
- Dialog has accessible name.
- Focus trap works.
- Error summary is focusable.
- Keyboard can complete confirmation.
- Screen reader receives saved status.
- Mobile layout preserves before/after order.

End-to-end test:
- Super admin opens user access for active driver.
- Opens suspend modal.
- Reviews target identity.
- Confirms provider limitation.
- Types `SUSPEND USER`.
- Submits.
- Sees backend response with `status: inactive` and `deactivatedAt`.
- Returns to user access.
- Opens same user and reactivates with `REACTIVATE USER`.
- Sees backend response with `status: active`.

## Acceptance Criteria
The modal is complete when:
- It supports suspend and reactivate variants.
- It opens only from authorized access-management flow.
- It displays target identity and current access state.
- It shows before/after status change.
- It preserves role and station scope in payload.
- It blocks self-access changes.
- It blocks invalid role/station combinations.
- It requires typed confirmation.
- It requires acknowledgement of backend limitations.
- It submits only `admin_update_user_access`.
- It sends only schema-supported body fields.
- It uses idempotent submit.
- It handles stale target state.
- It handles not found, unauthorized, validation, and API errors.
- It shows saved backend response.
- It does not claim provider session revocation or claims update.
- It is keyboard and screen-reader accessible.
- It works on desktop, tablet, and mobile.

## Implementation Notes For Claude Code
Build `SuspendReactivateUserModal` as the final confirmation layer inside `AdminUserAccess`. The host owns selecting the target and desired action. The modal owns review, backend limitation disclosure, confirmation, submit, and saved display.

The most important implementation rule:
- Status-only action still requires sending the current role and valid station scope because the backend access endpoint requires the full access tuple.

The most important product rule:
- Do not overpromise security. Current backend changes Kra user record status only.

## Build Checklist
1. Define modal props for target user, action, current principal, and callbacks.
2. Validate target user ID and current status.
3. Validate current role/station pairing.
4. Block self target locally.
5. Render target identity summary.
6. Render current access panel.
7. Render after-change panel.
8. Render backend reality panel.
9. Build payload from current role, target status, and current station scope.
10. Render payload preview with route path.
11. Add typed confirmation.
12. Add required acknowledgement checkboxes.
13. Add idempotency key generation and reuse.
14. Submit `POST /v1/admin/users/:id/access`.
15. Parse saved response.
16. Invalidate user queries.
17. Render saved state.
18. Add all error states.
19. Add accessibility and responsive behavior.
20. Add unit, integration, accessibility, and end-to-end tests.
21. Verify no unsupported provider revocation or reason-storage UI is active.

## Final Directive
`SuspendReactivateUserModal` must be the controlled access-status checkpoint for super admins. It must submit only `admin_update_user_access`, preserve the current role and valid station scope, block self-access changes, require explicit confirmation, clearly state backend limitations, and never claim provider session revocation, provider blocking, reason storage, role editing, station reassignment, or credential control that the backend does not implement.

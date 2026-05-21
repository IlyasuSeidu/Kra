# Auth Role Selection Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `AuthRoleSelection` |
| App | `apps/mobile` primary, public web handoff links where needed |
| Route | `/(auth)/role-selection` |
| Primary test ID | `screen-auth-role-selection` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 mobile entry and shared auth recovery |
| Backend dependency | None for role selection itself; downstream auth uses Firebase authentication, bearer token verification, `AuthPrincipal`, `kra_role`, `kra_station_id`, shared auth policy, and capability checks |
| Related routes | `/(auth)/sender/sign-in`, `/(auth)/driver/sign-in`, `/(auth)/station/sign-in`, `/(auth)/courier/sign-in`, `/(auth)/phone-login`, `/(auth)/staff/activate`, `/admin/sign-in`, `/track`, `/support`, `/privacy`, `/terms` |
| Required states | `ready`, `restoring_last_role`, `redirecting`, `deep_link_recovery`, `offline`, `unsupported_role`, `route_unavailable`, `session_expired_return`, `account_locked_return`, `api_error` |

## Product Job
`AuthRoleSelection` is the role-aware front door for Kra mobile authentication. It helps a person choose the correct entry route before authentication while making it clear that the selected role is not an access grant.

The screen answers:
- `What kind of Kra user am I right now?`
- `Where should I sign in?`
- `Can I track a package without a full account?`
- `How do staff recover if they have not activated their account?`
- `What happens if I choose the wrong role?`
- `Why does Kra separate sender, station, driver, courier, receiver, and admin access?`

The user should be able to:
- Choose sender sign-in.
- Choose station operator sign-in.
- Choose driver sign-in.
- Choose courier sign-in.
- Open staff activation.
- Open receiver tracking.
- Open public support.
- Open admin sign-in on web when appropriate.
- Resume the last selected role when safe.
- Understand that backend role verification happens after sign-in.

This screen is not:
- A self-registration screen for staff.
- A role-claim editor.
- A permission override.
- A station selector.
- A receiver account screen.
- An admin console.
- A delivery tracking detail screen.
- A package scan screen.
- A place to reveal if an account exists.
- A place to bypass account lockout.

## Strategic Role
Kra serves very different users on the same delivery network. A sender creating a delivery, a station operator receiving custody, a driver moving packages between cities, and a courier completing doorstep handoff cannot share the same entry route because their permissions, session rules, and safety risks are different.

This screen is the traffic controller before authentication. It must reduce confusion without weakening security.

Core principle:
- Role selection routes the person to the right sign-in experience.
- Authentication proves identity.
- Backend token claims prove role and scope.
- Capability checks decide what actions are allowed.

If a person chooses the wrong role, downstream sign-in must still deny access after token verification.

## Audience
Primary users:
- senders opening the app to create or track deliveries
- station operators starting a station shift
- drivers starting inter-station runs
- final-mile couriers starting doorstep work
- receivers opening the app without a full account

Secondary users:
- staff whose session expired
- staff whose account is locked
- staff who need activation
- admins who reached the mobile app by mistake
- support agents guiding a user by phone
- QA validating all auth entry routes
- security reviewers checking role separation
- Claude Code implementing the frontend later

Non-users:
- anonymous visitors browsing marketing pages only
- automated backend jobs
- payment providers
- SMS providers

## Context Of Use
The screen may appear when:
- the mobile app opens for the first time
- a user signs out
- a session expires
- a protected mobile route rejects access
- a deep link cannot resume without a role
- a staff member opens the wrong route
- a receiver wants public tracking
- a station device is shared between operators

The user may be:
- calm and exploring Kra
- under pressure at a station counter
- inside a vehicle before pickup
- in the field with weak network
- on a low-cost Android phone
- using a shared station device
- using large text settings
- returning after account lockout
- confused between driver and courier roles

Design must favor:
- clarity
- speed
- safety
- one-handed mobile use
- no account enumeration
- graceful recovery

## Authentication Model
Local role selection:
- selects an intended route
- may save last selected role locally when safe
- may attach intended role to navigation state
- must not create or edit backend claims
- must not authorize any protected route

Backend authority:
- backend verifies Firebase bearer token
- `AuthPrincipal.role` comes from `kra_role`
- `AuthPrincipal.stationId` comes from `kra_station_id`
- `AuthPrincipal.capabilities` comes from shared permission matrix
- protected routes check authentication, role, scope, and capability

Approved auth methods:
- sender: `phone_otp`
- driver: `phone_pin`
- station operator: `phone_pin`
- final-mile courier: `phone_pin`
- admin roles: `email_password_mfa`

Session durations:
- sender: `30 days`
- driver: `12 hours`
- station operator: `12 hours`
- final-mile courier: `12 hours`
- admin roles: `8 hours`

Lockout:
- account lockout is triggered after `5` failed attempts in `15 minutes`
- this screen must not reveal whether a locked account exists before the person reaches the right provider flow

## Role Choices
Primary role cards:
- `Send a package`
- `Station operator`
- `Driver`
- `Courier`

Secondary links:
- `Track a package`
- `Activate staff account`
- `Admin console`
- `Support`

Role card behavior:
- `Send a package` routes to `/(auth)/sender/sign-in` or sender onboarding if the app shell requires first-run education.
- `Station operator` routes to `/(auth)/station/sign-in`.
- `Driver` routes to `/(auth)/driver/sign-in`.
- `Courier` routes to `/(auth)/courier/sign-in`.
- `Track a package` routes to public tracking entry or receiver secure tracking flow.
- `Activate staff account` routes to `/(auth)/staff/activate`.
- `Admin console` opens `/admin/sign-in` in web context or shows a web-only notice.
- `Support` routes to `/support` or the mobile support entry.

Role descriptions:
- Sender: `Create deliveries, pay, track, and raise support requests.`
- Station operator: `Receive, dispatch, and hand off packages at an assigned station.`
- Driver: `Move assigned packages between stations.`
- Courier: `Complete assigned doorstep deliveries with proof.`
- Receiver tracking: `Track a linked delivery without creating a full account.`
- Staff activation: `Activate an account created by an admin.`
- Admin console: `Use the web console for admin operations.`

## Source References
External references used for this screen:
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): supports treating authenticators, session handling, reauthentication, throttling, and recovery as security controls beyond UI choice.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): supports generic error behavior, account enumeration resistance, and server-side enforcement of authentication outcomes.
- [Android Credential Manager](https://developer.android.com/identity/credential-manager): supports platform-aware credential entry after the user selects the correct auth path.
- [Google SMS Retriever API](https://developers.google.com/identity/sms-retriever/overview): supports lower-friction SMS verification when phone flows use one-time codes.
- [Apple one-time code text content type](https://developer.apple.com/documentation/uikit/uitextcontenttype/onetimecode): supports platform-aware verification code input in downstream auth screens.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable activation targets for role cards and links.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible route restoration, redirection, and recovery state announcements.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/08-security/authentication-flows.md`
- `docs/08-security/authorization-rules.md`
- `docs/02-users/user-roles.md`
- `docs/02-users/permissions-matrix.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/02-sender-sign-in.md`
- `docs/05-design/frontend-screen-specs/station-operator-mobile-app/01-station-sign-in.md`
- `docs/05-design/frontend-screen-specs/driver-mobile-app/01-driver-sign-in.md`
- `docs/05-design/frontend-screen-specs/final-mile-courier-mobile-app/01-courier-sign-in.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/01-ops-role-home.md`
- `packages/shared/src/domain/auth-policy.ts`
- `packages/shared/src/domain/permissions.ts`
- `services/api/src/auth.ts`
- `apps/mobile/src/index.ts`

## Design Thesis
Design this as a role switchyard for an African delivery network: confident, human, fast, and operational. It should feel like choosing the right door into a serious logistics system, not like a casual menu.

Visual direction:
- mobile-first role cards
- strong Kra identity
- route-line visual motif
- warm but disciplined color system
- clear staff/customer separation
- thumb-friendly actions
- low text density
- resilient offline copy

Restraint rule:
- Do not overload the first screen with feature education. The job is route choice. Keep explanations short and move detail into each role-specific sign-in screen.

Signature move:
- A vertical "handoff line" connects the four role cards, showing that sender, station, driver, and courier are connected by custody, while each role still has a separate gate.

## Product Principle
Choice is not authority.

Every visual and copy decision must reinforce:
- Choose your path here.
- Prove identity on the next screen.
- Backend role claims decide access.
- Wrong-role sessions are denied safely.

## Information Architecture
Top-level layout:
1. Header.
2. Role choice area.
3. Last role recovery.
4. Receiver tracking and staff activation links.
5. Safety and privacy note.
6. Footer links.

Header:
- Product mark.
- Page title.
- Short role-routing explanation.
- Optional country or launch-context tag.

Role choice area:
- Four primary role cards.
- Cards ordered by most common mobile entry:
  - Sender
  - Station operator
  - Driver
  - Courier
- Use clear icons or route-line marks, not decorative character art.

Last role recovery:
- Show only if a safe local last-role value exists.
- Copy must say it is a shortcut, not authority.
- Example copy: `Last used on this device: Driver. You will still need to sign in.`

Receiver tracking:
- Secondary link below cards.
- Must explain that receivers do not need a full account in v1.

Staff activation:
- Secondary link for provisioned staff.
- Must explain that staff accounts are created by admin.

Admin console:
- Low-priority link.
- Must explain admin is web-first.

Footer:
- Support.
- Privacy.
- Terms.

## Navigation Map
```text
/(auth)/role-selection
  -> /(auth)/sender/sign-in
  -> /(auth)/station/sign-in
  -> /(auth)/driver/sign-in
  -> /(auth)/courier/sign-in
  -> /(auth)/staff/activate
  -> /(auth)/phone-login
  -> /track
  -> /support
  -> /privacy
  -> /terms
  -> /admin/sign-in
```

Deep link routing:
- If a protected route redirects here, include intended destination in safe navigation state.
- Do not display sensitive deep-link target content.
- After successful sign-in and role check, route guard may continue to intended destination if role matches.
- If role does not match, route to permission denied.

Query parameters:
- `next` may be accepted only if it is an internal allowlisted route.
- `reason=session_expired`
- `reason=account_locked`
- `reason=permission_denied`
- `role=sender`
- `role=station_operator`
- `role=driver`
- `role=final_mile_courier`

Invalid query handling:
- Ignore unknown role query values.
- Ignore unsafe `next` values.
- Do not show raw query strings.

## State Model
```ts
type AuthRoleSelectionState =
  | { type: "ready"; lastRole?: AuthEntryRole; reason?: AuthReturnReason }
  | { type: "restoring_last_role"; lastRole: AuthEntryRole }
  | { type: "redirecting"; selectedRole: AuthEntryRole; targetRoute: string }
  | { type: "deep_link_recovery"; reason: AuthReturnReason; safeNext?: string }
  | { type: "offline"; lastRole?: AuthEntryRole }
  | { type: "unsupported_role"; requestedRole: string }
  | { type: "route_unavailable"; selectedRole: AuthEntryRole }
  | { type: "session_expired_return"; lastRole?: AuthEntryRole }
  | { type: "account_locked_return"; lastRole?: AuthEntryRole }
  | { type: "api_error"; message: string };

type AuthEntryRole =
  | "sender"
  | "station_operator"
  | "driver"
  | "final_mile_courier";

type AuthReturnReason =
  | "session_expired"
  | "account_locked"
  | "permission_denied"
  | "signed_out"
  | "deep_link_guard";
```

## Ready State
Trigger:
- app opens to role selection
- user signs out
- no protected route recovery is active

UI:
- Title and subtitle visible.
- Four primary role cards visible.
- Secondary links visible.
- Last role recovery visible only when available.

Copy:
- Title: `How are you using Kra?`
- Subtitle: `Choose the right entry path. Your account role is verified after sign-in.`

Primary cards:
- `Send a package`
- `Station operator`
- `Driver`
- `Courier`

Secondary area:
- `Track a package`
- `Activate staff account`
- `Admin console`

## Restoring Last Role State
Trigger:
- safe last role is found
- user taps last role shortcut

UI:
- Show pending state on the shortcut card.
- Keep all other cards available until navigation begins.
- Do not automatically route without user action unless app launch policy explicitly allows it.

Copy:
- `Opening your last role path...`

## Redirecting State
Trigger:
- user chooses a role
- route target resolves

UI:
- Pressed card shows progress.
- Disable repeated activation.
- Keep page stable.

Copy:
- Sender: `Opening sender sign in...`
- Station: `Opening station sign in...`
- Driver: `Opening driver sign in...`
- Courier: `Opening courier sign in...`

Accessibility:
- Use polite status message.
- Do not move focus before route change.

## Deep Link Recovery State
Trigger:
- protected route guard sends user here
- route requires auth role selection before continuing

UI:
- Show a small recovery banner above role cards.
- Do not show protected delivery or package details.
- If a safe role hint exists, highlight that role without disabling others.

Copy:
- Title: `Sign in to continue`
- Body: `Choose your role first. We will check your account before opening the requested page.`

If permission denied:
- Title: `Choose the right role`
- Body: `The previous route did not match your current access. Pick the role you are using now.`

## Offline State
Trigger:
- network unavailable at route entry
- app cannot reach auth provider but local route selection can still render

UI:
- Render role cards.
- Disable routes that require immediate network only after user taps and provider cannot open.
- Show offline banner.
- Keep support and privacy links if locally available.

Copy:
- Title: `You are offline`
- Body: `You can choose a role, but sign-in needs a connection.`

Recovery:
- Retry connection.
- Continue when network returns.
- Open cached help if available.

## Unsupported Role State
Trigger:
- query role is invalid
- persisted last role is invalid
- build receives a role not in approved v1 list

UI:
- Ignore invalid role for navigation.
- Show non-blocking notice only if user-visible context requires it.
- Render normal role cards.

Copy:
- Title: `Role path unavailable`
- Body: `Choose one of the available Kra roles to continue.`

Security:
- Do not print raw invalid role if it came from query string.

## Route Unavailable State
Trigger:
- selected role route is not registered
- app build has not wired one role-specific auth route

UI:
- Keep selected role card visible.
- Show inline route error.
- Offer role selection reset and support.

Copy:
- Title: `This sign-in path is not connected`
- Body: `Try another role or contact support if this should be available on this device.`

## Session Expired Return State
Trigger:
- user is sent here from session-expired recovery

UI:
- Show session banner.
- Highlight last known role when safe.
- Do not reveal protected destination.

Copy:
- Title: `Session expired`
- Body: `Choose your role and sign in again.`

## Account Locked Return State
Trigger:
- downstream auth route sends user back because account is locked

UI:
- Show lockout banner.
- Offer support or supervisor guidance.
- Do not reveal account existence or role claim details.

Copy:
- Title: `Account access is paused`
- Body: `Use the correct role path and follow the recovery guidance on the sign-in screen.`

## API Error State
Trigger:
- local route registry fails
- app shell auth state fails in a way that blocks route preparation

UI:
- Full error state only if role cards cannot be built.
- Otherwise render role cards with a warning.

Copy:
- Title: `Role selection could not fully load`
- Body: `Refresh the app or choose a visible role path.`
- Action: `Refresh`

## Role Card Specifications
### Sender Card
Label:
- `Send a package`

Description:
- `Create deliveries, pay, track, and get support.`

Route:
- `/(auth)/sender/sign-in`

Visual cue:
- package route start mark

Primary use:
- customer account entry

Security note:
- backend still verifies sender account after sign-in

### Station Operator Card
Label:
- `Station operator`

Description:
- `Receive, dispatch, and hand off packages at your assigned station.`

Route:
- `/(auth)/station/sign-in`

Visual cue:
- station counter or hub mark

Primary use:
- station-scoped staff entry

Security note:
- station access requires backend `kra_station_id`

### Driver Card
Label:
- `Driver`

Description:
- `Move assigned packages between stations.`

Route:
- `/(auth)/driver/sign-in`

Visual cue:
- road line between stations

Primary use:
- inter-station assigned run entry

Security note:
- delivery access is assignment-scoped

### Courier Card
Label:
- `Courier`

Description:
- `Complete assigned doorstep deliveries with proof.`

Route:
- `/(auth)/courier/sign-in`

Visual cue:
- doorstep handoff mark

Primary use:
- final-mile assigned work entry

Security note:
- receiver-facing data appears only after verification

## Secondary Entry Specifications
Receiver tracking:
- Label: `Track a package`
- Description: `Use a tracking code or secure link. Receivers do not need a full account in v1.`
- Route: `/track` or receiver tracking entry route
- Treatment: secondary link card

Staff activation:
- Label: `Activate staff account`
- Description: `Use this only if an admin has already created your staff account.`
- Route: `/(auth)/staff/activate`
- Treatment: secondary link card

Admin console:
- Label: `Admin console`
- Description: `Admin is web-first and uses email, password, and MFA.`
- Route: `/admin/sign-in`
- Treatment: text link or secondary card
- If mobile app cannot open admin web safely, open browser or show copy.

Support:
- Label: `Get help`
- Description: `Use support if you are unsure which route to choose.`
- Route: `/support`
- Treatment: footer link

## First Viewport
The first viewport must show:
- Kra identity
- question title
- role-routing subtitle
- at least sender and one staff role card without scrolling on common phone heights
- all four primary roles visible with partial fourth card acceptable only if scroll affordance is clear
- receiver tracking or staff activation link near the first screen end

The first viewport must not show:
- delivery records
- package images
- staff lists
- station names unless selected later by backend authority
- provider debug errors
- sensitive route query details

## Interaction Rules
Tap role card:
- validates route target
- stores intended role only if safe
- navigates to role-specific sign-in

Long press:
- no special behavior

Back:
- from role selection exits auth flow or returns to prior public screen
- from downstream sign-in returns to role selection

Last role shortcut:
- visible only after user selected a role previously
- tap routes to that role sign-in
- long-term persistence must be limited to role key only

Role hint:
- if `role` query is valid, pre-highlight matching card
- do not auto-submit
- do not hide other role cards

Deep link:
- preserve safe next route in router state
- do not store unsafe external URLs
- do not show sensitive target content

## Local Storage Rules
Allowed:
- last selected role
- timestamp of last role selection
- whether user dismissed role education note

Not allowed:
- phone number
- PIN
- token
- refresh token
- account ID
- station ID
- delivery ID
- payment ID
- receiver phone
- deep link payload
- provider response
- auth error payload

Storage key:
- `kra.auth.last_role`

Stored shape:
```ts
interface AuthLastRoleStorage {
  role: "sender" | "station_operator" | "driver" | "final_mile_courier";
  updatedAt: string;
  schemaVersion: 1;
}
```

Storage rules:
- Validate before use.
- Expire after `90 days`.
- Clear on explicit app data reset.
- Do not clear on normal sign out unless user chooses clear local app data.

## Copy System
Page title:
- `How are you using Kra?`

Subtitle:
- `Choose the right entry path. Your account role is verified after sign-in.`

Role section label:
- `Choose your role`

Sender card:
- `Send a package`
- `Create deliveries, pay, track, and get support.`

Station card:
- `Station operator`
- `Receive, dispatch, and hand off packages at your assigned station.`

Driver card:
- `Driver`
- `Move assigned packages between stations.`

Courier card:
- `Courier`
- `Complete assigned doorstep deliveries with proof.`

Receiver link:
- `Track a package`
- `Use a tracking code or secure link.`

Activation link:
- `Activate staff account`
- `For staff accounts already created by an admin.`

Admin link:
- `Admin console`
- `Use the web console for admin operations.`

Safety note:
- `Choosing a role only opens the right sign-in path. Kra checks your account role before showing protected work.`

Wrong path helper:
- `Not your role? Choose another path.`

Footer:
- `Support`
- `Privacy`
- `Terms`

## Visual System
Layout:
- full-screen mobile auth surface
- safe-area aware
- top brand area
- main role card stack
- secondary links below role cards
- footer links anchored after content, not fixed over cards

Card styling:
- large rounded cards
- clear left icon or mark
- label and description
- optional route-line connector
- selected press state
- disabled state with reason

Typography:
- large confident title
- short subtitle
- role labels at strong weight
- descriptions readable at small screen sizes
- no all-caps paragraphs

Color:
- background should feel trustworthy and field-ready
- use one primary action color for role selection affordances
- use distinct but restrained role accents only as small marks
- do not use color alone to distinguish roles

Spacing:
- generous top spacing but not enough to push cards too low
- role cards with enough separation for thumb use
- footer links grouped and small but readable

Motion:
- light page entry transition
- card press feedback
- route-line indicator may animate once on entry
- respect reduced motion
- no continuous movement

## Component Inventory
Required components:
- `AuthRoleSelectionScreen`
- `AuthRoleSelectionHeader`
- `RoleCardList`
- `AuthRoleCard`
- `LastRoleShortcut`
- `DeepLinkRecoveryBanner`
- `AuthReturnReasonBanner`
- `SecondaryAuthLinks`
- `AuthSafetyNote`
- `AuthFooterLinks`
- `AuthRoleSelectionStatus`
- `AuthRoleSelectionError`

Component responsibilities:
- `AuthRoleSelectionScreen` owns state, query parsing, safe route resolution, and layout.
- `AuthRoleSelectionHeader` renders brand, title, and subtitle.
- `RoleCardList` renders primary role cards in canonical order.
- `AuthRoleCard` renders card label, description, icon mark, press state, and route status.
- `LastRoleShortcut` renders safe shortcut from local last-role state.
- `DeepLinkRecoveryBanner` explains protected-route recovery without exposing sensitive details.
- `AuthReturnReasonBanner` handles session, lockout, permission, and sign-out return reasons.
- `SecondaryAuthLinks` renders receiver tracking, staff activation, and admin console links.
- `AuthSafetyNote` explains choice versus authority.
- `AuthFooterLinks` renders support, privacy, and terms.
- `AuthRoleSelectionStatus` announces redirect and restore states.
- `AuthRoleSelectionError` handles route or shell failure.

## Accessibility Requirements
Structure:
- one screen-level heading
- role cards inside a list
- each card is a button or link with one accessible name
- descriptions are associated with each card
- footer links are grouped in navigation

Touch targets:
- role cards use large tap targets
- secondary links meet target size minimum
- footer links have enough spacing

Screen reader:
- Each role card announces role label and purpose.
- Last role shortcut announces that sign-in is still required.
- Deep-link recovery banner is announced politely.
- Redirect status is announced politely.

Focus:
- Initial focus on screen title or first role card based on app convention.
- After returning from a role route, focus can return to the selected card.
- Error banners should be reachable after heading.
- Do not move focus on local last-role detection alone.

Reduced motion:
- Disable route-line animation.
- Keep press state immediate.
- Avoid long transitions.

Large text:
- Cards expand vertically.
- Descriptions wrap.
- Footer does not overlap content.
- No text truncation for role labels.

Color and contrast:
- Text contrast meets WCAG AA.
- Role accents cannot be the only differentiator.
- Disabled states remain readable.

## Security And Privacy
Security rules:
- Do not authorize based on selected role.
- Do not attach selected role as trusted backend input.
- Do not show account existence.
- Do not show lockout details before provider flow.
- Do not show raw auth errors.
- Do not store credentials.
- Do not store tokens.
- Do not store protected deep-link payloads.
- Do not show staff station IDs.
- Do not show assignments.

Privacy rules:
- Receiver tracking must not reveal delivery detail until tracking and verification rules pass.
- Staff roles must not reveal station or route information before sign-in.
- Last role shortcut must store only role type, never identity.
- Analytics must not record phone numbers, account IDs, tokens, or protected routes.

Allowed analytics:
- `auth_role_selection_viewed`
- `auth_role_card_pressed`
- `auth_last_role_shortcut_pressed`
- `auth_secondary_link_pressed`
- `auth_role_selection_redirect_started`
- `auth_role_selection_route_unavailable`
- `auth_role_selection_deep_link_recovery_viewed`
- `auth_role_selection_offline_viewed`

Analytics payload:
- role key
- reason key
- route group
- result status
- device class if approved
- no personal data

## Error And Recovery Mapping
| Condition | State | User copy | Recovery |
| --- | --- | --- | --- |
| invalid role query | `unsupported_role` | `Role path unavailable` | choose visible role |
| missing route | `route_unavailable` | `This sign-in path is not connected` | support or choose another role |
| network unavailable | `offline` | `You are offline` | reconnect and continue |
| session expired | `session_expired_return` | `Session expired` | choose role and sign in |
| account locked return | `account_locked_return` | `Account access is paused` | use sign-in recovery guidance |
| protected route redirect | `deep_link_recovery` | `Sign in to continue` | choose matching role |
| app shell error | `api_error` | `Role selection could not fully load` | refresh |

## Platform Notes
iOS:
- Use native safe areas.
- Use platform button feedback.
- Downstream phone code entry should support one-time code autofill.
- Avoid tiny footer links near the home indicator.

Android:
- Use back behavior that respects auth flow.
- Downstream credential entry can use Credential Manager where supported.
- Downstream SMS verification can support SMS Retriever where provider allows.
- Ensure large font scaling does not hide role cards.

Shared:
- Use secure storage only for auth tokens in downstream auth layer.
- This screen uses local storage only for last role key.
- Keep route selection usable under low bandwidth.

## Performance Requirements
Initial render:
- no backend request required
- local last-role read should not block first paint
- route registry should be statically available
- page should render fast on low-end Android devices

Bundle:
- do not import map libraries
- do not import chart libraries
- do not import delivery query clients
- do not import payment providers
- use existing mobile design primitives

Runtime:
- card press to navigation should feel instant
- no heavy animation
- no network wait before opening role-specific sign-in

## QA Acceptance Criteria
Functional:
- `screen-auth-role-selection` renders.
- Sender card routes to sender sign-in.
- Station card routes to station sign-in.
- Driver card routes to driver sign-in.
- Courier card routes to courier sign-in.
- Track package opens public tracking entry.
- Staff activation opens activation route.
- Admin console opens web admin route or web-only notice.
- Last role shortcut appears only after valid role selection.
- Invalid stored role is ignored.
- Invalid role query is ignored safely.
- Unsafe next query is ignored.
- Deep-link recovery banner does not reveal protected details.
- Offline state still renders role choices.

Security:
- Selected role never grants access.
- No credential is stored.
- No token is stored.
- No account ID is stored.
- No station ID is stored.
- No delivery ID is stored.
- No protected destination content is shown.
- Role-specific sign-in still validates backend role claim.

Accessibility:
- One H1-equivalent title exists.
- Cards have accessible names and descriptions.
- Keyboard and switch-control navigation can activate every route.
- Touch targets meet minimum size.
- Large text does not hide actions.
- Status messages are announced.
- Reduced motion is respected.

Visual:
- First viewport makes role choice obvious.
- Sender and staff roles are visually distinct without color-only meaning.
- Staff activation is visible but lower priority than primary roles.
- Receiver tracking is visible and not confused with sender sign-in.
- Admin console is clearly web-first.

## Test Plan
Unit tests:
- route map from role to path
- valid role query parsing
- invalid role query handling
- safe next route allowlist
- local last-role validation
- local last-role expiration
- analytics payload sanitizer

Component tests:
- renders all four role cards
- renders secondary links
- renders last role shortcut
- renders session return banner
- renders account locked return banner
- renders offline banner
- disables missing route with reason
- card press enters redirecting state

Route tests:
- direct visit to `/(auth)/role-selection`
- visit with `role=driver`
- visit with invalid role
- visit with safe `next`
- visit with unsafe external `next`
- back navigation from each sign-in route

Accessibility tests:
- screen reader names for all cards
- no critical accessibility violations
- focus order matches visual order
- reduced motion snapshot
- large text snapshot

Security tests:
- no credential values in storage
- no token values in storage
- no raw query payload in UI
- selected role does not bypass route guard
- wrong-role session reaches permission denied after downstream verification

## Data Test IDs
Screen:
- `screen-auth-role-selection`

Header:
- `auth-role-selection-header`
- `auth-role-selection-title`
- `auth-role-selection-subtitle`

Role cards:
- `auth-role-card-sender`
- `auth-role-card-station-operator`
- `auth-role-card-driver`
- `auth-role-card-courier`

Secondary links:
- `auth-role-track-package-link`
- `auth-role-staff-activation-link`
- `auth-role-admin-console-link`
- `auth-role-support-link`
- `auth-role-privacy-link`
- `auth-role-terms-link`

States:
- `auth-role-last-role-shortcut`
- `auth-role-deep-link-banner`
- `auth-role-return-reason-banner`
- `auth-role-offline-banner`
- `auth-role-route-unavailable`
- `auth-role-status`
- `auth-role-error`

## Implementation Notes For Claude Code
Likely target:
- `apps/mobile/src/app/(auth)/role-selection.tsx`
- or the equivalent route path used by the real mobile router

Do:
- build a real mobile route screen
- use existing mobile primitives
- keep role route mapping centralized
- validate query params
- preserve safe next route only through allowlist
- store last selected role only after user action
- keep backend authority out of role selection

Do not:
- implement staff self-registration
- implement admin role editing
- implement station selection
- implement package tracking details here
- implement authentication provider logic inside this screen
- call delivery APIs
- call payment APIs
- call admin APIs
- store credentials
- store tokens

## Definition Of Done
This screen is complete when:
- The route `/(auth)/role-selection` renders a polished mobile role entry page.
- The user can choose sender, station operator, driver, or courier.
- Receiver tracking, staff activation, admin console, support, privacy, and terms are reachable.
- Last role shortcut is safe, validated, and clearly not authority.
- Deep-link recovery works without exposing protected details.
- Offline and route-unavailable states are handled.
- All route selections still rely on downstream backend role verification.
- Accessibility, large text, reduced motion, and low-end device performance are covered.
- Tests cover route mapping, safety, storage, recovery, and visual states.

## Final Build Instruction
Build `AuthRoleSelection` as the mobile front door for Kra roles.

The implementation must make the right path obvious while preserving strict backend authority:
- role choice opens a sign-in path
- provider auth proves identity
- token claims prove role and scope
- capability checks protect actions
- wrong-role sessions never enter protected workspaces


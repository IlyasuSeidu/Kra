# Sender Profile Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderProfile` |
| App | `apps/mobile` |
| Route | `/(sender)/profile` |
| Primary test ID | `screen-sender-profile` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Trust And Retention` |
| Backend dependency | Firebase authenticated session, `AuthPrincipal`, `roleSchema`, `userIdSchema`, authenticated route scope |
| Optional cached dependencies | `list_deliveries`, `list_notifications` only if already cached by sender home/history/inbox |
| Related routes | `/(sender)/home`, `/(sender)/history`, `/(sender)/notifications`, `/(sender)/settings`, `/(sender)/support/:issueId`, `/(sender)/deliveries/:deliveryId/issues/new`, `/(auth)/sender/sign-in`, public privacy and terms routes |
| Required states | `loading_session`, `ready_verified`, `ready_limited_profile`, `token_refreshing`, `offline_cached`, `session_expired`, `not_authorized`, `profile_unavailable`, `api_error` |

## Product Job
This screen gives a sender one calm place to understand their account identity, trust posture, and safe next actions. It is the sender account hub, not a profile editor. The user should know which phone/account is active, what role the app recognizes, where to manage settings, and where to get account or delivery help.

The sender should be able to:
- Confirm they are signed in to the correct account.
- See their display name when available from session identity.
- See their phone number when available from identity provider state.
- See their sender role in customer-safe language.
- See whether the account session is active or needs reauthentication.
- Open settings.
- Open notifications.
- Open delivery history.
- Open help and support.
- Open privacy policy and terms.
- Sign out with clear confirmation.
- Recover from expired session, offline state, and identity data gaps.

This screen is not:
- A personal-data editor.
- A phone-number change flow.
- A password flow.
- A notification preferences editor.
- A payment wallet screen.
- An admin user record page.
- A staff account management page.
- A data export screen.
- A delete-account executor.
- A delivery dashboard replacement.

## Audience
Primary audience:
- Authenticated senders who need account orientation.
- Senders checking whether they are using the right phone/account before creating or tracking deliveries.
- Senders looking for support, settings, history, privacy, or sign-out actions.
- Senders who reopened the app after a long session and need trust clarity.

Secondary audience:
- Claude Code implementing the mobile route.
- QA validating route safety, empty identity data, and sign-out behavior.
- Security reviewers checking that tokens and internal IDs are not exposed carelessly.
- Product reviewers checking that profile and settings are separated.
- Support reviewers checking account-help language.

## User State
The sender is usually not here to complete a delivery job. They are orienting themselves or trying to manage account-level concerns. They may be calm, but they can also be suspicious because delivery platforms in many launch markets often suffer from mistaken identities, shared phones, and unclear support paths.

The sender may be:
- Confirming the signed-in phone before creating a delivery.
- Looking for settings or notifications.
- Looking for account help.
- Trying to sign out on a shared device.
- Checking whether their session is expired.
- Looking for privacy or terms information.
- Recovering after the app reports authentication trouble.
- Using the app while offline with cached session identity.

The screen must:
- Treat session identity as sensitive.
- Show only customer-safe account details.
- Keep edit actions out unless there is a supported route.
- Route preference management to `SenderSettings`.
- Route support work to existing support/delivery issue surfaces.
- Never expose Firebase token contents, role claims, capabilities, raw JWTs, refresh tokens, or internal auth diagnostics.
- Never imply backend profile persistence where no sender profile endpoint exists.

## Primary Action
Primary action by state:
- `ready_verified`: `Open settings`
- `ready_limited_profile`: `Open settings`
- `token_refreshing`: wait with visible progress and allow back navigation
- `offline_cached`: `Open settings` and `Go to home` remain available if cached navigation permits
- `session_expired`: `Sign in again`
- `not_authorized`: `Sign in again`
- `profile_unavailable`: `Try again`
- `api_error`: `Try again`

Secondary actions:
- `View delivery history`
- `Open notifications`
- `Get support`
- `Privacy policy`
- `Terms of service`
- `Sign out`
- `Go to home`

CTA behavior:
- `Open settings` routes to `/(sender)/settings`.
- `View delivery history` routes to `/(sender)/history`.
- `Open notifications` routes to `/(sender)/notifications`.
- `Get support` opens a support entry pattern that routes to active issue, delivery issue creation, or public support entry according to available context.
- `Privacy policy` opens the public privacy route.
- `Terms of service` opens the public terms route.
- `Sign in again` clears invalid local auth state and routes to `/(auth)/sender/sign-in`.
- `Sign out` opens a confirmation sheet before clearing session state.
- `Try again` refreshes auth/session state and any optional cached counts.

Blocked behavior:
- Do not call admin user endpoints.
- Do not call `admin_update_user_access`.
- Do not call `admin_upsert_user`.
- Do not create a sender profile mutation.
- Do not create a phone-change flow.
- Do not ask for government ID, address, date of birth, or payment details on this screen.
- Do not show raw `userId` as the visual headline.
- Do not show capability lists.
- Do not show `stationId`.
- Do not show staff roles or admin controls.
- Do not show token expiration timestamps as raw technical output.
- Do not sign out immediately from a destructive row tap.
- Do not use optional cached counts as required content.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Account identity label.
- Signed-in contact method if available.
- Session/verification state.
- Settings entry.
- History entry.
- Support entry.
- Sign-out entry separated from routine actions.

The first viewport must answer:
- `Which account is active?`
- `Is this account ready to use?`
- `Where do I manage settings?`
- `Where do I get help?`
- `How do I leave this account on this device?`

## Main Tension
The product needs a serious account surface, but the backend does not yet expose a sender profile read/update contract. The screen must still feel complete by being a high-quality account hub while staying honest about what can be changed.

The design must balance:
- Trust against data minimalism.
- Convenience against account safety on shared devices.
- Profile identity against settings management.
- Native mobile familiarity against a distinctive KRA trust language.
- Offline usefulness against stale identity risk.
- Sign-out availability against accidental account loss.
- Future extensibility against v1 contract limits.

## Design Brief
User and job:
- A sender wants to confirm account identity and move to account-level actions.

Context of use:
- Mobile, often on shared or low-trust device contexts, where account clarity prevents delivery and payment confusion.

Entry point:
- SenderHome avatar/menu.
- SenderSettings back link.
- SenderNotifications.
- SenderDeliveryHistory.
- Session warning banner.
- Support entry.

Success state:
- Sender confidently knows the active account and reaches settings, history, notifications, support, privacy, terms, or sign out.

Primary action:
- Open settings.

Navigation model:
- Account hub with identity header, trust status, action list, legal/support links, and sign-out zone.

Density:
- Low to medium. Profile must feel polished and trustworthy without becoming another dashboard.

Visual thesis:
- A secure identity card inside a quiet account console: warm, grounded, precise, and calm.

Restraint rule:
- Avoid social profile styling, avatar gimmicks, large decorative identity photos, status badge clutter, and unsupported edit affordances.

Product lens:
- Trust, identity, and account control.

System stance:
- Native mobile account screen with a distinctive KRA trust card and clean action rows.

Interaction thesis:
- Confirm identity, choose account action, handle sign-out deliberately.

Signature move:
- A "Trusted sender account" card that turns technical session state into plain confidence language.

Activation event:
- Sender opens settings, support, history, notifications, or confirms sign out.

## Elite Quality Gate
This spec is not closed unless the profile screen is account-safe, contract-accurate, and genuinely useful without a sender profile endpoint.

Non-negotiable quality requirements:
- First viewport shows active account context.
- Profile screen does not invent profile editing.
- Settings are linked, not duplicated.
- Sign-out requires confirmation.
- Session-expired state routes to sign-in.
- Offline cached state is visually distinct.
- Raw tokens, role claims, capability arrays, and internal auth diagnostics never appear.
- `sender` role is translated as `Sender account`.
- Optional stats never block first render.
- No admin endpoint appears in implementation.
- All rows have clear labels, descriptions, icons, and touch targets.
- The screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the screen includes edit profile without backend support, it remains open.
- If sign out happens from one accidental tap, it remains open.
- If raw `userId` is used as the hero title, it remains open.
- If settings and profile duplicate the same controls, it remains open.
- If account deletion is presented as instant execution, it remains open.
- If the offline state hides stale identity risk, it remains open.

## Research And Inspiration Notes
Use these references as product-quality inputs, not as visual copies:
- [Apple Human Interface Guidelines: Managing accounts](https://developer.apple.com/design/human-interface-guidelines/managing-accounts): account screens should make sign-in, account changes, and account deletion expectations clear and respectful.
- [Material Design 3 lists](https://m3.material.io/components/lists/overview): profile action rows should use clear hierarchy, predictable leading visuals, and enough supporting text for quick scanning.
- [Material Design 3 badges](https://m3.material.io/components/badges/overview): small counts or status marks must be used sparingly and only where they change action.
- [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/): labels, grouped controls, and errors need clear programmatic relationships.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): account actions need reliable touch targets on mobile.

Applied decisions:
- Keep account actions as recognizable rows, not dense cards.
- Make sign-out visually separate and confirmation-based.
- Show account state in human terms rather than raw auth terms.
- Avoid unnecessary editable fields until contracts exist.
- Keep legal/support links discoverable without crowding the first viewport.

## Data Contract And Backend Alignment
Primary source:
- Client authenticated session state.
- Firebase authenticated user object if available in the mobile auth layer.
- `AuthPrincipal` after authenticated API calls prove role scope.

Backend contract facts:
- `AuthPrincipal` includes `userId`, `role`, optional `stationId`, `capabilities`, and `authMethod`.
- Sender role is represented by `roleSchema` value `sender`.
- User IDs match `userIdSchema`.
- Backend authenticated routes verify bearer token and role claims.
- Admin user management exists, but it is admin-only and must not power sender profile editing.

No v1 sender profile API:
- No `/v1/me` route is present.
- No sender profile read schema is present.
- No sender profile update schema is present.
- No sender phone update endpoint is present.
- No sender account deletion endpoint is present.
- No notification preference endpoint is present.

Allowed data display:
- Display name from auth provider profile when available.
- Phone from auth provider profile when available.
- Email from auth provider profile only if the auth provider supplies it and the user has consented to that sign-in method.
- `Sender account` label derived from `role === "sender"`.
- High-level session state such as `Active`, `Needs sign-in`, `Offline`.
- Last successful sync time from local app state.
- Optional unread notification count from cached `list_notifications`.
- Optional delivery count summary from cached `list_deliveries`.

Disallowed data display:
- Raw token.
- Refresh token.
- Full JWT payload.
- Capability array.
- Internal `authMethod` copy.
- `stationId`.
- Admin role labels.
- Internal user repository fields.
- Admin activation/deactivation timestamps.
- Raw provider UID if it differs from app-safe user ID.
- Hidden device identifiers.

Implementation posture:
- Render profile from local auth/session selectors.
- Use optional cached sender query data only when already present.
- Do not make new blocking network calls solely for decorative counts.
- Treat absence of display name as normal.
- Treat absence of phone as a limited-profile state.
- Prefer routes and safe explanation over inactive controls.

## Route And Access Rules
Route:
- `/(sender)/profile`

Required access:
- Authenticated sender session.
- If role is not available yet, show `loading_session`.
- If role resolves to `sender`, show profile.
- If role resolves to another role, show `not_authorized` and route to the appropriate app shell only if role routing exists.
- If token verification fails, show `session_expired`.

Entry rules:
- SenderHome avatar routes here.
- SenderSettings account header routes here.
- Notification tap must not route here unless account action is needed.
- History and support can route back here through account menu.

Exit rules:
- Back returns to previous sender screen.
- Home returns to `/(sender)/home`.
- Settings routes to `/(sender)/settings`.
- Sign out clears sender shell and routes to sign-in after confirmation.

Deep link behavior:
- A direct deep link to profile requires active auth.
- Expired direct deep link routes to sign-in with return intent if safe.
- Return intent must not be used after explicit sign out.

## Information Architecture
Screen sections in order:
1. Top navigation.
2. Identity trust card.
3. Account actions.
4. Delivery activity shortcuts.
5. Help and legal.
6. Sign-out zone.
7. App/build information.

Above the fold:
- Back or close affordance.
- Screen title.
- Identity trust card.
- Settings row.
- History or notifications row depending device height.

Below the fold:
- Support row.
- Privacy policy row.
- Terms row.
- Sign-out row.
- App version and legal entity text.

Navigation hierarchy:
- Profile is an account hub.
- Settings owns editable preferences.
- History owns delivery archive.
- Notifications owns notice inbox.
- Support owns issue routing.
- Public web owns privacy and terms.

## Layout Structure
Root:
- Safe area view.
- Background surface using warm neutral base.
- Scroll view with sticky top title only if platform conventions support it.
- Content max width follows native mobile constraints.

Top bar:
- Leading back button if pushed from another screen.
- Center or left title: `Profile`.
- Optional trailing settings shortcut only if it does not duplicate the primary settings row visually.

Identity card:
- Rounded rectangle with subtle warm gradient or surface elevation.
- Initials medallion derived from display name or phone suffix.
- Title: display name or `Sender account`.
- Subtitle: masked phone or `Signed in securely`.
- Status chip: `Active`, `Offline`, `Needs sign-in`, or `Limited profile`.
- Microcopy: one sentence explaining account state.

Account action list:
- Rows with icon, label, helper text, optional badge/count, and chevron.
- Use list grouping rather than separate heavy cards for every row.
- Keep sign out outside the action group.

Footer:
- Legal links.
- App version.
- Short trust copy: `KRA keeps delivery account access separate from staff tools.`

Spacing:
- 24 px horizontal padding on standard phones.
- 20 px on compact phones.
- 16 px minimum between major sections.
- 10 to 12 px between grouped rows.
- 44 px minimum row height, preferably 56 px for primary action rows.

## Visual Direction
Mood:
- Grounded.
- Premium.
- Practical.
- Trustworthy.
- Calm.

Avoid:
- Social network profile layout.
- Giant avatar hero.
- Decorative confetti.
- Harsh warning-heavy styling for normal session state.
- Dense admin table layout.
- Overuse of pills and badges.

Color direction:
- Background: warm off-white or pale sand.
- Identity card: deep green/ink blend with soft gold accent.
- Primary text: near-black ink.
- Secondary text: neutral slate.
- Positive state: forest green.
- Warning state: amber or copper.
- Error state: controlled red.
- Link/action accent: deep green or ink blue.

Material rules:
- Identity card can have one premium surface treatment.
- Rows should be mostly flat with divider or grouped surface.
- Do not use heavy shadows on every row.
- Use icons as orientation aids, not decoration.

Typography:
- Screen title uses strong, compact heading.
- Identity title uses confident display weight.
- Row labels use medium weight.
- Helper copy stays short and literal.
- Legal/footer text is quieter but readable.

## Copy System
Voice:
- Direct.
- Calm.
- Low hype.
- Account-safe.
- Specific.

Terminology:
- Use `account`, not `profile data`, for the whole surface.
- Use `Sender account`, not raw `sender`.
- Use `phone`, not `MSISDN`.
- Use `signed in`, not `authenticated`, in visible copy.
- Use `session`, only when explaining why sign-in is needed.

Hero copy options:
- Preferred title when name exists: `{First name}'s account`
- Preferred title without name: `Sender account`
- Subtitle with phone: `Signed in with {maskedPhone}`
- Subtitle without phone: `Signed in securely`
- Active chip: `Active`
- Offline chip: `Offline`
- Limited chip: `Limited profile`
- Expired chip: `Sign-in needed`

Identity card copy:
- Active: `You can create deliveries, track shipments, and manage account settings from this device.`
- Limited profile: `Some account details are not available on this device, but delivery actions still work after sign-in is verified.`
- Offline cached: `Showing the last account saved on this device. Connect to refresh before making changes.`
- Session expired: `For your security, sign in again before using this account.`

Primary row labels:
- `Settings`
- `Delivery history`
- `Notifications`
- `Help and support`
- `Privacy policy`
- `Terms of service`
- `Sign out`

Helper copy:
- Settings: `Account controls, app preferences, and safety options.`
- Delivery history: `Review previous deliveries, receipts, refunds, and issues.`
- Notifications: `Delivery, payment, refund, and issue updates.`
- Help and support: `Find help for a delivery or account concern.`
- Privacy policy: `How KRA handles account and delivery information.`
- Terms of service: `Rules for using KRA delivery services.`
- Sign out: `Remove this account from this device.`

Error copy:
- Session expired title: `Sign in again`
- Session expired body: `Your session expired. Sign in again to protect your deliveries and account.`
- Not authorized title: `This account cannot use sender profile`
- Not authorized body: `The signed-in account is not registered as a sender.`
- Profile unavailable title: `Account details are unavailable`
- Profile unavailable body: `We could not load the current account details. Try again or sign in again.`
- Offline title: `Offline account view`
- Offline body: `You can view the last saved account, but changes and fresh status need connection.`

Sign-out confirmation:
- Title: `Sign out of this device?`
- Body: `You will need to sign in again before creating or tracking deliveries from this phone.`
- Confirm: `Sign out`
- Cancel: `Stay signed in`

## Component Inventory
Required components:
- `SenderProfileScreen`
- `ProfileTopBar`
- `AccountTrustCard`
- `AccountStatusChip`
- `MaskedContactLine`
- `ProfileActionGroup`
- `ProfileActionRow`
- `OptionalCountBadge`
- `LegalLinkGroup`
- `SignOutZone`
- `SignOutConfirmSheet`
- `ProfileStateView`
- `SessionExpiredPanel`
- `OfflineAccountBanner`

Shared component candidates:
- `AppScreen`
- `SafeScrollView`
- `IconRow`
- `StatusChip`
- `ConfirmationSheet`
- `InlineAlert`
- `SkeletonBlock`
- `RetryPanel`

Component responsibilities:
- `SenderProfileScreen` composes state, route actions, and selectors.
- `ProfileTopBar` handles back/home navigation and title.
- `AccountTrustCard` displays display name, masked contact, and account state.
- `AccountStatusChip` maps state to visible chip.
- `MaskedContactLine` formats phone/email safely.
- `ProfileActionGroup` groups related rows.
- `ProfileActionRow` provides touch target, icon, label, helper, badge, and chevron.
- `OptionalCountBadge` renders only when data exists and is actionable.
- `LegalLinkGroup` routes to privacy and terms.
- `SignOutZone` separates destructive account action from routine navigation.
- `SignOutConfirmSheet` prevents accidental sign out.
- `ProfileStateView` renders loading/error/expired/offline state shells.

## State Model
State names:
- `loading_session`
- `ready_verified`
- `ready_limited_profile`
- `token_refreshing`
- `offline_cached`
- `session_expired`
- `not_authorized`
- `profile_unavailable`
- `api_error`

State source:
- Auth provider loading state.
- Local session selector.
- Network status selector.
- Role claim or verified principal from authenticated API context.
- Optional cached sender query metadata.

State priority:
1. `session_expired`
2. `not_authorized`
3. `loading_session`
4. `token_refreshing`
5. `offline_cached`
6. `profile_unavailable`
7. `api_error`
8. `ready_limited_profile`
9. `ready_verified`

Ready verified criteria:
- Auth session exists.
- Role is sender.
- At least one safe identity field exists: display name, phone, email, or app-safe account ID.
- Token is not known expired.

Limited profile criteria:
- Auth session exists.
- Role is sender.
- Contact/name fields are absent or incomplete.
- Account can still route to settings/support/history after auth is valid.

Offline cached criteria:
- No current network.
- Last safe account identity exists locally.
- Token freshness cannot be confirmed.
- Mutating account actions are blocked or routed to sign-in when needed.

Session expired criteria:
- Auth provider reports expired/revoked token.
- Backend returns `FORBIDDEN` due auth failure.
- Local refresh fails.

Not authorized criteria:
- Role claim exists but is not `sender`.
- Auth principal cannot access sender shell.

## Loading Behavior
Initial load:
- Show top bar and identity-card skeleton.
- Skeleton should preserve final layout height.
- Do not show empty account rows with broken labels.
- Keep back navigation available.

Skeleton:
- One wide block for trust card.
- Four row skeletons.
- Footer skeleton hidden until ready.

Loading copy:
- Use `Checking account...` only if loading lasts longer than 600 ms.
- Avoid spinner-only screen.

Timeout:
- If auth session read takes too long, show `profile_unavailable`.
- Give `Try again` and `Sign in again`.

Token refreshing:
- Keep visible account identity if safe.
- Show small banner: `Refreshing account access...`
- Disable sign-out only while local sign-out operation is already running.

## Ready State
Ready screen composition:
- Top bar.
- Account trust card.
- Account actions group.
- Activity shortcuts group.
- Help/legal group.
- Sign-out zone.
- App version.

Identity card content:
- Initials medallion.
- Account title.
- Masked phone/email.
- Status chip.
- Last sync line when available.

Action group:
- Settings.
- Notifications.
- Delivery history.

Help/legal group:
- Help and support.
- Privacy policy.
- Terms of service.

Sign-out zone:
- Quiet section separator.
- Red or danger-toned row.
- No chevron if confirmation sheet opens in place; chevron allowed if pattern requires.

Optional count rules:
- Notification count appears only for unread count.
- History count appears only if cached and cheap.
- Do not display zero badges.
- Do not fetch extra data solely to display counts.
- Counts older than local stale threshold must not appear as fresh.

## Empty Or Limited Identity State
Limited profile is not an error.

Render:
- Title: `Sender account`
- Subtitle: `Signed in securely`
- Chip: `Limited profile`
- Copy: `Some account details are not available on this device. You can still manage settings and deliveries after sign-in is verified.`

Actions:
- Settings remains available.
- Help and support remains available.
- History remains available if auth is valid.
- Sign out remains available.

Do not:
- Ask the sender to fill personal data on this screen.
- Show blank labels.
- Show `Unknown user`.
- Show raw app-safe user ID as primary identity.

## Offline Cached State
Offline behavior:
- Show cached identity if available.
- Add an inline banner above action rows.
- Keep non-network local navigation available.
- Disable routes that require fresh auth only if the app cannot verify them.

Offline banner:
- Title: `Offline account view`
- Body: `Showing the last account saved on this device. Connect to refresh before changing settings.`
- Action: `Retry connection`

Allowed offline routes:
- Home if cached app shell supports it.
- History cached view if available.
- Settings read-only local settings if available.
- Legal pages if bundled or previously cached.

Blocked offline routes:
- Account-changing actions.
- Fresh support issue creation unless offline queue policy supports it.
- Sign-in refresh.

## Session Expired State
Render:
- Top bar.
- Centered security panel.
- Icon: lock.
- Title: `Sign in again`
- Body: `Your session expired. Sign in again to protect your deliveries and account.`
- Primary action: `Sign in again`
- Secondary action: `Go back`

Behavior:
- Clear expired local credentials according to auth policy.
- Do not show cached personal information after session is known expired unless product security policy explicitly allows stale display.
- Preserve safe return path only if sign-out was not explicit.

Analytics:
- `sender_profile_session_expired_viewed`
- `sender_profile_sign_in_again_pressed`

## Not Authorized State
Render:
- Title: `This account cannot use sender profile`
- Body: `The signed-in account is not registered as a sender.`
- Primary action: `Sign in again`
- Secondary action: `Go back`

Behavior:
- Do not show staff account details in sender shell.
- Do not route to admin or operations shell unless global role routing owns that transition.
- Log non-sensitive role category only if analytics policy allows.

## Error State
Profile unavailable:
- Title: `Account details are unavailable`
- Body: `We could not load the current account details. Try again or sign in again.`
- Primary: `Try again`
- Secondary: `Sign in again`

API error:
- Title: `Account check failed`
- Body: `We could not confirm your account state. Your deliveries are not changed.`
- Primary: `Try again`
- Secondary: `Go to home`

Error rendering rules:
- Never show raw backend error payloads.
- Show `FORBIDDEN` only through mapped customer copy.
- Show `RATE_LIMITED` as a wait message if auth refresh or profile read is throttled.
- Show `VALIDATION_ERROR` only if a local unsupported action is attempted.

## Sign-Out Flow
Trigger:
- Sender taps `Sign out`.

Step 1:
- Open bottom confirmation sheet.
- Dim background.
- Keep screen reader focus inside sheet.

Sheet content:
- Title: `Sign out of this device?`
- Body: `You will need to sign in again before creating or tracking deliveries from this phone.`
- Primary destructive action: `Sign out`
- Secondary action: `Stay signed in`

Step 2 confirm:
- Disable buttons.
- Show inline progress: `Signing out...`
- Clear local auth session.
- Clear sender-only sensitive caches according to auth policy.
- Preserve non-sensitive public cached content if policy allows.
- Route to `/(auth)/sender/sign-in`.

Step 2 cancel:
- Close sheet.
- Return focus to sign-out row.
- No state changes.

Failure:
- If local sign-out fails, show inline error: `Could not sign out. Try again.`
- Keep user on profile.
- Do not partially clear route state without auth state.

Security:
- Explicit sign out must clear return intent.
- Explicit sign out must not auto sign back in.
- Explicit sign out must not leave delivery details visible behind modal after completion.

## Navigation Details
Settings:
- Route: `/(sender)/settings`
- Intent: manage app/account preferences.
- Requires active sender session.

Notifications:
- Route: `/(sender)/notifications`
- Intent: review sender notices.
- Requires active sender session.

Delivery history:
- Route: `/(sender)/history`
- Intent: review previous deliveries.
- Requires active sender session.

Help and support:
- If delivery context exists from last active route, offer delivery issue creation.
- If no delivery context exists, route to support entry or history first.
- Do not create a support thread without `issueId`.

Privacy policy:
- Route to public privacy screen.
- Open inside app webview or native route according to app convention.

Terms:
- Route to public terms screen.
- Open inside app webview or native route according to app convention.

Back:
- Returns to previous route.
- If no previous route, use `/(sender)/home`.

## Privacy And Security Rules
Masking:
- Phone: show country code and last 2 to 4 digits, depending existing app format.
- Email: show first character and domain when needed.
- User ID: do not show by default.

Sensitive content:
- Do not show tokens.
- Do not show auth claims.
- Do not show capability arrays.
- Do not show provider IDs.
- Do not show device IDs.
- Do not show debug mode.

Shared-device safety:
- Sign-out is visible but separated.
- Account identity is clear enough to avoid mistaken use.
- Avoid showing full phone if product security policy prefers masking.
- Do not show receiver details or package details on profile.

Screenshot safety:
- Profile should not show delivery addresses, receiver phone numbers, payment references, or internal IDs.
- If app has privacy screen mode, profile should hide contact line when app is backgrounded.

Account deletion:
- Do not execute deletion from this screen.
- If legal requirement demands discoverability, route to settings or support with clear request flow.
- Copy must not claim deletion is immediate unless backend supports it.

## Accessibility Requirements
Screen reader:
- Main screen has heading `Profile`.
- Identity card has accessible label summarizing account state.
- Status chip text is included in the card label.
- Rows announce label, helper, optional count, and action.
- Sign-out row announces destructive nature.
- Confirmation sheet traps focus and announces title.

Touch:
- Minimum target size meets platform guidance.
- Rows should be at least 48 px high on Android and 44 pt on iOS.
- Destructive confirmation buttons should not be adjacent without spacing.

Text:
- Supports dynamic type.
- Helper text wraps to two lines before truncating.
- Legal footer remains readable at large text.
- No information is conveyed by color alone.

Contrast:
- Text meets WCAG contrast.
- Status chip text meets contrast against chip background.
- Danger sign-out copy meets contrast.

Motion:
- Sheet entrance uses platform-native motion.
- Respect reduced motion.
- No looping decorative motion.

Keyboard and switch access:
- All rows are focusable.
- Focus order follows visual order.
- Back, rows, legal links, sign out, and confirmation actions are reachable.

## Interaction Details
Tap row:
- Row gives pressed feedback.
- Navigate after press release.
- Prevent double navigation.

Pull to refresh:
- Optional.
- If implemented, refresh auth/session state and optional cached counts.
- Do not require pull to refresh for core profile identity.

Status chip tap:
- Non-interactive by default.
- If accessible description is needed, make the whole identity card expose state, not chip alone.

Initials medallion:
- Non-interactive.
- Do not open photo picker.
- Do not imply avatar upload.

Legal links:
- Open in app with visible close/back controls.
- If opening external browser, show expected behavior through platform affordance.

Support row:
- Route to safest support entry.
- If support route requires delivery context, ask sender to choose delivery from history rather than creating a blank issue.

## Performance Requirements
Render:
- First paint should not wait on optional delivery or notification counts.
- Use local auth state synchronously where possible.
- Avoid heavy image loading.
- Avoid remote avatar fetch unless already cached and privacy-approved.

Network:
- No blocking network call is required solely to render the profile shell.
- Token refresh may happen in background.
- Optional count queries must use existing cache if available.

Memory:
- Keep component tree simple.
- Avoid storing full auth token in React state.
- Avoid logging identity objects.

Offline:
- Use cached identity only when allowed by security policy.
- Clearly mark stale account state.

## Analytics
Events:
- `sender_profile_viewed`
- `sender_profile_settings_pressed`
- `sender_profile_history_pressed`
- `sender_profile_notifications_pressed`
- `sender_profile_support_pressed`
- `sender_profile_privacy_pressed`
- `sender_profile_terms_pressed`
- `sender_profile_sign_out_started`
- `sender_profile_sign_out_cancelled`
- `sender_profile_sign_out_confirmed`
- `sender_profile_session_expired_viewed`
- `sender_profile_retry_pressed`

Event properties:
- `account_state`: `active`, `limited`, `offline_cached`, `expired`, `unauthorized`
- `entrypoint`: previous route category
- `has_display_name`: boolean
- `has_phone`: boolean
- `has_cached_counts`: boolean

Do not log:
- Full phone.
- Email.
- Raw user ID unless analytics policy explicitly permits hashed IDs.
- Tokens.
- Capabilities.
- Receiver details.
- Delivery IDs from profile view.

## QA Scenarios
Core:
- Sender opens profile from home with display name and phone.
- Sender opens profile from home with phone only.
- Sender opens profile with no display name and no phone.
- Sender opens profile while token refresh is in progress.
- Sender opens profile offline with cached identity.
- Sender opens profile after session expired.
- Non-sender role tries to open sender profile.
- Sender taps every row and reaches correct route.
- Sender starts sign out then cancels.
- Sender confirms sign out and reaches sign-in.
- Sign-out failure keeps sender on profile with error.

Accessibility:
- Screen reader reads identity card as one coherent account summary.
- All rows are reachable by keyboard/switch access.
- Large text does not cut off row labels.
- Legal footer remains readable.
- Sign-out sheet traps focus.
- Reduced motion disables non-essential transitions.

Privacy:
- Full token is never rendered.
- Capability array is never rendered.
- Raw provider ID is never rendered.
- Receiver and delivery details are never rendered.
- Full phone masking follows policy.

Contract:
- No admin user endpoint is called.
- No profile update endpoint is called.
- No phone update endpoint is called.
- No delete account endpoint is called.
- Optional counts never block ready state.

## Implementation Notes For Claude Code
Recommended route file:
- `apps/mobile/src/app/(sender)/profile.tsx` or the equivalent Expo Router path used by the project.

Recommended selectors:
- `useAuthSession`
- `useSenderPrincipal`
- `useNetworkStatus`
- `useCachedNotificationSummary`
- `useCachedDeliverySummary`

Implementation sequence:
1. Create route shell and top bar.
2. Build auth/session state mapping.
3. Build `AccountTrustCard`.
4. Build action row groups.
5. Add sign-out confirmation sheet.
6. Add expired/offline/error states.
7. Add accessibility labels.
8. Add analytics events.
9. Add tests for route, states, row navigation, sign-out, and privacy.

Do not implement:
- Profile edit form.
- Avatar upload.
- Phone change.
- Account deletion execution.
- Admin user management.
- Staff role routing inside sender shell.
- Any backend route not already documented.

## Test ID Contract
Required test IDs:
- `screen-sender-profile`
- `sender-profile-top-bar`
- `sender-profile-account-card`
- `sender-profile-status-chip`
- `sender-profile-settings-row`
- `sender-profile-history-row`
- `sender-profile-notifications-row`
- `sender-profile-support-row`
- `sender-profile-privacy-row`
- `sender-profile-terms-row`
- `sender-profile-sign-out-row`
- `sender-profile-sign-out-sheet`
- `sender-profile-sign-out-confirm`
- `sender-profile-sign-out-cancel`
- `sender-profile-state-loading`
- `sender-profile-state-offline`
- `sender-profile-state-expired`
- `sender-profile-state-not-authorized`
- `sender-profile-state-error`

Optional test IDs:
- `sender-profile-unread-count`
- `sender-profile-delivery-count`
- `sender-profile-last-sync`

## Visual QA Checklist
Before closing implementation:
- Identity card is visible above the fold.
- Settings row is reachable without scrolling on standard phones.
- Sign-out is visually separated from routine actions.
- Contact detail is masked according to policy.
- Limited profile does not look broken.
- Offline cached state is visibly different from active state.
- Legal links do not crowd primary actions.
- Row icons are consistent in weight and size.
- No row label wraps awkwardly at common phone widths.
- Confirmation sheet looks native on iOS and Android.
- Large text still preserves action order.

## Copy QA Checklist
Before closing implementation:
- No raw enum values appear in primary copy.
- `sender` becomes `Sender account`.
- No unsupported editing language appears.
- Sign-out copy explains consequence.
- Offline copy explains stale data risk.
- Session expired copy is security-focused, not blameful.
- Help copy does not promise live chat.
- Privacy and terms copy is literal.
- Error copy tells the sender what to do next.

## Handoff Summary
Build `SenderProfile` as a polished account hub. It should feel like a serious product surface even without a sender profile endpoint: identity summary, account status, action rows, legal/support routes, and deliberate sign-out.

The central product rule is simple:
- Profile confirms account identity and routes account actions.
- Settings manages preferences.
- Support handles help.
- Backend admin user management stays out of sender profile.


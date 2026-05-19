# Sender Settings Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `SenderSettings` |
| App | `apps/mobile` |
| Route | `/(sender)/settings` |
| Primary test ID | `screen-sender-settings` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P1 Trust And Retention` |
| Backend dependency | Authenticated sender session, `AuthPrincipal`, `roleSchema`, `userIdSchema`, local client preference storage |
| Optional cached dependencies | `list_notifications`, `list_deliveries` only for non-blocking badges or cache controls |
| Related routes | `/(sender)/profile`, `/(sender)/notifications`, `/(sender)/history`, `/(sender)/home`, `/(auth)/sender/sign-in`, public privacy and terms routes, public support route |
| Required states | `loading_settings`, `ready`, `saving_local`, `offline_ready`, `session_expired`, `not_authorized`, `permission_limited`, `cache_clearing`, `cache_clear_success`, `cache_clear_failed`, `signing_out`, `api_error` |

## Product Job
This screen gives a sender control over app-level behavior and account exits without creating unsupported backend account management. It is the settings command center for local preferences, notification access, privacy/legal links, cache controls, profile navigation, and sign out.

The sender should be able to:
- Open profile details.
- Review notification settings and open the notification inbox.
- Open device notification settings when permission changes must happen at OS level.
- Control local low-bandwidth behavior.
- Control local offline/cached delivery data behavior.
- Choose a local appearance setting if the app supports theme selection.
- See language availability and localization status.
- Clear cached sender data from this device.
- Open privacy policy and terms.
- Get support for account concerns.
- Sign out with confirmation.

This screen is not:
- A profile editor.
- A phone-number change flow.
- A server-side notification preference manager.
- A support chat.
- A payment wallet.
- A staff settings page.
- An admin configuration page.
- A station, driver, or courier preferences page.
- A delete-account executor.
- A place to edit delivery defaults that are not supported by contracts.

## Audience
Primary audience:
- Authenticated senders who want to adjust app behavior.
- Senders on shared or constrained devices who need cache, sign-out, and data controls.
- Senders in low-bandwidth contexts who need practical local options.
- Senders looking for privacy, legal, support, or notification controls.

Secondary audience:
- Claude Code implementing the mobile route.
- QA validating local preference persistence and sign-out behavior.
- Security reviewers checking cache and session boundaries.
- Product reviewers checking profile/settings separation.
- Accessibility reviewers checking switch and row semantics.

## User State
The sender may be calm and browsing settings, or they may be trying to fix a problem quickly: notifications are off, the app is using too much data, a shared phone needs sign-out, or cached delivery data needs clearing.

The sender may be:
- Looking for account details.
- Trying to stop or adjust app alerts.
- Trying to make the app work better on weak networks.
- Trying to protect delivery information on a shared device.
- Trying to sign out.
- Trying to find privacy or terms information.
- Trying to get help for account access.

The screen must:
- Keep the profile route visible.
- Keep sign out visible but separated.
- Make local-only settings explicit.
- Route OS-level permission changes to OS settings when needed.
- Avoid unsupported server preference toggles.
- Avoid pretending SMS delivery notices can be disabled from this screen if no backend preference exists.
- Avoid collecting extra personal information.
- Preserve account safety when clearing cache or signing out.

## Primary Action
Primary action by state:
- `ready`: state-driven, no single dominant CTA; settings rows are the task.
- `offline_ready`: `Review local settings`
- `permission_limited`: `Open device settings`
- `cache_clear_success`: `Done`
- `cache_clear_failed`: `Try again`
- `session_expired`: `Sign in again`
- `not_authorized`: `Sign in again`
- `api_error`: `Try again`

Important actions:
- `Profile`
- `Notifications`
- `Device notification settings`
- `Low-bandwidth mode`
- `Offline data`
- `Appearance`
- `Language`
- `Clear cached data`
- `Privacy policy`
- `Terms of service`
- `Get support`
- `Sign out`

CTA behavior:
- `Profile` routes to `/(sender)/profile`.
- `Notifications` routes to `/(sender)/notifications`.
- `Device notification settings` opens OS app settings.
- `Low-bandwidth mode` updates local client preference.
- `Offline data` opens inline explanation and local control.
- `Appearance` changes local theme preference only if app theming exists.
- `Language` opens language panel or shows supported language information.
- `Clear cached data` opens confirmation before clearing sender-only local cache.
- `Privacy policy` opens public privacy route.
- `Terms of service` opens public terms route.
- `Get support` routes to support entry.
- `Sign out` opens confirmation before clearing session.

Blocked behavior:
- Do not call admin user endpoints.
- Do not call any profile update endpoint.
- Do not call a phone update endpoint.
- Do not call a notification preference endpoint unless it exists.
- Do not call outbound notification admin endpoints.
- Do not let sender disable legally or operationally required SMS notices from this screen.
- Do not clear account session when the sender only clears cached data.
- Do not clear cache without confirmation.
- Do not sign out without confirmation.
- Do not show raw tokens, role claims, capability arrays, or device identifiers.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- Account section with profile row.
- Notification section with current device permission summary.
- Local app preferences section.
- Privacy/data controls.
- Sign-out zone.

The first viewport must answer:
- `Where do I manage my account details?`
- `Are notifications available on this device?`
- `What local controls do I have?`
- `Where are privacy and support controls?`
- `How do I sign out safely?`

## Main Tension
Settings screens often become a dumping ground. This one must be useful and comprehensive without exposing backend controls that do not exist. The sender should feel in control while the app stays honest about local vs server-managed behavior.

The design must balance:
- Practical control against unsupported configuration.
- Notification clarity against missing server preferences.
- Cache control against delivery data safety.
- Low-bandwidth support against hiding essential updates.
- Sign-out access against accidental logout.
- Profile navigation against duplicate profile content.
- Legal discoverability against clutter.

## Design Brief
User and job:
- An authenticated sender wants to control app behavior and account exits.

Context of use:
- Mobile, low-bandwidth, shared-device, privacy-sensitive, delivery-critical.

Entry point:
- SenderProfile.
- SenderHome avatar/menu.
- Notification permission banner.
- Offline warning.
- Privacy/legal links.

Success state:
- Sender changes a local preference, opens the right management route, clears cache, finds support/legal information, or signs out deliberately.

Primary action:
- No single primary action in ready state; the screen is a structured command center.

Navigation model:
- Grouped settings list with stable sections and confirmation sheets for high-impact actions.

Density:
- Medium. Enough detail to prevent mistakes, not enough to become a control panel wall.

Visual thesis:
- A calm control room for a delivery account: precise rows, strong sectioning, and careful destructive actions.

Restraint rule:
- Avoid too many toggles, hidden server claims, admin terms, and long explanatory paragraphs.

Product lens:
- Trust, local control, and safety.

System stance:
- Native mobile settings with premium KRA materials, clear grouping, and explicit local/server boundaries.

Interaction thesis:
- The sender scans a section, changes one safe setting, or routes to the correct account/help surface.

Signature move:
- A "Device and delivery safety" section that explains local cache and low-bandwidth mode in plain language.

Activation event:
- Local setting saved, OS settings opened, cache cleared, support opened, or sign-out confirmed.

## Elite Quality Gate
This spec is not closed unless settings are honest, useful, accessible, and safe on shared devices.

Non-negotiable quality requirements:
- First viewport shows account and notification settings.
- Profile details are routed to `SenderProfile`, not repeated deeply.
- Every switch describes whether it is local-only.
- Notification permission changes open OS settings if native permission is required.
- No unsupported server preference mutation appears.
- Cache clearing and sign-out both require confirmation.
- Clearing cache does not sign out.
- Sign out clears session and sensitive sender cache.
- Privacy, terms, and support are discoverable.
- Offline mode remains usable for local settings.
- Screen supports screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If the screen shows a server notification preference without backend support, it remains open.
- If sign out is a one-tap destructive row, it remains open.
- If clear cache removes auth state, it remains open.
- If profile editing appears here, it remains open.
- If settings show raw auth fields, it remains open.
- If switches lack accessible state labels, it remains open.

## Research And Inspiration Notes
Use these sources for quality direction, not visual copying:
- [Apple Human Interface Guidelines: Settings](https://developer.apple.com/design/human-interface-guidelines/settings): settings should be easy to find, predictable, and not replace in-app task flows.
- [Apple Human Interface Guidelines: Managing accounts](https://developer.apple.com/design/human-interface-guidelines/managing-accounts): account management actions should be clear, respectful, and reversible where possible.
- [Material Design 3 switches](https://m3.material.io/components/switch/overview): switches should map to immediate on/off state and be used only for binary settings.
- [Material Design 3 lists](https://m3.material.io/components/lists/overview): settings rows need clear labels, supporting text, and predictable touch behavior.
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): mobile settings rows and switches need reliable touch targets.
- [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/): controls need labels, instructions, and error relationships.

Applied decisions:
- Use grouped rows with a small number of switches.
- Prefer route rows for complex settings.
- Use confirmation sheets for destructive local actions.
- Keep notification controls honest about OS and backend boundaries.
- Keep copy short and plain.

## Data Contract And Backend Alignment
Primary sources:
- Authenticated sender session.
- `AuthPrincipal` role and user scope after authenticated calls.
- Local client preference storage.
- OS notification permission state.
- Network state.
- Optional query cache metadata.

Backend contract facts:
- `AuthPrincipal` exposes `userId`, `role`, optional `stationId`, `capabilities`, and `authMethod`.
- Sender role is `roleSchema` value `sender`.
- User IDs follow `userIdSchema`.
- `list_notifications` exists for notification inbox, not notification preference management.
- Admin user management exists but is admin-only.
- Outbound notification monitoring exists for admin/support tooling, not sender settings.

No v1 settings API:
- No `/v1/settings` route is present.
- No sender preference schema is present.
- No notification preference schema is present.
- No sender profile update schema is present.
- No account deletion endpoint is present.
- No push token registration endpoint is documented for sender settings.

Allowed persistence:
- Local low-bandwidth mode.
- Local appearance selection if app supports theme.
- Local language preference if app supports localization.
- Local cache behavior preference.
- Local analytics/diagnostic preference only if privacy policy and app analytics architecture support it.

Disallowed persistence:
- Server notification opt-out.
- SMS delivery notice opt-out.
- Account phone change.
- Account deletion execution.
- Sender name change.
- Admin status changes.
- Role changes.
- Station binding.

Implementation posture:
- Render settings from local store and auth state.
- Make OS permission state visible but not editable through a false switch.
- Use switches only when tapping changes local state immediately.
- Use rows with chevrons when a setting needs explanation or a separate route/panel.
- Keep destructive actions in confirmation sheets.

## Route And Access Rules
Route:
- `/(sender)/settings`

Required access:
- Authenticated sender session.
- If role is unknown, show `loading_settings`.
- If role is not `sender`, show `not_authorized`.
- If session is expired, show `session_expired`.

Entry rules:
- SenderProfile settings row opens this screen.
- SenderHome avatar/menu can open this screen.
- Notification permission banner can deep link to notification section.
- Offline banner can deep link to low-bandwidth/offline data section.

Exit rules:
- Back returns to previous route.
- If no previous route, route to `/(sender)/profile` or `/(sender)/home` according to navigation origin.
- Explicit sign out routes to `/(auth)/sender/sign-in`.

Deep link anchors:
- `/(sender)/settings?section=notifications`
- `/(sender)/settings?section=data`
- `/(sender)/settings?section=privacy`

Invalid anchors:
- Scroll to top and keep screen stable.
- Do not crash on unknown section.

## Information Architecture
Sections in order:
1. Account.
2. Notifications.
3. Device and delivery safety.
4. Appearance and language.
5. Privacy and legal.
6. Support.
7. Sign out.
8. App information.

Above the fold:
- Top bar.
- Account row.
- Notifications permission summary.
- Low-bandwidth mode row or switch.

Below the fold:
- Offline data controls.
- Appearance.
- Language.
- Privacy.
- Terms.
- Support.
- Clear cached data.
- Sign out.
- Version.

Section grouping:
- Account includes profile.
- Notifications includes inbox and device settings.
- Device and delivery safety includes data saver and cache.
- Appearance and language includes local UI preferences.
- Privacy and legal includes policies and data controls.
- Support includes help.
- Sign out is isolated.

## Layout Structure
Root:
- Safe area view.
- Scroll view.
- Warm neutral background.
- Section cards or grouped list surfaces.
- Sticky top title only if app pattern uses it.

Top bar:
- Leading back.
- Title: `Settings`.
- Optional profile avatar shortcut only if it does not duplicate the first row.

Section header:
- Short label.
- Optional one-line explanation.
- Do not use long paragraphs inside headers.

Rows:
- Leading icon.
- Main label.
- Supporting text.
- Trailing control: chevron, switch, status text, or badge.
- 56 px preferred minimum height.
- 16 to 20 px horizontal row padding.

Switch rows:
- Entire row can toggle only if platform pattern supports it accessibly.
- Switch itself must be focusable.
- Supporting text must explain consequence.

Destructive zone:
- Separate from normal sections with extra spacing.
- Use controlled danger color.
- Do not place sign out beside clear cache.

Footer:
- App version.
- Environment label only in non-production builds.
- Legal entity copy if required.

## Visual Direction
Mood:
- Calm.
- Controlled.
- Trustworthy.
- Native.
- Operationally precise.

Avoid:
- Settings clutter.
- Dense toggle wall.
- Admin console styling.
- Social account styling.
- Warning-heavy normal state.
- Badge overload.

Color direction:
- Background: warm off-white.
- Section surfaces: clean white or pale sand.
- Primary text: ink.
- Secondary text: slate.
- Active switch: deep green.
- Warning: amber.
- Destructive: controlled red.
- Link rows: deep green or ink blue.

Typography:
- Screen title uses strong heading.
- Section headers use compact label style.
- Row labels use medium weight.
- Supporting text uses concise body size.
- Footer uses small but readable type.

Material:
- Use one consistent row surface style.
- Minimal shadows.
- Dividers or spacing, not both everywhere.
- Icons should be consistent and functional.

## Copy System
Voice:
- Direct.
- Calm.
- Account-safe.
- Low hype.
- Specific.

Terminology:
- Use `settings`, not `configuration`.
- Use `device settings` for OS-level controls.
- Use `local setting` only when needed to explain no server sync.
- Use `cached data`, not `storage blob`.
- Use `sign out`, not `logout`.

Screen title:
- `Settings`

Section labels:
- `Account`
- `Notifications`
- `Device and delivery safety`
- `Appearance and language`
- `Privacy and legal`
- `Support`
- `Sign out`

Row labels and helper copy:
- Profile: `Profile` / `View your signed-in sender account.`
- Notification inbox: `Notification inbox` / `Delivery, payment, refund, and issue updates.`
- Device notifications: `Device notifications` / `Allow or block app alerts from your phone settings.`
- Low-bandwidth mode: `Low-bandwidth mode` / `Use lighter refresh behavior on slow networks.`
- Offline data: `Offline delivery data` / `Control saved delivery information on this device.`
- Appearance: `Appearance` / `Use system theme or choose a local display style.`
- Language: `Language` / `English is available for launch; more languages can be added later.`
- Clear cached data: `Clear cached data` / `Remove saved sender delivery data from this device.`
- Privacy policy: `Privacy policy` / `How KRA handles account and delivery information.`
- Terms of service: `Terms of service` / `Rules for using KRA delivery services.`
- Get support: `Get support` / `Find help for account or delivery concerns.`
- Sign out: `Sign out` / `Remove this account from this device.`

Unsupported preference copy:
- Title: `Managed by KRA delivery updates`
- Body: `Some SMS delivery notices are required for package custody and receiver safety. They cannot be turned off here.`

Permission limited copy:
- Title: `Device notifications are off`
- Body: `Turn them on in your phone settings to receive app alerts. SMS delivery notices may still be sent when required for delivery.`
- Action: `Open device settings`

Cache clear confirmation:
- Title: `Clear cached delivery data?`
- Body: `This removes saved sender delivery information from this device. It does not cancel deliveries or sign you out.`
- Confirm: `Clear data`
- Cancel: `Keep data`

Cache clear success:
- Title: `Cached data cleared`
- Body: `Saved sender delivery information was removed from this device.`

Sign-out confirmation:
- Title: `Sign out of this device?`
- Body: `You will need to sign in again before creating or tracking deliveries from this phone.`
- Confirm: `Sign out`
- Cancel: `Stay signed in`

Error copy:
- Session expired title: `Sign in again`
- Session expired body: `Your session expired. Sign in again before changing settings.`
- Not authorized title: `Sender settings unavailable`
- Not authorized body: `This account is not registered for sender settings.`
- Save failed title: `Setting was not saved`
- Save failed body: `Try again. Your deliveries were not changed.`
- Cache failed title: `Cached data was not cleared`
- Cache failed body: `Try again. Your account is still signed in.`

## Component Inventory
Required components:
- `SenderSettingsScreen`
- `SettingsTopBar`
- `SettingsSection`
- `SettingsActionRow`
- `SettingsSwitchRow`
- `SettingsStatusRow`
- `NotificationPermissionPanel`
- `LowBandwidthSetting`
- `OfflineDataSetting`
- `AppearanceSettingRow`
- `LanguageSettingRow`
- `ClearCacheConfirmSheet`
- `SignOutConfirmSheet`
- `SettingsStateView`
- `SettingsFooter`

Shared component candidates:
- `AppScreen`
- `SafeScrollView`
- `IconRow`
- `StatusChip`
- `Switch`
- `ConfirmationSheet`
- `InlineAlert`
- `RetryPanel`
- `SkeletonBlock`

Component responsibilities:
- `SenderSettingsScreen` maps state and composes sections.
- `SettingsTopBar` handles navigation.
- `SettingsSection` groups related rows.
- `SettingsActionRow` routes to another screen or action.
- `SettingsSwitchRow` manages immediate local binary preference.
- `SettingsStatusRow` shows read-only state with action.
- `NotificationPermissionPanel` explains OS permission state.
- `LowBandwidthSetting` persists local low-bandwidth mode.
- `OfflineDataSetting` opens cache/data controls.
- `AppearanceSettingRow` opens local appearance selector if supported.
- `LanguageSettingRow` opens language info/selector.
- `ClearCacheConfirmSheet` confirms cache deletion.
- `SignOutConfirmSheet` confirms sign out.
- `SettingsStateView` renders loading/error/expired states.
- `SettingsFooter` shows version and legal metadata.

## State Model
State names:
- `loading_settings`
- `ready`
- `saving_local`
- `offline_ready`
- `session_expired`
- `not_authorized`
- `permission_limited`
- `cache_clearing`
- `cache_clear_success`
- `cache_clear_failed`
- `signing_out`
- `api_error`

State sources:
- Auth session.
- Role claim or verified principal.
- Local preference store.
- OS notification permission.
- Network state.
- Local cache metadata.
- Optional query cache metadata.

State priority:
1. `session_expired`
2. `not_authorized`
3. `loading_settings`
4. `signing_out`
5. `cache_clearing`
6. `cache_clear_failed`
7. `api_error`
8. `offline_ready`
9. `permission_limited`
10. `saving_local`
11. `ready`

Ready criteria:
- Sender session exists.
- Role is sender.
- Local settings store is readable.

Offline ready criteria:
- Sender session exists locally.
- Network unavailable.
- Local preferences can still be read/written.

Permission limited criteria:
- OS notification permission is denied, blocked, provisional, or not determined.
- Show panel; do not block the rest of settings.

Session expired criteria:
- Token invalid, revoked, or refresh failed.

Not authorized criteria:
- Role exists but is not `sender`.

## Loading Behavior
Initial load:
- Render top bar immediately.
- Show section skeletons.
- Preserve approximate row heights.
- Avoid spinner-only screen.

Skeleton rows:
- Account row.
- Notification panel.
- Two local preference rows.
- Privacy/legal rows.

Loading copy:
- If longer than 600 ms, show `Loading settings...`

Loading restrictions:
- Do not show switches until local values are known.
- Do not allow sign out while auth state is unknown unless global auth layer supports it safely.

## Ready State
Ready layout:
- Top bar.
- Account section.
- Notifications section.
- Device and delivery safety section.
- Appearance and language section.
- Privacy and legal section.
- Support section.
- Sign-out section.
- Footer.

Account section:
- Row: Profile.
- Optional compact account contact line if available, masked.
- Do not show full identity details; profile owns that.

Notifications section:
- Row: Notification inbox.
- Panel: device notification permission.
- Row: Device notifications.
- Static note about required operational SMS if applicable.

Device and delivery safety:
- Switch or row: Low-bandwidth mode.
- Row: Offline delivery data.
- Row: Clear cached data.

Appearance and language:
- Row: Appearance.
- Row: Language.

Privacy and legal:
- Row: Privacy policy.
- Row: Terms of service.

Support:
- Row: Get support.

Sign out:
- Row: Sign out.
- Destructive styling.
- Confirmation required.

Footer:
- Version.
- Optional build label only outside production.

## Local Preference Rules
Low-bandwidth mode:
- Local boolean.
- Default: off unless app-level onboarding or OS data saver maps it.
- When on, app can reduce automatic refresh and heavy visual loads.
- Must not suppress critical delivery status fetches triggered by user.
- Must not suppress payment verification polling where required.

Offline delivery data:
- Local policy or row.
- Explains what delivery data is kept for offline viewing.
- Does not disable required server state.
- May provide `Clear cached data`.

Appearance:
- Local setting.
- Values: `System`, `Light`, `Dark` only if the app supports them.
- If app supports only system theme, show read-only row: `Using device setting`.

Language:
- Local setting or info row.
- Launch value: English.
- Future languages must use localization infrastructure, not hardcoded route-specific text.

Analytics/diagnostics:
- Include only if product privacy policy and analytics implementation exist.
- If not implemented, do not show a toggle.

Delivery defaults:
- Do not include until a supported local draft-default design exists.
- If later added, defaults must be validated against station availability at delivery creation time.

## Notification Settings Rules
Notification inbox:
- Always route to `/(sender)/notifications`.
- It is the product inbox and uses `list_notifications`.

Device notifications:
- Read OS permission state.
- If permission can be requested in-app, do so only through a clear permission prompt sequence.
- If permission is blocked, route to OS settings.
- Use a row/panel, not a false server toggle.

Required delivery SMS:
- Explain operational notices if the user asks why they cannot disable them.
- Do not offer opt-out without backend and policy support.
- Do not show provider diagnostics.
- Do not show outbound notification records.

Push token:
- Do not display or edit push token.
- Do not expose provider status.
- Do not register a push token from this screen unless app notification architecture owns that separately.

## Cache And Data Rules
Clear cached data clears:
- Cached delivery list/detail records.
- Cached timeline records.
- Cached notification list records.
- Cached support issue records.
- Cached receipt/share artifacts stored locally.
- Local non-sensitive query cache for sender shell.

Clear cached data does not clear:
- Active auth session.
- Legal content cache if shared with public app.
- Global app settings such as theme/language unless user chooses reset all settings in future.
- Server records.
- In-progress delivery state on backend.

Confirmation required:
- Always.

After clear:
- Show success panel or toast.
- Invalidate local query caches.
- Keep sender on settings.
- Offer `Go to home`.

Failure:
- Keep cached data.
- Show clear error.
- Offer retry.

Offline:
- Cache can be cleared offline.
- Explain that server data is unchanged.

## Sign-Out Flow
Trigger:
- Sender taps `Sign out`.

Confirmation:
- Bottom sheet or modal.
- Title: `Sign out of this device?`
- Body explains sign-in required later.
- Primary destructive action: `Sign out`.
- Secondary action: `Stay signed in`.

Confirm:
- Disable sheet buttons.
- Show `Signing out...`
- Clear auth session.
- Clear sender-sensitive caches.
- Clear return intents.
- Route to `/(auth)/sender/sign-in`.

Cancel:
- Close sheet.
- Return focus to sign-out row.
- No state changes.

Failure:
- Show `Could not sign out. Try again.`
- Keep sender in settings.
- Do not partially route away.

Security:
- Do not leave sender data visible behind sheet after successful sign out.
- Do not auto sign back in after explicit sign out.
- Do not keep deep link return intent after sign out.

## Navigation Details
Profile:
- Route: `/(sender)/profile`
- Purpose: identity and account hub.

Notification inbox:
- Route: `/(sender)/notifications`
- Purpose: read product notices.

Device notification settings:
- Platform API opens OS settings.
- If unavailable, show instructions.

Privacy:
- Route: public privacy page.
- Use in-app browser or native public route according to app architecture.

Terms:
- Route: public terms page.
- Use in-app browser or native public route according to app architecture.

Support:
- Route: public or authenticated support entry.
- If support needs delivery context, route to history first.

Home:
- Back fallback to `/(sender)/home`.

## Privacy And Security Rules
Settings may show:
- Masked account contact.
- Local preference state.
- Device notification permission state.
- Cache size or last-cleared time if available.
- App version.

Settings must not show:
- Full phone unless app-wide account policy allows it.
- Raw user ID as a main label.
- Tokens.
- Role claims.
- Capability arrays.
- Provider notification IDs.
- Device IDs.
- Receiver details.
- Package details.
- Payment references.
- Internal endpoint names in visible copy.

Shared device rules:
- Sign out is prominent enough to find.
- Clear cache is separate from sign out.
- Cache clear explains it does not cancel deliveries.
- Account-sensitive cached data is cleared on sign out.

Data protection:
- Store local preferences with least sensitive storage.
- Store auth/session separately according to auth architecture.
- Do not log settings payloads with personal data.
- Do not include sensitive data in analytics.

## Accessibility Requirements
Screen reader:
- Screen title is heading `Settings`.
- Section headers are announced.
- Rows expose label, helper, state, and action.
- Switch rows announce checked/unchecked and effect.
- Destructive rows announce destructive nature.
- Confirmation sheets trap focus.
- Success/failure messages are announced politely.

Touch:
- Rows meet mobile target-size requirements.
- Switches have adequate target area.
- Destructive confirm and cancel buttons are separated.

Text:
- Supports large text.
- Helper copy wraps.
- No row depends only on icon.
- No state depends on color only.

Contrast:
- Text meets WCAG contrast.
- Switch states meet contrast.
- Disabled rows remain legible.
- Warning/destructive text stays readable.

Motion:
- Respect reduced motion.
- Switch animation is subtle.
- Sheet movement uses platform defaults.

Keyboard and switch access:
- Focus order follows section order.
- All rows and switches are reachable.
- Confirmation sheet returns focus after close.

## Interaction Details
Switch toggle:
- Optimistically update local state only when local store is available.
- If save fails, revert and announce failure.
- Do not block navigation while one unrelated setting saves.

Row tap:
- Use pressed state.
- Prevent double navigation.
- Route after press release.

Open OS settings:
- Show app remains stable on return.
- Refresh permission state when app becomes active.

Clear cache:
- Require confirmation.
- Show progress.
- Invalidate local caches.
- Show success or failure.

Sign out:
- Require confirmation.
- Show progress.
- Route only after auth state clears.

Offline:
- Local switches still work if storage available.
- OS settings still opens.
- Privacy/terms may show cached public pages if available.
- Support route may require connection.

## Performance Requirements
Render:
- Local settings should render quickly from local store.
- Do not block on network.
- Do not fetch notification list just to show settings.
- Do not fetch deliveries just to show cache controls.

Storage:
- Preference writes should be small and debounced only where safe.
- Cache clear should be explicit and cancellable before confirmation.

Network:
- No network required for local setting toggles.
- Auth session validation may happen in background.
- Legal pages may load on demand.

Low bandwidth:
- Low-bandwidth mode should reduce automatic refresh intervals and heavy media where safe.
- It must not delay user-requested refresh.
- It must not suppress safety-critical delivery state.

## Analytics
Events:
- `sender_settings_viewed`
- `sender_settings_profile_pressed`
- `sender_settings_notifications_pressed`
- `sender_settings_device_notifications_pressed`
- `sender_settings_low_bandwidth_changed`
- `sender_settings_offline_data_pressed`
- `sender_settings_clear_cache_started`
- `sender_settings_clear_cache_confirmed`
- `sender_settings_clear_cache_cancelled`
- `sender_settings_clear_cache_failed`
- `sender_settings_privacy_pressed`
- `sender_settings_terms_pressed`
- `sender_settings_support_pressed`
- `sender_settings_sign_out_started`
- `sender_settings_sign_out_cancelled`
- `sender_settings_sign_out_confirmed`
- `sender_settings_session_expired_viewed`

Event properties:
- `entrypoint`: previous route category.
- `account_state`: `active`, `offline`, `expired`, `unauthorized`.
- `notification_permission`: `allowed`, `blocked`, `not_determined`, `unknown`.
- `low_bandwidth_enabled`: boolean.
- `cache_size_bucket`: coarse bucket only if available.

Do not log:
- Full phone.
- Email.
- Raw user ID unless hashed by analytics infrastructure.
- Tokens.
- Capabilities.
- Delivery IDs.
- Receiver data.
- Payment references.

## QA Scenarios
Core:
- Sender opens settings from profile.
- Sender opens settings from home.
- Sender taps profile row and reaches profile.
- Sender taps notification inbox row and reaches notifications.
- Device notifications are allowed.
- Device notifications are blocked.
- Device notification permission is not determined.
- Sender opens OS settings and returns.
- Sender turns low-bandwidth mode on.
- Sender turns low-bandwidth mode off.
- Local setting save fails and reverts.
- Sender opens offline data row.
- Sender starts cache clear and cancels.
- Sender clears cached data successfully.
- Cache clear fails and settings remain usable.
- Sender starts sign out and cancels.
- Sender confirms sign out and reaches sign-in.
- Sign-out fails and sender remains on settings.
- Session expires while on settings.
- Non-sender role opens settings.
- Offline settings render local controls.

Accessibility:
- Screen reader announces section headers.
- Switch rows announce checked state.
- Row helper text is available.
- Confirmation sheet traps focus.
- Focus returns after cancel.
- Large text does not truncate key labels.
- Reduced motion is respected.
- Destructive rows are distinguishable without color alone.

Privacy:
- No token or raw auth claim appears.
- Full phone is not shown unless policy allows.
- Clear cache does not sign out.
- Sign out clears sensitive sender cache.
- Required delivery SMS cannot be disabled through an unsupported toggle.

Contract:
- No admin endpoint is called.
- No settings API endpoint is called.
- No profile update endpoint is called.
- No phone update endpoint is called.
- No notification preference endpoint is called.
- No outbound notification admin endpoint is called.

## Implementation Notes For Claude Code
Recommended route file:
- `apps/mobile/src/app/(sender)/settings.tsx` or the equivalent Expo Router path used by the project.

Recommended local modules:
- `useAuthSession`
- `useSenderPrincipal`
- `useLocalSettings`
- `useNetworkStatus`
- `useNotificationPermission`
- `useSenderCacheControls`
- `useSignOut`

Implementation sequence:
1. Create route shell and sectioned layout.
2. Wire auth/session state.
3. Wire local settings store.
4. Build account and notification sections.
5. Add low-bandwidth and local data controls.
6. Add privacy/legal/support rows.
7. Add cache clear confirmation.
8. Add sign-out confirmation.
9. Add accessibility labels and focus management.
10. Add analytics.
11. Add tests for every state and high-impact action.

Do not implement:
- Profile edit fields.
- Phone update.
- Server notification preferences.
- SMS opt-out.
- Account deletion execution.
- Admin user controls.
- Staff route switching.
- Payment wallet settings.
- Delivery defaults unless a local-default design is approved.

## Test ID Contract
Required test IDs:
- `screen-sender-settings`
- `sender-settings-top-bar`
- `sender-settings-account-section`
- `sender-settings-profile-row`
- `sender-settings-notifications-section`
- `sender-settings-notification-inbox-row`
- `sender-settings-device-notifications-row`
- `sender-settings-permission-panel`
- `sender-settings-safety-section`
- `sender-settings-low-bandwidth-row`
- `sender-settings-offline-data-row`
- `sender-settings-clear-cache-row`
- `sender-settings-clear-cache-sheet`
- `sender-settings-clear-cache-confirm`
- `sender-settings-clear-cache-cancel`
- `sender-settings-appearance-section`
- `sender-settings-appearance-row`
- `sender-settings-language-row`
- `sender-settings-privacy-section`
- `sender-settings-privacy-row`
- `sender-settings-terms-row`
- `sender-settings-support-section`
- `sender-settings-support-row`
- `sender-settings-sign-out-section`
- `sender-settings-sign-out-row`
- `sender-settings-sign-out-sheet`
- `sender-settings-sign-out-confirm`
- `sender-settings-sign-out-cancel`
- `sender-settings-state-loading`
- `sender-settings-state-expired`
- `sender-settings-state-not-authorized`
- `sender-settings-state-error`
- `sender-settings-footer`

Optional test IDs:
- `sender-settings-cache-size`
- `sender-settings-last-cache-clear`
- `sender-settings-version`
- `sender-settings-notification-status`

## Visual QA Checklist
Before closing implementation:
- Settings sections are easy to scan.
- Account/profile row is above the fold.
- Notification permission state is clear.
- Switches are used only for immediate local settings.
- Destructive actions are visually separated.
- Clear cache and sign out cannot be confused.
- Legal/support links are discoverable.
- Offline state does not look broken.
- Permission-limited state gives a clear next action.
- Large text preserves row order and controls.
- Confirmation sheets feel native on iOS and Android.

## Copy QA Checklist
Before closing implementation:
- No unsupported server preference language appears.
- SMS operational notice copy is honest.
- Cache clear copy says it does not cancel deliveries or sign out.
- Sign-out copy says sign-in will be required.
- Local-only settings are described clearly.
- Error copy states what happened and what to do next.
- Labels are short enough for mobile.
- No raw enum values appear as visible labels.

## Handoff Summary
Build `SenderSettings` as a serious mobile settings command center for local app behavior, notification access, privacy/legal routes, support, cache controls, and sign out.

The central product rule is:
- Settings can manage local/device controls.
- Profile owns account identity.
- Backend owns delivery state.
- Unsupported server preferences must not appear as real controls.


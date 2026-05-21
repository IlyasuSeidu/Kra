# Wrong Package Scanned Modal Spec

## Modal Contract
| Field | Value |
| --- | --- |
| Modal ID | `WrongPackageScannedModal` |
| Component target | shared scan-conflict modal for `apps/mobile` and admin/support review surfaces |
| Primary test ID | `modal-wrong-package-scanned` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | P0 custody safety component |
| Used by | station scan flows, driver pickup scan, destination receipt scan, courier custody scan, admin package review |
| Backend coverage | `PACKAGE_SCAN_MISMATCH` |
| Trigger source | `ScanPackageModal`, scan screens, action recovery, admin package detail |
| Required states | `closed`, `opening`, `mismatch_detected`, `unknown_scan_code`, `bound_to_other_delivery`, `scan_value_hidden`, `scan_value_redacted`, `rescan_available`, `custody_chain_available`, `issue_route_available`, `admin_review_available`, `support_route_available`, `offline_context`, `stale_context`, `submitting_issue_context`, `issue_context_created`, `network_error`, `closing` |

## Product Job
`WrongPackageScannedModal` stops a handoff when a scanned package code does not match the selected delivery. It must make the mismatch impossible to ignore, keep custody from moving, protect scan-code privacy, and give the staff user safe recovery choices.

The modal answers:
- `Why did this scan fail?`
- `Is custody still unchanged?`
- `Should the user scan again, open custody chain, or report an issue?`
- `What sensitive details should be hidden?`
- `What should support or admin review next?`

The user should be able to:
- Understand that the package scanned is not accepted for this delivery.
- See that no handoff or readiness action completed.
- Scan again when the physical package may simply be wrong or poorly aligned.
- Open custody chain when a label conflict needs investigation.
- Report an issue when the package physically appears mismatched, damaged, missing, or unsafe to hand over.
- Return to the host screen without losing safe context.
- Avoid seeing internal label binding details they are not allowed to inspect.

This modal is not:
- A scanner.
- A package search tool.
- A custody override.
- A supervisor approval form.
- A label reprint request.
- A support conversation.
- A manual custody exception review.
- A package label registry.
- A way to reveal the delivery bound to the scanned code for normal field staff.

## Strategic Role
Wrong-package scans are the moment where Kra can prevent loss before it happens. The modal must treat the mismatch as a custody blocker, not a soft warning. It should keep the field user calm, but it must never let them continue the handoff as if the scan passed.

Core principle:
- Mismatch stops progress.
- Custody remains with the last confirmed custodian.
- The user can rescan, investigate, or escalate.
- Backend label binding remains authority.
- Raw scan value and bound delivery details stay protected.
- The modal cannot override `PACKAGE_SCAN_MISMATCH`.

## Audience
Primary users:
- Station operators scanning package labels.
- Drivers scanning origin pickup packages.
- Destination station operators receiving packages.
- Final-mile couriers accepting packages.

Secondary users:
- Support staff receiving issue context.
- Ops admins investigating custody exceptions.
- QA validating scan-conflict recovery.
- Security reviewers validating scan-code privacy.
- Accessibility reviewers validating alert semantics and focus recovery.
- Claude Code implementing shared conflict behavior later.

Non-users:
- Senders.
- Receivers.
- Public tracking visitors.
- Finance-only admins.
- Webhook processors.
- Scheduled jobs.
- AI agents acting without human review.

## Current Backend Reality
Backend error:
- `PACKAGE_SCAN_MISMATCH`

Default safe message:
- `This scan code does not match the delivery.`

Backend sources:
- `reservePackageLabelForDelivery`
- `assertPackageScanMatchesDelivery`

Mismatch causes:
- Scanned code is not registered.
- Scanned code is registered but bound to a different delivery.
- Origin intake tries to reserve a code that is already bound to another delivery.
- Later handoff scan does not match the immutable package-label binding.

Backend metadata may include:
- selected `deliveryId`
- raw `scanCode`
- `boundDeliveryId` when the scan code belongs to another delivery

Frontend handling:
- Field staff should not see raw `scanCode`.
- Field staff should not see `boundDeliveryId`.
- Admin review may expose a redacted binding summary only when the admin surface has a safe package-label evidence policy.
- Sender and receiver surfaces must not use this modal.
- No successful handoff, custody movement, readiness action, or intake confirmation should be shown after this error.

## Source References
External references used for this modal:
- [WAI-ARIA Alert and Message Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): supports interruptive error dialogs with `alertdialog`, labelled title, described message, and modal keyboard behavior for critical confirmations.
- [WAI-ARIA Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): supports focus containment, inert background content, Escape behavior, and focus return after modal close.
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): supports describing detected input errors in text so users know what is wrong.
- [WCAG 2.2 Error Prevention: Legal, Financial, Data](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html): supports review, correction, and confirmation for important actions that modify stored data or create serious consequences.
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for scan mismatch, retry, issue creation, and route recovery.
- [WCAG 2.2 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): supports reliable touch targets for rescan, issue, custody chain, and close actions in field conditions.
- [Material Design Dialogs](https://m3.material.io/components/dialogs/overview): supports focused interruption, clear actions, and blocking workflows that require a user decision.

Local references:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/05-design/design-system.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/shared-operational-modals/03-scan-package-modal.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/03-ops-scan-package.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/04-ops-custody-chain.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/07-ops-issue-create.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/07-admin-package-detail.md`
- `docs/05-design/frontend-screen-specs/admin-web-console/10-admin-manual-custody-exception.md`
- `docs/03-business/handoff-rules.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/07-api/error-codes.md`
- `docs/08-security/authorization-rules.md`
- `docs/09-ops/dispute-and-audit-runbook.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/package-labels.ts`
- `services/api/src/handoffs.ts`
- `services/api/src/app.ts`

## Design Brief
Audience:
- Internal field staff and admin/support users responding to a scan conflict.

Context of use:
- A package is physically present, a scan just failed, and a handoff may be blocked at a station or delivery point.

Entry point:
- Host receives `PACKAGE_SCAN_MISMATCH` after scan submit or local verified scan conflict.

Success state:
- User either rescans the correct package, opens custody chain, reports issue context, or routes to admin review.

Primary action:
- `Scan again`

Secondary actions:
- `Open custody chain`
- `Report issue`
- `Back to delivery`

Navigation model:
- Alert-style modal over the scan or action host.
- On mobile, use a high-priority bottom sheet only if the platform scanner surface requires it; otherwise use full modal.
- On admin, use centered alert dialog.

Density:
- Low. The user needs the block reason and next safe action quickly.

Visual thesis:
- A red custody stop sign with precise wording, one fast recovery path, and explicit audit escalation.

Restraint rule:
- Do not display raw scan code, bound delivery ID, full package registry details, or long policy text.

Product lens:
- Loss-prevention conflict handling.

System stance:
- Shared alert dialog powered by design-system modal primitives and scan-error route callbacks.

Interaction thesis:
- Stop the handoff, explain the mismatch, guide the next safe action, and preserve evidence without disclosure.

Signature move:
- A custody lock strip that says `Custody did not change` before any recovery actions.

Activation event:
- Host receives or derives `PACKAGE_SCAN_MISMATCH`.

## Host Responsibilities
The host must provide:
- `deliveryId`
- delivery reference
- scan intent
- actor role
- current status
- current custody role
- next required actor when role-safe
- mismatch source
- safe user-facing error code
- whether the code was unknown or bound elsewhere, if safe to know
- retry callback
- custody chain callback
- issue creation callback
- admin review callback where allowed
- close callback

The host may provide:
- redacted scanned-code preview
- freshness timestamp
- last mutation operation key
- current station scope
- active assignment context
- whether offline context is involved

The host must not provide to normal field UI:
- raw scan code
- bound delivery ID
- bound tracking code
- actor ID from another delivery
- package-label registry document path
- raw backend metadata
- stack trace

## Modal Responsibilities
The modal must:
- Render a high-priority mismatch message.
- Make clear that the action did not complete.
- Make clear that custody did not move.
- Offer role-safe next actions.
- Preserve focus and keyboard behavior.
- Announce the mismatch to assistive technology.
- Avoid sensitive data leakage.
- Route support/admin users to deeper review only when allowed.
- Clear transient scan value on close when host requires it.

The modal must not:
- Retry automatically.
- Submit fallback entry.
- Let the user force the scan.
- Move custody.
- Bind a package label.
- Open scanner and issue creation at the same time.
- Reveal where the wrong code belongs to field staff.
- Ask staff to manually compare full scan codes.
- Treat unknown code and bound-other-delivery code as success.

## Trigger Conditions
Open this modal when:
- Backend returns `PACKAGE_SCAN_MISMATCH`.
- Local scanner host identifies selected delivery and scanned value as conflicting through a safe local binding source.
- Offline replay returns package mismatch during action recovery.
- Admin package detail surfaces a scan mismatch event and user chooses to inspect the conflict.

Do not open this modal when:
- Camera permission is denied.
- Scan value is too short or too long before backend call.
- Scan action is blocked by payment.
- Scan action is blocked by station scope.
- Scan action is blocked by assignment scope.
- Scan action is blocked by lifecycle status.
- Package was already received or repeated scan returns a dedicated repeated-scan error.

Routing:
- Camera and local entry errors stay in `ScanPackageModal`.
- Dedicated repeated-scan errors go to `PackageLabelAlreadyUsedModal` or host repeated-scan state.
- Scope and assignment errors go to permission or role-specific blocked states.

## Mismatch Types
`unknown_scan_code`:
- Backend could not find the scan code in package label registry.
- Field copy: `This code is not registered to this delivery.`
- Recovery: scan again, check physical label, report issue if package appears correct.

`bound_to_other_delivery`:
- Backend found the scan code, but it belongs to a different delivery.
- Field copy: `This package label belongs to another delivery record.`
- Recovery: stop handoff, open custody chain, report issue.
- Field staff must not see the other delivery ID by default.

`wrong_visible_package`:
- User scans a package they can see is not the intended package.
- Field copy: `Set this package aside and scan the correct package for this delivery.`
- Recovery: scan again or report issue.

`offline_replay_mismatch`:
- Queued scan synced later and backend rejected it.
- Field copy: `The queued scan did not match the delivery when it synced.`
- Recovery: open action recovery, custody chain, or issue.

`admin_review_mismatch`:
- Admin opens a package detail or exception record for a mismatch.
- Admin copy: `A scan-code mismatch blocked this handoff. Review custody evidence before taking action.`
- Recovery: open manual custody exception, issue detail, or package label registry view when allowed.

## Severity Model
`low_recovery`:
- User scanned a visible wrong package before handoff.
- No submit succeeded.
- Recommended action is scan again.

`operational_blocker`:
- Backend rejected scan during custody or readiness mutation.
- Handoff remains blocked.
- Recommended action is custody chain or issue.

`investigation_required`:
- Scan appears bound to another delivery.
- Physical package may be in the wrong queue, wrong run, or wrong station.
- Recommended action is issue creation or admin review.

`offline_conflict`:
- Offline queued action failed during sync.
- Recommended action is action recovery.

Severity changes:
- Do not let the user downgrade severity manually.
- Support/admin may add issue context in a separate workflow.
- Admin review may classify later, but this modal only blocks and routes.

## Information Architecture
Default layout:
1. Alert title.
2. Custody lock strip.
3. Mismatch explanation.
4. Delivery identity strip.
5. What to do next.
6. Actions.
7. Optional admin/support details.

Mobile layout:
1. Title and status icon.
2. `Custody did not change` strip.
3. One-sentence mismatch explanation.
4. Primary action.
5. Secondary recovery actions.

Admin layout:
1. Alert title.
2. Mismatch details summary.
3. Evidence links.
4. Recovery actions.

Small-screen priority:
- Keep `Custody did not change` above the fold.
- Keep `Scan again` visible.
- Collapse admin-only details.

## Header
Title:
- `Wrong package scanned`

Subtitle:
- `This scan code does not match the selected delivery.`

Icon:
- Use blocked or warning icon.
- Do not use success color or checkmark.

Header must:
- Be direct.
- Avoid blame.
- Avoid raw codes.
- Avoid saying the package is lost.

## Custody Lock Strip
Required copy:
- `Custody did not change.`

Supporting copy:
- `The handoff is still blocked until the correct package is scanned or an issue is opened.`

If dispatch readiness intent:
- `Dispatch readiness was not recorded.`

If intake intent:
- `The label was not bound to this delivery.`

If driver pickup intent:
- `Driver custody was not accepted.`

If destination receipt intent:
- `Destination station custody was not accepted.`

If courier acceptance intent:
- `Courier custody was not accepted.`

The strip must:
- Use caution or danger styling.
- Stay visible above actions.
- Be announced to screen readers.

## Delivery Identity Strip
Show:
- delivery reference
- scan intent
- current status
- current custody role
- station or assignment context when role-safe

Do not show:
- raw scanned code
- bound delivery ID
- other delivery tracking code
- full receiver phone
- full receiver address
- provider reference
- internal actor IDs
- registry document paths

Identity copy:
- `Selected delivery: {deliveryReference}`
- `Scan step: {scanIntentLabel}`
- `Current custody: {custodyLabel}`

If identity is stale:
- Show `Delivery details may be out of date. Refresh before another handoff attempt.`

## Explanation Copy
Default:
- `The package label scanned is not accepted for this delivery. Scan the correct package or open an issue if the package in front of you appears wrong.`

Unknown code:
- `This code is not registered as the package label for this delivery.`

Bound elsewhere:
- `This package label appears to belong to another delivery record. Stop this handoff and investigate before moving the package.`

Offline replay:
- `A queued scan was rejected after sync because it did not match this delivery.`

Admin review:
- `A scan mismatch blocked this workflow. Review custody chain and issue evidence before changing package state.`

Copy rules:
- State what happened.
- State what did not happen.
- State the next safe options.
- Do not expose sensitive backend detail.
- Do not tell staff to continue without proof.

## Action Model
Primary action:
- `Scan again`

Secondary actions:
- `Open custody chain`
- `Report issue`
- `Back to delivery`
- `Open action recovery`
- `Open admin review`

Action availability:
- `Scan again`: show when host scanner can reopen.
- `Open custody chain`: show for all staff roles with delivery access.
- `Report issue`: show for station, driver, courier, support, and admin when issue creation is available.
- `Back to delivery`: always show.
- `Open action recovery`: show for offline replay mismatch.
- `Open admin review`: show only for admin/support contexts.

Action behavior:
- `Scan again` closes this modal and returns to `ScanPackageModal` scanning state.
- `Open custody chain` closes modal and routes to custody chain for selected delivery.
- `Report issue` passes safe context to issue creation without raw scan code.
- `Back to delivery` closes modal and returns to host delivery.
- `Open admin review` routes to manual custody exception or admin package detail.

Actions must not:
- Use `Ignore`.
- Use `Continue`.
- Use `Force`.
- Use `Approve anyway`.
- Use `Override`.
- Trigger mutation directly from this modal.

## Role Behavior
Station operator:
- See scan again, custody chain, report issue, back to delivery.
- Do not see bound delivery ID.
- Do not see package-label registry.
- If at wrong station, host should show station-scope block instead of this modal.

Driver:
- See scan again, custody chain, report issue, back to run.
- Do not see station registry details.
- Do not see other delivery assignment details.

Final-mile courier:
- See scan again, custody chain, report issue, back to assignment.
- Do not see other delivery details.
- Do not proceed to out-for-delivery.

Support:
- See custody chain, report issue, admin-safe review route if permissions allow.
- May see mismatch type but not raw scan code by default.

Admin:
- See admin review and custody chain.
- May see redacted binding summary.
- Full raw registry access belongs to package label registry screen, not this modal.

Sender and receiver:
- Must not see this modal.

## State Machine
`closed`:
- Modal is not rendered.
- No mismatch context is displayed.

`opening`:
- Host passes mismatch context.
- Focus moves to alert title.

`mismatch_detected`:
- Default state for `PACKAGE_SCAN_MISMATCH`.
- Custody lock strip is visible.

`unknown_scan_code`:
- Host identifies no label registry match when safe.
- Unknown-code explanation is shown.

`bound_to_other_delivery`:
- Host identifies other binding when safe.
- Field staff sees protected copy.
- Admin may see redacted binding summary.

`scan_value_hidden`:
- No scan-code preview is shown.

`scan_value_redacted`:
- Redacted preview is shown only if host policy permits.

`rescan_available`:
- Scan again action is enabled.

`custody_chain_available`:
- Custody chain action is enabled.

`issue_route_available`:
- Report issue action is enabled.

`admin_review_available`:
- Admin review action is enabled.

`support_route_available`:
- Support route action is enabled.

`offline_context`:
- Mismatch came from queued action sync or offline recovery.

`stale_context`:
- Host delivery data is stale.
- Refresh guidance is shown.

`submitting_issue_context`:
- Host is preparing issue creation context.
- Buttons lock except safe close if host permits.

`issue_context_created`:
- Host routes to issue screen.

`network_error`:
- Issue-context handoff or refresh failed.
- Mismatch remains visible.

`closing`:
- Modal closes and returns to safe host route.

## Data Contract
Component props:
- `isOpen: boolean`
- `deliveryId: string`
- `deliveryReference: string`
- `scanIntent: ScanPackageIntent`
- `actorRole: "station_operator" | "driver" | "final_mile_courier" | "support" | "admin" | string`
- `currentStatus: DeliveryStatus`
- `currentCustodyLabel?: string`
- `nextRequiredActorLabel?: string`
- `mismatchType: "unknown_scan_code" | "bound_to_other_delivery" | "wrong_visible_package" | "offline_replay_mismatch" | "admin_review_mismatch" | "unspecified"`
- `severity: "low_recovery" | "operational_blocker" | "investigation_required" | "offline_conflict"`
- `redactedScanCode?: string`
- `canShowRedactedScanCode: boolean`
- `canRescan: boolean`
- `canOpenCustodyChain: boolean`
- `canReportIssue: boolean`
- `canOpenAdminReview: boolean`
- `canOpenActionRecovery: boolean`
- `isOfflineReplay?: boolean`
- `isStale?: boolean`
- `onScanAgain: () => void`
- `onOpenCustodyChain: () => void`
- `onReportIssue: (context: WrongPackageIssueContext) => void`
- `onOpenAdminReview: () => void`
- `onOpenActionRecovery: () => void`
- `onClose: () => void`

Issue context:
- `deliveryId`
- `category=handoff`
- `severity` mapped by host
- `source=package_scan_mismatch`
- `scanIntent`
- `mismatchType`
- `currentStatus`
- `currentCustodyLabel`

Never pass to issue context from this modal:
- raw scan code
- bound delivery ID
- other tracking code
- actor IDs
- raw backend metadata
- stack trace

## Redaction Rules
Default:
- Hide scan code entirely.

If host permits redacted preview:
- Show only a redacted value.
- Use a format such as `PKG...481`.
- Do not allow copy.
- Do not expose in accessibility label beyond the visible redacted string.

Admin redaction:
- Admin may see `Bound to another delivery` without the other delivery ID in this modal.
- Admin can navigate to package label registry or manual custody exception if permissions allow.

Never:
- Show raw scan code to field staff.
- Show `boundDeliveryId` to field staff.
- Include raw scan code in telemetry.
- Include raw scan code in issue summary.
- Put raw scan code in route params.

## Offline Replay Behavior
When mismatch comes from offline queued action:
- Title remains `Wrong package scanned`.
- Body explains queued action was rejected on sync.
- Primary action should be `Open action recovery`.
- `Scan again` may be secondary if the package is still physically present.
- Custody lock strip must say the queued action did not complete.

Offline replay copy:
- `The queued scan did not match the delivery when it synced. Custody did not change.`

Offline replay actions:
- `Open action recovery`
- `Open custody chain`
- `Report issue`
- `Back to delivery`

Do not:
- Requeue the same scan automatically.
- Mark outbox item resolved without user action.
- Hide the failed queue record.

## Issue Creation Handoff
When user taps `Report issue`:
- Host opens `OpsIssueCreate` or role-specific support issue route.
- Preselect issue category `handoff` when supported.
- Include safe context only.
- Do not include raw scan code.
- Do not include bound delivery ID.
- Do not include other delivery details.

Suggested issue summary:
- `Package scan did not match selected delivery.`

Suggested issue severity:
- `high` for custody-moving handoff.
- `medium` for dispatch readiness.
- `high` for bound-to-other-delivery.
- `medium` for unknown scan code unless physical package is missing or wrong.

Issue route should ask staff to describe:
- package location
- who currently has the package
- whether label is damaged
- whether another package is present
- whether a supervisor is involved

## Admin Review Handoff
Admin review route may be:
- manual custody exception
- admin package detail
- package label registry view when implemented
- issue detail if an issue exists

Admin context should include:
- selected delivery ID
- scan intent
- mismatch type
- event time when available
- actor role
- current custody role
- safe link to custody chain

Admin context must not include:
- raw scan code unless the destination screen is authorized to reveal it.
- bound delivery ID unless the destination screen is authorized to reveal it.
- raw backend metadata in query params.

Admin copy:
- `Review custody evidence before changing package state.`

## Accessibility
Semantics:
- Use `role="alertdialog"` for web/admin when this blocks an action.
- Set `aria-modal="true"`.
- Label with the modal title.
- Describe with the mismatch explanation and custody lock strip.

Focus:
- On open, focus title.
- Primary action follows explanation in tab order.
- If user chooses report issue and issue context fails, focus the error message.
- On close, return focus to the scanner or action button that caused the mismatch.

Keyboard:
- Tab and Shift Tab stay inside modal.
- Escape closes only when host allows safe close.
- Enter activates focused button only.
- No keyboard shortcut should continue the blocked handoff.

Screen reader:
- Announce `Wrong package scanned`.
- Announce `Custody did not change`.
- Announce the current safe actions.
- Announce route changes after action selection.

Touch:
- Actions use large tap targets.
- Primary action is visually distinct.
- Backdrop tap may close only if host returns to safe blocked state.

Reduced motion:
- Avoid shake animation as the only mismatch signal.
- Use static icon, text, and color.

High contrast:
- Warning icon and text remain visible.
- Do not rely on red alone.
- Focus ring must be visible.

## Visual Design
Tone:
- serious
- calm
- direct
- non-accusatory

Color:
- Use danger for mismatch title or icon.
- Use caution for custody lock strip.
- Use neutral for delivery identity.
- Use success nowhere in this modal.

Typography:
- Title must be short and strong.
- Body must fit in one or two short paragraphs.
- Actions must use verbs.

Spacing:
- Keep title, lock strip, and actions close enough to scan quickly.
- Avoid dense metadata.
- Give custody lock strip enough space to stand out.

Iconography:
- Use warning or blocked package icon.
- Do not use checkmark.
- Do not use decorative illustration.

Motion:
- Modal can enter quickly.
- No celebratory movement.
- No continuous pulsing.
- No aggressive shaking.

## Copy System
Title:
- `Wrong package scanned`

Primary body:
- `This scan code does not match the selected delivery.`

Custody strip:
- `Custody did not change.`

Default guidance:
- `Scan the correct package or open an issue if the package in front of you appears wrong.`

Bound elsewhere:
- `This label appears to belong to another delivery record. Stop this handoff and investigate.`

Unknown:
- `This code is not registered for this delivery. Check the label and scan again.`

Offline replay:
- `The queued scan did not match when it synced. Custody did not change.`

Actions:
- `Scan again`
- `Open custody chain`
- `Report issue`
- `Back to delivery`
- `Open action recovery`
- `Open admin review`

Do not use:
- `Ignore`
- `Continue anyway`
- `Force handoff`
- `Override scan`
- `Accept package`
- `Approve`
- `Looks close`

## Error Handling Inside The Modal
Issue route failure:
- Title: `Issue route unavailable`
- Body: `The mismatch is still blocked. Try again or open custody chain.`
- Actions: `Try again`, `Open custody chain`, `Back to delivery`

Custody chain route failure:
- Title: `Custody chain unavailable`
- Body: `The mismatch is still blocked. Try again or report an issue.`
- Actions: `Try again`, `Report issue`, `Back to delivery`

Admin review route failure:
- Title: `Admin review unavailable`
- Body: `The mismatch is still blocked. Open custody chain or try again.`

Network failure:
- Title: `Connection lost`
- Body: `Kra could not open the recovery route. The handoff is still blocked.`

Error rules:
- Never replace mismatch copy with a route failure alone.
- Always keep custody unchanged message visible.
- Do not retry route action automatically.
- Do not clear mismatch context until the user leaves the modal or host route.

## Telemetry
Events:
- `wrong_package_scanned_modal_opened`
- `wrong_package_scanned_rescan_tapped`
- `wrong_package_scanned_custody_chain_tapped`
- `wrong_package_scanned_issue_tapped`
- `wrong_package_scanned_admin_review_tapped`
- `wrong_package_scanned_closed`
- `package_scan_failed`

Required properties:
- `deliveryId`
- `actorRole`
- `scanIntent`
- `currentStatus`
- `mismatchType`
- `severity`
- `source`
- `isOfflineReplay`

Never include:
- raw scan code
- redacted scan code if avoidable
- bound delivery ID
- other tracking code
- receiver phone
- full address
- internal actor ID
- raw backend metadata

Analytics rules:
- Emit open once per mismatch display.
- Emit action event only after user action.
- Emit no success event from this modal.
- Let host scan flow emit later success if a rescan succeeds.

## Security And Privacy
Security requirements:
- This modal must not expose cross-delivery label binding to unauthorized field roles.
- This modal must not enable bypass of label registry mismatch.
- This modal must not turn mismatch into manual fallback approval.
- This modal must not write scan values to logs or analytics.
- This modal must not include raw backend metadata in route params.

Privacy requirements:
- Hide receiver details not already visible in the host.
- Hide full package scan code.
- Hide other delivery identity.
- Hide staff actor IDs.
- Hide registry internals.

Operational safety:
- The last confirmed custodian remains accountable.
- The next handoff remains blocked.
- Any issue route must make current package location clear.
- Admin review should preserve evidence hierarchy.

## QA Acceptance Criteria
Core:
- Modal opens on `PACKAGE_SCAN_MISMATCH`.
- Modal title is `Wrong package scanned`.
- Custody lock strip says custody did not change.
- Primary action is `Scan again` when rescan is available.
- Raw scan code does not render.
- Bound delivery ID does not render for field staff.
- Mismatch blocks handoff progress.
- Close returns to a safe blocked scanner or host state.

Role:
- Station operator sees scan again, custody chain, report issue, back to delivery.
- Driver sees scan again, custody chain, report issue, back to run.
- Courier sees scan again, custody chain, report issue, back to assignment.
- Admin can see admin review action when permission allows.
- Sender and receiver cannot open this modal.

Mismatch types:
- Unknown scan code shows unknown copy.
- Bound-to-other-delivery shows investigation copy without exposing other ID.
- Offline replay shows action recovery copy.
- Admin review shows evidence review copy.

Actions:
- Scan again reopens scanner.
- Open custody chain routes to selected delivery custody chain.
- Report issue opens issue creation with safe context.
- Admin review routes only when allowed.
- Back to delivery does not submit anything.

Accessibility:
- Alert dialog has accessible title and description.
- Focus starts on title.
- Screen reader hears custody did not change.
- Tab order is contained.
- Escape does not continue the handoff.
- Touch targets are large enough.
- High contrast and reduced motion are supported.

Privacy:
- No raw scan code in DOM text.
- No raw scan code in telemetry.
- No bound delivery ID for field staff.
- No receiver phone, address, provider reference, or actor ID leaks.

## E2E Scenarios
`e2e-station-scan-wrong-package`:
- Open station scan flow.
- Submit code that backend rejects with `PACKAGE_SCAN_MISMATCH`.
- Modal opens.
- Custody did not change is visible.
- User taps scan again.
- Scanner reopens.

`e2e-driver-pickup-wrong-package-report-issue`:
- Open driver pickup scan.
- Backend returns package mismatch.
- Modal opens.
- User taps report issue.
- Issue route opens with handoff category and safe context.
- No raw scan code appears.

`e2e-courier-accept-bound-other-delivery`:
- Courier scans package bound elsewhere.
- Modal shows investigation copy.
- Courier cannot accept custody.
- Custody chain action is available.

`e2e-offline-replay-mismatch`:
- Queued scan sync fails with package mismatch.
- Modal opens from action recovery.
- Primary action is open action recovery.
- Custody did not change remains visible.

`e2e-admin-mismatch-review`:
- Admin opens mismatch from package detail.
- Modal shows admin review action.
- Raw scan code is still hidden in modal.
- Admin can route to authorized review surface.

## Unit Test Coverage
Rendering tests:
- Default mismatch renders title and custody lock.
- Unknown mismatch renders unknown copy.
- Bound-other mismatch renders protected copy.
- Offline replay renders action recovery copy.
- Admin review renders admin copy.

Action tests:
- Scan again calls `onScanAgain`.
- Custody chain calls `onOpenCustodyChain`.
- Report issue passes safe issue context.
- Admin review hidden when not allowed.
- Close calls `onClose`.

Privacy tests:
- Raw scan code prop is never rendered if accidentally passed through host context.
- Bound delivery ID is never rendered for field roles.
- Telemetry payload omits raw code and bound delivery ID.
- Issue context omits raw code and bound delivery ID.

Accessibility tests:
- Uses `alertdialog` semantics on web/admin.
- Title and description are connected.
- Focus starts on title.
- Focus returns to invoking control.
- Status text is announced.

State tests:
- Mismatch blocks continue action.
- Route failure keeps mismatch visible.
- Offline replay shows action recovery.
- Stale context shows refresh guidance.

## Design Review Checklist
Before closing implementation:
- The modal cannot be mistaken for a warning that allows progress.
- The first visible message says custody did not change.
- Field staff cannot see the other delivery ID.
- Raw scan code is never displayed by default.
- The user has a fast rescan path.
- The user has an escalation path.
- Offline replay mismatch routes to action recovery.
- Admin review is available only with permission.
- Accessibility covers alert, focus, status, and touch.
- Telemetry excludes sensitive data.
- All required test IDs exist.

## Test IDs
Root:
- `modal-wrong-package-scanned`

Header:
- `wrong-package-title`
- `wrong-package-subtitle`
- `wrong-package-close`

Status:
- `wrong-package-custody-lock`
- `wrong-package-explanation`
- `wrong-package-delivery-reference`
- `wrong-package-scan-intent`
- `wrong-package-current-status`
- `wrong-package-current-custody`
- `wrong-package-mismatch-type`

Actions:
- `wrong-package-scan-again`
- `wrong-package-open-custody-chain`
- `wrong-package-report-issue`
- `wrong-package-back-to-delivery`
- `wrong-package-open-action-recovery`
- `wrong-package-open-admin-review`

Errors:
- `wrong-package-route-error`
- `wrong-package-network-error`
- `wrong-package-stale-context`

Admin:
- `wrong-package-admin-summary`
- `wrong-package-admin-review-action`

## Implementation Handoff
Claude Code should build `WrongPackageScannedModal` as the dedicated `PACKAGE_SCAN_MISMATCH` recovery modal. It must block all handoff progress, show that custody did not change, keep raw scan code and bound delivery identity hidden, offer scan-again and escalation actions, pass only safe context into issue creation, support offline replay recovery, expose admin review only when authorized, and use alert-dialog accessibility behavior for a high-priority custody blocker.


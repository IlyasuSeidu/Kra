# Payment Provider Return Screen Spec

## Screen Contract
| Field | Value |
| --- | --- |
| Screen ID | `PaymentProviderReturn` |
| App | `apps/mobile` |
| Route | `/(sender)/payments/:deliveryId/provider-return` |
| Primary test ID | `screen-payment-provider-return` |
| Source inventory | `docs/05-design/frontend-screen-inventory.md` |
| Build priority | `P0 Launch Critical` |
| Backend dependency | `verify_payment`, `paymentVerifyRequestSchema`, `paymentVerifyResponseSchema`, payment reconciliation policy, provider-return allowlist |
| Related routes | `/(sender)/payments/:deliveryId/method`, `/(sender)/payments/:deliveryId/processing`, `/(sender)/payments/:deliveryId/result`, `/(sender)/payments/:deliveryId/recover`, `/(sender)/deliveries/:deliveryId`, `/(sender)/home` |
| Required states | `loading`, `normalizing_return`, `verifying`, `confirmed`, `failed`, `review`, `pending`, `return_missing_context`, `return_context_mismatch`, `return_untrusted_source`, `verification_error`, `provider_return_timeout`, `delivery_not_found`, `not_authorized`, `offline`, `duplicate_return`, `app_resumed` |

## Product Job
This screen receives the sender after a payment provider redirects, deep-links, or hands the user back to Kra. Its job is to normalize that return event, prove the payment belongs to the current sender and delivery, verify the payment with Kra backend, and route to the correct next screen.

The sender should be able to:
- See that they are back in Kra after provider authorization.
- Understand Kra is checking the payment before any delivery movement.
- Avoid duplicate payment attempts while the return is being verified.
- Reach the confirmed, failed, or under-review result without guessing.
- Recover if the return URL is missing required delivery context.
- Continue from app resume or external browser return without losing status.
- Leave safely if the provider return cannot be trusted.

This screen is not payment method selection, payment initialization, live waiting, receipt display, failed-payment retry, refund handling, support chat, finance reconciliation admin, or delivery tracking detail.

## Audience
Primary audience:
- Authenticated senders returning from provider authorization.
- Senders whose browser, provider app, USSD surface, or app switch brings them back to Kra.
- Senders on unstable mobile networks where external return and backend callbacks may arrive in different order.
- Senders who need reassurance that they will not be charged twice.

Secondary audience:
- Claude Code implementing deep-link and route handling.
- QA engineers testing app-link, browser-return, and provider-delay paths.
- Support teams explaining why return to app is not the same as payment confirmation.
- Payment and finance operators validating return-state wording.

## User State
The sender was outside the normal Kra screen flow or returning from an external payment step. They may have approved a payment, cancelled the provider surface, closed the browser, switched apps, or opened a link from notification history.

The sender may be:
- Unsure if payment completed.
- Concerned the app will charge again.
- Returning after approving a provider prompt.
- Returning after cancelling provider authorization.
- Back in the app before provider callback reaches Kra.
- Offline or on a poor connection after leaving the provider surface.
- Opening a stale provider return link.

The screen must:
- Treat the return event as unverified input.
- Parse only the allowlisted route and query fields.
- Never trust provider query status as final payment truth.
- Call `verify_payment` before showing final success or failure.
- Route confirmed and failed outcomes to `PaymentResult` or recovery according to policy.
- Show under-review if verification remains pending beyond reconciliation guidance.
- Avoid leaking raw provider query values in visible UI, logs, or analytics.

## Primary Action
Primary action changes by state:
- Normalizing: no manual action.
- Verifying: `Checking payment`
- Pending: `Check status`
- Confirmed: `View result`
- Failed: `Recover payment`
- Review: `View review status`
- Missing context: `Return to payment`
- Context mismatch: `View delivery`
- Untrusted source: `Open delivery`
- Offline: `Try again when online`
- Verification error: `Try again`

Secondary actions:
- `View delivery`
- `Go home`
- `Contact support`

CTA behavior:
- `Check status` calls `verify_payment`.
- `View result` routes to `/(sender)/payments/:deliveryId/result`.
- `Recover payment` routes to `/(sender)/payments/:deliveryId/recover`.
- `View review status` routes to `/(sender)/payments/:deliveryId/result` with review context.
- `Return to payment` routes to `/(sender)/payments/:deliveryId/method` only when there is no verified active payment reference.
- `View delivery` routes to `/(sender)/deliveries/:deliveryId`.
- `Go home` routes to `/(sender)/home`.
- `Contact support` opens the authenticated support entry with payment return context.

CTA disabled conditions:
- Verification is in flight.
- Device is offline and action requires backend.
- `deliveryId` is missing or invalid.
- Return source is rejected and user ownership is not yet proven.

## First Meaningful Value
First meaningful value is reached when the sender sees:
- They have returned to Kra.
- The delivery ID being checked.
- The provider return is not treated as final proof.
- Kra is verifying payment with the backend.
- No new payment will be started from this screen.

The screen creates value by:
- Turning a fragile external handoff into a controlled internal checkpoint.
- Preventing false payment success.
- Avoiding duplicate charges from anxious repeated taps.
- Giving clear recovery paths when the return URL is incomplete or stale.
- Preserving trust during provider callback delay.

## Main Tension
External payment returns feel like completion to users, but they are not authoritative. The screen must acknowledge the user is back from the provider while refusing to call the payment confirmed until Kra verification says so.

The screen must balance:
- Speed against correctness.
- Reassurance against overclaiming.
- Automatic routing against user orientation.
- Security strictness against recoverability.
- Provider uncertainty against a calm mobile experience.

## Design Brief
User and job:
- An authenticated sender has returned to Kra from a provider surface and needs payment truth.

Context of use:
- Financial, cross-app, interruption-prone, security-sensitive mobile return flow.

Entry point:
- Deep link, universal link, Android App Link, in-app browser return, external browser return, app resume, or provider callback redirect.

Success state:
- Kra verifies payment and routes the sender to the correct result state.

Primary action:
- Verify current payment status with Kra backend.

Navigation model:
- Payment flow return checkpoint between provider and result.

Density:
- Minimal: one return status, one verification rail, one safe action.

Visual thesis:
- A secure return checkpoint: provider energy at the edge, Kra verification at the center, final outcome only after proof.

Restraint rule:
- Avoid receipt access, retry-payment controls, raw provider fields, provider dashboards, celebratory graphics, and delivery operations.

Product lens:
- Trust-critical external-to-internal handoff.

System stance:
- Native app return screen with strict data handling and predictable route transitions.

Interaction thesis:
- The sender should feel they are not lost, not being charged again, and not yet marked paid until Kra checks.

Signature move:
- A two-lock verification rail: `Returned to Kra` then `Verified by Kra`.

Activation event:
- `verify_payment` returns `confirmed`, `failed`, or still `pending`.

## Elite Quality Gate
This spec is not closed unless the screen makes provider return safe, clear, and non-final.

Non-negotiable quality requirements:
- First viewport must say Kra is checking payment.
- First viewport must identify the delivery being verified.
- Provider return status must never be shown as final payment truth.
- The screen must call `verify_payment`.
- The screen must not call `initialize_payment`.
- The screen must not call `create_delivery`.
- The screen must not show receipt actions.
- The screen must not show retry payment action.
- Confirmed outcome must route to `PaymentResult`.
- Failed outcome must route to recovery or failed result according to current routing policy.
- Pending beyond policy threshold must route to review result.
- Missing or mismatched context must never verify the wrong delivery.
- Raw query values must not be shown or logged.
- The screen must support screen reader, large text, high contrast, reduced motion, and small phones.

Closure rule:
- If provider query status can make the screen show confirmed, the screen remains open.
- If a return URL can verify a different sender's delivery, the screen remains open.
- If a duplicate return can start another payment, the screen remains open.
- If pending state looks like payment success, the screen remains open.
- If the sender has no safe route after return failure, the screen remains open.

## Inspiration And Context Inputs
Use these sources as product and UX context, not as copy, layout, branding, source code, or visual assets to copy:

- Expo linking documentation explains incoming URL handling and recommends universal or app links for most production apps.
- Android App Links documentation defines domain verification expectations for HTTP and HTTPS links.
- Apple universal link guidance requires associated-domain discipline and testing for link behavior.
- Paystack transaction documentation separates callback URL return from server-side transaction verification.
- MTN MoMo callback documentation describes asynchronous payment processing and polling transaction status if callback is not received.
- Kra payment policy says failed payments block dispatch, confirmed payments surface receipts, and unresolved payments show under-review guidance.
- Kra API contracts define `paymentVerifyRequestSchema` and `paymentVerifyResponseSchema`.

Reference links:
- https://docs.expo.dev/linking/into-your-app/
- https://docs.expo.dev/versions/latest/sdk/linking/
- https://developer.android.com/training/app-links/verify-applinks
- https://developer.apple.com/documentation/Technotes/tn3155-debugging-universal-links
- https://developer.apple.com/documentation/xcode/supporting-associated-domains
- https://paystack.com/docs/api/transaction/
- https://momoapi.mtn.com/content/html_widgets/kod41.html
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `packages/shared/src/contracts/api.ts`
- `services/api/src/payments.ts`

## Product Assumptions
Assumptions for v1:
- MTN MoMo remains the only enabled pilot payment provider.
- This route exists to normalize provider return, app resume, and future redirect-provider flows.
- Provider return query data is not authoritative.
- Backend verification is authoritative.
- `verify_payment` accepts `deliveryId`.
- `verify_payment` returns `paymentId`, `deliveryId`, `provider`, `paymentStatus`, `providerReference`, and `verificationCheckedAt`.
- `paymentStatus` can be `pending`, `confirmed`, or `failed`.
- `review` is a user-facing state derived from long unresolved pending status or future reconciliation flags.
- Local payment context may include `paymentId`, `providerReference`, provider name, created time, return attempt count, and last verification response.
- Return URL may include provider reference, status hint, or opaque provider data.
- Opaque provider data must not be shown in the UI.
- Provider callbacks may arrive before, during, or after the sender returns.
- A duplicate return event can happen from browser refresh, notification tap, or app resume.

Non-assumptions:
- Do not assume provider return means payment was approved.
- Do not assume provider return means payment failed.
- Do not assume query `status` is trustworthy.
- Do not assume local payment context is fresh.
- Do not assume universal links always open the app.
- Do not assume user stayed authenticated while outside the app.

## Backend Contract
Primary dependency:
- `verify_payment`

Request schema:
- `paymentVerifyRequestSchema`

Request fields:
- `deliveryId`

Response schema:
- `paymentVerifyResponseSchema`

Response fields:
- `paymentId`
- `deliveryId`
- `provider`
- `paymentStatus`
- `providerReference`
- `verificationCheckedAt`

Payment status mapping:
- `confirmed` maps to verified confirmed.
- `failed` maps to verified failed.
- `pending` maps to pending or review according to elapsed time and reconciliation policy.

Forbidden API calls:
- `initialize_payment`
- `create_delivery`
- `refund_payment`
- `dispatch_delivery`
- Provider-specific verify endpoints from client code.

Backend truth rule:
- The return route can only use route and query values to locate the delivery context.
- The payment outcome must come from Kra backend verification.

## Route And Link Contract
Canonical route:
- `/(sender)/payments/:deliveryId/provider-return`

Canonical web fallback path:
- `/payments/:deliveryId/provider-return`

Accepted scheme families:
- Kra production universal link domain.
- Kra Android App Link domain.
- Kra configured native app scheme.

Accepted route fields:
- `deliveryId` from route path.
- Optional `paymentId` query only for local context matching.
- Optional `providerReference` query only for local context matching.
- Optional `provider` query only for allowlist matching.
- Optional `returnSource` query only for analytics classification.
- Optional `statusHint` query only for non-authoritative diagnostics.
- Optional `attempt` query only for duplicate-return detection.

Rejected route fields:
- Any `amount` query that attempts to override locked amount.
- Any `payerPhone` query that attempts to override payment phone.
- Any `receiverPhone` query.
- Any redirect URL.
- Any arbitrary next route.
- Any token-shaped query value in visible UI.

URL handling rules:
- Parse URL once.
- Validate path delivery ID format before any network call.
- Compare query `deliveryId` if present against path `deliveryId`.
- Drop unknown query fields from in-memory state.
- Never persist full raw URL.
- Never log full raw URL.
- Never use query `statusHint` to set final state.
- Remove query values from navigation history after normalization when platform allows.

## State Model
State names:
- `loading`
- `normalizing_return`
- `verifying`
- `confirmed`
- `failed`
- `review`
- `pending`
- `return_missing_context`
- `return_context_mismatch`
- `return_untrusted_source`
- `verification_error`
- `provider_return_timeout`
- `delivery_not_found`
- `not_authorized`
- `offline`
- `duplicate_return`
- `app_resumed`

Initial state:
- `loading`

State derivation:
- Missing route delivery ID maps to `return_missing_context`.
- Invalid delivery ID format maps to `return_missing_context`.
- Query delivery ID mismatch maps to `return_context_mismatch`.
- Unrecognized link host or scheme maps to `return_untrusted_source`.
- Valid route context maps to `normalizing_return`.
- Normalized context maps to `verifying`.
- `verify_payment` confirmed maps to `confirmed`.
- `verify_payment` failed maps to `failed`.
- `verify_payment` pending before review threshold maps to `pending`.
- `verify_payment` pending after review threshold maps to `review`.
- Backend not found maps to `delivery_not_found`.
- Backend forbidden maps to `not_authorized`.
- Network unavailable maps to `offline`.
- Request timeout maps to `provider_return_timeout`.
- Recoverable API failure maps to `verification_error`.

State persistence:
- Persist return attempt timestamp.
- Persist normalized delivery ID.
- Persist last verification response.
- Persist last route decision.
- Persist return attempt count per delivery.
- Do not persist raw URL.
- Do not persist unknown query fields.

## Information Architecture
Screen sections in order:
1. Return status header.
2. Verification rail.
3. Delivery proof strip.
4. Safe waiting or recovery panel.
5. Action bar.
6. Technical reassurance microcopy.

Content hierarchy:
- Page title: what is happening now.
- Status phrase: whether Kra is checking, verified, delayed, or blocked.
- Delivery proof: delivery ID and provider only.
- Instruction: what the sender should do now.
- Action: one safe next move.

What stays above the fold:
- Return acknowledgement.
- Verification status.
- Delivery ID.
- Primary safe action or waiting state.

What stays below the fold:
- Details of why provider return is not final.
- Support route.
- Diagnostic references.
- Timeline of return and verification attempts.

## Visual Direction
Visual thesis:
- A calm security checkpoint, not a celebration.

Mood:
- Controlled.
- Clear.
- Financially serious.
- Native.
- Fast.

Material language:
- Deep graphite background in the top status area.
- Warm cream page surface.
- Electric green used only for verified confirmed.
- Amber used for pending and review.
- Red-orange used for failed or blocked return.
- Thin verification rail with lock icons.

Typography:
- Use a confident editorial display face for the main status if the app design system allows.
- Use a highly legible body face for numeric IDs and payment details.
- Keep route IDs in tabular numerals.
- Avoid long paragraphs in the first viewport.

Spacing:
- Top safe area has generous space.
- The verification rail has compact vertical rhythm.
- The action bar is sticky and thumb reachable.
- Details below the fold can use tighter rows.

Motion:
- Loading state uses a restrained pulse on the active verification step.
- Successful verification transitions once into the confirmed state and routes after a short readable pause.
- Failed and review states use no celebration.
- Reduced motion replaces transitions with instant state changes and visible status text.

## Layout Specification
Mobile portrait layout:
- Full-screen route.
- Safe-area-aware header.
- Scrollable content.
- Sticky bottom action area.
- Single-column structure.

Top region:
- 24 px horizontal padding.
- 20 px top padding below safe area.
- Header height adapts to text scale.
- Background uses a subtle secure gradient.

Return status header:
- Eyebrow: `Returned to Kra`
- Title by state.
- Body by state.
- Provider chip if known.
- Delivery ID text if valid.

Verification rail:
- Step 1: `Return received`
- Step 2: `Checking with Kra`
- Step 3: `Next step`

Delivery proof strip:
- Delivery ID.
- Provider.
- Last checked time.
- Payment ID if known.

Safe panel:
- Explains exactly why the current action is safe.
- Shows no raw provider fields.
- Uses one icon and one heading only.

Action bar:
- Primary button full width.
- Secondary text action below or beside on larger mobile width.
- Loading button text remains stable.

## Component Structure
Root component:
- `PaymentProviderReturnScreen`

Child components:
- `ProviderReturnHeader`
- `ProviderReturnVerificationRail`
- `ProviderReturnDeliveryProof`
- `ProviderReturnSafetyPanel`
- `ProviderReturnActionBar`
- `ProviderReturnOfflinePanel`
- `ProviderReturnBlockedPanel`
- `ProviderReturnSupportLink`
- `ProviderReturnDiagnostics`

Component responsibilities:
- `PaymentProviderReturnScreen` owns route parsing, state transitions, and navigation.
- `ProviderReturnHeader` owns state title, summary, and provider chip.
- `ProviderReturnVerificationRail` owns progress semantics.
- `ProviderReturnDeliveryProof` shows only safe identifiers.
- `ProviderReturnSafetyPanel` explains the current safe action.
- `ProviderReturnActionBar` renders state-specific CTAs.
- `ProviderReturnOfflinePanel` handles offline recovery.
- `ProviderReturnBlockedPanel` handles invalid or untrusted return.
- `ProviderReturnSupportLink` opens support with safe context.
- `ProviderReturnDiagnostics` is hidden behind detail disclosure for support-safe IDs only.

Forbidden component behavior:
- No component starts payment.
- No component creates delivery.
- No component displays raw return URL.
- No component shows receipt CTA.
- No component routes directly to dispatch.
- No component trusts query `statusHint`.

## Test IDs
Screen:
- `screen-payment-provider-return`

Header:
- `provider-return-header`
- `provider-return-eyebrow`
- `provider-return-title`
- `provider-return-body`
- `provider-return-provider-chip`

Verification:
- `provider-return-rail`
- `provider-return-step-received`
- `provider-return-step-verifying`
- `provider-return-step-next`
- `provider-return-loading-indicator`

Proof:
- `provider-return-proof`
- `provider-return-delivery-id`
- `provider-return-payment-id`
- `provider-return-provider`
- `provider-return-last-checked`

Actions:
- `provider-return-primary-action`
- `provider-return-secondary-action`
- `provider-return-support-action`
- `provider-return-close-action`

States:
- `provider-return-loading`
- `provider-return-normalizing`
- `provider-return-verifying`
- `provider-return-confirmed`
- `provider-return-failed`
- `provider-return-review`
- `provider-return-pending`
- `provider-return-missing-context`
- `provider-return-context-mismatch`
- `provider-return-untrusted-source`
- `provider-return-verification-error`
- `provider-return-timeout`
- `provider-return-not-found`
- `provider-return-not-authorized`
- `provider-return-offline`
- `provider-return-duplicate`
- `provider-return-app-resumed`

## Interaction Flow
Default provider return:
1. User opens provider return route.
2. Screen validates route path.
3. Screen normalizes accepted query fields.
4. Screen proves sender session is active.
5. Screen calls `verify_payment`.
6. Screen maps response to confirmed, failed, pending, or review.
7. Screen routes to the correct next screen.

Confirmed return:
1. `verify_payment` returns `confirmed`.
2. Screen announces `Payment verified`.
3. Screen persists verification response.
4. Screen routes to `/(sender)/payments/:deliveryId/result`.
5. PaymentResult shows receipt CTA.

Failed return:
1. `verify_payment` returns `failed`.
2. Screen announces `Payment could not be verified`.
3. Screen persists response.
4. Screen routes to `/(sender)/payments/:deliveryId/recover` or result failed state according to current navigation decision.

Pending return:
1. `verify_payment` returns `pending`.
2. Screen checks elapsed time from payment initialization.
3. If within normal window, show pending with `Check status`.
4. If beyond policy threshold, route to review result.

Missing context:
1. Route lacks valid `deliveryId`.
2. Do not call `verify_payment`.
3. Show blocked-return state.
4. Let sender go home, return to payment, or contact support.

Context mismatch:
1. Path delivery ID and query delivery ID disagree.
2. Do not call `verify_payment`.
3. Show context mismatch state.
4. Route only to safe delivery lookup or support.

Untrusted source:
1. Link host or scheme is not allowlisted.
2. Do not trust query fields.
3. Validate route-owned delivery ID if available.
4. If ownership can be proven by authenticated delivery fetch, allow manual verify.
5. Otherwise block and route to home or support.

Offline return:
1. Network is unavailable.
2. Preserve normalized context.
3. Show offline state.
4. Retry automatically when connectivity returns if user remains on screen.
5. Do not mark failed.

Duplicate return:
1. Same normalized return is opened again.
2. If a verification call is already in flight, do not start another.
3. If final response exists and is fresh, route using stored result.
4. If stale, call `verify_payment` once.

## State Copy
Loading:
- Eyebrow: `Payment return`
- Title: `Opening payment check`
- Body: `Kra is preparing to verify this payment.`

Normalizing:
- Eyebrow: `Returned to Kra`
- Title: `Securing the return`
- Body: `We are checking that this payment return matches your delivery.`

Verifying:
- Eyebrow: `Returned to Kra`
- Title: `Checking payment with Kra`
- Body: `Provider return is not final yet. Kra is verifying the payment before the delivery can move.`
- Button: `Checking payment`

Confirmed:
- Eyebrow: `Payment verified`
- Title: `Payment checked`
- Body: `Kra verified this payment. Opening the result now.`
- Primary: `View result`

Failed:
- Eyebrow: `Payment not verified`
- Title: `Payment needs recovery`
- Body: `Kra could not confirm this payment. Recovery keeps the delivery from moving unpaid.`
- Primary: `Recover payment`
- Secondary: `View delivery`

Review:
- Eyebrow: `Payment under review`
- Title: `Kra is still reconciling`
- Body: `The provider return did not settle clearly. Dispatch waits while Kra reviews the payment.`
- Primary: `View review status`
- Secondary: `Go home`

Pending:
- Eyebrow: `Still checking`
- Title: `Payment is not final yet`
- Body: `The provider has not returned a final result to Kra. You can check again without starting another payment.`
- Primary: `Check status`
- Secondary: `View delivery`

Missing context:
- Eyebrow: `Return incomplete`
- Title: `We cannot identify this delivery`
- Body: `This payment return does not include a valid Kra delivery ID.`
- Primary: `Return to payment`
- Secondary: `Go home`

Context mismatch:
- Eyebrow: `Return blocked`
- Title: `Delivery details do not match`
- Body: `The return link points to conflicting delivery details, so Kra will not verify it from here.`
- Primary: `View delivery`
- Secondary: `Contact support`

Untrusted source:
- Eyebrow: `Return blocked`
- Title: `Kra cannot trust this return`
- Body: `Open the delivery from Kra so the payment can be checked safely.`
- Primary: `Open delivery`
- Secondary: `Contact support`

Verification error:
- Eyebrow: `Check interrupted`
- Title: `Kra could not check payment`
- Body: `Your return was received, but the verification request did not complete.`
- Primary: `Try again`
- Secondary: `View delivery`

Provider return timeout:
- Eyebrow: `Still waiting`
- Title: `Provider return is taking longer`
- Body: `Kra has not received a final provider result yet. You can check again without starting another payment.`
- Primary: `Check status`
- Secondary: `View delivery`

Not found:
- Eyebrow: `Delivery not found`
- Title: `We cannot find this delivery`
- Body: `This return does not match an active Kra delivery for your account.`
- Primary: `Go home`
- Secondary: `Contact support`

Not authorized:
- Eyebrow: `Access blocked`
- Title: `This delivery is not on your account`
- Body: `Kra cannot verify payment for a delivery you do not own.`
- Primary: `Go home`
- Secondary: `Contact support`

Offline:
- Eyebrow: `Offline`
- Title: `Reconnect to check payment`
- Body: `Kra needs a connection to verify this payment. No new payment will be started.`
- Primary: `Try again when online`
- Secondary: `View delivery`

Duplicate return:
- Eyebrow: `Return already received`
- Title: `Using the latest check`
- Body: `Kra already received this payment return and is using the latest verification result.`
- Primary: `Continue`

App resumed:
- Eyebrow: `Back in Kra`
- Title: `Continuing payment check`
- Body: `Kra is resuming the payment verification from where you left off.`

## Copy Rules
Use:
- `returned`
- `checking`
- `verified`
- `not verified`
- `under review`
- `no new payment will be started`
- `Kra verifies before dispatch`

Do not use:
- `success` before backend confirmation.
- `paid` before backend confirmation.
- `approved` from provider return alone.
- `try payment again` on this screen.
- `receipt` on this screen.
- `dispatch now` on this screen.
- Any language that treats browser return as payment truth.

Tone:
- Calm.
- Direct.
- Financially precise.
- Short enough for interrupted mobile use.

## Navigation Rules
Auto-routing:
- Confirmed may auto-route to PaymentResult after a 700 to 1200 ms readable pause.
- Failed may auto-route to PaymentFailedRecovery after a readable pause if product policy chooses direct recovery.
- Review may auto-route to PaymentResult with review context.
- Pending should not auto-route unless PaymentProcessing owns continued waiting.

Manual routing:
- The sender can tap primary action if auto-routing is disabled or slow.
- The sender can view delivery from failed, review, pending, error, and offline states.
- The sender can go home from blocked states.

Back behavior:
- Hardware back from verifying should return to PaymentProcessing or PaymentMethod only if no verification call is in flight.
- Hardware back from confirmed during auto-route should be disabled or should finish route transition.
- Hardware back from blocked states can go to home.
- Back must never reopen external provider surface.

Navigation stack hygiene:
- Replace route after confirmed, failed, or review decision.
- Do not keep raw provider-return URL in back stack.
- Do not push duplicate ProviderReturn screens.

## Data Handling Rules
Safe to display:
- Delivery ID.
- Provider display name.
- Last checked time.
- Payment ID if already known from Kra backend.

Not safe to display:
- Full return URL.
- Query string.
- Any raw provider token.
- Any authorization code.
- Any phone number from query.
- Any payer or receiver phone from provider return.
- Any redirect URL.

Safe analytics fields:
- `deliveryIdPresent`
- `providerKnown`
- `returnSource`
- `normalized`
- `verificationOutcome`
- `duplicateReturn`
- `elapsedBucket`

Unsafe analytics fields:
- Raw URL.
- Raw query.
- Provider token.
- Phone number.
- Full user agent.
- Browser referrer containing query data.

## Security And Fraud Controls
Route validation:
- Validate `deliveryId` against Kra delivery ID format.
- Reject mismatched query delivery ID.
- Reject unknown schemes or hosts.
- Reject redirect parameters.
- Reject external next-route parameters.

Provider status handling:
- Treat `statusHint` as diagnostic only.
- Do not render provider status as final.
- Do not send provider status directly to backend as truth.
- Do not make dispatch decisions from provider return.

Ownership:
- Verify sender authentication before backend verification.
- Backend must enforce ownership.
- If token expired, route to sign-in and restore normalized context after auth.

Duplicate control:
- Use in-flight request guard.
- Use delivery-scoped return fingerprint.
- Use verification cooldown after manual check.
- Use last verified response if fresh.

Fraud resistance:
- Do not expose support-sensitive details to unauthenticated users.
- Do not reveal whether another sender owns the delivery.
- Do not accept payment phone from return URL.
- Do not accept amount from return URL.
- Do not accept destination route from return URL.

## Error Handling
Invalid delivery ID:
- State: `return_missing_context`
- Action: `Return to payment`
- Do not verify.

Mismatched delivery ID:
- State: `return_context_mismatch`
- Action: `View delivery`
- Do not verify until authenticated delivery context is fetched.

Untrusted host:
- State: `return_untrusted_source`
- Action: `Open delivery`
- Do not trust query fields.

Expired session:
- Route to sender sign-in.
- Restore normalized delivery ID after sign-in.
- Drop raw URL.

Backend validation error:
- Show verification error.
- Let user return to payment if no active payment exists.
- Otherwise let user view delivery.

Backend timeout:
- Show provider return timeout.
- Allow manual `Check status`.
- Do not mark failed.

Network offline:
- Show offline state.
- Preserve context.
- Retry when online.

Rate limited:
- Show cooldown copy.
- Disable check button until cooldown ends.
- Keep delivery link available.

## Accessibility Requirements
Screen reader:
- Announce state changes with polite live region.
- Use assertive announcement only for confirmed, failed, review, and blocked states.
- Each verification rail step must have text label.
- Provider chip must include accessible provider name.
- Loading indicator must have accessible label.

Focus:
- Initial focus lands on title after route load.
- On state change, focus moves to state title.
- On error, focus moves to error title.
- Auto-route pause must be long enough for assistive tech to announce status, or auto-route must be disabled when screen reader is active.

Touch:
- Buttons minimum 44 by 44 px.
- Sticky action area avoids home indicator overlap.
- Secondary actions remain reachable.

Contrast:
- Text contrast minimum WCAG AA.
- State color must be paired with icon and text.
- High contrast mode increases border visibility.

Reduced motion:
- Replace rail animation with static active step.
- Disable auto-route animation.
- Preserve haptic-free status changes if haptics are disabled.

Large text:
- Header wraps to two lines.
- Rail switches to vertical if labels wrap.
- Sticky CTA remains visible without overlapping content.

## Performance Requirements
Initial paint:
- Render shell immediately.
- Do route parsing before expensive rendering.
- Start verification after route validation and auth readiness.

Network:
- Do one verification request at a time.
- Abort stale verification request when delivery ID changes.
- Back off manual checks after repeated pending responses.
- Use cached latest result only if freshness rule passes.

Rendering:
- No heavy animation.
- No provider webview embedded in this screen.
- No large image assets.
- No layout shift when status changes.

Offline:
- Detect offline before verifying.
- Avoid retry loops while offline.
- Retry once on reconnect if user remains on screen.

## Analytics
Events:
- `payment_provider_return_viewed`
- `payment_provider_return_normalized`
- `payment_provider_return_rejected`
- `payment_provider_return_verify_started`
- `payment_provider_return_verify_confirmed`
- `payment_provider_return_verify_failed`
- `payment_provider_return_verify_pending`
- `payment_provider_return_review_routed`
- `payment_provider_return_error`
- `payment_provider_return_retry_tapped`
- `payment_provider_return_delivery_tapped`
- `payment_provider_return_support_tapped`

Required properties:
- `deliveryId`
- `provider`
- `returnSource`
- `normalized`
- `verificationOutcome`
- `elapsedBucket`
- `duplicateReturn`
- `networkState`

Forbidden analytics properties:
- Raw return URL.
- Raw query.
- Provider token.
- Phone number.
- Personal delivery address.
- Browser referrer.

Success metric:
- Percentage of valid returns that reach PaymentResult without duplicate payment start.

Risk metric:
- Count of blocked returns due to context mismatch or untrusted source.

Operational metric:
- Pending duration from return viewed to verification decision.

## QA Scenarios
Valid confirmed return:
1. Open route with valid delivery ID.
2. `verify_payment` returns confirmed.
3. Screen shows verification copy.
4. Screen routes to PaymentResult.
5. PaymentResult shows confirmed state.

Valid failed return:
1. Open route with valid delivery ID.
2. `verify_payment` returns failed.
3. Screen shows failed recovery copy.
4. Screen routes to recovery or failed result according to policy.
5. No receipt action appears on ProviderReturn.

Valid pending return:
1. Open route with valid delivery ID.
2. `verify_payment` returns pending.
3. Screen shows pending state.
4. Button calls `verify_payment` again after cooldown.
5. No new payment starts.

Review threshold return:
1. Open route after reconciliation threshold.
2. `verify_payment` returns pending.
3. Screen maps to review.
4. Screen routes to PaymentResult review state.

Provider says approved but backend pending:
1. Open route with `statusHint=approved`.
2. Backend returns pending.
3. Screen shows pending.
4. Screen does not show confirmed.

Provider says failed but backend confirmed:
1. Open route with failed status hint.
2. Backend returns confirmed.
3. Screen routes to confirmed result.
4. Query status is ignored.

Missing delivery:
1. Open route without delivery ID.
2. Screen shows missing context.
3. No verification request is sent.

Context mismatch:
1. Open route with path delivery ID and different query delivery ID.
2. Screen blocks verification.
3. No final payment state appears.

Untrusted host:
1. Open route from unrecognized host.
2. Screen blocks raw provider data.
3. User can open delivery or support.

Offline:
1. Open valid route offline.
2. Screen shows offline.
3. Reconnect.
4. Screen verifies once.

Duplicate return:
1. Open same valid route twice.
2. App uses in-flight guard.
3. Only one verification request occurs.

Expired session:
1. Open valid route with expired session.
2. App sends user to sign-in.
3. After sign-in, normalized context resumes.
4. Raw URL is not restored.

## Automated Test Requirements
Unit tests:
- Route parser accepts canonical route.
- Route parser rejects invalid delivery ID.
- Route parser rejects context mismatch.
- Route parser drops unknown query fields.
- State mapper trusts backend response over query status.
- Confirmed maps to result route.
- Failed maps to recovery or result failed route.
- Pending maps to pending before threshold.
- Pending maps to review after threshold.
- Offline prevents verification call.
- Duplicate return does not start a second in-flight verification.

Component tests:
- Loading state renders first viewport.
- Verifying state renders rail and disabled action.
- Confirmed state renders no receipt CTA.
- Failed state renders no payment-start CTA.
- Review state renders no recovery CTA.
- Missing context renders blocked copy.
- Untrusted source renders blocked copy.
- Offline renders retry-on-connect copy.
- Large text does not hide action.
- Screen reader labels exist for every rail step.

Integration tests:
- Deep link route opens ProviderReturn.
- Valid return calls `verify_payment`.
- Query status cannot force confirmed.
- Confirmed verification routes to PaymentResult.
- Failed verification routes to recovery or failed result.
- Pending verification does not route to receipt.
- Auth restoration resumes normalized context.
- Raw URL is not stored in analytics.

End-to-end tests:
- PaymentMethod initializes payment.
- Provider return opens ProviderReturn.
- ProviderReturn verifies payment.
- Confirmed routes to PaymentResult.
- Failed routes to PaymentFailedRecovery.
- Pending routes to PaymentResult review after threshold.
- Duplicate return does not start duplicate payment.

## Implementation Notes For Claude Code
Build order:
1. Add route file for `/(sender)/payments/:deliveryId/provider-return`.
2. Implement pure route normalization function.
3. Implement URL/query allowlist.
4. Implement state machine around `verify_payment`.
5. Implement in-flight verification guard.
6. Implement secure rendering components.
7. Implement state-specific navigation.
8. Add analytics with safe properties only.
9. Add accessibility live regions and focus management.
10. Add unit, component, integration, and end-to-end tests.

Required state machine invariants:
- Provider return never finalizes payment.
- Backend verification finalizes payment result state.
- Only one verification request can run for a delivery at a time.
- Pending cannot become confirmed without backend response.
- Network error cannot become failed.
- Blocked return cannot verify mismatched delivery.
- This route cannot initialize payment.
- This route cannot create delivery.

Suggested module boundaries:
- `normalizeProviderReturnUrl`
- `mapProviderReturnState`
- `usePaymentProviderReturn`
- `PaymentProviderReturnScreen`
- `ProviderReturnVerificationRail`
- `ProviderReturnActionBar`

Suggested input contract:
- `routeDeliveryId`
- `rawUrl`
- `currentUserId`
- `networkState`
- `storedPaymentContext`
- `now`

Suggested output contract:
- `normalizedDeliveryId`
- `safeProvider`
- `safePaymentId`
- `returnSource`
- `state`
- `nextRoute`
- `analyticsPayload`

Do not implement:
- Provider webview.
- Payment initialization.
- Delivery creation.
- Receipt display.
- Refund request.
- Provider dashboard.
- Raw query viewer.

## Design QA Checklist
Before closing implementation:
- First viewport says Kra is checking payment.
- Provider return is never final status.
- Confirmed state is backend-driven.
- Failed state is backend-driven.
- Pending state is honest and recoverable.
- Review state exists.
- Duplicate return is safe.
- Missing context is recoverable.
- Context mismatch is blocked.
- Offline state is calm and truthful.
- No receipt CTA appears.
- No retry-payment CTA appears.
- No new payment starts.
- No raw URL is displayed.
- No raw URL is logged.
- All key states have test IDs.
- Screen works on small phones.
- Screen works with large text.
- Screen works with screen reader.
- Screen works with reduced motion.

## Handoff Summary
Claude Code should build `PaymentProviderReturn` as the secure payment-return normalization screen. It must accept a provider return or deep link, validate only safe context, call `verify_payment`, ignore provider status hints as final truth, and route to PaymentResult or PaymentFailedRecovery based only on Kra backend status. It must never initialize payment, create delivery, show receipt access, or expose raw provider return data.

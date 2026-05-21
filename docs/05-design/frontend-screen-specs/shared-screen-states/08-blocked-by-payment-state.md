# Blocked By Payment State Spec

## Metadata
| Field | Value |
| --- | --- |
| State ID | `blocked_by_payment` |
| Component family | Shared screen state |
| Primary component | `SharedBlockedByPaymentState` |
| Supporting components | `PaymentBlockerCard`, `PaymentStatusSeal`, `PaymentRecoveryActions`, `PaymentReviewTimeline`, `OperationalPaymentGate`, `PaymentSupportLink`, `PaymentRetryGuard` |
| Primary surfaces | sender mobile app, operations mobile app, admin web console |
| Required recovery | pay, retry failed payment, wait for review, refresh status, or route to payment detail |
| Test id root | `state-blocked-by-payment` |
| Backend coverage | `DELIVERY_NOT_PAID`, `PAYMENT_FAILED`, `PAYMENT_PROVIDER_UNAVAILABLE`, `PAYMENT_ALREADY_CONFIRMED`, unresolved provider verification, delivery `paymentStatus` not confirmed |
| Browser mutation operation | None directly; blocks transport, custody, proof, receipt generation, and finance-sensitive action until verified state permits |
| Data sensitivity | payment status, amount when sender or finance authorized, payment provider label, safe delivery label, reconciliation status |
| Offline critical | Yes for operations mobile because payment-gated handoff actions must not be queued when payment is not confirmed |
| Related inventory state | `blocked_by_payment` |
| Related state specs | payment under review, refund pending, error, offline, stale data, not authorized, session expired, blocked by issue |
| Design tokens | `warning.amber.600`, `danger.red.600`, `success.green.600`, `brand.blue.600`, `neutral.950`, `neutral.700`, `neutral.500`, `neutral.100`, `surface`, spacing `4-40`, radius `8-16` |
| Accessibility target | WCAG 2.1 AA equivalent with clear payment gate explanation, non-color status, and accessible refresh/retry status |

## Purpose
`SharedBlockedByPaymentState` is the shared UI state shown when a delivery, package, receipt, transport action, final-mile action, or operational workflow cannot continue because payment is not verified as confirmed.

This state must answer:
- `Why is this workflow blocked?`
- `What is the current payment status?`
- `Who can fix it?`
- `Can I pay now, retry, wait, or contact support?`
- `Can operations move the package anyway?`
- `What if the provider result is pending?`
- `What if the sender already paid but Kra has not verified it?`
- `What should finance or support review?`

The most important rule is:
```text
No transport or completion workflow can bypass a missing, failed, pending, or unresolved payment.
```

## Product Job
Kra must prevent packages from entering transport or final-mile states before payment is verified. The UI has to make the payment gate impossible to miss, while still giving the right party a useful recovery path.

The blocked-by-payment state must:
- block dispatch, pickup, transit, destination receipt when policy requires payment
- block final-mile assignment, out-for-delivery, and delivery completion when payment is not confirmed
- explain payment status in sender-safe and staff-safe language
- route senders to pay or recover failed payment
- route staff to contact station, sender, support, or blocked queue
- route finance admins to reconciliation review when provider status is unresolved
- prevent offline queue writes for payment-blocked actions
- avoid showing payment as confirmed until backend verification says so
- avoid exposing provider references outside sender or finance scope

## Strategic Role
Payment gating protects revenue, refunds, reconciliation, and operational trust. If the app lets packages move without verified payment, Kra inherits loss risk and creates disputes that are expensive to unwind.

Payment gating also protects users from duplicate charges. The UI must not tell a sender to keep retrying when provider verification may still be pending. It must distinguish:
- unpaid or not started
- pending provider authorization
- failed payment
- provider unavailable
- under review after repeated verification
- already confirmed

The state is both a blocker and a routing tool. It must tell the right actor what to do without creating a payment bypass.

## External Research Used
Only directly relevant payment-status and accessible update references were used:
- [Stripe PaymentIntent status](https://docs.stripe.com/payments/paymentintents/lifecycle): supports explicit payment status progression and avoiding client-side assumptions before confirmation.
- [Paystack verify transaction](https://paystack.com/docs/payments/verify-payments/): supports server verification before treating a transaction as successful.
- [MTN MoMo API collections overview](https://momodeveloper.mtn.com/API-collections): supports mobile-money collection flows where provider status must be checked before internal settlement decisions.
- [GSMA Mobile Money API transaction status](https://mobilemoneyapi.io/api/): supports asynchronous mobile-money transaction states and status checks across mobile-money providers.
- [W3C WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): supports accessible announcements for payment refresh, retry, and blocked-action status changes.

## Local Sources
Local implementation and policy inputs:
- `docs/05-design/frontend-screen-inventory.md`
- `docs/04-features/payments-spec.md`
- `docs/09-payments/mtn-momo-flow.md`
- `docs/09-payments/paystack-flow.md`
- `docs/09-payments/reconciliation-spec.md`
- `docs/03-business/delivery-lifecycle.md`
- `docs/03-business/refund-and-dispute-rules.md`
- `docs/07-api/error-codes.md`
- `docs/05-design/copy-deck.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/13-payment-processing.md`
- `docs/05-design/frontend-screen-specs/sender-mobile-app/16-payment-failed-recovery.md`
- `docs/05-design/frontend-screen-specs/operations-mobile-shared/02-ops-delivery-detail.md`

## Visual Thesis
Blocked by payment should feel like a financial gate with a clear next route, not like a generic warning.

Use:
- amber gate state for pending or unpaid
- red state for failed payment
- blue primary recovery action
- compact status seal
- clear reason line
- role-specific next step
- finance review timeline when unresolved
- non-color status icon and text

Do not use:
- green payment language before verification
- vague `Blocked`
- generic error card
- hidden payment status below operational actions
- staff payment retry controls
- repeated sender retry without latest status refresh
- raw provider reference for non-finance staff
- cash workaround language

## Audience
Primary users:
- sender who must pay before transport can continue
- sender recovering failed payment
- sender waiting on unresolved provider result
- station operator trying to assign driver, dispatch, or receive a payment-blocked package
- driver trying to accept, pick up, or move a payment-blocked run
- final-mile courier trying to accept, start, or complete a payment-blocked job
- support admin explaining why package movement is blocked
- finance admin reviewing unresolved or conflicting payment verification

Secondary users:
- ops lead monitoring blocked queue
- station lead handling sender communication
- QA validating payment state mapping
- backend engineer validating payment contract
- accessibility reviewer validating status updates
- Claude Code implementing shared state later

Non-users:
- unauthenticated visitor
- public receiver
- payment provider
- scheduled reconciliation worker
- webhook sender

## Non-Goals
Do not use blocked by payment for:
- confirmed payment
- refund pending after valid payment
- payment under review as a long-running finance state when the dedicated state is better
- provider outage before payment is initialized
- quote changed before payment
- pricing validation error
- account session expiry
- role permission denial
- issue lock
- custody conflict
- scan mismatch
- proof required
- OTP required
- generic server error

If provider result is unresolved after verification checkpoints, use `payment_under_review` when the page is primarily about review. Use `blocked_by_payment` when an operational workflow is blocked by that unresolved status.

## Payment Status Taxonomy
Kra UI should normalize provider states into internal display states.

| Internal Status | Meaning | Blocker Behavior |
| --- | --- | --- |
| `not_started` | no payment attempt exists for the delivery | sender can start payment; operations blocked |
| `initiated` | payment request was created but not authorized | sender can continue payment; operations blocked |
| `pending` | provider status is unresolved | sender sees pending/review guidance; operations blocked |
| `failed` | provider or backend verified failure | sender can retry if delivery is still payable; operations blocked |
| `provider_unavailable` | payment provider cannot initialize or verify | sender can try later; operations blocked if payment not confirmed |
| `under_review` | reconciliation review owns the status | finance/support guidance; operations blocked |
| `confirmed` | backend verified payment as successful | blocker exits |
| `refunded` | payment was refunded after policy decision | dispatch remains blocked unless business flow creates a new paid delivery |
| `partially_refunded` | part of the payment was refunded | transport behavior follows backend delivery state |

## State Machine
Sender payment path:
```text
delivery_created
  -> payment_not_started
  -> blocked_by_payment
  -> initialize_payment
  -> payment_processing
  -> confirmed | failed | pending | under_review
```

Operational block path:
```text
staff_action_requested
  -> backend_checks_payment
  -> payment_not_confirmed
  -> blocked_by_payment
  -> refresh_status | contact_sender | open_support | blocked_queue
```

Failed retry path:
```text
payment_failed
  -> blocked_by_payment
  -> refresh_latest_status
  -> retry_allowed
  -> initialize_new_attempt
  -> payment_processing
```

Review path:
```text
pending_after_verification
  -> reconciliation_review
  -> blocked_by_payment_for_operations
  -> payment_under_review_for_sender_or_finance
```

Provider unavailable path:
```text
initialize_payment
  -> provider_unavailable
  -> blocked_by_payment
  -> try_later | support
```

## Entry Rules
Enter blocked by payment when:
- delivery payment status is not confirmed and user attempts payment-gated transport action
- backend returns `DELIVERY_NOT_PAID`
- backend returns `PAYMENT_REQUIRED` if added later
- sender delivery detail sees payment required as primary blocker
- staff delivery detail sees payment blocker before next action
- failed payment blocks dispatch or later transport state
- pending or unresolved provider status blocks movement
- receipt/share generation requires confirmed payment and payment is not confirmed

Do not enter when:
- payment is confirmed
- refund is pending but delivery is already closed
- account lacks permission
- session expired
- provider error is unrelated to existing delivery payment gate
- issue lock is the stronger blocker
- custody conflict is the stronger blocker

## Exit Rules
Exit blocked by payment when:
- backend verifies payment as confirmed
- sender cancels eligible unpaid delivery
- finance resolves payment under review into confirmed or failed
- delivery is cancelled before payment
- route changes to dedicated payment failed recovery
- route changes to payment under review
- user returns to safe list or blocked queue

Never exit because:
- provider redirect returned without backend verification
- local app sees provider success screen
- staff manually marks payment as paid
- cached status says paid but refresh says pending
- sender says they paid without verified payment state

## Payment Gate Rules
Payment must be confirmed before:
- driver assignment when backend policy requires paid transport
- dispatch readiness
- driver pickup custody acceptance
- in-transit update
- destination receipt when backend blocks unpaid transport records
- final-mile assignment
- final-mile acceptance
- out-for-delivery
- delivery completion
- receipt sharing when receipt depends on paid state

Payment may remain pending while:
- quote exists
- delivery is created
- package is received at origin if business flow allows origin intake before payment
- sender is completing payment
- reconciliation review is pending

Payment must not be bypassed by:
- offline outbox
- admin station override
- package scan success
- custody confirmation
- manual label reprint
- support note
- finance note
- local cache

## Component Contract
`SharedBlockedByPaymentState` props:
```ts
type PaymentBlockerStatus =
  | "not_started"
  | "initiated"
  | "pending"
  | "failed"
  | "provider_unavailable"
  | "under_review"
  | "refunded"
  | "partially_refunded";

interface SharedBlockedByPaymentStateProps {
  status: PaymentBlockerStatus;
  surface:
    | "sender_mobile"
    | "ops_mobile"
    | "admin_web";
  variant:
    | "standalone"
    | "inline"
    | "modal"
    | "drawer"
    | "action_result"
    | "row_badge";
  actorRole:
    | "sender"
    | "station_operator"
    | "driver"
    | "final_mile_courier"
    | "support_admin"
    | "finance_admin"
    | "ops_admin"
    | "super_admin";
  safeDeliveryLabel?: string;
  amountLabel?: string;
  providerLabel?: "MTN MoMo" | "Paystack" | "Hubtel" | "Unknown";
  canStartPayment?: boolean;
  canRetryPayment?: boolean;
  canRefreshStatus?: boolean;
  canOpenReview?: boolean;
  canContactSupport?: boolean;
  reviewedByFinance?: boolean;
  lastCheckedAt?: string;
  primaryAction: PaymentBlockerAction;
  secondaryActions?: PaymentBlockerAction[];
  onPrimaryAction: () => void;
  onSecondaryAction?: (action: PaymentBlockerAction) => void;
  onRefreshStatus?: () => Promise<void>;
}
```

`PaymentBlockerAction`:
```ts
type PaymentBlockerAction =
  | "start_payment"
  | "retry_payment"
  | "continue_payment"
  | "view_payment"
  | "refresh_status"
  | "open_payment_review"
  | "open_blocked_queue"
  | "contact_support"
  | "back_to_delivery"
  | "back_to_work";
```

## Component Responsibilities
`SharedBlockedByPaymentState`:
- selects role-safe copy
- blocks protected action area
- renders payment status and recovery
- hides sensitive provider detail from staff where not allowed
- prevents offline queue submission
- emits safe telemetry
- announces refresh and retry outcomes

`PaymentBlockerCard`:
- renders title, body, status seal, and actions
- adapts to full page, inline, modal, drawer, or row badge

`PaymentStatusSeal`:
- shows status label, icon, and color
- never uses color alone
- shows amount only to sender or finance-authorized admin

`PaymentRecoveryActions`:
- enforces role-specific action set
- sender gets payment/retry actions
- staff gets refresh, support, or blocked queue actions
- finance gets review action

`PaymentReviewTimeline`:
- shows verification checkpoints when authorized
- hides provider reference unless finance scope exists
- explains pending review SLA

`OperationalPaymentGate`:
- disables movement actions
- explains which workflow is blocked
- gives safe route back to work

`PaymentSupportLink`:
- opens support with safe payment blocker context
- no provider secret or raw provider payload

`PaymentRetryGuard`:
- requires latest status refresh before retry
- prevents duplicate active payment prompts
- blocks retry when payment is pending, under review, confirmed, refunded, or provider unavailable

## Role-Based Recovery
Sender:
- `not_started`: start payment
- `initiated`: continue payment if active prompt is still valid
- `pending`: refresh status or wait
- `failed`: retry payment when retry is allowed
- `provider_unavailable`: try later or contact support
- `under_review`: view review copy
- `refunded`: view refund status

Station operator:
- cannot take payment
- cannot override payment gate
- can refresh payment status
- can open blocked queue
- can contact support or station lead

Driver:
- cannot take payment
- cannot accept or move unpaid package
- can refresh run status
- can return to assigned runs
- can contact support for route impact

Final-mile courier:
- cannot take payment
- cannot complete delivery if payment gate blocks the job
- can refresh job
- can return to assignments
- can contact support

Support admin:
- can explain blocker
- can create or link issue when customer claims paid but verification missing
- cannot mark payment confirmed

Finance admin:
- can open reconciliation review
- can compare provider and internal status
- can resolve through approved backend flow
- cannot bypass delivery gate from UI without backend confirmation

Ops admin:
- can see operational impact
- can coordinate blocked queue
- cannot mark payment confirmed

Super admin:
- follows finance/ops capability split in UI
- no direct bypass button

## Copy System
Base title:
- `Payment must be confirmed`

Base body:
- `This delivery cannot move forward until payment is verified.`

Sender body:
- `Complete or retry payment before Kra can continue this delivery.`

Staff body:
- `Payment is not confirmed, so this package cannot move to the next workflow.`

Finance body:
- `Payment verification is blocking this delivery. Review the provider and internal records.`

Blocked action copy:
- `Payment must be confirmed before this action.`

Provider pending copy:
- `Payment is still being checked. Do not retry until the latest status is refreshed.`

Do not use:
- `Paid` before confirmation
- `Probably paid`
- `Payment looks successful`
- `Move anyway`
- `Cash accepted`
- `Ask driver to collect`
- `Mark as paid`
- `Force dispatch`

## Status Copy Matrix
| Status | Title | Body | Primary Action |
| --- | --- | --- | --- |
| `not_started` | `Payment required` | `Payment must be completed before this delivery can move.` | `Start payment` |
| `initiated` | `Payment not finished` | `The payment request was started but not confirmed.` | `Continue payment` |
| `pending` | `Payment is pending` | `Kra is still checking the provider result. Transport remains blocked.` | `Refresh status` |
| `failed` | `Payment failed` | `Payment could not be completed. Retry only after checking the latest status.` | `Retry payment` |
| `provider_unavailable` | `Payment service unavailable` | `The payment service is temporarily unavailable. Try again later.` | `Try later` |
| `under_review` | `Payment under review` | `Finance must review the unresolved provider result before this can move.` | `View review` |
| `refunded` | `Payment refunded` | `This payment has been refunded, so the delivery cannot continue on this payment.` | `View refund` |
| `partially_refunded` | `Payment adjusted` | `This payment was adjusted. Follow the latest delivery and finance status.` | `View payment` |

## Visual Layout
Standalone sender:
- payment gate card near top
- status seal
- amount and provider when authorized
- recovery action
- status refresh
- support link
- policy note

Inline operations:
- compact blocker card above disabled action
- payment seal
- blocked workflow text
- refresh status action
- return to work action

Admin:
- blocker panel inside delivery or reconciliation detail
- finance review timeline
- provider/internal status comparison when authorized
- audit-safe action list

Row badge:
- small `Payment blocked` chip
- icon plus text
- tap opens delivery or blocker detail

Modal or drawer:
- replace action content with payment gate
- close returns to safe parent screen
- no mutation can continue

## Status Seal Rules
Confirmed status:
- this state should not render
- show normal payment confirmed component

Pending status:
- amber
- label `Payment pending`
- show last checked time if available

Failed status:
- red
- label `Payment failed`
- show retry only to sender when allowed

Under review:
- amber or blue
- label `Under review`
- show review owner and target when authorized

Provider unavailable:
- amber
- label `Service unavailable`
- no retry spam

Refunded:
- neutral or red depending context
- label `Refunded`
- route to refund status

## Action Safety Rules
When blocked by payment renders:
- disable payment-gated CTA
- show reason next to disabled CTA or replacement card
- prevent keyboard activation of disabled action
- do not queue offline mutation
- do not run local optimistic state
- do not mark custody moved
- do not mark proof completed
- do not mark receipt ready
- do not send delivery progression notification

Allowed actions:
- start payment when sender and delivery is payable
- retry failed payment when latest status confirms failed
- refresh payment status
- open payment detail
- open finance review when authorized
- contact support
- return to work list

## Payment Retry Rules
Before retry:
- refresh latest payment status
- check there is no active pending payment attempt
- check amount still matches locked quote
- check delivery is still payable
- check session is valid
- check idempotency key policy

Block retry when:
- payment is pending
- payment is under review
- payment is confirmed
- payment is refunded
- provider is unavailable
- quote or amount mismatch exists
- delivery is cancelled
- issue lock blocks payment
- rate limit applies

After retry starts:
- route to payment processing
- do not show confirmed until backend verification returns confirmed
- keep old failed state visible only as history

## Provider Return Rules
Provider return is not confirmation.

The UI must:
- show returning or verifying status
- call backend verification
- render blocked by payment if not confirmed
- render payment under review if unresolved
- render payment failed recovery if failed
- render confirmed receipt only after backend confirmed status

The UI must not:
- trust provider redirect query alone
- trust browser history alone
- trust sender screenshot
- show receipt before confirmation

## Offline Rules
If blocked status is already known:
- show blocked by payment from cache
- mark status age with stale data if needed
- allow read-only viewing
- block payment-gated actions
- block offline queue write

If payment status is unknown offline:
- show offline state or stale data state
- do not assume payment confirmed
- require refresh before action

If an action was queued before payment status changed:
- revalidate payment before sending
- discard or pause if payment is not confirmed
- show blocked by payment

## API Mapping Rules
Map errors:
- `DELIVERY_NOT_PAID` -> `blocked_by_payment`
- `PAYMENT_REQUIRED` -> `blocked_by_payment` if added later
- `PAYMENT_FAILED` -> payment failed recovery for sender, blocked by payment for staff action context
- `PAYMENT_PROVIDER_UNAVAILABLE` -> provider unavailable payment blocker for sender payment action
- `PAYMENT_ALREADY_CONFIRMED` -> exit blocker and refresh payment detail
- `PROVIDER_TIMEOUT` during verification -> pending or under review depending backend status
- `UNMATCHED_PROVIDER_REFERENCE` -> admin webhook or payment review, not public blocker copy

Map delivery status:
- payment status `pending` plus transport action -> blocked by payment
- payment status `failed` plus transport action -> blocked by payment
- payment status `confirmed` -> no blocker
- payment status `refunded` plus active movement -> blocked by payment unless backend provides replacement entitlement

## Data Visibility
Sender may see:
- amount
- payment method
- payment status
- safe provider label
- receipt link when confirmed
- refund status when applicable

Station operator may see:
- payment confirmed or blocked status
- no full provider reference
- no payment instrument detail
- no refund execution detail

Driver may see:
- payment confirmed or blocked status
- route/action impact
- no amount by default unless already approved

Courier may see:
- payment confirmed or blocked status
- job action impact
- no amount by default

Support admin may see:
- payment status summary
- issue link
- no execution controls

Finance admin may see:
- provider reference
- internal payment ID
- amount
- reconciliation status
- review action

Public receiver:
- should not see this state in v1

## Accessibility
Required:
- blocker title is a heading
- status seal includes text
- disabled action has explanation
- refresh status announces progress and result
- retry action is reachable by keyboard
- focus moves to blocker when action is blocked
- row badges have accessible names
- color is never the only indicator
- amount and status are readable together
- error or review status uses `role="status"` or appropriate live region

Announcements:
- `Payment must be confirmed before this action.`
- `Checking latest payment status.`
- `Payment is still pending.`
- `Payment failed. Retry is available.`
- `Payment confirmed. This action is now available.`
- `Payment is under review. Transport remains blocked.`

## Localization
Copy must:
- keep provider names as configured labels
- avoid raw error codes in visible text
- avoid currency formatting outside locale utilities
- support Ghana launch copy first
- keep button labels short
- avoid idioms like `stuck`
- use `payment` consistently, not mixed terms

Currency:
- display `GHS` with locale formatting
- never format amount manually in component
- hide amount when role is not authorized

## Privacy And Security
Security rules:
- backend payment status is final authority
- provider redirect is not final authority
- staff cannot override payment gate
- admin cannot mark paid without approved finance backend flow
- offline queue cannot bypass payment gate
- idempotency protects retry
- provider references are role-gated

Privacy rules:
- do not expose payer phone to staff
- do not expose provider payload outside finance tools
- do not expose full mobile money reference in public or staff mobile
- do not expose refund reason outside authorized support or finance scope
- do not log payment instrument details

## Telemetry
Event: `payment_blocker_viewed`

Allowed properties:
- `surface`
- `variant`
- `actor_role`
- `payment_status`
- `blocked_workflow`
- `provider_label`
- `can_retry_payment`
- `can_refresh_status`
- `can_open_review`
- `network_state`
- `source`

Forbidden properties:
- payer phone
- provider reference
- payment provider payload
- payment instrument detail
- full delivery id in public surface
- receiver phone
- address
- proof data

Event: `payment_blocker_action_clicked`

Allowed properties:
- `action`
- `surface`
- `payment_status`
- `blocked_workflow`
- `result`

## Error Logging
Frontend log may include:
- safe error code
- internal route group
- request id
- payment status
- provider label
- actor role
- timestamp

Frontend log must not include:
- provider payload
- payer phone
- full mobile money reference
- card metadata
- sender personal data
- receiver personal data
- proof asset URL

## QA Scenarios
Sender QA:
- unpaid delivery shows start payment
- initiated payment shows continue payment
- pending payment shows refresh and wait copy
- failed payment shows retry only after latest status check
- provider unavailable blocks retry spam
- under review routes to review copy
- confirmed payment exits blocker

Operations QA:
- station driver assignment blocked when payment is not confirmed
- station dispatch blocked when payment is not confirmed
- driver pickup blocked when payment is not confirmed
- driver in-transit update blocked when payment is not confirmed
- courier out-for-delivery blocked when payment is not confirmed
- courier completion blocked when payment is not confirmed
- offline queued action is not sent when payment is blocked

Admin QA:
- finance admin can open reconciliation review
- support admin can open issue context but not mark paid
- ops admin can see operational impact but not mark paid
- unresolved provider state remains blocked
- provider reference hidden outside finance

Privacy QA:
- staff mobile does not show payer phone
- driver does not see provider reference
- courier does not see amount unless authorized by policy
- public receiver never sees payment blocker
- logs exclude provider payload

## Unit Tests
Component tests must cover:
- renders correct title by status
- renders sender payment action
- renders staff refresh action
- hides retry for staff
- hides provider reference for staff
- shows review action for finance admin
- disables movement action with reason
- announces refresh result
- blocks retry on pending status
- exits blocker on confirmed refresh

Classifier tests must cover:
- `DELIVERY_NOT_PAID` maps to blocked by payment
- `PAYMENT_FAILED` maps to sender recovery or staff blocker by context
- `PAYMENT_PROVIDER_UNAVAILABLE` maps to provider unavailable
- `PAYMENT_ALREADY_CONFIRMED` maps to refresh and exit
- pending provider result maps to pending or under review by backend marker
- confirmed payment does not render blocker

## End-To-End Tests
E2E tests must cover:
- sender starts payment from blocked detail
- sender retries failed payment after latest status refresh
- pending payment does not allow duplicate active retry
- station dispatch action is blocked by unpaid status
- driver pickup action is blocked by unpaid status
- courier completion action is blocked by unpaid status
- offline staff action is not queued when payment is blocked
- finance opens review for unresolved payment
- confirmed refresh re-enables allowed workflow

## Visual QA
Visual review must verify:
- sender mobile unpaid state
- sender mobile failed state
- sender mobile pending state
- ops mobile inline gate
- ops mobile action result
- admin review panel
- row badge in blocked queue
- provider unavailable state
- long localized copy
- large text mode
- high contrast mode
- keyboard focus

## Acceptance Criteria
`SharedBlockedByPaymentState` is complete when:
- payment-gated actions are blocked until backend confirmation
- sender recovery is clear and safe
- staff cannot bypass the gate
- finance review is available only to authorized roles
- provider redirects are not treated as confirmation
- retry requires latest status check
- offline queue cannot send blocked payment actions
- telemetry excludes payment secrets and personal data
- accessibility behavior is testable
- all required test IDs are named

## Implementation Sequence
1. Build payment status classifier.
2. Build API error mapping.
3. Build `SharedBlockedByPaymentState`.
4. Build `PaymentStatusSeal`.
5. Build `PaymentRecoveryActions`.
6. Build `OperationalPaymentGate`.
7. Build `PaymentRetryGuard`.
8. Build `PaymentReviewTimeline`.
9. Integrate sender delivery detail.
10. Integrate payment failed recovery.
11. Integrate operations delivery detail.
12. Integrate scan and handoff workflows.
13. Integrate blocked queues.
14. Integrate admin reconciliation.
15. Add offline queue revalidation.
16. Add telemetry allowlist.
17. Add component tests.
18. Add classifier tests.
19. Add E2E payment gate coverage.

## Route Checklist
Every payment-gated route must define:
- required payment status
- blocked workflow label
- sender recovery route
- staff recovery route
- finance review route when authorized
- latest status refresh behavior
- retry allowed flag
- amount visibility by role
- provider reference visibility by role
- offline queue behavior
- cache invalidation behavior
- support link behavior

## Test IDs
Root:
- `state-blocked-by-payment`

Elements:
- `state-blocked-by-payment-card`
- `state-blocked-by-payment-title`
- `state-blocked-by-payment-body`
- `state-blocked-by-payment-status-seal`
- `state-blocked-by-payment-primary-action`
- `state-blocked-by-payment-secondary-action`
- `state-blocked-by-payment-refresh-status`
- `state-blocked-by-payment-review-link`
- `state-blocked-by-payment-support-link`
- `state-blocked-by-payment-last-checked`
- `state-blocked-by-payment-amount`
- `state-blocked-by-payment-provider-label`
- `state-blocked-by-payment-operational-gate`

Status variants:
- `state-blocked-by-payment-not-started`
- `state-blocked-by-payment-initiated`
- `state-blocked-by-payment-pending`
- `state-blocked-by-payment-failed`
- `state-blocked-by-payment-provider-unavailable`
- `state-blocked-by-payment-under-review`
- `state-blocked-by-payment-refunded`
- `state-blocked-by-payment-partially-refunded`

## Failure Modes
False confirmed state:
- UI shows payment confirmed before backend verification.
- Severity: critical.
- Fix: use backend confirmed status only.

Operational bypass:
- Staff action proceeds while payment is blocked.
- Severity: critical.
- Fix: disable action and enforce server-side check.

Duplicate retry:
- Sender starts another payment while pending attempt exists.
- Severity: high.
- Fix: refresh latest status and active attempt before retry.

Provider leak:
- Staff sees full provider reference or payer phone.
- Severity: high.
- Fix: role-gate payment details.

Offline bypass:
- Unpaid delivery action is queued offline.
- Severity: critical.
- Fix: revalidate payment before queue write and before send.

Wrong state:
- Payment under review appears as generic error.
- Severity: medium.
- Fix: map unresolved provider state to review or blocker state.

## Definition Of Done
This state is ready for Claude Code implementation when:
- all payment statuses are mapped
- all role recoveries are explicit
- all payment-gated workflows are listed
- retry guard rules are complete
- provider verification authority is clear
- offline queue rules are explicit
- privacy rules are strict
- telemetry allowlist is explicit
- route checklist is complete
- E2E coverage includes sender, station, driver, courier, and finance scenarios

# Frontend Screen Inventory

## Purpose
This is the canonical frontend build checklist for Kra v1. Claude Code should use this file as the source of truth for public web pages, mobile app screens, admin screens, required states, operational modals, and shared UI infrastructure.

This inventory exists to ensure the frontend matches the backend implementation and business policy documents. It does not authorize bypassing backend permissions, pricing, custody, proof, payment, refund, or issue rules.

## Canonical Rule
- This file supersedes the shorter `screen-list.md` for implementation planning.
- Every implemented route must map to one screen, modal flow, shared component, or explicit non-UI backend process in this file.
- Every critical backend error code must have a user-safe UI state or recovery path.
- Every custody transfer screen must show the current custody owner, next required actor, scan requirement, timestamp, and failure recovery.
- Every screen that mutates backend state must support loading, success, error, retry, and permission-denied states.
- Staff mobile screens must support offline queued actions where the workflow is listed as offline-critical.

## Product Surfaces
| Surface | Repo Target | Primary Users | Launch Requirement |
| --- | --- | --- | --- |
| Public web | `apps/web` | visitors, senders, receivers | Required |
| Sender mobile | `apps/mobile` | senders | Required |
| Receiver public flow | `apps/web` or mobile web shell | receivers without accounts | Required |
| Operations mobile | `apps/mobile` | station operators, drivers, final-mile couriers | Required |
| Admin web | `apps/admin` | admins, support, finance, ops leads | Required |
| Internal task UI | none | scheduled jobs and webhooks | Not a screen; admin observability required |

## Build Priority
### P0 Launch Critical
- Public landing and tracking entry.
- Sender create delivery, payment, delivery detail, and tracking.
- Receiver secure tracking and phone verification.
- Station intake, dispatch readiness, destination receipt, final-mile assignment, and handoff log.
- Driver assigned run, accept run, pickup scan, in-transit update, and destination handoff.
- Final-mile assignment acceptance, out-for-delivery, proof capture, failed attempt, and completion.
- Admin launch readiness, delivery explorer, package detail, issue queue, pricing rules, finance, refunds, users, stations, audit, and notifications.
- Shared scan, proof, timeline, custody chain, payment status, issue status, offline outbox, and error-state systems.

### P1 Operational Completeness
- Staff account activation and invite acceptance.
- Package label print and reprint.
- Receipt print and share.
- Payment provider return and failed payment recovery.
- Manual custody exception review.
- SLA breach dashboard.
- Notification delivery detail.
- Webhook event detail.
- Payment reconciliation detail.
- Refund evidence review.
- Station capacity and queue pressure.
- Export report flow.

### P2 Post-Pilot
- Public ratings.
- Enterprise invoicing.
- AI customer chat.
- Advanced route optimization UI.
- Merchant portal.
- Warehouse inventory.
- Fleet telematics.
- Marketplace integrations.

## Public Web Pages
| Screen ID | Screen | Primary Job | Backend Coverage | Required States |
| --- | --- | --- | --- | --- |
| `PublicLanding` | Landing page | Explain Kra and convert visitors | none | normal, degraded marketing asset load |
| `PublicHowItWorks` | How Kra works | Explain sender, station, driver, courier chain | none | normal |
| `PublicServiceAreas` | Service areas and stations | Show covered corridors and station model | station data when exposed | loading, empty, unavailable |
| `PublicPricingExplainer` | Pricing explanation | Explain route, weight, doorstep, refund expectations | public copy; no local pricing math authority | normal |
| `PublicTrustCustody` | Trust, custody, and proof | Explain package scan, handoff, OTP, proof | none | normal |
| `PublicSupportEntry` | Support entry | Start support without app install | `create_issue` when authenticated path exists; otherwise support contact | loading, submitted, error |
| `PublicDeliveryPolicy` | Delivery policy | Publish delivery lifecycle and failed attempt policy | none | normal |
| `PublicRefundPolicy` | Refund policy | Publish refund and dispute policy | none | normal |
| `PublicPrivacy` | Privacy policy | Publish data and retention rules | none | normal |
| `PublicTerms` | Terms | Publish legal terms | none | normal |
| `PublicTrackingEntry` | Tracking entry | Let sender or receiver enter tracking code | `get_public_tracking` | loading, invalid code, rate limited |
| `PublicMaintenance` | Maintenance mode | Explain service interruption | health/config signal | normal |

## Receiver Public Flow
Receivers are not full authenticated users in v1. Receiver access is delivery-scoped and protected by tracking link plus phone verification.

| Screen ID | Screen | Primary Job | Backend Coverage | Required States |
| --- | --- | --- | --- | --- |
| `ReceiverTrackingLanding` | Secure tracking link landing | Show safe public delivery status | `get_public_tracking` | loading, not found, expired, access denied |
| `ReceiverPhoneChallenge` | Phone verification request | Send verification challenge to receiver phone | `request_public_tracking_phone_challenge` | loading, sent, throttled, error |
| `ReceiverOtpVerify` | OTP verification | Verify receiver phone and create active token | `verify_public_tracking_phone` | loading, invalid OTP, expired OTP, verified |
| `ReceiverTrackingTimeline` | Receiver tracking timeline | Show receiver-safe delivery timeline | `get_public_tracking` | loading, empty, stale, issue reported |
| `ReceiverArrivalInstructions` | Arrival and handoff instructions | Tell receiver what proof is required | `get_public_tracking` | awaiting courier, OTP required, proof completed |
| `ReceiverFailedAttempt` | Failed attempt information | Explain missed delivery and next path | `get_public_tracking` | attempt recorded, rerouted, issue queue |
| `ReceiverRefusalInfo` | Receiver refusal information | Explain refusal and review process | issue status | issue created, review pending |
| `TrackingLinkExpired` | Tracking link expired | Recover safely without exposing data | `get_public_tracking` | expired, request support |
| `TrackingAccessDenied` | Tracking access denied | Block mismatched receiver access | public tracking auth result | denied |

## Sender Mobile App
| Screen ID | Screen | Primary Job | Backend Coverage | Required States |
| --- | --- | --- | --- | --- |
| `SenderOnboarding` | Onboarding | Explain the service and start signup | auth | normal |
| `SenderSignIn` | Sign in | Authenticate sender | auth | loading, invalid credentials, locked |
| `SenderAuthRecovery` | Auth recovery | Recover access | auth | loading, sent, error |
| `SenderHome` | Sender home | Show active deliveries and next actions | `list_deliveries`, `list_notifications` | loading, empty, offline, error |
| `CreateDeliveryStart` | Create delivery start | Begin delivery draft | local draft | normal |
| `CreateDeliveryStations` | Station selection | Choose origin and destination stations | station data, pricing rules indirectly | loading, unavailable route |
| `CreateReceiverDetails` | Receiver details | Capture receiver name and phone | `create_delivery` request schema | field errors |
| `CreatePackageDetails` | Package details | Capture package description, size, weight estimate | `create_delivery` request schema | field errors |
| `CreateDeliveryOptions` | Delivery options | Choose pickup or doorstep when serviceable | doorstep serviceability policy | unavailable, selected |
| `QuoteReview` | Quote review | Show backend quote and locked assumptions | `create_delivery`, pricing response | loading, quote changed, error |
| `DeliverySummary` | Delivery summary | Confirm delivery before payment | `create_delivery` | loading, success, validation error |
| `PaymentMethod` | Payment method | Choose supported method | `initialize_payment` | loading, provider unavailable |
| `PaymentProcessing` | Payment processing | Wait for provider result | `verify_payment` | pending, confirmed, failed, under review |
| `PaymentResult` | Payment result | Show confirmed, failed, or review state | `verify_payment` | confirmed, failed, review |
| `PaymentProviderReturn` | Payment provider return | Normalize provider callback UX | `verify_payment` | loading, confirmed, failed, review |
| `PaymentFailedRecovery` | Payment failed recovery | Retry or change payment method | `initialize_payment`, `verify_payment` | retrying, failed |
| `SenderDeliveryDetail` | Delivery detail | Show delivery, status, payment, issue, proof summary | `get_delivery` | loading, not authorized, not found |
| `SenderTrackingTimeline` | Tracking timeline | Show verified lifecycle events | `get_delivery_timeline` | loading, empty, stale, issue |
| `SenderDeliveryHistory` | Delivery history | Search and review past deliveries | `list_deliveries` | loading, empty, filters, error |
| `SenderReceiptDetail` | Receipt detail | Show payment receipt and refund state | payment fields in delivery | loading, refunded, partial refund |
| `SenderReceiptShare` | Receipt print/share | Export receipt for sender | client export | generating, success, failure |
| `CancelDeliveryRequest` | Cancellation request | Cancel eligible delivery | `cancel_delivery` | blocked by status, submitted, rejected |
| `SenderRefundStatus` | Refund status | Track refund progress | delivery/payment/refund fields | pending, approved, settled, rejected |
| `SenderIssueCreate` | Issue or dispute creation | Report package, payment, delay, damage, or proof issue | `create_issue` | loading, submitted, field errors |
| `SenderSupportThread` | Support thread | Continue support conversation/status | `list_issues`, `get_issue` | loading, empty, resolved |
| `SenderNotifications` | Notifications inbox | Show delivery/payment/refund/issue notices | `list_notifications` | loading, empty, read/unread |
| `SenderProfile` | Profile | Manage basic sender profile | user profile when exposed | loading, saved, error |
| `SenderSettings` | Settings | Preferences and sign out | auth/profile | normal |

## Operations Mobile Shared Screens
These screens are shared by station operators, drivers, and final-mile couriers where role permissions allow.

| Screen ID | Screen | Primary Job | Backend Coverage | Required States |
| --- | --- | --- | --- | --- |
| `OpsRoleHome` | Role-aware home | Route staff to assigned work | `list_deliveries`, role claims | loading, empty, offline |
| `OpsDeliveryDetail` | Staff delivery detail | Show operational delivery state | `get_delivery`, `get_delivery_timeline` | loading, not authorized |
| `OpsScanPackage` | Scan package | Capture and validate package scan code | handoff request schemas | camera denied, mismatch, duplicate |
| `OpsCustodyChain` | Custody chain | Show current custody owner and evidence | delivery lifecycle/timeline | loading, missing evidence |
| `OpsOfflineOutbox` | Offline outbox | Show queued staff actions | local SQLite queue | empty, retrying, failed |
| `OpsActionRecovery` | Failed action recovery | Repair or discard failed queued actions | local queue plus backend retry | conflict, expired, resolved |
| `OpsIssueCreate` | Staff issue creation | Report operational exception | `create_issue` | submitted, blocked, error |
| `OpsSupport` | Staff support | Escalate to support/admin | `create_issue`, `list_issues` | loading, empty |

## Station Operator Mobile App
| Screen ID | Screen | Primary Job | Backend Coverage | Offline Critical |
| --- | --- | --- | --- | --- |
| `StationSignIn` | Station sign in | Authenticate station operator | auth | No |
| `StationOverview` | Station overview | Show inbound, outbound, blocked, and handoff workload | `list_deliveries` scoped by station | Yes, read cached |
| `StationIntakeQueue` | Intake queue | Find deliveries awaiting intake | `list_deliveries` | Yes |
| `StationPackageIntake` | Package intake scan | Bind package label and confirm station intake | `confirm_intake` | Yes |
| `StationIntakeConfirmation` | Intake confirmation | Show label binding and receipt acknowledgement | `confirm_intake` response | Yes |
| `PackageLabelPrint` | Package label print | Print first package label after intake | package label from lifecycle | No |
| `PackageLabelReprint` | Package label reprint | Reprint with audit reason | admin/support governed; no silent mutation | No |
| `StationOutboundQueue` | Outbound queue | View packages ready for driver assignment/dispatch | `list_deliveries` | Yes |
| `StationDriverAssignment` | Driver assignment | Assign driver without moving custody | `assign_driver` | Yes |
| `StationDispatchReadiness` | Dispatch readiness | Mark package ready for assigned driver | `dispatch_delivery` | Yes |
| `StationDriverPickupScan` | Driver pickup scan review | Confirm assigned driver scan moves custody | `confirm_pickup` by driver, station sees result | Yes |
| `StationInboundQueue` | Inbound queue | View deliveries expected at station | `list_deliveries` | Yes |
| `StationDestinationReceipt` | Destination receipt scan | Receive package from driver after scan/condition check | `receive_destination` | Yes |
| `StationConditionCheck` | Condition check | Record condition and exceptions at receipt | `receive_destination`, `create_issue` | Yes |
| `StationFinalMileQueue` | Final-mile queue | View doorstep-eligible packages | `list_deliveries` | Yes |
| `StationFinalMileAssignment` | Final-mile assignment | Assign courier without moving custody | `assign_final_mile` | Yes |
| `StationHandoffLog` | Handoff log | Review handoff evidence at station | `get_delivery_timeline` | Yes, read cached |
| `StationBlockedQueue` | Blocked queue | Work packages blocked by issue/payment/custody | `list_deliveries`, `list_issues` | Yes |
| `StationReports` | Station reports | Station scoped operational metrics | admin/station aggregate when exposed | No |
| `StationSupport` | Station support | Escalate station issues | `create_issue` | Yes |

## Driver Mobile App
| Screen ID | Screen | Primary Job | Backend Coverage | Offline Critical |
| --- | --- | --- | --- | --- |
| `DriverSignIn` | Driver sign in | Authenticate driver | auth | No |
| `DriverHome` | Driver home | Show assigned runs and deadlines | `list_deliveries` assignment scoped | Yes, read cached |
| `AssignedRuns` | Assigned runs | List assigned transport runs | `list_deliveries` | Yes |
| `AssignedRunDetail` | Assigned run detail | Review origin, destination, manifest, timing | `get_delivery` | Yes |
| `DriverAcceptRun` | Accept or reject run | Accept run within SLA | `accept_run` | Yes |
| `DriverManifest` | Manifest | See packages in run and scan status | `get_delivery`/list | Yes |
| `DriverOriginPickupScan` | Origin pickup scan | Confirm package scan and accept custody | `confirm_pickup` | Yes |
| `DriverCustodyAccepted` | Custody accepted confirmation | Confirm custody moved to driver | `confirm_pickup` response | Yes |
| `DriverRoute` | Driver route | Navigate between stations with operational status | route metadata when exposed | Yes, cached |
| `DriverMarkInTransit` | Mark in transit | Update transport state | `mark_in_transit` | Yes |
| `DriverDestinationArrival` | Destination arrival | Prepare station handoff | `get_delivery` | Yes |
| `DriverDestinationHandoff` | Destination handoff scan | Complete destination station receipt with operator | `receive_destination` by station, driver sees result | Yes |
| `DriverHistory` | Driver history | Review completed/failed runs | `list_deliveries` | No |
| `DriverEarnings` | Driver earnings | Show earnings and settlement status | payouts when exposed | No |
| `DriverSupport` | Driver support | Report run problem | `create_issue` | Yes |

## Final-Mile Courier Mobile App
| Screen ID | Screen | Primary Job | Backend Coverage | Offline Critical |
| --- | --- | --- | --- | --- |
| `CourierSignIn` | Courier sign in | Authenticate courier | auth | No |
| `CourierHome` | Courier home | Show assigned doorstep jobs | `list_deliveries` assignment scoped | Yes |
| `CourierAssignments` | Assigned jobs | List active final-mile assignments | `list_deliveries` | Yes |
| `CourierAssignmentDetail` | Assignment detail | Review receiver, destination, instructions | `get_delivery` | Yes |
| `CourierAcceptAssignmentScan` | Accept assignment with scan | Scan package and accept custody | `accept_final_mile_assignment` | Yes |
| `CourierCustodyAccepted` | Custody accepted confirmation | Confirm custody moved to courier | `accept_final_mile_assignment` response | Yes |
| `CourierOutForDelivery` | Out for delivery | Start final-mile trip | `mark_out_for_delivery` | Yes |
| `CourierRoute` | Courier route | Navigate to receiver | route metadata when exposed | Yes, cached |
| `CourierProofCapture` | Proof capture | Choose OTP, signature, or photo proof | proof and completion routes | Yes |
| `CourierOtpCompletion` | OTP completion | Complete delivery with active receiver verification token | `complete_delivery` | Yes |
| `CourierSignatureProof` | Signature proof | Upload signature proof | `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `complete_delivery` | Yes |
| `CourierPhotoProof` | Photo proof | Upload delivery photo proof | `create_delivery_proof_asset`, `confirm_delivery_proof_asset_upload`, `complete_delivery` | Yes |
| `CourierFailedAttempt` | Failed attempt | Record unreachable receiver, unsafe location, refusal, or other issue | `record_failed_attempt` | Yes |
| `CourierReturnToStation` | Return to station required | Route package back after failed attempts or issue | `record_failed_attempt`, `create_issue` | Yes |
| `CourierCompletedJobs` | Completed jobs | Review completed final-mile work | `list_deliveries` | No |
| `CourierEarnings` | Courier earnings | Show courier earnings | payouts when exposed | No |
| `CourierIssues` | Courier issues | View and report final-mile issues | `list_issues`, `create_issue` | Yes |

## Admin Web Console
| Screen ID | Screen | Primary Job | Backend Coverage | Required States |
| --- | --- | --- | --- | --- |
| `AdminSignIn` | Admin sign in | Authenticate admin | auth | loading, denied |
| `AdminOverview` | Overview | Show delivery, station, finance, issue, launch signals | `admin_overview` | loading, empty, error |
| `AdminLaunchReadiness` | Launch readiness | Show launch blockers and readiness checks | `admin_launch_readiness` | loading, ready, blocked |
| `AdminLaunchReadinessDetail` | Launch readiness detail | Explain each blocker and owner | `admin_launch_readiness` | blocked, resolved |
| `AdminDeliveryExplorer` | Delivery explorer | Search all deliveries with filters | `admin_deliveries` | loading, empty, filters |
| `AdminDeliveryDetail` | Delivery detail | Review state, payment, custody, proof, issues | `get_delivery`, admin delivery data | loading, not found |
| `AdminPackageDetail` | Package detail | Show package label, custody, scans, proof, issue state | `get_delivery`, timeline | loading, mismatch, exception |
| `AdminPackageLabelRegistry` | Package label registry view | Audit immutable scan-code binding | delivery/package label data | loading, not found |
| `AdminCustodyChain` | Custody chain | Show all handoff events and evidence hierarchy | `get_delivery_timeline`, audit data | missing evidence, exception |
| `AdminManualCustodyException` | Manual custody exception review | Review scan mismatch or custody conflict | issues/audit/delivery | open, escalated, resolved |
| `AdminBlockedDeliveryQueue` | Blocked delivery queue | Work payment, issue, custody, or station blockers | `admin_deliveries`, `list_issues` | loading, empty |
| `AdminStations` | Station list | Manage station readiness and status | `admin_stations` | loading, empty |
| `AdminStationDetail` | Station detail | Review station queues, validation, status | `admin_stations` | loading, unavailable |
| `AdminStationValidation` | Station validation | Validate station readiness before pilot | `admin_update_station_validation` | pending, valid, invalid |
| `AdminStationStatusOverride` | Station status override | Override station queue/status with audit | `admin_update_station_status` | confirm, saved, denied |
| `AdminStationCapacity` | Station capacity and queue pressure | Monitor station load and SLA risk | `admin_stations`, analytics | normal, overloaded |
| `AdminUsers` | User list | Manage sender/staff/admin records | `admin_users` | loading, empty, filters |
| `AdminUserDetail` | User detail | Review role, station, assignment, status | `admin_users`, `admin_upsert_user` | loading, denied |
| `AdminUserAccess` | Role and access management | Grant, suspend, reactivate, station-scope users | `admin_update_user_access` | confirm, saved, denied |
| `AdminStaffActivityLog` | Staff activity log | Audit staff actions and overrides | `admin_audit_events` | loading, empty |
| `AdminPricingRules` | Pricing rules | View active pricing config | `admin_pricing_rules` | loading, invalid |
| `AdminPricingRuleEdit` | Pricing rule edit | Update active route pricing safely | `admin_update_pricing_rules` | validation errors, saved |
| `AdminFinanceSummary` | Finance summary | Monitor collections, refunds, reconciliation | `admin_finance` | loading, empty |
| `AdminPaymentReconciliation` | Payment reconciliation | Review unresolved/conflicting provider records | `admin_payment_reconciliation` | loading, empty, conflict |
| `AdminPaymentReconciliationDetail` | Reconciliation detail | Inspect one payment mismatch | `admin_payment_reconciliation` | conflict, resolved |
| `AdminRefundReview` | Refund review | Approve or reject refund requests | `refund_payment`, issue/refund data | evidence missing, approved, rejected |
| `AdminRefundSettlement` | Refund settlement | Execute approved refunds | `settle_refund_payment` | pending, settled, failed |
| `AdminRefundEvidenceReview` | Refund evidence review | Compare policy, handoffs, proof, payment | delivery/timeline/issues | missing evidence, complete |
| `AdminIssueQueue` | Issue queue | Triage delivery/payment/refund/custody issues | `list_issues` | loading, empty, filters |
| `AdminIssueDetail` | Issue detail | Review and act on one issue | `get_issue`, `escalate_issue`, `resolve_issue` | open, escalated, resolved |
| `AdminSlaBreachDashboard` | SLA breach dashboard | Find late intake, dispatch, delivery, refunds | admin metrics | loading, empty, breach |
| `AdminAuditEvents` | Audit events | Search audit history | `admin_audit_events` | loading, empty |
| `AdminAuditEventDetail` | Audit event detail | Inspect one audit event | `admin_audit_events` | loading, not found |
| `AdminOutboundNotifications` | Outbound notifications | Monitor SMS/push/email outbox | `admin_outbound_notifications` | queued, sent, failed |
| `AdminNotificationDetail` | Notification delivery detail | Inspect and retry notification | `admin_outbound_notifications` | failed, retrying, sent |
| `AdminWebhookEvents` | Webhook events | Monitor provider callbacks | `admin_webhook_events` | loading, empty, failed |
| `AdminWebhookEventDetail` | Webhook event detail | Inspect webhook payload and processing result | `admin_webhook_events` | failed, replay needed |
| `AdminAnalytics` | Analytics and KPIs | Review pilot KPIs | `admin_overview`, analytics docs | loading, empty |
| `AdminExportReport` | Export report flow | Export deliveries, finance, issues, audit | admin list endpoints | generating, ready, failed |
| `AdminSettings` | Settings | Admin preferences and system links | admin config | normal |

## Auth And Account Screens
| Screen ID | Screen | Required For |
| --- | --- | --- |
| `AuthRoleSelection` | Auth landing and role selection | mobile role-aware entry |
| `InviteAcceptance` | Invite acceptance | staff/admin onboarding |
| `StaffAccountActivation` | Staff account activation | driver, courier, station operator launch |
| `PasswordlessPhoneLogin` | Passwordless or phone verification login | mobile auth |
| `SessionExpired` | Session expired | all authenticated apps |
| `AccountLocked` | Account locked or suspended | all authenticated apps |
| `PermissionDenied` | Permission denied | all role-gated routes |

## Shared Operational Modals
| Modal ID | Modal | Used By | Backend Coverage |
| --- | --- | --- | --- |
| `ConfirmDestructiveActionModal` | Confirm destructive action | cancellation, overrides, suspend user | relevant mutation |
| `CancelDeliveryReasonModal` | Cancel delivery reason | sender/support/admin | `cancel_delivery` |
| `ScanPackageModal` | Scan package | station, driver, courier | handoff routes |
| `WrongPackageScannedModal` | Wrong package scanned | station, driver, courier, admin | `PACKAGE_SCAN_MISMATCH` |
| `PackageLabelAlreadyUsedModal` | Package label already used | station intake | package label registry |
| `AcceptCustodyModal` | Accept custody | driver, courier | `confirm_pickup`, `accept_final_mile_assignment` |
| `RejectAssignmentModal` | Reject assignment | driver, courier | issue/assignment path when exposed |
| `FailedDeliveryReasonModal` | Failed delivery reason | courier | `record_failed_attempt` |
| `UploadProofModal` | Upload proof | courier, station when allowed | proof asset routes |
| `VerifyOtpModal` | Verify OTP | receiver/courier flow | public verification and completion |
| `EscalateIssueModal` | Escalate issue | admin/support | `escalate_issue` |
| `ResolveIssueModal` | Resolve issue | admin/support | `resolve_issue` |
| `RefundDecisionModal` | Refund approval/rejection | finance admin | `refund_payment` |
| `RefundSettlementModal` | Refund settlement confirmation | finance admin | `settle_refund_payment` |
| `StationStatusOverrideModal` | Override station status | admin | `admin_update_station_status` |
| `StationValidationModal` | Update station validation | admin | `admin_update_station_validation` |
| `PricingRuleUpdateModal` | Update pricing rule | finance admin | `admin_update_pricing_rules` |
| `SuspendReactivateUserModal` | Suspend/reactivate user | admin | `admin_update_user_access` |
| `RetryNotificationModal` | Retry notification | admin/support | admin notification tooling |
| `ReplayWebhookModal` | Replay webhook | technical/admin support when enabled | webhook tooling |
| `ExportReportModal` | Export report | admin/finance/support | admin list endpoints |
| `AuditSensitiveActionAckModal` | Acknowledge audit-sensitive action | all admin override actions | audit trail |

## Shared Screen States
Every role surface must implement these states through a shared state component library.

| State ID | Meaning | Required Recovery |
| --- | --- | --- |
| `loading` | Data or mutation in progress | visible progress and no double-submit |
| `empty` | No records match role/scope/filter | clear next action |
| `error` | Unexpected request or rendering failure | retry and support path |
| `offline` | Device has no reliable network | cached data marker and offline queue when allowed |
| `stale_data` | Cached data may be outdated | refresh action and timestamp |
| `not_authorized` | Role lacks permission | explain without leaking restricted data |
| `session_expired` | Auth token/session expired | re-authenticate |
| `blocked_by_payment` | Payment not confirmed or under review | pay/retry/review guidance |
| `blocked_by_issue` | Delivery cannot proceed due to issue | link issue detail |
| `manual_review_required` | Backend requires human/admin review | show owner and SLA |
| `scan_mismatch` | Package scan does not match delivery binding | rescan, escalate, audit warning |
| `duplicate_package_label` | Scan code already bound to another delivery | block intake and escalate |
| `custody_not_confirmed` | Acting party does not hold custody | show current owner and required handoff |
| `otp_required` | Delivery completion requires receiver token | open verification/proof flow |
| `proof_required` | Completion requires OTP, signature, or photo | open proof capture |
| `payment_under_review` | Provider result unresolved | show review copy, no transport bypass |
| `refund_pending` | Refund approved but not settled | show target date |
| `webhook_conflict` | Provider callback conflicts with known state | route to admin review |
| `rate_limited` | Too many attempts | show wait time and safe retry |

## Shared UI Infrastructure
Claude Code should build these before or alongside screens to avoid duplicated behavior.

| Component/System | Required Behavior |
| --- | --- |
| App shells | Separate public web, sender mobile, ops mobile, and admin web shells |
| Role routing | Route guards based on backend roles/capabilities, never client-only authority |
| Typed API client | Use shared schemas/contracts where available |
| RTK Query cache | Normalize server state and invalidate by delivery, issue, payment, station, notification |
| Offline outbox | Persist station, driver, and courier critical actions with idempotency keys |
| Scan component | Camera scan plus manual fallback, validation display, mismatch recovery |
| Proof capture component | OTP, signature, photo upload, upload confirmation, completion action |
| Timeline component | Sender, receiver-safe, staff, and admin variants |
| Custody chain component | Current owner, required next actor, proof, timestamps, exceptions |
| Payment status component | Pending, confirmed, failed, under review, refunded, partially refunded |
| Issue status component | Open, escalated, resolved, blocked, manual review |
| Notification system | Inbox, read/unread, toast, deep links to delivery/task |
| Form system | React Hook Form plus Zod, consistent field errors |
| Empty/error library | Shared state screens with role-safe copy |
| Accessibility foundation | Focus states, labels, reduced motion, contrast, text scaling |
| Localization foundation | Ghana launch copy first, string keys ready for expansion |
| Analytics tracking | Track major funnel, handoff, payment, proof, issue, refund, admin actions |
| Test harness | Unit/component tests plus E2E journeys for critical flows |

## Implementation Blueprint Rule
- Route paths, hook names, analytics event names, and test IDs in this section are binding for frontend implementation unless the backend contract changes.
- Any renamed screen must update this file, tests, navigation, analytics, and API hook usage in the same PR.
- Frontend code must not invent backend states, roles, statuses, payment outcomes, proof types, issue categories, or error codes outside shared contracts.
- Public and receiver routes must be treated as privacy-sensitive. They must never render sender IDs, staff IDs, provider references, audit metadata, raw issue descriptions, or internal payment details.
- Staff and admin routes must render operational detail only after role/capability checks pass.

## Exact Route Map
### Public Web Routes
| Screen ID | App Route | Primary Test ID |
| --- | --- | --- |
| `PublicLanding` | `/` | `screen-public-landing` |
| `PublicHowItWorks` | `/how-it-works` | `screen-public-how-it-works` |
| `PublicServiceAreas` | `/service-areas` | `screen-public-service-areas` |
| `PublicPricingExplainer` | `/pricing` | `screen-public-pricing` |
| `PublicTrustCustody` | `/trust-and-custody` | `screen-public-trust-custody` |
| `PublicSupportEntry` | `/support` | `screen-public-support` |
| `PublicDeliveryPolicy` | `/delivery-policy` | `screen-public-delivery-policy` |
| `PublicRefundPolicy` | `/refund-policy` | `screen-public-refund-policy` |
| `PublicPrivacy` | `/privacy` | `screen-public-privacy` |
| `PublicTerms` | `/terms` | `screen-public-terms` |
| `PublicTrackingEntry` | `/track` | `screen-public-track-entry` |
| `PublicMaintenance` | `/maintenance` | `screen-public-maintenance` |

### Receiver Public Routes
| Screen ID | App Route | Primary Test ID |
| --- | --- | --- |
| `ReceiverTrackingLanding` | `/r/:trackingCode` | `screen-receiver-tracking-landing` |
| `ReceiverPhoneChallenge` | `/r/:trackingCode/verify-phone` | `screen-receiver-phone-challenge` |
| `ReceiverOtpVerify` | `/r/:trackingCode/verify-otp` | `screen-receiver-otp-verify` |
| `ReceiverTrackingTimeline` | `/r/:trackingCode/timeline` | `screen-receiver-timeline` |
| `ReceiverArrivalInstructions` | `/r/:trackingCode/arrival` | `screen-receiver-arrival` |
| `ReceiverFailedAttempt` | `/r/:trackingCode/failed-attempt` | `screen-receiver-failed-attempt` |
| `ReceiverRefusalInfo` | `/r/:trackingCode/refusal` | `screen-receiver-refusal` |
| `TrackingLinkExpired` | `/r/expired` | `screen-tracking-expired` |
| `TrackingAccessDenied` | `/r/access-denied` | `screen-tracking-access-denied` |

### Sender Mobile Routes
| Screen ID | Expo Route | Primary Test ID |
| --- | --- | --- |
| `SenderOnboarding` | `/(sender)/onboarding` | `screen-sender-onboarding` |
| `SenderSignIn` | `/(auth)/sender/sign-in` | `screen-sender-sign-in` |
| `SenderAuthRecovery` | `/(auth)/sender/recovery` | `screen-sender-auth-recovery` |
| `SenderHome` | `/(sender)/home` | `screen-sender-home` |
| `CreateDeliveryStart` | `/(sender)/create` | `screen-create-delivery-start` |
| `CreateDeliveryStations` | `/(sender)/create/stations` | `screen-create-delivery-stations` |
| `CreateReceiverDetails` | `/(sender)/create/receiver` | `screen-create-receiver-details` |
| `CreatePackageDetails` | `/(sender)/create/package` | `screen-create-package-details` |
| `CreateDeliveryOptions` | `/(sender)/create/options` | `screen-create-delivery-options` |
| `QuoteReview` | `/(sender)/create/quote` | `screen-quote-review` |
| `DeliverySummary` | `/(sender)/create/summary` | `screen-delivery-summary` |
| `PaymentMethod` | `/(sender)/payments/:deliveryId/method` | `screen-payment-method` |
| `PaymentProcessing` | `/(sender)/payments/:deliveryId/processing` | `screen-payment-processing` |
| `PaymentResult` | `/(sender)/payments/:deliveryId/result` | `screen-payment-result` |
| `PaymentProviderReturn` | `/(sender)/payments/:deliveryId/provider-return` | `screen-payment-provider-return` |
| `PaymentFailedRecovery` | `/(sender)/payments/:deliveryId/recover` | `screen-payment-failed-recovery` |
| `SenderDeliveryDetail` | `/(sender)/deliveries/:deliveryId` | `screen-sender-delivery-detail` |
| `SenderTrackingTimeline` | `/(sender)/deliveries/:deliveryId/timeline` | `screen-sender-tracking-timeline` |
| `SenderDeliveryHistory` | `/(sender)/history` | `screen-sender-delivery-history` |
| `SenderReceiptDetail` | `/(sender)/receipts/:deliveryId` | `screen-sender-receipt-detail` |
| `SenderReceiptShare` | `/(sender)/receipts/:deliveryId/share` | `screen-sender-receipt-share` |
| `CancelDeliveryRequest` | `/(sender)/deliveries/:deliveryId/cancel` | `screen-cancel-delivery-request` |
| `SenderRefundStatus` | `/(sender)/deliveries/:deliveryId/refund` | `screen-sender-refund-status` |
| `SenderIssueCreate` | `/(sender)/deliveries/:deliveryId/issues/new` | `screen-sender-issue-create` |
| `SenderSupportThread` | `/(sender)/support/:issueId` | `screen-sender-support-thread` |
| `SenderNotifications` | `/(sender)/notifications` | `screen-sender-notifications` |
| `SenderProfile` | `/(sender)/profile` | `screen-sender-profile` |
| `SenderSettings` | `/(sender)/settings` | `screen-sender-settings` |

### Operations Shared Routes
| Screen ID | Expo Route | Primary Test ID |
| --- | --- | --- |
| `OpsRoleHome` | `/(ops)/home` | `screen-ops-role-home` |
| `OpsDeliveryDetail` | `/(ops)/deliveries/:deliveryId` | `screen-ops-delivery-detail` |
| `OpsScanPackage` | `/(ops)/deliveries/:deliveryId/scan` | `screen-ops-scan-package` |
| `OpsCustodyChain` | `/(ops)/deliveries/:deliveryId/custody` | `screen-ops-custody-chain` |
| `OpsOfflineOutbox` | `/(ops)/offline-outbox` | `screen-ops-offline-outbox` |
| `OpsActionRecovery` | `/(ops)/offline-outbox/:queuedActionId/recover` | `screen-ops-action-recovery` |
| `OpsIssueCreate` | `/(ops)/deliveries/:deliveryId/issues/new` | `screen-ops-issue-create` |
| `OpsSupport` | `/(ops)/support` | `screen-ops-support` |

### Station Operator Routes
| Screen ID | Expo Route | Primary Test ID |
| --- | --- | --- |
| `StationSignIn` | `/(auth)/station/sign-in` | `screen-station-sign-in` |
| `StationOverview` | `/(ops)/station/overview` | `screen-station-overview` |
| `StationIntakeQueue` | `/(ops)/station/intake` | `screen-station-intake-queue` |
| `StationPackageIntake` | `/(ops)/station/intake/:deliveryId` | `screen-station-package-intake` |
| `StationIntakeConfirmation` | `/(ops)/station/intake/:deliveryId/confirmation` | `screen-station-intake-confirmation` |
| `PackageLabelPrint` | `/(ops)/station/packages/:deliveryId/label/print` | `screen-package-label-print` |
| `PackageLabelReprint` | `/(ops)/station/packages/:deliveryId/label/reprint` | `screen-package-label-reprint` |
| `StationOutboundQueue` | `/(ops)/station/outbound` | `screen-station-outbound-queue` |
| `StationDriverAssignment` | `/(ops)/station/outbound/:deliveryId/assign-driver` | `screen-station-driver-assignment` |
| `StationDispatchReadiness` | `/(ops)/station/outbound/:deliveryId/dispatch` | `screen-station-dispatch-readiness` |
| `StationDriverPickupScan` | `/(ops)/station/outbound/:deliveryId/driver-pickup` | `screen-station-driver-pickup-scan` |
| `StationInboundQueue` | `/(ops)/station/inbound` | `screen-station-inbound-queue` |
| `StationDestinationReceipt` | `/(ops)/station/inbound/:deliveryId/receive` | `screen-station-destination-receipt` |
| `StationConditionCheck` | `/(ops)/station/inbound/:deliveryId/condition` | `screen-station-condition-check` |
| `StationFinalMileQueue` | `/(ops)/station/final-mile` | `screen-station-final-mile-queue` |
| `StationFinalMileAssignment` | `/(ops)/station/final-mile/:deliveryId/assign` | `screen-station-final-mile-assignment` |
| `StationHandoffLog` | `/(ops)/station/handoffs` | `screen-station-handoff-log` |
| `StationBlockedQueue` | `/(ops)/station/blocked` | `screen-station-blocked-queue` |
| `StationReports` | `/(ops)/station/reports` | `screen-station-reports` |
| `StationSupport` | `/(ops)/station/support` | `screen-station-support` |

### Driver Routes
| Screen ID | Expo Route | Primary Test ID |
| --- | --- | --- |
| `DriverSignIn` | `/(auth)/driver/sign-in` | `screen-driver-sign-in` |
| `DriverHome` | `/(ops)/driver/home` | `screen-driver-home` |
| `AssignedRuns` | `/(ops)/driver/runs` | `screen-assigned-runs` |
| `AssignedRunDetail` | `/(ops)/driver/runs/:deliveryId` | `screen-assigned-run-detail` |
| `DriverAcceptRun` | `/(ops)/driver/runs/:deliveryId/accept` | `screen-driver-accept-run` |
| `DriverManifest` | `/(ops)/driver/runs/:deliveryId/manifest` | `screen-driver-manifest` |
| `DriverOriginPickupScan` | `/(ops)/driver/runs/:deliveryId/pickup-scan` | `screen-driver-origin-pickup-scan` |
| `DriverCustodyAccepted` | `/(ops)/driver/runs/:deliveryId/custody-accepted` | `screen-driver-custody-accepted` |
| `DriverRoute` | `/(ops)/driver/runs/:deliveryId/route` | `screen-driver-route` |
| `DriverMarkInTransit` | `/(ops)/driver/runs/:deliveryId/in-transit` | `screen-driver-mark-in-transit` |
| `DriverDestinationArrival` | `/(ops)/driver/runs/:deliveryId/destination-arrival` | `screen-driver-destination-arrival` |
| `DriverDestinationHandoff` | `/(ops)/driver/runs/:deliveryId/destination-handoff` | `screen-driver-destination-handoff` |
| `DriverHistory` | `/(ops)/driver/history` | `screen-driver-history` |
| `DriverEarnings` | `/(ops)/driver/earnings` | `screen-driver-earnings` |
| `DriverSupport` | `/(ops)/driver/support` | `screen-driver-support` |

### Final-Mile Courier Routes
| Screen ID | Expo Route | Primary Test ID |
| --- | --- | --- |
| `CourierSignIn` | `/(auth)/courier/sign-in` | `screen-courier-sign-in` |
| `CourierHome` | `/(ops)/courier/home` | `screen-courier-home` |
| `CourierAssignments` | `/(ops)/courier/assignments` | `screen-courier-assignments` |
| `CourierAssignmentDetail` | `/(ops)/courier/assignments/:deliveryId` | `screen-courier-assignment-detail` |
| `CourierAcceptAssignmentScan` | `/(ops)/courier/assignments/:deliveryId/accept-scan` | `screen-courier-accept-assignment-scan` |
| `CourierCustodyAccepted` | `/(ops)/courier/assignments/:deliveryId/custody-accepted` | `screen-courier-custody-accepted` |
| `CourierOutForDelivery` | `/(ops)/courier/assignments/:deliveryId/out-for-delivery` | `screen-courier-out-for-delivery` |
| `CourierRoute` | `/(ops)/courier/assignments/:deliveryId/route` | `screen-courier-route` |
| `CourierProofCapture` | `/(ops)/courier/assignments/:deliveryId/proof` | `screen-courier-proof-capture` |
| `CourierOtpCompletion` | `/(ops)/courier/assignments/:deliveryId/proof/otp` | `screen-courier-otp-completion` |
| `CourierSignatureProof` | `/(ops)/courier/assignments/:deliveryId/proof/signature` | `screen-courier-signature-proof` |
| `CourierPhotoProof` | `/(ops)/courier/assignments/:deliveryId/proof/photo` | `screen-courier-photo-proof` |
| `CourierFailedAttempt` | `/(ops)/courier/assignments/:deliveryId/failed-attempt` | `screen-courier-failed-attempt` |
| `CourierReturnToStation` | `/(ops)/courier/assignments/:deliveryId/return-to-station` | `screen-courier-return-to-station` |
| `CourierCompletedJobs` | `/(ops)/courier/completed` | `screen-courier-completed-jobs` |
| `CourierEarnings` | `/(ops)/courier/earnings` | `screen-courier-earnings` |
| `CourierIssues` | `/(ops)/courier/issues` | `screen-courier-issues` |

### Admin Web Routes
| Screen ID | React Router Path | Primary Test ID |
| --- | --- | --- |
| `AdminSignIn` | `/admin/sign-in` | `screen-admin-sign-in` |
| `AdminOverview` | `/admin` | `screen-admin-overview` |
| `AdminLaunchReadiness` | `/admin/launch-readiness` | `screen-admin-launch-readiness` |
| `AdminLaunchReadinessDetail` | `/admin/launch-readiness/:blockerCode` | `screen-admin-launch-readiness-detail` |
| `AdminDeliveryExplorer` | `/admin/deliveries` | `screen-admin-delivery-explorer` |
| `AdminDeliveryDetail` | `/admin/deliveries/:deliveryId` | `screen-admin-delivery-detail` |
| `AdminPackageDetail` | `/admin/deliveries/:deliveryId/package` | `screen-admin-package-detail` |
| `AdminPackageLabelRegistry` | `/admin/package-labels` | `screen-admin-package-label-registry` |
| `AdminCustodyChain` | `/admin/deliveries/:deliveryId/custody` | `screen-admin-custody-chain` |
| `AdminManualCustodyException` | `/admin/custody-exceptions/:issueId` | `screen-admin-manual-custody-exception` |
| `AdminBlockedDeliveryQueue` | `/admin/deliveries/blocked` | `screen-admin-blocked-delivery-queue` |
| `AdminStations` | `/admin/stations` | `screen-admin-stations` |
| `AdminStationDetail` | `/admin/stations/:stationId` | `screen-admin-station-detail` |
| `AdminStationValidation` | `/admin/stations/:stationId/validation` | `screen-admin-station-validation` |
| `AdminStationStatusOverride` | `/admin/stations/:stationId/status` | `screen-admin-station-status-override` |
| `AdminStationCapacity` | `/admin/stations/capacity` | `screen-admin-station-capacity` |
| `AdminUsers` | `/admin/users` | `screen-admin-users` |
| `AdminUserDetail` | `/admin/users/:userId` | `screen-admin-user-detail` |
| `AdminUserAccess` | `/admin/users/:userId/access` | `screen-admin-user-access` |
| `AdminStaffActivityLog` | `/admin/staff-activity` | `screen-admin-staff-activity-log` |
| `AdminPricingRules` | `/admin/pricing-rules` | `screen-admin-pricing-rules` |
| `AdminPricingRuleEdit` | `/admin/pricing-rules/edit` | `screen-admin-pricing-rule-edit` |
| `AdminFinanceSummary` | `/admin/finance` | `screen-admin-finance-summary` |
| `AdminPaymentReconciliation` | `/admin/finance/reconciliation` | `screen-admin-payment-reconciliation` |
| `AdminPaymentReconciliationDetail` | `/admin/finance/reconciliation/:paymentId` | `screen-admin-payment-reconciliation-detail` |
| `AdminRefundReview` | `/admin/finance/refunds/:paymentId/review` | `screen-admin-refund-review` |
| `AdminRefundSettlement` | `/admin/finance/refunds/:paymentId/settle` | `screen-admin-refund-settlement` |
| `AdminRefundEvidenceReview` | `/admin/finance/refunds/:paymentId/evidence` | `screen-admin-refund-evidence-review` |
| `AdminIssueQueue` | `/admin/issues` | `screen-admin-issue-queue` |
| `AdminIssueDetail` | `/admin/issues/:issueId` | `screen-admin-issue-detail` |
| `AdminSlaBreachDashboard` | `/admin/sla-breaches` | `screen-admin-sla-breach-dashboard` |
| `AdminAuditEvents` | `/admin/audit-events` | `screen-admin-audit-events` |
| `AdminAuditEventDetail` | `/admin/audit-events/:eventId` | `screen-admin-audit-event-detail` |
| `AdminOutboundNotifications` | `/admin/outbound-notifications` | `screen-admin-outbound-notifications` |
| `AdminNotificationDetail` | `/admin/outbound-notifications/:outboundNotificationId` | `screen-admin-notification-detail` |
| `AdminWebhookEvents` | `/admin/webhook-events` | `screen-admin-webhook-events` |
| `AdminWebhookEventDetail` | `/admin/webhook-events/:eventId` | `screen-admin-webhook-event-detail` |
| `AdminAnalytics` | `/admin/analytics` | `screen-admin-analytics` |
| `AdminExportReport` | `/admin/exports/new` | `screen-admin-export-report` |
| `AdminSettings` | `/admin/settings` | `screen-admin-settings` |

### Auth And Utility Routes
| Screen ID | App Route | Primary Test ID |
| --- | --- | --- |
| `AuthRoleSelection` | `/(auth)/role-selection` | `screen-auth-role-selection` |
| `InviteAcceptance` | `/invite/:inviteToken` | `screen-invite-acceptance` |
| `StaffAccountActivation` | `/(auth)/staff/activate` | `screen-staff-account-activation` |
| `PasswordlessPhoneLogin` | `/(auth)/phone-login` | `screen-passwordless-phone-login` |
| `SessionExpired` | `/session-expired` | `screen-session-expired` |
| `AccountLocked` | `/account-locked` | `screen-account-locked` |
| `PermissionDenied` | `/permission-denied` | `screen-permission-denied` |

## Field Requirements By Flow
### Sender Delivery Creation
| Flow Step | Required Fields | Validation Source | UI Rule |
| --- | --- | --- | --- |
| Station selection | `originStationId`, `destinationStationId` | `createDeliveryRequestSchema` | Origin and destination must be different. |
| Receiver details | `receiver.name`, `receiver.phone`, optional `receiver.addressText` | `deliveryReceiverSchema` | Phone must be E.164. Doorstep requires address. |
| Package details | `package.description`, `package.weightKg`, `package.sizeTier`, `package.isFragile`, `package.declaredValueGhs` | `deliveryPackageSchema` | Declared value max is `5000` GHS. |
| Delivery options | `serviceType`, `doorstepRequested`, optional `doorstepDistanceKm` | `serviceTypeSchema`, `createDeliveryRequestSchema` | Doorstep requires distance estimate and address; omit distance when not doorstep. |
| Quote review | backend quote response | `createDeliveryResponseSchema` | Show GHS amount and payment-before-dispatch rule. |

### Payment And Refund
| Flow Step | Required Fields | Validation Source | UI Rule |
| --- | --- | --- | --- |
| Initialize payment | `deliveryId`, `provider=mtn_momo`, `payerPhone`, `amountGhs` | `paymentInitializeRequestSchema` | Never let user edit amount after backend quote locks. |
| Verify payment | `deliveryId` | `paymentVerifyRequestSchema` | Poll or retry without creating duplicate payments. |
| Refund review | `paymentId`, refund reason booleans | `refundPaymentRequestSchema` | Show policy explanation before approval. |
| Refund settlement | `paymentId`, `refundReference`, optional `settledAt` | `settleRefundRequestSchema` | Finance-only and audit acknowledged. |

### Handoff And Custody
| Flow Step | Required Fields | Validation Source | UI Rule |
| --- | --- | --- | --- |
| Intake | `measuredWeightKg`, `sizeTier`, `condition`, `labelScanCode` | `confirmIntakeRequestSchema` | This binds first scan code to delivery. |
| Dispatch readiness | `packageScanCode` | `dispatchDeliveryRequestSchema` | Dispatch readiness does not move custody. |
| Driver pickup | `packageScanCode` | `confirmDriverPickupRequestSchema` | Assigned driver scan moves custody to driver. |
| Destination receipt | `packageScanCode`, `condition`, `nextStep` | `receiveDestinationRequestSchema` | Destination station scan moves custody to station. |
| Final-mile assignment | `courierUserId` | `assignFinalMileRequestSchema` | Assignment does not move custody. |
| Courier accept assignment | `packageScanCode`, optional `note` | `acceptFinalMileAssignmentRequestSchema` | Assigned courier scan moves custody to courier. |
| Out for delivery | optional `note` | `markOutForDeliveryRequestSchema` | Only allowed after confirmed courier custody. |
| Failed attempt | `reasonCode`, optional `note` | `recordFailedAttemptRequestSchema` | Reason must be one of the backend enum values. |

### Proof And Completion
| Flow Step | Required Fields | Validation Source | UI Rule |
| --- | --- | --- | --- |
| Receiver phone challenge | `phone` | `requestPhoneVerificationChallengeRequestSchema` | Show masked phone and resend availability. |
| Receiver OTP verify | `phone`, `otp` | `verifyPhoneRequestSchema` | Store verification token only for delivery completion context. |
| Create proof upload | `proofType`, `contentType`, `byteSize`, optional `sha256` | `createProofAssetUploadRequestSchema` | Max file size is `8_000_000` bytes. |
| Confirm proof upload | `byteSize`, `sha256`, optional `storageGeneration` | `confirmProofAssetUploadRequestSchema` | Must confirm upload before completion. |
| Complete delivery | `proofType`, `proofReference`, `receivedByName` | `completeDeliveryRequestSchema` | OTP proof reference must be active receiver verification token. |

### Issues, Users, Stations, Pricing
| Flow Step | Required Fields | Validation Source | UI Rule |
| --- | --- | --- | --- |
| Create issue | `deliveryId`, `category`, `severity`, `summary`, optional `description` | `createIssueRequestSchema` | Do not expose internal-only issue detail to receiver. |
| Escalate issue | `reasonCode`, `note` | `escalateIssueRequestSchema` | Admin/support only. |
| Resolve issue | `nextStatus`, `note`, conditional `resolutionCode` | `resolveIssueRequestSchema` | `resolutionCode` required for resolved or closed. |
| Upsert user | `userId`, `fullName`, `role`, optional `status`, `stationId`, `email`, `phone` | `adminUpsertUserRequestSchema` | Station operators require `stationId`; admin/sender roles must not have one. |
| Update access | `role`, `status`, optional `stationId` | `adminUpdateUserAccessRequestSchema` | Suspending users requires confirmation modal. |
| Update station status | `operatingStatus`, `intakeStatus`, `serviceAvailability`, optional `note` | `adminUpdateStationStatusRequestSchema` | Audit-sensitive override copy required. |
| Update station validation | dry-run days, pilot days, checklist, scan fallback rate, optional blockers/timestamps/note | `adminUpdateStationValidationRequestSchema` | Validation drives launch readiness. |
| Update pricing rules | complete `routeBaseFees`, optional `effectiveAt`, optional `note` | `adminUpdatePricingRulesRequestSchema` | Must include all launch corridors and no duplicates. |

## Planned API Hook Contract
| Operation ID | RTK Query Hook | Type | Cache Tags |
| --- | --- | --- | --- |
| `list_deliveries` | `useListDeliveriesQuery` | query | `DeliveryList`, `Delivery` |
| `create_delivery` | `useCreateDeliveryMutation` | mutation | invalidates `DeliveryList` |
| `cancel_delivery` | `useCancelDeliveryMutation` | mutation | invalidates `Delivery`, `DeliveryList`, `Payment` |
| `get_delivery` | `useGetDeliveryQuery` | query | `Delivery` |
| `get_delivery_timeline` | `useGetDeliveryTimelineQuery` | query | `DeliveryTimeline` |
| `get_public_tracking` | `useGetPublicTrackingQuery` | query | `PublicTracking` |
| `request_public_tracking_phone_challenge` | `useRequestPublicTrackingPhoneChallengeMutation` | mutation | invalidates `PublicTracking` |
| `verify_public_tracking_phone` | `useVerifyPublicTrackingPhoneMutation` | mutation | invalidates `PublicTracking` |
| `initialize_payment` | `useInitializePaymentMutation` | mutation | invalidates `Payment`, `Delivery` |
| `verify_payment` | `useVerifyPaymentMutation` | mutation | invalidates `Payment`, `Delivery` |
| `refund_payment` | `useRefundPaymentMutation` | mutation | invalidates `Payment`, `AdminFinance` |
| `settle_refund_payment` | `useSettleRefundPaymentMutation` | mutation | invalidates `Payment`, `AdminFinance` |
| `confirm_intake` | `useConfirmIntakeMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `StationQueue` |
| `assign_driver` | `useAssignDriverMutation` | mutation | invalidates `Delivery`, `StationQueue`, `DriverQueue` |
| `accept_run` | `useAcceptRunMutation` | mutation | invalidates `Delivery`, `DriverQueue` |
| `dispatch_delivery` | `useDispatchDeliveryMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `StationQueue` |
| `confirm_pickup` | `useConfirmPickupMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `DriverQueue`, `StationQueue` |
| `mark_in_transit` | `useMarkInTransitMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `DriverQueue` |
| `receive_destination` | `useReceiveDestinationMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `StationQueue` |
| `assign_final_mile` | `useAssignFinalMileMutation` | mutation | invalidates `Delivery`, `StationQueue`, `CourierQueue` |
| `accept_final_mile_assignment` | `useAcceptFinalMileAssignmentMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `CourierQueue` |
| `mark_out_for_delivery` | `useMarkOutForDeliveryMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `CourierQueue` |
| `record_failed_attempt` | `useRecordFailedAttemptMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `CourierQueue`, `IssueList` |
| `create_delivery_proof_asset` | `useCreateDeliveryProofAssetMutation` | mutation | invalidates `ProofAsset` |
| `confirm_delivery_proof_asset_upload` | `useConfirmDeliveryProofAssetUploadMutation` | mutation | invalidates `ProofAsset` |
| `complete_delivery` | `useCompleteDeliveryMutation` | mutation | invalidates `Delivery`, `DeliveryTimeline`, `CourierQueue` |
| `list_issues` | `useListIssuesQuery` | query | `IssueList`, `Issue` |
| `create_issue` | `useCreateIssueMutation` | mutation | invalidates `IssueList`, `Delivery` |
| `get_issue` | `useGetIssueQuery` | query | `Issue` |
| `escalate_issue` | `useEscalateIssueMutation` | mutation | invalidates `Issue`, `IssueList` |
| `resolve_issue` | `useResolveIssueMutation` | mutation | invalidates `Issue`, `IssueList`, `Delivery` |
| `list_notifications` | `useListNotificationsQuery` | query | `NotificationList` |
| `admin_overview` | `useAdminOverviewQuery` | query | `AdminOverview` |
| `admin_deliveries` | `useAdminDeliveriesQuery` | query | `AdminDeliveryList`, `Delivery` |
| `admin_stations` | `useAdminStationsQuery` | query | `AdminStationList`, `Station` |
| `admin_launch_readiness` | `useAdminLaunchReadinessQuery` | query | `LaunchReadiness` |
| `admin_finance` | `useAdminFinanceQuery` | query | `AdminFinance`, `Payment` |
| `admin_pricing_rules` | `useAdminPricingRulesQuery` | query | `PricingRules` |
| `admin_update_pricing_rules` | `useAdminUpdatePricingRulesMutation` | mutation | invalidates `PricingRules` |
| `admin_users` | `useAdminUsersQuery` | query | `AdminUserList`, `User` |
| `admin_upsert_user` | `useAdminUpsertUserMutation` | mutation | invalidates `AdminUserList`, `User` |
| `admin_update_user_access` | `useAdminUpdateUserAccessMutation` | mutation | invalidates `AdminUserList`, `User` |
| `admin_update_station_status` | `useAdminUpdateStationStatusMutation` | mutation | invalidates `AdminStationList`, `Station`, `LaunchReadiness` |
| `admin_update_station_validation` | `useAdminUpdateStationValidationMutation` | mutation | invalidates `AdminStationList`, `Station`, `LaunchReadiness` |
| `admin_audit_events` | `useAdminAuditEventsQuery` | query | `AuditEventList` |
| `admin_outbound_notifications` | `useAdminOutboundNotificationsQuery` | query | `OutboundNotificationList` |
| `admin_payment_reconciliation` | `useAdminPaymentReconciliationQuery` | query | `PaymentReconciliation` |
| `admin_webhook_events` | `useAdminWebhookEventsQuery` | query | `WebhookEventList` |
| `ingest_mtn_momo_webhook` | none | server-only | admin observes through `useAdminWebhookEventsQuery` |
| `dispatch_due_outbound_notifications` | none | server-only | admin observes through `useAdminOutboundNotificationsQuery` |
| `reconcile_due_payments` | none | server-only | admin observes through `useAdminPaymentReconciliationQuery` |

## Copy And Error Handling Contract
| Backend Error/State | User-Facing Copy | Primary CTA | Applies To |
| --- | --- | --- | --- |
| `AUTH_REQUIRED` | `Sign in again to continue.` | `Sign in` | authenticated apps |
| `FORBIDDEN` or `FORBIDDEN_ROLE` | `You do not have permission for this action.` | `Go back` | all role-gated screens |
| `STATION_SCOPE_VIOLATION` | `This delivery is outside your station scope.` | `Return to station queue` | station |
| `ASSIGNMENT_SCOPE_VIOLATION` | `This job is not assigned to you.` | `Refresh assignments` | driver, courier |
| `NOT_FOUND` or `DELIVERY_NOT_FOUND` | `Delivery record not found.` | `Check code or contact support` | sender, receiver, admin |
| `INVALID_STATUS_TRANSITION` | `This delivery cannot move to that state yet.` | `View current status` | staff, admin |
| `DELIVERY_NOT_PAID` or `PAYMENT_REQUIRED` | `Payment must be confirmed before this action.` | `View payment` | sender, station, driver, courier |
| `HANDOFF_PROOF_REQUIRED` | `Required handoff proof is missing.` | `Add proof` | staff |
| `PHONE_VERIFICATION_REQUIRED` | `Receiver phone verification is required before completion.` | `Verify receiver` | receiver, courier |
| `PACKAGE_ALREADY_RECEIVED` | `This package was already received.` | `View handoff log` | station |
| `PACKAGE_SCAN_MISMATCH` | `This scan code does not match the delivery.` | `Scan again` | station, driver, courier |
| `PACKAGE_NOT_READY_FOR_DISPATCH` | `This package is not ready for dispatch.` | `Review blockers` | station |
| `FINAL_PROOF_REQUIRED` | `Delivery proof is required to complete this job.` | `Capture proof` | courier |
| `FINAL_MILE_NOT_AVAILABLE` | `Doorstep delivery is not available for this package.` | `Choose pickup` | sender, station |
| `REATTEMPT_LIMIT_REACHED` | `The reattempt limit has been reached.` | `Return to station` | courier, station |
| `PAYMENT_FAILED` | `Payment could not be completed.` | `Try again` | sender |
| `PAYMENT_ALREADY_CONFIRMED` | `This payment was already confirmed.` | `View receipt` | sender, admin |
| `PAYMENT_PROVIDER_UNAVAILABLE` | `Payment service is temporarily unavailable.` | `Try later` | sender |
| `REFUND_NOT_ALLOWED` | `This payment is not eligible for refund.` | `Review policy` | sender, finance |
| `REFUND_ALREADY_PROCESSED` | `This refund has already been processed.` | `View refund` | finance |
| `DUPLICATE_SCAN` | `This package scan was already recorded.` | `View custody chain` | staff |
| `CONFLICTING_HANDOFF_STATE` | `The handoff state conflicts with the current record.` | `Escalate issue` | staff, admin |
| `ISSUE_LOCK_ACTIVE` | `This delivery is locked while an issue is being reviewed.` | `Open issue` | staff, admin |
| `VALIDATION_ERROR` | `Some required information is missing or invalid.` | `Fix details` | all forms |
| `RATE_LIMITED` | `Too many attempts. Please wait before trying again.` | `Try later` | public, receiver, auth |
| `PROVIDER_TIMEOUT` | `The external service took too long to respond.` | `Retry` | payment, webhooks |
| `INTERNAL_ERROR` or `UNKNOWN_INTERNAL_ERROR` | `Something went wrong on our side.` | `Try again` | all surfaces |
| `manual_review` | `This needs manual review before it can continue.` | `View review` | admin, support |
| `dead_letter` | `Notification delivery failed after retries.` | `Review notification` | admin |

## Analytics Event Contract
| Event Name | Trigger | Required Properties |
| --- | --- | --- |
| `public_landing_viewed` | public landing render | `surface`, `route` |
| `public_tracking_submitted` | tracking code submit | `trackingCodePrefix`, `result` |
| `receiver_phone_challenge_requested` | receiver requests SMS challenge | `trackingCode`, `challengeStatus` |
| `receiver_phone_verified` | receiver OTP verified | `trackingCode`, `verifiedAt` |
| `sender_delivery_create_started` | sender starts delivery draft | `senderId` |
| `sender_delivery_quote_viewed` | quote screen rendered | `originStationId`, `destinationStationId`, `serviceType`, `doorstepRequested` |
| `sender_delivery_created` | create delivery succeeds | `deliveryId`, `trackingCode`, `quoteAmountGhs` |
| `payment_initialized` | payment initialization succeeds | `deliveryId`, `paymentId`, `provider` |
| `payment_verified` | payment verification returns | `deliveryId`, `paymentId`, `paymentStatus` |
| `delivery_cancel_requested` | cancellation submitted | `deliveryId`, `reasonCode` |
| `issue_created` | issue creation succeeds | `deliveryId`, `issueId`, `category`, `severity` |
| `station_intake_confirmed` | intake succeeds | `deliveryId`, `stationId`, `condition`, `sizeTier` |
| `package_scan_failed` | scan mismatch or duplicate | `deliveryId`, `actorRole`, `errorCode` |
| `driver_run_accepted` | driver accepts run | `deliveryId`, `driverUserId` |
| `driver_pickup_confirmed` | driver custody accepted | `deliveryId`, `driverUserId` |
| `delivery_marked_in_transit` | in-transit update succeeds | `deliveryId`, `driverUserId` |
| `destination_receipt_confirmed` | destination station receipt succeeds | `deliveryId`, `stationId`, `condition`, `nextStep` |
| `final_mile_assigned` | courier assignment succeeds | `deliveryId`, `courierUserId` |
| `courier_assignment_accepted` | courier custody accepted | `deliveryId`, `courierUserId` |
| `delivery_marked_out_for_delivery` | out-for-delivery succeeds | `deliveryId`, `courierUserId` |
| `proof_asset_uploaded` | proof upload confirmed | `deliveryId`, `proofAssetId`, `proofType`, `byteSize` |
| `delivery_completed` | completion succeeds | `deliveryId`, `proofType` |
| `failed_attempt_recorded` | final-mile failed attempt recorded | `deliveryId`, `reasonCode` |
| `admin_launch_readiness_viewed` | launch readiness screen viewed | `status`, `blockerCount` |
| `admin_pricing_rules_updated` | pricing rules update succeeds | `pricingRuleId`, `routeCount` |
| `admin_user_access_updated` | user access update succeeds | `userId`, `role`, `status` |
| `admin_station_status_updated` | station status update succeeds | `stationId`, `operatingStatus`, `intakeStatus` |
| `admin_station_validation_updated` | station validation update succeeds | `stationId`, `validationStatus`, `goLiveEligible` |
| `refund_review_completed` | refund review succeeds | `paymentId`, `refundStatus`, `refundAmountGhs` |
| `refund_settled` | refund settlement succeeds | `paymentId`, `refundReference` |
| `issue_escalated` | issue escalated | `issueId`, `reasonCode` |
| `issue_resolved` | issue resolved or closed | `issueId`, `nextStatus`, `resolutionCode` |
| `offline_action_queued` | offline mutation queued | `routeKey`, `actorRole`, `deliveryId` |
| `offline_action_replayed` | queued mutation replayed | `routeKey`, `actorRole`, `result` |

## E2E Test Case Contract
| Test Case ID | Journey | Required Assertions |
| --- | --- | --- |
| `e2e-public-track-receiver-otp` | Receiver opens tracking link, requests challenge, verifies OTP | receiver-safe status renders, OTP token path works, no internal data leaks |
| `e2e-sender-create-pay-track` | Sender creates delivery, pays, and tracks | quote locks, payment confirms, timeline updates |
| `e2e-sender-cancel-eligible-delivery` | Sender cancels eligible delivery | cancellation reason submits, refund state renders when applicable |
| `e2e-station-intake-label-binding` | Station intakes package | package scan binds once, duplicate label blocks |
| `e2e-station-dispatch-no-custody-transfer` | Station dispatches readiness | custody remains station until driver scan |
| `e2e-driver-pickup-custody-transfer` | Driver accepts run and confirms pickup | assigned driver required, scan match required, custody becomes driver |
| `e2e-destination-receipt-condition-check` | Destination station receives package | package scan required, condition stored, next step routes |
| `e2e-final-mile-assignment-no-custody-transfer` | Station assigns courier | custody remains station until courier scan |
| `e2e-courier-accepts-custody` | Courier scans package and accepts assignment | assigned courier required, custody becomes courier |
| `e2e-courier-completes-with-otp` | Courier completes delivery with receiver OTP | active receiver token required, proof recorded |
| `e2e-courier-completes-with-photo-proof` | Courier uploads photo and completes delivery | upload create, storage PUT, confirm upload, complete |
| `e2e-courier-failed-attempt-reroute` | Courier records failed attempt | reason stored, correct route/status shown |
| `e2e-admin-delivery-custody-audit` | Admin opens delivery detail and custody chain | timeline, handoff events, scan evidence, audit links visible |
| `e2e-admin-pricing-rule-update` | Finance admin updates pricing rules | complete corridor table enforced, new quote uses new rule |
| `e2e-admin-refund-settlement` | Finance admin reviews and settles refund | evidence shown, approval/settlement states update |
| `e2e-admin-launch-readiness-blocked-ready` | Admin reviews launch readiness | blockers render, ready state renders when clear |
| `e2e-offline-outbox-replay` | Staff action queues offline and replays online | idempotency key persists, duplicate prevention works |
| `e2e-role-permission-guards` | Users attempt wrong-role actions | forbidden state renders, no restricted data leaks |

## Implementation Ownership And Order
| Order | Work Package | Owner Role | Exit Criteria |
| --- | --- | --- | --- |
| 1 | Shared design tokens, app shells, route guards, API client, state components | frontend platform | apps can render protected shells and shared states |
| 2 | Public web landing, policy pages, tracking entry, receiver tracking and OTP | web frontend | receiver-safe public flow passes E2E |
| 3 | Sender create, quote, payment, delivery detail, tracking, history, issue creation | mobile frontend | sender create-pay-track E2E passes |
| 4 | Shared ops scan, custody chain, offline outbox, issue creation | mobile platform | station/driver/courier can share scan and offline systems |
| 5 | Station intake, dispatch, destination receipt, final-mile assignment, blocked queue | ops mobile | custody gates and label binding E2E pass |
| 6 | Driver assigned runs, accept, pickup, in-transit, destination handoff | ops mobile | driver custody E2E passes |
| 7 | Courier assignment, out-for-delivery, proof, completion, failed attempt | ops mobile | OTP/photo/signature proof E2E passes |
| 8 | Admin overview, launch readiness, deliveries, custody, stations, users | admin frontend | launch readiness and admin delivery audit E2E pass |
| 9 | Admin finance, pricing, refunds, reconciliation, webhooks, notifications, audit | admin/frontend finance | finance/refund/reconciliation E2E pass |
| 10 | Analytics, accessibility, localization, export, polish, regression pass | frontend platform | all P0/P1 screens meet launch checklist |

## Design Reference Contract
| Screen Family | Primary Design Reference | Required Visual Behavior |
| --- | --- | --- |
| Public web | `design-system.md`, `copy-deck.md`, `accessibility-and-localization.md` | outcome-led, trust-heavy, one primary CTA per page |
| Sender mobile | `sender-app-spec.md`, `wireframes.md`, `design-system.md` | fast booking, clear payment and tracking hierarchy |
| Receiver public | `tracking-spec.md`, `notifications-spec.md`, `accessibility-and-localization.md` | privacy-safe, low-friction, OTP guidance prominent |
| Station ops | `station-operator-spec.md`, `handoff-rules.md`, `delivery-lifecycle.md` | scan-first, queue-first, blocked states obvious |
| Driver ops | `driver-app-spec.md`, `handoff-rules.md` | assigned work first, custody status always visible |
| Courier ops | `doorstep-delivery-spec.md`, `doorstep-delivery-rules.md`, `handoff-rules.md` | next stop/proof action first, failed attempt recovery clear |
| Admin | `admin-dashboard-spec.md`, `dashboard-metrics.md`, `support-and-escalation-rules.md` | dense but calm, filters, evidence, audit, and owner visible |
| Finance | `payments-spec.md`, `refund-and-dispute-rules.md`, `reconciliation-spec.md` | amounts, provider references, status, and evidence hierarchy visible |

## Test ID Convention
- Screen root: `screen-{screen-slug}`.
- Primary action button: `action-{screen-slug}-{verb}`.
- Form field: `field-{schema-field-path}` using kebab case, for example `field-receiver-phone`.
- Error state: `state-{screen-slug}-{state-id}`.
- Modal root: `modal-{modal-slug}`.
- Queue row: `row-{entity-slug}-{entity-id}`.
- Timeline entry: `timeline-entry-{entry-id}`.
- Custody step: `custody-step-{delivery-id}-{step-name}`.
- Offline queued action: `offline-action-{route-key}-{local-id}`.

## Backend Route Coverage
| Operation ID | Required Frontend Coverage |
| --- | --- |
| `list_deliveries` | Sender history/home, staff queues, driver runs, courier assignments |
| `create_delivery` | Sender create delivery flow |
| `cancel_delivery` | Sender cancellation and admin/support cancellation review |
| `get_delivery` | Sender detail, staff detail, admin detail |
| `get_delivery_timeline` | Tracking timeline, custody chain, admin audit view |
| `get_public_tracking` | Public tracking and receiver tracking |
| `request_public_tracking_phone_challenge` | Receiver phone challenge |
| `verify_public_tracking_phone` | Receiver OTP verification |
| `initialize_payment` | Sender payment method and retry |
| `verify_payment` | Payment processing, provider return, payment recovery |
| `refund_payment` | Admin refund review |
| `settle_refund_payment` | Admin refund settlement |
| `confirm_intake` | Station package intake |
| `assign_driver` | Station driver assignment |
| `accept_run` | Driver accept run |
| `dispatch_delivery` | Station dispatch readiness |
| `confirm_pickup` | Driver origin pickup scan and custody acceptance |
| `mark_in_transit` | Driver in-transit status |
| `receive_destination` | Station destination receipt |
| `assign_final_mile` | Station final-mile assignment |
| `accept_final_mile_assignment` | Courier package scan and custody acceptance |
| `mark_out_for_delivery` | Courier out-for-delivery |
| `record_failed_attempt` | Courier failed attempt |
| `create_delivery_proof_asset` | Courier proof upload |
| `confirm_delivery_proof_asset_upload` | Courier proof upload confirmation |
| `complete_delivery` | Courier/station delivery completion with proof |
| `list_issues` | Sender support, staff support, admin issue queue |
| `create_issue` | Sender, staff, receiver support issue creation |
| `get_issue` | Support thread and admin issue detail |
| `escalate_issue` | Admin issue escalation |
| `resolve_issue` | Admin issue resolution |
| `list_notifications` | Sender/staff notification inbox |
| `admin_overview` | Admin overview and analytics |
| `admin_deliveries` | Admin delivery explorer and blocked queue |
| `admin_stations` | Admin stations, station capacity, station detail |
| `admin_launch_readiness` | Admin launch readiness |
| `admin_finance` | Admin finance summary |
| `admin_pricing_rules` | Admin pricing rules |
| `admin_update_pricing_rules` | Admin pricing edit |
| `admin_users` | Admin users |
| `admin_upsert_user` | Admin create/update user |
| `admin_update_user_access` | Admin role/access management |
| `admin_update_station_status` | Admin station status override |
| `admin_update_station_validation` | Admin station validation |
| `admin_audit_events` | Admin audit events and staff activity log |
| `admin_outbound_notifications` | Admin notifications outbox |
| `admin_payment_reconciliation` | Admin payment reconciliation |
| `admin_webhook_events` | Admin webhook event monitoring |
| `ingest_mtn_momo_webhook` | No direct user screen; admin webhook event observability required |
| `dispatch_due_outbound_notifications` | No direct user screen; admin notification observability required |
| `reconcile_due_payments` | No direct user screen; admin reconciliation observability required |

## Required E2E Journeys
- Sender creates delivery, pays, tracks, and views receipt.
- Sender cancels eligible delivery and sees cancellation result.
- Receiver opens tracking link, verifies phone, sees tracking, and provides OTP for delivery.
- Origin station intakes package and binds package label.
- Station assigns driver and dispatches readiness without moving custody.
- Driver accepts run, scans package, takes custody, marks in transit, and hands off to destination station.
- Destination station receives package with scan and condition check.
- Station assigns final-mile courier without moving custody.
- Courier scans package, accepts custody, marks out for delivery, completes with OTP proof.
- Courier records failed attempt and the delivery routes correctly.
- Admin searches delivery and verifies timeline, payment, custody chain, issue state, and audit history.
- Finance admin reviews payment reconciliation and executes refund settlement.
- Support admin escalates and resolves an issue.
- Admin updates pricing rules and verifies new deliveries use active pricing while old deliveries keep locked quote.
- Offline station/driver/courier action queues and retries with idempotency.

## Launch Completeness Checklist
- Every P0 screen exists in the intended app shell.
- Every P0 mutation uses backend response state, not optimistic status authority.
- Every custody screen blocks progress on scan mismatch.
- Every final-mile completion path requires OTP token, signature proof, or photo proof.
- Every payment-gated transport action shows a blocked state when payment is not confirmed.
- Every admin override requires confirmation and audit-sensitive copy.
- Every route has loading, empty, error, offline, and unauthorized states where relevant.
- Every critical state has user-safe copy and support escalation.
- Every staff critical action works with idempotency and offline outbox where required.
- Every public receiver screen avoids leaking sender, staff, payment, or internal issue details.
- Every frontend package has tests for critical screens, states, and role guards.

## Do Not Build For V1
- Full receiver accounts.
- Public rating pages.
- Enterprise invoice portal.
- AI chat assistant UI.
- Advanced route optimization map.
- Warehouse inventory management.
- Fleet telematics console.
- Marketplace or merchant portal.

## Baseline Status
This file is implementation-ready as the frontend UI checklist for Claude Code. It should be updated whenever backend route coverage, launch policy, or role permissions change.

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

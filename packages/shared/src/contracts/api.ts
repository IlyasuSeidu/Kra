import { z } from "zod";

import { serviceTypes, sizeTiers, stationIds } from "../domain/pricing";
import { deliveryStatuses } from "../domain/state-machine";

export const stationIdSchema = z.enum(stationIds);
export const sizeTierSchema = z.enum(sizeTiers);
export const serviceTypeSchema = z.enum(serviceTypes);
export const deliveryStatusSchema = z.enum(deliveryStatuses);
export const paymentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "failed",
  "refund_pending",
  "refunded"
]);
export const roleSchema = z.enum([
  "sender",
  "driver",
  "station_operator",
  "final_mile_courier",
  "ops_admin",
  "finance_admin",
  "support_admin",
  "super_admin"
]);
export const userStatusSchema = z.enum(["active", "inactive"]);
export const stationOperatingStatusSchema = z.enum(["active", "paused"]);
export const stationIntakeStatusSchema = z.enum(["open", "restricted"]);
export const issueSeveritySchema = z.enum(["p1", "p2", "p3"]);
export const issueStatusSchema = z.enum([
  "open",
  "in_review",
  "escalated",
  "resolved",
  "closed"
]);
export const issueCategorySchema = z.enum([
  "delay",
  "damage",
  "loss",
  "payment",
  "handoff",
  "other"
]);
export const notificationTypeSchema = z.enum([
  "delivery_created",
  "payment_confirmed",
  "payment_failed",
  "received_at_origin",
  "dispatched",
  "received_at_destination",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "issue_updated",
  "refund_completed"
]);
export const notificationStatusSchema = z.enum(["unread", "read"]);
export const requestIdSchema = z.string().regex(/^REQ-[A-Z0-9-]+$/);
export const deliveryIdSchema = z.string().regex(/^DEL-[A-Z0-9-]+$/);
export const paymentIdSchema = z.string().regex(/^PAY-[A-Z0-9-]+$/);
export const issueIdSchema = z.string().regex(/^ISS-[A-Z0-9-]+$/);
export const notificationIdSchema = z.string().regex(/^NTF-[A-Z0-9-]+$/);
export const trackingCodeSchema = z.string().regex(/^KRA-[A-Z0-9-]+$/);
export const challengeIdSchema = z.string().regex(/^CHL-[A-Z0-9-]+$/);
export const userIdSchema = z.string().regex(/^USR-[A-Z0-9-]+$/);
export const publicTouchpointRoleSchema = z.enum([
  "system",
  "station_operator",
  "driver",
  "final_mile_courier"
]);
export const deliveryCustodyRoleSchema = z.enum([
  "station_operator",
  "driver",
  "final_mile_courier"
]);
export const packageConditionSchema = z.enum(["ok", "damaged"]);
export const deliveryProofTypeSchema = z.enum(["otp", "signature", "delivery_photo"]);

const moneySchema = z.object({
  currency: z.literal("GHS"),
  amount: z.number().int().positive()
});

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format.");

export const deliveryReceiverSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  addressText: z.string().trim().min(5).max(240).optional()
});

export const deliveryPackageSchema = z.object({
  description: z.string().trim().min(3).max(160),
  weightKg: z.number().positive(),
  sizeTier: sizeTierSchema,
  isFragile: z.boolean(),
  declaredValueGhs: z.number().nonnegative().max(5000)
});

export const createDeliveryRequestSchema = z
  .object({
    originStationId: stationIdSchema,
    destinationStationId: stationIdSchema,
    receiver: deliveryReceiverSchema,
    package: deliveryPackageSchema,
    serviceType: serviceTypeSchema,
    doorstepRequested: z.boolean(),
    doorstepDistanceKm: z.number().positive().max(10).optional()
  })
  .superRefine((value, ctx) => {
    if (value.originStationId === value.destinationStationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Origin and destination must be different.",
        path: ["destinationStationId"]
      });
    }

    if (value.doorstepRequested && !value.receiver.addressText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep delivery requires a receiver address.",
        path: ["receiver", "addressText"]
      });
    }

    if (value.doorstepRequested && value.doorstepDistanceKm === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep delivery requires a distance estimate.",
        path: ["doorstepDistanceKm"]
      });
    }

    if (!value.doorstepRequested && value.doorstepDistanceKm !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Doorstep distance should be omitted when doorstep is not requested.",
        path: ["doorstepDistanceKm"]
      });
    }
  });

export const createDeliveryResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  status: z.literal("created"),
  quote: moneySchema,
  paymentRequiredBeforeDispatch: z.literal(true)
});

export const paymentInitializeRequestSchema = z.object({
  deliveryId: deliveryIdSchema,
  provider: z.literal("mtn_momo"),
  payerPhone: phoneSchema,
  amountGhs: z.number().int().positive()
});

export const paymentInitializeResponseSchema = z.object({
  paymentId: paymentIdSchema,
  deliveryId: deliveryIdSchema,
  provider: z.literal("mtn_momo"),
  paymentStatus: z.literal("pending"),
  providerReference: z.string().min(6),
  checkoutMode: z.literal("ussd_push")
});

export const paymentVerifyRequestSchema = z.object({
  deliveryId: deliveryIdSchema
});

export const paymentVerifyResponseSchema = z.object({
  paymentId: paymentIdSchema,
  deliveryId: deliveryIdSchema,
  provider: z.literal("mtn_momo"),
  paymentStatus: z.enum(["pending", "confirmed", "failed"]),
  providerReference: z.string().min(6),
  verificationCheckedAt: z.string().datetime()
});

export const mtnMomoWebhookRequestSchema = z.object({
  providerEventId: z.string().trim().min(3).max(120).optional(),
  providerReference: z.string().trim().min(6).max(120),
  eventType: z.enum(["payment.pending", "payment.confirmed", "payment.failed"]),
  amountGhs: z.number().int().positive(),
  currency: z.literal("GHS"),
  occurredAt: z.string().datetime(),
  rawPayload: z.record(z.unknown()).optional()
});

export const mtnMomoWebhookResponseSchema = z.object({
  eventId: z.string().regex(/^EVT-WEB-[A-Z0-9-]+$/),
  acknowledgement: z.enum([
    "processed",
    "duplicate",
    "unmatched",
    "accepted_pending",
    "manual_review"
  ]),
  matchedPaymentId: paymentIdSchema.optional(),
  matchedDeliveryId: deliveryIdSchema.optional()
});

export const publicTrackingResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  status: deliveryStatusSchema,
  publicLabel: z.string().min(3),
  latestTouchpoint: z.object({
    role: publicTouchpointRoleSchema,
    stationId: stationIdSchema.optional(),
    occurredAt: z.string().datetime()
  }),
  receiverVerificationRequired: z.boolean(),
  etaLabel: z.string().min(3).optional()
});

export const deliveryDetailResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  senderId: userIdSchema,
  originStationId: stationIdSchema,
  destinationStationId: stationIdSchema,
  currentStatus: deliveryStatusSchema,
  paymentStatus: paymentStatusSchema,
  serviceType: serviceTypeSchema,
  doorstepRequested: z.boolean(),
  doorstepDistanceKm: z.number().positive().max(10).optional(),
  receiver: deliveryReceiverSchema,
  package: deliveryPackageSchema,
  quote: moneySchema,
  currentCustodyRole: deliveryCustodyRoleSchema.nullable(),
  currentCustodyActorId: userIdSchema.nullable(),
  assignedDriverId: userIdSchema.optional(),
  assignedFinalMileCourierId: userIdSchema.optional(),
  latestEvent: z.object({
    type: z.string().min(3),
    occurredAt: z.string().datetime()
  }),
  latestTouchpoint: z.object({
    role: publicTouchpointRoleSchema,
    stationId: stationIdSchema.optional(),
    occurredAt: z.string().datetime()
  }),
  finalProof: z
    .object({
      type: deliveryProofTypeSchema,
      reference: z.string().trim().min(3).max(120),
      receivedByName: z.string().trim().min(2).max(120),
      capturedAt: z.string().datetime()
    })
    .optional(),
  createdAt: z.string().datetime()
});

export const deliveryTimelineEntrySchema = z.object({
  entryId: z.string().trim().min(3).max(120),
  entryType: z.enum(["delivery_event", "handoff_event", "issue_event"]),
  occurredAt: z.string().datetime(),
  label: z.string().trim().min(3).max(240),
  actorId: userIdSchema.optional(),
  actorRole: z.string().trim().min(3).max(80).optional(),
  stationId: stationIdSchema.optional(),
  metadata: z.record(z.unknown()).optional()
});

export const deliveryTimelineResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  entries: z.array(deliveryTimelineEntrySchema)
});

export const deliveryListQuerySchema = z.object({
  status: deliveryStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const deliveryListResponseSchema = z.object({
  deliveries: z.array(
    z.object({
      deliveryId: deliveryIdSchema,
      trackingCode: trackingCodeSchema,
      currentStatus: deliveryStatusSchema,
      paymentStatus: paymentStatusSchema,
      originStationId: stationIdSchema,
      destinationStationId: stationIdSchema,
      serviceType: serviceTypeSchema,
      receiverName: z.string().trim().min(2).max(120),
      latestOccurredAt: z.string().datetime(),
      latestTouchpointRole: publicTouchpointRoleSchema,
      latestTouchpointStationId: stationIdSchema.optional(),
      doorstepRequested: z.boolean()
    })
  )
});

export const verifyPhoneRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().trim().min(4).max(8)
});

export const requestPhoneVerificationChallengeRequestSchema = z.object({
  phone: phoneSchema
});

export const requestPhoneVerificationChallengeResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  challengeStatus: z.enum(["sent", "recently_sent", "already_verified"]),
  maskedPhone: z.string().trim().min(4).max(32),
  challengeId: challengeIdSchema.optional(),
  channel: z.literal("sms").optional(),
  resendAvailableAt: z.string().datetime().optional(),
  verificationToken: z.string().trim().min(24).max(512).optional(),
  verifiedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime()
});

export const verifyPhoneResponseSchema = z.object({
  deliveryId: deliveryIdSchema,
  trackingCode: trackingCodeSchema,
  verificationToken: z.string().trim().min(24).max(512),
  verifiedAt: z.string().datetime(),
  expiresAt: z.string().datetime()
});

export const confirmIntakeRequestSchema = z.object({
  measuredWeightKg: z.number().positive(),
  sizeTier: sizeTierSchema,
  condition: packageConditionSchema,
  labelScanCode: z.string().trim().min(4).max(80),
  fallbackUsed: z.boolean().optional(),
  supervisorOverrideActorId: userIdSchema.optional()
});

export const assignDriverRequestSchema = z.object({
  driverUserId: userIdSchema
});

export const acceptRunRequestSchema = z.object({
  note: z.string().trim().min(3).max(240).optional()
});

export const dispatchDeliveryRequestSchema = z.object({
  packageScanCode: z.string().trim().min(4).max(80),
  fallbackUsed: z.boolean().optional(),
  supervisorOverrideActorId: userIdSchema.optional()
});

export const confirmDriverPickupRequestSchema = z.object({
  packageScanCode: z.string().trim().min(4).max(80),
  fallbackUsed: z.boolean().optional(),
  supervisorOverrideActorId: userIdSchema.optional()
});

export const markInTransitRequestSchema = z.object({
  note: z.string().trim().min(3).max(240).optional()
});

export const receiveDestinationRequestSchema = z.object({
  packageScanCode: z.string().trim().min(4).max(80),
  condition: packageConditionSchema,
  nextStep: z.enum(["pickup", "doorstep", "issue"]),
  fallbackUsed: z.boolean().optional(),
  supervisorOverrideActorId: userIdSchema.optional()
});

export const assignFinalMileRequestSchema = z.object({
  courierUserId: userIdSchema
});

export const acceptFinalMileAssignmentRequestSchema = z.object({
  note: z.string().trim().min(3).max(240).optional()
});

export const markOutForDeliveryRequestSchema = z.object({
  note: z.string().trim().min(3).max(240).optional()
});

export const completeDeliveryRequestSchema = z.object({
  proofType: deliveryProofTypeSchema,
  proofReference: z.string().trim().min(3).max(120),
  receivedByName: z.string().trim().min(2).max(120)
});

export const recordFailedAttemptRequestSchema = z.object({
  reasonCode: z.enum([
    "receiver_unreachable",
    "receiver_unavailable",
    "address_not_found",
    "unsafe_to_complete",
    "receiver_refused",
    "proof_failed",
    "package_issue_detected"
  ]),
  note: z.string().trim().min(5).max(400).optional()
});

export const cancelDeliveryRequestSchema = z.object({
  reasonCode: z.enum([
    "sender_changed_mind",
    "duplicate_booking",
    "pricing_dispute",
    "receiver_unavailable",
    "support_advised",
    "other"
  ]),
  note: z.string().trim().min(5).max(400).optional()
});

export const refundPaymentRequestSchema = z.object({
  paymentId: paymentIdSchema,
  duplicateCharge: z.boolean().optional(),
  platformPaymentError: z.boolean().optional(),
  packageNeverReceivedAtOrigin: z.boolean().optional(),
  doorstepAttemptOccurred: z.boolean().optional(),
  expressHandlingPerformed: z.boolean().optional()
});

const refundReasonSchema = z.enum([
  "full_refund_pre_intake",
  "duplicate_charge",
  "platform_payment_error",
  "never_received_at_origin",
  "post_intake_handling_fee",
  "doorstep_surcharge_refund",
  "express_surcharge_refund"
]);

export const refundPaymentResponseSchema = z.object({
  paymentId: paymentIdSchema,
  deliveryId: deliveryIdSchema,
  refundStatus: z.literal("refund_pending"),
  refundAmountGhs: z.number().int().nonnegative(),
  refundReason: refundReasonSchema,
  requiresManualReview: z.literal(false),
  requestedAt: z.string().datetime()
});

export const settleRefundRequestSchema = z.object({
  paymentId: paymentIdSchema,
  refundReference: z.string().trim().min(3).max(120),
  settledAt: z.string().datetime().optional()
});

export const settleRefundResponseSchema = z.object({
  paymentId: paymentIdSchema,
  deliveryId: deliveryIdSchema,
  refundStatus: z.literal("refunded"),
  refundAmountGhs: z.number().int().positive(),
  refundReason: refundReasonSchema,
  refundReference: z.string().trim().min(3).max(120),
  settledAt: z.string().datetime()
});

export const cancelDeliveryResponseSchema = z.object({
  eventId: z.string().regex(/^EVT-DEL-[A-Z0-9-]+$/),
  deliveryId: deliveryIdSchema,
  status: z.literal("cancelled"),
  paymentStatus: paymentStatusSchema,
  occurredAt: z.string().datetime(),
  refundStatus: z.enum(["not_applicable", "refund_pending"]),
  refundAmountGhs: z.number().int().positive().optional(),
  refundReason: refundReasonSchema.optional()
});

export const deliveryLifecycleResponseSchema = z.object({
  eventId: z.string().regex(/^EVT-DEL-[A-Z0-9-]+$/),
  deliveryId: deliveryIdSchema,
  status: deliveryStatusSchema,
  paymentStatus: paymentStatusSchema,
  occurredAt: z.string().datetime()
});

export const createIssueRequestSchema = z.object({
  deliveryId: deliveryIdSchema,
  category: issueCategorySchema,
  severity: issueSeveritySchema,
  summary: z.string().trim().min(5).max(160),
  description: z.string().trim().min(5).max(500).optional()
});

export const escalateIssueRequestSchema = z.object({
  reasonCode: z.enum([
    "sender_request",
    "sla_breach",
    "payment_dispute",
    "loss_investigation",
    "fraud_review",
    "management_attention"
  ]),
  note: z.string().trim().min(5).max(400)
});

export const resolveIssueRequestSchema = z.object({
  nextStatus: z.enum(["in_review", "resolved", "closed"]),
  resolutionCode: z.enum([
    "station_confirmed",
    "delivery_completed",
    "refund_approved",
    "sender_withdrew",
    "duplicate_report",
    "policy_denied"
  ]).optional(),
  note: z.string().trim().min(5).max(400)
}).superRefine((value, ctx) => {
  if ((value.nextStatus === "resolved" || value.nextStatus === "closed") && !value.resolutionCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "resolutionCode is required when resolving or closing an issue.",
      path: ["resolutionCode"]
    });
  }
});

export const issueResponseSchema = z.object({
  issueId: issueIdSchema,
  deliveryId: deliveryIdSchema,
  status: issueStatusSchema,
  severity: issueSeveritySchema,
  category: issueCategorySchema,
  summary: z.string().trim().min(5).max(160),
  description: z.string().trim().min(5).max(500).optional(),
  reporter: z.object({
    actorId: userIdSchema,
    actorRole: z.string().trim().min(3).max(80)
  }),
  escalatedAt: z.string().datetime().optional(),
  escalatedByActorId: userIdSchema.optional(),
  escalationReasonCode: z.string().trim().min(3).max(80).optional(),
  resolvedAt: z.string().datetime().optional(),
  resolvedByActorId: userIdSchema.optional(),
  closedAt: z.string().datetime().optional(),
  closedByActorId: userIdSchema.optional(),
  resolutionCode: z.string().trim().min(3).max(80).optional(),
  resolutionNote: z.string().trim().min(5).max(400).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const issueListQuerySchema = z.object({
  deliveryId: deliveryIdSchema.optional(),
  status: issueStatusSchema.optional(),
  severity: issueSeveritySchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const issueListResponseSchema = z.object({
  issues: z.array(issueResponseSchema)
});

export const notificationListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const notificationResponseSchema = z.object({
  notificationId: notificationIdSchema,
  type: notificationTypeSchema,
  status: notificationStatusSchema,
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(280),
  deliveryId: deliveryIdSchema.optional(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional()
});

export const notificationListResponseSchema = z.object({
  notifications: z.array(notificationResponseSchema)
});

export const outboundNotificationDispatchRequestSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional()
});

export const outboundNotificationDispatchResponseSchema = z.object({
  processed: z.number().int().nonnegative(),
  sent: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  deadLettered: z.number().int().nonnegative(),
  results: z.array(
    z.object({
      outboundNotificationId: z.string().regex(/^ONF-[A-Z0-9-]+$/),
      status: z.enum(["sent", "failed", "dead_letter"]),
      attemptCount: z.number().int().nonnegative()
    })
  )
});

export const auditTargetTypeSchema = z.enum(["delivery", "payment", "issue", "tracking"]);

export const auditEventListQuerySchema = z.object({
  actorId: userIdSchema.optional(),
  targetType: auditTargetTypeSchema.optional(),
  targetId: z.string().trim().min(3).max(120).optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const auditEventListResponseSchema = z.object({
  events: z.array(
    z.object({
      eventId: z.string().regex(/^AUD-[A-Z0-9-]+$/),
      requestId: requestIdSchema,
      action: z.string().trim().min(3).max(120),
      actorId: userIdSchema,
      actorRole: z.string().trim().min(3).max(80),
      occurredAt: z.string().datetime(),
      stationId: stationIdSchema.optional(),
      targetType: auditTargetTypeSchema.optional(),
      targetId: z.string().trim().min(3).max(120).optional(),
      metadata: z.record(z.unknown()).optional()
    })
  )
});

export const webhookProcessingStatusSchema = z.enum([
  "received",
  "processed",
  "duplicate",
  "unmatched",
  "accepted_pending",
  "manual_review"
]);

export const adminWebhookEventListQuerySchema = z.object({
  processingStatus: webhookProcessingStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const adminWebhookEventListResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  events: z.array(
    z.object({
      eventId: z.string().regex(/^EVT-WEB-[A-Z0-9-]+$/),
      provider: z.literal("mtn_momo"),
      providerEventId: z.string().trim().min(3).max(120).optional(),
      providerReference: z.string().trim().min(6).max(120),
      eventType: z.enum(["payment.pending", "payment.confirmed", "payment.failed"]),
      amountGhs: z.number().int().positive(),
      currency: z.literal("GHS"),
      occurredAt: z.string().datetime(),
      receivedAt: z.string().datetime(),
      processingStatus: webhookProcessingStatusSchema,
      matchedPaymentId: paymentIdSchema.optional(),
      matchedDeliveryId: deliveryIdSchema.optional(),
      processingNotes: z.string().trim().min(3).max(120).optional()
    })
  )
});

export const adminOverviewResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  deliveryStatusCounts: z.array(
    z.object({
      status: deliveryStatusSchema,
      count: z.number().int().nonnegative()
    })
  ),
  paymentStatusCounts: z.array(
    z.object({
      status: paymentStatusSchema,
      count: z.number().int().nonnegative()
    })
  ),
  operationalAlerts: z.object({
    openIssueLikeDeliveries: z.number().int().nonnegative(),
    unmatchedWebhookEvents: z.number().int().nonnegative(),
    manualReviewWebhookEvents: z.number().int().nonnegative()
  })
});

export const adminDeliveryListResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  deliveries: z.array(
    z.object({
      deliveryId: deliveryIdSchema,
      trackingCode: trackingCodeSchema,
      currentStatus: deliveryStatusSchema,
      paymentStatus: paymentStatusSchema,
      originStationId: stationIdSchema,
      destinationStationId: stationIdSchema,
      senderId: userIdSchema,
      latestOccurredAt: z.string().datetime(),
      receiverName: z.string().trim().min(2).max(120)
    })
  )
});

export const adminStationServiceAvailabilitySchema = z.object({
  standard: z.boolean(),
  express: z.boolean(),
  doorstep: z.boolean()
});

export const stationValidationStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "ready",
  "blocked"
]);

export const stationValidationChecklistSchema = z.object({
  activeOperatorsCanSignIn: z.boolean(),
  intakeDispatchReceiptAudited: z.boolean(),
  scanOrManualFallbackTested: z.boolean(),
  noUnresolvedP1Incidents: z.boolean(),
  escalationAndRefundHandoffTested: z.boolean(),
  openingHoursStorageAndHandoffConfirmed: z.boolean()
});

export const stationValidationResponseSchema = z.object({
  status: stationValidationStatusSchema,
  dryRunBusinessDaysCompleted: z.number().int().min(0).max(2),
  controlledPilotBusinessDaysCompleted: z.number().int().min(0).max(3),
  checklist: stationValidationChecklistSchema,
  scanFallbackSuccessRatePercent: z.number().min(0).max(100),
  goLiveEligible: z.boolean(),
  blockers: z.array(z.string().trim().min(3).max(160)),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  note: z.string().trim().min(3).max(240).optional(),
  updatedAt: z.string().datetime()
});

export const adminStationListResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  stations: z.array(
    z.object({
      stationId: stationIdSchema,
      name: z.string().trim().min(3).max(120),
      city: z.string().trim().min(2).max(120),
      operatingStatus: stationOperatingStatusSchema,
      intakeStatus: stationIntakeStatusSchema,
      serviceAvailability: adminStationServiceAvailabilitySchema,
      activeQueueCount: z.number().int().nonnegative(),
      issueCount: z.number().int().nonnegative(),
      validation: stationValidationResponseSchema,
      note: z.string().trim().min(3).max(240).optional(),
      updatedAt: z.string().datetime()
    })
  )
});

export const adminUserListQuerySchema = z.object({
  role: roleSchema.optional(),
  status: userStatusSchema.optional(),
  stationId: stationIdSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const adminUserResponseSchema = z.object({
  userId: userIdSchema,
  fullName: z.string().trim().min(2).max(120),
  role: roleSchema,
  status: userStatusSchema,
  stationId: stationIdSchema.optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: phoneSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activatedAt: z.string().datetime().optional(),
  deactivatedAt: z.string().datetime().optional()
});

function enforceRoleStationRule(
  value: {
    role: z.infer<typeof roleSchema>;
    stationId?: z.infer<typeof stationIdSchema> | undefined;
  },
  ctx: z.RefinementCtx
): void {
  const requiresStation = value.role === "station_operator";
  const forbidsStation =
    value.role === "sender" ||
    value.role === "ops_admin" ||
    value.role === "finance_admin" ||
    value.role === "support_admin" ||
    value.role === "super_admin";

  if (requiresStation && value.stationId === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "stationId is required for station operators.",
      path: ["stationId"]
    });
  }

  if (forbidsStation && value.stationId !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "stationId is not allowed for this role.",
      path: ["stationId"]
    });
  }
}

export const adminUpsertUserRequestSchema = z
  .object({
    userId: userIdSchema,
    fullName: z.string().trim().min(2).max(120),
    role: roleSchema,
    status: userStatusSchema.optional(),
    stationId: stationIdSchema.optional(),
    email: z.string().trim().email().max(254).optional(),
    phone: phoneSchema.optional()
  })
  .superRefine(enforceRoleStationRule);

export const adminUpdateUserAccessRequestSchema = z
  .object({
    role: roleSchema,
    status: userStatusSchema,
    stationId: stationIdSchema.optional()
  })
  .superRefine(enforceRoleStationRule);

export const adminUserListResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  users: z.array(adminUserResponseSchema)
});

export const adminUpdateStationStatusRequestSchema = z.object({
  operatingStatus: stationOperatingStatusSchema,
  intakeStatus: stationIntakeStatusSchema,
  serviceAvailability: adminStationServiceAvailabilitySchema,
  note: z.string().trim().min(3).max(240).optional()
});

export const adminUpdateStationStatusResponseSchema = z.object({
  stationId: stationIdSchema,
  name: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(120),
  operatingStatus: stationOperatingStatusSchema,
  intakeStatus: stationIntakeStatusSchema,
  serviceAvailability: adminStationServiceAvailabilitySchema,
  note: z.string().trim().min(3).max(240).optional(),
  updatedAt: z.string().datetime()
});

export const adminUpdateStationValidationRequestSchema = z.object({
  dryRunBusinessDaysCompleted: z.number().int().min(0).max(2),
  controlledPilotBusinessDaysCompleted: z.number().int().min(0).max(3),
  checklist: stationValidationChecklistSchema,
  scanFallbackSuccessRatePercent: z.number().min(0).max(100),
  manualBlockers: z.array(z.string().trim().min(3).max(160)).max(10).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  note: z.string().trim().min(3).max(240).optional()
});

export const adminUpdateStationValidationResponseSchema = z.object({
  stationId: stationIdSchema,
  name: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(120),
  validation: stationValidationResponseSchema
});

export const adminFinanceResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  totals: z.object({
    confirmedAmountGhs: z.number().nonnegative(),
    refundPendingAmountGhs: z.number().nonnegative(),
    refundedAmountGhs: z.number().nonnegative()
  }),
  payments: z.array(
    z.object({
      paymentId: paymentIdSchema,
      deliveryId: deliveryIdSchema,
      provider: z.literal("mtn_momo"),
      providerReference: z.string().trim().min(6).max(120),
      status: paymentStatusSchema,
      amountGhs: z.number().int().positive(),
      initiatedAt: z.string().datetime(),
      verifiedAt: z.string().datetime().optional(),
      refundAmountGhs: z.number().nonnegative().optional()
    })
  )
});

export const apiErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "FORBIDDEN",
  "NOT_FOUND",
  "ROUTE_NOT_ENABLED",
  "PAYMENT_REQUIRED",
  "INVALID_STATUS_TRANSITION",
  "PHONE_VERIFICATION_REQUIRED",
  "RATE_LIMITED",
  "INTERNAL_ERROR"
]);

export const apiErrorResponseSchema = z.object({
  requestId: requestIdSchema,
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string().min(3),
    details: z.record(z.unknown())
  })
});

export function buildApiErrorResponse(
  requestId: z.infer<typeof requestIdSchema>,
  code: z.infer<typeof apiErrorCodeSchema>,
  message: string,
  details: Record<string, unknown> = {}
): z.infer<typeof apiErrorResponseSchema> {
  return {
    requestId,
    error: {
      code,
      message,
      details
    }
  };
}

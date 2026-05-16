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
export const requestIdSchema = z.string().regex(/^REQ-[A-Z0-9-]+$/);
export const deliveryIdSchema = z.string().regex(/^DEL-[A-Z0-9-]+$/);
export const paymentIdSchema = z.string().regex(/^PAY-[A-Z0-9-]+$/);
export const trackingCodeSchema = z.string().regex(/^KRA-[A-Z0-9-]+$/);
export const userIdSchema = z.string().regex(/^USR-[A-Z0-9-]+$/);
export const publicTouchpointRoleSchema = z.enum([
  "system",
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

export const verifyPhoneRequestSchema = z.object({
  phone: phoneSchema,
  otp: z.string().trim().min(4).max(8)
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

export const dispatchDeliveryRequestSchema = z.object({
  packageScanCode: z.string().trim().min(4).max(80),
  fallbackUsed: z.boolean().optional(),
  supervisorOverrideActorId: userIdSchema.optional()
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

export const completeDeliveryRequestSchema = z.object({
  proofType: deliveryProofTypeSchema,
  proofReference: z.string().trim().min(3).max(120),
  receivedByName: z.string().trim().min(2).max(120)
});

export const refundPaymentRequestSchema = z.object({
  paymentId: paymentIdSchema,
  duplicateCharge: z.boolean().optional(),
  platformPaymentError: z.boolean().optional(),
  packageNeverReceivedAtOrigin: z.boolean().optional(),
  doorstepAttemptOccurred: z.boolean().optional(),
  expressHandlingPerformed: z.boolean().optional()
});

export const refundPaymentResponseSchema = z.object({
  paymentId: paymentIdSchema,
  deliveryId: deliveryIdSchema,
  refundStatus: z.literal("refund_pending"),
  refundAmountGhs: z.number().int().nonnegative(),
  refundReason: z.enum([
    "full_refund_pre_intake",
    "duplicate_charge",
    "platform_payment_error",
    "never_received_at_origin",
    "post_intake_handling_fee",
    "doorstep_surcharge_refund",
    "express_surcharge_refund"
  ]),
  requiresManualReview: z.literal(false),
  requestedAt: z.string().datetime()
});

export const deliveryLifecycleResponseSchema = z.object({
  eventId: z.string().regex(/^EVT-DEL-[A-Z0-9-]+$/),
  deliveryId: deliveryIdSchema,
  status: deliveryStatusSchema,
  paymentStatus: paymentStatusSchema,
  occurredAt: z.string().datetime()
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

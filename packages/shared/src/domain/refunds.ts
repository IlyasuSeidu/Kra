export type RefundStage =
  | "before_origin_intake"
  | "after_origin_intake_before_dispatch"
  | "after_dispatch";

export interface RefundPolicyInput {
  stage: RefundStage;
  amountPaidGhs: number;
  duplicateCharge?: boolean;
  platformPaymentError?: boolean;
  packageNeverReceivedAtOrigin?: boolean;
  doorstepAttemptOccurred?: boolean;
  doorstepSurchargeGhs?: number;
  expressSurchargeGhs?: number;
  expressHandlingPerformed?: boolean;
}

export interface RefundDecision {
  amountGhs: number;
  requiresManualReview: boolean;
  reason:
    | "full_refund_pre_intake"
    | "duplicate_charge"
    | "platform_payment_error"
    | "never_received_at_origin"
    | "post_intake_handling_fee"
    | "doorstep_surcharge_refund"
    | "express_surcharge_refund"
    | "manual_review_required";
}

export function getRefundDecision(input: RefundPolicyInput): RefundDecision {
  if (input.duplicateCharge) {
    return {
      amountGhs: input.amountPaidGhs,
      requiresManualReview: false,
      reason: "duplicate_charge"
    };
  }

  if (input.platformPaymentError) {
    return {
      amountGhs: input.amountPaidGhs,
      requiresManualReview: false,
      reason: "platform_payment_error"
    };
  }

  if (input.packageNeverReceivedAtOrigin) {
    return {
      amountGhs: input.amountPaidGhs,
      requiresManualReview: false,
      reason: "never_received_at_origin"
    };
  }

  if (input.stage === "before_origin_intake") {
    return {
      amountGhs: input.amountPaidGhs,
      requiresManualReview: false,
      reason: "full_refund_pre_intake"
    };
  }

  if (input.stage === "after_origin_intake_before_dispatch") {
    return {
      amountGhs: Math.max(input.amountPaidGhs - 5, 0),
      requiresManualReview: false,
      reason: "post_intake_handling_fee"
    };
  }

  if (
    input.doorstepSurchargeGhs &&
    input.doorstepSurchargeGhs > 0 &&
    input.doorstepAttemptOccurred === false
  ) {
    return {
      amountGhs: input.doorstepSurchargeGhs,
      requiresManualReview: false,
      reason: "doorstep_surcharge_refund"
    };
  }

  if (
    input.expressSurchargeGhs &&
    input.expressSurchargeGhs > 0 &&
    input.expressHandlingPerformed === false
  ) {
    return {
      amountGhs: input.expressSurchargeGhs,
      requiresManualReview: false,
      reason: "express_surcharge_refund"
    };
  }

  return {
    amountGhs: 0,
    requiresManualReview: true,
    reason: "manual_review_required"
  };
}


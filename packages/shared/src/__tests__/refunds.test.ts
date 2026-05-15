import { describe, expect, it } from "vitest";

import { getRefundDecision } from "../domain/refunds";

describe("refunds", () => {
  it("returns full refund before origin intake", () => {
    expect(
      getRefundDecision({
        stage: "before_origin_intake",
        amountPaidGhs: 35
      })
    ).toEqual({
      amountGhs: 35,
      requiresManualReview: false,
      reason: "full_refund_pre_intake"
    });
  });

  it("applies handling fee after intake and before dispatch", () => {
    expect(
      getRefundDecision({
        stage: "after_origin_intake_before_dispatch",
        amountPaidGhs: 35
      })
    ).toEqual({
      amountGhs: 30,
      requiresManualReview: false,
      reason: "post_intake_handling_fee"
    });
  });

  it("refunds duplicate charges immediately", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 65,
        duplicateCharge: true
      })
    ).toEqual({
      amountGhs: 65,
      requiresManualReview: false,
      reason: "duplicate_charge"
    });
  });

  it("refunds platform payment errors immediately", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 65,
        platformPaymentError: true
      })
    ).toEqual({
      amountGhs: 65,
      requiresManualReview: false,
      reason: "platform_payment_error"
    });
  });

  it("refunds when the package was never received at origin", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 50,
        packageNeverReceivedAtOrigin: true
      })
    ).toEqual({
      amountGhs: 50,
      requiresManualReview: false,
      reason: "never_received_at_origin"
    });
  });

  it("refunds unused doorstep surcharge", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 80,
        doorstepAttemptOccurred: false,
        doorstepSurchargeGhs: 15
      })
    ).toEqual({
      amountGhs: 15,
      requiresManualReview: false,
      reason: "doorstep_surcharge_refund"
    });
  });

  it("refunds unused express surcharge", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 92,
        expressSurchargeGhs: 27,
        expressHandlingPerformed: false
      })
    ).toEqual({
      amountGhs: 27,
      requiresManualReview: false,
      reason: "express_surcharge_refund"
    });
  });

  it("requires manual review for post-dispatch disputes without automatic eligibility", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 80
      })
    ).toEqual({
      amountGhs: 0,
      requiresManualReview: true,
      reason: "manual_review_required"
    });
  });

  it("requires manual review when doorstep or express services were actually performed", () => {
    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 80,
        doorstepAttemptOccurred: true,
        doorstepSurchargeGhs: 15
      })
    ).toEqual({
      amountGhs: 0,
      requiresManualReview: true,
      reason: "manual_review_required"
    });

    expect(
      getRefundDecision({
        stage: "after_dispatch",
        amountPaidGhs: 92,
        expressSurchargeGhs: 27,
        expressHandlingPerformed: true
      })
    ).toEqual({
      amountGhs: 0,
      requiresManualReview: true,
      reason: "manual_review_required"
    });
  });
});

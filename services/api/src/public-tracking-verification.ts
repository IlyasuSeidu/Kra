import {
  requestPhoneVerificationChallengeResponseSchema,
  verifyPhoneResponseSchema
} from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRepository } from "./deliveries";
import type { PublicTrackingOtpNotificationGateway } from "./notifications";
import { isReceiverVerificationRequiredStatus } from "./public-tracking";
import { ApiServiceError } from "./service-errors";

const FAILED_ATTEMPT_LOCK_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;
const VERIFICATION_GRANT_TTL_MINUTES = 30;
const PHONE_CHALLENGE_TTL_MINUTES = 10;
const PHONE_CHALLENGE_RESEND_COOLDOWN_MINUTES = 1;

type VerificationFailureReason =
  | "phone_mismatch"
  | "challenge_missing"
  | "challenge_consumed"
  | "challenge_expired"
  | "otp_mismatch";

export interface PublicTrackingPhoneChallengeRecord {
  challengeId: string;
  trackingCode: string;
  phone: string;
  otp: string;
  issuedAt: string;
  expiresAt: string;
  consumedAt?: string;
}

export interface PublicTrackingVerificationFailedAttemptRecord {
  attemptId: string;
  trackingCode: string;
  attemptedAt: string;
  phone: string;
  reason: VerificationFailureReason;
}

export interface PublicTrackingVerificationGrantRecord {
  verificationId: string;
  deliveryId: string;
  trackingCode: string;
  phone: string;
  verificationToken: string;
  verifiedAt: string;
  expiresAt: string;
}

export interface PublicTrackingVerificationRepository {
  getActiveGrant(
    trackingCode: string,
    phone: string,
    asOf: string
  ): Promise<PublicTrackingVerificationGrantRecord | undefined>;
  getLatestChallenge(
    trackingCode: string,
    phone: string
  ): Promise<PublicTrackingPhoneChallengeRecord | undefined>;
  createChallenge(challenge: PublicTrackingPhoneChallengeRecord): Promise<void>;
  listFailedAttemptsSince(
    trackingCode: string,
    since: string
  ): Promise<PublicTrackingVerificationFailedAttemptRecord[]>;
  createFailedAttempt(attempt: PublicTrackingVerificationFailedAttemptRecord): Promise<void>;
  consumeChallenge(challengeId: string, consumedAt: string): Promise<void>;
  createGrant(grant: PublicTrackingVerificationGrantRecord): Promise<void>;
}

export interface PublicTrackingVerificationIdentityFactory {
  nextChallengeId(): string;
  nextOtpCode(): string;
  nextAttemptId(): string;
  nextVerificationId(): string;
  nextVerificationToken(): string;
}

export interface RequestPublicTrackingPhoneChallengeDeps extends VerifyPublicTrackingPhoneDeps {
  notifications?: PublicTrackingOtpNotificationGateway;
}

export interface VerifyPublicTrackingPhoneDeps {
  deliveries: DeliveryRepository;
  verification: PublicTrackingVerificationRepository;
  identityFactory: PublicTrackingVerificationIdentityFactory;
  now: () => string;
}

export type RequestPublicTrackingPhoneChallengeResponse = z.infer<
  typeof requestPhoneVerificationChallengeResponseSchema
>;
export type VerifyPublicTrackingPhoneResponse = z.infer<typeof verifyPhoneResponseSchema>;

function addMinutes(isoTimestamp: string, minutes: number): string {
  return new Date(Date.parse(isoTimestamp) + minutes * 60_000).toISOString();
}

function getFailedAttemptWindowStart(now: string): string {
  return addMinutes(now, -FAILED_ATTEMPT_LOCK_WINDOW_MINUTES);
}

function getChallengeResendAvailableAt(issuedAt: string): string {
  return addMinutes(issuedAt, PHONE_CHALLENGE_RESEND_COOLDOWN_MINUTES);
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) {
    return phone;
  }

  return `${phone.slice(0, 4)}${"*".repeat(Math.max(phone.length - 8, 2))}${phone.slice(-4)}`;
}

function getLockUntil(
  failedAttempts: PublicTrackingVerificationFailedAttemptRecord[]
): string {
  const earliestAttempt = [...failedAttempts].sort((left, right) =>
    left.attemptedAt.localeCompare(right.attemptedAt)
  )[0];

  if (!earliestAttempt) {
    throw new Error("Cannot calculate a verification lock window without failed attempts.");
  }

  return addMinutes(earliestAttempt.attemptedAt, FAILED_ATTEMPT_LOCK_WINDOW_MINUTES);
}

async function assertNotLocked(
  trackingCode: string,
  now: string,
  deps: VerifyPublicTrackingPhoneDeps
): Promise<void> {
  const failedAttempts = await deps.verification.listFailedAttemptsSince(
    trackingCode,
    getFailedAttemptWindowStart(now)
  );

  if (failedAttempts.length < MAX_FAILED_ATTEMPTS) {
    return;
  }

  throw new ApiServiceError(
    "RATE_LIMITED",
    "Phone verification is temporarily locked. Try again later.",
    {
      lockUntil: getLockUntil(failedAttempts)
    }
  );
}

async function recordFailedAttempt(
  input: {
    trackingCode: string;
    phone: string;
    reason: VerificationFailureReason;
  },
  deps: VerifyPublicTrackingPhoneDeps,
  now: string
): Promise<never> {
  const recentAttempts = await deps.verification.listFailedAttemptsSince(
    input.trackingCode,
    getFailedAttemptWindowStart(now)
  );
  const failedAttempt: PublicTrackingVerificationFailedAttemptRecord = {
    attemptId: deps.identityFactory.nextAttemptId(),
    trackingCode: input.trackingCode,
    attemptedAt: now,
    phone: input.phone,
    reason: input.reason
  };

  await deps.verification.createFailedAttempt(failedAttempt);

  const nextAttempts = [...recentAttempts, failedAttempt];

  if (nextAttempts.length >= MAX_FAILED_ATTEMPTS) {
    throw new ApiServiceError(
      "RATE_LIMITED",
      "Phone verification is temporarily locked. Try again later.",
      {
        lockUntil: getLockUntil(nextAttempts)
      }
    );
  }

  throw new ApiServiceError("FORBIDDEN", "Phone verification failed.", {
    attemptsRemaining: MAX_FAILED_ATTEMPTS - nextAttempts.length
  });
}

export async function requestPublicTrackingPhoneChallenge(
  input: {
    trackingCode: string;
    phone: string;
  },
  deps: RequestPublicTrackingPhoneChallengeDeps
): Promise<{
  challenge?: PublicTrackingPhoneChallengeRecord;
  response: RequestPublicTrackingPhoneChallengeResponse;
}> {
  const now = deps.now();
  const delivery = await deps.deliveries.getByTrackingCode(input.trackingCode);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Tracking code was not found.", {
      trackingCode: input.trackingCode
    });
  }

  if (!isReceiverVerificationRequiredStatus(delivery.currentStatus)) {
    throw new ApiServiceError(
      "VALIDATION_ERROR",
      "Phone verification is not required for this delivery stage.",
      {
        currentStatus: delivery.currentStatus
      }
    );
  }

  if (delivery.receiver.phone !== input.phone) {
    throw new ApiServiceError("FORBIDDEN", "Phone verification request failed.", {
      trackingCode: input.trackingCode
    });
  }

  const activeGrant = await deps.verification.getActiveGrant(
    input.trackingCode,
    input.phone,
    now
  );

  if (activeGrant) {
    return {
      response: requestPhoneVerificationChallengeResponseSchema.parse({
        deliveryId: activeGrant.deliveryId,
        trackingCode: activeGrant.trackingCode,
        challengeStatus: "already_verified",
        maskedPhone: maskPhone(activeGrant.phone),
        verificationToken: activeGrant.verificationToken,
        verifiedAt: activeGrant.verifiedAt,
        expiresAt: activeGrant.expiresAt
      })
    };
  }

  await assertNotLocked(input.trackingCode, now, deps);

  const latestChallenge = await deps.verification.getLatestChallenge(input.trackingCode, input.phone);

  if (latestChallenge && !latestChallenge.consumedAt && latestChallenge.expiresAt > now) {
    const resendAvailableAt = getChallengeResendAvailableAt(latestChallenge.issuedAt);

    if (resendAvailableAt > now) {
      return {
        challenge: latestChallenge,
        response: requestPhoneVerificationChallengeResponseSchema.parse({
          deliveryId: delivery.deliveryId,
          trackingCode: delivery.trackingCode,
          challengeStatus: "recently_sent",
          challengeId: latestChallenge.challengeId,
          channel: "sms",
          maskedPhone: maskPhone(input.phone),
          expiresAt: latestChallenge.expiresAt,
          resendAvailableAt
        })
      };
    }
  }

  if (!deps.notifications) {
    throw new ApiServiceError(
      "ROUTE_NOT_ENABLED",
      "Receiver SMS verification delivery is not configured.",
      {
        reason: "missing_sms_notification_gateway"
      }
    );
  }

  const challenge: PublicTrackingPhoneChallengeRecord = {
    challengeId: deps.identityFactory.nextChallengeId(),
    trackingCode: delivery.trackingCode,
    phone: input.phone,
    otp: deps.identityFactory.nextOtpCode(),
    issuedAt: now,
    expiresAt: addMinutes(now, PHONE_CHALLENGE_TTL_MINUTES)
  };

  await deps.verification.createChallenge(challenge);
  await deps.notifications.sendPublicTrackingOtp({
    phone: input.phone,
    otp: challenge.otp,
    trackingCode: delivery.trackingCode,
    expiresAt: challenge.expiresAt
  });

  return {
    challenge,
    response: requestPhoneVerificationChallengeResponseSchema.parse({
      deliveryId: delivery.deliveryId,
      trackingCode: delivery.trackingCode,
      challengeStatus: "sent",
      challengeId: challenge.challengeId,
      channel: "sms",
      maskedPhone: maskPhone(input.phone),
      expiresAt: challenge.expiresAt,
      resendAvailableAt: getChallengeResendAvailableAt(challenge.issuedAt)
    })
  };
}

export async function verifyPublicTrackingPhone(
  input: {
    trackingCode: string;
    phone: string;
    otp: string;
  },
  deps: VerifyPublicTrackingPhoneDeps
): Promise<{
  grant: PublicTrackingVerificationGrantRecord;
  response: VerifyPublicTrackingPhoneResponse;
}> {
  const now = deps.now();
  const delivery = await deps.deliveries.getByTrackingCode(input.trackingCode);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Tracking code was not found.", {
      trackingCode: input.trackingCode
    });
  }

  if (!isReceiverVerificationRequiredStatus(delivery.currentStatus)) {
    throw new ApiServiceError(
      "VALIDATION_ERROR",
      "Phone verification is not required for this delivery stage.",
      {
        currentStatus: delivery.currentStatus
      }
    );
  }

  if (delivery.receiver.phone !== input.phone) {
    return recordFailedAttempt(
      {
        trackingCode: input.trackingCode,
        phone: input.phone,
        reason: "phone_mismatch"
      },
      deps,
      now
    );
  }

  const activeGrant = await deps.verification.getActiveGrant(
    input.trackingCode,
    input.phone,
    now
  );

  if (activeGrant) {
    return {
      grant: activeGrant,
      response: verifyPhoneResponseSchema.parse({
        deliveryId: activeGrant.deliveryId,
        trackingCode: activeGrant.trackingCode,
        verificationToken: activeGrant.verificationToken,
        verifiedAt: activeGrant.verifiedAt,
        expiresAt: activeGrant.expiresAt
      })
    };
  }

  await assertNotLocked(input.trackingCode, now, deps);

  const challenge = await deps.verification.getLatestChallenge(input.trackingCode, input.phone);

  if (!challenge) {
    return recordFailedAttempt(
      {
        trackingCode: input.trackingCode,
        phone: input.phone,
        reason: "challenge_missing"
      },
      deps,
      now
    );
  }

  if (challenge.consumedAt) {
    return recordFailedAttempt(
      {
        trackingCode: input.trackingCode,
        phone: input.phone,
        reason: "challenge_consumed"
      },
      deps,
      now
    );
  }

  if (challenge.expiresAt <= now) {
    return recordFailedAttempt(
      {
        trackingCode: input.trackingCode,
        phone: input.phone,
        reason: "challenge_expired"
      },
      deps,
      now
    );
  }

  if (challenge.otp !== input.otp) {
    return recordFailedAttempt(
      {
        trackingCode: input.trackingCode,
        phone: input.phone,
        reason: "otp_mismatch"
      },
      deps,
      now
    );
  }

  const grant: PublicTrackingVerificationGrantRecord = {
    verificationId: deps.identityFactory.nextVerificationId(),
    deliveryId: delivery.deliveryId,
    trackingCode: delivery.trackingCode,
    phone: input.phone,
    verificationToken: deps.identityFactory.nextVerificationToken(),
    verifiedAt: now,
    expiresAt: addMinutes(now, VERIFICATION_GRANT_TTL_MINUTES)
  };

  await deps.verification.consumeChallenge(challenge.challengeId, now);
  await deps.verification.createGrant(grant);

  return {
    grant,
    response: verifyPhoneResponseSchema.parse({
      deliveryId: grant.deliveryId,
      trackingCode: grant.trackingCode,
      verificationToken: grant.verificationToken,
      verifiedAt: grant.verifiedAt,
      expiresAt: grant.expiresAt
    })
  };
}

export async function assertActiveReceiverVerificationToken(
  input: {
    delivery: {
      deliveryId: string;
      trackingCode: string;
      receiver: {
        phone: string;
      };
    };
    verificationToken: string;
  },
  deps: {
    verification: PublicTrackingVerificationRepository;
    now: () => string;
  }
): Promise<PublicTrackingVerificationGrantRecord> {
  const activeGrant = await deps.verification.getActiveGrant(
    input.delivery.trackingCode,
    input.delivery.receiver.phone,
    deps.now()
  );

  if (
    !activeGrant ||
    activeGrant.deliveryId !== input.delivery.deliveryId ||
    activeGrant.verificationToken !== input.verificationToken
  ) {
    throw new ApiServiceError(
      "PHONE_VERIFICATION_REQUIRED",
      "Receiver phone verification is required before OTP delivery completion.",
      {
        deliveryId: input.delivery.deliveryId,
        trackingCode: input.delivery.trackingCode
      }
    );
  }

  return activeGrant;
}

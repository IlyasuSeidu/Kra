import { describe, expect, it } from "vitest";

import type { DeliveryRecord } from "../deliveries";
import {
  requestPublicTrackingPhoneChallenge,
  type PublicTrackingPhoneChallengeRecord,
  type PublicTrackingVerificationGrantRecord
} from "../public-tracking-verification";
import type { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    deliveryId: "DEL-5201",
    trackingCode: "KRA-5201",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Ama Owusu",
      phone: "+233240000000"
    },
    package: {
      description: "Documents",
      weightKg: 0.5,
      sizeTier: "standard",
      isFragile: false,
      declaredValueGhs: 120
    },
    serviceType: "standard",
    doorstepRequested: false,
    currentStatus: "awaiting_receiver_pickup",
    paymentStatus: "confirmed",
    quote: {
      currency: "GHS",
      amount: 35
    },
    paymentRequiredBeforeDispatch: true,
    currentCustodyRole: null,
    currentCustodyActorId: null,
    latestEvent: {
      type: "delivery_received_at_destination",
      occurredAt: "2026-05-16T08:55:00.000Z"
    },
    latestTouchpoint: {
      role: "station_operator",
      stationId: "ST-KMS-01",
      occurredAt: "2026-05-16T08:55:00.000Z"
    },
    createdAt: "2026-05-16T08:00:00.000Z",
    ...overrides
  };
}

function makeChallenge(
  overrides: Partial<PublicTrackingPhoneChallengeRecord> = {}
): PublicTrackingPhoneChallengeRecord {
  return {
    challengeId: "CHL-5201",
    trackingCode: "KRA-5201",
    phone: "+233240000000",
    otp: "123456",
    issuedAt: "2026-05-16T10:00:00.000Z",
    expiresAt: "2026-05-16T10:10:00.000Z",
    ...overrides
  };
}

function makeGrant(
  overrides: Partial<PublicTrackingVerificationGrantRecord> = {}
): PublicTrackingVerificationGrantRecord {
  return {
    verificationId: "VRF-5201",
    deliveryId: "DEL-5201",
    trackingCode: "KRA-5201",
    phone: "+233240000000",
    verificationToken: "pvt_live_delivery_scope_token_5201",
    verifiedAt: "2026-05-16T10:01:00.000Z",
    expiresAt: "2026-05-16T10:31:00.000Z",
    ...overrides
  };
}

describe("public tracking phone challenge issuance", () => {
  it("creates and sends a new SMS challenge for an eligible receiver flow", async () => {
    const createdChallenges: PublicTrackingPhoneChallengeRecord[] = [];
    const sentOtps: string[] = [];

    const result = await requestPublicTrackingPhoneChallenge(
      {
        trackingCode: "KRA-5201",
        phone: "+233240000000"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          getByTrackingCode() {
            return resolve(makeDelivery());
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        verification: {
          getActiveGrant() {
            return resolve(undefined);
          },
          getLatestChallenge() {
            return resolve(undefined);
          },
          createChallenge(challenge) {
            createdChallenges.push(challenge);
            return resolveVoid();
          },
          listFailedAttemptsSince() {
            return resolve([]);
          },
          createFailedAttempt() {
            return resolveVoid();
          },
          consumeChallenge() {
            return resolveVoid();
          },
          createGrant() {
            return resolveVoid();
          }
        },
        notifications: {
          sendPublicTrackingOtp(input) {
            sentOtps.push(`${input.phone}:${input.otp}:${input.trackingCode}`);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextChallengeId: () => "CHL-5201",
          nextOtpCode: () => "123456",
          nextAttemptId: () => "ATT-IGNORED",
          nextVerificationId: () => "VRF-IGNORED",
          nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
        },
        now: () => "2026-05-16T10:00:00.000Z"
      }
    );

    expect(createdChallenges).toEqual([
      {
        challengeId: "CHL-5201",
        trackingCode: "KRA-5201",
        phone: "+233240000000",
        otp: "123456",
        issuedAt: "2026-05-16T10:00:00.000Z",
        expiresAt: "2026-05-16T10:10:00.000Z"
      }
    ]);
    expect(sentOtps).toEqual(["+233240000000:123456:KRA-5201"]);
    expect(result.response).toEqual({
      deliveryId: "DEL-5201",
      trackingCode: "KRA-5201",
      challengeStatus: "sent",
      challengeId: "CHL-5201",
      channel: "sms",
      maskedPhone: "+233*****0000",
      expiresAt: "2026-05-16T10:10:00.000Z",
      resendAvailableAt: "2026-05-16T10:01:00.000Z"
    });
  });

  it("reuses a recent challenge without sending another SMS", async () => {
    const result = await requestPublicTrackingPhoneChallenge(
      {
        trackingCode: "KRA-5201",
        phone: "+233240000000"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          getByTrackingCode() {
            return resolve(makeDelivery());
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        verification: {
          getActiveGrant() {
            return resolve(undefined);
          },
          getLatestChallenge() {
            return resolve(makeChallenge());
          },
          createChallenge() {
            throw new Error("should not create a new challenge inside the resend cooldown");
          },
          listFailedAttemptsSince() {
            return resolve([]);
          },
          createFailedAttempt() {
            return resolveVoid();
          },
          consumeChallenge() {
            return resolveVoid();
          },
          createGrant() {
            return resolveVoid();
          }
        },
        notifications: {
          sendPublicTrackingOtp() {
            throw new Error("should not send another SMS inside the resend cooldown");
          }
        },
        identityFactory: {
          nextChallengeId: () => "CHL-IGNORED",
          nextOtpCode: () => "654321",
          nextAttemptId: () => "ATT-IGNORED",
          nextVerificationId: () => "VRF-IGNORED",
          nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
        },
        now: () => "2026-05-16T10:00:30.000Z"
      }
    );

    expect(result.response).toEqual({
      deliveryId: "DEL-5201",
      trackingCode: "KRA-5201",
      challengeStatus: "recently_sent",
      challengeId: "CHL-5201",
      channel: "sms",
      maskedPhone: "+233*****0000",
      expiresAt: "2026-05-16T10:10:00.000Z",
      resendAvailableAt: "2026-05-16T10:01:00.000Z"
    });
  });

  it("returns the active receiver session when the delivery is already verified", async () => {
    const result = await requestPublicTrackingPhoneChallenge(
      {
        trackingCode: "KRA-5201",
        phone: "+233240000000"
      },
      {
        deliveries: {
          create() {
            return resolveVoid();
          },
          getById() {
            return resolve(undefined);
          },
          getByTrackingCode() {
            return resolve(makeDelivery());
          },
          updatePaymentStatus() {
            return resolveVoid();
          }
        },
        verification: {
          getActiveGrant() {
            return resolve(makeGrant());
          },
          getLatestChallenge() {
            throw new Error("should not fetch a challenge when access is already active");
          },
          createChallenge() {
            throw new Error("should not create a challenge when access is already active");
          },
          listFailedAttemptsSince() {
            return resolve([]);
          },
          createFailedAttempt() {
            return resolveVoid();
          },
          consumeChallenge() {
            return resolveVoid();
          },
          createGrant() {
            return resolveVoid();
          }
        },
        notifications: {
          sendPublicTrackingOtp() {
            throw new Error("should not send SMS when access is already active");
          }
        },
        identityFactory: {
          nextChallengeId: () => "CHL-IGNORED",
          nextOtpCode: () => "654321",
          nextAttemptId: () => "ATT-IGNORED",
          nextVerificationId: () => "VRF-IGNORED",
          nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
        },
        now: () => "2026-05-16T10:02:00.000Z"
      }
    );

    expect(result.response).toEqual({
      deliveryId: "DEL-5201",
      trackingCode: "KRA-5201",
      challengeStatus: "already_verified",
      maskedPhone: "+233*****0000",
      verificationToken: "pvt_live_delivery_scope_token_5201",
      verifiedAt: "2026-05-16T10:01:00.000Z",
      expiresAt: "2026-05-16T10:31:00.000Z"
    });
  });

  it("fails closed when SMS delivery is not configured for a fresh challenge", async () => {
    await expect(() =>
      requestPublicTrackingPhoneChallenge(
        {
          trackingCode: "KRA-5201",
          phone: "+233240000000"
        },
        {
          deliveries: {
            create() {
              return resolveVoid();
            },
            getById() {
              return resolve(undefined);
            },
            getByTrackingCode() {
              return resolve(makeDelivery());
            },
            updatePaymentStatus() {
              return resolveVoid();
            }
          },
          verification: {
            getActiveGrant() {
              return resolve(undefined);
            },
            getLatestChallenge() {
              return resolve(undefined);
            },
            createChallenge() {
              return resolveVoid();
            },
            listFailedAttemptsSince() {
              return resolve([]);
            },
            createFailedAttempt() {
              return resolveVoid();
            },
            consumeChallenge() {
              return resolveVoid();
            },
            createGrant() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextChallengeId: () => "CHL-5201",
            nextOtpCode: () => "123456",
            nextAttemptId: () => "ATT-IGNORED",
            nextVerificationId: () => "VRF-IGNORED",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
          },
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "ROUTE_NOT_ENABLED"
    } satisfies Partial<ApiServiceError>);
  });
});

import { describe, expect, it } from "vitest";

import { type DeliveryRecord } from "../deliveries";
import {
  assertActiveReceiverVerificationToken,
  verifyPublicTrackingPhone,
  type PublicTrackingPhoneChallengeRecord,
  type PublicTrackingVerificationFailedAttemptRecord,
  type PublicTrackingVerificationGrantRecord
} from "../public-tracking-verification";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeDelivery(
  overrides: Partial<DeliveryRecord> = {}
): DeliveryRecord {
  return {
    deliveryId: "DEL-5001",
    trackingCode: "KRA-5001",
    senderId: "USR-SND-001",
    originStationId: "ST-ACC-01",
    destinationStationId: "ST-KMS-01",
    receiver: {
      name: "Kojo Asante",
      phone: "+233240000000"
    },
    package: {
      description: "Phone accessories",
      weightKg: 1.8,
      sizeTier: "standard",
      isFragile: false,
      declaredValueGhs: 300
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
      type: "delivery_created",
      occurredAt: "2026-05-15T12:00:00.000Z"
    },
    latestTouchpoint: {
      role: "station_operator",
      stationId: "ST-KMS-01",
      occurredAt: "2026-05-16T09:00:00.000Z"
    },
    createdAt: "2026-05-15T12:00:00.000Z",
    ...overrides
  };
}

function makeChallenge(
  overrides: Partial<PublicTrackingPhoneChallengeRecord> = {}
): PublicTrackingPhoneChallengeRecord {
  return {
    challengeId: "CHL-5001",
    trackingCode: "KRA-5001",
    phone: "+233240000000",
    otp: "123456",
    issuedAt: "2026-05-16T09:55:00.000Z",
    expiresAt: "2026-05-16T10:05:00.000Z",
    ...overrides
  };
}

function makeGrant(
  overrides: Partial<PublicTrackingVerificationGrantRecord> = {}
): PublicTrackingVerificationGrantRecord {
  return {
    verificationId: "PVT-5001",
    deliveryId: "DEL-5001",
    trackingCode: "KRA-5001",
    phone: "+233240000000",
    verificationToken: "pvt_live_delivery_scope_token_5001",
    verifiedAt: "2026-05-16T10:00:00.000Z",
    expiresAt: "2026-05-16T10:30:00.000Z",
    ...overrides
  };
}

function makeFailedAttempt(
  overrides: Partial<PublicTrackingVerificationFailedAttemptRecord> = {}
): PublicTrackingVerificationFailedAttemptRecord {
  return {
    attemptId: "ATT-5001",
    trackingCode: "KRA-5001",
    attemptedAt: "2026-05-16T09:50:00.000Z",
    phone: "+233240000000",
    reason: "otp_mismatch",
    ...overrides
  };
}

function makeIdentityFactory(
  overrides: Partial<{
    nextChallengeId: () => string;
    nextOtpCode: () => string;
    nextAttemptId: () => string;
    nextVerificationId: () => string;
    nextVerificationToken: () => string;
  }> = {}
) {
  return {
    nextChallengeId: () => "CHL-DEFAULT",
    nextOtpCode: () => "654321",
    nextAttemptId: () => "ATT-DEFAULT",
    nextVerificationId: () => "PVT-DEFAULT",
    nextVerificationToken: () => "pvt_live_delivery_scope_token_default",
    ...overrides
  };
}

describe("public tracking phone verification", () => {
  it("creates a delivery-scoped verification grant for a valid receiver OTP", async () => {
    const consumedChallenges: string[] = [];
    const createdGrants: PublicTrackingVerificationGrantRecord[] = [];

    const result = await verifyPublicTrackingPhone(
      {
        trackingCode: "KRA-5001",
        phone: "+233240000000",
        otp: "123456"
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
            return resolveVoid();
          },
          listFailedAttemptsSince() {
            return resolve([]);
          },
          createFailedAttempt() {
            return resolveVoid();
          },
          consumeChallenge(challengeId, consumedAt) {
            consumedChallenges.push(`${challengeId}:${consumedAt}`);
            return resolveVoid();
          },
          createGrant(grant) {
            createdGrants.push(grant);
            return resolveVoid();
          }
        },
        identityFactory: makeIdentityFactory({
          nextVerificationId: () => "PVT-5001",
          nextVerificationToken: () => "pvt_live_delivery_scope_token_5001"
        }),
        now: () => "2026-05-16T10:00:00.000Z"
      }
    );

    expect(consumedChallenges).toEqual(["CHL-5001:2026-05-16T10:00:00.000Z"]);
    expect(createdGrants).toHaveLength(1);
    expect(result.response).toEqual({
      deliveryId: "DEL-5001",
      trackingCode: "KRA-5001",
      verificationToken: "pvt_live_delivery_scope_token_5001",
      verifiedAt: "2026-05-16T10:00:00.000Z",
      expiresAt: "2026-05-16T10:30:00.000Z"
    });
  });

  it("requires the active receiver verification token for OTP delivery completion", async () => {
    await expect(
      assertActiveReceiverVerificationToken(
        {
          delivery: makeDelivery(),
          verificationToken: "wrong-token"
        },
        {
          verification: {
            getActiveGrant() {
              return resolve(makeGrant());
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
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "PHONE_VERIFICATION_REQUIRED"
    });

    await expect(
      assertActiveReceiverVerificationToken(
        {
          delivery: makeDelivery(),
          verificationToken: "pvt_live_delivery_scope_token_5001"
        },
        {
          verification: {
            getActiveGrant() {
              return resolve(makeGrant());
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
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).resolves.toMatchObject({
      verificationToken: "pvt_live_delivery_scope_token_5001"
    });
  });

  it("returns an active grant idempotently without consuming another challenge", async () => {
    const result = await verifyPublicTrackingPhone(
      {
        trackingCode: "KRA-5001",
        phone: "+233240000000",
        otp: "123456"
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
            throw new Error("should not fetch challenge when an active grant exists");
          },
          createChallenge() {
            throw new Error("should not create a challenge when an active grant exists");
          },
          listFailedAttemptsSince() {
            throw new Error("should not read failed attempts when an active grant exists");
          },
          createFailedAttempt() {
            throw new Error("should not create failed attempts on idempotent success");
          },
          consumeChallenge() {
            throw new Error("should not consume challenge on idempotent success");
          },
          createGrant() {
            throw new Error("should not create a second grant");
          }
        },
        identityFactory: makeIdentityFactory({
          nextVerificationId: () => "PVT-IGNORED",
          nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
        }),
        now: () => "2026-05-16T10:05:00.000Z"
      }
    );

    expect(result.response).toEqual({
      deliveryId: "DEL-5001",
      trackingCode: "KRA-5001",
      verificationToken: "pvt_live_delivery_scope_token_5001",
      verifiedAt: "2026-05-16T10:00:00.000Z",
      expiresAt: "2026-05-16T10:30:00.000Z"
    });
  });

  it("rejects tracking codes that do not exist or do not currently require receiver verification", async () => {
    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-MISSING",
          phone: "+233240000000",
          otp: "123456"
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
              return resolve(undefined);
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
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-5001",
            nextVerificationId: () => "PVT-5001",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_5001"
          }),
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);

    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-5001",
          phone: "+233240000000",
          otp: "123456"
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
              return resolve(makeDelivery({
                currentStatus: "received_at_destination"
              }));
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
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-5002",
            nextVerificationId: () => "PVT-5002",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_5002"
          }),
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });

  it("records generic failures for wrong phones or mismatched OTPs", async () => {
    const failedAttempts: string[] = [];

    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-5001",
          phone: "+233200000000",
          otp: "123456"
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
            createFailedAttempt(attempt) {
              failedAttempts.push(`${attempt.phone}:${attempt.reason}`);
              return resolveVoid();
            },
            consumeChallenge() {
              return resolveVoid();
            },
            createGrant() {
              return resolveVoid();
            }
          },
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-5003",
            nextVerificationId: () => "PVT-5003",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_5003"
          }),
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      details: {
        attemptsRemaining: 4
      }
    });

    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-5001",
          phone: "+233240000000",
          otp: "000000"
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
              return resolveVoid();
            },
            listFailedAttemptsSince() {
              return resolve([]);
            },
            createFailedAttempt(attempt) {
              failedAttempts.push(`${attempt.phone}:${attempt.reason}`);
              return resolveVoid();
            },
            consumeChallenge() {
              return resolveVoid();
            },
            createGrant() {
              return resolveVoid();
            }
          },
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-5004",
            nextVerificationId: () => "PVT-5004",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_5004"
          }),
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      details: {
        attemptsRemaining: 4
      }
    });

    expect(failedAttempts).toEqual([
      "+233200000000:phone_mismatch",
      "+233240000000:otp_mismatch"
    ]);
  });

  it("locks verification after five failures in fifteen minutes", async () => {
    const recentAttempts = [
      makeFailedAttempt({
        attemptId: "ATT-1",
        attemptedAt: "2026-05-16T09:46:00.000Z"
      }),
      makeFailedAttempt({
        attemptId: "ATT-2",
        attemptedAt: "2026-05-16T09:48:00.000Z"
      }),
      makeFailedAttempt({
        attemptId: "ATT-3",
        attemptedAt: "2026-05-16T09:50:00.000Z"
      }),
      makeFailedAttempt({
        attemptId: "ATT-4",
        attemptedAt: "2026-05-16T09:52:00.000Z"
      })
    ];
    const recordedAttempts: string[] = [];

    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-5001",
          phone: "+233240000000",
          otp: "000000"
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
              return resolveVoid();
            },
            listFailedAttemptsSince() {
              return resolve(recentAttempts);
            },
            createFailedAttempt(attempt) {
              recordedAttempts.push(attempt.attemptedAt);
              return resolveVoid();
            },
            consumeChallenge() {
              return resolveVoid();
            },
            createGrant() {
              return resolveVoid();
            }
          },
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-5",
            nextVerificationId: () => "PVT-5005",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_5005"
          }),
          now: () => "2026-05-16T10:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
      details: {
        lockUntil: "2026-05-16T10:01:00.000Z"
      }
    });

    expect(recordedAttempts).toEqual(["2026-05-16T10:00:00.000Z"]);

    await expect(() =>
      verifyPublicTrackingPhone(
        {
          trackingCode: "KRA-5001",
          phone: "+233240000000",
          otp: "123456"
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
              throw new Error("should not read challenges while the delivery is locked");
            },
            createChallenge() {
              throw new Error("should not create challenges while the delivery is locked");
            },
            listFailedAttemptsSince() {
              return resolve([
                ...recentAttempts,
                makeFailedAttempt({
                  attemptId: "ATT-5",
                  attemptedAt: "2026-05-16T10:00:00.000Z"
                })
              ]);
            },
            createFailedAttempt() {
              throw new Error("should not record another attempt while locked");
            },
            consumeChallenge() {
              return resolveVoid();
            },
            createGrant() {
              return resolveVoid();
            }
          },
          identityFactory: makeIdentityFactory({
            nextAttemptId: () => "ATT-IGNORED",
            nextVerificationId: () => "PVT-IGNORED",
            nextVerificationToken: () => "pvt_live_delivery_scope_token_ignored"
          }),
          now: () => "2026-05-16T10:00:30.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
      details: {
        lockUntil: "2026-05-16T10:01:00.000Z"
      }
    });
  });
});

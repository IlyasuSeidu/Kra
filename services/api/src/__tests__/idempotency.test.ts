import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  executeIdempotentOperation,
  type IdempotencyRecord
} from "../idempotency";
import { ApiServiceError } from "../service-errors";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
    .join(",")}}`;
}

function hashFingerprint(fingerprint: Record<string, unknown>): string {
  return createHash("sha256").update(stableSerialize(fingerprint)).digest("hex");
}

describe("idempotency service", () => {
  it("replays a completed response for the same scope and payload", async () => {
    const fingerprint = {
      body: {
        originStationId: "ST-ACC-01"
      }
    };
    const storedRecord: IdempotencyRecord = {
      recordId: "IDM-1001",
      scopeKey: "create_delivery:USR-SND-001:idem-1",
      routeKey: "create_delivery",
      actorKey: "USR-SND-001",
      idempotencyKey: "idem-1",
      requestHash: hashFingerprint(fingerprint),
      status: "completed",
      requestId: "REQ-1001",
      createdAt: "2026-05-16T15:00:00.000Z",
      completedAt: "2026-05-16T15:00:01.000Z",
      responseStatusCode: 201,
      responseBody: {
        deliveryId: "DEL-1001",
        trackingCode: "KRA-1001"
      }
    };

    const result = await executeIdempotentOperation(
      {
        routeKey: "create_delivery",
        actorKey: "USR-SND-001",
        idempotencyKey: "idem-1",
        requestId: "REQ-1002",
        fingerprint
      },
      {
        repository: {
          getByScopeKey() {
            return resolve(storedRecord);
          },
          createPending() {
            return resolveVoid();
          },
          markCompleted() {
            return resolveVoid();
          },
          delete() {
            return resolveVoid();
          }
        },
        identityFactory: {
          nextIdempotencyRecordId: () => "IDM-1002"
        },
        now: () => "2026-05-16T15:00:05.000Z"
      },
      () =>
        Promise.resolve({
          statusCode: 201,
          responseBody: {
            deliveryId: "DEL-IGNORED"
          }
        })
    );

    expect(result.replayed).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.responseBody).toEqual({
      deliveryId: "DEL-1001",
      trackingCode: "KRA-1001"
    });
  });

  it("rejects a reused key with a different payload", async () => {
    const storedRecord: IdempotencyRecord = {
      recordId: "IDM-1001",
      scopeKey: "create_delivery:USR-SND-001:idem-1",
      routeKey: "create_delivery",
      actorKey: "USR-SND-001",
      idempotencyKey: "idem-1",
      requestHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      status: "completed",
      requestId: "REQ-1001",
      createdAt: "2026-05-16T15:00:00.000Z",
      responseStatusCode: 201,
      responseBody: {
        deliveryId: "DEL-1001"
      }
    };

    await expect(() =>
      executeIdempotentOperation(
        {
          routeKey: "create_delivery",
          actorKey: "USR-SND-001",
          idempotencyKey: "idem-1",
          requestId: "REQ-1002",
          fingerprint: {
            body: {
              originStationId: "ST-KMS-01"
            }
          }
        },
        {
          repository: {
            getByScopeKey() {
              return resolve(storedRecord);
            },
            createPending() {
              return resolveVoid();
            },
            markCompleted() {
              return resolveVoid();
            },
            delete() {
              return resolveVoid();
            }
          },
          identityFactory: {
            nextIdempotencyRecordId: () => "IDM-1002"
          },
          now: () => "2026-05-16T15:00:05.000Z"
        },
        () =>
          Promise.resolve({
            statusCode: 201,
            responseBody: {
              deliveryId: "DEL-IGNORED"
            }
          })
      )
    ).rejects.toBeInstanceOf(ApiServiceError);
  });
});

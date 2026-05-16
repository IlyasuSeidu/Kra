import { createHash } from "node:crypto";

import { ApiServiceError } from "./service-errors";

export interface IdempotencyRecord {
  recordId: string;
  scopeKey: string;
  routeKey: string;
  actorKey: string;
  idempotencyKey: string;
  requestHash: string;
  status: "in_progress" | "completed";
  requestId: string;
  createdAt: string;
  completedAt?: string;
  responseStatusCode?: number;
  responseBody?: Record<string, unknown>;
}

export interface IdempotencyRepository {
  getByScopeKey(scopeKey: string): Promise<IdempotencyRecord | undefined>;
  createPending(record: IdempotencyRecord): Promise<void>;
  markCompleted(input: {
    recordId: string;
    completedAt: string;
    responseStatusCode: number;
    responseBody: Record<string, unknown>;
  }): Promise<void>;
  delete(recordId: string): Promise<void>;
}

export interface IdempotencyIdentityFactory {
  nextIdempotencyRecordId(): string;
}

export interface ExecuteIdempotentOperationDeps {
  repository: IdempotencyRepository;
  identityFactory: IdempotencyIdentityFactory;
  now: () => string;
}

export interface ExecuteIdempotentOperationInput {
  routeKey: string;
  actorKey: string;
  idempotencyKey: string | undefined;
  requestId: string;
  fingerprint: Record<string, unknown>;
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

function hashRequestFingerprint(fingerprint: Record<string, unknown>): string {
  return createHash("sha256").update(stableSerialize(fingerprint)).digest("hex");
}

function buildScopeKey(input: {
  routeKey: string;
  actorKey: string;
  idempotencyKey: string;
}): string {
  return `${input.routeKey}:${input.actorKey}:${input.idempotencyKey}`;
}

export async function executeIdempotentOperation<TResponse extends object>(
  input: ExecuteIdempotentOperationInput,
  deps: ExecuteIdempotentOperationDeps,
  operation: () => Promise<{
    statusCode: number;
    responseBody: TResponse;
  }>
): Promise<{
  replayed: boolean;
  statusCode: number;
  responseBody: TResponse;
}> {
  if (!input.idempotencyKey) {
    const result = await operation();

    return {
      replayed: false,
      statusCode: result.statusCode,
      responseBody: result.responseBody
    };
  }

  const requestHash = hashRequestFingerprint(input.fingerprint);
  const scopeKey = buildScopeKey({
    routeKey: input.routeKey,
    actorKey: input.actorKey,
    idempotencyKey: input.idempotencyKey
  });
  const existingRecord = await deps.repository.getByScopeKey(scopeKey);

  if (existingRecord) {
    if (existingRecord.requestHash !== requestHash) {
      throw new ApiServiceError(
        "VALIDATION_ERROR",
        "Idempotency key was already used with a different request payload.",
        {
          routeKey: input.routeKey,
          idempotencyKey: input.idempotencyKey
        }
      );
    }

    if (existingRecord.status === "completed") {
      return {
        replayed: true,
        statusCode: existingRecord.responseStatusCode ?? 200,
        responseBody: (existingRecord.responseBody ?? {}) as TResponse
      };
    }

    throw new ApiServiceError(
      "VALIDATION_ERROR",
      "A request with this idempotency key is already in progress.",
      {
        routeKey: input.routeKey,
        idempotencyKey: input.idempotencyKey
      }
    );
  }

  const record: IdempotencyRecord = {
    recordId: deps.identityFactory.nextIdempotencyRecordId(),
    scopeKey,
    routeKey: input.routeKey,
    actorKey: input.actorKey,
    idempotencyKey: input.idempotencyKey,
    requestHash,
    status: "in_progress",
    requestId: input.requestId,
    createdAt: deps.now()
  };

  await deps.repository.createPending(record);

  try {
    const result = await operation();

    await deps.repository.markCompleted({
      recordId: record.recordId,
      completedAt: deps.now(),
      responseStatusCode: result.statusCode,
      responseBody: result.responseBody as Record<string, unknown>
    });

    return {
      replayed: false,
      statusCode: result.statusCode,
      responseBody: result.responseBody
    };
  } catch (error) {
    await deps.repository.delete(record.recordId);
    throw error;
  }
}

import {
  auditEventListQuerySchema,
  auditEventListResponseSchema,
  type Role,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";
import { assertAdminPrincipal } from "./auth";

export interface AuditEventRecord {
  eventId: string;
  requestId: string;
  action: string;
  actorId: string;
  actorRole: Role;
  occurredAt: string;
  stationId?: StationId;
  targetType?: "delivery" | "payment" | "issue" | "tracking";
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditEventRepository {
  create(event: AuditEventRecord): Promise<void>;
  listRecent(input: {
    actorId?: string;
    targetType?: NonNullable<AuditEventRecord["targetType"]>;
    targetId?: string;
    limit: number;
  }): Promise<AuditEventRecord[]>;
}

export interface AuditIdentityFactory {
  nextAuditEventId(): string;
}

export type AuditEventListResponse = z.infer<typeof auditEventListResponseSchema>;

export async function listAdminAuditEvents(
  principal: AuthPrincipal,
  input: z.input<typeof auditEventListQuerySchema>,
  deps: {
    auditEvents: AuditEventRepository;
  }
): Promise<AuditEventListResponse> {
  assertAdminPrincipal(principal);

  const parsedInput = auditEventListQuerySchema.parse(input);
  const events = await deps.auditEvents.listRecent({
    ...(parsedInput.actorId === undefined ? {} : { actorId: parsedInput.actorId }),
    ...(parsedInput.targetType === undefined ? {} : { targetType: parsedInput.targetType }),
    ...(parsedInput.targetId === undefined ? {} : { targetId: parsedInput.targetId }),
    limit: parsedInput.limit ?? 50
  });

  return auditEventListResponseSchema.parse({
    events
  });
}

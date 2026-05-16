import type { Role, StationId } from "@kra/shared";

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
}

export interface AuditIdentityFactory {
  nextAuditEventId(): string;
}

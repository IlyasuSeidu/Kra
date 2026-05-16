import {
  canPerform,
  createIssueRequestSchema,
  escalateIssueRequestSchema,
  issueResponseSchema,
  type Capability,
  type Role
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";
import { assertAdminPrincipal, assertCanAccessDelivery } from "./auth";
import type { DeliveryRecord, DeliveryRepository } from "./deliveries";
import { ApiServiceError } from "./service-errors";

export interface SupportIssueRecord {
  issueId: string;
  deliveryId: string;
  status: "open" | "in_review" | "escalated" | "resolved" | "closed";
  severity: "p1" | "p2" | "p3";
  category: "delay" | "damage" | "loss" | "payment" | "handoff" | "other";
  summary: string;
  description?: string;
  reporter: {
    actorId: string;
    actorRole: Role;
  };
  escalatedAt?: string;
  escalatedByActorId?: string;
  escalationReasonCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportIssueRepository {
  create(issue: SupportIssueRecord): Promise<void>;
  getById(issueId: string): Promise<SupportIssueRecord | undefined>;
  save(issue: SupportIssueRecord): Promise<void>;
  listByDeliveryId(deliveryId: string): Promise<SupportIssueRecord[]>;
  countOpenByStation(stationId: DeliveryRecord["originStationId"]): Promise<number>;
}

export interface SupportIssueIdentityFactory {
  nextIssueId(): string;
}

export interface CreateSupportIssueDeps {
  deliveries: DeliveryRepository;
  issues: SupportIssueRepository;
  identityFactory: SupportIssueIdentityFactory;
  now: () => string;
}

export interface EscalateSupportIssueDeps {
  deliveries: DeliveryRepository;
  issues: SupportIssueRepository;
  now: () => string;
}

export type IssueResponse = z.infer<typeof issueResponseSchema>;

function toIssueResponse(issue: SupportIssueRecord): IssueResponse {
  return issueResponseSchema.parse({
    issueId: issue.issueId,
    deliveryId: issue.deliveryId,
    status: issue.status,
    severity: issue.severity,
    category: issue.category,
    summary: issue.summary,
    ...(issue.description === undefined ? {} : { description: issue.description }),
    reporter: {
      actorId: issue.reporter.actorId,
      actorRole: issue.reporter.actorRole
    },
    ...(issue.escalatedAt === undefined ? {} : { escalatedAt: issue.escalatedAt }),
    ...(issue.escalatedByActorId === undefined
      ? {}
      : { escalatedByActorId: issue.escalatedByActorId }),
    ...(issue.escalationReasonCode === undefined
      ? {}
      : { escalationReasonCode: issue.escalationReasonCode }),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt
  });
}

function assertIssueCreationScope(principal: AuthPrincipal, delivery: DeliveryRecord): void {
  if (principal.role === "sender") {
    assertCanAccessDelivery(principal, delivery);
    return;
  }

  if (
    principal.role === "driver" ||
    principal.role === "station_operator" ||
    principal.role === "final_mile_courier"
  ) {
    assertCanAccessDelivery(principal, delivery);
    return;
  }

  if (
    principal.role === "ops_admin" ||
    principal.role === "support_admin" ||
    principal.role === "super_admin" ||
    principal.role === "finance_admin"
  ) {
    return;
  }

  throw new ApiServiceError("FORBIDDEN", "Principal cannot create support issues.", {
    userId: principal.userId,
    role: principal.role
  });
}

function assertEscalationCapability(principal: AuthPrincipal): void {
  const allowedCapabilities: Capability[] = ["escalate_case", "resolve_operational_issue"];
  const hasCapability = allowedCapabilities.some((capability) => canPerform(principal.role, capability));

  if (!hasCapability) {
    throw new ApiServiceError("FORBIDDEN", "Principal cannot escalate support issues.", {
      userId: principal.userId,
      role: principal.role
    });
  }
}

export async function createSupportIssue(
  principal: AuthPrincipal,
  input: z.input<typeof createIssueRequestSchema>,
  deps: CreateSupportIssueDeps
): Promise<{
  issue: SupportIssueRecord;
  response: IssueResponse;
}> {
  const parsedInput = createIssueRequestSchema.parse(input);
  const delivery = await deps.deliveries.getById(parsedInput.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery was not found.", {
      deliveryId: parsedInput.deliveryId
    });
  }

  assertIssueCreationScope(principal, delivery);

  const timestamp = deps.now();
  const issue: SupportIssueRecord = {
    issueId: deps.identityFactory.nextIssueId(),
    deliveryId: delivery.deliveryId,
    status: "open",
    severity: parsedInput.severity,
    category: parsedInput.category,
    summary: parsedInput.summary,
    ...(parsedInput.description === undefined ? {} : { description: parsedInput.description }),
    reporter: {
      actorId: principal.userId,
      actorRole: principal.role
    },
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await deps.issues.create(issue);

  return {
    issue,
    response: toIssueResponse(issue)
  };
}

export async function getSupportIssue(
  principal: AuthPrincipal,
  issueId: string,
  deps: {
    deliveries: DeliveryRepository;
    issues: SupportIssueRepository;
  }
): Promise<IssueResponse> {
  const issue = await deps.issues.getById(issueId);

  if (!issue) {
    throw new ApiServiceError("NOT_FOUND", "Support issue was not found.", {
      issueId
    });
  }

  const delivery = await deps.deliveries.getById(issue.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery linked to this issue was not found.", {
      issueId,
      deliveryId: issue.deliveryId
    });
  }

  if (
    principal.role !== "ops_admin" &&
    principal.role !== "support_admin" &&
    principal.role !== "finance_admin" &&
    principal.role !== "super_admin"
  ) {
    assertCanAccessDelivery(principal, delivery);
  }

  return toIssueResponse(issue);
}

export async function escalateSupportIssue(
  principal: AuthPrincipal,
  issueId: string,
  input: z.input<typeof escalateIssueRequestSchema>,
  deps: EscalateSupportIssueDeps
): Promise<{
  issue: SupportIssueRecord;
  response: IssueResponse;
}> {
  assertAdminPrincipal(principal);
  assertEscalationCapability(principal);

  const parsedInput = escalateIssueRequestSchema.parse(input);
  const issue = await deps.issues.getById(issueId);

  if (!issue) {
    throw new ApiServiceError("NOT_FOUND", "Support issue was not found.", {
      issueId
    });
  }

  const delivery = await deps.deliveries.getById(issue.deliveryId);

  if (!delivery) {
    throw new ApiServiceError("NOT_FOUND", "Delivery linked to this issue was not found.", {
      issueId,
      deliveryId: issue.deliveryId
    });
  }

  const timestamp = deps.now();
  const escalatedIssue: SupportIssueRecord = {
    ...issue,
    status: "escalated",
    escalatedAt: timestamp,
    escalatedByActorId: principal.userId,
    escalationReasonCode: parsedInput.reasonCode,
    updatedAt: timestamp
  };

  await deps.issues.save(escalatedIssue);

  return {
    issue: escalatedIssue,
    response: toIssueResponse(escalatedIssue)
  };
}

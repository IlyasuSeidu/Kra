import {
  adminUpdateUserAccessRequestSchema,
  adminUpsertUserRequestSchema,
  adminUserListQuerySchema,
  adminUserListResponseSchema,
  adminUserResponseSchema,
  type Role,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";
import { ApiServiceError } from "./service-errors";

export interface UserRecord {
  userId: string;
  fullName: string;
  role: Role;
  status: "active" | "inactive";
  stationId?: StationId;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
}

export interface UserRepository {
  getById(userId: string): Promise<UserRecord | undefined>;
  save(user: UserRecord): Promise<void>;
  list(input: {
    role?: Role;
    status?: UserRecord["status"];
    stationId?: StationId;
    limit: number;
  }): Promise<UserRecord[]>;
}

export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;
export type AdminUserListResponse = z.infer<typeof adminUserListResponseSchema>;

function assertStationRoleBinding(role: Role, stationId: StationId | undefined): void {
  const requiresStation = role === "station_operator";
  const forbidsStation =
    role === "sender" ||
    role === "ops_admin" ||
    role === "finance_admin" ||
    role === "support_admin" ||
    role === "super_admin";

  if (requiresStation && stationId === undefined) {
    throw new ApiServiceError("VALIDATION_ERROR", "stationId is required for station operators.", {
      role
    });
  }

  if (forbidsStation && stationId !== undefined) {
    throw new ApiServiceError("VALIDATION_ERROR", "stationId is not allowed for this role.", {
      role,
      stationId
    });
  }
}

function toAdminUserResponse(user: UserRecord): AdminUserResponse {
  return adminUserResponseSchema.parse({
    userId: user.userId,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    ...(user.stationId === undefined ? {} : { stationId: user.stationId }),
    ...(user.email === undefined ? {} : { email: user.email }),
    ...(user.phone === undefined ? {} : { phone: user.phone }),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(user.activatedAt === undefined ? {} : { activatedAt: user.activatedAt }),
    ...(user.deactivatedAt === undefined ? {} : { deactivatedAt: user.deactivatedAt })
  });
}

function buildUserRecord(
  input: z.infer<typeof adminUpsertUserRequestSchema>,
  existing: UserRecord | undefined,
  now: string
): UserRecord {
  const status = input.status ?? existing?.status ?? "active";
  const nextUser: UserRecord = {
    userId: input.userId,
    fullName: input.fullName,
    role: input.role,
    status,
    ...(input.stationId === undefined ? {} : { stationId: input.stationId }),
    ...(input.email === undefined ? {} : { email: input.email }),
    ...(input.phone === undefined ? {} : { phone: input.phone }),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(status === "active" ? { activatedAt: existing?.activatedAt ?? now } : {}),
    ...(status === "inactive" ? { deactivatedAt: now } : {})
  };

  return nextUser;
}

export async function listAdminUsers(
  query: Record<string, unknown>,
  deps: {
    users: UserRepository;
    now: () => string;
  }
): Promise<AdminUserListResponse> {
  const parsedQuery = adminUserListQuerySchema.parse(query);
  const users = await deps.users.list({
    ...(parsedQuery.role === undefined ? {} : { role: parsedQuery.role }),
    ...(parsedQuery.status === undefined ? {} : { status: parsedQuery.status }),
    ...(parsedQuery.stationId === undefined ? {} : { stationId: parsedQuery.stationId }),
    limit: parsedQuery.limit ?? 100
  });

  return adminUserListResponseSchema.parse({
    generatedAt: deps.now(),
    users: users.map(toAdminUserResponse)
  });
}

export async function upsertAdminUser(
  principal: AuthPrincipal,
  input: z.infer<typeof adminUpsertUserRequestSchema>,
  deps: {
    users: UserRepository;
    now: () => string;
  }
): Promise<AdminUserResponse> {
  const parsedInput = adminUpsertUserRequestSchema.parse(input);

  if (principal.userId === parsedInput.userId && parsedInput.status === "inactive") {
    throw new ApiServiceError("FORBIDDEN", "Super admins cannot deactivate their own account.", {
      userId: principal.userId
    });
  }

  assertStationRoleBinding(parsedInput.role, parsedInput.stationId);

  const existing = await deps.users.getById(parsedInput.userId);
  const nextUser = buildUserRecord(parsedInput, existing, deps.now());

  await deps.users.save(nextUser);

  return toAdminUserResponse(nextUser);
}

export async function updateAdminUserAccess(
  principal: AuthPrincipal,
  userId: string,
  input: z.infer<typeof adminUpdateUserAccessRequestSchema>,
  deps: {
    users: UserRepository;
    now: () => string;
  }
): Promise<AdminUserResponse> {
  const parsedInput = adminUpdateUserAccessRequestSchema.parse(input);

  if (principal.userId === userId) {
    throw new ApiServiceError("FORBIDDEN", "Super admins cannot modify their own role or activation state.", {
      userId
    });
  }

  assertStationRoleBinding(parsedInput.role, parsedInput.stationId);

  const existing = await deps.users.getById(userId);

  if (!existing) {
    throw new ApiServiceError("NOT_FOUND", "User was not found.", {
      userId
    });
  }

  const now = deps.now();
  const nextUser: UserRecord = {
    ...existing,
    role: parsedInput.role,
    status: parsedInput.status,
    updatedAt: now,
    ...(parsedInput.stationId === undefined ? {} : { stationId: parsedInput.stationId }),
    ...(parsedInput.status === "active"
      ? {
          activatedAt: existing.activatedAt ?? now
        }
      : {
          deactivatedAt: now
        })
  };

  if (parsedInput.stationId === undefined) {
    delete nextUser.stationId;
  }

  if (parsedInput.status === "active") {
    delete nextUser.deactivatedAt;
  }

  await deps.users.save(nextUser);

  return toAdminUserResponse(nextUser);
}

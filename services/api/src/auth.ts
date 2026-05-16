import { canPerform, getCapabilities, type Capability, type Role, type StationId } from "@kra/shared";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import type { App } from "firebase-admin/app";

import type { DeliveryRecord } from "./deliveries";
import { ApiServiceError } from "./service-errors";

export interface AuthPrincipal {
  userId: string;
  role: Role;
  stationId?: StationId;
  capabilities: readonly Capability[];
  authMethod: "firebase_id_token";
}

export interface AuthVerifier {
  verifyBearerToken(token: string): Promise<AuthPrincipal>;
}

export function createFirebaseAuthVerifier(app: App): AuthVerifier {
  return {
    async verifyBearerToken(token: string) {
      const decodedToken = await getAuth(app).verifyIdToken(token, true);

      return buildPrincipalFromDecodedToken(decodedToken);
    }
  };
}

function isAdminRole(role: Role): boolean {
  return (
    role === "ops_admin" ||
    role === "finance_admin" ||
    role === "support_admin" ||
    role === "super_admin"
  );
}

export function assertAuthenticatedPrincipal(
  principal: AuthPrincipal | undefined
): asserts principal is AuthPrincipal {
  if (!principal) {
    throw new ApiServiceError("FORBIDDEN", "Authentication is required.", {
      reason: "missing_principal"
    });
  }
}

export function assertCapabilityForPrincipal(
  principal: AuthPrincipal,
  capability: Capability
): void {
  if (!canPerform(principal.role, capability)) {
    throw new ApiServiceError("FORBIDDEN", "Principal does not have the required capability.", {
      userId: principal.userId,
      role: principal.role,
      capability
    });
  }
}

export function canAccessDelivery(
  principal: AuthPrincipal,
  delivery: DeliveryRecord
): boolean {
  if (principal.role === "sender") {
    return delivery.senderId === principal.userId;
  }

  if (isAdminRole(principal.role)) {
    if (principal.role === "finance_admin") {
      return true;
    }

    return true;
  }

  if (principal.role === "station_operator") {
    return (
      principal.stationId === delivery.originStationId ||
      principal.stationId === delivery.destinationStationId
    );
  }

  if (principal.role === "driver") {
    return delivery.assignedDriverId === principal.userId;
  }

  if (principal.role === "final_mile_courier") {
    return delivery.assignedFinalMileCourierId === principal.userId;
  }

  return false;
}

export function assertCanAccessDelivery(
  principal: AuthPrincipal,
  delivery: DeliveryRecord
): void {
  if (!canAccessDelivery(principal, delivery)) {
    throw new ApiServiceError("FORBIDDEN", "Delivery is outside the actor scope.", {
      userId: principal.userId,
      role: principal.role,
      deliveryId: delivery.deliveryId
    });
  }
}

export function assertAdminPrincipal(principal: AuthPrincipal): void {
  if (!isAdminRole(principal.role)) {
    throw new ApiServiceError("FORBIDDEN", "Admin scope is required.", {
      userId: principal.userId,
      role: principal.role
    });
  }
}

function parseRoleClaim(claim: unknown): Role {
  if (typeof claim !== "string") {
    throw new ApiServiceError("FORBIDDEN", "Role claim is missing.", {
      reason: "missing_role_claim"
    });
  }

  const roles: Role[] = [
    "sender",
    "driver",
    "station_operator",
    "final_mile_courier",
    "ops_admin",
    "finance_admin",
    "support_admin",
    "super_admin"
  ];

  if (!roles.includes(claim as Role)) {
    throw new ApiServiceError("FORBIDDEN", "Role claim is invalid.", {
      roleClaim: claim
    });
  }

  return claim as Role;
}

export function buildPrincipalFromDecodedToken(token: DecodedIdToken): AuthPrincipal {
  const role = parseRoleClaim(token.kra_role);
  const stationId = typeof token.kra_station_id === "string" ? (token.kra_station_id as StationId) : undefined;
  const normalizedUserId = token.uid.startsWith("USR-")
    ? token.uid
    : `USR-${token.uid.toUpperCase()}`;

  return {
    userId: normalizedUserId,
    role,
    ...(stationId === undefined ? {} : { stationId }),
    capabilities: getCapabilities(role),
    authMethod: "firebase_id_token"
  };
}

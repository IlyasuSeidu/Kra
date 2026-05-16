import { describe, expect, it } from "vitest";

import { updateAdminUserAccess, upsertAdminUser } from "../users";

function makePrincipal() {
  return {
    userId: "USR-SUP-001",
    role: "super_admin" as const,
    capabilities: ["manage_users_and_roles"] as const,
    authMethod: "firebase_id_token" as const
  };
}

describe("admin users", () => {
  it("creates a station operator with station scope", async () => {
    const saved: Array<unknown> = [];

    const response = await upsertAdminUser(
      makePrincipal(),
      {
        userId: "USR-OPS-001",
        fullName: "Ama Owusu",
        role: "station_operator",
        status: "active",
        stationId: "ST-ACC-01",
        phone: "+233240000001"
      },
        {
          users: {
            getById: () => Promise.resolve(undefined),
            save: (user) => {
              saved.push(user);
              return Promise.resolve();
            },
            list: () => Promise.resolve([])
          },
          now: () => "2026-05-16T18:00:00.000Z"
        }
    );

    expect(response).toMatchObject({
      userId: "USR-OPS-001",
      role: "station_operator",
      stationId: "ST-ACC-01",
      status: "active"
    });
    expect(saved).toHaveLength(1);
  });

  it("prevents a super admin from removing their own access", async () => {
    await expect(
      updateAdminUserAccess(
        makePrincipal(),
        "USR-SUP-001",
        {
          role: "super_admin",
          status: "inactive"
        },
        {
          users: {
            getById: () =>
              Promise.resolve({
                userId: "USR-SUP-001",
                fullName: "Root Admin",
                role: "super_admin",
                status: "active",
                createdAt: "2026-05-16T08:00:00.000Z",
                updatedAt: "2026-05-16T08:00:00.000Z",
                activatedAt: "2026-05-16T08:00:00.000Z"
              }),
            save: () => Promise.resolve(),
            list: () => Promise.resolve([])
          },
          now: () => "2026-05-16T18:00:00.000Z"
        }
      )
    ).rejects.toMatchObject({
      code: "FORBIDDEN"
    });
  });
});

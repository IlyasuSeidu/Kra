import { describe, expect, it } from "vitest";

import { listAdminAuditEvents } from "../audit";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

describe("audit services", () => {
  it("lists admin audit events with target filters", async () => {
    const response = await listAdminAuditEvents(
      {
        userId: "USR-ADM-001",
        role: "ops_admin",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      {
        targetType: "delivery",
        targetId: "DEL-9501"
      },
      {
        auditEvents: {
          listRecent() {
            return resolve([
              {
                eventId: "AUD-9501",
                requestId: "REQ-9501",
                action: "assign_driver",
                actorId: "USR-OPS-001",
                actorRole: "station_operator",
                occurredAt: "2026-05-16T15:05:00.000Z",
                stationId: "ST-ACC-01",
                targetType: "delivery",
                targetId: "DEL-9501",
                metadata: {
                  responseStatusCode: 200
                }
              }
            ]);
          },
          create() {
            return resolve(undefined);
          }
        }
      }
    );

    expect(response).toMatchObject({
      events: [
        {
          eventId: "AUD-9501",
          targetType: "delivery",
          targetId: "DEL-9501"
        }
      ]
    });
  });
});

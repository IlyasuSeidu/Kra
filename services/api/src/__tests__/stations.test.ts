import { describe, expect, it } from "vitest";

import { listConfiguredStations, updateStationStatus } from "../stations";

describe("station configuration", () => {
  it("lists all launch stations even when the repository is empty", async () => {
    const stations = await listConfiguredStations({
      stations: {
        getById: () => Promise.resolve(undefined),
        list: () => Promise.resolve([]),
        save: () => Promise.resolve()
      },
      now: () => "2026-05-16T18:00:00.000Z"
    });

    expect(stations.map((station) => station.stationId)).toEqual([
      "ST-ACC-01",
      "ST-KMS-01",
      "ST-TML-01"
    ]);
  });

  it("updates station operational status and service toggles", async () => {
    let saved: unknown;

    const response = await updateStationStatus(
      "ST-ACC-01",
      {
        operatingStatus: "paused",
        intakeStatus: "restricted",
        serviceAvailability: {
          standard: false,
          express: false,
          doorstep: false
        },
        note: "Temporary outage"
      },
      {
        stations: {
          getById: () => Promise.resolve(undefined),
          list: () => Promise.resolve([]),
          save: (station) => {
            saved = station;
            return Promise.resolve();
          }
        },
        now: () => "2026-05-16T18:10:00.000Z"
      }
    );

    expect(response).toMatchObject({
      stationId: "ST-ACC-01",
      operatingStatus: "paused",
      intakeStatus: "restricted"
    });
    expect(saved).toMatchObject({
      stationId: "ST-ACC-01",
      note: "Temporary outage"
    });
  });
});

import { describe, expect, it } from "vitest";

import { listConfiguredStations, updateStationStatus, updateStationValidation } from "../stations";

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
    expect(stations[0]?.validation).toMatchObject({
      status: "not_started",
      goLiveEligible: false,
      dryRunBusinessDaysCompleted: 0,
      controlledPilotBusinessDaysCompleted: 0
    });
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

  it("derives go-live readiness from station validation evidence", async () => {
    let saved: unknown;

    const response = await updateStationValidation(
      "ST-ACC-01",
      {
        dryRunBusinessDaysCompleted: 2,
        controlledPilotBusinessDaysCompleted: 3,
        checklist: {
          activeOperatorsCanSignIn: true,
          intakeDispatchReceiptAudited: true,
          scanOrManualFallbackTested: true,
          noUnresolvedP1Incidents: true,
          escalationAndRefundHandoffTested: true,
          openingHoursStorageAndHandoffConfirmed: true
        },
        scanFallbackSuccessRatePercent: 96,
        startedAt: "2026-05-11T07:00:00.000Z",
        completedAt: "2026-05-15T19:00:00.000Z"
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
        now: () => "2026-05-16T18:20:00.000Z"
      }
    );

    expect(response).toMatchObject({
      stationId: "ST-ACC-01",
      validation: {
        status: "ready",
        goLiveEligible: true,
        blockers: []
      }
    });
    expect(saved).toMatchObject({
      stationId: "ST-ACC-01",
      validation: {
        status: "ready",
        updatedAt: "2026-05-16T18:20:00.000Z"
      }
    });
  });

  it("keeps station validation blocked when readiness evidence is incomplete", async () => {
    const response = await updateStationValidation(
      "ST-ACC-01",
      {
        dryRunBusinessDaysCompleted: 1,
        controlledPilotBusinessDaysCompleted: 0,
        checklist: {
          activeOperatorsCanSignIn: true,
          intakeDispatchReceiptAudited: false,
          scanOrManualFallbackTested: true,
          noUnresolvedP1Incidents: false,
          escalationAndRefundHandoffTested: false,
          openingHoursStorageAndHandoffConfirmed: false
        },
        scanFallbackSuccessRatePercent: 92,
        manualBlockers: ["Generator backup not confirmed"]
      },
      {
        stations: {
          getById: () => Promise.resolve(undefined),
          list: () => Promise.resolve([]),
          save: () => Promise.resolve()
        },
        now: () => "2026-05-16T18:30:00.000Z"
      }
    );

    expect(response.validation).toMatchObject({
      status: "blocked",
      goLiveEligible: false
    });
    expect(response.validation.blockers).toEqual(
      expect.arrayContaining([
        "Complete 2 supervised dry-run business days.",
        "Complete 3 controlled pilot-volume business days.",
        "Station must have no unresolved P1 incident.",
        "Generator backup not confirmed"
      ])
    );
  });
});

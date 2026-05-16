import {
  adminUpdateStationStatusRequestSchema,
  adminUpdateStationStatusResponseSchema,
  stationCatalog,
  type StationId
} from "@kra/shared";
import type { z } from "zod";

export interface StationRecord {
  stationId: StationId;
  name: string;
  city: string;
  operatingStatus: "active" | "paused";
  intakeStatus: "open" | "restricted";
  serviceAvailability: {
    standard: boolean;
    express: boolean;
    doorstep: boolean;
  };
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StationRepository {
  getById(stationId: StationId): Promise<StationRecord | undefined>;
  list(): Promise<StationRecord[]>;
  save(station: StationRecord): Promise<void>;
}

export type AdminUpdateStationStatusResponse = z.infer<typeof adminUpdateStationStatusResponseSchema>;

export function buildDefaultStationRecord(stationId: StationId, now: string): StationRecord {
  const metadata = stationCatalog[stationId];

  return {
    stationId,
    name: metadata.name,
    city: metadata.city,
    operatingStatus: "active",
    intakeStatus: "open",
    serviceAvailability: {
      standard: true,
      express: true,
      doorstep: true
    },
    createdAt: now,
    updatedAt: now
  };
}

export async function listConfiguredStations(
  deps: {
    stations: StationRepository;
    now: () => string;
  }
): Promise<StationRecord[]> {
  const storedStations = await deps.stations.list();
  const storedMap = new Map(storedStations.map((station) => [station.stationId, station] as const));
  const generatedAt = deps.now();

  return (Object.keys(stationCatalog) as StationId[]).map(
    (stationId) => storedMap.get(stationId) ?? buildDefaultStationRecord(stationId, generatedAt)
  );
}

export async function updateStationStatus(
  stationId: StationId,
  input: z.infer<typeof adminUpdateStationStatusRequestSchema>,
  deps: {
    stations: StationRepository;
    now: () => string;
  }
): Promise<AdminUpdateStationStatusResponse> {
  const parsedInput = adminUpdateStationStatusRequestSchema.parse(input);
  const now = deps.now();
  const existing = await deps.stations.getById(stationId);
  const base = existing ?? buildDefaultStationRecord(stationId, now);

  const nextStation: StationRecord = {
    ...base,
    operatingStatus: parsedInput.operatingStatus,
    intakeStatus: parsedInput.intakeStatus,
    serviceAvailability: parsedInput.serviceAvailability,
    updatedAt: now,
    ...(parsedInput.note === undefined ? {} : { note: parsedInput.note })
  };

  if (parsedInput.note === undefined && "note" in nextStation) {
    delete nextStation.note;
  }

  await deps.stations.save(nextStation);

  return adminUpdateStationStatusResponseSchema.parse({
    stationId: nextStation.stationId,
    name: nextStation.name,
    city: nextStation.city,
    operatingStatus: nextStation.operatingStatus,
    intakeStatus: nextStation.intakeStatus,
    serviceAvailability: nextStation.serviceAvailability,
    ...(nextStation.note === undefined ? {} : { note: nextStation.note }),
    updatedAt: nextStation.updatedAt
  });
}

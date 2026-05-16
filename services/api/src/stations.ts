import {
  adminUpdateStationValidationRequestSchema,
  adminUpdateStationValidationResponseSchema,
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
  validation: StationValidationRecord;
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
export type AdminUpdateStationValidationResponse = z.infer<
  typeof adminUpdateStationValidationResponseSchema
>;
export type StationValidationRecord = z.infer<typeof adminUpdateStationValidationResponseSchema>["validation"];

const validationChecklistBlockerCopy: Record<
  keyof StationValidationRecord["checklist"],
  string
> = {
  activeOperatorsCanSignIn: "All active operators must sign in and perform assigned flows.",
  intakeDispatchReceiptAudited: "Intake, dispatch, and destination receipt must have audit logs.",
  scanOrManualFallbackTested: "Scan or manual fallback must be tested in practice.",
  noUnresolvedP1Incidents: "Station must have no unresolved P1 incident.",
  escalationAndRefundHandoffTested: "Issue escalation and refund handoff must be demonstrated.",
  openingHoursStorageAndHandoffConfirmed: "Opening hours, storage, and handoff ownership must be confirmed."
};

export function buildDefaultStationValidation(now: string): StationValidationRecord {
  return {
    status: "not_started",
    dryRunBusinessDaysCompleted: 0,
    controlledPilotBusinessDaysCompleted: 0,
    checklist: {
      activeOperatorsCanSignIn: false,
      intakeDispatchReceiptAudited: false,
      scanOrManualFallbackTested: false,
      noUnresolvedP1Incidents: false,
      escalationAndRefundHandoffTested: false,
      openingHoursStorageAndHandoffConfirmed: false
    },
    scanFallbackSuccessRatePercent: 0,
    goLiveEligible: false,
    blockers: [
      "Complete 2 supervised dry-run business days.",
      "Complete 3 controlled pilot-volume business days.",
      "All active operators must sign in and perform assigned flows.",
      "Intake, dispatch, and destination receipt must have audit logs.",
      "Scan or manual fallback must be tested in practice.",
      "Station must have no unresolved P1 incident.",
      "Issue escalation and refund handoff must be demonstrated.",
      "Opening hours, storage, and handoff ownership must be confirmed.",
      "Scan or manual fallback success must be at least 95%."
    ],
    updatedAt: now
  };
}

function deriveStationValidation(
  input: z.infer<typeof adminUpdateStationValidationRequestSchema>,
  updatedAt: string
): StationValidationRecord {
  const blockers: string[] = [];

  if (input.dryRunBusinessDaysCompleted < 2) {
    blockers.push("Complete 2 supervised dry-run business days.");
  }

  if (input.controlledPilotBusinessDaysCompleted < 3) {
    blockers.push("Complete 3 controlled pilot-volume business days.");
  }

  for (const [key, blocker] of Object.entries(validationChecklistBlockerCopy) as Array<
    [keyof StationValidationRecord["checklist"], string]
  >) {
    if (!input.checklist[key]) {
      blockers.push(blocker);
    }
  }

  if (input.scanFallbackSuccessRatePercent < 95) {
    blockers.push("Scan or manual fallback success must be at least 95%.");
  }

  blockers.push(...(input.manualBlockers ?? []));

  const goLiveEligible = blockers.length === 0;
  const hasValidationSignal =
    input.dryRunBusinessDaysCompleted > 0 ||
    input.controlledPilotBusinessDaysCompleted > 0 ||
    input.scanFallbackSuccessRatePercent > 0 ||
    Object.values(input.checklist).some(Boolean);
  const status =
    input.manualBlockers?.length || !input.checklist.noUnresolvedP1Incidents
      ? "blocked"
      : goLiveEligible
        ? "ready"
        : hasValidationSignal
          ? "in_progress"
          : "not_started";

  return {
    status,
    dryRunBusinessDaysCompleted: input.dryRunBusinessDaysCompleted,
    controlledPilotBusinessDaysCompleted: input.controlledPilotBusinessDaysCompleted,
    checklist: input.checklist,
    scanFallbackSuccessRatePercent: input.scanFallbackSuccessRatePercent,
    goLiveEligible,
    blockers,
    ...(input.startedAt === undefined ? {} : { startedAt: input.startedAt }),
    ...(input.completedAt === undefined ? {} : { completedAt: input.completedAt }),
    ...(input.note === undefined ? {} : { note: input.note }),
    updatedAt
  };
}

function ensureStationValidation(station: StationRecord, now: string): StationRecord {
  const partialStation = station as StationRecord & {
    validation?: StationValidationRecord;
  };

  if (partialStation.validation) {
    return station;
  }

  return {
    ...station,
    validation: buildDefaultStationValidation(now)
  };
}

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
    validation: buildDefaultStationValidation(now),
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
  const generatedAt = deps.now();
  const storedMap = new Map(
    storedStations.map((station) => [
      station.stationId,
      ensureStationValidation(station, generatedAt)
    ] as const)
  );

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
  const base = ensureStationValidation(existing ?? buildDefaultStationRecord(stationId, now), now);

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

export async function updateStationValidation(
  stationId: StationId,
  input: z.infer<typeof adminUpdateStationValidationRequestSchema>,
  deps: {
    stations: StationRepository;
    now: () => string;
  }
): Promise<AdminUpdateStationValidationResponse> {
  const parsedInput = adminUpdateStationValidationRequestSchema.parse(input);
  const now = deps.now();
  const existing = await deps.stations.getById(stationId);
  const base = ensureStationValidation(existing ?? buildDefaultStationRecord(stationId, now), now);
  const validation = deriveStationValidation(parsedInput, now);
  const nextStation: StationRecord = {
    ...base,
    validation,
    updatedAt: now
  };

  await deps.stations.save(nextStation);

  return adminUpdateStationValidationResponseSchema.parse({
    stationId: nextStation.stationId,
    name: nextStation.name,
    city: nextStation.city,
    validation: nextStation.validation
  });
}

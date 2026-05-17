import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  defaultPricingConfig,
  getRoutePricingKey,
  stationCatalog
} from "@kra/shared";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const dryRun = args.has("--dry-run") || !apply;
const force = args.has("--force");

if (apply && args.has("--dry-run")) {
  console.error("Use either --apply or --dry-run, not both.");
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function optionalEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function nowIso() {
  return process.env.KRA_BOOTSTRAP_NOW?.trim() || new Date().toISOString();
}

function buildDefaultStationValidation(now) {
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

function buildStationRecords(now) {
  return Object.entries(stationCatalog).map(([stationId, metadata]) => ({
    path: `stations/${stationId}`,
    value: {
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
    }
  }));
}

function buildRouteBaseFees() {
  return Object.entries(defaultPricingConfig.routeBaseFees)
    .map(([routeKey, baseFeeGhs]) => {
      const [originStationId, destinationStationId] = routeKey.split(":");
      return {
        originStationId,
        destinationStationId,
        baseFeeGhs
      };
    })
    .sort((left, right) =>
      getRoutePricingKey(left.originStationId, left.destinationStationId).localeCompare(
        getRoutePricingKey(right.originStationId, right.destinationStationId)
      )
    );
}

function buildPricingRecords(now) {
  const activePricingRule = {
    pricingRuleId: "PRC-DEFAULT",
    status: "active",
    currency: "GHS",
    routeBaseFees: buildRouteBaseFees(),
    effectiveAt: now,
    updatedAt: now,
    updatedByUserId: "USR-SYSTEM",
    note: "Default launch corridor pricing"
  };

  return [
    {
      path: "pricing_rules/active",
      value: activePricingRule
    },
    {
      path: "pricing_rules/PRC-DEFAULT",
      value: activePricingRule
    }
  ];
}

function buildOptionalSuperAdmin(now) {
  const userId = optionalEnv("KRA_BOOTSTRAP_SUPER_ADMIN_USER_ID");
  if (!userId) {
    return [];
  }

  return [
    {
      path: `users/${userId}`,
      value: {
        userId,
        fullName: requireEnv("KRA_BOOTSTRAP_SUPER_ADMIN_FULL_NAME"),
        role: "super_admin",
        status: "active",
        ...(optionalEnv("KRA_BOOTSTRAP_SUPER_ADMIN_EMAIL") === undefined
          ? {}
          : { email: optionalEnv("KRA_BOOTSTRAP_SUPER_ADMIN_EMAIL") }),
        ...(optionalEnv("KRA_BOOTSTRAP_SUPER_ADMIN_PHONE") === undefined
          ? {}
          : { phone: optionalEnv("KRA_BOOTSTRAP_SUPER_ADMIN_PHONE") }),
        createdAt: now,
        updatedAt: now,
        activatedAt: now
      }
    }
  ];
}

function buildFirebaseCredential() {
  const clientEmail = optionalEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = optionalEnv("FIREBASE_PRIVATE_KEY");

  if (clientEmail || privateKey) {
    if (!clientEmail || !privateKey) {
      throw new Error("FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set together.");
    }

    return cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n")
    });
  }

  return applicationDefault();
}

function getFirestoreClient() {
  const existingApp = getApps()[0];
  const app =
    existingApp ??
    initializeApp({
      credential: buildFirebaseCredential(),
      projectId: requireEnv("FIREBASE_PROJECT_ID")
    });

  return getFirestore(app);
}

async function writeRecords(records) {
  const firestore = getFirestoreClient();
  const batch = firestore.batch();
  const skipped = [];
  const written = [];

  for (const record of records) {
    const reference = firestore.doc(record.path);
    const snapshot = await reference.get();

    if (snapshot.exists && !force) {
      skipped.push(record.path);
      continue;
    }

    batch.set(reference, record.value);
    written.push(record.path);
  }

  if (written.length > 0) {
    await batch.commit();
  }

  return {
    written,
    skipped
  };
}

const generatedAt = nowIso();
const records = [
  ...buildStationRecords(generatedAt),
  ...buildPricingRecords(generatedAt),
  ...buildOptionalSuperAdmin(generatedAt)
];

const summary = {
  mode: dryRun ? "dry-run" : "apply",
  force,
  generatedAt,
  recordCount: records.length,
  recordPaths: records.map((record) => record.path)
};

if (dryRun) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const result = await writeRecords(records);
console.log(
  JSON.stringify(
    {
      ...summary,
      written: result.written,
      skipped: result.skipped
    },
    null,
    2
  )
);

import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function requireEqual(name, actual, expected) {
  if (actual !== expected) {
    failures.push(`${name} expected ${JSON.stringify(expected)} but found ${JSON.stringify(actual)}`);
  }
}

function requireSnippet(name, source, snippet) {
  if (!source.includes(snippet)) {
    failures.push(`Missing security rules snippet: ${name}`);
  }
}

function requireRegex(name, source, regex) {
  if (!regex.test(source)) {
    failures.push(`Missing security rules pattern: ${name}`);
  }
}

function requireIndex(indexes, collectionGroup, fields) {
  const hasIndex = indexes.some((index) => {
    if (index.collectionGroup !== collectionGroup) {
      return false;
    }

    return JSON.stringify(index.fields) === JSON.stringify(fields);
  });

  if (!hasIndex) {
    failures.push(
      `Missing Firestore index ${collectionGroup}: ${fields
        .map((field) => `${field.fieldPath}:${field.order}`)
        .join(", ")}`
    );
  }
}

const firebaseConfig = readJson("firebase.json");
const firestoreRules = readText("firestore.rules");
const storageRules = readText("storage.rules");
const firestoreIndexes = readJson("firestore.indexes.json");

requireEqual("firebase.firestore.rules", firebaseConfig.firestore?.rules, "firestore.rules");
requireEqual("firebase.firestore.indexes", firebaseConfig.firestore?.indexes, "firestore.indexes.json");
requireEqual("firebase.storage.rules", firebaseConfig.storage?.rules, "storage.rules");

requireSnippet("Firestore rules version", firestoreRules, "rules_version = '2';");
requireSnippet("Firestore default deny", firestoreRules, "match /{document=**} {\n      allow read, write: if false;");
requireSnippet("deliveries direct writes denied", firestoreRules, "match /deliveries/{deliveryId} {\n      allow read: if isAuthenticated() && canReadDelivery(resource.data);\n      allow create, update, delete: if false;");
requireSnippet("delivery events writes denied", firestoreRules, "match /events/{eventId} {\n        allow read: if isAuthenticated() && canReadDelivery(get(/databases/$(database)/documents/deliveries/$(deliveryId)).data);\n        allow create, update, delete: if false;");
requireSnippet("payments writes denied", firestoreRules, "match /payments/{paymentId} {\n      allow read: if isAuthenticated() && (");
requireSnippet("pricing rules writes denied", firestoreRules, "match /pricing_rules/{pricingRuleId} {\n      allow read: if isAuthenticated() && isFinanceAdmin();\n      allow create, update, delete: if false;");
requireSnippet("proof assets direct access denied", firestoreRules, "match /proof_assets/{proofAssetId} {\n      allow read, write: if false;");
requireSnippet("outbound notifications direct access denied", firestoreRules, "match /outbound_notifications/{outboundNotificationId} {\n      allow read, write: if false;");
requireSnippet("idempotency records direct access denied", firestoreRules, "match /idempotency_records/{recordId} {\n      allow read, write: if false;");
requireSnippet("audit event writes denied", firestoreRules, "match /audit_events/{eventId} {\n      allow read: if isAuthenticated() && isAdmin();\n      allow create, update, delete: if false;");
requireSnippet("public tracking challenges direct access denied", firestoreRules, "match /public_tracking_phone_challenges/{challengeId} {\n      allow read, write: if false;");
requireSnippet("public tracking verification attempts direct access denied", firestoreRules, "match /public_tracking_verification_failed_attempts/{attemptId} {\n      allow read, write: if false;");
requireSnippet("public tracking verification grants direct access denied", firestoreRules, "match /public_tracking_verification_grants/{verificationId} {\n      allow read, write: if false;");
requireRegex(
  "delivery read scoped by sender, assignment, station, or admin",
  firestoreRules,
  /function canReadDelivery\(delivery\) \{[\s\S]*delivery\.senderId == normalizedUserId\(\)[\s\S]*assignedDriverId == normalizedUserId\(\)[\s\S]*assignedFinalMileCourierId == normalizedUserId\(\)[\s\S]*originStationId == stationId\(\)[\s\S]*destinationStationId == stationId\(\)[\s\S]*isAdmin\(\);[\s\S]*\}/
);
requireRegex(
  "payment reads scoped to delivery access or finance admin",
  firestoreRules,
  /match \/payments\/\{paymentId\} \{[\s\S]*canReadDelivery\(get\(\/databases\/\$\(database\)\/documents\/deliveries\/\$\(resource\.data\.deliveryId\)\)\.data\)[\s\S]*isFinanceAdmin\(\)[\s\S]*allow create, update, delete: if false;/
);

requireSnippet("Storage rules version", storageRules, "rules_version = '2';");
requireRegex(
  "Storage direct access denied",
  storageRules,
  /match \/\{[A-Za-z]+=\*\*\} \{\n      allow read, write: if false;/
);

requireIndex(firestoreIndexes.indexes, "payments", [
  { fieldPath: "status", order: "ASCENDING" },
  { fieldPath: "nextReconciliationAt", order: "ASCENDING" }
]);
requireIndex(firestoreIndexes.indexes, "payments", [
  { fieldPath: "status", order: "ASCENDING" },
  { fieldPath: "reconciliationReviewRequiredAt", order: "DESCENDING" }
]);
requireIndex(firestoreIndexes.indexes, "outbound_notifications", [
  { fieldPath: "status", order: "ASCENDING" },
  { fieldPath: "nextAttemptAt", order: "ASCENDING" }
]);
requireIndex(firestoreIndexes.indexes, "deliveries", [
  { fieldPath: "originStationId", order: "ASCENDING" },
  { fieldPath: "currentStatus", order: "ASCENDING" }
]);
requireIndex(firestoreIndexes.indexes, "deliveries", [
  { fieldPath: "destinationStationId", order: "ASCENDING" },
  { fieldPath: "currentStatus", order: "ASCENDING" }
]);
requireIndex(firestoreIndexes.indexes, "support_issues", [
  { fieldPath: "status", order: "ASCENDING" },
  { fieldPath: "severity", order: "ASCENDING" },
  { fieldPath: "createdAt", order: "DESCENDING" }
]);

if (failures.length > 0) {
  console.error("Security rules enforcement failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Security rules enforcement passed.");

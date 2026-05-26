import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), "utf8");

const inventory = read("docs/05-design/frontend-screen-inventory.md");
const screenList = read("docs/05-design/screen-list.md");
const navigationMap = read("docs/05-design/navigation-map.md");
const gapInventory = read("docs/13-project/frontend-gap-inventory.md");
const webMetadata = read("apps/web/src/index.ts");
const mobileMetadata = read("apps/mobile/src/index.ts");
const adminMetadata = read("apps/admin/src/index.ts");

const specRoot = join(root, "docs/05-design/frontend-screen-specs");
const specFiles = readdirSync(specRoot, { recursive: true })
  .filter((file) => String(file).endsWith(".md"))
  .map((file) => join(specRoot, file));
const specs = specFiles.map((file) => readFileSync(file, "utf8")).join("\n");

const routeMap = inventory.match(
  /## Exact Route Map\n([\s\S]*?)(?=\n## Field Requirements By Flow)/
)?.[1];

if (!routeMap) {
  throw new Error("Could not locate Exact Route Map in frontend inventory.");
}

const routeSections = new Map(
  [...routeMap.matchAll(/### ([^\n]+)\n([\s\S]*?)(?=\n### |$)/g)].map(([, name, body]) => [
    name,
    [...body.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`/gm)].map(([, id, route]) => ({
      id,
      route
    }))
  ])
);

const idsFor = (section) => {
  const rows = routeSections.get(section);
  if (!rows) {
    throw new Error(`Missing route section: ${section}`);
  }
  return rows.map(({ id }) => id);
};

const routesFor = (section) => {
  const rows = routeSections.get(section);
  if (!rows) {
    throw new Error(`Missing route section: ${section}`);
  }
  return rows;
};

const publicIds = idsFor("Public Web Routes");
const receiverIds = idsFor("Receiver Public Routes");
const senderIds = idsFor("Sender Mobile Routes");
const operationsIds = idsFor("Operations Shared Routes");
const stationIds = idsFor("Station Operator Routes");
const driverIds = idsFor("Driver Routes");
const courierIds = idsFor("Final-Mile Courier Routes");
const adminIds = idsFor("Admin Web Routes");
const authIds = idsFor("Auth And Utility Routes");

const routedIds = [
  ...publicIds,
  ...receiverIds,
  ...senderIds,
  ...operationsIds,
  ...stationIds,
  ...driverIds,
  ...courierIds,
  ...adminIds,
  ...authIds
];

const uniqueRoutedIds = new Set(routedIds);
const failures = [];

if (uniqueRoutedIds.size !== routedIds.length) {
  failures.push("Route map contains duplicate screen IDs.");
}

for (const id of routedIds) {
  if (!specs.includes(`\`${id}\``)) {
    failures.push(`Missing frontend screen spec for ${id}.`);
  }
  if (!screenList.includes(`\`${id}\``)) {
    failures.push(`Missing compact screen-list route name for ${id}.`);
  }
}

for (const { route } of routesFor("Public Web Routes")) {
  if (!webMetadata.includes(`route: "${route}"`)) {
    failures.push(`Missing public web route metadata for ${route}.`);
  }
}

for (const { route } of routesFor("Receiver Public Routes")) {
  if (!webMetadata.includes(`route: "${route}"`)) {
    failures.push(`Missing receiver public route metadata for ${route}.`);
  }
}

for (const id of [...publicIds, ...receiverIds]) {
  if (!webMetadata.includes(`"${id}"`)) {
    failures.push(`Missing web lifecycle group metadata for ${id}.`);
  }
}

for (const id of [
  ...senderIds,
  ...operationsIds,
  ...stationIds,
  ...driverIds,
  ...courierIds,
  ...authIds
]) {
  if (!mobileMetadata.includes(`"${id}"`)) {
    failures.push(`Missing mobile metadata for ${id}.`);
  }
}

for (const id of adminIds) {
  if (!adminMetadata.includes(`"${id}"`)) {
    failures.push(`Missing admin metadata for ${id}.`);
  }
}

const requiredDomainLabels = [
  "Auth/account access",
  "Sender booking lifecycle",
  "Station operations",
  "Driver lifecycle",
  "Final-mile courier lifecycle",
  "Issues/support/disputes",
  "Notifications",
  "Admin operations",
  "Offline/recovery",
  "Public web"
];

for (const label of requiredDomainLabels) {
  if (!navigationMap.includes(label) && !gapInventory.includes(label)) {
    failures.push(`Missing lifecycle domain label: ${label}.`);
  }
}

for (const phrase of [
  "FE-GAP-009",
  "Lifecycle Domain Enforcement Status",
  "mobileDomainLifecycleGroups",
  "adminDomainLifecycleGroups",
  "webDomainLifecycleGroups"
]) {
  if (
    !gapInventory.includes(phrase) &&
    !mobileMetadata.includes(phrase) &&
    !adminMetadata.includes(phrase) &&
    !webMetadata.includes(phrase)
  ) {
    failures.push(`Missing enforcement marker: ${phrase}.`);
  }
}

if (failures.length > 0) {
  console.error("Frontend domain metadata enforcement failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Frontend domain metadata enforcement passed for ${routedIds.length} routed screens across 10 lifecycle domains.`
);

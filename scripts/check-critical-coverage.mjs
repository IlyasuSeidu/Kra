import { readFileSync } from "node:fs";
import path from "node:path";

const summaryPath = path.join(
  process.cwd(),
  "packages",
  "shared",
  "coverage",
  "coverage-summary.json"
);

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));

const criticalFiles = [
  "src/domain/auth-policy.ts",
  "src/domain/permissions.ts",
  "src/domain/pricing.ts",
  "src/domain/refunds.ts",
  "src/domain/state-machine.ts"
];

const minimums = {
  lines: 100,
  statements: 100,
  functions: 100,
  branches: 100
};

const rootPath = path.join(process.cwd(), "packages", "shared");
const failures = [];

for (const relativeFile of criticalFiles) {
  const absoluteFile = path.join(rootPath, relativeFile);
  const fileCoverage = summary[absoluteFile];

  if (!fileCoverage) {
    failures.push(`Missing coverage entry for ${relativeFile}`);
    continue;
  }

  for (const [metric, minimum] of Object.entries(minimums)) {
    const actual = fileCoverage[metric].pct;
    if (actual < minimum) {
      failures.push(
        `${relativeFile} has ${metric} coverage ${actual}% but requires ${minimum}%`
      );
    }
  }
}

const totalLines = summary.total.lines.pct;
if (totalLines < 90) {
  failures.push(`Overall lines coverage is ${totalLines}% but requires at least 90%`);
}

if (failures.length > 0) {
  console.error("Critical coverage enforcement failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Critical coverage enforcement passed.");


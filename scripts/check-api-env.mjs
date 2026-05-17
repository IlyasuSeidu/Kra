import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const allowedTargets = new Set(["ci", "staging", "production"]);
const placeholderPattern = /^(changeme|change-me|replace-me|todo|tbd|dummy|example|secret)$/i;

function getArgValue(name) {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return value?.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function parseEnvFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Environment file was not found: ${absolutePath}`);
  }

  const source = readFileSync(absolutePath, "utf8");
  const values = {};

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    values[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return values;
}

const target = getArgValue("--target") ?? process.env.KRA_DEPLOYMENT_TARGET ?? "ci";
if (!allowedTargets.has(target)) {
  console.error(`Unsupported target ${JSON.stringify(target)}. Use ci, staging, or production.`);
  process.exit(1);
}

const envFile = getArgValue("--env-path");
let env;

try {
  env = {
    ...process.env,
    ...(envFile === undefined ? {} : parseEnvFile(envFile))
  };
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const failures = [];
const warnings = [];

function requireVar(name, options = {}) {
  const value = env[name]?.trim();

  if (!value) {
    failures.push(`${name} is required for ${target}.`);
    return;
  }

  if (placeholderPattern.test(value)) {
    failures.push(`${name} is still a placeholder value.`);
  }

  if (options.minLength && value.length < options.minLength) {
    failures.push(`${name} must be at least ${options.minLength} characters.`);
  }

  if (options.url) {
    try {
      const parsed = new URL(value);
      if (target === "production" && parsed.protocol !== "https:") {
        failures.push(`${name} must use HTTPS in production.`);
      }
      if (target === "production" && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
        failures.push(`${name} cannot point to localhost in production.`);
      }
    } catch {
      failures.push(`${name} must be a valid URL.`);
    }
  }
}

function requirePaired(left, right) {
  const hasLeft = Boolean(env[left]?.trim());
  const hasRight = Boolean(env[right]?.trim());

  if (hasLeft !== hasRight) {
    failures.push(`${left} and ${right} must either both be set or both be omitted.`);
  }
}

function warnIfMissing(name, reason) {
  if (!env[name]?.trim()) {
    warnings.push(`${name} is not set. ${reason}`);
  }
}

if (target !== "ci") {
  requireVar("FIREBASE_PROJECT_ID");
  requireVar("FIREBASE_STORAGE_BUCKET");
  requireVar("INTERNAL_TASK_SHARED_SECRET", { minLength: 24 });
  requireVar("PUBLIC_TRACKING_BASE_URL", { url: true });

  requirePaired("FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY");

  requireVar("MTN_MOMO_BASE_URL", { url: true });
  requireVar("MTN_MOMO_COLLECTION_PRIMARY_KEY", { minLength: 8 });
  requireVar("MTN_MOMO_API_USER", { minLength: 8 });
  requireVar("MTN_MOMO_API_KEY", { minLength: 8 });
  requireVar("MTN_MOMO_WEBHOOK_SHARED_SECRET", { minLength: 16 });
  requireVar("MTN_MOMO_TARGET_ENV");

  requireVar("HUBTEL_SMS_BASE_URL", { url: true });
  requireVar("HUBTEL_SMS_CLIENT_ID", { minLength: 8 });
  requireVar("HUBTEL_SMS_CLIENT_SECRET", { minLength: 8 });
  requireVar("HUBTEL_SMS_FROM");

  warnIfMissing("SENTRY_DSN", "Production observability should include error reporting.");

  if (target === "production" && env.MTN_MOMO_TARGET_ENV === "sandbox") {
    failures.push("MTN_MOMO_TARGET_ENV cannot be sandbox for production.");
  }
}

if (target === "ci") {
  if (!hasFlag("--quiet")) {
    console.log("API environment deployment gate is configured for staging and production targets.");
    console.log("Run with --target=staging or --target=production before deploying.");
  }
} else {
  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("API environment validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`API environment validation passed for ${target}.`);

export const apiModules = [
  "auth",
  "deliveries",
  "handoffs",
  "payments",
  "notifications",
  "issues",
  "admin"
] as const;

export const apiHealthContract = {
  service: "api",
  readinessChecks: ["firestore", "storage", "task-queue"],
  livenessChecks: ["process", "configuration"]
};

export * from "./deliveries";
export * from "./payment-webhooks";
export * from "./payments";
export * from "./public-tracking";
export * from "./routes";
export * from "./service-errors";

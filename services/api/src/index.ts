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

export * from "./admin";
export * from "./config";
export * from "./deliveries";
export * from "./firestore/client";
export * from "./firestore/repositories";
export * from "./firestore/schema";
export * from "./handoffs";
export * from "./payment-webhooks";
export * from "./payments";
export * from "./public-tracking";
export * from "./public-tracking-verification";
export * from "./refunds";
export * from "./routes";
export * from "./service-errors";

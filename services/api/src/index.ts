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


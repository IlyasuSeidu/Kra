import { describe, expect, it } from "vitest";

import { apiHealthContract, apiModules } from "../index";

describe("api index", () => {
  it("exposes the expected module list and health contract", () => {
    expect(apiModules).toEqual([
      "auth",
      "deliveries",
      "handoffs",
      "payments",
      "notifications",
      "issues",
      "admin"
    ]);

    expect(apiHealthContract).toEqual({
      service: "api",
      readinessChecks: ["firestore", "storage", "task-queue"],
      livenessChecks: ["process", "configuration"]
    });
  });
});

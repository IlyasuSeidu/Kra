import { describe, expect, it } from "vitest";

import { canPerform, getCapabilities } from "../domain/permissions";

describe("permissions", () => {
  it("allows senders to create and cancel eligible deliveries", () => {
    expect(canPerform("sender", "create_delivery")).toBe(true);
    expect(canPerform("sender", "cancel_eligible_delivery")).toBe(true);
  });

  it("does not allow senders to perform operational tasks", () => {
    expect(canPerform("sender", "assign_driver")).toBe(false);
    expect(canPerform("sender", "approve_refund")).toBe(false);
  });

  it("allows station operators to manage station workflow", () => {
    expect(canPerform("station_operator", "confirm_intake")).toBe(true);
    expect(canPerform("station_operator", "assign_driver")).toBe(true);
    expect(canPerform("station_operator", "assign_final_mile")).toBe(true);
    expect(canPerform("station_operator", "cancel_eligible_delivery")).toBe(true);
  });

  it("allows finance admins to execute finance actions only", () => {
    expect(canPerform("finance_admin", "approve_refund")).toBe(true);
    expect(canPerform("finance_admin", "execute_refund")).toBe(true);
    expect(canPerform("finance_admin", "confirm_dispatch")).toBe(false);
  });

  it("gives super admins all privileged governance capabilities", () => {
    expect(getCapabilities("super_admin")).toContain("manage_users_and_roles");
    expect(getCapabilities("super_admin")).toContain("approve_refund");
    expect(getCapabilities("super_admin")).toContain("reassign_delivery");
    expect(getCapabilities("super_admin")).toContain("cancel_eligible_delivery");
  });
});

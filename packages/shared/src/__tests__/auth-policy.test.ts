import { describe, expect, it } from "vitest";

import {
  getAuthMethod,
  getSessionTtlHours,
  shouldLockAccount
} from "../domain/auth-policy";

describe("auth-policy", () => {
  it("uses phone otp for senders", () => {
    expect(getAuthMethod("sender")).toBe("phone_otp");
  });

  it("uses phone pin for operational mobile staff", () => {
    expect(getAuthMethod("driver")).toBe("phone_pin");
    expect(getAuthMethod("station_operator")).toBe("phone_pin");
    expect(getAuthMethod("final_mile_courier")).toBe("phone_pin");
  });

  it("uses email and password plus mfa for admin roles", () => {
    expect(getAuthMethod("ops_admin")).toBe("email_password_mfa");
    expect(getAuthMethod("finance_admin")).toBe("email_password_mfa");
    expect(getAuthMethod("support_admin")).toBe("email_password_mfa");
    expect(getAuthMethod("super_admin")).toBe("email_password_mfa");
  });

  it("returns documented session lengths", () => {
    expect(getSessionTtlHours("sender")).toBe(720);
    expect(getSessionTtlHours("driver")).toBe(12);
    expect(getSessionTtlHours("super_admin")).toBe(8);
  });

  it("locks after five failures within fifteen minutes", () => {
    expect(shouldLockAccount(5, 15)).toBe(true);
    expect(shouldLockAccount(6, 10)).toBe(true);
  });

  it("does not lock outside the threshold", () => {
    expect(shouldLockAccount(4, 15)).toBe(false);
    expect(shouldLockAccount(5, 16)).toBe(false);
  });
});


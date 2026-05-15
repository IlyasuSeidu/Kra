export type StaffRole =
  | "driver"
  | "station_operator"
  | "final_mile_courier"
  | "ops_admin"
  | "finance_admin"
  | "support_admin"
  | "super_admin";

export type AuthRole = "sender" | StaffRole;
export type AuthMethod = "phone_otp" | "phone_pin" | "email_password_mfa";

const authMethodByRole: Record<AuthRole, AuthMethod> = {
  sender: "phone_otp",
  driver: "phone_pin",
  station_operator: "phone_pin",
  final_mile_courier: "phone_pin",
  ops_admin: "email_password_mfa",
  finance_admin: "email_password_mfa",
  support_admin: "email_password_mfa",
  super_admin: "email_password_mfa"
};

const sessionHoursByRole: Record<AuthRole, number> = {
  sender: 24 * 30,
  driver: 12,
  station_operator: 12,
  final_mile_courier: 12,
  ops_admin: 8,
  finance_admin: 8,
  support_admin: 8,
  super_admin: 8
};

export function getAuthMethod(role: AuthRole): AuthMethod {
  return authMethodByRole[role];
}

export function getSessionTtlHours(role: AuthRole): number {
  return sessionHoursByRole[role];
}

export function shouldLockAccount(
  failedAttempts: number,
  minutesWindow: number
): boolean {
  return failedAttempts >= 5 && minutesWindow <= 15;
}


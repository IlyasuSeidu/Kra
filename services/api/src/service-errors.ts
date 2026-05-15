export class ApiServiceError extends Error {
  readonly code:
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "ROUTE_NOT_ENABLED"
    | "PAYMENT_REQUIRED"
    | "INVALID_STATUS_TRANSITION"
    | "PHONE_VERIFICATION_REQUIRED"
    | "RATE_LIMITED"
    | "INTERNAL_ERROR";

  readonly details: Record<string, unknown>;

  constructor(
    code: ApiServiceError["code"],
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ApiServiceError";
    this.code = code;
    this.details = details;
  }
}

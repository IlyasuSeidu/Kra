import { describe, expect, it } from "vitest";

import {
  auditEventDocumentPath,
  deliveryDocumentPath,
  deliveryEventDocumentPath,
  firestoreCollections,
  handoffEventDocumentPath,
  notificationDocumentPath,
  paymentDocumentPath,
  publicTrackingPhoneChallengeDocumentPath,
  publicTrackingVerificationAttemptDocumentPath,
  publicTrackingVerificationGrantDocumentPath,
  stationDocumentPath,
  supportIssueDocumentPath,
  userDocumentPath,
  webhookEventDocumentPath
} from "../firestore/schema";

describe("firestore schema helpers", () => {
  it("defines the canonical collection names", () => {
    expect(firestoreCollections).toEqual({
      users: "users",
      stations: "stations",
      notifications: "notifications",
      deliveries: "deliveries",
      deliveryEvents: "events",
      payments: "payments",
      handoffEvents: "handoff_events",
      webhookEvents: "provider_webhook_events",
      supportIssues: "support_issues",
      publicTrackingPhoneChallenges: "public_tracking_phone_challenges",
      publicTrackingVerificationAttempts: "public_tracking_verification_failed_attempts",
      publicTrackingVerificationGrants: "public_tracking_verification_grants",
      idempotencyRecords: "idempotency_records",
      auditEvents: "audit_events"
    });
  });

  it("builds stable document paths for the main operational collections", () => {
    expect(userDocumentPath("USR-1001")).toBe("users/USR-1001");
    expect(stationDocumentPath("ST-ACC-01")).toBe("stations/ST-ACC-01");
    expect(notificationDocumentPath("NTF-1001")).toBe("notifications/NTF-1001");
    expect(deliveryDocumentPath("DEL-1001")).toBe("deliveries/DEL-1001");
    expect(deliveryEventDocumentPath("DEL-1001", "EVT-DEL-1001")).toBe(
      "deliveries/DEL-1001/events/EVT-DEL-1001"
    );
    expect(paymentDocumentPath("PAY-1001")).toBe("payments/PAY-1001");
    expect(handoffEventDocumentPath("EVT-HO-1001")).toBe("handoff_events/EVT-HO-1001");
    expect(webhookEventDocumentPath("EVT-WEB-1001")).toBe(
      "provider_webhook_events/EVT-WEB-1001"
    );
    expect(supportIssueDocumentPath("ISS-1001")).toBe("support_issues/ISS-1001");
    expect(publicTrackingPhoneChallengeDocumentPath("CHL-1001")).toBe(
      "public_tracking_phone_challenges/CHL-1001"
    );
    expect(publicTrackingVerificationAttemptDocumentPath("ATT-1001")).toBe(
      "public_tracking_verification_failed_attempts/ATT-1001"
    );
    expect(publicTrackingVerificationGrantDocumentPath("PVT-1001")).toBe(
      "public_tracking_verification_grants/PVT-1001"
    );
    expect(auditEventDocumentPath("AUD-1001")).toBe("audit_events/AUD-1001");
  });
});

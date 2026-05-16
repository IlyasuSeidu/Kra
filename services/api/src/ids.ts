import { randomBytes, randomUUID } from "node:crypto";

function compactUuid(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}

function buildPrefixedId(prefix: string): string {
  return `${prefix}-${compactUuid()}`;
}

export function createApiIdentityFactory() {
  return {
    nextRequestId() {
      return buildPrefixedId("REQ");
    },
    nextDeliveryId() {
      return buildPrefixedId("DEL");
    },
    nextTrackingCode() {
      return buildPrefixedId("KRA");
    },
    nextPaymentId() {
      return buildPrefixedId("PAY");
    },
    nextWebhookEventId() {
      return buildPrefixedId("EVT-WEB");
    },
    nextIssueId() {
      return buildPrefixedId("ISS");
    },
    nextDeliveryEventId() {
      return buildPrefixedId("EVT-DEL");
    },
    nextHandoffEventId() {
      return buildPrefixedId("EVT-HOF");
    },
    nextAttemptId() {
      return buildPrefixedId("ATT");
    },
    nextVerificationId() {
      return buildPrefixedId("VRF");
    },
    nextVerificationToken() {
      return randomBytes(24).toString("base64url");
    }
  };
}

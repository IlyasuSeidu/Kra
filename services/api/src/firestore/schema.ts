import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from "firebase-admin/firestore";

import type { DeliveryRecord } from "../deliveries";
import type { DeliveryEventRecord, HandoffEventRecord } from "../handoffs";
import type { IdempotencyRecord } from "../idempotency";
import type { SupportIssueRecord } from "../issues";
import type { WebhookEventRecord } from "../payment-webhooks";
import type { PaymentRecord } from "../payments";
import type { PackageLabelRecord } from "../package-labels";
import type { PricingRuleRecord } from "../pricing-rules";
import type { ProofAssetRecord } from "../proof-assets";
import type { NotificationRecord } from "../notification-feed";
import type { OutboundNotificationRecord } from "../outbound-notifications";
import type { AuditEventRecord } from "../audit";
import type { StationRecord } from "../stations";
import type {
  PublicTrackingPhoneChallengeRecord,
  PublicTrackingVerificationFailedAttemptRecord,
  PublicTrackingVerificationGrantRecord
} from "../public-tracking-verification";
import type { UserRecord } from "../users";

export const firestoreCollections = {
  users: "users",
  stations: "stations",
  notifications: "notifications",
  outboundNotifications: "outbound_notifications",
  deliveries: "deliveries",
  deliveryEvents: "events",
  payments: "payments",
  pricingRules: "pricing_rules",
  proofAssets: "proof_assets",
  packageLabels: "package_labels",
  handoffEvents: "handoff_events",
  webhookEvents: "provider_webhook_events",
  supportIssues: "support_issues",
  publicTrackingPhoneChallenges: "public_tracking_phone_challenges",
  publicTrackingVerificationAttempts: "public_tracking_verification_failed_attempts",
  publicTrackingVerificationGrants: "public_tracking_verification_grants",
  idempotencyRecords: "idempotency_records",
  auditEvents: "audit_events"
} as const;

export type UserDocument = UserRecord;
export type StationDocument = StationRecord;
export type NotificationDocument = NotificationRecord;
export type OutboundNotificationDocument = OutboundNotificationRecord;
export interface DeliveryDocument extends DeliveryRecord {
  updatedAt: string;
}

export interface PaymentDocument extends PaymentRecord {
  updatedAt: string;
  refundAmountGhs?: number;
  refundReason?: string;
  refundRequestedAt?: string;
}

export type ProofAssetDocument = ProofAssetRecord;
export type PackageLabelDocument = PackageLabelRecord;
export type PricingRuleDocument = PricingRuleRecord;
export type DeliveryEventDocument = DeliveryEventRecord;
export type HandoffEventDocument = HandoffEventRecord;
export type WebhookEventDocument = WebhookEventRecord;
export type SupportIssueDocument = SupportIssueRecord;
export type PublicTrackingPhoneChallengeDocument = PublicTrackingPhoneChallengeRecord;
export type PublicTrackingVerificationAttemptDocument =
  PublicTrackingVerificationFailedAttemptRecord;
export type PublicTrackingVerificationGrantDocument = PublicTrackingVerificationGrantRecord;
export type IdempotencyRecordDocument = IdempotencyRecord;
export type AuditEventDocument = AuditEventRecord;

function createPassThroughConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(value: T): DocumentData {
      return value;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return snapshot.data() as T;
    }
  };
}

export const userConverter = createPassThroughConverter<UserDocument>();
export const stationConverter = createPassThroughConverter<StationDocument>();
export const notificationConverter = createPassThroughConverter<NotificationDocument>();
export const outboundNotificationConverter =
  createPassThroughConverter<OutboundNotificationDocument>();
export const deliveryConverter = createPassThroughConverter<DeliveryDocument>();
export const paymentConverter = createPassThroughConverter<PaymentDocument>();
export const pricingRuleConverter = createPassThroughConverter<PricingRuleDocument>();
export const proofAssetConverter = createPassThroughConverter<ProofAssetDocument>();
export const packageLabelConverter = createPassThroughConverter<PackageLabelDocument>();
export const deliveryEventConverter = createPassThroughConverter<DeliveryEventDocument>();
export const handoffEventConverter = createPassThroughConverter<HandoffEventDocument>();
export const webhookEventConverter = createPassThroughConverter<WebhookEventDocument>();
export const supportIssueConverter = createPassThroughConverter<SupportIssueDocument>();
export const publicTrackingPhoneChallengeConverter =
  createPassThroughConverter<PublicTrackingPhoneChallengeDocument>();
export const publicTrackingVerificationAttemptConverter =
  createPassThroughConverter<PublicTrackingVerificationAttemptDocument>();
export const publicTrackingVerificationGrantConverter =
  createPassThroughConverter<PublicTrackingVerificationGrantDocument>();
export const idempotencyRecordConverter = createPassThroughConverter<IdempotencyRecordDocument>();
export const auditEventConverter = createPassThroughConverter<AuditEventDocument>();

export function userDocumentPath(userId: string): string {
  return `${firestoreCollections.users}/${userId}`;
}

export function stationDocumentPath(stationId: string): string {
  return `${firestoreCollections.stations}/${stationId}`;
}

export function notificationDocumentPath(notificationId: string): string {
  return `${firestoreCollections.notifications}/${notificationId}`;
}

export function outboundNotificationDocumentPath(outboundNotificationId: string): string {
  return `${firestoreCollections.outboundNotifications}/${outboundNotificationId}`;
}

export function deliveryDocumentPath(deliveryId: string): string {
  return `${firestoreCollections.deliveries}/${deliveryId}`;
}

export function deliveryEventDocumentPath(deliveryId: string, eventId: string): string {
  return `${deliveryDocumentPath(deliveryId)}/${firestoreCollections.deliveryEvents}/${eventId}`;
}

export function paymentDocumentPath(paymentId: string): string {
  return `${firestoreCollections.payments}/${paymentId}`;
}

export function pricingRuleDocumentPath(pricingRuleId: string): string {
  return `${firestoreCollections.pricingRules}/${pricingRuleId}`;
}

export function proofAssetDocumentPath(proofAssetId: string): string {
  return `${firestoreCollections.proofAssets}/${proofAssetId}`;
}

export function packageLabelDocumentPath(scanCode: string): string {
  return `${firestoreCollections.packageLabels}/${encodeURIComponent(scanCode)}`;
}

export function handoffEventDocumentPath(handoffEventId: string): string {
  return `${firestoreCollections.handoffEvents}/${handoffEventId}`;
}

export function webhookEventDocumentPath(eventId: string): string {
  return `${firestoreCollections.webhookEvents}/${eventId}`;
}

export function publicTrackingPhoneChallengeDocumentPath(challengeId: string): string {
  return `${firestoreCollections.publicTrackingPhoneChallenges}/${challengeId}`;
}

export function supportIssueDocumentPath(issueId: string): string {
  return `${firestoreCollections.supportIssues}/${issueId}`;
}

export function publicTrackingVerificationAttemptDocumentPath(attemptId: string): string {
  return `${firestoreCollections.publicTrackingVerificationAttempts}/${attemptId}`;
}

export function publicTrackingVerificationGrantDocumentPath(verificationId: string): string {
  return `${firestoreCollections.publicTrackingVerificationGrants}/${verificationId}`;
}

export function idempotencyRecordDocumentPath(recordId: string): string {
  return `${firestoreCollections.idempotencyRecords}/${recordId}`;
}

export function auditEventDocumentPath(eventId: string): string {
  return `${firestoreCollections.auditEvents}/${eventId}`;
}

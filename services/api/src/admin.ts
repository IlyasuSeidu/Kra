import { adminOverviewResponseSchema } from "@kra/shared";
import type { z } from "zod";

import type { DeliveryRecord } from "./deliveries";
import type { WebhookEventRecord } from "./payment-webhooks";
import type { PaymentRecord } from "./payments";

export interface AdminDeliveryMetricsRepository {
  countByStatus(): Promise<Array<{
    status: DeliveryRecord["currentStatus"];
    count: number;
  }>>;
}

export interface AdminPaymentMetricsRepository {
  countByStatus(): Promise<Array<{
    status: PaymentRecord["status"];
    count: number;
  }>>;
}

export interface AdminWebhookMetricsRepository {
  countByProcessingStatus(): Promise<Array<{
    processingStatus: WebhookEventRecord["processingStatus"];
    count: number;
  }>>;
}

export interface GetAdminOverviewDeps {
  deliveries: AdminDeliveryMetricsRepository;
  payments: AdminPaymentMetricsRepository;
  webhookEvents: AdminWebhookMetricsRepository;
  now: () => string;
}

export type AdminOverviewResponse = z.infer<typeof adminOverviewResponseSchema>;

export async function getAdminOverview(
  deps: GetAdminOverviewDeps
): Promise<AdminOverviewResponse> {
  const [deliveryStatusCounts, paymentStatusCounts, webhookStatusCounts] = await Promise.all([
    deps.deliveries.countByStatus(),
    deps.payments.countByStatus(),
    deps.webhookEvents.countByProcessingStatus()
  ]);

  const webhookCountMap = new Map(
    webhookStatusCounts.map((entry) => [entry.processingStatus, entry.count] as const)
  );

  const openIssueLikeDeliveries = deliveryStatusCounts
    .filter((entry) =>
      entry.status === "issue_reported" ||
      entry.status === "on_hold" ||
      entry.status === "delivery_failed"
    )
    .reduce((total, entry) => total + entry.count, 0);

  return adminOverviewResponseSchema.parse({
    generatedAt: deps.now(),
    deliveryStatusCounts,
    paymentStatusCounts,
    operationalAlerts: {
      openIssueLikeDeliveries,
      unmatchedWebhookEvents: webhookCountMap.get("unmatched") ?? 0,
      manualReviewWebhookEvents: webhookCountMap.get("manual_review") ?? 0
    }
  });
}

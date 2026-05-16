import { describe, expect, it } from "vitest";

import {
  dispatchDueOutboundNotifications,
  dispatchReceiverSmsOutboxRecord,
  queueAndDispatchReceiverDeliverySms,
  type OutboundNotificationRecord,
  type OutboundNotificationRepository
} from "../outbound-notifications";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeRecord(overrides: Partial<OutboundNotificationRecord> = {}): OutboundNotificationRecord {
  return {
    outboundNotificationId: "ONF-9401",
    channel: "sms",
    provider: "hubtel",
    kind: "receiver_delivery_sms",
    status: "pending",
    dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
    deliveryId: "DEL-9401",
    recipientPhone: "+233240000000",
    trackingCode: "KRA-9401",
    eventType: "out_for_delivery",
    stationName: "Kumasi Adum",
    attemptCount: 0,
    maxAttempts: 2,
    nextAttemptAt: "2026-05-16T15:00:00.000Z",
    createdAt: "2026-05-16T15:00:00.000Z",
    updatedAt: "2026-05-16T15:00:00.000Z",
    ...overrides
  };
}

function makeRepository(records: OutboundNotificationRecord[] = []): OutboundNotificationRepository {
  return {
    getByDedupeKey(dedupeKey) {
      return resolve(records.find((record) => record.dedupeKey === dedupeKey));
    },
    create(record) {
      records.push(record);
      return resolveVoid();
    },
    markSent(input) {
      const record = records.find((item) => item.outboundNotificationId === input.outboundNotificationId);

      if (record) {
        Object.assign(record, {
          status: "sent",
          attemptCount: input.attemptCount,
          lastAttemptAt: input.attemptedAt,
          sentAt: input.attemptedAt,
          updatedAt: input.attemptedAt
        });
      }

      return resolveVoid();
    },
    markFailed(input) {
      const record = records.find((item) => item.outboundNotificationId === input.outboundNotificationId);

      if (record) {
        Object.assign(record, {
          status: input.status,
          attemptCount: input.attemptCount,
          lastAttemptAt: input.attemptedAt,
          nextAttemptAt: input.nextAttemptAt,
          lastError: input.lastError,
          updatedAt: input.attemptedAt
        });
      }

      return resolveVoid();
    },
    listDue() {
      return resolve(records);
    },
    listRecent() {
      return resolve(records);
    }
  };
}

describe("outbound notifications", () => {
  it("creates a durable receiver SMS outbox record and marks it sent after provider success", async () => {
    const records: OutboundNotificationRecord[] = [];
    const sentMessages: unknown[] = [];

    await queueAndDispatchReceiverDeliverySms(
      {
        deliveryId: "DEL-9401",
        phone: "+233240000000",
        trackingCode: "KRA-9401",
        eventType: "out_for_delivery",
        stationName: "Kumasi Adum"
      },
      {
        outboundNotifications: makeRepository(records),
        notifications: {
          sendReceiverDeliverySms(input) {
            sentMessages.push(input);
            return resolveVoid();
          }
        },
        identityFactory: {
          nextOutboundNotificationId: () => "ONF-9401"
        },
        now: () => "2026-05-16T15:00:00.000Z"
      }
    );

    expect(sentMessages).toEqual([
      {
        phone: "+233240000000",
        trackingCode: "KRA-9401",
        eventType: "out_for_delivery",
        stationName: "Kumasi Adum"
      }
    ]);
    expect(records).toEqual([
      expect.objectContaining({
        outboundNotificationId: "ONF-9401",
        status: "sent",
        dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
        attemptCount: 1,
        sentAt: "2026-05-16T15:00:00.000Z"
      })
    ]);
  });

  it("marks failed SMS attempts for retry without throwing into the caller", async () => {
    const records = [makeRecord()];

    await dispatchReceiverSmsOutboxRecord(records[0]!, {
      outboundNotifications: makeRepository(records),
      notifications: {
        sendReceiverDeliverySms() {
          return Promise.reject(new Error("Hubtel timeout"));
        }
      },
      now: () => "2026-05-16T15:05:00.000Z"
    });

    expect(records[0]).toMatchObject({
      status: "failed",
      attemptCount: 1,
      lastAttemptAt: "2026-05-16T15:05:00.000Z",
      nextAttemptAt: "2026-05-16T15:35:00.000Z",
      lastError: {
        name: "Error",
        message: "Hubtel timeout"
      }
    });
  });

  it("moves repeated failures to dead letter after the allowed SMS retry", async () => {
    const records = [
      makeRecord({
        status: "failed",
        attemptCount: 1,
        nextAttemptAt: "2026-05-16T15:35:00.000Z"
      })
    ];

    await dispatchReceiverSmsOutboxRecord(records[0]!, {
      outboundNotifications: makeRepository(records),
      notifications: {
        sendReceiverDeliverySms() {
          return Promise.reject(new Error("Hubtel rejected message"));
        }
      },
      now: () => "2026-05-16T15:35:00.000Z"
    });

    expect(records[0]).toMatchObject({
      status: "dead_letter",
      attemptCount: 2,
      lastAttemptAt: "2026-05-16T15:35:00.000Z",
      nextAttemptAt: "2026-05-16T15:35:00.000Z",
      lastError: {
        name: "Error",
        message: "Hubtel rejected message"
      }
    });
  });

  it("dispatches due outbox records and returns batch counters", async () => {
    const records = [
      makeRecord({
        outboundNotificationId: "ONF-9401",
        dedupeKey: "receiver-sms:DEL-9401:out_for_delivery",
        trackingCode: "KRA-9401"
      }),
      makeRecord({
        outboundNotificationId: "ONF-9402",
        dedupeKey: "receiver-sms:DEL-9402:ready_for_pickup",
        deliveryId: "DEL-9402",
        trackingCode: "KRA-9402",
        eventType: "ready_for_pickup"
      })
    ];
    const sentMessages: string[] = [];

    const result = await dispatchDueOutboundNotifications(
      {
        limit: 25
      },
      {
        outboundNotifications: makeRepository(records),
        notifications: {
          sendReceiverDeliverySms(input) {
            sentMessages.push(input.trackingCode);

            if (input.trackingCode === "KRA-9402") {
              return Promise.reject(new Error("Hubtel timeout"));
            }

            return resolveVoid();
          }
        },
        now: () => "2026-05-16T15:00:00.000Z"
      }
    );

    expect(sentMessages).toEqual(["KRA-9401", "KRA-9402"]);
    expect(result).toEqual({
      processed: 2,
      sent: 1,
      failed: 1,
      deadLettered: 0,
      results: [
        {
          outboundNotificationId: "ONF-9401",
          status: "sent",
          attemptCount: 1
        },
        {
          outboundNotificationId: "ONF-9402",
          status: "failed",
          attemptCount: 1
        }
      ]
    });
  });
});

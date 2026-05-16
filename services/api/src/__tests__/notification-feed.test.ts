import { describe, expect, it } from "vitest";

import {
  listNotifications,
  queueNotificationIfMissing,
  type NotificationRecord,
  type NotificationRepository
} from "../notification-feed";

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

function resolveVoid(): Promise<void> {
  return Promise.resolve();
}

function makeNotification(overrides: Partial<NotificationRecord> = {}): NotificationRecord {
  return {
    notificationId: "NTF-9401",
    recipientUserId: "USR-SND-001",
    type: "ready_for_pickup",
    status: "unread",
    title: "Ready for pickup",
    body: "Your package is ready for receiver pickup at the destination station.",
    deliveryId: "DEL-9401",
    dedupeKey: "delivery:DEL-9401:ready_for_pickup",
    createdAt: "2026-05-16T15:00:00.000Z",
    ...overrides
  };
}

describe("notification feed", () => {
  it("queues a notification once per dedupe key", async () => {
    const created: NotificationRecord[] = [];
    const repository: NotificationRepository = {
      getByDedupeKey(dedupeKey) {
        return resolve(created.find((notification) => notification.dedupeKey === dedupeKey));
      },
      create(notification) {
        created.push(notification);
        return resolveVoid();
      },
      listByRecipientUserId() {
        return resolve([]);
      }
    };
    const deps = {
      notificationFeed: repository,
      identityFactory: {
        nextNotificationId: () => "NTF-9401"
      },
      now: () => "2026-05-16T15:00:00.000Z"
    };

    await queueNotificationIfMissing(
      {
        recipientUserId: "USR-SND-001",
        type: "ready_for_pickup",
        title: "Ready for pickup",
        body: "Your package is ready for receiver pickup at the destination station.",
        deliveryId: "DEL-9401",
        dedupeKey: "delivery:DEL-9401:ready_for_pickup"
      },
      deps
    );
    await queueNotificationIfMissing(
      {
        recipientUserId: "USR-SND-001",
        type: "ready_for_pickup",
        title: "Ready for pickup",
        body: "Your package is ready for receiver pickup at the destination station.",
        deliveryId: "DEL-9401",
        dedupeKey: "delivery:DEL-9401:ready_for_pickup"
      },
      deps
    );

    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      notificationId: "NTF-9401",
      status: "unread",
      dedupeKey: "delivery:DEL-9401:ready_for_pickup"
    });
  });

  it("lists notifications without exposing internal recipient or dedupe fields", async () => {
    const response = await listNotifications(
      {
        userId: "USR-SND-001",
        role: "sender",
        capabilities: [],
        authMethod: "firebase_id_token"
      },
      {
        limit: "10"
      },
      {
        notificationFeed: {
          getByDedupeKey() {
            return resolve(undefined);
          },
          create() {
            return resolveVoid();
          },
          listByRecipientUserId(input) {
            expect(input).toEqual({
              recipientUserId: "USR-SND-001",
              limit: 10
            });

            return resolve([
              makeNotification({
                readAt: "2026-05-16T15:05:00.000Z",
                status: "read"
              })
            ]);
          }
        }
      }
    );

    expect(response).toEqual({
      notifications: [
        {
          notificationId: "NTF-9401",
          type: "ready_for_pickup",
          status: "read",
          title: "Ready for pickup",
          body: "Your package is ready for receiver pickup at the destination station.",
          deliveryId: "DEL-9401",
          createdAt: "2026-05-16T15:00:00.000Z",
          readAt: "2026-05-16T15:05:00.000Z"
        }
      ]
    });
  });
});

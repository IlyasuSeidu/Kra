import {
  notificationListQuerySchema,
  notificationListResponseSchema,
  notificationResponseSchema
} from "@kra/shared";
import type { z } from "zod";

import type { AuthPrincipal } from "./auth";

export interface NotificationRecord {
  notificationId: string;
  recipientUserId: string;
  type: z.infer<typeof notificationResponseSchema>["type"];
  status: "unread" | "read";
  title: string;
  body: string;
  deliveryId?: string;
  createdAt: string;
  readAt?: string;
  dedupeKey: string;
}

export interface NotificationRepository {
  getByDedupeKey(dedupeKey: string): Promise<NotificationRecord | undefined>;
  create(notification: NotificationRecord): Promise<void>;
  listByRecipientUserId(input: { recipientUserId: string; limit: number }): Promise<NotificationRecord[]>;
}

export interface NotificationIdentityFactory {
  nextNotificationId(): string;
}

export interface QueueNotificationDeps {
  notificationFeed: NotificationRepository;
  identityFactory: NotificationIdentityFactory;
  now: () => string;
}

export interface QueueNotificationInput {
  recipientUserId: string;
  type: NotificationRecord["type"];
  title: string;
  body: string;
  dedupeKey: string;
  deliveryId?: string;
}

export async function queueNotificationIfMissing(
  input: QueueNotificationInput,
  deps: QueueNotificationDeps
): Promise<void> {
  const existing = await deps.notificationFeed.getByDedupeKey(input.dedupeKey);

  if (existing) {
    return;
  }

  await deps.notificationFeed.create({
    notificationId: deps.identityFactory.nextNotificationId(),
    recipientUserId: input.recipientUserId,
    type: input.type,
    status: "unread",
    title: input.title,
    body: input.body,
    dedupeKey: input.dedupeKey,
    ...(input.deliveryId === undefined ? {} : { deliveryId: input.deliveryId }),
    createdAt: deps.now()
  });
}

export async function listNotifications(
  principal: AuthPrincipal,
  query: Record<string, unknown>,
  deps: {
    notificationFeed: NotificationRepository;
  }
): Promise<z.infer<typeof notificationListResponseSchema>> {
  const parsedQuery = notificationListQuerySchema.parse(query);
  const notifications = await deps.notificationFeed.listByRecipientUserId({
    recipientUserId: principal.userId,
    limit: parsedQuery.limit ?? 50
  });

  return notificationListResponseSchema.parse({
    notifications: notifications.map((notification) =>
      notificationResponseSchema.parse({
        notificationId: notification.notificationId,
        type: notification.type,
        status: notification.status,
        title: notification.title,
        body: notification.body,
        ...(notification.deliveryId === undefined ? {} : { deliveryId: notification.deliveryId }),
        createdAt: notification.createdAt,
        ...(notification.readAt === undefined ? {} : { readAt: notification.readAt })
      })
    )
  });
}

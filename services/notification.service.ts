/**
 * Notification Service — manages in-app alerts and notifications.
 */

import { AppNotification } from '@/types';
import { MOCK_NOTIFICATIONS } from './mock-data';

export async function getNotifications(_storeId: string): Promise<AppNotification[]> {
  return Promise.resolve(
    [...MOCK_NOTIFICATIONS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

export async function getUnreadCount(_storeId: string): Promise<number> {
  return Promise.resolve(MOCK_NOTIFICATIONS.filter((n) => !n.read).length);
}

export async function markAsRead(id: string): Promise<void> {
  const n = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  if (n) n.read = true;
}

export async function markAllAsRead(_storeId: string): Promise<void> {
  MOCK_NOTIFICATIONS.forEach((n) => (n.read = true));
}

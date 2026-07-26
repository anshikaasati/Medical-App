'use client';

import React, { useState, useEffect } from 'react';
import { AppNotification, NotificationType } from '@/types';
import { getNotifications, markAllAsRead, markAsRead } from '@/services/notification.service';
import Link from 'next/link';

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  LOW_STOCK: { icon: '📦', color: 'border-red-500/30 bg-red-500/5' },
  NEAR_EXPIRY: { icon: '⏳', color: 'border-amber-500/30 bg-amber-500/5' },
  EXPIRED: { icon: '🚫', color: 'border-red-700/30 bg-red-700/5' },
  PURCHASE_DUE: { icon: '📋', color: 'border-blue-500/30 bg-blue-500/5' },
  PAYMENT_DUE: { icon: '💸', color: 'border-amber-500/30 bg-amber-500/5' },
  NEW_ORDER: { icon: '🛒', color: 'border-emerald-500/30 bg-emerald-500/5' },
};

const SEVERITY_BADGE: Record<AppNotification['severity'], string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    getNotifications('store_01').then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead('store_01');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Alerts for stock, expiry, payments and orders.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'UNREAD'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
          >
            {f} {f === 'UNREAD' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-slate-400 text-sm">
              {filter === 'UNREAD'
                ? 'All caught up! No unread notifications.'
                : 'No notifications yet.'}
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            return (
              <div
                key={notif.id}
                className={`rounded-2xl border p-4 transition-all ${config.color} ${!notif.read ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0 mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}
                      >
                        {notif.title}
                      </p>
                      <span
                        className={`inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${SEVERITY_BADGE[notif.severity]}`}
                      >
                        {notif.severity}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-500">{timeAgo(notif.createdAt)}</span>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View →
                        </Link>
                      )}
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

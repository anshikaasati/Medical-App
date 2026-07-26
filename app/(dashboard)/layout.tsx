import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MOCK_NOTIFICATIONS } from '@/services/mock-data';

// Nav item definition
interface NavItem {
  href: string;
  label: string;
  icon: string;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/billing', label: 'POS Billing', icon: '🛒' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: '💊' },
  { href: '/dashboard/inventory/expiring', label: 'Expiry Alerts', icon: '⏳' },
  { href: '/dashboard/purchases', label: 'Purchase Orders', icon: '📦' },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: '🏭' },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈', ownerOnly: true },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', ownerOnly: true },
  { href: '/dashboard/settings/users', label: 'Staff & Roles', icon: '🧑‍💼', ownerOnly: true },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // 1. Get active user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Query public profile for role validation
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

  if (!profile || !['OWNER', 'MANAGER', 'STAFF'].includes(profile.role)) {
    // Force logout and redirect if user has an invalid role or no profile
    await supabase.auth.signOut();
    redirect('/login?error=unauthorized_role');
  }

  const isOwnerOrManager = ['OWNER', 'MANAGER'].includes(profile.role);
  const nameInitials = profile.name ? profile.name[0].toUpperCase() : 'U';

  // Unread notification count (mock — replace with DB query)
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  // Visible nav items based on role
  const visibleNav = NAV_ITEMS.filter((item) => !item.ownerOnly || isOwnerOrManager);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar navigation */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 shrink-0">
        {/* Brand */}
        <div className="flex h-12 items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">MargERP</h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              Next-Gen Cloud
            </span>
          </div>
        </div>

        {/* Store Profile */}
        <div className="mt-6 rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <span className="block text-[10px] font-medium text-slate-500 uppercase">
              Location Portal
            </span>
            <span className="text-xs font-bold text-slate-200">Main Pharmacy</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-slate-400 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3Zm-3.76 9.2a.75.75 0 0 1 1.06.04l2.7 2.908 2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .04-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Nav list */}
        <nav className="mt-6 flex-1 space-y-0.5 text-slate-400 overflow-y-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 shrink-0 text-center">{item.icon}</span>
                {item.label}
              </div>
              {/* Notification badge on notifications link */}
              {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shrink-0">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="mt-auto border-t border-slate-800 pt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">
            {nameInitials}
          </div>
          <div className="truncate flex-1">
            <span className="block text-xs font-bold text-slate-200">{profile.name}</span>
            <span className="block text-[10px] text-slate-500 font-semibold">{profile.role}</span>
          </div>
          <form action="/api/auth/signout" method="post" className="m-0 p-0">
            <button
              type="submit"
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center"
              title="Sign Out"
            >
              🔌
            </button>
          </form>
        </div>
      </aside>

      {/* Main body wrapper */}
      <div className="pl-64 flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Live Connection
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* Notification bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="text-right">
              <span className="block text-[10px] font-semibold text-slate-500">
                SYSTEM DATE (IST)
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable container */}
        <main className="flex-1 p-8 bg-slate-900/60 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

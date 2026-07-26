import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

        {/* Store Profile Selector */}
        <div className="mt-6 rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <span className="block text-[10px] font-medium text-slate-500 uppercase">
              Location Portal
            </span>
            <span className="text-xs font-bold text-slate-200">Main Pharmacy (Sector 12)</span>
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

        {/* Nav list: Conditionally rendered based on user role */}
        <nav className="mt-8 flex-1 space-y-1.5 text-slate-400">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
          >
            <span className="h-4 w-4 shrink-0 text-center">📊</span>
            Dashboard
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
          >
            <span className="h-4 w-4 shrink-0">🛒</span>
            POS Billing
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all"
          >
            <span className="h-4 w-4 shrink-0">💊</span>
            Medicine Inventory
          </Link>
          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all opacity-80"
          >
            <span className="h-4 w-4 shrink-0">📦</span>
            Purchase Orders
          </Link>

          {/* Restricted Admin Menu Items */}
          {isOwnerOrManager && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all opacity-80"
              >
                <span className="h-4 w-4 shrink-0">📈</span>
                Reports (GST, P&L)
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all opacity-80"
              >
                <span className="h-4 w-4 shrink-0">👥</span>
                User Roles
              </Link>
            </>
          )}
        </nav>

        {/* User profile footer with server sign-out */}
        <div className="mt-auto border-t border-slate-800 pt-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
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

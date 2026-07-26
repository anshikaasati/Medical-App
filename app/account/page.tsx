'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  email?: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Store auth email as fallback display
      setAuthEmail(user.email ?? null);

      // Try to load profile from public.users table — may not exist for customers
      const { data: userProfile } = await supabase
        .from('users')
        .select('name, phone, role')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        setProfile({ ...userProfile, email: user.email });
      } else {
        // Customer signed in via magic link with no users row — use auth metadata
        const meta = user.user_metadata ?? {};
        setProfile({
          name: meta.name || meta.full_name || null,
          phone: meta.phone || null,
          role: 'CUSTOMER',
          email: user.email,
        });
      }

      setLoading(false);
    }
    loadData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent inline-block" />
          <p className="text-sm font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || authEmail?.split('@')[0] || 'Valued Customer';
  const isStaff = profile?.role && ['OWNER', 'MANAGER', 'STAFF'].includes(profile.role);

  return (
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {isStaff ? `${profile?.role} Account` : 'Customer Account'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Hello, {displayName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {profile?.email || authEmail || 'No email linked'}
            </p>
            {profile?.phone && <p className="text-sm text-slate-500">{profile.phone}</p>}
          </div>
          <div className="flex gap-3 flex-wrap">
            {isStaff && (
              <Link
                href="/dashboard"
                className="rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm px-5 py-2.5 shadow-sm transition-all"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              href="/shop"
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 shadow-sm transition-all"
            >
              Go to Store
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 shadow-sm transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Recent Orders
            </h3>
            <div className="mt-6 text-center py-8">
              <p className="text-slate-400 text-sm">No orders placed yet.</p>
              <Link
                href="/shop"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-500 font-semibold text-sm"
              >
                Browse Medicines &amp; Order →
              </Link>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Uploaded Prescriptions
            </h3>
            <div className="mt-6 text-center py-8">
              <p className="text-slate-400 text-sm">No prescription documents found.</p>
              <Link
                href="/shop/prescriptions"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-500 font-semibold text-sm"
              >
                Upload Prescription (AI OCR) →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Quick Links
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/shop', label: '💊 Browse Medicines' },
              { href: '/account/orders', label: '📦 Order History' },
              { href: '/shop/prescriptions', label: '📷 Upload Rx' },
              { href: '/shop/cart', label: '🛒 My Cart' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 p-4 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-all text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

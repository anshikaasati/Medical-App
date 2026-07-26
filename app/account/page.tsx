'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(userProfile);
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

  return (
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Customer Account
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
              Hello, {profile?.name || 'Valued Customer'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{profile?.phone || 'No phone linked'}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
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
                href="/"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-500 font-semibold text-sm animate-pulse"
              >
                Browse Medicines & Order →
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
                href="/"
                className="inline-block mt-4 text-emerald-600 hover:text-emerald-500 font-semibold text-sm"
              >
                Upload Prescription (AI OCR) →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

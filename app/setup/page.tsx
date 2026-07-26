'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Step = 'welcome' | 'store' | 'owner' | 'complete';

interface StoreForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  drugLicenseNo: string;
}

interface OwnerForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storeForm, setStoreForm] = useState<StoreForm>({
    name: '',
    address: '',
    city: '',
    state: 'Madhya Pradesh',
    pincode: '',
    phone: '',
    email: '',
    gstin: '',
    drugLicenseNo: '',
  });

  const [ownerForm, setOwnerForm] = useState<OwnerForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Check if setup is already complete
  useEffect(() => {
    async function checkSetup() {
      try {
        const { data } = await supabase.from('users').select('id').eq('role', 'OWNER').limit(1);

        if (data && data.length > 0) {
          // Owner already exists — redirect to login
          router.replace('/login');
          return;
        }
      } catch {
        // If table doesn't exist yet, allow setup
      }
      setChecking(false);
    }
    checkSetup();
  }, [router, supabase]);

  const handleCreateOwner = async () => {
    setError(null);
    if (!ownerForm.name || !ownerForm.email || !ownerForm.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (ownerForm.password !== ownerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (ownerForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: ownerForm.email,
        password: ownerForm.password,
        options: {
          data: {
            role: 'OWNER',
            name: ownerForm.name,
            phone: ownerForm.phone,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setStep('complete');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const steps: Step[] = ['welcome', 'store', 'owner', 'complete'];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-7 w-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white">MargERP Setup</h1>
          <p className="text-slate-400 text-sm mt-1">One-time pharmacy initialization</p>
        </div>

        {/* Step Progress */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {['Store Info', 'Owner Account', 'Done'].map((label, i) => (
              <React.Fragment key={label}>
                <div
                  className={`flex items-center gap-2 ${i < stepIndex ? 'text-indigo-400' : i === stepIndex - 1 ? 'text-white' : 'text-slate-600'}`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < stepIndex - 1 ? 'bg-indigo-600 border-indigo-600 text-white' : i === stepIndex - 1 ? 'border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-600'}`}
                  >
                    {i < stepIndex - 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-px w-8 ${i < stepIndex - 1 ? 'bg-indigo-600' : 'bg-slate-700'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Step: Welcome */}
          {step === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="text-5xl">🏥</div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome to MargERP</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Let&apos;s get your pharmacy set up in under 2 minutes. We&apos;ll create your
                  store profile and the first owner account. You won&apos;t need developer help
                  after this.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['⚡', 'Fast Setup'],
                  ['🔒', 'Secure'],
                  ['📱', 'No Code'],
                ].map(([icon, label]) => (
                  <div key={label} className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-xs font-semibold text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('store')}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-600/20"
              >
                Begin Setup →
              </button>
            </div>
          )}

          {/* Step: Store Info */}
          {step === 'store' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">Pharmacy Information</h2>
                <p className="text-slate-400 text-xs mt-1">
                  This appears on your invoices and GST reports.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Pharmacy Name *', placeholder: 'MargPharmacy' },
                  { key: 'phone', label: 'Phone *', placeholder: '+91 98765 43210' },
                  { key: 'email', label: 'Email', placeholder: 'info@pharmacy.com' },
                  { key: 'city', label: 'City *', placeholder: 'Indore' },
                  { key: 'state', label: 'State *', placeholder: 'Madhya Pradesh' },
                  { key: 'pincode', label: 'Pincode *', placeholder: '452001' },
                  { key: 'gstin', label: 'GSTIN', placeholder: '23AAAAA0000A1Z5' },
                  {
                    key: 'drugLicenseNo',
                    label: 'Drug License No.',
                    placeholder: 'DL/MP/2024/001234',
                  },
                ].map((field) => (
                  <div key={field.key} className={field.key === 'name' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={storeForm[field.key as keyof StoreForm]}
                      onChange={(e) => setStoreForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Shop No. 14, Medical Complex, Sector 12"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('welcome')}
                  className="flex-1 rounded-xl border border-slate-700 text-slate-400 font-semibold py-2.5 text-sm hover:bg-slate-900 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (storeForm.name && storeForm.phone) setStep('owner');
                    else setError('Please enter pharmacy name and phone.');
                  }}
                  className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-sm transition-all"
                >
                  Next: Owner Account →
                </button>
              </div>
            </div>
          )}

          {/* Step: Owner Account */}
          {step === 'owner' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">Create Owner Account</h2>
                <p className="text-slate-400 text-xs mt-1">
                  This is the master admin account. Keep these credentials safe.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    key: 'name',
                    label: 'Full Name *',
                    type: 'text',
                    placeholder: 'Dr. Anshika Asati',
                  },
                  {
                    key: 'email',
                    label: 'Email Address *',
                    type: 'email',
                    placeholder: 'owner@pharmacy.com',
                  },
                  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
                  {
                    key: 'password',
                    label: 'Password *',
                    type: 'password',
                    placeholder: 'Min. 8 characters',
                  },
                  {
                    key: 'confirmPassword',
                    label: 'Confirm Password *',
                    type: 'password',
                    placeholder: 'Re-enter password',
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={ownerForm[field.key as keyof OwnerForm]}
                      onChange={(e) => setOwnerForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
                ⚠️ After setup, the <strong>/setup</strong> route is disabled permanently. No one
                can access it again unless the database is reset.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('store')}
                  className="flex-1 rounded-xl border border-slate-700 text-slate-400 font-semibold py-2.5 text-sm hover:bg-slate-900 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateOwner}
                  disabled={loading}
                  className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
                      Creating...
                    </>
                  ) : (
                    'Create Account & Finish →'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="text-center space-y-6">
              <div className="text-5xl animate-bounce">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-white">Setup Complete!</h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  <strong className="text-white">{storeForm.name || 'Your pharmacy'}</strong> is now
                  configured. Your owner account has been created. You can log in and start managing
                  your pharmacy immediately.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left space-y-1">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Setup Summary
                </p>
                <p className="text-xs text-slate-300">✅ Pharmacy profile created</p>
                <p className="text-xs text-slate-300">✅ Owner account registered</p>
                <p className="text-xs text-slate-300">✅ Default roles & permissions configured</p>
                <p className="text-xs text-slate-300">✅ Setup route permanently disabled</p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 transition-all hover:scale-[1.01] shadow-lg"
              >
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

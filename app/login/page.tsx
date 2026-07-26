'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'staff' | 'customer'>('staff');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'MANAGER' | 'STAFF'>('OWNER');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Read URL query parameters for callback errors
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'auth_callback_failed') {
        setErrorMsg('Authentication link expired or invalid. Please try again.');
      } else {
        setErrorMsg('An error occurred during authentication.');
      }
    }
  }, [searchParams]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Query user role to confirm staff access
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          setErrorMsg('Failed to retrieve user profile.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!['OWNER', 'MANAGER', 'STAFF'].includes(profile.role)) {
          setErrorMsg('Access denied. This portal is for pharmacy staff only.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        setSuccessMsg('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleStaffSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || !name) {
      setErrorMsg('Please fill in your name, email, and password.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: selectedRole,
            name: name,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setSuccessMsg('Staff account created successfully! You can now log in.');
        setIsSignUp(false);
        setName('');
        setPassword('');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Magic link sent! Please check your email inbox.');
      setEmail('');
    } catch {
      setErrorMsg('Failed to send magic link. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 sm:px-6">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
            Marg<span className="text-emerald-500">Pharmacy</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">Next-Gen Cloud Pharmacy ERP Portal</p>
        </div>

        {/* Auth Box */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-lg">
          {/* Tab Selector */}
          {!isSignUp && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-900 p-1 mb-6 border border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('staff');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'staff'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pharmacy Staff
              </button>
              <button
                onClick={() => {
                  setActiveTab('customer');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                  activeTab === 'customer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Customer Sign-In
              </button>
            </div>
          )}

          {/* Toast / Message Alerts */}
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400 flex items-start gap-2.5 animate-shake">
              <span className="shrink-0 text-sm">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-400 flex items-start gap-2.5 animate-pulse">
              <span className="shrink-0 text-sm">✅</span>
              <p>{successMsg}</p>
            </div>
          )}

          {/* Forms */}
          {activeTab === 'staff' ? (
            isSignUp ? (
              <form onSubmit={handleStaffSignUp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Anshika Asati"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pharmacy.com"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Assigned Staff Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as 'OWNER' | 'MANAGER' | 'STAFF')
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="MANAGER">Manager</option>
                    <option value="STAFF">Pharmacy Staff</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Registering Account...
                    </>
                  ) : (
                    'Create Staff Account'
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pharmacy.com"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-[10px] font-semibold text-emerald-500 hover:underline"
                    >
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying Credentials...
                    </>
                  ) : (
                    'Login to ERP'
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Need a staff account? Register here
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending link...
                  </>
                ) : (
                  'Send Magic Access Link'
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                Passwordless login. We will email you a secure link that will log you in instantly
                to search prescriptions and order history.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

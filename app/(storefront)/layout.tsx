import React from 'react';
import Link from 'next/link';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Banner */}
      <div className="bg-emerald-600 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        ⚡ Prescription OCR Reader is now available! Upload your prescription to order instantly.
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
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
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Marg<span className="text-emerald-600">Pharmacy</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/medicines" className="hover:text-emerald-600 transition-colors">
              Medicines
            </Link>
            <Link href="/prescriptions" className="hover:text-emerald-600 transition-colors">
              Prescriptions
            </Link>
            <Link href="/orders" className="hover:text-emerald-600 transition-colors">
              Track Order
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-lg font-bold text-slate-900">
                Marg<span className="text-emerald-600">Pharmacy</span>
              </span>
              <p className="text-sm text-slate-500">
                Smart cloud-based medicine ordering and prescription diagnostics.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Shop
              </h4>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
                <li>
                  <Link href="/medicines" className="hover:text-emerald-600">
                    Browse Medicines
                  </Link>
                </li>
                <li>
                  <Link href="/prescriptions" className="hover:text-emerald-600">
                    Upload Prescriptions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Support
              </h4>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
                <li>
                  <Link href="/faq" className="hover:text-emerald-600">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-600">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Legals
              </h4>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
                <li>
                  <Link href="/privacy" className="hover:text-emerald-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-600">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} MargPharmacy. All rights reserved. Registered Indian
            Pharmacy License.
          </div>
        </div>
      </footer>
    </div>
  );
}

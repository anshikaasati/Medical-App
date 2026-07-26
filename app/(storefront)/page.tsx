import React from 'react';
import Link from 'next/link';

export default function StorefrontPage() {
  // Demo data matching formatting guidelines: DD-MMM-YYYY for dates, ₹ for currency
  const featuredMedicines = [
    {
      id: 'm1',
      name: 'Amoxicillin 500mg',
      composition: 'Amoxicillin Trihydrate',
      mrp: 14500, // stored as paise (145.00 INR)
      batch: 'AMX-2026-09',
      expiry: '15-Sep-2028',
    },
    {
      id: 'm2',
      name: 'Paracetamol 650mg',
      composition: 'Paracetamol / Acetaminophen',
      mrp: 3200, // stored as paise (32.00 INR)
      batch: 'PCM-650-B4',
      expiry: '28-Feb-2029',
    },
    {
      id: 'm3',
      name: 'Atorvastatin 10mg',
      composition: 'Atorvastatin Calcium',
      mrp: 18500, // stored as paise (185.00 INR)
      batch: 'ATV-10-992',
      expiry: '10-Dec-2027',
    },
  ];

  const formatCurrency = (paise: number) => {
    const rupees = paise / 100;
    // Format as Indian Currency (e.g. ₹1,25,000)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(rupees);
  };

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-850 to-slate-900 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Serving customers in real-time
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Medicines Delivered <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Accurately & Swiftly.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              Search authentic medicines, get substitutes instantly, or upload a prescription to
              have our licensed pharmacist compile your order. Fully GST and license compliant.
            </p>

            {/* Prescription upload area */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-md bg-white/10 rounded-xl p-1 backdrop-blur-md border border-white/15 flex items-center justify-between shadow-lg">
                <input
                  type="text"
                  placeholder="Search medicine, composition or formula..."
                  className="bg-transparent text-white placeholder-slate-400 px-4 py-2 text-sm focus:outline-none w-full"
                />
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm">
                  Search
                </button>
              </div>

              <Link
                href="/prescriptions"
                className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm px-6 py-3.5 shadow-sm transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-emerald-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                Upload Prescription (AI OCR)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Featured Healthcare Products
              </h2>
              <p className="mt-2 text-slate-500">
                Fully batched, checked for expiry, and delivered directly to your doorstep.
              </p>
            </div>
            <Link
              href="/medicines"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 mt-2 md:mt-0 flex items-center gap-1 group"
            >
              View all inventory
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMedicines.map((med) => (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-slate-350 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {med.name}
                    </h3>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      In Stock
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 italic">{med.composition}</p>

                  <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div>
                      <span className="block font-medium text-slate-400">Batch Code</span>
                      <span className="font-mono text-slate-700">{med.batch}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-slate-400">Expires On</span>
                      <span className="text-slate-700">{med.expiry}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(med.mrp)}
                  </span>
                  <button className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm px-4 py-2.5 transition-all">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">100% Genuine Medicines</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Sourced directly from verified manufacturers and distributor channels.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Expiry Guardrail Protection</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Our system automatically locks and rejects items with less than 60 days of shelf
                  life.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900">GST Invoice Ready</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Get compliant GST invoices showing breakups of SGST/CGST/IGST automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

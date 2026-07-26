'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DesignSystemPage() {
  const [inputText, setInputText] = useState('Amoxicillin 500mg');

  // Simulated dataset for table showcase
  const medicinesSample = [
    {
      id: 'm-1',
      name: 'Amoxicillin 500mg',
      batch: 'AMX-2608',
      expiry: '24-Aug-2028', // DD-MMM-YYYY format
      mrp: 14500, // stored in paise (₹145.00)
      stock: 450,
      status: 'active',
    },
    {
      id: 'm-2',
      name: 'Ciprofloxacin 250mg',
      batch: 'CIP-2609',
      expiry: '12-Sep-2026',
      mrp: 9250, // ₹92.50
      stock: 8,
      status: 'low_stock',
    },
    {
      id: 'm-3',
      name: 'Paracetamol 650mg',
      batch: 'PCM-2511',
      expiry: '15-Nov-2025',
      mrp: 3200, // ₹32.00
      stock: 0,
      status: 'expired',
    },
  ];

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(paise / 100);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24">
      {/* Visual Header Banner */}
      <header className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-950 to-slate-950 border-b border-slate-800 py-16 px-8">
        <div className="absolute top-0 right-0 h-48 w-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
            Design Tokens & UI System
          </span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Teal Sanctuary Design System
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Custom UI architecture for MargPharmacy ERP. Contains spacing constants, color tokens,
            and components styled to deliver premium visual consistency across desktop POS and
            patient applications.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-12 space-y-16">
        {/* Color Palette Grid */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">1. Color Palette Tokens</h2>
            <p className="text-xs text-slate-400 mt-1">
              Direct representation of active HSL CSS variables.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
              <div className="h-16 w-full rounded-lg bg-teal-600 shadow-glow" />
              <div>
                <span className="block text-xs font-bold text-white">Primary (Teal)</span>
                <span className="text-[10px] text-slate-500 font-mono">#0D9488</span>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
              <div className="h-16 w-full rounded-lg bg-emerald-500" />
              <div>
                <span className="block text-xs font-bold text-white">Secondary (Emerald)</span>
                <span className="text-[10px] text-slate-500 font-mono">#10B981</span>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
              <div className="h-16 w-full rounded-lg bg-slate-950 border border-slate-850" />
              <div>
                <span className="block text-xs font-bold text-white">Background</span>
                <span className="text-[10px] text-slate-500 font-mono">#0B0F19</span>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
              <div className="h-16 w-full rounded-lg bg-slate-900" />
              <div>
                <span className="block text-xs font-bold text-white">Card Base</span>
                <span className="text-[10px] text-slate-500 font-mono">#111827</span>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
              <div className="h-16 w-full rounded-lg bg-rose-500" />
              <div>
                <span className="block text-xs font-bold text-white">Destructive (Rose)</span>
                <span className="text-[10px] text-slate-500 font-mono">#F43F5E</span>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons and Micro-interactions */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">2. Buttons & Tactile Feedback</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sleek borders, subtle shadow-glows, and scale adjustments on click.
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-wrap gap-4 items-center shadow-premium">
            <Button className="active:scale-[0.98] transition-all hover:shadow-glow">
              Primary Button
            </Button>

            <Button variant="secondary" className="active:scale-[0.98] transition-all">
              Secondary Button
            </Button>

            <Button variant="outline" className="active:scale-[0.98] transition-all">
              Outline Button
            </Button>

            <Button variant="ghost" className="active:scale-[0.98] transition-all">
              Ghost Button
            </Button>

            <Button variant="destructive" className="active:scale-[0.98] transition-all">
              Destructive Button
            </Button>

            <Button variant="link" className="active:scale-[0.98] transition-all">
              Link Button
            </Button>
          </div>
        </section>

        {/* Forms & Inputs */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">3. Forms & Verification States</h2>
            <p className="text-xs text-slate-400 mt-1">
              High-contrast inputs with clean focus states and custom validation outlines.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Input Default / Focus */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-premium">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Default / Focus State
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition-all"
              />
              <span className="block text-[10px] text-slate-500">
                Active keyboard edit support.
              </span>
            </div>

            {/* Input Error / Invalid */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-premium">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Validation Failure State
              </label>
              <input
                type="text"
                defaultValue="Invalid Batch Code!"
                className="w-full rounded-xl border border-rose-500/40 bg-slate-900 px-4 py-3 text-sm text-rose-400 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all"
              />
              <span className="block text-[10px] text-rose-400">
                Batch code must contain numeric identifiers.
              </span>
            </div>

            {/* Input Disabled */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-premium">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Disabled State
              </label>
              <input
                type="text"
                disabled
                value="Auto-generated GSTIN code"
                className="w-full rounded-xl border border-slate-900 bg-slate-950 px-4 py-3 text-sm text-slate-500 cursor-not-allowed select-none"
              />
              <span className="block text-[10px] text-slate-600">Locked system configuration.</span>
            </div>
          </div>
        </section>

        {/* Data Tables & Badges */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">
              4. Data Display & Indian Compliance Rules
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visual presentation of medicines, formatted expiry dates (DD-MMM-YYYY) and Indian
              Rupees (₹).
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">Medicine Name</th>
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5">MRP (In Paise)</th>
                    <th className="px-6 py-3.5 text-right">Inventory Count</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-350">
                  {medicinesSample.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{med.name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{med.batch}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{med.expiry}</td>
                      <td className="px-6 py-4 font-mono text-xs">{formatCurrency(med.mrp)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white">
                        {med.stock} pcs
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            med.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : med.status === 'low_stock'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {med.status === 'active'
                            ? 'Good Shelf Life'
                            : med.status === 'low_stock'
                              ? 'Reorder Warning'
                              : 'Expired / Locked'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Loading, Skeletons, Empty, and Error States */}
        <section className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">5. Asynchronous Application States</h2>
            <p className="text-xs text-slate-400 mt-1">
              Design representations of blank screens, pending loads, and system faults.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Skeleton Loading Card */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-premium">
              <div className="flex justify-between items-center pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Async Load (Skeleton)
                </span>
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-2/3 rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-full rounded bg-slate-800/60 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-slate-800/40 animate-pulse" />
              </div>
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                <div className="h-6 w-16 rounded bg-slate-800 animate-pulse" />
                <div className="h-8 w-20 rounded-lg bg-slate-800 animate-pulse" />
              </div>
            </div>

            {/* Empty State Card */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-premium min-h-[220px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-500 mb-4 border border-slate-800">
                📦
              </div>
              <h4 className="font-bold text-white text-sm">No Batches Available</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mt-1.5 leading-relaxed">
                Add standard products or log a purchase receipt to populate inventory.
              </p>
            </div>

            {/* System Error Card */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-premium min-h-[220px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-4 border border-rose-500/20">
                ⚠️
              </div>
              <h4 className="font-bold text-rose-400 text-sm">Connection Failed</h4>
              <p className="text-xs text-slate-500 max-w-[200px] mt-1.5 leading-relaxed">
                Unable to query Supabase DB endpoints. Check your internet connection.
              </p>
              <button className="mt-4 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-1.5 text-xs text-white font-semibold transition-all">
                Retry Query
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

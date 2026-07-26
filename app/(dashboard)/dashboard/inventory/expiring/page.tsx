'use client';

import React, { useState, useEffect } from 'react';
import { MedicineBatch } from '@/types';
import { MOCK_BATCHES } from '@/services/mock-data';
import Link from 'next/link';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntilExpiry(expiryDate: string): number {
  return Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getExpiryBadge(days: number): { label: string; style: string } {
  if (days < 0) return { label: 'Expired', style: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (days <= 30)
    return { label: `${days}d`, style: 'bg-red-500/10 text-red-400 border-red-500/20' };
  if (days <= 60)
    return { label: `${days}d`, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  return { label: `${days}d`, style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
}

type Period = 30 | 60 | 90;

export default function ExpiringPage() {
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [period, setPeriod] = useState<Period>(90);

  useEffect(() => {
    const near = MOCK_BATCHES.filter((b) => {
      const days = daysUntilExpiry(b.expiryDate);
      return days <= period;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    setBatches(near);
  }, [period]);

  const expired = batches.filter((b) => daysUntilExpiry(b.expiryDate) < 0);
  const critical = batches.filter((b) => {
    const d = daysUntilExpiry(b.expiryDate);
    return d >= 0 && d <= 30;
  });
  const warning = batches.filter((b) => {
    const d = daysUntilExpiry(b.expiryDate);
    return d > 30 && d <= 60;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Expiry Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Monitor near-expiry and expired batches to prevent losses.
          </p>
        </div>
        <div className="flex gap-2">
          {([30, 60, 90] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${period === p ? 'bg-amber-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              Within {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-5">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider">🚫 Expired</p>
          <p className="text-3xl font-extrabold text-red-400 mt-1">{expired.length}</p>
          <p className="text-xs text-slate-500 mt-1">Batches past expiry date</p>
        </div>
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-5">
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            ⚠️ Critical (≤30 days)
          </p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{critical.length}</p>
          <p className="text-xs text-slate-500 mt-1">Batches expiring within 30 days</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-5">
          <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
            ⏳ Warning (≤60 days)
          </p>
          <p className="text-3xl font-extrabold text-yellow-400 mt-1">{warning.length}</p>
          <p className="text-xs text-slate-500 mt-1">Batches expiring within 60 days</p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-white font-semibold">No medicines expiring within {period} days!</p>
          <p className="text-slate-400 text-sm mt-1">Your inventory expiry status looks healthy.</p>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    'Medicine',
                    'Batch No.',
                    'Expiry Date',
                    'Days Left',
                    'Stock',
                    'Supplier',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batches.map((batch) => {
                  const days = daysUntilExpiry(batch.expiryDate);
                  const badge = getExpiryBadge(days);
                  return (
                    <tr
                      key={batch.id}
                      className={`transition-colors ${days < 0 ? 'bg-red-500/5' : days <= 30 ? 'bg-amber-500/5' : 'hover:bg-slate-900/40'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{batch.medicineName}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-xs">
                        {batch.batchNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">
                        {formatDate(batch.expiryDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${batch.currentStock <= 10 ? 'text-red-400' : 'text-white'}`}
                        >
                          {batch.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {batch.supplierName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href="/dashboard/inventory/adjustments"
                            className="text-xs text-amber-400 hover:text-amber-300"
                          >
                            Adjust
                          </Link>
                          <Link
                            href="/dashboard/purchases/new"
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            Reorder
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

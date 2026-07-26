'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PurchaseOrderStatus } from '@/types';
import { MOCK_SUPPLIERS } from '@/services/mock-data';

function formatCurrency(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}

export default function NewPurchaseOrderPage() {
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;
    setSaving(true);
    const { createPurchaseOrder } = await import('@/services/purchase.service');
    const supplier = MOCK_SUPPLIERS.find((s) => s.id === supplierId);
    await createPurchaseOrder({
      supplierId,
      supplierName: supplier?.name,
      totalInPaise: 0,
      notes,
      expectedDelivery: expectedDelivery || undefined,
      storeId: 'store_01',
      status: PurchaseOrderStatus.DRAFT,
    });
    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-xl font-bold text-white">Purchase Order Created</h3>
        <p className="text-slate-400 text-sm">
          The draft purchase order has been saved. You can now add items and send it to the
          supplier.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/purchases"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm transition-all"
          >
            View All Orders
          </Link>
          <button
            onClick={() => {
              setSaved(false);
              setSupplierId('');
              setNotes('');
              setExpectedDelivery('');
            }}
            className="rounded-xl border border-slate-700 text-slate-400 font-semibold px-6 py-2.5 text-sm hover:bg-slate-900"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/purchases"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Purchases
        </Link>
        <span className="text-slate-700">/</span>
        <h2 className="text-xl font-extrabold text-white">New Purchase Order</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6"
      >
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Supplier *
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">— Select a supplier —</option>
            {MOCK_SUPPLIERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.city}
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/suppliers"
            className="text-xs text-indigo-400 hover:underline mt-1 block"
          >
            + Add a new supplier first →
          </Link>
        </div>
        {supplierId && (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-1">
            {(() => {
              const s = MOCK_SUPPLIERS.find((s) => s.id === supplierId);
              return s ? (
                <>
                  <p className="text-slate-300 font-semibold">{s.name}</p>
                  <p className="text-slate-500">
                    {s.phone} · {s.email}
                  </p>
                  <p className="text-slate-500">Payment Terms: Net {s.paymentTermsDays} days</p>
                  {s.outstandingBalanceInPaise > 0 && (
                    <p className="text-red-400 font-semibold">
                      ⚠️ Outstanding: {formatCurrency(s.outstandingBalanceInPaise)}
                    </p>
                  )}
                </>
              ) : null;
            })()}
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Expected Delivery Date
          </label>
          <input
            type="date"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Urgent medicines, special instructions..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
          💡 After creating the order, you can add specific medicine items and send it to the
          supplier.
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/purchases"
            className="flex-1 rounded-xl border border-slate-700 text-slate-400 font-semibold py-2.5 text-sm hover:bg-slate-900 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !supplierId}
            className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              'Create Purchase Order →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

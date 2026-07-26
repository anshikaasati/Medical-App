'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Supplier } from '@/types';
import { getSupplierById } from '@/services/supplier.service';
import { MOCK_PURCHASE_ORDERS } from '@/services/mock-data';

function formatCurrency(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getSupplierById(params.id).then((data) => {
        setSupplier(data);
        setLoading(false);
      });
    }
  }, [params.id]);

  const supplierOrders = MOCK_PURCHASE_ORDERS.filter((po) => po.supplierId === params.id);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  if (!supplier)
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Supplier not found.</p>
        <Link
          href="/dashboard/suppliers"
          className="text-indigo-400 hover:underline text-sm mt-2 block"
        >
          ← Back to Suppliers
        </Link>
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/suppliers"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Suppliers
        </Link>
        <span className="text-slate-700">/</span>
        <h2 className="text-xl font-extrabold text-white">{supplier.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Total Purchases
          </p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatCurrency(supplier.totalPurchasesInPaise)}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Outstanding Balance
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 font-mono ${supplier.outstandingBalanceInPaise > 0 ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {formatCurrency(supplier.outstandingBalanceInPaise)}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Payment Terms</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">
            Net {supplier.paymentTermsDays}d
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Contact Information
          </h3>
          {[
            { label: 'Phone', value: supplier.phone },
            { label: 'Email', value: supplier.email || '—' },
            {
              label: 'City',
              value: [supplier.city, supplier.state].filter(Boolean).join(', ') || '—',
            },
            { label: 'GSTIN', value: supplier.gstin || '—' },
            { label: 'Drug License', value: supplier.drugLicenseNo || '—' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-semibold text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Quick Actions
          </h3>
          <Link
            href="/dashboard/purchases/new"
            className="flex items-center gap-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 text-sm transition-all"
          >
            📦 Create Purchase Order
          </Link>
          <button className="flex items-center gap-2 w-full rounded-xl border border-slate-700 text-slate-300 font-semibold py-2.5 px-4 text-sm hover:bg-slate-900 transition-all">
            💸 Record Payment
          </button>
          <button className="flex items-center gap-2 w-full rounded-xl border border-slate-700 text-slate-300 font-semibold py-2.5 px-4 text-sm hover:bg-slate-900 transition-all">
            📞 Contact Supplier
          </button>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Purchase History</h3>
        </div>
        {supplierOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No purchase orders found for this supplier.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {supplierOrders.map((po) => (
              <div
                key={po.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-900/40 transition-colors"
              >
                <div>
                  <Link
                    href={`/dashboard/purchases/${po.id}`}
                    className="font-mono text-indigo-400 hover:underline text-sm font-semibold"
                  >
                    {po.orderNumber}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(po.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white font-semibold">
                    {formatCurrency(po.totalInPaise)}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      po.status === 'RECEIVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : po.status === 'SENT'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

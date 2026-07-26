'use client';

import React, { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { getAllPurchaseOrders, updatePurchaseOrderStatus } from '@/services/purchase.service';
import Link from 'next/link';

const STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PARTIAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

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

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PurchaseOrderStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getAllPurchaseOrders('store_01').then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const totals = {
    all: orders.length,
    draft: orders.filter((o) => o.status === PurchaseOrderStatus.DRAFT).length,
    sent: orders.filter((o) => o.status === PurchaseOrderStatus.SENT).length,
    partial: orders.filter((o) => o.status === PurchaseOrderStatus.PARTIAL).length,
    received: orders.filter((o) => o.status === PurchaseOrderStatus.RECEIVED).length,
  };

  const handleMarkReceived = async (id: string) => {
    setUpdatingId(id);
    const updated = await updatePurchaseOrderStatus(id, PurchaseOrderStatus.RECEIVED);
    if (updated) setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Purchase Orders</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track incoming stock, supplier orders and deliveries.
          </p>
        </div>
        <Link
          href="/dashboard/purchases/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-md"
        >
          + New Purchase Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'All Orders', value: totals.all, filter: 'ALL' as const },
          { label: 'Draft', value: totals.draft, filter: PurchaseOrderStatus.DRAFT },
          { label: 'Sent', value: totals.sent, filter: PurchaseOrderStatus.SENT },
          { label: 'Partial', value: totals.partial, filter: PurchaseOrderStatus.PARTIAL },
          { label: 'Received', value: totals.received, filter: PurchaseOrderStatus.RECEIVED },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filter)}
            className={`bg-slate-950 border rounded-2xl p-4 text-left transition-all ${filter === stat.filter ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Order No.', 'Supplier', 'Status', 'Expected', 'Total', 'Created', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No purchase orders found.{' '}
                    <Link
                      href="/dashboard/purchases/new"
                      className="text-indigo-400 hover:underline"
                    >
                      Create one →
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/purchases/${order.id}`}
                        className="font-mono text-indigo-400 hover:underline text-xs font-semibold"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold">{order.supplierName}</p>
                      {order.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {order.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {order.expectedDelivery ? formatDate(order.expectedDelivery) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-white">
                      {formatCurrency(order.totalInPaise)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/purchases/${order.id}`}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          View
                        </Link>
                        {(order.status === PurchaseOrderStatus.SENT ||
                          order.status === PurchaseOrderStatus.PARTIAL) && (
                          <button
                            onClick={() => handleMarkReceived(order.id)}
                            disabled={updatingId === order.id}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                          >
                            {updatingId === order.id ? 'Updating...' : 'Mark Received'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

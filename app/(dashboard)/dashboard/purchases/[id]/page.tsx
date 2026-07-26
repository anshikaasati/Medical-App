'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { getPurchaseOrderById, updatePurchaseOrderStatus } from '@/services/purchase.service';

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      getPurchaseOrderById(params.id).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [params.id]);

  const handleStatusChange = async (status: PurchaseOrderStatus) => {
    if (!order) return;
    setUpdating(true);
    const updated = await updatePurchaseOrderStatus(order.id, status);
    if (updated) setOrder(updated);
    setUpdating(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Purchase order not found.</p>
        <Link
          href="/dashboard/purchases"
          className="text-indigo-400 hover:underline text-sm mt-2 block"
        >
          ← Back to Purchases
        </Link>
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/purchases"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Purchases
        </Link>
        <span className="text-slate-700">/</span>
        <h2 className="text-xl font-extrabold text-white">{order.orderNumber}</h2>
        <span
          className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Info */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Order Details
          </h3>
          {[
            { label: 'Supplier', value: order.supplierName },
            { label: 'Order Number', value: order.orderNumber },
            { label: 'Total Amount', value: formatCurrency(order.totalInPaise) },
            {
              label: 'Expected Delivery',
              value: order.expectedDelivery
                ? new Date(order.expectedDelivery).toLocaleDateString('en-GB')
                : '—',
            },
            { label: 'Created', value: formatDate(order.createdAt) },
            { label: 'Last Updated', value: formatDate(order.updatedAt) },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-semibold">{row.value}</span>
            </div>
          ))}
          {order.notes && (
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">Notes:</p>
              {order.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Actions</h3>
          <div className="space-y-2">
            {order.status === PurchaseOrderStatus.DRAFT && (
              <button
                onClick={() => handleStatusChange(PurchaseOrderStatus.SENT)}
                disabled={updating}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 text-sm transition-all disabled:opacity-50"
              >
                📤 Mark as Sent to Supplier
              </button>
            )}
            {(order.status === PurchaseOrderStatus.SENT ||
              order.status === PurchaseOrderStatus.PARTIAL) && (
              <button
                onClick={() => handleStatusChange(PurchaseOrderStatus.RECEIVED)}
                disabled={updating}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-sm transition-all disabled:opacity-50"
              >
                ✅ Confirm Stock Received
              </button>
            )}
            {order.status !== PurchaseOrderStatus.CANCELLED &&
              order.status !== PurchaseOrderStatus.RECEIVED && (
                <button
                  onClick={() => handleStatusChange(PurchaseOrderStatus.CANCELLED)}
                  disabled={updating}
                  className="w-full rounded-xl border border-red-500/30 text-red-400 font-semibold py-2.5 text-sm hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  🚫 Cancel Order
                </button>
              )}
            {order.status === PurchaseOrderStatus.RECEIVED && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-400 text-center">
                ✅ This order has been received. Stock has been updated.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

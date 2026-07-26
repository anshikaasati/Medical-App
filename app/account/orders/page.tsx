/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase bill rows for order summaries */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FormattedCurrency, FormattedDate } from '@/components/shared/Formatter';

export default function CustomerOrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);

      // 1. Load simulated/test checkout orders from localStorage
      const savedOrders = localStorage.getItem('storefront_orders');
      let localOrders: any[] = [];
      if (savedOrders) {
        try {
          localOrders = JSON.parse(savedOrders).map((ord: any) => ({
            id: ord.id,
            created_at: ord.date,
            total_amount_paise: ord.total_amount_paise,
            status: ord.status,
            items: ord.items,
          }));
        } catch {
          localOrders = [];
        }
      }

      try {
        // 2. Fetch live logged in user DB orders
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: dbOrders } = await supabase
            .from('bills')
            .select(
              `
              id,
              created_at,
              total_amount_paise,
              status
            `
            )
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false });

          if (dbOrders && dbOrders.length > 0) {
            const formattedDb = dbOrders.map((ord) => ({
              id: ord.id,
              created_at: ord.created_at,
              total_amount_paise: ord.total_amount_paise,
              status: ord.status === 'finalized' ? 'Paid' : 'Pending',
              items: 'Prescription Checkout Order',
            }));

            // Merge local and DB orders (prioritize DB orders, then append local)
            const combined = [
              ...formattedDb,
              ...localOrders.filter((lo) => !formattedDb.some((do_ord) => do_ord.id === lo.id)),
            ];
            setOrders(combined);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local orders
      }

      setOrders(localOrders);
      setLoading(false);
    }

    loadOrders();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-transparent inline-block" />
          <p className="text-xs font-semibold text-slate-500 font-sans">
            Retrieving order ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans px-4 sm:px-6">
      {/* Navigation header */}
      <div className="space-y-4">
        <Link
          href="/shop"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          ← Return to Storefront
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="text-sm text-slate-500">
            View details and tracking history of your online medicine checkouts.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-4 mx-auto">
            📦
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No orders recorded</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
            You haven&apos;t placed any online storefront orders yet. Items checked out via Razorpay
            will be listed here.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 transition-colors"
          >
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    TRANSACTION ID
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">
                      ORDER DATE
                    </span>
                    <span className="font-semibold text-slate-700">
                      <FormattedDate dateString={order.created_at} />
                    </span>
                  </div>

                  <span className="inline-flex rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase mb-1">
                    ITEMS ORDERED
                  </span>
                  <p className="text-slate-800 font-semibold text-xs leading-relaxed max-w-lg">
                    {order.items}
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="block text-[9px] text-slate-500 font-bold uppercase">
                    NET PAID
                  </span>
                  <span className="font-mono text-base font-extrabold text-emerald-650">
                    <FormattedCurrency paise={order.total_amount_paise} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

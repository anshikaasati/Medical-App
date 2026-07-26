/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase bill returns payload relation shape */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { FormattedCurrency } from '@/components/shared/Formatter';

export default function ReturnsConsolePage() {
  const supabase = createClient();

  // Search states
  const [billSearchId, setBillSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active loaded bill states
  const [loadedBill, setLoadedBill] = useState<any>(null);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  // Fetch bill by ID
  const handleSearchBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billSearchId.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadedBill(null);
    setBillItems([]);
    setReturnQuantities({});

    try {
      const { data: billData, error: billErr } = await supabase
        .from('bills')
        .select(
          `
          id,
          created_at,
          status,
          total_amount_paise,
          customers (name, phone)
        `
        )
        .eq('id', billSearchId.trim())
        .single();

      if (billErr || !billData) {
        setErrorMsg('No bill record found for the provided ID.');
        setLoading(false);
        return;
      }

      // Fetch items of the bill
      const { data: itemsData, error: itemsErr } = await supabase
        .from('bill_items')
        .select(
          `
          id,
          quantity,
          unit_price_paise,
          gst_amount_paise,
          mrp_paise,
          batch_id,
          medicine_batches (
            batch_number,
            medicines (name)
          )
        `
        )
        .eq('bill_id', billSearchId.trim());

      if (itemsErr || !itemsData || itemsData.length === 0) {
        setErrorMsg('Failed to retrieve items associated with this invoice.');
        setLoading(false);
        return;
      }

      setLoadedBill(billData);

      const formattedItems = itemsData.map((item: any) => ({
        id: item.id,
        batch_id: item.batch_id,
        quantity: item.quantity,
        unit_price_paise: item.unit_price_paise,
        mrp_paise: item.mrp_paise,
        batch_number: item.medicine_batches?.batch_number || '—',
        medicine_name: item.medicine_batches?.medicines?.name || 'Unknown Medicine',
      }));

      setBillItems(formattedItems);

      // Initialize return quantities to 0
      const initialQtys: Record<string, number> = {};
      formattedItems.forEach((it) => {
        initialQtys[it.id] = 0;
      });
      setReturnQuantities(initialQtys);
    } catch {
      setErrorMsg('Unexpected error querying bill records.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnQtyChange = (itemId: string, val: number, max: number) => {
    setReturnQuantities((curr) => ({
      ...curr,
      [itemId]: Math.max(0, Math.min(max, val)),
    }));
  };

  const handleProcessReturn = async () => {
    const activeReturns = Object.entries(returnQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const item = billItems.find((it) => it.id === itemId);
        return {
          bill_item_id: itemId,
          batch_id: item.batch_id,
          quantity: qty,
          unit_price_paise: item.unit_price_paise,
        };
      });

    if (activeReturns.length === 0) {
      setErrorMsg('Please specify at least one item and quantity to return.');
      return;
    }

    setProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Session expired. Please log in.');
        setProcessing(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setErrorMsg('Failed to resolve cashier profile.');
        setProcessing(false);
        return;
      }

      const storeId = profile.store_id;

      // Calculate total refund amount
      const refundTotal = activeReturns.reduce(
        (sum, item) => sum + item.unit_price_paise * item.quantity,
        0
      );

      // Create return record in transaction (nested calls)
      const { data: returnRec, error: returnErr } = await supabase
        .from('bill_returns')
        .insert({
          store_id: storeId,
          bill_id: loadedBill.id,
          returned_items: activeReturns,
          refund_amount_paise: refundTotal,
        })
        .select('id')
        .single();

      if (returnErr || !returnRec) {
        setErrorMsg('Failed to log return header: ' + returnErr.message);
        setProcessing(false);
        return;
      }

      // Log stock movement returns inside ledger (each returned item adds back to stock!)
      for (const item of activeReturns) {
        const { error: moveErr } = await supabase.from('stock_movements').insert({
          store_id: storeId,
          batch_id: item.batch_id,
          type: 'return',
          quantity: item.quantity,
          reference_id: loadedBill.id,
          user_id: user.id,
          notes: `POS Bill Return reference - Bill ID: ${loadedBill.id.slice(0, 8)}`,
        });

        if (moveErr) {
          setErrorMsg('Failed to log stock movement: ' + moveErr.message);
          setProcessing(false);
          return;
        }
      }

      setSuccessMsg('Returns committed. Stock levels restored.');
      setLoadedBill(null);
      setBillItems([]);
      setReturnQuantities({});
      setBillSearchId('');
    } catch {
      setErrorMsg('Unexpected exception during return transaction.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Nav */}
      <div className="space-y-4">
        <Link
          href="/dashboard/billing"
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
        >
          ← Back to Billing Counter
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            POS Returns Console
          </h2>
          <p className="text-sm text-slate-400">
            Process sales returns, restore inventory counts, and calculate refund totals.
          </p>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Find Billed Invoice
        </h3>

        <form onSubmit={handleSearchBill} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="Input exact Bill Invoice UUID (e.g. d3b07384...)"
            value={billSearchId}
            onChange={(e) => setBillSearchId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-6 py-2.5 transition-all shadow active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Locate Bill'}
          </button>
        </form>

        {errorMsg && (
          <div className="border border-rose-500/20 bg-rose-500/10 p-3 rounded-lg text-xs text-rose-400 leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="border border-emerald-500/20 bg-emerald-500/10 p-3 rounded-lg text-xs text-emerald-400 leading-relaxed">
            ✅ {successMsg}
          </div>
        )}
      </div>

      {/* Bill Items Return Form */}
      {loadedBill && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium space-y-6 p-6">
          <div className="flex justify-between items-center border-b border-slate-850 pb-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                LOADED INVOICE ID
              </span>
              <span className="font-mono text-sm font-bold text-white">{loadedBill.id}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">
                TOTAL BILLED AMOUNT
              </span>
              <span className="font-mono text-sm font-bold text-teal-400">
                <FormattedCurrency paise={loadedBill.total_amount_paise} />
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Billed Items to Return
            </h4>

            <div className="overflow-x-auto border border-slate-850 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Medicine Name</th>
                    <th className="px-6 py-3.5">Batch Code</th>
                    <th className="px-6 py-3.5 text-right">Unit Price</th>
                    <th className="px-6 py-3.5 text-center">Billed Qty</th>
                    <th className="px-6 py-3.5 text-center">Return Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {billItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 font-bold text-white">{item.medicine_name}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{item.batch_number}</td>
                      <td className="px-6 py-4 text-right font-mono">
                        <FormattedCurrency paise={item.unit_price_paise} />
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-semibold text-slate-400">
                        {item.quantity} pcs
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                          <button
                            onClick={() =>
                              handleReturnQtyChange(
                                item.id,
                                returnQuantities[item.id] - 1,
                                item.quantity
                              )
                            }
                            className="h-6 w-6 rounded bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={returnQuantities[item.id] || 0}
                            onChange={(e) =>
                              handleReturnQtyChange(
                                item.id,
                                parseInt(e.target.value, 10) || 0,
                                item.quantity
                              )
                            }
                            className="w-10 bg-transparent text-center font-mono font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() =>
                              handleReturnQtyChange(
                                item.id,
                                returnQuantities[item.id] + 1,
                                item.quantity
                              )
                            }
                            className="h-6 w-6 rounded bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Refund summary */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                REFUND VALUE CALCULATED
              </span>
              <span className="font-mono text-2xl font-extrabold text-teal-400">
                <FormattedCurrency
                  paise={billItems.reduce(
                    (sum, item) => sum + item.unit_price_paise * (returnQuantities[item.id] || 0),
                    0
                  )}
                />
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLoadedBill(null)}
                className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-450 px-5 py-2.5 text-xs font-semibold transition-all"
              >
                Reset Form
              </button>
              <Button
                onClick={handleProcessReturn}
                disabled={
                  processing ||
                  billItems.reduce((sum, item) => sum + (returnQuantities[item.id] || 0), 0) === 0
                }
                className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-2.5 text-xs rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {processing ? 'Logging Refund...' : 'Finalize Return Refund'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

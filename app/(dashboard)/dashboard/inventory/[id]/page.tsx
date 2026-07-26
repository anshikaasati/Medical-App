/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase batch and user details join schema */
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FormattedCurrency, FormattedDate } from '@/components/shared/Formatter';

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [, startTransition] = useTransition();

  const id = params.id as string;

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Core medicine data states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState('12');
  const [batches, setBatches] = useState<any[]>([]); // type matches database batch schema
  const [movements, setMovements] = useState<any[]>([]); // type matches nested ledger timeline logs

  // Adjustment form states
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<
    'purchase_in' | 'sale_out' | 'return' | 'damage' | 'transfer'
  >('damage');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  // Fallback seed content if Supabase returns nothing
  const loadFallbackData = () => {
    setName('Amoxicillin 500mg');
    setCategory('Antibiotics');
    setHsnCode('30041010');
    setGstRate('12');
    setBatches([
      {
        id: 'b_01',
        batch_number: 'AMX-26A',
        expiry_date: '2028-09-15',
        manufacturing_date: '2026-03-01',
        purchase_price_paise: 9500,
        selling_price_paise: 14500,
        mrp_paise: 14500,
        current_stock: 350,
      },
      {
        id: 'b_02',
        batch_number: 'AMX-26B',
        expiry_date: '2026-08-20',
        manufacturing_date: '2026-02-10',
        purchase_price_paise: 9500,
        selling_price_paise: 14500,
        mrp_paise: 14500,
        current_stock: 120,
      },
    ]);
    setMovements([
      {
        id: 'mv_01',
        created_at: '2026-07-25T10:30:00Z',
        type: 'purchase_in',
        quantity: 350,
        notes: 'Initial stock intake logged on batch creation',
        batch_number: 'AMX-26A',
        user_name: 'Dr. Anshika Asati (Owner)',
      },
      {
        id: 'mv_02',
        created_at: '2026-07-26T14:45:00Z',
        type: 'sale_out',
        quantity: 5,
        notes: 'POS Sale Reference #INVC-4409',
        batch_number: 'AMX-26A',
        user_name: 'Staff Clerk (Cashier)',
      },
      {
        id: 'mv_03',
        created_at: '2026-07-26T18:10:00Z',
        type: 'damage',
        quantity: 2,
        notes: 'Moisture spoilage inside cabinet B',
        batch_number: 'AMX-26B',
        user_name: 'Dr. Anshika Asati (Owner)',
      },
    ]);
    setSelectedBatchId('b_01');
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch medicine info
        const { data: medData, error: medError } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)
          .single();

        if (medError || !medData) {
          loadFallbackData();
          setLoading(false);
          return;
        }

        setName(medData.name);
        setCategory(medData.category);
        setHsnCode(medData.hsn_code || '');
        setGstRate(String(medData.gst_rate));

        // Fetch batches
        const { data: batchData } = await supabase
          .from('medicine_batches')
          .select('*')
          .eq('medicine_id', id);

        const activeBatches = batchData || [];
        setBatches(activeBatches);
        if (activeBatches.length > 0) {
          setSelectedBatchId(activeBatches[0].id);
        }

        // Fetch stock movements timeline (resolving batch numbers and user names)
        const batchIds = activeBatches.map((b) => b.id);
        if (batchIds.length > 0) {
          const { data: moveData } = await supabase
            .from('stock_movements')
            .select(
              `
              id,
              created_at,
              type,
              quantity,
              notes,
              batch_id,
              user_id,
              medicine_batches (batch_number),
              users (name, role)
            `
            )
            .in('batch_id', batchIds)
            .order('created_at', { ascending: false });

          if (moveData) {
            const formattedMoves = moveData.map((m: any /* database ledger movement join */) => ({
              id: m.id,
              created_at: m.created_at,
              type: m.type,
              quantity: m.quantity,
              notes: m.notes,
              batch_number: m.medicine_batches?.batch_number || 'Unknown Batch',
              user_name: m.users?.name ? `${m.users.name} (${m.users.role})` : 'System User',
            }));
            setMovements(formattedMoves);
          }
        }
      } catch {
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, supabase]);

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          name,
          category,
          hsn_code: hsnCode || null,
          gst_rate: parseFloat(gstRate),
        })
        .eq('id', id);

      if (error) {
        setErrorMsg('Failed to update catalog details: ' + error.message);
        setSaving(false);
        return;
      }

      setSuccessMsg('Catalog configurations updated.');
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMsg('Unexpected update error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const qty = parseInt(adjustmentQty, 10);
    if (!selectedBatchId || isNaN(qty) || qty <= 0) {
      setErrorMsg('Please specify a valid quantity greater than zero.');
      return;
    }

    // 1. Snapshot previous state for rollback on error
    const previousMovements = [...movements];
    const previousBatches = [...batches];

    // Find the target batch details for optimistic display
    const targetBatch = batches.find((b) => b.id === selectedBatchId);
    const targetBatchNumber = targetBatch ? targetBatch.batch_number : 'Selected Batch';

    // 2. Optimistic UI Updates
    // Formulate new movement object
    const optimisticMovement = {
      id: `opt_${Date.now()}`,
      created_at: new Date().toISOString(),
      type: adjustmentType,
      quantity: qty,
      notes: adjustmentNotes || 'Manual inventory correction',
      batch_number: targetBatchNumber,
      user_name: 'You (Optimistic Update)',
    };

    // Calculate stock direction based on ledger types
    // 'purchase_in', 'return' increase stock.
    // 'sale_out', 'damage', 'transfer' reduce stock.
    const isIntake = ['purchase_in', 'return'].includes(adjustmentType);
    const updatedBatches = batches.map((b) => {
      if (b.id === selectedBatchId) {
        const currentVal = b.current_stock;
        const newVal = isIntake ? currentVal + qty : Math.max(0, currentVal - qty);
        return { ...b, current_stock: newVal };
      }
      return b;
    });

    setMovements([optimisticMovement, ...movements]);
    setBatches(updatedBatches);
    setAdjustmentQty('');
    setAdjustmentNotes('');

    // 3. Make real database insert in background
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Unauthenticated session');
      }

      const { data: profile } = await supabase
        .from('users')
        .select('store_id, name, role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile resolution failed');
      }

      const { data: moveResult, error: moveError } = await supabase
        .from('stock_movements')
        .insert({
          store_id: profile.store_id,
          batch_id: selectedBatchId,
          type: adjustmentType,
          quantity: qty,
          notes: adjustmentNotes || 'Manual inventory correction',
          user_id: user.id,
        })
        .select('id, created_at')
        .single();

      if (moveError || !moveResult) {
        throw new Error(moveError?.message || 'Database insert failed');
      }

      // Replace optimistic movement with actual database response
      setMovements((curr) =>
        curr.map((m) =>
          m.id === optimisticMovement.id
            ? {
                ...m,
                id: moveResult.id,
                created_at: moveResult.created_at,
                user_name: `${profile.name} (${profile.role})`,
              }
            : m
        )
      );
      setSuccessMsg('Ledger entry logged successfully!');

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any /* error response object */) {
      // 4. Rollback state on failure!
      setMovements(previousMovements);
      setBatches(previousBatches);
      setErrorMsg(`Adjustment failed to commit. Rolled back. Details: ${err.message || err}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent inline-block" />
          <p className="text-xs font-semibold text-slate-500">Querying product ledger details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Back Button */}
      <div className="space-y-2">
        <Link
          href="/dashboard/inventory"
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
        >
          ← Back to Inventory List
        </Link>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {name || 'Product Details'}
          </h2>
          <span className="inline-flex rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            ID: {id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="border border-rose-500/20 bg-rose-500/10 p-4 rounded-xl text-xs font-medium text-rose-400 flex items-start gap-2.5">
          <span className="shrink-0 text-sm">⚠️</span>
          <p>{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="border border-emerald-500/20 bg-emerald-500/10 p-4 rounded-xl text-xs font-medium text-emerald-400 flex items-start gap-2.5">
          <span className="shrink-0 text-sm">✅</span>
          <p>{successMsg}</p>
        </div>
      )}

      {/* Grid: Left Column = Edit & Batches / Right Column = Ledger Timeline & Adjustments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Form */}
          <form
            onSubmit={handleUpdateMedicine}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-900 pb-2">
              Catalog Configurations
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  HSN Code
                </label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  GST Rate Selection
                </label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="0">0% (GST Exempt)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-900">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-5 py-2.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                Save Changes
              </button>
            </div>
          </form>

          {/* Active Batches list */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-900 pb-2">
              Active Batches & Expiry Dates
            </h3>

            {batches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">
                No active batch registers exist for this product.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((b) => {
                  return (
                    <div
                      key={b.id}
                      className="border border-slate-800 bg-slate-900/40 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                            BATCH CODE
                          </span>
                          <span className="font-mono text-sm font-bold text-white">
                            {b.batch_number}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">
                            EXPIRY
                          </span>
                          <span className="font-mono text-xs text-slate-300 font-semibold">
                            <FormattedDate dateString={b.expiry_date} />
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-3 text-[10px] font-semibold text-slate-500">
                        <div>
                          <span className="block">Cost</span>
                          <span className="text-slate-350 text-xs font-mono">
                            <FormattedCurrency paise={b.purchase_price_paise} />
                          </span>
                        </div>
                        <div>
                          <span className="block">Sell Price</span>
                          <span className="text-slate-350 text-xs font-mono">
                            <FormattedCurrency paise={b.selling_price_paise} />
                          </span>
                        </div>
                        <div>
                          <span className="block">MRP</span>
                          <span className="text-slate-350 text-xs font-mono">
                            <FormattedCurrency paise={b.mrp_paise} />
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500">CURRENT STOCK</span>
                        <span className="font-mono text-sm font-bold text-teal-400">
                          {b.current_stock} pcs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-8">
          {/* Add Adjustment Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-900 pb-2">
              Log Stock Adjustment
            </h3>

            {batches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Create a batch first to enable adjustments.
              </p>
            ) : (
              <form onSubmit={handleLogAdjustment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Select Target Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none cursor-pointer"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_number} (Stock: {b.current_stock} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Adjustment Type
                    </label>
                    <select
                      value={adjustmentType}
                      onChange={(e) =>
                        setAdjustmentType(
                          e.target.value as any /* type matches select type options */
                        )
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value="damage">Damage Log (-)</option>
                      <option value="transfer">Store Transfer (-)</option>
                      <option value="purchase_in">Purchase Stock (+)</option>
                      <option value="return">Return (+)</option>
                      <option value="sale_out">Manual POS Sale (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Quantity (pcs)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5"
                      value={adjustmentQty}
                      onChange={(e) => setAdjustmentQty(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Internal Notes / Audit Reason
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Broken vial during cabinet sorting"
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none placeholder-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2.5 transition-all shadow-md active:scale-[0.98]"
                >
                  Commit Ledger Adjustment
                </button>
              </form>
            )}
          </div>

          {/* Timeline of Stock Movements */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400">
                Stock Movements Ledger
              </h3>
              <span className="rounded bg-slate-900 border border-slate-850 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 font-mono">
                {movements.length} logs
              </span>
            </div>

            {movements.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No transaction logs recorded.
              </p>
            ) : (
              <div className="relative pl-6 border-l border-slate-800 space-y-6 text-xs">
                {movements.map((move) => {
                  const isPositive = ['purchase_in', 'return'].includes(move.type);
                  return (
                    <div key={move.id} className="relative space-y-1">
                      {/* Timeline dot marker */}
                      <span
                        className={`absolute -left-[30px] top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />

                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200 uppercase tracking-wide text-[10px]">
                          {move.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(move.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-2 rounded-lg">
                        <div>
                          <span className="block text-[10px] text-slate-400">
                            Batch: {move.batch_number}
                          </span>
                          {move.notes && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">
                              &quot;{move.notes}&quot;
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : '-'}
                            {move.quantity} pcs
                          </span>
                        </div>
                      </div>

                      <span className="block text-[9px] text-slate-650 font-semibold text-right">
                        Logged by: {move.user_name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested database supplier relation shapes */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function NewMedicinePage() {
  const router = useRouter();
  const supabase = createClient();

  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]); // type matches database supplier records
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields - Medicine Details
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState('12');

  // Form Fields - Initial Batch Details
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [purchasePriceRupees, setPurchasePriceRupees] = useState('');
  const [sellingPriceRupees, setSellingPriceRupees] = useState('');
  const [mrpRupees, setMrpRupees] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [supplierId, setSupplierId] = useState('');

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const { data, error } = await supabase.from('suppliers').select('id, name');

        if (!error && data && data.length > 0) {
          setSuppliers(data);
          setSupplierId(data[0].id);
        } else {
          // If no suppliers exist in the DB, fallback to seed list
          const seedSuppliers = [
            { id: 'sup_01', name: 'MedLife Distributors Ltd' },
            { id: 'sup_02', name: 'Astra Health Warehousing' },
          ];
          setSuppliers(seedSuppliers);
          setSupplierId(seedSuppliers[0].id);
        }
      } catch {
        // Silent catch fallback
      }
    }
    loadSuppliers();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simple validations
    if (
      !name ||
      !batchNumber ||
      !expiryDate ||
      !purchasePriceRupees ||
      !sellingPriceRupees ||
      !mrpRupees ||
      !initialStock
    ) {
      setErrorMsg('Please populate all required fields.');
      setLoading(false);
      return;
    }

    try {
      // 1. Resolve active user and store_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setErrorMsg('Failed to resolve active store location.');
        setLoading(false);
        return;
      }

      const storeId = profile.store_id;

      // 2. Conver price and quantity inputs (stored as lowest units: paise / integers)
      const costPaise = Math.round(parseFloat(purchasePriceRupees) * 100);
      const sellPaise = Math.round(parseFloat(sellingPriceRupees) * 100);
      const mrpPaise = Math.round(parseFloat(mrpRupees) * 100);
      const stockCount = parseInt(initialStock, 10);

      if (isNaN(costPaise) || isNaN(sellPaise) || isNaN(mrpPaise) || isNaN(stockCount)) {
        setErrorMsg('Invalid price or stock count. Please input numerical values.');
        setLoading(false);
        return;
      }

      // Verify supplier exists (insert default if not found)
      let resolvedSupplierId = supplierId;
      if (suppliers.length === 0 || !resolvedSupplierId) {
        // Create a default supplier
        const { data: defaultSup, error: supErr } = await supabase
          .from('suppliers')
          .insert({
            store_id: storeId,
            name: 'Default Wholesale Supplier',
            phone: '9999999999',
          })
          .select('id')
          .single();

        if (supErr || !defaultSup) {
          setErrorMsg('Failed to initialize default supplier: ' + (supErr?.message || 'unknown'));
          setLoading(false);
          return;
        }
        resolvedSupplierId = defaultSup.id;
      }

      // 3. Begin SQL Transaction
      // Step A: Insert Medicine
      const { data: medResult, error: medError } = await supabase
        .from('medicines')
        .insert({
          store_id: storeId,
          name,
          category: category || 'General',
          hsn_code: hsnCode || null,
          gst_rate: parseFloat(gstRate),
        })
        .select('id')
        .single();

      if (medError || !medResult) {
        setErrorMsg('Failed to create medicine entry: ' + medError.message);
        setLoading(false);
        return;
      }

      const newMedicineId = medResult.id;

      // Step B: Insert Batch (current_stock starts at 0, updated by movements ledger trigger)
      const { data: batchResult, error: batchError } = await supabase
        .from('medicine_batches')
        .insert({
          store_id: storeId,
          medicine_id: newMedicineId,
          batch_number: batchNumber,
          expiry_date: expiryDate,
          manufacturing_date: manufacturingDate || null,
          purchase_price_paise: costPaise,
          selling_price_paise: sellPaise,
          mrp_paise: mrpPaise,
          supplier_id: resolvedSupplierId,
          current_stock: 0,
        })
        .select('id')
        .single();

      if (batchError || !batchResult) {
        // Attempt clean up of orphaned medicine record
        await supabase.from('medicines').delete().eq('id', newMedicineId);
        setErrorMsg('Failed to create batch entry: ' + batchError.message);
        setLoading(false);
        return;
      }

      const newBatchId = batchResult.id;

      // Step C: Insert initial stock movement to populate trigger-maintained current_stock count
      const { error: moveError } = await supabase.from('stock_movements').insert({
        store_id: storeId,
        batch_id: newBatchId,
        type: 'purchase_in',
        quantity: stockCount,
        notes: 'Initial stock intake logged on batch creation',
        user_id: user.id,
      });

      if (moveError) {
        // Rollback batch and medicine
        await supabase.from('medicine_batches').delete().eq('id', newBatchId);
        await supabase.from('medicines').delete().eq('id', newMedicineId);
        setErrorMsg('Failed to log initial stock movement: ' + moveError.message);
        setLoading(false);
        return;
      }

      setSuccessMsg('Medicine cataloged and inventory logged successfully!');
      setTimeout(() => {
        router.push('/dashboard/inventory');
        router.refresh();
      }, 1500);
    } catch {
      setErrorMsg('An unexpected error occurred during database insert operations.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav & Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/inventory"
          className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
        >
          ← Back to Inventory List
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Add New Medicine
          </h2>
          <p className="text-sm text-slate-400">
            Catalog a new product and log its initial batch information in the stock ledger.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium"
      >
        {/* Alerts */}
        {errorMsg && (
          <div className="m-6 border border-rose-500/20 bg-rose-500/10 p-4 rounded-xl text-xs font-medium text-rose-400 flex items-start gap-2.5">
            <span className="shrink-0 text-sm">⚠️</span>
            <p>{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="m-6 border border-emerald-500/20 bg-emerald-500/10 p-4 rounded-xl text-xs font-medium text-emerald-400 flex items-start gap-2.5">
            <span className="shrink-0 text-sm">✅</span>
            <p>{successMsg}</p>
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* Section 1: Catalog Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-900 pb-2">
              1. Catalog & Identification
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category / Classification
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Antibiotics, Analgesics"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
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
                  placeholder="e.g. 30041010"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
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
          </div>

          {/* Section 2: Batch and Stock Intake */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-900 pb-2">
              2. Initial Stock Intake (Batch Configuration)
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Batch Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. ABX-998"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cost Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={purchasePriceRupees}
                  onChange={(e) => setPurchasePriceRupees(e.target.value)}
                  placeholder="95.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPriceRupees}
                  onChange={(e) => setSellingPriceRupees(e.target.value)}
                  placeholder="145.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  MRP (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={mrpRupees}
                  onChange={(e) => setMrpRupees(e.target.value)}
                  placeholder="145.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Initial Intake Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Supplier
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors cursor-pointer"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900/30 border-t border-slate-800 px-8 py-6 flex items-center justify-end gap-4">
          <Link
            href="/dashboard/inventory"
            className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-sm px-5 py-2.5 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-6 py-2.5 transition-all shadow-md shadow-teal-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Ledger Entries...
              </>
            ) : (
              'Save Product & Log Stock'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

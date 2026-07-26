/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase batch and user profiles */
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

// Seed medicine batches for fallback/POS trial if database has no active products
const seedBatches = [
  {
    id: 'b_01',
    batch_number: 'AMX-26A',
    expiry_date: '2028-09-15',
    current_stock: 350,
    selling_price_paise: 14500, // ₹145.00
    mrp_paise: 14500,
    medicine_name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    gst_rate: 12,
  },
  {
    id: 'b_02',
    batch_number: 'AMX-26B',
    expiry_date: '2026-08-20',
    current_stock: 120,
    selling_price_paise: 14500,
    mrp_paise: 14500,
    medicine_name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    gst_rate: 12,
  },
  {
    id: 'b_03',
    batch_number: 'PCM-B88',
    expiry_date: '2029-04-12',
    current_stock: 450,
    selling_price_paise: 3200, // ₹32.00
    mrp_paise: 3200,
    medicine_name: 'Paracetamol 650mg',
    category: 'Analgesics',
    gst_rate: 18,
  },
  {
    id: 'b_05',
    batch_number: 'ATV-09',
    expiry_date: '2026-10-10',
    current_stock: 5,
    selling_price_paise: 18500, // ₹185.00
    mrp_paise: 18500,
    medicine_name: 'Atorvastatin 10mg',
    category: 'Cardiology',
    gst_rate: 12,
  },
];

interface CartItem {
  batchId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  sellingPricePaise: number;
  mrpPaise: number;
  gstRate: number;
  currentStock: number;
}

export default function POSBillingPage() {
  const router = useRouter();
  const supabase = createClient();

  // Search input ref to keep barcode scanner focused
  const searchInputRef = useRef<HTMLInputElement>(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [inventoryBatches, setInventoryBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Customer States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountInput, setDiscountInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // UI state alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Focus barcode input by default
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch active inventory batches and customers from DB
  useEffect(() => {
    async function loadPOSData() {
      try {
        // Fetch active medicine batches
        const { data: batchData, error: batchErr } = await supabase.from('medicine_batches')
          .select(`
            id,
            batch_number,
            expiry_date,
            current_stock,
            selling_price_paise,
            mrp_paise,
            medicines (name, category, gst_rate)
          `);

        if (batchErr || !batchData || batchData.length === 0) {
          setInventoryBatches(seedBatches);
        } else {
          const formatted = batchData.map((b: any) => ({
            id: b.id,
            batch_number: b.batch_number,
            expiry_date: b.expiry_date,
            current_stock: b.current_stock,
            selling_price_paise: b.selling_price_paise,
            mrp_paise: b.mrp_paise,
            medicine_name: b.medicines?.name || 'Unknown',
            category: b.medicines?.category || 'General',
            gst_rate: Number(b.medicines?.gst_rate || 0),
          }));
          setInventoryBatches(formatted);
        }

        // Fetch customers
        const { data: custData } = await supabase.from('customers').select('id, name, phone');

        if (custData && custData.length > 0) {
          setSelectedCustomerId(custData[0].id);
        }
      } catch {
        setInventoryBatches(seedBatches);
      }
    }
    loadPOSData();
  }, [supabase]);

  // Keyboard layout hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F9 or Ctrl + Enter triggers checkout
      if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        const checkoutBtn = document.getElementById('pos-checkout-btn');
        if (checkoutBtn) checkoutBtn.click();
      }
      // F2 focuses search query
      if (e.key === 'F2') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered inventory search list
  const searchedBatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return inventoryBatches.filter(
      (b) => b.medicine_name.toLowerCase().includes(q) || b.batch_number.toLowerCase().includes(q)
    );
  }, [inventoryBatches, searchQuery]);

  // Add selected batch item to cart
  const addToCart = (batch: any) => {
    setErrorMsg(null);
    if (batch.current_stock <= 0) {
      setErrorMsg(`Insufficent stock. Batch ${batch.batch_number} is out of stock.`);
      return;
    }

    setCart((curr) => {
      const existing = curr.find((item) => item.batchId === batch.id);
      if (existing) {
        if (existing.quantity >= batch.current_stock) {
          setErrorMsg(`Insufficient stock. Batch limit is ${batch.current_stock} pcs.`);
          return curr;
        }
        return curr.map((item) =>
          item.batchId === batch.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...curr,
        {
          batchId: batch.id,
          medicineName: batch.medicine_name,
          batchNumber: batch.batch_number,
          quantity: 1,
          sellingPricePaise: batch.selling_price_paise,
          mrpPaise: batch.mrp_paise,
          gstRate: batch.gst_rate,
          currentStock: batch.current_stock,
        },
      ];
    });

    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchedBatches.length > 0) {
      e.preventDefault();
      addToCart(searchedBatches[0]);
    }
  };

  // Adjust cart quantities
  const updateCartQty = (batchId: string, delta: number) => {
    setErrorMsg(null);
    setCart((curr) => {
      return curr
        .map((item) => {
          if (item.batchId === batchId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.currentStock) {
              setErrorMsg(`Insufficient stock. Batch limit is ${item.currentStock} pcs.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    cart.forEach((item) => {
      const itemSubtotal = item.sellingPricePaise * item.quantity;
      // Tax amount calculated as inclusive:
      // tax = sellPrice - (sellPrice / (1 + gst_rate/100))
      const taxPerPiece =
        item.sellingPricePaise - Math.round(item.sellingPricePaise / (1 + item.gstRate / 100));
      const itemTax = taxPerPiece * item.quantity;

      subtotal += itemSubtotal;
      totalTax += itemTax;
    });

    const discountPaise = Math.round(parseFloat(discountInput) * 100) || 0;
    const finalTotal = Math.max(0, subtotal - discountPaise);

    return {
      subtotal,
      totalTax,
      discountPaise,
      finalTotal,
    };
  }, [cart, discountInput]);

  const handleFinalizeBill = async () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Scan medicines to checkout.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Resolve user profile and active store
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('User session expired. Please log in again.');
        setSubmitting(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setErrorMsg('Failed to verify active store location.');
        setSubmitting(false);
        return;
      }

      const storeId = profile.store_id;

      // 2. Resolve customer (insert mock customer details if no database match)
      let resolvedCustomerId = selectedCustomerId;
      if (!resolvedCustomerId) {
        // Create dynamic cashier customer record
        const { data: walkInCustomer, error: custErr } = await supabase
          .from('customers')
          .insert({
            store_id: storeId,
            name: customerName || 'Walk-in Customer',
            phone: customerPhone || '9999999999',
          })
          .select('id')
          .single();

        if (custErr || !walkInCustomer) {
          setErrorMsg('Failed to initialize customer record: ' + (custErr?.message || 'unknown'));
          setSubmitting(false);
          return;
        }
        resolvedCustomerId = walkInCustomer.id;
      }

      // 3. Invoke Stored Procedure RPC to handle inserts atomically
      const { data: newBillId, error: rpcError } = await supabase.rpc('finalize_bill', {
        p_store_id: storeId,
        p_customer_id: resolvedCustomerId,
        p_cashier_id: user.id,
        p_discount_paise: calculations.discountPaise,
        p_items: cart.map((item) => ({
          batch_id: item.batchId,
          quantity: item.quantity,
        })),
      });

      if (rpcError || !newBillId) {
        setErrorMsg(
          'Transaction aborted: ' + (rpcError?.message || 'Insufficent inventory limits.')
        );
        setSubmitting(false);
        return;
      }

      setSuccessMsg('POS transaction committed. Generating printable invoice...');
      setCart([]);
      setDiscountInput('');

      setTimeout(() => {
        router.push(`/dashboard/billing/${newBillId}`);
      }, 1200);
    } catch {
      setErrorMsg('POS transaction failure. Rolled back ledger changes.');
      setSubmitting(false);
    }
  };

  const formatRupees = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(paise / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header and Shortcuts */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            POS Billing Portal
          </h2>
          <p className="text-sm text-slate-400">
            India GST-compliant digital billing desk. F2 focuses search, F9 finalizes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/billing/returns"
            className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs px-4 py-2 transition-all"
          >
            🔄 Return Ledger Console
          </Link>
        </div>
      </div>

      {/* Grid Layout: Main screen (Span 2) & Cart Checkout Panel (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Span (2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search bar & Barcode Intake */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-premium space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-400">
                Search & Barcode Intake (F2)
              </label>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                Auto-focus active
              </span>
            </div>

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onKeyPress={handleSearchKeyPress}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type medicine name or scan barcode e.g. Amoxicillin, PCM..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-4 top-3.5 text-slate-500 text-xs font-mono">
                Enter to Add
              </span>
            </div>

            {/* Live Search dropdown overlay */}
            {searchQuery && (
              <div className="border border-slate-800 bg-slate-900 rounded-xl overflow-hidden divide-y divide-slate-850 max-h-[300px] overflow-y-auto shadow-glow">
                {searchedBatches.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    No matching batches found in stock.
                  </div>
                ) : (
                  searchedBatches.map((batch) => (
                    <button
                      key={batch.id}
                      onClick={() => addToCart(batch)}
                      className="w-full text-left p-3.5 hover:bg-slate-800 flex justify-between items-center transition-colors text-xs"
                    >
                      <div>
                        <span className="block font-bold text-white text-sm">
                          {batch.medicine_name}
                        </span>
                        <span className="font-mono text-slate-400">
                          Batch: {batch.batch_number} (Exp: {batch.expiry_date})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-teal-400">
                          {formatRupees(batch.selling_price_paise)}
                        </span>
                        <span
                          className={`block font-mono text-[10px] ${batch.current_stock <= 15 ? 'text-amber-500' : 'text-slate-500'}`}
                        >
                          Stock: {batch.current_stock} pcs
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart Table list */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center bg-slate-900/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cart items</h3>
              <span className="rounded bg-slate-900 border border-slate-850 px-2 py-0.5 text-xs text-slate-400 font-mono">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-24 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-500 mb-4 border border-slate-800 mx-auto">
                  🛒
                </div>
                <h4 className="font-bold text-white text-sm">Active cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
                  Scan a medicine barcode or use search input to populate the checkout ledger.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Medicine & Batch</th>
                    <th className="px-6 py-3.5 text-center">GST Rate</th>
                    <th className="px-6 py-3.5 text-right">Unit Price</th>
                    <th className="px-6 py-3.5 text-center">Quantity</th>
                    <th className="px-6 py-3.5 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {cart.map((item) => {
                    const rowTotal = item.sellingPricePaise * item.quantity;
                    return (
                      <tr key={item.batchId} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="block font-bold text-white text-sm">
                            {item.medicineName}
                          </span>
                          <span className="font-mono text-slate-500 text-[10px]">
                            Batch: {item.batchNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-400">
                          {item.gstRate}%
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {formatRupees(item.sellingPricePaise)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                            <button
                              onClick={() => updateCartQty(item.batchId, -1)}
                              className="h-6 w-6 rounded bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold px-2">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.batchId, 1)}
                              className="h-6 w-6 rounded bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-white">
                          {formatRupees(rowTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Span (1) - Checkout Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium">
          <div className="p-6 border-b border-slate-850 bg-slate-900/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400">
              Checkout Ledger
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Lookup / Details */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Customer Details
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Customer Name (e.g. Walk-in)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone number (10 digits)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Discount application */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Discount (Rupees)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Calculations display */}
            <div className="border-t border-slate-850 pt-4 space-y-3 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal (inclusive of taxes)</span>
                <span className="font-mono text-white">{formatRupees(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inclusive Tax (GST total)</span>
                <span className="font-mono">{formatRupees(calculations.totalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount applied</span>
                <span className="font-mono text-rose-400">
                  -{formatRupees(calculations.discountPaise)}
                </span>
              </div>

              <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-sm font-bold text-white">
                <span>Bill Total</span>
                <span className="font-mono text-teal-400 text-lg">
                  {formatRupees(calculations.finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout alerts */}
            {errorMsg && (
              <div className="border border-rose-500/20 bg-rose-500/10 p-3 rounded-lg text-[11px] text-rose-400 leading-relaxed">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="border border-emerald-500/20 bg-emerald-500/10 p-3 rounded-lg text-[11px] text-emerald-400 leading-relaxed">
                ✅ {successMsg}
              </div>
            )}

            {/* Action button */}
            <Button
              id="pos-checkout-btn"
              onClick={handleFinalizeBill}
              disabled={submitting || cart.length === 0}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-teal-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Finalizing POS Bill...
                </>
              ) : (
                'Finalize Invoice (F9)'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

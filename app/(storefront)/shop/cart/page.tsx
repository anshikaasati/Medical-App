/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Razorpay script callback window options */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function ShopCartPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load cart from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('storefront_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Calculate totals
  const subtotalPaise = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.mrp_paise * item.quantity, 0);
  }, [cart]);

  // Tax calculations (GST estimated at 12% inclusive for cart calculations)
  const gstInclusiveTotal = useMemo(() => {
    return subtotalPaise - Math.round(subtotalPaise / 1.12);
  }, [subtotalPaise]);

  const updateQuantity = (id: string, delta: number) => {
    setCart((curr) => {
      const updated = curr
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      localStorage.setItem('storefront_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    localStorage.removeItem('storefront_cart');
    setCart([]);
  };

  // Load Razorpay checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setErrorMsg(
        'Failed to load Razorpay payment gateway script. Check your internet connection.'
      );
      setLoading(false);
      return;
    }

    // Razorpay Test Mode configurations
    // IMPORTANT: Swap 'rzp_test_demoKey123' with active Live Razorpay Keys in production environments.
    const options = {
      key: 'rzp_test_demoKey123',
      amount: subtotalPaise, // amount in paise
      currency: 'INR',
      name: 'MargPharmacy Retail',
      description: 'Prescription Medicine Online Intake Order',
      handler: function (response: any) {
        // Payment success callback!
        // Record order details inside local storage for order history fallback
        const savedOrders = localStorage.getItem('storefront_orders') || '[]';
        let ordersList = [];
        try {
          ordersList = JSON.parse(savedOrders);
        } catch {
          ordersList = [];
        }

        const newOrder = {
          id: response.razorpay_payment_id || `pay_${Date.now()}`,
          date: new Date().toISOString(),
          total_amount_paise: subtotalPaise,
          status: 'Paid',
          items: cart.map((it) => `${it.name} (x${it.quantity})`).join(', '),
        };

        ordersList.push(newOrder);
        localStorage.setItem('storefront_orders', JSON.stringify(ordersList));

        // Attempt logging inside bills table in background
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from('users')
              .select('store_id')
              .eq('id', user.id)
              .single()
              .then(({ data: profile }) => {
                if (profile) {
                  // Log order bills (marked as finalized)
                  supabase
                    .from('bills')
                    .insert({
                      store_id: profile.store_id,
                      customer_id: user.id,
                      status: 'finalized',
                      subtotal_paise: subtotalPaise,
                      total_amount_paise: subtotalPaise,
                      discount_paise: 0,
                      total_tax_paise: gstInclusiveTotal,
                    })
                    .then(() => {});
                }
              });
          }
        });

        // Clear cart and redirect
        setSuccessMsg('Payment Successful! Thank you for ordering.');
        localStorage.removeItem('storefront_cart');
        setCart([]);
        setLoading(false);

        setTimeout(() => {
          router.push('/account/orders');
        }, 1500);
      },
      prefill: {
        name: 'Logged Customer',
        email: 'customer@gmail.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Sector 12 Retail Store Outlet',
      },
      theme: {
        color: '#0D9488', // Match Teal Sanctuary primary theme
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header back button */}
      <div className="space-y-4">
        <Link
          href="/shop"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          ← Back to Shop Grid
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500">
            Review medicine order amounts and finalize payment (Razorpay Test Mode).
          </p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-4 mx-auto">
            🛒
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Your cart is empty</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
            Browse our shop catalog and select items to add them here for checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Selected Medicines</h3>
              <button
                onClick={clearCart}
                className="text-[10px] font-bold text-red-650 hover:text-red-700 uppercase"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      Unit price: {formatCurrency(item.mrp_paise)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-6 w-6 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold px-2 text-slate-850">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-6 w-6 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono font-bold text-slate-900 text-sm min-w-[70px] text-right">
                      {formatCurrency(item.mrp_paise * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Payment Summary
            </h3>

            <div className="space-y-3.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal (MRP)</span>
                <span className="font-mono text-slate-900">{formatCurrency(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inclusive GST (12% est.)</span>
                <span className="font-mono">{formatCurrency(gstInclusiveTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping / Delivery</span>
                <span className="font-mono text-emerald-600 font-bold">FREE</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-emerald-600 text-lg">
                  {formatCurrency(subtotalPaise)}
                </span>
              </div>
            </div>

            {/* Test checkout warnings */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-[10px] text-amber-800 leading-relaxed space-y-1">
              <span className="font-bold uppercase tracking-wider block">
                ⚠️ Razorpay Test Mode:
              </span>
              <p>
                Payments are simulated. Do not input real credit cards or bank credentials. Swapping
                keys inside code config is required for live deployments.
              </p>
            </div>

            {errorMsg && (
              <div className="border border-red-200 bg-red-50 p-3 rounded-lg text-[10px] text-red-700">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="border border-emerald-250 bg-emerald-50 p-3 rounded-lg text-[10px] text-emerald-700">
                ✅ {successMsg}
              </div>
            )}

            <Button
              onClick={handleRazorpayCheckout}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-emerald-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Loading payment...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

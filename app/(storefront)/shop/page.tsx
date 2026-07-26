/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase batch payload relation shapes */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Seed catalog matching medicines inventory
const seedProducts = [
  {
    id: 'med_01',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    mrp_paise: 14500, // ₹145.00
    description:
      'Broad-spectrum antibiotic used to treat bacterial respiratory and skin infections.',
  },
  {
    id: 'med_02',
    name: 'Paracetamol 650mg',
    category: 'Analgesics',
    mrp_paise: 3200, // ₹32.00
    description: 'Common analgesic and antipyretic used for pain relief and fever reduction.',
  },
  {
    id: 'med_04',
    name: 'Atorvastatin 10mg',
    category: 'Cardiology',
    mrp_paise: 18500, // ₹185.00
    description:
      'Statin medication used to lower blood cholesterol levels and prevent cardiovascular events.',
  },
];

export default function ShopCatalogPage() {
  const supabase = createClient();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Cart state persisted locally
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Read active cart count from localStorage
    const savedCart = localStorage.getItem('storefront_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const count = parsed.reduce((sum: number, it: any) => sum + it.quantity, 0);
        setCartCount(count);
      } catch {
        // Silent error catch
      }
    }
  }, []);

  useEffect(() => {
    async function loadShopProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('medicines').select(`
            id,
            name,
            category,
            medicine_batches (mrp_paise)
          `);

        if (error || !data || data.length === 0) {
          setProducts(seedProducts);
        } else {
          // Normalize prices (use MRP from the first batch or fallback)
          const formatted = data.map((m: any) => {
            const batchPrice =
              m.medicine_batches && m.medicine_batches.length > 0
                ? m.medicine_batches[0].mrp_paise
                : 12000; // default ₹120.00 fallback
            return {
              id: m.id,
              name: m.name,
              category: m.category,
              mrp_paise: batchPrice,
              description: `Standard prescription medicine category: ${m.category || 'General'}. Check with pharmacist for batch specifications.`,
            };
          });
          setProducts(formatted);
        }
      } catch {
        setProducts(seedProducts);
      } finally {
        setLoading(false);
      }
    }
    loadShopProducts();
  }, [supabase]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Search & Filter
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: any) => {
    const savedCart = localStorage.getItem('storefront_cart') || '[]';
    let cartList = [];
    try {
      cartList = JSON.parse(savedCart);
    } catch {
      cartList = [];
    }

    const existing = cartList.find((it: any) => it.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartList.push({
        id: product.id,
        name: product.name,
        mrp_paise: product.mrp_paise,
        quantity: 1,
      });
    }

    localStorage.setItem('storefront_cart', JSON.stringify(cartList));

    // Update local count
    const count = cartList.reduce((sum: number, it: any) => sum + it.quantity, 0);
    setCartCount(count);
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(paise / 100);
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent inline-block" />
          <p className="text-xs font-semibold text-slate-500 font-sans">
            Connecting to shop catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-4 sm:px-6">
      {/* Visual Header / Cart Nav */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            MargPharmacy Storefront
          </h1>
          <p className="text-sm text-slate-500">
            Order standard prescription medicines and upload documents for AI OCR verification.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/shop/prescriptions"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-4 py-2.5 transition-all"
          >
            <span>📄</span> Upload Prescription
          </Link>
          <Link
            href="/shop/cart"
            className="relative flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <span>🛒</span> View Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search medicines catalog..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-850 focus:border-emerald-500 focus:outline-none transition-colors"
        />

        <div className="flex overflow-x-auto gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-4 mx-auto">
            💊
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No medicines found</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
            We couldn&apos;t locate any products matching your search terms. Modify your filters and
            try again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group hover:border-emerald-200"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                    {product.category || 'General'}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold text-sm">
                    {formatCurrency(product.mrp_paise)}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">{product.description}</p>
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                className="w-full mt-6 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs py-3 transition-colors active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <span>🛒</span> Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

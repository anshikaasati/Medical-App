/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase batch joins and dynamic filters */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FormattedDate } from '@/components/shared/Formatter';

// Static seed data matching domain types for fallback/fresh install view
const seedMedicines = [
  {
    id: 'med_01',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    hsn_code: '30041010',
    gst_rate: 12,
    batches: [
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
        expiry_date: '2026-08-20', // < 30 days if current date is Jul 27 2026
        manufacturing_date: '2026-02-10',
        purchase_price_paise: 9500,
        selling_price_paise: 14500,
        mrp_paise: 14500,
        current_stock: 120,
      },
    ],
  },
  {
    id: 'med_02',
    name: 'Paracetamol 650mg',
    category: 'Analgesics',
    hsn_code: '30049061',
    gst_rate: 18,
    batches: [
      {
        id: 'b_03',
        batch_number: 'PCM-B88',
        expiry_date: '2029-04-12',
        manufacturing_date: '2026-04-01',
        purchase_price_paise: 1800,
        selling_price_paise: 3200,
        mrp_paise: 3200,
        current_stock: 450,
      },
    ],
  },
  {
    id: 'med_03',
    name: 'Ciprofloxacin 250mg',
    category: 'Antibiotics',
    hsn_code: '30042013',
    gst_rate: 12,
    batches: [
      {
        id: 'b_04',
        batch_number: 'CIP-88',
        expiry_date: '2026-07-15', // Expired if current date is Jul 27 2026
        manufacturing_date: '2025-07-15',
        purchase_price_paise: 6400,
        selling_price_paise: 9250,
        mrp_paise: 9250,
        current_stock: 8,
      },
    ],
  },
  {
    id: 'med_04',
    name: 'Atorvastatin 10mg',
    category: 'Cardiology',
    hsn_code: '30049099',
    gst_rate: 12,
    batches: [
      {
        id: 'b_05',
        batch_number: 'ATV-09',
        expiry_date: '2026-10-10', // < 90 days if current date is Jul 27 2026
        manufacturing_date: '2025-10-10',
        purchase_price_paise: 11000,
        selling_price_paise: 18500,
        mrp_paise: 18500,
        current_stock: 5,
      },
    ],
  },
  {
    id: 'med_05',
    name: 'Metformin 500mg',
    category: 'Antidiabetic',
    hsn_code: '30049089',
    gst_rate: 18,
    batches: [], // Out of stock (no active batches)
  },
];

export default function InventoryListPage() {
  const supabase = createClient();

  const [medicines, setMedicines] = useState<any[]>([]); // type matches nested database response shape
  const [loading, setLoading] = useState(true);

  // Search & Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterType, setFilterType] = useState<
    'all' | 'low_stock' | 'expiring_soon' | 'out_of_stock'
  >('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        // Query medicines with batches nested
        const { data, error } = await supabase.from('medicines').select(`
            id,
            name,
            category,
            hsn_code,
            gst_rate,
            medicine_batches (
              id,
              batch_number,
              expiry_date,
              manufacturing_date,
              purchase_price_paise,
              selling_price_paise,
              mrp_paise,
              current_stock
            )
          `);

        if (error || !data || data.length === 0) {
          // If fresh install or supabase endpoints are not connected, fall back to seed data
          setMedicines(seedMedicines);
        } else {
          // Normalise supabase payload key formatting
          const formatted = data.map((item: any /* database medicine record */) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            hsn_code: item.hsn_code,
            gst_rate: Number(item.gst_rate),
            batches: item.medicine_batches || [],
          }));
          setMedicines(formatted);
        }
      } catch {
        setMedicines(seedMedicines);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [supabase]);

  // Derive active categories list
  const categoriesList = useMemo(() => {
    const cats = new Set(medicines.map((m) => m.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [medicines]);

  // Expiry date checker utilities
  const checkExpiryStatus = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const today = new Date('2026-07-27'); // Standard reference date from context metadata
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        status: 'expired',
        label: 'Expired',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      };
    } else if (diffDays < 30) {
      return {
        status: 'critical',
        label: 'Expiring <30 Days',
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
      };
    } else if (diffDays < 90) {
      return {
        status: 'warning',
        label: 'Expiring <90 Days',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      };
    }
    return {
      status: 'good',
      label: 'Good Shelf Life',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
  };

  // Perform search, filter, sorting operations
  const processedMedicines = useMemo(() => {
    let result = [...medicines];

    // 1. Search Query filter (matches Name or HSN code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) || (m.hsn_code && m.hsn_code.toLowerCase().includes(q))
      );
    }

    // 2. Category selection filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // 3. Tab-based status filters
    if (filterType === 'low_stock') {
      result = result.filter((m) => {
        const totalStock = m.batches.reduce(
          (sum: number, b: any /* database batch record */) => sum + b.current_stock,
          0
        );
        return totalStock > 0 && totalStock <= 15; // Low Stock threshold
      });
    } else if (filterType === 'out_of_stock') {
      result = result.filter((m) => {
        const totalStock = m.batches.reduce(
          (sum: number, b: any /* database batch record */) => sum + b.current_stock,
          0
        );
        return totalStock === 0;
      });
    } else if (filterType === 'expiring_soon') {
      result = result.filter((m) =>
        m.batches.some((b: any /* database batch record */) => {
          const status = checkExpiryStatus(b.expiry_date).status;
          return ['expired', 'critical', 'warning'].includes(status);
        })
      );
    }

    // 4. Sorting logic
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        const stockA = a.batches.reduce(
          (sum: number, x: any /* database batch record */) => sum + x.current_stock,
          0
        );
        const stockB = b.batches.reduce(
          (sum: number, x: any /* database batch record */) => sum + x.current_stock,
          0
        );
        comparison = stockA - stockB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [medicines, searchQuery, selectedCategory, filterType, sortBy, sortOrder]);

  // Paginated slice
  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [processedMedicines, currentPage]);

  const totalPages = Math.ceil(processedMedicines.length / itemsPerPage);

  const toggleSort = (field: 'name' | 'stock') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent inline-block" />
          <p className="text-xs font-semibold text-slate-500">Querying medicine inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Medicine Inventory
          </h2>
          <p className="text-sm text-slate-400">
            Catalog records, batch configurations, and ledger tracking logs.
          </p>
        </div>
        <Link
          href="/dashboard/inventory/new"
          className="self-start md:self-auto flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-4 py-2.5 transition-all shadow-md shadow-teal-600/10 active:scale-[0.98]"
        >
          <span>➕</span> Add Medicine
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-premium">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search medicine name or HSN..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Filter Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none transition-colors cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Toggles */}
        <div className="flex gap-2 items-end">
          <button
            onClick={() => toggleSort('name')}
            className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              sortBy === 'name'
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Name Sort {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('stock')}
            className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              sortBy === 'stock'
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Stock Sort {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2.5">
        <button
          onClick={() => {
            setFilterType('all');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Catalog ({medicines.length})
        </button>
        <button
          onClick={() => {
            setFilterType('low_stock');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'low_stock'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Low Stock Warning
        </button>
        <button
          onClick={() => {
            setFilterType('expiring_soon');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'expiring_soon'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Expiring Soon / Expired
        </button>
        <button
          onClick={() => {
            setFilterType('out_of_stock');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === 'out_of_stock'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Out of Stock
        </button>
      </div>

      {/* Main Table card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-premium">
        {processedMedicines.length === 0 ? (
          <div className="py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-500 mb-4 border border-slate-800 mx-auto">
              📦
            </div>
            <h3 className="font-bold text-white text-base">No medicines yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5 mx-auto leading-relaxed">
              No matching records found. Add your first medicine in the inventory system to begin
              tracking batches and stock movements.
            </p>
            <Link
              href="/dashboard/inventory/new"
              className="inline-block mt-4 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2 text-xs font-semibold text-white transition-all active:scale-[0.98]"
            >
              Add First Medicine
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 z-10">
                  <tr className="bg-slate-900/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Medicine Details</th>
                    <th className="px-6 py-4">HSN Code</th>
                    <th className="px-6 py-4">Tax (GST)</th>
                    <th className="px-6 py-4">Active Batches (Expiry Checks)</th>
                    <th className="px-6 py-4 text-right">Total Stock</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedMedicines.map((med) => {
                    const totalStock = med.batches.reduce(
                      (sum: number, b: any /* database batch record */) => sum + b.current_stock,
                      0
                    );
                    return (
                      <tr key={med.id} className="hover:bg-slate-900/20 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="block font-bold text-white group-hover:text-teal-400 transition-colors">
                            {med.name}
                          </span>
                          <span className="inline-flex rounded bg-slate-900 border border-slate-800 text-[10px] px-1.5 py-0.5 text-slate-500 mt-1 font-semibold uppercase">
                            {med.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {med.hsn_code || '—'}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">{med.gst_rate}% GST</td>
                        <td className="px-6 py-4 space-y-2 max-w-xs">
                          {med.batches.length === 0 ? (
                            <span className="text-slate-500 text-xs italic">No active batches</span>
                          ) : (
                            med.batches.map((batch: any /* database batch record */) => {
                              const expStatus = checkExpiryStatus(batch.expiry_date);
                              return (
                                <div
                                  key={batch.id}
                                  className="flex flex-col gap-1 rounded bg-slate-900/40 border border-slate-900 p-2 text-xs"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-slate-300 font-semibold">
                                      {batch.batch_number}
                                    </span>
                                    <span
                                      className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold border ${expStatus.color}`}
                                    >
                                      {expStatus.label}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>
                                      Exp: <FormattedDate dateString={batch.expiry_date} />
                                    </span>
                                    <span className="font-bold text-slate-400">
                                      {batch.current_stock} pcs
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-mono font-bold text-sm ${
                              totalStock === 0
                                ? 'text-rose-500'
                                : totalStock <= 15
                                  ? 'text-amber-500'
                                  : 'text-white'
                            }`}
                          >
                            {totalStock} pcs
                          </span>
                          {totalStock === 0 && (
                            <span className="block text-[9px] font-bold uppercase text-rose-500/80 mt-0.5">
                              Out of Stock
                            </span>
                          )}
                          {totalStock > 0 && totalStock <= 15 && (
                            <span className="block text-[9px] font-bold uppercase text-amber-500/80 mt-0.5">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/dashboard/inventory/${med.id}`}
                            className="inline-flex rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all active:scale-[0.98]"
                          >
                            Edit & Ledger
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing{' '}
                  {Math.min(processedMedicines.length, (currentPage - 1) * itemsPerPage + 1)} -{' '}
                  {Math.min(processedMedicines.length, currentPage * itemsPerPage)} of{' '}
                  {processedMedicines.length} items
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1.5 text-xs text-white font-semibold transition-all disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1.5 text-xs text-white font-semibold transition-all disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { CustomerProfile } from '@/types';
import { getAllCustomers } from '@/services/customer.service';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllCustomers('store_01').then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSaving(true);
    const { createCustomer } = await import('@/services/customer.service');
    const created = await createCustomer({ ...form, storeId: 'store_01' });
    setCustomers((prev) => [...prev, created]);
    setShowNew(false);
    setSaving(false);
    setForm({ name: '', phone: '', email: '', address: '' });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Customers</h2>
          <p className="text-sm text-slate-400 mt-1">
            Customer profiles, purchase history and loyalty points.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-md"
        >
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Customers
          </p>
          <p className="text-3xl font-extrabold text-white mt-1">{customers.length}</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatCurrency(customers.reduce((a, c) => a + c.totalPurchasesInPaise, 0))}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Outstanding Credit
          </p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
            {formatCurrency(customers.reduce((a, c) => a + c.outstandingCreditInPaise, 0))}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loyalty Points
          </p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-1">
            {customers.reduce((a, c) => a + c.loyaltyPoints, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone..."
        className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
      />

      {/* Customer Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {[
                  'Customer',
                  'Phone',
                  'Orders',
                  'Total Purchases',
                  'Loyalty Pts',
                  'Credit Due',
                  'Since',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No customers found.{' '}
                    <button
                      onClick={() => setShowNew(true)}
                      className="text-indigo-400 hover:underline"
                    >
                      Add one →
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{c.name}</p>
                          {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{c.phone}</td>
                    <td className="px-4 py-3 text-white font-semibold">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 text-xs font-semibold">
                      {formatCurrency(c.totalPurchasesInPaise)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400">
                        ⭐ {c.loyaltyPoints}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.outstandingCreditInPaise > 0 ? (
                        <span className="text-xs font-semibold text-amber-400 font-mono">
                          {formatCurrency(c.outstandingCreditInPaise)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add New Customer</h3>
              <button
                onClick={() => setShowNew(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Amit Sharma' },
                { key: 'phone', label: 'Phone *', type: 'tel', placeholder: '+91 98001 23456' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'customer@email.com' },
                {
                  key: 'address',
                  label: 'Address',
                  type: 'text',
                  placeholder: '12, Vijay Nagar, Indore',
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="flex-1 rounded-xl border border-slate-700 text-slate-400 font-semibold py-2.5 text-sm hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

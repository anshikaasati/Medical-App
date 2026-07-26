'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Supplier } from '@/types';
import { getAllSuppliers } from '@/services/supplier.service';

function formatCurrency(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    drugLicenseNo: '',
    city: '',
    state: '',
    paymentTermsDays: '30',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllSuppliers('store_01').then((data) => {
      setSuppliers(data);
      setLoading(false);
    });
  }, []);

  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { createSupplier } = await import('@/services/supplier.service');
    const created = await createSupplier({
      ...form,
      paymentTermsDays: parseInt(form.paymentTermsDays),
      storeId: 'store_01',
    });
    setSuppliers((prev) => [...prev, created]);
    setShowNew(false);
    setSaving(false);
    setForm({
      name: '',
      phone: '',
      email: '',
      gstin: '',
      drugLicenseNo: '',
      city: '',
      state: '',
      paymentTermsDays: '30',
    });
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
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Suppliers</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage drug distributors, outstanding balances and purchase history.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-md"
        >
          + Add Supplier
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Suppliers
          </p>
          <p className="text-3xl font-extrabold text-white mt-1">{suppliers.length}</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Outstanding
          </p>
          <p className="text-3xl font-extrabold text-red-400 mt-1 font-mono">
            {formatCurrency(suppliers.reduce((a, s) => a + s.outstandingBalanceInPaise, 0))}
          </p>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Purchases (YTD)
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatCurrency(suppliers.reduce((a, s) => a + s.totalPurchasesInPaise, 0))}
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

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((supplier) => (
          <Link
            key={supplier.id}
            href={`/dashboard/suppliers/${supplier.id}`}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-900/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                {supplier.name[0]}
              </div>
              {supplier.outstandingBalanceInPaise > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  Balance Due
                </span>
              )}
            </div>
            <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
              {supplier.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{supplier.phone}</p>
            {supplier.city && (
              <p className="text-xs text-slate-600 mt-0.5">
                {supplier.city}, {supplier.state}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Outstanding</p>
                <p
                  className={`font-mono font-semibold mt-0.5 ${supplier.outstandingBalanceInPaise > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {formatCurrency(supplier.outstandingBalanceInPaise)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Total Purchases</p>
                <p className="font-mono font-semibold text-slate-300 mt-0.5">
                  {formatCurrency(supplier.totalPurchasesInPaise)}
                </p>
              </div>
            </div>
            {supplier.gstin && (
              <p className="text-[10px] text-slate-600 mt-2 font-mono">GST: {supplier.gstin}</p>
            )}
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 py-16 text-center text-slate-500">
            No suppliers found.{' '}
            <button onClick={() => setShowNew(true)} className="text-indigo-400 hover:underline">
              Add one →
            </button>
          </div>
        )}
      </div>

      {/* New Supplier Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add New Supplier</h3>
              <button
                onClick={() => setShowNew(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                {
                  key: 'name',
                  label: 'Supplier Name *',
                  type: 'text',
                  placeholder: 'MedLife Distributors',
                },
                { key: 'phone', label: 'Phone *', type: 'tel', placeholder: '+91 98765 43210' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'orders@supplier.com' },
                { key: 'gstin', label: 'GSTIN', type: 'text', placeholder: '23AAAAA0000A1Z5' },
                {
                  key: 'drugLicenseNo',
                  label: 'Drug License No.',
                  type: 'text',
                  placeholder: 'DL/MP/DIST/2024/0045',
                },
                { key: 'city', label: 'City', type: 'text', placeholder: 'Indore' },
                { key: 'state', label: 'State', type: 'text', placeholder: 'Madhya Pradesh' },
                {
                  key: 'paymentTermsDays',
                  label: 'Payment Terms (days)',
                  type: 'number',
                  placeholder: '30',
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
                  {saving ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

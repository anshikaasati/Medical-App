import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock statistics mapping to project requirements
  const stats = {
    totalSalesInPaise: 4285060, // ₹42,850.60
    lowStockCount: 14,
    expiringSoonCount: 8, // Expiry tracking is key
    gstCollectedInPaise: 514200, // ₹5,142.00
  };

  // Recent transactions mapping to stock_movements ledger and billing rules
  const recentTransactions = [
    {
      id: 'tx_01',
      invoiceNumber: 'INV-2026-0008',
      type: 'Sale (POS)',
      dateTime: '27-Jul-2026 01:45 PM', // DD-MMM-YYYY format
      customer: 'Rohan Sharma',
      amountInPaise: 125000, // ₹1,250.00
      gstInPaise: 15000,
      paymentMode: 'UPI',
    },
    {
      id: 'tx_02',
      invoiceNumber: 'PO-2026-0034',
      type: 'Purchase IN',
      dateTime: '27-Jul-2026 11:20 AM',
      supplier: 'MedLife Distributors',
      amountInPaise: 1845000, // ₹18,450.00
      gstInPaise: 281200,
      paymentMode: 'CREDIT',
    },
    {
      id: 'tx_03',
      invoiceNumber: 'INV-2026-0007',
      type: 'Sale (POS)',
      dateTime: '26-Jul-2026 08:10 PM',
      customer: 'Walk-In Customer',
      amountInPaise: 34000, // ₹340.00
      gstInPaise: 4080,
      paymentMode: 'CASH',
    },
  ];

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            ERP Command Center
          </h2>
          <p className="text-sm text-slate-400">
            Real-time shop status, compliance validation, and inventory control.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 transition-all shadow-md shadow-indigo-600/10"
          >
            <span>🛒</span> New POS Bill
          </Link>
          <button className="flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-4 py-2.5 transition-all border border-slate-700">
            📤 Export GSTR-1
          </button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sales Card */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Today&apos;s Sales
              </span>
              <span className="text-xl">💰</span>
            </div>
            <span className="block mt-4 text-2xl font-black text-white sm:text-3xl">
              {formatCurrency(stats.totalSalesInPaise)}
            </span>
          </div>
          <span className="block mt-4 text-[10px] text-emerald-400 font-bold">
            ↑ +12.4% vs yesterday
          </span>
        </div>

        {/* GST Card */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">GST Liability</span>
              <span className="text-xl">🏦</span>
            </div>
            <span className="block mt-4 text-2xl font-black text-white sm:text-3xl">
              {formatCurrency(stats.gstCollectedInPaise)}
            </span>
          </div>
          <span className="block mt-4 text-[10px] text-slate-500 font-semibold">
            SGST / CGST calculated at source
          </span>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Low Stock Items
              </span>
              <span className="text-xl">⚠️</span>
            </div>
            <span className="block mt-4 text-2xl font-black text-amber-500 sm:text-3xl">
              {stats.lowStockCount}
            </span>
          </div>
          <span className="block mt-4 text-[10px] text-amber-400/80 font-semibold hover:underline cursor-pointer">
            View replenish list →
          </span>
        </div>

        {/* Expiry Alarm */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Expiring Batches
              </span>
              <span className="text-xl">⏳</span>
            </div>
            <span className="block mt-4 text-2xl font-black text-rose-500 sm:text-3xl">
              {stats.expiringSoonCount}
            </span>
          </div>
          <span className="block mt-4 text-[10px] text-rose-400/80 font-semibold hover:underline cursor-pointer">
            Locked from billing (30-day warning) →
          </span>
        </div>
      </div>

      {/* Ledger & Transactions log */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">Recent Movements & Bills</h3>
            <p className="text-xs text-slate-400 mt-1">
              Immutable log of sales invoicing and inventory receipts.
            </p>
          </div>
          <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View full ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-3.5">Ref ID / Bill</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">GST</th>
                <th className="px-6 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white text-xs">
                    {tx.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        tx.type.startsWith('Sale')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{tx.dateTime}</td>
                  <td className="px-6 py-4 text-xs">{tx.customer || tx.supplier}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {formatCurrency(tx.gstInPaise)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold font-mono text-white">
                    {formatCurrency(tx.amountInPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

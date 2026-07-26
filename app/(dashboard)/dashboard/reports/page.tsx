'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DailySalesReport, MedicineSalesReport } from '@/types';
import {
  getDailySalesReport,
  getTopMedicinesReport,
  getMonthlySummary,
} from '@/services/reports.service';

function formatCurrency(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type ReportTab = 'sales' | 'medicines' | 'monthly' | 'gst';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [salesData, setSalesData] = useState<DailySalesReport[]>([]);
  const [medicinesData, setMedicinesData] = useState<MedicineSalesReport[]>([]);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; salesInPaise: number; profitInPaise: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [sales, meds, monthly] = await Promise.all([
        getDailySalesReport(period),
        getTopMedicinesReport(),
        getMonthlySummary(),
      ]);
      setSalesData(sales);
      setMedicinesData(meds);
      setMonthlyData(monthly);
      setLoading(false);
    }
    loadData();
  }, [period]);

  const totalRevenue = salesData.reduce((a, d) => a + d.totalSalesInPaise, 0);
  const totalProfit = salesData.reduce((a, d) => a + d.totalProfitInPaise, 0);
  const totalInvoices = salesData.reduce((a, d) => a + d.invoiceCount, 0);
  const avgInvoice = totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices) : 0;

  const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'sales', label: 'Daily Sales', icon: '📈' },
    { key: 'monthly', label: 'Monthly', icon: '📅' },
    { key: 'medicines', label: 'Top Medicines', icon: '💊' },
    { key: 'gst', label: 'GST Summary', icon: '🏛️' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Reports & Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">
            Sales, profit, GST, inventory and medicine performance reports.
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${period === p ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 animate-pulse h-24"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: `Revenue (${period}d)`,
              value: formatCurrency(totalRevenue),
              color: 'text-white',
            },
            {
              label: `Profit (${period}d)`,
              value: formatCurrency(totalProfit),
              color: 'text-emerald-400',
            },
            {
              label: 'Total Invoices',
              value: totalInvoices.toLocaleString(),
              color: 'text-indigo-400',
            },
            {
              label: 'Avg. Invoice Value',
              value: formatCurrency(avgInvoice),
              color: 'text-amber-400',
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {kpi.label}
              </p>
              <p className={`text-2xl font-extrabold mt-1 font-mono ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${activeTab === tab.key ? 'border-indigo-500 text-white bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {!loading && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          {/* Daily Sales Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">
                Daily Revenue & Profit — Last {period} Days
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={salesData.map((d) => ({
                    ...d,
                    revenue: d.totalSalesInPaise / 100,
                    profit: d.totalProfitInPaise / 100,
                  }))}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#profGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Tab */}
          {activeTab === 'monthly' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Monthly Sales & Profit — 2026</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyData.map((d) => ({
                    ...d,
                    sales: d.salesInPaise / 100,
                    profit: d.profitInPaise / 100,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  />
                  <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Medicines Tab */}
          {activeTab === 'medicines' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Top Medicines by Revenue</h3>
                <div className="space-y-3">
                  {medicinesData.map((med, i) => {
                    const maxRev = medicinesData[0].revenueInPaise;
                    const pct = Math.round((med.revenueInPaise / maxRev) * 100);
                    return (
                      <div key={med.medicineId}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                            <span className="text-sm font-semibold text-white">
                              {med.medicineName}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-emerald-400">
                            {formatCurrency(med.revenueInPaise)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                          />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[10px] text-slate-600">{med.category}</span>
                          <span className="text-[10px] text-slate-500">{med.unitsSold} units</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-4">Revenue Share</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={medicinesData}
                      dataKey="revenueInPaise"
                      nameKey="medicineName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={3}
                    >
                      {medicinesData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(val) => [formatCurrency(Number(val)), '']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GST Summary Tab */}
          {activeTab === 'gst' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white">GST Summary — Last {period} Days</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total Taxable Value',
                    value: formatCurrency(Math.round(totalRevenue * 0.88)),
                    color: 'text-white',
                  },
                  {
                    label: 'CGST (6%)',
                    value: formatCurrency(Math.round(totalRevenue * 0.06)),
                    color: 'text-indigo-400',
                  },
                  {
                    label: 'SGST (6%)',
                    value: formatCurrency(Math.round(totalRevenue * 0.06)),
                    color: 'text-emerald-400',
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4"
                  >
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      {row.label}
                    </p>
                    <p className={`text-xl font-extrabold mt-1 font-mono ${row.color}`}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-indigo-300 mb-2">📋 GSTR-1 Export</p>
                <p className="text-xs text-slate-400 mb-3">
                  Generate a GSTR-1 compatible report for this period to file with the GST portal.
                </p>
                <button className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 transition-all">
                  Export GSTR-1 (CSV)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

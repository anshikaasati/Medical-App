'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings, GSTRate } from '@/types';
import { getStoreSettings, updateStoreSettings } from '@/services/settings.service';

type SettingsTab = 'store' | 'gst' | 'billing' | 'alerts' | 'backup';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getStoreSettings('store_01').then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await updateStoreSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'store', label: 'Store Info', icon: '🏪' },
    { key: 'gst', label: 'GST & Tax', icon: '🏛️' },
    { key: 'billing', label: 'Billing', icon: '🧾' },
    { key: 'alerts', label: 'Alerts', icon: '🔔' },
    { key: 'backup', label: 'Backup', icon: '☁️' },
  ];

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Settings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure your pharmacy, GST, billing, and notifications.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'}`}
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
              Saving...
            </>
          ) : saved ? (
            '✅ Saved!'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1 h-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all text-left ${activeTab === tab.key ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Pharmacy Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Pharmacy Name', placeholder: 'MargPharmacy' },
                  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                  { key: 'email', label: 'Email', placeholder: 'info@pharmacy.com' },
                  { key: 'address', label: 'Address', placeholder: 'Shop No. 14, Medical Complex' },
                  { key: 'city', label: 'City', placeholder: 'Indore' },
                  { key: 'state', label: 'State', placeholder: 'Madhya Pradesh' },
                  { key: 'pincode', label: 'Pincode', placeholder: '452001' },
                  { key: 'gstin', label: 'GSTIN', placeholder: '23AAAAA0000A1Z5' },
                  { key: 'pan', label: 'PAN', placeholder: 'AAAAA0000A' },
                  {
                    key: 'drugLicenseNo',
                    label: 'Drug License No.',
                    placeholder: 'DL/MP/2024/001234',
                  },
                ].map((field) => (
                  <div key={field.key} className={field.key === 'address' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={(settings[field.key as keyof StoreSettings] as string) || ''}
                      onChange={(e) =>
                        setSettings((p) => (p ? { ...p, [field.key]: e.target.value } : p))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GST Tab */}
          {activeTab === 'gst' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                GST Configuration
              </h3>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">GST Registered</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your pharmacy is registered for GST filing
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings((p) => (p ? { ...p, gstRegistered: !p.gstRegistered } : p))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.gstRegistered ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${settings.gstRegistered ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Default GST Rate
                </label>
                <select
                  value={settings.defaultGstRate}
                  onChange={(e) =>
                    setSettings((p) =>
                      p ? { ...p, defaultGstRate: parseInt(e.target.value) as GSTRate } : p
                    )
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-slate-300">
                <p className="font-semibold text-indigo-300 mb-1">📋 GST Filing</p>
                <p className="text-slate-400">
                  GSTIN: <span className="text-white font-mono">{settings.gstin}</span>
                </p>
                <p className="text-slate-400 mt-1">Generate GSTR-1 from the Reports section.</p>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Invoice Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) =>
                      setSettings((p) => (p ? { ...p, invoicePrefix: e.target.value } : p))
                    }
                    placeholder="INVC"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={settings.invoiceStartNumber}
                    onChange={(e) =>
                      setSettings((p) =>
                        p ? { ...p, invoiceStartNumber: parseInt(e.target.value) } : p
                      )
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-400">
                Preview:{' '}
                <span className="text-white font-mono font-semibold">
                  {settings.invoicePrefix}-{settings.invoiceStartNumber}
                </span>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Alert Thresholds
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Low Stock Alert Threshold (units)
                  </label>
                  <input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) =>
                      setSettings((p) =>
                        p ? { ...p, lowStockThreshold: parseInt(e.target.value) } : p
                      )
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Alert when stock drops below this number
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Near Expiry Alert (days)
                  </label>
                  <input
                    type="number"
                    value={settings.nearExpiryDays}
                    onChange={(e) =>
                      setSettings((p) =>
                        p ? { ...p, nearExpiryDays: parseInt(e.target.value) } : p
                      )
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Alert when a batch expires within this many days
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Backup & Data
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: '📥',
                    label: 'Export All Data',
                    desc: 'Download a complete backup of all pharmacy data as JSON',
                    action: 'Export',
                    color: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
                  },
                  {
                    icon: '📊',
                    label: 'Export Inventory (CSV)',
                    desc: 'Download current stock as a CSV spreadsheet',
                    action: 'Export CSV',
                    color: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
                  },
                  {
                    icon: '🧾',
                    label: 'Export Sales Log',
                    desc: 'Download all invoices for this financial year',
                    action: 'Export',
                    color: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all ${item.color}`}
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300">
                <p className="font-semibold text-emerald-300 mb-1">☁️ Auto Backup</p>
                <p className="text-slate-400">
                  Your data is automatically backed up to Supabase cloud every 24 hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

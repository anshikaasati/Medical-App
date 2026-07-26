'use client';

import React, { useState, useEffect } from 'react';
import { StaffUser } from '@/types';
import { getAllStaff, toggleStaffStatus } from '@/services/staff.service';

const PERMISSIONS = [
  { key: 'billing', label: 'Billing', icon: '🛒' },
  { key: 'inventory', label: 'Inventory', icon: '💊' },
  { key: 'purchase', label: 'Purchase', icon: '📦' },
  { key: 'sales', label: 'Sales', icon: '📈' },
  { key: 'customers', label: 'Customers', icon: '👥' },
  { key: 'suppliers', label: 'Suppliers', icon: '🏭' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'analytics', label: 'Analytics', icon: '🔍' },
  { key: 'userManagement', label: 'User Mgmt', icon: '⚙️' },
  { key: 'settings', label: 'Settings', icon: '🔧' },
] as const;

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  MANAGER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  STAFF: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'STAFF',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getAllStaff('store_01').then((data) => {
      setStaff(data);
      setLoading(false);
    });
  }, []);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = async (id: string) => {
    const updated = await toggleStaffStatus(id);
    if (updated) setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.email || !newForm.password) {
      setFormError('Name, email and password are required.');
      return;
    }
    setFormLoading(true);
    // In production: call supabase.auth.admin.createUser
    // For now using mock service
    const { createStaff } = await import('@/services/staff.service');
    const created = await createStaff({
      ...newForm,
      role: newForm.role as StaffUser['role'],
      storeId: 'store_01',
      status: 'ACTIVE',
    });
    setStaff((prev) => [...prev, created]);
    setShowNewForm(false);
    setNewForm({ name: '', email: '', phone: '', employeeId: '', role: 'STAFF', password: '' });
    setFormLoading(false);
    setFormError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Staff Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create staff, assign roles and manage permissions.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 transition-all shadow-md"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff.length, color: 'text-white' },
          {
            label: 'Active',
            value: staff.filter((s) => s.status === 'ACTIVE').length,
            color: 'text-emerald-400',
          },
          {
            label: 'Suspended',
            value: staff.filter((s) => s.status === 'SUSPENDED').length,
            color: 'text-red-400',
          },
          {
            label: 'Managers',
            value: staff.filter((s) => s.role === 'MANAGER').length,
            color: 'text-indigo-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-3xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="divide-y divide-slate-800/60">
            {filtered.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedStaff(member)}
                className={`w-full text-left p-4 hover:bg-slate-900 transition-colors ${selectedStaff?.id === member.id ? 'bg-slate-900 border-l-2 border-indigo-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                  </div>
                  <div className="ml-auto shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${ROLE_COLORS[member.role] || ROLE_COLORS.STAFF}`}
                    >
                      {member.role}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${member.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Staff Detail / Permissions */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          {selectedStaff ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-xl">
                    {selectedStaff.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedStaff.name}</h3>
                    <p className="text-sm text-slate-400">{selectedStaff.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedStaff.phone} · ID: {selectedStaff.employeeId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full border ${ROLE_COLORS[selectedStaff.role] || ROLE_COLORS.STAFF}`}
                  >
                    {selectedStaff.role}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(selectedStaff.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${selectedStaff.status === 'ACTIVE' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                  >
                    {selectedStaff.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </button>
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Module Permissions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map(({ key, label, icon }) => {
                    const enabled = selectedStaff.permissions[key];
                    const isOwner = selectedStaff.role === 'OWNER';
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${enabled ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/40'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{icon}</span>
                          <span className="text-xs font-semibold text-slate-300">{label}</span>
                        </div>
                        <button
                          disabled={isOwner}
                          onClick={async () => {
                            const updated = { ...selectedStaff.permissions, [key]: !enabled };
                            const { updateStaffPermissions } =
                              await import('@/services/staff.service');
                            const result = await updateStaffPermissions(selectedStaff.id, updated);
                            if (result) {
                              setSelectedStaff(result);
                              setStaff((prev) =>
                                prev.map((s) => (s.id === result.id ? result : s))
                              );
                            }
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'} ${isOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-4' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedStaff.lastLogin && (
                <p className="text-xs text-slate-600">
                  Last login: {new Date(selectedStaff.lastLogin).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
              <div className="text-4xl">👆</div>
              <p className="text-slate-400 text-sm">
                Select a staff member to view and edit their permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Staff Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add New Staff Member</h3>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateStaff} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Priya Patel' },
                {
                  key: 'email',
                  label: 'Email *',
                  type: 'email',
                  placeholder: 'staff@pharmacy.com',
                },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
                { key: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'EMP-005' },
                {
                  key: 'password',
                  label: 'Password *',
                  type: 'password',
                  placeholder: 'Min. 8 characters',
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={newForm[field.key as keyof typeof newForm]}
                    onChange={(e) => setNewForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Role
                </label>
                <select
                  value={newForm.role}
                  onChange={(e) => setNewForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="STAFF">Staff / Cashier</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 rounded-xl border border-slate-700 text-slate-400 font-semibold py-2.5 text-sm hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-[2] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
                      Creating...
                    </>
                  ) : (
                    'Create Staff Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

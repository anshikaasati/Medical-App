'use client';

import React, { useState } from 'react';
import { StockMovementType } from '@/types';
import { MOCK_BATCHES } from '@/services/mock-data';

const ADJUSTMENT_TYPES = [
  { value: StockMovementType.DAMAGE, label: '⚠️ Damage Write-off', color: 'text-red-400' },
  { value: StockMovementType.RETURN, label: '↩️ Customer Return', color: 'text-amber-400' },
  { value: StockMovementType.ADJUSTMENT, label: '✏️ Manual Correction', color: 'text-indigo-400' },
  { value: StockMovementType.TRANSFER, label: '📤 Transfer Out', color: 'text-slate-400' },
];

export default function StockAdjustmentsPage() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [adjType, setAdjType] = useState<StockMovementType>(StockMovementType.DAMAGE);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const batch = MOCK_BATCHES.find((b) => b.id === selectedBatch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !quantity) return;
    setLoading(true);
    // TODO: Replace with real API: POST /api/stock-movements
    // This would: write to stock_movements table, decrement batch current_stock
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedBatch('');
    setQuantity('');
    setNotes('');
    setAdjType(StockMovementType.DAMAGE);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Stock Adjustment</h2>
        <p className="text-sm text-slate-400 mt-1">
          Record damage, returns, and manual corrections. All changes are written to the stock
          ledger.
        </p>
      </div>

      {/* Warning Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-400 flex gap-3">
        <span className="text-lg shrink-0">⚠️</span>
        <div>
          <p className="font-semibold mb-0.5">Important: This action is irreversible via the UI.</p>
          <p>
            All adjustments are logged to the stock ledger with your user ID, timestamp, and reason.
            Corrections require a separate entry.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h3 className="text-lg font-bold text-white">Adjustment Recorded</h3>
          <p className="text-sm text-slate-400">
            {adjType === StockMovementType.DAMAGE
              ? 'Damage write-off'
              : adjType === StockMovementType.RETURN
                ? 'Return'
                : 'Manual correction'}{' '}
            of <strong className="text-white">{quantity} units</strong> of{' '}
            <strong className="text-white">{batch?.medicineName}</strong> has been logged to the
            stock ledger.
          </p>
          <button
            onClick={handleReset}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm transition-all"
          >
            Record Another Adjustment
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6"
        >
          {/* Batch Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Medicine Batch *
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="">— Choose a batch —</option>
              {MOCK_BATCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.medicineName} — Batch {b.batchNumber} (Stock: {b.currentStock})
                </option>
              ))}
            </select>
          </div>

          {/* Batch Info Card */}
          {batch && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Current Stock</p>
                <p className="text-white font-bold text-lg mt-0.5">{batch.currentStock}</p>
              </div>
              <div>
                <p className="text-slate-500">Expiry Date</p>
                <p className="text-white font-semibold mt-0.5">
                  {new Date(batch.expiryDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Supplier</p>
                <p className="text-white font-semibold mt-0.5">{batch.supplierName || '—'}</p>
              </div>
            </div>
          )}

          {/* Adjustment Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ADJUSTMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAdjType(type.value)}
                  className={`rounded-lg border p-3 text-left text-xs font-semibold transition-all ${adjType === type.value ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'}`}
                >
                  <span className={type.color}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={batch?.currentStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={batch ? `Max: ${batch.currentStock}` : 'Enter quantity'}
              required
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Reason / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the reason for this adjustment..."
              rows={3}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedBatch || !quantity}
            className="w-full rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold py-3 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
                Processing...
              </>
            ) : (
              'Record Adjustment →'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Enabled to parse nested Supabase bill items and batches relation shape */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FormattedCurrency, FormattedDate } from '@/components/shared/Formatter';

// Utility to convert numbers to Indian Rupee Words
function convertNumberToWords(amount: number) {
  const words = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (amount === 0) return 'Rupees Zero Only';

  let n = Math.floor(amount);
  if (n < 0) return '';

  let str = '';

  if (Math.floor(n / 10000000) > 0) {
    str += convertNumberToWords(n / 10000000).replace(' Only', '') + ' Crore ';
    n %= 10000000;
  }
  if (Math.floor(n / 100000) > 0) {
    str += convertNumberToWords(n / 100000).replace(' Only', '') + ' Lakh ';
    n %= 100000;
  }
  if (Math.floor(n / 1000) > 0) {
    str += convertNumberToWords(n / 1000).replace(' Only', '') + ' Thousand ';
    n %= 1000;
  }
  if (Math.floor(n / 100) > 0) {
    str += convertNumberToWords(n / 100).replace(' Only', '') + ' Hundred ';
    n %= 100;
  }

  if (n > 0) {
    if (str !== '') str += 'and ';
    if (n < 20) {
      str += words[n] + ' ';
    } else {
      str += tens[Math.floor(n / 10)] + ' ' + words[n % 10] + ' ';
    }
  }

  return 'Rupees ' + str.trim() + ' Only';
}

export default function InvoicePage() {
  const params = useParams();
  const supabase = createClient();

  const billId = params.id as string;

  // States
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  // Fallback seed invoice for preview/trial if database returns nothing
  const loadFallbackInvoice = useCallback(() => {
    setBill({
      id: billId,
      created_at: new Date().toISOString(),
      status: 'finalized',
      subtotal_paise: 29000, // ₹290.00
      discount_paise: 2000, // ₹20.00
      total_tax_paise: 3108, // ₹31.08 inclusive tax
      total_amount_paise: 27000, // ₹270.00
      customer: {
        name: 'Amit Sharma',
        phone: '9876543210',
      },
      cashier: {
        name: 'Dr. Anshika Asati',
      },
    });
    setItems([
      {
        id: 'bi_01',
        quantity: 2,
        unit_price_paise: 14500, // ₹145.00
        gst_rate: 12,
        gst_amount_paise: 3108,
        mrp_paise: 14500,
        batch_number: 'AMX-26A',
        medicine_name: 'Amoxicillin 500mg',
        hsn_code: '30041010',
      },
    ]);
  }, [billId]);

  useEffect(() => {
    async function loadInvoiceData() {
      setLoading(true);
      try {
        const { data: billData, error: billErr } = await supabase
          .from('bills')
          .select(
            `
            id,
            created_at,
            status,
            subtotal_paise,
            discount_paise,
            total_tax_paise,
            total_amount_paise,
            customers (name, phone),
            users!bills_cashier_id_fkey (name)
          `
          )
          .eq('id', billId)
          .single();

        if (billErr || !billData) {
          loadFallbackInvoice();
          setLoading(false);
          return;
        }

        setBill({
          id: billData.id,
          created_at: billData.created_at,
          status: billData.status,
          subtotal_paise: billData.subtotal_paise,
          discount_paise: billData.discount_paise,
          total_tax_paise: billData.total_tax_paise,
          total_amount_paise: billData.total_amount_paise,
          customer: billData.customers
            ? {
                name: Array.isArray(billData.customers)
                  ? (billData.customers[0] as any)?.name
                  : (billData.customers as any)?.name,
                phone: Array.isArray(billData.customers)
                  ? (billData.customers[0] as any)?.phone
                  : (billData.customers as any)?.phone,
              }
            : { name: 'Walk-in Customer', phone: '—' },
          cashier: billData.users
            ? {
                name: Array.isArray(billData.users)
                  ? (billData.users[0] as any)?.name
                  : (billData.users as any)?.name,
              }
            : { name: 'Store Cashier' },
        });

        // Fetch bill items
        const { data: itemsData } = await supabase
          .from('bill_items')
          .select(
            `
            id,
            quantity,
            unit_price_paise,
            gst_rate,
            gst_amount_paise,
            mrp_paise,
            medicine_batches (
              batch_number,
              medicines (name, hsn_code)
            )
          `
          )
          .eq('bill_id', billId);

        if (itemsData) {
          const formattedItems = itemsData.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            unit_price_paise: item.unit_price_paise,
            gst_rate: Number(item.gst_rate),
            gst_amount_paise: item.gst_amount_paise,
            mrp_paise: item.mrp_paise,
            batch_number: item.medicine_batches?.batch_number || '—',
            medicine_name: item.medicine_batches?.medicines?.name || 'Unknown Product',
            hsn_code: item.medicine_batches?.medicines?.hsn_code || '—',
          }));
          setItems(formattedItems);
        }
      } catch {
        loadFallbackInvoice();
      } finally {
        setLoading(false);
      }
    }
    loadInvoiceData();
  }, [billId, supabase, loadFallbackInvoice]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-slate-400">
        <div className="text-center space-y-4">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent inline-block" />
          <p className="text-xs font-semibold text-slate-500">Retrieving tax invoice details...</p>
        </div>
      </div>
    );
  }

  // Calculate taxes summary (grouped by GST rate)
  const gstBreakdownMap = new Map<number, { taxableValue: number; cgst: number; sgst: number }>();
  items.forEach((item) => {
    const rate = item.gst_rate;
    const rowTotal = item.unit_price_paise * item.quantity;
    const gstAmt = item.gst_amount_paise;
    const taxable = rowTotal - gstAmt;

    const existing = gstBreakdownMap.get(rate) || { taxableValue: 0, cgst: 0, sgst: 0 };
    gstBreakdownMap.set(rate, {
      taxableValue: existing.taxableValue + taxable,
      cgst: existing.cgst + Math.round(gstAmt / 2),
      sgst: existing.sgst + Math.round(gstAmt / 2),
    });
  });

  const gstBreakdownArray = Array.from(gstBreakdownMap.entries()).map(([rate, vals]) => ({
    rate,
    ...vals,
  }));

  const totalAmountInWords = convertNumberToWords(bill.total_amount_paise / 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action header (hidden on print) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
        <div className="space-y-1">
          <Link
            href="/dashboard/billing"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            ← Back to Billing Desk
          </Link>
          <h2 className="text-lg font-bold text-white">Invoice committed successfully</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2 transition-all shadow active:scale-[0.98] flex items-center gap-1.5"
          >
            🖨️ Print / Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card structure */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-premium print:border-none print:shadow-none print:p-0">
        {/* Header pharmacy details */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 font-heading">
              MargPharmacy Sector 12
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-650">
              Tax Invoice - GSTIN: 07AAAAA1111A1Z1
            </span>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Plot 14, Sector 12 Commercial Hub, Dwarka, New Delhi - 110075
              <br />
              Phone: +91 11 4455 6677 | Email: support@margpharmacy.com
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              INVOICE NO
            </span>
            <span className="font-mono text-sm font-bold text-slate-900">
              {bill.id.slice(0, 18).toUpperCase()}
            </span>

            <div className="pt-2 text-xs text-slate-500 space-y-0.5">
              <span className="block">
                Date: <FormattedDate dateString={bill.created_at} />
              </span>
              <span className="block">
                Time:{' '}
                {new Date(bill.created_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="block">Cashier: {bill.cashier.name}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-slate-200 text-xs text-slate-650">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Billed To (Customer)
            </span>
            <span className="block text-sm font-bold text-slate-900">{bill.customer.name}</span>
            {bill.customer.phone && (
              <span className="block text-slate-500">Phone: {bill.customer.phone}</span>
            )}
          </div>
          <div className="text-left md:text-right">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Store Details
            </span>
            <span className="block font-bold text-slate-900">Main Pharmacy Retail Counter</span>
            <span className="block text-slate-500">Store ID: Main Counter 1</span>
          </div>
        </div>

        {/* Medicine Bill Items table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">S.No.</th>
                <th className="py-2.5">Medicine Description</th>
                <th className="py-2.5">Batch</th>
                <th className="py-2.5 font-mono">HSN</th>
                <th className="py-2.5 text-right font-mono">MRP</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Taxable Val</th>
                <th className="py-2.5 text-center">GST %</th>
                <th className="py-2.5 text-right">Net Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item, idx) => {
                const rowTotal = item.unit_price_paise * item.quantity;
                const gstAmount = item.gst_amount_paise;
                const taxableValue = rowTotal - gstAmount;
                return (
                  <tr key={item.id} className="py-2.5">
                    <td className="py-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 font-bold text-slate-900">{item.medicine_name}</td>
                    <td className="py-3 font-mono text-slate-500">{item.batch_number}</td>
                    <td className="py-3 font-mono text-slate-500">{item.hsn_code}</td>
                    <td className="py-3 text-right font-mono">
                      <FormattedCurrency paise={item.mrp_paise} />
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-mono">
                      <FormattedCurrency paise={taxableValue} />
                    </td>
                    <td className="py-3 text-center font-semibold text-slate-400">
                      {item.gst_rate}%
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      <FormattedCurrency paise={rowTotal} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GST Splitting Breakdown (Indian Compliance) */}
        <div className="border-t border-slate-200 py-6">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            GST Tax Split Breakdown
          </h4>
          <table className="w-full text-left border-collapse text-[11px] text-slate-650">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                <th>Tax Rate</th>
                <th>Taxable Value</th>
                <th>CGST Rate</th>
                <th>CGST Amount</th>
                <th>SGST Rate</th>
                <th>SGST Amount</th>
                <th className="text-right">Total Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {gstBreakdownArray.map((gst) => {
                const totalTax = gst.cgst + gst.sgst;
                return (
                  <tr key={gst.rate} className="py-2">
                    <td className="py-2">{gst.rate}% GST</td>
                    <td className="py-2">
                      <FormattedCurrency paise={gst.taxableValue} />
                    </td>
                    <td className="py-2">{(gst.rate / 2).toFixed(1)}%</td>
                    <td className="py-2">
                      <FormattedCurrency paise={gst.cgst} />
                    </td>
                    <td className="py-2">{(gst.rate / 2).toFixed(1)}%</td>
                    <td className="py-2">
                      <FormattedCurrency paise={gst.sgst} />
                    </td>
                    <td className="py-2 text-right text-slate-900 font-bold">
                      <FormattedCurrency paise={totalTax} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Signatures */}
        <div className="border-t border-slate-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Words */}
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Amount in Words
              </span>
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                {totalAmountInWords}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
              <span className="block font-bold text-slate-700">Declarations & Terms:</span>
              <p>
                1. Medicines once sold cannot be returned or exchanged unless recalled by the
                manufacturer.
                <br />
                2. Expiry dates must be checked by the customer at the billing counter.
              </p>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="space-y-4">
            <div className="space-y-2.5 text-xs text-slate-650 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>Gross Value (Tax Inclusive)</span>
                <span className="font-mono text-slate-900">
                  <FormattedCurrency paise={bill.subtotal_paise} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount applied</span>
                <span className="font-mono text-rose-600">
                  -<FormattedCurrency paise={bill.discount_paise} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>CGST Component Total</span>
                <span className="font-mono">
                  <FormattedCurrency paise={Math.round(bill.total_tax_paise / 2)} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>SGST Component Total</span>
                <span className="font-mono">
                  <FormattedCurrency paise={Math.round(bill.total_tax_paise / 2)} />
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-950">
              <span>NET PAYABLE AMOUNT</span>
              <span className="font-mono text-lg text-slate-950">
                <FormattedCurrency paise={bill.total_amount_paise} />
              </span>
            </div>

            {/* Signature Area */}
            <div className="pt-8 text-center flex justify-between items-end text-[10px] text-slate-400 font-semibold uppercase">
              <div>
                <span className="block border-t border-slate-200 pt-1.5 w-32">Customer Sign</span>
              </div>
              <div>
                <span className="block border-t border-slate-200 pt-1.5 w-32">Auth Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

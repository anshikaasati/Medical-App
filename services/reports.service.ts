/**
 * Reports Service — generates sales, inventory, and GST reports.
 */

import { DailySalesReport, MedicineSalesReport } from '@/types';

/** Generates last N days of daily sales data */
export async function getDailySalesReport(days: number = 30): Promise<DailySalesReport[]> {
  const report: DailySalesReport[] = [];
  const now = new Date();
  const topMeds = [
    'Amoxicillin 500mg',
    'Paracetamol 650mg',
    'Atorvastatin 10mg',
    'Metformin 500mg',
    'Cetirizine 10mg',
  ];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const base = 80000 + Math.floor(Math.random() * 120000);
    report.push({
      date: dateStr,
      totalSalesInPaise: base,
      totalProfitInPaise: Math.round(base * (0.2 + Math.random() * 0.1)),
      invoiceCount: 8 + Math.floor(Math.random() * 20),
      topMedicine: topMeds[Math.floor(Math.random() * topMeds.length)],
    });
  }
  return Promise.resolve(report);
}

/** Returns top selling medicines */
export async function getTopMedicinesReport(): Promise<MedicineSalesReport[]> {
  return Promise.resolve([
    {
      medicineId: 'med_01',
      medicineName: 'Amoxicillin 500mg',
      category: 'Antibiotics',
      unitsSold: 420,
      revenueInPaise: 6090000,
      profitInPaise: 2100000,
    },
    {
      medicineId: 'med_02',
      medicineName: 'Paracetamol 650mg',
      category: 'Analgesics',
      unitsSold: 380,
      revenueInPaise: 1216000,
      profitInPaise: 456000,
    },
    {
      medicineId: 'med_03',
      medicineName: 'Atorvastatin 10mg',
      category: 'Cardiology',
      unitsSold: 210,
      revenueInPaise: 3885000,
      profitInPaise: 1365000,
    },
    {
      medicineId: 'med_04',
      medicineName: 'Metformin 500mg',
      category: 'Antidiabetic',
      unitsSold: 190,
      revenueInPaise: 1520000,
      profitInPaise: 475000,
    },
    {
      medicineId: 'med_05',
      medicineName: 'Cetirizine 10mg',
      category: 'Antihistamines',
      unitsSold: 145,
      revenueInPaise: 406000,
      profitInPaise: 116000,
    },
    {
      medicineId: 'med_06',
      medicineName: 'Omeprazole 20mg',
      category: 'Gastrology',
      unitsSold: 120,
      revenueInPaise: 960000,
      profitInPaise: 288000,
    },
  ]);
}

/** Monthly summary for current year */
export async function getMonthlySummary(): Promise<
  { month: string; salesInPaise: number; profitInPaise: number }[]
> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return Promise.resolve(
    months.map((month) => {
      const sales = 2500000 + Math.floor(Math.random() * 1500000);
      return { month, salesInPaise: sales, profitInPaise: Math.round(sales * 0.22) };
    })
  );
}

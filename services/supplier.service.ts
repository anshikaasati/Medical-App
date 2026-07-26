/**
 * Supplier Service — manages suppliers and purchase history.
 * Swap mock implementations with real API/Supabase calls without UI changes.
 */

import { Supplier } from '@/types';
import { MOCK_SUPPLIERS } from './mock-data';

export async function getAllSuppliers(_storeId: string): Promise<Supplier[]> {
  return Promise.resolve([...MOCK_SUPPLIERS]);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  return Promise.resolve(MOCK_SUPPLIERS.find((s) => s.id === id) ?? null);
}

export async function createSupplier(
  data: Omit<
    Supplier,
    'id' | 'createdAt' | 'updatedAt' | 'outstandingBalanceInPaise' | 'totalPurchasesInPaise'
  >
): Promise<Supplier> {
  const newSupplier: Supplier = {
    id: `sup_${Date.now()}`,
    ...data,
    outstandingBalanceInPaise: 0,
    totalPurchasesInPaise: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_SUPPLIERS.push(newSupplier);
  return Promise.resolve(newSupplier);
}

export async function updateSupplier(
  id: string,
  data: Partial<Supplier>
): Promise<Supplier | null> {
  const idx = MOCK_SUPPLIERS.findIndex((s) => s.id === id);
  if (idx === -1) return Promise.resolve(null);
  MOCK_SUPPLIERS[idx] = { ...MOCK_SUPPLIERS[idx], ...data, updatedAt: new Date().toISOString() };
  return Promise.resolve({ ...MOCK_SUPPLIERS[idx] });
}

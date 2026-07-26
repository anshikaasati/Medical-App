/**
 * Purchase Service — manages purchase orders and stock receipts.
 * Swap mock implementations with real API/Supabase calls without UI changes.
 */

import { PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { MOCK_PURCHASE_ORDERS } from './mock-data';

export async function getAllPurchaseOrders(_storeId: string): Promise<PurchaseOrder[]> {
  return Promise.resolve(
    [...MOCK_PURCHASE_ORDERS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  return Promise.resolve(MOCK_PURCHASE_ORDERS.find((p) => p.id === id) ?? null);
}

export async function createPurchaseOrder(
  data: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<PurchaseOrder> {
  const count = MOCK_PURCHASE_ORDERS.length + 1;
  const newPO: PurchaseOrder = {
    id: `po_${Date.now()}`,
    orderNumber: `PO-2026-${String(count + 48).padStart(4, '0')}`,
    ...data,
    status: PurchaseOrderStatus.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_PURCHASE_ORDERS.push(newPO);
  return Promise.resolve(newPO);
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus
): Promise<PurchaseOrder | null> {
  const idx = MOCK_PURCHASE_ORDERS.findIndex((p) => p.id === id);
  if (idx === -1) return Promise.resolve(null);
  MOCK_PURCHASE_ORDERS[idx] = {
    ...MOCK_PURCHASE_ORDERS[idx],
    status,
    updatedAt: new Date().toISOString(),
    ...(status === PurchaseOrderStatus.RECEIVED ? { receivedAt: new Date().toISOString() } : {}),
  };
  return Promise.resolve({ ...MOCK_PURCHASE_ORDERS[idx] });
}

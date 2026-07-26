/**
 * Customer Service — manages customer profiles and loyalty.
 * Swap mock implementations with real API/Supabase calls without UI changes.
 */

import { CustomerProfile } from '@/types';
import { MOCK_CUSTOMERS } from './mock-data';

export async function getAllCustomers(_storeId: string): Promise<CustomerProfile[]> {
  return Promise.resolve([...MOCK_CUSTOMERS]);
}

export async function getCustomerById(id: string): Promise<CustomerProfile | null> {
  return Promise.resolve(MOCK_CUSTOMERS.find((c) => c.id === id) ?? null);
}

export async function searchCustomers(query: string): Promise<CustomerProfile[]> {
  const q = query.toLowerCase();
  return Promise.resolve(
    MOCK_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  );
}

export async function createCustomer(
  data: Omit<
    CustomerProfile,
    | 'id'
    | 'createdAt'
    | 'loyaltyPoints'
    | 'outstandingCreditInPaise'
    | 'totalPurchasesInPaise'
    | 'totalOrders'
  >
): Promise<CustomerProfile> {
  const newCustomer: CustomerProfile = {
    id: `cust_${Date.now()}`,
    ...data,
    loyaltyPoints: 0,
    outstandingCreditInPaise: 0,
    totalPurchasesInPaise: 0,
    totalOrders: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_CUSTOMERS.push(newCustomer);
  return Promise.resolve(newCustomer);
}

export async function updateCustomer(
  id: string,
  data: Partial<CustomerProfile>
): Promise<CustomerProfile | null> {
  const idx = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (idx === -1) return Promise.resolve(null);
  MOCK_CUSTOMERS[idx] = { ...MOCK_CUSTOMERS[idx], ...data };
  return Promise.resolve({ ...MOCK_CUSTOMERS[idx] });
}

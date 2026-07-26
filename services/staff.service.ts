/**
 * Staff Service — manages staff users and permissions.
 * Swap the mock implementations with real API/Supabase calls
 * without changing any UI component that consumes this service.
 */

import { StaffUser, UserRole, DEFAULT_STAFF_PERMISSIONS } from '@/types';
import { MOCK_STAFF } from './mock-data';

/** Returns all staff for a store */
export async function getAllStaff(_storeId: string): Promise<StaffUser[]> {
  // TODO: Replace with: supabase.from('users').select('*').eq('store_id', storeId)
  return Promise.resolve([...MOCK_STAFF]);
}

/** Returns a single staff member by ID */
export async function getStaffById(id: string): Promise<StaffUser | null> {
  return Promise.resolve(MOCK_STAFF.find((s) => s.id === id) ?? null);
}

/** Creates a new staff member */
export async function createStaff(
  data: Omit<StaffUser, 'id' | 'createdAt' | 'permissions'> & { password: string }
): Promise<StaffUser> {
  // TODO: Replace with supabase.auth.admin.createUser + insert into users
  const newStaff: StaffUser = {
    id: `user_${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    employeeId: data.employeeId,
    status: 'ACTIVE',
    storeId: data.storeId,
    createdAt: new Date().toISOString(),
    permissions:
      data.role === UserRole.OWNER || data.role === UserRole.MANAGER
        ? {
            billing: true,
            inventory: true,
            purchase: true,
            sales: true,
            customers: true,
            suppliers: true,
            reports: true,
            analytics: data.role === UserRole.OWNER,
            userManagement: data.role === UserRole.OWNER,
            settings: data.role === UserRole.OWNER,
          }
        : DEFAULT_STAFF_PERMISSIONS,
  };
  MOCK_STAFF.push(newStaff);
  return Promise.resolve(newStaff);
}

/** Updates permissions for a staff member */
export async function updateStaffPermissions(
  id: string,
  permissions: StaffUser['permissions']
): Promise<StaffUser | null> {
  const staff = MOCK_STAFF.find((s) => s.id === id);
  if (!staff) return Promise.resolve(null);
  staff.permissions = permissions;
  return Promise.resolve({ ...staff });
}

/** Toggles staff active/suspended status */
export async function toggleStaffStatus(id: string): Promise<StaffUser | null> {
  const staff = MOCK_STAFF.find((s) => s.id === id);
  if (!staff) return Promise.resolve(null);
  staff.status = staff.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  return Promise.resolve({ ...staff });
}

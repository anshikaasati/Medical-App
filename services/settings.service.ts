/**
 * Settings Service — manages store configuration.
 */

import { StoreSettings } from '@/types';
import { MOCK_STORE_SETTINGS } from './mock-data';

let _settings = { ...MOCK_STORE_SETTINGS };

export async function getStoreSettings(_storeId: string): Promise<StoreSettings> {
  return Promise.resolve({ ..._settings });
}

export async function updateStoreSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
  _settings = { ..._settings, ...data };
  return Promise.resolve({ ..._settings });
}

/** Checks if initial setup has been completed */
export async function isSetupCompleted(): Promise<boolean> {
  // TODO: Replace with: supabase.from('stores').select('setup_completed').single()
  return Promise.resolve(_settings.setupCompleted);
}

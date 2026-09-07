import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  createHnkSupabaseClient,
  type HnkAuthStorage,
  type HnkSupabaseClient,
} from '@hnk/supabase-client';

const AUTH_PREFIX = 'hnk.auth.v1';
const AUTH_SERVICE = 'hnk.auth.v1';
const CHUNK_SIZE = 1800;

function safeKey(key: string): string {
  return `${AUTH_PREFIX}.${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

function nativeChunkKey(key: string, index: number): string {
  return `${safeKey(key)}.chunk.${index}`;
}

function nativeMetaKey(key: string): string {
  return `${safeKey(key)}.meta`;
}

const nativeOptions: SecureStore.SecureStoreOptions = {
  keychainService: AUTH_SERVICE,
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function removeNativeChunks(key: string): Promise<void> {
  const rawMeta = await SecureStore.getItemAsync(nativeMetaKey(key), nativeOptions);
  const count = rawMeta ? Number.parseInt(rawMeta, 10) : 0;
  if (Number.isFinite(count) && count > 0) {
    await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.deleteItemAsync(nativeChunkKey(key, index), nativeOptions),
      ),
    );
  }
  await SecureStore.deleteItemAsync(nativeMetaKey(key), nativeOptions);
}

const nativeStorage: HnkAuthStorage = {
  async getItem(key) {
    const available = await SecureStore.isAvailableAsync();
    if (!available) throw new Error('auth_secure_storage_unavailable');
    const rawMeta = await SecureStore.getItemAsync(nativeMetaKey(key), nativeOptions);
    if (!rawMeta) return null;
    const count = Number.parseInt(rawMeta, 10);
    if (!Number.isInteger(count) || count < 1 || count > 64) {
      throw new Error('auth_secure_storage_invalid_metadata');
    }
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(nativeChunkKey(key, index), nativeOptions),
      ),
    );
    if (chunks.some((chunk) => chunk == null)) {
      throw new Error('auth_secure_storage_incomplete');
    }
    return chunks.join('');
  },
  async setItem(key, value) {
    const available = await SecureStore.isAvailableAsync();
    if (!available) throw new Error('auth_secure_storage_unavailable');
    await removeNativeChunks(key);
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) ?? [''];
    if (chunks.length > 64) throw new Error('auth_session_too_large');
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(nativeChunkKey(key, index), chunk, nativeOptions),
      ),
    );
    await SecureStore.setItemAsync(nativeMetaKey(key), String(chunks.length), nativeOptions);
  },
  async removeItem(key) {
    await removeNativeChunks(key);
  },
};

const webStorage: HnkAuthStorage = {
  getItem(key) {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage.getItem(safeKey(key));
  },
  setItem(key, value) {
    if (typeof globalThis.localStorage === 'undefined') return;
    globalThis.localStorage.setItem(safeKey(key), value);
  },
  removeItem(key) {
    if (typeof globalThis.localStorage === 'undefined') return;
    globalThis.localStorage.removeItem(safeKey(key));
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const hnkSupabaseConfigured =
  url.startsWith('https://') &&
  publishableKey.length > 20 &&
  !publishableKey.includes('replace-with');

export const hnkSupabase: HnkSupabaseClient | null = hnkSupabaseConfigured
  ? createHnkSupabaseClient(url, publishableKey, {
      auth: {
        storage: Platform.OS === 'web' ? webStorage : nativeStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let lifecycleRegistered = false;

export function registerMobileAuthLifecycle(): () => void {
  if (!hnkSupabase || Platform.OS === 'web' || lifecycleRegistered) return () => {};
  lifecycleRegistered = true;

  if (AppState.currentState === 'active') {
    hnkSupabase.auth.startAutoRefresh();
  }

  const subscription = AppState.addEventListener('change', (state) => {
    if (!hnkSupabase) return;
    if (state === 'active') hnkSupabase.auth.startAutoRefresh();
    else hnkSupabase.auth.stopAutoRefresh();
  });

  return () => {
    subscription.remove();
    hnkSupabase?.auth.stopAutoRefresh();
    lifecycleRegistered = false;
  };
}

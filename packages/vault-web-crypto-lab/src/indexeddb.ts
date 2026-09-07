import type { DeviceEnvelopeV1 } from './index.ts';

const DB_VERSION = 1;
const STORE = 'device-enrollments';

export interface StoredDeviceEnrollmentV1 {
  id: string;
  userId: string;
  keyVersion: number;
  deviceId: string;
  deviceKek: CryptoKey;
  envelope: DeviceEnvelopeV1;
  createdAt: string;
}

function enrollmentId(userId: string, keyVersion: number, deviceId: string): string {
  return `${userId}:${keyVersion}:${deviceId}`;
}

function requireIndexedDb(): IDBFactory {
  if (typeof indexedDB === 'undefined') throw new Error('indexeddb_unavailable');
  return indexedDB;
}

async function openDb(dbName: string): Promise<IDBDatabase> {
  const factory = requireIndexedDb();
  return new Promise((resolve, reject) => {
    const request = factory.open(dbName, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('indexeddb_open_failed'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('indexeddb_request_failed'));
  });
}

export async function persistDeviceEnrollment(
  input: Omit<StoredDeviceEnrollmentV1, 'id' | 'createdAt'>,
  dbName = 'hnk-vault-crypto-lab-v1',
): Promise<StoredDeviceEnrollmentV1> {
  if (input.deviceKek.extractable) throw new Error('vault_device_kek_must_be_non_extractable');
  const record: StoredDeviceEnrollmentV1 = {
    ...input,
    id: enrollmentId(input.userId, input.keyVersion, input.deviceId),
    createdAt: new Date().toISOString(),
  };
  const db = await openDb(dbName);
  try {
    const tx = db.transaction(STORE, 'readwrite');
    await requestResult(tx.objectStore(STORE).put(record));
    return record;
  } finally {
    db.close();
  }
}

export async function loadDeviceEnrollment(
  userId: string,
  keyVersion: number,
  deviceId: string,
  dbName = 'hnk-vault-crypto-lab-v1',
): Promise<StoredDeviceEnrollmentV1 | null> {
  const db = await openDb(dbName);
  try {
    const tx = db.transaction(STORE, 'readonly');
    const value = await requestResult(tx.objectStore(STORE).get(enrollmentId(userId, keyVersion, deviceId)));
    if (!value) return null;
    const record = value as StoredDeviceEnrollmentV1;
    if (!(record.deviceKek instanceof CryptoKey)) throw new Error('vault_device_kek_clone_invalid');
    if (record.deviceKek.extractable) throw new Error('vault_device_kek_extractable_after_roundtrip');
    return record;
  } finally {
    db.close();
  }
}

export async function deleteDeviceEnrollment(
  userId: string,
  keyVersion: number,
  deviceId: string,
  dbName = 'hnk-vault-crypto-lab-v1',
): Promise<void> {
  const db = await openDb(dbName);
  try {
    const tx = db.transaction(STORE, 'readwrite');
    await requestResult(tx.objectStore(STORE).delete(enrollmentId(userId, keyVersion, deviceId)));
  } finally {
    db.close();
  }
}

export async function deleteVaultLabDatabase(dbName = 'hnk-vault-crypto-lab-v1'): Promise<void> {
  const factory = requireIndexedDb();
  await new Promise<void>((resolve, reject) => {
    const request = factory.deleteDatabase(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('indexeddb_delete_failed'));
    request.onblocked = () => reject(new Error('indexeddb_delete_blocked'));
  });
}

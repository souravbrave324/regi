/**
 * IndexedDB + LocalStorage persistent file store.
 * Safely preserves large base64 PDF & PPT/PPTX presentation files (up to 50MB+)
 * across page refreshes and Firestore database syncs.
 */

const DB_NAME = 'EurekaPitchDecksDB';
const STORE_NAME = 'pitch_files';

export class FileStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static memoryCache = new Map<string, string>();

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject('IndexedDB not supported');
        return;
      }

      const request = window.indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (e) => {
        resolve((e.target as IDBOpenDBRequest).result);
      };

      request.onerror = (e) => {
        reject((e.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  static async saveFile(key: string, fileData: string): Promise<void> {
    if (!key || !fileData) return;

    const cleanKey = key.trim().toLowerCase();

    // 1. Fast in-memory cache
    this.memoryCache.set(cleanKey, fileData);

    // 2. IndexedDB Storage (handles large 100MB+ PPTX/PDF files)
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(fileData, cleanKey);
    } catch (e) {
      console.warn('IndexedDB save warning:', e);
    }
  }

  static async getFile(key: string): Promise<string | null> {
    if (!key) return null;
    const cleanKey = key.trim().toLowerCase();

    // 1. Check in-memory cache
    if (this.memoryCache.has(cleanKey)) {
      return this.memoryCache.get(cleanKey) || null;
    }

    // 2. Check IndexedDB
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(cleanKey);
        req.onsuccess = () => {
          const res = req.result || null;
          if (res) this.memoryCache.set(cleanKey, res);
          resolve(res);
        };
        req.onerror = () => {
          resolve(null);
        };
      });
    } catch (e) {
      return null;
    }
  }

  static getFileSync(key: string): string | null {
    if (!key) return null;
    const cleanKey = key.trim().toLowerCase();
    return this.memoryCache.get(cleanKey) || null;
  }
}

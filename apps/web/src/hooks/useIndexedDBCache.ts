"use client";

/**
 * useIndexedDBCache
 * -----------------
 * A thin, client-side IndexedDB wrapper for caching live API translation results
 * in the browser. Provides persistent, offline-resilient caching beyond the
 * session lifecycle of localStorage.
 *
 * Database:    cg-tourism-translations
 * ObjectStore: live-cache
 * Key format:  `${sourceLang}:${targetLang}:${hash}`
 *
 * Usage:
 *   const cache = useIndexedDBCache();
 *   await cache.set('en:hi:Hello', 'नमस्ते');
 *   const val = await cache.get('en:hi:Hello');
 */

const DB_NAME = "cg-tourism-translations";
const STORE_NAME = "live-cache";
const DB_VERSION = 1;

/**
 * Open (or create) the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available in this environment"));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve a cached translation by its cache key.
 * Returns null if not found or on error.
 *
 * @param cacheKey  Format: `${sourceLang}:${targetLang}:${sourceText}`
 */
export async function getCache(cacheKey: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(cacheKey);
      req.onsuccess = () => {
        const record = req.result as { cacheKey: string; value: string; createdAt: number } | undefined;
        resolve(record?.value ?? null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Store a translated string in the IndexedDB cache.
 *
 * @param cacheKey    Format: `${sourceLang}:${targetLang}:${sourceText}`
 * @param value       The translated text to cache.
 */
export async function setCache(cacheKey: string, value: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const req = tx.objectStore(STORE_NAME).put({
        cacheKey,
        value,
        createdAt: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Non-critical — proceed silently if IndexedDB write fails
  }
}

/**
 * Clear all cached translations (e.g., on language reset or logout).
 */
export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
    });
  } catch {
    // Non-critical
  }
}

/**
 * Hook-like export object for convenient destructured usage in components.
 * Note: These are standalone async functions, not a React hook per se,
 * to allow use both inside and outside React component trees.
 */
export const indexedDBCache = { getCache, setCache, clearCache };

const DB_NAME = "cg-tourism-offline";
const DB_VERSION = 1;

export const STORES = {
  places: "places",
  destinations: "destinations",
  itineraries: "itineraries",
  syncQueue: "syncQueue",
  meta: "meta",
} as const;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" && typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is only available in browser or configured test environment"));
      return;
    }

    const idb = typeof window !== "undefined" ? window.indexedDB : indexedDB;
    if (!idb) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.places)) {
        db.createObjectStore(STORES.places, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.destinations)) {
        db.createObjectStore(STORES.destinations, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.itineraries)) {
        db.createObjectStore(STORES.itineraries, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const store = db.createObjectStore(STORES.syncQueue, {
          keyPath: "id",
        });

        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, {
          keyPath: "key",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(request.error ?? new Error("Unable to open offline database"));
    };
  });
}

export async function put<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(value);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const err = transaction.error ?? new Error(`Failed writing ${storeName}`);
      db.close();
      reject(err);
    };
  });
}

export async function get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDatabase();

  return new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(key);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed reading ${storeName}`));
    };

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();

  return new Promise<T[]>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();

    request.onsuccess = () => {
      resolve((request.result ?? []) as T[]);
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed reading all from ${storeName}`));
    };

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

export async function remove(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDatabase();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).delete(key);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const err = transaction.error ?? new Error(`Failed deleting ${storeName}`);
      db.close();
      reject(err);
    };
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).clear();

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const err = transaction.error ?? new Error(`Failed clearing ${storeName}`);
      db.close();
      reject(err);
    };
  });
}

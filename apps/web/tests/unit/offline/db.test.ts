import "fake-indexeddb/auto";
import { openDatabase, put, get, getAll, remove, clearStore, STORES } from "@/lib/offline/db";

describe("IndexedDB Core Wrapper", () => {
  beforeEach(async () => {
    await clearStore(STORES.places);
    await clearStore(STORES.destinations);
    await clearStore(STORES.itineraries);
    await clearStore(STORES.syncQueue);
    await clearStore(STORES.meta);
  });

  test("opens database and creates all 5 object stores", async () => {
    const db = await openDatabase();
    expect(db.name).toBe("cg-tourism-offline");
    expect(db.objectStoreNames.contains("places")).toBe(true);
    expect(db.objectStoreNames.contains("destinations")).toBe(true);
    expect(db.objectStoreNames.contains("itineraries")).toBe(true);
    expect(db.objectStoreNames.contains("syncQueue")).toBe(true);
    expect(db.objectStoreNames.contains("meta")).toBe(true);
  });

  test("performs CRUD operations on places store", async () => {
    const mockPlace = {
      id: "place-1",
      name: "Chitrakote Waterfalls",
      latitude: 19.201,
      longitude: 81.701,
      updatedAt: new Date().toISOString(),
      cachedAt: new Date().toISOString(),
    };

    await put(STORES.places, mockPlace);

    const retrieved = await get<typeof mockPlace>(STORES.places, "place-1");
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Chitrakote Waterfalls");

    const all = await getAll<typeof mockPlace>(STORES.places);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("place-1");

    await remove(STORES.places, "place-1");
    const afterDelete = await get(STORES.places, "place-1");
    expect(afterDelete).toBeUndefined();
  });

  test("clears store completely", async () => {
    await put(STORES.meta, { key: "meta-1", value: "test1" });
    await put(STORES.meta, { key: "meta-2", value: "test2" });

    let all = await getAll(STORES.meta);
    expect(all).toHaveLength(2);

    await clearStore(STORES.meta);
    all = await getAll(STORES.meta);
    expect(all).toHaveLength(0);
  });
});

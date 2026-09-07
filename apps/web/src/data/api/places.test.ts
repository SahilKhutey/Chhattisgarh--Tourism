import { normalizePlace, buildQuery } from "./places";

describe("normalizePlace", () => {
  const raw = {
    id: "place-001",
    slug: "chitrakot-falls",
    name: "Chitrakot Falls",
    description: "A beautiful waterfall.",
    latitude: 18.87,
    longitude: 81.93,
    district: "Bastar",
    category: { id: "cat-1", name: "Waterfalls", slug: "waterfalls" },
    heroImage: "https://example.com/photo.jpg",
    verified: true,
    reviews: [{ rating: 4.5 }, { rating: 5.0 }],
    highlights: '["Scenic views","Tribal culture"]',
    experienceTypes: [],
    platformFeatures: [],
    media: [],
  };

  it("normalizes a flat district string into object shape", () => {
    const result = normalizePlace(raw);
    expect(result.district).toEqual({
      id: "bastar",
      name: "Bastar",
      slug: "bastar",
    });
  });

  it("preserves district when already an object", () => {
    const withObjDistrict = {
      ...raw,
      district: { id: "d-1", name: "Bastar", slug: "bastar" },
    };
    const result = normalizePlace(withObjDistrict);
    expect(result.district.name).toBe("Bastar");
  });

  it("computes rating from reviews when raw.rating is absent", () => {
    const result = normalizePlace(raw);
    expect(result.rating).toBeCloseTo(4.8, 1);
  });

  it("uses raw.rating when provided", () => {
    const result = normalizePlace({ ...raw, rating: 3.2 });
    expect(result.rating).toBe(3.2);
  });

  it("parses JSON-string highlights array", () => {
    const result = normalizePlace(raw);
    expect(result.highlights).toEqual(["Scenic views", "Tribal culture"]);
  });

  it("sets imageUrl from heroImage when imageUrl is missing", () => {
    const result = normalizePlace(raw);
    expect(result.imageUrl).toBe("https://example.com/photo.jpg");
  });

  it("returns the slug from the raw place", () => {
    const result = normalizePlace(raw);
    expect(result.slug).toBe("chitrakot-falls");
  });
});

describe("buildQuery", () => {
  it("returns empty string when no params", () => {
    expect(buildQuery()).toBe("");
    expect(buildQuery({})).toBe("");
  });

  it("builds category and district query string", () => {
    const q = buildQuery({ category: "waterfalls", district: "Bastar" });
    expect(q).toContain("category=waterfalls");
    expect(q).toContain("district=Bastar");
  });

  it("omits district=All from query", () => {
    const q = buildQuery({ district: "All" });
    expect(q).toBe("");
  });

  it("omits category=all from query", () => {
    const q = buildQuery({ category: "all" });
    expect(q).toBe("");
  });

  it("includes page and limit", () => {
    const q = buildQuery({ page: 2, limit: 12 });
    expect(q).toContain("page=2");
    expect(q).toContain("limit=12");
  });
});

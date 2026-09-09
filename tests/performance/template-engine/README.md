# Generic Tourism Template Engine — Performance Benchmarking Suite

This benchmark suite measures the throughput, latency, and scalability of the Generic Tourism Content Template Engine under high-volume workloads.

---

## 1. Benchmarking Scope & Objectives

The benchmark suite verifies that the generic schema, validation, dynamic entry lifecycle, and rendering pipelines satisfy the platform's production SLAs:

| Metric | Production Target | SLA Threshold |
| :--- | :--- | :--- |
| **Schema Validation Throughput** | $> 10,000$ ops/sec | $> 5,000$ ops/sec |
| **Entry Serialization & Deserialization** | $> 50,000$ ops/sec | $> 20,000$ ops/sec |
| **Dynamic Projection Latency (p95)** | $< 1.0$ ms | $< 5.0$ ms |
| **Spatial Bounding Box Query Latency (p95)** | $< 10.0$ ms | $< 25.0$ ms |
| **Cached Entry Lookup Throughput** | $> 100,000$ ops/sec | $> 50,000$ ops/sec |

---

## 2. Benchmark Components

1. **`seed-templates.ts`**:
   - Generates **50** distinct tourism content templates spanning eco-tourism, tribal arts, oral traditions, sacred circuits, cuisines, and adventure sports.
   - Each template includes canonical field configurations: `TEXT`, `RICHTEXT`, `IMAGE`, `GALLERY`, `GEO_POINT`, `DROPDOWN`, `TAGS`, `NUMBER`, and `BOOLEAN`.

2. **`seed-entries.ts`**:
   - Generates **10,000** synthetic entries distributed evenly across the 50 templates.
   - Coordinates are geographically bound to Chhattisgarh's bounding box:
     - Latitude: $17.78^\circ\text{N}$ to $24.11^\circ\text{N}$
     - Longitude: $80.24^\circ\text{E}$ to $84.40^\circ\text{E}$
   - Simulates realistic content status distribution: $70\%$ `PUBLISHED`, $10\%$ `PENDING_REVIEW`, $10\%$ `DRAFT`, $10\%$ `REJECTED`.

3. **`list-benchmark.ts`**:
   - Evaluates filter and query throughput:
     - Full template list retrieval.
     - Status filtering across 10,000 entries.
     - Faceted filtering by template slug with pagination (e.g. limit 20, offset 40).
     - Geospatial bounding box filtering (e.g. Bastar district cluster).

4. **`render-benchmark.ts`**:
   - Evaluates compute and serialization overhead:
     - `validateTemplateDefinition` schema validation.
     - JSON payload parsing and serialization.
     - Dynamic field projection and ordering.
     - In-memory / Redis cache hit throughput.

---

## 3. Running Benchmarks

Execute the benchmark suite using `tsx` or `ts-node` from the workspace root:

```bash
# 1. Run Listing and Spatial Benchmarks
pnpm --filter backend exec tsx ../../tests/performance/template-engine/list-benchmark.ts

# 2. Run Render and Validation Benchmarks
pnpm --filter backend exec tsx ../../tests/performance/template-engine/render-benchmark.ts
```

---

## 4. Production Tuning & Recommendations

1. **PostGIS GIST Spatial Indexing**:
   - Ensure `CREATE INDEX idx_content_entries_geo_point ON "ContentEntry" USING GIST(geom);` is active for bounding box and radius queries.
2. **Dual JSON/String Resilience**:
   - `ContentEntry.data` is parsed transparently. Maintain parsed JSON objects in memory and Redis cache to eliminate repeated serialization cycles.
3. **Compound Status & Template Indexing**:
   - Ensure compound B-tree index `@@index([templateId, status])` is active on `ContentEntry` to eliminate full table scans during creator and public catalog browsing.

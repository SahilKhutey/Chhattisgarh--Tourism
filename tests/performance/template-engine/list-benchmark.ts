/**
 * Template Engine Benchmark Suite: Listing & Filter Throughput
 * Benchmarks listing, spatial bounding box queries, and faceted filtering over 10,000 entries.
 */

import type { BenchmarkTemplate } from './seed-templates.ts';
import type { BenchmarkEntry } from './seed-entries.ts';
import { generateSyntheticTemplates } from './seed-templates.ts';
import { generateSyntheticEntries } from './seed-entries.ts';

interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTimeMs: number;
  opsPerSec: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

function calculatePercentiles(latencies: number[]): { p50: number; p95: number; p99: number } {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  return {
    p50: parseFloat(p50.toFixed(3)),
    p95: parseFloat(p95.toFixed(3)),
    p99: parseFloat(p99.toFixed(3)),
  };
}

export function runListBenchmarks(
  templates: BenchmarkTemplate[] = generateSyntheticTemplates(50),
  entries: BenchmarkEntry[] = generateSyntheticEntries(10000, templates),
): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  // Index entries for fast simulated DB lookup
  const statusIndex = new Map<string, BenchmarkEntry[]>();
  const templateIndex = new Map<string, BenchmarkEntry[]>();
  for (const entry of entries) {
    if (!statusIndex.has(entry.status)) statusIndex.set(entry.status, []);
    statusIndex.get(entry.status)!.push(entry);

    if (!templateIndex.has(entry.templateSlug)) templateIndex.set(entry.templateSlug, []);
    templateIndex.get(entry.templateSlug)!.push(entry);
  }

  // 1. Benchmark: List Templates
  {
    const iterations = 5000;
    const latencies: number[] = [];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const list = templates.filter((t) => t.status === 'PUBLISHED');
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'List Published Templates (50 templates)',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 2. Benchmark: Filter 10,000 entries by status = PUBLISHED
  {
    const iterations = 2000;
    const latencies: number[] = [];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const published = entries.filter((e) => e.status === 'PUBLISHED');
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Filter Entries by Status (10,000 entries dataset)',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 3. Benchmark: Filter by Template Slug & Paginate (limit 20, offset 40)
  {
    const iterations = 2000;
    const targetSlug = templates[0].slug;
    const latencies: number[] = [];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const matched = entries
        .filter((e) => e.templateSlug === targetSlug && e.status === 'PUBLISHED')
        .slice(40, 60);
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Filter by Template Slug + Pagination (limit 20, offset 40)',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 4. Benchmark: Spatial Bounding Box Filter (Bastar Region: Lat 18.5-19.5, Lng 81.5-82.5)
  {
    const iterations = 2000;
    const latencies: number[] = [];
    const start = performance.now();

    const minLat = 18.5;
    const maxLat = 19.5;
    const minLng = 81.5;
    const maxLng = 82.5;

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const inBounds = entries.filter(
        (e) =>
          e.status === 'PUBLISHED' &&
          e.latitude >= minLat &&
          e.latitude <= maxLat &&
          e.longitude >= minLng &&
          e.longitude <= maxLng,
      );
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Spatial Bounding Box Filter (Lat [18.5, 19.5], Lng [81.5, 82.5])',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  return results;
}

// Standalone execution test
if (process.argv[1] && process.argv[1].includes('list-benchmark')) {
  console.log('--- Commencing Template Engine Listing Benchmark ---');
  const results = runListBenchmarks();
  console.table(results);
}

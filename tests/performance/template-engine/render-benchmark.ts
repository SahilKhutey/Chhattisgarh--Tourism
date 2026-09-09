/**
 * Template Engine Benchmark Suite: Render & Validation Performance
 * Benchmarks schema validation, dynamic JSON serialization, and sanitization latency.
 */

import type { BenchmarkTemplate } from './seed-templates.ts';
import type { BenchmarkEntry } from './seed-entries.ts';
import { generateSyntheticTemplates } from './seed-templates.ts';
import { generateSyntheticEntries } from './seed-entries.ts';
import { TemplateSchemaValidator, validateEntryData } from '../../../packages/template-engine/dist/index.js';

interface RenderBenchmarkResult {
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

export function runRenderBenchmarks(
  templates: BenchmarkTemplate[] = generateSyntheticTemplates(50),
  entries: BenchmarkEntry[] = generateSyntheticEntries(1000, templates),
): RenderBenchmarkResult[] {
  const results: RenderBenchmarkResult[] = [];
  const validator = new TemplateSchemaValidator();

  // 1. Benchmark: Schema Definition Validation
  {
    const iterations = 5000;
    const latencies: number[] = [];
    const templateToValidate = templates[0];
    const canonicalSchema = {
      schemaVersion: '1.0.0',
      id: templateToValidate.id,
      name: templateToValidate.name,
      slug: templateToValidate.slug,
      version: 1,
      status: 'PUBLISHED',
      fields: templateToValidate.fields.map((f) => ({
        id: `fld-${f.key}`,
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        order: f.order,
      })),
    };
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      validator.validate(canonicalSchema as any);
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Schema Validation (TemplateSchemaValidator)',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 2. Benchmark: Dynamic Entry Data Serialization & Deserialization
  {
    const iterations = 10000;
    const latencies: number[] = [];
    const sampleData = entries[0].data;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      const serialized = JSON.stringify(sampleData);
      const parsed = JSON.parse(serialized);
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Entry Payload Serialization & Deserialization',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 3. Benchmark: Dynamic Entry Projection & HTML/Field Transformation
  {
    const iterations = 5000;
    const latencies: number[] = [];
    const template = templates[0];
    const entry = entries[0];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      // Simulate generic renderer field projection
      const orderedFields = [...template.fields].sort((a, b) => a.order - b.order);
      const projected = orderedFields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        value: entry.data[field.key],
        isPopulated: entry.data[field.key] !== undefined && entry.data[field.key] !== null,
      }));
      const renderedCard = {
        title: entry.title,
        slug: entry.slug,
        coordinates: [entry.latitude, entry.longitude],
        fields: projected,
      };
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Dynamic Entry Field Projection & Transformation',
      iterations,
      totalTimeMs: parseFloat(totalTimeMs.toFixed(2)),
      opsPerSec: Math.round((iterations / totalTimeMs) * 1000),
      p50Ms: percentiles.p50,
      p95Ms: percentiles.p95,
      p99Ms: percentiles.p99,
    });
  }

  // 4. Benchmark: Cached Response Lookup (Redis / Memory Cache simulation)
  {
    const cache = new Map<string, string>();
    for (let i = 0; i < 500; i++) {
      cache.set(`entry:${entries[i].id}`, JSON.stringify(entries[i]));
    }

    const iterations = 10000;
    const latencies: number[] = [];
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const targetId = `entry:${entries[i % 500].id}`;
      const t0 = performance.now();
      const hit = cache.get(targetId);
      const parsed = hit ? JSON.parse(hit) : null;
      latencies.push(performance.now() - t0);
    }

    const totalTimeMs = performance.now() - start;
    const percentiles = calculatePercentiles(latencies);
    results.push({
      operation: 'Cache Hit JSON Response Read & Deserialization',
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
if (process.argv[1] && process.argv[1].includes('render-benchmark')) {
  console.log('--- Commencing Template Engine Render & Validation Benchmark ---');
  const results = runRenderBenchmarks();
  console.table(results);
}

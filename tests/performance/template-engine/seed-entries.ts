/**
 * Template Engine Benchmark Suite: Synthetic Entry Seeder
 * Generates 10,000 production-grade entries distributed across synthetic templates.
 */

import type { BenchmarkTemplate } from './seed-templates.ts';
import { generateSyntheticTemplates } from './seed-templates.ts';

export interface BenchmarkEntry {
  id: string;
  templateId: string;
  templateSlug: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  authorId: string;
  version: number;
  latitude: number;
  longitude: number;
  region: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
}

const CG_DISTRICTS = [
  'Bastar',
  'Dantewada',
  'Kondagaon',
  'Kanker',
  'Narayanpur',
  'Sukma',
  'Bijapur',
  'Raipur',
  'Bilaspur',
  'Durg',
  'Rajnandgaon',
  'Korba',
  'Janjgir-Champa',
  'Raigarh',
  'Surguja',
  'Jashpur',
  'Koriya',
  'Balrampur',
  'Surajpur',
  'Mahasamund',
  'Dhamtari',
  'Gariaband',
  'Balod',
  'Bemetara',
  'Kabirdham',
  'Mungeli',
  'Gaurela-Pendra-Marwahi',
];

const STATUSES: Array<'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'> = [
  'PUBLISHED',
  'PUBLISHED',
  'PUBLISHED',
  'PUBLISHED',
  'PUBLISHED',
  'PUBLISHED',
  'PUBLISHED', // 70% published
  'PENDING_REVIEW',
  'DRAFT',
  'REJECTED',
];

export function generateSyntheticEntries(
  count = 10000,
  templates: BenchmarkTemplate[] = generateSyntheticTemplates(50),
): BenchmarkEntry[] {
  const entries: BenchmarkEntry[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const district = CG_DISTRICTS[i % CG_DISTRICTS.length];
    const status = STATUSES[i % STATUSES.length];

    // Chhattisgarh bounding box: Lat 17.78 to 24.11, Lng 80.24 to 84.40
    const lat = 17.78 + (i * 0.00063) % (24.11 - 17.78);
    const lng = 80.24 + (i * 0.00041) % (84.4 - 80.24);

    const title = `${template.name} - Location #${i + 1}`;
    const slug = `${template.slug}-location-${i + 1}`;

    const data: Record<string, unknown> = {
      title,
      overview: `<p>A renowned destination of cultural and geographic significance located in ${district}, Chhattisgarh. Experience pristine natural canopy, indigenous folk traditions, and preserved biodiversity.</p>`,
      hero_image: `https://images.cg-tourism.in/cdn/${template.slug}/${(i % 25) + 1}.jpg`,
      location_coordinates: { lat, lng },
      district: district.toLowerCase(),
      tourism_tags: [template.category.toLowerCase(), district.toLowerCase(), 'heritage', 'chhattisgarh'],
      gallery_photos: [
        `https://images.cg-tourism.in/cdn/${template.slug}/gallery-1.jpg`,
        `https://images.cg-tourism.in/cdn/${template.slug}/gallery-2.jpg`,
      ],
      best_visiting_month: 'October to March',
      visitor_capacity: 500 + (i % 2000),
      guided_tours_available: i % 2 === 0,
    };

    entries.push({
      id: `entry-bench-${(i + 1).toString().padStart(6, '0')}`,
      templateId: template.id,
      templateSlug: template.slug,
      title,
      slug,
      status,
      authorId: `usr-creator-${(i % 100) + 1}`,
      version: 1,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      region: district,
      createdAt: new Date(Date.now() - (i % 365) * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      data,
    });
  }

  return entries;
}

// Standalone execution test
if (process.argv[1] && process.argv[1].includes('seed-entries')) {
  const entries = generateSyntheticEntries(10000);
  console.log(`Generated ${entries.length} synthetic benchmark entries.`);
  console.log(`First entry: ${entries[0].title} [${entries[0].latitude}, ${entries[0].longitude}] - Status: ${entries[0].status}`);
  console.log(`Last entry: ${entries[entries.length - 1].title}`);
}

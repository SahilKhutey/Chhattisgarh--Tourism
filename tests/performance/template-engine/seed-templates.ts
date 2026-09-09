/**
 * Template Engine Benchmark Suite: Synthetic Template Seeder
 * Generates 50 production-grade tourism content templates across diverse domains.
 */

export interface BenchmarkTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  publishedVersion?: number;
  fields: Array<{
    key: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    options?: string;
    helpText?: string;
  }>;
}

const TOURISM_DOMAINS = [
  'Waterfall Sanctuary',
  'Tribal Handloom & Craft',
  'Folklore & Oral History',
  'Ancient Archaeological Site',
  'Sacred Temple Complex',
  'Wildlife National Park',
  'Eco-Trekking Trail',
  'Traditional Cuisine & Millet Food',
  'Folk Festival & Carnival',
  'Cave & Geological Wonder',
  'River Island & Waterfront',
  'Campground & Glamping Retreat',
  'Tribal Haat & Marketplace',
  'Living Heritage Village',
  'Agro-Tourism Farm',
  'Historical Fort & Palace',
  'Medicinal Botanical Garden',
  'Rock Art & Prehistoric Petroglyph',
  'Artisan Homestay',
  'Birdwatching Wetland',
  'Adventure Kayaking Rapid',
  'Cycling Scenic Highway',
  'Handmade Bell Metal Foundry',
  'Tussar Silk Weaving Loom',
  'Indigenous Musical Instrument Workshop',
  'Mahuwa Craft & Beverage Centre',
  'Bamboo Craft Collective',
  'Terracotta Potter Hamlet',
  'Spiritual Forest Hermitage',
  'Tribal Dance Troop Collective',
  'Sunrise Observation Plateau',
  'Monolithic Memorial Stone Site',
  'Dense Sal Canopy Nature Trail',
  'Hot Sulphur Spring',
  'Tea Estate & High Altitude Plantation',
  'Hilltop Viewpoint & Watchtower',
  'Historic British Heritage Bungalow',
  'Bastar Dussehra Cultural Hub',
  'Madai Festival Sacred Ground',
  'Cherchera Harvest Celebration Hub',
  'Bhoramdeo Architectural Circuit',
  'Sirpur Buddhist Vihara Excavation',
  'Gadiya Mountain Fortress',
  'Mainpat Tibetan Monastery',
  'Kailash & Kotumsar Subterranean Network',
  'Chitrakote Horseshoe Amphitheatre',
  'Tirathgarh Tiered Cascade',
  'Barnawapara Leopard Reserve',
  'Achanakmar Tiger Corridor',
  'Guru Ghasidas Biosphere Wilderness',
];

export function generateSyntheticTemplates(count = 50): BenchmarkTemplate[] {
  return TOURISM_DOMAINS.slice(0, count).map((domain, index) => {
    const slug = domain
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id: `tpl-bench-${(index + 1).toString().padStart(3, '0')}`,
      name: domain,
      slug,
      description: `Comprehensive tourism content template for ${domain} across Chhattisgarh.`,
      category: ['Eco', 'Heritage', 'Culture', 'Spiritual', 'Adventure'][index % 5],
      status: 'PUBLISHED',
      version: 1,
      publishedVersion: 1,
      fields: [
        {
          key: 'title',
          label: 'Official Title',
          type: 'TEXT',
          required: true,
          order: 0,
          helpText: 'Primary name in English/Hindi',
        },
        {
          key: 'overview',
          label: 'Overview & Narrative',
          type: 'RICHTEXT',
          required: true,
          order: 1,
          helpText: 'Detailed historical and cultural description',
        },
        {
          key: 'hero_image',
          label: 'Hero Banner Image',
          type: 'IMAGE',
          required: true,
          order: 2,
        },
        {
          key: 'location_coordinates',
          label: 'Geographic Location Pin',
          type: 'GEO_POINT',
          required: true,
          order: 3,
        },
        {
          key: 'district',
          label: 'Administrative District',
          type: 'DROPDOWN',
          required: true,
          order: 4,
          options: JSON.stringify({
            choices: [
              { label: 'Bastar', value: 'bastar' },
              { label: 'Dantewada', value: 'dantewada' },
              { label: 'Surguja', value: 'surguja' },
              { label: 'Raipur', value: 'raipur' },
              { label: 'Bilaspur', value: 'bilaspur' },
            ],
          }),
        },
        {
          key: 'tourism_tags',
          label: 'Discovery Tags',
          type: 'TAGS',
          required: false,
          order: 5,
        },
        {
          key: 'gallery_photos',
          label: 'Photo Gallery',
          type: 'GALLERY',
          required: false,
          order: 6,
        },
        {
          key: 'best_visiting_month',
          label: 'Peak Season',
          type: 'TEXT',
          required: false,
          order: 7,
        },
        {
          key: 'visitor_capacity',
          label: 'Daily Sustainable Footfall',
          type: 'NUMBER',
          required: false,
          order: 8,
        },
        {
          key: 'guided_tours_available',
          label: 'Certified Tribal Guide Available',
          type: 'BOOLEAN',
          required: false,
          order: 9,
        },
      ],
    };
  });
}

// Standalone execution test
if (process.argv[1] && process.argv[1].includes('seed-templates')) {
  const templates = generateSyntheticTemplates(50);
  console.log(`Generated ${templates.length} synthetic benchmark templates.`);
  console.log(`Sample template: ${templates[0].name} (${templates[0].fields.length} fields)`);
}

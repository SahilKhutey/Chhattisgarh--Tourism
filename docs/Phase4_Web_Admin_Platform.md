# CG Tourism Platform — Phase 4: Web & Admin Platform Documentation
## Next.js App Router, SEO Schema, and Admin Moderation Dashboards

---

## 1. Dynamic District SEO Page Template (`app/districts/[slug]/page.tsx`)

To maximize regional organic search footprint (SEO) for high-intent keywords like "waterfalls in Bastar" and "temples in Kabirdham" using **Next.js 15 Server Components**:

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Compass, MapPin } from 'lucide-react';
import { fetchAllPlaces } from '../../../data/places-api';

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Generate SEO Metadata with Structured Schema.org Tags
export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  const districtName = `${capitalized} District`;

  return {
    title: `Explore ${districtName} | Authentic Chhattisgarh Tourism`,
    description: `Discover hidden waterfalls, pristine tribal heritage, ancient stone temples, and untouched wilderness in ${districtName}, Chhattisgarh.`,
    openGraph: {
      title: `Unseen ${districtName} - CG Tourism`,
      description: `Explore the definitive travel guide for ${districtName}. Discover routes, best seasons, and safety rules.`,
      images: [{ url: '/assets/seo-banner.jpg', width: 1200, height: 630, alt: districtName }],
    },
  };
}

// 2. Dynamic Server Component Fetching Live NestJS Data
export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  // Fetch verified places in district from PostgreSQL via NestJS service
  const places = await fetchAllPlaces(undefined, capitalized);

  if (!places || places.length === 0) {
    notFound();
  }

  // Inject LocalBusiness/TouristAttraction Structured JSON-LD for search engine rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': places.map((place, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'TouristAttraction',
        'name': place.name,
        'description': place.story,
        'image': place.heroImage,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#F4EFE6] text-[#1F4D3A] py-16 px-6 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 mb-2">
            <Compass className="w-6 h-6 text-[#C96B3B]" />
            <span className="text-[#C96B3B] font-semibold tracking-wider uppercase text-sm">Chhattisgarh Region Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Uncover the Magic of {capitalized}
          </h1>
          <p className="text-lg max-w-3xl text-emerald-900/80 leading-relaxed">
            From misty horseshoe gorges to ancient brick sanctuaries, explore the ultimate community-curated destinations in this historic territory.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => (
            <article 
              key={place.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-emerald-900/5"
            >
              <div className="relative h-60 w-full bg-emerald-950/10">
                <img 
                  src={place.heroImage} 
                  alt={place.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-[#1F4D3A]">{place.name}</h2>
                <p className="text-[#C96B3B] font-medium text-sm mb-4 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> {place.district || capitalized}
                </p>
                <p className="text-emerald-900/70 text-sm line-clamp-3 mb-6">
                  {place.story}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">🕒 {place.timings}</span>
                  <span className="bg-[#F4EFE6] text-[#1F4D3A] font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    {place.category}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
```

---

## 2. Creator Verification Management Interface (`CreatorQueue.tsx`)

To manage contributor requests and coordinate uploads inside the **Admin Operations Dashboard**:

```tsx
import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Eye, ShieldAlert } from 'lucide-react';

interface CreatorRequest {
  id: string;
  name: string;
  email: string;
  district: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const MOCK_REQUESTS: CreatorRequest[] = [
  { id: '1', name: 'Alok Mandavi', email: 'alok.m@cg.gov.in', district: 'Bastar', submittedAt: '2026-05-18', status: 'PENDING' },
  { id: '2', name: 'Kiran Netam', email: 'kiran.netam@gmail.com', district: 'Kanker', submittedAt: '2026-05-17', status: 'APPROVED' },
  { id: '3', name: 'Rakesh Sahu', email: 'rakesh.s@yahoo.com', district: 'Surguja', submittedAt: '2026-05-16', status: 'PENDING' },
];

export const CreatorQueue: React.FC = () => {
  const [queue, setQueue] = useState<CreatorRequest[]>(MOCK_REQUESTS);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-[#1F4D3A] flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-[#C96B3B]" /> Creator Verification Queue
          </h3>
          <p className="text-xs text-gray-500 mt-1">Review government official credentials and regional guide licenses.</p>
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
          {queue.filter(r => r.status === 'PENDING').length} Pending Review
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#1F4D3A]">
          <thead className="bg-[#F4EFE6] text-xs uppercase text-emerald-900 rounded-xl">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">Contributor</th>
              <th className="px-4 py-3">District Region</th>
              <th className="px-4 py-3">Submission Date</th>
              <th className="px-4 py-3">Verification State</th>
              <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {queue.map((request) => (
              <tr key={request.id} className="hover:bg-[#F4EFE6]/30 transition-colors">
                <td className="px-4 py-4 font-medium">
                  <div>
                    <p className="font-semibold">{request.name}</p>
                    <p className="text-xs text-gray-400">{request.email}</p>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-emerald-800">{request.district}</td>
                <td className="px-4 py-4 text-gray-500">{request.submittedAt}</td>
                <td className="px-4 py-4">
                  {request.status === 'PENDING' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                  {request.status === 'APPROVED' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Creator
                    </span>
                  )}
                  {request.status === 'REJECTED' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  {request.status === 'PENDING' ? (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleAction(request.id, 'APPROVED')}
                        className="bg-[#1F4D3A] text-white hover:bg-emerald-950 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'REJECTED')}
                        className="border border-red-200 text-red-600 hover:bg-red-50 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="text-gray-400 hover:text-[#1F4D3A] transition-colors p-1">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## 3. Web Directory Structure (`apps/web/`)

```
app/
├── (auth)/
│   └── login/               # Portal sign-in credentials
├── admin/
│   ├── dashboard/           # Operations statistics overview
│   ├── creators/            # Creator verification system
│   └── moderation/          # Safe uploads moderator checklist
├── creator/
│   └── upload/              # Rich text TipTap coordinates submitter
├── explore/
│   └── page.tsx             # Interactive Mapbox map grid
├── districts/
│   └── [slug]/              # SEO dynamic district index
├── destination/
│   └── [id]/                # Cinematic scroll story details
└── page.tsx                 # Authentic Nature Landing Hero
```

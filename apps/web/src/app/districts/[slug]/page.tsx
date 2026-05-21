import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Compass, MapPin, Calendar, Shield, BookOpen, Utensils, Camera, ArrowLeft, Cloud, Sun, Droplets, Wind, Star, Activity } from 'lucide-react';
import { fetchAllPlaces } from '../../data/places-api';

interface DistrictPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic metadata generation for premium SEO rank indexing
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

// 2. Main Server-Rendered Component
export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  // Fetch destinations verified for this specific district
  const places = await fetchAllPlaces(undefined, capitalized);

  if (!places || places.length === 0) {
    notFound();
  }

  // Calculate Stats from backend data
  const totalPlaces = places.length;
  const avgRating = (places.reduce((acc, p) => acc + (p.rating || 0), 0) / totalPlaces).toFixed(1);
  const avgBio = Math.round(places.reduce((acc, p) => acc + (p.biodiversityScore || 0), 0) / totalPlaces);
  
  // Mock Weather for UI completeness
  const weather = {
    temp: '28°C',
    condition: 'Partly Cloudy',
    humidity: '65%',
    wind: '12 km/h'
  };

  // Schema.org structured metadata markup for Search Engine optimization
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
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': place.coordinates.lat,
          'longitude': place.coordinates.lng,
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-sand-beige text-charcoal-stone py-16 px-6 md:px-12 tribal-texture">
      {/* Schema.org Structured Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <Link 
            href="/explore" 
            className="inline-flex items-center space-x-2 text-forest-emerald hover:text-tribal-terracotta font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer Map</span>
          </Link>
        </div>

        {/* Dynamic SEO Header */}
        <header className="mb-16 animate-slide-up">
          <div className="flex items-center space-x-3 mb-3">
            <Compass className="w-6 h-6 text-tribal-terracotta animate-spin-slow" />
            <span className="text-tribal-terracotta font-semibold tracking-wider uppercase text-xs">
              Chhattisgarh Territory Guide
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-forest-emerald">
            Discover {capitalized}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl text-emerald-950/80 leading-relaxed">
            Welcome to {capitalized}, an authentic district of Chhattisgarh. From misty, thundering gorges to ancient tribal heritage, explore local-vetted destinations in this historic, preserved territory.
          </p>
        </header>

        {/* District Dashboard / Stats Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Weather Card */}
          <div className="bg-gradient-to-br from-forest-emerald to-emerald-900 rounded-3xl p-8 text-white shadow-xl animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors duration-500"></div>
            <h3 className="text-emerald-100 font-medium tracking-wide uppercase text-sm mb-6 flex items-center relative z-10">
              <Cloud className="w-4 h-4 mr-2" /> Current Climate
            </h3>
            <div className="flex items-end space-x-4 mb-6 relative z-10">
              <Sun className="w-16 h-16 text-yellow-400 animate-spin-slow" />
              <div>
                <div className="text-5xl font-bold">{weather.temp}</div>
                <div className="text-emerald-200">{weather.condition}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-emerald-700/50 relative z-10">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-emerald-300" />
                <span className="text-sm">{weather.humidity} Humidity</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-emerald-300" />
                <span className="text-sm">{weather.wind} Wind</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Destinations Stat */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-forest-emerald/10 shadow-sm animate-slide-up flex flex-col justify-center hover:border-tribal-terracotta/30 hover:shadow-md transition-all duration-300" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-tribal-terracotta/10 rounded-2xl">
                  <MapPin className="w-6 h-6 text-tribal-terracotta" />
                </div>
                <h3 className="text-charcoal-stone font-bold text-lg">Destinations</h3>
              </div>
              <div className="text-4xl font-black text-forest-emerald mb-2">{totalPlaces}</div>
              <p className="text-sm text-emerald-950/60">Verified ecotourism and heritage sites.</p>
            </div>

            {/* Biodiversity Stat */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-forest-emerald/10 shadow-sm animate-slide-up flex flex-col justify-center hover:border-tribal-terracotta/30 hover:shadow-md transition-all duration-300" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-forest-emerald/10 rounded-2xl">
                    <Activity className="w-6 h-6 text-forest-emerald" />
                  </div>
                  <h3 className="text-charcoal-stone font-bold text-lg">Biodiversity</h3>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">{avgRating}</span>
                </div>
              </div>
              <div className="text-4xl font-black text-forest-emerald mb-2">{avgBio}<span className="text-xl text-emerald-950/40">/100</span></div>
              <p className="text-sm text-emerald-950/60">Ecological preservation rating average.</p>
            </div>
          </div>
        </div>

        {/* Tourist Attractions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {places.map((place, index) => (
            <article 
              key={place.id}
              className="group bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-forest-emerald/5 hover:border-tribal-terracotta/20 flex flex-col h-full animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Cinematic Thumbnail Image */}
              <div className="relative h-64 w-full bg-forest-emerald/10 overflow-hidden">
                <img 
                  src={place.heroImage} 
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-forest-emerald font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {place.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold mb-2 text-forest-emerald group-hover:text-tribal-terracotta transition-colors duration-200">
                  {place.name}
                </h2>
                
                <p className="text-tribal-terracotta font-medium text-sm mb-5 flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5" /> 
                  <span>{place.district || capitalized} District</span>
                </p>

                <p className="text-emerald-950/70 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  {place.story}
                </p>

                {/* Local Specific Guidelines */}
                <div className="space-y-3 pt-6 border-t border-forest-emerald/5 text-xs text-emerald-950/80">
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-4 h-4 text-tribal-terracotta shrink-0 mt-0.5" />
                    <span><strong>Best Season:</strong> {place.bestTime}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-forest-emerald shrink-0 mt-0.5" />
                    <span><strong>Rules:</strong> {place.ecoGuidance}</span>
                  </div>
                </div>
                
                {/* Action Link to Details */}
                <div className="mt-8 pt-4">
                  <Link
                    href={`/destination/${place.id}`}
                    className="inline-flex items-center text-sm font-bold text-forest-emerald hover:text-tribal-terracotta group/link transition-colors duration-200"
                  >
                    <span>Read local legends</span>
                    <span className="ml-1.5 transform group-hover/link:translate-x-1 transition-transform duration-200">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

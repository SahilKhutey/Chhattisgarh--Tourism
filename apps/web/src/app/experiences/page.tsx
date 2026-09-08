"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  IndianRupee,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  fetchMarketplaceProducts,
  MarketplaceProductItem,
} from "../data/api";

const INVENTORY_TYPES = [
  { label: "All Categories", value: "" },
  { label: "Homestays", value: "HOMESTAY" },
  { label: "Local Guides", value: "GUIDE" },
  { label: "Cultural Tours", value: "EXPERIENCE" },
  { label: "Tribal Events", value: "EVENT" },
  { label: "Eco-Transport", value: "TRANSPORT" },
  { label: "Outdoor Activities", value: "ACTIVITY" },
];

export default function ExperiencesPage() {
  const [products, setProducts] = useState<MarketplaceProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchMarketplaceProducts({
        type: selectedType || undefined,
        search: searchKeyword || undefined,
      });
      setProducts(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadProducts);
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  return (
    <div className="w-full min-h-screen bg-sand-beige text-charcoal-stone pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Hero Banner */}
        <div className="rounded-3xl bg-forest-emerald/10 border border-forest-emerald/20 p-8 sm:p-12 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-forest-emerald font-mono text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            Direct Regional Commerce
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal-stone leading-tight">
            Authentic Chhattisgarh Experiences
          </h1>
          <p className="text-charcoal-stone/75 max-w-2xl text-base sm:text-lg">
            Book certified tribal homestays, native guides, craft immersions, and eco-transport directly from verified local partners across Bastar, Surguja, and beyond.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/partner"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-emerald text-sand-beige font-medium text-sm hover:bg-forest-emerald/90 transition-colors shadow-sm"
            >
              Become a Local Partner
            </Link>
            <span className="text-xs text-charcoal-stone/60 font-mono">
              100% Verified Community Operators • Transparent Capacity & Pricing
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {INVENTORY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === t.value
                    ? "bg-forest-emerald text-sand-beige shadow-sm"
                    : "bg-charcoal-stone/5 hover:bg-charcoal-stone/10 text-charcoal-stone"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-stone/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-charcoal-stone/5 border border-charcoal-stone/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-charcoal-stone text-sand-beige rounded-xl text-sm font-medium hover:bg-charcoal-stone/90 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-charcoal-stone/10" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-charcoal-stone/5 rounded-3xl p-8 border border-charcoal-stone/10">
            <Compass className="w-12 h-12 text-forest-emerald/60" />
            <h3 className="text-xl font-bold font-serif">No experiences matched your filter</h3>
            <p className="text-sm text-charcoal-stone/60 max-w-md">
              We could not find active marketplace products matching this category. Try adjusting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedType("");
                setSearchKeyword("");
              }}
              className="px-4 py-2 bg-forest-emerald text-sand-beige text-xs font-semibold rounded-xl hover:bg-forest-emerald/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/experiences/${p.slug}`}
                className="group flex flex-col justify-between rounded-2xl bg-sand-beige border border-charcoal-stone/15 p-6 hover:shadow-lg hover:border-forest-emerald/40 transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald font-semibold">
                      {p.type}
                    </span>
                    {p.partner?.status === "VERIFIED" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-forest-emerald font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-emerald" />
                        Verified Partner
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-serif font-bold text-charcoal-stone group-hover:text-forest-emerald transition-colors line-clamp-2">
                    {p.name}
                  </h3>

                  <p className="text-xs text-charcoal-stone/70 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-stone/60 pt-2 border-t border-charcoal-stone/10">
                    {p.partner?.districtId && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-terracotta-warm" />
                        {p.partner.districtId.toUpperCase()}
                      </span>
                    )}
                    {p.durationMin && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.floor(p.durationMin / 60)}h {p.durationMin % 60 ? `${p.durationMin % 60}m` : ""}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Max {p.capacity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-4 border-t border-charcoal-stone/10">
                  <div>
                    <span className="text-[11px] text-charcoal-stone/50 block font-mono">From</span>
                    <span className="text-xl font-bold font-sans text-charcoal-stone flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {Number(p.price).toLocaleString()}
                    </span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-forest-emerald text-sand-beige text-xs font-semibold group-hover:bg-forest-emerald/90 transition-colors">
                    View & Book
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

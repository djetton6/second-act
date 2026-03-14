"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChicagoProperty } from "@/types";
import { CHICAGO_NEIGHBORHOODS } from "@/lib/chicago-data";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyMap from "@/components/PropertyMap";
import PropertyDetail from "@/components/PropertyDetail";
import DataSourceLogos from "@/components/DataSourceLogos";
import {
  Building2, TreePine, MapPin, TrendingUp, Gavel,
  LayoutGrid, Map, Loader2, Star, RefreshCw
} from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<ChicagoProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedProperty, setSelectedProperty] = useState<ChicagoProperty | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(
    searchParams.get("neighborhood") || ""
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || ""
  );
  const [userZip, setUserZip] = useState("");
  const [stats, setStats] = useState({
    total: 0, vacant: 0, abandoned: 0, totalBids: 0
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedNeighborhood) params.set("neighborhood", selectedNeighborhood);
      if (searchQuery) params.set("search", searchQuery);
      if (selectedType) params.set("type", selectedType);
      params.set("limit", "40");

      const res = await fetch(`/api/properties?${params}`);
      const data = await res.json();

      setProperties(data.properties || []);
      setStats({
        total: data.properties?.length || 0,
        vacant: data.properties?.filter((p: ChicagoProperty) => p.propertyType === "vacant_lot").length || 0,
        abandoned: data.properties?.filter((p: ChicagoProperty) => p.propertyType === "abandoned_building").length || 0,
        totalBids: data.properties?.filter((p: ChicagoProperty) => p.currentBid).length || 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedNeighborhood, searchQuery, selectedType]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const currentNeighborhoodStats = CHICAGO_NEIGHBORHOODS.find(
    (n) => n.name === selectedNeighborhood
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=60')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/60 via-[#0a0e1a]/80 to-[#0a0e1a]" />

        {/* Chicago flag stars decoration */}
        <div className="absolute top-20 right-20 opacity-5 text-[#e4002b] text-8xl select-none">✦✦✦✦</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* Status bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Chicago Data
            </span>
            <span className="text-zinc-600 text-xs">Updated hourly from City of Chicago Open Data Portal</span>
          </div>

          {/* Headline */}
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
              Chicago&apos;s{" "}
              <span className="bg-gradient-to-r from-[#4a90d9] to-[#7ec8e3] bg-clip-text text-transparent">
                Second Act
              </span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Bid on vacant lots and abandoned buildings. Transform Chicago&apos;s neighborhoods —
              one property at a time. Local residents get priority.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {[
              { icon: <Building2 size={14} />, label: "Abandoned Buildings", value: "4,200+", color: "text-amber-400" },
              { icon: <TreePine size={14} />, label: "Vacant Lots", value: "8,700+", color: "text-emerald-400" },
              { icon: <MapPin size={14} />, label: "Neighborhoods", value: "20", color: "text-[#4a90d9]" },
              { icon: <Gavel size={14} />, label: "Active Bids", value: "342", color: "text-purple-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-white font-bold">{stat.value}</span>
                <span className="text-zinc-500 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <SearchBar
            onSearch={setSearchQuery}
            onNeighborhoodChange={setSelectedNeighborhood}
            onTypeChange={setSelectedType}
            selectedNeighborhood={selectedNeighborhood}
            selectedType={selectedType}
            resultCount={!loading ? stats.total : undefined}
          />
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Neighborhood header */}
        {selectedNeighborhood && currentNeighborhoodStats && (
          <div className="mb-6 p-5 bg-[#0f1629] border border-[#1a3a6e]/40 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-[#4a90d9]" />
                  <h2 className="text-white font-bold text-xl">{selectedNeighborhood}</h2>
                  <span className="text-zinc-500 text-sm">ZIP: {currentNeighborhoodStats.zipCodes.join(", ")}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-400">{currentNeighborhoodStats.totalAbandoned} abandoned</span>
                  <span className="text-emerald-400">{currentNeighborhoodStats.totalVacant} vacant lots</span>
                  <span className="text-zinc-400">Avg value: ${currentNeighborhoodStats.avgPropertyValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-[#4a90d9]" fill="currentColor" />
                <span className="text-[#4a90d9] text-sm font-semibold">Local Priority Zone</span>
              </div>
            </div>

            {/* Tax Delta */}
            <div className="mt-4 pt-4 border-t border-[#1a3a6e]/30">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-zinc-400 text-xs">Property Tax Delta — stays in {selectedNeighborhood}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-400">Current: <strong className="text-white">2.1%</strong></span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-zinc-400">Post-Rehab: <strong className="text-emerald-400">1.6%</strong></span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-amber-400 font-semibold">100% reinvested locally</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View toggle and controls */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-zinc-400 text-sm">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading properties...</span>
              ) : (
                <span><strong className="text-white">{stats.total}</strong> properties found</span>
              )}
            </p>
            <button
              onClick={fetchProperties}
              className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-[#1a3a6e]/30"
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex bg-[#0f1629] border border-[#1a3a6e]/40 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid" ? "bg-[#003087] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "map" ? "bg-[#003087] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Map size={13} />
              Map
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "map" ? (
          <div className="h-[600px]">
            <PropertyMap
              properties={properties}
              selectedProperty={selectedProperty}
              onPropertyClick={(p) => setSelectedProperty(p)}
            />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#0f1629] border border-[#1a3a6e]/30 rounded-2xl h-80 animate-pulse">
                    <div className="h-48 bg-[#1a3a6e]/20 rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-[#1a3a6e]/30 rounded-full w-3/4" />
                      <div className="h-3 bg-[#1a3a6e]/20 rounded-full w-1/2" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-[#1a3a6e]/20 rounded-xl" />
                        <div className="h-12 bg-[#1a3a6e]/20 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <Building2 size={48} className="text-[#1a3a6e] mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">No properties found</h3>
                <p className="text-zinc-400 text-sm">Try adjusting your search or neighborhood filter</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedNeighborhood("");
                    setSelectedType("");
                  }}
                  className="mt-4 text-[#4a90d9] hover:text-white text-sm font-semibold transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={setSelectedProperty}
                    userZip={userZip}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ZIP code local priority prompt */}
        <div className="mt-8 p-5 bg-gradient-to-r from-[#003087]/20 to-[#1a6eb5]/10 border border-[#1a6eb5]/30 rounded-2xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003087]/40 rounded-xl flex items-center justify-center">
              <Star size={18} className="text-[#4a90d9]" fill="currentColor" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Are you a local resident?</h3>
              <p className="text-zinc-400 text-xs">Enter your ZIP code to see which properties give you priority bidding status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userZip}
              onChange={(e) => setUserZip(e.target.value)}
              placeholder="Your ZIP code"
              maxLength={5}
              className="w-32 bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#1a6eb5]/70"
            />
            <span className="text-[#4a90d9] text-xs font-semibold">★ Priority</span>
          </div>
        </div>
      </section>

      {/* Data source logos */}
      <DataSourceLogos />

      {/* Footer */}
      <footer className="border-t border-[#1a3a6e]/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#003087] to-[#1a6eb5] rounded-lg flex items-center justify-center">
                <Building2 size={14} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold">Second Act Chicago</span>
                <span className="block text-zinc-600 text-xs">Revitalizing neighborhoods, one property at a time</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {["#003087", "#fff", "#e4002b", "#fff", "#003087"].map((color, i) => (
                  <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color, border: color === "#fff" ? "1px solid #1a3a6e" : "none" }} />
                ))}
              </div>
              <span className="text-zinc-600 text-xs ml-2">Chicago, IL</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1a3a6e]/20 flex items-center gap-6 text-xs text-zinc-600 flex-wrap">
            <span>Data: City of Chicago Open Data · CC Attribution License</span>
            <span>Maps: Google Maps Platform</span>
            <span>AI: Google Gemini × NanoBanana</span>
            <span>© 2024 Second Act Chicago</span>
          </div>
        </div>
      </footer>

      {/* Property detail modal */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a6eb5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading Second Act Chicago...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

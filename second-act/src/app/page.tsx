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
import LandBankSection from "@/components/LandBankSection";
import {
  Building2, TreePine, MapPin, TrendingUp, Gavel,
  LayoutGrid, Map, Loader2, Star, RefreshCw,
  ArrowRight, DollarSign, GraduationCap, Users, HardHat,
  Search, ChevronRight
} from "lucide-react";

// ── Chicago flag star SVG ─────────────────────────────────────────────────────
function ChicagoStar({ size = 16, color = "#CC0000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="12,2 14.4,9.2 22,9.2 16,14 18.4,21.2 12,17 5.6,21.2 8,14 2,9.2 9.6,9.2" />
    </svg>
  );
}

// ── Tax Impact Slider ─────────────────────────────────────────────────────────
function TaxImpactSlider() {
  const [properties, setProperties] = useState(2500);

  // Cook County math:
  // Avg assessed value post-rehab: $185,000
  // Effective tax rate: 2.021%
  // Annual tax post-rehab: ~$3,739
  // Avg current (vacant/abandoned): ~$589/yr
  // Net gain per property: ~$3,150/yr
  const netGainPerProperty = 3150;
  const annualRevenue = properties * netGainPerProperty;
  const tenYearRevenue = annualRevenue * 10;
  const schoolFunding = Math.round(annualRevenue * 0.52); // IL: ~52% to schools
  const jobsCreated = Math.round(properties * 3.2); // NAHB multiplier

  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const pct = ((properties - 100) / (10000 - 100)) * 100;

  const cards = [
    {
      icon: <DollarSign size={20} />,
      label: "Annual Tax Revenue",
      value: fmt(annualRevenue),
      sub: "new dollars per year",
      color: "#41B6E6",
    },
    {
      icon: <TrendingUp size={20} />,
      label: "10-Year Cumulative",
      value: fmt(tenYearRevenue),
      sub: "over a decade",
      color: "#CC0000",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "School Funding",
      value: fmt(schoolFunding),
      sub: "annual CPS contribution",
      color: "#41B6E6",
    },
    {
      icon: <HardHat size={20} />,
      label: "Jobs Created",
      value: jobsCreated.toLocaleString(),
      sub: "construction & trade jobs",
      color: "#CC0000",
    },
  ];

  return (
    <section className="py-24 bg-[#04060f] relative overflow-hidden">
      {/* Chicago flag horizontal accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#41B6E6]" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#41B6E6]" />

      {/* Subtle red star decorations */}
      <div className="absolute top-8 right-12 opacity-10 flex gap-8">
        {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={28} />)}
      </div>
      <div className="absolute bottom-8 left-12 opacity-10 flex gap-8">
        {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={28} />)}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#41B6E6] text-xs font-bold tracking-[0.3em] uppercase mb-5 border border-[#41B6E6]/30 px-4 py-1.5 rounded-full">
            Property Tax Impact Calculator
          </span>
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-5">
            Every Rehab Feeds<br />
            <span className="text-[#41B6E6]">Chicago&apos;s Future</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Vacant properties generate almost no tax revenue. Rehabilitated homes unlock
            millions in annual funding — for schools, infrastructure, and your neighborhood.
          </p>
        </div>

        {/* Slider control */}
        <div className="bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-3xl p-8 mb-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-zinc-400 text-sm font-medium block mb-1">
                Properties Rehabilitated
              </span>
              <span className="text-zinc-600 text-xs">Drag to explore the impact</span>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-white tabular-nums">
                {properties.toLocaleString()}
              </span>
              <span className="text-zinc-500 text-sm ml-2">properties</span>
            </div>
          </div>

          <input
            type="range"
            className="tax-slider"
            min={100}
            max={10000}
            step={100}
            value={properties}
            onChange={(e) => setProperties(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #41B6E6 ${pct}%, #1a3a6e33 ${pct}%)`,
            }}
          />

          <div className="flex justify-between text-zinc-600 text-xs mt-3">
            <span>100</span>
            <span>2,500</span>
            <span>5,000</span>
            <span>7,500</span>
            <span>10,000</span>
          </div>
        </div>

        {/* Impact cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-2xl p-6 text-center hover:border-[#41B6E6]/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${card.color}15`, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="text-2xl font-black text-white mb-1 tabular-nums">{card.value}</div>
              <div className="text-zinc-300 text-xs font-bold mb-1">{card.label}</div>
              <div className="text-zinc-600 text-xs">{card.sub}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-700 text-xs mt-8 leading-relaxed">
          Estimates based on Cook County avg assessed value $185K post-rehab × 2.021% effective tax rate.
          School share per Illinois PTELL. Jobs per NAHB residential construction multiplier.
        </p>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Browse Properties",
      desc: "Explore vacant lots and abandoned buildings across 20 Chicago neighborhoods. Filter by type, location, and local priority status.",
      color: "#41B6E6",
      icon: <Search size={22} />,
    },
    {
      step: "02",
      title: "Submit Your Vision",
      desc: "Place a bid with your renovation or new-construction proposal. Local residents and CDFIs receive priority consideration from the city.",
      color: "#CC0000",
      icon: <Gavel size={22} />,
    },
    {
      step: "03",
      title: "Transform Chicago",
      desc: "Win the bid, rehab the property, and watch your neighborhood come alive — while growing the city's tax base for generations.",
      color: "#41B6E6",
      icon: <Building2 size={22} />,
    },
  ];

  return (
    <section className="py-24 border-t border-[#1a3a6e]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#41B6E6] text-xs font-bold tracking-[0.3em] uppercase mb-5 border border-[#41B6E6]/30 px-4 py-1.5 rounded-full">
            Process
          </span>
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.step}
              className="relative p-8 bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-3xl hover:border-[#41B6E6]/30 transition-all duration-300 group overflow-hidden"
            >
              {/* Step number watermark */}
              <div
                className="absolute -top-4 -right-2 text-[96px] font-black leading-none select-none transition-opacity duration-300 opacity-[0.06] group-hover:opacity-[0.1]"
                style={{ color: step.color }}
              >
                {step.step}
              </div>

              <div
                className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: `${step.color}15`, color: step.color }}
              >
                {step.icon}
              </div>

              <h3 className="text-xl font-black text-white mb-3 tracking-tight">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{step.desc}</p>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={20} className="text-[#1a3a6e]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Home Content ─────────────────────────────────────────────────────────
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

  const heroStats = [
    { label: "Abandoned Buildings", value: "4,200+", color: "#CC0000", icon: <Building2 size={16} /> },
    { label: "Vacant Lots", value: "8,700+", color: "#41B6E6", icon: <TreePine size={16} /> },
    { label: "Neighborhoods", value: "20", color: "#41B6E6", icon: <MapPin size={16} /> },
    { label: "Active Bids", value: "342", color: "#CC0000", icon: <Gavel size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#060914]">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        {/* Chicago skyline background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=60')",
            opacity: 0.07,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060914]/50 via-[#060914]/80 to-[#060914]" />

        {/* Chicago flag blue stripes — subtle */}
        <div className="absolute top-[88px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#41B6E6]/20 to-transparent" />
        <div className="absolute top-[96px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#41B6E6]/15 to-transparent" />

        {/* Red stars decoration — top right */}
        <div className="absolute top-24 right-16 opacity-10 flex gap-10">
          {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={24} />)}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          {/* Live badge */}
          <div className="flex items-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE CHICAGO DATA
            </span>
            <span className="text-zinc-600 text-xs">Updated hourly · City of Chicago Open Data Portal</span>
          </div>

          {/* Mega headline — Framer style */}
          <div className="mb-10">
            <h1
              className="font-black text-white leading-[0.9] tracking-tight mb-7"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(72px, 12vw, 140px)",
                letterSpacing: "-0.03em",
              }}
            >
              Chicago&apos;s<br />
              <span style={{ color: "#41B6E6" }}>Second</span>{" "}
              <span style={{ color: "#CC0000" }}>Act</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-xl leading-relaxed">
              Bid on vacant lots and abandoned buildings.
              Transform neighborhoods — one property at a time.
              <span className="text-white font-semibold"> Local residents get priority.</span>
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-4 mb-14 flex-wrap">
            <button
              onClick={() => document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 text-white hover:gap-3"
              style={{ background: "#41B6E6" }}
            >
              Browse Properties
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 border border-[#1a3a6e] text-zinc-400 font-bold px-7 py-3.5 rounded-2xl hover:border-[#41B6E6]/50 hover:text-white transition-all duration-200"
            >
              How it works
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-[#1a3a6e]/30 mb-12">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black mb-1 tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  {stat.label}
                </div>
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

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* ── Tax Impact Slider ─────────────────────────────────────────────────── */}
      <TaxImpactSlider />

      {/* ── Cook County Land Bank featured properties ─────────────────────────── */}
      <LandBankSection />

      {/* ── Property Grid / Map ───────────────────────────────────────────────── */}
      <section id="properties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-[#1a3a6e]/30" />
          <span className="text-[#41B6E6] text-xs font-bold tracking-[0.3em] uppercase">
            Available Properties
          </span>
          <div className="h-px flex-1 bg-[#1a3a6e]/30" />
        </div>

        {/* Neighborhood header */}
        {selectedNeighborhood && currentNeighborhoodStats && (
          <div className="mb-6 p-5 bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} style={{ color: "#41B6E6" }} />
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
                <Star size={14} style={{ color: "#41B6E6" }} fill="#41B6E6" />
                <span className="text-sm font-semibold" style={{ color: "#41B6E6" }}>Local Priority Zone</span>
              </div>
            </div>

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
                <span className="flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" /> Loading properties...
                </span>
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

          <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              style={viewMode === "grid" ? { background: "#41B6E6" } : {}}
            >
              <LayoutGrid size={13} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              style={viewMode === "map" ? { background: "#41B6E6" } : {}}
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
                  <div key={i} className="bg-[#0a0e1a] border border-[#1a3a6e]/30 rounded-2xl h-80 animate-pulse">
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
                  className="mt-4 text-sm font-bold transition-colors hover:text-white"
                  style={{ color: "#41B6E6" }}
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

        {/* Local Priority ZIP */}
        <div
          className="mt-10 p-6 rounded-3xl border flex items-center justify-between flex-wrap gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(65,182,230,0.05) 0%, rgba(204,0,0,0.05) 100%)",
            borderColor: "rgba(65,182,230,0.2)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(65,182,230,0.1)" }}
            >
              <Star size={20} style={{ color: "#41B6E6" }} fill="#41B6E6" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm mb-0.5">Are you a local resident?</h3>
              <p className="text-zinc-400 text-xs">Enter your ZIP code to unlock priority bidding status on nearby properties</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={userZip}
              onChange={(e) => setUserZip(e.target.value)}
              placeholder="ZIP code"
              maxLength={5}
              className="w-28 bg-[#060914] border border-[#1a3a6e]/60 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#41B6E6]/60"
            />
            <span className="text-xs font-bold" style={{ color: "#41B6E6" }}>★ Priority</span>
          </div>
        </div>
      </section>

      {/* ── Data source logos ─────────────────────────────────────────────────── */}
      <DataSourceLogos />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a3a6e]/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chicago flag stripe */}
          <div className="flex items-center gap-0 mb-8 h-4 rounded-full overflow-hidden max-w-xs">
            <div className="h-full flex-1" style={{ background: "#003087" }} />
            <div className="h-full flex-1 bg-white" />
            <div className="h-full w-5 flex items-center justify-center" style={{ background: "white" }}>
              <ChicagoStar size={10} />
            </div>
            <div className="h-full w-5 flex items-center justify-center" style={{ background: "white" }}>
              <ChicagoStar size={10} />
            </div>
            <div className="h-full w-5 flex items-center justify-center" style={{ background: "white" }}>
              <ChicagoStar size={10} />
            </div>
            <div className="h-full w-5 flex items-center justify-center" style={{ background: "white" }}>
              <ChicagoStar size={10} />
            </div>
            <div className="h-full flex-1 bg-white" />
            <div className="h-full flex-1" style={{ background: "#003087" }} />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-white font-black text-lg tracking-tight">Second Act Chicago</span>
              <span className="block text-zinc-600 text-xs mt-0.5">Revitalizing neighborhoods, one property at a time</span>
            </div>
            <div className="flex gap-1 items-center">
              <Users size={13} className="text-zinc-600 mr-1" />
              <span className="text-zinc-600 text-xs">Built for Chicago communities</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#1a3a6e]/20 flex items-center gap-6 text-xs text-zinc-700 flex-wrap">
            <span>Data: City of Chicago Open Data · CC Attribution License</span>
            <span>Maps: Google Maps Platform</span>
            <span>AI: Google Gemini × NanoBanana</span>
            <span>© 2025 Second Act Chicago</span>
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
      <div className="min-h-screen bg-[#060914] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#41B6E6", borderTopColor: "transparent" }} />
          <p className="text-zinc-400">Loading Second Act Chicago...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

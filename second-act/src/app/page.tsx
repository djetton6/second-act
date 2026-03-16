"use client";
import { useState, Suspense } from "react";
import { ChicagoProperty } from "@/types";
import { LandBankProperty } from "@/lib/landbank-data";
import PropertyDetail from "@/components/PropertyDetail";
import DataSourceLogos from "@/components/DataSourceLogos";
import LandBankSection from "@/components/LandBankSection";
import {
  Building2, TreePine, MapPin, TrendingUp, Gavel,
  ArrowRight, DollarSign, GraduationCap, Users, HardHat, ChevronRight, Search,
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

  const netGainPerProperty = 3150;
  const annualRevenue = properties * netGainPerProperty;
  const tenYearRevenue = annualRevenue * 10;
  const schoolFunding = Math.round(annualRevenue * 0.52);
  const jobsCreated = Math.round(properties * 3.2);

  const fmt = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const pct = ((properties - 100) / (10000 - 100)) * 100;

  const cards = [
    { icon: <DollarSign size={20} />, label: "Annual Tax Revenue", value: fmt(annualRevenue), sub: "new dollars per year", color: "#41B6E6" },
    { icon: <TrendingUp size={20} />, label: "10-Year Cumulative", value: fmt(tenYearRevenue), sub: "over a decade", color: "#CC0000" },
    { icon: <GraduationCap size={20} />, label: "School Funding", value: fmt(schoolFunding), sub: "annual CPS contribution", color: "#41B6E6" },
    { icon: <HardHat size={20} />, label: "Jobs Created", value: jobsCreated.toLocaleString(), sub: "construction & trade jobs", color: "#CC0000" },
  ];

  return (
    <section className="py-24 bg-[#04060f] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#41B6E6]" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#41B6E6]" />
      <div className="absolute top-8 right-12 opacity-10 flex gap-8">
        {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={28} />)}
      </div>
      <div className="absolute bottom-8 left-12 opacity-10 flex gap-8">
        {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={28} />)}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-3xl p-8 mb-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-zinc-400 text-sm font-medium block mb-1">Properties Rehabilitated</span>
              <span className="text-zinc-600 text-xs">Drag to explore the impact</span>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black text-white tabular-nums">{properties.toLocaleString()}</span>
              <span className="text-zinc-500 text-sm ml-2">properties</span>
            </div>
          </div>
          <input
            type="range"
            className="tax-slider"
            min={100} max={10000} step={100}
            value={properties}
            onChange={(e) => setProperties(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, #41B6E6 ${pct}%, #1a3a6e33 ${pct}%)` }}
          />
          <div className="flex justify-between text-zinc-600 text-xs mt-3">
            <span>100</span><span>2,500</span><span>5,000</span><span>7,500</span><span>10,000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-2xl p-6 text-center hover:border-[#41B6E6]/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${card.color}15`, color: card.color }}>
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
      step: "01", title: "Browse Properties",
      desc: "Explore vacant lots and abandoned buildings from the Cook County Land Bank Authority. Filter by type, location, and priority status.",
      color: "#41B6E6", icon: <Search size={22} />,
    },
    {
      step: "02", title: "Reimagine in 3D",
      desc: "Click any property to open the 3D SketchUp-style visualizer. See a Gemini AI render of what the space could become after renovation.",
      color: "#CC0000", icon: <Gavel size={22} />,
    },
    {
      step: "03", title: "Transform Chicago",
      desc: "Submit your bid with a renovation proposal. Local residents and CDFIs receive priority consideration from the city.",
      color: "#41B6E6", icon: <Building2 size={22} />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-[#1a3a6e]/20">
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
              <div className="absolute -top-4 -right-2 text-[96px] font-black leading-none select-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-300"
                style={{ color: step.color }}>
                {step.step}
              </div>
              <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center"
                style={{ background: `${step.color}15`, color: step.color }}>
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

// ── Adapter: LandBankProperty → ChicagoProperty ───────────────────────────────
function toChicagoProperty(p: LandBankProperty): ChicagoProperty {
  return {
    id: p.parcelId,
    address: p.address,
    zip: p.zip,
    neighborhood: p.neighborhood,
    propertyType: p.propertyType,
    status: "Available",
    latitude: p.latitude,
    longitude: p.longitude,
    minBid: p.minBid,
    estimatedValue: p.estimatedValue,
  };
}

// ── Main Home Content ─────────────────────────────────────────────────────────
function HomeContent() {
  const [selectedProperty, setSelectedProperty] = useState<ChicagoProperty | null>(null);

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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=60')",
            opacity: 0.07,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060914]/50 via-[#060914]/80 to-[#060914]" />
        <div className="absolute top-[88px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#41B6E6]/20 to-transparent" />
        <div className="absolute top-[96px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#41B6E6]/15 to-transparent" />
        <div className="absolute top-24 right-16 opacity-10 flex gap-10">
          {[0, 1, 2, 3].map((i) => <ChicagoStar key={i} size={24} />)}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center gap-3 mb-10">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE CHICAGO DATA
            </span>
            <span className="text-zinc-600 text-xs">Updated hourly · City of Chicago Open Data Portal</span>
          </div>

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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-[#1a3a6e]/30">
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
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Tax Impact Slider ─────────────────────────────────────────────────── */}
      <TaxImpactSlider />

      {/* ── Cook County Land Bank — primary property listing ──────────────────── */}
      <LandBankSection
        onPropertyClick={(p) => setSelectedProperty(toChicagoProperty(p))}
      />

      {/* ── Data source logos ─────────────────────────────────────────────────── */}
      <DataSourceLogos />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a3a6e]/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 mb-8 h-4 rounded-full overflow-hidden max-w-xs">
            <div className="h-full flex-1" style={{ background: "#003087" }} />
            <div className="h-full flex-1 bg-white" />
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-full w-5 flex items-center justify-center" style={{ background: "white" }}>
                <ChicagoStar size={10} />
              </div>
            ))}
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

      {/* Property detail modal — opened by clicking a CCLBA property card */}
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
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#41B6E6", borderTopColor: "transparent" }} />
          <p className="text-zinc-400">Loading Second Act Chicago...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

"use client";
import { useState, useEffect } from "react";
import {
  X, MapPin, Building2, TreePine, Gavel, Calendar,
  DollarSign, Home, Ruler, Star, ChevronRight, TrendingUp,
  HardHat, Landmark, ExternalLink, Wand2, ChevronLeft,
} from "lucide-react";
import { ChicagoProperty } from "@/types";
import ReimaginedView from "./ReimaginedView";
import BidModal from "./BidModal";
import ConstructionQuotes from "./ConstructionQuotes";
import LenderDirectory from "./LenderDirectory";

interface PropertyDetailProps {
  property: ChicagoProperty;
  onClose: () => void;
}

type Tab = "overview" | "quotes" | "lenders";

// Data-source logos shown under both photos
function SourceLogos() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-zinc-600 text-[9px]">Data:</span>
      {[
        { initials: "CHI", bg: "#003087", title: "City of Chicago Open Data" },
        { initials: "DPU", bg: "#1c4DA1", title: "DePaul Chaddick Institute" },
        { initials: "UChi", bg: "#800000", title: "UChicago Crown Family School" },
      ].map((s) => (
        <span
          key={s.initials}
          title={s.title}
          className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-white font-bold text-[8px] leading-none"
          style={{ backgroundColor: s.bg }}
        >
          {s.initials}
        </span>
      ))}
    </div>
  );
}

export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showBid, setShowBid] = useState(false);
  const [showReimagine, setShowReimagine] = useState(false);
  const [currentBid, setCurrentBid] = useState(property.currentBid);
  const [bidCount, setBidCount] = useState(0);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [svError, setSvError] = useState(false);
  const [satError, setSatError] = useState(false);

  useEffect(() => {
    setGoogleMapsUrl(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${property.address}, ${property.neighborhood}, Chicago, IL`
      )}`
    );
    fetch(`/api/bid?propertyId=${property.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.highestBid) setCurrentBid(d.highestBid);
        if (d.totalBids) setBidCount(d.totalBids);
      })
      .catch(() => {});
  }, [property]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Home size={14} /> },
    { id: "quotes", label: "Quotes", icon: <HardHat size={14} /> },
    { id: "lenders", label: "Lenders", icon: <Landmark size={14} /> },
  ];

  const marketDiscount = Math.round(
    ((property.estimatedValue - (currentBid || property.minBid)) / property.estimatedValue) * 100
  );

  const photoParams = new URLSearchParams({
    address: `${property.address}, ${property.neighborhood}, Chicago, IL ${property.zip}`,
    lat: String(property.latitude),
    lng: String(property.longitude),
  });
  const streetViewUrl = `/api/photo?${photoParams}&mode=street`;
  const satelliteUrl = `/api/photo?${photoParams}&mode=satellite`;

  // ── Reimagine full-screen overlay ──────────────────────────────────────────
  if (showReimagine) {
    return (
      <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-16 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-[#0f1629] border border-purple-900/50 rounded-2xl w-full max-w-3xl shadow-2xl shadow-purple-900/20 mb-8">
          {/* Reimagine header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/30">
            <button
              onClick={() => setShowReimagine(false)}
              className="flex items-center gap-2 text-purple-300 hover:text-white text-sm font-semibold transition-colors"
            >
              <ChevronLeft size={16} /> Back to Property
            </button>
            <div className="text-center">
              <p className="text-white font-bold text-sm">{property.address}</p>
              <p className="text-purple-400 text-xs">{property.neighborhood} · AI Vision Mode</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          <div className="p-5">
            <ReimaginedView property={property} />
          </div>
        </div>
      </div>
    );
  }

  // ── Main detail view ────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-16 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-[#0f1629] border border-[#1a3a6e]/60 rounded-2xl w-full max-w-3xl shadow-2xl shadow-black/60 mb-8">

          {/* ── TWO PHOTOS HERO (like CCLB) ── */}
          <div className="relative rounded-t-2xl overflow-hidden">
            <div className="grid grid-cols-2 gap-0.5 bg-[#0a0e1a]" style={{ height: 240 }}>

              {/* Photo 1 — Street View (ground-level) */}
              <div className="relative overflow-hidden">
                {!svError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={streetViewUrl}
                    alt={`${property.address} street view`}
                    className="w-full h-full object-cover"
                    onError={() => setSvError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0a0e1a]">
                    {property.propertyType === "abandoned_building"
                      ? <Building2 size={40} className="text-[#1a3a6e]" />
                      : <TreePine size={40} className="text-[#1a3a6e]" />}
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
                    📷 Street View
                  </span>
                </div>
              </div>

              {/* Photo 2 — Satellite / aerial */}
              <div className="relative overflow-hidden">
                {!satError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={satelliteUrl}
                    alt={`${property.address} aerial`}
                    className="w-full h-full object-cover"
                    onError={() => setSatError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0a0e1a]">
                    <MapPin size={40} className="text-[#1a3a6e]" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-16" />
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
                    🛰 Aerial View
                  </span>
                </div>
              </div>
            </div>

            {/* Overlay: close + property type badge */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
            >
              <X size={15} />
            </button>
            <div className="absolute top-3 left-3 z-10">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                property.propertyType === "abandoned_building"
                  ? "bg-amber-500/90 text-amber-950"
                  : "bg-emerald-500/90 text-emerald-950"
              }`}>
                {property.propertyType === "abandoned_building"
                  ? <><Building2 size={10} /> Abandoned Building</>
                  : <><TreePine size={10} /> Vacant Lot</>
                }
              </span>
            </div>
          </div>

          {/* Source logos under photos */}
          <div className="px-4 py-1.5 flex items-center justify-between border-b border-[#1a3a6e]/30 bg-[#0a0e1a]/40">
            <SourceLogos />
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#4a90d9] text-[10px] hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} /> Open in Maps
            </a>
          </div>

          {/* Address + stats */}
          <div className="px-5 pt-4 pb-2">
            <h1 className="text-white font-bold text-xl leading-tight">{property.address}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} className="text-[#4a90d9]" />
              <span className="text-zinc-400 text-sm">{property.neighborhood} · Chicago, IL {property.zip}</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 border-y border-[#1a3a6e]/40 mx-0">
            {[
              { label: "Min Bid", value: `$${property.minBid.toLocaleString()}`, color: "text-white" },
              { label: "Est. Value", value: `$${property.estimatedValue.toLocaleString()}`, color: "text-[#4a90d9]" },
              { label: "Below Mkt", value: `${marketDiscount}%`, color: "text-emerald-400" },
              { label: "Active Bids", value: bidCount.toString(), color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 text-center border-r border-[#1a3a6e]/40 last:border-r-0">
                <p className="text-zinc-500 text-[10px] mb-0.5">{stat.label}</p>
                <p className={`font-bold text-base ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── REIMAGINE CTA — the hero button ── */}
          <div className="px-5 pt-5 pb-1">
            <button
              onClick={() => setShowReimagine(true)}
              className="w-full group relative overflow-hidden flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 hover:from-purple-800 hover:via-indigo-800 hover:to-purple-800 border border-purple-700/50 hover:border-purple-500/70 text-white font-bold py-4 px-5 rounded-2xl transition-all shadow-xl shadow-purple-900/30"
            >
              {/* Animated shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                  <Wand2 size={20} className="text-purple-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-base leading-tight">Reimagine This Space</p>
                  <p className="text-purple-300 text-xs font-normal mt-0.5">3D SketchUp architectural rendering · AI-powered</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 group-hover:text-white transition-colors">
                <span className="text-sm font-semibold">Visualize</span>
                <ChevronRight size={16} />
              </div>
            </button>
          </div>

          {/* Current bid notice */}
          {currentBid && (
            <div className="mx-5 mt-3 flex items-center justify-between bg-[#003087]/20 border border-[#1a6eb5]/30 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Gavel size={14} className="text-[#4a90d9]" />
                <span className="text-zinc-300 text-sm">Current Highest Bid</span>
              </div>
              <span className="text-white font-bold">${currentBid.toLocaleString()}</span>
            </div>
          )}

          {/* Local priority */}
          <div className="mx-5 mt-2 flex items-center gap-2 bg-[#003087]/10 border border-[#1a3a6e]/30 rounded-xl px-3 py-2">
            <Star size={12} className="text-[#4a90d9] shrink-0" fill="currentColor" />
            <p className="text-zinc-400 text-xs">
              <strong className="text-[#4a90d9]">Local Priority:</strong> Residents of ZIP {property.zip} receive priority consideration.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1a3a6e]/40 mt-4 px-5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-[#1a6eb5] text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Ruler size={12} />, label: "Est. Sq Ft", value: property.sqft ? `${property.sqft.toLocaleString()} sqft` : "N/A" },
                    { icon: <Ruler size={12} />, label: "Lot Size", value: property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : "N/A" },
                    { icon: <DollarSign size={12} />, label: "Ward", value: property.ward ? `Ward ${property.ward}` : "N/A" },
                    { icon: <Calendar size={12} />, label: "Last Inspection", value: property.lastInspection || "Unknown" },
                    { icon: <Building2 size={12} />, label: "Status", value: property.status },
                    { icon: <MapPin size={12} />, label: "ZIP Code", value: property.zip },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0a0e1a] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">{item.icon}{item.label}</div>
                      <p className="text-white text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Condition */}
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">Property Condition</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.isBoardedUp && (
                      <span className="px-3 py-1 bg-amber-900/20 border border-amber-700/30 rounded-full text-amber-400 text-xs font-medium">Board-Up Required</span>
                    )}
                    {property.isHazardous && (
                      <span className="px-3 py-1 bg-red-900/20 border border-red-700/30 rounded-full text-red-400 text-xs font-medium">Hazardous Conditions</span>
                    )}
                    <span className="px-3 py-1 bg-[#1a3a6e]/30 border border-[#1a3a6e]/50 rounded-full text-zinc-300 text-xs font-medium">
                      {property.propertyType === "abandoned_building" ? "Structure Present" : "Clear Lot"}
                    </span>
                  </div>
                </div>

                {/* Tax delta */}
                <div className="bg-[#0a0e1a] rounded-2xl border border-[#1a3a6e]/30 p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <DollarSign size={13} className="text-emerald-400" />
                    Property Tax Delta — {property.neighborhood}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Current Rate", value: "2.1%", color: "text-white" },
                      { label: "Post-Rehab Rate", value: "1.6%", color: "text-emerald-400" },
                      { label: "Annual Savings", value: `$${Math.round(property.estimatedValue * 0.005).toLocaleString()}`, color: "text-amber-400" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-zinc-500 text-xs">{s.label}</p>
                        <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-[#003087]/10 border border-[#1a3a6e]/30 rounded-xl">
                    <p className="text-zinc-400 text-xs">
                      <strong className="text-[#4a90d9]">Neighborhood Reinvestment:</strong> 100% of tax revenue earmarked for {property.neighborhood} infrastructure, parks, and schools under Chicago&apos;s Community Investment Tax Initiative.
                    </p>
                  </div>
                </div>

                {/* Bid CTA in overview */}
                <div className="flex items-center justify-between p-4 bg-[#0a0e1a] rounded-2xl border border-[#1a3a6e]/30">
                  <div>
                    <p className="text-white font-semibold">Ready to bid?</p>
                    <p className="text-zinc-400 text-xs mt-0.5">Min ${property.minBid.toLocaleString()} · Local residents get priority</p>
                  </div>
                  <button
                    onClick={() => setShowBid(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/20"
                  >
                    <Gavel size={13} /> Bid Now <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {tab === "quotes" && <ConstructionQuotes propertyType={property.propertyType} estimatedValue={property.estimatedValue} />}
            {tab === "lenders" && <LenderDirectory minAmount={property.minBid} />}
          </div>

          {/* Footer bid button */}
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={() => setShowBid(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-900/20"
            >
              <Gavel size={14} /> Place Bid — Min ${property.minBid.toLocaleString()}
            </button>
            <button
              onClick={() => setShowReimagine(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-purple-900/30 border border-purple-700/40 hover:border-purple-500/60 text-purple-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
            >
              <Wand2 size={14} /> Reimagine
            </button>
          </div>
        </div>
      </div>

      {showBid && (
        <BidModal
          property={property}
          onClose={() => setShowBid(false)}
          onBidSuccess={(amount) => {
            setCurrentBid(amount);
            setBidCount((c) => c + 1);
            setShowBid(false);
          }}
        />
      )}
    </>
  );
}

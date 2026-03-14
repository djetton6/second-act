"use client";
import { useState, useEffect } from "react";
import {
  X, MapPin, Building2, TreePine, Gavel, Calendar,
  DollarSign, Home, Ruler, Star, ChevronRight, TrendingUp,
  HardHat, Landmark, ExternalLink
} from "lucide-react";
import { ChicagoProperty } from "@/types";
import { getStreetViewUrl } from "@/lib/streetview";
import ReimaginedView from "./ReimaginedView";
import BidModal from "./BidModal";
import ConstructionQuotes from "./ConstructionQuotes";
import LenderDirectory from "./LenderDirectory";

interface PropertyDetailProps {
  property: ChicagoProperty;
  onClose: () => void;
}

type Tab = "overview" | "reimagine" | "quotes" | "lenders";

export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showBid, setShowBid] = useState(false);
  const [currentBid, setCurrentBid] = useState(property.currentBid);
  const [bidCount, setBidCount] = useState(0);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  useEffect(() => {
    setGoogleMapsUrl(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${property.address}, ${property.neighborhood}, Chicago, IL`
      )}`
    );
    // Fetch actual bid data
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
    { id: "reimagine", label: "AI Vision", icon: <TrendingUp size={14} /> },
    { id: "quotes", label: "Quotes", icon: <HardHat size={14} /> },
    { id: "lenders", label: "Lenders", icon: <Landmark size={14} /> },
  ];

  const marketDiscount = Math.round(
    ((property.estimatedValue - (currentBid || property.minBid)) / property.estimatedValue) * 100
  );

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-[#0f1629] border border-[#1a3a6e]/60 rounded-2xl w-full max-w-3xl shadow-2xl shadow-black/60 mb-8">
          {/* Header image area — real Street View photo */}
          <div className="relative h-52 bg-[#0a0e1a] rounded-t-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getStreetViewUrl(property.latitude, property.longitude, 800, 400)}
              alt={property.address}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <span className="text-[10px] text-zinc-300 font-medium">📷 Google Street View</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1629] via-[#0f1629]/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Property type badge */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                property.propertyType === "abandoned_building"
                  ? "bg-amber-500/90 text-amber-950"
                  : "bg-emerald-500/90 text-emerald-950"
              }`}>
                {property.propertyType === "abandoned_building"
                  ? <><Building2 size={11} /> Abandoned Building</>
                  : <><TreePine size={11} /> Vacant Lot</>
                }
              </span>
            </div>

            {/* Address overlay */}
            <div className="absolute bottom-4 left-6 right-6">
              <h1 className="text-white font-bold text-2xl leading-tight">{property.address}</h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={13} className="text-[#4a90d9]" />
                <span className="text-zinc-300 text-sm">{property.neighborhood} · Chicago, IL {property.zip}</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#4a90d9] text-xs hover:text-white transition-colors ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={11} /> Maps
                </a>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 border-b border-[#1a3a6e]/40">
            {[
              { label: "Min Bid", value: `$${property.minBid.toLocaleString()}`, color: "text-white" },
              { label: "Est. Value", value: `$${property.estimatedValue.toLocaleString()}`, color: "text-[#4a90d9]" },
              { label: "Below Market", value: `${marketDiscount}%`, color: "text-emerald-400" },
              { label: "Active Bids", value: bidCount.toString(), color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 text-center border-r border-[#1a3a6e]/40 last:border-r-0">
                <p className="text-zinc-500 text-xs mb-0.5">{stat.label}</p>
                <p className={`font-bold text-lg ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Current bid indicator */}
          {currentBid && (
            <div className="mx-6 mt-4 flex items-center justify-between bg-[#003087]/20 border border-[#1a6eb5]/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Gavel size={15} className="text-[#4a90d9]" />
                <span className="text-zinc-300 text-sm">Current Highest Bid</span>
              </div>
              <span className="text-white font-bold text-lg">${currentBid.toLocaleString()}</span>
            </div>
          )}

          {/* Local priority notice */}
          <div className="mx-6 mt-3 flex items-center gap-2 bg-[#003087]/10 border border-[#1a3a6e]/30 rounded-xl px-4 py-2.5">
            <Star size={13} className="text-[#4a90d9]" fill="currentColor" />
            <p className="text-zinc-400 text-xs">
              <strong className="text-[#4a90d9]">Local Priority:</strong> Residents of ZIP {property.zip} receive priority consideration for this property.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1a3a6e]/40 mt-4 px-6">
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
          <div className="p-6">
            {tab === "overview" && (
              <div className="space-y-5">
                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Ruler size={13} />, label: "Est. Sq Ft", value: property.sqft ? `${property.sqft.toLocaleString()} sqft` : "N/A" },
                    { icon: <Ruler size={13} />, label: "Lot Size", value: property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : "N/A" },
                    { icon: <DollarSign size={13} />, label: "Ward", value: property.ward ? `Ward ${property.ward}` : "N/A" },
                    { icon: <Calendar size={13} />, label: "Last Inspection", value: property.lastInspection || "Unknown" },
                    { icon: <Building2 size={13} />, label: "Status", value: property.status },
                    { icon: <MapPin size={13} />, label: "ZIP Code", value: property.zip },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#0a0e1a] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                        {item.icon}
                        {item.label}
                      </div>
                      <p className="text-white text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Condition indicators */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-sm">Property Condition</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.isBoardedUp && (
                      <span className="px-3 py-1 bg-amber-900/20 border border-amber-700/30 rounded-full text-amber-400 text-xs font-medium">
                        Board-Up Required
                      </span>
                    )}
                    {property.isHazardous && (
                      <span className="px-3 py-1 bg-red-900/20 border border-red-700/30 rounded-full text-red-400 text-xs font-medium">
                        Hazardous Conditions
                      </span>
                    )}
                    <span className="px-3 py-1 bg-[#1a3a6e]/30 border border-[#1a3a6e]/50 rounded-full text-zinc-300 text-xs font-medium">
                      {property.propertyType === "abandoned_building" ? "Structure Present" : "Clear Lot"}
                    </span>
                  </div>
                </div>

                {/* Quick action */}
                <div className="flex items-center justify-between p-4 bg-[#0a0e1a] rounded-2xl border border-[#1a3a6e]/30">
                  <div>
                    <p className="text-white font-semibold">Ready to bid on this property?</p>
                    <p className="text-zinc-400 text-xs mt-0.5">Minimum bid: ${property.minBid.toLocaleString()} · Local residents get priority</p>
                  </div>
                  <button
                    onClick={() => setShowBid(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/20"
                  >
                    <Gavel size={14} />
                    Bid Now
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* Property tax delta */}
                <div className="bg-[#0a0e1a] rounded-2xl border border-[#1a3a6e]/30 p-4">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" />
                    Property Tax Delta — {property.neighborhood}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs">Current Rate</p>
                      <p className="text-white font-bold text-lg">2.1%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs">Post-Rehab Rate</p>
                      <p className="text-emerald-400 font-bold text-lg">1.6%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs">Annual Savings</p>
                      <p className="text-amber-400 font-bold text-lg">
                        ${Math.round(property.estimatedValue * 0.005).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-[#003087]/10 border border-[#1a3a6e]/30 rounded-xl">
                    <p className="text-zinc-400 text-xs">
                      <strong className="text-[#4a90d9]">Neighborhood Reinvestment:</strong> 100% of property tax revenue from this parcel is earmarked for {property.neighborhood} infrastructure, parks, and schools under Chicago&apos;s Community Investment Tax Initiative.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === "reimagine" && <ReimaginedView property={property} />}

            {tab === "quotes" && <ConstructionQuotes propertyType={property.propertyType} estimatedValue={property.estimatedValue} />}

            {tab === "lenders" && <LenderDirectory minAmount={property.minBid} />}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setShowBid(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white font-bold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-900/20"
            >
              <Gavel size={15} />
              Place a Bid — Min ${property.minBid.toLocaleString()}
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

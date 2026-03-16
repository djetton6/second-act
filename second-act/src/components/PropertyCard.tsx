"use client";
import { MapPin, Building2, TreePine, Gavel, Star, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { ChicagoProperty } from "@/types";
import { useState } from "react";

interface PropertyCardProps {
  property: ChicagoProperty;
  onClick: (property: ChicagoProperty) => void;
  userZip?: string;
}

// Small source attribution logos shown at card bottom
function SourceLogos() {
  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#1a3a6e]/30">
      <span className="text-zinc-600 text-[10px] mr-0.5">Data:</span>
      {[
        { initials: "CHI", bg: "#003087", title: "City of Chicago Open Data" },
        { initials: "DPU", bg: "#1c4DA1", title: "DePaul Chaddick Institute" },
        { initials: "UChi", bg: "#800000", title: "UChicago Crown Family School" },
      ].map((src) => (
        <span
          key={src.initials}
          title={src.title}
          className="inline-flex items-center justify-center rounded-md text-white font-bold px-1.5 py-0.5 text-[9px] leading-none"
          style={{ backgroundColor: src.bg }}
        >
          {src.initials}
        </span>
      ))}
    </div>
  );
}

export default function PropertyCard({ property, onClick, userZip }: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);

  const isLocalUser = userZip && userZip === property.zip;
  const hasBid = !!property.currentBid;

  const imgParams = new URLSearchParams({
    address: `${property.address}, Chicago, IL ${property.zip}`,
    lat: String(property.latitude),
    lng: String(property.longitude),
  });
  const imgSrc = imgError ? null : `/api/photo?${imgParams}`;

  return (
    <div
      onClick={() => onClick(property)}
      className="group bg-[#0f1629] border border-[#1a3a6e]/40 rounded-2xl overflow-hidden cursor-pointer hover:border-[#1a6eb5]/60 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-48 bg-[#0a0e1a] overflow-hidden">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {property.propertyType === "abandoned_building"
              ? <Building2 size={48} className="text-[#1a3a6e]" />
              : <TreePine size={48} className="text-[#1a3a6e]" />
            }
          </div>
        )}

        {/* Source label */}
        {!imgError && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-[10px] text-zinc-300 font-medium">📷 Google Maps</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1629]/80 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            property.propertyType === "abandoned_building"
              ? "bg-amber-500/90 text-amber-950"
              : "bg-emerald-500/90 text-emerald-950"
          }`}>
            {property.propertyType === "abandoned_building"
              ? <><Building2 size={10} /> Abandoned</>
              : <><TreePine size={10} /> Vacant Lot</>
            }
          </span>
          {isLocalUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#003087] text-white border border-[#1a6eb5]/50">
              <Star size={9} fill="currentColor" /> Local Priority
            </span>
          )}
          {property.isHazardous && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-900/80 text-red-200">
              <AlertTriangle size={9} /> Hazardous
            </span>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            property.status === "Available" || property.status === "Bidding Open"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-zinc-700/50 text-zinc-300 border border-zinc-600/30"
          }`}>
            {property.status}
          </span>
        </div>

        {/* Current bid overlay */}
        {hasBid && (
          <div className="absolute bottom-2 right-2 bg-[#003087]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#1a6eb5]/40">
            <p className="text-xs text-[#4a90d9] font-medium">Current Bid</p>
            <p className="text-white font-bold text-sm">${property.currentBid!.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={14} className="text-[#4a90d9] mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{property.address}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{property.neighborhood} · ZIP {property.zip}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#0a0e1a] rounded-xl p-2.5">
            <p className="text-zinc-500 text-xs">Min Bid</p>
            <p className="text-white font-bold text-sm">${property.minBid.toLocaleString()}</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-xl p-2.5">
            <p className="text-zinc-500 text-xs">Est. Value</p>
            <p className="text-[#4a90d9] font-bold text-sm">${property.estimatedValue.toLocaleString()}</p>
          </div>
          {property.sqft && (
            <div className="bg-[#0a0e1a] rounded-xl p-2.5">
              <p className="text-zinc-500 text-xs">Est. Sq Ft</p>
              <p className="text-white font-semibold text-sm">{property.sqft.toLocaleString()}</p>
            </div>
          )}
          {property.lotSize && (
            <div className="bg-[#0a0e1a] rounded-xl p-2.5">
              <p className="text-zinc-500 text-xs">Lot Size</p>
              <p className="text-white font-semibold text-sm">{property.lotSize.toLocaleString()} sqft</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <TrendingUp size={13} />
            <span>
              {Math.round(((property.estimatedValue - property.minBid) / property.estimatedValue) * 100)}% below market
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#4a90d9] text-xs font-semibold group-hover:gap-2 transition-all">
            <span>Details</span>
            <ChevronRight size={13} />
          </div>
        </div>

        {property.isBoardedUp && (
          <div className="mt-2 px-2 py-1 bg-amber-900/20 border border-amber-700/30 rounded-lg text-xs text-amber-400">
            Board-Up Required
          </div>
        )}

        {/* Data source attribution */}
        <SourceLogos />
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(property); }}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20"
        >
          <Gavel size={13} />
          Place Bid
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(property); }}
          className="px-3 py-2.5 bg-purple-900/30 border border-purple-700/40 hover:border-purple-500/60 text-purple-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
        >
          Remodel ✦
        </button>
      </div>
    </div>
  );
}

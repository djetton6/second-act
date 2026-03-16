"use client";
import { useState } from "react";
import { Download, MapPin, Building2, TreePine, ExternalLink, Camera } from "lucide-react";
import { CCLBA_TOP_20, LandBankProperty } from "@/lib/landbank-data";
import { getStreetViewUrlByAddress, getSatelliteUrl } from "@/lib/streetview";

const TOLEMI_URL =
  "https://cook-county-land-bank-il-publicity.tolemi.com/#eyJzZWxlY3RlZEFzc2V0cyI6W10sIm1vZGFsS2V5IjpudWxsLCJwYXJjZWxTdHlsZSI6Im1peGVkIiwiYmFzZU1hcCI6ImRhcmstbGF5ZXIiLCJwYXJjZWxJZExhYmVscyI6dHJ1ZSwibWFwTGF0IjpudWxsLCJtYXBMbmciOm51bGwsIm1hcFpvb20iOm51bGwsImNvbHVtbnMiOlsicGlkIiwiYWRkcmVzcyIsImlkZW50aXR5X293bmVyIl0sImxpc3RTb3J0QnkiOm51bGwsImxpc3RTb3J0RGlyZWN0aW9uIjoiYXNjIiwieSI6InBjIiwieCI6bnVsbCwieiI6ImNpdHlfd2lkZSIsImZyb21EYXRlIjpudWxsLCJ0b0RhdGUiOm51bGwsInRpbWVGdW5jdGlvbiI6IiIsImF4aXNGdW5jdGlvbiI6IiIsInpBeGlzRnVuY3Rpb24iOiIiLCJzaG93VW5tYXBwZWRFdmVudHMiOmZhbHNlLCJhcHBWaWV3IjoibWFwIiwicGluc1NpZGVyQ29sbGFwc2VkIjp0cnVlLCJmaWx0ZXJzIjoie1wiaGVhdEF0dHJpYnV0ZVwiOlwiZmlsdGVyMjk3M1wifSIsInF1ZXJ5IjoiW10iLCJ2aXN1YWxpemVkTGF5ZXJzIjoiW10ifQ==";

interface LandBankCardProps {
  property: LandBankProperty;
  onClick: (p: LandBankProperty) => void;
}

function LandBankCard({ property, onClick }: LandBankCardProps) {
  const [useSat, setUseSat] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Try Street View by address first; on error fall back to lat/lng satellite (always succeeds)
  const streetViewUrl = getStreetViewUrlByAddress(property.fullAddress, 600, 400);
  const satelliteUrl = getSatelliteUrl(property.latitude, property.longitude, 600, 400, 18);
  const imgSrc = imgFailed ? null : useSat ? satelliteUrl : streetViewUrl;

  function handleError() {
    if (!useSat) {
      setUseSat(true);
      setLoaded(false);
    } else {
      setImgFailed(true);
    }
  }

  return (
    <div
      className="group bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-2xl overflow-hidden cursor-pointer hover:border-[#41B6E6]/40 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
      onClick={() => onClick(property)}
    >
      {/* Image */}
      <div className="relative h-44 bg-[#060914] overflow-hidden">
        {imgSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={property.address}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded(true)}
              onError={handleError}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera size={20} className="text-[#1a3a6e] animate-pulse" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {property.propertyType === "abandoned_building"
              ? <Building2 size={36} className="text-[#1a3a6e]" />
              : <TreePine size={36} className="text-[#1a3a6e]" />}
            <span className="text-zinc-700 text-xs">No imagery</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/90 via-transparent to-transparent" />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <span className="bg-[#CC0000]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            🏦 CCLB
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            property.propertyType === "abandoned_building"
              ? "bg-amber-500/90 text-amber-950"
              : "bg-emerald-500/90 text-emerald-950"
          }`}>
            {property.propertyType === "abandoned_building" ? "Abandoned" : "Vacant Lot"}
          </span>
        </div>

        {loaded && !imgFailed && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
            <span className="text-[9px] text-zinc-300">
              {useSat ? "🛰 Aerial" : "📷 Street View"}
            </span>
          </div>
        )}

        {/* Reimagine hint on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="bg-purple-900/90 border border-purple-600/50 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm">
            ✦ Reimagine Space
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={13} style={{ color: "#41B6E6" }} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{property.address}</p>
            <p className="text-zinc-400 text-xs mt-0.5">{property.city}, {property.state} {property.zip}</p>
          </div>
        </div>

        {property.programs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.programs.map((p) => (
              <span key={p} className="text-[9px] bg-[#1a3a6e]/40 text-zinc-400 px-1.5 py-0.5 rounded-md">
                {p === "Commercial/Industrial Property" ? "Commercial" : p === "Residential/Community Developer" ? "Residential Dev" : p}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#060914] rounded-xl p-2.5">
            <p className="text-zinc-600 text-[10px]">Min Bid</p>
            <p className="text-white font-bold text-sm">${property.minBid.toLocaleString()}</p>
          </div>
          <div className="bg-[#060914] rounded-xl p-2.5">
            <p className="text-zinc-600 text-[10px]">Est. Value</p>
            <p className="font-bold text-sm" style={{ color: "#41B6E6" }}>${property.estimatedValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#1a3a6e]/30 flex items-center justify-between">
          <span className="text-[9px] text-zinc-600">PIN: {property.parcelId}</span>
          {property.city === "Chicago" && (
            <span className="text-[9px] font-bold" style={{ color: "#41B6E6" }}>Chicago Priority</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface LandBankSectionProps {
  onPropertyClick?: (p: LandBankProperty) => void;
}

export default function LandBankSection({ onPropertyClick }: LandBankSectionProps) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/api/landbank-csv";
    link.download = "cook-county-land-bank-inventory.csv";
    link.click();
    setTimeout(() => setDownloading(false), 2000);
  }

  return (
    <section data-section="landbank" id="properties" className="py-20 border-t border-[#1a3a6e]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-block text-xs font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full border"
                style={{ color: "#CC0000", borderColor: "rgba(204,0,0,0.3)", background: "rgba(204,0,0,0.05)" }}
              >
                Cook County Land Bank
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-3">
              Featured Land Bank<br />
              <span style={{ color: "#41B6E6" }}>Properties</span>
            </h2>
            <p className="text-zinc-400 max-w-xl text-base leading-relaxed">
              Verified inventory from the Cook County Land Bank Authority.
              Click any property to view details and Reimagine the space in 3D.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2.5 font-bold px-6 py-3.5 rounded-2xl border transition-all duration-200 hover:scale-105"
            style={{
              background: downloading ? "rgba(204,0,0,0.1)" : "rgba(204,0,0,0.08)",
              borderColor: "rgba(204,0,0,0.3)",
              color: downloading ? "#888" : "#CC0000",
            }}
          >
            <Download size={16} />
            {downloading ? "Downloading…" : "Download Full Inventory"}
            <span className="text-xs opacity-60">CSV</span>
          </button>
        </div>

        {/* Attribution bar */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-[#0a0e1a] border border-[#1a3a6e]/30 rounded-2xl flex-wrap">
          <div
            className="px-3 py-1.5 rounded-xl text-white font-black text-xs"
            style={{ background: "#CC0000" }}
          >
            CCLBA
          </div>
          <div className="text-zinc-400 text-sm">
            <strong className="text-white">Cook County Land Bank Authority</strong> — publicly available inventory
          </div>
          <a
            href={TOLEMI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs ml-auto hover:text-white transition-colors"
            style={{ color: "#41B6E6" }}
          >
            View Live CCLBA Map <ExternalLink size={11} />
          </a>
        </div>

        {/* Property grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CCLBA_TOP_20.map((property) => (
            <LandBankCard
              key={property.parcelId}
              property={property}
              onClick={onPropertyClick ?? (() => {})}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-700 text-xs">
            Photos: Google Maps Street View & Aerial · Data: Cook County Land Bank Authority (Public Record) ·{" "}
            <button onClick={handleDownload} className="underline hover:text-zinc-400 transition-colors">
              Download full inventory ({"> 700 parcels"})
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import {
  Sparkles, Loader2, ChevronDown, Wand2, RotateCcw,
  Download, Box, Map, Sofa, Info, ChevronRight,
} from "lucide-react";
import { ChicagoProperty } from "@/types";
import { getStreetViewUrl, getSatelliteUrl } from "@/lib/streetview";

interface ReimaginedViewProps {
  property: ChicagoProperty;
}

const STYLES = [
  { value: "Modern", emoji: "◼", desc: "Flat roof, glass, dark steel" },
  { value: "Greystone", emoji: "🪨", desc: "Limestone, ornate cornice" },
  { value: "Prairie", emoji: "🌾", desc: "Wright-inspired, wide eaves" },
  { value: "Industrial", emoji: "⚙️", desc: "Exposed brick, steel frame" },
  { value: "Craftsman", emoji: "🪵", desc: "Porch, wood details" },
];

const VIEW_MODES = [
  { id: "exterior", label: "3D Exterior", icon: <Box size={14} />, desc: "SketchUp-style 3D model" },
  { id: "floorplan", label: "Floor Plan", icon: <Map size={14} />, desc: "Architectural blueprint" },
  { id: "interior", label: "Interior", icon: <Sofa size={14} />, desc: "3D interior view" },
] as const;

type ViewMode = "exterior" | "floorplan" | "interior";

interface GeneratedResult {
  imageBase64: string | null;
  mimeType: string;
  description: string;
  isDemo: boolean;
  parcelData: {
    yearBuilt: number | null;
    sqft: number | null;
    stories: number | null;
    rooms: number | null;
    bedrooms: number | null;
    basement: boolean;
    exterior: string | null;
    buildingClass: string | null;
    pin: string | null;
  } | null;
}

export default function ReimaginedView({ property }: ReimaginedViewProps) {
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">(
    property.propertyType === "vacant_lot" ? "new_construction" : "renovation"
  );
  const [style, setStyle] = useState("Modern");
  const [viewMode, setViewMode] = useState<ViewMode>("exterior");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  const streetViewUrl = getStreetViewUrl(property.latitude, property.longitude, 400, 260);
  const satelliteUrl = getSatelliteUrl(property.latitude, property.longitude, 400, 260, 19);

  async function generate(mode: ViewMode = viewMode) {
    setLoading(true);
    setError("");
    if (mode !== viewMode) setViewMode(mode);
    try {
      const res = await fetch("/api/reimagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: property.address,
          neighborhood: property.neighborhood,
          propertyType: property.propertyType,
          proposalType,
          style,
          latitude: property.latitude,
          longitude: property.longitude,
          zip: property.zip,
          viewMode: mode,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setResult({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType ?? "image/png",
        description: data.description,
        isDemo: data.isDemo,
        parcelData: data.parcelData ?? null,
      });
      setShowDescription(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.imageBase64) return;
    const link = document.createElement("a");
    link.href = `data:${result.mimeType};base64,${result.imageBase64}`;
    link.download = `NanoBanana-${viewMode}-${property.address.replace(/\s+/g, "-")}.png`;
    link.click();
  }

  const afterImageSrc = result?.imageBase64
    ? `data:${result.mimeType};base64,${result.imageBase64}`
    : null;

  const pd = result?.parcelData;

  // ── Before photos ─────────────────────────────────────────────────────────
  const beforePanel = (
    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden border border-[#1a3a6e]/40 mb-4">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={streetViewUrl} alt="Street View" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] text-zinc-300 font-medium">📷 Street View</div>
        <div className="absolute top-1.5 left-1.5 bg-black/60 rounded px-1.5 py-0.5 text-[9px] text-white font-bold">BEFORE</div>
      </div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={satelliteUrl} alt="Aerial" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 text-[9px] text-zinc-300 font-medium">🛰 Aerial</div>
        {pd?.pin && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 rounded px-1.5 py-0.5 text-[9px] text-zinc-400">
            PIN: {pd.pin}
          </div>
        )}
      </div>
      {/* Source attribution */}
      <div className="col-span-2 bg-[#0a0e1a] px-2 py-1 flex items-center gap-1.5">
        <span className="text-zinc-600 text-[9px]">Source data:</span>
        {[
          { l: "CHI", bg: "#003087", t: "City of Chicago" },
          { l: "DPU", bg: "#1c4DA1", t: "DePaul Chaddick Institute" },
          { l: "UChi", bg: "#800000", t: "UChicago Crown Family School" },
        ].map((s) => (
          <span key={s.l} title={s.t} className="rounded px-1.5 py-0.5 text-white font-bold text-[8px] leading-none" style={{ backgroundColor: s.bg }}>{s.l}</span>
        ))}
        {pd?.pin && (
          <span className="ml-auto text-zinc-600 text-[9px]">Cook County PIN: {pd.pin}</span>
        )}
      </div>
    </div>
  );

  // ── Parcel data strip ──────────────────────────────────────────────────────
  const parcelStrip = pd && (pd.yearBuilt || pd.sqft || pd.bedrooms || pd.stories) ? (
    <div className="mb-4 bg-[#0a0e1a] border border-[#1a3a6e]/30 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Info size={11} className="text-[#4a90d9]" />
        <span className="text-zinc-400 text-xs font-semibold">Real Parcel Data — Cook County Assessor</span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {pd.yearBuilt && <span className="text-xs text-zinc-300">🏗 Built <strong className="text-white">{pd.yearBuilt}</strong></span>}
        {pd.sqft && <span className="text-xs text-zinc-300">📐 <strong className="text-white">{pd.sqft.toLocaleString()}</strong> sq ft</span>}
        {pd.stories && <span className="text-xs text-zinc-300">🏢 <strong className="text-white">{pd.stories}</strong> stories</span>}
        {pd.bedrooms && <span className="text-xs text-zinc-300">🛏 <strong className="text-white">{pd.bedrooms}</strong> beds</span>}
        {pd.rooms && <span className="text-xs text-zinc-300">🚪 <strong className="text-white">{pd.rooms}</strong> rooms</span>}
        {pd.basement && <span className="text-xs text-zinc-300">⬇ <strong className="text-white">Basement</strong></span>}
        {pd.exterior && <span className="text-xs text-zinc-300">🧱 <strong className="text-white">{pd.exterior}</strong></span>}
        {pd.buildingClass && <span className="text-xs text-zinc-300">📋 <strong className="text-white">{pd.buildingClass}</strong></span>}
      </div>
    </div>
  ) : null;

  // ── Pre-generation state ────────────────────────────────────────────────────
  if (!result && !loading) {
    return (
      <div className="space-y-4">
        {beforePanel}

        {/* Controls */}
        <div className="space-y-3">
          {/* Proposal toggle */}
          <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1 w-fit">
            {(["renovation", "new_construction"] as const).map((pt) => (
              <button
                key={pt}
                onClick={() => setProposalType(pt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  proposalType === pt ? "bg-[#003087] text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {pt === "renovation" ? "Renovation" : "New Build"}
              </button>
            ))}
          </div>

          {/* Style picker */}
          <div className="grid grid-cols-5 gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                title={s.desc}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all ${
                  style === s.value
                    ? "bg-purple-900/40 border-purple-600/60 text-white"
                    : "bg-[#0a0e1a] border-[#1a3a6e]/40 text-zinc-400 hover:border-purple-700/40 hover:text-zinc-200"
                }`}
              >
                <span className="text-base leading-none">{s.emoji}</span>
                <span className="text-[10px] leading-tight text-center">{s.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Big REIMAGINE button */}
        <button
          onClick={() => generate("exterior")}
          className="w-full group relative overflow-hidden flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 hover:from-purple-800 hover:via-indigo-800 hover:to-purple-700 border border-purple-600/40 hover:border-purple-400/60 text-white font-bold py-7 rounded-2xl transition-all shadow-2xl shadow-purple-900/40"
        >
          {/* Shimmer */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

          {/* NanoBanana logo pill */}
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-1">
            <span className="text-yellow-300 text-xs font-black">NanoBanana</span>
            <span className="text-white/50 text-xs">×</span>
            <span className="text-blue-300 text-xs font-semibold">Gemini 2.0</span>
          </div>

          <div className="flex items-center gap-3">
            <Wand2 size={24} className="text-purple-300" />
            <span className="text-xl font-black tracking-tight">REIMAGINE</span>
          </div>
          <p className="text-purple-300 text-sm font-normal">
            Generate SketchUp 3D · {style} · {proposalType === "new_construction" ? "New Build" : "Renovation"}
          </p>
          <div className="flex items-center gap-1 text-purple-400 text-xs mt-1">
            <span>Powered by real Cook County parcel data</span>
            <ChevronRight size={11} />
          </div>
        </button>

        <p className="text-zinc-600 text-xs text-center">
          Generates exterior 3D model, floor plan &amp; interior view — all SketchUp-style architectural renders
        </p>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {beforePanel}
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          {/* NanoBanana loading animation */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-[#0f1629] flex items-center justify-center">
              <Loader2 size={28} className="text-purple-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">NanoBanana is rendering…</p>
            <p className="text-purple-400 text-sm mt-1">
              Fetching Cook County records · Building SketchUp 3D model
            </p>
            <p className="text-zinc-600 text-xs mt-2">~15–25 seconds</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-2">
            {["Parcel data", "3D model", "Materials", "Render"].map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
                <span className="text-[9px] text-zinc-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Result state ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {beforePanel}
      {parcelStrip}

      {/* View mode tabs */}
      <div className="flex gap-1 bg-[#0a0e1a] border border-[#1a3a6e]/30 rounded-xl p-1">
        {VIEW_MODES.map((vm) => (
          <button
            key={vm.id}
            onClick={() => generate(vm.id)}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === vm.id
                ? "bg-purple-700 text-white shadow"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {vm.icon}
            <span className="hidden sm:inline">{vm.label}</span>
            <span className="sm:hidden">{vm.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Generated image */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-700/30 bg-[#0a0e1a]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            {/* NanoBanana brand */}
            <span className="text-yellow-300 font-black text-xs">NanoBanana</span>
            <span className="text-white/30 text-xs">×</span>
            <span className="text-blue-300 text-xs font-semibold">Second Act</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-purple-300 text-xs">
              {VIEW_MODES.find((v) => v.id === viewMode)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result?.isDemo && (
              <span className="text-[9px] text-zinc-600 bg-zinc-800 rounded px-1.5 py-0.5">Demo mode</span>
            )}
            {afterImageSrc && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition-colors bg-purple-900/30 hover:bg-purple-900/50 px-2.5 py-1 rounded-lg"
              >
                <Download size={11} /> Save
              </button>
            )}
          </div>
        </div>

        {/* Render output */}
        {afterImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterImageSrc}
            alt={`NanoBanana ${viewMode} render`}
            className="w-full object-contain max-h-[480px]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Sparkles size={32} className="text-purple-400 mb-3" />
            <p className="text-purple-200 text-sm leading-relaxed font-medium max-w-md">
              {result?.description.replace(/\*\*/g, "").split("\n").slice(0, 3).join(" ")}
            </p>
            {result?.isDemo && (
              <p className="mt-3 text-zinc-600 text-xs">Add GEMINI_API_KEY to enable image generation</p>
            )}
          </div>
        )}
      </div>

      {/* Quick re-render as other views */}
      <div className="grid grid-cols-3 gap-2">
        {VIEW_MODES.filter((v) => v.id !== viewMode).map((vm) => (
          <button
            key={vm.id}
            onClick={() => generate(vm.id)}
            disabled={loading}
            className="flex flex-col items-center gap-1 py-3 rounded-xl border border-purple-900/30 hover:border-purple-600/50 bg-[#0a0e1a] hover:bg-purple-900/20 transition-all text-xs text-zinc-400 hover:text-white font-semibold"
          >
            {vm.icon}
            <span>{vm.label}</span>
            <span className="text-[9px] text-zinc-600 font-normal">{vm.desc}</span>
          </button>
        ))}
        <button
          onClick={() => { setResult(null); setError(""); }}
          className="flex flex-col items-center gap-1 py-3 rounded-xl border border-[#1a3a6e]/30 hover:border-zinc-600/50 bg-[#0a0e1a] transition-all text-xs text-zinc-500 hover:text-zinc-200 font-semibold"
        >
          <RotateCcw size={14} />
          <span>Change Style</span>
          <span className="text-[9px] text-zinc-600 font-normal">Start over</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {/* AI description toggle */}
      {result?.description && (
        <div>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-white transition-colors font-semibold"
          >
            <ChevronDown size={12} className={`transition-transform ${showDescription ? "rotate-180" : ""}`} />
            {showDescription ? "Hide" : "Read"} Architectural Vision Statement
          </button>
          {showDescription && (
            <div className="mt-2 bg-[#0a0e1a] border border-purple-900/30 rounded-2xl p-5 text-sm text-zinc-300 leading-relaxed space-y-2">
              {result.description.split("\n").map((line, i) => {
                if (!line.trim()) return null;
                const isBold = line.startsWith("**") || line.match(/^\*\*.+\*\*$/);
                const cleaned = line.replace(/\*\*/g, "");
                return isBold
                  ? <p key={i} className="text-white font-bold mt-3">{cleaned}</p>
                  : <p key={i}>{cleaned}</p>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-zinc-700 text-[10px] text-center pt-1">
        <span className="text-yellow-400/70 font-bold">NanoBanana</span> × Second Act Chicago ·
        3D renders by Google Gemini 2.0 · Parcel data: Cook County Assessor, City of Chicago, DePaul Chaddick, UChicago
      </p>
    </div>
  );
}

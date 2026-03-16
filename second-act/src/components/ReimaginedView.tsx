"use client";
import { useState } from "react";
import {
  Sparkles, Loader2, ChevronDown, Wand2, RotateCcw,
  Download, Box, Map, Sofa, Info, ChevronRight, Camera,
} from "lucide-react";
import { ChicagoProperty } from "@/types";

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
  { id: "exterior", label: "3D Exterior", icon: <Box size={14} />, desc: "Photo-realistic street view" },
  { id: "floorplan", label: "Floor Plan", icon: <Map size={14} />, desc: "Architectural blueprint" },
  { id: "interior", label: "Interior", icon: <Sofa size={14} />, desc: "3D interior view" },
] as const;

type ViewMode = "exterior" | "floorplan" | "interior";

interface GeneratedResult {
  imageBase64: string | null;
  mimeType: string;
  description: string;
  isDemo: boolean;
  hasStreetView: boolean;
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

// Loading steps shown during generation
const LOADING_STEPS_WITH_PHOTO = [
  "Fetching Street View",
  "Gemini Vision — reading photo",
  "Generating reimagined render",
  "Finalizing",
];

const LOADING_STEPS_TEXT_ONLY = [
  "Cook County parcel lookup",
  "Building description",
  "Generating 3D model",
  "Finalizing",
];

export default function ReimaginedView({ property }: ReimaginedViewProps) {
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">(
    property.propertyType === "vacant_lot" ? "new_construction" : "renovation"
  );
  const [style, setStyle] = useState("Modern");
  const [viewMode, setViewMode] = useState<ViewMode>("exterior");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [streetViewLoaded, setStreetViewLoaded] = useState(false);
  const [streetViewFailed, setStreetViewFailed] = useState(false);

  const photoParams = new URLSearchParams({
    address: `${property.address}, ${property.neighborhood}, Chicago, IL ${property.zip}`,
    lat: String(property.latitude),
    lng: String(property.longitude),
  });
  const streetViewUrl = `/api/photo?${photoParams}&mode=street`;
  const satelliteUrl = `/api/photo?${photoParams}&mode=satellite`;

  async function generate(mode: ViewMode = viewMode) {
    setLoading(true);
    setLoadingStep(0);
    setError("");
    if (mode !== viewMode) setViewMode(mode);

    // Animate through loading steps
    const steps = mode === "exterior" ? LOADING_STEPS_WITH_PHOTO : LOADING_STEPS_TEXT_ONLY;
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, steps.length - 1));
    }, 5000);

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
        hasStreetView: data.hasStreetView ?? false,
        parcelData: data.parcelData ?? null,
      });
      setShowDescription(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      clearInterval(stepInterval);
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

  // ── Before — Street View hero ────────────────────────────────────────────────
  const streetViewHero = (
    <div className="relative rounded-2xl overflow-hidden border border-[#1a3a6e]/40 bg-[#0a0e1a] mb-4">
      {/* Full-width Street View */}
      <div className="relative aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={streetViewUrl}
          alt={`Street View of ${property.address}`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${streetViewLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setStreetViewLoaded(true)}
          onError={() => setStreetViewFailed(true)}
        />
        {!streetViewLoaded && !streetViewFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#41B6E6]" />
              <span className="text-zinc-500 text-xs">Loading Street View…</span>
            </div>
          </div>
        )}
        {streetViewFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <Camera size={24} className="text-zinc-600" />
              <span className="text-zinc-500 text-xs">No Street View imagery for this location</span>
            </div>
          </div>
        )}

        {/* BEFORE label */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-wider">
            BEFORE
          </span>
          {streetViewLoaded && (
            <span className="bg-black/60 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
              <Camera size={10} /> Google Street View
            </span>
          )}
        </div>

        {/* Address overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
          <p className="text-white font-bold text-sm">{property.address}</p>
          <p className="text-zinc-400 text-xs">{property.neighborhood}, Chicago, IL {property.zip}</p>
        </div>
      </div>

      {/* Satellite strip + Gemini notice */}
      <div className="grid grid-cols-3 border-t border-[#1a3a6e]/30">
        {/* Satellite thumb */}
        <div className="relative col-span-1 border-r border-[#1a3a6e]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={satelliteUrl}
            alt="Satellite view"
            className="w-full h-20 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute bottom-1 left-1 bg-black/70 rounded px-1.5 py-0.5 text-[9px] text-zinc-300">
            🛰 Aerial
          </div>
        </div>

        {/* Gemini vision notice */}
        <div className="col-span-2 flex items-center gap-3 px-3 py-2 bg-[#0a0e1a]">
          <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-700/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">
              Gemini Vision reads this photo
            </p>
            <p className="text-zinc-500 text-[10px] leading-tight mt-0.5">
              The real Street View image is sent to Gemini 2.0 to generate your reimagined render
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Parcel data strip ──────────────────────────────────────────────────────
  const parcelStrip = pd && (pd.yearBuilt || pd.sqft || pd.bedrooms || pd.stories) ? (
    <div className="mb-4 bg-[#0a0e1a] border border-[#1a3a6e]/30 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Info size={11} className="text-[#41B6E6]" />
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
      </div>
    </div>
  ) : null;

  // ── Pre-generation state ────────────────────────────────────────────────────
  if (!result && !loading) {
    return (
      <div className="space-y-4">
        {streetViewHero}

        <div className="space-y-3">
          {/* Proposal toggle */}
          <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1 w-fit">
            {(["renovation", "new_construction"] as const).map((pt) => (
              <button
                key={pt}
                onClick={() => setProposalType(pt)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  proposalType === pt
                    ? "text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
                style={proposalType === pt ? { background: "#003087" } : {}}
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

        {/* REIMAGINE button */}
        <button
          onClick={() => generate("exterior")}
          className="w-full group relative overflow-hidden flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 hover:from-purple-800 hover:via-indigo-800 hover:to-purple-700 border border-purple-600/40 hover:border-purple-400/60 text-white font-bold py-7 rounded-2xl transition-all shadow-2xl shadow-purple-900/40"
        >
          {/* Shimmer */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-1">
            <Camera size={11} className="text-blue-300" />
            <span className="text-blue-300 text-xs font-semibold">Real Street View</span>
            <span className="text-white/50 text-xs">→</span>
            <span className="text-yellow-300 text-xs font-black">Gemini Vision</span>
          </div>

          <div className="flex items-center gap-3">
            <Wand2 size={24} className="text-purple-300" />
            <span className="text-xl font-black tracking-tight">REIMAGINE THIS SPACE</span>
          </div>
          <p className="text-purple-300 text-sm font-normal">
            {style} · {proposalType === "new_construction" ? "New Build" : "Renovation"}
          </p>
          <div className="flex items-center gap-1 text-purple-400 text-xs mt-1">
            <span>Street View photo sent to Gemini 2.0 for photo-realistic transformation</span>
            <ChevronRight size={11} />
          </div>
        </button>

        <p className="text-zinc-600 text-xs text-center">
          Gemini Vision analyzes the real Google Maps photo · Exterior · Floor Plan · Interior
        </p>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    const steps = viewMode === "exterior" ? LOADING_STEPS_WITH_PHOTO : LOADING_STEPS_TEXT_ONLY;
    return (
      <div className="space-y-4">
        {streetViewHero}

        <div className="flex flex-col items-center justify-center py-10 space-y-5">
          {/* Animated icon */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-[#0f1629] flex items-center justify-center">
              <Loader2 size={28} className="text-purple-400 animate-spin" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {viewMode === "exterior"
                ? "Gemini is analyzing your property…"
                : "NanoBanana is rendering…"}
            </p>
            <p className="text-purple-400 text-sm mt-1">
              {steps[loadingStep]}
            </p>
            <p className="text-zinc-600 text-xs mt-1">~15–30 seconds</p>
          </div>

          {/* Step indicators */}
          <div className="flex gap-3 items-end">
            {steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= loadingStep
                      ? "bg-purple-400 animate-bounce"
                      : "bg-[#1a3a6e]"
                  }`}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
                <span className={`text-[9px] text-center max-w-[60px] leading-tight transition-colors ${i === loadingStep ? "text-purple-400" : "text-zinc-700"}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {viewMode === "exterior" && (
            <div className="flex items-center gap-2 bg-purple-900/20 border border-purple-800/30 rounded-xl px-4 py-2.5 text-xs">
              <Camera size={12} className="text-purple-400" />
              <span className="text-purple-300">
                The real Street View photo is being analyzed by Gemini Vision
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Result state ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {streetViewHero}
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

      {/* Result image — AFTER */}
      <div className="relative rounded-2xl overflow-hidden border border-purple-700/30 bg-[#0a0e1a]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300 font-black text-xs">NanoBanana</span>
            <span className="text-white/30 text-xs">×</span>
            <span className="text-blue-300 text-xs font-semibold">Gemini 2.0</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-purple-300 text-xs font-medium">AFTER</span>
            {result?.hasStreetView && viewMode === "exterior" && (
              <>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <Camera size={9} /> from real photo
                </span>
              </>
            )}
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

        {afterImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterImageSrc}
            alt={`NanoBanana ${viewMode} render`}
            className="w-full object-contain max-h-[520px]"
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
                const isBold = line.startsWith("**") || !!line.match(/^\*\*.+\*\*$/);
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
        Real Google Maps Street View → Gemini 2.0 Vision · Cook County Assessor · City of Chicago
      </p>
    </div>
  );
}

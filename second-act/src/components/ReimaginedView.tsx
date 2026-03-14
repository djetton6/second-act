"use client";
import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, Eye, Wand2, RotateCcw, Download } from "lucide-react";
import { ChicagoProperty } from "@/types";
import { getStreetViewUrl, getSatelliteUrl } from "@/lib/streetview";

interface ReimaginedViewProps {
  property: ChicagoProperty;
}

const STYLES = [
  { value: "Modern", label: "Modern" },
  { value: "Greystone", label: "Greystone" },
  { value: "Prairie", label: "Prairie Style" },
  { value: "Industrial", label: "Industrial Chic" },
  { value: "Craftsman", label: "Craftsman" },
];

export default function ReimaginedView({ property }: ReimaginedViewProps) {
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">(
    property.propertyType === "vacant_lot" ? "new_construction" : "renovation"
  );
  const [style, setStyle] = useState("Modern");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imageBase64: string | null;
    mimeType: string;
    description: string;
    isDemo: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [beforeImgError, setBeforeImgError] = useState(false);
  const [useSatellite, setUseSatellite] = useState(false);

  const streetViewUrl = getStreetViewUrl(property.latitude, property.longitude, 800, 500);
  const satelliteUrl = getSatelliteUrl(property.latitude, property.longitude, 800, 500);
  const beforeSrc = useSatellite ? satelliteUrl : streetViewUrl;

  function handleBeforeImgError() {
    if (!useSatellite) setUseSatellite(true);
    else setBeforeImgError(true);
  }

  async function handleRemodel() {
    setLoading(true);
    setError("");
    setResult(null);
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
          streetViewUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      setResult({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType ?? "image/png",
        description: data.description,
        isDemo: data.isDemo,
      });
      setShowDescription(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate remodel");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result?.imageBase64) return;
    const link = document.createElement("a");
    link.href = `data:${result.mimeType};base64,${result.imageBase64}`;
    link.download = `remodel-${property.address.replace(/\s+/g, "-")}.png`;
    link.click();
  }

  const afterImageSrc = result?.imageBase64
    ? `data:${result.mimeType};base64,${result.imageBase64}`
    : null;

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Proposal type */}
        <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1">
          <button
            onClick={() => setProposalType("renovation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              proposalType === "renovation" ? "bg-[#003087] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Renovation
          </button>
          <button
            onClick={() => setProposalType("new_construction")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              proposalType === "new_construction" ? "bg-[#003087] text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            New Build
          </button>
        </div>

        {/* Style picker */}
        <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl px-3 py-1.5">
          <span className="text-xs text-zinc-500">Style:</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0f1629]">{s.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="text-zinc-500" />
        </div>

        {/* Reset */}
        {result && (
          <button
            onClick={() => { setResult(null); setError(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e1a] border border-[#1a3a6e]/40 hover:border-zinc-500/60 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-all"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* ── BEFORE / AFTER panels ── */}
      <div className={`grid gap-1 rounded-2xl overflow-hidden border border-[#1a3a6e]/40 ${result ? "grid-cols-2" : "grid-cols-1"}`}>

        {/* BEFORE — real Street View */}
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
            <Eye size={11} className="text-zinc-300" />
            <span className="text-white text-xs font-semibold">Current State</span>
            <span className="text-zinc-400 text-[10px]">
              {useSatellite ? "· Satellite" : "· Street View"}
            </span>
          </div>

          {!beforeImgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={beforeSrc}
              alt={`${property.address} — current state`}
              className={`w-full object-cover ${result ? "h-72" : "h-80"}`}
              onError={handleBeforeImgError}
            />
          ) : (
            <div className={`w-full bg-[#0a0e1a] flex items-center justify-center ${result ? "h-72" : "h-80"}`}>
              <p className="text-zinc-600 text-sm text-center px-6">
                Street View not available for this location
              </p>
            </div>
          )}

          {/* Data source badge */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {[
              { initials: "CHI", bg: "#003087", title: "City of Chicago" },
              { initials: "DPU", bg: "#1c4DA1", title: "DePaul Chaddick" },
              { initials: "UChi", bg: "#800000", title: "UChicago" },
            ].map((s) => (
              <span
                key={s.initials}
                title={s.title}
                className="inline-flex items-center justify-center rounded-md text-white font-bold px-1.5 py-0.5 text-[9px] leading-none shadow"
                style={{ backgroundColor: s.bg }}
              >
                {s.initials}
              </span>
            ))}
          </div>
        </div>

        {/* AFTER — AI generated */}
        {result && (
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-purple-900/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-500/30">
              <Sparkles size={11} className="text-purple-300" />
              <span className="text-purple-200 text-xs font-semibold">AI Remodel</span>
              <span className="text-purple-400 text-[10px]">· {style}</span>
            </div>

            {afterImageSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={afterImageSrc}
                  alt="AI remodeled vision"
                  className="w-full h-72 object-cover"
                />
                <button
                  onClick={handleDownload}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
                >
                  <Download size={11} /> Save
                </button>
              </>
            ) : (
              /* No image generated — show text description as visual card */
              <div className="w-full h-72 bg-gradient-to-br from-purple-950 to-indigo-950 flex flex-col items-center justify-center p-5">
                <Sparkles size={24} className="text-purple-400 mb-3" />
                <p className="text-purple-200 text-xs text-center leading-relaxed line-clamp-6">
                  {result.description.replace(/\*\*/g, "").split("\n")[0]}
                </p>
                {result.isDemo && (
                  <span className="mt-3 text-purple-500 text-[10px]">Add GEMINI_API_KEY for image generation</span>
                )}
              </div>
            )}

            {/* NanoBanana + Gemini badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <span className="text-[10px] text-purple-300 font-medium">✦ NanoBanana × Gemini</span>
            </div>
          </div>
        )}
      </div>

      {/* ── REMODEL BUTTON — prominent CTA ── */}
      {!result && (
        <button
          onClick={handleRemodel}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 hover:from-purple-600 hover:via-indigo-500 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/40 text-base"
          style={{ backgroundSize: "200% auto", animation: loading ? "none" : undefined }}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating AI Remodel…</span>
              <span className="text-purple-300 text-sm font-normal">this takes ~15 seconds</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Remodel with AI</span>
              <span className="text-purple-300 text-sm font-normal">· {style} · {proposalType === "new_construction" ? "New Build" : "Renovation"}</span>
            </>
          )}
        </button>
      )}

      {/* Re-generate after seeing result */}
      {result && (
        <button
          onClick={handleRemodel}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-purple-700/50 hover:border-purple-500/70 text-purple-300 hover:text-white font-semibold py-3 rounded-2xl transition-all text-sm"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {loading ? "Regenerating…" : "Generate Another Version"}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* AI description toggle */}
      {result?.description && (
        <div>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center gap-2 text-xs text-purple-400 hover:text-white transition-colors font-semibold mb-2"
          >
            <Sparkles size={11} />
            {showDescription ? "Hide" : "Show"} AI Architectural Description
          </button>
          {showDescription && (
            <div className="bg-[#0a0e1a] border border-purple-900/30 rounded-2xl p-5 text-sm text-zinc-300 leading-relaxed space-y-1">
              {result.description.split("\n").map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                const cleaned = line.replace(/\*\*/g, "");
                if (line.startsWith("**") || line.match(/^\*\*.+\*\*$/))
                  return <p key={i} className="text-white font-bold mt-2">{cleaned}</p>;
                return <p key={i}>{line.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Attribution footer */}
      <p className="text-zinc-600 text-xs text-center">
        Powered by <span className="text-purple-400">NanoBanana</span> × <span className="text-blue-400">Google Gemini 2.0</span> ·
        Street View data © Google Maps ·
        Property data: City of Chicago, DePaul Chaddick Institute, UChicago
      </p>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, Eye, ImageIcon } from "lucide-react";
import { ChicagoProperty } from "@/types";

interface ReimaginedViewProps {
  property: ChicagoProperty;
}

const BEFORE_IMAGES: Record<string, string[]> = {
  abandoned_building: [
    "https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  ],
  vacant_lot: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&q=80",
  ],
};

const AFTER_IMAGES: Record<string, string[]> = {
  new_construction: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80",
  ],
  renovation: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80",
    "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&q=80",
  ],
};

const STYLES = ["Modern", "Greystone", "Prairie", "Industrial", "Craftsman"];

function getImageForProperty(
  images: string[],
  id: string
): string {
  const seed = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return images[seed % images.length];
}

export default function ReimaginedView({ property }: ReimaginedViewProps) {
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">("renovation");
  const [style, setStyle] = useState("Modern");
  const [view, setView] = useState<"before" | "after" | "split">("split");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const beforeImg = getImageForProperty(BEFORE_IMAGES[property.propertyType], property.id);
  const afterImg = getImageForProperty(AFTER_IMAGES[proposalType], property.id);

  async function handleReimagine() {
    setLoading(true);
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDescription(data.description);
        setIsDemo(data.isDemo);
        setView("after");
        setShowDescription(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatDescription(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <h4 key={i} className="text-white font-bold mt-3 mb-1">{line.replace(/\*\*/g, "")}</h4>;
      }
      if (line.match(/^\*\*.+\*\*/)) {
        const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        return <p key={i} className="text-zinc-300 text-sm leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      if (line.startsWith("*") && line.endsWith("*")) {
        return <p key={i} className="text-zinc-400 text-xs italic mt-2">{line.replace(/\*/g, "")}</p>;
      }
      return line ? <p key={i} className="text-zinc-300 text-sm leading-relaxed">{line}</p> : <br key={i} />;
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
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

        {/* Style selector */}
        <div className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl px-3 py-1.5">
          <span className="text-xs text-zinc-500">Style:</span>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
          >
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-[#0f1629]">{s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="text-zinc-500" />
        </div>

        {/* View toggle */}
        <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1">
          {(["before", "split", "after"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                view === v ? "bg-[#1a3a6e] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Reimagine button */}
        <button
          onClick={handleReimagine}
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-900/30"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {loading ? "Reimagining..." : "AI Reimagine"}
        </button>
      </div>

      {/* Image view */}
      <div className="rounded-2xl overflow-hidden border border-[#1a3a6e]/40">
        {view === "split" ? (
          <div className="grid grid-cols-2 gap-0.5 bg-[#1a3a6e]/20">
            {/* Before */}
            <div className="relative">
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Eye size={10} /> Current State
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeImg} alt="Before" className="w-full h-64 object-cover" />
            </div>
            {/* After */}
            <div className="relative">
              <div className="absolute top-3 left-3 z-10 bg-purple-900/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-500/30">
                <span className="text-purple-200 text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles size={10} /> AI Vision
                </span>
              </div>
              {description ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={afterImg} alt="After - AI Reimagined" className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-[#0a0e1a] to-[#0f1629] flex flex-col items-center justify-center">
                  <Sparkles size={32} className="text-purple-500 mb-3 opacity-50" />
                  <p className="text-zinc-500 text-sm text-center px-4">
                    Click <strong className="text-purple-400">AI Reimagine</strong> to see the transformation
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : view === "before" ? (
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                <Eye size={10} /> Current State
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={beforeImg} alt="Before" className="w-full h-80 object-cover" />
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 bg-purple-900/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-purple-500/30">
              <span className="text-purple-200 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles size={10} /> AI Vision — {style} {proposalType === "new_construction" ? "New Build" : "Renovation"}
              </span>
            </div>
            {description ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={afterImg} alt="After" className="w-full h-80 object-cover" />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-[#0a0e1a] to-[#0f1629] flex flex-col items-center justify-center">
                <ImageIcon size={48} className="text-[#1a3a6e] mb-4" />
                <p className="text-zinc-500 text-sm text-center px-6">Click <strong className="text-purple-400">AI Reimagine</strong> to generate a vision</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NanoBanana attribution */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles size={11} className="text-purple-400" />
          <span>Powered by <span className="text-purple-400 font-semibold">NanoBanana</span> × <span className="text-blue-400 font-semibold">Google Gemini</span></span>
          {isDemo && <span className="text-zinc-600">(Demo Mode — Add GEMINI_API_KEY for full AI)</span>}
        </div>
        {description && (
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-xs text-[#4a90d9] hover:text-white transition-colors font-semibold"
          >
            {showDescription ? "Hide" : "Show"} AI Description
          </button>
        )}
      </div>

      {/* AI Description */}
      {description && showDescription && (
        <div className="bg-[#0a0e1a] border border-purple-900/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-purple-400" />
            <span className="text-purple-300 font-semibold text-sm">AI Architectural Vision</span>
          </div>
          <div className="space-y-1">
            {formatDescription(description)}
          </div>
        </div>
      )}
    </div>
  );
}

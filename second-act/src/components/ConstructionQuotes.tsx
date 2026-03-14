"use client";
import { useState } from "react";
import {
  HardHat, Star, Phone, Globe, Clock, DollarSign,
  Zap, Mail, MapPin, BadgeCheck, Pencil, Wrench
} from "lucide-react";
import { CONSTRUCTION_QUOTES_DATA, CHICAGO_ARCHITECTS, CHICAGO_GENERAL_CONTRACTORS } from "@/lib/lenders";
import type { Architect } from "@/lib/lenders";

interface ConstructionQuotesProps {
  propertyType: "vacant_lot" | "abandoned_building";
  estimatedValue: number;
}

type Tab = "estimates" | "architects" | "contractors";

export default function ConstructionQuotes({ propertyType, estimatedValue }: ConstructionQuotesProps) {
  const [tab, setTab] = useState<Tab>("estimates");
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">(
    propertyType === "vacant_lot" ? "new_construction" : "renovation"
  );
  const [expandedPro, setExpandedPro] = useState<string | null>(null);

  const quotes = CONSTRUCTION_QUOTES_DATA[proposalType];
  const totalEstimate = (base: number) =>
    Math.round((base * (estimatedValue / 150000)) / 1000) * 1000;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "estimates", label: "Cost Estimates", icon: <DollarSign size={13} /> },
    { id: "architects", label: "Architects", icon: <Pencil size={13} /> },
    { id: "contractors", label: "General Contractors", icon: <Wrench size={13} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-[#0a0e1a] border border-[#1a3a6e]/40 rounded-xl p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? "bg-[#003087] text-white shadow" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ── COST ESTIMATES TAB ── */}
      {tab === "estimates" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-sm font-medium">Type:</span>
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
          </div>

          <div className="space-y-3">
            {quotes.map((quote, i) => (
              <div
                key={quote.contractor}
                className={`bg-[#0a0e1a] rounded-2xl border transition-all ${
                  i === 0 ? "border-[#1a6eb5]/50 ring-1 ring-[#1a6eb5]/20" : "border-[#1a3a6e]/40"
                }`}
              >
                {i === 0 && (
                  <div className="bg-gradient-to-r from-[#003087] to-[#1a6eb5] text-white text-xs font-bold px-4 py-1.5 rounded-t-2xl">
                    ★ RECOMMENDED
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold">{quote.contractor}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={11}
                            className={j < Math.floor(quote.rating) ? "text-amber-400" : "text-zinc-600"}
                            fill={j < Math.floor(quote.rating) ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="text-zinc-400 text-xs ml-1">{quote.rating}/5</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-xl">${totalEstimate(quote.estimatedCost).toLocaleString()}</p>
                      <p className="text-zinc-500 text-xs">estimated total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <Clock size={12} className="text-[#4a90d9]" />
                      {quote.timeline}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <DollarSign size={12} className="text-emerald-400" />
                      ${Math.round(totalEstimate(quote.estimatedCost) / 12).toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {quote.specialties.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-[#1a3a6e]/30 border border-[#1a3a6e]/50 rounded-full text-zinc-300 text-xs">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a href={`tel:${quote.phone}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                      <Phone size={12} className="text-[#4a90d9]" /> {quote.phone}
                    </a>
                    <a href={`https://${quote.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#4a90d9] hover:text-white transition-colors">
                      <Globe size={12} /> {quote.website}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 text-xs">
            Estimates based on comparable Chicago projects. All contractors licensed & insured in Illinois.
          </p>
        </div>
      )}

      {/* ── ARCHITECTS TAB ── */}
      {tab === "architects" && (
        <ProDirectory
          professionals={CHICAGO_ARCHITECTS}
          expanded={expandedPro}
          onExpand={setExpandedPro}
          accentColor="purple"
        />
      )}

      {/* ── GENERAL CONTRACTORS TAB ── */}
      {tab === "contractors" && (
        <ProDirectory
          professionals={CHICAGO_GENERAL_CONTRACTORS}
          expanded={expandedPro}
          onExpand={setExpandedPro}
          accentColor="blue"
        />
      )}
    </div>
  );
}

function ProDirectory({
  professionals,
  expanded,
  onExpand,
  accentColor,
}: {
  professionals: Architect[];
  expanded: string | null;
  onExpand: (name: string | null) => void;
  accentColor: "blue" | "purple";
}) {
  const accent = accentColor === "purple"
    ? { ring: "ring-purple-500/20 border-purple-500/40", badge: "bg-purple-900/30 text-purple-300 border-purple-700/30", dot: "bg-purple-500" }
    : { ring: "ring-[#1a6eb5]/20 border-[#1a6eb5]/40", badge: "bg-[#003087]/30 text-[#4a90d9] border-[#1a6eb5]/30", dot: "bg-[#4a90d9]" };

  return (
    <div className="space-y-3">
      {/* Fast sign-off legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-1">
        <div className="flex items-center gap-1.5">
          <Zap size={11} className="text-amber-400" />
          <span className="text-amber-400 font-semibold">Fast Sign-Off</span>
          <span>= permits/reviews within 7 business days</span>
        </div>
      </div>

      {professionals.map((pro) => {
        const isExpanded = expanded === pro.name;
        return (
          <div
            key={pro.name}
            className={`bg-[#0a0e1a] rounded-2xl border transition-all ${
              pro.fastSignoff ? `${accent.ring} ring-1` : "border-[#1a3a6e]/40"
            }`}
          >
            {/* Fast Sign-Off banner */}
            {pro.fastSignoff && (
              <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 rounded-t-2xl px-4 py-1.5">
                <Zap size={11} className="text-amber-400" fill="currentColor" />
                <span className="text-amber-400 text-xs font-bold">FAST SIGN-OFF — {pro.turnaround}</span>
              </div>
            )}

            <button
              className="w-full flex items-start justify-between p-4 text-left gap-3"
              onClick={() => onExpand(isExpanded ? null : pro.name)}
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  pro.role === "architect" || pro.role === "architect_gc"
                    ? "bg-purple-900/40"
                    : "bg-[#003087]/40"
                }`}>
                  {pro.role === "architect" || pro.role === "architect_gc"
                    ? <Pencil size={15} className="text-purple-400" />
                    : <HardHat size={15} className="text-[#4a90d9]" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{pro.name}</span>
                    {pro.role === "architect_gc" && (
                      <span className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-700/30 rounded-full text-[10px] font-bold">
                        Architect + GC
                      </span>
                    )}
                    <span title="Licensed & Verified"><BadgeCheck size={13} className="text-[#4a90d9]" /></span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-0.5">{pro.firm}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10}
                        className={j < Math.floor(pro.rating) ? "text-amber-400" : "text-zinc-600"}
                        fill={j < Math.floor(pro.rating) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="text-zinc-500 text-xs ml-1">{pro.rating}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-zinc-400 text-xs">{pro.role === "general_contractor" ? "GC" : "Architect"}</p>
                <p className="text-white font-semibold text-xs mt-0.5">
                  ${(pro.minProject / 1000).toFixed(0)}K–${(pro.maxProject / 1000000).toFixed(1)}M
                </p>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#1a3a6e]/30 pt-4">
                <p className="text-zinc-400 text-sm leading-relaxed">{pro.description}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {pro.specialty.map((s) => (
                    <span key={s} className={`px-2 py-0.5 border rounded-full text-xs font-medium ${accent.badge}`}>{s}</span>
                  ))}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0f1629] rounded-xl p-2.5">
                    <p className="text-zinc-600 text-xs mb-0.5">License</p>
                    <p className="text-zinc-300 text-xs font-mono">{pro.license}</p>
                  </div>
                  {pro.aiaNumber && (
                    <div className="bg-[#0f1629] rounded-xl p-2.5">
                      <p className="text-zinc-600 text-xs mb-0.5">AIA Member</p>
                      <p className="text-zinc-300 text-xs font-mono">{pro.aiaNumber}</p>
                    </div>
                  )}
                  <div className="bg-[#0f1629] rounded-xl p-2.5">
                    <p className="text-zinc-600 text-xs mb-0.5">Sign-Off Time</p>
                    <p className={`text-xs font-semibold ${pro.fastSignoff ? "text-amber-400" : "text-zinc-300"}`}>
                      {pro.turnaround}
                    </p>
                  </div>
                  <div className="bg-[#0f1629] rounded-xl p-2.5">
                    <p className="text-zinc-600 text-xs mb-0.5">Project Range</p>
                    <p className="text-zinc-300 text-xs">${(pro.minProject / 1000).toFixed(0)}K – ${(pro.maxProject / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                {/* Neighborhoods */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={11} className="text-[#4a90d9]" />
                    <span className="text-zinc-500 text-xs font-semibold">Serves</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pro.neighborhoods.map((n) => (
                      <span key={n} className="px-2 py-0.5 bg-[#1a3a6e]/20 border border-[#1a3a6e]/40 rounded-full text-zinc-400 text-xs">{n}</span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="flex flex-wrap gap-4">
                  <a href={`tel:${pro.phone}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                    <Phone size={12} className="text-[#4a90d9]" /> {pro.phone}
                  </a>
                  <a href={`mailto:${pro.email}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                    <Mail size={12} className="text-purple-400" /> {pro.email}
                  </a>
                  <a href={`https://${pro.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#4a90d9] hover:text-white transition-colors">
                    <Globe size={12} /> {pro.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-zinc-600 text-xs pt-1">
        All professionals are licensed in Illinois. License numbers verified with IDFPR.
        Fast sign-off designation indicates established DPD relationships and Green Permit Program enrollment.
      </p>
    </div>
  );
}

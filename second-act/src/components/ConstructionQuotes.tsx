"use client";
import { useState } from "react";
import { HardHat, Star, Phone, Globe, Clock, DollarSign, ChevronDown } from "lucide-react";
import { CONSTRUCTION_QUOTES_DATA } from "@/lib/lenders";

interface ConstructionQuotesProps {
  propertyType: "vacant_lot" | "abandoned_building";
  estimatedValue: number;
}

export default function ConstructionQuotes({ propertyType, estimatedValue }: ConstructionQuotesProps) {
  const [proposalType, setProposalType] = useState<"renovation" | "new_construction">(
    propertyType === "vacant_lot" ? "new_construction" : "renovation"
  );

  const quotes = CONSTRUCTION_QUOTES_DATA[proposalType];

  const totalEstimate = (base: number) =>
    Math.round((base * (estimatedValue / 150000)) / 1000) * 1000;

  return (
    <div className="space-y-4">
      {/* Type toggle */}
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 text-sm font-medium">Quote Type:</span>
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
            New Construction
          </button>
        </div>
      </div>

      {/* Quote cards */}
      <div className="space-y-3">
        {quotes.map((quote, i) => (
          <div
            key={quote.contractor}
            className={`bg-[#0a0e1a] rounded-2xl border transition-all ${
              i === 0
                ? "border-[#1a6eb5]/50 ring-1 ring-[#1a6eb5]/20"
                : "border-[#1a3a6e]/40 hover:border-[#1a3a6e]/60"
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
                      <Star
                        key={j}
                        size={11}
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

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Clock size={12} className="text-[#4a90d9]" />
                  {quote.timeline}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <DollarSign size={12} className="text-emerald-400" />
                  ${Math.round(totalEstimate(quote.estimatedCost) / 12).toLocaleString()}/month
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quote.specialties.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#1a3a6e]/30 border border-[#1a3a6e]/50 rounded-full text-zinc-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>

              {/* Contact */}
              <div className="flex gap-3">
                <a
                  href={`tel:${quote.phone}`}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <Phone size={12} className="text-[#4a90d9]" />
                  {quote.phone}
                </a>
                <a
                  href={`https://${quote.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#4a90d9] hover:text-white transition-colors"
                >
                  <Globe size={12} />
                  {quote.website}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-zinc-600 text-xs">
        Estimates are based on comparable Chicago projects. Request a site visit for accurate quotes.
        All contractors are licensed and insured in Illinois.
      </p>
    </div>
  );
}

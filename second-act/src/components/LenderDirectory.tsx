"use client";
import { useState } from "react";
import { Landmark, Phone, Globe, DollarSign, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { CHICAGO_LENDERS } from "@/lib/lenders";

interface LenderDirectoryProps {
  minAmount?: number;
}

export default function LenderDirectory({ minAmount = 0 }: LenderDirectoryProps) {
  const [expanded, setExpanded] = useState<string | null>(CHICAGO_LENDERS[0].name);
  const [filterType, setFilterType] = useState<string>("all");

  const types = [
    { value: "all", label: "All" },
    { value: "bank", label: "Banks" },
    { value: "credit_union", label: "Credit Unions" },
    { value: "community_development", label: "CDFIs" },
  ];

  const filtered = CHICAGO_LENDERS.filter((l) =>
    filterType === "all" || l.type === filterType
  );

  const typeBadgeColor: Record<string, string> = {
    bank: "bg-blue-900/30 text-blue-300 border-blue-700/30",
    credit_union: "bg-emerald-900/30 text-emerald-300 border-emerald-700/30",
    community_development: "bg-purple-900/30 text-purple-300 border-purple-700/30",
  };

  const typeLabel: Record<string, string> = {
    bank: "Bank",
    credit_union: "Credit Union",
    community_development: "CDFI",
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-zinc-400 text-sm">Filter:</span>
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilterType(t.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterType === t.value
                ? "bg-[#003087] text-white border border-[#1a6eb5]/50"
                : "bg-[#0a0e1a] text-zinc-400 border border-[#1a3a6e]/40 hover:text-white hover:border-[#1a3a6e]/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lender cards */}
      <div className="space-y-3">
        {filtered.map((lender) => (
          <div
            key={lender.name}
            className="bg-[#0a0e1a] border border-[#1a3a6e]/40 hover:border-[#1a3a6e]/60 rounded-2xl overflow-hidden transition-all"
          >
            {/* Header row */}
            <button
              className="w-full flex items-center justify-between p-4 text-left"
              onClick={() => setExpanded(expanded === lender.name ? null : lender.name)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a3a6e]/30 rounded-xl flex items-center justify-center">
                  <Landmark size={18} className="text-[#4a90d9]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold text-sm">{lender.name}</h4>
                    {lender.chicagoFocused && (
                      <span className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/20 px-1.5 py-0.5 rounded-full">
                        Chi-Focused
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${typeBadgeColor[lender.type]}`}>
                      {typeLabel[lender.type]}
                    </span>
                    <span className="text-zinc-500 text-xs">{lender.interestRange} APR</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-white font-bold text-sm">${(lender.maxLoan / 1000).toFixed(0)}K</p>
                  <p className="text-zinc-500 text-xs">max loan</p>
                </div>
                {expanded === lender.name ? (
                  <ChevronUp size={16} className="text-zinc-400" />
                ) : (
                  <ChevronDown size={16} className="text-zinc-400" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {expanded === lender.name && (
              <div className="px-4 pb-4 space-y-4 border-t border-[#1a3a6e]/30 pt-4">
                <p className="text-zinc-400 text-sm">{lender.description}</p>

                {/* Loan range */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0f1629] rounded-xl p-3 text-center">
                    <p className="text-zinc-500 text-xs">Min Loan</p>
                    <p className="text-white font-bold">${(lender.minLoan / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-[#0f1629] rounded-xl p-3 text-center">
                    <p className="text-zinc-500 text-xs">Max Loan</p>
                    <p className="text-[#4a90d9] font-bold">${(lender.maxLoan / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-[#0f1629] rounded-xl p-3 text-center">
                    <p className="text-zinc-500 text-xs">Interest</p>
                    <p className="text-emerald-400 font-bold text-xs">{lender.interestRange}</p>
                  </div>
                </div>

                {/* Programs */}
                <div>
                  <p className="text-zinc-400 text-xs font-semibold mb-2">Available Programs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lender.programs.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-[#1a3a6e]/20 border border-[#1a3a6e]/40 rounded-full text-zinc-300 text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-4">
                  <a
                    href={`tel:${lender.phone}`}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <Phone size={12} className="text-[#4a90d9]" />
                    {lender.phone}
                  </a>
                  <a
                    href={`https://${lender.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#4a90d9] hover:text-white transition-colors"
                  >
                    <ExternalLink size={12} />
                    {lender.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs">
        Lending information is for reference only. Contact lenders directly for current rates and qualifications.
        Down payment assistance may be available through Chicago&apos;s TaxSmart Mortgage Credit Certificate program.
      </p>
    </div>
  );
}

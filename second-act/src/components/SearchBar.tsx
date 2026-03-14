"use client";
import { Search, MapPin, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CHICAGO_NEIGHBORHOODS } from "@/lib/chicago-data";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
  onTypeChange: (type: string) => void;
  selectedNeighborhood: string;
  selectedType: string;
  resultCount?: number;
}

const QUICK_FILTERS = [
  { label: "All Properties", value: "" },
  { label: "Vacant Lots", value: "vacant_lot" },
  { label: "Abandoned Buildings", value: "abandoned_building" },
];

export default function SearchBar({
  onSearch,
  onNeighborhoodChange,
  onTypeChange,
  selectedNeighborhood,
  selectedType,
  resultCount,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNeighborhoods(false);
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  function clearSearch() {
    setQuery("");
    onSearch("");
  }

  return (
    <div ref={dropdownRef} className="w-full max-w-4xl mx-auto">
      {/* Main search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-[#0f1629] border border-[#1a3a6e]/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden hover:border-[#1a6eb5]/70 transition-colors">
          {/* Search icon */}
          <div className="flex items-center pl-5 pr-3">
            <Search size={20} className="text-[#4a90d9]" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter address, ZIP code, or neighborhood..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-base py-4 pr-4 focus:outline-none"
          />

          {/* Clear button */}
          {query && (
            <button type="button" onClick={clearSearch} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-[#1a3a6e]/50 mx-1" />

          {/* Neighborhood selector */}
          <button
            type="button"
            onClick={() => { setShowNeighborhoods(!showNeighborhoods); setShowFilters(false); }}
            className="flex items-center gap-2 px-4 py-4 text-sm text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
          >
            <MapPin size={14} className="text-[#4a90d9]" />
            <span className="hidden sm:block">{selectedNeighborhood || "Neighborhood"}</span>
            <ChevronDown size={13} className={`transition-transform ${showNeighborhoods ? "rotate-180" : ""}`} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#1a3a6e]/50 mx-1" />

          {/* Filter button */}
          <button
            type="button"
            onClick={() => { setShowFilters(!showFilters); setShowNeighborhoods(false); }}
            className="flex items-center gap-2 px-4 py-4 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <SlidersHorizontal size={14} className="text-[#4a90d9]" />
            <span className="hidden sm:block">Filter</span>
          </button>

          {/* Search button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white font-semibold px-6 py-4 transition-all text-sm"
          >
            Search
          </button>
        </div>

        {/* Neighborhood dropdown */}
        {showNeighborhoods && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1629] border border-[#1a3a6e]/50 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto">
            <div className="p-2">
              <button
                type="button"
                onClick={() => { onNeighborhoodChange(""); setShowNeighborhoods(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  !selectedNeighborhood ? "bg-[#1a3a6e]/50 text-white" : "text-zinc-300 hover:bg-[#1a3a6e]/30 hover:text-white"
                }`}
              >
                All Chicago Neighborhoods
              </button>
              {CHICAGO_NEIGHBORHOODS.map((nh) => (
                <button
                  key={nh.name}
                  type="button"
                  onClick={() => { onNeighborhoodChange(nh.name); setShowNeighborhoods(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                    selectedNeighborhood === nh.name
                      ? "bg-[#1a3a6e]/50 text-white"
                      : "text-zinc-300 hover:bg-[#1a3a6e]/30 hover:text-white"
                  }`}
                >
                  <span>{nh.name}</span>
                  <span className="text-xs text-zinc-500">{nh.totalVacant + nh.totalAbandoned} properties</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter dropdown */}
        {showFilters && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#0f1629] border border-[#1a3a6e]/50 rounded-2xl shadow-2xl z-50">
            <div className="p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Property Type</p>
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => { onTypeChange(f.value); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors mb-1 ${
                    selectedType === f.value
                      ? "bg-[#1a3a6e]/50 text-white"
                      : "text-zinc-300 hover:bg-[#1a3a6e]/30 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Quick filter pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedType === f.value
                ? "bg-[#003087] text-white border border-[#1a6eb5]/50"
                : "bg-[#0f1629]/80 text-zinc-400 border border-[#1a3a6e]/40 hover:text-white hover:border-[#1a6eb5]/60"
            }`}
          >
            {f.label}
          </button>
        ))}
        {resultCount !== undefined && (
          <span className="ml-auto text-xs text-zinc-500">
            {resultCount} {resultCount === 1 ? "property" : "properties"} found
          </span>
        )}
      </div>
    </div>
  );
}

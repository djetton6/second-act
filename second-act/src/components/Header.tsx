"use client";
import { Building2, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-[#1a3a6e]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-[#003087] to-[#1a6eb5] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Building2 size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#e4002b] rounded-full border-2 border-[#0a0e1a]" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">Second Act</span>
              <span className="block text-[#4a90d9] text-xs font-medium -mt-0.5 tracking-widest uppercase">Chicago</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-zinc-300 hover:text-white transition-colors">Browse</Link>
            <Link href="/?type=vacant_lot" className="text-sm text-zinc-300 hover:text-white transition-colors">Vacant Lots</Link>
            <Link href="/?type=abandoned_building" className="text-sm text-zinc-300 hover:text-white transition-colors">Abandoned</Link>
            <div className="relative group">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Resources <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f1629] border border-[#1a3a6e]/50 rounded-xl shadow-2xl py-2">
                  <a href="#lenders" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-[#1a3a6e]/30">Lenders</a>
                  <a href="#quotes" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-[#1a3a6e]/30">Construction Quotes</a>
                  <a href="#taxes" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-[#1a3a6e]/30">Property Tax Delta</a>
                </div>
              )}
            </div>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1a3a6e]/30 border border-[#1a3a6e]/50 text-[#4a90d9] text-xs px-3 py-1.5 rounded-full">
              <MapPin size={11} />
              <span>Chicago, IL</span>
            </div>
            <Link
              href="/?modal=bid"
              className="bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-900/30"
            >
              Place a Bid
            </Link>
          </div>
        </div>
      </div>

      {/* Chicago flag accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-[#003087] via-[#e4002b] via-50% to-[#003087]" />
    </header>
  );
}

"use client";
import { Building2, MapPin } from "lucide-react";
import Link from "next/link";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060914]/95 backdrop-blur-md border-b border-[#1a3a6e]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #003087 0%, #41B6E6 100%)" }}
              >
                <Building2 size={18} className="text-white" />
              </div>
              <div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060914]"
                style={{ background: "#CC0000" }}
              />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Second Act
              </span>
              <span
                className="block text-xs font-semibold -mt-0.5 tracking-[0.2em] uppercase"
                style={{ color: "#41B6E6" }}
              >
                Chicago
              </span>
            </div>
          </Link>

          {/* Nav — only links that actually work */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo("properties")}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Properties
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                const el = document.querySelector("[data-section='landbank']");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Land Bank
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(65,182,230,0.08)",
                borderColor: "rgba(65,182,230,0.2)",
                color: "#41B6E6",
              }}
            >
              <MapPin size={11} />
              <span>Cook County, IL</span>
            </div>
          </div>

        </div>
      </div>

      {/* Chicago flag accent stripe */}
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #003087 0%, #41B6E6 35%, #CC0000 50%, #41B6E6 65%, #003087 100%)" }} />
    </header>
  );
}

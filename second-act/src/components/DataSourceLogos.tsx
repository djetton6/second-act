"use client";
import { Database, ExternalLink } from "lucide-react";

interface DataSource {
  name: string;
  description: string;
  url: string;
  logo: string;
  category: string;
}

const DATA_SOURCES: DataSource[] = [
  {
    name: "City of Chicago Data Portal",
    description: "Vacant & Abandoned Buildings Dataset",
    url: "https://data.cityofchicago.org",
    logo: "CHI",
    category: "Primary Data",
  },
  {
    name: "Chicago Building Violations",
    description: "Building code violation records",
    url: "https://data.cityofchicago.org/Buildings/Building-Violations/22u3-xenr",
    logo: "CBV",
    category: "Building Data",
  },
  {
    name: "Cook County Assessor",
    description: "Property tax and assessment data",
    url: "https://www.cookcountyassessor.com",
    logo: "CCA",
    category: "Tax Data",
  },
  {
    name: "Google Maps Platform",
    description: "Mapping and geolocation services",
    url: "https://cloud.google.com/maps-platform",
    logo: "GMP",
    category: "Mapping",
  },
  {
    name: "Google Gemini AI",
    description: "AI property visualization (NanoBanana)",
    url: "https://deepmind.google/technologies/gemini",
    logo: "GEM",
    category: "AI Vision",
  },
  {
    name: "Illinois Housing Development Authority",
    description: "Affordable housing programs & data",
    url: "https://www.ihda.org",
    logo: "IHDA",
    category: "Housing",
  },
  {
    name: "Chicago Metropolitan Agency",
    description: "Regional planning & neighborhood data",
    url: "https://www.cmap.illinois.gov",
    logo: "CMAP",
    category: "Planning",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Primary Data": "from-blue-600 to-blue-800",
  "Building Data": "from-amber-600 to-amber-800",
  "Tax Data": "from-emerald-600 to-emerald-800",
  "Mapping": "from-red-600 to-red-800",
  "AI Vision": "from-purple-600 to-indigo-800",
  "Housing": "from-cyan-600 to-cyan-800",
  "Planning": "from-teal-600 to-teal-800",
};

export default function DataSourceLogos() {
  return (
    <section className="py-12 border-t border-[#1a3a6e]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Database size={18} className="text-[#4a90d9]" />
          <h2 className="text-white font-bold text-lg">Data Sources & Partners</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-8">
          Second Act Chicago aggregates data from these trusted public and institutional sources to provide accurate property information.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DATA_SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-3 bg-[#0f1629] border border-[#1a3a6e]/40 hover:border-[#1a6eb5]/60 rounded-2xl transition-all hover:-translate-y-0.5"
              title={source.description}
            >
              {/* Logo badge */}
              <div className={`w-12 h-12 bg-gradient-to-br ${CATEGORY_COLORS[source.category] || "from-zinc-700 to-zinc-900"} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-xs">{source.logo}</span>
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="text-zinc-300 text-xs font-semibold leading-tight group-hover:text-white transition-colors">
                  {source.name.length > 20 ? source.name.substring(0, 18) + "…" : source.name}
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">{source.category}</p>
              </div>

              <ExternalLink size={10} className="text-zinc-600 group-hover:text-[#4a90d9] transition-colors" />
            </a>
          ))}
        </div>

        {/* API attribution */}
        <div className="mt-6 p-4 bg-[#0f1629]/60 border border-[#1a3a6e]/30 rounded-2xl">
          <p className="text-zinc-500 text-xs">
            <strong className="text-zinc-400">Primary API:</strong>{" "}
            <a
              href="https://data.cityofchicago.org/api/v3/views/7nii-7srd/query.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4a90d9] hover:text-white transition-colors font-mono"
            >
              data.cityofchicago.org/api/v3/views/7nii-7srd/query.json
            </a>
            {" "}· Vacant & Abandoned Buildings Entrance Survey · Updated daily · CC Attribution License
          </p>
        </div>
      </div>
    </section>
  );
}

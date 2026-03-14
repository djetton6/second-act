"use client";
import { Database, FlaskConical, ExternalLink, Building, Landmark, Cpu } from "lucide-react";

interface Institution {
  name: string;
  shortName: string;
  description: string;
  url: string;
  initials: string;
  color: string;
  textColor?: string;
}

const RESEARCH_PARTNERS: Institution[] = [
  {
    name: "DePaul University — Chaddick Institute",
    shortName: "DePaul Chaddick",
    description: "Metropolitan Development & Urban Land Use Research",
    url: "https://las.depaul.edu/centers-and-institutes/chaddick-institute-for-metropolitan-development/Pages/default.aspx",
    initials: "DPU",
    color: "#1c4DA1",
    textColor: "#fff",
  },
  {
    name: "University of Chicago — Crown Family School",
    shortName: "UChicago CCED",
    description: "Community & Economic Development, Neighborhood Research",
    url: "https://crownschool.uchicago.edu",
    initials: "UChi",
    color: "#800000",
    textColor: "#fff",
  },
  {
    name: "Illinois Institute of Technology — College of Architecture",
    shortName: "IIT Architecture",
    description: "Urban Design, Mies Campus, Chicago Building Heritage",
    url: "https://arch.iit.edu",
    initials: "IIT",
    color: "#CC0000",
    textColor: "#fff",
  },
  {
    name: "UIC — Voorhees Center",
    shortName: "UIC Voorhees",
    description: "Neighborhood & Community Improvement Research",
    url: "https://voorheescenter.uic.edu",
    initials: "UIC",
    color: "#001E62",
    textColor: "#fff",
  },
  {
    name: "Northwestern University — IPR",
    shortName: "Northwestern IPR",
    description: "Institute for Policy Research, Urban Studies",
    url: "https://www.ipr.northwestern.edu",
    initials: "NWU",
    color: "#4E2A84",
    textColor: "#fff",
  },
  {
    name: "Loyola University — CURL",
    shortName: "Loyola CURL",
    description: "Center for Urban Research and Learning",
    url: "https://www.luc.edu/curl",
    initials: "LUC",
    color: "#8B3A3A",
    textColor: "#fff",
  },
];

const CITY_SOURCES: Institution[] = [
  {
    name: "City of Chicago Data Portal",
    shortName: "City of Chicago",
    description: "Vacant & Abandoned Buildings Primary Dataset",
    url: "https://data.cityofchicago.org",
    initials: "CHI",
    color: "#003087",
    textColor: "#fff",
  },
  {
    name: "Chicago Dept of Housing",
    shortName: "DOH Chicago",
    description: "Affordable Housing, Neighborhood Opportunity",
    url: "https://www.chicago.gov/city/en/depts/doh.html",
    initials: "DOH",
    color: "#1a6eb5",
    textColor: "#fff",
  },
  {
    name: "Chicago Dept of Planning",
    shortName: "DPD Chicago",
    description: "Zoning, Land Use & Development Plans",
    url: "https://www.chicago.gov/city/en/depts/dcd.html",
    initials: "DPD",
    color: "#0e4d92",
    textColor: "#fff",
  },
  {
    name: "Cook County Assessor",
    shortName: "Cook County",
    description: "Property Tax & Assessment Data",
    url: "https://www.cookcountyassessor.com",
    initials: "CCA",
    color: "#2e7d32",
    textColor: "#fff",
  },
  {
    name: "Illinois Housing Dev Authority",
    shortName: "IHDA Illinois",
    description: "Affordable Housing Programs & Financing",
    url: "https://www.ihda.org",
    initials: "IHDA",
    color: "#004d40",
    textColor: "#fff",
  },
  {
    name: "Chicago Metropolitan Agency for Planning",
    shortName: "CMAP",
    description: "Regional Planning & Neighborhood Data",
    url: "https://www.cmap.illinois.gov",
    initials: "CMAP",
    color: "#37474f",
    textColor: "#fff",
  },
  {
    name: "Chicago Land Bank Authority",
    shortName: "CLBA",
    description: "Vacant Lot Acquisition & Disposition",
    url: "https://www.chicagolandbank.org",
    initials: "CLBA",
    color: "#e65100",
    textColor: "#fff",
  },
  {
    name: "Neighborhood Housing Services",
    shortName: "NHS Chicago",
    description: "Community Lending & Homeownership",
    url: "https://www.nhschicago.org",
    initials: "NHS",
    color: "#006064",
    textColor: "#fff",
  },
];

const TECH_SOURCES: Institution[] = [
  {
    name: "Google Maps Platform",
    shortName: "Google Maps",
    description: "Mapping, Street View & Geolocation",
    url: "https://cloud.google.com/maps-platform",
    initials: "GMP",
    color: "#4285F4",
    textColor: "#fff",
  },
  {
    name: "Google Gemini / DeepMind",
    shortName: "Gemini AI",
    description: "AI Property Visualization & NanoBanana Rendering",
    url: "https://deepmind.google/technologies/gemini",
    initials: "GEM",
    color: "#7c4dff",
    textColor: "#fff",
  },
  {
    name: "Chicago Building Violations API",
    shortName: "Chi Violations",
    description: "Building Code Violation Records",
    url: "https://data.cityofchicago.org/Buildings/Building-Violations/22u3-xenr",
    initials: "CBV",
    color: "#c62828",
    textColor: "#fff",
  },
];

function InstitutionCard({ inst }: { inst: Institution }) {
  return (
    <a
      href={inst.url}
      target="_blank"
      rel="noopener noreferrer"
      title={inst.description}
      className="group flex flex-col items-center gap-2.5 p-3 bg-[#0f1629] border border-[#1a3a6e]/40 hover:border-[#1a6eb5]/60 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20"
    >
      {/* Logo badge */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg text-sm font-black tracking-tight"
        style={{ backgroundColor: inst.color, color: inst.textColor || "#fff" }}
      >
        {inst.initials}
      </div>
      <div className="text-center">
        <p className="text-zinc-300 text-xs font-semibold leading-tight group-hover:text-white transition-colors line-clamp-2">
          {inst.shortName}
        </p>
        <p className="text-zinc-600 text-[10px] mt-0.5 leading-tight line-clamp-2">{inst.description}</p>
      </div>
      <ExternalLink size={9} className="text-zinc-700 group-hover:text-[#4a90d9] transition-colors" />
    </a>
  );
}

export default function DataSourceLogos() {
  return (
    <section className="py-14 border-t border-[#1a3a6e]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Research Partners */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical size={16} className="text-purple-400" />
            <h2 className="text-white font-bold text-base">Academic Research Partners</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Urban studies, housing policy, and community development research informing Second Act Chicago.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {RESEARCH_PARTNERS.map((inst) => (
              <InstitutionCard key={inst.name} inst={inst} />
            ))}
          </div>
        </div>

        {/* City & Government */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building size={16} className="text-[#4a90d9]" />
            <h2 className="text-white font-bold text-base">City, County & State Agencies</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Official government datasets, zoning records, and housing programs powering property data.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CITY_SOURCES.map((inst) => (
              <InstitutionCard key={inst.name} inst={inst} />
            ))}
          </div>
        </div>

        {/* Technology */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={16} className="text-emerald-400" />
            <h2 className="text-white font-bold text-base">Technology & AI</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Mapping, AI visualization, and data infrastructure.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3 max-w-sm">
            {TECH_SOURCES.map((inst) => (
              <InstitutionCard key={inst.name} inst={inst} />
            ))}
          </div>
        </div>

        {/* Primary API callout */}
        <div className="p-4 bg-[#0f1629]/80 border border-[#1a3a6e]/40 rounded-2xl">
          <div className="flex items-start gap-3">
            <Database size={15} className="text-[#4a90d9] mt-0.5 shrink-0" />
            <div className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-300">Primary Dataset:</strong>{" "}
              <a
                href="https://data.cityofchicago.org/api/v3/views/7nii-7srd/query.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a90d9] hover:text-white transition-colors font-mono break-all"
              >
                data.cityofchicago.org/api/v3/views/7nii-7srd/query.json
              </a>
              <span className="mx-2">·</span>
              Vacant & Abandoned Buildings Entrance Survey
              <span className="mx-2">·</span>
              Updated daily
              <span className="mx-2">·</span>
              <span className="text-emerald-400">CC Attribution License</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

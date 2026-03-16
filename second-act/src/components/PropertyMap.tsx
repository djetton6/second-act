"use client";
import { useEffect, useRef, useState } from "react";
import { ChicagoProperty } from "@/types";
import { MapPin, Building2 } from "lucide-react";

interface PropertyMapProps {
  properties: ChicagoProperty[];
  selectedProperty?: ChicagoProperty | null;
  onPropertyClick: (property: ChicagoProperty) => void;
  center?: { lat: number; lng: number };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initMap: () => void;
  }
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertyClick,
  center = { lat: 41.8781, lng: -87.6298 },
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "YOUR_KEY_HERE") {
      setMapError(true);
      return;
    }

    // If Google Maps JS is already loaded, initialize immediately
    if (window.google?.maps?.Map) {
      initializeMap();
      return;
    }

    // Unique callback name to avoid conflicts across re-renders
    const cbName = `__gm_${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[cbName] = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      initializeMap();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${cbName}&loading=async`;
    script.async = true;
    script.onerror = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      setMapError(true);
    };
    document.head.appendChild(script);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initializeMap() {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 11,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;
    setMapLoaded(true);
  }

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    properties.forEach((property) => {
      const isSelected = selectedProperty?.id === property.id;
      const isVacant = property.propertyType === "vacant_lot";

      const marker = new window.google.maps.Marker({
        position: { lat: property.latitude, lng: property.longitude },
        map: mapInstanceRef.current,
        title: property.address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: isSelected ? "#fff" : isVacant ? "#22c55e" : "#f59e0b",
          fillOpacity: 1,
          strokeColor: isSelected ? "#003087" : isVacant ? "#16a34a" : "#d97706",
          strokeWeight: isSelected ? 3 : 2,
          scale: isSelected ? 12 : 8,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="background:#0f1629;color:white;padding:12px;border-radius:12px;min-width:200px;border:1px solid rgba(26,58,110,0.5)">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${property.address}</p>
            <p style="color:#4a90d9;font-size:11px;margin:0 0 8px">${property.neighborhood} · ZIP ${property.zip}</p>
            <div style="display:flex;gap:8px">
              <div style="background:#0a0e1a;padding:6px 10px;border-radius:8px;flex:1">
                <p style="color:#888;font-size:10px;margin:0">Min Bid</p>
                <p style="color:white;font-weight:700;font-size:12px;margin:0">$${property.minBid.toLocaleString()}</p>
              </div>
              <div style="background:#0a0e1a;padding:6px 10px;border-radius:8px;flex:1">
                <p style="color:#888;font-size:10px;margin:0">Value</p>
                <p style="color:#4a90d9;font-weight:700;font-size:12px;margin:0">$${property.estimatedValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
        onPropertyClick(property);
      });

      markersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, selectedProperty, mapLoaded]);

  // Pan to selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;
    mapInstanceRef.current.panTo({
      lat: selectedProperty.latitude,
      lng: selectedProperty.longitude,
    });
    mapInstanceRef.current.setZoom(15);
  }, [selectedProperty]);

  if (mapError) {
    return <MapFallback properties={properties} onPropertyClick={onPropertyClick} selectedProperty={selectedProperty} />;
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#1a3a6e]/40">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#0a0e1a] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1a6eb5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Loading Chicago map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#0f1629]/95 backdrop-blur-sm border border-[#1a3a6e]/40 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-300">Abandoned Building</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-300">Vacant Lot</span>
        </div>
      </div>
    </div>
  );
}

// Fallback SVG map when no Google Maps API key
function MapFallback({
  properties,
  onPropertyClick,
  selectedProperty,
}: Omit<PropertyMapProps, "center">) {
  const chiCenter = { lat: 41.8781, lng: -87.6298 };
  const scale = { lat: 80, lng: 80 };

  function toSvg(lat: number, lng: number) {
    const x = ((lng - chiCenter.lng) * scale.lng + 5) * 10;
    const y = (-(lat - chiCenter.lat) * scale.lat + 5) * 10;
    return { x: Math.max(0, Math.min(800, x + 400)), y: Math.max(0, Math.min(600, y + 300)) };
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#1a3a6e]/40 bg-[#0a0e1a]">
      {/* Grid background */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a3a6e" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Chicago label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-30 pointer-events-none">
        <p className="text-[#1a3a6e] text-6xl font-bold tracking-widest">CHICAGO</p>
        <p className="text-[#1a3a6e] text-sm tracking-widest mt-1">ILLINOIS</p>
      </div>

      {/* Property dots */}
      <svg className="absolute inset-0 w-full h-full">
        {properties.slice(0, 50).map((p) => {
          const pos = toSvg(p.latitude, p.longitude);
          const isSelected = selectedProperty?.id === p.id;
          const isVacant = p.propertyType === "vacant_lot";
          return (
            <g key={p.id} onClick={() => onPropertyClick(p)} className="cursor-pointer">
              <circle
                cx={`${pos.x / 8}%`}
                cy={`${pos.y / 6}%`}
                r={isSelected ? 10 : 6}
                fill={isSelected ? "#fff" : isVacant ? "#22c55e" : "#f59e0b"}
                fillOpacity={0.9}
                stroke={isSelected ? "#003087" : isVacant ? "#16a34a" : "#d97706"}
                strokeWidth={isSelected ? 3 : 1.5}
                className="hover:r-10 transition-all"
              />
            </g>
          );
        })}
      </svg>

      {/* No API key message */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0f1629]/95 border border-[#1a3a6e]/50 rounded-xl px-4 py-2 text-center">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-[#4a90d9]" />
          <p className="text-xs text-zinc-400">Add <code className="text-[#4a90d9]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for interactive Google Maps</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-[#0f1629]/95 border border-[#1a3a6e]/40 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-300">Abandoned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-300">Vacant Lot</span>
        </div>
      </div>

      {/* Property count overlay */}
      <div className="absolute top-4 left-4 bg-[#003087]/80 border border-[#1a6eb5]/40 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-[#4a90d9]" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">{properties.length}</p>
            <p className="text-[#4a90d9] text-xs">Properties</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a90d9" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#7ec8e3" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#4a90d9" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0d1f0d" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#2d6a2d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a3a6e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f2040" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a9bb5" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#0c2461" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#003087" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0c4e3" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#0c2461" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#4a90d9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e2240" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2c5f8a" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
];

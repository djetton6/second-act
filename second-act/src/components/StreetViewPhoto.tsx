"use client";
import { useEffect, useRef, useState } from "react";
import { Building2, TreePine, Camera } from "lucide-react";

// ── Shared Maps JS API loader (loads once, shared across all instances) ────────
let mapsApiPromise: Promise<void> | null = null;

function loadMapsApi(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.StreetViewService) return Promise.resolve();
  if (mapsApiPromise) return mapsApiPromise;

  mapsApiPromise = new Promise((resolve) => {
    const cbName = `__svPhoto_${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[cbName] = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      resolve();
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${cbName}&loading=async`;
    script.async = true;
    script.onerror = () => { mapsApiPromise = null; resolve(); };
    document.head.appendChild(script);
  });

  return mapsApiPromise;
}

interface StreetViewPhotoProps {
  lat: number;
  lng: number;
  propertyType?: "vacant_lot" | "abandoned_building";
  /** "auto" = try street first, fallback satellite | "street" = street only | "satellite" = satellite only */
  mode?: "auto" | "street" | "satellite";
  /** Whether to enable pan/zoom controls (false for card thumbnails) */
  interactive?: boolean;
  className?: string;
}

type Status = "loading" | "street" | "satellite" | "none";

export default function StreetViewPhoto({
  lat,
  lng,
  propertyType,
  mode = "auto",
  interactive = false,
  className = "",
}: StreetViewPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;
    let cancelled = false;

    // Use IntersectionObserver so off-screen cards only load when visible
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        await loadMapsApi(apiKey);
        if (cancelled || !containerRef.current) return;

        // Check if Maps JS API actually loaded
        if (!window.google?.maps?.StreetViewService) {
          setStatus("none");
          return;
        }

        function showSatellite() {
          if (!containerRef.current) return;
          new window.google.maps.Map(containerRef.current, {
            center: { lat, lng },
            zoom: 18,
            mapTypeId: "satellite",
            disableDefaultUI: true,
            gestureHandling: interactive ? "auto" : "none",
          });
          setStatus("satellite");
        }

        // Satellite-only mode — skip Street View check
        if (mode === "satellite") {
          showSatellite();
          return;
        }

        const svc = new window.google.maps.StreetViewService();
        svc.getPanorama(
          { location: { lat, lng }, radius: 100 },
          (data: google.maps.StreetViewPanoramaData | null, svStatus: google.maps.StreetViewStatus) => {
            if (cancelled || !containerRef.current) return;

            if (svStatus === window.google.maps.StreetViewStatus.OK && data?.location?.pano) {
              new window.google.maps.StreetViewPanorama(containerRef.current!, {
                pano: data.location.pano,
                visible: true,
                disableDefaultUI: !interactive,
                scrollwheel: interactive,
                motionTracking: false,
                linksControl: false,
                panControl: interactive,
                zoomControl: interactive,
                fullscreenControl: false,
                addressControl: false,
                clickToGo: interactive,
              });
              setStatus("street");
            } else {
              showSatellite();
            }
          }
        );
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [lat, lng, apiKey, interactive]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading state */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a]">
          <Camera size={20} className="text-[#1a3a6e] animate-pulse" />
        </div>
      )}

      {/* No imagery fallback */}
      {status === "none" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0e1a]">
          {propertyType === "abandoned_building"
            ? <Building2 size={36} className="text-[#1a3a6e]" />
            : <TreePine size={36} className="text-[#1a3a6e]" />}
          <span className="text-zinc-700 text-xs">No imagery</span>
        </div>
      )}

      {/* The map/panorama container — hidden until ready */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ visibility: status === "loading" || status === "none" ? "hidden" : "visible" }}
      />

      {/* Source badge */}
      {(status === "street" || status === "satellite") && (
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 pointer-events-none z-10">
          <span className="text-[9px] text-zinc-300">
            {status === "street" ? "📷 Street View" : "🛰 Aerial"}
          </span>
        </div>
      )}
    </div>
  );
}

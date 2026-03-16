import { NextRequest, NextResponse } from "next/server";

function binaryResponse(data: Uint8Array, contentType: string, headers?: Record<string, string>) {
  return new Response(data.buffer as ArrayBuffer, {
    headers: { "Content-Type": contentType, ...headers },
  });
}

const API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

// Simple in-memory URL cache to avoid re-fetching the same image
const urlCache = new Map<string, { data: Uint8Array; contentType: string; ts: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function tryFetch(url: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 5000) return null; // Google grey placeholder is ~5KB
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return { data: new Uint8Array(arrayBuffer), contentType };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";
  const lat = searchParams.get("lat") ?? "";
  const lng = searchParams.get("lng") ?? "";
  const mode = searchParams.get("mode") ?? "auto"; // "street" | "satellite" | "auto"

  if (!API_KEY) {
    return new NextResponse(null, { status: 503, statusText: "Maps API key not configured" });
  }

  const cacheKey = `${mode}:${address}:${lat}:${lng}`;
  const cached = urlCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return binaryResponse(cached.data, cached.contentType, {
      "Cache-Control": "public, max-age=3600",
      "X-Photo-Source": "cache",
    });
  }

  let result: { data: Uint8Array; contentType: string } | null = null;
  let source = "none";

  // ── 1. Street View by address ───────────────────────────────────────────────
  if (mode !== "satellite" && address) {
    const params = new URLSearchParams({
      size: "640x400",
      location: address,
      fov: "90",
      pitch: "5",
      key: API_KEY,
    });
    result = await tryFetch(`https://maps.googleapis.com/maps/api/streetview?${params}`);
    if (result) source = "streetview-address";
  }

  // ── 2. Street View by lat/lng ───────────────────────────────────────────────
  if (!result && mode !== "satellite" && lat && lng) {
    const params = new URLSearchParams({
      size: "640x400",
      location: `${lat},${lng}`,
      fov: "90",
      pitch: "5",
      key: API_KEY,
    });
    result = await tryFetch(`https://maps.googleapis.com/maps/api/streetview?${params}`);
    if (result) source = "streetview-latlng";
  }

  // ── 3. Satellite by lat/lng (always available for real coordinates) ─────────
  if (!result && lat && lng) {
    const params = new URLSearchParams({
      center: `${lat},${lng}`,
      zoom: "18",
      size: "640x400",
      maptype: "satellite",
      key: API_KEY,
    });
    result = await tryFetch(`https://maps.googleapis.com/maps/api/staticmap?${params}`);
    if (result) source = "satellite-latlng";
  }

  // ── 4. Satellite by address ─────────────────────────────────────────────────
  if (!result && address) {
    const params = new URLSearchParams({
      center: address,
      zoom: "18",
      size: "640x400",
      maptype: "satellite",
      key: API_KEY,
    });
    result = await tryFetch(`https://maps.googleapis.com/maps/api/staticmap?${params}`);
    if (result) source = "satellite-address";
  }

  if (!result) {
    return new NextResponse(null, { status: 404, statusText: "No imagery available" });
  }

  urlCache.set(cacheKey, { ...result, ts: Date.now() });

  return binaryResponse(result.data, result.contentType, {
    "Cache-Control": "public, max-age=3600",
    "X-Photo-Source": source,
  });
}

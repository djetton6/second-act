const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/**
 * Returns a Google Street View Static API image URL for a given lat/lng.
 * Shows the real current-state photo of the property location.
 */
export function getStreetViewUrl(
  lat: number,
  lng: number,
  width = 600,
  height = 400,
  heading?: number
): string {
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    location: `${lat},${lng}`,
    fov: "90",
    pitch: "5",
    key: API_KEY,
    return_error_codes: "true",
    source: "outdoor",
  });
  if (heading !== undefined) params.set("heading", String(heading));
  return `https://maps.googleapis.com/maps/api/streetview?${params}`;
}

/**
 * Returns a Street View metadata URL to check if imagery exists.
 */
export function getStreetViewMetadataUrl(lat: number, lng: number): string {
  return `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${API_KEY}`;
}

/**
 * Returns a Google Maps Static API aerial/satellite image.
 */
export function getSatelliteUrl(
  lat: number,
  lng: number,
  width = 600,
  height = 400,
  zoom = 18
): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    maptype: "satellite",
    key: API_KEY,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params}`;
}

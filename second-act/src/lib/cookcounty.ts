/**
 * Cook County Assessor & Chicago Data Portal lookups.
 * Fetches real parcel data (PIN, rooms, sq ft, year built, building class)
 * to feed accurate context into the Gemini 3D rendering prompt.
 */

export interface ParcelData {
  pin: string;
  address: string;
  sqft: number | null;
  lotSqft: number | null;
  rooms: number | null;
  bedrooms: number | null;
  yearBuilt: number | null;
  buildingClass: string | null;
  stories: number | null;
  basement: boolean;
  garageType: string | null;
  exteriorConstruction: string | null;
}

/**
 * Look up Cook County Assessor data by address via the CCAO open data API.
 * Returns null if not found or request fails.
 */
export async function lookupParcel(address: string, zip: string): Promise<ParcelData | null> {
  try {
    // Normalize address for API query
    const normalized = address.replace(/\s+/g, " ").trim().toUpperCase();
    const url = `https://datacatalog.cookcountyil.gov/resource/tx2p-k2g9.json?${new URLSearchParams({
      property_address: normalized,
      $limit: "1",
    })}`;

    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const rows = await res.json() as Record<string, string>[];
    if (!rows.length) return null;

    const r = rows[0];
    return {
      pin: r.pin14 ?? r.pin ?? "",
      address: r.property_address ?? address,
      sqft: r.building_sq_ft ? parseInt(r.building_sq_ft) : null,
      lotSqft: r.land_sq_ft ? parseInt(r.land_sq_ft) : null,
      rooms: r.num_rooms ? parseInt(r.num_rooms) : null,
      bedrooms: r.num_bedrooms ? parseInt(r.num_bedrooms) : null,
      yearBuilt: r.year_built ? parseInt(r.year_built) : null,
      buildingClass: r.building_class_description ?? null,
      stories: r.num_stories ? parseFloat(r.num_stories) : null,
      basement: r.basement_finish ? r.basement_finish !== "0" : false,
      garageType: r.garage_indicator ?? null,
      exteriorConstruction: r.exterior_construction ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch parcel data from the Chicago Data Portal building footprint dataset.
 * Useful for lot shape and building footprint data.
 */
export async function lookupBuildingFootprint(lat: number, lng: number): Promise<{
  buildingClass: string | null;
  floors: number | null;
  yearBuilt: number | null;
} | null> {
  try {
    const url = `https://data.cityofchicago.org/resource/ahh4-rp8m.json?${new URLSearchParams({
      $where: `within_circle(geometry, ${lat}, ${lng}, 50)`,
      $limit: "1",
    })}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const rows = await res.json() as Record<string, string>[];
    if (!rows.length) return null;
    const r = rows[0];
    return {
      buildingClass: r.bldg_use ?? null,
      floors: r.no_of_stories ? parseInt(r.no_of_stories) : null,
      yearBuilt: r.year_built_est ? parseInt(r.year_built_est) : null,
    };
  } catch {
    return null;
  }
}

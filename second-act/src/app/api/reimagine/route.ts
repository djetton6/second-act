import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { lookupParcel, lookupBuildingFootprint, ParcelData } from "@/lib/cookcounty";

// ── Server-side Street View fetch ─────────────────────────────────────────────

async function fetchStreetViewBase64(
  lat: number,
  lng: number
): Promise<{ data: string; mimeType: string } | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    size: "800x600",
    location: `${lat},${lng}`,
    fov: "90",
    pitch: "5",
    key: apiKey,
    source: "outdoor",
    return_error_codes: "true",
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/streetview?${params}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    // Google returns a tiny grey placeholder (~5KB) when no imagery exists
    if (buffer.byteLength < 8000) return null;

    const base64 = Buffer.from(buffer).toString("base64");
    return { data: base64, mimeType: contentType };
  } catch {
    return null;
  }
}

async function fetchSatelliteBase64(
  lat: number,
  lng: number
): Promise<{ data: string; mimeType: string } | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "19",
    size: "600x400",
    maptype: "satellite",
    key: apiKey,
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?${params}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 5000) return null;

    const base64 = Buffer.from(buffer).toString("base64");
    return { data: base64, mimeType: contentType };
  } catch {
    return null;
  }
}

// ── Main route ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address, neighborhood, propertyType, proposalType, style,
      latitude, longitude, zip,
      viewMode = "exterior",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    // ── Fetch real parcel data + Street View image in parallel ───────────────
    const [parcelResult, footprintResult, streetViewImage, satelliteImage] =
      await Promise.allSettled([
        address && zip ? lookupParcel(address, zip) : Promise.resolve(null),
        latitude && longitude ? lookupBuildingFootprint(latitude, longitude) : Promise.resolve(null),
        latitude && longitude ? fetchStreetViewBase64(latitude, longitude) : Promise.resolve(null),
        latitude && longitude ? fetchSatelliteBase64(latitude, longitude) : Promise.resolve(null),
      ]);

    const parcel: ParcelData | null =
      parcelResult.status === "fulfilled" ? parcelResult.value : null;
    const footprint =
      footprintResult.status === "fulfilled" ? footprintResult.value : null;
    const streetView =
      streetViewImage.status === "fulfilled" ? streetViewImage.value : null;
    const satellite =
      satelliteImage.status === "fulfilled" ? satelliteImage.value : null;

    const realData = buildRealDataContext(parcel, footprint);
    const hasStreetView = !!streetView;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        description: generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData),
        imageBase64: null,
        mimeType: null,
        isDemo: true,
        parcelData: realData,
        hasStreetView,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ── Step 1: Vision analysis of actual Street View photo ─────────────────
    // If we have the real photo, use Gemini vision to describe current condition
    let description: string;

    if (streetView) {
      // Pass the real Google Maps Street View photo to Gemini for analysis + vision statement
      const visionResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: streetView.mimeType,
                  data: streetView.data,
                },
              },
              {
                text: buildVisionTextPrompt(address, neighborhood, propertyType, proposalType, style, realData),
              },
            ],
          },
        ],
      });
      description =
        visionResponse.text ??
        generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData);
    } else {
      // Fallback: text-only description
      const textResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: buildTextPrompt(address, neighborhood, propertyType, proposalType, style, realData),
      });
      description =
        textResponse.text ??
        generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData);
    }

    // ── Step 2: Image generation — use Street View as reference if available ─
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    try {
      // Build the image generation prompt parts
      // If we have a Street View photo, pass it as the "before" reference image
      const imageParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (streetView && viewMode === "exterior") {
        // Pass the actual street view photo as context for Gemini to transform
        imageParts.push({
          inlineData: {
            mimeType: streetView.mimeType,
            data: streetView.data,
          },
        });
        // Also pass satellite for lot context if available
        if (satellite) {
          imageParts.push({
            inlineData: {
              mimeType: satellite.mimeType,
              data: satellite.data,
            },
          });
        }
        imageParts.push({
          text: buildImg2ImgPrompt(address, neighborhood, propertyType, proposalType, style, realData),
        });
      } else {
        // Floor plan and interior: text-only prompt (no photo reference needed)
        imageParts.push({
          text: buildSketchUpPrompt(address, neighborhood, propertyType, proposalType, style, realData, viewMode),
        });
      }

      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: imageParts }],
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
          temperature: 0.85,
        },
      });

      for (const candidate of imageResponse.candidates ?? []) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.inlineData?.data) {
            imageBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType ?? "image/png";
            break;
          }
        }
        if (imageBase64) break;
      }
    } catch (imgErr) {
      console.warn("Image generation failed:", imgErr);
    }

    return NextResponse.json({
      success: true,
      description,
      imageBase64,
      mimeType,
      isDemo: false,
      parcelData: realData,
      hasStreetView,
    });
  } catch (error) {
    console.error("Reimagine API error:", error);
    return NextResponse.json({ error: "Failed to generate reimagining" }, { status: 500 });
  }
}

// ── Context builder ────────────────────────────────────────────────────────────

interface RealDataContext {
  yearBuilt: number | null;
  sqft: number | null;
  stories: number | null;
  rooms: number | null;
  bedrooms: number | null;
  basement: boolean;
  exterior: string | null;
  buildingClass: string | null;
  pin: string | null;
}

function buildRealDataContext(
  parcel: ParcelData | null,
  footprint: { buildingClass: string | null; floors: number | null; yearBuilt: number | null } | null
): RealDataContext {
  return {
    yearBuilt: parcel?.yearBuilt ?? footprint?.yearBuilt ?? null,
    sqft: parcel?.sqft ?? null,
    stories: parcel?.stories ?? footprint?.floors ?? null,
    rooms: parcel?.rooms ?? null,
    bedrooms: parcel?.bedrooms ?? null,
    basement: parcel?.basement ?? false,
    exterior: parcel?.exteriorConstruction ?? null,
    buildingClass: parcel?.buildingClass ?? footprint?.buildingClass ?? null,
    pin: parcel?.pin ?? null,
  };
}

// ── Vision-based text prompt (when we have the real photo) ────────────────────

function buildVisionTextPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext
): string {
  const isNew = proposalType === "new_construction";
  const realFacts = [
    data.yearBuilt ? `Originally built in ${data.yearBuilt}.` : "",
    data.sqft ? `${data.sqft.toLocaleString()} sq ft.` : "",
    data.stories ? `${data.stories} stories.` : "",
    data.bedrooms ? `${data.bedrooms} bedrooms.` : "",
    data.basement ? "Has basement." : "",
    data.exterior ? `Exterior: ${data.exterior}.` : "",
    data.pin ? `Cook County PIN: ${data.pin}.` : "",
  ].filter(Boolean).join(" ");

  return `You are a senior architect at NanoBanana, a Chicago-based firm specializing in neighborhood revitalization.

I'm showing you the ACTUAL current Google Maps Street View photo of this property:
Address: ${address}, ${neighborhood}, Chicago, IL
Type: ${propertyType === "vacant_lot" ? "Vacant Lot" : "Abandoned Building"}
Proposal: ${isNew ? "New Construction" : "Renovation/Rehabilitation"}
Architectural Style: ${style ?? "Modern"}
${realFacts ? `Real Cook County Parcel Data: ${realFacts}` : ""}

First, briefly describe what you observe in the current photo (condition, building type, street context — 2 sentences max).

Then write a compelling architectural vision statement for the transformed property. Include:
1. Key design moves referencing what you see in the current photo and ${neighborhood}'s character
2. Specific interior highlights using the real room/sqft data if available
3. 2 sustainability features
4. Community impact — and how rehabilitating this specific property transforms the block
5. Estimated project cost range

Sign off: "— NanoBanana Architecture × Second Act Chicago"
Under 300 words. Make it feel like a premium architect's project summary.`;
}

// ── Img2Img prompt — references the actual Street View photo ─────────────────

function buildImg2ImgPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext
): string {
  const isNew = proposalType === "new_construction";

  const styleDetails: Record<string, string> = {
    "Modern": "flat roof, floor-to-ceiling windows, dark steel and glass panels, minimalist facade with clean geometric lines",
    "Greystone": "authentic Chicago limestone greystone facade, ornate carved cornice, bay windows, classic Chicago two-flat profile",
    "Prairie": "low-pitched hipped roof, wide overhanging eaves, horizontal banding, natural earth tones, Frank Lloyd Wright Prairie vocabulary",
    "Industrial": "exposed Chicago brick, large industrial steel-frame windows, raw concrete accents, reclaimed wood trim elements",
    "Craftsman": "welcoming covered front porch with thick square columns, exposed rafter tails, shingle siding, warm wood details",
  };
  const styleDesc = styleDetails[style ?? "Modern"] ?? styleDetails["Modern"];

  const storiesLabel = data.stories ? `${data.stories}-story` : (isNew ? "3-story" : "2-story");
  const sqftLabel = data.sqft ? ` (${data.sqft.toLocaleString()} sq ft)` : "";
  const bedsLabel = data.bedrooms ? `, ${data.bedrooms} bedrooms` : "";

  const action = isNew
    ? "completely replaced with brand-new construction"
    : "fully renovated and restored to its original glory";

  return `These are the actual current Google Maps Street View and aerial satellite photos of a ${propertyType === "vacant_lot" ? "vacant lot" : "distressed abandoned building"} at ${address} in the ${neighborhood} neighborhood of Chicago, Illinois.

Transform this specific property — keeping the exact same street, surrounding buildings, sidewalk, trees, and block context visible in the photo — into a ${storiesLabel}${sqftLabel}${bedsLabel} ${style ?? "Modern"} style Chicago residential building that has been ${action}.

Architectural style: ${styleDesc}.

Key requirements:
- PRESERVE the surrounding street, neighboring buildings, sidewalk curb, and sky from the original photo
- REPLACE only the subject property with the new/renovated building
- The new building should fit naturally into the Chicago streetscape
- Show a realistic "after renovation" photograph-quality exterior view from the street
- Include native landscaping strip, front entry steps, mailbox
- Warm afternoon Chicago sunlight
- Photo-realistic quality — this should look like a real before/after property photo

Small watermark badge in the bottom-right corner reading "NanoBanana × Second Act" in white text on a dark semi-transparent pill.`;
}

// ── SketchUp 3D prompt (floor plan / interior — no photo reference) ────────────

function buildSketchUpPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext,
  viewMode: string
): string {
  const isNew = proposalType === "new_construction";

  const styleDetails: Record<string, string> = {
    "Modern": "flat roof, floor-to-ceiling windows, dark steel panels, minimalist facade",
    "Greystone": "limestone greystone facade, ornate carved cornice, bay windows, Chicago two-flat profile",
    "Prairie": "low-pitched hipped roof, wide overhanging eaves, horizontal banding, natural earth tones, Frank Lloyd Wright Prairie vocabulary",
    "Industrial": "exposed brick, large industrial steel-frame windows, raw concrete accents, reclaimed wood trim",
    "Craftsman": "covered front porch with thick square columns, exposed rafter tails, shingle siding, warm wood details",
  };
  const styleDesc = styleDetails[style ?? "Modern"] ?? styleDetails["Modern"];
  const storiesLabel = data.stories ? `${data.stories}-story` : (isNew ? "3-story" : "2-story");
  const sqftLabel = data.sqft ? `, approx ${data.sqft.toLocaleString()} sq ft` : "";
  const bedsLabel = data.bedrooms ? `, ${data.bedrooms} bedrooms` : "";
  const brandingNote = `Small watermark badge in bottom-right corner: "NanoBanana × Second Act" in white text on dark semi-transparent pill.`;

  if (viewMode === "floorplan") {
    return `Professional architectural floor plan drawing for a ${storiesLabel} ${style ?? "Modern"} Chicago home in ${neighborhood}. Clean white background with thin black linework. Shows: room layout with labels (Living Room, Kitchen, Dining, ${data.bedrooms ?? 3} Bedrooms, ${Math.ceil((data.bedrooms ?? 3) / 2)} Baths${data.basement ? ", Basement" : ""}), doorways with swing arcs, window placements, staircase. Dimensions noted. North arrow in corner. Scale bar at bottom. Architectural blueprint aesthetic — precise, minimal, professional. ${brandingNote}`;
  }

  if (viewMode === "interior") {
    return `SketchUp-style 3D interior rendering of a ${style ?? "Modern"} ${storiesLabel} Chicago home in ${neighborhood}${sqftLabel}. ${isNew ? "Brand new construction" : "Fully restored renovation"}. View from the main living area looking toward the open kitchen. Key features: ${styleDesc}. Clean, airy spaces with 9-foot ceilings. Warm natural light from street-facing windows. Architectural visualization style — slightly stylized, clean linework, visible structural elements. ${brandingNote}`;
  }

  // Exterior fallback (no photo available)
  return `SketchUp Pro 3D architectural model rendering of a ${storiesLabel} Chicago residential building${sqftLabel}${bedsLabel} in ${neighborhood}. ${isNew ? "Brand new construction" : "Fully restored renovation"} in ${style ?? "Modern"} style: ${styleDesc}. Three-quarter isometric perspective from street level. Clean light grey background with subtle ground shadow. Architectural visualization style — semi-stylized like SketchUp, geometric forms, clean linework. Chicago street context at edges. ${brandingNote}`;
}

// ── Text-only prompt (fallback when no photo) ─────────────────────────────────

function buildTextPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext
): string {
  const isNew = proposalType === "new_construction";
  const realFacts = [
    data.yearBuilt ? `Originally built in ${data.yearBuilt}.` : "",
    data.sqft ? `${data.sqft.toLocaleString()} sq ft.` : "",
    data.stories ? `${data.stories} stories.` : "",
    data.bedrooms ? `${data.bedrooms} bedrooms.` : "",
    data.basement ? "Has basement." : "",
    data.exterior ? `Exterior: ${data.exterior}.` : "",
    data.buildingClass ? `Building class: ${data.buildingClass}.` : "",
    data.pin ? `Cook County PIN: ${data.pin}.` : "",
  ].filter(Boolean).join(" ");

  return `You are a senior architect at NanoBanana, a Chicago-based firm specializing in neighborhood revitalization.

Property: ${address}, ${neighborhood}, Chicago, IL
Type: ${propertyType === "vacant_lot" ? "Vacant Lot" : "Abandoned Building"}
Proposal: ${isNew ? "New Construction" : "Renovation/Rehabilitation"}
Architectural Style: ${style ?? "Modern"}
${realFacts ? `\nReal Parcel Data from Cook County:\n${realFacts}` : ""}

Write a compelling architectural vision statement. Include:
1. Key design moves that honor ${neighborhood}'s character
2. Specific interior highlights using real room/sqft data if available
3. 2-3 sustainability features
4. Community impact on ${neighborhood}
5. Estimated project cost range

Sign off: "— NanoBanana Architecture × Second Act Chicago"
Under 280 words.`;
}

// ── Mock description ────────────────────────────────────────────────────────────

function generateMockDescription(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext
): string {
  const isNew = proposalType === "new_construction";
  const sqftNote = data.sqft
    ? ` (${data.sqft.toLocaleString()} sq ft${data.stories ? `, ${data.stories}-story` : ""})`
    : "";

  return `**${isNew ? "New Construction" : "Restored"} Vision: ${address}, ${neighborhood}**

This ${style ?? "Modern"} ${isNew ? "new build" : "rehabilitation"}${sqftNote} rises from neglect to become a cornerstone of ${neighborhood}'s renaissance.${data.yearBuilt ? ` Honoring the original ${data.yearBuilt} construction,` : ""} the design blends Chicago's rich architectural heritage with 21st-century living.

**Design Highlights:**
${data.bedrooms ? `${data.bedrooms} bedrooms, ` : ""}open-concept kitchen-dining, soaring 9-foot ceilings, and abundant natural light${data.basement ? " with a fully finished basement flex space" : ""}.

**Sustainability:**
Solar-ready roof, triple-pane windows, rainwater harvesting for native landscape — LEED Silver target.

**Community Impact:**
Quality housing added to ${neighborhood}, anchoring continued block-by-block revitalization.

— NanoBanana Architecture × Second Act Chicago`;
}

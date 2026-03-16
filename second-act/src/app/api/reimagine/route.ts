import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { lookupParcel, lookupBuildingFootprint, ParcelData } from "@/lib/cookcounty";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address, neighborhood, propertyType, proposalType, style,
      latitude, longitude, zip,
      viewMode = "exterior",   // "exterior" | "floorplan" | "interior"
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    // ── Fetch real parcel data from Cook County ───────────────────────────────
    let parcel: ParcelData | null = null;
    let footprint: { buildingClass: string | null; floors: number | null; yearBuilt: number | null } | null = null;

    if (address && zip) {
      [parcel, footprint] = await Promise.allSettled([
        lookupParcel(address, zip),
        latitude && longitude ? lookupBuildingFootprint(latitude, longitude) : Promise.resolve(null),
      ]).then((results) => [
        results[0].status === "fulfilled" ? results[0].value : null,
        results[1].status === "fulfilled" ? results[1].value : null,
      ]);
    }

    // Merge parcel + footprint data into a context object
    const realData = buildRealDataContext(parcel, footprint);

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        description: generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData),
        imageBase64: null,
        mimeType: null,
        isDemo: true,
        parcelData: realData,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ── Step 1: Rich architectural description via Gemini Flash ───────────────
    const textResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: buildTextPrompt(address, neighborhood, propertyType, proposalType, style, realData),
    });
    const description = textResponse.text ??
      generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData);

    // ── Step 2: 3D SketchUp-style rendering via Gemini 2.0 ───────────────────
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    try {
      const imagePrompt = buildSketchUpPrompt(
        address, neighborhood, propertyType, proposalType, style, realData, viewMode
      );

      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: imagePrompt,
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
          temperature: 0.9,
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

// ── SketchUp 3D prompt ─────────────────────────────────────────────────────────

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
  const yearLabel = data.yearBuilt ? `, originally built ${data.yearBuilt}` : "";
  const sqftLabel = data.sqft ? `, approx ${data.sqft.toLocaleString()} sq ft` : "";
  const bedsLabel = data.bedrooms ? `, ${data.bedrooms} bedrooms` : "";

  const baseBuilding = `${storiesLabel} Chicago residential building${yearLabel}${sqftLabel}${bedsLabel}`;
  const action = isNew ? "brand new construction" : "fully restored renovation";

  const brandingNote = `Branding watermark in corner: "NanoBanana × Second Act" in small clean sans-serif white text on dark pill badge.`;

  if (viewMode === "floorplan") {
    return `Professional architectural floor plan drawing for a ${storiesLabel} ${style ?? "Modern"} Chicago home in ${neighborhood}. Clean white background with thin black linework. Shows: room layout with labels (Living Room, Kitchen, Dining, ${data.bedrooms ?? 3} Bedrooms, ${Math.ceil((data.bedrooms ?? 3) / 2)} Baths${data.basement ? ", Basement" : ""}), doorways with swing arcs, window placements, staircase. Dimensions noted. North arrow in corner. Scale bar at bottom. Architectural blueprint aesthetic — precise, minimal, professional. ${brandingNote}`;
  }

  if (viewMode === "interior") {
    return `SketchUp-style 3D interior rendering of a ${style ?? "Modern"} ${storiesLabel} Chicago home in ${neighborhood}${sqftLabel}. ${action}. View from the main living area looking toward the open kitchen. Key features: ${styleDesc}. Clean, airy spaces with 9-foot ceilings. Warm natural light from street-facing windows. Architectural visualization style — slightly stylized, clean linework, visible structural elements, not overly photorealistic. Soft ambient lighting with accent warm tones. ${brandingNote}`;
  }

  // Default: exterior 3D SketchUp view
  return `SketchUp Pro 3D architectural model rendering of a ${baseBuilding} in ${neighborhood}, Chicago. This is a ${action} in ${style ?? "Modern"} style: ${styleDesc}. Three-quarter isometric perspective view from street level, showing: full exterior facade, roof structure, window and door openings, front entry steps, landscape strip with native plants. Clean light grey background with subtle ground shadow. Architectural visualization style — semi-stylized like SketchUp, visible geometric forms, clean precise linework, NOT overly photorealistic. Material callout labels with arrows: facade material, roof type, window style. Chicago street context visible at edges. Studio-quality presentation render. ${brandingNote}`;
}

// ── Text description prompt ────────────────────────────────────────────────────

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
    data.sqft ? `${data.sqft.toLocaleString()} sq ft building footprint.` : "",
    data.stories ? `${data.stories} stories.` : "",
    data.bedrooms ? `${data.bedrooms} bedrooms.` : "",
    data.rooms ? `${data.rooms} total rooms.` : "",
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

Write a compelling architectural vision statement for this property. Include:
1. Key design moves that honor the neighborhood's character (reference Chicago's greystone, bungalow, or two-flat traditions)
2. Specific interior highlights using the real room/sqft data above if available
3. 2-3 sustainability features
4. Community impact on ${neighborhood}
5. Estimated project cost range

Sign off with: "— NanoBanana Architecture × Second Act Chicago"
Under 280 words. Make it feel like a premium architect's project summary.`;
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
  const sqftNote = data.sqft ? ` (${data.sqft.toLocaleString()} sq ft` + (data.stories ? `, ${data.stories}-story)` : ")") : "";

  return `**${isNew ? "New Construction" : "Restored"} Vision: ${address}, ${neighborhood}**

This ${style ?? "Modern"} ${isNew ? "new build" : "rehabilitation"}${sqftNote} rises from neglect to become a cornerstone of ${neighborhood}'s renaissance.${data.yearBuilt ? ` Honoring the original ${data.yearBuilt} construction,` : ""} the ${isNew ? "design" : "restoration"} blends Chicago's rich architectural heritage with 21st-century living.

**Design Highlights:**
${data.bedrooms ? `${data.bedrooms} bedrooms, ` : ""}open-concept kitchen-dining, soaring 9-foot ceilings, and abundant natural light${data.basement ? " with a fully finished basement flex space" : ""}.

**Sustainability:**
Solar-ready roof, triple-pane windows, rainwater harvesting for native landscape — LEED Silver target.

**Community Impact:**
Quality housing added to ${neighborhood}, anchoring continued block-by-block revitalization.

— NanoBanana Architecture × Second Act Chicago`;
}

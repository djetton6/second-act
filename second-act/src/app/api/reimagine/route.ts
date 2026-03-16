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
    if (buffer.byteLength < 8000) return null;

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

    // ── Fetch parcel data + Street View in parallel ──────────────────────────
    const [parcelResult, footprintResult, streetViewResult] =
      await Promise.allSettled([
        address && zip ? lookupParcel(address, zip) : Promise.resolve(null),
        latitude && longitude ? lookupBuildingFootprint(latitude, longitude) : Promise.resolve(null),
        latitude && longitude ? fetchStreetViewBase64(latitude, longitude) : Promise.resolve(null),
      ]);

    const parcel: ParcelData | null =
      parcelResult.status === "fulfilled" ? parcelResult.value : null;
    const footprint =
      footprintResult.status === "fulfilled" ? footprintResult.value : null;
    const streetView =
      streetViewResult.status === "fulfilled" ? streetViewResult.value : null;

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

    // ── Step 1: Vision analysis of Street View photo (if available) ──────────
    let description: string;

    if (streetView) {
      const visionResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: streetView.mimeType, data: streetView.data } },
              { text: buildVisionTextPrompt(address, neighborhood, propertyType, proposalType, style, realData) },
            ],
          },
        ],
      });
      description =
        visionResponse.text ??
        generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData);
    } else {
      const textResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: buildTextPrompt(address, neighborhood, propertyType, proposalType, style, realData),
      });
      description =
        textResponse.text ??
        generateMockDescription(address, neighborhood, propertyType, proposalType, style, realData);
    }

    // ── Step 2: 3D SketchUp-style image generation ───────────────────────────
    // Text-only prompt for consistent SketchUp architectural renders
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    const sketchPrompt = buildSketchUpPrompt(
      address, neighborhood, propertyType, proposalType, style, realData, viewMode,
      hasStreetView ? description : undefined
    );

    // Try Gemini 2.0 Flash image generation
    try {
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts: [{ text: sketchPrompt }] }],
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
          temperature: 0.8,
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
    } catch (geminiErr) {
      console.warn("Gemini 2.0 image generation failed, trying Imagen:", geminiErr);
    }

    // Fallback: Imagen 3
    if (!imageBase64) {
      try {
        const imagenResponse = await ai.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: sketchPrompt,
          config: {
            numberOfImages: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg",
          },
        });
        const imgBytes = imagenResponse.generatedImages?.[0]?.image?.imageBytes;
        if (imgBytes) {
          imageBase64 = typeof imgBytes === "string"
            ? imgBytes
            : Buffer.from(imgBytes as Uint8Array).toString("base64");
          mimeType = "image/jpeg";
        }
      } catch (imagenErr) {
        console.warn("Imagen generation also failed:", imagenErr);
      }
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

// ── SketchUp 3D render prompt — used for ALL view modes ──────────────────────

function buildSketchUpPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style: string | undefined,
  data: RealDataContext,
  viewMode: string,
  visionDescription?: string
): string {
  const isNew = proposalType === "new_construction";
  const selectedStyle = style ?? "Modern";

  const styleDetails: Record<string, { materials: string; colors: string; features: string }> = {
    "Modern": {
      materials: "flat roof, floor-to-ceiling windows, dark steel and glass panels, white stucco panels",
      colors: "charcoal grey, white, glass-blue reflections, black steel accents",
      features: "rooftop deck, recessed entry, horizontal wood slat fence",
    },
    "Greystone": {
      materials: "authentic Chicago limestone facade, ornate carved stone cornice, bay windows, classic Chicago two-flat profile",
      colors: "warm grey limestone, white trim, dark window frames",
      features: "front stoop with stone balustrades, arched entry, decorative keystones",
    },
    "Prairie": {
      materials: "low-pitched hipped roof with wide overhanging eaves, horizontal banding, natural earth tones, Frank Lloyd Wright Prairie vocabulary",
      colors: "warm ochre, brown, natural tan, deep green accents",
      features: "ribbon windows, brick chimney, low garden walls extending from building",
    },
    "Industrial": {
      materials: "exposed Chicago common brick, large industrial steel-frame casement windows, raw concrete sill details, reclaimed wood accents",
      colors: "deep red brick, black steel frames, weathered grey concrete",
      features: "roll-up garage-style entry, exposed structural steel beam, corrugated metal awning",
    },
    "Craftsman": {
      materials: "welcoming covered front porch with thick square craftsman columns, exposed rafter tails, cedar shingle siding, warm wood details",
      colors: "warm brown, cream, forest green, natural wood tones",
      features: "wide front porch, craftsman entry door, window flower boxes, stone porch piers",
    },
  };

  const sd = styleDetails[selectedStyle] ?? styleDetails["Modern"];
  const storiesLabel = data.stories ? `${data.stories}-story` : (isNew ? "3-story" : "2-story");
  const sqftLabel = data.sqft ? `, approx ${data.sqft.toLocaleString()} sq ft` : "";
  const bedsLabel = data.bedrooms ? `, ${data.bedrooms} bedrooms` : "";

  const contextNote = visionDescription
    ? `\n\nProperty context from Street View analysis: ${visionDescription.split("\n").slice(0, 2).join(" ")}`
    : "";

  const brandingBadge = `Include a small badge in the bottom-right corner reading "NanoBanana × Second Act" in white text on a dark semi-transparent rounded pill.`;

  if (viewMode === "floorplan") {
    return `Create a professional architectural floor plan drawing for a ${storiesLabel} ${selectedStyle} Chicago residential building in ${neighborhood}${sqftLabel}${bedsLabel}. ${isNew ? "New construction" : "Renovation/rehabilitation"}.

Rendering style: Clean white background with thin black linework. Architectural blueprint aesthetic — precise and minimal, like a real permit-set drawing.
Layout includes: Room outlines with labels — Living Room, Open Kitchen, Dining, ${data.bedrooms ?? 3} Bedrooms, ${Math.ceil((data.bedrooms ?? 3) / 2)} Baths${data.basement ? ", Basement" : ""}, Utility/Laundry, front entry vestibule.
Annotations: Doorway swing arcs, window placements, staircase (if multi-story), closets, room dimension labels.
Details: North arrow in corner, scale bar at bottom-left.

${brandingBadge}`;
  }

  if (viewMode === "interior") {
    return `Create a SketchUp Pro 3D interior architectural visualization for a ${storiesLabel} ${selectedStyle} Chicago home in ${neighborhood}${sqftLabel}. ${isNew ? "Brand new construction" : "Fully restored renovation"}.${contextNote}

Camera: Standing in the main living area looking toward the open kitchen and dining zone. Wide-angle perspective showing depth.
Materials: ${sd.materials}
Colors: ${sd.colors}
Key features: 9-foot ceilings, natural light from street-facing windows, open floor plan, ${sd.features}, hardwood floors, exposed structural details.

Rendering style: SketchUp Pro architectural 3D visualization — clean geometric forms, semi-stylized materials (slightly simplified, not hyper-realistic), bright environment lighting, white/neutral ceiling and walls, visible room structure. Professional architectural presentation quality.

${brandingBadge}`;
  }

  // Exterior — main SketchUp render
  return `Create a SketchUp Pro 3D architectural exterior visualization of a ${storiesLabel} ${selectedStyle} Chicago residential building.

Address: ${address}, ${neighborhood}, Chicago, IL
Building: ${isNew ? "New construction on previously vacant/abandoned site" : "Fully renovated building"}${sqftLabel}${bedsLabel}${contextNote}

Architectural style details:
- Materials: ${sd.materials}
- Color palette: ${sd.colors}
- Signature features: ${sd.features}
- Landscaping: Native Chicago landscaping strip, front entry steps with iron railings, mailbox post, sidewalk, street trees in grates

Camera angle: Three-quarter perspective from street level — slightly elevated viewpoint showing full front facade and one side. Chicago urban streetscape visible at edges (neighboring brick buildings, utility poles, sidewalk curb).

Rendering style: SketchUp Pro 3D architectural model render — clean geometric forms with semi-stylized materials, slightly stylized (NOT photo-realistic), clean neutral sky background with warm afternoon sunlight from the southwest, soft ground shadows. Professional architectural visualization — the kind used in developer presentations and permit applications.

${brandingBadge}`;
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

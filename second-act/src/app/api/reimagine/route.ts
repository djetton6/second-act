import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address, neighborhood, propertyType, proposalType, style,
      streetViewUrl,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        description: generateMockDescription(address, neighborhood, propertyType, proposalType, style),
        imageBase64: null,
        mimeType: null,
        isDemo: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ── Step 1: Text description via Gemini 1.5 Flash ──────────────────────
    const textModel = ai.models;
    const textResponse = await textModel.generateContent({
      model: "gemini-1.5-flash",
      contents: buildTextPrompt(address, neighborhood, propertyType, proposalType, style),
    });
    const description = textResponse.text ?? generateMockDescription(address, neighborhood, propertyType, proposalType, style);

    // ── Step 2: AI image generation via Gemini 2.0 Flash ───────────────────
    let imageBase64: string | null = null;
    let mimeType = "image/png";

    try {
      const imagePrompt = buildImagePrompt(address, neighborhood, propertyType, proposalType, style);
      const imageResponse = await textModel.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: imagePrompt,
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
          temperature: 1,
        },
      });

      const candidates = imageResponse.candidates ?? [];
      for (const candidate of candidates) {
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
      console.warn("Image generation failed, returning text only:", imgErr);
    }

    return NextResponse.json({
      success: true,
      description,
      imageBase64,
      mimeType,
      isDemo: false,
    });
  } catch (error) {
    console.error("Reimagine API error:", error);
    return NextResponse.json({ error: "Failed to generate reimagining" }, { status: 500 });
  }
}

function buildTextPrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style?: string
): string {
  const isNew = proposalType === "new_construction";
  return `You are an expert architect and urban planner specializing in Chicago neighborhood revitalization.

Property: ${address}, ${neighborhood}, Chicago, IL
Type: ${propertyType === "vacant_lot" ? "Vacant Lot" : "Abandoned Building"}
Proposal: ${isNew ? "New Construction" : "Renovation/Rehabilitation"}
Architectural Style: ${style || "Modern Chicago"}

Generate a vivid, inspiring description of how this property could be reimagined. Include:
1. Architectural style and exterior design features (reference Chicago's greystone, bungalow, or two-flat traditions if relevant)
2. Interior highlights and room layout
3. Sustainable/green features
4. Estimated square footage
5. Community impact on ${neighborhood}

Keep it under 250 words. Make it feel like a premium real estate listing meets an architect's vision statement.`;
}

function buildImagePrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style?: string
): string {
  const isNew = proposalType === "new_construction";
  const styleMap: Record<string, string> = {
    "Modern": "contemporary minimalist with dark steel and glass accents",
    "Greystone": "classic Chicago greystone limestone facade with ornate cornice",
    "Prairie": "Frank Lloyd Wright Prairie style with horizontal lines and overhanging eaves",
    "Industrial": "industrial-chic converted loft with exposed brick and metal",
    "Craftsman": "warm craftsman bungalow with wood details and covered front porch",
  };
  const styleDesc = styleMap[style ?? "Modern"] ?? "contemporary Chicago residential";

  if (isNew) {
    return `Photorealistic architectural rendering of a brand new ${styleDesc} home built on a vacant lot in ${neighborhood}, Chicago. The home has a welcoming front facade facing a tree-lined Chicago street, warm golden hour lighting, manicured front garden with native plants, Chicago neighborhood context visible on both sides. Professional architectural photography, 8K resolution, highly detailed, magazine quality.`;
  } else {
    return `Photorealistic architectural rendering of a beautifully renovated ${styleDesc} building in ${neighborhood}, Chicago. The exterior has been completely restored — fresh masonry, new windows matching the historic profile, updated landscaping with native Chicago plants, warm late afternoon lighting. Before: abandoned and boarded up. After: fully restored and inviting. Professional real estate photography, 8K resolution, magazine quality.`;
  }
}

function generateMockDescription(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style?: string
): string {
  const isNew = proposalType === "new_construction";
  const styleLabels: Record<string, string> = {
    "Modern": "sleek contemporary",
    "Greystone": "classic Chicago greystone",
    "Prairie": "Frank Lloyd Wright-inspired Prairie",
    "Industrial": "industrial-chic converted",
    "Craftsman": "warm craftsman bungalow",
  };
  const styleDesc = styleLabels[style ?? "Modern"] ?? "modern";

  if (isNew) {
    return `**Reimagined Vision: ${address}, ${neighborhood}**

This ${styleDesc} new construction rises from what was once a vacant lot to become a cornerstone of ${neighborhood}'s renaissance. Standing three stories tall, the home features a striking facade with floor-to-ceiling windows flooding the interior with Chicago's legendary golden light.

**Design Highlights:**
The open-concept ground floor flows from a chef's kitchen — quartz countertops, professional appliances — to a living area with soaring 10-foot ceilings. Smart-home integration powers every convenience.

**Sustainability:**
Solar panels generate 80% of the home's energy needs. Rainwater harvesting feeds the drought-resistant native garden, earning LEED Silver certification and reducing utility costs by 45%.

**Community Impact:**
2,400 sq ft of quality housing added to ${neighborhood}, contributing to the neighborhood tax base while anchoring continued revitalization.`;
  } else {
    return `**Restored Vision: ${address}, ${neighborhood}**

This ${styleDesc} rehabilitation breathes new life into one of ${neighborhood}'s most storied structures. The exterior's original masonry has been meticulously restored — every cornice and bay window returned to its 1920s glory — while the interior has been completely reimagined for 21st-century living.

**Architectural Preservation:**
Original pressed-tin ceilings, polished to a warm luster, crown living spaces where exposed brick meets modern minimalism. Three bedrooms, two full baths, and an open kitchen-dining area create 1,850 sq ft of thoughtful living space.

**Modern Updates:**
New electrical, plumbing, and HVAC systems. Triple-pane windows maintain the historic facade while slashing energy bills. A finished basement adds 600 sq ft of flexible space.`;
  }
}

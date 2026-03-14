import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, neighborhood, propertyType, proposalType, style } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      // Return a structured mock response when no API key is available
      return NextResponse.json({
        success: true,
        description: generateMockDescription(address, neighborhood, propertyType, proposalType, style),
        renderingUrl: null,
        isDemo: true,
        prompt: buildImagePrompt(address, neighborhood, propertyType, proposalType, style),
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert architect and urban planner specializing in Chicago neighborhood revitalization.

    Property: ${address}, ${neighborhood}, Chicago, IL
    Type: ${propertyType === "vacant_lot" ? "Vacant Lot" : "Abandoned Building"}
    Proposal: ${proposalType === "new_construction" ? "New Construction" : "Renovation/Rehabilitation"}
    Style: ${style || "Modern Chicago"}

    Generate a detailed, inspiring description of how this property could be reimagined. Include:
    1. Architectural style and design features
    2. Interior highlights
    3. Sustainable/green features
    4. Community impact
    5. Estimated square footage and rooms
    6. Special Chicago architectural elements (greystone, bungalow, etc.)

    Make it vivid, professional, and inspiring — like a high-end real estate listing combined with an architect's vision. Keep it under 300 words.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      description: text,
      renderingUrl: null,
      isDemo: false,
      prompt: buildImagePrompt(address, neighborhood, propertyType, proposalType, style),
    });
  } catch (error) {
    console.error("Reimagine API error:", error);
    return NextResponse.json(
      { error: "Failed to generate reimagining" },
      { status: 500 }
    );
  }
}

function buildImagePrompt(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style?: string
): string {
  const isNew = proposalType === "new_construction";
  const styleDesc = style || "Modern Chicago contemporary";

  return `${styleDesc} ${isNew ? "newly constructed" : "beautifully renovated"} ${
    propertyType === "vacant_lot" ? "home on vacant lot" : "restored building"
  } at ${address} in ${neighborhood}, Chicago. Golden hour photography, architectural photography, welcoming front facade, Chicago neighborhood context, photorealistic, high resolution, professional real estate photography.`;
}

function generateMockDescription(
  address: string,
  neighborhood: string,
  propertyType: string,
  proposalType: string,
  style?: string
): string {
  const isNew = proposalType === "new_construction";
  const styles: Record<string, string> = {
    "Modern": "sleek contemporary",
    "Greystone": "classic Chicago greystone",
    "Prairie": "Frank Lloyd Wright-inspired Prairie",
    "Industrial": "industrial-chic converted",
    "Craftsman": "warm craftsman bungalow",
  };
  const styleDesc = styles[style || "Modern"] || "modern";

  if (isNew) {
    return `**Reimagined Vision: ${address}, ${neighborhood}**

This ${styleDesc} new construction rises from what was once a vacant lot to become a cornerstone of ${neighborhood}'s renaissance. Standing three stories tall, the home features a striking facade of locally-sourced brick and floor-to-ceiling windows that flood the interior with Chicago's legendary golden light.

**Design Highlights:**
The open-concept ground floor flows seamlessly from a chef's kitchen — outfitted with quartz countertops and professional appliances — to a living area with soaring 10-foot ceilings. Original architectural details honor Chicago's rich building heritage while smart-home integration powers every modern convenience.

**Sustainability:**
Solar panels on the green roof generate 80% of the home's energy needs. A rainwater harvesting system feeds the drought-resistant native garden, earning LEED Silver certification and reducing utility costs by 45%.

**Community Impact:**
This home brings 2,400 sq ft of quality housing back to ${neighborhood}, contributing to the neighborhood's $2.1M tax base while providing an anchor for continued revitalization. A dedicated community garden plot along the south facade creates green space for neighbors.

*"Architecture is the will of an epoch translated into space." — Mies van der Rohe, Chicago's own.*`;
  } else {
    return `**Restored Vision: ${address}, ${neighborhood}**

This ${styleDesc} rehabilitation breathes new life into one of ${neighborhood}'s most storied structures. The exterior's original masonry has been meticulously restored — every cornice, lintel, and bay window returned to its 1920s glory — while the interior has been completely reimagined for 21st-century living.

**Architectural Preservation:**
The building's original pressed-tin ceilings, now polished to a warm luster, crown living spaces where exposed brick meets modern minimalism. Three bedrooms, two full baths, and an open kitchen-dining area create 1,850 sq ft of thoughtful living space. The original staircase — salvaged and refinished with reclaimed white oak treads — anchors the home's historic soul.

**Modern Updates:**
New electrical, plumbing, and HVAC systems meet today's highest standards. Triple-pane windows maintain the facade's historic proportions while slashing energy bills. A finished basement adds 600 sq ft of flexible space.

**Neighborhood Fabric:**
This restoration preserves the block's historic streetscape while delivering a move-in-ready home that ${neighborhood} can be proud of. Estimated renovation cost payback: 7 years.`;
  }
}

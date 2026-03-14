import { NextRequest, NextResponse } from "next/server";
import { fetchChicagoProperties, CHICAGO_NEIGHBORHOODS } from "@/lib/chicago-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get("neighborhood") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "30");
  const type = searchParams.get("type") || undefined;

  try {
    let properties = await fetchChicagoProperties(neighborhood, Math.min(limit, 100));

    // Filter by search (address or zip)
    if (search) {
      const q = search.toLowerCase();
      properties = properties.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.zip.includes(q) ||
          p.neighborhood.toLowerCase().includes(q)
      );
    }

    // Filter by type
    if (type && (type === "vacant_lot" || type === "abandoned_building")) {
      properties = properties.filter((p) => p.propertyType === type);
    }

    return NextResponse.json({
      properties,
      total: properties.length,
      neighborhoods: CHICAGO_NEIGHBORHOODS.map((n) => n.name),
    });
  } catch (error) {
    console.error("Properties API error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

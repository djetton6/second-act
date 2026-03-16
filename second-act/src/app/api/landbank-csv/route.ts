import { NextResponse } from "next/server";
import { FULL_CCLBA_CSV } from "@/lib/landbank-data";

export async function GET() {
  return new NextResponse(FULL_CCLBA_CSV, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="cook-county-land-bank-inventory.csv"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

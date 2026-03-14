import { NextRequest, NextResponse } from "next/server";

// In-memory store for bids (in production, use a database)
const bids: Map<string, Array<{
  id: string;
  propertyId: string;
  bidderName: string;
  bidderEmail: string;
  bidderZip: string;
  amount: number;
  timestamp: string;
  isLocalResident: boolean;
  proposalType: string;
  message?: string;
}>> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, bidderName, bidderEmail, bidderZip, amount, proposalType, message, propertyZip } = body;

    if (!propertyId || !bidderName || !bidderEmail || !bidderZip || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount < 100) {
      return NextResponse.json({ error: "Minimum bid is $100" }, { status: 400 });
    }

    const isLocalResident = propertyZip && bidderZip === propertyZip;

    const bid = {
      id: `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      propertyId,
      bidderName,
      bidderEmail,
      bidderZip,
      amount,
      timestamp: new Date().toISOString(),
      isLocalResident: !!isLocalResident,
      proposalType: proposalType || "renovation",
      message,
    };

    const existing = bids.get(propertyId) || [];

    // Check if bid is higher than current highest
    const highestBid = existing.length > 0
      ? Math.max(...existing.map((b) => b.amount))
      : 0;

    if (amount <= highestBid && !isLocalResident) {
      return NextResponse.json({
        error: `Bid must be higher than current highest bid of $${highestBid.toLocaleString()}`,
      }, { status: 400 });
    }

    existing.push(bid);
    bids.set(propertyId, existing);

    return NextResponse.json({
      success: true,
      bid,
      isLocalPriority: isLocalResident,
      message: isLocalResident
        ? "Your bid has priority status as a local resident!"
        : "Bid submitted successfully. Local residents receive priority consideration.",
    });
  } catch (error) {
    console.error("Bid API error:", error);
    return NextResponse.json({ error: "Failed to submit bid" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json({ error: "propertyId required" }, { status: 400 });
  }

  const propertyBids = bids.get(propertyId) || [];
  const sorted = [...propertyBids].sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    bids: sorted,
    highestBid: sorted[0]?.amount || 0,
    totalBids: sorted.length,
    hasLocalBids: sorted.some((b) => b.isLocalResident),
  });
}

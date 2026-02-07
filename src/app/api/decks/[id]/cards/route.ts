import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/decks/[id]/cards — fetch all cards for a deck
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cards = await prisma.card.findMany({
    where: { deckId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

// POST /api/decks/[id]/cards — create a new card
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { front, back } = await request.json();

  if (!front || typeof front !== "string" || !front.trim()) {
    return NextResponse.json({ error: "Front is required" }, { status: 400 });
  }

  if (!back || typeof back !== "string" || !back.trim()) {
    return NextResponse.json({ error: "Back is required" }, { status: 400 });
  }

  const card = await prisma.card.create({
    data: { front: front.trim(), back: back.trim(), deckId: id },
  });

  return NextResponse.json(card, { status: 201 });
}

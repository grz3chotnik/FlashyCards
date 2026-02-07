import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/decks — fetch all decks with card count
export async function GET() {
  const decks = await prisma.deck.findMany({
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(decks);
}

// POST /api/decks — create a new deck
export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const deck = await prisma.deck.create({
    data: { name: name.trim() },
  });

  return NextResponse.json(deck, { status: 201 });
}

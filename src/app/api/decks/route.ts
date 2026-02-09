import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/decks — fetch all decks with card count for the authenticated user
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: {
          cards: true,
        },
      },
      cards: {
        where: {
          due: { lte: new Date() },
        },
        select: { id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Transform to include dueCount
  const decksWithDueCount = decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
    userId: deck.userId,
    _count: {
      cards: deck._count.cards,
      dueCards: deck.cards.length,
    },
  }));

  return NextResponse.json(decksWithDueCount);
}

// POST /api/decks — create a new deck for the authenticated user
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const deck = await prisma.deck.create({
    data: {
      name: name.trim(),
      userId: user.id,
    },
  });

  return NextResponse.json(deck, { status: 201 });
}

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

  // Calculate study streak from review logs
  const reviewDates = await prisma.reviewLog.findMany({
    where: {
      card: { deck: { userId: user.id } },
    },
    select: { review: true },
    orderBy: { review: "desc" },
  });

  let streak = 0;
  if (reviewDates.length > 0) {
    const uniqueDays = new Set(
      reviewDates.map((r) => r.review.toISOString().slice(0, 10))
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Streak starts from today or yesterday
    if (uniqueDays.has(todayStr)) {
      streak = 1;
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      while (uniqueDays.has(d.toISOString().slice(0, 10))) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
    } else if (uniqueDays.has(yesterdayStr)) {
      streak = 1;
      const d = new Date(yesterday);
      d.setDate(d.getDate() - 1);
      while (uniqueDays.has(d.toISOString().slice(0, 10))) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
    }
  }

  return NextResponse.json({ decks: decksWithDueCount, streak });
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

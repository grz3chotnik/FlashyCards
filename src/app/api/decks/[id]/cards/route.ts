import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmptyCard } from "ts-fsrs";
import { getCurrentUser } from "@/lib/auth";

// GET /api/decks/[id]/cards — fetch all cards for a deck (only if owned by user)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify deck belongs to user
  const deck = await prisma.deck.findUnique({
    where: { id },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  if (deck.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dueOnly = searchParams.get("due") === "true";

  const where: any = { deckId: id };

  if (dueOnly) {
    where.due = { lte: new Date() };
  }

  const cards = await prisma.card.findMany({
    where,
    orderBy: dueOnly ? { due: "asc" } : { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

// POST /api/decks/[id]/cards — create a new card (only if deck is owned by user)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify deck belongs to user
  const deck = await prisma.deck.findUnique({
    where: { id },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  if (deck.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { front, back } = await request.json();

  if (!front || typeof front !== "string" || !front.trim()) {
    return NextResponse.json({ error: "Front is required" }, { status: 400 });
  }

  if (!back || typeof back !== "string" || !back.trim()) {
    return NextResponse.json({ error: "Back is required" }, { status: 400 });
  }

  // Initialize FSRS state for new card
  const emptyFSRSCard = createEmptyCard();

  const card = await prisma.card.create({
    data: {
      front: front.trim(),
      back: back.trim(),
      deckId: id,
      // Initialize FSRS fields
      due: emptyFSRSCard.due,
      stability: emptyFSRSCard.stability,
      difficulty: emptyFSRSCard.difficulty,
      elapsedDays: emptyFSRSCard.elapsed_days,
      scheduledDays: emptyFSRSCard.scheduled_days,
      reps: emptyFSRSCard.reps,
      lapses: emptyFSRSCard.lapses,
      state: emptyFSRSCard.state,
      lastReview: emptyFSRSCard.last_review,
      learningSteps: emptyFSRSCard.learning_steps,
    },
  });

  return NextResponse.json(card, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FSRS, Rating } from "ts-fsrs";
import { toFSRSCard, toPrismaCard } from "@/types/fsrs";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, cardId } = await params;

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

    const { rating } = await request.json();

    // Validate rating
    if (![Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].includes(rating)) {
      return NextResponse.json(
        { error: "Invalid rating" },
        { status: 400 }
      );
    }

    // Fetch card
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card || card.deckId !== id) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // Convert to FSRS format
    const fsrsCard = toFSRSCard(card);

    // Initialize FSRS and calculate next schedule
    const fsrs = new FSRS({});
    const now = new Date();
    const result = fsrs.next(fsrsCard, now, rating);

    // Update card in database
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: toPrismaCard(result.card),
    });

    // Save review log
    await prisma.reviewLog.create({
      data: {
        cardId: cardId,
        rating: result.log.rating,
        state: result.log.state,
        due: result.log.due,
        stability: result.log.stability,
        difficulty: result.log.difficulty,
        elapsedDays: result.log.elapsed_days,
        lastElapsedDays: result.log.last_elapsed_days,
        scheduledDays: result.log.scheduled_days,
        review: result.log.review,
      },
    });

    return NextResponse.json({
      card: updatedCard,
      nextDue: result.card.due,
      scheduledDays: result.card.scheduled_days,
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}

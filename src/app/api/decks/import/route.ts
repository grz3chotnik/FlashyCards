import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmptyCard } from "ts-fsrs";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, cards } = body;

    // Validate deck name
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Deck name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate cards array
    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: "At least one card is required" },
        { status: 400 }
      );
    }

    // Validate each card
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (!card.front || typeof card.front !== "string" || !card.front.trim()) {
        return NextResponse.json(
          { error: `Card ${i + 1}: front is required and must be a non-empty string` },
          { status: 400 }
        );
      }

      if (!card.back || typeof card.back !== "string" || !card.back.trim()) {
        return NextResponse.json(
          { error: `Card ${i + 1}: back is required and must be a non-empty string` },
          { status: 400 }
        );
      }
    }

    // Use transaction for atomicity (all-or-nothing)
    const result = await prisma.$transaction(async (tx) => {
      // Create deck
      const deck = await tx.deck.create({
        data: {
          name: name.trim(),
          userId: user.id,
        },
      });

      // Initialize FSRS state for each card
      const emptyCard = createEmptyCard();

      // Bulk insert cards
      await tx.card.createMany({
        data: cards.map((card: { front: string; back: string }) => ({
          deckId: deck.id,
          front: card.front.trim(),
          back: card.back.trim(),
          // Initialize FSRS state
          due: emptyCard.due,
          stability: emptyCard.stability,
          difficulty: emptyCard.difficulty,
          elapsedDays: emptyCard.elapsed_days,
          scheduledDays: emptyCard.scheduled_days,
          reps: emptyCard.reps,
          lapses: emptyCard.lapses,
          state: emptyCard.state,
          lastReview: emptyCard.last_review,
        })),
      });

      return { deck, cardsCreated: cards.length };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error importing deck:", error);
    return NextResponse.json(
      { error: "Failed to import deck" },
      { status: 500 }
    );
  }
}

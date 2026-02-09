import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH /api/decks/[id]/cards/[cardId] — update a card (only if deck is owned by user)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
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

  const card = await prisma.card.findFirst({
    where: { id: cardId, deckId: id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const { front, back } = await request.json();

  if (!front || typeof front !== "string" || !front.trim()) {
    return NextResponse.json({ error: "Front is required" }, { status: 400 });
  }

  if (!back || typeof back !== "string" || !back.trim()) {
    return NextResponse.json({ error: "Back is required" }, { status: 400 });
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { front, back },
  });

  return NextResponse.json(updated);
}

// DELETE /api/decks/[id]/cards/[cardId] — delete a card (only if deck is owned by user)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
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

  const card = await prisma.card.findFirst({
    where: { id: cardId, deckId: id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: cardId } });

  return NextResponse.json({ success: true });
}

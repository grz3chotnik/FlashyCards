import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/decks/[id]/cards/[cardId] — update a card
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const { id, cardId } = await params;
  const { front, back } = await request.json();

  const card = await prisma.card.findFirst({
    where: { id: cardId, deckId: id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

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

// DELETE /api/decks/[id]/cards/[cardId] — delete a card
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  const { id, cardId } = await params;

  const card = await prisma.card.findFirst({
    where: { id: cardId, deckId: id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: cardId } });

  return NextResponse.json({ success: true });
}

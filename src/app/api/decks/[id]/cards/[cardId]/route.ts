import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

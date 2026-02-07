import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/decks/[id] — delete a deck and its cards
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deck = await prisma.deck.findUnique({ where: { id } });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  await prisma.deck.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

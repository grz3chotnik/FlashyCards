"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@base-ui/react/button";
import { Separator } from "@base-ui/react/separator";
import { useQuery } from "@tanstack/react-query";

type Card = {
  id: string;
  front: string;
  back: string;
};

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const { data: cards = [], isLoading } = useQuery<Card[]>({
    queryKey: ["decks", id, "cards"],
    queryFn: () => fetch(`/api/decks/${id}/cards`).then((r) => r.json()),
  });

  const card = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  function handleRate() {
    setRevealed(false);
    setCurrentIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-4 py-12">
      <div className="mb-8 flex w-full items-center justify-between">
        <Link
          href="/decks"
          className="text-sm text-foreground/50 hover:text-foreground"
        >
         Back to decks
        </Link>
        <span className="text-sm text-foreground/40">
          {Math.min(currentIndex + 1, cards.length)} / {cards.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-foreground/40">Loading cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-foreground/50">No cards in this deck yet.</p>
          <Button
            render={<Link href={`/decks/${id}/cards`} />}
            className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
            nativeButton={false}
          >
            Add cards
          </Button>
        </div>
      ) : isFinished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl font-semibold">Session complete!</p>
          <p className="text-foreground/50">
            You reviewed all {cards.length} cards.
          </p>
          <Button
            render={<Link href="/decks" />}
            className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
            nativeButton={false}
          >
            Back to decks
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-1 flex-col items-center gap-6">
          {/* Card */}
          <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-foreground/10 p-8">
            <div
              className="prose prose-invert text-center text-lg"
              dangerouslySetInnerHTML={{ __html: card.front }}
            />

            {revealed && (
              <>
                <Separator className="my-6 h-px w-full bg-foreground/10" />
                <div
                  className="prose prose-invert text-center text-lg font-semibold"
                  dangerouslySetInnerHTML={{ __html: card.back }}
                />
              </>
            )}
          </div>

          {/* Controls */}
          {!revealed ? (
            <Button
              onClick={() => setRevealed(true)}
              className="flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
            >
              Show Answer
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={handleRate}
                className="flex h-10 items-center justify-center rounded-md border border-red-400/30 px-4 text-base font-medium text-red-500 select-none hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-red-500/20"
              >
                Again
              </Button>
              <Button
                onClick={handleRate}
                className="flex h-10 items-center justify-center rounded-md border border-orange-400/30 px-4 text-base font-medium text-orange-500 select-none hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-orange-500/20"
              >
                Hard
              </Button>
              <Button
                onClick={handleRate}
                className="flex h-10 items-center justify-center rounded-md border border-green-400/30 px-4 text-base font-medium text-green-500 select-none hover:bg-green-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-green-500/20"
              >
                Good
              </Button>
              <Button
                onClick={handleRate}
                className="flex h-10 items-center justify-center rounded-md border border-blue-400/30 px-4 text-base font-medium text-blue-500 select-none hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-blue-500/20"
              >
                Easy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

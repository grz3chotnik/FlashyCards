"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@base-ui/react/button";
import { Separator } from "@base-ui/react/separator";

const PLACEHOLDER_CARDS = [
  { id: "1", front: "What is the capital of France?", back: "Paris" },
  { id: "2", front: "What is 2 + 2?", back: "4" },
  { id: "3", front: "test test", back: "Test" },
];

export default function StudyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = PLACEHOLDER_CARDS[currentIndex];
  const isFinished = currentIndex >= PLACEHOLDER_CARDS.length;

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
          {Math.min(currentIndex + 1, PLACEHOLDER_CARDS.length)} /{" "}
          {PLACEHOLDER_CARDS.length}
        </span>
      </div>

      {isFinished ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl font-semibold">Session complete!</p>
          <p className="text-foreground/50">
            You reviewed all {PLACEHOLDER_CARDS.length} cards.
          </p>
          <Button
            render={<Link href="/decks" />}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:bg-foreground/90"
          >
            Back to decks
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-1 flex-col items-center gap-6">
          {/* Card */}
          <div className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border border-foreground/10 p-8">
            <p className="text-center text-lg">{card.front}</p>

            {revealed && (
              <>
                <Separator className="my-6 h-px w-full bg-foreground/10" />
                <p className="text-center text-lg font-semibold">
                  {card.back}
                </p>
              </>
            )}
          </div>

          {/* Controls */}
          {!revealed ? (
            <Button
              onClick={() => setRevealed(true)}
              className="rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background hover:bg-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:bg-foreground/90"
            >
              Show Answer
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleRate}
                className="rounded-md border border-red-400/30 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Again
              </Button>
              <Button
                onClick={handleRate}
                className="rounded-md border border-orange-400/30 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Hard
              </Button>
              <Button
                onClick={handleRate}
                className="rounded-md border border-green-400/30 px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Good
              </Button>
              <Button
                onClick={handleRate}
                className="rounded-md border border-blue-400/30 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
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

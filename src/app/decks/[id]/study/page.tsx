"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@base-ui/react/button";
import { Separator } from "@base-ui/react/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rating } from "ts-fsrs";
import { Skeleton } from "@/components/skeleton";

type Card = {
  id: string;
  front: string;
  back: string;
};

export default function StudyPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Fetch only due cards
  const { data: cards = [], isLoading } = useQuery<Card[]>({
    queryKey: ["decks", id, "cards", "due"],
    queryFn: () => fetch(`/api/decks/${id}/cards?due=true`).then((r) => r.json()),
  });

  // Mutation to submit review
  const reviewMutation = useMutation({
    mutationFn: async ({ cardId, rating }: { cardId: string; rating: number }) => {
      const res = await fetch(`/api/decks/${id}/cards/${cardId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate due cards query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["decks", id, "cards", "due"] });

      // Reset reveal state - don't increment index since the array shifts after refetch
      setRevealed(false);
    },
  });

  const card = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  const handleRate = (rating: number) => {
    if (!card) return;
    reviewMutation.mutate({ cardId: card.id, rating });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center px-4 py-12">
      <div className="mb-8 flex w-full items-center justify-between">
        <Link
          href="/decks"
          className="text-sm text-foreground/50 hover:text-foreground"
        >
          ← Back to decks
        </Link>
        <span className="text-sm text-foreground/40">
          {Math.min(currentIndex + 1, cards.length)} / {cards.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex w-full flex-1 flex-col items-center gap-6">
          <div className="flex w-full max-h-[600px] flex-col rounded-lg border border-foreground/10 overflow-hidden p-6 sm:p-8 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl font-semibold">Study Complete!</p>
          <p className="text-foreground/50">No more cards due for review.</p>
          <Button
            render={<Link href={`/decks/${id}/cards`} />}
            className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
            nativeButton={false}
          >
            Back to Deck
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
          <div className="flex w-full max-h-[600px] flex-col rounded-lg border border-foreground/10 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div
                className="prose dark:prose-invert prose-sm sm:prose-base max-w-none [&>*]:break-words [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:break-words [&_table]:block [&_table]:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: card.front }}
              />
            </div>

            {revealed && (
              <>
                <Separator className="h-px w-full bg-foreground/10" />
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-foreground/5">
                  <div
                    className="prose dark:prose-invert prose-sm sm:prose-base max-w-none font-semibold [&>*]:break-words [&_img]:max-w-full [&_img]:h-auto [&_pre]:overflow-x-auto [&_pre]:text-xs [&_code]:break-words [&_table]:block [&_table]:overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: card.back }}
                  />
                </div>
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
                onClick={() => handleRate(Rating.Again)}
                disabled={reviewMutation.isPending}
                className="flex h-10 items-center justify-center rounded-md border border-red-400/30 px-4 text-base font-medium text-red-500 select-none hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Again
              </Button>
              <Button
                onClick={() => handleRate(Rating.Hard)}
                disabled={reviewMutation.isPending}
                className="flex h-10 items-center justify-center rounded-md border border-orange-400/30 px-4 text-base font-medium text-orange-500 select-none hover:bg-orange-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hard
              </Button>
              <Button
                onClick={() => handleRate(Rating.Good)}
                disabled={reviewMutation.isPending}
                className="flex h-10 items-center justify-center rounded-md border border-green-400/30 px-4 text-base font-medium text-green-500 select-none hover:bg-green-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Good
              </Button>
              <Button
                onClick={() => handleRate(Rating.Easy)}
                disabled={reviewMutation.isPending}
                className="flex h-10 items-center justify-center rounded-md border border-blue-400/30 px-4 text-base font-medium text-blue-500 select-none hover:bg-blue-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

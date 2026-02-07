"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@base-ui/react/button";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { Separator } from "@base-ui/react/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import LexicalEditor from "@/components/lexical-editor";

type Card = {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: string;
  updatedAt: string;
};

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function CardsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: cards = [] } = useQuery<Card[]>({
    queryKey: ["decks", id, "cards"],
    queryFn: () => fetch(`/api/decks/${id}/cards`).then((r) => r.json()),
  });

  const createCard = useMutation({
    mutationFn: (data: { front: string; back: string }) =>
      fetch(`/api/decks/${id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", id, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const deleteCard = useMutation({
    mutationFn: (cardId: string) =>
      fetch(`/api/decks/${id}/cards/${cardId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", id, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleAddCard() {
    if (!stripHtmlTags(newFront) || !stripHtmlTags(newBack)) return;
    createCard.mutate({ front: newFront, back: newBack });
    setNewFront("");
    setNewBack("");
    setDialogOpen(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/decks"
        className="text-sm text-foreground/50 hover:text-foreground"
      >
        &larr; Back to decks
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500">
            + New Card
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
              <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                Add a new card
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-base text-foreground/50">
                Enter the front and back of the card.
              </Dialog.Description>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCard();
                }}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Front</label>
                  <LexicalEditor
                    value={newFront}
                    onChange={setNewFront}
                    placeholder="e.g. Hola"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Back</label>
                  <LexicalEditor
                    value={newBack}
                    onChange={setNewBack}
                    placeholder="e.g. Hello"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-3.5 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
                    Cancel
                  </Dialog.Close>
                  <Button
                    type="submit"
                    className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
                  >
                    Add
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <Separator className="my-4 h-px bg-foreground/10" />

      {cards.length === 0 ? (
        <p className="py-12 text-center text-foreground/40">
          No cards yet. Add one to get started!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between rounded-md border border-foreground/10 px-4 py-3"
            >
              <div
                className="prose prose-invert prose-sm line-clamp-1 flex-1"
                dangerouslySetInnerHTML={{ __html: card.front }}
              />
              <AlertDialog.Root>
                <AlertDialog.Trigger
                  className="ml-3 rounded p-1 text-gray-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  aria-label="Delete card"
                >
                  <Trash2 size={16} />
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
                  <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                    <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                      Delete card?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mb-6 text-base text-foreground/50">
                      You can&apos;t undo this action.
                    </AlertDialog.Description>
                    <div className="flex justify-end gap-4">
                      <AlertDialog.Close className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-3.5 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
                        Cancel
                      </AlertDialog.Close>
                      <AlertDialog.Close
                        className="flex h-10 items-center justify-center rounded-md border border-red-500/30 px-3.5 text-base font-medium text-red-500 select-none hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-red-500 active:bg-red-500/20"
                        onClick={() => deleteCard.mutate(card.id)}
                      >
                        Delete
                      </AlertDialog.Close>
                    </div>
                  </AlertDialog.Popup>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

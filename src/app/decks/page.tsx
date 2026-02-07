"use client";

import Link from "next/link";
import { useState} from "react";
import { Button } from "@base-ui/react/button";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Separator } from "@base-ui/react/separator";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

type Deck = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: { cards: number };
};

export default  function DecksPage() {
  const queryClient = useQueryClient();

  const { data: decks = [] } = useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: () => fetch("/api/decks").then((r) => r.json()),
  });

  const createDeck = useMutation({
    mutationFn: (name: string) =>
        fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });

  const deleteDeck = useMutation({
    mutationFn: (deckId: string) =>
      fetch(`/api/decks/${deckId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });

  function handleAddDeck() {
    if (!newDeckName.trim()) return;
    createDeck.mutate(newDeckName.trim());
    setNewDeckName("");
    setDialogOpen(false);
  }
  const [newDeckName, setNewDeckName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="text-sm text-foreground/50 hover:text-foreground"
      >
        &larr; Home
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold sm:text-2xl">Your Decks</h1>
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger
            className="flex h-9 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500 sm:h-10 sm:px-3.5 sm:text-base"
          >
            + New Deck
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
              <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                Create a new deck
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-base text-foreground/50">
                Give your deck a name to get started.
              </Dialog.Description>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDeck();
                }}
              >
                <Field.Root className="flex flex-col gap-1">
                  <Field.Label className="text-sm font-medium">
                    Deck name
                  </Field.Label>
                  <Input
                    required
                    placeholder="e.g. Spanish Vocab"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-foreground/20 bg-transparent pl-3.5 text-base text-foreground focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                  />
                </Field.Root>
                <div className="flex justify-end gap-4">
                  <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-3.5 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
                    Cancel
                  </Dialog.Close>
                  <Button
                    type="submit"
                    className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-foreground/80 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/90"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <Separator className="my-4 h-px bg-foreground/10" />

      {decks.length === 0 ? (
        <p className="py-12 text-center text-foreground/40">
          No decks yet. Create one to get started!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {decks.map((deck) => (
            <li
              key={deck.id}
              className="flex flex-col gap-3 rounded-md border border-foreground/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium truncate">{deck.name}</span>
                <span className="ml-2 text-sm text-foreground/40">
                  {deck._count.cards} cards
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  href={`/decks/${deck.id}/cards`}
                  className="flex h-9 items-center justify-center rounded-md border border-foreground/20 px-3 text-sm font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10 sm:h-10 sm:px-3.5 sm:text-base"
                >
                  Cards
                </Link>
                <Link
                  href={`/decks/${deck.id}/study`}
                  className="flex h-9 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500 sm:h-10 sm:px-3.5 sm:text-base"
                >
                  Study
                </Link>
                <AlertDialog.Root>
                  <AlertDialog.Trigger
                    className="rounded p-1.5 text-gray-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    aria-label="Delete deck"
                  >
                    <Trash2 size={16} />
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
                    <AlertDialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                      <AlertDialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                        Delete deck?
                      </AlertDialog.Title>
                      <AlertDialog.Description className="mb-6 text-base text-foreground/50">
                        This will permanently delete this deck and all its cards. You can&apos;t undo this action.
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-4">
                        <AlertDialog.Close className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-3.5 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
                          Cancel
                        </AlertDialog.Close>
                        <AlertDialog.Close
                          className="flex h-10 items-center justify-center rounded-md border border-red-500/30 px-3.5 text-base font-medium text-red-500 select-none hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-red-500 active:bg-red-500/20"
                          onClick={() => deleteDeck.mutate(deck.id)}
                        >
                          Delete
                        </AlertDialog.Close>
                      </div>
                    </AlertDialog.Popup>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            </li>
          ))}
        </ul>
      )}


    </div>
  );
}

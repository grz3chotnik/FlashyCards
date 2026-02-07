"use client";

import Link from "next/link";
import { useState} from "react";
import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Separator } from "@base-ui/react/separator";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

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

  function handleAddDeck() {
    if (!newDeckName.trim()) return;
    createDeck.mutate(newDeckName.trim());
    setNewDeckName("");
    setDialogOpen(false);
  }
  const [newDeckName, setNewDeckName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="text-sm text-foreground/50 hover:text-foreground"
      >
        &larr; Home
      </Link>

      <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Decks</h1>
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-pink-500"
          >
            + New Deck
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-xl border border-foreground/10">
              <Dialog.Title className="text-lg font-semibold">
                Create a new deck
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-foreground/50">
                Give your deck a name to get started.
              </Dialog.Description>
              <form
                className="mt-4 flex flex-col gap-4"
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
                    className="h-10 w-full rounded-md border border-foreground/20 bg-transparent pl-3.5 text-base text-foreground focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                  />
                </Field.Root>
                <div className="flex justify-end gap-2">
                  <Dialog.Close
                    className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Cancel
                  </Dialog.Close>
                  <Button
                    type="submit"
                    className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-foreground/90"
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
              className="flex items-center justify-between rounded-md border border-foreground/10 px-4 py-3"
            >
              <div>
                <span className="font-medium">{deck.name}</span>
                <span className="ml-2 text-sm text-foreground/40">
                  {deck._count.cards} cards
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/decks/${deck.id}/cards`}
                  className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Cards
                </Link>
                <Link
                  href={`/decks/${deck.id}/study`}
                  className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-pink-500"
                >
                  Study
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}


    </div>
  );
}

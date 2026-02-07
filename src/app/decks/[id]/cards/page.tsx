"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Separator } from "@base-ui/react/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Card = {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: string;
  updatedAt: string;
};

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

  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleAddCard() {
    if (!newFront.trim() || !newBack.trim()) return;
    createCard.mutate({ front: newFront.trim(), back: newBack.trim() });
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
          <Dialog.Trigger className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-pink-500">
            + New Card
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-xl border border-foreground/10">
              <Dialog.Title className="text-lg font-semibold">
                Add a new card
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-foreground/50">
                Enter the front and back of the card.
              </Dialog.Description>
              <form
                className="mt-4 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCard();
                }}
              >
                <Field.Root className="flex flex-col gap-1">
                  <Field.Label className="text-sm font-medium">
                    Front
                  </Field.Label>
                  <Input
                    required
                    placeholder="e.g. Hola"
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    className="h-10 w-full rounded-md border border-foreground/20 bg-transparent pl-3.5 text-base text-foreground focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                  />
                </Field.Root>
                <Field.Root className="flex flex-col gap-1">
                  <Field.Label className="text-sm font-medium">
                    Back
                  </Field.Label>
                  <Input
                    required
                    placeholder="e.g. Hello"
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    className="h-10 w-full rounded-md border border-foreground/20 bg-transparent pl-3.5 text-base text-foreground focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                  />
                </Field.Root>
                <div className="flex justify-end gap-2">
                  <Dialog.Close className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium text-foreground/70 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Cancel
                  </Dialog.Close>
                  <Button
                    type="submit"
                    className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-foreground/90"
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
              <span className="font-medium">{card.front}</span>
              <span className="text-sm text-foreground/40">{card.back}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

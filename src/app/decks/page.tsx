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
import { parseAnkiTSV, type ParseResult } from "@/lib/anki-parser";
import { UserButton } from "@clerk/nextjs";
import {dark, shadcn} from "@clerk/themes";
import {simple} from "effect/Logger";
import { Skeleton } from "@/components/skeleton";

type Deck = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: { cards: number; dueCards: number };
};

export default  function DecksPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ decks: Deck[]; streak: number }>({
    queryKey: ["decks"],
    queryFn: () => fetch("/api/decks").then((r) => r.json()),
  });

  const decks = data?.decks ?? [];
  const streak = data?.streak ?? 0;

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

  const importDeck = useMutation({
    mutationFn: (data: { name: string; cards: { front: string; back: string }[] }) =>
      fetch("/api/decks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to import deck");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setImportDialogOpen(false);
      setImportDeckName("");
      setSelectedFile(null);
      setParseResult(null);
    },
  });

  function handleAddDeck() {
    if (!newDeckName.trim()) return;
    createDeck.mutate(newDeckName.trim());
    setNewDeckName("");
    setDialogOpen(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Auto-populate deck name from filename (remove extension)
    const nameWithoutExt = file.name.replace(/\.(txt|csv|tsv)$/i, "");
    setImportDeckName(nameWithoutExt);

    // Parse file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseAnkiTSV(content);
      setParseResult(result);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parseResult || parseResult.errors.length > 0 || !importDeckName.trim()) return;
    importDeck.mutate({
      name: importDeckName.trim(),
      cards: parseResult.cards,
    });
  }

  const [newDeckName, setNewDeckName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importDeckName, setImportDeckName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-foreground/50 hover:text-foreground"
        >
          &larr; Home
        </Link>
        <UserButton
        appearance={{
          theme: dark
        }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">Your Decks</h1>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-sm font-semibold text-orange-400">
              🔥 {streak}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog.Root open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <Dialog.Trigger
              className="flex h-9 items-center justify-center rounded-md border border-foreground/20 px-3 text-sm font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10 sm:h-10 sm:px-3.5 sm:text-base"
            >
              Import Deck
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-[32rem] max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 text-foreground outline outline-1 outline-foreground/10 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">
                  Import Anki Deck
                </Dialog.Title>
                <Dialog.Description className="mb-6 text-base text-foreground/50">
                  Import cards from Anki&apos;s TSV export format (tab-separated front/back).
                </Dialog.Description>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleImport();
                  }}
                >
                  <Field.Root className="flex flex-col gap-1">
                    <Field.Label className="text-sm font-medium">
                      Deck name
                    </Field.Label>
                    <Input
                      required
                      placeholder="e.g. Spanish Vocab"
                      value={importDeckName}
                      onChange={(e) => setImportDeckName(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-foreground/20 bg-transparent pl-3.5 text-base text-foreground focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                    />
                  </Field.Root>
                  <Field.Root className="flex flex-col gap-1">
                    <Field.Label className="text-sm font-medium">
                      File
                    </Field.Label>
                    <input
                      type="file"
                      accept=".txt,.csv,.tsv"
                      onChange={handleFileSelect}
                      className="flex h-10 w-full cursor-pointer items-center rounded-md border border-foreground/20 bg-transparent text-base text-foreground file:-ml-px file:mr-3 file:h-10 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-foreground/10 file:px-4 file:text-sm file:font-medium hover:file:bg-foreground/20 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-white"
                    />
                  </Field.Root>

                  {parseResult && (
                    <div className="rounded-md border border-foreground/20 p-3 text-sm">
                      {parseResult.cards.length > 0 && (
                        <div className="mb-2 text-green-600 dark:text-green-400">
                          ✓ {parseResult.cards.length} card{parseResult.cards.length !== 1 ? "s" : ""} will be imported
                        </div>
                      )}
                      {parseResult.skippedLines > 0 && (
                        <div className="mb-2 text-yellow-600 dark:text-yellow-400">
                          ⚠ {parseResult.skippedLines} empty line{parseResult.skippedLines !== 1 ? "s" : ""} skipped
                        </div>
                      )}
                      {parseResult.errors.length > 0 && (
                        <div className="text-red-600 dark:text-red-400">
                          <div className="mb-1 font-medium">
                            ❌ {parseResult.errors.length} error{parseResult.errors.length !== 1 ? "s" : ""} found:
                          </div>
                          <ul className="ml-4 max-h-32 overflow-y-auto space-y-1">
                            {parseResult.errors.map((error, i) => (
                              <li key={i} className="text-xs">
                                Line {error.line}: {error.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parseResult.cards.length === 0 && parseResult.errors.length === 0 && (
                        <div className="text-foreground/40">
                          No valid cards found in file
                        </div>
                      )}
                    </div>
                  )}

                  {importDeck.isError && (
                    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                      Failed to import deck. Please try again.
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-3.5 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
                      Cancel
                    </Dialog.Close>
                    <Button
                      type="submit"
                      disabled={!parseResult || parseResult.errors.length > 0 || !importDeckName.trim() || importDeck.isPending}
                      className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-foreground/80 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-foreground"
                    >
                      {importDeck.isPending ? "Importing..." : "Import Cards"}
                    </Button>
                  </div>
                </form>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
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
      </div>

      <Separator className="my-4 h-px bg-foreground/10" />

      {isLoading ? (
        <ul className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-md border border-foreground/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
            >
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Skeleton className="h-9 w-[4.5rem] sm:h-10" />
                <Skeleton className="h-9 w-[4.5rem] sm:h-10" />
                <Skeleton className="h-6 w-6" />
              </div>
            </li>
          ))}
        </ul>
      ) : decks.length === 0 ? (
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
                <span className="block truncate font-medium">{deck.name}</span>
                <span className="text-sm text-foreground/40">
                  {deck._count.cards} cards
                </span>
                {deck._count.dueCards > 0 && (
                  <span className="ml-2 text-sm font-medium text-pink-400">
                    • {deck._count.dueCards} due
                  </span>
                )}
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

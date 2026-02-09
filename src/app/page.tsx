"use client";

import Link from "next/link";
import { Button } from "@base-ui/react/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center sm:gap-6">
      <div className="absolute top-4 right-4">
        <SignedIn>
          <UserButton
            appearance={{
              theme: dark,
            }}
          />
        </SignedIn>
      </div>

      <img
        src="https://3pekix3gj9.ufs.sh/f/P0hjn6zoBOGumFGpCn4REO6aFC9q21QyAKYVdPriwB5lLIT0"
        alt="FlashyCards logo"
        className="h-16 w-16 sm:h-24 sm:w-24"
      />
      <h1 className="text-2xl font-bold sm:text-4xl">FlashyCards</h1>
      <p className="text-sm text-foreground/50 sm:text-lg">
        Spaced repetition flashcards to help you learn anything
      </p>

      <SignedIn>
        <Button
          render={<Link href="/decks" />}
          className="flex h-10 items-center justify-center rounded-md bg-foreground px-3.5 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500"
          nativeButton={false}
        >
          Go to your decks
        </Button>
      </SignedIn>

      <SignedOut>
        <div className="flex gap-3">
          <SignInButton mode="modal" appearance={{ theme: dark }}>
            <button className="flex h-10 items-center justify-center rounded-md border border-foreground/20 px-4 text-base font-medium text-foreground/70 select-none hover:bg-foreground/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-foreground/10">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal" appearance={{ theme: dark }}>
            <button className="flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-base font-medium text-background select-none hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-white active:bg-pink-500">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>

      <footer className="absolute bottom-4 text-xs text-foreground/30">
        made with ❤️ by{" "}
        <a
          href="https://github.com/grz3chotnik"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground/50 hover:text-foreground"
        >
          grz3chotnik
        </a>
      </footer>
    </div>
  );
}

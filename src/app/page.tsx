import Link from "next/link";
import { Button } from "@base-ui/react/button";
import { prisma } from "@/lib/prisma";

export default  function Home() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <img src="https://3pekix3gj9.ufs.sh/f/P0hjn6zoBOGumFGpCn4REO6aFC9q21QyAKYVdPriwB5lLIT0" alt="FlashyCards logo" className="h-24 w-24" />
      <h1 className="text-4xl font-bold">FlashyCards</h1>
      <p className="text-lg text-foreground/50">
        Spaced repetition flashcards to help you learn anything
      </p>
      <Button
        render={<Link href="/decks" />}
        className=" rounded-md bg-foreground px-4 py-2 text-sm font-mediumG text-background hover:bg-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-pink-500"
        nativeButton={false}
      >
        Go to your decks
      </Button>


    </div>
  );
}

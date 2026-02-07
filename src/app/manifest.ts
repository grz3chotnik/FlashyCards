import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FlashyCards",
    short_name: "FlashyCards",
    description: "A flashcard app for spaced repetition learning",
    start_url: "/decks",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "https://3pekix3gj9.ufs.sh/f/P0hjn6zoBOGumFGpCn4REO6aFC9q21QyAKYVdPriwB5lLIT0", sizes: "192x192", type: "image/svg" },
      { src: "https://3pekix3gj9.ufs.sh/f/P0hjn6zoBOGumFGpCn4REO6aFC9q21QyAKYVdPriwB5lLIT0", sizes: "512x512", type: "image/svg" },
    ],
  };
}

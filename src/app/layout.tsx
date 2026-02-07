import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlashyCards",
  description: "A flashcard app for spaced repetition learning",
  icons: "https://3pekix3gj9.ufs.sh/f/P0hjn6zoBOGumFGpCn4REO6aFC9q21QyAKYVdPriwB5lLIT0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlashyCards",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Providers>
        <div className="root">
            {children}
        </div>
      </Providers>
      </body>
    </html>
  );
}

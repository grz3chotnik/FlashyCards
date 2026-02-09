# FlashyCards

A spaced repetition flashcard app with intelligent scheduling, Anki imports, and a rich text editor.

## Features

- Spaced repetition powered by the FSRS algorithm
- Import decks from Anki TSV format
- Rich text card editor with image uploads and code blocks
- Study streak tracking
- Keyboard shortcuts for fast reviewing
- PWA support for mobile use
- Dark mode

## Prerequisites

- Node.js 18+
- PostgreSQL database (or a Neon account)
- Clerk account for authentication
- UploadThing account for file uploads

## Installation

1. Clone the repository

```bash
git clone https://github.com/grz3chotnik/flashycards.git
cd flashycards
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Fill in the following values:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `UPLOADTHING_TOKEN` - UploadThing API token

4. Set up the database

```bash
npx prisma migrate deploy
```

5. Start the development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework** - Next.js 16
- **Language** - TypeScript
- **Styling** - Tailwind CSS
- **Database** - PostgreSQL with Prisma
- **Auth** - Clerk
- **Editor** - Lexical
- **Spaced Repetition** - ts-fsrs
- **File Uploads** - UploadThing
- **State Management** - TanStack React Query

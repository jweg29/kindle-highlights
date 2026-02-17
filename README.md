# Kindle Highlights

A web app for viewing and exporting your Amazon Kindle highlights in a clean interface with Markdown export.

## How it works

Amazon has no public API for Kindle highlights. This app uses a **bookmarklet** that runs on the `read.amazon.com/notebook` page to scrape your highlights and send them to this app for viewing and export.

### Setup

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and follow the instructions to set up the bookmarklet.

### Usage

1. Drag the **Get Highlights** bookmarklet to your bookmarks bar
2. Navigate to [read.amazon.com/notebook](https://read.amazon.com/notebook) and sign in
3. Click the bookmarklet — it will scrape your library and send highlights to the app
4. Browse your books and highlights in the app
5. Export any book's highlights as Markdown

You can also import a JSON file if you already have an export from another tool.

### Tech stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Server-side JSON file storage (no database required)
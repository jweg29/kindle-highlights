import { promises as fs } from "fs";
import path from "path";
import { HighlightsData, Book } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "highlights.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // directory already exists
  }
}

export async function readData(): Promise<HighlightsData> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { books: [], lastUpdated: new Date().toISOString() };
  }
}

export async function writeData(data: HighlightsData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function importBooks(books: Book[]): Promise<void> {
  const data = await readData();

  for (const incoming of books) {
    const existingIndex = data.books.findIndex((b) => b.asin === incoming.asin);
    if (existingIndex >= 0) {
      data.books[existingIndex] = incoming;
    } else {
      data.books.push(incoming);
    }
  }

  data.lastUpdated = new Date().toISOString();
  await writeData(data);
}

export async function getBooks(): Promise<Book[]> {
  const data = await readData();
  return data.books.map(({ highlights, ...rest }) => ({
    ...rest,
    highlights: [],
  }));
}

export async function getBook(asin: string): Promise<Book | null> {
  const data = await readData();
  return data.books.find((b) => b.asin === asin) ?? null;
}

export async function deleteBook(asin: string): Promise<boolean> {
  const data = await readData();
  const index = data.books.findIndex((b) => b.asin === asin);
  if (index < 0) return false;
  data.books.splice(index, 1);
  data.lastUpdated = new Date().toISOString();
  await writeData(data);
  return true;
}

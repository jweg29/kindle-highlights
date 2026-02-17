import { Book } from "./types";

export function bookToMarkdown(book: Book): string {
  const lines: string[] = [];

  lines.push(`# ${book.title}`);
  lines.push("");
  lines.push(`**${book.author}**`);
  lines.push("");
  lines.push(`*${book.highlightCount} highlights*`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const h of book.highlights) {
    lines.push(`> ${h.text}`);
    lines.push("");

    const meta: string[] = [];
    if (h.location) meta.push(h.location);
    if (h.color) meta.push(`${h.color} highlight`);
    if (meta.length > 0) {
      lines.push(`*${meta.join(" | ")}*`);
      lines.push("");
    }

    if (h.note) {
      lines.push(`**Note:** ${h.note}`);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function allBooksToMarkdown(books: Book[]): string {
  return books.map(bookToMarkdown).join("\n\n");
}

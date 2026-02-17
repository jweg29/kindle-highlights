"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Book } from "@/lib/types";
import HighlightCard from "@/components/HighlightCard";
import { bookToMarkdown } from "@/lib/markdown";

export default function BookPage() {
  const params = useParams();
  const asin = params.asin as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/books/${asin}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [asin]);

  function handleExport() {
    if (!book) return;
    const md = bookToMarkdown(book);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title.replace(/[^a-zA-Z0-9 ]/g, "").trim()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!book) return;
    if (!confirm(`Remove "${book.title}" from your library?`)) return;
    await fetch(`/api/books/${asin}`, { method: "DELETE" });
    window.location.href = "/library";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        Loading...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-stone-700">
          Book not found
        </h2>
        <a href="/library" className="mt-2 text-sm text-blue-600 underline">
          Back to library
        </a>
      </div>
    );
  }

  const filtered = book.highlights.filter(
    (h) =>
      h.text.toLowerCase().includes(search.toLowerCase()) ||
      (h.note && h.note.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-5">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="h-36 w-24 flex-shrink-0 rounded-md object-cover shadow"
          />
        ) : (
          <div className="flex h-36 w-24 flex-shrink-0 items-center justify-center rounded-md bg-stone-200 text-xs text-stone-400">
            No Cover
          </div>
        )}
        <div className="min-w-0">
          <a
            href="/library"
            className="text-xs text-stone-400 hover:text-stone-600"
          >
            &larr; Library
          </a>
          <h1 className="mt-1 text-2xl font-bold text-stone-800">
            {book.title}
          </h1>
          <p className="mt-0.5 text-stone-500">{book.author}</p>
          <p className="mt-1 text-sm text-stone-400">
            {book.highlightCount} highlight
            {book.highlightCount !== 1 && "s"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleExport}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Export Markdown
            </button>
            <button
              onClick={handleDelete}
              className="rounded border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:border-red-300 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search highlights..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      />

      {/* Highlights */}
      <div className="mt-6 space-y-3">
        {filtered.map((h) => (
          <HighlightCard key={h.id} highlight={h} />
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="py-10 text-center text-sm text-stone-400">
          No highlights match &ldquo;{search}&rdquo;
        </p>
      )}

      {filtered.length === 0 && !search && (
        <p className="py-10 text-center text-sm text-stone-400">
          No highlights found for this book.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Book } from "@/lib/types";
import BookCard from "@/components/BookCard";

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        Loading...
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-stone-700">
          No books imported yet
        </h2>
        <p className="mt-2 text-sm text-stone-400">
          Use the bookmarklet on the{" "}
          <a href="/" className="text-blue-600 underline">
            home page
          </a>{" "}
          to import your Kindle highlights.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Your Library</h1>
        <span className="text-sm text-stone-400">
          {books.length} book{books.length !== 1 && "s"}
        </span>
      </div>

      <input
        type="text"
        placeholder="Search books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {filtered.map((book) => (
          <BookCard key={book.asin} book={book} />
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="py-10 text-center text-sm text-stone-400">
          No books match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}

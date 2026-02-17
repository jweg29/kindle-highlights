"use client";

import { Book } from "@/lib/types";

export default function BookCard({ book }: { book: Book }) {
  return (
    <a
      href={`/book/${book.asin}`}
      className="group flex gap-4 rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      {book.imageUrl ? (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="h-28 w-20 flex-shrink-0 rounded object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center rounded bg-stone-200 text-xs text-stone-400">
          No Cover
        </div>
      )}
      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <h3 className="truncate font-medium text-stone-800 group-hover:text-stone-950">
            {book.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-stone-500">
            {book.author}
          </p>
        </div>
        <p className="text-sm text-stone-400">
          {book.highlightCount} highlight{book.highlightCount !== 1 && "s"}
        </p>
      </div>
    </a>
  );
}

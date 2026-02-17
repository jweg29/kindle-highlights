import { NextRequest, NextResponse } from "next/server";
import { importBooks } from "@/lib/storage";
import { Book } from "@/lib/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let books: Book[];
    if (Array.isArray(body)) {
      books = body;
    } else if (body.books && Array.isArray(body.books)) {
      books = body.books;
    } else {
      return NextResponse.json(
        { error: "Expected an array of books or { books: [...] }" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Validate structure
    for (const book of books) {
      if (!book.asin || !book.title) {
        return NextResponse.json(
          { error: `Invalid book entry: missing asin or title` },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    await importBooks(books);

    return NextResponse.json(
      { success: true, imported: books.length },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

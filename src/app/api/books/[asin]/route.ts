import { NextRequest, NextResponse } from "next/server";
import { getBook, deleteBook } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { asin: string } }
) {
  const book = await getBook(params.asin);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json(book);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { asin: string } }
) {
  const deleted = await deleteBook(params.asin);
  if (!deleted) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

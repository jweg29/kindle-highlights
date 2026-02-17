import { NextResponse } from "next/server";
import { getBooks } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const books = await getBooks();
  return NextResponse.json(books);
}

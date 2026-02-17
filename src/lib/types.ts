export interface Highlight {
  id: string;
  text: string;
  note: string | null;
  location: string | null;
  color: string | null;
}

export interface Book {
  asin: string;
  title: string;
  author: string;
  imageUrl: string | null;
  highlightCount: number;
  lastImported: string;
  highlights: Highlight[];
}

export interface HighlightsData {
  books: Book[];
  lastUpdated: string;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kindle Highlights",
  description: "View and export your Kindle book highlights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold text-stone-800">
              Kindle Highlights
            </a>
            <div className="flex gap-4 text-sm">
              <a
                href="/"
                className="text-stone-500 hover:text-stone-800 transition-colors"
              >
                Home
              </a>
              <a
                href="/library"
                className="text-stone-500 hover:text-stone-800 transition-colors"
              >
                Library
              </a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

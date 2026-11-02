import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghost Commit CTF — GitHub Simulator",
  description: "Challenge 1: find the flag left by a deleted branch",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--gh-border)] bg-[var(--gh-canvas)] px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <Link href="/" className="font-semibold text-[var(--gh-text)] no-underline hover:no-underline">
              gh-sim · Challenge 1
            </Link>
            <span className="text-sm text-[var(--gh-muted)]">Local training stand-in for api.github.com</span>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}

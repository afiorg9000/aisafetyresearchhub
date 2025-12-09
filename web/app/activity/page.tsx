"use client";

import Link from "next/link";
import { ActivityFeed } from "../components/activity-feed";

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">
              Organizations
            </Link>
            <Link href="/publications" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">
              Publications
            </Link>
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">
              Open Problems
            </Link>
            <Link href="/activity" className="font-medium text-[var(--foreground)] no-underline border-b-2 border-[var(--accent)] pb-3 -mb-3">
              Activity
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-2">
            Recent Activity
          </h1>
          <p className="text-[var(--muted)]">
            Latest updates across the AI safety research ecosystem
          </p>
        </div>

        <div className="paper-card rounded-sm p-6">
          <ActivityFeed limit={20} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-[var(--muted)] text-center">
            Knowledge Base for AI Safety Research — Data compiled from public sources.
          </p>
        </div>
      </footer>
    </div>
  );
}


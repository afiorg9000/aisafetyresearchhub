"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ReadingItem = {
  title: string;
  type: "foundational" | "intermediate" | "advanced" | "recent" | "skip";
  reason: string;
  url?: string;
  org?: string;
};

type ReadingPath = {
  topic: string;
  overview: string;
  path: {
    start_here: ReadingItem[];
    then_read: ReadingItem[];
    recent_developments: ReadingItem[];
    optional_deep_dives: ReadingItem[];
    skip_these: ReadingItem[];
  };
  time_estimate: string;
};

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

const TYPE_COLORS: Record<string, string> = {
  foundational: "bg-purple-100 text-purple-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-orange-100 text-orange-800",
  recent: "bg-green-100 text-green-800",
  skip: "bg-gray-100 text-gray-600",
};

function ReadingContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  
  const [topic, setTopic] = useState(initialTopic);
  const [background, setBackground] = useState("beginner");
  const [isLoading, setIsLoading] = useState(false);
  const [readingPath, setReadingPath] = useState<ReadingPath | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, background }),
      });
      const data = await response.json();
      setReadingPath(data);
    } catch (error) {
      console.error("Error fetching reading path:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/search" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Search</Link>
            <Link href="/topics/all" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Topics</Link>
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Open Problems</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookIcon className="w-6 h-6 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide">AI Reading Guide</span>
          </div>
          
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mb-4">
            What Should I Read?
          </h1>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            Get a structured reading path for any AI safety topic. We'll tell you what to start with, 
            what to read next, and what you can skip.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="paper-card rounded-sm p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                What topic do you want to learn about?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., mechanistic interpretability, RLHF, deceptive alignment..."
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Your background level
              </label>
              <div className="flex gap-3">
                {[
                  { value: "beginner", label: "Beginner", desc: "New to AI safety" },
                  { value: "intermediate", label: "Intermediate", desc: "Some familiarity" },
                  { value: "advanced", label: "Advanced", desc: "Active researcher" },
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setBackground(level.value)}
                    className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                      background === level.value
                        ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                        : "border-[var(--border)] hover:border-[var(--border-dark)]"
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-[var(--muted)]">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Generating reading path..." : "Get Reading Recommendations"}
            </button>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--muted)]">Analyzing papers and creating your reading path...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {readingPath && !isLoading && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="paper-card rounded-sm p-6 bg-gradient-to-r from-[var(--accent-muted)] to-[var(--background)]">
              <div className="flex items-start gap-3">
                <SparklesIcon className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-medium text-[var(--foreground)] mb-2">
                    Reading Path for: {readingPath.topic}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">{readingPath.overview}</p>
                  <p className="text-xs text-[var(--muted-light)] mt-2">
                    Estimated time: {readingPath.time_estimate}
                  </p>
                </div>
              </div>
            </div>

            {/* Start Here */}
            {readingPath.path.start_here?.length > 0 && (
              <section className="paper-card rounded-sm p-6">
                <h3 className="font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">1</span>
                  Start Here
                </h3>
                <div className="space-y-3">
                  {readingPath.path.start_here.map((item, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS.foundational}`}>
                          Foundational
                        </span>
                      </div>
                      <h4 className="font-medium text-[var(--foreground)]">{item.title}</h4>
                      <p className="text-sm text-[var(--muted)] mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Then Read */}
            {readingPath.path.then_read?.length > 0 && (
              <section className="paper-card rounded-sm p-6">
                <h3 className="font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">2</span>
                  Then Read
                </h3>
                <div className="space-y-3">
                  {readingPath.path.then_read.map((item, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS.intermediate}`}>
                          Intermediate
                        </span>
                      </div>
                      <h4 className="font-medium text-[var(--foreground)]">{item.title}</h4>
                      <p className="text-sm text-[var(--muted)] mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Developments */}
            {readingPath.path.recent_developments?.length > 0 && (
              <section className="paper-card rounded-sm p-6">
                <h3 className="font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">3</span>
                  Recent Developments
                </h3>
                <div className="space-y-3">
                  {readingPath.path.recent_developments.map((item, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${TYPE_COLORS.recent}`}>
                          Recent
                        </span>
                      </div>
                      <h4 className="font-medium text-[var(--foreground)]">{item.title}</h4>
                      <p className="text-sm text-[var(--muted)] mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skip These */}
            {readingPath.path.skip_these?.length > 0 && (
              <section className="paper-card rounded-sm p-6 opacity-75">
                <h3 className="font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm">✕</span>
                  You Can Skip
                </h3>
                <div className="space-y-2">
                  {readingPath.path.skip_these.map((item, i) => (
                    <div key={i} className="py-2">
                      <h4 className="text-[var(--muted)]">{item.title}</h4>
                      <p className="text-sm text-[var(--muted-light)]">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Quick Topics */}
        {!readingPath && !isLoading && (
          <div className="text-center">
            <p className="text-sm text-[var(--muted)] mb-4">Popular topics:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Mechanistic Interpretability",
                "RLHF",
                "Deceptive Alignment",
                "Scalable Oversight",
                "AI Control",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm hover:border-[var(--border-dark)] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReadingLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="h-6 w-48 bg-[var(--border)] rounded animate-pulse" />
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="h-8 w-64 bg-[var(--border)] rounded animate-pulse mx-auto mb-8" />
      </div>
    </div>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={<ReadingLoading />}>
      <ReadingContent />
    </Suspense>
  );
}


"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../components/auth-provider";

// Focus areas for filtering
const FOCUS_AREAS = [
  "All Areas",
  "Alignment",
  "Interpretability",
  "Governance",
  "Evaluations",
  "Red Teaming",
  "Biosecurity",
  "Cyber",
  "Agent Safety",
  "Scalable Oversight",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "score", label: "Most Upvoted" },
  { value: "workers", label: "Most Active" },
  { value: "comments", label: "Most Discussed" },
];

// Problem type definition
type Problem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  focus_area: string;
  status: string;
  score: number;
  workers_count: number;
  comments_count: number;
  created_at: string;
  submitted_by: { name: string };
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  const statusColors: Record<string, string> = {
    open: "!bg-amber-50 !text-amber-700 !border-amber-200",
    in_progress: "!bg-blue-50 !text-blue-700 !border-blue-200",
    solved: "!bg-green-50 !text-green-700 !border-green-200",
    closed: "!bg-gray-50 !text-gray-500 !border-gray-200",
  };

  return (
    <article
      className="paper-card rounded-sm p-5 animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="research-tag">{problem.focus_area}</span>
          <span className={`research-tag ${statusColors[problem.status]}`}>
            {problem.status.replace("_", " ")}
          </span>
        </div>
        {/* Vote score */}
        <div className="flex items-center gap-1 text-[var(--muted)]">
          <ArrowUpIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{problem.score}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg font-medium text-[var(--foreground)] mb-2 leading-snug">
        <Link
          href={`/problem/${problem.slug}`}
          className="hover:text-[var(--accent)] transition-colors no-underline"
        >
          {problem.title}
        </Link>
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
        {problem.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-light)]">
        <div className="flex items-center gap-1">
          <UsersIcon className="w-3.5 h-3.5" />
          <span>{problem.workers_count} working on this</span>
        </div>
        <div className="flex items-center gap-1">
          <ChatIcon className="w-3.5 h-3.5" />
          <span>{problem.comments_count} comments</span>
        </div>
        <span className="ml-auto">{problem.created_at}</span>
      </div>
    </article>
  );
}

export default function ProblemsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [focusArea, setFocusArea] = useState("All Areas");
  const [sortBy, setSortBy] = useState("score");

  // Will be replaced with Supabase query
  const problems: Problem[] = [];

  const filteredProblems = useMemo(() => {
    let filtered = [...problems];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by focus area
    if (focusArea !== "All Areas") {
      filtered = filtered.filter((p) => p.focus_area === focusArea);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "score":
        filtered.sort((a, b) => b.score - a.score);
        break;
      case "workers":
        filtered.sort((a, b) => b.workers_count - a.workers_count);
        break;
      case "comments":
        filtered.sort((a, b) => b.comments_count - a.comments_count);
        break;
    }

    return filtered;
  }, [problems, search, focusArea, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
                AI Safety Research Hub
              </Link>
              <p className="text-sm text-[var(--muted)] mt-1">
                Open problems in AI safety research
              </p>
            </div>
            {user ? (
              <Link
                href="/problems/submit"
                className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
              >
                Submit Problem
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline"
              >
                Sign in to submit
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link
              href="/"
              className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent"
            >
              Organizations
            </Link>
            <Link
              href="/publications"
              className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent"
            >
              Publications
            </Link>
            <Link
              href="/benchmarks"
              className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent"
            >
              Benchmarks
            </Link>
            <Link
              href="/problems"
              className="font-medium text-[var(--foreground)] no-underline border-b-2 border-[var(--accent)] pb-3 -mb-3"
            >
              Open Problems
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-2">
            Open Problems
          </h1>
          <p className="text-[var(--muted)]">
            Important unsolved problems in AI safety research. Upvote problems you think are important, 
            or mark yourself as working on them.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)] transition-all"
            />
          </div>

          {/* Focus Area Filter */}
          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            {FOCUS_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-6">
          {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""}
          {focusArea !== "All Areas" && ` in ${focusArea}`}
        </p>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16 paper-card rounded-sm">
            <p className="text-[var(--muted)] mb-2">No open problems yet.</p>
            <p className="text-sm text-[var(--muted-light)] mb-6">
              Be the first to submit an open problem in AI safety research.
            </p>
            {user ? (
              <Link
                href="/problems/submit"
                className="inline-block px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
              >
                Submit a Problem
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[var(--card)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline"
              >
                Sign in to submit
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((problem, index) => (
              <ProblemCard key={problem.id} problem={problem} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-[var(--muted)] text-center">
            AI Safety Research Hub — Community-driven problem identification
          </p>
        </div>
      </footer>
    </div>
  );
}

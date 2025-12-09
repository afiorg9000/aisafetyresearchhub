"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../components/auth-provider";
import { getAllOpenProblems, type OpenProblem } from "../lib/data";

// Focus areas for filtering
const FOCUS_AREAS = [
  "All Areas",
  "Alignment",
  "Interpretability",
  "Governance",
  "Evals",
  "Robustness",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "difficulty", label: "By Difficulty" },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function ProblemCard({ problem, index }: { problem: OpenProblem; index: number }) {
  const statusColors: Record<string, string> = {
    open: "!bg-amber-50 !text-amber-700 !border-amber-200",
    in_progress: "!bg-blue-50 !text-blue-700 !border-blue-200",
    solved: "!bg-green-50 !text-green-700 !border-green-200",
  };

  const difficultyColors: Record<string, string> = {
    foundational: "!bg-red-50 !text-red-700 !border-red-200",
    hard: "!bg-orange-50 !text-orange-700 !border-orange-200",
    medium: "!bg-yellow-50 !text-yellow-700 !border-yellow-200",
  };

  return (
    <article
      className="paper-card rounded-sm p-5 animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="research-tag">{problem.focus_area}</span>
          <span className={`research-tag ${statusColors[problem.status]}`}>
            {problem.status.replace("_", " ")}
          </span>
          <span className={`research-tag ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
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

      {/* Related Work */}
      {problem.related_work && problem.related_work.length > 0 && (
        <div className="text-xs text-[var(--muted-light)] mb-4">
          Related: {problem.related_work.slice(0, 2).join(", ")}
          {problem.related_work.length > 2 && ` +${problem.related_work.length - 2} more`}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-light)]">
        <span>Submitted by {problem.submitted_by}</span>
        <span className="ml-auto">{problem.created_at}</span>
      </div>
    </article>
  );
}

export default function ProblemsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [focusArea, setFocusArea] = useState("All Areas");
  const [sortBy, setSortBy] = useState("newest");

  const problems = getAllOpenProblems();

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
      case "difficulty":
        const diffOrder = { foundational: 0, hard: 1, medium: 2 };
        filtered.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
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
            Curated list of important unsolved problems in AI safety research. 
            These are the key challenges the field needs to solve.
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
            <p className="text-[var(--muted)] mb-2">No problems found matching your criteria.</p>
            <button
              onClick={() => { setSearch(""); setFocusArea("All Areas"); }}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Clear filters
            </button>
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
            AI Safety Research Hub — Curated open problems in AI safety
          </p>
        </div>
      </footer>
    </div>
  );
}

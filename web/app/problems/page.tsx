"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../components/auth-provider";
import { openProblems, type OpenProblem } from "../lib/data";

// Focus areas for filtering
const FOCUS_AREAS = [
  "All Areas",
  "AI Control",
  "Scalable Oversight",
  "Interpretability",
  "Honesty",
  "Robustness",
  "Agent Safety",
  "Value Learning",
  "Policy",
];

const SORT_OPTIONS = [
  { value: "importance", label: "Highest Priority" },
  { value: "difficulty", label: "Most Tractable" },
  { value: "newest", label: "Newest" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  "Hard": "!bg-red-50 !text-red-700 !border-red-200",
  "Medium": "!bg-yellow-50 !text-yellow-700 !border-yellow-200",
  "Easy": "!bg-green-50 !text-green-700 !border-green-200",
};

const IMPORTANCE_COLORS: Record<string, string> = {
  "Critical": "!bg-purple-100 !text-purple-800 !border-purple-300",
  "High": "!bg-blue-50 !text-blue-700 !border-blue-200",
  "Medium": "!bg-gray-50 !text-gray-600 !border-gray-200",
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

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function ProblemCard({ problem, index }: { problem: OpenProblem; index: number }) {
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<-1 | 0 | 1>(0);

  const handleVote = (direction: 1 | -1) => {
    if (userVote === direction) {
      // Remove vote
      setVotes(v => v - direction);
      setUserVote(0);
    } else {
      // Change vote
      setVotes(v => v - userVote + direction);
      setUserVote(direction);
    }
  };

  return (
    <article
      className="paper-card rounded-sm p-5 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex gap-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 rounded hover:bg-[var(--background-alt)] transition-colors ${
              userVote === 1 ? "text-[var(--accent)]" : "text-[var(--muted)]"
            }`}
          >
            <ArrowUpIcon className="w-5 h-5" />
          </button>
          <span className={`text-sm font-medium ${votes > 0 ? "text-[var(--accent)]" : votes < 0 ? "text-red-500" : "text-[var(--muted)]"}`}>
            {votes}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 rounded hover:bg-[var(--background-alt)] transition-colors ${
              userVote === -1 ? "text-red-500" : "text-[var(--muted)]"
            }`}
          >
            <ArrowDownIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="research-tag">{problem.focus_area}</span>
            <span className={`research-tag ${IMPORTANCE_COLORS[problem.importance]}`}>
              {problem.importance}
            </span>
            <span className={`research-tag ${DIFFICULTY_COLORS[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
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
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">
            {problem.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-[var(--muted-light)]">
            <span>Source: {problem.source}</span>
            <a
              href={problem.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[var(--accent)] hover:underline"
            >
              Read more <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ProblemsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [focusArea, setFocusArea] = useState("All Areas");
  const [sortBy, setSortBy] = useState("importance");

  const filteredProblems = useMemo(() => {
    let filtered = [...openProblems];

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
      filtered = filtered.filter((p) => 
        p.focus_area.toLowerCase().includes(focusArea.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "importance":
        const importanceOrder = { "Critical": 0, "High": 1, "Medium": 2 };
        filtered.sort((a, b) => 
          (importanceOrder[a.importance as keyof typeof importanceOrder] || 2) - 
          (importanceOrder[b.importance as keyof typeof importanceOrder] || 2)
        );
        break;
      case "difficulty":
        const difficultyOrder = { "Easy": 0, "Medium": 1, "Hard": 2 };
        filtered.sort((a, b) => 
          (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 1) - 
          (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 1)
        );
        break;
      case "newest":
        // No date in current data, keep original order
        break;
    }

    return filtered;
  }, [search, focusArea, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
                Knowledge Base for AI Safety Research
              </Link>
              <p className="text-sm text-[var(--muted)] mt-1">
                {openProblems.length} open problems in AI safety research
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/itn"
                className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline"
              >
                ITN Calculator
              </Link>
              <Link
                href="/problems/submit"
                className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:opacity-90 transition-colors no-underline"
              >
                Submit Problem
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              Organizations
            </Link>
            <Link href="/publications" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              Publications
            </Link>
            <Link href="/benchmarks" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              Benchmarks
            </Link>
            <Link href="/topics/all" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              Topics
            </Link>
            <Link href="/problems" className="font-medium text-[var(--foreground)] border-b-2 border-[var(--accent)] pb-3 -mb-3 no-underline">
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
            Important unsolved problems in AI safety research from Anthropic's alignment team. 
            Upvote problems you think are important, or claim you're working on them.
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
            <p className="text-[var(--muted)] mb-2">No matching problems found.</p>
            <p className="text-sm text-[var(--muted-light)] mb-6">
              Try adjusting your search or filters.
            </p>
            <Link
              href="/problems/submit"
              className="inline-block px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:opacity-90 transition-colors no-underline"
            >
              Submit a Problem
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProblems.map((problem, index) => (
              <ProblemCard key={problem.slug} problem={problem} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-6 text-sm text-[var(--muted)]">
            <Link href="/itn" className="hover:text-[var(--foreground)] no-underline">ITN Calculator</Link>
            <Link href="/match" className="hover:text-[var(--foreground)] no-underline">Research Matcher</Link>
            <Link href="/reading" className="hover:text-[var(--foreground)] no-underline">Reading Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type SearchResult = {
  type: "publication" | "project" | "benchmark" | "organization";
  title: string;
  org?: string;
  match_reason: string;
  relevance: "high" | "medium" | "low";
  slug: string;
};

type SearchResponse = {
  summary: string;
  results: SearchResult[];
  related_topics?: string[];
  open_questions?: string[];
  no_results?: boolean;
  error?: string;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

const TYPE_LABELS: Record<string, string> = {
  organization: "Organization",
  project: "Project",
  benchmark: "Benchmark",
  publication: "Publication",
};

const TYPE_COLORS: Record<string, string> = {
  organization: "bg-blue-50 text-blue-700 border-blue-200",
  project: "bg-green-50 text-green-700 border-green-200",
  benchmark: "bg-purple-50 text-purple-700 border-purple-200",
  publication: "bg-amber-50 text-amber-700 border-amber-200",
};

const RELEVANCE_COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
};

function getResultUrl(result: SearchResult): string {
  switch (result.type) {
    case "organization":
      return `/org/${result.slug}`;
    case "project":
    case "publication":
      return `/project/${result.slug}`;
    case "benchmark":
      return `/benchmark/${result.slug}`;
    default:
      return "#";
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search when query from URL
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      setSearchResponse(data);
    } catch (error) {
      setSearchResponse({
        summary: "Search failed. Please try again.",
        results: [],
        error: "Network error",
      });
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(query);
  }

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
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Organizations</Link>
            <Link href="/publications" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Publications</Link>
            <Link href="/benchmarks" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Benchmarks</Link>
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Open Problems</Link>
          </div>
        </div>
      </nav>

      {/* Search Hero */}
      <div className="bg-[var(--background-alt)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide">AI-Powered Search</span>
          </div>
          
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] text-center mb-6">
            Search AI Safety Research
          </h1>
          <p className="text-center text-[var(--muted)] mb-8">
            Ask questions naturally. Get results with explanations of why they match.
          </p>
          
          {/* Search Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are the main approaches to scalable oversight?"
                className="w-full pl-12 pr-24 py-4 bg-[var(--card)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[var(--accent)] text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
          
          {/* Example queries */}
          {!hasSearched && (
            <div className="mt-4 text-center">
              <span className="text-xs text-[var(--muted)]">Try: </span>
              {[
                "How does RLHF work?",
                "Who is researching deceptive alignment?",
                "Benchmarks for evaluating honesty",
              ].map((q, i) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); performSearch(q); }}
                  className="text-xs text-[var(--accent)] hover:underline mx-1"
                >
                  {q}{i < 2 ? " ·" : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Loading state */}
        {isSearching && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--muted)]">Searching with AI...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {!isSearching && searchResponse && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main results */}
            <div className="lg:col-span-2">
              {/* AI Summary */}
              {searchResponse.summary && (
                <div className="paper-card rounded-sm p-5 mb-6 bg-gradient-to-r from-[var(--accent-muted)] to-[var(--background)]">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-medium text-[var(--foreground)] mb-1">AI Summary</h2>
                      <p className="text-sm text-[var(--muted)]">{searchResponse.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results list */}
              {searchResponse.results?.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
                    {searchResponse.results.length} relevant results
                  </p>
                  
                  {searchResponse.results.map((result, index) => (
                    <article
                      key={`${result.type}-${result.slug}-${index}`}
                      className="paper-card rounded-sm p-5 animate-fadeIn"
                      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          {/* Type & Org */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded border ${TYPE_COLORS[result.type]}`}>
                              {TYPE_LABELS[result.type]}
                            </span>
                            {result.org && (
                              <span className="text-xs text-[var(--muted)]">{result.org}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded ${RELEVANCE_COLORS[result.relevance]}`}>
                              {result.relevance} match
                            </span>
                          </div>
                          
                          {/* Title */}
                          <h3 className="font-serif text-lg font-medium text-[var(--foreground)] mb-2">
                            <Link
                              href={getResultUrl(result)}
                              className="hover:text-[var(--accent)] transition-colors no-underline"
                            >
                              {result.title}
                            </Link>
                          </h3>
                          
                          {/* Match reason - the key feature! */}
                          <div className="bg-[var(--background-alt)] rounded p-3 text-sm">
                            <span className="text-[var(--muted-light)]">Why this matches: </span>
                            <span className="text-[var(--foreground)]">{result.match_reason}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : hasSearched && !isSearching ? (
                <div className="text-center py-16">
                  <p className="text-[var(--muted)] mb-4">No results found for "{query}"</p>
                  <Link
                    href="/problems/submit"
                    className="inline-block px-4 py-2 text-sm text-[var(--accent)] border border-[var(--accent)] rounded hover:bg-[var(--accent)] hover:text-white transition-colors no-underline"
                  >
                    Submit as Open Problem
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Related Topics */}
              {searchResponse.related_topics && searchResponse.related_topics.length > 0 && (
                <div className="paper-card rounded-sm p-5">
                  <h3 className="font-medium text-[var(--foreground)] mb-3">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchResponse.related_topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => { setQuery(topic); performSearch(topic); }}
                        className="text-xs px-3 py-1.5 bg-[var(--background-alt)] text-[var(--muted)] rounded hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Questions */}
              {searchResponse.open_questions && searchResponse.open_questions.length > 0 && (
                <div className="paper-card rounded-sm p-5">
                  <h3 className="font-medium text-[var(--foreground)] mb-3">Open Questions</h3>
                  <ul className="space-y-2">
                    {searchResponse.open_questions.map((question, i) => (
                      <li key={i} className="text-sm text-[var(--muted)] flex gap-2">
                        <span className="text-[var(--accent)]">?</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Links */}
              <div className="paper-card rounded-sm p-5">
                <h3 className="font-medium text-[var(--foreground)] mb-3">Browse</h3>
                <div className="space-y-2">
                  <Link href="/" className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
                    → All Organizations
                  </Link>
                  <Link href="/publications" className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
                    → All Publications
                  </Link>
                  <Link href="/benchmarks" className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
                    → All Benchmarks
                  </Link>
                  <Link href="/problems" className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
                    → Open Problems
                  </Link>
                </div>
              </div>

              {/* Research Idea Matcher CTA */}
              <div className="paper-card rounded-sm p-5 bg-gradient-to-br from-[var(--accent-muted)] to-[var(--background)]">
                <h3 className="font-medium text-[var(--foreground)] mb-2">Have a research idea?</h3>
                <p className="text-sm text-[var(--muted)] mb-3">
                  Check if similar work exists and find potential collaborators.
                </p>
                <Link
                  href="/match"
                  className="inline-block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → Try Research Matcher
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && !isSearching && (
          <div className="text-center py-16">
            <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-4">
              What are you looking for?
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link
                href="/"
                className="p-6 paper-card rounded-sm text-left hover:border-[var(--border-dark)] no-underline"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-1">Organizations</h3>
                <p className="text-sm text-[var(--muted)]">Browse AI safety labs, institutes, and nonprofits</p>
              </Link>
              <Link
                href="/publications"
                className="p-6 paper-card rounded-sm text-left hover:border-[var(--border-dark)] no-underline"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-1">Publications</h3>
                <p className="text-sm text-[var(--muted)]">Research papers with citation counts</p>
              </Link>
              <Link
                href="/benchmarks"
                className="p-6 paper-card rounded-sm text-left hover:border-[var(--border-dark)] no-underline"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-1">Benchmarks</h3>
                <p className="text-sm text-[var(--muted)]">Evaluation frameworks and datasets</p>
              </Link>
              <Link
                href="/problems"
                className="p-6 paper-card rounded-sm text-left hover:border-[var(--border-dark)] no-underline"
              >
                <h3 className="font-medium text-[var(--foreground)] mb-1">Open Problems</h3>
                <p className="text-sm text-[var(--muted)]">17 unsolved research questions</p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>
      <div className="bg-[var(--background-alt)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] text-center mb-6">
            Search AI Safety Research
          </h1>
          <div className="h-14 bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}

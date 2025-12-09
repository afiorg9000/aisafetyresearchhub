"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { orgs, slugify, type Org, type Project } from "../lib/data";

// Build search index from all entities
function buildSearchIndex() {
  const index: Array<{
    type: "org" | "project" | "benchmark" | "publication";
    title: string;
    description: string;
    url: string;
    org?: string;
    focus_areas?: string[];
    score?: number;
  }> = [];

  for (const org of orgs) {
    // Add org
    index.push({
      type: "org",
      title: org.name,
      description: org.mission || "",
      url: `/org/${slugify(org.name)}`,
      focus_areas: org.focus_areas,
    });

    // Add projects
    if (org.projects) {
      for (const project of org.projects) {
        const isPublication = project.status?.toLowerCase() === "published" || project.paper_url;
        index.push({
          type: isPublication ? "publication" : "project",
          title: project.name,
          description: project.description || "",
          url: isPublication && project.paper_url ? project.paper_url : `/project/${slugify(project.name)}`,
          org: org.name,
          focus_areas: org.focus_areas,
        });
      }
    }

    // Add benchmarks
    if (org.benchmarks) {
      for (const benchmark of org.benchmarks) {
        index.push({
          type: "benchmark",
          title: benchmark.name,
          description: benchmark.measures || "",
          url: `/benchmark/${slugify(benchmark.name)}`,
          org: org.name,
        });
      }
    }
  }

  return index;
}

// Simple relevance scoring
function scoreResult(item: ReturnType<typeof buildSearchIndex>[0], query: string): number {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  
  let score = 0;
  
  // Exact title match
  if (title === q) score += 100;
  // Title starts with query
  else if (title.startsWith(q)) score += 50;
  // Title contains query
  else if (title.includes(q)) score += 30;
  
  // Description contains query
  if (desc.includes(q)) score += 10;
  
  // Focus area match
  if (item.focus_areas?.some(f => f.toLowerCase().includes(q))) score += 20;
  
  // Org name match
  if (item.org?.toLowerCase().includes(q)) score += 15;
  
  // Word-level matching
  const queryWords = q.split(/\s+/);
  for (const word of queryWords) {
    if (word.length < 3) continue;
    if (title.includes(word)) score += 5;
    if (desc.includes(word)) score += 2;
  }
  
  return score;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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
  org: "Organization",
  project: "Project",
  benchmark: "Benchmark",
  publication: "Publication",
};

const TYPE_COLORS: Record<string, string> = {
  org: "!bg-blue-50 !text-blue-700 !border-blue-200",
  project: "!bg-green-50 !text-green-700 !border-green-200",
  benchmark: "!bg-purple-50 !text-purple-700 !border-purple-200",
  publication: "!bg-amber-50 !text-amber-700 !border-amber-200",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Update query if URL changes
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);
  
  const searchIndex = useMemo(() => buildSearchIndex(), []);
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    let scored = searchIndex
      .map(item => ({ ...item, score: scoreResult(item, query) }))
      .filter(item => item.score > 0);
    
    // Filter by type
    if (typeFilter !== "all") {
      scored = scored.filter(item => item.type === typeFilter);
    }
    
    // Sort by score
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, 50);
  }, [query, typeFilter, searchIndex]);

  const resultCounts = useMemo(() => {
    if (!query.trim()) return { org: 0, project: 0, benchmark: 0, publication: 0 };
    
    const counts = { org: 0, project: 0, benchmark: 0, publication: 0 };
    for (const item of searchIndex) {
      if (scoreResult(item, query) > 0) {
        counts[item.type]++;
      }
    }
    return counts;
  }, [query, searchIndex]);

  const totalResults = Object.values(resultCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            AI Safety Research Hub
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Organizations</Link>
            <Link href="/publications" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Publications</Link>
            <Link href="/benchmarks" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Benchmarks</Link>
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Open Problems</Link>
          </div>
        </div>
      </nav>

      {/* Search Hero */}
      <div className="bg-[var(--background-alt)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] text-center mb-6">
            Search AI Safety Research
          </h1>
          <p className="text-center text-[var(--muted)] mb-8">
            Find organizations, projects, publications, and benchmarks across the AI safety ecosystem
          </p>
          
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for interpretability, RLHF, deception, governance..."
              className="w-full pl-12 pr-4 py-4 bg-[var(--card)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all"
              autoFocus
            />
          </div>
          
          {/* Example queries */}
          {!query && (
            <div className="mt-4 text-center">
              <span className="text-xs text-[var(--muted)]">Try: </span>
              {["interpretability", "deceptive alignment", "MATS", "scalable oversight"].map((q, i) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="text-xs text-[var(--accent)] hover:underline mx-1"
                >
                  {q}{i < 3 ? "," : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {query.trim() && (
          <>
            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                  typeFilter === "all"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                All ({totalResults})
              </button>
              {(["publication", "org", "project", "benchmark"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                    typeFilter === type
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {TYPE_LABELS[type]}s ({resultCounts[type]})
                </button>
              ))}
            </div>

            {/* Results list */}
            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--muted)]">No results found for "{query}"</p>
                <p className="text-sm text-[var(--muted-light)] mt-2">Try different keywords or check spelling</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <article
                    key={`${result.type}-${result.title}-${index}`}
                    className="paper-card rounded-sm p-5 animate-fadeIn"
                    style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`research-tag ${TYPE_COLORS[result.type]}`}>
                            {TYPE_LABELS[result.type]}
                          </span>
                          {result.org && (
                            <span className="text-xs text-[var(--muted)]">{result.org}</span>
                          )}
                        </div>
                        
                        <h3 className="font-serif text-lg font-medium text-[var(--foreground)] mb-1">
                          {result.url.startsWith("http") ? (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[var(--accent)] transition-colors"
                            >
                              {result.title}
                            </a>
                          ) : (
                            <Link
                              href={result.url}
                              className="hover:text-[var(--accent)] transition-colors no-underline"
                            >
                              {result.title}
                            </Link>
                          )}
                        </h3>
                        
                        {result.description && (
                          <p className="text-sm text-[var(--muted)] line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        
                        {result.focus_areas && result.focus_areas.length > 0 && (
                          <div className="mt-2 text-xs text-[var(--muted-light)]">
                            {result.focus_areas.slice(0, 3).join(" · ")}
                          </div>
                        )}
                      </div>
                      
                      {result.url.startsWith("http") && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 text-[var(--muted)] hover:text-[var(--accent)]"
                        >
                          <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!query.trim() && (
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
                <p className="text-sm text-[var(--muted)]">Research papers from across the field</p>
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
                <p className="text-sm text-[var(--muted)]">Unsolved research questions</p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Loading fallback for Suspense
function SearchLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            AI Safety Research Hub
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

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orgs, slugify, getStats, type Org, getAllProjects, getAllBenchmarks } from "./lib/data";

const ORG_TYPES = [
  { value: "all", label: "All" },
  { value: "Government AISI", label: "Government" },
  { value: "Lab Safety Team", label: "Labs" },
  { value: "Nonprofit", label: "Nonprofits" },
  { value: "Academic", label: "Academic" },
  { value: "Think Tank", label: "Think Tanks" },
];

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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function OrgCard({ org, index }: { org: Org; index: number }) {
  const projectCount = org.projects?.length || 0;
  const publishedCount = org.projects?.filter(p => p.status === "published").length || 0;
  const activeCount = org.projects?.filter(p => p.status === "Active").length || 0;

  return (
    <article
      className="paper-card rounded-sm p-6 animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="research-tag">{org.type}</span>
        <span className="text-xs text-[var(--muted-light)]">{org.country}</span>
      </div>

      <h3 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-2 leading-tight">
        <Link 
          href={`/org/${slugify(org.name)}`}
          className="hover:text-[var(--accent)] transition-colors no-underline"
        >
          {org.name}
        </Link>
      </h3>

      {org.mission && (
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">
          {org.mission}
        </p>
      )}

      {org.focus_areas && org.focus_areas.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
            Research Areas:{" "}
          </span>
          <span className="text-xs text-[var(--foreground-secondary)]">
            {org.focus_areas.join(" · ")}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        {projectCount > 0 && (
          <div className="flex items-center gap-1.5">
            <BookIcon className="w-3.5 h-3.5" />
            <span>{projectCount} projects</span>
          </div>
        )}
        {publishedCount > 0 && (
          <span className="text-[var(--success)]">{publishedCount} published</span>
        )}
        {activeCount > 0 && (
          <span className="text-[var(--warning)]">{activeCount} active</span>
        )}
        <a
          href={org.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[var(--accent)] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Visit <ExternalLinkIcon className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}

// AI Search result types
type SearchResult = {
  type: "org" | "project" | "benchmark";
  name: string;
  slug: string;
  description?: string;
  score: number;
};

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const searchRef = useRef<HTMLDivElement>(null);
  const stats = getStats();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AI Search function - searches across all entities
  const performAiSearch = (query: string) => {
    if (!query.trim()) {
      setAiResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search organizations
    orgs.forEach((org) => {
      let score = 0;
      if (org.name.toLowerCase().includes(queryLower)) score += 10;
      if (org.mission?.toLowerCase().includes(queryLower)) score += 5;
      if (org.focus_areas?.some(a => a.toLowerCase().includes(queryLower))) score += 3;
      if (score > 0) {
        results.push({
          type: "org",
          name: org.name,
          slug: slugify(org.name),
          description: org.mission?.slice(0, 100),
          score,
        });
      }
    });

    // Search projects
    const projects = getAllProjects();
    projects.forEach((project) => {
      let score = 0;
      if (project.name.toLowerCase().includes(queryLower)) score += 10;
      if (project.description?.toLowerCase().includes(queryLower)) score += 5;
      if (score > 0) {
        results.push({
          type: "project",
          name: project.name,
          slug: slugify(project.name),
          description: project.description?.slice(0, 100),
          score,
        });
      }
    });

    // Search benchmarks
    const benchmarks = getAllBenchmarks();
    benchmarks.forEach((benchmark) => {
      let score = 0;
      if (benchmark.name.toLowerCase().includes(queryLower)) score += 10;
      if (benchmark.measures?.toLowerCase().includes(queryLower)) score += 5;
      if (score > 0) {
        results.push({
          type: "benchmark",
          name: benchmark.name,
          slug: slugify(benchmark.name),
          description: benchmark.measures?.slice(0, 100),
          score,
        });
      }
    });

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    setAiResults(results.slice(0, 8));
    setIsSearching(false);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performAiSearch(aiQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [aiQuery]);

  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      const matchesSearch =
        search === "" ||
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.mission?.toLowerCase().includes(search.toLowerCase()) ||
        org.focus_areas?.some((area) =>
          area.toLowerCase().includes(search.toLowerCase())
        );

      const matchesType = typeFilter === "all" || org.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setAiQuery("");
    router.push(`/${result.type}/${result.slug}`);
  };

  const typeLabels = {
    org: "Organization",
    project: "Project",
    benchmark: "Benchmark",
  };

  const typeColors = {
    org: "bg-blue-100 text-blue-700",
    project: "bg-emerald-100 text-emerald-700",
    benchmark: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] tracking-tight">
                AI Safety Research Hub
              </h1>
              <p className="text-[var(--muted)] mt-2 max-w-xl">
                A comprehensive directory of AI safety organizations, research projects, 
                publications, and open problems
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/about" 
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline"
              >
                About
              </Link>
              <a 
                href="https://github.com/afiorg9000/aisafetyresearchhub" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.417 2.865 8.17 6.821 9.504.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.364-1.34-3.364-1.34-.455-1.157-1.11-1.465-1.11-1.465-.908-.618.069-.606.069-.606 1.003.07 1.531 1.032 1.531 1.032.892 1.529 2.341 1.084 2.902.829.091-.645.356-1.084.654-1.33-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="relative mt-6 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--accent)]" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => {
                  setAiQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search organizations, projects, benchmarks..."
                className="w-full pl-12 pr-4 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] hover:border-[var(--border-dark)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] focus:outline-none transition-all"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && aiQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
                {aiResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {aiResults.map((result, i) => (
                      <button
                        key={`${result.type}-${result.slug}-${i}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-[var(--background-alt)] transition-colors border-b border-[var(--border)] last:border-b-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColors[result.type]}`}>
                            {typeLabels[result.type]}
                          </span>
                          <span className="font-medium text-[var(--foreground)]">{result.name}</span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-[var(--muted)] line-clamp-1">
                            {result.description}...
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-[var(--muted)]">
                    <p>No results found for &quot;{aiQuery}&quot;</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div>
              <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.orgs}</span>
              <span className="text-sm text-[var(--muted)] ml-2">Organizations</span>
            </div>
            <div>
              <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.projects}</span>
              <span className="text-sm text-[var(--muted)] ml-2">Projects</span>
            </div>
            <div>
              <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.benchmarks}</span>
              <span className="text-sm text-[var(--muted)] ml-2">Benchmarks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link 
              href="/" 
              className="font-medium text-[var(--foreground)] no-underline border-b-2 border-[var(--accent)] pb-3 -mb-3"
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
              className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent"
            >
              Open Problems
            </Link>
            <Link 
              href="/submit" 
              className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent"
            >
              Submit
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Organizations */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter organizations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)] transition-all"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {ORG_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTypeFilter(type.value)}
                    className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                      typeFilter === type.value
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <p className="text-sm text-[var(--muted)] mb-4">
              Showing {filteredOrgs.length} of {orgs.length} organizations
            </p>

            {filteredOrgs.length === 0 ? (
              <div className="text-center py-16 paper-card rounded-sm">
                <p className="text-[var(--muted)]">No organizations found</p>
                <button
                  onClick={() => { setSearch(""); setTypeFilter("all"); }}
                  className="mt-4 text-sm text-[var(--accent)] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrgs.slice(0, 10).map((org, index) => (
                  <OrgCard key={org.name} org={org} index={index} />
                ))}
                {filteredOrgs.length > 10 && (
                  <div className="text-center py-4">
                    <Link
                      href="/search"
                      className="text-sm text-[var(--accent)] hover:underline"
                    >
                      View all {filteredOrgs.length} organizations →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* Quick Stats Card */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-4">
                Database Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.orgs}</p>
                  <p className="text-xs text-[var(--muted)]">Organizations</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.projects}</p>
                  <p className="text-xs text-[var(--muted)]">Projects</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.benchmarks}</p>
                  <p className="text-xs text-[var(--muted)]">Benchmarks</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.publications}</p>
                  <p className="text-xs text-[var(--muted)]">Publications</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-4">
                Contribute
              </h2>
              <div className="space-y-3">
                <Link
                  href="/submit"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--accent)] text-sm font-medium rounded text-center hover:bg-[var(--accent-light)] transition-colors no-underline"
                  style={{ color: '#ffffff' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Organization
                </Link>
                <Link
                  href="/problems/submit"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] text-sm font-medium rounded text-center hover:border-[var(--border-dark)] transition-colors no-underline text-[var(--foreground)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                  Submit Problem
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-4">
                Explore
              </h2>
              <div className="space-y-2">
                <Link
                  href="/publications"
                  className="flex items-center gap-2 p-2 rounded hover:bg-[var(--background-alt)] transition-colors no-underline"
                >
                  <BookIcon className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm text-[var(--foreground)]">Browse Publications</span>
                </Link>
                <Link
                  href="/benchmarks"
                  className="flex items-center gap-2 p-2 rounded hover:bg-[var(--background-alt)] transition-colors no-underline"
                >
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                  <span className="text-sm text-[var(--foreground)]">View Benchmarks</span>
                </Link>
                <Link
                  href="/problems"
                  className="flex items-center gap-2 p-2 rounded hover:bg-[var(--background-alt)] transition-colors no-underline"
                >
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                  <span className="text-sm text-[var(--foreground)]">Open Problems</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--muted)]">
              <p>AI Safety Research Hub — A community resource for AI safety research coordination</p>
              <p className="mt-1">Data compiled from public sources. Last updated December 2024.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">About</Link>
              <Link href="/submit" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Contribute</Link>
              <a href="https://github.com" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orgs, slugify, getStats, type Org } from "./lib/data";
import { UserMenu } from "./components/user-menu";

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

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [heroSearch, setHeroSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const stats = getStats();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

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
            <UserMenu />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleHeroSearch} className="mt-6 w-full max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search organizations, publications, benchmarks, problems..."
                className="w-full pl-12 pr-4 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all"
              />
            </div>
          </form>

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

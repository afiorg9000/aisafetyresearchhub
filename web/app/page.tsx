"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orgs, slugify, getStats, getAllProjects, getAllBenchmarks, type Org, type Project, type Benchmark } from "./lib/data";
import { UserMenu } from "./components/user-menu";

// Tab types
type TabType = "organizations" | "publications" | "benchmarks" | "problems";

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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

// Organization Card
function OrgCard({ org, index }: { org: Org; index: number }) {
  const projectCount = org.projects?.length || 0;
  const publishedCount = org.projects?.filter(p => p.status === "published").length || 0;
  const activeCount = org.projects?.filter(p => p.status === "Active").length || 0;

  return (
    <article
      className="paper-card rounded-sm p-6 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
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

// Publication Card
function PublicationCard({ project, index }: { project: Project & { org: Org }; index: number }) {
  return (
    <article
      className="paper-card rounded-sm p-5 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="research-tag !bg-amber-50 !text-amber-700 !border-amber-200">Publication</span>
            <span className="text-xs text-[var(--muted)]">{project.org.name}</span>
          </div>
          <h3 className="font-serif text-base font-medium text-[var(--foreground)] mb-1 leading-snug">
            {project.paper_url ? (
              <a href={project.paper_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                {project.name}
              </a>
            ) : (
              <Link href={`/project/${slugify(project.name)}`} className="hover:text-[var(--accent)] transition-colors no-underline">
                {project.name}
              </Link>
            )}
          </h3>
          {project.description && (
            <p className="text-sm text-[var(--muted)] line-clamp-2">{project.description}</p>
          )}
        </div>
        {project.paper_url && (
          <a href={project.paper_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 text-[var(--muted)] hover:text-[var(--accent)]">
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}

// Benchmark Card
function BenchmarkCard({ benchmark, index }: { benchmark: Benchmark & { org: Org }; index: number }) {
  return (
    <article
      className="paper-card rounded-sm p-5 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="research-tag !bg-purple-50 !text-purple-700 !border-purple-200">Benchmark</span>
        <span className="text-xs text-[var(--muted)]">{benchmark.org.name}</span>
        {benchmark.status && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${benchmark.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}>
            {benchmark.status}
          </span>
        )}
      </div>
      <h3 className="font-serif text-base font-medium text-[var(--foreground)] mb-1">
        <Link href={`/benchmark/${slugify(benchmark.name)}`} className="hover:text-[var(--accent)] transition-colors no-underline">
          {benchmark.name}
        </Link>
      </h3>
      {benchmark.measures && (
        <p className="text-sm text-[var(--muted)] line-clamp-2">{benchmark.measures}</p>
      )}
    </article>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("organizations");
  const [searchQuery, setSearchQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const stats = getStats();

  // Get all data
  const allProjects = useMemo(() => getAllProjects(), []);
  const allBenchmarks = useMemo(() => getAllBenchmarks(), []);
  const publications = useMemo(() => allProjects.filter(p => p.status === "published" || p.paper_url), [allProjects]);

  // Handle AI search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter organizations
  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      const matchesSearch = orgFilter === "" ||
        org.name.toLowerCase().includes(orgFilter.toLowerCase()) ||
        org.mission?.toLowerCase().includes(orgFilter.toLowerCase()) ||
        org.focus_areas?.some((area) => area.toLowerCase().includes(orgFilter.toLowerCase()));
      const matchesType = typeFilter === "all" || org.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [orgFilter, typeFilter]);

  // Filter publications
  const filteredPublications = useMemo(() => {
    if (!orgFilter) return publications;
    return publications.filter((p) =>
      p.name.toLowerCase().includes(orgFilter.toLowerCase()) ||
      p.description?.toLowerCase().includes(orgFilter.toLowerCase()) ||
      p.org.name.toLowerCase().includes(orgFilter.toLowerCase())
    );
  }, [publications, orgFilter]);

  // Filter benchmarks
  const filteredBenchmarks = useMemo(() => {
    if (!orgFilter) return allBenchmarks;
    return allBenchmarks.filter((b) =>
      b.name.toLowerCase().includes(orgFilter.toLowerCase()) ||
      b.measures?.toLowerCase().includes(orgFilter.toLowerCase()) ||
      b.org.name.toLowerCase().includes(orgFilter.toLowerCase())
    );
  }, [allBenchmarks, orgFilter]);

  const tabs = [
    { id: "organizations" as TabType, label: "Organizations", count: orgs.length },
    { id: "publications" as TabType, label: "Publications", count: publications.length },
    { id: "benchmarks" as TabType, label: "Benchmarks", count: allBenchmarks.length },
    { id: "problems" as TabType, label: "Open Problems", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Header with AI Search */}
      <header className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--background)]">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-12">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="font-serif text-xl font-semibold text-[var(--foreground)]">
              AI Safety Research Hub
            </h1>
            <UserMenu />
          </div>

          {/* Centered hero content */}
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] tracking-tight mb-4">
              Explore AI Safety Research
            </h2>
            <p className="text-[var(--muted)] mb-8 max-w-xl mx-auto">
              Search across {stats.orgs} organizations, {stats.publications} publications, and {stats.benchmarks} benchmarks
            </p>

            {/* AI Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
                <div className="relative flex items-center bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
                  <SparklesIcon className="w-5 h-5 ml-4 text-[var(--accent)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask anything about AI safety research..."
                    className="flex-1 px-4 py-4 bg-transparent text-base placeholder:text-[var(--muted)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="m-2 px-5 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-light)] transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-[var(--muted)]">Try:</span>
              {["Who works on interpretability?", "RLHF research", "Deception benchmarks", "UK AISI projects"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSearchQuery(q);
                    router.push(`/search?q=${encodeURIComponent(q)}`);
                  }}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm">
              <div>
                <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.people || 37}</span>
                <span className="text-[var(--muted)] ml-2">Researchers</span>
              </div>
              <div className="text-[var(--border)]">·</div>
              <div>
                <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.orgs}</span>
                <span className="text-[var(--muted)] ml-2">Organizations</span>
              </div>
              <div className="text-[var(--border)]">·</div>
              <div>
                <span className="text-2xl font-serif font-semibold text-[var(--foreground)]">{stats.projects}</span>
                <span className="text-[var(--muted)] ml-2">Projects</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Same page switching */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1 py-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-[var(--foreground)] border-[var(--accent)]"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-[var(--muted-light)]">({tab.count})</span>
              </button>
            ))}
            <Link
              href="/submit"
              className="ml-auto px-4 py-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)] whitespace-nowrap no-underline"
            >
              + Submit
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2">
            {/* Filter bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder={`Filter ${activeTab}...`}
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)] transition-all"
                />
              </div>
              {activeTab === "organizations" && (
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
              )}
            </div>

            {/* Organizations Tab */}
            {activeTab === "organizations" && (
              <>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Showing {filteredOrgs.length} of {orgs.length} organizations
                </p>
                {filteredOrgs.length === 0 ? (
                  <div className="text-center py-16 paper-card rounded-sm">
                    <p className="text-[var(--muted)]">No organizations found</p>
                    <button
                      onClick={() => { setOrgFilter(""); setTypeFilter("all"); }}
                      className="mt-4 text-sm text-[var(--accent)] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrgs.map((org, index) => (
                      <OrgCard key={org.name} org={org} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Publications Tab */}
            {activeTab === "publications" && (
              <>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Showing {filteredPublications.length} publications
                </p>
                {filteredPublications.length === 0 ? (
                  <div className="text-center py-16 paper-card rounded-sm">
                    <p className="text-[var(--muted)]">No publications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPublications.slice(0, 20).map((project, index) => (
                      <PublicationCard key={`${project.org.name}-${project.name}`} project={project} index={index} />
                    ))}
                    {filteredPublications.length > 20 && (
                      <p className="text-center text-sm text-[var(--muted)] py-4">
                        Showing 20 of {filteredPublications.length} publications. Use search for more.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Benchmarks Tab */}
            {activeTab === "benchmarks" && (
              <>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Showing {filteredBenchmarks.length} benchmarks
                </p>
                {filteredBenchmarks.length === 0 ? (
                  <div className="text-center py-16 paper-card rounded-sm">
                    <p className="text-[var(--muted)]">No benchmarks found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBenchmarks.map((benchmark, index) => (
                      <BenchmarkCard key={`${benchmark.org.name}-${benchmark.name}`} benchmark={benchmark} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Open Problems Tab */}
            {activeTab === "problems" && (
              <div className="text-center py-16 paper-card rounded-sm">
                <svg className="w-12 h-12 mx-auto text-[var(--muted-light)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-2">
                  Open Problems Coming Soon
                </h3>
                <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
                  A community-curated list of important unsolved research questions in AI safety.
                  Vote, discuss, and track who&apos;s working on what.
                </p>
                <Link
                  href="/problems/submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-light)] transition-colors no-underline"
                >
                  Submit the First Problem
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Quick Stats Card */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-4">
                Database Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.people || 37}</p>
                  <p className="text-xs text-[var(--muted)]">Researchers</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.orgs}</p>
                  <p className="text-xs text-[var(--muted)]">Organizations</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.publications}</p>
                  <p className="text-xs text-[var(--muted)]">Publications</p>
                </div>
                <div className="text-center p-3 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <p className="text-2xl font-serif font-semibold text-[var(--accent)]">{stats.benchmarks}</p>
                  <p className="text-xs text-[var(--muted)]">Benchmarks</p>
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded text-center hover:bg-[var(--accent-light)] transition-colors no-underline"
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

            {/* About */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-3">
                About
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                An independent directory connecting AI safety researchers, organizations, and open problems worldwide.
              </p>
              <Link
                href="/about"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Learn more →
              </Link>
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
              <a href="https://github.com/afiorg9000/aisafetyresearchhub" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

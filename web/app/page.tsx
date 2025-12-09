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
      className="paper-card rounded p-5 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--muted)] uppercase tracking-wide">{org.type}</span>
            <span className="text-xs text-[var(--muted-light)]">·</span>
            <span className="text-xs text-[var(--muted-light)]">{org.country}</span>
          </div>
          
          <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-1.5 leading-snug">
            <Link 
              href={`/org/${slugify(org.name)}`}
              className="hover:text-[var(--accent)] transition-colors no-underline"
            >
              {org.name}
            </Link>
          </h3>

          {org.mission && (
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-3 line-clamp-2">
              {org.mission}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            {projectCount > 0 && (
              <span>{projectCount} projects</span>
            )}
            {publishedCount > 0 && (
              <span className="text-[var(--success)]">{publishedCount} published</span>
            )}
            {activeCount > 0 && (
              <span className="text-[var(--warning)]">{activeCount} active</span>
            )}
          </div>
        </div>
        
        <a
          href={org.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 text-[var(--muted-light)] hover:text-[var(--accent)] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
      </div>
    </article>
  );
}

// Publication Card - more like a citation
function PublicationCard({ project, index }: { project: Project & { org: Org }; index: number }) {
  return (
    <article
      className="py-4 border-b border-[var(--border)] last:border-0 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
    >
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
      <p className="text-sm text-[var(--muted)] mb-1">{project.org.name}</p>
      {project.description && (
        <p className="text-sm text-[var(--muted-light)] line-clamp-1">{project.description}</p>
      )}
    </article>
  );
}

// Benchmark Card
function BenchmarkCard({ benchmark, index }: { benchmark: Benchmark & { org: Org }; index: number }) {
  return (
    <article
      className="py-4 border-b border-[var(--border)] last:border-0 animate-fadeIn"
      style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-base font-medium text-[var(--foreground)] mb-1">
            <Link href={`/benchmark/${slugify(benchmark.name)}`} className="hover:text-[var(--accent)] transition-colors no-underline">
              {benchmark.name}
            </Link>
          </h3>
          <p className="text-sm text-[var(--muted)]">{benchmark.org.name}</p>
          {benchmark.measures && (
            <p className="text-sm text-[var(--muted-light)] mt-1 line-clamp-1">{benchmark.measures}</p>
          )}
        </div>
        {benchmark.status && (
          <span className={`text-xs px-2 py-0.5 rounded ${benchmark.status === "Active" ? "bg-[var(--background-alt)] text-[var(--success)]" : "bg-[var(--background-alt)] text-[var(--muted)]"}`}>
            {benchmark.status}
          </span>
        )}
      </div>
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

  // Handle search submission
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
      {/* Minimal Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="font-serif text-xl font-semibold text-[var(--foreground)]">
              AI Safety Research Hub
            </h1>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/about" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">About</Link>
              <Link href="/submit" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Submit</Link>
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Search Section - Clean and academic */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted)] uppercase tracking-widest mb-3">Research Database</p>
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[var(--foreground)] mb-6">
            Search AI Safety Literature
          </h2>
          
          {/* Search Bar - Simple and clean */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-6">
            <div className="flex border border-[var(--border)] rounded bg-[var(--background)] focus-within:border-[var(--accent)] transition-colors">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations, publications, benchmarks..."
                className="flex-1 px-4 py-3 bg-transparent text-base placeholder:text-[var(--muted-light)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors border-l border-[var(--border)]"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Stats - Understated */}
          <p className="text-sm text-[var(--muted)]">
            {stats.people || 37} researchers · {stats.orgs} organizations · {stats.publications} publications · {stats.benchmarks} benchmarks
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="border-b border-[var(--border)] sticky top-0 z-10 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setOrgFilter(""); }}
                className={`py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-[var(--foreground)] border-[var(--foreground)] font-medium"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-3">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Filter ${activeTab}...`}
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              {activeTab === "organizations" && (
                <div className="flex gap-1 overflow-x-auto">
                  {ORG_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTypeFilter(type.value)}
                      className={`px-3 py-1.5 text-xs rounded whitespace-nowrap transition-colors ${
                        typeFilter === type.value
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
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
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-4">
                  {filteredOrgs.length} results
                </p>
                {filteredOrgs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--muted)]">No organizations found</p>
                    <button
                      onClick={() => { setOrgFilter(""); setTypeFilter("all"); }}
                      className="mt-2 text-sm text-[var(--accent)] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-4">
                  {filteredPublications.length} results
                </p>
                {filteredPublications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--muted)]">No publications found</p>
                  </div>
                ) : (
                  <div className="paper-card rounded p-6">
                    {filteredPublications.slice(0, 25).map((project, index) => (
                      <PublicationCard key={`${project.org.name}-${project.name}`} project={project} index={index} />
                    ))}
                    {filteredPublications.length > 25 && (
                      <p className="text-center text-sm text-[var(--muted)] pt-4">
                        Showing 25 of {filteredPublications.length}. Use search for more specific results.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Benchmarks Tab */}
            {activeTab === "benchmarks" && (
              <>
                <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-4">
                  {filteredBenchmarks.length} results
                </p>
                {filteredBenchmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--muted)]">No benchmarks found</p>
                  </div>
                ) : (
                  <div className="paper-card rounded p-6">
                    {filteredBenchmarks.map((benchmark, index) => (
                      <BenchmarkCard key={`${benchmark.org.name}-${benchmark.name}`} benchmark={benchmark} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Open Problems Tab */}
            {activeTab === "problems" && (
              <div className="paper-card rounded p-8 text-center">
                <BookIcon className="w-10 h-10 mx-auto text-[var(--muted-light)] mb-4" />
                <h3 className="font-serif text-lg font-medium text-[var(--foreground)] mb-2">
                  Open Problems
                </h3>
                <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
                  A community-curated collection of important unsolved research questions in AI safety. 
                  Coming soon.
                </p>
                <Link
                  href="/problems/submit"
                  className="inline-block px-4 py-2 text-sm text-[var(--accent)] border border-[var(--accent)] rounded hover:bg-[var(--accent)] hover:text-white transition-colors no-underline"
                >
                  Submit a Problem
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Quick Stats */}
            <div>
              <h3 className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Database</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Researchers</span>
                  <span className="font-medium text-[var(--foreground)]">{stats.people || 37}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Organizations</span>
                  <span className="font-medium text-[var(--foreground)]">{stats.orgs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Publications</span>
                  <span className="font-medium text-[var(--foreground)]">{stats.publications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Benchmarks</span>
                  <span className="font-medium text-[var(--foreground)]">{stats.benchmarks}</span>
                </div>
              </div>
            </div>

            {/* Browse by Type */}
            <div>
              <h3 className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Browse by Type</h3>
              <div className="space-y-1">
                {["Government AISI", "Lab Safety Team", "Nonprofit", "Academic", "Think Tank"].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setActiveTab("organizations"); setTypeFilter(type); }}
                    className="block w-full text-left text-sm text-[var(--muted)] hover:text-[var(--foreground)] py-1 transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Contribute */}
            <div>
              <h3 className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Contribute</h3>
              <div className="space-y-2">
                <Link
                  href="/submit"
                  className="block text-sm text-[var(--accent)] hover:underline"
                >
                  Submit organization →
                </Link>
                <Link
                  href="/problems/submit"
                  className="block text-sm text-[var(--accent)] hover:underline"
                >
                  Submit open problem →
                </Link>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">About</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                An independent directory of AI safety research organizations, publications, and open problems.
              </p>
              <Link
                href="/about"
                className="block text-sm text-[var(--accent)] hover:underline mt-2"
              >
                Learn more →
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--muted)]">
            <p>AI Safety Research Hub · Data from public sources · December 2024</p>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-[var(--foreground)] no-underline">About</Link>
              <Link href="/submit" className="hover:text-[var(--foreground)] no-underline">Contribute</Link>
              <a href="https://github.com/afiorg9000/aisafetyresearchhub" className="hover:text-[var(--foreground)] no-underline">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

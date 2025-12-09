"use client";

import { useState, useMemo } from "react";
import { orgs } from "../lib/data";
import { SiteHeader, SiteFooter } from "../components/site-header";

// Extract all publications from all orgs
function getAllPublications() {
  const publications: Array<{
    title: string;
    url?: string;
    authors?: string;
    org: string;
    status: string;
  }> = [];

  for (const org of orgs) {
    if (org.projects) {
      for (const project of org.projects) {
        // Include published papers or projects with paper URLs
        if (project.status === "published" || project.paper_url) {
          publications.push({
            title: project.name,
            url: project.paper_url || "",
            authors: project.description?.replace("Research paper by MATS scholars. Authors: ", ""),
            org: org.name,
            status: project.status || "published",
          });
        }
      }
    }
  }

  return publications.sort((a, b) => a.title.localeCompare(b.title));
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function getSourceFromUrl(url: string): string {
  if (url.includes("arxiv")) return "arXiv";
  if (url.includes("lesswrong")) return "LessWrong";
  if (url.includes("openreview")) return "OpenReview";
  if (url.includes("anthropic")) return "Anthropic";
  if (url.includes("zenodo")) return "Zenodo";
  return "Paper";
}

export default function PublicationsPage() {
  const [search, setSearch] = useState("");
  const publications = useMemo(() => getAllPublications(), []);

  const filteredPubs = useMemo(() => {
    if (!search) return publications;
    const q = search.toLowerCase();
    return publications.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.authors?.toLowerCase().includes(q) ||
        p.org.toLowerCase().includes(q)
    );
  }, [search, publications]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-2">
            Publications
          </h1>
          <p className="text-[var(--muted)]">
            Research papers and publications from AI safety organizations
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Filter by title, author, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)] transition-all"
          />
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-6">
          {filteredPubs.length} publication{filteredPubs.length !== 1 ? "s" : ""}
        </p>

        {/* Publications List - Academic Style */}
        <div className="space-y-6">
          {filteredPubs.map((pub, index) => (
            <article
              key={index}
              className="paper-card rounded-sm p-5 animate-fadeIn"
              style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
            >
              {/* Title */}
              <h3 className="font-serif text-lg font-medium text-[var(--foreground)] leading-snug mb-2">
                {pub.url ? (
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {pub.title}
                  </a>
                ) : (
                  pub.title
                )}
              </h3>

              {/* Authors */}
              {pub.authors && !pub.authors.includes("Research paper") && (
                <p className="text-sm text-[var(--muted)] mb-3">
                  {pub.authors}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-[var(--muted-light)]">
                <span>{pub.org}</span>
                {pub.url && (
                  <>
                    <span>·</span>
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--accent)] hover:underline"
                    >
                      {getSourceFromUrl(pub.url)}
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredPubs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--muted)]">No publications found matching your search.</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-sm text-[var(--accent)] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

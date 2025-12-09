"use client";

import { useMemo } from "react";
import Link from "next/link";
import { orgs, slugify } from "../lib/data";
import { SiteHeader, SiteFooter } from "../components/site-header";

// Extract all benchmarks from all orgs
function getAllBenchmarks() {
  const benchmarks: Array<{
    name: string;
    measures?: string;
    paper_url?: string;
    status?: string;
    org: string;
    orgSlug: string;
  }> = [];

  for (const org of orgs) {
    if (org.benchmarks) {
      for (const benchmark of org.benchmarks) {
        benchmarks.push({
          ...benchmark,
          org: org.name,
          orgSlug: slugify(org.name),
        });
      }
    }
  }

  return benchmarks.sort((a, b) => a.name.localeCompare(b.name));
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

export default function BenchmarksPage() {
  const benchmarks = useMemo(() => getAllBenchmarks(), []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SiteHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-2">
            Evaluation Benchmarks
          </h1>
          <p className="text-[var(--muted)]">
            Standardized benchmarks and evaluation frameworks for AI safety research
          </p>
        </div>

        {/* Benchmarks Count */}
        <p className="text-sm text-[var(--muted)] mb-6">
          {benchmarks.length} benchmark{benchmarks.length !== 1 ? "s" : ""} catalogued
        </p>

        {/* Benchmarks Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {benchmarks.map((benchmark, index) => (
            <article
              key={index}
              className="paper-card rounded-sm p-5 animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status Badge */}
              {benchmark.status && (
                <span className={`research-tag mb-3 ${
                  benchmark.status === "Active" 
                    ? "!bg-green-50 !text-green-700 !border-green-200" 
                    : ""
                }`}>
                  {benchmark.status}
                </span>
              )}

              {/* Name */}
              <h3 className="font-serif text-lg font-medium text-[var(--foreground)] mb-2">
                <Link
                  href={`/benchmark/${slugify(benchmark.name)}`}
                  className="hover:text-[var(--accent)] transition-colors no-underline"
                >
                  {benchmark.name}
                </Link>
              </h3>

              {/* Measures */}
              {benchmark.measures && (
                <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">
                  <span className="font-medium">Measures:</span> {benchmark.measures}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-light)]">
                <Link
                  href={`/org/${benchmark.orgSlug}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {benchmark.org}
                </Link>
                {benchmark.paper_url && (
                  <>
                    <span>·</span>
                    <a
                      href={benchmark.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--accent)] hover:underline"
                    >
                      Paper <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        {benchmarks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--muted)]">No benchmarks catalogued yet.</p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

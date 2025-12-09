"use client";

import { use } from "react";
import Link from "next/link";
import { getOpenProblemBySlug, getAllOpenProblems, type OpenProblem } from "../../lib/data";

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
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

const difficultyDescriptions: Record<string, string> = {
  foundational: "Core unsolved problem that may require fundamental breakthroughs",
  hard: "Significant research challenge requiring substantial effort",
  medium: "Important problem with potential near-term solutions",
};

function ProblemContent({ problem }: { problem: OpenProblem }) {
  // Get related problems (same focus area)
  const allProblems = getAllOpenProblems();
  const relatedProblems = allProblems
    .filter(p => p.focus_area === problem.focus_area && p.slug !== problem.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            AI Safety Research Hub
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/problems"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6 no-underline"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>All Open Problems</span>
        </Link>

        {/* Main content */}
        <div className="paper-card rounded-sm p-8 mb-6">
          {/* Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="research-tag">{problem.focus_area}</span>
            <span className={`research-tag ${statusColors[problem.status]}`}>
              {problem.status.replace("_", " ")}
            </span>
            <span className={`research-tag ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-4 leading-tight">
            {problem.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-6 pb-6 border-b border-[var(--border)]">
            <span>Submitted by {problem.submitted_by}</span>
            <span>·</span>
            <span>{problem.created_at}</span>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-wrap mb-8">
            {problem.description}
          </div>

          {/* Difficulty explanation */}
          <div className="p-4 bg-[var(--background-alt)] rounded border border-[var(--border)] mb-6">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
              Difficulty: {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {difficultyDescriptions[problem.difficulty]}
            </p>
          </div>

          {/* Related Work */}
          {problem.related_work && problem.related_work.length > 0 && (
            <div>
              <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-3">
                Related Work & References
              </h3>
              <ul className="space-y-2">
                {problem.related_work.map((work, i) => (
                  <li key={i} className="text-sm text-[var(--foreground-secondary)] flex items-start gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Related Problems */}
        {relatedProblems.length > 0 && (
          <div className="paper-card rounded-sm p-6 mb-6">
            <h2 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-4">
              Related Problems in {problem.focus_area}
            </h2>
            <div className="space-y-3">
              {relatedProblems.map((related) => (
                <Link
                  key={related.slug}
                  href={`/problem/${related.slug}`}
                  className="block p-4 bg-[var(--background)] rounded border border-[var(--border)] hover:border-[var(--border-dark)] transition-colors no-underline"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`research-tag text-xs ${statusColors[related.status]}`}>
                      {related.status.replace("_", " ")}
                    </span>
                    <span className={`research-tag text-xs ${difficultyColors[related.difficulty]}`}>
                      {related.difficulty}
                    </span>
                  </div>
                  <h3 className="font-medium text-[var(--foreground)]">{related.title}</h3>
                  <p className="text-sm text-[var(--muted)] mt-1 line-clamp-1">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="paper-card rounded-sm p-6 text-center">
          <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-2">
            Working on this problem?
          </h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            If you&apos;re researching this problem or have relevant work, we&apos;d love to hear about it.
          </p>
          <Link
            href="/submit"
            className="inline-block px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
          >
            Submit Your Work
          </Link>
        </div>
      </div>

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

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const problem = getOpenProblemBySlug(slug);

  // Show not found state when problem doesn't exist
  if (!problem) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
              AI Safety Research Hub
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6 no-underline"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>All Open Problems</span>
          </Link>

          <div className="text-center py-16 paper-card rounded-sm">
            <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-4">
              Problem Not Found
            </h1>
            <p className="text-[var(--muted)] mb-6">
              This problem doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/problems"
              className="inline-block px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
            >
              Browse All Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProblemContent problem={problem} />;
}

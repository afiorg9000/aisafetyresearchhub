"use client";

import { useState } from "react";
import Link from "next/link";

type MatchResult = {
  type: "publication" | "project" | "organization";
  title: string;
  org?: string;
  overlap: string;
  relevance: "high" | "medium" | "low";
  slug: string;
};

type MatchResponse = {
  has_overlap: boolean;
  overlap_summary: string;
  matches: MatchResult[];
  gaps: string[];
  recommendation: string;
  potential_collaborators?: string[];
};

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

const RELEVANCE_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

export default function ResearchMatcherPage() {
  const [idea, setIdea] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);

  async function handleMatch() {
    if (!idea.trim()) return;
    
    setIsMatching(true);
    
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        has_overlap: false,
        overlap_summary: "Error analyzing idea. Please try again.",
        matches: [],
        gaps: [],
        recommendation: "Please try again.",
      });
    } finally {
      setIsMatching(false);
    }
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
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Open Problems</Link>
            <Link href="/search" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Search</Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--accent)] uppercase tracking-wide">Research Idea Matcher</span>
          </div>
          
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mb-4">
            Does this research already exist?
          </h1>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            Describe your research idea and we'll check if similar work exists, 
            show you the overlap, and help you find collaborators or gaps to explore.
          </p>
        </div>

        {/* Input */}
        <div className="paper-card rounded-sm p-6 mb-8">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Describe your research idea
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: I want to study whether language models can be trained to accurately report their own uncertainty, especially in cases where they're likely to be wrong..."
            className="w-full h-32 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all resize-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">
              Be specific about the approach, not just the topic
            </span>
            <button
              onClick={handleMatch}
              disabled={isMatching || !idea.trim()}
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isMatching ? "Analyzing..." : "Check for Overlap"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isMatching && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-[var(--muted)]">Analyzing your idea against 700+ papers...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isMatching && (
          <div className="space-y-6">
            {/* Main verdict */}
            <div className={`paper-card rounded-sm p-6 ${result.has_overlap ? "border-l-4 border-l-yellow-500" : "border-l-4 border-l-green-500"}`}>
              <div className="flex items-start gap-4">
                {result.has_overlap ? (
                  <XCircleIcon className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                ) : (
                  <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                )}
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-2">
                    {result.has_overlap ? "Similar work exists" : "Novel research direction!"}
                  </h2>
                  <p className="text-[var(--muted)]">{result.overlap_summary}</p>
                </div>
              </div>
            </div>

            {/* Matches */}
            {result.matches && result.matches.length > 0 && (
              <div className="paper-card rounded-sm p-6">
                <h3 className="font-medium text-[var(--foreground)] mb-4">Related Existing Work</h3>
                <div className="space-y-4">
                  {result.matches.map((match, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border ${RELEVANCE_COLORS[match.relevance]}`}>
                          {match.relevance} overlap
                        </span>
                        {match.org && (
                          <span className="text-xs text-[var(--muted)]">{match.org}</span>
                        )}
                      </div>
                      <h4 className="font-medium text-[var(--foreground)] mb-1">
                        <Link href={`/project/${match.slug}`} className="hover:text-[var(--accent)] no-underline">
                          {match.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-[var(--muted)]">
                        <span className="text-[var(--foreground)]">Overlap:</span> {match.overlap}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {result.gaps && result.gaps.length > 0 && (
              <div className="paper-card rounded-sm p-6 bg-gradient-to-r from-green-50 to-[var(--background)]">
                <h3 className="font-medium text-[var(--foreground)] mb-3">Potential Gaps to Explore</h3>
                <ul className="space-y-2">
                  {result.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-[var(--muted)] flex gap-2">
                      <span className="text-green-600">→</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential collaborators */}
            {result.potential_collaborators && result.potential_collaborators.length > 0 && (
              <div className="paper-card rounded-sm p-6">
                <h3 className="font-medium text-[var(--foreground)] mb-3">Potential Collaborators</h3>
                <p className="text-sm text-[var(--muted)] mb-3">
                  These researchers/orgs are working on related topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.potential_collaborators.map((collab, i) => (
                    <span key={i} className="text-sm px-3 py-1 bg-[var(--background-alt)] text-[var(--foreground)] rounded">
                      {collab}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="paper-card rounded-sm p-6">
              <h3 className="font-medium text-[var(--foreground)] mb-2">Recommendation</h3>
              <p className="text-[var(--muted)]">{result.recommendation}</p>
              
              <div className="mt-4 flex gap-3">
                {!result.has_overlap && (
                  <Link
                    href="/problems/submit"
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded-md text-sm font-medium hover:opacity-90 no-underline"
                  >
                    Submit as Open Problem
                  </Link>
                )}
                <Link
                  href="/search"
                  className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-md text-sm font-medium hover:border-[var(--border-dark)] no-underline"
                >
                  Search for More
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


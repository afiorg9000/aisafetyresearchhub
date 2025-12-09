"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useAuth } from "../../components/auth-provider";
import { getOpenProblemBySlug, getAllProjects, slugify, type OpenProblem, type Project, type Org } from "../../lib/data";

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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

const DIFFICULTY_COLORS: Record<string, string> = {
  "Hard": "bg-red-100 text-red-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "Easy": "bg-green-100 text-green-800",
};

const IMPORTANCE_COLORS: Record<string, string> = {
  "Critical": "bg-purple-100 text-purple-800",
  "High": "bg-blue-100 text-blue-800",
  "Medium": "bg-gray-100 text-gray-600",
};

// ITN Framework scoring
function getITNScore(problem: OpenProblem) {
  const importance = problem.importance === "Critical" ? 10 : problem.importance === "High" ? 7 : 4;
  const tractability = problem.difficulty === "Easy" ? 8 : problem.difficulty === "Medium" ? 5 : 3;
  const neglectedness = 7; // Default - would need actual data
  return { importance, tractability, neglectedness, total: (importance + tractability + neglectedness) / 3 };
}

// Find related publications based on focus area and keywords
function findRelatedPapers(problem: OpenProblem, allProjects: (Project & { org: Org })[]) {
  const keywords = problem.title.toLowerCase().split(/\s+/);
  const focusArea = problem.focus_area.toLowerCase();
  
  return allProjects
    .filter(p => p.status?.toLowerCase() === "published" || p.paper_url)
    .filter(p => {
      const titleLower = p.name.toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      const orgFocus = p.org.focus_areas?.map(f => f.toLowerCase()) || [];
      
      // Match by focus area or keywords
      if (orgFocus.some(f => f.includes(focusArea) || focusArea.includes(f))) return true;
      if (keywords.some(k => k.length > 4 && (titleLower.includes(k) || descLower.includes(k)))) return true;
      return false;
    })
    .slice(0, 8);
}

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  const problem = getOpenProblemBySlug(slug);
  const allProjects = getAllProjects();
  
  if (!problem) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
              Knowledge Base for AI Safety Research
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-[var(--muted)]">Problem not found</p>
          <Link href="/problems" className="text-[var(--accent)] hover:underline mt-4 inline-block">
            ← Back to Open Problems
          </Link>
        </main>
      </div>
    );
  }

  const relatedPapers = findRelatedPapers(problem, allProjects);
  const itn = getITNScore(problem);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/problems" className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              <ChevronLeftIcon className="w-4 h-4" />
              Open Problems
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Title & Meta */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="research-tag">{problem.focus_area}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                  {problem.difficulty}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${IMPORTANCE_COLORS[problem.importance]}`}>
                  {problem.importance} importance
                </span>
              </div>
              
              <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mb-4">
                {problem.title}
              </h1>
              
              <div className="text-sm text-[var(--muted)]">
                Source: <a href={problem.source_url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                  {problem.source}
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="paper-card rounded-sm p-6 mb-6">
              <h2 className="font-medium text-[var(--foreground)] mb-3">Description</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </div>

            {/* Related Papers */}
            <div className="paper-card rounded-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BookIcon className="w-5 h-5 text-[var(--muted)]" />
                <h2 className="font-medium text-[var(--foreground)]">Related Research</h2>
              </div>
              
              {relatedPapers.length > 0 ? (
                <div className="space-y-3">
                  {relatedPapers.map((paper, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <h3 className="font-medium text-[var(--foreground)] mb-1">
                        <Link 
                          href={paper.paper_url || `/project/${slugify(paper.name)}`}
                          className="hover:text-[var(--accent)] no-underline"
                          target={paper.paper_url ? "_blank" : undefined}
                        >
                          {paper.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-[var(--muted)]">{paper.org.name}</p>
                      {paper.description && (
                        <p className="text-sm text-[var(--muted-light)] mt-1 line-clamp-2">{paper.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No directly related papers found yet.</p>
              )}
            </div>

            {/* Comments */}
            <div className="paper-card rounded-sm p-6">
              <h2 className="font-medium text-[var(--foreground)] mb-4">Discussion</h2>
              
              {user ? (
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this problem..."
                    className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] resize-none"
                    rows={3}
                  />
                  <button className="mt-2 px-4 py-2 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90">
                    Post Comment
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)] mb-6">
                  <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link> to join the discussion
                </p>
              )}
              
              {problem.comments && problem.comments.length > 0 ? (
                <div className="space-y-4">
                  {problem.comments.map((comment, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center text-xs font-medium">
                          {comment.author[0]}
                        </div>
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-[var(--muted)]">{comment.date}</span>
                      </div>
                      <p className="text-sm text-[var(--foreground-secondary)]">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No comments yet. Be the first to discuss this problem!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* ITN Framework */}
            <div className="paper-card rounded-sm p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-4">ITN Assessment</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted)]">Importance</span>
                    <span className="font-medium">{itn.importance}/10</span>
                  </div>
                  <div className="h-2 bg-[var(--background-alt)] rounded-full">
                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${itn.importance * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted)]">Tractability</span>
                    <span className="font-medium">{itn.tractability}/10</span>
                  </div>
                  <div className="h-2 bg-[var(--background-alt)] rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${itn.tractability * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--muted)]">Neglectedness</span>
                    <span className="font-medium">{itn.neglectedness}/10</span>
                  </div>
                  <div className="h-2 bg-[var(--background-alt)] rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${itn.neglectedness * 10}%` }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Overall Score</span>
                    <span className="font-bold text-[var(--foreground)]">{itn.total.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Who's Working On This */}
            <div className="paper-card rounded-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <UsersIcon className="w-5 h-5 text-[var(--muted)]" />
                <h3 className="font-medium text-[var(--foreground)]">Who's Working On This</h3>
              </div>
              
              {problem.working_on && problem.working_on.length > 0 ? (
                <div className="space-y-3">
                  {problem.working_on.map((worker, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-medium text-white">
                        {worker.name[0]}
                      </div>
                      <span className="text-sm">{worker.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)] mb-4">No one has claimed this yet.</p>
              )}
              
              {user ? (
                <button
                  onClick={() => setIsWorking(!isWorking)}
                  className={`w-full mt-4 px-4 py-2 text-sm font-medium rounded transition-colors ${
                    isWorking 
                      ? "bg-green-100 text-green-800 border border-green-300" 
                      : "bg-[var(--accent)] text-white hover:opacity-90"
                  }`}
                >
                  {isWorking ? "✓ Working on this" : "I'm working on this"}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full mt-4 px-4 py-2 text-sm font-medium text-center bg-[var(--accent)] text-white rounded hover:opacity-90 no-underline"
                >
                  Sign in to claim
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="paper-card rounded-sm p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-3">Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/search?q=${encodeURIComponent(problem.title)}`}
                  className="block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → Search for more research
                </Link>
                <Link
                  href={`/match`}
                  className="block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → Check your idea against this
                </Link>
                <a
                  href={problem.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
                >
                  → Read original source <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

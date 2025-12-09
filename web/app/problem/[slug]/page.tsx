"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/auth-provider";
import { use } from "react";

// Types
type Problem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  focus_area: string;
  status: string;
  score: number;
  user_vote: number;
  submitted_by: { id: string; name: string; avatar: string | null };
  created_at: string;
  updated_at: string;
  related_projects: Array<{ slug: string; name: string; org: string }>;
};

type Worker = {
  id: string;
  name: string;
  project_url: string | null;
  notes: string | null;
};

type Comment = {
  id: string;
  user: { name: string; avatar: string | null };
  content: string;
  created_at: string;
  replies: Comment[];
};

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

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

function CommentComponent({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-[var(--border)] pl-4" : ""}`}>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center text-xs font-medium text-[var(--muted)]">
            {comment.user.name[0]}
          </div>
          <span className="text-sm font-medium text-[var(--foreground)]">{comment.user.name}</span>
          <span className="text-xs text-[var(--muted-light)]">{comment.created_at}</span>
        </div>
        <div className="text-sm text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </div>
        <button
          onClick={() => setShowReply(!showReply)}
          className="mt-2 text-xs text-[var(--accent)] hover:underline"
        >
          Reply
        </button>
        {showReply && (
          <div className="mt-3">
            <textarea
              placeholder="Write a reply..."
              className="w-full p-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded hover:bg-[var(--accent-light)]">
                Post Reply
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {comment.replies?.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [userVote, setUserVote] = useState(0);
  const [score, setScore] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [showWorkingForm, setShowWorkingForm] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Will be replaced with Supabase query
  const [problem] = useState<Problem | null>(null);
  const [workers] = useState<Worker[]>([]);
  const [comments] = useState<Comment[]>([]);

  const handleVote = (voteType: -1 | 1) => {
    if (!user) return;
    
    if (userVote === voteType) {
      setScore(score - voteType);
      setUserVote(0);
    } else {
      setScore(score - userVote + voteType);
      setUserVote(voteType);
    }
  };

  const statusColors: Record<string, string> = {
    open: "!bg-amber-50 !text-amber-700 !border-amber-200",
    in_progress: "!bg-blue-50 !text-blue-700 !border-blue-200",
    solved: "!bg-green-50 !text-green-700 !border-green-200",
    closed: "!bg-gray-50 !text-gray-500 !border-gray-200",
  };

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
              This problem doesn&apos;t exist or hasn&apos;t been created yet.
            </p>
            <p className="text-sm text-[var(--muted-light)] mb-8">
              Open problems will be available once Supabase is connected.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/problems"
                className="inline-block px-6 py-3 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
              >
                Browse Problems
              </Link>
              {user && (
                <Link
                  href="/problems/submit"
                  className="inline-block px-6 py-3 bg-[var(--card)] border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline"
                >
                  Submit a Problem
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex gap-6">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <button
              onClick={() => handleVote(1)}
              disabled={!user}
              className={`p-1.5 rounded transition-colors ${
                userVote === 1
                  ? "text-[var(--accent)] bg-[var(--accent-muted)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-alt)]"
              } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
              title={user ? "Upvote" : "Sign in to vote"}
            >
              <ArrowUpIcon className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold text-[var(--foreground)]">{score}</span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!user}
              className={`p-1.5 rounded transition-colors ${
                userVote === -1
                  ? "text-red-500 bg-red-50"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-alt)]"
              } ${!user ? "cursor-not-allowed opacity-50" : ""}`}
              title={user ? "Downvote" : "Sign in to vote"}
            >
              <ArrowDownIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              <span className="research-tag">{problem.focus_area}</span>
              <span className={`research-tag ${statusColors[problem.status]}`}>
                {problem.status.replace("_", " ")}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-4 leading-tight">
              {problem.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-6">
              <span>Submitted by {problem.submitted_by.name}</span>
              <span>·</span>
              <span>{problem.created_at}</span>
            </div>

            {/* Description */}
            <div className="paper-card rounded-sm p-6 mb-6">
              <div className="prose prose-sm max-w-none text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </div>
            </div>

            {/* Working on this section */}
            <div className="paper-card rounded-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold text-[var(--foreground)]">
                  People Working on This ({workers.length})
                </h2>
                {user && !isWorking && (
                  <button
                    onClick={() => setShowWorkingForm(true)}
                    className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors"
                  >
                    I&apos;m working on this
                  </button>
                )}
                {!user && (
                  <Link
                    href="/login"
                    className="px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline"
                  >
                    Sign in to join
                  </Link>
                )}
              </div>

              {showWorkingForm && (
                <div className="mb-4 p-4 bg-[var(--background-alt)] rounded border border-[var(--border)]">
                  <input
                    type="url"
                    placeholder="Link to your project (optional)"
                    className="w-full p-2.5 mb-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <textarea
                    placeholder="Brief notes on your approach (optional)"
                    className="w-full p-2.5 mb-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsWorking(true);
                        setShowWorkingForm(false);
                      }}
                      className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded hover:bg-[var(--accent-light)]"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => setShowWorkingForm(false)}
                      className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {workers.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-4">
                  No one is working on this yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3">
                  {workers.map((worker) => (
                    <div key={worker.id} className="flex items-start gap-3 p-3 bg-[var(--background-alt)] rounded">
                      <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--muted)]">
                        {worker.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--foreground)]">{worker.name}</p>
                        {worker.notes && (
                          <p className="text-xs text-[var(--muted)] mt-0.5">{worker.notes}</p>
                        )}
                      </div>
                      {worker.project_url && (
                        <a
                          href={worker.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          Project <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Projects */}
            {problem.related_projects && problem.related_projects.length > 0 && (
              <div className="paper-card rounded-sm p-5 mb-6">
                <h2 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-4">
                  Related Projects
                </h2>
                <div className="space-y-2">
                  {problem.related_projects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/project/${project.slug}`}
                      className="block p-3 bg-[var(--background-alt)] rounded border border-[var(--border)] hover:border-[var(--border-dark)] transition-colors no-underline"
                    >
                      <p className="text-sm font-medium text-[var(--foreground)]">{project.name}</p>
                      <p className="text-xs text-[var(--muted)]">{project.org}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="paper-card rounded-sm p-5">
              <h2 className="font-serif text-lg font-semibold text-[var(--foreground)] mb-4">
                Discussion ({comments.length})
              </h2>

              {/* New comment form */}
              {user ? (
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the discussion... (Markdown supported)"
                    className="w-full p-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] resize-none"
                    rows={4}
                  />
                  <button
                    disabled={!newComment.trim()}
                    className="mt-2 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded hover:bg-[var(--accent-light)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-[var(--background-alt)] rounded border border-[var(--border)] text-center">
                  <p className="text-sm text-[var(--muted)]">
                    <Link href="/login" className="text-[var(--accent)] hover:underline">
                      Sign in
                    </Link>{" "}
                    to join the discussion
                  </p>
                </div>
              )}

              {/* Comments list */}
              {comments.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center py-4">
                  No comments yet. Start the discussion!
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <CommentComponent key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

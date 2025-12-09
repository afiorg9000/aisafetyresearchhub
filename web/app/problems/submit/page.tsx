"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-provider";

const FOCUS_AREAS = [
  "Alignment",
  "Interpretability",
  "Governance",
  "Evaluations",
  "Red Teaming",
  "Biosecurity",
  "Cyber",
  "Agent Safety",
  "Scalable Oversight",
  "Other",
];

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

export default function SubmitProblemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !focusArea) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    // TODO: Submit to Supabase
    // For now, just simulate a delay and redirect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to problems page
    router.push("/problems");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
              Knowledge Base for AI Safety Research
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-4">
            Sign in Required
          </h1>
          <p className="text-[var(--muted)] mb-6">
            You need to be signed in to submit an open problem.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors no-underline"
          >
            Sign In
          </Link>
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
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/problems"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6 no-underline"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Back to Open Problems</span>
        </Link>

        {/* Title */}
        <h1 className="font-serif text-2xl font-semibold text-[var(--foreground)] mb-2">
          Submit an Open Problem
        </h1>
        <p className="text-[var(--muted)] mb-8">
          Identify an important unsolved problem in AI safety research. Good problems are specific, 
          tractable, and clearly impact the field.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Problem Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Detecting Deceptive Alignment in Large Models"
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)]"
              required
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              A clear, concise title that captures the essence of the problem.
            </p>
          </div>

          {/* Focus Area */}
          <div>
            <label htmlFor="focus" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Focus Area *
            </label>
            <select
              id="focus"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              required
            >
              <option value="">Select a focus area...</option>
              {FOCUS_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Problem Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe the problem in detail. Consider including:

• Why this problem matters for AI safety
• What makes it hard/unsolved
• Known approaches and their limitations
• What a solution might look like
• Relevant background or references

Markdown formatting is supported.`}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded text-sm placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-muted)] resize-none"
              rows={12}
              required
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Be specific and provide context. Markdown formatting is supported.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-sm hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Problem"}
            </button>
            <Link
              href="/problems"
              className="px-6 py-3 text-[var(--muted)] hover:text-[var(--foreground)] text-sm no-underline"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Guidelines */}
        <div className="mt-12 p-5 bg-[var(--background-alt)] rounded border border-[var(--border)]">
          <h2 className="font-serif text-base font-semibold text-[var(--foreground)] mb-3">
            Guidelines for Good Problems
          </h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>• <strong>Specific:</strong> Clearly defined scope, not vague or too broad</li>
            <li>• <strong>Important:</strong> Solving it would meaningfully advance AI safety</li>
            <li>• <strong>Tractable:</strong> Progress seems possible with current tools/knowledge</li>
            <li>• <strong>Novel:</strong> Not already well-addressed by existing work</li>
            <li>• <strong>Actionable:</strong> Someone could start working on it today</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


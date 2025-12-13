"use client";

import { useState } from "react";
import Link from "next/link";

type ITNResult = {
  importance: { score: number; reasoning: string };
  neglectedness: { score: number; reasoning: string };
  tractability: { score: number; reasoning: string };
  overall: number;
  verdict: "Highly Promising" | "Worth Exploring" | "Moderate Priority" | "Low Priority";
  summary: string;
  recommendations: string[];
  related_work: string[];
  potential_collaborators: string[];
};

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-medium">{score}/10</span>
      </div>
      <div className="h-3 bg-[var(--background-alt)] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

const VERDICT_COLORS: Record<string, string> = {
  "Highly Promising": "bg-green-100 text-green-800 border-green-300",
  "Worth Exploring": "bg-blue-100 text-blue-800 border-blue-300",
  "Moderate Priority": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Low Priority": "bg-gray-100 text-gray-600 border-gray-300",
};

export default function ITNCalculatorPage() {
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ITNResult | null>(null);

  async function handleAnalyze() {
    if (!problemTitle.trim() || !problemDescription.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/itn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: problemTitle, description: problemDescription }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("ITN analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            Knowledge Base for AI Safety Research
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Open Problems</Link>
            <Link href="/match" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Research Matcher</Link>
            <Link href="/search" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">Search</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div>
            <div className="mb-8">
              <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide">AI-Powered</span>
              <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mt-2 mb-4">
                ITN Calculator
              </h1>
              <p className="text-[var(--muted)]">
                Evaluate research problems using the Importance-Neglectedness-Tractability framework. 
                Get AI-powered scoring based on the AI safety research landscape.
              </p>
            </div>

            <div className="paper-card rounded-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Problem Title
                </label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g., Detecting deceptive reasoning in language models"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Problem Description
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the problem in detail: What is it? Why does it matter? What approaches might work?"
                  rows={6}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-base placeholder:text-[var(--muted-light)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !problemTitle.trim() || !problemDescription.trim()}
                className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isAnalyzing ? "Analyzing with AI..." : "Calculate ITN Score"}
              </button>

              {/* Framework Info */}
              <div className="mt-6 p-4 bg-[var(--background-alt)] rounded-lg">
                <h4 className="font-medium text-sm text-[var(--foreground)] mb-2">ITN Framework</h4>
                <ul className="text-xs text-[var(--muted)] space-y-1">
                  <li><strong>Importance:</strong> How significant is solving this for AI safety?</li>
                  <li><strong>Neglectedness:</strong> How under-researched is this area?</li>
                  <li><strong>Tractability:</strong> How feasible is making progress?</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {isAnalyzing ? (
              <div className="paper-card rounded-sm p-8 text-center">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[var(--muted)]">Analyzing your problem...</p>
                <p className="text-xs text-[var(--muted-light)] mt-2">
                  Comparing against 700+ papers and 17 open problems
                </p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Verdict */}
                <div className={`paper-card rounded-sm p-6 border-l-4 ${VERDICT_COLORS[result.verdict]}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Verdict</p>
                      <h2 className="font-serif text-2xl font-semibold">{result.verdict}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted)]">Overall Score</p>
                      <p className="text-3xl font-bold">{result.overall.toFixed(1)}/10</p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{result.summary}</p>
                </div>

                {/* Scores */}
                <div className="paper-card rounded-sm p-6">
                  <h3 className="font-medium text-[var(--foreground)] mb-4">ITN Breakdown</h3>
                  
                  <ScoreBar score={result.importance.score} label="Importance" color="bg-purple-500" />
                  <p className="text-xs text-[var(--muted)] mb-4 -mt-2">{result.importance.reasoning}</p>
                  
                  <ScoreBar score={result.neglectedness.score} label="Neglectedness" color="bg-blue-500" />
                  <p className="text-xs text-[var(--muted)] mb-4 -mt-2">{result.neglectedness.reasoning}</p>
                  
                  <ScoreBar score={result.tractability.score} label="Tractability" color="bg-green-500" />
                  <p className="text-xs text-[var(--muted)] mb-4 -mt-2">{result.tractability.reasoning}</p>
                </div>

                {/* Related Work */}
                {result.related_work?.length > 0 && (
                  <div className="paper-card rounded-sm p-6">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Related Work</h3>
                    <ul className="space-y-2">
                      {result.related_work.map((work, i) => (
                        <li key={i} className="text-sm text-[var(--muted)] flex gap-2">
                          <span className="text-[var(--accent)]">→</span>
                          {work}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="paper-card rounded-sm p-6">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-[var(--muted)] flex gap-2">
                          <span className="text-green-600">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Collaborators */}
                {result.potential_collaborators?.length > 0 && (
                  <div className="paper-card rounded-sm p-6">
                    <h3 className="font-medium text-[var(--foreground)] mb-3">Potential Collaborators</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.potential_collaborators.map((collab, i) => (
                        <span key={i} className="text-sm px-3 py-1 bg-[var(--background-alt)] rounded">
                          {collab}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href="/problems/submit"
                    className="flex-1 py-3 text-center bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 no-underline"
                  >
                    Submit as Open Problem
                  </Link>
                  <Link
                    href={`/search?q=${encodeURIComponent(problemTitle)}`}
                    className="flex-1 py-3 text-center border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:border-[var(--border-dark)] no-underline"
                  >
                    Search Related
                  </Link>
                </div>
              </div>
            ) : (
              <div className="paper-card rounded-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--background-alt)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                </div>
                <h3 className="font-medium text-[var(--foreground)] mb-2">No Analysis Yet</h3>
                <p className="text-sm text-[var(--muted)]">
                  Enter a research problem to get an AI-powered ITN assessment
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


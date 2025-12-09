"use client";

import Link from "next/link";
import { BookIcon, UsersIcon, ExternalLinkIcon, GithubIcon } from "../components/ui";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="font-serif text-xl font-semibold text-[var(--foreground)] no-underline hover:text-[var(--accent)]">
            AI Safety Research Hub
          </Link>
        </div>
      </header>

      <nav className="border-b border-[var(--border)] bg-[var(--background-alt)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-6 py-3 text-sm">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Organizations</Link>
            <Link href="/publications" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Publications</Link>
            <Link href="/problems" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline pb-3 -mb-3 border-b-2 border-transparent">Open Problems</Link>
            <Link href="/about" className="font-medium text-[var(--foreground)] no-underline border-b-2 border-[var(--accent)] pb-3 -mb-3">About</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-4">About the AI Safety Research Hub</h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
            A comprehensive directory connecting AI safety researchers, organizations, and open problems worldwide.
          </p>
        </div>

        <section className="paper-card rounded-sm p-8 mb-8">
          <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-4">Our Mission</h2>
          <div className="prose text-[var(--foreground-secondary)] leading-relaxed space-y-4">
            <p>
              The AI safety research landscape is increasingly fragmented. With 10+ national AI Safety Institutes, 
              dozens of nonprofits, academic labs, and frontier AI companies all working on related problems, 
              coordination has become a critical challenge.
            </p>
            <p>
              The AI Safety Research Hub aims to fill this gap by providing an independent, comprehensive 
              directory of organizations, publications, benchmarks, and open problems in AI safety.
            </p>
          </div>
        </section>

        <section className="paper-card rounded-sm p-8 mb-8">
          <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-6">What We Track</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Organizations</h3>
                <p className="text-sm text-[var(--muted)]">Government AISIs, labs, nonprofits, academic institutions, and think tanks</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                <BookIcon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Publications</h3>
                <p className="text-sm text-[var(--muted)]">Research papers, technical reports, and evaluation frameworks</p>
              </div>
            </div>
          </div>
        </section>

        <section className="paper-card rounded-sm p-8 mb-8">
          <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-4">Contribute</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/submit" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 no-underline">
              Submit Entity
            </Link>
            <Link href="/problems/submit" className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded text-sm font-medium hover:bg-[var(--card-hover)] no-underline text-[var(--foreground)]">
              Submit Open Problem
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded text-sm font-medium hover:bg-[var(--card-hover)] no-underline text-[var(--foreground)]">
              <GithubIcon className="w-4 h-4" />
              GitHub
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--background-alt)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-[var(--muted)]">AI Safety Research Hub — A community resource for AI safety research coordination</p>
        </div>
      </footer>
    </div>
  );
}


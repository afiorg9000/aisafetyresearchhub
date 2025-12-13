"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { orgs, openProblems, slugify, type Project, type Org } from "../../lib/data";

// Define main AI safety topics
const TOPICS: Record<string, { 
  name: string; 
  definition: string; 
  keywords: string[];
  keyQuestions: string[];
}> = {
  "mechanistic-interpretability": {
    name: "Mechanistic Interpretability",
    definition: "Understanding how neural networks work internally by reverse-engineering their computations. This involves identifying circuits, features, and algorithms that models use to process information.",
    keywords: ["interpretability", "mech interp", "circuits", "features", "sparse autoencoder", "sae", "activation", "probing", "attention head"],
    keyQuestions: [
      "How can we automatically discover meaningful features in neural networks?",
      "What algorithms do transformers learn to implement?",
      "How can interpretability scale to frontier models?",
      "Can we prove safety properties using interpretability?",
    ],
  },
  "ai-control": {
    name: "AI Control",
    definition: "Techniques for maintaining human oversight of AI systems, especially powerful ones. Includes monitoring, containment, and intervention strategies.",
    keywords: ["control", "oversight", "containment", "monitoring", "shutdown", "corrigibility"],
    keyQuestions: [
      "How can we maintain control over systems smarter than us?",
      "What monitoring systems can detect misaligned behavior?",
      "How do we design AI systems that remain corrigible?",
    ],
  },
  "scalable-oversight": {
    name: "Scalable Oversight",
    definition: "Methods for humans to supervise AI systems that may be more capable than the supervisors. Includes debate, recursive reward modeling, and AI-assisted evaluation.",
    keywords: ["oversight", "debate", "recursive", "supervision", "evaluation", "amplification"],
    keyQuestions: [
      "How can humans evaluate AI outputs they can't fully understand?",
      "Can AI systems help supervise other AI systems safely?",
      "What oversight methods scale to superhuman AI?",
    ],
  },
  "alignment": {
    name: "Alignment",
    definition: "Ensuring AI systems pursue goals that match human values and intentions. The core challenge of making AI do what we actually want.",
    keywords: ["alignment", "values", "goals", "intent", "reward", "rlhf", "preference"],
    keyQuestions: [
      "How do we specify human values to AI systems?",
      "Can we detect if an AI's goals are misaligned?",
      "How do we prevent reward hacking and specification gaming?",
    ],
  },
  "deception": {
    name: "Deception & Honesty",
    definition: "Understanding when and why AI systems might deceive humans, and developing methods to ensure AI honesty and transparency.",
    keywords: ["deception", "honesty", "lying", "manipulation", "sycophancy", "truthful"],
    keyQuestions: [
      "How can we detect if an AI is being deceptive?",
      "Why do models develop sycophantic behavior?",
      "Can we train AI to be reliably honest?",
    ],
  },
  "robustness": {
    name: "Robustness & Security",
    definition: "Making AI systems resistant to adversarial attacks, jailbreaks, and distribution shift. Ensuring reliable behavior under various conditions.",
    keywords: ["robustness", "adversarial", "jailbreak", "security", "attack", "defense", "prompt injection"],
    keyQuestions: [
      "How do we defend against adversarial attacks on LLMs?",
      "Can we make safety training robust to fine-tuning attacks?",
      "What security guarantees can we provide for AI systems?",
    ],
  },
  "evaluations": {
    name: "Evaluations & Benchmarks",
    definition: "Developing methods to measure AI capabilities and safety properties. Creating benchmarks that reveal dangerous capabilities.",
    keywords: ["evaluation", "benchmark", "testing", "measure", "capability", "dangerous"],
    keyQuestions: [
      "How do we evaluate capabilities we can't demonstrate?",
      "What benchmarks predict real-world safety?",
      "How do we test for emergent dangerous behaviors?",
    ],
  },
  "governance": {
    name: "AI Governance",
    definition: "Policy frameworks, regulations, and institutional structures for managing AI development and deployment safely.",
    keywords: ["governance", "policy", "regulation", "law", "institution", "international"],
    keyQuestions: [
      "What regulations are needed for frontier AI?",
      "How do we coordinate internationally on AI safety?",
      "What governance structures can keep pace with AI progress?",
    ],
  },
};

function findRelatedContent(topic: typeof TOPICS[string]) {
  const publications: (Project & { org: Org })[] = [];
  const projects: (Project & { org: Org })[] = [];
  const relatedOrgs: Org[] = [];
  const researchers: { name: string; org: string }[] = [];

  for (const org of orgs) {
    let orgRelevant = false;
    
    // Check org focus areas
    if (org.focus_areas?.some(f => 
      topic.keywords.some(k => f.toLowerCase().includes(k))
    )) {
      orgRelevant = true;
    }

    for (const p of org.projects || []) {
      const titleLower = p.name.toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      
      if (topic.keywords.some(k => titleLower.includes(k) || descLower.includes(k))) {
        const isPublication = p.status?.toLowerCase() === "published" || p.paper_url;
        if (isPublication) {
          publications.push({ ...p, org });
        } else {
          projects.push({ ...p, org });
        }
        orgRelevant = true;
      }
    }

    if (orgRelevant) {
      relatedOrgs.push(org);
      for (const person of org.key_people || []) {
        researchers.push({ name: person.name, org: org.name });
      }
    }
  }

  // Sort publications by citations
  publications.sort((a, b) => ((b as any).citation_count || 0) - ((a as any).citation_count || 0));

  return { publications: publications.slice(0, 10), projects: projects.slice(0, 10), relatedOrgs: relatedOrgs.slice(0, 10), researchers: researchers.slice(0, 15) };
}

function findRelatedProblems(topic: typeof TOPICS[string]) {
  return openProblems.filter(p => 
    topic.keywords.some(k => 
      p.title.toLowerCase().includes(k) || 
      p.description.toLowerCase().includes(k) ||
      p.focus_area.toLowerCase().includes(k)
    )
  );
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params);
  const topicData = TOPICS[topic];

  if (!topicData) {
    // Show list of all topics
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
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mb-6">Research Topics</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(TOPICS).map(([slug, t]) => (
              <Link
                key={slug}
                href={`/topics/${slug}`}
                className="paper-card rounded-sm p-5 hover:border-[var(--border-dark)] no-underline"
              >
                <h2 className="font-medium text-[var(--foreground)] mb-2">{t.name}</h2>
                <p className="text-sm text-[var(--muted)] line-clamp-2">{t.definition}</p>
              </Link>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const { publications, projects, relatedOrgs, researchers } = findRelatedContent(topicData);
  const relatedProblems = findRelatedProblems(topicData);

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
            <Link href="/topics/all" className="text-[var(--muted)] hover:text-[var(--foreground)] no-underline">
              ← All Topics
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <span className="research-tag mb-3 inline-block">Research Topic</span>
          <h1 className="font-serif text-3xl font-semibold text-[var(--foreground)] mb-4">
            {topicData.name}
          </h1>
          <p className="text-lg text-[var(--muted)] leading-relaxed">
            {topicData.definition}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Questions */}
            <section className="paper-card rounded-sm p-6">
              <h2 className="font-medium text-[var(--foreground)] mb-4">Key Open Questions</h2>
              <ul className="space-y-3">
                {topicData.keyQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-[var(--foreground-secondary)]">
                    <span className="text-[var(--accent)]">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </section>

            {/* Essential Reading */}
            <section className="paper-card rounded-sm p-6">
              <h2 className="font-medium text-[var(--foreground)] mb-4">
                Essential Reading ({publications.length})
              </h2>
              {publications.length > 0 ? (
                <div className="space-y-4">
                  {publications.map((pub, i) => (
                    <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                      <h3 className="font-medium text-[var(--foreground)] mb-1">
                        <Link
                          href={pub.paper_url || `/project/${slugify(pub.name)}`}
                          className="hover:text-[var(--accent)] no-underline"
                          target={pub.paper_url ? "_blank" : undefined}
                        >
                          {pub.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <span>{pub.org.name}</span>
                        {(pub as any).citation_count && (
                          <>
                            <span>·</span>
                            <span>{(pub as any).citation_count} citations</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--muted)]">No publications found for this topic yet.</p>
              )}
            </section>

            {/* Related Open Problems */}
            {relatedProblems.length > 0 && (
              <section className="paper-card rounded-sm p-6">
                <h2 className="font-medium text-[var(--foreground)] mb-4">
                  Open Problems ({relatedProblems.length})
                </h2>
                <div className="space-y-3">
                  {relatedProblems.map((prob, i) => (
                    <Link
                      key={i}
                      href={`/problem/${prob.slug}`}
                      className="block py-2 hover:text-[var(--accent)] no-underline"
                    >
                      <span className="text-[var(--foreground)]">{prob.title}</span>
                      <span className="text-xs text-[var(--muted)] ml-2">({prob.focus_area})</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Who's Working On It */}
            <div className="paper-card rounded-sm p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-3">
                Who's Working On This
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {researchers.slice(0, 10).map((r, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-[var(--foreground)]">{r.name}</span>
                    <span className="text-[var(--muted)]"> @ {r.org}</span>
                  </div>
                ))}
              </div>
              {researchers.length > 10 && (
                <p className="text-xs text-[var(--muted)] mt-2">
                  +{researchers.length - 10} more researchers
                </p>
              )}
            </div>

            {/* Related Organizations */}
            <div className="paper-card rounded-sm p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-3">
                Organizations
              </h3>
              <div className="space-y-2">
                {relatedOrgs.slice(0, 8).map((org, i) => (
                  <Link
                    key={i}
                    href={`/org/${slugify(org.name)}`}
                    className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline"
                  >
                    {org.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="paper-card rounded-sm p-5">
              <h3 className="font-medium text-[var(--foreground)] mb-3">Explore</h3>
              <div className="space-y-2">
                <Link
                  href={`/search?q=${encodeURIComponent(topicData.name)}`}
                  className="block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → Search all research
                </Link>
                <Link
                  href={`/reading?topic=${topic}`}
                  className="block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → Get reading recommendations
                </Link>
                <Link
                  href="/problems"
                  className="block text-sm text-[var(--accent)] hover:underline no-underline"
                >
                  → View all open problems
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


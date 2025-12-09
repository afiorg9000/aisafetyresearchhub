import { notFound } from "next/navigation";
import { getBenchmarkBySlug, getAllBenchmarks, slugify } from "../../lib/data";
import {
  BackButton,
  PageHeader,
  Card,
  SectionHeader,
  LinkCard,
  ExternalLinkIcon,
  BuildingIcon,
  EmptyState,
} from "../../components/ui";

export function generateStaticParams() {
  return getAllBenchmarks().map((benchmark) => ({ slug: slugify(benchmark.name) }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const benchmark = getBenchmarkBySlug(slug);
    return {
      title: benchmark ? `${benchmark.name} — Knowledge Base for AI Safety Research` : "Benchmark Not Found",
      description: benchmark?.measures || "AI Safety benchmark details",
    };
  });
}

export default async function BenchmarkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const benchmark = getBenchmarkBySlug(slug);

  if (!benchmark) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BackButton href="/" label="All organizations" />

        <PageHeader
          title={benchmark.name}
          subtitle={`Measures: ${benchmark.measures}`}
          tags={benchmark.org.focus_areas}
          actions={
            benchmark.paper_url ? (
              <a
                href={benchmark.paper_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
              >
                <span>View paper</span>
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            ) : undefined
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Created By */}
          <Card>
            <SectionHeader>Created By</SectionHeader>
            <LinkCard
              href={`/org/${slugify(benchmark.org.name)}`}
              title={benchmark.org.name}
              subtitle={benchmark.org.type}
              icon={<BuildingIcon className="w-4 h-4" />}
            />
          </Card>

          {/* What it Measures */}
          <Card>
            <SectionHeader>What it Measures</SectionHeader>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{benchmark.measures}</p>
          </Card>
        </div>

        {/* Status */}
        <Card className="mt-6">
          <SectionHeader>Status</SectionHeader>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-[var(--muted)]">This benchmark is currently in use</p>
            </div>
          </div>
        </Card>

        {/* Links */}
        {benchmark.paper_url && (
          <Card className="mt-6">
            <SectionHeader>Resources</SectionHeader>
            <div className="space-y-2">
              <a
                href={benchmark.paper_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors"
              >
                <ExternalLinkIcon className="w-4 h-4 text-[var(--muted)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Paper</p>
                  <p className="text-xs text-[var(--muted)] truncate">{benchmark.paper_url}</p>
                </div>
              </a>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            Last verified: December 2024 ·{" "}
            <button className="text-[var(--accent)] hover:underline">Suggest an edit</button>
          </p>
        </div>
      </div>
    </div>
  );
}


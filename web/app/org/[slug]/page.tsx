import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrgBySlug, orgs, slugify } from "../../lib/data";
import {
  BackButton,
  PageHeader,
  Card,
  SectionHeader,
  LinkCard,
  ExternalLinkIcon,
  BeakerIcon,
  ChartIcon,
  EmptyState,
} from "../../components/ui";
import { ClaimButton } from "../../components/claim-button";
import { EditButton } from "../../components/edit-button";

export function generateStaticParams() {
  return orgs.map((org) => ({ slug: slugify(org.name) }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const org = getOrgBySlug(slug);
    return {
      title: org ? `${org.name} — AI Safety Research Hub` : "Organization Not Found",
      description: org?.mission || "AI Safety organization details",
    };
  });
}

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getOrgBySlug(slug);

  if (!org) {
    notFound();
  }

  const publishedProjects = org.projects?.filter((p) => p.status === "published") || [];
  const activeProjects = org.projects?.filter((p) => p.status === "Active") || [];
  const completedProjects = org.projects?.filter((p) => p.status === "Completed") || [];
  const otherProjects = org.projects?.filter((p) => 
    p.status !== "Active" && p.status !== "Completed" && p.status !== "published"
  ) || [];

  const editFields = [
    { name: "mission", label: "Mission", currentValue: org.mission || null },
    { name: "notes", label: "Notes", currentValue: org.notes || null },
    { name: "focus_areas", label: "Focus Areas", currentValue: org.focus_areas?.join(", ") || null },
    { name: "url", label: "Website URL", currentValue: org.url },
  ];

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
        <BackButton href="/" label="All organizations" />

        {/* Org Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-sm text-[var(--muted)]">
            <span className="research-tag">{org.type}</span>
            <span>·</span>
            <span>{org.country}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {org.name}
            </h1>
            <a
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--card)] border border-[var(--border)] rounded-sm hover:border-[var(--border-dark)] transition-colors no-underline text-[var(--foreground)]"
            >
              <span>Visit website</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
          {org.mission && (
            <p className="text-[var(--muted)] mt-3 leading-relaxed max-w-3xl">
              {org.mission}
            </p>
          )}
          {org.focus_areas && org.focus_areas.length > 0 && (
            <div className="mt-4">
              <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                Research Areas:{" "}
              </span>
              <span className="text-sm text-[var(--foreground-secondary)]">
                {org.focus_areas.join(" · ")}
              </span>
            </div>
          )}
        </div>

        {/* Claim banner */}
        <div className="mb-6 p-4 paper-card rounded-sm flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Do you work at {org.name}?</p>
          <ClaimButton entityType="org" entitySlug={slug} entityName={org.name} />
        </div>

        {/* Benchmarks */}
        {org.benchmarks && org.benchmarks.length > 0 && (
          <Card className="mb-6">
            <SectionHeader>Benchmarks ({org.benchmarks.length})</SectionHeader>
            <div className="space-y-2">
              {org.benchmarks.map((benchmark, i) => (
                <LinkCard
                  key={i}
                  href={`/benchmark/${slugify(benchmark.name)}`}
                  title={benchmark.name}
                  subtitle={benchmark.measures}
                  icon={<ChartIcon className="w-4 h-4" />}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Projects / Publications */}
        <Card className="mb-6">
          <SectionHeader>Projects & Publications ({org.projects?.length || 0})</SectionHeader>
          {org.projects && org.projects.length > 0 ? (
            <div className="space-y-6">
              {publishedProjects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--success)] mb-3">
                    Published Research ({publishedProjects.length})
                  </p>
                  <div className="space-y-2">
                    {publishedProjects.slice(0, 10).map((project, i) => (
                      <div key={i} className="p-3 rounded-sm bg-[var(--background-alt)] border border-[var(--border)]">
                        <p className="text-sm font-medium text-[var(--foreground)]">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-[var(--muted)] mt-1">{project.description}</p>
                        )}
                        {project.paper_url && (
                          <a
                            href={project.paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[var(--accent)] mt-2 hover:underline"
                          >
                            View paper <ExternalLinkIcon className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                    {publishedProjects.length > 10 && (
                      <p className="text-xs text-[var(--muted)] italic pt-2">
                        + {publishedProjects.length - 10} more publications
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeProjects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--warning)] mb-3">
                    Active Projects ({activeProjects.length})
                  </p>
                  <div className="space-y-2">
                    {activeProjects.map((project, i) => (
                      <LinkCard
                        key={i}
                        href={`/project/${slugify(project.name)}`}
                        title={project.name}
                        subtitle={project.description}
                        icon={<BeakerIcon className="w-4 h-4" />}
                        meta="Active"
                      />
                    ))}
                  </div>
                </div>
              )}

              {completedProjects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--accent)] mb-3">
                    Completed ({completedProjects.length})
                  </p>
                  <div className="space-y-2">
                    {completedProjects.map((project, i) => (
                      <LinkCard
                        key={i}
                        href={`/project/${slugify(project.name)}`}
                        title={project.name}
                        subtitle={project.description}
                        icon={<BeakerIcon className="w-4 h-4" />}
                        meta="Completed"
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherProjects.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[var(--muted)] mb-3">
                    Other ({otherProjects.length})
                  </p>
                  <div className="space-y-2">
                    {otherProjects.map((project, i) => (
                      <LinkCard
                        key={i}
                        href={`/project/${slugify(project.name)}`}
                        title={project.name}
                        subtitle={project.description}
                        icon={<BeakerIcon className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="No projects listed" />
          )}
        </Card>

        {/* Notes */}
        {org.notes && (
          <Card className="mb-6">
            <SectionHeader>Notes</SectionHeader>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{org.notes}</p>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            Last verified: December 2024 ·{" "}
            <EditButton
              entityType="org"
              entitySlug={slug}
              entityName={org.name}
              fields={editFields}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

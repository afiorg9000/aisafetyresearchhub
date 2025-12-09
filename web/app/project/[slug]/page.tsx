import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjects, getRelatedProjects, slugify } from "../../lib/data";
import {
  BackButton,
  PageHeader,
  Card,
  SectionHeader,
  LinkCard,
  StatusBadge,
  BuildingIcon,
  BeakerIcon,
  EmptyState,
} from "../../components/ui";
import { ClaimButton } from "../../components/claim-button";
import { EditButton } from "../../components/edit-button";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: slugify(project.name) }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const project = getProjectBySlug(slug);
    return {
      title: project ? `${project.name} — AI Safety Research Hub` : "Project Not Found",
      description: project?.description || "AI Safety project details",
    };
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = getRelatedProjects(project);

  const editFields = [
    { name: "description", label: "Description", currentValue: project.description },
    { name: "status", label: "Status", currentValue: project.status },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BackButton href={`/org/${slugify(project.org.name)}`} label={project.org.name} />

        <PageHeader
          title={project.name}
          subtitle={project.description}
          meta={
            <>
              <StatusBadge status={project.status} />
            </>
          }
          tags={project.org.focus_areas}
        />

        {/* Claim banner */}
        <div className="mb-6 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Are you working on this project?</p>
          <ClaimButton entityType="project" entitySlug={slug} entityName={project.name} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Organization */}
          <Card>
            <SectionHeader>Organization</SectionHeader>
            <LinkCard
              href={`/org/${slugify(project.org.name)}`}
              title={project.org.name}
              subtitle={project.org.type}
              icon={<BuildingIcon className="w-4 h-4" />}
            />
          </Card>

          {/* Status */}
          <Card>
            <SectionHeader>Status</SectionHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  project.status === "Active"
                    ? "bg-emerald-500"
                    : project.status === "Completed"
                    ? "bg-blue-500"
                    : "bg-zinc-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium">{project.status}</p>
                <p className="text-xs text-[var(--muted)]">
                  {project.status === "Active"
                    ? "Currently in progress"
                    : project.status === "Completed"
                    ? "Research completed"
                    : "Status unknown"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Projects */}
        <Card className="mt-6">
          <SectionHeader>Related Projects (same focus areas)</SectionHeader>
          {relatedProjects.length > 0 ? (
            <div className="space-y-2">
              {relatedProjects.map((related, i) => (
                <LinkCard
                  key={i}
                  href={`/project/${slugify(related.name)}`}
                  title={related.name}
                  subtitle={related.org.name}
                  icon={<BeakerIcon className="w-4 h-4" />}
                  meta={related.status}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No related projects found" />
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            Last verified: December 2024 ·{" "}
            <EditButton
              entityType="project"
              entitySlug={slug}
              entityName={project.name}
              fields={editFields}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

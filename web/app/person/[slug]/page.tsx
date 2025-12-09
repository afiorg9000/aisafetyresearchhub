import { notFound } from "next/navigation";
import { getPersonBySlug, getAllPeople, getAllProjects, slugify } from "../../lib/data";
import {
  BackButton,
  PageHeader,
  Card,
  SectionHeader,
  LinkCard,
  BuildingIcon,
  BeakerIcon,
  EmptyState,
} from "../../components/ui";

export function generateStaticParams() {
  return getAllPeople().map((person) => ({ slug: slugify(person.name) }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const person = getPersonBySlug(slug);
    return {
      title: person ? `${person.name} — AI Safety Research Hub` : "Person Not Found",
      description: person ? `${person.role} at ${person.org.name}` : "AI Safety researcher details",
    };
  });
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    notFound();
  }

  // Find projects this person might be on (from same org)
  const orgProjects = getAllProjects().filter(
    (p) => slugify(p.org.name) === slugify(person.org.name)
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BackButton href="/people" label="All people" />

        <PageHeader
          title={person.name}
          subtitle={person.role}
          tags={person.org.focus_areas}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Organization */}
          <Card>
            <SectionHeader>Current Organization</SectionHeader>
            <LinkCard
              href={`/org/${slugify(person.org.name)}`}
              title={person.org.name}
              subtitle={person.org.type}
              icon={<BuildingIcon className="w-4 h-4" />}
            />
          </Card>

          {/* Focus Areas */}
          <Card>
            <SectionHeader>Focus Areas</SectionHeader>
            {person.org.focus_areas && person.org.focus_areas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {person.org.focus_areas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 text-sm bg-[var(--border)]/50 rounded-lg text-[var(--foreground)]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState message="No focus areas listed" />
            )}
          </Card>
        </div>

        {/* Projects at org */}
        <Card className="mt-6">
          <SectionHeader>Projects at {person.org.name}</SectionHeader>
          {orgProjects.length > 0 ? (
            <div className="space-y-2">
              {orgProjects.map((project, i) => (
                <LinkCard
                  key={i}
                  href={`/project/${slugify(project.name)}`}
                  title={project.name}
                  subtitle={project.description}
                  icon={<BeakerIcon className="w-4 h-4" />}
                  meta={project.status}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No projects listed" />
          )}
        </Card>

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


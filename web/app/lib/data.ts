import rawData from "../data.json";

export type Person = {
  name: string;
  role: string;
};

export type Project = {
  name: string;
  description?: string;
  status?: string;
  paper_url?: string;
};

export type Benchmark = {
  name: string;
  measures?: string;
  paper_url?: string;
  status?: string;
};

export type Org = {
  name: string;
  url: string;
  type: string;
  country: string;
  mission?: string;
  focus_areas?: string[];
  key_people?: Person[];
  projects?: Project[];
  benchmarks?: Benchmark[];
  notes?: string;
  employees?: number;
  directors?: number;
  managers?: number;
  subteams?: number;
};

export const orgs: Org[] = rawData as Org[];

// Generate URL-safe slugs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Get org by slug
export function getOrgBySlug(slug: string): Org | undefined {
  return orgs.find((org) => slugify(org.name) === slug);
}

// Get all people across all orgs
export function getAllPeople(): (Person & { org: Org })[] {
  const people: (Person & { org: Org })[] = [];
  for (const org of orgs) {
    if (org.key_people) {
      for (const person of org.key_people) {
        people.push({ ...person, org });
      }
    }
  }
  return people;
}

// Get person by slug
export function getPersonBySlug(slug: string): (Person & { org: Org }) | undefined {
  const allPeople = getAllPeople();
  return allPeople.find((p) => slugify(p.name) === slug);
}

// Get all projects across all orgs
export function getAllProjects(): (Project & { org: Org })[] {
  const projects: (Project & { org: Org })[] = [];
  for (const org of orgs) {
    if (org.projects) {
      for (const project of org.projects) {
        projects.push({ ...project, org });
      }
    }
  }
  return projects;
}

// Get project by slug
export function getProjectBySlug(slug: string): (Project & { org: Org }) | undefined {
  const allProjects = getAllProjects();
  return allProjects.find((p) => slugify(p.name) === slug);
}

// Get all benchmarks across all orgs
export function getAllBenchmarks(): (Benchmark & { org: Org })[] {
  const benchmarks: (Benchmark & { org: Org })[] = [];
  for (const org of orgs) {
    if (org.benchmarks) {
      for (const benchmark of org.benchmarks) {
        benchmarks.push({ ...benchmark, org });
      }
    }
  }
  return benchmarks;
}

// Get benchmark by slug
export function getBenchmarkBySlug(slug: string): (Benchmark & { org: Org }) | undefined {
  const allBenchmarks = getAllBenchmarks();
  return allBenchmarks.find((b) => slugify(b.name) === slug);
}

// Get related projects (same focus area)
export function getRelatedProjects(project: Project & { org: Org }, limit = 5): (Project & { org: Org })[] {
  const focusAreas = project.org.focus_areas || [];
  const allProjects = getAllProjects();
  
  return allProjects
    .filter((p) => {
      if (slugify(p.name) === slugify(project.name)) return false;
      const pFocusAreas = p.org.focus_areas || [];
      return focusAreas.some((area) => pFocusAreas.includes(area));
    })
    .slice(0, limit);
}

// Focus area colors
export const FOCUS_COLORS: Record<string, string> = {
  Evals: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Interpretability: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Alignment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Governance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Policy: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Biosecurity: "bg-red-500/10 text-red-400 border-red-500/20",
  Cyber: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Control: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Monitoring: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Benchmarks: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

// Stats
export function getStats() {
  const totalProjects = orgs.reduce((acc, org) => acc + (org.projects?.length || 0), 0);
  const totalBenchmarks = orgs.reduce((acc, org) => acc + (org.benchmarks?.length || 0), 0);
  const totalPeople = getAllPeople().length;
  const totalEmployees = orgs.reduce((acc, org) => acc + (org.employees || 0), 0);
  const totalPublications = orgs.reduce((acc, org) => {
    return acc + (org.projects?.filter(p => p.status === "published" || p.paper_url)?.length || 0);
  }, 0);
  return { 
    orgs: orgs.length, 
    projects: totalProjects, 
    benchmarks: totalBenchmarks, 
    people: totalPeople, 
    employees: totalEmployees,
    publications: totalPublications 
  };
}


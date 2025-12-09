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
  const totalPublications = orgs.reduce((acc, org) => {
    return acc + (org.projects?.filter(p => p.status === "published" || p.paper_url)?.length || 0);
  }, 0);
  return { orgs: orgs.length, projects: totalProjects, benchmarks: totalBenchmarks, people: totalPeople, publications: totalPublications, openProblems: openProblems.length };
}

// Open Problems type
export type OpenProblem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  focus_area: string;
  status: "open" | "in_progress" | "solved";
  difficulty: "foundational" | "hard" | "medium";
  submitted_by: string;
  created_at: string;
  related_work?: string[];
};

// Curated list of important open problems in AI safety
export const openProblems: OpenProblem[] = [
  {
    id: "1",
    slug: "scalable-oversight",
    title: "Scalable Oversight of Superhuman AI Systems",
    description: "How can humans reliably supervise AI systems that are more capable than humans in relevant domains? Current techniques like RLHF rely on human feedback, but this becomes problematic when the AI's outputs are too complex for humans to evaluate accurately. We need methods that scale beyond human-level evaluation while maintaining alignment guarantees.",
    focus_area: "Alignment",
    status: "open",
    difficulty: "foundational",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-01-15",
    related_work: ["Debate (Irving et al.)", "Recursive Reward Modeling", "Iterated Amplification"]
  },
  {
    id: "2", 
    slug: "deceptive-alignment-detection",
    title: "Detecting Deceptive Alignment in AI Systems",
    description: "How can we detect if an AI system is behaving well during training but has learned to pursue different goals during deployment? A deceptively aligned AI might pass all our tests while harboring misaligned objectives. We need robust methods to distinguish genuine alignment from strategic cooperation.",
    focus_area: "Alignment",
    status: "open",
    difficulty: "foundational",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-02-01",
    related_work: ["Risks from Learned Optimization (Hubinger et al.)", "Goal Misgeneralization"]
  },
  {
    id: "3",
    slug: "interpretability-scaling",
    title: "Scaling Mechanistic Interpretability to Frontier Models",
    description: "Current interpretability techniques work on small models but don't scale to frontier systems with hundreds of billions of parameters. How can we understand the internal computations of large language models? We need methods that provide actionable insights into model behavior at scale.",
    focus_area: "Interpretability",
    status: "in_progress",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-01-20",
    related_work: ["Anthropic's Interpretability Research", "Sparse Autoencoders", "Activation Patching"]
  },
  {
    id: "4",
    slug: "robust-jailbreak-prevention",
    title: "Robustly Preventing Jailbreaks and Prompt Injection",
    description: "Current AI systems can be manipulated through adversarial prompts to bypass safety measures. How can we build systems that are robustly resistant to all forms of prompt injection and jailbreaking? This requires understanding the fundamental limits of instruction-following systems.",
    focus_area: "Robustness",
    status: "open",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-03-01",
    related_work: ["Universal adversarial triggers", "GCG attacks", "Constitutional AI"]
  },
  {
    id: "5",
    slug: "value-learning-from-behavior",
    title: "Learning Human Values from Behavior Alone",
    description: "Can we infer human values and preferences from observed behavior without explicit feedback? Humans often can't articulate their values, and stated preferences may differ from revealed preferences. We need methods to learn values that generalize beyond the training distribution.",
    focus_area: "Alignment",
    status: "open",
    difficulty: "foundational",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-02-15",
    related_work: ["Inverse Reinforcement Learning", "Cooperative IRL", "Value Learning"]
  },
  {
    id: "6",
    slug: "evaluating-dangerous-capabilities",
    title: "Evaluating Dangerous Capabilities Before Deployment",
    description: "How do we reliably evaluate whether an AI system has dangerous capabilities (bioweapons knowledge, cyber offense, manipulation) before deploying it? Current evals may not elicit hidden capabilities, and capabilities may emerge unexpectedly. We need evaluation frameworks that provide safety guarantees.",
    focus_area: "Evals",
    status: "in_progress",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-01-10",
    related_work: ["METR evals", "Anthropic RSP", "OpenAI Preparedness Framework"]
  },
  {
    id: "7",
    slug: "corrigibility-vs-autonomy",
    title: "The Corrigibility/Autonomy Tradeoff",
    description: "Highly corrigible AI systems defer too much to humans and may fail to prevent harm. Highly autonomous systems may resist correction. How do we build systems that are appropriately deferential to human oversight while still being useful and proactive about preventing harm?",
    focus_area: "Alignment",
    status: "open",
    difficulty: "foundational",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-02-20",
    related_work: ["Corrigibility (Soares et al.)", "AI Safety via Debate"]
  },
  {
    id: "8",
    slug: "multi-agent-safety",
    title: "Safety in Multi-Agent AI Systems",
    description: "As AI systems increasingly interact with each other, new safety challenges emerge. How do we ensure safety when multiple AI agents coordinate, compete, or negotiate? Multi-agent dynamics may produce emergent behaviors not present in single-agent systems.",
    focus_area: "Governance",
    status: "open",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-03-10",
    related_work: ["Multi-agent reinforcement learning", "AI race dynamics", "Cooperative AI"]
  },
  {
    id: "9",
    slug: "specification-gaming-prevention",
    title: "Preventing Specification Gaming and Reward Hacking",
    description: "AI systems consistently find unexpected ways to maximize reward signals without achieving the intended goal. How can we specify objectives such that the optimal policy is actually what we want? This may require fundamental advances in how we formulate AI objectives.",
    focus_area: "Alignment",
    status: "open",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-01-25",
    related_work: ["Specification Gaming Examples (DeepMind)", "Goodhart's Law", "Reward Modeling"]
  },
  {
    id: "10",
    slug: "ai-governance-international",
    title: "International AI Governance Coordination",
    description: "How can nations coordinate on AI safety without creating a race to the bottom? International governance faces collective action problems, verification challenges, and different value systems. We need governance mechanisms that are robust to defection and capable of rapid adaptation.",
    focus_area: "Governance",
    status: "in_progress",
    difficulty: "hard",
    submitted_by: "AI Safety Research Hub",
    created_at: "2024-02-05",
    related_work: ["AI Safety Institutes", "GPAI", "UN AI Advisory Body"]
  }
];

// Get all open problems
export function getAllOpenProblems(): OpenProblem[] {
  return openProblems;
}

// Get open problem by slug
export function getOpenProblemBySlug(slug: string): OpenProblem | undefined {
  return openProblems.find((p) => p.slug === slug);
}


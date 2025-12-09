import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { orgs } from "../../lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build a compact index of all entities
function buildIndex() {
  const publications: { title: string; org: string; description?: string; citations?: number; slug: string }[] = [];
  const projects: { title: string; org: string; description?: string; status?: string; slug: string }[] = [];
  const benchmarks: { title: string; org: string; measures?: string; slug: string }[] = [];
  const organizations: { name: string; type: string; mission?: string; focus_areas?: string[]; slug: string }[] = [];

  for (const org of orgs) {
    const orgSlug = org.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    organizations.push({
      name: org.name,
      type: org.type,
      mission: org.mission,
      focus_areas: org.focus_areas,
      slug: orgSlug,
    });

    for (const p of org.projects || []) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const isPublication = p.status?.toLowerCase() === "published" || p.paper_url;
      
      if (isPublication) {
        publications.push({
          title: p.name,
          org: org.name,
          description: p.description,
          citations: (p as any).citations,
          slug,
        });
      } else {
        projects.push({
          title: p.name,
          org: org.name,
          description: p.description,
          status: p.status,
          slug,
        });
      }
    }

    for (const b of org.benchmarks || []) {
      const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      benchmarks.push({
        title: b.name,
        org: org.name,
        measures: b.measures,
        slug,
      });
    }
  }

  return { publications, projects, benchmarks, organizations };
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [], summary: "" });
    }

    const index = buildIndex();

    // Create a compact representation for the LLM
    const dataContext = `
PUBLICATIONS (${index.publications.length} total):
${index.publications.slice(0, 100).map(p => `- "${p.title}" by ${p.org}${p.citations ? ` (${p.citations} citations)` : ""}`).join("\n")}

ACTIVE PROJECTS (${index.projects.length} total):
${index.projects.slice(0, 50).map(p => `- "${p.title}" by ${p.org} [${p.status || "unknown"}]`).join("\n")}

BENCHMARKS (${index.benchmarks.length} total):
${index.benchmarks.map(b => `- "${b.title}" by ${b.org}: ${b.measures || ""}`).join("\n")}

ORGANIZATIONS (${index.organizations.length} total):
${index.organizations.map(o => `- ${o.name} (${o.type}): ${o.focus_areas?.join(", ") || ""}`).join("\n")}
`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are an AI safety research assistant. A user searched for: "${query}"

Based on this database of AI safety research:

${dataContext}

Return a JSON response with:
1. "summary": A 1-2 sentence explanation of what exists on this topic
2. "results": An array of the most relevant items (max 15), each with:
   - "type": "publication" | "project" | "benchmark" | "organization"
   - "title": The item's name
   - "org": The organization (for non-org items)
   - "match_reason": WHY this is relevant to the query (1 sentence, be specific)
   - "relevance": "high" | "medium" | "low"
   - "slug": URL-safe version of the title

3. "related_topics": Array of 3-5 related research areas they might want to explore
4. "open_questions": 1-2 open research questions related to this topic
5. "no_results": true if nothing relevant found

Be specific about WHY each result matches. Don't just say "relates to X" - explain the connection.

Return ONLY valid JSON, no other text.`
        }
      ]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Parse the JSON response
    let parsed;
    try {
      // Clean up potential markdown
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.split("```")[1];
        if (cleanText.startsWith("json")) {
          cleanText = cleanText.slice(4);
        }
      }
      parsed = JSON.parse(cleanText.trim());
    } catch {
      parsed = { summary: "Search completed.", results: [], related_topics: [] };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ 
      error: "Search failed", 
      results: [],
      summary: "An error occurred. Please try again."
    }, { status: 500 });
  }
}


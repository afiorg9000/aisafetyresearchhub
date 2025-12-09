import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { orgs } from "../../lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build a compact index of all research
function buildResearchIndex() {
  const items: { title: string; org: string; description?: string; type: string }[] = [];

  for (const org of orgs) {
    for (const p of org.projects || []) {
      items.push({
        title: p.name,
        org: org.name,
        description: p.description,
        type: p.status?.toLowerCase() === "published" ? "publication" : "project",
      });
    }
  }

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || idea.trim().length < 20) {
      return NextResponse.json({ 
        has_overlap: false,
        overlap_summary: "Please provide a more detailed description of your idea.",
        matches: [],
        gaps: [],
        recommendation: "Add more detail about your research approach."
      });
    }

    const index = buildResearchIndex();

    // Create compact context
    const researchContext = index.slice(0, 200).map(
      (item) => `- "${item.title}" (${item.org}): ${item.description?.slice(0, 100) || "No description"}`
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are an AI safety research advisor. A researcher has this idea:

"${idea}"

Compare against this database of existing AI safety research:

${researchContext}

Return a JSON response with:
1. "has_overlap": true if significant similar work exists, false if novel
2. "overlap_summary": 1-2 sentences explaining the overlap situation
3. "matches": Array of up to 5 most relevant existing works, each with:
   - "type": "publication" | "project"
   - "title": exact title from the database
   - "org": organization name
   - "overlap": specific explanation of how this relates to the idea
   - "relevance": "high" (same approach), "medium" (related topic), "low" (tangentially related)
   - "slug": URL-safe version of title
4. "gaps": Array of 2-3 specific ways this idea differs from or extends existing work
5. "recommendation": What should they do? (read existing work, collaborate, pursue the gap, etc.)
6. "potential_collaborators": Array of org names working on related topics

Be specific and helpful. If the idea is novel, be encouraging. If overlap exists, be constructive about how to differentiate.

Return ONLY valid JSON, no other text.`
        }
      ]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
    let parsed;
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.split("```")[1];
        if (cleanText.startsWith("json")) {
          cleanText = cleanText.slice(4);
        }
      }
      parsed = JSON.parse(cleanText.trim());
    } catch {
      parsed = {
        has_overlap: false,
        overlap_summary: "Analysis complete.",
        matches: [],
        gaps: ["Unable to parse detailed results"],
        recommendation: "Try refining your idea description for better matching."
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ 
      has_overlap: false,
      overlap_summary: "Error analyzing idea.",
      matches: [],
      gaps: [],
      recommendation: "Please try again."
    }, { status: 500 });
  }
}


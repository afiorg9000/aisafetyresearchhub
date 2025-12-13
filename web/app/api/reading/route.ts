import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { orgs } from "../../lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build publications list
function getPublications() {
  const pubs: { title: string; org: string; citations?: number }[] = [];
  
  for (const org of orgs) {
    for (const p of org.projects || []) {
      if (p.status?.toLowerCase() === "published" || p.paper_url) {
        pubs.push({
          title: p.name,
          org: org.name,
          citations: (p as any).citation_count,
        });
      }
    }
  }
  
  // Sort by citations
  pubs.sort((a, b) => (b.citations || 0) - (a.citations || 0));
  return pubs.slice(0, 200);
}

export async function POST(request: NextRequest) {
  try {
    const { topic, background } = await request.json();

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({
        topic,
        overview: "Please provide a more specific topic.",
        path: { start_here: [], then_read: [], recent_developments: [], skip_these: [] },
        time_estimate: "N/A",
      });
    }

    const publications = getPublications();
    const pubList = publications.slice(0, 100).map(
      (p) => `- "${p.title}" (${p.org})${p.citations ? ` [${p.citations} citations]` : ""}`
    ).join("\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are an AI safety research advisor. Create a structured reading path for someone who wants to learn about: "${topic}"

Their background level: ${background}

Available papers in our database (highest cited first):
${pubList}

Return a JSON response with:
1. "topic": The topic name
2. "overview": 1-2 sentences about what they'll learn
3. "path": An object with:
   - "start_here": Array of 2-3 foundational papers to read first (from the database or well-known papers)
   - "then_read": Array of 3-5 intermediate papers to read next
   - "recent_developments": Array of 2-3 recent papers (2024-2025)
   - "optional_deep_dives": Array of 2-3 advanced papers for those wanting to go deeper
   - "skip_these": Array of 1-2 papers that are outdated or superseded

Each item should have:
- "title": Paper title (prefer exact matches from the database)
- "type": "foundational" | "intermediate" | "advanced" | "recent" | "skip"
- "reason": Why to read/skip this (1 sentence)

4. "time_estimate": How long this reading path takes (e.g., "2-3 weeks for a thorough understanding")

Be practical and helpful. Prioritize papers from our database when relevant.
Adjust recommendations based on their background level.

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
        topic,
        overview: "Reading path generated.",
        path: { start_here: [], then_read: [], recent_developments: [], skip_these: [] },
        time_estimate: "Varies",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Reading path error:", error);
    return NextResponse.json({
      topic: "Error",
      overview: "Failed to generate reading path. Please try again.",
      path: { start_here: [], then_read: [], recent_developments: [], skip_these: [] },
      time_estimate: "N/A",
    }, { status: 500 });
  }
}


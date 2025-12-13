import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { orgs, openProblems } from "../../lib/data";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build context about existing research
function buildContext() {
  const publications: string[] = [];
  const orgList: string[] = [];
  
  for (const org of orgs) {
    orgList.push(`${org.name} (${org.type}): ${org.focus_areas?.join(", ") || ""}`);
    
    for (const p of org.projects || []) {
      if (p.status?.toLowerCase() === "published" || p.paper_url) {
        publications.push(`"${p.name}" by ${org.name}`);
      }
    }
  }

  const problems = openProblems.map(p => `- ${p.title} (${p.focus_area})`).join("\n");

  return {
    publications: publications.slice(0, 100),
    orgs: orgList.slice(0, 50),
    problems,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || !description || title.length < 5 || description.length < 20) {
      return NextResponse.json({
        importance: { score: 0, reasoning: "Insufficient information" },
        neglectedness: { score: 0, reasoning: "Insufficient information" },
        tractability: { score: 0, reasoning: "Insufficient information" },
        overall: 0,
        verdict: "Low Priority",
        summary: "Please provide more detail about the problem.",
        recommendations: [],
        related_work: [],
        potential_collaborators: [],
      });
    }

    const context = buildContext();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are an AI safety research evaluator. Analyze this research problem using the ITN (Importance, Neglectedness, Tractability) framework.

PROBLEM TITLE: ${title}

PROBLEM DESCRIPTION: ${description}

CONTEXT - Existing AI Safety Research:
- ${context.publications.length}+ publications in the database
- ${context.orgs.length}+ organizations working on AI safety
- Existing open problems:
${context.problems}

Sample publications (for context):
${context.publications.slice(0, 30).join("\n")}

Evaluate this problem and return JSON with:

1. "importance": {
   "score": 1-10 (how critical is solving this for AI safety?),
   "reasoning": "1 sentence explanation"
}

2. "neglectedness": {
   "score": 1-10 (10 = very neglected, 1 = heavily researched),
   "reasoning": "1 sentence explanation"
}

3. "tractability": {
   "score": 1-10 (how feasible is making progress?),
   "reasoning": "1 sentence explanation"
}

4. "overall": weighted average (importance * 0.4 + neglectedness * 0.3 + tractability * 0.3)

5. "verdict": One of:
   - "Highly Promising" (overall >= 7.5)
   - "Worth Exploring" (overall >= 6)
   - "Moderate Priority" (overall >= 4)
   - "Low Priority" (overall < 4)

6. "summary": 2-3 sentences summarizing the assessment

7. "recommendations": Array of 3-4 specific next steps for the researcher

8. "related_work": Array of 2-3 relevant existing papers/projects from the database

9. "potential_collaborators": Array of 2-3 organizations that might be interested

Be rigorous but constructive. Consider the current state of AI safety research.

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
        importance: { score: 5, reasoning: "Unable to parse detailed analysis" },
        neglectedness: { score: 5, reasoning: "Unable to parse detailed analysis" },
        tractability: { score: 5, reasoning: "Unable to parse detailed analysis" },
        overall: 5,
        verdict: "Worth Exploring",
        summary: "Analysis completed but detailed parsing failed. Consider refining your problem description.",
        recommendations: ["Provide more specific details", "Search for related work"],
        related_work: [],
        potential_collaborators: [],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("ITN analysis error:", error);
    return NextResponse.json({
      importance: { score: 0, reasoning: "Error occurred" },
      neglectedness: { score: 0, reasoning: "Error occurred" },
      tractability: { score: 0, reasoning: "Error occurred" },
      overall: 0,
      verdict: "Low Priority",
      summary: "An error occurred during analysis. Please try again.",
      recommendations: [],
      related_work: [],
      potential_collaborators: [],
    }, { status: 500 });
  }
}


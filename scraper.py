import requests
from bs4 import BeautifulSoup
import anthropic
import json
import os
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

ORGS = [
    # Government AISIs
    {"name": "US AI Safety Institute", "url": "https://www.nist.gov/aisi", "type": "Government AISI", "country": "United States"},
    {"name": "UK AI Safety Institute", "url": "https://www.aisi.gov.uk", "type": "Government AISI", "country": "United Kingdom"},
    {"name": "EU AI Office", "url": "https://digital-strategy.ec.europa.eu/en/policies/ai-office", "type": "Government AISI", "country": "European Union"},
    # Note: Japan AISI added manually - no reliable URL
    
    # Lab Safety Teams
    {"name": "Anthropic", "url": "https://www.anthropic.com/research", "type": "Lab Safety Team", "country": "United States"},
    {"name": "OpenAI Safety", "url": "https://openai.com/safety", "type": "Lab Safety Team", "country": "United States"},
    {"name": "Google DeepMind Safety", "url": "https://deepmind.google/about/responsibility-safety/", "type": "Lab Safety Team", "country": "United Kingdom"},
    
    # Nonprofits
    {"name": "MIRI", "url": "https://intelligence.org/research/", "type": "Nonprofit", "country": "United States"},
    {"name": "Redwood Research", "url": "https://www.redwoodresearch.org", "type": "Nonprofit", "country": "United States"},
    {"name": "ARC (Alignment Research Center)", "url": "https://www.alignment.org", "type": "Nonprofit", "country": "United States"},
    # Note: ARC Evals merged into METR
    {"name": "Apollo Research", "url": "https://www.apolloresearch.ai", "type": "Nonprofit", "country": "United Kingdom"},
    {"name": "METR", "url": "https://metr.org", "type": "Nonprofit", "country": "United States"},
    {"name": "Center for AI Safety", "url": "https://www.safe.ai", "type": "Nonprofit", "country": "United States"},
    
    # Academic / Think Tanks
    {"name": "CSET Georgetown", "url": "https://cset.georgetown.edu", "type": "Think Tank", "country": "United States"},
    {"name": "GovAI Oxford", "url": "https://www.governance.ai", "type": "Think Tank", "country": "United Kingdom"},
    {"name": "CHAI Berkeley", "url": "https://humancompatible.ai", "type": "Academic", "country": "United States"},
    {"name": "Center on Long-Term Risk", "url": "https://longtermrisk.org", "type": "Nonprofit", "country": "United Kingdom"},
]

EXTRACTION_PROMPT = """
Extract structured data from this webpage content about an AI safety organization.

Return JSON with these fields:
{
  "mission": "1-2 sentence summary of what they do",
  "focus_areas": ["list from: Evals, Interpretability, Alignment, Governance, Policy, Biosecurity, Cyber, Control, Monitoring, Benchmarks"],
  "key_people": [{"name": "...", "role": "..."}],
  "projects": [{"name": "...", "description": "...", "status": "Active/Completed/Unknown"}],
  "benchmarks": [{"name": "...", "measures": "what it tests", "paper_url": "if found"}],
  "notes": "anything else notable"
}

Only include fields where you found actual information. Be concise.

WEBPAGE CONTENT:
"""


def scrape_url(url):
    """Fetch and parse webpage content."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script/style elements
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        
        text = soup.get_text(separator=" ", strip=True)
        # Truncate to ~8k chars to fit in context
        return text[:8000]
    
    except Exception as e:
        print(f"  ✗ Error scraping {url}: {e}")
        return None


def extract_with_llm(org_name, content):
    """Use Claude to extract structured data."""
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": f"{EXTRACTION_PROMPT}\n\n{content}"}
            ],
            system="You extract structured data about AI safety organizations. Return valid JSON only, no markdown formatting.",
        )
        # Parse the response text as JSON
        response_text = response.content[0].text
        # Strip any markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        return json.loads(response_text.strip())
    
    except Exception as e:
        print(f"  ✗ Error extracting data for {org_name}: {e}")
        return None


def main():
    results = []
    
    for org in ORGS:
        print(f"Scraping {org['name']}...")
        
        content = scrape_url(org["url"])
        if not content:
            continue
        
        extracted = extract_with_llm(org["name"], content)
        if not extracted:
            continue
        
        # Merge with base org info
        result = {**org, **extracted}
        results.append(result)
        
        projects_count = len(extracted.get('projects', []))
        people_count = len(extracted.get('key_people', []))
        print(f"  ✓ Found {projects_count} projects, {people_count} people")
    
    # Save output
    with open("ai_safety_orgs.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Done! Saved {len(results)} orgs to ai_safety_orgs.json")


if __name__ == "__main__":
    main()

